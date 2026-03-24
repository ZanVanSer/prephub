"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
  type RefObject
} from "react";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { buttonClassName, Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase-browser";
import { buildSourceStoragePath } from "@/modules/background-remover/lib/storage";
import {
  getBackgroundRemovalValidationError,
  getMaxFileSizeLabel,
  getSupportedFileTypesLabel
} from "@/modules/background-remover/lib/validation";
import type {
  BackgroundRemovalProcessRequest,
  BackgroundRemovalProcessResponse,
  BackgroundRemovalResult,
  BackgroundRemovalSource,
  BackgroundRemovalStatus
} from "@/modules/background-remover/types";

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[index]}`;
}

function getStatusCopy(status: BackgroundRemovalStatus) {
  switch (status) {
    case "uploading":
      return "Uploading original image…";
    case "ready_to_process":
      return "Ready to remove background.";
    case "processing":
      return "Removing background…";
    case "success":
      return "Transparent PNG is ready.";
    case "error":
      return "Something went wrong.";
    default:
      return "Upload one image to get started.";
  }
}

function getStatusClassName(status: BackgroundRemovalStatus) {
  switch (status) {
    case "uploading":
    case "processing":
      return "upload-status upload-status-processing";
    case "ready_to_process":
    case "success":
      return "upload-status upload-status-done";
    case "error":
      return "upload-status upload-status-failed";
    default:
      return "upload-status";
  }
}

function PreviewCard({
  title,
  imageUrl,
  checkerboard = false
}: {
  title: string;
  imageUrl?: string;
  checkerboard?: boolean;
}) {
  return (
    <SurfaceCard className="background-remover-preview-card">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
        </div>
      </div>

      {imageUrl ? (
        <div
          className={
            checkerboard
              ? "background-remover-preview-stage background-remover-preview-stage--checkerboard"
              : "background-remover-preview-stage"
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="background-remover-preview-image" src={imageUrl} alt={title} />
        </div>
      ) : (
        <EmptyState title="Nothing to preview yet" />
      )}
    </SurfaceCard>
  );
}

function resetInput(inputRef: RefObject<HTMLInputElement | null>) {
  if (inputRef.current) {
    inputRef.current.value = "";
  }
}

function readImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth || 1,
        height: image.naturalHeight || 1
      });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`"${file.name}" could not be read.`));
    };
    image.src = objectUrl;
  });
}

export function WorkspaceClient({ initialSession }: { initialSession: Session }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [status, setStatus] = useState<BackgroundRemovalStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<BackgroundRemovalSource | null>(null);
  const [result, setResult] = useState<BackgroundRemovalResult | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession) {
        router.replace("/login");
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  useEffect(() => {
    if (!file) {
      setOriginalPreviewUrl("");
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setOriginalPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file]);

  async function uploadFile(nextFile: File) {
    if (!session) {
      setError("Sign in to upload an image.");
      setStatus("error");
      return;
    }

    const validationError = getBackgroundRemovalValidationError({
      name: nextFile.name,
      size: nextFile.size,
      type: nextFile.type
    });

    if (validationError) {
      setFile(null);
      setSource(null);
      setResult(null);
      setStatus("error");
      setError(validationError);
      return;
    }

    setSource(null);
    setResult(null);
    setError("");
    setStatus("uploading");

    try {
      const dimensions = await readImageDimensions(nextFile);
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "imprep-assets";
      const runId = crypto.randomUUID();
      const storagePath = buildSourceStoragePath(session.user.id, runId, nextFile.name);
      const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, nextFile, {
        contentType: nextFile.type,
        upsert: false
      });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setFile(nextFile);
      setSource({
        storagePath,
        name: nextFile.name,
        mimeType: nextFile.type,
        sizeBytes: nextFile.size,
        width: dimensions.width,
        height: dimensions.height
      });
      setStatus("ready_to_process");
    } catch (uploadError) {
      setFile(null);
      setStatus("error");
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    }
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    void uploadFile(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    const nextFile = event.dataTransfer.files?.[0];

    if (!nextFile) {
      return;
    }

    void uploadFile(nextFile);
  }

  async function handleRemoveBackground() {
    if (!session) {
      setError("Sign in to remove a background.");
      setStatus("error");
      return;
    }

    if (!source) {
      setError("Upload a valid image first.");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/background-remover/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          source
        } satisfies BackgroundRemovalProcessRequest)
      });
      const payload = (await response.json()) as BackgroundRemovalProcessResponse;

      if (!response.ok || payload.error || !payload.result) {
        throw new Error(payload.error ?? "Background removal failed.");
      }

      setResult(payload.result);
      setStatus("success");
    } catch (processingError) {
      setStatus("error");
      setError(processingError instanceof Error ? processingError.message : "Background removal failed.");
    }
  }

  function handleReplaceImage() {
    resetInput(inputRef);
    inputRef.current?.click();
  }

  function handleClear() {
    setFile(null);
    setSource(null);
    setResult(null);
    setError("");
    setStatus("idle");
    resetInput(inputRef);
  }

  const canRemoveBackground = Boolean(source) && status !== "processing" && status !== "uploading";
  const canDownload = Boolean(result);

  return (
    <section className="workspace-layout background-remover-layout">
      <div className="workspace-main">
        <SurfaceCard className="background-remover-upload-card">
          <div className="section-head">
            <div>
              <h2>Upload image</h2>
            </div>
            {file ? <span className={getStatusClassName(status)}>{getStatusCopy(status)}</span> : null}
          </div>

          <label
            className={`dropzone imprep-dropzone-surface background-remover-dropzone ${isDragging ? "dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileInput}
            />
            <strong>Drop your image here</strong>
          </label>

          {file ? (
            <div className="background-remover-file-summary">
              <div className="file-meta">
                <strong>{file.name}</strong>
                <span>
                  {file.type.replace("image/", "").toUpperCase()} · {formatBytes(file.size)} · {getSupportedFileTypesLabel()} · {getMaxFileSizeLabel()} max
                </span>
              </div>
            </div>
          ) : (
            <div className="background-remover-empty-note">
              <EmptyState title="No image selected" />
            </div>
          )}

          <div className="action-row background-remover-action-row">
            <Button variant="primary" onClick={handleRemoveBackground} disabled={!canRemoveBackground}>
              {status === "processing" ? "Removing…" : "Remove background"}
            </Button>
            <Button onClick={handleReplaceImage} disabled={status === "uploading" || status === "processing"}>
              Replace image
            </Button>
            {canDownload && result ? (
              <a
                href={result.downloadUrl}
                className={buttonClassName("secondary")}
                download={result.outputName}
              >
                Download PNG
              </a>
            ) : (
              <Button disabled>Download PNG</Button>
            )}
            <Button onClick={handleClear} disabled={status === "uploading" || status === "processing"}>
              Clear
            </Button>
          </div>

          {error ? (
            <SurfaceCard className="background-remover-error-card" tone="error">
              <ul className="warning-list">
                <li>{error}</li>
              </ul>
            </SurfaceCard>
          ) : null}
        </SurfaceCard>
      </div>

      <aside className="workspace-sidebar">
        <PreviewCard
          title="Original"
          imageUrl={originalPreviewUrl || undefined}
        />

        <PreviewCard
          title="Result"
          imageUrl={result?.previewUrl}
          checkerboard
        />

        {result ? (
          <SurfaceCard className="background-remover-result-meta">
            <div className="section-head">
              <div>
                <h2>Result details</h2>
                <p>{result.outputName}</p>
              </div>
              <span className="upload-status upload-status-done">Ready</span>
            </div>

            <dl className="result-stats">
              <div>
                <dt>Original</dt>
                <dd>
                  {result.originalWidth}x{result.originalHeight}
                </dd>
              </div>
              <div>
                <dt>Result</dt>
                <dd>
                  {result.outputWidth}x{result.outputHeight}
                </dd>
              </div>
              <div>
                <dt>Input size</dt>
                <dd>{formatBytes(result.originalSizeBytes)}</dd>
              </div>
              <div>
                <dt>PNG size</dt>
                <dd>{formatBytes(result.outputSizeBytes)}</dd>
              </div>
            </dl>
          </SurfaceCard>
        ) : null}
      </aside>
    </section>
  );
}
