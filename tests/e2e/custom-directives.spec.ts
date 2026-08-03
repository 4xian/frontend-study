import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/advanced/custom-directives'

/** 验证实验台内所有按钮满足 44px 双轴触控尺寸。 */
async function expectButtonsMeetTargetSize(demo: Locator): Promise<void> {
  const shortButtons = await demo.getByRole('button').evaluateAll((buttons) =>
    buttons
      .map((button) => ({
        label: button.textContent?.trim() ?? '',
        width: button.getBoundingClientRect().width,
        height: button.getBoundingClientRect().height,
      }))
      .filter((button) => button.width < 44 || button.height < 44),
  )
  expect(shortButtons).toEqual([])
}

/** 验证钩子日志按精确顺序记录公开生命周期。 */
async function expectHookOrder(demo: Locator, expectedOrder: string[]): Promise<void> {
  const entries = demo.getByTestId('hook-entry')
  await expect(entries).toHaveCount(expectedOrder.length)
  expect(await entries.evaluateAll((items) => items.map((item) => item.dataset.hook))).toEqual(
    expectedOrder,
  )
}

/** 用键盘验证无关更新、绑定更新、卸载清理和重新挂载。 */
async function exerciseDirectiveLifecycle(demo: Locator): Promise<void> {
  const updateUnrelated = demo.getByTestId('update-unrelated')
  const switchShortcut = demo.getByTestId('switch-shortcut')
  const toggleTarget = demo.getByTestId('toggle-directive-target')
  let target = demo.getByTestId('directive-target')

  await expect(target).toHaveAttribute('aria-keyshortcuts', 'K')
  await expect(demo.getByTestId('active-resource-count')).toContainText('活动资源 1')
  await expect(demo.getByTestId('shortcut-summary')).toContainText('绑定写入 1')
  await expectHookOrder(demo, ['mounted'])

  await updateUnrelated.focus()
  await demo.page().keyboard.press('Shift+Tab')
  await expect(target).toBeFocused()
  expect(await target.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid')

  await demo.page().keyboard.press('k')
  await expect(demo.getByTestId('shortcut-hit-count')).toContainText('快捷键命中 1')

  await updateUnrelated.press('Enter')
  await expect(demo.getByTestId('unrelated-count')).toContainText('无关计数 1')
  await expect(demo.getByTestId('shortcut-summary')).toContainText('绑定写入 1')
  await expectHookOrder(demo, ['mounted', 'updated'])
  await expect(demo.getByTestId('hook-entry').last()).toContainText('未变化，跳过 DOM 写入')

  await switchShortcut.press('Enter')
  await expect(target).toHaveAttribute('aria-keyshortcuts', 'M')
  await expect(demo.getByTestId('shortcut-summary')).toContainText('绑定写入 2')
  await expectHookOrder(demo, ['mounted', 'updated', 'updated'])
  await expect(demo.getByTestId('hook-entry').last()).toContainText('K → M，写入 2')

  await demo.page().keyboard.press('k')
  await expect(demo.getByTestId('shortcut-hit-count')).toContainText('快捷键命中 1')
  await demo.page().keyboard.press('m')
  await expect(demo.getByTestId('shortcut-hit-count')).toContainText('快捷键命中 2')

  await toggleTarget.press('Enter')
  await expect(target).toHaveCount(0)
  await expect(demo.getByTestId('directive-placeholder')).toBeVisible()
  await expect(demo.getByTestId('active-resource-count')).toContainText('活动资源 0')
  await expectHookOrder(demo, ['mounted', 'updated', 'updated', 'beforeUnmount', 'unmounted'])

  await demo.page().keyboard.press('m')
  await expect(demo.getByTestId('shortcut-hit-count')).toContainText('快捷键命中 2')

  await toggleTarget.press('Enter')
  target = demo.getByTestId('directive-target')
  await expect(target).toHaveAttribute('aria-keyshortcuts', 'M')
  await expect(demo.getByTestId('active-resource-count')).toContainText('活动资源 1')
  await expect(demo.getByTestId('shortcut-summary')).toContainText('绑定写入 3')
  await expectHookOrder(demo, [
    'mounted',
    'updated',
    'updated',
    'beforeUnmount',
    'unmounted',
    'mounted',
  ])

  await demo.page().keyboard.press('m')
  await expect(demo.getByTestId('shortcut-hit-count')).toContainText('快捷键命中 3')
}

/** 把实验台文本放大到 200%，用于复跑完整交互路径。 */
async function applyDoubleTextSize(page: Page): Promise<void> {
  await page.addStyleTag({
    content:
      '\n      .directive-lifecycle-lab-demo h3,\n      .directive-lifecycle-lab-demo h4,\n      .directive-lifecycle-lab-demo p,\n      .directive-lifecycle-lab-demo button,\n      .directive-lifecycle-lab-demo span,\n      .directive-lifecycle-lab-demo strong,\n      .directive-lifecycle-lab-demo li,\n      .directive-lifecycle-lab-demo code {\n        font-size: 200% !important;\n      }\n    ',
  })
}

/** 验证放大文本与控件不截断，也不产生页面横向滚动。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  const overflowingElements = await demo
    .locator('h3, h4, p, button, span, strong, li, code, [role="status"]')
    .evaluateAll((elements) => {
      const demoRect = elements[0]
        ?.closest('.directive-lifecycle-lab-demo')
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
                rectWidth: Math.round(rect.width),
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
      ':scope > .demo-header, :scope > .summary, :scope > .shortcut-target, :scope > .shortcut-placeholder, :scope > .controls, :scope > .hook-panel',
    )
    .evaluateAll((sections) =>
      sections.slice(1).flatMap((section, index) => {
        const previous = sections[index]
        if (!previous) return []
        const previousRect = previous.getBoundingClientRect()
        const currentRect = section.getBoundingClientRect()
        return previousRect.bottom <= currentRect.top + 1
          ? []
          : [`${previous.className} -> ${section.className}`]
      }),
    )
  expect(overlappingSections).toEqual([])

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
}

/** 验证 reduced motion 同时关闭目标和日志的过渡，并移除目标位移。 */
async function expectReducedMotionStyles(demo: Locator): Promise<void> {
  const styles = await demo.evaluate((element) => {
    const target = element.querySelector<HTMLElement>('[data-testid="directive-target"]')
    const hookEntry = element.querySelector<HTMLElement>('[data-testid="hook-entry"]')
    if (!target || !hookEntry) return null

    hookEntry.classList.add('hook-entry-enter-active')
    const result = {
      targetDuration: getComputedStyle(target).transitionDuration,
      targetTransform: getComputedStyle(target).transform,
      hookDuration: getComputedStyle(hookEntry).transitionDuration,
    }
    hookEntry.classList.remove('hook-entry-enter-active')
    return result
  })

  expect(styles).toEqual({
    targetDuration: '0s',
    targetTransform: 'none',
    hookDuration: '0s',
  })
}

test.use({ viewport: { width: 390, height: 844 } })

test('自定义指令课程验证更新跳过、资源清理与重新挂载', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + '/learn/vue/core/advanced/error-handling')
  await page.getByRole('link', { name: '下一篇：自定义指令' }).click()
  await expect(page).toHaveURL(new RegExp(lessonPath + '$'))
  await expect(page.getByRole('heading', { name: '自定义指令', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '上一篇：错误处理' })).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：渲染函数与虚拟节点' })).toBeVisible()

  const demo = page.locator('.directive-lifecycle-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await exerciseDirectiveLifecycle(demo)
  await expectButtonsMeetTargetSize(demo)

  await page.reload()
  const enlargedDemo = page.locator('.directive-lifecycle-lab-demo')
  await applyDoubleTextSize(page)
  await exerciseDirectiveLifecycle(enlargedDemo)
  await expectButtonsMeetTargetSize(enlargedDemo)
  await expectContentFits(page, enlargedDemo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.directive-lifecycle-lab-demo')
  await applyDoubleTextSize(page)
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await exerciseDirectiveLifecycle(reducedDemo)
  await expectReducedMotionStyles(reducedDemo)
  await expectButtonsMeetTargetSize(reducedDemo)
  await expectContentFits(page, reducedDemo)

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
