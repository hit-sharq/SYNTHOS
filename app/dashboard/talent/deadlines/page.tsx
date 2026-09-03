"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, ExternalLink } from "lucide-react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, ErrorState, StatusPill } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import "@/components/app/admin.css"
import "@/components/app/dashboard.css"

type Deadline = {
  id: string
  projectId: string
  projectName: string
  label: string
  date: string
  status: string
}

export default function TalentDeadlinesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push("/sign-in"); return }
    fetch("/api/talent/projects")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data: any) => {
        const list: Deadline[] = []
        for (const p of data.projects || []) {
          if (p.brief?.timeline) {
            list.push({
              id: `${p.id}-brief-timeline`,
              projectId: p.id,
              projectName: p.name,
              label: "Project Timeline",
              date: p.brief.timeline,
              status: p.status,
            })
          }
          if (p.proposal?.timeline) {
            list.push({
              id: `${p.id}-proposal-timeline`,
              projectId: p.id,
              projectName: p.name,
              label: "Proposal Timeline",
              date: p.proposal.timeline,
              status: p.status,
            })
          }
        }
        setDeadlines(list)
      })
      .catch(() => setError("Failed to load deadlines"))
      .finally(() => setLoading(false))
  }, [user, isLoaded, router])

  if (!isLoaded || loading) {
    return <PageWrap><div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading deadlines…</p></div></PageWrap>
  }

  if (error) {
    return <PageWrap><ErrorState title="Could not load deadlines" message={error} /></PageWrap>
  }

  return (
    <PageWrap>
      <PageHead eyebrow="Talent" title="Deadlines" desc="Upcoming timelines and milestones from your projects." />
      {deadlines.length === 0 ? (
        <Empty title="No deadlines yet" hint="Deadlines appear here from project briefs and proposals." />
      ) : (
        <StaggerContainer>
          <div className="stack gap-2">
            {deadlines.map((d) => (
              <RevealOnScroll key={d.id}>
                <Link href={`/dashboard/projects/${d.projectId}`} className="panel-soft" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
                  <Calendar size={18} style={{ color: "var(--signal)", flexShrink: 0 }} />
                  <div className="grow">
                    <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.92rem" }}>{d.label}</span>
                    <span className="tiny muted" style={{ display: "block" }}>{d.projectName} · {d.date}</span>
                  </div>
                  <StatusPill status={d.status} />
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </StaggerContainer>
      )}
    </PageWrap>
  )
}
