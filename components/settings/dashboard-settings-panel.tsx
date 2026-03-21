"use client";

import { useSyncExternalStore } from "react";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  DEFAULT_SHOW_DEMO_TOOLS,
  readShowDemoToolsPreference,
  subscribeShowDemoToolsPreference,
  writeShowDemoToolsPreference
} from "@/lib/dashboard-preferences";

export function DashboardSettingsPanel() {
  const showDemoTools = useSyncExternalStore(
    subscribeShowDemoToolsPreference,
    readShowDemoToolsPreference,
    () => DEFAULT_SHOW_DEMO_TOOLS
  );

  function handleToggle() {
    const nextValue = !showDemoTools;
    writeShowDemoToolsPreference(nextValue);
  }

  return (
    <SurfaceCard className="settings-card">
      <label className="settings-row">
        <span className="settings-row__label">Show demo tools on dashboard</span>
        <button
          type="button"
          role="switch"
          aria-checked={showDemoTools}
          className={showDemoTools ? "settings-switch settings-switch--active" : "settings-switch"}
          onClick={handleToggle}
        >
          <span className="settings-switch__thumb" />
        </button>
      </label>
    </SurfaceCard>
  );
}
