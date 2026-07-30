export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { AdminShell } from "@/components/app/AdminShell"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { users: { select: { id: true, name: true, email: true } } },
  })

  return (
    <AdminShell>
      <div className="admin-content">
        <PageHead eyebrow="Admin" title="Companies" desc="Manage registered companies and verification status." />
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Users</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{company.name}</div>
                    <div className="tiny muted">{company.email}</div>
                  </td>
                  <td>{company.industry || "—"}</td>
                  <td>{company.location || "—"}</td>
                  <td>
                    <span className={`admin-badge ${company.status === "active" ? "admin-badge-active" : company.status === "pending" ? "admin-badge-review" : "admin-badge-rejected"}`}>
                      {company.status}
                    </span>
                  </td>
                  <td>{company.verified ? "✓" : "—"}</td>
                  <td>{company.users.length}</td>
                  <td>
                    <div className="row gap-2">
                      <Link href={`/admin/companies/${company.id}`} className="btn btn-ghost btn-sm">View</Link>
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
