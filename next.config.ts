import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mjml", "mjml-core", "html-minifier", "uglify-js"],
};

export default nextConfig;
