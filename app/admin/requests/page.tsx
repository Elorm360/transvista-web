import { CircleAlert, ClipboardList } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import TravelRequestsList from "@/components/admin/TravelRequestsList";
import {
  getRequestOperators,
  loadTravelRequests,
} from "@/lib/dashboard/getTravelRequests";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";

export const dynamic = "force-dynamic";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string | string[]; view?: string | string[] }>;
}) {
  const { role } = await requireAdminArea("requests");
  const params = await searchParams;
  const [{ requests, loadError }, operators] = await Promise.all([
    loadTravelRequests(),
    getRequestOperators(),
  ]);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        icon={ClipboardList}
        title="Requests"
        description="Custom trip requests and group-trip bookings in one place."
      />
      {loadError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
        >
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Bookings could not be loaded.</p>
            <p className="mt-1">
              This is a temporary problem reading the database, not an empty list. Refresh the page to try again.
            </p>
          </div>
        </div>
      ) : (
        <TravelRequestsList
          requests={requests}
          operators={operators}
          adminRole={role}
          initialOpenId={firstParam(params.open)}
          initialView={firstParam(params.view)}
        />
      )}
    </div>
  );
}
