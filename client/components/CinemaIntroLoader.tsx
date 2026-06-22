"use client";

import dynamic from "next/dynamic";

const CinemaIntro = dynamic(() => import("@/components/CinemaIntro/index"), { ssr: false });

export default function CinemaIntroLoader() {
  return <CinemaIntro />;
}
