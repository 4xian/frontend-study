---
id: react.core.learn.advanced.use-callback-function-identity
type: lesson
title: useCallback 与函数身份
summary: 在已测量的函数 Prop 身份问题中缓存函数定义，并用完整依赖保持闭包数据正确。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - react.core.learn.advanced.memo-component-bailout
related:
  - react.core.learn.advanced.profiler-render-measurement
  - react.core.learn.intermediate.effect-dependencies
  - react.core.learn.intermediate.custom-hooks
tags:
  - React
  - useCallback
  - 函数身份
  - 依赖数组
  - memo
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能写出 useCallback 的签名，说明它返回函数定义而不是执行结果。
  - 能列出回调读取的全部 reactive values，并说明依赖如何使用 Object.is 比较。
  - 能判断稳定函数 Prop 何时能让 memo 子组件获得跳过 render 的机会。
  - 能在 State 只用于计算下一状态时使用 updater function 缩减依赖。
  - 能在真实依赖变化后验证新函数和新闭包，不保留旧输入。
  - 能用 Profiler 判断函数身份优化是否减少了实际工作。
recap:
  - useCallback 缓存函数定义；依赖未变时返回之前保存的函数，变化时返回本次函数。
  - React 不会调用传给 useCallback 的函数，本次 render 仍会创建函数表达式。
  - 依赖必须覆盖回调读取的全部 reactive values，并逐项使用 Object.is 比较。
  - 稳定函数只有与 memo 和其他稳定 Props 配合，才可能让子组件跳过重复 render。
  - updater function 只替代“从当前 State 计算下一 State”的读取，不能隐藏其他依赖。
  - useCallback 是可移除的性能优化，不是正确性、资源所有权或永久身份合同。
sources:
  - title: useCallback
    url: https://react.dev/reference/react/useCallback
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - useCallback 的签名、函数定义缓存、依赖比较、Hook 规则与缓存边界
      - memo 组合、updater function、Effect 函数依赖和自定义 Hook 返回值的适用条件
  - title: React 19.2 useCallback 固定文档
    url: https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useCallback.md
    sourceType: source-code
    appliesTo: React 19.2
    claims:
      - 固定版本的 useCallback 公共语义与性能边界
  - title: memo
    url: https://react.dev/reference/react/memo
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 函数 Prop 身份、默认 Props 比较与 memo 的性能边界
  - title: React 19.2.8 ReactFiberHooks Source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本保存 callback 与比较依赖的实现佐证
  - title: Profiler
    url: https://react.dev/reference/react/Profiler
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 使用相同交互路径比较 commit 和渲染成本
---

# useCallback 与函数身份

## 一、学习目标

- 写出 `useCallback(fn, dependencies)`，说明参数、返回值和调用位置。
- 解释函数表达式每次 render 都会创建，以及 React 何时返回之前保存的函数。
- 从回调代码中找出 Props、State、组件内变量和函数等全部 reactive values。
- 判断函数 Prop 与 `memo`、其他 Props 一起满足什么条件时才可能跳过子组件 render。
- 使用 updater function 缩小只用于计算下一状态的 State 依赖。
- 通过真实依赖变化、按钮行为和 Profiler 记录同时验证函数身份与闭包正确性。

## 二、函数身份的最小模型

### 1. 每次 render 的函数表达式都是新引用

组件函数会在每次 render 中重新执行。下面两个函数的函数体相同，但每次执行组件都会得到新引用：

```tsx
/** 为工具栏创建当前 render 的保存函数。 */
function createSaveHandler(reportId: string) {
  return () => saveReport(reportId)
}

const first = createSaveHandler('report-1')
const second = createSaveHandler('report-1')
Object.is(first, second) // false
```

这不是错误。函数是对象，引用相等要求是同一个函数对象。普通 DOM 按钮直接接收新处理器通常没有问题；
只有下游把函数身份当作 Props 或依赖进行比较时，引用变化才会成为需要测量的性能因素。

### 2. `useCallback` 缓存的是函数定义

`useCallback` 的完整签名是：

```tsx
const cachedFunction = useCallback(functionValue, dependencies)
```

- `functionValue` 是要缓存的函数，可以接收参数并返回任意值。
- `dependencies` 是回调读取的 reactive values 列表。
- 返回值是当前应该使用的函数引用。

React 首次 render 返回传入的函数。后续 render 中，若依赖逐项保持相同，React 返回之前保存的函数；任一
依赖变化时，React 返回本次 render 传入的函数并保存它。React 不会在 `useCallback` 内调用函数，函数何时
执行由事件处理器或其他消费者决定。

### 3. TypeScript 导入与回调类型

TypeScript 文件先从 React 导入 Hook。React 的类型声明让 `useCallback` 保留回调的参数和返回值类型，并要求
第二个参数是必填的 `DependencyList`（`readonly unknown[]`）；类型检查不会替你判断依赖是否完整：

```tsx
import { useCallback } from 'react'

type SaveHandler = () => void

function ReportActions({ reportId }: { reportId: string }) {
  const handleSave: SaveHandler = useCallback(
    () => saveReport(reportId),
    [reportId],
  )

  return <button onClick={handleSave}>保存</button>
}
```

如果回调接收参数，可以用显式函数类型约束调用方传入的参数；依赖数组仍然只写回调真正读取的响应值。

### 4. 缓存不阻止本次函数创建

```tsx
/** 根据当前商品和来源创建提交函数。 */
function ProductPage({ productId, referrer }: { productId: string; referrer: string }) {
  const handleSubmit = useCallback(() => {
    submitOrder(productId, referrer)
  }, [productId, referrer])

  return <ShippingForm onSubmit={handleSubmit} />
}
```

每次执行 `ProductPage` 时，箭头函数表达式仍会先得到一个本次函数。依赖没有变化时，React 只把之前保存的
函数返回给 `handleSubmit`，忽略本次新建函数。`useCallback` 不缓存提交结果，也不保证函数永远不被重新创建。

## 三、依赖数组与闭包合同

### 1. reactive values 必须完整列出

依赖包括回调代码读取的 Props、State，以及组件函数体内直接声明的变量和函数：

```tsx
/** 使用当前用户、报告和发布模式提交报告。 */
function Publisher({ reportId, userId }: { reportId: string; userId: string }) {
  const [mode, setMode] = useState<'draft' | 'published'>('draft')

  const handlePublish = useCallback(() => {
    publishReport({ reportId, userId, mode })
  }, [reportId, userId, mode])

  return <PublishButton mode={mode} onModeChange={setMode} onPublish={handlePublish} />
}
```

依赖数组描述闭包的输入，不是“希望函数多久变化一次”的设置。删除一个真实读取值只会让旧闭包继续被
返回，不能算作成功优化。

### 2. 数组长度固定并直接写出

依赖数组应以内联形式声明，项目数和顺序在所有 render 中保持固定：

```tsx
const handleSave = useCallback(() => saveReport(reportId), [reportId])
```

不要根据条件拼接数组、用展开表达式改变项目数，或把依赖数组放进变量后再动态修改。Hook 调用位置和依赖
结构都必须稳定，才能让 React 将本次依赖与上次对应项进行比较。

### 3. 比较逐项使用 `Object.is`

React 不递归比较依赖对象的字段，而是逐项使用 `Object.is`：

```tsx
Object.is('report-1', 'report-1') // true
Object.is({}, {}) // false
Object.is(NaN, NaN) // true
Object.is(-0, 0) // false
```

因此，依赖对象或函数只要每次 render 都是新引用，缓存就会失效；字段看起来相同不能替代引用稳定。

### 4. 省略依赖数组和空数组不是一回事

```tsx
/** 不读取任何 reactive value，因此空数组有明确合同。 */
const handleReset = useCallback(() => setCount(0), [])
```

```js
/** JavaScript 运行时示意；TypeScript React 类型要求传入第二个参数。 */
const handleRefresh = useCallback(() => refresh())
```

空数组只适用于回调确实不读取会变化的值。JavaScript 运行时省略数组表示没有缓存复用条件；TypeScript
项目不能通过 React 的 `DependencyList` 类型检查。省略数组不是“自动推导依赖”，也不能让传给 `memo` 的
函数保持身份。

## 四、Hook 调用位置与闭包更新

### 1. 必须在组件或自定义 Hook 顶层调用

`useCallback` 是 Hook，不能放进条件、循环、嵌套函数或事件处理器：

```tsx
/** 无条件建立保存函数，再在函数内部判断是否允许保存。 */
function ReportActions({ canSave, reportId }: { canSave: boolean; reportId: string }) {
  const handleSave = useCallback(() => {
    if (canSave) saveReport(reportId)
  }, [canSave, reportId])

  return <button onClick={handleSave}>保存</button>
}
```

条件是回调的业务逻辑，不是 Hook 的调用条件。列表中的每项需要不同函数时，应拆出子组件或使用普通函数，
不要在循环体里改变 Hook 调用次数。

### 2. 真实依赖变化必须产生新闭包

```tsx
/** 让保存动作读取当前报告 ID。 */
function ReportEditor({ reportId }: { reportId: string }) {
  const handleSave = useCallback(() => saveReport(reportId), [reportId])
  return <button onClick={handleSave}>保存 {reportId}</button>
}
```

当 `reportId` 从 `report-1` 变为 `report-2`，依赖比较必须失败，返回的新函数闭包也必须读取 `report-2`。
不能为了让身份稳定写成 `[]`，再用 Ref 或其他绕过方式隐藏真实输入。

### 3. 稳定身份不是永久保证

React 官方将 `useCallback` 定位为性能优化。开发期编辑组件文件、组件初次挂载时因为 Suspense 暂停等情况，
React 可能丢弃缓存；未来的渲染策略也可能增加更多丢弃条件。需要持久业务身份、资源句柄或数据保存时，
应使用明确的 State、Ref 或业务数据，而不是依赖函数引用。

## 五、与 `memo` 的组合边界

### 1. 函数 Prop 是默认比较的一项输入

`memo` 子组件会逐项比较 Props。父组件每次 render 都新建 `onSave` 时，即使其他标量 Props 没变，函数 Prop
也会破坏默认跳过机会：

```tsx
const MemoizedToolbar = memo(Toolbar)

/** 每次父级 render 都创建新的函数，可能让 Toolbar 继续 render。 */
function Workspace({ reportId }: { reportId: string }) {
  const handleSave = () => saveReport(reportId)
  return <MemoizedToolbar reportId={reportId} onSave={handleSave} />
}
```

### 2. 稳定函数仍需要其他 Props 一起稳定

```tsx
/** 只在 reportId 变化时更新函数身份。 */
function Workspace({ reportId }: { reportId: string }) {
  const handleSave = useCallback(() => saveReport(reportId), [reportId])
  return <MemoizedToolbar reportId={reportId} onSave={handleSave} />
}
```

如果同时传入 `options={{ compact: true }}`、`items={[...]}` 或新建的 JSX `children`，这些 Props 仍会让
比较失败。`useCallback` 只解决函数这一项，不会替代合理的 Props 设计或 `useMemo` 的值缓存。

### 3. 不要把稳定函数误认为普通组件优化

直接传给 DOM 节点的事件处理器不因为身份稳定就获得组件级 bailout；普通子组件也不会自动跳过 render。
只有下游确实读取函数身份，例如 `memo` Props 或某个 Hook 的依赖时，稳定函数才可能改变更新工作量。

## 六、updater function 缩减 State 依赖

### 1. State 只用于计算下一状态时可以移除依赖

```tsx
type Task = Readonly<{ id: number; title: string }>

/** 把追加规则交给 updater，不闭包外层 tasks。 */
function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])

  const addTask = useCallback((title: string) => {
    setTasks((currentTasks) => [
      ...currentTasks,
      { id: currentTasks.length + 1, title },
    ])
  }, [])

  return <TaskComposer count={tasks.length} onAdd={addTask} />
}
```

这里回调只需要“如何由当前列表得到下一列表”，不需要读取外层 `tasks` 快照，因此可以使用空依赖数组。

### 2. 其他读取仍然必须保留

```tsx
/** 只有重复检查也交给 updater，才可以不依赖外层 tasks。 */
const addUniqueTask = useCallback((task: Task) => {
  setTasks((currentTasks) =>
    currentTasks.some((currentTask) => currentTask.id === task.id)
      ? currentTasks
      : [...currentTasks, task],
  )
}, [])
```

如果回调还要把当前 State 写入日志、调用外部函数或读取某个字段进行其他判断，那些读取仍是依赖。updater
只替代一次 State 到下一 State 的计算，不是删除依赖的通用技巧。

## 七、Effect 与自定义 Hook 的边界

### 1. Effect 函数依赖应先考虑直接重构

如果一个函数只供单个 Effect 使用，通常把函数移入 Effect 更简单，直接声明 Effect 真正读取的原始值：

```tsx
/** 让聊天连接只响应房间 ID，函数是 Effect 的局部实现。 */
function ChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    const options = { roomId }
    const connection = createConnection(options)
    connection.connect()
    return () => connection.disconnect()
  }, [roomId])

  return <p>房间：{roomId}</p>
}
```

只有当函数还被其他消费者使用，或确实需要作为稳定值传递时，才考虑 `useCallback`。它不能掩盖错误的
Effect 依赖，也不能把“只想少运行几次”变成正确的依赖合同。

### 2. 自定义 Hook 返回的函数可以稳定

自定义 Hook 若向调用方返回函数，调用方可能把它传给 `memo` 子组件或作为另一个 Hook 的依赖。Hook 内部
可以用完整依赖包装返回函数：

```tsx
/** 返回稳定的任务添加动作和当前任务数量。 */
function useTaskActions() {
  const [tasks, setTasks] = useState<Task[]>([])
  const addTask = useCallback((title: string) => {
    setTasks((currentTasks) => [...currentTasks, { id: currentTasks.length + 1, title }])
  }, [])

  return { tasks, addTask }
}
```

稳定返回函数不改变自定义 Hook 的 State 生命周期，也不把函数身份变成业务数据。调用方仍需测量并检查
自己传给子组件的其他 Props。

## 八、测量与使用决策

### 1. 先建立未优化基线

用 Profiler 固定同一条交互路径：冷挂载后清空记录，只更新父组件无关 State，记录普通函数分支和缓存函数
分支的 commit。没有 `memo` 子组件、子组件 render 很便宜或其他 Props 始终变化时，稳定函数通常没有收益。

### 2. 同时验证身份和功能

加入 `useCallback` 后，重复完全相同的路径，确认只有依赖不变的函数分支获得跳过机会；随后修改真实依赖并
点击按钮，确认新的函数闭包读取新值。只看 commit 数量而不点击事件，无法发现陈旧闭包。

### 3. 执行删除检查

删除 `useCallback` 后，界面、事件和数据结果都必须保持正确；变化只应体现在可能增加的 render 工作量。
如果优化收益不可复现或依赖维护成本更高，应保留直接函数写法。

## 九、用法示例或 Demo

Demo 对照两个 `memo` 工具栏：每次新建函数分支收到父级 render 中产生的新函数，`useCallback` 分支收到以
报告版本为依赖的缓存函数。两个分支执行相同确定性计算并在内部放置 Profiler。

观察顺序：

1. 冷挂载后两个分支各有一条 `mount` 记录。
2. 清空记录，再点击“仅更新父组件”，每次新建函数分支增加一条，`useCallback` 分支保持零条。
3. 点击“修改报告版本”，两边都增加一条，并显示相同的新版本和校验值。
4. 分别点击两个“保存当前版本”按钮，结果区必须显示当前版本，证明缓存函数没有闭包旧值。

:::demo{id="react.core.learn.advanced.use-callback-function-identity.callback-bailout-demo"}
:::

## 十、易错使用提示

:::pitfalls
### 错误一：认为 useCallback 会阻止函数创建或缓存执行结果

**触发条件：** 为了避免创建箭头函数，或为了复用一次操作的返回值而加入 `useCallback`。

**原因：** 每次 render 仍会创建传入函数；React 只决定返回旧函数还是当前函数，并且不会执行它。

**后果：** 代码增加依赖合同，却没有减少目标工作，还把函数身份和结果缓存混为一谈。

**错误示例：**

```tsx
// 错误预期：useCallback 会执行 calculateTotal 并缓存返回值。
const calculate = useCallback(() => calculateTotal(items), [items])
```

**正确写法：**

```tsx
// 正确：只在稳定函数身份被下游消费时缓存函数定义。
const handleCalculate = useCallback(() => onCalculate(items), [items, onCalculate])
```

**验证方式：** 在回调体中记录执行时机；确认 render 不会执行回调，再比较相邻 render 的函数引用。

### 错误二：没有 memo 或测量证据就缓存所有函数

**触发条件：** 把每个本地事件处理器都包进 `useCallback`，但函数没有传给依赖身份的消费者。

**原因：** 稳定引用只有被 `memo`、其他 Hook 依赖或类似身份边界消费时才可能产生价值。

**后果：** 代码充满依赖数组和缓存约束，却没有减少已测量的工作。

**错误示例：**

```tsx
const handleClick = useCallback(() => setOpen(true), [])
return <button onClick={handleClick}>打开</button>
```

**正确写法：**

```tsx
/** 直接处理只供当前 DOM 按钮使用的轻量交互。 */
function handleClick() {
  setOpen(true)
}

return <button onClick={handleClick}>打开</button>
```

**验证方式：** 删除 `useCallback` 并重跑相同 Profiler 路径；没有新增有意义工作时保持简单函数。

### 错误三：混淆省略依赖数组与空依赖数组

**触发条件：** 省略第二个参数，却期待 React 在后续 render 返回同一个函数。

**原因：** 省略依赖数组会让每次 render 都返回当前函数；空数组只适用于不读取 reactive values 的回调。

**后果：** 函数 Prop 仍然每次变化，`memo` 子组件继续 render。

**错误示例：**

```js
// JavaScript 运行时示意；TypeScript React 类型要求传入第二个参数。
const handleReset = useCallback(() => setCount(0))
```

**正确写法：**

```tsx
const handleReset = useCallback(() => setCount(0), [])
```

**验证方式：** 在两次父级无关 render 之间使用 `Object.is` 比较函数；省略依赖时应观察到新引用。

### 错误四：漏掉回调读取的 reactive value

**触发条件：** 回调读取 `reportId`，却为了保持函数身份把依赖写成空数组。

**原因：** 空数组让 React 继续返回首次函数，该函数闭包中的 `reportId` 也停留在首次 render。

**后果：** 页面显示新报告，点击保存却操作旧报告。

**错误示例：**

```tsx
const handleSave = useCallback(() => saveReport(reportId), [])
```

**正确写法：**

```tsx
const handleSave = useCallback(() => saveReport(reportId), [reportId])
```

**验证方式：** 修改 `reportId` 后点击保存；输出必须是新 ID，同时确认依赖清单没有遗漏项。

### 错误五：在条件、循环或事件内部调用 Hook

**触发条件：** 只有允许保存时才调用 `useCallback`，或在列表循环中为每项创建 Hook。

**原因：** Hook 必须在每次 render 中以相同顺序调用，条件和循环会改变调用位置或次数。

**后果：** React 无法稳定匹配 Hook 状态，代码违反 Hook 规则并可能直接报错。

**错误示例：**

```tsx
if (canSave) {
  const handleSave = useCallback(() => saveReport(reportId), [reportId])
}
```

**正确写法：**

```tsx
const handleSave = useCallback(() => {
  if (canSave) saveReport(reportId)
}, [canSave, reportId])
```

**验证方式：** 切换条件并运行 Hook 规则检查；确认 Hook 始终在组件顶层调用一次。

### 错误六：只稳定函数，忽略其他 always-new Props

**触发条件：** 缓存 `onSave`，同时给 `memo` 子组件传入 render 中新建的对象或数组。

**原因：** 默认比较要求每一项 Prop 都相同；任一新引用都足以让比较失败。

**后果：** 函数已经稳定，子组件仍在每次父级更新时 render。

**错误示例：**

```tsx
<MemoizedToolbar options={{ compact: true }} onSave={handleSave} />
```

**正确写法：**

```tsx
<MemoizedToolbar compact onSave={handleSave} />
```

**验证方式：** 逐项比较新旧 Props，并用 Profiler 确认所有输入不变时才出现跳过。

### 错误七：把 updater function 当成删除所有 State 依赖的技巧

**触发条件：** 回调既更新 `items` 又读取它做重复判断，却仍删除 `items` 依赖。

**原因：** updater 只能替代“用旧 State 计算新 State”这一次读取，不能替代其他业务读取。

**后果：** 重复判断或输出继续使用旧数组，行为与页面当前内容不一致。

**错误示例：**

```tsx
const addItem = useCallback((item: string) => {
  if (!items.includes(item)) setItems((current) => [...current, item])
}, [])
```

**正确写法：**

```tsx
const addItem = useCallback((item: string) => {
  setItems((current) => (current.includes(item) ? current : [...current, item]))
}, [])
```

**验证方式：** 连续添加同一项；确认重复判断读取 updater 收到的当前 State，而不是旧闭包。

### 错误八：把缓存函数身份当成正确性或永久保证

**触发条件：** 把函数引用当资源句柄、业务 ID 或只允许创建一次的永久对象。

**原因：** `useCallback` 是性能优化，React 在特定开发或挂起场景可以丢弃缓存。

**后果：** 缓存失效时功能错误，组件无法在移除优化后保持正确。

**错误示例：**

```tsx
// 错误：用函数引用本身充当必须永久不变的业务身份。
registry.set(handleSave, reportId)
```

**正确写法：**

```tsx
// 正确：业务身份使用显式数据，函数只负责执行当前操作。
registry.set(reportId, { canSave: true })
```

**验证方式：** 临时移除 `useCallback` 并重复完整交互；功能必须保持正确，只允许 commit 数量变化。
:::

## 十一、源码推导与适用场景

- React 19.2 官方文档规定：首次 render 返回传入函数；依赖未变时返回旧函数，变化时返回本次函数，且
  React 不会调用传入函数。
- React 19.2.8 固定实现的 callback Hook 保存函数和依赖元组；依赖相等时返回保存的函数，不相等时保存
  本次函数。Hook 队列与 dispatcher 是实现细节，不是应用代码合同。
- 适用场景是：子组件已被测量为昂贵、被 `memo` 包装、其他 Props 经常不变，而函数 Prop 是唯一变化项；
  另一个场景是函数确实作为其他 Hook 的依赖。
- 如果函数只供单个 Effect，优先把函数移入 Effect；如果只供轻量 DOM 事件，直接声明函数通常更清楚。
- updater function 只缩减“由当前 State 得到下一 State”的读取；其余读取、外部副作用和业务身份必须使用
  明确的依赖或数据所有者。

## 十二、练习

:::exercise
### 练习一：建立函数身份与跳过证据

**要求：** 使用 Demo 冷挂载后清空记录，连续三次点击“仅更新父组件”，比较两条分支的 commit；解释普通
函数为何增加、`useCallback` 分支为何保持零条。

**验收：** 能指出变化的唯一 Prop 是函数引用，并说明 `memo` 只是跳过机会而不是绝对保证。
:::

:::exercise
### 练习二：验证真实依赖与新闭包

**要求：** 修改报告版本，确认两个工具栏都显示新版本；分别点击保存按钮，检查结果区显示当前版本。再
  将缓存函数的依赖故意改错，预测并解释旧闭包结果。

**验收：** 能同时证明 commit 变化和事件行为变化，不能只看渲染次数。
:::

:::exercise
### 练习三：把 State 读取改成 updater

**要求：** 把 `setItems([...items, item])` 改为 updater function。若回调还要检查重复 ID 或写入日志，分别
  判断哪些读取必须保留，哪些可以移动到 updater 内部。

**验收：** 依赖数组完整，重复检查使用当前 updater 参数，不通过空数组隐藏真实闭包输入。
:::

:::exercise
### 练习四：选择缓存还是重构

**要求：** 对一段只供 Effect 使用的 `createOptions` 和一段传给 `memo` 子组件的 `onSave` 分别提出方案。
  前者尝试把函数移入 Effect，后者用 Profiler 证明函数身份是否是唯一变化项。

**验收：** 能解释什么时候直接重构比 `useCallback` 更简单，并能用相同路径复测优化收益。
:::

## 十三、本节小结

- `useCallback(fn, dependencies)` 缓存函数定义的引用，不调用函数，也不阻止本次 render 创建函数。
- 依赖数组是闭包输入合同：完整列出 reactive values，数组长度固定，并逐项使用 `Object.is` 比较。
- 省略依赖数组不会稳定函数；空数组只适用于没有 reactive inputs 的回调。
- 稳定函数要与 `memo` 和其他稳定 Props 配合，才可能让子组件跳过重复 render。
- updater function 只替代从当前 State 计算下一 State 的读取，不能隐藏其他依赖。
- 对单个 Effect 优先直接重构；自定义 Hook 返回给下游的函数可在完整依赖下稳定。
- 先用 Profiler 建立基线，再验证身份和新闭包；删除优化后功能必须保持正确。

## 十四、参考资料

- [`useCallback`](https://react.dev/reference/react/useCallback) - 签名、函数定义缓存、依赖、Hook 规则、updater
  function、Effect 和自定义 Hook 边界，适用于 React 19.2。
- [React 19.2 固定 `useCallback` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useCallback.md) - 固定本课采用的公开语义。
- [`memo`](https://react.dev/reference/react/memo) - 函数 Prop 身份、默认比较和子组件跳过条件。
- [React 19.2.8 `ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js) - callback 保存与依赖比较的固定实现佐证。
- [`Profiler`](https://react.dev/reference/react/Profiler) - 使用 commit 与渲染时长验证优化是否值得保留。
