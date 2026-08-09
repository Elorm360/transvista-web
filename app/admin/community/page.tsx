import { Users } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import CommunityTable from "@/components/admin/CommunityTable";
import { getCommunityMembers } from "@/lib/dashboard/getCommunityMembers";

// Always fetch fresh data from Supabase — never serve a statically
// generated snapshot of the community list.
export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  const members = await getCommunityMembers();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Users}
        title="community members"
        description="Manage and view everyone who has joined the TransVista Community."
      />

      {/* Table with search + filters */}
      <CommunityTable members={members} />
    </div>
  );
}
