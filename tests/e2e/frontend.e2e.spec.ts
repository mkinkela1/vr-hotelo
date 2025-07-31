import { expect, Page, test } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Payload Blank Template/)

    const headging = page.locator('h1').first()

    await expect(headging).toHaveText('Welcome to your new project.')
  })

  test('media API endpoint is accessible', async ({ page }) => {
    // Test that the media API endpoint responds without the "Missing 'where' query" error
    const response = await page.request.get('/api/media')

    // Should return a 200 status (even if unauthorized, it shouldn't be a 500 error)
    expect(response.status()).toBeLessThan(500)

    // The response should be JSON
    const contentType = response.headers()['content-type']
    expect(contentType).toContain('application/json')
  })
})
