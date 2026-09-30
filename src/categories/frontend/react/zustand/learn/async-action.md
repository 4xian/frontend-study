---
id: react.zustand.learn.intermediate.async-action
type: lesson
title: 异步 Action
summary: 把异步流程写成 Store 里的 async 函数，准备好后再 set，await 之后用 get 读取当前快照。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.intermediate.derived-state
related:
  - react.zustand.learn.intermediate.derived-state
  - react.zustand.learn.basics.get-current-state
tags:
  - Zustand
  - 异步 Action
  - set
  - get
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能说明 Zustand 不提供单独的异步 API，Action 写成 async 函数即可。
  - 能在异步流程开始时写入 loading，结束后再写入结果或错误。
  - 能在 await 之后调用 get() 读取当前快照，而不是使用进入异步前的闭包值。
  - 能识别后返回的请求覆盖先返回结果，以及把服务端缓存塞进客户端 Store 这两类错误。
recap:
  - 异步 Action 就是普通 async 函数；Zustand 不关心它是否异步。
  - 准备好再 set：先写 loading，拿到结果或错误后再写一次。
  - await 之后用 get() 读当前 Store，不要沿用进入异步前的旧字段。
  - 本课不把远程列表做成服务端缓存，也不引入 persist、AbortController 或 Query。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README Async actions
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - Zustand 不关心 Action 是否异步，准备好后再调用 set。
      - "官方示例把 `fetch` 写成 async，await 响应后再 `set({ fishies })`。"
  - title: Zustand Beginner TypeScript Async Actions
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/beginner-typescript.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - Action 可以是 async，用来拉取远程数据并更新状态。
      - "官方示例 `fetchBears` 的类型是 `() => Promise<void>`，await JSON 后再 `set({ bears: data.count })`。"
  - title: Zustand 5.0.15 vanilla store implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - setState 同步合并当前 state，没有单独的异步队列。
      - getState 返回调用当下的 state 变量。
  - title: Zustand 5.0.15 create API
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/apis/create.md
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - create 的初始化函数接收 set、get 和 store。
---

# 异步 Action

## 一、学习目标

- 把异步流程写成 Store 里的 `async` 函数，不另找一套异步 API。
- 请求开始时写入 `loading`，结束后写入结果或错误。
- `await` 之后用 `get()` 读取当前快照，再决定要不要写入。
- 识别“后返回的请求覆盖先返回的结果”和“把服务端缓存塞进客户端 Store”。

## 二、为什么需要异步 Action

同步 Action 在一次点击里立刻 `set`。拉资料、提交表单、校验验证码都要等网络。这段等待期间界面需要知道“正在进行”，结束后需要知道结果或错误。

Zustand 不为异步单独发明 API。README 写明：准备好再调用 `set`，它不关心 Action 是否异步。异步 Action 仍是 Store 里的函数，只是函数体里可以 `await`，并在不同时刻写多次状态。

服务端缓存、失效、重试和分页属于 TanStack Query。本课只处理一次客户端命令的过程状态：`loading`、结果和错误。

## 三、核心概念

### 1. 异步 Action 仍是普通函数

官方示例：

```tsx
const useFishStore = create((set) => ({
  fishies: {},
  fetch: async (pond) => {
    const response = await fetch(pond)
    set({ fishies: await response.json() })
  },
}))
```

`fetch` 和 `addFish` 一样挂在 Store 上。组件选择并调用它。`async` 只让函数体可以 `await`；`set` 仍然同步合并当前快照。

Beginner TypeScript 把这种 Action 标成 `() => Promise<void>`。调用方可以 `await loadProfile()`，Store 本身不等待 Promise。

### 2. 准备好再 set，过程状态也是 State

`setState` 同步执行。`await` 期间不会自动出现 loading。需要界面反馈时，自己写入过程字段：

```tsx
loadProfile: async () => {
  set({ loading: true, error: null, profile: null })
  const response = await fetch('/api/profile')
  const data = await response.json()
  set({ profile: data, loading: false })
},
```

第一次 `set` 立刻让订阅 `loading` 的组件重渲染。第二次 `set` 发生在数据就绪之后。失败时同样要写回 `loading: false`，并写入 `error`。

这些字段是这次命令的客户端事实，不是远程列表的第二份缓存。

### 3. await 之后用 get 读当前快照

`await` 让出执行权。回来时 Store 可能已经被另一次点击改过。进入函数时闭包住的 `loading`、`requestId` 或旧 `profile` 不再可信。

`get()` 返回调用当下的完整快照。源码里它就是 `getState`，读取当前 `state` 变量：

```tsx
loadProfile: async () => {
  const requestId = get().requestId + 1
  set({ requestId, loading: true, error: null, profile: null })
  try {
    const profile = await fakeFetch()
    if (get().requestId !== requestId) return
    set({ profile, loading: false, error: null })
  } catch (error) {
    if (get().requestId !== requestId) return
    set({
      loading: false,
      error: error instanceof Error ? error.message : '加载失败',
    })
  }
},
```

后发出的请求先改 `requestId`。先发出、后返回的那一次在 `await` 之后对不上号，直接返回，不再 `set`。

### 4. 后写入的 set 覆盖先写入的结果

Zustand 没有请求队列。两次异步 Action 都会在各自准备好时调用 `set`。后执行的那一次合并进当前 state。

因此：慢请求后发出快失败时，若不做 `requestId` 判断，慢请求仍会把失败结果盖掉。过程状态必须和这次请求绑定，不能默认“最后结束的一定是用户想看的”。

## 四、用法与示例

### 1. 用 async 函数拉取并写入

```tsx
type Profile = {
  name: string
}

type ProfileStore = {
  profile: Profile | null
  loading: boolean
  error: string | null
  loadProfile: () => Promise<void>
}

const useProfileStore = create<ProfileStore>()((set) => ({
  profile: null,
  loading: false,
  error: null,
  loadProfile: async () => {
    set({ loading: true, error: null })
    const response = await fetch('/api/profile')
    const data: Profile = await response.json()
    set({ profile: data, loading: false })
  },
}))
```

组件分别选择字段和 Action：

```tsx
function ProfileName() {
  const name = useProfileStore((state) => state.profile?.name ?? '空')
  return <p>{name}</p>
}

function LoadButton() {
  const loadProfile = useProfileStore((state) => state.loadProfile)
  return (
    <button type="button" onClick={() => void loadProfile()}>
      加载资料
    </button>
  )
}
```

`LoadButton` 只订 Action，资料回来时不必重渲染按钮。

### 2. 失败时写回 loading 和 error

```tsx
loadProfile: async () => {
  set({ loading: true, error: null })
  try {
    const response = await fetch('/api/profile')
    if (!response.ok) throw new Error('加载失败')
    const data: Profile = await response.json()
    set({ profile: data, loading: false, error: null })
  } catch (error) {
    set({
      loading: false,
      error: error instanceof Error ? error.message : '加载失败',
    })
  }
},
```

漏掉失败分支的 `loading: false`，订阅 loading 的组件会一直显示“进行中”。

### 3. 用 requestId 丢掉过期结果

```tsx
loadProfile: async () => {
  const requestId = get().requestId + 1
  set({ requestId, loading: true, error: null, profile: null })
  const profile = await fakeFetch()
  if (get().requestId !== requestId) return
  set({ profile, loading: false })
},
```

这是本课处理竞态的方式：用 `get()` 核对“现在还是不是我这次请求”。`AbortController` 取消底层网络，不在这里展开。

### 4. 观察 loading、结果、错误和过期写入

下面的 Demo 用同一份资料 Store：一块选择 `loading`，一块选择姓名，一块选择 `error`，一块不传选择函数。点击「加载资料」会先看到 loading，再看到姓名。点击「模拟失败」会看到错误。先点「发出慢请求」再点「模拟失败」时，慢请求的迟到结果会被丢掉。会 `fetch` 真实网络的写法只出现在正文示例里。

:::demo{id="react.zustand.learn.intermediate.async-action.async-action-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：只在 await 之后写一次 set

**触发条件：** Action 写成 `const data = await fetch(...); set({ profile: data })`，Store 里没有 `loading`。

**原因：** `setState` 是同步的。`await` 期间 Zustand 不会自动插入过程状态。

**后果：** 按钮可以连点，界面仍显示旧资料，使用者无法判断请求是否已发出。

**错误示例：**

```tsx
loadProfile: async () => {
  const response = await fetch('/api/profile')
  const data = await response.json()
  set({ profile: data })
},
```

**正确写法：**

```tsx
loadProfile: async () => {
  set({ loading: true, error: null })
  const response = await fetch('/api/profile')
  const data = await response.json()
  set({ profile: data, loading: false })
},
```

**验证方式：** 点击加载后，姓名还没到时 loading 面板已经变成「是」。

### 错误：await 之后使用进入函数时的旧字段

**触发条件：** 写成 `const { requestId } = get()` 只在函数开头调用一次，`await` 后仍用这次解构出来的值判断是否过期。

**原因：** 开头那次 `get()` 是当时的快照。另一次请求已经改过 `requestId` 时，闭包里的数字不会自己更新。

**后果：** 过期判断永远用旧号，迟到的结果仍会写入。

**错误示例：**

```tsx
loadProfile: async () => {
  const { requestId } = get()
  const nextId = requestId + 1
  set({ requestId: nextId, loading: true })
  const profile = await fakeFetch()
  if (requestId + 1 !== nextId) return
  set({ profile, loading: false })
},
```

**正确写法：**

```tsx
loadProfile: async () => {
  const requestId = get().requestId + 1
  set({ requestId, loading: true })
  const profile = await fakeFetch()
  if (get().requestId !== requestId) return
  set({ profile, loading: false })
},
```

**验证方式：** 先点慢请求再点失败；等待慢请求结束后，姓名仍是「空」，错误仍是「加载失败」。

### 错误：后返回的请求覆盖先返回的结果

**触发条件：** 连续触发两次 `loadProfile`，不做 `requestId` 或等价判断。

**原因：** 两次 Action 都会在各自 `await` 结束后 `set`。Zustand 按调用 `set` 的时间合并，不按点击顺序排队。

**后果：** 使用者已经看到失败，迟到的成功又把错误清掉，界面回到过期资料。

**错误示例：**

```tsx
loadProfile: async () => {
  set({ loading: true, error: null })
  const profile = await fakeFetch()
  set({ profile, loading: false, error: null })
},
```

**正确写法：**

```tsx
loadProfile: async () => {
  const requestId = get().requestId + 1
  set({ requestId, loading: true, error: null, profile: null })
  try {
    const profile = await fakeFetch()
    if (get().requestId !== requestId) return
    set({ profile, loading: false, error: null })
  } catch (error) {
    if (get().requestId !== requestId) return
    set({
      loading: false,
      error: error instanceof Error ? error.message : '加载失败',
    })
  }
},
```

**验证方式：** Demo 中先「发出慢请求」再「模拟失败」，失败展示后继续等待，姓名不会变成「迟到的结果」。

### 错误：失败后不把 loading 写回 false

**触发条件：** `try` 里成功才 `set({ loading: false })`，`catch` 只写 `error`。

**原因：** 成功和失败是两条写入路径。漏一条，过程字段就停在「进行中」。

**后果：** 错误文案出现了，加载面板仍显示「是」，按钮按过程状态会一直禁用。

**错误示例：**

```tsx
loadProfile: async () => {
  set({ loading: true, error: null })
  try {
    const profile = await fakeFetch()
    set({ profile, loading: false })
  } catch (error) {
    set({ error: error instanceof Error ? error.message : '加载失败' })
  }
},
```

**正确写法：**

```tsx
loadProfile: async () => {
  set({ loading: true, error: null })
  try {
    const profile = await fakeFetch()
    set({ profile, loading: false, error: null })
  } catch (error) {
    set({
      loading: false,
      error: error instanceof Error ? error.message : '加载失败',
    })
  }
},
```

**验证方式：** 点击「模拟失败」后，错误面板有文案，loading 面板回到「否」。

### 错误：把服务端列表缓存进 Zustand

**触发条件：** 用异步 Action 拉取完整远程列表，把 `items`、分页和失效逻辑都放进客户端 Store。

**原因：** Zustand 管理客户端状态。服务端缓存、重试、失效和分页属于 TanStack Query。

**后果：** 两套来源同时保存同一份远程数据，刷新、重试和过期时间无法共用。

**错误示例：**

```tsx
const useProjectStore = create<ProjectStore>()((set) => ({
  projects: [],
  fetchProjects: async () => {
    const response = await fetch('/api/projects')
    set({ projects: await response.json() })
  },
}))
```

**正确写法：**

```tsx
loadProfile: async () => {
  set({ loading: true, error: null })
  const response = await fetch('/api/profile')
  const data: Profile = await response.json()
  set({ profile: data, loading: false })
},
```

**验证方式：** 本课 Store 只保存这次命令的 `profile`、`loading` 和 `error`，没有远程列表缓存字段。
:::

## 六、原理与适用场景

### 1. 官方事实

README 的 “Async actions” 写明：准备好再调用 `set`，Zustand 不关心 Action 是否异步。示例是 `fetch` 为 `async`，`await` 响应后再 `set({ fishies })`。

Beginner TypeScript 的 “Async Actions” 写明：Action 可以是 async，用来拉取远程数据。示例 `fetchBears` 类型为 `() => Promise<void>`，把响应断言为 `BearData` 后执行 `set({ bears: data.count })`。

`src/vanilla.ts` 里 `setState` 同步计算下一份 state 并通知监听者，没有异步队列。`getState` 返回当前 `state` 变量。`create` 的初始化函数接收 `set`、`get` 和 `store`。

### 2. 课程推导

异步 Action 把一次命令拆成多次同步 `set`。过程字段是客户端事实，结果字段是这次命令得到的值。`await` 是 JavaScript 的让出，不是 Store 的调度。所以过期判断必须在恢复执行后重新 `get()`。

### 3. 适用边界

本课只讲 React 绑定 Store 里的异步 Action：`async` 函数、过程状态、`await` 后的 `get()`，以及用 `requestId` 丢掉过期写入。`AbortController`、TanStack Query 缓存、persist、devtools 中间件，都不在这里展开。

## 七、练习

:::exercise
### 为加载资料补上过程状态

**要求：** 已有一份 `ProfileStore`，包含 `profile`、`loading`、`error`、`requestId` 以及 `loadProfile`。当前 `loadProfile` 只在 `await` 之后写入 `profile`。改成：开始时增加 `requestId` 并写入 `loading: true`；成功或失败后都把 `loading` 写回 `false`；`await` 之后用 `get().requestId` 判断是否仍是这次请求。不要引入 persist，不要把远程列表缓存进 Store。

**验收：** 调用 `loadProfile('ok')` 后，姓名出现前 `loading` 为 true，结束后为 false；调用 `loadProfile('fail')` 后出现错误且 `loading` 为 false；先调用 `loadProfile('stale')` 再调用 `loadProfile('fail')`，失败展示后迟到的成功不得写入姓名。

**参考答案：**

```tsx
import { create } from 'zustand'

type Profile = {
  name: string
}

type ProfileStore = {
  profile: Profile | null
  loading: boolean
  error: string | null
  requestId: number
  loadProfile: (mode: 'ok' | 'fail' | 'stale') => Promise<void>
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function fakeFetch(mode: 'ok' | 'fail' | 'stale'): Promise<Profile> {
  await wait(mode === 'stale' ? 900 : 250)
  if (mode === 'fail') throw new Error('加载失败')
  return { name: mode === 'stale' ? '迟到的结果' : '林间' }
}

const useProfileStore = create<ProfileStore>()((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  requestId: 0,
  loadProfile: async (mode) => {
    const requestId = get().requestId + 1
    set({ requestId, loading: true, error: null, profile: null })
    try {
      const profile = await fakeFetch(mode)
      if (get().requestId !== requestId) return
      set({ profile, loading: false, error: null })
    } catch (error) {
      if (get().requestId !== requestId) return
      set({
        loading: false,
        error: error instanceof Error ? error.message : '加载失败',
      })
    }
  },
}))
```
:::

## 八、本节小结

- 异步 Action 就是 Store 里的 `async` 函数；准备好再 `set`。
- 过程状态要自己写：开始 `loading: true`，结束时无论成功失败都写回 `false`。
- `await` 之后用 `get()` 读当前快照，过期请求不要再写入。
- 不要把服务端列表缓存进客户端 Store。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 README Async actions](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 准备好再 set，不关心是否异步。
- [Zustand Beginner TypeScript Async Actions](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/beginner-typescript.md) - 用 async Action 拉取远程数据。
- [Zustand 5.0.15 vanilla store implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts) - setState 同步合并，getState 读当前快照。
- [Zustand 5.0.15 create API](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/apis/create.md) - 初始化函数接收 set、get 和 store。
