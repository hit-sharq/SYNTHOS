import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    const client = await prisma.client.findUnique({ where: { id: params.id } })
    if (!client) return NextResponse.json({ error: Errors.resources.clientNotFound }, { status: 404 })
    return NextResponse.json(client)
  } catch (error) {
    console.error("Failed to fetch client:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    const body = await req.json()
    const client = await prisma.client.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(client)
  } catch (error) {
    console.error("Failed to update client:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  try {
    await prisma.client.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to delete client:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
