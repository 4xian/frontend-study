import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/router/basics/nested-routes'

/** 把实验台中的可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo.locator('h3, h4, h5, p, button, span, strong, li').evaluateAll((elements) => {
    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue
      const size = Number.parseFloat(getComputedStyle(element).fontSize)
      element.style.setProperty('font-size', `${size * 2}px`, 'important')
    }
  })
}

/** 验证实验台与页面在当前尺寸下没有横向溢出。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  await expect
    .poll(() => demo.evaluate((element) => element.scrollWidth <= element.clientWidth + 1))
    .toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
    .toBe(true)
}

/** 验证空路径 child、两层 outlet 与宿主 URL 隔离。 */
async function expectDefaultChildState(page: Page, demo: Locator): Promise<void> {
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/teams/core')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('team-layout → team-home')
  await expect(demo.getByTestId('mini-route-params')).toHaveText('{"teamId":"core"}')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"tab":"overview"}')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功')
  await expect(demo.getByTestId('parent-outlet-content')).toContainText('团队 core 布局')
  await expect(demo.getByTestId('parent-outlet-content')).toContainText(
    '外层 outlet 内容 · depth 0 · matched[0]',
  )
  await expect(demo.getByTestId('child-outlet-depth')).toHaveText(
    '第二层 RouterView · depth 1 · matched[1]',
  )
  await expect(demo.getByTestId('child-outlet-content')).toContainText('团队默认页')
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
}

test('第四课让 URL、children 与两层 RouterView 深度保持一致', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(page.getByRole('heading', { name: '嵌套路由', exact: true })).toBeVisible()

  const demo = page.getByRole('region', { name: '嵌套路由层级实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectDefaultChildState(page, demo)
  await expect(demo.getByTestId('mini-navigation-timeline')).toContainText(
    'afterEach：/ → /teams/core?tab=overview；matched：team-layout → team-home；结果：成功',
  )

  const detailButton = demo.getByRole('button', { name: '成员详情' })
  await detailButton.click()
  await expect(detailButton).toBeFocused()
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/teams/core/members/42')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('team-layout → team-member')
  await expect(demo.getByTestId('mini-route-params')).toHaveText(
    '{"teamId":"core","memberId":"42"}',
  )
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"tab":"profile"}')
  await expect(demo.getByTestId('parent-outlet-content')).toContainText('团队 core 布局')
  await expect(demo.getByTestId('child-outlet-content')).toContainText('成员详情 42')
  await expect(demo.getByTestId('mini-navigation-timeline')).toContainText(
    'matched：team-layout → team-member；结果：成功',
  )
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await page.keyboard.press('Tab')
  const defaultButton = demo.getByRole('button', { name: '默认子路由' })
  await expect(defaultButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expectDefaultChildState(page, demo)

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '嵌套路由层级实验' })
  await expectDefaultChildState(page, reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: '成员详情' })
        .evaluate((element) => getComputedStyle(element).transition),
    )
    .toBe('none')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
