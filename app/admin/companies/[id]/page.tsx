export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma"
import { AdminShell } from "@/components/app/AdminShell"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function AdminCompanyDetailPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      users: { select: { id: true, name: true, email: true } },
      jobs: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!company) {
    return (
      <AdminShell>
        <div className="admin-content">
          <PageHead eyebrow="Admin" title="Company not found" />
          <Link href="/admin/companies" className="btn btn-ghost">← Back to Companies</Link>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="admin-content">
        <PageHead
          eyebrow="Admin"
          title={company.name}
          desc={`${company.industry || "Unknown industry"} · ${company.location || "Unknown location"}`}
          actions={
            <Link href="/admin/companies" className="btn btn-ghost">← Back</Link>
          }
        />

        <div style={{ display: "grid", gap: 24 }}>
          <div style={{ padding: 24, border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontFamily: "var(--font-serif)", marginBottom: 8 }}>{company.name}</h3>
                <p style={{ color: "var(--ink-2)", fontSize: "0.88rem" }}>{company.email} · {company.phone || "No phone"}</p>
                {company.website && <a href={company.website} target="_blank" rel="noreferrer" style={{ color: "var(--signal)", fontSize: "0.88rem" }}>{company.website}</a>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className={`admin-badge ${company.verified ? "admin-badge-active" : "admin-badge-review"}`}>
                  {company.verified ? "Verified" : "Unverified"}
                </span>
                <span className={`admin-badge admin-badge-${company.status === "active" ? "active" : company.status === "pending" ? "review" : "draft"}`}>
                  {company.status}
                </span>
              </div>
            </div>

            {company.description && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 8 }}>Description</h4>
                <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", lineHeight: 1.6 }}>{company.description}</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div>
                <span className="eyebrow">Industry</span>
                <p style={{ color: "var(--ink)", fontSize: "0.88rem" }}>{company.industry || "—"}</p>
              </div>
              <div>
                <span className="eyebrow">Location</span>
                <p style={{ color: "var(--ink)", fontSize: "0.88rem" }}>{company.location || "—"}</p>
              </div>
              <div>
                <span className="eyebrow">Users</span>
                <p style={{ color: "var(--ink)", fontSize: "0.88rem" }}>{company.users.length}</p>
              </div>
              <div>
                <span className="eyebrow">Open Jobs</span>
                <p style={{ color: "var(--ink)", fontSize: "0.88rem" }}>{company.jobs.length}</p>
              </div>
            </div>
          </div>

          {company.users.length > 0 && (
            <div style={{ padding: 24, border: "1px solid var(--line)" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 12 }}>Users</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {company.users.map((user) => (
                  <div key={user.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ink-3)" }}>
                      {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.88rem" }}>{user.name}</span>
                      <span className="tiny muted" style={{ display: "block" }}>{user.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {company.jobs.length > 0 && (
            <div style={{ padding: 24, border: "1px solid var(--line)" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 12 }}>Jobs</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {company.jobs.map((job) => (
                  <div key={job.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.88rem" }}>{job.title}</span>
                    <span className="tiny muted" style={{ display: "block" }}>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
