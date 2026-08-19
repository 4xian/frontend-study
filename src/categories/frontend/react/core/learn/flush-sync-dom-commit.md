---
id: react.core.learn.advanced.flush-sync-dom-commit
type: lesson
title: flushSync 同步提交边界
summary: 在外部同步回调确实要求返回前读取最新 DOM 时使用 flushSync，并识别它对批处理、Effect、Suspense 与性能的扩大影响。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 95
prerequisites:
  - react.core.learn.basics.render-commit-and-state-snapshot
  - react.core.learn.advanced.suspense-fallback-boundary
  - react.core.learn.intermediate.use-layout-effect
related:
  - react.core.learn.intermediate.use-effect
  - react.core.learn.advanced.use-transition-pending-action
  - react.core.learn.advanced.form-action-client-submission
tags:
  - React
  - React DOM
  - flushSync
  - commit
  - batching
  - DOM integration
appliesTo: React DOM 19.2.8
verifiedAt: 2026-08-18
objectives:
  - 能判断外部同步回调是否真的要求在返回前读取已提交 DOM。
  - 能准确写出 flushSync 的导入、callback 和返回点 DOM 保证。
  - 能区分已提交 DOM、当前 render 的 State 快照与 browser paint。
  - 能说明 callback 外 pending work、Effect 与 Suspense fallback 的可能影响。
  - 能识别 render、Effect 和 class lifecycle 中的错误调用位置。
  - 能按默认更新、事件边界、单次同步提交和 microtask 逃生舱的顺序选择方案。
recap:
  - flushSync 从 react-dom 导入，只服务于外部系统在同步 callback 返回时立即消费 DOM 的少数场景。
  - flushSync 返回后，callback 内更新所需的 DOM 已提交；当前 handler 的 State 快照仍不会改变。
  - 同步 commit 不等于 browser paint，也不保证只处理 callback 内的更新。
  - React 可能处理 callback 外的 pending work、Effect 及其更新，并可能重新显示 Suspense fallback。
  - render、useLayoutEffect、useEffect 和 class lifecycle 期间不能嵌套同步 flush。
  - microtask 只能解除“React 正在 render”这一位置冲突，不能消除同步工作的性能成本。
  - 普通 React 交互保持默认 batching；flushSync 是最后手段，不是常规状态更新工具。
sources:
  - title: React flushSync Reference
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/flushSync.md
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - callback 参数、同步 DOM 返回点、第三方集成与 beforeprint 用例
      - pending work、Effect、Suspense、性能与 lifecycle caveats
  - title: React Manipulating the DOM with Refs
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/manipulating-the-dom-with-refs.md
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 新节点提交后通过 Ref 执行同步 DOM 操作的正式示例
  - title: React useState Reference
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useState.md
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - setter 只影响后续 render、事件结束后的默认批处理与少数 DOM 提前访问边界
  - title: React DOM 19.2.8 flushSync implementation
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/shared/ReactDOMFlushSync.js
    sourceType: source-code
    appliesTo: React DOM 19.2.8
    claims:
      - callback 返回值转发、同步上下文恢复与 lifecycle 开发警告
  - title: React 19.2.8 flushSync official tests
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactFlushSync-test.js
    sourceType: official-test
    appliesTo: React 19.2.8
    claims:
      - 同步工作与 Transition 的优先关系、同步 render 产生的 Effect 边界
  - title: '@types/react-dom 19.2.4 declarations'
    url: https://unpkg.com/@types/react-dom@19.2.4/index.d.ts
    sourceType: source-code
    appliesTo: '@types/react-dom 19.2.4'
    claims:
      - flushSync 的固定泛型 TypeScript 签名
---

# flushSync 同步提交边界

## 一、学习目标

- 判断一个需求是在等待 State、等待 DOM commit，还是等待 browser paint。
- 只在外部系统同步消费 DOM 的回调中建立最小 `flushSync` 边界。
- 在返回后读取新节点、文本、属性或布局，不读取旧闭包 State 作为新值。
- 识别 callback 外 pending work、Effect、Suspense fallback 与性能风险。
- 把错误的 render 或 Effect 调用移到事件边界，必要时才使用 microtask 兜底。
- 写出符合 React DOM 19.2.8 和 TypeScript 声明的可验证集成代码。

## 二、问题来自外部同步消费者

普通 React 交互不要求 setter 后立刻读取 DOM。事件处理器结束后，React 可以批量处理更新、计算下一版
界面并提交 DOM。组件只需声明下一 State 对应什么 UI。

特殊情况来自 React 之外的消费者：浏览器 API、编辑器、地图、图表或其他 UI 库调用一个 callback，并在
callback 返回时马上读取页面。如果 DOM 还停留在旧版本，外部系统就会拿到旧文本、旧节点或旧尺寸。

```text
外部系统调用 callback
        |
        +--> callback 请求 React 更新
        |
        +--> 外部系统在 callback 返回点立即读取 DOM
```

这个合同没有“等下一轮再读”的空间。`flushSync` 的用途，是让 callback 内的必要 React 更新在返回前
完成 DOM commit。它不是为了让所有 React 更新都更快，也不是为了让代码看起来像同步赋值。

## 三、API 合同

### 1. 从 react-dom 导入

`flushSync` 属于 React DOM，不属于 `react`，也不从 `react-dom/client` 导入：

```tsx
import { flushSync } from 'react-dom'
```

它不是 Hook，可以在满足调用位置要求的事件处理器或外部 callback 中按需调用。公开调用形式始终需要
一个函数参数：

```tsx
flushSync(() => {
  setExpanded(true)
})
```

React 会立即调用 callback，并在 `flushSync` 返回前完成该同步结果所需的 DOM 更新。不要调用
`flushSync()`，也不要传入 `null`、布尔值或其他非函数值。

### 2. 保证的是返回点上的 DOM

下面的测量必须放在 `flushSync` 返回之后：

```tsx
flushSync(() => {
  setExpanded(true)
})

const height = panelRef.current?.getBoundingClientRect().height
```

此时可以依赖新 DOM 已提交，因此 Ref、文本、属性、子节点和几何信息对应这次提交。callback 内 setter
之后立即读取 DOM，仍把“安排更新”和“更新已经提交”混在同一个函数体中，不应作为可读写法。

### 3. 三项不保证

| 不保证 | 原因 | 应怎样处理 |
| --- | --- | --- |
| 当前 State 变量变成新值 | handler 属于创建它的那次 render | 需要下一业务值时保存局部变量或使用 updater |
| 浏览器已经 paint | React commit 与浏览器绘制是两个阶段 | 只陈述 DOM 已提交，不用肉眼帧数证明 |
| 只处理 callback 内一项更新 | React 可能为完成它先处理其他 pending work | callback 保持最小，不依赖隔离或固定顺序 |

## 四、默认更新与同步提交的时间线

### 1. 默认事件更新

```text
点击 handler 开始
  -> setVersion(1)
  -> 同步读取 DOM：仍可能是 version 0
点击 handler 结束
  -> React render
  -> commit version 1
```

默认路径没有错误。只要外部系统不在 handler 返回前强制消费 DOM，React 在事件结束后提交即可。

### 2. 同步外部 callback

```text
外部 callback 开始
  -> flushSync(() => setVersion(1))
       -> React render
       -> commit version 1
  -> flushSync 返回
  -> 同步读取 DOM：version 1
外部 callback 返回
```

同步边界只包住必须立即提交的 State 更新。DOM 读取和外部 API 调用放在返回后的下一行，使代码直接对应
“先提交，再消费”的因果顺序。

### 3. 不要拆成多次 flush

同一外部回调需要一起提交的更新放进一次 callback：

```tsx
flushSync(() => {
  setPrintMode(true)
  setSidebarOpen(false)
})
```

不要为每个 setter 建立一次同步边界。重复同步会制造更多 render/commit 机会，并扩大主线程阻塞。

## 五、正式使用场景

### 1. beforeprint

浏览器的打印流程会在 `beforeprint` callback 返回后使用当前 DOM。官方示例在 Effect 中注册 listener，
但 `flushSync` 的实际调用发生在浏览器稍后触发的事件 callback 中，不发生在 Effect setup 中：

```tsx
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

/** 在打印回调返回前提交打印专用界面。 */
function PrintView() {
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    /** 在浏览器读取打印 DOM 前同步提交打印状态。 */
    function handleBeforePrint() {
      flushSync(() => setIsPrinting(true))
    }

    /** 在打印流程结束后恢复普通界面。 */
    function handleAfterPrint() {
      setIsPrinting(false)
    }

    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [])

  return <article>{isPrinting ? '打印版' : '交互版'}</article>
}
```

不是所有 `window` 事件都需要同步提交。关键条件是外部 API 会在 callback 返回时立即消费这次更新产生的
DOM。

### 2. 新节点后的 DOM 操作

新增列表项后立即滚动到新末项时，默认事件批处理可能让 Ref 仍指向旧列表：

```tsx
/** 新增条目，并在节点提交后交给外部滚动 API。 */
function handleAdd() {
  flushSync(() => {
    setItems((current) => [...current, createItem()])
  })

  listRef.current?.lastElementChild?.scrollIntoView()
}
```

这里的同步需求不是“新增条目必须同步”，而是下一行 `scrollIntoView()` 必须作用于新节点。若没有紧邻的
DOM 消费者，普通 setter 就足够。

### 3. 第三方测量或命令

第三方布局库可能按以下接口工作：

```ts
type SynchronousAdapter = (update: () => void) => DOMRect
```

adapter 调用 `update()` 后马上测量。React 集成层可以在 `update` 中建立一次同步边界，再把已提交节点
交给 adapter。业务组件不应到处直接调用 `flushSync`；同步要求应留在最靠近外部 API 的适配层。

## 六、DOM 更新不改变 State 快照

### 1. handler 变量仍属于旧 render

```tsx
/** 同步提交下一计数，并分别读取 State 快照与 DOM。 */
function handleInspect() {
  const nextCount = count + 1

  flushSync(() => setCount(nextCount))

  console.info(count) // 旧 render 的 count
  console.info(outputRef.current?.textContent) // 已提交的新 DOM
}
```

`flushSync` 可以在 handler 尚未返回时触发下一次 render 和 commit，但 JavaScript 不会改写正在执行的
函数局部绑定。需要新业务值时读取 `nextCount`，需要已提交宿主结果时读取 Ref 指向的 DOM。

### 2. 不要用 DOM 反向保存业务 State

DOM 读取只应服务于外部集成、测量、焦点或滚动等宿主操作。不要提交 DOM 后再解析文本，把它写回业务
State。业务事实仍由 State、Props 或 Store 管理，DOM 是渲染结果。

### 3. commit 不是 paint

返回点保证让 `querySelector`、Ref 和布局 API 看到新 DOM，不证明屏幕已经显示一个独立帧。浏览器可能把
多个 DOM 变化合并到同一次绘制。若需求真正关心动画帧或绘制后的采样，应使用对应浏览器机制并单独验证，
不能把 `flushSync` 当作 paint API。

## 七、callback 外工作与 Effect

### 1. callback 不是隔离容器

React Reference 明确允许 React 在必要时先处理 callback 外的 pending updates。例如点击事件已经安排
一项更新，随后同一个调用链进入 `flushSync`；为了完成同步工作，React 可能先提交那项点击更新。

因此不能依赖以下假设：

- 同步提交只影响当前组件；
- callback 外更新一定留到之后；
- 多个更新会按源码行形成固定 commit 数；
- 每次调用只产生一次 Effect 或一次浏览器帧。

### 2. pending Effect 也可能被处理

`flushSync` 可能运行 pending Effects，并同步应用这些 Effects 中安排的更新。React 19.2.8 的官方测试
还证明，同步 render 新产生的 passive Effect 可以在 `flushSync` 返回前执行。

公开合同使用的是“可能”，不是“每次运行所有 Effect”。不要用某次日志顺序建立业务协议，也不要依赖
Effect 必定推迟到 `flushSync` 返回后。

### 3. callback 必须最小

callback 内只保留必要的 React 更新：

```tsx
flushSync(() => setExpanded(true))
const panel = panelRef.current
if (panel) thirdPartyPanel.measure(panel)
```

网络请求、存储写入、大量计算、日志聚合和第三方命令都不应塞进 callback。它们不会增强 DOM 保证，只会
延长同步关键路径，或者让异常边界更难判断。

## 八、Suspense fallback 边界

### 1. 同步更新可能 suspend

如果同步更新读取尚未就绪的资源，它可能触发 Suspense。React Reference 明确提示：pending boundary
可能重新显示 `fallback`。这意味着原本可见的内容可能在这次同步路径中被 loading UI 替换。

### 2. 不保证保留旧内容

Transition 可以帮助 React 在部分非紧急更新中保留旧内容，但 `flushSync` 表达的是立即完成当前同步
工作。不要同时假设“必须立即提交”和“无论资源是否就绪都绝不显示 fallback”。需求冲突时，应重新拆分
紧急的 DOM 集成状态与可以延后的数据内容。

### 3. 同步边界只包必要状态

打印模式可能需要立即切换 class，但报表数据加载不需要进入同一同步 callback。把同步状态缩到最小，
可以减少 Suspense、Effect 和大子树被带入当前调用栈的概率。

## 九、性能成本

### 1. 同步不等于更快

`flushSync` 把 React 工作放进当前同步关键路径，会打断正常 batching 与并发安排。callback 外 pending
work、Effect 和 fallback 还可能扩大实际工作量。官方因此把它定义为 uncommon、use sparingly 和 last
resort。

### 2. 常见成本来源

- 多次调用造成额外 render 和 commit 机会；
- 大组件树必须在外部 callback 返回前完成必要工作；
- Effect 及其中的更新可能进入当前同步路径；
- suspend 可能重新展示 fallback，并产生额外界面切换；
- 长任务占用主线程，延迟输入、滚动和其他事件。

### 3. 性能判断方式

先用浏览器性能工具记录真实集成 callback 的耗时、React commit 和长任务，再决定是否需要缩小同步树或
重构适配层。不要编造“低于某个毫秒就安全”的固定阈值，也不要用 render 次数单独代替用户可感知成本。

## 十、禁止的调用位置

### 1. render 期间

组件函数正在计算 JSX 时，React 已处于 render。此时调用 `flushSync` 不能嵌套完成另一次同步 flush，
而且在 render 中调用 setter 本身也破坏纯度。

### 2. useLayoutEffect 与 useEffect

两类 Effect 都运行在 React 生命周期中。下面的写法会在开发环境收到 lifecycle 警告：

```tsx
useEffect(() => {
  flushSync(() => setReady(true))
}, [])
```

React 19.2.8 的精确行为是：callback 仍可能执行并安排更新，但调用点不能同步 flush；之后该更新仍可能
完成。因此不要把警告解释成 callback 一定没有执行，也不要用 `try/catch` 捕获 console warning。

### 3. class lifecycle

`componentDidMount`、`componentDidUpdate` 等 class lifecycle 同样处于 React 管理的 render/commit
流程，不能嵌套同步 flush。修复方向是删除同步需求，或把调用移动到真实外部 callback 或用户事件。

## 十一、microtask 只是最后兜底

如果第三方库只允许从 React lifecycle 入口收到通知，而且调用位置确实无法调整，官方给出 microtask
逃生舱：

```tsx
useEffect(() => {
  queueMicrotask(() => {
    flushSync(() => setReady(true))
  })
}, [])
```

microtask 让当前 render/commit 先结束，再发起另一轮同步工作。它没有降低 `flushSync` 的成本，反而多
安排一次同步 render；官方明确指出这种模式性能更差。

使用顺序应是：

1. 删除不必要的同步 DOM 读取；
2. 保持普通 React 更新，让事件结束后提交；
3. 把同步边界移动到外部 callback 或事件；
4. 无法改变第三方入口时，才评估 microtask。

不要用 Promise、timer、microtask 或 `requestAnimationFrame` 猜测“React 大概更新完了”。每个调度工具
表达的阶段不同，必须从外部系统真正消费 DOM 的时点反推方案。

## 十二、TypeScript 返回值差异

### 1. 三个层次的当前事实

| 层次 | React DOM 19.2 当前内容 |
| --- | --- |
| React Reference | 返回 `undefined` |
| `@types/react-dom@19.2.4` | `flushSync<R>(fn: () => R): R` |
| React DOM 19.2.8 实现 | 转发 callback 的返回值 |

类型声明如下：

```ts
export function flushSync<R>(fn: () => R): R
```

这是公开文档、发布类型与当前实现之间的上游差异，不能虚构成完全一致。课程示例让 callback 返回
`void`，并忽略整个表达式的值：

```tsx
flushSync((): void => {
  setExpanded(true)
})
```

### 2. 不把返回值当成业务通道

即使当前类型允许返回字符串或对象，`flushSync` 的公开用途仍是建立 DOM 提交边界。业务结果在调用前
计算，或由普通函数显式返回；不要让业务协议依赖当前版本转发 callback 返回值。

### 3. Ref 仍需判空

同步提交只保证 React 已完成所需 DOM 更新，不会替 TypeScript 证明某个条件节点一定存在：

```tsx
flushSync(() => setVisible(true))

const node = panelRef.current
if (node) {
  thirdPartyPanel.attach(node)
}
```

Ref 类型、条件渲染和组件卸载仍需按正常 DOM 生命周期处理。

## 十三、选择流程

### 1. 四个必要条件

只有同时满足以下条件，才进入 `flushSync` 评估：

1. 调用方是 React 之外的浏览器 API 或 UI 库；
2. 对方明确在同步 callback 返回时消费 DOM；
3. 下一步确实读取或操作本次更新产生的 DOM；
4. 普通事件提交、声明式渲染或调整适配层不能满足要求。

缺少任意一项，优先保持正常 batching。

### 2. 方案对照

| 真实需求 | 首选方案 |
| --- | --- |
| 当前逻辑需要下一业务值 | 局部变量或函数式 updater |
| UI 随 State 正常变化 | 普通 setter |
| commit 后执行同步布局测量 | `useLayoutEffect` |
| 非阻塞外部同步 | `useEffect` |
| callback 返回前必须消费新 DOM | 一次最小 `flushSync` |
| lifecycle 中无法移动的外部入口 | 穷尽其他方案后使用 microtask 兜底 |
| 等待浏览器动画帧 | 使用对应浏览器帧 API，不把 commit 当 paint |

### 3. 集中在适配层

把同步边界集中到第三方集成模块，可以清楚回答谁要求同步、读取哪个节点、为何默认 commit 不够，以及
怎样测量性能。业务组件大面积散布 `flushSync`，通常说明外部所有权边界不清或把 State 快照问题误当成
DOM 问题。

## 十四、用法示例或 Demo

Demo 用一个同步检查器模拟外部 API。检查器先执行 React 更新 callback，然后在 callback 返回点读取真实
`article` 的 `data-version` 和文本。

1. 点击“默认更新后立即读取”：请求版本增加，handler State 保存旧快照，同步检查器读到旧 DOM；事件
   结束后页面正常提交目标版本。
2. 点击“flushSync 后立即读取”：同一检查器在 `flushSync` 返回后读 DOM，立即命中目标版本；handler
   State 仍保存旧快照。
3. 对照“callback 末尾 DOM”和“当前已提交 DOM”，不要把后者倒推成 callback 当时已经可见。
4. 重复运行两条路径，确认结论只取决于提交边界，不依赖 timer、网络、随机数或打印对话框。

:::demo{id="react.core.learn.advanced.flush-sync-dom-commit.synchronous-inspection-demo"}
:::

## 十五、易错使用提示

:::pitfalls
### 错误一：用 flushSync 获取当前 State 的新值

**触发条件：** 在普通点击中同步提交后，继续读取创建当前 handler 的 State 变量。

**原因：** 同步 commit 不会改写正在运行函数的词法绑定。

**后果：** DOM 已是新版本，业务判断却仍使用旧快照。

**错误示例：**

```tsx
flushSync(() => setCount(count + 1))
saveCount(count)
```

**正确写法：** 先计算下一业务值；只有 DOM 确实被外部系统同步消费时才保留同步边界。

```tsx
const nextCount = count + 1
flushSync(() => setCount(nextCount))
saveCount(nextCount)
```

**验证方式：** 同时记录 handler 快照、局部下一值和 DOM 文本，三者责任清楚。

### 错误二：把同步 commit 当成 browser paint

**触发条件：** `flushSync` 返回后立刻断言用户已经看到一个独立画面。

**原因：** API 保证 React DOM 已更新，不控制浏览器何时绘制像素。

**后果：** 动画、截图或视觉时序逻辑依赖不存在的帧保证。

**错误示例：** 用同步返回次数推断屏幕闪烁次数。

```tsx
flushSync(() => setVisible(true))
console.info('浏览器已经完成一帧绘制')
```

**正确写法：** DOM 操作只依赖 commit；真正的帧需求使用浏览器帧 API 并单独验证。

```tsx
flushSync(() => setVisible(true))
console.info(panelRef.current?.dataset.visible)
```

**验证方式：** 断言节点、属性和文本，不断言固定 paint 次数。

### 错误三：假设只处理 callback 内的更新

**触发条件：** 把 callback 当成与其他 React 工作完全隔离的事务。

**原因：** React 可能先处理 callback 外 pending updates，才能完成内部同步工作。

**后果：** 日志顺序、Effect 次数或其他区域的 DOM 变化超出错误预期。

**错误示例：** 用“callback 外一定不提交”作为业务条件。

```tsx
setToolbarOpen(true)
flushSync(() => setPanelOpen(true))
// 错误假设：toolbar 此时一定尚未提交。
```

**正确写法：** callback 保持最小，业务正确性不依赖其他 pending work 的固定顺序。

```tsx
flushSync(() => setPanelOpen(true))
const panel = panelRef.current
if (panel) thirdPartyPanel.attach(panel)
```

**验证方式：** 只验收需要同步读取的目标 DOM，不固定无关组件的 commit 次数。

### 错误四：认为每次都会运行全部 pending Effects

**触发条件：** 根据文档中的“may run”建立固定 Effect 顺序。

**原因：** 公开合同只允许 React 在需要时提前处理，不承诺无条件冲刷全部 Effect。

**后果：** 某次版本或更新来源变化后，依赖日志排序的逻辑失效。

**错误示例：** 把 Effect 是否已经执行作为 `flushSync` 成功标志。

```tsx
flushSync(() => setReady(true))
console.info(effectHasRun)
```

**正确写法：** 成功条件是目标 DOM 已提交；Effect 保持幂等和正确依赖。

```tsx
flushSync(() => setReady(true))
console.info(panelRef.current?.dataset.ready)
```

**验证方式：** 移除 Effect 日志后，外部同步读取仍得到正确 DOM。

### 错误五：假设 Suspense 一定保留旧内容

**触发条件：** 同步更新可能 suspend，却要求旧内容绝不被 fallback 替换。

**原因：** `flushSync` 可能让 pending Suspense boundary 重新显示 fallback。

**后果：** 外部系统读取到 loading UI，用户也可能看到不必要的内容切换。

**错误示例：** 把数据加载和必须同步的打印 class 放进同一次更新。

```tsx
flushSync(() => {
  setPrintMode(true)
  setReportId(nextReportId)
})
```

**正确写法：** 拆分紧急 DOM 集成状态与可延后的资源内容，缩小同步树。

```tsx
flushSync(() => setPrintMode(true))
startTransition(() => setReportId(nextReportId))
```

**验证方式：** 在资源未就绪时测试集成路径，不对 fallback 可见性做相反承诺。

### 错误六：在 useLayoutEffect 中调用

**触发条件：** 认为布局 Effect 已经同步，所以嵌套 `flushSync` 会“更同步”。

**原因：** React 正在 commit，不能在 lifecycle 中嵌套完成同步 flush。

**后果：** 开发环境出现 lifecycle 警告，调用点也不能提供预期同步保证。

**错误示例：**

```tsx
useLayoutEffect(() => {
  flushSync(() => setMeasured(true))
}, [])
```

**正确写法：** 布局测量直接在 `useLayoutEffect` 中完成；外部 callback 同步消费 DOM 时才在事件边界调用。

```tsx
/** 在外部同步事件中提交必须立即读取的 DOM。 */
function handleExternalInspect() {
  flushSync(() => setExpanded(true))
  const panel = panelRef.current
  if (panel) inspectPanel(panel)
}
```

**验证方式：** 开发 console 无 lifecycle 警告，测量与外部集成各自位于正确阶段。

### 错误七：用 try/catch 捕获 lifecycle 警告

**触发条件：** 把开发环境的 console warning 当作 `flushSync` 主动抛出的异常。

**原因：** React 19.2.8 在该路径写入 `console.error`，不是可由 `try/catch` 修复的 API throw。

**后果：** 警告仍存在，错误调用位置也没有改变。

**错误示例：** 用空 catch 包住 Effect 中的 `flushSync`。

```tsx
try {
  flushSync(() => setReady(true))
} catch {}
```

**正确写法：** 移除 lifecycle 调用，把同步边界移到外部 callback 或事件。

```tsx
/** 响应外部同步 callback。 */
function handleExternalReady() {
  flushSync(() => setReady(true))
}
```

**验证方式：** 删除 catch 后开发 console 仍为零警告，且外部读取结果正确。

### 错误八：把 microtask 当成常规等待工具

**触发条件：** 每次需要“等 React 更新”就执行 `queueMicrotask(() => flushSync(...))`。

**原因：** microtask 只让当前 lifecycle 结束，仍会再安排同步 render，性能更差。

**后果：** 更新链条更难追踪，主线程同步成本增加。

**错误示例：** 普通输入事件每次都排一个同步 microtask。

```tsx
queueMicrotask(() => {
  flushSync(() => setQuery(nextQuery))
})
```

**正确写法：** 普通交互使用 setter；只有无法移动的第三方 lifecycle 入口才评估最后兜底。

```tsx
setQuery(nextQuery)
```

**验证方式：** 删除 microtask 后普通 UI 仍正确，只有具备同步消费合同的适配器保留一次边界。

### 错误九：在循环中反复同步提交

**触发条件：** 批量添加十个节点时，每添加一个就调用一次 `flushSync`。

**原因：** 每次调用都可能制造独立同步工作，并破坏 batching。

**后果：** render、commit、布局和 Effect 成本成倍增加。

**错误示例：**

```tsx
items.forEach((item) => {
  flushSync(() => setRows((rows) => [...rows, item]))
})
```

**正确写法：** 一次计算完整下一数组；若外部回调确实要求同步 DOM，只建立一次边界。

```tsx
flushSync(() => setRows((rows) => [...rows, ...items]))
```

**验证方式：** 同一批数据只触发一次同步边界，最终节点数正确。

### 错误十：依赖 callback 返回业务值

**触发条件：** 根据当前泛型类型和运行时转发，使用 `flushSync` 返回业务对象。

**原因：** React Reference 把返回值写成 `undefined`，当前类型与实现存在版本差异。

**后果：** 代码把 DOM 提交工具变成不稳定的数据传递协议。

**错误示例：**

```tsx
const saved = flushSync(() => ({ id: draftId }))
```

**正确写法：** 业务值单独计算和返回；`flushSync` callback 只安排必要更新并返回 `void`。

```tsx
const saved = { id: draftId }
flushSync((): void => setSavedId(saved.id))
```

**验证方式：** 不读取 `flushSync` 表达式值，升级类型或运行时也不影响业务结果。
:::

## 十六、调试顺序

1. 写出外部系统何时调用 callback、何时消费 DOM；没有同步消费者就删除 `flushSync`。
2. 分别记录 handler State 快照、请求的下一值、callback 返回点 DOM 和最终 DOM。
3. 确认 DOM 读取位于 `flushSync` 返回后，callback 内只包含必要 setter。
4. 检查开发 console 是否出现 lifecycle 警告；出现时先修正调用位置。
5. 检查同步更新是否可能 suspend，fallback 是否会污染外部读取结果。
6. 检查 callback 外 pending work 和 Effect，不依赖固定次数或顺序。
7. 用性能录制确认同步树、commit 和长任务，再缩小适配层边界。
8. 只有第三方入口无法移动时才保留 microtask，并记录其同步成本。

## 十七、源码推导与适用边界

**官方事实：** React Reference 保证 callback 内更新可在 `flushSync` 返回前反映到 DOM，同时明确
pending work、Effect、Suspense fallback、性能和 lifecycle caveats。`useState` 文档继续保证当前
handler 读取旧 State 快照。`@types/react-dom@19.2.4` 的泛型返回与 Reference 的 `undefined` 描述存在
真实差异。

**当前版本旁证：** React DOM 19.2.8 实现会提高当前更新优先级、调用 callback、恢复上下文并尝试完成
同步工作；开发环境在 React 已处于 render/commit 时记录警告。源码只解释当前版本，不把内部 priority、
lane、dispatcher 或跨 Root 算法作为公共 API。

**适用边界：** 这里不展开 Suspense、Transition、Effect、浏览器绘制流水线、打印兼容矩阵或通用 DOM
测量 Hook。主线只回答一个问题：外部同步 callback 返回前必须读取本次更新的 DOM 时，怎样建立最小且
可验证的提交边界。

## 十八、练习

:::exercise
### 1. 判断是否需要同步提交

**要求：** 分析“普通按钮展开详情”“beforeprint 切换打印 class”“保存后显示成功提示”“第三方图表在
callback 返回时测量新容器”四个需求，判断首选普通 setter 还是 `flushSync`。

**验收：** 普通展开和成功提示保持默认更新；打印 callback 与图表同步测量只有在返回点明确消费 DOM 时
使用一次最小边界；每项都写出消费者和消费时点。

**参考答案：** 是否需要同步不取决于“重要程度”，只取决于 React 外部消费者是否在 callback 返回时
立即读取本次更新产生的 DOM。
:::

:::exercise
### 2. 区分 State、commit 与 paint

**要求：** 对 `flushSync(() => setCount(count + 1))` 后的三项观察分别判断：当前 `count`、Ref 文本、
屏幕是否已产生独立帧。

**验收：** `count` 仍是旧 render 快照；Ref 文本对应新 DOM；独立 paint 未被保证。答案不能使用
“React 太快或太慢”解释。

**参考答案：** 同步边界只改变本次 DOM commit 的完成时点，不回写当前函数变量，也不控制浏览器绘制。
:::

:::exercise
### 3. 收窄第三方适配层

**要求：** 重构一个同时执行 setter、网络请求、日志、测量和第三方 attach 的大 callback，只保留必须
同步的 State 更新。

**验收：** `flushSync` callback 内只有必要 setter；测量和 attach 位于返回后；网络与日志位于同步
关键路径之外；Ref 做判空。

**参考答案：** 先同步提交最小 DOM，返回后把节点交给外部库；与 DOM 返回点无关的工作不进入 callback。
:::

:::exercise
### 4. 修复 lifecycle 警告

**要求：** 给出 `useLayoutEffect` 内调用 `flushSync` 的两个修复方案，并说明哪个优先。

**验收：** 首选删除同步需求或把调用移到真实事件/外部 callback；只有第三方入口不能移动时才使用
microtask，且明确它性能更差、不是 paint 保证。

**参考答案：** 先改变所有权和调用位置，microtask 只解决当前 React lifecycle 尚未结束的问题。
:::

:::exercise
### 5. 设计回归验证

**要求：** 为同步 DOM 适配器设计最小浏览器验证，覆盖默认对照、同步路径、旧 State 快照和 console。

**验收：** 默认路径在 callback 末尾读到旧 DOM、事件结束后更新；同步路径在返回点读到目标 DOM；两条
路径的 handler State 都是旧快照；console 无 lifecycle warning；不依赖固定像素和 paint 次数。

**参考答案：** 使用固定本地数据、`data-*` 属性和文本断言即可证明 commit 边界；无需网络、timer、真实
打印对话框或 Suspense 资源。
:::

## 十九、本节小结

- `flushSync(callback)` 从 `react-dom` 导入，只用于少数外部同步 DOM 集成。
- 返回后可以读取 callback 内更新产生的新 DOM；当前 handler State 仍是旧快照。
- 同步 commit 不等于 browser paint，也不是 callback 隔离事务。
- React 可能处理 callback 外 pending work、Effect 及其更新，并可能重新显示 Suspense fallback。
- render、两类 Effect 和 class lifecycle 中不能嵌套同步 flush。
- microtask 是性能更差的最后兜底，不是常规等待 React 的工具。
- callback 保持最小、集中在外部适配层，并用真实性能录制评估成本。
- 当前类型会转发泛型返回值，但可移植代码只依赖 DOM 提交保证并忽略返回值。

## 二十、参考资料

- [`flushSync`](https://react.dev/reference/react-dom/flushSync) - 同步 DOM、第三方集成、caveats 与调用位置。
- [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) - 新节点提交后立即滚动的正式示例。
- [`useState`](https://react.dev/reference/react/useState) - State 快照、事件批处理与少数 DOM 提前访问边界。
- [React DOM 19.2.8 implementation](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/shared/ReactDOMFlushSync.js) - 当前 callback 与开发警告实现旁证。
- [`@types/react-dom@19.2.4`](https://unpkg.com/@types/react-dom@19.2.4/index.d.ts) - 固定 TypeScript 泛型签名。
