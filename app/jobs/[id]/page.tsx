export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import "@/components/app/blog.css"

export default async function JobPage({ params }: { params: { id: string } }) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: params.id },
    include: { company: true },
  })

  if (!job || job.status !== "approved") {
    return (
      <PageWrap>
        <PageHead eyebrow="Jobs" title="Job not found" />
      </PageWrap>
    )
  }

  const { userId } = await auth()
  let applied = false
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role === "talent") {
      const application = await prisma.jobApplication.findUnique({
        where: { jobId_talentId: { jobId: job.id, talentId: userId } },
      })
      applied = !!application
    }
  }

  return (
    <PageWrap>
      <div style={{ maxWidth: 800 }}>
        <Link href="/jobs" className="btn btn-ghost" style={{ marginBottom: 20 }}>← Back to Jobs</Link>
        <div style={{ padding: 32, border: "1px solid var(--line)" }}>
          <div style={{ marginBottom: 16 }}>
            <span className={`admin-badge ${job.status === "approved" ? "admin-badge-active" : "admin-badge-review"}`}>{job.status}</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: 12 }}>{job.title}</h1>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            {job.type && <span className="chip" style={{ textTransform: "capitalize" }}>{job.type.replace("-", " ")}</span>}
            {job.location && <span className="chip">{job.location}</span>}
            {job.timeline && <span className="chip">{job.timeline}</span>}
            {job.budget && <span className="chip">{job.budget}</span>}
            {job.experience && <span className="chip">{job.experience}</span>}
            {job.company.verified && <span className="chip" style={{ background: "var(--approved-soft)", color: "var(--approved)", border: "1px solid var(--approved)" }}>Verified Company</span>}
          </div>

          <p style={{ color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 24 }}>{job.description}</p>

          {job.requirements.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Requirements</h3>
              <ul style={{ paddingLeft: 20, color: "var(--ink-2)", lineHeight: 1.8 }}>
                {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
              </ul>
            </div>
          )}

          {job.skills.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Skills</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {job.skills.map((skill) => <span key={skill} className="chip">{skill}</span>)}
              </div>
            </div>
          )}

          <div style={{ padding: 20, border: "1px solid var(--line)", marginBottom: 24 }}>
            <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>About {job.company.name}</h3>
            <Link href={`/companies/${job.company.slug}`} style={{ color: "var(--signal)", fontWeight: 600 }}>{job.company.name}</Link>
            <p className="tiny muted" style={{ marginTop: 4 }}>{job.company.industry || "N/A"} · {job.company.location || "N/A"}</p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {applied ? (
              <span className="btn btn-subtle" style={{ opacity: 0.6, cursor: "default" }}>Applied</span>
            ) : userId ? (
              <form action={`/api/jobs/${job.id}/apply`} method="POST">
                <button type="submit" className="btn btn-signal">Apply Now</button>
              </form>
            ) : (
              <Link href="/sign-in?redirect=/jobs" className="btn btn-signal">Sign in to Apply</Link>
            )}
            <button onClick={() => alert("Report feature coming soon")} className="btn btn-ghost" style={{ border: "1px solid var(--line)" }}>Report Job</button>
          </div>
        </div>
      </div>
    </PageWrap>
  )
}
