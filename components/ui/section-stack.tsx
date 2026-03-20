import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionStack({
  children,
  gap = "lg",
  className,
}: {
  children: ReactNode;
  gap?: "md" | "lg" | "xl";
  className?: string;
}) {
  return <div className={cn("ui-stack", `ui-stack--${gap}`, className)}>{children}</div>;
}
