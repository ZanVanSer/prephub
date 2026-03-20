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
          className="button button--primary"
        >
          {copied ? "Copied!" : "Copy HTML"}
        </button>

        <button
          type="button"
          onClick={onDownload}
          className="button button--secondary"
        >
          Download HTML
        </button>

        <button
          type="button"
          onClick={onMinify}
          disabled={isMinifying}
          className="button button--secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isMinifying ? "Minifying..." : "Minify HTML"}
        </button>
      </div>

      <div className="mj-size-pill">
        {htmlSizeKb}
      </div>
    </div>
  );
}
