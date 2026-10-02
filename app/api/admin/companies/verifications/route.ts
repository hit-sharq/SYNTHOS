import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"
import { readJson, isJsonError } from "@/lib/request"

export async function GET(req: Request) {
  const admin = await requireAdmin()
  if (admin.error) return admin.error

  const url = new URL(req.url)
  const status = url.searchParams.get("status") || "pending"

  const verifications = await prisma.companyVerification.findMany({
    where: status === "all" ? {} : { status },
    orderBy: { createdAt: "desc" },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          verified: true,
          status: true,
        },
      },
    },
  })

  return NextResponse.json({ verifications })
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin()
  if (admin.error) return admin.error

  const body = await readJson<any>(req)
  if (isJsonError(body)) return body

  const { verificationId, status, notes } = body
  if (!verificationId) return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })
  if (!status || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: Errors.validation.invalidStatus }, { status: 400 })
  }

  const verification = await prisma.companyVerification.findUnique({
    where: { id: verificationId },
    select: { id: true, companyId: true, type: true },
  })
  if (!verification) return NextResponse.json({ error: "Verification not found." }, { status: 404 })

  const reviewer = admin.userId
    ? (await prisma.user.findUnique({ where: { clerkId: admin.userId }, select: { id: true } }))?.id ?? null
    : null

  const updated = await prisma.companyVerification.update({
    where: { id: verificationId },
    data: {
      status,
      notes: notes?.trim() || null,
      reviewedBy: reviewer,
      reviewedAt: new Date(),
    },
  })

  // When the business registration is approved, verify the company so it can
  // be posted publicly. Other document types only unlock their own row.
  if (verification.type === "business_registration" && status === "approved") {
    await prisma.company.update({
      where: { id: verification.companyId },
      data: { verified: true, status: "active", verifiedAt: new Date(), verifiedBy: reviewer },
    })
  }

  return NextResponse.json({ verification: updated })
}