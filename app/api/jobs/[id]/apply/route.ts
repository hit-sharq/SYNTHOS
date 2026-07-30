import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== "talent") {
      return NextResponse.json({ error: "Only talents can apply" }, { status: 403 })
    }

    const job = await prisma.jobPosting.findUnique({ where: { id: params.id } })
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })
    if (job.status !== "approved") return NextResponse.json({ error: "Job is not open" }, { status: 400 })

    const existing = await prisma.jobApplication.findUnique({
      where: { jobId_talentId: { jobId: job.id, talentId: user.id } },
    })
    if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 })

    const application = await prisma.jobApplication.create({
      data: {
        jobId: job.id,
        talentId: user.id,
        status: "pending",
      },
    })

    return NextResponse.json({ application: { id: application.id, status: application.status } }, { status: 201 })
  } catch (error) {
    console.error("Failed to apply for job:", error)
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 })
  }
}
