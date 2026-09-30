import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { Errors } from "@/lib/errors"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

    const adminIds = process.env.ADMIN_USER_IDS?.split(",").map(id => id.trim()).filter(Boolean) || []
    if (!adminIds.includes(userId)) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

    const job = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
    })

    await logAudit({ action: "job.approve", targetType: "JobPosting", targetId: params.id, targetName: job.title })

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Failed to approve job:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
