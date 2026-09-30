import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

/**
 * Resolves the signed-in user to a database record.
 *
 * Clerk's session token is verified by `auth()`, and its `sub` claim is the
 * Clerk user id. Clerk's default claims do not include an email address, so
 * the lookup is keyed on `clerkId` rather than email.
 *
 * Node-only: uses Prisma, so it must not be imported from middleware.
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
