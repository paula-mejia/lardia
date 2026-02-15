import { test, expect } from '@playwright/test'

test.describe('Simulator Page (/simulador)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador')
  })

  test('page loads with simulator heading and salary input', async ({ page }) => {
    await expect(page).toHaveURL(/simulador/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
    const salaryInput = page.locator('input').first()
    await expect(salaryInput).toBeVisible()
  })

  test('enter salary of R$2.500 and verify INSS, FGTS values appear', async ({ page }) => {
    const salaryInput = page.locator('input').first()
    await salaryInput.clear()
    await salaryInput.fill('2500')
    await page.waitForTimeout(500)

    // INSS patronal should be displayed
    await expect(page.locator('text=/INSS/i')).toBeVisible()
    // FGTS should be displayed
    await expect(page.locator('text=/FGTS/i')).toBeVisible()
    // Should show R$ currency values
    await expect(page.locator('text=/R\\$/')).toBeVisible()
  })

  test('enter salary of R$3.000 and verify annual cost breakdown', async ({ page }) => {
    const salaryInput = page.locator('input').first()
    await salaryInput.clear()
    await salaryInput.fill('3000')
    await page.waitForTimeout(500)

    // Annual cost / custo anual should appear
    await expect(page.locator('text=/anual/i')).toBeVisible()
    // Multiple R$ values for the breakdown
    const currencyValues = page.locator('text=/R\\$/')
    expect(await currencyValues.count()).toBeGreaterThanOrEqual(3)
  })

  test('changing salary updates the displayed results', async ({ page }) => {
    const salaryInput = page.locator('input').first()

    await salaryInput.clear()
    await salaryInput.fill('1518')
    await page.waitForTimeout(300)
    const firstResult = await page.locator('main').textContent()

    await salaryInput.clear()
    await salaryInput.fill('4000')
    await page.waitForTimeout(300)
    const secondResult = await page.locator('main').textContent()

    expect(firstResult).not.toBe(secondResult)
  })

  test('GILRAT/accident insurance line is shown', async ({ page }) => {
    const salaryInput = page.locator('input').first()
    await salaryInput.clear()
    await salaryInput.fill('2000')
    await page.waitForTimeout(300)

    // GILRAT or seguro acidente should appear
    await expect(page.locator('text=/GILRAT|seguro|acidente/i')).toBeVisible()
  })

  test('13th salary and vacation costs are included', async ({ page }) => {
    const salaryInput = page.locator('input').first()
    await salaryInput.clear()
    await salaryInput.fill('2000')
    await page.waitForTimeout(300)

    await expect(page.locator('text=/13|décimo/i')).toBeVisible()
    await expect(page.locator('text=/férias|vacation/i')).toBeVisible()
  })
})
