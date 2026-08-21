import { Settings } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import SectionCard from "@/components/admin/SectionCard";
import TeamMembersTable from "@/components/admin/TeamMembersTable";
import { getTeamMembers } from "@/lib/dashboard/getTeamMembers";
import { requireAdminAccess } from "@/lib/auth/requireAdminAccess";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminAccess("settings");

  const members = await getTeamMembers();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Manage your TransVista admin team and account settings."
      />

      <div className="mt-6 space-y-6">
        <SectionCard title="Team access">
          <p className="text-sm leading-7 text-slate-500">
            Manage the people who have access to the TransVista
            administration system.
          </p>
        </SectionCard>

        <TeamMembersTable members={members} />
      </div>
    </div>
  );
}
