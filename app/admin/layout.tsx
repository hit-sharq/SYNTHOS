import { AdminShell } from "@/components/app/AdminShell"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { isAdminUser } from "@/lib/api-auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  // Must not redirect to another /admin path: this layout guards the whole
  // /admin tree, so that would re-enter here and loop forever.
  if (!isAdminUser(userId)) redirect("/dashboard/talent")

  return <AdminShell>{children}</AdminShell>
}
