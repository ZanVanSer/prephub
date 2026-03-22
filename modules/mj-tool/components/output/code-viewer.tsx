type CodeViewerProps = {
  code: string;
};

export function CodeViewer({ code }: CodeViewerProps) {
  const lines = code.split("\n");

  return (
    <div className="mj-code-viewer">
      <div className="grid max-h-[70vh] min-h-[520px] grid-cols-[auto_1fr] overflow-auto">
        <div className="mj-code-viewer__gutter">
          {lines.map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>

        <pre className="mj-code-viewer__content">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
