export const STORAGE_KEYS = {
  mjml: "edt_mjml",
  html: "edt_html",
  htmlPreview: "edt_html_preview",
  settings: "edt_settings",
  analysis: "edt_analysis",
} as const;

export const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MJ Tool HTML Preview</title>
  </head>
  <body style="margin:0;padding:32px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;">
      <tr>
        <td style="padding:40px 32px;">
          <h1 style="margin:0 0 16px;font-size:32px;line-height:1.2;">Preview raw email HTML</h1>
          <p style="margin:0;font-size:16px;line-height:1.7;color:#475569;">
            Paste existing email HTML here to preview and analyze it without converting from MJML first.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const DEFAULT_MJML = `<mjml>
  <mj-body background-color="#f6f8fb">
    <mj-section padding="32px 24px">
      <mj-column>
        <mj-text
          font-size="28px"
          font-family="Helvetica, Arial, sans-serif"
          font-weight="700"
          color="#0f172a"
        >
          Build responsive emails faster
        </mj-text>
        <mj-text
          padding-top="12px"
          font-size="16px"
          line-height="24px"
          font-family="Helvetica, Arial, sans-serif"
          color="#475569"
        >
          MJ Tool helps you preview, inspect, and prepare production HTML
          without leaving your workflow.
        </mj-text>
        <mj-button
          padding-top="20px"
          background-color="#2563eb"
          color="#ffffff"
          border-radius="12px"
          font-family="Helvetica, Arial, sans-serif"
        >
          Start Building
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
