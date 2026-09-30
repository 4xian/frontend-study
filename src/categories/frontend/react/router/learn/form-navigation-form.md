---
id: react.router.learn.intermediate.form-navigation-form
type: lesson
title: Form 导航表单
summary: 使用 React Router Form 保留原生表单语义，并把 GET 与 mutation 提交接入 Data Router 导航。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 95
prerequisites:
  - react.router.learn.intermediate.action-data-submission
related:
  - react.router.learn.intermediate.loader-data-loading
  - react.router.learn.intermediate.navigation-pending-ui
tags:
  - React Router
  - Data Mode
  - Form
  - FormData
  - URLSearchParams
  - useNavigation
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-21
objectives:
  - 能说明 React Router Form 与原生 HTML form 的关系，以及它为什么属于导航入口。
  - 能使用未指定 action 的 GET Form 把字段编码为 URL 查询并重新执行 loader。
  - 能使用显式 action 的 POST Form 把字段作为 FormData 交给目标 route action。
  - 能判断 action 是最近 route、显式路径还是相对路径解析出的目标。
  - 能保留 name、label、button type 与 Enter 提交等原生表单语义。
  - 能使用 useNavigation 观察 Form 导航的 loading、submitting 与 idle 状态。
  - 能区分 Form 的导航提交与尚未展开的 action 结果、Fetcher 和手工重新验证。
recap:
  - Form 是渐进增强的 HTML form，JavaScript 加载后由 Data Router 接管提交。
  - method 默认是 get；GET 使用 URL 查询，POST 等 mutation 使用 FormData。
  - action 未指定时解析当前 route，显式 action 可以把提交指向另一个 route。
  - Form 会触发导航，因此会影响 URL 或 history；不应把它当成只在当前页面写入的局部请求。
  - Form 的原生属性仍然重要，name 决定字段是否进入提交数据。
  - navigation.formMethod、navigation.formAction 与 navigation.formData 可以观察当前提交。
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
  - title: React Router Actions
    url: https://reactrouter.com/8.3.0/start/data/actions
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Form 以声明式方式调用 route action。
      - GET 与 mutation submission 的数据编码和调用入口不同。
      - action 完成后页面 loader data 会自动重新验证。
  - title: React Router Form API
    url: https://reactrouter.com/8.3.0/api/components/Form
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Form 是渐进增强的 HTML form，并通过 fetch 连接到 action。
      - action、method、relative、replace、reloadDocument 与 navigate 等公开属性有各自边界。
      - 未指定 action 时默认使用最近 route。
  - title: React Router 8.3.0 Form Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L1928-L2030
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Form 默认 method 为 get，渲染时把非 GET method 映射为原生 post 属性。
      - 普通提交阻止浏览器默认提交并交给 useSubmit，reloadDocument 时保留原生提交。
      - submitter 的 formaction、formmethod 和 formenctype 可以覆盖 form 属性。
  - title: React Router 8.3.0 useFormAction Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L2677-L2730
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 未指定 action 时解析最近 route URL。
      - 未指定 action 时保留当前 search，并处理 index route 的 index 参数。
      - relative 默认按 route 层级解析。
  - title: React Router 8.3.0 Form Submission Helpers
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/dom.ts#L6-L22
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - defaultMethod 是 get。
      - FormData 由原生 form 和 submitter 共同收集，字段依赖 form control 的 name。
  - title: React Router 8.3.0 Form Navigation Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/data-browser-router-test.tsx#L815-L899
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - GET Form 导航执行 loader 而不执行 action。
  - title: React Router 8.3.0 Form Mutation Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/data-browser-router-test.tsx#L1258-L1362
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - POST Form 导航执行目标 action，并在完成后重新执行 loader。
  - title: React Router 8.3.0 Form History Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/data-browser-router-test.tsx#L1866-L1979
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - GET Form 默认使用 PUSH 导航。
      - 当前地址上的 mutation submission 默认使用 REPLACE；显式 replace 和 redirect 会改变这个结果。
  - title: MDN HTML form element
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
    sourceType: official-reference
    appliesTo: HTML Living Standard
    claims:
      - form 的 action、method、name 和成功控件规则构成浏览器原生提交合同。

---

# Form 导航表单

## 一、学习目标

- 能解释 React Router `Form` 为什么不是一个普通的状态组件，而是 Data Router 的导航提交入口。
- 能用 `method="get"` 让筛选字段进入 URL，并从 loader 读取查询参数。
- 能用 `method="post"` 和 `action` 把表单字段交给目标 route action。
- 能识别未指定 `action`、显式 action 与相对 action 的解析差异。
- 能保留原生表单的 `name`、`label`、按钮类型、键盘提交与约束验证语义。
- 能从 `useNavigation` 判断 Form 导航当前处于 `loading`、`submitting` 还是 `idle`。
- 能把 Form 导航与不改变 URL 的其他提交能力分开，避免在本课提前混合不同抽象。

## 二、为什么需要 Form

原生 `<form>` 已经解决了字段收集、键盘提交、浏览器约束验证和没有 JavaScript 时的基础导航。Data Router
应用还需要在提交期间读取 pending 状态、调用 route action、完成 loader revalidation，并让这些行为与
客户端路由保持一致。

`Form` 把两者接在一起。它渲染为 HTML `form`，因此仍然使用 `name`、`method`、`action` 和 submit button
等浏览器语义；在 Data Mode 中，JavaScript 接管提交，把数据交给 Router，再把导航状态暴露给
`useNavigation`。页面不需要把表单改造成一组点击事件，也不需要手工拼接查询字符串。

Form 的关键判断是“这次提交是否应该产生导航”：

| 用户意图 | Form method | 数据形态 | 主要路由结果 |
| --- | --- | --- | --- |
| 搜索、筛选或排序 | `get` | URL 查询参数 | loader 重新读取，URL 表达当前条件 |
| 创建、更新或删除 | `post`、`put`、`patch`、`delete` | FormData | 目标 action 处理，完成后 loader 默认重新验证 |

本课 Demo 使用 GET 筛选和 POST 创建两条路径。两条路径都是真实的 Data Router 导航，不是只更新组件内部
state 的模拟器。

## 三、Form 的最小模型

### 1. Form 仍然是 HTML form

```tsx
import { Form } from 'react-router'

function SearchForm() {
  return (
    <Form method="get" action="/tasks">
      <label htmlFor="query">关键词</label>
      <input id="query" name="q" />
      <button type="submit">筛选</button>
    </Form>
  )
}
```

`Form` 的 JSX 写法接近原生 form，但它的提交目标是 Data Router。`label` 通过 `htmlFor` 关联输入框，
`name="q"` 决定字段键，`type="submit"` 让 Enter 和按钮点击走同一条表单提交路径。

### 2. method 决定数据入口

```tsx
<Form method="get" action="/tasks">
  <input name="q" />
</Form>

<Form method="post" action="/tasks">
  <input name="title" />
</Form>
```

GET 使用 URL 查询参数，适合可分享、可刷新和可回退的筛选条件。POST 等 mutation method 使用 FormData，
目标 route 需要声明 `action` 才能处理写入。Router 的导航状态会使用大写 method，例如 `GET` 与 `POST`。

### 3. action 选择提交目标

显式写 `action` 时，Form 把提交送到该路径：

```tsx
<Form method="post" action="/tasks">
  <input name="title" />
</Form>
```

不写 `action` 时，Form 使用当前最近 route 的 URL。这个默认值很适合“当前页面提交到自己的 loader/action”
的场景，也能保留当前 URL 的 search。不要把未指定 action 误解成“直接调用当前组件里的函数”。

## 四、GET Form 导航

### 1. 字段进入 URL

```tsx
<Form method="get" action="/tasks">
  <input name="q" defaultValue="loader" />
  <button type="submit">筛选任务</button>
</Form>
```

输入 `loader` 后提交，目标 URL 会包含 `?q=loader`。loader 从 `request.url` 读取查询参数：

```tsx
async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') ?? ''
  return loadTasks(query)
}
```

这条路径没有进入 action。它是一次导航，页面的当前 location 变化，匹配 route 的 loader 重新执行，组件再
消费新的 loader data。

### 2. GET 是可回退的页面状态

筛选条件写入 URL 后，刷新、复制链接和浏览器后退都能保留或恢复这个条件。这里的 URL 不是为了记录组件
内部 state，而是用户意图的一部分。

如果筛选字段没有 `name`，它不会进入 FormData，也不会被编码到查询参数。`id` 只负责与 label 建立关联，
不能替代 `name`。

### 3. GET Form 与 loader 的责任边界

Form 负责产生导航和字段编码，loader 负责读取 URL 并准备数据。不要在 Form 的 `onChange` 中复制一套筛选
数据，也不要在提交后手工拼接 `window.history`。让 Router 的 location 和 loader data 保持同一条来源。

## 五、POST Form 进入 Action

### 1. 用显式 action 提交写入

```tsx
<Form method="post" action="/tasks">
  <label htmlFor="title">任务标题</label>
  <input id="title" name="title" required />
  <button type="submit">添加任务</button>
</Form>
```

Router 收到 POST 后，会匹配 `/tasks`，调用该 route 的 action。action 仍按上一课的方式从 Request 读取
FormData：

```tsx
async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const title = formData.get('title')
  if (typeof title !== 'string' || title.trim() === '') return null

  await createTask(title.trim())
  return null
}
```

本课观察 Form 如何触发这条路径，不读取 action result，也不在页面展示字段错误。提交完成后，Router 默认让
当前匹配 loaders 重新读取数据，组件继续从 loader data 渲染任务列表。

### 2. 不要直接调用 action

```tsx
// 不要在按钮事件里直接调用 action
await tasksAction({ request })
```

action 需要 Router 构造的 Request、目标匹配和导航生命周期。使用 `<Form>` 才能同时观察真实的 URL、
`navigation.formData`、pending 状态和 loader revalidation。

### 3. Form 是一次导航提交

POST Form 不只是“保存当前组件的值”。它可能改变 location、history 和匹配数据，默认的提交行为还会根据
是否是当前地址决定 history 处理方式。需要改变默认 history 语义时才使用 `replace`，不要把它当作提交成功
的标记。

## 六、action 与相对路径

### 1. 当前 route 默认 action

```tsx
function TaskPage() {
  return (
    <Form method="post">
      <input name="title" />
      <button type="submit">保存</button>
    </Form>
  )
}
```

不指定 action 时，Router 根据最近 route context 解析当前提交地址。这个默认值让页面组件可以与自己的
route object 一起移动，不必重复硬编码路径。

### 2. 显式 action 适合跨 route 提交

```tsx
<Form method="post" action="/tasks">
  <input name="title" />
</Form>
```

当页面展示的是 `/tasks/new`，但写入由 `/tasks` route 的 action 负责时，显式 action 让目标清楚可读。目标
路径必须真实匹配包含 action 的 route；否则 mutation 没有可执行的 action。

### 3. relative 只解决路径解析模式

`action` 的相对值默认按 route hierarchy 解析。`relative="path"` 改为按斜杠分隔的 pathname 解析。
这是路径解析选项，不会把 Form 变成另一种提交 API，也不会改变 GET 与 mutation 的数据编码。

## 七、原生语义与渐进增强

### 1. 字段必须有 name

```tsx
<label htmlFor="task-title">任务标题</label>
<input id="task-title" name="title" />
```

提交集合来自成功控件。只有 `id` 没有 `name` 的输入框可以被 label 找到，却不会进入请求数据。复选框、
radio、禁用控件和重复 name 也要按 HTML form 的规则理解，不要只从 React state 推断提交结果。

### 2. 原生按钮可以覆盖本次提交

浏览器允许 submit button 使用 `formaction`、`formmethod` 和 `formenctype` 覆盖 form 默认值。Router 会
读取 submitter 的这些属性，所以同一个 Form 可以表达不同的提交按钮；本课 Demo 保持一个按钮一个意图，
避免把多个目标混在初学示例中。

### 3. JavaScript 之前仍有基本表单能力

Form 使用 HTML form API。服务器渲染页面在 JavaScript 尚未加载时仍能进行基本文档提交；JavaScript 加载后，
Data Router 接管并提供客户端导航与 `useNavigation` 状态。嵌入式内存 Router Demo 只验证接管后的 Data
Mode 行为，不冒充服务端文档部署验证。

## 八、观察 Form 导航状态

### 1. GET 主要观察 loading

GET Form 没有 action mutation，提交后通常直接进入 loader 导航的 `loading` 状态。`navigation.formMethod` 会
显示 `GET`，`navigation.formData` 可以观察正在提交的字段，完成后回到 `idle`。

### 2. POST 观察 submitting 到 loading

当 POST action 和 action 后的 loader 都有可等待工作时，状态序列可以观察为：

```text
idle
  -> submitting  FormData 正在交给 route action
  -> loading     action 完成，当前匹配 loaders 正在重新读取
  -> idle        新 loader data 已提交
```

按钮可以从 `navigation.state` 派生 disabled，状态文本可以从同一个 Router 状态派生。不要额外维护一个
容易与 Router 脱节的 `isSubmitting` 布尔值。

### 3. loading 阶段仍是同一次导航

`loading` 不是新的用户提交，也不是 action 被调用第二次。它表示 action 之后的 loader pass；此时旧的页面
仍然可见，`navigation.formMethod` 与 `navigation.formData` 可以帮助界面解释当前正在处理的提交。

## 九、Form 导航表单观察台

本 Demo 同时展示两种真实 Form：

- GET Form 显式写 `action="/tasks"`，筛选字段进入目标 URL 查询，loader 根据 `q` 返回匹配任务。
- POST Form 不写 `action`，字段以 FormData 进入当前 route action，并保留已有查询。
- 状态区显示 `idle`、`loading`、`submitting`，并记录 method、URL、history action 与调用次数。
- Router、内存数据源和计时器都由本次 factory 挂载独立创建，离开 Demo 后释放。

:::demo{id="react.router.learn.intermediate.form-navigation-form.navigation-form-demo"}
:::

操作顺序建议：先在 GET 表单输入 `loader` 并筛选，观察 URL 和任务列表变化；再在 POST 表单输入新标题并提交，
观察 `submitting -> loading -> idle`、action 次数加一和 loader 次数再次增加。两次操作都不需要点击页面之外
的控件。

## 十、易错使用提示

:::pitfalls
### 错误：把 Form 当成普通 form 并手工阻止提交

**触发条件：** 在 `<Form>` 上继续写 `onSubmit`，调用 `preventDefault()` 后再手工 `fetch` 或 `navigate`。

**原因：** 这会绕过 Form 已经提供的 route action、submission 和 navigation 状态整合。

**后果：** 页面看似提交成功，但 `navigation.formData`、目标 route 匹配和默认 revalidation 可能不再对应真实请求。

**错误示例：**

```tsx
<Form onSubmit={(event) => {
  event.preventDefault()
  void fetch('/tasks', { method: 'post' })
}} />
```

**正确写法：**

```tsx
<Form method="post" action="/tasks">
  <input name="title" />
  <button type="submit">保存</button>
</Form>
```

**验证方式：** 观察 Demo 的 action 调用次数和 `navigation.formMethod`，确认提交由 Router 记录。

### 错误：只写 id 不写 name

**触发条件：** 输入框能被 label 聚焦，但提交后 action 读不到字段。

**原因：** `id` 只关联 label，字段进入 HTML form 数据集合依赖 `name`。

**后果：** `FormData.get()` 返回 `null`，GET 查询也不会包含该字段。

**错误示例：**

```tsx
<label htmlFor="title">标题</label>
<input id="title" />
```

**正确写法：**

```tsx
<label htmlFor="title">标题</label>
<input id="title" name="title" />
```

**验证方式：** 在浏览器提交后检查 URL 查询或 action 的 FormData 键。

### 错误：GET 表单省略 method 却期待调用 action

**触发条件：** Form 没有写 method，提交后 loader 执行了，但 action 调用次数没有增加。

**原因：** Form 默认 method 是 `get`，GET submission 使用 URL 查询并进入 loader。

**后果：** 创建或更新逻辑没有运行，页面只按查询参数重新读取。

**错误示例：**

```tsx
<Form action="/tasks">
  <input name="title" />
</Form>
```

**正确写法：**

```tsx
<Form method="post" action="/tasks">
  <input name="title" />
</Form>
```

**验证方式：** 分别观察 GET Form 的 action 次数为零和 POST Form 的 action 次数增加。

### 错误：把 method 写成 HTML 不支持的任意字符串

**触发条件：** 需要 mutation 时写了拼写错误的 method，或以为任意 HTTP 动词都会被原生 form 支持。

**原因：** Form 有明确的 method 类型；原生 HTML form 只原生支持 GET 与 POST，其他 mutation 依赖 Router 接管。

**后果：** method 可能被降级或无法获得预期的渐进增强行为。

**错误示例：**

```tsx
<Form method="psot" action="/tasks" />
```

**正确写法：**

```tsx
<Form method="post" action="/tasks" />
```

**验证方式：** 检查 TypeScript 的 `HTMLFormMethod` 类型，并在 `useNavigation` 中观察规范化后的 method。

### 错误：把当前页面的 action 当成组件函数

**触发条件：** 省略 `action` 后，直接调用同名本地函数，或把 Form action 写成不可匹配的组件路径。

**原因：** `action` 是 URL，Router 会先匹配 route，再调用该 route object 的 action。

**后果：** mutation 找不到目标 action，或请求进入了错误的 route。

**错误示例：**

```tsx
<Form method="post" action="saveTask" />
```

**正确写法：**

```tsx
<Form method="post" action="/tasks" />
```

**验证方式：** 查看浏览器当前 URL 和 Demo 的 action 调用计数，确认目标 route 是 `/tasks`。

### 错误：用 onChange 代替 GET Form 导航

**触发条件：** 每次输入都手工更新 URL 或筛选列表，提交按钮只做装饰。

**原因：** 这会把表单字段、URL 和 loader data 拆成多个互不一致的状态源。

**后果：** 刷新、后退和复制链接不能稳定恢复筛选条件，页面也失去统一的 pending 导航反馈。

**错误示例：**

```tsx
<input onChange={(event) => setQuery(event.target.value)} />
```

**正确写法：**

```tsx
<Form method="get" action="/tasks">
  <input name="q" />
  <button type="submit">筛选</button>
</Form>
```

**验证方式：** 提交后刷新页面，确认 URL 查询仍能驱动 loader 返回相同结果。

### 错误：把 navigation.loading 当成 action 又执行一次

**触发条件：** 看到 POST 后的 loading 状态，再手工调用 action 或再次提交表单。

**原因：** `submitting` 表示 action 阶段，`loading` 表示 action 后的 loader revalidation 阶段。

**后果：** 一次用户操作可能写入两次，调用计数与数据列表出现重复。

**错误示例：**

```tsx
if (navigation.state === 'loading') {
  void saveTask()
}
```

**正确写法：**

```tsx
const isBusy = navigation.state !== 'idle'
<button disabled={isBusy}>保存</button>
```

**验证方式：** 提交一次 POST Form，确认 action 只增加一次，loader 在后续 pass 增加一次。

:::

## 十一、源码推导与适用场景

1. **官方事实：** 8.3.0 固定源码把 Form 默认 method 设为 `get`，通过 `useFormAction` 解析 action；未指定
   action 时使用最近 route，并保留当前 search。Form 的提交 handler 收集原生 form 和 submitter 数据，
   再调用 Router 的 submit 流程。**课程推导：** 默认 action 适合当前 route 的搜索或写入，跨 route 写入时显式
   action 更容易阅读和审查。**边界：** route hierarchy、basename 和 index route 会影响 action 解析，复杂嵌套
   路由需要以实际匹配结果验证。
2. **官方事实：** 官方测试分别证明 GET Form 执行 loader、POST Form 执行 action 并在完成后重新加载 loader。
   **课程推导：** GET 表单适合把查询条件放进 URL，mutation 表单适合把写入交给 route action。**边界：** action
   错误、redirect、字段结果消费和自定义 revalidation 会扩展这条流程，本课只观察成功导航和 loader data。
3. **官方事实：** Form 继承 HTML form 属性，并允许 submitter 用 `formaction`、`formmethod` 和 `formenctype`
   覆盖默认值。**课程推导：** 复杂页面可以用多个明确命名的提交按钮表达不同意图，同时保留键盘和可访问语义。
   **边界：** 原生浏览器只直接支持 GET 和 POST；其他 mutation method 依赖 JavaScript 接管，不等于无脚本渐进增强。
4. **官方事实：** 官方测试证明 GET Form 默认使用 PUSH；当前地址上的 mutation 默认使用 REPLACE，redirect 或显式
   `replace` 会改变结果。**课程推导：** 读取型查询通常保留历史，当前地址上的写入不应制造重复的返回点。**边界：**
   history 行为取决于目标地址、redirect 和选项，不能仅凭 method 推断所有导航结果。

## 十二、练习

:::exercise
### 练习目标

**要求：** 建立一个 `/books` route，同时声明 loader、action 和 component。页面包含一个 GET Form，用 `q`
筛选书名；再包含一个 POST Form，用 `title` 和 `author` 创建书籍。GET Form 不指定 action，POST Form 显式指向
`/books`。

**验收：** GET 提交后 URL 含 `q`，loader 调用增加而 action 不调用；POST 提交后 action 恰好调用一次，随后
loader 再调用一次；两个输入都有 `label` 和 `name`，按 Enter 与点击按钮都能提交；页面只从 loader data 渲染最终
书籍列表，并用 `useNavigation` 显示 pending 状态；不加入 action data、Fetcher、不导航提交或自定义 revalidation。
:::

## 十三、本节小结

- `Form` 是保留 HTML form 语义的 Data Router 导航入口。
- 默认 method 是 `get`；GET 把字段编码进 URL 并进入 loader。
- `post` 等 mutation method 把字段交给显式或默认目标 route 的 action。
- 未指定 action 时使用最近 route，显式 action 用于清楚表达跨 route 目标。
- `name`、submit button 和原生表单约束仍然决定字段能否进入提交数据。
- Form 导航可以用 `useNavigation` 观察，`loading` 是 loader pass，不是第二次 action。

## 十四、参考资料

- [React Router Actions](https://reactrouter.com/8.3.0/start/data/actions) - Form 调用 action、GET 与 mutation 数据流。
- [React Router Form](https://reactrouter.com/8.3.0/api/components/Form) - Form 的渐进增强语义与公开属性。
- [React Router Route Object](https://reactrouter.com/8.3.0/start/data/route-object) - route action 与匹配目标。
- [React Router 8.3.0 Form Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L1928-L2030) - Form 的提交桥接与 action 解析。
- [React Router 8.3.0 Form Navigation Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/data-browser-router-test.tsx#L815-L899) - GET Form 的 loader 导航行为。
- [React Router 8.3.0 Form Mutation Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/data-browser-router-test.tsx#L1258-L1362) - POST Form 的 action 与 loader 行为。
- [MDN HTML form element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) - 原生 form 字段与提交语义。
