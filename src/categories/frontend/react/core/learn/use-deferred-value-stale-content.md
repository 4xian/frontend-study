---
id: react.core.learn.advanced.use-deferred-value-stale-content
type: lesson
title: useDeferredValue 与陈旧内容
summary: 让结果子树暂时读取旧值并明确标记 stale，同时保持受控输入立即响应。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 60
prerequisites:
  - react.core.learn.advanced.use-transition-pending-action
related:
  - react.core.learn.advanced.suspense-fallback-boundary
tags:
  - React
  - useDeferredValue
  - stale content
  - Suspense
  - concurrent rendering
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能写出 useDeferredValue 的签名、调用位置、初始值与返回值规则。
  - 能区分最新 value、deferred value 与结果子树实际显示的值。
  - 能让受控 input 立即显示最新 query，只把 deferredQuery 传给允许落后的结果区。
  - 能用 query 与 deferredQuery 的差异表达 stale UI，而不冒充网络 pending。
  - 能说明后台 render 的可中断性、Suspense 行为和 Effect 提交时机。
  - 能选择 useDeferredValue、Transition、debounce 或 throttle，并避开对象身份问题。
recap:
  - useDeferredValue 返回与输入同类型的 deferred 值，不提供 pending boolean 或 setter。
  - 更新时 React 先保留旧 deferred 值，再在后台尝试新值；新紧急更新可以打断这次尝试。
  - input 使用最新 query，结果子树使用 deferredQuery，二者不一致时界面应明确说明结果陈旧。
  - 与 Suspense 组合时，后台新结果挂起不会让已显示的旧结果闪回 fallback。
  - 稳定的 deferred prop 常与 memo 配合，让昂贵子树在紧急 render 中跳过重复工作。
  - useDeferredValue 没有固定延迟，也不会减少网络请求或替代 debounce、throttle。
sources:
  - title: useDeferredValue
    url: https://react.dev/reference/react/useDeferredValue
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Hook 参数与返回值、initialValue、Object.is 和更新两阶段语义
      - 可中断后台 render、Suspense、Effect、无固定延迟及网络边界
  - title: startTransition
    url: https://react.dev/reference/react/startTransition
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 有目标 setter 时使用 Transition，只有值时考虑 useDeferredValue
  - title: Suspense
    url: https://react.dev/reference/react/Suspense
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - deferred 更新挂起时保留已显示内容而不重新展示 fallback
  - title: React 19 initialValue
    url: https://react.dev/blog/2024/12/05/react-19#use-deferred-value-initial-value
    sourceType: release-note
    appliesTo: React 19
    claims:
      - initialValue 由 React 19 新增及其首次 render 语义
---

# useDeferredValue 与陈旧内容

## 一、学习目标

- 写出 `useDeferredValue` 的参数、返回值、调用位置和 `initialValue` 语义。
- 区分最新 `query`、`deferredQuery` 和结果区当前显示的值。
- 保持受控 input 立即响应，只让昂贵结果子树暂时落后。
- 用明确文字告诉用户结果何时是 stale，而不是只改变颜色。
- 解释后台 render 的可中断性、Suspense 行为和 Effect 提交时机。
- 判断何时使用 `useDeferredValue`、Transition、debounce 或 throttle。

## 二、为什么需要

有些组件可以直接控制目标 State setter，此时可以在更新发生处使用 Transition。但组件也可能只收到
一个 prop，或只拿到自定义 Hook 返回的最新值，无法回到更新来源重新包装 setter。此时可以在读取端
调用 `useDeferredValue`，让允许落后的结果子树暂时使用旧值。

“允许落后”不等于延迟输入事件。input 仍然显示最新 State，只有结果区先保留上一次已提交内容，等
后台 render 准备好后再追上。旧结果可能与最新输入不一致，因此界面还必须明确表达 stale 状态。

典型场景是搜索、筛选、图表或大型列表：输入框必须立即反映每次键入，但结果子树可以短暂显示上一版
内容。只有当“旧内容短暂可用”且“结果最终追上最新值”都成立时，延迟结果才是合理选择。

## 三、API、类型与初次渲染

### 1. 导入、调用位置与返回值

`useDeferredValue(value, initialValue?)` 必须在组件或自定义 Hook 顶层调用，返回值与传入值保持同一
类型。它不会返回数组，也没有 `isPending` 或启动函数：

```tsx
import { useDeferredValue } from 'react'

const deferredQuery = useDeferredValue(query)
```

Hook 的公开 TypeScript 形状可以概括为：

```ts
function useDeferredValue<T>(value: T, initialValue?: T): T
```

`value` 可以是字符串、数字、对象或其他类型；`initialValue` 与返回值都沿用同一个泛型 `T`。调用方
仍然负责保存和更新原始值，Hook 只提供一份允许暂时落后的读取结果。

### 2. 不传 initialValue

未传 `initialValue` 时，初次 render 没有旧值可替代，所以返回原始 `value`。React 19 增加了可选的
第二参数，但不传参数仍是最常用写法：

```tsx
const deferredQuery = useDeferredValue(query)
```

初次 render 中 `deferredQuery` 与 `query` 相等。只有后续 `query` 变化时，界面才可能先看到旧的
`deferredQuery`。

### 3. 传入 initialValue

传入第二参数时，初次 render 先返回该初值，React 再安排后台 render 尝试切到真实值：

```tsx
const deferredQuery = useDeferredValue(query, '')
```

`initialValue` 只改变首次 render，不是每次更新的 loading fallback，也不会提供固定等待时间。
如果真实值与初值不同，首次后台 render 仍可能很快完成，不能依赖用户必然看到初值。

## 四、更新时的两阶段模型

### 1. 先提交最新输入与旧 deferred 值

后续 `value` 按 `Object.is` 与当前 deferred 值不同时，React 先完成一次仍返回旧值的 render，再在
后台尝试新值：

```text
query:         react -> hooks
deferredQuery: react -> react -> hooks
```

第一次提交让 input 立即显示 `hooks`，结果区仍读取 `react`。后台 render 成功提交后，
`deferredQuery` 才追上 `hooks`。若期间又收到新的紧急更新，React 可以放弃旧的后台尝试，从最新值
重新开始。

若新 `value` 与当前 deferred 值按 `Object.is` 比较相同，则没有需要追赶的新值。对字符串、数字等
primitive，这通常等价于值相等；对对象和函数，比较的是身份。

### 2. 后台 render 可中断、可重启

后台 render 不阻塞用户输入。若用户在结果树准备期间继续输入，新紧急更新可以打断正在进行的后台
工作，React 再从最新值开始尝试。中间值不保证逐个提交，应用只能依赖最终 deferred 值追上最新值。

这个过程没有固定毫秒数。React 会尽快开始后台工作，但输入事件可以打断它；快设备上两次提交也可能
接近到难以肉眼观察。正确验收是值的先后关系与最终结果，不是帧数、render 次数或时间阈值。

### 3. Transition 内不会再增加一层 deferred render

如果本次更新已经处于 Transition 中，`useDeferredValue` 会在该次 render 中使用新值，不再另外创建
一轮 deferred render。Transition 已经把整个更新标记为非紧急工作，再叠加 Hook 不代表“多延迟一次”。

### 4. 未提交的后台 render 不运行 Effect

后台 render 只是一次候选结果。它被打断或因 Suspense 挂起时，其中的 Effect 不会运行。只有包含新
deferred 值的 UI 真正提交后，对应 Effect 才会执行。

因此，Promise 已就绪、计算已结束和用户已经看到新内容不是同一个时刻。需要记录已显示值时，应在
结果组件的 Effect 中记录，而不是在数据就绪回调中提前记录。

## 五、常用用法

### 1. input 读取最新值，结果读取 deferred 值

受控 input 必须继续绑定最新 `query`，只有允许落后的结果子树读取 `deferredQuery`：

```tsx
import { useDeferredValue, useState } from 'react'

function SearchPage() {
  const [query, setQuery] = useState('react')
  const deferredQuery = useDeferredValue(query)

  return (
    <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <SearchResults query={deferredQuery} />
    </>
  )
}
```

如果把 input 也绑定到 `deferredQuery`，输入显示就会落后，失去“紧急输入先更新”的边界。

### 2. 用 memo 跳过昂贵子树的紧急 render

`useDeferredValue` 本身不会让组件停止 render。父组件因 `query` 变化而进行紧急 render 时，只有结果
组件接收稳定的旧 `deferredQuery`，并且结果组件能因 props 未变而跳过 render，昂贵工作才不会在这一步
重复执行。常见组合是 `memo`：

```tsx
import { memo, useDeferredValue, useState } from 'react'

const SlowResults = memo(function SlowResults({ query }: { query: string }) {
  return <SearchResults query={query} />
})

function SearchPage() {
  const [query, setQuery] = useState('react')
  const deferredQuery = useDeferredValue(query)

  return (
    <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <SlowResults query={deferredQuery} />
    </>
  )
}
```

这里的职责不同：`useDeferredValue` 提供旧 prop，`memo` 允许 props 未变的子组件跳过 render。若结果
组件还有其他每次都变化的 prop，或计算发生在父组件中，`memo` 仍可能无法跳过工作。

### 3. stale 只表示结果值落后

可以比较最新值与 deferred 值，得到结果区是否陈旧：

```tsx
const isStale = query !== deferredQuery
```

界面应显示“结果正在追上最新输入”之类的文字，并可配合边框、背景或透明度加强提示。不能只依赖颜色，
状态文字应与结果区建立清楚的语义关系。

这个 boolean 只描述两个 UI 值不一致，不能证明网络请求在途、Promise pending、缓存未命中或服务端
工作尚未完成。它也不能替代错误、空结果或业务提交状态。

### 4. 与 Suspense 保留旧内容

`useDeferredValue` 与 Suspense 集成。若新 deferred 值让后台 render 挂起，用户继续看到旧内容，不会
因为这次后台更新重新看到 fallback。数据就绪后 React 再重试，并在新 UI 真正提交后运行对应 Effect。

这个保护只针对已经显示的内容。首次 render 没有旧内容时，子树挂起仍由最近的 Suspense 边界显示
fallback。错误也不由 `useDeferredValue` 处理，仍需交给负责错误状态的边界或数据层。

### 5. 保持对象身份稳定

在 render 中直接创建对象，会让每次 render 都得到新身份：

```tsx
const deferredFilter = useDeferredValue({ query, category })
```

即使字段值没变，`Object.is` 也会把它视为不同值，可能不断触发不必要的后台 render。优先传递 primitive，
或传入由 State、prop、模块常量等稳定所有权提供的对象。只有在已经需要稳定对象并且依赖明确时，才考虑
用 `useMemo` 建立可复用身份。

## 六、与相近方案的选择边界

### 1. 有 setter 时优先考虑 Transition

若当前代码拥有目标 State setter，可以在更新发生处用 `startTransition` 或 `useTransition` 标记整个更新。
若当前组件只能读取 prop 或自定义 Hook 返回值，可以考虑 `useDeferredValue`，只让 UI 的一部分落后。

二者都用于非阻塞渲染，但控制入口不同：Transition 标记更新，`useDeferredValue` 延迟某个读取值。前者可由
`useTransition` 提供 `isPending`，后者没有 pending boolean，只能根据最新值与 deferred 值判断 UI 是否
陈旧。

### 2. 与 debounce、throttle 的区别

| 方案 | 控制对象 | 时间语义 | 是否减少回调或请求次数 | 常见用途 |
| --- | --- | --- | --- | --- |
| `useDeferredValue` | React render 读取的值 | 无固定延迟，后台工作可中断 | 否 | 让昂贵结果子树暂时显示旧内容 |
| debounce | 函数调用 | 连续触发停止一段时间后调用 | 通常会 | 搜索请求、保存或校验的输入合并 |
| throttle | 函数调用 | 固定时间窗口内限制频率 | 通常会 | 滚动、拖动或连续采样限频 |

debounce 和 throttle 控制“函数何时、多久调用一次”；`useDeferredValue` 控制“某部分 React UI 暂时读取
哪个值”。需要同时优化输入反馈和请求频率时，可以分别使用，但必须把两种职责分开建模。

### 3. 不会自动减少网络请求

如果请求逻辑由最新 `query` 触发，每次键入仍可能发起请求；`useDeferredValue` 不提供去重、缓存、取消、
竞态处理或“只保留最后一次请求”的能力。即使结果区读取 `deferredQuery`，也不能据此声称网络次数减少。

真实数据场景通常还需要缓存已完成结果，使旧内容可以立即读取，并由数据层处理过期响应。这里的网络
职责独立于 stale UI，不应塞进 `useDeferredValue` 的状态判断。

### 4. 不会让慢计算本身变快

Hook 改变工作优先级和界面提交顺序，不减少算法复杂度。若单次结果计算本身过慢，仍应先减少数据量、
改进算法、移动计算位置或拆分组件，再根据测量决定是否使用 memoization 和 deferred render。

## 七、Demo：观察陈旧结果追赶

点击“输入 hooks”后，input 和最新 query 立即变化，结果仍显示 `react`，状态明确标记为陈旧。此时
后台结果由实例级本地 gate 挂起，已显示结果不会闪回 fallback。点击“推进当前结果”，等结果标题、
deferred query 和 Effect commit 都追上 `hooks` 后，状态恢复同步。重建实验会创建全新的本地资源。

:::demo{id="react.core.learn.advanced.use-deferred-value-stale-content.stale-results-demo"}
:::

观察时依次核对：

1. input 与“最新 query”先变为新值。
2. “deferred query”、结果标题和最近 Effect commit 仍是旧值。
3. stale 文案明确说明旧结果仍在显示，Suspense fallback 没有替换已显示内容。
4. 推进结果后，deferred query、结果和 Effect commit 一起追上，stale 文案消失。
5. 快速切换多个搜索词时，只要求最终结果追上最新词，不要求中间词逐个提交。

Demo 的 gate 只用于确定性地控制本地 Promise 何时就绪，不代表网络、缓存或定时器。它把“Promise
可重试”和“新 UI 已提交”分开，便于观察 Effect 的真实提交边界。

## 八、易错使用提示

:::pitfalls
### 错误一：把 deferred 值绑定回 input

**触发条件：** 为了“统一使用延迟值”，让受控 input 也读取 `deferredQuery`。

**原因：** 混淆了紧急输入 State 与允许落后的结果子树。

**后果：** input 显示也会落后，无法保持直接输入反馈。

**错误示例：**

```tsx
<input value={deferredQuery} onChange={(event) => setQuery(event.target.value)} />
```

**正确写法：**

```tsx
<input value={query} onChange={(event) => setQuery(event.target.value)} />
```

**验证方式：** stale 期间 input DOM value 等于最新 query，而结果区仍可显示旧 deferred query。

### 错误二：把 stale 当成网络 pending

**触发条件：** 根据 `query !== deferredQuery` 显示“请求仍在发送”。

**原因：** stale 比较只观察两个 UI 值，不知道任何请求或 Promise 状态。

**后果：** 界面会把渲染落后错误解释为远程数据状态。

**错误示例：**

```tsx
const isRequestPending = query !== deferredQuery
```

**正确写法：**

```tsx
const isStale = query !== deferredQuery
```

**验证方式：** 即使 Demo 没有任何网络请求，stale 仍能准确表达结果值落后。

### 错误三：在 render 中创建新对象

**触发条件：** 每次 render 都立即创建对象并传给 `useDeferredValue`。

**原因：** 新对象每次都有不同身份，`Object.is` 比较不会把它们视为相同值。

**后果：** 即使查询文本没变，也会产生不必要的后台 render。

**错误示例：**

```tsx
const deferredFilter = useDeferredValue({ query })
```

**正确写法：**

```tsx
const deferredQuery = useDeferredValue(query)
```

**验证方式：** 本课只传 primitive string；对象场景先在数据所有权处建立稳定身份。

### 错误四：假设存在固定延迟

**触发条件：** 把 deferred 更新写成“等待 300ms 后执行”。

**原因：** `useDeferredValue` 没有时间窗口，后台工作会尽快开始并可被紧急更新打断。

**后果：** 基于毫秒的测试会随设备和调度变化而不稳定。

**错误示例：**

```tsx
await wait(300)
expect(deferredQuery).toBe(query)
```

**正确写法：**

```tsx
expect(inputValue).toBe(query)
expect(displayedQuery).toBe(deferredQuery)
```

**验证方式：** 只验证输入先更新、旧结果保持和最终追上，不固定耗时或 render 次数。

### 错误五：把 gate 兑现当成 DOM commit

**触发条件：** 点击推进按钮后立刻记录“新结果已显示”。

**原因：** Promise 就绪只让 React 可以重试，不能证明新 render 已提交。

**后果：** 日志可能先于用户实际看到的新结果。

**错误示例：**

```tsx
resource.release(query)
setCommittedQuery(query)
```

**正确写法：**

```tsx
useEffect(() => {
  setCommittedQuery(deferredQuery)
}, [deferredQuery])
```

**验证方式：** 等结果标题、deferred query、stale 文案和 Effect 记录一起追上最新值。

### 错误六：在 Transition 内期待再次延迟

**触发条件：** 来源更新已经在 Transition 中，却仍断言 deferred 值必然保留旧值。

**原因：** 更新已经是非紧急工作时，Hook 会直接使用新值，不再启动 deferred render。

**后果：** Demo 和测试会依赖官方没有承诺的第二层延迟。

**错误示例：**

```tsx
startTransition(() => setQuery('hooks'))
const deferredQuery = useDeferredValue(query)
```

**正确写法：**

```tsx
setQuery('hooks')
const deferredQuery = useDeferredValue(query)
```

**验证方式：** 本课让 query 普通更新，只把 deferredQuery 交给结果子树。

### 错误七：把 useDeferredValue 当作 debounce

**触发条件：** 认为使用 Hook 后，搜索函数或网络请求只会在停止输入时执行一次。

**原因：** Hook 调度的是 React render，不限制事件、函数或请求的调用频率。

**后果：** 请求仍可能逐次发出，应用缺少真正的频率控制、取消和竞态处理。

**错误示例：**

```tsx
const deferredQuery = useDeferredValue(query)
requestResults(query) // 错误地假设请求已经被 Hook 防抖
```

**正确写法：**

```tsx
const deferredQuery = useDeferredValue(query) // 控制结果 UI 读取的值
const debouncedQuery = useDebouncedQuery(query, 300) // 控制请求触发值
```

**验证方式：** 分别记录 `debouncedQuery` 的变化次数与 deferred 结果提交值，确认两者不是同一个状态。

### 错误八：认为 Hook 会让慢计算变快

**触发条件：** 在父组件中每次都执行昂贵计算，只把计算结果传给 `useDeferredValue`。

**原因：** 昂贵计算已经在得到 Hook 参数之前执行，Hook 无法撤销这次工作。

**后果：** 输入仍被同步计算阻塞，还额外增加后台 render。

**错误示例：**

```tsx
const deferredResults = useDeferredValue(expensiveSearch(items, query))
```

**正确写法：**

```tsx
const deferredQuery = useDeferredValue(query)
return <MemoizedResults items={items} query={deferredQuery} />
```

**验证方式：** 确认紧急 render 只更新 input，昂贵结果组件在 deferred prop 不变时能够跳过工作。

### 错误九：把 initialValue 当成每次更新的 fallback

**触发条件：** 期望每次 `value` 变化时都先返回 `initialValue`。

**原因：** 第二参数只影响首次 render；后续更新保留的是上一个 deferred 值。

**后果：** 页面状态设计依赖不存在的反复重置，实际显示值与预期不一致。

**错误示例：**

```tsx
const deferredQuery = useDeferredValue(query, '')
// 错误地假设 query 每次变化时 deferredQuery 都先变回空字符串
```

**正确写法：**

```tsx
const deferredQuery = useDeferredValue(query, '')
const isStale = query !== deferredQuery
```

**验证方式：** 首次 render 单独验证初值；后续更新验证 deferred 值先保留上一版，再追上最新值。
:::

## 九、源码推导与适用场景

### 1. 公共签名和官方行为

- 公共签名表明输入、可选初值与返回值共享类型 `T`，因此 Hook 不会额外返回 setter 或 pending 状态。
- React 19 发布说明确定 `initialValue` 的引入版本；该参数只改变首次 render 的返回值。
- 官方 Reference 以 `Object.is` 描述值比较，并明确更新时先返回旧值、再启动可中断的后台 render。
- 官方 Suspense 合同说明 deferred 更新挂起时保留已显示内容；后台 render 未提交前不会运行其 Effect。
- 官方明确说明 Hook 没有固定延迟，也不会阻止每次键入触发的网络请求。

源码只用于旁证当前版本怎样实现这些公开行为。调度优先级名称、Fiber 字段和内部队列不是公共 API，应用
不能依赖这些内部细节。

### 2. 从合同推导组件设计

1. 输入框必须读取最新 State，因为延迟的是结果子树，不是输入反馈。
2. 结果子树读取 deferred 值，才能在紧急 render 中继续接收旧 prop。
3. 对本地昂贵子树，稳定旧 prop 通常还要配合 `memo`，否则父组件 render 仍会带动子组件执行。
4. 对会挂起的结果子树，Suspense 提供旧内容保护；首次加载仍需正常 fallback。
5. stale 文案由最新值与 deferred 值比较得到，只描述 UI 版本关系，不冒充数据层状态。
6. 需要控制请求次数时另用 debounce、throttle 或数据层方案，不能从 deferred 值推导请求完成状态。

### 3. 适合与不适合的场景

适合：

- 输入、选择或筛选必须立即反馈，而列表、图表、预览等结果可以短暂落后。
- 当前组件只有一个不断变化的 prop 或自定义 Hook 返回值，无法控制产生该值的 setter。
- 结果树能根据稳定 prop 跳过昂贵 render，或新结果会在 Suspense 边界内挂起。
- 页面能明确告诉用户当前显示的是旧结果，并保证最终追上最新值。

不适合：

- 登录状态、权限、价格、库存、支付结果等不允许短暂陈旧的正确性数据。
- 目标只是固定等待若干毫秒、减少请求次数、取消旧请求或保证响应顺序。
- 慢操作发生在事件处理器、Hook 调用之前或 React render 之外。
- 当前代码已经拥有 setter，使用 Transition 能更直接地标记整次非紧急更新。

## 十、练习

:::exercise
### 练习一：记录陈旧结果追赶过程

**要求：** 从冷状态输入 `hooks`，在推进结果前记录 input、最新 query、deferred query、结果标题、stale
文案和 Effect commit；随后推进当前结果并再次记录。再重建实验，确认所有值恢复为 `react`。

**验收：** 推进前 input 与最新 query 已是 `hooks`，其余结果相关值仍是 `react` 且明确显示 stale；推进
后 deferred query、结果标题和 Effect commit 都追上 `hooks`，stale 消失；能解释为什么过程不依赖固定
毫秒数，也不能证明网络请求被减少。
:::

:::exercise
### 练习二：修复输入与结果边界

**要求：** 检查一个把 input 和结果组件都绑定到 `deferredQuery` 的页面。改为 input 读取最新 `query`，
结果组件读取 `deferredQuery`，并增加清楚的 stale 状态文字。

**验收：** 连续输入时 input 始终显示最新文本；结果可以短暂保留旧值；状态不能写成“请求中”，也不能
只通过颜色表达。
:::

:::exercise
### 练习三：选择正确的频率与渲染工具

**要求：** 分别判断三个需求应使用什么：让慢列表不阻塞输入、停止输入 300ms 后才发送查询、滚动期间
每 100ms 最多采样一次。说明 `useDeferredValue`、debounce 和 throttle 各自控制什么。

**验收：** 慢列表选择 deferred render；停止输入后调用选择 debounce；固定窗口限频选择 throttle。答案
明确指出 `useDeferredValue` 不减少请求次数，也没有固定毫秒语义。
:::

## 十一、本节小结

- `useDeferredValue` 让结果子树暂时读取旧值，不延迟受控 input 自身。
- 第二参数只影响首次 render；后续更新保留上一个 deferred 值。
- 更新先提交旧 deferred 值，再在可中断的后台 render 中尝试新值，没有固定等待时间。
- `query !== deferredQuery` 只表达 UI stale，必须用清楚文字告知用户。
- 后台 render 挂起时 Suspense 保留旧内容，Effect 等新结果真正提交后才运行。
- 稳定 deferred prop 常与 `memo` 配合，让昂贵子树跳过紧急 render 中的重复工作。
- 有 setter 时可使用 Transition；只有读取值时可考虑 deferred value。
- Hook 不提供防抖、限流、缓存、取消或性能保证，render 内新对象也会破坏稳定身份。

## 十二、参考资料

- [useDeferredValue](https://react.dev/reference/react/useDeferredValue) - Hook 参数、返回值、更新两阶段、可中断后台 render、Suspense 与 Effect 边界。
- [startTransition](https://react.dev/reference/react/startTransition) - 有目标 State setter 时使用 Transition，以及只有值时考虑 deferred value 的选择边界。
- [Suspense](https://react.dev/reference/react/Suspense) - deferred 更新挂起时保留已显示内容而不重新展示 fallback。
- [React 19](https://react.dev/blog/2024/12/05/react-19#use-deferred-value-initial-value) - `initialValue` 参数的引入版本与首次 render 语义。
