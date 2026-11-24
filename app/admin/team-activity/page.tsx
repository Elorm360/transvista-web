import PageHeader from "@/components/admin/PageHeader";
import TeamActivityBoard from "@/components/admin/TeamActivityBoard";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { getTeamActivity, getTeamFeed } from "@/lib/dashboard/getTeamActivity";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TeamActivityPage() {
  const { access } = await requireAdminArea("team_activity");
  const [members, feed, rolesResult] = await Promise.all([
    getTeamActivity(),
    getTeamFeed(60),
    (await createClient()).from("admin_roles").select("key, name"),
  ]);
  const roleNames = Object.fromEntries((rolesResult.data ?? []).map((r: { key: string; name: string }) => [r.key, r.name]));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Team activity"
        description="Who's online, when they were last seen, time in the dashboard and how they're doing on their tasks."
      />
      {/* eslint-disable-next-line react-hooks/purity -- one timestamp per request, so "x min ago" matches the data */}
      <TeamActivityBoard members={members} feed={feed} roleNames={roleNames} meId={access.memberId} now={Date.now()} />
    </div>
  );
}
