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
    <div className="mj-editor-panel xl:min-h-[760px]">
      <div className="mj-panel-header">
        <div>
          <h2 className="mj-panel-title">{title}</h2>
          <p className="mj-panel-meta">
            {isRefreshing ? "Refreshing preview" : languageLabel}
          </p>
        </div>
      </div>

      <div className="mj-editor-frame">
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
          className="h-full text-sm mj-codemirror"
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
    <div className={tone === "error" ? "mj-issue-box mj-issue-box--error" : "mj-issue-box mj-issue-box--warning"}>
      <div className="mb-2 flex items-center gap-2">
        <span className={tone === "error" ? "h-2 w-2 bg-rose-400" : "h-2 w-2 bg-amber-400"} />
        <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="space-y-1">
            <p className="text-sm leading-6 text-[var(--text-primary)]">
              {item.line ? `Line ${item.line}: ` : ""}
              {item.message}
            </p>
            {item.snippet ? (
              <pre className="mj-code-snippet">
                <code>{item.snippet}</code>
              </pre>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
