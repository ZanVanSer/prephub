import { DashboardSettingsPanel } from "@/components/settings/dashboard-settings-panel";
import { requireModuleAccess } from "@/lib/modules/guards";

export default async function SettingsPage() {
  await requireModuleAccess("settings");

  return <DashboardSettingsPanel />;
}
