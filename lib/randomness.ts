import type { WordEntry, ConnectionsPuzzle, ConnectionsGroup } from "@/types/data";

export type PersonalData = {
  words: WordEntry[];
  puzzles: ConnectionsPuzzle[];
  themes: any[];
  memories: any[];
  settings: {
    smartRandomization: boolean;
    includePersonalWords: boolean;
    showMemoryHints: boolean;
    difficultyPreference: "easy" | "medium" | "hard" | "expert" | "mixed";
  };
};

export class SmartRandomnessGenerator {
  private personalData: PersonalData;
  private usedWords: Set<string> = new Set();
  private usedPuzzles: Set<string> = new Set();

  constructor(personalData: PersonalData) {
    this.personalData = personalData;
  }

  // Get a random word with smart selection
  getRandomWord(length?: number, category?: string): WordEntry | null {
    const availableWords = this.personalData.words.filter(word => {
      // Filter by length if specified
      if (length && word.word.length !== length) return false;
      
      // Filter by category if specified
      if (category && !word.categories?.includes(category)) return false;
      
      // Don't repeat recently used words
      if (this.usedWords.has(word.word)) return false;
      
      return true;
    });

    if (availableWords.length === 0) {
      // Reset used words if we've exhausted the list
      this.usedWords.clear();
      return this.getRandomWord(length, category);
    }

    // Smart selection based on personal data
    const selectedWord = this.selectWordWithBias(availableWords);
    this.usedWords.add(selectedWord.word);
    
    return selectedWord;
  }

  // Get a random puzzle with smart selection
  getRandomPuzzle(difficulty?: string): ConnectionsPuzzle | null {
    const availablePuzzles = this.personalData.puzzles.filter(puzzle => {
      // Filter by difficulty if specified
      if (difficulty && puzzle.metadata?.difficulty !== difficulty) return false;
      
      // Don't repeat recently used puzzles
      if (this.usedPuzzles.has(puzzle.id)) return false;
      
      return true;
    });

    if (availablePuzzles.length === 0) {
      // Reset used puzzles if we've exhausted the list
      this.usedPuzzles.clear();
      return this.getRandomPuzzle(difficulty);
    }

    const selectedPuzzle = this.selectPuzzleWithBias(availablePuzzles);
    this.usedPuzzles.add(selectedPuzzle.id);
    
    return selectedPuzzle;
  }

  // Get a daily word based on date and personal significance
  getDailyWord(date: Date): WordEntry | null {
    const dayOfYear = this.getDayOfYear(date);
    const personalWords = this.personalData.words;
    
    if (personalWords.length === 0) return null;

    // Use date as seed for consistent daily selection
    const seed = dayOfYear + date.getFullYear();
    const index = seed % personalWords.length;
    
    return personalWords[index];
  }

  // Get a daily puzzle based on date and personal significance
  getDailyPuzzle(date: Date): ConnectionsPuzzle | null {
    const dayOfYear = this.getDayOfYear(date);
    const personalPuzzles = this.personalData.puzzles;
    
    if (personalPuzzles.length === 0) return null;

    // Use date as seed for consistent daily selection
    const seed = dayOfYear + date.getFullYear();
    const index = seed % personalPuzzles.length;
    
    return personalPuzzles[index];
  }

  // Get words by theme with smart selection
  getWordsByTheme(theme: string, count: number = 5): WordEntry[] {
    const themeWords = this.personalData.words.filter(word => 
      word.metadata?.themes?.includes(theme) || 
      word.categories?.includes(theme)
    );

    if (themeWords.length === 0) return [];

    // Shuffle and take the requested count
    const shuffled = this.shuffleArray([...themeWords]);
    return shuffled.slice(0, Math.min(count, themeWords.length));
  }

  // Get a hint based on personal memories
  getPersonalHint(word: WordEntry): string | null {
    if (!this.personalData.settings.showMemoryHints) return null;
    
    const hints = [];
    
    if (word.metadata?.personal?.note) {
      hints.push(`💭 ${word.metadata.personal.note}`);
    }
    
    if (word.metadata?.personal?.memory) {
      hints.push(`💖 ${word.metadata.personal.memory}`);
    }
    
    if (word.categories && word.categories.length > 0) {
      hints.push(`🏷️ Categories: ${word.categories.join(", ")}`);
    }
    
    if (word.metadata?.themes && word.metadata.themes.length > 0) {
      hints.push(`🎨 Themes: ${word.metadata.themes.join(", ")}`);
    }
    
    return hints.length > 0 ? hints.join("\n") : null;
  }

  // Get a celebration message based on personal context
  getCelebrationMessage(word: WordEntry, guesses: number): string {
    const celebrations = [
      "Amazing! You know us so well! 💕",
      "Perfect! That's one of our favorites! ✨",
      "Brilliant! You remembered that special moment! 🌟",
      "Fantastic! That brings back such good memories! 💖",
      "Wonderful! You really know our story! 💫",
    ];

    const personalCelebrations = [
      `Perfect! "${word.word}" always reminds us of ${word.metadata?.personal?.memory || "that special time"}! 💕`,
      `Amazing! You remembered "${word.word}" from our ${word.categories?.[0] || "memories"}! ✨`,
      `Brilliant! "${word.word}" - ${word.metadata?.personal?.note || "such a special word for us"}! 💖`,
    ];

    // Use personal celebrations if available, otherwise use generic ones
    const availableCelebrations = word.metadata?.personal ? personalCelebrations : celebrations;
    const randomCelebration = availableCelebrations[Math.floor(Math.random() * availableCelebrations.length)];
    
    return randomCelebration;
  }

  // Private helper methods
  private selectWordWithBias(words: WordEntry[]): WordEntry {
    if (words.length === 1) return words[0];

    // Weight words based on personal significance
    const weights = words.map(word => {
      let weight = 1;
      
      // Higher weight for words with personal notes
      if (word.metadata?.personal?.note) weight += 2;
      if (word.metadata?.personal?.memory) weight += 3;
      
      // Higher weight for words with themes
      if (word.metadata?.themes && word.metadata.themes.length > 0) weight += 1;
      
      // Higher weight for words with categories
      if (word.categories && word.categories.length > 0) weight += 1;
      
      return weight;
    });

    return this.weightedRandomSelect(words, weights);
  }

  private selectPuzzleWithBias(puzzles: ConnectionsPuzzle[]): ConnectionsPuzzle {
    if (puzzles.length === 1) return puzzles[0];

    // Weight puzzles based on personal significance
    const weights = puzzles.map(puzzle => {
      let weight = 1;
      
      // Higher weight for puzzles with personal notes
      if (puzzle.metadata?.personal?.note) weight += 2;
      
      // Higher weight for puzzles with themes
      if (puzzle.metadata?.themes && puzzle.metadata.themes.length > 0) weight += 1;
      
      return weight;
    });

    return this.weightedRandomSelect(puzzles, weights);
  }

  private weightedRandomSelect<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // Reset used items (useful for testing or manual reset)
  resetUsedItems(): void {
    this.usedWords.clear();
    this.usedPuzzles.clear();
  }

  // Get statistics about personal data
  getPersonalStats(): {
    totalWords: number;
    totalPuzzles: number;
    wordsWithMemories: number;
    puzzlesWithMemories: number;
    categories: string[];
    themes: string[];
  } {
    const allCategories = new Set<string>();
    const allThemes = new Set<string>();
    
    this.personalData.words.forEach(word => {
      word.categories?.forEach(cat => allCategories.add(cat));
      word.metadata?.themes?.forEach(theme => allThemes.add(theme));
    });
    
    this.personalData.puzzles.forEach(puzzle => {
      puzzle.metadata?.themes?.forEach(theme => allThemes.add(theme));
    });

    return {
      totalWords: this.personalData.words.length,
      totalPuzzles: this.personalData.puzzles.length,
      wordsWithMemories: this.personalData.words.filter(w => w.metadata?.personal?.memory).length,
      puzzlesWithMemories: this.personalData.puzzles.filter(p => p.metadata?.personal?.note).length,
      categories: Array.from(allCategories),
      themes: Array.from(allThemes),
    };
  }
}

// Utility function to create a generator instance
export function createRandomnessGenerator(): SmartRandomnessGenerator {
  const personalData: PersonalData = {
    words: JSON.parse(localStorage.getItem("personalWords") || "[]"),
    puzzles: JSON.parse(localStorage.getItem("personalPuzzles") || "[]"),
    themes: JSON.parse(localStorage.getItem("personalThemes") || "[]"),
    memories: JSON.parse(localStorage.getItem("personalMemories") || "[]"),
    settings: {
      smartRandomization: true,
      includePersonalWords: true,
      showMemoryHints: true,
      difficultyPreference: "mixed",
      ...JSON.parse(localStorage.getItem("personalSettings") || "{}"),
    },
  };

  return new SmartRandomnessGenerator(personalData);
}
