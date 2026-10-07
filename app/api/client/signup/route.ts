import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { Errors } from "@/lib/errors"
import { readJson, isJsonError } from "@/lib/request"

export async function POST(req: Request) {
  try {
    const body = await readJson<any>(req)
    if (isJsonError(body)) return body
    const { name, email, company, clerkId } = body || {}

    if (!name?.trim() || !email?.trim() || !clerkId) {
      return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: Errors.validation.duplicateEntry }, { status: 409 })
    }

    let user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      const initials = name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

      user = await prisma.user.create({
        data: {
          clerkId,
          email: normalizedEmail,
          name: name.trim(),
          initials: initials || "TL",
          role: Role.client,
        },
      })
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: Role.client },
      })
    }

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role }, { status: 201 })
  } catch (error) {
    console.error("Failed to create talent account:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
