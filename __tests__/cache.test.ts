import { describe, it, expect, beforeEach } from "vitest"
import { cached, cacheStats, clearCache, pruneCache, cachedJson, DEFAULT_TTL_MS } from "@/lib/cache"

describe("cache", () => {
  beforeEach(() => {
    clearCache()
  })

  it("calls the loader once per key and serves the rest from cache", async () => {
    let calls = 0
    const loader = async () => {
      calls++
      return { n: calls }
    }

    expect(await cached("k", 1000, loader)).toEqual({ n: 1 })
    expect(await cached("k", 1000, loader)).toEqual({ n: 1 })
    expect(await cached("k", 1000, loader)).toEqual({ n: 1 })
    expect(calls).toBe(1)
  })

  it("reloads after the ttl expires", async () => {
    let calls = 0
    const loader = async () => ++calls

    expect(await cached("k", 20, loader)).toBe(1)
    await new Promise((r) => setTimeout(r, 40))
    expect(await cached("k", 20, loader)).toBe(2)
  })

  it("keeps different keys apart", async () => {
    const a = await cached("a", 1000, async () => "A")
    const b = await cached("b", 1000, async () => "B")
    expect([a, b]).toEqual(["A", "B"])
  })

  it("records hits and misses", async () => {
    await cached("k", 1000, async () => 1)
    await cached("k", 1000, async () => 1)
    const stats = cacheStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBe(50)
  })

  it("bounds the map so a high-cardinality key set cannot exhaust memory", async () => {
    for (let i = 0; i < 20; i++) {
      await cached(`key-${i}`, 60_000, async () => i)
    }
    pruneCache(5)
    const stats = cacheStats()
    expect(stats.keys).toBeLessThanOrEqual(5)
  })

  it("defaults to a short window", () => {
    expect(DEFAULT_TTL_MS).toBeLessThanOrEqual(60_000)
  })
})

describe("cachedJson", () => {
  it("marks public payloads as CDN cacheable", async () => {
    const res = cachedJson({ a: 1 }, 30)
    expect(res.headers.get("Cache-Control")).toContain("public")
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=30")
  })

  it("keeps private payloads out of shared caches", async () => {
    const res = cachedJson({ a: 1 }, 30, "private")
    expect(res.headers.get("Cache-Control")).toContain("private")
    expect(res.headers.get("Cache-Control")).not.toContain("s-maxage")
  })

  it("returns the body it was given", async () => {
    expect(await cachedJson({ hello: "world" }).json()).toEqual({ hello: "world" })
  })
})