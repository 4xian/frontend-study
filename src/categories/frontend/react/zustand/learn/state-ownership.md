---
id: react.zustand.learn.basics.state-ownership
type: lesson
title: 状态所有权
summary: 按共享范围和数据来源，把状态留给组件、提升到父组件、放入 Zustand，或交给 URL 与服务端缓存。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - react.zustand.learn.basics.typescript-store
related:
  - react.zustand.learn.basics.typescript-store
  - react.zustand.learn.basics.client-state-and-zustand
  - react.core.learn.basics.state-ownership-and-thinking-in-react
  - react.data.learn.basics.server-state-and-tanstack-query
tags:
  - Zustand
  - 状态所有权
  - 单一事实来源
  - 客户端状态
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能为每一份状态指定唯一所有者，而不是默认放进 Zustand。
  - 能按使用范围区分组件 State、共同父组件和 Zustand Store。
  - 能把可分享的查询条件交给 URL，把远程事实交给服务端状态工具。
  - 能识别把私有交互、URL 副本或远程列表重复写入 Store 的问题。
recap:
  - 单一事实来源是每一份状态有一个所有者，不是所有状态进同一个 Store。
  - 只有一个组件使用的值留在组件；相邻组件先考虑提升。
  - Zustand 负责相距较远、需要共同读写的客户端状态。
  - 可刷新、可分享的条件属于 URL；远程缓存属于服务端状态工具。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 普通 create 得到的 Store 不需要用 Context Provider 包裹应用。
      - 组件通过 Hook 选择状态，被选中的值变化时重新渲染。
  - title: React Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 每一份状态都应有明确的所有者，这称为单一事实来源。
      - 需要协同的状态应提升到最近共同父组件，而不是在多个组件里各存一份。
  - title: React Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 状态不应包含冗余或重复信息，避免再维护一份需要手动同步的副本。
  - title: React Router 8.3.0 useSearchParams
    url: https://github.com/remix-run/react-router/blob/react-router@8.3.0/docs/api/hooks/useSearchParams.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useSearchParams 读取当前 URL 的查询参数，写入时会触发导航。
  - title: TanStack Query Does This Replace Client State
    url: https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - TanStack Query 管理服务端状态，不替代 Zustand 等客户端状态库。
      - 两者可以同时使用；远程缓存不应再复制进客户端 Store 作为第二份主数据。
---

# 状态所有权

## 一、学习目标

- 为每一份状态指定唯一所有者。
- 按使用范围决定它留在组件、提升到父组件，还是进入 Zustand。
- 把可分享的查询条件交给 URL，把远程事实交给服务端状态工具。
- 避免把私有交互、URL 副本或远程列表重复写入 Store。

## 二、为什么需要再次划分所有权

前几课已经能创建类型化 Store、用 `set` 更新、用选择函数订阅。接下来最容易走偏的一步，是把“会写 Store”理解成“界面上的值都应该进 Store”。

帮助按钮是否展开、输入框里还没提交的草稿、地址栏里的搜索词、接口返回的任务列表，都会改变屏幕，但它们的生命周期和最终事实来源不同。React 文档把原则说成：每一份状态选一个所有者，这叫单一事实来源；它并不表示全部状态住在同一个地方。

Zustand 的 README 也提醒：普通 `create` 得到的 Store 不需要 Provider，组件按需选择字段。正因为接入成本低，更要先问“这份状态该不该共享”，再决定要不要创建字段。

## 三、核心概念

### 1. 所有者不是工具名，是唯一事实来源

先问三个问题：

1. 谁产生这个值？
2. 有多少相距较远的界面需要读写它？
3. 关闭组件、刷新页面或重新请求之后，哪一份数据仍然算数？

同一事实不要在组件 State、Zustand 和 URL 里各存一份再靠 Effect 对齐。重复保存会在更新顺序不同时出现互相矛盾的界面。

### 2. 按范围选择落点

| 使用范围 | 优先所有者 | 典型例子 |
| --- | --- | --- |
| 只有一个组件使用 | 组件 `useState` | 帮助面板展开、输入焦点、单次 hover |
| 少量相邻组件共同使用 | 最近共同父组件 | 同一卡片内的草稿和预览 |
| 多个相距较远区域共同读写 | Zustand | 顶栏、侧栏和列表共享的客户端筛选 |
| 需要刷新、分享或参与导航 | URL | 搜索词、分页、可分享的标签 |
| 最终事实来自远程系统 | 服务端状态工具 | 任务列表、用户资料、订单 |

Zustand 出现在第三行，不是第一行。相邻组件先按 React 的提升规则处理；只有组件树已经拉得很开，继续传 Props 会把所有权弄乱时，才把这份客户端状态放进 Store。

### 3. Zustand 不自动接管 URL 和服务端缓存

普通 React 绑定 Store 适合同步的客户端工作流。官方 README 写明：不需要用 Context 包裹应用，选择到的切片变化时组件才重渲染。这解决的是“远处组件如何读写同一份客户端状态”，不是“如何缓存接口”或“如何让链接可分享”。

React Router 的 `useSearchParams` 从当前 URL 读查询参数，写入时触发导航。需要复制链接、刷新后恢复的条件，应把 URL 当作所有者。

TanStack Query 明确区分：自己是服务端状态库；Zustand 这类库是客户端状态库。Query 不替代客户端状态管理，客户端 Store 也不该再保存一份远程列表当主数据。

### 4. 能算出来的值不要再存一份

完成数量、过滤后的列表、是否全部完成，只要能从现有 Store 字段、URL 或只读清单计算出来，就在读取时计算。再存一份可变副本，等于多了一条必须同步的路径。

## 四、用法与示例

### 1. 先画所有权，再写 Store 字段

假设工作区同时有帮助说明、状态筛选、可分享关键词和一份远程任务清单：

| 状态 | 主要使用者 | 所有者 |
| --- | --- | --- |
| 帮助是否展开 | 帮助按钮自己 | 组件 State |
| 当前状态筛选 | 顶栏统计和任务列表 | Zustand |
| 可分享关键词 | 地址栏、刷新后的列表 | URL |
| 任务清单 | 远程 API 的多个读者 | 服务端状态工具 |
| 可见任务条数 | 由清单和筛选算出来 | 派生值，不单独保存 |

只有“当前状态筛选”进入 Zustand。其余值要么留在组件，要么留给 URL 或服务端缓存。

### 2. 组件私有状态不要进 Store

```tsx
function HelpPanel() {
  const [open, setOpen] = useState(false)

  return (
    <section>
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        帮助
      </button>
      {open ? <p>状态筛选放在 Store，帮助说明只留在这个按钮里。</p> : null}
    </section>
  )
}
```

没有其他区域读取 `open`。把它写成 Store 字段，只是让全应用看到一个按钮的开合。

### 3. 共享客户端状态使用类型化 Store

```ts
type FilterStatus = 'all' | 'open'

type WorkspaceState = {
  status: FilterStatus
}

type WorkspaceActions = {
  setStatus: (status: FilterStatus) => void
  reset: () => void
}

type WorkspaceStore = WorkspaceState & WorkspaceActions

const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  status: 'all',
  setStatus: (status) => set({ status }),
  reset: () => set({ status: 'all' }),
}))
```

顶栏和列表各自选择 `status`，不再通过 Props 层层传递，也不再在两边各存一份。

### 4. URL 与服务端事实保持在 Store 之外

```tsx
const [searchParams, setSearchParams] = useSearchParams()
const keyword = searchParams.get('q') ?? ''
const tasksQuery = useTasksQuery()
const status = useWorkspaceStore((state) => state.status)

const visibleTasks = (tasksQuery.data ?? []).filter((task) => {
  const matchKeyword = task.title.includes(keyword)
  const matchStatus = status === 'all' || task.status === status
  return matchKeyword && matchStatus
})
```

关键词来自 URL，清单来自服务端缓存，筛选条件来自 Zustand。可见列表是派生结果。不要再用 Effect 把 `tasksQuery.data` 整份写进 Store。

下面的 Demo 用本地常量代替远程清单，用输入框模拟地址栏查询，只把状态筛选放进 Store。观察三件事：打开帮助不影响筛选；改筛选时顶栏和列表一起变；改关键词时 Store 的 `status` 保持不动。

:::demo{id="react.zustand.learn.basics.state-ownership.state-ownership-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：安装 Zustand 后把所有界面状态放进 Store

**触发条件：** 为帮助开关、hover、输入焦点和一次性提示都增加 Store 字段。

**原因：** 把“可以共享”当成“必须共享”。接入 Store 不需要 Provider，并不等于每个值都值得成为全局字段。

**后果：** 私有交互泄漏到全应用，组件复用时还要先清理别人的 Store 字段。

**错误示例：**

```tsx
const isHelpOpen = useWorkspaceStore((state) => state.isHelpOpen)
```

**正确写法：**

```tsx
const [isHelpOpen, setHelpOpen] = useState(false)
```

**验证方式：** 搜索该字段是否被组件外部读取或更新；没有外部读者就留在组件里。

### 错误：用 Effect 在组件 State 和 Store 之间同步同一事实

**触发条件：** 组件先 `useState` 保存筛选，再在 Effect 里调用 `setStatus`。

**原因：** 没有为同一份筛选选择唯一所有者。

**后果：** 两边更新顺序不同时出现短暂不一致，并多出一条容易漏依赖的同步逻辑。

**错误示例：**

```tsx
const [status, setStatus] = useState('all')
const setStoreStatus = useWorkspaceStore((state) => state.setStatus)

useEffect(() => {
  setStoreStatus(status)
}, [setStoreStatus, status])
```

**正确写法：**

```tsx
const status = useWorkspaceStore((state) => state.status)
const setStatus = useWorkspaceStore((state) => state.setStatus)
```

**验证方式：** 全局搜索状态名，确认只有一个地方保存值，其他位置只读取或调用 Action。

### 错误：把远程列表复制进 Zustand 当第二份主数据

**触发条件：** 请求成功后再 `set({ tasks: data })`，界面改读 Store 里的副本。

**原因：** 把“多个组件要读”当成客户端 Store 的充分条件，忽略远程所有权。

**后果：** 重新获取、失效或更新后，Store 副本和服务端缓存不一致。

**错误示例：**

```tsx
useEffect(() => {
  if (tasksQuery.data) saveTasks(tasksQuery.data)
}, [tasksQuery.data, saveTasks])
```

**正确写法：**

```tsx
const tasksQuery = useTasksQuery()
const status = useWorkspaceStore((state) => state.status)
```

**验证方式：** 远程清单只保留一个缓存所有者；Zustand 只保存筛选等客户端字段。

### 错误：把可分享的搜索词只放在 Store 里

**触发条件：** 关键词需要复制链接或刷新恢复，却只写入 Zustand，不写入 URL。

**原因：** 把“多个组件要读”和“用户要分享当前视图”当成同一类问题。

**后果：** 刷新后筛选丢失，发给同事的链接打不开同一视图。

**错误示例：**

```tsx
setKeyword(event.target.value)
```

**正确写法：**

```tsx
setSearchParams({ q: event.target.value })
```

**验证方式：** 复制当前地址并刷新，确认关键词仍然来自查询参数，而不是依赖 Store 是否还活着。

### 错误：相邻组件一要共享就创建应用级 Store

**触发条件：** 同一卡片里的输入框和预览需要同一段草稿，立刻新建模块级 Store。

**原因：** 忽略最近共同父组件已经能提供单一事实来源。

**后果：** 局部草稿获得全应用可见性，组件拆走时还要带走 Store 字段。

**错误示例：**

```tsx
const draft = useWorkspaceStore((state) => state.draft)
```

**正确写法：**

```tsx
function EditorCard() {
  const [draft, setDraft] = useState('')
  return <EditorWithPreview draft={draft} onDraftChange={setDraft} />
}
```

**验证方式：** 画出组件树；若共同父组件很近，先提升，而不是先加 Store。
:::

## 六、原理与适用场景

### 1. 官方事实

React 的《Sharing State Between Components》要求每一份状态选择一个所有者，并说明单一事实来源不是把全部状态集中到一处。需要协同时，把状态提升到最近共同父组件。

《Choosing the State Structure》要求避免冗余和重复状态，以免再维护需要手动同步的副本。

Zustand 5.0.15 README 写明：使用 Hook 即可，不需要 Provider；选中的状态变化时对应组件重渲染。Context 只在依赖注入或按 props 初始化 Store 时才出现，不属于普通所有权方案。

React Router 的 `useSearchParams` 以 URL 查询参数为来源，写入会导航。TanStack Query 的官方指南把 Query 定义为服务端状态库，并把 Zustand 列为客户端状态库；Query 不是本地状态的替代品，两者可以并存。

### 2. 课程推导

Zustand 降低了共享客户端状态的接入成本，所以所有权判断要提前，而不是延后。最小规则是：私有交互留在组件，相邻协同先提升，远处协同才进 Store，可分享条件进 URL，远程事实进服务端缓存，能计算的值不要再存。

### 3. 适用边界

本课只划分组件 State、父组件、Zustand、URL 和服务端状态的责任。不展开 `persist`、异步 Action、DevTools、Vanilla Store、Context 多实例或 SSR。URL 示例使用 React Router 的查询参数 API，不把路由模式或数据加载器当作本课内容。

## 七、练习

:::exercise
### 为工作区选择所有者

**要求：** 工作区包含帮助开关、状态筛选、可分享关键词 `q` 和一份远程任务数组。写出：帮助开关的组件 State；只包含 `status` / `setStatus` 的 `WorkspaceStore`；从 `useSearchParams` 读取 `q` 的用法；列表在渲染时按 `status` 和 `q` 过滤，不要把任务数组写入 Store。

**验收：** Store 类型里没有 `open`、`q` 或 `tasks` 字段；过滤发生在读取之后；帮助开关不订阅 Store。

**参考答案：**

```tsx
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { create } from 'zustand'

type FilterStatus = 'all' | 'open'

type WorkspaceState = {
  status: FilterStatus
}

type WorkspaceActions = {
  setStatus: (status: FilterStatus) => void
}

type WorkspaceStore = WorkspaceState & WorkspaceActions

const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  status: 'all',
  setStatus: (status) => set({ status }),
}))

type Task = {
  id: string
  title: string
  status: 'open' | 'done'
}

/** 帮助说明只留在当前组件。 */
function HelpToggle() {
  const [open, setOpen] = useState(false)

  return (
    <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      {open ? '收起帮助' : '打开帮助'}
    </button>
  )
}

/** 按 URL 关键词和 Store 筛选条件派生可见任务。 */
function TaskList({ tasks }: { tasks: Task[] }) {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('q') ?? ''
  const status = useWorkspaceStore((state) => state.status)
  const visibleTasks = tasks.filter((task) => {
    const matchKeyword = task.title.includes(keyword)
    const matchStatus = status === 'all' || task.status === status
    return matchKeyword && matchStatus
  })

  return (
    <ul>
      {visibleTasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}
```
:::

## 八、本节小结

- 每一份状态只选一个所有者；单一事实来源不是全局 Store。
- 私有交互留在组件，相邻协同先提升，远处协同才进入 Zustand。
- 可分享、可刷新的条件属于 URL；远程清单属于服务端状态工具。
- 能从现有数据算出来的结果不要再写入 Store。

## 九、参考资料

- [Zustand 5.0.15 README](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 普通 Store 不需要 Provider，按选择结果订阅。
- [React Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) - 每一份状态选择一个所有者，需要协同时提升到共同父组件。
- [React Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - 避免冗余和重复状态。
- [React Router 8.3.0 useSearchParams](https://github.com/remix-run/react-router/blob/react-router@8.3.0/docs/api/hooks/useSearchParams.md) - 查询参数以 URL 为来源。
- [TanStack Query Does This Replace Client State](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state) - Query 管理服务端状态，不替代 Zustand。
- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版本。
