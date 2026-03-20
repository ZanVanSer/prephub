import { NextResponse } from "next/server";

import type { ConvertResponse, MjmlIssue } from "@/modules/mj-tool/types/conversion";

export const runtime = "nodejs";

type MjmlCompiler = (
  input: string,
  options?: {
    validationLevel?: "skip" | "soft" | "strict";
    filePath?: string;
  },
) => {
  html: string;
  errors: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { mjml?: string };
    const mjml = body.mjml?.trim();

    if (!mjml) {
      return NextResponse.json(
        { error: "No MJML provided" },
        { status: 400 },
      );
    }

    const { default: mjml2html } = (await import("mjml")) as {
      default: MjmlCompiler;
    };

    const result = mjml2html(mjml, {
      validationLevel: "soft",
      filePath: process.cwd(),
    });

    const issues = normalizeMjmlIssues(result.errors);
    const errors = issues.filter((issue) => issue.type === "error");
    const warnings = issues.filter((issue) => issue.type === "warning");

    const response: ConvertResponse = {
      html: result.html,
      errors,
      warnings,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to convert MJML";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function normalizeMjmlIssues(issues: unknown): MjmlIssue[] {
  if (!Array.isArray(issues)) {
    return [];
  }

  return issues.map((issue, index) => {
    const normalizedIssue = issue as {
      line?: number;
      message?: string;
      tagName?: string;
      formattedMessage?: string;
      source?: string;
    };

    const rawMessage =
      normalizedIssue.formattedMessage?.trim() ||
      normalizedIssue.message?.trim() ||
      "MJML reported an issue.";

    const lowerMessage = rawMessage.toLowerCase();

    return {
      id: `mjml-issue-${index + 1}`,
      line: normalizedIssue.line,
      message: normalizedIssue.tagName
        ? `${rawMessage} (${normalizedIssue.tagName})`
        : rawMessage,
      snippet: normalizedIssue.source?.trim(),
      type:
        lowerMessage.includes("warning") || lowerMessage.includes("deprecated")
          ? "warning"
          : "error",
    };
  });
}
