import type { Metadata } from "next";
import WatchlistPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Your saved movies and series on CHITHRA.",
};

export default function WatchlistPage() {
  return <WatchlistPageClient />;
}
