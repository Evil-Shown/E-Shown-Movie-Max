import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/constants/theme';

interface RatingRingProps {
  rating: number;
  size?: number;
}

function ratingColor(rating: number): string {
  if (rating >= 7) return '#2E6B5E';
  if (rating >= 5) return '#C9943A';
  return '#8B3A2A';
}

/**
 * Circular rating indicator — ported from the web app's RatingRing.tsx.
 * An SVG ring filled proportionally to rating/10, color-coded by tier
 * (green ≥7, amber ≥5, red below), with the numeric score centered inside.
 */
export default function RatingRing({ rating, size = 28 }: RatingRingProps) {
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(rating / 10, 1);
  const offset = circumference * (1 - pct);
  const color = ratingColor(rating);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(28,25,23,0.12)"
          strokeWidth={stroke}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          // Rotate -90deg so the fill starts at 12 o'clock, matching the web
          // app's `-rotate-90` SVG transform.
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
  },
});
