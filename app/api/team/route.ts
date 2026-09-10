import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"

export async function GET() {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error("Failed to fetch team members:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    const body = await req.json()
    const member = await prisma.teamMember.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        skills: body.skills || [],
        availability: body.availability || "available",
        avatar: body.avatar,
        description: body.description,
        calendarJson: body.calendarJson,
        notes: body.notes,
      },
    })
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Failed to create team member:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
