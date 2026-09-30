"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const REASONS = [
  { value: "spam", label: "Spam or irrelevant" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "misleading", label: "Misleading details" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "expired", label: "No longer available" },
  { value: "other", label: "Something else" },
]

export function ReportButton({
  jobId,
  className = "btn btn-ghost btn-sm",
  label = "Report",
}: {
  jobId: string
  className?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")
  const [message, setMessage] = useState("")

  async function submit() {
    if (!reason) return
    setStatus("sending")
    try {
      const res = await fetch(`/api/jobs/${jobId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setMessage(data.error || "Could not send report.")
        return
      }
      setStatus("done")
      setMessage("Thanks. We'll take a look at this listing.")
    } catch {
      setStatus("error")
      setMessage("Could not send report.")
    }
  }

  if (status === "done") {
    return <span className="tiny muted" style={{ color: "var(--ink-2)" }}>{message}</span>
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>{label}</button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Report listing"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 200,
          }}
        >
          <div
            className="panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 460, width: "100%", padding: 24 }}
          >
            <h3 style={{ fontSize: "1.1rem", marginBottom: 6 }}>Report this listing</h3>
            <p className="tiny muted" style={{ marginBottom: 16 }}>
              Thanks for letting us know. We'll review this listing.
            </p>

            <div className="stack gap-2" style={{ marginBottom: 14 }}>
              {REASONS.map((r) => (
                <label key={r.value} className="row gap-2 items-center" style={{ cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  <span className="tiny">{r.label}</span>
                </label>
              ))}
            </div>

            <label className="tiny muted" htmlFor="report-details">Details (optional)</label>
            <textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              style={{
                width: "100%", marginTop: 6, padding: 10, fontSize: "0.9rem",
                border: "1px solid var(--line)", background: "var(--surface)",
                color: "var(--ink)", borderRadius: 6, resize: "vertical",
              }}
            />

            {status === "error" && (
              <p className="tiny" style={{ color: "var(--rejected)", marginTop: 10 }}>{message}</p>
            )}

            <div className="row gap-2" style={{ marginTop: 18, justifyContent: "flex-end" }}>
              <button
                type="button"
                className={cn("btn btn-ghost btn-sm")}
                onClick={() => { setOpen(false); setReason(""); setDetails("") }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-signal btn-sm"
                onClick={submit}
                disabled={!reason || status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Send report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}