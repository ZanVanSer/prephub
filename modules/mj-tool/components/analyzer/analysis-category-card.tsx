"use client";

import { useState } from "react";

import type { AnalyzerCategory } from "@/modules/mj-tool/types/analyzer";

type AnalysisCategoryCardProps = {
  category: AnalyzerCategory;
  expanded: boolean;
  onToggle: () => void;
};

const STATUS_STYLES = {
  pass: "bg-[rgba(95,139,112,0.12)] text-[var(--success)]",
  warning: "bg-[rgba(182,131,59,0.12)] text-[var(--warning)]",
  error: "bg-[rgba(187,91,101,0.12)] text-[var(--danger)]",
} as const;

export function AnalysisCategoryCard({
  category,
  expanded,
  onToggle,
}: AnalysisCategoryCardProps) {
  const [expandedChecks, setExpandedChecks] = useState<string[]>([]);

  function toggleCheck(checkId: string) {
    setExpandedChecks((current) =>
      current.includes(checkId)
        ? current.filter((id) => id !== checkId)
        : [...current, checkId],
    );
  }

  return (
    <div className="mj-analysis-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left"
      >
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">{category.name}</h3>
          <p className="mt-1 text-[14px] leading-6 text-[var(--text-secondary)]">{category.summary}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              STATUS_STYLES[category.status]
            }`}
          >
            {category.status === "pass"
              ? "Passed"
              : category.status === "warning"
                ? "Action Required"
                : "Critical"}
          </span>
          <span className="text-[var(--text-secondary)]">{expanded ? "⌃" : "⌄"}</span>
        </div>
      </button>

      {expanded ? (
        <div className="px-5 py-4">
          <div className="space-y-4">
            {category.checks.map((check) => (
              <div key={check.id} className="rounded-[24px] bg-[var(--surface-low)] px-4 py-3.5">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-2 h-2 w-2 ${
                      check.status === "pass"
                        ? "bg-emerald-500"
                        : check.status === "warning"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    }`}
                  />
                  <div className="min-w-0 space-y-2">
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                        {check.name}
                      </p>
                      <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
                        {check.message}
                      </p>
                    </div>
                    {check.flagged?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {check.flagged.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-[rgba(182,131,59,0.12)] px-2.5 py-1 text-xs text-[var(--warning)]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {check.findings?.length ? (
                      <div className="space-y-3 pt-1">
                        <button
                          type="button"
                          onClick={() => toggleCheck(check.id)}
                          className="text-sm text-[var(--primary)] transition-colors"
                        >
                          {expandedChecks.includes(check.id)
                            ? `Hide ${check.findings.length} issue details`
                            : `Show ${check.findings.length} issue details`}
                        </button>

                        {expandedChecks.includes(check.id) ? (
                          <div className="space-y-3">
                            {check.findings.map((finding) => (
                              <div key={finding.id} className="rounded-[20px] bg-white px-4 py-3">
                                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                                  <span>{finding.label ?? "Finding"}</span>
                                  {finding.line ? <span>Line {finding.line}</span> : null}
                                </div>
                                <pre className="mj-code-snippet">
                                  <code>{finding.snippet}</code>
                                </pre>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
