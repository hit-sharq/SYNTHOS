"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PageHead, PageWrap } from "@/components/app/Page"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"

type Company = {
  id: string
  name: string
  slug: string
  email: string
  phone?: string
  website?: string
  industry?: string
  location?: string
  description?: string
  logo?: string
  verified: boolean
  joinedAt: string
  openJobs: number
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterIndustry, setFilterIndustry] = useState("all")

  useEffect(() => {
    fetch("/api/companies")
      .then(res => res.json())
      .then(data => {
        setCompanies(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const industries = Array.from(new Set(companies.map(c => c.industry).filter(Boolean)))

  const filtered = companies.filter(c => {
    const matchSearch = !search || `${c.name} ${c.industry || ""} ${c.location || ""}`.toLowerCase().includes(search.toLowerCase())
    const matchIndustry = filterIndustry === "all" || c.industry === filterIndustry
    return matchSearch && matchIndustry
  })

  return (
    <PageWrap>
      <PageHead
        eyebrow="Companies"
        title="Verified Employers"
        desc="Browse verified companies actively hiring on Synthos. Real jobs, real employers, real opportunities."
        actions={
          <Link href="/company/signup" className="btn btn-signal">Register Your Company</Link>
        }
      />

      <RevealOnScroll>
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <input
              className="input"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", paddingLeft: 36 }}
            />
          </div>
          <select
            className="select"
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">All industries</option>
            {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>
      </RevealOnScroll>

      {loading ? (
        <RevealOnScroll>
          <div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading companies...</p></div>
        </RevealOnScroll>
      ) : filtered.length === 0 ? (
        <RevealOnScroll>
          <div style={{ padding: 60, textAlign: "center", border: "1px dashed var(--line)" }}>
            <p className="muted" style={{ marginBottom: 16 }}>No companies found.</p>
            <Link href="/company/signup" className="btn btn-signal">Be the first to register</Link>
          </div>
        </RevealOnScroll>
      ) : (
        <StaggerContainer>
          <div className="blog-grid">
            {filtered.map((company) => (
              <RevealOnScroll key={company.id}>
                <article key={company.id} className="blog-card">
                  <div className="blog-card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <h3>{company.name}</h3>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                          {company.industry && <span className="chip">{company.industry}</span>}
                          {company.location && <span className="chip">{company.location}</span>}
                          {company.verified && <span className="chip" style={{ background: "var(--approved-soft)", color: "var(--approved)", border: "1px solid var(--approved)" }}>Verified</span>}
                        </div>
                      </div>
                      {company.website && (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
                          Website →
                        </a>
                      )}
                    </div>

                    {company.description && (
                      <p className="tiny" style={{ color: "var(--ink-2)", marginBottom: 12, lineHeight: 1.6 }}>
                        {company.description}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                      {company.phone && (
                        <div>
                          <span className="tiny muted">Phone</span>
                          <p className="tiny" style={{ color: "var(--ink)" }}>{company.phone}</p>
                        </div>
                      )}
                      <div>
                        <span className="tiny muted">Email</span>
                        <p className="tiny" style={{ color: "var(--ink)" }}>{company.email}</p>
                      </div>
                      <div>
                        <span className="tiny muted">Joined</span>
                        <p className="tiny" style={{ color: "var(--ink)" }}>{new Date(company.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                      <div>
                        <span className="tiny muted">Open positions</span>
                        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 500, color: company.openJobs > 0 ? "var(--ink)" : "var(--ink-3)" }}>
                          {company.openJobs} {company.openJobs === 1 ? "job" : "jobs"}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/companies/${company.slug}`} className="btn btn-ghost btn-sm">
                          View Profile →
                        </Link>
                        {company.openJobs > 0 && (
                          <Link href={`/jobs`} className="btn btn-signal btn-sm">
                            View Jobs →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </StaggerContainer>
      )}
    </PageWrap>
  )
}
