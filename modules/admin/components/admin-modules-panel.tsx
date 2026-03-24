"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { AdminModuleConfigRecord } from "@/modules/admin/types";

export function AdminModulesPanel({
  initialModules
}: {
  initialModules: AdminModuleConfigRecord[];
}) {
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateModuleInState(nextModule: AdminModuleConfigRecord) {
    setModules((currentModules) =>
      currentModules.map((module) => (module.moduleId === nextModule.moduleId ? nextModule : module))
    );
  }

  async function saveModule(nextModule: AdminModuleConfigRecord) {
    setErrorMessage(null);
    setActiveModuleId(nextModule.moduleId);

    try {
      const response = await fetch(`/api/admin/modules/${nextModule.moduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isEnabled: nextModule.isEnabled
        })
      });

      const payload = (await response.json()) as
        | { moduleConfig: AdminModuleConfigRecord }
        | { error: string };

      if (!response.ok || !("moduleConfig" in payload)) {
        throw new Error("error" in payload ? payload.error : "Unable to update module configuration.");
      }

      updateModuleInState(payload.moduleConfig);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update module configuration.");
    } finally {
      setActiveModuleId(null);
    }
  }

  return (
    <SurfaceCard className="admin-panel-card">
      {errorMessage ? <p className="admin-panel-card__error">{errorMessage}</p> : null}

      <div className="admin-table-shell">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Category</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => {
              const isSaving = activeModuleId === module.moduleId || isPending;

              return (
                <tr key={module.moduleId}>
                  <td>
                    <div className="admin-table__identity">
                      <div className="admin-table__identity-top">
                        <span className="admin-table__email">{module.label}</span>
                        {module.isCritical ? <span className="admin-table__badge">Critical</span> : null}
                      </div>
                      <span className="admin-table__meta">{module.description}</span>
                    </div>
                  </td>
                  <td>
                    <span className="admin-table__pill">{module.category}</span>
                  </td>
                  <td>
                    <span
                      className={
                        module.isEnabled
                          ? "admin-table__pill admin-table__pill--active"
                          : "admin-table__pill admin-table__pill--muted"
                      }
                    >
                      {module.isEnabled ? "enabled" : "disabled"}
                    </span>
                  </td>
                  <td>
                    {module.isGlobalConfigurable ? (
                      <button
                        type="button"
                        className={
                          module.isEnabled
                            ? "admin-module-action admin-module-action--danger"
                            : "admin-module-action"
                        }
                        onClick={() =>
                          void saveModule({
                            ...module,
                            isEnabled: !module.isEnabled
                          })
                        }
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving…" : module.isEnabled ? "Disable" : "Enable"}
                      </button>
                    ) : (
                      <span className="admin-table__state">Protected</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
