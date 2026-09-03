"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PageHead } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"

type Conversation = {
  id: string
  projectId?: string
  project?: { id: string; name: string }
  participants: string[]
  messages: {
    id: string
    senderName?: string
    subject?: string
    body: string
    kind: string
    createdAt: string
  }[]
  updatedAt: string
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const load = async () => {
    try {
      const res = await fetch("/api/conversations")
      if (!res.ok) throw new Error("Failed to load conversations")
      const data = await res.json()
      setConversations(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = conversations.filter((c) => {
    const projectName = c.project?.name || ""
    const participants = c.participants.join(" ")
    const lastMsg = c.messages[c.messages.length - 1]
    const text = (lastMsg?.subject || lastMsg?.body || "").toLowerCase()
    return projectName.toLowerCase().includes(search.toLowerCase()) ||
      participants.toLowerCase().includes(search.toLowerCase()) ||
      text.includes(search.toLowerCase())
  })

  if (loading) {
    return (
      <div className="admin-content">
        <PageHead eyebrow="Admin" title="Messages" desc="Client communications and sent proposals/quotes." />
        <p style={{ color: "#8e8e93" }}>Loading conversations…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-content">
        <PageHead eyebrow="Admin" title="Messages" desc="Client communications and sent proposals/quotes." />
        <ErrorState title="Could not load messages" message={error} onRetry={load} />
      </div>
    )
  }

  return (
    <div className="admin-content">
      <PageHead eyebrow="Admin" title="Messages" desc="Client communications and sent proposals/quotes." />
      {filtered.length === 0 ? (
        <div className="admin-section" style={{ padding: 30, textAlign: "center" }}>
          <p style={{ color: "#8e8e93" }}>{search ? "No conversations match your search." : "No conversations yet. Messages will appear here after meetings."}</p>
        </div>
      ) : (
        <div className="admin-section">
          <div style={{ marginBottom: 16 }}>
            <input
              className="admin-input"
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 400 }}
            />
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table responsive-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Participants</th>
                  <th>Last Message</th>
                  <th>Date</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((conv) => {
                  const lastMsg = conv.messages[conv.messages.length - 1]
                  return (
                    <tr key={conv.id}>
                      <td data-label="Project">
                        <span style={{ fontWeight: 600, color: "#1b1a17" }}>{conv.project?.name || "Unknown"}</span>
                      </td>
                      <td data-label="Participants" className="admin-table-muted">{(conv.participants || []).join(", ")}</td>
                      <td data-label="Last Message">
                        <span className="chip">{lastMsg?.subject || lastMsg?.kind || "Message"}</span>
                      </td>
                      <td data-label="Date" className="admin-table-muted">{lastMsg ? new Date(lastMsg.createdAt).toLocaleDateString() : "—"}</td>
                      <td data-label="Actions">
                        <Link href={`/admin/messages/${conv.id}`} className="btn btn-ghost btn-sm">View</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}