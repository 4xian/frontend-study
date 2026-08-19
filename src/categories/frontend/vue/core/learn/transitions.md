---
id: vue.core.learn.intermediate.transitions
type: lesson
title: 过渡效果
summary: 用稳定节点身份组织进入、离开和列表移动，并为 reduced motion 完整降级
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.intermediate.provide-inject
  - vue.core.learn.basics.conditional-list-rendering
  - vue.core.learn.intermediate.lifecycle-update-timing
  - vue.core.reference.built-ins.transition
tags:
  - Transition
  - TransitionGroup
  - CSS transition
  - 节点身份
  - 列表过渡
  - reduced motion
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-31
sources:
  - title: Vue 中文 Transition 指南
    url: https://cn.vuejs.org/guide/built-ins/transition.html
  - title: Vue English Transition Guide
    url: https://vuejs.org/guide/built-ins/transition.html
  - title: Vue 中文 TransitionGroup 指南
    url: https://cn.vuejs.org/guide/built-ins/transition-group.html
  - title: Vue English TransitionGroup Guide
    url: https://vuejs.org/guide/built-ins/transition-group.html
  - title: Vue 内置组件 API：Transition / TransitionGroup
    url: https://cn.vuejs.org/api/built-in-components.html#transition
  - title: Vue 3.5.40 BaseTransition.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts
  - title: Vue 3.5.40 Transition.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts
  - title: Vue 3.5.40 TransitionGroup.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/TransitionGroup.ts
stage: intermediate
level: intermediate
estimatedMinutes: 55
prerequisites:
  - vue.core.learn.intermediate.provide-inject
objectives:
  - 判断一次界面变化是节点进入或离开、身份替换，还是同一节点原地更新
  - 用 v-if、v-show 或稳定 key 触发符合业务意图的 Transition
  - 解释六个 CSS 过渡类在进入和离开时间线中的职责
  - 根据互斥视图的交接需求选择默认、out-in 或 in-out 模式
  - 用 appear、type、duration 或 JavaScript done 明确开始与结束边界
  - 用 TransitionGroup、稳定业务 key 与 move class 处理列表变化
  - 从 Vue 3.5.40 源码解释两帧切类、延迟移除、取消回调和 FLIP
  - 优先过渡 opacity 与 transform，并为 reduced motion 提供功能完整的静态降级
  - 通过最终 DOM 和语义状态验证过渡，不依赖固定等待或临时类名
  - 通过唯一 Demo 验证 presence、keyed identity、out-in 与列表移动的共同身份模型
recap:
  - Transition 协调一个节点的进入与离开，业务状态在动画开始前就已经改变。
  - v-if、v-show、动态组件和 key 变化可以触发过渡；同节点文本 patch 不会触发 leave / enter。
  - enter-from、enter-active、enter-to 与对应三类 leave 类组成两条时间线。
  - 稳定 key 表达 VNode 身份，mode 只安排不同身份节点的交接顺序。
  - appear 控制初次进入，type、duration 与 JavaScript done 用于明确结束边界。
  - TransitionGroup 依赖稳定业务 key，并用 move class 与 FLIP 处理列表位置变化。
  - opacity 与 transform 通常是更合适的视觉属性，reduced motion 下应移除位移和可感知时长。
  - 自动化应等待最终 DOM、语义状态和列表顺序，不依赖固定 sleep 或临时过渡类。
---

# 过渡效果

## 一、正文大纲

前面的课程已经能让页面状态正确变化。本课继续解决反馈问题：用户怎样看出一个节点正在出现、一个互斥状态已经交给另一个状态，以及列表顺序刚刚发生了什么。业务状态始终是事实来源，Transition 只协调状态变化的视觉过程；移除过渡后，功能仍应正确。

| 部分 | 核心问题 | 完成标志 |
| --- | --- | --- |
| presence | 节点是否存在 | 用 v-if 或 v-show 表达显示意图 |
| identity | 旧状态与新状态是否是同一节点 | 用稳定 key 表达真正的身份替换 |
| timeline | 进入和离开的样式何时生效 | 能解释六个 CSS 类 |
| coordination | 互斥视图如何交接 | 按需求选择 mode |
| collection | 列表项如何插入、移除和移动 | 稳定 key 配合 TransitionGroup |
| verification | 怎样可靠测试并照顾减弱动态效果 | 断言最终状态并完整降级 |

:::tip
本课限定 Vue 3.5.40、SFC 和 CSS 过渡。动态组件与 KeepAlive 的生命周期和缓存属于下一课；完整 props 签名回到关联的 Transition Reference，本课不重复 API 清单。
:::

## 二、页面状态正确后，过渡负责解释变化

过渡不应拥有打开、选中或排序等业务状态。事件处理函数先修改真实状态，Vue 再根据新旧 VNode 决定插入、移除或替换哪些节点，Transition 最后给这个过程增加视觉反馈。这样即使 CSS 没有加载、用户要求减弱动态效果，或自动化直接等待最终 DOM，页面仍然可用。

| 状态变化 | VNode 结果 | Transition 能否协调 |
| --- | --- | --- |
| v-if 从 false 变 true | 插入条件节点 | 进入 |
| v-if 从 true 变 false | 离开完成后移除节点 | 离开 |
| v-show 切换 | 同一节点改变 display | 进入与离开 |
| 同标签节点改变稳定 key | 旧身份替换为新身份 | 旧节点离开、新节点进入 |
| 只修改同一节点文字或属性 | 原地 patch | 不会自动产生 leave / enter |

## 三、先用 v-if 理解节点进入与离开

一个 Transition 接受一个非注释元素或组件子节点。v-if 为 false 时，Vue 不会立刻把正在离开的节点从 DOM 删除，而是等待离开过程完成后调用真实 remove；再次显示则为新插入的节点执行进入过程。按钮只切换 visible，不等待动画，也不把动画完成写回业务状态。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(true)

/** 切换通知节点的存在状态。 */
function toggleNotice(): void {
  visible.value = !visible.value
}
</script>

<template>
  <button type="button" @click="toggleNotice">
    {{ visible ? '隐藏通知' : '显示通知' }}
  </button>
  <Transition name="notice">
    <p v-if="visible">资料已保存</p>
  </Transition>
</template>
~~~~

:::warning
Transition 不是通用多节点容器。多个同级列表项由 TransitionGroup 管理；若只是同一节点的普通文本更新，也不应为了播放动画随意制造随机 key。
:::

## 四、沿两条时间线理解六个 CSS 类

name 决定类名前缀。name="notice" 时，Vue 在进入前添加 notice-enter-from 与 notice-enter-active，浏览器提交起点后切到 notice-enter-to；离开时则从 notice-leave-from 走到 notice-leave-to。active 类覆盖整个阶段，通常负责声明 transition 或 animation。

| 时间线 | 起点类 | 阶段类 | 终点类 |
| --- | --- | --- | --- |
| 进入 | notice-enter-from | notice-enter-active | notice-enter-to |
| 离开 | notice-leave-from | notice-leave-active | notice-leave-to |

~~~~text
进入：插入节点 → enter-from + enter-active → enter-to + enter-active → 清理类
离开：leave-from + leave-active → leave-to + leave-active → 清理类并移除节点
~~~~

## 五、用 name 编写最小 CSS 过渡

最小实现只需要在 active 类声明时长和缓动，再为 enter-from 与 leave-to 写共同的不可见状态。浏览器默认样式就是进入终点和离开起点，因此不必重复声明 opacity: 1。优先选择 opacity 与 transform，它们通常不会引起文档流重新布局。

~~~~css
.notice-enter-active,
.notice-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
~~~~

:::tip
视觉时长不是业务时钟。不要在 180ms 后才更新状态，也不要让其他逻辑依赖某个临时类仍然存在；需要知道过渡完成时，使用 Vue 提供的钩子。
:::

## 六、文本 patch 与 key 身份替换是两种变化

同一个 p 的文本从“摘要”改成“详情”时，Vue 会原地 patch 文本，没有旧节点可离开。只有业务确实要表现两个互斥状态的交接时，才给它们稳定且不同的 key。key 应来自状态身份，不应使用 Date.now、随机数或整段可变文案。

:::compare{before="同一节点原地更新" after="稳定身份发生替换"}
### 同一节点原地更新

~~~~text
<Transition name="view">
  <p>{{ activeView.label }}</p>
</Transition>
~~~~

### 稳定身份发生替换

~~~~text
<Transition name="view" mode="out-in">
  <p :key="activeView.id">{{ activeView.label }}</p>
</Transition>
~~~~
:::

| key 设计 | 结果 | 是否推荐 |
| --- | --- | --- |
| summary / details | 同一业务状态始终拥有同一身份 | 推荐 |
| 完整 label 文案 | 文案微调也会被误判为新身份 | 不推荐 |
| Date.now() / Math.random() | 每次渲染都强制替换 | 禁止 |

## 七、用 mode 安排互斥视图的交接

默认模式允许旧节点离开与新节点进入同时发生。out-in 先完成旧节点离开，再插入新节点，适合摘要与详情这类不能同时出现的视图；in-out 先让新节点进入，再延迟旧节点离开，适合优先维持内容连续且允许短时重叠的场景。mode 只有在旧、新 VNode 身份不同时才会介入。

~~~~vue
<Transition name="view" mode="out-in">
  <section :key="activeView">
    {{ activeView === 'summary' ? '摘要视图' : '详细视图' }}
  </section>
</Transition>
~~~~

| 模式 | 执行顺序 | 常见取舍 |
| --- | --- | --- |
| 默认 | 旧节点离开与新节点进入并行 | 最快，但可能同时占据布局 |
| out-in | 旧节点离开 → 新节点进入 | 避免互斥内容重叠，中间可能短暂留空 |
| in-out | 新节点进入 → 旧节点离开 | 内容连续，但要求布局容纳短时重叠 |

## 八、明确初次、持续挂载与结束边界

默认初次挂载不播放进入过程，只有显式 appear 才复用进入类或 appear 钩子。v-show 适合需要保留 DOM 与本地状态的节点，它切换 display 而不是卸载组件。两者都不会改变业务状态的所有权。

| 需求 | 选择 | 必须理解的边界 |
| --- | --- | --- |
| 首屏也执行进入 | appear | 核心内容不能依赖动画完成才可访问 |
| 隐藏后保留 DOM 状态 | v-show | 仍是同一节点，不发生组件卸载 |
| 同时有 transition 和 animation | type | 明确 Vue 等待哪一类结束事件 |
| 内层有 delay | duration | 显式覆盖 delay 与 duration 的完整总时长 |
| 完全由 JavaScript 动画 | \:css="false" + done | 异步 hook 必须主动通知完成 |

~~~~vue
<Transition
  name="panel"
  type="animation"
  :duration="{ enter: 550, leave: 350 }"
  appear
>
  <Panel v-if="open" />
</Transition>
~~~~

~~~~ts
/** 执行纯 JavaScript 离开动画，并把结束边界交回 Vue。 */
function leave(element: Element, done: () => void): void {
  animationLibrary.animate(element, { onComplete: done })
}
~~~~

:::warning
使用纯 JavaScript 动画时设置 \:css="false"。否则 Vue 仍会检测 CSS 结束事件，形成两套结束边界；快速反向切换还必须允许取消或幂等完成。
:::

## 九、从单节点迁移到 TransitionGroup

TransitionGroup 协调多个列表项的插入、移除和位置移动。每一项都必须使用唯一且稳定的业务 key，让 Vue 能把更新前后的同一项对应起来。Vue 3 默认渲染 Fragment，需要 ol、ul 或 div 等语义容器时显式传 tag；进入和离开类加在列表项上，而不是容器上。

~~~~vue
<TransitionGroup name="topic" tag="ol">
  <li v-for="topic in topics" :key="topic.id">
    {{ topic.label }}
  </li>
</TransitionGroup>
~~~~

~~~~css
.topic-enter-active,
.topic-leave-active,
.topic-move {
  transition: opacity 180ms ease, transform 180ms ease;
}

.topic-enter-from,
.topic-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
~~~~

重排时，runtime 记录更新前后每一项的位置，用反向 transform 暂时抵消位移，再让 move class 过渡回新位置。move class 必须包含 transform transition；若没有，Vue 会跳过移动动画，但最终 DOM 顺序仍然正确。TransitionGroup 不支持整体 mode。

## 十、易错使用提示

:::pitfalls
### 把 Transition 当成多个同级节点的动画容器

**触发条件：** 把 Transition 当成多个同级节点的动画容器

**原因：** Transition 只协调一个非注释元素或组件。列表或多个同级项需要由 TransitionGroup 管理。

**后果：** 开发环境出现单子节点警告，列表项的进入、离开和移动也没有正确所有者。

**错误示例：**

~~~~vue
<Transition name="topic">
  <li v-for="topic in topics" :key="topic.id">{{ topic.label }}</li>
</Transition>
~~~~

**正确写法：**

~~~~vue
<TransitionGroup name="topic" tag="ul">
  <li v-for="topic in topics" :key="topic.id">{{ topic.label }}</li>
</TransitionGroup>
~~~~

**验证方式：** 对照正确写法验证结果。

### 只更新同一节点文字，却期待一次 leave / enter

**触发条件：** 只更新同一节点文字，却期待一次 leave / enter

**原因：** 同一 type 和 key 的 VNode 会原地 patch。确实需要两个状态交接时，应给它们稳定且不同的身份。

**后果：** CSS 类从未出现，mode 也没有旧、新节点可供排序。

**错误示例：**

~~~~vue
<Transition name="status">
  <p>{{ status.label }}</p>
</Transition>
~~~~

**正确写法：**

~~~~vue
<Transition name="status" mode="out-in">
  <p :key="status.id">{{ status.label }}</p>
</Transition>
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 TransitionGroup 中使用下标或变化中的值作 key

**触发条件：** 在 TransitionGroup 中使用下标或变化中的值作 key

**原因：** FLIP 需要知道更新前后的哪个 VNode 是同一业务项。下标会随排序漂移，随机 key 则让每次渲染都变成全量替换。

**后果：** DOM 被错误复用或全部重建，项目内容、焦点和移动轨迹无法对应。

**错误示例：**

~~~~vue
<li v-for="(topic, index) in topics" :key="index">{{ topic.label }}</li>
~~~~

**正确写法：**

~~~~vue
<li v-for="topic in topics" :key="topic.id">{{ topic.label }}</li>
~~~~

**验证方式：** 对照正确写法验证结果。

### 给 TransitionGroup 设置 mode 或假定它总会生成 div

**触发条件：** 给 TransitionGroup 设置 mode 或假定它总会生成 div

**原因：** TransitionGroupProps 不含 mode，Vue 3 的默认容器是 Fragment。需要实际容器时必须显式传 tag。

**后果：** 互斥调度不会生效，依赖默认 div 的选择器、语义和布局也会失效。

**错误示例：**

~~~~vue
<TransitionGroup name="topic" mode="out-in">
  <article v-for="topic in topics" :key="topic.id">{{ topic.label }}</article>
</TransitionGroup>
~~~~

**正确写法：**

~~~~vue
<TransitionGroup name="topic" tag="ul">
  <li v-for="topic in topics" :key="topic.id">{{ topic.label }}</li>
</TransitionGroup>
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为初次渲染会自动执行 enter

**触发条件：** 认为初次渲染会自动执行 enter

**原因：** 默认 Transition 只处理组件挂载后的进入。首屏确实需要出现效果时才显式使用 appear。

**后果：** 首屏动画没有运行，或核心内容被错误设计成必须等待动画才可访问。

**错误示例：**

~~~~vue
<Transition name="hero">
  <section>首次加载也会自动淡入</section>
</Transition>
~~~~

**正确写法：**

~~~~vue
<Transition name="hero" appear>
  <section>显式启用首次进入</section>
</Transition>
~~~~

**验证方式：** 对照正确写法验证结果。

### 同一元素同时使用 transition 和 animation，却不指定 type

**触发条件：** 同一元素同时使用 transition 和 animation，却不指定 type

**原因：** 两类 CSS 效果同时存在时，Vue 自动检测到的结束事件可能不是业务希望等待的那一个。

**后果：** 类名被过早或过晚清理，后续替换和移除时机与视觉过程脱节。

**错误示例：**

~~~~vue
<Transition name="panel">
  <Panel v-if="open" />
</Transition>
~~~~

**正确写法：**

~~~~vue
<Transition name="panel" type="animation">
  <Panel v-if="open" />
</Transition>
~~~~

**验证方式：** 对照正确写法验证结果。

### 内层有 delay，却让 Vue 猜整段嵌套过渡时长

**触发条件：** 内层有 delay，却让 Vue 猜整段嵌套过渡时长

**原因：** Vue 根据直接过渡元素检测结束，不理解所有后代效果共同组成的业务时间线。嵌套延迟应显式声明总时长。

**后果：** 外层过渡提前结束，离开节点在内层动画完成前就被移除。

**错误示例：**

~~~~vue
<Transition name="nested">
  <section v-if="open"><PanelContent /></section>
</Transition>
~~~~

**正确写法：**

~~~~vue
<Transition name="nested" :duration="{ enter: 550, leave: 350 }">
  <section v-if="open"><PanelContent /></section>
</Transition>
~~~~

**验证方式：** 对照正确写法验证结果。

### 关闭 CSS 检测后，不在异步 JavaScript hook 调用 done

**触发条件：** 关闭 CSS 检测后，不在异步 JavaScript hook 调用 done

**原因：** \:css="false" 后 Vue 不再等待 CSS。异步 enter 或 leave hook 必须接收并在真正结束时调用 done。

**后果：** runtime 把 hook 当作同步完成，离开节点可能立即移除，或动画状态无法正确收尾。

**错误示例：**

~~~~ts
/** 启动离开动画，但没有把完成状态交回 Vue。 */
function animateLeave(element: Element): void {
  animationLibrary.animate(element)
}
~~~~

**正确写法：**

~~~~ts
/** 启动离开动画，并在完成后通知 Vue。 */
function animateLeave(element: Element, done: () => void): void {
  animationLibrary.animate(element, { onComplete: done })
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十一、从源码推导过渡的实际边界

Vue 3.5.40 把职责分成两层：runtime-core 的 BaseTransition 组织 VNode 的进入、离开、延迟移除和取消状态；runtime-dom 的 Transition 把 name、六个 CSS 类、duration 与浏览器结束事件翻译成这些 hooks。因此业务状态、VNode 调度和 DOM 动画是三条不同边界。

:::steps
### 两帧切类建立可过渡的样式差

runtime-dom 连续使用 requestAnimationFrame，让浏览器提交 from 状态后再切到 to；这解释机制，但不构成可以写死为 32ms 的测试时钟。

### 离开完成后才执行真实移除

BaseTransition 把 remove 交给完成回调，视觉离开不会改变业务状态已经切换的事实。

### 快速反向会取消上一条过渡

新 enter 会取消未完成的 leave，反向亦然；回调只完成一次，所以频繁点击是合法输入，最终状态应收敛到最后意图。

### mode 只调度不同 VNode 身份

out-in 与 in-out 都先比较 type 和 key，没有身份变化就不会把普通属性 patch 拆成两段动画。

### TransitionGroup 用 FLIP 计算位移

runtime 记录旧、新矩形并写反向 translate，再由 move class 过渡到最终位置；稳定业务 key 是前后匹配的前提。
:::

:::warning
不要用 waitForTimeout、固定毫秒或临时 enter-from 类验证功能。帧率、后台标签页、不同浏览器和 reduced motion 都会改变墙钟时间；稳定契约是最终 DOM、可访问名称和业务状态。
:::

## 十二、高级使用场景

| 场景 | 推荐设计 | 需要守住的边界 |
| --- | --- | --- |
| 临时通知与空态 | v-if 配合 Transition | 离开后节点移除，状态先于动画成立 |
| 持续挂载面板 | v-show 配合 Transition | 隐藏不等于卸载，组件本地状态保留 |
| 互斥步骤或状态视图 | 稳定 key 配合 out-in | mode 不负责数据加载或状态缓存 |
| 可排序列表 | 业务 ID、TransitionGroup 与 move class | 断言最终顺序，不依赖中间 transform |
| 可复用视觉契约 | 封装过渡组件并透传 slot | 视觉组件不隐藏业务状态 |
| 第三方动画库 | \:css="false"、done 与取消处理 | 完成回调幂等，快速反向仍能收敛 |
| 减弱动态效果 | 移除位移与可感知时长 | 显示、替换、排序和键盘操作保持完整 |

## 十三、在过渡身份实验台验证共同模型

唯一 Demo 把三类变化放在同一实验台：通知使用 v-if 表达存在，摘要与详情使用稳定 key 和 out-in 表达身份交接，列表使用业务 ID 和 TransitionGroup 表达重排。永久汇总文本提供独立于动画的结果反馈。

:::demo{id="vue.core.learn.intermediate.transitions.transition-state-lab-demo" playground="true"}
验证 presence、keyed identity、out-in 与稳定业务 key 列表重排
:::

## 十四、用最终状态验证并完整降级动态效果

依次隐藏并显示通知、切换到详细视图、轮换列表两次，再重置实验。验证时等待通知节点真正移除或出现，读取 keyed 节点的 data-view，并直接断言列表最终顺序。快速连续切换通知两次，结果仍应与最后一次点击一致。

- [ ] 通知状态文字与通知节点是否存在保持一致
- [ ] 视图文字、data-view 与切换按钮命令保持一致
- [ ] 一次轮换为 Gamma、Alpha、Beta，两次为 Beta、Gamma、Alpha
- [ ] 重置后通知、摘要视图和初始列表顺序全部恢复
- [ ] reduced motion 下移除位移和时长，所有业务断言保持不变
- [ ] 390px 与 200% 文本下没有横向滚动、截断或控制重叠

## 十五、练习

:::exercise
### 修复不触发的状态切换

**要求：**

~~~~text
给定一个只渲染 <p>{{ status.label }}</p> 的 Transition，让 ready 与 failed 之间使用 out-in 交接，但同一状态的文案更新仍原地 patch。key 不能使用 Date.now() 或整段 label。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
给 p 设置 :key="status.id"，其中 id 只取 ready 或 failed。这样业务身份改变时替换 VNode，同一身份内的 label 更新仍然原地 patch。
~~~~
:::

:::exercise
### 修复错误的列表身份

**要求：**

~~~~text
把使用 index 作为 key 的可排序课程列表改成业务 course.id，并补上包含 transform transition 的 move class。说明自动化应该验证什么。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
TransitionGroup 中使用 :key="course.id"，在 course-move 声明 transform transition。自动化断言重排后的最终 DOM 顺序，不读取中间内联 transform，也不等待固定毫秒。
~~~~
:::

:::exercise
### 实现功能完整的 reduced motion

**要求：**

~~~~text
为带 opacity 与 translateY 的通知过渡增加 prefers-reduced-motion: reduce，并验证通知仍能隐藏、显示和通过键盘操作。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
在 reduce 媒体查询中把 enter-active 和 leave-active 的 transition 设为 none，并让 from/to 的 transform 为 none、opacity 为 1。业务 v-if、状态文本与按钮逻辑不需要分支。
~~~~
:::

## 十六、完成本课后的判断顺序

先判断变化属于 presence、identity 还是 collection，再选择 v-if、v-show、稳定 key 或 TransitionGroup。随后用 name 与六个类建立最小 opacity / transform 效果；只有确有交接需求才增加 mode、type、duration 或 JavaScript hook。最后同时验证正常动态效果与 reduced motion 下的最终 DOM、语义状态和键盘操作。

:::tip
下一课将进入“动态组件与 KeepAlive”，学习组件类型切换、缓存与激活停用。本课只预告这个触发来源，不提前展开其生命周期，也不把尚未开放的课程加入 related。
:::
