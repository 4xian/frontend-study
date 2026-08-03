import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/intermediate/teleport'

/** 验证指定区域内的按钮都满足 44px 双轴触控尺寸。 */
async function expectButtonsMeetTargetSize(container: Locator): Promise<void> {
  const shortButtons = await container.getByRole('button').evaluateAll((buttons) =>
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

/** 验证目标元素没有越过指定祖先边界或产生内部截断。 */
async function expectElementsFit(targets: Locator, boundarySelector: string): Promise<void> {
  const contentFits = await targets.evaluateAll((elements, selector) => {
    const boundaryRect = elements[0]?.closest(selector)?.getBoundingClientRect()
    if (!boundaryRect) return false

    return elements.every((element) => {
      const rect = element.getBoundingClientRect()
      return (
        rect.left >= boundaryRect.left - 1 &&
        rect.right <= boundaryRect.right + 1 &&
        rect.top >= boundaryRect.top - 1 &&
        rect.bottom <= boundaryRect.bottom + 1 &&
        element.scrollWidth <= element.clientWidth &&
        element.scrollHeight <= element.clientHeight
      )
    })
  }, boundarySelector)

  expect(contentFits).toBe(true)
}

/** 验证 200% 文本下 Demo、overlay 与 inline 内容都不越界或截断。 */
async function expectContentFitsAtDoubleTextSize(page: Page, demo: Locator): Promise<void> {
  await page.addStyleTag({
    content:
      '\n      .teleport-dialog-lab-demo h3,\n      .teleport-dialog-lab-demo h4,\n      .teleport-dialog-lab-demo p,\n      .teleport-dialog-lab-demo button,\n      .teleport-dialog-lab-demo [role="status"],\n      [data-testid="teleport-overlay-dialog"] h4,\n      [data-testid="teleport-overlay-dialog"] p,\n      [data-testid="teleport-overlay-dialog"] button {\n        font-size: 200% !important;\n      }\n    ',
  })

  await expectElementsFit(
    demo.locator('h3, h4, p, button, [role="status"]'),
    '.teleport-dialog-lab-demo',
  )

  const openButton = demo.getByTestId('open-teleport-dialog')
  const modeToggle = demo.getByTestId('teleport-inline-toggle')
  await openButton.press('Enter')
  const dialog = page.getByTestId('teleport-overlay-dialog')
  await expect(dialog).toBeVisible()
  await expectElementsFit(
    dialog.locator('h4, p, button'),
    '[data-testid="teleport-overlay-dialog"]',
  )
  await expectButtonsMeetTargetSize(dialog)
  await page.getByTestId('teleport-dialog-confirm').press('Enter')

  await modeToggle.press('Space')
  await openButton.press('Enter')
  const inlinePanel = page.getByTestId('teleport-inline-panel')
  await expect(inlinePanel).toBeVisible()
  await expectElementsFit(inlinePanel.locator('h4, p, button'), '.teleport-dialog-lab-demo')
  await expectButtonsMeetTargetSize(inlinePanel)
  await page.getByTestId('teleport-dialog-confirm').press('Enter')
  await modeToggle.press('Space')

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
}

/** 验证 overlay 对话框的公开语义、焦点循环、Escape 和恢复焦点。 */
async function exerciseOverlay(page: Page, demo: Locator): Promise<void> {
  const openButton = demo.getByTestId('open-teleport-dialog')
  const dialog = page.getByRole('dialog', { name: 'Teleport 对话框实验' })
  const closeButton = page.getByTestId('teleport-dialog-close')
  const confirmButton = page.getByTestId('teleport-dialog-confirm')

  await openButton.press('Enter')
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('aria-modal', 'true')
  await expect(page.locator('#app')).toHaveAttribute('inert', '')
  await expect
    .poll(() => dialog.evaluate((element) => element.parentElement === document.body))
    .toBe(true)
  await expect(closeButton).toBeFocused()
  await expectButtonsMeetTargetSize(dialog)

  await page.keyboard.press('Tab')
  await expect(confirmButton).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(closeButton).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(confirmButton).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('#app')).not.toHaveAttribute('inert', '')
  await expect(openButton).toBeFocused()
  await expect(demo.locator('[data-state="parent-close-count"]')).toHaveText('1')

  await openButton.press('Enter')
  await expect(closeButton).toBeFocused()
  await confirmButton.press('Enter')
  await expect(dialog).toHaveCount(0)
  await expect(openButton).toBeFocused()
  await expect(demo.locator('[data-state="parent-close-count"]')).toHaveText('2')
}

/** 验证 disabled 行内模式不冒充 modal，且事件仍回到逻辑父组件。 */
async function exerciseInlineMode(page: Page, demo: Locator): Promise<void> {
  const modeToggle = demo.getByTestId('teleport-inline-toggle')
  const openButton = demo.getByTestId('open-teleport-dialog')
  const inlinePanel = page.getByRole('region', { name: 'Teleport 对话框实验' })

  await modeToggle.press('Space')
  await expect(modeToggle).toHaveAttribute('aria-pressed', 'true')
  await expect(demo.locator('[data-state="render-location"]')).toHaveText('DOM：原地')
  await openButton.press('Enter')
  await expect(inlinePanel).toBeVisible()
  await expect(inlinePanel).not.toHaveAttribute('aria-modal')
  await expect(page.locator('#app')).not.toHaveAttribute('inert', '')
  await expect
    .poll(() =>
      inlinePanel.evaluate((element) => Boolean(element.closest('.teleport-dialog-lab-demo'))),
    )
    .toBe(true)
  await expectButtonsMeetTargetSize(inlinePanel)
  await page.getByTestId('teleport-dialog-confirm').press('Enter')
  await expect(inlinePanel).toHaveCount(0)
  await expect(demo.locator('[data-state="parent-close-count"]')).toHaveText('3')
  await expect(openButton).toBeFocused()
}

/** 从 inline 切回 overlay，验证连续关闭后没有面板或 inert 残留。 */
async function exerciseReturnToOverlay(page: Page, demo: Locator): Promise<void> {
  const modeToggle = demo.getByTestId('teleport-inline-toggle')
  const openButton = demo.getByTestId('open-teleport-dialog')
  const dialog = page.getByRole('dialog', { name: 'Teleport 对话框实验' })
  const region = page.getByRole('region', { name: 'Teleport 对话框实验' })
  const activePanel = page.locator(
    '[data-testid="teleport-overlay-dialog"], [data-testid="teleport-inline-panel"]',
  )

  await modeToggle.press('Space')
  await expect(modeToggle).toHaveAttribute('aria-pressed', 'false')
  await expect(demo.locator('[data-state="render-location"]')).toHaveText('DOM：body')

  await openButton.press('Enter')
  await expect(dialog).toBeVisible()
  await expect(region).toHaveCount(0)
  await expect(activePanel).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(demo.locator('[data-state="parent-close-count"]')).toHaveText('4')

  await openButton.press('Enter')
  await expect(dialog).toBeVisible()
  await expect(activePanel).toHaveCount(1)
  await page.getByTestId('teleport-dialog-confirm').press('Enter')
  await expect(demo.locator('[data-state="parent-close-count"]')).toHaveText('5')
  await expect(dialog).toHaveCount(0)
  await expect(region).toHaveCount(0)
  await expect(activePanel).toHaveCount(0)
  await expect(page.locator('#app')).not.toHaveAttribute('inert', '')
  await expect(openButton).toBeFocused()
}

test.use({ viewport: { width: 390, height: 844 } })

test('Teleport 课程验证 overlay、disabled 行内模式与键盘可访问性', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + '/learn/vue/core/intermediate/dynamic-components-keep-alive')
  await page.getByRole('link', { name: '下一篇：Teleport' }).click()
  await expect(page).toHaveURL(new RegExp(lessonPath + '$'))
  await expect(page.getByRole('heading', { name: 'Teleport', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：浅层响应式与原始对象边界' })).toBeVisible()

  const demo = page.locator('.teleport-dialog-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await exerciseOverlay(page, demo)
  await exerciseInlineMode(page, demo)
  await exerciseReturnToOverlay(page, demo)
  await expectButtonsMeetTargetSize(demo)
  await expectContentFitsAtDoubleTextSize(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.teleport-dialog-lab-demo')
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect(reducedDemo).toHaveCount(1)
  await exerciseOverlay(page, reducedDemo)
  await exerciseInlineMode(page, reducedDemo)
  await exerciseReturnToOverlay(page, reducedDemo)
  await expectButtonsMeetTargetSize(reducedDemo)

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
