import { ReactNode } from "react";
import InfoPageNavBar from "@/components/nav-bar/InfoPageNavBar";

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <InfoPageNavBar />
      {children}
    </>
  );
}
