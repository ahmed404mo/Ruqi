"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/api";

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/account/profile");
    }
  }, [router]);

  if (isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
