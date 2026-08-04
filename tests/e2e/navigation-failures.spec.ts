import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const lessonPath = '/learn/vue/router/advanced/navigation-failures'

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

/** 验证实验台与文档根节点都没有横向溢出。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  await expect
    .poll(() => demo.evaluate((element) => element.scrollWidth <= element.clientWidth + 1))
    .toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
    .toBe(true)
}

/** 按完整文本断言时间线中的关键事件严格递增。 */
async function expectEventOrder(demo: Locator, expected: string[]): Promise<void> {
  const events = demo.getByTestId('failure-event-log').locator('li')
  await expect
    .poll(async () => {
      const values = await events.allTextContents()
      let previousIndex = -1
      return expected.every((text) => {
        const index = values.findIndex(
          (value, valueIndex) => valueIndex > previousIndex && value === text,
        )
        previousIndex = index
        return index !== -1
      })
    })
    .toBe(true)
}

/** 验证重置后的独立 router 初态。 */
async function expectInitialState(page: Page, demo: Locator): Promise<void> {
  await expect(demo.getByTestId('failure-current-path')).toHaveText('/home')
  await expect(demo.getByTestId('failure-command')).toHaveText('尚未执行')
  await expect(demo.getByTestId('failure-promise-outcome')).toHaveText('尚未执行')
  await expect(demo.getByTestId('failure-check')).toHaveText('false')
  await expect(demo.getByTestId('failure-host-path')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
}

test('第十一课区分四种真实导航结算结果', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(page.getByRole('heading', { name: '导航失败', exact: true })).toBeVisible()

  const demo = page.getByRole('region', { name: '导航失败实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialState(page, demo)

  const successButton = demo.getByRole('button', { name: '执行成功导航' })
  await successButton.focus()
  await expect(successButton).toBeFocused()
  await expect(successButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('failure-command')).toHaveText('success')
  await expect(demo.getByTestId('failure-promise-outcome')).toHaveText('undefined (success)')
  await expect(demo.getByTestId('failure-check')).toHaveText('false')
  await expect(demo.getByTestId('failure-type')).toHaveText('none')
  await expect(demo.getByTestId('failure-current-path')).toHaveText('/open')

  await demo.getByRole('button', { name: '执行守卫阻止' }).click()
  await expect(demo.getByTestId('failure-command')).toHaveText('aborted')
  await expect(demo.getByTestId('failure-promise-outcome')).toHaveText('NavigationFailure')
  await expect(demo.getByTestId('failure-check')).toHaveText('true')
  await expect(demo.getByTestId('failure-type')).toHaveText('aborted (4)')
  await expect(demo.getByTestId('failure-to')).toHaveText('/blocked')
  await expect(demo.getByTestId('failure-from')).toHaveText('/open')
  await expect(demo.getByTestId('failure-combined-check')).toHaveText('true')
  await expect(demo.getByTestId('failure-current-path')).toHaveText('/open')

  await demo.getByRole('button', { name: '执行重复导航' }).click()
  await expect(demo.getByTestId('failure-command')).toHaveText('duplicated')
  await expect(demo.getByTestId('failure-type')).toHaveText('duplicated (16)')
  await expect(demo.getByTestId('failure-to')).toHaveText('/open')
  await expect(demo.getByTestId('failure-from')).toHaveText('/open')
  await expect(demo.getByTestId('failure-combined-check')).toHaveText('false')
  await expect(demo.getByTestId('failure-current-path')).toHaveText('/open')

  await demo.getByRole('button', { name: '执行竞态取消' }).click()
  await expect(demo.getByTestId('failure-command')).toHaveText('cancelled')
  await expect(demo.getByTestId('failure-type')).toHaveText('cancelled (8)')
  await expect(demo.getByTestId('failure-to')).toHaveText('/slow')
  await expect(demo.getByTestId('failure-from')).toHaveText('/open')
  await expect(demo.getByTestId('failure-combined-check')).toHaveText('true')
  await expect(demo.getByTestId('failure-current-path')).toHaveText('/fast-a')
  await expectEventOrder(demo, [
    'command success -> /open',
    'afterEach /home -> /open: success',
    'promise success: success',
    'guard /blocked -> false',
    'afterEach /open -> /blocked: aborted',
    'promise aborted: aborted',
    'afterEach /open -> /open: duplicated',
    'promise duplicated: duplicated',
    'command cancelled -> /slow',
    'guard /slow waiting',
    'fast navigation start -> /fast-a',
    'afterEach /open -> /fast-a: success',
    'fast navigation committed -> /fast-a',
    'old guard release',
    'guard /slow resumed',
    'afterEach /open -> /slow: cancelled',
    'promise cancelled: cancelled',
  ])
  await expect(demo.getByTestId('failure-host-path')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '导航失败实验' })
  await expectInitialState(page, reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: '执行成功导航' })
        .evaluate((element) => getComputedStyle(element).transition),
    )
    .toBe('none')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
