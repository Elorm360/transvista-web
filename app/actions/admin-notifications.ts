"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/requireAdminArea";
import { getAdminNotifications } from "@/lib/dashboard/getAdminNotifications";
import { createClient } from "@/lib/supabase/server";

function validNotificationKey(value: FormDataEntryValue | null): string | null {
  const key = String(value ?? "").trim();
  if (!key || key.length > 200) return null;
  if (/^booking:(custom|package):\d+$/.test(key)) return key;
  if (/^activity:[0-9a-f-]{36}$/i.test(key)) return key;
  if (/^lead:[0-9a-f-]{36}$/i.test(key)) return key;
  return null;
}

export async function markNotificationRead(formData: FormData) {
  const { user } = await getAdminSession();
  const key = validNotificationKey(formData.get("notificationKey"));
  if (!key) return;

  const supabase = await createClient();
  const { error } = await supabase.from("admin_notification_reads").upsert(
    { user_id: user.id, notification_key: key, read_at: new Date().toISOString() },
    { onConflict: "user_id,notification_key" },
  );
  if (error) console.error("[markNotificationRead]", error);
  revalidatePath("/admin/notifications");
  revalidatePath("/admin");
}

export async function markAllNotificationsRead() {
  const { user, role } = await getAdminSession();
  const { notifications } = await getAdminNotifications(user.id, role, { limit: 150 });
  if (!notifications.length) return;

  const supabase = await createClient();
  const readAt = new Date().toISOString();
  const { error } = await supabase.from("admin_notification_reads").upsert(
    notifications.map((notification) => ({
      user_id: user.id,
      notification_key: notification.key,
      read_at: readAt,
    })),
    { onConflict: "user_id,notification_key" },
  );
  if (error) console.error("[markAllNotificationsRead]", error);
  revalidatePath("/admin/notifications");
  revalidatePath("/admin");
}
