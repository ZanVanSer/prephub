import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";

export function EmptyOutputState() {
  return (
    <section>
      <SurfaceCard>
        <EmptyState title="No HTML yet" action={<ButtonLink href="/mj-tool" variant="primary">Back to editor</ButtonLink>} />
      </SurfaceCard>
    </section>
  );
}
