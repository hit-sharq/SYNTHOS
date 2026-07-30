import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const job = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        status: "rejected",
        rejectedAt: new Date(),
      },
    })

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Failed to reject job:", error)
    return NextResponse.json({ error: "Failed to reject job" }, { status: 500 })
  }
}
