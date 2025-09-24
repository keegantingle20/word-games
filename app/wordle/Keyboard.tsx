"use client";
import { cn } from "@/lib/utils";

const ROWS = ["qwertyuiop","asdfghjkl","zxcvbnm"];
export default function Keyboard({
  onKey,
  keyStates,
}: {
  onKey: (key: string) => void;
  keyStates: Record<string, "hit" | "near" | "miss" | undefined>;
}) {
  return (
    <div className="mx-auto max-w-md select-none">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-1 mb-1">
          {ri === 2 && (
            <button onClick={() => onKey("Enter")}
              className="px-3 text-sm h-10 rounded-md bg-black/10 dark:bg-white/10">Enter</button>
          )}
          {row.split("").map((k) => {
            const state = keyStates[k];
            return (
              <button
                key={k}
                onClick={() => onKey(k)}
                className={cn(
                  "h-10 w-8 rounded-md text-sm capitalize",
                  "bg-black/10 dark:bg-white/10",
                  state === "hit" && "bg-green-500 text-white",
                  state === "near" && "bg-yellow-400 text-black",
                  state === "miss" && "bg-neutral-400 text-black"
                )}
              >
                {k}
              </button>
            );
          })}
          {ri === 2 && (
            <button onClick={() => onKey("Backspace")}
              className="px-3 text-sm h-10 rounded-md bg-black/10 dark:bg-white/10">⌫</button>
          )}
        </div>
      ))}
    </div>
  );
}
