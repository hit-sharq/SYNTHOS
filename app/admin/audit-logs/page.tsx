"use client"

import { useState, useEffect } from "react"
import { PageHead } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import "@/components/app/admin.css"

type AuditLog = {
  id: string
  actorEmail: string | null
  action: string
  targetType: string
  targetName: string | null
  changes: any
  createdAt: string
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await fetch("/api/audit-logs")
      if (!res.ok) throw new Error("Failed to load audit logs")
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="admin-content">
        <PageHead eyebrow="Admin" title="Audit Logs" desc="Track all admin actions and changes." />
        <div className="admin-section">
          <p style={{ color: "#8e8e93" }}>Loading audit logs…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-content">
        <PageHead eyebrow="Admin" title="Audit Logs" desc="Track all admin actions and changes." />
        <ErrorState title="Could not load audit logs" message={error} onRetry={load} />
      </div>
    )
  }

  return (
    <div className="admin-content">
      <PageHead eyebrow="Admin" title="Audit Logs" desc="Track all admin actions and changes." />
      {logs.length === 0 ? (
        <div className="admin-section">
          <Empty title="No audit logs yet" hint="Admin actions will be recorded here." />
        </div>
      ) : (
        <div className="admin-section">
          <div className="admin-table-wrap">
            <table className="admin-table responsive-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td data-label="Time" className="admin-table-muted">{new Date(log.createdAt).toLocaleString()}</td>
                    <td data-label="Actor" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>{log.actorEmail || "system"}</td>
                    <td data-label="Action">
                      <span className={`admin-badge ${log.action.includes("delete") ? "admin-badge-rejected" : log.action.includes("create") ? "admin-badge-active" : "admin-badge-review"}`}>{log.action}</span>
                    </td>
                    <td data-label="Target">
                      <span style={{ fontWeight: 600, color: "var(--ink)" }}>{log.targetName || log.targetType}</span>
                      <span className="tiny muted" style={{ display: "block" }}>{log.targetType}</span>
                    </td>
                    <td data-label="Details" className="admin-table-muted">
                      {log.changes ? <pre style={{ fontSize: "0.72rem", whiteSpace: "pre-wrap" }}>{JSON.stringify(log.changes).slice(0, 200)}</pre> : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
