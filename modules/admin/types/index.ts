import type { UserPlan, UserRole, UserStatus } from "@/lib/auth/access";
import type { AppModuleId } from "@/lib/modules/access";

export type AdminTabId = "users" | "roles";

export type AdminUserRecord = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string | null;
  isCurrentUser: boolean;
};

export type AdminUserUpdateInput = {
  role: UserRole;
  status: UserStatus;
  plan: UserPlan;
};

export type AdminModuleAccessSummary = {
  role: UserRole;
  modules: string[];
};

export type AdminRoleConfigRecord = {
  role: UserRole;
  plan: UserPlan;
  moduleIds: AppModuleId[];
};

export type AdminRoleConfigUpdateInput = {
  plan: UserPlan;
  moduleIds: AppModuleId[];
};

export type AdminUserFilterValue<T extends string> = T | "all";

export type AdminUserFilters = {
  query: string;
  role: AdminUserFilterValue<UserRole>;
  plan: AdminUserFilterValue<UserPlan>;
  status: AdminUserFilterValue<UserStatus>;
};
