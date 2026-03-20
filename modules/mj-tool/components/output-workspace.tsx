"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CodeViewer } from "@/modules/mj-tool/components/output/code-viewer";
import { EmptyOutputState } from "@/modules/mj-tool/components/output/empty-output-state";
import { OutputActions } from "@/modules/mj-tool/components/output/output-actions";
import { OutputTabs } from "@/modules/mj-tool/components/output/output-tabs";
import { useToast } from "@/modules/mj-tool/components/toast-provider";
import { STORAGE_KEYS } from "@/modules/mj-tool/lib/storage";

type OutputTab = "generated" | "minified";

export function OutputWorkspace() {
  const { showToast } = useToast();
  const [html, setHtml] = useState("");
  const [minifiedHtml, setMinifiedHtml] = useState("");
  const [activeTab, setActiveTab] = useState<OutputTab>("generated");
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMinifying, setIsMinifying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const storedHtml = window.sessionStorage.getItem(STORAGE_KEYS.html) ?? "";

    setHtml(storedHtml);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopy() {
    setActionError(null);

    try {
      await navigator.clipboard.writeText(currentHtml);
      setCopied(true);
      showToast("HTML copied to clipboard.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to copy HTML";
      setActionError(message);
      showToast(message, "error");
    }
  }

  async function handleMinify() {
    if (!html) {
      return;
    }

    setIsMinifying(true);
    setActionError(null);

    try {
      const response = await fetch("/api/mj-tool/minify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html }),
      });

      const data = (await response.json()) as { html?: string; error?: string };

      if (!response.ok || !data.html) {
        throw new Error(data.error ?? "Failed to minify HTML");
      }

      setMinifiedHtml(data.html);
      setActiveTab("minified");
      showToast("Minified HTML generated.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to minify HTML";
      setActionError(message);
      showToast(message, "error");
    } finally {
      setIsMinifying(false);
    }
  }

  function handleDownload() {
    if (!currentHtml) {
      return;
    }

    setActionError(null);

    try {
      const blob = new Blob([currentHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = activeTab === "generated" ? "mj-tool-output.html" : "mj-tool-output.min.html";
      link.click();

      URL.revokeObjectURL(url);
      showToast("HTML download started.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to download HTML";
      setActionError(message);
      showToast(message, "error");
    }
  }

  function handleOpenExternal() {
    if (!currentHtml) {
      return;
    }

    setActionError(null);

    try {
      const blob = new Blob([currentHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Opened HTML in a new tab.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to open HTML in new tab";
      setActionError(message);
      showToast(message, "error");
    }
  }

  const currentHtml = activeTab === "generated" ? html : minifiedHtml || html;
  const htmlSizeKb = currentHtml
    ? `${Math.round(new Blob([currentHtml]).size / 1024)} KB`
    : "0 KB";

  if (isLoaded && !html) {
    return <EmptyOutputState />;
  }

  return (
    <section className="space-y-5">
      <div className="border border-[var(--color-border)] bg-white p-6">
        <div className="flex flex-col gap-6">
          <OutputTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            minifiedReady={Boolean(minifiedHtml)}
          />

          <OutputActions
            htmlSizeKb={htmlSizeKb}
            copied={copied}
            isMinifying={isMinifying}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onMinify={handleMinify}
          />

          {actionError ? (
            <div className="rounded-[6px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {actionError}
            </div>
          ) : null}

          <CodeViewer code={currentHtml} />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleOpenExternal}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Open in External Editor
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-[15px] leading-6 text-slate-500">
        Need a fresh conversion first? Return to the{" "}
        <Link href="/" className="font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-strong)]">
          editor
        </Link>
        .
      </div>
    </section>
  );
}
