import type { AccessProfile, UserPlan, UserRole, UserStatus } from "@/lib/auth/access";
import {
  APP_MODULES,
  DEFAULT_ROLE_CONFIGS,
  canAccessModuleWithRoleConfigs,
  getRoleConfigurableModuleIds,
  type AppModuleId
} from "@/lib/modules/access";
import type {
  AdminModuleAccessSummary,
  AdminRoleConfigRecord,
  AdminRoleConfigUpdateInput,
  AdminUserUpdateInput
} from "@/modules/admin/types";

export const ADMIN_ROLE_OPTIONS = ["basic", "admin"] as const;
export const ADMIN_STATUS_OPTIONS = ["active", "disabled"] as const;
export const ADMIN_PLAN_OPTIONS = ["basic"] as const;

function isAllowedValue<T extends string>(value: string, options: readonly T[]): value is T {
  return options.includes(value as T);
}

export function validateAdminUserUpdate(input: unknown): AdminUserUpdateInput {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid update payload.");
  }

  const candidate = input as Record<string, unknown>;
  const role = candidate.role;
  const status = candidate.status;
  const plan = candidate.plan;

  if (typeof role !== "string" || !isAllowedValue(role, ADMIN_ROLE_OPTIONS)) {
    throw new Error("Invalid role.");
  }

  if (typeof status !== "string" || !isAllowedValue(status, ADMIN_STATUS_OPTIONS)) {
    throw new Error("Invalid status.");
  }

  if (typeof plan !== "string" || !isAllowedValue(plan, ADMIN_PLAN_OPTIONS)) {
    throw new Error("Invalid plan.");
  }

  return { role, status, plan };
}

export function assertAdminUserUpdateAllowed(params: {
  actorUserId: string;
  targetUserId: string;
  currentProfile: Pick<AccessProfile, "role" | "status">;
  nextProfile: AdminUserUpdateInput;
}) {
  const { actorUserId, targetUserId, currentProfile, nextProfile } = params;

  if (actorUserId !== targetUserId) {
    return;
  }

  if (currentProfile.role === "admin" && nextProfile.role !== "admin") {
    throw new Error("You cannot remove your own admin access.");
  }

  if (currentProfile.status === "active" && nextProfile.status === "disabled") {
    throw new Error("You cannot disable your own account.");
  }
}

export function getAdminModuleAccessSummary(): AdminModuleAccessSummary[] {
  const baseProfile = {
    id: "system",
    email: "",
    status: "active" as const,
    plan: "basic" as const,
    createdAt: "",
    updatedAt: ""
  };

  return (["basic", "admin"] as const).map((role) => ({
    role,
    modules: APP_MODULES.filter((appModule) => appModule.isImplemented)
      .filter((appModule) =>
        canAccessModuleWithRoleConfigs(
          {
            ...baseProfile,
            role
          },
          appModule.id,
          DEFAULT_ROLE_CONFIGS
        )
      )
      .map((appModule) => appModule.label)
  }));
}

export function validateRoleConfigUpdate(input: unknown): AdminRoleConfigUpdateInput {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid role configuration payload.");
  }

  const candidate = input as Record<string, unknown>;
  const plan = candidate.plan;
  const moduleIds = candidate.moduleIds;

  if (typeof plan !== "string" || !isAllowedValue(plan, ADMIN_PLAN_OPTIONS)) {
    throw new Error("Invalid plan.");
  }

  if (!Array.isArray(moduleIds)) {
    throw new Error("Invalid module configuration.");
  }

  const allowedModuleIds = new Set(getRoleConfigurableModuleIds());
  const nextModuleIds = moduleIds
    .filter((value): value is string => typeof value === "string")
    .filter((moduleId) => allowedModuleIds.has(moduleId as AppModuleId)) as AppModuleId[];

  if (nextModuleIds.length !== moduleIds.length) {
    throw new Error("Invalid module configuration.");
  }

  return {
    plan,
    moduleIds: [...new Set(nextModuleIds)]
  };
}

export function assertRoleConfigUpdateAllowed(params: {
  role: UserRole;
  currentConfig: AdminRoleConfigRecord;
  nextConfig: AdminRoleConfigRecord;
}) {
  const { role, nextConfig } = params;

  if (role === "admin" && !nextConfig.moduleIds.includes("admin")) {
    throw new Error("Admin role must retain Admin module access.");
  }
}
