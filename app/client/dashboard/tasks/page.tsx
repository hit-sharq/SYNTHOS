"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckSquare, ExternalLink } from "lucide-react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import "@/components/app/admin.css"

type Task = {
  id: string
  projectId: string
  projectName: string
  who: string
  task: string
  due: string
}

export default function ClientTasksPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push("/client/login"); return }
    fetch("/api/client/data")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data: any) => {
        const list: Task[] = []
        for (const p of data.projects || []) {
          if (p.contactReport?.actionItems && Array.isArray(p.contactReport.actionItems)) {
            for (const item of p.contactReport.actionItems) {
              list.push({
                id: `${p.id}-${item.who}-${item.task}`,
                projectId: p.id,
                projectName: p.name,
                who: item.who || "Unassigned",
                task: item.task,
                due: item.due || "TBD",
              })
            }
          }
        }
        setTasks(list)
      })
      .catch(() => setError("Failed to load tasks"))
      .finally(() => setLoading(false))
  }, [user, isLoaded, router])

  if (!isLoaded || loading) {
    return <PageWrap><div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading tasks…</p></div></PageWrap>
  }

  if (error) {
    return <PageWrap><ErrorState title="Could not load tasks" message={error} /></PageWrap>
  }

  return (
    <PageWrap>
      <PageHead eyebrow="Client" title="Tasks" desc="Action items from your project contact reports." />
      {tasks.length === 0 ? (
        <Empty title="No tasks yet" hint="Tasks are generated from contact reports after meetings." />
      ) : (
        <StaggerContainer>
          <div className="stack gap-2">
            {tasks.map((t) => (
              <RevealOnScroll key={t.id}>
                <Link href={`/public/project/${t.projectId}`} className="panel-soft" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
                  <CheckSquare size={18} style={{ color: "var(--signal)", flexShrink: 0 }} />
                  <div className="grow">
                    <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.92rem" }}>{t.task}</span>
                    <span className="tiny muted" style={{ display: "block" }}>{t.projectName} · {t.who} · Due: {t.due}</span>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </StaggerContainer>
      )}
    </PageWrap>
  )
}
