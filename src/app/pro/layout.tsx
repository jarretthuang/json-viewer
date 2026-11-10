import { ReactNode } from "react";
import InfoPageNavBar from "@/components/nav-bar/InfoPageNavBar";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <InfoPageNavBar />
      <Breadcrumb />
      {children}
    </>
  );
}
