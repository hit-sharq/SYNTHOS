import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  const { getSessionEmail } = await import("@/lib/auth")
  const email = await getSessionEmail()
  if (!email) return null
  return prisma.user.findUnique({ where: { email } })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const { brief, tone, style } = body
  if (!brief) return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })

  const prompt = `You are a professional creative freelancer on Synthos. Generate a project proposal based on this brief:\n\n${brief}\n\nTone: ${tone || "professional"}\nStyle: ${style || "balanced"}\n\nStructure your response as:\n1. Overview (2-3 sentences)\n2. Approach (3-5 bullet points)\n3. Timeline (2-3 weeks)\n4. Investment ($XXX for X weeks)\n5. Why Me (2-3 sentences about relevant experience)`

  try {
    const response = await fetch(`${process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta"}/models/gemini-2.0-flash:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY || "",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    })

    if (!response.ok) throw new Error("Gemini API error")
    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Proposal generation failed. Please try again."

    return NextResponse.json({ proposal: text })
  } catch {
    return NextResponse.json({ proposal: "Unable to generate proposal. Please check your API configuration." }, { status: 500 })
  }
}
