"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = theme === "system" ? systemTheme : theme;
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(active === "dark" ? "light" : "dark")}
      className="rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 bg-[var(--card)] shadow hover:scale-[1.02] active:scale-95 transition-transform"
    >
      {mounted && active === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
