---
id: react.redux.learn.intermediate.async-content-management-workspace
type: lesson
title: 实战：异步内容管理工作区
summary: 组合实体适配器、createAsyncThunk 和派生 Selector，完成一个可编辑、可筛选并能反馈请求状态的内容工作区。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 120
prerequisites:
  - react.redux.learn.intermediate.create-entity-adapter
  - react.redux.learn.intermediate.async-lifecycle-state
  - react.redux.learn.intermediate.async-error-reject-with-value
related:
  - react.redux.learn.intermediate.create-async-thunk
  - react.redux.learn.intermediate.extra-reducers-action-matcher
  - react.redux.learn.basics.use-selector
tags:
  - Redux Toolkit
  - createAsyncThunk
  - createEntityAdapter
  - content workspace
  - async CRUD
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能为内容集合选择实体主键、排序和状态外字段。
  - 能为加载、保存、发布和删除分别设计 createAsyncThunk 输入输出与失败通道。
  - 能在一个 Slice 中把异步生命周期 action 接到实体适配器 CRUD。
  - 能用 Selector 派生筛选列表和当前详情，不把视图副本写回 Redux state。
  - 能让组件根据请求状态禁用重复操作，并区分业务错误与成功反馈。
recap:
  - 实体适配器保存内容集合事实，异步 Thunk 表达一次命令的生命周期。
  - pending、fulfilled 和 rejected 更新当前请求与错误字段；fulfilled 还会由业务 Reducer 写入服务确认的实体结果。
  - 筛选列表是 Selector 的派生结果，编辑输入是组件草稿，二者都不应复制成第二份全局事实。
  - rejectWithValue 用于可展示的业务拒绝，普通异常保留在 action.error。
  - 多个异步命令共享状态字段时，要明确 loading 语义和并发边界；本工作区用单一 pending 状态串行化操作。
sources:
  - title: Redux Toolkit createAsyncThunk API
    url: https://redux-toolkit.js.org/api/createAsyncThunk
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - createAsyncThunk 为一次异步命令生成 pending、fulfilled 和 rejected 生命周期 action。
      - payloadCreator 可以返回 rejectWithValue，使业务错误进入 rejected action.payload。
      - Thunk 的 dispatch Promise 会以最终 action 完成，组件可以等待它结束。
  - title: Redux Toolkit createEntityAdapter API
    url: https://redux-toolkit.js.org/api/createEntityAdapter
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - adapter 的 CRUD 方法可以作为 Slice reducer 使用，并维护 ids 与 entities。
      - getSelectors 可以从 RootState 定位实体状态并生成 selectAll、selectById 等查询。
  - title: Redux Toolkit createSlice API
    url: https://redux-toolkit.js.org/api/createSlice
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - extraReducers builder 可以响应当前 Slice 之外的 action creator。
      - addCase 可以把异步生命周期 action 映射到业务状态。
  - title: Redux Essentials Part 5 - Async Logic and Data Fetching
    url: https://redux.js.org/tutorials/essentials/part-5-async-logic
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
    claims:
      - 官方教程将异步请求和数据状态放在 Redux 中，并由组件根据状态渲染界面。
      - 异步流程应明确加载、成功和失败的用户反馈。
  - title: Redux Toolkit 2.12.0 createAsyncThunk Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createAsyncThunk.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码在 payloadCreator 前派发 pending，并在完成后派发 fulfilled 或 rejected。
      - rejectWithValue 产生的拒绝会携带 payload 与 rejectedWithValue 标记。
  - title: Redux Toolkit 2.12.0 createEntityAdapter Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/entities/create_adapter.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码组合排序或无排序的实体状态适配器，并暴露 CRUD、初始化和 Selector 能力。
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs/toolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - npm latest 在核验日指向 Redux Toolkit 2.12.0。
  - title: Redux 5.0.1 npm Latest Metadata
    url: https://registry.npmjs.org/redux/latest
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - npm latest 在核验日指向 Redux 5.0.1。
  - title: React Redux 9.3.0 npm Latest Metadata
    url: https://registry.npmjs.org/react-redux/latest
    sourceType: official-reference
    appliesTo: React Redux 9.3.0
    claims:
      - npm latest 在核验日指向 React Redux 9.3.0。
  - title: React 19.2.8 npm Latest Metadata
    url: https://registry.npmjs.org/react/latest
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - npm latest 在核验日指向 React 19.2.8。
---

# 实战：异步内容管理工作区

## 一、学习目标

- 为内容集合配置稳定的实体主键、更新时间排序和额外请求字段。
- 使用 `createAsyncThunk` 表达加载、保存、发布和删除等命令。
- 在 `extraReducers` 中把异步生命周期接到实体适配器和请求状态。
- 用 Selector 派生筛选列表与当前详情，让组件只订阅真正需要的结果。
- 为可预期的业务失败提供可读错误，并在请求进行时阻止重复操作。

## 二、为什么需要内容管理工作区

真实的内容后台同时面对两种变化：集合中的实体会新增、更新和删除；网络命令会经历等待、成功或失败。只把文章数组放在组件中，
会让列表、编辑器和状态提示各自维护一份事实；只把请求结果放进一个普通数组，又会重复实现按 ID 查找、排序和删除。

本实战把职责分开：`createEntityAdapter` 维护内容的 `ids` 与 `entities`，`createAsyncThunk` 表达一次服务命令，Slice 的
`extraReducers` 连接二者，Selector 负责把集合转换为当前视图。组件只保留尚未提交的输入草稿。

## 三、建立工作区状态模型

### 1. 让实体字段和请求字段分开

```ts
type Content = {
  id: string
  title: string
  summary: string
  status: 'draft' | 'published'
  updatedAt: number
}

type ContentState = EntityState<Content, string> & {
  requestStatus: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
  selectedId: string | null
  filter: 'all' | 'draft' | 'published'
}
```

`requestStatus`、`error`、`selectedId` 和 `filter` 是工作区状态，不属于某一条内容。实体的更新时间用于适配器排序，不能用一个额外的
`sortedContents` 数组复制同一批实体。

### 2. 用适配器初始化集合

```ts
const contentAdapter = createEntityAdapter<Content>({
  sortComparer: (left, right) => right.updatedAt - left.updatedAt,
})

const initialState = contentAdapter.getInitialState<ContentState>({
  requestStatus: 'idle',
  error: null,
  selectedId: null,
  filter: 'all',
})
```

适配器保留标准化集合，额外字段表达页面的业务事实。多个 Demo 或多个 store 需要各自调用初始化函数，不能共享一个运行过的状态引用。

## 四、用异步 Thunk 表达工作区命令

### 1. 加载集合

```ts
const loadContents = createAsyncThunk<Content[], void, { rejectValue: string }>(
  'contentWorkspace/loadContents',
  async (_, { rejectWithValue }) => {
    const response = await contentService.list()
    if (!response.ok) return rejectWithValue('内容服务暂时不可用')
    return response.items
  },
)
```

Thunk 只描述命令的输入、输出和失败语义，不直接写 Redux state。`pending`、`fulfilled` 和 `rejected` 由 Slice 的
`extraReducers` 决定如何影响工作区。

### 2. 保存、发布和删除

```ts
const saveContent = createAsyncThunk<Content, { id: string; title: string }, { rejectValue: string }>(
  'contentWorkspace/saveContent',
  async ({ id, title }, { rejectWithValue }) => {
    if (title.trim().length < 4) return rejectWithValue('标题至少需要 4 个字符')
    return contentService.updateTitle(id, title.trim())
  },
)

const deleteContent = createAsyncThunk<string, string, { rejectValue: string }>(
  'contentWorkspace/deleteContent',
  async (id) => contentService.remove(id),
)
```

命令的返回值应该是后端确认后的实体或 ID。这样 fulfilled Reducer 可以直接调用 `upsertOne` 或 `removeOne`，而不是先让组件修改
一份本地列表，再猜测服务是否成功。

### 3. 在 extraReducers 中接入 adapter

```ts
extraReducers: (builder) => {
  builder
    .addCase(saveContent.pending, (state) => {
      state.requestStatus = 'pending'
      state.error = null
    })
    .addCase(saveContent.fulfilled, (state, action) => {
      contentAdapter.upsertOne(state, action.payload)
      state.requestStatus = 'succeeded'
    })
    .addCase(saveContent.rejected, (state, action) => {
      state.requestStatus = 'failed'
      state.error = action.payload ?? action.error.message ?? '保存失败'
    })
}
```

加载成功时使用 `setAll` 重建集合；单实体命令使用 `upsertOne` 或 `removeOne`。适配器不负责请求状态，也不负责决定错误应该怎样展示。

## 五、用 Selector 组织工作区视图

### 1. 复用适配器 Selector

```ts
const selectors = contentAdapter.getSelectors<RootState>((state) => state.contentWorkspace)
const selectAllContents = selectors.selectAll
const selectContentById = selectors.selectById
```

`selectAllContents` 按 `updatedAt` 排序返回实体，`selectContentById` 直接读取当前详情。组件不需要遍历 `entities`，也不需要从
`ids` 手写查找逻辑。

### 2. 把筛选留在查询层

```ts
function selectVisibleContents(state: RootState): Content[] {
  const filter = state.contentWorkspace.filter
  return selectAllContents(state).filter(
    (content) => filter === 'all' || content.status === filter,
  )
}
```

筛选结果是当前状态的派生值。筛选条件变化时重新计算即可，不要再把“已发布列表”和“草稿列表”存成两个可变数组。

### 3. 编辑器只保存未提交草稿

```tsx
const selected = useAppSelector((state) =>
  state.contentWorkspace.selectedId
    ? selectContentById(state, state.contentWorkspace.selectedId)
    : undefined,
)
const [draftTitle, setDraftTitle] = useState('')
```

输入框尚未提交的内容属于组件交互草稿。点击保存时，组件派发 `saveContent`，fulfilled 后再由实体适配器写回唯一的内容事实。

## 六、用法示例或 Demo

:::demo{id="react.redux.learn.intermediate.async-content-management-workspace.content-workspace-demo"}

Demo 展示加载成功和失败、实体列表筛选、标题保存、发布切换、删除以及请求状态禁用。底部的 `adapter selectors` 快照用于观察
实体 ID 仍由适配器统一维护。
::::

## 七、易错使用提示

:::pitfalls
### 错误：让组件直接修改内容列表

**触发条件：** 保存按钮点击后先用 `setItems` 修改列表，再派发异步请求。

**原因：** 组件创建了脱离 Redux 的第二份内容事实。

**后果：** 请求失败时界面仍显示未被服务确认的标题，其他组件也读不到这次修改。

**错误示例：**

```tsx
setItems((items) => items.map((item) => ({ ...item, title: draftTitle })))
void dispatch(saveContent({ id, title: draftTitle }))
```

**正确写法：**

```tsx
await dispatch(saveContent({ id, title: draftTitle }))
```

**验证方式：** 让服务返回失败，检查实体标题是否仍保持失败前的值，并且错误字段有可读信息。

### 错误：用多个布尔值表示一次命令

**触发条件：** 同时保存 `isLoading`、`isSaved` 和 `hasError`，每个异步分支只更新其中两个字段。

**原因：** 多个布尔值允许互相矛盾的组合。

**后果：** 失败页面可能同时显示成功提示，按钮也可能在请求中重新启用。

**错误示例：**

```ts
state.isLoading = false
state.isSaved = true
```

**正确写法：**

```ts
state.requestStatus = 'succeeded'
state.error = null
```

**验证方式：** 依次触发成功和失败，检查界面同一时刻只显示一个请求状态。

### 错误：把筛选结果写回实体 state

**触发条件：** 切换“已发布”时调用 `setAll`，把草稿从实体集合中移除。

**原因：** 把一个视图查询误当成了服务端集合变更。

**后果：** 切换回“全部”后草稿已经丢失，重新加载前无法恢复。

**错误示例：**

```ts
contentAdapter.setAll(state, state.entities.filter((content) => content.status === 'published'))
```

**正确写法：**

```ts
const visible = selectAllContents(state).filter((content) => content.status === filter)
```

**验证方式：** 在不同筛选条件间切换，确认 `ids` 总数不随查询条件改变。

### 错误：用普通异常代替业务拒绝

**触发条件：** 标题过短时 `throw new Error('标题不合法')`，Reducer 只读取 `action.error.message`。

**原因：** 预期业务失败没有进入约定的 `rejectValue` 通道。

**后果：** 字段级提示与系统故障无法区分，组件也不能可靠判断是否可以修正输入后重试。

**错误示例：**

```ts
if (title.length < 4) throw new Error('标题不合法')
```

**正确写法：**

```ts
if (title.length < 4) return rejectWithValue('标题至少需要 4 个字符')
```

**验证方式：** 检查 rejected action 的 `payload`，应包含业务错误；普通异常才进入 `action.error`。

### 错误：允许多个命令同时覆盖同一详情

**触发条件：** 保存、发布和删除按钮在请求 pending 时仍可点击。

**原因：** Demo 没有定义同一实体上的并发策略。

**后果：** 后返回的旧响应可能覆盖新状态，用户无法判断最终结果。

**错误示例：**

```tsx
<button onClick={() => void dispatch(saveContent(command))}>保存</button>
```

**正确写法：**

```tsx
<button disabled={requestStatus === 'pending'} onClick={() => void dispatch(saveContent(command))}>
  保存
</button>
```

**验证方式：** 请求执行期间检查所有命令按钮均不可用；需要并发时另行设计 requestId 或实体级状态。
:::

## 八、源码推导与适用场景

1. 固定版本的 `createAsyncThunk` 源码先派发 `pending`，再根据 payloadCreator 的结果创建 `fulfilled` 或 `rejected`；因此
   Slice 可以把请求状态转换集中放在 `extraReducers`，而不把网络流程塞进组件。
2. 固定版本的实体适配器源码把排序策略、`ids`、`entities`、CRUD 和 Selector 组合成一个集合边界；因此内容工作区只需让
   `setAll`、`upsertOne` 和 `removeOne` 代表已确认的实体变化。
3. 课程推导是“命令返回服务确认结果，再由 Reducer 写回实体集合”。它适合单一工作区的串行操作；高并发编辑、离线队列、乐观更新
   需要额外的请求身份、回滚或持久化设计，不应由本 Demo 的单一 `requestStatus` 冒充解决。

## 九、练习

:::exercise
### 用实体适配器完成一个异步内容 Slice

**要求：** 定义 `Content`、`contentAdapter` 和 `contentSlice`。创建 `loadContents` 与 `saveContent` 两个
`createAsyncThunk`，让加载成功用 `setAll`，保存成功用 `upsertOne`，业务失败通过 `rejectWithValue` 返回。生成
`selectVisibleContents` 和 `selectContentById`，组件根据 `requestStatus` 禁用保存按钮。

**验收：** 连续执行加载成功、标题保存、标题过短失败和筛选切换；成功后实体集合只有一份最新标题，失败后标题不变且错误可读，
筛选只改变派生列表，`ids` 与 `entities` 始终一致。Selector 调用前后 state 的 JSON 快照相同。

**参考答案：**

```tsx
import { configureStore, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'

type Content = { id: string; title: string; status: 'draft' | 'published'; updatedAt: number }
type RequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed'
type ContentState = ReturnType<typeof contentAdapter.getInitialState> & {
  requestStatus: RequestStatus
  error: string | null
  filter: 'all' | Content['status']
}

const contentAdapter = createEntityAdapter<Content>({
  sortComparer: (left, right) => right.updatedAt - left.updatedAt,
})

const loadContents = createAsyncThunk<Content[], void, { rejectValue: string }>(
  'content/load',
  async (_, { rejectWithValue }) => {
    const response = await Promise.resolve({ ok: true, items: seedContents })
    return response.ok ? response.items : rejectWithValue('加载失败')
  },
)

const saveContent = createAsyncThunk<Content, { id: string; title: string }, { rejectValue: string }>(
  'content/save',
  async ({ id, title }, { rejectWithValue }) => {
    if (title.trim().length < 4) return rejectWithValue('标题至少需要 4 个字符')
    return { id, title: title.trim(), status: 'draft', updatedAt: Date.now() }
  },
)

const contentSlice = createSlice({
  name: 'content',
  initialState: contentAdapter.getInitialState<ContentState>({
    requestStatus: 'idle',
    error: null,
    filter: 'all',
  }),
  reducers: {
    filterChanged: (state, action: { payload: ContentState['filter'] }) => {
      state.filter = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadContents.pending, (state) => {
        state.requestStatus = 'pending'
        state.error = null
      })
      .addCase(loadContents.fulfilled, (state, action) => {
        contentAdapter.setAll(state, action.payload)
        state.requestStatus = 'succeeded'
      })
      .addCase(loadContents.rejected, (state, action) => {
        state.requestStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? '加载失败'
      })
      .addCase(saveContent.pending, (state) => {
        state.requestStatus = 'pending'
        state.error = null
      })
      .addCase(saveContent.fulfilled, (state, action) => {
        contentAdapter.upsertOne(state, action.payload)
        state.requestStatus = 'succeeded'
      })
      .addCase(saveContent.rejected, (state, action) => {
        state.requestStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? '保存失败'
      })
  },
})

const store = configureStore({ reducer: { content: contentSlice.reducer } })
type RootState = ReturnType<typeof store.getState>
const selectors = contentAdapter.getSelectors<RootState>((state) => state.content)
const selectContentById = selectors.selectById
const selectVisibleContents = (state: RootState) => {
  const filter = state.content.filter
  return selectors.selectAll(state).filter((content) => filter === 'all' || content.status === filter)
}
const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

const seedContents: Content[] = [
  { id: 'content-1', title: '第一条内容', status: 'published', updatedAt: 2 },
  { id: 'content-2', title: '第二条内容', status: 'draft', updatedAt: 1 },
]

function ContentEditor({ id }: { id: string }): JSX.Element {
  const dispatch = useAppDispatch()
  const content = useAppSelector((state) => selectContentById(state, id))
  const status = useAppSelector((state) => state.content.requestStatus)
  if (!content) return <p>内容不存在</p>
  return (
    <button
      type="button"
      disabled={status === 'pending'}
      onClick={() => void dispatch(saveContent({ id: content.id, title: content.title }))}
    >
      保存 {content.title}
    </button>
  )
}
```
:::

## 十、本节小结

- 用实体适配器保存内容集合，用异步 Thunk 表达一次服务命令。
- 用 `extraReducers` 把生命周期 action 映射为请求状态，再用 adapter CRUD 写入服务确认结果。
- 用 Selector 派生筛选和详情，组件本地只保存未提交的编辑草稿。
- 用 `rejectWithValue` 保留可预期业务错误；普通异常仍从 `action.error` 读取。
- 单一 `pending` 状态适合本 Demo 的串行操作；并发编辑需要单独设计请求身份和冲突策略。

## 十一、参考资料

- [Redux Toolkit createAsyncThunk API](https://redux-toolkit.js.org/api/createAsyncThunk) - 异步命令、生命周期 action 与 rejectWithValue。
- [Redux Toolkit createEntityAdapter API](https://redux-toolkit.js.org/api/createEntityAdapter) - 实体集合初始化、CRUD 与 Selector。
- [Redux Toolkit createSlice API](https://redux-toolkit.js.org/api/createSlice) - extraReducers 与 builder addCase。
- [Redux Essentials Part 5: Async Logic and Data Fetching](https://redux.js.org/tutorials/essentials/part-5-async-logic) - 异步数据工作流与界面状态。
- [Redux Toolkit 2.12.0 createAsyncThunk 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createAsyncThunk.ts) - 生命周期派发与拒绝结果。
- [Redux Toolkit 2.12.0 createEntityAdapter 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/entities/create_adapter.ts) - 适配器组合边界。
