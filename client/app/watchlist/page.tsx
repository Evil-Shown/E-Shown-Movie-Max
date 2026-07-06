import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import WatchlistPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Watchlist",
  description: `Your saved movies and series on ${BRAND_NAME}.`,
};

export default function WatchlistPage() {
  return <WatchlistPageClient />;
}
