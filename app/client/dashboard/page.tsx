"use client"

import { useEffect, useState } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, ExternalLink, Trash2, Calendar, FileText, CheckSquare, MessageSquare } from "lucide-react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { StatusPill, Progress, Empty, ErrorState } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import "@/components/app/admin.css"
import "@/components/app/dashboard.css"

type Project = {
  id: string
  name: string
  type: string
  stage: string
  status: string
  progress: number
  nextAction: string
  publicToken: string | null
  proposal: any
  quote: any
  brief: any
  call: any
  contactReport: any
}

type Meeting = {
  id: string
  projectId: string
  projectName: string
  date: string
  duration: string
  summary: string
  roomUrl: string | null
}

type Task = {
  id: string
  projectId: string
  projectName: string
  who: string
  task: string
  due: string
}

export default function ClientDashboardPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [clientName, setClientName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.push("/client/login")
      return
    }

    const email = user.primaryEmailAddress?.emailAddress
    if (!email) {
      router.push("/client/login")
      return
    }

    const load = async () => {
      try {
        const res = await fetch("/api/client/data")
        if (!res.ok) throw new Error("Failed to load dashboard data")
        const data = await res.json()
        setProjects(data.projects || [])
        setClientName(data.client?.name || user.fullName || null)

        const meetingList: Meeting[] = []
        const taskList: Task[] = []
        for (const p of data.projects || []) {
          if (p.call?.roomUrl) {
            meetingList.push({
              id: p.call.id,
              projectId: p.id,
              projectName: p.name,
              date: p.call.date,
              duration: p.call.duration,
              summary: p.call.summary,
              roomUrl: p.call.roomUrl,
            })
          }
          if (p.contactReport?.actionItems && Array.isArray(p.contactReport.actionItems)) {
            for (const item of p.contactReport.actionItems) {
              taskList.push({
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
        setMeetings(meetingList)
        setTasks(taskList)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user, isLoaded, router])

  if (!isLoaded || loading) {
    return (
      <PageWrap>
        <div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading your workspace…</p></div>
      </PageWrap>
    )
  }

  if (error) {
    return (
      <PageWrap>
        <ErrorState title="Could not load dashboard" message={error} />
      </PageWrap>
    )
  }

  const activeProjects = projects.filter(p => p.status !== "complete")
  const pendingApprovals = projects.filter(p => (p.proposal?.status === "review") || (p.quote?.status === "review"))

  return (
    <PageWrap>
      <PageHead
        eyebrow="Client"
        title={clientName ? `Welcome, ${clientName.split(" ")[0]}` : "Your Projects"}
        desc="Track progress, review proposals, and manage your creative projects."
        actions={
          <button onClick={() => signOut()} className="btn btn-ghost btn-sm">Log Out</button>
        }
      />

      <div className="ov-stats" style={{ marginBottom: 32 }}>
        <div className="ov-stat panel">
          <span className="eyebrow">Active Projects</span>
          <span className="ov-stat-value" style={{ color: "var(--ink)" }}>{activeProjects.length}</span>
          <span className="tiny muted">in progress</span>
        </div>
        <div className="ov-stat panel">
          <span className="eyebrow">Pending Approval</span>
          <span className="ov-stat-value" style={{ color: "var(--signal)" }}>{pendingApprovals.length}</span>
          <span className="tiny muted">awaiting review</span>
        </div>
        <div className="ov-stat panel">
          <span className="eyebrow">Upcoming Meetings</span>
          <span className="ov-stat-value" style={{ color: "var(--ink)" }}>{meetings.length}</span>
          <span className="tiny muted">scheduled</span>
        </div>
        <div className="ov-stat panel">
          <span className="eyebrow">Open Tasks</span>
          <span className="ov-stat-value" style={{ color: "var(--ink)" }}>{tasks.length}</span>
          <span className="tiny muted">action items</span>
        </div>
      </div>

      <div className="ov-grid">
        <section className="stack gap-4">
          <RevealOnScroll>
            <h3 className="section-title">Your Projects</h3>
          </RevealOnScroll>
          {projects.length === 0 ? (
            <Empty title="No projects yet" hint="Projects will appear here once our team links them to your account." />
          ) : (
            <StaggerContainer>
              <div className="stack gap-2">
                {projects.map((p) => (
                  <RevealOnScroll key={p.id}>
                    <Link href={p.publicToken ? `/public/project/${p.publicToken}` : "#"} className="ov-card" style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="row between gap-3">
                        <div className="stack gap-1 grow">
                          <span className="ov-card-title">{p.name}</span>
                          <span className="tiny muted">{p.type} · {p.stage.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}</span>
                        </div>
                        <StatusPill status={p.status} />
                      </div>
                      <div style={{ marginTop: 10 }}><Progress value={p.progress || 0} /></div>
                      <div className="row gap-2 wrap" style={{ marginTop: 10 }}>
                        {p.proposal?.sentToClient && p.proposal.publicToken && (
                          <Link href={`/public/approve/${p.proposal.publicToken}`} className="btn btn-signal btn-sm" onClick={(e) => e.stopPropagation()}>Review Proposal</Link>
                        )}
                        {p.quote?.sentToClient && p.quote.publicToken && (
                          <Link href={`/public/approve/${p.quote.publicToken}`} className="btn btn-signal btn-sm" onClick={(e) => e.stopPropagation()}>Review Quote</Link>
                        )}
                        {p.publicToken && (
                          <Link href={`/public/project/${p.publicToken}`} className="btn btn-ghost btn-sm" onClick={(e) => e.stopPropagation()}>Open Project</Link>
                        )}
                      </div>
                    </Link>
                  </RevealOnScroll>
                ))}
              </div>
            </StaggerContainer>
          )}
        </section>

        <aside className="stack gap-4">
          {meetings.length > 0 && (
            <RevealOnScroll>
              <div className="panel">
                <div className="panel-header">
                  <span className="eyebrow">Upcoming</span>
                  <h3 style={{ margin: 0 }}>Meetings</h3>
                </div>
                <div style={{ padding: 16 }} className="stack gap-2">
                  {meetings.slice(0, 5).map((m) => (
                    <Link key={m.id} href={`/public/project/${projects.find(p => p.id === m.projectId)?.publicToken || ""}`} className="ov-approve" style={{ textDecoration: "none", color: "inherit" }}>
                      <Calendar size={16} style={{ color: "var(--signal)", flexShrink: 0 }} />
                      <div className="grow">
                        <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.88rem" }}>{m.projectName}</span>
                        <span className="tiny muted" style={{ display: "block" }}>{new Date(m.date).toLocaleDateString()} · {m.duration}</span>
                      </div>
                      {m.roomUrl && <span className="tiny" style={{ color: "var(--signal)" }}>Join</span>}
                    </Link>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          )}

          {tasks.length > 0 && (
            <RevealOnScroll>
              <div className="panel">
                <div className="panel-header">
                  <span className="eyebrow">Action Items</span>
                  <h3 style={{ margin: 0 }}>Tasks</h3>
                </div>
                <div style={{ padding: 16 }} className="stack gap-2">
                  {tasks.slice(0, 8).map((t) => (
                    <div key={t.id} className="ov-row">
                      <CheckSquare size={16} style={{ color: "var(--signal)", flexShrink: 0 }} />
                      <div className="grow">
                        <span style={{ fontSize: "0.85rem", color: "var(--ink)" }}>{t.task}</span>
                        <span className="tiny muted" style={{ display: "block" }}>{t.projectName} · {t.who} · Due: {t.due}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          )}

          <RevealOnScroll>
            <div className="panel">
              <div className="panel-header">
                <span className="eyebrow">Quick Actions</span>
                <h3 style={{ margin: 0 }}>Stay connected</h3>
              </div>
              <div style={{ padding: 16 }} className="stack gap-2">
                <Link href="/client/dashboard/meetings" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                  <Calendar size={16} /> View Meetings
                </Link>
                <Link href="/client/dashboard/tasks" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                  <CheckSquare size={16} /> View Tasks
                </Link>
                <Link href="/client/dashboard/briefs" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                  <FileText size={16} /> View Briefs
                </Link>
                <Link href="/client/dashboard/messages" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                  <MessageSquare size={16} /> Messages
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </aside>
      </div>
    </PageWrap>
  )
}
