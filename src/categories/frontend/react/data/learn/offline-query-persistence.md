---
id: react.data.learn.advanced.offline-query-persistence
type: lesson
title: 离线查询与缓存持久化
summary: 用 PersistQueryClientProvider 先恢复缓存再订阅写入；恢复完成前查询保持 idle，不会同时去请求。
domain: frontend
technology: react
module: data
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.query-client-and-provider
  - react.data.learn.basics.cache-lifecycle-and-gctime
  - react.data.learn.basics.stale-time-and-freshness
related:
  - react.data.learn.advanced.query-client-cache-operations
  - react.data.learn.basics.query-cache-and-sharing
tags:
  - TanStack Query
  - 缓存持久化
  - PersistQueryClientProvider
  - useIsRestoring
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-11
objectives:
  - 能说明持久化是把 QueryClient 脱水后交给 persister，启动时再 hydrate 回来。
  - 能用 PersistQueryClientProvider 代替 QueryClientProvider，避免恢复和首次请求抢跑。
  - 能用 createAsyncStoragePersister 把缓存写入存储。
  - 能用 useIsRestoring 判断当前是否还在恢复。
  - 能说明 gcTime 不能低于 maxAge，否则持久化结果会被提前丢掉。
recap:
  - PersistQueryClientProvider 先 restore，再订阅后续缓存变化并写回存储。
  - 恢复完成前查询保持 idle，不会一边 hydrate 一边 fetch。
  - createAsyncStoragePersister 是当前主线，同步 persister 已弃用。
  - gcTime 要大于或等于 maxAge，常用 Infinity 关闭回收。
  - 本课不把 networkMode、resumePausedMutations 或 SSR hydration 写成主线。
sources:
  - title: persistQueryClient
    url: https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - persistQueryClient 会立刻恢复已持久化的缓存，并订阅后续变化。
      - 所有 persister 本质上都是异步的，恢复期间渲染应用可能和首次请求抢跑。
      - PersistQueryClientProvider 按组件生命周期订阅和退订，恢复完成前查询保持 idle。
      - 恢复完成后，只有数据不够新鲜时才会重新请求。
      - gcTime 应大于或等于 maxAge，也可设为 Infinity 关闭回收。
      - 过期、buster 不匹配、出错或空缓存都会调用 removeClient。
  - title: createAsyncStoragePersister
    url: https://tanstack.com/query/latest/docs/framework/react/plugins/createAsyncStoragePersister
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 这是独立包装，从 @tanstack/query-async-storage-persister 导入。
      - 同步存储如 localStorage 也符合 AsyncStorage 接口，可以传给它。
      - 应配合 PersistQueryClientProvider 使用。
  - title: createSyncStoragePersister
    url: https://tanstack.com/query/latest/docs/framework/react/plugins/createSyncStoragePersister
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 这个插件已弃用，下一主版本会移除，应改用异步 persister。
  - title: PersistQueryClientProvider source
    url: https://unpkg.com/@tanstack/react-query-persist-client@5.102.8/src/PersistQueryClientProvider.tsx
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 首次 effect 调用 persistQueryClientRestore，结束后把 isRestoring 设为 false。
      - 恢复完成后才 persistQueryClientSubscribe。
      - 用 IsRestoringProvider 把恢复状态交给子树。
  - title: persistQueryClient core source
    url: https://unpkg.com/@tanstack/query-persist-client-core@5.102.8/src/persist.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - persistQueryClientRestore 从 persister 取出缓存，过期或 busted 就 removeClient，否则 hydrate。
      - persistQueryClientSave 用 dehydrate 得到 clientState 再 persistClient。
      - persistQueryClientSubscribe 只在 added、removed、updated 时保存。
---

# 离线查询与缓存持久化

## 一、学习目标

- 说明持久化是把 `QueryClient` 脱水后交给 persister，启动时再 hydrate 回来。
- 用 `PersistQueryClientProvider` 代替 `QueryClientProvider`，避免恢复和首次请求抢跑。
- 用 `createAsyncStoragePersister` 把缓存写入存储。
- 用 `useIsRestoring` 判断当前是否还在恢复。
- 说明 `gcTime` 不能低于 `maxAge`，否则持久化结果会被提前丢掉。

## 二、为什么刷新后缓存会丢

`QueryClient` 活在内存里。关掉页面或整段重挂后，林晓的现有任务就没了，下一次还要再请求。

官方用 persister 把脱水后的缓存存起来。启动时先 `restore`，再订阅后续写入。恢复是异步的。如果这时已经挂上 `useQuery`，查询会和 hydrate 抢跑，可能把刚恢复的结果再覆盖掉。

本课用 `PersistQueryClientProvider` 处理这件事。不把 `networkMode: 'offlineFirst'`、暂停 mutation 的恢复或服务端 hydration 写成主线。同步 `createSyncStoragePersister` 已弃用，也不再作为主线。

## 三、核心概念

### 1. 先 restore，再订阅写入

`persistQueryClient` 做两件事：立刻 `persistQueryClientRestore`，再 `persistQueryClientSubscribe`。React 里不要在模块顶层调用它，因为没有退订时机。

`PersistQueryClientProvider` 源码顺序是：

1. `isRestoring` 先为 `true`
2. 第一次 effect 调用 `persistQueryClientRestore`
3. 结束后把 `isRestoring` 设为 `false`
4. 这时才 `persistQueryClientSubscribe`

恢复完成前，查询会渲染，但 `fetchStatus` 保持 `idle`，不会同时去请求。

### 2. persister 只负责存取

```tsx
const persister = createAsyncStoragePersister({
  storage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
})
```

它要实现 `persistClient`、`restoreClient`、`removeClient`。`localStorage` 虽然是同步 API，也符合 AsyncStorage 接口，可以传进去。本课 Demo 用内存 Map 模拟存储，避免写进页面真实 `localStorage`。

存进去的对象是：

- `timestamp`
- `buster`
- `clientState`（`dehydrate` 的结果）

过期、`buster` 不匹配、出错或空缓存都会 `removeClient`。

### 3. gcTime 不能短于 maxAge

官方写明：创建 `QueryClient` 时要把 `gcTime` 设成大于或等于 `maxAge`。默认 `maxAge` 是 24 小时。如果 `gcTime` 仍是 5 分钟，持久化还没到期，内存回收就会先把缓存丢掉。

本课 Demo 把 `gcTime` 和 `maxAge` 都设成 `Infinity`，并给查询 `staleTime: Infinity`，这样恢复出来的现有任务足够新鲜，模拟重载不会再发请求。

### 4. useIsRestoring

`useIsRestoring` 读 `PersistQueryClientProvider` 提供的旗标。`useQuery` 内部也会看它，用来避免抢跑。界面可以用它显示「正在恢复」。

## 四、用法与示例

### 1. 抽出带持久化寿命的 QueryClient

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      staleTime: Infinity,
      retry: false,
    },
  },
})
```

`gcTime` 是客户端默认，不是 persister 的选项。

### 2. 用 Provider 包住会观察查询的树

```tsx
const persister = createAsyncStoragePersister({
  storage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
})

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: Infinity }}
    >
      <TaskDetailPane />
    </PersistQueryClientProvider>
  )
}
```

不要在 `render` 外面单独调用 `persistQueryClient()`。Provider 会按生命周期退订。

### 3. 恢复完成后再读 data

```tsx
function TaskDetailPane() {
  const isRestoring = useIsRestoring()
  const taskQuery = useQuery(taskDetailOptions)
  if (isRestoring) {
    return <p>正在恢复缓存。</p>
  }
  if (!taskQuery.data) {
    return <p>正在读取任务。</p>
  }
  return (
    <p>
      {taskQuery.data.title} / {taskQuery.data.owner}
    </p>
  )
}
```

第一次没有持久化结果时，恢复结束后会真正请求，得到现有任务 / 林晓，并写回存储。之后模拟重载会新建 `QueryClient`，先 hydrate，不再增加请求次数。

## 五、用法示例：恢复后再显示任务

下面的 Demo 用内存存储模拟持久化。第一次会先显示正在恢复，再请求出现有任务 / 林晓。点「模拟重载」会丢掉当前 `QueryClient`，从同一份存储 hydrate，任务详情仍是现有任务 / 林晓，请求次数不再增加。点「重置」会换成空存储。不要在卸载时 `queryClient.clear()`，订阅还在时会把空缓存写回存储。

:::demo{id="react.data.learn.advanced.offline-query-persistence.offline-query-persistence-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：在模块顶层调用 persistQueryClient

**触发条件：** 创建 `QueryClient` 后立刻 `persistQueryClient({ queryClient, persister })`，再渲染应用。

**原因：** 官方写明恢复是异步的，这时挂上的查询会同时 fetch。模块顶层也没有退订。

**后果：** 恢复和请求抢跑，组件卸载后仍继续写存储。

**错误示例：**

```tsx
persistQueryClient({
  queryClient,
  persister,
})
```

**正确写法：**

```tsx
<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
  <TaskDetailPane />
</PersistQueryClientProvider>
```

**验证方式：** 首次进入时正在恢复为是，请求次数仍为 0。

### 错误：gcTime 短于 maxAge

**触发条件：** `QueryClient` 使用默认 `gcTime` 5 分钟，`maxAge` 仍为 24 小时。

**原因：** 官方写明回收会先丢掉内存缓存，持久化还没到期也救不回来。

**后果：** 刷新后以为能恢复，实际已经空了。

**错误示例：**

```tsx
const queryClient = new QueryClient()
```

**正确写法：**

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
    },
  },
})
```

**验证方式：** 模拟重载后仍能读出现有任务 / 林晓。

### 错误：继续使用已弃用的同步 persister

**触发条件：** `import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'`。

**原因：** 官方标明该插件已弃用，下一主版本会移除。

**后果：** 课程主线和当前稳定 API 不一致。

**错误示例：**

```tsx
const persister = createSyncStoragePersister({
  storage: window.localStorage,
})
```

**正确写法：**

```tsx
const persister = createAsyncStoragePersister({
  storage,
})
```

**验证方式：** Demo 只从 `@tanstack/query-async-storage-persister` 创建 persister。

### 错误：恢复还没结束就判断没有 data

**触发条件：** `if (!data) return <p>正在读取任务。</p>`，不看 `useIsRestoring`。

**原因：** 恢复期间查询保持 idle，`data` 暂时还是 `undefined`，但并不是网络请求正在进行。

**后果：** 把「正在恢复」显示成「正在请求」。

**错误示例：**

```tsx
const { data } = useQuery(taskDetailOptions)
if (!data) {
  return <p>正在读取任务。</p>
}
```

**正确写法：**

```tsx
const isRestoring = useIsRestoring()
const { data } = useQuery(taskDetailOptions)
if (isRestoring) {
  return <p>正在恢复缓存。</p>
}
```

**验证方式：** 模拟重载后先看到正在恢复为是，请求次数不变。

### 错误：卸载时 clear QueryClient

**触发条件：** Persist 订阅还在时调用 `queryClient.clear()`，例如卸载 effect 里清空缓存。

**原因：** `persistQueryClientSubscribe` 会在 `removed` 时再次 `persistQueryClientSave`。清掉内存缓存等于把空结果写回存储。

**后果：** 下一次 hydrate 拿不到现有任务 / 林晓，又会发一次请求。

**错误示例：**

```tsx
useEffect(() => {
  return () => {
    queryClient.clear()
  }
}, [queryClient])
```

**正确写法：**

```tsx
<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
  <TaskDetailPane />
</PersistQueryClientProvider>
```

**验证方式：** 模拟重载后请求次数仍为 1，任务详情仍是现有任务 / 林晓。

### 错误：用 networkMode 代替持久化

**触发条件：** 给查询加 `networkMode: 'offlineFirst'`，以为刷新后还能看到林晓。

**原因：** `offlineFirst` 只决定没网时要不要暂停重试，不把缓存写进存储。

**后果：** 一重挂，内存缓存仍会丢。

**错误示例：**

```tsx
useQuery({
  ...taskDetailOptions,
  networkMode: 'offlineFirst',
})
```

**正确写法：**

```tsx
<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
  <TaskDetailPane />
</PersistQueryClientProvider>
```

**验证方式：** 模拟重载后任务详情仍来自 hydrate，而不是靠 networkMode。
:::

## 七、源码推导与适用场景

1. **官方事实：** `PersistQueryClientProvider` 先恢复再订阅。恢复完成前查询保持 idle。`gcTime` 不能低于 `maxAge`。异步 persister 是当前主线。
2. **课程推导：** 第一次没有存储时会请求现有任务 / 林晓并写回。模拟重载新建客户端后，hydrate 出同一条详情，不再发请求。
3. **适用边界：** 本课不把 `networkMode`、`resumePausedMutations`、IndexedDB 自定义 persister 或 SSR hydration 写成主线。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建 `QueryClient`，默认 `gcTime` 为 `Infinity`。用 `createAsyncStoragePersister` 和 `PersistQueryClientProvider` 包住详情查询。`queryKey` 为 `['tasks', 'detail', 't-1']`。组件用 `useIsRestoring` 和 `useQuery`。`queryFn` 调 `fetch`，非 2xx 时抛出带状态码的 `Error`。`retry` 为 `false`。

**验收：** 第一次成功后显示现有任务 / 林晓。再次挂上新的 `QueryClient` 时，先处于恢复中，恢复后仍显示现有任务 / 林晓，并且不会再发一次请求。

**参考答案：**

```tsx
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient, queryOptions, useIsRestoring, useQuery } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useState, type ReactElement } from 'react'

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

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'] as const,
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  gcTime: Infinity,
  retry: false,
})

/** 对照恢复状态与保证读到的缓存。 */
function TaskDetailPane(): ReactElement {
  const isRestoring = useIsRestoring()
  const taskQuery = useQuery(taskDetailOptions)
  if (isRestoring) {
    return <p>正在恢复缓存。</p>
  }
  if (!taskQuery.data) {
    return <p>正在读取任务。</p>
  }
  return (
    <p>
      {taskQuery.data.title} / {taskQuery.data.owner}
    </p>
  )
}

/** 先恢复缓存，再观察详情。 */
export function App(): ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: Infinity,
            staleTime: Infinity,
            retry: false,
          },
        },
      }),
  )
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: window.localStorage,
    }),
  )

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: Infinity }}
    >
      <TaskDetailPane />
    </PersistQueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 持久化把脱水后的 `QueryClient` 交给 persister，启动时再 hydrate。
- `PersistQueryClientProvider` 先恢复再订阅，避免抢跑。
- 恢复完成前用 `useIsRestoring` 判断，不要当成正在请求。
- `gcTime` 不能低于 `maxAge`。
- 本课不展开 `networkMode` 或 SSR hydration。

## 十、参考资料

- [persistQueryClient](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient) - 支持 PersistQueryClientProvider 先恢复再订阅，并说明 gcTime 与 maxAge。
- [createAsyncStoragePersister](https://tanstack.com/query/latest/docs/framework/react/plugins/createAsyncStoragePersister) - 支持当前主线的异步 persister。
- [createSyncStoragePersister](https://tanstack.com/query/latest/docs/framework/react/plugins/createSyncStoragePersister) - 支持标明同步 persister 已弃用。
- [PersistQueryClientProvider source](https://unpkg.com/@tanstack/react-query-persist-client@5.102.8/src/PersistQueryClientProvider.tsx) - 支持先 restore 再 subscribe，并用 IsRestoringProvider 下发状态。
- [persistQueryClient core source](https://unpkg.com/@tanstack/query-persist-client-core@5.102.8/src/persist.ts) - 支持 restore 时 hydrate，save 时 dehydrate。
