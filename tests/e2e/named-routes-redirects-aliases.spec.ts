import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const lessonPath = '/learn/vue/router/intermediate/named-routes-redirects-aliases'

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

/** 验证独立 router 的中立初始位置与宿主 URL 隔离。 */
async function expectNeutralState(page: Page, demo: Locator): Promise<void> {
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/start')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('route-entry')
  await expect(demo.getByTestId('mini-alias-of')).toHaveText('无')
  await expect(demo.getByTestId('mini-route-params')).toHaveText('无')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('无')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功（neutral）')
  await expect(demo.getByTestId('redirect-record-guard-count')).toHaveText('0')
  await expect(demo.getByTestId('guard-trace')).toHaveText('暂无 record guard')
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
}

test('第六课区分 name、redirect 与 alias 的地址和守卫语义', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(
    page.getByRole('heading', { name: '命名路由、重定向与别名', exact: true }),
  ).toBeVisible()

  const demo = page.getByRole('region', { name: '命名路由、重定向与别名实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectNeutralState(page, demo)

  const nameButton = demo.getByRole('button', { name: '按 name 导航' })
  await nameButton.click()
  await expect(nameButton).toBeFocused()
  await expect(demo.getByTestId('requested-location')).toHaveText(
    'name: profile-main；username: Jian Li/演示',
  )
  await expect(demo.getByTestId('mini-pathname')).toHaveText(
    '/directory/profiles/Jian%20Li%2F%E6%BC%94%E7%A4%BA',
  )
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('directory-layout → profile-main')
  await expect(demo.getByTestId('mini-alias-of')).toHaveText('无')
  await expect(demo.getByTestId('mini-route-params')).toHaveText('{"username":"Jian Li/演示"}')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"source":"name"}')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功（name）')
  await expect(demo.getByTestId('guard-trace')).toContainText('目标 record guard')
  await expect(demo.getByTestId('redirect-record-guard-count')).toHaveText('0')
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await page.keyboard.press('Tab')
  const redirectButton = demo.getByRole('button', { name: '访问 redirect' })
  await expect(redirectButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/directory/profiles/legacy%20user')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"source":"redirect"}')
  await expect(demo.getByTestId('mini-redirected-from')).toHaveText(
    '/legacy/legacy%20user?source=redirect',
  )
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功（redirect）')
  await expect(demo.getByTestId('guard-trace')).toContainText('目标 record guard')
  await expect(demo.getByTestId('guard-trace')).not.toContainText('redirect record guard')
  await expect(demo.getByTestId('redirect-record-guard-count')).toHaveText('0')

  await page.keyboard.press('Tab')
  const aliasButton = demo.getByRole('button', { name: '访问 alias' })
  await expect(aliasButton).toBeFocused()
  await page.keyboard.press('Space')
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/members/alias-user')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('directory-layout → profile-main')
  await expect(demo.getByTestId('mini-alias-of')).toHaveText(
    'profile-main ← /directory/profiles/:username',
  )
  await expect(demo.getByTestId('mini-route-params')).toHaveText('{"username":"alias-user"}')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"source":"alias"}')
  await expect(demo.getByTestId('mini-redirected-from')).toHaveText('无')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功（alias）')
  await expect(demo.getByTestId('guard-trace')).toContainText('目标 record guard')
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '命名路由、重定向与别名实验' })
  await expectNeutralState(page, reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: '按 name 导航' })
        .evaluate((element) => getComputedStyle(element).transition),
    )
    .toBe('none')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
