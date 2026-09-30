export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { readJson, isJsonError } from "@/lib/request"
import { Errors } from "@/lib/errors"

export async function PATCH(req: Request) {
  const parsed = await readJson<any>(req)
  if (isJsonError(parsed)) return parsed
  const { projectId, group, id: insightId, text, status } = parsed

  if (!insightId) {
    return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })
  }

  const insight = await prisma.insight.update({
    where: { id: insightId },
    data: { ...(text !== undefined ? { text } : {}), ...(status ? { status: status as any } : {}) },
  })
  return NextResponse.json(insight)
}
