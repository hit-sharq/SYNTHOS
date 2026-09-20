import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { getSessionEmail } from "@/lib/auth"

export default async function DashboardIndex() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map(id => id.trim()).filter(Boolean) || []
  if (adminIds.includes(userId)) {
    redirect("/dashboard/overview")
  }

  const email = await getSessionEmail()
  if (!email) redirect("/")

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) redirect("/")

  if (user.role === Role.client) {
    redirect("/client/dashboard")
  }

  redirect("/dashboard/talent")
}
