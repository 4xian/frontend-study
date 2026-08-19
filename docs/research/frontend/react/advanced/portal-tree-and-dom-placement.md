# `createPortal`：React 树语义与 DOM 放置

## 研究范围与证据分层

本文只研究 `createPortal(children, domNode, key?)` 的基础语义：children 的宿主 DOM 放在哪里，
children 在 React 树中属于谁，Context 和事件分别沿哪棵树工作，稳定或更换 `domNode` 如何影响
reconciliation 与 State，以及目标容器由谁创建、维持和清理。

文中严格区分四类证据：

- **公开合同**：React 官方 Reference 与 Learn 文档对应用代码承诺的行为，以 S1、S2、S15 为准。
- **类型合同**：`@types/react-dom` 面向 TypeScript 调用方暴露的签名，以 S3 为准。
- **源码旁证**：固定到 React / React DOM `19.2.8` 的实现与官方测试，只解释当前版本为何出现相应
  行为，不把内部名称或分支提升为跨版本 API，以 S4-S11 为准。
- **DOM 标准**：`parentElement`、`contains()` 和 `composedPath()` 的含义由 WHATWG DOM 规定，
  以 S12-S14 为准。

## 一手来源

| 编号 | 一手来源 | 主要用途 |
| --- | --- | --- |
| S1 | [React `createPortal` Reference（固定文档提交）](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react-dom/createPortal.md#L14-L61) | 参数、返回值、DOM 放置、Context、React 树事件传播、不同 `domNode` 会 recreated。 |
| S2 | [React State 与树中位置](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/preserving-and-resetting-state.md#L19-L22)；[位置、类型与 key 的规则](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/preserving-and-resetting-state.md#L1012-L1016) | 普通 React reconciliation 与 State 身份规则。 |
| S3 | [`@types/react-dom` 19.2.4 声明](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/7b9d6bd84e5829a33abf5b9eb14142ef9cffad5f/types/react-dom/index.d.ts#L14-L18) | `ReactNode`、`Element \| DocumentFragment`、`Key`、`ReactPortal`。 |
| S4 | [`ReactDOM.createPortal` 19.2.8 入口](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/shared/ReactDOM.js#L56-L68) | 调用容器校验并创建 portal 值；无效目标抛错。 |
| S5 | [Portal 值的 19.2.8 表示](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactPortal.js#L15-L32) | 当前实现保存 `key`、`children` 与 `containerInfo`。 |
| S6 | [Portal 的 19.2.8 update 分支](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactChildFiber.js#L617-L644)；[单个 Portal 的 key/container 匹配](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactChildFiber.js#L1728-L1761) | 相同 container 才能复用现有 Portal Fiber；不同 key 或 container 会创建新 Fiber。 |
| S7 | [React DOM 19.2.8 容器校验](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactDOMContainer.js#L19-L28)；[OSS feature flag](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/shared/ReactFeatureFlags.js#L208-L210) | 当前 node type 校验；源码保留的历史 comment-container 分支在该版本 OSS flag 中已禁用。 |
| S8 | [19.2.8 单 Portal 放置与卸载测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFiber-test.js#L215-L228) | detached `div` 可承载内容；调用处不承载 portal DOM；卸载清空 portal 内容。 |
| S9 | [19.2.8 固定容器 children 更新测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFiber-test.js#L374-L425) | 同一容器内可以更新文本、元素、数组或 `null`。 |
| S10 | [19.2.8 Portal 事件测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFiber-test.js#L760-L791) | portal child 的 React `onClick` 之后，调用处 React parent 的 handler 仍执行。 |
| S11 | [19.2.8 无效容器测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFiber-test.js#L949-L956) | `null` 与 Text node 被拒绝。 |
| S12 | [WHATWG DOM：`Event.composedPath()`](https://dom.spec.whatwg.org/#dom-event-composedpath) | 返回当前原生事件路径可见的 invocation targets。 |
| S13 | [WHATWG DOM：`Node.parentElement`](https://dom.spec.whatwg.org/#dom-node-parentelement) | 返回节点真实 DOM parent element。 |
| S14 | [WHATWG DOM：`Node.contains()`](https://dom.spec.whatwg.org/#dom-node-contains) | 按 DOM inclusive descendant 关系返回布尔值。 |
| S15 | [React：避免改写 React 管理的 DOM](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/manipulating-the-dom-with-refs.md#L650-L654) | 外部增删 React 管理的 DOM children 可能造成不一致或崩溃。 |

## 基本术语

- **React 树**：React 根据组件 render output 建立的逻辑树。Context、组件 State 的位置以及 React
  事件处理器之间的关系以它为基础。[S1][S2]
- **DOM 树**：浏览器 Node 之间的实际父子关系。`parentElement`、`contains()` 和原生事件路径以它
  为基础。[S12][S13][S14]
- **目标容器**：传给 `createPortal` 的 `domNode`。它由文档或应用提供，Portal 不负责创建这个
  Node。[S1]
- **宿主 DOM 节点**：React 为 JSX 中的元素、文本等管理的实际 DOM 节点。Portal 改变这些节点的
  放置位置，但不改变对应 children 的 React 树位置。[S1]

“React 父级”和“DOM 父元素”可能不是同一个对象。讨论 Portal 时必须始终说明是哪一种父子关系。

## `createPortal(children, domNode, key?)` 的公开合同

### 签名、参数与返回值

`createPortal` 从 `react-dom` 导入。当前 TypeScript 声明为：[S3]

```tsx
import { createPortal } from 'react-dom'

createPortal(
  children: ReactNode,
  container: Element | DocumentFragment,
  key?: Key | null,
): ReactPortal
```

- `children` 可以是 React 能渲染的 JSX、组件、Fragment、字符串、数字、数组或空值等 `ReactNode`。
  它不是一个要求调用方先构造好的 DOM Node。[S1][S3]
- `domNode` 是 children 的 DOM 落点，并且调用 `createPortal` 时必须已经存在。[S1]
- `key` 可选。React Reference 将它定义为该 portal 的 key；它参与 portal 在 React 父级中的身份
  匹配，不是 DOM `id`，也不改变目标容器。[S1][S2]
- 返回值是一个 React node，可以放进 JSX，也可以从组件返回。React 在 render output 中遇到它时，
  才把 `children` 的宿主 DOM 放进 `domNode`。[S1][S3]

`createPortal` 不是 `createRoot`：它没有创建另一棵独立 React 树，也不要求对目标容器再次调用
`createRoot`。Portal 返回值仍是调用处 React render output 中的一个 child。[S1]

### DOM 放置不产生额外 Portal 包装元素

若调用关系是：

```tsx
<section>
  {createPortal(<button>保存</button>, target)}
</section>
```

则逻辑关系与宿主关系可以同时写成：

```text
React 树：Section -> Portal -> button

DOM 树：  body
          |- root
          |  `- section
          `- target
             `- button
```

React 官方 DOM inspection 示例把 portal 的 `<p>` 直接放到 `<body>`，调用处的 `<div>` 内没有该
`<p>`；官方测试同样观察到 portal container 有内容而调用处父 `<div>` 为空。[S1][S8]

因此，Portal 不是一个名为 `Portal` 的 DOM 标签，也不会为了表达逻辑边界自动生成包装元素。若需要
包装元素，必须把它显式写进 `children`。[S1][S8]

## 两棵树上的语义

### Context 沿 React 树读取

Portal children 仍是调用它的组件的 React descendants，因此可以读取调用处上方 Provider 提供的
Context。目标容器是否位于 Provider 对应 DOM 元素内部，不参与 Context 查找。[S1]

当 Provider 的 value 更新时，portal child 按普通 Context 规则更新。若 portal 自身的 React 位置、
key、`domNode` 以及 child 的类型/位置均保持身份连续，这次 Context 更新本身不会把 child 变成另一
个实例；State 是否保留仍由普通 React 树身份规则决定。[S1][S2]

反过来，把目标容器放到另一个 DOM 区域，不会让 portal child 自动读取那个区域附近组件提供的
Context。DOM 邻近关系不是 React Context 的祖先关系。[S1]

### React 事件沿 React 树传播

React Reference 明确规定：Portal 中的事件按 React 树而不是 DOM 树传播。若调用处 React parent
有 `onClick`，点击 portal child 时，即使 parent 对应的 DOM 元素并不包含 child，该 parent handler
仍会执行。[S1]

React DOM `19.2.8` 的官方测试把 portal container append 到 `document.body`，点击其中 child 后依次
记录 child handler 和调用处 parent handler。这是当前版本对公开合同的直接旁证。[S10]

这里说的是 React 事件系统中的传播语义，不是浏览器把 DOM 树临时改写了。React Reference 也指出，
若这种传播不符合交互需要，可以在 portal 内停止 React 事件传播，或把 portal 调用位置移到 React 树
更高处。[S1]

### 原生 DOM 路径仍沿真实 DOM 树

WHATWG DOM 将事件 path 定义为浏览器 dispatch 过程维护的路径；`composedPath()` 返回该路径中对当前
调用方可见的 invocation targets。React 逻辑祖先不会仅因为 React `onClick` 收到了事件，就被加入
这条原生路径。[S12]

在不涉及 Shadow DOM 的普通文档树中，如果 portal child 位于 `target` 内，而调用处 parent DOM 位于
另一个分支，则应区分以下三项：[S1][S12][S13][S14]

| 观察 | 结果 | 原因 |
| --- | --- | --- |
| `portalChild.parentElement === target` | `true` | `parentElement` 读取真实 DOM parent。 |
| `target.contains(portalChild)` | `true` | child 是 target 的 DOM descendant。 |
| `reactParentElement.contains(portalChild)` | `false` | React 祖先并非 child 的 DOM 祖先。 |
| parent 的 React `onClick` 是否执行 | 执行 | React 事件按 React 树传播。 |
| `nativeEvent.composedPath()` 是否包含该 parent DOM | 不包含 | 它不在原生 DOM 事件路径上。 |

同理，直接用 `addEventListener` 注册在调用处 parent DOM 上的原生冒泡 listener，不会因为逻辑上的
React 祖先关系而收到该事件；原生 listener 仍只遵循 DOM event path。[S12]

## `domNode`、key 与 reconciliation

### 稳定 `domNode`：必要条件，不是 State 永久保留保证

React 的普通原则是：相同组件在 React 树相同位置保持身份；组件被移除、类型改变、位置改变或 key
改变时，State 可以被丢弃或重建。[S2]

固定到 React `19.2.8`，Portal update 只有在现有节点仍是 Portal 且 `containerInfo` 是同一对象时，
才复用现有 Portal Fiber 并继续 reconcile children。官方测试也展示了同一个 container 中连续更新
元素类型、文本、数组和 `null`。[S6][S9]

所以，同一 `domNode` 下的 portal children 并非每次父组件 render 都会自动重建；它们继续接受普通
reconciliation。但 State 保留还要求普通身份条件没有被破坏：[S2][S6]

- portal 在父级中的位置与 key 仍可匹配；
- child 的类型、位置与自身 key 仍可匹配；
- portal 没有先从 React 树中被移除；
- `domNode` 仍是同一个 DOM Node 对象。

“同一个对象”不同于“查询字符串相同”或“`id` 文本相同”。如果旧 target 被替换成另一个同名元素，
新旧 Node 即使都有相同 `id`，在 `19.2.8` 的 identity comparison 中仍是不同 container。[S6]

### 更换 `domNode`：公开合同要求 recreated

React Reference 直接说明：更新时传入不同 DOM node 会使 portal content 被 recreated。这不是只把
原有 DOM 节点从 A 搬到 B 的承诺。[S1]

React `19.2.8` 的源码旁证进一步显示，container identity 不相同时不会走复用旧 Portal Fiber 的
update 分支，而是创建新的 Portal Fiber；单 Portal reconciliation 同时要求 key 和 container 都匹配。
因此，旧 subtree 被卸载、新 subtree 在新 container 建立，子组件本地 State 随新实例从初值开始。
[S6]

固定相同的 portal key 不能覆盖 container 变化。key 和 `domNode` 是并列的身份条件：

- key 帮助 React 在同一 React parent 的 children 中匹配“是哪一个 portal”；
- `domNode` 决定该 portal 的宿主落点，并参与当前实现的 Portal identity；
- 二者任一无法匹配，都不能据此复用原 Portal subtree。[S1][S2][S6]

第三个参数的 portal key 与 `children` 内列表元素自己的 key 也不是同一层。前者标识 portal 这个
React child，后者标识 portal subtree 内部的 sibling children。[S1][S2]

### 常见更新情形

| 更新 | 预期身份结果 | 证据级别 |
| --- | --- | --- |
| 相同 React 位置、portal key、`domNode` 和 child 类型 | 普通 reconciliation；State 通常保留 | 公开 State 规则 + 19.2.8 源码旁证，[S2][S6] |
| 相同 `domNode`，但 child 类型或 child key 改变 | 按普通 React 规则重建对应 child，State 重置 | 公开合同，[S2] |
| portal key 改变 | portal 在父级中的身份改变，subtree 重建 | 公开 key 规则 + 19.2.8 源码旁证，[S2][S6] |
| `domNode` 换成另一个 Node 对象，portal key 不变 | portal content recreated，State 重置 | 公开合同 + 19.2.8 源码旁证，[S1][S6] |
| portal 从 render output 中消失 | subtree 卸载，React 管理的 portal DOM 被移除 | 普通 React 规则 + 19.2.8 官方测试，[S2][S8][S9] |

## 有效容器

### 公开文档、类型与当前运行时不是同一层合同

三层证据需要分别阅读：[S1][S3][S4][S7][S11]

| 层次 | 能确认的事实 |
| --- | --- |
| React Reference | `domNode` 必须是调用时已经存在的 DOM node；示例使用 `document.body` 或元素查询结果。 |
| TypeScript 声明 | `container` 的类型是 `Element \| DocumentFragment`。 |
| React DOM 19.2.8 校验 | 当前内部校验识别 Element、Document、DocumentFragment；源码中的历史 comment 兼容分支被该版本 OSS feature flag 禁用。 |
| React DOM 19.2.8 测试 | `null` 与 Text node 会抛出 `Target container is not a DOM element.`。 |

应用代码应以公开 Reference 和所用语言的公开类型为边界。当前 runtime validator 接受 `Document`，
或源码中仍存在但已被该版本 OSS flag 禁用的 comment 分支，都不等于 TypeScript API 承诺这些内部
情况永远可用；内部 node type 列表也可能随版本改变。[S3][S7]

### “已经存在”不等于“已经连接”

`document.getElementById()` 可能返回 `null`。TypeScript 的非空断言 `!` 只改变静态类型判断，既不会
创建元素，也不会阻止运行时把 `null` 交给 React；当前 `19.2.8` 对 `null` 会抛错。[S1][S11]

另一方面，React DOM `19.2.8` 的官方测试先用 `document.createElement('div')` 得到 detached element，
没有把它 append 到 document，Portal 仍能把 children 写进该对象。这说明在当前版本中，“Node 对象
已经创建”和“Node 已连接到 document”是两件事。[S7][S8]

detached container 中的内容不会因为 React 成功写入就自动可见。可见性取决于该 container 是否处在
实际文档树中；这是 DOM 放置问题，不是 React 树语义问题。[S8][S13][S14]

### 目标对象必须稳定

每次 render 都调用 `document.createElement()` 会得到新的 Node 对象。把这个新对象立即作为
`domNode`，等价于每次更新都更换 container，因而触发公开合同中的 recreated 行为；稳定 key 也不能
抵消它。[S1][S6]

目标可以来自预先存在的 HTML、稳定保存的 DOM 引用，或由拥有者在 Portal 首次 render 前建立。关键
不是取得方式，而是调用时非空、类型有效，并在需要保持 subtree 身份的更新之间维持同一 Node 对象。
[S1][S3][S6]

## 宿主节点生命周期与清理

Portal 管理的是渲染进目标容器的 children，不拥有调用方传入的目标容器本身。该所有权边界可由 API
形状和官方测试共同确认：调用方先提供 container；root unmount 后，测试继续持有同一个
`portalContainer` 对象，并观察到它的 `innerHTML` 被清空，而不是 container 对象被 React 删除。
[S1][S8]

合理的生命周期边界是：[S1][S8][S9]

1. **准备目标**：容器所有者先取得或创建稳定、有效的 `domNode`；需要显示时，再由所有者把它连接到
   合适的 DOM 位置。
2. **渲染期间**：React 在其中插入、更新和删除自己管理的 portal children。所有者不应同时用
   `innerHTML`、`replaceChildren()` 等方式改写这些 React 管理的节点。[S15]
3. **停止渲染 Portal**：portal 从 render output 消失或所属 React root unmount 时，React 卸载
   subtree，并移除它放入目标容器的宿主 DOM。`19.2.8` 的官方测试覆盖了这一步。
4. **清理目标**：若目标容器由应用临时创建，创建者在 Portal 已停止使用后自行移除它；若它是文档中
   共享或长期存在的节点，则不应因为某个 Portal 卸载而删除整个容器。

先由外部代码删除仍在使用的 target，不等于卸载了 Portal。它只会让 target 及其内容脱离当前文档；
React 仍持有传入的 Node 引用，而公开 API 没有承诺协调任意外部 DOM 篡改。应先结束相应 portal
subtree 的渲染，再清理由调用方拥有的 container。[S1][S8]

## 高价值错误清单

1. **把 Portal 当成新 Root。** Portal 返回调用处 React 树中的 React node；不要对同一目标再调用
   `createRoot` 来“完成 Portal”。[S1]
2. **寻找一个自动生成的 `<Portal>` DOM 包装元素。** React 直接把 children 的宿主节点放进目标；
   需要 wrapper 时必须显式渲染。[S1][S8]
3. **认为目标容器附近的 Provider 决定 Context。** Context 来自 portal 调用处的 React ancestors，
   不是 DOM ancestors。[S1]
4. **把 React 冒泡解释成浏览器事件路径穿过调用处 parent DOM。** React handler 可执行，但该 DOM
   元素不因此出现在 `composedPath()` 中。[S1][S10][S12]
5. **用 `contains()` 判断 React 祖先关系。** `contains()` 只回答 DOM inclusive-descendant 关系；
   返回 `false` 不否定 React 树中的父子关系。[S1][S14]
6. **期待调用处 parent DOM 上的原生 listener 收到 portal 点击。** 若它不在真实 DOM path 上，原生
   bubbling 不会经过它；React `onClick` 的结果不能套用给 `addEventListener`。[S1][S12]
7. **认为 key 不变即可跨容器保留 State。** React 公开合同明确说不同 `domNode` 会 recreated；当前
   源码也同时比较 key 与 container。[S1][S6]
8. **把相同 `id` 当成相同 container identity。** 两个 DOM Node 即使属性相同也是不同对象；替换
   target 会触发不同 container 分支。[S6]
9. **在每次 render 中创建目标节点。** 每次得到新对象，会让 portal content 持续重建。[S1][S6]
10. **认为固定 `domNode` 就无条件保留所有 State。** child 类型、位置或 key 的普通身份规则仍然生效。
    [S2][S6]
11. **用非空断言代替运行时存在性检查。** `querySelector(...)!` 不能把 `null` 变成 Element；当前
    runtime 会拒绝 `null`。[S1][S11]
12. **认为 target 必须已经 append 到 document 才有效。** 当前官方测试能向 detached Element
    渲染；未连接只意味着不可见，不等于对象不存在。[S7][S8]
13. **认为任意 Node 都是有效 target。** 当前 TypeScript 合同是 `Element \| DocumentFragment`，
    当前 runtime 测试明确拒绝 Text node。[S3][S11]
14. **认为 React 会创建或删除目标容器。** React 管理 portal content；临时 container 的创建、连接
    和最终移除由其所有者负责。[S1][S8]
15. **在 Portal 活跃时用 `innerHTML` 清空目标。** 这绕过 React 的 reconciliation，破坏 React 对
    自己宿主节点的所有权；应通过 render output 停止渲染 Portal。[S8][S9][S15]
16. **把“DOM 看起来移动了”当成同一组件实例被移动。** 更换 `domNode` 的公开语义是 recreated，
    本地 State 应按新 subtree 理解。[S1][S6]
17. **认为 Portal 自动完成完整 overlay。** Portal 只解决宿主 DOM 放置并保留 React 树语义；它不
    自动提供定位、层叠、焦点、键盘或无障碍行为。[S1]

## 明确不包含的边界

- 多个 React Root、跨 Root 事件与 Context、Root 间状态协调；
- SSR、streaming、hydration、`hydrateRoot`、Server Components 与 Server Functions；
- 跨 `document`、iframe、Shadow DOM、closed tree 与事件 retargeting；
- React 事件插件、delegation listener、Fiber event traversal 等内部事件实现；
- `flushSync`、Suspense、Transition、Offscreen/Activity 与并发调度；
- modal、popover、tooltip 库以及 Portal manager；
- z-index、stacking context、定位引擎、滚动锁、动画与 View Transition；
- 焦点陷阱、焦点恢复、键盘交互、`inert` 与 ARIA dialog 完整实践；
- 具体应用、课程正文或可运行 Demo 的实现。

这些主题可能使用 Portal，但不能由 `createPortal` 的核心合同直接推出，需各自独立研究。

## 核心结论

1. `createPortal` 改变 children 的宿主 DOM 放置位置，不改变它们在调用处 React 树中的逻辑位置。
   [S1]
2. Context 和 React 事件沿 React 树工作；`parentElement`、`contains()` 与原生 `composedPath()` 沿
   真实 DOM 树工作。[S1][S12][S13][S14]
3. 稳定 `domNode` 让 Portal 可以进行普通 reconciliation，但 State 是否保留仍取决于普通 React
   身份规则；更换 `domNode` 会 recreated，稳定 key 不能覆盖这条合同。[S1][S2][S6]
4. 调用时必须已有有效目标对象；“对象已创建”与“已连接到 document”不是同一条件。[S1][S7][S8]
5. React 清理自己渲染的 portal content，目标容器的创建、连接与最终移除仍由容器所有者负责。
   [S1][S8][S9]
