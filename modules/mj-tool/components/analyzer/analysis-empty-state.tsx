import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";

export function AnalysisEmptyState() {
  return (
    <section>
      <SurfaceCard>
        <EmptyState title="Nothing to analyze" action={<ButtonLink href="/mj-tool" variant="primary">Back to editor</ButtonLink>} />
      </SurfaceCard>
    </section>
  );
}
