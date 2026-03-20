type OutputTab = "generated" | "minified";

type OutputTabsProps = {
  activeTab: OutputTab;
  onTabChange: (tab: OutputTab) => void;
  minifiedReady: boolean;
};

export function OutputTabs({
  activeTab,
  onTabChange,
  minifiedReady,
}: OutputTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 border-b border-slate-200 pb-3.5">
      <button
        type="button"
        onClick={() => onTabChange("generated")}
        className={`relative pb-2 text-[15px] font-medium transition-colors ${
          activeTab === "generated"
            ? "text-slate-950"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        Generated HTML
        {activeTab === "generated" ? (
          <span className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-[var(--color-brand)]" />
        ) : null}
      </button>

      <button
        type="button"
        onClick={() => onTabChange("minified")}
        className={`relative pb-2 text-[15px] font-medium transition-colors ${
          activeTab === "minified"
            ? "text-slate-950"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        Minified HTML
        {!minifiedReady ? (
          <span className="ml-2 border border-[var(--color-border)] bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
            create first
          </span>
        ) : null}
        {activeTab === "minified" ? (
          <span className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-[var(--color-brand)]" />
        ) : null}
      </button>
    </div>
  );
}
