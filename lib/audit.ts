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
    let actorEmail: string | undefined
    if (userId) {
      const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      }).then(r => r.json()).catch(() => null)
      actorEmail = clerkUser?.email_addresses?.[0]?.email_address
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
