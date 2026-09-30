import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { Errors } from "@/lib/errors"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  if (adminIds.includes(userId)) {
    return NextResponse.json({ isAdmin: true })
  }

  return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })
}
