"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export function ReactionBar({
  postId,
  likeCount,
  userReaction,
}: {
  postId: string
  likeCount: number
  userReaction: string | null
}) {
  const queryClient = useQueryClient()

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, type: "like" }),
      })
      if (!res.ok) throw new Error("Failed to like")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    },
  })

  const unlikeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, type: "like" }),
      })
      if (!res.ok) throw new Error("Failed to unlike")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    },
  })

  const handleLike = () => {
    if (userReaction === "like") {
      unlikeMutation.mutate()
    } else {
      likeMutation.mutate()
    }
  }

  return (
    <div className="flex items-center gap-4 border-t border-border pt-2">
      <button
        onClick={handleLike}
        disabled={likeMutation.isPending || unlikeMutation.isPending}
        className={`flex items-center gap-1 text-sm ${
          userReaction === "like" ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span>👍</span>
        <span>{likeCount}</span>
      </button>
    </div>
  )
}
