import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function sendNotification(params: {
  userId?: string
  userIds?: string[]
  title: string
  message: string
  kind?: string
  refId?: string
}) {
  const userIds = params.userIds || (params.userId ? [params.userId] : [])
  if (userIds.length === 0) return

  await prisma.notification.createMany({
    data: userIds.map(userId => ({
      userId,
      title: params.title,
      message: params.message,
      kind: params.kind || "info",
      refId: params.refId,
    })),
  })
}

export async function notifyAdmins(params: {
  title: string
  message: string
  kind?: string
  refId?: string
}) {
  const admins = await prisma.user.findMany({
    where: { role: Role.admin },
    select: { id: true },
  })
  if (admins.length === 0) return

  await prisma.notification.createMany({
    data: admins.map(({ id }) => ({
      userId: id,
      title: params.title,
      message: params.message,
      kind: params.kind || "info",
      refId: params.refId,
    })),
  })
}
