---
id: react.redux.learn.intermediate.extra-reducers-action-matcher
type: lesson
title: extraReducers 与 Action Matcher
summary: 让 Slice 响应外部 action，并用类型安全的 matcher 聚合多个异步流程的横切状态。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 110
prerequisites:
  - react.redux.learn.intermediate.async-cancel-condition
related:
  - react.redux.learn.basics.create-slice
  - react.redux.learn.intermediate.async-lifecycle-state
  - react.redux.learn.intermediate.async-error-reject-with-value
tags:
  - Redux Toolkit
  - extraReducers
  - addCase
  - addMatcher
  - addDefaultCase
  - isAnyOf
  - isPending
  - isFulfilled
  - isRejected
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能解释 extraReducers 如何让 Slice 响应由其他 action creator 创建的 action。
  - 能用 addCase 精确处理一个外部 action，并理解它不会生成对应的 slice action。
  - 能用 addMatcher 和自定义类型谓词处理一组满足条件的 action。
  - 能用 isAnyOf、isPending、isFulfilled 和 isRejected 聚合多个异步 Thunk 的横切状态。
  - 能判断 addCase、addMatcher 和 addDefaultCase 的声明顺序与命中规则。
  - 能避免把过宽的 matcher 或默认分支误当成业务状态机。
recap:
  - reducers 生成属于当前 Slice 的 action，extraReducers 只响应外部 action，不会改变 slice.actions。
  - addCase 匹配一个精确 action type；addMatcher 匹配满足谓词的 action；addDefaultCase 只处理前两者都未命中的 action。
  - 多个 matcher 可以同时命中，并按声明顺序执行；命中 addCase 不会阻止 matcher。
  - builder 的顺序是 addCase 在前，addMatcher 居中，addDefaultCase 在后。
  - RTK matcher 工具同时提供运行时判断和 TypeScript 类型收窄，应优先限制在本模块关心的 action creator。
sources:
  - title: Redux Toolkit createSlice API
    url: https://redux-toolkit.js.org/api/createSlice
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - extraReducers 使用 builder callback 响应 createAction 和 createAsyncThunk 产生的外部 action。
      - builder 支持 addCase、addMatcher 和 addDefaultCase，并可由 action creator 推导 action 类型。
      - extraReducers 响应 action 但不会生成属于 Slice 的 action creator。
  - title: Redux Toolkit createReducer API
    url: https://redux-toolkit.js.org/api/createReducer
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - addCase 必须在 addMatcher 和 addDefaultCase 之前声明。
      - 多个 matcher 命中时会按声明顺序全部执行，即使已有 case reducer 命中。
      - addDefaultCase 只在没有 case reducer 和 matcher 命中时执行。
  - title: Redux Toolkit Matching Utilities API
    url: https://redux-toolkit.js.org/api/matching-utilities
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - isAnyOf 和 isAllOf 可以组合 action creator 或类型谓词并返回类型守卫。
      - isPending、isFulfilled、isRejected 和 isRejectedWithValue 可以按异步 Thunk 生命周期匹配 action。
      - matcher 工具主要用于 addMatcher，也可以用于自定义 middleware。
  - title: Redux Toolkit 2.12.0 mapBuilders Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/mapBuilders.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码记录 builder 的 case reducer、matcher 和 default reducer，并在开发环境约束声明顺序。
      - addMatcher 接受类型谓词或返回布尔值的 matcher，匹配 action 后调用对应 reducer。
  - title: Redux Toolkit 2.12.0 Matching Utilities Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/matchers.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码用 action creator 的 match 函数和异步生命周期 action type 构造类型安全的 matcher。
  - title: Redux Toolkit 2.12.0 createReducer Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createReducer.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码先收集精确 case 和所有命中的 matcher，再在没有任何命中时使用 default reducer。
      - 命中的 case 与 matcher 会按收集顺序依次应用到状态。
  - title: Redux Toolkit 2.12.0 createSlice Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createSlice.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码把 extraReducers builder 产生的 case 合并到最终 reducer，但 slice.actions 只来自当前 Slice 的 reducers。
  - title: Redux Toolkit 2.12.0 Matching Utilities Tests
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/matchers.test.ts
    sourceType: official-test
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 官方测试验证 isAnyOf 只在任一 matcher 命中时返回 true。
      - 官方测试验证 isPending、isFulfilled 和 isRejected 可以限定到指定异步 Thunk。
  - title: Redux Toolkit 2.0 Migration Guide
    url: https://redux-toolkit.js.org/usage/migrating-rtk-2
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.0+
    claims:
      - Redux Toolkit 2.0 移除了 createSlice.extraReducers 和 createReducer 的 object notation，应使用 builder callback。
  - title: Redux Toolkit Latest npm Metadata
    url: https://registry.npmjs.org/@reduxjs/toolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 核验日 npm latest 指向 Redux Toolkit 2.12.0。
---

# extraReducers 与 Action Matcher

## 一、学习目标

- 让一个 Slice 响应由其他 Slice、`createAction` 或 `createAsyncThunk` 创建的 action。
- 用 `addCase` 精确处理外部 action，用 `addMatcher` 处理一组相似 action。
- 使用 RTK 提供的 matcher 工具，集中维护多个异步流程的等待、成功和失败计数。
- 理解精确 case、多个 matcher 与默认分支的命中顺序。

## 二、为什么需要 extraReducers 和 matcher

一个 Slice 通常拥有自己的同步 action，但真实应用还会收到其他模块发出的事件。例如：

- 内容 Slice 需要响应一个在组件外定义的 `loadWorkspace.fulfilled`，把返回数据写入自己的状态。
- 全局活动面板需要同时关注多个 Thunk 的 `pending`、`fulfilled` 和 `rejected`，却不应该为每个 Thunk 重复写三套相同逻辑。
- 登录退出等跨模块事件需要清理多个 Slice，但事件的 action creator 不属于每个被清理的 Slice。

`reducers` 与 `extraReducers` 的职责不同：

```ts
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    signedOut: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(profileLoaded, (state, action) => {
      state.user = action.payload
    })
  },
})
```

`signedOut` 会生成 `sessionSlice.actions.signedOut`；`profileLoaded` 只是被这个 Slice 监听，
不会出现在 `sessionSlice.actions`。这种单向依赖让 action 的拥有者和响应它的状态模块可以分开。

## 三、核心概念

### 1. addCase 连接一个精确外部 action

`addCase` 接收 action creator 或 action type 字符串，一次只匹配一个精确类型：

```ts
const articleLoaded = createAction<Article>('articles/loaded')

const articleSlice = createSlice({
  name: 'articles',
  initialState: { current: null as Article | null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(articleLoaded, (state, action) => {
      state.current = action.payload
    })
  },
})
```

传入 action creator 时，TypeScript 可以从它的 `match` 和 payload 类型推导 `action`。这比手写字符串并自行断言 payload 更安全。

### 2. addMatcher 接收类型谓词

`addMatcher` 的第一个参数是判断 action 的函数。最有用的 TypeScript 形式是类型谓词：

```ts
type NumberAction = { type: string; payload: number }

function isNumberAction(action: { type: string }): action is NumberAction {
  return action.type.endsWith('/numberAdded')
}

const reducer = createReducer({ total: 0 }, (builder) => {
  builder.addMatcher(isNumberAction, (state, action) => {
    state.total += action.payload
  })
})
```

谓词的 `action is NumberAction` 同时告诉运行时“是否命中”和 TypeScript“命中后有哪些字段”。如果只返回 `boolean`，仍然可以匹配，
但 Reducer 中的 action 不会自动获得更窄的 payload 类型，不能靠 `as` 把未知 action 伪装成已知结构。

### 3. 用 isAnyOf 合并多个精确 action

当几个 action 需要完全相同的处理时，用 `isAnyOf` 生成一个 matcher：

```ts
const itemAdded = createAction<Item>('items/added')
const itemUpdated = createAction<Item>('items/updated')

builder.addMatcher(isAnyOf(itemAdded, itemUpdated), (state) => {
  state.lastChange = 'item'
})
```

`isAllOf` 则要求所有条件同时满足，适合把一个 action creator 与业务类型谓词组合起来。它们都返回类型守卫，能减少重复的 `if` 和重复 Reducer。

### 4. 用异步 matcher 聚合多个 Thunk

RTK 为 `createAsyncThunk` 提供按生命周期匹配的工具：

```ts
builder
  .addMatcher(isPending(loadProfile, saveProfile), (state) => {
    state.pendingCount += 1
  })
  .addMatcher(isFulfilled(loadProfile, saveProfile), (state) => {
    state.pendingCount -= 1
    state.completedCount += 1
  })
  .addMatcher(isRejected(loadProfile, saveProfile), (state) => {
    state.pendingCount -= 1
    state.failedCount += 1
  })
```

传入指定 Thunk 可以把横切状态限制在本模块真正关心的请求。无参数的 `isPending()` 等 matcher 会匹配所有带有对应异步元数据的 Thunk，
只有全局请求指示器确实需要观察所有 Thunk 时才适合使用。

### 5. addDefaultCase 是最后的兜底

`addDefaultCase` 只在没有精确 case、没有任何 matcher 命中时运行：

```ts
builder.addDefaultCase((state) => {
  state.unhandledActionCount += 1
})
```

因为每个 action 都会经过每个 reducer，默认分支很容易把初始化、开发工具或其他模块的 action 统计进去。它适合诊断或通用计数，
不适合代替明确的业务事件处理。

### 6. builder 的声明顺序与命中顺序

builder 的声明阶段必须遵守：

```text
addCase -> addMatcher -> addDefaultCase
```

`addCase` 之后可以声明多个 matcher；同一个 action 如果同时命中精确 case 和多个 matcher，所有 Reducer 都会按顺序执行。只有一个 action
完全没有命中时，才执行 `addDefaultCase`。因此 matcher 之间不要互相假设“前一个已经阻止后一个”，也不要在多个 matcher 中无意地反复覆盖同一个字段。

## 四、用法与示例

### 1. 精确数据更新与横切审计可以同时存在

一个外部 Thunk 的成功 action 可以由一个精确 case 写入业务数据，再由 matcher 记录通用审计：

```ts
builder
  .addCase(loadWorkspace.fulfilled, (state, action) => {
    state.workspace = action.payload
  })
  .addMatcher(isFulfilled(loadWorkspace, saveWorkspace), (state) => {
    state.auditCount += 1
  })
```

`loadWorkspace.fulfilled` 会同时触发这两个 Reducer。精确 case 负责知道 payload 结构的业务字段，matcher 负责不依赖具体 payload 的公共行为。

### 2. 让 matcher 的范围与状态拥有者一致

如果一个 Slice 只负责编辑器请求，就把 `isPending` 限定到编辑器的 Thunk。这样新增用户资料请求时，不会意外改变编辑器的等待计数。
真正跨应用的请求指示器可以放到专门的全局 Slice，并明确接受无参数 matcher 的广泛范围。

### 3. 用 action creator 的 match 做组件层判断

Matcher 工具也可以在派发 Promise 得到最终 action 后使用：

```ts
const result = await dispatch(saveWorkspace())

if (saveWorkspace.fulfilled.match(result)) {
  showNotice('保存成功')
} else if (saveWorkspace.rejected.match(result)) {
  showNotice(result.error.message ?? '保存失败')
}
```

Reducer 中的 `addMatcher` 和组件中的 `.match` 都是类型安全的 action 判断；它们的区别只是执行位置不同。

## 五、Demo：多个异步流程的横切活动状态

:::demo{id="react.redux.learn.intermediate.extra-reducers-action-matcher.external-action-matcher-demo"}
:::

Demo 使用两个独立的 `createAsyncThunk`：

1. “加载工作区”由 `addCase(loadWorkspace.fulfilled)` 写入标题，同时被 `isFulfilled` 和 `isAnyOf` 两个 matcher 记录。
2. “发布草稿”可以成功或失败，`isPending`、`isFulfilled`、`isRejected` 统一维护计数。
3. “重命名工作区”由自定义类型谓词 matcher 处理；“发送未命中 action”只触发 `addDefaultCase`。
4. “重置”是当前 Slice 自己的 reducer；它和外部 Thunk action 的来源不同，但都会改变同一个状态。
5. 事件列表让你看到 exact case、多个 matcher、自定义谓词和默认分支的顺序效果。

## 六、易错使用提示

:::pitfalls
### 错误：继续使用 extraReducers 的对象写法

**触发条件：** 把 action type 当作对象键传给 `extraReducers`。

**原因：** Redux Toolkit 2.0 已移除 `createSlice.extraReducers` 的 object notation，无法表达 matcher 和默认分支的 builder API。

**后果：** 开发环境抛出 object notation 已移除的错误，TypeScript 也无法获得 action creator 的 payload 推导。

**错误示例：**

```ts
extraReducers: {
  'workspace/load/fulfilled': (state, action) => {
    state.title = action.payload.title
  },
}
```

**正确写法：**

```ts
extraReducers: (builder) => {
  builder.addCase(loadWorkspace.fulfilled, (state, action) => {
    state.title = action.payload.title
  })
}
```

**验证方式：** 使用 RTK 2.x 运行初始化；正确写法能通过类型检查并注册精确 case。

### 错误：在 addMatcher 后再调用 addCase

**触发条件：** 先注册通用 matcher，再追加一个需要精确处理的 action。

**原因：** builder 需要先收集精确 case，才能保证 case 与 matcher 的确定性优先级。

**后果：** 开发环境抛出顺序错误；生产环境也不应依赖这种未遵守契约的声明顺序。

**错误示例：**

```ts
extraReducers: (builder) => {
  builder
    .addMatcher(isPending(loadWorkspace), () => {})
    .addCase(loadWorkspace.fulfilled, () => {})
}
```

**正确写法：**

```ts
extraReducers: (builder) => {
  builder
    .addCase(loadWorkspace.fulfilled, () => {})
    .addMatcher(isPending(loadWorkspace), () => {})
}
```

**验证方式：** 检查 builder 链；所有 `addCase` 都应位于第一个 `addMatcher` 之前。

### 错误：以为命中一个 matcher 就会停止后续 matcher

**触发条件：** 在第一个 matcher 中更新状态后，假设同一个 action 不会进入后面的 matcher。

**原因：** `addMatcher` 是可叠加的过滤器，RTK 会按声明顺序执行全部命中的 matcher；它没有 `switch` 的隐式 break。

**后果：** 计数或审计逻辑可能被误判为只执行一次，或者多个 matcher 反复覆盖同一字段。

**错误示例：**

```ts
builder
  .addCase(loadWorkspace.fulfilled, (state) => {
    state.lastEvent = 'loaded'
  })
  .addMatcher(isFulfilled(loadWorkspace), (state) => {
    state.lastEvent = 'fulfilled'
  })
```

**正确写法：**

```ts
builder
  .addCase(loadWorkspace.fulfilled, (state) => {
    state.title = '写入业务数据'
  })
  .addMatcher(isFulfilled(loadWorkspace), (state) => {
    state.completedCount += 1
  })
```

**验证方式：** 对同一个 action 记录两个独立计数；精确 case 和所有命中的 matcher 都应产生预期变化。

### 错误：无范围地使用 isPending()

**触发条件：** 一个编辑器 Slice 使用无参数 `isPending()`，但状态只想反映编辑器请求。

**原因：** 无参数 matcher 会匹配所有带异步请求元数据的 pending action。

**后果：** 其他模块的请求也会改变编辑器的 pending 计数，界面状态出现跨模块污染。

**错误示例：**

```ts
builder.addMatcher(isPending(), (state) => {
  state.editorPending = true
})
```

**正确写法：**

```ts
builder.addMatcher(isPending(loadWorkspace, publishWorkspace), (state) => {
  state.editorPending = true
})
```

**验证方式：** 派发一个不属于编辑器的 Thunk；限定 matcher 不应改变编辑器状态。

### 错误：用类型断言替代类型谓词

**触发条件：** matcher 只返回 boolean，却在 Reducer 中把 action 强制断言为某个 payload 类型。

**原因：** 运行时过滤条件与 TypeScript 类型之间没有可验证的联系，断言可能掩盖错误 action。

**后果：** action.payload 缺失或形状变化时，Reducer 可能读到 undefined，问题直到运行时才暴露。

**错误示例：**

```ts
const looksLikeCount = (action: { type: string }) => action.type.endsWith('/count')

builder.addMatcher(looksLikeCount, (state, action) => {
  state.total += (action as { payload: number }).payload
})
```

**正确写法：**

```ts
type CountAction = { type: string; payload: number }
const isCountAction = (action: { type: string }): action is CountAction =>
  action.type.endsWith('/count') && typeof (action as { payload?: unknown }).payload === 'number'

builder.addMatcher(isCountAction, (state, action) => {
  state.total += action.payload
})
```

**验证方式：** 删除断言并运行 TypeScript 检查；Reducer 应能从类型谓词直接访问 payload。
:::

## 七、源码推导与适用场景

### 1. builder 先登记规则，再按命中结果执行

Redux Toolkit 2.12.0 的 `mapBuilders.ts` 固定源码把 `addCase`、`addMatcher` 和 `addDefaultCase` 分别登记到 action map、matcher 列表和默认 Reducer，
并在开发环境拒绝错误顺序。`createReducer.ts` 随后先取精确 case，再收集所有返回 true 的 matcher；只有结果为空时才使用默认 Reducer。

由此可推导：把精确 payload 更新放在 `addCase`，把不依赖具体 payload 的横切行为放在 matcher，是最容易审查的职责分配。

边界是这些规则描述 Reducer builder 的公共行为；它们不意味着 matcher 可以替代业务状态机，也不意味着所有 action 都应该进入一个全局 matcher。

### 2. RTK matcher 工具是可复用的类型守卫

固定版本 `matchers.ts` 用 action creator 的 `.match` 或自定义函数判断 action；`isAnyOf` 使用“任一命中”，`isAllOf` 使用“全部命中”，
异步工具则根据 Thunk 的 `pending`、`fulfilled`、`rejected` action creator 生成对应 matcher。官方测试验证了这些组合在指定 Thunk 上的返回结果。

由此可推导：当多个 Thunk 共享状态更新规则时，传入明确的 Thunk 列表可以减少重复代码，同时保留 action payload 的类型收窄。

边界是 matcher 只判断已经到达 Reducer 的 action；它不负责启动异步任务、改变 dispatch 顺序或实现请求身份协调。

### 3. extraReducers 保持 action 所有权分离

`createSlice.ts` 的固定源码把 `extraReducers` builder 产生的 case 与当前 Slice 的 `reducers` case 合并为最终 Reducer，
但 `slice.actions` 仍只由当前 Slice 的 reducers 生成。RTK 2.0 migration guide 也要求使用 builder callback 替代已移除的对象语法。

由此可推导：跨模块响应应优先让事件由真正的业务拥有者创建，再让需要同步的 Slice 通过 `extraReducers` 订阅；不要为了让一个 Slice 能响应而复制 action creator。

边界是同一 action type 不应在同一个 Slice 中注册两个精确 case；跨模块复杂编排应留给后续 Middleware 或 Listener Middleware 课程。

## 八、练习

:::exercise
### 用 matcher 维护编辑器异步活动状态

**要求：** 创建一个可运行的 React Redux 页面。定义 `loadDocument` 和 `saveDocument` 两个 `createAsyncThunk`，分别返回文档和保存结果；用一个 `editorSlice` 的 `extraReducers`：通过 `addCase(loadDocument.fulfilled)` 写入文档，通过 `isPending(loadDocument, saveDocument)` 增加等待计数，通过 `isFulfilled(loadDocument, saveDocument)` 增加成功计数并减少等待计数，通过 `isRejected(loadDocument, saveDocument)` 增加失败计数并减少等待计数。再使用 `isAnyOf(loadDocument.fulfilled, saveDocument.fulfilled)` 增加成功审计次数。组件提供“加载”“保存”“失败保存”“重置”按钮，展示文档、计数和最近事件。

**验收：** 点击加载后文档出现且精确 case 命中；每次 Thunk 进入 pending 时等待计数加一，成功或失败后减一；成功增加成功计数和审计次数，失败只增加失败计数；加载成功 action 同时命中 `addCase`、`isFulfilled` 和 `isAnyOf`；重置回到初始状态。builder 顺序为所有 `addCase`、再所有 `addMatcher`。

**参考答案：**

```tsx
import {
  configureStore,
  createAsyncThunk,
  createSlice,
  isAnyOf,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit'
import { useState, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

type Document = { id: string; title: string }
type SaveResult = { savedAt: string }
type EditorState = {
  document: Document | null
  pendingCount: number
  completedCount: number
  failedCount: number
  auditCount: number
  exactCaseCount: number
  lastEvent: string
}
type RootState = { editor: EditorState }

const initialState: EditorState = {
  document: null,
  pendingCount: 0,
  completedCount: 0,
  failedCount: 0,
  auditCount: 0,
  exactCaseCount: 0,
  lastEvent: '尚未派发异步 action',
}

/** 模拟一个稳定的异步文档请求。 */
function waitForDocument(shouldFail = false): Promise<Document> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (shouldFail) {
        reject(new Error('保存服务不可用'))
        return
      }
      resolve({ id: 'redux', title: 'Redux 编辑器文档' })
    }, 180)
  })
}

/** 创建加载文档的异步 action。 */
const loadDocument = createAsyncThunk('editor/loadDocument', () => waitForDocument())

/** 创建可控成功或失败的保存异步 action。 */
const saveDocument = createAsyncThunk<SaveResult, boolean>(
  'editor/saveDocument',
  (shouldFail) =>
    waitForDocument(shouldFail).then((document) => ({ savedAt: document.title })),
)

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(loadDocument.fulfilled, (state, action) => {
      state.document = action.payload
      state.exactCaseCount += 1
      state.lastEvent = 'addCase：加载成功'
    })
    builder
      .addMatcher(isPending(loadDocument, saveDocument), (state) => {
        state.pendingCount += 1
        state.lastEvent = 'isPending：请求开始'
      })
      .addMatcher(isFulfilled(loadDocument, saveDocument), (state) => {
        state.pendingCount -= 1
        state.completedCount += 1
        state.lastEvent = 'isFulfilled：请求成功'
      })
      .addMatcher(isRejected(loadDocument, saveDocument), (state) => {
        state.pendingCount -= 1
        state.failedCount += 1
        state.lastEvent = 'isRejected：请求失败'
      })
      .addMatcher(isAnyOf(loadDocument.fulfilled, saveDocument.fulfilled), (state) => {
        state.auditCount += 1
        state.lastEvent = 'isAnyOf：成功审计'
      })
  },
})

const store = configureStore({ reducer: { editor: editorSlice.reducer } })
type AppDispatch = typeof store.dispatch
const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 展示异步 matcher 聚合结果并提供操作按钮。 */
function EditorPanel(): ReactElement {
  const dispatch = useAppDispatch()
  const state = useAppSelector((root) => root.editor)
  const [lastAction, setLastAction] = useState('尚未产生最终 action')

  /** 派发加载请求并记录最终 action 类型。 */
  async function load(): Promise<void> {
    const action = await dispatch(loadDocument())
    setLastAction(action.type)
  }

  /** 派发成功或失败的保存请求。 */
  async function save(shouldFail: boolean): Promise<void> {
    const action = await dispatch(saveDocument(shouldFail))
    setLastAction(action.type)
  }

  /** 清空编辑器状态与最终 action 观察结果。 */
  function reset(): void {
    dispatch(editorSlice.actions.reset())
    setLastAction('尚未产生最终 action')
  }

  return (
    <main>
      <button type="button" onClick={() => void load()}>
        加载
      </button>
      <button type="button" onClick={() => void save(false)}>
        保存
      </button>
      <button type="button" onClick={() => void save(true)}>
        失败保存
      </button>
      <button type="button" onClick={reset}>
        重置
      </button>
      <p>文档：{state.document?.title ?? '无'}</p>
      <p>等待计数：{state.pendingCount}</p>
      <p>成功计数：{state.completedCount}</p>
      <p>失败计数：{state.failedCount}</p>
      <p>成功审计：{state.auditCount}</p>
      <p>精确 case：{state.exactCaseCount}</p>
      <p>最近事件：{state.lastEvent}</p>
      <p>最终 action：{lastAction}</p>
    </main>
  )
}

/** 为练习页面提供 Redux Provider。 */
export function createApp(): ReactElement {
  return (
    <Provider store={store}>
      <EditorPanel />
    </Provider>
  )
}
```
:::

## 九、本节小结

- 用 `reducers` 创建本 Slice 的 action，用 `extraReducers` 响应外部 action。
- 单个 payload 结构明确时用 `addCase`；多个 action 共享横切行为时用 `addMatcher`。
- 优先使用限定 Thunk 列表的 `isPending`、`isFulfilled`、`isRejected` 和 `isAnyOf`。
- 所有 `addCase` 先声明，matcher 中多个命中会全部按顺序执行，默认分支只处理完全未命中的 action。
- `extraReducers` 不会把外部 action 加入 `slice.actions`，也不负责异步编排或请求身份协调。

## 十、参考资料

- [createSlice API](https://redux-toolkit.js.org/api/createSlice) - `extraReducers` builder、`addCase`、`addMatcher` 和 `addDefaultCase`。
- [createReducer API](https://redux-toolkit.js.org/api/createReducer) - builder 顺序、多个 matcher 命中和默认分支规则。
- [Matching Utilities API](https://redux-toolkit.js.org/api/matching-utilities) - `isAnyOf`、`isAllOf` 及异步生命周期 matcher。
- [Redux Toolkit 2.12.0 mapBuilders 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/mapBuilders.ts) - builder 登记与顺序约束。
- [Redux Toolkit 2.12.0 Matching Utilities 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/matchers.ts) - action creator match 和异步生命周期 matcher 的实现。
- [Redux Toolkit 2.12.0 createReducer 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createReducer.ts) - case、matcher 和 default 的执行收集顺序。
- [Redux Toolkit 2.12.0 createSlice 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createSlice.ts) - extraReducers 与 slice.actions 的合并边界。
- [Redux Toolkit 2.12.0 matcher 官方测试](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/matchers.test.ts) - matcher 工具的运行时与类型安全行为。
- [Migrating to RTK 2.0](https://redux-toolkit.js.org/usage/migrating-rtk-2) - object notation 移除和 builder callback 迁移。
