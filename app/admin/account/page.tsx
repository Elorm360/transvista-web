import { redirect } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import AccountSettings from "@/components/admin/AccountSettings";
import { getAdminSession } from "@/lib/auth/requireAdminArea";
import { getMyProfile } from "@/lib/dashboard/getMyProfile";

export const dynamic = "force-dynamic";

export default async function MyAccountPage() {
  const { user } = await getAdminSession();
  const profile = await getMyProfile(user.id);
  if (!profile) redirect("/unauthorized");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="My account" description="Your photo, contact details and password." />
      <AccountSettings profile={profile} />
    </div>
  );
}
