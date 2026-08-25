import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleFor } from "@/lib/auth/isAdmin";
import { canAccess, type AdminArea, type AdminRole } from "@/lib/auth/permissions";
import type { User } from "@supabase/supabase-js";

export async function getAdminSession(): Promise<{
  user: User;
  role: AdminRole;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await roleFor(user);

  if (!role) {
    redirect("/unauthorized");
  }

  return { user, role };
}

export async function requireAdminArea(area: AdminArea) {
  const session = await getAdminSession();

  if (!canAccess(session.role, area)) {
    redirect("/unauthorized");
  }

  return session;
}
