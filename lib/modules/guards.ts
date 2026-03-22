import { notFound } from "next/navigation";
import type { AccessContext } from "@/lib/auth/access";
import { requireActiveUser } from "@/lib/auth/access";
import type { AppModuleId } from "@/lib/modules/access";
import { getModuleById } from "@/lib/modules/access";
import { canAccessModuleForProfile } from "@/lib/modules/access-server";

export async function requireModuleAccess(moduleId: AppModuleId): Promise<AccessContext> {
  const accessContext = await requireActiveUser();
  const appModule = getModuleById(moduleId);

  if (!appModule.isImplemented || !(await canAccessModuleForProfile(accessContext.profile, moduleId))) {
    notFound();
  }

  return accessContext;
}
