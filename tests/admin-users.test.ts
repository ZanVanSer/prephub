import assert from "node:assert/strict";
import test from "node:test";
import {
  assertAdminUserUpdateAllowed,
  getAdminModuleAccessSummary,
  validateAdminUserUpdate
} from "@/modules/admin/lib/contracts";
import {
  prepareAdminUsers
} from "@/modules/admin/lib/users";

const authUsers = [
  {
    id: "admin-1",
    email: "admin@example.com",
    created_at: "2026-03-22T10:00:00.000Z",
    last_sign_in_at: "2026-03-22T12:00:00.000Z"
  },
  {
    id: "basic-1",
    email: "basic@example.com",
    created_at: "2026-03-22T10:30:00.000Z",
    last_sign_in_at: null
  }
] as const;

test("prepareAdminUsers merges auth users with profiles and backfill work", () => {
  const result = prepareAdminUsers(
    authUsers,
    [
      {
        id: "admin-1",
        email: "old-admin@example.com",
        role: "admin",
        status: "active",
        plan: "basic",
        created_at: "2026-03-22T10:00:00.000Z",
        updated_at: "2026-03-22T10:00:00.000Z"
      }
    ],
    "admin-1"
  );

  assert.deepEqual(result.emailUpdates, [
    {
      id: "admin-1",
      email: "admin@example.com"
    }
  ]);

  assert.deepEqual(result.missingProfiles, [
    {
      id: "basic-1",
      email: "basic@example.com",
      role: "basic",
      status: "active",
      plan: "basic"
    }
  ]);

  assert.equal(result.users[0].isCurrentUser, true);
  assert.equal(result.users[1].role, "basic");
});

test("validateAdminUserUpdate accepts current allowed values", () => {
  assert.deepEqual(
    validateAdminUserUpdate({
      role: "admin",
      status: "active",
      plan: "basic"
    }),
    {
      role: "admin",
      status: "active",
      plan: "basic"
    }
  );
});

test("validateAdminUserUpdate rejects unsupported values", () => {
  assert.throws(
    () =>
      validateAdminUserUpdate({
        role: "owner",
        status: "active",
        plan: "basic"
      }),
    /Invalid role/
  );
});

test("assertAdminUserUpdateAllowed blocks self-demotion and self-disable", () => {
  assert.throws(
    () =>
      assertAdminUserUpdateAllowed({
        actorUserId: "admin-1",
        targetUserId: "admin-1",
        currentProfile: {
          role: "admin",
          status: "active"
        },
        nextProfile: {
          role: "basic",
          status: "active",
          plan: "basic"
        }
      }),
    /remove your own admin access/
  );

  assert.throws(
    () =>
      assertAdminUserUpdateAllowed({
        actorUserId: "admin-1",
        targetUserId: "admin-1",
        currentProfile: {
          role: "admin",
          status: "active"
        },
        nextProfile: {
          role: "admin",
          status: "disabled",
          plan: "basic"
        }
      }),
    /disable your own account/
  );
});

test("module access summary follows the central module registry", () => {
  assert.deepEqual(getAdminModuleAccessSummary(), [
    {
      role: "basic",
      modules: ["Dashboard", "Image Prep", "MJML Tool", "Settings"]
    },
    {
      role: "admin",
      modules: ["Dashboard", "Image Prep", "MJML Tool", "Settings", "Admin"]
    }
  ]);
});
