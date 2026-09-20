import { ClientShell } from "@/components/app/ClientShell"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { getSessionEmail } from "@/lib/auth"

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const email = await getSessionEmail()
  if (!email) redirect("/")

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) redirect("/")

  if (user.role !== Role.client) {
    redirect("/dashboard/overview")
  }

  return <ClientShell>{children}</ClientShell>
}
