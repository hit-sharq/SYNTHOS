import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth"
import { Errors } from "@/lib/errors"
import { readJson, isJsonError } from "@/lib/request"

const TYPES = ["business_registration", "kra_pin", "bank_details", "reference_call"] as const

/**
 * A company submits documents for review. Nothing wrote CompanyVerification
 * rows before this, so the dashboard's pending count was always zero.
 */
export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })
  if (!user.companyId) {
    return NextResponse.json({ error: Errors.access.roleRestricted }, { status: 403 })
  }

  const body = await readJson<any>(req)
  if (isJsonError(body)) return body

  const type = String(body.type || "").trim()
  if (!TYPES.includes(type as (typeof TYPES)[number])) {
    return NextResponse.json({ error: `Type must be one of: ${TYPES.join(", ")}` }, { status: 400 })
  }

  const documentUrl = body.documentUrl?.trim() || null
  const notes = body.notes?.trim() || null
  if (!documentUrl && !notes) {
    return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })
  }

  // One open submission per type keeps the review queue free of duplicates.
  const pending = await prisma.companyVerification.findFirst({
    where: { companyId: user.companyId, type, status: "pending" },
    select: { id: true },
  })
  if (pending) {
    return NextResponse.json({ error: "A submission of this type is already under review." }, { status: 409 })
  }

  const verification = await prisma.companyVerification.create({
    data: {
      companyId: user.companyId,
      type,
      status: "pending",
      documentUrl,
      notes,
    },
  })

  return NextResponse.json({ verification }, { status: 201 })
}

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })
  if (!user.companyId) return NextResponse.json({ error: Errors.access.roleRestricted }, { status: 403 })

  const verifications = await prisma.companyVerification.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ verifications })
}