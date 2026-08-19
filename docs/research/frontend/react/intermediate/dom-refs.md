# DOM Ref 与 Callback Ref 官方调研

## 调研结论

- 核验日期：`2026-08-16`
- 官方文档基线：React `19.2`
- 仓库依赖快照：React / React DOM `19.2.8`
- React 官方文档源码快照：`383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`
- React 源码固定标签：`v19.2.8`

DOM Ref 的核心是“取得 React 当前已经提交的宿主节点”。对象 Ref 适合连接一个已知节点；Callback Ref
适合登记数量会变化的节点集合。两者都属于 commit 结果，不应成为 render 输入。

React 19.2 官方资料支持以下完整合同：

1. 对象 Ref 通过宿主 JSX 的 `ref` 属性接收 DOM 节点，节点移除后恢复为 `null`。
2. render 负责计算 JSX，commit 负责应用 DOM 变化并维护 Ref。
3. 聚焦、滚动和用户事件中的一次性测量是典型节点操作；可描述的 DOM 变化仍由 State 与 JSX 管理。
4. 动态列表不能在 `map()` 内逐项调用 `useRef`，可以用一个 Ref 保存节点 `Map`。
5. Callback Ref 在节点接入时执行 setup，React 19 允许它返回 cleanup。
6. 节点移除或 callback 更换时，React 调用先前返回的 cleanup。
7. 没有返回 cleanup 时，React 19.2 仍保留 callback 接收 `null` 的兼容路径；官方已说明未来会移除。
8. Strict Mode 在开发环境为 Callback Ref 额外执行一次 setup + cleanup 周期。
9. React 19 类型只允许 Callback Ref 返回 `void` 或 cleanup；隐式返回实例、赋值结果或
   `Map.set()` 结果会被 TypeScript 拒绝。
10. 稳定数据 ID 可以同时作为 JSX `key` 和节点 `Map` key，但两种 key 的职责不同。

## 调研范围

### 必须回答的问题

1. 对象 Ref 如何连接宿主 DOM 节点？
2. DOM Ref 在 render 和 commit 的什么时机可用？
3. 节点为何可能为 `null` 或已经失效？
4. 哪些 DOM 命令适合放在明确用户事件中？
5. 为什么 JSX 不应在 render 中读取节点或几何？
6. 动态列表为什么不能在 `map()` 中逐项调用 `useRef`？
7. 单个 Ref 中的节点 `Map` 如何维护？
8. Callback Ref 的 setup、cleanup 和 callback 更换合同是什么？
9. Strict Mode 如何检查 cleanup 对称性？
10. React 19 Callback Ref 的返回类型限制是什么？
11. 节点索引如何与稳定数据 ID 保持一致？
12. 如何判断应该使用对象 Ref、Callback Ref、State 或普通数据？

### 内容边界

调研只覆盖当前组件输出的宿主节点、固定节点操作、动态节点集合、setup / cleanup 与节点失效。以下内容
需要额外组件接口、同步生命周期或宿主放置知识，不展开：

- 自定义组件接收或转交 `ref`；
- `forwardRef` 兼容知识；
- `useImperativeHandle` 和自定义命令式句柄；
- Effect 与布局同步；
- Portal 的 React 树与 DOM 放置；
- Observer、动画、性能测量和第三方 DOM 库；
- 外部 Store、请求、缓存和持久化；
- React 内部 Fiber 字段、内部函数名或固定提交顺序。

## 官方来源与核验方法

已知 canonical URL 足以覆盖调研问题。核验时直接读取 React 官方页面，并对关键内容回到
`reactjs/react.dev` 当前官方源码快照逐段确认；公共实现细节只在必要处固定到
`facebook/react@v19.2.8`。所有 canonical 页面均返回 HTTP `200`。

| 官方来源 | 采用事实 |
| --- | --- |
| [React Versions](https://react.dev/versions) | react.dev 当前最新文档版本为 React 19.2 |
| [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) | 固定节点聚焦、滚动、commit 时机、动态列表 `Map` 与 Callback Ref |
| [Common components: ref callback](https://react.dev/reference/react-dom/components/common#ref-callback) | Callback Ref 参数、cleanup、callback 更换、`null` 兼容路径 |
| [`useRef`](https://react.dev/reference/react/useRef) | 对象 Ref 的 `current`、DOM 写入、移除后恢复 `null` |
| [StrictMode](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-ref-callbacks-in-development) | 开发环境额外 setup + cleanup 检查 |
| [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required) | Callback Ref 的 TypeScript 返回值限制 |
| [React v19](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs) | Ref cleanup 新能力与旧 `null` 行为的迁移边界 |
| [Rendering Lists](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key) | 动态列表稳定数据 `key` |
| [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | render 纯度与事件副作用边界 |

未采用社区教程、问答、搜索摘要或旧版 React 文档。公共文档已经定义 setup、cleanup 与 Strict Mode
行为，因此不把内部 Fiber 顺序写成应用合同。

## React 19.2 官方事实

### 1. 对象 Ref 的 DOM 连接

```tsx
const inputRef = useRef<HTMLInputElement | null>(null)

return <input ref={inputRef} />
```

首次 render 时，宿主节点尚未创建，`current` 为 `null`。React 提交 `<input>` 后，把真实
`HTMLInputElement` 写入 `current`。节点离开页面后，React 把 `current` 恢复为 `null`。

只调用 `useRef` 不会查询 DOM。必须把同一个 Ref 对象交给目标宿主元素的 `ref` 属性。

### 2. render 与 commit 的分工

官方 DOM Ref 学习页明确区分：

- render：调用组件并计算屏幕上应该出现什么；
- commit：把变化应用到 DOM。

首次 render 时 DOM 尚不存在；更新 render 时 DOM 尚未按本轮结果更新。因此 render 中读取节点会得到
空值或旧提交结果。React 在 commit 中维护 Ref，节点连接属于提交结果。

事件处理函数通常在页面提交后执行，适合读取当前 Ref 并调用窄 DOM API。render 不应读取节点或执行
DOM 命令。

### 3. 适合 Ref 的节点操作

React 官方示例直接展示：

- `focus()`：把焦点移入输入框；
- `scrollIntoView()`：把目标滚动进视口；
- 读取宿主节点后执行明确命令。

点击后调用 `getBoundingClientRect()` 读取一次几何，也符合“事件中读取当前已提交节点”的边界。需要
在页面展示测量结果时，应把宽、高等普通数值写入 State，不把 DOM 节点或 `DOMRect` 放进 State。

### 4. Ref 不是另一套渲染方式

React 官方说明，修改或删除 React 管理的 DOM 结构可能与后续提交冲突。由 Props、State 和 JSX 可以
描述的文本、class、style、disabled、条件结构和列表内容，应继续使用声明式数据流。

聚焦、滚动和读取几何不会接管 React 的结构管理；直接改写 `textContent`、删除子节点或手动维护
React 已经负责的属性则会跨越边界。

### 5. 节点失效

对象 Ref 或节点索引不能被当成永久连接。以下变化都会使旧节点失效：

- 条件渲染移除宿主元素；
- 动态列表删除条目；
- 宿主元素类型或 `key` 改变；
- 组件卸载；
- Callback Ref 函数被替换。

每次命令式操作前都应重新读取当前 Ref，并保留 `null` 或 `undefined` 分支。事件中取得的局部节点
变量只代表这次读取时的提交结果，不是跨后续提交的稳定句柄。

### 6. 动态列表不能逐项调用 Hook

官方动态列表示例明确指出，`useRef` 不能在循环、条件或 `map()` 中调用，因为 Hook 必须位于组件
顶层。列表数量变化会破坏 Hook 调用次数和顺序。

官方给出的替代方案之一，是创建一个顶层 Ref，让它保存数组或 `Map`，然后为每个宿主节点传入
Callback Ref。

### 7. 一个 Ref 保存节点 `Map`

```tsx
const itemNodesRef = useRef(new Map<string, HTMLLIElement>())
```

这张 `Map` 是当前宿主节点的命令式索引，不是列表数据源。列表内容由 State 与 JSX 决定；`Map` 只
在提交边界登记或删除节点，并在用户事件中按 ID 查询。

修改 `Map` 不触发 render。需要显示数量、ID 或一致性结果时，在用户事件中读取普通值，再发布 State
快照。

### 8. Callback Ref setup 与 cleanup

```tsx
ref={(node) => {
  if (node === null) return

  const itemNodes = itemNodesRef.current
  itemNodes.set(item.id, node)

  return () => {
    itemNodes.delete(item.id)
  }
}}
```

节点接入时，React 以 DOM 节点调用 callback。React 19 允许 callback 返回可选 cleanup；节点脱离时，
React 调用该函数。

setup 建立的记录必须由 cleanup 完整撤销。最直接的对称关系是：对同一个 `Map`、同一个稳定 ID 先
`set`，后 `delete`。

### 9. callback 更换

当 JSX 传入不同 Callback Ref 函数时，React 会清理旧 callback 的连接，再用当前节点执行新 callback。
内联函数通常每次 render 都是新函数，因此应用不能假设 setup 只执行一次。

正确性应以最终 `Map` 为准：它只包含当前宿主节点，不包含重复或已经移除的记录。

### 10. React 19 的 `null` 兼容路径

React 19 新增返回 cleanup 的能力。如果 callback 返回 cleanup，节点失效时 React 调用 cleanup，并跳过
过去再次以 `null` 调用 callback 的步骤。

为了兼容旧代码，没有返回 cleanup 时，React 19.2 仍会在 ref 脱离时以 `null` 调用 callback。官方已
说明这条行为未来会移除。新代码应使用显式 cleanup，不把 `node === null` 分支当成长期清理合同。

### 11. Strict Mode 额外检查

Strict Mode 在开发环境为每个 Callback Ref 额外执行一次 setup + cleanup 周期。官方修正后的示例表现为：

```text
登记到预期数量 -> 清空到 0 -> 再登记到预期数量
```

缺少 cleanup 时，节点集合会持续累积，过期节点会破坏定位行为。额外周期只用于发现已经存在的清理错误，
不代表生产环境调用次数。

### 12. TypeScript 返回值限制

React 19 支持 cleanup 后，Callback Ref 只能返回无值或函数。下面的写法会隐式返回 `Map`：

```tsx
ref={(node) => itemNodesRef.current.set(item.id, node!)}
```

`Map.set()` 返回 `Map` 本身，不是 cleanup。赋值表达式也会返回被赋的值。React 19 类型会拒绝这类
结果。正确写法使用块函数体，只在需要时显式返回 cleanup。

### 13. 稳定数据 ID 的双重用途

```tsx
<li key={item.id} ref={createItemRef(item.id)}>
  {item.title}
</li>
```

`key={item.id}` 帮助 React 在插入、删除和重排时识别列表条目；`Map` 中的同一 ID 帮助事件查询
当前节点。

数组下标会随列表操作改变，随机值会导致每次 render 身份变化，都不适合可变列表。两种 key 虽可来自
同一稳定 ID，但不能互相替代。

## 本科教学覆盖

### 必须讲清

1. 对象 Ref 的声明、宿主 JSX 连接和 `null` 类型。
2. render 与 commit 的分工。
3. 聚焦、滚动和事件中一次性测量。
4. State 快照与节点 Ref 的职责差异。
5. React 管理的 DOM 仍由 JSX 描述。
6. 节点尚未提交、移除、替换和卸载时的失效状态。
7. 动态列表不能在 `map()` 中调用 `useRef`。
8. 一个顶层 Ref 保存节点 `Map`。
9. 稳定 ID、JSX `key` 与 `Map` key 的不同职责。
10. Callback Ref setup / cleanup 对称性。
11. callback 身份变化后的旧清理与新登记。
12. Strict Mode 开发期额外周期。
13. React 19 cleanup 与旧 `null` 兼容边界。
14. 隐式返回 `Map.set()` 或赋值结果的 TypeScript 错误。
15. 节点 `Map` 不触发 render，Callback Ref 不应写 State。

### 只作为边界

- State setter 后的下一条语句不保证新 DOM 已提交；
- 事件中取得的节点变量不能跨后续提交视为永久有效；
- 组件接口、自动同步和绘制前布局读取需要独立合同。

### 不展开

- ref 作为组件 prop；
- `forwardRef`；
- `useImperativeHandle`；
- Effect、布局 Effect 与依赖；
- Portal；
- 性能优化、callback 缓存或调用次数优化；
- 外部系统、Observer、请求和持久化；
- React 内部 commit 函数或 Fiber 结构。

## 常见错误

### 对象 Ref 没有传给宿主 JSX

**触发条件：** 声明 `inputRef` 并在事件中读取它，但目标宿主元素没有写 `ref={inputRef}`。

**原因：** `useRef` 只创建 Ref 对象，不会按变量名或选择器查询 DOM。

**后果：** `current` 一直为 `null`，聚焦、滚动和测量都无法执行。

**错误示例：** `const inputRef = useRef<HTMLInputElement | null>(null); return <input />`

**正确示例：** `const inputRef = useRef<HTMLInputElement | null>(null); return <input ref={inputRef} />`

**适用版本：** React 19.2；对象 Ref 的连接合同也适用于此前支持 Hooks 的 React 版本。

**来源：** [`useRef`](https://react.dev/reference/react/useRef)；
[Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)。

### render 中读取或操作节点

**触发条件：** 在组件函数主体或 JSX 计算期间读取几何、调用 `focus()` 或执行其他 DOM 命令。

**原因：** render 发生在当前提交之前，且组件 render 必须保持纯净。

**后果：** 代码会读到 `null` 或旧 DOM，也可能在重复或放弃 render 时产生错误副作用。

**错误示例：** `const width = panelRef.current?.getBoundingClientRect().width`

**正确示例：** 在点击处理函数中重新读取 `panelRef.current`，确认非空后再测量并发布普通 State 数值。

**适用版本：** React 19.2；render 纯度和提交后访问节点是跨版本公共合同。

**来源：** [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)；
[Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)。

### 用非空断言删除失效分支

**触发条件：** 对条件渲染、可能替换或已经卸载的节点直接使用 `ref.current!`。

**原因：** 非空断言只改变 TypeScript 检查，不会改变节点尚未提交或已被移除的运行时状态。

**后果：** 节点不存在时抛出空值访问错误，提前保存的旧节点还可能不再属于当前页面。

**错误示例：** `panelRef.current!.scrollIntoView()`

**正确示例：** `const panel = panelRef.current; if (panel !== null) panel.scrollIntoView()`

**适用版本：** React 19.2；对象 Ref 在节点移除后恢复为 `null`。

**来源：** [`useRef`](https://react.dev/reference/react/useRef)；
[Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)。

### setter 后立刻访问新节点

**触发条件：** 同一事件先通过 State 添加元素，下一行就从 Ref 查找并操作这个新元素。

**原因：** State setter 请求后续 render，不保证同一 JavaScript 调用栈内已经完成 DOM 提交。

**后果：** Ref 仍指向旧提交结果，代码会命中旧节点或找不到新节点。

**错误示例：** `setItems(nextItems); listRef.current?.lastElementChild?.scrollIntoView()`

**正确示例：** 当前事件只操作已经提交的节点；必须同步访问新节点的特殊集成场景另行评估
`flushSync`，不把它作为普通流程。

**适用版本：** React 19.2；State 更新与 DOM 提交的阶段边界适用于并发渲染模型。

**来源：** [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)。

### 用 Ref 改写 React 管理的结构

**触发条件：** 通过 Ref 改写文本、class、style、disabled，或删除 React 管理的子节点。

**原因：** 这类变化本来可以由 Props、State 和 JSX 描述，手工修改会绕过 React 的输出模型。

**后果：** 真实 DOM 与 JSX 偏离，后续提交可能覆盖修改，删除节点还可能导致提交冲突。

**错误示例：** `panelRef.current!.textContent = '已完成'`

**正确示例：** `setStatus('done')`，再由 JSX 根据 `status` 输出文本和属性。

**适用版本：** React 19.2；React 管理节点的宿主所有权边界不依赖 Callback Ref 新能力。

**来源：** [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)。

### 在 JSX 中直接显示几何

**触发条件：** JSX 直接调用 `targetRef.current?.getBoundingClientRect()` 并显示结果。

**原因：** Ref 与浏览器布局变化不会请求 render，render 期间读取布局也早于当前提交。

**后果：** 首次结果为空，后续结果可能过期，并在 render 路径引入不纯的布局读取。

**错误示例：** `return <output>{targetRef.current?.getBoundingClientRect().height}</output>`

**正确示例：** 用户事件中读取宽高等普通数值，把数值写入 State，JSX 只读取该快照。

**适用版本：** React 19.2；当前课程只覆盖用户事件中的一次性测量。

**来源：** [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)；
[Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)。

### 在 `map()` 中调用 `useRef`

**触发条件：** 为动态列表的每个条目在 `map()` 回调中调用 `useRef(null)`。

**原因：** Hook 必须在组件顶层调用，动态列表会改变 Hook 的调用次数和顺序。

**后果：** 违反 Hooks 规则，也无法在插入、删除和重排后稳定对应节点。

**错误示例：** `items.map(() => useRef<HTMLLIElement | null>(null))`

**正确示例：** 在组件顶层创建一个 `useRef(new Map())`，循环内只向宿主元素传递 Callback Ref。

**适用版本：** React 19.2；Hooks 顶层调用规则适用于全部 Hooks 版本。

**来源：** [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)；
[Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)。

### 用数组下标作为节点身份

**触发条件：** 可增减或重排的列表同时使用 `key={index}`，并以 index 作为节点 `Map` key。

**原因：** 数组位置会随列表操作改变，不是数据条目的稳定身份。

**后果：** 查询可能命中另一条数据的 DOM，删除中间项后其他条目也会发生身份错位。

**错误示例：** `<li key={index} ref={createItemRef(String(index))} />`

**正确示例：** `<li key={item.id} ref={createItemRef(item.id)} />`

**适用版本：** React 19.2；稳定 `key` 的列表身份规则适用于此前 React 版本。

**来源：** [Rendering Lists](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)；
[Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)。

### 节点登记缺少 cleanup，或隐式返回 `Map.set()`

**触发条件：** Callback Ref 只执行 `Map.set()` 而不返回 cleanup，或者用表达式箭头函数隐式返回
`Map.set()` 的结果。

**原因：** 前一种写法没有撤销 setup；后一种写法返回 `Map` 本身，而 React 19 只接受 `void` 或
cleanup 函数。

**后果：** 已删除节点会残留在索引中，或者 TypeScript 直接拒绝 JSX `ref` 回调类型。

**错误示例：** `<li ref={(node) => itemNodesRef.current.set(item.id, node!)} />`

**正确示例：** 使用块函数体；节点非空时 `set`，并返回执行同一 ID `delete` 的 cleanup。

**适用版本：** React 19.2；返回 cleanup 与相应 TypeScript 限制从 React 19 开始。

**来源：** [Common components: ref callback](https://react.dev/reference/react-dom/components/common#ref-callback)；
[React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required)；
[React v19](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs)。

### 用 Callback Ref 更新 State 或统计调用次数

**触发条件：** callback 收到节点后调用 setter 保存 DOM 节点，或每次 setup 都增加业务计数。

**原因：** setter 会请求 render，新 callback 又可能触发 cleanup 与 setup；Strict Mode 还会在开发环境
增加检查周期。调用次数不表示最终节点集合。

**后果：** 可能出现重复节点、更新反馈、最大更新深度错误，或让业务计数随开发检查和普通更新漂移。

**错误示例：** `if (node) setNodes((current) => [...current, node])`

**正确示例：** Callback Ref 只维护 Ref 中的 `Map`；独立用户事件读取最终 `Map.size`，再发布普通 State
快照。

**适用版本：** React 19.2；Strict Mode 的额外 Callback Ref 检查只发生在开发环境。

**来源：** [StrictMode](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-ref-callbacks-in-development)；
[Common components: ref callback](https://react.dev/reference/react-dom/components/common#ref-callback)；
[`useRef`](https://react.dev/reference/react/useRef)。

## 可复跑观察目标

### 固定节点

1. 初始对象 Ref 连接输入框、滚动目标和测量目标。
2. 点击聚焦后，真实焦点进入输入框。
3. 点击滚动后，固定目标进入容器视口。
4. 点击测量后，页面显示有限的宽、高和位置数值。
5. JSX 不读取 Ref，也不保存 DOM 节点到 State。
6. 重置后公开证据恢复，固定节点连接仍可再次使用。

### 动态节点集合

1. 初始 `Map.size` 等于当前列表项数量。
2. 添加条目并提交后，新稳定 ID 出现在 `Map`。
3. 定位操作按稳定 ID 取得真实当前节点。
4. 删除中间条目后，旧 ID 从 `Map` 消失。
5. 其他 ID 仍各出现一次，节点 `data-item-id` 与 `Map` key 一致。
6. 普通重新 render 和 Strict Mode 额外周期后，`Map` 不持续增长。
7. 可见检查结果只包含普通数量、ID 和一致性文本。

## 官方参考资料

1. [React Versions](https://react.dev/versions)
2. [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)
3. [Common components: ref callback](https://react.dev/reference/react-dom/components/common#ref-callback)
4. [`useRef`](https://react.dev/reference/react/useRef)
5. [StrictMode](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-ref-callbacks-in-development)
6. [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required)
7. [React v19](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs)
8. [Rendering Lists](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
9. [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
