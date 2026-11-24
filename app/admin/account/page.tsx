import { redirect } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import AccountSettings from "@/components/admin/AccountSettings";
import MyActivityCard from "@/components/admin/MyActivityCard";
import { getAdminSession } from "@/lib/auth/requireAdminArea";
import { getMyProfile } from "@/lib/dashboard/getMyProfile";
import { getMyActivity } from "@/lib/dashboard/getTeamActivity";

export const dynamic = "force-dynamic";

export default async function MyAccountPage() {
  const { user, role } = await getAdminSession();
  const [profile, activity] = await Promise.all([getMyProfile(user.id), getMyActivity()]);
  if (!profile) redirect("/unauthorized");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="My account" description="Your photo, contact details and password." />
      <AccountSettings profile={profile} />
      <MyActivityCard activity={activity} isOwner={role === "owner"} />
    </div>
  );
}
