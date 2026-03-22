import { cache } from "react";
import type { AccessProfile } from "@/lib/auth/access";
import { getSupabaseAdminClient } from "@/lib/auth/supabase-server";
import {
  DEFAULT_ROLE_CONFIGS,
  canAccessModuleWithRoleConfigs,
  getRoleConfigurableModules,
  getVisibleDashboardModulesWithRoleConfigs,
  getVisibleNavigationModulesWithRoleConfigs,
  type AppModuleId,
  type RoleConfig
} from "@/lib/modules/access";

type RoleConfigRow = {
  role: RoleConfig["role"];
  plan: RoleConfig["plan"];
};

type RoleModuleAccessRow = {
  role: RoleConfig["role"];
  module_id: AppModuleId;
};

function normalizeRoleConfigs(
  roleConfigRows: RoleConfigRow[],
  roleModuleRows: RoleModuleAccessRow[]
) {
  const moduleIds = new Set(getRoleConfigurableModules().map((appModule) => appModule.id));
  const moduleMap = new Map<RoleConfig["role"], AppModuleId[]>();

  roleModuleRows.forEach((row) => {
    if (!moduleIds.has(row.module_id)) {
      return;
    }

    const currentModuleIds = moduleMap.get(row.role) ?? [];
    currentModuleIds.push(row.module_id);
    moduleMap.set(row.role, currentModuleIds);
  });

  return DEFAULT_ROLE_CONFIGS.map((defaultConfig) => {
    const storedConfig = roleConfigRows.find((row) => row.role === defaultConfig.role);
    const storedModuleIds = moduleMap.get(defaultConfig.role);

    return {
      role: defaultConfig.role,
      plan: storedConfig?.plan ?? defaultConfig.plan,
      moduleIds: storedConfig
        ? [...new Set(storedModuleIds ?? [])]
        : [...new Set(storedModuleIds ?? defaultConfig.moduleIds)]
    };
  });
}

export const getPersistedRoleConfigs = cache(async (): Promise<RoleConfig[]> => {
  const supabase = getSupabaseAdminClient();
  const [{ data: roleConfigs, error: roleConfigsError }, { data: roleModuleAccess, error: roleModuleError }] =
    await Promise.all([
      supabase.from("role_configs").select("role,plan"),
      supabase.from("role_module_access").select("role,module_id")
    ]);

  if (roleConfigsError) {
    throw roleConfigsError;
  }

  if (roleModuleError) {
    throw roleModuleError;
  }

  return normalizeRoleConfigs(
    (roleConfigs ?? []) as RoleConfigRow[],
    (roleModuleAccess ?? []) as RoleModuleAccessRow[]
  );
});

export async function canAccessModuleForProfile(profile: AccessProfile, moduleId: AppModuleId) {
  return canAccessModuleWithRoleConfigs(profile, moduleId, await getPersistedRoleConfigs());
}

export async function getVisibleNavigationModulesForProfile(profile: AccessProfile) {
  return getVisibleNavigationModulesWithRoleConfigs(profile, await getPersistedRoleConfigs());
}

export async function getVisibleDashboardModulesForProfile(profile: AccessProfile) {
  return getVisibleDashboardModulesWithRoleConfigs(profile, await getPersistedRoleConfigs());
}
