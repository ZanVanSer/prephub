import { ImagePrepModulePage } from "@/components/module/image-prep-module-page";
import { requireModuleAccess } from "@/lib/modules/guards";

export default async function ImagePrepPage() {
  await requireModuleAccess("image-prep");

  return <ImagePrepModulePage />;
}
