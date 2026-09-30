---
id: react.data.learn.advanced.query-testing
type: lesson
title: TanStack Query 测试
summary: 每次测试用独立 QueryClient 包住钩子；失败用例关闭默认 retry，再用 waitFor 等到 isSuccess。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 40
prerequisites:
  - react.data.learn.basics.query-client-and-provider
  - react.data.learn.intermediate.query-retry
related:
  - react.data.learn.basics.query-error-handling
  - react.data.learn.advanced.query-client-cache-operations
  - react.data.learn.intermediate.query-options-reuse
tags:
  - TanStack Query
  - 测试
  - QueryClientProvider
  - retry
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能说明测试自定义查询钩子时必须提供 QueryClientProvider。
  - 能在每次测试里创建独立 QueryClient，避免缓存串到下一测。
  - 能把 QueryClient 默认 retry 设为 false，让失败用例立刻结束。
  - 能用 waitFor 等到 isSuccess，再断言 data。
  - 能说明 useQuery 上显式 retry 会盖掉测试默认值。
recap:
  - 测试包装器要提供 QueryClientProvider，钩子才能读到客户端。
  - 每次测试用新的 QueryClient；复用同一份必须先 clear，也不能并行。
  - 失败用例要把默认 retry 设为 false，否则会按 3 次退避把测试拖超时。
  - 默认值只是兜底，查询自己写的 retry 仍然生效。
  - 本课不把 nock、MSW、无限查询测试或 Jest 专属 gcTime 写成主线。
sources:
  - title: Testing
    url: https://tanstack.com/query/latest/docs/framework/react/guides/testing
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - React Query 通过钩子工作，测试自定义钩子时要用包装器提供 QueryClientProvider。
      - React 18 及以后从 @testing-library/react 直接使用 renderHook，不再需要 @testing-library/react-hooks。
      - 包装器里创建 QueryClient，是为了让测试和其他测试完全隔离。
      - 包装器可以只写一次，但每次测试前必须清掉 QueryClient，并且测试不能并行。
      - 库默认会重试 3 次并使用指数退避，失败用例容易超时。
      - 关闭重试最直接的方式是在 QueryClient 的 defaultOptions.queries 里设 retry 为 false。
      - 这个默认值只在查询自己没有显式 retry 时生效，查询上的 retry 会覆盖默认值。
      - 断言时用 waitFor 等到 isSuccess，再检查 data。
  - title: Query Retries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-retries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 查询函数抛错后会自动重试，默认连续重试 3 次。
      - retry 设为 false 会关闭重试。
  - title: QueryClientProvider
    url: https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueryClientProvider 把指定 QueryClient 提供给子树。
      - 组件挂载时调用 client.mount，卸载时调用 client.unmount。
  - title: QueryClient
    url: https://tanstack.com/query/latest/docs/reference/QueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - defaultOptions 会成为这份客户端上查询和 mutation 的默认值。
      - clear 会清掉这份客户端连接的查询缓存和 mutation 缓存。
  - title: QueryClientProvider source
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/QueryClientProvider.tsx
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 没有 QueryClient 时，useQueryClient 会抛出必须使用 QueryClientProvider 的错误。
      - 当前实现在 effect 里落实 mount 和 unmount，这是源码观察，不是额外的测试配置项。
  - title: Retryer source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/retryer.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 未配置 retry 时，客户端默认 3。
  - title: QueryClient source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 当前实现里，defaultQueryOptions 先合并客户端默认值，再合并查询自己的选项，后者覆盖前者。这是源码观察，不是可以配置的公共选项。
      - clear 分别清掉 queryCache 和 mutationCache。
---

# TanStack Query 测试

## 一、学习目标

- 说明测试自定义查询钩子时必须提供 `QueryClientProvider`。
- 在每次测试里创建独立 `QueryClient`，避免缓存串到下一测。
- 把 `QueryClient` 默认 `retry` 设为 `false`，让失败用例立刻结束。
- 用 `waitFor` 等到 `isSuccess`，再断言 `data`。
- 说明 `useQuery` 上显式 `retry` 会盖掉测试默认值。

## 二、为什么测试会互相影响

查询钩子不从 props 拿数据，它从最近的 `QueryClientProvider` 读缓存。测试里如果没有这份包装，钩子找不到客户端。如果多份测试共用同一份 `QueryClient`，上一测留下的现有任务 / 林晓会变成下一测的「假成功」。

官方要求测试完全隔离。最直接的做法是：每次测试新建 `QueryClient`，再用 `QueryClientProvider` 包住 `renderHook`。也可以共用包装器，但每次测试前必须 `clear`，并且测试不能并行。

本课讲测试查询钩子时的客户端隔离和失败默认值。不把 `nock`、MSW、无限查询分页测试或某个测试运行器的退出提示写成主线。

## 三、核心概念

### 1. 包装器提供独立客户端

```tsx
const queryClient = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const { result } = renderHook(() => useTaskDetail(), { wrapper })
```

React 18 及以后，`renderHook` 从 `@testing-library/react` 引入。不再安装 `@testing-library/react-hooks`。

这份包装器让当前测试和其他测试隔开。钩子内部的 `useQuery` 读的是这次传入的客户端，不是模块顶层那一份。

### 2. 失败测试必须关掉默认重试

客户端默认会额外重试 3 次，并按指数退避等待。失败用例若保留默认值，测试会在超时附近才看到 `error`。官方把关闭方式写在 `QueryClient` 上：

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
```

这只给**没有写 `retry` 的查询**当兜底。查询自己写了 `retry: 5`，测试里的 `false` 盖不住。

### 3. 等到成功再断言

查询是异步的。`renderHook` 刚返回时，`status` 多半还是 `pending`，`data` 还没有。官方写法是先 `waitFor` 到 `isSuccess`，再比较 `data`：

```tsx
await waitFor(() => expect(result.current.isSuccess).toBe(true))
expect(result.current.data).toEqual({
  id: 't-1',
  title: '现有任务',
  owner: '林晓',
})
```

不要在第一次渲染后立刻读 `data`。

## 四、用法与示例

### 1. 每次测试新建 QueryClient

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

function useTaskDetail() {
  return useQuery({
    queryKey: ['tasks', 'detail', 't-1'],
    queryFn: loadTaskDetail,
  })
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const { result } = renderHook(() => useTaskDetail(), {
  wrapper: createWrapper(),
})
await waitFor(() => expect(result.current.isSuccess).toBe(true))
expect(result.current.data?.title).toBe('现有任务')
```

`createWrapper` 每次调用都 `new QueryClient()`。上一测的现有任务 / 林晓不会出现在这一测。

### 2. 共用包装器时必须先 clear

官方允许包装器只写一次，但要同时满足两件事：

1. 每次测试前 `queryClient.clear()`
2. 测试不要并行，否则一份缓存会被两份断言同时改

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

beforeEach(() => {
  queryClient.clear()
})
```

`clear` 会清掉这份客户端上的查询缓存和 mutation 缓存。漏掉这一步，复用同一份客户端时会直接读到上一测的现有任务 / 林晓，请求次数也不会增加。

隔离优先用「每次新建」。`clear` 是共用客户端时的补救，不是更省事的默认方案。

### 3. 不要把 retry 写死在 useQuery 上

```tsx
useQuery({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: loadTaskDetail,
  retry: 5,
})
```

测试客户端即使写了 `retry: false`，这条查询仍会再试 5 次。默认值只在查询没有显式 `retry` 时生效。需要按查询覆盖时，用 `queryClient.setQueryDefaults`，不要把测试里盖不住的次数写进钩子。

## 五、用法示例：对照隔离客户端和失败默认值

下面的 Demo 用独立 `QueryClient` 模拟一次测试。点「运行隔离成功测试」会新建客户端，请求一次后读出现有任务 / 林晓。点「复用同一客户端再测」不新建客户端，缓存里的详情会直接漏过来，请求次数不再增加。点「关闭重试后测失败」会新建客户端并把 `retry` 设为 `false`，503 之后只请求一次。点「重置」回到还没有观察查询的状态。

:::demo{id="react.data.learn.advanced.query-testing.query-testing-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：测试里没有 QueryClientProvider

**触发条件：** 直接 `renderHook(() => useTaskDetail())`，不传 `wrapper`。

**原因：** 查询钩子从 Context 取 `QueryClient`。没有 Provider 时，当前实现会抛出必须使用 `QueryClientProvider` 的错误。

**后果：** 测试还没等到 `isSuccess` 就失败，看起来像钩子本身坏了。

**错误示例：**

```tsx
const { result } = renderHook(() => useTaskDetail())
```

**正确写法：**

```tsx
const { result } = renderHook(() => useTaskDetail(), {
  wrapper: createWrapper(),
})
```

**验证方式：** 包装器必须渲染 `QueryClientProvider` 并传入这次测试的客户端。

### 错误：多份测试共用同一份 QueryClient

**触发条件：** 在模块顶层创建 `queryClient`，所有测试都包进同一份 Provider，也不 `clear`。

**原因：** 查询缓存活在客户端上。上一测成功写入的现有任务 / 林晓，下一测会当成已经成功的数据。

**后果：** 失败用例变成成功，或者请求次数不再增加，测试互相影响。

**错误示例：**

```tsx
const queryClient = new QueryClient()
```

**正确写法：**

```tsx
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}
```

**验证方式：** 先跑隔离成功测试，再复用同一客户端；请求次数不应再增加。对比新建客户端时请求次数会加一。

### 错误：失败用例保留默认重试

**触发条件：** 测试客户端不设 `retry: false`，去断言一次 503 后的 `isError`。

**原因：** 客户端默认额外重试 3 次，并按指数退避等待。

**后果：** 测试在超时附近才看到错误，或者直接超时。

**错误示例：**

```tsx
const queryClient = new QueryClient()
```

**正确写法：**

```tsx
new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
```

**验证方式：** 关闭重试后测失败，请求次数只增加一次。

### 错误：把 retry 写在 useQuery 上，测试默认盖不住

**触发条件：** 生产钩子写了 `retry: 5`，测试客户端写 `retry: false`。

**原因：** 官方写明客户端默认值只在查询自己没有显式 `retry` 时生效。查询上写了 `retry`，测试里的 `false` 盖不住。

**后果：** 失败用例仍然重试，测试超时；看起来像测试配置没生效。

**错误示例：**

```tsx
useQuery({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: loadTaskDetail,
  retry: 5,
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: loadTaskDetail,
})
```

**验证方式：** 失败测试只依赖客户端默认值关闭重试；需要按查询覆盖时用 `setQueryDefaults`。

### 错误：第一次渲染后立刻断言 data

**触发条件：** `renderHook` 返回后马上 `expect(result.current.data).toEqual(...)`。

**原因：** 查询是异步的，第一次结果通常还是 `pending`。

**后果：** 断言读到 `undefined`，即使随后会成功读出现有任务 / 林晓。

**错误示例：**

```tsx
const { result } = renderHook(() => useTaskDetail(), { wrapper })
expect(result.current.data?.title).toBe('现有任务')
```

**正确写法：**

```tsx
await waitFor(() => expect(result.current.isSuccess).toBe(true))
expect(result.current.data?.title).toBe('现有任务')
```

**验证方式：** 成功测试要等到 `isSuccess` 为是，任务详情才是现有任务 / 林晓。
:::

## 七、源码推导与适用场景

1. **官方事实：** 测试自定义钩子要用 `QueryClientProvider` 包装。每次测试用独立 `QueryClient`，或共用时先 `clear` 且不能并行。失败用例应关闭默认 `retry`。`retry` 写在查询上时，客户端默认值只是兜底。断言前用 `waitFor` 等到 `isSuccess`。React 18 及以后从 `@testing-library/react` 取 `renderHook`。官方参考写明 Provider 挂载时 `mount`、卸载时 `unmount`。
2. **源码观察：** 未配置时客户端 `retry` 为 `3`。当前实现用 `defaultQueryOptions` 让查询自己的选项覆盖客户端默认值，这不是可以配置的公共选项。`clear` 清掉查询缓存和 mutation 缓存。没有 Provider 时 `useQueryClient` 会抛错。当前实现在 effect 里落实 `mount` 和 `unmount`，这不是额外的测试配置项。
3. **课程推导：** 隔离成功测试新建客户端后，会请求一次并读出现有任务 / 林晓。复用同一份客户端时，缓存直接漏过来，请求次数不再增加。失败测试把 `retry` 设为 `false` 后，503 只请求一次。
4. **适用边界：** 本课不把 `nock`、MSW、无限查询分页测试、Jest 因 `gcTime` 不退出的提示，或把查询客户端整体 mock 掉写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 写出测试 `useTaskDetail` 的包装器。每次测试 `new QueryClient()`，默认 `retry` 为 `false`。用 `renderHook` 包住钩子，`waitFor` 等到 `isSuccess`，再断言 `data` 是现有任务 / 林晓。`queryFn` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。不要在 `useQuery` 上写 `retry`。

**验收：** 成功测试读到 `title` 为现有任务、`owner` 为林晓。失败测试不会因为默认重试而超时。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

type TaskItem = {
  id: string
  title: string
  owner: string
}

/** 读取任务详情。 */
async function loadTaskDetail(): Promise<TaskItem> {
  const response = await fetch('/api/tasks/t-1')
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 被测的详情钩子。 */
export function useTaskDetail() {
  return useQuery({
    queryKey: ['tasks', 'detail', 't-1'] as const,
    queryFn: loadTaskDetail,
  })
}

/** 为单次测试创建独立客户端。 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

/** 等到成功后再断言详情。 */
export async function assertTaskDetailSucceeds(): Promise<void> {
  const { result } = renderHook(() => useTaskDetail(), {
    wrapper: createWrapper(),
  })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toEqual({
    id: 't-1',
    title: '现有任务',
    owner: '林晓',
  })
}
```
:::

## 九、本节小结

- 测试查询钩子时，包装器必须提供 `QueryClientProvider`。
- 每次测试用新的 `QueryClient`；复用同一份必须先 `clear`，也不能并行。
- 失败用例把默认 `retry` 设为 `false`。
- 查询上的 `retry` 会盖掉测试默认值。
- 先 `waitFor` 到 `isSuccess`，再断言 `data`。

## 十、参考资料

- [Testing](https://tanstack.com/query/latest/docs/framework/react/guides/testing) - 支持包装器隔离、关闭重试和 waitFor。
- [Query Retries](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries) - 支持默认重试 3 次，以及 retry 为 false 时关闭重试。
- [QueryClientProvider](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) - 支持把 QueryClient 提供给子树。
- [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) - 支持 defaultOptions 与 clear。
- [QueryClientProvider source](https://unpkg.com/@tanstack/react-query@5.102.8/src/QueryClientProvider.tsx) - 支持没有 Provider 时抛错。
- [Retryer source](https://unpkg.com/@tanstack/query-core@5.102.8/src/retryer.ts) - 支持客户端未配置时默认重试 3 次。
- [QueryClient source](https://unpkg.com/@tanstack/query-core@5.102.8/src/queryClient.ts) - 支持查询选项覆盖客户端默认值，以及 clear 清空缓存。
