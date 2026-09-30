---
id: react.router.learn.intermediate.action-results-and-form-validation
type: lesson
title: Action 结果与表单校验
summary: 使用 useActionData 消费结构化 Action 结果，把字段校验反馈留在表单并区分成功写入。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 100
prerequisites:
  - react.router.learn.intermediate.action-data-submission
  - react.router.learn.intermediate.form-navigation-form
related:
  - react.router.learn.intermediate.navigation-pending-ui
  - react.router.learn.intermediate.loader-data-loading
tags:
  - React Router
  - Data Mode
  - action
  - useActionData
  - Form
  - 表单校验
  - 字段错误
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-21
objectives:
  - 能说明 route action 返回值如何成为当前 route 的 action data。
  - 能使用 useActionData<typeof action>() 消费结构化成功结果和校验结果。
  - 能在 action 中只读取一次 request.formData() 并执行运行时字段校验。
  - 能让无效提交返回字段错误和回填值，而不写入业务模型。
  - 能让有效提交写入模型，并观察 action data 与 loader revalidation 的先后关系。
  - 能使用 useNavigation 观察 submitting、loading 和 idle，并保持原生 Form 语义。
  - 能区分本课 action 结果消费与冻结的 Fetcher、redirect、Error Boundary 和自定义 revalidation。
recap:
  - action 可以返回可序列化的业务结果，组件用 useActionData 读取当前 route 最近一次结果。
  - 没有 action 调用时 useActionData 返回 undefined；返回对象的结构由 action 与组件共同约定。
  - 校验失败可用带 400 状态的 data 结果返回字段错误；它不是路由异常，也不修改模型。
  - 成功 mutation 后当前匹配 loaders 默认重新验证，最终列表应继续来自 loader data。
  - useNavigation 的 submitting 表示 action 处理中，loading 表示 action 结果已到达且 loader 正在重新读取。
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
      - action 可以返回数据，并由 route component 通过 useActionData 读取。
      - action 完成后页面 loader data 会自动重新验证。
  - title: React Router useActionData API
    url: https://reactrouter.com/8.3.0/api/hooks/useActionData
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useActionData 返回最近一次 POST navigation form submission 的 action data。
      - 没有 action 调用时返回 undefined，签名支持 useActionData<T>()。
  - title: React Router 8.3.0 useActionData Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1647-L1685
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - useActionData 从 Router state 的 actionData[routeId] 读取当前 route 结果。
  - title: React Router 8.3.0 Submission Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L1993-L2235
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - mutation submission 先执行目标 route action，再进行 loader 重新验证。
  - title: React Router 8.3.0 Revalidation Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L5386-L5398
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - action status 大于等于 400 时默认跳过 loader revalidation。
  - title: React Router 8.3.0 Submission Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/submission-test.ts#L86-L130
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - action data 会在 action 结果到达时提交，并在 loader 重新验证完成后保留。
  - title: React Router 8.3.0 Action Data Transition Test
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/react-transitions-test.tsx#L962-L1022
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - action data 可在 submitting 后的 loading 阶段被组件观察到，并与 revalidated loader data 一起保留。
  - title: MDN Request formData
    url: https://developer.mozilla.org/en-US/docs/Web/API/Request/formData
    sourceType: official-reference
    appliesTo: Fetch Living Standard
    claims:
      - Request.formData 读取 body 并异步返回 FormData。
---

# Action 结果与表单校验

## 一、学习目标

- 能说明 route action 返回值如何成为当前 route 的 action data。
- 能使用 `useActionData<typeof action>()` 消费结构化成功结果和字段校验结果。
- 能在 action 中只读取一次 `request.formData()`，再执行运行时校验。
- 能让无效提交返回字段错误和回填值，而不修改任务模型。
- 能让有效提交写入模型，并观察 action data 与 loader revalidation 的状态顺序。
- 能用 `useNavigation` 观察 `submitting`、`loading` 和 `idle`，同时保留 `Form` 的原生语义。

## 二、为什么需要 Action 结果

前一课已经能把 mutation submission 送入 route action，也能看到成功写入后的 loader 重新读取。但真实表单
还需要回答两个问题：字段为什么没有通过校验，以及提交成功后应该显示什么业务反馈。

这类反馈不应依赖组件点击事件里的临时 state。Data Router 已经把 action 的返回值放进 Router state，当前
route component 可以使用 `useActionData` 消费它。这样 action 负责解析和校验，组件负责把结构化结果映射为
字段错误、表单消息和回填值。

## 三、Action 结果的最小模型

### 1. `useActionData` 读取最近一次结果

`useActionData` 读取当前 route 最近一次 POST navigation form submission 的 action data。第一次加载时没有
action 调用，因此结果是 `undefined`；action 返回对象后，组件拿到的就是该对象。

```tsx
import { Form, useActionData } from 'react-router'

type ActionResult =
  | { ok: false; fieldErrors: Record<string, string>; values: Record<string, string> }
  | { ok: true; message: string }

function TaskPage() {
  const actionData = useActionData<typeof action>()

  return (
    <Form method="post">
      <input name="title" />
      {actionData?.ok === false ? <p>{actionData.fieldErrors.title}</p> : null}
      {actionData?.ok === true ? <p>{actionData.message}</p> : null}
    </Form>
  )
}
```

泛型让编辑器知道 action 返回结果的形状，但它不是运行时校验。真正的边界仍然是 action 对 `FormData`
进行判断并返回可信的结构化结果。

### 2. 使用判别字段区分结果

`ok` 是一个简单的判别字段。`ok: false` 时组件可以安全读取 `fieldErrors` 和 `values`；`ok: true` 时组件
可以读取成功消息。相比返回多个互相独立的可选字段，判别联合更容易避免“半个成功结果”和“没有错误却读取
错误字段”的状态。

```tsx
type ActionResult =
  | { ok: false; fieldErrors: { title?: string }; values: { title: string } }
  | { ok: true; message: string; taskTitle: string }
```

### 3. 返回值不等于 loader data

action data 表达最近一次提交的结果，loader data 表达当前页面应该渲染的读取结果。成功 action 可以同时留下
成功消息并触发 loader 重新读取；任务列表仍应从 `useLoaderData` 得到，而不是把 action 返回的单条任务直接
追加到组件 state。

## 四、在 Action 中做运行时表单校验

### 1. 只读取一次 `FormData`

```tsx
async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const titleValue = formData.get('title')
  const ownerValue = formData.get('owner')
  const title = typeof titleValue === 'string' ? titleValue.trim() : ''
  const owner = typeof ownerValue === 'string' ? ownerValue.trim() : ''

  // 接下来只使用已经提取的普通字符串。
}
```

`request.formData()` 读取原生 `Request` body。body 是一次性读取的资源，因此先保存 `FormData`，再读取各字段；
不要为了每个字段再次调用 `request.formData()`。

### 2. 字段错误应是正常返回值

校验失败时，action 可以返回：

```tsx
return {
  ok: false,
  fieldErrors: {
    title: '标题至少需要 3 个字符。',
    owner: '请填写负责人。',
  },
  values: { title, owner },
}
```

这个结果不会写入业务模型，也不会把字段错误误报成路由异常。使用 `data(result, { status: 400 })` 可以把
它标记为校验响应；React Router 8.3.0 默认不会为 400 action 结果重新验证 loaders。组件根据字段名把消息
放在对应控件附近，并用返回的 `values` 回填用户刚才输入的内容。

### 3. 浏览器约束不是运行时边界

`required`、`minLength` 和输入类型可以改善浏览器内的交互，但 action 仍然必须重新验证。提交可能来自
脚本、其他客户端或不同的浏览器；只有 action 处的判断决定是否允许写入。

### 4. 成功结果只在写入后返回

```tsx
await saveTask({ title, owner })
return { ok: true, message: '任务已创建。', taskTitle: title }
```

成功返回应发生在写入完成之后。返回成功结果并不替代 loader；默认 revalidation 仍然负责准备下一次渲染的
列表数据。

## 五、在组件中消费结果

### 1. 字段级错误要贴近控件

组件可以用 `aria-invalid` 标记错误控件，用 `aria-describedby` 关联文字：

```tsx
const actionData = useActionData<typeof action>()
const titleError = actionData?.ok === false ? actionData.fieldErrors.title : undefined

<input
  name="title"
  aria-invalid={Boolean(titleError)}
  aria-describedby={titleError ? 'title-error' : undefined}
/>
{titleError ? <span id="title-error">{titleError}</span> : null}
```

错误消息属于 action 结果的一部分，不需要另起一个与 Router 脱节的错误 state。

### 2. 结果出现前保持空状态

首次加载时 `actionData` 是 `undefined`。组件应把它当成“尚未提交”，而不是把它误判成失败。Demo 用三种
可观察文案区分 `undefined`、校验结果和成功结果。

### 3. 保留用户输入

校验失败后，使用 `defaultValue` 或受控字段回填 action 返回的值。选择哪种表单控制方式不改变 Router
action data 的契约；本课 Demo 使用 `defaultValue`，避免额外引入表单状态管理。

## 六、观察提交与重新验证

### 1. `submitting` 先于 action 结果

`useNavigation().state` 在 action 处理期间为 `submitting`。此时 `navigation.formData` 仍可观察提交中的
字段，按钮可以暂时禁用以避免重复操作。

### 2. 成功结果可能出现在 `loading` 阶段

action 返回后，Router 会开始重新验证当前匹配 loaders。此时组件已经能读到 action data，而 loader data 仍
可能是旧快照；等 loader 完成后，`navigation.state` 才回到 `idle`，列表换成新的读取结果。

### 3. 校验失败也会经过 action data

校验失败不应写入模型。Demo 返回 400 action data，因此 loader 调用次数不会因为失败结果增加；Router 仍然
完成本次 action submission，组件只显示字段错误并保留旧列表。更复杂的 `shouldRevalidate` 策略属于后续能力，
本课不展开。

## 七、Action 结果与表单校验观察台

Demo 使用独立 `createMemoryRouter` 和内存任务模型，观察以下完整路径：

1. 初始状态显示 `action data = undefined`。
2. 提交过短标题或空负责人，组件显示字段错误和回填值，任务列表不变。
3. 提交有效标题和负责人，action 返回成功结果，之后 loader 重新读取并显示新任务。
4. 提交期间观察 `submitting`；成功 action 后观察 `loading`；完成后回到 `idle`。

:::demo{id="react.router.learn.intermediate.action-results-and-form-validation.action-validation-demo"}
:::

## 八、易错使用提示

:::pitfalls
### 错误：把 `useActionData` 当作初始数据

**触发条件：** 首次渲染时直接读取 `actionData.message`。

**原因：** action 尚未调用时，hook 返回 `undefined`。

**后果：** 组件可能抛出读取错误，或把“尚未提交”误显示为失败。

**错误示例：**

```tsx
const actionData = useActionData<typeof action>()
return <p>{actionData.message}</p>
```

**正确写法：**

```tsx
return <p>{actionData?.ok === true ? actionData.message : '尚未提交'}</p>
```

**验证方式：** 首次打开 Demo，确认 action data 显示 `undefined`，页面没有读取异常。

### 错误：只依赖浏览器校验，不在 Action 复核

**触发条件：** 只有输入控件设置 `required`，action 收到值后直接写入。

**原因：** action 是 mutation 的运行时边界，不能把浏览器 UI 约束当成业务规则。

**后果：** 非浏览器来源或绕过客户端校验的提交也可能写入非法数据。

**错误示例：**

```tsx
const formData = await request.formData()
await saveTask(String(formData.get('title')))
```

**正确写法：**

```tsx
const title = formData.get('title')
if (typeof title !== 'string' || title.trim().length < 3) {
  return { ok: false, fieldErrors: { title: '标题太短。' }, values: { title: '' } }
}
```

**验证方式：** 绕过输入控件约束提交无效 FormData，确认 action 仍返回字段错误且列表不变。

### 错误：校验失败仍然修改模型

**触发条件：** 先 push 新记录，再返回字段错误。

**原因：** action 结果和写入副作用没有按成功条件分开。

**后果：** 用户看到错误消息，但列表已经出现非法记录。

**错误示例：**

```tsx
tasks.push({ title })
if (!title) return { ok: false, fieldErrors: { title: '必填。' }, values: { title } }
```

**正确写法：**

```tsx
if (!title) return { ok: false, fieldErrors: { title: '必填。' }, values: { title } }
tasks.push({ title })
return { ok: true, message: '已保存。' }
```

**验证方式：** 提交空标题，确认 action 调用次数增加，但任务数量和 loader 调用次数不变。

### 错误：把 Action 结果当作最终列表

**触发条件：** 成功后直接把 `actionData.task` 追加到组件自己的列表 state。

**原因：** action data 是一次提交的反馈，loader data 才是页面读取模型。

**后果：** 读取数据和写入反馈出现两套来源，重新导航后容易不一致。

**错误示例：**

```tsx
setTasks((tasks) => [...tasks, actionData.task])
```

**正确写法：**

```tsx
const { tasks } = useLoaderData<typeof loader>()
const result = useActionData<typeof action>()
```

**验证方式：** 成功提交后等待 navigation 回到 idle，确认新记录来自重新执行后的 loader data。

### 错误：忽略 pending 状态中的旧 loader data

**触发条件：** action 返回后立即把组件自己的列表清空，等待 loader 完成。

**原因：** action data 和 loader data 在 revalidation 的 loading 阶段可以同时存在。

**后果：** 页面产生不必要的闪烁，用户误以为数据丢失。

**错误示例：**

```tsx
if (navigation.state === 'loading') setTasks([])
```

**正确写法：**

```tsx
const tasks = useLoaderData<typeof loader>()
return <TaskList tasks={tasks} />
```

**验证方式：** 在成功 action 后的 loading 窗口观察列表，确认旧 loader data 保持可见且没有空白闪烁。
:::

## 九、源码推导与适用场景

1. **官方事实：** 固定版本的 `useActionData` 实现从 Router state 的 `actionData[routeId]` 返回当前 route
   结果；没有结果时返回 `undefined`。**课程推导：** 组件应按 `undefined`、校验结果和成功结果分别建模。
   **边界：** 这是 Data Mode 的 route action 数据读取，不是通用 React state，也不覆盖 Fetcher data。
2. **官方事实：** 官方 submission 测试显示非错误 action 结果到达后会提交 action data，随后 loader 进入 loading，并
   在完成后保留 action data；固定源码还按 action status >= 400 默认跳过 revalidation。**课程推导：** 成功消息单独
   读 action data，字段校验可以用 400 data 结果保留旧 loader data。**边界：** 默认重新验证不等于所有请求或全站
   缓存都会刷新，`shouldRevalidate` 也不在本课展开。
3. **官方事实：** 官方文档把 `request.formData()` 作为 action 读取表单 body 的入口。**课程推导：** 先一次性
   读取并缩窄字段，再返回结构化结果。**边界：** 本课不讨论文件上传、JSON submit 或 multipart 处理。

## 十、练习

:::exercise
### 练习目标

**要求：** 把 Demo 的负责人字段改为至少 2 个字符，并新增一个 `notes` 字段；action 在校验失败时返回
`notes` 的字段错误和回填值，组件用 `useActionData<typeof action>()` 显示错误并标记 `aria-invalid`。

**验收：** 无效提交不写入模型且显示两个字段的准确反馈；成功提交后仍由 loader data 显示新增任务，不在
组件中另建任务列表 state；能够说明首次加载、校验失败和成功提交后 `action data` 的三种结果。
:::

## 十一、本节小结

- `useActionData` 读取当前 route 最近一次 action 返回值，没有调用时是 `undefined`。
- 用判别联合表达成功与校验失败；失败返回字段错误和回填值，成功后才执行写入。
- action data 是提交反馈，loader data 是读取模型；成功 mutation 后让 Router 默认重新验证 loader。
- 用 `useNavigation` 区分 action 处理中的 `submitting`、重新读取中的 `loading` 和完成后的 `idle`。

## 十二、参考资料

- [React Router Actions](https://reactrouter.com/8.3.0/start/data/actions) - action 返回数据、Form 提交和默认 loader revalidation。
- [React Router useActionData API](https://reactrouter.com/8.3.0/api/hooks/useActionData) - hook 返回值、`undefined` 初始状态和泛型签名。
- [React Router 8.3.0 useActionData 源码](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1647-L1685) - 当前 route action data 的读取实现。
- [React Router 8.3.0 submission 测试](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/submission-test.ts#L86-L130) - action data 与 loader revalidation 的时序。
- [MDN Request.formData](https://developer.mozilla.org/en-US/docs/Web/API/Request/formData) - Request body 到 FormData 的 Web 平台 API。
