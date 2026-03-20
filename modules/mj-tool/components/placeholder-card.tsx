type PlaceholderCardProps = {
  title: string;
  description: string;
  compact?: boolean;
};

export function PlaceholderCard({
  title,
  description,
  compact = false,
}: PlaceholderCardProps) {
  return (
    <div
      className={`border border-[var(--color-border)] bg-white p-6 ${
        compact ? "min-h-[148px]" : "min-h-[220px]"
      }`}
    >
      <div className="space-y-3">
        <span className="inline-flex border border-[var(--color-border)] bg-slate-50 px-3 py-1 text-xs text-slate-500">
          Coming next
        </span>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="max-w-xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}
