import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

type PanelId = 'editor' | 'preview' | 'settings'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/intermediate/dynamic-components-keep-alive'

/** 验证当前活动面板及其公开局部计数。 */
async function expectActivePanel(demo: Locator, panelId: PanelId, count: number): Promise<void> {
  const activePanel = demo.locator('[data-testid="active-panel"]')
  await expect(activePanel).toHaveCount(1)
  await expect(activePanel).toHaveAttribute('data-panel', panelId)
  await expect(activePanel.locator('[data-state="local-count"]')).toHaveText(String(count))
  await expect(demo.locator(`[data-panel-option="${panelId}"]`)).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(demo.locator('[data-panel-option][aria-pressed="true"]')).toHaveCount(1)
}

/** 验证 Tab 与 Shift+Tab 能跨越面板和控制区，且键盘焦点清晰可见。 */
async function expectKeyboardTraversal(page: Page, demo: Locator): Promise<void> {
  const editorOption = demo.locator('[data-panel-option="editor"]')
  const previewOption = demo.locator('[data-panel-option="preview"]')
  const settingsOption = demo.locator('[data-panel-option="settings"]')
  const cacheToggle = demo.locator('[data-testid="cache-toggle"]')

  await editorOption.focus()
  await page.keyboard.press('Tab')
  await expect(previewOption).toBeFocused()
  await expect(previewOption).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Shift+Tab')
  await expect(editorOption).toBeFocused()

  await settingsOption.focus()
  await page.keyboard.press('Tab')
  await expect(cacheToggle).toBeFocused()
  await expect(cacheToggle).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Shift+Tab')
  await expect(settingsOption).toBeFocused()
}

/** 执行缓存保留、默认重建、重置和 LRU 淘汰的完整公开流程。 */
async function exerciseCacheContract(demo: Locator): Promise<void> {
  const cacheToggle = demo.locator('[data-testid="cache-toggle"]')
  const resetButton = demo.locator('[data-testid="reset-cache-lab"]')
  const incrementButton = demo.locator('[data-testid="increment-local-count"]')

  await expect(cacheToggle).toHaveAttribute('aria-pressed', 'true')
  await expect(cacheToggle).toHaveText('关闭缓存')
  await expectActivePanel(demo, 'editor', 0)
  await incrementButton.press('Enter')
  await expectActivePanel(demo, 'editor', 1)
  await demo.locator('[data-panel-option="preview"]').press('Enter')
  await expectActivePanel(demo, 'preview', 0)
  await demo.locator('[data-panel-option="editor"]').click()
  await expectActivePanel(demo, 'editor', 1)

  await cacheToggle.press('Space')
  await expect(cacheToggle).toHaveAttribute('aria-pressed', 'false')
  await expect(cacheToggle).toHaveText('开启缓存')
  await expectActivePanel(demo, 'editor', 0)
  await incrementButton.click()
  await expectActivePanel(demo, 'editor', 1)
  await demo.locator('[data-panel-option="preview"]').click()
  await expectActivePanel(demo, 'preview', 0)
  await demo.locator('[data-panel-option="editor"]').click()
  await expectActivePanel(demo, 'editor', 0)

  await resetButton.click()
  await expect(cacheToggle).toHaveAttribute('aria-pressed', 'true')
  await expectActivePanel(demo, 'editor', 0)
  await incrementButton.click()
  await expectActivePanel(demo, 'editor', 1)
  await demo.locator('[data-panel-option="preview"]').click()
  await expectActivePanel(demo, 'preview', 0)
  await demo.locator('[data-panel-option="settings"]').click()
  await expectActivePanel(demo, 'settings', 0)
  await demo.locator('[data-panel-option="editor"]').click()
  await expectActivePanel(demo, 'editor', 0)

  await resetButton.click()
  await incrementButton.click()
  await demo.locator('[data-panel-option="preview"]').click()
  await expectActivePanel(demo, 'preview', 0)
  await demo.locator('[data-panel-option="editor"]').click()
  await expectActivePanel(demo, 'editor', 1)

  await demo.locator('[data-panel-option="preview"]').click()
  await demo.locator('[data-panel-option="settings"]').click()
  await demo.locator('[data-panel-option="editor"]').click()
  await expect(demo.locator('[data-testid="active-panel"]')).toHaveCount(1)
  await expect(demo.locator('[data-testid="active-panel"]')).toHaveAttribute('data-panel', 'editor')
  await expect(demo.locator('[data-state="cache-summary"]')).toHaveText(
    '当前：编辑；缓存：开启；最多缓存：2',
  )
}

/** 验证实验台在 200% 文本下没有元素截断或页面级横向溢出。 */
async function expectContentFitsAtDoubleTextSize(page: Page, demo: Locator): Promise<void> {
  await page.addStyleTag({
    content: `
      .component-cache-lab-demo h3,
      .component-cache-lab-demo h4,
      .component-cache-lab-demo p,
      .component-cache-lab-demo label,
      .component-cache-lab-demo output,
      .component-cache-lab-demo button,
      .component-cache-lab-demo [role="status"] {
        font-size: 200% !important;
      }
    `,
  })

  const contentFits = await demo
    .locator('h3, h4, p, label, output, button, [role="status"]')
    .evaluateAll((elements) => {
      const demoRect = elements[0]?.closest('.component-cache-lab-demo')?.getBoundingClientRect()
      if (!demoRect) return false

      return elements.every((element) => {
        const elementRect = element.getBoundingClientRect()
        return (
          elementRect.left >= demoRect.left - 1 &&
          elementRect.right <= demoRect.right + 1 &&
          elementRect.top >= demoRect.top - 1 &&
          elementRect.bottom <= demoRect.bottom + 1 &&
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

/** 验证实验台内所有原生按钮满足 44px 双轴触控尺寸。 */
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

test.use({ viewport: { width: 390, height: 844 } })

test('动态组件课程验证缓存模式、LRU 淘汰与移动端降级', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleProblems.push(message.text())
    }
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(`${appBaseUrl}/learn/vue/core/intermediate/transitions`)
  await page.getByRole('link', { name: '下一篇：动态组件与 KeepAlive' }).click()
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
  await expect(
    page.getByRole('heading', { name: '动态组件与 KeepAlive', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：Teleport' })).toBeVisible()

  const demo = page.locator('.component-cache-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectKeyboardTraversal(page, demo)
  await exerciseCacheContract(demo)
  await expectButtonsMeetTargetSize(demo)
  await expectContentFitsAtDoubleTextSize(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.component-cache-lab-demo')
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect(reducedDemo.locator('[data-panel-option="preview"]')).toHaveCSS(
    'transition-duration',
    '0s',
  )
  await expectKeyboardTraversal(page, reducedDemo)
  await exerciseCacheContract(reducedDemo)
  await expectButtonsMeetTargetSize(reducedDemo)
  await expectContentFitsAtDoubleTextSize(page, reducedDemo)

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
