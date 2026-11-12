import { CalendarDays } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import TripDepartureManager from "@/components/admin/TripDepartureManager";
import { getTripOperations } from "@/lib/dashboard/getTripOperations";
import { getTripDepartureOperations } from "@/lib/dashboard/getTripDepartureOperations";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";

export const dynamic = "force-dynamic";

export default async function AdminTripOperationsPage() {
  await requireAdminArea("requests");
  const { trips, operators } = await getTripOperations();
  const { departures, candidates } = await getTripDepartureOperations(trips, operators);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        icon={CalendarDays}
        title="Trip Operations & Departures"
        description="Manage shared departures, traveller manifests, transport arrangements and operational readiness."
      />
      <TripDepartureManager departures={departures} candidates={candidates} operators={operators} />
    </div>
  );
}
