"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

type Comment = {
  id: string
  body: string
  createdAt: string
  user: { id: string; name: string | null; initials: string | null; role: string }
}

export function CommentThread({
  postId,
  comments,
}: {
  postId: string
  comments: Comment[]
}) {
  const [newComment, setNewComment] = useState("")
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body }),
      })
      if (!res.ok) throw new Error("Failed to post comment")
      return res.json()
    },
    onSuccess: () => {
      setNewComment("")
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    mutation.mutate(newComment.trim())
  }

  const displayName = (user: Comment["user"]) =>
    user.name || user.initials || "Anonymous"

  return (
    <div className="border-t border-border mt-2 pt-2 space-y-2">
      {comments.map(comment => (
        <div key={comment.id} className="text-xs">
          <span className="font-semibold">{displayName(comment.user)}:</span>{" "}
          <span>{comment.body}</span>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 text-xs bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || mutation.isPending}
          className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {mutation.isPending ? "..." : "Send"}
        </button>
      </form>
    </div>
  )
}
