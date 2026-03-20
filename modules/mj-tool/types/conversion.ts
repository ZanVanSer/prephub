export type MjmlIssue = {
  id: string;
  line?: number;
  message: string;
  type: "error" | "warning";
  snippet?: string;
};

export type ConvertResponse = {
  html: string;
  errors: MjmlIssue[];
  warnings: MjmlIssue[];
};

export type DeviceMode = "desktop" | "mobile";

export type PreviewTheme = "light" | "dark";
