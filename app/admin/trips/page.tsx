import { CalendarDays } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import TripOperationsCalendar from "@/components/admin/TripOperationsCalendar";
import { getTripOperations } from "@/lib/dashboard/getTripOperations";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";

export const dynamic = "force-dynamic";

export default async function AdminTripOperationsPage() {
  await requireAdminArea("requests");
  const { trips, operators } = await getTripOperations();

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        icon={CalendarDays}
        title="Trip Operations & Calendar"
        description="Coordinate confirmed departures, trip preparation, transport details and team responsibility."
      />
      <TripOperationsCalendar trips={trips} operators={operators} />
    </div>
  );
}
