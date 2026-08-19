---
id: react.core.learn.intermediate.use-insertion-effect
type: lesson
title: useInsertionEffect
summary: 在布局 Effect 前插入 CSS-in-JS 运行时规则，并按资源所有权完成更新与清理。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 65
prerequisites:
  - react.core.learn.intermediate.use-layout-effect
related:
  - react.core.learn.intermediate.use-effect
  - react.core.learn.intermediate.use-layout-effect
tags:
  - React
  - useInsertionEffect
  - CSS-in-JS
  - 运行时样式
  - 资源所有权
appliesTo: React 19.2
verifiedAt: 2026-08-19
objectives:
  - 能判断静态 CSS、inline style 与运行时 style 注入各自适用的场景。
  - 能说明 setup、cleanup、依赖比较和 undefined 返回值的完整合同。
  - 能在布局 Effect 前创建、插入并清理一个明确归属的 style 节点。
  - 能解释不能更新 State、读取 Ref 或假设业务 DOM 更新时机的原因。
  - 能区分独立样式节点与共享样式节点的所有权和释放方式。
  - 能说明多组件交错、目标 Document、SSR 和 StrictMode 的边界。
recap:
  - useInsertionEffect 只服务于必须在浏览器运行时生成规则的 CSS-in-JS 库。
  - setup 只管理样式资源，依赖变化时先清理旧资源，卸载时清理当前资源。
  - callback 早于布局 Effect，但 Ref 尚未附加，也不能假设业务 DOM 已经更新。
  - 普通组件优先使用静态 CSS 或 inline style。
sources:
  - title: useInsertionEffect
    url: https://react.dev/reference/react/useInsertionEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - API 形态、依赖、cleanup、CSS-in-JS 范围和客户端边界
      - 早于布局 Effect 的时机以及 State、Ref、DOM 和交错限制
  - title: useEffect
    url: https://react.dev/reference/react/useEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 普通外部系统同步与 StrictMode 开发检查的对照边界
  - title: useLayoutEffect
    url: https://react.dev/reference/react/useLayoutEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 绘制前布局读取、同步更新和阻塞重绘的对照边界
  - title: React v19.2.8 ReactHooks Source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L103-L117
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本公共 Flow 签名与 dispatcher 转发
  - title: React v19.2.8 Fiber Hooks Source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2757-L2783
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - insertion effect 使用独立 Hook 标签的实现佐证
  - title: React v19.2.8 Commit Work Source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L2012-L2024
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - insertion cleanup 和 setup 早于 layout setup 的固定实现佐证
  - title: React v19.2.8 Hooks Noop Renderer Tests
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L2566-L3049
    sourceType: official-test
    appliesTo: React 19.2.8
    claims:
      - 更新顺序、跨组件交错、非法返回值和 State 更新诊断
  - title: React v19.2.8 Server Hooks Tests
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMServerIntegrationHooks-test.js#L624-L638
    sourceType: official-test
    appliesTo: React 19.2.8
    claims:
      - 服务端渲染不执行 insertion callback
---

# useInsertionEffect

## 一、学习目标

- 判断需求是否真的需要在浏览器运行时插入 CSS 规则。
- 写出包含 setup、cleanup 和完整依赖的最小 `useInsertionEffect`。
- 验证模式变化后只有当前规则生效，组件卸载后没有遗留样式节点。
- 解释 State、Ref、业务 DOM 和布局读取为什么不属于 insertion callback。
- 为独立节点、共享节点和多个 Document 分别确定资源所有者。
- 区分公共 API 保证、固定版本实现证据和浏览器可观察结果。

## 二、为什么需要

CSS-in-JS 库可能根据运行时输入生成选择器或整组规则。如果把规则写入推迟到普通 Effect，页面已经完成绘制，布局
Effect 也可能先按旧规则读取尺寸。如果在 render 中直接修改 `document.head`，可中断、重试或放弃的 render 又会产生
无法与组件生命周期对应的外部写入。

`useInsertionEffect` 提供一个很窄的提交窗口：组件进入 DOM 后、布局 Effect 运行前，库可以把当前规则插入目标
Document。它解决的是“运行时 CSS 规则何时进入文档”，不解决数据请求、订阅、布局测量或一般 DOM 操作。

```text
render：计算本次需要的规则
commit：更新宿主结构
insertion：插入本次运行时规则
layout：读取应用规则后的布局
paint：浏览器绘制
passive：执行普通 Effect
```

上面的顺序只表达公开的相对边界。insertion callback 不能据此假设某个业务 DOM 节点已经完成更新。

## 三、适用范围

直接使用这个 Hook 的通常不是普通业务组件，而是 CSS-in-JS 库的基础设施层。只有同时满足以下条件，才需要进入这个
范围：

1. 规则必须在浏览器运行时生成，不能完整提取为静态 CSS。
2. 规则由多个元素或组件通过选择器共享，inline style 不能直接表达。
3. 同一提交中的布局 Effect 必须看到这些规则已经生效。
4. 实现能够明确管理规则身份、目标 Document 和 cleanup。

以下工作不属于它：

- 请求、日志、事件订阅、timer 或外部连接；
- 读取 Ref、测量尺寸、滚动或聚焦；
- 根据 DOM 查询结果决定业务 State；
- 在服务端收集本次 render 用到的规则；
- 只改变一个元素的颜色、宽度或透明度。

## 四、三种样式方案

### 1. 静态 CSS

固定选择器、固定主题和构建时已知的规则应进入 `.css` 文件：

```css
.save-button {
  color: #ffffff;
  background: #245e56;
}
```

这类规则不需要组件创建 `<style>`，浏览器可以按普通样式表加载和缓存。

### 2. inline style

只影响当前元素、值直接来自 Props 或 State 的动态属性适合 inline style：

```tsx
<div style={{ width: `${progress}%` }} aria-valuenow={progress} />
```

它不需要选择器、全局节点或 cleanup。

### 3. 运行时 style

库在运行时生成共享选择器时，才创建 `<style>`：

```tsx
const ruleText = `.runtime-tone-${tone} { color: ${color}; }`
```

`useInsertionEffect` 只改进第三种方案的插入时机。它不会消除规则生成、样式重算和资源管理成本。

## 五、调用形态与返回值

最小调用形态是：

```tsx
useInsertionEffect(setup, dependencies?)
```

`setup` 是无参数函数，可以返回无参数 cleanup。依赖可省略；提供时必须写成长度固定的 inline 数组。Hook 自身返回
`undefined`，不能把返回值当成 style 节点、就绪标记或卸载函数。

```tsx
useInsertionEffect(() => {
  const styleElement = document.createElement('style')
  styleElement.textContent = ruleText
  document.head.appendChild(styleElement)

  return () => {
    styleElement.remove()
  }
}, [ruleText])
```

它仍遵守 Hooks 调用规则：只能在组件或自定义 Hook 顶层调用，不能放进条件、循环、事件处理器或另一个 Effect。

## 六、依赖与比较

Props、State 以及组件函数体内声明并由 callback 读取的值都可能是响应值。React 使用 `Object.is` 逐项比较新旧依赖：

```tsx
const ruleText = styleRules[styleMode]

useInsertionEffect(() => {
  const styleElement = targetDocument.createElement('style')
  styleElement.textContent = ruleText
  targetDocument.head.appendChild(styleElement)
  return () => styleElement.remove()
}, [targetDocument, ruleText])
```

依赖数组有三个直接约束：

- 必须包含 setup 直接读取的响应值；
- 项目数量在各次 render 间保持不变；
- 写成 `[targetDocument, ruleText]` 这样的 inline 数组。

省略依赖并不表示“只执行一次”，而是每次提交后都重新同步。每次 render 新建的对象或函数也会因身份变化触发清理与
重插入；应先简化规则输入，不要在 callback 内用 State setter 修正依赖。

## 七、一次 setup 的资源所有权

最清楚的模型是“一轮 setup 拥有一个节点”：

```tsx
useInsertionEffect(() => {
  const ownedStyle = document.createElement('style')
  ownedStyle.dataset.runtimeTheme = themeName
  ownedStyle.textContent = rulesByTheme[themeName]
  document.head.appendChild(ownedStyle)

  return () => ownedStyle.remove()
}, [themeName])
```

这里的所有权链是确定的：

```text
本轮 setup -> 创建 ownedStyle -> 插入 ownedStyle -> cleanup 移除 ownedStyle
```

cleanup 通过闭包持有准确节点，不需要重新查询 Document，也不会误删另一个实例的资源。`data-*` 标记只用于诊断和
公开观察，不是所有权本身。

## 八、依赖变化与清理

当 `themeName` 从 `neutral` 变为 `accent` 时，React 先用旧闭包执行 cleanup，再用新依赖执行 setup：

```text
neutral setup
-> themeName 改变
-> neutral cleanup
-> accent setup
```

稳定提交后的检查重点不是瞬间调用次数，而是资源结果：

- 旧节点已经移除；
- 当前节点只有一个；
- 节点文本只包含当前规则；
- 被样式化元素的 computed style 与当前规则一致；
- 组件卸载后当前节点归零。

cleanup 应释放旧闭包拥有的资源，不应读取新的 State，也不应通过 setter 记录“清理完成”。

## 九、早于布局 Effect

运行时规则必须在布局读取前可见，这是本 Hook 的核心价值：

```tsx
useInsertionEffect(() => {
  // CSS-in-JS 库插入运行时规则。
  return insertRuntimeRule(ruleText)
}, [ruleText])

useLayoutEffect(() => {
  // 这里读取的布局应已应用本轮运行时规则。
  const rect = panelRef.current?.getBoundingClientRect()
  reportSize(rect)
}, [ruleText])
```

上例只用于对照职责。样式库负责 insertion，使用样式的组件负责 layout；不要把两段工作合并进同一个 callback。

“早于 layout”不等于“早于所有 DOM 更新”，也不等于“更强的 layout Effect”。公开文档明确要求不要在 insertion
callback 中读取 DOM 更新状态。

## 十、Ref 与业务 DOM 边界

insertion callback 运行时 Ref 尚未附加。下面的代码没有可靠合同：

```tsx
useInsertionEffect(() => {
  const ownerDocument = cardRef.current?.ownerDocument
  const width = cardRef.current?.getBoundingClientRect().width
  // ownerDocument 和 width 都不能作为此阶段的可靠输入。
}, [])
```

同时，React 可能在 callback 前或后更新某些 DOM。不能通过 `querySelector`、`closest`、`offsetWidth` 或
`getComputedStyle` 查询业务节点来决定规则。callback 只接触自己创建的 style 资源；布局读取继续留在
`useLayoutEffect`，一般 DOM 同步留在合适的 Effect 或事件流程。

## 十一、State 更新边界

React 明确禁止在 insertion callback 中调度 State 更新。setup 和 cleanup 都不能调用 setter：

```tsx
// 错误：提交阶段反向更新渲染数据。
useInsertionEffect(() => {
  setReady(true)
  return () => setReady(false)
}, [])
```

正确的数据流保持单向：

```text
用户事件 -> 更新 styleMode -> render 选择 ruleText
-> insertion cleanup/setup -> 当前规则生效
```

```tsx
/** 根据用户选择更新规则模式。 */
function handleAccentClick() {
  setStyleMode('accent')
}
```

“样式已插入”不应成为新的 React State。当前 render 已经决定规则，insertion callback 只负责把资源同步到 Document。

## 十二、四个执行位置

| 位置 | 合适工作 | 不合适工作 |
| --- | --- | --- |
| render | 纯计算 JSX、类名和规则文本 | 写入 Document、创建长期资源 |
| `useInsertionEffect` | CSS-in-JS 运行时规则的插入与清理 | State 更新、Ref、业务 DOM、布局读取 |
| `useLayoutEffect` | 已提交 DOM 的布局读取和必要同步修正 | 充当通用样式生成通道 |
| `useEffect` | 请求、订阅和其他外部系统同步 | 要求在布局 Effect 前生效的运行时规则 |

选择顺序应从需求出发：能纯计算就留在 render；能静态表达就用 CSS；单元素动态值用 inline style；只有库级动态规则
需要 insertion；只有布局读取需要 layout；一般外部同步使用 passive Effect。

## 十三、多个组件的交错

多个组件同时更新时，不能假设 React 会先执行所有 insertion cleanup，再执行所有 insertion setup。公开文档允许不同
组件的 cleanup 与 setup 交错。固定版本测试观察到的模型可以概括为：

```text
组件 A：insertion cleanup -> insertion setup -> layout cleanup
组件 B：insertion cleanup -> insertion setup -> layout cleanup
之后进入本轮 layout setup
```

具体组件遍历顺序不是公共接口。资源层必须根据自己的节点身份和引用关系正确工作，而不能依赖“全局先清后建”的批处理
假设。稳定状态仍应满足：当前消费者拥有当前规则，没有 stale 节点，layout setup 前规则已经可用。

## 十四、StrictMode 边界

`useEffect` 和 `useLayoutEffect` 的公开页面明确描述了 StrictMode 开发环境的额外 setup/cleanup 检查；
`useInsertionEffect` 的公开页面没有把相同次数保证写入合同。因此不能编写“开发环境必定调用两次 insertion setup”的
断言。

可依赖的工程规则只有资源对称性：

- setup 每次都能独立建立本轮资源；
- cleanup 只释放本轮拥有的资源；
- 重复挂载、卸载和重新挂载后，稳定节点数仍正确；
- 验收最终 DOM 和样式，不验收某个固定开发调用次数。

固定 React 19.2.8 实现对 Strict Effects 的处理可以解释当前观察，但不能升级为未来版本的公共保证。

## 十五、节点身份与共享资源

### 1. 独立节点

每个组件实例创建自己的 style 节点时，cleanup 直接移除捕获节点：

```tsx
const styleElement = targetDocument.createElement('style')
targetDocument.head.appendChild(styleElement)
return () => styleElement.remove()
```

这适合最小示例和不共享规则的资源。

### 2. 共享节点

库级缓存可能让多个消费者共用一个规则节点。此时 cleanup 只能释放当前消费者的使用权：

```text
第一个消费者进入：引用数 0 -> 1，创建节点
第二个消费者进入：引用数 1 -> 2，复用节点
第一个消费者离开：引用数 2 -> 1，保留节点
最后消费者离开：引用数 1 -> 0，删除节点
```

引用计数、缓存键和规则表实现不属于这里的 API 教学，但所有权结论必须明确：任一消费者卸载时直接删除共享节点会破坏
其他消费者；全局 Set 去重与“每个 cleanup 都删除节点”不能同时成立。

## 十六、目标 Document

样式节点必须进入实际承载被样式化内容的 Document。iframe、独立窗口、Portal 宿主或多个 root 可能拥有不同目标：

```tsx
type RuntimeStyleOptions = {
  targetDocument: Document
  ruleText: string
}

/** 把运行时规则同步到显式指定的文档。 */
function useRuntimeStyle({ targetDocument, ruleText }: RuntimeStyleOptions) {
  useInsertionEffect(() => {
    const styleElement = targetDocument.createElement('style')
    styleElement.textContent = ruleText
    targetDocument.head.appendChild(styleElement)
    return () => styleElement.remove()
  }, [targetDocument, ruleText])
}
```

不要在 callback 中从业务 Ref 推导 `ownerDocument`，因为 Ref 尚未附加。目标 Document 应由 root、宿主配置或集成层在
更早的位置明确提供。用宿主全局 `document` 插入到错误文档时，节点计数可能看似正确，实际内容仍不会应用规则。

## 十七、SSR 与非浏览器环境

Effects 只在客户端运行，服务端 render 不执行 insertion callback。服务器需要输出首屏样式时，必须在 render 数据流中
收集“本次使用了哪些规则”，再由服务器输出流程生成 CSS；不能等待客户端 Effect。

```text
服务端：render 收集规则 -> HTML/CSS 输出
客户端：hydrate/render -> insertion callback 管理后续运行时规则
```

Hook 的类型签名也不保证全局存在 `document`。浏览器 DOM renderer 可以使用 `Document`，无 DOM renderer、服务端和
部分测试环境需要适配层或纯数据收集方式。`typeof document !== 'undefined'` 只能避免直接报错，不能把客户端资源同步
变成服务端样式收集方案。

## 十八、用法示例与 Demo

下面的 Demo 使用一个 `styleMode` State 和一个 insertion Effect。中性与强调模式会同时改变背景、边框和内边距，规则
只来自 `style[data-course-style="react-use-insertion-effect"]`，卡片没有 inline style。

观察顺序：

1. 初始模式为 `neutral`，Document 中只有一个课程 style 节点。
2. 切换为 `accent`，旧节点被清理，稳定状态仍只有一个节点。
3. 切回 `neutral`，规则文本与 computed style 恢复初始值。
4. 离开当前页面，组件卸载后课程 style 节点归零。
5. 重新进入，新的实例从 `neutral` 开始，不继承上次模式或节点。

:::demo{id="react.core.learn.intermediate.use-insertion-effect.css-in-js-style-insertion-demo"}
:::

Demo 采用独立节点模型，便于直接观察 cleanup。真实库若共享节点，应使用共享资源所有权，不能照搬“任一实例卸载即删除”。

## 十九、易错使用提示

:::pitfalls
### 错误：把 insertion Effect 当成默认 Effect

**触发条件：** 把请求、订阅、日志或一般 DOM 同步放入 `useInsertionEffect`。

**原因：** 忽略它只为 CSS-in-JS 运行时规则提供特殊插入窗口。

**后果：** 常规副作用占用特殊提交阶段，代码职责和时序都难以判断。

**错误示例：**

```tsx
useInsertionEffect(() => {
  analytics.track('panel-opened')
}, [])
```

**正确写法：**

```tsx
useEffect(() => {
  analytics.track('panel-opened')
}, [])
```

**验证方式：** 写出 callback 管理的外部资源；若不是浏览器运行时 CSS 规则，就排除本 Hook。

### 错误：所有动态值都创建 style 节点

**触发条件：** 单个元素的宽度、颜色或透明度也通过全局选择器和 `<style>` 注入。

**原因：** 没有区分静态规则、单元素动态值和库级共享规则。

**后果：** 增加 style 节点、样式重算和 cleanup 成本。

**错误示例：**

```tsx
useInsertionEffect(() => insertRule(`.meter { width: ${progress}% }`), [progress])
```

**正确写法：**

```tsx
<div className="meter" style={{ width: `${progress}%` }} />
```

**验证方式：** 若值只属于一个元素且 inline style 能表达，就不创建运行时规则。

### 错误：在 render 中追加节点

**触发条件：** 组件函数计算 JSX 时直接调用 `document.head.appendChild`。

**原因：** 把外部资源写入误当成纯计算。

**后果：** 中断、重试或重复 render 会留下重复节点，且没有可靠 cleanup。

**错误示例：**

```tsx
/** 错误：render 期间写入外部系统。 */
function RuntimeCard() {
  const styleElement = document.createElement('style')
  document.head.appendChild(styleElement)
  return <article className="runtime-card" />
}
```

**正确写法：**

```tsx
useInsertionEffect(() => {
  const styleElement = document.createElement('style')
  document.head.appendChild(styleElement)
  return () => styleElement.remove()
}, [])
```

**验证方式：** render 只计算规则文本；`createElement`、`appendChild` 和 `remove` 只出现在 insertion callback。

### 错误：用 useLayoutEffect 代替规则插入

**触发条件：** CSS-in-JS 库到布局 Effect 才把当前规则加入文档。

**原因：** 只看到“重绘前”而忽略“其他布局 Effect 前”的更窄窗口。

**后果：** 同一提交中的布局读取可能先看到旧规则。

**错误示例：**

```tsx
useLayoutEffect(() => insertRuntimeRule(ruleText), [ruleText])
```

**正确写法：**

```tsx
useInsertionEffect(() => insertRuntimeRule(ruleText), [ruleText])
```

**验证方式：** 用官方合同确认相对阶段；不要用截图或肉眼绘制速度推断执行顺序。

### 错误：读取 Ref 或测量业务 DOM

**触发条件：** callback 访问 `ref.current`、`getBoundingClientRect` 或业务节点查询结果。

**原因：** Ref 尚未附加，React 也不承诺业务 DOM 在 callback 前或后更新。

**后果：** 得到空 Ref、旧节点或不稳定尺寸。

**错误示例：**

```tsx
useInsertionEffect(() => {
  const width = panelRef.current?.getBoundingClientRect().width
  setRuleText(`.panel { width: ${width}px; }`)
}, [])
```

**正确写法：**

```tsx
useInsertionEffect(() => {
  const styleElement = document.createElement('style')
  styleElement.textContent = ruleText
  document.head.appendChild(styleElement)
  return () => styleElement.remove()
}, [ruleText])
```

**验证方式：** callback 只能接触自己的 style 资源，不能出现 Ref、布局读取、computed style 或业务选择器。

### 错误：在 setup 中调用 State setter

**触发条件：** 插入规则后设置 `ready`、节点数或当前主题 State。

**原因：** 把提交阶段资源同步当成新的数据源。

**后果：** 违反公开合同，开发构建可能给出 State 更新诊断。

**错误示例：**

```tsx
useInsertionEffect(() => {
  setStyleReady(true)
}, [])
```

**正确写法：**

```tsx
/** 从事件数据流更新规则模式。 */
function handleModeChange() {
  setStyleMode('accent')
}
```

**验证方式：** 检查 setup 及其调用链，确认没有任何 React State setter。

### 错误：在 cleanup 中调用 State setter

**触发条件：** 删除样式时写入“已卸载”或减少 React State 计数。

**原因：** 把资源释放反向连接到渲染数据流。

**后果：** 依赖变化或卸载期间触发额外更新，资源生命周期不再独立。

**错误示例：**

```tsx
return () => {
  styleElement.remove()
  setStyleReady(false)
}
```

**正确写法：**

```tsx
return () => {
  styleElement.remove()
}
```

**验证方式：** cleanup 只释放本轮节点或共享资源使用权，不写 React State。

### 错误：用全局选择器清理节点

**触发条件：** cleanup 查询并删除第一个带公共标记的 style 节点。

**原因：** 没有保留当前 setup 创建的节点身份。

**后果：** 可能误删其他实例的节点，同时留下自己的节点。

**错误示例：**

```tsx
return () => document.querySelector('style[data-runtime]')?.remove()
```

**正确写法：**

```tsx
const styleElement = document.createElement('style')
document.head.appendChild(styleElement)
return () => styleElement.remove()
```

**验证方式：** 同时挂载两个实例，卸载其中一个后，另一个实例的规则和节点必须保留。

### 错误：始终使用宿主全局 document

**触发条件：** 内容位于另一个同源 Document，规则却始终插入当前窗口的 `document.head`。

**原因：** 没有在集成层明确目标 Document，或试图在 callback 中从 Ref 推导目标。

**后果：** 宿主文档出现 style 节点，目标内容却没有应用规则。

**错误示例：**

```tsx
const styleElement = document.createElement('style')
document.head.appendChild(styleElement)
```

**正确写法：**

```tsx
const styleElement = targetDocument.createElement('style')
targetDocument.head.appendChild(styleElement)
```

**验证方式：** 在两个 Document 中分别检查 style 节点和被样式化元素的 computed style，结果必须同属目标 Document。

### 错误：混淆依赖语义与 StrictMode 调用次数

**触发条件：** 省略实际依赖、依赖每次新建对象，或断言开发环境一定执行固定次数的 insertion setup。

**原因：** 混淆 `Object.is` 比较、资源重新同步和未写入公共文档的实现观察。

**后果：** 产生 stale 规则、无意义重插入或随 React 版本变化而失败的脆弱检查。

**错误示例：**

```tsx
useInsertionEffect(() => insertRule(rules[styleMode]), [])
expect(insertionSetupCount).toBe(2)
```

**正确写法：**

```tsx
useInsertionEffect(() => insertRule(rules[styleMode]), [styleMode])
expect(document.querySelectorAll('style[data-runtime]')).toHaveLength(1)
```

**验证方式：** 依次执行模式变化、同值提交、卸载和重挂载，只断言稳定资源状态，不固定开发调用次数。
:::

## 二十、源码推导与适用场景

### 1. 公共事实

React 19.2 Reference 规定：setup 在组件进入 DOM 后、布局 Effect 前运行；依赖变化先执行旧 cleanup，再执行新
setup；卸载时执行 cleanup；callback 不能更新 State，Ref 尚未附加，也不能依赖业务 DOM 的更新时机。Effects 只在
客户端运行。

### 2. 固定版本实现

React 19.2.8 的 `ReactHooks.js` 把调用转交 dispatcher；`ReactFiberHooks.js` 为 mount/update 使用独立的
`HookInsertion` 标签；`ReactFiberCommitWork.js` 在 mutation 提交中处理 insertion cleanup/setup，再进入 layout
阶段。官方测试还覆盖多个组件的交错和非法 State 更新诊断。

### 3. 可以得到的推导

运行时规则应由 render 输入决定，insertion callback 只负责把对应资源同步进目标 Document。每轮 setup 捕获自己创建的
节点，或向共享资源层获取一个明确的使用权；cleanup 释放同一资源。这样依赖变化、卸载和重挂载都能回到可验证的稳定
状态。

### 4. 不能得到的结论

私有标签、遍历顺序和开发警告不是应用接口。不能据此读取 Fiber、断言组件间固定排序、断言 StrictMode 调用次数，或认为
通过 TypeScript 就证明了时机、Document 归属和 cleanup 正确。

### 5. 适用场景

- 适用：CSS-in-JS 库在客户端生成共享选择器，并要求布局 Effect 前可见。
- 不适用：普通组件样式、单元素动态值、请求订阅、布局测量、业务 DOM 读写和服务端规则收集。
- 重新评估：跨 Document、共享缓存和多个 root 的集成，需要先定义目标 Document 与资源所有权。

## 二十一、练习

:::exercise
### 练习一：选择样式方案

**要求：** 分别为固定按钮主题、滑块控制的单元素宽度、多个组件共享的动态选择器、服务器收集本次 render 使用的规则选择
静态 CSS、inline style、`useInsertionEffect` 或 render 数据收集，并写出排除其他方案的理由。

**验收：** 四个需求各自只有一个主方案；答案明确说明运行时 style 只用于库级共享规则，服务端不依赖 Effect。
:::

:::exercise
### 练习二：实现单节点同步

**要求：** 实现 `neutral` 与 `accent` 两套规则，只调用一次 `useInsertionEffect`。style 节点带稳定 `data-*` 标记，
cleanup 删除闭包捕获的节点，只有按钮事件可以调用 setter。

**验收：** 初始和每次模式切换后的稳定节点数都是 1；规则文本、背景、边框和内边距与当前模式一致；卸载后节点数为 0。
:::

:::exercise
### 练习三：分析依赖变化

**要求：** 依次提交 `neutral -> accent -> neutral`，再触发一次不改变模式的无关 render。记录每次稳定提交后的节点数、
规则文本和 computed style，并解释 `Object.is` 比较的作用。

**验收：** 模式变化会替换规则，同值依赖不会因该值本身触发重新同步；任何稳定状态都没有旧规则或重复节点。
:::

:::exercise
### 练习四：推理交错顺序

**要求：** 为组件 A、B 各写一个 insertion Effect 和 layout Effect，预测首次提交与同时更新时允许出现的阶段边界。不要把
组件遍历顺序写成公共保证。

**验收：** 答案同时包含“insertion 整体早于 layout setup”和“不同组件的 insertion cleanup/setup 可以交错”，并说明
资源层为什么不能依赖全局先清后建。
:::

:::exercise
### 练习五：设计 Document 与共享所有权

**要求：** 为两个同源 Document 各提供显式 `targetDocument`，再为两个消费者共享一个 style 节点设计引用释放过程。

**验收：** 每个节点只影响所属 Document；第一个消费者卸载时共享节点保留，最后一个消费者卸载时才删除；任何 cleanup
都不使用全局选择器猜测节点身份。
:::

:::exercise
### 练习六：划分验证能力

**要求：** 把“依赖值类型正确”“Hook 顶层调用”“callback 早于 layout”“cleanup 删除本节点”“服务端不执行 callback”
“目标 Document 正确”“稳定节点只有一个”“StrictMode 固定调用次数”分别交给 TypeScript、linter/静态检查、官方合同、
固定测试或浏览器运行时验证。

**验收：** 每项都写明证据来源和能力边界；不能用类型检查证明运行时顺序，也不能把固定实现观察写成 StrictMode 公共保证。
:::

## 二十二、本节小结

- `useInsertionEffect` 是 CSS-in-JS 库作者管理运行时规则的窄 API，不是普通 Effect 的更早版本。
- 固定规则用静态 CSS，单元素动态值用 inline style，只有库级动态选择器才考虑运行时 style。
- setup 可以返回 cleanup；依赖按 `Object.is` 比较，变化时先清旧资源再建立新资源。
- callback 早于布局 Effect，但不能更新 State、读取 Ref、测量布局或假设业务 DOM 更新时机。
- 独立节点由创建它的 setup 清理；共享节点按使用权释放，不能由任一消费者直接删除。
- 目标 Document 必须由集成层显式确定；服务端规则收集走 render 数据流。
- StrictMode 只验收对称 cleanup 后的稳定结果，不断言 insertion callback 的固定开发调用次数。
- 公共文档、固定源码、静态检查和浏览器结果各自证明不同层面的结论，不能互相替代。

## 二十三、参考资料

- [useInsertionEffect](https://react.dev/reference/react/useInsertionEffect) - API、依赖、cleanup、CSS-in-JS 范围和限制。
- [useEffect](https://react.dev/reference/react/useEffect) - 一般外部系统同步与 StrictMode 对照。
- [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect) - 布局读取和绘制前同步边界。
- [React 19.2.8 ReactHooks.js](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L103-L117) - 固定版本公共分派。
- [React 19.2.8 ReactFiberHooks.js](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2757-L2783) - 独立 insertion 标签的实现佐证。
- [React 19.2.8 ReactFiberCommitWork.js](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L2012-L2024) - insertion 与 layout 的固定提交阶段佐证。
- [React 19.2.8 Hooks tests](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L2566-L3049) - 时序、交错和错误诊断的官方测试。
- [React 19.2.8 server hooks tests](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMServerIntegrationHooks-test.js#L624-L638) - 服务端不执行 callback 的官方测试。
