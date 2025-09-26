// Word and puzzle management system
import type { WordEntry, WordleList, ConnectionsPuzzle, ConnectionsGroup } from "@/types/data";

export interface WordCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  words: WordEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomWordleList extends WordleList {
  categories: WordCategory[];
}

export interface CustomConnectionsPuzzle extends ConnectionsPuzzle {
  categories: string[];
  difficulty: "easy" | "medium" | "hard" | "tricky";
  tags: string[];
}

export class WordManager {
  private static instance: WordManager;
  
  static getInstance(): WordManager {
    if (!WordManager.instance) {
      WordManager.instance = new WordManager();
    }
    return WordManager.instance;
  }

  // Word Categories Management
  getCategories(): WordCategory[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("wordCategories");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveCategories(categories: WordCategory[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("wordCategories", JSON.stringify(categories));
    } catch (error) {
      console.error("Failed to save categories:", error);
    }
  }

  addCategory(category: Omit<WordCategory, "id" | "createdAt" | "updatedAt">): WordCategory {
    const categories = this.getCategories();
    const newCategory: WordCategory = {
      ...category,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<WordCategory>): boolean {
    const categories = this.getCategories();
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) return false;
    
    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveCategories(categories);
    return true;
  }

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filtered = categories.filter(cat => cat.id !== id);
    if (filtered.length === categories.length) return false;
    this.saveCategories(filtered);
    return true;
  }

  // Word Management
  addWordToCategory(categoryId: string, word: Omit<WordEntry, "word"> & { word: string }): boolean {
    const categories = this.getCategories();
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return false;

    // Validate word length (5 letters for Wordle)
    if (word.word.length !== 5) return false;

    // Check for duplicates
    if (category.words.some(w => w.word.toLowerCase() === word.word.toLowerCase())) {
      return false;
    }

    const newWord: WordEntry = {
      word: word.word.toUpperCase(),
      categories: [categoryId],
      metadata: {
        ...word.metadata,
        createdAt: new Date().toISOString(),
      }
    };

    category.words.push(newWord);
    category.updatedAt = new Date().toISOString();
    this.saveCategories(categories);
    return true;
  }

  updateWord(categoryId: string, wordIndex: number, updates: Partial<WordEntry>): boolean {
    const categories = this.getCategories();
    const category = categories.find(cat => cat.id === categoryId);
    if (!category || wordIndex >= category.words.length) return false;

    category.words[wordIndex] = {
      ...category.words[wordIndex],
      ...updates,
      metadata: {
        ...category.words[wordIndex].metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString(),
      }
    };
    category.updatedAt = new Date().toISOString();
    this.saveCategories(categories);
    return true;
  }

  deleteWord(categoryId: string, wordIndex: number): boolean {
    const categories = this.getCategories();
    const category = categories.find(cat => cat.id === categoryId);
    if (!category || wordIndex >= category.words.length) return false;

    category.words.splice(wordIndex, 1);
    category.updatedAt = new Date().toISOString();
    this.saveCategories(categories);
    return true;
  }

  // Custom Wordle Lists
  getCustomWordleLists(): CustomWordleList[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("customWordleLists");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveCustomWordleLists(lists: CustomWordleList[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("customWordleLists", JSON.stringify(lists));
    } catch (error) {
      console.error("Failed to save custom Wordle lists:", error);
    }
  }

  createWordleListFromCategories(categoryIds: string[], name: string, description: string): CustomWordleList {
    const categories = this.getCategories();
    const selectedCategories = categories.filter(cat => categoryIds.includes(cat.id));
    const allWords = selectedCategories.flatMap(cat => cat.words);

    const wordleList: CustomWordleList = {
      id: `wordle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      language: "en",
      title: name,
      description: description,
      words: allWords,
      categories: selectedCategories,
      metadata: {
        difficulty: "medium",
        themes: selectedCategories.map(cat => cat.name.toLowerCase()),
        createdAt: new Date().toISOString(),
      }
    };

    const lists = this.getCustomWordleLists();
    lists.push(wordleList);
    this.saveCustomWordleLists(lists);
    return wordleList;
  }

  // Custom Connections Puzzles
  getCustomConnectionsPuzzles(): CustomConnectionsPuzzle[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("customConnectionsPuzzles");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveCustomConnectionsPuzzles(puzzles: CustomConnectionsPuzzle[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("customConnectionsPuzzles", JSON.stringify(puzzles));
    } catch (error) {
      console.error("Failed to save custom Connections puzzles:", error);
    }
  }

  createConnectionsPuzzle(
    groups: ConnectionsGroup[],
    title: string,
    description: string,
    difficulty: "easy" | "medium" | "hard" | "tricky" = "medium",
    tags: string[] = []
  ): CustomConnectionsPuzzle {
    const puzzle: CustomConnectionsPuzzle = {
      id: `connections_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      groups,
      categories: groups.map(g => g.title),
      difficulty,
      tags,
      metadata: {
        difficulty,
        themes: tags,
        personal: { note: "Custom puzzle" },
        createdAt: new Date().toISOString(),
      }
    };

    const puzzles = this.getCustomConnectionsPuzzles();
    puzzles.push(puzzle);
    this.saveCustomConnectionsPuzzles(puzzles);
    return puzzle;
  }

  // Import/Export
  exportData(): string {
    const data = {
      categories: this.getCategories(),
      wordleLists: this.getCustomWordleLists(),
      connectionsPuzzles: this.getCustomConnectionsPuzzles(),
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.categories) {
        this.saveCategories(data.categories);
      }
      if (data.wordleLists) {
        this.saveCustomWordleLists(data.wordleLists);
      }
      if (data.connectionsPuzzles) {
        this.saveCustomConnectionsPuzzles(data.connectionsPuzzles);
      }
      
      return { success: true, message: "Data imported successfully!" };
    } catch (error) {
      return { success: false, message: `Import failed: ${error}` };
    }
  }

  // Bulk word import from CSV
  importWordsFromCSV(csvText: string, categoryId: string): { success: boolean; message: string; imported: number } {
    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      let imported = 0;
      
      for (const line of lines) {
        const [word, ...rest] = line.split(',').map(s => s.trim());
        if (word && word.length === 5) {
          const success = this.addWordToCategory(categoryId, {
            word: word.toUpperCase(),
            categories: [categoryId],
            metadata: {
              difficulty: "medium",
              themes: ["imported"],
              personal: { note: rest.join(', ') || "Imported word" }
            }
          });
          if (success) imported++;
        }
      }
      
      return { 
        success: true, 
        message: `Imported ${imported} words successfully!`, 
        imported 
      };
    } catch (error) {
      return { success: false, message: `CSV import failed: ${error}`, imported: 0 };
    }
  }

  // Get all words for a specific game type
  getAllWordsForGame(gameType: "wordle" | "connections"): string[] {
    const categories = this.getCategories();
    const allWords = categories.flatMap(cat => cat.words.map(w => w.word));
    return [...new Set(allWords)]; // Remove duplicates
  }

  // Get random word from categories
  getRandomWordFromCategories(categoryIds: string[]): string | null {
    const categories = this.getCategories();
    const selectedCategories = categories.filter(cat => categoryIds.includes(cat.id));
    const allWords = selectedCategories.flatMap(cat => cat.words);
    
    if (allWords.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * allWords.length);
    return allWords[randomIndex].word;
  }
}

// Export singleton instance
export const wordManager = WordManager.getInstance();
