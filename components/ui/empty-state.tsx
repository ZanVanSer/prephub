import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ui-empty-state", className)}>
      <p className="ui-empty-state__title">{title}</p>
      {action ? <div className="ui-empty-state__action">{action}</div> : null}
    </div>
  );
}
