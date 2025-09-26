"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Keyboard from "./Keyboard";
import { cn } from "@/lib/utils";
import { getTodaysWordleWord, loadPersonalWordleList } from "@/lib/data";
import confetti from "canvas-confetti";
import { dailyGameManager } from "@/lib/dailyGames";
import type { WordleList, WordEntry } from "@/types/data";

type CellState = "hit" | "near" | "miss" | undefined;
type GameState = "playing" | "won" | "lost";

function evaluateGuess(guess: string, answer: string): CellState[] {
  const n = answer.length;
  const res: CellState[] = Array(n).fill("miss");
  const a = answer.split("");
  const g = guess.split("");
  const used = Array(n).fill(false);
  
  for (let i = 0; i < n; i++) {
    if (g[i] === a[i]) {
      res[i] = "hit";
      used[i] = true;
      g[i] = "_";
    }
  }
  
  for (let i = 0; i < n; i++) {
    if (res[i] === "hit") continue;
    const idx = a.findIndex((ch, j) => ch === g[i] && !used[j]);
    if (idx !== -1) {
      res[i] = "near";
      used[idx] = true;
    }
  }
  return res;
}

function dayIndex(date = new Date()) {
  const epoch = new Date("2024-01-01T00:00:00Z").getTime();
  return Math.floor((date.getTime() - epoch) / (1000 * 60 * 60 * 24));
}

export default function WordlePage() {
  console.log("🎮 WordlePage component rendering");
  
  const [list, setList] = useState<WordleList | null>(null);
  const [allWords, setAllWords] = useState<WordEntry[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [answerEntry, setAnswerEntry] = useState<WordEntry | null>(null);
  const [wordsSet, setWordsSet] = useState<Set<string>>(new Set());

  const [rows, setRows] = useState<string[]>([]);
  const [states, setStates] = useState<CellState[][]>([]);
  const [current, setCurrent] = useState("");
  const [game, setGame] = useState<GameState>("playing");
  const [message, setMessage] = useState<string>("");
  const [shakeRow, setShakeRow] = useState<number | null>(null);

  // Daily game state
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);

  // Stats (localStorage)
  const statsRef = useRef<{ games: number; wins: number; streak: number; maxStreak: number; dist: number[] }>({ games: 0, wins: 0, streak: 0, maxStreak: 0, dist: [0,0,0,0,0,0] });
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("stats");
        if (raw) statsRef.current = JSON.parse(raw);
      } catch {}
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        console.log("🎮 Wordle page loading...");
        
        // Load personal word collection first
        const personalList = await loadPersonalWordleList();
        console.log("📚 Personal list result:", personalList ? `${personalList.words.length} words` : "null");
        
        if (personalList && !ignore) {
          console.log("✅ Using personal word collection");
          setList(personalList);
          setAllWords(personalList.words);
          
          // Create word set for validation
          const words = new Set(personalList.words.map(w => w.word));
          setWordsSet(words);
          
          // Get today's word from personal collection
          const today = new Date();
          const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
          const index = dayOfYear % personalList.words.length;
          const todayWord = personalList.words[index].word;
          
          console.log(`🎯 Today's word from personal collection: ${todayWord} (day ${dayOfYear}, index ${index})`);
          
          setAnswer(todayWord);
          setAnswerEntry(personalList.words[index]);
        } else {
          console.log("⚠️ Falling back to built-in words");
          // Fallback to built-in word
          const todayWord = getTodaysWordleWord();
          if (ignore) return;
          
          console.log(`🎯 Today's word from built-in: ${todayWord}`);
          
          setAnswer(todayWord);
          setAnswerEntry({
            word: todayWord,
            categories: ["daily"],
            metadata: {
              difficulty: "medium",
              themes: ["daily"],
              personal: { note: "Today's word" }
            }
          });
          
          // Create a simple word set for validation
          const words = new Set([todayWord]);
          setWordsSet(words);
        }
        
        // Check if already played today (only on client side)
        if (typeof window !== "undefined") {
          const played = dailyGameManager.hasPlayedToday("wordle");
          setHasPlayedToday(played);
          
          if (played) {
            setGameComplete(true);
            const gameState = dailyGameManager.getGameState("wordle");
            if (gameState.won) {
              setGame("won");
              const guesses = 'guesses' in gameState ? gameState.guesses : 6;
              setRows(Array(guesses).fill(""));
              setStates(Array(guesses).fill([]));
            } else {
              setGame("lost");
              setRows(Array(6).fill(""));
              setStates(Array(6).fill([]));
            }
          }
          
          // Get current streak
          const streaks = dailyGameManager.getStreaks();
          setStreak(streaks.wordle);
        }
      } catch (e) {
        console.error(e);
        setMessage("Failed to load words");
      }
    })();
    return () => { ignore = true; };
  }, []);

  const onKey = useCallback((key: string) => {
    console.log("🔑 onKey called with:", key);
    console.log("🔍 Current game state:", { game, gameComplete, current, answer });
    
    // Simple test - just add letter to current word
    if (key === "A" || key === "a") {
      console.log("✅ Adding A to current word");
      setCurrent(prev => {
        const newCurrent = prev + "A";
        console.log("📝 New current word:", newCurrent);
        return newCurrent;
      });
      return;
    }
    
    // Check if game is in playing state
    if (game !== "playing" || gameComplete) {
      console.log("⚠️ Game not in playing state - ignoring key");
      return;
    }
    
    if (key === "ENTER") {
      if (current.length !== 5) {
        setMessage("Not enough letters");
        setTimeout(() => setMessage(""), 2000);
        return;
      }
      if (!wordsSet.has(current)) {
        setMessage("Not in word list");
        setTimeout(() => setMessage(""), 2000);
        return;
      }
      
      const newRows = [...rows, current];
      const newStates = [...states, evaluateGuess(current, answer)];
      setRows(newRows);
      setStates(newStates);
      
      if (current === answer) {
        setGame("won");
        setMessage("Correct!");
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        
        // Mark game as won
        dailyGameManager.markGamePlayed("wordle", true, { 
          guesses: newRows.length, 
          word: answer 
        });
        setGameComplete(true);
        
        // Update stats
        statsRef.current.games++;
        statsRef.current.wins++;
        statsRef.current.streak++;
        statsRef.current.maxStreak = Math.max(statsRef.current.maxStreak, statsRef.current.streak);
        statsRef.current.dist[newRows.length - 1]++;
        localStorage.setItem("stats", JSON.stringify(statsRef.current));
        
        setStreak(statsRef.current.streak);
      } else if (newRows.length === 6) {
        setGame("lost");
        setMessage(`The word was ${answer.toUpperCase()}`);
        
        // Mark game as lost
        dailyGameManager.markGamePlayed("wordle", false, { 
          guesses: 6, 
          word: answer 
        });
        setGameComplete(true);
        
        // Update stats
        statsRef.current.games++;
        statsRef.current.streak = 0;
        localStorage.setItem("stats", JSON.stringify(statsRef.current));
        
        setStreak(0);
      }
      
      setCurrent("");
    } else if (key === "BACKSPACE") {
      setCurrent(prev => prev.slice(0, -1));
    } else if (key.match(/[A-Z]/) && key.length === 1) {
      setCurrent(prev => prev.length < 5 ? prev + key : prev);
    }
  }, [game, gameComplete, current, answer, rows, states, wordsSet]);

  // Test if onKey function is defined
  console.log("🔧 onKey function defined:", typeof onKey);

  // Watch current state changes
  useEffect(() => {
    console.log("📝 Current state changed to:", current);
  }, [current]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log("🎹 Keyboard pressed:", event.key);
      
      const key = event.key.toUpperCase();
      
      // Handle letter keys
      if (key.match(/[A-Z]/) && key.length === 1) {
        console.log("📝 Letter key:", key);
        onKey(key);
      }
      // Handle Enter key
      else if (key === "ENTER") {
        console.log("⏎ Enter key");
        onKey("ENTER");
      }
      // Handle Backspace key
      else if (key === "BACKSPACE") {
        console.log("⌫ Backspace key");
        onKey("BACKSPACE");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKey]);

  const shareResults = () => {
    const shareText = dailyGameManager.getShareText("wordle");
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
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">Wordle</h1>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Puzzle Complete!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {game === "won" ? `You solved today's Wordle in ${rows.length}/6!` : "Better luck tomorrow!"}
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Wordle</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-500">
              Streak: {streak}
            </div>
            {gameComplete && (
              <button
                onClick={shareResults}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Share
              </button>
            )}
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

        <div className="space-y-2 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              {Array.from({ length: 5 }).map((_, j) => {
                // Show current word being typed in the first empty row
                const letter = rows[i]?.[j] || (i === rows.length ? current[j] || "" : "");
                const state = states[i]?.[j];
                const isShaking = shakeRow === i;
                
                return (
                  <motion.div
                    key={j}
                    className={cn(
                      "w-12 h-12 border-2 flex items-center justify-center text-lg font-bold uppercase",
                      state === "hit" && "bg-green-500 text-white border-green-500",
                      state === "near" && "bg-yellow-500 text-white border-yellow-500",
                      state === "miss" && "bg-slate-500 text-white border-slate-500",
                      !state && letter && "border-slate-300 dark:border-slate-600",
                      !state && !letter && "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    )}
                    animate={isShaking ? { x: [-2, 2, -2, 2, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {letter}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        <Keyboard
          onKey={onKey}
          keyStates={{}}
        />
        
        {/* Debug test buttons */}
        <div className="mt-4 text-center space-y-2">
          <button 
            onClick={() => {
              console.log("Button clicked!");
              alert("Button clicked!");
              onKey("A");
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          >
            Test Key A
          </button>
          <button 
            onClick={() => {
              console.log("Direct setCurrent called!");
              setCurrent(prev => prev + "B");
            }}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Direct Add B
          </button>
          <div className="text-sm text-gray-600">
            Current word: "{current}"
          </div>
        </div>

        {game === "won" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 text-center"
          >
            <div className="text-2xl mb-2">🎉</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Congratulations!</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              You solved today's Wordle in {rows.length}/6!
            </div>
          </motion.div>
        )}

        {game === "lost" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 text-center"
          >
            <div className="text-2xl mb-2">😔</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Better luck tomorrow!</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              The word was {answer.toUpperCase()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}