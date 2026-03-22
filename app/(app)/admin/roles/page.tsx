import { ModuleFrame } from "@/components/module/module-frame";
import { requireModuleAccess } from "@/lib/modules/guards";
import { AdminNav } from "@/modules/admin/components/admin-nav";
import { AdminRolesPanel } from "@/modules/admin/components/admin-roles-panel";
import { getEditableRoleModules, listAdminRoleConfigs } from "@/modules/admin/lib/roles";

export default async function AdminRolesPage() {
  await requireModuleAccess("admin");

  return (
    <ModuleFrame title="Admin" description="">
      <AdminNav />
      <AdminRolesPanel initialRoleConfigs={await listAdminRoleConfigs()} editableModules={getEditableRoleModules()} />
    </ModuleFrame>
  );
}
