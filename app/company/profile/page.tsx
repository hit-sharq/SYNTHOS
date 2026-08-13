"use client"

import { useState, useEffect } from "react"
import { CompanyShell } from "@/components/app/CompanyShell"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty } from "@/components/app/ui"
import { RevealOnScroll } from "@/components/app/useReveal"
import "@/components/app/admin.css"

type CompanyProfile = {
  id: string
  name: string
  email: string
  phone: string
  website: string
  industry: string
  location: string
  description: string
  logo: string
  verified: boolean
  status: string
}

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: "", phone: "", website: "", industry: "", location: "", description: "", logo: "",
  })

  useEffect(() => {
    fetch("/api/company/profile")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setProfile(data)
        setForm({ name: data.name, phone: data.phone || "", website: data.website || "", industry: data.industry || "", location: data.location || "", description: data.description || "", logo: data.logo || "" })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch("/api/company/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update profile")
      }
      const updated = await res.json()
      setProfile(updated)
      setSuccess("Profile updated successfully.")
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <CompanyShell>
        <div className="company-content">
          <PageHead eyebrow="Company" title="Profile" />
          <p className="muted tiny">Loading...</p>
        </div>
      </CompanyShell>
    )
  }

  if (!profile) {
    return (
      <CompanyShell>
        <div className="company-content">
          <PageHead eyebrow="Company" title="Profile" />
          <div className="panel" style={{ padding: 40, textAlign: "center" }}>
            <Empty title="Profile not found" hint="You need to be linked to a company." />
          </div>
        </div>
      </CompanyShell>
    )
  }

  return (
    <CompanyShell>
      <div className="company-content">
        <PageHead
          eyebrow="Company"
          title="Company Profile"
          desc="Manage your company information and public presence."
        />

        {error && <div className="panel" style={{ padding: "12px 16px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)", color: "var(--rejected)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{error}</div>}
        {success && <div className="panel" style={{ padding: "12px 16px", background: "var(--approved-soft)", border: "1px solid var(--approved)", color: "var(--approved)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{success}</div>}

        <RevealOnScroll>
          <div className="panel">
            <div className="panel-header">
              <span className="eyebrow">Public Profile</span>
              <h3 style={{ margin: 0 }}>{profile.name}</h3>
            </div>
            <div style={{ padding: 24 }} className="stack gap-4">
              <div className="row gap-4 wrap">
                <div className="ov-stat panel" style={{ flex: 1, minWidth: 200 }}>
                  <span className="eyebrow">Status</span>
                  <span className={`admin-badge ${profile.status === "active" ? "admin-badge-active" : "admin-badge-review"}`}>{profile.status}</span>
                </div>
                <div className="ov-stat panel" style={{ flex: 1, minWidth: 200 }}>
                  <span className="eyebrow">Verified</span>
                  <span className={`admin-badge ${profile.verified ? "admin-badge-active" : "admin-badge-draft"}`}>{profile.verified ? "Verified" : "Pending"}</span>
                </div>
              </div>

              {editing ? (
                <div className="stack gap-3">
                  <div className="form-grid-2">
                    <div className="field">
                      <label>Company Name</label>
                      <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Industry</label>
                      <input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Technology, Finance" />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="field">
                      <label>Email</label>
                      <input className="input" value={profile.email} disabled />
                    </div>
                    <div className="field">
                      <label>Phone</label>
                      <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254 700 000000" />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="field">
                      <label>Website</label>
                      <input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://company.co.ke" />
                    </div>
                    <div className="field">
                      <label>Location</label>
                      <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Nairobi, Kenya" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Description</label>
                    <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Tell talent about your company..." />
                  </div>
                  <div className="field">
                    <label>Logo URL</label>
                    <input className="input" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="row gap-2">
                    <button className="btn btn-signal btn-sm" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="stack gap-3">
                  <div className="row gap-2 wrap">
                    {profile.industry && <span className="chip">{profile.industry}</span>}
                    {profile.location && <span className="chip">{profile.location}</span>}
                    {profile.verified && <span className="chip" style={{ background: "var(--approved-soft)", color: "var(--approved)", border: "1px solid var(--approved)" }}>Verified</span>}
                  </div>
                  {profile.description && <p className="tiny" style={{ color: "var(--ink-2)", lineHeight: 1.6 }}>{profile.description}</p>}
                  <div className="row gap-4 wrap" style={{ marginTop: 8 }}>
                    {profile.phone && <div><span className="tiny muted">Phone</span><p className="tiny" style={{ color: "var(--ink)" }}>{profile.phone}</p></div>}
                    {profile.website && <div><span className="tiny muted">Website</span><p className="tiny"><a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--signal)" }}>{profile.website}</a></p></div>}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} style={{ marginTop: 8 }}>Edit Profile</button>
                </div>
              )}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </CompanyShell>
  )
}
