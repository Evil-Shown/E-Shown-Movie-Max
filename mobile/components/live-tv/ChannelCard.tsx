import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radii, spacing } from "@/constants/theme";
import type { LiveTvChannel } from "@/lib/live-tv/types";

interface ChannelCardProps {
  channel: LiveTvChannel;
  categoryLabel: string;
  selected?: boolean;
  onPress: (channel: LiveTvChannel) => void;
}

export default function ChannelCard({ channel, categoryLabel, selected, onPress }: ChannelCardProps) {
  return (
    <Pressable
      onPress={() => onPress(channel)}
      style={[styles.card, selected && styles.cardSelected]}
      accessibilityRole="button"
      accessibilityLabel={`Watch ${channel.name}`}
    >
      <View style={[styles.logoWrap, { backgroundColor: channel.logoColor }]}>
        {channel.logo ? (
          <Image source={{ uri: channel.logo }} style={styles.logoImage} resizeMode="contain" />
        ) : (
          <Text style={styles.initials}>{channel.logoInitials}</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {channel.name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {categoryLabel}
        {channel.isHd ? " · HD" : ""}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    minWidth: 140,
  },
  cardSelected: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.goldDim,
  },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  initials: {
    fontFamily: fonts.uiSemibold,
    fontSize: 13,
    color: colors.white,
  },
  name: {
    fontFamily: fonts.uiSemibold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
