import CodeMirror from "@uiw/react-codemirror";
import { xml } from "@codemirror/lang-xml";
import { oneDark } from "@codemirror/theme-one-dark";

import type { MjmlIssue } from "@/modules/mj-tool/types/conversion";

type EditorPanelProps = {
  code: string;
  onCodeChange: (value: string) => void;
  title: string;
  languageLabel: string;
  errors: MjmlIssue[];
  warnings: MjmlIssue[];
  requestError: string | null;
  isRefreshing: boolean;
};

export function EditorPanel({
  code,
  onCodeChange,
  title,
  languageLabel,
  errors,
  warnings,
  requestError,
  isRefreshing,
}: EditorPanelProps) {
  const hasIssues = Boolean(requestError) || errors.length > 0 || warnings.length > 0;

  return (
    <div className="overflow-hidden border border-[var(--color-border)] bg-slate-950 xl:h-[calc(100vh-11rem)] xl:min-h-[760px]">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
        <div>
          <h2 className="text-[15px] font-semibold text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {isRefreshing ? "Refreshing preview" : languageLabel}
          </p>
        </div>
      </div>

      <div className="relative min-h-[620px] overflow-hidden xl:h-[calc(100%-3.75rem)] xl:min-h-0">
        <CodeMirror
          value={code}
          height="100%"
          extensions={[xml()]}
          theme={oneDark}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
          }}
          onChange={(value) => onCodeChange(value)}
          className="h-full text-sm"
        />
        {hasIssues ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 py-5">
            <div className="pointer-events-auto max-h-[70%] w-full max-w-xl space-y-2 overflow-auto">
              {requestError ? (
                <IssueBox
                  tone="error"
                  title="Conversion failed"
                  items={[{ id: "request-error", message: requestError, type: "error" }]}
                />
              ) : null}

              {errors.length > 0 ? (
                <IssueBox tone="error" title="MJML errors" items={errors} />
              ) : null}

              {warnings.length > 0 ? (
                <IssueBox tone="warning" title="MJML warnings" items={warnings} />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type IssueBoxProps = {
  title: string;
  items: MjmlIssue[];
  tone: "error" | "warning";
};

function IssueBox({ title, items, tone }: IssueBoxProps) {
  return (
    <div
      className={`rounded-[6px] border px-4 py-3 ${
        tone === "error"
          ? "border-rose-800/80 bg-slate-950/90"
          : "border-amber-700/80 bg-slate-950/90"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`h-2 w-2 ${
            tone === "error" ? "bg-rose-400" : "bg-amber-300"
          }`}
        />
        <p
          className={`text-sm font-semibold ${
            tone === "error" ? "text-rose-200" : "text-amber-200"
          }`}
        >
          {title}
        </p>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="space-y-1">
            <p
              className={`text-sm leading-6 ${
                tone === "error" ? "text-rose-100/90" : "text-amber-100/90"
              }`}
            >
              {item.line ? `Line ${item.line}: ` : ""}
              {item.message}
            </p>
            {item.snippet ? (
              <pre className="overflow-x-auto rounded-[4px] border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs leading-6 text-slate-200">
                <code>{item.snippet}</code>
              </pre>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
