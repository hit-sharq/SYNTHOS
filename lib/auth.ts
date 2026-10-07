import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

/**
 * Resolves the signed-in user to a database record.
 */
export async function getSessionUser() {
  const { userId } = await auth()
  if (!userId) return null
  return prisma.user.findUnique({ where: { clerkId: userId } })
}

export async function getSessionEmail(): Promise<string | null> {
  const user = await getSessionUser()
  return user?.email || null
}

export async function getCurrentUser(select?: Record<string, any>) {
  const user = await getSessionUser()
  if (!user) return null
  if (select) {
    return prisma.user.findUnique({ where: { id: user.id }, select })
  }
  return user
}

/**
 * Ensures a local User record exists for the current Clerk session.
 * If the user signed up through Clerk but has never hit a signup flow that
 * creates a local record, this creates one with a sensible default role.
 */
export async function ensureLocalUser(): Promise<{ userId: string; email: string; isNew: boolean } | null> {
  const { userId } = await auth()
  if (!userId) return null

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (existing) {
    return { userId: existing.id, email: existing.email, isNew: false }
  }

  const name = "New User"
  const initials = "NU"
  const randomEmail = `user_${userId.slice(0, 8)}_${Date.now().toString(36)}@pending.synthos.co.ke`

  try {
    const user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: randomEmail,
        name,
        initials,
        role: Role.talent,
      },
    })

    return { userId: user.id, email: user.email, isNew: true }
  } catch (error: any) {
    if (error.code === "P2002") {
      const retry = await prisma.user.findUnique({ where: { clerkId: userId } })
      if (retry) {
        return { userId: retry.id, email: retry.email, isNew: false }
      }
    }
    throw error
  }
}
