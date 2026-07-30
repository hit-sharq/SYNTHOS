export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import "@/components/app/blog.css"

export default async function JobsPage() {
  const { userId } = await auth()
  const rawJobs = await prisma.job.findMany({
    where: { status: "open" },
    orderBy: { postedAt: "desc" },
    include: { project: { select: { id: true, name: true, slug: true, client: true } } },
  })
  const jobs = rawJobs.map((j) => ({
    ...j,
    postedAt: j.postedAt.toISOString(),
    expiresAt: j.expiresAt?.toISOString(),
  }))

  let appliedJobIds: string[] = []
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role === "talent") {
      const applications = await prisma.jobApplication.findMany({
        where: { talentId: userId },
        select: { jobId: true },
      })
      appliedJobIds = applications.map((a) => a.jobId)
    }
  }

  return (
    <PageWrap>
      <PageHead eyebrow="Opportunities" title="Open Gigs" desc="Approved projects looking for talent. These are real projects, not vacancies." />
      <div className="blog-grid">
        {jobs.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60 }}>
            <p className="muted">No open gigs right now. Approved projects will appear here as jobs.</p>
          </div>
        )}
        {jobs.map((job) => (
          <article key={job.id} className="blog-card">
            <div className="blog-card-body">
              <span className="eyebrow" style={{ textTransform: "capitalize" }}>{job.type}</span>
              <h3>{job.title}</h3>
              <p className="tiny muted" style={{ marginBottom: 8 }}>{job.description}</p>
              <div className="row gap-2 wrap" style={{ marginBottom: 12 }}>
                {job.budget && <span className="chip">{job.budget}</span>}
                {job.timeline && <span className="chip">{job.timeline}</span>}
                {job.skills.slice(0, 3).map((skill) => <span key={skill} className="chip">{skill}</span>)}
              </div>
              {job.requirements.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, color: "var(--ink-2)" }}>Requirements:</h4>
                  <ul className="stack gap-1">
                    {job.requirements.slice(0, 4).map((req, i) => (
                      <li key={i} className="tiny" style={{ color: "var(--ink-3)", paddingLeft: 14, position: "relative" }}>• {req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {userId && appliedJobIds.includes(job.id) ? (
                <span className="btn btn-subtle btn-sm" style={{ opacity: 0.6, cursor: "default" }}>Applied</span>
              ) : userId ? (
                <form action={`/api/jobs/${job.id}/apply`} method="POST">
                  <button type="submit" className="btn btn-signal btn-sm">Express Interest</button>
                </form>
              ) : (
                <Link href="/sign-in?redirect=/jobs" className="btn btn-signal btn-sm">Sign in to Apply</Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </PageWrap>
  )
}
