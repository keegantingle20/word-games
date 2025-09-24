import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import RegisterSW from "@/components/RegisterSW";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Word Games",
  description: "Personalized collection of daily word games",
  openGraph: {
    title: "Word Games for Jessie",
    description: "Play personalized Wordle and Connections with themes and memories.",
    url: "https://example.com",
    siteName: "Word Games",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "Word Games" }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Games for Jessie",
    description: "Play personalized Wordle and Connections with themes and memories.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <link rel="manifest" href={(process.env.NEXT_PUBLIC_BASE_PATH||"") + "/manifest.webmanifest"} />
        <meta name="theme-color" content="#4f8cff" />
        <ThemeProvider>
          <RegisterSW />
          <div className="min-h-dvh flex flex-col">
            <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/30 border-b border-black/10 dark:border-white/10">
              <div className="container-page flex h-14 items-center justify-between">
                <div className="flex items-center gap-6">
                  <Link href="/" className="font-semibold tracking-tight">For Jessie ❤️</Link>
                  <nav className="hidden sm:flex items-center gap-4 text-sm opacity-80">
                    <Link href="/wordle" className="hover:opacity-100">Wordle</Link>
                    <Link href="/connections" className="hover:opacity-100">Connections</Link>
                    <Link href="/connections/library" className="hover:opacity-100">My Puzzles</Link>
                  </nav>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-black/10 dark:border-white/10">
              <div className="container-page py-6 text-sm opacity-70">© {new Date().getFullYear()} Word Games</div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
