import PageHeader from "@/components/admin/PageHeader";
import TasksBoard from "@/components/admin/TasksBoard";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { getTasks, getTeamDirectory } from "@/lib/dashboard/getTasks";

export const dynamic = "force-dynamic";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ view?: string | string[] }> }) {
  const { access } = await requireAdminArea("tasks");
  const params = await searchParams;
  const view = Array.isArray(params.view) ? params.view[0] : params.view;
  const [tasks, people] = await Promise.all([getTasks(), getTeamDirectory()]);
  const canSeeAll = access.areas.includes("team_tasks");

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Tasks"
        description={canSeeAll
          ? "Assign work, follow deadlines across every department and pick up anything escalated."
          : "Your to-dos and deadlines. Post updates as you go, and escalate to the CEO when something is stuck."}
      />
      <TasksBoard
        tasks={tasks}
        people={people}
        meId={access.memberId}
        canSeeAll={canSeeAll}
        canDecide={access.areas.includes("approvals")}
        initialView={view}
      />
    </div>
  );
}
