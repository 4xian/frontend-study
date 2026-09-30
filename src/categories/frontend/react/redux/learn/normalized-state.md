---
id: react.redux.learn.intermediate.normalized-state
type: lesson
title: 标准化状态
summary: 用 ids 与 entities 保存实体集合，按 ID 维护关系，并在读取时派生适合界面的数据。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 95
prerequisites:
  - react.redux.learn.intermediate.listener-middleware
related:
  - react.redux.learn.intermediate.selector
  - react.redux.learn.basics.multiple-slices-root-state
tags:
  - Redux
  - Redux Toolkit
  - 标准化状态
  - Normalized State
  - ids
  - entities
  - 关系数据
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能解释数组嵌套、重复实体与标准化状态之间的取舍。
  - "能设计 `{ ids, entities }` 形状，并用 ID 表达实体关系。"
  - 能在 reducer 中同时维护 ids 索引和 entities 查找表。
  - 能在 Selector 中把规范化数据派生为列表行或详情对象。
  - 能识别删除关系、排序语义和嵌套对象浅更新带来的边界。
recap:
  - "标准化状态把每类实体保存为 `{ ids: EntityId[], entities: Record<EntityId, Entity> }`。"
  - "`ids` 负责顺序，`entities` 负责按 ID 查找；两者必须保持一致。"
  - 实体之间用 ID 引用，展示需要的嵌套结构在 Selector 中派生。
  - reducer 只更新受影响的实体，组件通过 Selector 读取关系，不复制另一份事实。
  - 手写模型适合理解不变量；常规集合的重复增删改查可以使用 `createEntityAdapter`。
sources:
  - title: Redux Normalizing State Shape
    url: https://redux.js.org/usage/structuring-reducers/normalizing-state-shape
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - 规范化状态把每个实体类型拆成按 ID 查找的表，并让关系保存为 ID 引用。
      - 扁平化状态可以减少重复数据，并让局部实体更新更容易定位。
      - 规范化数据通常需要更多组件分别按 ID 查询自己的实体。
  - title: Redux Fundamentals Part 7 Standard Redux Patterns
    url: https://redux.js.org/tutorials/fundamentals/part-7-standard-patterns
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - 标准化状态使用对象查找表和 ID 数组记录实体集合与显示顺序。
      - 关系数据通过 ID 连接，避免在多个父对象中重复嵌套同一实体。
  - title: Redux Essentials Part 6 Performance and Normalizing Data
    url: https://redux.js.org/tutorials/essentials/part-6-performance-normalization
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
    claims:
      - 规范化可以直接按 ID 读取实体，避免在大数组中线性查找。
      - 展示层可以把规范化表和关系派生为列表或详情视图。
      - createEntityAdapter 提供标准化集合的预置 reducer 与 Selector。
  - title: Redux Toolkit Usage Guide Managing Normalized Data
    url: https://redux-toolkit.js.org/usage/usage-guide#managing-normalized-data
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0+
    claims:
      - "createEntityAdapter 使用 `{ ids: [], entities: {} }` 形状管理集合，并生成 CRUD reducer 与 Selector。"
      - adapter 的 getInitialState 可以在实体字段旁保留 loading 等额外状态。
  - title: Redux Style Guide Keep State Minimal
    url: https://redux.js.org/style-guide/#keep-state-minimal-and-derive-additional-values
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - state 应保持最小化，可计算的数据应在读取时派生，而不是重复存储。
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

# 标准化状态

## 一、学习目标

- 解释为什么关系数据不应在多个父对象中重复嵌套。
- 设计 `ids` 顺序索引和 `entities` 查找表，并保持它们的一致性。
- 在 reducer 中按 ID 更新、删除和新增实体。
- 在 Selector 中把规范化数据组合成列表行或详情对象。
- 能为关系删除、排序和派生字段选择明确的状态边界。

## 二、为什么需要标准化状态

假设一篇文章包含作者和评论，评论也包含作者对象。若每篇文章都复制完整作者，作者改名时必须找到并修改多份副本；
如果某一份没有更新，界面就会同时出现两个名字。嵌套结构还会让“只更新一个作者”变成沿着文章、评论和作者多层遍历的操作。

标准化状态把 Redux 的一部分当作一个小型内存数据库：每种实体只保存一份，其他实体只保存 ID。读取时再通过 Selector
把需要的关系拼成展示数据。这样写入路径更集中，局部更新也更容易观察。

## 三、核心概念

### 1. `ids` 与 `entities` 的双索引

一个实体集合通常有两种读取需求：列表需要稳定顺序，详情需要按 ID 直接查找。标准化状态同时保留两种索引：

```ts
type EntityState<T> = {
  ids: string[]
  entities: Record<string, T>
}

type Book = {
  id: string
  title: string
  authorId: string
}

const books: EntityState<Book> = {
  ids: ['book-1', 'book-2'],
  entities: {
    'book-1': { id: 'book-1', title: '算法札记', authorId: 'ada' },
    'book-2': { id: 'book-2', title: '编译器边界', authorId: 'grace' },
  },
}
```

`ids` 只负责“有哪些实体以及按什么顺序显示”，`entities` 负责“给定 ID 对应哪一个实体”。每次新增或删除都必须同时维护两者；
否则列表和详情会读取到不同事实。

### 2. 用 ID 表达关系

实体关系不要复制完整对象，而是保存外键一样的 ID：

```ts
type Author = {
  id: string
  name: string
}

type Book = {
  id: string
  title: string
  authorId: string
}
```

`Book.authorId` 连接 `authors.entities[authorId]`。这让作者名称只出现一次，也让作者和书籍可以分别更新。关系是否必须存在、
删除作者时如何处理关联书籍，都应成为明确的业务规则，而不是由嵌套对象的偶然形状决定。

### 3. 写入时维护不变量

在使用 `createSlice` 时，Immer 允许在 reducer 中写出接近可变操作的代码，但最终仍会产生新的不可变状态：

```ts
const booksSlice = createSlice({
  name: 'books',
  initialState: books,
  reducers: {
    bookAdded: (state, action: PayloadAction<Book>) => {
      state.ids.push(action.payload.id)
      state.entities[action.payload.id] = action.payload
    },
    bookRemoved: (state, action: PayloadAction<string>) => {
      delete state.entities[action.payload]
      state.ids = state.ids.filter((id) => id !== action.payload)
    },
  },
})
```

这里的关键不是 Immer 语法，而是“新增和删除都维护两个索引”。更新一个实体时只触碰对应的 `entities[id]`，不需要重建整棵嵌套树。

### 4. 展示结构在 Selector 中派生

组件通常想要作者名称，而不是只拿到 `authorId`。不要把作者名称再写回每本书；用 Selector 在读取时组合：

```ts
type RootState = {
  books: EntityState<Book>
  authors: EntityState<Author>
}

/** 把规范化表派生为列表需要的行。 */
const selectBookRows = (state: RootState) =>
  state.books.ids.map((id) => {
    const book = state.books.entities[id]
    return {
      ...book,
      authorName: state.authors.entities[book.authorId]?.name ?? '未知作者',
    }
  })
```

Selector 是读取边界：Redux state 保留源事实，界面拿到适合渲染的形状。对于昂贵派生，可以在已有的 Selector 记忆化能力上继续优化。

## 四、设计与更新规范化集合

### 1. 每种实体保持一张表

作者、书籍和评论是不同实体类型，各自拥有 `ids` 与 `entities`。书籍保存 `authorId`，评论保存 `bookId` 和 `authorId`。不要把同一作者
既放在作者表，又放在每本书的 `author` 字段中。

### 2. 列表顺序是显式状态

`entities` 是查找表，不表达顺序。若界面需要“最近添加”或“置顶”顺序，就把顺序写进 `ids`，或保存单独的排序字段并在 Selector 中排序。
不要依赖 JavaScript 对象键的枚举顺序作为产品规则。

### 3. 删除时处理关系

删除实体至少要从自己的 `ids` 和 `entities` 中移除。若其他表保存了它的 ID，还必须选择一种关系政策：级联删除、保留悬空引用并显示占位符、
或先阻止删除。Selector 应对暂时找不到关系对象的情况给出明确展示，而不是抛出不可读的异常。

### 4. 派生值不要重复存储

`authorName`、`bookCount` 或“可借阅书籍列表”都可以从实体表计算，就不应再作为第三份状态保存。重复状态会产生额外同步动作，也会让调试时难以判断哪一份是源事实。

## 五、用法与示例

### 1. 读取列表与详情

列表按 `ids` 遍历，详情按选中的 ID 查表：

```ts
const selectAllBooks = (state: RootState) =>
  state.books.ids.map((id) => state.books.entities[id])

const selectBookById = (state: RootState, bookId: string) =>
  state.books.entities[bookId]
```

列表查询和详情查询共享同一份实体事实。`selectAllBooks` 需要注意结果数组是派生值；若组件对引用稳定性敏感，应使用记忆化 Selector 或拆分读取。

### 2. 局部更新与引用边界

更新 `books.entities['book-1']` 时，作者表可以保持原引用。订阅作者的组件无需因为书名变化而重新渲染；订阅书籍的组件则会看到对应实体变化。
这正是标准化结构能帮助局部更新的原因，但最终仍要由 Selector 和组件订阅边界决定实际渲染范围。

### 3. 何时使用更高层工具

手工写 `ids`、`entities` 适合学习不变量，或需要非常特殊的数据结构。常规集合的新增、更新、删除和 Selector 生成存在重复时，
`createEntityAdapter` 可以提供统一实现。若数据主要是服务端缓存，还要评估 RTK Query 或 TanStack Query 的缓存职责，
不要为了“看起来规范”把所有网络响应永久复制到客户端状态。

### 4. Demo：观察规范化表与关系派生

:::demo{id="react.redux.learn.intermediate.normalized-state.normalized-state-demo"}
:::

Demo 把作者和书籍分别存放在两张实体表中。左侧用 `books.ids` 选择书籍，右侧通过 `authorId` 派生作者名称；更新书名或借阅状态只修改书籍实体，
不会复制作者对象。新增和删除操作会同时显示 `ids` 与 `entities`，方便观察两种索引必须一起变化。

## 六、易错使用提示

:::pitfalls
### 错误：在父对象中复制完整实体

**触发条件：** 每本书都保存一份 `author` 对象，同时又维护 `authors.entities`。

**原因：** 嵌套数据来自接口响应，直接照搬了响应形状，没有先确定 Redux state 的源事实。

**后果：** 更新作者时必须同步多份副本，遗漏任何一份都会出现不一致。

**错误示例：**

```ts
books.entities['book-1'].author = { id: 'ada', name: 'Ada Lovelace' }
```

**正确写法：**

```ts
books.entities['book-1'].authorId = 'ada'
authors.entities.ada = { id: 'ada', name: 'Ada Lovelace' }
```

**验证方式：** 修改作者名称后，所有通过 `authorId` 查询的书籍详情都显示同一个新名称。

### 错误：只维护 `entities`，忘记 `ids`

**触发条件：** 新增或删除实体时只写查找表，不更新列表 ID。

**原因：** 把查找表误认为是集合的全部状态，忽略了列表顺序也是状态合同的一部分。

**后果：** 详情可以查到实体，但列表不显示；或者删除后列表仍出现已删除 ID。

**错误示例：**

```ts
state.entities[action.payload.id] = action.payload
```

**正确写法：**

```ts
state.ids.push(action.payload.id)
state.entities[action.payload.id] = action.payload
```

**验证方式：** 新增、删除各执行一次，检查 `ids` 中的每个 ID 都能在 `entities` 中找到且没有多余键。

### 错误：把派生字段写回实体

**触发条件：** 在书籍实体中保存 `authorName`、`isAvailable` 等可由其他字段计算的值。

**原因：** 为了让组件少写一次查询，把读取结果误当成源事实。

**后果：** 作者改名或借阅状态改变后，派生字段可能没有同步更新。

**错误示例：**

```ts
state.entities[id].authorName = authors.entities[state.entities[id].authorId].name
```

**正确写法：**

```ts
const selectBookRow = (state: RootState, id: string) => {
  const book = state.books.entities[id]
  return { ...book, authorName: state.authors.entities[book.authorId]?.name ?? '未知作者' }
}
```

**验证方式：** 只修改作者实体，Selector 读取到的新作者名应立即变化，而无需额外派发同步 action。

### 错误：依赖对象键顺序表示业务排序

**触发条件：** 使用 `Object.values(entities)` 直接作为“最近添加”列表。

**原因：** 查找表的键枚举顺序不是明确的产品排序字段。

**后果：** 合并数据、删除后重建或排序规则改变时，列表顺序不可预测。

**错误示例：**

```ts
const books = Object.values(state.books.entities)
```

**正确写法：**

```ts
const books = state.books.ids.map((id) => state.books.entities[id])
```

**验证方式：** 改变 `ids` 的顺序但不改变 `entities`，列表应按 `ids` 的新顺序显示。

### 错误：删除实体后留下未处理的关系引用

**触发条件：** 删除作者，却让书籍继续假定 `authors.entities[authorId]` 一定存在。

**原因：** 删除策略没有和关系模型一起设计。

**后果：** Selector 读取 `undefined.name` 并在渲染时抛错，或显示错误的旧数据。

**错误示例：**

```ts
const authorName = state.authors.entities[book.authorId].name
```

**正确写法：**

```ts
const authorName = state.authors.entities[book.authorId]?.name ?? '未知作者'
```

**验证方式：** 删除或暂时缺失关系对象时，详情仍能显示明确占位文本，并由业务规则决定是否允许保存。
:::

## 七、原理与适用场景

### 1. 扁平状态减少更新传播

Redux 的标准化状态指南把实体表比作数据库表：一份实体定义只保存一次，其他对象通过 ID 连接。更新作者时只替换作者表中的一项，
依赖该作者的 Selector 再根据 ID 派生新结果。这样可以把写入范围从“整棵嵌套树”缩小为“一个实体记录”。

### 2. 规范化不是自动解决关系的工具

`ids` 与 `entities` 只规定了集合形状，不会自动决定级联删除、排序、分页或关系缺失如何处理。Selector 和 reducer 仍然需要表达这些业务规则。
当集合 CRUD 代码趋于重复时，可以使用 `createEntityAdapter`，但它仍然需要清晰的实体边界和关系政策。

### 3. 客户端状态与服务端缓存的边界

标准化适合客户端需要频繁按 ID 更新和组合关系的事实。若主要需求是请求缓存、失效、重新获取和并发订阅，应先评估专门的数据获取工具；
不要把规范化状态当成服务端缓存策略的替代品。

## 八、练习

:::exercise
### 实现规范化的任务表

**要求：** 使用 `createSlice` 创建 `tasks` 状态，形状必须是 `{ ids: string[]; entities: Record<string, Task> }`。提供
`taskAdded`、`taskToggled` 和 `taskRemoved` 三个 action：新增任务同时写入 `ids` 与 `entities`；切换任务只更新对应实体；
删除任务同时移除两个索引。再写一个 `selectVisibleTasks` Selector，按 `ids` 顺序返回实体，并过滤已完成任务。

**验收：** 连续新增、切换和删除后，`ids` 中的每个 ID 都能在 `entities` 中找到；`selectVisibleTasks` 不改变 state，且返回顺序与 `ids` 一致。

**参考答案：**

```ts
import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'

type Task = {
  id: string
  title: string
  completed: boolean
}

type TasksState = {
  ids: string[]
  entities: Record<string, Task>
}

const initialState: TasksState = {
  ids: [],
  entities: {},
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /** 新增任务并维护 ids 与 entities 两个索引。 */
    taskAdded: (state, action: PayloadAction<Task>) => {
      if (state.entities[action.payload.id]) return
      state.ids.push(action.payload.id)
      state.entities[action.payload.id] = action.payload
    },
    /** 切换指定任务的完成状态。 */
    taskToggled: (state, action: PayloadAction<string>) => {
      const task = state.entities[action.payload]
      if (task) task.completed = !task.completed
    },
    /** 删除任务并同步移除两个索引中的记录。 */
    taskRemoved: (state, action: PayloadAction<string>) => {
      delete state.entities[action.payload]
      state.ids = state.ids.filter((id) => id !== action.payload)
    },
  },
})

type RootState = {
  tasks: TasksState
}

/** 按 ids 顺序返回仍未完成的任务。 */
const selectVisibleTasks = (state: RootState): Task[] =>
  state.tasks.ids.flatMap((id) => {
    const task = state.tasks.entities[id]
    return task && !task.completed ? [task] : []
  })

export const { taskAdded, taskToggled, taskRemoved } = tasksSlice.actions
export const tasksReducer = tasksSlice.reducer
export { selectVisibleTasks }

const store = configureStore({ reducer: { tasks: tasksReducer } })
store.dispatch(taskAdded({ id: 'task-1', title: '整理目录', completed: false }))
store.dispatch(taskAdded({ id: 'task-2', title: '补充关系说明', completed: false }))
store.dispatch(taskAdded({ id: 'task-3', title: '检查示例', completed: false }))
store.dispatch(taskToggled('task-1'))
store.dispatch(taskRemoved('task-2'))

const stateAfterActions = store.getState()
const taskState = stateAfterActions.tasks
const everyIdHasEntity = taskState.ids.every((id) => Boolean(taskState.entities[id]))
const stateSnapshot = JSON.stringify(stateAfterActions)
const visibleTasks = selectVisibleTasks(stateAfterActions)
const visibleIds = visibleTasks.map((task) => task.id)
const expectedVisibleIds = taskState.ids.filter((id) => !taskState.entities[id]?.completed)

if (!everyIdHasEntity) throw new Error('ids 与 entities 不一致')
if (JSON.stringify(visibleIds) !== JSON.stringify(expectedVisibleIds)) {
  throw new Error('selectVisibleTasks 顺序或过滤结果不正确')
}
if (JSON.stringify(store.getState()) !== stateSnapshot) {
  throw new Error('Selector 不应修改 state')
}

console.log('规范化任务表验收通过', taskState, visibleTasks)
```
:::

## 九、本节小结

- 标准化状态用 `ids` 保存顺序，用 `entities` 保存按 ID 查找的唯一实体。
- 关系字段保存 ID，展示层通过 Selector 组合出作者名称等派生结构。
- 新增和删除必须同时维护两个索引，更新只触碰受影响实体。
- 排序、关系删除政策和缺失占位符都要显式设计，不能依赖对象键顺序或隐含行为。
- 手写模型用于理解不变量；常规集合的重复 CRUD 可以交给 `createEntityAdapter`。

## 十、参考资料

- [Redux Normalizing State Shape](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape) - 标准化关系数据的状态设计与组织方式。
- [Redux Fundamentals Part 7 Standard Redux Patterns](https://redux.js.org/tutorials/fundamentals/part-7-standard-patterns) - 使用查找表和 ID 数组保存实体集合。
- [Redux Essentials Part 6 Performance and Normalizing Data](https://redux.js.org/tutorials/essentials/part-6-performance-normalization) - 规范化读取、性能与 `createEntityAdapter` 引入。
- [Redux Toolkit Usage Guide Managing Normalized Data](https://redux-toolkit.js.org/usage/usage-guide#managing-normalized-data) - adapter 的标准状态形状、CRUD reducer 和 Selector。
- [Redux Style Guide Keep State Minimal](https://redux.js.org/style-guide/#keep-state-minimal-and-derive-additional-values) - 保持源状态最小化并在读取时派生。
- [Redux Toolkit npm latest package metadata](https://registry.npmjs.org/@reduxjs%2ftoolkit/latest) - 核验本课使用的最新稳定版本。
- [Redux npm latest package metadata](https://registry.npmjs.org/redux/latest) - 核验 Redux 稳定版本。
- [React Redux npm latest package metadata](https://registry.npmjs.org/react-redux/latest) - 核验 React Redux 稳定版本。
