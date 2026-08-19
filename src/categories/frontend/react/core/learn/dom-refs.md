---
id: react.core.learn.intermediate.dom-refs
type: lesson
title: DOM Ref 与 Callback Ref
summary: 使用对象 Ref 和 Callback Ref 操作已提交节点、登记动态节点集合，并在节点失效时清理引用。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 80
prerequisites:
  - react.core.learn.intermediate.use-ref
  - react.core.learn.basics.list-rendering-and-key
related:
  - react.core.learn.basics.dom-props
  - react.core.learn.basics.event-handling
  - react.core.learn.intermediate.use-ref
tags:
  - React
  - DOM Ref
  - Callback Ref
  - useRef
  - Map
  - cleanup
  - Strict Mode
appliesTo: React 19.2 官方文档与 React 19
verifiedAt: 2026-08-16
objectives:
  - 能区分对象 Ref 与 Callback Ref，并根据固定节点和动态节点集合选择连接方式。
  - 能解释 render 只描述节点、React 在 commit 阶段连接或清理 Ref 的时机。
  - 能在用户事件中安全地聚焦、滚动和读取已提交 DOM 节点的几何信息。
  - 能保留节点可能为 null 或已经失效的分支，不把旧 DOM 引用当成永久有效对象。
  - 能用一个顶层 Ref 保存动态宿主节点 Map，而不在列表循环中调用 Hook。
  - 能用稳定数据 ID 连接 JSX key 与 Map 节点索引，并说明两种 key 的不同职责。
  - 能写出 React 19 Callback Ref 的 setup 与 cleanup，并理解 callback 身份变化和 Strict Mode 检查。
  - 能避免 Ref callback 隐式返回非 cleanup 值，以及用 DOM 节点或 Ref Map 驱动页面的错误。
recap:
  - 对象 Ref 适合连接一个已知宿主节点，Callback Ref 适合维护数量会变化的节点集合。
  - DOM Ref 是 commit 结果，render 期间不能把当前节点或节点 Map 当成渲染输入。
  - 节点尚未提交、已经移除或被替换时，旧引用都可能不可用。
  - 聚焦、滚动和点击后测量可以在用户事件中执行，页面显示结果使用普通 State 快照。
  - 动态列表使用一个顶层 Ref 保存 Map，每项 Callback Ref 成对执行 set 与 delete。
  - React 19 允许 Callback Ref 返回 cleanup；Strict Mode 会在开发环境额外检查一次清理对称性。
  - JSX 能描述的文本、属性和结构仍由 Props、State 与 JSX 管理，Ref 只承担必要的命令式节点操作。
sources:
  - title: React Versions
    url: https://react.dev/versions
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 确认 react.dev 当前文档版本口径
  - title: Manipulating the DOM with Refs
    url: https://react.dev/learn/manipulating-the-dom-with-refs
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - DOM Ref 的连接、聚焦、滚动与 commit 时机
      - 动态列表不能在 map 中逐项调用 useRef
      - 单个 Ref 中的 Map、Callback Ref setup 与 cleanup
  - title: Common components - ref callback
    url: https://react.dev/reference/react-dom/components/common#ref-callback
    sourceType: official-reference
    appliesTo: React DOM 19.2
    claims:
      - Callback Ref 的参数、返回 cleanup、卸载与 callback 更换合同
      - React 19 对旧 null 回调路径的兼容边界
  - title: useRef
    url: https://react.dev/reference/react/useRef
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - current 的初始值、DOM 节点写入和移除后恢复 null
      - 修改 Ref 不触发 render
  - title: StrictMode
    url: https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-ref-callbacks-in-development
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 开发环境额外执行 setup 与 cleanup 以发现不对称清理
  - title: React 19 Upgrade Guide
    url: https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - Ref callback 隐式返回非 cleanup 值会被 TypeScript 拒绝
  - title: React v19
    url: https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - React 19 新增 Ref cleanup 及旧 null 路径的迁移边界
  - title: Rendering Lists
    url: https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 动态列表使用来自数据的稳定 key
  - title: Components and Hooks must be pure
    url: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - DOM 副作用不能发生在 render 中
---

# DOM Ref 与 Callback Ref

## 一、学习目标

- 能为固定宿主节点声明对象 Ref，并通过 JSX 的 `ref` 属性建立连接。
- 能根据 render 与 commit 的分工判断节点何时可用、何时已经失效。
- 能在事件处理函数中聚焦、滚动和读取一次节点几何。
- 能把可见测量结果转换为普通 State 快照，而不让 JSX 读取 DOM 节点。
- 能为动态列表创建一个节点 `Map`，并按稳定数据 ID 查询当前节点。
- 能用 Callback Ref 成对完成节点登记和清理。
- 能正确解释 callback 更换、节点替换、卸载和 Strict Mode 对 Ref 生命周期的影响。
- 能识别 React 19 Callback Ref 的返回值类型限制。

## 二、为什么需要

React 根据 Props、State 和 JSX 维护页面结构。文本、属性、样式和子节点发生变化时，应该更新渲染数据，
让 React 提交新的 DOM 结果。

浏览器也提供一些不能只靠 JSX 描述的命令：

- 把键盘焦点移入输入框；
- 把已经存在的目标滚动进视口；
- 读取元素当前的尺寸和位置；
- 按稳定数据 ID 定位动态列表中的某个节点；
- 把宿主节点交给只接受真实 DOM 的窄接口。

这些操作需要取得 React 已经提交的宿主节点。对象 Ref 适合一个已知节点；Callback Ref 适合数量会增加、
删除或替换的节点集合。两者都不负责渲染页面，它们只连接当前提交结果。

## 三、Ref 与宿主节点的连接模型

### 1. 对象 Ref 连接一个节点

```tsx
const inputRef = useRef<HTMLInputElement | null>(null)

return <input ref={inputRef} />
```

`useRef` 创建对象，JSX 的 `ref` 属性建立连接。首次 render 时 `current` 是 `null`；React 创建
`<input>` 并完成提交后，把对应的 `HTMLInputElement` 写入 `inputRef.current`。如果节点从页面
移除，React 会把 `current` 恢复为 `null`。

Ref 不会按变量名搜索 DOM。只声明 `inputRef`，却没有把它传给宿主元素，`current` 不会自动得到节点。

### 2. Callback Ref 用函数接收节点

宿主元素的 `ref` 属性也可以接收函数：

```tsx
<li
  ref={(node) => {
    if (node === null) return
    console.log(node.dataset.itemId)
  }}
/>
```

节点接入时，React 以当前 DOM 节点调用函数。React 19 允许函数返回 cleanup；节点移除或 callback 被
替换时，React 调用 cleanup 撤销本次 setup。

```tsx
<li
  ref={(node) => {
    if (node === null) return
    itemNodes.set(item.id, node)

    return () => {
      itemNodes.delete(item.id)
    }
  }}
/>
```

对象 Ref 由 React 写入 `current`；Callback Ref 由应用代码决定如何登记节点。它们都发生在提交边界。

### 3. render 描述节点，commit 连接节点

React 更新分为 render 和 commit：

1. render 调用组件，计算当前 JSX 应描述什么；
2. commit 把变化应用到 DOM，并维护 Ref 连接。

首次 render 时，DOM 还没有创建；更新 render 时，页面也还没有按本轮 JSX 完成更新。因此，组件函数
执行期间读取 DOM Ref 可能得到 `null` 或上一轮节点，还会让 render 依赖 React 不跟踪的可变对象。

对象 Ref 在 commit 后得到节点。Callback Ref 的 setup 和 cleanup 也与宿主节点的接入、移除或替换相连。
节点 Ref 是提交结果，不是 render 输入。

### 4. 节点类型必须保留失效状态

```tsx
const panelRef = useRef<HTMLDivElement | null>(null)
```

`HTMLInputElement`、`HTMLDivElement`、`HTMLLIElement` 等类型决定可以调用哪些浏览器 API；
`null` 则表达真实生命周期：节点可能尚未提交、已经被条件分支移除、宿主类型已经替换，或所属组件已经
卸载。

动态节点 `Map` 的查询结果同样可能是 `undefined`：

```tsx
const node = itemNodesRef.current.get(itemId)
if (node === undefined) return
```

类型中的空值不是多余防御，而是节点连接合同的一部分。

## 四、对象 Ref：操作固定节点

### 1. 在点击事件中聚焦输入框

```tsx
import { useRef } from 'react'

/** 让明确的用户动作聚焦 React 已提交的输入框。 */
export function SearchFocusControl() {
  const inputRef = useRef<HTMLInputElement | null>(null)

  /** 聚焦当前仍挂载的搜索输入框。 */
  function handleFocus() {
    const input = inputRef.current
    if (input === null) return
    input.focus()
  }

  return (
    <section>
      <label htmlFor="course-search">课程搜索</label>
      <input id="course-search" ref={inputRef} />
      <button type="button" onClick={handleFocus}>
        聚焦输入框
      </button>
    </section>
  )
}
```

事件执行时页面已经提交，代码再读取当前 `ref.current`。局部变量 `input` 让一次操作使用同一个节点
快照；`null` 守卫保留节点可能失效的分支。

点击直接发起聚焦，不需要先设置一个“应该聚焦”的中间 State，再等待其他逻辑执行命令。

### 2. 把固定目标滚动进视口

```tsx
/** 把已经提交的固定目标滚动到最近可见位置。 */
function handleReveal() {
  const target = targetRef.current
  if (target === null) return
  target.scrollIntoView({ behavior: 'auto', block: 'nearest' })
}
```

`scrollIntoView()` 改变浏览器滚动位置，没有改写 React 管理的文本、属性或子节点，属于合适的命令式
操作。目标从首次提交起就存在时，用户事件可以直接访问当前节点。

如果同一事件先请求增加节点，再在下一行读取这个新节点，React 可能还没有完成对应提交。此时 Ref 仍可能
指向旧结果或保持空值。不要把 State setter 当成同步 DOM 命令；应先确认操作目标已经提交。

### 3. 读取一次几何并发布 State 快照

```tsx
type Measurement = {
  width: number
  height: number
}

const [measurement, setMeasurement] = useState<Measurement | null>(null)

/** 读取当前节点，并把有限的普通数值发布为页面快照。 */
function handleMeasure() {
  const target = targetRef.current
  if (target === null) return

  const rect = target.getBoundingClientRect()
  setMeasurement({
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  })
}
```

`getBoundingClientRect()` 返回调用当时的浏览器测量。State 只保存界面需要显示的普通数值，不保存
DOM 节点或可变的 `DOMRect` 对象。后续 JSX 读取 `measurement`，而不是在 render 中访问节点。

点击后采样一次几何，与在 render 中持续读取布局是不同问题。前者有明确用户事件边界，不会让渲染结果
直接依赖可变 DOM。

### 4. 继续让 JSX 管理可描述的 DOM

取得节点不等于接管节点。文本、属性和结构仍应由 State 与 JSX 表达：

```tsx
const [disabled, setDisabled] = useState(false)

return <button disabled={disabled}>{disabled ? '不可操作' : '可以操作'}</button>
```

不要通过 Ref 设置 `textContent`、`className`、`style`、`disabled`，也不要手动删除 React 管理
的子节点。这些操作会让真实 DOM 偏离 JSX，后续提交可能覆盖手工修改，或与已经改变的结构发生冲突。

## 五、Callback Ref：登记动态节点集合

### 1. 为什么不能为每项调用 `useRef`

动态列表的数量会随数据增加、删除或重排。下面的写法违反 Hooks 顶层调用规则：

```tsx
items.map((item) => {
  const itemRef = useRef<HTMLLIElement | null>(null)
  return <li ref={itemRef}>{item.title}</li>
})
```

Hook 调用次数和顺序必须在每次 render 中保持稳定，不能由列表长度决定。动态集合只需要在组件顶层创建
一个 Ref，并让它保存整张节点索引：

```tsx
const itemNodesRef = useRef(new Map<string, HTMLLIElement>())
```

### 2. 用稳定 ID 连接列表身份与节点查询

```tsx
<li key={item.id} ref={createItemRef(item.id)} data-item-id={item.id}>
  {item.title}
</li>
```

- JSX `key={item.id}` 帮助 React 在插入、删除和重排时识别数据条目；
- `Map` 中的 `item.id` 让事件处理函数查询该条目的当前宿主节点。

两者可以使用同一个稳定数据 ID，但职责不同。`key` 不会自动建立节点索引，`Map` key 也不能替代
React 的列表身份。

### 3. 为每个条目成对执行 setup 与 cleanup

```tsx
import { useRef } from 'react'

type LessonItem = {
  id: string
  title: string
}

type LessonListProps = {
  items: LessonItem[]
}

/** 用一个节点 Map 管理数量会变化的课程列表。 */
export function LessonList({ items }: LessonListProps) {
  const itemNodesRef = useRef(new Map<string, HTMLLIElement>())

  /** 为一个稳定条目 ID 创建对应的 Callback Ref。 */
  function createItemRef(itemId: string) {
    return (node: HTMLLIElement | null) => {
      if (node === null) return

      const itemNodes = itemNodesRef.current
      itemNodes.set(itemId, node)

      return () => {
        itemNodes.delete(itemId)
      }
    }
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} ref={createItemRef(item.id)} data-item-id={item.id}>
          {item.title}
        </li>
      ))}
    </ul>
  )
}
```

setup 捕获当前稳定 ID 和同一张 `Map`，执行 `set`；cleanup 对同一 ID 执行 `delete`。新增条目
提交为 DOM 后才会登记，条目移除后旧记录才会删除。

### 4. 在用户事件中按 ID 定位节点

```tsx
/** 按稳定 ID 定位当前已经提交的列表节点。 */
function handleLocate(itemId: string) {
  const node = itemNodesRef.current.get(itemId)
  if (node === undefined) return

  node.focus({ preventScroll: true })
  node.scrollIntoView({ behavior: 'auto', block: 'nearest' })
}
```

事件读取的是当前提交结果。如果条目已经删除，cleanup 会让 `Map.get(itemId)` 返回 `undefined`。
聚焦和滚动使用节点索引；列表增加、删除和排序继续由 State 与 JSX 描述。

### 5. 用 State 发布索引检查快照

修改 Ref 中的 `Map` 不会请求 render。需要在页面显示检查结果时，在明确事件中读取普通值：

```tsx
const [registeredIds, setRegisteredIds] = useState<string[]>([])

/** 发布不包含 DOM 节点的索引检查快照。 */
function handleInspect() {
  setRegisteredIds([...itemNodesRef.current.keys()])
}
```

State 保存 ID、数量或一致性文本，不保存 DOM 节点。Callback Ref 自己也不调用 State setter，否则节点
登记会请求 render，新 callback 又触发清理和 setup，形成不必要甚至持续的更新反馈。

### 6. callback 身份变化会重新清理和登记

`createItemRef(item.id)` 每次 render 都产生新函数。React 收到不同 callback 时，会清理旧 callback 建立
的连接，再以当前节点调用新 callback。只要 setup 与 cleanup 对称，最终 `Map` 仍只包含当前节点。

代码不能依赖 callback “每个节点只执行一次”，也不能用执行次数计算业务数据。应该检查最终集合是否与
当前 DOM 一致。

### 7. React 19 的 cleanup 与 `null` 兼容路径

React 19 允许 Callback Ref 返回 cleanup。返回 cleanup 后，节点失效时 React 调用这个函数，不再依赖
再次以 `null` 调用原 callback。

为了兼容没有返回 cleanup 的旧代码，React 19.2 在 ref 脱离时仍可能以 `null` 调用 callback。官方已经
说明这条兼容行为未来会移除。新代码应显式返回 cleanup，不把 `node === null` 分支当作长期清理方案。

### 8. Strict Mode 检查清理对称性

Strict Mode 会在开发环境为 Callback Ref 额外执行一次 setup + cleanup 周期。完整周期类似：

```text
setup -> cleanup -> setup
```

如果 setup 只向 `Map` 增加节点而 cleanup 没有删除，开发环境会更早暴露重复或过期记录。额外周期只
用于检查，不代表生产环境固定调用次数。

### 9. TypeScript 只接受无返回值或 cleanup

`Map.set()` 返回 `Map` 本身。表达式箭头函数会把这个值隐式返回：

```tsx
// 错误：返回 Map，不是 cleanup。
<li ref={(node) => itemNodesRef.current.set(item.id, node!)} />
```

React 19 类型需要区分 cleanup 函数与其他结果，因此会拒绝这种写法。使用块函数体执行登记，只在需要
清理时显式返回函数：

```tsx
<li
  ref={(node) => {
    if (node === null) return
    itemNodesRef.current.set(item.id, node)

    return () => {
      itemNodesRef.current.delete(item.id)
    }
  }}
/>
```

## 六、节点失效与索引一致性

### 1. 哪些变化会让节点失效

以下情况都会结束或替换某次 Ref 连接：

- 条件渲染不再输出该宿主元素；
- 动态列表删除对应条目；
- 相同位置从一种宿主元素替换为另一种宿主元素；
- `key` 改变导致旧子树被替换；
- 组件卸载；
- Callback Ref 函数身份变化。

对象 Ref 在连接结束后恢复为 `null`。Callback Ref 则执行先前 setup 返回的 cleanup；如果没有
cleanup，React 19.2 还保留 callback 接收 `null` 的兼容行为。

### 2. 不要长期缓存从 Ref 取出的节点

```tsx
const node = itemNodesRef.current.get(itemId)
```

`node` 只是这次事件读取时的快照。事件结束后，后续提交可能删除或替换它。需要再次操作时，应重新从
对象 Ref 或节点 `Map` 读取当前连接，而不是把旧节点保存在模块变量、State 或长期任务中。

### 3. cleanup 必须撤销本次 setup

setup 与 cleanup 应操作相同的容器、相同的 ID 和相反的动作：

```tsx
const itemNodes = itemNodesRef.current
itemNodes.set(itemId, node)

return () => {
  itemNodes.delete(itemId)
}
```

cleanup 不负责修改列表 State，不负责创建新节点，也不应根据当前界面重新计算另一个 ID。它只撤销本次
登记。

### 4. 用最终结果验证正确性

动态节点索引的正确条件是：

1. `Map.size` 等于当前需要索引的宿主节点数量；
2. 每个当前数据 ID 都能找到对应节点；
3. 节点的 `data-item-id` 与 `Map` key 一致；
4. 已删除数据 ID 不再存在；
5. 普通重新 render 和 Strict Mode 额外周期后，集合不会持续增长。

这些条件比断言 callback 的固定调用次数更可靠。

## 七、交互示例

第一个示例使用对象 Ref 连接固定节点。按钮分别聚焦输入框、滚动到固定目标、读取一次几何，并恢复公开
证据。可见结果来自 State，JSX 不读取 DOM Ref。

::::demo{id="react.core.learn.intermediate.dom-refs.host-node-actions-demo"}
::::

第二个示例使用 Callback Ref 维护动态列表的节点 `Map`。添加条目后登记新节点；删除条目后 cleanup
移除旧 ID；“检查节点索引”在用户事件中发布普通值快照；定位动作按稳定 ID 取得当前节点。

::::demo{id="react.core.learn.intermediate.dom-refs.dynamic-node-map-demo"}
::::

## 八、易错使用提示

:::pitfalls
### 错误：创建对象 Ref 却没有连接 JSX

**触发条件：** 声明 `inputRef` 并在点击时读取它，但输入框遗漏 `ref={inputRef}`。

**原因：** 把 `useRef` 误解成按变量名或选择器自动查询 DOM。

**后果：** `current` 一直是 `null`，聚焦、滚动和测量都不会发生。

**错误示例：**

```tsx
const inputRef = useRef<HTMLInputElement | null>(null)
return <input />
```

**正确写法：**

```tsx
const inputRef = useRef<HTMLInputElement | null>(null)
return <input ref={inputRef} />
```

**验证方式：** 节点提交后，从事件处理函数读取 `current`，结果应是该输入框。

### 错误：在 render 中读取或操作 DOM Ref

**触发条件：** 在组件函数主体测量节点，或在 JSX 计算期间调用 `focus()`。

**原因：** render 发生在当前 DOM 提交之前，并且必须保持纯净。

**后果：** 代码会读到 `null` 或旧 DOM，也可能在重复或放弃 render 时产生错误副作用。

**错误示例：**

```tsx
const width = targetRef.current?.getBoundingClientRect().width
return <output>{width}</output>
```

**正确写法：**

```tsx
/** 在明确点击后读取并发布测量值。 */
function handleMeasure() {
  const width = targetRef.current?.getBoundingClientRect().width
  if (width !== undefined) setWidth(Math.round(width))
}
```

**验证方式：** 组件函数主体和 JSX 不读取节点 Ref，DOM API 只出现在事件路径中。

### 错误：用非空断言掩盖节点失效

**触发条件：** 对可能条件渲染或已经卸载的节点使用 `panelRef.current!.scrollIntoView()`。

**原因：** 忽略节点移除时对象 Ref 会恢复为 `null`。

**后果：** 节点不存在时抛出空值访问错误。

**错误示例：**

```tsx
panelRef.current!.scrollIntoView()
```

**正确写法：**

```tsx
const panel = panelRef.current
if (panel !== null) panel.scrollIntoView()
```

**验证方式：** 每条 DOM 操作路径都保留空值分支。

### 错误：State setter 后立刻假设新 DOM 已提交

**触发条件：** 同一事件先增加列表项，下一行就滚动到“新”末项。

**原因：** State setter 请求后续 render，不保证下一条 JavaScript 语句已经完成 DOM 提交。

**后果：** 操作命中旧节点，或读不到刚创建的目标。

**错误示例：**

```tsx
setItems(nextItems)
listRef.current?.lastElementChild?.scrollIntoView()
```

**正确写法：**

```tsx
const target = existingTargetRef.current
if (target !== null) target.scrollIntoView()
```

**验证方式：** 当前事件只操作已经提交的节点；新节点尚未提交时不假设 Ref 已经更新。

### 错误：用命令式 DOM 改写代替 State 和 JSX

**触发条件：** 通过 Ref 改文本、class、style、disabled，或删除 React 管理的子节点。

**原因：** 把“可以取得节点”误解成“应该接管 React 的渲染职责”。

**后果：** DOM 与 JSX 输出不一致，后续 React 提交可能覆盖或撞上手工修改。

**错误示例：**

```tsx
panelRef.current!.textContent = '已完成'
```

**正确写法：**

```tsx
setStatus('done')
return <p>{status === 'done' ? '已完成' : '处理中'}</p>
```

**验证方式：** 文本、属性、样式与结构变化都能追溯到 Props、State 和 JSX。

### 错误：在 JSX 中直接显示实时测量

**触发条件：** JSX 直接调用 `targetRef.current?.getBoundingClientRect()`。

**原因：** Ref 或浏览器布局变化不会为 JSX 自动安排一致的 render。

**后果：** 首次值为空，后续值可能过期，render 还会执行布局读取。

**错误示例：**

```tsx
return <output>{targetRef.current?.getBoundingClientRect().height}</output>
```

**正确写法：**

```tsx
return <output>{measurement?.height ?? '尚未读取'}</output>
```

**验证方式：** JSX 只读取普通 State 快照，测量动作发生在用户事件中。

### 错误：在 `map()` 中逐项调用 `useRef`

**触发条件：** 为每个动态条目在列表循环中调用 `useRef(null)`。

**原因：** Hook 必须在组件顶层调用，动态列表会改变调用次数和顺序。

**后果：** 违反 Hooks 规则，节点也无法稳定对应条目。

**错误示例：**

```tsx
items.map((item) => {
  const itemRef = useRef<HTMLLIElement | null>(null)
  return <li ref={itemRef}>{item.title}</li>
})
```

**正确写法：**

```tsx
const itemNodesRef = useRef(new Map<string, HTMLLIElement>())
```

**验证方式：** 组件只有一个顶层节点集合 Ref，循环内只创建 Callback Ref。

### 错误：用数组下标充当条目身份

**触发条件：** 可增减或重排的列表同时使用 `key={index}` 和 index 存取节点。

**原因：** 数组位置会随列表操作改变，不是数据条目的稳定身份。

**后果：** 查询命中旧位置的 DOM 节点，删除后其他条目的身份也可能错位。

**错误示例：**

```tsx
<li key={index} ref={createItemRef(String(index))} />
```

**正确写法：**

```tsx
<li key={item.id} ref={createItemRef(item.id)} />
```

**验证方式：** 删除中间条目后，每个 `Map` key 仍与节点的 `data-item-id` 相同。

### 错误：节点登记缺少 cleanup，或隐式返回 `Map.set()`

**触发条件：** Callback Ref 只执行 `Map.set()` 而没有返回 cleanup，或者用表达式箭头函数隐式返回
`Map.set()` 的结果。

**原因：** 前一种写法忽略 setup 与 cleanup 的对称关系；后一种写法会返回 `Map` 本身，而 React 19
只允许 Callback Ref 返回 `void` 或 cleanup 函数。

**后果：** 缺少 cleanup 会让已移除节点继续留在 `Map`；隐式返回 `Map` 会使 JSX 的 `ref` 类型检查
失败。

**错误示例：**

```tsx
<li ref={(node) => itemNodesRef.current.set(item.id, node!)} />
```

**正确写法：**

```tsx
ref={(node) => {
  if (node === null) return
  itemNodesRef.current.set(item.id, node)

  return () => {
    itemNodesRef.current.delete(item.id)
  }
}}
```

**验证方式：** 删除条目并检查索引，旧 ID 消失，集合大小与当前 DOM 条目数相同。

### 错误：用 Callback Ref 更新 State 或统计调用次数

**触发条件：** callback 收到节点后调用 setter 保存 DOM 节点，或每次 setup 都增加业务计数。

**原因：** State 更新会请求 render，新 callback 又可能触发 cleanup 与 setup；Strict Mode 还会在开发环境
增加检查周期。Callback 调用次数不等于当前节点数量。

**后果：** 可能出现重复节点、过量 render、最大更新深度错误，或让业务计数随开发检查和普通更新漂移。

**错误示例：**

```tsx
ref={(node) => {
  if (node) {
    setNodes((current) => [...current, node])
    setRegisteredCount((count) => count + 1)
  }
}}
```

**正确写法：**

```tsx
function handleInspectNodes() {
  setRegisteredCount(itemNodesRef.current.size)
}
```

**验证方式：** Callback Ref 只维护 Ref 中的 `Map`；在独立用户事件中读取最终 `Map.size`，再发布普通
State 快照。
:::

## 九、官方事实、课程推导与适用判断

### 1. 官方事实

1. React 在 render 中计算 JSX，在 commit 中应用 DOM 变化并维护 Ref。
2. 对象 Ref 可以通过宿主 JSX 的 `ref` 属性接收节点，节点移除后恢复为 `null`。
3. Callback Ref 在节点接入时收到 DOM 节点，React 19 允许它返回 cleanup。
4. 动态列表不能在 `map()` 内逐项调用 Hook，可以用一个 Ref 中的 `Map` 管理节点。
5. 不同 Callback Ref 会触发旧连接清理和新连接 setup。
6. Strict Mode 会在开发环境额外执行一次 Callback Ref setup + cleanup 周期。
7. React 19 类型拒绝 Callback Ref 隐式返回实例、赋值结果或 `Map`。
8. 修改 Ref 不会触发 render，稳定数据 `key` 帮助 React 对应动态列表条目。

### 2. 课程推导

1. 目标是一个位置固定、职责明确的宿主节点时，对象 Ref 已能表达一对一连接，不需要节点集合。
2. 节点数量随数据变化并且需要按 ID 查询时，应让一个顶层 Ref 保存 `Map`，再由 Callback Ref 维护
   当前提交对应的成员关系。
3. 节点连接属于 commit 结果，所以命令执行前应重新读取当前 Ref；不能把 render 中的空值、旧节点或
   早先保存的局部变量当成当前连接。
4. Ref 的变化不会触发 render。需要改变页面内容时使用 State 和 JSX；需要聚焦、滚动或读取当前节点时
   才使用 DOM Ref。
5. Callback Ref 的正确性应按最终节点集合判断：当前 ID 都存在、已移除 ID 都消失，而不是要求 callback
   只执行一次。

### 3. 适合对象 Ref

- 聚焦一个固定输入框；
- 滚动到一个从首次提交起就存在的锚点；
- 点击后读取一个固定面板的几何；
- 调用固定宿主节点的窄浏览器 API。

### 4. 适合 Callback Ref

- 动态列表需要按数据 ID 聚焦或滚动到任意条目；
- 节点数量无法在组件顶层预先确定；
- 节点会增加、删除或替换，索引必须跟随提交结果清理；
- 需要把每个当前宿主节点登记到数组或 `Map`。

### 5. 不适合节点 Ref

- 页面文本、class、style、disabled 或子树可以由 JSX 描述；
- 数据变化需要立即更新页面，应使用 State；
- 需要的是数据条目，而不是对应的宿主 DOM；
- 想绕过 React 更新流程直接改写其管理的结构；
- 想把 DOM 节点长期保存到 State、持久化存储或跨实例共享容器。

## 十、练习

:::exercise
### 练习一：固定错误摘要

**要求：** 创建一个从首次提交起就存在的错误摘要块，并声明
`useRef<HTMLDivElement | null>(null)`。点击“前往错误摘要”时先检查节点，再调用
`scrollIntoView()` 和 `focus()`。用 State 记录动作结果，JSX 不读取 `ref.current`。

**验收：** DOM 命令只发生在点击事件中；节点访问保留 `null` 分支；文本和显示状态仍由 State 与 JSX
管理。
:::

:::exercise
### 练习二：动态节点登记

**要求：** 用固定数据渲染可增加和删除的条目。组件顶层只创建一个
`useRef(new Map<string, HTMLLIElement>())`；每项以稳定 ID 作为 JSX `key` 和 `Map` key；
Callback Ref 在 setup 中登记，在 cleanup 中删除。提供“定位”和“检查索引”按钮。

**验收：** 删除中间条目后，旧 ID 从 `Map` 消失；其他 ID 各出现一次；`Map.size` 等于当前 DOM
条目数；Callback Ref 不调用 State setter，也不依赖固定调用次数。
:::

## 十一、本节小结

- 对象 Ref 适合连接一个固定宿主节点，Callback Ref 适合管理数量变化的节点集合。
- DOM Ref 属于 commit 结果；render 期间不能读取节点或执行 DOM 命令。
- 聚焦、滚动和点击后测量可以在事件中执行，可见结果保存为普通 State 快照。
- 节点尚未提交、已经移除或已经替换时，Ref 会为空或索引查询失败，访问必须保留失效分支。
- 动态列表用一个顶层 Ref 保存节点 `Map`，不能在 `map()` 中逐项调用 `useRef`。
- 稳定数据 ID 可以同时服务 JSX `key` 与节点查询，但两者职责不同。
- React 19 Callback Ref 的 setup 与 cleanup 必须对称，callback 更换和 Strict Mode 周期后索引仍应一致。
- Callback Ref 使用块函数体，只返回 `void` 或明确 cleanup。
- Ref 不驱动页面，React 能用 JSX 描述的文本、属性和结构仍由声明式数据流管理。

## 十二、参考资料

- [React Versions](https://react.dev/versions) - 当前官方文档版本口径。
- [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) - 固定节点操作、
  commit 时机、动态列表 Ref 与节点 `Map`。
- [Common components: ref callback](https://react.dev/reference/react-dom/components/common#ref-callback) -
  Callback Ref 参数、cleanup、卸载与 callback 更换合同。
- [useRef](https://react.dev/reference/react/useRef) - 对象 Ref 的 `current`、DOM 写入和移除后恢复
  `null`。
- [StrictMode](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-ref-callbacks-in-development) -
  开发期额外 setup + cleanup 检查。
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required) -
  React 19 Callback Ref 返回值类型规则。
- [React v19](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs) - Ref cleanup 新能力与
  兼容 `null` 路径。
- [Rendering Lists](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key) - 动态列表
  的稳定数据 `key`。
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) -
  render 纯度与事件副作用边界。
