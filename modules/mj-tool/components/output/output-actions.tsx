type OutputActionsProps = {
  htmlSizeKb: string;
  copied: boolean;
  isMinifying: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onMinify: () => void;
};

export function OutputActions({
  htmlSizeKb,
  copied,
  isMinifying,
  onCopy,
  onDownload,
  onMinify,
}: OutputActionsProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center rounded-[6px] border border-slate-900 bg-slate-900 px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-slate-800"
        >
          {copied ? "Copied!" : "Copy HTML"}
        </button>

        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center rounded-[6px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
        >
          Download HTML
        </button>

        <button
          type="button"
          onClick={onMinify}
          disabled={isMinifying}
          className="inline-flex items-center rounded-[6px] border border-[var(--color-border)] bg-slate-50 px-4 py-2.5 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isMinifying ? "Minifying..." : "Minify HTML"}
        </button>
      </div>

      <div className="inline-flex items-center rounded-[6px] border border-[var(--color-border)] bg-slate-50 px-4 py-2.5 text-[14px] text-slate-600">
        HTML Size: {htmlSizeKb}
      </div>
    </div>
  );
}
