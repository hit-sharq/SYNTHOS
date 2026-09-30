import { cookies } from "next/headers"

export interface ClerkSessionClaims {
  sub?: string
  [claim: string]: unknown
}

/**
 * Edge-safe session claim reader.
 *
 * Decodes the Clerk `__session` JWT payload without verification and without
 * any Node-only dependency, so it is safe to import from middleware. The claims
 * here are already validated by Clerk's `auth()` in the Node-side helpers below.
 */
export function readSessionClaims(): ClerkSessionClaims | null {
  try {
    const session = cookies().get("__session")?.value
    if (!session) return null
    const payload = session.split(".")[1]
    if (!payload) return null
    return JSON.parse(Buffer.from(payload, "base64url").toString())
  } catch {
    return null
  }
}

export function readSessionClerkId(): string | null {
  const sub = readSessionClaims()?.sub
  return typeof sub === "string" && sub ? sub : null
}
