import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/router/basics/setup-first-router'

/** 验证独立路由器初始化完成且没有改写宿主地址。 */
async function expectInitialRoute(page: Page, demo: Locator): Promise<void> {
  await expect(demo.getByTestId('mini-current-path')).toHaveText('/')
  await expect(demo.getByTestId('mini-current-name')).toHaveText('home')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('home')
  await expect(demo.getByTestId('mini-route-view')).toContainText('首页')
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
}

/** 把实验台中的可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo.locator('h3, h4, p, button, span, strong, code, li').evaluateAll((elements) => {
    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue
      const size = Number.parseFloat(getComputedStyle(element).fontSize)
      element.style.setProperty('font-size', `${size * 2}px`, 'important')
    }
  })
}

/** 验证实验台在窄屏和放大文字下没有横向溢出。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  await expect
    .poll(() => demo.evaluate((element) => element.scrollWidth <= element.clientWidth + 1))
    .toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
    .toBe(true)
}

test('第一课用独立 memory router 初始化并导航且不污染宿主 URL', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(page.getByRole('heading', { name: '建立第一个路由器', exact: true })).toBeVisible()

  const demo = page.getByRole('region', { name: '独立路由器实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialRoute(page, demo)

  const aboutButton = demo.getByRole('button', { name: '关于页' })
  await aboutButton.click()
  await expect(demo.getByTestId('mini-current-path')).toHaveText('/about')
  await expect(demo.getByTestId('mini-current-name')).toHaveText('about')
  await expect(demo.getByTestId('mini-route-view')).toContainText('关于页')
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await expect(aboutButton).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  const homeButton = demo.getByRole('button', { name: '首页' })
  await expect(homeButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expectInitialRoute(page, demo)

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '独立路由器实验' })
  await expectInitialRoute(page, reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: '首页' })
        .evaluate((element) => getComputedStyle(element).transition),
    )
    .toBe('none')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
