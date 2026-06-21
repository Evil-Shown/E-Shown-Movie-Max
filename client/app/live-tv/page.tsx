import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import LiveTvPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Live TV",
  description: `Watch local Sri Lankan and international live TV channels on ${BRAND_NAME}.`,
};

export default function LiveTvPage() {
  return <LiveTvPageClient />;
}
