export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { AdminShell } from "@/components/app/AdminShell"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"

export default async function CompanyJobsPage() {
  const { userId } = await auth()
  const user = await prisma.user.findUnique({ where: { id: userId! } })
  if (!user?.companyId) {
    return (
      <AdminShell>
        <div className="admin-content">
          <PageHead eyebrow="Company" title="Access Denied" />
        </div>
      </AdminShell>
    )
  }

  const jobs = await prisma.jobPosting.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <AdminShell>
      <div className="admin-content">
        <PageHead eyebrow="Company" title="My Jobs" desc="Manage your job postings." actions={
          <Link href="/company/jobs/new" className="btn btn-signal">+ Post New Job</Link>
        } />
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
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
                    <span className={`admin-badge ${job.status === "approved" ? "admin-badge-active" : job.status === "pending" ? "admin-badge-review" : "admin-badge-rejected"}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="tiny muted">{job.postedAt.toLocaleDateString()}</td>
                  <td>
                    <div className="row gap-2">
                      <Link href={`/jobs/${job.id}`} className="btn btn-ghost btn-sm">View</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
