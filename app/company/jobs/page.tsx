export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { CompanyShell } from "@/components/app/CompanyShell"
import { PageHead, PageWrap } from "@/components/app/Page"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { RevealOnScroll } from "@/components/app/useReveal"
import "@/components/app/admin.css"

export default async function CompanyJobsPage() {
  const { userId } = await auth()
  const user = await prisma.user.findUnique({ where: { id: userId! } })
  if (!user?.companyId) {
    return (
      <CompanyShell>
        <div className="company-content">
          <PageHead eyebrow="Company" title="Access Denied" />
        </div>
      </CompanyShell>
    )
  }

  const jobs = await prisma.jobPosting.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
    include: { company: { select: { id: true, name: true, slug: true } } },
  })

  return (
    <CompanyShell>
      <div className="company-content">
        <PageHead eyebrow="Company" title="My Jobs" desc="Manage your job postings." actions={
          <Link href="/company/jobs/new" className="btn btn-signal">+ Post New Job</Link>
        } />
        <RevealOnScroll>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table responsive-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Posted</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{job.title}</div>
                      <div className="tiny muted">{job.category || "General"}</div>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{job.type.replace("-", " ")}</td>
                    <td>{job.location || "—"}</td>
                    <td>
                      <span className={`admin-badge ${job.status === "approved" ? "admin-badge-active" : job.status === "pending" ? "admin-badge-review" : job.status === "rejected" ? "admin-badge-rejected" : "admin-badge-draft"}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="tiny muted">{job.views || 0}</td>
                    <td className="tiny muted">{job.postedAt.toLocaleDateString()}</td>
                    <td>
                      <div className="row gap-2">
                        <Link href={`/jobs/${job.id}`} className="btn btn-ghost btn-sm">View</Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--ink-3)" }}>
                      No jobs posted yet. <Link href="/company/jobs/new" className="btn btn-signal" style={{ marginTop: 12, display: "inline-flex" }}>Post Your First Job</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </RevealOnScroll>
      </div>
    </CompanyShell>
  )
}
