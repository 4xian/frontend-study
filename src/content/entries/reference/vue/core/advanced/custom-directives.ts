/**
 * 知识点：自定义指令
 * 查证来源（2026-07-29）：
 * - https://cn.vuejs.org/guide/reusability/custom-directives.html
 * - https://cn.vuejs.org/guide/scaling-up/ssr.html#custom-directives
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/directives.spec.ts
 * 查证工具：Tavily（套餐用量上限，已回退）、Vue 官方文档、源码与官方测试
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.advanced.custom-directives',
  type: 'reference',
  title: '自定义指令',
  summary: '用元素生命周期钩子封装必须直接操作 DOM 的复用逻辑，并正确管理资源与 SSR 输出',
  ecosystem: 'vue',
  module: 'core',
  collection: 'advanced',
  related: [
    'vue.core.reference.advanced.composables',
    'vue.core.reference.composition.lifecycle',
    'vue.core.reference.application.create-app',
  ],
  tags: ['directive', 'DirectiveBinding', 'withDirectives', 'DOM', 'SSR'],
  sources: [
    {
      title: 'Vue 自定义指令指南',
      url: 'https://cn.vuejs.org/guide/reusability/custom-directives.html',
    },
    {
      title: 'Vue SSR 自定义指令',
      url: 'https://cn.vuejs.org/guide/scaling-up/ssr.html#custom-directives',
    },
    {
      title: 'Vue 3.5.40 directives.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts',
    },
    {
      title: 'Vue 3.5.40 指令官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/directives.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-29',
  anchors: ['概述', '生命周期与 binding', '注册与函数简写', '易错使用提示', '最小源码实现'],
})

export default defineReference({
  meta,
  signature: `interface ObjectDirective<HostElement = any, Value = any> {
  created?: DirectiveHook<HostElement, null, Value>
  beforeMount?: DirectiveHook<HostElement, null, Value>
  mounted?: DirectiveHook<HostElement, null, Value>
  beforeUpdate?: DirectiveHook<HostElement, VNode<any, HostElement>, Value>
  updated?: DirectiveHook<HostElement, VNode<any, HostElement>, Value>
  beforeUnmount?: DirectiveHook<HostElement, null, Value>
  unmounted?: DirectiveHook<HostElement, null, Value>
  getSSRProps?: SSRDirectiveHook<Value>
  deep?: boolean
}`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '自定义指令用于复用必须直接操作真实元素的行为，例如聚焦、元素观察或对接 DOM 插件。能用 props、class、style 或组件表达的功能应继续使用声明式方案。`<script setup>` 中以 `v` 开头的驼峰变量可直接作为局部指令，也可通过 `app.directive()` 全局注册。',
    },
    {
      type: 'demo',
      id: 'vue.core.reference.advanced.custom-directives.custom-directive-demo',
      description: '观察 mounted 与 updated，并只在绑定颜色真正变化时更新元素',
      playground: true,
    },
    { type: 'heading', content: '生命周期与 binding' },
    {
      type: 'text',
      content:
        '对象指令提供与宿主元素 patch 流程对应的七个客户端钩子。`binding.value` 是当前值，`oldValue` 在更新钩子中保存上一次值，`arg` 和 `modifiers` 分别表示参数与修饰符。除 `el` 外应把传入参数视为只读；跨钩子的第三方实例或清理句柄应以元素为键保存在 `WeakMap` 中。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const observers = new WeakMap<Element, IntersectionObserver>()

const vObserve = {
  /** 元素挂载后开始观察。 */
  mounted(element: Element) {
    const observer = new IntersectionObserver(() => {})
    observers.set(element, observer)
    observer.observe(element)
  },
  /** 元素卸载时释放观察器。 */
  unmounted(element: Element) {
    observers.get(element)?.disconnect()
    observers.delete(element)
  },
}`,
    },
    { type: 'heading', content: '注册与函数简写' },
    {
      type: 'text',
      content:
        '函数形式只会被归一化为 `mounted` 和 `updated`，适合无资源清理且两个阶段逻辑相同的简单行为。需要 `unmounted`、`getSSRProps()` 或其他钩子时必须使用对象形式。SSR 不执行浏览器端 DOM 钩子；需要输出 attribute 时由 `getSSRProps()` 返回服务端 props。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const vId = {
  /** 客户端挂载时写入真实元素。 */
  mounted(element: HTMLElement, binding: DirectiveBinding<string>) {
    element.id = binding.value
  },
  /** 服务端把同一语义输出为 attribute。 */
  getSSRProps(binding: DirectiveBinding<string>) {
    return { id: binding.value }
  },
}`,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '假定 updated 只在绑定值变化时调用',
          description: 'updated 跟随宿主元素更新流程执行，不是绑定值专用 watcher。',
          consequence: '无关状态更新也可能反复重建图表、插件或其他昂贵 DOM 资源。',
          wrong: {
            lang: 'ts',
            content: `const vChart = {
  /** 每次宿主更新都重建图表。 */
  updated(element: HTMLElement, binding: DirectiveBinding<ChartOptions>) {
    createChart(element, binding.value)
  },
}`,
          },
          correct: {
            lang: 'ts',
            content: `const vChart = {
  /** 仅在绑定引用变化时更新图表。 */
  updated(element: HTMLElement, binding: DirectiveBinding<ChartOptions>) {
    if (binding.value !== binding.oldValue) updateChart(element, binding.value)
  },
}`,
          },
        },
        {
          title: '修改 binding 或用它保存跨钩子状态',
          description: '每次渲染都会重新组装 binding，它不是稳定的生命周期存储。',
          consequence: '后续钩子读不到资源句柄，listener、observer 或第三方实例无法释放。',
          wrong: {
            lang: 'ts',
            content: `const vObserve = {
  /** 把资源临时挂在 binding 上。 */
  mounted(element: Element, binding: DirectiveBinding & { observer?: IntersectionObserver }) {
    binding.observer = new IntersectionObserver(() => {})
    binding.observer.observe(element)
  },
}`,
          },
          correct: {
            lang: 'ts',
            content: `const observers = new WeakMap<Element, IntersectionObserver>()

const vObserve = {
  /** 使用元素作为稳定资源键。 */
  mounted(element: Element) {
    const observer = new IntersectionObserver(() => {})
    observers.set(element, observer)
    observer.observe(element)
  },
}`,
          },
        },
        {
          title: '需要卸载清理却使用函数简写',
          description: '函数指令只对应 mounted 和 updated，不会在 unmounted 时再次调用。',
          consequence: '全局 listener、observer 或插件实例在元素移除后仍然存活。',
          wrong: {
            lang: 'ts',
            content: `app.directive('escape', (element) => {
  window.addEventListener('keydown', () => element.remove())
})`,
          },
          correct: {
            lang: 'ts',
            content: `const handlers = new WeakMap<Element, EventListener>()

app.directive('escape', {
  /** 注册可被移除的同一函数引用。 */
  mounted(element) {
    const handler = () => element.remove()
    handlers.set(element, handler)
    window.addEventListener('keydown', handler)
  },
  /** 元素卸载时移除全局监听。 */
  unmounted(element) {
    const handler = handlers.get(element)
    if (handler) window.removeEventListener('keydown', handler)
  },
})`,
          },
        },
        {
          title: '把组件上的指令当成稳定组件 API',
          description: '组件指令会继承到根元素；多根、文本或 Teleport 根没有稳定目标。',
          consequence: '指令可能被忽略并警告，或在子组件重构根节点后作用到错误元素。',
          wrong: {
            lang: 'vue',
            content: '<CardPanel v-focus />',
          },
          correct: {
            lang: 'vue',
            content: '<CardPanel autofocus />',
          },
        },
        {
          title: '期待客户端钩子修改 SSR HTML',
          description: '服务端字符串渲染不会执行 mounted 等浏览器端 DOM 钩子。',
          consequence: '首屏 HTML 缺少所需 attribute，并可能与客户端接管后的输出不一致。',
          wrong: {
            lang: 'ts',
            content: `const vId = {
  /** 只在客户端写入 id。 */
  mounted(element: HTMLElement, binding: DirectiveBinding<string>) {
    element.id = binding.value
  },
}`,
          },
          correct: {
            lang: 'ts',
            content: `const vId = {
  /** 为服务端输出同一 id。 */
  getSSRProps(binding: DirectiveBinding<string>) {
    return { id: binding.value }
  },
}`,
          },
        },
      ],
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        '`withDirectives()` 在渲染期间把归一化后的 binding 挂到 vnode；`deep` 指令会遍历当前值以收集嵌套依赖，不负责保存 oldValue。渲染器调用 `invokeDirectiveHook()` 时，才从前一个 vnode 的对应 binding 复制 oldValue，并在暂停依赖追踪和错误处理边界内执行 hook。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `/** 把指令参数附加到当前 vnode。 */
export function withDirectives(vnode: VNode, directives: DirectiveArguments): VNode {
  const bindings = (vnode.dirs ||= [])
  for (const [rawDirective, value, arg, modifiers = {}] of directives) {
    const directive = isFunction(rawDirective)
      ? { mounted: rawDirective, updated: rawDirective }
      : rawDirective
    if (directive.deep) traverse(value)
    bindings.push({ dir: directive, instance: currentRenderingInstance, value, oldValue: undefined, arg, modifiers })
  }
  return vnode
}

/** 在宿主 patch 节点执行对应指令钩子。 */
export function invokeDirectiveHook(vnode: VNode, previous: VNode | null, name: DirectiveHookName) {
  pauseTracking()
  for (let index = 0; index < vnode.dirs!.length; index += 1) {
    const binding = vnode.dirs![index]
    if (previous?.dirs) binding.oldValue = previous.dirs[index].value
    const hook = binding.dir[name]
    if (hook) callWithAsyncErrorHandling(hook, binding.instance, ErrorCodes.DIRECTIVE_HOOK, [vnode.el, binding, vnode, previous])
  }
  resetTracking()
}`,
    },
  ],
})
