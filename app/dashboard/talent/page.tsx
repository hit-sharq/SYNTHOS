"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Briefcase, ExternalLink, MessageSquare, Plus, TrendingUp, User } from "lucide-react"
import { PageHead } from "@/components/app/Page"
import { StatusPill, Empty, ErrorState } from "@/components/app/ui"
import { VoiceInput } from "@/components/app/VoiceInput"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"

type TalentProfile = {
  id: string
  userId?: string
  name: string
  email: string
  skills: string[]
  experience: number
  rating: number
  availability: string
  rate: string
  portfolio?: string
  notes?: string
}

type Project = {
  id: string
  name: string
  client: string
  stage: string
  progress: number
  status: string
  nextAction: string
}

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

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available", color: "var(--human)" },
  { value: "busy", label: "Busy", color: "var(--signal)" },
  { value: "unavailable", label: "Unavailable", color: "var(--rejected)" },
]

export default function TalentDashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState<TalentProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({ skills: "", rate: "", portfolio: "", notes: "", availability: "available" })

  const email = user?.primaryEmailAddress?.emailAddress || ""

  useEffect(() => {
    if (!isLoaded) return
    if (!email) { setLoading(false); return }
    Promise.all([loadProfile(), loadProjects(), loadApplications()])
  }, [isLoaded, email])

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/talent/me")
      if (res.status === 404) { router.push("/talents/profile"); return }
      if (!res.ok) throw new Error("Failed to load profile")
      const data = await res.json()
      setProfile(data)
      setEditForm({ skills: data.skills?.join(", ") || "", rate: data.rate || "", portfolio: data.portfolio || "", notes: data.notes || "", availability: data.availability })
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong") }
  }

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/talent/projects")
      if (res.ok) { const data = await res.json(); setProjects(data.projects || []) }
    } catch (e) { console.error("Failed to load projects:", e) } finally { setLoading(false) }
  }

  const loadApplications = async () => {
    try {
      const res = await fetch("/api/talent/applications")
      if (res.ok) { const data = await res.json(); setApplications(data.applications || []) }
    } catch (e) { console.error("Failed to load applications:", e) }
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch("/api/talent/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: editForm.skills.split(",").map(s => s.trim()).filter(Boolean),
          experience: profile.experience,
          rating: profile.rating,
          availability: editForm.availability,
          rate: editForm.rate,
          portfolio: editForm.portfolio,
          notes: editForm.notes,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update profile")
      }
      const updated = await res.json()
      setProfile(updated)
      setSuccess("Profile updated successfully.")
      setEditingProfile(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded || loading) {
    return <div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading your workspace…</p></div>
  }

  if (!email) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p className="muted" style={{ marginBottom: 16 }}>You need to sign in to access your dashboard.</p>
        <Link href="/sign-in" className="btn btn-signal">Sign In</Link>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p className="muted" style={{ marginBottom: 16 }}>Setting up your dashboard…</p>
      </div>
    )
  }

  const activeProjects = projects.filter(p => p.status !== "completed")
  const pendingApps = applications.filter(a => a.status === "pending")
  const reviewedApps = applications.filter(a => a.status !== "pending")
  const initials = profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="stack gap-4">
      <PageHead
        eyebrow="Creator"
        title={`Welcome, ${profile.name.split(" ")[0]}`}
        desc="Your creative workspace. Manage your profile, track projects, and find new opportunities."
        actions={
          <div className="row gap-2 wrap">
            <Link href="/jobs" className="btn btn-ghost"><Briefcase size={16} /> Browse Jobs</Link>
            <Link href="/dashboard/projects" className="btn btn-signal"><Plus size={16} /> New Project</Link>
          </div>
        }
      />

      {error && <ErrorState title={error} />}
      {success && <div className="panel" style={{ padding: "12px 16px", background: "var(--approved-soft)", border: "1px solid var(--approved)", color: "var(--approved)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{success}</div>}

      <RevealOnScroll>
        <div className="ov-stats">
          <div className="ov-stat panel">
            <span className="eyebrow">Availability</span>
            <span className="ov-stat-value" style={{ color: "var(--human)" }}>{profile.availability}</span>
            <span className="tiny muted">status</span>
          </div>
          <div className="ov-stat panel">
            <span className="eyebrow">Active Projects</span>
            <span className="ov-stat-value" style={{ color: "var(--ink)" }}>{activeProjects.length}</span>
            <span className="tiny muted">assigned to you</span>
          </div>
          <div className="ov-stat panel">
            <span className="eyebrow">Applications</span>
            <span className="ov-stat-value" style={{ color: "var(--signal)" }}>{pendingApps.length}</span>
            <span className="tiny muted">{reviewedApps.length} reviewed</span>
          </div>
          <div className="ov-stat panel">
            <span className="eyebrow">Experience</span>
            <span className="ov-stat-value" style={{ color: "var(--ink)" }}>{profile.experience}y</span>
            <span className="tiny muted">{profile.rating.toFixed(1)} rating</span>
          </div>
        </div>
      </RevealOnScroll>

      <div className="ov-grid">
        <section className="stack gap-4">
          <RevealOnScroll>
            <div className="panel-soft" style={{ padding: 24 }}>
              <div className="row between gap-2" style={{ marginBottom: 16 }}>
                <div className="row gap-3" style={{ alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--ai-soft)", border: "2px solid var(--ai)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem", color: "var(--ai)", flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{profile.name}</h3>
                    <p className="tiny muted" style={{ margin: 0 }}>{profile.email}</p>
                  </div>
                </div>
                {!editingProfile && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingProfile(true)}>Edit</button>
                )}
              </div>

              {editingProfile ? (
                <div className="stack gap-3">
                  <div className="form-grid-2">
                    <div className="field">
                      <label>Availability</label>
                      <select className="select" value={editForm.availability} onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}>
                        {AVAILABILITY_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Rate</label>
                      <input className="input" value={editForm.rate} onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })} placeholder="$500/day" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Portfolio URL</label>
                    <input className="input" value={editForm.portfolio} onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="field">
                    <label>Skills (comma-separated)</label>
                    <input className="input" value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} placeholder="Strategy, Design, Production" />
                  </div>
                  <div className="field">
                    <label>Notes</label>
                    <VoiceInput value={editForm.notes} onChange={(val) => setEditForm({ ...editForm, notes: val })} rows={3} />
                  </div>
                  <div className="row gap-2">
                    <button className="btn btn-signal btn-sm" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingProfile(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="stack gap-3">
                  <div className="row gap-2 wrap">
                    <span className={`admin-badge ${profile.availability === "available" ? "admin-badge-active" : profile.availability === "busy" ? "admin-badge-review" : "admin-badge-draft"}`}>{profile.availability}</span>
                    <span className="chip">{profile.experience}y experience</span>
                    <span className="chip" style={{ color: "var(--signal-ink)", background: "var(--signal-soft)" }}>{profile.rating.toFixed(1)} rating</span>
                  </div>
                  {profile.skills.length > 0 && (
                    <div className="row gap-2 wrap">
                      {profile.skills.map(skill => <span key={skill} className="chip" style={{ color: "var(--ai-ink)", background: "var(--ai-soft)" }}>{skill}</span>)}
                    </div>
                  )}
                  {profile.rate && <p className="tiny"><span className="eyebrow">Rate</span> <span style={{ color: "var(--ink)", fontWeight: 600 }}>{profile.rate}</span></p>}
                  {profile.notes && <p className="tiny muted" style={{ marginTop: 4 }}>{profile.notes}</p>}
                </div>
              )}
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="panel-soft" style={{ padding: 24 }}>
              <div className="row between gap-2" style={{ marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Recent Applications</h3>
                <Link href="/jobs" className="btn btn-ghost btn-sm">Browse Jobs</Link>
              </div>
              {applications.length === 0 ? (
                <Empty title="No applications yet" hint="Browse open roles and submit your first application." />
              ) : (
                <StaggerContainer>
                  <div className="stack gap-2">
                    {applications.slice(0, 8).map(app => (
                      <RevealOnScroll key={app.id}>
                        <div className="panel-soft" style={{ padding: 16, borderLeft: `3px solid ${app.status === "pending" ? "var(--signal)" : app.status === "accepted" ? "var(--human)" : app.status === "rejected" ? "var(--rejected)" : "var(--line-strong)"}` }}>
                          <div className="row between gap-2" style={{ marginBottom: 6 }}>
                            <span style={{ fontWeight: 600, color: "var(--ink)" }}>{app.job.title}</span>
                            <span className={`admin-badge ${app.status === "pending" ? "admin-badge-review" : app.status === "accepted" ? "admin-badge-active" : app.status === "rejected" ? "admin-badge-rejected" : "admin-badge-draft"}`}>{app.status}</span>
                          </div>
                          <div className="row gap-2 wrap">
                            <span className="tiny muted">{app.job.company.name}</span>
                            <span className="tiny muted">·</span>
                            <span className="tiny muted">{app.job.type}</span>
                            {app.job.location && <><span className="tiny muted">·</span><span className="tiny muted">{app.job.location}</span></>}
                          </div>
                          {app.job.skills?.length > 0 && (
                            <div className="row gap-2 wrap" style={{ marginTop: 8 }}>
                              {app.job.skills.slice(0, 4).map(s => <span key={s} className="chip" style={{ fontSize: "0.72rem" }}>{s}</span>)}
                            </div>
                          )}
                          <p className="tiny muted" style={{ marginTop: 8 }}>Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </RevealOnScroll>
                    ))}
                  </div>
                </StaggerContainer>
              )}
            </div>
          </RevealOnScroll>
        </section>

        <aside className="stack gap-4">
          <RevealOnScroll>
            <div className="panel">
              <div className="panel-header">
                <span className="eyebrow">Quick Actions</span>
                <h3 style={{ margin: 0 }}>Move forward</h3>
              </div>
              <div className="stack gap-2" style={{ padding: 16 }}>
                <Link href="/jobs" className="btn btn-signal" style={{ justifyContent: "center" }}>
                  <Briefcase size={16} /> Browse Open Roles
                </Link>
                <Link href="/dashboard/projects" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                  <ExternalLink size={16} /> Open Workspace
                </Link>
                <Link href="/dashboard/messages" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                  <MessageSquare size={16} /> Messages
                </Link>
                <Link href="/talents/profile" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                  <User size={16} /> Full Profile
                </Link>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="panel">
              <div className="panel-header">
                <span className="eyebrow">Your Profile</span>
                <h3 style={{ margin: 0 }}>Visibility</h3>
              </div>
              <div style={{ padding: 16 }} className="stack gap-3">
                <div className="row between gap-2">
                  <span className="tiny">Availability</span>
                  <span className={`admin-badge ${profile.availability === "available" ? "admin-badge-active" : profile.availability === "busy" ? "admin-badge-review" : "admin-badge-draft"}`}>{profile.availability}</span>
                </div>
                <div className="row between gap-2">
                  <span className="tiny">Profile views</span>
                  <span className="mono tiny" style={{ color: "var(--ink)", fontWeight: 600 }}>—</span>
                </div>
                <div className="row between gap-2">
                  <span className="tiny">Applications sent</span>
                  <span className="mono tiny" style={{ color: "var(--ink)", fontWeight: 600 }}>{applications.length}</span>
                </div>
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, marginTop: 4 }}>
                  <p className="tiny muted">Keep your profile up to date to attract the best opportunities.</p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="panel">
              <div className="panel-header">
                <span className="eyebrow">Principle</span>
                <h3 style={{ margin: 0 }}>Human + AI</h3>
              </div>
              <div style={{ padding: 16 }} className="stack gap-3">
                <div><span className="tag-ai"><span className="dot dot-ai" /> AI assists</span><p className="tiny muted" style={{ marginTop: 6 }}>Matches you with projects based on skills and availability.</p></div>
                <div style={{ margin: "2px 0" }} className="hai-div" />
                <div><span className="tag-human"><span className="dot dot-human" /> You decide</span><p className="tiny muted" style={{ marginTop: 6 }}>Apply to roles that fit your goals and rate.</p></div>
              </div>
            </div>
          </RevealOnScroll>
        </aside>
      </div>

      {activeProjects.length > 0 && (
        <RevealOnScroll>
          <div className="panel-soft" style={{ padding: 24 }}>
            <div className="row between gap-2" style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Your Projects</h3>
              <Link href="/dashboard/projects" className="btn btn-ghost btn-sm">Open workspace</Link>
            </div>
            <StaggerContainer>
              <div className="stack gap-2">
                {activeProjects.slice(0, 10).map(p => (
                  <RevealOnScroll key={p.id}>
                    <Link href={`/dashboard/projects/${p.id}`} className="ov-card">
                      <div className="row between gap-3">
                        <div className="stack gap-1">
                          <span className="ov-card-title">{p.name}</span>
                          <span className="tiny muted">{p.client}</span>
                        </div>
                        <StatusPill status={p.status} />
                      </div>
                      <p className="tiny muted" style={{ marginTop: 10 }}>Next: {p.nextAction}</p>
                    </Link>
                  </RevealOnScroll>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </RevealOnScroll>
      )}
    </div>
  )
}
