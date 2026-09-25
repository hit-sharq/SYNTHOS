"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

interface FollowButtonProps {
  talentId: string
  initialFollowed?: boolean
  size?: "sm" | "md"
  className?: string
}

export function FollowButton({ talentId, initialFollowed = false, size = "sm", className }: FollowButtonProps) {
  const queryClient = useQueryClient()
  const [followed, setFollowed] = useState(initialFollowed)

  const mutation = useMutation({
    mutationFn: async (nextFollowed: boolean) => {
      const res = await fetch(`/api/follow/${talentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update")
      }
      const data = await res.json()
      return data.followed as boolean
    },
    onMutate: (nextFollowed: boolean) => {
      const previous = followed
      setFollowed(nextFollowed)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) setFollowed(context.previous)
    },
    onSuccess: (nextFollowed: boolean) => {
      setFollowed(nextFollowed)
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    },
  })

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  }

  return (
    <button
      type="button"
      onClick={() => mutation.mutate(!followed)}
      disabled={mutation.isPending}
      className={cn(
        "btn btn-sm rounded-full font-medium transition-colors",
        followed
          ? "btn-ghost"
          : "btn-primary",
        sizeClasses[size],
        className
      )}
      style={{ flexShrink: 0 }}
    >
      {mutation.isPending ? "..." : followed ? "Following" : "Follow"}
    </button>
  )
}