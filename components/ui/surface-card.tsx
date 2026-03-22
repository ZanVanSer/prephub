import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SurfaceCardProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  tone?: "default" | "error" | "muted";
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function SurfaceCard<T extends ElementType = "section">({
  as,
  children,
  className,
  tone = "default",
  ...props
}: SurfaceCardProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      className={cn(
        "surface-card",
        tone === "error" && "surface-card--error",
        tone === "muted" && "surface-card--muted",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
