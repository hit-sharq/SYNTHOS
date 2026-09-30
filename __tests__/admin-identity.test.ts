import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { isAdminUser, getAdminIds } from "@/lib/api-auth"

const ORIGINAL = process.env.ADMIN_USER_IDS

describe("env-only admin identity", () => {
  afterEach(() => {
    process.env.ADMIN_USER_IDS = ORIGINAL
  })

  it("reads and trims the admin id list from env", () => {
    process.env.ADMIN_USER_IDS = "user_a, user_b ,user_c"
    expect(getAdminIds()).toEqual(["user_a", "user_b", "user_c"])
  })

  it("returns an empty list when the env var is unset", () => {
    delete process.env.ADMIN_USER_IDS
    expect(getAdminIds()).toEqual([])
  })

  it("matches a Clerk user id in the list", () => {
    process.env.ADMIN_USER_IDS = "user_a,user_b"
    expect(isAdminUser("user_a")).toBe(true)
    expect(isAdminUser("user_b")).toBe(true)
  })

  it("rejects a Clerk user id that is not listed", () => {
    process.env.ADMIN_USER_IDS = "user_a"
    expect(isAdminUser("user_zzz")).toBe(false)
  })

  it("rejects null and undefined sessions", () => {
    process.env.ADMIN_USER_IDS = "user_a"
    expect(isAdminUser(null)).toBe(false)
    expect(isAdminUser(undefined)).toBe(false)
    expect(isAdminUser("")).toBe(false)
  })

  it("does not match a database id, since the list holds Clerk ids only", () => {
    process.env.ADMIN_USER_IDS = "user_a"
    expect(isAdminUser("clx0abcdefghijklmnop")).toBe(false)
  })
})
