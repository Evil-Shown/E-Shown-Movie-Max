"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthActionHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthActionReady = (event: Event) => {
      const pending = (event as CustomEvent).detail;
      if (!pending) return;

      // Handle page navigation actions after auth
      if (pending.type === "page" && pending.payload?.href) {
        router.push(pending.payload.href);
      }
    };

    window.addEventListener("authActionReady", handleAuthActionReady);
    return () => window.removeEventListener("authActionReady", handleAuthActionReady);
  }, [router]);

  return null;
}
