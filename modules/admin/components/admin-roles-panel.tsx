"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { AppModuleId } from "@/lib/modules/access";
import { ADMIN_PLAN_OPTIONS } from "@/modules/admin/lib/contracts";
import type { AdminRoleConfigRecord } from "@/modules/admin/types";

export function AdminRolesPanel({
  initialRoleConfigs,
  editableModules
}: {
  initialRoleConfigs: AdminRoleConfigRecord[];
  editableModules: Array<{ id: AppModuleId; label: string }>;
}) {
  const router = useRouter();
  const [roleConfigs, setRoleConfigs] = useState(initialRoleConfigs);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateRoleConfigInState(nextRoleConfig: AdminRoleConfigRecord) {
    setRoleConfigs((currentConfigs) =>
      currentConfigs.map((config) => (config.role === nextRoleConfig.role ? nextRoleConfig : config))
    );
  }

  async function saveRoleConfig(nextRoleConfig: AdminRoleConfigRecord) {
    setErrorMessage(null);
    setActiveRole(nextRoleConfig.role);

    try {
      const response = await fetch(`/api/admin/roles/${nextRoleConfig.role}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          plan: nextRoleConfig.plan,
          moduleIds: nextRoleConfig.moduleIds
        })
      });

      const payload = (await response.json()) as
        | { roleConfig: AdminRoleConfigRecord }
        | { error: string };

      if (!response.ok || !("roleConfig" in payload)) {
        throw new Error("error" in payload ? payload.error : "Unable to update role configuration.");
      }

      updateRoleConfigInState(payload.roleConfig);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update role configuration.");
    } finally {
      setActiveRole(null);
    }
  }

  function toggleModule(roleConfig: AdminRoleConfigRecord, moduleId: AppModuleId) {
    const nextModuleIds = roleConfig.moduleIds.includes(moduleId)
      ? roleConfig.moduleIds.filter((value) => value !== moduleId)
      : [...roleConfig.moduleIds, moduleId];

    void saveRoleConfig({
      ...roleConfig,
      moduleIds: nextModuleIds
    });
  }

  return (
    <div className="admin-roles-grid">
      {errorMessage ? <p className="admin-panel-card__error">{errorMessage}</p> : null}

      {roleConfigs.map((roleConfig) => {
        const isSaving = activeRole === roleConfig.role || isPending;

        return (
          <SurfaceCard key={roleConfig.role} className="admin-role-card">
            <div className="admin-role-card__header">
              <h2 className="admin-role-card__title">{roleConfig.role}</h2>
              <span className="admin-role-card__state">{isSaving ? "Saving…" : "Ready"}</span>
            </div>

            <div className="admin-role-card__section">
              <span className="admin-role-card__label">Modules</span>
              <div className="admin-role-card__module-grid">
                {editableModules.map((appModule) => {
                  const isActive = roleConfig.moduleIds.includes(appModule.id);

                  return (
                    <button
                      key={appModule.id}
                      type="button"
                      className={
                        isActive
                          ? "admin-role-card__module-toggle admin-role-card__module-toggle--active"
                          : "admin-role-card__module-toggle"
                      }
                      onClick={() => toggleModule(roleConfig, appModule.id)}
                    >
                      {appModule.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="admin-role-card__section">
              <label className="field admin-role-card__field">
                <span>Plan</span>
                <select
                  value={roleConfig.plan}
                  onChange={(event) => {
                    const plan = event.target.value as AdminRoleConfigRecord["plan"];

                    if (plan === roleConfig.plan) {
                      return;
                    }

                    void saveRoleConfig({
                      ...roleConfig,
                      plan
                    });
                  }}
                >
                  {ADMIN_PLAN_OPTIONS.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </SurfaceCard>
        );
      })}
    </div>
  );
}
