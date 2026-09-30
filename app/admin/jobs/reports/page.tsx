"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"

type Report = {
  id: string
  reason: string
  details: string | null
  status: string
  reportedByEmail: string | null
  resolution: string | null
  createdAt: string
  job: { id: string; title: string; status: string; company: { name: string } }
}

export default function JobReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filter, setFilter] = useState("open")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/jobs/reports?status=${status}`)
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to load")
      const data = await res.json()
      setReports(data.reports || [])
      setError("")
    } catch (e: any) {
      setError(e?.message || "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(filter) }, [filter, load])

  async function update(id: string, status: string) {
    const res = await fetch("/api/admin/jobs/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id, status }),
    })
    if (res.ok) load(filter)
  }

  return (
    <PageWrap>
      <PageHead eyebrow="Admin" title="Job Reports" desc="Listings flagged by the community, awaiting review." />

      <div className="row gap-2 wrap" style={{ marginBottom: 20 }}>
        {["open", "reviewing", "resolved", "dismissed", "all"].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? "btn-signal" : "btn-ghost"}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <ErrorState title="Could not load reports" message={error} onRetry={() => load(filter)} />}
      {loading && <p className="muted">Loading…</p>}
      {!loading && !error && reports.length === 0 && <Empty title="No reports" hint={`Nothing marked ${filter}.`} />}

      <div className="stack gap-2">
        {reports.map((r) => (
          <div key={r.id} className="panel-soft" style={{ padding: 18 }}>
            <div className="row gap-2 items-center wrap" style={{ marginBottom: 8 }}>
              <strong>{r.job.title}</strong>
              <span className="chip">{r.job.company.name}</span>
              <span className="chip">{r.reason}</span>
              <span className="chip">{r.status}</span>
              <span className="tiny muted" style={{ marginLeft: "auto" }}>
                {new Date(r.createdAt).toLocaleString()}
              </span>
            </div>
            {r.details && <p className="tiny" style={{ color: "var(--ink-2)", marginBottom: 8 }}>{r.details}</p>}
            <p className="tiny muted" style={{ marginBottom: 10 }}>
              Reported by {r.reportedByEmail || "anonymous"} · job status {r.job.status}
            </p>
            <div className="row gap-2 wrap">
              <a href={`/admin/jobs/${r.job.id}`} className="btn btn-ghost btn-sm">View job</a>
              {r.status === "open" && <button className="btn btn-ghost btn-sm" onClick={() => update(r.id, "reviewing")}>Mark reviewing</button>}
              {r.status !== "resolved" && <button className="btn btn-ghost btn-sm" onClick={() => update(r.id, "resolved")}>Resolve</button>}
              {r.status !== "dismissed" && <button className="btn btn-ghost btn-sm" onClick={() => update(r.id, "dismissed")}>Dismiss</button>}
            </div>
          </div>
        ))}
      </div>
    </PageWrap>
  )
}