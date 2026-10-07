import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { Errors } from "@/lib/errors"
import { readJson, isJsonError } from "@/lib/request"

export async function POST(req: Request) {
  try {
    const body = await readJson<any>(req)
    if (isJsonError(body)) return body
    const { name, email, phone, website, industry, location, slug, clerkId } = body

    if (!name || !email || !clerkId) {
      return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existingCompany = await prisma.company.findFirst({ where: { email: normalizedEmail } })
    if (existingCompany) {
      return NextResponse.json({ error: Errors.validation.duplicateEntry }, { status: 409 })
    }

    const company = await prisma.company.create({
      data: {
        name,
        email: normalizedEmail,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        phone: phone || "",
        website: website || "",
        industry: industry || "Other",
        location: location || "",
        status: "pending",
        verified: false,
      },
    })

    let user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email: normalizedEmail,
          name: name.trim(),
          initials: name.trim().split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
          role: Role.client,
          companyId: company.id,
        },
      })
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: Role.client, companyId: company.id },
      })
    }

    return NextResponse.json({ id: company.id, name: company.name, email: company.email, status: company.status }, { status: 201 })
  } catch (error) {
    console.error("Company signup error:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
