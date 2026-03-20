import { load, type CheerioAPI } from "cheerio";

import type {
  AnalyzeResponse,
  AnalyzerCategory,
  AnalyzerCheck,
  AnalyzerFinding,
  AnalyzerSettings,
  AnalyzerStatus,
} from "@/modules/mj-tool/types/analyzer";

type Context = {
  html: string;
  text: string;
  $: CheerioAPI;
  settings: AnalyzerSettings;
};

type CheckDefinition = {
  id: string;
  name: string;
  run: (context: Context) => AnalyzerCheck | Promise<AnalyzerCheck>;
};

const SPAM_TERMS_BY_SENSITIVITY = {
  low: [
    "act now",
    "apply now",
    "buy now",
    "call now",
    "click here",
    "congratulations",
    "exclusive",
    "free",
    "free gift",
    "free trial",
    "guaranteed",
    "limited offer",
    "limited time",
    "money back",
    "no obligation",
    "once in a lifetime",
    "order now",
    "risk-free",
    "special promotion",
    "urgent",
    "winner",
  ],
  medium: [
    "access now",
    "all new",
    "best price",
    "bonus",
    "cash bonus",
    "claim now",
    "deal",
    "discount",
    "don't delete",
    "earn extra cash",
    "extra income",
    "fantastic deal",
    "great offer",
    "increase sales",
    "lowest price",
    "make money",
    "million dollars",
    "miracle",
    "no catch",
    "no fees",
    "offer expires",
    "promise you",
    "save big",
    "while supplies last",
    "work from home",
  ],
  high: [
    "affordable",
    "bargain",
    "be your own boss",
    "cash",
    "cheap",
    "compare rates",
    "credit",
    "debt",
    "eliminate debt",
    "financial freedom",
    "hidden charges",
    "insurance",
    "investment",
    "luxury",
    "no credit check",
    "not spam",
    "potential earnings",
    "prize",
    "pure profit",
    "refinance",
    "remove me",
    "satisfaction guaranteed",
    "save up to",
    "this is not junk",
    "unbelievable",
    "weight loss",
  ],
} as const;

export async function analyzeHtml(
  html: string,
  settings: AnalyzerSettings,
): Promise<AnalyzeResponse> {
  const $ = load(html);
  const text = $("body").text().replace(/\s+/g, " ").trim();
  const context: Context = { html, text, $, settings };

  const categories = await buildCategories(context);
  const allChecks = categories.flatMap((category) => category.checks);
  const totalDeductions = allChecks.reduce(
    (sum, check) => sum + (check.status === "pass" ? 0 : check.deduction ?? 0),
    0,
  );

  return {
    score: Number(Math.max(0, Math.min(10, 10 - totalDeductions)).toFixed(1)),
    passedChecks: allChecks.filter((check) => check.status === "pass").length,
    warnings: allChecks.filter((check) => check.status === "warning").length,
    criticalErrors: allChecks.filter((check) => check.status === "error").length,
    categories,
  };
}

async function buildCategories(context: Context): Promise<AnalyzerCategory[]> {
  return [
    await buildCategory("spam", "Spam Risk", context, [
      {
        id: "spam_trigger_words",
        name: "Spam trigger words",
        run: ({ text, settings }) => {
          const flagged = getSpamTerms(settings.spamSensitivity).filter((term) =>
            text.toLowerCase().includes(term.toLowerCase()),
          );
          const deduction = Math.min(flagged.length * 0.3, 1.5);

          return flagged.length
            ? warningCheck(
                "spam_trigger_words",
                "Spam trigger words",
                "Promotional phrases commonly associated with spam were detected. Context still matters, but these terms are worth reviewing.",
                deduction,
                toTitleCase(flagged),
              )
            : passCheck(
                "spam_trigger_words",
                "Spam trigger words",
                "No common promotional trigger terms detected.",
              );
        },
      },
      {
        id: "all_caps",
        name: "All caps usage",
        run: ({ text }) => {
          const words = text.match(/\b[A-Z]{2,}\b/g) ?? [];
          const capsRatio = text ? words.join(" ").length / text.length : 0;
          const consecutiveCaps =
            /\b[A-Z]{2,}\b(?:\s+\b[A-Z]{2,}\b){2,}/.test(text);

          return consecutiveCaps || capsRatio > 0.2
            ? warningCheck(
                "all_caps",
                "All caps usage",
                "High all-caps usage can trigger spam filters.",
                0.5,
              )
            : passCheck(
                "all_caps",
                "All caps usage",
                "Capitalization looks balanced.",
              );
        },
      },
      {
        id: "exclamation_marks",
        name: "Exclamation marks",
        run: ({ text }) => {
          const count = (text.match(/!/g) ?? []).length;
          return count >= 5
            ? warningCheck(
                "exclamation_marks",
                "Exclamation marks",
                "Too many exclamation marks can look promotional.",
                0.3,
              )
            : passCheck(
                "exclamation_marks",
                "Exclamation marks",
                "Punctuation looks restrained.",
              );
        },
      },
      {
        id: "text_to_image_ratio",
        name: "Text to image ratio",
        run: ({ $, text }) => {
          const imageCount = $("img").length;
          return imageCount > 2 && text.length < 200
            ? warningCheck(
                "text_to_image_ratio",
                "Text to image ratio",
                "The email relies heavily on images with limited supporting text.",
                0.5,
              )
            : passCheck(
                "text_to_image_ratio",
                "Text to image ratio",
                "Text content should support deliverability and readability.",
              );
        },
      },
    ]),
    await buildCategory("structure", "HTML Structure", context, [
      {
        id: "valid_doctype",
        name: "DOCTYPE present",
        run: ({ html }) =>
          /<!doctype/i.test(html)
            ? passCheck("valid_doctype", "DOCTYPE present", "DOCTYPE is present.")
            : errorCheck(
                "valid_doctype",
                "DOCTYPE present",
                "DOCTYPE is missing from the document.",
                1,
              ),
      },
      {
        id: "no_script_tags",
        name: "Script tags",
        run: ({ html }) => {
          const findings = collectRegexFindings(
            html,
            /<script\b[^>]*>[\s\S]*?<\/script>|<script\b[^>]*\/?>/gi,
            "Script tag",
          );

          return findings.length
            ? errorCheck(
                "no_script_tags",
                "Script tags",
                "Script tags are not safe for email clients.",
                1,
                findings,
              )
            : passCheck("no_script_tags", "Script tags", "No script tags detected.");
        },
      },
      {
        id: "no_unsupported_tags",
        name: "Unsupported semantic tags",
        run: ({ html }) => {
          const findings = collectRegexFindings(
            html,
            /<(article|section|nav|header|footer|main|aside)\b[^>]*>/gi,
            "Unsupported tag",
          );

          return findings.length
            ? warningCheck(
                "no_unsupported_tags",
                "Unsupported semantic tags",
                "Some semantic HTML5 tags may not render reliably in email clients.",
                0.3,
                undefined,
                findings,
              )
            : passCheck(
                "no_unsupported_tags",
                "Unsupported semantic tags",
                "No risky semantic HTML5 tags detected.",
              );
        },
      },
      {
        id: "html_lang",
        name: "HTML lang attribute",
        run: ({ html }) =>
          /<html[^>]*\slang=/i.test(html)
            ? passCheck(
                "html_lang",
                "HTML lang attribute",
                "The root html tag includes a lang attribute.",
              )
            : warningCheck(
                "html_lang",
                "HTML lang attribute",
                "Add a lang attribute to the html tag for accessibility and client hints.",
                0.2,
              ),
      },
      {
        id: "table_layout",
        name: "Table-based layout",
        run: ({ html }) => {
          const hasTable = /<table/i.test(html);
          const hasFlexOrGrid = /display\s*:\s*(flex|grid)/i.test(html);

          return hasTable && !hasFlexOrGrid
            ? passCheck(
                "table_layout",
                "Table-based layout",
                "The markup follows email-safe table layout patterns.",
              )
            : warningCheck(
                "table_layout",
                "Table-based layout",
                "Email HTML should favor tables and avoid flex/grid layout.",
                0.5,
              );
        },
      },
    ]),
    await buildCategory("images", "Images & Media", context, [
      {
        id: "img_alt_text",
        name: "Image alt text",
        run: ({ $, html }) => {
          const images = $("img").toArray();
          const missingAlt = images.filter((image) => !$(image).attr("alt")?.trim());
          const deduction = Math.min(missingAlt.length * 0.3, 1);
          const findings = collectElementFindings(
            html,
            $,
            missingAlt,
            "Image missing alt",
          );

          return missingAlt.length
            ? warningCheck(
                "img_alt_text",
                "Image alt text",
                "Some images are missing useful alt text.",
                deduction,
                undefined,
                findings,
              )
            : passCheck("img_alt_text", "Image alt text", "All images include alt text.");
        },
      },
      {
        id: "no_video_audio",
        name: "Embedded media",
        run: ({ html }) =>
          /<(video|audio)\b/i.test(html)
            ? warningCheck(
                "no_video_audio",
                "Embedded media",
                "Video and audio tags are poorly supported in email clients.",
                0.5,
              )
            : passCheck(
                "no_video_audio",
                "Embedded media",
                "No unsupported media tags detected.",
              ),
      },
      {
        id: "img_dimensions",
        name: "Image dimensions",
        run: ({ $, html }) => {
          const images = $("img").toArray();
          const missingDimensions = images.filter((image) => {
            const element = $(image);
            return !element.attr("width") || !element.attr("height");
          });
          const deduction = Math.min(missingDimensions.length * 0.2, 0.5);
          const findings = collectElementFindings(
            html,
            $,
            missingDimensions,
            "Image missing dimensions",
          );

          return missingDimensions.length
            ? warningCheck(
                "img_dimensions",
                "Image dimensions",
                "Some images are missing explicit width or height attributes.",
                deduction,
                undefined,
                findings,
              )
            : passCheck(
                "img_dimensions",
                "Image dimensions",
                "Image dimensions are defined.",
              );
        },
      },
      {
        id: "not_image_only",
        name: "Image-only email check",
        run: ({ $, text }) =>
          $("img").length > 0 && text.length < 40
            ? errorCheck(
                "not_image_only",
                "Image-only email check",
                "The email appears to rely almost entirely on imagery.",
                1.5,
              )
            : passCheck(
                "not_image_only",
                "Image-only email check",
                "The email includes readable text content.",
              ),
      },
    ]),
    await buildLinksCategory(context),
    await buildCategory("accessibility", "Accessibility", context, [
      {
        id: "table_role_presentation",
        name: "Presentation role on tables",
        run: ({ $, html }) => {
          const tables = $("table").toArray();
          const missingRole = tables.filter(
            (table) => $(table).attr("role") !== "presentation",
          );
          const findings = collectElementFindings(
            html,
            $,
            missingRole,
            "Table missing role",
          );

          return tables.length && missingRole.length
            ? warningCheck(
                "table_role_presentation",
                "Presentation role on tables",
                "Layout tables should usually include role=\"presentation\".",
                0.3,
                undefined,
                findings,
              )
            : passCheck(
                "table_role_presentation",
                "Presentation role on tables",
                "Table roles look reasonable for email layout.",
              );
        },
      },
      {
        id: "lang_attribute",
        name: "Language attribute",
        run: ({ html }) =>
          /<html[^>]*\slang=/i.test(html)
            ? passCheck(
                "lang_attribute",
                "Language attribute",
                "Language metadata is present.",
              )
            : warningCheck(
                "lang_attribute",
                "Language attribute",
                "Add a language attribute to improve accessibility.",
                0.2,
              ),
      },
      {
        id: "descriptive_alt_text",
        name: "Descriptive alt text",
        run: ({ $, html }) => {
          const decorativeImages = $("img")
            .toArray()
            .filter(
              (image) =>
                $(image).attr("alt") === "" &&
                $(image).attr("role") !== "presentation",
            );
          const findings = collectElementFindings(
            html,
            $,
            decorativeImages,
            "Empty alt on visible image",
          );

          return decorativeImages.length
            ? warningCheck(
                "descriptive_alt_text",
                "Descriptive alt text",
                "Visible images should have descriptive alt text instead of empty alt values.",
                0.2,
                undefined,
                findings,
              )
            : passCheck(
                "descriptive_alt_text",
                "Descriptive alt text",
                "Alt text looks descriptive enough for visible content images.",
              );
        },
      },
    ]),
    await buildCategory("compatibility", "Email Client Compatibility", context, [
      {
        id: "no_flexbox_grid",
        name: "Flexbox or grid usage",
        run: ({ html }) =>
          /display\s*:\s*(flex|grid)/i.test(html)
            ? warningCheck(
                "no_flexbox_grid",
                "Flexbox or grid usage",
                "Flexbox and grid are unreliable in email clients.",
                0.5,
              )
            : passCheck(
                "no_flexbox_grid",
                "Flexbox or grid usage",
                "No flexbox or grid declarations detected.",
              ),
      },
      {
        id: "no_css_variables",
        name: "CSS variables",
        run: ({ html }) =>
          /var\(--/i.test(html)
            ? warningCheck(
                "no_css_variables",
                "CSS variables",
                "CSS variables are not consistently supported across email clients.",
                0.3,
              )
            : passCheck(
                "no_css_variables",
                "CSS variables",
                "No CSS variables detected.",
              ),
      },
      {
        id: "no_position_fixed",
        name: "Fixed or sticky positioning",
        run: ({ html }) =>
          /position\s*:\s*(fixed|sticky)/i.test(html)
            ? warningCheck(
                "no_position_fixed",
                "Fixed or sticky positioning",
                "Fixed and sticky positioning can break in email clients.",
                0.3,
              )
            : passCheck(
                "no_position_fixed",
                "Fixed or sticky positioning",
                "No fixed or sticky positioning detected.",
              ),
      },
      {
        id: "no_external_stylesheets",
        name: "External stylesheets",
        run: ({ html }) =>
          /<link[^>]+rel=["']stylesheet["']/i.test(html)
            ? warningCheck(
                "no_external_stylesheets",
                "External stylesheets",
                "Linked stylesheets are commonly stripped by email clients.",
                0.5,
              )
            : passCheck(
                "no_external_stylesheets",
                "External stylesheets",
                "No external stylesheets detected.",
              ),
      },
      {
        id: "no_css_import",
        name: "CSS imports",
        run: ({ html }) =>
          /@import/i.test(html)
            ? warningCheck(
                "no_css_import",
                "CSS imports",
                "@import rules are unreliable in email HTML.",
                0.3,
              )
            : passCheck(
                "no_css_import",
                "CSS imports",
                "No CSS import rules detected.",
              ),
      },
      {
        id: "no_svg_tags",
        name: "Inline SVG",
        run: ({ html }) =>
          /<svg\b/i.test(html)
            ? warningCheck(
                "no_svg_tags",
                "Inline SVG",
                "Inline SVG can fail in several major email clients.",
                0.3,
              )
            : passCheck("no_svg_tags", "Inline SVG", "No inline SVG detected."),
      },
    ]),
    await buildCategory("performance", "Performance", context, [
      {
        id: "html_size",
        name: "HTML size threshold",
        run: ({ html, settings }) => {
          const sizeKb = new Blob([html]).size / 1024;
          return sizeKb > settings.htmlSizeWarningKb
            ? warningCheck(
                "html_size",
                "HTML size threshold",
                `HTML size is ${Math.round(sizeKb)} KB, which exceeds the configured threshold.`,
                0.5,
              )
            : passCheck(
                "html_size",
                "HTML size threshold",
                "HTML size is within the configured threshold.",
              );
        },
      },
      {
        id: "no_base64_images",
        name: "Base64 images",
        run: ({ html }) =>
          /data:image\//i.test(html)
            ? warningCheck(
                "no_base64_images",
                "Base64 images",
                "Embedded base64 images can bloat email payload size.",
                0.3,
              )
            : passCheck(
                "no_base64_images",
                "Base64 images",
                "No embedded base64 images detected.",
              ),
      },
    ]),
    await buildCategory("best_practices", "Best Practices", context, [
      {
        id: "preheader_text",
        name: "Preheader text",
        run: ({ html }) =>
          /(font-size\s*:\s*0|display\s*:\s*none).{0,200}/i.test(html)
            ? passCheck(
                "preheader_text",
                "Preheader text",
                "Hidden preview/preheader text was detected near the top of the email.",
              )
            : warningCheck(
                "preheader_text",
                "Preheader text",
                "A hidden preview text block was not detected.",
                0.3,
              ),
      },
      {
        id: "no_deep_nesting",
        name: "Nesting depth",
        run: ({ html }) => {
          const depth = maxTableDepth(html);
          return depth > 4
            ? warningCheck(
                "no_deep_nesting",
                "Nesting depth",
                `Table nesting reaches ${depth} levels, which may complicate rendering and maintenance.`,
                0.2,
              )
            : passCheck(
                "no_deep_nesting",
                "Nesting depth",
                "Table nesting depth looks manageable.",
              );
        },
      },
    ]),
  ];
}

async function buildLinksCategory(context: Context) {
  return buildCategory("links", "Links", context, [
    {
      id: "unsubscribe_link",
      name: "Unsubscribe link",
      run: ({ html, text }) =>
        /unsubscribe/i.test(html) || /unsubscribe/i.test(text)
          ? passCheck(
              "unsubscribe_link",
              "Unsubscribe link",
              "An unsubscribe reference was detected.",
            )
          : errorCheck(
              "unsubscribe_link",
              "Unsubscribe link",
              "No unsubscribe link or label was detected.",
              1.5,
            ),
    },
    {
      id: "no_javascript_hrefs",
      name: "JavaScript hrefs",
      run: ({ html }) => {
        const findings = collectRegexFindings(
          html,
          /href=["']javascript:[^"']*["']/gi,
          "JavaScript href",
        );

        return findings.length
          ? errorCheck(
              "no_javascript_hrefs",
              "JavaScript hrefs",
              "JavaScript links are unsafe for email HTML.",
              1,
              findings,
            )
          : passCheck(
              "no_javascript_hrefs",
              "JavaScript hrefs",
              "No JavaScript links detected.",
            );
      },
    },
    {
      id: "no_empty_hrefs",
      name: "Empty links",
      run: ({ html }) => {
        const findings = collectRegexFindings(
          html,
          /<a\b[^>]*href=["']\s*["'][^>]*>/gi,
          "Empty href",
        );
        const deduction = Math.min(findings.length * 0.3, 0.5);

        return findings.length
          ? warningCheck(
              "no_empty_hrefs",
              "Empty links",
              "Some anchor tags use empty href values.",
              deduction,
              undefined,
              findings,
            )
          : passCheck("no_empty_hrefs", "Empty links", "No empty links detected.");
      },
    },
    {
      id: "broken_link_check",
      name: "Broken link check",
      run: async ({ html, settings }) =>
        checkBrokenLinks(html, settings.linkCheckEnabled),
    },
  ]);
}

async function buildCategory(
  id: string,
  name: string,
  context: Context,
  definitions: CheckDefinition[],
): Promise<AnalyzerCategory> {
  const checks = await Promise.all(
    definitions.map((definition) => definition.run(context)),
  );
  const status = getCategoryStatus(checks);
  const issueCount = checks.filter((check) => check.status !== "pass").length;

  return {
    id,
    name,
    status,
    summary:
      issueCount === 0
        ? "All checks passed"
        : `${issueCount} ${issueCount === 1 ? "issue" : "issues"} detected`,
    checks,
  };
}

function getCategoryStatus(checks: AnalyzerCheck[]): AnalyzerStatus {
  if (checks.some((check) => check.status === "error")) {
    return "error";
  }

  if (checks.some((check) => check.status === "warning")) {
    return "warning";
  }

  return "pass";
}

function passCheck(id: string, name: string, message: string): AnalyzerCheck {
  return { id, name, status: "pass", message };
}

function warningCheck(
  id: string,
  name: string,
  message: string,
  deduction: number,
  flagged?: string[],
  findings?: AnalyzerFinding[],
): AnalyzerCheck {
  return { id, name, status: "warning", message, deduction, flagged, findings };
}

function errorCheck(
  id: string,
  name: string,
  message: string,
  deduction: number,
  findings?: AnalyzerFinding[],
): AnalyzerCheck {
  return { id, name, status: "error", message, deduction, findings };
}

async function checkBrokenLinks(
  html: string,
  enabled: boolean,
): Promise<AnalyzerCheck> {
  if (!enabled) {
    return passCheck(
      "broken_link_check",
      "Broken link check",
      "Link checking is disabled in settings.",
    );
  }

  const urls = extractExternalLinks(html);

  if (urls.length === 0) {
    return passCheck(
      "broken_link_check",
      "Broken link check",
      "No external http/https links were found.",
    );
  }

  const results = await Promise.all(urls.map((url) => checkUrl(url)));
  const broken = results.filter((result) => result.status === "broken");
  const unverifiable = results.filter((result) => result.status === "unverifiable");

  if (!broken.length && !unverifiable.length) {
    return passCheck(
      "broken_link_check",
      "Broken link check",
      `Verified ${results.length} external ${results.length === 1 ? "link" : "links"} successfully.`,
    );
  }

  const findings: AnalyzerFinding[] = [
    ...broken.map((result, index) => ({
      id: `broken-link-${index + 1}`,
      label: `Broken (${result.code ?? "error"})`,
      snippet: result.url,
    })),
    ...unverifiable.map((result, index) => ({
      id: `unverified-link-${index + 1}`,
      label: "Could not verify",
      snippet: result.url,
    })),
  ];
  const deduction = Math.min(broken.length * 0.5, 1.5);
  const parts: string[] = [];

  if (broken.length) {
    parts.push(
      `${broken.length} broken ${broken.length === 1 ? "link" : "links"} detected`,
    );
  }

  if (unverifiable.length) {
    parts.push(
      `${unverifiable.length} ${unverifiable.length === 1 ? "link could" : "links could"} not be verified`,
    );
  }

  return warningCheck(
    "broken_link_check",
    "Broken link check",
    `${parts.join(" • ")}.`,
    deduction,
    undefined,
    findings,
  );
}

function collectElementFindings(
  html: string,
  $: CheerioAPI,
  elements: Array<Parameters<CheerioAPI["html"]>[0]>,
  label: string,
): AnalyzerFinding[] {
  let cursor = 0;

  return elements.map((element, index) => {
    const rawSnippet = $.html(element) ?? "";
    const { line, nextCursor } = locateSnippet(html, rawSnippet, cursor);
    cursor = nextCursor;

    return {
      id: `${label}-${index + 1}`,
      label,
      line,
      snippet: truncateSnippet(rawSnippet),
    };
  });
}

function collectRegexFindings(
  html: string,
  pattern: RegExp,
  label: string,
): AnalyzerFinding[] {
  const findings: AnalyzerFinding[] = [];
  const regex = new RegExp(pattern.source, pattern.flags);
  let match: RegExpExecArray | null = regex.exec(html);
  let index = 0;

  while (match) {
    index += 1;
    findings.push({
      id: `${label}-${index}`,
      label,
      line: countLineNumber(html, match.index),
      snippet: truncateSnippet(match[0]),
    });
    match = regex.exec(html);
  }

  return findings;
}

function extractExternalLinks(html: string) {
  const matches = html.matchAll(/href=["'](https?:\/\/[^"'#\s]+)["']/gi);
  return [...new Set(Array.from(matches, (match) => match[1]))];
}

async function checkUrl(url: string): Promise<
  | { url: string; status: "ok"; code: number }
  | { url: string; status: "broken"; code: number }
  | { url: string; status: "unverifiable"; code?: number }
> {
  try {
    let response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 EmailDevToolkit/1.0",
      },
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    });

    if (response.status === 405) {
      response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 EmailDevToolkit/1.0",
        },
        signal: AbortSignal.timeout(5000),
        redirect: "follow",
      });
    }

    if (response.status >= 200 && response.status < 400) {
      return { url, status: "ok", code: response.status };
    }

    if (response.status >= 400) {
      return { url, status: "broken", code: response.status };
    }

    return { url, status: "unverifiable", code: response.status };
  } catch {
    return { url, status: "unverifiable" };
  }
}

function locateSnippet(html: string, snippet: string, fromIndex: number) {
  const index = html.indexOf(snippet, fromIndex);
  const fallbackIndex = index === -1 ? html.indexOf(snippet) : index;
  const nextCursor =
    fallbackIndex === -1 ? fromIndex : fallbackIndex + Math.max(snippet.length, 1);

  return {
    line: fallbackIndex === -1 ? undefined : countLineNumber(html, fallbackIndex),
    nextCursor,
  };
}

function countLineNumber(html: string, index: number) {
  return html.slice(0, index).split("\n").length;
}

function truncateSnippet(snippet: string) {
  const compact = snippet.replace(/\s+/g, " ").trim();
  return compact.length > 180 ? `${compact.slice(0, 177)}...` : compact;
}

function getSpamTerms(sensitivity: AnalyzerSettings["spamSensitivity"]) {
  if (sensitivity === "low") {
    return [...SPAM_TERMS_BY_SENSITIVITY.low];
  }

  if (sensitivity === "medium") {
    return [
      ...SPAM_TERMS_BY_SENSITIVITY.low,
      ...SPAM_TERMS_BY_SENSITIVITY.medium,
    ];
  }

  return [
    ...SPAM_TERMS_BY_SENSITIVITY.low,
    ...SPAM_TERMS_BY_SENSITIVITY.medium,
    ...SPAM_TERMS_BY_SENSITIVITY.high,
  ];
}

function toTitleCase(values: string[]) {
  return values.map((value) =>
    value.replace(/\b\w+/g, (word) => word[0].toUpperCase() + word.slice(1)),
  );
}

function maxTableDepth(html: string) {
  const tags = html.match(/<\/?table\b[^>]*>/gi) ?? [];
  let depth = 0;
  let maxDepth = 0;

  for (const tag of tags) {
    if (/^<table/i.test(tag)) {
      depth += 1;
      maxDepth = Math.max(maxDepth, depth);
    } else {
      depth = Math.max(0, depth - 1);
    }
  }

  return maxDepth;
}
