import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/core/advanced/render-functions-vnodes'
const initialOrder = ['reactivity', 'components', 'rendering']
const reversedOrder = ['rendering', 'components', 'reactivity']

/** 返回指定业务 ID 对应的有状态课程项。 */
function getCourseItem(demo: Locator, itemId: string): Locator {
  return demo.locator(`[data-testid="stateful-item"][data-item-id="${itemId}"]`)
}

/** 验证子组件按精确业务 ID 顺序渲染且没有重复身份。 */
async function expectItemOrder(demo: Locator, expectedOrder: string[]): Promise<void> {
  const items = demo.getByTestId('stateful-item')
  await expect(items).toHaveCount(expectedOrder.length)
  const actualOrder = await items.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-item-id')),
  )
  expect(actualOrder).toEqual(expectedOrder)
  expect(new Set(actualOrder).size).toBe(expectedOrder.length)
}

/** 验证三个子组件的本地输入仍分别属于对应业务 ID。 */
async function expectLocalNotes(demo: Locator, componentsNote: string): Promise<void> {
  await expect(getCourseItem(demo, 'reactivity').getByTestId('local-note-input')).toHaveValue('')
  await expect(getCourseItem(demo, 'components').getByTestId('local-note-input')).toHaveValue(
    componentsNote,
  )
  await expect(getCourseItem(demo, 'rendering').getByTestId('local-note-input')).toHaveValue('')
}

/** 用键盘完成两次反转，并验证本地状态始终跟随 components 身份。 */
async function exerciseVNodeIdentity(demo: Locator): Promise<void> {
  const reverseOrder = demo.getByTestId('reverse-order')
  const componentsInput = getCourseItem(demo, 'components').getByTestId('local-note-input')
  const renderingInput = getCourseItem(demo, 'rendering').getByTestId('local-note-input')

  await expect(demo.getByRole('button')).toHaveCount(1)
  await expect(reverseOrder).toHaveText('反转顺序')
  await expectItemOrder(demo, initialOrder)
  await expect(demo.getByTestId('current-order')).toHaveText(
    '当前顺序：reactivity -> components -> rendering',
  )
  await expect(demo.getByTestId('identity-summary')).toHaveText('尚未重排；反转次数 0')
  await expectLocalNotes(demo, '')

  await componentsInput.fill('只属于组件通信')
  await expectLocalNotes(demo, '只属于组件通信')

  await demo.page().keyboard.press('Tab')
  await expect(renderingInput).toBeFocused()
  await demo.page().keyboard.press('Tab')
  await expect(reverseOrder).toBeFocused()
  expect(await reverseOrder.evaluate((button) => getComputedStyle(button).outlineStyle)).not.toBe(
    'none',
  )

  await reverseOrder.press('Enter')
  await expectItemOrder(demo, reversedOrder)
  await expect(demo.getByTestId('current-order')).toHaveText(
    '当前顺序：rendering -> components -> reactivity',
  )
  await expect(demo.getByTestId('identity-summary')).toHaveText(
    '重排 1 次，components 的本地状态仍归属 components',
  )
  await expectLocalNotes(demo, '只属于组件通信')

  await reverseOrder.press('Enter')
  await expectItemOrder(demo, initialOrder)
  await expect(demo.getByTestId('current-order')).toHaveText(
    '当前顺序：reactivity -> components -> rendering',
  )
  await expect(demo.getByTestId('identity-summary')).toHaveText(
    '重排 2 次，components 的本地状态仍归属 components',
  )
  await expectLocalNotes(demo, '只属于组件通信')
}

/** 验证实验台按钮和输入框均满足 44px 双轴触控尺寸。 */
async function expectControlsMeetTargetSize(demo: Locator): Promise<void> {
  const shortControls = await demo.locator('button, input').evaluateAll((controls) =>
    controls
      .map((control) => ({
        label:
          control.getAttribute('data-testid') ?? control.textContent?.trim() ?? control.tagName,
        width: control.getBoundingClientRect().width,
        height: control.getBoundingClientRect().height,
      }))
      .filter((control) => control.width < 44 || control.height < 44),
  )
  expect(shortControls).toEqual([])
}

/** 把实验台文本放大到 200%，用于复跑完整交互路径。 */
async function applyDoubleTextSize(page: Page): Promise<void> {
  await page
    .locator(
      '.vnode-identity-lab-demo .demo-header h3, .vnode-identity-lab-demo .demo-header p, .vnode-identity-lab-demo .current-order, .vnode-identity-lab-demo .identity-summary, .vnode-identity-lab-demo .controls button, .vnode-identity-lab-demo .course-item h4, .vnode-identity-lab-demo .course-item p, .vnode-identity-lab-demo .note-field > span, .vnode-identity-lab-demo .note-field input',
    )
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
    .locator('h3, h4, p, button, input, label, span, strong, code, [role="status"]')
    .evaluateAll((elements) => {
      const demoRect = elements[0]?.closest('.vnode-identity-lab-demo')?.getBoundingClientRect()
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
      ':scope > .demo-header, :scope > .current-order, :scope > .identity-summary, :scope > .controls, :scope > .stateful-list',
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

  const overlappingItems = await demo.getByTestId('stateful-item').evaluateAll((items) =>
    items.slice(1).flatMap((item, index) => {
      const previous = items[index]
      if (!previous) return []
      return previous.getBoundingClientRect().bottom <= item.getBoundingClientRect().top + 1
        ? []
        : [`${previous.getAttribute('data-item-id')} -> ${item.getAttribute('data-item-id')}`]
    }),
  )
  expect(overlappingItems).toEqual([])

  const overlappingItemContent = await demo.getByTestId('stateful-item').evaluateAll((items) =>
    items.flatMap((item) => {
      const children = Array.from(item.children)
      return children.slice(1).flatMap((child, index) => {
        const previous = children[index]
        if (!previous) return []
        return previous.getBoundingClientRect().bottom <= child.getBoundingClientRect().top + 1
          ? []
          : [`${previous.className} -> ${child.className}`]
      })
    }),
  )
  expect(overlappingItemContent).toEqual([])

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
      return hasMotion
        ? [
            {
              tag: element.tagName,
              testId: element.getAttribute('data-testid'),
              transitionDuration: style.transitionDuration,
              animationDuration: style.animationDuration,
              transform: style.transform,
            },
          ]
        : []
    }),
  )

  expect(activeMotion).toEqual([])
}

test.use({ viewport: { width: 390, height: 844 } })

test('渲染函数课程验证 keyed 重排后本地状态仍跟随业务身份', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + '/learn/vue/core/advanced/custom-directives')
  await page.getByRole('link', { name: '下一篇：渲染函数与虚拟节点' }).click()
  await expect(page).toHaveURL(new RegExp(lessonPath + '$'))
  await expect(page.getByRole('heading', { name: '渲染函数与虚拟节点', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '上一篇：自定义指令' })).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：插件' })).toBeVisible()

  const demo = page.locator('.vnode-identity-lab-demo')
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await exerciseVNodeIdentity(demo)
  await expectControlsMeetTargetSize(demo)
  await expectNoActiveMotion(demo)

  await page.reload()
  const enlargedDemo = page.locator('.vnode-identity-lab-demo')
  await applyDoubleTextSize(page)
  await exerciseVNodeIdentity(enlargedDemo)
  await expectControlsMeetTargetSize(enlargedDemo)
  await expectContentFits(page, enlargedDemo)
  await expectNoActiveMotion(enlargedDemo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.locator('.vnode-identity-lab-demo')
  await applyDoubleTextSize(page)
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await exerciseVNodeIdentity(reducedDemo)
  await expectControlsMeetTargetSize(reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expectNoActiveMotion(reducedDemo)

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
