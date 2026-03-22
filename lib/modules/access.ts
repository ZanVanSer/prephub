import type { AccessProfile } from "@/lib/auth/access";
import type { UserPlan, UserRole } from "@/lib/auth/access";

export type AppModuleId = "dashboard" | "image-prep" | "mj-tool" | "settings" | "admin";

export type ModuleIcon = "dashboard" | "image" | "mail" | "settings";

export type AppModuleDefinition = {
  id: AppModuleId;
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: ModuleIcon;
  isImplemented: boolean;
  isRoleConfigurable: boolean;
  showInSidebar: boolean;
  showOnDashboard: boolean;
};

export type AppModuleView = Pick<
  AppModuleDefinition,
  "id" | "href" | "label" | "shortLabel" | "description" | "icon"
>;

export type RoleConfig = {
  role: UserRole;
  plan: UserPlan;
  moduleIds: AppModuleId[];
};

export const APP_MODULES: AppModuleDefinition[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    description: "Overview of your available tools.",
    icon: "dashboard",
    isImplemented: true,
    isRoleConfigurable: false,
    showInSidebar: true,
    showOnDashboard: false
  },
  {
    id: "image-prep",
    href: "/image-prep",
    label: "Image Prep",
    shortLabel: "Image Prep",
    description: "Prepare email and newsletter images with ready-to-use export presets.",
    icon: "image",
    isImplemented: true,
    isRoleConfigurable: true,
    showInSidebar: true,
    showOnDashboard: true
  },
  {
    id: "mj-tool",
    href: "/mj-tool",
    label: "MJML Tool",
    shortLabel: "MJML Tool",
    description: "Build, preview, convert, and review MJML email templates in one place.",
    icon: "mail",
    isImplemented: true,
    isRoleConfigurable: true,
    showInSidebar: true,
    showOnDashboard: true
  },
  {
    id: "settings",
    href: "/settings",
    label: "Settings",
    shortLabel: "Settings",
    description: "Manage your workspace preferences and account-related settings.",
    icon: "settings",
    isImplemented: true,
    isRoleConfigurable: true,
    showInSidebar: false,
    showOnDashboard: false
  },
  {
    id: "admin",
    href: "/admin",
    label: "Admin",
    shortLabel: "Admin",
    description: "Manage users, access, and future platform controls.",
    icon: "settings",
    isImplemented: true,
    isRoleConfigurable: true,
    showInSidebar: true,
    showOnDashboard: true
  }
];

export const DEFAULT_ROLE_CONFIGS: RoleConfig[] = [
  {
    role: "basic",
    plan: "basic",
    moduleIds: ["image-prep", "mj-tool", "settings"]
  },
  {
    role: "admin",
    plan: "basic",
    moduleIds: ["image-prep", "mj-tool", "settings", "admin"]
  }
];

export const MJ_TOOL_TABS = [
  { href: "/mj-tool", label: "MJML Preview" },
  { href: "/mj-tool/output", label: "MJML to HTML" },
  { href: "/mj-tool/html-preview", label: "HTML Preview" },
  { href: "/mj-tool/analyze", label: "Analyze" },
  { href: "/mj-tool/settings", label: "Settings" }
] as const;

export function getModuleById(moduleId: AppModuleId) {
  const appModule = APP_MODULES.find((entry) => entry.id === moduleId);

  if (!appModule) {
    throw new Error(`Unknown app module: ${moduleId}`);
  }

  return appModule;
}

function getRoleConfigMap(roleConfigs: RoleConfig[]) {
  return new Map(roleConfigs.map((config) => [config.role, config]));
}

export function getRoleConfigurableModules() {
  return APP_MODULES.filter((appModule) => appModule.isImplemented && appModule.isRoleConfigurable);
}

export function getRoleConfigurableModuleIds() {
  return getRoleConfigurableModules().map((appModule) => appModule.id);
}

export function canAccessModuleWithRoleConfigs(
  profile: AccessProfile,
  moduleId: AppModuleId,
  roleConfigs: RoleConfig[]
) {
  const appModule = getModuleById(moduleId);

  if (profile.status !== "active" || !appModule.isImplemented) {
    return false;
  }

  if (moduleId === "dashboard") {
    return true;
  }

  if (!appModule.isRoleConfigurable) {
    return false;
  }

  const roleConfig = getRoleConfigMap(roleConfigs).get(profile.role);

  return roleConfig?.moduleIds.includes(moduleId) ?? false;
}

export function canAccessModule(profile: AccessProfile, moduleId: AppModuleId) {
  return canAccessModuleWithRoleConfigs(profile, moduleId, DEFAULT_ROLE_CONFIGS);
}

export function getVisibleNavigationModulesWithRoleConfigs(
  profile: AccessProfile,
  roleConfigs: RoleConfig[]
) {
  return APP_MODULES.filter(
    (module) =>
      module.isImplemented &&
      module.showInSidebar &&
      canAccessModuleWithRoleConfigs(profile, module.id, roleConfigs)
  );
}

export function getVisibleNavigationModules(profile: AccessProfile) {
  return getVisibleNavigationModulesWithRoleConfigs(profile, DEFAULT_ROLE_CONFIGS);
}

export function getVisibleDashboardModulesWithRoleConfigs(
  profile: AccessProfile,
  roleConfigs: RoleConfig[]
) {
  return APP_MODULES.filter(
    (module) =>
      module.isImplemented &&
      module.showOnDashboard &&
      canAccessModuleWithRoleConfigs(profile, module.id, roleConfigs)
  );
}

export function getVisibleDashboardModules(profile: AccessProfile) {
  return getVisibleDashboardModulesWithRoleConfigs(profile, DEFAULT_ROLE_CONFIGS);
}

export function toModuleView(module: AppModuleDefinition): AppModuleView {
  return {
    id: module.id,
    href: module.href,
    label: module.label,
    shortLabel: module.shortLabel,
    description: module.description,
    icon: module.icon
  };
}
