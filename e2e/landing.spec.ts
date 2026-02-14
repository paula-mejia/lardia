import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Lardia/)
  })

  test('calculator is visible and functional', async ({ page }) => {
    const calculator = page.locator('#calculadora')
    await expect(calculator).toBeVisible()

    // Change salary input and verify results update
    const salaryInput = calculator.locator('input[type="number"], input[type="text"]').first()
    await salaryInput.clear()
    await salaryInput.fill('2000')

    // Results should update (look for currency values)
    await expect(calculator.locator('text=/R\\$/')).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    // Blog link
    const blogLink = page.locator('nav a[href="/blog"]')
    await expect(blogLink).toBeVisible()

    // FAQ link
    const faqLink = page.locator('nav a[href="/faq"]')
    await expect(faqLink).toBeVisible()

    // Simulador link
    const simuladorLink = page.locator('nav a[href="/simulador"]')
    await expect(simuladorLink).toBeVisible()

    // Entrar link
    const entrarLink = page.locator('nav a[href="/login"]')
    await expect(entrarLink).toBeVisible()
  })

  test('pricing section shows 3 tiers', async ({ page }) => {
    const pricingSection = page.locator('text=Escolha o plano ideal para voce').locator('..')
    await expect(pricingSection).toBeVisible()

    // 3 pricing cards with R$ values
    const pricingCards = page.locator('section').filter({ hasText: 'Escolha o plano ideal' }).locator('.grid > div')
    await expect(pricingCards).toHaveCount(3)
  })

  test('footer links exist', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer.locator('a')).not.toHaveCount(0)
  })
})
