"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckSquare, Calendar, Flag, ExternalLink } from "lucide-react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import { Skeleton, CardSkeleton } from "@/components/app/Skeleton"
import { ErrorBoundary } from "@/components/app/ErrorBoundary"
import "@/components/app/admin.css"
import "@/components/app/dashboard.css"

type Task = {
  id: string
  projectId: string
  projectName: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "in_review" | "complete"
  priority?: string
  dueDate: string | null
  createdAt: string
}

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do", color: "draft" },
  { value: "in_progress", label: "In Progress", color: "review" },
  { value: "in_review", label: "In Review", color: "signal" },
  { value: "complete", label: "Complete", color: "active" },
]

const PRIORITY_COLORS = { low: "var(--ink-3)", medium: "var(--signal)", high: "var(--rejected)" }

function TaskList({ refreshKey, onUpdate }: { refreshKey: number; onUpdate: () => void }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!isLoaded) return
    if (!user) { router.push("/sign-in"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/talent/tasks")
      if (!res.ok) throw new Error("Failed to load tasks")
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (e) {
      setError("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [isLoaded, user, refreshKey])

  const updateStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      const updated = await res.json()
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: updated.status, completedAt: updated.completedAt } : t))
      onUpdate()
    } catch {
      alert("Failed to update task status")
    }
  }

  if (!isLoaded || loading) {
    return <CardSkeleton count={5} />
  }

  if (error) {
    return <ErrorState title="Could not load tasks" message={error} onRetry={load} />
  }

  if (tasks.length === 0) {
    return <Empty title="No tasks assigned yet" hint="Tasks will appear here when they are assigned to you from contact reports." />
  }

  const grouped = {
    todo: tasks.filter(t => t.status === "todo"),
    in_progress: tasks.filter(t => t.status === "in_progress"),
    in_review: tasks.filter(t => t.status === "in_review"),
    complete: tasks.filter(t => t.status === "complete"),
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {(["todo", "in_progress", "in_review", "complete"] as const).map((statusKey) => {
        const group = grouped[statusKey]
        if (group.length === 0) return null
        return (
          <div key={statusKey}>
            <h3 className="section-title" style={{ fontSize: "0.85rem" }}>
              {STATUS_OPTIONS.find(s => s.value === statusKey)?.label || statusKey}
            </h3>
            <StaggerContainer>
              {group.map((t) => (
                <RevealOnScroll key={t.id}>
                  <div
                    key={t.id}
                    className="panel-soft"
                    style={{ padding: 16, marginBottom: 8 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                      <div className="grow">
                        <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.92rem" }}>{t.title}</span>
                        {t.description && <p style={{ color: "var(--ink-2)", fontSize: "0.82rem", marginTop: 4, lineHeight: 1.5 }}>{t.description}</p>}
                      </div>
                      <select
                        className="admin-input"
                        value={t.status}
                        onChange={(e) => updateStatus(t.id, e.target.value)}
                        style={{ minWidth: 140 }}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="row gap-2 wrap" style={{ marginTop: 8 }}>
                      <span className="tiny muted">{t.projectName}</span>
                      {t.priority && (
                        <>
                          <span className="tiny muted">·</span>
                          <Flag size={12} style={{ color: PRIORITY_COLORS[t.priority as keyof typeof PRIORITY_COLORS] || "var(--ink-3)" }} />
                          <span className="tiny muted" style={{ textTransform: "capitalize" }}>{t.priority}</span>
                        </>
                      )}
                      {t.dueDate && (
                        <>
                          <span className="tiny muted">·</span>
                          <Calendar size={12} />
                          <span className="tiny muted">{new Date(t.dueDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </StaggerContainer>
          </div>
        )
      })}
    </div>
  )
}

export default function TalentTasksPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <ErrorBoundary>
      <PageWrap>
        <PageHead eyebrow="Talent" title="Tasks" desc="Your assigned tasks with status tracking." />
        <TaskList refreshKey={refreshKey} onUpdate={() => setRefreshKey(k => k + 1)} />
      </PageWrap>
    </ErrorBoundary>
  )
}