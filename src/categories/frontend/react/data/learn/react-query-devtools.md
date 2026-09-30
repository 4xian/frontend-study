---
id: react.data.learn.basics.react-query-devtools
type: lesson
title: React Query Devtools
summary: 安装并挂载真实的 React Query Devtools，在开发环境打开面板观察查询缓存与状态。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - react.data.learn.basics.typescript-queries
related:
  - react.data.learn.basics.query-client-and-provider
  - react.data.learn.basics.query-status
  - react.data.learn.basics.query-cache-and-sharing
tags:
  - TanStack Query
  - React Query Devtools
  - ReactQueryDevtools
  - ReactQueryDevtoolsPanel
  - query cache
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 安装与 @tanstack/react-query 主版本匹配的 @tanstack/react-query-devtools。
  - 在 QueryClientProvider 内挂载 ReactQueryDevtools 或 ReactQueryDevtoolsPanel。
  - 打开面板并对照 queryKey、查询状态和缓存条目。
  - 说明默认入口只在开发构建中包含 Devtools。
  - 识别把 Devtools 放在 Provider 外或自制假面板的后果。
recap:
  - Devtools 是独立包装，需要与 Query 包主版本保持同步后再挂载。
  - 组件必须放在 QueryClientProvider 内，才能读取当前作用域的 QueryClient。
  - 浮动模式用角落按钮开关；嵌入模式把真实面板放进自己的调试区域。
  - 默认入口在非 development 构建中渲染为空，不把生产架构、持久化或 SSR 当作本课范围。
  - 观察对象是真实查询缓存，不能用外观相似的自制列表代替官方面板。
sources:
  - title: Devtools
    url: https://tanstack.com/query/latest/docs/framework/react/devtools
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - Devtools 是需要单独安装的独立包装。
      - 从 @tanstack/react-query-devtools 导入 ReactQueryDevtools 或 ReactQueryDevtoolsPanel。
      - 默认只在 process.env.NODE_ENV === 'development' 时包含进构建。
      - 浮动模式提供角落开关，开关状态会记入 localStorage。
      - 嵌入模式用 ReactQueryDevtoolsPanel 把真实面板放进应用自己的调试区域。
      - 应尽量靠近应用根部挂载，并放在 QueryClientProvider 内。
  - title: QueryClientProvider
    url: https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - QueryClientProvider 把指定 QueryClient 提供给 React 子树。
  - title: React Query Devtools entry
    url: https://unpkg.com/@tanstack/react-query-devtools@5.102.8/src/index.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - 默认入口在 NODE_ENV 不是 development 时把 Devtools 组件替换为空实现。
  - title: ReactQueryDevtools source
    url: https://unpkg.com/@tanstack/react-query-devtools@5.102.8/src/ReactQueryDevtools.tsx
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - ReactQueryDevtools 通过 useQueryClient 读取客户端，并在挂载节点上调用官方 Devtools 的 mount 与 unmount。
---

# React Query Devtools

## 一、学习目标

- 安装与 `@tanstack/react-query` 主版本匹配的 `@tanstack/react-query-devtools`。
- 在 `QueryClientProvider` 内挂载 `ReactQueryDevtools` 或 `ReactQueryDevtoolsPanel`。
- 打开面板并对照 `queryKey`、查询状态和缓存条目。
- 说明默认入口只在开发构建中包含 Devtools。
- 识别把 Devtools 放在 Provider 外或自制假面板的后果。

## 二、为什么需要 Devtools

查询成功、失败或正在重新获取时，页面只能看到组件自己渲染的结果。缓存里到底有哪些 `queryKey`、当前
`status` 是什么、这次失败对应哪一条查询，单靠界面文案很容易猜错。

React Query Devtools 把当前 `QueryClient` 中的查询展示成可开关的面板。它读取的是真实缓存，而不是另一份
演示数据。基础阶段用它核对查询身份和状态即可，不必同时处理 Mutation、持久化或服务端渲染。

## 三、核心概念

### 1. Devtools 是独立包装

官方文档要求单独安装 `@tanstack/react-query-devtools`。它不是 `@tanstack/react-query` 的默认导出，也不能
用自制列表冒充。安装时让它与当前 Query 包装的主版本一致，例如 Query 是 `5.102.8` 时，Devtools 也使用
`5.102.8`。

```ts
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
```

默认入口只在 `process.env.NODE_ENV === 'development'` 时包含真实实现；其他构建会得到一个渲染 `null` 的
空组件，因此开发时不必再手工从生产包里剔除它。

### 2. 必须挂在 QueryClientProvider 内

Devtools 通过 `useQueryClient` 读取最近的客户端。没有 Provider 时，它拿不到要观察的缓存。官方建议把它
放得尽量靠近应用根部，但仍应作为 `QueryClientProvider` 的子节点：

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

/** 在应用根部提供客户端，并挂载开发用 Devtools。 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

`initialIsOpen={false}` 表示首次进入时面板关闭，只保留角落开关。浮动模式会记住开关状态。

### 3. 浮动模式与嵌入模式

- `ReactQueryDevtools`：浮动模式，用角落按钮开关面板，适合挂在应用根部长时间调试。
- `ReactQueryDevtoolsPanel`：嵌入模式，由你决定何时渲染面板，适合把官方面板放进自己的调试区域。

嵌入模式仍然是官方面板，只是位置由调用方控制：

```tsx
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { useState } from 'react'

/** 用按钮开关嵌入式官方面板。 */
function DebugWorkspace() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <button type="button" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? '关闭面板' : '打开面板'}
      </button>
      {isOpen && (
        <ReactQueryDevtoolsPanel onClose={() => setIsOpen(false)} style={{ height: '280px' }} />
      )}
    </>
  )
}
```

本课 Demo 使用嵌入模式，是为了让真实面板出现在课程观察区内，而不是页面角落里被宿主裁切。两种模式观察
的都是同一份查询缓存。

### 4. 面板里应该看什么

打开面板后，先找与当前 `queryKey` 对应的条目，再核对它的状态。基础阶段至少能对应这些变化：

- 尚未执行：查询还没有成功数据，面板中这条缓存要么尚未出现，要么处于空闲。
- 正在读取：`fetchStatus` 为 `fetching`，面板中的状态会同步变成获取中。
- 成功：缓存里能看到返回数据，`status` 为 `success`。
- 失败：同一条 `queryKey` 进入 `error`，错误信息可在面板中核对。
- 手动刷新：再次执行后，面板中的更新时间和状态会跟着变化。

Devtools 不替代组件里的加载和错误分支；它用来证明这些分支背后的缓存事实。

### 5. 开发环境边界

默认导入路径会在非 development 构建中变成空实现。这是开发工具的边界，不是生产架构方案。本课不讲解如何
把 Devtools 塞进生产包、不讲解缓存持久化，也不讲解 SSR 或 hydration 调试。浏览器扩展可以观察同样的查询，
但不能替代本课要掌握的应用内挂载方式。

## 四、用法与示例

### 1. 安装后再导入

先安装独立包装，再从官方入口导入组件。不要从 `@tanstack/react-query` 里寻找 `ReactQueryDevtools`。

```bash
npm i @tanstack/react-query-devtools
```

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
```

如果 Query 包装已经锁定到某个 `5.x` 版本，Devtools 也应使用同一主版本，避免面板和缓存协议对不齐。

### 2. 用一次查询对照面板

先声明稳定的 `QueryClient` 和 `queryKey`，再让 Devtools 与查询组件共享同一 Provider。点击读取后，页面状态
和面板条目应指向同一条查询。

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()
const profileQueryKey = ['profile', 'u-14'] as const

/** 读取一份用于对照 Devtools 的用户资料。 */
async function loadProfile(): Promise<{ name: string }> {
  const response = await fetch('/api/profile/u-14')
  if (!response.ok) throw new Error('读取资料失败')
  return response.json() as Promise<{ name: string }>
}

/** 在查询组件旁挂载浮动 Devtools。 */
function ProfilePage() {
  const query = useQuery({
    queryKey: profileQueryKey,
    queryFn: loadProfile,
  })

  return (
    <section>
      {query.isPending && <p>正在读取</p>}
      {query.isError && <p role="alert">{query.error.message}</p>}
      {query.isSuccess && <p>{query.data.name}</p>}
      <ReactQueryDevtools initialIsOpen={false} />
    </section>
  )
}

/** 根组件提供客户端，让页面和 Devtools 观察同一份缓存。 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
    </QueryClientProvider>
  )
}
```

## 五、用法示例：观察真实 Devtools 面板

下面的 Demo 安装并渲染官方 `ReactQueryDevtoolsPanel`。先打开面板，再读取资料、模拟失败或手动刷新，对照
页面上的 `queryKey`、`status` 与面板中的缓存条目。关闭面板后可以再次打开；重置查询会换一个查询身份，
方便从头观察。生产构建中默认入口不会挂载真实面板，这是开发边界，不是自制替代方案。

:::demo{id="react.data.learn.basics.react-query-devtools.react-query-devtools-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：在 QueryClientProvider 外挂载 Devtools

**触发条件：** 把 `ReactQueryDevtools` 放在 Provider 外面，或放进另一个没有客户端的 React 树。

**原因：** Devtools 通过 `useQueryClient` 读取最近的 `QueryClient`，没有 Provider 就没有可观察的缓存。

**后果：** 组件无法挂载，或观察不到当前查询，调试面板是空的。

**错误示例：**

```tsx
function App() {
  return (
    <>
      <ReactQueryDevtools />
      <QueryClientProvider client={queryClient}>
        <ProfilePage />
      </QueryClientProvider>
    </>
  )
}
```

**正确写法：**

```tsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**验证方式：** 把 Devtools 移到 Provider 内后重新挂载，确认面板能列出当前 `queryKey`。

### 错误：用自制列表代替官方面板

**触发条件：** 自己渲染一份查询状态卡片，看起来像调试工具，却从不导入 `@tanstack/react-query-devtools`。

**原因：** 把“能显示 status”误当成已经接入 Devtools。自制 UI 不会挂载官方观察器，也无法证明缓存条目来自
QueryClient。

**后果：** 页面状态和真实缓存可能不一致，后续调试会继续猜。

**错误示例：**

```tsx
function FakeDevtools({ status }: { status: string }) {
  return <aside>查询状态：{status}</aside>
}
```

**正确写法：**

```tsx
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

function DebugWorkspace() {
  return <ReactQueryDevtoolsPanel style={{ height: '280px' }} />
}
```

**验证方式：** 检查源码是否从 `@tanstack/react-query-devtools` 导入，并在面板中看到与 `queryKey` 对应的条目。

### 错误：Devtools 与 Query 主版本不一致

**触发条件：** `@tanstack/react-query` 已锁定 `5.x`，却安装了另一个主版本的 Devtools。

**原因：** 官方要求相关包装的主版本保持同步，面板依赖同一代查询客户端协议。

**后果：** 安装失败、类型不匹配，或面板无法正确读取当前缓存。

**错误示例：**

```ts
// package.json
{
  "dependencies": {
    "@tanstack/react-query": "5.102.8",
    "@tanstack/react-query-devtools": "4.36.1"
  }
}
```

**正确写法：**

```ts
// package.json
{
  "dependencies": {
    "@tanstack/react-query": "5.102.8",
    "@tanstack/react-query-devtools": "5.102.8"
  }
}
```

**验证方式：** 核对两个包装的主版本号相同，并且 Devtools 能列出当前查询。

### 错误：以为生产构建默认仍包含面板

**触发条件：** 在生产模式导入默认入口后，期望页面角落仍然出现 TanStack 开关。

**原因：** 默认入口在 `NODE_ENV` 不是 `development` 时会换成渲染 `null` 的空组件。

**后果：** 生产页面上看不到面板，却误以为挂载代码写错了；或者为了“看到面板”去改生产架构。

**错误示例：**

```tsx
// 生产构建中仍按开发环境去找角落按钮
<ReactQueryDevtools initialIsOpen />
```

**正确写法：**

```tsx
if (import.meta.env.DEV) {
  return <ReactQueryDevtools initialIsOpen={false} />
}

return null
```

**验证方式：** 分别在开发构建和生产构建中检查默认入口：开发可见官方面板，生产不渲染该面板。

### 错误：把浏览器扩展当成唯一挂载方式

**触发条件：** 只安装浏览器扩展，从不在应用里导入 `@tanstack/react-query-devtools`。

**原因：** 官方提到扩展可以观察同样的查询，但课程要掌握的是应用内组件如何挂到当前 `QueryClient`。

**后果：** 换一台没有扩展的开发环境后无法观察缓存，也不知道 Provider 挂载边界。

**错误示例：**

```tsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
    </QueryClientProvider>
  )
}
```

**正确写法：**

```tsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**验证方式：** 不依赖扩展，只打开应用内面板，确认仍能看到当前查询。
:::

## 七、源码推导与适用场景

1. **官方事实：** Devtools 文档把它定义为单独安装的包装，并给出 `ReactQueryDevtools` 与
   `ReactQueryDevtoolsPanel` 两种挂载方式；默认只在 `NODE_ENV === 'development'` 时进入构建。当前版本的
   入口源码把非 development 环境替换为空组件。`ReactQueryDevtools` 源码通过 `useQueryClient` 取得客户端，
   再对挂载节点调用官方观察器的 `mount` / `unmount`。
2. **课程推导：** 把官方组件放进当前 `QueryClientProvider`，再发起一次真实查询，是观察缓存和状态的最小
   闭环。嵌入模式适合把面板留在课程或内部调试区；浮动模式适合应用根部。两者都不应被自制列表替换。
3. **适用边界：** 本课只覆盖安装、挂载、打开面板和观察查询缓存/状态。生产包懒加载、持久化、SSR、Mutation
   细节和浏览器扩展实现都不在本课展开。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写一个根组件：创建稳定的 `QueryClient`，用 `QueryClientProvider` 包裹页面，页面内使用
`useQuery` 读取用户资料，并在同一 Provider 内挂载 `ReactQueryDevtools`，默认关闭面板。

**验收：** Devtools 从 `@tanstack/react-query-devtools` 导入；它是 Provider 的子节点；`queryKey` 能唯一
描述这份资料；开发环境打开面板后能看到该查询，而不是自制状态列表。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactElement } from 'react'

type UserProfile = {
  id: string
  name: string
}

const queryClient = new QueryClient()
const profileQueryKey = ['profile', 'u-14'] as const

/** 读取用于对照 Devtools 的用户资料。 */
async function loadProfile(): Promise<UserProfile> {
  const response = await fetch('/api/profile/u-14')
  if (!response.ok) throw new Error('读取资料失败')
  return response.json() as Promise<UserProfile>
}

/** 声明查询，并在同一棵树中挂载官方 Devtools。 */
function ProfilePage(): ReactElement {
  const query = useQuery({
    queryKey: profileQueryKey,
    queryFn: loadProfile,
  })

  return (
    <section>
      {query.isPending && <p>正在读取</p>}
      {query.isError && <p role="alert">{query.error.message}</p>}
      {query.isSuccess && <p>{query.data.name}</p>}
      <ReactQueryDevtools initialIsOpen={false} />
    </section>
  )
}

/** 提供稳定客户端，让页面和 Devtools 观察同一份缓存。 */
export function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- Devtools 需要单独安装，并与 Query 包装保持同一主版本。
- 把官方组件放进 `QueryClientProvider`，才能观察当前客户端的查询缓存。
- 浮动模式用角落开关，嵌入模式把真实面板放进自己的区域。
- 默认入口只服务开发构建；不要把它扩展成生产架构或持久化方案。
- 观察对象必须是官方面板中的真实查询，而不是外观相似的自制列表。

## 十、参考资料

- [Devtools](https://tanstack.com/query/latest/docs/framework/react/devtools) - 支持安装、浮动/嵌入挂载和开发构建边界。
- [QueryClientProvider](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) - 支持 Devtools 读取当前客户端的作用域。
- [React Query Devtools entry](https://unpkg.com/@tanstack/react-query-devtools@5.102.8/src/index.ts) - 支持默认入口在非 development 时为空实现。
- [ReactQueryDevtools source](https://unpkg.com/@tanstack/react-query-devtools@5.102.8/src/ReactQueryDevtools.tsx) - 支持通过 useQueryClient 挂载官方观察器。
