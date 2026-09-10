import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export async function GET() {
  try {
    const jobs = await prisma.jobPosting.findMany({
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
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
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
