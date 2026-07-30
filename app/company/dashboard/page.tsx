export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { AdminShell } from "@/components/app/AdminShell"
import { PageHead, PageWrap } from "@/components/app/Page"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

export default async function CompanyDashboardPage() {
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

  const [company, jobs, applications] = await Promise.all([
    prisma.company.findUnique({ where: { id: user.companyId } }),
    prisma.jobPosting.findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: "desc" } }),
    prisma.jobApplication.findMany({
      where: { job: { companyId: user.companyId } },
      include: { talent: { select: { id: true, name: true, email: true } }, job: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const pendingJobs = jobs.filter(j => j.status === "pending").length
  const approvedJobs = jobs.filter(j => j.status === "approved").length
  const totalApplications = applications.length

  return (
    <AdminShell>
      <div className="admin-content">
        <PageHead eyebrow="Company" title={company?.name || "Dashboard"} desc="Manage your jobs and review applications." />
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          <div className="panel">
            <span className="eyebrow">Total Jobs</span>
            <span className="ov-stat-value">{jobs.length}</span>
          </div>
          <div className="panel">
            <span className="eyebrow">Pending Review</span>
            <span className="ov-stat-value" style={{ color: "var(--signal)" }}>{pendingJobs}</span>
          </div>
          <div className="panel">
            <span className="eyebrow">Approved</span>
            <span className="ov-stat-value" style={{ color: "var(--approved)" }}>{approvedJobs}</span>
          </div>
          <div className="panel">
            <span className="eyebrow">Applications</span>
            <span className="ov-stat-value" style={{ color: "var(--ai)" }}>{totalApplications}</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem" }}>Recent Applications</h2>
          <Link href="/company/jobs/new" className="btn btn-signal">+ Post New Job</Link>
        </div>

        {applications.length === 0 ? (
          <div className="panel" style={{ padding: 40, textAlign: "center" }}>
            <p className="muted">No applications yet. Post a job to start receiving applications.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Job</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.talent.name}</div>
                      <div className="tiny muted">{app.talent.email}</div>
                    </td>
                    <td>{app.job.title}</td>
                    <td>
                      <span className={`admin-badge ${app.status === "pending" ? "admin-badge-review" : app.status === "accepted" ? "admin-badge-active" : "admin-badge-rejected"}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="tiny muted">{app.createdAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
