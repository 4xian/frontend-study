---
id: react.zustand.learn.basics.first-store
type: lesson
title: 第一个 Store
summary: 使用 create 创建一份稳定的 React 绑定 Store，并读取它声明的初始状态。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - react.zustand.learn.basics.client-state-and-zustand
related:
  - react.zustand.learn.basics.client-state-and-zustand
tags:
  - Zustand
  - create
  - Store
  - 初始状态
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-02
objectives:
  - 能从 zustand 导入 create，并用初始化函数创建一份 React 绑定 Store。
  - 能解释初始化函数返回值如何成为 Store 的初始状态。
  - 能在组件中读取 Store 声明的字段，并区分 Store 与组件本身的职责。
  - 能让 Store 保持稳定实例，避免在组件渲染过程中重复创建。
recap:
  - create 接收初始化函数，并返回一份可在 React 组件中使用的 Store Hook。
  - 初始化函数返回的对象就是 Store 的初始状态；字段应描述需要共享的客户端事实。
  - Store 在模块作用域创建后可以被不同组件消费，普通用法不需要 Provider。
  - 组件读取 Store 时只负责消费状态，不应在渲染过程中重新创建 Store。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
      - Zustand 5.0.15 声明支持 React 18 及以上版本。
  - title: Zustand Introduction
    url: https://zustand.docs.pmnd.rs/learn/getting-started/introduction
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 官方入门使用 create 接收初始化函数并创建 React Store Hook。
      - 初始化函数可以返回包含状态字段的对象，组件通过 Store Hook 读取这些字段。
      - 普通 React 用法可以直接使用 Store Hook，不需要 Provider。
  - title: Zustand 5.0.15 create API
    url: https://zustand.docs.pmnd.rs/reference/apis/create
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - create 返回带有 Store API 的 React Hook，并通过选择函数读取当前状态。
      - Store 的状态与 Action 可以由初始化函数一起声明。
  - title: Zustand 5.0.15 README
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - Zustand 的基础用法从导入 create 和创建第一份 Store 开始。
      - Store 可以保存基本值、对象和函数。
---

# 第一个 Store

## 一、学习目标

- 从 `zustand` 导入 `create`，创建一份可被 React 组件使用的 Store。
- 说明初始化函数返回值与 Store 初始状态之间的关系。
- 在组件中读取 Store 字段，观察 Store 与组件消费之间的连接。
- 让 Store 保持稳定实例，避免渲染时重复创建。

## 二、为什么需要第一个 Store

组件本地 State 适合保存单个组件自己的交互。当一份客户端状态需要被多个区域共同消费时，需要一个位于
组件树之外、但仍然属于当前前端应用的稳定入口。Store 就承担这个入口的职责：它保存一份状态起点，组件
通过 React 绑定的 Hook 读取这份状态。

如果只把数据写在某一个组件里，其他组件只能通过层层传递 Props 才能使用。先创建一份明确的 Store，可以
把“状态保存在哪里”和“组件如何消费状态”分开理解。

## 三、核心概念

### 1. `create` 返回 Store Hook

从 `zustand` 导入 `create`，把初始化函数传给它：

```tsx
import { create } from 'zustand'

const useWorkspaceStore = create(() => ({
  workspaceName: '内容工作区',
  viewMode: '编辑视图',
}))
```

`create` 的返回值命名为 `useWorkspaceStore`，因为它可以在 React 组件中作为 Hook 使用。初始化函数返回的
对象就是这份 Store 的初始状态。此时 Store 已经创建，但还没有要求组件把它包在 Provider 中。

### 2. 初始状态来自初始化函数

初始化函数的返回值描述 Store 刚创建时可以读取到的字段：

```tsx
const useWorkspaceStore = create(() => ({
  workspaceName: '内容工作区',
  viewMode: '编辑视图',
}))
```

这两个字段是状态数据，不是组件的 Props，也不是某个组件渲染时临时拼出的结果。字段应该对应需要共享的
客户端事实；组件私有的 hover、展开或输入状态不因为 Store 存在就自动搬进来。

### 3. 组件消费已经创建的 Store

组件从 Store Hook 读取自己需要的字段：

```tsx
function WorkspaceHeader() {
  const workspaceName = useWorkspaceStore((state) => state.workspaceName)
  const viewMode = useWorkspaceStore((state) => state.viewMode)

  return <h1>{workspaceName} · {viewMode}</h1>
}
```

这里的读取函数只是把组件连接到 Store 中的字段。本篇重点是 Store 已经存在并提供初始状态，不展开状态
更新接口或选择策略的性能取舍。

### 4. Store 应在组件外创建

把 `create` 放在模块作用域，模块加载时创建一次 Store：

```tsx
const useWorkspaceStore = create(() => ({
  workspaceName: '内容工作区',
}))

function WorkspacePage() {
  const workspaceName = useWorkspaceStore((state) => state.workspaceName)
  return <p>{workspaceName}</p>
}
```

组件每次渲染时只读取这份已创建的 Store。这样，使用同一模块的组件连接到同一个状态入口，Store 的身份不
会随着组件渲染改变。

## 四、用法与示例

### 1. 声明最小 Store

先确定要共享的客户端字段，再让初始化函数返回这些字段：

```tsx
import { create } from 'zustand'

const useWorkspaceStore = create(() => ({
  workspaceName: '内容工作区',
  viewMode: '编辑视图',
}))
```

此处没有额外的 Provider、Context 或手写同步层。Store 的初始状态就是初始化函数返回的对象。

### 2. 在多个组件中读取

顶部标题和内容区可以从同一份 Store 读取不同字段：

```tsx
function WorkspaceTitle() {
  const workspaceName = useWorkspaceStore((state) => state.workspaceName)
  return <h1>{workspaceName}</h1>
}

function WorkspaceMode() {
  const viewMode = useWorkspaceStore((state) => state.viewMode)
  return <p>当前视图：{viewMode}</p>
}
```

两个组件都直接使用同一个 `useWorkspaceStore`。状态的共享来自 Store 实例，而不是来自复制两份数据。

### 3. 观察一份已创建的 Store

下面的 Demo 使用 `create` 声明两个初始字段，并在组件中读取它们。它只展示创建入口和初始值，不把更新
行为混进当前主题。

:::demo{id="react.zustand.learn.basics.first-store.first-store-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：在组件渲染中创建 Store

**触发条件：** 把 `create` 写进组件函数，每次渲染都重新执行。

**原因：** 把 Store 的创建过程误当成组件的临时计算过程。

**后果：** 每次渲染都可能得到新的 Store 实例，状态身份无法稳定，其他组件也无法可靠共享同一份状态。

**错误示例：**

```tsx
function WorkspacePage() {
  const useWorkspaceStore = create(() => ({
    workspaceName: '内容工作区',
  }))

  return <p>{useWorkspaceStore((state) => state.workspaceName)}</p>
}
```

**正确写法：**

```tsx
const useWorkspaceStore = create(() => ({
  workspaceName: '内容工作区',
}))

function WorkspacePage() {
  const workspaceName = useWorkspaceStore((state) => state.workspaceName)
  return <p>{workspaceName}</p>
}
```

**验证方式：** 检查 `create` 是否位于组件函数外，并确认多个组件导入的是同一个 Store Hook。

### 错误：把初始化函数写成组件或 JSX

**触发条件：** 让 `create` 的回调返回 JSX，或把组件渲染结果当成 Store 状态。

**原因：** 混淆了“声明 Store 数据”和“渲染 React 元素”这两个职责。

**后果：** Store 字段无法表达清晰的状态结构，组件也不能按字段读取需要的客户端事实。

**错误示例：**

```tsx
const useWorkspaceStore = create(() => <p>内容工作区</p>)
```

**正确写法：**

```tsx
const useWorkspaceStore = create(() => ({
  workspaceName: '内容工作区',
}))
```

**验证方式：** 初始化函数返回普通状态值、对象或函数；组件 JSX 只出现在组件的返回值中。

### 错误：为普通 Store 使用额外 Provider

**触发条件：** 创建 Store 后再添加一个并不需要的 Provider，只为了让组件能够读取它。

**原因：** 把 Zustand 的 React 绑定 Store 与需要显式作用域的 Context 方案混为一谈。

**后果：** 组件树增加无关包装层，学习者误以为普通 `create` Store 必须依赖 Provider。

**错误示例：**

```tsx
<WorkspaceStoreProvider>
  <WorkspacePage />
</WorkspaceStoreProvider>
```

**正确写法：**

```tsx
function WorkspacePage() {
  const workspaceName = useWorkspaceStore((state) => state.workspaceName)
  return <p>{workspaceName}</p>
}
```

**验证方式：** 使用 `create` 返回的 Store Hook 直接读取状态；只有确实需要作用域隔离时，才另行设计 Context
或实例化方案。

### 错误：把所有页面数据都塞进第一份 Store

**触发条件：** 创建 Store 时顺手加入远程文章、URL 页码和所有组件的短暂交互状态。

**原因：** 认为“Store 已经存在”就意味着它应该拥有应用中的所有数据。

**后果：** 远程事实、导航状态和组件私有状态失去清晰边界，后续同步和维护成本上升。

**错误示例：**

```tsx
const useWorkspaceStore = create(() => ({
  articlesFromApi: [],
  pageFromUrl: 1,
  isHelpPopoverOpen: false,
}))
```

**正确写法：**

```tsx
const useWorkspaceStore = create(() => ({
  selectedWorkspace: 'content',
}))
```

**验证方式：** 逐字段确认最终所有者；远程数据、URL 状态和单组件交互保留在各自更合适的工具中。
:::

## 六、原理与适用场景

### 1. 官方事实

Zustand 官方入门使用 `create` 接收一个初始化函数，并返回可供 React 组件使用的 Store Hook。初始化函数
返回的对象包含 Store 的初始字段，组件可以通过读取函数消费这些字段。官方示例没有为普通 Store 增加
Provider。

### 2. 课程推导

由此可以把创建过程拆成两步：模块先建立稳定的 Store 实例，组件再通过 Hook 读取状态。Store 的初始字段
应当是共享客户端事实，而不是某个组件每次渲染时临时创建的对象。

### 3. 适用边界

模块级 Store 适合应用中需要跨区域共享的客户端状态。组件私有状态、URL 参数和服务端事实仍由更接近其
所有权的工具负责。需要按子树隔离或为同一组件创建多份独立实例时，应使用专门的作用域设计，而不是把
本篇的普通全局 Store 直接复制到组件函数内。

## 七、练习

:::exercise
### 创建工作区 Store

**要求：** 使用 `create` 创建 `useWorkspaceStore`，让它保存 `workspaceName: '内容工作区'` 和
`viewMode: '编辑视图'` 两个初始字段；再编写一个组件读取并显示这两个字段。Store 必须位于组件函数外。

**验收：** 组件首次渲染能显示两个初始值；`create` 只在模块作用域调用一次；组件不需要额外 Provider。

**参考答案：**

```tsx
import { create } from 'zustand'

const useWorkspaceStore = create(() => ({
  workspaceName: '内容工作区',
  viewMode: '编辑视图',
}))

function WorkspaceSummary() {
  const workspaceName = useWorkspaceStore((state) => state.workspaceName)
  const viewMode = useWorkspaceStore((state) => state.viewMode)

  return (
    <p>
      {workspaceName} · {viewMode}
    </p>
  )
}
```
:::

## 八、本节小结

- `create` 接收初始化函数，并返回一份可供 React 组件消费的 Store Hook。
- 初始化函数返回值就是 Store 的初始状态，应只放入属于这份 Store 的共享客户端事实。
- Store 在模块作用域创建一次，组件通过 Hook 读取，不在渲染过程中重复创建。
- 普通 `create` Store 不要求 Provider；是否需要作用域隔离要根据真实所有权另行判断。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版与 React peer 版本范围。
- [Zustand Introduction](https://zustand.docs.pmnd.rs/learn/getting-started/introduction) - `create`、初始化函数、Store Hook 和普通 React 用法。
- [Zustand 5.0.15 create API](https://zustand.docs.pmnd.rs/reference/apis/create) - `create` 返回值与 Store Hook 读取方式。
- [Zustand 5.0.15 README](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 固定版本的基础 Store 创建示例。
