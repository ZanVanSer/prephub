"use client";

export function ModuleErrorState({
  title = "Something went wrong in this module",
  description = "Reload the module to try again."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="surface-card surface-card--error">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{title}</h2>
        <p className="text-[15px] leading-7 text-[var(--text-secondary)]">{description}</p>
        <button type="button" className="button button--primary" onClick={() => window.location.reload()}>
          Reload Module
        </button>
      </div>
    </section>
  );
}
