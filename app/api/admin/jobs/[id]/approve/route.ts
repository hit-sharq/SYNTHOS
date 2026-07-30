import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const job = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
    })

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Failed to approve job:", error)
    return NextResponse.json({ error: "Failed to approve job" }, { status: 500 })
  }
}
