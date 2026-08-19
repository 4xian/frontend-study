---
id: vue.core.learn.intermediate.dynamic-components-keep-alive
type: lesson
title: 动态组件与 KeepAlive
summary: 按运行时状态切换组件，并明确实例重建、缓存身份、LRU 淘汰与副作用暂停边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.intermediate.transitions
  - vue.core.learn.basics.component-basics
  - vue.core.learn.intermediate.lifecycle-update-timing
  - vue.core.reference.built-ins.keep-alive
tags:
  - 动态组件
  - component is
  - KeepAlive
  - 组件实例
  - 缓存身份
  - LRU
  - onActivated
  - onDeactivated
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-31
sources:
  - title: Vue 中文组件基础：动态组件
    url: https://cn.vuejs.org/guide/essentials/component-basics.html#dynamic-components
  - title: "Vue English Component Basics: Dynamic Components"
    url: https://vuejs.org/guide/essentials/component-basics.html#dynamic-components
  - title: Vue 中文 KeepAlive 指南
    url: https://cn.vuejs.org/guide/built-ins/keep-alive.html
  - title: Vue 内置组件 API：KeepAlive
    url: https://cn.vuejs.org/api/built-in-components.html#keepalive
  - title: Vue 组合式 API：onActivated / onDeactivated
    url: https://cn.vuejs.org/api/composition-api-lifecycle.html#onactivated
  - title: Vue 3.5.40 KeepAlive.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts
  - title: Vue 3.5.40 resolveAssets.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts
  - title: Vue 3.5.40 vnode.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts
stage: intermediate
level: intermediate
estimatedMinutes: 60
prerequisites:
  - vue.core.learn.intermediate.transitions
objectives:
  - 用 component 的 is attribute 在多个组件类型之间切换
  - 解释默认切换为何卸载旧实例并重置组件局部状态
  - 先判断状态应该重建、缓存还是提升到组件外，再决定是否使用 KeepAlive
  - 用 KeepAlive 保留非活跃组件实例，并理解它只接受一个活动组件子节点
  - 区分组件类型、VNode key 与组件 name 在缓存中的不同职责
  - 用 include、exclude 和 max 控制缓存范围与上限
  - 用 onActivated 和 onDeactivated 暂停、恢复与可见性相关的外部活动
  - 按 Transition、KeepAlive、component 的顺序组合视觉交接与实例缓存
  - 从 Vue 3.5.40 源码解释缓存键、隐藏容器、命中复用与 LRU 淘汰
  - 通过唯一 Demo 验证状态复用、缓存淘汰和生命周期顺序
recap:
  - component :is 让当前位置按运行时值选择组件类型，SFC 中优先使用显式组件对象映射。
  - 动态组件默认切换会卸载旧实例，再次显示时局部状态从初始值开始。
  - KeepAlive 保存的是组件实例与 DOM 子树，不是持久化业务数据。
  - KeepAlive 任一时刻只接受一个活动组件子节点，非活动缓存实例处于停用状态。
  - 没有显式 key 时组件类型是缓存键；稳定 key 可区分同一类型的多个业务实例。
  - include 与 exclude 匹配组件 name，max 超限时按 LRU 淘汰并卸载实例。
  - onActivated 覆盖首次挂载和缓存恢复，onDeactivated 覆盖停用和最终卸载。
  - Transition 放在 KeepAlive 外层负责视觉交接，reduced motion 不能改变缓存业务终态。
  - 组件对象应避免深层响应式代理，外部字符串应先经过受控白名单映射。
  - 缓存测试应观察实例、局部状态和最终生命周期，不依赖 KeepAlive 内部 DOM 或 Map。
---

# 动态组件与 KeepAlive

## 一、正文大纲

组件基础课程解决了怎样拆分界面，上一课解决了不同 VNode 身份怎样交接。本课继续处理运行时组件类型：同一位置可以显示编辑器、预览或设置面板；默认切换会销毁旧实例，KeepAlive 则把选定实例暂存起来。先确定状态所有权，再选择重建或缓存。

| 部分 | 核心问题 | 完成标志 |
| --- | --- | --- |
| 动态类型 | 当前位置应该渲染哪个组件 | 用显式组件映射生成 is 值 |
| 默认生命周期 | 切走后旧实例发生什么 | 知道局部状态会随卸载重置 |
| 缓存策略 | 哪些实例值得暂时保留 | 区分可重建 UI 与持久业务数据 |
| 缓存身份 | 缓存怎样区分实例 | 正确使用组件类型、稳定 key 与 name |
| 容量与活动 | 缓存满了或组件不可见时怎么办 | 理解 LRU，并暂停外部副作用 |
| 验证 | 怎样证明复用与淘汰 | 观察局部状态和最终生命周期结果 |

:::tip
本课聚焦普通动态组件和 KeepAlive。完整 props 签名回到关联 Reference；路由视图缓存属于 Vue Router 课程，Teleport 和 Suspense 仍是后续独立知识点。
:::

## 二、用 component \:is 表达运行时组件类型

特殊的 component 元素本身不产生固定业务界面，is 的当前值决定实际 VNode 类型。is 可以接收组件对象、已注册组件名字符串或原生标签名。SFC 中优先建立受控组件对象映射：状态只保存稳定业务 ID，computed 再从映射取出组件对象。这样候选集合清楚，类型也能约束非法值。

~~~~vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import EditorPanel from './EditorPanel.vue'
import PreviewPanel from './PreviewPanel.vue'
import SettingsPanel from './SettingsPanel.vue'

const panels = {
  editor: EditorPanel,
  preview: PreviewPanel,
  settings: SettingsPanel,
} as const

const activePanel = ref<keyof typeof panels>('editor')
const activeComponent = computed(() => panels[activePanel.value])
</script>

<template>
  <component :is="activeComponent" />
</template>
~~~~

:::warning
不要直接把查询参数、接口字段或用户输入交给 is。未解析为已注册组件的字符串会继续作为字符串类型处理；显式白名单映射同时给出允许集合和可靠的组件对象。
:::

## 三、先用 type 与 key 确定实例身份

组件 type 决定当前位置使用哪份组件实现，VNode key 在同一 type 下区分不同业务身份。type 或 key 改变时，Vue 会创建新组件实例，实例内部的局部状态也从初始值开始；两者都稳定时，Vue 才能把前后 VNode 视为同一身份继续更新。

| 身份 | 由谁提供 | 用于什么 |
| --- | --- | --- |
| 组件 type | 导入的组件对象 | 决定实际组件实现 |
| VNode key | 父级模板的稳定业务 ID | 区分同一 type 的多个业务身份 |
| 组件实例 | Vue 根据 type 与 key 创建 | 持有 ref、输入值等局部状态 |

~~~~vue
<component :is="activeTab.component" :key="activeTab.id" />
~~~~

## 四、默认切换意味着卸载旧实例

activeComponent 从 EditorPanel 变为 PreviewPanel 时，当前位置的 VNode 类型改变。默认流程卸载旧组件并挂载新组件；再次回到 EditorPanel 会创建新实例，因此 input、ref、未提升的表单草稿等局部状态恢复初始值。这通常正是筛选结果、一次性确认面板等界面需要的行为。

:::compare{before="默认重建" after="缓存实例"}
### 默认重建

~~~~text
<component :is="activeComponent" />
~~~~

### 缓存实例

~~~~text
<KeepAlive>
  <component :is="activeComponent" />
</KeepAlive>
~~~~
:::

| 状态需求 | 推荐位置 | 原因 |
| --- | --- | --- |
| 切回时从初始值开始 | 动态子组件内部 | 默认卸载自然完成重置 |
| 短时间切回继续编辑 | KeepAlive 缓存实例 | 保留局部 UI 状态和 DOM 子树 |
| 刷新、淘汰后仍必须存在 | Pinia、服务端或其他组件外状态 | 缓存不是持久化承诺 |
| 父子切换都要共享 | 共同祖先或明确状态模块 | 状态所有权不应依赖某个缓存实例 |

## 五、只缓存确实需要恢复的活动组件

KeepAlive 在任一时刻接收一个活动组件子节点。切走时，渲染器把已缓存组件的 DOM 子树移动到隐藏容器并把实例标记为停用；切回时再把同一实例移回页面并 patch 新 VNode。局部状态因此保留，但不可见组件仍然存在于组件树中。

~~~~vue
<KeepAlive>
  <component :is="activeComponent" />
</KeepAlive>
~~~~

:::warning
缓存会延长实例、DOM 子树和闭包的寿命。高成本但可恢复的工作区适合缓存；展示结果、短暂弹层或必须每次刷新数据的页面通常更适合默认重建。
:::

## 六、用 include 与 exclude 写清缓存范围

include 和 exclude 支持逗号分隔字符串、正则或数组，并按组件自身的 name 决定是否进入缓存，不匹配标签 ID、路由名或 VNode key。正则和数组是 JavaScript 值，必须使用 v-bind；稳定公共名称可以通过 defineOptions 明确声明。

~~~~vue
<KeepAlive :include="['EditorPanel', 'PreviewPanel']">
  <component :is="activeComponent" :key="activePanel" />
</KeepAlive>
~~~~

## 七、用稳定 key 和 max 控制缓存容量

没有显式 key 时，Vue 3.5.40 使用组件 type 作为缓存键；存在 key 时直接使用该 key。max 限制缓存实例总数，新增实例超过上限时会卸载最久未访问项；命中已有实例会刷新访问顺序，所以这是 LRU，而不是固定删除最早创建的组件。

~~~~vue
<KeepAlive :max="2">
  <component :is="activeComponent" :key="activePanel" />
</KeepAlive>
~~~~

:::steps
### 先访问编辑器

缓存顺序只有 EditorPanel。

### 再访问预览

缓存顺序成为 EditorPanel、PreviewPanel。

### 切回编辑器

命中并刷新访问顺序，PreviewPanel 变成最久未访问项。

### 再打开设置面板

新增 SettingsPanel 超过 max=2，PreviewPanel 被卸载并让出缓存位置。
:::

## 八、可见时恢复，停用时暂停外部活动

缓存组件切走时不执行普通卸载，依赖可见性的轮询、订阅或媒体播放不能只在 onUnmounted 中停止。onActivated 在首次挂载和每次从缓存恢复时调用；onDeactivated 在每次进入缓存以及最终卸载时调用。这两个钩子也会作用到缓存树中的后代组件。

~~~~ts
import { onActivated, onDeactivated } from 'vue'

let stopPolling: (() => void) | undefined

/** 在组件可见时确保只存在一个轮询任务。 */
function startPolling(): void {
  stopPolling ??= createPollingTask()
}

/** 在组件停用或最终卸载时结束轮询任务。 */
function pausePolling(): void {
  stopPolling?.()
  stopPolling = undefined
}

onActivated(startPolling)
onDeactivated(pausePolling)
~~~~

## 九、让 Transition 负责交接，让 KeepAlive 负责实例

动态组件可以沿用上一课的视觉交接，但两种内置组件职责不同。Transition 放在外层，协调活动面板根节点的进入和离开；KeepAlive 放在内层，只决定非活动实例是否缓存。reduced motion 只取消 opacity 与 transform 动画，不能改变当前组件、局部状态或缓存结果。

~~~~vue
<Transition name="panel" mode="out-in">
  <KeepAlive :max="2">
    <component :is="activeComponent" :key="activePanelId" />
  </KeepAlive>
</Transition>
~~~~

## 十、易错使用提示

:::pitfalls
### 把动态表达式写成静态 is 字符串

**触发条件：** 把动态表达式写成静态 is 字符串

**原因：** 没有冒号的 is 是静态 attribute，panels[activePanelId] 不会被求值，而会被当成字面字符串名称。

**后果：** 出现无法解析的组件或元素，按钮更新状态后实际渲染类型仍不会正确切换。

**错误示例：**

~~~~vue
<component is="panels[activePanelId]" />
~~~~

**正确写法：**

~~~~vue
<component :is="panels[activePanelId]" />
~~~~

**验证方式：** 对照正确写法验证结果。

### 没有 KeepAlive 却期待切回后局部状态还在

**触发条件：** 没有 KeepAlive 却期待切回后局部状态还在

**原因：** 动态组件默认替换会卸载旧实例。input、ref 和组件内部草稿都属于该实例，不会自动跨卸载保存。

**后果：** 用户切换标签后输入内容和局部选择恢复初始值。

**错误示例：**

~~~~vue
<component :is="activeComponent" />
~~~~

**正确写法：**

~~~~vue
<KeepAlive>
  <component :is="activeComponent" />
</KeepAlive>
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 KeepAlive 中同时放多个活动直接子组件

**触发条件：** 在 KeepAlive 中同时放多个活动直接子组件

**原因：** KeepAlive 不是同时展示多个面板的布局容器，任一时刻只能有一个活动组件实例作为直接子节点。

**后果：** 开发环境出现单组件子节点警告，并放弃预期的缓存路径。

**错误示例：**

~~~~vue
<KeepAlive>
  <EditorPanel />
  <PreviewPanel />
</KeepAlive>
~~~~

**正确写法：**

~~~~vue
<KeepAlive>
  <component :is="activeComponent" />
</KeepAlive>
~~~~

**验证方式：** 对照正确写法验证结果。

### 用标签 ID 或路由名配置 include

**触发条件：** 用标签 ID 或路由名配置 include

**原因：** include 和 exclude 匹配被缓存组件自己的 name，不匹配 activePanel、route name、URL 或父模板标签。

**后果：** 目标组件没有进入缓存，或本应排除的组件仍然保留实例。

**错误示例：**

~~~~vue
<KeepAlive include="editor">
  <component :is="EditorPanel" />
</KeepAlive>
~~~~

**正确写法：**

~~~~vue
<KeepAlive include="EditorPanel">
  <component :is="EditorPanel" />
</KeepAlive>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把正则写成未绑定的普通字符串

**触发条件：** 把正则写成未绑定的普通字符串

**原因：** include="/Panel$/" 传入的是普通字符串，不是 RegExp；正则和数组必须通过 v-bind 传入 JavaScript 值。

**后果：** 过滤规则无法匹配 EditorPanel 等名称，组件切回时意外重建。

**错误示例：**

~~~~vue
<KeepAlive include="/Panel$/">
  <component :is="activeComponent" />
</KeepAlive>
~~~~

**正确写法：**

~~~~vue
<KeepAlive :include="/Panel$/">
  <component :is="activeComponent" />
</KeepAlive>
~~~~

**验证方式：** 对照正确写法验证结果。

### 给缓存子组件使用持续变化的 key

**触发条件：** 给缓存子组件使用持续变化的 key

**原因：** 显式 key 会直接成为缓存键；时间戳或随机数会在每次渲染制造新身份，而不是命中现有实例。

**后果：** 局部状态频繁重置，缓存不断新增并更快淘汰其他有效实例。

**错误示例：**

~~~~vue
<KeepAlive :max="10">
  <component :is="activeComponent" :key="Date.now()" />
</KeepAlive>
~~~~

**正确写法：**

~~~~vue
<KeepAlive :max="10">
  <component :is="activeComponent" :key="activePanelId" />
</KeepAlive>
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 max 会永久保留所有访问历史

**触发条件：** 认为 max 会永久保留所有访问历史

**原因：** max 是缓存容量，不是展示数量。超过上限时，最久未访问实例会被淘汰并执行最终卸载。

**后果：** 返回较早面板时得到新实例，局部状态和滚动位置恢复初始值。

**错误示例：**

~~~~vue
<KeepAlive :max="2">
  <component :is="activeDocument" :key="documentId" />
</KeepAlive>
~~~~

**正确写法：**

~~~~vue
<KeepAlive :max="2">
  <component :is="activeDocument" :key="documentId" :draft="drafts[documentId]" />
</KeepAlive>
~~~~

**验证方式：** 对照正确写法验证结果。

### 只用 mounted 与 unmounted 管理可见期资源

**触发条件：** 只用 mounted 与 unmounted 管理可见期资源

**原因：** 缓存组件切走时只是停用，不会立刻卸载；只在 unmounted 停止任务无法覆盖每次不可见期间。

**后果：** 隐藏面板继续请求、播放或订阅，多次切换后产生重复活动和资源浪费。

**错误示例：**

~~~~ts
onMounted(startPolling)
onUnmounted(stopPolling)
~~~~

**正确写法：**

~~~~ts
onActivated(startPolling)
onDeactivated(stopPolling)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十一、从源码推导缓存的实际边界

Vue 3.5.40 先由 resolveDynamicComponent 处理 is：字符串尝试解析已注册组件，解析不到则保留字符串；空值使用特殊占位类型。KeepAlive 再参与渲染器流程，用 Map 保存 VNode 缓存、用 Set 的插入顺序记录访问次序，并把 activate 与 deactivate 注入渲染上下文。

:::steps
### 组件对象保持原始身份

createVNode 检测到响应式组件对象会发出性能警告；普通映射、markRaw 或 shallowRef 可以避免深层代理。

### 缓存键优先使用显式 key

key 为空时回退到组件类型，因此稳定 key 能区分同一类型的不同业务实例。

### 命中缓存时复用实例并刷新顺序

缓存 VNode 的 el 与 component 被写回新 VNode，旧 key 从 Set 删除后重新加入末尾。

### 停用是移动而不是卸载

deactivate 把 VNode 移入隐藏容器；activate 把它移回真实容器后继续 patch。

### 超过 max 时淘汰最久未访问项

Set 的首项就是当前 LRU，pruneCacheEntry 会重置缓存标记并执行正常卸载。
:::

:::warning
不要通过隐藏容器 DOM、shapeFlag 或内部 Map 观察缓存。这些是实现细节；稳定测试应操作公开控件，再断言局部状态和可见生命周期结果。
:::

## 十二、高级使用场景

| 场景 | 推荐设计 | 必须守住的边界 |
| --- | --- | --- |
| 多步骤编辑器 | 缓存当前工作区并把草稿同步到外部状态 | 淘汰或刷新后仍可恢复重要数据 |
| 高成本预览 | 只缓存昂贵且短期会返回的面板 | 数据过期策略不能交给实例寿命 |
| 媒体或轮询面板 | activated 恢复、deactivated 暂停 | 首次挂载和最终卸载也会触发对应钩子 |
| 同类型多文档 | 组件 type 配合稳定 document.id key | 随机 key 会制造无界实例身份 |
| 有限缓存工作区 | 按真实容量设置 max 并允许重建 | LRU 淘汰不是异常路径 |
| 动态面板白名单 | 业务 ID 映射到组件对象 | 外部字符串不能直接决定渲染类型 |

## 十三、在动态缓存实验台验证共同模型

唯一 Demo 提供编辑、预览和设置三个私有 SFC 面板，KeepAlive 的 max 固定为 2。缓存开关用于直接比较保留与默认重建，重置按钮通过稳定 epoch 明确清空实验状态；访问第三个组件则验证最久未访问实例被淘汰。

:::demo{id="vue.core.learn.intermediate.dynamic-components-keep-alive.component-cache-lab-demo" playground="true"}
验证动态组件切换、缓存开关、声明式重置与 max=2 的 LRU 淘汰
:::

## 十四、用实例和最终状态验证缓存

缓存开启时把编辑局部计数加到 1，切到预览再返回编辑：计数应保持。关闭缓存会重建当前面板，之后每次切走再返回都回到 0。重置后再次把编辑加到 1，再依次访问预览、设置和编辑，使编辑成为最久未访问项并被淘汰；返回后计数回到 0。整个流程可以用键盘完成。

- [ ] 三个选择按钮始终只有一个 aria-pressed=true
- [ ] 容量内切回编辑面板时局部计数保持
- [ ] 关闭缓存后当前面板和后续切换都使用新实例
- [ ] 重置后恢复编辑、缓存开启和局部计数 0
- [ ] 访问第三个组件后，最久未访问实例按 LRU 淘汰
- [ ] 被淘汰的编辑面板再次创建后局部计数为 0
- [ ] 390px 与 200% 文本下无横向滚动，按钮高度至少 44px
- [ ] reduced motion 下取消位移和时长，全部功能结果保持不变

## 十五、练习

:::exercise
### 为动态面板建立类型安全映射

**要求：**

~~~~text
把直接使用 route.query.panel 的 component :is 改为 editor、preview 两项白名单，并让未知值回退到 editor。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
定义普通组件对象映射，用 keyof typeof panels 约束内部 ID；读取查询值后先判断是否为映射键，再计算 panels[activeId]。不要把外部字符串直接交给 is。
~~~~
:::

:::exercise
### 设计同类型多文档缓存身份

**要求：**

~~~~text
多个文档都使用 EditorPanel，要求在 max=3 内分别保留局部选择。说明 type、key 和 name 分别取什么。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
type 始终是 EditorPanel，key 使用稳定 document.id，name 是 EditorPanel 并只负责 include 匹配。max 超过 3 后允许最久未访问文档实例重建。
~~~~
:::

:::exercise
### 修复缓存面板中的重复订阅

**要求：**

~~~~text
现有代码在 onMounted 和 onActivated 都调用 subscribe，只在 onUnmounted 清理。改成切走暂停、切回恢复且首次只订阅一次。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
只在 onActivated 调用幂等 startSubscription，在 onDeactivated 调用 stopSubscription 并清空停止句柄。这样覆盖首次挂载、每次恢复、每次停用和最终卸载。
~~~~
:::

## 十六、完成本课后的判断顺序

先用受控组件映射决定运行时 type，再明确切走后局部状态应该重建、短期缓存还是提升到组件外。只有确需恢复实例时才加入 KeepAlive，并继续确定组件 name、稳定 key、include / exclude 与 max。最后用 activated / deactivated 管理可见性副作用，用真实切换序列验证复用和 LRU 淘汰。

:::tip
下一课将单独学习 Teleport，解决渲染逻辑归属与实际 DOM 位置分离的问题。本课不提前把缓存行为扩展到 Teleport、Suspense 或路由视图。
:::
