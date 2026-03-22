import { AppHeader } from "@/components/shell/app-header";
import { SidebarClient } from "@/components/shell/sidebar-client";
import type { AppModuleView } from "@/lib/modules/access";

export function AppShell({
  userEmail,
  navModules,
  canAccessSettings,
  children
}: {
  userEmail: string;
  navModules: AppModuleView[];
  canAccessSettings: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="app-frame">
      <SidebarClient navModules={navModules} />
      <div className="app-main">
        <AppHeader userEmail={userEmail} canAccessSettings={canAccessSettings} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
