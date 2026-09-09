"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export function ProfileCard({
  user,
  connectionStatus,
}: {
  user: {
    id: string
    name: string | null
    initials: string | null
    role: string
    presence?: { status: string; lastActive: string | null } | null
  }
  connectionStatus?: string | null
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
      </div>
      <h3 className="font-semibold">{displayName}</h3>
      <p className="text-xs text-muted-foreground">{user.role}</p>
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
