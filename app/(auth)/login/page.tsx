import { redirect } from "next/navigation";
import { ImprepAuthScreen } from "@/components/auth/imprep-auth-screen";
import { LoginForm } from "@/components/auth/login-form";
import { hasSupabasePublicEnv } from "@/lib/auth/supabase-config";
import { getSupabaseServerClient } from "@/lib/auth/supabase-server";

export default async function LoginPage() {
  if (!hasSupabasePublicEnv()) {
    return (
      <ImprepAuthScreen
        title="Set up Supabase to continue"
        description="Add the public Supabase environment variables to enable login and protected modules."
      />
    );
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <ImprepAuthScreen
      title="Welcome to ToolHub"
      description="Sign in with your workspace credentials to access Image Prep and MJML Tool."
    >
      <LoginForm />
    </ImprepAuthScreen>
  );
}
