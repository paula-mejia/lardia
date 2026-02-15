import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads with correct branding and title', async ({ page }) => {
    await expect(page).toHaveTitle(/LarDia/)
    await expect(page.locator('nav').getByText('LarDia')).toBeVisible()
  })

  test('hero section displays headline and CTA buttons', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('eSocial sem erro')
    // Primary CTA: "Comece agora" linking to /signup
    const primaryCTA = page.locator('a[href="/signup"] button, a[href="/signup"]').first()
    await expect(primaryCTA).toBeVisible()
    // Secondary CTA: "Testar calculadora grátis"
    const secondaryCTA = page.locator('a[href="#calculadora"]').first()
    await expect(secondaryCTA).toBeVisible()
  })

  test('navigation links are visible and point to correct routes', async ({ page }) => {
    // Desktop nav links (may be hidden on mobile, but Playwright uses 1280px by default)
    await expect(page.locator('nav a[href="/blog"]')).toBeVisible()
    await expect(page.locator('nav a[href="/faq"]')).toBeVisible()
    await expect(page.locator('nav a[href="/simulador"]')).toBeVisible()
    await expect(page.locator('nav a[href="/login"]')).toBeVisible()
  })

  test('nav link to /blog navigates correctly', async ({ page }) => {
    await page.locator('nav a[href="/blog"]').click()
    await expect(page).toHaveURL(/\/blog/)
  })

  test('nav link to /faq navigates correctly', async ({ page }) => {
    await page.locator('nav a[href="/faq"]').click()
    await expect(page).toHaveURL(/\/faq/)
  })

  test('embedded calculator section is visible', async ({ page }) => {
    const calculator = page.locator('#calculadora')
    await expect(calculator).toBeVisible()
    await expect(calculator.locator('text=/R\\$/')).toBeVisible()
  })

  test('pricing section shows plan tiers', async ({ page }) => {
    const pricingSection = page.locator('section').filter({ hasText: 'Escolha o plano ideal' })
    await expect(pricingSection).toBeVisible()
    const pricingCards = pricingSection.locator('.grid > div')
    await expect(pricingCards).toHaveCount(3)
  })

  test('footer is visible with links', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    expect(await footer.locator('a').count()).toBeGreaterThan(0)
  })
})
