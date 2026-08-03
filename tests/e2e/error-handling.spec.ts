import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/advanced/error-handling'

/** 返回指定轮次的边界捕获日志。 */
function getRoundEntries(demo: Locator, round: number): Locator {
  return demo.locator(`[data-round="${round}"]`)
}

/** 验证本轮日志中的边界顺序与公开传播顺序一致。 */
async function expectBoundaryOrder(
  demo: Locator,
  round: number,
  expectedOrder: string[],
): Promise<void> {
  const entries = getRoundEntries(demo, round)
  await expect(entries).toHaveCount(expectedOrder.length)
  expect(await entries.evaluateAll((items) => items.map((item) => item.dataset.boundary))).toEqual(
    expectedOrder,
  )
}

/** 用键盘验证内层截断、向外传播和重新挂载三条路径。 */
async function exerciseErrorBoundaries(demo: Locator): Promise<void> {
  const stopAtInner = demo.getByTestId('stop-at-inner')
  const fallback = demo.getByTestId('error-boundary-fallback')
  const healthyContent = demo.getByTestId('healthy-boundary-content')

  await expect(healthyContent).toContainText('第 1 轮内容正常')
  await expect(stopAtInner).toBeChecked()

  await demo.getByTestId('trigger-render-error').press('Enter')
  await expect(fallback).toHaveAttribute('data-boundary', 'inner')
  await expect(healthyContent).toHaveCount(0)
  await expectBoundaryOrder(demo, 1, ['inner'])

  await demo.getByTestId('reset-error-boundary').press('Enter')
  await expect(healthyContent).toContainText('第 2 轮内容正常')
  await expect(fallback).toHaveCount(0)

  await demo.getByTestId('clear-capture-log').press('Enter')
  await expect(demo.getByText('尚无捕获记录')).toBeVisible()
  await stopAtInner.press('Space')
  await expect(stopAtInner).not.toBeChecked()
  await expect(demo.getByTestId('propagation-status')).toContainText('传播到外层边界')

  await demo.getByTestId('trigger-async-error').press('Enter')
  await expect(fallback).toHaveAttribute('data-boundary', 'outer')
  await expect(healthyContent).toHaveCount(0)
  await expectBoundaryOrder(demo, 2, ['inner', 'outer'])

  await demo.getByTestId('reset-error-boundary').press('Enter')
  await expect(healthyContent).toContainText('第 3 轮内容正常')
  await expect(fallback).toHaveCount(0)
}

/** 验证按钮与 checkbox 的可点击标签满足 44px 双轴触控尺寸。 */
async function expectControlsMeetTargetSize(demo: Locator): Promise<void> {
  const shortControls = await demo.locator('button, label.toggle-control').evaluateAll((controls) =>
    controls
      .map((control) => ({
        label: control.textContent?.trim() ?? '',
        width: control.getBoundingClientRect().width,
        height: control.getBoundingClientRect().height,
      }))
      .filter((control) => control.width < 44 || control.height < 44),
  )
  expect(shortControls).toEqual([])
}

/** 把实验台文本放大到 200%，用于复跑完整交互路径。 */
async function applyDoubleTextSize(page: Page): Promise<void> {
  await page.addStyleTag({
    content:
      '\n      .error-boundary-lab-demo h3,\n      .error-boundary-lab-demo h4,\n      .error-boundary-lab-demo p,\n      .error-boundary-lab-demo button,\n      .error-boundary-lab-demo label,\n      .error-boundary-lab-demo li,\n      .error-boundary-lab-demo span {\n        font-size: 200% !important;\n      }\n    ',
  })
}

/** 验证文本与控件不截断，也不产生页面横向滚动。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  const contentFits = await demo
    .locator('h3, h4, p, button, label, li, span')
    .evaluateAll((elements) => {
      const demoRect = elements[0]?.closest('.error-boundary-lab-demo')?.getBoundingClientRect()
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

test('错误处理课程验证嵌套传播、异步拒绝与显式恢复', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + '/learn/vue/core/advanced/async-components-suspense')
  await page.getByRole('link', { name: '下一篇：错误处理' }).click()
  await expect(page).toHaveURL(new RegExp(lessonPath + '$'))
  await expect(page.getByRole('heading', { name: '错误处理', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '上一篇：异步组件与 Suspense' })).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：自定义指令' })).toBeVisible()

  const demo = page.locator('.error-boundary-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await exerciseErrorBoundaries(demo)
  await expectControlsMeetTargetSize(demo)

  await page.reload()
  const enlargedDemo = page.locator('.error-boundary-lab-demo')
  await applyDoubleTextSize(page)
  await exerciseErrorBoundaries(enlargedDemo)
  await expectControlsMeetTargetSize(enlargedDemo)
  await expectContentFits(page, enlargedDemo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.error-boundary-lab-demo')
  await applyDoubleTextSize(page)
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await exerciseErrorBoundaries(reducedDemo)
  await expectControlsMeetTargetSize(reducedDemo)
  await expectContentFits(page, reducedDemo)

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
