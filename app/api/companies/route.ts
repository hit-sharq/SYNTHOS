import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

export const dynamic = 'force-dynamic'

export async function GET() {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: { select: { id: true, name: true, email: true } },
        jobs: { select: { id: true } },
      },
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
      status: c.status,
      joinedAt: c.joinedAt,
      openJobs: c.jobs.length,
      users: c.users,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to load companies:", error)
    return NextResponse.json({ error: "Failed to load companies" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    const body = await req.json()
    const company = await prisma.company.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        email: body.email,
        phone: body.phone,
        website: body.website,
        industry: body.industry,
        location: body.location,
        description: body.description,
        logo: body.logo,
        verified: body.verified || false,
        status: body.status || "active",
      },
    })
    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error("Failed to create company:", error)
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
  }
}
