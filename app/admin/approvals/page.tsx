import PageHeader from "@/components/admin/PageHeader";
import ApprovalsPanel from "@/components/admin/ApprovalsPanel";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { getApprovals } from "@/lib/dashboard/getApprovals";
import { getTeamDirectory } from "@/lib/dashboard/getTasks";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const { access } = await requireAdminArea("tasks");
  const [requests, people] = await Promise.all([getApprovals(), getTeamDirectory()]);
  const canDecide = access.areas.includes("approvals");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Approvals"
        description={canDecide
          ? "Expenses, decisions and payment corrections that need your sign-off. Every decision is recorded in the audit log."
          : "Ask for the CEO's approval of spending or a decision, and follow its progress."}
      />
      <ApprovalsPanel requests={requests} people={people} meId={access.memberId} canDecide={canDecide} />
    </div>
  );
}
