import { BackgroundRemoverModulePage } from "@/components/module/background-remover-module-page";
import { requireModuleAccess } from "@/lib/modules/guards";

export default async function BackgroundRemoverPage() {
  await requireModuleAccess("background-remover");

  return <BackgroundRemoverModulePage />;
}
