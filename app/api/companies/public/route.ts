import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export const dynamic = "force-dynamic"

/**
 * Public company directory.
 *
 * /api/companies is admin-only, so the public /companies page could not read
 * its own data. This returns only companies that are safe to show publicly:
 * active and verified. Pending or unverified companies stay invisible until
 * an admin approves them.
 */
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: { verified: true, status: "active" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        location: true,
        website: true,
        description: true,
        logo: true,
        verified: true,
        joinedAt: true,
        jobs: {
          where: { status: "approved" },
          select: { id: true },
        },
      },
    })

    return NextResponse.json(
      companies.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        industry: c.industry,
        location: c.location,
        website: c.website,
        description: c.description,
        logo: c.logo,
        verified: c.verified,
        joinedAt: c.joinedAt,
        openJobs: c.jobs.length,
      }))
    )
  } catch (error) {
    console.error("Failed to load public companies:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}