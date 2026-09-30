---
id: react.zustand.learn.intermediate.content-workspace
type: lesson
title: 实战：内容管理工作区
summary: 用切片合并一份内容 Store，异步加载目录，不可变更新条目，并在渲染外用 subscribe 记活动日志。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 55
prerequisites:
  - react.zustand.learn.intermediate.preferences-center
related:
  - react.zustand.learn.intermediate.slices-pattern
  - react.zustand.learn.intermediate.async-action
  - react.zustand.learn.intermediate.subscribe
  - react.zustand.learn.intermediate.derived-state
  - react.zustand.learn.basics.object-and-array-updates
tags:
  - Zustand
  - 内容管理
  - Slices Pattern
  - 异步 Action
  - subscribe
  - 实战
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能把目录、加载、筛选和共享计数拆成 slice，再展开进一份 React 绑定 Store。
  - 能在加载切片里写异步 Action，用 requestId 丢掉过期结果。
  - 能用新数组完成追加、发布和归档，不就地修改原列表。
  - 能按字段做原子选择，在渲染时派生可见条目，并用默认 subscribe 记录活动。
recap:
  - 内容管理工作区仍是一份 Store；slice 只拆初始化函数。
  - 异步 Action 准备好再 set；await 之后用 get 核对当前请求号。
  - 列表按不可变方式更新；可见结果在渲染时过滤，不写回 Store。
  - 组件按字段订阅；活动日志走默认 subscribe，不替代 Hook。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 Slices Pattern
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/slices-pattern.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 可以把主 Store 拆成更小的独立片段，再合并成一份 bounded store。
      - "合并写法是 create((...a) => ({ ...createBearSlice(...a), ...createFishSlice(...a) }))。"
      - 跨片段命令通过 get 调用另一段已经合并进来的 Action。
      - persist 只加在合并后的 Store 上，不要加进单个 slice。
  - title: Zustand 5.0.15 Advanced TypeScript Slices pattern
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/advanced-typescript.md
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - "slice 用 StateCreator<整份 Store, Mutators, [], 本段 Slice> 标注。"
  - title: Zustand 5.0.15 README Async actions
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - Zustand 不关心 Action 是否异步，准备好后再调用 set。
      - "官方示例把 fetch 写成 async，await 响应后再 set({ fishies })。"
  - title: Zustand 5.0.15 README subscribe and transient updates
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - create 返回的 Hook 上挂有 getState、setState 和 subscribe。
      - subscribe 可以在不强制组件重渲染的情况下绑定状态变化，适合和 useEffect 一起在卸载时取消。
  - title: Zustand Updating state
    url: https://zustand.docs.pmnd.rs/learn/guides/updating-state
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 顶层更新会被浅合并进现有 State。
      - 深层嵌套对象需要按层复制，用展开运算手动合并新值。
  - title: Zustand 5.0.15 create API
    url: https://zustand.docs.pmnd.rs/reference/apis/create
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 对象和数组在 JavaScript 中可变，存进 State 后应按不可变方式更新。
      - 更新数组应赋新值，优先使用展开、concat、filter、slice、map 等不可变操作。
  - title: Zustand Beginner TypeScript Derived State with Selectors
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/beginner-typescript.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 不是所有值都要直接存进 Store，部分值可以从已有状态计算。
      - 用选择函数派生可以避免重复，并保持 Store 最小。
  - title: React Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 避免保存可以从现有数据计算出来的重复状态。
---

# 实战：内容管理工作区

## 一、学习目标

- 把目录、加载、筛选和共享计数拆成 slice，再展开进一份 Store。
- 在加载切片里写异步 Action，用请求号丢掉过期结果。
- 用新数组完成追加、发布和归档。
- 按字段做原子选择，在渲染时派生可见条目，并用默认 `subscribe` 记活动日志。

## 二、为什么要做内容管理工作区

前面已经分开学过切片、异步 Action、不可变数组、派生状态和 `subscribe`。内容管理工作区把它们收进同一份工作区：目录要加载，条目要追加、发布和归档，筛选只影响当前展示，活动日志不必跟着每个面板一起重渲染。

如果把这些字段塞进一个超长初始化函数，改加载的人必须翻完整份对象。如果给目录和筛选各自 `create`，加载结束时 `get()` 看不到另一份里的 `items`。如果在选择函数里 `filter` 出可见列表，无关计数也会让列表面板重渲染。这个实战同时看清“怎么拆”“何时写入”“订什么”和“算什么”。

## 三、核心概念

### 1. 一份 Store，四段 slice

官方 Slices Pattern 把主 Store 拆成更小的独立片段，再合并成一份 bounded store。目录、加载、筛选和共享计数各写一个函数，返回自己那一段：

```tsx
import { create, type StateCreator } from 'zustand'

type DocumentItem = {
  id: string
  title: string
  status: 'draft' | 'published'
}

type CatalogSlice = {
  items: DocumentItem[]
  addDraft: () => void
  publishItem: (id: string) => void
  archiveItem: (id: string) => void
}

type LoadSlice = {
  loading: boolean
  error: string | null
  requestId: number
  loadCatalog: (mode: 'ok' | 'fail' | 'stale') => Promise<void>
}

type FilterSlice = {
  filter: 'all' | 'draft' | 'published'
  setFilter: (filter: FilterSlice['filter']) => void
}

type SharedSlice = {
  ticks: number
  tick: () => void
}

type BoundStore = CatalogSlice & LoadSlice & FilterSlice & SharedSlice
```

每个函数用 `StateCreator<BoundStore, [], [], 本段>` 标注。`set` / `get` 看到的是整份交叉类型，所以加载切片可以直接写入 `items`。返回值仍被收成自己那一段，加载函数不能顺手再塞 `filter`。

### 2. 展开后仍是一份 Store

官方合并写法把每个 slice 的返回值展开进同一个对象：

```tsx
const useWorkspaceStore = create<BoundStore>()((...a) => ({
  ...createCatalogSlice(...a),
  ...createLoadSlice(...a),
  ...createFilterSlice(...a),
  ...createSharedSlice(...a),
}))
```

`...a` 就是初始化函数收到的 `set`、`get` 和 `store`。各 slice 共享同一组参数，因此共享同一份 state。没有 `useCatalogStore` 和 `useFilterStore` 两套 Hook。

本课不再包 `persist`。中间件如果要用，官方要求只加在合并后的 Store 上，不要加进单个 slice。

### 3. 加载准备好再写，列表换成新数组

README 写明：Zustand 不关心 Action 是否异步，准备好后再调用 `set`。加载开始时写入 `loading`，结束后再写入目录或错误。`await` 之后必须再 `get()` 一次，核对当前 `requestId`，否则后返回的请求会覆盖先返回的结果。

目录是数组。官方 create API 要求存进 State 的数组按不可变方式更新，优先使用展开、`map` 和 `filter`。`set` 只在顶层浅合并；`items` 必须换成新数组，嵌套条目也要复制后再改 `status`。

```tsx
addDraft: () =>
  set((state) => ({
    items: [...state.items, { id: 'extra', title: '新增草稿', status: 'draft' }],
  })),
publishItem: (id) =>
  set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, status: 'published' } : item,
    ),
  })),
archiveItem: (id) =>
  set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),
```

不要 `push`、不要直接改 `item.status`。没有新引用，订阅就不会触发。

### 4. 可见列表在渲染时算，活动日志走 subscribe

筛选条件和目录都已经在 Store 里。可见条目可以从这两份源数据算出来，不必再存 `visibleItems`。Beginner TypeScript 写明：不是所有值都要直接存进 Store；用选择函数派生可以保持 Store 最小。React 的状态结构指南也要求不要保存能算出来的重复状态。

会 `filter` 出新数组的派生不要写进选择函数。选择函数比较的是返回值：`filter` 每次都是新数组，无关计数也会重渲染。正确顺序是先取出已有的 `items` 和 `filter`，再在已经决定要渲染的组件里过滤。

默认 `subscribe` 挂在 `create` 返回的 Hook 上，listener 接收当前 state 和上一份 state。它适合在渲染之外追加活动日志，并在 `useEffect` 清理时取消。界面上的加载标记、筛选和条数仍然用 Store Hook 按字段选择。

## 四、用法与示例

### 1. 四段 slice 的职责

```tsx
const createCatalogSlice: StateCreator<BoundStore, [], [], CatalogSlice> = (set) => ({
  items: [],
  addDraft: () =>
    set((state) => ({
      items: [
        ...state.items,
        { id: `draft-${state.items.length + 1}`, title: '新增草稿', status: 'draft' },
      ],
    })),
  publishItem: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status: 'published' } : item,
      ),
    })),
  archiveItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
})

const createLoadSlice: StateCreator<BoundStore, [], [], LoadSlice> = (set, get) => ({
  loading: false,
  error: null,
  requestId: 0,
  loadCatalog: async (mode) => {
    const requestId = get().requestId + 1
    set({ requestId, loading: true, error: null })
    try {
      const items = await fakeFetch(mode)
      if (get().requestId !== requestId) return
      set({ items, loading: false, error: null })
    } catch (error) {
      if (get().requestId !== requestId) return
      set({
        loading: false,
        error: error instanceof Error ? error.message : '加载失败',
      })
    }
  },
})

const createFilterSlice: StateCreator<BoundStore, [], [], FilterSlice> = (set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
})

const createSharedSlice: StateCreator<BoundStore, [], [], SharedSlice> = (set, get) => ({
  ticks: 0,
  tick: () => set({ ticks: get().ticks + 1 }),
})
```

加载切片写入 `items`，是官方 `eatFish` 那种跨片段字段更新：合并后它们在同一份 state 里。一次 `set({ items, loading: false, error: null })` 同时结束加载并换上新目录，避免先写完列表再单独关 loading 造成两次通知。

### 2. 组件按字段订，过滤留在渲染里

```tsx
function CatalogCount() {
  const count = useWorkspaceStore((state) => state.items.length)
  return <p>目录 {count} 篇</p>
}

function VisibleList() {
  const items = useWorkspaceStore((state) => state.items)
  const filter = useWorkspaceStore((state) => state.filter)
  const visible =
    filter === 'all' ? items : items.filter((item) => item.status === filter)
  return <ul>{visible.map((item) => <li key={item.id}>{item.title}</li>)}</ul>
}

function LoadingBadge() {
  const loading = useWorkspaceStore((state) => state.loading)
  return <p>{loading ? '加载中' : '空闲'}</p>
}
```

`CatalogCount` 只选稳定数字。切换筛选时它不重渲染。`VisibleList` 需要源数组和筛选条件，过滤发生在组件内部。加载开始时只有 `LoadingBadge` 因 `loading` 变化而更新；目录引用还没换时，条数面板保持不动。

按钮只选择对应 Action。父组件只选择无关计数的 `tick`，计数本身交给独立展示。

### 3. 活动日志用默认 subscribe

```tsx
function ActivityLog() {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    return useWorkspaceStore.subscribe((state, prevState) => {
      setLines((current) => [
        ...current,
        `${prevState.items.length}→${state.items.length} / ${prevState.filter}→${state.filter} / ${prevState.loading}→${state.loading}`,
      ])
    })
  }, [])

  return <pre>{lines.join('\n') || '空'}</pre>
}
```

增加无关计数时，加载、筛选和条数面板不重渲染，日志仍会多一条，因为整份 state 已经是新引用。这是回调在渲染之外做事，不是用 `subscribe` 去画加载文案。停止订阅后必须调用返回值；官方建议把它和 `useEffect` 的清理函数放在一起。

### 4. 观察内容管理工作区

下面的 Demo 把目录、加载、筛选和共享计数分成四个 slice。点击「加载目录」会先看到加载中，再看到课堂笔记和发布说明。点击「模拟失败」会看到错误。先点「发出慢请求」再点「模拟失败」时，迟到的目录不会覆盖错误。切换「只看草稿」时，条数面板不重渲染，可见列表只留下草稿。追加、发布和归档都换成新数组。右侧日志不经过 Store Hook，只靠默认 `subscribe` 追加记录。增加无关计数时，加载、筛选和条数面板保持原渲染次数，日志仍会多一条。

:::demo{id="react.zustand.learn.intermediate.content-workspace.content-workspace-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：给目录和筛选各自 create 一份 Store

**触发条件：** 写成 `create(createCatalogSlice)` 和 `create(createFilterSlice)`，再分别订阅两套 Hook。

**原因：** Slices Pattern 的官方合并发生在一次 `create` 内部。两次 `create` 是两份 state。加载切片的 `set({ items })` 看不到另一份里的筛选，筛选切片的 `get()` 也读不到目录。

**后果：** 加载成功后筛选面板仍对着空列表；归档和筛选无法在同一次更新里被同一份 listener 看见。

**错误示例：**

```tsx
const useCatalogStore = create<CatalogSlice>()(createCatalogSlice)
const useFilterStore = create<FilterSlice>()(createFilterSlice)
```

**正确写法：**

```tsx
const useWorkspaceStore = create<BoundStore>()((...a) => ({
  ...createCatalogSlice(...a),
  ...createLoadSlice(...a),
  ...createFilterSlice(...a),
  ...createSharedSlice(...a),
}))
```

**验证方式：** 调用加载后，同一份 Hook 上既能读到 `items` 也能读到 `filter`；切换筛选时可见列表立刻变化。

### 错误：在选择函数里 filter 出可见列表

**触发条件：** 写成 `useWorkspaceStore((state) => state.items.filter((item) => item.status === state.filter))`。

**原因：** `filter` 每次返回新数组。选择函数比较的是返回值，不是“内容看起来一样”。无关计数也会让这份新数组通过比较。

**后果：** 增加无关计数时可见列表面板跟着重渲染。

**错误示例：**

```tsx
function VisibleList() {
  const visible = useWorkspaceStore((state) =>
    state.items.filter((item) => item.status === state.filter),
  )
  return <p>{visible.length}</p>
}
```

**正确写法：**

```tsx
function VisibleList() {
  const items = useWorkspaceStore((state) => state.items)
  const filter = useWorkspaceStore((state) => state.filter)
  const visible =
    filter === 'all' ? items : items.filter((item) => item.status === filter)
  return <p>{visible.length}</p>
}
```

**验证方式：** 选择函数只返回已有字段或稳定数字；`filter` 留在组件里。只增加无关计数时，可见列表面板的渲染次数不变。

### 错误：后返回的加载覆盖当前目录

**触发条件：** 连续触发两次 `loadCatalog`，`await` 结束后无条件 `set({ items })`。

**原因：** Zustand 按调用 `set` 的时间合并，不按点击顺序排队。慢请求后返回时，当前界面可能已经是失败或另一份目录。

**后果：** 使用者已经看到「加载失败」，迟到的成功又把错误清掉，列表变成过期目录。

**错误示例：**

```tsx
loadCatalog: async (mode) => {
  set({ loading: true, error: null })
  const items = await fakeFetch(mode)
  set({ items, loading: false, error: null })
},
```

**正确写法：**

```tsx
loadCatalog: async (mode) => {
  const requestId = get().requestId + 1
  set({ requestId, loading: true, error: null })
  try {
    const items = await fakeFetch(mode)
    if (get().requestId !== requestId) return
    set({ items, loading: false, error: null })
  } catch (error) {
    if (get().requestId !== requestId) return
    set({
      loading: false,
      error: error instanceof Error ? error.message : '加载失败',
    })
  }
},
```

**验证方式：** Demo 中先「发出慢请求」再「模拟失败」，失败展示后继续等待，可见列表不会出现「迟到的目录」。

### 错误：就地 push 或改条目状态

**触发条件：** 写成 `get().items.push(item)` 或 `get().items[0].status = 'published'`，然后再 `set({ items: get().items })`。

**原因：** `set` 默认用浅合并。如果传入的仍是同一个数组引用，Store 认为状态没变，不会通知订阅者。就算勉强通知，直接改原对象也会让上一份 state 和当前 state 指向同一块内存。

**后果：** 追加草稿后面板不更新；发布后筛选「只看草稿」仍能看见已发布的条目。

**错误示例：**

```tsx
addDraft: () => {
  get().items.push({ id: 'extra', title: '新增草稿', status: 'draft' })
  set({ items: get().items })
},
```

**正确写法：**

```tsx
addDraft: () =>
  set((state) => ({
    items: [...state.items, { id: 'extra', title: '新增草稿', status: 'draft' }],
  })),
```

**验证方式：** 追加草稿后条数加一，可见列表出现新标题；发布课堂笔记后，「只看草稿」不再包含它。

### 错误：把可见列表再存进 Store

**触发条件：** Store 增加 `visibleItems` 或 `visibleCount`，每次改 `items` 或 `filter` 再同步写一份。

**原因：** 可见结果可以从 `items` 和 `filter` 算出来。再存一份就要保证两次 `set` 永远同步，漏一次就分叉。

**后果：** 归档了条目，计数还停在旧值；排查时会以为是选择函数错了。

**错误示例：**

```tsx
setFilter: (filter) =>
  set((state) => ({
    filter,
    visibleCount: state.items.filter((item) => item.status === filter).length,
  })),
```

**正确写法：**

```tsx
const items = useWorkspaceStore((state) => state.items)
const filter = useWorkspaceStore((state) => state.filter)
const visibleCount =
  filter === 'all' ? items.length : items.filter((item) => item.status === filter).length
```

**验证方式：** Store 类型没有 `visibleItems` 或 `visibleCount`；切换筛选或归档后，可见条数只出现在组件里，并随源数据变化。
:::

## 六、原理与适用场景

### 1. 官方事实

Slices Pattern 文档写明：主 Store 可以拆成独立片段再合并；跨片段命令通过 `get` 调用另一段 Action；persist 如果要用，只加在合并后的 Store 上。高级 TypeScript 指南用 `StateCreator<整份交叉类型, Mutators, [], 本段>` 标注 slice。

README 的 Async actions 写明：Zustand 不关心 Action 是否异步，准备好后再 `set`。Transient updates 写明：`subscribe` 可以在不强制重渲染的情况下绑定变化，并和 `useEffect` 一起在卸载时取消。

Updating state 写明：顶层更新浅合并；嵌套对象按层复制。create API 写明：数组应按不可变方式更新，优先展开、`concat`、`filter`、`slice`、`map`。Beginner TypeScript 写明：能算出来的值用选择函数派生。React 状态结构指南要求不要保存能算出来的重复状态。

### 2. 课程推导

内容管理工作区的最小模型是：一份 Store、四段 slice、异步加载用请求号、列表换成新数组、可见结果在渲染时过滤、活动日志走默认 `subscribe`。切片边界不影响订阅范围，选择精度仍然由选择函数决定。加载切片写入目录字段，是同一份 state 上的跨片段更新，不是第二份 Store。

### 3. 适用边界

本课只整合已经学过的 React 绑定 Store、Slices Pattern、异步 Action、不可变数组、派生状态和默认 `subscribe`。不引入 `persist`、`devtools` 组合、`subscribeWithSelector`、Immer、版本迁移、SSR 水合、Vanilla Store 或 Store Factory，也不把远程分页、重试和失效做成服务端缓存。

## 七、练习

:::exercise
### 补全内容管理 Store

**要求：** 创建一份 `BoundStore`，由 `CatalogSlice`、`LoadSlice` 和 `FilterSlice` 交叉而成。`CatalogSlice` 含 `items`、`addDraft` 和 `archiveItem`；`addDraft` 用展开追加一篇草稿，`archiveItem` 用 `filter` 去掉指定 `id`。`LoadSlice` 含 `loading`、`error`、`requestId` 和 `loadCatalog`；`loadCatalog` 是 `async`，开始时写入新的 `requestId` 和 `loading: true`，`await` 之后用 `get().requestId` 判断是否过期，成功则 `set({ items, loading: false, error: null })`，失败则写回 `loading: false` 和错误文案。`FilterSlice` 含 `filter` 与 `setFilter`。每个 slice 用 `StateCreator<BoundStore, [], [], 本段>` 标注。用一次 `create<BoundStore>()` 展开合并。组件里先选择 `items` 和 `filter`，再过滤可见列表，不要把 `visibleItems` 写入 Store，不要给单个 slice 包中间件，也不要创建第二份 Store。

**验收：** 只调用 `setFilter` 时 `items` 引用不变；`addDraft` 后列表多一篇草稿；`archiveItem` 后对应 `id` 消失；先发出慢请求再失败时，迟到的目录不会写入；可见列表只在组件里从 `items` 和 `filter` 算出来。

**参考答案：**

```tsx
import { create, type StateCreator } from 'zustand'

type DocumentItem = {
  id: string
  title: string
  status: 'draft' | 'published'
}

type CatalogSlice = {
  items: DocumentItem[]
  addDraft: () => void
  archiveItem: (id: string) => void
}

type LoadSlice = {
  loading: boolean
  error: string | null
  requestId: number
  loadCatalog: (mode: 'ok' | 'fail' | 'stale') => Promise<void>
}

type FilterSlice = {
  filter: 'all' | 'draft' | 'published'
  setFilter: (filter: FilterSlice['filter']) => void
}

type BoundStore = CatalogSlice & LoadSlice & FilterSlice

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function fakeFetch(mode: 'ok' | 'fail' | 'stale'): Promise<DocumentItem[]> {
  await wait(mode === 'stale' ? 900 : 250)
  if (mode === 'fail') throw new Error('加载失败')
  if (mode === 'stale') {
    return [{ id: 'late', title: '迟到的目录', status: 'published' }]
  }
  return [
    { id: 'note', title: '课堂笔记', status: 'draft' },
    { id: 'guide', title: '发布说明', status: 'published' },
  ]
}

const createCatalogSlice: StateCreator<BoundStore, [], [], CatalogSlice> = (set) => ({
  items: [],
  addDraft: () =>
    set((state) => ({
      items: [
        ...state.items,
        {
          id: `draft-${state.items.length + 1}`,
          title: '新增草稿',
          status: 'draft',
        },
      ],
    })),
  archiveItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
})

const createLoadSlice: StateCreator<BoundStore, [], [], LoadSlice> = (set, get) => ({
  loading: false,
  error: null,
  requestId: 0,
  loadCatalog: async (mode) => {
    const requestId = get().requestId + 1
    set({ requestId, loading: true, error: null })
    try {
      const items = await fakeFetch(mode)
      if (get().requestId !== requestId) return
      set({ items, loading: false, error: null })
    } catch (error) {
      if (get().requestId !== requestId) return
      set({
        loading: false,
        error: error instanceof Error ? error.message : '加载失败',
      })
    }
  },
})

const createFilterSlice: StateCreator<BoundStore, [], [], FilterSlice> = (set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
})

const useWorkspaceStore = create<BoundStore>()((...a) => ({
  ...createCatalogSlice(...a),
  ...createLoadSlice(...a),
  ...createFilterSlice(...a),
}))

function VisibleList() {
  const items = useWorkspaceStore((state) => state.items)
  const filter = useWorkspaceStore((state) => state.filter)
  const visible =
    filter === 'all' ? items : items.filter((item) => item.status === filter)
  return <p>{visible.map((item) => item.title).join('、') || '空'}</p>
}
```
:::

## 八、本节小结

- 内容管理工作区是一份 Store，用 slice 拆初始化函数。
- 异步加载准备好再写入，并用请求号丢掉过期结果。
- 列表更新必须换成新数组；可见条目在渲染时过滤。
- 组件按字段订阅；活动日志用默认 `subscribe`，不要替代 Hook。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 Slices Pattern](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/slices-pattern.md) - 展开合并、跨片段 get，中间件只加在合并结果上。
- [Zustand 5.0.15 Advanced TypeScript Slices pattern](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/advanced-typescript.md) - StateCreator 四参数。
- [Zustand 5.0.15 README Async actions](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 准备好再 set。
- [Zustand 5.0.15 README subscribe and transient updates](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 默认 subscribe 与 useEffect 取消。
- [Zustand Updating state](https://zustand.docs.pmnd.rs/learn/guides/updating-state) - 顶层浅合并与按层复制。
- [Zustand 5.0.15 create API](https://zustand.docs.pmnd.rs/reference/apis/create) - 数组用展开、map、filter 赋新值。
- [Zustand Beginner TypeScript Derived State with Selectors](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/beginner-typescript.md) - 能算出来的值不要再存一份。
- [React Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - 不要保存可计算的重复状态。
