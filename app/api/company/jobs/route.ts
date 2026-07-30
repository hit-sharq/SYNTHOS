import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.companyId) {
      return NextResponse.json({ error: "Only verified companies can post jobs" }, { status: 403 })
    }

    const company = await prisma.company.findUnique({ where: { id: user.companyId } })
    if (!company || company.status !== "active") {
      return NextResponse.json({ error: "Company must be active to post jobs" }, { status: 403 })
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const jobsThisMonth = await prisma.jobPosting.count({
      where: {
        companyId: company.id,
        createdAt: { gte: startOfMonth },
      },
    })

    const FREE_LIMIT = company.verified ? Infinity : 1
    if (jobsThisMonth >= FREE_LIMIT) {
      return NextResponse.json({ error: company.verified ? "Monthly limit reached" : "Free tier limit reached. Verify your company for unlimited posts." }, { status: 403 })
    }

    const body = await req.json()
    const job = await prisma.jobPosting.create({
      data: {
        companyId: company.id,
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
        status: "pending",
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
      postedAt: job.postedAt.toISOString(),
      company: job.company,
    } }, { status: 201 })
  } catch (error) {
    console.error("Failed to post job:", error)
    return NextResponse.json({ error: "Failed to post job" }, { status: 500 })
  }
}
