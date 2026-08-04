import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const lessonPath = '/learn/vue/router/basics/composition-programmatic-navigation'

/** 把实验台中的可见文字放大到当前计算值的 200%。 */
async function applyDoubleTextSize(demo: Locator): Promise<void> {
  await demo.locator('h3, h4, p, button, label, span, strong, li').evaluateAll((elements) => {
    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue
      const size = Number.parseFloat(getComputedStyle(element).fontSize)
      element.style.setProperty('font-size', `${size * 2}px`, 'important')
    }
  })
}

/** 验证实验台与页面在当前尺寸下没有横向溢出。 */
async function expectContentFits(page: Page, demo: Locator): Promise<void> {
  await expect
    .poll(() => demo.evaluate((element) => element.scrollWidth <= element.clientWidth + 1))
    .toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
    .toBe(true)
}

/** 验证初始用户位置、组合式 API 注入与宿主 URL 隔离。 */
async function expectInitialState(page: Page, demo: Locator): Promise<void> {
  await expect(demo.getByTestId('composition-status')).toContainText('useRoute() pathname/users/1')
  await expect(demo.getByTestId('composition-status')).toContainText('已注入独立 router')
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/users/1')
  await expect(demo.getByTestId('mini-matched-names')).toHaveText('user-editor')
  await expect(demo.getByTestId('mini-route-params')).toHaveText('{"id":"1"}')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"tab":"profile"}')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功')
  await expect(demo.getByTestId('mini-route-view')).toContainText('用户 1 编辑页')
  await expect(demo.getByTestId('mini-history-sequence').locator('li')).toHaveCount(1)
  await expect(demo.getByTestId('mini-history-sequence').locator('li').first()).toContainText(
    '当前/users/1?tab=profile',
  )
  await expect(demo.getByTestId('watch-id-count')).toHaveText('0')
  await expect(demo.getByTestId('update-guard-count')).toHaveText('0')
  await expect(demo.getByTestId('leave-guard-count')).toHaveText('0')
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))
}

test('第五课串联组合式 API、历史命令与组件内守卫', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(appBaseUrl + lessonPath)
  await expect(
    page.getByRole('heading', { name: '组合式 API 与编程式导航', exact: true }),
  ).toBeVisible()

  const demo = page.getByRole('region', { name: '组合式导航与守卫实验' })
  await expect(demo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expectInitialState(page, demo)

  const pushButton = demo.getByRole('button', { name: 'push 用户 2' })
  await pushButton.click()
  await expect(pushButton).toBeFocused()
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/users/2')
  await expect(demo.getByTestId('mini-route-params')).toHaveText('{"id":"2"}')
  await expect(demo.getByTestId('watch-id-count')).toHaveText('1')
  await expect(demo.getByTestId('update-guard-count')).toHaveText('1')
  await expect(demo.getByTestId('leave-guard-count')).toHaveText('0')
  await expect(demo.getByTestId('mini-history-sequence').locator('li')).toHaveCount(2)
  await expect(demo.getByTestId('mini-navigation-timeline')).toContainText('watch params.id：1 → 2')
  await expect(demo.getByTestId('mini-navigation-timeline')).toContainText('update guard：1 → 2')
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  const replaceButton = demo.getByRole('button', { name: 'replace 用户 3' })
  await replaceButton.click()
  await expect(replaceButton).toBeFocused()
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/users/3')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"tab":"activity"}')
  await expect(demo.getByTestId('watch-id-count')).toHaveText('2')
  await expect(demo.getByTestId('update-guard-count')).toHaveText('2')
  await expect(demo.getByTestId('mini-history-sequence').locator('li')).toHaveCount(2)
  await expect(demo.getByTestId('mini-history-sequence')).not.toContainText('/users/2')
  await expect(demo.getByTestId('mini-history-sequence')).toContainText('当前/users/3?tab=activity')

  await page.keyboard.press('Tab')
  const goBackButton = demo.getByRole('button', { name: 'go(-1)' })
  await expect(goBackButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/users/1')
  await expect(demo.getByTestId('mini-route-query')).toHaveText('{"tab":"profile"}')
  await expect(demo.getByTestId('watch-id-count')).toHaveText('3')
  await expect(demo.getByTestId('update-guard-count')).toHaveText('3')
  await expect(goBackButton).toBeDisabled()
  await expect(demo.getByTestId('mini-history-sequence').locator('li').first()).toContainText(
    '当前/users/1?tab=profile',
  )

  const unsavedControl = demo.getByRole('checkbox', { name: '有未保存更改' })
  await unsavedControl.check()
  await demo.getByRole('button', { name: '离开到完成页' }).click()
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/users/1')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('失败（type 4）')
  await expect(demo.getByTestId('leave-guard-count')).toHaveText('1')
  await expect(demo.getByTestId('mini-navigation-timeline')).toContainText('拒绝未保存更改')
  await expect(demo.getByTestId('mini-history-sequence').locator('li')).toHaveCount(2)

  await unsavedControl.uncheck()
  await demo.getByRole('button', { name: '离开到完成页' }).click()
  await expect(demo.getByTestId('mini-pathname')).toHaveText('/done')
  await expect(demo.getByTestId('mini-navigation-result')).toHaveText('成功')
  await expect(demo.getByTestId('leave-guard-count')).toHaveText('2')
  await expect(demo.getByTestId('mini-route-view')).toContainText('完成页')
  await expect(demo.getByTestId('mini-navigation-timeline')).toContainText('放行')
  await expect(demo.getByTestId('mini-history-sequence').locator('li')).toHaveCount(2)
  await expect(demo.getByTestId('mini-history-sequence')).toContainText('当前/done')
  await expect(demo.getByTestId('host-path-now')).toHaveText(lessonPath)
  await expect(page).toHaveURL(new RegExp(`${lessonPath}$`))

  await page.setViewportSize({ width: 390, height: 844 })
  await applyDoubleTextSize(demo)
  await expectContentFits(page, demo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const reducedDemo = page.getByRole('region', { name: '组合式导航与守卫实验' })
  await expectInitialState(page, reducedDemo)
  await expectContentFits(page, reducedDemo)
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await expect
    .poll(() =>
      reducedDemo
        .getByRole('button', { name: 'push 用户 2' })
        .evaluate((element) => getComputedStyle(element).transition),
    )
    .toBe('none')

  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
