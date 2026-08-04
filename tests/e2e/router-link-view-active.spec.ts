import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/router/basics/router-link-view-active'

/** 把实验台中的可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo.locator('h3, h4, p, a, button, span, strong, li').evaluateAll((elements) => {
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

/** 验证初始父子链接公开状态与宿主隔离。 */
async function expectOverviewState(page: Page, demo: Locator): Promise<void> {
  const parentLink = demo.getByRole('link', { name: '工作区', exact: true })
  const overviewLink = demo.getByRole('link', { name: '概览', exact: true })
  const settingsLink = demo.getByRole('link', { name: '设置', exact: true })

  await expect(parentLink).toHaveClass(/router-link-active/)
  await expect(parentLink).not.toHaveClass(/router-link-exact-active/)
  await expect(parentLink).not.toHaveAttribute('aria-current')
  await expect(overviewLink).toHaveClass(/router-link-active/)
  await expect(overviewLink).toHaveClass(/router-link-exact-active/)
  await expect(overviewLink).toHaveAttribute('aria-current', 'page')
  await expect(settingsLink).not.toHaveClass(/router-link-active/)
  await expect(demo.getByTestId('link-slot-state-parent')).toContainText('isActive: true')
  await expect(demo.getByTestId('link-slot-state-parent')).toContainText('isExactActive: false')
  await expect(demo.getByTestId('link-slot-state-overview')).toContainText('isActive: true')
  await expect(demo.getByTestId('link-slot-state-overview')).toContainText('isExactActive: true')
  await expect(demo.getByTestId('link-state-parent')).toContainText('实际 aria-current: 无')
  await expect(demo.getByTestId('link-state-overview')).toContainText(
    '实际 class: router-link-active router-link-exact-active',
  )
  await expect(demo.getByTestId('link-state-overview')).toContainText('实际 aria-current: page')
  await expect(demo.getByTestId('mini-route-view')).toContainText('概览页')
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
}

test('第二课展示真实链接激活语义且 query 不参与判断', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(
    page.getByRole('heading', { name: '链接、视图与激活状态', exact: true }),
  ).toBeVisible()

  const demo = page.getByRole('region', { name: '链接激活状态实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/workspace/overview')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('workspace → workspace-overview')
  await expect(demo.getByTestId('mini-route-params')).toHaveText('无')
  await expect(demo.getByTestId('mini-query-mode')).toHaveText('summary')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功')
  await expect(demo.getByTestId('mini-navigation-timeline')).toContainText(
    'afterEach：/ → /workspace/overview?mode=summary；结果：成功',
  )
  await expectOverviewState(page, demo)

  const queryButton = demo.getByRole('button', { name: '切换概览 query' })
  await queryButton.click()
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/workspace/overview')
  await expect(demo.getByTestId('mini-query-mode')).toHaveText('detail')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功')
  await expect(demo.getByTestId('mini-navigation-timeline')).toContainText(
    'afterEach：/workspace/overview?mode=summary → /workspace/overview?mode=detail；结果：成功',
  )
  await expectOverviewState(page, demo)

  await expect(queryButton).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(demo.getByRole('button', { name: '重置' })).toBeFocused()
  await page.keyboard.press('Tab')
  const parentLink = demo.getByRole('link', { name: '工作区', exact: true })
  await expect(parentLink).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(demo.getByRole('link', { name: '概览', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  const settingsLink = demo.getByRole('link', { name: '设置', exact: true })
  await expect(settingsLink).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(demo.getByTestId('mini-pathname')).toHaveText('/workspace/settings')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('workspace → workspace-settings')
  await expect(demo.getByTestId('mini-route-view')).toContainText('设置页')
  await expect(parentLink).toHaveClass(/router-link-active/)
  await expect(parentLink).not.toHaveClass(/router-link-exact-active/)
  await expect(settingsLink).toHaveClass(/router-link-exact-active/)
  await expect(settingsLink).toHaveAttribute('aria-current', 'page')
  await expect(demo.getByTestId('link-slot-state-settings')).toContainText('isActive: true')
  await expect(demo.getByTestId('link-slot-state-settings')).toContainText('isExactActive: true')
  await expect(demo.getByTestId('link-state-settings')).toContainText('实际 aria-current: page')
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '链接激活状态实验' })
  await expectOverviewState(page, reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('link', { name: '工作区', exact: true })
        .evaluate((element) => getComputedStyle(element).transition),
    )
    .toBe('none')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
