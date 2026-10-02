import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"
import { readJson, isJsonError } from "@/lib/request"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      users: { select: { id: true, name: true, email: true } },
      jobs: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!company) return NextResponse.json({ error: Errors.resources.companyNotFound }, { status: 404 })
  return NextResponse.json(company)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  const body = await readJson<any>(req)
  if (isJsonError(body)) return body

  // Only apply the fields the caller actually sent. Passing the whole body
  // straight to prisma.update would clear every omitted column, so the admin
  // UI's partial "toggle verified" payload would wipe the company name,
  // email, phone and status.
  const editable = [
    "name",
    "slug",
    "email",
    "phone",
    "website",
    "industry",
    "location",
    "description",
    "logo",
    "verified",
    "status",
  ] as const

  const existing = await prisma.company.findUnique({ where: { id: params.id }, select: { id: true, verified: true } })
  if (!existing) return NextResponse.json({ error: Errors.resources.companyNotFound }, { status: 404 })

  const data: Record<string, unknown> = {}
  for (const key of editable) {
    if (body[key] !== undefined) data[key] = body[key]
  }

  // Record who approved the company and when, so verification is auditable.
  if (body.verified === true && body.verified !== existing.verified) {
    const reviewer = adminResult.userId
      ? await prisma.user.findUnique({ where: { clerkId: adminResult.userId }, select: { id: true } })
      : null
    data.verifiedAt = new Date()
    data.verifiedBy = reviewer?.id ?? null
    data.status = body.status ?? "active"
  }

  if (body.verified === false) {
    data.verifiedAt = null
    data.verifiedBy = null
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })
  }

  const company = await prisma.company.update({ where: { id: params.id }, data })
  return NextResponse.json(company)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  await prisma.company.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
