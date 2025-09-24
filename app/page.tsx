import GameCard from "@/components/GameCard";
import Link from "next/link";

function getStats() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("stats") || "null"); } catch { return null; }
}

export default function HomePage() {
  return (
    <div className="container-page py-10 sm:py-14">
      {/* Hero */}
      <section className="mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-sm">
          <span>Welcome, Jessie</span>
          <span>❤️</span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
          Your daily word games, with a personal touch
        </h1>
        <p className="mt-3 max-w-2xl opacity-80">
          Play Wordle and Connections tailored to your favorite themes and memories.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/wordle" className="rounded-xl px-4 py-2 bg-[var(--accent)] text-white">Play Wordle</Link>
          <Link href="/connections" className="rounded-xl px-4 py-2 border border-black/10 dark:border-white/10">Play Connections</Link>
        </div>
      </section>

      {/* Game cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
        <GameCard href="/wordle" title="Wordle" description="Guess the word in 6 tries." />
        <GameCard href="/connections" title="Connections" description="Find 4 groups of 4 related words." />
      </section>

      {/* Recent activity */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl p-5 border border-black/10 dark:border-white/10 bg-[var(--card)]">
          <div className="mb-2 font-semibold">Recent Activity</div>
          <div className="text-sm opacity-80">Wordle stats pull from your device</div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <Stat label="Games" value={<span id="stat-games">—</span>} />
            <Stat label="Wins" value={<span id="stat-wins">—</span>} />
            <Stat label="Streak" value={<span id="stat-streak">—</span>} />
          </div>
        </div>
        <div className="rounded-2xl p-5 border border-black/10 dark:border-white/10 bg-[var(--card)]">
          <div className="mb-2 font-semibold">Personal Touch</div>
          <div className="text-sm opacity-80">Tuned to Jessie's favorite colors and themes.</div>
          <div className="mt-2 h-2 w-full rounded-full bg-gradient-to-r from-pink-500 via-[var(--accent)] to-purple-500"></div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  );
}
