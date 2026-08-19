---
id: vue.core.learn.advanced.error-handling
type: lesson
title: 错误处理
summary: 用局部错误边界承接组件失败，并把恢复界面、传播规则和应用级上报分开设计
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.advanced.async-components-suspense
  - vue.core.reference.composition.lifecycle
  - vue.core.reference.application.create-app
  - vue.core.reference.application.define-async-component
tags:
  - onErrorCaptured
  - app.config.errorHandler
  - 错误边界
  - 错误传播
  - 异步错误
  - fallback
  - 恢复策略
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-01
sources:
  - title: Vue 生命周期 API：onErrorCaptured
    url: https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured
  - title: Vue 应用实例 API：app.config.errorHandler
    url: https://cn.vuejs.org/api/application.html#app-config-errorhandler
  - title: Vue 生产部署：追踪运行时错误
    url: https://cn.vuejs.org/guide/best-practices/production-deployment.html#tracking-runtime-errors
  - title: Vue 中文异步组件指南
    url: https://cn.vuejs.org/guide/components/async.html
  - title: Vue 中文 Suspense 指南：错误处理
    url: https://cn.vuejs.org/guide/built-ins/suspense.html#error-handling
  - title: Vue 3.5.40 errorHandling.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/errorHandling.ts
  - title: Vue 生产环境运行时错误代码
    url: https://cn.vuejs.org/error-reference/#runtime-errors
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - vue.core.learn.advanced.async-components-suspense
objectives:
  - 识别 Vue 会接管的组件错误来源，并明确普通 JavaScript 异步任务不自动进入错误链
  - 使用 onErrorCaptured 捕获后代组件错误，并渲染不会再次触发原错误的后备界面
  - 预测多个错误钩子从内到外的调用顺序，并用返回 false 明确停止传播
  - 区分局部恢复界面与 app.config.errorHandler 的应用级上报职责
  - 理解返回给 Vue 的 Promise 拒绝为何可捕获，而脱离调用链的异步错误不可捕获
  - 用重新挂载失败子树建立显式恢复动作，而不是假设 Vue 会自动修复组件状态
  - 区分异步组件 loader 的 onError 重试协议与组件运行期错误边界
  - 只依赖公开参数和 DOM 状态验证错误处理，不读取组件内部实例字段
recap:
  - Vue 只接管由它调用的组件渲染、钩子、侦听器、指令、过渡和事件错误。
  - onErrorCaptured 从后代向祖先传播，不能捕获注册组件自身的错误。
  - 多个钩子由内到外调用，只有严格返回 false 才停止后续传播和应用级处理。
  - 局部边界负责稳定后备界面，app.config.errorHandler 负责统一上报未截断错误。
  - 返回给 Vue 的 Promise 拒绝可进入错误链，脱离调用链的异步任务需要自行捕获。
  - 捕获不等于恢复；重新挂载失败子树前还要处理输入、请求和业务副作用。
  - defineAsyncComponent 的 onError 只处理 loader 失败，不替代组件运行期错误边界。
  - 生产环境 info 会缩短，监控代码应保留原值并按官方错误码资料解析。
---

# 错误处理

## 一、正文大纲

上一课解决等待状态，本课处理等待结束后的失败状态。Vue 的错误处理是一条从出错组件向祖先传播的链：局部边界决定用户看到什么，应用级处理器负责统一记录仍未处理的错误；业务重试、网络取消和数据回滚仍由对应业务层负责。

| 问题 | 主要 owner | 不应混入的职责 |
| --- | --- | --- |
| 局部组件无法继续展示 | 祖先组件的 onErrorCaptured | 全站遥测配置 |
| 未处理错误统一上报 | app.config.errorHandler | 每个页面的后备界面 |
| 请求失败与重试 | 请求层或业务状态 | 假设所有 Promise 都由 Vue 捕获 |
| 异步组件加载失败 | defineAsyncComponent 的 onError | 组件运行期渲染恢复 |

:::tip
错误边界不是一个特殊内置组件，而是一种组件设计：祖先注册 onErrorCaptured，记录后代错误，并切换到稳定的后备分支。边界放得越近，恢复范围越小。
:::

## 二、先划清 Vue 会接管的错误来源

官方列出的来源包括组件渲染、事件处理器、生命周期钩子、setup、侦听器、自定义指令钩子和 Transition 钩子。它们的共同点不是“发生在 Vue 项目中”，而是由 Vue 调用。浏览器定时器、未返回的 Promise 和第三方回调若脱离这条调用链，仍需在自己的边界中捕获。

| 错误来源 | 进入 Vue 错误链 | 处理建议 |
| --- | --- | --- |
| render / setup / 生命周期 | 是 | 由最近的祖先边界承接 |
| Vue 事件处理器返回的 Promise | 拒绝时进入 | return 或 await Promise |
| 侦听器、指令与过渡钩子 | 是 | 保留可诊断的 info |
| setTimeout 回调 | 否 | 在回调内 try/catch 并交给业务报告器 |
| 事件中启动但未返回的 Promise | 否 | 返回链或在任务内部 catch |

~~~~ts
// Vue 能观察到返回的 Promise
async function saveFromButton() {
  await saveDraft()
}

// Promise 被主动丢弃，拒绝不会沿组件错误链传播
function detachSave() {
  void saveDraft()
}
~~~~

## 三、onErrorCaptured 只捕获后代组件

onErrorCaptured 注册在祖先组件上，接收 error、触发错误的后代公开实例和 info。它不会捕获注册它的同一个组件自身在 setup 或 render 中抛出的错误；要保护一个区域，必须把边界放在该区域外层。

~~~~vue
<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const failed = ref(false)

onErrorCaptured((error, instance, info) => {
  failed.value = true
  reportComponentError(error, instance, info)
  return false
})
</script>

<template>
  <StableFallback v-if="failed" />
  <RiskyPanel v-else />
</template>
~~~~

:::warning
钩子里可以切换错误状态，但后备分支不能继续渲染刚刚失败的内容。否则下一次更新会再次抛错，形成错误与重渲染循环。
:::

## 四、传播顺序由内到外，只有 false 会停止

同一个错误遇到多个 errorCaptured 钩子时，Vue 按组件链从最靠近错误的祖先向根部依次调用。钩子返回 false 表示该错误已经处理：后续祖先钩子和 app.config.errorHandler 都不会再收到它。返回 true、undefined 或不写 return 都会继续传播。

:::steps
### 后代在 Vue 调用中抛错

Vue 保留出错实例和来源类型，把错误交给其 parent，而不是当前出错组件。

### 最近祖先先处理

内层边界可记录错误并切换局部后备界面。

### 根据返回值决定传播

严格等于 false 才停止；其余返回值会让外层边界继续收到同一个错误。

### 未停止时到达应用处理器

app.config.errorHandler 统一上报仍未由局部边界截断的错误。
:::

~~~~ts
onErrorCaptured((error, instance, info) => {
  showLocalFallback(error)
  reportOwnedError(error, instance, info)
  return false // 本边界同时拥有界面与上报，避免外层重复处理
})
~~~~

:::warning
如果 errorCaptured 钩子本身再次抛错，原错误和钩子的新错误都会发送给 app.config.errorHandler。错误处理代码应保持短小、同步且不依赖脆弱的界面状态。
:::

## 五、后备界面与恢复动作必须显式设计

捕获错误不会把失败组件恢复到可信状态。常见做法是让边界卸载失败子树，提供重试或返回操作；用户重试时递增 key，重新挂载一个全新子树。若错误来自确定性输入或代码缺陷，盲目原地重试只会再次失败，应先改变输入或离开该功能。

~~~~vue
<template>
  <ErrorFallback v-if="failed" @retry="resetBoundary" />
  <RiskyPanel v-else :key="recoveryVersion" />
</template>
~~~~

| 恢复动作 | 适合场景 | 恢复前条件 |
| --- | --- | --- |
| 重新挂载局部子树 | 临时状态损坏或瞬时依赖失败 | 清除错误状态并更换 key |
| 返回稳定页面 | 输入持续导致渲染失败 | 保留可理解的离开入口 |
| 重试业务请求 | 服务器或网络失败 | 请求层有幂等与取消策略 |
| 整页刷新 | 应用状态整体不可恢复 | 作为最后手段而非默认方案 |

## 六、应用级处理器负责统一上报

app.config.errorHandler 在应用实例挂载前配置，用于把未截断的组件错误发送到日志或监控服务。它接收 error、来源组件实例和 info，但不位于页面组件树中，不适合直接控制某个局部区域的后备界面。

~~~~ts
const app = createApp(App)

app.config.errorHandler = (error, instance, info) => {
  telemetry.capture(error, {
    component: instance?.$options.name ?? 'AnonymousComponent',
    vueInfo: info,
  })
}

app.mount('#app')
~~~~

:::tip
开发环境中的 info 是可读来源字符串，生产环境中会缩短为错误代码和文档链接。监控系统应保留原值并按官方错误码表解析，不能依赖某段英文文案永远不变。
:::

## 七、开发、生产与 SSR 的证据边界

warnHandler 只处理 Vue 运行时警告，且生产构建会忽略它；异常仍应进入错误处理链。Vue 3.5 起可用 throwUnhandledErrorInProduction 决定末端未处理错误是否在生产环境抛出，但局部返回 false 或应用处理器已经消费的错误不会被它重新抛出。

:::warning
onErrorCaptured 也会参与 SSR 的组件错误链，但 HTTP 状态、服务端输出、日志关联和恢复方式属于服务端请求管线。本课的 Vite SPA Demo 只能证明客户端捕获、传播与重新挂载，不能外推 SSR 或 hydration 行为。
:::

## 八、Suspense fallback 不是错误界面

Suspense 只有 default 与 fallback，没有 error 插槽。异步 setup 或可挂起组件拒绝时，错误仍沿组件错误链传播；等待界面由 Suspense 负责，失败界面应由它外层的错误边界负责。

~~~~vue
<ErrorBoundary>
  <Suspense>
    <AsyncReport />
    <template #fallback>正在准备报表...</template>
  </Suspense>
</ErrorBoundary>
~~~~

## 九、异步组件加载错误是另一份协议

defineAsyncComponent 的 onError 只处理 loader Promise 的失败，并提供 error、retry、fail 和 attempts 来决定是否再次加载组件定义。组件定义加载成功后，组件在 setup、render 或事件中发生的错误仍走 onErrorCaptured 与应用级处理器。

~~~~ts
const AsyncReport = defineAsyncComponent({
  loader: () => import('./ReportPanel.vue'),
  onError(error, retry, fail, attempts) {
    if (attempts <= 2 && isTransientLoadError(error)) retry()
    else fail()
  },
})
~~~~

## 十、易错使用提示

:::pitfalls
### 在出错组件内部捕获自己的 render 错误

**触发条件：** 在出错组件内部捕获自己的 render 错误

**原因：** onErrorCaptured 只接收后代组件传播的错误，不保护注册钩子的当前组件。

**后果：** 钩子没有机会运行，预期的局部后备界面不会出现。

**错误示例：**

~~~~ts
onErrorCaptured(() => { failed.value = true })
throw new Error('当前组件渲染失败')
~~~~

**正确写法：**

~~~~vue
<ErrorBoundary>
  <RiskyPanel />
</ErrorBoundary>
~~~~

**验证方式：** 对照正确写法验证结果。

### 捕获后仍渲染同一个失败分支

**触发条件：** 捕获后仍渲染同一个失败分支

**原因：** 错误状态触发边界更新时，失败子树若仍存在，就可能在下一次 render 再次抛错。

**后果：** 组件进入重复报错和重渲染循环，后备界面也无法稳定展示。

**错误示例：**

~~~~vue
<ErrorBanner v-if="failed" />
<RiskyPanel />
~~~~

**正确写法：**

~~~~vue
<ErrorBanner v-if="failed" />
<RiskyPanel v-else />
~~~~

**验证方式：** 对照正确写法验证结果。

### 返回值与上报 owner 没有一起设计

**触发条件：** 返回值与上报 owner 没有一起设计

**原因：** Vue 只在同步返回严格的 false 时停止传播；这也会阻止应用级处理器收到原错误。

**后果：** 继续传播时出现重复记录，错误截断时又可能形成监控静默缺口。

**错误示例：**

~~~~ts
onErrorCaptured(() => true)
~~~~

**正确写法：**

~~~~ts
onErrorCaptured((error, instance, info) => {
  report(error, instance, info)
  return false
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 让捕获钩子异步返回 false 或再次抛错

**触发条件：** 让捕获钩子异步返回 false 或再次抛错

**原因：** 传播在当前调用栈中同步完成，Promise 最终解析为 false 已经太晚；重新 throw 还会产生第二条钩子错误。

**后果：** 原错误继续到达外层，钩子错误也进入错误链，监控出现两条不同记录。

**错误示例：**

~~~~ts
onErrorCaptured(async () => false)
~~~~

**正确写法：**

~~~~ts
onErrorCaptured(() => {
  failed.value = true
  return false
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待脱离调用链的 Promise 被边界捕获

**触发条件：** 期待脱离调用链的 Promise 被边界捕获

**原因：** Vue 只能为事件处理器实际返回的 Promise 连接拒绝处理。

**后果：** 错误成为未处理的 Promise rejection，组件边界日志保持为空。

**错误示例：**

~~~~ts
function save() {
  void persistDraft()
}
~~~~

**正确写法：**

~~~~ts
async function save() {
  await persistDraft()
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 Suspense fallback 或不存在的 error 插槽当作错误边界

**触发条件：** 把 Suspense fallback 或不存在的 error 插槽当作错误边界

**原因：** Suspense 只协调等待状态，异步拒绝仍沿组件错误链传播。

**后果：** 失败不会进入预想的插槽，等待态与失败态也被混为一个状态。

**错误示例：**

~~~~vue
<Suspense><AsyncPanel /><template #error>加载失败</template></Suspense>
~~~~

**正确写法：**

~~~~vue
<ErrorBoundary>
  <Suspense><AsyncPanel /></Suspense>
</ErrorBoundary>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把异步组件 onError 当作运行期边界

**触发条件：** 把异步组件 onError 当作运行期边界

**原因：** 该回调只参与 loader 的 retry / fail 协议，不捕获已加载组件的 render 或事件错误。

**后果：** 组件成功加载后发生错误，预想的重试回调完全不会运行。

**错误示例：**

~~~~ts
defineAsyncComponent({ loader: () => import('./Panel.vue'), onError: retry })
~~~~

**正确写法：**

~~~~vue
<ErrorBoundary>
  <AsyncPanel />
</ErrorBoundary>
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 warnHandler 或开发控制台代替生产错误策略

**触发条件：** 用 warnHandler 或开发控制台代替生产错误策略

**原因：** warning 与 exception 是两条通道，生产构建也不会运行 warnHandler。

**后果：** 线上警告过滤器不生效，末端错误是否抛出和是否被监控都没有可靠契约。

**错误示例：**

~~~~ts
app.config.warnHandler = reportError
~~~~

**正确写法：**

~~~~ts
app.config.errorHandler = reportError
app.config.throwUnhandledErrorInProduction = true
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十一、从源码推导适用场景

:::steps
### 边界必须位于 parent 链上

handleError 从出错实例的 parent 开始查找 errorCapturedHooks，因此可按页面、功能区或高风险组件划分恢复范围。

### 返回 false 可建立单一 owner

内层边界若同时负责用户反馈与遥测，可在完成上报后截断传播，避免外层重复弹窗或重复计数。

### 返回 Promise 才能连接异步拒绝

callWithAsyncErrorHandling 检查 Vue 调用结果是否为 Promise，再为它连接 catch；封装事件时应保留返回链。

### 错误来源随链路一起保留

错误处理器同时收到出错实例与 info，监控事件可保留组件名、路由和业务操作，但不能读取私有实例字段。

### 重新挂载是清晰的恢复边界

错误链不保存事务快照；用 key 替换失败子树，可让局部 setup 和响应式状态从明确起点重新建立。
:::

:::warning
parent、ec 和内部错误类型编号只用于理解实现，均不是业务代码可依赖的公开接口。生产代码应只使用 onErrorCaptured、app.config.errorHandler、组件 key 和自己的业务状态。
:::

## 十二、在嵌套错误边界实验台验证传播

唯一 Demo 把失败组件放在内外两层边界中。默认由内层返回 false，只显示内层后备界面；关闭“内层停止传播”后，同一个错误按内层、外层顺序记录，外层返回 false，避免污染学习站点的全局错误处理器。重新挂载会创建全新子树。

:::demo{id="vue.core.learn.advanced.error-handling.error-boundary-lab-demo" playground="true"}
比较渲染错误与返回的异步事件错误，并观察内外边界的传播与恢复
:::

## 十三、练习与回顾

:::exercise
### 为页面划分错误 owner

**要求：**

~~~~text
一个页面包含支付表单、推荐列表和聊天侧栏。分别决定哪些区域需要独立边界、何时返回 false，以及应用级处理器保留什么信息。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
三个业务区域应按可独立恢复的范围建立边界。能稳定展示后备界面并完成上报的内层边界可返回 false；其余继续传播。应用级处理器保留 error、组件来源、info、路由和业务操作标识。
~~~~
:::

:::exercise
### 判断两种异步写法是否可捕获

**要求：**

~~~~text
比较事件处理器直接 return saveDraft() 与在处理器中执行 void saveDraft()。说明 Promise 拒绝的去向，并修复脱离链路的写法。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
直接返回的 Promise 会由 Vue 连接拒绝处理并进入组件错误链；void 写法返回 undefined，拒绝已脱离。可改为 return、await，或在异步任务内部显式 catch 和上报。
~~~~
:::
