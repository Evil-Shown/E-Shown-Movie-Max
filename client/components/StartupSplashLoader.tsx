"use client";

import StartupSplash from "@/components/StartupSplash/StartupSplash";
import { Suspense } from "react";

export default function StartupSplashLoader() {
  return (
    <Suspense fallback={null}>
      <StartupSplash />
    </Suspense>
  );
}
