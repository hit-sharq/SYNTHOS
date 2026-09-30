import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/api-auth"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  if (!(await isAdmin(userId))) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

  const body = await req.json()
  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      role: body.role,
    },
  })
  return NextResponse.json(user)
}
