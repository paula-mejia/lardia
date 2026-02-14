import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
  })

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
  })

  test('invalid email shows error on login', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    const passwordInput = page.locator('input[type="password"], input[name="password"]')

    await emailInput.fill('not-an-email')
    await passwordInput.fill('somepassword123')
    await page.locator('button[type="submit"]').click()

    // Expect an error message to appear
    await expect(page.locator('text=/erro|inválido|invalid|error/i')).toBeVisible({ timeout: 10_000 })
  })

  test('empty form shows validation errors on login', async ({ page }) => {
    await page.goto('/login')
    await page.locator('button[type="submit"]').click()

    // Browser native validation or custom error should prevent empty submission
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    // Check that the field is marked invalid or an error message appears
    const isRequired = await emailInput.getAttribute('required')
    expect(isRequired !== null || await page.locator('text=/obrigatório|required|erro|error/i').isVisible()).toBeTruthy()
  })
})
