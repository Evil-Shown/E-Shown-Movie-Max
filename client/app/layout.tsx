import type { Metadata } from "next";
import { Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NavigationProgress from "@/components/NavigationProgress";
import PageTransition from "@/components/PageTransition";
import QuickViewProvider from "@/components/QuickViewProvider";
import SplashScreen from "@/components/ChithraRekha/SplashScreen";
import VideoPlayerProvider from "@/components/VideoPlayerProvider";
import "@/components/ChithraRekha/SplashScreen.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
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
      className={`${inter.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <SplashScreen />
        <VideoPlayerProvider>
          <QuickViewProvider>
            <NavigationProgress />
            <Header />
            <main className="site-main flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <BackToTop />
          </QuickViewProvider>
        </VideoPlayerProvider>
      </body>
    </html>
  );
}
