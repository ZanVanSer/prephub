import { NextResponse } from "next/server";
import { minify } from "html-minifier-terser";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { html?: string };
    const html = body.html?.trim();

    if (!html) {
      return NextResponse.json(
        { error: "No HTML provided" },
        { status: 400 },
      );
    }

    const minifiedHtml = await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
    });

    return NextResponse.json({ html: minifiedHtml });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to minify HTML";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
