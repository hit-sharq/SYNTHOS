export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import "@/components/app/blog.css"

export default async function TalentsPage() {
  const talents = await prisma.talent.findMany({
    where: { availability: { not: "unavailable" } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <PageWrap>
      <PageHead eyebrow="Creators" title="Talents & Creators" desc="The creative talent behind Lumyn. Writers, strategists, producers, designers, developers, and animators ready to bring your vision to life." />
      <div className="blog-grid">
        {talents.map((talent) => (
          <article key={talent.id} className="blog-card">
            <div className="blog-card-body">
              <span className="eyebrow" style={{ textTransform: "capitalize" }}>{talent.position}</span>
              <h3>{talent.name}</h3>
              <p className="tiny muted" style={{ marginBottom: 8 }}>{talent.email}</p>
              {talent.notes && <p className="tiny" style={{ color: "var(--ink-2)", marginBottom: 10, lineHeight: 1.55 }}>{talent.notes}</p>}
              {talent.skills.length > 0 && (
                <div className="row gap-2 wrap" style={{ marginBottom: 12 }}>
                  {talent.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="chip">{skill}</span>
                  ))}
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <div className="row gap-2 wrap" style={{ marginBottom: 8 }}>
                  {talent.experience > 0 && <span className="chip">{talent.experience}y experience</span>}
                  {talent.rate && <span className="chip">{talent.rate}</span>}
                </div>
                <span className={`admin-badge admin-badge-${talent.availability === "available" ? "active" : talent.availability === "busy" ? "review" : "draft"}`}>
                  {talent.availability}
                </span>
              </div>
              {talent.portfolio && (
                <a href={talent.portfolio} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  View Portfolio →
                </a>
              )}
            </div>
          </article>
        ))}
        {talents.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60 }}>
            <p className="muted">No talents listed yet.</p>
            <Link href="/sign-up" className="btn btn-signal" style={{ marginTop: 20 }}>Join as Creator</Link>
          </div>
        )}
      </div>
    </PageWrap>
  )
}
