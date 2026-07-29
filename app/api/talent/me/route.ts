export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }).then(r => r.json()).catch(() => null)

    const email = clerkUser?.email_addresses?.[0]?.email_address || null
    if (!email) return NextResponse.json({ error: "No email found" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.role !== Role.talent) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const talent = await prisma.talent.findUnique({ where: { userId: user.id } })
    if (!talent) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({
      id: talent.id,
      userId: talent.userId,
      name: talent.name,
      email: talent.email,
      skills: talent.skills,
      experience: talent.experience,
      rating: talent.rating,
      availability: talent.availability,
      rate: talent.rate,
      portfolio: talent.portfolio,
      notes: talent.notes,
    })
  } catch (error) {
    console.error("Failed to fetch talent profile:", error)
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }).then(r => r.json()).catch(() => null)

    const email = clerkUser?.email_addresses?.[0]?.email_address || null
    if (!email) return NextResponse.json({ error: "No email found" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.role !== Role.talent) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await req.json()
    const talent = await prisma.talent.update({
      where: { userId: user.id },
      data: {
        skills: body.skills,
        experience: body.experience,
        rating: body.rating,
        availability: body.availability,
        rate: body.rate,
        portfolio: body.portfolio,
        notes: body.notes,
      },
    })

    return NextResponse.json({
      id: talent.id,
      userId: talent.userId,
      name: talent.name,
      email: talent.email,
      skills: talent.skills,
      experience: talent.experience,
      rating: talent.rating,
      availability: talent.availability,
      rate: talent.rate,
      portfolio: talent.portfolio,
      notes: talent.notes,
    })
  } catch (error) {
    console.error("Failed to update talent profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
