export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { CompanyShell } from "@/components/app/CompanyShell"
import { PageHead } from "@/components/app/Page"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { Briefcase, Users, Eye, TrendingUp, Plus, ExternalLink } from "lucide-react"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import { Empty } from "@/components/app/ui"
import "@/components/app/admin.css"

export default async function CompanyDashboardPage() {
  const { userId } = await auth()
  const user = await prisma.user.findUnique({ where: { id: userId! } })
  if (!user?.companyId) {
    return (
      <CompanyShell>
        <div className="company-content">
          <PageHead eyebrow="Company" title="Access Denied" />
          <div className="panel" style={{ padding: 40, textAlign: "center", marginTop: 20 }}>
            <p className="muted">You need to be linked to a company to access this dashboard.</p>
          </div>
        </div>
      </CompanyShell>
    )
  }

  const [company, jobs, applications, verifications] = await Promise.all([
    prisma.company.findUnique({ where: { id: user.companyId } }),
    prisma.jobPosting.findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: "desc" } }),
    prisma.jobApplication.findMany({
      where: { job: { companyId: user.companyId } },
      include: { job: { select: { id: true, title: true, status: true } }, talent: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.companyVerification.findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: "desc" } }),
  ])

  const pendingJobs = jobs.filter(j => j.status === "pending").length
  const approvedJobs = jobs.filter(j => j.status === "approved").length
  const totalApplications = applications.length
  const pendingApplications = applications.filter(a => a.status === "pending").length
  const totalViews = jobs.reduce((a, j) => a + (j.views || 0), 0)
  const pendingVerifications = verifications.filter(v => v.status === "pending").length

  return (
    <CompanyShell>
      <div className="company-content">
        <PageHead
          eyebrow="Company"
          title={company?.name || "Dashboard"}
          desc="Manage your jobs, review applications, and grow your team."
          actions={
            <div className="row gap-2 wrap">
              <Link href="/company/jobs/new" className="btn btn-signal"><Plus size={16} /> Post New Job</Link>
              <Link href="/company/applications" className="btn btn-ghost"><Users size={16} /> Applications</Link>
            </div>
          }
        />

        <RevealOnScroll>
          <div className="company-stats">
            <div className="company-stat">
              <span className="company-stat-label">Total Jobs</span>
              <span className="company-stat-value">{jobs.length}</span>
              <span className="company-stat-sub">{approvedJobs} approved</span>
            </div>
            <div className="company-stat">
              <span className="company-stat-label">Pending Review</span>
              <span className="company-stat-value" style={{ color: "var(--signal)" }}>{pendingJobs}</span>
              <span className="company-stat-sub">awaiting approval</span>
            </div>
            <div className="company-stat">
              <span className="company-stat-label">Applications</span>
              <span className="company-stat-value" style={{ color: "var(--human)" }}>{totalApplications}</span>
              <span className="company-stat-sub">{pendingApplications} pending</span>
            </div>
            <div className="company-stat">
              <span className="company-stat-label">Total Views</span>
              <span className="company-stat-value">{totalViews}</span>
              <span className="company-stat-sub">across all jobs</span>
            </div>
          </div>
        </RevealOnScroll>

        <div className="company-grid">
          <section className="stack gap-4">
            <RevealOnScroll>
              <div className="panel">
                <div className="panel-header">
                  <span className="eyebrow">Recent Jobs</span>
                  <h3 style={{ margin: 0 }}>Your Postings</h3>
                </div>
                {jobs.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center" }}>
                    <Empty title="No jobs posted yet" hint="Post your first job to start receiving applications." action={<Link href="/company/jobs/new" className="btn btn-signal">Post Job</Link>} />
                  </div>
                ) : (
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
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.slice(0, 10).map((job) => (
                          <tr key={job.id}>
                            <td data-label="Title">
                              <div style={{ fontWeight: 600 }}>{job.title}</div>
                              <div className="tiny muted">{job.category || "General"}</div>
                            </td>
                            <td data-label="Type" style={{ textTransform: "capitalize" }}>{job.type.replace("-", " ")}</td>
                            <td data-label="Location">{job.location || "—"}</td>
                            <td data-label="Status">
                              <span className={`admin-badge ${job.status === "approved" ? "admin-badge-active" : job.status === "pending" ? "admin-badge-review" : job.status === "rejected" ? "admin-badge-rejected" : "admin-badge-draft"}`}>
                                {job.status}
                              </span>
                            </td>
                            <td data-label="Views" className="tiny muted">{job.views || 0}</td>
                            <td data-label="Posted" className="tiny muted">{job.postedAt.toLocaleDateString()}</td>
                            <td data-label="Actions">
                              <div className="row gap-2">
                                <Link href={`/company/jobs/${job.id}`} className="btn btn-ghost btn-sm">View</Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="panel">
                <div className="panel-header">
                  <span className="eyebrow">Recent Applications</span>
                  <h3 style={{ margin: 0 }}>Candidate Pipeline</h3>
                </div>
                {applications.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center" }}>
                    <Empty title="No applications yet" hint="Post a job to start receiving applications." />
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="admin-table responsive-table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Job</th>
                          <th>Status</th>
                          <th>Applied</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 10).map((app) => (
                          <tr key={app.id}>
                            <td data-label="Applicant">
                              <div style={{ fontWeight: 600 }}>{app.talent.name}</div>
                              <div className="tiny muted">{app.talent.email}</div>
                            </td>
                            <td data-label="Job">{app.job.title}</td>
                            <td data-label="Status">
                              <span className={`admin-badge ${app.status === "pending" ? "admin-badge-review" : app.status === "accepted" ? "admin-badge-active" : app.status === "rejected" ? "admin-badge-rejected" : "admin-badge-draft"}`}>
                                {app.status}
                              </span>
                            </td>
                            <td data-label="Applied" className="tiny muted">{app.createdAt.toLocaleDateString()}</td>
                            <td data-label="Actions">
                              <div className="row gap-2">
                                <Link href={`/talents/${app.talent.id}`} className="btn btn-ghost btn-sm">View</Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </RevealOnScroll>
          </section>

          <aside className="stack gap-4">
            <RevealOnScroll>
              <div className="panel">
                <div className="panel-header">
                  <span className="eyebrow">Company</span>
                  <h3 style={{ margin: 0 }}>{company?.name}</h3>
                </div>
                <div style={{ padding: 16 }} className="stack gap-3">
                  <div className="row between gap-2">
                    <span className="tiny">Status</span>
                    <span className={`admin-badge ${company?.status === "active" ? "admin-badge-active" : "admin-badge-review"}`}>{company?.status}</span>
                  </div>
                  <div className="row between gap-2">
                    <span className="tiny">Verified</span>
                    <span className={`admin-badge ${company?.verified ? "admin-badge-active" : "admin-badge-draft"}`}>{company?.verified ? "Verified" : "Pending"}</span>
                  </div>
                  {pendingVerifications > 0 && (
                    <div className="row between gap-2">
                      <span className="tiny">Verifications</span>
                      <span className="chip" style={{ color: "var(--signal-ink)", background: "var(--signal-soft)" }}>{pendingVerifications} pending</span>
                    </div>
                  )}
                  {company?.industry && (
                    <div className="row between gap-2">
                      <span className="tiny">Industry</span>
                      <span className="tiny" style={{ color: "var(--ink)", fontWeight: 500 }}>{company.industry}</span>
                    </div>
                  )}
                  {company?.location && (
                    <div className="row between gap-2">
                      <span className="tiny">Location</span>
                      <span className="tiny" style={{ color: "var(--ink)", fontWeight: 500 }}>{company.location}</span>
                    </div>
                  )}
                  <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, marginTop: 4 }}>
                    <Link href="/company/profile" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                      <ExternalLink size={16} /> Manage Profile
                    </Link>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="panel">
                <div className="panel-header">
                  <span className="eyebrow">Quick Actions</span>
                  <h3 style={{ margin: 0 }}>Move forward</h3>
                </div>
                <div style={{ padding: 16 }} className="stack gap-2">
                  <Link href="/company/jobs/new" className="btn btn-signal" style={{ justifyContent: "center" }}>
                    <Plus size={16} /> Post New Job
                  </Link>
                  <Link href="/company/applications" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                    <Users size={16} /> Review Applications
                  </Link>
                  <Link href="/company/jobs" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                    <Briefcase size={16} /> Manage Jobs
                  </Link>
                  <Link href="/" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                    <ExternalLink size={16} /> View Public Profile
                  </Link>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="panel">
                <div className="panel-header">
                  <span className="eyebrow">Principle</span>
                  <h3 style={{ margin: 0 }}>Human + AI</h3>
                </div>
                <div style={{ padding: 16 }} className="stack gap-3">
                  <div><span className="tag-ai"><span className="dot dot-ai" /> AI assists</span><p className="tiny muted" style={{ marginTop: 6 }}>Matches talent to your roles and drafts job descriptions.</p></div>
                  <div style={{ margin: "2px 0" }} className="hai-div" />
                  <div><span className="tag-human"><span className="dot dot-human" /> You decide</span><p className="tiny muted" style={{ marginTop: 6 }}>Review applications and hire the right creative talent.</p></div>
                </div>
              </div>
            </RevealOnScroll>
          </aside>
        </div>
      </div>
    </CompanyShell>
  )
}
