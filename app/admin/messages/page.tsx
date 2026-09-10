import { MessageSquareText } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import SmsMessagingPanel from "@/components/admin/SmsMessagingPanel";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { getSmsMessages } from "@/lib/dashboard/getSmsMessages";
import { getTravelRequests } from "@/lib/dashboard/getTravelRequests";
import { isSmsConfigured } from "@/lib/sms/twilio";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdminArea("requests");
  const [requests, history] = await Promise.all([
    getTravelRequests(),
    getSmsMessages(),
  ]);

  const contacts = requests
    .filter((request) => request.phone?.trim())
    .map((request) => ({
      key: `${request.source}:${request.sourceId}`,
      reference: request.reference,
      fullName: request.fullName,
      phone: request.phone,
      kind: request.kind,
      summary: request.summary,
    }));

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        icon={MessageSquareText}
        title="Traveller Messages"
        description="Send controlled booking, payment, trip and pickup updates by SMS."
      />
      <SmsMessagingPanel
        contacts={contacts}
        history={history}
        configured={isSmsConfigured()}
      />
    </div>
  );
}
