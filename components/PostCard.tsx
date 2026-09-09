"use client"

import { useState } from "react"
import { ReactionBar } from "./ReactionBar"
import { CommentThread } from "./CommentThread"

type FeedPostWithRelations = {
  id: string
  content: string
  createdAt: string
  author: { id: string; name: string | null; initials: string | null; role: string }
  reactions: Array<{ type: string; userId: string }>
  comments: Array<{
    id: string
    body: string
    createdAt: string
    user: { id: string; name: string | null; initials: string | null; role: string }
  }>
}

export function PostCard({ post }: { post: FeedPostWithRelations }) {
  const [showComments, setShowComments] = useState(false)
  const userReaction = post.reactions.find(r => r.type === "like") ? "like" : null
  const likeCount = post.reactions.filter(r => r.type === "like").length

  const displayName = post.author.name || post.author.initials || "Anonymous"
  const initials = post.author.initials || displayName.substring(0, 2).toUpperCase()

  return (
    <div className="border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
          {initials}
        </div>
        <div>
          <div className="font-semibold">{displayName}</div>
          <div className="text-xs text-muted-foreground">{post.author.role}</div>
        </div>
      </div>
      <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
      <div className="text-xs text-muted-foreground mb-3">
        {new Date(post.createdAt).toLocaleString()}
      </div>
      <ReactionBar
        postId={post.id}
        likeCount={likeCount}
        userReaction={userReaction}
      />
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-xs text-muted-foreground hover:text-foreground mt-2"
      >
        {showComments ? "Hide" : "Show"} comments ({post.comments.length})
      </button>
      {showComments && (
        <CommentThread postId={post.id} comments={post.comments} />
      )}
    </div>
  )
}
