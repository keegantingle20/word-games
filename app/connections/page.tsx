"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadConnectionsPuzzle } from "@/lib/data";
import type { ConnectionsPuzzle } from "@/types/data";
import { cn } from "@/lib/utils";

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
  const [solved, setSolved] = useState<number[]>([]); // store solved group indexes
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<string>("");
  const [hint, setHint] = useState<string>("");

  const solutionMap = useMemo(() => {
    const m = new Map<string, number>();
    puzzle?.groups.forEach((g, i) => g.words.forEach((w) => m.set(w, i)));
    return m;
  }, [puzzle]);

  useEffect(() => {
    (async () => {
      try {
        const data = await loadConnectionsPuzzle();
        setPuzzle(data);
        setPool(shuffle(data.groups.flatMap((g) => g.words)));
        // try restore autosave
        try {
          const raw = localStorage.getItem(`conn_save_${data.id}`);
          if (raw) {
            const save = JSON.parse(raw);
            setPool(save.pool || []);
            setSelected(save.selected || []);
            setSolved(save.solved || []);
            setMistakes(save.mistakes || 0);
          }
        } catch {}
      } catch (e) {
        console.error(e);
        setMessage("Failed to load puzzle");
      }
    })();
  }, []);

  const gameOver = mistakes >= 4 || (puzzle && solved.length === 4) || false;
  const won = puzzle && solved.length === 4;

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
    } else {
      setMistakes((m) => m + 1);
      setSelected([]);
      setMessage("Not a category");
      setTimeout(() => setMessage(""), 1000);
    }
  }

  function onShuffle() {
    setPool((p) => shuffle(p));
  }

  // Autosave progress
  useEffect(() => {
    if (!puzzle) return;
    try {
      localStorage.setItem(`conn_save_${puzzle.id}`, JSON.stringify({ pool, selected, solved, mistakes }));
    } catch {}
  }, [puzzle, pool, selected, solved, mistakes]);

  function showHint() {
    if (!puzzle) return;
    // show first unsolved group's hint or personal note
    const idx = [0,1,2,3].find((i) => !solved.includes(i));
    if (idx == null) return;
    const g = puzzle.groups[idx];
    const text = g.hint || g.personal?.note || "No hint available";
    setHint(text);
    setTimeout(() => setHint(""), 2000);
  }

  function share() {
    if (!puzzle) return;
    const solvedLines = solved.map((gi) => {
      const g = puzzle.groups[gi];
      return `${g.title}: ${g.words.join(", ")}`;
    }).join("\n");
    const title = `Connections ${puzzle.title || puzzle.id} ${solved.length}/4${mistakes ? `, mistakes ${mistakes}` : ""}`;
    const text = `${title}\n${solvedLines}`;
    navigator.clipboard.writeText(text).then(
      () => setMessage("Copied puzzle results"),
      () => setMessage("Copy failed")
    );
    setTimeout(() => setMessage(""), 1200);
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Connections</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm opacity-70">Mistakes: {mistakes}/4</div>
          <button onClick={showHint} disabled={!puzzle || solved.length===4} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Hint</button>
          <button onClick={onShuffle} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Shuffle</button>
          <button onClick={share} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Share</button>
          <button
            onClick={submit}
            disabled={selected.length !== 4 || gameOver}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm",
              selected.length === 4 ? "bg-[var(--accent)] text-white" : "bg-black/10 dark:bg-white/10"
            )}
          >Submit</button>
        </div>
      </div>

      {(message || hint) && (
        <div className="mb-3 rounded-md px-3 py-2 border border-black/10 dark:border-white/10 bg-[var(--card)] text-sm">
          {message || hint}
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        {/* Pool grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
          {pool.map((w) => {
            const isSelected = selected.includes(w);
            return (
              <button
                key={w}
                onClick={() => toggle(w)}
                className={cn(
                  "rounded-xl px-3 py-3 sm:py-4 font-semibold uppercase tracking-wide",
                  "border border-black/10 dark:border-white/10 bg-[var(--card)] shadow",
                  isSelected && "ring-2 ring-[var(--accent)]"
                )}
              >
                {w}
              </button>
            );
          })}
        </div>

        {/* Solved groups reveal */}
        <div className="space-y-2">
          <AnimatePresence>
            {solved.map((gi) => {
              const idx = gi;
              const g = puzzle!.groups[idx];
              const diffColor = DIFF_COLORS[idx as 0|1|2|3] ?? "bg-blue-500 text-white";
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
                  {(g.description || g.personal?.note) && (
                    <div className="text-xs mt-1 opacity-90">{g.description || g.personal?.note}</div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-4 rounded-xl px-4 py-3 border border-black/10 dark:border-white/10 bg-[var(--card)]"
            >
              {won ? (puzzle?.metadata?.personal?.note ? `All groups solved! 🎉 ${puzzle.metadata.personal.note}` : "All groups solved! 🎉") : "Out of lives. Try again!"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
