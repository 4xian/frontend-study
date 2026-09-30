---
id: react.router.learn.intermediate.form-fetcher-choice
type: lesson
title: Form 与 Fetcher 选择
summary: 根据用户意图选择导航 Form 或局部 Fetcher，让 URL、history、pending 与数据所有权保持清晰。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 90
prerequisites:
  - react.router.learn.intermediate.form-navigation-form
  - react.router.learn.intermediate.fetcher
related:
  - react.router.learn.intermediate.action-results-and-form-validation
  - react.router.learn.intermediate.navigation-pending-ui
tags:
  - React Router
  - Data Mode
  - Form
  - useFetcher
  - loader
  - action
  - 导航选择
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-21
objectives:
  - 能用“是否应该改变当前页面 location”作为 Form 与 Fetcher 的第一条选择依据。
  - 能区分 Link、Form、Fetcher 与 useNavigate 各自代表的用户或代码导航意图。
  - 能说明 Form 和 Fetcher 都会进入 Data Router 的 loader/action 数据流，而不是两套请求系统。
  - 能为可分享、可刷新、可回退的筛选条件选择 GET Form。
  - 能为行内保存、预览或局部 mutation 选择 Fetcher，并从 Fetcher 读取局部 pending 与 data。
  - 能区分 Form 的 useNavigation 状态和 Fetcher 的独立 state，不用错误的全局状态替代局部状态。
  - 能区分 useLocation 的当前已提交地址与 useNavigation.location 的待到达地址。
  - 能解释两者都可能触发 loader revalidation，但只有 Form 的普通成功提交以页面导航为目标。
  - 能解释普通 Fetcher 成功不导航，但目标返回 redirect 时会进入导航。
  - 能识别 redirect、共享 key、乐观更新、并发竞态和自定义 revalidation 仍需单独设计。
recap:
  - 用户意图要成为 URL、history 和页面上下文的一部分时，优先使用 Form。
  - 用户留在当前页面，只需要一个区域读取或提交 route 数据时，优先使用 Fetcher。
  - Link 代表用户点击进入新 URL；useNavigate 只在代码决定导航且没有直接链接或表单时使用。
  - Form 的导航状态从 useNavigation 读取；Fetcher 的局部状态从对应 Fetcher 实例读取。
  - useLocation 是当前已提交地址；导航进行中可从 useNavigation.location 读取待到达地址。
  - 两者都可以调用 loader/action；Fetcher 的 action 完成后仍可能重新验证页面 loader。
  - Fetcher 的普通成功路径不导航，redirect 是显式例外。
  - 选择的是交互语义，不是“Form 更简单”或“Fetcher 更高级”的 API 级别。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是本课核验的稳定发布版本，对应固定官方提交。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 2026-08-21 的 latest dist-tag 为 8.3.0。
  - title: React Router Form API
    url: https://reactrouter.com/8.3.0/api/components/Form
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Form 是渐进增强的 HTML form，并通过 Router 提交产生导航。
      - method、action、replace、reloadDocument 等属性分别控制数据编码、目标和导航语义。
      - GET Form 把字段编码到 URL，mutation method 交给 route action。
  - title: React Router Form vs Fetcher
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/explanation/form-vs-fetcher.md#L21-L64
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 是否需要改变 URL 和 history 是选择 Form 或 Fetcher 的首要标准。
      - Form 与 Fetcher 分别对应 navigation state 与 fetcher state/data。
  - title: React Router Link API
    url: https://reactrouter.com/8.3.0/api/components/Link
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Link 是渐进增强的客户端导航入口，适合用户点击进入新的 URL。
  - title: React Router useNavigate API
    url: https://reactrouter.com/8.3.0/api/hooks/useNavigate
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useNavigate 适合没有直接链接或表单交互、但代码需要改变 URL 的场景。
  - title: React Router useNavigation and useLocation APIs
    url: https://reactrouter.com/8.3.0/api/hooks/useNavigation
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useNavigation 提供全局导航状态和待到达 location；useLocation 返回当前已提交 location。
  - title: React Router useFetcher API
    url: https://reactrouter.com/8.3.0/api/hooks/useFetcher
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useFetcher 提供独立的 state、data、Form、load、submit 和 reset。
      - Fetcher 的普通调用不以页面导航为目标，组件应从当前 Fetcher 读取局部状态。
  - title: React Router Using Fetchers
    url: https://reactrouter.com/8.3.0/how-to/fetchers
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Fetcher 适合不需要导航的局部 loader/action 交互。
      - Fetcher mutation 完成后可以自动重新验证页面数据，并在 fetcher.data 中保留 action 结果。
  - title: React Router Actions
    url: https://reactrouter.com/8.3.0/start/data/actions
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Form 和 Fetcher 都可以把 mutation 交给 route action。
      - action 完成后 Data Router 默认重新验证相关 loader。
  - title: React Router 8.3.0 Form Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L1928-L2030
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Form 默认 method 是 get，普通提交通过 useSubmit 进入 Router 导航。
      - reloadDocument 时保留浏览器原生文档提交。
  - title: React Router 8.3.0 Fetcher DOM Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L2731-L3001
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - fetcher.Form、fetcher.load、fetcher.submit 和 fetcher.reset 绑定到当前 Fetcher key。
      - Fetcher submission 使用非导航调用路径。
  - title: React Router 8.3.0 Form Navigation Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/data-browser-router-test.tsx#L815-L899
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - GET Form 导航执行 loader，并由 location 表达提交条件。
  - title: React Router 8.3.0 Fetcher Navigation Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/data-browser-router-test.tsx#L7656-L7736
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 普通 Fetcher 调用期间 location 和全局 navigation 可以保持稳定。
  - title: React Router 8.3.0 Fetcher Redirect Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/fetchers-test.ts#L836-L909
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - Fetcher 目标返回 redirect 时 Router 会启动导航，这是普通 Fetcher 成功路径之外的显式例外。

---

# Form 与 Fetcher 选择

## 一、学习目标

- 能先问“用户是否要前往一个新的页面状态”，再决定使用 Form 还是 Fetcher。
- 能用 `Form method="get"` 把筛选、搜索和排序条件写入 URL。
- 能用 `Form method="post"` 表达页面级创建、编辑或删除，并从 `useNavigation` 观察导航提交。
- 能用 `useFetcher` 和 `fetcher.Form` 完成不改变当前 location 的行内读取或 mutation。
- 能同时观察 `navigation.state` 与 `fetcher.state`，不把局部 pending 误判为全局导航。
- 能区分“调用同一个 route action”与“交互是否以页面导航为目标”这两个问题。

## 二、先判断用户意图

`Form` 和 `Fetcher` 都属于 Data Router 的数据流。它们最终都可能匹配 route、调用 loader/action、读取
`FormData`，并在 mutation 后重新验证 loader。真正的第一问不是“哪一个 API 更新”，而是：

**核心问题：** 这次交互的成功结果，是否应该成为当前页面的 URL、history 和页面上下文？

如果答案是“应该”，使用 `Form`。例如搜索结果、筛选条件、分页、排序和一个独立的编辑页面提交，用户需要
复制链接、刷新页面或按后退恢复它们。导航本身就是交互结果的一部分。

如果答案是“不应该”，使用 `useFetcher`。例如行内收藏、悬浮预览、组合框候选项和侧栏保存，用户仍在
同一个页面上下文里，只有局部区域需要 pending 或反馈。

这个判断不等于“Form 只能 GET”或“Fetcher 只能 POST”。两者都可以读取 loader 或提交 action，差异在于
导航目标和状态归属。

## 三、把 Link 与 useNavigate 放回导航通道

选择 Form 或 Fetcher 之前，先排除两种不是表单提交的导航：

- 用户主动点击一个目标 URL 时使用 `<Link>`，需要 active 或 pending 样式时再考虑 `<NavLink>`。
- 没有直接链接或表单，但代码因为超时、自动登出等原因必须改变 URL 时，才使用 `useNavigate`。在 loader 或
  action 内需要跳转时，优先返回 `redirect`。

它们和 Form 一样属于全局 navigation 通道，会让 `useNavigation` 有机会观察 pending；Fetcher 则把状态归属给
当前实例。`useLocation()` 只返回当前已提交地址，导航进行中可以从 `useNavigation().location` 观察待到达地址。

## 四、共同的数据管线

### 1. 两者都受 Router 管理

```tsx
// 页面级意图：普通导航
<Form method="get" action="/tasks">
  <input name="q" />
</Form>

// 局部意图：非导航提交
const fetcher = useFetcher<typeof action>()

<fetcher.Form method="post" action="/tasks">
  <input name="taskId" />
</fetcher.Form>
```

上面两段都不是直接调用 `fetch`，也不是在组件事件里手工拼接 `FormData`。目标 route、请求方法、提交字段、
pending 状态与 loader revalidation 由 Data Router 统一处理。

### 2. 选择改变的是结果归属

| 比较点 | `Form` | `useFetcher` / `fetcher.Form` |
| --- | --- | --- |
| 首要语义 | 一次页面导航 | 一次局部交互 |
| 常见状态来源 | `useNavigation()` | 当前 Fetcher 的 `state` |
| GET 结果 | URL 查询和页面 loader data | Fetcher 的 loader data |
| mutation 反馈 | route action data 或页面 loader data | Fetcher `data` 与页面 loader data 分开 |
| location/history | 普通成功会参与导航 | 普通成功保持当前 location |
| 适合场景 | 搜索、筛选、分页、页面级保存 | 行内保存、预览、候选项、局部开关 |

表格最后两行描述的是普通成功路径。目标 action 返回 redirect 时，Router 仍会执行重定向；这类控制流需要
单独判断，不能用“Fetcher 永不导航”概括。

## 五、什么时候优先使用 Form

### 1. URL 是状态的一部分

搜索条件如果应该可复制、可刷新、可回退，就让 GET Form 负责编码：

```tsx
<Form method="get" action="/tasks">
  <label htmlFor="query">关键词</label>
  <input id="query" name="q" />
  <button type="submit">筛选</button>
</Form>
```

loader 从 `request.url` 读取 `q`。表单字段、当前 location 和 loader data 形成一条来源，后退和刷新不需要再
猜测组件内部 state。

### 2. 用户完成的是一次页面提交

创建、编辑或删除如果提交后应该让页面进入一个新的资源状态，使用导航 Form：

```tsx
<Form method="post" action="/tasks">
  <label htmlFor="title">标题</label>
  <input id="title" name="title" required />
  <button type="submit">保存</button>
</Form>
```

这条路径通常从 `useNavigation().state` 派生按钮 disabled，并在 action 完成后等待页面 loader 重新验证。若
页面需要消费 action 返回的校验结果，再配合 `useActionData`；本课只做选择，不重新展开字段错误模型。

### 3. Form 保留 HTML 表单语义

`label`、`name`、`required`、Enter 提交和 submit button 仍然有意义。`id` 只建立 label 关联，字段能否进入
请求集合由 `name` 和 HTML 成功控件规则决定。不要为了使用 Form 把真实表单改写成一串 `onClick`。

## 六、什么时候优先使用 Fetcher

### 1. 局部区域需要独立 pending

```tsx
const saveFetcher = useFetcher<typeof action>()
const isSaving = saveFetcher.state !== 'idle'

<saveFetcher.Form method="post" action="/tasks">
  <input name="taskId" />
  <button type="submit" disabled={isSaving}>收藏</button>
</saveFetcher.Form>
```

页面的 `useNavigation().state` 仍然可以是 `idle`，但当前按钮能从自己的 Fetcher 显示 `submitting` 或
`loading`。多个行内区域可以分别拥有状态，而不必让整个页面进入导航 pending。

### 2. URL 不应该被局部操作污染

行内收藏、弹窗保存和悬浮预览的结果不需要改变 URL。使用 `fetcher.load(href)` 读取目标 loader，或使用
`fetcher.Form` / `fetcher.submit` 调用 action；成功结果留在 Fetcher 的状态和 data 中。

```tsx
const previewFetcher = useFetcher<typeof previewLoader>()

function openPreview(taskId: number) {
  previewFetcher.load(`/tasks/${taskId}/preview`)
}
```

这不是“绕过路由”。目标仍然是一个真实 route loader，只是这次 loader 结果不提交为当前页面导航。

### 3. 局部结果与页面模型分开

Fetcher action 返回的确认消息属于 `fetcher.data`；action 后页面任务列表仍属于 route loader data。不要把一次
局部反馈当成完整页面缓存，也不要用 `fetcher.data` 取代页面 loader 的单一来源。

## 七、一个可复用的选择流程

1. **先判断结果是否需要 URL。** 需要可分享、刷新、后退或新的页面语义时，选 `Form`。
2. **再判断是否有真实表单。** 有输入、label、约束和 Enter 提交时，优先保留 `Form` 语义。
3. **如果结果只属于一个区域，选 Fetcher。** 读取或提交都可以，状态从该 Fetcher 实例读取。
4. **确认 pending 的所有者。** 页面导航看 `useNavigation`，局部交互看 `fetcher.state`。
5. **最后确认 action 后的数据来源。** 页面列表继续来自 loader；局部消息或预览留在 Fetcher data。

可以把流程压缩成一句话：

```text
页面意图 -> Form -> location/history/useNavigation
局部意图 -> Fetcher -> fetcher.state/data，location 保持
```

## 八、Demo：同一路由的两种选择

本 Demo 使用同一个 `/tasks` route，让两条路径共享 loader/action，差异只由交互语义产生：

- 左侧 GET `Form` 筛选任务。提交后 URL 增加 `?q=...`，全局 navigation 进入 `loading`，loader 根据查询返回页面数据。
- 页面级 POST `Form` 创建任务并 redirect 到详情；列表中的 `Link` 与 `useNavigate` 也会进入新的页面上下文。
- 右侧 `fetcher.Form` 提交 `taskId` 收藏。提交期间只有当前 Fetcher 显示 `submitting/loading`，URL 和全局 navigation 保持稳定。
- 右侧还用 `fetcher.load` 读取局部预览，并提供一个返回 redirect 的 Fetcher 按钮作为普通成功路径之外的例外。
- Fetcher action 成功后，页面 loader 仍重新验证；确认消息进入 `fetcher.data`，任务列表继续来自 loader data。
- 观察台同时显示 URL、待到达 navigation location、history action、loader/action 调用次数和两条状态序列，并提供重置入口。

:::demo{id="react.router.learn.intermediate.form-fetcher-choice.form-fetcher-choice-demo"}
:::

操作顺序建议：先输入 `页面` 并点击“筛选任务”，观察 URL 与 `navigation`；再点击“收藏当前任务”和“读取预览”，
观察 Fetcher 的状态序列、两个 data 区域与页面 loader 次数；最后可点击“演示 redirect 例外”确认显式 redirect
才会让局部交互进入导航。

## 九、易错使用提示

:::pitfalls
### 错误：只按 HTTP method 选择 API

**触发条件：** 看到 GET 就使用 `fetcher.load`，看到 POST 就使用 `Form`，没有先判断用户是否要导航。

**原因：** Form 和 Fetcher 都可以读取 loader 或提交 action；method 只描述数据操作，不决定交互是否属于页面。

**后果：** 搜索条件无法通过 URL 恢复，或行内保存意外改变页面 location。

**错误示例：**

```tsx
const fetcher = useFetcher()
fetcher.load('/tasks?q=页面')
```

**正确写法：** 先判断结果是否应成为 URL/history，再在 Form 或 Fetcher 内选择 GET、POST 等 method。

```tsx
<Form method="get" action="/tasks">
  <input name="q" />
</Form>
```

**验证方式：** Demo 中 GET Form 改变 `current location`，Fetcher 收藏保持同一个 `current location`。

### 错误：局部 Fetcher 只读取 useNavigation

**触发条件：** 点击行内收藏后只看全局 navigation 仍为 `idle`，就认为没有请求发生。

**原因：** Fetcher 有自己的 state；局部交互不需要把页面导航通道置为 pending。

**后果：** 按钮没有 disabled 或“保存中”反馈，用户可以重复提交。

**错误示例：**

```tsx
const isBusy = useNavigation().state !== 'idle'
```

**正确写法：** 从对应 `fetcher.state` 派生局部 pending，并让按钮和反馈区域归属同一个 Fetcher。

```tsx
const fetcher = useFetcher()
const isBusy = fetcher.state !== 'idle'
```

**验证方式：** 在 Demo 中对比 `navigation: idle` 与 Fetcher 的 `submitting -> loading -> idle`。

### 错误：用 Fetcher 保存应该可分享的筛选条件

**触发条件：** 用 `fetcher.load` 读取筛选结果，却不把条件编码进 location。

**原因：** Fetcher data 是交互结果，不是当前页面 URL 状态。

**后果：** 刷新、复制链接和后退无法稳定恢复用户刚才的筛选意图。

**错误示例：**

```tsx
const filterFetcher = useFetcher()
filterFetcher.load('/tasks?q=loader')
```

**正确写法：** 使用 GET Form，让字段 `name` 进入 URL 查询，并由 loader 读取。

```tsx
<Form method="get" action="/tasks">
  <input name="q" />
</Form>
```

**验证方式：** Demo 的 GET Form 提交后检查 `?q=...`；再点击 Fetcher 收藏，确认查询仍在原位置。

### 错误：因为共用 action 就把两条路径当成同一种交互

**触发条件：** Form 与 Fetcher 都提交到 `/tasks`，于是手工复用同一个页面 pending 或结果区域。

**原因：** route action 的目标相同，不代表导航语义和状态所有者相同。

**后果：** 局部提交覆盖页面级提示，或者页面导航遗漏 URL/history 反馈。

**错误示例：**

```tsx
const busy = navigation.state !== 'idle' || favoriteFetcher.state !== 'idle'
```

**正确写法：** 页面 Form 读取 `useNavigation`，局部提交读取对应 Fetcher；共享 action 仍由 loader/action 负责数据一致性。

```tsx
const pageBusy = navigation.state !== 'idle'
const rowBusy = favoriteFetcher.state !== 'idle'
```

**验证方式：** Demo 同时显示两条状态序列和各自的结果归属。

### 错误：把“Fetcher 不导航”当成绝对规则

**触发条件：** 认为 Fetcher 永远不会改变 location，因此忽略目标 action 的 redirect。

**原因：** 普通成功 Fetcher 调用是非导航路径，但 redirect 是 route 返回的控制流结果。

**后果：** redirect 后仍把旧页面当成当前上下文，产生错误的 UI 假设。

**错误示例：**

```tsx
const currentPath = useLocation().pathname
```

**正确写法：** 把“普通成功保持 location”作为本课主线；遇到 redirect、replace 或跨页面控制流时重新设计。

```tsx
const targetPath = useNavigation().location?.pathname ?? useLocation().pathname
```

**验证方式：** 通过目标 route 的返回值和 Router 文档确认 redirect 分支，不从本课 Demo 外推绝对保证。
:::

## 十、源码推导与课程边界

### 1. Form 的导航连接

官方 `Form` 源码默认把 method 规范为 `get`，普通提交通过 `useSubmit` 进入 Router。它仍渲染 HTML form，
因此浏览器字段收集和 submitter 语义保持可见；`reloadDocument` 则是明确选择原生文档提交的边界。

### 2. Fetcher 的局部连接

官方 Fetcher DOM 源码把 `Form`、`load`、`submit` 和 `reset` 绑定到 Fetcher key，并通过非导航调用更新该
Fetcher 的 state/data。组件可以把局部 pending 和反馈放在发起交互的区域。

### 3. 共享的 loader revalidation

两条路径都属于 Data Router。Fetcher mutation 成功后页面 loader 仍可能重新验证，所以“局部 pending”不等于
“页面数据完全隔离”。本课只观察默认流程，不展开 `shouldRevalidate`、并发取消或缓存策略。

### 4. 冻结边界

本课不展开 redirect 的完整控制流、Fetcher 共享 key、乐观更新、竞态处理、错误边界、Framework Mode 或
服务端部署。下一课再讨论 revalidation 时，仍需以具体 route 数据依赖为前提。

## 十一、练习

:::exercise
### 练习目标

**要求：** 在一个 Data Router 任务页面中实现“页面筛选”和“行内标记”两条路径：筛选使用
`Form method="get"`，标记使用 `useFetcher` 的 `fetcher.Form method="post"`，两者都调用同一个 `/tasks`
route 的 loader/action。页面同时显示 `location`、`navigation.state`、`fetcher.state`、loader/action 调用次数和
各自结果；分别保留页面 navigation 与局部 Fetcher 的状态归属；页面导航观察台放在持久 layout route 中，筛选
输入由 loader 查询值同步为受控状态。

**验收：**
提交筛选 Form 后，URL 出现查询参数，`navigation` 经历 `loading -> idle`，loader 读取查询并返回过滤结果；提交
Fetcher 后，URL 不变，`navigation` 保持 `idle`，当前 Fetcher 经历 `submitting -> loading -> idle`；点击 Link
或页面级 POST Form 后进入详情 URL，导航期间 `useNavigation().location` 是待到达地址；`fetcher.load` 经历
`loading -> idle`，预览结果进入 Fetcher data，redirect 按钮是普通成功不导航之外的显式例外；Fetcher action 的
反馈留在 `fetcher.data`，成功后页面任务来自重新验证的 loader data；页面不依赖一个共享的 `isBusy` 布尔值替代
两个 Router 状态通道。
:::

## 十二、本节小结

- Form 与 Fetcher 共享 Data Router 的 loader/action 数据流，选择关键在于交互结果是否应该成为页面导航。
- URL、history、刷新、后退和页面语义属于用户意图时，优先使用 Form。
- 行内保存、预览、候选项和局部反馈不应污染当前页面时，优先使用 Fetcher。
- 页面级 pending 从 `useNavigation` 读取，局部 pending 从当前 Fetcher 的 `state` 读取。
- 两者都可能触发 loader revalidation；Fetcher 的 action 结果仍属于 Fetcher data。
- redirect、共享 key、乐观更新、并发和自定义 revalidation 需要单独设计。

## 十三、参考资料

- React Router 8.3.0 Release (https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 本课稳定版本与固定源码起点。
- npm react-router Latest Metadata (https://registry.npmjs.org/react-router/latest) - `latest` 稳定标签核验。
- Form API (https://reactrouter.com/8.3.0/api/components/Form) - Form 属性、HTML 语义与导航提交。
- useFetcher API (https://reactrouter.com/8.3.0/api/hooks/useFetcher) - Fetcher 字段、方法和独立状态。
- Using Fetchers (https://reactrouter.com/8.3.0/how-to/fetchers) - 局部 loader/action 交互与 revalidation。
- Actions (https://reactrouter.com/8.3.0/start/data/actions) - action 调用和完成后的 loader 重新验证。
- Form DOM Source (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L1928-L2030) - Form 与 useSubmit 连接。
- Fetcher DOM Source (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L2731-L3001) - Fetcher Form/load/submit/reset 连接。
- Form Navigation Tests (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/data-browser-router-test.tsx#L815-L899) - GET Form 的 loader 导航行为。
- Fetcher Navigation Tests (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/data-browser-router-test.tsx#L7656-L7736) - Fetcher 与 location/navigation 的关系。
