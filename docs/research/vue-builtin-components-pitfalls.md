# Vue 内置组件易错使用点调研

> 调研日期：2026-07-29
>
> 适用基线：Vue 3.5.40
>
> 对应范围：阶段 4 第 4 批 `builtin-components`，仅覆盖 `Transition`、
> `KeepAlive`、`Teleport`、`Suspense`。
>
> 资料范围：Vue 官方文档、Vue 官方 docs 仓库原始 Markdown，以及
> `vuejs/core` 的 `v3.5.40` 固定标签源码。Tavily 的四类限定检索均返回
> plan usage limit，因此按仓库规则回退到直接读取上述一手资料；本文不引用
> 社区文章、搜索摘要或未合并提案。

```yaml
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
```

下列错误代码用于复现错误直觉，正确代码给出最小替换路径。每点均记录原因、
可观察后果和直接来源；没有明确行为后果的风格偏好不计入易错点。

## `Transition`

### 1. 在一个 `Transition` 中放多个并列元素或列表项

- **错误假设 / 原因：** 把 `Transition` 当成可以协调任意数量子节点的容器。它只支持一个
  元素或组件；Vue 3.5.40 在发现多个非注释子节点时会给出警告，列表应交给
  `TransitionGroup`。
- **可观察后果：** 只有单个节点能走预期的进入/离开流程，开发环境出现
  `can only be used on a single element or component` 警告，列表插入、删除、移动的动画
  不能按预期执行。
- **错误代码：**

```vue-html
<Transition name="fade">
  <p v-for="item in items" :key="item.id">{{ item.label }}</p>
</Transition>
```

- **正确代码：**

```vue-html
<TransitionGroup name="fade" tag="div">
  <p v-for="item in items" :key="item.id">{{ item.label }}</p>
</TransitionGroup>
```

- **直接来源：** [Vue Transition：单一 slot 内容](https://cn.vuejs.org/guide/built-ins/transition.html#the-transition-component)、[Vue 3.5.40 `BaseTransition.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts#L282-L300)

### 2. 只更新同一个元素的文本，却期待触发进入和离开

- **错误假设 / 原因：** `Transition` 观察的是节点插入、移除或身份变化；原地更新同一个
  `span` 的文本只会 patch 文本节点，不会创建一对离开/进入元素。改变特殊 `key` 才会让
  Vue 把它视为不同节点。
- **可观察后果：** 数字或状态文字直接跳到新值，`*-leave-*` 和 `*-enter-*` 类不会形成一次
  完整切换。
- **错误代码：**

```vue-html
<Transition name="count">
  <span>{{ count }}</span>
</Transition>
```

- **正确代码：**

```vue-html
<Transition name="count">
  <span :key="count">{{ count }}</span>
</Transition>
```

- **直接来源：** [Vue Transition：使用 key 触发过渡](https://cn.vuejs.org/guide/built-ins/transition.html#transitions-with-the-key-attribute)、[Vue Transition 的触发条件](https://cn.vuejs.org/guide/built-ins/transition.html#the-transition-component)

### 3. 同一元素同时有 CSS transition 和 animation，却不指定 `type`

- **错误假设 / 原因：** 认为 Vue 总能推断哪一种结束事件代表本次组件过渡完成。自动检测会在
  `transitionend` 和 `animationend` 之间选择；两类规则同时存在时，必须用 `type` 明确 Vue
  应关注哪一类。
- **可观察后果：** Vue 可能按非目标效果的时长结束，过早移除过渡类或延后节点移除，随后
  `after-enter` / `after-leave` 的时机也与视觉动画不一致。
- **错误代码：**

```vue-html
<Transition name="panel">
  <Panel v-if="open" />
</Transition>
```

```css
.panel-enter-active {
  animation: pop 400ms;
  transition: opacity 150ms;
}
```

- **正确代码：**

```vue-html
<Transition name="panel" type="animation">
  <Panel v-if="open" />
</Transition>
```

- **直接来源：** [Vue Transition：同时使用 transition 和 animation](https://cn.vuejs.org/guide/built-ins/transition.html#using-transitions-and-animations-together)、[Vue 3.5.40 `Transition.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts#L348-L365)

### 4. 内层动画有延迟，却让 Vue 自动判断总时长

- **错误假设 / 原因：** 认为 `Transition` 会遍历所有后代并等待最后一个动画。过渡类只加在
  直接子元素上；嵌套效果存在时，自动结束判断不能表达“内层 delay + duration”的总时长，
  官方文档要求显式传入 `duration`。
- **可观察后果：** 外层过渡先结束并清理类，内层动画被截断；离开节点也可能在内层动画完成前
  从 DOM 移除。
- **错误代码：**

```vue-html
<Transition name="nested">
  <section v-if="open"><PanelContent /></section>
</Transition>
```

```css
.nested-enter-active .panel-content {
  transition: opacity 300ms 250ms;
}
```

- **正确代码：**

```vue-html
<Transition name="nested" :duration="550">
  <section v-if="open"><PanelContent /></section>
</Transition>
```

- **直接来源：** [Vue Transition：嵌套过渡与显式时长](https://cn.vuejs.org/guide/built-ins/transition.html#nested-transitions-and-explicit-transition-durations)、[Vue 3.5.40 显式 duration 分支](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts#L348-L365)

### 5. 使用 `:css="false"` 的异步 JS 动画，却不调用 `done`

- **错误假设 / 原因：** 关闭 CSS 检测后，仍期待 Vue 自动知道第三方动画何时完成。此时
  `@enter` 和 `@leave` 必须通过第二个参数 `done` 主动完成；没有显式回调的 hook 会被当成
  同步 hook。
- **可观察后果：** 过渡立即结束；离开节点可能在动画库尚未完成时被移除，`after-*` hook 也会
  提前执行。
- **错误代码：**

```vue-html
<Transition :css="false" @leave="animateLeave">
  <Panel v-if="open" />
</Transition>
```

```ts
// 启动离开动画
function animateLeave(element: Element) {
  animationLibrary.animate(element)
}
```

- **正确代码：**

```ts
// 启动离开动画，并在动画完成后通知 Vue
function animateLeave(element: Element, done: () => void) {
  animationLibrary.animate(element, { onComplete: done })
}
```

- **直接来源：** [Vue Transition：JavaScript hook](https://cn.vuejs.org/guide/built-ins/transition.html#javascript-hooks)、[Vue 3.5.40 `BaseTransition.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts#L370-L378)

## `KeepAlive`

### 1. 用路由名或标签名配置 `include` / `exclude`

- **错误假设 / 原因：** 把 `include` / `exclude` 当成 route name、路径或父模板中的组件标签匹配。
  实际匹配的是组件自己的 `name`；没有可解析名称的组件也无法命中 `include`。Vue 3.2.34
  以后，使用 `<script setup>` 的 SFC 可以从文件名推断名称。
- **可观察后果：** 目标页面每次切换回来都重新挂载，或者本应排除的组件仍保留旧状态。
- **错误代码：**

```vue-html
<!-- 当前路由叫 settings，但组件名是 SettingsPanel -->
<KeepAlive include="settings">
  <component :is="activeComponent" />
</KeepAlive>
```

- **正确代码：**

```vue-html
<KeepAlive include="SettingsPanel">
  <component :is="activeComponent" />
</KeepAlive>
```

```vue
<script setup lang="ts">
defineOptions({ name: 'SettingsPanel' })
</script>
```

- **直接来源：** [Vue KeepAlive：Include / Exclude](https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude)、[Vue 3.5.40 名称过滤](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts#L308-L327)

### 2. 把停用当成卸载，只在 `onUnmounted()` 释放资源

- **错误假设 / 原因：** 被缓存的组件离开 DOM 时进入 `deactivated`，并没有被卸载；因此仅注册
  `onUnmounted()` 不能覆盖每次切走的时机。重新插入缓存树时对应的是 `activated`。
- **可观察后果：** 不可见页面的轮询、订阅或播放器继续运行；多次切换后可能同时存在重复的外部
  资源活动。
- **错误代码：**

```ts
onMounted(startPolling)
onUnmounted(stopPolling)
```

- **正确代码：**

```ts
onActivated(startPolling)
onDeactivated(stopPolling)
```

- **直接来源：** [Vue KeepAlive：缓存实例的生命周期](https://cn.vuejs.org/guide/built-ins/keep-alive.html#lifecycle-of-cached-instance)、[Vue 内置组件 API：KeepAlive](https://cn.vuejs.org/api/built-in-components.html#keepalive)

### 3. 以为 `max` 只限制可见数量，不会销毁旧缓存

- **错误假设 / 原因：** `max` 不是展示数量，而是缓存实例上限。达到上限后，Vue 3.5.40 按
  LRU 规则淘汰并卸载最久未访问的实例。
- **可观察后果：** 返回较早页面时得到全新实例，局部表单或滚动状态丢失；被淘汰组件会执行
  卸载流程。
- **错误代码：**

```vue-html
<!-- 错误地假设所有访问过的页面都会永久保留 -->
<KeepAlive :max="2">
  <component :is="activeComponent" />
</KeepAlive>
```

- **正确代码：**

```vue-html
<!-- 只把可重建的 UI 实例放进有限缓存，持久草稿保存在组件外 -->
<KeepAlive :max="2">
  <component :is="activeComponent" :draft="draftStore.current" />
</KeepAlive>
```

- **直接来源：** [Vue KeepAlive：最大缓存实例数](https://cn.vuejs.org/guide/built-ins/keep-alive.html#max-cached-instances)、[Vue 3.5.40 LRU 淘汰](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts#L347-L365)

### 4. 给缓存子组件使用每次渲染都会变化的 `key`

- **错误假设 / 原因：** 认为 `KeepAlive` 只按组件类型保存一个实例。Vue 3.5.40 在 vnode 有
  `key` 时直接使用该 key 作为缓存键；不断变化的 key 会不断创建不同缓存项。
- **可观察后果：** 预期复用的状态反而重置，缓存持续增长；设置了 `max` 时还会频繁淘汰其他
  正常缓存项。
- **错误代码：**

```vue-html
<KeepAlive :max="10">
  <component :is="activeComponent" :key="Date.now()" />
</KeepAlive>
```

- **正确代码：**

```vue-html
<KeepAlive :max="10">
  <component :is="activeComponent" :key="activeTab.id" />
</KeepAlive>
```

- **直接来源：** [Vue 3.5.40 KeepAlive 缓存键](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts#L330-L365)

### 5. 在 `KeepAlive` 中同时放多个直接组件子节点

- **错误假设 / 原因：** 把 `KeepAlive` 当成通用缓存容器。它在任一时刻只允许一个活动组件
  实例作为直接子节点；Vue 3.5.40 对多个子节点发出警告并放弃正常缓存路径。
- **可观察后果：** 开发环境出现 `should contain exactly one component child`；这些子组件不会
  按预期恢复缓存实例。
- **错误代码：**

```vue-html
<KeepAlive>
  <EditorPanel />
  <PreviewPanel />
</KeepAlive>
```

- **正确代码：**

```vue-html
<KeepAlive>
  <component :is="activePanel" />
</KeepAlive>
```

- **直接来源：** [Vue 内置组件 API：KeepAlive 的直接子节点](https://cn.vuejs.org/api/built-in-components.html#keepalive)、[Vue 3.5.40 `KeepAlive.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts#L280-L299)

## `Teleport`

### 1. 在目标节点存在之前挂载 `Teleport`

- **错误假设 / 原因：** 认为 `to` 选择器会持续观察 DOM，等目标稍后出现再自动迁移。默认情况下，
  Vue 在 `Teleport` 挂载时立即解析目标；目标应已在 DOM 中，最好位于整个 Vue 应用之外。
- **可观察后果：** 开发环境报告无法定位或无效 Teleport target，内容不能挂载到预期容器。
- **错误代码：**

```vue-html
<Teleport to="#modals">
  <ModalDialog />
</Teleport>

<!-- 目标在另一个稍后才挂载的组件里 -->
<ModalHost v-if="hostReady" />
```

- **正确代码：**

```html
<!-- index.html：应用挂载前就存在 -->
<div id="app"></div>
<div id="modals"></div>
```

```vue-html
<Teleport to="#modals">
  <ModalDialog />
</Teleport>
```

- **直接来源：** [Vue Teleport：目标必须已存在](https://cn.vuejs.org/guide/built-ins/teleport.html#basic-usage)、[Vue 3.5.40 目标解析](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts#L45-L75)

### 2. 以为 `defer` 会无限等待异步创建的目标

- **错误假设 / 原因：** Vue 3.5 的 `defer` 只把目标解析推迟到同一个 mount / update tick 的
  其他部分完成，行为类似 `mounted`；它不是持续重试机制。
- **可观察后果：** 目标由请求、定时器或后续 tick 才创建时，即使写了 `defer` 仍会报告错误，
  内容不会在目标出现后自动补挂载。
- **错误代码：**

```vue-html
<Teleport defer to="#late-target">
  <ModalDialog />
</Teleport>
<div v-if="requestFinished" id="late-target"></div>
```

- **正确代码：**

```vue-html
<Teleport defer to="#late-target">
  <ModalDialog />
</Teleport>
<div id="late-target"></div>
```

- **直接来源：** [Vue Teleport：Deferred Teleport](https://cn.vuejs.org/guide/built-ins/teleport.html#deferred-teleport)、[Vue 3.5.40 defer 调度](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts#L160-L202)

### 3. 把 DOM 目标位置当成新的组件父子关系

- **错误假设 / 原因：** `Teleport` 只改变渲染后的 DOM 位置，不改变组件逻辑树。子组件仍是
  声明 `Teleport` 的组件的逻辑后代；props、emit、provide / inject 和 Vue Devtools 层级都
  沿原逻辑树工作。
- **可观察后果：** 试图从目标 DOM 所属组件注入依赖会得到缺失值；反过来，为了解决并不存在的
  “断开父子关系”而手动转发事件，会制造重复或多余状态通道。
- **错误代码：**

```vue-html
<!-- 错误地期待 DialogContent 从 #theme-host 对应组件获得 provide -->
<Teleport to="#theme-host">
  <DialogContent />
</Teleport>
```

- **正确代码：**

```ts
provide(themeKey, theme)
```

```vue-html
<!-- 依赖由 Teleport 的逻辑父组件提供 -->
<Teleport to="#theme-host">
  <DialogContent @close="open = false" />
</Teleport>
```

- **直接来源：** [Vue Teleport：与组件一起使用](https://cn.vuejs.org/guide/built-ins/teleport.html#using-with-components)

### 4. 用 `disabled="false"` 表示“不禁用”

- **错误假设 / 原因：** 没有 `v-bind` 的 attribute 值是字符串。Vue 3.5.40 的 Teleport
  禁用判断把非空字符串和空字符串都视为启用 `disabled`，所以字符串 `"false"` 仍是禁用。
- **可观察后果：** 内容留在组件原本的 DOM 位置，没有移动到 `to` 指定目标。
- **错误代码：**

```vue-html
<Teleport to="#modals" disabled="false">
  <ModalDialog />
</Teleport>
```

- **正确代码：**

```vue-html
<Teleport to="#modals" :disabled="false">
  <ModalDialog />
</Teleport>
```

- **直接来源：** [Vue Teleport：禁用 Teleport](https://cn.vuejs.org/guide/built-ins/teleport.html#disabling-teleport)、[Vue 3.5.40 disabled 判断](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts#L21-L37)

### 5. 期待多个同目标 `Teleport` 相互替换或自动决定层级

- **错误假设 / 原因：** 多个 Teleport 可以使用同一目标，但语义是按挂载顺序简单追加；后挂载
  内容位于先挂载内容之后，并不会替换前者，也不会按业务优先级排序。
- **可观察后果：** 多个弹层同时留在目标内；依赖 DOM 顺序的覆盖关系、焦点顺序或读屏顺序可能
  与业务预期不一致。
- **错误代码：**

```vue-html
<Teleport to="#modals"><ConfirmDialog /></Teleport>
<Teleport to="#modals"><AlertDialog /></Teleport>
```

- **正确代码：**

```vue-html
<Teleport to="#modals">
  <component
    :is="dialog.component"
    v-for="dialog in orderedDialogs"
    :key="dialog.id"
  />
</Teleport>
```

- **直接来源：** [Vue Teleport：多个 Teleport 使用同一目标](https://cn.vuejs.org/guide/built-ins/teleport.html#multiple-teleports-on-the-same-target)

## `Suspense`

> Vue 3.5.40 仍把 `Suspense` 标为实验性功能，API 不保证稳定。下列条目描述的是该固定版本的
> 已核实行为，不把它表述为永久兼容承诺。

### 1. 期待 `onMounted()` 中的任意异步请求触发 fallback

- **错误假设 / 原因：** `Suspense` 不会拦截组件里的任意 Promise。它等待的依赖只有两类：
  `async setup()`（包括 `<script setup>` 顶层 `await`）和默认可挂起的异步组件。同步 setup
  完成后才在 `onMounted()` 发起的请求不属于这两类依赖。
- **可观察后果：** boundary 立即进入 resolved，fallback 不显示；组件自己的空数据或局部 loading
  状态直接出现在页面上。
- **错误代码：**

```ts
const posts = ref<Post[]>([])

onMounted(async () => {
  posts.value = await loadPosts()
})
```

- **正确代码：**

```vue
<script setup lang="ts">
const posts = await loadPosts()
</script>
```

- **直接来源：** [Vue Suspense：异步依赖](https://cn.vuejs.org/guide/built-ins/suspense.html#async-dependencies)、[Vue 3.5.40 异步依赖登记](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts#L713-L776)

### 2. 在 `Suspense` 内仍期待异步组件自己的 loading、delay 和 timeout 生效

- **错误假设 / 原因：** 异步组件默认 `suspensible: true`。当父链存在 `Suspense` 时，加载状态
  由 boundary 接管，异步组件自己的 `loadingComponent`、`delay` 和 `timeout` 选项会被忽略；
  loader 拒绝后，配置的 `errorComponent` 仍可渲染。只有设置 `suspensible: false` 才会退出加载状态接管。
- **可观察后果：** `loadingComponent` 不显示，预期的 delay 或 timeout UI 不触发，加载期间实际只看到
  `Suspense` 的 fallback；loader 失败时仍可进入异步组件自己的 `errorComponent`。
- **错误代码：**

```ts
const AsyncPanel = defineAsyncComponent({
  loader: () => import('./Panel.vue'),
  loadingComponent: LocalSpinner,
  delay: 0,
  timeout: 3000,
})
```

- **正确代码：**

```vue-html
<Suspense>
  <AsyncPanel />
  <template #fallback><GlobalSpinner /></template>
</Suspense>
```

```ts
const IndependentAsyncPanel = defineAsyncComponent({
  loader: () => import('./Panel.vue'),
  loadingComponent: LocalSpinner,
  suspensible: false,
})
```

- **直接来源：** [Vue Suspense：异步组件](https://cn.vuejs.org/guide/built-ins/suspense.html#async-components)、[Vue 3.5.40 `apiAsyncComponent.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts#L175-L201)

### 3. 在 default 或 fallback slot 中放多个直接根节点

- **错误假设 / 原因：** 把两个 slot 当成普通 Fragment 容器。`#default` 和 `#fallback` 都只允许
  一个直接子节点；Vue 3.5.40 会尝试归一化单根，并在不能得到单根时警告。
- **可观察后果：** 开发环境出现 `slots expect a single root node`；boundary 得不到预期的完整
  default 或 fallback 树。
- **错误代码：**

```vue-html
<Suspense>
  <PageHeader />
  <AsyncDashboard />
  <template #fallback>
    <Spinner />
    <p>正在加载</p>
  </template>
</Suspense>
```

- **正确代码：**

```vue-html
<Suspense>
  <main>
    <PageHeader />
    <AsyncDashboard />
  </main>
  <template #fallback>
    <section><Spinner /><p>正在加载</p></section>
  </template>
</Suspense>
```

- **直接来源：** [Vue Suspense：Loading State](https://cn.vuejs.org/guide/built-ins/suspense.html#loading-state)、[Vue 3.5.40 slot 单根归一化](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts#L856-L900)

### 4. boundary 已 resolved 后，期待任意深层新依赖重新显示 fallback

- **错误假设 / 原因：** resolved 状态只在 `#default` 的根节点被替换时重新进入 pending；树中更深
  层后来出现的新异步依赖不会让现有 boundary 回退。`timeout` 也只控制这次根替换后何时切到
  fallback，不是请求超时器。
- **可观察后果：** 切换深层异步子组件时 fallback 不出现，可能短暂显示空节点；把 `timeout`
  当网络超时使用时，请求也不会被取消或报错。
- **错误代码：**

```vue-html
<Suspense :timeout="3000">
  <Dashboard :user-id="userId" />
  <template #fallback><Spinner /></template>
</Suspense>
```

- **正确代码：**

```vue-html
<!-- key 变化会替换 default slot 的根组件 -->
<Suspense :timeout="0">
  <Dashboard :key="userId" :user-id="userId" />
  <template #fallback><Spinner /></template>
</Suspense>
```

- **直接来源：** [Vue Suspense：Loading State 与 timeout](https://cn.vuejs.org/guide/built-ins/suspense.html#loading-state)、[Vue 3.5.40 根分支与 timeout](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts#L383-L417)

### 5. 把 fallback 当成错误界面，或编写不存在的 `#error` slot

- **错误假设 / 原因：** `Suspense` 当前只协调 pending / resolved，没有内置错误处理或 error slot。
  异步错误应由父组件的 `onErrorCaptured()` / `errorCaptured` 或应用级 error handler 处理。
- **可观察后果：** Promise 拒绝时不会自动切换到自定义错误 slot；错误继续沿组件链传播，页面也
  可能一直没有期望的错误反馈。
- **错误代码：**

```vue-html
<Suspense>
  <AsyncDashboard />
  <template #fallback><Spinner /></template>
  <template #error="{ error }"><ErrorPanel :error="error" /></template>
</Suspense>
```

- **正确代码：**

```ts
const capturedError = shallowRef<unknown>()

// 捕获 Suspense 子树中的异步错误并交给当前页面展示
onErrorCaptured(error => {
  capturedError.value = error
  return false
})
```

```vue-html
<ErrorPanel v-if="capturedError" :error="capturedError" />
<Suspense v-else>
  <AsyncDashboard />
  <template #fallback><Spinner /></template>
</Suspense>
```

- **直接来源：** [Vue Suspense：错误处理](https://cn.vuejs.org/guide/built-ins/suspense.html#error-handling)、[Vue 生命周期 API：onErrorCaptured](https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured)
