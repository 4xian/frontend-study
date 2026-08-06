---
id: vue.core.reference.options-api.lifecycle-options
type: reference
title: Options API：生命周期选项
summary: 查询 Options API 从创建、挂载、更新、卸载到错误、调试、KeepAlive 与 SSR 的调用时机和环境边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.options-api.state-options
  - vue.core.reference.options-api.rendering-options
  - vue.core.reference.composition.lifecycle
  - vue.core.reference.built-ins.keep-alive
  - vue.core.reference.application.application-configuration
  - vue.core.reference.application.next-tick
tags:
  - Options API
  - 生命周期
  - errorCaptured
  - renderTracked
  - renderTriggered
  - KeepAlive
  - serverPrefetch
  - SSR
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-03
sources:
  - title: Vue Options API：生命周期选项
    url: https://cn.vuejs.org/api/options-lifecycle.html
  - title: Vue KeepAlive：缓存实例的生命周期
    url: https://cn.vuejs.org/guide/built-ins/keep-alive.html#lifecycle-of-cached-instance
  - title: Vue SSR：组件生命周期钩子
    url: https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks
  - title: Vue 响应式调试：组件调试钩子
    url: https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#component-debugging-hooks
  - title: Vue 3.5.40 Options 应用与生命周期注册
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts
  - title: Vue 3.5.40 生命周期钩子实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiLifecycle.ts
  - title: Vue 3.5.40 renderer 生命周期调度
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/renderer.ts
  - title: Vue 3.5.40 KeepAlive 实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/components/KeepAlive.ts
  - title: Vue 3.5.40 错误传播实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/errorHandling.ts
group: options-api
signature: |-
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
anchors:
  - 概述
  - beforeCreate
  - created
  - beforeMount
  - mounted
  - beforeUpdate
  - updated
  - beforeUnmount
  - unmounted
  - errorCaptured
  - renderTracked
  - renderTriggered
  - activated
  - deactivated
  - serverPrefetch
  - 易错使用提示
  - 源码推导与适用场景
---

# Options API：生命周期选项

## 概述

Options 生命周期选项把组件的一次实例旅程划分为创建、挂载、更新和卸载四个主阶段，并补充后代错误边界、渲染依赖调试、`<KeepAlive>` 缓存切换和 SSR 数据预取。运行时会把这些普通函数的 `this` 绑定到组件公共实例；对应的 Composition API 钩子最终进入相同的实例钩子数组，但 `beforeCreate` 和 `created` 的工作通常直接写在 `setup()` 中。

| 阶段 | Options 钩子 | Composition API 入口 | 关键环境边界 |
| --- | --- | --- | --- |
| 创建 | beforeCreate / created | setup() 函数体（无一一钩子） | 浏览器与 SSR |
| 挂载 | beforeMount / mounted | onBeforeMount() / onMounted() | 仅客户端；mounted 不等待异步后代 |
| 更新 | beforeUpdate / updated | onBeforeUpdate() / onUpdated() | 仅客户端；多次状态变化可能批处理 |
| 卸载 | beforeUnmount / unmounted | onBeforeUnmount() / onUnmounted() | 仅客户端；手动副作用仍需清理 |
| 错误 | errorCaptured | onErrorCaptured() | 只捕获后代错误；可返回 false |
| 调试 | renderTracked / renderTriggered | onRenderTracked() / onRenderTriggered() | 仅开发环境客户端 |
| 缓存 | activated / deactivated | onActivated() / onDeactivated() | 仅 KeepAlive 客户端缓存树 |
| SSR | serverPrefetch | onServerPrefetch() | 仅服务端并等待返回的 Promise |

:::tip
不要凭名称猜测 DOM 或子组件是否已经就绪。先确定当前钩子的环境和调度阶段，再选择 Options 钩子；需要可复用的生命周期逻辑时，转到关联的 Composition API 页面并提取 composable。
:::

## beforeCreate

`beforeCreate` 在实例初始化和 props 解析后立即调用，但 `data`、computed、methods 与 watch 尚未应用。`setup()` 已经在它之前执行，因此不要在这里读取 Options 状态或调用 Options method。它会在 SSR 执行，只适合极少数需要观察 Options 初始化前实例状态的场景。

## created

`created` 在响应式 data、computed、methods 与 watch 处理完成后调用，可以通过 `this` 读取实例状态和启动不依赖 DOM 的短期工作。挂载尚未开始，因此 `$el` 与模板引用仍不可用。它也会在 SSR 执行；不能在这里建立只能等待 unmounted 清理的跨请求长期副作用。

~~~~ts
export default {
  props: { courseId: { type: Number, required: true } },
  /** 在 Options 状态建立前记录组件输入。 */
  beforeCreate() {
    audit.mark('course-created', this.$props.courseId)
  },
  /** 在实例状态可用后加载不依赖 DOM 的课程数据。 */
  created() {
    this.loadCourse(this.courseId)
  },
  methods: {
    /** 加载当前课程数据。 */
    loadCourse(courseId: number) {
      return courseApi.load(courseId)
    },
  },
}
~~~~

## beforeMount

`beforeMount` 在第一次执行 DOM 渲染前调用。此时响应式状态已经就绪，但组件尚未创建 DOM 节点，不能读取 `$el` 或 `$refs`。它适合完成渲染前最后一次纯状态准备，但不会在 SSR 执行。

## mounted

`mounted` 在自身 DOM 树创建并插入父容器、所有同步子组件挂载后调用，适合聚焦元素、测量布局或注册浏览器监听器。它不等待异步组件或 `<Suspense>` 内组件；只有根容器已经在文档中时，才能保证当前节点也位于 `document`。父子同步挂载通常按“父 beforeMount、子 mounted、父 mounted”完成。

~~~~ts
export default {
  /** 创建首轮渲染所需的当前索引。 */
  data() {
    return { activeIndex: 0 }
  },
  /** 在首轮渲染前完成不依赖 DOM 的状态归一化。 */
  beforeMount() {
    this.activeIndex = Math.max(0, this.activeIndex)
  },
  /** 在输入框真实挂载后设置焦点。 */
  mounted() {
    this.$refs.searchInput.focus()
  },
}
~~~~

## beforeUpdate

`beforeUpdate` 在响应式状态已经变化、组件 DOM patch 尚未执行时调用，因此可以读取更新前 DOM。Vue 允许在这里修改组件状态，但逻辑应保持有界；针对某个字段的副作用通常用 watch 更清晰。它不会在 SSR 执行。

## updated

`updated` 在组件 DOM 更新后调用，子组件的 updated 先于父组件。多个状态修改可能合并成一次渲染，所以它不能精确代表某个字段的一次变化；需要等待某次明确修改后的 DOM 时使用 `nextTick()`。禁止在这里无条件改写响应式状态，否则会再次排队更新并形成循环。

~~~~ts
export default {
  /** 保存 DOM patch 前的面板高度。 */
  data() {
    return { previousPanelHeight: 0 }
  },
  /** 在 DOM patch 前记录旧的面板高度。 */
  beforeUpdate() {
    this.previousPanelHeight = this.$refs.panel.getBoundingClientRect().height
  },
  /** 在 DOM patch 后报告布局变化，不再改写响应式状态。 */
  updated() {
    const nextHeight = this.$refs.panel.getBoundingClientRect().height
    layoutMetrics.record(nextHeight - this.previousPanelHeight)
  },
}
~~~~

## beforeUnmount

`beforeUnmount` 在卸载开始前调用，此时实例、子树和 DOM 仍完整可用。需要依赖当前实例或 DOM 才能解除的订阅，可以在这里停止。它不会在 SSR 执行。

## unmounted

`unmounted` 在所有子组件卸载，并且组件渲染作用以及 setup 中同步创建的 computed/watch 停止后调用。Vue 不会代替业务代码清除手动创建的计时器、DOM 事件监听器、订阅或服务器连接，仍需显式释放。

~~~~ts
export default {
  /** 在组件仍可访问 DOM 时解除观察器。 */
  beforeUnmount() {
    this.resizeObserver?.disconnect()
  },
  /** 在组件完全卸载后清除外部计时器。 */
  unmounted() {
    window.clearInterval(this.refreshTimer)
  },
}
~~~~

## errorCaptured

`errorCaptured(error, instance, info)` 捕获后代组件从渲染、事件、生命周期、setup、watch、指令或过渡中传播的错误，不捕获当前边界组件自身的错误。边界从最近祖先向上依次执行，默认仍到达 `app.config.errorHandler`；返回 `false` 表示已经处理并停止后续传播。生产环境的 `info` 是缩短代码。回退状态不能继续渲染同一故障子树，否则会反复抛错。

~~~~ts
export default {
  /** 创建错误边界的回退状态。 */
  data() {
    return { failed: false }
  },
  /** 捕获后代错误并切换到不会重建故障子树的回退界面。 */
  errorCaptured(error: unknown, _instance: unknown, info: string) {
    this.failed = true
    errorReporter.capture(error, info)
    return false
  },
}
~~~~

## renderTracked

`renderTracked(event)` 在组件渲染作用读取并追踪响应式依赖时调用。`DebuggerEvent` 会给出 effect、target、操作类型和 key，适合定位“为什么这个字段成为渲染依赖”。它仅在开发环境执行，不会在 SSR 执行。

## renderTriggered

`renderTriggered(event)` 在已经追踪的依赖发生变化并触发组件重新渲染时调用，还可能提供新旧值。它适合定位“哪次写操作让组件更新”，同样只在开发环境客户端执行，不能承担生产日志、分析或业务状态同步。

~~~~ts
export default {
  /** 在开发环境定位被渲染读取的响应式 key。 */
  renderTracked(event: DebuggerEvent) {
    debugTrace.track(event.type, event.key)
  },
  /** 在开发环境定位触发本次更新的响应式写操作。 */
  renderTriggered(event: DebuggerEvent) {
    debugTrace.trigger(event.type, event.key, event.oldValue, event.newValue)
  },
}
~~~~

## activated

`activated` 只用于 `<KeepAlive>` 缓存树，在首次挂载和每次从缓存重新插入 DOM 后调用。缓存根下的后代组件也会收到该钩子。适合恢复只在页面可见时需要的轮询、媒体或观察器；不会在 SSR 执行。

## deactivated

`deactivated` 在缓存树移出 DOM 时调用，并在最终卸载时再次调用。停用不会销毁实例，也不会自动停止所有响应式作用，所以它不是 unmounted 的同义词。可见性相关资源应在这里暂停，永久资源仍由 unmounted 兜底释放。

~~~~ts
export default {
  /** 保存当前轮询任务的浏览器计时器编号。 */
  data() {
    return { pollingTimer: undefined as number | undefined }
  },
  /** 在缓存页面可见时恢复轮询。 */
  activated() {
    this.startPolling()
  },
  /** 在缓存页面离开 DOM 时暂停轮询。 */
  deactivated() {
    this.stopPolling()
  },
  /** 在页面永久销毁时再次确保资源已释放。 */
  unmounted() {
    this.stopPolling()
  },
  methods: {
    /** 刷新当前页面需要展示的数据。 */
    refresh() {
      return courseFeed.refresh()
    },
    /** 启动唯一的轮询任务。 */
    startPolling() {
      if (!this.pollingTimer) this.pollingTimer = window.setInterval(this.refresh, 5000)
    },
    /** 停止当前轮询任务。 */
    stopPolling() {
      window.clearInterval(this.pollingTimer)
      this.pollingTimer = undefined
    },
  },
}
~~~~

## serverPrefetch

`serverPrefetch` 只在服务端渲染执行。若返回 Promise，服务端渲染器会在渲染该组件前等待完成，适合获取本次 HTML 必需的数据。客户端直接创建组件不会调用它，因此 mounted 应为缺失数据提供回退；SSR 数据还应进入可序列化的 hydration 状态，避免客户端重复请求。下面的 `initialCourse` 由客户端入口从 SSR payload 恢复并传入，`writeCourseToSsrPayload()` 则把服务端结果写入同一个按请求隔离的 payload。

~~~~ts
export default {
  props: {
    courseId: { type: Number, required: true },
    initialCourse: { type: Object, default: null },
  },
  /** 从客户端入口恢复的 SSR payload 创建本地状态。 */
  data() {
    return { course: this.initialCourse }
  },
  /** 在服务端预取课程，并同步写入随后序列化的 payload。 */
  async serverPrefetch() {
    if (this.course) return
    const course = await fetchCourseOnServer(this.courseId)
    this.course = course
    writeCourseToSsrPayload(this.courseId, course)
  },
  /** 为纯客户端进入提供缺失数据回退。 */
  async mounted() {
    if (!this.course) this.course = await fetchCourseOnClient(this.courseId)
  },
}
~~~~

## 易错使用提示

:::pitfalls
### 用箭头函数声明依赖 this 的 Options 钩子

**触发条件：** 用箭头函数声明依赖 this 的 Options 钩子

**原因：** Options 生命周期依靠普通函数的动态 this 绑定公共实例；箭头函数保留定义位置的词法 this。

**后果：** 钩子执行时读不到实例状态或方法，常在首次挂载时抛出 undefined 错误。

**错误示例：**

~~~~ts
export default {
  /** 错误地使用无法接收实例 this 的箭头函数。 */
  mounted: () => this.loadCourse(),
}
~~~~

**正确写法：**

~~~~ts
export default {
  /** 在当前组件实例挂载后加载课程。 */
  mounted() {
    this.loadCourse()
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 created 或 beforeMount 读取模板 DOM

**触发条件：** 在 created 或 beforeMount 读取模板 DOM

**原因：** 创建阶段尚未挂载，beforeMount 也还没有创建本轮 DOM 节点。

**后果：** `$el` 或 `$refs` 是 undefined，聚焦、测量和第三方 DOM 初始化失败。

**错误示例：**

~~~~ts
export default {
  /** 错误地在 DOM 创建前读取模板引用。 */
  created() {
    this.$refs.input.focus()
  },
}
~~~~

**正确写法：**

~~~~ts
export default {
  /** 在模板输入框挂载后设置焦点。 */
  mounted() {
    this.$refs.input.focus()
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 mounted 当成全部异步后代已就绪

**触发条件：** 把 mounted 当成全部异步后代已就绪

**原因：** mounted 只等待同步子组件，不等待异步组件或 Suspense 树；插入父容器也不总等于已经位于 document。

**后果：** 读取异步子组件 ref 时得到 undefined，布局测量也可能发生在错误的容器状态。

**错误示例：**

~~~~ts
export default {
  /** 错误地假定异步面板已经挂载。 */
  mounted() {
    this.$refs.asyncPanel.measure()
  },
}
~~~~

**正确写法：**

~~~~ts
export default {
  methods: {
    /** 在异步面板主动报告 ready 后执行测量。 */
    onPanelReady(panel: { measure: () => void }) {
      panel.measure()
    },
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 updated 中无条件改写响应式状态

**触发条件：** 在 updated 中无条件改写响应式状态

**原因：** updated 本身由响应式更新触发；再次写状态会排队下一轮渲染。

**后果：** 组件持续更新，CPU 占用升高并最终出现最大递归更新错误。

**错误示例：**

~~~~ts
export default {
  /** 错误地在每轮更新后继续制造更新。 */
  updated() {
    this.renderCount++
  },
}
~~~~

**正确写法：**

~~~~ts
export default {
  watch: {
    /** 只在目标业务字段变化时执行副作用。 */
    selectedId(value: number) {
      analytics.track('selected', value)
    },
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 只在 unmounted 暂停 KeepAlive 页面资源

**触发条件：** 只在 unmounted 暂停 KeepAlive 页面资源

**原因：** 缓存页面离开 DOM 时只会停用，不会立刻卸载，实例和响应式作用仍然保留。

**后果：** 隐藏页面继续轮询、播放媒体或监听外部事件，造成重复请求和资源浪费。

**错误示例：**

~~~~ts
export default {
  /** 只在永久卸载时停止，无法覆盖缓存停用。 */
  unmounted() {
    this.stopPolling()
  },
}
~~~~

**正确写法：**

~~~~ts
export default {
  /** 页面进入缓存时立即暂停轮询。 */
  deactivated() {
    this.stopPolling()
  },
  /** 永久卸载时再次确保轮询已停止。 */
  unmounted() {
    this.stopPolling()
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 errorCaptured 当作本组件的 try/catch

**触发条件：** 把 errorCaptured 当作本组件的 try/catch

**原因：** errorCaptured 从出错实例的父级开始传播，只捕获后代错误。

**后果：** 边界组件自身抛错时钩子不会执行，错误仍直接到达上层或应用处理器。

**错误示例：**

~~~~ts
export default {
  /** 错误地期待捕获当前组件自己的 mounted 错误。 */
  mounted() {
    throw new Error('load failed')
  },
  /** 当前组件自身错误不会进入这里。 */
  errorCaptured() {
    return false
  },
}
~~~~

**正确写法：**

~~~~ts
export default {
  /** 在父级边界捕获后代错误并停止继续传播。 */
  errorCaptured(error: unknown) {
    this.childError = error
    return false
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 错误回退仍然渲染原始故障子树

**触发条件：** 错误回退仍然渲染原始故障子树

**原因：** errorCaptured 中改写状态会触发边界重渲染；若故障子树仍存在，会再次抛出同一错误。

**后果：** 错误与回退更新不断循环，真正的首次错误也被后续噪声掩盖。

**错误示例：**

~~~~vue
<template>
  <BrokenPanel />
  <p v-if="failed">加载失败</p>
</template>
~~~~

**正确写法：**

~~~~vue
<template>
  <p v-if="failed">加载失败</p>
  <BrokenPanel v-else />
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把渲染调试钩子用于生产业务

**触发条件：** 把渲染调试钩子用于生产业务

**原因：** renderTracked 与 renderTriggered 只在开发构建客户端运行。

**后果：** 生产环境的分析上报、计数或同步逻辑完全不执行，数据无声缺失。

**错误示例：**

~~~~ts
export default {
  /** 错误地依赖开发期钩子完成业务上报。 */
  renderTriggered(event: DebuggerEvent) {
    billing.trackUpdate(event.key)
  },
}
~~~~

**正确写法：**

~~~~ts
export default {
  watch: {
    /** 使用正式业务源驱动生产上报。 */
    planId(value: string) {
      billing.trackPlan(value)
    },
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 只用 serverPrefetch 获取页面数据

**触发条件：** 只用 serverPrefetch 获取页面数据

**原因：** serverPrefetch 仅在 SSR 执行，纯客户端进入不会触发；SSR 状态也必须被客户端复用。

**后果：** 客户端直达显示空数据，或 hydration 后重复请求同一资源。

**错误示例：**

~~~~ts
export default {
  /** 只覆盖服务端，客户端直达没有回退。 */
  async serverPrefetch() {
    this.course = await fetchCourse(this.courseId)
  },
}
~~~~

**正确写法：**

~~~~ts
export default {
  props: {
    courseId: { type: Number, required: true },
    initialCourse: { type: Object, default: null },
  },
  /** 恢复客户端入口从 SSR payload 传入的课程。 */
  data() {
    return { course: this.initialCourse }
  },
  /** 服务端预取并写入按请求隔离的 SSR payload。 */
  async serverPrefetch() {
    if (this.course) return
    const course = await fetchCourse(this.courseId)
    this.course = course
    writeCourseToSsrPayload(this.courseId, course)
  },
  /** 客户端只在 hydration 状态缺失时回退请求。 */
  async mounted() {
    if (!this.course) this.course = await fetchCourse(this.courseId)
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. 创建钩子夹住 Options 状态初始化

`applyOptions()` 先同步调用 beforeCreate，再应用 inject、methods、data、computed、watch 与 provide，最后调用 created。因此 beforeCreate 适合观察初始化边界，created 才适合读取完整 Options 状态。

### 2. 其余 Options 钩子复用组合式注册入口

运行时把普通 Options 函数绑定到公共实例，再交给 onMounted、onUpdated 等注册函数。两种 API 最终共享实例钩子数组，差别主要在声明位置与复用方式。

### 3. 用户钩子不会污染渲染依赖收集

`apiLifecycle.ts` 的包装器在调用钩子前暂停响应式 tracking、设置当前实例，结束后恢复。钩子里的临时读取不会意外成为当前渲染作用的新依赖。

### 4. renderer 决定 DOM 与父子顺序

beforeMount/beforeUpdate 在 patch 前同步执行，mounted/updated/unmounted 进入渲染后队列。同步子树的 mounted 和 updated 先于父级，因此跨组件协作应使用显式事件，不依赖模糊的全树完成假设。

### 5. 错误从父级边界逐层向上传播

`errorHandling.ts` 从出错实例的 parent 开始遍历 errorCaptured；某个钩子返回 false 就立即停止，否则最终进入 app.config.errorHandler。它适合组件树局部回退，不等同于同步 try/catch。

### 6. 调试事件直接挂在组件渲染作用上

renderer 只在开发分支把 renderTracked/renderTriggered 连接到 render effect 的 onTrack/onTrigger。它们适合定位意外依赖与写操作，不能形成生产行为契约。

### 7. KeepAlive 移动实例而不是卸载实例

KeepAlive 通过 renderer move 在缓存容器和真实容器之间移动 VNode，并把激活/停用钩子注册到缓存根。需要按可见性暂停的资源必须使用 activated/deactivated。

### 8. serverPrefetch 是 SSR 渲染屏障

服务端渲染器收集并等待 serverPrefetch 返回的 Promise，再继续输出组件 HTML。它适合首屏必需数据；非关键请求应避免延长服务端响应，客户端入口还需独立回退。
:::
