---
id: react.core.learn.intermediate.callback-refs
type: lesson
title: Callback Ref
summary: 用 Callback Ref 登记动态宿主节点，并在节点移除时清理旧记录。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 50
prerequisites:
  - react.core.learn.intermediate.dom-refs
related:
  - react.core.learn.basics.list-rendering-and-key
  - react.core.learn.intermediate.use-ref
  - react.core.learn.intermediate.dom-refs
tags:
  - React
  - Callback Ref
  - DOM
  - Map
  - cleanup
  - Strict Mode
appliesTo: React 19.2 官方文档与 React 19
verifiedAt: 2026-08-10
objectives:
  - 能解释 Callback Ref 在节点接入时执行 setup、在节点移除时执行 cleanup 的合同。
  - 能在组件顶层用一个 Ref 保存动态宿主节点 Map，而不在列表循环中调用 Hook。
  - 能用稳定数据 ID 同时连接 JSX key 与 Map 节点索引，并说明两者的职责差异。
  - 能在列表增加和删除后检查 Map 是否只包含当前已提交节点。
  - 能解释 callback 身份变化和 Strict Mode 额外周期为什么要求 setup 与 cleanup 对称。
  - 能避免 React 19 中 ref callback 隐式返回非 cleanup 值的 TypeScript 错误。
recap:
  - Callback Ref 是传给宿主 JSX ref 属性的函数，React 在提交节点时调用它。
  - React 19 允许 callback 返回 cleanup；清理路径应撤销本次 setup 建立的节点记录。
  - 动态列表使用一个顶层 Ref 保存 Map，不在 map 循环里逐项调用 useRef。
  - 稳定数据 ID 既可作为 JSX key，也可作为 Map key，但两者承担不同职责。
  - 内联 callback 在更新时可能重新 cleanup 和 setup，业务不能依赖固定调用次数。
  - Ref 中的 Map 不触发 render，可见证据应由用户事件读取后保存为普通 State 快照。
sources:
  - title: React Versions
    url: https://react.dev/versions
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 确认 react.dev 当前文档版本口径
  - title: Manipulating the DOM with Refs
    url: https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 动态列表不能在 map 中逐项调用 useRef
      - 使用单个 Ref 中的 Map 登记节点并返回删除记录的 cleanup
  - title: Common components - ref callback
    url: https://react.dev/reference/react-dom/components/common#ref-callback
    sourceType: official-reference
    appliesTo: React DOM 19.2
    claims:
      - Callback Ref 的参数、返回 cleanup、卸载与 callback 更换合同
      - 返回 cleanup 后不再依赖 null 回调的兼容边界
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
      - ref callback 隐式返回非 cleanup 值会被 TypeScript 拒绝
  - title: React v19
    url: https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - React 19 新增 ref cleanup 及旧 null 路径的迁移边界
  - title: Rendering Lists
    url: https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 动态列表应使用来自数据的稳定 key
  - title: useRef
    url: https://react.dev/reference/react/useRef
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Ref 可保存 Map 等任意值且修改 current 不触发 render
---

# Callback Ref

## 学习目标

- 能写出接收宿主节点并返回 cleanup 的 Callback Ref。
- 能用一个 `Map<string, HTMLLIElement>` 管理数量会变化的列表节点。
- 能在增加、删除和普通重新 render 后核对节点索引与当前 DOM 一致。
- 能区分 JSX `key` 的列表身份与 `Map` key 的节点查询职责。
- 能正确理解 Strict Mode 的开发期额外周期，并写出可重复执行的清理逻辑。
- 能识别 React 19 TypeScript 对 ref callback 返回值的限制。

## 为什么需要

上一课用对象 Ref 连接一个从首次提交起就存在的固定节点。但动态列表的节点数量会随数据增加、删除或
重排，组件无法在顶层预先声明确定数量的 `useRef`，也不能在 `items.map()` 中按条目临时调用 Hook。

如果用户需要按稳定课程 ID 聚焦或滚动到任意列表项，组件就需要一个会随 DOM 提交结果更新的节点索引。
Callback Ref 让每个宿主节点在接入时完成登记，并在离开时撤销这次登记；列表内容仍由 State 和 JSX
声明，节点 `Map` 只承担命令式查询。

## 核心概念

### Callback Ref 是提交阶段的 setup 函数

宿主元素的 `ref` 属性既可以接收 Ref 对象，也可以接收函数：

```tsx
<li ref={(node) => { /* 登记当前宿主节点 */ }}>{item.title}</li>
```

节点接入时，React 以当前 DOM 节点调用这个函数。React 19 允许它返回一个 cleanup；节点移除或这次
callback 被替换时，React 调用 cleanup。setup 建立什么记录，cleanup 就撤销什么记录。

React 19.2 为没有返回 cleanup 的旧代码保留了 `node === null` 回调，但官方已经说明这条兼容路径未来会
移除。本课使用 React 19 主路径：收到非空节点后登记，并显式返回 cleanup，不把 `null` 当作长期清理方案。

### 一个顶层 Ref 保存整组节点

```tsx
const itemNodesRef = useRef(new Map<string, HTMLLIElement>())
```

Hooks 必须在组件顶层调用，所以动态列表只创建这一个 Ref。它的 `current` 保存 `Map`；每个列表项的
Callback Ref 负责自己的 `set` 和 `delete`。修改这个 `Map` 不请求 render，因而它不能代替列表 State。

### 稳定 ID 连接两种不同职责

```tsx
<li key={item.id} ref={createItemRef(item.id)}>
  {item.title}
</li>
```

`key={item.id}` 帮助 React 在插入、删除和重排时识别列表条目；`Map` 中的 `item.id` 让事件处理函数找到
该条目的当前宿主节点。两者可以来自同一个稳定数据 ID，但 `key` 不会自动建立节点索引，`Map` key 也不
能替代 React 的列表身份。

## 用法与示例

### 1. 为每个条目创建成对的登记与清理

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
        <li key={item.id} ref={createItemRef(item.id)}>
          {item.title}
        </li>
      ))}
    </ul>
  )
}
```

`set` 与 `delete` 捕获同一个稳定 ID 和同一张 `Map`。新条目提交为 DOM 后才执行登记；条目删除后，旧
Callback Ref 的 cleanup 删除该 ID。代码不需要在 State setter 下一行猜测 DOM 是否已经提交。

### 2. 在用户事件中按 ID 定位节点

```tsx
/** 按稳定 ID 定位当前已提交的列表节点。 */
function handleLocate(itemId: string) {
  const node = itemNodesRef.current.get(itemId)
  if (!node) return

  node.focus({ preventScroll: true })
  node.scrollIntoView({ behavior: 'auto', block: 'nearest' })
}
```

事件读取的是当前提交结果。如果条目已经被删除，cleanup 会让 `Map.get(itemId)` 返回 `undefined`，所以
仍要保留未命中分支。聚焦和滚动是 DOM 命令；列表增减本身继续由 State 更新和 JSX 描述。

### 3. 用普通 State 快照展示检查结果

Ref 中的 `Map` 变化不会触发 render，也不应把 DOM 节点复制进 State。需要给用户展示检查结果时，在
明确按钮事件中读取当前 `Map`，只保存数量、稳定 ID 或一致性文本：

```tsx
const [registeredIds, setRegisteredIds] = useState<string[]>([])

/** 发布不包含 DOM 节点的索引检查快照。 */
function handleInspect() {
  setRegisteredIds([...itemNodesRef.current.keys()])
}
```

这段 State 只是一次可见证据，不负责驱动 Callback Ref。不能在 ref callback 自己内部调用 setter，否则
登记会触发 render，新的内联 callback 又会引起 cleanup 与 setup，形成额外甚至持续的更新。

### 4. 允许 callback 身份变化和 Strict Mode 压力测试

`createItemRef(item.id)` 在每次 render 都会得到新函数。React 会清理旧 callback 建立的记录，再用当前
DOM 节点执行新 callback。只要 cleanup 与 setup 对称，最终 `Map` 仍然只包含当前节点。

Strict Mode 还会在开发环境额外执行一次 setup + cleanup。它在检查清理是否完整，不是承诺生产环境的
固定调用次数。业务逻辑不能用 callback 被调用几次来计数；验收应比较最终 `Map` 与当前 DOM 是否一致。

### 5. React 19 只允许无返回值或 cleanup

下面的表达式箭头函数会隐式返回 `Map.set()` 的结果，也就是 `Map` 本身：

```tsx
// 错误：隐式返回 Map，不是 cleanup。
<li ref={(node) => itemNodesRef.current.set(item.id, node!)} />
```

React 19 类型无法把这个返回值解释为 cleanup，因此会拒绝它。使用块函数体执行登记，只在确实需要时
显式返回函数：

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

## 用法示例或 Demo

下面的同源 Demo 用固定候选数据控制动态列表。添加条目后 Callback Ref 登记新节点；删除已选条目后
cleanup 移除旧 ID；“检查节点索引”只在点击事件中发布普通快照。定位动作通过稳定 ID 取得节点并聚焦、
滚动，重新 render 和 Strict Mode 额外周期都不应留下重复或过期记录。

::::demo{id="react.core.learn.intermediate.callback-refs.dynamic-node-map-demo"}
::::

## 易错使用提示

:::pitfalls
### 错误：在 `map()` 中逐项调用 `useRef`

**触发条件：** 为每个动态条目在 `items.map()` 回调中调用 `useRef(null)`。

**原因：** Hook 只能在函数组件或自定义 Hook 顶层调用，动态列表还会改变调用次数。

**后果：** 违反 Hooks 调用顺序，节点也无法稳定对应条目。

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

**验证方式：** 组件只有一个顶层 `useRef`，循环内只创建 Callback Ref 并渲染条目。

### 错误：用数组下标充当条目身份

**触发条件：** 可增减或重排的列表同时使用 `key={index}` 和 index 存取节点。

**原因：** 位置会随列表操作变化，不是数据条目的稳定身份。

**后果：** 查询可能命中旧位置的 DOM 节点，删除后其他条目的身份也会错位。

**错误示例：**

```tsx
<li key={index} ref={createItemRef(String(index))} />
```

**正确写法：**

```tsx
<li key={item.id} ref={createItemRef(item.id)} />
```

**验证方式：** 插入或删除中间条目后，每个 Map key 仍与节点的 `data-item-id` 相同。

### 错误：只登记节点而不返回 cleanup

**触发条件：** Callback Ref 只执行 `map.set()`，没有撤销本次登记的函数。

**原因：** 忽略节点移除、callback 更换和 Strict Mode 都会清理先前 setup。

**后果：** 已移除节点继续留在 `Map`，集合大小增长，定位会命中过期 DOM。

**错误示例：**

```tsx
ref={(node) => {
  if (node) itemNodesRef.current.set(item.id, node)
}}
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

### 错误：让 `Map.set()` 从 callback 隐式返回

**触发条件：** 使用表达式箭头函数直接返回赋值结果或 `Map.set()`。

**原因：** React 19 允许返回 cleanup，TypeScript 因而必须区分函数与其他返回值。

**后果：** JSX 的 `ref` 类型检查失败，非函数结果不能作为 cleanup。

**错误示例：**

```tsx
<li ref={(node) => itemNodesRef.current.set(item.id, node!)} />
```

**正确写法：**

```tsx
<li
  ref={(node) => {
    if (node === null) return
    itemNodesRef.current.set(item.id, node)
  }}
/>
```

**验证方式：** callback 使用块函数体，并且只返回 `void` 或显式 cleanup。

### 错误：在 Callback Ref 中把 DOM 节点写入 State

**触发条件：** callback 收到节点后调用 setter，把节点数组或 `Map` 保存为 State。

**原因：** State 更新会请求 render，新 callback 又触发 cleanup 与 setup，登记反过来驱动自身重跑。

**后果：** 出现重复节点、过量 render 或最大更新深度错误，Strict Mode 下更容易暴露。

**错误示例：**

```tsx
ref={(node) => {
  if (node) setNodes((current) => [...current, node])
}}
```

**正确写法：**

```tsx
itemNodesRef.current.set(item.id, node)
```

**验证方式：** Callback Ref 只修改 Ref 中的 `Map`；可见信息由独立用户事件读取并发布普通 State 快照。
:::

## 源码推导与适用场景

1. **官方事实：** 动态列表不能在 `map()` 中逐项调用 `useRef`，官方示例用一个 Ref 保存 `Map`。**课程
   推导：** 组件顶层创建唯一节点索引，每项 Callback Ref 只维护一个稳定 ID。**边界：** 不比较数组与
   `Map` 的性能，也不把节点集合放入共享 Store。
2. **官方事实：** React 19 在节点接入时调用 callback，并在移除时调用其返回的 cleanup。**课程推导：**
   setup 的 `set` 与 cleanup 的 `delete` 必须修改同一个 `Map` 和 ID。**边界：** 不把 ref cleanup 扩张为
   Effect 或外部资源生命周期。
3. **官方事实：** 不同 callback 会触发旧 cleanup 与新 setup。**课程推导：** 内联函数可以正确工作，但
   最终集合不能依赖固定调用次数。**边界：** 不引入 callback 缓存或性能优化教学。
4. **官方事实：** Strict Mode 在开发环境额外执行一次 setup + cleanup。**课程推导：** 每次 setup 都应能
   被 cleanup 完整撤销，以最终集合一致性验收。**边界：** 额外周期不是生产环境调用次数保证。
5. **官方事实：** React 19 类型只接受无返回值或 cleanup，隐式返回赋值结果会被拒绝。**课程推导：**
   使用块函数体完成登记，只显式返回 cleanup。**边界：** 这是 ref callback 返回合同，不是通用代码风格课。
6. **官方事实：** 修改 Ref 不触发 render，稳定 `key` 帮助 React 对应动态条目。**课程推导：** State 与
   JSX 决定列表，`Map` 只查询已提交节点；同一稳定 ID 连接两边但不混淆职责。**边界：** render 不读取
   `Map`，可见检查结果只保存普通值。

适合 Callback Ref 的场景，是动态列表需要按数据 ID 聚焦、滚动或交给窄 DOM API，而节点数量无法预先
确定。固定单节点继续使用对象 Ref；跨自定义组件传递 ref、收窄命令式接口、自动外部同步和绘制前测量
分别属于后续课程，不进入当前节点集合合同。

## 练习

:::exercise
### 练习：验证中间条目删除后的节点索引

**要求：** 在 Demo 的固定候选中先添加两项，选择中间的 `object-ref` 并定位它，再删除该项。删除完成后
点击“检查节点索引”，解释为什么旧 ID 必须消失、其他 ID 仍各出现一次。随后只改变选择并再次检查，
说明内联 callback 的 cleanup / setup 为什么不会让最终集合增长。

**验收：** JSX `key` 与 `Map` key 都来自稳定数据 ID；Callback Ref 返回 cleanup，不调用 State setter；
删除后 `Map` 大小等于当前 DOM 条目数，定位当前条目仍能获得真实焦点。
:::

## 本节小结

- Callback Ref 在宿主节点接入时执行 setup，并可在 React 19 返回 cleanup 撤销登记。
- 动态列表只需要一个顶层 Ref 保存节点 `Map`，不能在 `map()` 中逐项调用 Hook。
- 稳定数据 ID 同时服务 JSX 列表身份和节点查询，但 `key` 与 `Map` key 不能互相替代。
- 增加、删除和 callback 更换都必须保持 `set` / `delete` 对称，不能留下过期节点。
- Strict Mode 的额外开发周期用于发现缺失 cleanup，业务不能依赖 Callback Ref 的固定调用次数。
- React 19 中避免隐式返回赋值或 `Map.set()`，只返回 `void` 或明确的 cleanup。
- Ref 中的节点集合不驱动页面；可见证据在用户事件中读取，并保存为普通 State 快照。

## 参考资料

- [React Versions](https://react.dev/versions) - 当前官方文档版本口径。
- [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback) - 动态列表、节点 `Map` 与成对清理示例。
- [Common components: ref callback](https://react.dev/reference/react-dom/components/common#ref-callback) -
  Callback Ref 参数、cleanup、卸载与 callback 更换合同。
- [StrictMode](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-ref-callbacks-in-development) - 开发期额外 setup + cleanup 检查。
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required) -
  React 19 TypeScript 返回值迁移规则。
- [React v19](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs) - ref cleanup 新能力与
  兼容 `null` 路径。
- [Rendering Lists](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key) - 动态列表
  的稳定数据 key。
- [useRef](https://react.dev/reference/react/useRef) - Ref 可保存任意值且修改不触发 render。
