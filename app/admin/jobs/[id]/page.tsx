export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { AdminShell } from "@/components/app/AdminShell"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"

export default async function AdminJobReviewPage({ params }: { params: { id: string } }) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: params.id },
    include: { company: true },
  })

  if (!job) {
    return (
      <AdminShell>
        <div className="admin-content">
          <PageHead eyebrow="Admin" title="Job not found" />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="admin-content">
        <PageHead eyebrow="Admin" title="Review Job Posting" desc={job.title} />
        <div style={{ maxWidth: 720 }}>
          <div style={{ marginBottom: 24 }}>
            <span className={`admin-badge ${job.status === "pending" ? "admin-badge-review" : job.status === "approved" ? "admin-badge-active" : "admin-badge-rejected"}`}>
              {job.status}
            </span>
          </div>

          <div style={{ display: "grid", gap: 24 }}>
            <div style={{ padding: 24, border: "1px solid var(--line)" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: 16 }}>{job.title}</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                {job.type && <span className="chip" style={{ textTransform: "capitalize" }}>{job.type.replace("-", " ")}</span>}
                {job.location && <span className="chip">{job.location}</span>}
                {job.timeline && <span className="chip">{job.timeline}</span>}
                {job.budget && <span className="chip">{job.budget}</span>}
              </div>
              <p style={{ color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 20 }}>{job.description}</p>

              {job.requirements.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 8 }}>Requirements</h4>
                  <ul style={{ paddingLeft: 20, color: "var(--ink-2)" }}>
                    {job.requirements.map((req, i) => <li key={i} style={{ marginBottom: 4 }}>{req}</li>)}
                  </ul>
                </div>
              )}

              {job.skills.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 8 }}>Skills</h4>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {job.skills.map((skill) => <span key={skill} className="chip">{skill}</span>)}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 8 }}>Company</h4>
                <Link href={`/companies/${job.company.slug}`} style={{ color: "var(--signal)" }}>{job.company.name}</Link>
                <p className="tiny muted">{job.company.email} · {job.company.industry || "N/A"} · {job.company.location || "N/A"}</p>
              </div>
            </div>

            {job.status === "pending" && (
              <div style={{ display: "flex", gap: 12 }}>
                <form action={`/api/admin/jobs/${job.id}/approve`} method="POST">
                  <button type="submit" className="btn btn-signal">Approve Job</button>
                </form>
                <form action={`/api/admin/jobs/${job.id}/reject`} method="POST">
                  <button type="submit" className="btn btn-ghost" style={{ border: "1px solid var(--rejected)", color: "var(--rejected)" }}>Reject</button>
                </form>
              </div>
            )}

            <Link href="/admin/jobs" className="btn btn-ghost">← Back to Jobs</Link>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
