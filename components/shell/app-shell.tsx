import { AppHeader } from "@/components/shell/app-header";
import { SidebarClient } from "@/components/shell/sidebar-client";

export function AppShell({
  userEmail,
  children
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app-frame">
      <SidebarClient />
      <div className="app-main">
        <AppHeader userEmail={userEmail} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
