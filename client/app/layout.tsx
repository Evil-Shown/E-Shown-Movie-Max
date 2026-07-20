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
import { BRAND_DESCRIPTION, BRAND_NAME } from "@/lib/brand";
import "@/components/CinemaIntro/cinema-intro.css";
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
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
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
                      <main className="site-main flex-1">
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
