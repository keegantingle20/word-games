"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { WordEntry, ConnectionsGroup, ConnectionsPuzzle } from "@/types/data";

type PersonalTheme = {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  images: {
    background?: string;
    logo?: string;
    patterns?: string[];
  };
  fonts: {
    heading: string;
    body: string;
  };
  personal: {
    coupleNames: string;
    specialDate?: string;
    insideJokes: string[];
    favoriteMemories: string[];
  };
};

export default function PersonalizePage() {
  const [activeTab, setActiveTab] = useState<"words" | "themes" | "memories" | "settings">("words");
  const [themes, setThemes] = useState<PersonalTheme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<PersonalTheme | null>(null);
  const [wordEntries, setWordEntries] = useState<WordEntry[]>([]);
  const [connectionsPuzzles, setConnectionsPuzzles] = useState<ConnectionsPuzzle[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedThemes = localStorage.getItem("personalThemes");
    const savedWords = localStorage.getItem("personalWords");
    const savedPuzzles = localStorage.getItem("personalPuzzles");
    
    if (savedThemes) setThemes(JSON.parse(savedThemes));
    if (savedWords) setWordEntries(JSON.parse(savedWords));
    if (savedPuzzles) setConnectionsPuzzles(JSON.parse(savedPuzzles));
  }, []);

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem("personalThemes", JSON.stringify(themes));
    localStorage.setItem("personalWords", JSON.stringify(wordEntries));
    localStorage.setItem("personalPuzzles", JSON.stringify(connectionsPuzzles));
  };

  const addWord = (word: WordEntry) => {
    setWordEntries(prev => [...prev, word]);
    saveData();
  };

  const addPuzzle = (puzzle: ConnectionsPuzzle) => {
    setConnectionsPuzzles(prev => [...prev, puzzle]);
    saveData();
  };

  const createTheme = (theme: PersonalTheme) => {
    setThemes(prev => [...prev, theme]);
    saveData();
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Personalize Your Games ❤️
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Create a unique experience with your own words, themes, and memories.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: "words", label: "Words & Puzzles", icon: "📝" },
            { id: "themes", label: "Themes & Colors", icon: "🎨" },
            { id: "memories", label: "Memories", icon: "💭" },
            { id: "settings", label: "Settings", icon: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                activeTab === tab.id
                  ? "text-accent border-b-2 border-accent bg-accent/5"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "words" && (
          <WordsTab 
            wordEntries={wordEntries}
            connectionsPuzzles={connectionsPuzzles}
            onAddWord={addWord}
            onAddPuzzle={addPuzzle}
          />
        )}
        {activeTab === "themes" && (
          <ThemesTab 
            themes={themes}
            currentTheme={currentTheme}
            onCreateTheme={createTheme}
            onSelectTheme={setCurrentTheme}
          />
        )}
        {activeTab === "memories" && (
          <MemoriesTab />
        )}
        {activeTab === "settings" && (
          <SettingsTab />
        )}
      </motion.div>
    </div>
  );
}

// Words & Puzzles Tab Component
function WordsTab({ 
  wordEntries, 
  connectionsPuzzles, 
  onAddWord, 
  onAddPuzzle 
}: {
  wordEntries: WordEntry[];
  connectionsPuzzles: ConnectionsPuzzle[];
  onAddWord: (word: WordEntry) => void;
  onAddPuzzle: (puzzle: ConnectionsPuzzle) => void;
}) {
  const [showWordForm, setShowWordForm] = useState(false);
  const [showPuzzleForm, setShowPuzzleForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wordle Words Section */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-slate-200/30 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Wordle Words</h3>
            <button
              onClick={() => setShowWordForm(!showWordForm)}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Add Word
            </button>
          </div>
          
          {showWordForm && (
            <WordForm onSubmit={onAddWord} onCancel={() => setShowWordForm(false)} />
          )}
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {wordEntries.map((word, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold">{word.word}</span>
                  {word.categories && (
                    <span className="ml-2 text-sm text-slate-500">
                      ({word.categories.join(", ")})
                    </span>
                  )}
                </div>
                <button className="text-red-500 hover:text-red-700">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Connections Puzzles Section */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-slate-200/30 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Connections Puzzles</h3>
            <button
              onClick={() => setShowPuzzleForm(!showPuzzleForm)}
              className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
            >
              Add Puzzle
            </button>
          </div>
          
          {showPuzzleForm && (
            <PuzzleForm onSubmit={onAddPuzzle} onCancel={() => setShowPuzzleForm(false)} />
          )}
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {connectionsPuzzles.map((puzzle, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold">{puzzle.title || `Puzzle ${index + 1}`}</span>
                  <span className="ml-2 text-sm text-slate-500">
                    ({puzzle.groups.length} groups)
                  </span>
                </div>
                <button className="text-red-500 hover:text-red-700">×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Word Form Component
function WordForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (word: WordEntry) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    word: "",
    categories: "",
    difficulty: "medium" as const,
    themes: "",
    personalNote: "",
    memory: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.word) return;

    const wordEntry: WordEntry = {
      word: formData.word.toLowerCase(),
      categories: formData.categories.split(",").map(c => c.trim()).filter(Boolean),
      metadata: {
        difficulty: formData.difficulty,
        themes: formData.themes.split(",").map(t => t.trim()).filter(Boolean),
        personal: {
          note: formData.personalNote,
          memory: formData.memory,
        },
      },
    };

    onSubmit(wordEntry);
    setFormData({
      word: "",
      categories: "",
      difficulty: "medium",
      themes: "",
      personalNote: "",
      memory: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Word (4-6 letters)</label>
        <input
          type="text"
          value={formData.word}
          onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          placeholder="Enter word..."
          maxLength={6}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Categories</label>
          <input
            type="text"
            value={formData.categories}
            onChange={(e) => setFormData(prev => ({ ...prev, categories: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            placeholder="memories, places, foods"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Themes</label>
        <input
          type="text"
          value={formData.themes}
          onChange={(e) => setFormData(prev => ({ ...prev, themes: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          placeholder="romance, adventure, cozy"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Personal Note</label>
        <textarea
          value={formData.personalNote}
          onChange={(e) => setFormData(prev => ({ ...prev, personalNote: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          placeholder="Why is this word special to you both?"
          rows={2}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Memory</label>
        <textarea
          value={formData.memory}
          onChange={(e) => setFormData(prev => ({ ...prev, memory: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          placeholder="Share a memory associated with this word..."
          rows={2}
        />
      </div>
      
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Add Word
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Puzzle Form Component
function PuzzleForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (puzzle: ConnectionsPuzzle) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    title: "",
    groups: Array(4).fill(null).map(() => ({
      title: "",
      words: ["", "", "", ""],
      hint: "",
      description: "",
    })),
    difficulty: "medium" as const,
    personalNote: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const puzzle: ConnectionsPuzzle = {
      id: `puzzle.${Date.now()}`,
      title: formData.title,
      groups: formData.groups as [ConnectionsGroup, ConnectionsGroup, ConnectionsGroup, ConnectionsGroup],
      metadata: {
        difficulty: formData.difficulty,
        personal: {
          note: formData.personalNote,
        },
      },
    };

    onSubmit(puzzle);
    // Reset form
    setFormData({
      title: "",
      groups: Array(4).fill(null).map(() => ({
        title: "",
        words: ["", "", "", ""],
        hint: "",
        description: "",
      })),
      difficulty: "medium",
      personalNote: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Puzzle Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          placeholder="Our Favorite Places"
        />
      </div>
      
      {formData.groups.map((group, groupIndex) => (
        <div key={groupIndex} className="border border-slate-300 dark:border-slate-600 rounded-lg p-4">
          <h4 className="font-medium mb-2">Group {groupIndex + 1}</h4>
          <div className="space-y-2">
            <input
              type="text"
              value={group.title}
              onChange={(e) => {
                const newGroups = [...formData.groups];
                newGroups[groupIndex].title = e.target.value;
                setFormData(prev => ({ ...prev, groups: newGroups }));
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              placeholder="Group title (e.g., Restaurants)"
            />
            <div className="grid grid-cols-2 gap-2">
              {group.words.map((word, wordIndex) => (
                <input
                  key={wordIndex}
                  type="text"
                  value={word}
                  onChange={(e) => {
                    const newGroups = [...formData.groups];
                    newGroups[groupIndex].words[wordIndex] = e.target.value;
                    setFormData(prev => ({ ...prev, groups: newGroups }));
                  }}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  placeholder={`Word ${wordIndex + 1}`}
                />
              ))}
            </div>
            <input
              type="text"
              value={group.hint}
              onChange={(e) => {
                const newGroups = [...formData.groups];
                newGroups[groupIndex].hint = e.target.value;
                setFormData(prev => ({ ...prev, groups: newGroups }));
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              placeholder="Hint (optional)"
            />
            <textarea
              value={group.description}
              onChange={(e) => {
                const newGroups = [...formData.groups];
                newGroups[groupIndex].description = e.target.value;
                setFormData(prev => ({ ...prev, groups: newGroups }));
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              placeholder="Description (optional)"
              rows={2}
            />
          </div>
        </div>
      ))}
      
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
        >
          Add Puzzle
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Themes Tab Component
function ThemesTab({ 
  themes, 
  currentTheme, 
  onCreateTheme, 
  onSelectTheme 
}: {
  themes: PersonalTheme[];
  currentTheme: PersonalTheme | null;
  onCreateTheme: (theme: PersonalTheme) => void;
  onSelectTheme: (theme: PersonalTheme) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Customize Your Theme</h3>
        <p className="text-slate-600 dark:text-slate-300">
          Create beautiful themes with your favorite colors and images
        </p>
      </div>
      
      {/* Theme Preview */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-slate-200/30 dark:border-white/10">
        <h4 className="text-lg font-semibold mb-4">Theme Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-32 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              Preview
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              This is how your games will look with the selected theme
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-32 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 bg-accent rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Custom Theme</div>
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Customize colors, fonts, and add personal images
            </div>
          </div>
        </div>
      </div>
      
      {/* Theme Creator */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-slate-200/30 dark:border-white/10">
        <h4 className="text-lg font-semibold mb-4">Create New Theme</h4>
        <ThemeCreator onSubmit={onCreateTheme} />
      </div>
    </div>
  );
}

// Theme Creator Component
function ThemeCreator({ onSubmit }: { onSubmit: (theme: PersonalTheme) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    colors: {
      primary: "#4f8cff",
      secondary: "#6bbb6b",
      accent: "#f6c454",
      background: "#ffffff",
      text: "#0b0f13",
    },
    personal: {
      coupleNames: "",
      specialDate: "",
      insideJokes: "",
      favoriteMemories: "",
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const theme: PersonalTheme = {
      id: `theme.${Date.now()}`,
      name: formData.name,
      colors: formData.colors,
      images: {},
      fonts: {
        heading: "Inter",
        body: "Inter",
      },
      personal: {
        coupleNames: formData.personal.coupleNames,
        specialDate: formData.personal.specialDate,
        insideJokes: formData.personal.insideJokes.split(",").map(j => j.trim()).filter(Boolean),
        favoriteMemories: formData.personal.favoriteMemories.split(",").map(m => m.trim()).filter(Boolean),
      },
    };

    onSubmit(theme);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Theme Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          placeholder="Our Love Theme"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Primary Color</label>
          <input
            type="color"
            value={formData.colors.primary}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              colors: { ...prev.colors, primary: e.target.value }
            }))}
            className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Secondary Color</label>
          <input
            type="color"
            value={formData.colors.secondary}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              colors: { ...prev.colors, secondary: e.target.value }
            }))}
            className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-lg"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Your Names</label>
        <input
          type="text"
          value={formData.personal.coupleNames}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            personal: { ...prev.personal, coupleNames: e.target.value }
          }))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          placeholder="Jessie & [Your Name]"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Special Date</label>
        <input
          type="date"
          value={formData.personal.specialDate}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            personal: { ...prev.personal, specialDate: e.target.value }
          }))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
        />
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
      >
        Create Theme
      </button>
    </form>
  );
}

// Memories Tab Component
function MemoriesTab() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Shared Memories</h3>
        <p className="text-slate-600 dark:text-slate-300">
          Add special moments and inside jokes to make the games more personal
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-slate-200/30 dark:border-white/10">
          <h4 className="text-lg font-semibold mb-4">Add Memory</h4>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Memory Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                placeholder="Our first date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                placeholder="Tell the story..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              />
            </div>
            <button className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
              Add Memory
            </button>
          </form>
        </div>
        
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-slate-200/30 dark:border-white/10">
          <h4 className="text-lg font-semibold mb-4">Recent Memories</h4>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="font-medium">Our first date</div>
              <div className="text-sm text-slate-500">January 15, 2024</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="font-medium">That inside joke about...</div>
              <div className="text-sm text-slate-500">February 3, 2024</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Game Settings</h3>
        <p className="text-slate-600 dark:text-slate-300">
          Customize how the games behave and look
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-slate-200/30 dark:border-white/10">
          <h4 className="text-lg font-semibold mb-4">Randomness Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Smart Randomization</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <span>Include Personal Words</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <span>Show Memory Hints</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-slate-200/30 dark:border-white/10">
          <h4 className="text-lg font-semibold mb-4">Display Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Animation Speed</label>
              <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
                <option>Fast</option>
                <option>Normal</option>
                <option>Slow</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sound Effects</label>
              <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
                <option>On</option>
                <option>Off</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
