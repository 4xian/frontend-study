import { expect, test } from '@playwright/test'

test('从首页进入项目实战并将无正文生态标记为规划中', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: '项目实战', exact: true }).click()
  await expect(page.getByRole('navigation', { name: '学习目录' })).toBeHidden()

  await expect(page).toHaveURL('/projects')
  await expect(page.getByRole('heading', { name: '把知识，变成真正的成果。' })).toBeVisible()
  const vueEcosystem = page.locator('.ecosystem-row.planned').filter({ hasText: 'Vue' })
  await expect(vueEcosystem).toBeVisible()
  await expect(vueEcosystem).toContainText('规划中')
})

test('桌面键盘可展开技术参考目录且目录不泄露具体条目', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('header.header').evaluate((header) => header.clientHeight)).toBe(44)
  await page.getByRole('link', { name: '技术参考', exact: true }).focus()

  const catalogNavigation = page.getByRole('navigation', { name: '学习目录' })
  await expect(catalogNavigation).toBeVisible()
  await expect(catalogNavigation.getByRole('link', { name: '响应式 API' })).toBeVisible()
  await expect(catalogNavigation).not.toContainText('ref()')
  await expect
    .poll(() => catalogNavigation.evaluate((panel) => panel.scrollHeight <= panel.clientHeight + 1))
    .toBe(true)

  await page.keyboard.press('ArrowDown')
  await expect(catalogNavigation.getByRole('button', { name: /^Vue 从/ })).toBeFocused()

  await page.getByRole('link', { name: '系统学习', exact: true }).hover()
  await page.waitForTimeout(400)
  const settledHeights = await catalogNavigation.evaluate(
    (panel) =>
      new Promise<number[]>((resolve) => {
        const heights: number[] = []

        /** 连续采样已完成切换的桌面菜单高度。 */
        function sample(): void {
          heights.push(panel.getBoundingClientRect().height)
          if (heights.length === 6) resolve(heights)
          else requestAnimationFrame(sample)
        }

        requestAnimationFrame(sample)
      }),
  )
  expect(Math.max(...settledHeights) - Math.min(...settledHeights)).toBeLessThanOrEqual(2)
  expect(settledHeights.at(-1)).toBeGreaterThan(0)
})

test('桌面目录从模块移入内容分类时保留当前模块预览', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: '系统学习', exact: true }).hover()

  const catalogNavigation = page.getByRole('navigation', { name: '学习目录' })
  const moduleOverview = catalogNavigation.getByRole('link', { name: /模块总览/ })
  for (const [moduleName, expectedPath] of [
    ['Vue Router', '/learn/vue/router'],
    ['Pinia', '/learn/vue/pinia'],
  ]) {
    await catalogNavigation.getByRole('button', { name: moduleName, exact: true }).hover()
    await expect(moduleOverview).toHaveAttribute('href', expectedPath)
    await moduleOverview.hover()
    await expect(moduleOverview).toHaveAttribute('href', expectedPath)
  }
})

test('桌面目录的玻璃幕布与面板同步完成展开', async ({ page }) => {
  await page.goto('/')
  const referenceLink = page.getByRole('link', { name: '技术参考', exact: true })
  await referenceLink.hover()

  const catalogNavigation = page.getByRole('navigation', { name: '学习目录' })
  await expect(catalogNavigation).toBeVisible()
  const motionStyles = await catalogNavigation.evaluate((panel) => {
    const layer = panel.closest('.catalog-layer')
    if (!(layer instanceof HTMLElement)) throw new Error('未找到目录动画层')
    const scrim = layer.querySelector('.catalog-scrim')
    if (!(scrim instanceof HTMLElement)) throw new Error('未找到目录玻璃幕布')

    return {
      layerProperty: getComputedStyle(layer).transitionProperty,
      layerDuration: getComputedStyle(layer).transitionDuration,
      panelProperty: getComputedStyle(panel).transitionProperty,
      panelDuration: getComputedStyle(panel).transitionDuration,
      scrimBlur: getComputedStyle(scrim).backdropFilter,
    }
  })

  expect(motionStyles.layerProperty).toContain('clip-path')
  expect(motionStyles.panelProperty).toContain('height')
  expect(motionStyles.layerDuration).toBe(motionStyles.panelDuration)
  expect(motionStyles.scrimBlur).toBe('blur(15px)')

  for (let cycle = 0; cycle < 2; cycle += 1) {
    await page.keyboard.press('Escape')
    await expect(catalogNavigation).toBeHidden()
    await page.mouse.move(0, 100)
    await referenceLink.hover()
    await expect(catalogNavigation).toBeVisible()
  }
})

test('短桌面目录保留内容滚动且不显示内层滚动条', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 180 })
  await page.goto('/')
  await page.getByRole('link', { name: '技术参考', exact: true }).hover()

  const catalogNavigation = page.getByRole('navigation', { name: '学习目录' })
  await expect(catalogNavigation).toBeVisible()
  const scrollState = await catalogNavigation.evaluate((panel) => {
    const initialScrollTop = panel.scrollTop
    panel.scrollTop = 40

    return {
      canScroll: panel.scrollHeight > panel.clientHeight,
      didScroll: panel.scrollTop > initialScrollTop,
      overflowY: getComputedStyle(panel).overflowY,
      scrollbarWidth: getComputedStyle(panel).scrollbarWidth,
    }
  })

  expect(scrollState.canScroll).toBe(true)
  expect(scrollState.didScroll).toBe(true)
  expect(scrollState.overflowY).toBe('auto')
  expect(scrollState.scrollbarWidth).toBe('none')
})

test('桌面目录遵循减少动态与减少透明度偏好', async ({ page }) => {
  const devtools = await page.context().newCDPSession(page)
  await devtools.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-reduced-motion', value: 'reduce' },
      { name: 'prefers-reduced-transparency', value: 'reduce' },
    ],
  })
  await page.goto('/')
  await page.getByRole('link', { name: '技术参考', exact: true }).hover()

  const catalogNavigation = page.getByRole('navigation', { name: '学习目录' })
  await expect(catalogNavigation).toBeVisible()
  const reducedStyles = await catalogNavigation.evaluate((panel) => {
    const layer = panel.closest('.catalog-layer')
    if (!(layer instanceof HTMLElement)) throw new Error('未找到目录动画层')
    const scrim = layer.querySelector('.catalog-scrim')
    if (!(scrim instanceof HTMLElement)) throw new Error('未找到目录玻璃幕布')
    const column = panel.querySelector('.catalog-column')
    if (!(column instanceof HTMLElement)) throw new Error('未找到目录内容列')

    return {
      layerDuration: getComputedStyle(layer).transitionDuration,
      panelDuration: getComputedStyle(panel).transitionDuration,
      columnDuration: getComputedStyle(column).transitionDuration,
      scrimBlur: getComputedStyle(scrim).backdropFilter,
    }
  })

  expect(reducedStyles.layerDuration).toBe('0s')
  expect(reducedStyles.panelDuration).toBe('0s')
  expect(reducedStyles.columnDuration).toBe('0s')
  expect(reducedStyles.scrimBlur).toBe('none')
})

test('移动 Sheet 在减少动态与减少透明度下不执行淡入', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const devtools = await page.context().newCDPSession(page)
  await devtools.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-reduced-motion', value: 'reduce' },
      { name: 'prefers-reduced-transparency', value: 'reduce' },
    ],
  })
  await page.goto('/')
  await page.evaluate(() => {
    /** 在移动 Sheet 插入首帧记录真实过渡时长。 */
    const observer = new MutationObserver(() => {
      const layer = document.querySelector('.catalog-layer.mobile')
      if (!(layer instanceof HTMLElement)) return
      document.documentElement.dataset.mobileReducedMotionDuration =
        getComputedStyle(layer).transitionDuration
      observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })

  await page.getByRole('button', { name: '打开学习目录' }).click()
  const catalogSheet = page.getByRole('dialog', { name: '学习目录' })
  await expect(catalogSheet).toBeVisible()
  await expect
    .poll(() => page.locator('html').getAttribute('data-mobile-reduced-motion-duration'))
    .not.toBeNull()
  expect(await page.locator('html').getAttribute('data-mobile-reduced-motion-duration')).toBe('0s')
})

test('桌面目录优先呈现当前详情路由中的生态', async ({ page }) => {
  await page.goto('/reference/vue/core/reactivity/ref')
  await page.getByRole('link', { name: '技术参考', exact: true }).focus()

  const catalogNavigation = page.getByRole('navigation', { name: '学习目录' })
  await expect(catalogNavigation).toBeVisible()
  await expect(catalogNavigation.getByRole('button', { name: /^Vue 从/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(catalogNavigation.getByText('Vue 核心', { exact: true })).toBeVisible()
  await expect(catalogNavigation).not.toContainText('ref()')
})

test('站内搜索支持快捷键、焦点恢复与键盘跳转', async ({ page }) => {
  await page.goto('/reference')
  const searchButton = page.getByRole('button', { name: '搜索' })

  await searchButton.focus()
  await page.keyboard.press('ControlOrMeta+K')
  await expect(page.getByRole('dialog', { name: '站内搜索' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: '站内搜索' })).toBeHidden()
  await expect(searchButton).toBeFocused()

  await page.keyboard.press('ControlOrMeta+K')
  await page.getByRole('textbox', { name: '搜索内容' }).fill('ref')
  const secondResult = page.locator('.result').nth(1)
  await expect(secondResult).toBeVisible()
  expect(await page.locator('.result').count()).toBeGreaterThanOrEqual(2)
  const expectedPath = await secondResult.getAttribute('data-path')
  expect(expectedPath).toBeTruthy()

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(expectedPath!)
})

test('桌面参考页完整呈现内容资产、上下文与按需正文', async ({ page }) => {
  const requestedUrls: string[] = []
  page.on('request', (request) => requestedUrls.push(request.url()))

  await page.goto('/reference/vue/core/reactivity/ref')
  await expect(page).toHaveURL('/reference/vue/core/reactivity/ref')
  const moduleNavigation = page.getByRole('navigation', { name: '技术模块' })
  await expect(moduleNavigation).toBeVisible()
  await expect(moduleNavigation.getByRole('link', { name: 'Vue 核心' })).toHaveAttribute(
    'aria-current',
    'page',
  )

  const referenceIndex = page.locator('.reference-index')
  await expect(referenceIndex).toBeVisible()
  await expect(referenceIndex.getByRole('link', { name: 'reactive()', exact: true })).toBeVisible()
  await expect(referenceIndex.getByText('计算与侦听', { exact: true })).toBeVisible()
  await expect(referenceIndex.getByRole('link', { name: 'computed()', exact: true })).toBeVisible()
  await expect(referenceIndex.getByRole('link', { name: 'createApp()', exact: true })).toBeVisible()
  await expect(
    referenceIndex.getByRole('link', { name: '组合式函数 Composables', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.signature')).toContainText('function ref<T>')

  const firstDemo = page.locator('.demo-box').first()
  await expect(firstDemo).toBeVisible()
  await firstDemo.getByRole('button', { name: '查看源码' }).click()
  await expect(firstDemo.locator('.source .code-block')).toBeVisible()

  const principle = page.locator('.principle')
  await expect(principle).toBeVisible()
  await expect(principle.getByRole('button', { name: '播放' })).toBeVisible()

  const referenceContext = page.locator('.reference-context')
  await expect(referenceContext.getByRole('navigation', { name: '页面大纲' })).toBeVisible()
  await expect(referenceContext).toContainText('适用于 Vue 3.5.40')
  await expect(referenceContext.getByRole('link', { name: 'Vue 响应式 API：核心' })).toBeVisible()
  await expect(
    page
      .getByRole('navigation', { name: '参考前后篇' })
      .getByRole('link', { name: '下一篇：reactive()' }),
  ).toBeVisible()

  const loadedEntryPaths = [
    ...new Set(
      requestedUrls
        .filter((url) => url.includes('/src/content/entries/') && !url.includes('catalog-meta'))
        .map((url) => new URL(url).pathname),
    ),
  ]
  expect(loadedEntryPaths).toEqual(['/src/content/entries/reference/vue/core/reactivity/ref.ts'])
  const loadedLegacyEntryPaths = [
    ...new Set(
      requestedUrls
        .map((url) => new URL(url).pathname)
        .filter((path) => path.startsWith('/src/content/data/') && path.endsWith('.ts')),
    ),
  ]
  expect(loadedLegacyEntryPaths).toEqual([])

  await page.getByRole('button', { name: '搜索' }).click()
  await page.getByRole('textbox', { name: '搜索内容' }).fill('reactive')
  await page.locator('.result[data-path="/reference/vue/core/reactivity/reactive"]').click()
  await expect(page).toHaveURL('/reference/vue/core/reactivity/reactive')
  await page.reload()
  await expect(page).toHaveURL('/reference/vue/core/reactivity/reactive')
  await expect(page.getByRole('heading', { name: 'reactive()', exact: true })).toBeVisible()
})

test('组件通信可从搜索进入并在双视口完成 v-model 交互', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/reference')
    await page.getByRole('button', { name: '搜索' }).click()
    await page.getByRole('textbox', { name: '搜索内容' }).fill('defineModel')
    await page.locator('.result[data-path="/reference/vue/core/components/define-model"]').click()

    await expect(page).toHaveURL('/reference/vue/core/components/define-model')
    await expect(
      page.getByRole('heading', { name: '组件 v-model 与 defineModel()', exact: true }),
    ).toBeVisible()
    const demo = page.locator('.demo-box').first()
    await expect(demo.locator('.missing')).toHaveCount(0)
    const input = demo.locator('input').first()
    await input.fill('来自子组件')
    await expect(demo.locator('.value')).toContainText('来自子组件')
    await demo.getByRole('button', { name: "text = '来自父组件'" }).click()
    await expect(input).toHaveValue('来自父组件')

    await page.reload()
    await expect(
      page.getByRole('heading', { name: '组件 v-model 与 defineModel()', exact: true }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).toBe(false)
  }
})

test('内置组件可从搜索进入并在双视口保留 KeepAlive 状态', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/reference')
    await page.getByRole('button', { name: '搜索' }).click()
    await page.getByRole('textbox', { name: '搜索内容' }).fill('KeepAlive')
    await page.locator('.result[data-path="/reference/vue/core/built-ins/keep-alive"]').click()

    await expect(page).toHaveURL('/reference/vue/core/built-ins/keep-alive')
    await expect(page.getByRole('heading', { name: '<KeepAlive>', exact: true })).toBeVisible()
    const demo = page.locator('.demo-box').first()
    await expect(demo.locator('.missing')).toHaveCount(0)
    await demo.getByRole('button', { name: 'count++' }).first().click()
    await expect(demo.locator('.counter').first()).toContainText('count = 1')
    await demo.getByRole('button', { name: '切换到 CounterB' }).click()
    await demo.getByRole('button', { name: '切换到 CounterA' }).click()
    await expect(demo.locator('.counter').first()).toContainText('CounterA 内部 count = 1')
    await expect(demo.locator('.counter').nth(1)).toContainText('CounterA 内部 count = 0')

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).toBe(false)

    await page.reload()
    await expect(page.getByRole('heading', { name: '<KeepAlive>', exact: true })).toBeVisible()
    await expect(page.locator('.demo-box').first().locator('.missing')).toHaveCount(0)
  }
})

test('全局 API 可从搜索进入并在双视口验证版本与应用生命周期', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/reference')
    await page.getByRole('button', { name: '搜索' }).click()
    await page.getByRole('textbox', { name: '搜索内容' }).fill('createApp')
    await page.locator('.result[data-path="/reference/vue/core/application/create-app"]').click()

    await expect(page).toHaveURL('/reference/vue/core/application/create-app')
    await expect(page.getByRole('heading', { name: 'createApp()', exact: true })).toBeVisible()
    if (viewport.width > 820) {
      await expect(
        page.locator('.context-details').getByText('适用于 Vue 3.5.40', { exact: true }),
      ).toBeVisible()
    } else {
      await page.getByText('查看版本信息', { exact: true }).click()
      await expect(
        page.locator('.compact-context').getByText('适用于 Vue 3.5.40', { exact: true }),
      ).toBeVisible()
    }
    const demo = page.locator('.demo-box').first()
    await expect(demo.locator('.missing')).toHaveCount(0)
    await demo.getByRole('button', { name: 'createApp + mount' }).click()
    await expect(demo.locator('.value')).toContainText('已挂载')
    await demo.getByRole('button', { name: '独立应用内 count = 0' }).click()
    await expect(demo.getByRole('button', { name: '独立应用内 count = 1' })).toBeVisible()
    await demo.getByRole('button', { name: 'unmount' }).click()
    await expect(demo.locator('.value')).toContainText('已卸载')

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).toBe(false)

    await page.reload()
    await expect(page.getByRole('heading', { name: 'createApp()', exact: true })).toBeVisible()
    await expect(page.locator('.demo-box').first().locator('.missing')).toHaveCount(0)
  }
})

test('进阶主题可从搜索进入并在双视口验证独立 composable 状态', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/reference')
    await page.getByRole('button', { name: '搜索' }).click()
    await page.getByRole('textbox', { name: '搜索内容' }).fill('组合式函数')
    await page.locator('.result[data-path="/reference/vue/core/advanced/composables"]').click()

    await expect(page).toHaveURL('/reference/vue/core/advanced/composables')
    await expect(
      page.getByRole('heading', { name: '组合式函数 Composables', exact: true }),
    ).toBeVisible()
    if (viewport.width > 820) {
      await expect(
        page.locator('.context-details').getByText('适用于 Vue 3.5.40', { exact: true }),
      ).toBeVisible()
    } else {
      await page.getByText('查看版本信息', { exact: true }).click()
      await expect(
        page.locator('.compact-context').getByText('适用于 Vue 3.5.40', { exact: true }),
      ).toBeVisible()
    }

    const demo = page.locator('.demo-box').first()
    await expect(demo.locator('.missing')).toHaveCount(0)
    await demo.getByRole('button', { name: 'A + 1' }).click()
    await expect(demo.locator('.value').filter({ hasText: '计数器 A' })).toContainText(
      '计数器 A = 1',
    )
    await expect(demo.locator('.value').filter({ hasText: '计数器 B' })).toContainText(
      '计数器 B = 0',
    )

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).toBe(false)

    await page.reload()
    await expect(
      page.getByRole('heading', { name: '组合式函数 Composables', exact: true }),
    ).toBeVisible()
    await expect(page.locator('.demo-box').first().locator('.missing')).toHaveCount(0)
  }
})

test('宽屏参考页缩小两侧留白并保持三栏互不重叠', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/reference/vue/core/reactivity-watchers/computed')
  await expect(page.getByRole('heading', { name: 'computed()', exact: true })).toBeVisible()
  await expect(page.locator('.demo-box').first()).toBeVisible()
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expect(page.locator('.principle')).toBeVisible()
  await expect(page.locator('.principle .missing')).toHaveCount(0)

  const layoutBox = await page.locator('.reference-layout').boundingBox()
  const sidebarBox = await page.locator('.reference-index').boundingBox()
  const readingBox = await page.locator('.reference-main').boundingBox()
  const contextBox = await page.locator('.reference-context').boundingBox()
  const headerBox = await page.locator('.header-content').boundingBox()
  const moduleBarBox = await page.locator('.module-bar-inner').boundingBox()
  const contentRailSpacing = await page.locator('.reference-main').evaluate((element) => {
    const contentBlock = element.querySelector('.demo-box')
    if (!(contentBlock instanceof HTMLElement)) throw new Error('未找到正文内容块')

    return element.getBoundingClientRect().right - contentBlock.getBoundingClientRect().right
  })
  const layoutSpacing = await page.locator('.reference-layout').evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      top: style.paddingTop,
      left: style.paddingLeft,
      right: style.paddingRight,
    }
  })
  const headerSpacing = await page.locator('.header-content').evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      left: style.paddingLeft,
      right: style.paddingRight,
    }
  })
  const sidebarMarginRight = await page
    .locator('.reference-index')
    .evaluate((element) => parseFloat(getComputedStyle(element).marginRight))
  const contextMarginLeft = await page
    .locator('.reference-context')
    .evaluate((element) => parseFloat(getComputedStyle(element).marginLeft))
  const viewportWidth = page.viewportSize()!.width
  const expectedShellWidth = viewportWidth * 0.9
  const rightOuterInset = viewportWidth - layoutBox!.x - layoutBox!.width
  const expectedReadingWidth =
    layoutBox!.width -
    parseFloat(layoutSpacing.left) -
    parseFloat(layoutSpacing.right) -
    sidebarBox!.width -
    sidebarMarginRight -
    contextBox!.width -
    contextMarginLeft

  expect(layoutBox?.width).toBeCloseTo(expectedShellWidth, 0)
  expect(headerBox?.width).toBeCloseTo(expectedShellWidth, 0)
  expect(moduleBarBox?.width).toBeCloseTo(expectedShellWidth, 0)
  expect(readingBox?.width).toBeGreaterThanOrEqual(840)
  expect(layoutSpacing).toEqual({ top: '16px', left: '16px', right: '16px' })
  expect(headerSpacing).toEqual({ left: layoutSpacing.left, right: layoutSpacing.right })
  expect(contentRailSpacing).toBeGreaterThanOrEqual(16)
  expect(Math.abs(layoutBox!.x - rightOuterInset)).toBeLessThanOrEqual(1)
  expect(Math.abs(readingBox!.width - expectedReadingWidth)).toBeLessThanOrEqual(1)
  expect(Math.abs(headerBox!.x - layoutBox!.x)).toBeLessThanOrEqual(1)
  expect(
    Math.abs(headerBox!.x + headerBox!.width - (layoutBox!.x + layoutBox!.width)),
  ).toBeLessThanOrEqual(1)
  expect(Math.abs(moduleBarBox!.x - layoutBox!.x)).toBeLessThanOrEqual(1)
  expect(
    Math.abs(moduleBarBox!.x + moduleBarBox!.width - (layoutBox!.x + layoutBox!.width)),
  ).toBeLessThanOrEqual(1)
  expect(sidebarBox!.x + sidebarBox!.width).toBeLessThan(readingBox!.x)
  expect(readingBox!.x + readingBox!.width).toBeLessThan(contextBox!.x)
})

test('左右侧栏与正文滚动互不串联并按需显示滚动条', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 500 })
  await page.goto('/reference/vue/core/reactivity/ref')
  await expect(page.getByRole('heading', { name: 'ref()', exact: true })).toBeVisible()

  const sidebar = page.locator('.content-sidebar')
  const context = page.locator('.content-context')
  const reading = page.locator('.content-reading')
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
  })

  const readingBox = await reading.boundingBox()
  expect(readingBox).not.toBeNull()
  await page.mouse.move(readingBox!.x + readingBox!.width / 2, readingBox!.y + 300)
  await page.mouse.wheel(0, 600)
  await expect.poll(() => reading.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  expect(await sidebar.evaluate((element) => element.scrollTop)).toBe(0)
  expect(await context.evaluate((element) => element.scrollTop)).toBe(0)

  await reading.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  await page.mouse.move(readingBox!.x + readingBox!.width / 2, readingBox!.y + 300)
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(100)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  expect(await sidebar.evaluate((element) => element.scrollTop)).toBe(0)
  expect(await context.evaluate((element) => element.scrollTop)).toBe(0)

  await sidebar.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  expect(await sidebar.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  await sidebar.evaluate((element) => {
    element.scrollTop = 0
  })
  expect(await sidebar.evaluate((element) => element.scrollTop)).toBe(0)

  for (const rail of [sidebar, context]) {
    const initialState = await rail.evaluate((element) => ({
      canScroll: element.scrollHeight > element.clientHeight,
      overflowY: getComputedStyle(element).overflowY,
      overscrollBehaviorY: getComputedStyle(element).overscrollBehaviorY,
      scrollbarWidth: getComputedStyle(element).scrollbarWidth,
      bottomInset: window.innerHeight - element.getBoundingClientRect().bottom,
      thumbColor: getComputedStyle(element, '::-webkit-scrollbar-thumb').backgroundColor,
    }))
    expect(initialState).toMatchObject({
      canScroll: true,
      overflowY: 'auto',
      overscrollBehaviorY: 'contain',
      scrollbarWidth: 'thin',
    })
    expect(Math.abs(initialState.bottomInset - 16)).toBeLessThanOrEqual(1)

    await rail.hover()
    const hoverThumbColor = await rail.evaluate(
      (element) => getComputedStyle(element, '::-webkit-scrollbar-thumb').backgroundColor,
    )
    expect(hoverThumbColor).not.toBe(initialState.thumbColor)

    await page.evaluate(() => window.scrollTo(0, 0))
    await rail.evaluate((element) => {
      element.scrollTop = element.scrollHeight
    })
    const railBox = await rail.boundingBox()
    expect(railBox).not.toBeNull()
    await page.mouse.move(railBox!.x + railBox!.width / 2, railBox!.y + railBox!.height / 2)
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(100)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  }
})

test('宽屏参考页三栏固定在模块栏下方', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/reference/vue/core/reactivity/ref')
  await expect(page.getByRole('heading', { name: 'ref()', exact: true })).toBeVisible()
  await page
    .locator('.reference-layout')
    .evaluate((element) =>
      Promise.all(element.getAnimations().map((animation) => animation.finished)),
    )
  const initialPositions = await page.evaluate(() => {
    const moduleBar = document.querySelector('.module-bar')
    const sidebars = document.querySelectorAll('.content-sidebar, .content-context')
    if (!(moduleBar instanceof HTMLElement) || sidebars.length !== 2) {
      throw new Error('未找到模块栏或详情侧栏')
    }

    return {
      moduleBottom: moduleBar.getBoundingClientRect().bottom,
      sidebarTops: Array.from(sidebars, (sidebar) => sidebar.getBoundingClientRect().top),
    }
  })
  await page.locator('.content-reading').evaluate((element) => {
    element.scrollTop = 900
  })
  await expect
    .poll(() => page.locator('.content-reading').evaluate((element) => element.scrollTop))
    .toBe(900)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)

  const scrolledPositions = await page.evaluate(() => {
    const moduleBar = document.querySelector('.module-bar')
    const sidebars = document.querySelectorAll('.content-sidebar, .content-context')
    if (!(moduleBar instanceof HTMLElement) || sidebars.length !== 2) {
      throw new Error('未找到模块栏或详情侧栏')
    }

    return {
      moduleBottom: moduleBar.getBoundingClientRect().bottom,
      sidebarTops: Array.from(sidebars, (sidebar) => sidebar.getBoundingClientRect().top),
    }
  })

  expect(initialPositions.sidebarTops).toEqual([
    initialPositions.moduleBottom + 16,
    initialPositions.moduleBottom + 16,
  ])
  expect(scrolledPositions.sidebarTops).toEqual(initialPositions.sidebarTops)
})

test('切换课程时只保留左侧学习路径并从正文顶部开始', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 500 })
  await page.goto('/learn/vue/core/basics/computed-properties')
  await expect(page.getByRole('heading', { name: '计算属性', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: '课程进度' })).toHaveCount(1)

  await page.evaluate(() => {
    const sidebar = document.querySelector('.lesson-path')
    const reading = document.querySelector('.lesson-main')
    const context = document.querySelector('.lesson-context')
    if (
      !(sidebar instanceof HTMLElement) ||
      !(reading instanceof HTMLElement) ||
      !(context instanceof HTMLElement)
    ) {
      throw new Error('未找到课程详情持久区域')
    }
    sidebar.scrollTop = 120
    reading.scrollTop = 900
    const browserWindow = window as Window & {
      lessonBeforeNavigation?: {
        sidebar: Element
        reading: Element
        context: Element
        sidebarScrollTop: number
      }
    }
    browserWindow.lessonBeforeNavigation = {
      sidebar,
      reading,
      context,
      sidebarScrollTop: sidebar.scrollTop,
    }
  })
  await expect
    .poll(() => page.locator('.lesson-main').evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0)

  await page
    .getByRole('navigation', { name: '学习路径' })
    .getByRole('link', { name: '响应式状态' })
    .click()
  await expect(page).toHaveURL('/learn/vue/core/basics/reactive-state')
  await expect(page.getByRole('heading', { name: '响应式状态', exact: true })).toBeVisible()

  const reuseState = await page.evaluate(() => {
    const before = (
      window as Window & {
        lessonBeforeNavigation?: {
          sidebar: Element
          reading: Element
          context: Element
          sidebarScrollTop: number
        }
      }
    ).lessonBeforeNavigation
    if (!before) throw new Error('缺少切换前课程区域')
    const sidebar = document.querySelector('.lesson-path')
    const reading = document.querySelector('.lesson-main')

    return {
      sidebarReused: before.sidebar === sidebar,
      readingReused: before.reading === reading,
      contextReused: before.context === document.querySelector('.lesson-context'),
      readingScrollTop: reading instanceof HTMLElement ? reading.scrollTop : -1,
      sidebarScrollTop: sidebar instanceof HTMLElement ? sidebar.scrollTop : -1,
      previousSidebarScrollTop: before.sidebarScrollTop,
    }
  })
  expect(reuseState).toEqual({
    sidebarReused: true,
    readingReused: false,
    contextReused: false,
    readingScrollTop: 0,
    sidebarScrollTop: reuseState.previousSidebarScrollTop,
    previousSidebarScrollTop: reuseState.previousSidebarScrollTop,
  })
})

test('切换参考条目时只替换正文与大纲并复用左侧目录', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 500 })
  await page.goto('/reference/vue/core/reactivity/ref')
  const moduleBars = page.getByRole('navigation', { name: '技术模块' })
  await expect(moduleBars).toHaveCount(1)
  await page.evaluate(() => {
    const moduleBar = document.querySelector('.module-bar')
    const sidebar = document.querySelector('.reference-index')
    const reading = document.querySelector('.reference-main')
    const context = document.querySelector('.reference-context')
    if (
      !(moduleBar instanceof HTMLElement) ||
      !(sidebar instanceof HTMLElement) ||
      !(reading instanceof HTMLElement) ||
      !(context instanceof HTMLElement)
    ) {
      throw new Error('未找到详情页持久区域')
    }
    sidebar.scrollTop = 220
    const browserWindow = window as Window & {
      detailBeforeNavigation?: {
        moduleBar: Element
        sidebar: Element
        reading: Element
        context: Element
        sidebarScrollTop: number
      }
    }
    browserWindow.detailBeforeNavigation = {
      moduleBar,
      sidebar,
      reading,
      context,
      sidebarScrollTop: sidebar.scrollTop,
    }
  })
  expect(
    await page.locator('.reference-index').evaluate((element) => element.scrollTop),
  ).toBeGreaterThan(0)
  const targetEntry = page
    .getByRole('navigation', { name: '参考目录' })
    .getByRole('link', { name: '响应式工具函数' })
  await targetEntry.scrollIntoViewIfNeeded()
  await page.locator('.reference-index').evaluate((element) => {
    const browserWindow = window as Window & {
      detailBeforeNavigation?: { sidebarScrollTop: number }
    }
    if (!browserWindow.detailBeforeNavigation) throw new Error('缺少切换前详情区域')
    browserWindow.detailBeforeNavigation.sidebarScrollTop = element.scrollTop
  })
  await page.evaluate(() => {
    const startedAt = performance.now()
    let maxPageOverflow = 0

    /** 在条目切换窗口内逐帧记录页面级垂直溢出。 */
    function samplePageOverflow(): void {
      maxPageOverflow = Math.max(
        maxPageOverflow,
        document.documentElement.scrollHeight - window.innerHeight,
      )
      if (performance.now() - startedAt < 700) {
        requestAnimationFrame(samplePageOverflow)
        return
      }
      document.documentElement.dataset.referenceMaxPageOverflow = String(maxPageOverflow)
    }

    requestAnimationFrame(samplePageOverflow)
  })

  await targetEntry.click()

  await expect(page).toHaveURL('/reference/vue/core/reactivity/utils')
  await expect(page.getByRole('heading', { name: '响应式工具函数', exact: true })).toBeVisible()
  await expect(moduleBars).toHaveCount(1)
  await expect
    .poll(() => page.locator('html').getAttribute('data-reference-max-page-overflow'))
    .not.toBeNull()
  expect(Number(await page.locator('html').getAttribute('data-reference-max-page-overflow'))).toBe(
    0,
  )
  const reuseState = await page.evaluate(() => {
    const before = (
      window as Window & {
        detailBeforeNavigation?: {
          moduleBar: Element
          sidebar: Element
          reading: Element
          context: Element
          sidebarScrollTop: number
        }
      }
    ).detailBeforeNavigation
    if (!before) throw new Error('缺少切换前详情区域')
    const sidebar = document.querySelector('.reference-index')

    return {
      moduleBarReused: before.moduleBar === document.querySelector('.module-bar'),
      sidebarReused: before.sidebar === sidebar,
      readingReused: before.reading === document.querySelector('.reference-main'),
      contextReused: before.context === document.querySelector('.reference-context'),
      sidebarScrollTop: sidebar instanceof HTMLElement ? sidebar.scrollTop : -1,
      previousSidebarScrollTop: before.sidebarScrollTop,
    }
  })
  expect(reuseState).toEqual({
    moduleBarReused: true,
    sidebarReused: true,
    readingReused: false,
    contextReused: false,
    sidebarScrollTop: reuseState.previousSidebarScrollTop,
    previousSidebarScrollTop: reuseState.previousSidebarScrollTop,
  })
  await expect(
    page
      .getByRole('navigation', { name: '参考目录' })
      .getByRole('link', { name: '响应式工具函数' }),
  ).toHaveAttribute('aria-current', 'page')
})

test.describe('真实触屏窄视口', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('学习目录 Sheet 可切换目的、进入分类并通过 Esc 恢复焦点', async ({ page }) => {
    await page.goto('/')
    const catalogButton = page.getByRole('button', { name: '打开学习目录' })

    await catalogButton.tap()
    const catalogSheet = page.getByRole('dialog', { name: '学习目录' })
    await expect(catalogSheet).toBeVisible()
    expect(await page.locator('header.header').evaluate((header) => header.clientHeight)).toBe(48)
    const sheetFitsViewport = await page.evaluate(
      () => document.documentElement.scrollWidth === document.documentElement.clientWidth,
    )
    expect(sheetFitsViewport).toBe(true)
    await catalogSheet.getByRole('button', { name: '技术参考', exact: true }).tap()
    await catalogSheet.getByRole('button', { name: /^Vue/ }).tap()
    await catalogSheet.getByRole('button', { name: 'Vue 核心', exact: true }).tap()
    await catalogSheet.getByRole('button', { name: '返回上一级' }).tap()
    await expect(catalogSheet.getByRole('heading', { name: 'Vue', exact: true })).toBeFocused()
    await catalogSheet.getByRole('button', { name: 'Vue 核心', exact: true }).tap()
    await catalogSheet.getByRole('link', { name: '响应式 API' }).tap()
    await expect(page).toHaveURL('/reference/vue/core/reactivity/ref')
    await expect(catalogSheet).toBeHidden()

    await catalogButton.tap()
    await expect(catalogSheet).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(catalogSheet).toBeHidden()
    await expect(catalogButton).toBeFocused()
  })

  test('搜索可直接触摸非首项且目录页没有横向溢出', async ({ page }) => {
    await page.goto('/reference')
    expect(await page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0)
    await page.getByRole('button', { name: '搜索' }).tap()
    await page.getByRole('textbox', { name: '搜索内容' }).fill('ref')

    const secondResult = page.locator('.result').nth(1)
    await expect(secondResult).toBeVisible()
    expect(await page.locator('.result').count()).toBeGreaterThanOrEqual(2)
    const expectedPath = await secondResult.getAttribute('data-path')
    expect(expectedPath).toBeTruthy()
    await secondResult.tap()
    await expect(page).toHaveURL(expectedPath!)

    for (const path of ['/learn', '/learn/react']) {
      await page.goto(path)
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasOverflow).toBe(false)
    }
  })

  test('计算与侦听可从搜索进入并操作原理动画', async ({ page }) => {
    await page.goto('/reference')
    await page.getByRole('button', { name: '搜索' }).tap()
    await page.getByRole('textbox', { name: '搜索内容' }).fill('computed')
    await page
      .locator('.result[data-path="/reference/vue/core/reactivity-watchers/computed"]')
      .tap()

    await expect(page).toHaveURL('/reference/vue/core/reactivity-watchers/computed')
    await expect(page.getByRole('heading', { name: 'computed()', exact: true })).toBeVisible()
    await expect(page.locator('.demo-box .missing')).toHaveCount(0)

    const principle = page.locator('.principle').first()
    await expect(principle.locator('.missing')).toHaveCount(0)
    await expect(principle.locator('.progress')).toHaveText('1 / 4')
    const firstNarration = await principle.locator('.narration').textContent()
    await principle.getByRole('button', { name: '下一步' }).tap()
    await expect(principle.locator('.progress')).toHaveText('2 / 4')
    await expect(principle.locator('.narration')).not.toHaveText(firstNarration ?? '')

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).toBe(false)
  })

  test('参考页提供目录抽屉、正文大纲与局部代码滚动', async ({ page }) => {
    await page.goto('/reference/vue/core/reactivity/ref')

    await page.getByRole('button', { name: '打开参考目录' }).tap()
    const drawer = page.getByRole('dialog', { name: '参考目录' })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByRole('link', { name: 'reactive()', exact: true })).toBeVisible()
    await page.getByRole('button', { name: '关闭参考目录' }).tap()
    await expect(drawer).toBeHidden()

    await expect(page.getByRole('heading', { name: 'ref()', exact: true })).toBeVisible()
    const codeBodies = page.locator('.code-block .body')
    await expect(codeBodies.first()).toBeVisible()
    const hasScrollableCode = await codeBodies.evaluateAll((elements) =>
      elements.some((element) => element.scrollWidth > element.clientWidth + 1),
    )
    expect(hasScrollableCode).toBe(true)

    const outlinePanel = page.locator('.compact-outline')
    await outlinePanel.locator('summary').tap()
    const outline = outlinePanel.getByRole('navigation', { name: '页面大纲' })
    await expect(outline).toBeVisible()
    await outline.getByRole('link', { name: '基础用法' }).tap()
    await expect(page.getByRole('heading', { name: '基础用法' })).toBeInViewport()

    const hasPageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasPageOverflow).toBe(false)
  })
})
