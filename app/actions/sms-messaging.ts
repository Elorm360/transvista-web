"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  isSmsConfigured,
  normalizeSmsPhone,
  sendTransactionalSms,
} from "@/lib/sms/twilio";

export type SmsActionState = {
  success: boolean;
  message: string;
  completedAt?: string;
};

const messageTypes = [
  "booking-update",
  "payment-reminder",
  "trip-reminder",
  "pickup-update",
  "custom-operational",
] as const;

function textValue(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

export async function sendRequestSms(
  _previousState: SmsActionState,
  formData: FormData,
): Promise<SmsActionState> {
  const bodyTemplate = textValue(formData, "message", 320);
  const messageType = textValue(formData, "messageType", 40);
  const recipientKeys = Array.from(
    new Set(
      formData
        .getAll("recipient")
        .map(String)
        .filter((value) => /^(custom|package):\d+$/.test(value)),
    ),
  ).slice(0, 20);

  if (formData.get("operationalConfirm") !== "on") {
    return {
      success: false,
      message: "Confirm that this is an operational message about the selected requests.",
    };
  }
  if (!(messageTypes as readonly string[]).includes(messageType)) {
    return { success: false, message: "Choose a valid message type." };
  }
  if (!bodyTemplate || bodyTemplate.length > 320) {
    return {
      success: false,
      message: "Enter an SMS message containing no more than 320 characters.",
    };
  }
  if (!recipientKeys.length) {
    return { success: false, message: "Select at least one traveller." };
  }
  if (!isSmsConfigured()) {
    return {
      success: false,
      message: "SMS is ready in the dashboard but Twilio credentials have not been configured yet.",
    };
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
    .select("id, role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    memberError ||
    !member ||
    member.status !== "active" ||
    !["owner", "admin", "support"].includes(member.role)
  ) {
    return {
      success: false,
      message: "You do not have permission to send traveller messages.",
    };
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const usedPhones = new Set<string>();

  for (const key of recipientKeys) {
    const [kind, rawId] = key.split(":");
    const requestId = Number(rawId);
    const table = kind === "custom" ? "trip_requests" : "package_reservations";

    const { data: request, error: requestError } = await supabase
      .from(table)
      .select("id, reference, full_name, phone")
      .eq("id", requestId)
      .maybeSingle();

    const phone = request ? normalizeSmsPhone(request.phone ?? "") : null;
    if (requestError || !request || !phone || usedPhones.has(phone)) {
      skipped += 1;
      continue;
    }
    usedPhones.add(phone);

    const body = bodyTemplate
      .replaceAll("{name}", request.full_name)
      .replaceAll("{reference}", request.reference)
      .slice(0, 320);

    try {
      const delivery = await sendTransactionalSms({ to: phone, body });
      const { error: auditError } = await supabase.from("sms_messages").insert({
        request_kind: kind,
        request_id: requestId,
        reference: request.reference,
        recipient_phone: phone,
        message_type: messageType,
        body,
        provider: "twilio",
        provider_message_id: delivery.providerMessageId,
        status: delivery.status,
        sent_by: member.id,
        sent_at: new Date().toISOString(),
      });
      if (auditError) {
        console.error("[sendRequestSms] SMS sent but audit insert failed", auditError);
      }
      sent += 1;
    } catch (error) {
      console.error("[sendRequestSms] Delivery failed", {
        request: request.reference,
        error,
      });
      const { error: auditError } = await supabase.from("sms_messages").insert({
        request_kind: kind,
        request_id: requestId,
        reference: request.reference,
        recipient_phone: phone,
        message_type: messageType,
        body,
        provider: "twilio",
        status: "failed",
        failure_reason:
          error instanceof Error ? error.message.slice(0, 300) : "SMS_SEND_FAILED",
        sent_by: member.id,
      });
      if (auditError) {
        console.error("[sendRequestSms] Failed audit insert failed", auditError);
      }
      failed += 1;
    }
  }

  revalidatePath("/admin/messages");
  const details = [
    `${sent} sent`,
    failed ? `${failed} failed` : "",
    skipped ? `${skipped} skipped because the number was invalid or duplicated` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    success: sent > 0 && failed === 0,
    message: `SMS operation completed: ${details}.`,
    completedAt: new Date().toISOString(),
  };
}
