export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const talent = await prisma.talent.findMany({
    where: { availability: "available" },
    orderBy: { rating: "desc" },
    take: 50,
  })

  return NextResponse.json({
    talent: talent.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      skills: t.skills,
      experience: t.experience,
      rating: t.rating,
      availability: t.availability,
      rate: t.rate,
      portfolio: t.portfolio,
      notes: t.notes,
    })),
  })
}
