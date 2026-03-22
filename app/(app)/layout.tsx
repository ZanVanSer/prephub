import { AppShell } from "@/components/shell/app-shell";
import { hasSupabasePublicEnv } from "@/lib/auth/supabase-config";
import { requireActiveUser } from "@/lib/auth/access";
import { toModuleView } from "@/lib/modules/access";
import {
  canAccessModuleForProfile,
  getVisibleNavigationModulesForProfile
} from "@/lib/modules/access-server";
import { redirect } from "next/navigation";

export default async function ProtectedAppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!hasSupabasePublicEnv()) {
    redirect("/login");
  }

  const accessContext = await requireActiveUser();
  const navModules = (await getVisibleNavigationModulesForProfile(accessContext.profile)).map(toModuleView);
  const canAccessSettings = await canAccessModuleForProfile(accessContext.profile, "settings");

  return (
    <AppShell
      userEmail={accessContext.user.email ?? "Workspace user"}
      navModules={navModules}
      canAccessSettings={canAccessSettings}
    >
      {children}
    </AppShell>
  );
}
