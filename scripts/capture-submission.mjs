import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const baseUrl = process.env.FRIENDOS_PREVIEW_URL ?? 'http://127.0.0.1:4173/'
const outputDir = resolve('submission/screenshots')

await mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ channel: process.env.FRIENDOS_BROWSER_CHANNEL ?? 'chrome' })

async function preparePage(viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
  await page.addInitScript(() => {
    localStorage.setItem('friendos-onboarded', 'yes')
    localStorage.removeItem('friendos-progression-v1')
    sessionStorage.setItem('friendos-booted', 'yes')
  })
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  return page
}

const desktop = await preparePage({ width: 1440, height: 1000 })
await desktop.screenshot({ path: resolve(outputDir, '01-workspace.png'), fullPage: false })

await desktop.getByRole('button', { name: /Social Content/ }).click()
await desktop.getByLabel('Tell your Friend what you need').fill('Write a launch announcement that explains how FriendOS gives every Rare Friend useful work, visible RF costs, and skills that grow through missions.')
await desktop.getByRole('button', { name: /Launch mission/ }).click()
await desktop.getByRole('heading', { name: /Here’s what Signal found/ }).waitFor({ timeout: 15_000 })
await desktop.screenshot({ path: resolve(outputDir, '02-mission-receipt.png'), fullPage: false })
await desktop.getByRole('button', { name: /Return to workspace/ }).click()

await desktop.getByRole('button', { name: 'Skills', exact: true }).click()
await desktop.screenshot({ path: resolve(outputDir, '03-skill-marketplace.png'), fullPage: false })
await desktop.close()

const mobile = await preparePage({ width: 390, height: 844 })
await mobile.screenshot({ path: resolve(outputDir, '04-mobile-workspace.png'), fullPage: false })
await mobile.close()

await browser.close()
