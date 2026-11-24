import { MessageSquareText } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import SmsMessagingPanel from "@/components/admin/SmsMessagingPanel";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { getSmsMessages } from "@/lib/dashboard/getSmsMessages";
import { getTravelRequests } from "@/lib/dashboard/getTravelRequests";
import { isSmsConfigured } from "@/lib/sms/twilio";
import { isClosed } from "@/lib/admin/bookingHealth";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdminArea("messages");
  const [requests, history] = await Promise.all([
    getTravelRequests(),
    getSmsMessages(),
  ]);

  const contacts = requests
    // Archived or cancelled bookings shouldn't receive operational SMS.
    .filter((request) => request.phone?.trim() && !request.archivedAt && !isClosed(request))
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
        title="Messages"
        description="Send booking, payment and pickup updates to travellers by SMS."
      />
      <SmsMessagingPanel
        contacts={contacts}
        history={history}
        configured={isSmsConfigured()}
      />
    </div>
  );
}
