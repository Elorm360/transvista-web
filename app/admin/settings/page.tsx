import { Settings } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import SectionCard from "@/components/admin/SectionCard";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Configure your admin preferences and account settings."
      />

      <SectionCard title="Coming soon">
        <p className="text-sm leading-7 text-slate-500">
          Settings will be available in a future sprint. You&apos;ll be
          able to manage notifications, team members, and email
          configuration from here.
        </p>
      </SectionCard>
    </div>
  );
}
