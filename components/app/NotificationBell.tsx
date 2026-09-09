"use client"

import { useState, useEffect } from "react"
import { Bell, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Notification = {
  id: string
  title: string
  message: string
  kind: string
  refId?: string
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnread(data.unread || 0)
    } catch (e) {
      console.error("Failed to load notifications:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(() => {
      load()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="admin-icon-btn"
        style={{ position: "relative", width: 40, height: 40 }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "var(--signal)",
              color: "#fff",
              fontSize: "0.65rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="admin-backdrop"
            style={{ display: "block" }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              width: 360,
              maxWidth: "calc(100vw - 32px)",
              background: "var(--bg)",
              border: "1px solid var(--line-strong)",
              borderRadius: 8,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              zIndex: 60,
              maxHeight: 480,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--ink)",
                }}
              >
                Notifications
              </span>
              {unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--signal)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {loading ? (
                <div style={{ padding: 24, textAlign: "center" }}>
                  <p style={{ color: "var(--ink-3)", fontSize: "0.82rem" }}>Loading…</p>
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center" }}>
                  <p style={{ color: "var(--ink-3)", fontSize: "0.82rem" }}>No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--line)",
                      background: n.read ? "transparent" : "var(--surface-2)",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!n.read) e.currentTarget.style.background = "var(--surface-3)"
                    }}
                    onMouseLeave={(e) => {
                      if (!n.read) e.currentTarget.style.background = "var(--surface-2)"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: n.read ? 400 : 600,
                            color: "var(--ink)",
                            fontSize: "0.82rem",
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          {n.title}
                        </p>
                        <p
                          style={{
                            color: "var(--ink-2)",
                            fontSize: "0.78rem",
                            margin: "2px 0 0",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {n.message}
                        </p>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            color: "var(--ink-3)",
                            marginTop: 4,
                            display: "block",
                          }}
                        >
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {!n.read && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--signal)",
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
