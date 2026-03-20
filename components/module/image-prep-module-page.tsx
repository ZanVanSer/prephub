import { WorkspaceClient } from "@/modules/image-prep/components/workspace-client";
import { ModuleFrame } from "@/components/module/module-frame";
import { getSupabaseServerClient } from "@/lib/auth/supabase-server";

export async function ImagePrepModulePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return (
    <ModuleFrame
      title="Image Prep"
      description="Upload, process, and export cleaner email-ready image batches without leaving ToolHub."
    >
      <WorkspaceClient initialSession={session} />
    </ModuleFrame>
  );
}
