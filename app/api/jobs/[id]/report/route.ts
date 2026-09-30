import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth"
import { Errors } from "@/lib/errors"

const REASONS = ["spam", "duplicate", "misleading", "inappropriate", "expired", "other"] as const
type Reason = (typeof REASONS)[number]

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let body: { reason?: string; details?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: Errors.validation.invalidFormat }, { status: 400 })
  }

  const reason = (body.reason || "").trim().toLowerCase()
  if (!REASONS.includes(reason as Reason)) {
    return NextResponse.json({ error: `Reason must be one of: ${REASONS.join(", ")}` }, { status: 400 })
  }

  const job = await prisma.jobPosting.findUnique({ where: { id: params.id }, select: { id: true, status: true } })
  if (!job) {
    return NextResponse.json({ error: Errors.resources.jobNotFound }, { status: 404 })
  }

  const user = await getSessionUser()

  // Collapse repeat reports from the same person so the queue stays useful.
  const duplicate = await prisma.jobReport.findFirst({
    where: { jobId: job.id, status: { in: ["open", "reviewing"] }, reportedById: user?.id ?? null },
  })
  if (duplicate) {
    return NextResponse.json({ error: "You have already reported this listing." }, { status: 409 })
  }

  const report = await prisma.jobReport.create({
    data: {
      jobId: job.id,
      reason,
      details: body.details?.trim() || null,
      reportedById: user?.id ?? null,
      reportedByEmail: user?.email ?? null,
    },
  })

  // Flag the listing for admin review without hiding it outright. It stays
  // visible so genuine applicants are not penalised by one bad report.
  const openReports = await prisma.jobReport.count({ where: { jobId: job.id, status: "open" } })
  if (openReports >= 3 && job.status === "approved") {
    await prisma.jobPosting.update({
      where: { id: job.id },
      data: { status: "pending" },
    })
  }

  return NextResponse.json({ success: true, reportId: report.id }, { status: 201 })
}