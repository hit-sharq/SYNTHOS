"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, ExternalLink, CheckCircle, XCircle, Edit } from "lucide-react"
import { PageHead } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import { logAuditAction } from "@/app/actions/audit"
import { AdminShell } from "@/components/app/AdminShell"

type Company = {
  id: string
  name: string
  slug: string
  email: string
  phone?: string
  website?: string
  industry?: string
  location?: string
  description?: string
  verified: boolean
  status: string
  users: { id: string; name: string; email: string }[]
  jobs: { id: string }[]
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", email: "", phone: "", website: "", industry: "", location: "", description: "", verified: false, status: "active" })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/companies")
      if (!res.ok) throw new Error("Failed to load companies")
      const data = await res.json()
      setCompanies(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name || !form.email) return
    setSaving(true)
    setError(null)
    try {
      const url = editId ? `/api/companies/${editId}` : "/api/companies"
      const res = await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to ${editId ? "update" : "add"} company`)
      }
      const data = await res.json()
      await logAuditAction({ action: editId ? "company.update" : "company.create", targetType: "Company", targetId: editId || data.id, targetName: form.name })
      setEditId(null)
      setForm({ name: "", email: "", phone: "", website: "", industry: "", location: "", description: "", verified: false, status: "active" })
      setEditing(false)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (c: Company) => {
    setForm({ name: c.name, email: c.email, phone: c.phone || "", website: c.website || "", industry: c.industry || "", location: c.location || "", description: c.description || "", verified: c.verified, status: c.status })
    setEditId(c.id)
    setEditing(true)
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this company?")) return
    setError(null)
    try {
      const res = await fetch(`/api/companies/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete company")
      await logAuditAction({ action: "company.delete", targetType: "Company", targetId: id })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  const toggleVerify = async (c: Company) => {
    setError(null)
    try {
      const res = await fetch(`/api/companies/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verified: !c.verified }) })
      if (!res.ok) throw new Error("Failed to update verification")
      await logAuditAction({ action: `company.${!c.verified ? "verify" : "unverify"}`, targetType: "Company", targetId: c.id, targetName: c.name })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <AdminShell>
        <div className="admin-content">
          <PageHead eyebrow="Admin" title="Companies" desc="Manage registered companies and verification status." />
          <p style={{ color: "#8e8e93" }}>Loading companies…</p>
        </div>
      </AdminShell>
    )
  }

  if (error) {
    return (
      <AdminShell>
        <div className="admin-content">
          <PageHead eyebrow="Admin" title="Companies" desc="Manage registered companies and verification status." />
          <ErrorState title="Could not load companies" message={error} onRetry={load} />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="admin-content">
        <PageHead
          eyebrow="Admin"
          title="Companies"
          desc="Manage registered companies and verification status."
          actions={
            <button className="admin-btn" onClick={() => { setEditing(true); setEditId(null); setForm({ name: "", email: "", phone: "", website: "", industry: "", location: "", description: "", verified: false, status: "active" }) }}>
              <Plus size={16} /> Add Company
            </button>
          }
        />

        {editing && (
          <div className="admin-section" style={{ marginBottom: 20, padding: 22 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <div className="form-grid-2">
                <div className="field">
                  <label>Name *</label>
                  <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Company name" />
                </div>
                <div className="field">
                  <label>Email *</label>
                  <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="company@example.com" />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="field">
                  <label>Phone</label>
                  <input className="admin-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254..." />
                </div>
                <div className="field">
                  <label>Website</label>
                  <input className="admin-input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="field">
                  <label>Industry</label>
                  <input className="admin-input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Technology" />
                </div>
                <div className="field">
                  <label>Location</label>
                  <input className="admin-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Nairobi, Kenya" />
                </div>
              </div>
              <div className="field">
                <label>Description</label>
                <textarea className="admin-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief company description..." />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="admin-btn-primary" onClick={save} disabled={saving || !form.name || !form.email}>
                  {saving ? "Saving..." : editId ? "Update Company" : "Add Company"}
                </button>
                <button className="admin-btn" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="admin-section">
          <div style={{ marginBottom: 16 }}>
            <input
              className="admin-input"
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 400 }}
            />
          </div>

          {filtered.length === 0 ? (
            <Empty title="No companies found" hint={search ? "Try a different search term." : "Companies will appear here once registered."} />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table responsive-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Industry</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Users</th>
                    <th style={{ width: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((company) => (
                    <tr key={company.id}>
                      <td data-label="Company">
                        <div style={{ fontWeight: 600 }}>{company.name}</div>
                        <div className="tiny muted">{company.email}</div>
                      </td>
                      <td data-label="Industry">{company.industry || "—"}</td>
                      <td data-label="Location">{company.location || "—"}</td>
                      <td data-label="Status">
                        <span className={`admin-badge ${company.status === "active" ? "admin-badge-active" : company.status === "pending" ? "admin-badge-review" : "admin-badge-draft"}`}>
                          {company.status}
                        </span>
                      </td>
                      <td data-label="Verified">
                        <span className={`admin-badge ${company.verified ? "admin-badge-active" : "admin-badge-review"}`}>
                          {company.verified ? "Yes" : "No"}
                        </span>
                      </td>
                      <td data-label="Users" className="admin-table-muted">{company.users.length}</td>
                      <td data-label="Actions">
                        <div className="row gap-2">
                          <button className="admin-icon-btn" title={company.verified ? "Unverify" : "Verify"} onClick={() => toggleVerify(company)}>
                            {company.verified ? <XCircle size={14} /> : <CheckCircle size={14} />}
                          </button>
                          <button className="admin-icon-btn" title="Edit" onClick={() => startEdit(company)}><Edit size={14} /></button>
                          <Link href={`/admin/companies/${company.id}`} className="admin-icon-btn" title="View"><ExternalLink size={14} /></Link>
                          <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" onClick={() => remove(company.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}