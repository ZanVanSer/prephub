import assert from "node:assert/strict";
import test from "node:test";
import {
  assertModuleConfigUpdateAllowed,
  assertRoleConfigUpdateAllowed,
  validateModuleConfigUpdate,
  validateRoleConfigUpdate
} from "@/modules/admin/lib/contracts";
import {
  canAccessModuleWithRoleConfigs,
  getVisibleDashboardModulesWithRoleConfigs,
  getVisibleNavigationModulesWithRoleConfigs,
  getRoleConfigurableModules,
  type RoleConfig
} from "@/lib/modules/access";
import type { AccessProfile } from "@/lib/auth/access";

const baseProfile: AccessProfile = {
  id: "user-1",
  email: "user@example.com",
  role: "basic",
  status: "active",
  plan: "basic",
  createdAt: "",
  updatedAt: ""
};

test("role-configurable modules come from the module registry and exclude dashboard", () => {
  assert.deepEqual(
    getRoleConfigurableModules().map((module) => module.id),
    ["image-prep", "background-remover", "mj-tool", "settings", "admin"]
  );
});

test("validateRoleConfigUpdate accepts supported plans and module ids", () => {
  assert.deepEqual(
    validateRoleConfigUpdate({
      plan: "basic",
      moduleIds: ["image-prep", "background-remover", "settings"]
    }),
    {
      plan: "basic",
      moduleIds: ["image-prep", "background-remover", "settings"]
    }
  );
});

test("validateRoleConfigUpdate rejects unknown module ids", () => {
  assert.throws(
    () =>
      validateRoleConfigUpdate({
        plan: "basic",
        moduleIds: ["dashboard"]
      }),
    /Invalid module configuration/
  );
});

test("assertRoleConfigUpdateAllowed protects admin role access", () => {
  assert.throws(
    () =>
      assertRoleConfigUpdateAllowed({
        role: "admin",
        currentConfig: {
          role: "admin",
          plan: "basic",
          moduleIds: ["image-prep", "background-remover", "admin"]
        },
        nextConfig: {
          role: "admin",
          plan: "basic",
          moduleIds: ["image-prep", "background-remover"]
        }
      }),
    /Admin role must retain Admin module access/
  );
});

test("validateModuleConfigUpdate accepts supported boolean values", () => {
  assert.deepEqual(validateModuleConfigUpdate({ isEnabled: false }), {
    isEnabled: false
  });
});

test("validateModuleConfigUpdate rejects invalid values", () => {
  assert.throws(() => validateModuleConfigUpdate({ isEnabled: "false" }), /Invalid module enabled state/);
});

test("assertModuleConfigUpdateAllowed protects globally required modules", () => {
  assert.throws(
    () =>
      assertModuleConfigUpdateAllowed({
        moduleId: "admin",
        nextConfig: {
          isEnabled: false
        }
      }),
    /Admin must remain enabled/
  );
});

test("module access follows persisted role configuration", () => {
  const roleConfigs: RoleConfig[] = [
    {
      role: "basic",
      plan: "basic",
      moduleIds: ["settings"]
    },
    {
      role: "admin",
      plan: "basic",
      moduleIds: ["image-prep", "background-remover", "mj-tool", "settings", "admin"]
    }
  ];

  assert.equal(canAccessModuleWithRoleConfigs(baseProfile, "dashboard", roleConfigs), true);
  assert.equal(canAccessModuleWithRoleConfigs(baseProfile, "settings", roleConfigs), true);
  assert.equal(canAccessModuleWithRoleConfigs(baseProfile, "image-prep", roleConfigs), false);
  assert.equal(canAccessModuleWithRoleConfigs(baseProfile, "background-remover", roleConfigs), false);
  assert.deepEqual(
    getVisibleNavigationModulesWithRoleConfigs(baseProfile, roleConfigs).map((module) => module.id),
    ["dashboard"]
  );
  assert.deepEqual(
    getVisibleDashboardModulesWithRoleConfigs(baseProfile, roleConfigs).map((module) => module.id),
    []
  );
});
