import assert from "node:assert/strict";
import test from "node:test";
import { getFileValidationError, validateBatchSize } from "@/modules/image-prep/lib/image-processing";
import { getJpegQuality, resolveOutputFormat, resolvePreset } from "@/modules/image-prep/lib/presets";
import type { AppSettings } from "@/modules/image-prep/types";

const baseSettings: AppSettings = {
  preset: "content",
  outputFormat: "auto",
  retina: true,
  customDisplayWidth: 600,
  compressionMode: "balanced",
  preserveTransparency: true,
  fileSuffix: "-email"
};

test("resolvePreset doubles width when retina is on", () => {
  assert.deepEqual(resolvePreset(baseSettings), {
    displayWidth: 600,
    exportWidth: 1200,
    idealSizeRangeKb: [80, 200]
  });
});

test("resolvePreset uses custom width when preset is custom", () => {
  assert.equal(
    resolvePreset({
      ...baseSettings,
      preset: "custom",
      customDisplayWidth: 420
    }).exportWidth,
    840
  );
});

test("auto output favors png for transparency and screenshot preset", () => {
  assert.equal(
    resolveOutputFormat({
      requestedFormat: "auto",
      preset: "content",
      hasTransparency: true,
      preserveTransparency: true
    }),
    "png"
  );

  assert.equal(
    resolveOutputFormat({
      requestedFormat: "auto",
      preset: "screenshot",
      hasTransparency: false,
      preserveTransparency: false
    }),
    "png"
  );
});

test("jpeg quality bands stay aligned with compression modes", () => {
  assert.equal(getJpegQuality("small"), 64);
  assert.equal(getJpegQuality("balanced"), 76);
  assert.equal(getJpegQuality("sharp"), 86);
});

test("files over 100 MB are rejected by validation", () => {
  const file = new File([new Uint8Array(1)], "too-large.jpg", {
    type: "image/jpeg"
  });

  Object.defineProperty(file, "size", { value: 101 * 1024 * 1024 });
  assert.match(getFileValidationError(file) ?? "", /100 MB/);
});

test("batches over the total size cap are rejected", () => {
  const fileA = new File([new Uint8Array(1)], "a.jpg", { type: "image/jpeg" });
  const fileB = new File([new Uint8Array(1)], "b.jpg", { type: "image/jpeg" });

  Object.defineProperty(fileA, "size", { value: 200 * 1024 * 1024 });
  Object.defineProperty(fileB, "size", { value: 200 * 1024 * 1024 });

  assert.throws(() => validateBatchSize([fileA, fileB]), /350 MB/);
});
