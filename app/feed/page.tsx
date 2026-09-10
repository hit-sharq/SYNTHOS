"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PostComposer } from "@/components/PostComposer"
import { PostCard } from "@/components/PostCard"
import { Errors } from "@/lib/errors"

async function fetchFeed() {
  const res = await fetch("/api/feed")
  if (!res.ok) throw new Error(Errors.actions.operationFailed)
  return res.json()
}

async function createPost(content: string) {
  const res = await fetch("/api/feed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) throw new Error(Errors.actions.operationFailed)
  return res.json()
}

export default function FeedPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["feed"], queryFn: fetchFeed })
  const queryClient = useQueryClient()

  const postMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    },
  })

  const handlePost = async (content: string) => {
    return postMutation.mutateAsync(content)
  }

  if (isLoading) return <div className="max-w-2xl mx-auto p-4">Loading feed...</div>
  if (error) return <div className="max-w-2xl mx-auto p-4">{Errors.actions.operationFailed}</div>

  const posts = data?.posts || []

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feed</h1>
      <PostComposer onPost={handlePost} />
      <div>
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No posts yet. Be the first to share!</p>
        ) : (
          posts.map((post: any) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}
