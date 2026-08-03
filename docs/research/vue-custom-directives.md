# Vue Core 高级课程：自定义指令调研

> 查证日期：2026-08-01  
> 适用版本：Vue 3.5.40  
> 资料范围：Vue 官方中文自定义指令、应用实例与 SSR 文档，`vuejs/docs` 官方 Markdown，
> 以及 `vuejs/core@v3.5.40` 固定标签源码。外部资料通过 Tavily 定位和提取；博客、问答、issue、
> 第三方指令库、`main` 分支运行时实现和既有 Reference 正文不作为技术结论依据。

## 已冻结实施契约

| 项目 | 已实现值 |
| --- | --- |
| 课程 ID | `vue.core.learn.advanced.custom-directives` |
| 标题 | 自定义指令 |
| 阶段 / 分类 | `advanced` / `extension-and-rendering` |
| 唯一直接前置 | `vue.core.learn.advanced.error-handling` |
| 唯一公开 Demo ID | `vue.core.learn.advanced.custom-directives.directive-lifecycle-lab-demo` |
| Demo 标题 | 一份快捷键资源，跟随一个真实元素 |
| 易错点 | 恰好 8 个高质量候选 |
| 源码推导 | 6 个，严格绑定 Vue 3.5.40 |
| 预计时长 | 60 分钟 |
| 实施前总量 | Vue 三条学习路线 `23 available / 37 planned` |
| 实施后总量 | Vue 三条学习路线 `24 available / 36 planned` |
| 后续课程 | `vue.core.learn.advanced.render-functions-vnodes` 保持 `planned` |

本课对应 manifest 中已有的“自定义指令”，不是新增另一篇同名课程。上一课“错误处理”已经说明
自定义指令钩子抛错会进入 Vue 错误链；本课只把这一事实作为失败边界，不重复教授错误边界、恢复、
上报或应用级 `errorHandler`。现有 `vue.core.reference.advanced.custom-directives` 继续承担 API 速查，
本批不得修改、复制或重写该 Reference 及其 Demo。

本课只回答一个主问题：**当行为确实必须接触普通元素的底层 DOM 时，怎样用一个局部、可更新、
可清理且 SSR 边界明确的自定义指令封装它。** 主线限定为 Vue SFC、
`<script setup lang="ts">`、普通 HTML 元素和对象形式指令，覆盖：

- 自定义指令与组件、组合式函数、模板引用、内置 `v-bind` 的职责边界。
- `<script setup>` 的局部 `vName` 约定、Options API 的 `directives` 选项和
  `app.directive()` 全局注册。
- 对象形式七个可选钩子的顺序与 DOM 时机。
- `el`、`binding`、`vnode`、`prevVnode`，以及 `binding` 六个公开字段。
- 动态参数、修饰符、对象字面量值和更新时的旧值边界。
- 函数简写只复用 `mounted` 与 `updated`，不能承担创建前或卸载清理。
- 用元素或 `WeakMap` 保存跨钩子资源，并在卸载阶段成对释放。
- 组件根节点转发、多根 / 非元素根限制，以及为什么课程主线只绑定普通元素。
- SSR 默认忽略客户端 DOM 钩子；需要服务端 attribute 时显式实现 `getSSRProps()`。

以下内容明确排除，不进入正文主线、练习或 Demo：

- 自定义渲染器、编译器 transform、手写 render function 或 `withDirectives()` 教程；下一课再处理。
- 重讲 `v-if`、`v-for`、`v-model`、`v-show` 等内置指令的实现。
- 插件安装、全局指令库、自动安装、Nuxt module 或应用级约定；插件是后续课程。
- 完整第三方 DOM widget 适配、MutationObserver / ResizeObserver 性能专题或通用资源管理框架。
- 在组件、多根 Fragment、Teleport、文本根或抽象组件上建立兼容层。
- 完整 SSR 应用、hydration mismatch、流式渲染或服务端编译器实验。
- 读取或修改 Vue 私有 VNode、内部组件实例、renderer anchor 和 patch flag。
- 修复现有 Reference、Reference Demo、catalog schema、router 或其他课程。

课程定位依据：[Vue 自定义指令指南](https://cn.vuejs.org/guide/reusability/custom-directives.html)、
[`app.directive()`](https://cn.vuejs.org/api/application.html#app-directive)、
[SSR 自定义指令](https://cn.vuejs.org/guide/scaling-up/ssr.html#custom-directives)。

## 一手来源

### 公开文档契约

- [Vue 中文自定义指令指南](https://cn.vuejs.org/guide/reusability/custom-directives.html)：使用时机、
  三种注册方式、七个钩子、参数、函数简写、对象字面量和组件根限制。
- [Vue 中文应用实例 API：`app.directive()`](https://cn.vuejs.org/api/application.html#app-directive)：
  全局注册与按名称读取的重载签名。
- [Vue 中文 SSR：自定义指令](https://cn.vuejs.org/guide/scaling-up/ssr.html#custom-directives)：
  SSR 默认忽略和 `getSSRProps()` 的属性输出契约。
- [`vuejs/docs` 自定义指令 Markdown](https://github.com/vuejs/docs/blob/main/src/guide/reusability/custom-directives.md)：
  官网指南的英文原始 Markdown，用于交叉核对措辞和示例。
- [`vuejs/docs` 应用实例 API Markdown](https://github.com/vuejs/docs/blob/main/src/api/application.md#app-directive)：
  `app.directive()` 官网原始 Markdown。
- [`vuejs/docs` SSR Markdown](https://github.com/vuejs/docs/blob/main/src/guide/scaling-up/ssr.md#custom-directives)：
  `getSSRProps()` 官网原始 Markdown。

### Vue 3.5.40 固定源码

- [`packages/runtime-core/src/directives.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts)：
  `DirectiveBinding`、对象 / 函数指令类型、`withDirectives()` 与 `invokeDirectiveHook()`。
- [`directives.ts` 函数简写归一化](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts#L148-L164)：
  函数只映射到 `mounted`、`updated`，并建立绑定记录。
- [`directives.ts` 旧值与钩子分派](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts#L170-L200)：
  按索引回填 `oldValue`、暂停追踪、统一错误包装和四个运行时参数。
- [`renderer.ts` 元素挂载路径](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts#L692-L752)：
  `created`、`beforeMount`、DOM 插入和排队执行的 `mounted`。
- [`renderer.ts` 元素更新路径](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts#L848-L971)：
  `beforeUpdate` 在 patch 前执行，`updated` 在 patch 后排队执行。
- [`renderer.ts` 元素卸载路径](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts)：
  只有元素 VNode 的 `dirs` 进入卸载钩子，`beforeUnmount` 在移除前执行，`unmounted` 排队执行。
- [`packages/runtime-core/src/componentRenderUtils.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts#L244-L255)：
  组件 VNode 的 `dirs` 合并到渲染根，并对非元素根发出运行时警告。
- [`packages/server-renderer/src/helpers/ssrGetDirectiveProps.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/helpers/ssrGetDirectiveProps.ts#L7-L30)：
  SSR binding 形状、对象指令的 `getSSRProps()` 调用和空对象回退。

文档事实与源码事实必须分开表达。官网规定的是公共用法；`withDirectives()`、VNode `dirs`、
按索引回填、追踪暂停和 renderer 排队属于 Vue 3.5.40 实现证据，不得写成永久稳定的公共 API。

## 必须准确覆盖的公开语义

### 1. 只有必须直接操作普通元素 DOM 时才使用指令

组件是主要界面构建块，组合式函数复用有状态逻辑，自定义指令则面向普通元素的低层 DOM 访问。
官方进一步要求：只有功能只能通过直接 DOM 操作完成时才使用；若 `v-bind`、class / style 绑定、
组件 props 或组合式函数已经能表达，应优先使用声明式能力，因为内置指令更高效且更利于 SSR。

合适的最小场景包括：动态插入后聚焦元素、封装某个元素的原生事件 / observer 生命周期、或接入只
接受真实元素的命令式库。不合适的场景包括：渲染一整块界面、共享业务状态、数据请求、权限判断和
仅仅写一个 attribute。

### 2. 三种注册方式的名称规则不同

`<script setup>` 中，任何以 `v` 开头的驼峰变量都可在模板中作为指令；`vFocus` 对应
`v-focus`：

```vue
<script setup lang="ts">
import type { ObjectDirective } from 'vue'

const vFocus: ObjectDirective<HTMLInputElement> = {
  /** 在目标输入框进入 DOM 后聚焦。 */
  mounted(el) {
    el.focus()
  },
}
</script>

<template>
  <input v-focus />
</template>
```

非 `<script setup>` 组件通过 `directives` 选项局部注册，键 `focus` 对应模板的 `v-focus`：

```ts
const focus = {
  /** 在目标输入框进入 DOM 后聚焦。 */
  mounted(el: HTMLInputElement) {
    el.focus()
  },
}

export default {
  directives: { focus },
}
```

全局注册使用 `app.directive('focus', focus)`；只传名称时返回已注册定义或 `undefined`。课程默认
使用局部注册，让依赖和作用域可见；只有确实跨大量组件共享且应用启动处可追踪时才全局注册。

### 3. 对象形式共有七个可选钩子

| 钩子 | 公开时机 | 主线用途 |
| --- | --- | --- |
| `created` | 元素 attribute 或事件监听应用前 | 初始化纯 JS 状态；不要假定 DOM 配置完成 |
| `beforeMount` | 元素插入 DOM 前 | 插入前的最后同步准备 |
| `mounted` | 父组件及其子节点挂载后 | 读取布局、聚焦、注册需要 DOM 的资源 |
| `beforeUpdate` | 父组件更新前 | 比较本次 binding 与上一轮值 |
| `updated` | 父组件及其子节点更新后 | 把最新值同步到 DOM / 外部资源 |
| `beforeUnmount` | 父组件卸载前 | 只执行确实需要元素仍存在的收尾动作 |
| `unmounted` | 父组件卸载后 | 最终释放 listener、observer 与第三方实例 |

七个钩子均可选。不能把组件生命周期的全部心智模型机械套到单个元素上；课程只依据上述公开时机
选择操作，不承诺兄弟节点、Transition 或 Suspense 内部的私有 patch 顺序。

### 4. 四个钩子参数与 binding 六个字段

运行时调用形状是 `hook(el, binding, vnode, prevVnode)`：

- `el`：真实绑定元素，是指令允许直接操作的主要对象。
- `binding.value`：指令表达式本次求值结果。
- `binding.oldValue`：上一轮的值，仅在 `beforeUpdate` / `updated` 中可用；值是否变化都提供。
- `binding.arg`：参数，如 `v-track:panel` 的 `panel`；动态参数会随组件状态更新。
- `binding.modifiers`：修饰符布尔对象，如 `.quiet.once` 变成 `{ quiet: true, once: true }`。
- `binding.instance`：使用该指令的组件公开实例。
- `binding.dir`：当前指令定义对象。
- `vnode`：代表绑定元素的当前底层 VNode。
- `prevVnode`：上一轮 VNode，只在 `beforeUpdate` / `updated` 中可用。

除 `el` 外，官方要求把其他参数视为只读。主线不使用 `binding.instance`、`binding.dir`、VNode 或
`prevVnode` 完成功能，只解释它们的含义；跨钩子资源优先放在模块级 `WeakMap<Element, State>`，
简单字符串状态也可使用命名明确的 `data-*` attribute。

动态参数与修饰符没有框架内置业务语义，必须由指令自行解释：

```vue
<button v-managed-press:[channel].audit="amount">触发</button>
```

此时 `binding.arg` 是当前 `channel` 字符串，`binding.modifiers.audit` 是 `true`，Vue 不会自动执行
“审计”行为。

### 5. 函数简写只对应 `mounted` 和 `updated`

当挂载与更新需要完全相同行为，且没有其他生命周期工作时，可以直接把函数作为指令：

```ts
app.directive('color', (el, binding) => {
  el.style.color = binding.value
})
```

该函数只在 `mounted` 与 `updated` 调用，不会在 `created`、`beforeMount`、`beforeUpdate`、
`beforeUnmount` 或 `unmounted` 调用。需要建立 listener、observer 或第三方实例并清理时必须改用
对象形式，不能把函数返回值当作清理函数。

### 6. value 可以是表达式或对象，但 oldValue 不是深拷贝

指令值可以是任何合法 JavaScript 表达式，也可以传对象字面量。多个字段应收进一个具有明确形状的
对象，而不是发明大量位置参数：

```vue
<div v-highlight="{ color: tone, emphasis: true }"></div>
```

公开文档只承诺 `oldValue` 是上一轮传入值；Vue 3.5.40 源码把上一 VNode 对应 binding 的 `.value`
直接赋给当前 `oldValue`，没有 clone 或 snapshot。若同一个 reactive 对象原地修改，`value` 与
`oldValue` 可能仍指向同一代理，不能用它们恢复某个字段的历史值。

### 7. 指令放在组件上会转交根节点，但不推荐

组件上的自定义指令会像透传 attribute 一样落到组件渲染根。单一元素根可能看似可用，但它把父级
行为耦合到子组件的私有根结构；子组件改为 Fragment、文本或 Teleport 根后会失效。多根组件上的
指令会被忽略并在开发环境警告，而且不能通过 `v-bind="$attrs"` 把指令改投给另一个元素。

课程示例和 Demo 一律把指令直接绑定普通 HTML 元素。若行为属于组件公开能力，应使用 prop、emit、
slot 或明确的组件方法，不借根节点透传形成隐藏契约。

### 8. SSR 不运行客户端 DOM 钩子，需要属性时实现 getSSRProps

多数指令直接操作 DOM，因此 SSR 默认忽略。若服务端 HTML 必须包含属性，使用对象形式实现
`getSSRProps(binding)`，返回待输出的 props：

```ts
const identified = {
  /** 客户端挂载后同步元素 id。 */
  mounted(el: HTMLElement, binding: { value: string }) {
    el.id = binding.value
  },
  /** 服务端返回需要写入 HTML 的属性。 */
  getSSRProps(binding: { value: string }) {
    return { id: binding.value }
  },
}
```

公开文档规定 `getSSRProps()` 只接收 `binding`。Vue 3.5.40 helper 实际传入的 `oldValue` 是
`undefined`，第二个 VNode 参数是 `null`，无 hook 或返回空值时回退 `{}`。因此服务端逻辑只依赖
binding 的公开数据，不访问 DOM、VNode 或客户端闭包；函数简写也无法声明 `getSSRProps()`。

## 可验证学习目标

完成本课后，学习者应能：

1. 在组件、组合式函数、模板引用、内置绑定与自定义指令之间选择最小合适工具。
2. 用 `<script setup>` 的 `vName` 约定局部注册，并辨认 Options API 与全局注册形式。
3. 按正确顺序说出七个指令钩子，选择建立、更新和清理资源的时机。
4. 读取 `value`、`oldValue`、动态 `arg` 与 `modifiers`，且不修改只读 binding / VNode 参数。
5. 解释函数简写为什么只适合无独立清理需求的 `mounted + updated` 同构行为。
6. 避免在 `mounted` listener 中捕获陈旧值，并在 `updated` 同步最新配置。
7. 用 `unmounted` 成对移除原生 listener，并证明重新挂载后不会重复订阅。
8. 拒绝把组件根转发当稳定 API，并区分客户端 DOM 钩子与 SSR `getSSRProps()`。

## 推荐正文编排

1. **工具选择**：先判断行为是否必须直接接触一个普通元素。
2. **第一个局部指令**：`<script setup>` 中 `vFocus` 与动态插入后的 autofocus。
3. **注册边界**：局部 `vName`、Options `directives`、全局 `app.directive()`。
4. **七个钩子时间线**：创建、插入、更新、卸载，不先堆 API 表。
5. **binding 解剖**：value / oldValue / arg / modifiers；其余字段只认读不依赖。
6. **更新资源**：保存 element-owned state，避免 listener 闭包读取初始值。
7. **成对清理**：mounted 建立、unmounted 移除、重复挂载不累积。
8. **函数简写**：只在 mounted / updated 同行为且无需清理时使用。
9. **组件根反例**：单根偶然可用，多根 / 非元素根失效，回到普通元素。
10. **SSR 边界**：客户端钩子不输出 HTML；需要 attribute 才实现 `getSSRProps()`。
11. **Demo、练习与回顾**：只验证公开 DOM、binding 数据和生命周期日志。

## 高质量易错点候选

以下恰好 8 项都包含错误、正确和可观察后果；实施时不要为数量扩写相近条目。

### 1. 用自定义指令包装本该由组件或声明式绑定表达的界面

**错误示例：**

```vue
<article v-user-card="user"></article>
```

**正确示例：**

```vue
<UserCard :user="user" />
<div :class="{ highlighted: selected }"></div>
```

**后果：** 错误写法把渲染、状态和交互偷偷塞进 DOM mutation，无法通过 props / emits 理解，也
难以 SSR。只有聚焦、元素 listener、observer 或命令式 DOM 库等元素级行为才进入指令。

### 2. 在 created 中读取布局或聚焦

**错误示例：**

```ts
const focus = {
  /** 错误地在元素插入文档前聚焦。 */
  created(el: HTMLInputElement) {
    el.focus()
  },
}
```

**正确示例：**

```ts
const focus = {
  /** 元素插入文档后再聚焦。 */
  mounted(el: HTMLInputElement) {
    el.focus()
  },
}
```

**后果：** `created` 时 attribute、listener、父节点和布局尚未完整应用，测量不可信，聚焦也可能
失效。需要布局、焦点或原生资源的行为应等到 `mounted`。

### 3. 用函数简写建立资源，并期待它在卸载时自动清理

**错误示例：**

```ts
app.directive('resize-aware', (el) => {
  const observer = new ResizeObserver(() => updateLayout(el))
  observer.observe(el)
  return () => observer.disconnect()
})
```

**正确示例：**

```ts
const observers = new WeakMap<Element, ResizeObserver>()

const resizeAware = {
  /** 挂载后建立 observer。 */
  mounted(el: Element) {
    const observer = new ResizeObserver(() => updateLayout(el))
    observer.observe(el)
    observers.set(el, observer)
  },
  /** 卸载后释放 observer。 */
  unmounted(el: Element) {
    observers.get(el)?.disconnect()
    observers.delete(el)
  },
}
```

**后果：** 函数简写的返回值不是 cleanup，它只会在 mounted / updated 再次调用，反而可能建立
多个 observer。拥有资源生命周期时必须使用对象钩子。

### 4. 假定 updated 只在 binding.value 变化时调用

**错误示例：**

```ts
const chart = {
  /** 错误地在每次宿主更新后重建图表。 */
  updated(el: HTMLElement, binding: { value: ChartOptions }) {
    createChart(el, binding.value)
  },
}
```

**正确示例：**

```ts
const chart = {
  /** 只有图表配置引用变化时才更新现有实例。 */
  updated(el: HTMLElement, binding: { value: ChartOptions; oldValue: ChartOptions }) {
    if (binding.value !== binding.oldValue) updateChart(el, binding.value)
  },
}
```

**后果：** `updated` 跟随宿主更新流程，不是 binding watcher。无关文本变化也可能反复建立昂贵
资源；钩子必须比较真正影响 DOM 的输入并保持幂等。

### 5. 在 updated 中重复注册资源

**错误示例：**

```ts
const shortcut = {
  /** 错误地在每次更新中追加 window listener。 */
  updated(el: HTMLElement, binding: { value: () => void }) {
    window.addEventListener('keydown', () => binding.value())
  },
}
```

**正确示例：**

```ts
const shortcutResources = new WeakMap<HTMLElement, { value: () => void }>()

const shortcut = {
  /** 只更新已存在资源下一次读取的配置。 */
  updated(el: HTMLElement, binding: { value: () => void }) {
    const resource = shortcutResources.get(el)
    if (resource) resource.value = binding.value
  },
}
```

**后果：** 频繁更新会累积重复 listener，一次按键触发多次业务行为并泄漏资源。listener 应只在
`mounted` 建立一次，`updated` 只更新资源记录，卸载时再移除同一引用。

### 6. 修改 binding、arg 或 VNode 来跨钩子通信

**错误示例：**

```ts
const demo = {
  /** 错误地修改只读输入和底层 VNode。 */
  mounted(_el: Element, binding: any, vnode: any) {
    binding.arg = 'changed'
    vnode.props.internalState = true
  },
}
```

**正确示例：**

```ts
const directiveState = new WeakMap<Element, { channel: string | undefined }>()

const demo = {
  /** 把私有状态绑定到元素所有权。 */
  mounted(el: Element, binding: { arg?: string }) {
    directiveState.set(el, { channel: binding.arg })
  },
  /** 最终释放元素对应状态。 */
  unmounted(el: Element) {
    directiveState.delete(el)
  },
}
```

**后果：** 除 `el` 外参数应视为只读，VNode 和内部实例也不是课程可依赖的扩展点。`WeakMap` 不污染
DOM 公共属性，并会随元素释放；需要在 DOM 上检查的简单字符串才用命名明确的 dataset。

### 7. 把指令绑定组件，并依赖组件今天恰好是单根 div

**错误示例：**

```vue
<ResultPanel v-focus-ring />
```

```vue
<!-- ResultPanel 后来改成多根，父级指令失效。 -->
<header>结果</header>
<main>...</main>
```

**正确示例：**

```vue
<ResultPanel />
<button v-focus-ring type="button">查看结果</button>
```

**后果：** 组件指令隐式转交根节点，多根或非元素根会警告 / 失效，也不能靠 `$attrs` 改投另一个
元素。把指令直接放在行为真正所属的普通元素上，或把能力设计成组件 prop / emit。

### 8. 期待 mounted 在 SSR 期间写出 attribute

**错误示例：**

```ts
const identify = (el: HTMLElement, binding: { value: string }) => {
  el.id = binding.value
}
```

**正确示例：**

```ts
const identify = {
  /** 客户端挂载后同步 id。 */
  mounted(el: HTMLElement, binding: { value: string }) {
    el.id = binding.value
  },
  /** 服务端返回初始 HTML 所需 id。 */
  getSSRProps(binding: { value: string }) {
    return { id: binding.value }
  },
}
```

**后果：** SSR 没有 DOM，也不会运行 mounted / updated / unmounted。缺少 `getSSRProps()` 时初始
HTML 没有对应属性；函数简写还会被 SSR helper 直接忽略。

## Vue 3.5.40 源码推导

本节只解释“为什么固定版本呈现这些行为”。课程实现不得导入私有 helper 或读取 VNode `dirs`。

### 1. 函数简写在进入 renderer 前已经变成 mounted + updated 对象

`withDirectives()` 遍历编译器传入的 directive tuples。遇到函数时只创建：

```ts
dir = {
  mounted: dir,
  updated: dir,
}
```

随后才把 `dir`、公开组件实例、value、初始 `oldValue: undefined`、arg、modifiers 放进
`vnode.dirs`。这直接推出：函数不会收到创建前、更新前或卸载钩子，也不能通过返回函数注册 cleanup。

来源：[`directives.ts#L148-L164`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts#L148-L164)。

### 2. oldValue 是上一 VNode 同位置 value 的引用，不是变化检测或快照

`invokeDirectiveHook()` 取得 `prevVNode.dirs`，再按相同索引执行
`binding.oldValue = oldBindings[i].value`。源码没有 `Object.is()` 判断，也没有 clone；所以更新钩子
即使值未变化也可以执行，而 reactive 对象的历史字段不能靠 `oldValue` 恢复。

来源：[`directives.ts#L170-L183`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts#L170-L183)。

### 3. 指令钩子暂停依赖追踪，并进入 Vue 统一错误链

Vue 在调用每个 hook 前 `pauseTracking()`，通过 `callWithAsyncErrorHandling()` 传入
`[vnode.el, binding, vnode, prevVNode]`，之后 `resetTracking()`。因此在钩子里读取 reactive 数据不应
被理解为自动建立一个持续 effect；若需要持续响应，应让模板重新求值 binding，或由 composable / watcher
显式拥有响应式副作用。钩子抛错或返回 rejected Promise 则进入 Vue 指令错误类型的统一处理链。

来源：[`directives.ts#L183-L200`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts#L183-L200)。

### 4. 三组“before / after”由 renderer 的真实 DOM 边界分隔

元素挂载时，`created` 在 scope id 和 props patch 之前调用，`beforeMount` 在 `hostInsert()` 前，
`mounted` 在插入后通过 post-render effect 调用。更新时，`beforeUpdate` 在 children / props patch 前，
`updated` 在 patch 完成后排队。卸载时，renderer 只对带 dirs 的元素 VNode 调用 `beforeUnmount`，
并通过 post-render effect 排队执行 `unmounted`；Transition 可能延迟真正的 host remove，因此不能据此
承诺元素移除与 `unmounted` 的私有先后关系。

这说明：初始化 listener 用 mounted，依赖最终 DOM 的同步用 updated，确需元素仍存在的收尾放在
beforeUnmount，最终资源释放放在 unmounted。课程不把 post-render queue 的私有调度细节暴露成可调用 API。

来源：[`renderer.ts` 挂载](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts#L692-L752)、
[`renderer.ts` 更新](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts#L848-L971)、
[`renderer.ts` 卸载](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts)。

### 5. 组件指令通过克隆根 VNode 转发，不是组件主动接收

`renderComponentRoot()` 检查组件 VNode 的 `dirs`，开发环境先用 `isElementRoot(root)` 判断根是否可用，
然后 clone 根 VNode，并把组件上的 dirs 与根原有 dirs 合并。Fragment、文本和 Teleport 等非元素根
无法形成可靠目标；组件根结构一变，父级指令契约也随之改变。

这解释了官方“不推荐在组件上使用”的原因：它不是组件声明的 prop 或 emit，而是 renderer 对根
VNode 的隐式转交。主线必须绑定普通元素。

来源：[`componentRenderUtils.ts#L244-L255`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts#L244-L255)。

### 6. SSR helper 只调用对象指令的 getSSRProps

`ssrGetDirectiveProps()` 先排除函数指令，再查找 `dir.getSSRProps`。它构造的 binding 包含公开实例、
value、`oldValue: undefined`、arg、modifiers 和 dir，调用时第二个 VNode 参数为 `null`；无 hook 或
hook 返回空值时得到 `{}`。

这直接推出三个课程边界：函数简写无法产生 SSR props；`getSSRProps()` 不应读取 DOM 或 VNode；
服务端只输出声明返回的初始属性，客户端资源建立和清理仍属于 mounted / unmounted。

来源：[`ssrGetDirectiveProps.ts#L7-L30`](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/helpers/ssrGetDirectiveProps.ts#L7-L30)。

## 唯一 Demo 已实现规格

### 唯一公开 Demo

| 字段 | 冻结值 |
| --- | --- |
| Demo ID | `vue.core.learn.advanced.custom-directives.directive-lifecycle-lab-demo` |
| 文件 | `src/content/demos/vue/core/learn/advanced/custom-directives/directive-lifecycle-lab-demo.vue` |
| 指令 | SFC 内局部 `vShortcut` 对象指令 |
| 目标元素 | 一个带 `tabindex="0"` 的普通可聚焦 `<div>`，绝不绑定组件 |
| 主命题 | 无关更新保持幂等，K / M binding 切换生效，卸载释放 listener |

Demo 使用一个普通可聚焦宿主元素：

```vue
<div
  v-if="targetVisible"
  v-shortcut="shortcutBinding"
  data-testid="directive-target"
  tabindex="0"
>
  <strong>{{ shortcutBinding.label }}</strong>
  <span>宿主内容中的无关计数：{{ unrelatedCount }}</span>
</div>
```

课程正文完整解释七个公开钩子，但唯一 Demo 只实现资源路径实际需要的 `mounted`、`updated`、
`beforeUnmount`、`unmounted`。`mounted` 在 `window` 建立一份稳定 `keydown` listener，并把
`ShortcutResource` 存入 `WeakMap<HTMLElement, ShortcutResource>`；`updated` 总是先更新 listener 下次读取的
最新 binding，但只有 `key` 或 `label` 变化时才写 DOM；`beforeUnmount` 在元素仍存在时记录资源状态；
`unmounted` 用同一 handler 引用移除 listener、删除资源记录并把活动资源数归零。

### 固定初始状态

- `shortcutKey = 'k'`，对应 `data-shortcut="k"` 与 `aria-keyshortcuts="K"`。
- `targetVisible = true`。
- `unrelatedCount = 0`、`shortcutHits = 0`、`domWriteCount = 0`、`activeResourceCount = 0`。
- 初次 post-render 后，DOM 写入数和活动资源数均为 `1`，生命周期日志只有 `mounted`。
- `shortcutBinding` 包含 `key`、`label`、`hostRevision` 与 `onTrigger`；Demo 不使用动态参数或修饰符。

### 固定交互

1. 初始按 `K`，快捷键命中数从 `0` 变为 `1`。
2. 激活“更新无关状态”，`hostRevision` 和宿主文本变化，`updated` 追加“未变化，跳过 DOM 写入”，
   但 DOM 写入数仍为 `1`，活动资源数仍为 `1`。
3. 激活“切换绑定值”，快捷键从 K 切为 M，目标的 `aria-keyshortcuts` 变为 `M`，DOM 写入数变为
   `2`，日志记录 `K -> M`。
4. 再按 `K` 不增加命中数，按 `M` 才把命中数从 `1` 变为 `2`，证明稳定 listener 读取最新 binding。
5. 激活“移除目标”，日志依次追加 `beforeUnmount -> unmounted`，目标消失且活动资源数归零；再按 `M`
   不产生新命中。
6. 激活“恢复目标”，只追加一个 `mounted`，活动资源数恢复为 `1`，DOM 写入数变为 `3`；再按 `M`
   只增加一次命中，证明旧 listener 已释放且没有重复订阅。

无关更新会让 computed binding 产生包含新 `hostRevision` 的对象，因此 `updated` 可被观察；指令只把
`key` 和 `label` 视为需要写入 DOM 的真实输入。它先把整个最新 binding 写回资源记录，再决定是否跳过
DOM attribute 更新，从而同时证明宿主无关更新幂等和 listener 不捕获首次配置。

### 稳定公开契约

- Demo 根：`.directive-lifecycle-lab-demo`。
- 可聚焦目标：`data-testid="directive-target"`，并公开 `data-shortcut` 与 `aria-keyshortcuts`。
- 卸载占位：`data-testid="directive-placeholder"`。
- 汇总：`data-testid="shortcut-summary"`；资源、命中和无关计数分别使用
  `active-resource-count`、`shortcut-hit-count`、`unrelated-count`。
- 无关更新命令：`data-testid="update-unrelated"`。
- binding 切换命令：`data-testid="switch-shortcut"`。
- 显隐命令：`data-testid="toggle-directive-target"`。
- 日志项：`data-testid="hook-entry"`，并用 `data-hook` 表达公开钩子名称。
- 汇总和日志列表分别使用 `aria-live="polite"`；不依赖内部 VNode 状态生成断言。

### 实现约束

- 恰好一个公开 Demo ID；指令与 `WeakMap` 保持在同一 SFC，不新增通用指令框架。
- 所有新增方法定义上方写规范、简洁的中文注释。
- 指令直接绑定普通可聚焦 div，不绑定组件，不读取 VNode、instance、uid、dirs 或 renderer 私有字段。
- 使用 `Directive` / `DirectiveBinding` 公开类型；不得 `any` 逃避 binding 形状。
- listener 在 mounted 恰好注册一次，在 unmounted 用相同引用移除；updated 不重复注册。
- 不调用 `app.directive()` 修改全局应用，不制造第二份 Options API Demo。
- 不访问网络、localStorage、随机值、时间戳、timer、MutationObserver 或第三方库。
- 样式只使用 flex、margin 和 padding，不使用 CSS `grid`、`gap`、`row-gap` 或 `column-gap`。
- 390px 与 200% 文本下可换行、无横向滚动；按钮双轴至少 44px，焦点样式清晰。
- 目标和日志使用轻量 transition；`prefers-reduced-motion: reduce` 下关闭 transition 与 transform。

### 最小 E2E 契约

使用一条长路径测试，不拆成多个相似用例：

1. 从上一课“错误处理”进入“下一篇：自定义指令”，确认标题、唯一 Demo 和上一篇链接。
2. 初始断言 `aria-keyshortcuts="K"`、活动资源 `1`、DOM 写入 `1`，日志严格只有 `mounted`。
3. 用 `Shift+Tab` 聚焦普通目标并确认可见焦点；按 `K` 后断言命中数为 `1`。
4. 更新无关状态，断言日志追加 `updated` 和“未变化”，同时 DOM 写入仍为 `1`。
5. 切换到 M，断言 attribute、写入数和 `K -> M` 日志同步更新；旧键不命中，新键只命中一次。
6. 移除目标，断言 `beforeUnmount / unmounted` 顺序、占位可见、资源归零且按 M 不再命中；恢复后只
   追加一个 `mounted`，资源恢复为 `1`，再次按 M 只增加一次。
7. 在 390 × 844、200% 文本和 reduced motion 下复跑完整交互路径；检查 44px、无截断 / 重叠 / 横向滚动。
8. 全程收集 console error、console warning 与 pageerror，最终均为空；所有等待使用 locator 状态，
   不使用固定 `waitForTimeout()`。

## 已冻结 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.advanced.custom-directives',
  type: 'lesson',
  title: '自定义指令',
  summary: '把必须接触真实元素的行为封装为可清理、可更新且边界明确的 DOM 生命周期能力',
  ecosystem: 'vue',
  module: 'core',
  collection: 'advanced',
  level: 'advanced',
  prerequisites: ['vue.core.learn.advanced.error-handling'],
  related: [
    'vue.core.learn.advanced.error-handling',
    'vue.core.learn.intermediate.composables',
    'vue.core.learn.intermediate.lifecycle-update-timing',
    'vue.core.reference.advanced.custom-directives',
  ],
  tags: [
    '自定义指令',
    'Directive',
    'DirectiveBinding',
    'DOM 生命周期',
    '资源清理',
    '函数简写',
    'getSSRProps',
  ],
  sources: [
    {
      title: 'Vue 中文自定义指令指南',
      url: 'https://cn.vuejs.org/guide/reusability/custom-directives.html',
    },
    {
      title: 'Vue 应用实例 API：app.directive',
      url: 'https://cn.vuejs.org/api/application.html#app-directive',
    },
    {
      title: 'Vue 其他杂项选项：directives',
      url: 'https://cn.vuejs.org/api/options-misc.html#directives',
    },
    {
      title: 'Vue SSR：自定义指令',
      url: 'https://cn.vuejs.org/guide/scaling-up/ssr.html#custom-directives',
    },
    {
      title: 'Vue 自定义指令官方 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/reusability/custom-directives.md',
    },
    {
      title: 'Vue 3.5.40 directives.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts',
    },
    {
      title: 'Vue 3.5.40 renderer.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts',
    },
    {
      title: 'Vue 3.5.40 指令官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/directives.spec.ts',
    },
    {
      title: 'Vue 3.5.40 ssrGetDirectiveProps.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/helpers/ssrGetDirectiveProps.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-01',
  estimatedMinutes: 60,
})
```

上述 prerequisite、related 顺序、summary、tags、唯一 Demo ID、60 分钟和恰好 8 个易错点均与当前
实现一致。不得增加第二个公开 Demo，也不得提前进入渲染函数课程。

## 本批最小实施范围

本批只由下列课程、接线、验证和状态文件承载自定义指令上线：

- `src/content/entries/learn/vue/core/advanced/custom-directives.ts`
- `src/content/demos/vue/core/learn/advanced/custom-directives/directive-lifecycle-lab-demo.vue`
- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/custom-directives.spec.ts`
- `tests/e2e/error-handling.spec.ts`
- `docs/重构实施计划.md`
- `docs/research/vue-custom-directives.md`

本课上线后三条 Vue 学习路线精确为 `24 available / 36 planned`，总规划数保持 60。完成即停止，
不得进入 `vue.core.learn.advanced.render-functions-vnodes`，不得修改现有 Reference 或 Reference Demo。

## 明确停止边界

- 本批只修改上方“本批最小实施范围”列出的文件，不扩展到 Reference、router、schema 或全局样式。
- 本批只发布一课、一个公开 Demo 和一条最小 E2E；达到契约后立即停止。
- 不启动新的开发服务器、不主动打开页面、不提交代码。
- 不把客户端 Vite SPA 结果外推为 SSR / hydration 保证；SSR 结论只来自官方文档与固定源码。
- 不把 Vue 3.5.40 的 VNode 绑定数组、按索引回填和 post-render queue 写成稳定公共 API。

## 自检结论

1. 使用时机明确限定为普通元素的必要 DOM 行为，并写明组件 / 声明式能力优先。
2. `<script setup>` `vName`、Options `directives`、`app.directive()` 三种注册方式已分开。
3. 七个对象钩子、四个参数和 binding 六个字段均完整覆盖。
4. 函数简写准确冻结为 `mounted + updated`，未误写成七钩子或 cleanup 协议。
5. 8 个易错点均有错误示例、正确示例和后果，且没有同义凑数。
6. 6 个源码推导分别覆盖归一化、旧值、追踪 / 错误、renderer 时序、组件根和 SSR。
7. 唯一 Demo 用同一条确定性路径验证无关更新幂等、K / M binding 切换、listener 最新值与卸载清理。
8. 组件根、多根 / 非元素根、SSR 和后续渲染函数课程均有明确负范围。
9. 实施后精确为 `24 available / 36 planned`；下一课仍为 planned，未提前进入渲染函数课程。
