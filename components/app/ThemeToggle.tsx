"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/lib/theme"
import "./theme-toggle.css"

export default function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useTheme()

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Theme">
      <button
        className={`theme-btn ${theme === "light" ? "active" : ""}`}
        onClick={() => setTheme("light")}
        title="Light mode"
        aria-label="Light mode"
        role="radio"
        aria-checked={theme === "light"}
      >
        <Sun size={14} strokeWidth={1.8} />
      </button>
      <button
        className={`theme-btn ${theme === "dark" ? "active" : ""}`}
        onClick={() => setTheme("dark")}
        title="Dark mode"
        aria-label="Dark mode"
        role="radio"
        aria-checked={theme === "dark"}
      >
        <Moon size={14} strokeWidth={1.8} />
      </button>
    </div>
  )
}
