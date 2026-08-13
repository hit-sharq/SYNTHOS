export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { CompanyShell } from "@/components/app/CompanyShell"
import { PageHead, PageWrap } from "@/components/app/Page"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { RevealOnScroll } from "@/components/app/useReveal"
import { Empty } from "@/components/app/ui"
import "@/components/app/admin.css"

export default async function CompanyApplicationsPage() {
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

  const applications = await prisma.jobApplication.findMany({
    where: { job: { companyId: user.companyId } },
    include: {
      job: { select: { id: true, title: true, type: true, status: true } },
      talent: { select: { id: true, name: true, email: true, skills: true, experience: true, rating: true, availability: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const pending = applications.filter(a => a.status === "pending")
  const reviewed = applications.filter(a => a.status !== "pending")

  return (
    <CompanyShell>
      <div className="company-content">
        <PageHead
          eyebrow="Company"
          title="Applications"
          desc={`${pending.length} pending · ${reviewed.length} reviewed`}
          actions={
            <Link href="/company/jobs" className="btn btn-ghost">Back to Jobs</Link>
          }
        />

        <RevealOnScroll>
          <div className="ov-stats" style={{ marginBottom: 28 }}>
            <div className="ov-stat panel">
              <span className="eyebrow">Total</span>
              <span className="ov-stat-value" style={{ color: "var(--ink)" }}>{applications.length}</span>
              <span className="tiny muted">applications</span>
            </div>
            <div className="ov-stat panel">
              <span className="eyebrow">Pending</span>
              <span className="ov-stat-value" style={{ color: "var(--signal)" }}>{pending.length}</span>
              <span className="tiny muted">awaiting review</span>
            </div>
            <div className="ov-stat panel">
              <span className="eyebrow">Reviewed</span>
              <span className="ov-stat-value" style={{ color: "var(--human)" }}>{reviewed.length}</span>
              <span className="tiny muted">decided</span>
            </div>
          </div>
        </RevealOnScroll>

        {applications.length === 0 ? (
          <RevealOnScroll>
            <div className="panel" style={{ padding: 40, textAlign: "center" }}>
              <Empty title="No applications yet" hint="Post jobs to start receiving applications from creative talent." action={<Link href="/company/jobs/new" className="btn btn-signal">Post a Job</Link>} />
            </div>
          </RevealOnScroll>
        ) : (
          <RevealOnScroll>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table responsive-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Skills</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td data-label="Applicant">
                        <div style={{ fontWeight: 600 }}>{app.talent.name}</div>
                        <div className="tiny muted">{app.talent.email}</div>
                        <div className="tiny muted">{app.talent.experience}y experience · {app.talent.rating.toFixed(1)} rating</div>
                      </td>
                      <td data-label="Job">
                        <div style={{ fontWeight: 600 }}>{app.job.title}</div>
                        <div className="tiny muted">{app.job.type}</div>
                      </td>
                      <td data-label="Status">
                        <span className={`admin-badge ${app.status === "pending" ? "admin-badge-review" : app.status === "accepted" ? "admin-badge-active" : app.status === "rejected" ? "admin-badge-rejected" : "admin-badge-draft"}`}>
                          {app.status}
                        </span>
                      </td>
                      <td data-label="Skills">
                        <div className="row gap-1 wrap">
                          {app.talent.skills?.slice(0, 3).map(s => <span key={s} className="chip" style={{ fontSize: "0.7rem" }}>{s}</span>)}
                        </div>
                      </td>
                      <td data-label="Applied" className="tiny muted">{app.createdAt.toLocaleDateString()}</td>
                      <td data-label="Actions">
                        <div className="row gap-2">
                          <Link href={`/talents/${app.talent.id}`} className="btn btn-ghost btn-sm">View Profile</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RevealOnScroll>
        )}
      </div>
    </CompanyShell>
  )
}
