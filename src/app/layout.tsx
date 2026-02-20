import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const fonts = [ubuntu];
const fontsCssClass = fonts.map((font) => font.className).join(" ");

export const metadata: Metadata = {
  title: "JSON Viewer",
  description:
    "A web app designed to validate, format, and visualize JSON texts.",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#04313a" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { color: "#fdfeff" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={fontsCssClass}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
