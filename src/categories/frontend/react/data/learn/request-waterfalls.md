---
id: react.data.learn.advanced.request-waterfalls
type: lesson
title: 请求瀑布优化
summary: 父组件等自己的查询完成再挂子查询会串行。把互不依赖的查询提升到同一层，两条请求一起开始。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.dependent-queries
  - react.data.learn.intermediate.parallel-queries
  - react.data.learn.basics.query-status
related:
  - react.data.learn.advanced.query-prefetching
  - react.data.learn.advanced.react-router-query-integration
  - react.data.learn.basics.first-use-query
tags:
  - TanStack Query
  - 请求瀑布
  - 嵌套查询
  - 并行查询
  - queryOptions
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能说明请求瀑布是后一次请求等前一次完成才开始。
  - 能识别父组件等自己的查询完成再渲染子查询，会形成嵌套瀑布。
  - 能判断子查询只用已经有的 id 时，并不依赖父查询的结果。
  - 能把互不依赖的子查询提升到父组件，让两条请求一起开始。
  - 能说明真正依赖前一条结果的查询不能靠提升消掉瀑布。
recap:
  - 请求瀑布是后一次请求等前一次完成才开始。
  - 父组件等自己的查询完成再挂子查询，会形成嵌套瀑布。
  - 子查询只用已经有的 id 时，并不依赖父查询的结果。
  - 把互不依赖的查询提升到同一层，两条请求可以一起开始。
  - 本课不把代码分割、Suspense 串行或路由预取写成主线。
sources:
  - title: Performance & Request Waterfalls
    url: https://tanstack.com/query/latest/docs/framework/react/guides/request-waterfalls
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 请求瀑布是后一次资源请求等前一次完成才开始。
      - 父组件和子组件都有查询，且父组件等自己的查询完成才渲染子组件，会形成嵌套瀑布。
      - 子查询只用父组件渲染时已经有的 id，并不依赖父查询的结果。
      - 把子查询提升到父组件后，两条查询会并行。
      - 真正依赖父结果的嵌套查询不能只靠提升消掉瀑布。
  - title: Dependent Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 后一条查询要用前一条结果时，会形成请求瀑布。
  - title: Parallel Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/parallel-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 互不依赖的查询应同时执行。
      - 数量固定时并排多个 useQuery 就会并行。
---

# 请求瀑布优化

## 一、学习目标

- 说明请求瀑布是后一次请求等前一次完成才开始。
- 识别父组件等自己的查询完成再渲染子查询，会形成嵌套瀑布。
- 判断子查询只用已经有的 id 时，并不依赖父查询的结果。
- 把互不依赖的子查询提升到父组件，让两条请求一起开始。
- 说明真正依赖前一条结果的查询不能靠提升消掉瀑布。

## 二、为什么 nested 查询会多等一轮

任务详情和任务评论都认识 `t-1`。这个 id 在页面渲染时就已经有了，两条查询并不互相等待结果。

如果父组件先写任务的 `useQuery`，`isPending` 时只返回「正在读取任务」，评论组件这时还没挂上。任务返回现有任务 / 林晓之后，评论才开始请求核对评论。网络上就变成两段串行。

官方把这种模式叫做嵌套组件瀑布。本课只处理「子查询并不依赖父查询结果」这一类。不把代码分割、Suspense 串行或路由预取写成主线。

## 三、核心概念

### 1. 瀑布是后一次等前一次结束

一次请求瀑布至少多一趟往返。任务先花 1400ms，评论再花 1400ms，画面要等两轮才看到核对评论。如果两条请求一起开始，总等待接近一轮。

### 2. 嵌套瀑布来自渲染顺序，不是 queryKey

```tsx
function TaskBoard() {
  const taskQuery = useQuery(taskDetailOptions)
  if (taskQuery.isPending) {
    return <p>正在读取任务。</p>
  }
  return <Comments />
}

function Comments() {
  return useQuery(taskCommentsOptions)
}
```

评论的 `queryKey` 是 `['tasks', 'comments', 't-1']`，并不需要任务对象里的字段。它被推迟，只是因为父组件在等待时没有渲染它。

### 3. 提升后两条 useQuery 会一起启动

```tsx
function TaskBoard() {
  const taskQuery = useQuery(taskDetailOptions)
  const commentsQuery = useQuery(taskCommentsOptions)
  ...
}
```

父组件不再用任务的 `isPending` 挡住评论观察者。数量固定时，并排两个 `useQuery` 就会并行。任务还在读取时，评论也可以同时请求。

真正要用前一条结果的查询，例如先拿到用户 id 再读项目，仍然需要 `enabled`。那种瀑布不能靠提升消掉。

## 四、用法与示例

### 1. 先看清嵌套瀑布

```tsx
const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})

const taskCommentsOptions = queryOptions({
  queryKey: ['tasks', 'comments', 't-1'],
  queryFn: loadTaskComments,
  staleTime: Infinity,
  retry: false,
})

function NestedTaskBoard() {
  const taskQuery = useQuery(taskDetailOptions)
  if (taskQuery.isPending) {
    return <p>正在读取任务。</p>
  }
  return (
    <>
      <p>
        {taskQuery.data.title} / {taskQuery.data.owner}
      </p>
      <Comments />
    </>
  )
}
```

任务等待中为是时，评论已开始仍为否。任务出现后，评论才开始，同时请求保持否。

### 2. 把评论查询提升到父组件

```tsx
function HoistedTaskBoard() {
  const taskQuery = useQuery(taskDetailOptions)
  const commentsQuery = useQuery(taskCommentsOptions)

  return (
    <>
      {taskQuery.isSuccess ? (
        <p>
          {taskQuery.data.title} / {taskQuery.data.owner}
        </p>
      ) : (
        <p>正在读取任务。</p>
      )}
      {commentsQuery.isSuccess ? (
        <p>{commentsQuery.data.body}</p>
      ) : (
        <p>正在读取评论。</p>
      )}
    </>
  )
}
```

两条查询一起开始。任务等待中和评论等待中会同时为是，同时请求变为是。任务完成后仍可先显示现有任务 / 林晓，评论稍后给出核对评论。

## 五、用法示例：对照嵌套瀑布和提升并行

下面的 Demo 默认走嵌套瀑布。任务先显示现有任务 / 林晓，评论这时才开始，同时请求为否，最后才出现核对评论。点「提升并行」后，两条请求一起开始，同时请求为是，任务和评论不必互相等待。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.advanced.request-waterfalls.request-waterfalls-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：父组件等任务完成才渲染评论查询

**触发条件：** `if (taskQuery.isPending) return ...`，评论的 `useQuery` 写在子组件里。

**原因：** 评论观察者要等父组件结束等待后才挂上，请求被渲染顺序串起来。

**后果：** 任务和评论各等一轮，总时间接近两倍。

**错误示例：**

```tsx
function TaskBoard() {
  const taskQuery = useQuery(taskDetailOptions)
  if (taskQuery.isPending) {
    return <p>正在读取任务。</p>
  }
  return <Comments />
}
```

**正确写法：**

```tsx
function TaskBoard() {
  const taskQuery = useQuery(taskDetailOptions)
  const commentsQuery = useQuery(taskCommentsOptions)
  return (
    <>
      {taskQuery.isPending ? <p>正在读取任务。</p> : null}
      {commentsQuery.isPending ? <p>正在读取评论。</p> : null}
    </>
  )
}
```

**验证方式：** 提升后同时请求为是，不必等任务完成才看到评论等待中。

### 错误：把传入子组件的 id 当成依赖结果

**触发条件：** `<Comments id="t-1" />`，就认为评论必须等任务对象返回。

**原因：** `t-1` 在父组件渲染时已经有了。子查询用这个 id，并不读取任务查询的 `data`。

**后果：** 本来可以并行的两条查询被当成依赖查询，多等一轮。

**错误示例：**

```tsx
function Comments({ id }: { id: string }) {
  return useQuery({
    ...taskCommentsOptions,
    enabled: false,
  })
}
```

**正确写法：**

```tsx
function TaskBoard() {
  useQuery(taskDetailOptions)
  useQuery(taskCommentsOptions)
}
```

**验证方式：** 页面一进来评论已开始就可以为是，不必先出现现有任务。

### 错误：用 enabled 等待一条并不需要的父结果

**触发条件：** 评论写成 `enabled: taskQuery.isSuccess`。

**原因：** `enabled` 只适合后一条查询真的需要前一条数据。评论不读任务对象。

**后果：** 即使两个 Hook 写在同一组件，评论仍会等任务成功，瀑布没有被拆掉。

**错误示例：**

```tsx
const taskQuery = useQuery(taskDetailOptions)
const commentsQuery = useQuery({
  ...taskCommentsOptions,
  enabled: taskQuery.isSuccess,
})
```

**正确写法：**

```tsx
const taskQuery = useQuery(taskDetailOptions)
const commentsQuery = useQuery(taskCommentsOptions)
```

**验证方式：** 提升并行时同时请求为是，评论等待中不必等任务等待中先变否。

### 错误：把真正的依赖查询也提升成无条件并行

**触发条件：** 项目查询需要用户 id，却在用户还没返回时就请求 `['projects', undefined]`。

**原因：** 没有用户 id 时，后一条查询没有合法身份。官方依赖查询要用 `enabled` 等 id 出现。

**后果：** 发出无效请求，或把不同用户的项目写进同一条错误缓存。

**错误示例：**

```tsx
const userQuery = useQuery(userOptions)
useQuery({
  queryKey: ['projects', userQuery.data?.id],
  queryFn: loadProjects,
})
```

**正确写法：**

```tsx
const userQuery = useQuery(userOptions)
useQuery({
  queryKey: ['projects', userQuery.data?.id],
  queryFn: loadProjects,
  enabled: Boolean(userQuery.data?.id),
})
```

**验证方式：** 没有用户 id 时项目查询保持未启用，不会先打一次空请求。

### 错误：用路由预取代替本可以提升的查询

**触发条件：** 两条查询都在当前组件树里，却先绕去 Loader 预取评论。

**原因：** 预取适合还没进入这棵树、或拆不开的请求。当前页已经能并排声明时，先提升更直接。

**后果：** 页面多一层路由约定，嵌套瀑布的原因反而没被看清。

**错误示例：**

```tsx
await queryClient.query(taskCommentsOptions)
```

**正确写法：**

```tsx
useQuery(taskDetailOptions)
useQuery(taskCommentsOptions)
```

**验证方式：** 提升并行后同时请求为是，不必先进入详情路由。
:::

## 七、源码推导与适用场景

1. **官方事实：** 父组件等自己的查询完成才渲染子查询，会形成嵌套瀑布。子查询只用渲染时已经有的 id 时，并不依赖父结果。把子查询提升到父组件后，普通 `useQuery` 会并行。真正依赖前一条结果的查询仍会串行。
2. **课程推导：** 任务详情和任务评论都认识 `t-1`。嵌套时评论等任务结束才开始；提升后同时请求为是，总等待接近一轮。
3. **适用边界：** 本课不把代码分割、Suspense 串行、服务端渲染或路由预取写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 任务使用 `queryKey: ['tasks', 'detail', 't-1']`，评论使用 `queryKey: ['tasks', 'comments', 't-1']`。两条 `queryFn` 都调 `fetch`，非 2xx 时抛出带状态码的 `Error`。先写一个父组件等任务完成再挂评论的嵌套版本，再把评论查询提升到父组件。观察者 `staleTime` 为 `Infinity`，`retry` 为 `false`。

**验收：** 嵌套时任务先出现现有任务 / 林晓，评论已开始仍为否，同时请求为否，随后才出现核对评论。提升后两条请求一起开始，同时请求为是。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
} from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskComment = {
  id: string
  body: string
}

/** 读取任务详情。 */
async function loadTaskDetail(): Promise<TaskItem> {
  const response = await fetch('/api/tasks/t-1')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 读取任务评论。 */
async function loadTaskComments(): Promise<TaskComment> {
  const response = await fetch('/api/tasks/t-1/comments')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskComment
}

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})

const taskCommentsOptions = queryOptions({
  queryKey: ['tasks', 'comments', 't-1'],
  queryFn: loadTaskComments,
  staleTime: Infinity,
  retry: false,
})

/** 把互不依赖的查询放在同一层并行启动。 */
function TaskBoard(): ReactElement {
  const taskQuery = useQuery(taskDetailOptions)
  const commentsQuery = useQuery(taskCommentsOptions)
  return (
    <section>
      {taskQuery.isSuccess ? (
        <p>
          {taskQuery.data.title} / {taskQuery.data.owner}
        </p>
      ) : (
        <p>正在读取任务。</p>
      )}
      {commentsQuery.isSuccess ? <p>{commentsQuery.data.body}</p> : <p>正在读取评论。</p>}
    </section>
  )
}

/** 提供稳定客户端，避免查询观察丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <TaskBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 请求瀑布是后一次请求等前一次完成才开始。
- 父组件等自己的查询完成再挂子查询，会形成嵌套瀑布。
- 子查询只用已经有的 id 时，并不依赖父查询的结果。
- 把互不依赖的查询提升到同一层，两条请求可以一起开始。
- 本课不展开代码分割或 Suspense 串行。

## 十、参考资料

- [Performance & Request Waterfalls](https://tanstack.com/query/latest/docs/framework/react/guides/request-waterfalls) - 支持识别嵌套组件瀑布，并把互不依赖的子查询提升到父组件。
- [Dependent Queries](https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries) - 支持说明真正依赖前一条结果的查询会串行。
- [Parallel Queries](https://tanstack.com/query/latest/docs/framework/react/guides/parallel-queries) - 支持互不依赖的查询并排 useQuery 时并行。
