"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import StudentProfile from "@/components/account/profile/profile";
import { isAuthenticated } from "@/lib/api";

const subscribe = () => () => {};

export default function ProfilePage() {
  const router = useRouter();
  const isLoggedIn = useSyncExternalStore(
    subscribe,
    () => isAuthenticated(),
    () => false,
  );

  useEffect(() => {
    if (!isLoggedIn) router.replace("/account");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center ">
        <span className="text-text-muted font-medium">جاري التحقق...</span>
      </div>
    );
  }

  return <StudentProfile />;
}
