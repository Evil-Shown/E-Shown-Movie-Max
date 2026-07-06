import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Geist_Mono, Inter } from "next/font/google";
import AmbientAudio from "@/components/AmbientAudio";
import BackToTop from "@/components/BackToTop";
import CinematicGrain from "@/components/CinematicGrain";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NavigationProgress from "@/components/NavigationProgress";
import PageTransition from "@/components/PageTransition";
import QuickViewProvider from "@/components/QuickViewProvider";
import VideoPlayerProvider from "@/components/VideoPlayerProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "E-Shown Movie Max",
    template: "%s | E-Shown Movie Max",
  },
  description:
    "Stream the world's best films. Discover trending hits, new releases, and timeless classics on E-Shown Movie Max.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${cinzel.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
        <VideoPlayerProvider>
          <QuickViewProvider>
            <CustomCursor />
            <NavigationProgress />
            <CinematicGrain />
            <Header />
            <main className="flex-1 pt-[72px]">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <BackToTop />
            <AmbientAudio />
          </QuickViewProvider>
        </VideoPlayerProvider>
      </body>
    </html>
  );
}
