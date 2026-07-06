import type { Metadata } from "next";
import { Cinzel, Geist_Mono, Inter, Noto_Sans_Sinhala, Playfair_Display } from "next/font/google";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NavigationProgress from "@/components/NavigationProgress";
import PageTransition from "@/components/PageTransition";
import QueryProvider from "@/components/QueryProvider";
import QuickViewProvider from "@/components/QuickViewProvider";
import SplashScreen from "@/components/ChithraRekha/SplashScreen";
import UserLibraryProvider from "@/components/UserLibraryProvider";
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

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const notoSinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala"],
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
      className={`${inter.variable} ${geistMono.variable} ${playfair.variable} ${cinzel.variable} ${notoSinhala.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <SplashScreen />
        <QueryProvider>
          <UserLibraryProvider>
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
          </UserLibraryProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
