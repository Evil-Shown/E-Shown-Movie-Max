"use client";

import dynamic from "next/dynamic";

const StartupSplash = dynamic(() => import("@/components/StartupSplash/StartupSplash"), {
  ssr: false,
  loading: () => null,
});

export default function StartupSplashLoader() {
  return <StartupSplash />;
}
