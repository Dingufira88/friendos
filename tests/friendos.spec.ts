import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('completes a Research Mission from the unified workspace', async ({ page }, testInfo) => {
  await expect(page.getByRole('heading', { name: 'Meet your new operator.' })).toBeVisible()
  await page.getByLabel('Tell your Friend what you need').fill('Explain the strongest opportunities for Rare Friends builders.')
  await page.getByRole('button', { name: /Launch mission/ }).click()
  await expect(page.getByRole('heading', { name: 'Signal is on it.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Here’s what Signal found.' })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('FOS-48321-0001 / COMPLETE', { exact: true })).toBeVisible()
  if (testInfo.project.name === 'desktop-chromium') await page.screenshot({ path: 'artifacts/friendos-research-result.png', fullPage: true })
  await page.getByRole('button', { name: /Return to workspace/ }).click()
  await expect(page.locator('.history-list article').filter({ hasText: 'FOS-48321-0001' })).toBeVisible()
})

test('switches Friends and navigates the single-page sections', async ({ page }) => {
  await page.getByRole('button', { name: /Switch Friend/ }).click()
  await page.getByRole('button', { name: /Nova/ }).click()
  await expect(page.getByRole('heading', { name: /Nova/ })).toBeVisible()
  await page.getByRole('heading', { name: /Mission history/ }).scrollIntoViewIfNeeded()
  await expect(page.getByRole('heading', { name: /Mission history/ })).toBeVisible()
})
