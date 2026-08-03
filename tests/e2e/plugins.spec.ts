import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/advanced/plugins'
const duplicatePluginWarning = '[Vue warn]: Plugin has already been applied to target app.'

/** 断言实验台处于尚未运行的初始状态。 */
async function expectInitialState(demo: Locator): Promise<void> {
  await expect(demo.getByRole('button', { name: '对象插件' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(demo.getByRole('button', { name: '函数插件' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await expect(demo.getByTestId('plugin-app-a-host')).toContainText('未运行')
  await expect(demo.getByTestId('plugin-app-b-host')).toContainText('未运行')
  await expect(demo.getByTestId('installation-summary')).toHaveText(
    'A 安装 0 次，B 安装 0 次，总计 0 次',
  )
  await expect(demo.getByTestId('cleanup-summary')).toHaveText('A 清理 0 次，B 清理 0 次')
  await expect(demo.getByTestId('unmount-apps')).toBeDisabled()
}

/** 用键盘从当前模式按钮移动到运行按钮并启动实验。 */
async function runWithKeyboard(page: Page, modeButton: Locator): Promise<void> {
  await modeButton.focus()
  const runButton = page.getByTestId('run-installation')
  await page.keyboard.press('Tab')
  if (!(await runButton.evaluate((button) => document.activeElement === button))) {
    await page.keyboard.press('Tab')
  }
  await expect(runButton).toBeFocused()
  await expect(runButton).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')
}

/** 验证两个子应用都消费了各自插件 options，且安装计数符合身份去重。 */
async function expectInstalledState(demo: Locator): Promise<void> {
  const consumers = demo.getByTestId('plugin-consumer')
  await expect(consumers).toHaveCount(2)
  await expect(demo.locator('[data-testid="plugin-consumer"][data-app-id="app-a"]')).toContainText(
    '课程应用 A',
  )
  await expect(demo.locator('[data-testid="plugin-consumer"][data-app-id="app-a"]')).toContainText(
    'app-a',
  )
  await expect(demo.locator('[data-testid="plugin-consumer"][data-app-id="app-b"]')).toContainText(
    '课程应用 B',
  )
  await expect(demo.locator('[data-testid="plugin-consumer"][data-app-id="app-b"]')).toContainText(
    'app-b',
  )
  await expect(demo.getByTestId('installation-summary')).toHaveText(
    'A 安装 1 次，B 安装 1 次，总计 2 次',
  )
  await expect(demo.getByTestId('dedupe-result')).toContainText(
    '应用 A 调用了两次 use，但同一插件身份只安装 1 次',
  )
  await expect(demo.getByTestId('unmount-apps')).toBeEnabled()
}

/** 用键盘卸载子应用并验证每个应用只清理一次。 */
async function unmountWithKeyboard(page: Page, demo: Locator): Promise<void> {
  const runButton = demo.getByTestId('run-installation')
  await runButton.focus()
  await page.keyboard.press('Tab')
  const unmountButton = demo.getByTestId('unmount-apps')
  await expect(unmountButton).toBeFocused()
  await expect(unmountButton).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')

  await expect(demo.getByTestId('plugin-consumer')).toHaveCount(0)
  await expect(demo.getByTestId('plugin-app-a-host')).toContainText('已卸载')
  await expect(demo.getByTestId('plugin-app-b-host')).toContainText('已卸载')
  await expect(demo.getByTestId('cleanup-summary')).toHaveText('A 清理 1 次，B 清理 1 次')
  await expect(unmountButton).toBeDisabled()
}

/** 执行指定插件形状的完整安装与卸载路径。 */
async function exercisePluginKind(
  page: Page,
  demo: Locator,
  kind: '对象插件' | '函数插件',
): Promise<void> {
  const modeButton = demo.getByRole('button', { name: kind })
  if ((await modeButton.getAttribute('aria-pressed')) !== 'true') await modeButton.press('Enter')
  await expect(modeButton).toHaveAttribute('aria-pressed', 'true')
  await runWithKeyboard(page, modeButton)
  await expectInstalledState(demo)
  await expectControlsShowKeyboardFocus(page, demo)
  await unmountWithKeyboard(page, demo)
}

/** 验证所有按钮都满足 44px 双轴触控尺寸。 */
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

/** 验证所有按钮都能通过键盘获得清晰焦点。 */
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
  await page.addStyleTag({
    content:
      '\n      .plugin-installation-scope-lab-demo h3,\n      .plugin-installation-scope-lab-demo p,\n      .plugin-installation-scope-lab-demo button,\n      .plugin-installation-scope-lab-demo strong,\n      .plugin-installation-scope-lab-demo span {\n        font-size: 200% !important;\n      }\n    ',
  })
}

/** 验证放大文本不截断、主要区域不重叠且页面没有横向滚动。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  const contentFits = await demo
    .locator('h3, p, button, strong, span')
    .evaluateAll((elements) =>
      elements.every(
        (element) =>
          element.scrollWidth <= element.clientWidth &&
          element.scrollHeight <= element.clientHeight,
      ),
    )
  expect(contentFits).toBe(true)

  const overlappingSections = await demo
    .locator('.application-host, .experiment-results')
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

test('插件课程验证同应用幂等、多应用隔离与卸载清理', async ({ page }) => {
  const consoleErrors: string[] = []
  const consoleWarnings: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
    if (message.type() === 'warning') consoleWarnings.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + '/learn/vue/core/advanced/render-functions-vnodes')
  await page.getByRole('link', { name: '下一篇：插件' }).click()
  await expect(page).toHaveURL(new RegExp(lessonPath + '$'))
  await expect(page.getByRole('heading', { name: '插件', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '上一篇：渲染函数与虚拟节点' })).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：性能优化' })).toBeVisible()

  const demo = page.locator('.plugin-installation-scope-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialState(demo)
  await exercisePluginKind(page, demo, '对象插件')
  await exercisePluginKind(page, demo, '函数插件')
  await expectControlsMeetTargetSize(demo)
  await expectNoActiveMotion(demo)

  await page.reload()
  const enlargedDemo = page.locator('.plugin-installation-scope-lab-demo')
  await applyDoubleTextSize(page)
  await exercisePluginKind(page, enlargedDemo, '对象插件')
  await expectControlsMeetTargetSize(enlargedDemo)
  await expectContentFits(page, enlargedDemo)
  await expectNoActiveMotion(enlargedDemo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.plugin-installation-scope-lab-demo')
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await exercisePluginKind(page, reducedDemo, '函数插件')
  await expectControlsMeetTargetSize(reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expectNoActiveMotion(reducedDemo)

  expect(consoleErrors).toEqual([])
  expect(pageErrors).toEqual([])
  expect(consoleWarnings).toEqual(Array(4).fill(duplicatePluginWarning))
})
