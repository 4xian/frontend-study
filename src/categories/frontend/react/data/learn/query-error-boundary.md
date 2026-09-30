---
id: react.data.learn.advanced.query-error-boundary
type: lesson
title: Query Error Boundary
summary: 首次失败会抛给错误边界；再试一次必须先 reset 查询，再清掉边界，查询才会重新请求。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.advanced.suspense-queries
  - react.data.learn.basics.query-error-handling
related:
  - react.data.learn.basics.query-status
  - react.data.learn.basics.query-client-and-provider
tags:
  - TanStack Query
  - QueryErrorResetBoundary
  - Error Boundary
  - useSuspenseQuery
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能说明首次没有缓存时，useSuspenseQuery 的失败会抛给错误边界。
  - 能用 QueryErrorResetBoundary 在重试前先 reset 查询。
  - 能在本地错误边界里先调用 reset，再清掉边界状态。
  - 能说明未 reset 时 retryOnMount 会被关掉，同一错误不会自动再请求。
  - 能说明已有缓存时后台刷新失败不会抛给错误边界。
recap:
  - 没有缓存的失败会抛给错误边界，等待仍由 Suspense fallback 承接。
  - QueryErrorResetBoundary 的 reset 告诉查询这次重渲染可以再试。
  - 只清 React 边界、不 reset 查询，会立刻再次抛出缓存里的同一错误。
  - 未 reset 时源码会把 retryOnMount 设为 false。
  - 本课不把 react-error-boundary 包或 mutation throwOnError 写成主线。
sources:
  - title: Suspense
    url: https://tanstack.com/query/latest/docs/framework/react/guides/suspense
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 使用 suspense 或 throwOnError 时，重渲染前必须让查询知道要再试一次。
      - 查询错误可用 QueryErrorResetBoundary 或 useQueryErrorResetBoundary 重置。
      - 组件用法是把 Error Boundary 的 onReset 接到 QueryErrorResetBoundary 的 reset。
      - 默认只在缓存里还没有 data 时才把错误抛给错误边界。
  - title: QueryErrorResetBoundary
    url: https://tanstack.com/query/latest/docs/framework/react/reference/QueryErrorResetBoundary
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueryErrorResetBoundary 能重置边界范围内的查询错误。
      - children 可以是函数，参数里带 reset。
  - title: useQueryErrorResetBoundary
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQueryErrorResetBoundary
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 钩子重置最近的 QueryErrorResetBoundary。
      - 没有边界时会做全局重置。
  - title: QueryErrorResetBoundary source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/QueryErrorResetBoundary.tsx
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - reset 把内部 isReset 设为 true。
      - clearReset 把 isReset 设为 false。
      - 没有 Provider 时，钩子读到的是模块级默认值。
  - title: errorBoundaryUtils source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/errorBoundaryUtils.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 未 reset 且处于 suspense 或 throwOnError 时，retryOnMount 会被设为 false。
      - getHasError 要求 isError、尚未 reset、当前没在 fetching，并且存在 query。
      - suspense 为 true 时还要求 result.data 为 undefined，否则再按 throwOnError 判断。
      - 挂载后的 effect 会调用 clearReset。
  - title: useSuspenseQuery source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/useSuspenseQuery.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 内部固定 throwOnError 为 defaultThrowOnError。
      - 内部固定 suspense 为 true、placeholderData 为 undefined。
  - title: suspense helpers source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/suspense.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - defaultThrowOnError 只在 query.state.data 为 undefined 时返回 true。
---

# Query Error Boundary

## 一、学习目标

- 说明首次没有缓存时，`useSuspenseQuery` 的失败会抛给错误边界。
- 用 `QueryErrorResetBoundary` 在重试前先 `reset` 查询。
- 在本地错误边界里先调用 `reset`，再清掉边界状态。
- 说明未 `reset` 时 `retryOnMount` 会被关掉，同一错误不会自动再请求。
- 说明已有缓存时后台刷新失败不会抛给错误边界。

## 二、为什么清掉边界还不够

上一课成功路径里，`useSuspenseQuery` 把等待交给 `Suspense`。没有缓存时，请求失败不会停在组件里的 `isError`，而是抛给最近的错误边界。

这时如果只把 React 边界的 `hasError` 清掉，查询还记得上次失败。源码会把 `retryOnMount` 设成 `false`，组件一回来就再次抛出同一条错误。官方要求：重渲染前先让查询知道这次是「再试一次」。

本课用 `QueryErrorResetBoundary` 做这件事。不引入 `react-error-boundary` 包，也不把 mutation 的 `throwOnError` 写成主线。

## 三、核心概念

### 1. 没有缓存才抛给边界

官方默认：只在缓存里还没有 `data` 时，才把错误抛给错误边界。已经成功过的查询，后台刷新失败仍继续渲染旧数据。

指南把这条默认写成：

```ts
throwOnError: (error, query) => typeof query.state.data === 'undefined'
```

这是公开文档里的默认行为，不是调用方要传入的选项。`useSuspenseQuery` 不能改 `throwOnError`。源码里它固定使用 `defaultThrowOnError`，判断同样是 `query.state.data === undefined`。这是当前实现，不是稳定公共合同。

等待仍然走 `Suspense` 的 fallback。错误边界只承接「没有数据可展示」的失败。

### 2. reset 是给查询看的旗标

`QueryErrorResetBoundary` 内部只有三个方法：

- `reset()` 把 `isReset` 设为 `true`
- `isReset()` 读取这面旗标
- `clearReset()` 把旗标清掉

源码在 `suspense` 或需要抛错时检查这面旗标。还没 `reset` 就把 `retryOnMount` 关掉。`getHasError` 要求 `isError`、尚未 `reset`、当前没在 fetching，并且存在 query；刚 `reset` 的那一次不会立刻再抛。

挂载后的 `useEffect` 会 `clearReset()`，旗标只覆盖这一次重试。

### 3. 先 reset，再清 React 边界

官方例子把错误边界的 `onReset` 接到 `reset`。点「再试一次」时顺序是：

1. 调用 `QueryErrorResetBoundary` 的 `reset`
2. 清掉错误边界自己的 state
3. 子树重新挂上 `useSuspenseQuery`
4. 因为已经 `reset`，这次允许 `retryOnMount`
5. 再次进入 `Suspense` fallback，请求成功后显示现有任务 / 林晓

没有第 1 步，第 3 步会马上再次抛出 `读取失败：HTTP 503`。

### 4. 没有边界时钩子是全局的

`useQueryErrorResetBoundary` 读最近的 Context。页面上如果没有 `QueryErrorResetBoundary`，它用的是模块默认值，`reset` 会作用到整棵树。本课 Demo 显式包一层组件，把重置范围收在任务详情里。

## 四、用法与示例

### 1. 抽出会失败的 queryOptions

```tsx
const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})
```

`queryFn` 仍检查 `response.ok`。非 2xx 时抛出带状态码的 `Error`。`retry` 为 `false`，避免错误边界出现前先自动重试。

### 2. 把 reset 接到本地错误边界

```tsx
function TaskDetailPane() {
  const { data } = useSuspenseQuery(taskDetailOptions)
  return (
    <p>
      {data.title} / {data.owner}
    </p>
  )
}

function TaskBoard() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <TaskErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <p>{error.message}</p>
              <button type="button" onClick={() => resetErrorBoundary()}>
                再试一次
              </button>
            </div>
          )}
        >
          <Suspense fallback={<p>正在读取任务。</p>}>
            <TaskDetailPane />
          </Suspense>
        </TaskErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

`TaskErrorBoundary` 是课程 Demo 里的类组件：`getDerivedStateFromError` 保存错误，`resetErrorBoundary` 先调用 `onReset`，再 `setState({ error: null })`。

## 五、用法示例：失败后先 reset 再请求

下面的 Demo 第一次读取会返回 HTTP 503，错误边界显示「读取失败：HTTP 503」。点「再试一次」会先 `reset` 查询，再进入「正在读取任务。」，成功后显示现有任务 / 林晓。点「重置」会整段重挂，下一次再走 503。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.advanced.query-error-boundary.query-error-boundary-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：只清 React 边界，不 reset 查询

**触发条件：** 错误 UI 里直接 `setState({ error: null })`，或者给类组件换一个 `key`。

**原因：** 查询缓存里还是那次 503。未 `reset` 时 `retryOnMount` 为 `false`，`getHasError` 仍为 true。

**后果：** 边界刚消失，同一条错误立刻再抛出来。

**错误示例：**

```tsx
<button type="button" onClick={() => setError(null)}>
  再试一次
</button>
```

**正确写法：**

```tsx
<button
  type="button"
  onClick={() => {
    reset()
    setError(null)
  }}
>
  再试一次
</button>
```

**验证方式：** 点「再试一次」后先出现正在读取任务，而不是马上又看到 HTTP 503。

### 错误：把错误边界当成 useQuery 的 isError

**触发条件：** 在 `useSuspenseQuery` 组件里写 `if (isError) return <p>{error.message}</p>`。

**原因：** 没有缓存时失败已经抛出，这段分支不会渲染。

**后果：** 用户看不到组件内的错误文案，页面被外层边界接管。

**错误示例：**

```tsx
const { data, isError, error } = useSuspenseQuery(taskDetailOptions)
if (isError) {
  return <p>{error.message}</p>
}
```

**正确写法：**

```tsx
<QueryErrorResetBoundary>
  {({ reset }) => (
    <TaskErrorBoundary onReset={reset} fallbackRender={renderError}>
      <Suspense fallback={<p>正在读取任务。</p>}>
        <TaskDetailPane />
      </Suspense>
    </TaskErrorBoundary>
  )}
</QueryErrorResetBoundary>
```

**验证方式：** 首次 503 出现在错误边界的提示里，任务详情组件此时没有挂上成功结果。

### 错误：retry 仍为默认值

**触发条件：** 不设 `retry: false`，失败后等自动重试。

**原因：** 默认会重试，错误边界要等多次 503 之后才出现，观察顺序被拉长。

**后果：** 「再试一次」和自动重试叠在一起，不容易看出是 `reset` 生效。

**错误示例：**

```tsx
useSuspenseQuery({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: loadTaskDetail,
})
```

**正确写法：**

```tsx
useSuspenseQuery({
  ...taskDetailOptions,
  retry: false,
})
```

**验证方式：** 第一次失败后立刻看到 HTTP 503，不会先出现成功结果。

### 错误：没有 QueryErrorResetBoundary 就调用钩子

**触发条件：** 只写 `const { reset } = useQueryErrorResetBoundary()`，外层没有组件。

**原因：** 官方写明没有边界时会全局重置。源码里钩子读到的是模块默认 Context。

**后果：** 「再试一次」可能把页面上其他查询的错误旗标一起打开。

**错误示例：**

```tsx
const { reset } = useQueryErrorResetBoundary()
```

**正确写法：**

```tsx
<QueryErrorResetBoundary>
  {({ reset }) => (
    <TaskErrorBoundary onReset={reset} fallbackRender={renderError}>
      <TaskDetailPane />
    </TaskErrorBoundary>
  )}
</QueryErrorResetBoundary>
```

**验证方式：** 重置范围只包住任务详情，不影响 Demo 外的查询。

### 错误：以为有缓存的刷新失败也会进错误边界

**触发条件：** 详情已经显示现有任务 / 林晓后，下一次刷新再返回 503。

**原因：** 默认只在 `data === undefined` 时抛错。有缓存时组件继续渲染旧数据。

**后果：** 等错误边界，但界面仍是旧标题。

**错误示例：**

```tsx
// 以为刷新失败会再次进入错误边界
```

**正确写法：**

```tsx
const { data } = useSuspenseQuery(taskDetailOptions)
return <p>{data.title} / {data.owner}</p>
```

**验证方式：** 本课 Demo 的失败发生在第一次、还没有缓存时。成功后再点「重置」才会重新走 503。
:::

## 七、源码推导与适用场景

1. **官方事实：** 使用 suspense 时，重渲染前必须让查询知道要再试一次。`QueryErrorResetBoundary` 负责重置边界范围内的查询错误。默认只在缓存里还没有 data 时才把错误抛给错误边界。
2. **源码观察（非公共合同）：** `reset` 把 `isReset` 设为 true。未 reset 时 `retryOnMount` 为 false。`getHasError` 要求 `isError`、尚未 reset、当前没在 fetching。`useSuspenseQuery` 当前把 `throwOnError` 固定为 `defaultThrowOnError`。
3. **课程推导：** 第一次 503 进入错误边界。点「再试一次」后允许重新挂载请求，fallback 显示正在读取任务，成功后是现有任务 / 林晓。
4. **适用边界：** 本课不把 `react-error-boundary` 包、mutation `throwOnError`、或把所有刷新错误都抛给边界写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 抽出 `taskDetailOptions`，`queryKey` 为 `['tasks', 'detail', 't-1']`。用 `useSuspenseQuery` 读取详情。外层用 `QueryErrorResetBoundary` 包本地错误边界，`onReset` 接到 `reset`。失败时显示错误文案和「再试一次」。`queryFn` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。`retry` 为 `false`。

**验收：** 首次失败显示读取失败：HTTP 503。点「再试一次」后先出现正在读取任务，成功后显示现有任务 / 林晓。

**参考答案：**

```tsx
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
  queryOptions,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  Component,
  Suspense,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskErrorBoundaryProps = {
  onReset: () => void
  fallbackRender: (args: { error: Error; resetErrorBoundary: () => void }) => ReactNode
  children: ReactNode
}

type TaskErrorBoundaryState = {
  error: Error | null
}

/** 读取任务详情。 */
async function loadTaskDetail(): Promise<TaskItem> {
  const response = await fetch('/api/tasks/t-1')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'] as const,
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})

/** 捕获查询抛出的错误。 */
class TaskErrorBoundary extends Component<TaskErrorBoundaryProps, TaskErrorBoundaryState> {
  state: TaskErrorBoundaryState = { error: null }

  /** 把后代抛出的错误转成边界状态。 */
  static getDerivedStateFromError(error: Error): TaskErrorBoundaryState {
    return { error }
  }

  /** 先 reset 查询，再清掉边界。 */
  resetErrorBoundary = (): void => {
    this.props.onReset()
    this.setState({ error: null })
  }

  /** 有错误时渲染 fallback。 */
  render(): ReactNode {
    if (this.state.error) {
      return this.props.fallbackRender({
        error: this.state.error,
        resetErrorBoundary: this.resetErrorBoundary,
      })
    }
    return this.props.children
  }
}

/** 成功后直接读 data。 */
function TaskDetailPane(): ReactElement {
  const taskQuery = useSuspenseQuery(taskDetailOptions)
  return (
    <p>
      {taskQuery.data.title} / {taskQuery.data.owner}
    </p>
  )
}

/** 对照错误边界与再试一次。 */
function TaskBoard(): ReactElement {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <TaskErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <p>{error.message}</p>
              <button type="button" onClick={() => resetErrorBoundary()}>
                再试一次
              </button>
            </div>
          )}
        >
          <Suspense fallback={<p>正在读取任务。</p>}>
            <TaskDetailPane />
          </Suspense>
        </TaskErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

/** 客户端放在会挂起和抛错的树外面。 */
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

- 没有缓存时，`useSuspenseQuery` 的失败会抛给错误边界。
- `QueryErrorResetBoundary.reset` 允许这一次重新挂载时再请求。
- 只清 React 边界不够，未 reset 时同一错误会立刻再抛。
- 已有缓存的刷新失败默认不进错误边界。
- 本课不引入 `react-error-boundary` 包。

## 十、参考资料

- [Suspense](https://tanstack.com/query/latest/docs/framework/react/guides/suspense) - 支持在重试前重置查询错误，并说明默认只在没有 data 时抛错。
- [QueryErrorResetBoundary](https://tanstack.com/query/latest/docs/framework/react/reference/QueryErrorResetBoundary) - 支持用组件重置边界范围内的查询错误。
- [useQueryErrorResetBoundary](https://tanstack.com/query/latest/docs/framework/react/reference/useQueryErrorResetBoundary) - 支持读取最近边界，没有边界时全局重置。
- [QueryErrorResetBoundary source](https://unpkg.com/@tanstack/react-query@5.102.8/src/QueryErrorResetBoundary.tsx) - 支持 reset 与 clearReset 维护 isReset 旗标。
- [errorBoundaryUtils source](https://unpkg.com/@tanstack/react-query@5.102.8/src/errorBoundaryUtils.ts) - 支持未 reset 时关闭 retryOnMount。
- [useSuspenseQuery source](https://unpkg.com/@tanstack/react-query@5.102.8/src/useSuspenseQuery.ts) - 支持当前实现把 throwOnError 固定为 defaultThrowOnError。
- [suspense helpers source](https://unpkg.com/@tanstack/react-query@5.102.8/src/suspense.ts) - 支持 defaultThrowOnError 只在没有 data 时返回 true。
