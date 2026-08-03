import { expect, test } from '@playwright/test'

interface DetailRefreshProbe {
  frames: number
  scrollbarFrames: number
  maxOverflow: number
  outerTranslatedFrames: number
  outerFadedFrames: number
  innerTranslatedFrames: number
  done: boolean
}

test.use({ viewport: { width: 1696, height: 1472 } })

test('刷新详情页时根文档不出现临时滚动条', async ({ page }) => {
  await page.addInitScript(() => {
    const probe: DetailRefreshProbe = {
      frames: 0,
      scrollbarFrames: 0,
      maxOverflow: 0,
      outerTranslatedFrames: 0,
      outerFadedFrames: 0,
      innerTranslatedFrames: 0,
      done: false,
    }
    Object.defineProperty(window, '__detailRefreshProbe', {
      value: probe,
      configurable: true,
    })

    /** 判断元素当前是否存在纵向位移。 */
    function isTranslated(element: Element | null): boolean {
      if (!(element instanceof HTMLElement)) return false
      const transform = getComputedStyle(element).transform
      return transform !== 'none' && Math.abs(new DOMMatrixReadOnly(transform).m42) > 0.01
    }

    /** 连续采样刷新首段，覆盖外层壳和异步详情的入场过程。 */
    function sampleFrame(): void {
      const root = document.documentElement
      const overflow = Math.max(0, root.scrollHeight - root.clientHeight)
      const outerShell = document.querySelector('.content-shell.page-enter-active')
      const innerLayout = document.querySelector('.content-layout.page-enter-active')

      probe.scrollbarFrames += overflow > 0 ? 1 : 0
      probe.maxOverflow = Math.max(probe.maxOverflow, overflow)
      probe.outerTranslatedFrames += isTranslated(outerShell) ? 1 : 0
      probe.innerTranslatedFrames += isTranslated(innerLayout) ? 1 : 0
      if (outerShell && Number.parseFloat(getComputedStyle(outerShell).opacity) < 0.999) {
        probe.outerFadedFrames += 1
      }

      probe.frames += 1
      if (probe.frames < 90) requestAnimationFrame(sampleFrame)
      else probe.done = true
    }

    requestAnimationFrame(sampleFrame)
  })

  await page.goto('/learn/vue/core/basics/sfc-basics')
  await expect(page.getByRole('heading', { name: '单文件组件基础', exact: true })).toBeVisible()
  await page.reload({ waitUntil: 'load' })
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as Window & {
              __detailRefreshProbe?: DetailRefreshProbe
            }
          ).__detailRefreshProbe?.done,
      ),
    )
    .toBe(true)

  const probe = await page.evaluate(
    () =>
      (
        window as Window & {
          __detailRefreshProbe: DetailRefreshProbe
        }
      ).__detailRefreshProbe,
  )
  expect(probe.scrollbarFrames).toBe(0)
  expect(probe.maxOverflow).toBe(0)
  expect(probe.outerTranslatedFrames).toBe(0)
  expect(probe.outerFadedFrames).toBeGreaterThan(0)
  expect(probe.innerTranslatedFrames).toBeGreaterThan(0)
})
