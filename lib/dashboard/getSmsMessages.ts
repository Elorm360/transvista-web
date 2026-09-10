import "server-only";

import { createClient } from "@/lib/supabase/server";

export type SmsMessageRecord = {
  id: string;
  reference: string;
  recipientPhone: string;
  messageType: string;
  body: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
};

export async function getSmsMessages(): Promise<SmsMessageRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sms_messages")
    .select(
      "id, reference, recipient_phone, message_type, body, status, created_at, sent_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[getSmsMessages]", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    reference: row.reference,
    recipientPhone: row.recipient_phone,
    messageType: row.message_type,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
    sentAt: row.sent_at,
  }));
}
