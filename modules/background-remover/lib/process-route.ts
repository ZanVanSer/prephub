import { NextResponse } from "next/server";
import { getStorageBucket, getSupabaseAdminClient } from "@/lib/auth/supabase-server";
import {
  BackgroundRemovalError,
  processBackgroundRemoval
} from "@/modules/background-remover/lib/processing";
import { buildResultStoragePath } from "@/modules/background-remover/lib/storage";
import { validateBackgroundRemovalFile } from "@/modules/background-remover/lib/validation";
import type {
  BackgroundRemovalProcessRequest,
  BackgroundRemovalProcessResponse,
  BackgroundRemovalSource
} from "@/modules/background-remover/types";

export const runtime = "nodejs";

type RouteDependencies = {
  getSupabaseAdminClient: typeof getSupabaseAdminClient;
  getStorageBucket: typeof getStorageBucket;
  processBackgroundRemoval: typeof processBackgroundRemoval;
};

function isBackgroundRemovalSource(value: unknown): value is BackgroundRemovalSource {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.storagePath === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.mimeType === "string" &&
    typeof candidate.sizeBytes === "number" &&
    typeof candidate.width === "number" &&
    typeof candidate.height === "number" &&
    candidate.width > 0 &&
    candidate.height > 0
  );
}

function toErrorResponse(message: string, status: number) {
  const response: BackgroundRemovalProcessResponse = {
    result: null,
    error: message
  };

  return NextResponse.json(response, { status });
}

export function createProcessRoute(
  deps: RouteDependencies = {
    getSupabaseAdminClient,
    getStorageBucket,
    processBackgroundRemoval
  }
) {
  return async function POST(request: Request) {
    try {
      const authHeader = request.headers.get("authorization");
      const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

      if (!accessToken) {
        return toErrorResponse("Unauthorized.", 401);
      }

      const supabase = deps.getSupabaseAdminClient();
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser(accessToken);

      if (authError || !user) {
        return toErrorResponse("Unauthorized.", 401);
      }

      const payload = (await request.json()) as Partial<BackgroundRemovalProcessRequest>;

      if (!isBackgroundRemovalSource(payload.source)) {
        return toErrorResponse("Invalid image payload.", 400);
      }

      validateBackgroundRemovalFile({
        name: payload.source.name,
        size: payload.source.sizeBytes,
        type: payload.source.mimeType
      });

      const bucket = deps.getStorageBucket();
      const { data, error } = await supabase.storage.from(bucket).download(payload.source.storagePath);

      if (error || !data) {
        return toErrorResponse(error?.message ?? "Failed to download the uploaded image.", 400);
      }

      const processed = await deps.processBackgroundRemoval({
        source: payload.source,
        inputBuffer: Buffer.from(await data.arrayBuffer())
      });
      const resultRunId = crypto.randomUUID();
      const resultPath = buildResultStoragePath(user.id, resultRunId, processed.result.outputName);
      const { error: uploadError } = await supabase.storage.from(bucket).upload(resultPath, processed.outputBuffer, {
        contentType: "image/png",
        upsert: false
      });

      if (uploadError) {
        return toErrorResponse(uploadError.message, 500);
      }

      const { data: signedPreview, error: previewError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(resultPath, 3600);

      if (previewError || !signedPreview) {
        return toErrorResponse(previewError?.message ?? "Failed to sign the result preview.", 500);
      }

      const { data: signedDownload, error: downloadError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(resultPath, 3600, {
          download: processed.result.outputName
        });

      if (downloadError || !signedDownload) {
        return toErrorResponse(downloadError?.message ?? "Failed to sign the result download.", 500);
      }

      const response: BackgroundRemovalProcessResponse = {
        result: {
          ...processed.result,
          previewUrl: signedPreview.signedUrl,
          downloadUrl: signedDownload.signedUrl
        },
        error: null
      };

      return NextResponse.json(response);
    } catch (error) {
      if (error instanceof BackgroundRemovalError || error instanceof Error) {
        return toErrorResponse(error.message, 400);
      }

      return toErrorResponse("Background removal failed.", 500);
    }
  };
}

export const POST = createProcessRoute();
