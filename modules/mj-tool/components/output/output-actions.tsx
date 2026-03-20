import { Button } from "@/components/ui/button";

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
        <Button variant="primary" onClick={onCopy}>
          {copied ? "Copied!" : "Copy HTML"}
        </Button>

        <Button onClick={onDownload}>
          Download HTML
        </Button>

        <Button onClick={onMinify} disabled={isMinifying}>
          {isMinifying ? "Minifying..." : "Minify HTML"}
        </Button>
      </div>

      <div className="mj-size-pill">
        {htmlSizeKb}
      </div>
    </div>
  );
}
