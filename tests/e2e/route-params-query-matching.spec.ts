import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/router/basics/route-params-query-matching'

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

/** 验证实验台与页面在当前尺寸下没有横向溢出。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  await expect
    .poll(() => demo.evaluate((element) => element.scrollWidth <= element.clientWidth + 1))
    .toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
    .toBe(true)
}

/** 验证初始用户位置及宿主 URL 隔离。 */
async function expectInitialUserState(page: Page, demo: Locator): Promise<void> {
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/users/42')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('user-detail')
  await expect(demo.getByTestId('mini-route-params')).toHaveText('{"id":"42"}')
  await expect(demo.getByTestId('mini-params-shape')).toHaveText('id: string')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"tab":"profile"}')
  await expect(demo.getByTestId('mini-route-hash')).toHaveText('#bio')
  await expect(demo.getByTestId('mini-resolved-href')).toHaveText('/users/42?tab=profile#bio')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功')
  await expect(demo.getByTestId('mini-route-view')).toContainText('用户 42')
  await expect(demo.getByTestId('user-mount-count')).toHaveText('1')
  await expect(demo.getByTestId('user-param-change-count')).toHaveText('0')
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
}

test('第三课展示参数形态、解析结果与同记录组件复用', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(
    page.getByRole('heading', { name: '路由参数、查询与匹配', exact: true }),
  ).toBeVisible()

  const demo = page.getByRole('region', { name: '路由参数与匹配实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialUserState(page, demo)
  await expect(demo.getByTestId('mini-navigation-timeline')).toContainText(
    'afterEach：/ → /users/42?tab=profile#bio；结果：成功',
  )

  const userButton = demo.getByRole('button', { name: '用户 84' })
  await userButton.click()
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/users/84')
  await expect(demo.getByTestId('mini-route-params')).toHaveText('{"id":"84"}')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"tab":"activity"}')
  await expect(demo.getByTestId('mini-route-hash')).toHaveText('#history')
  await expect(demo.getByTestId('mini-resolved-href')).toHaveText('/users/84?tab=activity#history')
  await expect(demo.getByTestId('mini-route-view')).toContainText('用户 84')
  await expect(demo.getByTestId('user-mount-count')).toHaveText('1')
  await expect(demo.getByTestId('user-param-change-count')).toHaveText('1')
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await expect(userButton).toBeFocused()
  await page.keyboard.press('Tab')
  const tagsButton = demo.getByRole('button', { name: '两级 tags' })
  await expect(tagsButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/tags/vue/router')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('tag-results')
  await expect(demo.getByTestId('mini-route-params')).toHaveText('{"tags":["vue","router"]}')
  await expect(demo.getByTestId('mini-params-shape')).toHaveText('tags: array(2)')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"sort":"recent"}')
  await expect(demo.getByTestId('mini-route-hash')).toHaveText('无')
  await expect(demo.getByTestId('mini-resolved-href')).toHaveText('/tags/vue/router?sort=recent')
  await expect(demo.getByTestId('mini-route-view')).toContainText('["vue","router"]')

  await page.keyboard.press('Tab')
  const catchAllButton = demo.getByRole('button', { name: 'Catch-all' })
  await expect(catchAllButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/missing/guide')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('not-found')
  await expect(demo.getByTestId('mini-route-params')).toHaveText(
    '{"pathMatch":["missing","guide"]}',
  )
  await expect(demo.getByTestId('mini-params-shape')).toHaveText('pathMatch: array(2)')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"from":"demo"}')
  await expect(demo.getByTestId('mini-resolved-href')).toHaveText('/missing/guide?from=demo')
  await expect(demo.getByTestId('mini-route-view')).toContainText('["missing","guide"]')
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '路由参数与匹配实验' })
  await expectInitialUserState(page, reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: '用户 84' })
        .evaluate((element) => getComputedStyle(element).transition),
    )
    .toBe('none')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
