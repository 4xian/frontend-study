/**
 * 知识点：provide() / inject()
 * 查证来源（2026-08-02）：
 * - https://cn.vuejs.org/api/composition-api-dependency-injection.html（签名、InjectionKey、默认值工厂）
 * - https://cn.vuejs.org/api/composition-api-dependency-injection.html#has-injection-context（注入上下文检测）
 * - https://cn.vuejs.org/guide/components/provide-inject.html（响应式约定与 Symbol key）
 * - https://cn.vuejs.org/api/application.html（app.provide 与 app.runWithContext）
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiInject.ts
 * 查证工具：Tavily、Vue 官方中文文档、GitHub vuejs/core v3.5.40 源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.composition.provide-inject',
  type: 'reference',
  title: 'provide() / inject()',
  summary: '由祖先组件或应用提供依赖，让任意深度的后代组件按 key 注入并保持响应式连接',
  ecosystem: 'vue',
  module: 'core',
  collection: 'composition',
  related: [
    'vue.core.reference.reactivity.ref',
    'vue.core.reference.reactivity.readonly',
    'vue.core.reference.components.props',
    'vue.core.reference.application.create-app',
  ],
  tags: [
    'provide',
    'inject',
    'hasInjectionContext',
    '依赖注入',
    'InjectionKey',
    'app.provide',
    'app.runWithContext',
  ],
  sources: [
    {
      title: 'Vue 组合式 API：依赖注入',
      url: 'https://cn.vuejs.org/api/composition-api-dependency-injection.html',
    },
    {
      title: 'Vue hasInjectionContext()',
      url: 'https://cn.vuejs.org/api/composition-api-dependency-injection.html#has-injection-context',
    },
    {
      title: 'Vue 依赖注入指南',
      url: 'https://cn.vuejs.org/guide/components/provide-inject.html',
    },
    {
      title: 'Vue 应用实例 API',
      url: 'https://cn.vuejs.org/api/application.html',
    },
    {
      title: 'Vue 3.5.40 apiInject.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiInject.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-02',
  anchors: [
    '概述',
    '签名与基础用法',
    '响应式状态的所有权',
    '易错使用提示',
    'Symbol key 与类型标注',
    '查找范围与应用上下文',
    'hasInjectionContext()',
    '最小源码实现',
  ],
})

export default defineReference({
  meta,
  signature: `function provide<T>(key: InjectionKey<T> | string, value: T): void
function inject<T>(key: InjectionKey<T> | string): T | undefined
function hasInjectionContext(): boolean`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '深层子组件若只靠 props 获取祖先数据，中间组件即使不使用该数据也要逐级声明和转发，这就是 prop 逐级透传。`provide()` / `inject()` 让祖先直接成为依赖提供者，任意深度的后代都能按 key 注入值，中间组件无需参与。',
    },
    { type: 'heading', content: '签名与基础用法' },
    {
      type: 'code',
      lang: 'ts',
      content: `function provide<T>(key: InjectionKey<T> | string, value: T): void

function inject<T>(key: InjectionKey<T> | string): T | undefined
function inject<T>(key: InjectionKey<T> | string, defaultValue: T): T
function inject<T>(
  key: InjectionKey<T> | string,
  defaultValue: () => T,
  treatDefaultAsFactory: true
): T`,
    },
    {
      type: 'text',
      content:
        '组件内的 provide 和 inject 都应在 setup 同步执行期间调用。provide 可提供多个 key；inject 找不到 key 且没有默认值时返回 undefined，并在开发环境警告。应用还可通过 `app.provide()` 向整棵组件树提供值。默认值创建开销较大时，可把工厂函数作为第二个参数并将第三个参数设为 true，工厂只在缺少匹配依赖时运行。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 祖先组件
import { inject, provide, ref } from 'vue'
import type { Ref } from 'vue'

const location = ref('North Pole')
provide('location', location)

// 任意深度的后代组件：字符串 key 需要显式给出类型
const injectedLocation = inject<Ref<string>>('location')
const theme = inject('theme', 'light')`,
    },
    {
      type: 'demo',
      id: 'vue.core.reference.composition.provide-inject.provide-inject-demo',
      description: '状态跨过中间层直达叶子组件，并由提供方保留修改权',
      playground: true,
    },
    { type: 'heading', content: '响应式状态的所有权' },
    {
      type: 'text',
      content:
        '提供 ref 或 reactive 对象时，注入方收到的是同一个响应式连接。官方建议把修改逻辑留在提供方：后代需要改状态时，一并注入一个动作函数；还可用 `readonly()` 包装状态，使注入方无法直接写入，但提供方仍可通过原始 ref 更新它。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { provide, readonly, ref } from 'vue'

const count = ref(0)

provide('count', readonly(count))
provide('increment', () => count.value++)`,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '使用字符串 key 后直接断定类型和存在性',
          description:
            '字符串 key 不能把提供方的 TypeScript 类型同步到注入方；没有祖先或应用提供匹配 key 且没有默认值时，`inject()` 返回 undefined。',
          consequence:
            '对 undefined 访问 `.value` 直接抛错；同名字符串碰撞时还可能注入错误类型的值。',
          wrong: {
            lang: 'ts',
            content: "const count = inject('count')\ncount.value++",
          },
          correct: {
            lang: 'ts',
            content:
              "export const countKey: InjectionKey<Readonly<Ref<number>>> = Symbol('count')\n\nconst count = inject(countKey)\nif (!count) throw new Error('缺少 count 提供者')\nconsole.log(count.value)",
          },
        },
        {
          title: '让注入方直接修改共享响应式状态',
          description:
            'ref 注入后保持原样且仍可写，容易把技术上的可写能力当成合理所有权。官方建议尽可能把响应式状态的修改留在提供方。',
          consequence: '任意深度后代都能绕开业务规则改状态，修改入口分散，难以定位谁改变了共享值。',
          wrong: {
            lang: 'ts',
            content: '// 提供方\nprovide(countKey, count)\n\n// 注入方\ninject(countKey)!.value++',
          },
          correct: {
            lang: 'ts',
            content:
              'provide(counterKey, {\n  count: readonly(count),\n  increment: () => count.value++,\n})\n\nconst counter = inject(counterKey)\ncounter?.increment()',
          },
        },
        {
          title: '在任意模块或异步回调中直接调用 `inject()`',
          description:
            '误以为 inject 是全局容器查找。组件内的 provide / inject 要在 setup 同步阶段调用；Vue 3.3+ 的 `app.runWithContext()` 也只在回调同步执行期间提供应用注入上下文。',
          consequence:
            '没有当前组件或应用上下文时得到 undefined 并出现警告；await 后再次 inject 也失去 runWithContext 上下文。',
          wrong: {
            lang: 'ts',
            content: 'export const service = inject(serviceKey)',
          },
          correct: {
            lang: 'ts',
            content: 'const service = app.runWithContext(() => inject(serviceKey))',
          },
        },
        {
          title: '提供普通值后期待注入结果自动响应',
          description:
            '`provide()` 只保存传入的值，不会把普通变量自动转换成响应式状态。只有提供 ref、computed 或 reactive 对象时，注入方才能跟随变化。',
          consequence: '提供方的局部变量已改变，后代组件仍显示初始值，也不会触发重新渲染。',
          wrong: {
            lang: 'ts',
            content: "let message = 'ready'\nprovide('message', message)\nmessage = 'done'",
          },
          correct: {
            lang: 'ts',
            content:
              "const message = ref('ready')\nprovide('message', readonly(message))\nmessage.value = 'done'",
          },
        },
        {
          title: '在同一组件中 `provide()` 后立即 `inject()` 自己的值',
          description:
            '`inject()` 从当前组件的父链开始查找最近提供者，当前实例自己新写入的 provides 只对后代可见。',
          consequence: '当前组件拿到的是祖先值或 undefined，而不是刚刚提供的值，容易误判作用域。',
          wrong: {
            lang: 'ts',
            content:
              "provide('theme', 'dark')\nconst ownTheme = inject('theme') // 不会读到自己的 dark",
          },
          correct: {
            lang: 'ts',
            content:
              "const theme = ref('dark')\nprovide('theme', readonly(theme))\n\n// 当前组件直接使用 theme\n// 后代组件再调用 inject('theme')",
          },
        },
        {
          title: '把 `hasInjectionContext()` 的 true 当成目标 key 已存在',
          description:
            '该 API 只判断当前是否存在可无警告调用 inject 的组件、渲染或应用上下文，不会查找某个 key。',
          consequence:
            '上下文存在但没有提供目标 key 时，inject 仍返回 undefined，后续直接使用会报错。',
          wrong: {
            lang: 'ts',
            content: 'if (hasInjectionContext()) {\n  inject(serviceKey)!.start()\n}',
          },
          correct: {
            lang: 'ts',
            content:
              'const service = hasInjectionContext() ? inject(serviceKey) : undefined\nservice?.start()',
          },
        },
        {
          title: '调用 `inject()` 之后才检查注入上下文',
          description:
            '`hasInjectionContext()` 的主要用途是让库或组合式函数在内部调用 inject 前判断位置是否合法。事后检查无法撤销已经发生的警告。',
          consequence:
            '库在 setup 外使用时仍向最终用户输出 Vue 警告，失去无警告选择 fallback 的意义。',
          wrong: {
            lang: 'ts',
            content:
              'const service = inject(serviceKey)\nif (!hasInjectionContext()) useFallbackService()',
          },
          correct: {
            lang: 'ts',
            content:
              'const service = hasInjectionContext() ? inject(serviceKey) : undefined\nif (!service) useFallbackService()',
          },
        },
        {
          title: '把 `runWithContext` 的检测结果缓存到异步续体',
          description:
            '`app.runWithContext()` 只在回调同步执行期间设置 currentApp。回调跨过 await 后，该应用上下文不再存在，之前检测到的 true 已经过期。',
          consequence: '异步恢复后再调用 inject 仍会返回 undefined 并产生警告。',
          wrong: {
            lang: 'ts',
            content:
              'app.runWithContext(async () => {\n  const canInject = hasInjectionContext()\n  await loadSettings()\n  const service = canInject ? inject(serviceKey) : undefined\n})',
          },
          correct: {
            lang: 'ts',
            content:
              'const service = app.runWithContext(() =>\n  hasInjectionContext() ? inject(serviceKey) : undefined,\n)\nawait loadSettings()\nservice?.start()',
          },
        },
      ],
    },
    { type: 'heading', content: 'Symbol key 与类型标注' },
    {
      type: 'text',
      content:
        '大型应用应集中导出 Symbol key，避免字符串撞名。`InjectionKey<T>` 是带泛型的 symbol 类型：provide 会校验值，inject 会推导 `T | undefined`。若业务保证值一定存在，也应在边界处显式检查并给出清晰错误，而不是在所有消费点散落非空断言。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// keys.ts
import type { InjectionKey, Ref } from 'vue'

export const countKey: InjectionKey<Readonly<Ref<number>>> = Symbol('count')

// 提供方
provide(countKey, readonly(ref(0)))

// 注入方：Readonly<Ref<number>> | undefined
const count = inject(countKey)`,
    },
    { type: 'heading', content: '查找范围与应用上下文' },
    {
      type: 'text',
      content:
        'inject 从当前组件的父链开始查找最近的提供者，近层同名 key 会遮蔽远层值。因此组件无论先调用 provide 还是 inject，都不能注入自己同一实例提供的值；只有后代能看到它。根组件可继续回退到 `app.provide()` 的应用级值。',
    },
    {
      type: 'text',
      content:
        'Vue 3.3+ 提供 `app.runWithContext()` 作为 setup 外的受控例外：回调同步执行期间，即使没有活动组件实例，inject 也能读取该应用通过 app.provide 提供的值。直接在任意模块作用域调用 inject 仍然无效；runWithContext 也不会建立跨异步 await 的长期上下文。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `app.provide('id', 1)

const id = app.runWithContext(() => inject('id'))
console.log(id) // 1`,
    },
    { type: 'heading', content: 'hasInjectionContext()' },
    {
      type: 'code',
      lang: 'ts',
      content: `// 判断当前能否无警告地调用 inject()
function hasInjectionContext(): boolean`,
    },
    {
      type: 'text',
      content:
        '`hasInjectionContext()` 自 Vue 3.3 起可用，主要面向需要在内部选择性调用 `inject()` 的库和组合式函数。它在当前组件实例、当前渲染实例或 `app.runWithContext()` 提供的应用上下文存在时返回 true；返回 true 只代表调用位置有效，不代表目标 key 一定存在。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { hasInjectionContext, inject } from 'vue'

const service = hasInjectionContext() ? inject(serviceKey) : undefined
const resolvedService = service ?? fallbackService`,
    },
    {
      type: 'text',
      content:
        '应在调用 `inject()` 之前即时检查上下文。`app.runWithContext()` 只在回调同步执行期间提供应用上下文，可以同步取得依赖后再使用该值，但不能依赖它在 await 后重新调用 inject。此限制专指 runWithContext；`<script setup>` 顶层 await 会由编译器恢复当前组件实例。',
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        '组件实例初始共享父级的 provides 对象；首次调用 provide 时，才以父级 provides 为原型创建自己的对象。这种写时复制让一次属性访问自然完成“向上找最近提供者”。inject 还会识别函数式组件的渲染实例和 app.runWithContext 的 currentApp；默认值工厂以组件公开实例作为 this 调用。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 packages/runtime-core/src/apiInject.ts
export function provide(key: string | symbol, value: unknown) {
  if (!currentInstance) return

  let provides = currentInstance.provides
  const parentProvides = currentInstance.parent?.provides
  if (parentProvides === provides) {
    provides = currentInstance.provides = Object.create(parentProvides)
  }
  provides[key as string] = value
}

export function inject(
  key: string | symbol,
  defaultValue?: unknown,
  treatDefaultAsFactory = false,
) {
  const instance = currentInstance || currentRenderingInstance
  if (!instance && !currentApp) return

  const provides = currentApp
    ? currentApp._context.provides
    : instance?.parent
      ? instance.parent.provides
      : instance?.vnode.appContext.provides

  if (provides && (key as string) in provides) return provides[key as string]
  if (arguments.length > 1) {
    return treatDefaultAsFactory && typeof defaultValue === 'function'
      ? defaultValue.call(instance?.proxy)
      : defaultValue
  }
}`,
    },
    {
      type: 'text',
      content:
        '`hasInjectionContext()` 的源码先通过 `getCurrentInstance()` 合并 currentInstance 与 currentRenderingInstance，再检查 currentApp。它只判断三类上下文是否存在，不接收也不查找注入 key。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 等价展开 vuejs/core v3.5.40 apiInject.ts 中的上下文判断
// 判断当前是否存在组件、渲染或应用注入上下文
export function hasInjectionContext(): boolean {
  return !!(currentInstance || currentRenderingInstance || currentApp)
}`,
    },
  ],
})
