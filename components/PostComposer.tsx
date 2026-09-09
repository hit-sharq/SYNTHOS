"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function PostComposer({ onPost }: { onPost: (content: string) => Promise<any> }) {
  const [content, setContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const mutation = useMutation({
    mutationFn: onPost,
    onSuccess: () => {
      setContent("")
      setIsPosting(false)
    },
    onError: () => {
      setIsPosting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isPosting) return
    setIsPosting(true)
    mutation.mutate(content.trim())
  }

  return (
    <div className="border border-border rounded-lg p-3 mb-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an update..."
          rows={3}
          className="w-full bg-background text-foreground border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!content.trim() || isPosting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  )
}
