import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

const TIER_CONFIG: Record<number, { title: string; badgeColor: string }> = {
  1: { title: "New", badgeColor: "#888888" },
  2: { title: "Rising", badgeColor: "#4a90d9" },
  3: { title: "Established", badgeColor: "#27ae60" },
  4: { title: "Featured", badgeColor: "#e67e22" },
  5: { title: "Elite", badgeColor: "#0066ff" },
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const talent = await prisma.talent.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { level: true, levelXP: true } },
    },
  })

  if (!talent) return NextResponse.json({ error: Errors.resources.userNotFound }, { status: 404 })

  const tier = TIER_CONFIG[talent.user?.level || 1] || TIER_CONFIG[1]

  return NextResponse.json({
    talent: {
      id: talent.id,
      userId: talent.userId,
      name: talent.name,
      email: talent.email,
      skills: talent.skills,
      experience: talent.experience,
      rating: talent.rating,
      availability: talent.availability,
      rate: talent.rate,
      portfolio: talent.portfolio,
      notes: talent.notes,
    },
    user: {
      level: talent.user?.level || 1,
      levelXP: talent.user?.levelXP || 0,
      ...tier,
    },
  })
}