import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"

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

  const body = await req.json()
  const company = await prisma.company.update({
    where: { id: params.id },
    data: {
      name: body.name,
      slug: body.slug,
      email: body.email,
      phone: body.phone,
      website: body.website,
      industry: body.industry,
      location: body.location,
      description: body.description,
      logo: body.logo,
      verified: body.verified,
      status: body.status,
    },
  })
  return NextResponse.json(company)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  await prisma.company.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
