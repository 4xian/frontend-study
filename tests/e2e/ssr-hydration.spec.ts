import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/advanced/ssr-hydration'

/** 断言实验台处于确定性输入与直接激活的初始状态。 */
async function expectInitialState(demo: Locator): Promise<void> {
  await expect(demo.getByRole('button', { name: '确定性输入' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(demo.getByRole('button', { name: '参与首次激活' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(demo.getByTestId('comparison-result')).toHaveAttribute('data-state', 'waiting')
  await expect(demo.getByTestId('comparison-result')).toContainText('等待执行模型比对')
  await expect(demo.getByTestId('update-client-state')).toBeDisabled()
  await expect(demo.getByTestId('server-markup')).toHaveText(
    '<article><h4>SSR 课程</h4><p>课程 #42</p></article>',
  )
  await expect(demo.getByTestId('client-markup')).toHaveText(
    '<article><h4>SSR 课程</h4><p>课程 #42</p></article>',
  )
}

/** 从最后一个策略按钮用键盘移动到比对按钮并执行。 */
async function runComparisonWithKeyboard(page: Page, demo: Locator): Promise<void> {
  await demo.getByRole('button', { name: '客户端边界' }).focus()
  await page.keyboard.press('Tab')
  const runButton = demo.getByTestId('run-comparison')
  await expect(runButton).toBeFocused()
  await expect(runButton).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')
}

/** 验证确定性、两类漂移与客户端边界的公开结果。 */
async function exerciseBoundaryModel(page: Page, demo: Locator): Promise<void> {
  await expectInitialState(demo)

  await runComparisonWithKeyboard(page, demo)
  await expect(demo.getByTestId('comparison-result')).toHaveAttribute('data-state', 'match')
  await expect(demo.getByTestId('comparison-result')).toContainText('首次渲染匹配')
  await expect(demo.getByTestId('update-client-state')).toBeEnabled()

  await demo.getByRole('button', { name: '时间文本漂移' }).press('Enter')
  await demo.getByTestId('run-comparison').press('Enter')
  await expect(demo.getByTestId('server-markup')).toContainText('08:00 UTC')
  await expect(demo.getByTestId('client-markup')).toContainText('16:00 UTC+8')
  await expect(demo.getByTestId('comparison-result')).toHaveAttribute('data-state', 'mismatch')
  await expect(demo.getByTestId('comparison-result')).toContainText('文本不匹配')

  await demo.getByRole('button', { name: '节点结构漂移' }).press('Enter')
  await demo.getByTestId('run-comparison').press('Enter')
  await expect(demo.getByTestId('comparison-result')).toContainText('节点不匹配')
  await expect(demo.getByTestId('client-markup')).toContainText('<div>额外节点</div>')

  await demo.getByRole('button', { name: '客户端边界' }).press('Enter')
  await expect(demo.getByTestId('server-markup')).toHaveText(
    '<section aria-busy="true">客户端区域占位</section>',
  )
  await expect(demo.getByTestId('client-markup')).toHaveText(
    '<section aria-busy="true">客户端区域占位</section>',
  )
  await demo.getByTestId('run-comparison').press('Enter')
  await expect(demo.getByTestId('comparison-result')).toHaveAttribute('data-state', 'boundary')
  await expect(demo.getByTestId('comparison-result')).toContainText('两端首轮占位一致')

  await demo.getByTestId('update-client-state').press('Enter')
  await demo.getByTestId('update-client-state').press('Enter')
  await expect(demo.getByTestId('client-after-mount')).toContainText('交互计数 2')

  await demo.getByTestId('reset-lab').press('Enter')
  await expectInitialState(demo)
}

/** 验证所有按钮满足 44px 双轴触控尺寸。 */
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

/** 把实验台全部可见文字放大到 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo
    .locator('h3, h4, p, button, strong, code, output, li > span')
    .evaluateAll((elements) => {
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
    .locator('h3, h4, p, button, strong, code, output, li > span, [role="status"]')
    .evaluateAll((elements) => {
      const demoRect = elements[0]
        ?.closest('.ssr-hydration-boundary-lab-demo')
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
      ':scope > .demo-header, :scope > .control-section, :scope > .snapshot-list, :scope > .comparison-result, :scope > .timeline-panel, :scope > .client-output, :scope > .actions',
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

  const overlappingSnapshots = await demo.locator('.snapshot-panel').evaluateAll((panels) =>
    panels.slice(1).flatMap((panel, index) => {
      const previous = panels[index]
      if (!previous) return []
      const previousRect = previous.getBoundingClientRect()
      const currentRect = panel.getBoundingClientRect()
      const separated =
        previousRect.bottom <= currentRect.top + 1 || previousRect.right <= currentRect.left + 1
      return separated ? [] : ['服务器快照与客户端快照重叠']
    }),
  )
  expect(overlappingSnapshots).toEqual([])

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
}

/** 验证 reduced motion 下所有实验台按钮都没有主动过渡。 */
async function expectReducedMotionStyles(demo: Locator): Promise<void> {
  const transitionDurations = await demo
    .locator('button')
    .evaluateAll((buttons) => buttons.map((button) => getComputedStyle(button).transitionDuration))
  expect(new Set(transitionDurations)).toEqual(new Set(['0s']))
}

test.use({ viewport: { width: 390, height: 844 } })

test('SSR 与 Hydration 课程验证确定性、不匹配分类与客户端边界', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(page.getByRole('heading', { name: 'SSR 与 Hydration', exact: true })).toBeVisible()

  const demo = page.locator('.ssr-hydration-boundary-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await exerciseBoundaryModel(page, demo)
  await expectControlsMeetTargetSize(demo)

  await page.reload()
  const enlargedDemo = page.locator('.ssr-hydration-boundary-lab-demo')
  await applyDoubleTextSize(enlargedDemo)
  await exerciseBoundaryModel(page, enlargedDemo)
  await expectControlsMeetTargetSize(enlargedDemo)
  await expectContentFits(page, enlargedDemo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.ssr-hydration-boundary-lab-demo')
  await applyDoubleTextSize(reducedDemo)
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await exerciseBoundaryModel(page, reducedDemo)
  await expectControlsMeetTargetSize(reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expectReducedMotionStyles(reducedDemo)

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
