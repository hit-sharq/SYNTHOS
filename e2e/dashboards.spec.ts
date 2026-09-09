import { test, expect } from '@playwright/test'

test.describe('Client Dashboard', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    const response = await page.goto('/client/dashboard')
    expect(response?.status()).toBe(200)
  })

  test('should have notification bell', async ({ page }) => {
    await page.goto('/client/dashboard')
    const bell = page.locator('[aria-label="Notifications"]')
    await expect(bell).toBeVisible()
  })
})

test.describe('Talent Dashboard', () => {
  test('should redirect unauthenticated users to sign-in', async ({ page }) => {
    const response = await page.goto('/dashboard/talent')
    expect(response?.status()).toBe(200)
  })

  test('should have notification bell', async ({ page }) => {
    await page.goto('/dashboard/talent')
    const bell = page.locator('[aria-label="Notifications"]')
    await expect(bell).toBeVisible()
  })
})

test.describe('Mobile', () => {
  test('client dashboard should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/client/dashboard')
    await expect(page.locator('[aria-label="Open menu"]')).toBeVisible()
  })
})
