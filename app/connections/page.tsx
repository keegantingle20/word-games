"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTodaysConnectionsPuzzle } from "@/lib/data";
import type { ConnectionsPuzzle } from "@/types/data";
import { cn } from "@/lib/utils";
import { dailyGameManager } from "@/lib/dailyGames";

// Difficulty color map (NYT-like): yellow, green, blue, purple
const DIFF_COLORS: Record<number, string> = {
  0: "bg-yellow-400 text-black",
  1: "bg-green-500 text-white",
  2: "bg-blue-500 text-white",
  3: "bg-purple-500 text-white",
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ConnectionsPage() {
  const [puzzle, setPuzzle] = useState<ConnectionsPuzzle | null>(null);
  const [pool, setPool] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<string>("");
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  
  // Daily game state
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);

  const solutionMap = useMemo(() => {
    const m = new Map<string, number>();
    puzzle?.groups.forEach((g, i) => g.words.forEach((w) => m.set(w, i)));
    return m;
  }, [puzzle]);

  useEffect(() => {
    (async () => {
      try {
        // Get today's puzzle
        const data = getTodaysConnectionsPuzzle();
        if (!data) {
          setMessage("Puzzle not found.");
          return;
        }

        setPuzzle(data);
        setPool(shuffle(data.groups.flatMap((g) => g.words)));
        setSelected([]);
        setSolved([]);
        setMistakes(0);
        
        // Check if already played today (only on client side)
        if (typeof window !== "undefined") {
          const played = dailyGameManager.hasPlayedToday("connections");
          setHasPlayedToday(played);
          
          if (played) {
            setGameComplete(true);
            const gameState = dailyGameManager.getGameState("connections");
            if (gameState.won) {
              setGameWon(true);
              setSolved([0, 1, 2, 3]);
            } else {
              setGameLost(true);
            }
          }
          
          // Get current streak
          const streaks = dailyGameManager.getStreaks();
          setStreak(streaks.connections);
        }
      } catch (e) {
        console.error(e);
        setMessage("Failed to load puzzle");
      }
    })();
  }, []);

  const gameOver = mistakes >= 4 || solved.length === 4 || gameComplete;

  useEffect(() => {
    if (gameWon && !gameComplete) {
      // Mark game as won
      dailyGameManager.markGamePlayed("connections", true, { 
        mistakes: mistakes,
        puzzleId: puzzle?.id || ""
      });
      setGameComplete(true);
      
      // Update streak
      const streaks = dailyGameManager.getStreaks();
      setStreak(streaks.connections);
    }
  }, [gameWon, gameComplete, mistakes, puzzle]);

  function toggle(word: string) {
    if (gameOver) return;
    if (solved.some((gi) => puzzle!.groups[gi].words.includes(word))) return;
    setSelected((s) =>
      s.includes(word) ? s.filter((w) => w !== word) : s.length < 4 ? [...s, word] : s
    );
  }

  function submit() {
    if (gameOver || selected.length !== 4 || !puzzle) return;
    
    const groupIdxs = selected.map((w) => solutionMap.get(w));
    const allSame = groupIdxs.every((g) => g === groupIdxs[0]);
    
    if (allSame && groupIdxs[0] != null) {
      const idx = groupIdxs[0]!;
      if (!solved.includes(idx)) setSolved((s) => [...s, idx]);
      setPool((p) => p.filter((w) => !puzzle.groups[idx].words.includes(w)));
      setSelected([]);
      setMessage("Correct!");
      setTimeout(() => setMessage(""), 1500);
      
      if (solved.length === 3) {
        setGameWon(true);
      }
    } else {
      setMistakes((m) => m + 1);
      setSelected([]);
      setMessage("Not a category");
      setTimeout(() => setMessage(""), 1000);
      
      if (mistakes >= 3) {
        setGameLost(true);
        dailyGameManager.markGamePlayed("connections", false, { 
          mistakes: mistakes + 1,
          puzzleId: puzzle.id
        });
        setGameComplete(true);
      }
    }
  }

  function onShuffle() {
    if (gameOver) return;
    setPool((p) => shuffle(p));
  }

  const shareResults = () => {
    const shareText = dailyGameManager.getShareText("connections");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setMessage("Results copied to clipboard!");
      setTimeout(() => setMessage(""), 2000);
    } else {
      alert(shareText);
    }
  };

  if (hasPlayedToday) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">Connections</h1>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Puzzle Complete!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {gameWon ? `You solved today's Connections in ${4 - mistakes}/4!` : "Better luck tomorrow!"}
            </p>
            <div className="text-sm text-slate-500 dark:text-slate-500 mb-4">
              Current Streak: {streak}
            </div>
            <button
              onClick={shareResults}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Share Results
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Come back tomorrow for a new puzzle!
          </p>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-500 dark:text-slate-400">
        Loading puzzle...
        {message && <div className="mt-4 text-red-500">{message}</div>}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Connections</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-500">
              Streak: {streak}
            </div>
            {!gameOver && (
              <>
                <button 
                  onClick={onShuffle} 
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  Shuffle
                </button>
                <button
                  onClick={submit}
                  disabled={selected.length !== 4 || gameOver}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    selected.length === 4 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  )}
                >
                  Submit
                </button>
              </>
            )}
            {gameOver && (
              <button 
                onClick={shareResults} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Share
              </button>
            )}
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="text-sm text-slate-500 dark:text-slate-500">
            Mistakes: {mistakes}/4
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 text-center text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            {message}
          </motion.div>
        )}

        {/* Solved groups reveal */}
        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {solved.sort((a, b) => a - b).map((gi) => {
              const g = puzzle.groups[gi];
              const diffColor = DIFF_COLORS[gi] || "bg-gray-500 text-white";
              return (
                <motion.div
                  key={g.title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className={cn("rounded-lg px-4 py-3", diffColor)}
                >
                  <div className="font-semibold">{g.title}</div>
                  <div className="text-sm opacity-90">{g.words.join(" • ")}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Pool grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <AnimatePresence>
            {pool.map((w) => {
              const isSelected = selected.includes(w);
              return (
                <motion.button
                  key={w}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => toggle(w)}
                  className={cn(
                    "rounded-lg px-4 py-3 font-semibold uppercase tracking-wide transition-colors",
                    "border-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                    "hover:border-slate-300 dark:hover:border-slate-600",
                    isSelected && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  )}
                  disabled={gameOver}
                >
                  {w}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {gameWon && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-6 rounded-lg px-4 py-3 bg-green-500 text-white text-center font-medium"
            >
              🎉 Perfect! You found all the connections!
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {gameLost && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-6 rounded-lg px-4 py-3 bg-red-500 text-white text-center font-medium"
            >
              😔 Out of lives. Try again tomorrow!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}