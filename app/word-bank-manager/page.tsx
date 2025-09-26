"use client";
import { useEffect, useState } from "react";
import { loadPersonalWordleList, loadPersonalWordleWords } from "@/lib/data";
import type { WordleList, WordEntry } from "@/types/data";

export default function WordBankManager() {
  const [wordList, setWordList] = useState<WordleList | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadWordBank();
  }, []);

  const loadWordBank = async () => {
    try {
      const list = await loadPersonalWordleList();
      setWordList(list);
    } catch (error) {
      console.error("Failed to load word bank:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    if (!wordList) return [];
    const categories = new Set<string>();
    wordList.words.forEach(word => {
      word.categories?.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  };

  const getFilteredWords = () => {
    if (!wordList) return [];
    
    let filtered = wordList.words;
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(word => 
        word.categories?.includes(selectedCategory)
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.categories?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        word.metadata?.themes?.some(theme => theme.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "hard": return "text-red-600 bg-red-100";
      case "expert": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your word bank...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!wordList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Word Bank Manager</h1>
            <p className="text-red-600">Failed to load word bank. Please check the file path.</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredWords = getFilteredWords();
  const categories = getCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Word Bank Manager</h1>
            <p className="text-gray-600 mb-4">{wordList.title} - {wordList.words.length} words</p>
            <p className="text-sm text-gray-500">{wordList.description}</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search words, categories, or themes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{wordList.words.length}</div>
              <div className="text-sm text-blue-800">Total Words</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{filteredWords.length}</div>
              <div className="text-sm text-green-800">Filtered Words</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
              <div className="text-sm text-purple-800">Categories</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {wordList.words.filter(w => w.metadata?.difficulty === "easy").length}
              </div>
              <div className="text-sm text-yellow-800">Easy Words</div>
            </div>
          </div>

          {/* Words Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredWords.map((word, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{word.word}</h3>
                  {word.metadata?.difficulty && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(word.metadata.difficulty)}`}>
                      {word.metadata.difficulty}
                    </span>
                  )}
                </div>
                
                {word.categories && word.categories.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {word.categories.map((cat, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {word.metadata?.themes && word.metadata.themes.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {word.metadata.themes.map((theme, i) => (
                        <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {word.metadata?.personal?.note && (
                  <p className="text-sm text-gray-600 italic">"{word.metadata.personal.note}"</p>
                )}
              </div>
            ))}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No words found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
