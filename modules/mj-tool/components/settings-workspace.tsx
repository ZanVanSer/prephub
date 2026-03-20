"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/modules/mj-tool/components/toast-provider";
import { DEFAULT_SETTINGS, normalizeSettings } from "@/modules/mj-tool/lib/settings";
import { STORAGE_KEYS } from "@/modules/mj-tool/lib/storage";
import type { AnalyzerSettings } from "@/modules/mj-tool/types/analyzer";

export function SettingsWorkspace() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AnalyzerSettings>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS;
    }

    const rawSettings = window.localStorage.getItem(STORAGE_KEYS.settings);
    return rawSettings
      ? normalizeSettings(JSON.parse(rawSettings) as Partial<AnalyzerSettings>)
      : DEFAULT_SETTINGS;
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) {
      return;
    }

    const timeoutId = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [saved]);

  function updateSetting<Key extends keyof AnalyzerSettings>(
    key: Key,
    value: AnalyzerSettings[Key],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSave() {
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    setSaved(true);
    showToast("Settings saved.", "success");
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <SettingsPanel title="Preview">
            <SettingsRow
              label="Desktop width"
              description="Starting width for the desktop preview frame."
            >
              <input
                type="number"
                min={320}
                value={settings.previewWidth}
                onChange={(event) =>
                  updateSetting(
                    "previewWidth",
                    Number(event.target.value) || DEFAULT_SETTINGS.previewWidth,
                  )
                }
                className="w-full rounded-[18px] bg-[var(--surface-low)] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none"
              />
            </SettingsRow>

            <SettingsRow
              label="Default device"
              description="Which preview mode opens first."
            >
              <select
                value={settings.previewDevice}
                onChange={(event) =>
                  updateSetting(
                    "previewDevice",
                    event.target.value as AnalyzerSettings["previewDevice"],
                  )
                }
                className="w-full rounded-[18px] bg-[var(--surface-low)] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none"
              >
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
            </SettingsRow>

            <SettingsRow
              label="Default theme"
              description="Preview appearance when the page loads."
            >
              <select
                value={settings.previewTheme}
                onChange={(event) =>
                  updateSetting(
                    "previewTheme",
                    event.target.value as AnalyzerSettings["previewTheme"],
                  )
                }
                className="w-full rounded-[18px] bg-[var(--surface-low)] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </SettingsRow>
          </SettingsPanel>

          <SettingsPanel title="Analyzer">
            <SettingsRow
              label="HTML size warning"
              description="Warn when generated HTML gets close to clipping limits."
            >
              <div className="max-w-[220px]">
                <InputWithSuffix suffix="KB">
                  <input
                    type="number"
                    min={1}
                    value={settings.htmlSizeWarningKb}
                    onChange={(event) =>
                      updateSetting(
                        "htmlSizeWarningKb",
                        Number(event.target.value) || DEFAULT_SETTINGS.htmlSizeWarningKb,
                      )
                    }
                    className="w-full border-0 bg-transparent px-4 py-3 text-[14px] text-slate-900 outline-none"
                  />
                </InputWithSuffix>
              </div>
            </SettingsRow>

            <SettingsRow
              label="Image weight warning"
              description="Reserved for future media weight checks."
            >
              <div className="max-w-[220px]">
                <InputWithSuffix suffix="MB">
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={settings.imageWeightWarningMb}
                    onChange={(event) =>
                      updateSetting(
                        "imageWeightWarningMb",
                        Number(event.target.value) || DEFAULT_SETTINGS.imageWeightWarningMb,
                      )
                    }
                    className="w-full border-0 bg-transparent px-4 py-3 text-[14px] text-slate-900 outline-none"
                  />
                </InputWithSuffix>
              </div>
            </SettingsRow>

            <SettingsRow
              label="Spam sensitivity"
              description="Higher values catch more risky copy but may increase false positives."
            >
              <div className="max-w-[280px]">
                <select
                  value={settings.spamSensitivity}
                  onChange={(event) =>
                    updateSetting(
                      "spamSensitivity",
                      event.target.value as AnalyzerSettings["spamSensitivity"],
                    )
                  }
                  className="w-full rounded-[18px] bg-[var(--surface-low)] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </SettingsRow>

            <SettingsRow
              label="Link checking"
              description="Verify external URLs during analysis."
            >
              <button
                type="button"
                onClick={() => updateSetting("linkCheckEnabled", !settings.linkCheckEnabled)}
                className="inline-flex items-center gap-3 rounded-[18px] bg-[var(--surface-low)] px-4 py-3 text-[14px] text-[var(--text-primary)]"
              >
                <span
                  className={`h-2.5 w-2.5 ${
                    settings.linkCheckEnabled ? "bg-[var(--primary)]" : "bg-slate-300"
                  }`}
                />
                {settings.linkCheckEnabled ? "Enabled" : "Disabled"}
              </button>
            </SettingsRow>
          </SettingsPanel>
        </div>

        <aside className="mj-settings-aside">
          <div className="space-y-4">

            {saved ? (
              <div className="rounded-[20px] bg-[rgba(95,139,112,0.12)] px-4 py-3 text-[14px] text-[var(--success)]">
                Settings saved.
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              className="button button--primary w-full"
            >
              Save
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

type SettingsPanelProps = {
  title: string;
  children: React.ReactNode;
};

function SettingsPanel({ title, children }: SettingsPanelProps) {
  return (
    <section className="mj-settings-panel">
      <div className="px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

type SettingsRowProps = {
  label: string;
  description: string;
  children: React.ReactNode;
};

function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <div className="mj-settings-row">
      <div className="space-y-1">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-[13px] leading-5 text-[var(--text-secondary)]">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

type InputWithSuffixProps = {
  children: React.ReactNode;
  suffix: string;
};

function InputWithSuffix({ children, suffix }: InputWithSuffixProps) {
  return (
    <div className="mj-input-with-suffix">
      <div className="min-w-0 flex-1">{children}</div>
      <span className="px-3 text-[13px] text-[var(--text-secondary)]">
        {suffix}
      </span>
    </div>
  );
}
