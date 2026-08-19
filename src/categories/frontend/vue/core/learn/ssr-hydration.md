---
id: vue.core.learn.advanced.ssr-hydration
type: lesson
title: SSR 与 Hydration
summary: 让服务端 HTML 与客户端首次渲染保持确定性，并把浏览器专属逻辑留在客户端边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.advanced.performance
  - vue.core.learn.advanced.async-components-suspense
  - vue.core.learn.advanced.error-handling
  - vue.core.learn.intermediate.lifecycle-update-timing
tags:
  - SSR
  - Hydration
  - createSSRApp
  - renderToString
  - 确定性渲染
  - hydration mismatch
  - data-allow-mismatch
  - 客户端边界
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-02
sources:
  - title: Vue 中文服务端渲染指南
    url: https://cn.vuejs.org/guide/scaling-up/ssr.html
  - title: Vue 中文服务端渲染 API
    url: https://cn.vuejs.org/api/ssr.html
  - title: Vue 中文应用实例 API：createSSRApp
    url: https://cn.vuejs.org/api/application.html#createssrapp
  - title: Vue 中文生命周期 API：onServerPrefetch
    url: https://cn.vuejs.org/api/composition-api-lifecycle.html#onserverprefetch
  - title: Vue SSR 指南官方 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/guide/scaling-up/ssr.md
  - title: Vue 3.5.40 runtime-dom createSSRApp 源码
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/index.ts
  - title: Vue 3.5.40 hydration.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/hydration.ts
  - title: Vue 3.5.40 server renderer render.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/render.ts
  - title: Vue 3.5.40 renderToString.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/renderToString.ts
  - title: Vue 3.5.40 hydration 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts
  - title: Vue 3.5.40 server renderer 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/__tests__/render.spec.ts
stage: advanced
level: advanced
estimatedMinutes: 75
prerequisites:
  - vue.core.learn.advanced.performance
objectives:
  - 区分服务端字符串渲染、浏览器解析与客户端激活三个阶段
  - 说明 createSSRApp 在客户端复用现有 DOM 而不是重新创建整棵树
  - 让服务端输出与客户端首次渲染使用同一份确定性输入
  - 识别时间、随机数、时区、浏览器 API 和非法 HTML 带来的不匹配
  - 按请求创建应用、路由与 store，避免跨请求状态污染
  - 用 onServerPrefetch 准备服务端数据并安全交接给客户端
  - 区分文本、children、attribute 与节点类型不匹配及其恢复成本
  - 只对无法避免且已理解的差异使用 data-allow-mismatch
  - 为浏览器专属内容选择挂载后更新或显式客户端边界
recap:
  - SSR 先生成 HTML，hydration 再让客户端 VNode 接管已有 DOM；可见不等于已交互。
  - 服务端输出与客户端首次 render 必须共享组件版本、路由结果和确定性初始状态。
  - 时间、随机数、locale、时区和浏览器 API 应共享种子或快照，或推迟到挂载后。
  - 每个请求都要新建 app、router、store 与请求缓存，避免跨请求状态污染。
  - onServerPrefetch 会被服务端等待，但预取结果仍必须安全序列化并在客户端恢复。
  - Vue 会分类警告并尽量恢复不匹配 DOM；恢复成功不代表没有性能与视觉成本。
  - data-allow-mismatch 只用于已理解且无法避免的窄范围差异，不是通用修复。
  - 当前 SPA 实验台只验证确定性与边界决策模型；真实 SSR 需要 Node 服务端输出和浏览器激活反馈环。
---

# SSR 与 Hydration

## 一、正文大纲

上一课从性能预算判断何时值得增加运行复杂度，本课把这条判断推进到 SSR。服务端先把组件树变成 HTML，浏览器解析为 DOM，客户端再用同一组件树激活已有节点并绑定响应式更新与事件。首屏更早可见不代表组件已经可交互；真正可靠的契约是两端首次渲染一致，然后把浏览器专属变化推迟到激活之后。

## 二、先分清三个阶段

:::steps
### 服务端创建请求级应用

每次请求创建新的 app、router 与 store，并把请求数据写入该请求自己的状态。

### server-renderer 产出 HTML

renderToString() 遍历组件树，等待已登记的异步依赖，并返回字符串。

### 浏览器解析 HTML

HTML parser 会规范化标签结构；非法嵌套可能在 Vue 执行前就改变节点树。

### 客户端激活已有 DOM

createSSRApp().mount() 让客户端 VNode 与现有节点对齐，补上事件与响应式更新。
:::

:::tip
SSR 只描述生成 HTML 的阶段，hydration 才是浏览器把静态节点接回 Vue 运行时的阶段。HTML 已出现但按钮尚未激活的时间窗口，必须由真实 SSR 环境测量，不能由普通 SPA 首次挂载代替。
:::

## 三、共享应用工厂，两端入口各负其责

通用模块导出应用工厂，服务端入口负责按请求创建并 renderToString，客户端入口负责恢复同一初始状态后 mount。两端必须引用同一根组件和同一路由结果；差异只应来自平台入口，而不是首轮模板分支。

~~~~ts
// app.ts：服务端和客户端共享
import { createSSRApp } from 'vue'
import App from './App.vue'
import { createStore } from './store'

/** 为单次服务端请求或一次浏览器启动创建隔离应用。 */
export function createVueApp(initialState: InitialState) {
  const app = createSSRApp(App)
  const store = createStore(initialState)
  app.provide(storeKey, store)
  return { app, store }
}

// entry-server.ts
/** 使用本次请求的数据生成 HTML 与待序列化状态。 */
export async function render(url: string) {
  const initialState = await loadInitialState(url)
  const { app } = createVueApp(initialState)
  return { html: await renderToString(app), initialState }
}

// entry-client.ts
const initialState = readSerializedState()
createVueApp(initialState).app.mount('#app')
~~~~

:::warning
示例省略了 HTTP 服务、路由 ready、HTML 模板和安全序列化。生产项目优先使用 Nuxt 等 SSR 框架；若自行实现，状态必须用防止脚本闭合与注入的序列化方案，不能把未经转义的 JSON 直接拼入 script。
:::

## 四、首次渲染确定性是核心契约

同一个 URL、同一份已序列化状态与同一组件版本，应在服务端渲染和客户端第一次 render 中得到等价的节点类型、顺序、关键属性与文本。激活完成后的点击、媒体查询、用户时区和实时钟表可以改变界面；它们不应提前渗入客户端首次 render。

| 输入 | 首次渲染策略 | 激活后策略 |
| --- | --- | --- |
| 请求数据 | 序列化并在客户端恢复同一快照 | 按业务请求更新 |
| 随机结果 | 共享随机种子或固定占位 | 挂载后生成客户端值 |
| 本地时区 | 使用两端一致的 UTC 文本或占位 | 挂载后转为用户时区 |
| viewport / matchMedia | 不参与首轮结构分支 | onMounted 后读取并更新 |
| 稳定 ID | 使用同一数据 ID 或 useId | 后续保持身份稳定 |

~~~~vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const localTime = ref('等待客户端时区')

/** 激活完成后再读取浏览器时区，避免改变客户端首次渲染。 */
function showLocalTime(): void {
  localTime.value = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date('2026-08-02T08:00:00Z'))
}

onMounted(showLocalTime)
</script>

<template><time>{{ localTime }}</time></template>
~~~~

## 五、服务端数据要等待，也要交接

onServerPrefetch 注册的 Promise 会在服务端渲染该组件前被等待，适合填充请求级状态。仅在服务端拿到数据还不够：客户端必须恢复这份结果，否则首次 render 又回到空状态并产生差异。onMounted 不在服务端执行，适合浏览器专属副作用，但不负责 SSR 数据预取。

~~~~vue
<script setup lang="ts">
import { onServerPrefetch } from 'vue'
import { useCatalogStore } from './catalog-store'

const catalog = useCatalogStore()

/** 在服务端渲染前把课程写入本请求的 store。 */
async function prepareCatalog(): Promise<void> {
  if (!catalog.loaded) await catalog.load()
}

onServerPrefetch(prepareCatalog)
</script>
~~~~

## 六、按请求隔离状态，避免用户数据串线

浏览器中的模块级 store 通常只服务一个页面会话；SSR 服务器却会在多个请求之间复用模块。若用户数据写入单例响应式对象，后一个请求可能读到前一个请求的内容。应用、router、store 和请求级缓存都应从每次请求调用的工厂创建。

:::compare{before="跨请求单例" after="请求级工厂"}
### 跨请求单例

~~~~text
// 模块加载时只创建一次，所有请求共享
export const store = reactive({ user: null })
~~~~

### 请求级工厂

~~~~text
/** 为一次请求创建独立状态。 */
export function createStore(initialState: State) {
  return reactive({ ...initialState })
}
~~~~
:::

## 七、不匹配是分类信号，不是一个笼统警告

Vue 会按节点类型进入不同激活路径。文本不同可直接改写文本节点；children 多出或缺少时会移除或补挂；节点类型不一致时会移除不匹配节点并重新 patch。Vue 会尽量恢复，但恢复意味着额外 DOM 工作，也可能造成视觉跳变，因此开发期应先找到两端输入差异。

| 可见信号 | 常见原因 | 修复方向 |
| --- | --- | --- |
| text mismatch | 时间、随机数、locale 文本 | 共享快照或挂载后转换 |
| children mismatch | 两端条件分支不同、非法嵌套 | 统一首轮分支并校验 HTML |
| attribute mismatch | 动态 class、style、id 或普通属性 | 恢复同一状态与稳定 ID |
| node mismatch | 标签或组件根节点不同 | 移除平台分支或建立客户端边界 |

:::warning
不要把“页面最后看起来正常”当作激活成功证据。自动恢复可能已经替换节点；应同时检查开发期 warning、console error、关键节点是否复用、事件是否可用以及首屏是否跳变。
:::

## 八、data-allow-mismatch 只压制已理解的警告

Vue 3.5+ 的 data-allow-mismatch 可放在元素上，无值时允许当前元素的全部分类，也可窄化为 text、children、class、style 或 attribute。text 与 children 会向祖先查找允许项；class、style 与 attribute 只检查当前元素。结构允许项放得过高仍会掩盖更大范围。它不让两端结果自动一致，也不消除恢复 DOM 的成本。

~~~~vue
<template>
  <!-- 只有这一段本地时间被确认无法在服务端确定 -->
  <time data-allow-mismatch="text">{{ localTime }}</time>
</template>
~~~~

## 九、客户端边界要保留稳定占位

若内容必须读取 canvas、window、viewport 或用户本地时区，可让服务端与客户端首轮都渲染稳定占位，再在 onMounted 后切换；SSR 框架也可能提供 ClientOnly 一类边界。边界的代价是该区域没有真实 SSR 内容，布局应预留稳定空间，并决定无 JavaScript 时的可用程度。

~~~~vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const mounted = ref(false)

/** 在客户端激活完成后开放浏览器专属内容。 */
function openClientBoundary(): void {
  mounted.value = true
}

onMounted(openClientBoundary)
</script>

<template>
  <BrowserChart v-if="mounted" />
  <div v-else class="chart-placeholder" aria-busy="true">图表区域</div>
</template>
~~~~

## 十、易错使用提示

:::pitfalls
### 在首轮模板中读取当前时间或随机数

**触发条件：** 在首轮模板中读取当前时间或随机数

**原因：** 同一组件会在服务端和客户端各执行一次，两次非确定性调用没有相等保证。

**后果：** 文本、ID 或列表顺序不匹配，Vue 需要改写或重建节点。

**错误示例：**

~~~~vue
<template><p>{{ Date.now() }} / {{ Math.random() }}</p></template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const props = defineProps<{ issuedAt: string }>()
</script>
<template><time>{{ props.issuedAt }}</time></template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 让服务端猜测用户 locale 与时区

**触发条件：** 让服务端猜测用户 locale 与时区

**原因：** 服务器 locale 或时区不一定等于浏览器设置，服务端也通常不知道用户时区。

**后果：** 同一个时间戳在两端生成不同文本，导致 text mismatch。

**错误示例：**

~~~~ts
const label = new Date(issuedAt).toLocaleString()
~~~~

**正确写法：**

~~~~ts
const label = ref('等待本地时间')

/** 挂载后再按浏览器时区格式化。 */
function localize(): void {
  label.value = new Date(issuedAt).toLocaleString()
}

onMounted(localize)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 setup 顶层直接读取 window

**触发条件：** 在 setup 顶层直接读取 window

**原因：** 通用代码也会在 Node 侧执行，服务端没有 window、document 或 localStorage。

**后果：** 服务端渲染在输出 HTML 前直接抛错。

**错误示例：**

~~~~ts
const compact = window.matchMedia("(max-width: 640px)").matches
~~~~

**正确写法：**

~~~~ts
const compact = ref(false)

/** 挂载后读取浏览器媒体查询。 */
function readViewport(): void {
  compact.value = window.matchMedia("(max-width: 640px)").matches
}

onMounted(readViewport)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在模块顶层创建用户 store

**触发条件：** 在模块顶层创建用户 store

**原因：** Node 进程会为多个请求复用模块，单例状态也随之被复用。

**后果：** 前一个请求的用户数据可能泄露到后一个请求。

**错误示例：**

~~~~ts
export const store = reactive({ currentUser: null })
~~~~

**正确写法：**

~~~~ts
/** 为一次请求创建隔离 store。 */
export function createStore() {
  return reactive({ currentUser: null })
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 服务端有数据，客户端却从空状态开始

**触发条件：** 服务端有数据，客户端却从空状态开始

**原因：** onServerPrefetch 只保证服务端等待；客户端仍要恢复同一份序列化状态。

**后果：** 服务端列表在客户端首轮变为空列表，产生 children mismatch。

**错误示例：**

~~~~ts
const store = createStore({ lessons: [] })
~~~~

**正确写法：**

~~~~ts
const store = createStore(readSerializedState())
~~~~

**验证方式：** 对照正确写法验证结果。

### 输出浏览器会修正的非法 HTML

**触发条件：** 输出浏览器会修正的非法 HTML

**原因：** HTML parser 会先修正非法嵌套，Vue 收到的 DOM 已经不同于服务端字符串。

**后果：** 即使两端执行同一模板，也可能出现 children 或 node mismatch。

**错误示例：**

~~~~html
<p>课程说明<div>重要提示</div></p>
~~~~

**正确写法：**

~~~~html
<div><p>课程说明</p><div>重要提示</div></div>
~~~~

**验证方式：** 对照正确写法验证结果。

### 客户端入口误用 createApp

**触发条件：** 客户端入口误用 createApp

**原因：** 普通 createApp().mount() 会按客户端挂载处理容器，不表达复用 SSR DOM 的意图。

**后果：** 失去 hydration 路径，服务端节点复用与不匹配诊断都不成立。

**错误示例：**

~~~~ts
createApp(App).mount('#app')
~~~~

**正确写法：**

~~~~ts
createSSRApp(App).mount('#app')
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 data-allow-mismatch 掩盖未知差异

**触发条件：** 用 data-allow-mismatch 掩盖未知差异

**原因：** 允许项只控制不匹配警告，不能修复错误输入或消除 DOM 恢复成本。

**后果：** 真实回归被静默，过高祖先上的 text 或 children 允许项还会扩大隐藏范围。

**错误示例：**

~~~~html
<main data-allow-mismatch><EntireApplication /></main>
~~~~

**正确写法：**

~~~~html
<time data-allow-mismatch="text">{{ localTime }}</time>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十一、从 Vue 3.5.40 源码推导边界

:::steps
### createSSRApp 延迟启用 hydration renderer

runtime-dom/src/index.ts 通过 ensureHydrationRenderer() 创建应用，并让客户端 mount 走激活路径；普通 createApp 是不同入口。

### 空容器会退化为完整挂载

runtime-core/src/hydration.ts 的根 hydrate 先检查 hasChildNodes；容器为空时警告并调用 patch(null, vnode)。

### hydrateNode 把 VNode 对齐到现有节点

激活先把 vnode.el 指向当前 DOM，再按 Text、Comment、Static、Fragment、Element、Component 等类型分派。

### 不同不匹配走不同恢复动作

文本差异直接改写 data；缺少 children 会 mount；多余 children 会 remove；节点类型错误由 handleMismatch 移除后重新 patch。

### 允许项会沿祖先查找

isMismatchAllowed 读取 data-allow-mismatch；text 与 children 会继续向父元素查找，class、style 与 attribute 只检查当前元素。无值允许当前元素的全部分类。

### serverPrefetch Promise 会进入服务端 buffer

server-renderer/src/render.ts 在组件 setup 后调用 serverPrefetches，并等待结果再继续 renderComponentSubTree；官方测试验证最终 HTML 包含预取值。

### renderToString 最后解析 Teleport 并清理 watcher

renderToString.ts 展开异步 buffer 后调用 resolveTeleports(context)，再执行 SSR watcher handles；context.teleports 是独立输出。
:::

:::warning
vnode.el、handleMismatch、buffer 与 watcher handles 是实现证据，不是业务测试契约。应用测试应观察服务端 HTML、开发期不匹配消息、关键 DOM 是否复用、交互是否接管以及请求状态是否隔离。
:::

## 十二、在边界实验台观察首次比对

唯一 Demo 固定展示“服务器快照”和“客户端首次渲染”两份模型数据，可切换确定性输入、文本漂移与结构漂移，并比较直接激活和客户端边界。它运行在当前 Vite SPA 中，不生成服务端 HTML、不调用 Node server-renderer，也不把模型结论伪装成真实 hydration 证据。

:::demo{id="vue.core.learn.advanced.ssr-hydration.ssr-hydration-boundary-lab-demo" playground="true"}
比较确定性首轮、两类 mismatch 与客户端边界的可观察结果模型
:::

## 十三、练习与回顾

:::exercise
### 定位三条不匹配链

**要求：**

~~~~text
一个课程页同时在模板中调用 Date.now()、在 setup 顶层读取 matchMedia，并让服务端 store 有课程而客户端从空数组开始。逐项写出失败阶段、不匹配类型与最小修复。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
Date.now() 在两端首轮产生 text mismatch，应序列化固定值或挂载后更新；matchMedia 在服务端执行时就会因 window 缺失失败，应移入 onMounted；空客户端 store 会产生 children mismatch，应恢复服务端序列化快照。
~~~~
:::
