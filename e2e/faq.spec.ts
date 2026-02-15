import { test, expect } from '@playwright/test'

test.describe('FAQ Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faq')
  })

  test('FAQ page loads with heading', async ({ page }) => {
    await expect(page).toHaveURL(/faq/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('FAQ categories/sections are visible', async ({ page }) => {
    // Should show eSocial-related category
    await expect(page.locator('text=/eSocial/i').first()).toBeVisible()
  })

  test('accordion expands on click to reveal answer', async ({ page }) => {
    const trigger = page.locator('[data-state="closed"]').first()
    await expect(trigger).toBeVisible()

    await trigger.click()
    await expect(trigger).toHaveAttribute('data-state', 'open')
  })

  test('accordion collapses on second click', async ({ page }) => {
    const trigger = page.locator('[data-state="closed"]').first()
    await trigger.click()
    await expect(trigger).toHaveAttribute('data-state', 'open')

    await trigger.click()
    await expect(trigger).toHaveAttribute('data-state', 'closed')
  })

  test('multiple questions are listed', async ({ page }) => {
    const questions = page.locator('[data-radix-collection-item], [role="button"]')
    expect(await questions.count()).toBeGreaterThanOrEqual(10)
  })

  test('expanding an accordion reveals text content', async ({ page }) => {
    const trigger = page.locator('[data-state="closed"]').first()
    await trigger.click()

    // The content panel should now be visible with text
    const content = page.locator('[data-state="open"] + [role="region"], [data-state="open"] ~ [role="region"]').first()
    await expect(content).toBeVisible()
    const text = await content.textContent()
    expect(text!.length).toBeGreaterThan(10)
  })
})
