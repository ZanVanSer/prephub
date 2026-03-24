import { sanitizeStorageName } from "@/modules/background-remover/lib/validation";

function removeExtension(filename: string) {
  return filename.replace(/\.[^.]+$/, "");
}

export function buildSourceStoragePath(userId: string, runId: string, originalName: string) {
  return `${userId}/background-remover/sources/${runId}/${sanitizeStorageName(originalName)}`;
}

export function buildResultFileName(originalName: string) {
  return `${sanitizeStorageName(removeExtension(originalName))}-background-removed.png`;
}

export function buildResultStoragePath(userId: string, runId: string, outputName: string) {
  return `${userId}/background-remover/results/${runId}/${outputName}`;
}
