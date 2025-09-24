import type { WordleList, ConnectionsPuzzle } from "@/types/data";

// Load Wordle words list from public JSON by path (relative to /public)
export async function loadWordleList(path = "/data/wordle/words.en.json"): Promise<WordleList> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load Wordle list: ${res.status}`);
  const data = (await res.json()) as WordleList;
  // Basic validation: ensure 5-letter words
  const invalid = data.words.filter((w) => w.word.length !== 5);
  if (invalid.length) {
    throw new Error(`Invalid word lengths: ${invalid.map((w) => w.word).join(", ")}`);
  }
  return data;
}

// Load Connections puzzle from public JSON
export async function loadConnectionsPuzzle(path = "/data/connections/sample.puzzle.json"): Promise<ConnectionsPuzzle> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load Connections puzzle: ${res.status}`);
  const data = (await res.json()) as ConnectionsPuzzle;
  // Basic validation: exactly 4 groups of 4 words each
  if (data.groups.length !== 4 || data.groups.some((g) => g.words.length !== 4)) {
    throw new Error("Connections puzzle must have 4 groups of 4 words each");
  }
  return data;
}

// Convenience helpers
export async function listWordleWords(path?: string) {
  const list = await loadWordleList(path);
  return list.words.map((w) => w.word);
}

export async function listConnectionsWords(path?: string) {
  const p = await loadConnectionsPuzzle(path);
  return p.groups.flatMap((g) => g.words);
}
