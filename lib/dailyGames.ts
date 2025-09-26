export type DailyGameState = {
  wordle: {
    played: boolean;
    won: boolean;
    guesses: number;
    word: string;
    date: string;
  };
  connections: {
    played: boolean;
    won: boolean;
    mistakes: number;
    puzzleId: string;
    date: string;
  };
  miniCrossword: {
    played: boolean;
    won: boolean;
    time: number; // in seconds
    date: string;
  };
};

export type StreakData = {
  wordle: number;
  connections: number;
  miniCrossword: number;
  total: number;
};

export class DailyGameManager {
  private static instance: DailyGameManager;
  private gameState: DailyGameState;
  private streakData: StreakData;

  constructor() {
    this.gameState = this.loadGameState();
    this.streakData = this.loadStreakData();
  }

  static getInstance(): DailyGameManager {
    if (!DailyGameManager.instance) {
      DailyGameManager.instance = new DailyGameManager();
    }
    return DailyGameManager.instance;
  }

  private loadGameState(): DailyGameState {
    if (typeof window === "undefined") {
      return {
        wordle: { played: false, won: false, guesses: 0, word: "", date: this.getTodayString() },
        connections: { played: false, won: false, mistakes: 0, puzzleId: "", date: this.getTodayString() },
        miniCrossword: { played: false, won: false, time: 0, date: this.getTodayString() },
      };
    }

    try {
      const saved = localStorage.getItem("dailyGameState");
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = this.getTodayString();
        
        // Reset if it's a new day
        if (parsed.date !== today) {
          return {
            wordle: { played: false, won: false, guesses: 0, word: "", date: today },
            connections: { played: false, won: false, mistakes: 0, puzzleId: "", date: today },
            miniCrossword: { played: false, won: false, time: 0, date: today },
          };
        }
        
        return parsed;
      }
    } catch (error) {
      console.error("Error loading game state:", error);
    }

    return {
      wordle: { played: false, won: false, guesses: 0, word: "", date: this.getTodayString() },
      connections: { played: false, won: false, mistakes: 0, puzzleId: "", date: this.getTodayString() },
      miniCrossword: { played: false, won: false, time: 0, date: this.getTodayString() },
    };
  }

  private loadStreakData(): StreakData {
    if (typeof window === "undefined") {
      return { wordle: 0, connections: 0, miniCrossword: 0, total: 0 };
    }

    try {
      const saved = localStorage.getItem("streakData");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading streak data:", error);
    }

    return { wordle: 0, connections: 0, miniCrossword: 0, total: 0 };
  }

  private saveGameState(): void {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem("dailyGameState", JSON.stringify({
        ...this.gameState,
        date: this.getTodayString(),
      }));
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  }

  private saveStreakData(): void {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem("streakData", JSON.stringify(this.streakData));
    } catch (error) {
      console.error("Error saving streak data:", error);
    }
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private isNewDay(): boolean {
    return this.gameState.wordle.date !== this.getTodayString();
  }

  // Check if a game has been played today
  hasPlayedToday(game: keyof DailyGameState): boolean {
    if (this.isNewDay()) {
      this.resetDailyGames();
    }
    return this.gameState[game].played;
  }

  // Mark a game as played
  markGamePlayed(game: keyof DailyGameState, won: boolean, additionalData?: any): void {
    if (this.isNewDay()) {
      this.resetDailyGames();
    }

    const today = this.getTodayString();
    this.gameState[game] = {
      ...this.gameState[game],
      played: true,
      won,
      date: today,
      ...additionalData,
    };

    // Update streaks
    this.updateStreaks(game, won);
    
    this.saveGameState();
    this.saveStreakData();
  }

  private updateStreaks(game: keyof DailyGameState, won: boolean): void {
    if (won) {
      this.streakData[game]++;
    } else {
      this.streakData[game] = 0;
    }
    
    // Update total streak (counts any game played)
    this.streakData.total = Math.max(
      this.streakData.wordle,
      this.streakData.connections,
      this.streakData.miniCrossword
    );
  }

  private resetDailyGames(): void {
    const today = this.getTodayString();
    this.gameState = {
      wordle: { played: false, won: false, guesses: 0, word: "", date: today },
      connections: { played: false, won: false, mistakes: 0, puzzleId: "", date: today },
      miniCrossword: { played: false, won: false, time: 0, date: today },
    };
  }

  // Get current streaks
  getStreaks(): StreakData {
    if (this.isNewDay()) {
      this.resetDailyGames();
    }
    return { ...this.streakData };
  }

  // Get game state for a specific game
  getGameState(game: keyof DailyGameState): DailyGameState[typeof game] {
    if (this.isNewDay()) {
      this.resetDailyGames();
    }
    return { ...this.gameState[game] };
  }

  // Get share text for a game
  getShareText(game: keyof DailyGameState): string {
    const gameState = this.getGameState(game);
    const streaks = this.getStreaks();
    
    if (!gameState.played) {
      return "";
    }

    switch (game) {
      case "wordle":
        if (!gameState.won) {
          return `Wordle ${this.getPuzzleNumber()} X/6\n\n${this.getWordleGrid()}`;
        }
        return `Wordle ${this.getPuzzleNumber()} ${gameState.guesses}/6\n\n${this.getWordleGrid()}`;
      
      case "connections":
        if (!gameState.won) {
          return `Connections ${this.getPuzzleNumber()} X/4\n\n${this.getConnectionsGrid()}`;
        }
        return `Connections ${this.getPuzzleNumber()} ${4 - gameState.mistakes}/4\n\n${this.getConnectionsGrid()}`;
      
      case "miniCrossword":
        const minutes = Math.floor(gameState.time / 60);
        const seconds = gameState.time % 60;
        const timeStr = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
        return `Mini Crossword ${this.getPuzzleNumber()} ${timeStr}`;
      
      default:
        return "";
    }
  }

  private getPuzzleNumber(): number {
    // Calculate puzzle number based on days since a reference date
    const referenceDate = new Date("2024-01-01");
    const today = new Date();
    const diffTime = today.getTime() - referenceDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }

  private getWordleGrid(): string {
    // This would be populated with the actual game grid
    // For now, return a placeholder
    return "⬜⬜⬜⬜⬜\n⬜⬜⬜⬜⬜\n⬜⬜⬜⬜⬜\n⬜⬜⬜⬜⬜\n⬜⬜⬜⬜⬜\n⬜⬜⬜⬜⬜";
  }

  private getConnectionsGrid(): string {
    // This would be populated with the actual connections grid
    // For now, return a placeholder
    return "🟨🟨🟨🟨\n🟩🟩🟩🟩\n🟦🟦🟦🟦\n🟪🟪🟪🟪";
  }

  // Reset all data (for testing)
  resetAllData(): void {
    this.gameState = {
      wordle: { played: false, won: false, guesses: 0, word: "", date: this.getTodayString() },
      connections: { played: false, won: false, mistakes: 0, puzzleId: "", date: this.getTodayString() },
      miniCrossword: { played: false, won: false, time: 0, date: this.getTodayString() },
    };
    this.streakData = { wordle: 0, connections: 0, miniCrossword: 0, total: 0 };
    this.saveGameState();
    this.saveStreakData();
  }
}

// Export singleton instance
export const dailyGameManager = DailyGameManager.getInstance();
