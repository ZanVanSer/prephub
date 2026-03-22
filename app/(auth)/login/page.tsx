import { redirect } from "next/navigation";
import { ImprepAuthScreen } from "@/components/auth/imprep-auth-screen";
import { LoginForm } from "@/components/auth/login-form";
import { getAccessContext } from "@/lib/auth/access";
import { hasSupabasePublicEnv } from "@/lib/auth/supabase-config";

export default async function LoginPage() {
  if (!hasSupabasePublicEnv()) {
    return (
      <ImprepAuthScreen
        title="Set up Supabase to continue"
        description="Add the public Supabase environment variables to enable login and protected modules."
      />
    );
  }

  const accessContext = await getAccessContext();

  if (accessContext) {
    redirect(accessContext.profile.status === "disabled" ? "/access-disabled" : "/dashboard");
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
