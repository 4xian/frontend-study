---
id: react.data.learn.basics.first-use-query
type: lesson
title: 第一个 useQuery
summary: 在 React 组件中声明一个最小查询，并读取它返回的远程数据。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 35
prerequisites:
  - react.data.learn.basics.query-client-and-provider
related: []
tags:
  - TanStack Query
  - useQuery
  - 查询声明
  - React
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能在 QueryClientProvider 子树中的组件里调用 useQuery。
  - 能为 useQuery 提供 queryKey 和返回 Promise 的 queryFn。
  - 能从查询结果中读取 data，并在数据尚未可用时显示等待内容。
  - 能解释 useQuery 如何把数据声明连接到 React 组件渲染。
  - 能判断一个读取远程数据的组件是否应该使用 useQuery。
recap:
  - useQuery 在组件中声明对异步数据的依赖，返回可用于渲染的查询结果。
  - 最小配置包含 queryKey 和 queryFn；queryFn 必须返回 Promise。
  - 按本课默认用法，查询组件位于 QueryClientProvider 子树中。
  - 本课只建立第一个可运行查询的结构，查询函数、键组织和完整状态模型另行展开。
sources:
  - title: Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询是绑定到唯一 key 的异步数据依赖。
      - useQuery 至少需要唯一 queryKey 和返回 Promise 的 queryFn。
      - 查询结果包含用于渲染的 data 等信息。
  - title: useQuery
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useQuery 接收查询选项并返回查询结果。
      - queryKey 是必需选项；没有默认 queryFn 时 queryFn 也是必需选项。
      - queryFn 必须返回解析数据或抛出错误的 Promise，数据不能为 undefined。

---

# 第一个 useQuery

## 一、学习目标

- 在 `QueryClientProvider` 子树中的组件里调用 `useQuery`。
- 为 `useQuery` 提供 `queryKey` 和返回 Promise 的 `queryFn`。
- 从查询结果中读取 `data`，并在数据尚未可用时显示等待内容。
- 解释 `useQuery` 如何把数据声明连接到 React 组件渲染。
- 判断一个读取远程数据的组件是否应该使用 `useQuery`。

## 二、为什么需要 useQuery

组件需要远程数据时，手动组合 `useEffect`、`useState` 和请求函数，必须自己维护请求何时开始、数据放在
哪里以及组件何时重新渲染。这样的连接代码会让“组件需要什么数据”和“如何同步数据”混在一起。

`useQuery` 把这件事改成一个声明：组件声明自己依赖一份异步数据，TanStack Query 负责把查询结果交给
组件。组件只需要根据结果决定当前界面显示什么，不必手动创建一份远程数据副本。

本课先完成一条最小可运行路径：在已提供客户端的组件中调用 `useQuery`，等待查询结果，并把 `data` 渲染
出来。请求函数的具体写法和查询标识的组织规则只在这里建立接口位置，不在本课展开。

## 三、useQuery 的最小模型

### 1. 在组件中声明查询

`useQuery` 接收一个选项对象。最小配置包含两个字段：

- `queryKey`：这份查询的稳定标识。
- `queryFn`：返回 Promise 的数据读取函数。

```tsx
import { useQuery } from '@tanstack/react-query'

function TaskList() {
  const taskQuery = useQuery({
    queryKey: ['lesson-tasks'],
    queryFn: loadTasks,
  })

  if (taskQuery.isPending) {
    return <p>正在读取任务...</p>
  }

  return (
    <ul>
      {taskQuery.data.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}
```

这个组件没有手动调用请求，也没有把远程结果复制到 `useState`。调用 `useQuery` 后，组件会得到一个查询
结果对象；当数据可用时，从结果对象读取 `data` 即可渲染列表。

### 2. queryKey 只承担标识职责

`queryKey` 是数组形式的查询标识。当前示例使用一个固定字符串，只为了让这份查询拥有明确身份；动态参数
如何进入 key、如何组织多层 key，不属于本课的重点。

### 3. queryFn 提供异步结果

`queryFn` 必须返回一个 Promise。它可以调用任意 Promise 型数据源，只要最终解析出要交给组件的数据；本课
使用一个延迟 Promise 作为最小示例。浏览器 `fetch` 的响应检查、解析和错误转换属于请求函数专题。

### 4. 查询结果连接渲染

`useQuery` 返回的对象包含 `data` 和等待等查询信息。组件可以直接读取这些信息决定渲染分支：

```tsx
const taskQuery = useQuery({
  queryKey: ['lesson-tasks'],
  queryFn: loadTasks,
})

if (taskQuery.isPending) {
  return <p>正在读取任务...</p>
}

return <TaskRows tasks={taskQuery.data} />
```

这里的 `isPending` 只用于让最小示例在首次没有数据时有可观察的等待界面；查询状态的完整组合和错误分支
不在本课展开。

## 四、常规写法与使用边界

### 1. 先确认 Provider 作用域

按本课默认用法，调用 `useQuery` 的组件位于 `QueryClientProvider` 子树中。客户端创建与 Provider 作用域
已经在前一课建立，本课只复用这个前置条件：

```tsx
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskList />
    </QueryClientProvider>
  )
}
```

### 2. 让查询结果直接成为视图输入

远程数据已经由查询管理。筛选条件、展开状态和输入草稿仍然属于组件自己的客户端状态，不要为了渲染列表
再复制一份远程数组：

```tsx
function TaskList() {
  const taskQuery = useQuery({
    queryKey: ['lesson-tasks'],
    queryFn: loadTasks,
  })

  if (taskQuery.isPending) return <p>正在读取任务...</p>

  return <TaskRows tasks={taskQuery.data} />
}
```

查询结果与本地交互状态可以同时存在，但它们的所有权不同。

### 3. 何时使用 useQuery

当数据来自异步或远程系统，并且组件需要随着这份数据的结果更新时，`useQuery` 是合适的读取入口。一次性
读取且不需要进入 React 渲染流程的工具脚本，不需要为了形式使用 Hook；Hook 也不用于提交写操作。

## 五、用法示例：读取一组任务

这个 Demo 用延迟 Promise 模拟一次异步读取。它展示 `useQuery` 的最小配置、等待分支和成功后的 `data`；
不引入网络请求、参数切换或缓存调优。

:::demo{id="react.data.learn.basics.first-use-query.first-use-query-demo"}
:::

刷新页面后观察任务列表从等待状态变为数据状态。列表数据来自 `useQuery` 返回结果，而不是组件额外维护的
远程数据副本。

## 六、易错使用提示

:::pitfalls
### 错误：在 Provider 外调用 useQuery

**触发条件：** 组件调用 `useQuery`，但渲染树上方没有 `QueryClientProvider`。

**原因：** 忽略了 `useQuery` 需要从当前 React 作用域取得 QueryClient。

**后果：** 运行时找不到查询客户端，组件无法建立查询连接。

**错误示例：**

```tsx
function App() {
  return <TaskList />
}
```

**正确写法：**

```tsx
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskList />
    </QueryClientProvider>
  )
}
```

**验证方式：** 确认调用 `useQuery` 的组件位于提供了 `client` 的 Provider 子树中。

### 错误：省略 queryKey

**触发条件：** 只传入 `queryFn`，没有为查询提供 `queryKey`。

**原因：** 把 `useQuery` 当成只负责执行函数的请求工具。

**后果：** 查询缺少用于标识和管理这份数据的必要身份，无法形成完整查询声明。

**错误示例：**

```tsx
const taskQuery = useQuery({
  queryFn: loadTasks,
})
```

**正确写法：**

```tsx
const taskQuery = useQuery({
  queryKey: ['lesson-tasks'],
  queryFn: loadTasks,
})
```

**验证方式：** 检查每个查询选项对象都包含数组形式的 `queryKey`。

### 错误：让 queryFn 没有返回可用数据

**触发条件：** `queryFn` 忘记返回数据，或显式解析为 `undefined`。

**原因：** 只启动了一个读取动作，却没有把它的 Promise 返回给查询。

**后果：** 查询拿不到可渲染的数据；解析为 `undefined` 也不符合查询结果的数据合同。

**错误示例：**

```tsx
const taskQuery = useQuery({
  queryKey: ['lesson-tasks'],
  queryFn: () => {
    loadTasks()
  },
})
```

**正确写法：**

```tsx
const taskQuery = useQuery({
  queryKey: ['lesson-tasks'],
  queryFn: async () => loadTasks(),
})
```

**验证方式：** 查看 `queryFn` 的返回类型，确认它返回解析为数据的 Promise 且不会解析为 `undefined`。

### 错误：把查询结果复制到本地 State

**触发条件：** 读取 `query.data` 后再用 `useState` 保存一份相同数组，并让两个来源共同驱动列表。

**原因：** 把查询结果误认为必须手动接管的组件状态。

**后果：** 两份数据可能出现不同步，远程数据的更新无法可靠地反映到本地副本。

**错误示例：**

```tsx
const taskQuery = useQuery({
  queryKey: ['lesson-tasks'],
  queryFn: loadTasks,
})
const [tasks, setTasks] = useState(taskQuery.data ?? [])
```

**正确写法：**

```tsx
const taskQuery = useQuery({
  queryKey: ['lesson-tasks'],
  queryFn: loadTasks,
})

if (taskQuery.isPending) return <p>正在读取任务...</p>

return <TaskRows tasks={taskQuery.data} />
```

**验证方式：** 删除本地远程数据副本，只让列表使用 `query.data` 渲染。

### 错误：用旧的多参数形式调用 useQuery

**触发条件：** 把查询 key 和函数作为多个位置参数传入 `useQuery`。

**原因：** 沿用旧版本示例，没有按照当前对象选项合同调用 Hook。

**后果：** 当前版本的类型检查或运行时会拒绝这类调用，查询无法按预期建立。

**错误示例：**

```tsx
const taskQuery = useQuery(['lesson-tasks'], loadTasks)
```

**正确写法：**

```tsx
const taskQuery = useQuery({
  queryKey: ['lesson-tasks'],
  queryFn: loadTasks,
})
```

**验证方式：** 让 TypeScript 检查调用签名，并确认查询参数集中在一个对象中。
:::

## 七、原理与适用场景

### 1. 官方事实

官方 Queries 指南把查询定义为绑定到唯一 key 的异步数据依赖，并要求 `useQuery` 至少接收唯一的
`queryKey` 和返回 Promise 的 `queryFn`。官方 `useQuery` Reference 还规定，查询函数必须解析数据或抛出
错误，数据不能是 `undefined`。

### 2. 课程推导

可以把 `useQuery` 看成“组件对一份异步数据的声明”。组件提供识别信息和数据读取函数，再从 Hook 返回值
决定渲染内容；这样远程数据的同步责任留在查询工具中，组件只处理视图表达。

### 3. 适用边界

`useQuery` 适合读取异步或远程数据，不用于提交写操作，也不替代 React 的局部交互状态。查询函数的 HTTP
细节、查询 key 的参数组织和完整状态处理需要单独建立规则，本课不把这些主题混在最小示例里。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建一个位于 `QueryClientProvider` 子树中的 `TaskList` 组件，使用 `useQuery` 读取一个返回
Promise 的固定任务列表，并在数据可用后渲染任务标题。

**验收：** `useQuery` 使用对象形式的 `queryKey` 和 `queryFn`；首次渲染能显示等待内容；Promise 完成后
能显示全部任务标题；组件没有为远程列表创建第二份 `useState` 副本。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

type Task = {
  id: string
  title: string
}

const queryClient = new QueryClient()
const tasks: Task[] = [
  { id: 't-201', title: '整理查询参数' },
  { id: 't-202', title: '检查任务状态' },
]

/** 返回一组可被 useQuery 读取的异步任务数据。 */
function loadTasks(): Promise<Task[]> {
  return Promise.resolve(tasks)
}

/** 声明任务查询并把查询结果渲染为列表。 */
function TaskList() {
  const taskQuery = useQuery({
    queryKey: ['lesson-exercise-tasks'],
    queryFn: loadTasks,
  })

  if (taskQuery.isPending) {
    return <p>正在读取任务...</p>
  }

  return (
    <ul>
      {taskQuery.data.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}

/** 在应用边界提供稳定的 QueryClient。 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskList />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- `useQuery` 在 React 组件中声明对一份异步数据的依赖。
- 最小配置是数组形式的 `queryKey` 和返回 Promise 的 `queryFn`。
- 按默认客户端用法，查询组件位于 `QueryClientProvider` 子树中。
- 组件直接从查询结果读取 `data`，不需要复制一份远程数据到本地 State。

## 十、参考资料

- [Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries) - 查询的最小组成和结果读取规则。
- [useQuery](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) - 当前 `useQuery` 选项与返回结果合同。
