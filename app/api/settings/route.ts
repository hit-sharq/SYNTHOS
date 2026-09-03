export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

export async function GET() {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  const settings = await prisma.siteSetting.findMany({
    orderBy: { key: "asc" },
  })

  const map: Record<string, any> = {}
  for (const s of settings) {
    if (s.type === "json") {
      map[s.key] = JSON.parse(s.value)
    } else if (s.type === "boolean") {
      map[s.key] = s.value === "true"
    } else if (s.type === "number") {
      map[s.key] = Number(s.value)
    } else {
      map[s.key] = s.value
    }
  }

  return NextResponse.json({ settings: map })
}

export async function POST(req: Request) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  const body = await req.json()
  const results: any = {}

  for (const [key, value] of Object.entries(body.settings || {})) {
    const type = typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : Array.isArray(value) || typeof value === "object" ? "json" : "string"
    const stringValue = type === "json" ? JSON.stringify(value) : String(value)

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: stringValue, type, updatedAt: new Date() },
      create: { key, value: stringValue, type, description: key },
    })
    results[key] = value
  }

  return NextResponse.json({ settings: results })
}
