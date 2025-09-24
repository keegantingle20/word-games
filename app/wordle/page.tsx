"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Keyboard from "./Keyboard";
import { cn } from "@/lib/utils";
import { loadWordleList } from "@/lib/data";
import type { WordEntry, WordleList } from "@/types/data";
import confetti from "canvas-confetti";

type CellState = "hit" | "near" | "miss" | undefined;

type GameState = "playing" | "won" | "lost";

const MAX_TRIES = 6;

function scoreGuess(guess: string, answer: string): CellState[] {
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

  // Settings
  const [mode, setMode] = useState<"daily" | "random">("daily");
  const [wordLen, setWordLen] = useState<number>(5);
  const [category, setCategory] = useState<string>("all");

  // Stats (localStorage)
  const statsRef = useRef<{ games: number; wins: number; streak: number; maxStreak: number; dist: number[] }>({ games: 0, wins: 0, streak: 0, maxStreak: 0, dist: [0,0,0,0,0,0] });
  useEffect(() => {
    try {
      const raw = localStorage.getItem("stats");
      if (raw) statsRef.current = JSON.parse(raw);
    } catch {}
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await loadWordleList("/data/wordle/words.en.json");
        if (ignore) return;
        setList(data);
        // Load custom words from localStorage and merge
        let custom: WordEntry[] = [];
        try {
          const raw = localStorage.getItem("customWords");
          if (raw) custom = JSON.parse(raw);
        } catch {}
        const merged = [...data.words, ...custom];
        setAllWords(merged);
        setWordsSet(new Set(merged.map((w) => w.word.toLowerCase())));
      } catch (e) {
        console.error(e);
        setMessage("Failed to load word list");
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Derive available categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    allWords.forEach((w) => w.categories?.forEach((c) => set.add(c)));
    return ["all", ...Array.from(set).sort()];
  }, [allWords]);

  // Pick answer when filters change
  useEffect(() => {
    if (!allWords.length) return;
    const filtered = allWords.filter((w) => w.word.length === wordLen && (category === "all" || w.categories?.includes(category)));
    if (!filtered.length) {
      setMessage("No words match filters");
      return;
    }
    const idx = mode === "daily" ? dayIndex() % filtered.length : Math.floor(Math.random() * filtered.length);
    const entry = filtered[idx];
    setAnswer(entry.word.toLowerCase());
    setAnswerEntry(entry);
    setRows([]); setStates([]); setCurrent(""); setGame("playing");
  }, [allWords, wordLen, category, mode]);

  const keyStates = useMemo(() => {
    const map: Record<string, CellState> = {};
    states.forEach((row, ri) => {
      row.forEach((s, i) => {
        const k = rows[ri]?.[i];
        if (!k) return;
        const prev = map[k];
        if (s === "hit" || (s === "near" && prev !== "hit") || (!prev && s)) map[k] = s;
      });
    });
    return map;
  }, [rows, states]);

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 1400);
  }

  function submit() {
    const WORD_LEN = answer.length || wordLen;
    if (game !== "playing" || current.length !== WORD_LEN || !answer) return;
    const guess = current.toLowerCase();
    if (!wordsSet.has(guess)) {
      setShakeRow(rows.length);
      showMessage("Not in word list");
      setTimeout(() => setShakeRow(null), 600);
      return;
    }
    const scored = scoreGuess(guess, answer);
    const nr = [...rows, guess];
    const ns = [...states, scored];
    setRows(nr);
    setStates(ns);
    setCurrent("");

    if (guess === answer) {
      setGame("won");
      try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } }); } catch {}
      // update stats
      const s = statsRef.current;
      s.games += 1; s.wins += 1; s.streak += 1; s.maxStreak = Math.max(s.maxStreak, s.streak); s.dist[nr.length - 1] = (s.dist[nr.length - 1] || 0) + 1;
      localStorage.setItem("stats", JSON.stringify(s));
    } else if (nr.length >= MAX_TRIES) {
      setGame("lost");
      const s = statsRef.current;
      s.games += 1; s.streak = 0; localStorage.setItem("stats", JSON.stringify(s));
    }
  }

  function onKey(k: string) {
    const WORD_LEN = answer.length || wordLen;
    if (game !== "playing") return;
    if (k === "Enter") return submit();
    if (k === "Backspace") return setCurrent((c) => c.slice(0, -1));
    if (/^[a-zA-Z]$/.test(k) && current.length < WORD_LEN) {
      setCurrent((c) => c + k.toLowerCase());
    }
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e.key);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [current, game, answer, wordsSet, wordLen]);

  function share() {
    const emoji = states
      .map((row) =>
        row
          .map((c) => (c === "hit" ? "🟩" : c === "near" ? "🟨" : "⬛"))
          .join("")
      )
      .join("\n");
    const title = `Wordle ${new Date().toISOString().slice(0,10)} ${game === "won" ? rows.length : "X"}/${MAX_TRIES}`;
    const cat = category === "all" ? "" : `\nCategory: ${category}`;
    const pm = answerEntry?.metadata?.personal?.note ? `\nNote: ${answerEntry?.metadata?.personal?.note}` : "";
    const text = `${title}${cat}${pm}\n${emoji}`;
    navigator.clipboard.writeText(text).then(
      () => showMessage("Copied results"),
      () => showMessage("Copy failed")
    );
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Wordle</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setRows([]); setStates([]); setCurrent(""); setGame("playing");
            }}
            className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm"
          >Reset</button>
          <button
            onClick={share}
            disabled={game === "playing" || !states.length}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm",
              game === "playing" ? "bg-black/10 dark:bg-white/10" : "bg-[var(--accent)] text-white"
            )}
          >Share</button>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="text-sm opacity-70">Mode</label>
        <select value={mode} onChange={(e) => setMode(e.target.value as "daily" | "random")} className="rounded-md border border-black/10 dark:border-white/10 bg-[var(--card)] px-2 py-1 text-sm">
          <option value="daily">Daily</option>
          <option value="random">Random</option>
        </select>
        <label className="text-sm opacity-70 ml-2">Length</label>
        <select value={wordLen} onChange={(e) => setWordLen(Number(e.target.value))} className="rounded-md border border-black/10 dark:border-white/10 bg-[var(--card)] px-2 py-1 text-sm">
          {[4,5,6].map((n) => (<option key={n} value={n}>{n}</option>))}
        </select>
        <label className="text-sm opacity-70 ml-2">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-black/10 dark:border-white/10 bg-[var(--card)] px-2 py-1 text-sm max-w-[14rem]">
          {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <button onClick={() => showMessage(answerEntry?.categories?.[0] || answerEntry?.metadata?.themes?.[0] || "No hint")} className="ml-auto rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Hint</button>
      </div>

      <div className="mx-auto max-w-md">
        <div className="grid grid-rows-6 gap-2 mb-6">
          {Array.from({ length: MAX_TRIES }).map((_, r) => {
            const word = rows[r] ?? (r === rows.length ? current : "");
            const rowState = states[r] ?? [];
            const isSubmitted = !!states[r];
            return (
              <motion.div
                key={r}
                className="grid grid-cols-5 gap-2"
                animate={shakeRow === r ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {Array.from({ length: answer.length || wordLen }).map((_, c) => {
                  const ch = word[c] ?? "";
                  const st = rowState[c];
                  return (
                    <motion.div
                      key={c}
                      className={cn(
                        "aspect-square rounded-lg grid place-items-center text-xl font-bold uppercase",
                        "border border-black/10 dark:border-white/10 bg-[var(--card)]",
                        st === "hit" && "bg-green-500 text-white border-green-500",
                        st === "near" && "bg-yellow-400 text-black border-yellow-400",
                        st === "miss" && "bg-neutral-400 text-black border-transparent",
                      )}
                      initial={false}
                      animate={isSubmitted && st ? { rotateX: 180 } : { rotateX: 0 }}
                      transition={{ duration: 0.35, delay: isSubmitted ? c * 0.08 : 0 }}
                    >
                      {ch}
                    </motion.div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 rounded-xl px-4 py-3 text-sm border border-black/10 dark:border-white/10 bg-[var(--card)]"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {game !== "playing" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className={cn(
                "mb-4 rounded-xl px-4 py-3 text-sm",
                game === "won" ? "bg-green-500 text-white" : "bg-red-500 text-white"
              )}
            >
              {game === "won" ? (answerEntry?.metadata?.personal?.note ? `Nice! ${answerEntry.metadata.personal.note}` : "Nice! You got it.") : `The word was “${answer}”.`}
            </motion.div>
          )}
        </AnimatePresence>

        <Keyboard onKey={onKey} keyStates={keyStates} />
      </div>
    </div>
  );
}
