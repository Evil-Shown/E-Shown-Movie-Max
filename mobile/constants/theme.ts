/**
 * Chithra Cinema — design tokens
 *
 * Ported 1:1 from the web app's CSS custom properties (client/app/globals.css,
 * recovered from compiled output). Keep these in sync if the web app's
 * palette ever changes — this file is the single source of truth for the
 * mobile app's look.
 *
 * Theme is warm / light / editorial — NOT a dark cinema look. Cream
 * background, near-black warm text, burnt-orange accent.
 */

export const colors = {
  // Backgrounds
  bgPrimary: '#f7f4ef',
  bgSecondary: '#edeae3',
  bgDark: '#1c1917',
  bgCard: '#fefcf8',

  // Accents
  accentPrimary: '#c96a2b', // burnt orange — primary CTA / brand
  accentPrimaryHover: '#b85c24',
  accentWarm: '#e8a44a', // amber — ratings, highlights
  accentCool: '#4a7c8e', // teal-blue — eyebrows, secondary labels

  // Text
  textPrimary: '#1c1917',
  textSecondary: '#6b6560',
  textMuted: '#9c968f',
  textInverse: '#f7f4ef',

  // Borders (web used rgba over a light bg; flattened here for RN)
  border: 'rgba(28,25,23,0.08)',
  borderStrong: 'rgba(28,25,23,0.16)',
  borderHot: 'rgba(201,106,43,0.45)',

  // Tinted surfaces
  goldDim: 'rgba(201,106,43,0.12)',
  goldGlow: 'rgba(201,106,43,0.2)',
  blueGlow: 'rgba(74,124,142,0.12)',

  // Rating pill (hero / detail screen)
  ratingPillBg: 'rgba(201,106,43,0.16)',
  ratingPillBorder: 'rgba(201,106,43,0.45)',
  ratingPillText: '#7a3a12',

  // Utility
  white: '#ffffff',
  black: '#000000',
  overlayDark: 'rgba(28,25,23,0.65)', // poster gradient overlay
} as const;

export const fonts = {
  // Inter — body/UI text. Loaded via @expo-google-fonts/inter.
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemibold: 'Inter_600SemiBold',

  // Playfair Display — headings, titles, hero text, logo wordmark.
  heading: 'PlayfairDisplay_700Bold',
  headingBlack: 'PlayfairDisplay_800ExtraBold', // falls back to 700 if unavailable
  headingItalic: 'PlayfairDisplay_400Regular_Italic',

  // Used sparingly for cinematic brand accents (splash screen, logos).
  brand: 'Cinzel_600SemiBold',

  // Sinhala-script UI strings (splash, region tag).
  sinhala: 'NotoSansSinhala_500Medium',
} as const;

export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// React Native shadow props don't map directly from CSS box-shadow,
// so these are tuned approximations of the web app's --shadow-sm/md/lg.
export const shadows = {
  sm: {
    shadowColor: '#1c1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#1c1917',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#1c1917',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

// Poster card sizing — mirrors MovieRow-module cardSlot widths from the web
// app (152 / 176 / 200px breakpoints), simplified to two tiers for RN.
export const posterSizes = {
  row: { width: 132, height: 198 }, // 2:3 aspect ratio, horizontal rows
  grid: { width: 108, height: 162 }, // browse/search grid, narrower screens
} as const;

export const layout = {
  screenPadding: 16,
  cardGap: 12,
} as const;

export const theme = {
  colors,
  fonts,
  radii,
  spacing,
  shadows,
  posterSizes,
  layout,
} as const;

export type Theme = typeof theme;
export default theme;
