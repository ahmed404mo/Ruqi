"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExamTake = /^\/educational-content\/exam\/[^/]+\/take/.test(pathname);

  return (
    <>
      {!isExamTake && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isExamTake && <Footer />}
    </>
  );
}
