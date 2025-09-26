"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadConnectionsPuzzle } from "@/lib/data";
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
        // Check if already played today
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
        
        // Get today's puzzle
        const data = await loadConnectionsPuzzle();
        if (!data) {
          setMessage("Puzzle not found.");
          return;
        }

        setPuzzle(data);
        setPool(shuffle(data.groups.flatMap((g) => g.words)));
        setSelected([]);
        setSolved([]);
        setMistakes(0);
        
        // Get current streak
        const streaks = dailyGameManager.getStreaks();
        setStreak(streaks.connections);
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
      <div className="container-page py-8 sm:py-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Connections</h1>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">Puzzle Complete!</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {gameWon ? `You solved today's Connections in ${4 - mistakes}/4!` : "Better luck tomorrow!"}
            </p>
            <div className="text-sm text-slate-500 mb-4">
              Current Streak: {streak}
            </div>
            <button
              onClick={shareResults}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Share Results
            </button>
          </div>
          <p className="text-sm text-slate-500">
            Come back tomorrow for a new puzzle!
          </p>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="container-page py-8 sm:py-10 text-center text-slate-500">
        Loading puzzle...
        {message && <div className="mt-4 text-red-500">{message}</div>}
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Connections</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500">
              Streak: {streak}
            </div>
            {!gameOver && (
              <>
                <button onClick={onShuffle} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Shuffle</button>
                <button
                  onClick={submit}
                  disabled={selected.length !== 4 || gameOver}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm",
                    selected.length === 4 ? "bg-blue-600 text-white" : "bg-black/10 dark:bg-white/10"
                  )}
                >Submit</button>
              </>
            )}
            {gameOver && (
              <button onClick={shareResults} className="rounded-md px-3 py-1.5 bg-green-600 text-white text-sm">Share</button>
            )}
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-sm text-slate-500">
            Mistakes: {mistakes}/4
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 rounded-md px-3 py-2 border border-black/10 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-sm text-center"
          >
            {message}
          </motion.div>
        )}

        <div className="mx-auto max-w-2xl">
          {/* Solved groups reveal */}
          <div className="space-y-2 mb-4">
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
                    className={cn("rounded-xl px-4 py-3", diffColor)}
                  >
                    <div className="font-semibold">{g.title}</div>
                    <div className="text-sm opacity-90">{g.words.join(" • ")}</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pool grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
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
                      "rounded-xl px-3 py-3 sm:py-4 font-semibold uppercase tracking-wide",
                      "border border-black/10 dark:border-white/10 bg-white dark:bg-slate-800 shadow-sm",
                      isSelected && "ring-2 ring-blue-500"
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
                className="mt-4 rounded-xl px-4 py-3 bg-green-500 text-white text-center"
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
                className="mt-4 rounded-xl px-4 py-3 bg-red-500 text-white text-center"
              >
                😔 Out of lives. Try again tomorrow!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}