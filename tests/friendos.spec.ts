import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('completes the core Research Mission and saves its receipt', async ({ page }, testInfo) => {
  await page.getByRole('button', { name: 'MEET YOUR OPERATOR' }).click()
  await expect(page.getByRole('heading', { name: 'Choose your operator' })).toBeVisible()
  await page.getByRole('button', { name: 'CHOOSE SIGNAL' }).click()
  await page.getByRole('button', { name: /ENTER SIGNAL’S HOME/ }).click()
  await page.getByRole('button', { name: /MISSIONS/ }).click()
  await page.getByRole('button', { name: /Research Mission/ }).click()
  await page.getByLabel('Tell your Friend what you need').fill('Explain the strongest opportunities for builders in Rare Friends.')
  await page.getByRole('button', { name: /SEND SIGNAL TO WORK/ }).click()

  await expect(page.getByRole('heading', { name: 'Signal is on it.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Here’s what Signal found' })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('FOS-48321-0001 // COMPLETE', { exact: true })).toBeVisible()
  await expect(page.getByText('2.5 RF', { exact: true })).toBeVisible()

  if (testInfo.project.name === 'desktop-chromium') {
    await page.screenshot({ path: 'artifacts/friendos-research-result.png', fullPage: true })
  }

  await page.getByRole('button', { name: '← RETURN' }).click()
  await expect(page.getByText('95 RF', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /ACTIVITY/ }).click()
  await expect(page.getByText('FOS-48321-0001', { exact: true })).toBeVisible()
})

test('provides a return path from every pre-mission screen', async ({ page }) => {
  await page.getByRole('button', { name: 'MEET YOUR OPERATOR' }).click()
  await page.getByRole('button', { name: 'CHOOSE SIGNAL' }).click()
  await page.getByRole('button', { name: '← Back to your Friends' }).click()
  await expect(page.getByRole('heading', { name: 'Choose your operator' })).toBeVisible()
  await page.getByRole('button', { name: '← RETURN HOME' }).click()
  await expect(page.getByRole('heading', { name: /Your Rare Friend can/ })).toBeVisible()
})
