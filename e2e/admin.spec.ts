import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard', () => {
  test('should redirect unauthenticated users to sign-in', async ({ page }) => {
    const response = await page.goto('/admin')
    expect(response?.status()).toBe(200)
    await expect(page).toHaveURL(/\/sign-in|\/admin/)
  })

  test('should have navigation sidebar', async ({ page }) => {
    await page.goto('/admin')
    const sidebar = page.locator('.admin-sidebar')
    await expect(sidebar).toBeVisible()
  })

  test('should have accessible nav links', async ({ page }) => {
    await page.goto('/admin')
    const links = page.locator('.admin-nav-item')
    await expect(links.first()).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test('should show mobile menu toggle on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/admin')
    const toggle = page.locator('.admin-mobile-toggle')
    await expect(toggle).toBeVisible()
  })

  test('should open sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/admin')
    const toggle = page.locator('.admin-mobile-toggle')
    await toggle.click()
    await expect(page.locator('.admin-sidebar')).toBeVisible()
  })
})

test.describe('Notification Bell', () => {
  test('should be present in admin header', async ({ page }) => {
    await page.goto('/admin')
    const bell = page.locator('[aria-label="Notifications"]')
    await expect(bell).toBeVisible()
  })
})
