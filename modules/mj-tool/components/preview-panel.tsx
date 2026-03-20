import type { DeviceMode, PreviewTheme } from "@/modules/mj-tool/types/conversion";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";

type PreviewPanelProps = {
  html: string;
  previewWidth: number;
  deviceMode: DeviceMode;
  onDeviceModeChange: (value: DeviceMode) => void;
  previewTheme: PreviewTheme;
  onPreviewThemeChange: (value: PreviewTheme) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  requestError: string | null;
};

export function PreviewPanel({
  html,
  previewWidth,
  deviceMode,
  onDeviceModeChange,
  previewTheme,
  onPreviewThemeChange,
  onRefresh,
  isRefreshing,
  requestError,
}: PreviewPanelProps) {
  const frameWidth = deviceMode === "desktop" ? `${previewWidth}px` : "375px";
  const hasHtml = html.trim().length > 0;
  const previewHtml = hasHtml ? applyPreviewTheme(html, previewTheme) : "";

  return (
    <div className="mj-preview-panel xl:min-h-[760px]">
      <div className="mj-panel-header mj-panel-header--wrap">
        <SegmentedControl
          items={[
            { value: "desktop", label: "Desktop" },
            { value: "mobile", label: "Mobile" },
          ]}
          value={deviceMode}
          onChange={onDeviceModeChange}
        />

        <div className="flex flex-wrap gap-3">
          <SegmentedControl
            items={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            value={previewTheme}
            onChange={onPreviewThemeChange}
          />
          <Button
            variant="primary"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="ui-segmented__button ui-segmented__button--fixed-refresh px-0"
          >
            <span className="truncate">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {requestError ? (
        <div className="mx-5 mt-5 rounded-[20px] bg-[rgba(187,91,101,0.12)] px-4 py-3 text-sm text-[var(--danger)]">
          {requestError}
        </div>
      ) : null}

      <div className={previewTheme === "light" ? "mj-preview-stage mj-preview-stage--light" : "mj-preview-stage mj-preview-stage--dark"}>
        <div
          className="mj-preview-frame"
          style={{ width: frameWidth, maxWidth: "100%" }}
        >
          {hasHtml ? (
            <iframe
              title="MJML preview"
              srcDoc={previewHtml}
              className={`min-h-[620px] w-full xl:min-h-0 xl:flex-1 ${
                previewTheme === "dark" ? "bg-slate-950" : "bg-white"
              }`}
            />
          ) : (
            <div className="mj-preview-empty">
              <div className="max-w-md">
                <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                  Refresh to compile
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function applyPreviewTheme(html: string, theme: PreviewTheme) {
  if (theme === "light") {
    return html;
  }

  const darkModeStyles = `
    <style id="mj-tool-dark-preview">
      html {
        background: #020817 !important;
      }
      body {
        background: #020817 !important;
        filter: invert(1) hue-rotate(180deg);
        transform-origin: top left;
      }
      img, picture, video, svg {
        filter: invert(1) hue-rotate(180deg) !important;
      }
    </style>
  `;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${darkModeStyles}</head>`);
  }

  return `${darkModeStyles}${html}`;
}
