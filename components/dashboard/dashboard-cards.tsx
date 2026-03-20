import { TOOL_MODULES } from "@/lib/design/modules";
import { SectionStack } from "@/components/ui/section-stack";
import { ModuleCard } from "@/components/ui/module-card";
import { SurfaceCard } from "@/components/ui/surface-card";

export function DashboardCards() {
  const modules = TOOL_MODULES.filter((module) => module.href !== "/dashboard");

  return (
    <SectionStack gap="xl">
      <div className="page-hero">
        <div>
          <p className="page-hero__eyebrow">ToolHub Workspace</p>
          <h1 className="page-hero__title">Welcome back</h1>
          <p className="page-hero__description">
            Choose a tool to keep working inside one shared, streamlined workspace.
          </p>
        </div>
      </div>

      {modules.length === 0 ? (
        <SurfaceCard className="p-8 text-[var(--text-secondary)]">No tools available</SurfaceCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {modules.map((module) => (
            <ModuleCard key={module.href} module={module} />
          ))}
        </div>
      )}
    </SectionStack>
  );
}
