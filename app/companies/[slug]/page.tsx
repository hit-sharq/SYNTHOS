export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import "@/components/app/blog.css"

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    include: {
      jobs: {
        where: { status: "approved" },
        orderBy: { postedAt: "desc" },
      },
    },
  })

  if (!company) {
    return (
      <PageWrap>
        <PageHead eyebrow="Companies" title="Company not found" />
      </PageWrap>
    )
  }

  return (
    <PageWrap>
      <PageHead eyebrow="Companies" title={company.name} desc={company.description || `${company.industry || "Company"} based in ${company.location || "Kenya"}`} />
      <div style={{ maxWidth: 900 }}>
        <div style={{ padding: 32, border: "1px solid var(--line)", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: 8 }}>{company.name}</h1>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {company.industry && <span className="chip">{company.industry}</span>}
                {company.location && <span className="chip">{company.location}</span>}
                {company.verified && <span className="chip" style={{ background: "var(--approved-soft)", color: "var(--approved)", border: "1px solid var(--approved)" }}>Verified</span>}
              </div>
            </div>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Visit Website →</a>
            )}
          </div>

          {company.description && (
            <p style={{ color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 20 }}>{company.description}</p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <span className="tiny muted">Email</span>
              <p style={{ fontSize: "0.9rem" }}>{company.email}</p>
            </div>
            {company.phone && (
              <div>
                <span className="tiny muted">Phone</span>
                <p style={{ fontSize: "0.9rem" }}>{company.phone}</p>
              </div>
            )}
            <div>
              <span className="tiny muted">Joined</span>
              <p style={{ fontSize: "0.9rem" }}>{company.joinedAt.toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: 20 }}>Open Positions ({company.jobs.length})</h2>
        {company.jobs.length === 0 ? (
          <p className="muted">No open positions right now.</p>
        ) : (
          <div className="blog-grid">
            {company.jobs.map((job) => (
              <article key={job.id} className="blog-card">
                <div className="blog-card-body">
                  <span className="eyebrow" style={{ textTransform: "capitalize" }}>{job.type.replace("-", " ")}</span>
                  <h3>{job.title}</h3>
                  <p className="tiny muted" style={{ marginBottom: 8 }}>{job.description}</p>
                  <div className="row gap-2 wrap" style={{ marginBottom: 12 }}>
                    {job.budget && <span className="chip">{job.budget}</span>}
                    {job.timeline && <span className="chip">{job.timeline}</span>}
                    {job.location && <span className="chip">{job.location}</span>}
                  </div>
                  <Link href={`/jobs/${job.id}`} className="btn btn-signal btn-sm">View Job →</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageWrap>
  )
}
