import { ModuleFrame } from "@/components/module/module-frame";
import { getSupabaseServerClient } from "@/lib/auth/supabase-server";
import { WorkspaceClient } from "@/modules/background-remover/components/workspace-client";

export async function BackgroundRemoverModulePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return (
    <ModuleFrame title="BG Remover" description="">
      <WorkspaceClient initialSession={session} />
    </ModuleFrame>
  );
}
