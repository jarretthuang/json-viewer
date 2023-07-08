import "./globals.css";
import { Ubuntu } from "next/font/google";

// Customize the fonts you want to use here
const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const fonts = [ubuntu];
const fontsCssClass = fonts.map((font) => font.className).join(" ");

export const metadata = {
  title: "JSON Viewer - JH Labs",
  description: "A JSON viewer and editor tool built by Jarrett Huang.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <meta name = "theme-color" media = "(prefers-color-scheme: dark)" content = "# 171a1c" /> */}
      <meta name="theme-color" content="#fdfeff" />
      <body className={fontsCssClass}>{children}</body>
    </html>
  );
}
