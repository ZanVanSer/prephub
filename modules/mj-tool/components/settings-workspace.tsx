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
      <div className="max-w-2xl">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-slate-950">
          Settings
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-slate-500">
          Preview defaults and analyzer options for this workspace.
        </p>
      </div>

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
                className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-[var(--color-brand)]"
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
                className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-[var(--color-brand)]"
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
                className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-[var(--color-brand)]"
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
                  className="w-full border border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-[var(--color-brand)]"
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
                className="inline-flex items-center gap-3 border border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span
                  className={`h-2.5 w-2.5 ${
                    settings.linkCheckEnabled ? "bg-[var(--color-brand)]" : "bg-slate-300"
                  }`}
                />
                {settings.linkCheckEnabled ? "Enabled" : "Disabled"}
              </button>
            </SettingsRow>
          </SettingsPanel>
        </div>

        <aside className="h-fit border border-[var(--color-border)] bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-[18px] font-semibold text-slate-950">Actions</h2>
          </div>

          <div className="space-y-4 px-5 py-5">
            <p className="text-[14px] leading-6 text-slate-500">
              Changes stay local to this browser and affect preview and analysis defaults.
            </p>

            {saved ? (
              <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-700">
                Settings saved.
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex w-full items-center justify-center border border-slate-900 bg-slate-900 px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-slate-800"
            >
              Save Settings
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
    <section className="border border-[var(--color-border)] bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[18px] font-semibold text-slate-950">{title}</h2>
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
    <div className="grid gap-4 border-t border-slate-200 px-5 py-5 first:border-t-0 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:items-start lg:gap-6">
      <div className="space-y-1">
        <p className="text-[14px] font-medium text-slate-900">{label}</p>
        <p className="text-[13px] leading-5 text-slate-500">{description}</p>
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
    <div className="flex items-center border border-[var(--color-border)] bg-white">
      <div className="min-w-0 flex-1">{children}</div>
      <span className="border-l border-slate-200 px-3 text-[13px] text-slate-500">
        {suffix}
      </span>
    </div>
  );
}
