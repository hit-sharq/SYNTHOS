"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"
import { PageHead } from "@/components/app/Page"
import { Empty, ErrorState, StatusPill } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import { AdminShell } from "@/components/app/AdminShell"
import { logAuditAction } from "@/app/actions/audit"

type Message = {
  id: string
  senderName?: string
  senderRole?: string
  subject?: string
  body: string
  kind: string
  read: boolean
  createdAt: string
  attachments: string[]
}

type Conversation = {
  id: string
  projectId?: string
  project?: { id: string; name: string }
  participants: string[]
  messages: Message[]
}

export default function AdminMessageDetailPage() {
  const params = useParams()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState("")
  const [sending, setSending] = useState(false)

  const load = async () => {
    try {
      const res = await fetch("/api/conversations")
      if (!res.ok) throw new Error("Failed to load conversations")
      const data = await res.json()
      const found = data.find((c: Conversation) => c.id === params.id)
      if (found) setConversation(found)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [params.id])

  const sendReply = async () => {
    if (!replyBody.trim() || !conversation) return
    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          subject: "Re: " + (conversation.messages[conversation.messages.length - 1]?.subject || "Conversation"),
          body: replyBody,
          kind: "message",
        }),
      })
      if (!res.ok) throw new Error("Failed to send reply")
      await logAuditAction({ action: "message.send", targetType: "Conversation", targetId: conversation.id })
      setReplyBody("")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send reply")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="admin-content">
          <PageHead eyebrow="Admin" title="Messages" desc="Loading conversation..." />
          <p style={{ color: "#8e8e93" }}>Loading…</p>
        </div>
      </AdminShell>
    )
  }

  if (error || !conversation) {
    return (
      <AdminShell>
        <div className="admin-content">
          <PageHead eyebrow="Admin" title="Messages" desc="Conversation not found." />
          <ErrorState title="Could not load conversation" message={error || "Not found"} />
          <Link href="/admin/messages" className="btn btn-ghost" style={{ marginTop: 16 }}>← Back to Messages</Link>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="admin-content">
        <PageHead
          eyebrow="Admin"
          title={conversation.project?.name || "Conversation"}
          desc={`Participants: ${conversation.participants.join(", ")}`}
          actions={
            <Link href="/admin/messages" className="btn btn-ghost"><ArrowLeft size={16} /> Back</Link>
          }
        />

        <div style={{ display: "grid", gap: 16 }}>
          <StaggerContainer>
            {conversation.messages.map((msg) => (
              <RevealOnScroll key={msg.id}>
                <div
                  key={msg.id}
                  className="panel-soft"
                  style={{
                    padding: 18,
                    borderLeft: msg.senderRole === "admin" ? "3px solid var(--signal)" : "3px solid var(--line)",
                    background: msg.senderRole === "admin" ? "var(--surface-2)" : "var(--bg)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.92rem" }}>{msg.senderName || "Unknown"}</span>
                      <span className={`admin-badge ${msg.senderRole === "admin" ? "admin-badge-active" : "admin-badge-review"}`}>{msg.senderRole || "user"}</span>
                      <StatusPill status={msg.kind === "proposal" ? "review" : msg.kind === "quote" ? "active" : "draft"} />
                    </div>
                    <span className="tiny muted">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  {msg.subject && <p style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.92rem", marginBottom: 6 }}>{msg.subject}</p>}
                  <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.body}</p>
                  {msg.attachments?.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {msg.attachments.map((att, i) => (
                        <a key={i} href={att} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Attachment {i + 1}</a>
                      ))}
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            ))}
          </StaggerContainer>

          <div className="admin-section" style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <textarea
                className="admin-input"
                placeholder="Write a reply..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={3}
                style={{ flex: 1, resize: "vertical" }}
              />
              <button className="admin-btn-primary" onClick={sendReply} disabled={sending || !replyBody.trim()} style={{ alignSelf: "flex-end" }}>
                <Send size={16} /> {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}