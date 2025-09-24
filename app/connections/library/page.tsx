"use client";
import { useEffect, useState } from "react";
import type { ConnectionsPuzzle } from "@/types/data";
import Link from "next/link";

export default function ConnectionsLibraryPage() {
  const [items, setItems] = useState<ConnectionsPuzzle[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("connectionsLibrary");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  function remove(id: string) {
    setItems((arr) => {
      const next = arr.filter((p) => p.id !== id);
      try { localStorage.setItem("connectionsLibrary", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function exportAll() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "connections_library.json";
    a.click();
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="text-2xl font-semibold mb-4">My Connections Library</h1>
      <div className="mb-4 flex gap-2">
        <Link href="/connections/create" className="rounded-md px-3 py-1.5 bg-[var(--accent)] text-white text-sm">Create New Puzzle</Link>
        <button onClick={exportAll} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Export All</button>
      </div>

      <div className="grid gap-3">
        {items.map((p) => (
          <div key={p.id} className="rounded-xl border border-black/10 dark:border-white/10 p-4 bg-[var(--card)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.title || p.id}</div>
                <div className="text-sm opacity-70">{(p.metadata?.tags||[]).join(" · ")}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(JSON.stringify(p, null, 2))} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Copy JSON</button>
                <button onClick={() => remove(p.id)} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
