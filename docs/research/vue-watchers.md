# Vue Core 基础课程：侦听器调研

> 核验日期：2026-07-30
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 中文官网、Vue 官方文档、`vuejs/core` 的 `v3.5.40` 固定标签源码与
> 同标签官方测试。外部资料通过 Tavily 检索、提取后，所有结论均回到这些一手来源核验。

## 课程定位与边界

本课目标 ID 为 `vue.core.learn.basics.watchers`。现有课程清单把它放在
`vue.core.learn.basics.reactive-state`、`vue.core.learn.basics.computed-properties` 之后，
三课共同构成“响应式与派生状态”：先保存事实，再计算派生值，最后只在状态变化需要触发
外部动作时使用侦听器。

从 computed 过渡时应先建立一个判断句：

- **需要一个可读取、可缓存的同步结果**，使用 `computed()`；例如筛选结果、总价、状态文案。
- **需要执行结果之外的动作**，才使用 `watch()` / `watchEffect()`；例如请求数据、写入存储、
  控制计时器、同步第三方实例，或在正确时机读取 DOM。

这条边界比记 API 参数更重要。Vue 官方计算属性指南要求 getter 无副作用；侦听器指南则把
watcher 定位为“响应式地执行副作用”。若用 watcher 把一个 ref 手工同步成另一个 ref，学习者
会得到两份可能失去同步的状态，也绕过了 computed 的派生关系与缓存。

新手主线使用 Composition API、`<script setup>` 和 TypeScript，只讲足以完成真实副作用的内容：

1. `watch()` 的单一 ref/getter 源、惰性执行和新旧值。
2. 多源数组、`immediate`、`once`，以及直接侦听 reactive 对象的深层语义。
3. `watchEffect()` 的立即执行、自动依赖收集，以及与 `watch()` 的选择标准。
4. 异步请求失效时的清理，默认 `pre` 与需要 DOM 时的 `post`。
5. `WatchHandle` 的暂停、恢复和停止。

以下内容放入课末进阶区，不抢占第一次学习的主线：数字深度、`sync`、
`watchPostEffect()` / `watchSyncEffect()`、异步创建 watcher 的所有权、`effectScope()`、
`onTrack` / `onTrigger`。Options API 的 `watch` 只说明存在，不并行教授两套写法；SSR、Suspense
调度和内部队列实现不进入基础课正文。

**课程依据：** [Vue 计算属性指南](https://cn.vuejs.org/guide/essentials/computed.html)、
[Vue 侦听器指南](https://cn.vuejs.org/guide/essentials/watchers.html)、
[`vue-core-track.ts`](../../src/content/catalog/manifests/vue-core-track.ts)。

## 学习目标

完成本课后，学习者应能：

1. 先判断任务是派生值还是副作用，不用 watcher 重建 computed。
2. 为 `watch()` 选择 ref、getter、reactive 对象或多源数组，并预测何时触发。
3. 根据“显式控制”与“自动追踪”选择 `watch()` 或 `watchEffect()`。
4. 用 `immediate`、`once`、`deep` 和 `flush` 表达真实需求，而不是默认堆叠选项。
5. 在异步副作用失效前注册清理，避免旧请求覆盖新结果。
6. 解释 `pause()`、`resume()`、`stop()` 的差异，以及组件卸载时的自动停止边界。

## 建议教学顺序

### 1. 从 computed 的边界进入 watcher

先复用上一课的“课程搜索”状态。过滤后的课程数量是一个值，使用 computed；把查询条件发送给
服务端是一个动作，使用 watcher。不要直接以“watch 能监听变量”开场，否则学习者容易把它当成
第二套派生状态工具。

```ts
const visibleCount = computed(() => filterLocally(courses.value, query.value).length)

watch(query, (nextQuery) => {
  void loadRemoteCourses(nextQuery)
})
```

### 2. 先教最小 `watch()`

从一个 `ref` 源开始：`watch(source, callback)` 默认只记录初始值，源真正改变后才调用回调；
回调得到 `newValue`、`oldValue` 与 `onCleanup`。这一步只引入“源与副作用分开”的模型。

```ts
const query = ref('vue')

watch(query, (nextQuery, previousQuery) => {
  console.log(previousQuery, '->', nextQuery)
})
```

### 3. 扩展到 getter、reactive 对象和多源数组

先用 getter 解决“侦听 reactive 的一个属性”，再讲数组源。直接侦听整个 reactive 对象会隐式
深层追踪，应作为有成本的特殊选择，不是默认写法。

```ts
const filters = reactive({ category: 'core', page: 1 })

watch(() => filters.page, resetScroll)

watch([query, () => filters.category], ([nextQuery, nextCategory]) => {
  void loadRemoteCourses(nextQuery, nextCategory)
})
```

### 4. 用初始化需求引入 `immediate`，用单次变化引入 `once`

`watch()` 默认惰性；需要“创建时先执行一次，之后继续响应变化”才用 `immediate: true`。只关心
第一次回调则使用 `once: true`。源码把 `once` 实现为“回调返回后立即 stop”，因此
`immediate: true` 与 `once: true` 同时使用时，创建时的那次回调就是唯一一次。

### 5. 在理解显式源后再引入 `watchEffect()`

`watchEffect()` 创建时通常立即运行，并在本次**同步执行期间**自动收集读取到的响应式依赖。
它适合“副作用使用的状态就是触发条件”的小而内聚逻辑；需要旧值、懒执行或精确限制触发源时，
仍选择 `watch()`。

```ts
watchEffect(() => {
  document.title = `${query.value} · ${resultCount.value} 条结果`
})
```

### 6. 在第一次异步示例中同时教授失效清理

不要先给出无清理的 fetch，再把竞态留到高级章节。请求可能乱序返回，清理是异步 watcher 的
正确性组成部分。`onWatcherCleanup()` 必须在首次 `await` 前同步调用；回调参数 `onCleanup`
绑定于当前 watcher，不受该同步限制，但课程示例仍应在启动任务后立即注册。

### 7. 最后讲 flush 与句柄生命周期

默认 `pre` 足以完成绝大多数状态到外部系统的同步。只有必须读取所属组件更新后的 DOM 时才使用
`post`；`sync` 不批量，应留在明确需要同步失效的小型布尔状态等少数场景。最后用
`pause()` / `resume()` / `stop()` 建立“暂缓”和“永久释放”的差异。

## 最小核心知识

### `watch()` 与 `watchEffect()` 对照

| 维度 | `watch()` | `watchEffect()` |
| --- | --- | --- |
| 依赖 | 显式传入一个或多个源 | 自动追踪同步执行时读取的响应式值 |
| 首次执行 | 默认惰性；`immediate` 可改 | 默认立即；`flush: 'post'` 的首次运行会排入后置队列 |
| 回调参数 | 新值、旧值、`onCleanup` | `onCleanup`，没有新旧值 |
| 触发控制 | 只由指定源决定，不追踪回调内读取 | 本轮实际读取什么，本轮就依赖什么 |
| 优先场景 | 精确触发、旧值比较、懒执行 | 多个紧密相关依赖驱动同一个简单副作用 |

依据：[侦听器指南：watchEffect 与 watch](https://cn.vuejs.org/guide/essentials/watchers.html#watch-vs-watcheffect)、
[响应式核心 API](https://cn.vuejs.org/api/reactivity-core.html#watcheffect)。

### `watch()` 的 source 类型

| source | 最小示例 | 触发语义 |
| --- | --- | --- |
| ref / computed ref | `watch(query, callback)` | `.value` 按 `Object.is` 语义发生变化时触发 |
| getter | `watch(() => state.page, callback)` | getter 的返回值变化时触发；默认不深查返回对象 |
| reactive 对象 | `watch(state, callback)` | 隐式深层追踪；嵌套修改会触发 |
| source 数组 | `watch([query, () => state.page], callback)` | 任一成员变化时触发，回调收到对应的新旧值数组 |

`watchEffect()` 没有独立 source 参数；用户函数本身既执行副作用，也在执行过程中成为依赖收集
入口。有效 source 及无效源警告可在
[`watch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts) 的
`isRef`、`isReactive`、`isArray`、`isFunction` 分支中核对。

### `deep`、`immediate`、`once`

| 选项 | 默认 | 准确行为 | 课程提示 |
| --- | --- | --- | --- |
| `immediate` | `false` | 创建时立即调用一次；单源首次 `oldValue` 为 `undefined` | 用于初次加载与后续重载共用逻辑 |
| `once` | `false` | 第一次回调执行后自动停止；Vue 3.4+ | 与 `immediate` 同用时立即执行就是唯一一次 |
| `deep` | `false` | getter 返回对象时递归收集；Vue 3.5+ 可传最大深度数字 | 大对象优先改成精确 getter/source 数组 |

直接把 reactive 对象作为 source 是例外：未提供 `deep` 时会递归遍历整个对象。`v3.5.40`
源码还表明，对直接 reactive 源显式设置 `deep: false` 或 `deep: 0` 时会遍历一层根属性，而不是
完全不读取对象；这是适合放进进阶提示的固定版本实现语义。

### flush 时机

| `flush` | 执行时机 | 批量 | 适用 |
| --- | --- | --- | --- |
| `'pre'` | 父组件更新后、所属组件 DOM 更新前 | 是 | 默认；请求、存储、第三方状态同步 |
| `'post'` | 所属组件 DOM 更新后 | 是 | 必须读取或调整更新后 DOM |
| `'sync'` | 响应式依赖触发时同步执行 | 否 | 极少量、低频、确需同步失效的状态 |

`watchPostEffect()` 是 `watchEffect(..., { flush: 'post' })` 的别名，`watchSyncEffect()` 是
`flush: 'sync'` 的别名。`apiWatch.ts` 把 post 任务交给 `queuePostRenderEffect`，把默认 pre
任务交给 `queueJob`；sync 不安装队列调度器。这也解释了为何 sync 会对同步连续变更逐次执行。

依据：[侦听器指南：回调的触发时机](https://cn.vuejs.org/guide/essentials/watchers.html#callback-flush-timing)、
[`apiWatch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiWatch.ts)、
[`apiWatch.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiWatch.spec.ts)。

### 清理与异步失效

每次 watcher 重新执行前，Vue 先运行上一轮登记的清理；`stop()` 时也会运行最后一轮清理。
这提供的是“失效通知”，不会自动取消 Promise、fetch、定时器或事件监听，用户代码必须把具体的
取消动作登记进去。

```ts
watch(
  query,
  async (nextQuery, _oldQuery, onCleanup) => {
    const controller = new AbortController()
    onCleanup(() => controller.abort())

    const response = await fetch(`/api/search?q=${encodeURIComponent(nextQuery)}`, {
      signal: controller.signal,
    })
    results.value = await response.json()
  },
  { immediate: true },
)
```

Vue 3.5+ 还可从 `vue` 导入 `onWatcherCleanup()`。它依赖“当前正在同步执行的 watcher”，所以必须
在 `await` 前登记；作为回调参数传入的 `onCleanup` 与 watcher 实例绑定，不受这个同步限制。
为了让资源从创建起就有明确所有者，推荐两者都在启动异步任务后立即登记。

### 暂停、恢复与停止

`watch()` 与 `watchEffect()` 返回同一种 `WatchHandle`：

```ts
const handle = watch(source, callback)

handle.pause()
handle.resume()
handle.stop()
// handle() 与 handle.stop() 等价
```

- `pause()` 只暂停后续调度，不清理依赖，也不会取消已经启动的异步任务。
- 暂停期间若依赖变化多次，`effect.ts` 用 `WeakSet` 只记一份待处理 effect；`resume()` 后触发
  一次检查，watch 回调看到上次有效值与恢复时的最新值。
- `stop()` 永久退订依赖并执行清理；停止后不能靠 `resume()` 重新启用。
- 在 `setup()` / `<script setup>` 中同步创建的 watcher 会绑定组件并在卸载时自动停止；在
  `setTimeout`、Promise 回调等异步位置才创建的 watcher 不会自动绑定，必须保存句柄并停止。

依据：[响应式核心 API：WatchHandle](https://cn.vuejs.org/api/reactivity-core.html#watch)、
[侦听器指南：停止侦听器](https://cn.vuejs.org/guide/essentials/watchers.html#stopping-a-watcher)、
[`effect.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts)。

## 源码与测试证据

### 1. 所有 source 最终都归一化为 getter

`watch.ts` 对 ref 使用 `() => source.value`，对函数直接使用函数本身，对 reactive 对象调用
`reactiveGetter()`，对数组逐项执行同样的归一化。无效的普通值无法建立响应式依赖，因此会在
开发环境警告。

### 2. deep 的本质是遍历读取，不是对象快照

`traverse()` 递归读取 ref、数组、Set、Map 和普通对象的内容，使这些属性在 getter 运行期间被
追踪。`deep: true` 使用无限深度，数字 deep 作为最大深度；遍历不会克隆对象，所以嵌套原地修改
时新旧参数仍可能是同一引用。

### 3. job 先比较，再清理，再调用回调

依赖触发后，job 重新运行 getter。`immediateFirstRun`、`deep`、`forceTrigger` 或 `hasChanged`
满足其一时才进入回调；进入后先执行上一轮 cleanup，再传入新值、旧值和绑定的 cleanup 注册器。
这解释了 getter source 的结果未变时不会回调，也解释了 deep watcher 为什么即使对象身份相同也
会执行。

### 4. `once`、暂停和停止都复用同一个 effect 生命周期

`once` 包装用户回调并在它返回后调用 watch handle；handle 的 stop 会执行 `effect.stop()` 并从
当前 effect scope 移除。pause/resume 则直接绑定到 `ReactiveEffect.pause/resume`，没有另一套
状态机。

### 5. runtime 层只负责组件调度与错误归属

核心依赖收集在 `packages/reactivity/src/watch.ts`；组件上下文中的 pre/post/sync 队列、实例
错误处理和 SSR 分支在 `packages/runtime-core/src/apiWatch.ts`。基础课可以用这个分层解释可观察
时机，但无需展示完整内部实现。

上述行为均可由 `v3.5.40` 的
[`watch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts)、
[`effect.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts)、
[`watch.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/watch.spec.ts)
和
[`apiWatch.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiWatch.spec.ts)
交叉核验。

## 真实常见易错点

### 1. 直接把 reactive 属性的当前值传给 `watch()`

**原因：** `state.page` 在调用前已经求值成普通数字，不是 ref、getter、reactive 对象或有效
source 数组。

**后果：** 开发环境出现无效 source 警告，之后修改 `state.page` 不会触发回调。

```ts
// 错误
watch(state.page, loadPage)

// 正确
watch(() => state.page, loadPage)
```

### 2. 用 watcher 手工维护本应由 computed 表达的值

**原因：** 把“得到一个值”误判为“执行一个副作用”，额外保存了可由源状态计算出的第二份状态。

**后果：** 需要处理初始化、漏同步和执行时机，源状态与结果可能短暂或永久不一致。

```ts
// 错误
const fullName = ref('')
watch([firstName, lastName], ([first, last]) => {
  fullName.value = `${first} ${last}`
})

// 正确
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
```

### 3. 侦听返回对象的 getter，却期待嵌套修改默认触发

**原因：** 直接 reactive 对象 source 会隐式深层侦听；getter source 默认只比较返回对象本身。
修改 `user.name` 后 getter 仍返回同一个 `user` 引用。

**后果：** 嵌套字段已经变化，持久化、校验或同步回调却没有执行。

```ts
// 错误
watch(() => state.user, saveUser)

// 正确：优先收窄到真正需要的字段
watch(() => state.user.name, saveName)

// 确需整个对象的嵌套变化时
watch(() => state.user, saveUser, { deep: true })
```

### 4. 把 deep watcher 的新旧值当成修改前后快照

**原因：** deep 通过遍历读取建立依赖，不会深拷贝对象。嵌套原地修改时，两者指向同一个代理。

**后果：** `newValue === oldValue`，审计、撤销或差异算法拿不到修改前数据。

```ts
// 错误
watch(state, (next, previous) => {
  recordDiff(previous.user.name, next.user.name)
})

// 正确：直接侦听需要比较的标量
watch(
  () => state.user.name,
  (nextName, previousName) => recordRename(previousName, nextName),
)
```

### 5. 对大型对象无差别使用 `deep: true`

**原因：** Vue 必须递归遍历嵌套属性以收集依赖；对象越大、层级越深，创建和重跑成本越高。

**后果：** 高频修改时出现不必要的遍历与调度，界面可能卡顿，回调也难以判断究竟哪个字段变化。

```ts
// 错误
watch(largeState, persistEverything, { deep: true })

// 正确：只侦听副作用真正需要的字段
watch(
  [() => largeState.user.id, () => largeState.settings.theme],
  persistRelevantFields,
)

// Vue 3.5+ 确需对象遍历时可限制最大深度
watch(largeState, persistSection, { deep: 2 })
```

### 6. 在 `watchEffect()` 的首次 `await` 后才读取依赖

**原因：** `watchEffect()` 只在同步执行阶段自动追踪依赖；Promise 暂停后恢复时已经离开本轮
依赖收集窗口。

**后果：** `id` 改变不会让 effect 重跑，请求或外部同步停留在旧参数。

```ts
// 错误
watchEffect(async () => {
  await prepareClient()
  await loadUser(id.value)
})

// 正确：在 await 前读取并保存本轮值
watchEffect(async () => {
  const currentId = id.value
  await prepareClient()
  await loadUser(currentId)
})
```

### 7. 在 `await` 后才调用 `onWatcherCleanup()`，或完全不处理竞态

**原因：** `onWatcherCleanup()` 只能在 watcher 同步执行期间登记；同时，Promise 不会因为
watcher 失效而自动取消。

**后果：** 清理注册失败，旧请求可能比新请求晚返回并覆盖最新结果。

```ts
// 错误
watch(id, async (nextId) => {
  const response = await fetch(`/api/users/${nextId}`)
  onWatcherCleanup(() => response.body?.cancel())
  user.value = await response.json()
})

// 正确
watch(id, async (nextId) => {
  const controller = new AbortController()
  onWatcherCleanup(() => controller.abort())

  const response = await fetch(`/api/users/${nextId}`, {
    signal: controller.signal,
  })
  user.value = await response.json()
})
```

### 8. 在默认 pre watcher 中读取更新后的所属组件 DOM

**原因：** 默认回调在父组件更新后、所属组件 DOM 更新前执行；响应式状态已是新值，DOM 仍是
旧内容。

**后果：** 测量到旧尺寸或旧文本，第三方布局与当前画面不一致。

```ts
// 错误
watch(activeId, () => {
  measure(panelRef.value)
})

// 正确
watch(
  activeId,
  () => {
    measure(panelRef.value)
  },
  { flush: 'post' },
)
```

### 9. 对高频同步修改使用 `flush: 'sync'`

**原因：** sync watcher 绕过批量队列，每次响应式触发都立即执行。

**后果：** 连续 push、循环赋值或输入事件导致回调重复执行，既影响性能，也可能观察到业务上
不希望暴露的中间状态。

```ts
// 错误
watch(items, rebuildIndex, { deep: true, flush: 'sync' })

// 正确：默认 pre 会合并同一轮同步变更
watch(items, rebuildIndex, { deep: true })
```

### 10. 异步创建 watcher，或把 pause 当成取消与释放

**原因：** 异步回调中创建的 watcher 没有绑定 setup 时的组件作用域；`pause()` 也只暂停后续调度，
不执行 cleanup、不取消正在运行的请求。

**后果：** 组件卸载或临时暂停后，旧 watcher / 旧请求仍可能存活，造成内存泄漏或过期写入。

```ts
// 错误
setTimeout(() => {
  watchEffect(syncRemoteState)
}, 100)

// 正确：同步创建，用响应式条件控制是否执行
const ready = ref(false)

const handle = watchEffect(() => {
  if (ready.value) syncRemoteState()
})

// 提前永久释放时调用；组件正常卸载也会自动停止
handle.stop()
```

## 基于源码推导的适用场景与高级用法

### 适合使用 `watch()`

- 请求参数是明确的 ref、getter 或 source 数组，并且不希望回调里偶然读取的状态成为触发条件。
- 需要新旧值做标量差异、阈值跨越判断或从一个身份迁移到另一个身份。
- 需要默认惰性、`immediate` 初始化、`once` 单次触发或数字 deep。
- 需要把“何时触发”与“副作用中用到什么”分开，便于测试和维护。

### 适合使用 `watchEffect()`

- 一个小型副作用天然使用多个响应式值，依赖清单与函数正文高度重合。
- 依赖会随条件分支动态切换；每次 effect 运行后，`ReactiveEffect.run()` 会清理本轮未再次读取的
  旧依赖。
- 深层对象中只使用少数几个属性；自动追踪这些实际读取可比无限 deep 遍历更精准。

### 可选高级用法

1. **数字 deep：** Vue 3.5+ 可用 `deep: 1`、`deep: 2` 限制遍历层级。它仍有遍历成本，不能替代
   明确的 getter 或 source 数组。
2. **暂停批量编辑：** 编辑器进入批处理前 `pause()`，完成后 `resume()`；源码的 WeakSet 会把
   暂停期间多次触发合为一个待处理 effect。若已有网络任务，还需单独 Abort。
3. **后置 DOM 集成：** 用 `flush: 'post'` 或 `watchPostEffect()` 把图表、焦点、尺寸测量安排在
   Vue 更新 DOM 之后。
4. **同步缓存失效：** `watchSyncEffect()` 只适合小而低频、不能等待队列的失效标记；不要用于
   数组或大型 reactive 对象。
5. **组合式函数统一释放：** 在 composable 内用 `effectScope()` 收集多个 computed/watch/effect，
   由调用方一次 `scope.stop()`；组件 setup 中同步创建时通常无需额外 scope。
6. **依赖调试：** 开发环境用 `onTrack` / `onTrigger` 配合断点确认“收集了谁、谁触发了重跑”，
   不把调试钩子放进生产业务逻辑。
7. **多个独立资源清理：** `v3.5.40` 为同一 watcher 保存 cleanup 数组，可以分别登记 Abort、
   定时器和事件解绑；下一次运行或 stop 时统一执行。

### 不适合使用 watcher

- 能同步从现有状态得到的值：使用 `computed()`。
- 只由点击、提交等明确用户事件触发的动作：直接放在事件处理函数中。
- 仅为了等待 Vue DOM 更新一次：事件处理流程中的 `await nextTick()` 往往更直接。
- 试图镜像整个大型状态树到另一份本地状态：先缩小所有权和同步边界。

## 单一同源 Demo 建议：课程搜索请求实验台

只实现一个 SFC、一个状态来源和一个确定性的 mock request adapter，不拆成若干互不相关的小
案例。所有模式共享 `query`、`category`、`enabled`、`results` 与同一套延迟响应序列，学习者可以
把行为差异归因于 watcher，而不是不同业务数据。

### 状态与区域

1. **纯值区：** `computed()` 生成规范化查询键与本地结果计数，明确“它返回值，不发请求”。
2. **副作用区：** 默认用 `watch([normalizedQuery, category], request, { immediate: true })`；提供
   “显式 watch / 自动 watchEffect”模式切换，切换时先停止旧句柄再创建新句柄。
3. **竞态区：** mock 请求交替使用 800ms / 150ms 延迟。快速输入两次时，通过 AbortController
   与 cleanup 保证只提交最新结果；日志同时显示“启动、失效、完成”。
4. **生命周期区：** 提供暂停、恢复、停止三个按钮和状态文本。暂停期间连续改查询，恢复后只
   发起一次最新查询；停止后变化不再请求。
5. **时序区：** 一个结果计数 DOM 镜像，允许在 pre/post 之间切换并记录回调读取到的 DOM 文本；
   sync 只作为带警告的进阶选项，不作为默认交互。

### 必须可验证的交互顺序

1. 初始进入由 `immediate` 发起一次请求；关闭 immediate 后重建 watcher，初次不请求。
2. 快速输入 `v`、`vue`，较慢旧请求被清理，最后结果只能属于 `vue`。
3. 暂停后连续改变 query 与 category，日志不新增请求；恢复后只处理最新组合。
4. 停止后继续输入，computed 预览仍变化，远端请求日志不再变化。
5. 切到 watchEffect，关闭 `enabled` 后本轮不读取 query；此时修改 query 不应触发，重新启用后
   动态依赖恢复。
6. pre 模式读到更新前 DOM 文本，post 模式读到更新后文本。

### 390px 布局约束

- 以 `390px` 视口作为硬验收宽度，页面主体单列；不要把控制区与日志区固定并排。
- 模式选择、flush 选择使用可换行的 flex 控件；按钮宽度允许收缩但点击高度至少 44px，文字不
  截断。
- 输入框、结果区、事件日志使用 `width: 100%` 与 `min-width: 0`；长查询和日志允许换行，代码
  片段才可局部横向滚动。
- 暂停、恢复、停止按钮通过图标、文本与 disabled 状态表达当前句柄状态；停止后不可恢复。
- 日志区域设固定或最大高度并内部滚动，新增日志不应把控制按钮推离当前视口。
- 不依赖 hover 传达清理或失效；状态文本使用 `aria-live="polite"`，输入、选择器和按钮均有
  可见标签或可访问名称。
- 样式实现使用 flex、换行与明确外边距，不使用 `grid` 或 `gap`。

## 建议 prerequisites / related API ID

### prerequisites

- `vue.core.learn.basics.reactive-state`
- `vue.core.learn.basics.computed-properties`

### related

- `vue.core.learn.basics.computed-properties`
- `vue.core.reference.reactivity-watchers.computed`
- `vue.core.reference.reactivity-watchers.watch`
- `vue.core.reference.reactivity-watchers.watch-effect`
- `vue.core.reference.reactivity-watchers.watch-post-sync`
- `vue.core.reference.reactivity.ref`
- `vue.core.reference.reactivity.reactive`
- `vue.core.reference.reactivity.effect-scope`
- `vue.core.reference.application.next-tick`

## 固定来源清单

### Vue 官方文档

- [Vue 中文官网：侦听器](https://cn.vuejs.org/guide/essentials/watchers.html)：source、deep、
  immediate、once、watchEffect、清理、flush 与停止边界。
- [Vue 中文官网：响应式 API 核心](https://cn.vuejs.org/api/reactivity-core.html)：`watch()`、
  `watchEffect()`、别名、选项与 `WatchHandle` 类型。
- [Vue 中文官网：计算属性](https://cn.vuejs.org/guide/essentials/computed.html)：派生值、缓存与
  getter 无副作用边界。
- [Vue 中文官网：响应式基础](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html)：
  `ref()`、`reactive()` 与依赖追踪前置知识。
- [Vue 中文官网：深入响应式系统](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)：
  watcher 调试钩子与 effect 模型。
- [Vue 中文官网：响应式 API 进阶](https://cn.vuejs.org/api/reactivity-advanced.html#effectscope)：
  `effectScope()`、`getCurrentScope()`、`onScopeDispose()`。

### vuejs/core v3.5.40

- [`packages/reactivity/src/watch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts)：
  source 归一化、deep 遍历、值比较、cleanup、once 与句柄绑定。
- [`packages/reactivity/src/effect.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts)：
  动态依赖刷新、pause/resume/stop 与暂停队列。
- [`packages/runtime-core/src/apiWatch.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiWatch.ts)：
  pre/post/sync 调度、组件实例归属与别名入口。
- [`packages/reactivity/src/effectScope.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)：
  effect scope 收集与统一停止。
- [`packages/reactivity/__tests__/watch.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/watch.spec.ts)：
  deep 数字、once、cleanup、暂停恢复与错误处理的官方测试。
- [`packages/runtime-core/__tests__/apiWatch.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiWatch.spec.ts)：
  组件内 flush 顺序、自动停止、清理与异步 watcher 的官方测试。

## 结论

本课应延续 computed 课建立的“事实状态 / 派生值 / 副作用”三分法，而不是堆叠所有 watcher
选项。主线先用显式 `watch()` 建立触发边界，再引入 `watchEffect()` 的自动依赖；第一次异步示例
就必须包含失效清理。源码最值得转化成可观察实验的三点是：deep 来自遍历而非快照、flush 来自
不同调度队列、pause 只暂缓 effect 而不取消已有资源。单一搜索实验台足以把这三点与
computed 的纯派生边界放在同一个真实工作流中验证。
