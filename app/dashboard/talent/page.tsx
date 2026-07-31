"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserPlus } from "lucide-react"
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

const AVAILABILITY = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "unavailable", label: "Unavailable" },
]

export default function TalentDashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState<TalentProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const email = user?.primaryEmailAddress?.emailAddress || ""

  useEffect(() => {
    if (!isLoaded) return
    if (!email) {
      setLoading(false)
      return
    }

    Promise.all([loadProfile(), loadProjects()])
  }, [isLoaded, email])

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/talent/me")
      if (res.status === 404) {
        router.push("/talents/profile")
        return
      }
      if (!res.ok) throw new Error("Failed to load profile")
      const data = await res.json()
      setProfile(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/talent/projects")
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects || [])
      }
    } catch (e) {
      console.error("Failed to load projects:", e)
    } finally {
      setLoading(false)
    }
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
          skills: profile.skills,
          experience: profile.experience,
          rating: profile.rating,
          availability: profile.availability,
          rate: profile.rate,
          portfolio: profile.portfolio,
          notes: profile.notes,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update profile")
      }
      setSuccess("Profile updated successfully.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p className="muted tiny">Loading...</p>
      </div>
    )
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
        <p className="muted" style={{ marginBottom: 16 }}>Setting up your dashboard...</p>
      </div>
    )
  }

  const activeProjects = projects.filter((p) => p.status !== "completed")
  const myProjects = activeProjects.length

  return (
    <div className="stack gap-4">
      <PageHead eyebrow="Creator" title={`Welcome, ${profile.name.split(" ")[0]}`} desc="Your talent dashboard. Update your profile and track your projects." />

      {error && (
        <div style={{ padding: "12px 16px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)", color: "var(--rejected)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: "12px 16px", background: "var(--active-soft)", border: "1px solid var(--active)", color: "var(--active)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
          {success}
        </div>
      )}

      <RevealOnScroll>
        <div className="ov-stats">
          <div className="ov-stat panel">
            <span className="eyebrow">Profile</span>
            <span className="ov-stat-value" style={{ color: "var(--signal)" }}>{profile.availability}</span>
            <span className="tiny muted">availability</span>
          </div>
          <div className="ov-stat panel">
            <span className="eyebrow">Active projects</span>
            <span className="ov-stat-value" style={{ color: "var(--ink)" }}>{myProjects}</span>
            <span className="tiny muted">assigned to you</span>
          </div>
          <div className="ov-stat panel">
            <span className="eyebrow">Experience</span>
            <span className="ov-stat-value" style={{ color: "var(--ink)" }}>{profile.experience}y</span>
            <span className="tiny muted">{profile.rating.toFixed(1)} rating</span>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll>
        <div className="panel-soft" style={{ padding: 24 }}>
          <div className="row between gap-2" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Quick profile edit</h3>
            <button className="btn btn-signal btn-sm" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
          <div className="form-grid-2">
            <div className="field">
              <label>Availability</label>
              <select className="select" value={profile.availability} onChange={(e) => setProfile({ ...profile, availability: e.target.value })}>
                {AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Rate</label>
              <input className="input" value={profile.rate} onChange={(e) => setProfile({ ...profile, rate: e.target.value })} placeholder="$500/day" />
            </div>
            <div className="field">
              <label>Portfolio URL</label>
              <input className="input" value={profile.portfolio || ""} onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Notes</label>
            <VoiceInput value={profile.notes || ""} onChange={(val) => setProfile({ ...profile, notes: val })} rows={3} />
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll>
        <div className="panel-soft" style={{ padding: 24 }}>
          <div className="row between gap-2" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Your projects</h3>
            <Link href="/dashboard/overview" className="btn btn-ghost btn-sm">Open workspace</Link>
          </div>
          {myProjects === 0 ? (
            <Empty title="No active projects" hint="You don&apos;t have any active projects yet." />
          ) : (
            <StaggerContainer>
              <div className="stack gap-2">
                {activeProjects.slice(0, 10).map((p) => (
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
          )}
        </div>
      </RevealOnScroll>
    </div>
  )
}
