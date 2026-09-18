"use client"

import { cn } from "@/lib/utils"

interface TierBadgeProps {
  tier: string
  size?: "sm" | "md" | "lg"
}

const TIER_COLORS: Record<string, string> = {
  new: "bg-gray-400",
  rising: "bg-blue-400",
  established: "bg-green-400",
  featured: "bg-amber-400",
  elite: "bg-blue-500",
}

export default function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const color = TIER_COLORS[tier] || TIER_COLORS.new
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full font-mono font-medium text-white", sizeClasses[size])} style={{ backgroundColor: "var(--signal)" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  )
}