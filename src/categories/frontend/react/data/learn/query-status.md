---
id: react.data.learn.basics.query-status
type: lesson
title: 查询状态
summary: 区分数据状态与查询函数执行状态，准确渲染首次加载和后台重新获取。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 35
prerequisites:
  - react.data.learn.basics.query-key
related: []
tags:
  - TanStack Query
  - status
  - fetchStatus
  - isPending
  - isFetching
  - isLoading
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能说明 status 描述查询数据是否可用，并列出 pending、error、success 三种值。
  - 能说明 fetchStatus 描述 queryFn 是否正在执行，并列出 fetching、paused、idle 三种值。
  - 能区分 isPending、isLoading、isFetching 和 isRefetching 的判断范围。
  - 能为首次查询和已有数据时的后台重新获取选择不同的界面提示。
  - 能在读取 data 前先完成查询状态判断，避免在数据尚未成功时直接渲染结果。
recap:
  - status 关注数据，pending 表示还没有成功数据，success 表示已有可用数据，error 表示本次执行失败。
  - fetchStatus 关注 queryFn，fetching 表示执行中，paused 表示想执行但被暂停，idle 表示当前未执行。
  - isLoading 只表示首次查询正在执行，等于 isPending && isFetching。
  - isFetching 也覆盖后台重新获取；已有数据时可以同时出现 success 与 fetching。
  - 先处理 pending 和 error，再读取 data，是安全且可被 TypeScript 收窄的渲染顺序。
sources:
  - title: Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询结果的 status 只有 pending、error、success 三种状态。
      - isPending、isError、isSuccess 是 status 的便利派生值。
      - isFetching 在初次获取和后台重新获取期间都为 true。
      - fetchStatus 有 fetching、paused、idle 三种值，并与 status 分别描述 queryFn 和数据。
  - title: useQuery Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - status、fetchStatus、isPending、isFetching、isRefetching 和 isLoading 都是 useQuery 返回结果的一部分。
      - isLoading 等于 isFetching && isPending，isRefetching 等于 isFetching && !isPending。
      - enabled 为 false 且尚未执行的查询可以处于 pending 与 idle 的组合。

---

# 查询状态

## 一、学习目标

- 说明 `status` 描述查询数据是否可用，并列出 `pending`、`error`、`success` 三种值。
- 说明 `fetchStatus` 描述 `queryFn` 是否正在执行，并列出 `fetching`、`paused`、`idle` 三种值。
- 区分 `isPending`、`isLoading`、`isFetching` 和 `isRefetching` 的判断范围。
- 为首次查询和已有数据时的后台重新获取选择不同的界面提示。
- 在读取 `data` 前先完成查询状态判断，避免在数据尚未成功时直接渲染结果。

## 二、为什么需要两组状态

查询界面经常同时面对两个问题：有没有可显示的数据，以及查询函数现在是否正在运行。首次查询时，页面
可能既没有数据又正在请求；后台重新获取时，页面已经有旧数据，但查询函数仍在运行。只用一个 `loading`
布尔值无法表达这两种不同体验。

TanStack Query 将它们拆成两组状态：`status` 说明数据处于什么阶段，`fetchStatus` 说明查询函数的执行
活动。把两个维度分开后，组件可以在保留已有内容的同时提示后台更新，也可以在完全没有数据时显示首次加载。

## 三、核心状态模型

### 1. status 描述数据

`status` 只有三个值：

- `pending`：还没有成功得到查询数据。
- `error`：最近一次查询执行以错误结束。
- `success`：查询已经得到可用数据。

对应的 `isPending`、`isError` 和 `isSuccess` 是同一组状态的布尔派生值。它们回答的是“数据现在处于哪一
个阶段”，不是“网络请求此刻是否仍在运行”。

### 2. fetchStatus 描述 queryFn

`fetchStatus` 也有三个值：

- `fetching`：`queryFn` 当前正在执行。
- `paused`：查询想要执行，但当前执行被暂停，例如网络模式暂时不允许请求。
- `idle`：当前没有执行中的 `queryFn`。

对应的 `isFetching` 和 `isPaused` 是执行状态的布尔派生值。`fetchStatus` 可以在任意 `status` 下变化，因此
不能用它替代数据状态。

### 3. 两组状态可以组合

常见组合包括：

| status | fetchStatus | 含义 |
| --- | --- | --- |
| `pending` | `idle` | 还没有数据，当前没有执行查询，例如查询尚未启动。 |
| `pending` | `fetching` | 还没有数据，首次查询正在执行。 |
| `success` | `idle` | 已有数据，当前没有执行查询。 |
| `success` | `fetching` | 已有数据，正在后台重新获取。 |

`error` 也可以与 `idle` 或后续的执行状态组合。具体错误展示属于下一课；本课先把它作为 `status` 的一个
数据阶段来识别。

## 四、派生判断与渲染顺序

### 1. isLoading 只表示首次查询

`isLoading` 的定义是 `isFetching && isPending`。它只在“没有数据且 `queryFn` 正在执行”时为 `true`。
因此，后台重新获取时 `isFetching` 为 `true`，但 `isLoading` 为 `false`。

```tsx
const tasksQuery = useQuery({
  queryKey: ['tasks'],
  queryFn: loadTasks,
})

if (tasksQuery.isLoading) {
  return <span>首次加载中</span>
}
```

如果界面需要表达“任何查询执行活动”，应使用 `isFetching`；如果只想表达“首次没有数据的加载”，才使用
`isLoading`。

### 2. isRefetching 表示已有数据时的执行

`isRefetching` 的定义是 `isFetching && !isPending`。它描述首次查询之后的重新获取过程，常用于在已有列表
旁边显示轻量的更新提示：

```tsx
if (tasksQuery.isSuccess) {
  return (
    <section>
      {tasksQuery.isRefetching && <small>正在更新</small>}
      <TaskList tasks={tasksQuery.data} />
    </section>
  )
}
```

这里保留了 `data`，不会因为后台请求而把整个列表替换成空白加载页。

### 3. 先判断状态再读取 data

常规渲染顺序是先处理没有成功数据的状态，再渲染成功数据：

```tsx
const { isPending, isError, data, error } = useQuery({
  queryKey: ['tasks'],
  queryFn: loadTasks,
})

if (isPending) {
  return <span>加载中</span>
}

if (isError) {
  return <span>{error.message}</span>
}

return <TaskList tasks={data} />
```

在完成 `pending` 和 `error` 判断后，TypeScript 能把 `data` 收窄为成功查询的数据类型。这个顺序同时让
界面逻辑和查询状态模型保持一致。

## 五、用法示例：观察查询状态组合

下面的 Demo 使用一个可取消的本地延迟 Promise。初始查询被暂时关闭，以便先观察 `pending + idle`；点击
开始后会进入 `pending + fetching`，成功后再次点击则会保留数据并进入 `success + fetching`。Demo 中的
`enabled: false` 只用于控制观察起点，不展开条件查询规则。

:::demo{id="react.data.learn.basics.query-status.query-status-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：用 isFetching 替换已有数据

**触发条件：** 只要 `isFetching` 为 `true` 就返回完整的加载占位，连后台重新获取也清空列表。

**原因：** 把“queryFn 正在执行”和“页面没有数据”当成同一个条件。

**后果：** 后台更新时页面闪烁，用户暂时失去已经可读的内容。

**错误示例：**

```tsx
if (tasksQuery.isFetching) {
  return <FullPageSpinner />
}

return <TaskList tasks={tasksQuery.data} />
```

**正确写法：**

```tsx
if (tasksQuery.isPending) {
  return <FullPageSpinner />
}

if (tasksQuery.isError) {
  return <span>{tasksQuery.error.message}</span>
}

return (
  <section>
    {tasksQuery.isRefetching && <small>正在更新</small>}
    <TaskList tasks={tasksQuery.data} />
  </section>
)
```

**验证方式：** 在已有数据后触发重新获取，确认列表继续显示，同时出现更新提示。

### 错误：把 isLoading 当成所有请求活动

**触发条件：** 用 `isLoading` 判断首次请求和已有数据时的后台重新获取。

**原因：** 忽略 `isLoading` 是 `isPending && isFetching` 的组合条件。

**后果：** 后台重新获取时 `isLoading` 为 `false`，通用请求指示器不会显示。

**错误示例：**

```tsx
return <HeaderIndicator active={tasksQuery.isLoading} />
```

**正确写法：**

```tsx
return <HeaderIndicator active={tasksQuery.isFetching} />
```

**验证方式：** 分别观察首次查询和成功后的重新获取，确认两次 `isFetching` 都为 `true`，只有首次查询的
`isLoading` 为 `true`。

### 错误：把 status 和 fetchStatus 当成同一组值

**触发条件：** 用 `status === 'fetching'` 判断查询函数是否在执行，或用 `fetchStatus === 'success'` 判断
数据是否可用。

**原因：** 没有区分数据阶段和函数执行阶段。

**后果：** 条件永远无法匹配真实状态，界面提示会缺失或错误。

**错误示例：**

```tsx
if (tasksQuery.status === 'fetching') {
  return <span>请求中</span>
}
```

**正确写法：**

```tsx
if (tasksQuery.fetchStatus === 'fetching') {
  return <span>请求中</span>
}
```

**验证方式：** 点击重新获取，确认 `status` 仍可能是 `success`，而 `fetchStatus` 暂时变为 `fetching`。

### 错误：还没有完成状态判断就读取 data

**触发条件：** 组件首次渲染时直接对 `data` 调用 `map` 或读取属性。

**原因：** 把查询结果当成同步函数返回值，没有先处理 `pending`。

**后果：** 首次没有数据时会读取 `undefined`，导致渲染异常或被迫加入重复的空值判断。

**错误示例：**

```tsx
return <TaskList tasks={tasksQuery.data} />
```

**正确写法：**

```tsx
if (tasksQuery.isPending) {
  return <span>加载中</span>
}

if (tasksQuery.isError) {
  return <span>{tasksQuery.error.message}</span>
}

return <TaskList tasks={tasksQuery.data} />
```

**验证方式：** 在查询尚未成功时刷新页面，确认组件先渲染等待状态，不会访问未定义的 `data`。

### 错误：把 paused 当成 idle

**触发条件：** 只要 `fetchStatus` 不是 `fetching` 就显示“查询已完成”。

**原因：** 忽略 `paused` 表示查询想执行但暂时无法执行。

**后果：** 用户会把等待网络恢复误认为查询已经结束。

**错误示例：**

```tsx
const message = tasksQuery.fetchStatus === 'fetching' ? '请求中' : '已完成'
```

**正确写法：**

```tsx
const message =
  tasksQuery.fetchStatus === 'fetching'
    ? '请求中'
    : tasksQuery.fetchStatus === 'paused'
      ? '等待执行'
      : '当前空闲'
```

**验证方式：** 在支持暂停查询的网络模式下断开网络，确认暂停状态有单独提示。
:::

## 七、源码推导与适用场景

### 1. 官方事实

TanStack Query 的 Queries 指南将查询结果分为 `pending`、`error`、`success` 三种 `status`，并说明
`isPending`、`isError`、`isSuccess` 是对应的便利值。指南同时定义 `fetchStatus` 的 `fetching`、`paused`、
`idle` 三种值，并指出它描述的是 `queryFn` 是否正在执行；`isFetching` 在首次请求和后台重新获取时都可能
为 `true`。useQuery Reference 进一步给出 `isLoading = isFetching && isPending`、`isRefetching =
isFetching && !isPending` 的定义。

### 2. 课程推导

可以先问“现在有没有可显示的数据”，再问“查询函数是否正在工作”：前一个答案决定 `status` 分支，后一个
答案决定是否增加执行中的轻量提示。这样既能避免首次空数据渲染异常，也能在后台更新时保留已有内容。

### 3. 适用边界

本课只建立查询结果的状态模型。错误对象如何展示和重试策略属于下一课；缓存新鲜度、后台重新获取触发
条件、缓存生命周期和条件查询的完整配置会在后续课程展开。本 Demo 使用 `enabled: false` 只为了固定观察
起点，不把它当作条件查询教程。

## 八、练习

:::exercise
### 练习目标

**要求：** 为一个 `useQuery` 结果编写渲染分支：没有数据时显示“加载中”，失败时显示错误信息，成功时显示
`data`；如果成功后仍在重新获取，则在列表上方显示“正在更新”。

**验收：** `pending` 状态不会读取 `data`；`error` 状态显示 `error.message`；成功状态渲染 `data`；后台
重新获取时列表不消失且出现更新提示。

**参考答案：**

```tsx
import { useQuery } from '@tanstack/react-query'

type Task = {
  id: string
  title: string
}

declare function loadTasks(): Promise<Task[]>

/** 渲染已经确认成功的任务数据。 */
function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}

/** 按数据状态渲染任务列表，并单独提示已有数据的后台更新。 */
function TasksPanel() {
  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: loadTasks,
  })

  if (tasksQuery.isPending) {
    return <span>加载中</span>
  }

  if (tasksQuery.isError) {
    return <span>{tasksQuery.error.message}</span>
  }

  return (
    <section>
      {tasksQuery.isRefetching && <small>正在更新</small>}
      <TaskList tasks={tasksQuery.data} />
    </section>
  )
}
```
:::

## 九、本节小结

- `status` 回答“有没有可用数据”，`fetchStatus` 回答“`queryFn` 是否正在执行”。
- 首次查询通常是 `pending + fetching`，已有数据后台更新可以是 `success + fetching`。
- `isLoading` 只覆盖首次执行，`isFetching` 覆盖首次执行和后台重新获取，`isRefetching` 只覆盖已有数据时的执行。
- 先处理 `pending` 和 `error`，再读取 `data`，可以得到清晰的 UI 分支和 TypeScript 类型收窄。

## 十、参考资料

- [Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries) - 查询 `status`、派生值和
  `fetchStatus` 的定义。
- [useQuery Reference](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) -
  `isLoading`、`isRefetching`、`status` 和 `fetchStatus` 的返回合同。
