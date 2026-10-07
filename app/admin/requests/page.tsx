import { ClipboardList } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import TravelRequestsList from "@/components/admin/TravelRequestsList";
import {
  getRequestOperators,
  getTravelRequests,
} from "@/lib/dashboard/getTravelRequests";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const { role } = await requireAdminArea("requests");
  const [requests, operators] = await Promise.all([
    getTravelRequests(),
    getRequestOperators(),
  ]);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        icon={ClipboardList}
        title="Booking Operations"
        description="Manage requests, assignments, quotes, payments, follow-ups and traveller communication."
      />
      <TravelRequestsList requests={requests} operators={operators} adminRole={role} />
    </div>
  );
}
