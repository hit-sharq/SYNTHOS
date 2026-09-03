"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, ExternalLink } from "lucide-react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import "@/components/app/admin.css"

type Meeting = {
  id: string
  projectId: string
  projectName: string
  date: string
  duration: string
  summary: string
  roomUrl: string | null
}

export default function ClientMeetingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push("/client/login"); return }
    fetch("/api/client/data")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data: any) => {
        const list: Meeting[] = []
        for (const p of data.projects || []) {
          if (p.call?.roomUrl) {
            list.push({
              id: p.call.id,
              projectId: p.id,
              projectName: p.name,
              date: p.call.date,
              duration: p.call.duration,
              summary: p.call.summary,
              roomUrl: p.call.roomUrl,
            })
          }
        }
        setMeetings(list)
      })
      .catch(() => setError("Failed to load meetings"))
      .finally(() => setLoading(false))
  }, [user, isLoaded, router])

  if (!isLoaded || loading) {
    return <PageWrap><div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading meetings…</p></div></PageWrap>
  }

  if (error) {
    return <PageWrap><ErrorState title="Could not load meetings" message={error} /></PageWrap>
  }

  return (
    <PageWrap>
      <PageHead eyebrow="Client" title="Meetings" desc="Your scheduled meetings and call links." />
      {meetings.length === 0 ? (
        <Empty title="No meetings scheduled" hint="Meetings will appear here once your project has a discovery call scheduled." />
      ) : (
        <StaggerContainer>
          <div className="stack gap-2">
            {meetings.map((m) => (
              <RevealOnScroll key={m.id}>
                <div className="panel-soft" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div className="grow">
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{m.projectName}</span>
                    <p className="tiny muted" style={{ marginTop: 4 }}>{new Date(m.date).toLocaleDateString()} · {m.duration} · {m.summary?.slice(0, 100) || ""}</p>
                  </div>
                  {m.roomUrl && (
                    <a href={m.roomUrl} target="_blank" rel="noreferrer" className="btn btn-signal btn-sm">Join Meeting</a>
                  )}
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </StaggerContainer>
      )}
    </PageWrap>
  )
}
