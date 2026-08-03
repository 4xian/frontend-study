/**
 * 知识点：<Suspense>
 * 查证来源（2026-07-29）：
 * - https://cn.vuejs.org/guide/built-ins/suspense.html
 * - https://cn.vuejs.org/api/built-in-components.html#suspense
 * - https://github.com/vuejs/docs/blob/main/src/guide/built-ins/suspense.md
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts
 * 查证工具：Tavily（套餐用量上限，已回退）、Vue 官方文档、官方原始 Markdown、
 * vuejs/core v3.5.40 源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.built-ins.suspense',
  type: 'reference',
  title: '<Suspense>',
  summary: '协调子树中的 async setup 与异步组件依赖，在正式内容解析期间统一显示 fallback',
  ecosystem: 'vue',
  module: 'core',
  collection: 'built-ins',
  related: [
    'vue.core.reference.built-ins.keep-alive',
    'vue.core.reference.built-ins.transition',
    'vue.core.reference.composition.lifecycle',
    'vue.core.reference.application.define-async-component',
  ],
  tags: ['Suspense', 'async setup', 'fallback', 'timeout', '异步组件'],
  sources: [
    {
      title: 'Vue Suspense 指南',
      url: 'https://cn.vuejs.org/guide/built-ins/suspense.html',
    },
    {
      title: 'Vue 内置组件 API：Suspense',
      url: 'https://cn.vuejs.org/api/built-in-components.html#suspense',
    },
    {
      title: 'Vue Suspense 指南原始 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/built-ins/suspense.md',
    },
    {
      title: 'Vue 3.5.40 Suspense.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts',
    },
    {
      title: 'Vue 3.5.40 apiAsyncComponent.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-29',
  anchors: [
    '概述',
    '异步依赖',
    '加载状态与事件',
    '组合顺序与实验性状态',
    '易错使用提示',
    '最小源码实现',
  ],
})

export default defineReference({
  meta,
  signature:
    'interface SuspenseProps {\n  onResolve?: () => void\n  onPending?: () => void\n  onFallback?: () => void\n  timeout?: string | number\n  suspensible?: boolean\n}',
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '`<Suspense>` 把默认插槽子树中的异步依赖聚合成一个等待边界。首次挂载时，正式内容先在文档外解析；只要仍有依赖未完成，真实位置就显示 `#fallback`。全部依赖完成后，Vue 再一次性把正式内容移入页面，避免多个局部 loading 依次闪现。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<Suspense>
  <Dashboard />

  <template #fallback>
    <LoadingPanel />
  </template>
</Suspense>`,
    },
    {
      type: 'demo',
      id: 'vue.core.reference.built-ins.suspense.suspense-demo',
      description: '聚合等待两个不同耗时的 async setup 组件，直到最慢依赖完成',
      playground: true,
    },
    { type: 'heading', content: '异步依赖' },
    {
      type: 'text',
      content:
        '边界会等待两类依赖：返回 Promise 的 `async setup()`，包括 `<script setup>` 顶层 await；以及默认 `suspensible: true` 的 `defineAsyncComponent()` 组件。普通 `onMounted()` 中启动的请求不在 setup 阶段登记，不会触发 fallback。异步组件被边界接管后，其 loading、delay 和 timeout 选项不再控制加载界面；需要局部控制时设置 `suspensible: false`。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
const posts = await loadPosts()
</script>

<template>
  <PostList :posts="posts" />
</template>`,
    },
    { type: 'heading', content: '加载状态与事件' },
    {
      type: 'text',
      content:
        'Suspense 可触发 `pending`、`fallback` 和 `resolve` 三个事件。已解析边界只有在默认插槽的根节点被替换时才重新进入 pending；`timeout` 决定这次根替换后等待多久再显示 fallback，`0` 表示立即显示。它不是网络超时，不会取消请求或把 Promise 拒绝转换成错误界面。默认和 fallback 插槽都必须只有一个直接根节点。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<Suspense
  :timeout="0"
  @pending="loading = true"
  @resolve="loading = false"
>
  <Dashboard :key="userId" :user-id="userId" />
  <template #fallback><LoadingPanel /></template>
</Suspense>`,
    },
    { type: 'heading', content: '组合顺序与实验性状态' },
    {
      type: 'text',
      content:
        'Vue 3.5.40 仍把 Suspense 标记为实验性功能，公开 API 可能变化。与 RouterView、Transition、KeepAlive 组合时，官方建议保持 `RouterView > Transition > KeepAlive > Suspense` 的嵌套顺序。Suspense 没有错误插槽；异步错误仍应通过 `onErrorCaptured()`、`errorCaptured` 或 `app.config.errorHandler` 处理。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '期待 onMounted() 中的任意异步请求触发 fallback',
          description:
            'Suspense 只登记 async setup 和可挂起的异步组件；同步 setup 完成后才启动的 Promise 不属于边界依赖。',
          consequence: '边界立即 resolved，fallback 不显示，页面直接出现空数据或局部 loading。',
          wrong: {
            lang: 'ts',
            content:
              'const posts = ref<Post[]>([])\n\nonMounted(async () => {\n  posts.value = await loadPosts()\n})',
          },
          correct: {
            lang: 'vue',
            content:
              '<script setup lang="ts">\nconst posts = await loadPosts()\n</script>\n<template><PostList :posts="posts" /></template>',
          },
        },
        {
          title: '在 Suspense 内仍期待异步组件自己的加载选项生效',
          description:
            '异步组件默认 `suspensible: true`，父链存在 Suspense 时，`loadingComponent`、`delay` 和 `timeout` 由边界接管；loader 拒绝后，配置的 `errorComponent` 仍可渲染。',
          consequence: '局部 loadingComponent 不显示，实际只看到 Suspense 的 fallback。',
          wrong: {
            lang: 'ts',
            content:
              "const AsyncPanel = defineAsyncComponent({\n  loader: () => import('./Panel.vue'),\n  loadingComponent: LocalSpinner,\n  delay: 0,\n})",
          },
          correct: {
            lang: 'ts',
            content:
              "const AsyncPanel = defineAsyncComponent({\n  loader: () => import('./Panel.vue'),\n  loadingComponent: LocalSpinner,\n  suspensible: false,\n})",
          },
        },
        {
          title: '在 default 或 fallback 插槽中放多个直接根节点',
          description:
            '两个插槽都要求单个直接子节点，不能把 Suspense 当成可接受任意 Fragment 的普通容器。',
          consequence: '开发环境警告插槽必须单根，边界得不到预期的完整正式树或 fallback 树。',
          wrong: {
            lang: 'vue',
            content:
              '<Suspense>\n  <PageHeader />\n  <AsyncDashboard />\n  <template #fallback><Spinner /><p>加载中</p></template>\n</Suspense>',
          },
          correct: {
            lang: 'vue',
            content:
              '<Suspense>\n  <main><PageHeader /><AsyncDashboard /></main>\n  <template #fallback><section><Spinner /><p>加载中</p></section></template>\n</Suspense>',
          },
        },
        {
          title: '边界 resolved 后期待任意深层新依赖重新显示 fallback',
          description:
            '只有默认插槽根节点被替换才让已解析边界重新 pending；深层后来出现的异步依赖不会回退现有边界。',
          consequence: '深层切换时 fallback 不出现，把 timeout 当网络超时也不会取消请求。',
          wrong: {
            lang: 'vue',
            content:
              '<Suspense :timeout="3000">\n  <Dashboard :user-id="userId" />\n  <template #fallback><Spinner /></template>\n</Suspense>',
          },
          correct: {
            lang: 'vue',
            content:
              '<Suspense :timeout="0">\n  <Dashboard :key="userId" :user-id="userId" />\n  <template #fallback><Spinner /></template>\n</Suspense>',
          },
        },
        {
          title: '把 fallback 当成错误界面或编写不存在的 error 插槽',
          description:
            'Suspense 只协调 pending 和 resolved，没有内置错误处理或 `#error` 插槽。异步错误仍沿组件错误链传播。',
          consequence: 'Promise 拒绝时不会自动切到自定义错误插槽，页面也可能缺少错误反馈。',
          wrong: {
            lang: 'vue',
            content:
              '<Suspense>\n  <AsyncDashboard />\n  <template #fallback><Spinner /></template>\n  <template #error="{ error }"><ErrorPanel :error="error" /></template>\n</Suspense>',
          },
          correct: {
            lang: 'ts',
            content:
              'const capturedError = shallowRef<unknown>()\n\nonErrorCaptured((error) => {\n  capturedError.value = error\n  return false\n})',
          },
        },
      ],
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        'SuspenseBoundary 用 `deps` 记录未完成的异步依赖。默认分支先渲染到隐藏容器；遇到 async setup 时 `registerDep()` 增加计数，并在 Promise 完成后恢复组件渲染、减少计数。只要计数大于零，真实位置显示 fallback；归零后 `resolve()` 把完整默认分支移入真实容器并卸载 fallback。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 Suspense.ts
const suspense = {
  deps: 0,
  pendingBranch: vnode.ssContent,

  // 登记一个 async setup 组件，并在完成后尝试解析边界
  registerDep(instance: ComponentInternalInstance) {
    this.deps++
    instance.asyncDep.then((result) => {
      handleSetupResult(instance, result)
      setupRenderEffect(instance)
      this.deps--
      if (this.deps === 0) this.resolve()
    })
  },

  // 把已经解析完成的默认分支移入真实容器
  resolve() {
    move(this.pendingBranch, container, anchor)
    unmount(this.activeBranch)
    this.activeBranch = this.pendingBranch
  },
}`,
    },
  ],
})
