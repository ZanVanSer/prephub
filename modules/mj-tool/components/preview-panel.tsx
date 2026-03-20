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
    <div className="overflow-hidden border border-[var(--color-border)] bg-white xl:h-[calc(100vh-11rem)] xl:min-h-[760px]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-3.5">
        <div className="inline-flex overflow-hidden border border-[var(--color-border)] text-sm text-slate-600">
          <button
            type="button"
            onClick={() => onDeviceModeChange("desktop")}
            className={`px-4 py-2.5 transition-colors ${
              deviceMode === "desktop"
                ? "bg-slate-900 text-white"
                : "hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => onDeviceModeChange("mobile")}
            className={`border-l border-[var(--color-border)] px-4 py-2.5 transition-colors ${
              deviceMode === "mobile"
                ? "bg-slate-900 text-white"
                : "hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Mobile
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <button
            type="button"
            onClick={() => onPreviewThemeChange("light")}
            className={`border px-3.5 py-2.5 text-[14px] transition-colors ${
              previewTheme === "light"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-[var(--color-border)] hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => onPreviewThemeChange("dark")}
            className={`border px-3.5 py-2.5 text-[14px] transition-colors ${
              previewTheme === "dark"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-[var(--color-border)] hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border border-[var(--color-border)] px-3.5 py-2.5 text-[14px] transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {requestError ? (
        <div className="mx-5 mt-5 rounded-[6px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {requestError}
        </div>
      ) : null}

      <div
        className={`m-5 rounded-[6px] border border-[var(--color-border)] p-5 xl:flex xl:h-[calc(100%-7rem)] xl:min-h-0 xl:flex-col ${
          previewTheme === "light"
            ? "bg-slate-100"
            : "bg-slate-900"
        }`}
      >
        <div
          className="mx-auto w-full overflow-hidden rounded-[6px] border border-[var(--color-border)] bg-white transition-[width] duration-200 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col"
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
            <div className="flex min-h-[620px] items-center justify-center px-8 text-center xl:min-h-0 xl:flex-1">
              <div className="max-w-md space-y-3">
                <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-slate-900">
                  Refresh to compile your MJML.
                </h2>
                <p className="text-[15px] leading-7 text-slate-500">
                  The preview updates only when you ask for it, so you can edit
                  freely without constant API requests.
                </p>
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
