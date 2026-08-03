# Vue Core API 第 33 批：Options 生命周期官方调研

> 核对日期：2026-08-03  
> 版本基线：`vue@3.5.40`  
> 范围：仅 `vue/core/reference` 的 Options 生命周期 14 项，不进入第 34 批

## 冻结结论

本批建立一篇主题合并页，不新增 Demo：

| 官方页面 | 站内 ID | collection | 标题 |
| --- | --- | --- | --- |
| [生命周期选项](https://cn.vuejs.org/api/options-lifecycle.html) | `vue.core.reference.options-api.lifecycle-options` | `options-api` | `Options API：生命周期选项` |

页面按创建、挂载、更新、卸载、错误、渲染调试、KeepAlive 和 SSR 组织。14 个官方条目各自保留唯一 heading，Composition API 页面只作为关联参考，不替代 Options API 的 `this`、选项合并与调用时机说明。

## 条目与锚点映射

| 索引条目 | heading | anchor | 环境 |
| --- | --- | --- | --- |
| `options-lifecycle.before-create` | `beforeCreate` | `beforecreate` | 浏览器与 SSR |
| `options-lifecycle.created` | `created` | `created` | 浏览器与 SSR |
| `options-lifecycle.before-mount` | `beforeMount` | `beforemount` | 仅客户端 |
| `options-lifecycle.mounted` | `mounted` | `mounted` | 仅客户端 |
| `options-lifecycle.before-update` | `beforeUpdate` | `beforeupdate` | 仅客户端 |
| `options-lifecycle.updated` | `updated` | `updated` | 仅客户端 |
| `options-lifecycle.before-unmount` | `beforeUnmount` | `beforeunmount` | 仅客户端 |
| `options-lifecycle.unmounted` | `unmounted` | `unmounted` | 仅客户端 |
| `options-lifecycle.error-captured` | `errorCaptured` | `errorcaptured` | 客户端后代错误 |
| `options-lifecycle.render-tracked` | `renderTracked` | `rendertracked` | 仅开发环境客户端 |
| `options-lifecycle.render-triggered` | `renderTriggered` | `rendertriggered` | 仅开发环境客户端 |
| `options-lifecycle.activated` | `activated` | `activated` | KeepAlive 客户端 |
| `options-lifecycle.deactivated` | `deactivated` | `deactivated` | KeepAlive 客户端 |
| `options-lifecycle.server-prefetch` | `serverPrefetch` | `serverprefetch` | 仅 SSR |

## 官方来源

### 文档

- [Vue 中文官网：生命周期选项](https://cn.vuejs.org/api/options-lifecycle.html)
- [Vue 中文官网：组合式 API 生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle.html)
- [Vue 中文官网：生命周期指南](https://cn.vuejs.org/guide/essentials/lifecycle.html)
- [Vue 中文官网：KeepAlive 缓存实例生命周期](https://cn.vuejs.org/guide/built-ins/keep-alive.html#lifecycle-of-cached-instance)
- [Vue 中文官网：SSR 组件生命周期钩子](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)
- [Vue 中文官网：响应式调试](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#component-debugging-hooks)
- [Vue 中文官网：生产环境错误代码](https://cn.vuejs.org/error-reference/)

### Vue 3.5.40 固定源码

- [`componentOptions.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts)：Options 解构、状态初始化顺序、公开实例绑定和钩子注册。
- [`apiLifecycle.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiLifecycle.ts)：钩子包装、实例上下文和依赖追踪暂停。
- [`renderer.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/renderer.ts)：挂载、更新、卸载及父子调用顺序。
- [`errorHandling.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/errorHandling.ts)：后代错误逐级传播和应用级处理。
- [`KeepAlive.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/components/KeepAlive.ts)：缓存树激活、停用及后代钩子注入。
- [`server-renderer`](https://github.com/vuejs/core/tree/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/server-renderer/src)：SSR 预取 Promise 的收集与等待。

外部常见错误候选通过 Tavily 检索 Vue 官方文档、Vue 源码与公开问答；正文只采用能由上述官方来源或固定源码确认的结论。

## 类型基线

```ts
interface ComponentOptions {
  beforeCreate?(this: ComponentPublicInstance): void
  created?(this: ComponentPublicInstance): void
  beforeMount?(this: ComponentPublicInstance): void
  mounted?(this: ComponentPublicInstance): void
  beforeUpdate?(this: ComponentPublicInstance): void
  updated?(this: ComponentPublicInstance): void
  beforeUnmount?(this: ComponentPublicInstance): void
  unmounted?(this: ComponentPublicInstance): void
  errorCaptured?(
    this: ComponentPublicInstance,
    err: unknown,
    instance: ComponentPublicInstance | null,
    info: string,
  ): boolean | void
  renderTracked?(this: ComponentPublicInstance, event: DebuggerEvent): void
  renderTriggered?(this: ComponentPublicInstance, event: DebuggerEvent): void
  activated?(this: ComponentPublicInstance): void
  deactivated?(this: ComponentPublicInstance): void
  serverPrefetch?(this: ComponentPublicInstance): Promise<unknown>
}
```

Options 钩子由运行时绑定到组件公共实例。正文示例必须使用方法简写或普通函数；箭头函数无法获得该 `this`。

## 分组行为

### 创建阶段

`setup()` 在所有 Options 生命周期钩子之前执行。`beforeCreate` 在实例初始化和 props 解析后、`data`、computed、methods 与 watch 应用前调用；它不适合读取这些 Options 状态。`created` 在状态相关选项处理完成后调用，可以读取实例状态，但挂载尚未开始，`$el` 不可用。

SSR 会运行 `beforeCreate` 和 `created`。这两个钩子中的全局副作用不会自动清理，必须避免跨请求计时器、订阅或单例状态污染。

### 挂载阶段

`beforeMount` 发生在第一次渲染前，响应式状态已就绪，但 DOM 尚未创建。`mounted` 发生在组件 DOM 树创建并插入父容器、所有同步子组件挂载之后；它不等待异步组件或 `<Suspense>` 树，而且只有根容器已经位于文档中时，才能保证组件节点也在 `document` 中。

父子组件通常按“父 beforeMount -> 子挂载 -> 子 mounted -> 父 mounted”完成同步挂载。两者都不会在 SSR 执行。

### 更新阶段

`beforeUpdate` 在响应式状态已经改变、DOM patch 尚未执行时调用，适合读取更新前 DOM；Vue 官方明确允许在这里修改组件状态。`updated` 在组件 DOM 更新后调用，并且子组件的 updated 先于父组件。多个状态变化可能被批处理为一次更新，因此它不能对应某个特定字段的一次变化；需要等待某次明确修改的 DOM 结果时使用 `nextTick()`。

不要在 `updated` 中无条件修改响应式状态，否则会再次排队更新并形成循环。两者都不会在 SSR 执行。

### 卸载阶段

`beforeUnmount` 调用时组件实例仍完整可用，适合在 DOM 和子树移除前停止依赖实例的外部工作。`unmounted` 调用时，所有子组件已经卸载，组件渲染作用和在 `setup()` 同步创建的 computed/watch 已停止；手动建立的计时器、DOM 监听器、订阅和服务器连接仍需显式清理。

两者都不会在 SSR 执行。SSR 创建阶段不应启动只能依赖卸载钩子清理的长期副作用。

### 错误边界

`errorCaptured` 只捕获后代组件向上传播的错误，不捕获钩子所在组件自身的错误。它接收错误、触发错误的公开实例和来源信息；生产环境的 `info` 是缩短代码。多个边界从近到远依次调用，默认仍会到达 `app.config.errorHandler`；返回 `false` 才会停止后续传播。

错误回退状态不能再次渲染原本抛错的内容。若 `errorCaptured` 自己抛错，新旧两个错误都会交给应用级处理器。

### 渲染调试

`renderTracked` 在组件渲染作用追踪到响应式依赖时调用；`renderTriggered` 在该依赖变化并触发组件重新渲染时调用。两者接收包含 `effect`、`target`、`type`、`key` 及可能的新旧值的 `DebuggerEvent`。

它们只在开发环境执行，也不会在 SSR 执行。只能用于定位过度依赖或意外更新，不能承载业务状态、日志完整性或生产监控。

### KeepAlive

`activated` 在缓存树首次挂载以及每次重新插入 DOM 后调用；`deactivated` 在移入缓存以及最终卸载时调用。钩子也会作用于缓存根下的后代组件。停用只移动 DOM 并保留实例，不等于卸载，响应式作用仍可能运行。

需要可见时才工作的资源应在 activated 启动、deactivated 暂停；只在永久销毁时释放的资源仍应在 unmounted 兜底。两个钩子都不会在 SSR 执行。

### SSR

`serverPrefetch` 只在服务端执行。返回 Promise 时，服务端渲染器会在渲染该组件前等待它完成，因此适合请求本次 SSR 输出必需的数据。客户端直接创建同一组件时它不会执行，应在 mounted 中提供缺失数据的客户端回退；SSR 获取的状态还需进入可序列化的 hydration 状态，避免客户端重复请求。

## 结构化易错点候选

正文保留 9 项，不凑满 10 项：

1. **用箭头函数声明依赖 `this` 的 Options 钩子**：词法 `this` 无法被运行时绑定。
2. **在 created 或 beforeMount 读取 DOM**：此时 `$el` 或模板引用尚未建立。
3. **把 mounted 当成“整个页面和全部异步后代已就绪”**：它只保证同步子树和父容器插入。
4. **在 updated 无条件改写响应式状态**：会形成更新循环；具体字段副作用使用 watch。
5. **只依赖 unmounted 清理 KeepAlive 页面资源**：停用不会卸载，资源会在缓存期间继续运行。
6. **把 errorCaptured 当作 try/catch 或本组件错误处理器**：它只处理后代传播，返回 `false` 才停止上冒。
7. **错误回退继续渲染原始故障子树**：状态更新后再次触发同一错误，形成渲染循环。
8. **把 renderTracked/renderTriggered 用于生产业务**：生产构建和 SSR 不调用调试钩子。
9. **只在 serverPrefetch 请求数据**：客户端直达没有数据；反之无 hydration 状态会重复请求。

每项正文必须包含原因、可观察后果、错误示范和正确示范。

## 源码推导与适用场景

1. `applyOptions()` 先同步调用 `beforeCreate`，随后依次应用 inject、methods、data、computed、watch、provide，再调用 `created`；这解释了两个创建钩子可访问能力的差异。
2. 其余 Options 钩子通过组合式生命周期注册函数接入，并绑定公共实例；Options 与 Composition 只是声明入口不同，最终进入同一实例钩子数组。
3. `apiLifecycle.ts` 调用用户钩子时暂停响应式依赖追踪并设置当前实例，避免钩子内部读取意外成为正在运行的渲染依赖。
4. renderer 将 mounted/updated/unmounted 排入渲染后队列；同步子树的 mounted 先于父级，updated 也从子到父，不能把跨组件顺序当成单组件局部顺序。
5. error handling 从出错实例的父级开始向上遍历 `errorCaptured` 数组；任何钩子返回 `false` 即停止，否则最终交给应用级处理器。
6. 渲染调试钩子挂在组件 render effect 的 `onTrack/onTrigger` 上，并由开发环境分支控制，因此适合依赖图诊断而不是业务回调。
7. KeepAlive 停用通过 renderer move 保存实例，并把激活/停用钩子注入缓存根；缓存期间不执行普通卸载流程。
8. 服务端渲染器收集 `serverPrefetch` 返回的 Promise 并等待；普通客户端 mounted/update/unmount 钩子不参与 SSR。

## 实施验收

1. 只新增 `lifecycle-options` 一篇 entry，不新增 Demo。
2. `anchors` 逐字包含 14 个 API heading，索引通过真实 `headingId()` 生成上述 anchor。
3. 每个 API 有时机、环境、最小示例或分组示例，并明确对应 Composition API 入口。
4. 保留 9 个结构化易错点和 8 条源码推导；内容质量优先，不复制 Composition 页面整段正文。
5. 14 项只有在页面与 heading 可达后才能切为 `available`；第 34 批 8 项保持 `planned` 且没有 target。
6. 预期覆盖计数为 `115 available / 91 planned / 206 total`，Options API 为 `25 / 21`。
7. 运行单个 manifest 完整性断言、全量质量 Gate，并以 `390 × 844` 验证状态页到生命周期页代表路径、14 个 heading、滚动归零、无横向溢出和控制台错误。
