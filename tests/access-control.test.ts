import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultProfileInput, type AccessProfile } from "@/lib/auth/access";
import {
  canAccessModule,
  getVisibleDashboardModules,
  getVisibleNavigationModules
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
