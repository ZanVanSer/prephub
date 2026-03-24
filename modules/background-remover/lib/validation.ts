import type { BackgroundRemovalCandidate } from "@/modules/background-remover/types";

export const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024;
export const SUPPORTED_INPUT_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp"
]);

export function getMaxFileSizeLabel() {
  return "30 MB";
}

export function getSupportedFileTypesLabel() {
  return "PNG, JPG, JPEG, WebP";
}

export function getBackgroundRemovalValidationError(file: BackgroundRemovalCandidate) {
  if (!SUPPORTED_INPUT_MIME_TYPES.has(file.type)) {
    return `"${file.name}" is not a supported image type.`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" is larger than the ${getMaxFileSizeLabel()} limit.`;
  }

  return null;
}

export function validateBackgroundRemovalFile(file: BackgroundRemovalCandidate) {
  const error = getBackgroundRemovalValidationError(file);

  if (error) {
    throw new Error(error);
  }
}

export function sanitizeStorageName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}
