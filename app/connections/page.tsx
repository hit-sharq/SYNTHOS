"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ProfileCard } from "@/components/ProfileCard"
import { Errors } from "@/lib/errors"

async function fetchUsers() {
  const res = await fetch("/api/people")
  if (!res.ok) throw new Error(Errors.actions.operationFailed)
  return res.json()
}

export default function ConnectionsPage() {
  const { data } = useQuery({ queryKey: ["users"], queryFn: fetchUsers })
  const queryClient = useQueryClient()
  const users = data?.users || []

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">People</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {users.map((u: any) => (
          <ProfileCard
            key={u.id}
            user={u}
            connectionStatus={u.connectionStatus}
          />
        ))}
      </div>
    </div>
  )
}
