import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const lessonPath = '/learn/vue/router/intermediate/named-views-route-props'

/** 把实验台中的可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo.locator('h3, h4, p, button, span, strong, small, li').evaluateAll((elements) => {
    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue
      const size = Number.parseFloat(getComputedStyle(element).fontSize)
      element.style.setProperty('font-size', `${size * 2}px`, 'important')
    }
  })
}

/** 验证实验台与文档根节点两层都没有横向溢出。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  await expect
    .poll(() => demo.evaluate((element) => element.scrollWidth <= element.clientWidth + 1))
    .toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
    .toBe(true)
}

/** 验证独立 router 的中立初始位置与宿主 URL 隔离。 */
async function expectInitialState(page: Page, demo: Locator): Promise<void> {
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/start')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('named-views-start')
  await expect(demo.getByTestId('mini-route-params')).toHaveText('无')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('无')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功（initial）')
  await expect(demo.getByTestId('default-view')).toContainText('中立起点')
  await expect(demo.getByTestId('sidebar-view')).toHaveCount(0)
  await expect(demo.getByTestId('helper-view')).toHaveCount(0)
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
}

/** 验证三个同层 outlet 各自收到预期 Props。 */
async function expectWorkspaceProps(demo: Locator, teamId: string, filter: string): Promise<void> {
  await expect(demo.getByTestId('mini-pathname')).toHaveText(`/workspace/${teamId}`)
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('workspace-layout')
  await expect(demo.getByTestId('mini-route-params')).toHaveText(`{"teamId":"${teamId}"}`)
  await expect(demo.getByTestId('mini-route-query')).toHaveText(`{"filter":"${filter}"}`)
  await expect(demo.getByTestId('default-view')).toContainText('default outlet · Props 输入')
  await expect(demo.getByTestId('default-props')).toHaveText(`teamId=${teamId}`)
  await expect(demo.getByTestId('sidebar-view')).toContainText('sidebar outlet · function props')
  await expect(demo.getByTestId('sidebar-props')).toHaveText(`teamId=${teamId}；filter=${filter}`)
  await expect(demo.getByTestId('helper-view')).toContainText('helper outlet · object props')
  await expect(demo.getByTestId('helper-props')).toHaveText('mode=tips')
}

test('第七课用三个命名视图隔离三种路由 Props 模式', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(
    page.getByRole('heading', { name: '命名视图与路由 Props', exact: true }),
  ).toBeVisible()

  const demo = page.getByRole('region', { name: '命名视图与路由 Props 实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialState(page, demo)

  const coreButton = demo.getByRole('button', { name: '打开 core / open' })
  await coreButton.click()
  await expect(coreButton).toBeFocused()
  await expectWorkspaceProps(demo, 'core', 'open')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功（core/open）')
  await expect(demo.getByTestId('mini-navigation-timeline')).toContainText(
    'views：default / sidebar / helper',
  )
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await page.keyboard.press('Tab')
  const platformButton = demo.getByRole('button', { name: '打开 platform / closed' })
  await expect(platformButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expectWorkspaceProps(demo, 'platform', 'closed')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功（platform/closed）')
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)

  const comparisonButton = demo.getByTestId('toggle-route-props')
  await comparisonButton.click()
  await expect(comparisonButton).toHaveAttribute('aria-pressed', 'true')
  await expect(demo.getByTestId('default-view')).toContainText('default outlet · route 直读')
  await expect(demo.getByTestId('default-view')).toContainText('需要 router 上下文')
  await comparisonButton.click()
  await expect(demo.getByTestId('default-view')).toContainText('default outlet · Props 输入')

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '命名视图与路由 Props 实验' })
  await expectInitialState(page, reducedDemo)
  await reducedDemo.getByRole('button', { name: '打开 core / open' }).click()
  await expectWorkspaceProps(reducedDemo, 'core', 'open')
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: '打开 core / open' })
        .evaluate((element) => getComputedStyle(element).transition),
    )
    .toBe('none')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
