import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const lessonPath = '/learn/vue/router/intermediate/meta-navigation-guards'

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

/** 验证实验台与文档根节点两层都没有横向溢出。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  await expect
    .poll(() => demo.evaluate((element) => element.scrollWidth <= element.clientWidth + 1))
    .toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
    .toBe(true)
}

/** 验证公开起点、默认角色与宿主 URL 隔离。 */
async function expectInitialState(page: Page, demo: Locator): Promise<void> {
  await expect(demo.getByTestId('active-role')).toHaveText('guest')
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/start')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('guard-start')
  await expect(demo.getByTestId('mini-redirected-from')).toHaveText('无')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功（initial）')
  await expect(demo.getByTestId('current-meta')).toHaveText('无')
  await expect(demo.getByTestId('mini-route-view')).toContainText('守卫实验起点')
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
}

test('第八课用 Meta 和守卫矩阵产生 redirect、cancel 与 allow', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(
    page.getByRole('heading', { name: '路由 Meta 与导航守卫', exact: true }),
  ).toBeVisible()

  const demo = page.getByRole('region', { name: '路由 Meta 与导航守卫实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialState(page, demo)

  const openReportsButton = demo.getByRole('button', { name: '访问管理报表' })
  await openReportsButton.click()
  await expect(openReportsButton).toBeFocused()
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/login')
  await expect(demo.getByTestId('mini-redirected-from')).toHaveText('/admin/reports')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText(
    '重定向完成（/login?redirect=/admin/reports）',
  )
  await expect(demo.getByTestId('mini-route-view')).toContainText('请先登录')
  await expect(demo.getByTestId('guard-timeline')).toContainText('redirect 到登录页')
  await expect(demo.getByTestId('guard-timeline')).toContainText(
    'beforeEach：role=guest；target=/login?redirect=/admin/reports',
  )

  await demo.getByRole('button', { name: '成员' }).click()
  await expect(demo.getByTestId('active-role')).toHaveText('member')
  await openReportsButton.click()
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/login')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('取消（type 4）')
  await expect(demo.getByTestId('guard-timeline')).toContainText('return false 取消')
  await expect(demo.getByTestId('guard-timeline')).not.toContainText('beforeEnter：父记录')

  const adminButton = demo.getByRole('button', { name: '管理员' })
  await adminButton.click()
  await expect(adminButton).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(openReportsButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/admin/reports')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('admin-layout → admin-reports')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功（admin allow）')
  await expect(demo.getByTestId('mini-route-view')).toContainText('管理报表')
  await expect(demo.getByTestId('current-meta')).toContainText('"requiresAuth":true')
  await expect(demo.getByTestId('current-meta')).toContainText('"requiredRole":"admin"')
  await expect(demo.getByTestId('current-meta')).toContainText('"area":"reports"')
  await expect(demo.getByTestId('current-meta')).toContainText('"policy":{"export":true}')
  await expect(demo.getByTestId('current-meta')).not.toContainText('"audit":true')
  await expect(demo.getByTestId('matched-meta')).toContainText('"audit":true')
  await expect(demo.getByTestId('matched-meta')).toContainText('"export":true')
  await expect(demo.getByTestId('guard-timeline').locator('li')).toHaveText([
    '1 beforeEach：role=admin；target=/admin/reports',
    '1.1 decision：allow',
    '2 beforeEnter：父记录',
    '3 beforeEnter：报表子记录',
    '4 beforeRouteEnter：报表组件准备激活',
    '5 beforeResolve：/admin/reports',
    '6 afterEach：/login?redirect=/admin/reports → /admin/reports；成功（admin allow）',
  ])
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '路由 Meta 与导航守卫实验' })
  await expectInitialState(page, reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: '访问管理报表' })
        .evaluate((element) => getComputedStyle(element).transition),
    )
    .toBe('none')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
