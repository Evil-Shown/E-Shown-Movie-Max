"use client";

import dynamic from "next/dynamic";

const GodsEyePage = dynamic(() => import("../t-boom/page"), {
  ssr: false,
  loading: () => (
    <div className="section-base flex min-h-[50vh] items-center justify-center px-6 py-16">
      <p className="text-sm text-[var(--text-secondary)]">Loading The God&apos;s Eye...</p>
    </div>
  )
});

export default GodsEyePage;
