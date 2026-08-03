import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/advanced/async-components-suspense'

/** 返回指定边界、轮次与名称的公开 Suspense 事件。 */
function getRoundEvent(demo: Locator, mode: string, round: number, name: string): Locator {
  return demo.locator(`[data-mode="${mode}"][data-event="${name}"][data-round="${round}"]`)
}

/** 验证实验台内按钮满足 44px 双轴触控尺寸。 */
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

/** 验证 timeout 0 与正数 timeout 的公开分支和事件序列。 */
async function exerciseBoundary(demo: Locator): Promise<void> {
  const clearEvents = demo.getByTestId('clear-suspense-events')
  const phase = demo.getByTestId('boundary-phase')
  const immediateFallback = demo.getByTestId('fallback-content-immediate')
  const delayedFallback = demo.getByTestId('fallback-content-delayed')
  const immediateContent = demo.getByTestId('resolved-content-immediate')
  const delayedContent = demo.getByTestId('resolved-content-delayed')

  await expect(immediateContent).toContainText('第 1 轮内容')
  await expect(delayedContent).toContainText('第 1 轮内容')
  await clearEvents.press('Enter')
  await expect(demo.getByTestId('empty-event-log')).toBeVisible()

  await demo.getByTestId('show-fallback-now').press('Enter')
  await expect(immediateFallback).toContainText('第 2 轮内容')
  await expect(phase).toContainText('立即边界：显示后备内容')
  await expect(immediateContent).toContainText('第 2 轮内容')
  await expect(getRoundEvent(demo, 'immediate', 2, 'pending')).toHaveCount(1)
  await expect(getRoundEvent(demo, 'immediate', 2, 'fallback')).toHaveCount(1)
  await expect(getRoundEvent(demo, 'immediate', 2, 'resolve')).toHaveCount(1)
  await expect(demo.locator('[data-mode="immediate"][data-round="2"]')).toHaveText([
    '立即边界 · 第 2 轮 · pending',
    '立即边界 · 第 2 轮 · fallback',
    '立即边界 · 第 2 轮 · resolve',
  ])
  await expect(delayedContent).toContainText('第 1 轮内容')
  await expect(demo.locator('[data-mode="delayed"]')).toHaveCount(0)

  await clearEvents.press('Enter')
  await demo.getByTestId('keep-stale-content').press('Enter')
  await expect(phase).toContainText('延迟边界：等待新根')
  await expect(delayedContent).toContainText('第 1 轮内容')
  await expect(getRoundEvent(demo, 'delayed', 2, 'pending')).toHaveCount(1)
  await expect(getRoundEvent(demo, 'delayed', 2, 'fallback')).toHaveCount(0)
  await expect(delayedContent).toContainText('第 2 轮内容')
  await expect(getRoundEvent(demo, 'delayed', 2, 'resolve')).toHaveCount(1)
  await expect(demo.locator('[data-mode="delayed"][data-round="2"]')).toHaveText([
    '延迟边界 · 第 2 轮 · pending',
    '延迟边界 · 第 2 轮 · resolve',
  ])
  await expect(delayedFallback).toHaveCount(0)
  await expect(immediateContent).toContainText('第 2 轮内容')
  await expect(demo.locator('[data-mode="immediate"]')).toHaveCount(0)
}

/** 把实验台文本放大到 200%，用于复跑完整交互路径。 */
async function applyDoubleTextSize(page: Page): Promise<void> {
  await page.addStyleTag({
    content:
      '\n      .suspense-boundary-lab-demo h3,\n      .suspense-boundary-lab-demo h4,\n      .suspense-boundary-lab-demo p,\n      .suspense-boundary-lab-demo button,\n      .suspense-boundary-lab-demo li,\n      .suspense-boundary-lab-demo [role="status"] {\n        font-size: 200% !important;\n      }\n    ',
  })
}

/** 验证按钮、状态与日志不截断或产生页面横向滚动。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  const contentFits = await demo
    .locator('h3, h4, p, button, li, [role="status"]')
    .evaluateAll((elements) => {
      const demoRect = elements[0]?.closest('.suspense-boundary-lab-demo')?.getBoundingClientRect()
      if (!demoRect) return false
      return elements.every((element) => {
        const rect = element.getBoundingClientRect()
        return (
          rect.left >= demoRect.left - 1 &&
          rect.right <= demoRect.right + 1 &&
          element.scrollWidth <= element.clientWidth &&
          element.scrollHeight <= element.clientHeight
        )
      })
    })

  expect(contentFits).toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
}

test.use({ viewport: { width: 390, height: 844 } })

test('异步组件与 Suspense 课程验证 fallback、旧内容保留与事件边界', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + '/learn/vue/core/advanced/effect-scope')
  await page.getByRole('link', { name: '下一篇：异步组件与 Suspense' }).click()
  await expect(page).toHaveURL(new RegExp(lessonPath + '$'))
  await expect(
    page.getByRole('heading', { name: '异步组件与 Suspense', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: '上一篇：EffectScope' })).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：错误处理' })).toBeVisible()

  const demo = page.locator('.suspense-boundary-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await exerciseBoundary(demo)
  await expectButtonsMeetTargetSize(demo)

  await page.reload()
  const enlargedDemo = page.locator('.suspense-boundary-lab-demo')
  await applyDoubleTextSize(page)
  await exerciseBoundary(enlargedDemo)
  await expectButtonsMeetTargetSize(enlargedDemo)
  await expectContentFits(page, enlargedDemo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.suspense-boundary-lab-demo')
  await applyDoubleTextSize(page)
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await exerciseBoundary(reducedDemo)
  await expectButtonsMeetTargetSize(reducedDemo)
  await expectContentFits(page, reducedDemo)

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
