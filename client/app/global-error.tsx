"use client";

import { useEffect } from "react";
import ErrorFallback from "@/components/ErrorFallback";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full bg-[var(--bg-primary)] antialiased">
        <ErrorFallback error={error} reset={reset} standalone />
      </body>
    </html>
  );
}
