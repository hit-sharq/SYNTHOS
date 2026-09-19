export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import "@/components/app/blog.css"
import LevelBadge from "@/components/app/LevelBadge"

const TIER_COLORS: Record<string, string> = {
  New: "#888888",
  Rising: "#4a90d9",
  Established: "#27ae60",
  Featured: "#e67e22",
  Elite: "#0066ff",
}

function getTierForLevel(level: number) {
  if (level >= 5) return "Elite"
  if (level >= 4) return "Featured"
  if (level >= 3) return "Established"
  if (level >= 2) return "Rising"
  return "New"
}

export default async function TalentsPage() {
  const talents = await prisma.talent.findMany({
    where: { availability: { not: "unavailable" } },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { level: true, levelXP: true } } },
  })

  const talentIds = talents.map(t => t.id)
  const followerCounts: Record<string, number> = {}
  if (talentIds.length > 0) {
    const counts = await prisma.connection.groupBy({
      where: {
        followedId: { in: talentIds },
        status: "accepted",
      },
      by: ['followedId'],
      _count: { followedId: true },
    })
    for (const c of counts) {
      followerCounts[c.followedId] = c._count.followedId
    }
  }

  return (
    <PageWrap>
      <PageHead eyebrow="Creators" title="Talents & Creators" desc="Browse Kenya's creative talent. Writers, strategists, producers, designers, developers, and animators ready for verified roles." />
      <div className="blog-grid">
        {talents.map((talent) => {
          const tier = getTierForLevel(talent.user?.level || 1)
          const tierColor = TIER_COLORS[tier]
          const followers = followerCounts[talent.id] || 0
          return (
            <Link key={talent.id} href={`/talents/${talent.id}`} className="blog-card" style={{ textDecoration: "none", color: "inherit", borderLeft: `3px solid ${tierColor}` }}>
              <div className="blog-card-body">
                <div className="row gap-2 items-center" style={{ marginBottom: 4 }}>
                  <h3>{talent.name}</h3>
                  <LevelBadge level={talent.user?.level || 1} levelXP={talent.user?.levelXP || 0} size="sm" />
                </div>
                <span className="tiny mono" style={{ color: tierColor }}>{tier}</span>
                {talent.skills.length > 0 && (
                  <div className="row gap-2 wrap" style={{ marginTop: 10, marginBottom: 10 }}>
                    {talent.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="chip">{skill}</span>
                    ))}
                  </div>
                )}
                <div className="row gap-2 wrap" style={{ marginBottom: 10 }}>
                  {talent.experience > 0 && <span className="chip">{talent.experience}y exp</span>}
                  {talent.rate && <span className="chip">{talent.rate}</span>}
                  <span className="chip" style={{ color: talent.availability === "available" ? "var(--approved)" : talent.availability === "busy" ? "var(--review)" : "var(--rejected)", background: "var(--surface-2)" }}>
                    {talent.availability}
                  </span>
                </div>
                {talent.notes && (
                  <p className="tiny" style={{ color: "var(--ink-2)", marginBottom: 10, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{talent.notes}</p>
                )}
                <div className="row gap-3 mt-2" style={{ alignItems: "center" }}>
                  <span className="tiny" style={{ color: "var(--signal)" }}>View profile →</span>
                  {followers > 0 && (
                    <span className="tiny" style={{ color: "var(--ink-3)" }}>
                      <strong style={{ color: "var(--ink-2)" }}>{followers}</strong> followers
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
        {talents.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60 }}>
            <p className="muted">No talents listed yet.</p>
            <Link href="/talent/signup" className="btn btn-signal" style={{ marginTop: 20 }}>Join as Creator</Link>
          </div>
        )}
      </div>
    </PageWrap>
  )
}