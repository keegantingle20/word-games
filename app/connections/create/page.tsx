"use client";
import { useState } from "react";
import type { ConnectionsPuzzle, ConnectionsGroup } from "@/types/data";

const emptyGroup = (): ConnectionsGroup => ({ title: "", words: ["", "", "", ""], color: "bg-yellow-400", hint: "", description: "", personal: {} });

export default function CreateConnectionsPage() {
  const [puzzle, setPuzzle] = useState<ConnectionsPuzzle>({
    id: `custom.${Date.now()}`,
    title: "My Puzzle",
    description: "",
    groups: [emptyGroup(), emptyGroup(), emptyGroup(), emptyGroup()],
    metadata: { difficulty: "easy", themes: [], personal: {}, tags: [] }
  });
  const [errors, setErrors] = useState<string[]>([]);

  function updateGroup(i: number, update: Partial<ConnectionsGroup>) {
    setPuzzle((p) => {
      const g = [...p.groups];
      g[i] = { ...g[i], ...update } as ConnectionsGroup;
      return { ...p, groups: g as [ConnectionsGroup, ConnectionsGroup, ConnectionsGroup, ConnectionsGroup] };
    });
  }

  function saveToLibrary() {
    // validate
    const errs: string[] = [];
    puzzle.groups.forEach((g, i) => {
      if (!g.title.trim()) errs.push(`Group ${i+1} needs a title`);
      if (g.words.some((w) => !w.trim())) errs.push(`Group ${i+1} has empty words`);
      const set = new Set(g.words.map(w=>w.toLowerCase().trim()));
      if (set.size !== 4) errs.push(`Group ${i+1} has duplicate words`);
    });
    const all = puzzle.groups.flatMap(g=>g.words.map(w=>w.toLowerCase().trim()));
    const dupAcross = new Set(all.filter((w, i) => all.indexOf(w) !== i));
    if (dupAcross.size) errs.push(`Duplicate across groups: ${Array.from(dupAcross).join(", ")}`);
    setErrors(errs);
    if (errs.length) return;
    try {
      const raw = localStorage.getItem("connectionsLibrary");
      const arr: ConnectionsPuzzle[] = raw ? JSON.parse(raw) : [];
      const idx = arr.findIndex((x) => x.id === puzzle.id);
      if (idx >= 0) arr[idx] = puzzle; else arr.push(puzzle);
      localStorage.setItem("connectionsLibrary", JSON.stringify(arr));
      alert("Saved to library");
    } catch {}
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="text-2xl font-semibold mb-4">Create Connections Puzzle</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {puzzle.groups.map((g, i) => (
          <div key={i} className="rounded-xl border border-black/10 dark:border-white/10 p-4 bg-[var(--card)]">
            <div className="mb-2 font-semibold">Group {i + 1}</div>
            <input value={g.title} onChange={(e) => updateGroup(i, { title: e.target.value })} placeholder="Group title" className="w-full mb-2 rounded-md border border-black/10 dark:border-white/10 px-2 py-1" />
            <div className="grid grid-cols-2 gap-2">
              {g.words.map((w, wi) => (
                <input key={wi} value={w} onChange={(e) => updateGroup(i, { words: g.words.map((x, xi) => xi === wi ? e.target.value : x) as [string, string, string, string] })} placeholder={`Word ${wi + 1}`} className="w-full rounded-md border border-black/10 dark:border-white/10 px-2 py-1" />
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input value={g.hint||""} onChange={(e) => updateGroup(i, { hint: e.target.value })} placeholder="Hint (optional)" className="w-full rounded-md border border-black/10 dark:border-white/10 px-2 py-1" />
              <input value={g.description||""} onChange={(e) => updateGroup(i, { description: e.target.value })} placeholder="Description (optional)" className="w-full rounded-md border border-black/10 dark:border-white/10 px-2 py-1" />
            </div>
            <input value={g.personal?.note||""} onChange={(e) => updateGroup(i, { personal: { ...(g.personal||{}), note: e.target.value } })} placeholder="Personal note (optional)" className="mt-2 w-full rounded-md border border-black/10 dark:border-white/10 px-2 py-1" />
            <div className="mt-2">
              <label className="text-sm opacity-70 mr-2">Color</label>
              <select value={g.color||"bg-yellow-400"} onChange={(e) => updateGroup(i, { color: e.target.value })} className="rounded-md border border-black/10 dark:border-white/10 bg-[var(--card)] px-2 py-1 text-sm">
                <option value="bg-yellow-400">Yellow</option>
                <option value="bg-green-500">Green</option>
                <option value="bg-blue-500">Blue</option>
                <option value="bg-purple-500">Purple</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="text-sm opacity-70">Difficulty</label>
        <select value={puzzle.metadata?.difficulty||"easy"} onChange={(e) => setPuzzle((p) => ({ ...p, metadata: { ...(p.metadata||{}), difficulty: e.target.value as "easy" | "medium" | "hard" | "expert" } }))} className="rounded-md border border-black/10 dark:border-white/10 bg-[var(--card)] px-2 py-1 text-sm">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>
        <input value={(puzzle.metadata?.tags||[]).join(", ")} onChange={(e) => setPuzzle((p) => ({ ...p, metadata: { ...(p.metadata||{}), tags: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) } }))} placeholder="tags (comma)" className="rounded-md border border-black/10 dark:border-white/10 bg-[var(--card)] px-2 py-1 text-sm" />
        <button onClick={saveToLibrary} className="ml-auto rounded-md px-3 py-1.5 bg-[var(--accent)] text-white text-sm">Save to Library</button>
      </div>

      {/* Preview */}
      <div className="mt-6 rounded-xl border border-black/10 dark:border-white/10 p-4 bg-[var(--card)]">
        <div className="mb-2 font-semibold">Preview</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {puzzle.groups.flatMap(g=>g.words).map((w, i) => (
            <div key={i} className="rounded-xl px-3 py-3 sm:py-4 font-semibold uppercase tracking-wide border border-black/10 dark:border-white/10 bg-[var(--card)] shadow">{w || "—"}</div>
          ))}
        </div>
        {errors.length>0 && (
          <div className="mt-3 text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">{errors.join("\n")}</div>
        )}
      </div>
    </div>
  );
}
