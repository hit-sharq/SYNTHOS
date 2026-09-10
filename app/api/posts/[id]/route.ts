import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) return NextResponse.json({ error: Errors.access.notFound }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  const body = await req.json()
  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage,
      kind: body.kind,
      status: body.status,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      authorId: body.authorId,
      authorName: body.authorName,
      tags: body.tags,
    },
  })
  return NextResponse.json(post)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  await prisma.post.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
