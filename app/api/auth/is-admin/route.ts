import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/api-auth"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ isAdmin: false })

  return NextResponse.json({ isAdmin: await isAdmin(userId) })
}
