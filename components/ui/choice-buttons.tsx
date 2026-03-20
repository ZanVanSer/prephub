import { cn } from "@/lib/utils";

export type ChoiceButtonItem<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export function ChoiceButtons<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: ChoiceButtonItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("ui-choice-grid", className)}>
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn("ui-choice-button", isActive && "ui-choice-button--active")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
