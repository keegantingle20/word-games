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
    if (typeof window !== "undefined") {
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
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Jessie's Games
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Play today's puzzles. New ones available every day.
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <GameCard
          href="/wordle"
          title="Wordle"
          description="Guess the 5-letter word with 6 chances"
          status={stats.wordle.played ? (stats.wordle.won ? "won" : "lost") : "available"}
          streak={stats.wordle.streak}
        />
        <GameCard
          href="/connections"
          title="Connections"
          description="Group words that share a common thread"
          status={stats.connections.played ? (stats.connections.won ? "won" : "lost") : "available"}
          streak={stats.connections.streak}
        />
        <GameCard
          href="/mini-crossword"
          title="Mini Crossword"
          description="Solve this bite-sized puzzle in just a few minutes"
          status={stats.miniCrossword.played ? (stats.miniCrossword.won ? "won" : "lost") : "available"}
          streak={stats.miniCrossword.streak}
        />
      </div>

      {/* Stats Section */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
          Your Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {stats.wordle.streak}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Wordle Streak</div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              {stats.wordle.played ? (stats.wordle.won ? "✅ Today" : "❌ Today") : "⏳ Not played"}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {stats.connections.streak}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Connections Streak</div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              {stats.connections.played ? (stats.connections.won ? "✅ Today" : "❌ Today") : "⏳ Not played"}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {stats.miniCrossword.streak}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Mini Crossword Streak</div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              {stats.miniCrossword.played ? (stats.miniCrossword.won ? "✅ Today" : "❌ Today") : "⏳ Not played"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}