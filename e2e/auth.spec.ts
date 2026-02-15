import { test, expect } from '@playwright/test'

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  test('signup page loads with email, password and confirm password fields', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#confirm-password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('submitting with mismatched passwords shows error', async ({ page }) => {
    await page.locator('#email').fill('maria.silva@exemplo.com')
    await page.locator('#password').fill('senhaSegura123')
    await page.locator('#confirm-password').fill('senhaDiferente456')
    await page.locator('button[type="submit"]').click()

    await expect(page.locator('text=/senhas não coincidem/i')).toBeVisible()
  })

  test('submitting with short password shows error', async ({ page }) => {
    await page.locator('#email').fill('joao.santos@exemplo.com')
    await page.locator('#password').fill('123')
    await page.locator('#confirm-password').fill('123')
    await page.locator('button[type="submit"]').click()

    await expect(page.locator('text=/pelo menos 6 caracteres/i')).toBeVisible()
  })

  test('empty form submission is blocked by required fields', async ({ page }) => {
    await page.locator('button[type="submit"]').click()

    // Email field has required attribute, browser blocks submission
    const emailInput = page.locator('#email')
    expect(await emailInput.getAttribute('required')).not.toBeNull()
  })

  test('link to login page is visible', async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]')
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toContainText('Entrar')
  })
})

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('login page loads with email and password fields', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Entrar')
  })

  test('submitting with invalid credentials shows error message', async ({ page }) => {
    await page.locator('#email').fill('usuario.falso@exemplo.com')
    await page.locator('#password').fill('senhaErrada123')
    await page.locator('button[type="submit"]').click()

    // App shows "E-mail ou senha incorretos."
    await expect(page.locator('text=/incorretos|inválido|error|erro/i')).toBeVisible({ timeout: 10_000 })
  })

  test('empty form submission is blocked by required fields', async ({ page }) => {
    await page.locator('button[type="submit"]').click()

    const emailInput = page.locator('#email')
    expect(await emailInput.getAttribute('required')).not.toBeNull()
    const passwordInput = page.locator('#password')
    expect(await passwordInput.getAttribute('required')).not.toBeNull()
  })

  test('link to signup page is visible', async ({ page }) => {
    const signupLink = page.locator('a[href="/signup"]')
    await expect(signupLink).toBeVisible()
    await expect(signupLink).toContainText('Criar conta')
  })
})
