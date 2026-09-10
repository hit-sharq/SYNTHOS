import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export async function GET() {
  try {
    const reports = await prisma.contactReport.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: { select: { id: true, name: true, client: true } } },
    })
    return NextResponse.json(reports)
  } catch (error) {
    console.error("Failed to fetch contact reports:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
