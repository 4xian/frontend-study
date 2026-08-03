import { expect, test } from '@playwright/test'

const appBaseUrl = process.env.E2E_BASE_URL ?? ''
const referencePath = '/reference/vue/core/composition/use-id'

test.use({ viewport: { width: 390, height: 844 } })

/** 验证 useId Demo 的 ID 唯一性与标签聚焦关联。 */
test('useId 参考页为重复字段生成唯一且可聚焦的 ID', async ({ page }) => {
  await page.goto(appBaseUrl + referencePath)

  const demo = page.getByRole('region', { name: 'useId 唯一性演示' })
  const generatedIdLabels = demo.locator('.generated-id')
  const inputs = demo.getByRole('textbox')
  const labels = demo.locator('label')
  const toggleButton = demo.getByRole('button', { name: '移除备用字段' })

  await expect(generatedIdLabels).toHaveCount(2)
  const generatedIds = await generatedIdLabels.allTextContents()
  expect(generatedIds).toHaveLength(2)
  expect(new Set(generatedIds).size).toBe(2)
  await expect(labels).toHaveCount(2)

  for (const [index, generatedId] of generatedIds.entries()) {
    await expect(inputs.nth(index)).toHaveAttribute('id', generatedId)
    await expect(labels.nth(index)).toHaveAttribute('for', generatedId)
  }

  await demo.getByText('联系邮箱', { exact: true }).click()
  await expect(inputs.nth(0)).toBeFocused()

  await demo.getByText('备用邮箱', { exact: true }).click()
  await expect(inputs.nth(1)).toBeFocused()

  await inputs.nth(0).focus()
  await page.keyboard.press('Tab')
  await expect(inputs.nth(1)).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(toggleButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(inputs).toHaveCount(1)

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
})
