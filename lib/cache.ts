import { NextResponse } from "next/server"

type Entry<T> = { value: T; expires: number }

const store = new Map<string, Entry<unknown>>()

let hits = 0
let misses = 0

export const DEFAULT_TTL_MS = 30_000

export function cacheStats() {
  return {
    hits,
    misses,
    keys: store.size,
    hitRate: hits + misses === 0 ? 0 : Math.round((hits / (hits + misses)) * 100),
  }
}

export function clearCache() {
  store.clear()
  hits = 0
  misses = 0
}

/**
 * Per-process TTL cache for read-heavy endpoints.
 *
 * Each server instance keeps its own map, so this reduces database load per
 * instance rather than acting as a shared cache. It is intentionally simple
 * and bounded; a multi-instance deployment would put a shared store such as
 * Redis in front of it.
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const now = Date.now()
  const hit = store.get(key) as Entry<T> | undefined
  if (hit && hit.expires > now) {
    hits++
    return hit.value
  }

  misses++
  const value = await loader()
  store.set(key, { value, expires: now + ttlMs })
  return value
}

/** Bounds the map so a high-cardinality key set cannot exhaust memory. */
export function pruneCache(maxKeys = 500) {
  if (store.size <= maxKeys) return
  const now = Date.now()
  for (const [k, v] of store) {
    if (v.expires <= now) store.delete(k)
  }
  while (store.size > maxKeys) {
    const oldest = store.keys().next()
    if (oldest.done) break
    store.delete(oldest.value)
  }
}

/**
 * Cached JSON response. Adds a short shared-cache window so a CDN can absorb
 * repeat traffic, and a private marker so user-specific payloads are never
 * cached publicly.
 */
export function cachedJson<T>(body: T, ttlSeconds = 30, scope: "public" | "private" = "public") {
  const headers: Record<string, string> =
    scope === "public"
      ? { "Cache-Control": `public, max-age=0, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds}` }
      : { "Cache-Control": "private, no-store, max-age=0" }
  return NextResponse.json(body, { headers })
}