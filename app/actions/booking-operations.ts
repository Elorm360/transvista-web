"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendBookingUpdateEmail } from "@/lib/email/sendBookingUpdateEmail";

export type BookingOperationState = {
  success: boolean;
  message: string;
  completedAt?: string;
};

const customStatuses = [
  "new",
  "reviewing",
  "contacted",
  "quoted",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled",
  "closed",
] as const;

const packageStatuses = [
  "pending-review",
  "confirmed-awaiting-deposit",
  "deposit-paid",
  "paid",
  "in-progress",
  "completed",
  "waitlisted",
  "cancelled",
] as const;

const paymentStatuses = [
  "not-requested",
  "deposit-requested",
  "deposit-paid",
  "paid",
  "refunded",
  "partially-refunded",
] as const;

const paymentMethods = [
  "mobile-money",
  "card",
  "bank-transfer",
  "cash",
] as const;

const priorities = ["low", "normal", "high", "urgent"] as const;
const currencies = ["GHS", "USD", "GBP", "EUR"] as const;

function textValue(formData: FormData, key: string, max = 200) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function optionalAmount(formData: FormData, key: string) {
  const raw = textValue(formData, key, 30);
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 100_000_000) {
    throw new Error("Enter valid non-negative payment amounts.");
  }
  return Math.round(value * 100) / 100;
}

function label(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (character) =>
    character.toUpperCase(),
  );
}

export async function updateBookingOperation(
  _previousState: BookingOperationState,
  formData: FormData,
): Promise<BookingOperationState> {
  try {
    const kind = textValue(formData, "requestKind", 20);
    const requestId = Number(textValue(formData, "requestId", 20));
    const status = textValue(formData, "status", 60);
    const assignedTo = textValue(formData, "assignedTo", 60) || null;
    const priority = textValue(formData, "priority", 20);
    const followUpInput = textValue(formData, "followUpAt", 40);
    const quoteCurrency = textValue(formData, "quoteCurrency", 10) || null;
    const paymentStatus = textValue(formData, "paymentStatus", 40);
    const paymentMethod = textValue(formData, "paymentMethod", 40) || null;
    const note = textValue(formData, "note", 1500);
    const notifyTraveller = formData.get("notifyTraveller") === "on";

    if (!Number.isInteger(requestId) || requestId < 1) {
      return { success: false, message: "This request could not be identified." };
    }
    if (kind !== "custom" && kind !== "package") {
      return { success: false, message: "This request type is not supported." };
    }

    const allowedStatuses = kind === "custom" ? customStatuses : packageStatuses;
    if (!(allowedStatuses as readonly string[]).includes(status)) {
      return { success: false, message: "Choose a valid booking status." };
    }
    if (!(priorities as readonly string[]).includes(priority)) {
      return { success: false, message: "Choose a valid priority." };
    }
    if (!(paymentStatuses as readonly string[]).includes(paymentStatus)) {
      return { success: false, message: "Choose a valid payment status." };
    }
    if (
      paymentMethod &&
      !(paymentMethods as readonly string[]).includes(paymentMethod)
    ) {
      return { success: false, message: "Choose a valid payment method." };
    }
    if (
      quoteCurrency &&
      !(currencies as readonly string[]).includes(quoteCurrency)
    ) {
      return { success: false, message: "Choose a valid quote currency." };
    }

    let followUpAt: string | null = null;
    if (followUpInput) {
      const parsedFollowUp = new Date(followUpInput);
      if (Number.isNaN(parsedFollowUp.getTime())) {
        return { success: false, message: "Choose a valid follow-up date." };
      }
      followUpAt = parsedFollowUp.toISOString();
    }

    const quotedAmount = optionalAmount(formData, "quotedAmount");
    const depositAmount = optionalAmount(formData, "depositAmount");
    const amountPaid = optionalAmount(formData, "amountPaid") ?? 0;
    if ((quotedAmount !== null || depositAmount !== null) && !quoteCurrency) {
      return { success: false, message: "Choose the currency for this quote." };
    }
    if (
      quotedAmount !== null &&
      depositAmount !== null &&
      depositAmount > quotedAmount
    ) {
      return { success: false, message: "The deposit cannot exceed the quoted amount." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "Your session has expired. Please sign in again." };
    }

    const { data: member, error: memberError } = await supabase
      .from("admin_team_members")
      .select("id, full_name, role, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      memberError ||
      !member ||
      member.status !== "active" ||
      !["owner", "admin", "support"].includes(member.role)
    ) {
      return { success: false, message: "You do not have permission to manage requests." };
    }

    let assigneeName = "Unassigned";
    if (assignedTo) {
      const { data: operators, error: operatorError } = await supabase.rpc(
        "list_request_operators",
      );
      if (operatorError) {
        console.error("[updateBookingOperation] Operator lookup failed:", operatorError);
        return { success: false, message: "The assignee could not be verified." };
      }
      const assignee = (operators ?? []).find(
        (operator: { id: string; full_name: string }) =>
          operator.id === assignedTo,
      );
      if (!assignee) {
        return { success: false, message: "Choose an active booking operator." };
      }
      assigneeName = assignee.full_name;
    }

    const table = kind === "custom" ? "trip_requests" : "package_reservations";
    const { data: current, error: lookupError } = await supabase
      .from(table)
      .select("id, reference, full_name, email, status, assigned_to, payment_status, amount_paid, follow_up_at")
      .eq("id", requestId)
      .maybeSingle();

    if (lookupError || !current) {
      console.error("[updateBookingOperation] Request lookup failed:", lookupError);
      return { success: false, message: "This request could not be loaded." };
    }

    const paymentIsVerified = [
      "deposit-paid",
      "paid",
      "refunded",
      "partially-refunded",
    ].includes(paymentStatus);
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from(table)
      .update({
        status,
        assigned_to: assignedTo,
        priority,
        follow_up_at: followUpAt,
        quoted_amount: quotedAmount,
        quote_currency: quoteCurrency,
        deposit_amount: depositAmount,
        amount_paid: amountPaid,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        payment_verified_at: paymentIsVerified ? now : null,
        payment_verified_by: paymentIsVerified ? member.id : null,
        updated_by: member.id,
        updated_at: now,
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("[updateBookingOperation] Request update failed:", updateError);
      return { success: false, message: "The booking changes could not be saved." };
    }

    const changes: string[] = [];
    if (current.status !== status) {
      changes.push(`Status: ${label(current.status)} → ${label(status)}`);
    }
    if (current.assigned_to !== assignedTo) {
      changes.push(`Assigned to ${assigneeName}`);
    }
    if (current.payment_status !== paymentStatus || Number(current.amount_paid) !== amountPaid) {
      changes.push(`Payment: ${label(paymentStatus)} · ${quoteCurrency ?? "GHS"} ${amountPaid.toFixed(2)} received`);
    }
    if (current.follow_up_at !== followUpAt) {
      changes.push(
        followUpAt
          ? `Follow-up set for ${new Date(followUpAt).toLocaleString("en-GB", { timeZone: "Africa/Accra" })}`
          : "Follow-up cleared",
      );
    }
    if (note) changes.push(note);
    if (!changes.length) changes.push("Booking details reviewed and saved.");

    const activityType = note
      ? "note"
      : current.status !== status
        ? "status"
        : current.payment_status !== paymentStatus
          ? "payment"
          : current.assigned_to !== assignedTo
            ? "assignment"
            : current.follow_up_at !== followUpAt
              ? "follow-up"
              : "update";

    const { error: activityError } = await supabase
      .from("request_activity")
      .insert({
        request_kind: kind,
        request_id: requestId,
        reference: current.reference,
        activity_type: activityType,
        summary: changes.join("\n"),
        from_status: current.status,
        to_status: status,
        author_member_id: member.id,
      });

    if (activityError) {
      console.error("[updateBookingOperation] Activity insert failed:", activityError);
      return {
        success: true,
        message: "Booking saved, but the activity note could not be recorded.",
        completedAt: now,
      };
    }

    let emailWarning = "";
    if (notifyTraveller) {
      try {
        const sent = await sendBookingUpdateEmail({
          fullName: current.full_name,
          email: current.email,
          reference: current.reference,
          status: label(status),
          paymentStatus: label(paymentStatus),
          amountPaid,
          currency: quoteCurrency ?? "GHS",
          note: note || undefined,
        });
        if (!sent) emailWarning = " The traveller email could not be delivered.";
      } catch (emailError) {
        console.error("[updateBookingOperation] Traveller email failed:", emailError);
        emailWarning = " The traveller email could not be delivered.";
      }
    }

    revalidatePath("/admin/requests");
    return {
      success: true,
      message: `Booking operations updated.${emailWarning}`,
      completedAt: now,
    };
  } catch (error) {
    console.error("[updateBookingOperation] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "The booking could not be updated.",
    };
  }
}
