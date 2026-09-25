import { cookies } from "next/headers"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

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