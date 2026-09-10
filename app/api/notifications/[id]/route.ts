import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
  })

  if (!notification || notification.userId !== userId) {
    return NextResponse.json({ error: Errors.resources.notificationNotFound }, { status: 404 })
  }

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { read: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
  })

  if (!notification || notification.userId !== userId) {
    return NextResponse.json({ error: Errors.resources.notificationNotFound }, { status: 404 })
  }

  await prisma.notification.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ ok: true })
}
