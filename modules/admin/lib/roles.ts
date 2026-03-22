import type { UserPlan, UserRole } from "@/lib/auth/access";
import { getSupabaseAdminClient } from "@/lib/auth/supabase-server";
import {
  DEFAULT_ROLE_CONFIGS,
  getRoleConfigurableModules,
  type AppModuleId,
  type RoleConfig
} from "@/lib/modules/access";
import { getPersistedRoleConfigs } from "@/lib/modules/access-server";
import {
  assertRoleConfigUpdateAllowed,
  validateRoleConfigUpdate
} from "@/modules/admin/lib/contracts";
import type { AdminRoleConfigUpdateInput } from "@/modules/admin/types";

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("Admin role data helpers are server-only.");
  }
}

type RoleConfigRow = {
  role: UserRole;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
};

export async function listAdminRoleConfigs() {
  assertServerOnly();
  return getPersistedRoleConfigs();
}

export function getEditableRoleModules() {
  return getRoleConfigurableModules();
}

function serializeRoleModuleRows(role: UserRole, moduleIds: AppModuleId[]) {
  return moduleIds.map((moduleId) => ({
    role,
    module_id: moduleId
  }));
}

function getDefaultRoleConfig(role: UserRole) {
  const config = DEFAULT_ROLE_CONFIGS.find((item) => item.role === role);

  if (!config) {
    throw new Error("Unknown role.");
  }

  return config;
}

export async function updateRoleConfiguration(params: {
  role: UserRole;
  input: AdminRoleConfigUpdateInput;
}) {
  assertServerOnly();

  const { role } = params;
  const input = validateRoleConfigUpdate(params.input);
  const currentConfig = (await getPersistedRoleConfigs()).find((config) => config.role === role) ?? getDefaultRoleConfig(role);

  assertRoleConfigUpdateAllowed({
    role,
    currentConfig,
    nextConfig: {
      role,
      plan: input.plan,
      moduleIds: input.moduleIds
    }
  });

  const supabase = getSupabaseAdminClient();
  const { error: configError } = await supabase.from("role_configs").upsert(
    {
      role,
      plan: input.plan
    },
    {
      onConflict: "role"
    }
  );

  if (configError) {
    throw configError;
  }

  const { error: deleteError } = await supabase.from("role_module_access").delete().eq("role", role);

  if (deleteError) {
    throw deleteError;
  }

  const nextRows = serializeRoleModuleRows(role, input.moduleIds);

  if (nextRows.length > 0) {
    const { error: insertError } = await supabase.from("role_module_access").insert(nextRows);

    if (insertError) {
      throw insertError;
    }
  }

  return {
    role,
    plan: input.plan,
    moduleIds: input.moduleIds
  };
}
