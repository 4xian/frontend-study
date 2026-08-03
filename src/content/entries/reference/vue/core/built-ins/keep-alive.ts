/**
 * 知识点：<KeepAlive>
 * 查证来源（2026-07-29）：
 * - https://cn.vuejs.org/api/built-in-components.html#keepalive
 * - https://cn.vuejs.org/guide/built-ins/keep-alive.html
 * - https://cn.vuejs.org/api/composition-api-lifecycle.html#onactivated
 * - https://github.com/vuejs/docs/blob/main/src/guide/built-ins/keep-alive.md
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts
 * 查证工具：Vue 官方文档、官方原始 Markdown、vuejs/core v3.5.40 源码与本地类型声明
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.built-ins.keep-alive',
  type: 'reference',
  title: '<KeepAlive>',
  summary:
    '缓存动态切换的组件实例：切走时停用而非卸载，切回时恢复实例，并可按组件名筛选或用 max 限制缓存',
  ecosystem: 'vue',
  module: 'core',
  collection: 'built-ins',
  related: [
    'vue.core.reference.built-ins.transition',
    'vue.core.reference.composition.lifecycle',
    'vue.core.reference.built-ins.suspense',
  ],
  tags: ['KeepAlive', '动态组件', '缓存', 'onActivated', 'onDeactivated', 'LRU'],
  sources: [
    {
      title: 'Vue 内置组件 API：KeepAlive',
      url: 'https://cn.vuejs.org/api/built-in-components.html#keepalive',
    },
    {
      title: 'Vue KeepAlive 指南',
      url: 'https://cn.vuejs.org/guide/built-ins/keep-alive.html',
    },
    {
      title: 'Vue 组合式 API：onActivated / onDeactivated',
      url: 'https://cn.vuejs.org/api/composition-api-lifecycle.html#onactivated',
    },
    {
      title: 'Vue KeepAlive 指南原始 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/built-ins/keep-alive.md',
    },
    {
      title: 'Vue 3.5.40 KeepAlive.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-29',
  anchors: [
    '概述',
    'include / exclude / max',
    'onActivated / onDeactivated',
    '缓存身份与淘汰',
    '易错使用提示',
    '最小源码实现',
  ],
})

export default defineReference({
  meta,
  signature: `type MatchPattern = string | RegExp | (string | RegExp)[]

interface KeepAliveProps {
  include?: MatchPattern
  exclude?: MatchPattern
  max?: number | string
}`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '动态组件切换时，默认会卸载旧组件并挂载新组件，旧实例的局部状态随之丢失。`<KeepAlive>` 包裹唯一活动子组件后，切走的实例会进入停用状态并保存在缓存中，切回时恢复同一个实例，而不是重新创建。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<KeepAlive>
  <component :is="activeComponent" />
</KeepAlive>`,
    },
    {
      type: 'demo',
      id: 'vue.core.reference.built-ins.keep-alive.keep-alive-demo',
      description: '对比 KeepAlive 缓存与普通动态组件切换时内部计数是否保留',
      playground: true,
    },
    { type: 'heading', content: 'include / exclude / max' },
    {
      type: 'text',
      content:
        '`include` 与 `exclude` 按组件自身的 `name` 匹配缓存范围，支持逗号分隔字符串、正则表达式和数组。`<script setup>` 单文件组件可从文件名推断名称，也可以用 `defineOptions({ name })` 明确设置。`max` 是缓存实例上限，超过后按 LRU 顺序卸载最久未访问的实例。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- 逗号分隔字符串：按组件 name 匹配 -->
<KeepAlive include="EditorPanel,PreviewPanel">
  <component :is="activeComponent" />
</KeepAlive>

<!-- 正则需要用 v-bind -->
<KeepAlive :include="/Panel$/">
  <component :is="activeComponent" />
</KeepAlive>

<!-- 最多缓存 10 个实例，超出后按 LRU 淘汰 -->
<KeepAlive :max="10">
  <component :is="activeComponent" />
</KeepAlive>`,
    },
    { type: 'heading', content: 'onActivated / onDeactivated' },
    {
      type: 'text',
      content:
        '缓存树首次挂载以及每次从缓存插回 DOM 后，会调用 `onActivated()`；实例移入缓存以及最终卸载时，会调用 `onDeactivated()`。因此，可见时启动、隐藏时暂停的轮询、订阅和播放器控制应覆盖这对生命周期，而不能只依赖挂载与卸载。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { onActivated, onDeactivated } from 'vue'

// 初次挂载和每次从缓存恢复时启动外部活动
onActivated(startPolling)

// 每次移入缓存和最终卸载时停止外部活动
onDeactivated(stopPolling)`,
    },
    { type: 'heading', content: '缓存身份与淘汰' },
    {
      type: 'text',
      content:
        'Vue 3.5.40 使用 vnode 的显式 `key` 作为缓存键；没有 `key` 时使用组件类型。稳定 key 可以区分同一组件类型的不同实例，持续变化的 key 则会制造新的缓存项。命中缓存时，Vue 复用已保存的组件实例并刷新其 LRU 顺序；未命中时，在组件完成渲染后保存其子树。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'KeepAlive 保存的是组件实例和 DOM 子树，不是业务数据的持久化方案。有限缓存可能被 `max` 淘汰，需要长期保存的草稿或查询条件应放到组件外部状态。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '用路由名或标签名配置 include / exclude',
          description:
            '`include` 与 `exclude` 匹配组件自己的 `name`，不是 route name、URL 路径或父模板中的组件标签。没有可解析名称的组件也无法命中 `include`。',
          consequence:
            '目标页面切换回来时重新挂载，或者本应排除的组件仍保留旧状态，缓存范围与配置表面上不一致。',
          wrong: {
            lang: 'vue',
            content: `<!-- 路由名是 settings，组件名是 SettingsPanel -->
<KeepAlive include="settings">
  <component :is="activeComponent" />
</KeepAlive>`,
          },
          correct: {
            lang: 'vue',
            content: `<!-- SettingsPanel.vue：名称属于被缓存组件 -->
<script setup lang="ts">
defineOptions({ name: 'SettingsPanel' })
</script>

<!-- ParentView.vue：include 使用被缓存组件的 name -->
<template>
  <KeepAlive include="SettingsPanel">
    <component :is="activeComponent" />
  </KeepAlive>
</template>`,
          },
        },
        {
          title: '把停用当成卸载，只在 onUnmounted() 释放资源',
          description:
            '缓存实例切走时进入 `deactivated`，并没有卸载；只注册 `onUnmounted()` 不能覆盖每次切走的时机。恢复显示对应 `activated`。',
          consequence:
            '不可见页面的轮询、订阅或播放器继续运行，多次切换后还可能留下重复的外部资源活动。',
          wrong: {
            lang: 'ts',
            content: 'onMounted(startPolling)\nonUnmounted(stopPolling)',
          },
          correct: {
            lang: 'ts',
            content: 'onActivated(startPolling)\nonDeactivated(stopPolling)',
          },
        },
        {
          title: '以为 max 只限制可见数量，不会销毁旧缓存',
          description:
            '`max` 限制缓存实例总数。达到上限后，Vue 3.5.40 按 LRU 顺序淘汰并卸载最久未访问的实例，不会永久保存所有历史页面。',
          consequence:
            '返回较早页面时得到全新实例，局部表单或滚动状态丢失，被淘汰组件也会执行卸载流程。',
          wrong: {
            lang: 'vue',
            content: `<!-- 错误地假设访问过的页面都会永久保留 -->
<KeepAlive :max="2">
  <component :is="activeComponent" />
</KeepAlive>`,
          },
          correct: {
            lang: 'vue',
            content: `<!-- 持久草稿放在组件外，缓存实例允许重建 -->
<KeepAlive :max="2">
  <component :is="activeComponent" :draft="draftStore.current" />
</KeepAlive>`,
          },
        },
        {
          title: '给缓存子组件使用每次渲染都会变化的 key',
          description:
            'vnode 有显式 `key` 时，Vue 直接用它作为缓存键。持续变化的 key 会不断创建不同缓存项，而不是复用当前组件实例。',
          consequence: '预期复用的状态反而重置；设置 `max` 后还会频繁淘汰其他正常缓存项。',
          wrong: {
            lang: 'vue',
            content:
              '<KeepAlive :max="10">\n  <component :is="activeComponent" :key="Date.now()" />\n</KeepAlive>',
          },
          correct: {
            lang: 'vue',
            content:
              '<KeepAlive :max="10">\n  <component :is="activeComponent" :key="activeTab.id" />\n</KeepAlive>',
          },
        },
        {
          title: '在 KeepAlive 中同时放多个直接组件子节点',
          description:
            '`KeepAlive` 在任一时刻只允许一个活动组件实例作为直接子节点，它不是通用的多组件缓存容器。',
          consequence:
            '开发环境出现 `should contain exactly one component child` 警告，并放弃预期的单子组件缓存路径。',
          wrong: {
            lang: 'vue',
            content: '<KeepAlive>\n  <EditorPanel />\n  <PreviewPanel />\n</KeepAlive>',
          },
          correct: {
            lang: 'vue',
            content: '<KeepAlive>\n  <component :is="activePanel" />\n</KeepAlive>',
          },
        },
      ],
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        '`KeepAlive` 用 `Map<key, vnode>` 保存缓存，用 `Set` 的插入顺序维护 LRU。渲染器获得 `activate` 与 `deactivate` 两个方法：停用时把组件 DOM 移进隐藏容器而非卸载，激活时再移回真实容器。渲染阶段只记录 `pendingCacheKey`，等 mounted/updated 后才把已经渲染完成的子树写入缓存；命中时则复用缓存 vnode 的组件实例和 DOM。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 KeepAlive.ts
const cache = new Map<CacheKey, VNode>()
const keys = new Set<CacheKey>()
const storageContainer = createElement('div')
let pendingCacheKey: CacheKey | null = null

/** 在组件完成渲染后缓存真实子树。 */
function cacheSubtree() {
  if (pendingCacheKey !== null) {
    cache.set(pendingCacheKey, getInnerChild(instance.subTree))
  }
}

onMounted(cacheSubtree)
onUpdated(cacheSubtree)

/** 把停用组件移入隐藏容器，并在移动完成后调用停用钩子。 */
sharedContext.deactivate = (vnode: VNode) => {
  const component = vnode.component!
  move(vnode, storageContainer, null, MoveType.LEAVE)
  queuePostRenderEffect(() => {
    if (component.da) invokeArrayFns(component.da)
  }, instance.suspense)
}

/** 把缓存组件移回真实容器，并在 patch 后调用激活钩子。 */
sharedContext.activate = (vnode: VNode, container, anchor) => {
  const component = vnode.component!
  move(vnode, container, anchor, MoveType.ENTER)
  patch(component.vnode, vnode, container, anchor, component)
  queuePostRenderEffect(() => {
    if (component.a) invokeArrayFns(component.a)
  }, instance.suspense)
}

/** 选择唯一子组件，按名称过滤并复用或登记缓存。 */
function renderKeepAlive() {
  const children = slots.default?.()
  if (!children || children.length !== 1) return children

  const rawVNode = children[0]
  const vnode = getInnerChild(rawVNode)
  const name = getComponentName(vnode.type)
  if (
    (props.include && (!name || !matches(props.include, name))) ||
    (props.exclude && name && matches(props.exclude, name))
  ) {
    return vnode
  }

  const key = vnode.key == null ? vnode.type : vnode.key
  const cachedVNode = cache.get(key)
  pendingCacheKey = key

  if (cachedVNode) {
    vnode.el = cachedVNode.el
    vnode.component = cachedVNode.component
    vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE
    keys.delete(key)
    keys.add(key)
  } else {
    keys.add(key)
    if (props.max && keys.size > parseInt(String(props.max), 10)) {
      pruneCacheEntry(keys.values().next().value)
    }
  }

  vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
  return vnode
}`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '组件被停用时实例并未销毁，DOM 只是被移动到隐藏容器；组件最终被淘汰或父级卸载时，Vue 会重置 keep-alive 标记并走正常卸载流程。',
    },
  ],
})
