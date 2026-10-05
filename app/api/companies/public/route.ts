import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"
import { readPagination } from "@/lib/pagination"
import { cached, cachedJson, pruneCache, DEFAULT_TTL_MS } from "@/lib/cache"

export const dynamic = "force-dynamic"

/**
 * Public company directory.
 *
 * /api/companies is admin-only, so the public /companies page could not read
 * its own data. This returns only companies that are safe to show publicly:
 * active and verified. Pending or unverified companies stay invisible until
 * an admin approves them.
 */
export async function GET(req: Request) {
  try {
    const { page, limit, skip, take } = readPagination(new URL(req.url))
    const where = { verified: true, status: "active" }

    const key = `companies-public:${take}:${skip}`

    const [companies, total] = await cached(key, DEFAULT_TTL_MS, () =>
      prisma.$transaction([
      prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
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
      }),
        prisma.company.count({ where }),
      ])
    )
    pruneCache()

    return cachedJson(
      {
        items: companies.map((c) => ({
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
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
          hasMore: page * limit < total,
        },
      },
      60
    )
  } catch (error) {
    console.error("Failed to load public companies:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}