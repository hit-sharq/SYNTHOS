"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PostJobPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    skills: "",
    budget: "",
    budgetMin: "",
    budgetMax: "",
    timeline: "",
    location: "",
    type: "full-time",
    category: "",
    experience: "",
    education: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/company/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          requirements: form.requirements.split("\n").filter(Boolean),
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to post job")
      }

      router.push("/company/jobs")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: 24 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/company/jobs" className="btn btn-ghost" style={{ marginBottom: 16 }}>← My Jobs</Link>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", marginBottom: 8 }}>Post a New Job</h1>
          <p style={{ fontSize: "0.92rem", color: "var(--ink-3)" }}>Fill in the details below. Your job will be reviewed by our team before going live.</p>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)", color: "var(--rejected)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="field">
            <label>Job Title <span style={{ color: "var(--signal)" }}>*</span></label>
            <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label>Type</label>
              <select className="admin-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div className="field">
              <label>Category</label>
              <input className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Technology, Marketing" />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label>Location</label>
              <input className="admin-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Nairobi, Kenya" />
            </div>
            <div className="field">
              <label>Timeline</label>
              <input className="admin-input" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} placeholder="e.g. 3 months, Immediate" />
            </div>
          </div>

          <div className="field">
            <label>Description <span style={{ color: "var(--signal)" }}>*</span></label>
            <textarea className="admin-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} required />
          </div>

          <div className="field">
            <label>Requirements (one per line)</label>
            <textarea className="admin-input" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={4} placeholder="5+ years experience in React&#10;Strong communication skills&#10;Degree in Computer Science" />
          </div>

          <div className="field">
            <label>Skills (comma separated)</label>
            <input className="admin-input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, TypeScript, Node.js, PostgreSQL" />
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label>Budget (optional)</label>
              <input className="admin-input" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. KSh 150,000/month" />
            </div>
            <div className="field">
              <label>Experience Level</label>
              <select className="admin-input" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}>
                <option value="">Any</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Education (optional)</label>
            <input className="admin-input" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="e.g. Bachelor's degree in relevant field" />
          </div>

          <button type="submit" className="btn btn-signal" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Submitting…" : "Submit Job for Review"}
          </button>
        </form>
      </div>
    </div>
  )
}
