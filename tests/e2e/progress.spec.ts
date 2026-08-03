import { expect, test } from '@playwright/test'
import { PROGRESS_STORAGE_KEY } from '../../src/stores/progress'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
})

test('完成状态刷新后保留，并从首页继续到下一课', async ({ page }) => {
  await page.goto('/learn/vue/core/basics/template-syntax')
  await expect(page.getByRole('heading', { name: '模板语法' })).toBeVisible()
  await expect(page.getByText('Vue 模板语法入门')).toBeVisible()

  await page.getByRole('button', { name: '标记为已完成' }).click()
  await expect(page.getByRole('button', { name: '取消完成' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: '取消完成' })).toBeVisible()

  await page.goto('/')
  await page.getByRole('link', { name: '继续学习', exact: true }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/conditional-list-rendering')
  await expect(page.getByRole('heading', { name: '条件渲染与列表渲染' })).toBeVisible()

  await page.evaluate((storageKey) => localStorage.removeItem(storageKey), PROGRESS_STORAGE_KEY)
  await page.goto('/')
  await page.getByRole('link', { name: '开始学习', exact: true }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/sfc-basics')
})

test('390px 下可从 SFC 课程进入关联参考并返回原学习位置', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/learn/vue/core/basics/sfc-basics')

  await expect(page.getByRole('heading', { name: '单文件组件基础' })).toBeVisible()
  const demo = page.locator('.demo-box').first()
  await expect(demo.locator('.missing')).toHaveCount(0)
  await expect(demo.getByText('ProfileCard.vue')).toBeVisible()

  await page
    .locator('.related-learning')
    .getByRole('link', { name: 'defineComponent()', exact: true })
    .click()
  await expect(page).toHaveURL('/reference/vue/core/application/define-component')
  await expect(page.getByRole('heading', { name: 'defineComponent()', exact: true })).toBeVisible()
  await expect(
    page.locator('.mobile-sources').getByText('Vue 通用 API：defineComponent'),
  ).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL('/learn/vue/core/basics/sfc-basics')
  await expect(page.getByRole('heading', { name: '单文件组件基础' })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
})

test('390px 下可跳过前置提醒并操作课程导航', async ({ page }) => {
  test.setTimeout(90_000)
  const consoleProblems: string[] = []
  const pageErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      consoleProblems.push(`${message.type()}: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/learn/vue/core/basics/reactive-state')

  await expect(page.getByRole('heading', { name: '响应式状态' })).toBeVisible()
  const prerequisiteNotice = page.getByRole('heading', { name: '建议先完成' }).locator('..')
  await expect(prerequisiteNotice).toBeVisible()
  await expect(prerequisiteNotice.getByRole('link', { name: /模板语法/ })).toBeVisible()
  await page.getByRole('button', { name: '标记为已完成' }).click()
  await expect(page.getByRole('button', { name: '取消完成' })).toBeVisible()

  await page.getByRole('button', { name: '打开学习路径' }).click()
  const drawer = page.getByRole('dialog', { name: '学习路径' })
  await expect(drawer).toBeVisible()
  await drawer.getByRole('link', { name: '模板语法' }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/template-syntax')

  await page.getByRole('link', { name: '下一篇：条件渲染与列表渲染' }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/conditional-list-rendering')
  await expect(page.getByRole('heading', { name: '条件渲染与列表渲染' })).toBeVisible()
  await expect(page.locator('.demo-box').getByText('DOM 身份实验')).toBeVisible()

  await page.getByRole('link', { name: '下一篇：响应式状态' }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/reactive-state')

  await page.getByRole('link', { name: '下一篇：计算属性' }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/computed-properties')
  await expect(page.getByRole('heading', { name: '计算属性', exact: true })).toBeVisible()
  await expect(page.locator('.demo-box').getByText('缓存实验台')).toBeVisible()

  await page.getByRole('link', { name: '下一篇：侦听器' }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/watchers')
  await expect(page.getByRole('heading', { name: '侦听器', exact: true })).toBeVisible()

  const watcherDemo = page.locator('.watch-demo')
  await watcherDemo.getByRole('button', { name: '运行竞态实验' }).click()
  await expect(
    watcherDemo.locator('.lane.unsafe').getByText('慢查询 #1', { exact: true }),
  ).toBeVisible({ timeout: 1600 })
  await expect(
    watcherDemo.locator('.lane.safe').getByText('快查询 #1', { exact: true }),
  ).toBeVisible()

  await watcherDemo.getByRole('button', { name: '运行竞态实验' }).click()
  await expect(watcherDemo.getByText('条件变化为 快查询 #2', { exact: true })).toBeVisible()
  await expect(watcherDemo.getByText('清理组取消 快查询 #1', { exact: true })).toHaveCount(0)

  await page.getByRole('link', { name: '下一篇：事件处理' }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/event-handling')
  await expect(page.getByRole('heading', { name: '事件处理', exact: true })).toBeVisible()

  const eventDemo = page.locator('.event-demo')
  const commandCount = eventDemo
    .locator('.status-board div')
    .filter({ hasText: '命令次数' })
    .locator('dd')
  await eventDemo.getByRole('button', { name: '内联增加' }).click()
  await eventDemo.getByRole('button', { name: '内联增加' }).click()
  await expect(commandCount).toHaveText('2')
  await eventDemo.getByRole('button', { name: '方法重置' }).click()
  await expect(commandCount).toHaveText('0')
  await expect(eventDemo.getByText('click · 方法处理器 reset', { exact: true })).toBeVisible()

  await eventDemo.getByRole('button', { name: '保存草稿' }).click()
  await expect(eventDemo.locator('.log-section li').last()).toContainText('保存 draft')
  await eventDemo.getByRole('button', { name: '多语句顺序' }).click()
  const sequenceEntries = eventDemo.locator('.log-section li')
  await expect(sequenceEntries.nth(2)).toContainText('顺序 1：record')
  await expect(sequenceEntries.nth(3)).toContainText('顺序 2：execute')

  await eventDemo.getByRole('link', { name: '点击子链接' }).click()
  await expect(eventDemo.getByText('.prevent.self：默认行为已阻止', { exact: true })).toBeVisible()
  await eventDemo.getByRole('button', { name: '.self.prevent' }).click()
  await eventDemo.getByRole('link', { name: '点击子链接' }).click()
  await expect(eventDemo.getByText('.self.prevent：默认行为保留', { exact: true })).toBeVisible()

  await eventDemo.getByRole('button', { name: '清空日志' }).click()
  const exactInput = eventDemo.getByLabel('精确 Ctrl + Enter')
  await exactInput.press('Control+Shift+Enter')
  await expect(eventDemo.locator('.log-section li')).toHaveCount(0)
  await exactInput.press('Control+Enter')
  await expect(eventDemo.locator('.log-section li').last()).toContainText(
    'Ctrl+Enter.exact 命中：Ctrl+Enter',
  )

  const onceButton = eventDemo.getByRole('button', { name: /只执行一次/ })
  await onceButton.click()
  await onceButton.click()
  await expect(onceButton).toContainText('已执行 1 次')

  await eventDemo.getByRole('button', { name: '清空日志' }).click()
  await eventDemo.getByRole('button', { name: '触发传播顺序' }).click()
  const phaseEntries = eventDemo.locator('.log-section li')
  await expect(phaseEntries).toHaveCount(3)
  await expect(phaseEntries.nth(0)).toContainText('传播 capture')
  await expect(phaseEntries.nth(1)).toContainText('传播 target')
  await expect(phaseEntries.nth(2)).toContainText('传播 bubble')

  await page.getByRole('link', { name: '下一篇：表单输入绑定' }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/form-bindings')
  await expect(page.getByRole('heading', { name: '表单输入绑定', exact: true })).toBeVisible()

  const formDemo = page.locator('.form-demo')
  await formDemo.getByLabel('姓名（即时）').fill('Lin')
  await expect(formDemo.locator('[data-state="name"]')).toHaveText('"Lin"')

  const lazyInput = formDemo.getByLabel('显示名称（失焦后提交）')
  await lazyInput.fill('  Vue 新手  ')
  await expect(formDemo.locator('[data-state="lazy-dom"]')).toHaveText('"  Vue 新手  "')
  await expect(formDemo.locator('[data-state="lazy-model"]')).toHaveText('"初学者"')
  await lazyInput.blur()
  await expect(formDemo.locator('[data-state="lazy-model"]')).toHaveText('"Vue 新手"')

  const ageInput = formDemo.getByLabel('年龄（number）')
  await ageInput.fill('24')
  await expect(formDemo.locator('[data-state="age-value"]')).toHaveText('24')
  await expect(formDemo.locator('[data-state="age-type"]')).toHaveText('number')
  await ageInput.fill('')
  await expect(formDemo.locator('[data-state="age-value"]')).toHaveText('""')
  await expect(formDemo.locator('[data-state="age-type"]')).toHaveText('string')

  await formDemo.getByLabel('短信', { exact: true }).check()
  await expect(formDemo.locator('[data-state="channels"]')).toHaveText('["email","sms"] · Array')
  await formDemo.getByLabel('邮件', { exact: true }).uncheck()
  await expect(formDemo.locator('[data-state="channels"]')).toHaveText('["sms"] · Array')

  await formDemo.getByLabel('短信优先').check()
  await expect(formDemo.locator('[data-state="contact"]')).toHaveText('"sms" · string')
  await formDemo.getByLabel('学习强度（动态数值）').selectOption('2')
  await expect(formDemo.locator('[data-state="priority-value"]')).toHaveText('2')
  await expect(formDemo.locator('[data-state="priority-type"]')).toHaveText('number')

  await formDemo.getByLabel('关注主题（Array 多选）').selectOption(['vue', 'router'])
  await expect(formDemo.locator('[data-state="topics"]')).toHaveText('["vue","router"] · Array')

  await formDemo.getByRole('button', { name: '重置表单' }).click()
  await expect(formDemo.locator('[data-state="name"]')).toHaveText('"Ada"')
  await expect(formDemo.locator('[data-state="lazy-model"]')).toHaveText('"初学者"')
  await expect(formDemo.locator('[data-state="age-value"]')).toHaveText('18')
  await expect(formDemo.locator('[data-state="channels"]')).toHaveText('["email"] · Array')
  await expect(formDemo.locator('[data-state="contact"]')).toHaveText('"email" · string')
  await expect(formDemo.locator('[data-state="topics"]')).toHaveText('["vue"] · Array')
  await expect(formDemo.locator('[data-state="priority-value"]')).toHaveText('1')
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)

  await page.getByRole('link', { name: '下一篇：组件基础' }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/component-basics')
  await expect(page.getByRole('heading', { name: '组件基础', exact: true })).toBeVisible()
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)

  const instancesDemo = page.locator('.instances-demo')
  const instanceA = instancesDemo.getByRole('region', { name: '实例 A' })
  const instanceB = instancesDemo.getByRole('region', { name: '实例 B' })
  const instanceAButton = instanceA.getByRole('button', { name: '增加当前实例' })
  const instanceBButton = instanceB.getByRole('button', { name: '增加当前实例' })

  await instanceAButton.click()
  await instanceAButton.click()
  await expect(instanceA.locator('output')).toHaveText('2')
  await expect(instanceB.locator('output')).toHaveText('0')

  await instanceBButton.click()
  await expect(instanceA.locator('output')).toHaveText('2')
  await expect(instanceB.locator('output')).toHaveText('1')
  await instanceBButton.focus()
  await instanceBButton.press('Enter')
  await expect(instanceB.locator('output')).toHaveText('2')
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)

  await page.getByRole('link', { name: '下一篇：Props' }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/props')
  await expect(page.getByRole('heading', { name: 'Props', exact: true })).toBeVisible()
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)

  const propsDemo = page.locator('.props-flow-demo')
  const propsPreview = propsDemo.locator('.props-preview')
  await expect(propsPreview.getByText('组件基础', { exact: true })).toBeVisible()
  await expect(propsPreview.getByText('30 分钟（number）', { exact: true })).toBeVisible()
  await expect(propsPreview.getByText('否（boolean）', { exact: true })).toBeVisible()
  await expect(
    propsPreview.getByText('父组件未提供说明，子组件使用自己的默认文案。', { exact: true }),
  ).toBeVisible()

  await propsDemo.getByRole('button', { name: '切换课程' }).click()
  await expect(propsPreview.getByText('用 Props 建立清晰组件输入', { exact: true })).toBeVisible()
  await expect(propsPreview.getByText('45 分钟（number）', { exact: true })).toBeVisible()
  await expect(propsPreview.getByText('进阶（object）', { exact: true })).toBeVisible()

  await propsDemo.getByRole('button', { name: '切换推荐' }).click()
  await expect(propsPreview.getByText('是（boolean）', { exact: true })).toBeVisible()
  await propsDemo.getByRole('button', { name: '更新主题' }).click()
  await expect(propsPreview.getByRole('listitem')).toHaveCount(3)
  await propsDemo.getByRole('button', { name: '切换说明' }).click()
  await expect(propsPreview.getByText('这段说明由父组件显式提供。', { exact: true })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)

  await page.getByRole('link', { name: '下一篇：Emits' }).click()
  await expect(page).toHaveURL('/learn/vue/core/basics/emits')
  await expect(page.getByRole('heading', { name: 'Emits', exact: true })).toBeVisible()
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)

  const emitsDemo = page.locator('.emits-flow-demo')
  const parentPanel = emitsDemo.locator('.parent-panel')
  const childPanel = emitsDemo.locator('.course-action-panel')
  const childQuantity = childPanel.locator('.received-state strong')
  const requestIncreaseButton = childPanel.getByRole('button', { name: '请求增加' })

  await expect(childQuantity).toHaveText('2')
  await requestIncreaseButton.click()
  await expect(childQuantity).toHaveText('3')
  await requestIncreaseButton.click()
  await requestIncreaseButton.click()
  await expect(childQuantity).toHaveText('5')

  await requestIncreaseButton.focus()
  await requestIncreaseButton.press('Enter')
  await expect(childQuantity).toHaveText('5')
  await expect(
    parentPanel.getByText('子级请求增加到 6，父级决定拒绝：允许范围是 0 至 5。'),
  ).toBeVisible()
  await expect(parentPanel.locator('.parent-state dd').nth(2)).toHaveText('3')
  await expect(parentPanel.locator('.parent-state dd').nth(3)).toHaveText('1')

  await childPanel.getByRole('button', { name: '请求重置' }).click()
  await expect(childQuantity).toHaveText('2')
  await expect(parentPanel.getByText('子级请求重置，父级决定接受并恢复为 2。')).toBeVisible()
  await parentPanel.getByRole('button', { name: '父级直接设为最小值' }).click()
  await expect(childQuantity).toHaveText('0')
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)

  await page.getByRole('link', { name: '下一篇：生命周期与更新时机' }).click()
  await expect(page).toHaveURL('/learn/vue/core/intermediate/lifecycle-update-timing')
  await expect(page.getByRole('heading', { name: '生命周期与更新时机', exact: true })).toBeVisible()
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)

  const lifecycleDemo = page.locator('.lifecycle-timeline-demo')
  const lifecycleParentCount = lifecycleDemo.locator('.state-list dd').first()
  const lifecycleChildCount = lifecycleDemo.locator('.count-display strong')
  const timelineEntries = lifecycleDemo.locator('.timeline-list li')

  await expect(lifecycleParentCount).toHaveText('0')
  await expect(lifecycleChildCount).toHaveText('0')
  await lifecycleDemo.getByRole('button', { name: '同步增加两次' }).click()
  await expect(lifecycleParentCount).toHaveText('2')
  await expect(lifecycleChildCount).toHaveText('2')
  await expect(timelineEntries).toHaveCount(4)
  await expect(timelineEntries.nth(0)).toContainText('父组件 onBeforeUpdate')
  await expect(timelineEntries.nth(1)).toContainText('子组件 onBeforeUpdate')
  await expect(timelineEntries.nth(2)).toContainText('子组件 onUpdated')
  await expect(timelineEntries.nth(3)).toContainText('父组件 onUpdated')

  await lifecycleDemo.getByRole('button', { name: '隐藏子组件' }).click()
  await expect(lifecycleDemo.locator('.lifecycle-child-panel')).toHaveCount(0)
  await expect(lifecycleDemo.getByText('子组件已卸载', { exact: true })).toBeVisible()
  await expect(timelineEntries).toHaveCount(4)
  await expect(timelineEntries.nth(0)).toContainText('父组件 onBeforeUpdate')
  await expect(timelineEntries.nth(1)).toContainText('子组件 onBeforeUnmount')
  await expect(timelineEntries.nth(2)).toContainText('子组件 onUnmounted')
  await expect(timelineEntries.nth(3)).toContainText('父组件 onUpdated')

  await lifecycleDemo.getByRole('button', { name: '显示子组件' }).click()
  await expect(lifecycleChildCount).toHaveText('2')
  await expect(timelineEntries).toHaveCount(4)
  await expect(timelineEntries.nth(0)).toContainText('父组件 onBeforeUpdate')
  await expect(timelineEntries.nth(1)).toContainText('子组件 onBeforeMount')
  await expect(timelineEntries.nth(2)).toContainText('子组件 onMounted')
  await expect(timelineEntries.nth(3)).toContainText('父组件 onUpdated')

  const incrementTwiceButton = lifecycleDemo.getByRole('button', { name: '同步增加两次' })
  await incrementTwiceButton.focus()
  await incrementTwiceButton.press('Enter')
  await expect(lifecycleParentCount).toHaveText('4')
  await expect(lifecycleChildCount).toHaveText('4')
  await expect(timelineEntries).toHaveCount(4)
  await lifecycleDemo.getByRole('button', { name: '清空记录' }).click()
  await expect(timelineEntries).toHaveCount(0)
  await expect(lifecycleDemo.getByText('尚无记录。执行一次状态更新或切换子组件。')).toBeVisible()

  await page.getByRole('link', { name: '下一篇：模板引用' }).click()
  await expect(page).toHaveURL('/learn/vue/core/intermediate/template-refs')
  await expect(page.getByRole('heading', { name: '模板引用', exact: true })).toBeVisible()
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)

  const templateRefDemo = page.locator('.template-ref-lab-demo')
  const domInput = templateRefDemo.getByLabel('DOM 引用目标')
  await templateRefDemo.getByRole('button', { name: '隐藏输入框' }).click()
  await expect(domInput).toHaveCount(0)
  await expect(templateRefDemo.getByText('引用状态：null', { exact: true })).toBeVisible()
  await templateRefDemo.getByRole('button', { name: '显示输入框' }).click()
  await expect(domInput).toBeVisible()
  await expect(
    templateRefDemo.getByText('引用状态：HTMLInputElement', { exact: true }),
  ).toBeVisible()
  await templateRefDemo.getByRole('button', { name: '聚焦输入框' }).click()
  await expect(domInput).toBeFocused()

  const childInput = templateRefDemo.getByLabel('子组件搜索词')
  await childInput.fill('需要重置的草稿')
  await templateRefDemo.getByRole('button', { name: '调用子组件公开命令' }).click()
  await expect(childInput).toHaveValue('')
  await expect(childInput).toBeFocused()

  await templateRefDemo.getByRole('button', { name: '轮换列表顺序' }).click()
  await templateRefDemo.getByRole('button', { name: '按 ID 聚焦 API' }).click()
  await expect(templateRefDemo.getByRole('button', { name: 'API', exact: true })).toBeFocused()
  await expect(templateRefDemo.getByText('当前聚焦：API', { exact: true })).toBeVisible()

  await page.getByRole('link', { name: '下一篇：插槽' }).click()
  await expect(page).toHaveURL('/learn/vue/core/intermediate/slots')
  await expect(page.getByRole('heading', { name: '插槽', exact: true })).toBeVisible()
  await expect(page.locator('.demo-box')).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)

  const slotsDemo = page.locator('.learning-panel-slots-demo')
  const topicDetails = slotsDemo.locator('#learning-topic-details')
  const panelActions = slotsDemo.locator('.panel-actions')
  await expect(slotsDemo).toHaveCount(1)
  await expect(slotsDemo.getByRole('heading', { name: '插槽学习面板', exact: true })).toBeVisible()
  await expect(slotsDemo.getByText('适合：Vue 中级学习者', { exact: true })).toBeVisible()
  await expect(slotsDemo.getByText('父级备注：内容布局由父组件决定', { exact: true })).toBeVisible()
  await expect(slotsDemo.getByText('当前主题：模板', { exact: true })).toBeVisible()
  await expect(slotsDemo.getByText('详情状态：已展开', { exact: true })).toBeVisible()
  await expect(slotsDemo.getByText('当前没有父级补充资料', { exact: true })).toBeVisible()
  await expect(panelActions).toBeVisible()
  await expect(panelActions.locator('button[type="button"]')).toHaveCount(1)

  await slotsDemo.getByRole('button', { name: '选择源码' }).click()
  await expect(slotsDemo.getByText('当前主题：源码', { exact: true })).toBeVisible()
  await slotsDemo.getByRole('button', { name: '选择模板' }).click()
  await expect(slotsDemo.getByText('当前主题：模板', { exact: true })).toBeVisible()

  await expect(topicDetails).toBeVisible()
  await slotsDemo.getByRole('button', { name: '收起详情' }).click()
  await expect(topicDetails).not.toBeVisible()
  await expect(slotsDemo.getByText('详情状态：已收起', { exact: true })).toBeVisible()
  await expect(slotsDemo.getByRole('button', { name: '展开详情' })).toBeVisible()
  await slotsDemo.getByRole('button', { name: '展开详情' }).click()
  await expect(topicDetails).toBeVisible()
  await expect(slotsDemo.getByText('详情状态：已展开', { exact: true })).toBeVisible()
  await expect(slotsDemo.getByRole('button', { name: '收起详情' })).toBeVisible()

  await expect(slotsDemo.locator('.panel-layout')).toHaveCSS('flex-direction', 'column')
  await page.addStyleTag({
    content: '.learning-panel-slots-demo button { font-size: 200% !important; }',
  })
  const buttonsFitAtDoubleTextSize = await slotsDemo
    .getByRole('button')
    .evaluateAll((buttons) =>
      buttons.every(
        (button) =>
          button.scrollWidth <= button.clientWidth && button.scrollHeight <= button.clientHeight,
      ),
    )
  expect(buttonsFitAtDoubleTextSize).toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)

  await page.getByRole('link', { name: '下一篇：Attributes 透传' }).click()
  await expect(page).toHaveURL('/learn/vue/core/intermediate/attrs')
  await expect(page.getByRole('heading', { name: 'Attributes 透传', exact: true })).toBeVisible()
  await expect(page.locator('.demo-box')).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)

  const attrsDemo = page.locator('.attribute-routing-lab-demo')
  const attrsWrapper = attrsDemo.locator('[data-role="wrapper"]')
  const attrsAction = attrsDemo.getByRole('button', { name: '检查 Attributes 透传' })
  await expect(attrsDemo).toHaveCount(1)
  await expect(attrsWrapper).not.toHaveClass(/parent-accent/)
  await expect(attrsWrapper).not.toHaveAttribute('data-course-id')
  await expect(attrsWrapper).not.toHaveAttribute('aria-label')
  await expect(attrsAction).toHaveClass(/forwarded-action/)
  await expect(attrsAction).toHaveClass(/parent-accent/)
  await expect(attrsAction).toHaveClass(/parent-emphasis/)
  await expect(attrsAction).toHaveAttribute('data-course-id', 'attrs-01')
  await expect(attrsAction).toHaveAttribute('aria-label', '检查 Attributes 透传')
  await expect(attrsAction).not.toHaveAttribute('label')
  await expect(attrsAction).toHaveCSS('border-width', '2px')
  await expect(attrsAction).toHaveCSS('font-weight', '600')
  await expect(attrsDemo.getByText('data-course-id = attrs-01', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('onClick = function', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('label = consumed', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('onInspect = consumed', { exact: true })).toBeVisible()

  await attrsAction.click()
  await expect(attrsDemo.getByText('子级本地 click：1', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('父级原生 click：1', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('父级 inspect：1', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('最近 inspect 载荷：1', { exact: true })).toBeVisible()
  await attrsAction.click()
  await expect(attrsDemo.getByText('子级本地 click：2', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('父级原生 click：2', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('父级 inspect：2', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('最近 inspect 载荷：2', { exact: true })).toBeVisible()

  const initialBorderColor = await attrsAction.evaluate(
    (button) => window.getComputedStyle(button).borderColor,
  )
  await attrsDemo.getByRole('button', { name: '切换父级强调' }).click()
  await expect(attrsAction).not.toHaveClass(/parent-emphasis/)
  await expect(attrsDemo.getByText('父级强调：已关闭', { exact: true })).toBeVisible()
  await expect
    .poll(() => attrsAction.evaluate((button) => window.getComputedStyle(button).borderColor))
    .not.toBe(initialBorderColor)
  await attrsDemo.getByRole('button', { name: '切换父级强调' }).click()
  await expect(attrsAction).toHaveClass(/parent-emphasis/)
  await expect(attrsDemo.getByText('父级强调：已开启', { exact: true })).toBeVisible()
  await expect(attrsAction).toHaveCSS('border-color', initialBorderColor)

  await attrsDemo.getByRole('button', { name: '重置计数' }).click()
  await expect(attrsDemo.getByText('子级本地 click：0', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('父级原生 click：0', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('父级 inspect：0', { exact: true })).toBeVisible()
  await expect(attrsDemo.getByText('最近 inspect 载荷：尚未检查', { exact: true })).toBeVisible()
  await expect(attrsDemo.locator('.forwarded-action-shell')).toHaveCSS('flex-direction', 'column')
  await page.addStyleTag({
    content: '.attribute-routing-lab-demo button { font-size: 200% !important; }',
  })
  const attrsButtonsFitAtDoubleTextSize = await attrsDemo
    .getByRole('button')
    .evaluateAll((buttons) =>
      buttons.every(
        (button) =>
          button.scrollWidth <= button.clientWidth && button.scrollHeight <= button.clientHeight,
      ),
    )
  expect(attrsButtonsFitAtDoubleTextSize).toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)

  await page.getByRole('link', { name: '下一篇：组件 v-model' }).click()
  await expect(page).toHaveURL('/learn/vue/core/intermediate/component-v-model')
  await expect(page.getByRole('heading', { name: '组件 v-model', exact: true })).toBeVisible()
  await expect(page.locator('.demo-box')).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)

  const componentModelDemo = page.locator('.component-model-contract-demo')
  const controlledModelInstance = componentModelDemo.locator('.model-instance').first()
  const localModelInstance = componentModelDemo.locator('.model-instance').last()
  const controlledTitleInput = controlledModelInstance.getByLabel(
    '标题模型（v-model:title.capitalize）',
  )
  const controlledAccessSelect = controlledModelInstance.getByLabel('权限模型（v-model:access）')
  const controlledNotesInput = controlledModelInstance.getByLabel('备注模型（默认 v-model）')
  const controlledParentStatus = controlledModelInstance.locator('.parent-status')
  const controlledStatusSummary = controlledParentStatus.locator('.status-summary')
  const controlledAccessChangeCount = controlledParentStatus.locator('.access-change-count')
  const localNotesInput = localModelInstance.getByLabel('备注模型（默认 v-model）')
  const localParentStatus = localModelInstance.locator('.parent-status')

  await expect(componentModelDemo).toHaveCount(1)
  await expect(componentModelDemo).toBeVisible()
  await expect(controlledTitleInput).toHaveValue('Vue model')
  await expect(controlledAccessSelect).toHaveValue('viewer')
  await expect(controlledNotesInput).toHaveValue('父级备注')
  await expect(controlledStatusSummary).toHaveText('标题：Vue model；权限：viewer；备注：父级备注')
  await expect(controlledAccessChangeCount).toHaveText('受控权限 update:access 次数：0')
  await expect(localNotesInput).toHaveValue('仅存于未绑定子组件')
  await expect(
    localModelInstance.getByText('父级没有为 notes 提供绑定', { exact: true }),
  ).toBeVisible()

  await controlledTitleInput.fill('  component models  ')
  await expect(controlledTitleInput).toHaveValue('Component models')
  await expect(controlledStatusSummary).toHaveText(
    '标题：Component models；权限：viewer；备注：父级备注',
  )

  await controlledNotesInput.fill('父级已同步')
  await expect(controlledNotesInput).toHaveValue('父级已同步')
  await expect(controlledStatusSummary).toHaveText(
    '标题：Component models；权限：viewer；备注：父级已同步',
  )

  await controlledAccessSelect.selectOption('editor')
  await expect(controlledAccessSelect).toHaveValue('editor')
  await expect(controlledStatusSummary).toHaveText(
    '标题：Component models；权限：editor；备注：父级已同步',
  )
  await expect(controlledAccessChangeCount).toHaveText('受控权限 update:access 次数：1')
  await controlledAccessSelect.selectOption('viewer')
  await expect(controlledAccessSelect).toHaveValue('viewer')
  await expect(controlledStatusSummary).toHaveText(
    '标题：Component models；权限：viewer；备注：父级已同步',
  )
  await expect(controlledAccessChangeCount).toHaveText('受控权限 update:access 次数：2')

  await controlledModelInstance.getByRole('button', { name: '父级重置受控模型' }).click()
  await expect(controlledTitleInput).toHaveValue('Vue model')
  await expect(controlledAccessSelect).toHaveValue('viewer')
  await expect(controlledNotesInput).toHaveValue('父级备注')
  await expect(controlledStatusSummary).toHaveText('标题：Vue model；权限：viewer；备注：父级备注')
  await expect(controlledAccessChangeCount).toHaveText('受控权限 update:access 次数：0')

  await localNotesInput.fill('本地草稿')
  await expect(localNotesInput).toHaveValue('本地草稿')
  await expect(
    localModelInstance.getByText('父级没有为 notes 提供绑定', { exact: true }),
  ).toBeVisible()
  await expect(localParentStatus.locator('.status-summary')).toHaveText(
    '标题：Local model；权限：editor',
  )
  await expect(localParentStatus).not.toContainText('本地草稿')

  await expect(componentModelDemo.locator('.model-instances')).toHaveCSS('flex-direction', 'column')
  await page.addStyleTag({
    content: `
      .component-model-contract-demo label,
      .component-model-contract-demo .binding-state,
      .component-model-contract-demo .status-summary,
      .component-model-contract-demo .access-change-count,
      .component-model-contract-demo .local-notes-status,
      .component-model-contract-demo input,
      .component-model-contract-demo select,
      .component-model-contract-demo button {
        font-size: 200% !important;
      }
    `,
  })
  const modelContentFitsAtDoubleTextSize = await componentModelDemo
    .locator(
      'label, .binding-state, .status-summary, .access-change-count, .local-notes-status, input, select, button',
    )
    .evaluateAll((controls) => {
      const demoRect = controls[0]
        ?.closest('.component-model-contract-demo')
        ?.getBoundingClientRect()
      if (!demoRect) return false

      return controls.every((control) => {
        const controlRect = control.getBoundingClientRect()
        return (
          controlRect.left >= demoRect.left - 1 &&
          controlRect.right <= demoRect.right + 1 &&
          controlRect.top >= demoRect.top - 1 &&
          controlRect.bottom <= demoRect.bottom + 1 &&
          control.scrollWidth <= control.clientWidth &&
          control.scrollHeight <= control.clientHeight
        )
      })
    })
  expect(modelContentFitsAtDoubleTextSize).toBe(true)
  const labelsDoNotOverlapControls = await componentModelDemo
    .locator('label')
    .evaluateAll((labels) =>
      labels.every((label) => {
        if (!(label instanceof HTMLLabelElement)) return false
        const control = document.getElementById(label.htmlFor)
        if (!(control instanceof HTMLElement)) return false
        return label.getBoundingClientRect().bottom <= control.getBoundingClientRect().top
      }),
    )
  expect(labelsDoNotOverlapControls).toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)

  await page.getByRole('link', { name: '下一篇：组合式函数' }).click()
  await expect(page).toHaveURL('/learn/vue/core/intermediate/composables')
  await expect(page.getByRole('heading', { name: '组合式函数', exact: true })).toBeVisible()
  await expect(page.locator('.demo-box')).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)

  const composableDemo = page.locator('.composable-contract-demo')
  const counterA = composableDemo.getByRole('region', { name: '计数器 A' })
  const counterB = composableDemo.getByRole('region', { name: '计数器 B' })
  const countA = counterA
    .locator('.counter-stats > div')
    .filter({ hasText: '当前计数' })
    .locator('dd')
  const stepA = counterA
    .locator('.counter-stats > div')
    .filter({ hasText: '本次步长' })
    .locator('dd')
  const countB = counterB
    .locator('.counter-stats > div')
    .filter({ hasText: '当前计数' })
    .locator('dd')
  const stepB = counterB
    .locator('.counter-stats > div')
    .filter({ hasText: '本次步长' })
    .locator('dd')
  const statusA = counterA.locator('.listener-status')
  const statusB = counterB.locator('.listener-status')
  const tickButton = composableDemo.getByRole('button', { name: '触发共享 tick' })

  await expect(composableDemo).toHaveCount(1)
  await expect(composableDemo).toBeVisible()
  await expect(countA).toHaveText('0')
  await expect(stepA).toHaveText('1')
  await expect(countB).toHaveText('0')
  await expect(stepB).toHaveText('2')
  await expect(statusA).toHaveText('运行中')
  await expect(statusB).toHaveText('运行中')

  await tickButton.click()
  await expect(countA).toHaveText('1')
  await expect(countB).toHaveText('2')

  await composableDemo.getByRole('button', { name: '将基础步长设为 3' }).click()
  await expect(stepA).toHaveText('3')
  await expect(stepB).toHaveText('6')
  await expect(countA).toHaveText('1')
  await expect(countB).toHaveText('2')

  await tickButton.click()
  await expect(countA).toHaveText('4')
  await expect(countB).toHaveText('8')

  await counterB.getByRole('button', { name: '停止计数器 B 监听' }).click()
  await expect(statusB).toHaveText('已停止')
  await tickButton.click()
  await expect(countA).toHaveText('7')
  await expect(countB).toHaveText('8')

  await counterB.getByRole('button', { name: '重新启动计数器 B 监听' }).click()
  await expect(statusB).toHaveText('运行中')
  await tickButton.click()
  await expect(countA).toHaveText('10')
  await expect(countB).toHaveText('14')

  await counterA.getByRole('button', { name: '仅重置计数器 A' }).click()
  await expect(countA).toHaveText('0')
  await expect(countB).toHaveText('14')

  await counterB.getByRole('button', { name: '停止计数器 B 监听' }).click()
  await counterB.getByRole('button', { name: '重新启动计数器 B 监听' }).click()
  await counterB.getByRole('button', { name: '停止计数器 B 监听' }).click()
  await counterB.getByRole('button', { name: '重新启动计数器 B 监听' }).click()
  await expect(statusB).toHaveText('运行中')
  await tickButton.click()
  await expect(countA).toHaveText('3')
  await expect(countB).toHaveText('20')

  await expect(composableDemo.locator('.counter-list')).toHaveCSS('flex-direction', 'column')
  await page.addStyleTag({
    content: `
      .composable-contract-demo h3,
      .composable-contract-demo h4,
      .composable-contract-demo p,
      .composable-contract-demo dt,
      .composable-contract-demo dd,
      .composable-contract-demo .listener-status,
      .composable-contract-demo button {
        font-size: 200% !important;
      }
    `,
  })
  const composableContentFitsAtDoubleTextSize = await composableDemo
    .locator('h3, h4, p, dt, dd, .listener-status, button')
    .evaluateAll((elements) => {
      const demoRect = elements[0]?.closest('.composable-contract-demo')?.getBoundingClientRect()
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
  expect(composableContentFitsAtDoubleTextSize).toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)

  await page.getByRole('link', { name: '下一篇：依赖注入' }).click()
  await expect(page).toHaveURL('/learn/vue/core/intermediate/provide-inject')
  await expect(page.getByRole('heading', { name: '依赖注入', exact: true })).toBeVisible()
  await expect(composableDemo).toHaveCount(0)
  await page.evaluate(() => {
    window.dispatchEvent(new Event('composable-contract-lab:tick'))
  })

  const dependencyDemo = page.locator('.dependency-scope-lab-demo')
  const rootMode = dependencyDemo.locator('[data-state="root-mode"]')
  const rootRevision = dependencyDemo.locator('[data-state="root-revision"]')
  const inheritedConsumer = dependencyDemo.getByRole('region', { name: '根课程区消费方' })
  const localConsumer = dependencyDemo.getByRole('region', { name: '局部练习区消费方' })
  const inheritedMode = inheritedConsumer.locator('[data-state="mode"]')
  const inheritedRevision = inheritedConsumer.locator('[data-state="revision"]')
  const localMode = localConsumer.locator('[data-state="mode"]')
  const localRevision = localConsumer.locator('[data-state="revision"]')

  await expect(dependencyDemo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expect(rootMode).toHaveText('完整讲解')
  await expect(rootRevision).toHaveText('0')
  await expect(inheritedConsumer.locator('[data-state="owner"]')).toHaveText('根课程区')
  await expect(inheritedMode).toHaveText('完整讲解')
  await expect(inheritedRevision).toHaveText('0')
  await expect(localConsumer.locator('[data-state="owner"]')).toHaveText('局部练习区')
  await expect(localMode).toHaveText('重点复习')
  await expect(localRevision).toHaveText('0')
  await expect(inheritedConsumer.locator('[data-state="optional-hint"]')).toHaveText(
    '使用本地默认提示',
  )
  await expect(localConsumer.locator('[data-state="optional-hint"]')).toHaveText('使用本地默认提示')

  await dependencyDemo.getByRole('button', { name: '根提供者切换模式' }).click()
  await expect(rootMode).toHaveText('关键提示')
  await expect(rootRevision).toHaveText('1')
  await expect(inheritedMode).toHaveText('关键提示')
  await expect(inheritedRevision).toHaveText('1')
  await expect(localMode).toHaveText('重点复习')
  await expect(localRevision).toHaveText('0')

  await inheritedConsumer.getByRole('button', { name: '请求根课程区切换模式' }).click()
  await expect(rootMode).toHaveText('完整讲解')
  await expect(rootRevision).toHaveText('2')
  await expect(inheritedMode).toHaveText('完整讲解')
  await expect(inheritedRevision).toHaveText('2')
  await expect(localMode).toHaveText('重点复习')
  await expect(localRevision).toHaveText('0')

  await localConsumer.getByRole('button', { name: '请求局部练习区切换模式' }).click()
  await expect(localMode).toHaveText('自由探索')
  await expect(localRevision).toHaveText('1')
  await expect(rootMode).toHaveText('完整讲解')
  await expect(rootRevision).toHaveText('2')

  await dependencyDemo.getByRole('button', { name: '根提供者切换模式' }).click()
  await expect(rootMode).toHaveText('关键提示')
  await expect(rootRevision).toHaveText('3')
  await expect(inheritedMode).toHaveText('关键提示')
  await expect(inheritedRevision).toHaveText('3')
  await expect(localMode).toHaveText('自由探索')
  await expect(localRevision).toHaveText('1')

  await expect(dependencyDemo.locator('.branch-list')).toHaveCSS('flex-direction', 'column')
  const dependencyButtonHeights = await dependencyDemo
    .getByRole('button')
    .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height))
  expect(dependencyButtonHeights.every((height) => height >= 44)).toBe(true)
  await page.addStyleTag({
    content: `
      .dependency-scope-lab-demo h3,
      .dependency-scope-lab-demo h4,
      .dependency-scope-lab-demo p,
      .dependency-scope-lab-demo dt,
      .dependency-scope-lab-demo dd,
      .dependency-scope-lab-demo button {
        font-size: 200% !important;
      }
    `,
  })
  const dependencyContentFitsAtDoubleTextSize = await dependencyDemo
    .locator('h3, h4, p, dt, dd, button')
    .evaluateAll((elements) => {
      const demoRect = elements[0]?.closest('.dependency-scope-lab-demo')?.getBoundingClientRect()
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
  expect(dependencyContentFitsAtDoubleTextSize).toBe(true)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)

  await page.getByRole('link', { name: '下一篇：过渡效果' }).click()
  await expect(page).toHaveURL('/learn/vue/core/intermediate/transitions')
  await expect(page.getByRole('heading', { name: '过渡效果', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '下一篇：动态组件与 KeepAlive' })).toBeVisible()

  const transitionDemo = page.locator('.transition-state-lab-demo')
  const notice = transitionDemo.locator('[data-testid="transition-notice"]')
  const topicList = transitionDemo.locator('[data-testid="transition-topic-list"] li')
  const transitionSummary = transitionDemo.getByRole('status')
  const transitionDoubleTextStyle = `
    .transition-state-lab-demo h3,
    .transition-state-lab-demo h4,
    .transition-state-lab-demo p,
    .transition-state-lab-demo li,
    .transition-state-lab-demo button {
      font-size: 200% !important;
    }
  `

  /** 检查过渡实验台在 200% 文本下没有内容或页面级溢出。 */
  async function expectTransitionContentFitsAtDoubleTextSize(
    demo: typeof transitionDemo,
  ): Promise<void> {
    const contentFits = await demo.locator('h3, h4, p, li, button').evaluateAll((elements) => {
      const demoRect = elements[0]?.closest('.transition-state-lab-demo')?.getBoundingClientRect()
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

  await expect(transitionDemo).toHaveCount(1)
  await expect(page.locator('.demo-box .missing')).toHaveCount(0)
  await expect(transitionDemo.locator('[data-state="notice"]')).toHaveText('已显示')
  await expect(transitionDemo.locator('[data-state="active-view"]')).toHaveText('摘要视图')
  await expect(transitionDemo.locator('[data-testid="keyed-view"]')).toHaveAttribute(
    'data-view',
    'summary',
  )
  await expect(topicList).toHaveText(['Alpha', 'Beta', 'Gamma'])
  await expect(transitionSummary).toHaveText('通知：已显示；视图：摘要；顺序：Alpha → Beta → Gamma')

  await transitionDemo.getByRole('button', { name: '隐藏通知' }).press('Enter')
  await expect(notice).toHaveCount(0)
  await expect(transitionDemo.locator('[data-state="notice"]')).toHaveText('已隐藏')
  await transitionDemo.getByRole('button', { name: '显示通知' }).click()
  await expect(notice).toBeVisible()
  await expect(transitionDemo.locator('[data-state="notice"]')).toHaveText('已显示')

  await transitionDemo.getByRole('button', { name: '切换到详细视图' }).click()
  await expect(transitionDemo.locator('[data-testid="keyed-view"]')).toHaveAttribute(
    'data-view',
    'details',
  )
  await expect(transitionDemo.locator('[data-state="active-view"]')).toHaveText('详细视图')
  await transitionDemo.getByRole('button', { name: '轮换顺序' }).click()
  await expect(topicList).toHaveText(['Gamma', 'Alpha', 'Beta'])
  await transitionDemo.getByRole('button', { name: '轮换顺序' }).click()
  await expect(topicList).toHaveText(['Beta', 'Gamma', 'Alpha'])
  await transitionDemo.getByRole('button', { name: '重置实验' }).click()
  await expect(transitionDemo.locator('[data-state="notice"]')).toHaveText('已显示')
  await expect(transitionDemo.locator('[data-state="active-view"]')).toHaveText('摘要视图')
  await expect(topicList).toHaveText(['Alpha', 'Beta', 'Gamma'])

  await transitionDemo.getByRole('button', { name: '隐藏通知' }).click()
  await transitionDemo.getByRole('button', { name: '显示通知' }).click()
  await expect(notice).toBeVisible()
  await expect(transitionSummary).toContainText('通知：已显示')

  const transitionButtonHeights = await transitionDemo
    .getByRole('button')
    .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height))
  expect(transitionButtonHeights.every((height) => height >= 44)).toBe(true)
  await page.addStyleTag({ content: transitionDoubleTextStyle })
  await expectTransitionContentFitsAtDoubleTextSize(transitionDemo)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await expect(page.getByRole('heading', { name: '过渡效果', exact: true })).toBeVisible()
  const reducedTransitionDemo = page.locator('.transition-state-lab-demo')
  const reducedTopicList = reducedTransitionDemo.locator('[data-testid="transition-topic-list"] li')
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true)
  await page.addStyleTag({ content: transitionDoubleTextStyle })
  await reducedTransitionDemo.getByRole('button', { name: '隐藏通知' }).click()
  await expect(reducedTransitionDemo.locator('[data-testid="transition-notice"]')).toHaveCount(0)
  await expect(reducedTransitionDemo.locator('[data-state="notice"]')).toHaveText('已隐藏')
  await reducedTransitionDemo.getByRole('button', { name: '显示通知' }).click()
  await expect(reducedTransitionDemo.locator('[data-testid="transition-notice"]')).toBeVisible()
  await expect(reducedTransitionDemo.locator('[data-state="notice"]')).toHaveText('已显示')
  await reducedTransitionDemo.getByRole('button', { name: '切换到详细视图' }).click()
  await expect(reducedTransitionDemo.locator('[data-state="active-view"]')).toHaveText('详细视图')
  await expect(reducedTransitionDemo.locator('[data-testid="keyed-view"]')).toHaveAttribute(
    'data-view',
    'details',
  )
  await reducedTransitionDemo.getByRole('button', { name: '轮换顺序' }).click()
  await expect(reducedTopicList).toHaveText(['Gamma', 'Alpha', 'Beta'])
  await reducedTransitionDemo.getByRole('button', { name: '轮换顺序' }).click()
  await expect(reducedTopicList).toHaveText(['Beta', 'Gamma', 'Alpha'])
  await reducedTransitionDemo.getByRole('button', { name: '重置实验' }).click()
  await expect(reducedTransitionDemo.locator('[data-state="notice"]')).toHaveText('已显示')
  await expect(reducedTransitionDemo.locator('[data-state="active-view"]')).toHaveText('摘要视图')
  await expect(reducedTopicList).toHaveText(['Alpha', 'Beta', 'Gamma'])
  await expect(reducedTransitionDemo.getByRole('status')).toHaveText(
    '通知：已显示；视图：摘要；顺序：Alpha → Beta → Gamma',
  )
  await expectTransitionContentFitsAtDoubleTextSize(reducedTransitionDemo)
  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})
