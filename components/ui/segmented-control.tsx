import { cn } from "@/lib/utils";

export type SegmentedControlItem<T extends string> = {
  value: T;
  label: string;
  count?: number | string;
  disabled?: boolean;
  accent?: "default" | "primary";
  width?: "auto" | "fixed-refresh";
};

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  className,
  groupClassName,
}: {
  items: SegmentedControlItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  groupClassName?: string;
}) {
  return (
    <div className={cn("ui-segmented", groupClassName)}>
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              "ui-segmented__button",
              isActive && "ui-segmented__button--active",
              item.accent === "primary" && "ui-segmented__button--primary",
              item.width === "fixed-refresh" && "ui-segmented__button--fixed-refresh",
              className
            )}
          >
            <span className="ui-segmented__label">{item.label}</span>
            {item.count !== undefined ? (
              <span className="ui-segmented__count">{item.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
