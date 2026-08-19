---
id: react.core.learn.advanced.lab-embedded-status-panel
type: lesson
title: 实战：嵌入式状态面板
summary: 组合外部 Store、受限命令句柄、布局测量与 Hydration，在清晰的宿主所有权边界内接管和释放状态面板。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 220
prerequisites:
  - react.core.learn.advanced.use-sync-external-store-snapshot
  - react.core.learn.intermediate.use-imperative-handle
  - react.core.learn.intermediate.use-layout-effect
  - react.core.learn.advanced.hydrate-root-markup-identity
related:
  - react.core.learn.basics.react-root-lifecycle
  - react.core.learn.intermediate.ref-as-prop
  - react.core.learn.advanced.document-metadata-hoisting
  - react.core.learn.intermediate.use-insertion-effect
tags:
  - React
  - 实战
  - useSyncExternalStore
  - useImperativeHandle
  - useLayoutEffect
  - hydrateRoot
  - 宿主集成
  - 资源所有权
appliesTo: React 19.2
verifiedAt: 2026-08-19
objectives:
  - 能把宿主 Document、外部 Store、React Root、面板 DOM、订阅和命令句柄分配给明确的所有者。
  - 能让静态 HTML、getServerSnapshot 与首次客户端 render 使用同一份确定数据。
  - 能用 useSyncExternalStore 读取缓存快照，并在 Root 卸载时释放 listener。
  - 能用 useImperativeHandle 只公开聚焦和重新测量命令，不把内部 DOM 节点交给宿主。
  - 能用 useLayoutEffect 在提交后、浏览器绘制前读取面板尺寸，并控制阻塞范围。
  - 能用 Node 身份、事件接管、错误计数、订阅数和资源计数验证集成结果。
  - 能区分卸载 React Root、保留宿主 Document 与创建新 Document 三种生命周期动作。
  - 能说明 React 集成合同与服务端渲染框架、持久化、数据请求和第三方状态库之间的边界。
recap:
  - 宿主拥有 Document、外部 Store 和容器外资源；React Root 只拥有容器内的声明式树。
  - useSyncExternalStore 依赖稳定 subscribe、缓存 getSnapshot 和与静态首帧一致的 getServerSnapshot。
  - Hydration 首次输出必须匹配既有 HTML；节点身份保持和事件生效分别证明复用与接管。
  - useImperativeHandle 应公开领域命令，不应把完整 DOM 节点或通用 DOM 写能力交给宿主。
  - useLayoutEffect 只读取已经提交的布局；它会阻塞绘制，应限制测量范围和更新次数。
  - root.unmount 会清理面板 DOM、订阅和 Ref，但不应删除容器外的宿主资源或外部 Store。
  - 同一 Document 内重建 Root 与创建新 Document 不同，资源和状态是否保留取决于所有者。
  - 集成验证应依赖确定状态和真实 DOM 证据，不依赖随机数、网络延时或 render 次数。
sources:
  - title: useSyncExternalStore
    url: https://react.dev/reference/react/useSyncExternalStore
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - subscribe、缓存快照、Object.is、getServerSnapshot 与 hydration 数据传递合同
  - title: useImperativeHandle
    url: https://react.dev/reference/react/useImperativeHandle
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 自定义 handle、依赖、Ref prop 与 DOM 暴露边界
  - title: useLayoutEffect
    url: https://react.dev/reference/react/useLayoutEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 浏览器绘制前执行、布局测量、同步更新、阻塞成本与服务端边界
  - title: hydrateRoot
    url: https://react.dev/reference/react-dom/client/hydrateRoot
    sourceType: official-reference
    appliesTo: React DOM 19.2
    claims:
      - 既有 HTML、首帧一致性、错误回调、节点接管与 Root 生命周期
  - title: React 19.2.8 Hooks implementation
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 外部 Store、layout effect 与 imperative handle 的固定实现旁证
  - title: React 19.2.8 hydration tests
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactServerRenderingHydration-test.js
    sourceType: official-test
    appliesTo: React DOM 19.2.8
    claims:
      - 匹配节点复用、事件接管与卸载后的容器状态
  - title: WHATWG iframe srcdoc
    url: https://html.spec.what.org/multipage/iframe-embed-object.html#attr-iframe-srcdoc
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - iframe srcdoc 创建独立嵌套 Document 的标准语义
  - title: MDN Document.activeElement
    url: https://developer.mozilla.org/docs/Web/API/Document/activeElement
    sourceType: specification
    appliesTo: Web platform
    claims:
      - 在对应 owner Document 中验证当前焦点元素
---

# 实战：嵌入式状态面板

## 一、学习目标

- 把宿主 Document、外部 Store、React Root、面板 DOM、订阅和 Ref 分配给明确的所有者。
- 在 React 代码加载前显示可阅读的静态面板，再用 `hydrateRoot` 接管同一批 DOM 节点。
- 让 `getServerSnapshot`、静态 HTML 和首次客户端 render 读取同一份确定数据。
- 用 `useSyncExternalStore` 订阅宿主状态，保持快照不可变、缓存和可比较。
- 用 `useImperativeHandle` 只公开聚焦和重新测量命令，保留内部 DOM 封装。
- 用 `useLayoutEffect` 读取已经提交的尺寸，并解释它为什么会影响浏览器绘制。
- 卸载 React Root 后验证面板 DOM、listener 和 handle 已清理，宿主资源仍然存在。
- 用真实节点身份、焦点 owner、错误计数和资源计数验证结果。

## 二、问题场景

一个已有控制台需要嵌入状态面板。控制台可能先由服务端、静态模板或其他前端系统提供 HTML，React
脚本稍后才加载。状态来自控制台已有的数据源，控制台还需要聚焦面板主按钮，并在容器变化后要求面板
重新测量。移除 React 功能时，控制台自己的样式、元数据和状态源不能被误删。

这个场景同时存在五个问题：

1. React 如何读取不属于组件 State 的状态源？
2. 静态 HTML 如何在接管时保持首帧一致？
3. 宿主如何执行少量必要命令，而不取得完整 DOM 控制权？
4. 面板如何在提交后读取真实尺寸，又不把布局读取放进 render？
5. Root 卸载时，哪些资源应该清理，哪些资源应该保留？

:::demo{id="react.core.learn.advanced.lab-embedded-status-panel.host-integration-demo"}
:::

建议依次观察静态状态、接管、状态发布、聚焦、重新测量、Root 卸载和新 Document。每一步都有独立
证据，不需要根据动画或执行速度猜测结果。

## 三、先画所有权边界

嵌入式 UI 的首要问题不是 Hook 选择，而是谁创建、谁持有、谁清理。先建立最小所有权图：

```text
宿主系统
├─ Document
├─ head 中的 meta 和 style
├─ 外部 Store
└─ React 挂载容器
   └─ hydration Root
      └─ StatusPanel
         ├─ Store listener
         ├─ 内部按钮 Ref
         ├─ 受限命令 handle
         └─ 布局测量 State
```

Root 拥有挂载容器里的 React 树，不自动拥有整个 Document。外部 Store 可以比 Root 活得更久；Root
卸载时应该退订，但不应该销毁 Store。宿主 head 中预先存在的 `meta` 和 `style` 也不属于面板 Root。

| 对象 | 创建者 | 正常清理者 | Root 卸载后的结果 |
| --- | --- | --- | --- |
| Document | 宿主 | 宿主导航或销毁嵌入容器 | 可以继续存在 |
| 外部 Store | 宿主 | 宿主 | 快照继续存在，React listener 归零 |
| head 资源 | 宿主 | 宿主 | 继续存在 |
| hydration Root | 集成入口 | 集成入口 | 不可再次 render |
| 面板 DOM | React Root | `root.unmount()` | 从容器移除 |
| command handle | React | Ref 生命周期 | `ref.current` 变为 `null` |
| Store listener | `useSyncExternalStore` | Hook cleanup | 从 Store 删除 |

## 四、用独立 Document 隔离宿主

状态面板可以放在 iframe 的独立同源 Document 中。这里的 iframe 不是为了跨域通信，而是为了给宿主
边界一个真实、可检查的 Document：

```tsx
<iframe title="状态面板宿主页" srcDoc={staticHostHtml} onLoad={handleFrameLoad} />
```

`srcDoc` 内容先由浏览器解析。`onLoad` 触发时，静态面板已经存在，集成入口可以保存真实节点对象：

```tsx
/** 保存 hydration 前的根节点与主按钮对象。 */
function handleFrameLoad(event: React.SyntheticEvent<HTMLIFrameElement>) {
  const frameDocument = event.currentTarget.contentDocument
  const container = frameDocument?.getElementById('embedded-status-root')
  const panel = frameDocument?.querySelector('[data-testid="embedded-status-panel"]')
  const primaryAction = frameDocument?.querySelector('[data-testid="panel-primary-action"]')
  // 保存 container、panel 和 primaryAction，等待接管。
}
```

同源是这里能够直接读取 `contentDocument`、节点身份和 `activeElement` 的前提。跨源 iframe 受同源策略
限制，需要通过 `postMessage` 等显式协议通信，不能沿用这里的直接 DOM 集成方式。

## 五、冻结首份状态快照

静态 HTML 显示的内容必须来自一份确定数据。例如：

```ts
const initialSnapshot = Object.freeze({
  revision: 0,
  status: 'healthy',
  activeServices: 3,
  label: '运行正常',
  message: '三个核心服务均在目标范围内。',
})
```

这份数据同时决定三处输出：

1. 宿主预先提供的静态 HTML。
2. `getServerSnapshot()` 在 hydration 首次 render 中返回的值。
3. `getSnapshot()` 在接管完成后返回的当前值。

如果三处各自维护一份字符串，即使含义相同，也可能在空格、标点、属性或数量上产生差异。更稳妥的
做法是把首份数据作为稳定合同，并让静态模板与组件都按同一字段结构输出。

## 六、实现缓存的外部 Store

外部 Store 至少需要缓存快照、读取函数、订阅函数和发布操作：

```ts
class StatusStore {
  private snapshot = initialSnapshot
  private readonly listeners = new Set<() => void>()

  /** 返回当前缓存对象，不在读取时创建副本。 */
  readonly getSnapshot = () => this.snapshot

  /** 返回静态 HTML 对应的首份快照。 */
  readonly getServerSnapshot = () => initialSnapshot

  /** 注册变化通知，并返回对称 cleanup。 */
  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** 替换为新快照，再通知当前 listeners。 */
  publish(nextSnapshot: PanelSnapshot) {
    this.snapshot = Object.freeze(nextSnapshot)
    for (const listener of this.listeners) listener()
  }
}
```

`getSnapshot` 必须缓存结果。React 会用 `Object.is` 比较前后快照；如果每次读取都创建新对象，即使数据
没变，引用也永远不同。正确的 Store 在数据未变化时返回同一对象，只有真实发布才替换引用。

Store 实例应该由宿主持有，而不是在面板 render 中创建。否则每次 render 都可能切换订阅源，旧 listener
的清理和新快照的身份都会变得难以判断。

## 七、理解 getServerSnapshot

`useSyncExternalStore` 的第三个参数用于服务端渲染和 hydration 的首次客户端 render：

```tsx
const snapshot = useSyncExternalStore(
  store.subscribe,
  store.getSnapshot,
  store.getServerSnapshot,
)
```

它不是“自动读取服务器”的函数。应用仍要决定如何把同一份初始数据传到客户端。常见做法是把序列化数据
放入 HTML，再用它创建客户端 Store。本节使用固定初始对象，重点观察首帧一致性。

接管前不应该发布新快照。如果静态 HTML 还是 revision 0，而 `getSnapshot` 已经变成 revision 1，React
需要在接管期间追赶不同数据，结果更难解释。先保持初始状态稳定，接管完成后再允许宿主发布更新。

## 八、让面板订阅宿主状态

面板只读取 snapshot，不复制一份镜像 State：

```tsx
function StatusPanel({ store }: { store: StatusStore }) {
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  )

  return (
    <section data-status={snapshot.status}>
      <strong>{snapshot.label}</strong>
      <p>{snapshot.message}</p>
    </section>
  )
}
```

再写一份 `useState(store.getSnapshot())` 会产生两个所有者。组件还需要手工同步、处理漏订阅窗口并决定
哪一份更新更可信。`useSyncExternalStore` 已经把“读取当前值”和“何时重新读取”组成一个合同，不需要
再用 Effect 搭一套镜像机制。

## 九、建立匹配的静态标记

`hydrateRoot` 的首次 React 输出必须与容器内既有标记匹配。需要逐项核对：

- element 类型与嵌套顺序。
- 文本节点与属性值。
- `className` 对应的 `class`。
- `data-*`、ARIA、按钮 `type` 等属性。
- 列表顺序和稳定 key 对应的结构。

静态按钮不需要包含 React 事件处理器。事件函数不在 HTML 中序列化；React 接管后会把事件系统连接到
匹配节点。静态文字、属性和结构才是首帧匹配内容。

不要用 `suppressHydrationWarning` 隐藏可修复的差异。它是局部逃生口，不会把不一致变成可靠合同，也
不保证 React 修补所有属性。

## 十、接管并保存 Root

只有在静态 Document、容器和 Store 都准备好后，才能建立 Root：

```tsx
const panelHandleRef = createRef<StatusPanelHandle>()

const root = hydrateRoot(
  container,
  <StatusPanel ref={panelHandleRef} store={store} />,
  {
    onRecoverableError: recordRecoverableError,
    onCaughtError: recordCaughtError,
    onUncaughtError: recordUncaughtError,
  },
)
```

集成入口要保存返回的 Root。一个容器只能由一个活跃 Root 管理；重复调用 `hydrateRoot` 不是更新方式。
接管后的数据变化由 Store 或组件 State 驱动，退出时由保存的 Root 执行 `unmount()`。

错误回调应该进入结构化记录。匹配路径的 `onRecoverableError` 计数应为零；如果出现记录，应先修复
首帧差异，不能因为页面看起来正常就忽略。

## 十一、用两类证据验证接管

“接管成功”至少包含节点复用和事件生效两类证据。

### 1. 比较真实 Node 身份

在 hydration 前保存静态对象，在面板第一次提交后从内部 Ref 取得对象：

```ts
originalPanel === committedPanel
originalPrimaryAction === committedPrimaryAction
```

两个比较都为 `true`，说明匹配节点被复用。只比较 `outerHTML` 不够，因为两个不同对象也可以拥有相同
字符串。

### 2. 操作同一个按钮

静态按钮在接管前没有 React handler。接管后点击同一按钮对象，让组件 State 从“确认次数：0”更新为
“确认次数：1”，说明事件已经连接。节点身份不变加上 State 更新，才能同时证明“没有替换节点”和
“React 已开始管理交互”。

## 十二、设计受限命令句柄

宿主需要聚焦内部按钮，但不需要拿到完整按钮对象。命令接口可以写成：

```ts
type StatusPanelHandle = {
  focusPrimaryAction: () => CommandEvidence
  remeasure: () => CommandEvidence
}
```

面板内部仍使用普通 DOM Ref：

```tsx
const primaryActionRef = useRef<HTMLButtonElement>(null)

useImperativeHandle(ref, () => ({
  /** 聚焦内部主按钮，不把按钮对象交给宿主。 */
  focusPrimaryAction() {
    primaryActionRef.current?.focus()
    return { command: 'focusPrimaryAction', result: '聚焦命令已执行' }
  },
  /** 安排一次提交后测量，不允许宿主直接读写内部 DOM。 */
  remeasure() {
    setMeasurementRequest((current) => current + 1)
    return { command: 'remeasure', result: '已安排重新测量' }
  },
}), [])
```

handle 只表达组件愿意长期支持的动作。不要暴露 `HTMLElement`、任意 selector、`innerHTML` 写入或通用
样式修改函数，否则宿主可以绕过组件 State 和 Store，下一次 render 又可能覆盖这些改动。

## 十三、验证焦点所属 Document

面板位于 iframe 时，主页面的 `document.activeElement` 通常只能看到 iframe 元素。要验证内部按钮，应
读取按钮自己的 `ownerDocument.activeElement`：

```ts
const button = primaryActionRef.current
button?.focus()
const focused = button?.ownerDocument.activeElement === button
```

使用 `ownerDocument` 能让组件适配主 Document、iframe 或其他同源 Document，不把全局 `document`
误当成所有节点的所有者。

聚焦命令还应保留可见焦点样式。`focus()` 成功只是 DOM 状态，键盘用户还需要清晰的 `:focus-visible`
轮廓和正确的按钮名称。

## 十四、把布局读取放在提交后

组件在 render 阶段还没有得到“这次 render 已经提交后的 DOM”。布局读取应放入 `useLayoutEffect`：

```tsx
const panelRef = useRef<HTMLElement>(null)
const [measurement, setMeasurement] = useState(initialMeasurement)

useLayoutEffect(() => {
  const panel = panelRef.current
  if (!panel) return

  const rect = panel.getBoundingClientRect()
  setMeasurement((current) => ({
    revision: current.revision + 1,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  }))
}, [snapshot.revision, measurementRequest])
```

这段 Effect 在提交后运行，因此读取的是已提交节点。它又发生在浏览器绘制前，所以同步 State 更新会让
React 立即再 render 一次，用户通常只看到最终布局。

## 十五、控制 useLayoutEffect 成本

`useLayoutEffect` 会阻塞浏览器绘制。正确使用需要同时满足以下条件：

1. 读取结果确实会影响首个可见布局或紧邻的命令结果。
2. 测量范围足够小，只读必要节点。
3. 依赖只包含会改变测量结果或显式要求重测的值。
4. 测量后的 State 不会让同一 Effect 无限重复。
5. 数据请求、Store 订阅、日志上传等工作留给其他机制。

如果测量只用于非关键统计，普通 `useEffect` 往往更合适，因为它不需要阻塞绘制。如果 CSS 能直接解决
布局，则不需要任何 DOM 测量。

## 十六、让命令触发声明式重测

宿主调用 `remeasure()` 时，不应该直接从 handle 返回一个长期持有的 DOM 节点。可以让命令只增加
请求 revision：

```tsx
function remeasure() {
  setMeasurementRequest((current) => current + 1)
}
```

State 更新产生新的提交，`useLayoutEffect` 再读取尺寸。这条路径保持单向：

```text
宿主命令
  -> 面板 State 更新
  -> React 提交
  -> layout effect 读取已提交 DOM
  -> 保存有限测量值
```

测量结果只需要保存宽、高和 revision。把 `DOMRect` 或节点对象交给宿主会扩大耦合，也可能让宿主持有
已经卸载的对象。

## 十七、发布外部快照

接管完成后，宿主可以发布下一份不可变快照：

```ts
store.publish(
  Object.freeze({
    revision: 1,
    status: 'attention',
    activeServices: 2,
    label: '需要关注',
    message: '同步服务等待宿主确认。',
  }),
)
```

发布顺序是“先替换快照，后通知 listeners”。通知本身不携带数据；React 收到通知后重新调用
`getSnapshot`。如果先通知再替换，Reader 可能读到旧对象，错过这次更新。

snapshot revision 表达外部数据版本，measurement revision 表达布局读取次数。二者属于不同状态向量，
不应该共用一个数字。状态更新可以触发测量，但一次手动重测不应该伪装成新的业务快照。

## 十八、卸载 React Root

宿主移除 React 功能时，使用保存的 Root：

```ts
root.unmount()
root = null
```

卸载后的直接结果包括：

- React 从容器移除面板 DOM。
- `useSyncExternalStore` 执行订阅 cleanup。
- Ref cleanup 让 `panelHandleRef.current` 变为 `null`。
- 组件 State 和布局测量 State 被释放。
- 旧 Root 不可再次 `render`。

宿主的外部 Store 仍然存在，因为它不是由面板创建。宿主 head 中的静态 `meta` 和 `style` 也继续
存在，因为它们在 Root 容器之外。清理越过所有权边界，会让同一 Document 中的其他功能失去资源。

## 十九、区分三种重建

“重新显示面板”可能有三种不同含义：

| 动作 | Document | Store | React State | 宿主资源 |
| --- | --- | --- | --- | --- |
| 同一 Root 内更新 | 保留 | 保留 | 按组件身份保留 | 保留 |
| Root 卸载后在同一容器建立新 Root | 保留 | 可选择保留 | 新 Root 从初始状态开始 | 保留 |
| 创建新 iframe Document | 新对象 | 通常新建 | 新 Root 从初始状态开始 | 由新 Document 重新解析 |

本节的刷新按钮创建全新 Document，因此静态节点、Store、计数和资源都回到初始状态。这个动作比重新
render 更彻底，不应在日常状态更新中使用。

## 二十、建立可观察证据

集成行为应由确定证据验证：

| 合同 | 直接证据 |
| --- | --- |
| 首帧匹配 | `onRecoverableError` 为 0 |
| 静态节点复用 | hydration 前后 Node 对象严格相等 |
| 事件接管 | 同一按钮让 React State 更新 |
| Store 订阅 | listener 从 0 变为 1 |
| Store 更新 | snapshot revision 和面板 DOM 同步变化 |
| 命令受限 | handle key 只有公开的两个方法，且不是 DOM 节点 |
| 聚焦成功 | 按钮的 `ownerDocument.activeElement` 指向按钮 |
| 提交后测量 | width/height 为有限正数，measurement revision 增加 |
| Root cleanup | 容器子节点、listener 和 handle 都归零 |
| 宿主资源保留 | Root 卸载后宿主 meta/style 计数不变 |

不要用固定毫秒数、随机数据或 render 次数作为成功条件。并发渲染、开发检查和设备速度都可能改变
调用次数或时间，但不应该改变最终 DOM、订阅和所有权合同。

## 二十一、可访问性与响应式边界

嵌入面板仍然属于完整页面的交互树：

- iframe 必须有描述内容的 `title`。
- 状态区使用清楚的文本，不只依赖绿色、黄色或红色。
- 命令入口使用原生 `button`，保留键盘顺序和禁用状态。
- 聚焦后显示可见轮廓。
- 长消息允许换行，固定格式区域设置 `min-width: 0`。
- 窄视口使用正常文档流或 Flexbox 换行，不依赖水平滚动完成主要操作。
- 200% 文本尺寸下，按钮文字、状态证据和面板内容不能相互遮挡。

iframe 内外是两个 Document。焦点可以进入 iframe，但键盘顺序、可读名称和焦点样式仍需要分别在两侧
成立。

## 二十二、TypeScript 边界

类型应该表达只读数据和有限能力：

```ts
type PanelSnapshot = Readonly<{
  revision: number
  status: 'healthy' | 'attention' | 'critical'
  activeServices: number
  label: string
  message: string
}>

type PanelMeasurement = Readonly<{
  revision: number
  width: number
  height: number
}>

type StatusPanelHandle = Readonly<{
  focusPrimaryAction: () => CommandEvidence
  remeasure: () => CommandEvidence
}>
```

`Readonly` 不能在运行时自动冻结对象，但可以阻止常见的 TypeScript 赋值错误。Store 发布时再使用
`Object.freeze`，可以让演示中的运行时对象也保持不变。

命令证据使用普通字符串和数字，不返回 `HTMLElement`。节点只在组件内部 Ref 和接管验证 callback 中
短暂使用，不成为宿主长期 API。

## 二十三、易错使用提示

:::pitfalls
### 错误：getSnapshot 每次创建新对象

**触发条件：** `getSnapshot()` 直接返回 `{ ...store.data }`。

**原因：** 每次读取都产生新引用，React 的 `Object.is` 比较持续得到 `false`。

**后果：** 产生无意义更新，严重时出现“结果应被缓存”的错误或更新循环。

**错误示例：**

```ts
const getSnapshot = () => ({ ...data })
```

**正确写法：**

```ts
const getSnapshot = () => cachedSnapshot
```

**验证方式：** 数据不变时连续两次读取，`Object.is(first, second)` 应为 `true`。

### 错误：静态 HTML 与首次快照不同

**触发条件：** 静态标记显示 revision 0，`getServerSnapshot()` 返回 revision 1。

**原因：** hydration 的首次 React 输出不能匹配既有节点内容。

**后果：** 进入 recoverable error，可能替换节点、延迟接管或连接错误事件。

**错误示例：**

```ts
const getServerSnapshot = () => latestSnapshot
```

**正确写法：**

```ts
const getServerSnapshot = () => initialSnapshot
```

**验证方式：** 接管路径的 recoverable error 为 0，静态节点对象保持相等。

### 错误：在组件 render 中创建 Store

**触发条件：** `function Panel() { const store = new StatusStore() }`。

**原因：** 每次 render 都可能得到新的订阅源和初始快照。

**后果：** 已发布状态丢失，listener 频繁切换，cleanup 难以对应。

**错误示例：**

```tsx
function Panel() {
  const store = new StatusStore()
  return <Reader store={store} />
}
```

**正确写法：**

```tsx
const store = createHostStore()
hydrateRoot(container, <Panel store={store} />)
```

**验证方式：** 普通面板更新前后 Store 对象身份保持不变。

### 错误：把内部 DOM 节点作为 handle

**触发条件：** `useImperativeHandle(ref, () => inputRef.current)`。

**原因：** 宿主得到完整 DOM API，组件无法限制写入和长期兼容面。

**后果：** 宿主绕过 State 修改 DOM，重渲染覆盖改动，卸载后还可能持有旧节点。

**错误示例：**

```tsx
useImperativeHandle(ref, () => buttonRef.current!)
```

**正确写法：**

```tsx
useImperativeHandle(ref, () => ({
  focusPrimaryAction: () => buttonRef.current?.focus(),
}))
```

**验证方式：** `Object.keys(handle)` 只包含领域命令，`handle instanceof HTMLElement` 为 `false`。

### 错误：在 render 中读取布局

**触发条件：** 组件函数执行时调用 `getBoundingClientRect()`。

**原因：** render 可能被重启或放弃，此时 DOM 不代表本次 render 的已提交结果。

**后果：** 读到旧尺寸、强制布局或让 render 带有外部副作用。

**错误示例：**

```tsx
const width = panelRef.current?.getBoundingClientRect().width
```

**正确写法：**

```tsx
useLayoutEffect(() => {
  const width = panelRef.current?.getBoundingClientRect().width
  setWidth(width ?? 0)
}, [snapshot.revision])
```

**验证方式：** 布局读取只出现在提交后的 Effect，render 函数保持纯净。

### 错误：layout effect 每次都触发自身依赖

**触发条件：** Effect 更新 `measurement`，依赖数组又包含整个 `measurement` 对象。

**原因：** 每次测量创建新对象，依赖变化再次执行 Effect。

**后果：** 同步更新循环阻塞绘制。

**错误示例：**

```tsx
useLayoutEffect(() => setMeasurement(readLayout()), [measurement])
```

**正确写法：**

```tsx
useLayoutEffect(() => setMeasurement(readLayout()), [snapshot.revision, measureRequest])
```

**验证方式：** 每次外部更新或显式重测只增加一次 measurement revision。

### 错误：用主 Document 验证 iframe 内焦点

**触发条件：** 只比较 `document.activeElement === innerButton`。

**原因：** iframe 内按钮属于另一个 Document，主 Document 的 activeElement 不是该内部节点。

**后果：** 聚焦成功却被误判为失败。

**错误示例：**

```ts
const focused = document.activeElement === button
```

**正确写法：**

```ts
const focused = button.ownerDocument.activeElement === button
```

**验证方式：** 命令执行后，内部 Document 的 activeElement 是主按钮。

### 错误：Root 卸载时删除宿主资源

**触发条件：** cleanup 扫描整个 `document.head`，删除宿主创建的 `meta` 或 `style`。

**原因：** 把 Root 生命周期误当成 Document 生命周期。

**后果：** 同一宿主中的其他界面失去样式、元数据或共享资源。

**错误示例：**

```ts
document.head.querySelectorAll('style').forEach((node) => node.remove())
```

**正确写法：**

```ts
root.unmount()
// 只清理由当前所有者明确创建的资源。
```

**验证方式：** Root 容器清空后，宿主资源计数保持不变。

### 错误：卸载后继续调用旧 Root 或 handle

**触发条件：** `root.unmount()` 后仍保存并调用旧引用。

**原因：** 卸载是 Root 终点，Ref cleanup 也会让当前 handle 失效。

**后果：** Root 更新抛错，命令操作脱离页面的旧节点。

**错误示例：**

```ts
root.unmount()
root.render(<Panel />)
```

**正确写法：**

```ts
root.unmount()
root = null
```

**验证方式：** 卸载后容器子节点为 0，listener 为 0，`ref.current` 为 `null`。

### 错误：用时间和 render 次数判断成功

**触发条件：** 等待固定毫秒数，或断言组件函数恰好执行一次。

**原因：** 设备速度、开发检查和并发渲染都会改变时间与调用次数。

**后果：** 结论不稳定，且没有证明最终所有权和 DOM 行为。

**错误示例：**

```ts
setTimeout(() => assumeHydrated(), 100)
```

**正确写法：**

```ts
const hydrated = originalButton === committedButton && recoverableErrors === 0
```

**验证方式：** 使用节点身份、最终 DOM、listener、handle 和资源计数组成证据。
:::

## 二十四、源码推导与适用场景

### 1. 可以依赖的公开规则

- `useSyncExternalStore` 通过 `subscribe`、`getSnapshot` 和可选 `getServerSnapshot` 连接外部状态。
- React 使用 `Object.is` 比较快照；非原始快照应在未变化时复用缓存对象。
- `useImperativeHandle` 允许 Ref 暴露自定义 handle，React 19 可把 `ref` 作为 prop 接收。
- `useLayoutEffect` 在提交后、浏览器绘制前运行，并可能阻塞绘制。
- `hydrateRoot` 要求首次输出匹配既有 HTML；Root 可以更新和卸载，但卸载后不能复用。

### 2. 从公开规则得到的工程判断

- Store、Root 和 Document 应分别建模，不能用一个“已挂载”布尔值代替三个生命周期。
- 命令 handle 越窄，组件内部 DOM 越容易演进；返回证据值比返回节点更稳定。
- Root 卸载后的 listener、Ref 和容器状态可以直接证明 cleanup 是否越界或遗漏。
- 独立同源 Document 适合验证 ownerDocument、Hydration 和宿主资源，不会污染外层页面。

### 3. 适用场景

- 旧系统逐块接入 React，而不是一次替换整个页面。
- 门户、控制台或管理平台嵌入由宿主数据源驱动的小部件。
- 浏览器扩展、桌面壳或微前端容器需要有限命令接口。
- 已有静态 HTML 需要在客户端接管交互，同时保留首屏内容。

### 4. 不适用边界

- 纯 React 页面优先使用组件 State、Reducer 或 Context，不必为了形式创建外部 Store。
- 完整服务端渲染还需要服务端输出、数据序列化、资源加载与部署合同，本节不替代框架方案。
- 跨源 iframe 需要显式消息协议和来源校验，不能直接读取内部 Document。
- 数据请求、缓存一致性、权限、持久化和冲突处理不由这些 Hook 自动提供。
- 多团队运行时隔离、版本协商和安全沙箱属于更高层的架构问题。

## 二十五、练习

:::exercise
### 扩展外部状态序列

**要求：** 新增一个“维护中”快照，包含稳定 revision、状态标签、服务数量和消息。保持快照不可变，并让发布顺序
循环可预测。

**验收：** 新状态能按确定顺序显示；数据不变时连续调用 `getSnapshot` 仍返回同一对象。
:::

:::exercise
### 修复首帧不一致

**要求：** 先让静态 HTML 的状态标签与 `getServerSnapshot` 不同，记录 recoverable error 和节点身份，再统一首份
数据。

**验收：** 修复后错误归零且节点复用，并能解释为什么隐藏警告不能替代修复。
:::

:::exercise
### 收窄 DOM Ref

**要求：** 从一个直接暴露 `HTMLButtonElement` 的写法开始，改成 `focusPrimaryAction()` 和 `remeasure()` 两个命令，
并列出宿主失去的通用 DOM 能力。

**验收：** handle 只包含两个命令，不返回节点，并能说明这种限制如何保护组件内部结构。
:::

:::exercise
### 增加提交后高度判断

**要求：** 在 layout effect 中读取面板高度，并把结果归类为 compact 或 expanded。依赖不能包含测量结果对象。

**验收：** 一次状态更新只产生一次新的 measurement revision，分类结果来自已提交节点的真实高度。
:::

:::exercise
### 编写资源所有权表

**要求：** 为 Document、Store、Root、listener、handle、面板 DOM 和 head 样式分别写出创建者、使用者与清理者，
再执行一次 Root 卸载。

**验收：** 面板 DOM、listener 和 handle 被清理，Store 与宿主 head 资源保留，表格中的清理者与结果一致。
:::

:::exercise
### 对比同一 Document 与新 Document

**要求：** 分别实现“同一容器建立新 Root”和“重建 iframe Document”，记录两条路径中 Store snapshot、宿主资源、
静态节点和组件 State 的保留差异。

**验收：** 两条路径的保留结果分别列出，并能用对象所有权而不是时间或调用次数解释差异。
:::

## 二十六、本节小结

- 先定义所有者，再组合 Hook；Document、Store 和 Root 是三个不同生命周期。
- 静态 HTML、`getServerSnapshot` 和首次客户端 render 必须共享确定的首份数据。
- 外部 Store 在未变化时返回缓存快照，真实发布先替换对象再通知 listeners。
- Hydration 要同时验证 Node 身份与事件接管，recoverable error 应保持为零。
- 命令 handle 只公开领域动作，不暴露完整 DOM 或通用写接口。
- 布局读取放进 `useLayoutEffect`，只测量已提交节点，并限制绘制阻塞成本。
- `root.unmount()` 清理面板 DOM、订阅和 Ref，不清理容器外宿主资源。
- 最终结果使用 DOM、订阅、handle、测量和资源计数证明，不依赖时间或 render 次数。

## 二十七、参考资料

- [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) - 外部 Store 订阅、快照缓存、
  `Object.is` 与 `getServerSnapshot`。
- [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle) - 自定义命令 handle、依赖与
  Ref prop。
- [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect) - 提交后布局读取、绘制前更新与阻塞
  成本。
- [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) - 既有 HTML、首帧一致性、错误
  回调与 Root 生命周期。
- [React 19.2.8 Hooks implementation](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js) -
  固定版本实现旁证。
- [React 19.2.8 hydration tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactServerRenderingHydration-test.js) -
  节点复用、事件接管与卸载行为的官方测试。
- [WHATWG iframe `srcdoc`](https://html.spec.what.org/multipage/iframe-embed-object.html#attr-iframe-srcdoc) -
  独立嵌套 Document 的标准语义。
- [Document.activeElement](https://developer.mozilla.org/docs/Web/API/Document/activeElement) - 对应 Document
  内当前焦点元素的读取方式。
