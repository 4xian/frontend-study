---
id: react.redux.learn.intermediate.create-entity-adapter
type: lesson
title: createEntityAdapter
summary: 用实体适配器统一维护标准化集合的 CRUD、排序和 Selector。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 95
prerequisites:
  - react.redux.learn.intermediate.normalized-state
related:
  - react.redux.learn.intermediate.selector
  - react.redux.learn.intermediate.create-selector
tags:
  - Redux Toolkit
  - createEntityAdapter
  - EntityState
  - normalized state
  - CRUD
  - sortComparer
  - Selector
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能根据实体类型配置 selectId 和 sortComparer。
  - 能用 getInitialState 在实体集合旁保留额外字段。
  - 能用 adapter 提供的 CRUD reducer 管理集合。
  - 能用 getSelectors 生成 selectIds、selectEntities、selectAll、selectTotal 和 selectById。
  - 能判断 adapter 的排序、更新合并和关系边界。
recap:
  - createEntityAdapter 管理 `{ ids, entities }` 集合，并把常见 CRUD 操作封装为可复用方法。
  - selectId 决定实体主键；不配置时默认读取实体的 `id` 字段。
  - sortComparer 只影响 ids 的排序，不改变 entities 的查找职责。
  - getInitialState 可以把 loading、error 等额外字段和实体集合放在同一 slice 状态中。
  - getSelectors 从状态选择器生成标准查询，关系拼接仍由应用自己的 Selector 负责。
sources:
  - title: Redux Toolkit createEntityAdapter API
    url: https://redux-toolkit.js.org/api/createEntityAdapter
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - createEntityAdapter 接受 selectId 与 sortComparer 配置并返回实体适配器。
      - 适配器提供 getInitialState、getSelectors、addOne、addMany、setAll、upsertOne、updateOne、removeOne 等公开 API。
      - getSelectors 可以生成 selectIds、selectEntities、selectAll、selectTotal 与 selectById。
  - title: Redux Toolkit Usage Guide Managing Normalized Data
    url: https://redux-toolkit.js.org/usage/usage-guide#managing-normalized-data
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0+
    claims:
      - Entity Adapter 用标准化状态形状管理集合，并可在初始状态中保留额外字段。
      - adapter reducer 可以作为 createSlice reducer 使用，Immer 会处理不可变更新。
  - title: Redux Essentials Part 6 Performance and Normalizing Data
    url: https://redux.js.org/tutorials/essentials/part-6-performance-normalization
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
    claims:
      - createEntityAdapter 可以减少标准化集合的重复 CRUD 代码。
      - 适配器生成的 Selector 可按 ID 或列表顺序读取实体。
  - title: Redux Toolkit 2.12.0 createEntityAdapter source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/entities/create_adapter.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - createEntityAdapter 根据 sortComparer 选择排序或无排序状态适配器，并组合状态、Selector 与 CRUD 方法。
  - title: Redux Toolkit 2.12.0 Entity Adapter tests
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/entities/tests/sorted_state_adapter.test.ts
    sourceType: official-test
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 官方测试覆盖排序集合的新增、更新、替换和删除后 ids 顺序与实体查找结果。
  - title: Redux Toolkit npm latest package metadata
    url: https://registry.npmjs.org/@reduxjs%2ftoolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit latest stable (核验于 2026-08-31)
    claims:
      - latest 标签指向 Redux Toolkit 2.12.0，作为本课版本核验依据。
  - title: Redux npm latest package metadata
    url: https://registry.npmjs.org/redux/latest
    sourceType: official-reference
    appliesTo: Redux latest stable (核验于 2026-08-31)
    claims:
      - latest 标签指向 Redux 5.0.1，作为本课版本核验依据。
  - title: React Redux npm latest package metadata
    url: https://registry.npmjs.org/react-redux/latest
    sourceType: official-reference
    appliesTo: React Redux latest stable (核验于 2026-08-31)
    claims:
      - latest 标签指向 React Redux 9.3.0，作为本课版本核验依据。
---

# createEntityAdapter

## 一、学习目标

- 根据实体主键和排序需求配置一个 Entity Adapter。
- 使用 adapter 的状态初始化、CRUD reducer 和生成的 Selector。
- 理解适配器维护的 `ids` 与 `entities` 仍然是 Redux state 的源事实。
- 在集合状态旁保存加载状态等额外字段，并把关系派生放在应用 Selector 中。

## 二、为什么需要 createEntityAdapter

手写标准化状态时，每个集合都要重复实现新增、批量替换、合并更新、删除、按 ID 查找和列表派生。重复代码容易遗漏
`ids` 与 `entities` 的同步，也会让不同 Feature 对同一种操作产生不同语义。

`createEntityAdapter` 把这些稳定的集合操作集中到一个适配器中。应用只需要描述实体主键和排序规则，再把适配器方法接入
slice；特殊的业务规则仍然留在自己的 reducer 或 Selector 中。

## 三、核心概念

### 1. 配置主键与排序

实体默认使用 `id` 字段作为主键。实体没有这个字段，或主键来自后端的其他字段时，使用 `selectId` 明确返回主键：

```ts
type Article = { key: string; title: string; score: number }

const articlesAdapter = createEntityAdapter<Article>({
  selectId: (article) => article.key,
  sortComparer: (left, right) => right.score - left.score,
})
```

`sortComparer` 存在时，适配器维护有序的 `ids`；没有排序器时，集合按适配器的无排序策略维护。排序器只决定集合顺序，
不会把排序后的实体副本写进 `entities`。

### 2. 初始化集合与额外字段

`getInitialState` 可以接收额外字段，返回同时包含业务字段和实体索引的状态：

```ts
type ArticlesState = EntityState<Article, string> & {
  loading: 'idle' | 'pending'
  lastAction: 'idle' | 'added'
}

const initialState: ArticlesState = articlesAdapter.getInitialState({
  loading: 'idle',
  lastAction: 'idle',
})
```

可以在变量注解中描述最终状态，同时让 TypeScript 从额外字段对象推断实体索引。`loading` 不属于实体集合，不应放在某一篇文章对象中。

### 3. CRUD 方法既能产生 reducer 也能直接更新状态

适配器方法有两种常见使用方式。把方法放进 `createSlice.reducers` 时，它接收 Immer draft；在普通 reducer 或测试中，也可以
把当前状态作为第一个参数并返回新的状态：

```ts
const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    articleAdded: articlesAdapter.addOne,
    articlesReplaced: articlesAdapter.setAll,
    articleUpdated: articlesAdapter.updateOne,
    articleRemoved: articlesAdapter.removeOne,
  },
})
```

常用方法包括 `addOne`、`addMany`、`setOne`、`setMany`、`setAll`、`upsertOne`、`upsertMany`、`updateOne`、`updateMany`、
`removeOne`、`removeMany` 和 `removeAll`。`updateOne` 使用 `{ id, changes }`，只浅合并 changes，不会自动深度合并嵌套对象。

### 4. 生成标准 Selector

给 `getSelectors` 一个从 RootState 指向实体状态的 Selector，可以得到带 RootState 类型的查询函数：

```ts
const articleSelectors = articlesAdapter.getSelectors<RootState>((state) => state.articles)

articleSelectors.selectIds(state)
articleSelectors.selectEntities(state)
articleSelectors.selectAll(state)
articleSelectors.selectTotal(state)
articleSelectors.selectById(state, 'article-1')
```

`selectAll` 按 `ids` 顺序返回实体数组，`selectById` 直接读取实体。若还要组合作者、标签或权限信息，继续在应用层写派生
Selector，不要把关系副本塞回适配器状态。

## 四、用法与示例

### 1. 让 adapter reducer 与业务 reducer 协作

适配器只负责集合不变量，额外字段和业务规则仍由 slice reducer 维护：

```ts
const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    articleAdded: (state, action: PayloadAction<Article>) => {
      articlesAdapter.addOne(state, action.payload)
      state.lastAction = 'added'
    },
    articlesLoadingChanged: (state, action: PayloadAction<ArticlesState['loading']>) => {
      state.loading = action.payload
    },
  },
})
```

当业务要求“已存在时拒绝新增”或“删除文章时清除评论关系”时，在调用 adapter 方法前后增加明确规则，不要修改 adapter
的内部实现。

### 2. `upsert`、`update` 与 `setAll` 的选择

- `addOne` 只处理不存在的实体，重复 ID 不会新增第二份记录。
- `upsertOne` 在不存在时新增，存在时按适配器的更新语义合并实体。
- `updateOne` 要求 ID 和 changes，适合只修改少数字段。
- `setAll` 用给定集合替换现有集合，同时重建 `ids` 和 `entities`。
- `removeOne`、`removeMany` 和 `removeAll` 负责从两个索引中删除实体。

这些方法只知道实体集合，不知道作者、评论等外部关系。关系删除、级联策略和缺失占位符必须由应用的 reducer 与 Selector
共同定义。

### 3. Demo：观察适配器的排序与 CRUD

:::demo{id="react.redux.learn.intermediate.create-entity-adapter.create-entity-adapter-demo"}
:::

Demo 使用评分排序的文章集合，展示适配器如何同时维护 `ids`、`entities` 和 `loading` 字段。可以新增、合并更新、局部更新、
删除和整体替换，并通过生成的 Selector 观察排序列表、按 ID 详情和总数。

## 五、易错使用提示

:::pitfalls
### 错误：把 sortComparer 当成实体数据排序字段

**触发条件：** 在实体上复制一个排序后的数组，或者认为 `sortComparer` 会修改实体对象。

**原因：** 排序器只决定 `ids` 的顺序，`entities` 仍然是按 ID 查找的实体表。

**后果：** 状态出现重复事实，更新实体后排序副本可能过期。

**错误示例：**

```ts
state.sortedArticles = [...state.entities]
```

**正确写法：**

```ts
const articles = articlesAdapter.getSelectors<RootState>((state) => state.articles).selectAll(state)
```

**验证方式：** 更新实体评分后，检查 `selectAll` 的顺序变化，而不是读取额外的排序副本。

### 错误：用 updateOne 做深度合并

**触发条件：** changes 中只写嵌套对象的一层字段，并期待其余嵌套字段自动合并。

**原因：** `updateOne` 对实体应用浅层 changes。

**后果：** 嵌套对象可能被整个替换，未列出的字段丢失。

**错误示例：**

```ts
articlesAdapter.updateOne(state, { id: 'a', changes: { metadata: { featured: true } } })
```

**正确写法：**

```ts
const article = state.entities.a
if (article) {
  article.metadata = { ...article.metadata, featured: true }
}
```

**验证方式：** 更新嵌套字段后同时检查旧的兄弟字段仍然存在。

### 错误：把 extra state 字段当成实体

**触发条件：** 把 `loading` 或 `error` 写进每个实体，或者从 `selectAll` 结果中查找这些字段。

**原因：** `getInitialState` 的额外字段属于 slice 状态，不属于实体表。

**后果：** 实体模型被污染，状态查询和加载状态边界混乱。

**错误示例：**

```ts
adapter.addOne(state, { id: 'a', title: 'A', loading: 'pending' })
```

**正确写法：**

```ts
const state = adapter.getInitialState({ loading: 'idle' })
state.loading = 'pending'
```

**验证方式：** `selectAll` 返回的每项只有实体字段，加载状态从 slice 状态单独读取。

### 错误：让不同 Feature 共用可变 adapter 状态

**触发条件：** 把同一个已经运行过的状态对象传给多个 store 或多个 Demo 实例。

**原因：** Redux state 必须由 store 独占，实例之间不能共享可变状态引用。

**后果：** 一个实例的 dispatch 影响另一个实例，问题难以复现。

**错误示例：**

```ts
const sharedState = adapter.getInitialState()
const storeA = configureStore({ reducer: { articles: () => sharedState } })
const storeB = configureStore({ reducer: { articles: () => sharedState } })
```

**正确写法：**

```ts
const createInitialState = () => adapter.getInitialState({ loading: 'idle' })
const store = configureStore({ reducer: { articles: articlesReducer } })
```

**验证方式：** 分别创建两个 store，各自 dispatch 后比较 `getState()`，应只有当前 store 改变。

### 错误：忽略关系和主键策略

**触发条件：** 只凭 `id` 默认值处理来自后端的复合键，或删除实体却不处理外部 ID 引用。

**原因：** adapter 只管理一个实体集合，不知道关系和业务主键的语义。

**后果：** 实体覆盖、重复记录或关系 Selector 读到缺失对象。

**错误示例：**

```ts
const adapter = createEntityAdapter<{ serverKey: string; title: string }>()
```

**正确写法：**

```ts
const adapter = createEntityAdapter<{ serverKey: string; title: string }>({
  selectId: (entity) => entity.serverKey,
})
```

**验证方式：** 用两个不同主键的实体执行 add/upsert，并检查 `selectIds` 与关系 Selector 的结果。
:::

## 六、原理与适用场景

### 1. 适配器把不变量集中到一个边界

固定版本源码显示，`createEntityAdapter` 会根据是否配置 `sortComparer` 选择对应状态适配器，并组合状态初始化、Selector
和 CRUD 方法。课程层面的价值是让每个 Feature 复用同一组集合不变量，减少手写 `ids` 与 `entities` 的分支。

### 2. 适配器不是关系模型或缓存策略

适配器只知道当前集合的主键、排序和实体字段。它不会自动级联删除作者关系，也不会负责网络缓存、失效和重新获取。
这些职责应由应用的领域规则和专门的数据获取层决定。

### 3. 何时手写，何时使用 adapter

需要教学演示、非标准集合结构或特殊写入语义时，手写状态更容易表达规则。常规实体集合的 CRUD、排序和基础查询重复出现时，
adapter 可以降低重复；不要为了使用工具而把不适合实体表的数据强行转换为实体集合。

## 七、练习

:::exercise
### 用 createEntityAdapter 管理消息列表

**要求：** 定义 `Message` 类型和 `messagesAdapter`，按 `sentAt` 从新到旧排序。使用 `getInitialState` 增加 `loading` 字段，
创建 `messagesSlice` 并提供 `messageAdded`、`messageUpdated`、`messageRemoved` 和 `messagesReplaced` action。再生成
`selectAllMessages` 与 `selectMessageById` Selector。

**验收：** 创建 store 后连续 dispatch 新增、局部更新、删除和整体替换；`selectAllMessages` 始终按 `sentAt` 从新到旧返回，
`selectMessageById` 能按 ID 找到实体，且 `ids` 与 `entities` 中没有不一致记录，Selector 调用不修改 state。

**参考答案：**

```ts
import {
  configureStore,
  createEntityAdapter,
  createSlice,
  type EntityState,
  type PayloadAction,
} from '@reduxjs/toolkit'

type Message = {
  id: string
  body: string
  sentAt: number
}

type MessagesState = EntityState<Message, string> & {
  loading: 'idle' | 'pending'
}

const messagesAdapter = createEntityAdapter<Message>({
  sortComparer: (left, right) => right.sentAt - left.sentAt,
})

const initialState: MessagesState = messagesAdapter.getInitialState({ loading: 'idle' })

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    /** 新增一条消息并让 adapter 维护排序索引。 */
    messageAdded: messagesAdapter.addOne,
    /** 按 ID 浅更新消息字段。 */
    messageUpdated: messagesAdapter.updateOne,
    /** 按 ID 删除消息。 */
    messageRemoved: messagesAdapter.removeOne,
    /** 用一组消息替换当前集合。 */
    messagesReplaced: messagesAdapter.setAll,
    /** 修改集合之外的加载状态。 */
    loadingChanged: (state, action: PayloadAction<MessagesState['loading']>) => {
      state.loading = action.payload
    },
  },
})

type RootState = { messages: typeof initialState }
const store = configureStore({ reducer: { messages: messagesSlice.reducer } })

const selectors = messagesAdapter.getSelectors<RootState>((state) => state.messages)
const selectAllMessages = selectors.selectAll
const selectMessageById = selectors.selectById

store.dispatch(messagesSlice.actions.messageAdded({ id: 'm-1', body: '第一条', sentAt: 100 }))
store.dispatch(messagesSlice.actions.messageAdded({ id: 'm-2', body: '第二条', sentAt: 300 }))
store.dispatch(
  messagesSlice.actions.messageUpdated({ id: 'm-1', changes: { body: '第一条（已编辑）' } }),
)
store.dispatch(messagesSlice.actions.messageRemoved('m-1'))
store.dispatch(
  messagesSlice.actions.messagesReplaced([
    { id: 'm-3', body: '替换消息', sentAt: 200 },
    { id: 'm-4', body: '最新消息', sentAt: 400 },
  ]),
)

const state = store.getState()
const beforeSelect = JSON.stringify(state)
const allMessages = selectAllMessages(state)
const entityKeys = Object.keys(state.messages.entities)
const idsMatchEntities =
  entityKeys.length === state.messages.ids.length &&
  state.messages.ids.every((id) => Object.prototype.hasOwnProperty.call(state.messages.entities, id))
if (!idsMatchEntities) throw new Error('ids 与 entities 不一致')
const isSorted = allMessages.every(
  (message, index) => index === 0 || allMessages[index - 1]!.sentAt >= message.sentAt,
)
if (!isSorted) {
  throw new Error('selectAllMessages 未按 sentAt 降序排列')
}
if (selectMessageById(state, 'm-4')?.body !== '最新消息') {
  throw new Error('selectMessageById 未找到实体')
}
if (JSON.stringify(store.getState()) !== beforeSelect) throw new Error('Selector 不应修改 state')
```
:::

## 八、本节小结

- `createEntityAdapter` 统一管理实体主键、排序、`ids`、`entities` 和常见 CRUD。
- `getInitialState` 的额外字段属于 slice 状态；adapter Selector 只负责实体集合查询。
- `updateOne` 是浅更新，关系、级联删除和缓存边界仍由应用设计。
- `getSelectors` 生成按 ID、列表、总数读取的标准 Selector，列表顺序遵循 adapter 的 `ids`。

## 九、参考资料

- [Redux Toolkit createEntityAdapter API](https://redux-toolkit.js.org/api/createEntityAdapter) - 适配器配置、CRUD 方法和 Selector。
- [Redux Toolkit Usage Guide: Managing Normalized Data](https://redux-toolkit.js.org/usage/usage-guide#managing-normalized-data) - 在 slice 中使用 Entity Adapter。
- [Redux Essentials Part 6: Performance and Normalizing Data](https://redux.js.org/tutorials/essentials/part-6-performance-normalization) - 标准化数据与适配器的应用场景。
- [Redux Toolkit 2.12.0 createEntityAdapter source](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/entities/create_adapter.ts) - 适配器组合状态、Selector 与 CRUD 的实现。
- [Redux Toolkit 2.12.0 Entity Adapter tests](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/entities/tests/sorted_state_adapter.test.ts) - 排序集合 CRUD 行为的官方测试。
- [Redux Toolkit npm latest package metadata](https://registry.npmjs.org/@reduxjs%2ftoolkit/latest) - 核验本课使用的最新稳定版本。
- [Redux npm latest package metadata](https://registry.npmjs.org/redux/latest) - 核验 Redux 稳定版本。
- [React Redux npm latest package metadata](https://registry.npmjs.org/react-redux/latest) - 核验 React Redux 稳定版本。
