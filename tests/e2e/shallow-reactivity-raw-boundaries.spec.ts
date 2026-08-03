import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/advanced/shallow-reactivity-raw-boundaries'

/** 验证实验台初始快照、运行次数与公开身份诊断。 */
async function expectInitialBoundaryState(demo: Locator): Promise<void> {
  await expect(demo.getByTestId('shallow-raw-title')).toHaveText('初始标题')
  await expect(demo.getByTestId('shallow-observed-title')).toHaveText('初始标题')
  await expect(demo.getByTestId('shallow-raw-revision')).toHaveText('revision 0')
  await expect(demo.getByTestId('shallow-observed-revision')).toHaveText('revision 0')
  await expect(demo.getByTestId('shallow-effect-runs')).toHaveText('1 次')

  await expect(demo.getByTestId('container-raw-mode')).toHaveText('草稿')
  await expect(demo.getByTestId('container-observed-mode')).toHaveText('草稿')
  await expect(demo.getByTestId('container-raw-nested')).toHaveText('nested.count 0')
  await expect(demo.getByTestId('container-observed-nested')).toHaveText('nested.count 0')
  await expect(demo.getByTestId('container-effect-runs')).toHaveText('1 次')
  await expect(demo.getByTestId('container-ref-boundary')).toHaveText('根 source 保留 Ref：1')

  await expect(demo.getByTestId('identity-shallow-raw')).toHaveText('是')
  await expect(demo.getByTestId('identity-to-raw')).toHaveText('是')
  await expect(demo.getByTestId('identity-marked-root')).toHaveText('是')
  await expect(demo.getByTestId('identity-nested-hazard')).toHaveText('是')
}

/** 用键盘验证 shallowRef 深改、显式触发和根替换的不同通知结果。 */
async function exerciseShallowRefBoundary(page: Page, demo: Locator): Promise<void> {
  const mutateButton = demo.getByTestId('mutate-shallow-inside')
  const triggerButton = demo.getByTestId('trigger-shallow-ref')
  const replaceButton = demo.getByTestId('replace-shallow-root')

  await mutateButton.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(mutateButton).toBeFocused()
  await expect(mutateButton).toHaveCSS('outline-style', 'solid')
  await mutateButton.press('Enter')
  await expect(demo.getByTestId('shallow-raw-title')).toHaveText('内部修改 1')
  await expect(demo.getByTestId('shallow-raw-revision')).toHaveText('revision 1')
  await expect(demo.getByTestId('shallow-observed-title')).toHaveText('初始标题')
  await expect(demo.getByTestId('shallow-observed-revision')).toHaveText('revision 0')
  await expect(demo.getByTestId('shallow-effect-runs')).toHaveText('1 次')
  await expect(demo.getByTestId('shallow-last-action')).toHaveText('已深改内部对象，尚未通知')

  await page.keyboard.press('Tab')
  await expect(triggerButton).toBeFocused()
  await expect(triggerButton).toHaveCSS('outline-style', 'solid')
  await triggerButton.press('Enter')
  await expect(demo.getByTestId('shallow-observed-title')).toHaveText('内部修改 1')
  await expect(demo.getByTestId('shallow-observed-revision')).toHaveText('revision 1')
  await expect(demo.getByTestId('shallow-effect-runs')).toHaveText('2 次')

  await page.keyboard.press('Tab')
  await expect(replaceButton).toBeFocused()
  await expect(replaceButton).toHaveCSS('outline-style', 'solid')
  await replaceButton.press('Enter')
  await expect(demo.getByTestId('shallow-raw-title')).toHaveText('根替换 2')
  await expect(demo.getByTestId('shallow-observed-title')).toHaveText('根替换 2')
  await expect(demo.getByTestId('shallow-observed-revision')).toHaveText('revision 2')
  await expect(demo.getByTestId('shallow-effect-runs')).toHaveText('3 次')
}

/** 用键盘验证 shallowReactive 深层写入与两个根级写入的不同结果。 */
async function exerciseShallowReactiveBoundary(page: Page, demo: Locator): Promise<void> {
  const mutateButton = demo.getByTestId('mutate-nested-value')
  const updateModeButton = demo.getByTestId('update-root-mode')
  const replaceNestedButton = demo.getByTestId('replace-nested-root')

  await mutateButton.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(mutateButton).toBeFocused()
  await expect(mutateButton).toHaveCSS('outline-style', 'solid')
  await mutateButton.press('Enter')
  await expect(demo.getByTestId('container-raw-nested')).toHaveText('nested.count 1')
  await expect(demo.getByTestId('container-observed-nested')).toHaveText('nested.count 0')
  await expect(demo.getByTestId('container-effect-runs')).toHaveText('1 次')

  await page.keyboard.press('Tab')
  await expect(updateModeButton).toBeFocused()
  await expect(updateModeButton).toHaveCSS('outline-style', 'solid')
  await updateModeButton.press('Enter')
  await expect(demo.getByTestId('container-raw-mode')).toHaveText('已发布')
  await expect(demo.getByTestId('container-observed-mode')).toHaveText('已发布')
  await expect(demo.getByTestId('container-observed-nested')).toHaveText('nested.count 1')
  await expect(demo.getByTestId('container-effect-runs')).toHaveText('2 次')

  await page.keyboard.press('Tab')
  await expect(replaceNestedButton).toBeFocused()
  await expect(replaceNestedButton).toHaveCSS('outline-style', 'solid')
  await replaceNestedButton.press('Enter')
  await expect(demo.getByTestId('container-raw-nested')).toHaveText('nested.count 2')
  await expect(demo.getByTestId('container-observed-nested')).toHaveText('nested.count 2')
  await expect(demo.getByTestId('container-effect-runs')).toHaveText('3 次')
}

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

/** 把实验台可见文字按当前计算字号放大到 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo.locator('h3, h4, p, button, span, strong, small, dt, dd').evaluateAll((elements) => {
    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue
      const originalSize = Number.parseFloat(getComputedStyle(element).fontSize)
      element.style.setProperty('font-size', `${originalSize * 2}px`, 'important')
    }
  })
}

/** 验证 200% 文字下内容不截断、主要区段不重叠且页面没有横向滚动。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  const overflow = await demo
    .locator('h3, h4, p, button, span, strong, small, dt, dd')
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const root = element.closest('.shallow-reactivity-boundary-lab-demo')
        if (!root) return [{ reason: '未找到实验台边界' }]
        const rootRect = root.getBoundingClientRect()
        const rect = element.getBoundingClientRect()
        const fits =
          rect.left >= rootRect.left - 1 &&
          rect.right <= rootRect.right + 1 &&
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
      }),
    )
  expect(overflow).toEqual([])

  const overlappingSections = await demo
    .locator(':scope > .lab-header, :scope > .lab-section, :scope > .result-summary')
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

/** 验证实验台及其后代没有主动动画、过渡或位移。 */
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

test('浅层响应式课程验证根通知、显式触发与 raw 身份边界', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + '/learn/vue/core/intermediate/teleport')
  await page.getByRole('link', { name: '下一篇：浅层响应式与原始对象边界' }).click()
  await expect(page).toHaveURL(new RegExp(lessonPath + '$'))
  await expect(
    page.getByRole('heading', { name: '浅层响应式与原始对象边界', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: '上一篇：Teleport' })).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：CustomRef 与触发控制' })).toBeVisible()

  const demo = page.locator('.shallow-reactivity-boundary-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialBoundaryState(demo)
  await exerciseShallowRefBoundary(page, demo)
  await exerciseShallowReactiveBoundary(page, demo)
  await expectButtonsMeetTargetSize(demo)
  await expectNoActiveMotion(demo)

  await page.reload()
  const enlargedDemo = page.locator('.shallow-reactivity-boundary-lab-demo')
  await expectInitialBoundaryState(enlargedDemo)
  await applyDoubleTextSize(enlargedDemo)
  await exerciseShallowRefBoundary(page, enlargedDemo)
  await exerciseShallowReactiveBoundary(page, enlargedDemo)
  await expectButtonsMeetTargetSize(enlargedDemo)
  await expectContentFits(page, enlargedDemo)
  await expectNoActiveMotion(enlargedDemo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.shallow-reactivity-boundary-lab-demo')
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expectInitialBoundaryState(reducedDemo)
  await exerciseShallowRefBoundary(page, reducedDemo)
  await exerciseShallowReactiveBoundary(page, reducedDemo)
  await expectButtonsMeetTargetSize(reducedDemo)
  await expectNoActiveMotion(reducedDemo)

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
