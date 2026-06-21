import type { LiveTvCategory, LiveTvChannel } from "./types";

export const LIVE_TV_CATEGORY_LABELS: Record<LiveTvCategory, string> = {
  local: "Local",
  sports: "Sports",
  entertainment: "Entertainment",
  news: "News",
  documentary: "Documentary",
  kids: "Kids",
};

function channel(
  id: string,
  name: string,
  category: LiveTvCategory,
  options: Partial<Pick<LiveTvChannel, "isHd" | "isFeatured" | "logo" | "logoColor" | "logoInitials" | "description">> = {}
): LiveTvChannel {
  const region = category === "local" ? "local" : "international";
  const initials =
    options.logoInitials ??
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  return {
    id,
    name,
    category,
    region,
    isHd: options.isHd ?? true,
    isFeatured: options.isFeatured ?? false,
    logo: options.logo,
    logoColor: options.logoColor ?? "#c96a2b",
    logoInitials: initials,
    description:
      options.description ??
      `Watch ${name} live — ${LIVE_TV_CATEGORY_LABELS[category]} channel on CHITHRA Cinema.`,
  };
}

export const LIVE_TV_CHANNELS: LiveTvChannel[] = [
  // Local Channels
  channel("hiru-tv", "Hiru TV", "local", {
    logo: "https://img.logo.dev/hirutv.lk",
    logoColor: "#2563eb",
    isFeatured: true,
    description: "Sri Lanka's leading Sinhala entertainment and news channel.",
  }),
  channel("tv-derana", "TV Derana", "local", { logo: "https://img.logo.dev/derana.lk", logoColor: "#dc2626" }),
  channel("sirasa-tv", "Sirasa TV", "local", {
    logo: "https://img.logo.dev/sirasatv.lk",
    logoColor: "#7c3aed",
    isFeatured: true,
    description: "Popular Sinhala music, drama, and entertainment.",
  }),
  channel("swarnavahini", "Swarnavahini", "local", { logo: "https://img.logo.dev/swarnavahini.lk", logoColor: "#ca8a04" }),
  channel("itn", "ITN", "local", { logo: "https://img.logo.dev/itn.lk", logoColor: "#0891b2" }),
  channel("rupavahini", "Rupavahini", "local", { logo: "https://img.logo.dev/rupavahini.lk", logoColor: "#be123c" }),
  channel("channel-eye", "Channel Eye", "local", { logo: "https://img.logo.dev/channeleye.lk", logoColor: "#4a7c8e" }),
  channel("shakthi-tv", "Shakthi TV", "local", { logo: "https://img.logo.dev/shakthitv.lk", logoColor: "#ea580c" }),
  channel("vasantham-tv", "Vasantham TV", "local", { logo: "https://img.logo.dev/vasantham.lk", logoColor: "#16a34a" }),
  channel("supreme-tv", "Supreme TV", "local", { logo: "https://img.logo.dev/supremetv.lk", logoColor: "#9333ea" }),

  // Sports
  channel("espn", "ESPN", "sports", {
    logo: "https://img.logo.dev/espn.com",
    logoColor: "#dc2626",
    isFeatured: true,
    description: "Global sports coverage — football, basketball, and more.",
  }),
  channel("sky-sports", "Sky Sports", "sports", { logo: "https://img.logo.dev/skysports.com", logoColor: "#1d4ed8" }),
  channel("star-sports", "Star Sports", "sports", { logo: "https://img.logo.dev/starsports.com", logoColor: "#2563eb" }),
  channel("sony-sports", "Sony Sports", "sports", { logo: "https://img.logo.dev/sonypicturesnetworks.com", logoColor: "#0f766e" }),
  channel("eurosport", "Eurosport", "sports", { logo: "https://img.logo.dev/eurosport.com", logoColor: "#475569" }),
  channel("bein-sports", "beIN Sports", "sports", { logo: "https://img.logo.dev/beinsports.com", logoColor: "#7c2d12" }),

  // Entertainment
  channel("hbo", "HBO", "entertainment", {
    logo: "https://img.logo.dev/hbo.com",
    logoColor: "#1c1917",
    isFeatured: true,
    description: "Premium series, films, and exclusive originals.",
  }),
  channel("axn", "AXN", "entertainment", { logo: "https://img.logo.dev/axn.com", logoColor: "#b91c1c" }),
  channel("warner-tv", "Warner TV", "entertainment", { logo: "https://img.logo.dev/warnertv.com", logoColor: "#1e40af" }),
  channel("mtv", "MTV", "entertainment", { logo: "https://img.logo.dev/mtv.com", logoColor: "#c96a2b" }),
  channel("comedy-central", "Comedy Central", "entertainment", { logo: "https://img.logo.dev/cc.com", logoColor: "#ca8a04" }),

  // News
  channel("cnn", "CNN", "news", {
    logo: "https://img.logo.dev/cnn.com",
    logoColor: "#dc2626",
    isFeatured: true,
    description: "Breaking news and global current affairs, 24/7.",
  }),
  channel("bbc-world-news", "BBC World News", "news", { logo: "https://img.logo.dev/bbc.com", logoColor: "#991b1b" }),
  channel("al-jazeera", "Al Jazeera", "news", { logo: "https://img.logo.dev/aljazeera.com", logoColor: "#b45309" }),
  channel("france-24", "France 24", "news", { logo: "https://img.logo.dev/france24.com", logoColor: "#1d4ed8" }),
  channel("dw", "DW", "news", { logo: "https://img.logo.dev/dw.com", logoColor: "#0369a1" }),

  // Documentary
  channel("discovery-channel", "Discovery Channel", "documentary", {
    logo: "https://img.logo.dev/discovery.com",
    logoColor: "#0284c7",
    isFeatured: true,
    description: "Science, nature, and exploration documentaries.",
  }),
  channel("national-geographic", "National Geographic", "documentary", { logo: "https://img.logo.dev/nationalgeographic.com", logoColor: "#ca8a04" }),
  channel("animal-planet", "Animal Planet", "documentary", { logo: "https://img.logo.dev/animalplanet.com", logoColor: "#15803d" }),
  channel("history-channel", "History Channel", "documentary", { logo: "https://img.logo.dev/history.com", logoColor: "#78716c" }),

  // Kids
  channel("cartoon-network", "Cartoon Network", "kids", { logo: "https://img.logo.dev/cartoonnetwork.com", logoColor: "#0ea5e9" }),
  channel("nickelodeon", "Nickelodeon", "kids", { logo: "https://img.logo.dev/nick.com", logoColor: "#f97316" }),
  channel("disney-channel", "Disney Channel", "kids", { logo: "https://img.logo.dev/disneynow.com", logoColor: "#2563eb" }),
  channel("boomerang", "Boomerang", "kids", { logoColor: "#eab308" }),
];

export const LIVE_TV_CHANNEL_MAP = new Map(LIVE_TV_CHANNELS.map((ch) => [ch.id, ch]));

export function getChannelById(id: string): LiveTvChannel | undefined {
  return LIVE_TV_CHANNEL_MAP.get(id);
}

export function getFeaturedChannels(): LiveTvChannel[] {
  return LIVE_TV_CHANNELS.filter((ch) => ch.isFeatured);
}
