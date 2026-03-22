import { redirect } from "next/navigation";
import { DisabledAccountSignOut } from "@/components/auth/disabled-account-signout";
import { ImprepAuthScreen } from "@/components/auth/imprep-auth-screen";
import { getAccessContext } from "@/lib/auth/access";
import { hasSupabasePublicEnv } from "@/lib/auth/supabase-config";

export default async function AccessDisabledPage() {
  if (!hasSupabasePublicEnv()) {
    redirect("/login");
  }

  const accessContext = await getAccessContext();

  if (!accessContext) {
    redirect("/login");
  }

  if (accessContext.profile.status === "active") {
    redirect("/dashboard");
  }

  return (
    <ImprepAuthScreen
      title="Your account is currently disabled"
      description="You can sign in, but ToolHub access is currently unavailable for this account. Contact your workspace admin if you think this is a mistake."
    >
      <DisabledAccountSignOut />
    </ImprepAuthScreen>
  );
}
