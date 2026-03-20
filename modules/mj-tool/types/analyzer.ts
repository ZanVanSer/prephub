export type AnalyzerStatus = "pass" | "warning" | "error";

export type AnalyzerFinding = {
  id: string;
  line?: number;
  label?: string;
  snippet: string;
};

export type AnalyzerCheck = {
  id: string;
  name: string;
  status: AnalyzerStatus;
  message: string;
  deduction?: number;
  flagged?: string[];
  findings?: AnalyzerFinding[];
};

export type AnalyzerCategory = {
  id: string;
  name: string;
  status: AnalyzerStatus;
  summary: string;
  checks: AnalyzerCheck[];
};

export type AnalyzeResponse = {
  score: number;
  passedChecks: number;
  warnings: number;
  criticalErrors: number;
  categories: AnalyzerCategory[];
};

export type AnalyzerSettings = {
  previewWidth: number;
  previewDevice: "desktop" | "mobile";
  previewTheme: "light" | "dark";
  htmlSizeWarningKb: number;
  imageWeightWarningMb: number;
  spamSensitivity: "low" | "medium" | "high";
  linkCheckEnabled: boolean;
};
