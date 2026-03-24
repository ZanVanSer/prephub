import type { AccessProfile } from "@/lib/auth/access";
import type { UserPlan, UserRole } from "@/lib/auth/access";

export type AppModuleId =
  | "dashboard"
  | "image-prep"
  | "background-remover"
  | "mj-tool"
  | "settings"
  | "admin";

export type ModuleIcon = "dashboard" | "image" | "mail" | "settings";
export type ModuleCategory = "platform" | "tool";

export type AppModuleDefinition = {
  id: AppModuleId;
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: ModuleIcon;
  category: ModuleCategory;
  isImplemented: boolean;
  isRoleConfigurable: boolean;
  isGlobalConfigurable: boolean;
  isCritical: boolean;
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

export type ModuleConfig = {
  moduleId: AppModuleId;
  isEnabled: boolean;
};

export const APP_MODULES: AppModuleDefinition[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    description: "Overview of your available tools.",
    icon: "dashboard",
    category: "platform",
    isImplemented: true,
    isRoleConfigurable: false,
    isGlobalConfigurable: false,
    isCritical: true,
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
    category: "tool",
    isImplemented: true,
    isRoleConfigurable: true,
    isGlobalConfigurable: true,
    isCritical: false,
    showInSidebar: true,
    showOnDashboard: true
  },
  {
    id: "background-remover",
    href: "/background-remover",
    label: "BG Remover",
    shortLabel: "BG Remover",
    description: "Upload one image, remove the background, and download a transparent PNG result.",
    icon: "image",
    category: "tool",
    isImplemented: true,
    isRoleConfigurable: true,
    isGlobalConfigurable: true,
    isCritical: false,
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
    category: "tool",
    isImplemented: true,
    isRoleConfigurable: true,
    isGlobalConfigurable: true,
    isCritical: false,
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
    category: "platform",
    isImplemented: true,
    isRoleConfigurable: true,
    isGlobalConfigurable: true,
    isCritical: true,
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
    category: "platform",
    isImplemented: true,
    isRoleConfigurable: true,
    isGlobalConfigurable: false,
    isCritical: true,
    showInSidebar: true,
    showOnDashboard: true
  }
];

export const DEFAULT_ROLE_CONFIGS: RoleConfig[] = [
  {
    role: "basic",
    plan: "basic",
    moduleIds: ["image-prep", "background-remover", "mj-tool", "settings"]
  },
  {
    role: "admin",
    plan: "basic",
    moduleIds: ["image-prep", "background-remover", "mj-tool", "settings", "admin"]
  }
];

export const DEFAULT_MODULE_CONFIGS: ModuleConfig[] = APP_MODULES.filter((appModule) => appModule.isImplemented).map(
  (appModule) => ({
    moduleId: appModule.id,
    isEnabled: true
  })
);

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

function getModuleConfigMap(moduleConfigs: ModuleConfig[]) {
  return new Map(moduleConfigs.map((config) => [config.moduleId, config]));
}

export function getRoleConfigurableModules() {
  return APP_MODULES.filter((appModule) => appModule.isImplemented && appModule.isRoleConfigurable);
}

export function getRoleConfigurableModuleIds() {
  return getRoleConfigurableModules().map((appModule) => appModule.id);
}

export function getGlobalConfigurableModules() {
  return APP_MODULES.filter((appModule) => appModule.isImplemented && appModule.isGlobalConfigurable);
}

export function getGlobalConfigurableModuleIds() {
  return getGlobalConfigurableModules().map((appModule) => appModule.id);
}

export function isModuleGloballyEnabledWithConfigs(moduleId: AppModuleId, moduleConfigs: ModuleConfig[]) {
  const appModule = getModuleById(moduleId);

  if (!appModule.isImplemented) {
    return false;
  }

  if (!appModule.isGlobalConfigurable) {
    return true;
  }

  return getModuleConfigMap(moduleConfigs).get(moduleId)?.isEnabled ?? true;
}

export function canAccessModuleWithRoleConfigs(
  profile: AccessProfile,
  moduleId: AppModuleId,
  roleConfigs: RoleConfig[]
) {
  return canAccessModuleWithConfigs(profile, moduleId, roleConfigs, DEFAULT_MODULE_CONFIGS);
}

export function canAccessModuleWithConfigs(
  profile: AccessProfile,
  moduleId: AppModuleId,
  roleConfigs: RoleConfig[],
  moduleConfigs: ModuleConfig[]
) {
  const appModule = getModuleById(moduleId);

  if (profile.status !== "active" || !appModule.isImplemented) {
    return false;
  }

  if (!isModuleGloballyEnabledWithConfigs(moduleId, moduleConfigs)) {
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
  return canAccessModuleWithConfigs(profile, moduleId, DEFAULT_ROLE_CONFIGS, DEFAULT_MODULE_CONFIGS);
}

export function getVisibleNavigationModulesWithRoleConfigs(
  profile: AccessProfile,
  roleConfigs: RoleConfig[]
) {
  return getVisibleNavigationModulesWithConfigs(profile, roleConfigs, DEFAULT_MODULE_CONFIGS);
}

export function getVisibleNavigationModulesWithConfigs(
  profile: AccessProfile,
  roleConfigs: RoleConfig[],
  moduleConfigs: ModuleConfig[]
) {
  return APP_MODULES.filter(
    (module) =>
      module.isImplemented &&
      module.showInSidebar &&
      canAccessModuleWithConfigs(profile, module.id, roleConfigs, moduleConfigs)
  );
}

export function getVisibleNavigationModules(profile: AccessProfile) {
  return getVisibleNavigationModulesWithRoleConfigs(profile, DEFAULT_ROLE_CONFIGS);
}

export function getVisibleDashboardModulesWithRoleConfigs(
  profile: AccessProfile,
  roleConfigs: RoleConfig[]
) {
  return getVisibleDashboardModulesWithConfigs(profile, roleConfigs, DEFAULT_MODULE_CONFIGS);
}

export function getVisibleDashboardModulesWithConfigs(
  profile: AccessProfile,
  roleConfigs: RoleConfig[],
  moduleConfigs: ModuleConfig[]
) {
  return APP_MODULES.filter(
    (module) =>
      module.isImplemented &&
      module.showOnDashboard &&
      canAccessModuleWithConfigs(profile, module.id, roleConfigs, moduleConfigs)
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
