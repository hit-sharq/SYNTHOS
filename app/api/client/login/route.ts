export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSessionUser } from "@/lib/auth"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ user: null })
    }

    // Resolve by clerkId; the Clerk session id is not the database id.
    const user = await getSessionUser()

    return NextResponse.json({
      user: user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null,
    })
  } catch (error) {
    console.error("Failed to get client session:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
