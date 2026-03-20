import type { AnalyzerSettings } from "@/modules/mj-tool/types/analyzer";

export const DEFAULT_SETTINGS: AnalyzerSettings = {
  previewWidth: 600,
  previewDevice: "desktop",
  previewTheme: "light",
  htmlSizeWarningKb: 102,
  imageWeightWarningMb: 1.5,
  spamSensitivity: "medium",
  linkCheckEnabled: true,
};

export function normalizeSettings(
  settings: Partial<AnalyzerSettings> | AnalyzerSettings,
): AnalyzerSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
  };
}
