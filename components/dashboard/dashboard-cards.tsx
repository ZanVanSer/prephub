import { TOOL_MODULES } from "@/lib/design/modules";
import { ModuleCard } from "@/components/ui/module-card";

export function DashboardCards() {
  const modules = TOOL_MODULES.filter((module) => module.href !== "/dashboard");

  return (
    <section className="space-y-8">
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
        <section className="surface-card p-8 text-[var(--text-secondary)]">No tools available</section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {modules.map((module) => (
            <ModuleCard key={module.href} module={module} />
          ))}
        </div>
      )}
    </section>
  );
}
