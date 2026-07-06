import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts, radii, spacing } from '@/constants/theme';
import { formatRuntime } from '@/lib/format';
import type { Movie } from '@/lib/tmdb-types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
const PLAY_PATH = 'M8 5v14l11-7z';
const INFO_PATH = 'M11 9h2V7h-2m1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m0-18A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2m-1 15h2v-6h-2z';

interface HeroCarouselProps {
  movies: Movie[];
  onPlay?: (movie: Movie) => void;
  onTrailer?: (movie: Movie) => void;
}

const HERO_HEIGHT = 520;

export default function HeroCarousel({
  movies,
  onPlay,
  onTrailer,
}: HeroCarouselProps) {
  const router = useRouter();

  const [index, setIndex] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const movie = movies[index] ?? movies[0];

  const primaryGenre = movie?.genres?.[0];

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (movies.length <= 1) return;

    timerRef.current = setInterval(next, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [movies.length, next]);

  if (!movie) return null;

  return (
    <View style={styles.hero}>
      <Image
        source={{
          uri: `${BACKDROP_BASE}${movie.backdropPath}`,
        }}
        style={styles.backdrop}
        contentFit="cover"
        transition={500}
      />

      <LinearGradient
        colors={[
          'transparent',
          'rgba(0,0,0,0.25)',
          'rgba(0,0,0,0.65)',
          colors.bgPrimary,
        ]}
        locations={[0, 0.35, 0.7, 1]}
        style={styles.overlay}
      />

      <View style={styles.content}>
        <Text style={styles.badge}>
          NOW PLAYING
        </Text>

        <Text
          numberOfLines={2}
          style={styles.title}
        >
          {movie.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.rating}>
            ★ {movie.rating.toFixed(1)}
          </Text>

          <View style={styles.metaDot} />

          <Text style={styles.metaText}>
            {movie.year}
          </Text>

          {movie.runtime > 0 && (
            <>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>
                {formatRuntime(movie.runtime)}
              </Text>
            </>
          )}

          {primaryGenre && (
            <>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>
                {primaryGenre}
              </Text>
            </>
          )}
        </View>

        <Text
          numberOfLines={2}
          style={styles.description}
        >
          {movie.overview}
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.playBtn}
            onPress={() => onPlay?.(movie)}
          >
            <Svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
            >
              <Path
                d={PLAY_PATH}
                fill="#000"
              />
            </Svg>

            <Text style={styles.playBtnText}>
              Play
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => onTrailer?.(movie)}
          >
            <Text style={styles.secondaryBtnText}>
              Trailer
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            onPress={() =>
              router.push(`/movie/${movie.id}`)
            }
          >
            <Text style={styles.secondaryBtnText}>
              Details
            </Text>
          </Pressable>
        </View>
      </View>

      {movies.length > 1 && (
        <View style={styles.dots}>
          {movies.map((m, i) => (
            <Pressable
              key={m.id}
              onPress={() => setIndex(i)}
              style={[
                styles.dot,
                i === index &&
                  styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: colors.bgPrimary,
    overflow: 'hidden',
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingBottom: 85,
  },

  badge: {
    color: '#f97316',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },

  title: {
    fontFamily: fonts.headingBlack,
    fontSize: 38,
    lineHeight: 42,
    color: '#fff',
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 14,
  },

  rating: {
    color: '#fbbf24',
    fontWeight: '700',
    fontSize: 14,
  },

  metaText: {
    color: '#e5e5e5',
    fontSize: 13,
    fontWeight: '600',
  },

  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#999',
    marginHorizontal: 8,
  },

  description: {
    color: '#d4d4d4',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 22,
    maxWidth: '95%',
  },

  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 10,
  },

  playBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },

  secondaryBtn: {
    backgroundColor:
      'rgba(255,255,255,0.15)',

    borderWidth: 1,

    borderColor:
      'rgba(255,255,255,0.25)',

    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 10,
  },

  secondaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  dots: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor:
      'rgba(255,255,255,0.35)',
    marginHorizontal: 4,
  },

  dotActive: {
    width: 26,
    backgroundColor: '#fff',
  },
});