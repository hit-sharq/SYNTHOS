import { auth } from "@clerk/nextjs/server"
import { cookies } from "next/headers"

export async function getSessionEmail(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("__session")?.value
    if (!session) return null
    const payload = session.split(".")[1]
    if (!payload) return null
    const decoded = Buffer.from(payload, "base64url").toString()
    const data = JSON.parse(decoded)
    return data.email || null
  } catch {
    return null
  }
}

export async function getCurrentUser(select?: Record<string, any>) {
  const { userId } = await auth()
  if (!userId) return null

  const email = await getSessionEmail()
  if (!email) return null

  const { prisma } = await import("@/lib/prisma")
  const user = await prisma.user.findUnique({
    where: { email },
    select: select || { id: true },
  })
  return user
}
