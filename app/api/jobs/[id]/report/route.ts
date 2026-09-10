import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await _req.json()
    const { reason, details } = body

    if (!reason) {
      return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })
    }

    const job = await prisma.jobPosting.findUnique({ where: { id: params.id } })
    if (!job) {
      return NextResponse.json({ error: Errors.resources.jobNotFound }, { status: 404 })
    }

    await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        status: "rejected",
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    })

    return NextResponse.json({ success: true, message: "Job reported and removed from public listing." })
  } catch (error) {
    console.error("Failed to report job:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
