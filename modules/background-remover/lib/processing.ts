import { removeBackground, type Config } from "@imgly/background-removal-node";
import { buildResultFileName } from "@/modules/background-remover/lib/storage";
import { validateBackgroundRemovalFile } from "@/modules/background-remover/lib/validation";
import type {
  BackgroundRemovalResult,
  BackgroundRemovalSource
} from "@/modules/background-remover/types";

export class BackgroundRemovalError extends Error {}

export type RemoveBackgroundFn = typeof removeBackground;

const REMOVAL_CONFIG: Config = {
  model: "medium",
  output: {
    format: "image/png"
  }
};

export async function processBackgroundRemoval(params: {
  source: BackgroundRemovalSource;
  inputBuffer: Buffer;
  removeBackgroundFn?: RemoveBackgroundFn;
}): Promise<{
  result: Omit<BackgroundRemovalResult, "previewUrl" | "downloadUrl">;
  outputBuffer: Buffer;
}> {
  const { source, inputBuffer, removeBackgroundFn = removeBackground } = params;

  validateBackgroundRemovalFile({
    name: source.name,
    size: source.sizeBytes,
    type: source.mimeType
  });

  let blob: Blob;

  try {
    blob = await removeBackgroundFn(new Blob([inputBuffer], { type: source.mimeType }), REMOVAL_CONFIG);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Background removal failed.";
    throw new BackgroundRemovalError(`Failed to remove the background for "${source.name}": ${message}`);
  }

  const outputBuffer = Buffer.from(await blob.arrayBuffer());

  if (outputBuffer.byteLength === 0) {
    throw new BackgroundRemovalError(`"${source.name}" produced an empty PNG result.`);
  }

  return {
    outputBuffer,
    result: {
      originalName: source.name,
      outputName: buildResultFileName(source.name),
      originalMimeType: source.mimeType,
      outputMimeType: "image/png",
      originalSizeBytes: source.sizeBytes,
      outputSizeBytes: outputBuffer.byteLength,
      originalWidth: source.width,
      originalHeight: source.height,
      outputWidth: source.width,
      outputHeight: source.height
    }
  };
}
