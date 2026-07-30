export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import "@/components/app/blog.css"

type Job = {
  id: string
  title: string
  description: string
  requirements: string[]
  skills: string[]
  budget: string
  budgetMin: string
  budgetMax: string
  timeline: string
  location: string
  type: string
  category: string
  experience: string
  postedAt: string
  company: {
    id: string
    name: string
    slug: string
    verified: boolean
  }
}

export default async function JobsPage() {
  const { userId } = await auth()
  const rawJobs = await prisma.jobPosting.findMany({
    where: { status: "approved" },
    orderBy: { postedAt: "desc" },
    include: { company: { select: { id: true, name: true, slug: true, verified: true } } },
  })
  const jobs: Job[] = rawJobs.map((j) => ({
    ...j,
    postedAt: j.postedAt.toISOString(),
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
      <PageHead eyebrow="Opportunities" title="Open Gigs" desc="Approved jobs from verified companies. Find your next opportunity." />
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          <input type="text" placeholder="Search jobs..." className="admin-input" style={{ flex: 1, minWidth: 200 }} />
          <select className="admin-input" style={{ width: "auto" }}>
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
          <select className="admin-input" style={{ width: "auto" }}>
            <option value="">All Locations</option>
            <option value="Nairobi">Nairobi</option>
            <option value="Mombasa">Mombasa</option>
            <option value="Kisumu">Kisumu</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div className="blog-grid">
          {jobs.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60 }}>
              <p className="muted">No open gigs right now. Approved jobs will appear here.</p>
            </div>
          )}
          {jobs.map((job) => (
            <article key={job.id} className="blog-card">
              <div className="blog-card-body">
                <span className="eyebrow" style={{ textTransform: "capitalize" }}>{job.type.replace("-", " ")}</span>
                <h3>{job.title}</h3>
                <p className="tiny muted" style={{ marginBottom: 8 }}>{job.description}</p>
                <div className="row gap-2 wrap" style={{ marginBottom: 12 }}>
                  {job.budget && <span className="chip">{job.budget}</span>}
                  {job.timeline && <span className="chip">{job.timeline}</span>}
                  {job.location && <span className="chip">{job.location}</span>}
                  {job.experience && <span className="chip">{job.experience}</span>}
                  {job.company.verified && <span className="chip" style={{ background: "var(--approved-soft)", color: "var(--approved)", border: "1px solid var(--approved)" }}>Verified</span>}
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
                  {userId && appliedJobIds.includes(job.id) ? (
                    <span className="btn btn-subtle btn-sm" style={{ opacity: 0.6, cursor: "default" }}>Applied</span>
                  ) : userId ? (
                    <form action={`/api/jobs/${job.id}/apply`} method="POST">
                      <button type="submit" className="btn btn-signal btn-sm">Apply Now</button>
                    </form>
                  ) : (
                    <Link href="/sign-in?redirect=/jobs" className="btn btn-signal btn-sm">Sign in to Apply</Link>
                  )}
                  <Link href={`/jobs/${job.id}`} className="btn btn-ghost btn-sm">View Details</Link>
                  <button onClick={() => alert("Report feature coming soon")} className="btn btn-ghost btn-sm" style={{ border: "1px solid var(--line)" }}>Report</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageWrap>
  )
}