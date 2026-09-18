"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PageHead, PageWrap } from "@/components/app/Page"
import LevelBadge from "@/components/app/LevelBadge"
import { cn } from "@/lib/utils"

async function fetchFeed() {
  const res = await fetch("/api/feed")
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

async function createPost(data: { content: string }) {
  const res = await fetch("/api/feed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

async function toggleReaction(postId: string, type: string) {
  const res = await fetch(`/api/feed/${postId}/reactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  })
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

export default function FeedPage() {
  const [newPost, setNewPost] = useState("")
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeed,
  })

  const postMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
      setNewPost("")
    },
  })

  const reactionMutation = useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) => toggleReaction(postId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    },
  })

  const posts = data?.posts || []

  return (
    <PageWrap>
      <PageHead
        eyebrow="// Creator Feed"
        title="What creators are saying"
        desc="Follow creators, see their updates, and share your own story."
      />

      <div className="panel p-4 mb-6" style={{ borderRadius: 0 }}>
        <textarea
          placeholder="Share an update with your network..."
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          style={{
            width: "100%", minHeight: 80, padding: "10px 12px",
            border: "1px solid var(--line)", background: "var(--surface)",
            color: "var(--ink)", fontFamily: "inherit", fontSize: "0.92rem",
            resize: "vertical", lineHeight: 1.6,
          }}
        />
        <div className="row" style={{ marginTop: 8, justifyContent: "flex-end" }}>
          <button
            className="btn btn-primary btn-sm"
            disabled={!newPost.trim()}
            onClick={() => postMutation.mutate({ content: newPost })}
          >
            Post
          </button>
        </div>
      </div>

      <div className="stack gap-4">
        {isLoading && <p className="muted">Loading feed...</p>}
        {error && <p style={{ color: "var(--rejected)" }}>Failed to load feed</p>}

        {posts.map((p: any) => (
          <div key={p.id} className="panel" style={{ borderRadius: 0, padding: 20 }}>
            <div className="row" style={{ gap: 12, marginBottom: 12 }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold" style={{ background: "var(--surface-2)", color: "var(--ink)" }}>
                {p.author?.initials || "?"}
              </div>
              <div>
                <div className="row gap-2">
                  <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.92rem" }}>
                    {p.author?.name || "Anonymous"}
                  </span>
                  <LevelBadge level={p.author?.level || 1} levelXP={p.author?.levelXP || 0} size="sm" />
                </div>
                <span className="tiny muted mono">{new Date(p.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <p style={{ color: "var(--ink-2)", lineHeight: 1.6, fontSize: "0.92rem", marginBottom: 12 }}>
              {p.content}
            </p>
            {p.projectId && <span className="chip" style={{ marginBottom: 8 }}>Project</span>}
            <div className="row gap-4" style={{ marginTop: 8 }}>
              <button
                className="tiny"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--signal)", fontFamily: "var(--font-mono)" }}
                onClick={() => reactionMutation.mutate({ postId: p.id, type: "like" })}
              >
                Like
              </button>
              <span className="tiny" style={{ color: "var(--ink-3)" }}>
                {(p.reactions || []).length} reactions
              </span>
              <span className="tiny" style={{ color: "var(--ink-3)" }}>
                {(p.comments || []).length} comments
              </span>
            </div>
          </div>
        ))}
      </div>
    </PageWrap>
  )
}
