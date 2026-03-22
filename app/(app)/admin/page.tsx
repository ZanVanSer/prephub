import { AdminNav } from "@/modules/admin/components/admin-nav";
import { ModuleFrame } from "@/components/module/module-frame";
import { requireModuleAccess } from "@/lib/modules/guards";
import { AdminUsersTable } from "@/modules/admin/components/admin-users-table";
import { listAdminUsers } from "@/modules/admin/lib/users";

export default async function AdminPage() {
  const accessContext = await requireModuleAccess("admin");
  const users = await listAdminUsers(accessContext.user.id);

  return (
    <ModuleFrame title="Admin" description="">
      <AdminNav />
      <AdminUsersTable initialUsers={users} />
    </ModuleFrame>
  );
}
