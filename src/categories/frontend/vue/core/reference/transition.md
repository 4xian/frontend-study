---
id: vue.core.reference.built-ins.transition
type: reference
title: <Transition> / <TransitionGroup>
summary: 为单个元素或组件的进入、离开添加过渡，并用 TransitionGroup 处理带稳定 key 的列表进入、离开与移动
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.built-ins.keep-alive
  - vue.core.reference.built-ins.teleport
  - vue.core.reference.built-ins.suspense
tags:
  - Transition
  - TransitionGroup
  - CSS transition
  - 动画
  - FLIP
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
sources:
  - title: Vue 内置组件 API：Transition
    url: https://cn.vuejs.org/api/built-in-components.html#transition
  - title: Vue Transition 指南
    url: https://cn.vuejs.org/guide/built-ins/transition.html
  - title: Vue Transition 指南原始 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/guide/built-ins/transition.md
  - title: Vue 3.5.40 BaseTransition.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts
  - title: Vue 3.5.40 Transition.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts
group: built-ins
signature: |-
  interface TransitionProps extends BaseTransitionProps<Element> {
    name?: string
    type?: 'transition' | 'animation'
    css?: boolean
    duration?: number | { enter: number; leave: number }
    enterFromClass?: string
    enterActiveClass?: string
    enterToClass?: string
    appearFromClass?: string
    appearActiveClass?: string
    appearToClass?: string
    leaveFromClass?: string
    leaveActiveClass?: string
    leaveToClass?: string
  }

  type TransitionGroupProps = Omit<TransitionProps, 'mode'> & {
    tag?: string
    moveClass?: string
  }
anchors:
  - 概述
  - 类型签名与核心 props
  - 六个过渡类
  - TransitionGroup：列表过渡
  - 易错使用提示
  - 最小源码实现
---

# &lt;Transition&gt; / &lt;TransitionGroup&gt;

## 概述

`<Transition>` 在唯一子元素或组件因 `v-if`、`v-show`、动态组件或特殊 `key` 变化而进入、离开时，按约定时机添加和移除 CSS 类。它不渲染额外 DOM；`name` 决定类名前缀，默认前缀是 `v`。`<TransitionGroup>` 则把同一套进入、离开能力扩展到列表，并额外处理列表项的位置移动。

## 类型签名与核心 props

| prop | 类型 | 作用 |
| --- | --- | --- |
| name | string | 设置 CSS 过渡类前缀 |
| css | boolean | 是否应用并自动检测 CSS 过渡，默认 true |
| type | 'transition' \| 'animation' | 指定用于判断结束的事件类型 |
| duration | number \| { enter; leave } | 显式指定进入、离开的毫秒时长 |
| mode | 'in-out' \| 'out-in' \| 'default' | 控制新旧节点的切换顺序 |
| appear | boolean | 是否让初次渲染也执行进入过渡 |
| enter&#42;Class / leave&#42;Class / appear&#42;Class | string | 逐一覆盖约定类名 |

:::demo{id="vue.core.reference.built-ins.transition.transition-demo" playground="true"}
对比 v-if 的 fade 过渡与 mode="out-in" 的先出后进视图切换
:::

:::tip
`mode="out-in"` 会等待旧节点离开后再插入新节点，适合互斥视图切换。JavaScript 钩子也可以接入动画库；配合 `:css="false"` 时，应由钩子明确通知 Vue 动画已经完成。
:::

## 六个过渡类

进入与离开各有 from、active、to 三个阶段。active 类覆盖整个过渡过程，通常负责声明 `transition` 或 `animation`；from 和 to 类描述两端状态。

| 类名 | 添加时机 | 移除时机 |
| --- | --- | --- |
| v-enter-from | 进入开始前 | 插入后的下一帧 |
| v-enter-active | 进入开始前 | 进入过渡结束 |
| v-enter-to | 插入后的下一帧 | 进入过渡结束 |
| v-leave-from | 离开触发时 | 下一帧 |
| v-leave-active | 离开触发时 | 离开过渡结束 |
| v-leave-to | 离开触发后的下一帧 | 离开过渡结束 |

~~~~css
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
~~~~

## TransitionGroup：列表过渡

`<TransitionGroup>` 可以包含多个子元素，但每个子元素必须有唯一且稳定的 `key`。它没有 `mode` prop，默认渲染为 Fragment，只有传入 `tag` 才生成包裹元素。列表项因插入、删除或重排而改变位置时，Vue 用 FLIP 技术计算位移，并通过 `moveClass`（默认是 `name-move`）触发移动过渡。

~~~~vue
<TransitionGroup tag="ul" name="list">
  <li v-for="item in items" :key="item.id">
    {{ item.text }}
  </li>
</TransitionGroup>

<style>
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-enter-active,
.list-leave-active,
.list-move {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
</style>
~~~~

## 易错使用提示

:::pitfalls
### 在一个 Transition 中放多个并列元素或列表项

**触发条件：** 在一个 Transition 中放多个并列元素或列表项

**原因：** `Transition` 只支持一个元素或组件。多个非注释子节点不会变成一组协调过渡，列表应交给 `TransitionGroup`。

**后果：** 开发环境出现 `can only be used on a single element or component` 警告，列表的插入、删除和移动也不能按预期执行。

**错误示例：**

~~~~vue
<Transition name="fade">
  <p v-for="item in items" :key="item.id">{{ item.label }}</p>
</Transition>
~~~~

**正确写法：**

~~~~vue
<TransitionGroup name="fade" tag="div">
  <p v-for="item in items" :key="item.id">{{ item.label }}</p>
</TransitionGroup>
~~~~

**验证方式：** 对照正确写法验证结果。

### 只更新同一个元素的文本，却期待触发进入和离开

**触发条件：** 只更新同一个元素的文本，却期待触发进入和离开

**原因：** `Transition` 观察节点插入、移除或身份变化。原地更新同一个元素的文本只会 patch 文本节点；改变特殊 `key` 才会让 Vue 把它视为新节点。

**后果：** 文字直接跳到新值，leave 和 enter 类不会组成一次完整切换，相关生命周期钩子也不会按预期触发。

**错误示例：**

~~~~vue
<Transition name="count">
  <span>{{ count }}</span>
</Transition>
~~~~

**正确写法：**

~~~~vue
<Transition name="count">
  <span :key="count">{{ count }}</span>
</Transition>
~~~~

**验证方式：** 对照正确写法验证结果。

### 同时使用 CSS transition 和 animation，却不指定 type

**触发条件：** 同时使用 CSS transition 和 animation，却不指定 type

**原因：** 自动检测会在 `transitionend` 与 `animationend` 之间选择结束事件。两类规则同时存在时，应通过 `type` 明确 Vue 要等待哪一类效果。

**后果：** Vue 可能按非目标效果的时长清理过渡类或移除节点，`after-enter`、`after-leave` 与视觉动画不同步。

**错误示例：**

~~~~vue
<Transition name="panel">
  <Panel v-if="open" />
</Transition>

<style>
.panel-enter-active {
  animation: pop 400ms;
  transition: opacity 150ms;
}
</style>
~~~~

**正确写法：**

~~~~vue
<Transition name="panel" type="animation">
  <Panel v-if="open" />
</Transition>

<style>
.panel-enter-active {
  animation: pop 400ms;
  transition: opacity 150ms;
}
</style>
~~~~

**验证方式：** 对照正确写法验证结果。

### 内层动画有延迟，却让 Vue 自动判断总时长

**触发条件：** 内层动画有延迟，却让 Vue 自动判断总时长

**原因：** 过渡类加在直接子元素上，自动结束判断不能表达内层动画的 delay 与 duration 总和。嵌套过渡应显式传入完整 `duration`。

**后果：** 外层过早清理类，内层动画被截断；离开时节点还可能在后代动画结束前从 DOM 移除。

**错误示例：**

~~~~vue
<Transition name="nested">
  <section v-if="open"><PanelContent /></section>
</Transition>

<style>
.nested-enter-active .panel-content {
  transition: opacity 300ms 250ms;
}
</style>
~~~~

**正确写法：**

~~~~vue
<Transition name="nested" :duration="550">
  <section v-if="open"><PanelContent /></section>
</Transition>

<style>
.nested-enter-active .panel-content {
  transition: opacity 300ms 250ms;
}
</style>
~~~~

**验证方式：** 对照正确写法验证结果。

### 使用 \:css="false" 的异步 JS 动画，却不调用 done

**触发条件：** 使用 \:css="false" 的异步 JS 动画，却不调用 done

**原因：** 关闭 CSS 检测后，Vue 不能自行知道第三方动画何时完成。接收第二个参数的 `enter`、`leave` 钩子必须在动画完成时调用 `done`。

**后果：** 过渡立即结束，离开节点可能在动画库完成前被移除，`after-*` 钩子也会提前执行。

**错误示例：**

~~~~vue
<script setup lang="ts">
/** 启动离开动画。 */
function animateLeave(element: Element) {
  animationLibrary.animate(element)
}
</script>

<template>
  <Transition :css="false" @leave="animateLeave">
    <Panel v-if="open" />
  </Transition>
</template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
/** 启动离开动画，并在完成后通知 Vue。 */
function animateLeave(element: Element, done: () => void) {
  animationLibrary.animate(element, { onComplete: done })
}
</script>

<template>
  <Transition :css="false" @leave="animateLeave">
    <Panel v-if="open" />
  </Transition>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 最小源码实现

`BaseTransition` 负责 vnode 层的进入、离开调度，runtime-dom 的 `resolveTransitionProps()` 则把 DOM 相关 props 翻译成操作 CSS 类的钩子。进入前添加 from 与 active，经过两次 `requestAnimationFrame` 后切换到 to，最后等待结束事件或显式时长并清理类；离开流程对称，真实移除动作会等待 `done()`。

~~~~ts
// 精简自 vuejs/core v3.5.40 Transition.ts 与 BaseTransition.ts
/** 把 DOM 过渡 props 转换为 BaseTransition 使用的钩子。 */
function resolveTransitionProps(rawProps: TransitionProps) {
  const { name = 'v', type, duration, onEnter, onLeave } = rawProps
  const durations = normalizeDuration(duration)
  const enterDuration = durations?.[0]
  const leaveDuration = durations?.[1]
  const enterFromClass = `${name}-enter-from`
  const enterActiveClass = `${name}-enter-active`
  const enterToClass = `${name}-enter-to`
  const leaveFromClass = `${name}-leave-from`
  const leaveActiveClass = `${name}-leave-active`
  const leaveToClass = `${name}-leave-to`

  return {
    /** 在元素插入前设置进入起点。 */
    onBeforeEnter(element: Element) {
      addTransitionClass(element, enterFromClass)
      addTransitionClass(element, enterActiveClass)
    },

    /** 在下一帧切到进入终点，并等待过渡完成。 */
    onEnter(element: Element, done: () => void) {
      const resolve = () => {
        removeTransitionClass(element, enterToClass)
        removeTransitionClass(element, enterActiveClass)
        done()
      }
      callHook(onEnter, [element, resolve])
      nextFrame(() => {
        removeTransitionClass(element, enterFromClass)
        addTransitionClass(element, enterToClass)
        if (!hasExplicitCallback(onEnter)) {
          whenTransitionEnds(element, type, enterDuration, resolve)
        }
      })
    },

    /** 设置离开起点，再把真实移除推迟到结束回调。 */
    onLeave(element: Element, done: () => void) {
      const resolve = () => {
        removeTransitionClass(element, leaveToClass)
        removeTransitionClass(element, leaveActiveClass)
        done()
      }
      addTransitionClass(element, leaveFromClass)
      addTransitionClass(element, leaveActiveClass)
      forceReflow(element)
      nextFrame(() => {
        removeTransitionClass(element, leaveFromClass)
        addTransitionClass(element, leaveToClass)
        if (!hasExplicitCallback(onLeave)) {
          whenTransitionEnds(element, type, leaveDuration, resolve)
        }
      })
      callHook(onLeave, [element, resolve])
    },
  }
}

/** 等待浏览器提交起始样式后再切换到结束样式。 */
function nextFrame(callback: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(callback))
}
~~~~

:::tip
离开动画能完整播放，是因为 `BaseTransition` 把真正的 DOM 移除交给 `done()` 之后执行；from 类必须描述起始状态，是因为下一帧撤掉它时才产生可过渡的样式变化。
:::
