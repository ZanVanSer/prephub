declare module "html-minifier-terser" {
  type MinifyOptions = {
    collapseWhitespace?: boolean;
    removeComments?: boolean;
    minifyCSS?: boolean;
  };

  export function minify(
    input: string,
    options?: MinifyOptions,
  ): Promise<string>;
}
