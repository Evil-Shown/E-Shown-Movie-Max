import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import DownloadsPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Offline Downloads",
  description: `Your downloaded movies and series on ${BRAND_NAME}. Watch anytime, anywhere.`,
};

export default function DownloadsPage() {
  return <DownloadsPageClient />;
}
