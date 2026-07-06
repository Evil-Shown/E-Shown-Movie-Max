"use client";

import LiveTvChannelCard from "@/components/live-tv/LiveTvChannelCard";
import type { LiveTvChannel } from "@/lib/live-tv/types";
import { motion, useReducedMotion } from "framer-motion";
import { scaleInVariant, staggerContainer } from "@/lib/motion";

interface LiveTvChannelGridProps {
  channels: LiveTvChannel[];
  selectedChannelId?: string | null;
  favoriteIds: Set<string>;
  onSelect: (channel: LiveTvChannel) => void;
  onToggleFavorite: (channel: LiveTvChannel) => void;
}

export default function LiveTvChannelGrid({
  channels,
  selectedChannelId,
  favoriteIds,
  onSelect,
  onToggleFavorite,
}: LiveTvChannelGridProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
      variants={prefersReducedMotion ? undefined : staggerContainer}
      initial="hidden"
      animate="visible"
      key={channels.map((c) => c.id).join(",")}
    >
      {channels.map((channel, index) => (
        <motion.div
          key={channel.id}
          variants={prefersReducedMotion ? undefined : scaleInVariant}
          custom={index}
          transition={{ delay: index * 0.03 }}
        >
          <LiveTvChannelCard
            channel={channel}
            isSelected={selectedChannelId === channel.id}
            isFavorite={favoriteIds.has(channel.id)}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
