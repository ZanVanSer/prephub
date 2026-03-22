import { ModuleFrame } from "@/components/module/module-frame";
import { MjToolNav } from "@/components/module/mj-tool-nav";
import { ToastProvider } from "@/modules/mj-tool/components/toast-provider";

export default function MjToolLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <ModuleFrame title="MJML Tool" description="">
        <MjToolNav />
        {children}
      </ModuleFrame>
    </ToastProvider>
  );
}
