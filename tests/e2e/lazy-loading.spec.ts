import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const lessonPath = '/learn/vue/router/intermediate/lazy-loading'

/** 把实验台中的可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo.locator('h3, h4, p, button, span, strong, li').evaluateAll((elements) => {
    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue
      const size = Number.parseFloat(getComputedStyle(element).fontSize)
      element.style.setProperty('font-size', `${size * 2}px`, 'important')
    }
  })
}

/** 验证实验台与文档根节点都没有横向溢出。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  await expect
    .poll(() => demo.evaluate((element) => element.scrollWidth <= element.clientWidth + 1))
    .toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
    .toBe(true)
}

/** 按完整文本断言时间线中的关键事件严格递增。 */
async function expectEventOrder(demo: Locator, expected: string[]): Promise<void> {
  const events = demo.getByTestId('lazy-event-log').locator('li')
  await expect
    .poll(async () => {
      const values = await events.allTextContents()
      let previousIndex = -1
      return expected.every((text) => {
        const index = values.findIndex(
          (value, valueIndex) => valueIndex > previousIndex && value === text,
        )
        previousIndex = index
        return index !== -1
      })
    })
    .toBe(true)
}

/** 验证未导航时懒路由完全没有开始解析。 */
async function expectColdInitialState(page: Page, demo: Locator): Promise<void> {
  await expect(demo.getByTestId('lazy-current-path')).toHaveText('/')
  await expect(demo.getByTestId('lazy-navigation-state')).toHaveText('idle')
  await expect(demo.getByTestId('lazy-loader-phase')).toHaveText('idle')
  await expect(demo.getByTestId('loader-calls')).toHaveText('0')
  await expect(demo.getByTestId('import-calls')).toHaveText('0')
  await expect(demo.getByTestId('resolved-calls')).toHaveText('0')
  await expect(demo.getByTestId('lazy-report-view')).toHaveCount(0)
  await expect(demo.getByTestId('lazy-host-path')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
}

test('第十课用真实动态 import 证明导航等待与成功后复用', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(page.getByRole('heading', { name: '路由懒加载', exact: true })).toBeVisible()

  const demo = page.getByRole('region', { name: '路由懒加载实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectColdInitialState(page, demo)

  const enterButton = demo.getByRole('button', { name: '进入报表页' })
  await enterButton.click()
  await expect(demo.getByTestId('lazy-navigation-state')).toHaveText('pending')
  await expect(demo.getByTestId('lazy-target-path')).toHaveText('/report')
  await expect(demo.getByTestId('lazy-current-path')).toHaveText('/')
  await expect(demo.getByTestId('lazy-loader-phase')).toHaveText('waiting-release')
  await expect(demo.getByTestId('lazy-gate-state')).toHaveText('waiting')
  await expect(demo.getByTestId('loader-calls')).toHaveText('1')
  await expect(demo.getByTestId('import-calls')).toHaveText('0')
  await expect(demo.getByTestId('resolved-calls')).toHaveText('0')

  await page.keyboard.press('Tab')
  const releaseButton = demo.getByRole('button', { name: '允许 import' })
  await expect(releaseButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('lazy-current-path')).toHaveText('/report')
  await expect(demo.getByTestId('lazy-report-view')).toBeVisible()
  await expect(demo.getByTestId('loader-calls')).toHaveText('1')
  await expect(demo.getByTestId('import-calls')).toHaveText('1')
  await expect(demo.getByTestId('resolved-calls')).toHaveText('1')
  await expectEventOrder(demo, [
    'navigation start /report',
    'loader call #1',
    'gate waiting',
    'import call #1',
    'import resolved #1',
    'navigation commit /report',
  ])

  await demo.getByRole('button', { name: '返回首页' }).click()
  await expect(demo.getByTestId('lazy-current-path')).toHaveText('/')
  await enterButton.click()
  await expect(demo.getByTestId('lazy-current-path')).toHaveText('/report')
  await expect(demo.getByTestId('lazy-loader-phase')).toHaveText('reused')
  await expect(demo.getByTestId('loader-calls')).toHaveText('1')
  await expect(demo.getByTestId('import-calls')).toHaveText('1')
  await expect(demo.getByTestId('resolved-calls')).toHaveText('1')
  await expect(releaseButton).toBeDisabled()
  await expectEventOrder(demo, [
    'navigation commit /',
    'navigation start /report (revisit)',
    'navigation commit /report (loader unchanged)',
  ])
  await expect(demo.getByTestId('lazy-host-path')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '路由懒加载实验' })
  await expectColdInitialState(page, reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: '进入报表页' })
        .evaluate((element) => getComputedStyle(element).transition),
    )
    .toBe('none')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
