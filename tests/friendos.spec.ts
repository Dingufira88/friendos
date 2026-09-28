import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'Explore first' }).click()
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

test('opens Skills marketplace and manages an operator wallet', async ({ page }) => {
  await page.getByRole('button', { name: 'Skills' }).click()
  await expect(page.getByRole('heading', { name: /Teach your operator/ })).toBeVisible()
  await expect(page.getByText('20% of every usage fee')).toBeVisible()
  await expect(page.locator('.skill-grid article')).toHaveCount(4)

  await page.getByRole('button', { name: 'Agent profile' }).click()
  await expect(page.getByText('FRIEND WALLET')).toBeVisible()
  await page.getByLabel('Funding amount').fill('25')
  await page.getByRole('button', { name: /Add 25 RF/ }).click()
  await expect(page.locator('.wallet-panel h2')).toContainText('125')
  await page.getByLabel('Per-mission spending limit').fill('4')
  await page.getByRole('button', { name: 'Save spending policy' }).click()
  await page.getByRole('button', { name: /Back to workspace/ }).click()
  await page.getByLabel('Tell your Friend what you need').fill('Research Rare Friends')
  await expect(page.getByRole('button', { name: /Launch mission/ })).toBeDisabled()
})

test('confirms which operator receives a skill and trains a skill NFT', async ({ page }) => {
  await page.getByRole('button', { name: 'Skills' }).click()
  await page.getByRole('button', { name: /INSTALL · 12 RF/ }).click()
  await expect(page.getByRole('heading', { name: /Who will learn Social Signal/ })).toBeVisible()
  await expect(page.locator('.agent-purchase-list label')).toHaveCount(3)
  await page.locator('.agent-purchase-list label').nth(1).click()
  await page.getByRole('button', { name: /Confirm and install/ }).click()
  await page.getByPlaceholder('e.g. Chain Scout').fill('Chain Scout')
  await page.getByRole('button', { name: /Mint free training NFT/ }).click()
  await expect(page.getByText('Approval request')).toBeVisible()
  await page.getByRole('button', { name: 'Approve with caution' }).click()
  await expect(page.getByText(/Judgment XP \+25/)).toBeVisible()
})
