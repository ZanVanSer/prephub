import assert from "node:assert/strict";
import test from "node:test";
import type { Config } from "@imgly/background-removal-node";
import { createProcessRoute } from "@/modules/background-remover/lib/process-route";
import { processBackgroundRemoval } from "@/modules/background-remover/lib/processing";
import {
  buildResultFileName,
  buildResultStoragePath,
  buildSourceStoragePath
} from "@/modules/background-remover/lib/storage";
import {
  getBackgroundRemovalValidationError,
  MAX_FILE_SIZE_BYTES
} from "@/modules/background-remover/lib/validation";
import type { BackgroundRemovalSource } from "@/modules/background-remover/types";

test("background remover validation accepts supported files and rejects invalid uploads", () => {
  assert.equal(
    getBackgroundRemovalValidationError({
      name: "product.png",
      size: 1024,
      type: "image/png"
    }),
    null
  );
  assert.match(
    getBackgroundRemovalValidationError({
      name: "avatar.gif",
      size: 1024,
      type: "image/gif"
    }) ?? "",
    /supported image type/
  );
  assert.match(
    getBackgroundRemovalValidationError({
      name: "big.jpg",
      size: MAX_FILE_SIZE_BYTES + 1,
      type: "image/jpeg"
    }) ?? "",
    /30 MB/
  );
});

test("background remover storage helpers produce predictable paths and filenames", () => {
  assert.equal(
    buildSourceStoragePath("user-1", "run-1", "My Product (1).png"),
    "user-1/background-remover/sources/run-1/My-Product--1-.png"
  );
  assert.equal(buildResultFileName("My Product (1).png"), "My-Product--1--background-removed.png");
  assert.equal(
    buildResultStoragePath("user-1", "run-2", "result.png"),
    "user-1/background-remover/results/run-2/result.png"
  );
});

test("background removal processing returns PNG metadata from the processor output", async () => {
  const source: BackgroundRemovalSource = {
    storagePath: "user-1/source.png",
    name: "source.png",
    mimeType: "image/png",
    sizeBytes: 128,
    width: 1,
    height: 1
  };
  const transparentPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgwJ/l7b9WQAAAABJRU5ErkJggg==";
  const inputBuffer = Buffer.from(transparentPngBase64, "base64");

  const processed = await processBackgroundRemoval({
    source,
    inputBuffer,
    removeBackgroundFn: async (image, config) => {
      assert.ok(image instanceof Blob);
      assert.equal(image.type, "image/png");
      assert.equal((config as Config).model, "medium");
      assert.equal((config as Config).output?.format, "image/png");
      return new Blob([inputBuffer], { type: "image/png" });
    }
  });

  assert.equal(processed.result.outputMimeType, "image/png");
  assert.equal(processed.result.outputName, "source-background-removed.png");
  assert.equal(processed.result.outputWidth, source.width);
  assert.equal(processed.result.outputHeight, source.height);
  assert.equal(processed.outputBuffer.byteLength > 0, true);
});

test("background removal processing preserves underlying library errors", async () => {
  const source: BackgroundRemovalSource = {
    storagePath: "user-1/source.png",
    name: "source.png",
    mimeType: "image/png",
    sizeBytes: 128,
    width: 1,
    height: 1
  };

  await assert.rejects(
    () =>
      processBackgroundRemoval({
        source,
        inputBuffer: Buffer.from("png"),
        removeBackgroundFn: async () => {
          throw new Error("Unsupported format");
        }
      }),
    /Unsupported format/
  );
});

test("process route rejects unauthorized requests", async () => {
  const handler = createProcessRoute({
    getSupabaseAdminClient() {
      throw new Error("should not be called");
    },
    getStorageBucket() {
      return "bucket";
    },
    processBackgroundRemoval: processBackgroundRemoval
  });
  const response = await handler(
    new Request("http://localhost/api/background-remover/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    })
  );
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error, "Unauthorized.");
});

test("process route validates uploaded metadata before processing", async () => {
  const handler = createProcessRoute({
    getSupabaseAdminClient() {
      return {
        auth: {
          async getUser() {
            return {
              data: {
                user: {
                  id: "user-1"
                }
              },
              error: null
            };
          }
        }
      };
    },
    getStorageBucket() {
      return "bucket";
    },
    processBackgroundRemoval: processBackgroundRemoval
  });
  const response = await handler(
    new Request("http://localhost/api/background-remover/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token"
      },
      body: JSON.stringify({
        source: {
          storagePath: "user-1/file.gif",
          name: "file.gif",
          mimeType: "image/gif",
          sizeBytes: 1024,
          width: 1,
          height: 1
        }
      })
    })
  );
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.match(payload.error, /supported image type/);
});

test("process route returns download and preview URLs on success", async () => {
  const source: BackgroundRemovalSource = {
    storagePath: "user-1/source.png",
    name: "source.png",
    mimeType: "image/png",
    sizeBytes: 1024,
    width: 100,
    height: 200
  };
  let uploadedPath = "";

  const handler = createProcessRoute({
    getSupabaseAdminClient() {
      return {
        auth: {
          async getUser() {
            return {
              data: {
                user: {
                  id: "user-1"
                }
              },
              error: null
            };
          }
        },
        storage: {
          from() {
            return {
              async download(path: string) {
                assert.equal(path, source.storagePath);
                return {
                  data: new Blob([Buffer.from("source")], { type: "image/png" }),
                  error: null
                };
              },
              async upload(path: string, buffer: Buffer, options: { contentType: string }) {
                uploadedPath = path;
                assert.equal(options.contentType, "image/png");
                assert.equal(buffer.byteLength > 0, true);
                return {
                  error: null
                };
              },
              async createSignedUrl(path: string, _expiresIn: number, options?: { download?: string }) {
                return {
                  data: {
                    signedUrl: options?.download ? `https://download.test/${path}` : `https://preview.test/${path}`
                  },
                  error: null
                };
              }
            };
          }
        }
      };
    },
    getStorageBucket() {
      return "bucket";
    },
    async processBackgroundRemoval() {
      return {
        outputBuffer: Buffer.from("png"),
        result: {
          originalName: source.name,
          outputName: "source-background-removed.png",
          originalMimeType: source.mimeType,
          outputMimeType: "image/png",
          originalSizeBytes: source.sizeBytes,
          outputSizeBytes: 3,
          originalWidth: 100,
          originalHeight: 200,
          outputWidth: 100,
          outputHeight: 200
        }
      };
    }
  });
  const response = await handler(
    new Request("http://localhost/api/background-remover/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token"
      },
      body: JSON.stringify({
        source
      })
    })
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.match(uploadedPath, /user-1\/background-remover\/results\//);
  assert.equal(payload.result.outputName, "source-background-removed.png");
  assert.match(payload.result.previewUrl, /preview\.test/);
  assert.match(payload.result.downloadUrl, /download\.test/);
});

test("process route surfaces download and processing failures as friendly errors", async () => {
  const downloadFailureHandler = createProcessRoute({
    getSupabaseAdminClient() {
      return {
        auth: {
          async getUser() {
            return {
              data: {
                user: {
                  id: "user-1"
                }
              },
              error: null
            };
          }
        },
        storage: {
          from() {
            return {
              async download() {
                return {
                  data: null,
                  error: {
                    message: "Missing source"
                  }
                };
              }
            };
          }
        }
      };
    },
    getStorageBucket() {
      return "bucket";
    },
    processBackgroundRemoval: processBackgroundRemoval
  });
  const downloadResponse = await downloadFailureHandler(
    new Request("http://localhost/api/background-remover/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token"
      },
      body: JSON.stringify({
        source: {
          storagePath: "user-1/source.png",
          name: "source.png",
          mimeType: "image/png",
          sizeBytes: 1024,
          width: 100,
          height: 200
        }
      })
    })
  );
  const downloadPayload = await downloadResponse.json();

  assert.equal(downloadResponse.status, 400);
  assert.equal(downloadPayload.error, "Missing source");

  const processingFailureHandler = createProcessRoute({
    getSupabaseAdminClient() {
      return {
        auth: {
          async getUser() {
            return {
              data: {
                user: {
                  id: "user-1"
                }
              },
              error: null
            };
          }
        },
        storage: {
          from() {
            return {
              async download() {
                return {
                  data: new Blob([Buffer.from("source")], { type: "image/png" }),
                  error: null
                };
              }
            };
          }
        }
      };
    },
    getStorageBucket() {
      return "bucket";
    },
    async processBackgroundRemoval() {
      throw new Error("Processing exploded");
    }
  });
  const processingResponse = await processingFailureHandler(
    new Request("http://localhost/api/background-remover/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token"
      },
      body: JSON.stringify({
        source: {
          storagePath: "user-1/source.png",
          name: "source.png",
          mimeType: "image/png",
          sizeBytes: 1024,
          width: 100,
          height: 200
        }
      })
    })
  );
  const processingPayload = await processingResponse.json();

  assert.equal(processingResponse.status, 400);
  assert.equal(processingPayload.error, "Processing exploded");
});
