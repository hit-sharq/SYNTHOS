"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"

type Verification = {
  id: string
  type: string
  status: string
  documentUrl: string | null
  notes: string | null
  reviewedAt: string | null
  createdAt: string
}

const TYPES = [
  { value: "business_registration", label: "Business registration" },
  { value: "kra_pin", label: "KRA PIN" },
  { value: "bank_details", label: "Bank details" },
  { value: "reference_call", label: "Reference call" },
]

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  pending: { color: "var(--review)", bg: "var(--review-soft)" },
  approved: { color: "var(--approved)", bg: "var(--approved-soft)" },
  rejected: { color: "var(--rejected)", bg: "var(--rejected-soft)" },
}

export default function CompanyVerificationPage() {
  const [items, setItems] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [type, setType] = useState(TYPES[0].value)
  const [documentUrl, setDocumentUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/company/verification")
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Could not load")
      const data = await res.json()
      setItems(data.verifications || [])
      setError("")
    } catch (e: any) {
      setError(e?.message || "Could not load submissions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/company/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, documentUrl, notes }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Could not submit")
      setDocumentUrl("")
      setNotes("")
      await load()
    } catch (e: any) {
      setError(e?.message || "Could not submit")
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrap>
      <PageHead
        eyebrow="Company"
        title="Verification"
        desc="Submit documents so we can confirm your company. Approved companies appear in the public directory."
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(0, 1fr)", marginBottom: 28 }}>
        <form onSubmit={submit} className="panel-soft" style={{ padding: 22 }}>
          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Submit for review</h3>

          <label className="tiny muted" htmlFor="v-type">Document type</label>
          <select
            id="v-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="admin-input"
            style={{ width: "100%", marginTop: 6, marginBottom: 14 }}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <label className="tiny muted" htmlFor="v-url">Document link</label>
          <input
            id="v-url"
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
            placeholder="https://…"
            className="admin-input"
            style={{ width: "100%", marginTop: 6, marginBottom: 14 }}
          />

          <label className="tiny muted" htmlFor="v-notes">Notes</label>
          <textarea
            id="v-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Anything that helps us verify quickly"
            style={{
              width: "100%", marginTop: 6, padding: 10, fontSize: "0.9rem",
              border: "1px solid var(--line)", background: "var(--bg)",
              color: "var(--ink)", borderRadius: 6, resize: "vertical",
            }}
          />

          <button type="submit" className="btn btn-signal btn-sm" style={{ marginTop: 14 }} disabled={saving}>
            {saving ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>

      {error && <ErrorState title="Could not submit" message={error} />}

      <h3 style={{ fontSize: "1rem", marginBottom: 12 }}>Submissions</h3>
      {loading && <p className="muted">Loading…</p>}
      {!loading && items.length === 0 && (
        <Empty title="Nothing submitted yet" hint="Submit a document above to start verification." />
      )}

      <div className="stack gap-2">
        {items.map((v) => {
          const style = STATUS_STYLE[v.status] ?? STATUS_STYLE.pending
          return (
            <div key={v.id} className="panel-soft" style={{ padding: 18 }}>
              <div className="row gap-2 items-center wrap">
                <strong style={{ fontSize: "0.95rem" }}>
                  {TYPES.find((t) => t.value === v.type)?.label ?? v.type}
                </strong>
                <span className="chip" style={{ color: style.color, background: style.bg, border: `1px solid ${style.color}` }}>
                  {v.status}
                </span>
                <span className="tiny muted" style={{ marginLeft: "auto" }}>
                  {new Date(v.createdAt).toLocaleDateString()}
                </span>
              </div>
              {v.notes && <p className="tiny" style={{ color: "var(--ink-2)", marginTop: 8 }}>{v.notes}</p>}
              {v.documentUrl && (
                <a href={v.documentUrl} target="_blank" rel="noopener noreferrer" className="tiny" style={{ color: "var(--signal)", display: "inline-block", marginTop: 6 }}>
                  View document
                </a>
              )}
            </div>
          )
        })}
      </div>
    </PageWrap>
  )
}