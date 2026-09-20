import { CompanyShell } from "@/components/app/CompanyShell"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { getSessionEmail } from "@/lib/auth"

export default async function CompanyDashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const email = await getSessionEmail()
  if (!email) redirect("/")

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) redirect("/")

  if (user.role !== Role.client || !user.companyId) {
    redirect("/client/dashboard")
  }

  return <CompanyShell>{children}</CompanyShell>
}
