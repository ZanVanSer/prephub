"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SurfaceCard } from "@/components/ui/surface-card";
import { AnalysisCategoryCard } from "@/modules/mj-tool/components/analyzer/analysis-category-card";
import { AnalysisEmptyState } from "@/modules/mj-tool/components/analyzer/analysis-empty-state";
import { AnalysisStatCard } from "@/modules/mj-tool/components/analyzer/analysis-stat-card";
import { useToast } from "@/modules/mj-tool/components/toast-provider";
import { STORAGE_KEYS } from "@/modules/mj-tool/lib/storage";
import { DEFAULT_SETTINGS, normalizeSettings } from "@/modules/mj-tool/lib/settings";
import type { AnalyzeResponse, AnalyzerSettings } from "@/modules/mj-tool/types/analyzer";

export function AnalyzeWorkspace() {
  const { showToast } = useToast();
  const [html, setHtml] = useState("");
  const [mjmlHtml, setMjmlHtml] = useState("");
  const [htmlPreviewSource, setHtmlPreviewSource] = useState("");
  const [source, setSource] = useState<"mjml" | "html">("mjml");
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    const storedMjmlHtml = window.sessionStorage.getItem(STORAGE_KEYS.html) ?? "";
    const storedHtmlPreview =
      window.sessionStorage.getItem(STORAGE_KEYS.htmlPreview) ?? "";

    setMjmlHtml(storedMjmlHtml);
    setHtmlPreviewSource(storedHtmlPreview);
    setSource(storedMjmlHtml ? "mjml" : "html");
    setHtml(storedMjmlHtml || storedHtmlPreview);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const selectedHtml = source === "mjml" ? mjmlHtml : htmlPreviewSource;
    setHtml(selectedHtml);
  }, [source, mjmlHtml, htmlPreviewSource]);

  useEffect(() => {
    if (!isLoaded || !html) {
      return;
    }

    void runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, html]);

  async function runAnalysis() {
    if (!html) {
      return;
    }

    setIsLoading(true);
    setRequestError(null);

    try {
      const rawSettings = window.localStorage.getItem(STORAGE_KEYS.settings);
      const settings = normalizeSettings(
        rawSettings ? (JSON.parse(rawSettings) as Partial<AnalyzerSettings>) : DEFAULT_SETTINGS,
      );

      const response = await fetch("/api/mj-tool/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html, settings }),
      });

      const data = (await response.json()) as AnalyzeResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to analyze HTML");
      }

      setAnalysis(data);
      setExpandedIds(
        data.categories
          .filter((category) => category.status !== "pass")
          .map((category) => category.id),
      );
      setTimestamp(new Date().toLocaleString());
      window.sessionStorage.setItem(STORAGE_KEYS.analysis, JSON.stringify(data));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to analyze HTML";
      setRequestError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleCategory(categoryId: string) {
    setExpandedIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  function toggleExpandAll() {
    if (!analysis) {
      return;
    }

    setExpandedIds((current) =>
      current.length === analysis.categories.length
        ? []
        : analysis.categories.map((category) => category.id),
    );
  }

  if (isLoaded && !html) {
    return <AnalysisEmptyState />;
  }

  return (
    <section>
      <SurfaceCard className="flex flex-col gap-6">
        <SegmentedControl
          items={[
            { value: "mjml", label: "MJML Preview", disabled: !mjmlHtml },
            { value: "html", label: "HTML Preview", disabled: !htmlPreviewSource },
          ]}
          value={source}
          onChange={setSource}
          groupClassName="self-start"
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="text-[14px] text-[var(--text-secondary)]">{timestamp ? `Last analyzed: ${timestamp}` : ""}</div>
          <Button
            variant="primary"
            onClick={() => void runAnalysis()}
            disabled={isLoading || !html}
          >
            {isLoading ? "Running Analysis..." : "Re-run Analysis"}
          </Button>
        </div>

        {requestError ? (
          <div className="rounded-[20px] bg-[rgba(187,91,101,0.12)] px-4 py-3 text-sm text-[var(--danger)]">
            {requestError}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AnalysisStatCard
            label="Overall Score"
            value={analysis ? `${analysis.score.toFixed(1)} / 10` : "--"}
            tone="neutral"
            isLoading={isLoading}
          />
          <AnalysisStatCard
            label="Passed Checks"
            value={analysis ? String(analysis.passedChecks) : "--"}
            tone="success"
            isLoading={isLoading}
          />
          <AnalysisStatCard
            label="Warnings"
            value={analysis ? String(analysis.warnings) : "--"}
            tone="warning"
            isLoading={isLoading}
          />
          <AnalysisStatCard
            label="Critical Errors"
            value={analysis ? String(analysis.criticalErrors) : "--"}
            tone="danger"
            isLoading={isLoading}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div />
          <button
            type="button"
            onClick={toggleExpandAll}
            disabled={!analysis}
            className="text-sm text-[var(--primary)] transition-colors disabled:cursor-not-allowed disabled:text-slate-300"
          >
            {analysis && expandedIds.length === analysis.categories.length
              ? "Collapse All"
              : "Expand All"}
          </button>
        </div>

        <div className="space-y-3.5">
          {isLoading && !analysis
              ? Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-[24px] bg-[var(--surface-low)]"
                />
              ))
              : analysis?.categories.map((category) => (
                <AnalysisCategoryCard
                  key={category.id}
                  category={category}
                  expanded={expandedIds.includes(category.id)}
                  onToggle={() => toggleCategory(category.id)}
                />
              ))}
        </div>
      </SurfaceCard>
    </section>
  );
}
