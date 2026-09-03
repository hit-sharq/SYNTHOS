import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const adminIds = process.env.ADMIN_USER_IDS?.split(",").map(id => id.trim()).filter(Boolean) || []
    if (!adminIds.includes(userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const job = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        status: "rejected",
        rejectedAt: new Date(),
      },
    })

    await logAudit({ action: "job.reject", targetType: "JobPosting", targetId: params.id, targetName: job.title })

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Failed to reject job:", error)
    return NextResponse.json({ error: "Failed to reject job" }, { status: 500 })
  }
}
