import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { ensureLocalUser } from "@/lib/auth"

export default async function DashboardIndex() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map(id => id.trim()).filter(Boolean) || []
  if (adminIds.includes(userId)) {
    redirect("/admin/workflow/overview")
  }

  const local = await ensureLocalUser()
  if (!local) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: local.userId } })
  if (!user) redirect("/")

  if (user.role === Role.client) {
    redirect(user.companyId ? "/company/dashboard" : "/client/dashboard")
  }

  redirect("/dashboard/talent")
}
