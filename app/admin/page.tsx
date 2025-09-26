"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { wordManager, type WordCategory, type CustomWordleList, type CustomConnectionsPuzzle } from "@/lib/wordManager";
import type { WordEntry, ConnectionsGroup } from "@/types/data";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"categories" | "wordle" | "connections">("categories");
  const [categories, setCategories] = useState<WordCategory[]>([]);
  const [wordleLists, setWordleLists] = useState<CustomWordleList[]>([]);
  const [connectionsPuzzles, setConnectionsPuzzles] = useState<CustomConnectionsPuzzle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);
  const [showCreateWordle, setShowCreateWordle] = useState(false);
  const [showCreateConnections, setShowCreateConnections] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [newCategory, setNewCategory] = useState({ name: "", description: "", color: "#3b82f6" });
  const [newWord, setNewWord] = useState({ word: "", note: "" });
  const [csvImport, setCsvImport] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Simple admin password (you can change this)
  const ADMIN_PASSWORD = "jessie2024";

  useEffect(() => {
    // Check if already authenticated
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("adminAuth");
      if (auth === "true") {
        setIsAuthenticated(true);
        loadData();
      }
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("adminAuth", "true");
      }
      loadData();
      showMessage("success", "Welcome to the admin panel!");
    } else {
      showMessage("error", "Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminAuth");
    }
    setPassword("");
  };

  const loadData = () => {
    setCategories(wordManager.getCategories());
    setWordleLists(wordManager.getCustomWordleLists());
    setConnectionsPuzzles(wordManager.getCustomConnectionsPuzzles());
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      showMessage("error", "Category name is required");
      return;
    }

    const category = wordManager.addCategory(newCategory);
    if (category) {
      setCategories(wordManager.getCategories());
      setNewCategory({ name: "", description: "", color: "#3b82f6" });
      setShowAddCategory(false);
      showMessage("success", "Category added successfully!");
    } else {
      showMessage("error", "Failed to add category");
    }
  };

  const handleAddWord = () => {
    if (!selectedCategory || !newWord.word.trim()) {
      showMessage("error", "Please select a category and enter a word");
      return;
    }

    if (newWord.word.length !== 5) {
      showMessage("error", "Word must be exactly 5 letters");
      return;
    }

    const success = wordManager.addWordToCategory(selectedCategory, {
      word: newWord.word,
      categories: [selectedCategory],
      metadata: {
        difficulty: "medium",
        themes: ["custom"],
        personal: { note: newWord.note || "Custom word" }
      }
    });

    if (success) {
      setCategories(wordManager.getCategories());
      setNewWord({ word: "", note: "" });
      setShowAddWord(false);
      showMessage("success", "Word added successfully!");
    } else {
      showMessage("error", "Word already exists or invalid");
    }
  };

  const handleCSVImport = () => {
    if (!selectedCategory || !csvImport.trim()) {
      showMessage("error", "Please select a category and enter CSV data");
      return;
    }

    const result = wordManager.importWordsFromCSV(csvImport, selectedCategory);
    if (result.success) {
      setCategories(wordManager.getCategories());
      setCsvImport("");
      setShowImport(false);
      showMessage("success", result.message);
    } else {
      showMessage("error", result.message);
    }
  };

  const handleCreateWordleList = () => {
    if (selectedCategories.length === 0) {
      showMessage("error", "Please select at least one category");
      return;
    }

    const list = wordManager.createWordleListFromCategories(
      selectedCategories,
      `Custom Wordle List ${wordleLists.length + 1}`,
      `Words from ${selectedCategories.length} categories`
    );

    setWordleLists(wordManager.getCustomWordleLists());
    setSelectedCategories([]);
    setShowCreateWordle(false);
    showMessage("success", "Wordle list created successfully!");
  };

  const handleExport = () => {
    const data = wordManager.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `word-games-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage("success", "Data exported successfully!");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = wordManager.importData(e.target?.result as string);
      if (result.success) {
        loadData();
        showMessage("success", result.message);
      } else {
        showMessage("error", result.message);
      }
    };
    reader.readAsText(file);
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8">
            <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100 mb-6">
              Admin Access
            </h1>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter admin password"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            </div>
            {message && (
              <div className={cn(
                "mt-4 p-3 rounded-lg text-sm",
                message.type === "success" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              )}>
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Admin Panel - Word Management
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "mb-6 p-4 rounded-lg",
                message.type === "success" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              )}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "categories", label: "Categories", count: categories.length },
                { id: "wordle", label: "Wordle Lists", count: wordleLists.length },
                { id: "connections", label: "Connections", count: connectionsPuzzles.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "py-2 px-1 border-b-2 font-medium text-sm",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
                  )}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Add Category Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Word Categories
              </h2>
              <button
                onClick={() => setShowAddCategory(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {category.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {category.words.length} words
                    </span>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Manage Words
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Selected Category Words */}
            {selectedCategoryData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Words in "{selectedCategoryData.name}"
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddWord(true)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Add Word
                    </button>
                    <button
                      onClick={() => setShowImport(true)}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Import CSV
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {selectedCategoryData.words.map((word, index) => (
                    <div
                      key={index}
                      className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-center text-sm font-mono"
                    >
                      {word.word}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Wordle Lists Tab */}
        {activeTab === "wordle" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Custom Wordle Lists
              </h2>
              <button
                onClick={() => setShowCreateWordle(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create List
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wordleLists.map((list) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {list.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {list.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {list.words.length} words
                    </span>
                    <span className="text-xs text-slate-400">
                      {list.categories.length} categories
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === "connections" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Custom Connections Puzzles
              </h2>
              <button
                onClick={() => setShowCreateConnections(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Puzzle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectionsPuzzles.map((puzzle) => (
                <motion.div
                  key={puzzle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {puzzle.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {puzzle.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {puzzle.groups.length} groups
                    </span>
                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                      {puzzle.difficulty}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Import/Export */}
        <div className="mt-8 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Data Management
          </h3>
          <div className="flex gap-4">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Export All Data
            </button>
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Modals - Same as before but with admin styling */}
        {/* Add Category Modal */}
        {showAddCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Category</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Category description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddCategory}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Category
                </button>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Word Modal */}
        {showAddWord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Word</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Word (5 letters)</label>
                  <input
                    type="text"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="WORD"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Note (optional)</label>
                  <input
                    type="text"
                    value={newWord.note}
                    onChange={(e) => setNewWord({ ...newWord, note: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Personal note about this word"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddWord}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Word
                </button>
                <button
                  onClick={() => setShowAddWord(false)}
                  className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {showImport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Import Words from CSV</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">CSV Data</label>
                  <textarea
                    value={csvImport}
                    onChange={(e) => setCsvImport(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="WORD,Note&#10;HELLO,Greeting&#10;WORLD,Planet"
                    rows={6}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Format: WORD,Note (one per line)
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleCSVImport}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Import Words
                </button>
                <button
                  onClick={() => setShowImport(false)}
                  className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Wordle List Modal */}
        {showCreateWordle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Wordle List</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Categories</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category.id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{category.name} ({category.words.length} words)</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleCreateWordleList}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create List
                </button>
                <button
                  onClick={() => setShowCreateWordle(false)}
                  className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
