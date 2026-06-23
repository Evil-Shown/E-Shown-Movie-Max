import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import LiveTvPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Live TV",
  description: `Watch local Sri Lankan and international live TV channels on ${BRAND_NAME}.`,
};

export default function LiveTvPage() {
  return (
    <>
      <link rel="preconnect" href="https://www.google.com" />
      <link rel="dns-prefetch" href="https://i.imgur.com" />
      <link rel="dns-prefetch" href="https://iptv-org.github.io" />
      <link rel="dns-prefetch" href="https://tv.hiruhost.com" />
      <LiveTvPageClient />
    </>
  );
}
