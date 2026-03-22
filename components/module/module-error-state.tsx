"use client";

import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";

export function ModuleErrorState({
  title = "Something went wrong in this module",
  description = "Reload the module to try again."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <SurfaceCard tone="error">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{title}</h2>
        <p className="text-[15px] leading-7 text-[var(--text-secondary)]">{description}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Reload Module
        </Button>
      </div>
    </SurfaceCard>
  );
}
