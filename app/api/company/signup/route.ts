import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, website, industry, location, slug, clerkId } = body

    if (!name || !email || !clerkId) {
      return NextResponse.json({ error: "Name, email, and Clerk ID are required." }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    const existingCompany = await prisma.company.findFirst({ where: { email: normalizedEmail } })

    if (existingUser || existingCompany) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    const company = await prisma.company.create({
      data: {
        name,
        email,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        phone: phone || "",
        website: website || "",
        industry: industry || "Other",
        location: location || "",
        status: "pending",
        verified: false,
      },
    })

    await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        initials: name.trim().split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
        role: Role.client,
        companyId: company.id,
      },
    })

    return NextResponse.json({ id: company.id, name: company.name, email: company.email, status: company.status }, { status: 201 })
  } catch (error) {
    console.error("Company signup error:", error)
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
  }
}
