import { cookies } from "next/headers"

export async function getSessionEmail(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("__session")?.value
    if (!session) return null
    const payload = session.split(".")[1]
    if (!payload) return null
    const decoded = Buffer.from(payload, "base64url").toString()
    const data = JSON.parse(decoded)
    return data.email || null
  } catch {
    return null
  }
}
