import { Users } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import CommunityTable from "@/components/admin/CommunityTable";
import { getCommunityMembers } from "@/lib/dashboard/getCommunityMembers";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";

// Always fetch fresh data from Supabase — never serve a statically
// generated snapshot of the community list.
export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  await requireAdminArea("community");

  const members = await getCommunityMembers();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Users}
        title="Community"
        description="Everyone who joined the TransVista community through the website."
      />

      {/* Table with search + filters */}
      <CommunityTable members={members} />
    </div>
  );
}
