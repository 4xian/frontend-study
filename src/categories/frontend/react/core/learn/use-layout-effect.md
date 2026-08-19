---
id: react.core.learn.intermediate.use-layout-effect
type: lesson
title: useLayoutEffect
summary: 在浏览器重绘前读取已提交 DOM 的布局，并用最小同步工作修正首帧几何。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - react.core.learn.intermediate.use-effect
  - react.core.learn.intermediate.dom-refs
related:
  - react.core.learn.intermediate.use-ref
  - react.core.learn.intermediate.use-imperative-handle
tags:
  - React
  - useLayoutEffect
  - DOM 测量
  - 浏览器重绘
  - 布局性能
  - 服务端渲染
appliesTo: React 19.2
verifiedAt: 2026-08-18
objectives:
  - 能依据首帧是否允许出现错误几何，在 render、事件、useEffect 与 useLayoutEffect 之间作出选择。
  - 能说明 setup、cleanup、依赖、返回值和 Strict Mode 开发检查的完整合同。
  - 能用 Ref 读取已提交节点的 DOMRect，并用一次同步 State 更新完成两遍渲染。
  - 能识别响应值和浏览器环境分别如何使测量失效，并选择重新测量入口。
  - 能控制布局读取、同步写入和 DOM 范围，避免阻塞绘制与布局抖动。
  - 能解释服务端没有布局信息，并为 SSR 场景选择普通 Effect、客户端边界或稳定 fallback。
recap:
  - useLayoutEffect 只处理必须在本次浏览器重绘前完成的布局读取与同步修正。
  - 节点先提交，setup 再测量；其中安排的 State 更新会在重绘前触发最终 render。
  - dependencies 描述会改变同步过程的响应值，cleanup 撤销 setup 获取的资源或外部修改。
  - useLayoutEffect 和其中的 State 更新阻塞重绘，能用 CSS、render 或 useEffect 时不应使用它。
  - Effect 只在客户端运行；服务端没有 DOM 布局，不能靠 Hook 名称补出正确首屏几何。
sources:
  - title: React useLayoutEffect Reference
    url: https://react.dev/reference/react/useLayoutEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - API 参数、返回值、依赖、cleanup、Strict Mode 与客户端边界
      - 重绘阻塞、布局 Effect 内 State 更新和优先 useEffect 的限制
  - title: Measuring layout before the browser repaints the screen
    url: https://react.dev/reference/react/useLayoutEffect#measuring-layout-before-the-browser-repaints-the-screen
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 先提交、测量、再以真实几何重渲染的两遍渲染模型
  - title: useLayoutEffect does nothing on the server
    url: https://react.dev/reference/react/useLayoutEffect#im-getting-an-error-uselayouteffect-does-nothing-on-the-server
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 服务端缺少布局信息及普通 Effect、客户端边界和 hydration fallback 选项
  - title: React 19.2.8 Fizz Hook Dispatcher
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-server/src/ReactFizzHooks.js#L800-L845
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定服务端实现不执行布局 Effect callback
  - title: Remove the useLayoutEffect SSR warning
    url: https://github.com/facebook/react/pull/26395
    sourceType: source-code
    appliesTo: React 18.3 and later core server renderer
    claims:
      - React core 移除旧服务端 warning，环境别名不能修复错误首屏
  - title: React useEffect Caveats
    url: https://react.dev/reference/react/useEffect#caveats
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 普通 Effect 的绘制时机不是绝对规则，视觉闪烁才是布局 Effect 的选择依据
  - title: React useInsertionEffect Reference
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useInsertionEffect.md#L5-L61
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - CSS-in-JS 库适用范围、layout Effect 前时机、Ref 与 State 限制
  - title: React StrictMode Reference
    url: https://react.dev/reference/react/StrictMode
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 开发环境额外执行 Effect setup 与 cleanup 的检查合同
  - title: MDN Element.getBoundingClientRect
    url: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    sourceType: official-reference
    appliesTo: DOM
    claims:
      - DOMRect 尺寸、border-box 语义和相对视口坐标
  - title: Avoid large complex layouts and layout thrashing
    url: https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing
    sourceType: engineering-reference
    appliesTo: Web rendering
    claims:
      - 强制同步布局、读写交错和批量先读后写的性能边界
  - title: React 19.2.8 ReactHooks Source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L119-L132
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本公开 Hook 入口与 dispatcher 分派
  - title: React 19.2.8 Layout Phase Source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberWorkLoop.js#L3943-L3951
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定实现中 layout phase 可读取已经变更的 host tree
  - title: '@types/react 19.2.18 useLayoutEffect declaration'
    url: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L1763-L1776
    sourceType: source-code
    appliesTo: '@types/react 19.2.18'
    claims:
      - EffectCallback、DependencyList 与 void 返回值的固定类型合同
---

# useLayoutEffect

## 一、学习目标

- 判断页面是否必须在本次重绘前读取 DOM 布局并修正可见结果。
- 写出 `useLayoutEffect(setup, dependencies)`，说明 setup、cleanup、依赖和返回值。
- 用 `useRef` 取得已提交节点，用 `getBoundingClientRect()` 读取真实几何。
- 解释初始 render、DOM commit、布局测量、同步 State 更新、第二次 render 与重绘的顺序。
- 识别不必要测量、布局读写交错、反馈循环和缺失 cleanup 的性能或正确性问题。
- 在 SSR 场景中说明为什么服务端不能测量，并选择与首屏要求匹配的降级方式。

## 二、为什么需要

多数组件不需要知道自身像素尺寸。React 根据 Props 和 State 计算 JSX，浏览器根据 HTML 与 CSS 计算布局并
绘制。只要最终界面可以直接由数据和 CSS 决定，render 就已经足够。

少数界面必须先知道刚提交节点的真实几何，才能决定最终结果。例如浮层要根据自身高度判断放在锚点上方
还是下方。如果先按未知高度绘制，再异步移动到正确位置，用户会看到一次明显跳动。

`useLayoutEffect` 提供一个很窄的同步边界：React 已经把节点提交到 DOM，浏览器还没有完成本次重绘。组件
可以在这里读取布局，并立即更新 State，让最终 render 在用户看到画面之前完成。

这个能力以阻塞重绘为代价。选择它的理由不是“代码和 DOM 有关”，而是同时满足两个条件：

1. 最终 JSX 或位置必须依赖已提交 DOM 的真实布局。
2. 用户不能看到测量前的中间几何。

缺少任意一个条件，就应优先考虑 CSS、render 计算、事件处理器或普通 `useEffect`。

## 三、API 合同

### 1. 签名

```tsx
useLayoutEffect(setup, dependencies?)
```

- `setup` 是没有参数的函数。React 在 DOM commit 后、浏览器重绘前调用它。
- `setup` 可以不返回值，也可以返回 cleanup 函数。
- `dependencies` 是可选的内联固定长度数组，列出 setup 读取的全部响应值。
- `useLayoutEffect` 自身返回 `undefined`，不能把它的调用结果当作数据。

固定 TypeScript 类型可以概括为：

```tsx
type EffectCallback = () => void | (() => void)

declare function useLayoutEffect(
  effect: EffectCallback,
  deps?: readonly unknown[],
): void
```

这里的简化声明用于说明形状。实际 `@types/react` 使用 `EffectCallback`、`Destructor` 与
`DependencyList` 等类型别名表达同一合同。

### 2. setup 与 cleanup

首次提交后，React 运行 setup。依赖变化后的提交中，React 先用旧闭包运行 cleanup，再用新闭包运行
setup。组件从 DOM 移除前，React 运行当前 setup 对应的最后一次 cleanup。

只读取一次几何并写入 React State，没有创建长期资源时，不必为了形式返回 cleanup：

```tsx
useLayoutEffect(() => {
  const node = panelRef.current
  if (!node) return

  setHeight(node.getBoundingClientRect().height)
}, [content])
```

如果 setup 注册监听、保存外部实例或执行可撤销的 DOM 修改，就必须由同一个闭包撤销它：

```tsx
useLayoutEffect(() => {
  const node = panelRef.current
  if (!node) return

  const previousOverflow = node.style.overflow
  node.style.overflow = 'hidden'

  return () => {
    node.style.overflow = previousOverflow
  }
}, [isLocked])
```

能直接通过 JSX 的 `style` 或 class 表达的视觉状态仍应保持声明式；上例只说明 cleanup 的所有权，不是推荐
用命令式样式代替 Props。

### 3. dependencies

依赖规则与其他 Effect 相同：Props、State，以及组件函数内声明并被 setup 读取的变量或函数，都是响应值。
React 用 `Object.is` 比较每一项。

```tsx
useLayoutEffect(() => {
  const node = panelRef.current
  if (!node) return

  setRect(node.getBoundingClientRect())
}, [content, widthMode])
```

- `[content, widthMode]`：任一值变化后的提交都会重新测量。
- `[]`：依赖值不变化时不会因依赖变化重跑；卸载后重挂载、隐藏恢复等生命周期重新建立时仍会再次执行，开发环境
  Strict Mode 还会额外检查 setup 与 cleanup。
- 省略数组：组件每次 commit 后都运行，通常会制造不必要的同步布局工作。

Ref 对象本身通常是稳定的，不需要为了 `panelRef.current` 把 Ref 放进数组。决定节点是否存在或身份是否变化
的响应值仍要列出；使用条件渲染时，更清晰的做法往往是把测量逻辑放进实际拥有该节点的子组件。

### 4. 同步边界

setup 不能写成 `async`。Promise 无法作为 cleanup，异步结果也不可能继续阻止已经到来的浏览器重绘。
网络、计时器和等待数据属于普通异步流程，不应放进布局 Effect。

布局 Effect 内安排 State 更新时，React 会立即处理本轮剩余 Effect，包括普通 `useEffect`。这会延长关键
路径，因此同步更新必须少而确定，不能把一串业务工作都放进来。

## 四、两遍渲染模型

### 1. 初始 render

组件第一次 render 时还没有 DOM 节点可测量。它先使用一个明确的初始值输出可测量结构：

```tsx
const [height, setHeight] = useState(0)
```

初始值不是“真实高度的猜测”，只是让 render 可以完成。不要在组件函数里读取 `ref.current`，因为 render
发生在 commit 之前，而且 Ref 的变化不会触发 render。

### 2. DOM commit

React 把本轮 JSX 对应的节点放入宿主 DOM，并设置对象 Ref 的 `current`。此时节点存在，浏览器能够根据当前
样式计算它的布局。

### 3. 布局测量与同步更新

`useLayoutEffect` 读取节点的矩形，并把真正参与渲染的数据写入 State：

```tsx
useLayoutEffect(() => {
  const node = panelRef.current
  if (!node) return

  const { width, height } = node.getBoundingClientRect()
  setSize({ width, height })
}, [content, widthMode])
```

State 更新触发第二次 render。第二次 JSX 使用真实尺寸决定位置、裁切范围或其他最终几何。

### 4. 浏览器重绘

React 保证布局 Effect 代码和其中安排的 State 更新在浏览器重绘前处理。用户可能知道组件内部执行了两次
render，但只看到同步修正后的画面。

这个保证不意味着浏览器没有做布局计算，也不意味着同步工作免费。DOM 几何读取可能迫使浏览器完成当前布局，
第二次 render 还会再次提交，所以两遍渲染必须保留给真正需要它的界面。

## 五、DOM 几何

### 1. 安全取得节点

为 Ref 指定宿主元素类型，并在 setup 中处理 `null`：

```tsx
const boxRef = useRef<HTMLDivElement>(null)

useLayoutEffect(() => {
  const node = boxRef.current
  if (!node) return

  const rect = node.getBoundingClientRect()
  setHeight(rect.height)
}, [])
```

非空断言只适用于结构已经证明节点必然存在的局部代码。条件渲染、Ref 转发、Suspense 边界和组件卸载都可能
让 `current` 暂时为 `null`，显式缩窄通常更稳妥。

### 2. `DOMRect` 的含义

`getBoundingClientRect()` 返回元素相对当前视口的最小包围矩形，常用字段包括：

- `width`、`height`：边框盒尺寸，包含 padding 和 border。
- `top`、`right`、`bottom`、`left`：相对视口的边界坐标。
- `x`、`y`：通常与 `left`、`top` 对应。

坐标会随页面滚动变化，因为参照物是视口。若要换算为文档坐标，需要结合当前滚动偏移；若元素位于滚动
容器内，还要明确最终定位使用的是视口、容器还是 Portal 宿主的坐标系。

尺寸可能包含小数。界面定位可以保留小数，只有展示读数或像素对齐确有要求时才四舍五入。不要用取整后的
展示值反向覆盖更精确的布局计算。

### 3. 测量哪一个盒子

Ref 应绑定到真正决定目标几何的节点。测量外层容器、文本内容或内部滚动区域会得到不同结果：

- 浮层定位通常关心浮层边框盒和锚点边框盒。
- 内容裁切可能关心 `scrollHeight` 与可见高度，而不只是 DOMRect。
- 滚动容器定位必须同时考虑容器边界和滚动偏移。

先定义最终公式需要哪个几何量，再选择 API。不能先读一组像素，再凭字段名称猜用途。

### 4. React 依赖之外的布局变化

依赖数组只能跟踪 React 响应值。字体加载、图片固有尺寸、视口变化、容器查询和第三方脚本也可能改变布局，
但它们不会自动改变 `[content, widthMode]`。

如果这些变化会让结果失效，需要为真实变化来源建立重新测量入口，例如响应式 CSS 直接完成布局，或由专门的
元素尺寸观察机制触发 State 更新。不要通过省略依赖数组让每次 commit 都测量，这既不完整，也会浪费关键
绘制时间。

## 六、最小正确用法

下面的组件根据浮层高度决定放在锚点上方还是下方：

```tsx
import { useLayoutEffect, useRef, useState } from 'react'

type Placement = 'above' | 'below'

type FloatingPanelProps = {
  anchorRect: DOMRect
  children: React.ReactNode
}

/** 测量浮层高度，并在首帧前选择可放置的一侧。 */
function FloatingPanel({ anchorRect, children }: FloatingPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<Placement>('above')

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const panelHeight = panel.getBoundingClientRect().height
    setPlacement(anchorRect.top >= panelHeight ? 'above' : 'below')
  }, [anchorRect.top, children])

  const top = placement === 'above' ? anchorRect.top : anchorRect.bottom

  return (
    <div ref={panelRef} data-placement={placement} style={{ top }}>
      {children}
    </div>
  )
}
```

这段代码只展示测量闭环。真实浮层还需要水平边界、滚动、定位上下文和可访问性处理。若 CSS 锚点定位等
声明式能力已经满足需求，就不应保留 JavaScript 测量。

## 七、重新测量与状态建模

### 1. 保存渲染真正需要的值

如果 JSX 只需要高度，就保存高度；如果定位公式同时需要宽高，再保存一个小对象。不要把整个 DOM 节点、可变
`DOMRect` 引用或所有浏览器字段复制进 State。

```tsx
type Size = {
  width: number
  height: number
}
```

State 是渲染输入，不是测量日志。调试次数、时间戳和 DOM 节点身份不应混进生产几何模型。

### 2. 避免无效更新

浏览器可能返回与上一轮相同的尺寸。高频测量入口中可以先比较再更新，避免重复 render：

```tsx
setSize((current) =>
  current.width === nextWidth && current.height === nextHeight
    ? current
    : { width: nextWidth, height: nextHeight },
)
```

比较单位必须一致。一个值保留小数、另一个提前取整，会让“相同尺寸”判断失真。

### 3. 防止反馈循环

如果测量结果改变被测节点尺寸，第二次提交可能得到另一个结果。典型错误是“测得高度后把高度加 1px 写回同一
节点”，导致每轮 commit 都继续增长。

测量 State 应驱动最终位置或其他独立几何，而不是无条件改变自己的测量输入。必须形成反馈时，要定义稳定终点，
并验证有限次更新后结果不再变化。

### 4. 节点身份变化

使用 `key` 重建节点、切换不同宿主元素或条件渲染，会产生新的 DOM 身份。拥有节点的组件应在新节点提交后重新
建立测量过程。不要把旧 `DOMRect` 当成跨挂载实例的缓存。

## 八、与其他执行位置的选择

| 需求 | 位置 | 原因 |
| --- | --- | --- |
| 由 Props、State 纯计算样式或 class | render | 不需要读取已提交 DOM |
| 点击后聚焦、滚动或选择文本 | 事件处理器 | 动作由明确用户事件触发 |
| 订阅、日志、标题或不阻止首帧的视觉同步 | `useEffect` | 允许浏览器先绘制 |
| 必须测量 DOM 并在本次重绘前修正几何 | `useLayoutEffect` | 需要已提交节点且不允许中间画面 |
| CSS-in-JS 库必须在布局 Effect 前插入样式 | `useInsertionEffect` | 仅限库作者；Ref 尚未挂载，不能更新 State，不用于布局测量 |
| 布局可完全由 CSS 表达 | CSS | 浏览器可直接完成布局，无需两遍 render |

不要把“同步”理解为“更可靠”。`useLayoutEffect` 只改变执行时机和绘制阻塞边界，不会自动修复错误依赖、
失控循环或不正确的数据所有权。

普通 `useEffect` 也不能被简化为“永远在绘制后”。React 对交互更新有调度例外。真正稳定的选择依据是：
本次绘制是否允许出现中间几何，而不是猜测某次运行落在哪个微任务或宏任务。

`useInsertionEffect` 不是更早的布局测量入口。它服务于 CSS-in-JS 库在布局 Effect 前插入样式，Ref 可能尚未挂载，
也不能在其中更新 State；普通应用不应使用它代替 `useLayoutEffect`。

## 九、性能成本

### 1. 阻塞重绘

layout setup、其中的 DOM 读取、JavaScript 计算、同步 State 更新、第二次 render 和 commit 都可能进入用户
看到下一帧之前的关键路径。工作越多，首屏显示和交互反馈越晚。

### 2. 减小同步范围

- 只测量决定最终结果的节点和字段。
- 不在布局 Effect 中发请求、等待 Promise、解析大数据或遍历无关 DOM。
- 把纯计算移回 render，把不阻止绘制的同步移到 `useEffect`。
- 让一个测量结果驱动相关视图，不重复读取同一节点。
- 先确认 CSS 是否能直接表达布局。

### 3. 避免布局抖动

修改影响布局的样式后立即读取尺寸，浏览器可能被迫同步计算布局。循环中交替执行“写样式 -> 读尺寸 -> 写样式”
会反复触发布局计算。

在确实需要批量处理时，先完成一组布局读取，再集中执行写入。React 应用更常见的做法是：布局 Effect 只读出
最小数据并更新 State，让下一次 render 集中表达 DOM 写入。

### 4. 用性能工具验证

不要凭 Hook 名称断言性能。使用浏览器性能面板观察长任务、强制重排、Layout 时间和帧延迟，再决定是否需要
缩小 DOM、减少测量或改成 CSS。性能结论必须绑定具体页面、设备和交互路径。

## 十、Strict Mode 与生命周期

### 1. 开发环境额外周期

启用 Strict Mode 时，React 会在首次真实 setup 前额外执行一次开发期 `setup -> cleanup`，然后再执行真实
setup。目的是验证同步过程可以建立、撤销并再次建立。

因此不能把 setup 次数当成业务事件次数，也不能在 setup 中发送不可撤销的统计、扣费或一次性命令。

### 2. 测量 callback 的可重复性

只读取当前节点并把结果写入 State 的测量逻辑应当可重复。若尺寸没有变化，最终 UI 必须相同。需要保留外部资源
时，cleanup 必须把环境恢复到下一次 setup 可以安全运行的状态。

### 3. 更新和卸载

依赖变化时，旧 cleanup 读取旧闭包；新 setup 读取新 Props 与 State。卸载 cleanup 不应依赖
`ref.current` 仍指向原节点，必要时在 setup 中先捕获 `const node = ref.current`，再让 cleanup 使用该局部引用。

## 十一、服务端渲染与 hydration

### 1. 服务端没有布局

Effect 只在客户端运行。服务端生成 HTML 时没有浏览器视口、CSS 布局树或可测量 DOM，因而无法知道浮层真实
高度。`useLayoutEffect` 不能让服务端提前得到这些信息。

若服务端 HTML 包含依赖未知布局的“最终位置”，客户端测量后仍可能跳动。警告的核心不是缺少一个 Hook 别名，
而是服务端首屏承诺与客户端布局需求冲突。

React Reference 仍用“`useLayoutEffect` does nothing on the server”作为故障排查标题。旧版 React、框架或
测试工具可能输出对应 warning；React 19.2.8 的 core server renderer 已移除旧 warning。稳定合同是服务端不执行
layout callback，不能用是否出现某条控制台文案判断 SSR 是否正确。

### 2. 四种处理方向

1. **允许初始结果先显示：** 改用 `useEffect`，接受客户端稍后修正。
2. **不需要服务端展示该组件：** 把组件放进客户端边界或由客户端交互后再挂载。
3. **需要稳定首屏占位：** 服务端与 hydration 期间渲染不调用布局 Effect 的 fallback，挂载后再显示真实组件。
4. **问题不是布局测量：** 若实际是在订阅外部 Store，应使用支持服务端快照的专用 API，而不是布局 Effect。

### 3. 不要用环境判断掩盖设计问题

把 `useLayoutEffect` 在服务端替换成 `useEffect` 的别名只能改变警告或客户端调用时机，不能创造服务端布局，也不能保证
首屏 HTML 与客户端最终几何一致。先确定服务端是否应该渲染该组件，再选择边界。

hydration 的标记一致性、错误回调和根生命周期属于独立问题；本课只处理“没有布局时如何安排测量组件”。

## 十二、TypeScript 边界

### 1. Ref 元素类型

`useRef<HTMLDivElement>(null)` 让 `current` 缩窄后拥有 `getBoundingClientRect()`。若组件可能接收多种宿主
元素，可使用它们共同拥有的 `HTMLElement` 或 `Element` 接口，但不要用 `any` 取消节点能力检查。

### 2. State 类型

```tsx
type Measurement = {
  width: number
  height: number
}

const [measurement, setMeasurement] = useState<Measurement>({
  width: 0,
  height: 0,
})
```

公开类型应描述组件真正使用的数据。`DOMRect` 还包含坐标和方法，直接存储整个对象会扩大状态合同。

### 3. cleanup 返回值

setup 只能返回 `void` 或没有参数的 cleanup。箭头函数如果直接返回赋值表达式、计时器 ID、对象或 Promise，
都不符合 Effect callback 合同。使用大括号明确丢弃普通 API 返回值。

## 十三、组件库封装

### 1. 封装语义，不隐藏依赖

重复的测量协议可以放进自定义 Hook，但接口应表达它测量什么、哪些输入会改变布局、返回什么。不要暴露一个
任意依赖数组让调用方猜测内部闭包。

```tsx
/** 测量由内容和宽度模式共同决定的面板尺寸。 */
function usePanelSize(
  panelRef: React.RefObject<HTMLDivElement | null>,
  content: string,
  widthMode: 'wide' | 'narrow',
): Measurement | null {
  const [measurement, setMeasurement] = useState<Measurement | null>(null)

  useLayoutEffect(() => {
    const node = panelRef.current
    if (!node) return

    const { width, height } = node.getBoundingClientRect()
    setMeasurement({ width, height })
  }, [content, panelRef, widthMode])

  return measurement
}
```

### 2. 每次调用拥有独立 State

自定义 Hook 复用逻辑，不自动共享结果。两个组件分别调用时，各自测量自己的节点并保存自己的 State。确实需要
共享几何时，应由明确的共同所有者保存，而不是使用模块变量缓存最后一次矩形。

### 3. 公开客户端合同

组件库需要说明服务端返回什么、hydration 期间显示什么、首次测量何时可用。封装 `useLayoutEffect` 不会创造
服务端布局；消费者允许绘制后增强时，库仍应提供普通 Effect 或无测量方案。

若封装建立监听、Observer 或第三方实例，资源由 Hook 自己 cleanup。只做一次同步读取时，不伪造空 cleanup。

## 十四、Demo 观察

下面的 Demo 用真实 DOMRect 展示三条路径：

- 宽度模式改变后，盒子宽度和高度重新测量。
- 内容长度改变后，文本换行和高度重新测量。
- 只更新外壳 State 时，被测几何不变，布局 Effect 不重复运行。

尺寸读数和几何标尺共用同一份 measurement State。按钮只改变输入，不能写死测量像素。

:::demo{id="react.core.learn.intermediate.use-layout-effect.prepaint-measurement-demo"}
:::

## 十五、调试顺序

### 1. 先确认是否真的需要布局 Effect

写出用户会看到的错误中间几何。如果无法说明，先改用 render、CSS 或 `useEffect`。

### 2. 检查 Ref 与被测节点

确认 Ref 绑定到正确宿主元素，setup 运行时节点非空，测量的盒模型与定位公式一致。

### 3. 检查所有几何输入

列出 Props、State、class 和内容中会改变被测布局的响应值，逐项核对 dependencies。再单独列出字体、图片、
视口和容器等 React 之外的变化来源。

### 4. 检查反馈循环

记录“测量值 -> State -> JSX/CSS -> 新测量值”的链路。若结果持续改变，找到修改自身输入的那一步。

### 5. 检查性能

确认 setup 没有无关业务工作，DOM 读取没有和多次样式写入交错，并用性能面板核对真实布局成本。

### 6. 检查客户端边界

如果页面会服务端渲染，明确服务端输出什么、hydration 期间显示什么、真实组件何时首次测量。

## 十六、易错使用提示

:::pitfalls
### 错误：把 useLayoutEffect 当成更快的 useEffect

**触发条件：** 只要代码读取 DOM 或修改视觉内容，就默认使用 `useLayoutEffect`。

**原因：** 它阻塞重绘；普通外部同步并不需要首帧前完成。

**后果：** 不必要的同步工作进入关键绘制路径，页面响应变慢。

**错误示例：**

```tsx
useLayoutEffect(() => {
  document.title = title
}, [title])
```

**正确写法：**

```tsx
useEffect(() => {
  document.title = title
}, [title])
```

**验证方式：** 必须能指出错误中间几何；否则不使用布局 Effect。

### 错误：在 render 中读取 DOM

**触发条件：** 组件函数执行时读取 `ref.current` 或调用 `getBoundingClientRect()`。

**原因：** render 发生在 commit 前，Ref 可能为空或仍指向旧节点，读取还破坏纯渲染边界。

**后果：** 得到 `null`、旧几何或不可重现结果。

**错误示例：**

```tsx
const height = panelRef.current?.getBoundingClientRect().height ?? 0
return <output>{height}</output>
```

**正确写法：**

```tsx
useLayoutEffect(() => {
  const node = panelRef.current
  if (node) setHeight(node.getBoundingClientRect().height)
}, [content])
```

**验证方式：** 所有 DOM 几何读取都位于提交后的明确入口中，render 只读取 Props 与 State。

### 错误：遗漏改变几何的依赖

**触发条件：** setup 读取由 `content` 或 `widthMode` 决定的节点，却使用空数组。

**原因：** 首次测量后 Effect 不会响应这些值的新提交。

**后果：** 页面显示新内容或新宽度，State 仍保存旧尺寸。

**错误示例：**

```tsx
useLayoutEffect(() => {
  setHeight(panelRef.current?.getBoundingClientRect().height ?? 0)
}, [])
```

**正确写法：**

```tsx
useLayoutEffect(() => {
  setHeight(panelRef.current?.getBoundingClientRect().height ?? 0)
}, [content, widthMode])
```

**验证方式：** 逐个改变响应输入，读数都必须对应当前 DOM；无关 State 更新不应重新测量。

### 错误：让测量结果持续改变被测输入

**触发条件：** 每次测得高度后，都把同一节点高度设置为 `measured + 1`。

**原因：** State 更新改变节点布局，新提交又得到更大的测量值。

**后果：** 形成同步更新循环，尺寸不断增长并阻塞页面。

**错误示例：**

```tsx
useLayoutEffect(() => {
  const height = panelRef.current!.getBoundingClientRect().height
  setPanelHeight(height + 1)
})
```

**正确写法：**

```tsx
useLayoutEffect(() => {
  const height = panelRef.current!.getBoundingClientRect().height
  setPlacement(height > availableTop ? 'below' : 'above')
}, [availableTop, content])
```

**验证方式：** 画出反馈链，确认有限次提交后被测输入和输出达到稳定状态。

### 错误：交错执行布局写入和读取

**触发条件：** 循环中修改一个元素样式，立刻测量另一个元素，再继续修改。

**原因：** 每次读取都可能迫使浏览器同步完成前面的布局变更。

**后果：** 产生多次 forced layout 和 layout thrashing。

**错误示例：**

```tsx
for (const item of items) {
  item.style.width = '50%'
  console.log(item.getBoundingClientRect().height)
}
```

**正确写法：**

```tsx
const heights = items.map((item) => item.getBoundingClientRect().height)
setMeasuredHeights(heights)
```

**验证方式：** 性能记录中不应因同一循环出现重复的强制布局块。

### 错误：把 setup 写成 async

**触发条件：** 为了等待数据，在 `useLayoutEffect` callback 上添加 `async`。

**原因：** async 函数返回 Promise，不是 cleanup；异步工作也不能继续阻止本次重绘。

**后果：** 类型检查失败，绘制时序仍不满足需求。

**错误示例：**

```tsx
useLayoutEffect(async () => {
  const data = await loadPanel()
  setData(data)
}, [])
```

**正确写法：**

```tsx
useEffect(() => {
  void loadPanel().then(setData)
}, [])
```

**验证方式：** layout setup 内只保留同步布局读取和最小同步更新，不返回 Promise。

### 错误：创建资源却不 cleanup

**触发条件：** setup 注册监听或执行可撤销 DOM 修改，但没有返回清理函数。

**原因：** 依赖变化、卸载和 Strict Mode 开发检查都会重新建立同步过程。

**后果：** 监听重复、样式残留或旧节点继续被闭包持有。

**错误示例：**

```tsx
useLayoutEffect(() => {
  window.addEventListener('resize', measure)
}, [])
```

**正确写法：**

```tsx
useLayoutEffect(() => {
  window.addEventListener('resize', measure)
  return () => window.removeEventListener('resize', measure)
}, [measure])
```

**验证方式：** 更新依赖和卸载后，旧监听数量恢复为零；setup 与 cleanup 使用同一个函数身份。

### 错误：依赖 setup 只运行一次

**触发条件：** 用模块变量、计数器或 Ref 阻止开发环境第二次 setup。

**原因：** Strict Mode 的额外周期用于暴露不对称 cleanup，真实更新和重新挂载也会再次建立过程。

**后果：** 开发检查被掩盖，后续节点却可能不再测量或残留旧资源。

**错误示例：**

```tsx
if (didMeasure.current) return
didMeasure.current = true
```

**正确写法：**

```tsx
useLayoutEffect(() => {
  const node = panelRef.current
  if (node) setHeight(node.getBoundingClientRect().height)
}, [content])
```

**验证方式：** 重复 `setup -> cleanup -> setup` 后，最终几何和资源数量与一次正确挂载一致。

### 错误：用同构别名掩盖服务端布局缺失

**触发条件：** 遇到旧版 React 或工具的服务端警告，只把服务端的 `useLayoutEffect` 替换为 `useEffect`，
不检查首屏输出。

**原因：** 服务端仍没有 DOM、CSS 布局和视口，别名不能计算真实几何。

**后果：** 警告可能消失，但 hydration 后仍出现位置跳动或错误占位。

**错误示例：**

```tsx
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
```

**正确写法：**

```tsx
return isMounted ? <MeasuredPanel /> : <StableFallback />
```

**验证方式：** 分别检查服务端 HTML、hydration 期间画面和客户端测量后的结果，确认每一阶段都有明确合同。
:::

## 十七、源码推导与适用场景

### 1. 公开 API 与固定实现

React `19.2` 的公开合同定义了 setup、cleanup、依赖、客户端限制和重绘前时机。固定 React `19.2.8`
源码中的公共入口把 `useLayoutEffect` 交给当前 dispatcher，reconciler 的 layout phase 可以读取已经变更的
host tree。

由此可以解释为什么 Ref 节点在 setup 中已经存在，以及为什么这里适合读取布局。dispatcher、Fiber flag、
effect tag 和精确内部函数名都不是应用 API，不能作为业务分支条件。

### 2. 课程推导

当最终可见几何同时依赖 React 数据和浏览器布局时，组件先提交可测量结构，再把最小 DOMRect 数据写入
State，由第二次 render 生成最终 JSX。State 是 React 与浏览器布局之间的显式桥梁。

如果用户允许先看到初始结果，普通 `useEffect` 更合适；如果根本不需要 DOM 布局，CSS 或 render 更直接。

### 3. 适合使用

- 浮层、气泡或菜单必须根据自身尺寸在首帧选择位置。
- 读取节点尺寸后必须立即修正滚动位置或可见区域。
- 第三方命令式控件提交后必须在绘制前完成一次几何对齐。
- 组件需要把刚提交节点的实际尺寸转成同一帧的 React 渲染输入。

### 4. 不适合使用

- 纯数据派生、class 选择和可由 CSS 完成的响应式布局。
- 网络请求、日志、订阅、计时器和不阻止首帧的外部同步。
- 用户点击后直接聚焦、滚动或选择文本的命令。
- 服务端生成依赖浏览器真实布局的最终像素值。
- 用同步 Hook 掩盖错误依赖、状态所有权或反馈循环。

## 十八、练习

:::exercise
### 1. 完成两遍渲染测量

**要求：** 创建一个内容可切换的提示面板，初始高度为 `0`。提交后读取 `getBoundingClientRect().height`，
把高度写入 State，并用它决定提示面板显示在锚点上方还是下方。

**验收：** 切换长短内容后位置与当前真实高度一致；render 中不读取 DOM；setup 不返回 Promise。
:::

:::exercise
### 2. 审计依赖与无关更新

**要求：** 为面板加入 `widthMode`、`content` 和一个不影响几何的 `revision`。布局 Effect 只在前两个值变化
后重新测量。

**验收：** 宽度与内容变化会更新尺寸；只更新 `revision` 时测量次数不变；依赖数组直接写在调用点。
:::

:::exercise
### 3. 修复布局反馈循环

**要求：** 从“测得高度后给同一节点增加 1px”的错误实现开始，画出反馈链，并改成测量结果只决定另一个
独立元素的位置。

**验收：** 更新在有限次提交内稳定；连续交互不会出现最大更新深度错误；被测节点不再由自身测量值扩张。
:::

:::exercise
### 4. 批量布局读取

**要求：** 测量三个卡片的高度。先实现交错的样式写入与读取，再改成先读出全部高度、最后一次更新 State。

**验收：** 最终结果一致；性能记录中改写后的强制布局次数不高于原实现；React State 只保存需要展示的值。
:::

:::exercise
### 5. 设计 SSR 降级

**要求：** 为一个依赖真实宽度的编辑器工具条写出服务端、hydration 期间和客户端挂载后的三阶段输出方案。
在普通 Effect、客户端边界和稳定 fallback 中选择一种并说明原因。

**验收：** 服务端阶段不读取 DOM；hydration 期间有稳定可读内容；客户端测量后进入最终布局；方案没有用环境
别名假装服务端已经拥有布局。
:::

## 十九、本节小结

- `useLayoutEffect` 在 DOM commit 后、浏览器重绘前运行，Hook 自身返回 `undefined`。
- setup 可以返回 cleanup；依赖变化先清理旧过程，再用新值建立过程，卸载前执行最后清理。
- dependencies 按 `Object.is` 比较，列出所有改变当前同步过程的响应值。
- 两遍渲染的顺序是初始 render、commit、测量、同步 State 更新、最终 render、浏览器重绘。
- `getBoundingClientRect()` 返回相对视口的边框盒矩形，尺寸可为小数，坐标会受滚动影响。
- 只保存 JSX 真正需要的测量数据，避免重复 State、反馈循环和跨挂载旧几何。
- 布局 Effect 和其中的 State 更新阻塞重绘；缩小同步范围，避免 DOM 读写交错。
- Strict Mode 的额外 setup/cleanup 是可重复性检查，不能依赖 setup 只运行一次。
- Effect 只在客户端运行；服务端没有布局，应选择普通 Effect、客户端边界或稳定 fallback。
- 能由 render、事件、CSS 或 `useEffect` 正确表达的需求，不使用 `useLayoutEffect`。

## 二十、参考资料

- [React `useLayoutEffect` Reference](https://react.dev/reference/react/useLayoutEffect) - 签名、依赖、
  cleanup、Strict Mode、客户端与性能边界。
- [Measuring layout before repaint](https://react.dev/reference/react/useLayoutEffect#measuring-layout-before-the-browser-repaints-the-screen) -
  两遍渲染与绘制前测量模型。
- [`useLayoutEffect` does nothing on the server](https://react.dev/reference/react/useLayoutEffect#im-getting-an-error-uselayouteffect-does-nothing-on-the-server) -
  服务端缺少布局信息及客户端降级选项。
- [React 19.2.8 Fizz Hook dispatcher](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-server/src/ReactFizzHooks.js#L800-L845) -
  固定版本服务端不执行布局 Effect callback 的实现旁证。
- [Remove the `useLayoutEffect` SSR warning](https://github.com/facebook/react/pull/26395) - 旧 warning
  的移除与环境别名边界。
- [React `useEffect` Caveats](https://react.dev/reference/react/useEffect#caveats) - 普通 Effect 的绘制时机和
  视觉工作选择边界。
- [React `useInsertionEffect` Reference](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useInsertionEffect.md#L5-L61) -
  CSS-in-JS 库适用范围、layout Effect 前时机，以及 Ref 与 State 限制。
- [React `<StrictMode>` Reference](https://react.dev/reference/react/StrictMode) - 开发环境额外执行 Effect
  setup 与 cleanup。
- [MDN `getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) -
  DOMRect、边框盒尺寸和视口坐标。
- [Avoid large, complex layouts and layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing) -
  强制同步布局与批量读写的性能建议。
- [React 19.2.8 `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L119-L132) -
  固定版本公共 Hook 入口。
- [React 19.2.8 layout phase source](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberWorkLoop.js#L3943-L3951) -
  固定实现中读取已提交 host tree 的阶段旁证。
- [`@types/react@19.2.18` `useLayoutEffect` declaration](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L1763-L1776) -
  Effect callback、依赖与返回值的固定类型合同。
