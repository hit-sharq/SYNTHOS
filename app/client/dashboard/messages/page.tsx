"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, ErrorState, StatusPill } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import "@/components/app/admin.css"

type Message = {
  id: string
  title: string
  message: string
  kind: string
  refId?: string
  read: boolean
  createdAt: string
}

export default function ClientMessagesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push("/client/login"); return }
    fetch("/api/notifications")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data: any) => {
        setMessages(data.notifications || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, isLoaded, router])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" })
    setMessages(messages.map(n => n.id === id ? { ...n, read: true } : n))
  }

  if (!isLoaded || loading) {
    return <PageWrap><div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading messages…</p></div></PageWrap>
  }

  const unread = messages.filter(n => !n.read).length

  return (
    <PageWrap>
      <PageHead
        eyebrow="Client"
        title="Messages"
        desc="Notifications and updates about your projects."
        actions={<span className="tag-human"><span className="dot dot-human" /> {unread} unread</span>}
      />
      {messages.length === 0 ? (
        <Empty title="No messages yet" hint="You will receive notifications when your projects progress." />
      ) : (
        <StaggerContainer>
          <div className="stack gap-2">
            {messages.map((n) => (
              <RevealOnScroll key={n.id}>
                <div
                  onClick={() => markAsRead(n.id)}
                  className="panel-soft"
                  style={{
                    padding: 18,
                    cursor: "pointer",
                    borderLeft: !n.read ? "3px solid var(--signal)" : "1px solid var(--line)",
                    background: !n.read ? "var(--surface-2)" : "var(--bg)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div className="grow">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: !n.read ? 600 : 400, color: "var(--ink)", fontSize: "0.92rem" }}>{n.title}</span>
                        <StatusPill status={n.kind === "approval" ? "review" : n.kind === "message" ? "active" : "draft"} />
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "var(--ink-2)", lineHeight: 1.5 }}>{n.message}</p>
                      <span className="tiny muted" style={{ marginTop: 6, display: "block" }}>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    {n.refId && (
                      <Link href={`/public/project/${n.refId}`} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>Open</Link>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </StaggerContainer>
      )}
    </PageWrap>
  )
}
