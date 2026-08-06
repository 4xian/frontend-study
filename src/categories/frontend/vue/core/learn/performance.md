---
id: vue.core.learn.advanced.performance
type: lesson
title: 性能优化
summary: 先测量真实瓶颈，再用稳定输入、计算缓存与选择性跳过减少渲染和更新成本
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.advanced.plugins
  - vue.core.learn.advanced.render-functions-vnodes
  - vue.core.learn.basics.computed-properties
  - vue.core.learn.basics.conditional-list-rendering
tags:
  - 性能优化
  - 稳定 props
  - computed
  - v-once
  - v-memo
  - 渲染更新
  - 性能测量
  - 大型列表
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-02
sources:
  - title: Vue 中文性能优化指南
    url: https://cn.vuejs.org/guide/best-practices/performance
  - title: Vue 中文计算属性指南
    url: https://cn.vuejs.org/guide/essentials/computed
  - title: Vue 中文内置指令 API
    url: https://cn.vuejs.org/api/built-in-directives.html
  - title: Vue 中文渲染机制
    url: https://cn.vuejs.org/guide/extras/rendering-mechanism
  - title: Vue 性能指南官方 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/guide/best-practices/performance.md
  - title: Vue 内置指令官方 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/api/built-in-directives.md
  - title: Vue 3.5.40 componentRenderUtils.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts
  - title: Vue 3.5.40 组件更新判断官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentRenderUtils.spec.ts
  - title: Vue 3.5.40 computed.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts
  - title: Vue 3.5.40 effect.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts
  - title: Vue 3.5.40 computed 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/computed.spec.ts
  - title: Vue 3.5.40 vMemo 编译转换
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vMemo.ts
  - title: Vue 3.5.40 withMemo 运行时与官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/withMemo.spec.ts
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - vue.core.learn.advanced.plugins
objectives:
  - 区分加载性能与更新性能，并为当前问题选择对应的测量工具
  - 解释模板编译器已经提供的静态缓存、更新标记与树结构优化
  - 把宽而频繁变化的子组件输入改为更稳定的语义 props
  - 识别对象、数组与函数 prop 的无意义新身份造成的额外更新
  - 用 computed 缓存依赖稳定的派生，并说明它与方法调用的差异
  - 保持 computed 输出语义与引用稳定，避免无变化结果触发下游工作
  - 根据子树变化契约选择普通渲染、v-once 或 v-memo
  - 为大型 v-for 列表写出完整 memo 依赖，并验证没有陈旧界面
recap:
  - 先区分加载性能与更新性能，并用对应工具建立优化前证据
  - 模板编译器已经缓存静态内容并标记动态绑定，清晰模板是默认起点
  - 子组件只接收直接消费的稳定语义 props，可以显著缩小列表更新集合
  - 对象、数组和普通函数 prop 的新身份也会触发更新，应只在语义变化时创建
  - computed 按响应式依赖缓存，方法会在每次相关模板重渲染时执行
  - computed 输出保持 primitive 或旧对象身份稳定，可以避免无语义变化的下游工作
  - v-once 只用于永久不变子树，v-memo 只用于已测量的大型动态子树或列表
  - memo 依赖必须完整且与 v-for、key 位于同一元素，优化后仍要验证界面正确性
---

# 性能优化

## 正文大纲

上一课完成应用级插件安装，本课回到用户可感知的运行结果。性能优化不是给每个组件加缓存，而是先定位加载或更新瓶颈，再用 Vue 已有的编译与响应式能力缩小工作范围。我们将用稳定 props、computed 缓存和谨慎的 v-memo 建立一条可验证路径。

## 先区分加载性能与更新性能

加载性能回答页面多久可用，受网络往返、资源体积、缓存和渲染方式影响；更新性能回答交互后多久完成反馈，受 JavaScript 长任务、组件更新、DOM 变更与布局绘制影响。两类问题可以同时存在，但证据和解决手段不同，不能用一个开发环境数字代替全部体验。

| 问题 | 优先证据 | 本课处理 |
| --- | --- | --- |
| 首次进入慢 | PageSpeed Insights、WebPageTest、生产产物分析 | 只建立分类，不改构建 |
| 交互后卡顿 | Chrome Performance、Vue DevTools profiler | 定位更新次数与热点子树 |
| 组件为何更新 | Vue DevTools、onRenderTriggered 调试钩子 | 检查 props 与响应式依赖 |
| 优化是否有效 | 同一路径优化前后生产测量 | 先用确定性更新次数验证机制 |

:::warning
本课 Demo 的更新次数是机制证据，不是毫秒基准。真实收益取决于列表规模、子树复杂度、设备与生产构建，必须在目标应用的同一路径上重新测量。
:::

## 先测量，再决定优化层级

先录制一次真实慢路径，标记用户动作和完成条件，再判断主要时间落在网络、脚本、Vue 组件更新还是浏览器布局绘制。若热点只是偶发小组件更新，额外缓存可能比工作本身更难维护；若上千行列表在每次选择变化时重建大量 VNode，稳定 props 或 v-memo 才有清晰收益空间。

:::steps
### 固定用户路径

记录入口状态、触发动作与完成信号，避免每次测量走不同流程。

### 定位主要成本

用浏览器与 Vue profiler 区分网络、JavaScript、组件更新、布局和绘制。

### 只改一个关键变量

先调整 props 形状或派生缓存，再用同一路径验证更新集合和耗时变化。

### 保留正确性断言

优化后同时验证界面内容与交互，不能用更快但陈旧的 DOM 换取数字下降。
:::

## 先利用模板已有的编译优化

Vue 同时控制模板编译器与运行时。编译器能缓存静态内容、标记元素上真正动态的绑定，并把稳定树结构交给运行时走更短的更新路径。因此清晰模板通常已经是高效默认值，不应仅凭“手写更底层”就把普通模板改成渲染函数或手工 DOM。

~~~~vue
<template>
  <article>
    <h3>课程进度</h3>
    <p :class="{ complete: completed }">{{ completedLabel }}</p>
  </article>
</template>
~~~~

标题是静态内容，段落只含 class 与文本动态绑定；模板编译器可以保留这些信息。业务优化首先应调整数据流和组件边界，而不是读取或伪造 patch flag。

## 稳定 props 缩小子组件更新集合

子组件至少一个 prop 改变时才需要更新。若列表每一行都接收全局 selectedId，选择变化会改变每一行的输入；父级先计算 active 布尔值后，大多数行的 active 保持 false，只有旧选中项和新选中项发生语义变化。

~~~~vue
<!-- 宽输入：selectedId 变化时每一行都收到新值。 -->
<CourseRow
  v-for="item in courses"
  :key="item.id"
  :id="item.id"
  :selected-id="selectedId"
/>

<!-- 稳定输入：大多数行的 active 始终为 false。 -->
<CourseRow
  v-for="item in courses"
  :key="item.id"
  :id="item.id"
  :active="item.id === selectedId"
/>
~~~~

:::tip
稳定 props 不是让值永远不变，而是让每个子组件只接收它直接消费的语义。旧选中项与新选中项确实改变，仍应正常更新。
:::

## 对象、数组与函数也需要稳定身份

组件 props 默认比较的是值身份，不会深度证明两个新对象内容相同。模板中每次构造对象或数组、或把普通回调函数作为 prop 每次重新创建，都会扩大更新集合。把对象建立在 computed 中，或把真正静态的值提升为模块常量，让身份只在语义依赖变化时改变。

~~~~ts
const locale = ref('zh-CN')

/** 只在 locale 改变时生成新的面板配置身份。 */
const panelOptions = computed(() => ({
  dense: true,
  locale: locale.value,
}))
~~~~

~~~~vue
<!-- 不在每次父级渲染时创建对象字面量。 -->
<ResultPanel :options="panelOptions" />
~~~~

已在 emits 中声明的组件事件监听器与普通函数 prop 不应混为一谈。事件表达的是子组件向父级报告意图；只有子组件确实把函数当数据或策略消费时，才把函数作为普通 prop，并管理其身份。

## 用 computed 缓存依赖稳定的派生

computed 首次读取时执行 getter，并自动追踪本次读取的响应式依赖。依赖不变时，无论父组件因其他状态重渲染多少次，重复访问都会返回缓存结果；方法调用则会在每次渲染时重新执行。昂贵过滤、排序或汇总只要是纯派生，就优先建模为 computed。

~~~~ts
const courses = ref<Course[]>([])
const query = ref('')

/** 按课程列表与查询词缓存可见课程。 */
const visibleCourses = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase()
  return courses.value.filter((course) => course.title.toLocaleLowerCase().includes(keyword))
})
~~~~

:::warning
computed 只追踪响应式依赖。Date.now()、普通模块变量或没有被读取的状态不会让缓存失效；需要刷新时，把刷新条件显式建模为响应式输入。
:::

## 保持 computed 输出语义稳定

Vue 3.4 及更高版本只在 computed 结果相对旧值发生变化时触发下游副作用。返回 boolean、number 或 string 时通常自然获得稳定结果；若 getter 每次创建新对象，新旧引用始终不同，即使字段语义相同也无法跳过下游工作。

~~~~ts
const count = ref(0)

// 下游只关心奇偶语义，直接返回 primitive。
const isEven = computed(() => count.value % 2 === 0)
~~~~

确实需要对象结果时，computed getter 可以接收旧值。应先完整读取依赖并计算新结果，再比较业务语义；若没有变化就返回旧对象。不能为了复用引用而提前退出，否则本轮未读取的依赖会从依赖集合中消失。

~~~~ts
interface CountSummary {
  isEven: boolean
}

/** 在奇偶语义不变时复用旧的汇总对象。 */
const summary = computed<CountSummary>((oldValue) => {
  const nextIsEven = count.value % 2 === 0
  if (oldValue?.isEven === nextIsEven) return oldValue
  return { isEven: nextIsEven }
})
~~~~

## 按变化契约选择普通渲染、v-once 与 v-memo

| 工具 | 更新契约 | 适用边界 |
| --- | --- | --- |
| 普通模板 | 依赖变化时正常更新 | 默认选择，先依赖编译器与稳定 props |
| v-once | 首次渲染后整个子树永不更新 | 运行时读取但生命周期内永久不变的内容 |
| v-memo | memo 数组逐项相同时复用整个子树 | 已测量的大型子树或海量列表边际优化 |

~~~~vue
<!-- 生命周期内永久不变。 -->
<p v-once>构建版本：{{ buildVersion }}</p>

<!-- title 与 selected 任一变化都必须更新。 -->
<article v-memo="[title, selected]">
  <h3>{{ title }}</h3>
  <p>{{ selected ? '已选择' : '未选择' }}</p>
</article>
~~~~

memo 数组必须固定长度并覆盖子树全部动态语义。数组为空等同于 v-once；漏列依赖不会产生警告，而是直接让界面停留在旧值，所以正确性验证比更新次数下降更重要。

## 大型列表中的 v-memo 与响应式边界

官方把长度超过 1000 的大型 v-for 列表列为 v-memo 最典型的场景。v-for、\:key 与 v-memo 必须位于同一元素；key 确定列表项身份，memo 数组决定该身份本轮是否需要更新。小列表通常先用稳定 props 就足够。

~~~~vue
<article
  v-for="item in courses"
  :key="item.id"
  v-memo="[item.id === selectedId, item.title]"
>
  <h3>{{ item.title }}</h3>
  <p>{{ item.id === selectedId ? '已选择' : '未选择' }}</p>
</article>
~~~~

另一个独立热点是超大不可变数据的深层响应式访问。性能指南允许用 shallowRef() 或 shallowReactive() 让嵌套值保持原样，并通过替换根值触发更新；这会改变更新契约，不应与 v-memo 混成一个技巧。本课只建立选择原则，完整身份与原始对象风险留给后续专题。

## 从 Vue 3.5.40 源码解释可观察结果

:::steps
### 动态 props 快路径只比较编译器列出的字段

componentRenderUtils.ts 在优化模式且 patch flag 含 PROPS 时遍历 dynamicProps。稳定 primitive prop 能缩小更新范围，但业务代码不应手工伪造 patch flag。

### 完整 props 路径逐项比较值身份

没有快路径时先处理同一 props 引用、空值与 key 数量，再比较每个值。新对象 prop 即使字段相同也会被视作变化。

### 已声明 emit listener 不按普通 prop 变化处理

hasPropsChanged() 结合 emits options 忽略对应事件监听器。组件事件与作为数据传入的普通函数 prop 因此有不同更新边界。

### computed 读取先追踪消费者再同步刷新

ComputedRefImpl.value 登记订阅、调用 refreshComputed() 并同步依赖版本，形成 lazy 缓存和链式派生；业务代码不应读取内部 dep 或 globalVersion。

### computed 结果使用 Object.is 语义判断变化

固定实现通过共享 hasChanged() 比较新旧值。稳定 primitive 可避免下游触发，新对象引用则不同，NaN 与自身按相同值处理。

### 编译器把 v-memo 子树包装为 withMemo()

vMemo transform 生成依赖表达式、子树渲染函数、&#95;cache 与缓存槽索引，非组件子树还会转为 block，因此命中时能跳过 VNode 创建。

### 运行时浅比较 memo 数组并保存快照

isMemoSame() 先比长度，再逐项使用 hasChanged()。命中返回缓存 VNode，未命中重新渲染并保存 memo.slice()；对象依赖不会深比较。

### 官方测试同时证明跳过能力与陈旧风险

withMemo 官方集成测试覆盖元素、组件、v-for 与 NaN，并断言非 memo 依赖变化时 DOM 保持旧值。漏列依赖会真实冻结界面。
:::

:::warning
patch flag、组件内部实例、renderCache、VNode.memo、cacheIndex、内部 version 与 block tree 都只是 Vue 3.5.40 的实现证据。业务代码只能观察公开更新结果，不能读取或改写这些内部字段。
:::

## 易错使用提示

:::pitfalls
### 让所有列表项接收全局选中 ID

**触发条件：** 让所有列表项接收全局选中 ID

**原因：** 每个子组件都收到频繁变化的 selectedId，即使自身选中语义没有变化。

**后果：** 一次选择变化扩大到整列组件更新，大型列表中会制造无关渲染工作。

**错误示例：**

~~~~vue
<CourseRow
  v-for="item in courses"
  :key="item.id"
  :selected-id="selectedId"
/>
~~~~

**正确写法：**

~~~~vue
<CourseRow
  v-for="item in courses"
  :key="item.id"
  :active="item.id === selectedId"
/>
~~~~

**验证方式：** 对照正确写法验证结果。

### 在模板中每次创建新的对象 prop

**触发条件：** 在模板中每次创建新的对象 prop

**原因：** 父组件每次渲染都产生新对象身份，深层字段相同也无法保持 prop 稳定。

**后果：** 子组件被视为收到变化输入，额外执行渲染与更新钩子。

**错误示例：**

~~~~vue
<ResultPanel :options="{ dense: true, locale }" />
~~~~

**正确写法：**

~~~~vue
<ResultPanel :options="panelOptions" />
~~~~

**验证方式：** 对照正确写法验证结果。

### 用方法重复执行依赖未变的昂贵派生

**触发条件：** 用方法重复执行依赖未变的昂贵派生

**原因：** 方法会在任意父级重渲染时再次过滤完整列表。

**后果：** 无关状态变化也重复执行相同计算，并可能在模板多处访问时成倍增加。

**错误示例：**

~~~~vue
<p>{{ filterVisibleCourses(courses).length }}</p>
~~~~

**正确写法：**

~~~~vue
<p>{{ visibleCourses.length }}</p>
~~~~

**验证方式：** 对照正确写法验证结果。

### computed 每次返回语义相同的新对象

**触发条件：** computed 每次返回语义相同的新对象

**原因：** getter 为相同业务结果创建新的引用。

**后果：** 下游观察者和组件无法利用计算属性稳定性跳过工作。

**错误示例：**

~~~~ts
const summary = computed(() => ({
  isEven: count.value % 2 === 0,
}))
~~~~

**正确写法：**

~~~~ts
const isEven = computed(() => count.value % 2 === 0)
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 v-once 冻结仍需变化的状态

**触发条件：** 用 v-once 冻结仍需变化的状态

**原因：** 计数在首次渲染后仍会改变，却把整个显示子树标记为只渲染一次。

**后果：** 响应式状态已经更新，用户仍看到首次渲染的陈旧值。

**错误示例：**

~~~~vue
<p v-once>计数：{{ count }}</p>
~~~~

**正确写法：**

~~~~vue
<p v-once>构建版本：{{ buildVersion }}</p>
~~~~

**验证方式：** 对照正确写法验证结果。

### v-memo 漏列子树动态依赖

**触发条件：** v-memo 漏列子树动态依赖

**原因：** memo 只包含 selected，却遗漏同一子树显示的 title。

**后果：** title 改变而 selected 不变时，整个子树被复用并显示旧标题。

**错误示例：**

~~~~vue
<article v-memo="[selected]">{{ title }}</article>
~~~~

**正确写法：**

~~~~vue
<article v-memo="[selected, title]">{{ title }}</article>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 v-memo 放到 v-for 内部子元素

**触发条件：** 把 v-memo 放到 v-for 内部子元素

**原因：** memo 没有与循环和列表身份放在同一元素。

**后果：** 写法不符合公开约束，无法按列表项身份应用预期的更新跳过。

**错误示例：**

~~~~vue
<article v-for="item in courses" :key="item.id">
  <div v-memo="[item.selected]">{{ item.title }}</div>
</article>
~~~~

**正确写法：**

~~~~vue
<article
  v-for="item in courses"
  :key="item.id"
  v-memo="[item.selected]"
>
  {{ item.title }}
</article>
~~~~

**验证方式：** 对照正确写法验证结果。

### 未测量就给小组件普遍添加 v-memo

**触发条件：** 未测量就给小组件普遍添加 v-memo

**原因：** 普通状态徽标已经能靠稳定 prop 使用默认更新判断，却额外维护 memo 依赖。

**后果：** 代码复杂度和陈旧界面风险增加，实际收益可能小于比较与维护成本。

**错误示例：**

~~~~vue
<StatusBadge v-memo="[status]" :status="status" />
~~~~

**正确写法：**

~~~~vue
<StatusBadge :status="status" />
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 动手验证：稳定输入，减少无关更新

:::demo{id="vue.core.learn.advanced.performance.performance-rendering-lab-demo" playground="true"}
比较宽 props 与稳定 props 在选择变化时的子组件更新次数，并验证父级无关刷新不会使 computed 重新求值
:::

:::exercise
### 收窄课程列表输入

**要求：**

~~~~text
给定接收 selectedId、query、theme 和完整 settings 的 CourseRow，列出行组件真正需要的语义，并重新设计 props。说明哪些状态应留在父级。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
若行只显示标题、选中状态和主题外观，就传 id、title、active 与必要的 theme token；selectedId 的比较和 query 过滤留在父级，未被行消费的 settings 不传。这样 query 或其他配置变化不会自动扩大到全部行更新。
~~~~
:::

:::exercise
### 审查大型列表的 memo 依赖

**要求：**

~~~~text
一个列表项显示 title、selected 和 progress，却只写 v-memo="[selected]"。修正依赖，并说明何时应删除 v-memo。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
依赖至少包含 title、selected 与 progress，且 v-for、key、v-memo 位于同一元素。如果 profiler 没有证明列表 VNode 创建或 diff 是热点，或列表规模很小，应删除 v-memo，保留稳定 props 与普通模板以降低陈旧 UI 风险。
~~~~
:::
