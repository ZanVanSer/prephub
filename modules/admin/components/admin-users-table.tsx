"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/ui/surface-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ADMIN_FILTER_ALL,
  filterAdminUsers
} from "@/modules/admin/lib/view-model";
import {
  ADMIN_PLAN_OPTIONS,
  ADMIN_ROLE_OPTIONS,
  ADMIN_STATUS_OPTIONS
} from "@/modules/admin/lib/contracts";
import type { AdminUserFilters, AdminUserRecord } from "@/modules/admin/types";

const initialFilters: AdminUserFilters = {
  query: "",
  role: ADMIN_FILTER_ALL,
  plan: ADMIN_FILTER_ALL,
  status: ADMIN_FILTER_ALL
};

function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function AdminUsersTable({ initialUsers }: { initialUsers: AdminUserRecord[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [filters, setFilters] = useState(initialFilters);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredUsers = useMemo(() => filterAdminUsers(users, filters), [users, filters]);

  function updateUserInState(nextUser: AdminUserRecord) {
    setUsers((currentUsers) =>
      [...currentUsers]
        .map((user) => (user.id === nextUser.id ? nextUser : user))
        .sort((left, right) => left.email.localeCompare(right.email))
    );
  }

  async function saveUser(nextUser: AdminUserRecord, key: string) {
    setErrorMessage(null);
    setActiveKey(key);

    try {
      const response = await fetch(`/api/admin/users/${nextUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role: nextUser.role,
          status: nextUser.status,
          plan: nextUser.plan
        })
      });

      const payload = (await response.json()) as
        | { user: AdminUserRecord }
        | { error: string };

      if (!response.ok || !("user" in payload)) {
        throw new Error("error" in payload ? payload.error : "Unable to update user.");
      }

      updateUserInState(payload.user);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update user.");
    } finally {
      setActiveKey(null);
    }
  }

  return (
    <SurfaceCard className="admin-panel-card">
      <div className="admin-toolbar">
        <label className="field admin-toolbar__search">
          <span>Search</span>
          <input
            type="search"
            placeholder="Find by email"
            value={filters.query}
            onChange={(event) =>
              setFilters((currentFilters) => ({
                ...currentFilters,
                query: event.target.value
              }))
            }
          />
        </label>

        <div className="admin-toolbar__filters">
          <label className="field admin-toolbar__control">
            <span>Role</span>
            <select
              value={filters.role}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  role: event.target.value as AdminUserFilters["role"]
                }))
              }
            >
              <option value={ADMIN_FILTER_ALL}>All roles</option>
              {ADMIN_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="field admin-toolbar__control">
            <span>Plan</span>
            <select
              value={filters.plan}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  plan: event.target.value as AdminUserFilters["plan"]
                }))
              }
            >
              <option value={ADMIN_FILTER_ALL}>All plans</option>
              {ADMIN_PLAN_OPTIONS.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </label>

          <label className="field admin-toolbar__control">
            <span>Status</span>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  status: event.target.value as AdminUserFilters["status"]
                }))
              }
            >
              <option value={ADMIN_FILTER_ALL}>All status</option>
              {ADMIN_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {errorMessage ? <p className="admin-panel-card__error">{errorMessage}</p> : null}

      {filteredUsers.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSaving = activeKey?.startsWith(`${user.id}:`) || isPending;

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-table__identity">
                        <div className="admin-table__identity-top">
                          <span className="admin-table__email">{user.email}</span>
                          {user.isCurrentUser ? (
                            <span className="admin-table__badge">You</span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-table__pill">{user.role}</span>
                    </td>
                    <td>
                      <span className="admin-table__pill">{user.plan}</span>
                    </td>
                    <td>
                      <span
                        className={
                          user.status === "active"
                            ? "admin-table__pill admin-table__pill--active"
                            : "admin-table__pill admin-table__pill--muted"
                        }
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span className="admin-table__date">{formatAdminDate(user.createdAt)}</span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <label className="field admin-table__action-field">
                          <span className="sr-only">Role</span>
                          <select
                            value={user.role}
                            onChange={(event) => {
                              const role = event.target.value as AdminUserRecord["role"];

                              if (role === user.role) {
                                return;
                              }

                              void saveUser({ ...user, role }, `${user.id}:role`);
                            }}
                          >
                            {ADMIN_ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="field admin-table__action-field">
                          <span className="sr-only">Plan</span>
                          <select
                            value={user.plan}
                            onChange={(event) => {
                              const plan = event.target.value as AdminUserRecord["plan"];

                              if (plan === user.plan) {
                                return;
                              }

                              void saveUser({ ...user, plan }, `${user.id}:plan`);
                            }}
                          >
                            {ADMIN_PLAN_OPTIONS.map((plan) => (
                              <option key={plan} value={plan}>
                                {plan}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="field admin-table__action-field">
                          <span className="sr-only">Status</span>
                          <select
                            value={user.status}
                            onChange={(event) => {
                              const status = event.target.value as AdminUserRecord["status"];

                              if (status === user.status) {
                                return;
                              }

                              void saveUser({ ...user, status }, `${user.id}:status`);
                            }}
                          >
                            {ADMIN_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>

                        <span className="admin-table__state">{isSaving ? "Saving…" : "Ready"}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SurfaceCard>
  );
}
