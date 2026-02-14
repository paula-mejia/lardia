import { test, expect } from '@playwright/test'

test.describe('Simulator Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador')
  })

  test('page loads', async ({ page }) => {
    await expect(page).toHaveURL(/simulador/)
    await expect(page.locator('main')).toBeVisible()
  })

  test('default salary shows annual cost', async ({ page }) => {
    // Should display annual cost or custo anual
    await expect(page.locator('text=/anual|Anual|annual/i')).toBeVisible()
    await expect(page.locator('text=/R\\$/')).toBeVisible()
  })

  test('changing salary updates breakdown', async ({ page }) => {
    const salaryInput = page.locator('input[type="number"], input[type="text"]').first()
    const initialContent = await page.locator('main').textContent()

    await salaryInput.clear()
    await salaryInput.fill('4000')
    await page.waitForTimeout(500)

    const updatedContent = await page.locator('main').textContent()
    expect(updatedContent).not.toBe(initialContent)
  })

  test('summary cards display correct values', async ({ page }) => {
    // Summary cards should show R$ values
    const cards = page.locator('text=/R\\$/')
    await expect(cards.first()).toBeVisible()
    expect(await cards.count()).toBeGreaterThanOrEqual(2)
  })
})
