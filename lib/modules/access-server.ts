import { cache } from "react";
import type { AccessProfile } from "@/lib/auth/access";
import { getSupabaseAdminClient } from "@/lib/auth/supabase-server";
import {
  DEFAULT_MODULE_CONFIGS,
  DEFAULT_ROLE_CONFIGS,
  canAccessModuleWithConfigs,
  getRoleConfigurableModules,
  getVisibleDashboardModulesWithConfigs,
  getVisibleNavigationModulesWithConfigs,
  isModuleGloballyEnabledWithConfigs,
  type AppModuleId,
  type ModuleConfig,
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

type ModuleConfigRow = {
  module_id: AppModuleId;
  is_enabled: boolean;
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

function normalizeModuleConfigs(moduleConfigRows: ModuleConfigRow[]) {
  return DEFAULT_MODULE_CONFIGS.map((defaultConfig) => {
    const storedConfig = moduleConfigRows.find((row) => row.module_id === defaultConfig.moduleId);

    return {
      moduleId: defaultConfig.moduleId,
      isEnabled: storedConfig?.is_enabled ?? defaultConfig.isEnabled
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

export const getPersistedModuleConfigs = cache(async (): Promise<ModuleConfig[]> => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("module_configs").select("module_id,is_enabled");

  if (error) {
    throw error;
  }

  return normalizeModuleConfigs((data ?? []) as ModuleConfigRow[]);
});

export async function canAccessModuleForProfile(profile: AccessProfile, moduleId: AppModuleId) {
  const [roleConfigs, moduleConfigs] = await Promise.all([getPersistedRoleConfigs(), getPersistedModuleConfigs()]);

  return canAccessModuleWithConfigs(profile, moduleId, roleConfigs, moduleConfigs);
}

export async function getVisibleNavigationModulesForProfile(profile: AccessProfile) {
  const [roleConfigs, moduleConfigs] = await Promise.all([getPersistedRoleConfigs(), getPersistedModuleConfigs()]);

  return getVisibleNavigationModulesWithConfigs(profile, roleConfigs, moduleConfigs);
}

export async function getVisibleDashboardModulesForProfile(profile: AccessProfile) {
  const [roleConfigs, moduleConfigs] = await Promise.all([getPersistedRoleConfigs(), getPersistedModuleConfigs()]);

  return getVisibleDashboardModulesWithConfigs(profile, roleConfigs, moduleConfigs);
}

export async function isModuleEnabledForPlatform(moduleId: AppModuleId) {
  return isModuleGloballyEnabledWithConfigs(moduleId, await getPersistedModuleConfigs());
}
