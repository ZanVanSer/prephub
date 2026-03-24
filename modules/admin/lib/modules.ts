import { getSupabaseAdminClient } from "@/lib/auth/supabase-server";
import { APP_MODULES, type AppModuleId } from "@/lib/modules/access";
import { getPersistedModuleConfigs } from "@/lib/modules/access-server";
import {
  assertModuleConfigUpdateAllowed,
  validateModuleConfigUpdate
} from "@/modules/admin/lib/contracts";
import type {
  AdminModuleConfigRecord,
  AdminModuleConfigUpdateInput
} from "@/modules/admin/types";

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("Admin module data helpers are server-only.");
  }
}

export async function listAdminModuleConfigs(): Promise<AdminModuleConfigRecord[]> {
  assertServerOnly();
  const moduleConfigs = await getPersistedModuleConfigs();
  const configMap = new Map(moduleConfigs.map((config) => [config.moduleId, config.isEnabled]));

  return APP_MODULES.filter((appModule) => appModule.isImplemented).map((appModule) => ({
    moduleId: appModule.id,
    label: appModule.label,
    description: appModule.description,
    category: appModule.category,
    isEnabled: configMap.get(appModule.id) ?? true,
    isCritical: appModule.isCritical,
    isGlobalConfigurable: appModule.isGlobalConfigurable
  }));
}

export async function updateModuleConfiguration(params: {
  moduleId: AppModuleId;
  input: AdminModuleConfigUpdateInput;
}): Promise<AdminModuleConfigRecord> {
  assertServerOnly();

  const { moduleId } = params;
  const input = validateModuleConfigUpdate(params.input);

  assertModuleConfigUpdateAllowed({
    moduleId,
    nextConfig: input
  });

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("module_configs").upsert(
    {
      module_id: moduleId,
      is_enabled: input.isEnabled
    },
    {
      onConflict: "module_id"
    }
  );

  if (error) {
    throw error;
  }

  const appModule = APP_MODULES.find((entry) => entry.id === moduleId);

  if (!appModule) {
    throw new Error("Unknown module.");
  }

  return {
    moduleId,
    label: appModule.label,
    description: appModule.description,
    category: appModule.category,
    isEnabled: input.isEnabled,
    isCritical: appModule.isCritical,
    isGlobalConfigurable: appModule.isGlobalConfigurable
  };
}
