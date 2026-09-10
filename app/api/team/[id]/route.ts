import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    const member = await prisma.teamMember.findUnique({ where: { id: params.id } })
    if (!member) return NextResponse.json({ error: Errors.resources.userNotFound }, { status: 404 })
    return NextResponse.json(member)
  } catch (error) {
    console.error("Failed to fetch team member:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    const body = await req.json()
    const member = await prisma.teamMember.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(member)
  } catch (error) {
    console.error("Failed to update team member:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    await prisma.teamMember.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to delete team member:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
