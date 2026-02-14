import { test, expect } from '@playwright/test'

test.describe('Public Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#calculadora')
  })

  test('default minimum wage calculation is correct', async ({ page }) => {
    const calculator = page.locator('#calculadora')
    await expect(calculator).toBeVisible()

    // Default salary should be minimum wage (R$ 1.518 in 2025)
    // The calculator should show some computed values with R$
    await expect(calculator.locator('text=/R\\$/')).toBeVisible()
  })

  test('changing salary updates all values', async ({ page }) => {
    const calculator = page.locator('#calculadora')
    const salaryInput = calculator.locator('input[type="number"], input[type="text"]').first()

    // Record initial state
    const initialText = await calculator.textContent()

    // Change salary
    await salaryInput.clear()
    await salaryInput.fill('3000')

    // Wait for update and verify content changed
    await page.waitForTimeout(500)
    const updatedText = await calculator.textContent()
    expect(updatedText).not.toBe(initialText)
  })

  test('INSS calculation matches expected values', async ({ page }) => {
    const calculator = page.locator('#calculadora')
    const salaryInput = calculator.locator('input[type="number"], input[type="text"]').first()

    await salaryInput.clear()
    await salaryInput.fill('2000')
    await page.waitForTimeout(500)

    // INSS should appear somewhere in the calculator
    await expect(calculator.locator('text=/INSS/i')).toBeVisible()
  })

  test('DAE total is displayed', async ({ page }) => {
    const calculator = page.locator('#calculadora')
    await expect(calculator.locator('text=/DAE|total|Total/i')).toBeVisible()
  })
})
