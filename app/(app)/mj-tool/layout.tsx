import { ModuleFrame } from "@/components/module/module-frame";
import { MjToolNav } from "@/components/module/mj-tool-nav";
import { requireModuleAccess } from "@/lib/modules/guards";
import { ToastProvider } from "@/modules/mj-tool/components/toast-provider";

export default async function MjToolLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireModuleAccess("mj-tool");

  return (
    <ToastProvider>
      <ModuleFrame title="MJML Tool" description="">
        <MjToolNav />
        {children}
      </ModuleFrame>
    </ToastProvider>
  );
}
