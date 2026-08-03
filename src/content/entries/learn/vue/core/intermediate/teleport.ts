/**
 * 课程：Teleport
 * 查证日期：2026-08-01
 * 适用版本：Vue 3.5.40
 * 查证工具：Tavily、Vue 中英文官网、vuejs/core v3.5.40 固定标签源码与 W3C APG
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.teleport',
  type: 'lesson',
  title: 'Teleport',
  summary: '保持组件逻辑归属不变，把覆盖层 DOM 放到正确位置，并建立目标时机与模态交互边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.dynamic-components-keep-alive'],
  related: [
    'vue.core.learn.intermediate.dynamic-components-keep-alive',
    'vue.core.learn.intermediate.transitions',
    'vue.core.reference.composition.provide-inject',
    'vue.core.reference.built-ins.teleport',
  ],
  tags: [
    'Teleport',
    'to',
    'disabled',
    'defer',
    '逻辑组件树',
    '模态对话框',
    '焦点管理',
    'reduced motion',
  ],
  sources: [
    {
      title: 'Vue 中文 Teleport 指南',
      url: 'https://cn.vuejs.org/guide/built-ins/teleport.html',
    },
    {
      title: 'Vue English Teleport Guide',
      url: 'https://vuejs.org/guide/built-ins/teleport.html',
    },
    {
      title: 'Vue 内置组件 API：Teleport',
      url: 'https://cn.vuejs.org/api/built-in-components.html#teleport',
    },
    {
      title: 'Vue Teleport 官方 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/built-ins/teleport.md',
    },
    {
      title: 'Vue 3.5.40 Teleport.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts',
    },
    {
      title: 'W3C Dialog (Modal) Pattern',
      url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-01',
  estimatedMinutes: 60,
})

export default defineLesson({
  meta,
  objectives: [
    '区分组件逻辑树与实际 DOM 位置，并保持状态、事件和注入归属清晰',
    '用 selector 或已存在的 HTMLElement 作为 to，并明确 target 的创建者与出现时机',
    '解释 defer 只覆盖当前 mount 或 update tick，不能等待异步目标',
    '用布尔 disabled 在覆盖层与行内内容之间切换正确的 DOM 位置和语义',
    '把共享 target 的顺序、层级和焦点交给明确的业务 owner',
    '组合 Teleport 与 Transition，并在 reduced motion 下维持相同交互终态',
    '完成打开、焦点、Tab、Escape、关闭恢复焦点和背景 inert 的模态最小闭环',
    '通过公开 DOM、语义、焦点和业务状态验证 Teleport，而非读取渲染器实现细节',
  ],
  blocks: [
    { type: 'heading', content: '正文大纲' },
    {
      type: 'text',
      content:
        '上一课处理的是同一逻辑位置上组件实例如何保留或重建。本课遇到的是另一种问题：状态仍由当前组件拥有，但提示、菜单或对话框的 DOM 需要离开会裁剪它的祖先。Teleport 只负责位置；状态归属、层级和无障碍仍由应用明确设计。',
    },
    {
      type: 'table',
      headers: ['问题', 'Teleport 的职责', '应用仍需负责的部分'],
      rows: [
        [
          '祖先 overflow 或层叠上下文限制覆盖层',
          '把 children 输出到既有目标',
          '选择和维护稳定 target',
        ],
        ['对话框要离开局部 DOM', '保留原组件逻辑树', 'open 状态、确认事件和依赖归属'],
        ['覆盖层要有视觉交接', '提供最终 DOM 位置', 'Transition、reduced motion 与最终状态'],
        ['内容要成为真实模态框', '不自动附加任何 a11y 行为', '焦点、Escape、恢复焦点和背景 inert'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '本课聚焦 Vue 3.5.40 的学习路径和可验证对话框。完整 props 速查回到关联的 Teleport Reference；不会在这里实现 Suspense、全局弹层服务或路由模态框。',
    },
    { type: 'heading', content: '先分开看两棵树' },
    {
      type: 'text',
      content:
        'Teleport 改变的是渲染后的 DOM 位置，不是组件逻辑树。传送后的子内容仍从声明 Teleport 的组件接收 props，emit 仍向原逻辑父组件报告，provide/inject 和 Vue Devtools 父子关系也不迁移到目标 DOM 所属组件。目标只是一个 DOM 容器。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const confirmedCount = ref(0)

/** 接收被传送内容的确认事件。 */
function confirmDialog(): void {
  confirmedCount.value += 1
  open.value = false
}
</script>

<template>
  <button type="button" @click="open = true">打开设置</button>
  <Teleport to="body">
    <section v-if="open" role="dialog" aria-labelledby="settings-title">
      <h2 id="settings-title">设置</h2>
      <button type="button" @click="confirmDialog">确认</button>
    </section>
  </Teleport>
  <p>确认次数：{{ confirmedCount }}</p>
</template>`,
    },
    { type: 'heading', content: 'to 是已存在目标的契约' },
    {
      type: 'text',
      content:
        '`to` 可以是 CSS selector，也可以是实际 HTMLElement。普通 Teleport 会在挂载时解析它，因此调用方必须保证 target 已出现并有明确 owner。跨页面统一层通常放在应用挂载前；若使用元素对象，也应只在客户端拿到已连接的元素后传入。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- selector：index.html 中的 #modal-root 已经存在 -->
<Teleport to="#modal-root"><DialogPanel /></Teleport>

<!-- HTMLElement：modalHost 是已连接到 document 的元素 -->
<Teleport :to="modalHost"><DialogPanel /></Teleport>`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '不要把用户输入、空 ref 或“以后可能出现”的 selector 直接交给 to。目标属于页面结构契约，不是 Teleport 的异步发现能力。',
    },
    { type: 'heading', content: 'defer 只延后到同一个 tick' },
    {
      type: 'text',
      content:
        'Vue 3.5 的 defer 会把 target 解析推到当前 mount 或 update tick 的 post-render 阶段，因此同一模板中更靠后的同步节点可以成为目标。它不是订阅、轮询或重试；网络请求、计时器或下一次 tick 才出现的 target 仍然无效。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- 有效：二者都在同一次挂载中创建 -->
<Teleport defer to="#same-tick-host"><DialogPanel /></Teleport>
<div id="same-tick-host"></div>

<!-- 无效：requestFinished 在未来才变为 true -->
<Teleport defer to="#late-host"><DialogPanel /></Teleport>
<div v-if="requestFinished" id="late-host"></div>`,
    },
    { type: 'heading', content: 'disabled 切换位置，也要切换语义' },
    {
      type: 'text',
      content:
        'disabled 为 true 时，同一份 children 留在声明位置，而不是创建第二个组件实例。它适合让窄屏或特定工作流把覆盖层改为行内内容，但不能沿用虚假的模态声明：overlay 使用 dialog 和 aria-modal；行内内容应是普通 region，不制造焦点陷阱或背景 inert。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<Teleport to="body" :disabled="renderInline">
  <section
    v-if="open"
    :role="renderInline ? 'region' : 'dialog'"
    :aria-modal="renderInline ? undefined : 'true'"
    aria-labelledby="settings-title"
  >
    <h2 id="settings-title">设置</h2>
  </section>
</Teleport>`,
    },
    { type: 'heading', content: '共享 target 只会追加' },
    {
      type: 'text',
      content:
        '多个 Teleport 可以指向同一 target，Vue 只按挂载顺序追加内容。这个结果不是弹层栈、z-index 策略、业务优先级或焦点管理器。需要多个层时，应用应维护一个有序数组，由一个明确 owner 决定顺序、互斥、关闭和焦点恢复。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<Teleport to="#overlay-root">
  <DialogLayer v-for="layer in orderedLayers" :key="layer.id" :layer="layer" />
</Teleport>`,
    },
    { type: 'heading', content: 'Teleport 管位置，Transition 管视觉交接' },
    {
      type: 'text',
      content:
        '把 Teleport 放在外层，让 Transition 包裹真正按 open 存在或离开的 dialog 节点。这样位置和动画各自只有一个职责。状态、inert 和焦点不能等待动画结束；reduced motion 只取消非必要位移和时长，不能改变打开、关闭或键盘操作的最终结果。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<Teleport to="body">
  <Transition name="dialog">
    <section v-if="open" role="dialog" aria-modal="true">...</section>
  </Transition>
</Teleport>`,
    },
    { type: 'heading', content: '模态对话框是额外交互契约' },
    {
      type: 'text',
      content:
        'Teleport 不会自动使内容成为 modal。只有 overlay 模式真实做到可访问名称、焦点进入、Tab 与 Shift+Tab 循环、Escape 关闭、关闭后恢复触发焦点，以及背景不可交互时，才可设置 aria-modal="true"。本课 Demo 用 body 作为目标并把 #app 设为 inert；disabled 行内模式刻意不承诺这些行为。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '目标还未存在就挂载普通 Teleport',
          description: '默认挂载会立即解析 to，不会等待同一页面未来由状态创建的 host。',
          consequence: '开发环境报告无法定位 target，内容不能稳定进入预期容器。',
          wrong: {
            lang: 'vue',
            content:
              '<Teleport to="#modal-root"><DialogPanel /></Teleport>\n<div v-if="hostReady" id="modal-root"></div>',
          },
          correct: {
            lang: 'html',
            content: '<div id="app"></div>\n<div id="modal-root"></div>',
          },
        },
        {
          title: '把 defer 当成异步重试',
          description: 'defer 只覆盖当前 mount 或 update tick 的 post-render 阶段。',
          consequence: '目标在请求、计时器或下一次 tick 才出现时仍会失败。',
          wrong: {
            lang: 'vue',
            content:
              '<Teleport defer to="#late-host"><DialogPanel /></Teleport>\n<div v-if="requestFinished" id="late-host"></div>',
          },
          correct: {
            lang: 'vue',
            content:
              '<Teleport defer to="#late-host"><DialogPanel /></Teleport>\n<div id="late-host"></div>',
          },
        },
        {
          title: '用 disabled="false" 期待传送仍启用',
          description: '未绑定 attribute 是字符串，非空的 "false" 仍是真值。',
          consequence: 'DOM 留在原地，裁剪和层叠问题仍然存在。',
          wrong: {
            lang: 'vue',
            content: '<Teleport to="body" disabled="false"><DialogPanel /></Teleport>',
          },
          correct: {
            lang: 'vue',
            content: '<Teleport to="body" :disabled="false"><DialogPanel /></Teleport>',
          },
        },
        {
          title: '把目标 DOM 所属组件当成新的逻辑父组件',
          description: 'Teleport 只移动 DOM，props、emit 与 provide/inject 仍沿原组件树工作。',
          consequence: '预期的 inject 不存在，或出现重复的全局状态和事件转发。',
          wrong: {
            lang: 'vue',
            content: '<Teleport to="#theme-host"><DialogContent /></Teleport>',
          },
          correct: {
            lang: 'vue',
            content:
              '<Teleport to="#theme-host">\n  <DialogContent @close="open = false" />\n</Teleport>',
          },
        },
        {
          title: '把同目标追加当成 z-index、焦点和业务顺序',
          description: '多个 Teleport 只有挂载顺序的简单追加，不共享业务层状态。',
          consequence: 'DOM、读屏与焦点返回顺序可能和真实优先级冲突。',
          wrong: {
            lang: 'vue',
            content:
              '<Teleport to="#layers"><ConfirmDialog /></Teleport>\n<Teleport to="#layers"><AlertDialog /></Teleport>',
          },
          correct: {
            lang: 'vue',
            content:
              '<Teleport to="#layers">\n  <DialogLayer v-for="layer in orderedLayers" :key="layer.id" />\n</Teleport>',
          },
        },
        {
          title: '认为 Teleport 自动实现可访问模态框',
          description: '只声明 role 和 aria-modal 不会自动移动焦点、阻断背景或处理 Escape。',
          consequence: '键盘和读屏用户会得到错误的模态承诺，并可能失去焦点。',
          wrong: {
            lang: 'vue',
            content:
              '<Teleport to="body"><section v-if="open" role="dialog" aria-modal="true">...</section></Teleport>',
          },
          correct: {
            lang: 'vue',
            content:
              '<section role="dialog" aria-modal="true" @keydown="handleDialogKeydown">...</section>',
          },
        },
        {
          title: '让 Transition 或 reduced motion 决定业务结束',
          description: 'Teleport 管位置，Transition 只管理条件节点的视觉交接。',
          consequence: '减弱动态效果时可能漏掉关闭、inert 撤销或焦点恢复。',
          wrong: {
            lang: 'vue',
            content: '<Transition><Teleport to="body"><DialogPanel /></Teleport></Transition>',
          },
          correct: {
            lang: 'vue',
            content:
              '<Teleport to="body"><Transition name="dialog"><DialogPanel v-if="open" /></Transition></Teleport>',
          },
        },
        {
          title: '用 renderer 锚点或固定等待断言传送成功',
          description: 'Vue 注释锚点、VNode 字段和临时 transition class 都不是公开测试契约。',
          consequence: '速度、motion 偏好或渲染器优化会让测试脆弱且无法证明用户任务完成。',
          wrong: {
            lang: 'ts',
            content:
              "await page.waitForTimeout(180)\nexpect(await page.locator('comment=teleport start')).toHaveCount(1)",
          },
          correct: {
            lang: 'ts',
            content:
              "await page.getByTestId('open-teleport-dialog').press('Enter')\nawait expect(page.getByRole('dialog')).toBeVisible()",
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导可观察边界' },
    {
      type: 'steps',
      items: [
        {
          title: '字符串目标由 renderer 查询',
          content: 'resolveTarget 对字符串 to 调用 querySelector；找不到 target 不会变成未来重试。',
        },
        {
          title: '声明位置和目标位置都有锚点',
          content: '初次处理时运行时记录主锚点与 target anchor，children 选择实际挂载容器。',
        },
        {
          title: 'disabled 与 target 变化是移动',
          content: '已有 DOM 会在容器间转移，逻辑组件树、状态和依赖关系无需成为目标组件的后代。',
        },
        {
          title: 'defer 进入 post-render 队列',
          content: '同一周期结束仍没有 target 时即失败，因此不应把它设计成异步资源等待机制。',
        },
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '锚点、shapeFlag 和内部 target 字段用于理解实现，不是页面或自动化的 selector。验证应只操作公开控件，再观察最终 DOM 位置、语义、焦点和业务摘要。',
    },
    { type: 'heading', content: '在对话框实验台验证位置与交互' },
    {
      type: 'text',
      content:
        '唯一 Demo 先以 body 中的真实 overlay 验证焦点和 inert，再通过同一 Teleport 的 disabled 切换到行内 region。确认、取消和 Escape 都通过逻辑父组件更新关闭次数；它们不依赖 Teleport 目标所属的 DOM。',
    },
    {
      type: 'demo',
      id: 'vue.core.learn.intermediate.teleport.teleport-dialog-lab-demo',
      description:
        '验证 body overlay、disabled 行内模式、逻辑事件、焦点恢复和 reduced motion 下的相同终态',
      playground: true,
    },
    { type: 'heading', content: '练习与回顾' },
    {
      type: 'exercise',
      title: '修复目标时机与布尔值',
      instructions:
        '给一个 defer 配合 v-if="requestFinished" target，以及 disabled="false" 的对话框。分别改为应用挂载前或同 tick 已存在的 host，并把 disabled 改为布尔绑定；说明两个边界为何不同。',
      answer:
        'target 问题是出现时机，defer 不能跨未来 tick；disabled 问题是 attribute 类型，必须通过 :disabled 传入 boolean。',
    },
    {
      type: 'exercise',
      title: '审查一个看起来像 modal 的覆盖层',
      instructions:
        '一个 Teleport 内只有 role="dialog" 和 aria-modal="true"。列出必须补齐的交互，并说明为什么 disabled 行内模式不能复用 aria-modal。',
      answer:
        '补齐可访问名称、焦点进入、Tab/Shift+Tab、Escape、关闭后恢复焦点和背景 inert。行内模式没有阻断背景，因此应是 region 而非 modal。',
    },
  ],
  exercises: [
    '把 ConfirmPanel 放入 Teleport to="body"，保持 confirmedCount 在当前 SFC，并解释 confirm 为什么仍回到逻辑父组件。',
  ],
  recap: [
    'Teleport 移动 DOM，不移动组件逻辑父子、state、props、emit 或 provide/inject。',
    'to 可以是 selector 或 HTMLElement；target 的存在时机由调用方负责。',
    'defer 只延后到当前 mount/update tick 的 post-render 阶段，不能等待异步未来。',
    'disabled 必须是布尔 prop；它让同一份内容在目标与原地之间切换。',
    '同目标 Teleport 只追加；顺序、层级与焦点要由明确业务 owner 管理。',
    'Teleport 管位置，Transition 管视觉；reduced motion 不改变交互终态。',
    'aria-modal 只有在焦点和背景交互边界真实成立时才可使用。',
    '自动化只验证公开 DOM、语义、焦点与最终业务状态，不依赖 renderer 锚点或固定等待。',
  ],
})
