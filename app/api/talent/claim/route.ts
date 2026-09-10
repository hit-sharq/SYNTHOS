import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { Errors } from "@/lib/errors"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clerkId, email, name, initials } = body || {}

    if (!email?.trim() || !clerkId) {
      return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existing = await prisma.user.findFirst({ where: { email: normalizedEmail } })

    if (existing) {
      return NextResponse.json({ error: Errors.validation.duplicateEntry }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: (name?.trim() || email.split("@")[0]).trim(),
        initials: initials || "TL",
        role: Role.talent,
      },
    })

    const talent = await prisma.talent.create({
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
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
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
