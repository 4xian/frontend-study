# Vue Core API 第 31 批：应用扩展与配置官方调研

## 调研范围与证据纪律

- 冻结版本：`vue@3.5.40`，对应 `vuejs/core` commit
  [`fa2885d8c48768d26f1666a01bd540ffe3b20f9b`](https://github.com/vuejs/core/tree/fa2885d8c48768d26f1666a01bd540ffe3b20f9b)。
- 调研日期：2026-08-02。
- 官网检索只使用 Vue 官方中文站；交叉核验只使用 Vue 官方文档、`vuejs/core`
  v3.5.40 的公开类型、源码和官方测试。
- 官网说明是 public contract 的首要依据。源码与测试只用于校正 3.5.40 的版本、环境和行为边界；
  `currentApp`、应用上下文缓存、renderer 参数等内部实现不应进入课程公开契约。
- 本批对应剩余计划 B02 的 9 项。为避免现有 `create-app.ts` 超出单文件上限，冻结为两篇新页面：
  `create-ssr-app.ts` 承接 quick 深度的 `createSSRApp()`，`application-configuration.ts` 合并其余
  8 项。每个索引项仍提供唯一真实 heading target。

## 冻结页面与 heading 映射

下列 anchor 按仓库 `headingId()` 规则从 heading 计算，manifest target 使用第四列，而不是官网
anchor。`createSSRApp()` 页以“概述”为入口，页面标题保留 API 名称。

| Manifest id | 页面 | heading | 冻结 target.anchor | 版本 | 易错点 / 源码推导 |
| --- | --- | --- | --- | --- | ---: |
| `application.create-ssr-app` | `create-ssr-app` | `概述` | `概述` | 3.0+ | 3 / 3 |
| `application.app-mixin` | `application-configuration` | `app.mixin()` | `appmixin` | 3.0+ | 2 / 2 |
| `application.app-run-with-context` | `application-configuration` | `app.runWithContext()` | `apprunwithcontext` | 3.3+ | 2 / 2 |
| `application.app-config-warn-handler` | `application-configuration` | `app.config.warnHandler` | `appconfigwarnhandler` | 3.0+ | 2 / 2 |
| `application.app-config-performance` | `application-configuration` | `app.config.performance` | `appconfigperformance` | 3.0+ | 2 / 2 |
| `application.app-config-compiler-options` | `application-configuration` | `app.config.compilerOptions` | `appconfigcompileroptions` | 3.1+ | 3 / 2 |
| `application.app-config-option-merge-strategies` | `application-configuration` | `app.config.optionMergeStrategies` | `appconfigoptionmergestrategies` | 3.0+ | 2 / 2 |
| `application.app-config-id-prefix` | `application-configuration` | `app.config.idPrefix` | `appconfigidprefix` | 3.5+ | 3 / 3 |
| `application.app-config-throw-unhandled-error-in-production` | `application-configuration` | `app.config.throwUnhandledErrorInProduction` | `appconfigthrowunhandlederrorinproduction` | 3.5+ | 3 / 3 |

两篇页面合计准备 **22 个结构化易错点候选、21 条源码推导**。实现时仍应按页面可读性合并重复项，
尤其是“挂载前配置”和“应用级作用域”，不要机械制造 22 张重复卡片。

## 1. `createSSRApp()`

**推荐签名**

```ts
function createSSRApp(
  rootComponent: Component,
  rootProps?: Record<string, unknown> | null,
): App<Element>
```

**版本与环境**：Vue 3.0+；服务端渲染和浏览器客户端激活的应用入口。服务端把返回的 app 交给
`vue/server-renderer`，浏览器端对服务端已有 HTML 调用 `mount()` 时进入 hydration，而不是创建一棵
全新的 DOM 树。

**公开行为边界**

- 参数和应用配置方式与 `createApp()` 相同；差别是挂载语义为 SSR hydration。
- SSR 的服务端与客户端应调用同一应用工厂，得到结构和初始状态一致的应用。
- SSR 服务进程会复用模块；用户相关状态、router、store 和 app 应按请求新建，避免跨请求污染。
- 它只是 SSR 应用入口，不代替 `renderToString()` / stream API，也不承诺自动完成数据序列化、路由
  就绪或 hydration mismatch 修复。

**易错点候选（3）**

1. 服务端已经输出 HTML，却在客户端使用 `createApp()` 重新挂载，丢失正确的 hydration 入口。
2. 在服务端模块顶层复用单个 app 或用户状态，让多个请求共享应用级资源。
3. 把 `createSSRApp()` 当作完整 SSR 框架，遗漏服务端 renderer、客户端入口和状态同步。

**v3.5.40 源码推导与适用场景（3）**

1. DOM 入口把它声明为与 `createApp()` 相同的 `CreateAppFunction<Element>`，所以公开参数形状一致。
2. 客户端包装后的 `mount()` 明确选择 hydration；适合“服务端先输出 HTML，浏览器接管现有 DOM”。
3. server-renderer 官方测试把 `createSSRApp(App)` 直接交给 `renderToString(app)`；这证明它也是服务端
   renderer 的应用入口，但 renderer API 仍是独立能力。

来源：[应用实例 API](https://cn.vuejs.org/api/application.html#createssrapp)、
[SSR 指南：渲染与客户端激活](https://cn.vuejs.org/guide/scaling-up/ssr.html#basic-tutorial)、
[SSR 指南：跨请求状态污染](https://cn.vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution)、
[`runtime-dom/index.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/index.ts)、
[`server-renderer/render.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/server-renderer/__tests__/render.spec.ts)。

## 2. `app.mixin()`

**推荐签名**

```ts
interface App {
  mixin(mixin: ComponentOptions): this
}
```

**版本与环境**：Vue 3.0+；应用级 Options API 能力。它属于当前 app，不是跨多个 app 的进程级
全局。使用关闭 `__VUE_OPTIONS_API__` 的构建时不应依赖此能力。

**公开行为边界**

- 全局 mixin 中的选项会应用到当前应用的每个组件实例。
- Vue 3 保留 mixin 主要为生态兼容；新应用的逻辑复用应优先使用组合式函数，尤其不要新增全局 mixin。
- 返回当前 app，可在挂载前继续链式配置；它不把资源安装到其他应用实例。

**易错点候选（2）**

1. 为普通复用逻辑注册全局 mixin，造成来源不透明、命名冲突和每个组件都承担的隐性成本。
2. 误以为给 app A 调用 `mixin()` 后 app B 也会继承相同选项。

**v3.5.40 源码推导与适用场景（2）**

1. `App.mixin()` 的公开类型返回 `this`，实现把 mixin 登记到当前 app context；适合确需应用级兼容
   注入的库。
2. 固定源码受 Options API feature flag 保护；该构建边界用于解释适用环境，不应把内部 mixin 数组或
   去重方式写成 public contract。

来源：[应用实例 API](https://cn.vuejs.org/api/application.html#app-mixin)、
[组合式函数指南：对比 mixin](https://cn.vuejs.org/guide/reusability/composables.html#comparisons-with-other-techniques)、
[编译时标志：`__VUE_OPTIONS_API__`](https://cn.vuejs.org/api/compile-time-flags.html#VUE_OPTIONS_API)、
[`apiCreateApp.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiCreateApp.ts)。

## 3. `app.runWithContext()`

**推荐签名**

```ts
interface App {
  runWithContext<T>(fn: () => T): T
}
```

**版本与环境**：Vue 3.3+；浏览器、SSR 和非组件应用代码都可调用，但注入上下文只覆盖回调的
**同步执行期间**。

**公开行为边界**

- 回调会立即执行；没有活动组件实例时，其中的 `inject()` 可读取当前 app 的 `app.provide()` 值。
- 回调返回值会原样返回。即使 `T` 是 Promise，也不代表注入上下文会跨 `await` 保留。
- 它提供的是应用级 injection context，不会伪造组件实例，也不让组件专属 API 在任意代码中可用。

**易错点候选（2）**

1. 在 `async` 回调的 `await` 之后调用 `inject()`，假定上下文会像异步本地存储一样自动传播。
2. 把它当成通用组件上下文，尝试在回调中调用依赖活动组件实例的生命周期 API。

**v3.5.40 源码推导与适用场景（2）**

1. 固定实现只在同步 `try/finally` 区间设置并恢复当前 app，直接解释官网的“同步调用期间”限制。
2. 官方测试覆盖嵌套 app、嵌套 `runWithContext()` 和退出后恢复；适合 router guard、插件入口或库函数
   在同步阶段读取应用 provide。

来源：[应用实例 API](https://cn.vuejs.org/api/application.html#app-runwithcontext)、
[`apiCreateApp.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiCreateApp.ts)、
[`apiCreateApp.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiCreateApp.spec.ts)、
[`apiInject.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiInject.spec.ts)。

## 4. `app.config.warnHandler`

**推荐类型**

```ts
interface AppConfig {
  warnHandler?: (
    msg: string,
    instance: ComponentPublicInstance | null,
    trace: string,
  ) => void
}
```

**版本与环境**：Vue 3.0+；**仅开发环境**。生产构建会忽略这项配置。

**公开行为边界**

- 处理 Vue 运行时 warning，参数依次是消息、来源组件公开实例或 `null`、组件追踪字符串。
- 适合短期筛选调试噪声，不是异常监控入口，也不能替代 `app.config.errorHandler`。
- 官方要求开发期警告都应被解决；过滤器应在调试结束后移除，而不是长期吞掉全部警告。

**易错点候选（2）**

1. 把 `warnHandler` 接到生产错误上报，忽略它在生产环境不运行。
2. 通过空处理器隐藏全部 warning，使真实的模板、组件或响应性问题失去反馈。

**v3.5.40 源码推导与适用场景（2）**

1. `AppConfig` 公开类型确认三个参数与可选性；应用 context 默认值是 `undefined`。
2. warning 调用链位于开发警告路径；适合测试或局部调试期间按消息筛选，不应用于业务控制流。

来源：[应用实例 API](https://cn.vuejs.org/api/application.html#app-config-warnhandler)、
[`apiCreateApp.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiCreateApp.ts)、
[`warning.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/warning.ts)。

## 5. `app.config.performance`

**推荐类型**

```ts
interface AppConfig {
  performance: boolean
}
```

**版本与环境**：Vue 3.0+；默认 `false`；**仅开发模式且仅支持 Performance API 的浏览器**。

**公开行为边界**

- 设为 `true` 后，Vue 为组件初始化、运行时编译、渲染和 patch 添加浏览器性能时间线标记。
- 它只提供 Vue 组件阶段的测量证据，不是采样 profiler、业务指标 SDK 或生产监控开关。
- 非浏览器环境、缺少所需 Performance API 或生产模式都不应依赖这些标记。

**易错点候选（2）**

1. 在线上开启后期待持续上报性能数据；官方明确它只在开发模式工作。
2. 把时间线标记视为完整性能结论，不结合浏览器录制区间、网络与业务测量进行分析。

**v3.5.40 源码推导与适用场景（2）**

1. app context 默认 `performance: false`；renderer 的相关测量入口只在开发分支调用。
2. profiling 源码检查浏览器 performance 后生成 mark/measure；适合在浏览器 DevTools 中定位 Vue 组件
   init、compile、render、patch 的相对耗时。

来源：[应用实例 API](https://cn.vuejs.org/api/application.html#app-config-performance)、
[`apiCreateApp.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiCreateApp.ts)、
[`profiling.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/profiling.ts)、
[`renderer.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/renderer.ts)。

## 6. `app.config.compilerOptions`

**推荐类型**

```ts
interface RuntimeCompilerOptions {
  isCustomElement?: (tag: string) => boolean
  whitespace?: 'preserve' | 'condense'
  comments?: boolean
  delimiters?: [string, string]
}

interface AppConfig {
  compilerOptions: RuntimeCompilerOptions
}
```

**版本与环境**：Vue 3.1+；只对能在浏览器内编译模板的 **full build / runtime compiler build**
生效。当前 Vite 项目通常使用 runtime-only Vue，SFC 模板在构建期编译，应改在 Vue 构建插件中传递
compiler options。

**公开行为边界**

- app 级对象影响该应用所有运行时编译组件；组件自身 `compilerOptions` 可以逐组件覆盖。
- 3.5.40 的运行时子集只有 `isCustomElement`、`whitespace`、`comments`、`delimiters`。
- `isCustomElement` 判断原生自定义元素；原生 HTML/SVG 标签不需要手动匹配。
- `comments: true` 对生产模板注释是否保留有意义，但前提仍是模板经过这条运行时编译路径。

**易错点候选（3）**

1. 在 Vite SFC 项目里只写 `app.config.compilerOptions`，期待改变已经构建完成的模板。
2. 把所有带连字符的组件都判为 custom element，导致本应解析为 Vue 组件的标签不再解析。
3. 把 app 级配置与组件级 `compilerOptions` 当作叠加；官方明确组件级选项可以覆盖 app 配置。

**v3.5.40 源码推导与适用场景（2）**

1. `AppConfig` 类型注释明确“only supported in runtime compiler build”，公开运行时类型固定为四个字段。
2. 组件运行时编译路径组合 app 级和组件级配置；适合 standalone full build、可信的 in-browser template
   场景，而不是当前仓库的预编译 SFC 默认路径。

来源：[应用实例 API](https://cn.vuejs.org/api/application.html#app-config-compileroptions)、
[组件 `compilerOptions`](https://cn.vuejs.org/api/options-rendering.html#compileroptions)、
[`apiCreateApp.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiCreateApp.ts)、
[`componentOptions.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts)、
[`component.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts)。

## 7. `app.config.optionMergeStrategies`

**推荐类型**

```ts
type OptionMergeFunction = (to: unknown, from: unknown) => any

interface AppConfig {
  optionMergeStrategies: Record<string, OptionMergeFunction>
}
```

**版本与环境**：Vue 3.0+；面向 Options API 自定义组件选项，尤其是库通过 global mixin、
`extends` 或组件自身提供同名自定义选项时。

**公开行为边界**

- 以自定义选项名为 key 注册合并函数；函数接收父来源值和子来源值并返回合并结果。
- 合并结果可通过组件公开的 `this.$options` 读取。
- 它不是普通对象的通用 merge 工具。课程示例应使用一个明确的自定义选项，不覆盖 Vue 内置选项策略。

**易错点候选（2）**

1. 忘记某一侧可能是 `undefined`，合并函数直接对未知值调用数组或字符串方法。
2. 为内置选项或业务数据注册策略，扩大影响面并把 Options API 解析顺序变成隐式业务协议。

**v3.5.40 源码推导与适用场景（2）**

1. app context 各自拥有 strategies 和 options cache，证明配置作用域属于单个 app；缓存结构本身不是
   public contract。
2. 官方测试以 global mixin、`extends`、local mixin 和组件本身的 `foo` 验证合并结果；适合库定义
   `foo` 一类自定义 option 的兼容扩展。

来源：[应用实例 API](https://cn.vuejs.org/api/application.html#app-config-optionmergestrategies)、
[组件实例 `$options`](https://cn.vuejs.org/api/component-instance.html#options)、
[`apiCreateApp.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiCreateApp.ts)、
[`componentOptions.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts)、
[`apiCreateApp.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiCreateApp.spec.ts)。

## 8. `app.config.idPrefix`

**推荐类型**

```ts
interface AppConfig {
  idPrefix?: string
}
```

**版本与环境**：Vue 3.5+；浏览器与 SSR 均可用，默认配置值为 `undefined`。

**公开行为边界**

- 为当前 app 内所有 `useId()` 结果设置前缀；`useId()` 仍负责应用内唯一性和 SSR 稳定性。
- 同一页面多个 Vue app 应使用不同前缀避免 DOM ID 冲突。
- 同一个 SSR app 的服务端与客户端必须使用一致的前缀和应用结构，不能用前缀掩盖真实 hydration
  不一致。
- 公开契约只保证“前缀”，不保证前缀与内部序号之间的分隔符或完整 ID 格式。

**易错点候选（3）**

1. 多应用页面沿用默认前缀，误把“每个应用内唯一”理解为“整个 document 唯一”。
2. SSR 服务端与客户端配置不同前缀，制造 label/ARIA 关联不一致和 hydration mismatch。
3. 解析 `useId()` 字符串或断言固定分隔符，把实现格式当成业务协议。

**v3.5.40 源码推导与适用场景（3）**

1. `useId.ts` 从当前组件所属 app config 读取 `idPrefix`，说明隔离单位是 app。
2. 官方 `useId` 测试验证默认 `v-0` 和自定义 `foo-0`；可用来校验 3.5.40 行为，不应将 `-` 写成
   长期 public contract。
3. 当前官网 `idPrefix` 示例显示 `myApp:0`，与 v3.5.40 固定源码/测试的 `foo-0` 不同。课程应只展示
   动态获得的 ID 和前缀效果，不冻结冒号或连字符。

来源：[应用实例 API](https://cn.vuejs.org/api/application.html#app-config-idprefix)、
[`useId()` 官方 API](https://cn.vuejs.org/api/composition-api-helpers.html#useid)、
[`apiCreateApp.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiCreateApp.ts)、
[`useId.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/useId.ts)、
[`useId.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/helpers/useId.spec.ts)。

## 9. `app.config.throwUnhandledErrorInProduction`

**推荐类型**

```ts
interface AppConfig {
  throwUnhandledErrorInProduction?: boolean
}
```

**版本与环境**：Vue 3.5+；只改变**生产模式**下到达 Vue 默认未处理错误终点的行为，默认
`false`。

**公开行为边界**

- 开发模式下，Vue 默认重新抛出未处理错误，使问题显眼；该选项不是开发错误开关。
- 生产默认只 `console.error`，减少对最终用户的影响；设为 `true` 后，未处理错误会重新抛出，让宿主
  运行时或错误监控有机会捕获。
- “未处理”是关键限制：祖先 `errorCaptured` / `onErrorCaptured` 返回 `false`，或
  `app.config.errorHandler` 已接管的错误，不会因为此开关再次抛出。
- 它只覆盖 Vue 已接管的错误链。脱离 Vue 调用链的普通定时器、未返回 Promise 等错误仍由宿主平台
  负责；抛出后的进程、请求或 UI 行为也由宿主环境决定。

**易错点候选（3）**

1. 设为 `true` 后仍配置一个只记录不抛出的 `errorHandler`，却期待同一个错误继续到默认抛出终点。
2. 把开关理解为“任何 JavaScript 错误都上报”，忽略 Vue 错误接管范围与平台全局错误通道。
3. 在 SSR 中开启后不处理 renderer Promise rejection，让单次请求错误扩大为未定义的服务行为。

**v3.5.40 源码推导与适用场景（3）**

1. `AppConfig` 类型和 app context 默认值确认它是可选 boolean，缺省行为等同 `false`。
2. `handleError()` 先走组件捕获钩子和 app `errorHandler`，只有剩余错误才把该值交给最终日志/抛出
   分支；这限定了“未处理”的范围。
3. 官方测试把 `__DEV__` 设为 false，并断言启用后 `app.mount()` 抛出原错误；适合需要生产异常继续
   进入宿主错误边界或 SSR 请求拒绝链的应用，但必须由宿主明确收口。

来源：
[应用实例 API](https://cn.vuejs.org/api/application.html#app-config-throwunhandlederrorinproduction)、
[应用级 `errorHandler`](https://cn.vuejs.org/api/application.html#app-config-errorhandler)、
[`apiCreateApp.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiCreateApp.ts)、
[`errorHandling.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/errorHandling.ts)、
[`apiCreateApp.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiCreateApp.spec.ts)。

## 跨项边界清单

| 边界 | 冻结结论 |
| --- | --- |
| 仅开发环境 | `warnHandler` 在生产被忽略；`performance` 只在开发模式和支持 Performance API 的浏览器工作 |
| 仅完整构建 | `app.config.compilerOptions` 只影响浏览器运行时编译；Vite SFC 应在构建插件配置 |
| 同步上下文 | `runWithContext()` 只在回调同步调用期间提供 app injection context，不跨 `await` |
| SSR 入口 | `createSSRApp()` 同时服务于 server renderer app 和客户端 hydration；每个 SSR 请求新建 app |
| Options API | `app.mixin()` 和自定义 option merge 只适合 Options API 兼容/扩展场景 |
| 多应用 ID | `idPrefix` 隔离同一 document 的多个 app；SSR 两端须一致，完整 ID 格式不是 contract |
| 生产错误传播 | `throwUnhandledErrorInProduction` 只重抛到达默认终点的未处理 Vue 错误，不越过已消费处理器 |
| 配置时机 | 本批 app config 和扩展项应在首次 `mount()` 前冻结，不把挂载后的偶然行为写成保证 |

## 版本交叉核验

- Vue 3.0.0 的固定源码已经包含 `createSSRApp()`、`app.mixin()`、`warnHandler`、`performance` 和
  `optionMergeStrategies`：[`apiCreateApp.ts` v3.0.0](https://github.com/vuejs/core/blob/v3.0.0/packages/runtime-core/src/apiCreateApp.ts)、
  [`runtime-dom/index.ts` v3.0.0](https://github.com/vuejs/core/blob/v3.0.0/packages/runtime-dom/src/index.ts)。
- `compilerOptions` 从 Vue 3.1 系列进入 `AppConfig`：
  [`apiCreateApp.ts` v3.1.0](https://github.com/vuejs/core/blob/v3.1.0/packages/runtime-core/src/apiCreateApp.ts)。
- 官网明确 `runWithContext()` 仅 3.3+，3.3.0 固定类型已包含该成员：
  [`apiCreateApp.ts` v3.3.0](https://github.com/vuejs/core/blob/v3.3.0/packages/runtime-core/src/apiCreateApp.ts)。
- 官网为 `idPrefix` 和 `throwUnhandledErrorInProduction` 标注 3.5+，3.5.0 固定类型同时包含两项：
  [`apiCreateApp.ts` v3.5.0](https://github.com/vuejs/core/blob/v3.5.0/packages/runtime-core/src/apiCreateApp.ts)。

## 实施验收建议

1. 新建 `create-ssr-app.ts` 与 `application-configuration.ts` 两篇 entry，不扩充现有
   `create-app.ts`；实现后检查每个文件不超过仓库约 1000 行上限。
2. `createSSRApp()` target 指向速查页“概述”；其余 8 个 heading 文本与本文件冻结值完全一致，并用
   `headingId()` 或现有模板测试验证 target anchor。
3. 两篇 `signature` 合计覆盖 9 项公开类型；`RuntimeCompilerOptions` 只列 3.5.40 的四个公开运行时
   字段。
4. 页面至少保留六个醒目边界：dev-only、full-build-only、同步上下文、SSR hydration、多应用 ID、
   production unhandled error。
5. `idPrefix` 示例不硬编码完整 ID 格式；SSR 示例不把 hydration、renderer 或跨请求隔离职责混写。
6. 源码段只展示能解释公开行为的最小 seam，不暴露 `_context`、`currentApp`、内部 renderer 参数或
   options cache 供业务代码依赖。
