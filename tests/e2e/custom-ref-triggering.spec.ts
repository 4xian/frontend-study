import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/advanced/custom-ref-triggering'

/** 断言实验台处于尚未安排提交的初始状态。 */
async function expectInitialState(demo: Locator): Promise<void> {
  await expect(demo.getByTestId('draft-value')).toHaveText('Vue 3')
  await expect(demo.getByTestId('published-snapshot')).toContainText('Vue 3')
  await expect(demo.getByTestId('published-snapshot')).toHaveAttribute('data-revision', '0')
  await expect(demo.getByTestId('pending-state')).toHaveAttribute('data-state', 'idle')
  await expect(demo.getByTestId('effect-runs')).toHaveText('1')
  await expect(demo.getByTestId('trigger-count')).toHaveText('0')
  await expect(demo.getByTestId('cleanup-count')).toHaveText('0')
  await expect(demo.getByTestId('child-update-count')).toHaveText('0')
  await expect(demo.getByTestId('cancel-pending')).toBeDisabled()
}

/** 连续键入草稿，并验证 delay 到期前尚未发布。 */
async function queueDebouncedDraft(demo: Locator, text: string): Promise<void> {
  const input = demo.getByTestId('draft-input')
  await input.fill('')
  await input.pressSequentially(text, { delay: 18 })

  await expect(input).toBeFocused()
  await expect(input).toHaveCSS('outline-style', 'solid')
  await expect(demo.getByTestId('draft-value')).toHaveText(text)
  await expect(demo.getByTestId('pending-state')).toHaveAttribute('data-state', 'pending')
  await expect(demo.getByTestId('published-snapshot')).toContainText('Vue 3')
  await expect(demo.getByTestId('trigger-count')).toHaveText('0')
}

/** 等待唯一防抖提交，并断言 track/trigger 与快照身份结果。 */
async function expectCommittedDraft(demo: Locator, text: string): Promise<void> {
  await expect(demo.getByTestId('published-snapshot')).toContainText(text)
  await expect(demo.getByTestId('published-snapshot')).toHaveAttribute('data-revision', '1')
  await expect(demo.getByTestId('pending-state')).toHaveAttribute('data-state', 'idle')
  await expect(demo.getByTestId('effect-runs')).toHaveText('2')
  await expect(demo.getByTestId('trigger-count')).toHaveText('1')
  await expect(demo.getByTestId('child-update-count')).toHaveText('1')
  await expect(demo.getByTestId('observed-snapshot')).toContainText(`“${text}”，版本 1`)
}

/** 触发无关父更新并确认稳定 getter 没有更新子组件。 */
async function expectStableGetterIdentity(demo: Locator): Promise<void> {
  await demo.getByTestId('unrelated-update').press('Enter')
  await expect(demo.getByTestId('identity-result')).toContainText('无关父更新 1 次')
  await expect(demo.getByTestId('identity-result')).toContainText('getter 仍返回同一快照对象')
  await expect(demo.getByTestId('child-update-count')).toHaveText('1')
  await expect(demo.getByTestId('effect-runs')).toHaveText('2')
}

/** 用键盘取消待提交定时器，并确认旧任务不会稍后发布。 */
async function cancelPendingWithKeyboard(page: Page, demo: Locator): Promise<void> {
  const input = demo.getByTestId('draft-input')
  await input.fill('不会提交')
  await expect(demo.getByTestId('pending-state')).toHaveAttribute('data-state', 'pending')

  await input.focus()
  await page.keyboard.press('Tab')
  const unrelatedButton = demo.getByTestId('unrelated-update')
  await expect(unrelatedButton).toBeFocused()
  await expect(unrelatedButton).toHaveCSS('outline-style', 'solid')

  await page.keyboard.press('Tab')
  const cancelButton = demo.getByTestId('cancel-pending')
  await expect(cancelButton).toBeFocused()
  await expect(cancelButton).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')

  await expect(demo.getByTestId('pending-state')).toHaveAttribute('data-state', 'idle')
  await expect(demo.getByTestId('last-action')).toContainText('已取消待提交定时器')
  await page.waitForTimeout(450)
  await expect(demo.getByTestId('published-snapshot')).toHaveAttribute('data-revision', '1')
  await expect(demo.getByTestId('published-snapshot')).not.toContainText('不会提交')
  await expect(demo.getByTestId('trigger-count')).toHaveText('1')
}

/** 验证输入与按钮都满足 44px 双轴操作尺寸。 */
async function expectControlsMeetTargetSize(demo: Locator): Promise<void> {
  const shortControls = await demo.locator('input, button').evaluateAll((controls) =>
    controls
      .map((control) => ({
        label:
          control instanceof HTMLInputElement
            ? control.getAttribute('aria-label') || control.id
            : control.textContent?.trim() || control.tagName,
        width: control.getBoundingClientRect().width,
        height: control.getBoundingClientRect().height,
      }))
      .filter((control) => control.width < 44 || control.height < 44),
  )
  expect(shortControls).toEqual([])
}

/** 把实验台全部可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo.locator('h3, h4, p, label, input, button, strong, span').evaluateAll((elements) => {
    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue
      const originalSize = Number.parseFloat(getComputedStyle(element).fontSize)
      element.style.setProperty('font-size', `${originalSize * 2}px`, 'important')
    }
  })
}

/** 验证放大文本不截断、主要区块不重叠且页面没有横向滚动。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  const overflowingElements = await demo
    .locator('h3, h4, p, label, input, button, strong, span')
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const fits =
          element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight
        return fits
          ? []
          : [
              {
                tag: element.tagName,
                text: element.textContent?.trim().slice(0, 60),
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
      ':scope > .demo-header, :scope > .input-section, :scope > .actions, :scope > .snapshot-flow, :scope > .metrics, :scope > .observation',
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

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
}

/** 验证实验台没有主动过渡、动画或位移。 */
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

test('CustomRef 课程验证延迟触发、稳定 getter 身份与定时器清理', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + '/learn/vue/core/advanced/shallow-reactivity-raw-boundaries')
  await page.getByRole('link', { name: '下一篇：CustomRef 与触发控制' }).click()
  await expect(page).toHaveURL(new RegExp(lessonPath + '$'))
  await expect(
    page.getByRole('heading', { name: 'CustomRef 与触发控制', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: '上一篇：浅层响应式与原始对象边界' })).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：EffectScope' })).toBeVisible()

  const demo = page.locator('.custom-ref-trigger-control-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialState(demo)
  await queueDebouncedDraft(demo, 'customRef')
  await expectCommittedDraft(demo, 'customRef')
  await expectStableGetterIdentity(demo)
  await cancelPendingWithKeyboard(page, demo)
  await expectControlsMeetTargetSize(demo)
  await expectNoActiveMotion(demo)

  await page.reload()
  const enlargedDemo = page.locator('.custom-ref-trigger-control-lab-demo')
  await applyDoubleTextSize(enlargedDemo)
  await enlargedDemo.getByTestId('draft-input').fill('稳定快照')
  await expect(enlargedDemo.getByTestId('published-snapshot')).toContainText('稳定快照')
  await expectControlsMeetTargetSize(enlargedDemo)
  await expectContentFits(page, enlargedDemo)
  await expectNoActiveMotion(enlargedDemo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.custom-ref-trigger-control-lab-demo')
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
