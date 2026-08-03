# Vue Core 高级课程：错误处理调研

> 查证日期：2026-08-01
>
> 适用版本：Vue 3.5.40
>
> 资料范围：Vue 官方中文与英文文档、`vuejs/docs` 官方 Markdown、`vuejs/core`
> v3.5.40 固定标签源码与官方测试。外部资料通过 Tavily 定位，社区文章、问答、issue 和框架文档
> 不作为技术结论依据。

## 冻结建议

| 项目 | 建议值 |
| --- | --- |
| 课程 ID | `vue.core.learn.advanced.error-handling` |
| 标题 | 错误处理 |
| 阶段 / 分类 | `advanced` / `async-and-errors` |
| 唯一直接前置 | `vue.core.learn.advanced.async-components-suspense` |
| 唯一公开 Demo ID | `vue.core.learn.advanced.error-handling.error-boundary-lab-demo` |
| Demo 标题 | 嵌套错误边界实验台 |
| 易错点 | 恰好 8 个高质量候选 |
| 预计时长 | 70 分钟 |
| 实施前总量 | Vue 三条学习路线 `22 available / 38 planned` |
| 实施后总量 | Vue 三条学习路线 `23 available / 37 planned` |
| 后续课程 | `vue.core.learn.advanced.custom-directives` 保持 `planned` |

本课对应 manifest 中已有的“错误处理”，不是新增另一篇同名课程。上一课已说明 Suspense 只协调
等待态，本课接着建立组件错误链、错误边界状态、恢复动作与应用级上报的职责。现有生命周期、
`createApp()`、`defineAsyncComponent()` 与 Suspense Reference 继续承担 API 速查职责，本批不得修改、
复制或扩写这些 Reference 及其 Demo。

## 一手来源

- [Vue 中文 `onErrorCaptured()` API](https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured)：
  捕获来源、参数、状态更新、传播顺序、`false` 与捕获钩子自身抛错。
- [Vue English `onErrorCaptured()` API](https://vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured)：
  与中文文档交叉核对公开传播契约。
- [Vue 中文应用实例 API](https://cn.vuejs.org/api/application.html#app-config-errorhandler)：
  `app.config.errorHandler`、`warnHandler` 与 `throwUnhandledErrorInProduction`。
- [Vue Production Error Code Reference](https://vuejs.org/error-reference/#runtime-errors)：生产环境
  `info` 错误来源代码的映射。
- [Vue 中文 Suspense 错误处理](https://cn.vuejs.org/guide/built-ins/suspense.html#error-handling)：
  Suspense 自身没有错误处理，异步错误交给父组件错误捕获链。
- [Vue 中文异步组件指南](https://cn.vuejs.org/guide/components/async.html)：loader、错误组件、超时与
  Suspense 的公开边界。
- [`vuejs/docs` 生命周期 API Markdown](https://github.com/vuejs/docs/blob/main/src/api/composition-api-lifecycle.md)：
  官网 `onErrorCaptured()` 原始文档。
- [`vuejs/docs` 应用 API Markdown](https://github.com/vuejs/docs/blob/main/src/api/application.md)：
  官网三个应用级配置项的原始文档。
- [Vue 3.5.40 `errorHandling.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/errorHandling.ts)：
  同步/异步调用包装、父链传播、严格 `false` 截断与开发/生产末端行为。
- [Vue 3.5.40 `apiLifecycle.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts)：
  `ErrorCapturedHook` 类型与钩子注册。
- [Vue 3.5.40 DOM `events.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/modules/events.ts)：
  原生事件处理器如何把返回值交给异步错误包装。
- [Vue 3.5.40 `apiAsyncComponent.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts)：
  loader 的 `onError(error, retry, fail, attempts)` 状态机。
- [Vue 3.5.40 错误处理官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/errorHandling.spec.ts)：
  内外捕获顺序、`false`、异步钩子、捕获钩子抛错与应用级处理。
- [Vue 3.5.40 异步组件官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiAsyncComponent.spec.ts)：
  loader retry / fail 和 Suspense 中 loader reject 的行为。
- [Vue 3.5.40 server renderer 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/render.spec.ts)：
  SSR 中 async setup、`onServerPrefetch()` 与错误捕获。
- [Vue 3.5.40 SSR Suspense 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/ssrSuspense.spec.ts)：
  服务端只渲染 default 分支及错误传播边界。

## 必须准确覆盖的公开语义

### 1. `onErrorCaptured()` 捕获后代错误，不捕获边界自身错误

公开签名是：

```ts
type ErrorCapturedHook = (
  err: unknown,
  instance: ComponentPublicInstance | null,
  info: string,
) => boolean | void
```

三个参数分别是原始错误、触发错误的组件公开实例，以及 Vue 标注的错误来源。官方列出的来源包括：

1. 组件渲染。
2. 原生事件和组件事件处理器。
3. 生命周期钩子。
4. `setup()`。
5. 侦听器及其清理函数。
6. 自定义指令钩子。
7. Transition 钩子。

“后代”是必要条件。Vue 3.5.40 的 `handleError()` 从触发实例的 `parent` 开始向上遍历，所以一个
边界不能捕获自己 `setup()`、render 或捕获钩子中产生的错误。可复用错误边界必须让可能抛错的内容
成为它的子组件或插槽后代。

开发环境的 `info` 是类似 `render function` 的描述。官方 API 把生产环境值概括为缩短代码；
Vue 3.5.40 固定源码实际生成指向 `https://vuejs.org/error-reference/#runtime-${type}` 的引用。
课程可以用 `info` 帮助分类，但不得依赖完整英文文案、把它翻译后做业务分支，或读取 Vue uid、
VNode 和内部实例字段。

来源：[`onErrorCaptured()`](https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured)、
[`ErrorCapturedHook` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts#L105-L116)、
[`handleError()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/errorHandling.ts#L112-L154)。

### 2. 错误由近到远传播，只有同步返回 `false` 才停止

同一个错误先到最近父组件的 `onErrorCaptured()` / `errorCaptured`，再沿父链由内向外调用。没有钩子
同步返回 `false` 时，它最后还会进入 `app.config.errorHandler`；这使局部边界可以负责用户界面，
同时让应用级处理器集中上报。

返回 `false` 表示“本错误已经处理，不再传播”。它会同时阻止更外层捕获钩子和
`app.config.errorHandler` 接收这个错误。源码使用严格的 `=== false`，所以 `undefined`、`null`、
空字符串和一个最终解析为 `false` 的 Promise 都不会截断当前同步传播。公开类型也只允许
`boolean | void`，课程不得把捕获钩子写成 `async` 后再期待 `return false` 生效。

```ts
onErrorCaptured((error, instance, info) => {
  capturedError.value = error
  return false
})
```

来源：[错误传播规则](https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured)、
[`handleError()` 父链与严格 false](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/errorHandling.ts#L118-L151)、
[传播与截断官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/errorHandling.spec.ts#L19-L93)。

### 3. 捕获只是通知，fallback 必须由边界状态明确渲染

`onErrorCaptured()` 不会自动替换失败 DOM，也不提供内置 fallback slot。局部边界应把错误写入响应式
状态，并在错误态渲染安全的替代分支。替代分支不能继续渲染刚刚抛错的后代，否则同一错误会在边界
更新时再次触发，形成无限渲染循环。

```vue
<template>
  <section v-if="capturedError" role="alert">
    <p>这个区域暂时不可用。</p>
    <button type="button" @click="resetBoundary">重置</button>
  </section>
  <slot v-else />
</template>
```

错误文案应面向用户，原始堆栈和内部 `info` 只用于诊断或上报。课程 Demo 使用确定性本地错误，不把
敏感响应、用户输入或堆栈直接展示在页面。

来源：[状态更新与无限循环警告](https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured)。

### 4. 捕获钩子自身抛错会产生第二条错误传播

如果 `errorCaptured` / `onErrorCaptured()` 本身抛错，新错误会以 `errorCaptured hook` 为来源重新进入
错误链，原始错误仍继续传播。官方公开契约说明，在没有后续 `false` 截断时，两者都会到达
`app.config.errorHandler`；官方测试也证明更高层边界可以分别观察原错误和钩子错误。

因此捕获钩子应保持同步、短小并避免执行容易失败的网络上报。需要异步上报时，把经过最小序列化的
错误交给可靠的应用级上报器；局部钩子只更新边界状态和决定是否传播。课程不教授“在捕获钩子里再
throw 一次”作为重新抛出手段，默认不返回 `false` 已经会继续传播原错误。

来源：[钩子自身抛错规则](https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured)、
[官方测试 `error thrown in onErrorCaptured`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/errorHandling.spec.ts#L124-L161)。

### 5. `app.config.errorHandler` 负责应用级汇聚，不代替局部恢复

`app.config.errorHandler` 接收与组件捕获钩子相同的 `(err, instance, info)` 三个参数，并汇聚应用内
仍在传播的组件渲染、事件、生命周期、setup、侦听器、自定义指令和 Transition 错误。它适合统一
去重、补充应用版本与路由上下文、发送监控事件，不适合猜测哪个局部子树应显示什么 fallback。

```ts
app.config.errorHandler = (error, instance, info) => {
  reportVueError({ error, component: instance?.$options.name, info })
}
```

如果局部边界返回 `false`，应用级处理器不会收到该错误。产品需要“局部消费且仍集中上报”时只能
二选一：让错误继续传播到应用处理器，或在返回 `false` 前显式调用同一个上报能力。不要同时在每层
重复上报，避免一个错误生成多条事件。

本课 Demo 明确禁止修改 `app.config`。它用最外层边界固定返回 `false` 终止实验错误，只在页面记录
公开捕获顺序，以保证没有 console error、console warning 或 pageerror。

来源：[应用级错误处理器](https://cn.vuejs.org/api/application.html#app-config-errorhandler)、
[`handleError()` 应用级分支](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/errorHandling.ts#L142-L154)。

### 6. Vue 只接住自己调用并取得返回值的 Promise

Vue 3.5.40 的 `callWithAsyncErrorHandling()` 先调用用户函数；若调用结果是 Promise，才给这个返回值
附加 `.catch()` 并送入 `handleError()`。原生 DOM 事件 invoker、组件事件、生命周期和侦听器都通过
这类包装调用，所以直接返回的 Promise rejection 可以进入组件错误链。

```ts
// 返回给 Vue，rejection 进入组件错误链
function handleSave() {
  return saveDraft()
}

// 返回值已经脱链，rejection 不属于这次 Vue wrapper
function handleDetachedSave() {
  void saveDraft()
}

// timer 回调由宿主环境调用，也不在这次 Vue wrapper 内
function handleLater() {
  setTimeout(() => {
    throw new Error('later')
  })
}
```

这不是“Vue 捕获应用内所有 Promise”的承诺。timer、手动事件订阅、第三方回调和未返回的 Promise
应在其真实所有者处 `try/catch` 或 `.catch()`；浏览器级 `error` / `unhandledrejection` 监控是另一层
职责，不能用本课组件边界 Demo 代替。

来源：[`callWithAsyncErrorHandling()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/errorHandling.ts#L70-L110)、
[DOM event invoker v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/modules/events.ts#L95-L150)、
[异步事件官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/errorHandling.spec.ts#L427-L499)。

### 7. Suspense 没有 error slot，fallback 只表示等待

`<Suspense>` 只有 `#default` 与 `#fallback`，没有 `#error`。异步 setup 或可挂起异步组件 reject 时，
错误仍沿父组件错误链传播；应在 Suspense 的父组件放置错误边界，而不是让 loading fallback 同时
承担失败状态。

```vue
<ErrorBoundary>
  <Suspense>
    <AsyncReport />
    <template #fallback>正在加载...</template>
  </Suspense>
</ErrorBoundary>
```

上一课负责 pending / resolved 与 timeout，本课只复用职责结论，不再次实现 Suspense Demo。

来源：[Suspense 错误处理](https://cn.vuejs.org/guide/built-ins/suspense.html#error-handling)、
[Suspense 内置组件 API](https://cn.vuejs.org/api/built-in-components.html#suspense)、
[Suspense loader reject 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiAsyncComponent.spec.ts#L583-L609)。

### 8. `defineAsyncComponent().onError` 只控制 loader 的 retry / fail

异步组件高级选项的 `onError(error, retry, fail, attempts)` 位于 loader Promise 的 reject 分支。
调用 `retry()` 会清除当前 pending request、增加重试计数并再次调用同一个 loader；调用 `fail()` 才把
该 loader 错误继续 reject。它不捕获已加载组件后代的 render、事件、生命周期或 watcher 错误，
也不会为任意业务请求提供通用重试。

```ts
const AsyncReport = defineAsyncComponent({
  loader: () => import('./ReportPanel.vue'),
  onError(error, retry, fail, attempts) {
    if (isTransientChunkError(error) && attempts <= 2) retry()
    else fail()
  },
})
```

课程应把 loader 重试和错误边界重置分开：loader retry 重新取得组件定义；边界 reset 只移除失败
fallback 并重新挂载已知子树。业务操作 retry 则必须重新执行那一个明确操作，三者不能用一个
“重试所有错误”按钮混在一起。

来源：[`AsyncComponentOptions` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L22-L42)、
[`load()` retry / fail v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L55-L117)、
[retry 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiAsyncComponent.spec.ts#L611-L742)。

### 9. `warnHandler` 与错误链是两条通道

`app.config.warnHandler(msg, instance, trace)` 只处理 Vue 运行时警告。它在生产构建中被忽略，官方
建议只在调试期间用于聚焦特定警告，不能拿来捕获异常、替代 `errorHandler` 或长期隐藏未修复警告。

`app.config.throwUnhandledErrorInProduction` 从 Vue 3.5 起可用，默认 `false`。默认情况下，末端未处理
错误在开发环境抛出，在生产环境只 `console.error`；设为 `true` 才在生产环境也抛出。该开关只作用于
没有被局部 `false` 截断、也没有被应用 `errorHandler` 消费的末端错误，不会强制重新抛出已经处理的
错误。

课程和测试不得用开发环境 console 行为推断生产监控已经完整，也不得把 `warnHandler` 叫作错误
边界。

来源：[应用实例 API](https://cn.vuejs.org/api/application.html#app-config-warnhandler)、
[`throwUnhandledErrorInProduction`](https://cn.vuejs.org/api/application.html#app-config-throwunhandlederrorinproduction)、
[`logError()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/errorHandling.ts#L157-L184)。

### 10. 状态、恢复、重试与上报必须分属明确 owner

| 职责 | 推荐 owner | 本课必须说明的边界 |
| --- | --- | --- |
| 错误状态与 fallback | 最接近失败子树的组件边界 | 捕获后切走原始失败后代，不把堆栈直接展示给用户 |
| 重置 / 恢复 | 持有子树身份与安全初始状态的边界 | 清除错误、恢复安全输入、改变 key 重新挂载；不承诺根因已经修复 |
| 操作重试 | 发起该操作的 composable、store 或 loader | 只重试明确且可重复的操作；处理并发、取消和幂等属于该操作 owner |
| 错误上报 | 应用级 `errorHandler` 或单一共享 reporter | 统一上下文、去重与脱敏；`false` 会阻止默认应用级上报 |

“已捕获”不等于“已恢复”，“已显示 fallback”不等于“可以重试”，“重置子树”也不等于“重新发送
网络请求”。本课 Demo 只演示本地渲染错误的 fallback 与安全重置，不制造网络失败，不暗示任意错误
都可以自动重试。

### 11. SSR 会运行错误捕获链，但输出和恢复边界不同

不能把 `onErrorCaptured()` 写成“SSR 不调用”。它在 `apiLifecycle.ts` 中直接通过 `injectHook()` 注册，
不走那些在 SSR setup 中被跳过的挂载/更新生命周期工厂。Vue 3.5.40 server renderer 官方测试证明：

- 后代 async setup rejection 会进入父级 `errorCaptured` 和应用 `errorHandler`。
- `onServerPrefetch()` 抛错可由父级 `onErrorCaptured()` 捕获并用 `false` 截断。
- SSR Suspense 渲染 default 分支，不渲染客户端等待用的 fallback；reject 后的输出取决于剩余可渲染
  子树，不存在客户端原地按钮重置。
- 未处理的同步服务端渲染错误可以让 `renderToString()` Promise reject；生产服务是否抛出还要结合
  `throwUnhandledErrorInProduction` 与服务端请求管线设计。

因此错误页面、HTTP 状态、日志关联、流式响应是否已发送和请求级降级都属于 SSR 框架/服务端管线，
不能由本仓库 Vite SPA Demo 证明。SSR / Hydration 课程必须另建真实 server renderer 反馈环。

来源：[`onErrorCaptured()` 注册 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts#L105-L116)、
[SSR async setup 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/render.spec.ts#L916-L949)、
[SSR prefetch 与 async setup 错误测试](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/render.spec.ts#L1162-L1229)、
[SSR Suspense 官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/ssrSuspense.spec.ts#L19-L47)。

## 源码推导

### 1. 错误链从触发实例的父组件开始

`handleError(err, instance, type)` 读取 `instance.parent`，逐层访问 `cur.ec`。这直接推出两个课程
结论：边界不能捕获自身错误；嵌套边界的公开顺序是内层到外层。Demo 只记录边界名称与当前 round，
不读取 `ec`、parent 指针或内部实例。

### 2. `false` 是同步返回值协议

每个已注册 hook 的返回值当场与 `false` 严格比较。只有命中才立即 `return`；否则遍历继续，最后
调用 app handler。由此可知，`async onErrorCaptured()` 返回的 Promise 即使以后解析成 `false`，也不能
倒流并撤销已经发生的外层传播。

### 3. Promise 是否被接住取决于调用所有权

`callWithAsyncErrorHandling()` 只检查用户函数本次返回的值。DOM invoker 把事件 handler 的返回值
交给它，生命周期 wrapper 也一样。timer 或 `void task()` 已把后续工作移出当前调用返回值，因此必须
由真实 owner 处理 rejection。

### 4. 捕获钩子抛错不会替代原错误

注册到 `ec` 的 hook 本身经过生命周期错误包装。它抛出的错误以 `ERROR_CAPTURED` 类型再次进入
`handleError()`；原始 `handleError()` 随后仍继续遍历。这解释了官方测试为什么外层能依次看到原错误
和新的 `errorCaptured hook` 错误。

### 5. 异步组件 retry 是 loader 私有状态机

`apiAsyncComponent.ts` 用 `pendingRequest` 合并同一时刻的加载，并在 `retry()` 中先清空它再调用
`load()`。`userOnError` 只包住 loader 的 `.catch()`，源码路径从未注册为通用后代捕获器。因此本课只
把它列为相邻职责，不把它塞进嵌套错误边界 Demo。

### 6. 生产抛错开关位于错误链末端

`handleError()` 先走父级 hooks，再走 app handler，最后才调用 `logError()`；
`throwUnhandledErrorInProduction` 只传给最后一步。这解释了为什么返回 `false` 或配置 app handler 后，
不能再期待该开关把同一个错误抛给宿主环境。

## 可验证学习目标

完成本课后，学习者应能：

1. 列出 Vue 组件错误链覆盖的主要来源，并解释边界为何只能捕获后代错误。
2. 读懂 `(err, instance, info)`，避免依赖生产环境 `info` 的完整描述或内部实例字段。
3. 预测嵌套边界从内到外的调用顺序，并说明同步返回 `false` 会截断哪些接收者。
4. 用响应式错误状态切换到安全 fallback，避免再次渲染原始失败后代。
5. 区分捕获、fallback、重置、操作重试与上报，给每项职责选择明确 owner。
6. 判断返回给 Vue 的 Promise 与 timer / 未返回 Promise 是否进入组件错误链。
7. 解释 Suspense 没有 error slot，以及 async component `onError` 只控制 loader。
8. 区分 `errorHandler`、`warnHandler` 和生产未处理错误开关，不从 SPA Demo 外推 SSR 行为。

## 推荐正文编排

课程按从新手到高级的顺序推进：

1. **可观察问题**：一个后代 render 抛错时，为什么局部区域和全局监控需要不同 owner。
2. **捕获来源**：渲染、事件、生命周期、setup、watcher、指令与 Transition。
3. **第一个局部边界**：`onErrorCaptured()` 三参数，后代限制与安全 fallback。
4. **嵌套传播**：内层先执行、外层后执行，默认仍到应用级处理器。
5. **`false` 协议**：何时消费错误，何时继续集中上报，为什么必须同步返回。
6. **恢复模型**：清除错误状态、恢复安全输入、改变 key 重建失败子树。
7. **异步调用所有权**：返回 Promise、脱链 Promise 和 timer 的对照。
8. **等待与失败分离**：Suspense fallback 不是错误状态，没有 `#error`。
9. **重试分层**：边界 reset、业务操作 retry 与 async loader retry。
10. **应用级汇聚**：`app.config.errorHandler` 上报、脱敏和去重。
11. **开发与生产**：`warnHandler`、生产 error code、末端 throw 开关。
12. **高级边界**：钩子自身抛错、SSR 捕获与本 SPA 证据限制。
13. **Demo、练习与回顾**：只验证公开 DOM、捕获顺序、传播和恢复状态。

## 易错点候选

课程固定采用以下 8 项；每项都有错误写法、正确方向与可观察后果，不为数量扩写相似条目。

### 1. 让边界捕获自己的 render 错误

**错误：** 在同一个组件注册 `onErrorCaptured()`，又让这个组件自己的 render / template 抛错。

**正确：** 把可能失败的内容放进边界的子组件或插槽，边界自身只渲染安全外壳和 fallback。

**后果：** `handleError()` 从触发实例的 parent 开始，本组件钩子不会收到自身错误。

### 2. 捕获后仍渲染原始失败后代

**错误：** 只显示一条错误提示，同时保留抛错子树。

**正确：** 错误态与正常子树互斥，捕获后完全切换到不依赖失败数据的 fallback。

**后果：** 状态更新触发再次 render，同一错误循环出现，页面无法稳定恢复。

### 3. 返回 `false` 后仍期待外层与应用处理器收到错误

**错误：** 内层 `return false`，同时断言外层日志和 `app.config.errorHandler` 被调用。

**正确：** 需要集中上报就保持 `void` 传播；确实要本地消费时才返回 `false`，并明确上报归属。

**后果：** 外层和应用处理器都不会收到这个错误，生产监控出现静默缺口。

### 4. 让捕获钩子异步返回 `false` 或在里面再次抛错

**错误：** `onErrorCaptured(async () => false)`，或用 `throw error` 表示“继续传播”。

**正确：** 捕获钩子保持同步；不返回就是继续传播，返回字面量 `false` 才截断。钩子自身只做可靠的
状态更新和最小记录。

**后果：** Promise 不等于 `false`，外层已经被调用；再次 throw 还会产生第二条
`errorCaptured hook` 错误。

### 5. 认为 timer 和任意 Promise 都会被 Vue 捕获

**错误：** 在事件中 `void save()` 或 `setTimeout(() => { throw error })`，期待组件边界接住。

**正确：** 需要 Vue wrapper 管理时直接返回 Promise；脱链任务在创建它的 owner 处处理错误。

**后果：** rejection / throw 进入宿主环境的 `unhandledrejection` 或 `error`，而不是本次组件错误链。

### 6. 把 Suspense fallback 或不存在的 `#error` 当错误边界

**错误：** loading fallback 同时显示失败，或编写 `<template #error>`。

**正确：** Suspense 只协调等待；在其父组件放置错误边界，用独立状态渲染失败 fallback。

**后果：** reject 后不会进入预想的 error slot，等待态和失败态互相污染。

### 7. 用 `defineAsyncComponent().onError` 捕获所有后代错误

**错误：** 配置 loader `onError` 后，期待已加载组件的 render、点击或 watcher 错误也触发 retry。

**正确：** `onError` 只决定 loader reject 后调用 `retry()` 还是 `fail()`；后代运行错误仍用组件边界。

**后果：** 运行错误没有重试入口，或错误地重复下载已经加载成功的组件代码。

### 8. 用 `warnHandler` 或开发 console 代替生产错误策略

**错误：** 把 warning 当 exception，上线保留 warning filter，并假设开发环境抛出的错误在生产也会
同样抛出。

**正确：** warning 只用于开发诊断；异常走 error handler。生产是否让末端未处理错误抛出由
`throwUnhandledErrorInProduction` 明确决定，并由宿主监控配套验证。

**后果：** 生产 warning handler 根本不运行，未处理错误可能只写 console，监控和用户体验都没有
可靠契约。

## 可实施 Demo 交互契约

### 定位

唯一 Demo 是“嵌套错误边界实验台”。它用一个确定性的后代 render 错误验证：内层先捕获、传播时
外层随后捕获、内层返回 `false` 时停止、错误后切到 fallback，以及重置后以新 key 恢复安全子树。

Demo 不修改 `app.config`，不创建 rejected loader、timer、未处理 Promise、钩子自身错误或 SSR 场景；
这些只在正文通过官方源码与测试说明。这样两条交互路径都必须保持 console error、console warning
和 pageerror 为零。

### 组件层级

```text
OuterBoundary（固定 return false，实验的最终兜底）
└─ InnerBoundary（按模式返回 void 或 false，并拥有 fallback）
   └─ FaultyPanel（提供 render 错误与返回的异步事件拒绝）
```

- `FaultyPanel` 只负责正常内容、确定性 render error 和返回给 Vue 的异步事件拒绝，不拥有恢复按钮。
- `InnerBoundary` 保存自己的错误状态和 fallback；它永远不在错误态渲染 `FaultyPanel`。
- `OuterBoundary` 记录传播到外层的错误、显示外层 fallback，并固定返回 `false`。
- 实验台根组件保存 round、子树 key、传播模式和捕获日志，不读取任何 Vue 私有字段。

### 固定状态

- `stopAtInner`：初始 `true`；关闭后错误继续传播到外层。
- `round`：初始 `1`，同时作为完整边界子树的 key，每次成功重置后加一。
- `shouldThrow`：故障后代的本地状态，初始 `false`，触发渲染错误时变为 `true`。
- `capturedError`：由每层边界独立持有；非空时渲染该层 fallback。
- `captureLog`：只记录 `round`、`inner | outer`、公开 `info` 分类和固定演示消息，不记录实例、uid、
  VNode、stack 或用户数据。

### 固定交互

1. 初次进入显示“第 1 轮内容正常”，模式为“内层边界停止传播”，日志为空。
2. 用户用键盘激活“触发渲染错误”。`FaultyPanel` render 抛出固定错误；内层写日志并显示
   fallback，再同步返回 `false`。本轮日志只能出现 `inner`。
3. 用户在 fallback 中激活“重置边界”。实现增加 round / key，完整替换旧边界与失败后代；页面显示
   “第 2 轮内容正常”，旧失败实例不再渲染，捕获日志可保留用于对照。
4. 用户关闭“内层停止传播”，再激活“触发异步事件拒绝”。事件处理器返回的 Promise 拒绝进入错误
   链，日志顺序必须恰好是 `inner -> outer`，并显示外层 fallback。
5. 再次重置后显示下一轮正常内容，证明 fallback 可退出且新的安全子树已挂载。
6. 模式不能在错误发生后偷偷改变当前 round 的传播结果；要比较另一模式，必须先重置再触发。

### 稳定公开契约

- Demo 根：`.error-boundary-lab-demo`。
- 模式控件：`data-testid="stop-at-inner"`，暴露原生 checkbox 选中状态。
- 触发命令：`data-testid="trigger-render-error"` 与 `data-testid="trigger-async-error"`。
- fallback：`data-testid="error-boundary-fallback"`，并用 `data-boundary` 标记层级。
- 重置命令：`data-testid="reset-error-boundary"`。
- 正常内容：`data-testid="healthy-boundary-content"`，文字包含当前 round。
- 日志项：`data-round`、`data-boundary="inner|outer"`，同一 round 按 DOM 顺序表达捕获顺序。
- 当前模式可以使用 `role="status"`；日志只保留可读列表，避免与 fallback 的 alert 重复播报。

### 实现约束

- 恰好一个公开 Demo ID；内部 helper 组件不注册第二个 Demo。
- 所有新增方法定义上方写规范、简洁的中文注释。
- 捕获钩子保持同步，内层传播模式返回 `undefined`，停止模式返回字面量 `false`；外层始终
  `return false`。
- 内层先设置 `capturedError`，错误态分支不得继续渲染原始后代。
- 重置顺序必须先让失败条件恢复为安全值，再清错并改变 key，避免重置本身重新触发错误。
- 不读取 `instance.uid`、`instance.parent`、`vnode`、`ec`、renderer 锚点或其他私有字段。
- 不调用 `console.error` / `console.warn`，不修改 `app.config`，不添加 window error listener。
- 样式只使用 flex、margin 和 padding，不使用 `grid`、`gap`、`row-gap` 或 `column-gap`。
- 控件在 390px 和 200% 文本下不截断、不重叠、不产生页面横向滚动；每个可点击控件双轴至少
  44px。
- Demo 不依赖动画时长；若沿用页面已有动效，`prefers-reduced-motion: reduce` 下业务状态、焦点和
  DOM 终态完全相同。

### 最小 E2E 契约

只新增一条长路径测试，不拆成大量相似用例：

1. 从上一课“异步组件与 Suspense”页面点击“下一篇：错误处理”，确认标题、唯一 Demo、
   “上一篇：异步组件与 Suspense”，并确认没有可点击的下一篇课程。
2. 使用键盘 `Tab` 导航模式控件和命令；使用 `Enter` / `Space` 激活，不依赖鼠标专属行为，焦点
   指示始终可见。
3. 在默认停止模式触发 render error，等待 fallback 可见，断言当前 round 只有 `inner`，并确认正常
   失败后代不再可见。
4. 键盘激活重置，等待新的正常 round 可见，断言 fallback 消失且页面仍可操作。
5. 关闭内层停止模式，触发返回的异步事件拒绝，断言当前 round 严格为 `inner -> outer`；再次重置并
   确认恢复。
6. 在 390 × 844 视口复跑完整路径，逐个检查控件宽高都至少 44px，页面无横向滚动。
7. 对 Demo 标题、说明、模式、按钮、fallback、正常内容和日志注入 200% 文本样式后复跑，断言文本
   不溢出、不截断、不相互遮挡。
8. 模拟 `prefers-reduced-motion: reduce` 并 reload，再复跑传播、停止与恢复路径，断言行为和 DOM
   终态不变。
9. 全程收集 console error、console warning 与 pageerror，最终三个集合均为空。
10. 所有等待使用 locator 可见性、文本、数量或 `expect.poll()` 的公开状态；禁止固定
    `waitForTimeout()`。

## 内容与导航建议

- prerequisite 固定为 `vue.core.learn.advanced.async-components-suspense`，且只保留这一个直接前置。
- related 建议固定为：
  1. `vue.core.learn.advanced.async-components-suspense`
  2. `vue.core.reference.composition.lifecycle`
  3. `vue.core.reference.application.create-app`
  4. `vue.core.reference.application.define-async-component`
- Suspense 从当前 available 末篇改为可导航到本课；本课发布后成为新的 available 末篇。
- manifest 中紧随其后的 `vue.core.learn.advanced.custom-directives` 继续保持 `planned`，因此本课不产生
  可点击的下一篇链接，也不把它加入 related。
- 三条 Vue 学习路线总量精确从 `22 available / 38 planned` 更新为
  `23 available / 37 planned`，总规划数保持 60。

## 明确停止边界

本调研只为“错误处理”课程提供实施契约。后续实施达到下列条件后立即停止：

- 只新增一篇课程、一个公开 Demo 和一条最小 E2E，并只更新上线该课必需的 manifest、Demo 注册、
  邻接与精确测试。
- 禁止修改任何 Reference、Reference Demo、Reference pitfalls、router、schema、registry glob、
  全局样式或其他课程正文。
- 不进入 `vue.core.learn.advanced.custom-directives`，不改变其 `planned` 状态。
- 不实现通用错误监控 SDK、浏览器 `error` / `unhandledrejection` 汇聚、网络重试器、路由错误页、
  loader 重试 Demo、Nuxt、streaming SSR、HTTP 状态映射或 hydration 实验。
- 不修改 `app.config` 来完成 Demo，不制造 console error、console warning 或 pageerror 作为教学证据。
- 不把本地 Vite SPA 的捕获、fallback 和重置结果外推为 SSR / hydration 保证。

## 验收清单

1. 课程 ID、唯一前置、70 分钟、唯一 Demo ID 和恰好 8 个易错点均与冻结表一致。
2. `onErrorCaptured()` 的来源、三参数、后代限制、由内到外顺序和严格同步 `false` 语义准确。
3. 明确写出捕获钩子自身抛错会产生新错误，原错误不会因此被替代。
4. 返回给 Vue 的 Promise 与 timer / `void` / 未返回 Promise 的边界可回到 v3.5.40 源码。
5. Suspense 没有 error slot；`defineAsyncComponent().onError` 只处理 loader retry / fail。
6. `errorHandler`、`warnHandler` 与 `throwUnhandledErrorInProduction` 的职责没有混写。
7. 状态、fallback、重置、操作重试与上报各有明确 owner，fallback 不重渲染失败后代。
8. SSR 明确写为会运行错误捕获链，但其管线、输出和恢复不由 SPA Demo 证明。
9. Demo 外层固定返回 `false`；传播模式内层返回 `void`，停止模式内层返回 `false`，两条路径都无
   console / pageerror。
10. E2E 覆盖 Suspense 下一篇入口、390 × 844、键盘、44px、200% 文本、reduced motion、传播、
    截断与恢复，且没有固定等待。
11. 三条路线精确更新为 `23 available / 37 planned`，`custom-directives` 仍为 `planned` 且不可点击。
12. 调研代理只写入 `docs/research/vue-error-handling.md`；实施达到本课契约后停止。
