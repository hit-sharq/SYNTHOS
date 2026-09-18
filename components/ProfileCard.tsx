"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

export function ProfileCard({
  user,
  connectionStatus,
  level,
  levelXP,
}: {
  user: {
    id: string
    name: string | null
    initials: string | null
    role: string
    presence?: { status: string; lastActive: string | null } | null
  }
  connectionStatus?: string | null
  level?: number
  levelXP?: number
}) {
  const queryClient = useQueryClient()
  const displayName = user.name || user.initials || "Anonymous"
  const initials = user.initials || displayName.substring(0, 2).toUpperCase()

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"
      default: return "bg-gray-400"
    }
  }

  const getTierColor = (lvl?: number) => {
    if (!lvl) return null
    if (lvl >= 5) return "bg-blue-500"
    if (lvl >= 4) return "bg-amber-500"
    if (lvl >= 3) return "bg-green-500"
    if (lvl >= 2) return "bg-blue-400"
    return "bg-gray-400"
  }

  const tierTitle = (lvl?: number) => {
    if (!lvl) return null
    if (lvl >= 5) return "Elite"
    if (lvl >= 4) return "Featured"
    if (lvl >= 3) return "Established"
    if (lvl >= 2) return "Rising"
    return "New"
  }

  const connectMutation = useMutation({
    mutationFn: async (followedId: string) => {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followedId }),
      })
      if (!res.ok) throw new Error("Failed to connect")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  return (
    <div className="border border-border rounded-lg p-4 text-center">
      <div className="relative inline-block mb-2">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
          {initials}
        </div>
        {user.presence && (
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(
              user.presence.status
            )}`}
          />
        )}
        {level && level > 1 && (
          <div
            className={`absolute -top-1 -left-1 w-5 h-5 rounded-full ${cn(getTierColor(level), "text-white text-[8px] font-bold flex items-center justify-center")}`}
            title={`${tierTitle(level)} — Level ${level}`}
          >
            {level}
          </div>
        )}
      </div>
      <h3 className="font-semibold">{displayName}</h3>
      <p className="text-xs text-muted-foreground">{user.role}</p>
      {level && level > 1 && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{tierTitle(level)}</p>
      )}
      {user.presence?.lastActive && (
        <p className="text-xs text-muted-foreground mt-1">
          Last seen {new Date(user.presence.lastActive).toLocaleString()}
        </p>
      )}
      {connectionStatus !== "accepted" && (
        <button
          onClick={() => connectMutation.mutate(user.id)}
          disabled={connectMutation.isPending}
          className="mt-3 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {connectionStatus === "pending" ? "Pending" : "Connect"}
        </button>
      )}
      {connectionStatus === "accepted" && (
        <p className="mt-3 text-xs text-green-600">Connected</p>
      )}
    </div>
  )
}
