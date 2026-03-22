"use client";

import { useEffect, useState } from "react";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { EditorPanel } from "@/modules/mj-tool/components/editor-panel";
import { PreviewPanel } from "@/modules/mj-tool/components/preview-panel";
import { useToast } from "@/modules/mj-tool/components/toast-provider";
import { DEFAULT_SETTINGS, normalizeSettings } from "@/modules/mj-tool/lib/settings";
import { DEFAULT_HTML, STORAGE_KEYS } from "@/modules/mj-tool/lib/storage";
import type { AnalyzerSettings } from "@/modules/mj-tool/types/analyzer";
import type { DeviceMode, PreviewTheme } from "@/modules/mj-tool/types/conversion";

export function HtmlPreviewWorkspace() {
  const { showToast } = useToast();
  const [htmlInput, setHtmlInput] = useState(DEFAULT_HTML);
  const [previewHtml, setPreviewHtml] = useState("");
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
    const storedHtml = window.sessionStorage.getItem(STORAGE_KEYS.htmlPreview);
    const rawSettings = window.localStorage.getItem(STORAGE_KEYS.settings);

    if (storedHtml) {
      setHtmlInput(storedHtml);
      setPreviewHtml(storedHtml);
    } else {
      setPreviewHtml(DEFAULT_HTML);
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

    window.sessionStorage.setItem(STORAGE_KEYS.htmlPreview, htmlInput);
  }, [htmlInput, isLoaded]);

  function refreshPreview() {
    setIsRefreshing(true);
    setRequestError(null);

    try {
      if (!htmlInput.trim()) {
        throw new Error("No HTML provided");
      }

      setPreviewHtml(htmlInput);
      showToast("HTML preview updated.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to preview HTML";
      setRequestError(message);
      showToast(message, "error");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <section className="mj-workspace">
      <div className="mb-5 flex lg:hidden">
        <SegmentedControl
          items={[
            { value: "editor", label: "Editor" },
            { value: "preview", label: "Preview" },
          ]}
          value={mobilePane}
          onChange={setMobilePane}
          groupClassName="mj-mobile-toggle"
          className="mj-mobile-toggle__button"
        />
      </div>

      <div className="mj-split-grid">
        <div className={mobilePane === "preview" ? "hidden lg:block" : ""}>
          <EditorPanel
            code={htmlInput}
            onCodeChange={setHtmlInput}
            title="HTML Editor"
            languageLabel="html"
            errors={[]}
            warnings={[]}
            requestError={requestError}
            isRefreshing={isRefreshing}
          />
        </div>
        <div className={mobilePane === "editor" ? "hidden lg:block" : ""}>
          <PreviewPanel
            html={previewHtml}
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
