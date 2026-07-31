import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: { status: "active" },
      include: {
        jobs: {
          where: { status: "approved" },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const data = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      email: c.email,
      phone: c.phone,
      website: c.website,
      industry: c.industry,
      location: c.location,
      description: c.description,
      logo: c.logo,
      verified: c.verified,
      joinedAt: c.joinedAt,
      openJobs: c.jobs.length,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to load companies:", error)
    return NextResponse.json({ error: "Failed to load companies" }, { status: 500 })
  }
}
