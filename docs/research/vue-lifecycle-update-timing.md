# Vue Core 中级课程：生命周期与更新时机调研

> 核验日期：2026-07-31
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 中文官方文档，以及 `vuejs/core` 的 `v3.5.40` 固定标签运行时源码与
> 同标签官方测试。外部资料通过 Tavily Search / Extract 定位和提取，结论均回到一手页面或
> 固定标签源码核验。

## 课程定位与边界

本课目标 ID 为 `vue.core.learn.intermediate.lifecycle-update-timing`。它是当前仓库中级阶段的
第一课，位于基础阶段最后一课 `vue.core.learn.basics.emits` 之后。生命周期示例需要父子组件、
Props 向下刷新和 Emits 基础识读，因此唯一直接 prerequisite 冻结为
`vue.core.learn.basics.emits`；Props 等传递性前置不重复声明。

本课只回答一个主问题：**组件创建、更新和卸载时，逻辑应放在哪个生命周期阶段；状态修改后，
怎样等待 Vue 完成本轮 DOM 更新。** 主线限定为 `<script setup lang="ts">`、Composition API
与 SFC，覆盖：

- `onBeforeMount()` / `onMounted()` 的首次渲染边界。
- `onBeforeUpdate()` / `onUpdated()` 的 DOM 更新前后边界。
- `onBeforeUnmount()` / `onUnmounted()` 的资源释放边界。
- 父子组件在挂载、由 prop 驱动的更新、卸载时的可观察顺序。
- 同一同步任务中的更新批量与 `nextTick()` 的准确等待范围。
- 生命周期钩子必须在 `setup()` 阶段同步注册。
- SSR 不调用本课这些客户端生命周期钩子的边界。

以下内容明确排除，不进入正文练习或 Demo：

- 不教授模板引用、组件公开实例或 DOM 测量；它们属于紧随其后的模板引用课程。
- 不重新教授 watcher；只用一句对照说明默认 watcher 与所属组件 DOM 更新的相对时机。
- 不讲 Options API 的 `beforeMount`、`mounted` 等选项，只把它们视为同一生命周期的识别项。
- 不讲 `onActivated()` / `onDeactivated()`、KeepAlive、Teleport、Suspense 或异步组件边界。
- 不讲 `onErrorCaptured()`、`onRenderTracked()`、`onRenderTriggered()` 或性能调试。
- 不讲 `onServerPrefetch()`、完整 SSR 架构、hydration 或平台 API 适配。
- 不讲自定义指令生命周期、Transition 钩子或第三方组件生命周期。
- 不引入 Slots、Attrs、组件 `v-model`、Provide/Inject、store 或动态组件。
- 不把 `nextTick()` 扩展为浏览器绘制、动画帧、请求、timer 或任意 Promise 的等待工具。

官方在线文档会持续更新，不按 `3.5.40` 补丁版本冻结。公开语义以 2026-07-31 核验的官方
生命周期、`nextTick()`、watcher flush 与 SSR 文档为准；父子完整顺序、队列去重、flush Promise
和递归限制等实现结论，以 `vuejs/core@v3.5.40` 为固定版本证据。

**课程依据：** [Vue 生命周期指南](https://cn.vuejs.org/guide/essentials/lifecycle.html)、
[组合式 API 生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle.html)、
[Vue `nextTick()`](https://cn.vuejs.org/api/general.html#nexttick)、
[Vue SSR：组件生命周期钩子](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)。

## 学习目标

完成本课后，学习者应能：

1. 用“挂载前后、更新前后、卸载前后”解释六个核心钩子，而不是靠钩子名称猜测。
2. 根据是否需要已创建或已更新的 DOM，选择 before 钩子、完成钩子或事件处理函数。
3. 预测父子组件在挂载、prop 更新和卸载时的钩子顺序。
4. 解释为什么同一同步任务中的多次状态修改通常只产生一次组件更新。
5. 在状态修改后正确 `await nextTick()`，并说明它不会等待哪些异步工作。
6. 在 `onMounted()` 建立外部副作用，在 `onUnmounted()` 对称清理资源。
7. 同步注册生命周期钩子，避免在 timer、Promise 回调或普通 `await` 后丢失当前实例。
8. 识别 SSR 下 setup 会执行而客户端生命周期钩子不执行的资源泄漏风险。

## 建议教学顺序

### 1. 先画出实例的一次完整旅程

先只保留三段：挂载、更新、卸载。每段再拆成 DOM 操作前和完成后，不从 API 清单开始。

```text
setup 同步注册
      │
      ▼
beforeMount ── 首次创建并插入 DOM ── mounted
      │
      ▼
beforeUpdate ── 修补已有 DOM ── updated
      │
      ▼
beforeUnmount ── 移除子树并停止作用 ── unmounted
```

`setup()` 不是本课列出的生命周期钩子，但它是注册这些钩子的阶段。钩子回调可以放在同步调用的
组合式函数中；关键不是词法位置，而是调用栈必须仍同步起源于 `setup()`。

### 2. 用首次渲染区分 before mount 与 mounted

`onBeforeMount()` 调用时，响应式状态已经准备好，但组件自己的 DOM 节点尚未创建。它适合记录
即将挂载或完成不依赖 DOM 的最后准备，不适合查询组件 DOM。

`onMounted()` 调用时，同步子组件已经挂载，组件自己的 DOM 树已经创建并插入父容器。只有应用的
根容器本身位于 document 内，才能进一步保证组件 DOM 已在 document 内。因此不要把 mounted
简化成“页面一定可见”或“所有异步子树都完成”。

```ts
onBeforeMount(() => {
  console.log('组件 DOM 尚未创建')
})

onMounted(() => {
  console.log('同步子树和组件 DOM 已挂载')
})
```

### 3. 用一次批量更新区分 before update 与 updated

父组件同步执行两次 `count.value++`。响应式值立即变为最终值，但 DOM 不会同步修补两次；组件更新
任务进入队列并去重。`onBeforeUpdate()` 在本轮 DOM 修补前运行，可观察旧 DOM；`onUpdated()` 在
修补后运行，可观察最终 DOM。

官方明确允许在 `onBeforeUpdate()` 中修改响应式状态；`onUpdated()` 则禁止这样做，因为它很容易
让组件更新再次触发自己，形成无限更新循环。常规用户操作应直接放在事件处理函数中，不要为了
“等组件更新”而搬进 `onUpdated()`。

### 4. 再加入父子组件，观察方向相反的两半

固定版本官方测试给出三层组件的完整顺序。课程 Demo 简化为父子两层：

| 阶段 | before 半段 | 完成半段 |
| --- | --- | --- |
| 首次挂载 | 父 `onBeforeMount` → 子 `onBeforeMount` | 子 `onMounted` → 父 `onMounted` |
| prop 驱动更新 | 父 `onBeforeUpdate` → 子 `onBeforeUpdate` | 子 `onUpdated` → 父 `onUpdated` |
| 整棵子树卸载 | 父 `onBeforeUnmount` → 子 `onBeforeUnmount` | 子 `onUnmounted` → 父 `onUnmounted` |

这个顺序只用于真实父子同步子树。不要把它外推为 Suspense、异步组件、KeepAlive、Teleport 或跨
应用根节点的通用顺序。本课也不要求业务代码依赖兄弟组件之间的钩子先后。

### 5. 用资源所有权教授卸载清理

`onBeforeUnmount()` 调用时，组件实例仍完整可用，适合在释放前读取实例状态或发出最后的同步
通知。`onUnmounted()` 调用时，所有子组件已经卸载，组件的渲染作用以及 setup 阶段创建的 computed
和 watcher 已停止；它适合清理 timer、DOM listener、观察器和外部连接。

```ts
let intervalId: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  intervalId = setInterval(refreshClock, 1000)
})

onUnmounted(() => {
  if (intervalId !== undefined) clearInterval(intervalId)
})
```

不要由此推断所有副作用都会自动停止。Vue 会停止自己管理的响应式作用，但浏览器 timer、手工
`addEventListener()`、WebSocket 或第三方实例仍由创建它们的组件负责释放。

### 6. 最后引入 nextTick，而不是把它当生命周期钩子

状态赋值后若只需要等待本轮 Vue DOM 更新，使用：

```ts
count.value++
await nextTick()
```

`nextTick()` 返回 Promise。调用但不 `await` 不会暂停后续代码；先 await 再修改状态也无法等待之后
才排入的更新。它只关联调用时已有或正在执行的 Vue 调度冲刷，不保证浏览器已绘制，也不等待
fetch、timer、动画、第三方库或任意业务 Promise。

### 7. 以注册约束和 SSR 收尾

正确注册发生在 setup 的同步调用栈中：

```ts
onMounted(startClientFeature)

useClientFeature() // 组合式函数内部同步调用 onMounted 也有效
```

错误做法是在 `setTimeout()`、Promise 回调或普通 async 函数越过 `await` 后才调用
`onMounted()`。此时当前组件实例通常已经丢失，Vue 无法把钩子归属到组件。

SSR 会执行 `setup()` / `<script setup>` 根作用域，但本课六个 mount/update/unmount 钩子都不会
运行。需要依靠 unmount 清理的客户端副作用应在 `onMounted()` 中创建，而不是在 setup 根作用域
先创建，否则服务端没有对应清理钩子。

## 最小核心知识

### 六个核心钩子的准确边界

| 钩子 | 调用时组件状态 | 适合 | 不适合 |
| --- | --- | --- | --- |
| `onBeforeMount` | 状态已建立，组件 DOM 未创建 | 不依赖 DOM 的挂载前准备 | 查询或操作组件 DOM |
| `onMounted` | 同步子组件与组件 DOM 已挂载 | 建立 DOM/浏览器相关副作用 | 假定异步子树或网络已完成 |
| `onBeforeUpdate` | 响应式状态已变，DOM 仍是旧值 | 读取更新前 DOM，必要时调整状态 | 当作每次赋值都会调用 |
| `onUpdated` | 本轮组件 DOM 已更新 | 读取更新后 DOM，少量外部同步 | 修改响应式状态 |
| `onBeforeUnmount` | 实例仍完整可用 | 卸载前同步收尾 | 假定子组件都已卸载 |
| `onUnmounted` | 子组件已卸载，相关响应式作用已停止 | 释放外部资源 | 继续依赖组件渲染或 watcher |

`onMounted()` 和 `onUpdated()` 描述的是组件渲染边界，不是浏览器绘制帧。若产品逻辑真正要求
“已经绘制”，那是另一类浏览器调度问题，不应继续叠加 `nextTick()` 猜测。

### 更新是批量调度，不是每次赋值同步渲染

Vue 会把组件更新任务加入异步队列。同一个任务已带 `QUEUED` 标记时，再次入队会被忽略；因此
同一同步调用栈中连续修改同一个组件依赖，通常只执行一次组件更新并呈现最终状态。

“通常”很重要：显式允许递归的内部任务、更新过程中新增的其他任务和不同 tick 中的修改仍可能
产生后续更新。课程主线只要求理解普通组件的同步多次赋值会合并，不承诺所有响应式副作用永远
只执行一次。

### nextTick 等待当前 Vue flush

`scheduler.ts` 中 `nextTick()` 选择 `currentFlushPromise || resolvedPromise`。这形成三个直接判断：

1. 已有 Vue 更新排队时，它等待当前 flush 完成。
2. 当前没有 flush 时，它只返回一个已解决 Promise 的微任务边界。
3. 调用之后才由其他异步来源产生的更新，不属于这次等待的承诺。

因此 `nextTick()` 是“本轮 Vue 更新完成”工具，不是“所有异步工作完成”工具，也不等于
`requestAnimationFrame()`。

### 生命周期钩子的同步注册约束

`onMounted()` 等 API 默认把回调注入 `currentInstance`。Vue 只在 setup 的同步执行期间维护当前
实例；异步回调执行时通常没有目标实例，开发环境会警告并跳过注册。

同步调用的组合式函数可以注册钩子：

```ts
/** 为当前组件同步注册窗口监听。 */
function useWindowResize() {
  onMounted(addResizeListener)
  onUnmounted(removeResizeListener)
}

useWindowResize()
```

“同步注册”不等于“回调只能同步”。钩子回调本身可以启动异步工作；受约束的是调用
`onMounted(callback)` 的注册时机。

### 父子顺序应当可观察，但不应成为脆弱耦合

`v3.5.40` 官方生命周期测试对 root → mid → child 的 mount、update、unmount 完整顺序有明确
断言。这能帮助学习者判断 DOM 和 prop 何时稳定，但不应据此让父组件读取子组件内部状态，或让
兄弟组件通过钩子顺序通信。

Props/Emits 关联只解释一条链：子组件发出事件后，父级 handler 同步修改父状态；该状态作为 prop
在同一调度批次向下刷新，于是父 update job 先运行，子 updated hook 先完成。事件是否发出与 DOM
是否已更新是两个不同时间点。

### watcher flush 只做关联，不重讲 API

默认 watcher 回调位于父组件更新后、所属组件 DOM 更新前。必须读取所属组件更新后 DOM 时，可用
post flush。生命周期课只用这条对照防止误选 `onUpdated()`；watch source、清理、deep、once 等内容
仍由 Watchers 课程负责。

### SSR 的 setup 与客户端钩子不对称

服务端没有动态 DOM 更新，本课列出的 mount/update/unmount 钩子均不调用；但 setup 根作用域会
执行。若在那里创建永续 timer，再期待 `onUnmounted()` 清理，服务端资源就会泄漏。把浏览器专属且
需要清理的副作用推迟到 `onMounted()`，能同时满足客户端时机和 SSR 边界。

## Vue 3.5.40 源码与测试推导

### 1. 钩子默认注入当前组件实例

`apiLifecycle.ts` 的 `createHook()` 默认把 `currentInstance` 作为 target，再由 `injectHook()` 把
包装后的回调加入实例对应钩子数组。没有 target 时无法建立归属，这就是异步注册失败的实现原因。

### 2. 生命周期回调执行时暂停依赖追踪

`injectHook()` 创建的包装器在调用用户回调前 `pauseTracking()`，结束后 `resetTracking()`。因此
钩子里偶然读取某个 ref 不会把它新增为当前渲染作用的依赖；钩子触发仍由生命周期阶段决定，不是
由钩子内读取的响应式值决定。

### 3. SSR setup 阶段会跳过客户端钩子注入

`createHook()` 在 `isInSSRComponentSetup` 为真时，除 `SERVER_PREFETCH` 外不执行 `injectHook()`。
这不只是“服务器没有 DOM”这一解释，而是固定版本实现直接不注册本课六个客户端钩子。

### 4. renderer 把 mounted、updated 和 unmounted 放入 post-render 队列

`renderer.ts` 在 DOM patch 前同步调用 before hooks，把 mounted、updated 和 unmounted hooks 交给
`queuePostRenderEffect()`。这解释了 before 钩子可观察旧 DOM，而完成钩子在本轮 patch 后执行。

### 5. 官方测试固定了同步父子完整顺序

`apiLifecycle.spec.ts` 的 `lifecycle call order` 用 Root、Mid、Child 三层断言：三个 before 阶段均
从外到内，mounted、updated、unmounted 完成阶段均从内到外。课程表格来自这一固定版本测试，
而不是基于组件名称的推测。

### 6. 组件更新任务按 ID 从父到子排序并去重

`scheduler.ts` 说明父组件先创建，组件 ID 更小，因此更新队列按 ID 递增可让父更新先于子更新；
父更新卸载子组件时，还能跳过已无效的子任务。`queueJob()` 同时用 `QUEUED` 标记避免同一任务重复
入队，形成同步多次状态修改的批量行为。

### 7. nextTick 只链接当前 flush Promise

`nextTick()` 不创建“等待全部异步”的追踪器，只返回 `currentFlushPromise || resolvedPromise`，并在
有回调时用 `.then()` 连接。这是“状态修改应先发生”“没有 await 不会暂停”“不等待网络和 timer”
三类教学判断的共同源码依据。

### 8. 递归保护是错误兜底，不是合法更新模式

调度器的开发分支以 `RECURSION_LIMIT = 100` 检测任务递归，并报告“响应式作用正在修改自己的
依赖”。它能帮助定位 `onUpdated()` 写状态造成的循环，但不应教成“最多更新 100 次也安全”；正确
设计仍是移除自触发写入。

## 高质量常见易错点

### 1. 在 onMounted 中假定整个页面和所有异步子树已完成

**错误判断：** mounted 等于页面所有内容、请求、异步组件和图片都完成。

**准确边界：** 它只保证同步子组件和本组件 DOM 树已挂载；document 归属还取决于根容器。需要
等待的外部资源必须等待自己的 Promise 或事件。

### 2. 在 onUpdated 中修改响应式状态

**错误写法：**

```ts
onUpdated(() => {
  count.value++
})
```

这会让更新完成后再次安排更新，可能触发最大递归更新错误。用户动作放事件处理函数，派生值用
computed，特定副作用用 watcher；不要用 updated 驱动组件自己的常规状态机。

### 3. 认为每次连续赋值都会对应一次 DOM 和一组钩子

```ts
count.value++
count.value++
```

响应式状态会同步变两次，但普通组件更新任务在同一队列去重，DOM 通常只呈现最终值，beforeUpdate
和 updated 也各执行一次。若确实要观察两个中间 DOM，需要在两次赋值之间分别等待 flush，但业务
代码不应为展示无意义中间态而滥用它。

### 4. 调用 nextTick 却没有 await

```ts
count.value++
nextTick()
console.log('这里仍是同步后续代码')
```

`nextTick()` 返回 Promise。只有 `await nextTick()` 或传入回调，后续读取才会发生在当前 Vue flush
之后。

### 5. 先 await nextTick，再修改状态并期待 DOM 已更新

一次 nextTick 只能连接调用时已有的 flush。正确顺序是先修改状态，再等待，再读取本轮结果：

```ts
count.value++
await nextTick()
readUpdatedResult()
```

### 6. 把 nextTick 当作浏览器绘制或所有异步的等待器

`await nextTick()` 不等待 fetch、setTimeout、图片加载、CSS transition、异步组件 loader 或浏览器
绘制帧。每种任务都应等待自己的完成信号；需要绘制帧时属于浏览器 API 主题，不在本课内。

### 7. 在异步回调里注册生命周期钩子

```ts
setTimeout(() => {
  onMounted(startFeature)
})
```

回调运行时 setup 已结束，当前组件实例已丢失。应同步注册钩子，再让已注册的回调在生命周期到达时
启动需要的异步工作。

### 8. 以为组件卸载会自动清理所有外部资源

Vue 会停止相关渲染作用、computed 和同步创建的 watcher，但不会替用户清理 timer、DOM listener、
WebSocket 或第三方实例。创建与释放应由同一组件成对管理。

### 9. 在 SSR 的 setup 根作用域创建需卸载清理的副作用

setup 会在服务端执行，本课的 unmount hooks 不会。把 interval 放在 setup 根作用域，再只在
`onUnmounted()` 清理，会让服务端 timer 持续存在。此类仅客户端副作用应在 `onMounted()` 创建。

### 10. 把固定版本父子顺序外推到所有高级组件

同步普通组件的官方测试顺序不能替代 Suspense、KeepAlive、Teleport 或异步组件各自的契约。
课程 Demo 保持普通父子树，业务代码也不应依赖兄弟组件或跨根节点的微妙先后。

## 源码推导出的高级使用场景

### 1. 把第三方实例的创建与销毁放在同一所有者组件

在 mounted 创建图表、编辑器或 observer，在 unmounted 调用其 dispose/disconnect。资源句柄保存在
组件闭包中，不放进全局变量，也不依赖 Vue 自动清理非响应式资源。

### 2. 用 beforeUpdate 保存更新前的 DOM 状态

需要维持滚动锚点等场景，可在 beforeUpdate 读取旧状态，在 updated 或 post watcher 中应用新状态。
这需要模板引用，因此只作为后续课程衔接，不进入本课 Demo。

### 3. 用 nextTick 做一次明确的更新后操作

事件处理函数修改状态后，需要一次聚焦、滚动或测量时，直接在该函数中 `await nextTick()`，通常比
全局 `onUpdated()` 更精确：它只响应这次动作，不会被组件的所有其他更新触发。

### 4. 用非响应式缓冲记录生命周期调试时间线

在钩子中直接把日志追加到响应式数组会让日志 UI 自己触发更新。调试工具可先写入普通数组，等待
原更新 flush 完成后暂停记录，再一次性发布副本。课程 Demo 用这一模式保证时间线不制造自身循环。

### 5. 用父子时序验证 prop 更新链

集成测试可以让父 handler 同步修改状态，再断言同一 flush 中父 beforeUpdate、子 beforeUpdate、
子 updated、父 updated 的顺序和最终 DOM。只写一条 tracer 测试即可，不必为每个钩子拆测试。

### 6. 把仅客户端副作用推迟到 mounted

共享 SSR/客户端代码中，浏览器 API 和需清理的 timer 都在 mounted 建立。这既防止服务端访问
`window` / `document`，也保证客户端一定存在对应 unmount 清理路径。

## 单一同源 Demo 冻结

### 名称、ID 与主命题

唯一 Demo 命名为“生命周期更新时序实验台”，精确资产 ID：

`vue.core.learn.intermediate.lifecycle-update-timing.lifecycle-update-timeline-demo`

它只验证一个主命题：**同一同步任务中的状态修改会批量刷新；普通父子组件的 before 钩子由外到内，
完成钩子由内到外，`await nextTick()` 后才能发布本轮完整时序。**

### 文件结构与同源约束

```text
src/content/demos/vue/core/learn/intermediate/lifecycle-update-timing/
├─ lifecycle-update-timeline-demo.vue
└─ parts/
   └─ LifecycleChildPanel.vue
```

- `lifecycle-update-timeline-demo.vue` 是唯一公开 Demo ID、运行入口和源码面板 raw source 来源。
- 父文件保存 `count`、`childVisible`、当前时间线和非响应式暂存数组。
- `LifecycleChildPanel.vue` 是私有真实子 SFC，用 prop 接收 count，注册同一组六个核心钩子。
- 私有子组件不注册第二个 Demo ID，不复制成内联假组件，不新增多文件源码查看器。
- 子组件可通过已学 Props/Emits 把钩子标签交给父级非响应式记录函数；这只是实验打点，不展开
  组件通信教学。
- 当前 registry 按约定发现父 Demo；不为本课修改 registry 或 schema。

### 状态、日志与防循环策略

父级保留：

- `count = 0`：父级唯一业务状态，通过 prop 传给子级。
- `childVisible = true`：切换普通子组件的挂载和卸载。
- `timeline: string[]`：只在一次动作完成后展示冻结结果。
- `pendingEntries: string[]`：普通非响应式数组，钩子执行时只写入这里。
- `recording: boolean`：发布 timeline 前设为 false，避免日志 UI 自身更新被再次记录。

“同步增加两次”的处理顺序冻结为：清空 pending → 开启 recording → 连续两次 `count++` →
`await nextTick()` → 关闭 recording → 一次性发布 pending 副本。预期 count 从 0 变 2，但父子
beforeUpdate/updated 各只记录一次。

“隐藏子组件”与“重新显示子组件”也使用相同记录事务：修改 `childVisible` 后等待 nextTick，再发布
本轮时间线。不要在任一 updated hook 中修改响应式日志，不要用 watcher 驱动日志。

### 必须可验证的交互顺序

1. 初始显示父级 count `0` 与子级 prop `0`，子组件处于已挂载状态。
2. 点击“同步增加两次”，最终父子都显示 `2`，时间线依次为父 beforeUpdate、子 beforeUpdate、
   子 updated、父 updated，四项各一次。
3. 点击“隐藏子组件”，父级更新包围子级 beforeUnmount / unmounted；子面板从 DOM 移除。
4. 点击“显示子组件”，父级更新包围子级 beforeMount / mounted；新子面板显示当前 count `2`。
5. 再执行一次同步增加两次，最终 count 为 `4`，仍只出现一轮父子更新钩子。
6. 页面解释明确区分“响应式值已改变”“DOM flush 完成”和“浏览器绘制”，不显示伪造毫秒时间。
7. “清空记录”只清空已发布时间线，recording 保持 false，不把清空动作记录成业务更新。

Demo 不使用模板引用、watcher、KeepAlive、Suspense、Teleport、Transition、动态组件、Provide/Inject、
store、timer、远程请求或浏览器绘制测量。SSR 只在正文说明，不在浏览器 Demo 模拟。

### 布局与可访问性约束

- 390px 下严格单列；宽屏可用 flex 排列控制区、子组件和时间线，不使用 CSS Grid 或 `gap`。
- flex 子项设置 `min-width: 0`，区块间用 margin 或相邻选择器留白，长钩子名称允许换行。
- 所有操作使用原生 `<button type="button">`，最小触控高度 44px。
- “同步增加两次”“隐藏子组件 / 显示子组件”“清空记录”都有完整可见名称，不只用图标。
- 当前 count、子组件可见状态、日志序号和钩子名称均用文本表达，不只依赖颜色。
- 时间线可使用 `aria-live="polite"`，但一次动作只发布一次，避免逐条重复播报。
- 隐藏按钮按当前状态切换准确文案；操作区不因文案长度变化而挤压或跳动。
- 200% 文本缩放和 390px 宽度下按钮文字不截断，不产生页面级横向滚动。
- 源码入口可读取唯一父 Demo 文件，`.demo-box .missing` 必须为 `0`。

## 建议 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.lifecycle-update-timing',
  type: 'lesson',
  title: '生命周期与更新时机',
  summary: '在组件挂载、更新和卸载的正确阶段执行逻辑，并等待本轮 DOM 更新',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.basics.emits'],
  related: [
    'vue.core.reference.composition.lifecycle',
    'vue.core.reference.application.next-tick',
  ],
  tags: ['生命周期', 'onMounted', 'onUpdated', 'onUnmounted', 'nextTick', '更新时机'],
  sources: [
    {
      title: 'Vue 生命周期指南',
      url: 'https://cn.vuejs.org/guide/essentials/lifecycle.html',
    },
    {
      title: 'Vue 组合式 API 生命周期钩子',
      url: 'https://cn.vuejs.org/api/composition-api-lifecycle.html',
    },
    {
      title: 'Vue nextTick',
      url: 'https://cn.vuejs.org/api/general.html#nexttick',
    },
    {
      title: 'Vue SSR 组件生命周期钩子',
      url: 'https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks',
    },
    {
      title: 'Vue watcher 回调触发时机',
      url: 'https://cn.vuejs.org/guide/essentials/watchers.html#callback-flush-timing',
    },
    {
      title: 'Vue 3.5.40 apiLifecycle.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts',
    },
    {
      title: 'Vue 3.5.40 scheduler.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/scheduler.ts',
    },
    {
      title: 'Vue 3.5.40 apiLifecycle.spec.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiLifecycle.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 45,
})
```

本地冻结建议“唯一 prerequisite 为 Emits、related 仅 lifecycle reference 与 nextTick reference”与
当前线性路线和可导航 reference ID 一致。不要提前关联尚未实现的模板引用课，也不要把 Watchers
作为重复直接前置。

## 后续实施范围建议

后续实现可限定为：

- `src/content/entries/learn/vue/core/intermediate/lifecycle-update-timing.ts`
- `src/content/demos/vue/core/learn/intermediate/lifecycle-update-timing/lifecycle-update-timeline-demo.vue`
- `src/content/demos/vue/core/learn/intermediate/lifecycle-update-timing/parts/LifecycleChildPanel.vue`
- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/progress.spec.ts`
- `docs/重构实施计划.md`

不需要修改 schema、Demo registry 实现、现有 lifecycle / nextTick reference、全局样式或其他课程。
实现时只把本课从 planned 改为 available；不能同时开始 template-refs，也不能把本课完成写成中级
阶段或整条 Vue 学习路线关闭。

最小验证只需覆盖：课程位置与唯一 prerequisite、两个 related ID 可解析、唯一 Demo ID 可解析、
同步双增只产生一轮父子 update hooks、隐藏/显示产生正确 unmount/mount hooks、390px 无横向滚动。
不要为六个钩子各拆一条测试。

## 固定来源清单

### Vue 官方文档

- [Vue 中文官网：生命周期指南](https://cn.vuejs.org/guide/essentials/lifecycle.html)：生命周期用途、
  常用钩子和 setup 同步注册约束。
- [Vue 中文官网：组合式 API 生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle.html)：
  六个钩子的 DOM、子组件、实例、作用停止与 SSR 边界，以及 updated 写状态警告。
- [Vue 中文官网：nextTick](https://cn.vuejs.org/api/general.html#nexttick)：DOM 更新批量、Promise 返回值
  和状态修改后的等待方式。
- [Vue 中文官网：响应式基础的 DOM 更新时机](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#dom-update-timing)：
  状态变化后 DOM 不同步更新与同 tick 去重。
- [Vue 中文官网：watcher 回调触发时机](https://cn.vuejs.org/guide/essentials/watchers.html#callback-flush-timing)：
  默认 pre 与 post watcher 相对所属组件 DOM 的位置。
- [Vue 中文官网：SSR 组件生命周期钩子](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)：
  setup / created 与客户端钩子不对称、timer 泄漏及浏览器 API 延迟访问建议。

### vuejs/core v3.5.40

- [`packages/runtime-core/src/apiLifecycle.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts)：
  currentInstance 注入、回调包装、依赖追踪暂停、SSR 跳过注册和六个 Hook 工厂。
- [`packages/runtime-core/src/scheduler.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/scheduler.ts)：
  父子任务排序、队列标记去重、flush Promise、`nextTick()` 和递归更新保护。
- [`packages/runtime-core/src/renderer.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts)：
  before hooks 与 DOM patch 的相对位置、post-render 完成钩子和组件卸载流程。
- [`packages/runtime-core/__tests__/apiLifecycle.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiLifecycle.spec.ts)：
  before/after DOM 断言、beforeUpdate 状态修改与三层父子完整顺序。
- [`packages/runtime-core/__tests__/scheduler.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/scheduler.spec.ts)：
  `nextTick()` Promise、任务排序、重复入队去重和显式递归任务的官方回归证据。

## 结论

本课应把生命周期教成“组件阶段与资源所有权”，把 `nextTick()` 教成“等待当前 Vue DOM flush”，
而不是钩子/API 清单。唯一“生命周期更新时序实验台”用真实父子组件、同步双增和显示/隐藏三条
操作，就能同时证明批量更新、父子方向、卸载清理边界与 nextTick 的等待位置。

最值得转化为教学判断的源码证据是：钩子依赖当前实例同步注入；renderer 把 before 与完成钩子
分处 patch 两侧；scheduler 按父子 ID 排序并用队列标记去重；nextTick 只连接当前 flush Promise。
模板引用、高级内置组件、完整 watcher 和 SSR 架构都应留在各自课程，不扩大本课范围。
