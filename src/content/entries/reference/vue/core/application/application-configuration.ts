/**
 * 知识点：应用扩展与配置
 * 查证来源（2026-08-02）：
 * - https://cn.vuejs.org/api/application.html
 * - https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiCreateApp.ts
 * - https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/errorHandling.ts
 * - https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/profiling.ts
 * - https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts
 * 查证工具：Vue 中文官网、vuejs/core v3.5.40 源码、类型声明与官方测试
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.application.application-configuration',
  type: 'reference',
  title: '应用扩展与配置',
  summary:
    '查询应用级 mixin、同步注入上下文，以及开发诊断、运行时编译、选项合并、ID 前缀和生产错误传播配置',
  ecosystem: 'vue',
  module: 'core',
  collection: 'application',
  related: [
    'vue.core.reference.application.create-app',
    'vue.core.reference.composition.provide-inject',
    'vue.core.reference.composition.use-id',
  ],
  tags: ['AppConfig', 'mixin', 'runWithContext', 'compilerOptions', 'idPrefix', '错误处理'],
  sources: [
    {
      title: 'Vue 应用实例 API：app.mixin',
      url: 'https://cn.vuejs.org/api/application.html#app-mixin',
    },
    {
      title: 'Vue 应用实例 API：app.runWithContext',
      url: 'https://cn.vuejs.org/api/application.html#app-runwithcontext',
    },
    {
      title: 'Vue 应用配置：warnHandler',
      url: 'https://cn.vuejs.org/api/application.html#app-config-warnhandler',
    },
    {
      title: 'Vue 应用配置：performance',
      url: 'https://cn.vuejs.org/api/application.html#app-config-performance',
    },
    {
      title: 'Vue 应用配置：compilerOptions',
      url: 'https://cn.vuejs.org/api/application.html#app-config-compileroptions',
    },
    {
      title: 'Vue 应用配置：optionMergeStrategies',
      url: 'https://cn.vuejs.org/api/application.html#app-config-optionmergestrategies',
    },
    {
      title: 'Vue 应用配置：idPrefix',
      url: 'https://cn.vuejs.org/api/application.html#app-config-idprefix',
    },
    {
      title: 'Vue 应用配置：throwUnhandledErrorInProduction',
      url: 'https://cn.vuejs.org/api/application.html#app-config-throwunhandlederrorinproduction',
    },
    {
      title: 'Vue 3.5.40 应用实例类型与实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiCreateApp.ts',
    },
    {
      title: 'Vue 3.5.40 选项合并实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts',
    },
    {
      title: 'Vue 3.5.40 错误传播实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/errorHandling.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-02',
  anchors: [
    '概述',
    'app.mixin()',
    'app.runWithContext()',
    'app.config.warnHandler',
    'app.config.performance',
    'app.config.compilerOptions',
    'app.config.optionMergeStrategies',
    'app.config.idPrefix',
    'app.config.throwUnhandledErrorInProduction',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `interface App {
  mixin(mixin: ComponentOptions): this
  runWithContext<T>(fn: () => T): T // Vue 3.3+
}

type OptionMergeFunction = (to: unknown, from: unknown) => any

interface RuntimeCompilerOptions {
  isCustomElement?: (tag: string) => boolean
  whitespace?: 'preserve' | 'condense'
  comments?: boolean
  delimiters?: [string, string]
}

interface AppConfig {
  warnHandler?: (
    msg: string,
    instance: ComponentPublicInstance | null,
    trace: string,
  ) => void
  performance: boolean
  compilerOptions: RuntimeCompilerOptions
  optionMergeStrategies: Record<string, OptionMergeFunction>
  idPrefix?: string // Vue 3.5+
  throwUnhandledErrorInProduction?: boolean // Vue 3.5+
}`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '这些成员都属于单个 `app`。`mixin()` 与 `runWithContext()` 扩展应用行为，其余属性修改应用配置；它们不会自动影响同一页面中的其他 Vue 应用。配置应在首次 `mount()` 前完成，使所有组件从第一次解析与渲染起就共享同一契约。',
    },
    {
      type: 'table',
      headers: ['能力', '适用范围', '关键限制'],
      rows: [
        ['mixin / optionMergeStrategies', 'Options API 兼容与库扩展', '不用于新业务的普通逻辑复用'],
        ['warnHandler / performance', '浏览器开发诊断', '生产环境不能依赖'],
        ['compilerOptions', '浏览器运行时模板编译', 'Vite SFC 应配置构建插件'],
        ['idPrefix / 生产错误抛出', '3.5+ 应用边界', 'SSR 两端与宿主错误链要明确收口'],
      ],
    },
    { type: 'heading', content: 'app.mixin()' },
    {
      type: 'text',
      content:
        '`app.mixin(mixin)` 从 Vue 3.0 起可用，它把一个 Options API mixin 应用到当前 app 的每个组件，并返回该 app。全局 mixin 会让选项来源更隐蔽，也让所有组件参与合并；Vue 官方建议新应用优先使用组合式函数，只在兼容旧插件或确需应用级注入时保留它。关闭 `__VUE_OPTIONS_API__` 的构建不能依赖该能力。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const legacyAnalyticsMixin = {
  /** 为旧 Options API 组件登记页面访问。 */
  mounted() {
    analytics.track(this.$options.name ?? 'AnonymousComponent')
  },
}

const app = createApp(AppRoot)
app.mixin(legacyAnalyticsMixin)
app.mount('#app')`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '普通业务逻辑不要新增全局 mixin。它适合迁移期或库兼容层；能够显式导入的状态和行为应写成 composable，让依赖关系在组件中可见。',
    },
    { type: 'heading', content: 'app.runWithContext()' },
    {
      type: 'text',
      content:
        '`app.runWithContext(fn)` 从 Vue 3.3 起可用。它立即执行回调，并在回调的同步执行期间让 `inject()` 读取当前 app 的 `provide()` 值，最后原样返回回调结果。它只提供应用级 injection context，不会伪造组件实例，也不会把上下文延伸到 `await` 之后。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { inject } from 'vue'

const requestClientKey = Symbol('request-client')
app.provide(requestClientKey, requestClient)

/** 在当前应用注入上下文中同步取得请求客户端。 */
function resolveRequestClient() {
  return app.runWithContext(() => inject(requestClientKey))
}

const client = resolveRequestClient()`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '回调可以返回 Promise，但 application injection context 仍只覆盖 Promise 创建前的同步部分。异步流程应先同步读取依赖，再把读取到的值显式传给 `await` 之后的逻辑。',
    },
    { type: 'heading', content: 'app.config.warnHandler' },
    {
      type: 'text',
      content:
        '`warnHandler` 从 Vue 3.0 起可用，它接收 Vue warning 消息、来源组件公开实例或 `null`，以及组件追踪字符串。它只在开发环境生效，适合临时筛选一类已知调试噪声；它不是异常处理器，不能代替 `app.config.errorHandler`，也不应吞掉所有 warning。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `app.config.warnHandler = (message, instance, trace) => {
  if (message.includes('Extraneous non-props attributes')) {
    console.debug(message, instance, trace)
    return
  }

  console.warn('[Vue warning]', message, trace)
}`,
    },
    { type: 'heading', content: 'app.config.performance' },
    {
      type: 'text',
      content:
        '`performance` 从 Vue 3.0 起可用。把它设为 `true`，可让 Vue 在支持 Performance API 的浏览器开发工具时间线中记录组件初始化、编译、渲染、patch 与 hydration 标记。默认值为 `false`，且官方只保证开发模式可用；它不是生产采样 profiler 或业务性能上报 SDK。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const app = createApp(AppRoot)

if (import.meta.env.DEV) {
  app.config.performance = true
}

app.mount('#app')`,
    },
    { type: 'heading', content: 'app.config.compilerOptions' },
    {
      type: 'text',
      content:
        '`compilerOptions` 从 Vue 3.1 起可用，只影响浏览器内发生的运行时模板编译。Vue 3.5.40 的公开运行时子集包含 `isCustomElement`、`whitespace`、`comments` 和 `delimiters`；组件自己的 `compilerOptions` 可以覆盖 app 级值。当前 Vite SFC 项目使用 runtime-only 构建，模板已经在构建阶段编译，应把同类配置传给 `@vitejs/plugin-vue`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('acme-'),
        },
      },
    }),
  ],
})`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '不要用“包含连字符”作为宽泛规则。被 `isCustomElement()` 判定为原生自定义元素的标签不会再按 Vue 组件解析，规则应只匹配项目真实使用的 Web Component 命名空间。',
    },
    { type: 'heading', content: 'app.config.optionMergeStrategies' },
    {
      type: 'text',
      content:
        '`optionMergeStrategies` 从 Vue 3.0 起可用，为 Options API 的自定义组件选项注册合并函数。key 是自定义选项名，函数接收较早来源和较晚来源的值并返回合并结果；最终值可从组件实例的 `this.$options` 读取。它面向库扩展协议，不是普通业务对象的通用 merge 工具。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `app.config.optionMergeStrategies.permissions = (parent, child) => [
  ...((parent as string[] | undefined) ?? []),
  ...((child as string[] | undefined) ?? []),
]

app.mixin({ permissions: ['read'] })

export default {
  permissions: ['write'],
  /** 读取已经完成合并的自定义选项。 */
  created() {
    console.log(this.$options.permissions) // ['read', 'write']
  },
}`,
    },
    { type: 'heading', content: 'app.config.idPrefix' },
    {
      type: 'text',
      content:
        '`idPrefix` 从 Vue 3.5 起为当前 app 的全部 `useId()` 结果设置前缀。同一 document 中有多个 Vue app 时，应为每个 app 选择不同前缀；SSR 服务端和客户端则必须使用相同前缀与应用结构。公开契约只保证前缀参与生成，不保证完整 ID 的分隔符和内部格式。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const adminApp = createApp(AdminRoot)
adminApp.config.idPrefix = 'admin'
adminApp.mount('#admin')

const storefrontApp = createApp(StorefrontRoot)
storefrontApp.config.idPrefix = 'storefront'
storefrontApp.mount('#storefront')`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '不要解析或拼接 `useId()` 的完整结果。它适合 DOM 与 ARIA 关联，不是数据库主键；需要跨会话持久化的实体身份应由业务层生成。',
    },
    { type: 'heading', content: 'app.config.throwUnhandledErrorInProduction' },
    {
      type: 'text',
      content:
        '`throwUnhandledErrorInProduction` 从 Vue 3.5 起可用，默认 `false`。生产模式下，Vue 默认把到达错误链终点的未处理错误写到 `console.error`；设为 `true` 后会重新抛出，让宿主运行时或错误边界接管。祖先捕获钩子返回 `false` 或 `app.config.errorHandler` 已处理的错误不会再次到达该终点。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const app = createSSRApp(AppRoot)

// 让未被组件捕获钩子或 errorHandler 消费的错误进入请求拒绝链
app.config.throwUnhandledErrorInProduction = true

await renderToString(app)`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '开启抛出只是传播策略，不是完整监控方案。浏览器需要全局错误边界，SSR 需要逐请求捕获 renderer rejection；否则一次可观测错误可能变成白屏或未收口的请求失败。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '用全局 mixin 承载普通业务复用逻辑',
          description:
            '全局 mixin 会参与当前 app 的每个组件，选项来源不可见，还容易与组件自己的属性和钩子发生冲突。',
          consequence: '不相关组件承担额外初始化成本，维护者也难以从组件文件判断行为来自哪里。',
          wrong: {
            lang: 'ts',
            content: `app.mixin({
  /** 为所有组件隐式加载当前用户。 */
  created() {
    this.loadCurrentUser()
  },
})`,
          },
          correct: {
            lang: 'ts',
            content: `/** 显式复用当前用户状态。 */
export function useCurrentUser() {
  return { user: readonly(user), load: loadCurrentUser }
}`,
          },
        },
        {
          title: '在 runWithContext() 的 await 之后调用 inject()',
          description:
            '该 API 只在回调同步执行期间设置 app injection context，Promise 挂起时上下文已经恢复。',
          consequence:
            '`inject()` 找不到预期值并返回 `undefined` 或发出警告，异步路径表现与同步路径不一致。',
          wrong: {
            lang: 'ts',
            content: `await app.runWithContext(async () => {
  await loadRoute()
  return inject(apiKey)
})`,
          },
          correct: {
            lang: 'ts',
            content: `await app.runWithContext(async () => {
  const api = inject(apiKey)
  await loadRoute()
  return api
})`,
          },
        },
        {
          title: '把 warnHandler 当作生产错误监控入口',
          description:
            'Vue warning 是开发反馈，官方明确生产环境会忽略 `warnHandler`。运行时异常由另一条错误链处理。',
          consequence: '生产问题不会上报，团队还可能因为本地 warning 被统一吞掉而错过真实缺陷。',
          wrong: {
            lang: 'ts',
            content: `app.config.warnHandler = (message) => productionReporter.send(message)`,
          },
          correct: {
            lang: 'ts',
            content: `app.config.errorHandler = (error, instance, info) => {
  productionReporter.capture(error, { instance, info })
}`,
          },
        },
        {
          title: '把 performance 当成线上持续 profiler',
          description:
            '该开关面向开发模式的浏览器 Performance 时间线，不负责采样、聚合或上传业务指标。',
          consequence: '线上没有预期数据，或团队依据单次局部标记得出脱离网络和业务负载的错误结论。',
          wrong: {
            lang: 'ts',
            content: `app.config.performance = true
sendMetrics(app.config.performance)`,
          },
          correct: {
            lang: 'ts',
            content: `if (import.meta.env.DEV) {
  app.config.performance = true
}

observeWebVitals(reportMetric)`,
          },
        },
        {
          title: '在 Vite SFC 项目中只修改 app.config.compilerOptions',
          description:
            'runtime-only Vue 不会在浏览器重新编译已经由 Vite 处理的 SFC 模板，运行时配置无法回溯修改构建产物。',
          consequence: '自定义元素仍被当作 Vue 组件解析并发出警告，配置看似正确却完全不生效。',
          wrong: {
            lang: 'ts',
            content: `app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('acme-')`,
          },
          correct: {
            lang: 'ts',
            content: `vue({
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('acme-'),
    },
  },
})`,
          },
        },
        {
          title: '合并自定义选项时假定两侧一定存在',
          description:
            'mixin、extends 与组件自身不一定都声明该选项，合并函数的 `to` 或 `from` 可以是 `undefined`。',
          consequence: '首次解析只有一侧值的组件时就抛出异常，导致整个组件无法创建。',
          wrong: {
            lang: 'ts',
            content: `app.config.optionMergeStrategies.permissions = (parent, child) => [
  ...(parent as string[]),
  ...(child as string[]),
]`,
          },
          correct: {
            lang: 'ts',
            content: `app.config.optionMergeStrategies.permissions = (parent, child) => [
  ...((parent as string[] | undefined) ?? []),
  ...((child as string[] | undefined) ?? []),
]`,
          },
        },
        {
          title: 'SSR 两端使用不同 idPrefix 或依赖固定 ID 格式',
          description:
            '`idPrefix` 必须与同一 SSR 应用的结构一起保持一致；完整结果的分隔符则不是公开协议。',
          consequence:
            '服务端与客户端的 label、ARIA 引用不一致并触发 hydration mismatch，升级后字符串解析也可能失效。',
          wrong: {
            lang: 'ts',
            content: `serverApp.config.idPrefix = 'server'
clientApp.config.idPrefix = 'client'

const sequence = Number(useId().split(':').at(-1))`,
          },
          correct: {
            lang: 'ts',
            content: `const idPrefix = 'checkout'
serverApp.config.idPrefix = idPrefix
clientApp.config.idPrefix = idPrefix

const fieldId = useId()`,
          },
        },
        {
          title: '同时消费 errorHandler 又期待生产错误继续自动抛出',
          description:
            '`throwUnhandledErrorInProduction` 只影响到达 Vue 默认终点的未处理错误；`errorHandler` 已经接管时不会继续走该分支。',
          consequence: '错误只被记录却没有进入宿主拒绝链，调用方等待的失败信号永远不会出现。',
          wrong: {
            lang: 'ts',
            content: `app.config.errorHandler = (error) => reporter.capture(error)
app.config.throwUnhandledErrorInProduction = true`,
          },
          correct: {
            lang: 'ts',
            content: `// 让到达 Vue 默认终点的错误交给宿主处理
app.config.throwUnhandledErrorInProduction = true`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: 'app.mixin()：应用级兼容层',
          content:
            'Vue 3.5.40 把 mixin 放入当前 app context，并受 Options API feature flag 保护。它适合仍要向整棵 Options API 组件树注入兼容选项的库，不适合新业务逻辑复用。',
        },
        {
          title: 'app.runWithContext()：同步依赖解析',
          content:
            '实现只在同步 `try/finally` 区间设置并恢复当前 app。router guard、插件入口或库函数可以在回调开头读取 app provide，再把真实依赖显式传进异步流程。',
        },
        {
          title: 'warnHandler：短期开发筛选',
          content:
            '应用 context 的默认值是 `undefined`，warning 调用链位于开发警告路径。测试或调试工具可以临时按消息筛选，但业务控制流和生产监控不应依赖它。',
        },
        {
          title: 'performance：组件阶段定位',
          content:
            'profiling 实现检查浏览器 Performance API，并为 init、compile、render、patch 与 hydration 创建测量。它适合用 DevTools 对比组件阶段，不提供网络或业务全链路结论。',
        },
        {
          title: 'compilerOptions：运行时编译边界',
          content:
            '公开类型明确只支持 runtime compiler build。standalone full build 中的可信动态模板可以使用 app 级选项；预编译 SFC 则应在对应构建插件中配置。',
        },
        {
          title: 'optionMergeStrategies：自定义 Options 协议',
          content:
            '选项解析会把 global mixin、extends、local mixin 与组件自身的同名自定义值交给策略。库可以定义小而明确的扩展协议，普通业务对象应使用显式函数合并。',
        },
        {
          title: 'idPrefix：多应用 DOM 身份隔离',
          content:
            '`useId()` 从当前组件所属 app config 读取前缀。它适合同一 document 中的多个嵌入式应用，以及服务端和客户端使用一致配置的 SSR 应用。',
        },
        {
          title: 'throwUnhandledErrorInProduction：宿主错误边界接力',
          content:
            '错误实现先执行组件捕获钩子和 app errorHandler，只把剩余错误交给最终日志或抛出分支。需要让 SSR 请求或平台错误边界继续处理时可开启，但宿主必须明确捕获。',
        },
      ],
    },
  ],
})
