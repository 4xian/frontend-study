---
id: react.core.learn.advanced.portal-tree-and-dom-placement
type: lesson
title: Portal 与 DOM 落点
summary: 使用 createPortal 改变宿主 DOM 落点，并区分 React 树、DOM 树、Context、事件与 State 身份。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 70
prerequisites:
  - react.core.learn.intermediate.ref-as-prop
  - react.core.learn.intermediate.context-providing-and-reading
  - react.core.learn.basics.event-handling
  - react.core.learn.intermediate.state-preservation-and-reset
related:
  - react.core.learn.basics.react-root-lifecycle
  - react.core.learn.intermediate.dom-refs
tags:
  - React
  - createPortal
  - Portal
  - Context
  - Event Propagation
  - State Identity
appliesTo: React 19.2
verifiedAt: 2026-08-16
objectives:
  - 能说明 createPortal 的参数、返回值和目标容器前置条件。
  - 能区分 Portal child 的 React 树位置与宿主 DOM 位置。
  - 能解释 Portal child 为什么仍读取调用处 Provider 的 Context。
  - 能区分 React 事件传播与原生 DOM 事件路径。
  - 能判断稳定或更换 domNode 时 Portal subtree 的 State 是否保留。
  - 能划分 Portal content 与目标容器的所有权和清理职责。
recap:
  - createPortal 从 react-dom 导入，只改变 children 的宿主 DOM 落点。
  - Portal child 仍属于调用处 React 树，Context 和 React 事件继续沿该树工作。
  - parentElement、contains、CSS 和原生 composedPath 仍按真实 DOM 树工作。
  - domNode 必须在调用时存在并保持需要的对象身份，非空断言不能代替运行时检查。
  - 相同 domNode 下执行普通 reconciliation，更换 domNode 会重建 Portal content。
  - React 管理 Portal content，目标容器的创建、连接和移除由容器所有者负责。
sources:
  - title: React createPortal Reference
    url: https://react.dev/reference/react-dom/createPortal
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 参数、返回值、DOM 放置、Context、React 事件与更换容器重建
  - title: React Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 组件位置、类型和 key 对 State 身份的影响
  - title: React Manipulating the DOM with Refs
    url: https://react.dev/learn/manipulating-the-dom-with-refs
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Ref 节点生命周期与 React 管理 DOM 的所有权边界
  - title: React DOM 19.2.8 Portal 官方测试
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactDOMFiber-test.js
    sourceType: official-test
    appliesTo: React DOM 19.2.8
    claims:
      - Portal 放置、同容器更新、事件传播、无效容器与卸载清理
  - title: DOM Event composedPath 标准
    url: https://dom.spec.whatwg.org/#dom-event-composedpath
    sourceType: specification
    appliesTo: DOM Living Standard
    claims:
      - 原生事件路径由浏览器 DOM 事件分发过程决定
---

# Portal 与 DOM 落点

## 一、学习目标

- 理解 Portal 只改变宿主 DOM 的放置位置，不会把 child 移出原 React 树。
- 使用 `createPortal(children, domNode, key?)` 将内容渲染到已经存在的目标容器。
- 分别判断 Context、React 事件、DOM 查询、CSS 和原生事件路径遵循哪棵树。
- 根据 React 位置、child 类型、key 与 `domNode` 身份判断本地 State 是否保留。
- 明确 React 管理 Portal content，容器所有者管理目标容器。

## 二、为什么使用 Portal

页面中的对话框、浮层、菜单、提示信息等内容，可能需要避开局部容器的 `overflow: hidden`、层叠上下文
或布局限制。如果把这些内容直接写在触发组件的 DOM 内部，视觉层可能被裁切或受祖先样式影响。

Portal 允许 React 保留原组件树中的所有权，同时把 children 生成的 DOM 放到另一个容器。它解决的是
“React 逻辑位置不变，宿主 DOM 另选落点”这一件事。

Portal 不会自动提供定位、遮罩、焦点管理、焦点恢复、滚动锁、键盘交互、ARIA 属性或动画。这些属于
对话框、Popover、Tooltip 等组件各自的完整交互设计。

## 三、`createPortal` 的公开合同

### 1. 导入、签名与返回值

`createPortal` 来自 `react-dom`：

```tsx
import { createPortal } from 'react-dom'
```

它的 TypeScript 形状可以概括为：

```tsx
createPortal(
  children: ReactNode,
  domNode: Element | DocumentFragment,
  key?: Key | null,
): ReactPortal
```

- `children` 是 React 可渲染的内容，可以是 JSX、组件、文本、数字、数组、Fragment 或空值。
- `domNode` 是 children 对应宿主 DOM 的目标容器。
- `key` 是可选的 React 身份信息，不是 DOM `id`，也不负责寻找目标容器。
- 返回值是一个 React node，应放入 JSX 或作为组件 render output 返回。

调用 `createPortal` 不会创建第二个 React Root。它返回的 Portal 仍是当前 render output 的一部分，
React 继续统一管理其更新和卸载。

### 2. 目标容器必须先存在

调用 API 时必须已经取得有效的目标对象。DOM 查询可能返回 `null`，TypeScript 非空断言只关闭静态
提示，不会改变运行时结果：

```tsx
// 错误：查询失败时仍会把 null 交给 createPortal。
const target = document.getElementById('overlay-root')!
return createPortal(<Panel />, target)
```

应先保存目标节点，只在节点就绪后创建 Portal：

```tsx
const [target, setTarget] = useState<HTMLElement | null>(null)

return (
  <>
    <section ref={setTarget} />
    {target ? createPortal(<Panel />, target) : null}
  </>
)
```

Callback Ref 在目标节点提交后提供真实 DOM 对象，State 更新触发下一次 render，此时才满足
`createPortal` 的前置条件。节点暂时不存在时返回 `null` 是正常分支。

### 3. Portal 不生成额外包装元素

以下代码不会在 DOM 中产生名为 `Portal` 的元素：

```tsx
<section>{createPortal(<button>保存</button>, target)}</section>
```

`button` 会直接成为 `target` 的 DOM descendant。调用处 `section` 保留 Portal 的 React 位置，但不包含
这个 `button` DOM。如果需要包装层，必须显式写入 children：

```tsx
createPortal(
  <div className="overlay-layer">
    <button>保存</button>
  </div>,
  target,
)
```

## 四、React 树与 DOM 树

### 1. 两棵树同时存在

假设 Provider 和 React 事件父级位于应用主内容中，目标容器位于另一个 DOM 分支：

```text
React 树：Provider -> ReactEventParent -> PortalChild

DOM 树：DemoRoot
          |- ReactEventParent
          `- PortalHost -> TargetA -> PortalChild DOM
```

`PortalChild` 的 React parent 是 `ReactEventParent`，它的 DOM parent 则是 `TargetA`。两种父子关系
同时成立，不应互相替代。

### 2. 哪些能力按 React 树工作

- Context 查找调用处上方的 Provider。
- React 合成事件向调用处的 React ancestors 传播。
- 组件 State 的保留与重置由 React 树位置、类型、key 和 Portal 容器身份共同决定。
- React 负责 Portal subtree 的 render、commit、更新与卸载。

### 3. 哪些能力按 DOM 树工作

- `parentElement` 返回真实 DOM 父元素。
- `contains()` 判断真实 DOM descendant 关系。
- `closest()` 从实际 DOM 祖先链向上查找。
- CSS 继承、选择器匹配、布局和层叠从目标 DOM 位置计算。
- 浏览器原生事件路径由真实 DOM 结构决定。

因此，Portal 可以保留 React Context，却不会保留调用处 DOM 祖先提供的 CSS 继承。若调用处设置了
字体颜色，而目标容器位于另一分支，Portal content 继承的是目标分支的样式。

## 五、Context 与事件传播

### 1. Context 沿调用处 React 树读取

Portal child 仍是调用处 Provider 的 React descendant：

```tsx
const ToneContext = createContext('海蓝')

function Owner({ target }: { target: HTMLElement }) {
  return (
    <ToneContext.Provider value="琥珀">
      <section>{createPortal(<PortalChild />, target)}</section>
    </ToneContext.Provider>
  )
}
```

即使 `target` 位于 Provider 对应 DOM 的外部，`PortalChild` 调用 `useContext(ToneContext)` 仍会得到
“琥珀”。Context 查找不读取目标容器附近的 DOM，也不读取那里是否存在另一个 Provider 对应元素。

Provider value 更新时，只要 Portal 身份和 child 身份保持连续，child 会读取新值并保留本地 State。
无需为了 Portal 重复传递同一份 Context 数据，也无需在目标容器上创建第二个 Root。

### 2. React 事件沿 React 树传播

Portal 内触发的 React `onClick` 会继续向调用处 React parent 传播：

```tsx
function Owner({ target }: { target: HTMLElement }) {
  function handleParentClick() {
    console.log('React parent')
  }

  return (
    <section onClick={handleParentClick}>
      {createPortal(
        <button onClick={() => console.log('Portal child')}>记录点击</button>,
        target,
      )}
    </section>
  )
}
```

点击按钮时，React handler 的顺序是：

```text
Portal child -> React parent
```

如果这种传播不符合组件行为，可以在 child handler 中调用 React 事件对象的
`event.stopPropagation()`，或调整 Portal 在 React 树中的调用位置。

### 3. 原生事件路径仍沿 DOM 树

React parent handler 能执行，不代表对应 parent DOM 被加入浏览器事件路径。对于前面的两棵树，原生
`event.nativeEvent.composedPath()` 可包含：

```text
button -> PortalChild DOM -> TargetA -> PortalHost -> DemoRoot
```

它不会因为 React 树关系而额外包含另一个分支中的 `ReactEventParent` DOM。两类证据应分开读取：

| 观察 | 典型结果 | 依据 |
| --- | --- | --- |
| `reactParent.contains(portalChild)` | `false` | DOM descendant 关系 |
| `target.contains(portalChild)` | `true` | DOM descendant 关系 |
| `portalChild.parentElement === target` | `true` | 真实 DOM 父元素 |
| React parent 的 `onClick` | 执行 | React 树传播 |
| 原生 `composedPath()` 包含 React parent DOM | `false` | 原生 DOM 路径 |

直接通过 `addEventListener` 注册在 `ReactEventParent` DOM 上的原生冒泡 listener，也不会跨越真实
DOM 分支收到 Portal 点击。React `onClick` 的传播结果不能套用到原生 listener。

## 六、容器身份与 State

### 1. 同一 `domNode` 下执行普通 reconciliation

Portal 不是每次父组件 render 都重建的临时内容。以下条件保持一致时，Portal subtree 按普通 React
规则继续协调：

- Portal 仍位于同一个 React parent 的可匹配位置；
- Portal 的 key 没有改变；
- `domNode` 仍是同一个 DOM Node 对象；
- child 的组件类型、位置和自身 key 没有改变。

因此，在同一 target 下更新 Provider value、更新父组件无关 State，或更新 child 自己的本地 State，
不会仅因为使用了 Portal 就重置 child。

稳定 `domNode` 只是必要条件，不是 State 永久保留保证。child 类型、React 位置或 key 改变时，普通
State 身份规则仍然生效。

### 2. 更换 `domNode` 会重建 Portal content

React 的公开合同明确说明：把 Portal 更新到不同的 `domNode` 会重新创建 Portal content。假设 A、B
是两个不同 DOM 对象：

```tsx
createPortal(<Panel />, activeTarget === 'A' ? targetA : targetB, 'stable-portal')
```

即使第三个参数保持不变，从 A 切到 B 时也应按新 subtree 理解：

- A 中原有 Portal DOM 被移除；
- B 中建立新的 Portal DOM；
- `Panel` 的本地 State 从初值开始；
- `Panel` 仍读取同一调用处 Provider 的 Context；
- 再从 B 切回 A，还会再次建立新 subtree，不会恢复之前留在 A 的本地 State。

这不是把同一个组件实例和 DOM 节点简单搬家。key 与 `domNode` 是不同的身份条件，固定 key 不能覆盖
容器对象变化。

### 3. 相同属性不等于相同对象

两个元素都写着 `id="portal-target"`，不代表它们是同一个 `domNode`。如果旧元素被删除，再创建一个
同名元素，新的对象身份仍会导致 Portal content 重建。

同理，在组件函数体中每次直接执行 `document.createElement('div')` 会在每次 render 得到新对象：

```tsx
// 错误：每次 render 都更换目标对象。
return createPortal(<Panel />, document.createElement('div'))
```

目标容器应由稳定 HTML、Callback Ref、对象 Ref 或容器所有者保存的稳定引用提供。

### 4. Portal key 与 child key 不在同一层

第三个参数标识 Portal 这个 React child：

```tsx
createPortal(<Panel />, target, 'settings-portal')
```

children 内部列表元素的 key 则标识 subtree 内部的 siblings：

```tsx
createPortal(
  items.map((item) => <Row key={item.id} item={item} />),
  target,
  'settings-portal',
)
```

两层 key 各自参与所在层级的匹配，不能互相替代，也都不是 DOM 属性。

## 七、有效目标与容器所有权

### 1. 有效目标的边界

TypeScript 调用边界是 `Element | DocumentFragment`。常见目标包括普通 HTML 元素和
`document.body`。`null`、文本节点或尚未取得的查询结果不是有效目标。

目标对象已经创建，不等于它已经连接到当前 document。React 可以把 Portal content 写入 detached
Element，但该内容不会自动显示；可见性取决于容器是否处于实际文档树中。

应用代码通常应选择已连接且用途明确的目标，避免把“API 能接收”误写成“用户一定能看到”。

### 2. React 管理 content，调用方管理 container

Portal 的所有权可以分成两层：

| 对象 | 主要所有者 | 职责 |
| --- | --- | --- |
| Portal subtree 与其宿主 DOM | React | 创建、更新、协调和卸载 children |
| 传入的目标容器 | 创建该容器的页面或组件 | 创建、连接、保持稳定并在合适时移除 |

停止渲染 Portal 或卸载所属 Root 时，React 会清理自己放入目标容器的内容，但不会因为一个 Portal
消失就删除调用方提供的共享容器。

### 3. 清理顺序

如果目标容器是临时创建的，正确顺序是：

1. 先让 Portal 从 render output 中消失，使 React 卸载 subtree。
2. 再由容器所有者移除不再使用的目标容器。

不要在 Portal 活跃时通过 `innerHTML = ''`、`replaceChildren()` 或外部 DOM 操作删除 React 管理的
children。这会绕过 reconciliation，使 React 保存的宿主关系与实际 DOM 不一致。

如果目标本来就是页面长期存在的共享节点，只需停止渲染当前 Portal，不应删除整个共享节点。

## 八、交互示例

### 1. 示例结构

示例在同一个 React 组件中渲染两个 DOM sibling 分支：

- React parent 分支负责调用 `createPortal`，并位于 Context Provider 内。
- Portal host 分支包含稳定的 Target A 和 Target B。
- Portal child 的 DOM 位于当前 target，React 位置仍在调用处 parent 下。

这种结构不需要额外 Root，也不需要 Effect 创建宿主节点。Callback Ref 在提交阶段取得 A、B 节点，
节点就绪后才渲染 Portal。

### 2. 观察顺序

1. 初始目标为 A；React parent `contains=false`，A `contains=true`。
2. 把 child 本地计数增加到非零，再切换 Context；本地计数与初始目标保持不变。
3. 只更新 owner 外壳；同一 target 下 child State 仍保留。
4. 点击“记录一次 Portal 点击”；React log 为 `Portal child -> React parent`。
5. 对照原生路径；它包含当前 target 和 Portal host，不包含 React parent DOM。
6. 从 A 切到 B；本地计数回到 `0`，本实例的初始目标变为 B。
7. 在 B 中增加计数后切回 A；再次建立新实例，初始目标变为 A，计数回到 `0`。
8. 点击“重置实验”；Context、目标、事件证据和 Portal 本地 State 都回到初值。

:::demo{id="react.core.learn.advanced.portal-tree-and-dom-placement.portal-placement-demo"}
:::

## 九、易错使用提示

:::pitfalls
### 把 Portal 当成第二个 Root

**触发条件：** 在目标容器上再次调用 `createRoot`，再手工同步 Props 或 Context。

**原因：** Portal 本来就是调用处 render output 的 React node，不需要另建 Root。

**后果：** 原树的 Context、事件和生命周期关系被切断，应用需要额外协调两个 Root。

**错误示例：**

```tsx
const targetRoot = createRoot(target)
targetRoot.render(<Panel tone={tone} />)
```

**正确写法：**

```tsx
return createPortal(<Panel />, target)
```

**验证方式：** `Panel` 直接读取调用处 Context，点击事件还能到达调用处 React parent。

### 认为 DOM 位置决定 Context

**触发条件：** 根据目标容器附近的 DOM 或样式判断 Portal child 应读取哪个 Provider。

**原因：** Context 查找沿 React ancestors，不沿 DOM ancestors。

**后果：** 重复 Provider、重复 Props，或读取到与设计不一致的数据来源。

**错误示例：**

```tsx
const tone = target.dataset.tone ?? 'default'
return createPortal(<Panel tone={tone} />, target)
```

**正确写法：**

```tsx
function Panel() {
  const tone = useContext(ToneContext)
  return <strong>{tone}</strong>
}
```

**验证方式：** 只更新调用处 Provider value，Portal child 随之更新且本地 State 不重置。

### 把 React 冒泡写成原生 DOM 冒泡

**触发条件：** React parent handler 执行后，断言该 parent DOM 位于 `composedPath()` 中。

**原因：** React 事件传播和浏览器原生事件路径属于两套关系。

**后果：** 对 `contains()`、`addEventListener` 和事件委托范围作出错误判断。

**错误示例：**

```tsx
function handleParentClick() {
  setNativePath(['Portal child', 'React parent'])
}
```

**正确写法：**

```tsx
function handleChildClick(event: ReactMouseEvent<HTMLButtonElement>) {
  setNativePath(event.nativeEvent.composedPath())
}
```

**验证方式：** React log 包含 parent，原生 path 包含 target 和 host，但不包含 parent DOM。

### 用 `contains()` 判断 React 祖先关系

**触发条件：** `reactParent.contains(child)` 返回 `false`，就认为 child 不属于该组件。

**原因：** `contains()` 只检查 DOM descendant 关系。

**后果：** 把正确的 Portal 结构误判为组件树断裂。

**错误示例：**

```tsx
const belongsToReactParent = reactParent.contains(portalChild)
```

**正确写法：**

```tsx
const parentContainsDom = reactParent.contains(portalChild)
const targetContainsDom = target.contains(portalChild)
```

**验证方式：** 前者为 `false`、后者为 `true` 时，调用处 parent 的 React `onClick` 仍能执行。

### 每次 render 都创建目标节点

**触发条件：** 在组件函数体内直接执行 `document.createElement()` 并作为 `domNode`。

**原因：** 每次 render 都得到不同对象，等价于持续更换 Portal 容器。

**后果：** child 反复重建，本地 State 持续回到初值。

**错误示例：**

```tsx
return createPortal(<Panel />, document.createElement('div'))
```

**正确写法：**

```tsx
const [target, setTarget] = useState<HTMLElement | null>(null)
return <>{target ? createPortal(<Panel />, target) : null}<div ref={setTarget} /></>
```

**验证方式：** 父组件无关 State 更新后，target 对象、child 本地 State 和初始目标都不变。

### 认为固定 key 能跨容器保留 State

**触发条件：** A/B 切换时第三个参数不变，就期待 child 实例不变。

**原因：** key 与 `domNode` 是不同身份条件；公开合同规定更换容器会重建 content。

**后果：** 把预期的 State 重置误判为 Bug。

**错误示例：**

```tsx
createPortal(<Editor />, activeTarget, 'editor')
// 错误预期：key 固定，所以 Editor 本地 State 一定保留。
```

**正确写法：**

```tsx
const [draft, setDraft] = useState('')
return createPortal(<Editor value={draft} onChange={setDraft} />, activeTarget, 'editor')
```

**验证方式：** A/B 切换后 child 实例重建；需要保留的 `draft` 由外部稳定 owner 继续提供。

### 用非空断言代替节点检查

**触发条件：** 对可能返回 `null` 的查询结果直接添加 `!`。

**原因：** `!` 只影响 TypeScript，不创建节点，也不改变运行时值。

**后果：** `createPortal` 收到无效目标并抛错。

**错误示例：**

```tsx
return createPortal(<Panel />, document.getElementById('missing')!)
```

**正确写法：**

```tsx
const target = document.getElementById('overlay-root')
return target ? createPortal(<Panel />, target) : null
```

**验证方式：** 目标不存在时组件返回空分支，目标存在时 content 才进入该节点。

### 认为 React 拥有目标容器

**触发条件：** 期待 Portal 卸载时自动删除调用方创建的整个 target。

**原因：** React 只拥有自己渲染到 target 内的 content。

**后果：** 临时容器残留，或共享容器被错误删除。

**错误示例：**

```tsx
return show ? createPortal(<Panel />, sharedTarget) : null
// 错误预期：show 变为 false 后 sharedTarget 也会被删除。
```

**正确写法：**

```tsx
return show ? createPortal(<Panel />, sharedTarget) : null
// sharedTarget 的所有者独立决定是否保留该共享节点。
```

**验证方式：** `show` 变为 `false` 后 Portal content 消失，`sharedTarget` 对象仍存在。

### 在 Portal 活跃时直接改写目标 DOM

**触发条件：** 使用 `innerHTML`、`remove()` 或 `replaceChildren()` 清除 Portal content。

**原因：** 外部操作绕过 React reconciliation。

**后果：** React 记录的宿主结构与实际 DOM 不一致，后续更新可能异常。

**错误示例：**

```tsx
target.replaceChildren()
```

**正确写法：**

```tsx
return showPanel ? createPortal(<Panel />, target) : null
```

**验证方式：** 把 `showPanel` 改为 `false`，让 React 自己移除 content，再处理临时 target。

### 认为 Portal 已经等于完整对话框

**触发条件：** 只把 DOM 放到页面外层，就认为对话框功能已经完成。

**原因：** Portal 只提供宿主 DOM 放置能力。

**后果：** 缺少语义、焦点、键盘、关闭、滚动与背景交互控制。

**错误示例：**

```tsx
return createPortal(<div>确认删除？</div>, target)
```

**正确写法：**

```tsx
return createPortal(<DialogSurface title="确认删除" onClose={handleClose} />, target)
```

**验证方式：** 除 DOM 落点外，另行检查对话框语义、焦点、键盘关闭和背景交互控制。
:::

## 十、源码推导与适用边界

### 1. 官方事实

React 的公开 Reference 规定：Portal 只改变宿主 DOM 放置，Context 与 React 事件仍按调用处 React 树
工作；更新为不同 `domNode` 时，Portal content 会重新创建。React 的 State 文档同时规定，组件类型、
位置与 key 仍决定普通 subtree 的身份。DOM 标准则分别定义了 `parentElement`、`contains()` 和
`composedPath()`，这些 API 只描述真实 DOM 关系。

React DOM 19.2.8 的官方测试进一步观察到：detached Element 可以接收 Portal content，同一容器可
连续更新 children，卸载 Root 会清空 React 放入容器的内容。它们是固定版本旁证，不扩大
`createPortal` 的公开参数合同。

### 2. 课程推导

把 Portal 调用放在 Provider 和 React event parent 内部，再把目标容器放到另一个 DOM sibling 分支，
可以同时验证两组独立关系：Context 与 React handler 证明逻辑所有权没有改变；`contains()`、
`parentElement` 与原生事件路径证明宿主 DOM 确实位于目标分支。

在调用位置、child 类型和 Portal key 都不变时，只切换 A/B `domNode`，本地 State 重置可以归因于容器
对象变化。若还同时改变 child 类型或 key，就无法单独判断重建由哪个身份条件触发。

### 3. 适用边界

Portal 适合 React 所有权不变、宿主 DOM 需要另选落点的界面。多个 Root 之间的数据协调、跨 document
或 iframe 放置、Shadow DOM 事件重定向、服务端渲染与 hydration 不属于本课结论。

对话框、菜单和提示层可以使用 Portal，但定位、层叠、焦点、键盘、滚动、背景交互、ARIA 与动画仍须
分别设计。Portal 的 React 树语义不能替代这些组件合同。

## 十一、练习

:::exercise
### 区分 React 关系、DOM 关系与容器身份

**要求：** 在同一个 Portal 中依次执行 Context 切换、本地计数、owner 更新、Portal 点击、A/B target
切换和重置；记录 Context、初始目标、本地计数、各层 `contains()`、`parentElement`、React event log
与原生 `composedPath()` 自有标记。

**验收：** 同一 target 下 Context 与 owner 更新不重置本地 State；React parent handler 能收到 Portal
点击，但其 DOM 不在原生路径中；A/B 切换重建 child 并把本地计数归零。
:::

## 十二、本节小结

- Portal 改变宿主 DOM 落点，不改变 children 在调用处 React 树中的位置。
- Context 和 React 事件沿 React 树工作；DOM 查询、CSS 与原生事件路径沿 DOM 树工作。
- `domNode` 必须在调用时存在，并在需要保留 subtree 身份时维持同一个对象。
- 相同 `domNode` 下执行普通 reconciliation；更换 `domNode` 会重建 Portal content。
- 固定 Portal key 不能覆盖容器变化，固定容器也不能覆盖普通 child 身份变化。
- React 管理 Portal content，目标容器的创建、连接和移除由容器所有者负责。
- Portal 不是第二个 Root，也不是完整对话框、菜单或浮层方案。

## 十三、参考资料

- [createPortal](https://react.dev/reference/react-dom/createPortal) - 参数、DOM 放置、Context、React
  事件传播与更换容器重建。
- [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) - 组件位置、
  类型与 key 对 State 身份的影响。
- [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) - Ref 节点
  生命周期与 React 管理 DOM 的所有权边界。
- [DOM Event composedPath](https://dom.spec.whatwg.org/#dom-event-composedpath) - 浏览器原生事件路径。
- [React DOM 19.2.8 Portal 官方测试](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactDOMFiber-test.js) - Portal 放置、更新、事件、容器校验与卸载行为。
