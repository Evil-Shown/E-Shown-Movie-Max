import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { Movie } from '@/lib/tmdb-types';

const { width, height } = Dimensions.get('window');

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
const HERO_HEIGHT = Math.min(height * 0.55, 450);

const PLAY_PATH = 'M8 5v14l11-7z';

function backdropUrl(path: string) {
  return `${BACKDROP_BASE}${path}`;
}

interface HeroCarouselProps {
  movies: Movie[];
  onPlay?: (movie: Movie) => void;
  onTrailer?: (movie: Movie) => void;
}

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
    setIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (movies.length <= 1) return;

    timerRef.current = setInterval(next, 7000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [next, movies.length]);

  if (!movie) return null;
console.log('Movie:', movie.title);
console.log('Backdrop:', movie.backdropPath);
  return (
    <View style={styles.hero}>
      <Image
        source={{
          uri: backdropUrl(movie.backdropPath),
        }}
        style={styles.backdrop}
        contentFit="cover"
        transition={500}
      />

      <LinearGradient
        colors={[
          'transparent',
          'rgba(0,0,0,0.35)',
          'rgba(0,0,0,0.75)',
          colors.bgPrimary,
        ]}
        locations={[0, 0.45, 0.75, 1]}
        style={styles.overlay}
      />

      <View style={styles.content}>
        <Text style={styles.badge}>NOW PLAYING</Text>

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

          <View style={styles.separator} />

          <Text style={styles.metaText}>
            {movie.year}
          </Text>

          {primaryGenre && (
            <>
              <View style={styles.separator} />
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
            style={styles.playButton}
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

            <Text style={styles.playText}>
              Play
            </Text>
          </Pressable>

          <Pressable
            style={styles.trailerButton}
            onPress={() => onTrailer?.(movie)}
          >
            <Text style={styles.trailerText}>
              Trailer
            </Text>
          </Pressable>

          <Pressable
            style={styles.infoButton}
            onPress={() =>
              router.push(`/movie/${movie.id}`)
            }
          >
            <Text style={styles.infoText}>
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
                i === index && styles.activeDot,
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
    height: HERO_HEIGHT,
    position: 'relative',
    backgroundColor: colors.bgPrimary,
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
    paddingHorizontal: spacing.md,
    paddingBottom: 70,
  },

  badge: {
    color: '#f97316',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  title: {
    color: '#fff',
    fontSize: width > 380 ? 34 : 28,
    lineHeight: width > 380 ? 40 : 34,
    fontFamily: fonts.headingBlack,
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  rating: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '700',
  },

  metaText: {
    color: '#e5e5e5',
    fontSize: 13,
    fontWeight: '600',
  },

  separator: {
    width: 4,
    height: 4,
    borderRadius: 99,
    backgroundColor: '#aaa',
    marginHorizontal: 8,
  },

  description: {
    color: '#d4d4d4',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
    maxWidth: '95%',
  },

  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radii.md,
    marginRight: 10,
  },

  playText: {
    color: '#000',
    fontWeight: '700',
    marginLeft: 6,
  },

  trailerButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radii.md,
    marginRight: 10,
  },

  trailerText: {
    color: '#fff',
    fontWeight: '600',
  },

  infoButton: {
    paddingHorizontal: 10,
    paddingVertical: 11,
  },

  infoText: {
    color: '#d4d4d4',
    fontWeight: '600',
  },

  dots: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,

    flexDirection: 'row',
    justifyContent: 'center',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: 4,
  },

  activeDot: {
    width: 24,
    backgroundColor: '#fff',
  },
});