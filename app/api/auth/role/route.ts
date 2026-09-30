import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSessionUser } from "@/lib/auth"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ role: null, isAdmin: false })

  const user = await getSessionUser()
  if (!user) return NextResponse.json({ role: null, isAdmin: false })

  return NextResponse.json({
    role: user.role,
    isAdmin: user.role === "admin",
    companyId: user.companyId || null,
  })
}
