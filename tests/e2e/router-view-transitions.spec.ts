import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const lessonPath = '/learn/vue/router/advanced/router-view-slots-transitions'

/** 把实验台中的可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo
    .locator('h3, h4, p, button, label, legend, span, strong, li')
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

/** 返回状态区中当前 route component 的实例 ID。 */
async function readInstanceId(demo: Locator): Promise<string> {
  return (await demo.getByTestId('transition-instance-id').textContent())?.trim() ?? ''
}

/** 按前缀断言日志中的关键事件严格递增。 */
async function expectPrefixOrder(log: Locator, expectedPrefixes: string[]): Promise<void> {
  await expect
    .poll(async () => {
      const values = await log.locator('li').allTextContents()
      let previousIndex = -1
      return expectedPrefixes.every((prefix) => {
        const index = values.findIndex(
          (value, valueIndex) => valueIndex > previousIndex && value.startsWith(prefix),
        )
        previousIndex = index
        return index !== -1
      })
    })
    .toBe(true)
}

/** 等待配置重建完成并回到固定的 alpha 初态。 */
async function expectFreshGeneration(demo: Locator): Promise<void> {
  await expect(demo.getByTestId('transition-ready')).toHaveText('true')
  await expect(demo.getByTestId('transition-ready-before-mount')).toHaveText('true')
  await expect(demo.getByTestId('transition-mounted')).toHaveText('true')
  await expect(demo.getByTestId('transition-current-path')).toHaveText('/workspace/alpha')
  await expect(demo.getByTestId('transition-matched-names')).toHaveText('workspace')
  await expect(demo.getByTestId('transition-params')).toHaveText('{"id":"alpha"}')
  await expect(demo.getByTestId('transition-query')).toHaveText('无')
  await expect(demo.getByTestId('transition-active-component')).toHaveText('workspace')
  await expect(demo.getByTestId('transition-count')).toHaveText('0')
  await expect(demo.getByTestId('transition-initial-count')).toHaveText('0')
}

/** 导航到目标按钮对应的位置，并等待独立 router 完成提交。 */
async function navigate(demo: Locator, buttonName: string, targetPath: string): Promise<void> {
  await demo.getByRole('button', { name: buttonName }).click()
  await expect(demo.getByTestId('transition-current-path')).toHaveText(targetPath)
  await expect(demo.getByTestId('transition-navigation-outcome')).toHaveText(
    `success -> ${targetPath}`,
  )
  await expect(demo.getByTestId('route-card-path')).toHaveText(targetPath)

  if (targetPath.startsWith('/workspace/')) {
    await expect(demo.getByTestId('transition-matched-names')).toHaveText('workspace')
    await expect(demo.getByTestId('transition-params')).toHaveText(
      JSON.stringify({ id: targetPath.split('/').at(-1) }),
    )
  } else {
    await expect(demo.getByTestId('transition-matched-names')).toHaveText('review')
    await expect(demo.getByTestId('transition-params')).toHaveText('无')
  }
  await expect(demo.getByTestId('transition-query')).toHaveText('无')
}

/** 把当前 route component 的内部计数增加指定次数。 */
async function incrementCount(demo: Locator, times: number): Promise<void> {
  const button = demo.getByRole('button', { name: '增加当前实例计数' })
  for (let index = 0; index < times; index += 1) await button.click()
  await expect(demo.getByTestId('transition-count')).toHaveText(String(times))
}

test('第十二课分离实例复用、缓存生命周期与 out-in 过渡', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(
    page.getByRole('heading', { name: 'RouterView 插槽与过渡', exact: true }),
  ).toBeVisible()

  const demo = page.getByRole('region', { name: 'RouterView 过渡与缓存实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectFreshGeneration(demo)
  await expect(demo.getByTestId('transition-host-path')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  const initialInstanceId = await readInstanceId(demo)
  await incrementCount(demo, 1)

  const transitionToggle = demo.getByRole('checkbox', { name: '启用 route transition' })
  const betaButton = demo.getByRole('button', { name: '前往 Workspace beta' })
  await betaButton.focus()
  await page.keyboard.press('Shift+Tab')
  await expect(transitionToggle).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(betaButton).toBeFocused()
  await expect
    .poll(() => betaButton.evaluate((element) => getComputedStyle(element).outlineStyle))
    .not.toBe('none')
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('transition-current-path')).toHaveText('/workspace/beta')
  await expect(demo.getByTestId('transition-count')).toHaveText('1')
  expect(await readInstanceId(demo)).toBe(initialInstanceId)

  const keepAliveToggle = demo.getByRole('checkbox', { name: '启用 KeepAlive' })
  const pathKeyToggle = demo.getByRole('checkbox', { name: '使用 route.path key' })
  await pathKeyToggle.check()
  await expect(demo.getByTestId('transition-key-mode')).toHaveText('route.path')
  await expectFreshGeneration(demo)

  const transitionAlphaInstanceId = await readInstanceId(demo)
  await navigate(demo, '前往 Workspace beta', '/workspace/beta')
  await expectPrefixOrder(demo.getByTestId('transition-hook-log'), [
    `before-leave:workspace#${transitionAlphaInstanceId}`,
    'before-enter:workspace#',
    `after-leave:workspace#${transitionAlphaInstanceId}`,
    'after-enter:workspace#',
  ])

  await keepAliveToggle.check()
  await expect(demo.getByTestId('transition-keep-alive')).toHaveText('true')
  await expectFreshGeneration(demo)

  const alphaInstanceId = await readInstanceId(demo)
  await incrementCount(demo, 1)
  await navigate(demo, '前往 Workspace beta', '/workspace/beta')
  const betaInstanceId = await readInstanceId(demo)
  expect(betaInstanceId).not.toBe(alphaInstanceId)
  await incrementCount(demo, 2)
  await navigate(demo, '前往 Review', '/review')
  const reviewInstanceId = await readInstanceId(demo)
  await incrementCount(demo, 3)

  await navigate(demo, '前往 Workspace beta', '/workspace/beta')
  expect(await readInstanceId(demo)).toBe(betaInstanceId)
  await expect(demo.getByTestId('transition-count')).toHaveText('2')
  await navigate(demo, '前往 Review', '/review')
  expect(await readInstanceId(demo)).toBe(reviewInstanceId)
  await expect(demo.getByTestId('transition-count')).toHaveText('3')
  await navigate(demo, '前往 Workspace alpha', '/workspace/alpha')
  expect(await readInstanceId(demo)).toBe(alphaInstanceId)
  await expect(demo.getByTestId('transition-count')).toHaveText('1')
  await expectPrefixOrder(demo.getByTestId('transition-lifecycle-log'), [
    `deactivated:workspace#${alphaInstanceId}`,
    `activated:workspace#${alphaInstanceId}`,
  ])

  await keepAliveToggle.uncheck()
  await expect(demo.getByTestId('transition-keep-alive')).toHaveText('false')
  await expectFreshGeneration(demo)
  await transitionToggle.uncheck()
  await expect(demo.getByTestId('transition-enabled')).toHaveText('false')
  await expectFreshGeneration(demo)

  const uncachedAlphaInstanceId = await readInstanceId(demo)
  await incrementCount(demo, 1)
  await navigate(demo, '前往 Workspace beta', '/workspace/beta')
  await navigate(demo, '前往 Workspace alpha', '/workspace/alpha')
  expect(await readInstanceId(demo)).not.toBe(uncachedAlphaInstanceId)
  await expect(demo.getByTestId('transition-count')).toHaveText('0')
  await expect(demo.getByTestId('transition-event-count')).toHaveText('0')
  await expectPrefixOrder(demo.getByTestId('transition-lifecycle-log'), [
    `unmounted:workspace#${uncachedAlphaInstanceId}`,
    'mounted:workspace#',
  ])

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expect(demo.getByTestId('transition-status')).toBeVisible()
  await expect(demo.getByRole('heading', { name: '导航结算' })).toBeVisible()
  await expect(demo.getByRole('heading', { name: '组件生命周期' })).toBeVisible()
  await expect(demo.getByRole('heading', { name: 'Transition hooks' })).toBeVisible()
  await expectContentFits(page, demo)
  await navigate(demo, '前往 Workspace beta', '/workspace/beta')
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: 'RouterView 过渡与缓存实验' })
  await expectFreshGeneration(reducedDemo)
  await reducedDemo.getByRole('checkbox', { name: '使用 route.path key' }).check()
  await expectFreshGeneration(reducedDemo)
  const reducedAlphaInstanceId = await readInstanceId(reducedDemo)
  await incrementCount(reducedDemo, 1)
  await navigate(reducedDemo, '前往 Workspace beta', '/workspace/beta')
  const reducedBetaInstanceId = await readInstanceId(reducedDemo)
  expect(reducedBetaInstanceId).not.toBe(reducedAlphaInstanceId)
  await expect(reducedDemo.getByTestId('transition-count')).toHaveText('0')
  await navigate(reducedDemo, '前往 Workspace alpha', '/workspace/alpha')
  expect(await readInstanceId(reducedDemo)).not.toBe(reducedAlphaInstanceId)
  await expect(reducedDemo.getByTestId('transition-count')).toHaveText('0')
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByTestId('route-view-card')
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    )
    .toBe('0s')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
