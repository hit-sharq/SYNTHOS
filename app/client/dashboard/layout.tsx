import { ClientShell } from "@/components/app/ClientShell"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { ensureLocalUser } from "@/lib/auth"

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const local = await ensureLocalUser()
  if (!local) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: local.userId } })
  if (!user) redirect("/")

  if (user.role !== Role.client) {
    redirect("/dashboard/talent")
  }

  return <ClientShell>{children}</ClientShell>
}
