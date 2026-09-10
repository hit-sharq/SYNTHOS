import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.companyId) return NextResponse.json({ error: Errors.access.roleRestricted }, { status: 403 })

    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      include: { users: { select: { id: true, name: true, email: true } } },
    })

    if (!company) return NextResponse.json({ error: Errors.resources.companyNotFound }, { status: 404 })

    return NextResponse.json({
      id: company.id,
      name: company.name,
      slug: company.slug,
      email: company.email,
      phone: company.phone,
      website: company.website,
      industry: company.industry,
      location: company.location,
      description: company.description,
      logo: company.logo,
      verified: company.verified,
      status: company.status,
      joinedAt: company.joinedAt,
      users: company.users,
    })
  } catch (error) {
    console.error("Failed to fetch company profile:", error)
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.companyId) return NextResponse.json({ error: Errors.access.roleRestricted }, { status: 403 })

    const body = await req.json()
    const company = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        name: body.name,
        phone: body.phone,
        website: body.website,
        industry: body.industry,
        location: body.location,
        description: body.description,
        logo: body.logo,
      },
    })

    return NextResponse.json({
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      website: company.website,
      industry: company.industry,
      location: company.location,
      description: company.description,
      logo: company.logo,
      verified: company.verified,
      status: company.status,
    })
  } catch (error) {
    console.error("Failed to update company profile:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
