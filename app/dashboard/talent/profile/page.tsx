"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"
import { RevealOnScroll } from "@/components/app/useReveal"
import { Upload, Trash2, ExternalLink } from "lucide-react"
import "@/components/app/admin.css"
import "@/components/app/dashboard.css"

type TalentProfile = {
  id: string
  userId: string
  name: string
  email: string
  skills: string[]
  experience: number
  rating: number
  availability: string
  rate: string
  portfolio: string | null
  notes: string
}

export default function TalentProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState<TalentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "", email: "", skills: "", experience: 0, rating: 0,
    availability: "available", rate: "", portfolio: "", notes: "",
  })
  const [uploading, setUploading] = useState(false)
  const fileRef = useState<HTMLInputElement | null>(null)[0]
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push("/sign-in"); return }
    fetch("/api/talent/me")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data: TalentProfile) => {
        setProfile(data)
        setForm({
          name: data.name, email: data.email,
          skills: data.skills?.join(", ") || "",
          experience: data.experience, rating: data.rating,
          availability: data.availability, rate: data.rate || "",
          portfolio: data.portfolio || "", notes: data.notes || "",
        })
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [user, isLoaded, router])

  const save = async () => {
    if (!form.name || !form.email) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/talent/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
          experience: Number(form.experience) || 0,
          rating: Number(form.rating) || 0,
        }),
      })
      if (!res.ok) throw new Error("Failed to save profile")
      const data = await res.json()
      setProfile(data)
      setForm({
        name: data.name, email: data.email,
        skills: data.skills?.join(", ") || "",
        experience: data.experience, rating: data.rating,
        availability: data.availability, rate: data.rate || "",
        portfolio: data.portfolio || "", notes: data.notes || "",
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const uploadPortfolio = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", "synthos/portfolio")
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) setForm(f => ({ ...f, portfolio: data.url }))
      else alert(data.error || "Upload failed")
    } catch {
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  if (!isLoaded || loading) {
    return <PageWrap><div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading profile…</p></div></PageWrap>
  }

  if (error) {
    return <PageWrap><ErrorState title="Could not load profile" message={error} onRetry={() => window.location.reload()} /></PageWrap>
  }

  return (
    <PageWrap>
      <PageHead
        eyebrow="Talent"
        title={profile ? `${profile.name}'s Profile` : "My Profile"}
        desc="Manage your profile, portfolio, and availability."
        actions={<button className="btn btn-ghost btn-sm" onClick={() => router.push("/dashboard/talent")}>← Back</button>}
      />

      <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3 className="admin-section-title" style={{ marginTop: 0 }}>Profile Information</h3>
        <div className="form-grid-2">
          <div className="field">
            <label>Full Name</label>
            <input className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="admin-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>

        <div className="field">
          <label>Skills (comma-separated)</label>
          <input className="admin-input" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="copywriting, strategy, design" />
        </div>

        <div className="form-grid-2">
          <div className="field">
            <label>Experience (years)</label>
            <input className="admin-input" type="number" min="0" value={form.experience} onChange={e => setForm({ ...form, experience: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Rating</label>
            <input className="admin-input" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="field">
            <label>Availability</label>
            <select className="admin-input" value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div className="field">
            <label>Hourly Rate</label>
            <input className="admin-input" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="e.g. $50/hr" />
          </div>
        </div>

        <div className="field">
          <label>Portfolio Links (one per line)</label>
          <textarea
            className="admin-input"
            value={form.portfolio}
            onChange={e => setForm({ ...form, portfolio: e.target.value })}
            placeholder="https://myportfolio.com/project-1&#10;https://dribbble.com/shots/123"
            rows={4}
          />
          <p className="tiny muted" style={{ marginTop: 4 }}>Or upload a portfolio image:</p>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <input type="file" accept="image/*" ref={setFileInput} style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadPortfolio(e.target.files[0])} />
            <button className="admin-btn" onClick={() => fileInput?.click()} disabled={uploading}>
              <Upload size={16} /> {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        <div className="field">
          <label>Notes</label>
          <textarea className="admin-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={4} placeholder="Any notes about your availability or preferences..." />
        </div>

        <button className="admin-btn-primary" onClick={save} disabled={saving || !form.name || !form.email}>
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>

      {profile?.portfolio && (
        <div className="panel" style={{ padding: 24 }}>
          <h3 className="admin-section-title" style={{ marginTop: 0 }}>Portfolio Preview</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href={profile.portfolio} target="_blank" rel="noreferrer" className="btn btn-signal">
              <ExternalLink size={16} /> View Portfolio
            </a>
          </div>
        </div>
      )}
    </PageWrap>
  )
}
