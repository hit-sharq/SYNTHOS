"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { PageHead, PageWrap } from "@/components/app/Page"
import { StatusPill, Empty, ErrorState } from "@/components/app/ui"
import { VoiceInput } from "@/components/app/VoiceInput"

type TalentProfile = {
  id: string
  userId?: string
  name: string
  email: string
  position: string
  skills: string[]
  experience: number
  rating: number
  availability: string
  rate: string
  portfolio?: string
  notes?: string
}

const POSITIONS = [
  { value: "creative", label: "Creative" },
  { value: "strategist", label: "Strategist" },
  { value: "producer", label: "Producer" },
  { value: "designer", label: "Designer" },
  { value: "developer", label: "Developer" },
  { value: "animator", label: "Animator" },
]

const AVAILABILITY = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "unavailable", label: "Unavailable" },
]

export default function TalentProfilePage() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<TalentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const email = user?.primaryEmailAddress?.emailAddress || ""

  useEffect(() => {
    if (!isLoaded) return
    if (!email) {
      setLoading(false)
      return
    }

    loadProfile()
  }, [isLoaded, email])

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/talent/me")
      if (!res.ok) {
        if (res.status === 404) {
          setProfile(null)
          return
        }
        throw new Error("Failed to load profile")
      }
      const data = await res.json()
      setProfile(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    setError(null)
    try {
      const name = user?.fullName || user?.firstName || email.split("@")[0]
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

      const userRes = await fetch("/api/talent/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user?.id,
          email,
          name,
          initials: initials || "TL",
        }),
      })

      if (!userRes.ok) {
        const data = await userRes.json().catch(() => ({}))
        throw new Error(data.error || "Failed to create talent profile")
      }

      await loadProfile()
      setSuccess("Profile created. Update your details below.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setCreating(false)
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
          position: profile.position,
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

  if (!isLoaded) {
    return (
      <PageWrap>
        <PageHead eyebrow="Profile" title="Talent Profile" desc="Loading..." />
        <div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading...</p></div>
      </PageWrap>
    )
  }

  if (!email) {
    return (
      <PageWrap>
        <PageHead eyebrow="Profile" title="Talent Profile" desc="Please sign in to manage your profile." />
        <div style={{ padding: 40, textAlign: "center" }}>
          <p className="muted" style={{ marginBottom: 16 }}>You need to sign in to access your talent profile.</p>
          <a href="/sign-in?redirect=/talents/profile" className="btn btn-signal">Sign In</a>
        </div>
      </PageWrap>
    )
  }

  if (loading) {
    return (
      <PageWrap>
        <PageHead eyebrow="Profile" title="Talent Profile" desc="Loading your profile..." />
        <div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading profile...</p></div>
      </PageWrap>
    )
  }

  if (!profile) {
    return (
      <PageWrap>
        <PageHead eyebrow="Profile" title="Talent Profile" desc="Create your talent profile to join the Synthos creator network." />
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {error && (
            <div style={{ padding: "12px 16px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)", color: "var(--rejected)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 20 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: "12px 16px", background: "var(--active-soft)", border: "1px solid var(--active)", color: "var(--active)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 20 }}>
              {success}
            </div>
          )}
          <div className="panel-soft" style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Welcome to Synthos</h3>
            <p style={{ color: "var(--ink-2)", marginBottom: 20 }}>
              You&apos;re signed in as <strong>{email}</strong>. Create your talent profile to start collaborating on projects.
            </p>
            <button className="btn btn-signal" onClick={handleCreate} disabled={creating}>
              {creating ? "Creating profile..." : "Create Talent Profile"}
            </button>
          </div>
        </div>
      </PageWrap>
    )
  }

  return (
    <PageWrap>
      <PageHead eyebrow="Profile" title="Talent Profile" desc="Update your creator profile so clients and producers can find you." />
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {error && (
          <div style={{ padding: "12px 16px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)", color: "var(--rejected)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 20 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: "12px 16px", background: "var(--active-soft)", border: "1px solid var(--active)", color: "var(--active)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 20 }}>
            {success}
          </div>
        )}

        <div className="panel-soft" style={{ padding: 24, marginBottom: 20 }}>
          <div className="form-grid">
            <div className="field">
              <label>Full Name</label>
              <input className="admin-input" value={user?.fullName || profile.name} disabled />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="admin-input" value={email} disabled />
            </div>
          </div>
        </div>

        <div className="panel-soft" style={{ padding: 24, marginBottom: 20 }}>
          <div className="form-grid">
            <div className="field">
              <label>Position <span style={{ color: "var(--signal)" }}>*</span></label>
              <select className="admin-input" value={profile.position} onChange={(e) => setProfile({ ...profile, position: e.target.value })}>
                {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Availability</label>
              <select className="admin-input" value={profile.availability} onChange={(e) => setProfile({ ...profile, availability: e.target.value })}>
                {AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: 16 }}>
            <div className="field">
              <label>Skills (comma-separated)</label>
              <input className="admin-input" value={profile.skills.join(", ")} onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="copywriting, strategy, design, film" />
            </div>
            <div className="field">
              <label>Rate</label>
              <input className="admin-input" value={profile.rate} onChange={(e) => setProfile({ ...profile, rate: e.target.value })} placeholder="$500/day" />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: 16 }}>
            <div className="field">
              <label>Experience (years)</label>
              <input className="admin-input" type="number" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="field">
              <label>Rating (0-5)</label>
              <input className="admin-input" type="number" step="0.1" min="0" max="5" value={profile.rating} onChange={(e) => setProfile({ ...profile, rating: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>Portfolio URL</label>
            <input className="admin-input" value={profile.portfolio || ""} onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })} placeholder="https://..." />
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>Notes</label>
            <VoiceInput value={profile.notes || ""} onChange={(val) => setProfile({ ...profile, notes: val })} rows={3} />
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button className="btn btn-signal" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            <a href="/dashboard/overview" className="btn btn-ghost">Go to Dashboard</a>
          </div>
        </div>
      </div>
    </PageWrap>
  )
}
