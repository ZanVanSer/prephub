type CodeViewerProps = {
  code: string;
};

export function CodeViewer({ code }: CodeViewerProps) {
  const lines = code.split("\n");

  return (
    <div className="overflow-hidden border border-[var(--color-border)] bg-white">
      <div className="grid max-h-[70vh] min-h-[520px] grid-cols-[auto_1fr] overflow-auto">
        <div className="sticky left-0 border-r border-[var(--color-border)] bg-slate-50 px-4 py-5 font-mono text-sm leading-8 text-slate-400">
          {lines.map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>

        <pre className="overflow-auto px-6 py-5 font-mono text-sm leading-8 text-slate-700">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
