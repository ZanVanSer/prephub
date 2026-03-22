import type { ToolModule } from "@/lib/design/modules";
import { DashboardIcon, ImageIcon, MailIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/button";

function ModuleGlyph({ icon }: { icon: ToolModule["icon"] }) {
  if (icon === "image") {
    return <ImageIcon />;
  }

  if (icon === "mail") {
    return <MailIcon />;
  }

  return <DashboardIcon />;
}

export function ModuleCard({ module }: { module: ToolModule }) {
  return (
    <article className="tool-card">
      <div className="tool-card__icon">
        <ModuleGlyph icon={module.icon} />
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="tool-card__eyebrow">{module.shortLabel}</p>
          <h2 className="tool-card__title">{module.label}</h2>
          <p className="tool-card__description">{module.description}</p>
        </div>
        <ButtonLink href={module.href} className="self-start">
          Open
        </ButtonLink>
      </div>
    </article>
  );
}
