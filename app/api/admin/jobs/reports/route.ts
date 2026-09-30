import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"

export async function GET(req: Request) {
  const admin = await requireAdmin()
  if (admin.error) return admin.error

  const url = new URL(req.url)
  const status = url.searchParams.get("status") || "open"

  const reports = await prisma.jobReport.findMany({
    where: status === "all" ? {} : { status },
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { id: true, title: true, status: true, company: { select: { name: true } } } },
    },
  })

  return NextResponse.json({ reports })
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin()
  if (admin.error) return admin.error

  let body: { reportId?: string; status?: string; resolution?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: Errors.validation.invalidFormat }, { status: 400 })
  }

  const { reportId, status, resolution } = body
  if (!reportId) return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })

  const valid = ["open", "reviewing", "resolved", "dismissed"]
  if (!status || !valid.includes(status)) {
    return NextResponse.json({ error: Errors.validation.invalidStatus }, { status: 400 })
  }

  const report = await prisma.jobReport.findUnique({ where: { id: reportId }, select: { id: true } })
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 })

  const updated = await prisma.jobReport.update({
    where: { id: reportId },
    data: {
      status,
      resolution: resolution?.trim() || null,
      reviewedById: admin.userId ? (await prisma.user.findUnique({ where: { clerkId: admin.userId }, select: { id: true } }))?.id : null,
      reviewedAt: new Date(),
    },
  })

  return NextResponse.json({ report: updated })
}