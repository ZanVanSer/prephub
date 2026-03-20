import type { DeviceMode, PreviewTheme } from "@/modules/mj-tool/types/conversion";

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
        <div className="mj-chip-group">
          <button
            type="button"
            onClick={() => onDeviceModeChange("desktop")}
            className={deviceMode === "desktop" ? "mj-chip mj-chip--active" : "mj-chip"}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => onDeviceModeChange("mobile")}
            className={deviceMode === "mobile" ? "mj-chip mj-chip--active" : "mj-chip"}
          >
            Mobile
          </button>
        </div>

        <div className="mj-chip-group">
          <button
            type="button"
            onClick={() => onPreviewThemeChange("light")}
            className={previewTheme === "light" ? "mj-chip mj-chip--active" : "mj-chip"}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => onPreviewThemeChange("dark")}
            className={previewTheme === "dark" ? "mj-chip mj-chip--active" : "mj-chip"}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="mj-chip mj-chip--primary mj-chip--refresh disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
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
