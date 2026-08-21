import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  const configured = getSupabasePublicEnv() !== null;

  return <LoginForm configured={configured} />;
}
