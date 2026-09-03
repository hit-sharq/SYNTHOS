export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    const talent = await prisma.talent.findUnique({ where: { id: params.id } })
    if (!talent) return NextResponse.json({ error: "Talent not found" }, { status: 404 })
    return NextResponse.json(talent)
  } catch (error) {
    console.error("Failed to fetch talent:", error)
    return NextResponse.json({ error: "Failed to load talent" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    const body = await req.json()
    const talent = await prisma.talent.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(talent)
  } catch (error) {
    console.error("Failed to update talent:", error)
    return NextResponse.json({ error: "Failed to update talent" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    await prisma.talent.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to delete talent:", error)
    return NextResponse.json({ error: "Failed to remove talent" }, { status: 500 })
  }
}
