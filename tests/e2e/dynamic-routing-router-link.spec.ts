import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const lessonPath = '/learn/vue/router/advanced/dynamic-routing-router-link'

/** 把实验台中的可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo.locator('h3, h4, p, button, a, span, strong, li').evaluateAll((elements) => {
    const originalSizes = elements.map((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    )
    for (const [index, element] of elements.entries()) {
      if (!(element instanceof HTMLElement)) continue
      const size = originalSizes[index]
      if (size === undefined) continue
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

/** 等待独立 Router 回到固定的 fallback 初态。 */
async function expectInitialState(demo: Locator): Promise<void> {
  await expect(demo.getByTestId('dynamic-ready')).toHaveText('true')
  await expect(demo.getByTestId('dynamic-current-path')).toHaveText('/feature/tool?mode=inspect')
  await expect(demo.getByTestId('dynamic-matched-names')).toHaveText('fallback')
  await expect(demo.getByTestId('dynamic-params')).toHaveText('{"pathMatch":["feature","tool"]}')
  await expect(demo.getByTestId('dynamic-query')).toHaveText('{"mode":"inspect"}')
  await expect(demo.getByTestId('dynamic-has-route')).toHaveText('false')
  await expect(demo.getByTestId('dynamic-route-count')).toHaveText('2')
  await expect(demo.getByTestId('dynamic-route-names')).toHaveText('fallback, home')
  await expect(demo.getByTestId('dynamic-disposer')).toHaveText('尚未创建')
  await expect(demo.getByTestId('dynamic-route-marker')).toHaveText('fallback')
  await expect(demo.getByTestId('feature-resolved-matched')).toHaveText(
    'resolved matched: fallback',
  )
}

test('第十四课分离 matcher 变更、route 提交与 useLink 渲染', async ({ page }) => {
  test.setTimeout(60_000)
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(
    page.getByRole('heading', { name: '动态路由与 RouterLink 扩展', exact: true }),
  ).toBeVisible()

  const demo = page.getByRole('region', { name: '动态路由与 RouterLink 扩展实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialState(demo)
  await expect(demo.getByTestId('dynamic-host-path')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  const featureLink = demo.getByRole('link', { name: 'Feature 工具链接' })
  const homeLink = demo.getByRole('link', { name: '实验首页链接' })
  const externalLink = demo.getByRole('link', { name: 'Vue Router 官网' })
  await expect(featureLink).toHaveAttribute('href', '/lab/feature/tool?mode=inspect')
  await expect(featureLink).toHaveAttribute('aria-current', 'page')
  await expect(demo.getByTestId('feature-active')).toHaveText('active=true; exact=true')
  await expect(externalLink).toHaveAttribute('href', 'https://router.vuejs.org/')
  await expect(externalLink).toHaveAttribute('target', '_blank')
  await expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer')

  const registerButton = demo.getByRole('button', { name: '注册 Feature route' })
  await registerButton.focus()
  await expect(registerButton).toBeFocused()
  await expect
    .poll(() => registerButton.evaluate((element) => getComputedStyle(element).outlineStyle))
    .not.toBe('none')
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('dynamic-has-route')).toHaveText('true')
  await expect(demo.getByTestId('dynamic-route-count')).toHaveText('3')
  await expect(demo.getByTestId('dynamic-route-names')).toHaveText('fallback, feature-tool, home')
  await expect(demo.getByTestId('dynamic-disposer')).toHaveText('ready')
  await expect(demo.getByTestId('dynamic-matched-names')).toHaveText('fallback')
  await expect(demo.getByTestId('dynamic-route-marker')).toHaveText('fallback')
  await expect(demo.getByTestId('feature-active')).toHaveText('active=true; exact=true')
  await expect(demo.getByTestId('feature-resolved-matched')).toHaveText(
    'resolved matched: fallback',
  )
  await expect(demo.getByTestId('dynamic-matcher-log').locator('li')).toHaveText([
    'addRoute feature-tool',
  ])

  await demo.getByRole('button', { name: 'replace 当前地址' }).click()
  await expect(demo.getByTestId('dynamic-matched-names')).toHaveText('feature-tool')
  await expect(demo.getByTestId('dynamic-params')).toHaveText('无')
  await expect(demo.getByTestId('dynamic-route-marker')).toHaveText('feature')
  await expect(demo.getByTestId('feature-active')).toHaveText('active=true; exact=true')
  await expect(demo.getByTestId('feature-resolved-matched')).toHaveText(
    'resolved matched: feature-tool',
  )
  await expect(featureLink).toHaveAttribute('aria-current', 'page')
  await expect(demo.getByTestId('dynamic-navigation-log').locator('li').last()).toContainText(
    'success: /feature/tool?mode=inspect -> /feature/tool?mode=inspect',
  )

  await featureLink.evaluate((element) => {
    element.addEventListener('click', (event) => event.preventDefault(), { once: true })
    element.dispatchEvent(
      new MouseEvent('click', { bubbles: true, button: 0, cancelable: true, ctrlKey: true }),
    )
  })
  await expect(demo.getByTestId('dynamic-current-path')).toHaveText('/feature/tool?mode=inspect')

  await homeLink.focus()
  await expect(homeLink).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('dynamic-current-path')).toHaveText('/home')
  await expect(demo.getByTestId('dynamic-route-marker')).toHaveText('home')
  await expect(demo.getByTestId('home-active')).toHaveText('active=true; exact=true')
  await expect(homeLink).toHaveAttribute('aria-current', 'page')

  await featureLink.focus()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('dynamic-current-path')).toHaveText('/feature/tool?mode=inspect')
  await expect(demo.getByTestId('dynamic-route-marker')).toHaveText('feature')
  await expect(featureLink).toHaveAttribute('aria-current', 'page')
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await demo.getByRole('button', { name: '按名称移除' }).click()
  await expect(demo.getByTestId('dynamic-has-route')).toHaveText('false')
  await expect(demo.getByTestId('dynamic-route-count')).toHaveText('2')
  await expect(demo.getByTestId('dynamic-disposer')).toHaveText('stale after removeRoute')
  await expect(demo.getByTestId('dynamic-matched-names')).toHaveText('feature-tool')
  await expect(demo.getByTestId('dynamic-route-marker')).toHaveText('feature')
  await expect(demo.getByTestId('feature-active')).toHaveText('active=true; exact=true')
  await expect(demo.getByTestId('feature-resolved-matched')).toHaveText(
    'resolved matched: feature-tool',
  )

  await demo.getByRole('button', { name: 'replace 当前地址' }).click()
  await expect(demo.getByTestId('dynamic-matched-names')).toHaveText('fallback')
  await expect(demo.getByTestId('dynamic-route-marker')).toHaveText('fallback')
  await expect(demo.getByTestId('feature-resolved-matched')).toHaveText(
    'resolved matched: fallback',
  )
  await demo.getByRole('button', { name: '调用当前 disposer' }).click()
  await expect(demo.getByTestId('dynamic-disposer')).toHaveText('used')
  await expect(demo.getByTestId('dynamic-has-route')).toHaveText('false')

  await demo.getByRole('button', { name: '注册 Feature route' }).click()
  await expect(demo.getByTestId('dynamic-has-route')).toHaveText('true')
  await expect(demo.getByTestId('dynamic-disposer')).toHaveText('ready')
  await demo.getByRole('button', { name: '调用当前 disposer' }).click()
  await expect(demo.getByTestId('dynamic-has-route')).toHaveText('false')
  await expect(demo.getByTestId('dynamic-disposer')).toHaveText('used')

  const generationBeforeReset = Number(await demo.getByTestId('dynamic-generation').textContent())
  await demo.getByRole('button', { name: '重置实验' }).click()
  await expect(demo.getByTestId('dynamic-generation')).toHaveText(String(generationBeforeReset + 1))
  await expectInitialState(demo)

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expect(demo.getByTestId('dynamic-status')).toBeVisible()
  await expect(demo.getByRole('heading', { name: 'Matcher 时间线' })).toBeVisible()
  await expect(demo.getByRole('heading', { name: '导航时间线' })).toBeVisible()
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '动态路由与 RouterLink 扩展实验' })
  await expectInitialState(reducedDemo)
  await reducedDemo.getByRole('button', { name: '注册 Feature route' }).click()
  await reducedDemo.getByRole('button', { name: 'replace 当前地址' }).click()
  await expect(reducedDemo.getByTestId('dynamic-route-marker')).toHaveText('feature')
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: '注册 Feature route' })
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    )
    .toBe('0s')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
