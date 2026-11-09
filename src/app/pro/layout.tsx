import { ReactNode } from "react";
import InfoPageNavBar from "@/components/nav-bar/InfoPageNavBar";
import ProBreadcrumb from "./ProBreadcrumb";

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <InfoPageNavBar />
      <ProBreadcrumb />
      {children}
    </>
  );
}
