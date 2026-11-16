import { CalendarPlus } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import EventManagementCentre from "@/components/admin/EventManagementCentre";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  await requireAdminArea("events");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("travel_events")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) console.error("[AdminEventsPage]", error);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        icon={CalendarPlus}
        title="Event Management Centre"
        description="Plan, publish and manage TransVista group experiences from one workspace. Completed events stay in the archive."
      />
      {error && <p role="status" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Event records could not be loaded. Refresh the page or contact the administrator.</p>}
      <div className="mt-7">
        <EventManagementCentre
          events={(data ?? []) as never[]}
          readOnly={process.env.VERCEL_ENV === "preview"}
        />
      </div>
    </div>
  );
}
