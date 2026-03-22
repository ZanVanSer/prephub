import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToolHub",
  description: "A modular workspace for Image Prep and MJML Tool."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
