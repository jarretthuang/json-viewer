import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare prototype — review only",
  robots: { index: false, follow: false },
};

export default function PrototypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
