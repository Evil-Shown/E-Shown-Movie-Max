import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import ChannelCard from "@/components/live-tv/ChannelCard";
import LiveTvNativePlayer from "@/components/live-tv/LiveTvNativePlayer";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { useLiveTvChannels } from "@/lib/api/hooks";
import { filterChannels } from "@/lib/live-tv/utils";
import type { LiveTvCategoryFilter, LiveTvChannel } from "@/lib/live-tv/types";

const CATEGORY_FILTERS: LiveTvCategoryFilter[] = [
  "all",
  "local",
  "sports",
  "entertainment",
  "news",
  "documentary",
  "kids",
];

export default function LiveTvScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useLiveTvChannels();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LiveTvCategoryFilter>("all");
  const [selectedChannel, setSelectedChannel] = useState<LiveTvChannel | null>(null);

  const categoryLabels = data?.categoryLabels ?? ({} as Record<string, string>);

  const filtered = useMemo(() => {
    if (!data?.channels) return [];
    return filterChannels(data.channels, query, category, categoryLabels);
  }, [data?.channels, query, category, categoryLabels]);

  const featured = useMemo(() => (data?.channels ?? []).filter((channel) => channel.isFeatured), [data?.channels]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentPrimary} size="large" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn&apos;t load Live TV</Text>
        <Pressable onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHITHRA CINEMA</Text>
        <Text style={styles.title}>Live TV</Text>
        <Text style={styles.subtitle}>Native HLS playback — no browser proxy</Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search channels…"
        placeholderTextColor={colors.textMuted}
        style={styles.search}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
        {CATEGORY_FILTERS.map((value) => {
          const active = category === value;
          const label = value === "all" ? "All" : (categoryLabels[value] ?? value);
          return (
            <Pressable
              key={value}
              onPress={() => setCategory(value)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {featured.length > 0 && category === "all" && !query.trim() && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <FlatList
            data={featured}
            keyExtractor={(item) => `featured-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.featuredCard}>
                <ChannelCard
                  channel={item}
                  categoryLabel={categoryLabels[item.category] ?? item.category}
                  selected={selectedChannel?.id === item.id}
                  onPress={setSelectedChannel}
                />
              </View>
            )}
          />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Channels ({filtered.length})</Text>}
        renderItem={({ item }) => (
          <ChannelCard
            channel={item}
            categoryLabel={categoryLabels[item.category] ?? item.category}
            selected={selectedChannel?.id === item.id}
            onPress={setSelectedChannel}
          />
        )}
      />

      <Modal visible={selectedChannel !== null} animationType="slide" onRequestClose={() => setSelectedChannel(null)}>
        <SafeAreaView style={styles.playerModal} edges={["top", "bottom"]}>
          <View style={styles.playerHeader}>
            <View style={styles.playerHeaderText}>
              <Text style={styles.playerEyebrow}>Now Playing</Text>
              <Text style={styles.playerTitle}>{selectedChannel?.name}</Text>
            </View>
            <Pressable
              onPress={() => setSelectedChannel(null)}
              style={styles.closeButton}
              accessibilityLabel="Close player"
            >
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
          <View style={styles.playerBody}>
            {selectedChannel ? <LiveTvNativePlayer channel={selectedChannel} /> : null}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgPrimary,
    padding: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  eyebrow: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.accentCool,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  search: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.textPrimary,
  },
  pills: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bgCard,
    marginRight: spacing.xs,
  },
  pillActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.goldDim,
  },
  pillText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.accentPrimary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.uiSemibold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  featuredCard: {
    width: 160,
    marginRight: spacing.sm,
  },
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  errorTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: {
    fontFamily: fonts.uiMedium,
    color: colors.accentPrimary,
  },
  playerModal: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  playerHeaderText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  playerEyebrow: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    color: colors.accentCool,
    textTransform: "uppercase",
  },
  playerTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgPrimary,
  },
  playerBody: {
    flex: 1,
    backgroundColor: colors.black,
  },
});
