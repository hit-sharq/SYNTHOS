export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: "open" },
      orderBy: { postedAt: "desc" },
      include: { project: { select: { id: true, name: true, slug: true, client: true } } },
    })

    return NextResponse.json({ jobs: jobs.map(j => ({
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
      project: j.project,
    })) })
  } catch (error) {
    console.error("Failed to fetch jobs:", error)
    return NextResponse.json({ error: "Failed to load jobs" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const job = await prisma.job.create({
      data: {
        projectId: body.projectId,
        title: body.title,
        description: body.description,
        requirements: body.requirements || [],
        skills: body.skills || [],
        budget: body.budget || "",
        timeline: body.timeline || "",
        type: body.type || "contract",
        status: body.status || "open",
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      include: { project: { select: { id: true, name: true, slug: true, client: true } } },
    })

    return NextResponse.json({ job: {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      skills: job.skills,
      budget: job.budget,
      timeline: job.timeline,
      type: job.type,
      status: job.status,
      postedAt: job.postedAt.toISOString(),
      expiresAt: job.expiresAt?.toISOString(),
      project: job.project,
    } }, { status: 201 })
  } catch (error) {
    console.error("Failed to create job:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
