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
    <div className="mj-chip-group">
      <button
        type="button"
        onClick={() => onTabChange("generated")}
        className={activeTab === "generated" ? "mj-chip mj-chip--active" : "mj-chip"}
      >
        Generated HTML
      </button>

      <button
        type="button"
        onClick={() => onTabChange("minified")}
        className={activeTab === "minified" ? "mj-chip mj-chip--active" : "mj-chip"}
      >
        Minified HTML
        {!minifiedReady ? (
          <span className="ml-2 rounded-full bg-[var(--surface)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
            create first
          </span>
        ) : null}
      </button>
    </div>
  );
}
