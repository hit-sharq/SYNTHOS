"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Briefcase, ExternalLink } from "lucide-react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, ErrorState, StatusPill } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import "@/components/app/admin.css"
import "@/components/app/dashboard.css"

type Application = {
  id: string
  status: string
  createdAt: string
  job: {
    id: string
    title: string
    type: string
    location?: string
    budget?: string
    timeline?: string
    skills: string[]
    postedAt: string
    company: { name: string; verified: boolean }
  }
}

export default function TalentApplicationsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push("/sign-in"); return }
    fetch("/api/talent/applications")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data: any) => setApplications(data.applications || []))
      .catch(() => setError("Failed to load applications"))
      .finally(() => setLoading(false))
  }, [user, isLoaded, router])

  if (!isLoaded || loading) {
    return <PageWrap><div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading applications…</p></div></PageWrap>
  }

  if (error) {
    return <PageWrap><ErrorState title="Could not load applications" message={error} /></PageWrap>
  }

  const pending = applications.filter(a => a.status === "pending")
  const reviewed = applications.filter(a => a.status !== "pending")

  return (
    <PageWrap>
      <PageHead eyebrow="Talent" title="Applications" desc="Track your job applications and proposals." />
      {applications.length === 0 ? (
        <Empty title="No applications yet" hint="Browse open roles and submit your first application." />
      ) : (
        <div className="stack gap-4">
          {pending.length > 0 && (
            <section className="stack gap-2">
              <RevealOnScroll>
                <h3 className="section-title">Pending Review</h3>
              </RevealOnScroll>
              <StaggerContainer>
                {pending.map((app) => (
                  <RevealOnScroll key={app.id}>
                    <Link href={`/jobs/${app.job.id}`} className="panel-soft" style={{ padding: 16, display: "block", textDecoration: "none", color: "inherit" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: "var(--ink)" }}>{app.job.title}</span>
                        <span className={`admin-badge admin-badge-review`}>Pending</span>
                      </div>
                      <div className="row gap-2 wrap" style={{ marginTop: 6 }}>
                        <span className="tiny muted">{app.job.company.name}</span>
                        <span className="tiny muted">·</span>
                        <span className="tiny muted">{app.job.type}</span>
                        {app.job.location && <><span className="tiny muted">·</span><span className="tiny muted">{app.job.location}</span></>}
                      </div>
                    </Link>
                  </RevealOnScroll>
                ))}
              </StaggerContainer>
            </section>
          )}

          {reviewed.length > 0 && (
            <section className="stack gap-2">
              <RevealOnScroll>
                <h3 className="section-title">Reviewed</h3>
              </RevealOnScroll>
              <StaggerContainer>
                {reviewed.map((app) => (
                  <RevealOnScroll key={app.id}>
                    <div className="panel-soft" style={{ padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: "var(--ink)" }}>{app.job.title}</span>
                        <span className={`admin-badge ${app.status === "accepted" ? "admin-badge-active" : app.status === "rejected" ? "admin-badge-rejected" : "admin-badge-draft"}`}>{app.status}</span>
                      </div>
                      <div className="row gap-2 wrap" style={{ marginTop: 6 }}>
                        <span className="tiny muted">{app.job.company.name}</span>
                        <span className="tiny muted">·</span>
                        <span className="tiny muted">{app.job.type}</span>
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </StaggerContainer>
            </section>
          )}
        </div>
      )}
    </PageWrap>
  )
}
