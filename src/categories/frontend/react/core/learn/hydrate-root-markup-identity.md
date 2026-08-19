---
id: react.core.learn.advanced.hydrate-root-markup-identity
type: lesson
title: hydrateRoot 与标记一致性
summary: 在独立的既有 React-compatible HTML 上建立 hydration Root、复用节点并接管交互。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 80
prerequisites:
  - react.core.learn.basics.react-root-lifecycle
  - react.core.learn.advanced.error-boundary-render-failures
related:
  - react.core.learn.basics.render-commit-and-state-snapshot
  - react.core.learn.basics.use-id-accessible-links
  - react.core.learn.advanced.use-sync-external-store-snapshot
tags:
  - React
  - hydrateRoot
  - Hydration
  - DOM Node identity
  - Error callbacks
appliesTo: React 19.2
verifiedAt: 2026-08-18
objectives:
  - 能说出 hydrateRoot 与 createRoot 的入口条件差异。
  - 能让首次客户端 React 输出与既有 HTML 标记逐项匹配。
  - 能用同一 DOM Node 身份和按钮 State 更新证明 hydration 已接管交互。
  - 能配置三个错误回调与 identifierPrefix，并说明每个 option 的责任。
  - 能区分 hydrate、后续 root.render、过早 root.render 与 root.unmount 的生命周期。
  - 能按结构、属性、文本和确定数据定位 mismatch，并判断 suppressHydrationWarning 的边界。
recap:
  - hydrateRoot(container, reactNode, options?) 面向已经存在 React-compatible HTML 的容器；空容器应使用 createRoot。
  - 首次客户端输出必须与已有标记匹配；mismatch 是需要修复的 bug，不是可依赖的 patch 机制。
  - 匹配时 React 复用已有 Node，并在同一按钮上接管事件与 State。
  - 三个 Root 错误回调分别记录 recoverable、Boundary 捕获和未捕获错误，不能只看 console 日志分类。
  - 多个 Root 使用 useId 时，identifierPrefix 必须与生成 HTML 时的前缀一致并避免相互冲突。
  - hydration 完成后的 root.render 可以更新同一树；过早调用会切换为客户端渲染。
  - root.unmount() 会清空容器并移除事件与 State；卸载后的 Root 不可再次 render。
sources:
  - title: React hydrateRoot Reference
    url: https://react.dev/reference/react-dom/client/hydrateRoot
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 签名、既有 HTML、首次一致性、Root options、mismatch 边界与 Root 生命周期
  - title: React 19.2.8 hydrateRoot 与 Root 实现
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/client/ReactDOMRoot.js
    sourceType: source-code
    appliesTo: React DOM 19.2.8
    claims:
      - hydration container、三个回调接线、Root 卸载和卸载后 render 错误
  - title: React 19.2.8 hydration 官方测试
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactServerRenderingHydration-test.js
    sourceType: official-test
    appliesTo: React DOM 19.2.8
    claims:
      - 匹配 Node 身份、事件接管与卸载后的容器状态
  - title: React 19.2.8 hydration 错误回调测试
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactDOMFizzShellHydration-test.js
    sourceType: official-test
    appliesTo: React DOM 19.2.8
    claims:
      - recoverable 与 caught 错误通道及 componentStack/cause 观察
  - title: WHATWG iframe srcdoc
    url: https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-srcdoc
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - srcDoc 构造独立 about:srcdoc Document
  - title: '@types/react-dom 19.2.4 client declarations'
    url: https://unpkg.com/@types/react-dom@19.2.4/client.d.ts
    sourceType: source-code
    appliesTo: '@types/react-dom 19.2.4'
    claims:
      - HydrationOptions、ErrorInfo、Root、hydrateRoot 的固定 TypeScript 合同
---

# hydrateRoot 与标记一致性

## 一、学习目标

- 区分“浏览器已经有 HTML”和“React 从空容器创建 UI”这两个入口条件。
- 用 `hydrateRoot(container, reactNode, options?)` 在既有标记上建立客户端 Root。
- 用严格的 DOM Node 身份比较和同一按钮的 State 更新证明 React 接管了交互。
- 配置三个 Root 错误回调与 `identifierPrefix`，说明每个 option 的责任。
- 区分 hydration、后续 `root.render`、过早 `root.render` 与 `root.unmount()` 的生命周期。
- 按结构、属性、文本和确定数据定位 mismatch，并判断 `suppressHydrationWarning` 的边界。

## 二、为什么需要

`createRoot` 适合空容器：React 负责从第一次 render 开始创建 DOM。`hydrateRoot` 的前提相反，容器里
已经有一份浏览器可以显示的 React-compatible HTML。React 的任务是对照这份快照建立客户端树、认领
匹配的节点，再把事件和后续更新接上去。

```text
独立 HTML Document 先解析
        |
        v
已有 #root / <main> / <button>，JavaScript 尚未接管
        |
        +--> hydrateRoot(#root, <App />)
                    |
                    +--> 复用匹配 Node + 接上 React handler
                    +--> 后续 State 更新由 React 管理
```

本课 Demo 把可信的静态 HTML 文件作为 iframe 的 `srcDoc`。它是“静态 React-compatible 输入快照”或
“server-like fixture”，不是本课运行时调用 `react-dom/server` 生成的产物。这样可以把已有标记和
hydration 调用分开观察，也不会污染站点自己的 Vue 文档。

## 三、核心概念

### 1. 入口签名：已有标记才用 hydrateRoot

`hydrateRoot` 从 `react-dom/client` 导入：

```tsx
import { hydrateRoot } from 'react-dom/client'

const root = hydrateRoot(container, <App />, {
  onCaughtError: recordCaughtError,
  onUncaughtError: recordUncaughtError,
  onRecoverableError: recordRecoverableError,
})
```

- `container` 是已经包含 React HTML 的 DOM 容器。
- `reactNode` 是首次客户端要渲染的 React 树。
- 三个可选回调接收 `error` 和带 `componentStack` 的 `errorInfo`。
- 返回的 Root 仍可调用 `render` 和 `unmount`，但 `unmount` 后不能再 `render`。

如果页面没有预存 React HTML，就使用 `createRoot(container).render(<App />)`。把 `hydrateRoot` 用在
空容器上，或者在调用前由同一段脚本写入 HTML，只是在伪造前置条件，不能证明独立文档先提供标记。

### 2. 首帧必须逐项匹配

React 首次客户端输出必须和既有 HTML 相同。Element 类型、属性、顺序和文本节点都属于这个合同。额外
空白、`typeof window` 分支、浏览器专用 API、随机数、时间或两端不同的数据，都可能让首帧 mismatch。

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {`计数：${count}`}
    </button>
  )
}
```

对应 fixture 必须先包含 `<button type="button">计数：0</button>`。不要为了“让两端看起来差不多”在
hydration 后立即重写 `innerHTML`，也不要把 `suppressHydrationWarning` 当成修复方案。它只覆盖一层
的警告，而且不会替你修补不一致的文本。

### 3. 节点身份和事件接管是两项证据

匹配 hydration 的直接证据不能只有“屏幕文字没变”。应在调用前保存真实 Node，在 React 首次提交后
同时检查：

```tsx
const before = frameDocument.querySelector('[data-testid="count-button"]')
const root = hydrateRoot(container, <Counter />)

// React ref 或提交回调拿到接管后的 Node。
const after = buttonRef.current
before === after // true：沿用了既有对象
```

然后先在 hydration 前点击按钮，静态 HTML 的计数仍为 `0`；hydration 后点击同一个 `before` 对象，
React 的 `onClick` 才会让 State 从 `0` 变为 `1`。对象身份证明没有用新节点冒充旧标记，State 变化
证明事件处理确实已经由 React 接管。

### 4. recoverable mismatch 不是自动修补合同

React 可以从部分 hydration 错误中恢复，并通过 `onRecoverableError` 报告结果。但官方仍要求像修复
其他 bug 一样修复 mismatch；最坏情况下事件可能绑定到错误的元素。属性差异也不保证被 patch。

因此 Demo 的 mismatch 场景只记录：

```text
场景：客户端 h1 与静态 fixture 不同
onRecoverableError：1
```

这说明当前 React patch 走过了 recoverable 通道，不说明“不一致可以留在生产环境”。正确的修复是让
首帧确定且一致；真正需要浏览器信息时，先渲染匹配的首帧，再在 Effect 中做第二次客户端更新。

### 5. 三个 Root 错误回调各有通道

同一个 Root 可以分别配置三个回调：

| 回调 | 记录什么 | 本课验证 |
| --- | --- | --- |
| `onRecoverableError` | React 已恢复的错误，例如 hydration mismatch | mismatch 场景只增加 recoverable |
| `onCaughtError` | 被 Error Boundary 捕获的 render 错误 | 局部 fallback 出现，caught 增加 |
| `onUncaughtError` | 越过所有 Error Boundary 的 Root 错误 | uncaught 增加，交给 Root 处理 |

三者都会给出 `errorInfo.componentStack`；部分错误还会在 `error.cause` 暴露原始原因。记录时保留
场景、通道、消息和 stack/cause 是否存在，不要只按 console 是否出现默认日志来判断回调是否触发。

### 6. unmount 是不可逆的 Root 终点

```tsx
const root = hydrateRoot(container, <App />)
const result = root.unmount() // undefined

container.childElementCount // 0
root.render(<App />) // 抛出 Cannot update an unmounted root
```

`unmount()` 会卸载整棵树、移除 React 事件处理和 State，并让旧 Node 脱离文档。先保存的旧按钮即使仍有
JavaScript 引用，也不再触发 React 更新。离开包含 iframe 或其他外部 DOM 的宿主页面时，应确保嵌套
Root 被卸载，不能把它留在已销毁的宿主节点里。

## 四、Root options

### 1. 四个常用 option

`hydrateRoot` 的第三个参数属于 Root 创建合同：

| option | 作用 | 关键边界 |
| --- | --- | --- |
| `onCaughtError` | 记录被 Error Boundary 捕获的错误 | `errorInfo` 还可能包含捕获它的 Boundary |
| `onUncaughtError` | 记录越过所有 Error Boundary 的错误 | Root 内容可能已经不能继续显示 |
| `onRecoverableError` | 记录 React 已恢复的错误 | 不只用于 mismatch，也不表示错误可以忽略 |
| `identifierPrefix` | 给当前 Root 的 `useId` 结果添加前缀 | 必须与生成既有 HTML 时使用的前缀一致 |

三个错误回调都接收 `error` 和 `errorInfo`。记录时至少保留通道、错误名、消息和
`componentStack`；`onCaughtError` 还可读取 `errorBoundary`。部分 recoverable error 会把原始错误放在
`error.cause` 中，因此不能只保存一段格式化字符串。

### 2. 错误回调不是 Error Boundary 的替代品

Root 回调负责报告，不负责恢复某块业务 UI。局部内容需要 fallback 时，仍应使用 Error Boundary。
`onCaughtError` 让监控系统知道 Boundary 捕获了什么；`onUncaughtError` 处理越过所有 Boundary 的错误；
`onRecoverableError` 记录 React 已经自行恢复的错误。

回调本身应保持短小，不在里面再次抛错或同步执行昂贵工作。需要发送日志时，先构造结构化记录，再交给
已有的异步上报层。

### 3. identifierPrefix 与多个 Root

页面只有一个 Root 且组件不使用 `useId` 时，`identifierPrefix` 通常没有可见效果。页面包含多个 Root，
或者既有 HTML 中已经包含 `useId` 生成的关联 ID 时，前缀就属于标记一致性合同：

```tsx
hydrateRoot(checkoutContainer, <Checkout />, {
  identifierPrefix: 'checkout-',
})

hydrateRoot(accountContainer, <Account />, {
  identifierPrefix: 'account-',
})
```

前缀解决的是 Root 之间的 ID 命名空间，不替代组件内部的 `useId`。生成 HTML 的一端和 hydration 一端
必须为同一个 Root 使用同一前缀；只在客户端临时添加前缀仍会造成 ID mismatch。

### 4. option 在 Root 创建时确定

`root.render(reactNode)` 只接收新的 React 节点，不能在更新时替换错误回调或 `identifierPrefix`。如果
这些创建选项确实需要变化，应先结束旧 Root，再以明确的新容器生命周期创建新 Root。普通 Props 变化
则直接通过 `root.render` 或组件 State 更新，不重建 Root。

## 五、标记一致性

### 1. 比较的是浏览器解析后的 DOM

React 面对的是 HTML parser 已经建立的 DOM，不是服务端模板的原始字符串。首次客户端树需要与这个
DOM 在元素类型、嵌套关系、属性、顺序和文本上匹配。浏览器会规范某些 HTML 结构，例如修正无效嵌套、
合并文本或移动表格相关节点；模板字符串看起来相同，解析后的树仍可能不同。

调试时先在 `hydrateRoot` 调用前查看真实 DOM：

```tsx
const container = document.getElementById('root')
console.log(container?.childNodes)
hydrateRoot(container!, <App />)
```

不要在检查前修改 `innerHTML`，否则看到的已经不是浏览器收到的初始快照。

### 2. 常见 mismatch 来源

| 来源 | 典型差异 | 修复方向 |
| --- | --- | --- |
| 数据版本不同 | 服务端用户名与客户端缓存不同 | 把同一初始数据交给两端 |
| 时间、随机数、locale | 文本每次运行不同 | 首帧使用确定值，挂载后再更新 |
| `typeof window` 分支 | 两端走不同 JSX | 保持首帧一致，把客户端差异延后 |
| 无效 HTML 嵌套 | 浏览器修正后的 DOM 与 JSX 不同 | 先修复 HTML 结构 |
| Root 内额外空白 | 多出文本节点 | 检查模板边界和 Root 周围换行 |
| 浏览器扩展改写页面 | hydration 前 DOM 被第三方改变 | 在干净环境复现并隔离扩展 |
| CSS-in-JS 配置不同 | class 或 style 标记不同 | 对齐样式生成配置和数据顺序 |

事件处理函数本身不会作为 HTML 属性序列化，但函数是否存在往往意味着组件分支不同。真正要比较的是
该分支最终产生的元素、属性和文本。

### 3. 两遍客户端输出

确实需要浏览器信息时，可以让首次 render 保持与既有 HTML 一致，再在 Effect 中进入客户端专用状态：

```tsx
function ClientAwareStatus() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return <span>{isClient ? '可使用浏览器能力' : '正在连接交互'}</span>
}
```

这会多一次 render，并且在 JavaScript 较慢时会让匹配首帧停留更久。它适合小范围必要差异，不应成为
所有组件的默认入口。外部环境快照也可以由 `useSyncExternalStore` 的服务端快照合同处理，但状态所有权
仍要单独设计。

### 4. suppressHydrationWarning 的窄边界

`suppressHydrationWarning` 只抑制当前元素一层的 hydration 差异警告，属于无法避免差异时的逃生口。
它不会递归忽略整棵子树，也不保证 React 修补不一致文本。时间戳等确实无法相同的单个叶子节点可以在
充分理解代价后使用；结构、属性、业务数据和事件目标不一致必须从输入处修复。

## 六、Root 生命周期

### 1. hydrateRoot 建立现有容器的 Root

`hydrateRoot` 返回 Root 对象。Root 创建后，React 开始认领现有 DOM 并接上线上的组件逻辑。返回 Root
不等于整棵 hydration 已经完成；不要依赖调用后的下一行代码判断所有后代都已提交。

应用通常只在入口保存 Root，用组件 State 和 Props 驱动更新。不要在每次交互时重新调用
`hydrateRoot`，同一个容器也不能同时属于两个 live Root。

### 2. hydration 完成后的 root.render

接管完成后可以调用 `root.render` 更新当前 Root：

```tsx
const root = hydrateRoot(container, <App version="initial" />)

// 在 hydration 已稳定后更新同一组件树。
root.render(<App version="updated" />)
```

当组件树形状与位置保持匹配时，React 按普通更新处理并保留 State。`root.render` 不会重新执行一次
hydration，也不会重新读取 Root options。改变组件类型、位置或 `key` 仍会按正常身份规则重置 State。

### 3. 过早 root.render 会放弃既有 HTML

如果在 Root 完成 hydration 前调用 `root.render`，React 会清除现有服务端 HTML，并把整个 Root 切换为
客户端渲染。这不是更新 hydration 输入的办法。需要新的初始数据时，应在生成既有 HTML 和首次客户端
树时就对齐；需要后续数据时，等接管完成后通过组件状态或正常 render 更新。

### 4. unmount 是终止操作

`root.unmount()` 同步请求卸载当前树，移除事件处理和 State，并返回 `undefined`。旧 Root 不能再次
`render`。如果标签页、第三方脚本或宿主框架会移除 Root 容器，应在容器被移除前调用 `unmount`，让
组件有机会完成 Effect cleanup。

## 七、TypeScript 合同

### 1. hydrateRoot 与 Root

固定类型声明可以概括为：

```tsx
type Container = Element | DocumentFragment | Document

interface Root {
  render(children: React.ReactNode): void
  unmount(): void
}

declare function hydrateRoot(
  container: Container,
  initialChildren: React.ReactNode,
  options?: HydrationOptions,
): Root
```

`hydrateRoot` 不接受 `null`。查询容器后应先缩窄，不要用非空断言掩盖入口缺失：

```tsx
const container = document.getElementById('root')
if (!container) throw new Error('缺少 #root hydration 容器')

const root = hydrateRoot(container, <App />)
```

### 2. 错误参数保持 unknown

错误回调的 `error` 是 `unknown`，读取 `message` 前先缩窄。`componentStack` 也是可选值：

```tsx
function recordError(
  error: unknown,
  errorInfo: { componentStack?: string },
): void {
  const message = error instanceof Error ? error.message : String(error)
  const stack = errorInfo.componentStack ?? ''
  report({ message, stack })
}
```

不要把所有值强制断言为 `Error`。库、跨 Realm 代码或非标准 throw 都可能交付其他值。

### 3. HydrationOptions 的额外边界

固定类型还包含 `formState`，固定 React DOM `19.2.8` 源码也会读取它，但 React `19.2` Reference 没有
把它列为普通应用的公开 option。类型和内部接线不足以把它升级为公共教学合同。本课不传入或观察
`formState`；服务端表单状态恢复由使用它的框架入口共同管理。

## 八、mismatch 诊断与修复

### 1. 先保存输入证据

在 React 可能恢复或替换节点前，记录容器的解析后结构、关键属性、文本和初始数据版本。恢复后的 DOM
只能说明 React 最终显示了什么，不能还原最初是哪一处不匹配。

### 2. 按结构到数据的顺序排查

1. 比较 Root 元素和第一层子节点数量。
2. 检查无效嵌套及浏览器自动修正的节点。
3. 比较 `id`、`className`、表单默认值和 ARIA 属性。
4. 比较每个文本节点，包括 Root 内的空白。
5. 对照生成两端输出的初始数据和格式化规则。
6. 在无扩展、固定 locale 和固定时区的环境复现。

先修复最早出现的差异。一个上层结构 mismatch 会让后续诊断产生大量连带信息。

### 3. 区分开发诊断与错误回调

开发环境通常提供更详细的 mismatch 信息；生产环境可能压缩消息。三个 Root 回调是应用可配置的错误
通道，但回调次数不是完整 DOM diff。把开发诊断、回调记录和 hydration 前 DOM 快照结合起来，才能
定位原因。

### 4. 修复后验证身份与交互

修复不能只以“warning 消失”为完成条件。重新验证关键 Node 身份仍被复用、事件处理只接管一次、State
从静态初值继续更新，并确认 recoverable 记录回到零。

## 九、隔离 fixture 的边界

### 1. 为什么使用 `about:srcdoc`

当前站点本身由 Vue 管理，直接在页面 Root 上调用 `hydrateRoot` 会与宿主所有权冲突。可信静态 HTML
通过 iframe `srcDoc` 先创建独立 `about:srcdoc` Document，随后 Demo 才取得其中的 `#root` 并执行
hydration。这样既能观察“先有 HTML”，也能在切换场景时销毁整个独立文档。

### 2. fixture 不是服务端产物证明

静态 `.html` 文件只模拟浏览器已收到 React-compatible HTML。它没有执行 `react-dom/server`，不能证明
streaming、RSC、框架数据序列化或生产部署正确。真正的 SSR 应在对应服务器或框架反馈环中验证。

### 3. 只使用可信 HTML

未加沙箱且需要读取 `contentDocument` 的 `srcDoc` 与宿主共享可访问上下文。Demo 只加载仓库内固定 HTML，
不能把用户输入或外部字符串直接交给 `srcDoc`。隔离实验负责生命周期，不提供不受信内容的安全边界。

### 4. 嵌套 Root 需要显式清理

切换场景时先 `root.unmount()`，再用新的 iframe Document 建立下一次输入。宿主组件离页时也要释放仍然
存活的嵌套 Root，避免 Effect、事件和闭包越过宿主生命周期。

## 十、用法示例或 Demo

按以下顺序运行 Demo，所有场景都会使用同一份静态 fixture 的新 iframe Document：

1. **匹配接管：** 在 `static` 阶段点击 iframe 内按钮，计数保持 `0`；点击“接管当前 fixture”，确认
   Main Node 和按钮 Node 均“严格相同”，三个错误通道为 `0`。
2. **事件接管：** 点击同一 iframe 按钮，确认 `React State / commit` 从 `0 / 1` 变为 `1 / 2`，而不是
   通过外层 Vue 或临时原生 listener 改写。
3. **Root 更新：** 在匹配场景点击“更新当前 Root”，确认标签从“初始树”变为“更新树”，计数仍为 `1`，
   Main Node 与按钮 Node 仍保持严格相同。
4. **mismatch：** 切换到“可恢复 mismatch”并接管，确认只增加 `onRecoverableError`，同时修复首帧仍是
   必须动作。
5. **Boundary / Root 错误：** 分别触发 Boundary 和 Root 按钮，确认只增加对应的 caught 或 uncaught，
   并观察 fallback 与 `componentStack` 证据。
6. **卸载：** 切换到“卸载 Root”，接管后先在 iframe 内点击一次“计数 +1”，确认
   `React State / commit` 为 `1 / 2`，再点击“卸载当前 Root”。确认容器为空、旧按钮断开、旧按钮点击
   不再更新、`unmount` 返回 `undefined`，并显示旧 Root 的 production render 错误。

:::demo{id="react.core.learn.advanced.hydrate-root-markup-identity.hydration-fixture-demo"}
:::

## 十一、易错使用提示

:::pitfalls
### 错误一：把空容器当成 hydration 目标

**触发条件：** 容器原本没有 React HTML，却直接调用 `hydrateRoot`。

**原因：** `hydrateRoot` 的合同是接管既有标记；空容器没有可认领的输入。

**后果：** 课程无法证明“HTML 先显示、React 后接管”，还可能得到无意义的恢复日志。

**错误示例：** 对没有预存标记的空容器调用 hydration。

```tsx
hydrateRoot(document.getElementById('root')!, <App />)
```

**正确写法：** 空容器使用 `createRoot`；已有可信 React HTML 才使用 `hydrateRoot`。

```tsx
createRoot(document.getElementById('root')!).render(<App />)
```

**验证方式：** 空容器路径使用 `createRoot`；独立 fixture 在 parser 建立标记后才进入 `hydrateRoot`。

### 错误二：首帧混入时间、随机数或浏览器分支

**触发条件：** 服务端快照和客户端首次 render 读取了不同的时间、随机数、locale 或 `window` 能力。

**原因：** 两次输出不是同一个确定的标记。

**后果：** mismatch、恢复成本和事件绑定到错误元素的风险增加。

**错误示例：** 首次 render 直接读取当前时间。

```tsx
return <p>{new Date().toISOString()}</p>
```

**正确写法：** 首次输出用确定输入；需要浏览器信息时先匹配首帧，再在 Effect 中更新。

```tsx
return <p>{label}</p>
```

**验证方式：** 让同一 fixture 重建两次，首帧结构、属性和文本都保持确定且 recoverable 为 `0`。

### 错误三：用 `innerHTML` 伪造独立 HTML

**触发条件：** 调用 hydration 前，脚本先把字符串写进同一个 target 容器。

**原因：** 这不是独立文档提供的输入，而是同一客户端脚本制造的输入。

**后果：** Demo 无法验证 HTML parser 先建立标记，也容易掩盖真实 SSR 交付边界。

**错误示例：** hydration 前把字符串直接写进目标容器。

```tsx
container.innerHTML = fixtureHtml
hydrateRoot(container, <App />)
```

**正确写法：** 使用可信静态 `.html` fixture 的 `srcDoc`，在 iframe `load` 后保存已有 Node。

```tsx
<iframe srcDoc={fixtureHtml} onLoad={handleFrameLoad} />
```

**验证方式：** hydration 前 URL 为 `about:srcdoc`，且代码没有向 target 写入 HTML 字符串。

### 错误四：把 recoverable 当成 mismatch 白名单

**触发条件：** 看到 `onRecoverableError` 被调用，就认为差异已经被安全修补。

**原因：** recoverable 只是当前错误被 React 报告和恢复的结果，不是首帧不一致的许可。

**后果：** 属性可能仍未 patch，事件也可能暂时落到错误元素。

**错误示例：** 收到 recoverable 后忽略首帧差异。

```tsx
hydrateRoot(container, <App />, { onRecoverableError: () => undefined })
```

**正确写法：** 记录场景和通道，回到首帧数据、结构和空白来源修复 mismatch。

```tsx
hydrateRoot(container, <App />, { onRecoverableError: recordRecoverableError })
```

**验证方式：** mismatch 场景只证明 recoverable 记录增加，同时把客户端初始输出改回与 fixture 一致。

### 错误五：把三个错误回调混成一条 console 计数

**触发条件：** 只看浏览器 console 是否有红字来区分 caught、uncaught 和 recoverable。

**原因：** Root options 替换了默认报告入口，console 不是回调合同本身。

**后果：** Boundary 错误可能被误报成 Root 错误，或把正常 recoverable 和应用崩溃混在一起。

**错误示例：** 三类错误都只写进一个无上下文计数器。

```tsx
window.errorCount += 1
```

**正确写法：** 在三个回调中写入结构化记录，并保留 `componentStack`、场景和消息。

```tsx
hydrateRoot(container, <App />, {
  onCaughtError: recordCaughtError,
  onUncaughtError: recordUncaughtError,
  onRecoverableError: recordRecoverableError,
})
```

**验证方式：** Boundary、Root 和 mismatch 场景分别只增加对应通道，记录包含 component stack 状态。

### 错误六：在 event handler 中直接抛出应用错误

**触发条件：** 点击按钮时直接在 `onClick` 函数体中 `throw`，并期待 Error Boundary 或 Root render
错误回调完成分类。

**原因：** Error Boundary 与 Root render 错误回调处理 render 阶段错误；event handler 本体抛错不是
同一个错误传播入口。

**后果：** 错误可能绕过本课的 caught/uncaught 观察路径，无法证明三个 Root 回调的边界。

**错误示例：** 在事件处理器本体直接抛错。

```tsx
<button onClick={() => { throw new Error('直接抛错') }}>触发错误</button>
```

**正确写法：** 事件只更新 State，由下一次 render 中的测试 child 抛错。

```tsx
<button onClick={() => setFailed(true)}>触发错误</button>
{failed ? <RenderFailure message="Boundary 内 render 失败" /> : null}
```

**验证方式：** Boundary 内外的测试 child 分别只增加 caught 或 uncaught，event handler 本体不抛错。

### 错误七：离页时只移除 iframe

**触发条件：** 外层课程组件离页时直接销毁 iframe，却没有先卸载仍存活的 hydration Root。

**原因：** iframe DOM 的宿主生命周期不会代替嵌套 React Root 执行 `root.unmount()`。

**后果：** Root 的 Effect、事件和闭包没有完成对称清理，返回页面时也无法证明从全新静态状态开始。

**错误示例：** 只移除 iframe DOM。

```tsx
iframe.remove()
```

**正确写法：** 外层 cleanup 先取出 live Root，再通过 `releaseRootAfterCommit` 把 `root.unmount()` 排到当前
宿主 commit 之后，最后让宿主销毁 iframe。

```tsx
return () => {
  const activeRoot = rootRef.current
  rootRef.current = null
  if (activeRoot) releaseRootAfterCommit(activeRoot)
}
```

**验证方式：** SPA 离页后旧 iframe、Root 与 Node 均无遗留；返回后阶段为静态，提交、Effect 和三个
错误计数都从 `0` 开始。

### 错误八：卸载后继续复用旧 Root

**触发条件：** `root.unmount()` 后缓存 Root，再调用 `root.render()`。

**原因：** unmount 是终止操作，Root 内部状态、事件和 DOM 已被移除。

**后果：** 得到 `Cannot update an unmounted root`，或者把旧 Node 引用误当成活跃 UI。

**错误示例：** 卸载后继续调用旧 Root。

```tsx
root.unmount()
root.render(<App />)
```

**正确写法：** 把旧 Root 置空；需要重新挂载时创建新的 iframe/容器和新的 Root。

```tsx
root.unmount()
rootRef.current = null
```

**验证方式：** unmount 场景确认容器为空、旧按钮断开，并捕获旧 Root render 的 production 错误。

### 错误九：hydrateRoot 后立即调用 root.render

**触发条件：** 创建 hydration Root 后，不等待现有标记完成接管，马上调用 `root.render` 传入新树。

**原因：** 尚未完成的 hydration 被普通 Root 更新打断。

**后果：** React 清除既有 HTML 并切换为客户端渲染，失去节点复用和静态首屏的价值。

**错误示例：** 在同一个调用栈中立即更新 Root。

```tsx
const root = hydrateRoot(container, <App version="initial" />)
root.render(<App version="updated" />)
```

**正确写法：** 首次树使用与既有 HTML 相同的数据；接管完成后的普通变化再通过 State、Props 或
`root.render` 更新。

```tsx
const root = hydrateRoot(container, <App version="initial" />)
// hydration 稳定后，外部入口才按业务事件调用 root.render。
```

**验证方式：** 保存 hydration 前的关键 Node；完成接管后仍为同一对象，且更新前没有进入 client-only
替换路径。

### 错误十：多个 Root 共用错误的 ID 前缀

**触发条件：** 多个 Root 都使用 `useId`，却省略前缀、复用同一前缀，或客户端前缀与 HTML 生成端不同。

**原因：** `identifierPrefix` 是 Root 级 ID 命名空间，也是首帧 ID 的一部分。

**后果：** 标签关联可能指向错误元素，或者 hydration 因 `id` 不一致进入 mismatch。

**错误示例：** 只在客户端为已有 HTML 临时增加前缀。

```tsx
hydrateRoot(container, <App />, { identifierPrefix: 'client-only-' })
```

**正确写法：** 为每个 Root 选择稳定且唯一的前缀，并让 HTML 生成端与 hydration 端使用同一值。

```tsx
hydrateRoot(container, <App />, { identifierPrefix: 'account-' })
```

**验证方式：** 对比 hydration 前后的关联元素 `id`、`htmlFor` 和 `aria-describedby`，确认前缀一致且
页面内没有重复 ID。
:::

## 十二、调试顺序

1. 确认容器在调用前已经包含 React-compatible HTML；空容器改用 `createRoot`。
2. 保存 hydration 前的关键 Node、解析后 DOM 和初始数据版本。
3. 检查最早的结构、属性或文本差异，不从最终恢复后的 DOM 反推输入。
4. 分别记录 recoverable、caught 与 uncaught，不把 console 数量当成唯一证据。
5. 在无扩展、固定 locale 和固定时区的环境复现非确定差异。
6. 修复后验证 Node 身份、事件接管、State 延续和 recoverable 归零。
7. 检查容器被外部移除前是否执行 `root.unmount()`。

## 十三、源码推导与适用场景

**官方事实：** React Reference 把 `hydrateRoot` 定义为已有 React HTML 的客户端入口，要求首次输出
匹配，并提供 Root options、后续 `root.render` 和 `root.unmount()` 合同。React DOM 19.2.8 的实现与
官方测试进一步旁证了匹配 host Node 的复用、事件接线、recoverable 错误排队和卸载后 render 错误。

**课程推导：** 本课把 HTML fixture 放在独立 `about:srcdoc` Document 中，先保存 `main` 与按钮对象，
再用 React commit 回调对比身份，并用按钮点击验证事件接管。五个场景共享同一输入快照，使变化只来自
首帧是否匹配、错误是否被 Boundary 捕获以及 Root 是否已卸载。

**适用边界：** 本课不讲 `react-dom/server`、streaming、RSC、Server Functions、全 document hydration、
Suspense hydration、metadata、资源预热或生产 SSR 部署。跨 Realm iframe hydration 只是当前 Demo 的
验证边界，不是 Reference 对跨文档兼容性的专门承诺。

## 十四、练习

:::exercise
### 1. 建立首帧匹配清单

**要求：** 为一个包含标题、表单标签、输入框和状态文本的页面，列出服务端/静态 HTML 与首次客户端
render 必须一致的结构、属性、文本和初始数据。

**验收：** 清单覆盖元素顺序、`id`/`htmlFor`、默认值、ARIA 关联、文本空白、locale 和数据版本；不把
事件函数对象列为 HTML 比较项。
:::

:::exercise
### 2. 分类 Root 错误

**要求：** 分别设计一个 mismatch、一个被 Boundary 捕获的 render error 和一个未捕获 render error，
预测三个 Root 回调的记录变化。

**验收：** 三个场景各自只增加 recoverable、caught 或 uncaught；记录包含消息和 component stack，且
说明 recoverable 不等于错误可以保留。
:::

:::exercise
### 3. 验证 root.render 的 State 延续

**要求：** 接管计数器后先把 State 改为 `1`，再用 `root.render` 更新一个不改变组件类型和位置的 label
Prop；对比更新前后的按钮 Node 和计数。

**验收：** label 更新，计数仍为 `1`，按钮仍是同一 Node；把组件类型或 `key` 改变后，能够解释为何
State 按正常身份规则重置。
:::

:::exercise
### 4. 设计多个 Root 的 ID 前缀

**要求：** 为 `checkout` 与 `account` 两个 Root 选择 `identifierPrefix`，并写出 HTML 生成端与
hydration 端的前缀对照。

**验收：** 两个 Root 的前缀不同，同一 Root 两端的前缀相同；页面内 `id` 唯一，`htmlFor` 和 ARIA
引用指向对应元素。
:::

:::exercise
### 5. 证明“先有标记，再有接管”

**要求：** 在匹配场景记录 hydration 前后的 Main/Button Node 身份、静态点击结果、React State/commit、
三个回调计数和 Effect setup/cleanup；再完成 mismatch、caught、uncaught、unmount 四个场景。unmount
场景必须先把计数更新为 `1`，再结束 Root 生命周期。

**验收：** 匹配场景中两个 Node 严格相同，静态点击不改计数，接管后同一按钮使计数 `0 -> 1`；mismatch
只进入 recoverable；Boundary 和 Root 错误分别只进入 caught/uncaught；unmount 后容器 child 数为 `0`、
旧按钮 `isConnected=false`、旧 Root render 抛错，且课程页面 console、pageerror 保持为空。
:::

## 十五、本节小结

- `hydrateRoot` 接管已有 React-compatible HTML；空容器应使用 `createRoot`。
- 首次客户端输出必须匹配既有标记；mismatch 需要修复，recoverable 不是自动 patch 合同。
- Node 严格相同和同一按钮的 State 更新必须一起作为 hydration 证据。
- `onRecoverableError`、`onCaughtError`、`onUncaughtError` 是三条不同的错误通道。
- `identifierPrefix` 是多个 Root 的 `useId` 命名空间，必须与 HTML 生成端保持一致。
- hydration 完成后的 `root.render` 是普通更新；过早调用会放弃既有 HTML 并切换客户端渲染。
- `root.unmount()` 会移除整棵树、事件和 State，旧 Root 不能再次 render。
- `srcDoc` fixture 只证明独立静态输入快照，不等同于真实 `react-dom/server` 输出。

## 十六、参考资料

- [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) - 签名、已有 HTML、首次一致性、
  Root options、mismatch 边界、`root.render` 与 `root.unmount`。
- [React DOM v19.2.8 Root 实现](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/client/ReactDOMRoot.js)
  hydration container、回调接线和卸载后 Root 错误。
- [React DOM v19.2.8 hydration 测试](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactServerRenderingHydration-test.js)
  节点身份、事件接管和卸载清理。
- [React DOM v19.2.8 hydration 错误测试](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactDOMFizzShellHydration-test.js)
  recoverable、caught 与 component stack/cause 观察。
- [WHATWG iframe srcdoc](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-srcdoc)
  独立 `about:srcdoc` Document 的构造规则。
- [`@types/react-dom@19.2.4` client declarations](https://unpkg.com/@types/react-dom@19.2.4/client.d.ts) -
  `HydrationOptions`、`Root` 与 `hydrateRoot` 的固定 TypeScript 合同。
