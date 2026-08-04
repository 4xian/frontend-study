import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const lessonPath = '/learn/vue/router/advanced/scroll-history-deployment'

/** 把实验台中的可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo
    .locator('h3, h4, p, button, span, strong, li, th, td, caption')
    .evaluateAll((elements) => {
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

/** 等待实验完成首个真实 scrollBehavior 回调。 */
async function expectInitialState(demo: Locator): Promise<void> {
  await expect(demo.getByTestId('scroll-ready')).toHaveText('true')
  await expect(demo.getByTestId('scroll-current-path')).toHaveText('/guide/start?mode=read')
  await expect(demo.getByTestId('scroll-matched-names')).toHaveText('guide')
  await expect(demo.getByTestId('scroll-params')).toHaveText('{"chapter":"start"}')
  await expect(demo.getByTestId('scroll-query')).toHaveText('{"mode":"read"}')
  await expect(demo.getByTestId('scroll-navigation-outcome')).toHaveText(
    'initial -> /guide/start?mode=read',
  )
  await expect(demo.getByTestId('scroll-call-count')).toHaveText('1')
  await expect(demo.getByTestId('scroll-last-to')).toHaveText('/guide/start?mode=read')
  await expect(demo.getByTestId('scroll-saved-position')).toHaveText('null')
  await expect(demo.getByTestId('scroll-return')).toHaveText('false')
}

test('第十三课分离滚动回调、history adapter 与部署责任', async ({ page }) => {
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
    page.getByRole('heading', { name: '滚动、历史模式与部署', exact: true }),
  ).toBeVisible()

  const demo = page.getByRole('region', { name: '滚动、历史模式与部署实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialState(demo)
  await expect(demo.getByTestId('scroll-host-path')).toHaveText(lessonPath)
  await expect(demo.getByTestId('scroll-history-base')).toHaveText('/academy')
  await expect(demo.getByTestId('scroll-guide-href')).toHaveText('/academy/guide/start?mode=read')
  await expect(demo.getByTestId('scroll-restoration-active')).toHaveText('manual')
  const hostRestorationBefore = (
    await demo.getByTestId('scroll-restoration-before').textContent()
  )?.trim()
  const hostHistoryLength = (
    await demo.getByTestId('scroll-host-history-length').textContent()
  )?.trim()
  await expect(demo.getByTestId('scroll-callback-log').locator('li')).toHaveCount(1)
  await expect(demo.getByTestId('scroll-callback-log').locator('li').last()).toContainText(
    '-> /guide/start?mode=read; saved=null; return=false',
  )
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  const searchButton = demo.getByRole('button', { name: '前往搜索页' })
  await searchButton.focus()
  await expect(searchButton).toBeFocused()
  await expect
    .poll(() => searchButton.evaluate((element) => getComputedStyle(element).outlineStyle))
    .not.toBe('none')
  const scrollBeforeSearch = await page.evaluate(() => `${window.scrollX},${window.scrollY}`)
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('scroll-current-path')).toHaveText('/search?q=router')
  await expect(demo.getByTestId('scroll-matched-names')).toHaveText('search')
  await expect(demo.getByTestId('scroll-params')).toHaveText('无')
  await expect(demo.getByTestId('scroll-query')).toHaveText('{"q":"router"}')
  await expect(demo.getByTestId('scroll-navigation-outcome')).toHaveText(
    'success -> /search?q=router',
  )
  await expect(demo.getByTestId('scroll-call-count')).toHaveText('2')
  await expect(demo.getByTestId('scroll-last-from')).toHaveText('/guide/start?mode=read')
  await expect(demo.getByTestId('scroll-last-to')).toHaveText('/search?q=router')
  await expect(demo.getByTestId('scroll-saved-position')).toHaveText('null')
  await expect(demo.getByTestId('scroll-return')).toHaveText('false')
  await expect(demo.getByTestId('scroll-host-history-length')).toHaveText(hostHistoryLength ?? '')
  await expect(demo.getByTestId('scroll-callback-log').locator('li')).toHaveCount(2)
  await expect(demo.getByTestId('scroll-callback-log').locator('li').last()).toHaveText(
    '#2 /guide/start?mode=read -> /search?q=router; saved=null; return=false',
  )
  await expect
    .poll(() => page.evaluate(() => `${window.scrollX},${window.scrollY}`))
    .toBe(scrollBeforeSearch)

  await demo.getByRole('button', { name: '前往部署章节' }).click()
  await expect(demo.getByTestId('scroll-current-path')).toHaveText('/guide/deploy?mode=check')
  await expect(demo.getByTestId('scroll-matched-names')).toHaveText('guide')
  await expect(demo.getByTestId('scroll-params')).toHaveText('{"chapter":"deploy"}')
  await expect(demo.getByTestId('scroll-query')).toHaveText('{"mode":"check"}')
  await expect(demo.getByTestId('scroll-call-count')).toHaveText('3')
  await expect(demo.getByTestId('scroll-last-from')).toHaveText('/search?q=router')
  await expect(demo.getByTestId('scroll-last-to')).toHaveText('/guide/deploy?mode=check')
  await expect(demo.getByTestId('scroll-host-history-length')).toHaveText(hostHistoryLength ?? '')
  await expect(demo.getByTestId('scroll-callback-log').locator('li')).toHaveCount(3)
  await expect(demo.getByTestId('scroll-callback-log').locator('li').last()).toHaveText(
    '#3 /search?q=router -> /guide/deploy?mode=check; saved=null; return=false',
  )
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await expect(demo.getByTestId('history-mode-row')).toHaveCount(3)
  await expect(demo.getByTestId('deployment-responsibility')).toContainText('服务器 fallback')
  await expect(demo.getByTestId('deployment-responsibility')).toContainText('应用 catch-all')
  await expect(demo.getByTestId('deployment-responsibility')).toContainText('真实 HTTP 404')

  const generationBeforeReset = Number(await demo.getByTestId('scroll-generation').textContent())
  await demo.getByRole('button', { name: '重置实验' }).click()
  await expect(demo.getByTestId('scroll-generation')).toHaveText(String(generationBeforeReset + 1))
  await expectInitialState(demo)
  await expect(demo.getByTestId('scroll-restoration-restored')).toHaveText(
    hostRestorationBefore ?? '',
  )
  await expect(demo.getByTestId('scroll-restoration-active')).toHaveText('manual')

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expect(demo.getByTestId('scroll-status')).toBeVisible()
  await expect(demo.getByRole('heading', { name: '导航时间线' })).toBeVisible()
  await expect(demo.getByRole('heading', { name: 'scrollBehavior 时间线' })).toBeVisible()
  await expectContentFits(page, demo)
  await demo.getByRole('button', { name: '前往搜索页' }).click()
  await expect(demo.getByTestId('scroll-current-path')).toHaveText('/search?q=router')
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '滚动、历史模式与部署实验' })
  await expectInitialState(reducedDemo)
  await reducedDemo.getByRole('button', { name: '前往搜索页' }).click()
  await expect(reducedDemo.getByTestId('scroll-call-count')).toHaveText('2')
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: '前往搜索页' })
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    )
    .toBe('0s')

  const reducedRestorationBefore = await reducedDemo
    .getByTestId('scroll-restoration-before')
    .textContent()
  await page.getByRole('link', { name: '上一篇：RouterView 插槽与过渡' }).click()
  await expect(
    page.getByRole('heading', { name: 'RouterView 插槽与过渡', exact: true }),
  ).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => window.history.scrollRestoration))
    .toBe(reducedRestorationBefore?.trim())

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
