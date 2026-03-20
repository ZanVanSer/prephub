import Link from "next/link";

export function AnalysisEmptyState() {
  return (
    <section>
      <div className="surface-card">
        <div className="max-w-xl space-y-4">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Nothing to analyze
          </h1>
          <Link
            href="/mj-tool"
            className="button button--primary"
          >
            Back to editor
          </Link>
        </div>
      </div>
    </section>
  );
}
