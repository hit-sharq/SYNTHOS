import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"
import { readJson, isJsonError } from "@/lib/request"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  if (!adminIds.includes(userId)) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

  const body = await readJson<any>(req)
  if (isJsonError(body)) return body
  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      role: body.role,
    },
  })
  return NextResponse.json(user)
}
