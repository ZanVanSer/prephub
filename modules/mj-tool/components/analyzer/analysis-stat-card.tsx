type AnalysisStatCardProps = {
  label: string;
  value: string;
  tone: "neutral" | "success" | "warning" | "danger";
  isLoading: boolean;
};

const TONE_STYLES = {
  neutral: "text-slate-950",
  success: "text-emerald-700",
  warning: "text-amber-600",
  danger: "text-rose-700",
} as const;

export function AnalysisStatCard({
  label,
  value,
  tone,
  isLoading,
}: AnalysisStatCardProps) {
  return (
    <div className="rounded-[6px] border border-[var(--color-border)] bg-slate-50 px-5 py-4.5">
      <p className="text-[13px] font-medium text-slate-500">{label}</p>
      <div className="mt-3">
        {isLoading ? (
          <div className="h-9 w-24 animate-pulse rounded-[4px] bg-slate-200" />
        ) : (
          <p className={`text-[30px] font-semibold tracking-[-0.02em] ${TONE_STYLES[tone]}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
