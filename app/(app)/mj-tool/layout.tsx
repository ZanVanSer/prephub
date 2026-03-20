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
      <ModuleFrame
        title="MJ Tool"
        description="Write MJML, preview output, inspect HTML, and run analysis without leaving ToolHub."
      >
        <MjToolNav />
        {children}
      </ModuleFrame>
    </ToastProvider>
  );
}
