export type BackgroundRemovalStatus =
  | "idle"
  | "uploading"
  | "ready_to_process"
  | "processing"
  | "success"
  | "error";

export interface BackgroundRemovalCandidate {
  name: string;
  size: number;
  type: string;
}

export interface BackgroundRemovalSource {
  storagePath: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
}

export interface BackgroundRemovalProcessRequest {
  source: BackgroundRemovalSource;
}

export interface BackgroundRemovalResult {
  originalName: string;
  outputName: string;
  originalMimeType: string;
  outputMimeType: "image/png";
  originalSizeBytes: number;
  outputSizeBytes: number;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  previewUrl: string;
  downloadUrl: string;
}

export interface BackgroundRemovalProcessResponse {
  result: BackgroundRemovalResult | null;
  error: string | null;
}
