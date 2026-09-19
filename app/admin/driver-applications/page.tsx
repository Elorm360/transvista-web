import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CarFront } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function reviewDriver(formData: FormData) {
  "use server";
  const { user } = await requireAdminArea("requests");
  const id = String(formData.get("applicationId") ?? "");
  const status = String(formData.get("decision") ?? "");
  const note = String(formData.get("reviewNote") ?? "").trim();
  const verified = formData.get("verified") === "on";
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["approved", "rejected"].includes(status) ||
      (status === "approved" && !verified) || (status === "rejected" && note.length < 10) || note.length > 1000) {
    redirect("/admin/driver-applications?result=invalid");
  }

  const db = await createClient();
  const { data: member, error: memberError } = await db.from("admin_team_members")
    .select("id").eq("user_id", user.id).eq("status", "active")
    .in("role", ["owner", "admin", "support"]).single();
  if (memberError || !member) redirect("/unauthorized");

  const { data, error } = await db.from("driver_applications").update({
    status,
    review_note: note || null,
    reviewed_by: member.id,
    reviewed_at: new Date().toISOString(),
  }).eq("id", id).eq("status", "pending").select("id").maybeSingle();
  if (error || !data) {
    console.error("[driver review]", error);
    redirect("/admin/driver-applications?result=failed");
  }
  revalidatePath("/admin/driver-applications");
  redirect("/admin/driver-applications?result=saved");
}

export default async function DriverApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  await requireAdminArea("requests");
  const db = await createClient();
  const { data, error } = await db.from("driver_applications")
    .select("id,full_name,phone,operating_area,service_type,vehicle_type,vehicle_plate,seat_count,status,created_at")
    .order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error("Could not load driver applications.");
  const { result } = await searchParams;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader icon={CarFront} title="Driver applications"
        description="Review each applicant and verify their licence, insurance and vehicle before approving." />
      {result === "saved" && <p role="status" className="rounded-lg bg-green-50 p-3 text-green-800">Review saved.</p>}
      {result === "invalid" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">Verify documents to approve, or write a reason of at least 10 characters to decline.</p>}
      {result === "failed" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">Review could not be saved. Refresh and try again.</p>}
      {!data?.length && <p className="rounded-xl border bg-white p-6 text-slate-600">No applications yet.</p>}
      <div className="grid gap-4">
        {data?.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-lg font-semibold text-slate-900">{item.full_name}</h2>
                <p className="text-sm text-slate-600">{item.phone} · {item.operating_area}</p></div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize">{item.status}</span>
            </div>
            <p className="mt-3 text-sm text-slate-700">{item.service_type.replaceAll("_", " ")} · {item.vehicle_type} · {item.seat_count} seats · {item.vehicle_plate}</p>
            <p className="mt-1 text-xs text-slate-500">Submitted {new Date(item.created_at).toLocaleDateString("en-GH")}</p>
            {item.status === "pending" && <form action={reviewDriver} className="mt-5 space-y-3 border-t pt-4">
              <input type="hidden" name="applicationId" value={item.id} />
              <label className="block text-sm font-medium text-slate-800" htmlFor={`note-${item.id}`}>Review note</label>
              <textarea id={`note-${item.id}`} name="reviewNote" maxLength={1000} rows={2}
                className="w-full rounded-lg border border-slate-300 p-3" placeholder="Reason for decision or next steps" />
              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input type="checkbox" name="verified" className="mt-1" />
                I verified the licence, insurance, vehicle and identity outside this form.
              </label>
              <div className="flex gap-3">
                <button type="submit" name="decision" value="approved" className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white">Approve</button>
                <button type="submit" name="decision" value="rejected" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Decline</button>
              </div>
            </form>}
          </article>
        ))}
      </div>
    </div>
  );
}
