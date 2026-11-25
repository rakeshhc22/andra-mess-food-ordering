import type { ReactNode } from "react";
import { FloatingCartBar } from "@/components/ui/FloatingCartBar";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <FloatingCartBar />
    </>
  );
}
