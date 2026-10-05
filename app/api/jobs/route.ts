import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"
import { readJson, isJsonError } from "@/lib/request"
import { readPagination, paginated } from "@/lib/pagination"
import { cached, cachedJson, pruneCache, DEFAULT_TTL_MS } from "@/lib/cache"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const { page, limit, skip, take } = readPagination(url)
    const where = { status: "approved" as const }
    const key = `jobs:${take}:${skip}`

    const [jobs, total] = await cached(key, DEFAULT_TTL_MS, () =>
      prisma.$transaction([
        prisma.jobPosting.findMany({
          where,
          orderBy: { postedAt: "desc" },
          take,
          skip,
          select: {
            id: true,
            title: true,
            description: true,
            requirements: true,
            skills: true,
            budget: true,
            timeline: true,
            type: true,
            status: true,
            postedAt: true,
            expiresAt: true,
            company: { select: { id: true, name: true, slug: true, verified: true } },
          },
        }),
        prisma.jobPosting.count({ where }),
      ])
    )
    pruneCache()

    return cachedJson(
      {
        items: jobs.map((j) => ({
          id: j.id,
          title: j.title,
          description: j.description,
          requirements: j.requirements,
          skills: j.skills,
          budget: j.budget,
          timeline: j.timeline,
          type: j.type,
          status: j.status,
          postedAt: j.postedAt.toISOString(),
          expiresAt: j.expiresAt?.toISOString(),
          company: j.company,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
          hasMore: page * limit < total,
        },
      },
      30
    )
  } catch (error) {
    console.error("Failed to fetch jobs:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await readJson<any>(req)
    if (isJsonError(body)) return body
    const job = await prisma.jobPosting.create({
      data: {
        companyId: body.companyId,
        title: body.title,
        description: body.description,
        requirements: body.requirements || [],
        skills: body.skills || [],
        budget: body.budget || "",
        budgetMin: body.budgetMin || "",
        budgetMax: body.budgetMax || "",
        timeline: body.timeline || "",
        location: body.location || "",
        type: body.type || "full-time",
        category: body.category || "",
        experience: body.experience || "",
        education: body.education || "",
        status: body.status || "pending",
        featured: body.featured || false,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      include: { company: { select: { id: true, name: true, slug: true, verified: true } } },
    })

    return NextResponse.json({ job: {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      skills: job.skills,
      budget: job.budget,
      budgetMin: job.budgetMin,
      budgetMax: job.budgetMax,
      timeline: job.timeline,
      location: job.location,
      type: job.type,
      category: job.category,
      experience: job.experience,
      education: job.education,
      status: job.status,
      featured: job.featured,
      postedAt: job.postedAt.toISOString(),
      expiresAt: job.expiresAt?.toISOString(),
      company: job.company,
    } }, { status: 201 })
  } catch (error) {
    console.error("Failed to create job:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
