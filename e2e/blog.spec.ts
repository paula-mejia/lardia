import { test, expect } from '@playwright/test'

test.describe('Blog', () => {
  test('blog list page loads with article links', async ({ page }) => {
    await page.goto('/blog')
    await expect(page).toHaveURL(/blog/)

    const postLinks = page.locator('a[href^="/blog/"]')
    await expect(postLinks.first()).toBeVisible()
    expect(await postLinks.count()).toBeGreaterThanOrEqual(1)
  })

  test('blog list page shows post titles/headings', async ({ page }) => {
    await page.goto('/blog')
    // Posts should have visible text content (titles)
    const firstPost = page.locator('a[href^="/blog/"]').first()
    const text = await firstPost.textContent()
    expect(text!.trim().length).toBeGreaterThan(5)
  })

  test('clicking a blog post navigates to article page', async ({ page }) => {
    await page.goto('/blog')
    const firstPost = page.locator('a[href^="/blog/"]').first()
    const href = await firstPost.getAttribute('href')
    await firstPost.click()

    await expect(page).toHaveURL(new RegExp(href!))
  })

  test('article page has substantial content', async ({ page }) => {
    await page.goto('/blog')
    const firstPost = page.locator('a[href^="/blog/"]').first()
    await firstPost.click()

    const content = page.locator('article, main')
    await expect(content).toBeVisible()
    const text = await content.textContent()
    expect(text!.length).toBeGreaterThan(200)
  })

  test('article page has a way to navigate back to blog', async ({ page }) => {
    await page.goto('/blog')
    await page.locator('a[href^="/blog/"]').first().click()

    const backLink = page.locator('a[href="/blog"], a[href="/blog/"]').first()
    await expect(backLink).toBeVisible()
  })
})
