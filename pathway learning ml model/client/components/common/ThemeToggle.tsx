import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-2.5 py-2 text-sm text-white shadow-md backdrop-blur transition hover:bg-white/20 dark:text-white"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
