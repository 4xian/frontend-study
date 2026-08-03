# Vue 全局 API 易错使用点调研

> 调研日期：2026-07-29
>
> 适用基线：Vue 3.5.40
>
> 对应范围：阶段 4 第 5 批 `global-api`，仅覆盖 `createApp()`、`nextTick()`、
> `defineComponent()`、`defineAsyncComponent()`。
>
> 资料范围：Vue 官方中英文文档、Vue 官方 docs 仓库原始 Markdown、
> `vuejs/core` 的 `v3.5.40` 固定标签源码及官方测试。Tavily 的四类限定检索均返回
> plan usage limit，因此按仓库规则回退到直接读取上述一手资料；本文不引用社区文章、
> 搜索摘要或未合并提案。

```yaml
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
```

下列错误代码用于复现错误直觉，正确代码给出最小替换路径。每点均记录原因、
可观察后果和直接来源；没有明确行为后果的风格偏好不计入易错点。

## 版本边界

| 能力 | 最低版本或基线说明 |
| --- | --- |
| `defineComponent()` 对象签名 | Vue 3 基础能力 |
| `defineComponent()` 函数签名 | 仅 Vue 3.3+ |
| `app.onUnmount()` | 仅 Vue 3.5+ |
| `app.config.idPrefix` | 仅 Vue 3.5+ |
| `app.config.throwUnhandledErrorInProduction` | 仅 Vue 3.5+ |
| 异步组件懒水合策略 `hydrate` | 仅 Vue 3.5+，且只用于 SSR 水合 |

以上版本信息来自 [Vue 应用实例 API](https://cn.vuejs.org/api/application.html)、
[Vue 通用 API](https://cn.vuejs.org/api/general.html#definecomponent) 和
[Vue 异步组件：懒水合](https://cn.vuejs.org/guide/components/async.html#lazy-hydration)，并以
[`vuejs/core@v3.5.40` 的应用配置类型](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts#L93-L169)
及
[`AsyncComponentOptions`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L28-L42)
交叉核验。

## `createApp()`

### 1. 在 `mount()` 之后继续链式安装插件或注册资源

- **错误假设 / 原因：** 把 `mount()` 当成与 `use()`、`component()` 相同的链式方法。
  实际上资源注册和应用配置应在挂载前完成；`mount()` 返回的是根组件公开实例，
  不是应用实例。
- **可观察后果：** `createApp(App).mount('#app').use(router)` 会因根组件实例没有
  `use()` 而报错；晚注册的插件、全局组件或配置也不会参与已经完成的首次挂载。
- **错误代码：**

```ts
createApp(App).mount('#app').use(router)
```

- **正确代码：**

```ts
const app = createApp(App)

app.use(router)
app.component('AppButton', AppButton)
app.config.errorHandler = reportError
app.mount('#app')
```

- **直接来源：** [Vue 创建应用：挂载顺序与返回值](https://cn.vuejs.org/guide/essentials/application.html#mounting-the-app)、
  [Vue `app.mount()` API](https://cn.vuejs.org/api/application.html#app-mount)、
  [Vue 3.5.40 `mount()` 返回根组件实例](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts#L358-L418)

### 2. `unmount()` 后重新挂载同一个应用实例

- **错误假设 / 原因：** 认为卸载会把 app 恢复为“从未挂载”的状态。Vue 3.5.40 的
  `isMounted` 在首次挂载后保持为 `true`；`unmount()` 清理组件树，但不会把同一个 app
  变成可再次挂载的新实例。
- **可观察后果：** 第二次 `mount()` 在开发环境警告 `App has already been mounted`，
  新容器保持为空；即使中间调用过 `unmount()` 也一样。
- **错误代码：**

```ts
const app = createApp(App)

app.mount('#first-root')
app.unmount()
app.mount('#second-root')
```

- **正确代码：**

```ts
function createMyApp() {
  return createApp(App)
}

const firstApp = createMyApp()
firstApp.mount('#first-root')
firstApp.unmount()

createMyApp().mount('#second-root')
```

- **直接来源：** [Vue `app.mount()`：每个实例只能调用一次](https://cn.vuejs.org/api/application.html#app-mount)、
  [Vue 3.5.40 挂载状态与重挂警告](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts#L358-L418)、
  [Vue 3.5.40 官方重挂测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiCreateApp.spec.ts#L21-L53)

### 3. 把已有重要内容的元素直接作为挂载容器

- **错误假设 / 原因：** 认为 Vue 会保留容器原有子节点，并把容器元素本身接管为应用根节点。
  客户端 `createApp()` 挂载会先清空容器内容，再把根组件渲染到容器内部；容器本身不属于
  Vue 应用。
- **可观察后果：** 容器内原有提示、服务端输出或第三方节点在挂载时被移除；针对根组件
  生命周期或属性的预期也不能套到外层容器上。
- **错误代码：**

```html
<main id="app">
  <p>必须保留的服务端内容</p>
</main>
```

```ts
createApp(App).mount('#app')
```

- **正确代码：**

```html
<main>
  <p>必须保留的服务端内容</p>
  <div id="app"></div>
</main>
```

```ts
createApp(App).mount('#app')
```

- **直接来源：** [Vue 创建应用：根内容渲染在容器内部](https://cn.vuejs.org/guide/essentials/application.html#mounting-the-app)、
  [Vue `app.mount()` 的容器替换语义](https://cn.vuejs.org/api/application.html#app-mount)、
  [Vue 3.5.40 DOM 挂载前清空容器](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/index.ts#L112-L149)

### 4. 用新对象整体替换 `app.config`

- **错误假设 / 原因：** 把 `app.config` 当成普通可替换字段。Vue 只暴露原配置对象的
  getter；整体赋值的 setter 在开发环境警告并忽略新对象，正确方式是修改具体属性。
- **可观察后果：** 新的 `errorHandler`、`globalProperties` 等配置没有生效，开发控制台出现
  `app.config cannot be replaced` 警告。
- **错误代码：**

```ts
app.config = {
  errorHandler: reportError,
}
```

- **正确代码：**

```ts
app.config.errorHandler = reportError
app.config.globalProperties.$api = apiClient
```

- **直接来源：** [Vue `app.config`：挂载前修改属性](https://cn.vuejs.org/api/application.html#app-config)、
  [Vue 3.5.40 `config` getter 与只警告 setter](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts#L273-L293)

### 5. 认为一个 app 的“全局”资源会自动共享给另一个 app

- **错误假设 / 原因：** 把 `app.component()`、`app.provide()` 或 `app.config` 中的“全局”
  理解为浏览器页面全局。每次 `createApp()` 都创建独立的应用上下文，组件、指令、provide
  和配置只属于该实例。
- **可观察后果：** `app1` 中可用的组件或注入值在 `app2` 中解析失败；两个应用的
  `globalProperties` 和错误处理器也互不共享。
- **错误代码：**

```ts
const app1 = createApp(AdminRoot)
app1.component('AppButton', AppButton)
app1.mount('#admin')

const app2 = createApp(StorefrontRoot)
app2.mount('#storefront') // StorefrontRoot 中的 <AppButton> 无法解析
```

- **正确代码：**

```ts
function installSharedResources(app: App) {
  app.component('AppButton', AppButton)
  app.provide(apiKey, apiClient)
}

const app1 = createApp(AdminRoot)
installSharedResources(app1)
app1.mount('#admin')

const app2 = createApp(StorefrontRoot)
installSharedResources(app2)
app2.mount('#storefront')
```

- **直接来源：** [Vue 创建应用：多个应用实例各自隔离](https://cn.vuejs.org/guide/essentials/application.html#multiple-application-instances)、
  [Vue 3.5.40 每次创建独立上下文](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts#L224-L243)、
  [Vue 3.5.40 `createApp()` 建立新 context](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts#L253-L269)

## `nextTick()`

### 1. 调用 `nextTick()` 却不等待它，再立刻读取 DOM

- **错误假设 / 原因：** 把 `nextTick()` 当成同步刷新函数。它返回 Promise，或接收回调；
  仅仅调用但不 `await`、不注册回调，不会暂停后续同步代码。
- **可观察后果：** 读取到修改状态之前的文本、尺寸或节点数量，容易形成偶现的 DOM 断言失败。
- **错误代码：**

```ts
count.value++
nextTick()
console.log(counterElement.textContent) // 仍可能是旧值
```

- **正确代码：**

```ts
count.value++
await nextTick()
console.log(counterElement.textContent) // 已完成本轮 Vue DOM 更新
```

- **直接来源：** [Vue `nextTick()` API 与 await 示例](https://cn.vuejs.org/api/general.html#nexttick)、
  [Vue 3.5.40 `nextTick()` 返回调度 Promise](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/scheduler.ts#L50-L67)

### 2. 先等待 `nextTick()`，再修改状态并立即读取 DOM

- **错误假设 / 原因：** 认为一次 `await nextTick()` 能覆盖它之后才产生的更新。
  `nextTick()` 只等待调用时已经排入或正在冲刷的 Vue 更新；后续状态修改会安排新的冲刷。
- **可观察后果：** `await` 已经结束，但状态修改后的 DOM 仍是旧值。
- **错误代码：**

```ts
await nextTick()
count.value++
console.log(counterElement.textContent)
```

- **正确代码：**

```ts
count.value++
await nextTick()
console.log(counterElement.textContent)
```

- **直接来源：** [Vue `nextTick()`：在状态修改后等待更新](https://cn.vuejs.org/api/general.html#nexttick)、
  [Vue 3.5.40 当前 flush Promise 选择](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/scheduler.ts#L50-L67)、
  [Vue 3.5.40 新任务安排 flush](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/scheduler.ts#L99-L123)

### 3. 在同一个 tick 连续修改状态，却期待看到每个中间 DOM

- **错误假设 / 原因：** Vue 会缓冲同一轮响应式更新，让每个组件只更新一次；
  `nextTick()` 等待的是这次批量冲刷，不会为同一段同步代码中的每次赋值生成一帧 DOM。
- **可观察后果：** 中间值从未出现在 DOM 中，动画、日志或测试只观察到最终值。
- **错误代码：**

```ts
progress.value = 25
progress.value = 50
progress.value = 100
await nextTick()
// DOM 只显示 100，不会依次显示 25、50、100
```

- **正确代码：**

```ts
progress.value = 25
await nextTick()

progress.value = 50
await nextTick()

progress.value = 100
await nextTick()
```

- **直接来源：** [Vue `nextTick()`：每个组件每轮只更新一次](https://cn.vuejs.org/api/general.html#nexttick)、
  [Vue 3.5.40 调度任务去重标记](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/scheduler.ts#L99-L117)

### 4. 用 `nextTick()` 等待请求、定时器或异步组件加载完成

- **错误假设 / 原因：** 把“下一个 tick”理解成“所有异步工作完成”。`nextTick()` 只链接
  Vue 当前的调度器冲刷 Promise，不会等待独立的 fetch、timer 或异步组件 loader Promise。
- **可观察后果：** `await nextTick()` 后请求数据仍未返回，异步组件仍是占位或 loading 状态，
  测试因此提前读取页面。
- **错误代码：**

```ts
loadProfile()
await nextTick()
console.log(profile.value) // 请求可能仍在进行
```

- **正确代码：**

```ts
await loadProfile()
await nextTick() // 等待 profile 写入响应式状态后产生的 DOM 更新
console.log(profile.value)
```

- **直接来源：** [Vue `nextTick()` 的范围是 DOM 更新冲刷](https://cn.vuejs.org/api/general.html#nexttick)、
  [Vue 3.5.40 `nextTick()` 仅使用 `currentFlushPromise`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/scheduler.ts#L50-L67)、
  [Vue 3.5.40 异步组件由独立 loader Promise 驱动](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L76-L118)

### 5. 修改非响应式值后调用 `nextTick()`，期待它强制重渲染

- **错误假设 / 原因：** `nextTick()` 只等待已调度的更新，本身不会创建组件更新任务。
  非响应式变量的修改没有触发渲染副作用，因而没有新 DOM 更新可等待。
- **可观察后果：** Promise 正常 resolve，但页面内容保持不变，看起来像 `nextTick()` “失效”。
- **错误代码：**

```ts
let count = 0

async function increment() {
  count++
  await nextTick()
}
```

- **正确代码：**

```ts
const count = ref(0)

async function increment() {
  count.value++
  await nextTick()
}
```

- **直接来源：** [Vue `nextTick()`：响应式状态修改产生 DOM 更新](https://cn.vuejs.org/api/general.html#nexttick)、
  [Vue 3.5.40 无待处理任务时使用已 resolve Promise](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/scheduler.ts#L50-L67)、
  [Vue 3.5.40 更新任务通过 `queueJob()` 入队](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/scheduler.ts#L99-L123)

## `defineComponent()`

### 1. 认为调用 `defineComponent()` 就完成了组件注册或挂载

- **错误假设 / 原因：** `defineComponent()` 主要是 TypeScript 类型推导辅助；对象签名在运行时
  原样返回传入选项，并不会自动把组件加入某个应用，也不会创建组件实例。
- **可观察后果：** 仅定义组件不会在页面产生任何 DOM；未导入、未局部使用或未通过
  `app.component()` 注册时，模板仍会报告组件无法解析。
- **错误代码：**

```ts
defineComponent({
  name: 'UserCard',
  template: '<article>User</article>',
})
```

- **正确代码：**

```ts
export const UserCard = defineComponent({
  name: 'UserCard',
  template: '<article>User</article>',
})

app.component('UserCard', UserCard)
```

- **直接来源：** [Vue `defineComponent()`：运行时基本是 no-op](https://cn.vuejs.org/api/general.html#definecomponent)、
  [Vue 组件必须注册或局部使用](https://cn.vuejs.org/guide/components/registration.html)、
  [Vue 3.5.40 对象签名原样返回](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiDefineComponent.ts#L303-L315)

### 2. 在 Vue 3.2 或更早版本使用函数签名

- **错误假设 / 原因：** 把对象签名和函数签名视为同时存在于所有 Vue 3 版本。
  官方 API 明确标注函数签名只支持 Vue 3.3+。
- **可观察后果：** 旧版类型声明不接受该重载；运行时也不会获得 3.3+ 的
  `{ setup: function }` 包装语义，迁移到旧项目时可能出现类型错误或无效渲染结果。
- **错误代码：**

```ts
// package.json 中仍是 Vue 3.2
const Badge = defineComponent(() => {
  return () => h('span', 'New')
})
```

- **正确代码：**

```ts
// 兼容 Vue 3.2 的对象签名
const Badge = defineComponent({
  setup() {
    return () => h('span', 'New')
  },
})
```

- **直接来源：** [Vue `defineComponent()` 函数签名仅 3.3+](https://cn.vuejs.org/api/general.html#function-signature)、
  [Vue 3.5.40 函数签名包装实现](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiDefineComponent.ts#L303-L315)

### 3. 函数签名直接返回 VNode，而不是返回渲染函数

- **错误假设 / 原因：** `defineComponent(setup, options)` 的第一个函数按 `setup()` 执行，
  不是每次更新都直接调用的普通函数式组件。它应返回一个渲染函数。
- **可观察后果：** 返回的 VNode 被当成 setup 结果处理，组件缺少有效 render/template，
  开发环境出现缺少模板或渲染函数的警告，响应式更新也没有渲染入口。
- **错误代码：**

```ts
const Counter = defineComponent(() => {
  const count = ref(0)
  return h('button', count.value)
})
```

- **正确代码：**

```ts
const Counter = defineComponent(() => {
  const count = ref(0)
  return () => h('button', count.value)
})
```

- **直接来源：** [Vue `defineComponent()` 函数签名必须返回渲染函数](https://cn.vuejs.org/api/general.html#function-signature)、
  [Vue `setup()` 与渲染函数](https://cn.vuejs.org/api/composition-api-setup.html#usage-with-render-functions)、
  [Vue 3.5.40 函数签名类型要求 `RenderFunction`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiDefineComponent.ts#L147-L180)

### 4. 只写 TypeScript props 类型，不提供函数签名的运行时 props 声明

- **错误假设 / 原因：** 认为参数类型会像 SFC 的 `defineProps()` 宏一样自动生成运行时声明。
  官方文档明确说明函数签名仍需在第二个参数中手动声明 props；普通 TypeScript 类型会被擦除。
- **可观察后果：** 父组件传入的 `msg` 不会按已声明 prop 归入 setup 的 props，运行时校验、
  默认值及 attrs/props 分类与类型预期不一致。
- **错误代码：**

```ts
const Greeting = defineComponent((props: { msg: string }) => {
  return () => h('p', props.msg)
})
```

- **正确代码：**

```ts
const Greeting = defineComponent(
  (props: { msg: string }) => {
    return () => h('p', props.msg)
  },
  {
    props: {
      msg: { type: String, required: true },
    },
  },
)
```

- **直接来源：** [Vue 函数签名：仍需手动运行时 props](https://cn.vuejs.org/api/general.html#function-signature)、
  [Vue 3.5.40 函数签名的 `props` 第二参数](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiDefineComponent.ts#L147-L180)

### 5. 在函数签名中用 `this` 访问组件实例

- **错误假设 / 原因：** 函数签名的第一个参数按 Composition API `setup()` 运行；
  `setup()` 没有组件实例 `this`，应使用闭包中的 ref、props 和 setup context。
- **可观察后果：** 严格模式下 `this` 为 `undefined`，访问 `this.msg` 抛错；即使关闭类型检查，
  也不能获得 Options API 的实例代理。
- **错误代码：**

```ts
const Greeting = defineComponent(function () {
  return () => h('p', this.msg)
})
```

- **正确代码：**

```ts
const Greeting = defineComponent(
  (props: { msg: string }) => {
    return () => h('p', props.msg)
  },
  { props: ['msg'] },
)
```

- **直接来源：** [Vue 函数签名与 `setup()` 语义相同](https://cn.vuejs.org/api/general.html#function-signature)、
  [Vue `setup()` 中 `this` 为 undefined](https://cn.vuejs.org/api/composition-api-setup.html#basic-usage)、
  [Vue 3.5.40 将函数放入 `setup` 选项](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiDefineComponent.ts#L303-L315)

## `defineAsyncComponent()`

### 1. 把 `import()` Promise 直接传入，而不是传 loader 函数

- **错误假设 / 原因：** `defineAsyncComponent()` 接受的是返回 Promise 的函数，或含
  `loader` 函数的选项对象。直接执行 `import()` 会立刻开始请求，而且 Promise 不是合法 source。
- **可观察后果：** 失去“渲染时才加载”的懒加载语义；绕过 TypeScript 时，渲染外壳会因
  `loader` 不是函数而失败。
- **错误代码：**

```ts
const AdminPanel = defineAsyncComponent(import('./AdminPanel.vue'))
```

- **正确代码：**

```ts
const AdminPanel = defineAsyncComponent(() => import('./AdminPanel.vue'))
```

- **直接来源：** [Vue 异步组件：loader 函数与按渲染加载](https://cn.vuejs.org/guide/components/async.html#basic-usage)、
  [Vue `defineAsyncComponent()` 类型](https://cn.vuejs.org/api/general.html#defineasynccomponent)、
  [Vue 3.5.40 loader 调用位置](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L48-L82)

### 2. 期待 loading 立即出现，或期待默认超时

- **错误假设 / 原因：** `loadingComponent` 默认延迟 200ms 才显示，以避免快速请求产生闪烁；
  `timeout` 默认是 `undefined`，即永不因 Vue 自身计时而超时。
- **可观察后果：** 前 200ms 显示空占位而不是 loading；若 loader 永不 settle 且未设置
  `timeout`，页面会一直停在空占位或 loading 状态。
- **错误代码：**

```ts
const Report = defineAsyncComponent({
  loader: () => import('./Report.vue'),
  loadingComponent: LoadingPanel,
  errorComponent: LoadError,
})
```

- **正确代码：**

```ts
const Report = defineAsyncComponent({
  loader: () => import('./Report.vue'),
  loadingComponent: LoadingPanel,
  delay: 0,
  errorComponent: LoadError,
  timeout: 10_000,
})
```

- **直接来源：** [Vue 异步组件 loading/error 默认值](https://cn.vuejs.org/guide/components/async.html#loading-and-error-states)、
  [Vue 3.5.40 `delay = 200` 与 timeout 无默认值](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L55-L64)、
  [Vue 3.5.40 loading/timeout 定时器](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L203-L233)

### 3. loader 失败时只记录日志，却没有提供可见错误状态

- **错误假设 / 原因：** loader Promise reject 后，Vue 会把错误交给应用错误处理流程；
  只有配置 `errorComponent` 才会让异步组件外壳渲染明确的错误 UI。
- **可观察后果：** 控制台或 `app.config.errorHandler` 收到错误，但组件位置只剩空占位；
  用户看不到失败原因或重试入口。
- **错误代码：**

```ts
const Settings = defineAsyncComponent(() => import('./Settings.vue'))
```

- **正确代码：**

```ts
const Settings = defineAsyncComponent({
  loader: () => import('./Settings.vue'),
  errorComponent: SettingsLoadError,
})
```

```vue
<script setup lang="ts">
defineProps<{ error: Error }>()
</script>

<template>
  <p role="alert">设置加载失败：{{ error.message }}</p>
</template>
```

- **直接来源：** [Vue 异步组件：reject 显示 error component](https://cn.vuejs.org/guide/components/async.html#loading-and-error-states)、
  [Vue 3.5.40 loader 错误进入应用错误处理](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L173-L180)、
  [Vue 3.5.40 `errorComponent` 接收 error prop](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L245-L267)

### 4. 在 `onError` 中返回布尔值，而不调用 `retry()` 或 `fail()`

- **错误假设 / 原因：** `onError` 不是返回真假值的判定函数。Vue 会创建一个新的 Promise，
  只有调用 `retry()` 才重新执行 loader，调用 `fail()` 才把原错误继续 reject。
- **可观察后果：** 若两个回调都不调用，异步组件一直处于 pending；loading 或 Suspense fallback
  不会退出，也不会进入 errorComponent。
- **错误代码：**

```ts
onError(error, retry, fail, attempts) {
  return attempts <= 3
}
```

- **正确代码：**

```ts
onError(error, retry, fail, attempts) {
  if (error instanceof TypeError && attempts <= 3) {
    retry()
  } else {
    fail()
  }
}
```

- **直接来源：** [Vue `defineAsyncComponent()` 的 `onError` 签名](https://cn.vuejs.org/api/general.html#defineasynccomponent)、
  [Vue 3.5.40 `retry` / `fail` 如何 settle Promise](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L69-L93)、
  [Vue 3.5.40 官方重试测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiAsyncComponent.spec.ts#L611-L741)

### 5. 在 `Suspense` 内仍期待异步组件自己的 loading、delay 和 timeout 生效

- **错误假设 / 原因：** `suspensible` 默认为 `true`。异步组件位于 `Suspense` 边界内时，
  Vue 走由边界控制的 Promise 分支，不会建立组件本地的 `loadingComponent`、`delay`、
  `timeout` 状态机。需要特别区分：v3.5.40 的该分支在 loader reject 后仍会渲染已配置的
  `errorComponent`；它并没有被忽略。
- **可观察后果：** 显示的是 `Suspense` 的 fallback，而不是本地 loading；本地 timeout
  不会触发。若加载失败且配置了 `errorComponent`，边界结束 pending 后错误组件仍可出现。
- **错误代码：**

```ts
const AsyncPanel = defineAsyncComponent({
  loader: () => import('./Panel.vue'),
  loadingComponent: LocalLoading,
  errorComponent: LocalError,
  delay: 0,
  timeout: 3000,
})
```

```vue-html
<Suspense>
  <AsyncPanel />
  <template #fallback><PageLoading /></template>
</Suspense>
```

- **正确代码：**

```ts
// 方案一：让 Suspense 负责 loading，保留 errorComponent 处理 loader reject
const AsyncPanel = defineAsyncComponent({
  loader: () => import('./Panel.vue'),
  errorComponent: LocalError,
})
```

```ts
// 方案二：明确退出 Suspense 控制，使用组件自己的 loading/delay/timeout
const IndependentAsyncPanel = defineAsyncComponent({
  loader: () => import('./Panel.vue'),
  loadingComponent: LocalLoading,
  errorComponent: LocalError,
  delay: 0,
  timeout: 3000,
  suspensible: false,
})
```

- **直接来源：** [Vue `defineAsyncComponent()` 的 `suspensible` 选项](https://cn.vuejs.org/api/general.html#defineasynccomponent)、
  [Vue 3.5.40 Suspense 分支与 `errorComponent`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L173-L201)、
  [Vue 3.5.40 本地 loading/timeout 仅在非 Suspense 分支建立](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L203-L267)、
  [Vue 3.5.40 官方 `suspensible: false` 测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiAsyncComponent.spec.ts#L529-L581)

## 覆盖统计

| 主题 | 易错点数量 |
| --- | ---: |
| `createApp()` | 5 |
| `nextTick()` | 5 |
| `defineComponent()` | 5 |
| `defineAsyncComponent()` | 5 |
| 合计 | 20 |

## 核验边界

1. 事实行为以 `vuejs/core@v3.5.40` 固定标签为准；官方 docs `main` 仅用于 API 解释，
   涉及版本或分支行为时均回查固定标签源码。
2. `nextTick()` 只承诺等待 Vue 当前 DOM 更新冲刷；本文没有把它扩写为等待浏览器绘制、
   网络、定时器、CSS 动画或任意 Promise。
3. `defineAsyncComponent()` 在 `Suspense` 下的结论按 v3.5.40 实现拆分：
   `loadingComponent`、`delay`、`timeout` 不进入本地状态机；`errorComponent` 仍保留。
4. `hydrate` 及内置懒水合策略属于 Vue 3.5+ 的 SSR 能力，本批只记录版本边界，
   不把它扩展为客户端懒加载易错点。
5. Tavily 仅被尝试用于发现线索，因套餐用量上限未返回资料；失败响应和搜索摘要均未作为依据。
