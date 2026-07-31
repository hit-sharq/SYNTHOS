export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { AdminShell } from "@/components/app/AdminShell"
import { PageHead, PageWrap } from "@/components/app/Page"
import { RevealOnScroll } from "@/components/app/useReveal"
import Link from "next/link"

export default async function AdminJobsPage() {
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { id: true, name: true, slug: true } } },
  })

  return (
    <AdminShell>
      <div className="admin-content">
        <PageHead eyebrow="Admin" title="Job Postings" desc="Review and moderate job postings from companies." />
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Posted</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <RevealOnScroll key={job.id}>
                  <tr key={job.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{job.title}</div>
                    <div className="tiny muted">{job.category || "General"}</div>
                  </td>
                  <td>{job.company.name}</td>
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
                      <Link href={`/admin/jobs/${job.id}`} className="btn btn-ghost btn-sm">Review</Link>
                    </div>
                  </td>
                  </tr>
                </RevealOnScroll>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
