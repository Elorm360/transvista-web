import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VerifyCodeForm from "./VerifyCodeForm";

export const metadata: Metadata = {
  title: "Enter your sign-in code",
  robots: { index: false, follow: false },
};

/** Second step of sign-in for accounts with two-step sign-in turned on. */
export default async function VerifyCodePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  // Nothing to verify (not set up, or already verified this session).
  if (aal?.nextLevel !== "aal2" || aal.currentLevel === "aal2") redirect("/admin");

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <VerifyCodeForm />
    </main>
  );
}
