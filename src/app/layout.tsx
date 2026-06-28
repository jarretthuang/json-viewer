import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ThemeProvider from "@/components/theme/ThemeProvider";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const fonts = [ubuntu];
const fontsCssClass = fonts.map((font) => font.className).join(" ");
const siteUrl = "https://jsonviewer.io";
const siteName = "JSON Viewer";
const siteDescription =
  "Ultra-fast online JSON viewer for validating, formatting, minifying, and exploring JSON payloads up to 10 MB.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "JSON Viewer Online - Format, Validate & Explore JSON",
    template: "%s | JSON Viewer",
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "JSON viewer",
    "JSON formatter",
    "JSON validator",
    "JSON minifier",
    "JSON tree viewer",
    "online JSON viewer",
  ],
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#04313a" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: "JSON Viewer Online",
    description: siteDescription,
    images: [
      {
        url: "/android-chrome-256x256.png",
        width: 256,
        height: 256,
        alt: "JSON Viewer app icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "JSON Viewer Online",
    description: siteDescription,
    images: ["/android-chrome-256x256.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfeff" },
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
    <html lang="en" suppressHydrationWarning>
      <body className={fontsCssClass}>
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
