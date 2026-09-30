import { describe, it, expect } from "vitest"
import { readJson, isJsonError } from "@/lib/request"

function req(body: string) {
  return new Request("http://localhost/api/x", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
}

describe("readJson", () => {
  it("parses a valid object body", async () => {
    const result = await readJson<{ a: number }>(req('{"a":1}'))
    expect(isJsonError(result)).toBe(false)
    expect(result).toEqual({ a: 1 })
  })

  it("parses an empty object", async () => {
    const result = await readJson(req("{}"))
    expect(isJsonError(result)).toBe(false)
    expect(result).toEqual({})
  })

  it("returns a 400 response for a malformed body", async () => {
    const result = await readJson(req("not-json"))
    expect(isJsonError(result)).toBe(true)
    const res = result as Response
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: expect.any(String) })
  })

  it("returns a 400 for a truncated body", async () => {
    const result = await readJson(req('{"a":'))
    expect(isJsonError(result)).toBe(true)
    expect((result as Response).status).toBe(400)
  })

  it("does not throw on malformed input", async () => {
    await expect(readJson(req("<<<>>>"))).resolves.toBeDefined()
  })

  it("treats a NextResponse as an error result and a plain object as data", () => {
    expect(isJsonError({ a: 1 })).toBe(false)
    expect(isJsonError(null)).toBe(false)
    expect(isJsonError(undefined)).toBe(false)
  })
})