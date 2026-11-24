import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <ForgotPasswordForm />
    </main>
  );
}
