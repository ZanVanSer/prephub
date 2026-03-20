declare module "mjml" {
  type MjmlError = {
    line?: number;
    message?: string;
    tagName?: string;
    formattedMessage?: string;
  };

  type MjmlOptions = {
    validationLevel?: "skip" | "soft" | "strict";
    filePath?: string;
  };

  type MjmlResult = {
    html: string;
    errors: MjmlError[];
  };

  export default function mjml2html(
    input: string,
    options?: MjmlOptions,
  ): MjmlResult;
}
