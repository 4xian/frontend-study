import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/advanced/performance'

/** 返回指定列表中对应课程 ID 的行。 */
function getCourseRow(demo: Locator, kind: 'broad' | 'stable', courseId: string): Locator {
  return demo.locator(`[data-testid="${kind}-course-row"][data-course-id="${courseId}"]`)
}

/** 验证两组列表只有指定课程处于选中状态。 */
async function expectSelectedCourse(demo: Locator, courseId: string): Promise<void> {
  for (const kind of ['broad', 'stable'] as const) {
    const rows = demo.getByTestId(`${kind}-course-row`)
    await expect(rows).toHaveCount(3)
    await expect(getCourseRow(demo, kind, courseId)).toHaveAttribute('aria-current', 'true')
    await expect(getCourseRow(demo, kind, courseId)).toContainText('已选择')
    await expect(
      demo.locator(`[data-testid="${kind}-course-row"][aria-current="true"]`),
    ).toHaveCount(1)
  }
}

/** 验证实验台初始选中、更新和计算缓存证据。 */
async function expectInitialState(demo: Locator): Promise<void> {
  await expect(demo.getByTestId('select-course-reactivity')).toHaveAttribute('aria-pressed', 'true')
  await expect(demo.getByTestId('select-course-components')).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await expect(demo.getByTestId('select-course-rendering')).toHaveAttribute('aria-pressed', 'false')
  await expectSelectedCourse(demo, 'reactivity')
  await expect(demo.getByTestId('broad-update-total')).toHaveText('更新 0 次')
  await expect(demo.getByTestId('stable-update-total')).toHaveText('更新 0 次')
  await expect(demo.getByTestId('computed-run-count')).toHaveText('computed getter 执行 1 次')
  await expect(demo.getByTestId('unrelated-refresh-count')).toHaveText('无关刷新 0 次')
}

/** 用键盘完成两次选择与一次无关刷新，并验证确定性的更新差异。 */
async function exerciseRenderingCost(page: Page, demo: Locator): Promise<void> {
  await expectInitialState(demo)

  const reactivityButton = demo.getByTestId('select-course-reactivity')
  const componentsButton = demo.getByTestId('select-course-components')
  const renderingButton = demo.getByTestId('select-course-rendering')
  const refreshButton = demo.getByTestId('refresh-unrelated')

  await reactivityButton.focus()
  await page.keyboard.press('Tab')
  await expect(componentsButton).toBeFocused()
  await expect(componentsButton).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')

  await expectSelectedCourse(demo, 'components')
  await expect(demo.getByTestId('selected-summary')).toHaveText('当前选中：组件通信')
  await expect(demo.getByTestId('broad-update-total')).toHaveText('更新 3 次')
  await expect(demo.getByTestId('stable-update-total')).toHaveText('更新 2 次')
  await expect(demo.getByTestId('computed-run-count')).toHaveText('computed getter 执行 2 次')
  await expect(demo.getByTestId('rendering-result')).toHaveText(
    '选择变化累计：宽 props 3 次，稳定 props 2 次。',
  )

  await page.keyboard.press('Tab')
  await expect(renderingButton).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(refreshButton).toBeFocused()
  await expect(refreshButton).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')

  await expect(demo.getByTestId('unrelated-refresh-count')).toHaveText('无关刷新 1 次')
  await expect(demo.getByTestId('broad-update-total')).toHaveText('更新 3 次')
  await expect(demo.getByTestId('stable-update-total')).toHaveText('更新 2 次')
  await expect(demo.getByTestId('computed-run-count')).toHaveText('computed getter 执行 2 次')

  await page.keyboard.press('Shift+Tab')
  await expect(renderingButton).toBeFocused()
  await page.keyboard.press('Enter')

  await expectSelectedCourse(demo, 'rendering')
  await expect(demo.getByTestId('selected-summary')).toHaveText('当前选中：渲染机制')
  await expect(demo.getByTestId('broad-update-total')).toHaveText('更新 6 次')
  await expect(demo.getByTestId('stable-update-total')).toHaveText('更新 4 次')
  await expect(demo.getByTestId('computed-run-count')).toHaveText('computed getter 执行 3 次')
  await expect(demo.getByTestId('rendering-result')).toHaveText(
    '选择变化累计：宽 props 6 次，稳定 props 4 次。',
  )
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

/** 验证全部按钮都能通过键盘获得清晰焦点。 */
async function expectControlsShowKeyboardFocus(page: Page, demo: Locator): Promise<void> {
  const controls = await demo.locator('button').all()

  for (const control of controls) {
    await control.focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    await expect(control).toBeFocused()
    await expect(control).toHaveCSS('outline-style', 'solid')
  }
}

/** 把实验台全部可见文字放大到 200%。 */
async function applyDoubleTextSize(page: Page): Promise<void> {
  await page
    .locator(
      '.performance-rendering-lab-demo h3, .performance-rendering-lab-demo h4, .performance-rendering-lab-demo p, .performance-rendering-lab-demo button, .performance-rendering-lab-demo strong, .performance-rendering-lab-demo span',
    )
    .evaluateAll((elements) => {
      for (const element of elements) {
        if (!(element instanceof HTMLElement)) continue
        const originalSize = Number.parseFloat(getComputedStyle(element).fontSize)
        element.style.setProperty('font-size', `${originalSize * 2}px`, 'important')
      }
    })
}

/** 验证放大文字不截断、主要区域不重叠且页面没有横向滚动。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  const overflowingElements = await demo
    .locator('h3, h4, p, button, strong, span, [role="status"]')
    .evaluateAll((elements) => {
      const demoRect = elements[0]
        ?.closest('.performance-rendering-lab-demo')
        ?.getBoundingClientRect()
      if (!demoRect) return [{ reason: '未找到实验台边界' }]

      return elements.flatMap((element) => {
        const rect = element.getBoundingClientRect()
        const fits =
          rect.left >= demoRect.left - 1 &&
          rect.right <= demoRect.right + 1 &&
          element.scrollWidth <= element.clientWidth &&
          element.scrollHeight <= element.clientHeight
        return fits
          ? []
          : [
              {
                tag: element.tagName,
                text: element.textContent?.trim().slice(0, 80),
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
                clientHeight: element.clientHeight,
                scrollHeight: element.scrollHeight,
              },
            ]
      })
    })
  expect(overflowingElements).toEqual([])

  const overlappingSections = await demo
    .locator(
      ':scope > .lab-header, :scope > .selection-controls, :scope > .refresh-controls, :scope > .computed-evidence, :scope > .comparison-lanes, :scope > .result-summary',
    )
    .evaluateAll((sections) =>
      sections.slice(1).flatMap((section, index) => {
        const previous = sections[index]
        if (!previous) return []
        return previous.getBoundingClientRect().bottom <= section.getBoundingClientRect().top + 1
          ? []
          : [`${previous.className} -> ${section.className}`]
      }),
    )
  expect(overlappingSections).toEqual([])

  const overlappingLanes = await demo.locator('.comparison-lane').evaluateAll((lanes) =>
    lanes.slice(1).flatMap((lane, index) => {
      const previous = lanes[index]
      if (!previous) return []
      return previous.getBoundingClientRect().bottom <= lane.getBoundingClientRect().top + 1
        ? []
        : [`${previous.className} -> ${lane.className}`]
    }),
  )
  expect(overlappingLanes).toEqual([])

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

test('性能优化课程验证稳定 props 与 computed 缓存减少无关更新', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + '/learn/vue/core/advanced/plugins')
  await page.getByRole('link', { name: '下一篇：性能优化' }).click()
  await expect(page).toHaveURL(new RegExp(lessonPath + '$'))
  await expect(page.getByRole('heading', { name: '性能优化', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '上一篇：插件' })).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：SSR 与 Hydration' })).toBeVisible()

  const demo = page.locator('.performance-rendering-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await exerciseRenderingCost(page, demo)
  await expectControlsMeetTargetSize(demo)
  await expectControlsShowKeyboardFocus(page, demo)
  await expectNoActiveMotion(demo)

  await page.reload()
  const enlargedDemo = page.locator('.performance-rendering-lab-demo')
  await applyDoubleTextSize(page)
  await exerciseRenderingCost(page, enlargedDemo)
  await expectControlsMeetTargetSize(enlargedDemo)
  await expectContentFits(page, enlargedDemo)
  await expectNoActiveMotion(enlargedDemo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.performance-rendering-lab-demo')
  await applyDoubleTextSize(page)
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await exerciseRenderingCost(page, reducedDemo)
  await expectControlsMeetTargetSize(reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expectNoActiveMotion(reducedDemo)

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
