import { ReactNode } from "react";
import NavBar from "@/components/nav-bar/NavBar";

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavBar
        actionVisibility={{
          back: false,
          forward: false,
          share: false,
          moreOptions: false,
        }}
      />
      {children}
    </>
  );
}
