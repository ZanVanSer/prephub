import { SegmentedControl } from "@/components/ui/segmented-control";

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
    <SegmentedControl
      items={[
        { value: "generated", label: "Generated HTML" },
        {
          value: "minified",
          label: "Minified HTML",
          count: minifiedReady ? undefined : "new",
        },
      ]}
      value={activeTab}
      onChange={onTabChange}
    />
  );
}
