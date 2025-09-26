"use client";
import GameCard from "@/components/GameCard";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { dailyGameManager } from "@/lib/dailyGames";

export default function HomePage() {
  const [stats, setStats] = useState({
    wordle: { played: false, won: false, streak: 0 },
    connections: { played: false, won: false, streak: 0 },
    miniCrossword: { played: false, won: false, streak: 0 },
  });

  useEffect(() => {
    const wordlePlayed = dailyGameManager.hasPlayedToday("wordle");
    const connectionsPlayed = dailyGameManager.hasPlayedToday("connections");
    const miniCrosswordPlayed = dailyGameManager.hasPlayedToday("miniCrossword");
    
    const streaks = dailyGameManager.getStreaks();
    
    setStats({
      wordle: { 
        played: wordlePlayed, 
        won: wordlePlayed ? dailyGameManager.getGameState("wordle").won : false,
        streak: streaks.wordle 
      },
      connections: { 
        played: connectionsPlayed, 
        won: connectionsPlayed ? dailyGameManager.getGameState("connections").won : false,
        streak: streaks.connections 
      },
      miniCrossword: { 
        played: miniCrosswordPlayed, 
        won: miniCrosswordPlayed ? dailyGameManager.getGameState("miniCrossword").won : false,
        streak: streaks.miniCrossword 
      },
    });
  }, []);

  return (
    <div className="container-page py-10 sm:py-14">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 sm:mb-16 text-center"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Word Games
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Play today's puzzles. New ones available every day.
        </p>
      </motion.section>

      {/* Games Grid */}
      <section className="mb-10 sm:mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <GameCard
            href="/wordle"
            title="Wordle"
            description="Guess the 5-letter word with 6 chances"
            accent="accent"
            status={stats.wordle.played ? (stats.wordle.won ? "won" : "lost") : "available"}
            streak={stats.wordle.streak}
          />
          <GameCard
            href="/connections"
            title="Connections"
            description="Group words that share a common thread"
            accent="success"
            status={stats.connections.played ? (stats.connections.won ? "won" : "lost") : "available"}
            streak={stats.connections.streak}
          />
          <GameCard
            href="/mini-crossword"
            title="Mini Crossword"
            description="Solve this bite-sized puzzle in just a few minutes"
            accent="warn"
            status={stats.miniCrossword.played ? (stats.miniCrossword.won ? "won" : "lost") : "available"}
            streak={stats.miniCrossword.streak}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-center">
          Your Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.1 }}
            className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-2">Wordle</h3>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <div>Current Streak: {stats.wordle.streak}</div>
              <div>Today: {stats.wordle.played ? (stats.wordle.won ? "✅ Won" : "❌ Lost") : "⏳ Not played"}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.2 }}
            className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-2">Connections</h3>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <div>Current Streak: {stats.connections.streak}</div>
              <div>Today: {stats.connections.played ? (stats.connections.won ? "✅ Won" : "❌ Lost") : "⏳ Not played"}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.3 }}
            className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-2">Mini Crossword</h3>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <div>Current Streak: {stats.miniCrossword.streak}</div>
              <div>Today: {stats.miniCrossword.played ? (stats.miniCrossword.won ? "✅ Won" : "❌ Lost") : "⏳ Not played"}</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}