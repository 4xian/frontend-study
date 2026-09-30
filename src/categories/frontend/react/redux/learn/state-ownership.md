---
id: react.redux.learn.basics.state-ownership
type: lesson
title: Redux 状态所有权
summary: 根据共享范围、生命周期和数据来源判断状态应放在 Redux、组件、URL 或服务端缓存中。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - react.redux.learn.basics.multiple-slices-root-state
related: []
tags:
  - Redux Toolkit
  - 状态所有权
  - 全局状态
  - 局部状态
  - 派生数据
  - 表单状态
appliesTo: React Redux 9.3.0、Redux Toolkit 2.12.0、Redux 5.0.1、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能根据多个组件的共享需求判断一段状态是否属于 Redux。
  - 能区分全局状态、组件局部状态、URL 状态、服务端状态和派生值。
  - 能让表单草稿保留在组件内，并在提交时一次性派发 Redux action。
  - 能避免把重复、短暂或可计算的值写入 Redux store。
  - 能为状态选择唯一且清晰的所有者。
recap:
  - Redux 负责跨组件、跨路由或跨功能共享且需要统一更新的客户端状态。
  - 只服务一个组件的短暂交互状态应保留在最近的 React 组件中。
  - 可由现有状态计算出的值属于派生数据，不应再保存一份副本。
  - 可分享、可恢复的筛选条件适合放入 URL；远程数据缓存应由服务端状态工具负责。
  - 表单编辑中的草稿通常是局部状态，提交后的业务结果才可能成为全局状态。
sources:
  - title: Redux Style Guide：Evaluate Where Each Piece of State Should Live
    url: https://redux.js.org/style-guide#evaluate-where-each-piece-of-state-should-live
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
    claims:
      - Redux 不要求应用中的每个值都放入 store，局部值通常应保留在最近的 UI 组件中。
      - 状态切片应按主要数据域或功能域命名，而不是按具体组件命名。
  - title: Redux Essentials：Redux Toolkit App Structure
    url: https://redux.js.org/tutorials/essentials/part-2-app-structure
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、React Redux 9.3.0
    claims:
      - 全局状态放入 Redux store，单个位置需要的状态留在 React 组件中。
      - 大多数表单编辑值应保留在表单组件中，完成编辑后再派发更新 store 的 action。
  - title: Redux：Deriving Data with Selectors
    url: https://redux.js.org/usage/deriving-data-selectors
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
    claims:
      - Redux state 应保持最小，过滤列表、汇总值等可由现有状态计算的结果应在状态外派生。
      - selector 可以从多个 slice 读取原始数据，并按组件需要塑形。
  - title: Redux FAQ：Organizing State
    url: https://redux.js.org/faq/organizing-state
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
    claims:
      - 使用 Redux 还是 React 的 useState 没有绝对答案，应根据状态的使用范围与生命周期决定。
      - 大多数表单状态不需要放进 Redux，但跨组件协作的编辑状态可以例外。
  - title: React：Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - React 状态应避免冗余、重复和互相矛盾的字段。
      - 每段状态应有明确的所有者，需要共享时提升到最近的共同父级。
  - title: React Router 8.3.0 useSearchParams API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useSearchParams.md#L19-L115
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useSearchParams 从当前 URL 读取查询参数，并通过 setter 触发导航更新 URL。
      - 查询参数适合作为可分享、可恢复的 URL 状态载体。
  - title: Redux Toolkit 2.12.0 RTK Query Overview
    url: https://redux-toolkit.js.org/rtk-query/overview
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - RTK Query 为服务端数据提供数据获取与缓存能力，适合作为服务端状态管理边界。
  - title: Redux 5.0.1 combineReducers Source
    url: https://github.com/reduxjs/redux/blob/v5.0.1/src/combineReducers.ts
    sourceType: source-code
    appliesTo: Redux 5.0.1
    claims:
      - 组合 reducer 按 reducer 映射键读取和写入各状态分支，Redux store 是统一客户端状态的承载边界。
---

# Redux 状态所有权

## 一、学习目标

- 根据共享范围、生命周期和数据来源判断一段状态是否属于 Redux。
- 区分全局状态、组件局部状态、URL 状态、服务端状态和派生值。
- 让表单草稿留在组件内，只在提交时派发 Redux action。
- 避免把重复、短暂或可计算的值写入 Redux store。
- 为每段状态选择唯一且清晰的所有者。

## 二、先问“谁需要它”

状态所有权不是“所有状态都放 Redux”，而是为每段状态指定一个最合适的持有者。判断时先看它是否需要被多个相距较远的组件读取或更新，是否需要跨路由保留，是否需要统一记录业务事件，以及它的生命周期是否超出当前组件。

如果一段状态只服务一个按钮、一个弹窗或一个输入框，放在最近的组件里通常更直接。组件销毁时它也会自然结束，不会让全局 store 承担短暂的 UI 细节。

如果多个组件需要观察同一份客户端业务状态，Redux 可以成为它的唯一来源。组件通过 selector 读取，通过 action 表达更新意图；组件之间不再各自维护一份副本。

## 三、五类状态的归属判断

### 1. Redux 客户端状态

适合放入 Redux 的状态通常满足以下一个或多个条件：

- 多个不相邻的组件需要读取或更新它。
- 它代表应用正在处理的业务事实，而不是某个控件的瞬时细节。
- 多个功能需要围绕它协调行为，并且更新应该留下统一的 action 记录。
- 它需要在路由切换、组件卸载或局部 UI 重建后继续存在。

例如当前工作流阶段、已提交的工作区备注、当前登录用户和跨页面筛选结果，都可能是全局客户端状态。切片应按 `workspace`、`auth`、`filters` 这样的数据域命名，而不是按 `Header`、`Sidebar` 这样的组件命名。

### 2. React 组件局部状态

只在一个组件内有意义的值通常属于局部状态：

- 下拉菜单是否打开。
- 输入框正在编辑的草稿。
- 鼠标悬停、焦点或拖拽中的临时标记。
- 只影响当前组件的折叠、分页预览或动画阶段。

局部状态不等于低价值状态。它只是有更窄的所有者和更短的生命周期。把这类值放进 Redux 会增加 action、selector 和订阅，却没有带来共享收益。

### 3. URL 状态

需要复制链接、刷新后恢复或参与导航语义的状态应优先考虑 URL，例如搜索关键词、分页、排序和当前筛选条件。React Router 的 `useSearchParams` 可以读取查询参数并通过 setter 更新 URL，因此 URL 是这段状态的可分享来源。Redux 可以在确有跨功能协作需要时读取它的结果，但不应无条件再保存一份相同副本。

### 4. 服务端状态

服务端返回的数据有请求、缓存、过期、重试和失效等生命周期。它与“用户在浏览器中编辑的客户端业务状态”不是同一所有权问题。应使用 RTK Query 这类专门的服务端状态工具管理远程缓存，不把所有响应数据长期复制到 Redux store。本课只确定边界，不展开远程缓存 API。

### 5. 派生数据

如果一个值可以从现有 state、props 或 URL 在读取时计算出来，就不要再存一份可变副本。例如 `完成数量`、`过滤后的列表`、`是否全部完成` 都可以通过 selector 或渲染期间的计算得到。减少副本意味着减少同步路径，也减少“原始值变了但派生值忘记更新”的矛盾状态。

## 四、表单编辑与提交边界

表单是最容易误判所有权的地方。用户正在输入的草稿通常只属于表单组件：它频繁变化、可能尚未合法，也不一定需要被其他组件观察。提交成功后，表单再派发一个包含最终业务意图的 action，将结果交给 Redux 状态。

```tsx
const [draft, setDraft] = useState('')

function submit(): void {
  dispatch(noteCommitted(draft))
  setDraft('')
}
```

只有当编辑中的值确实需要跨组件协作、跨步骤恢复或离开页面后继续编辑时，才有理由把草稿本身提升到共享状态。即使如此，也应明确它是“编辑中的草稿”，不要让草稿和已提交业务事实共用一个含义模糊的字段。

## 五、一个可复用的判断顺序

面对一段新状态，可以按以下顺序判断：

1. 它是服务端返回并需要缓存的数据吗？是，则交给服务端状态方案。
2. 它需要通过链接分享、刷新恢复或参与导航吗？是，则优先放入 URL。
3. 它能由已有状态在读取时计算出来吗？是，则保留原始值并派生它。
4. 它只被一个组件使用，且生命周期跟随该组件吗？是，则放入局部 React 状态。
5. 剩余的跨组件客户端业务状态，再考虑放入 Redux。

这个顺序不是强制的架构模板，而是帮助发现所有权的检查表。业务需要变化时，可以重新评估状态的所有者；关键是同一时刻不要让多个位置同时声称拥有同一份真相。

## 六、Demo：观察全局状态与局部草稿

Demo 使用 `workspace` slice 保存多个组件都需要的工作流阶段和已提交备注。备注输入框的草稿只存在于 `LocalDraftPanel`，状态面板和摘要面板都只能看到提交后的 Redux 值。点击阶段按钮会立即改变全局状态；输入草稿不会改变全局备注，点击提交后两个观察区域才会一起更新。

:::demo{id="react.redux.learn.basics.state-ownership.state-ownership-demo"}
先修改局部草稿，观察已提交备注保持不变；提交后再观察两个观察区域同时读取新的 Redux 状态。
:::

## 七、易错使用提示

:::pitfalls
### 错误：把每个 UI 开关都放入 Redux

**触发条件：** 下拉菜单、弹窗或当前组件的折叠状态也创建 slice 和 action。

**原因：** 把“全局可访问”误当成“所有状态都必须全局化”。

**后果：** action、selector 和订阅数量增加，组件边界变得难以理解。

**错误示例：**

```ts
const uiSlice = createSlice({
  name: 'ui',
  initialState: { isHeaderMenuOpen: false },
  reducers: { headerMenuToggled: (state) => { state.isHeaderMenuOpen = !state.isHeaderMenuOpen } },
})
```

**正确写法：**

```tsx
const [isMenuOpen, setIsMenuOpen] = useState(false)
```

**验证方式：** 暂时卸载拥有该值的组件，确认没有其他组件需要恢复或读取它。

### 错误：把表单每次输入都派发到 Redux

**触发条件：** `onChange` 每次输入都 dispatch 一个更新 action。

**原因：** 混淆“编辑中的草稿”和“提交后的业务事实”。

**后果：** store 充满短暂、可能无效的中间值，产生没有共享收益的更新。

**错误示例：**

```tsx
<input value={note} onChange={(event) => dispatch(noteChanged(event.target.value))} />
```

**正确写法：**

```tsx
const [draft, setDraft] = useState('')
<input value={draft} onChange={(event) => setDraft(event.target.value)} />
<button type="button" onClick={() => dispatch(noteCommitted(draft))}>提交</button>
```

**验证方式：** 输入但不提交时，其他组件读取的已提交业务状态应保持不变。

### 错误：同时保存原始值和可计算副本

**触发条件：** store 同时保存 `items` 和 `completedCount`，更新 `items` 时还要手动维护计数。

**原因：** 把派生结果当成独立事实。

**后果：** 两个字段可能不同步，读取者无法判断哪个才是真实来源。

**错误示例：**

```ts
type State = { items: Item[]; completedCount: number }
```

**正确写法：**

```ts
const selectCompletedCount = (state: RootState) =>
  state.items.filter((item) => item.completed).length
```

**验证方式：** 修改原始数组后，不需要额外 dispatch 维护计数，读取时仍能得到正确结果。

### 错误：按组件命名全局 slice

**触发条件：** 把同一业务状态拆成 `HeaderState`、`SidebarState` 和 `ContentState`。

**原因：** 用当前 UI 结构代替数据域边界。

**后果：** 组件重构时状态命名和所有权一起漂移，多个 slice 还可能保存同一事实的副本。

**错误示例：**

```ts
const sidebarSlice = createSlice({ name: 'sidebar', initialState: { selectedProjectId: null }, reducers: {} })
```

**正确写法：**

```ts
const workspaceSlice = createSlice({ name: 'workspace', initialState: { selectedProjectId: null }, reducers: {} })
```

**验证方式：** 组件名称改变后，确认 slice 仍然能表达它所拥有的业务数据域。

### 错误：把 URL 或服务端缓存复制成第二份 Redux 状态

**触发条件：** URL 中已有 `?status=active`，又在 Redux 保存一份 `status`；或每次请求都把完整响应长期写入 store。

**原因：** 没有区分状态来源和客户端协作状态。

**后果：** 刷新、返回和请求失效时出现两个来源互相覆盖的竞态。

**错误示例：**

```ts
dispatch(filterChanged(new URLSearchParams(location.search).get('status')))
```

**正确写法：**

```ts
const status = new URLSearchParams(location.search).get('status') ?? 'all'
```

**验证方式：** 修改 URL 或触发缓存失效后，确认应用没有要求手动同步两份相同数据。
:::

## 八、原理与适用场景

### 1. 官方事实

Redux Style Guide 明确说明，Redux 的单一状态树是寻找全局值的统一入口，并不意味着应用中的每个值都必须写入 store。局部值通常应保留在最近的 UI 组件中；大多数表单编辑值也应留在表单组件，完成编辑后再派发 action。

React 的状态结构指南同样强调避免冗余和重复状态，并让每段共享状态拥有明确的所有者。Redux 的派生数据指南建议保持实际 state 最小，在读取时计算过滤列表、汇总值和其他派生结果。

Redux 5.0.1 的 `combineReducers` 按 reducer 映射键分别读取和写入状态分支。它提供的是统一的状态承载机制，不会替应用决定每个字段的业务所有权；所有权仍由状态的使用范围和生命周期决定。

### 2. 课程推导

可以把所有权问题简化为“来源 -> 生命周期 -> 共享范围 -> 唯一真相”：先确认数据是否来自服务端或 URL，再看它是否可由现有值派生，接着判断是否跨组件共享，最后只保留一个真正的拥有者。

### 3. 适用边界

本课覆盖 Redux 与局部 React 状态的选择、表单提交边界、URL/服务端状态边界和派生值最小化。状态持久化、服务端缓存工具的完整 API、复杂 selector 性能优化和大型应用目录拆分不在本课展开。

## 九、练习

:::exercise
### 练习目标

**要求：** 创建 `workspace` slice，保存跨组件共享的 `phase` 和 `committedNote`；创建 `WorkspaceStatusPanel` 和 `WorkspaceSummaryPanel` 读取 Redux 状态，创建 `LocalDraftPanel` 用 `useState` 保存输入草稿，只在点击提交时派发 `noteCommitted`。再提供三个阶段按钮和一个恢复按钮。不要把草稿、字符数或阶段标签副本写入 Redux。

**验收：** 阶段按钮能同时更新状态面板和摘要面板；输入草稿时 `committedNote` 不变；提交后两个面板显示新备注；恢复按钮将阶段和备注恢复初始值；store 只保存 `phase` 与 `committedNote` 两个业务字段，组件位于 `Provider` 内。

**参考答案：**

```tsx
// state-ownership-store.ts
import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'

type WorkflowPhase = 'idle' | 'working' | 'review'

type WorkspaceState = {
  phase: WorkflowPhase
  committedNote: string
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: { phase: 'idle', committedNote: '尚未提交备注' } as WorkspaceState,
  reducers: {
    phaseChanged: (state, action: PayloadAction<WorkflowPhase>) => {
      state.phase = action.payload
    },
    noteCommitted: (state, action: PayloadAction<string>) => {
      state.committedNote = action.payload.trim() || '（空备注）'
    },
    reset: (state) => {
      state.phase = 'idle'
      state.committedNote = '尚未提交备注'
    },
  },
})

const store = configureStore({
  reducer: {
    workspace: workspaceSlice.reducer,
  },
})

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch

export const { phaseChanged, noteCommitted, reset } = workspaceSlice.actions

/** 读取工作区当前阶段。 */
export const selectPhase = (state: RootState) => state.workspace.phase

/** 读取工作区已提交备注。 */
export const selectCommittedNote = (state: RootState) => state.workspace.committedNote
export type { AppDispatch, RootState, WorkflowPhase }
export { store }

// state-ownership-demo.tsx
import { useState, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import {
  noteCommitted,
  phaseChanged,
  reset,
  selectCommittedNote,
  selectPhase,
  store,
  type AppDispatch,
  type WorkflowPhase,
} from './state-ownership-store'

const phaseLabels: Record<WorkflowPhase, string> = {
  idle: '待处理',
  working: '处理中',
  review: '待复核',
}

/** 显示跨组件共享的 Redux 工作流状态。 */
function WorkspaceStatusPanel(): ReactElement {
  const phase = useSelector(selectPhase)
  const note = useSelector(selectCommittedNote)

  return (
    <section>
      <strong>Redux 全局状态</strong>
      <p>阶段：{phaseLabels[phase]}</p>
      <p>已提交备注：{note}</p>
    </section>
  )
}

/** 显示摘要组件读取的共享 Redux 工作流状态。 */
function WorkspaceSummaryPanel(): ReactElement {
  const phase = useSelector(selectPhase)
  const note = useSelector(selectCommittedNote)

  return (
    <section>
      <strong>Redux 摘要读取</strong>
      <p>阶段摘要：{phaseLabels[phase]}</p>
      <p>备注摘要：{note}</p>
    </section>
  )
}

/** 保存局部草稿，并在提交时写入 Redux。 */
function LocalDraftPanel(): ReactElement {
  const [draft, setDraft] = useState('')
  const dispatch = useDispatch<AppDispatch>()

  /** 提交局部草稿。 */
  function submitDraft(): void {
    dispatch(noteCommitted(draft))
    setDraft('')
  }

  return (
    <section>
      <strong>组件局部状态</strong>
      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
      <span>草稿字符数：{draft.length}</span>
      <button type="button" onClick={submitDraft}>提交到 Redux</button>
    </section>
  )
}

/** 提供共享阶段控制与恢复操作。 */
function WorkspaceControls(): ReactElement {
  const dispatch = useDispatch<AppDispatch>()

  /** 切换 Redux 工作流阶段。 */
  function changePhase(phase: WorkflowPhase): void {
    dispatch(phaseChanged(phase))
  }

  return (
    <div>
      <button type="button" onClick={() => changePhase('idle')}>待处理</button>
      <button type="button" onClick={() => changePhase('working')}>处理中</button>
      <button type="button" onClick={() => changePhase('review')}>待复核</button>
      <button type="button" onClick={() => dispatch(reset())}>恢复初始状态</button>
    </div>
  )
}

/** 在 Provider 内组合全局状态与局部草稿示例。 */
export function App(): ReactElement {
  return (
    <Provider store={store}>
      <WorkspaceControls />
      <WorkspaceStatusPanel />
      <WorkspaceSummaryPanel />
      <LocalDraftPanel />
    </Provider>
  )
}
```

:::

## 十、本节小结

- 状态所有权由来源、生命周期和共享范围决定，不是由“是否使用 React”或“是否使用 Redux”单独决定。
- 跨组件共享的客户端业务事实适合 Redux；单个组件的短暂 UI 状态适合局部 React 状态。
- URL 是可分享导航状态的自然来源，服务端缓存应由服务端状态工具管理。
- 可计算值应从原始状态派生，避免重复字段和互相矛盾的状态。
- 表单草稿通常留在组件内，提交后再把最终业务意图派发到 Redux。

## 十一、参考资料

- [Redux Style Guide：Evaluate Where Each Piece of State Should Live](https://redux.js.org/style-guide#evaluate-where-each-piece-of-state-should-live) - 说明全局与局部状态的判断规则。
- [Redux Essentials：Redux Toolkit App Structure](https://redux.js.org/tutorials/essentials/part-2-app-structure) - 说明 React 局部状态、全局状态和表单提交边界。
- [Redux：Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors) - 说明最小 state 与派生数据。
- [Redux FAQ：Organizing State](https://redux.js.org/faq/organizing-state) - 说明 Redux 与 React 状态的取舍。
- [React：Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - 说明避免冗余状态和确定所有者。
- [React Router 8.3.0 useSearchParams API](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useSearchParams.md#L19-L115) - 说明查询参数的 URL 读取与更新边界。
- [Redux Toolkit 2.12.0 RTK Query Overview](https://redux-toolkit.js.org/rtk-query/overview) - 说明服务端数据获取与缓存的工具边界。
- [Redux 5.0.1 combineReducers Source](https://github.com/reduxjs/redux/blob/v5.0.1/src/combineReducers.ts) - 说明 reducer 映射与统一状态树的实现边界。
