"use server";

import { logAudit } from "@/lib/audit";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/auth/requireAdminArea";
import { toActionResult } from "@/lib/actions/result";
import { AVATAR_BUCKET, AVATAR_MAX_BYTES, AVATAR_TYPES } from "@/lib/admin/avatars";

/**
 * Self-service account actions for any signed-in team member.
 * Each action only ever touches the caller's own team record.
 */

async function myMember() {
  const { user } = await getAdminSession();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_team_members")
    .select("id, full_name, avatar_path, status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data || data.status !== "active") {
    throw new Error("Your team profile could not be found.");
  }
  return { user, admin, member: data };
}

function refresh() {
  revalidatePath("/admin", "layout");
}

async function updateMyProfileUnsafe(input: { fullName: string; phone: string }) {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  if (fullName.length < 2 || fullName.length > 120) throw new Error("Enter your full name.");
  if (phone && (phone.length > 32 || !/^[+\d][\d\s().-]{5,31}$/.test(phone))) {
    throw new Error("Enter a valid phone number, or leave it blank.");
  }

  const { admin, member, user } = await myMember();
  const { error } = await admin
    .from("admin_team_members")
    .update({ full_name: fullName, phone: phone || null, updated_at: new Date().toISOString() })
    .eq("id", member.id);
  if (error) {
    console.error("[updateMyProfile]", error);
    throw new Error("Your profile could not be saved.");
  }
  // Keep the login profile's display name in step.
  await admin.auth.admin.updateUserById(user.id, { user_metadata: { full_name: fullName } });
  refresh();
  return { fullName };
}

async function uploadMyAvatarUnsafe(formData: FormData) {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a photo to upload.");
  if (!(AVATAR_TYPES as readonly string[]).includes(file.type)) throw new Error("Use a JPG, PNG or WebP image.");
  if (file.size > AVATAR_MAX_BYTES) throw new Error("That photo is too large. Use an image under 2 MB.");

  const { admin, member } = await myMember();
  const extension = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
  // A new random name each time, so browsers never show a cached old photo.
  const path = `${member.id}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await admin.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error("[uploadMyAvatar] upload:", uploadError);
    throw new Error("The photo could not be uploaded. Please try again.");
  }

  const { error: updateError } = await admin
    .from("admin_team_members")
    .update({ avatar_path: path, updated_at: new Date().toISOString() })
    .eq("id", member.id);
  if (updateError) {
    await admin.storage.from(AVATAR_BUCKET).remove([path]);
    console.error("[uploadMyAvatar] update:", updateError);
    throw new Error("The photo could not be saved. Please try again.");
  }

  if (member.avatar_path) await admin.storage.from(AVATAR_BUCKET).remove([member.avatar_path]);
  refresh();
  return { avatarPath: path };
}

async function removeMyAvatarUnsafe() {
  const { admin, member } = await myMember();
  if (!member.avatar_path) return { avatarPath: null };
  const { error } = await admin
    .from("admin_team_members")
    .update({ avatar_path: null, updated_at: new Date().toISOString() })
    .eq("id", member.id);
  if (error) throw new Error("The photo could not be removed.");
  await admin.storage.from(AVATAR_BUCKET).remove([member.avatar_path]);
  refresh();
  return { avatarPath: null };
}

async function changeMyPasswordUnsafe(input: { password: string; confirm: string }) {
  if (input.password.length < 8) throw new Error("Use at least 8 characters.");
  if (input.password !== input.confirm) throw new Error("The passwords don't match.");
  await myMember();
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: input.password });
  if (error) {
    console.error("[changeMyPassword]", error.code, error.message);
    throw new Error(
      error.code === "same_password"
        ? "Choose a password different from your current one."
        : "Your password could not be changed. Please try again.",
    );
  }
  return { changed: true };
}

async function setMyThemeUnsafe(theme: string) {
  if (!["system", "light", "dark"].includes(theme)) throw new Error("Choose a valid theme.");
  const { admin, member } = await myMember();
  const { error } = await admin.from("admin_team_members").update({ theme }).eq("id", member.id);
  if (error) throw new Error("Your theme could not be saved.");
  return { theme };
}

// Errors are returned rather than thrown so their messages reach the UI in production.
export async function updateMyProfile(input: { fullName: string; phone: string }) {
  return toActionResult(() => updateMyProfileUnsafe(input));
}
export async function uploadMyAvatar(formData: FormData) {
  return toActionResult(() => uploadMyAvatarUnsafe(formData));
}
export async function removeMyAvatar() {
  return toActionResult(() => removeMyAvatarUnsafe());
}
async function changeMyPasswordImpl(input: { password: string; confirm: string }) {
  return toActionResult(() => changeMyPasswordUnsafe(input));
}
export async function setMyTheme(theme: string) {
  return toActionResult(() => setMyThemeUnsafe(theme));
}

/** Audited entry point: runs changeMyPasswordImpl and records it in the audit log on success. */
export async function changeMyPassword(...args: Parameters<typeof changeMyPasswordImpl>) {
  const result = await changeMyPasswordImpl(...args);
  if (result.ok) await logAudit("account.password_changed", "Changed their own password", { type: "team_member" });
  return result;
}

/** Record turning two-step sign-in on or off (the change itself happens in Supabase Auth). */
export async function recordTwoFactorChange(enabled: boolean) {
  await getAdminSession();
  await logAudit(
    enabled ? "account.mfa_enabled" : "account.mfa_disabled",
    enabled ? "Turned on two-step sign-in" : "Turned off two-step sign-in",
    { type: "team_member" },
  );
}
