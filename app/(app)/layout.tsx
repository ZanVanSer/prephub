import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { hasSupabasePublicEnv } from "@/lib/auth/supabase-config";
import { getSupabaseServerClient } from "@/lib/auth/supabase-server";

export default async function ProtectedAppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!hasSupabasePublicEnv()) {
    redirect("/login");
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell userEmail={user.email ?? "Workspace user"}>{children}</AppShell>;
}
