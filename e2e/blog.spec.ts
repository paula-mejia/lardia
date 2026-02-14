import { test, expect } from '@playwright/test'

test.describe('Blog', () => {
  test('blog index loads with posts', async ({ page }) => {
    await page.goto('/blog')
    await expect(page).toHaveURL(/blog/)

    // Should have post cards/links
    const postLinks = page.locator('a[href^="/blog/"]')
    await expect(postLinks.first()).toBeVisible()
    expect(await postLinks.count()).toBeGreaterThanOrEqual(10)
  })

  test('individual post loads with content', async ({ page }) => {
    await page.goto('/blog')

    // Click the first post
    const firstPost = page.locator('a[href^="/blog/"]').first()
    const postHref = await firstPost.getAttribute('href')
    await firstPost.click()

    await expect(page).toHaveURL(new RegExp(postHref!))

    // Post should have content (article or main content area)
    const content = page.locator('article, main')
    await expect(content).toBeVisible()
    // Should have meaningful text content
    const text = await content.textContent()
    expect(text!.length).toBeGreaterThan(100)
  })

  test('navigation back to blog works', async ({ page }) => {
    await page.goto('/blog')
    const firstPost = page.locator('a[href^="/blog/"]').first()
    await firstPost.click()

    // Navigate back to blog
    const blogLink = page.locator('a[href="/blog"], a[href="/blog/"]').first()
    await blogLink.click()

    await expect(page).toHaveURL(/\/blog\/?$/)
  })
})
