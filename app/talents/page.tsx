export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead, PageWrap } from "@/components/app/Page"
import { TalentCard } from "@/components/app/TalentCard"
import "@/components/app/blog.css"

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
        {talents.map((talent) => (
          <TalentCard key={talent.id} talent={talent} followers={followerCounts[talent.id] || 0} />
        ))}
        {talents.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60 }}>
            <p className="muted">No talents listed yet.</p>
            <a href="/talent/signup" className="btn btn-signal" style={{ marginTop: 20 }}>Join as Creator</a>
          </div>
        )}
      </div>
    </PageWrap>
  )
}