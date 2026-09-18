"use client"

import { cn } from "@/lib/utils"

interface LevelBadgeProps {
  level: number
  levelXP: number
  size?: "sm" | "md" | "lg"
}

const TIER_CONFIG: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: "New", color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/30" },
  2: { label: "Rising", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
  3: { label: "Established", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30" },
  4: { label: "Featured", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" },
  5: { label: "Elite", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
}

export default function LevelBadge({ level, levelXP, size = "md" }: LevelBadgeProps) {
  const config = TIER_CONFIG[level] || TIER_CONFIG[1]
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full border font-mono font-medium", config.bg, config.border, config.color, sizeClasses[size])}>
      <span className="flex items-center gap-1">
        <span className={cn("w-1.5 h-1.5 rounded-full", config.bg.replace("/10", "").replace("bg-", "bg-"))} style={{ backgroundColor: "currentColor" }} />
        L{level}
      </span>
      <span className={cn("opacity-60", size === "sm" ? "hidden" : "")}>{config.label}</span>
    </div>
  )
}