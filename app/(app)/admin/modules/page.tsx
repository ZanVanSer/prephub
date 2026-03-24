import { ModuleFrame } from "@/components/module/module-frame";
import { requireModuleAccess } from "@/lib/modules/guards";
import { AdminNav } from "@/modules/admin/components/admin-nav";
import { AdminModulesPanel } from "@/modules/admin/components/admin-modules-panel";
import { listAdminModuleConfigs } from "@/modules/admin/lib/modules";

export default async function AdminModulesPage() {
  await requireModuleAccess("admin");

  return (
    <ModuleFrame title="Admin" description="">
      <AdminNav />
      <AdminModulesPanel initialModules={await listAdminModuleConfigs()} />
    </ModuleFrame>
  );
}
