import { createClient } from "@/lib/supabase/server";

export type MyProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  avatarPath: string | null;
  theme: "system" | "light" | "dark";
};

/**
 * The signed-in team member's own profile. Reads through RLS
 * ("Team members can view themselves"), so it only ever returns your row.
 */
export async function getMyProfile(userId: string): Promise<MyProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_team_members")
    .select("id, full_name, email, phone, role, avatar_path, theme")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[getMyProfile]", error);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone ?? null,
    role: data.role,
    avatarPath: data.avatar_path ?? null,
    theme: (["light", "dark"].includes(data.theme) ? data.theme : "system") as MyProfile["theme"],
  };
}
