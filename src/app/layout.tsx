import "./globals.css";
import { Ubuntu } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const fonts = [ubuntu];
const fontsCssClass = fonts.map((font) => font.className).join(" ");

export const metadata = {
  title: "JSON Viewer",
  description:
    "A web app designed to validate, format, and visualize JSON texts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <meta
        name="theme-color"
        media="(prefers-color-scheme: dark)"
        content="#0a0a0a"
      />
      <meta name="theme-color" content="#fdfeff" />
      <body className={fontsCssClass}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
