import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultProfileInput, type AccessProfile } from "@/lib/auth/access";
import {
  canAccessModule,
  canAccessModuleWithConfigs,
  DEFAULT_MODULE_CONFIGS,
  getVisibleDashboardModules,
  getVisibleDashboardModulesWithConfigs,
  getVisibleNavigationModules,
  getVisibleNavigationModulesWithConfigs,
  type ModuleConfig,
  type RoleConfig
} from "@/lib/modules/access";

const baseProfile: AccessProfile = {
  id: "user-1",
  email: "user@example.com",
  role: "basic",
  status: "active",
  plan: "basic",
  createdAt: "2026-03-22T12:00:00.000Z",
  updatedAt: "2026-03-22T12:00:00.000Z"
};

test("default profile provisioning shape matches the platform defaults", () => {
  assert.deepEqual(
    createDefaultProfileInput({
      id: "user-1",
      email: "user@example.com"
    }),
    {
      id: "user-1",
      email: "user@example.com",
      role: "basic",
      status: "active",
      plan: "basic"
    }
  );
});

test("basic users can access the current platform modules", () => {
  assert.equal(canAccessModule(baseProfile, "dashboard"), true);
  assert.equal(canAccessModule(baseProfile, "image-prep"), true);
  assert.equal(canAccessModule(baseProfile, "mj-tool"), true);
  assert.equal(canAccessModule(baseProfile, "settings"), true);
});

test("basic users cannot access admin", () => {
  assert.equal(canAccessModule(baseProfile, "admin"), false);
});

test("admin users pass admin access checks", () => {
  const adminProfile: AccessProfile = {
    ...baseProfile,
    role: "admin"
  };

  assert.equal(canAccessModule(adminProfile, "admin"), true);
});

test("admin users see admin in navigation and dashboard visibility", () => {
  const adminProfile: AccessProfile = {
    ...baseProfile,
    role: "admin"
  };

  assert.deepEqual(
    getVisibleNavigationModules(adminProfile).map((module) => module.id),
    ["dashboard", "image-prep", "mj-tool", "admin"]
  );

  assert.deepEqual(
    getVisibleDashboardModules(adminProfile).map((module) => module.id),
    ["image-prep", "mj-tool", "admin"]
  );
});

test("disabled users are denied all module access", () => {
  const disabledProfile: AccessProfile = {
    ...baseProfile,
    status: "disabled"
  };

  assert.equal(canAccessModule(disabledProfile, "dashboard"), false);
  assert.equal(canAccessModule(disabledProfile, "image-prep"), false);
  assert.equal(canAccessModule(disabledProfile, "mj-tool"), false);
  assert.equal(canAccessModule(disabledProfile, "settings"), false);
  assert.equal(canAccessModule(disabledProfile, "admin"), false);
});

test("visible navigation excludes admin for basic users", () => {
  assert.deepEqual(
    getVisibleNavigationModules(baseProfile).map((module) => module.id),
    ["dashboard", "image-prep", "mj-tool"]
  );
});

test("dashboard visibility follows access rules and excludes admin for basic users", () => {
  assert.deepEqual(
    getVisibleDashboardModules(baseProfile).map((module) => module.id),
    ["image-prep", "mj-tool"]
  );
});

test("settings visibility follows the same access rules as route protection", () => {
  assert.equal(canAccessModule(baseProfile, "settings"), true);
  assert.equal(
    canAccessModule(
      {
        ...baseProfile,
        status: "disabled"
      },
      "settings"
    ),
    false
  );
});

test("globally disabled modules are denied even when the role allows access", () => {
  const moduleConfigs: ModuleConfig[] = DEFAULT_MODULE_CONFIGS.map((config) =>
    config.moduleId === "mj-tool" ? { ...config, isEnabled: false } : config
  );
  const roleConfigs: RoleConfig[] = [
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

  assert.equal(canAccessModuleWithConfigs(baseProfile, "mj-tool", roleConfigs, moduleConfigs), false);
});

test("globally disabled modules are removed from navigation and dashboard visibility", () => {
  const moduleConfigs: ModuleConfig[] = DEFAULT_MODULE_CONFIGS.map((config) =>
    config.moduleId === "image-prep" ? { ...config, isEnabled: false } : config
  );
  const roleConfigs: RoleConfig[] = [
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

  assert.deepEqual(
    getVisibleNavigationModulesWithConfigs(baseProfile, roleConfigs, moduleConfigs).map((module) => module.id),
    ["dashboard", "mj-tool"]
  );
  assert.deepEqual(
    getVisibleDashboardModulesWithConfigs(baseProfile, roleConfigs, moduleConfigs).map((module) => module.id),
    ["mj-tool"]
  );
});

test("critical non-configurable modules remain enabled even if stored state says otherwise", () => {
  const adminProfile: AccessProfile = {
    ...baseProfile,
    role: "admin"
  };
  const moduleConfigs: ModuleConfig[] = DEFAULT_MODULE_CONFIGS.map((config) =>
    config.moduleId === "admin" ? { ...config, isEnabled: false } : config
  );
  const roleConfigs: RoleConfig[] = [
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

  assert.equal(canAccessModuleWithConfigs(adminProfile, "admin", roleConfigs, moduleConfigs), true);
});
