import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { Errors } from "@/lib/errors"
import { getSessionEmail } from "@/lib/auth"

export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    return { userId: null as string | null, error: NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 }) }
  }
  return { userId, error: null as null | NextResponse }
}

/**
 * Admin is env-only: ADMIN_USER_IDS holds Clerk user ids, so it must always
 * be compared against the Clerk session userId, never a database record id.
 */
export function getAdminIds(): string[] {
  return (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
}

export function isAdminUser(clerkUserId: string | null | undefined): boolean {
  if (!clerkUserId) return false
  return getAdminIds().includes(clerkUserId)
}

export async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) {
    return { userId: null as string | null, error: NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 }) }
  }
  if (!isAdminUser(userId)) {
    return { userId: null as string | null, error: NextResponse.json({ error: Errors.access.forbidden }, { status: 403 }) }
  }
  return { userId, error: null as null | NextResponse }
}

export async function getUserEmail(): Promise<string | null> {
  return getSessionEmail()
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  const email = await getUserEmail()
  if (!email) return null
  return getUserByEmail(email)
}

export async function isProjectAccessible(projectId: string, userId?: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { accessible: false, project: null, error: NextResponse.json({ error: Errors.access.notFound }, { status: 404 }) }

  if (!userId) {
    return { accessible: false, project: null, error: NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 }) }
  }

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  if (adminIds.includes(userId)) {
    return { accessible: true, project, error: null }
  }

  const email = await getUserEmail()
  if (!email) {
    return { accessible: false, project: null, error: NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 }) }
  }

  const user = await getUserByEmail(email)
  if (!user) {
    return { accessible: false, project: null, error: NextResponse.json({ error: Errors.access.forbidden }, { status: 403 }) }
  }

  if (project.ownerId === user.id || project.clientId === user.id) {
    return { accessible: true, project, error: null }
  }

  return { accessible: false, project: null, error: NextResponse.json({ error: Errors.access.forbidden }, { status: 403 }) }
}
