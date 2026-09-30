import { NextResponse } from "next/server"
import { Errors } from "@/lib/errors"

/**
 * Reads and parses a JSON request body.
 *
 * `Request.json()` throws a SyntaxError on a malformed body, which surfaces as
 * an unhandled 500. Callers should use this so bad input returns a 400 with a
 * consistent message instead.
 *
 * Returns the parsed value, or a NextResponse to be returned directly by the
 * route handler:
 *
 *   const body = await readJson(req)
 *   if (isJsonError(body)) return body
 */
export async function readJson<T = any>(req: Request): Promise<T | NextResponse> {
  try {
    return (await req.json()) as T
  } catch {
    return NextResponse.json({ error: Errors.validation.invalidFormat }, { status: 400 })
  }
}

export function isJsonError(result: unknown): result is NextResponse {
  return result instanceof NextResponse
}