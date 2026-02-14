import { test, expect } from '@playwright/test'

test.describe('FAQ Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faq')
  })

  test('FAQ page loads with all categories', async ({ page }) => {
    await expect(page).toHaveURL(/faq/)
    // Categories are section headings
    await expect(page.locator('text=Sobre o eSocial Doméstico')).toBeVisible()
  })

  test('accordion expands and collapses on click', async ({ page }) => {
    // Click the first question to expand
    const firstQuestion = page.locator('[data-state="closed"]').first()
    await firstQuestion.click()

    // Content should now be visible
    await expect(firstQuestion).toHaveAttribute('data-state', 'open')

    // Click again to collapse
    await firstQuestion.click()
    await expect(firstQuestion).toHaveAttribute('data-state', 'closed')
  })

  test('all 31 questions are present', async ({ page }) => {
    // Each question is a trigger in an accordion
    const questions = page.locator('[data-radix-collection-item], [role="button"]')
    expect(await questions.count()).toBe(31)
  })
})
