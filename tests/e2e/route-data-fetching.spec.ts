import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const lessonPath = '/learn/vue/router/intermediate/route-data-fetching'

/** 把实验台中的可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo.locator('h3, h4, p, button, span, strong, li').evaluateAll((elements) => {
    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue
      const size = Number.parseFloat(getComputedStyle(element).fontSize)
      element.style.setProperty('font-size', `${size * 2}px`, 'important')
    }
  })
}

/** 验证实验台与文档根节点两层都没有横向溢出。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  await expect
    .poll(() => demo.evaluate((element) => element.scrollWidth <= element.clientWidth + 1))
    .toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
    .toBe(true)
}

/** 定位指定 token 的受控请求。 */
function getRequest(demo: Locator, token: number): Locator {
  return demo
    .getByTestId('request-list')
    .locator('li')
    .filter({ hasText: `#${token} ` })
}

/** 按子串断言时间线中的关键事件严格递增。 */
async function expectTimelineOrder(demo: Locator, expected: string[]): Promise<void> {
  const timeline = demo.getByTestId('request-timeline').locator('li')
  await expect
    .poll(async () => {
      const events = await timeline.allTextContents()
      let previousIndex = -1
      return expected.every((text) => {
        const index = events.findIndex(
          (event, eventIndex) => eventIndex > previousIndex && event.includes(text),
        )
        previousIndex = index
        return index !== -1
      })
    })
    .toBe(true)
}

/** 验证中立起点和宿主 URL 隔离。 */
async function expectInitialState(page: Page, demo: Locator): Promise<void> {
  await expect(demo.getByTestId('mini-current-path')).toHaveText('/start')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功（initial）')
  await expect(demo.getByTestId('mini-route-view')).toContainText('路由取数实验')
  await expect(demo.getByTestId('request-list').locator('li')).toHaveCount(0)
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
}

test('第九课用受控请求比较导航前后取数并阻止旧结果写回', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(page.getByRole('heading', { name: '路由数据获取', exact: true })).toBeVisible()

  const demo = page.getByRole('region', { name: '路由数据获取实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialState(page, demo)

  const afterOneButton = demo.getByRole('button', { name: '导航后：用户 1' })
  await afterOneButton.click()
  await expect(afterOneButton).toBeFocused()
  await expect(demo.getByTestId('mini-current-path')).toHaveText('/after/1')
  await expect(demo.getByTestId('mini-route-view')).toContainText('用户 1 页面已提交')
  await expect(demo.getByTestId('local-loading')).toHaveText('true')
  await expect(getRequest(demo, 1)).toContainText('/after/1 · pending')

  await page.keyboard.press('Tab')
  const afterTwoButton = demo.getByRole('button', { name: '导航后：用户 2' })
  await expect(afterTwoButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('mini-current-path')).toHaveText('/after/2')
  await expect(getRequest(demo, 1)).toContainText('/after/1 · aborted')
  await expect(getRequest(demo, 1).getByRole('button', { name: '完成 #1' })).toBeDisabled()
  await expect(getRequest(demo, 2)).toContainText('/after/2 · pending')
  await getRequest(demo, 2).getByRole('button', { name: '完成 #2' }).click()
  await expect(demo.getByTestId('local-loading')).toHaveText('false')
  await expect(demo.getByTestId('local-data')).toHaveText('用户 2（id=2）')
  await expect(demo.getByTestId('local-error')).toHaveText('无')
  await expect(demo.getByTestId('request-timeline')).toContainText('#2 after data commit')
  await expectTimelineOrder(demo, [
    '#1 after /after/1 start',
    '#1 after id=1 abort',
    '#2 after /after/2 start',
    '#2 after id=2 resolve',
    '#2 after data commit',
  ])

  await afterOneButton.click()
  await expect(demo.getByTestId('mini-current-path')).toHaveText('/after/1')
  await expect(getRequest(demo, 3)).toContainText('/after/1 · pending')
  await getRequest(demo, 3).getByRole('button', { name: '拒绝 #3' }).click()
  await expect(demo.getByTestId('local-loading')).toHaveText('false')
  await expect(demo.getByTestId('local-error')).toContainText('用户 1 数据获取失败')

  const beforeThreeButton = demo.getByRole('button', { name: '导航前：用户 3' })
  await beforeThreeButton.click()
  await expect(demo.getByTestId('mini-current-path')).toHaveText('/after/1')
  await expect(demo.getByTestId('global-pending')).toHaveText('true')
  await expect(demo.getByTestId('global-target')).toHaveText('/before/3')
  await expect(demo.getByTestId('mini-route-view')).toContainText('用户 1 页面已提交')
  await getRequest(demo, 4).getByRole('button', { name: '拒绝 #4' }).click()
  await expect(demo.getByTestId('global-pending')).toHaveText('false')
  await expect(demo.getByTestId('global-error')).toContainText('用户 3 数据获取失败')
  await expect(demo.getByTestId('mini-current-path')).toHaveText('/after/1')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('取消（type 4）')

  await beforeThreeButton.click()
  await expect(getRequest(demo, 5)).toContainText('/before/3 · pending')
  await afterTwoButton.click()
  await expect(getRequest(demo, 5)).toContainText('/before/3 · aborted')
  await expect(demo.getByTestId('mini-current-path')).toHaveText('/after/2')
  await expect(getRequest(demo, 6)).toContainText('/after/2 · pending')
  await getRequest(demo, 6).getByRole('button', { name: '完成 #6' }).click()

  await beforeThreeButton.click()
  await expect(getRequest(demo, 7)).toContainText('/before/3 · pending')
  const beforeFourButton = demo.getByRole('button', { name: '导航前：用户 4' })
  await beforeFourButton.click()
  await expect(demo.getByTestId('mini-current-path')).toHaveText('/after/2')
  await expect(getRequest(demo, 7)).toContainText('/before/3 · aborted')
  await expect(getRequest(demo, 8)).toContainText('/before/4 · pending')
  await expect(demo.getByTestId('global-target')).toHaveText('/before/4')
  await getRequest(demo, 8).getByRole('button', { name: '完成 #8' }).click()
  await expect(demo.getByTestId('mini-current-path')).toHaveText('/before/4')
  await expect(demo.getByTestId('global-pending')).toHaveText('false')
  await expect(demo.getByTestId('prepared-key')).toHaveText('/before/4')
  await expect(demo.getByTestId('mini-route-view')).toContainText('用户 4 已在导航确认前准备完成')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功（before/4）')
  await expectTimelineOrder(demo, [
    '#7 before /before/3 start',
    '#7 before id=3 abort',
    '#8 before /before/4 start',
    '#8 before id=4 resolve',
    '#8 before prepared /before/4',
    'afterEach：/after/2 → /before/4',
  ])
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await beforeThreeButton.click()
  await expect(getRequest(demo, 9)).toContainText('/before/3 · pending')
  await demo.getByRole('button', { name: '重置实验' }).click()
  await expectInitialState(page, demo)
  await expect(demo.getByTestId('request-timeline').locator('li')).toHaveText([
    'afterEach：/ → /start；成功（initial）',
  ])

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '路由数据获取实验' })
  await expectInitialState(page, reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: '导航后：用户 1' })
        .evaluate((element) => getComputedStyle(element).transition),
    )
    .toBe('none')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
