import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import RegisterSW from "@/components/RegisterSW";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Jessie's Games",
  description: "Play today's puzzles. New ones available every day.",
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`),
  manifest: `${basePath}/manifest.webmanifest`,
  other: {
    'version': '2.0.0',
    'build-time': new Date().toISOString(),
  },
  openGraph: {
    title: "Jessie's Games",
    description: "Play today's puzzles. New ones available every day.",
    url: "https://keegantingle20.github.io/word-games/",
    siteName: "Jessie's Games",
    images: [
      {
        url: `${basePath}/og.png`,
        width: 1200,
        height: 630,
        alt: "Word Games",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jessie's Games",
    description: "Play today's puzzles. New ones available every day.",
    images: [`${basePath}/og.png`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <div className="min-h-screen">
            <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <Link href="/" className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      Jessie's Games
                    </Link>
                  </div>
                  <nav className="hidden md:flex items-center space-x-8">
                    <Link href="/wordle" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
                      Wordle
                    </Link>
                    <Link href="/connections" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
                      Connections
                    </Link>
                    <Link href="/mini-crossword" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
                      Mini Crossword
                    </Link>
                  </nav>
                  <div className="flex items-center">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </header>
            <main className="bg-white dark:bg-slate-900">
              {children}
            </main>
            <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                  © {new Date().getFullYear()} Word Games
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
