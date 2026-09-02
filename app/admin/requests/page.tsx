import { ClipboardList } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import TravelRequestsList from "@/components/admin/TravelRequestsList";
import { getTravelRequests } from "@/lib/dashboard/getTravelRequests";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  await requireAdminArea("requests");
  const requests = await getTravelRequests();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        icon={ClipboardList}
        title="Travel Requests"
        description="Review custom itineraries and group-trip reservations in one place."
      />
      <TravelRequestsList requests={requests} />
    </div>
  );
}