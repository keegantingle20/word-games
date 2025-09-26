import type { WordleList, ConnectionsPuzzle } from "@/types/data";
import { dailyPuzzleGenerator } from "./wordBanks";
import { wordManager } from "./wordManager";

// Load Wordle words list from public JSON by path (relative to /public)
export async function loadWordleList(path = "/data/wordle/words.en.json"): Promise<WordleList> {
  // Handle base path for GitHub Pages
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const fullPath = `${basePath}${path}`;
  
  try {
    const res = await fetch(fullPath, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load Wordle list: ${res.status} - ${fullPath}`);
    const data = (await res.json()) as WordleList;
    // Basic validation: ensure 5-letter words
    const invalid = data.words.filter((w) => w.word.length !== 5);
    if (invalid.length) {
      throw new Error(`Invalid word lengths: ${invalid.map((w) => w.word).join(", ")}`);
    }
    return data;
  } catch (error) {
    console.warn("Failed to load custom Wordle list, using built-in words:", error);
    // Fallback to built-in word bank
    return {
      id: "words.builtin",
      language: "en",
      title: "Built-in Word List",
      description: "Default word list for Wordle",
      words: dailyPuzzleGenerator.getTodaysWordle().split("").map((letter, index) => ({
        word: dailyPuzzleGenerator.getTodaysWordle(),
        categories: ["daily"],
        metadata: {
          difficulty: "medium",
          themes: ["daily"],
          personal: {
            note: "Today's word"
          }
        }
      })),
      metadata: {
        difficulty: "medium",
        themes: ["daily"],
        createdAt: new Date().toISOString()
      }
    };
  }
}

// Load Connections puzzle from public JSON
export async function loadConnectionsPuzzle(path = "/data/connections/sample.puzzle.json"): Promise<ConnectionsPuzzle> {
  // Handle base path for GitHub Pages
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const fullPath = `${basePath}${path}`;
  
  try {
    const res = await fetch(fullPath, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load Connections puzzle: ${res.status} - ${fullPath}`);
    const data = (await res.json()) as ConnectionsPuzzle;
    // Basic validation: exactly 4 groups of 4 words each
    if (data.groups.length !== 4 || data.groups.some((g) => g.words.length !== 4)) {
      throw new Error("Connections puzzle must have 4 groups of 4 words each");
    }
    return data;
  } catch (error) {
    console.warn("Failed to load custom Connections puzzle, using built-in puzzle:", error);
    // Fallback to built-in puzzle
    return dailyPuzzleGenerator.getTodaysConnections();
  }
}

// Load Mini Crossword puzzle
export function loadMiniCrosswordPuzzle() {
  return dailyPuzzleGenerator.getTodaysMiniCrossword();
}

// Convenience helpers
export async function listWordleWords(path?: string) {
  const list = await loadWordleList(path);
  return list.words.map((w) => w.word);
}

export async function listConnectionsPuzzles() {
  // For now, return the current puzzle
  return [dailyPuzzleGenerator.getTodaysConnections()];
}

// Get today's word directly
export function getTodaysWordleWord(): string {
  // Try to get a custom word first
  if (typeof window !== "undefined") {
    const customWords = wordManager.getAllWordsForGame("wordle");
    if (customWords.length > 0) {
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const index = dayOfYear % customWords.length;
      return customWords[index];
    }
  }
  
  // Try to load personal collection
  try {
    const personalWords = loadPersonalWordleWords();
    if (personalWords.length > 0) {
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const index = dayOfYear % personalWords.length;
      return personalWords[index];
    }
  } catch (error) {
    console.warn("Failed to load personal word collection:", error);
  }
  
  // Fallback to built-in words
  return dailyPuzzleGenerator.getTodaysWordle();
}

// Load personal word collection
export function loadPersonalWordleWords(): string[] {
  if (typeof window === "undefined") return [];
  
  try {
    // Try to load from localStorage first
    const stored = localStorage.getItem("personalWordleWords");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Failed to load personal words from localStorage:", error);
  }
  
  return [];
}

// Load personal word collection from JSON file
export async function loadPersonalWordleList(): Promise<WordleList | null> {
  try {
    const list = await loadWordleList("/data/wordle/personal-collection.json");
    
    // Cache the words in localStorage for faster access
    if (typeof window !== "undefined") {
      const words = list.words.map(w => w.word);
      localStorage.setItem("personalWordleWords", JSON.stringify(words));
    }
    
    return list;
  } catch (error) {
    console.warn("Failed to load personal word collection:", error);
    return null;
  }
}

// Get today's connections puzzle directly
export function getTodaysConnectionsPuzzle() {
  // Try to get a custom puzzle first
  if (typeof window !== "undefined") {
    const customPuzzles = wordManager.getCustomConnectionsPuzzles();
    if (customPuzzles.length > 0) {
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const index = dayOfYear % customPuzzles.length;
      return customPuzzles[index];
    }
  }
  
  // Fallback to built-in puzzle
  return dailyPuzzleGenerator.getTodaysConnections();
}

// Get today's mini crossword directly
export function getTodaysMiniCrossword() {
  return dailyPuzzleGenerator.getTodaysMiniCrossword();
}

// Get puzzle number
export function getPuzzleNumber(): number {
  return dailyPuzzleGenerator.getPuzzleNumber();
}