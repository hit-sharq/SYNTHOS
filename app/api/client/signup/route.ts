import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, company, clerkId } = body || {}

    if (!name?.trim() || !email?.trim() || !clerkId) {
      return NextResponse.json({ error: "Name, email, and Clerk ID are required." }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    const existingCompany = await prisma.company.findFirst({ where: { email: normalizedEmail } })

    if (existingUser) {
      if (existingUser.role === "talent") {
        return NextResponse.json({ error: "This email is already registered as a Talent. Talents and Clients use separate accounts. Please sign in with your Talent account, or use a different email to create a Client account." }, { status: 409 })
      }
      if (existingUser.role === "admin") {
        return NextResponse.json({ error: "This email is already registered as an Admin account. Admin accounts cannot be used for Client access." }, { status: 409 })
      }
      return NextResponse.json({ error: "An account with this email already exists. Please sign in instead." }, { status: 409 })
    }

    if (existingCompany) {
      return NextResponse.json({ error: "A company is already registered with this email. Each company email can only be used once." }, { status: 409 })
    }

    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        initials: initials || "TL",
        role: Role.client,
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role }, { status: 201 })
  } catch (error) {
    console.error("Failed to create talent account:", error)
    return NextResponse.json({ error: "Failed to create talent account" }, { status: 500 })
  }
}
