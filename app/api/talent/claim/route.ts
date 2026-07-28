export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clerkId, email, name, initials } = body || {}

    if (!email?.trim() || !clerkId) {
      return NextResponse.json({ error: "Email and Clerk ID are required." }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existing = await prisma.user.findFirst({ where: { email: normalizedEmail } })

    if (existing) {
      if (existing.role === "talent") {
        const talent = await prisma.talent.findUnique({ where: { userId: existing.id } })
        return NextResponse.json({ userId: existing.id, talentId: talent?.id }, { status: 200 })
      }
      await prisma.user.update({ where: { id: existing.id }, data: { role: "talent" } })
      const talent = await prisma.talent.upsert({
        where: { userId: existing.id },
        update: {},
        create: {
          userId: existing.id,
          name: existing.name,
          email: existing.email,
          position: "creative",
          skills: [],
          experience: 0,
          rating: 0,
          availability: "available",
          rate: "",
          notes: "",
        },
      })
      return NextResponse.json({ userId: existing.id, talentId: talent.id }, { status: 200 })
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: (name?.trim() || email.split("@")[0]).trim(),
        initials: initials || "TL",
        role: "talent",
      },
    })

    const talent = await prisma.talent.create({
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        position: "creative",
        skills: [],
        experience: 0,
        rating: 0,
        availability: "available",
        rate: "",
        notes: "",
      },
    })

    return NextResponse.json({ userId: user.id, talentId: talent.id }, { status: 201 })
  } catch (error) {
    console.error("Failed to claim talent profile:", error)
    return NextResponse.json({ error: "Failed to create talent profile" }, { status: 500 })
  }
}
