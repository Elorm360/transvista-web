import { Settings } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import TeamMembersTable from "@/components/admin/TeamMembersTable";
import TeamOnboardingGuide from "@/components/admin/TeamOnboardingGuide";
import RolesManager from "@/components/admin/RolesManager";
import { getTeamMembers } from "@/lib/dashboard/getTeamMembers";
import { getCustomRoles } from "@/lib/dashboard/getRoles";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminArea("settings");

  const [members, roles] = await Promise.all([getTeamMembers(), getCustomRoles()]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Your team, their roles and what each role can access."
      />

      <div className="mt-6 space-y-6">
        <TeamMembersTable members={members} roles={roles} />
        <RolesManager roles={roles} />
        <TeamOnboardingGuide />
      </div>
    </div>
  );
}
