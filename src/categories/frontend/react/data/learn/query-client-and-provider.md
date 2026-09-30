---
id: react.data.learn.basics.query-client-and-provider
type: lesson
title: Query Client 与 Provider
summary: 创建稳定的 QueryClient，并用 QueryClientProvider 把它提供给需要访问数据层的 React 子树。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 35
prerequisites:
  - react.data.learn.basics.server-state-and-tanstack-query
related: []
tags:
  - TanStack Query
  - QueryClient
  - QueryClientProvider
  - QueryCache
  - React Context
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能在应用边界创建一个稳定的 QueryClient 实例。
  - 能使用 QueryClientProvider 将指定客户端提供给 React 子树。
  - 能解释 QueryClient、QueryCache 与 Provider 各自负责什么。
  - 能根据 Provider 作用域判断组件访问的是共享客户端还是隔离客户端。
  - 能避免在组件每次渲染时重复创建 QueryClient。
recap:
  - QueryClient 是应用与 TanStack Query 缓存交互的入口；QueryCache 负责存储查询数据、元信息和状态。
  - QueryClientProvider 通过 React Context 提供指定的 QueryClient，不负责请求业务逻辑。
  - 同一 Provider 子树中的组件访问同一个客户端；不同 Provider 可以使用不同客户端并保持缓存隔离。
  - QueryClient 应在组件外或稳定的初始化位置创建，避免渲染时丢失缓存和配置。
  - 本课只建立客户端与 Provider 的作用域模型，查询声明和查询生命周期另行学习。
sources:
  - title: QueryClient
    url: https://tanstack.com/query/latest/docs/reference/QueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueryClient 是与缓存交互的入口，并提供读取和写入缓存的操作。
      - QueryClient 可以配置查询和 Mutation 的默认选项。
  - title: QueryCache
    url: https://tanstack.com/query/latest/docs/reference/QueryCache
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueryCache 是 TanStack Query 的存储机制，保存查询数据、元信息和状态。
  - title: QueryClientProvider
    url: https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueryClientProvider 将 QueryClient 连接并提供给 React 应用。
      - Provider 的 client 属性决定子树访问的 QueryClient。
  - title: useQueryClient
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQueryClient
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useQueryClient 返回当前作用域中的 QueryClient 实例。

---

# Query Client 与 Provider

## 一、学习目标

- 在应用边界创建一个稳定的 `QueryClient` 实例。
- 使用 `QueryClientProvider` 将指定客户端提供给 React 子树。
- 解释 `QueryClient`、`QueryCache` 与 Provider 各自负责什么。
- 根据 Provider 作用域判断组件访问的是共享客户端还是隔离客户端。
- 避免在组件每次渲染时重复创建 `QueryClient`。

## 二、为什么需要一个 QueryClient

上一课把远程任务归为服务端状态。要让多个 React 组件共同使用这类数据，应用需要一个稳定的运行时
入口：它保存查询相关的缓存连接，并提供读取、写入、失效等操作。

这个入口就是 `QueryClient`。它不是某一个组件的局部 State，也不是服务端 API；它代表当前 React 应用
使用的 TanStack Query 客户端实例。组件是否能访问它，取决于自己是否位于对应的 Provider 子树中。

## 三、三个角色的边界

### 1. QueryClient：缓存操作入口

`QueryClient` 提供应用与查询缓存交互的方法。需要同步读取已有缓存、写入已知数据或让一组查询失效时，
由它转发操作到所连接的缓存。

```tsx
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

queryClient.setQueryData(['profile'], { name: '林晓' })
const profile = queryClient.getQueryData<{ name: string }>(['profile'])
```

上例只用来说明客户端是缓存操作入口。数组标识的组织规则、异步查询和状态读取将在后续课程展开。

### 2. QueryCache：实际存储机制

`QueryCache` 保存查询的数据、元信息和状态。应用代码通常通过 `QueryClient` 间接访问它，而不是把
`QueryCache` 当成组件状态直接改写。

可以把两者关系记成：

```text
React 组件 -> QueryClient -> QueryCache
```

这个关系说明了“谁负责操作”和“哪里存储”是两个不同问题。Provider 不会替代其中任何一个角色。

### 3. QueryClientProvider：React 作用域桥梁

`QueryClientProvider` 接收必填的 `client` 属性，并通过 React Context 把该实例提供给 `children` 子树：

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Workspace />
    </QueryClientProvider>
  )
}
```

Provider 只建立“这棵子树使用哪个客户端”的连接。它不会自动发请求，也不会把远程数据复制成 React State。

React 组件若要取得当前作用域的实例，可以调用 `useQueryClient()`。这个 Hook 只返回最近 Provider 提供的
`QueryClient`，不执行请求；本课的 Demo 用它观察作用域，查询 Hook 的声明方式留到后续课程。

## 四、创建与提供一个稳定客户端

### 1. 在应用边界创建

最简单的做法是在模块顶层创建实例，再在应用入口提供它：

```tsx
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
)
```

这样同一个应用生命周期内的组件会引用同一个客户端。客户端实例保存的缓存连接和配置也不会因为某个
组件重新渲染而被重置。

### 2. 避免渲染时重复创建

下面的写法会在每次 `App` 渲染时创建新实例：

```tsx
function App() {
  // 错误：App 重新渲染就会替换客户端。
  const queryClient = new QueryClient()
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

如果确实需要在组件内部延迟初始化，应保证实例在后续渲染中保持不变；本课优先使用应用边界的模块级
实例，让生命周期最容易被观察和维护。

### 3. 作用域可以隔离

Provider 的子树只读取自己最近的匹配 Provider。两个 Provider 使用不同的 `QueryClient` 时，它们连接的是
不同的缓存入口：

```tsx
const mainClient = new QueryClient()
const previewClient = new QueryClient()

function Root() {
  return (
    <QueryClientProvider client={mainClient}>
      <MainWorkspace />
      <QueryClientProvider client={previewClient}>
        <PreviewWorkspace />
      </QueryClientProvider>
    </QueryClientProvider>
  )
}
```

内层 Provider 会覆盖自己的子树；外层的其他兄弟仍使用 `mainClient`。除非明确需要隔离缓存，否则应用通常
只维护一个根客户端。

## 五、用法示例：观察共享与隔离

下面的 Demo 不执行网络请求，而是用 `QueryClient` 的同步缓存读写方法显示作用域。每个作用域包含两个读取
组件：同一作用域内点击写入后，两者会显示同一个客户端实例和同一份缓存值；另一个 Provider 的值不会改变。

:::demo{id="react.data.learn.basics.query-client-and-provider.query-client-provider-scope-demo"}
:::

观察时依次点击两个作用域中的“写入当前客户端”，再比较客户端标识和缓存值。这个观察只证明 Provider
提供了哪个 `QueryClient`，不代表本课已经讲完查询函数、查询键设计或缓存新鲜度。

## 六、易错使用提示

:::pitfalls
### 错误：每次渲染都创建 QueryClient

**触发条件：** 把 `new QueryClient()` 放进会重新渲染的组件函数体。

**原因：** 把客户端实例误当成一次渲染所需的临时对象。

**后果：** Provider 连接的客户端不断更换，缓存入口、默认配置和订阅关系可能被重置。

**错误示例：**

```tsx
function App() {
  const queryClient = new QueryClient()
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

**正确写法：**

```tsx
const queryClient = new QueryClient()

function App() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

**验证方式：** 触发 App 重渲染，确认 Provider 仍引用同一个客户端实例。

### 错误：忘记用 Provider 包裹使用方

**触发条件：** 在 Provider 外渲染依赖 QueryClient 的组件。

**原因：** 只导入了组件 Hook，却没有建立 React Context 连接。

**后果：** 使用方找不到最近的 QueryClient，运行时会抛出缺少客户端上下文的错误。

**错误示例：**

```tsx
function App() {
  return <Workspace />
}
```

**正确写法：**

```tsx
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Workspace />
    </QueryClientProvider>
  )
}
```

**验证方式：** 从 Demo 的 Provider 子树移出读取组件，确认它不再能访问客户端；恢复包裹后客户端标识正常显示。

### 错误：误把 QueryCache 当成 React State

**触发条件：** 直接修改从缓存读取出的对象，或让多个组件各自维护一份远程数据副本。

**原因：** 混淆缓存存储机制与组件渲染状态。

**后果：** 更新没有经过 QueryClient，组件之间的通知和数据所有权变得不可预测。

**错误示例：**

```tsx
const profile = queryClient.getQueryData<Profile>(['profile'])
profile.name = '新名称'
```

**正确写法：**

```tsx
queryClient.setQueryData<Profile>(['profile'], (oldProfile) =>
  oldProfile ? { ...oldProfile, name: '新名称' } : oldProfile,
)
```

**验证方式：** 通过 QueryClient 的写入方法更新，再观察同一 Provider 子树中的读取方都能看到一致值。

### 错误：无意中用两个客户端承载同一作用域

**触发条件：** 为同一页面的不同组件分别创建 QueryClient，却期望它们自动共享缓存。

**原因：** 把“多个组件”误解成“多个客户端”。

**后果：** 相同查询可能在两个缓存中各存一份，读取和失效行为无法相互看到。

**错误示例：**

```tsx
const HeaderClient = new QueryClient()
const ContentClient = new QueryClient()
```

**正确写法：**

```tsx
const appClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={appClient}>
      <Header />
      <Content />
    </QueryClientProvider>
  )
}
```

**验证方式：** 让需要共享数据的组件位于同一个 Provider 子树，确认它们显示相同客户端标识。
:::

## 七、原理与适用场景

### 1. 官方事实

TanStack Query 的 `QueryClient` 文档将它定义为与缓存交互的入口；`QueryCache` 文档将缓存定义为数据、
元信息和状态的存储机制。`QueryClientProvider` 文档要求通过 `client` 属性把一个 QueryClient 连接并
提供给 React 应用。

### 2. 课程推导

可以把 Provider 看作 React 树中的作用域边界，把 QueryClient 看作该边界内的数据层入口。需要共享缓存的
组件放进同一个 Provider；需要隔离缓存的嵌入式工作区才使用不同 Provider。稳定实例让缓存生命周期与应用
生命周期一致。

### 3. 适用边界

根应用通常只需要一个 QueryClient。多客户端适用于明确的隔离场景，例如独立预览区或不同后端上下文；它
不是为了把每个组件的局部状态都交给 QueryClient。查询声明、请求函数、查询状态和缓存新鲜度属于后续课程。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建一个 `QueryClient`，用 `QueryClientProvider` 包裹两个读取组件，并让其中一个组件通过
`useQueryClient` 写入一条同步缓存值，另一个组件读出该值。再添加第二个使用不同客户端的 Provider，说明它
为什么看不到第一份值。

**验收：** 同一 Provider 下的两个组件显示相同客户端身份，写入后都能看到新值；第二个 Provider 的读取值
保持独立；重新渲染外层组件不会更换已创建的客户端。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

const cacheKey = ['lesson-provider-value'] as const
const appClient = new QueryClient()
const previewClient = new QueryClient()

type ReaderProps = {
  label: string
  onCacheChange: () => void
}

/** 显示当前 Provider 的客户端和缓存值，并提供一个写入入口。 */
function Reader({ label, onCacheChange }: ReaderProps) {
  const client = useQueryClient()
  const value = client.getQueryData<string>(cacheKey) ?? '尚未写入'

  /** 写入当前作用域的缓存，并请求父组件重新渲染所有读取方。 */
  function writeValue(): void {
    client.setQueryData(cacheKey, `${label}写入成功`)
    onCacheChange()
  }

  return (
    <div>
      <strong>{label}</strong>
      <span>{client === appClient ? '应用客户端' : '预览客户端'}</span>
      <span>{value}</span>
      <button type="button" onClick={writeValue}>
        写入
      </button>
    </div>
  )
}

/** 创建独立的刷新信号，让同一 Provider 下的读取组件重新读取缓存。 */
function App() {
  const [, setAppRevision] = useState(0)
  const [, setPreviewRevision] = useState(0)

  /** 刷新应用客户端作用域中的所有读取组件。 */
  function refreshAppScope(): void {
    setAppRevision((revision) => revision + 1)
  }

  /** 刷新预览客户端作用域中的所有读取组件。 */
  function refreshPreviewScope(): void {
    setPreviewRevision((revision) => revision + 1)
  }

  return (
    <QueryClientProvider client={appClient}>
      <Reader label="主区域" onCacheChange={refreshAppScope} />
      <Reader label="主区域副本" onCacheChange={refreshAppScope} />
      <QueryClientProvider client={previewClient}>
        <Reader label="预览区域" onCacheChange={refreshPreviewScope} />
      </QueryClientProvider>
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- `QueryClient` 是操作查询缓存的入口，`QueryCache` 是保存查询数据、元信息和状态的存储机制。
- `QueryClientProvider` 通过 `client` 属性把指定客户端提供给 `children` 子树。
- 同一 Provider 子树共享客户端；不同 Provider 使用不同客户端时缓存相互隔离。
- 在稳定的应用边界创建 QueryClient，避免每次渲染替换实例。

## 十、参考资料

- [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) - QueryClient 的缓存交互方法与配置入口。
- [QueryCache](https://tanstack.com/query/latest/docs/reference/QueryCache) - 查询数据、元信息和状态的存储机制。
- [QueryClientProvider](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) - 将 QueryClient 提供给 React 子树的组件合同。
- [useQueryClient](https://tanstack.com/query/latest/docs/framework/react/reference/useQueryClient) - 读取最近 Provider 提供的 QueryClient 实例。
