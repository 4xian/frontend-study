/**
 * 知识点：渲染函数与 h()
 * 查证来源（2026-07-29）：
 * - https://cn.vuejs.org/api/render-function.html
 * - https://cn.vuejs.org/guide/extras/render-function.html
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/h.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts
 * 查证工具：Tavily（套餐用量上限，已回退）、Vue 官方文档、源码与官方测试
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.advanced.render-function',
  type: 'reference',
  title: '渲染函数与 h()',
  summary: '用 JavaScript 创建唯一 VNode，并正确表达组件、插槽、事件与动态渲染逻辑',
  ecosystem: 'vue',
  module: 'core',
  collection: 'advanced',
  related: [
    'vue.core.reference.application.define-component',
    'vue.core.reference.components.slots',
    'vue.core.reference.components.emits',
  ],
  tags: [
    'h',
    'VNode',
    'render function',
    'mergeProps',
    'cloneVNode',
    'resolveComponent',
    'resolveDirective',
    'withDirectives',
    'withModifiers',
  ],
  sources: [
    {
      title: 'Vue 渲染函数 API',
      url: 'https://cn.vuejs.org/api/render-function.html',
    },
    {
      title: 'Vue 渲染函数与 JSX 指南',
      url: 'https://cn.vuejs.org/guide/extras/render-function.html',
    },
    {
      title: 'Vue 3.5.40 h.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/h.ts',
    },
    {
      title: 'Vue 3.5.40 vnode.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts',
    },
    {
      title: 'Vue 3.5.40 指令资源解析',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/resolveAssets.ts',
    },
    {
      title: 'Vue 3.5.40 VNode 指令绑定',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/directives.ts',
    },
    {
      title: 'Vue 3.5.40 VNode 官方测试',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/vnode.spec.ts',
    },
    {
      title: 'Vue 3.5.40 指令官方测试',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/directives.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-03',
  anchors: [
    '概述',
    '元素与组件',
    '插槽与事件',
    'mergeProps()',
    'cloneVNode()',
    'isVNode()',
    'resolveDirective()',
    'withDirectives()',
    '易错使用提示',
    '最小源码实现',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `function h(
  type: string | Component,
  props?: object | null,
  children?: Children | Slot | Slots
): VNode`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '模板最终会编译成渲染函数；`h()` 允许直接用 JavaScript 创建 VNode。它适合需要完整编程能力、动态选择节点类型或封装底层渲染库的场景，但不是模板的性能捷径。模板通常更清晰，并能获得编译器的静态提升和 patch flag 优化。',
    },
    {
      type: 'demo',
      id: 'vue.core.reference.advanced.render-function.render-function-demo',
      description: '用递归 h() 根据可变数据生成树，同时保持每次渲染的 VNode 唯一',
      playground: true,
    },
    { type: 'heading', content: '元素与组件' },
    {
      type: 'text',
      content:
        '`h()` 的字符串 type 始终表示原生元素。渲染组件时应传入导入的组件定义；只有必须按注册名查找时才在 setup 或 render 上下文中调用 `resolveComponent()`。`setup()` 必须返回渲染函数，而不是一次性创建的 VNode。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { h, ref } from 'vue'
import ButtonCounter from './ButtonCounter.vue'

export default {
  /** 建立响应式状态并返回组件渲染函数。 */
  setup() {
    const count = ref(0)
    return () => h(ButtonCounter, { count: count.value })
  },
}`,
    },
    { type: 'heading', content: '插槽与事件' },
    {
      type: 'text',
      content:
        '组件具名插槽需要用 `null` 占住 props 参数，并把每个 slot 写成函数，保持惰性求值。事件使用 `onXxx` props；`once`、`capture`、`passive` 可拼在事件名后，`stop`、`prevent`、`self` 和按键修饰符则使用 `withModifiers()` 或 `withKeys()` 包装处理函数。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `h(CardPanel, null, {
  default: () => h('p', '正文'),
  footer: () => h('button', { onClick: close }, '关闭'),
})

h('form', { onSubmit: withModifiers(submit, ['prevent']) }, children)`,
    },
    { type: 'heading', content: 'mergeProps()' },
    {
      type: 'text',
      content:
        '`mergeProps(...args)` 专门归一化并合并 `class`、`style` 与 `onXxx` 监听器；多个同名监听器保留为数组，其余 props 由后值覆盖前值。不需要这些合并语义时，对象展开更直观。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const props = mergeProps(
  { class: 'panel', onClick: track },
  { class: { active: true }, onClick: open },
)

return h('button', props, '打开')`,
    },
    { type: 'heading', content: 'cloneVNode()' },
    {
      type: 'text',
      content:
        'VNode 创建后应视为不可变渲染描述，不能直接修改 `vnode.props`。`cloneVNode(vnode, extraProps)` 会复制 key、ref、scope、patch 等内部字段，并按 VNode 规则合并额外 props；object spread 无法替代这些内部处理。',
    },
    { type: 'heading', content: 'isVNode()' },
    {
      type: 'text',
      content:
        '`isVNode(value)` 判断未知值是否带 Vue VNode 标记，适合渲染工具的输入分支。它只证明值是 VNode，不证明 type 符合业务约束、仍未使用、来源可信或可跨应用复用。',
    },
    { type: 'heading', content: 'resolveDirective()' },
    {
      type: 'text',
      content:
        '`resolveDirective(name)` 从当前组件的局部和应用级注册表按名称解析指令，只能在 `setup()` 或 render 期间调用。解析失败返回 `undefined` 并在开发环境警告；能直接 import 时优先显式导入。',
    },
    { type: 'heading', content: 'withDirectives()' },
    {
      type: 'text',
      content:
        '`withDirectives(vnode, tuples)` 为 VNode 附加指令绑定，元组顺序是 `[directive, value, argument, modifiers]`，后三项可按需省略。它依赖当前渲染实例，必须留在 render 路径；函数指令会归一化为 `mounted` 与 `updated`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `return () => {
  const node = h('input')
  const focus = resolveDirective('focus')
  return focus
    ? withDirectives(node, [[focus, enabled, undefined, { lazy: true }]])
    : node
}`,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '从 setup 直接返回 VNode',
          description: 'Vue 只有在 setup 返回函数时才会把它安装为组件 render。',
          consequence:
            'VNode 被当成 setup state，组件缺少可用 render，状态变化也不会重新执行 h()。',
          wrong: {
            lang: 'ts',
            content: `export default {
  /** 错误地返回一次性 VNode。 */
  setup() {
    const count = ref(0)
    return h('button', String(count.value))
  },
}`,
          },
          correct: {
            lang: 'ts',
            content: `export default {
  /** 返回随组件更新重复执行的渲染函数。 */
  setup() {
    const count = ref(0)
    return () => h('button', String(count.value))
  },
}`,
          },
        },
        {
          title: '用组件名字符串调用 h()',
          description: '字符串 type 会被标记为原生元素，不会自动解析已注册组件。',
          consequence: '页面创建未知 DOM 元素，目标组件的 props、emits 和生命周期均不执行。',
          wrong: {
            lang: 'ts',
            content: "return () => h('ButtonCounter', { count: 1 })",
          },
          correct: {
            lang: 'ts',
            content: `import ButtonCounter from './ButtonCounter.vue'

return () => h(ButtonCounter, { count: 1 })`,
          },
        },
        {
          title: '把插槽对象放在第二参数或传现成 VNode',
          description: '两参数中的普通对象会被当成 props；组件 slot 值还必须是函数。',
          consequence: '子组件收不到插槽，非函数 slot 还会触发性能警告并失去惰性求值。',
          wrong: {
            lang: 'ts',
            content: `h(CardPanel, {
  default: h('p', '正文'),
})`,
          },
          correct: {
            lang: 'ts',
            content: `h(CardPanel, null, {
  default: () => h('p', '正文'),
})`,
          },
        },
        {
          title: '在同一组件树中复用同一个 VNode 对象',
          description: 'VNode 是带 patch 状态的一次渲染输出，不是可复用的组件定义。',
          consequence: '违反 VNode 唯一性约束，并依赖 Vue 在部分路径中的隐式克隆保护。',
          wrong: {
            lang: 'ts',
            content: `const paragraph = h('p', '相同文本')
return () => h('div', [paragraph, paragraph])`,
          },
          correct: {
            lang: 'ts',
            content: `/** 创建一枚新的段落 VNode。 */
const createParagraph = () => h('p', '相同文本')
return () => h('div', [createParagraph(), createParagraph()])`,
          },
        },
        {
          title: '把模板行为修饰符直接拼到事件名',
          description:
            '只有 once、capture、passive 属于可拼接的事件选项；prevent 等行为需要 helper。',
          consequence: '错误事件名不会触发处理函数，表单还可能继续执行浏览器原生提交。',
          wrong: {
            lang: 'ts',
            content: "h('form', { onSubmitPrevent: submit }, children)",
          },
          correct: {
            lang: 'ts',
            content: `h('form', { onSubmit: withModifiers(submit, ['prevent']) }, children)
h('button', { onClickOnceCapture: submit }, '提交一次')`,
          },
        },
        {
          title: '用对象展开后期待 class、style 与监听器仍能合并',
          description: '对象展开会先覆盖同名字段，之后再调用 mergeProps 也无法恢复丢失的值。',
          consequence: '前一个事件处理器消失，class 或 style 的多种输入形态没有被归一化。',
          wrong: {
            lang: 'ts',
            content: 'const props = mergeProps({ ...base, ...incoming })',
          },
          correct: {
            lang: 'ts',
            content: 'const props = mergeProps(base, incoming)',
          },
        },
        {
          title: '直接修改或用 object spread 复制既有 VNode',
          description: 'VNode 含 key、ref、scope、patch flag 等内部状态，不是普通可变对象。',
          consequence: '渲染依赖不完整副本，ref、scope 与 patch 行为不可预测。',
          wrong: {
            lang: 'ts',
            content: `vnode.props!.id = 'next'
const copy = { ...vnode }`,
          },
          correct: {
            lang: 'ts',
            content: "const copy = cloneVNode(vnode, { id: 'next' })",
          },
        },
        {
          title: '把 isVNode() 当成完整业务验证',
          description: '它只检查 Vue 的 VNode 标记，不验证 type、来源或复用状态。',
          consequence: '不允许的节点类型或已复用 VNode 仍进入业务渲染流程。',
          wrong: {
            lang: 'ts',
            content: 'if (isVNode(input)) return input',
          },
          correct: {
            lang: 'ts',
            content: "if (isVNode(input) && input.type === 'span') return input",
          },
        },
        {
          title: '在 render 上下文外解析或附加指令',
          description: '资源解析和 binding instance 都依赖 current rendering instance。',
          consequence: '解析得到 undefined，withDirectives 警告并原样返回 VNode，钩子不执行。',
          wrong: {
            lang: 'ts',
            content: `const focus = resolveDirective('focus')
export const field = withDirectives(h('input'), [[focus]])`,
          },
          correct: {
            lang: 'ts',
            content: `return () => {
  const node = h('input')
  const focus = resolveDirective('focus')
  return focus ? withDirectives(node, [[focus]]) : node
}`,
          },
        },
        {
          title: '写错指令元组位置或忽略解析失败',
          description: '第三项是 argument，第四项才是 modifiers；解析结果还可能为 undefined。',
          consequence: '修饰符被当作参数，或未注册指令静默缺少行为。',
          wrong: {
            lang: 'ts',
            content: 'withDirectives(node, [[dir, value, { lazy: true }]])',
          },
          correct: {
            lang: 'ts',
            content: `const dir = resolveDirective('focus')
return dir
  ? withDirectives(node, [[dir, value, undefined, { lazy: true }]])
  : node`,
          },
        },
      ],
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        '`h()` 是 `createVNode()` 的参数归一化外壳：两参数调用时区分 props 与 children，单个 VNode child 会包装成数组。`createVNode()` 再按字符串元素、对象组件、函数组件、Teleport 或 Suspense 等合法 type 设置 shape flag；函数组件与状态组件共同进入组件 patch 分支。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `/** 归一化 h() 的常见重载。 */
export function h(type: any, propsOrChildren?: any, children?: any): VNode {
  if (arguments.length === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      return isVNode(propsOrChildren)
        ? createVNode(type, null, [propsOrChildren])
        : createVNode(type, propsOrChildren)
    }
    return createVNode(type, null, propsOrChildren)
  }
  if (arguments.length === 3 && isVNode(children)) children = [children]
  return createVNode(type, propsOrChildren, children)
}

/** 按 type 的真实种类选择基础 shape flag。 */
function resolveTypeFlag(type: any): number {
  if (isString(type)) return ShapeFlags.ELEMENT
  if (isSuspense(type)) return ShapeFlags.SUSPENSE
  if (isTeleport(type)) return ShapeFlags.TELEPORT
  if (isObject(type)) return ShapeFlags.STATEFUL_COMPONENT
  if (isFunction(type)) return ShapeFlags.FUNCTIONAL_COMPONENT
  return 0
}`,
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. mergeProps 只对三类字段做专门归一化',
          content:
            '`vnode.ts` 对 class、style 和事件监听器分别调用归一化或数组合并，其余 key 使用后值。多来源 VNode props 需要保留监听器时使用；简单覆盖仍用对象展开。',
        },
        {
          title: '2. cloneVNode 保留 VNode 内部渲染元数据',
          content:
            '`cloneVNode()` 复制 key、ref、scopeId、slotScopeIds、patchFlag、transition 等字段并处理 extraProps。包装既有节点时应克隆，而不是直接修改或 spread。',
        },
        {
          title: '3. isVNode 是内部标记检测',
          content:
            '`isVNode()` 读取 VNode 标记并返回 boolean。它适合未知 children 的快速分流，不应被提升为业务类型或安全边界。',
        },
        {
          title: '4. resolveDirective 依赖当前组件注册表',
          content:
            '`resolveAssets.ts` 从 current rendering instance 的局部与应用资源中解析名称。可直接 import 时使用显式依赖；插件式或配置驱动注册才需要字符串解析。',
        },
        {
          title: '5. withDirectives 在无渲染实例时只警告并返回原节点',
          content:
            '`directives.ts` 明确检查 current rendering instance，并把绑定写入 vnode.dirs。模块顶层调用不会建立有效组件指令上下文。',
        },
        {
          title: '6. 函数指令和 deep 指令有额外运行时代价',
          content:
            '函数指令会扩展为 mounted / updated；带 `deep` 的对象指令会遍历 value。简写适合同一行为的两个钩子，大对象深遍历需要谨慎评估。',
        },
      ],
    },
  ],
})
