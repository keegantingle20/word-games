"use client";
import { useEffect, useState } from "react";
import { loadPersonalWordleList } from "@/lib/data";
import type { WordleList } from "@/types/data";

export default function WordTestPage() {
  const [wordList, setWordList] = useState<WordleList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      console.log("🔄 Starting word test...");
      const list = await loadPersonalWordleList();
      
      if (list) {
        setWordList(list);
        console.log(`✅ Successfully loaded ${list.words.length} words`);
      } else {
        setError("Failed to load word list");
        console.error("❌ Word list is null");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("❌ Error loading words:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading Word Test...</h2>
            <p className="text-gray-600">Checking if personal words are loading correctly</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-900 mb-4">Word Loading Failed</h2>
            <p className="text-red-700 mb-4">Error: {error}</p>
            <p className="text-gray-600">Check the browser console for more details</p>
          </div>
        </div>
      </div>
    );
  }

  if (!wordList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-yellow-900 mb-4">No Word List</h2>
            <p className="text-yellow-700">The word list is null or undefined</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">Word Loading Test - SUCCESS!</h1>
            <p className="text-green-700">Personal word collection is loading correctly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{wordList.words.length}</div>
              <div className="text-blue-800">Total Words</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">{wordList.title}</div>
              <div className="text-purple-800">Collection Name</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">✅</div>
              <div className="text-green-800">Status</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Words (First 10):</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {wordList.words.slice(0, 10).map((word, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded text-center font-mono">
                  {word.word}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/wordle" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Wordle Game
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
