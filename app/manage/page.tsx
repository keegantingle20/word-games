"use client";
import { useEffect, useState } from "react";
import type { WordEntry } from "@/types/data";

export default function ManageWordsPage() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [form, setForm] = useState<WordEntry>({ word: "", categories: [], metadata: { themes: [], personal: {} } });
  const [errors, setErrors] = useState<string[]>([]);
  const [csvText, setCsvText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("customWords");
      if (raw) setWords(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("customWords", JSON.stringify(words)); } catch {}
  }, [words]);

  function validate(entry: WordEntry): string[] {
    const errs: string[] = [];
    const w = (entry.word || "").trim().toLowerCase();
    if (!w) errs.push("Word is required");
    if (w.length < 4 || w.length > 6) errs.push("Word must be 4-6 letters");
    if (!/^[a-zA-Z]+$/.test(w)) errs.push("Letters only (A-Z)");
    if (words.some((e) => e.word.toLowerCase() === w)) errs.push("Duplicate word");
    return errs;
  }

  function addWord() {
    const errs = validate(form);
    setErrors(errs);
    if (errs.length) return;
    setWords((w) => [...w, { ...form, word: form.word.trim().toLowerCase() }]);
    setForm({ word: "", categories: [], metadata: { themes: [], personal: {} } });
  }

  function removeWord(i: number) {
    setWords((w) => w.filter((_, idx) => idx !== i));
  }

  function exportCSV() {
    const header = ["word","categories","themes","personal_note"].join(",");
    const rows = words.map((w) => [
      w.word,
      (w.categories||[]).join("|"),
      (w.metadata?.themes||[]).join("|"),
      (w.metadata?.personal?.note||"").replaceAll("\n"," ")
    ].map((v) => `"${String(v).replaceAll('"','""')}"`).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wordle_words.csv";
    a.click();
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(words, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wordle_words.json";
    a.click();
  }

  function parseCSVLine(line: string): string[] {
    const out: string[] = [];
    let cur = ""; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; }
        else if (ch === '"') { inQ = false; }
        else { cur += ch; }
      } else {
        if (ch === ',') { out.push(cur); cur = ""; }
        else if (ch === '"') { inQ = true; }
        else { cur += ch; }
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  }

  function importCSV() {
    const lines = csvText.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return;
    const [header, ...rows] = lines;
    const cols = header.split(",").map((c) => c.toLowerCase().trim());
    const idxWord = cols.indexOf("word");
    if (idxWord === -1) { setErrors(["CSV must include a 'word' column"]); return; }
    const idxCats = cols.indexOf("categories");
    const idxThemes = cols.indexOf("themes");
    const idxNote = cols.indexOf("personal_note");
    const imported: WordEntry[] = [];
    const errList: string[] = [];
    rows.forEach((line, li) => {
      const vals = parseCSVLine(line);
      const word = (vals[idxWord]||"").toLowerCase();
      const entry: WordEntry = {
        word,
        categories: idxCats>=0 ? (vals[idxCats]||"").split("|").map(s=>s.trim()).filter(Boolean) : [],
        metadata: {
          themes: idxThemes>=0 ? (vals[idxThemes]||"").split("|").map(s=>s.trim()).filter(Boolean) : [],
          personal: { note: idxNote>=0 ? (vals[idxNote]||"") : "" }
        }
      };
      const errs = validate(entry);
      if (errs.length) errList.push(`Line ${li+2}: ${errs.join("; ")}`);
      else imported.push(entry);
    });
    if (errList.length) { setErrors(errList); return; }
    // de-dup with existing
    const setExisting = new Set(words.map(w=>w.word));
    const merged = [...words, ...imported.filter(e=>!setExisting.has(e.word))];
    setWords(merged);
    setCsvText("");
    setErrors([]);
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="text-2xl font-semibold mb-4">Manage Words</h1>

      <div className="mb-6 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 bg-[var(--card)]">
          <div className="mb-2 text-sm opacity-70">Add new word</div>
          <input value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} placeholder="word" className="w-full mb-2 rounded-md border border-black/10 dark:border-white/10 px-2 py-1" />
          <input value={(form.categories||[]).join(", ")} onChange={(e) => setForm({ ...form, categories: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) })} placeholder="categories (comma separated)" className="w-full mb-2 rounded-md border border-black/10 dark:border-white/10 px-2 py-1" />
          <input value={(form.metadata?.themes||[]).join(", ")} onChange={(e) => setForm({ ...form, metadata: { ...(form.metadata||{}), themes: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) } })} placeholder="themes (comma separated)" className="w-full mb-2 rounded-md border border-black/10 dark:border-white/10 px-2 py-1" />
          <input value={form.metadata?.personal?.note||""} onChange={(e) => setForm({ ...form, metadata: { ...(form.metadata||{}), personal: { ...(form.metadata?.personal||{}), note: e.target.value } } })} placeholder="personal note" className="w-full mb-2 rounded-md border border-black/10 dark:border-white/10 px-2 py-1" />
          <button onClick={addWord} className="rounded-md px-3 py-1.5 bg-[var(--accent)] text-white text-sm">Add</button>
        </div>

        <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 bg-[var(--card)]">
          <div className="mb-2 text-sm opacity-70">Your custom words ({words.length})</div>
          <div className="max-h-80 overflow-auto space-y-2">
            {words.map((w, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-md border border-black/10 dark:border-white/10 p-2">
                <div>
                  <div className="font-semibold uppercase">{w.word}</div>
                  <div className="text-xs opacity-70">{(w.categories||[]).join(" · ")}</div>
                  {w.metadata?.personal?.note && <div className="text-xs italic opacity-80">{w.metadata.personal.note}</div>}
                </div>
                <button onClick={() => removeWord(i)} className="text-xs rounded-md px-2 py-1 bg-black/10 dark:bg-white/10">Remove</button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => navigator.clipboard.writeText(JSON.stringify(words, null, 2))} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Copy JSON</button>
            <button onClick={exportJSON} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Download JSON</button>
            <button onClick={exportCSV} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Export CSV</button>
            <button onClick={() => setWords([])} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Clear</button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 bg-[var(--card)]">
        <div className="mb-2 font-semibold">Bulk Import (CSV)</div>
        <div className="text-xs opacity-70 mb-2">Columns: word, categories (pipe | separated), themes (| separated), personal_note</div>
        <textarea value={csvText} onChange={(e)=>setCsvText(e.target.value)} rows={6} className="w-full rounded-md border border-black/10 dark:border-white/10 px-2 py-1 font-mono text-xs" placeholder={'word,categories,themes,personal_note\ncrane,animals|nature,nature,first hike'} />
        <div className="mt-2 flex gap-2">
          <button onClick={importCSV} className="rounded-md px-3 py-1.5 bg-[var(--accent)] text-white text-sm">Import CSV</button>
          <button onClick={()=>setCsvText("")} className="rounded-md px-3 py-1.5 bg-black/10 dark:bg-white/10 text-sm">Clear</button>
        </div>
      </div>
    </div>
  );
}
