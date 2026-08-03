import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/advanced/effect-scope'

/** 断言三个 scope 均已同步收集副作用且尚未产生响应或清理。 */
async function expectInitialState(demo: Locator): Promise<void> {
  await expect(demo.getByTestId('component-scope-boundary')).toContainText(
    '组件 setup scope：已检测',
  )
  await expect(demo.getByTestId('component-scope-boundary')).toContainText(
    'detached 释放桥接：已登记',
  )

  for (const scopeKey of ['parent', 'attached', 'detached']) {
    await expect(demo.getByTestId(scopeKey + '-scope-state')).toHaveAttribute(
      'data-state',
      'active',
    )
    await expect(demo.getByTestId(scopeKey + '-collection-state')).toContainText(
      '同步 run 收集：已确认',
    )
    await expect(demo.getByTestId(scopeKey + '-watch-runs')).toHaveText('0')
    await expect(demo.getByTestId(scopeKey + '-event-runs')).toHaveText('0')
    await expect(demo.getByTestId(scopeKey + '-cleanup-runs')).toHaveText('0')
  }

  await expect(demo.getByTestId('source-value')).toHaveText('0')
  await expect(demo.getByTestId('parent-stop-calls')).toHaveText('0')
  await expect(demo.getByTestId('detached-stop-calls')).toHaveText('0')
}

/** 断言指定 scope 的 watch、频道与清理次数。 */
async function expectScopeMetrics(
  demo: Locator,
  scopeKey: 'parent' | 'attached' | 'detached',
  watchRuns: number,
  eventRuns: number,
  cleanupRuns: number,
): Promise<void> {
  await expect(demo.getByTestId(scopeKey + '-watch-runs')).toHaveText(String(watchRuns))
  await expect(demo.getByTestId(scopeKey + '-event-runs')).toHaveText(String(eventRuns))
  await expect(demo.getByTestId(scopeKey + '-cleanup-runs')).toHaveText(String(cleanupRuns))
}

/** 用键盘验证普通子 scope 级联停止、detached 存活和重复 stop 幂等。 */
async function exerciseScopeOwnership(page: Page, demo: Locator): Promise<void> {
  const advanceButton = demo.getByTestId('advance-state')
  const stopParentButton = demo.getByTestId('stop-parent')
  const stopDetachedButton = demo.getByTestId('stop-detached')

  await advanceButton.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(advanceButton).toBeFocused()
  await expect(advanceButton).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')

  await expect(demo.getByTestId('source-value')).toHaveText('1')
  await expectScopeMetrics(demo, 'parent', 1, 1, 0)
  await expectScopeMetrics(demo, 'attached', 1, 1, 0)
  await expectScopeMetrics(demo, 'detached', 1, 1, 0)

  await page.keyboard.press('Tab')
  await expect(stopParentButton).toBeFocused()
  await expect(stopParentButton).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')

  await expect(demo.getByTestId('parent-stop-calls')).toHaveText('2')
  await expect(demo.getByTestId('parent-scope-state')).toHaveAttribute('data-state', 'stopped')
  await expect(demo.getByTestId('attached-scope-state')).toHaveAttribute('data-state', 'stopped')
  await expect(demo.getByTestId('detached-scope-state')).toHaveAttribute('data-state', 'active')
  await expectScopeMetrics(demo, 'parent', 1, 1, 1)
  await expectScopeMetrics(demo, 'attached', 1, 1, 1)
  await expectScopeMetrics(demo, 'detached', 1, 1, 0)
  await expect(demo.getByTestId('last-action')).toHaveText('父 scope 重复停止')

  await advanceButton.press('Enter')
  await expect(demo.getByTestId('source-value')).toHaveText('2')
  await expectScopeMetrics(demo, 'parent', 1, 1, 1)
  await expectScopeMetrics(demo, 'attached', 1, 1, 1)
  await expectScopeMetrics(demo, 'detached', 2, 2, 0)

  await stopDetachedButton.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(stopDetachedButton).toBeFocused()
  await expect(stopDetachedButton).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')

  await expect(demo.getByTestId('detached-stop-calls')).toHaveText('2')
  await expect(demo.getByTestId('detached-scope-state')).toHaveAttribute('data-state', 'stopped')
  await expectScopeMetrics(demo, 'detached', 2, 2, 1)
  await expect(demo.getByTestId('last-action')).toHaveText('detached scope 重复停止')

  await advanceButton.press('Enter')
  await expect(demo.getByTestId('source-value')).toHaveText('3')
  await expectScopeMetrics(demo, 'parent', 1, 1, 1)
  await expectScopeMetrics(demo, 'attached', 1, 1, 1)
  await expectScopeMetrics(demo, 'detached', 2, 2, 1)
}

/** 验证实验台全部按钮满足 44px 双轴触控尺寸。 */
async function expectControlsMeetTargetSize(demo: Locator): Promise<void> {
  const shortControls = await demo.locator('button').evaluateAll((buttons) =>
    buttons
      .map((button) => ({
        label: button.textContent?.trim() ?? '',
        width: button.getBoundingClientRect().width,
        height: button.getBoundingClientRect().height,
      }))
      .filter((button) => button.width < 44 || button.height < 44),
  )
  expect(shortControls).toEqual([])
}

/** 把实验台全部可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo.locator('h3, h4, p, button, output, dt, dd, strong').evaluateAll((elements) => {
    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue
      const originalSize = Number.parseFloat(getComputedStyle(element).fontSize)
      element.style.setProperty('font-size', String(originalSize * 2) + 'px', 'important')
    }
  })
}

/** 验证放大文字不截断、主要区块不重叠且页面没有横向滚动。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  const overflowingElements = await demo
    .locator('h3, h4, p, button, output, dt, dd, strong')
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const fits =
          element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight
        return fits
          ? []
          : [
              {
                tag: element.tagName,
                text: element.textContent?.trim().slice(0, 70),
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
                clientHeight: element.clientHeight,
                scrollHeight: element.scrollHeight,
              },
            ]
      }),
    )
  expect(overflowingElements).toEqual([])

  const overlappingSections = await demo
    .locator(
      ':scope > .demo-header, :scope > .component-boundary, :scope > .scope-list, :scope > .action-panel, :scope > .observation',
    )
    .evaluateAll((sections) =>
      sections.slice(1).flatMap((section, index) => {
        const previous = sections[index]
        if (!previous) return []
        return previous.getBoundingClientRect().bottom <= section.getBoundingClientRect().top + 1
          ? []
          : [String(previous.className) + ' -> ' + String(section.className)]
      }),
    )
  expect(overlappingSections).toEqual([])

  const overlappingCards = await demo.locator('.scope-card').evaluateAll((cards) =>
    cards.slice(1).flatMap((card, index) => {
      const previous = cards[index]
      if (!previous) return []
      return previous.getBoundingClientRect().bottom <= card.getBoundingClientRect().top + 1
        ? []
        : [String(previous.className) + ' -> ' + String(card.className)]
    }),
  )
  expect(overlappingCards).toEqual([])

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
}

/** 验证实验台及其后代没有主动过渡、动画或位移。 */
async function expectNoActiveMotion(demo: Locator): Promise<void> {
  const activeMotion = await demo.evaluate((root) =>
    [root, ...root.querySelectorAll<HTMLElement>('*')].flatMap((element) => {
      const style = getComputedStyle(element)
      const hasMotion =
        style.transitionDuration.split(',').some((duration) => duration.trim() !== '0s') ||
        style.animationDuration.split(',').some((duration) => duration.trim() !== '0s') ||
        style.transform !== 'none'
      return hasMotion ? [element.getAttribute('data-testid') ?? element.tagName] : []
    }),
  )
  expect(activeMotion).toEqual([])
}

test.use({ viewport: { width: 390, height: 844 } })

test('EffectScope 课程验证嵌套停止、detached 所有权与幂等资源清理', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + '/learn/vue/core/advanced/custom-ref-triggering')
  await page.getByRole('link', { name: '下一篇：EffectScope' }).click()
  await expect(page).toHaveURL(new RegExp(lessonPath + '$'))
  await expect(page.getByRole('heading', { name: 'EffectScope', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '上一篇：CustomRef 与触发控制' })).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：异步组件与 Suspense' })).toBeVisible()

  const demo = page.locator('.effect-scope-lifecycle-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialState(demo)
  await exerciseScopeOwnership(page, demo)
  await expectControlsMeetTargetSize(demo)
  await expectNoActiveMotion(demo)

  await page.reload()
  const enlargedDemo = page.locator('.effect-scope-lifecycle-lab-demo')
  await applyDoubleTextSize(enlargedDemo)
  await expectInitialState(enlargedDemo)
  await exerciseScopeOwnership(page, enlargedDemo)
  await expectControlsMeetTargetSize(enlargedDemo)
  await expectContentFits(page, enlargedDemo)
  await expectNoActiveMotion(enlargedDemo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.effect-scope-lifecycle-lab-demo')
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expectInitialState(reducedDemo)
  await expectControlsMeetTargetSize(reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expectNoActiveMotion(reducedDemo)

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
