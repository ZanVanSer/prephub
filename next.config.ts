import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "mjml",
    "mjml-core",
    "html-minifier",
    "uglify-js",
    "@imgly/background-removal-node",
    "onnxruntime-node"
  ],
};

export default nextConfig;
