import { requireModuleAccess } from "@/lib/modules/guards";
import { toModuleView } from "@/lib/modules/access";
import { getVisibleDashboardModulesForProfile } from "@/lib/modules/access-server";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";

export default async function DashboardPage() {
  const accessContext = await requireModuleAccess("dashboard");

  return (
    <DashboardCards
      userEmail={accessContext.user.email ?? "Workspace user"}
      modules={(await getVisibleDashboardModulesForProfile(accessContext.profile)).map(toModuleView)}
    />
  );
}
