import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/layout/Logo";
import { AdminSetupForm } from "./SetupForm";

export const dynamic = "force-dynamic";

/**
 * First-run password screen for invited team members.
 *
 * Reached after /auth/callback verifies the Supabase invite token.
 * No admin sidebar — the console layout redirects here until
 * must_set_password is cleared.
 */
export default async function AdminSetupPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.user_metadata?.must_set_password !== true) {
    redirect("/admin");
  }

  const firstName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.split(" ")[0]
      : "there";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="mb-8 text-center">
        <Logo
          width={80}
          height={80}
          className="justify-center"
          imageClassName="h-20 w-auto"
        />
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          Welcome to the team, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose a password to activate your TransVista admin account.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <AdminSetupForm />
      </div>
    </main>
  );
}
