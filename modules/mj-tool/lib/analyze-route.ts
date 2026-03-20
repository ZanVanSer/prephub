import { NextResponse } from "next/server";

import { analyzeHtml } from "@/modules/mj-tool/lib/analyzer";
import { DEFAULT_SETTINGS, normalizeSettings } from "@/modules/mj-tool/lib/settings";
import type { AnalyzeResponse, AnalyzerSettings } from "@/modules/mj-tool/types/analyzer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      html?: string;
      settings?: Partial<AnalyzerSettings>;
    };
    const html = body.html?.trim();

    if (!html) {
      return NextResponse.json(
        { error: "No HTML provided" },
        { status: 400 },
      );
    }

    const settings = normalizeSettings(body.settings ?? DEFAULT_SETTINGS);
    const result: AnalyzeResponse = await analyzeHtml(html, settings);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze HTML";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
