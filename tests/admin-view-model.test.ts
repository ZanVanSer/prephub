import assert from "node:assert/strict";
import test from "node:test";
import { filterAdminUsers, getAdminTabFromPathname } from "@/modules/admin/lib/view-model";
import type { AdminUserRecord } from "@/modules/admin/types";

const users: AdminUserRecord[] = [
  {
    id: "1",
    email: "alpha@example.com",
    role: "admin",
    status: "active",
    plan: "basic",
    createdAt: "",
    updatedAt: "",
    lastSignInAt: null,
    isCurrentUser: false
  },
  {
    id: "2",
    email: "beta@example.com",
    role: "basic",
    status: "disabled",
    plan: "basic",
    createdAt: "",
    updatedAt: "",
    lastSignInAt: null,
    isCurrentUser: false
  }
];

test("filterAdminUsers matches email search case-insensitively", () => {
  assert.deepEqual(
    filterAdminUsers(users, {
      query: "ALPHA",
      role: "all",
      plan: "all",
      status: "all"
    }).map((user) => user.email),
    ["alpha@example.com"]
  );
});

test("filterAdminUsers combines role, plan, and status filters", () => {
  assert.deepEqual(
    filterAdminUsers(users, {
      query: "",
      role: "basic",
      plan: "basic",
      status: "disabled"
    }).map((user) => user.email),
    ["beta@example.com"]
  );
});

test("getAdminTabFromPathname resolves users and roles tabs", () => {
  assert.equal(getAdminTabFromPathname("/admin"), "users");
  assert.equal(getAdminTabFromPathname("/admin/roles"), "roles");
  assert.equal(getAdminTabFromPathname("/admin/modules"), "modules");
});
