import type { Metadata, Viewport } from "next";
import { Cinzel, Inter, Noto_Sans_Sinhala, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import AuthActionHandler from "@/components/AuthActionHandler";
import AuthModalProvider from "@/components/AuthModalProvider";
import AuthProvider from "@/components/AuthProvider";
import BackToTop from "@/components/BackToTop";
import StartupSplashLoader from "@/components/StartupSplashLoader";
import DesktopMediaPauseHandler from "@/components/DesktopMediaPauseHandler";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NavigationProgress from "@/components/NavigationProgress";
import PageTransition from "@/components/PageTransition";
import QueryProvider from "@/components/QueryProvider";
import QuickViewProvider from "@/components/QuickViewProvider";
import ThemeProvider from "@/components/ThemeProvider";
import UserLibraryProvider from "@/components/UserLibraryProvider";
import VideoPlayerProvider from "@/components/VideoPlayerProvider";
import { BRAND_DESCRIPTION, BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { DEFAULT_PRODUCTION_APP } from "@/lib/app-origin";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const notoSinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(DEFAULT_PRODUCTION_APP),
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  authors: [{ name: "Damitha Samarakoon" }],
  creator: "Damitha Samarakoon",
  publisher: "CHITHRA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: BRAND_NAME,
    title: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: BRAND_TAGLINE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@chithracinema",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffbf5" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
  ],
};

function HeaderFallback() {
  return <div className="h-[72px] w-full shrink-0" aria-hidden />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${cinzel.variable} ${notoSinhala.variable} h-full antialiased`}
    >
      <head>
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--accent-primary)] focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <StartupSplashLoader />
          <AuthProvider>
            <AuthModalProvider>
              <AuthActionHandler />
              <QueryProvider>
                <UserLibraryProvider>
                  <VideoPlayerProvider>
                    <QuickViewProvider>
                      <NavigationProgress />
                      <Suspense fallback={<HeaderFallback />}>
                        <Header />
                      </Suspense>
                      <main id="main-content" className="site-main flex-1">
                        <PageTransition>{children}</PageTransition>
                      </main>
                      <Footer />
                      <BackToTop />
                    </QuickViewProvider>
                    <DesktopMediaPauseHandler />
                  </VideoPlayerProvider>
                </UserLibraryProvider>
              </QueryProvider>
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
