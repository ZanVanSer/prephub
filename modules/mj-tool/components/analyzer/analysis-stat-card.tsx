type AnalysisStatCardProps = {
  label: string;
  value: string;
  tone: "neutral" | "success" | "warning" | "danger";
  isLoading: boolean;
};

const TONE_STYLES = {
  neutral: "text-[var(--text-primary)]",
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
    <div className="mj-stat-card">
      <p className="text-[13px] text-[var(--text-secondary)]">{label}</p>
      <div className="mt-3">
        {isLoading ? (
          <div className="h-9 w-24 animate-pulse rounded-[10px] bg-[var(--surface-low)]" />
        ) : (
          <p className={`text-[30px] font-semibold tracking-[-0.02em] ${TONE_STYLES[tone]}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
