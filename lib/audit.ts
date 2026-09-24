import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function logAudit(params: {
  action: string
  targetType: string
  targetId?: string
  targetName?: string
  changes?: any
  ip?: string
  userAgent?: string
}) {
  try {
    const { userId } = await auth()
    let actorEmail: string | null = null
    if (userId) {
      const { getSessionEmail } = await import("@/lib/auth")
      actorEmail = await getSessionEmail()
    }
    await prisma.auditLog.create({
      data: {
        actorId: userId || undefined,
        actorEmail,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        targetName: params.targetName,
        changes: params.changes,
        ip: params.ip,
        userAgent: params.userAgent,
      },
    })
  } catch (e) {
    console.error("Failed to write audit log:", e)
  }
}
