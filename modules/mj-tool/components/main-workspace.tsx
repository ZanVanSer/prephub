"use client";

import { useEffect, useState } from "react";

import { EditorPanel } from "@/modules/mj-tool/components/editor-panel";
import { PreviewPanel } from "@/modules/mj-tool/components/preview-panel";
import { useToast } from "@/modules/mj-tool/components/toast-provider";
import { DEFAULT_SETTINGS, normalizeSettings } from "@/modules/mj-tool/lib/settings";
import { DEFAULT_MJML, STORAGE_KEYS } from "@/modules/mj-tool/lib/storage";
import type { AnalyzerSettings } from "@/modules/mj-tool/types/analyzer";
import type {
  ConvertResponse,
  DeviceMode,
  PreviewTheme,
} from "@/modules/mj-tool/types/conversion";

export function MainWorkspace() {
  const { showToast } = useToast();
  const [mjml, setMjml] = useState(DEFAULT_MJML);
  const [html, setHtml] = useState("");
  const [errors, setErrors] = useState<ConvertResponse["errors"]>([]);
  const [warnings, setWarnings] = useState<ConvertResponse["warnings"]>([]);
  const [previewWidth, setPreviewWidth] = useState(DEFAULT_SETTINGS.previewWidth);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(
    DEFAULT_SETTINGS.previewDevice,
  );
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>(
    DEFAULT_SETTINGS.previewTheme,
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<"editor" | "preview">("editor");

  useEffect(() => {
    const storedMjml = window.sessionStorage.getItem(STORAGE_KEYS.mjml);
    const storedHtml = window.sessionStorage.getItem(STORAGE_KEYS.html);
    const rawSettings = window.localStorage.getItem(STORAGE_KEYS.settings);

    if (storedMjml) {
      setMjml(storedMjml);
    }

    if (storedHtml) {
      setHtml(storedHtml);
    }

    if (rawSettings) {
      const settings = normalizeSettings(
        JSON.parse(rawSettings) as Partial<AnalyzerSettings>,
      );
      setPreviewWidth(settings.previewWidth);
      setDeviceMode(settings.previewDevice);
      setPreviewTheme(settings.previewTheme);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEYS.mjml, mjml);
  }, [isLoaded, mjml]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEYS.html, html);
  }, [html, isLoaded]);

  async function refreshPreview() {
    setIsRefreshing(true);
    setRequestError(null);

    try {
      const response = await fetch("/api/mj-tool/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mjml }),
      });

      const data = (await response.json()) as ConvertResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to convert MJML");
      }

      setHtml(data.html);
      setErrors(data.errors);
      setWarnings(data.warnings);
      if (data.errors.length === 0) {
        showToast("Preview updated.", "success");
      }
    } catch (error) {
      setHtml("");
      setErrors([]);
      setWarnings([]);
      const message =
        error instanceof Error ? error.message : "Failed to convert MJML";
      setRequestError(message);
      showToast(message, "error");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <section className="mj-workspace">
      <div className="mb-5 flex lg:hidden">
        <div className="mj-mobile-toggle">
          <button
            type="button"
            onClick={() => setMobilePane("editor")}
            className={mobilePane === "editor" ? "mj-mobile-toggle__button mj-mobile-toggle__button--active" : "mj-mobile-toggle__button"}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setMobilePane("preview")}
            className={mobilePane === "preview" ? "mj-mobile-toggle__button mj-mobile-toggle__button--active" : "mj-mobile-toggle__button"}
          >
            Preview
          </button>
        </div>
      </div>
      <div className="mj-split-grid">
        <div className={mobilePane === "preview" ? "hidden lg:block" : ""}>
          <EditorPanel
            code={mjml}
            onCodeChange={setMjml}
            title="MJML Editor"
            languageLabel="utf-8"
            errors={errors}
            warnings={warnings}
            requestError={requestError}
            isRefreshing={isRefreshing}
          />
        </div>
        <div className={mobilePane === "editor" ? "hidden lg:block" : ""}>
          <PreviewPanel
            html={html}
            previewWidth={previewWidth}
            deviceMode={deviceMode}
            onDeviceModeChange={setDeviceMode}
            previewTheme={previewTheme}
            onPreviewThemeChange={setPreviewTheme}
            onRefresh={refreshPreview}
            isRefreshing={isRefreshing}
            requestError={requestError}
          />
        </div>
      </div>
    </section>
  );
}
