"use client";
import { useEffect, useState } from "react";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      basePath: process.env.NEXT_PUBLIC_BASE_PATH || "not set",
      location: typeof window !== "undefined" ? window.location.href : "server",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
      timestamp: new Date().toISOString(),
    };
    
    setDebugInfo(info);
    console.log("🔍 Debug info:", info);
  }, []);

  const testWordLoading = async () => {
    try {
      console.log("🧪 Testing word loading...");
      
      // Test different paths
      const paths = [
        "/data/wordle/personal-collection.json",
        "/word-games/data/wordle/personal-collection.json",
        "./data/wordle/personal-collection.json"
      ];
      
      for (const path of paths) {
        try {
          console.log(`🔍 Testing path: ${path}`);
          const response = await fetch(path);
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Success with ${path}:`, data.words?.length || 0, "words");
            return { success: true, path, wordCount: data.words?.length || 0 };
          } else {
            console.log(`❌ Failed with ${path}:`, response.status, response.statusText);
          }
        } catch (error) {
          console.log(`❌ Error with ${path}:`, error);
        }
      }
      
      return { success: false, error: "All paths failed" };
    } catch (error) {
      console.error("❌ Test failed:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Debug Information</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Environment Info</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-700">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Word Loading Test</h2>
            <button
              onClick={testWordLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Word Loading
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Check the browser console for detailed results
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Quick Links</h2>
            <div className="space-y-2">
              <a href="/wordle" className="block text-blue-600 hover:text-blue-800">
                → Wordle Game
              </a>
              <a href="/word-test" className="block text-blue-600 hover:text-blue-800">
                → Word Test Page
              </a>
              <a href="/word-bank-manager" className="block text-blue-600 hover:text-blue-800">
                → Word Bank Manager
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
