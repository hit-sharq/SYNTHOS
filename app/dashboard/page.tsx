import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"

export default async function DashboardIndex() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await getSessionUser()
  if (!user) redirect("/")

  if (user.role === Role.admin) {
    redirect("/dashboard/overview")
  }

  if (user.role === Role.client) {
    redirect("/client/dashboard")
  }

  redirect("/dashboard/talent")
}
