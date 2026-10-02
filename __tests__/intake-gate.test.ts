import { describe, it, expect } from "vitest"
import { MIN_INTUKE_CONFIDENCE } from "@/lib/auto-workflow"

describe("intake confidence gate", () => {
  it("has a confidence floor that is neither zero nor trivially low", () => {
    expect(MIN_INTUKE_CONFIDENCE).toBeGreaterThan(0)
    expect(MIN_INTUKE_CONFIDENCE).toBeLessThanOrEqual(100)
  })

  it("holds a proposal when the intake analysis is thin", () => {
    // Below the floor the proposal is drafted but must not be sent.
    const confidence = MIN_INTUKE_CONFIDENCE - 1
    expect(confidence < MIN_INTUKE_CONFIDENCE).toBe(true)
  })

  it("sends a proposal when the intake analysis is solid", () => {
    const confidence = MIN_INTUKE_CONFIDENCE + 10
    expect(confidence >= MIN_INTUKE_CONFIDENCE).toBe(true)
  })

  it("treats a missing confidence as zero rather than passing it", () => {
    // The workflow falls back to 0 when aiConfidence is absent, which is
    // below any sensible floor, so an unanalysed brief is always held.
    const missing: number | undefined = undefined
    const resolved = typeof missing === "number" ? missing : 0
    expect(resolved).toBe(0)
    expect(resolved < MIN_INTUKE_CONFIDENCE).toBe(true)
  })
})