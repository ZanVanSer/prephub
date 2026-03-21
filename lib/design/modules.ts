export type ToolModule = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: "dashboard" | "image" | "mail";
};

export const TOOL_MODULES: ToolModule[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    description: "Overview of your available tools.",
    icon: "dashboard"
  },
  {
    href: "/image-prep",
    label: "Image Prep",
    shortLabel: "Image Prep",
    description: "Prepare email and newsletter images with ready-to-use export presets.",
    icon: "image"
  },
  {
    href: "/mj-tool",
    label: "MJML Tool",
    shortLabel: "MJML Tool",
    description: "Build, preview, convert, and review MJML email templates in one place.",
    icon: "mail"
  }
];

export const MJ_TOOL_TABS = [
  { href: "/mj-tool", label: "MJML Preview" },
  { href: "/mj-tool/output", label: "MJML to HTML" },
  { href: "/mj-tool/html-preview", label: "HTML Preview" },
  { href: "/mj-tool/analyze", label: "Analyze" },
  { href: "/mj-tool/settings", label: "Settings" }
] as const;
