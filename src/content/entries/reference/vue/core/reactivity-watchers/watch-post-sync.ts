/**
 * 知识点：watchPostEffect() / watchSyncEffect()
 * 查证来源（2026-07-28）：
 * - https://vuejs.org/api/reactivity-core（两个别名的定义：flush 'post' / 'sync' 的 watchEffect）
 * - https://vuejs.org/guide/essentials/watchers（Callback Flush Timing：pre 默认在组件更新前、post 在 DOM 更新后、sync 同步无批量，慎用于高频数据）
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiWatch.ts（别名定义与三种 flush 的调度器分派最小源码实现，2026-07-27）
 * 查证工具：Vue 官方中文文档原始 Markdown、GitHub vuejs/core v3.5.40 源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.reactivity-watchers.watch-post-sync',
  type: 'reference',
  title: 'watchPostEffect() / watchSyncEffect()',
  summary: 'watchEffect 的两个 flush 时机别名：post 在 DOM 更新后执行，sync 在依赖变化时同步执行',
  ecosystem: 'vue',
  module: 'core',
  collection: 'reactivity-watchers',
  related: [
    'vue.core.reference.reactivity-watchers.watch-effect',
    'vue.core.reference.reactivity-watchers.watch',
  ],
  tags: ['watchPostEffect', 'watchSyncEffect', 'flush', 'post', 'sync'],
  sources: [
    {
      title: 'Vue 响应式 API：核心',
      url: 'https://cn.vuejs.org/api/reactivity-core.html#watchposteffect',
    },
    {
      title: 'Vue 侦听器回调刷新时机',
      url: 'https://cn.vuejs.org/guide/essentials/watchers.html#callback-flush-timing',
    },
    {
      title: 'Vue 3.5.40 apiWatch.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiWatch.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-28',
  anchors: [
    '概述',
    '三种 flush 时机',
    'DOM 更新时机差异',
    '最小源码实现',
    'sync 的代价',
    '易错使用提示',
  ],
})

export default defineReference({
  meta,
  signature:
    'function watchPostEffect(effect: WatchEffect): WatchHandle\nfunction watchSyncEffect(effect: WatchEffect): WatchHandle',
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '这两个 API 是 watchEffect() 固定 flush 选项的便捷别名：`watchPostEffect` = `watchEffect(fn, { flush: "post" })`，`watchSyncEffect` = `watchEffect(fn, { flush: "sync" })`。理解它们的关键是理解回调的三种触发时机（flush timing）。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { watchEffect, watchPostEffect, watchSyncEffect } from 'vue'

watchEffect(callback)                    // 默认 pre：组件 DOM 更新前
watchEffect(callback, { flush: 'post' }) // 等价于 watchPostEffect(callback)
watchEffect(callback, { flush: 'sync' }) // 等价于 watchSyncEffect(callback)`,
    },
    { type: 'heading', content: '三种 flush 时机' },
    {
      type: 'table',
      headers: ['时机', '执行位置', '批量合并', '典型用途'],
      rows: [
        ['pre（默认）', '父组件更新后、当前组件 DOM 更新前', '是', '绝大多数副作用'],
        ['post', '当前组件 DOM 更新之后', '是', '副作用中需要读取更新后的 DOM'],
        ['sync', '响应式数据一变就同步执行', '否', '需要在 Vue 介入前拿到变化的罕见场景'],
      ],
    },
    { type: 'heading', content: 'DOM 更新时机差异' },
    {
      type: 'text',
      content:
        '默认（pre）回调执行时，数据已是新值，但组件 DOM 还没重新渲染——读 DOM 拿到的是旧内容；post 回调在 DOM 更新后执行，读写 DOM 都安全。',
    },
    {
      type: 'demo',
      id: 'vue.core.reference.reactivity-watchers.watch-post-sync.flush-timing-demo',
      description: '同一次 count++：pre 回调读到旧 DOM 文本，post 回调读到新 DOM 文本',
      playground: true,
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        '源码证实"别名"二字的字面含义：两个函数各自只有一行——给 watchEffect 补上固定的 flush 选项。三种 flush 的差别则全部体现在调度器（scheduler）上：依赖变化时副作用并不直接重跑，而是把 job 交给不同的队列——post 进"DOM 更新后队列"（queuePostRenderEffect），pre 进组件更新前的任务队列（queueJob，同一 tick 多次变化会去重合并，这就是批量的来源），sync 干脆不设调度器，依赖一变 job 原地执行，因此没有任何合并。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 packages/runtime-core/src/apiWatch.ts
// 两个"别名"的完整真身：
export function watchPostEffect(effect: WatchEffect) {
  return doWatch(effect, null, { flush: 'post' })
}

export function watchSyncEffect(effect: WatchEffect) {
  return doWatch(effect, null, { flush: 'sync' })
}

// doWatch 中三种 flush 对应三种调度策略：
function doWatch(source: any, cb: any, { flush }: WatchOptions = {}) {
  const options: BaseWatchOptions = {}

  if (flush === 'post') {
    // job 放进"组件 DOM 更新之后"的队列 → 回调里能读到新 DOM
    options.scheduler = (job) => queuePostRenderEffect(job)
  } else if (flush !== 'sync') {
    // 默认 'pre'：job 进渲染前任务队列；同一 tick 重复入队会被去重 → 批量
    options.scheduler = (job) => queueJob(job)
  }
  // 'sync'：不设置 scheduler → 依赖一变 job 原地同步执行，无批量

  return baseWatch(source, cb, options) // 组装好调度策略，交给 reactivity 层的 watch
}`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '这也解释了 sync 的性能警告：pre/post 的批量来自队列去重（同一个 job 一个 tick 只跑一次），sync 没有队列，改十次就同步跑十次。',
    },
    { type: 'heading', content: 'sync 的代价' },
    {
      type: 'text',
      content:
        'sync 侦听器没有批量机制：每一次响应式修改都立即触发一次回调。同一 tick 改十次就执行十次，而 pre/post 只批量执行一次。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '用 pre / sync effect 读取组件更新后的 DOM',
          description:
            '误以为 watcher 看到新状态时，组件 DOM 也必然完成更新。默认 pre 回调早于所有者组件 DOM 更新，sync 更是在 Vue 管理的更新前同步执行。',
          consequence:
            '`getBoundingClientRect()`、`textContent` 或焦点检查读到上一次渲染的 DOM 状态。',
          wrong: {
            lang: 'ts',
            content:
              'watchSyncEffect(() => {\n  width.value = panel.value?.getBoundingClientRect().width ?? 0\n})',
          },
          correct: {
            lang: 'ts',
            content:
              'watchPostEffect(() => {\n  width.value = panel.value?.getBoundingClientRect().width ?? 0\n})',
          },
        },
        {
          title: '对会同步批量变更的数据使用 `watchSyncEffect()`',
          description:
            '把 sync 理解成“更快”。同步 watcher 不进入批处理队列，每次检测到响应式修改都会立刻触发。',
          consequence:
            '连续 push 100 个元素可能执行 100 次昂贵逻辑，中间状态也会逐一暴露给副作用。',
          wrong: {
            lang: 'ts',
            content:
              'watchSyncEffect(() => rebuildIndex(items.value))\n\nfor (let index = 0; index < 100; index++) {\n  items.value.push(index)\n}',
          },
          correct: {
            lang: 'ts',
            content:
              'watchEffect(() => rebuildIndex(items.value))\n\nfor (let index = 0; index < 100; index++) {\n  items.value.push(index)\n}',
          },
        },
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        'watch() 同样支持 `flush: "post" / "sync"` 选项，语义一致；只是没有对应的具名别名函数。',
    },
  ],
})
