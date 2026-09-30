---
id: react.router.learn.basics.programmatic-navigation
type: lesson
title: 编程式导航
summary: 用 useNavigate 在程序决定的时机切换路由，正确处理目标解析、历史记录与模式边界。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 85
prerequisites:
  - react.router.learn.basics.query-params-and-url-state
related:
  - react.router.learn.basics.link-navigation
  - react.router.learn.basics.index-routes
tags:
  - React Router
  - useNavigate
  - 编程式导航
  - 相对导航
  - History
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-20
objectives:
  - 能判断何时应使用 useNavigate，以及何时应优先使用 Link、Form 或 redirect。
  - 能读懂 NavigateFunction 的 To 与 delta 两个 overload，并说明不同 Router mode 的返回值差异。
  - 能用字符串或 Partial<Path> 导航到根路径、查询参数、hash 和对象目标。
  - 能预测 route-relative 与 path-relative 对同一个 .. 目标的不同解析结果。
  - 能通过 push、replace、后退和前进判断 history stack 的变化与 delta 风险。
  - 能准确说明 state 与其他 NavigateOptions 字段的职责边界。
recap:
  - useNavigate 服务于程序决定的导航；正常页面入口仍优先使用 Link 或 NavLink。
  - NavigateFunction 接收 To 或 number；Data/Framework 返回 Promise，Declarative 返回 void。
  - 以斜杠开头的目标从 Router 根解析；默认相对规则按 route hierarchy，relative path 才按 pathname 段。
  - 字符串目标可包含 search 与 hash；对象目标应把 pathname、search 和 hash 分字段填写。
  - 普通目标默认 push，replace 只替换当前 entry；delta 只有在 history 来源可证明时才可靠。
  - 高级选项只在当前主题定义边界，不替代 Location、滚动恢复、数据重验证或动效设计。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的正式稳定发布，并固定到提交 2edaca7a4f12a50cad002d55d84f73b0cdd462b6。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 在 2026-08-20 返回 8.3.0，预发布版本位于其他 dist-tag。
  - title: React Router 8.3.0 useNavigate API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useNavigate.md#L25-L180
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - NavigateFunction 支持 To 与 delta 两个 overload，并定义 history delta 的风险。
      - Data 与 Framework Mode 返回 Promise 且引用稳定，Declarative Mode 返回 void 且引用可能改变。
  - title: React Router 8.3.0 NavigateOptions Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/context.ts#L73-L90
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本公开定义 replace、mask、state、preventScrollReset、relative、flushSync、viewTransition 和 defaultShouldRevalidate。
  - title: React Router 8.3.0 useNavigate Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L367-L440
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本按 Router mode 选择 navigate 实现，并在 Data Mode 等待 router.navigate。
      - render 阶段过早调用 navigate 会被警告并短路。
  - title: React Router 8.3.0 Route Resolution Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1945-L2045
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - route-relative 按贡献 path 的 route matches 上移，path-relative 按 pathname 段解析。
      - 对象目标会校验 pathname、search 和 hash 的字段边界。
  - title: React Router 8.3.0 Memory History Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L264-L348
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本的 memory history 通过 index、push、replace 和 go 操作内存 entry 列表。
      - push 新增并截断 forward entries，replace 原位替换当前 entry，越界 go 被限制在有效 index 内。
  - title: React Router 8.3.0 useNavigate Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useNavigate-test.tsx#L228-L1393
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖对象字段错误、绝对与相对目标、path-relative、search、hash 和不同 mode 的引用身份。
  - title: React Router 8.3.0 Data Memory Router Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/data-memory-router-test.tsx#L1016-L1122
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - Data Mode 的 path 与 popstate navigation Promise 会在导航完成后 resolve。
  - title: React Router 8.3.0 Navigating Guide
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/framework/navigating.md#L96-L177
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 普通页面入口优先使用 Link 或 NavLink，数据流程优先使用 Form 和 redirect。
      - useNavigate 适合无法由声明式入口表达的程序导航。
  - title: React Router 8.3.0 createMemoryRouter API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L25-L104
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 使用内存 history，并允许通过 initialEntries 与 initialIndex 建立受控栈。
---

# 编程式导航

## 一、学习目标

- 能判断一次导航应该由链接、表单、数据流程还是程序回调发起。
- 能在 Router 上下文中调用 `useNavigate`，并区分 `To` 目标与 history delta。
- 能使用字符串和对象目标，正确填写 pathname、search 与 hash。
- 能解释默认 route-relative 与显式 path-relative 对 `..` 的不同解析结果。
- 能预测 push、replace、后退和前进如何改变 history stack。
- 能说明 Data Mode 中 Promise 返回值与稳定引用的边界，不把其他 mode 的行为混为一谈。

## 二、为什么需要编程式导航

页面之间的普通入口应当是链接。用户看到“课程目录”并决定前往时，`Link` 能提供真实 `href`、键盘语义、
右键菜单和新窗口行为：

```tsx
<Link to="/catalog">课程目录</Link>
```

但有些导航由程序在动作完成后决定。例如用户确认了一个本地步骤，组件需要进入预览页；或者一个受控
向导需要回到已经确定存在的前一步。这时没有一个预先可激活的页面入口，`useNavigate` 才是合适工具：

```tsx
function EditorActions() {
  const navigate = useNavigate()

  async function openPreview() {
    await navigate('/workspace/preview')
  }

  return (
    <button type="button" onClick={openPreview}>
      完成编辑并预览
    </button>
  )
}
```

不要把所有导航都改成按钮：

| 导航意图                   | 优先工具            | 原因                     |
| -------------------------- | ------------------- | ------------------------ |
| 用户激活可见页面入口       | `Link` / `NavLink`  | 保留链接语义和浏览器能力 |
| 用户提交字段或数据         | Data Mode 的 `Form` | 让 Router 管理提交与导航 |
| loader/action 已决定跳转   | `redirect`          | 在数据流程中直接表达结果 |
| 业务回调或受控流程决定跳转 | `useNavigate`       | 由程序在明确时机发起导航 |

本课只实现最后一种场景。`Form`、loader、action 和 pending UI 只用于划分选择边界，不在示例中展开。

## 三、核心概念

### 1. `useNavigate` 必须位于 Router 上下文

`useNavigate()` 读取当前 Router 提供的导航上下文，并返回一个 `navigate` 函数：

```tsx
const navigate = useNavigate()
```

组件必须渲染在 Router 内部。把 Hook 放到 Router 外层、普通工具函数或事件发生后才临时调用，都会违反
Hook 和 Router 上下文约束。通常在 route component 顶层取得函数，再在事件处理器中使用。

### 2. `NavigateFunction` 有两个 overload

公开类型把目标导航和 history 位移分成两个调用形式：

```ts
interface NavigateFunction {
  (to: To, options?: NavigateOptions): void | Promise<void>
  (delta: number): void | Promise<void>
}
```

- `navigate(to, options?)` 解析一个目标并创建或替换 history entry。
- `navigate(delta)` 在已有 history stack 中按 index 前后移动。

`number` 不是 URL，也不是 route level。`navigate(-1)` 表示后退一个 entry，`navigate(1)` 表示前进一个
entry；它们都不承诺目标页面的 pathname。

### 3. `To` 可以是字符串或对象

`To` 的公共形状是 `string | Partial<Path>`。字符串适合直接表达完整应用内目标：

```tsx
navigate('/workspace/done?task=42#result')
```

对象适合把三个 URL 部分清楚分开：

```tsx
navigate({
  pathname: '/workspace/done',
  search: '?task=42',
  hash: '#result',
})
```

对象字段都是可选的。只提供 search 或 hash 时会沿用当前 pathname；不要把 `?` 或 `#` 混进 pathname。

### 4. Data Mode 可以等待导航完成

公开联合类型必须同时容纳三种 Router mode：

| Router mode      | 实际返回值      | navigate 引用                            |
| ---------------- | --------------- | ---------------------------------------- |
| Data / Framework | `Promise<void>` | 在同一 Router 上下文中跨 navigation 稳定 |
| Declarative      | `void`          | 可能随 location 改变                     |

本课程使用 `createMemoryRouter` 与 `RouterProvider`，属于 Data Mode，因此事件处理器可以：

```tsx
async function finishStep() {
  await navigate('/workspace/preview')
}
```

Promise 在 navigation 完成后 resolve。这里的“稳定”只描述同一 Data/Framework Router 上下文跨导航时的
函数身份，不表示组件卸载或换 Router 后仍是同一函数。使用不同 mode 的项目应按实际 Router 类型理解
返回值，不能假设所有 `navigate` 都返回 Promise。

### 5. 调用时机应当明确

事件导航放进 event handler，不要在 render 期间直接调用：

```tsx
function GuardedPage({ ready }: { ready: boolean }) {
  const navigate = useNavigate()

  // 错误：render 期间产生导航副作用
  if (!ready) navigate('/setup')

  return <PageContent />
}
```

render 应保持纯。确实由组件生命周期触发的自动导航需要合适的 Effect；由 loader/action 得出的跳转应在
数据流程中使用 `redirect`，不要先渲染组件再补一次 Hook 导航。

## 四、用法与示例

### 1. 使用根路径字符串目标

以 `/` 开头的目标从 Router 根解析，不依赖当前 route 层级：

```tsx
async function openPreview() {
  await navigate('/workspace/preview')
}
```

这里的“根路径”仍是当前应用 Router 内部的 pathname，不表示外部 `https://` 地址。普通外部文档链接应
使用原生链接语义。

### 2. 使用对象目标拆分 URL

对象目标可以避免 pathname、search 和 hash 混在一起：

```tsx
async function finishPreview() {
  await navigate(
    {
      pathname: '/workspace/done',
      search: '?task=42',
      hash: '#result',
    },
    { replace: true },
  )
}
```

对象里的 search 应以 `?` 开头，hash 应以 `#` 开头。查询参数的读取、重复键和编码仍由
`URLSearchParams` 规则处理，目标对象不会替代查询状态解析。

### 3. 区分 route-relative 与 path-relative

`relative` 默认是 `route`。假设当前 route tree 是：

```text
/workspace
└─ projects/:projectId/tasks/:taskId/edit
```

当前 URL 为：

```text
/workspace/projects/aurora/tasks/42/edit
```

当前 child route pattern 一次贡献了 `projects/aurora/tasks/42/edit` 这些 URL 段。两种调用得到不同结果：

```tsx
await navigate('..')
// 默认 relative: 'route'，回到 parent route：/workspace

await navigate('..', { relative: 'path' })
// 只删除一个 pathname 段：/workspace/projects/aurora/tasks/42
```

`relative: 'route'` 按 route hierarchy 上移，`relative: 'path'` 才按 URL pathname 段处理。这个选项只
改变目标解析规则，不会修改 route tree。Index Route 和无 path 的布局路由也不会额外贡献 pathname 段。

### 4. 默认 push 与显式 replace

普通 `navigate(to)` 默认执行 push，新增当前 entry 之后的一项：

```tsx
await navigate('/workspace/preview')
```

`replace: true` 只替换当前 entry：

```tsx
await navigate('/workspace/done', { replace: true })
```

假设初始栈是 `start -> edit`：

1. 从 edit push preview 后，栈变成 `start -> edit -> preview`。
2. 从 preview replace done 后，栈变成 `start -> edit -> done`。
3. 此时后退一项回到 edit，不会回到已被替换的 preview。

replace 不会清空整条 history，也不会删除当前 index 之前的 entries。

### 5. 只在已知 history 中使用 delta

```tsx
await navigate(-1)
await navigate(1)
```

delta 适合应用自己建立并控制的前后步骤。用户也可能从书签、新标签页、刷新或外站直接进入当前页面，
这时前一项可能不存在，也可能不是应用预期的列表页。无法证明 history 来源时，应导航到确定 URL，而
不是把 `navigate(-1)` 当成固定“返回某页”的别名。

### 6. 识别 `NavigateOptions` 的职责

React Router 8.3.0 的公共接口包含 8 个字段：

```ts
interface NavigateOptions {
  replace?: boolean
  mask?: To
  state?: any
  preventScrollReset?: boolean
  relative?: 'route' | 'path'
  flushSync?: boolean
  viewTransition?: boolean
  defaultShouldRevalidate?: boolean
}
```

当前主题完整使用 `replace` 与 `relative`，其余字段只需准确识别边界：

- `state` 把客户端 history state 写到下一 Location，但不会进入可分享 URL；这里不读取它。
- `preventScrollReset` 只在配合 `ScrollRestoration` 时阻止这次导航后的回顶，不等于实现完整滚动恢复。
- `flushSync` 把初始导航状态更新包装在 `ReactDOM.flushSync` 中，不表示导航更快，应谨慎使用。
- `viewTransition` 为最终更新启用浏览器 View Transition，不会自动完成样式与可访问性设计。
- `mask` 允许 Data Router 展示与内部操作目标不同的 masked URL，适合特定上下文路由，不在基础 Demo 使用。
- `defaultShouldRevalidate` 向 Data Router 传递默认数据重验证判断，只有涉及 loader 和重验证时才有意义。

这些选项不是“都要打开”的配置清单。只在问题确实属于对应能力时使用。

## 五、用 Demo 观察 history 操作

下面的观察台使用 `createMemoryRouter` 与 `RouterProvider`。两条初始 entry 固定为起点和编辑页，当前
index 位于编辑页；所有操作都只改变内存 URL，不会接管学习站外层地址。

:::demo{id="react.router.learn.basics.programmatic-navigation.navigation-workbench-demo"}
:::

按以下顺序观察：

1. 编辑页点击“Push 进入预览”，默认 push 在当前栈尾新增 preview。
2. 预览页点击“Replace 完成”，对象目标生成 `/workspace/done?task=42#result`，并替换 preview entry。
3. 结果页后退一项直接回到 edit，证明 preview 已被替换。
4. 编辑页再后退到 start，起点页前进一项会回到 edit；delta 的目标由这条受控 history 决定。
5. fresh 状态下，从 edit 使用默认 `navigate('..')` 到 `/workspace`。
6. 恢复后使用 `{ relative: 'path' }`，只移除 `edit` 段，到 `/workspace/projects/aurora/tasks/42`。
7. 刷新课程页面或离开再返回后，新的 Demo 实例恢复到相同两条初始 entry。

页面显示的内存 URL 由当前 route component 的已知目标提供，只作为观察标签；业务代码若要读取 Location，
应使用专门的 Location API，而不是从 DOM 文本或 Router 内部状态取值。

## 六、易错使用提示

:::pitfalls

### 错误：用按钮伪造普通页面链接

**触发条件：** 页面始终展示“课程目录”入口，却用按钮调用 `navigate('/catalog')`。

**原因：** 按钮表达动作，不提供链接的 `href`、右键菜单、新窗口和原生辅助技术语义。

**后果：** 用户失去浏览器链接能力，辅助技术也收到错误的交互角色。

**错误示例：**

```tsx
<button onClick={() => navigate('/catalog')}>课程目录</button>
```

**正确写法：**

```tsx
<Link to="/catalog">课程目录</Link>
```

**验证方式：** 检查普通入口是带真实 `href` 的 anchor，并可通过键盘和浏览器菜单正常使用。

### 错误：在 render 期间直接调用 navigate

**触发条件：** 组件函数体根据条件立即执行 `navigate('/login')`。

**原因：** render 应保持纯，Router subscriber 也可能尚未接好。

**后果：** 冷挂载可能产生 warning、无效调用或重复导航。

**错误示例：**

```tsx
if (!ready) navigate('/setup')
```

**正确写法：**

```tsx
async function continueSetup() {
  if (!ready) await navigate('/setup')
}
```

**验证方式：** 冷挂载时 console 没有 warning，导航只在明确事件或合适 Effect 之后发生。

### 错误：认为默认 `..` 永远删除一个 URL 段

**触发条件：** 一个 route pattern 贡献多个 pathname 段，却按普通 URL 层级预测默认相对导航。

**原因：** 默认 `relative: 'route'` 按 route hierarchy 上移，不按斜杠数量上移。

**后果：** 页面可能跳到比预期更高的 parent route。

**错误示例：**

```tsx
await navigate('..')
// 错误地假设一定只删除最后一个 pathname 段
```

**正确写法：**

```tsx
await navigate('..', { relative: 'path' })
```

**验证方式：** 在多段 route pattern 下分别执行两种调用，逐字比较得到的 pathname。

### 错误：把 `navigate(-1)` 当成固定返回地址

**触发条件：** 无论用户如何进入详情页，都用 delta 返回列表。

**原因：** delta 只移动 history index，不知道产品中的“列表页”是哪一个 URL。

**后果：** 直接进入时可能没有前项，或后退到外站和其他不相关页面。

**错误示例：**

```tsx
function backToCatalog() {
  navigate(-1)
}
```

**正确写法：**

```tsx
function backToCatalog() {
  navigate('/catalog')
}
```

**验证方式：** 分别从应用内列表和直接深链进入详情页，确认固定 URL 行为不依赖未知 history。

### 错误：认为 replace 会清空 history

**触发条件：** 使用 `{ replace: true }` 后宣称用户不可能再后退。

**原因：** replace 只改写当前 index 对应的 entry。

**后果：** 对返回行为的预测错误，可能遗漏更早的可访问页面。

**错误示例：**

```tsx
await navigate('/done', { replace: true })
// 错误结论：history 已全部清空
```

**正确写法：**

```tsx
// 只用 done 替换当前 preview entry，更早的 edit 仍保留
await navigate('/done', { replace: true })
```

**验证方式：** 依次执行 initial -> push preview -> replace done -> back，确认返回 initial 而非 preview。

### 错误：在 pathname 中混入 query 或 hash

**触发条件：** 使用对象目标，却把完整 URL 字符串都放进 pathname。

**原因：** `Partial<Path>` 用不同字段表达 pathname、search 和 hash，固定实现会校验字段边界。

**后果：** 导航抛错，目标无法解析。

**错误示例：**

```tsx
navigate({ pathname: '/catalog?sort=title#first' })
```

**正确写法：**

```tsx
navigate({
  pathname: '/catalog',
  search: '?sort=title',
  hash: '#first',
})
```

**验证方式：** 对合法对象分别检查 pathname、search 与 hash，确认三部分落在对应字段。

### 错误：假设所有 mode 的 navigate 都返回 Promise

**触发条件：** 不确认 Router mode，就把 `navigate` 当作永远返回 Promise 且引用永远不变。

**原因：** 公共类型必须覆盖 Data/Framework 与 Declarative 的不同实现。

**后果：** lint、类型声明和 Effect 依赖可能与真实 mode 不一致。

**错误示例：**

```tsx
const result: Promise<void> = navigate('/done')
```

**正确写法：**

```tsx
// Data Mode 中可以等待完成；其他 mode 按实际 Router 类型处理
await navigate('/done')
```

**验证方式：** 先识别项目使用 `RouterProvider` 还是 Declarative Router，再按官方 mode 合同检查返回类型。

### 错误：以为高级选项独立完成整项能力

**触发条件：** 只传一个 option，就宣称已完成滚动恢复、动画或同步更新设计。

**原因：** 这些字段只是 navigation 与对应子系统的集成入口。

**后果：** 功能不完整，也可能遗漏性能和 reduced-motion 等设计要求。

**错误示例：**

```tsx
navigate('/done', { viewTransition: true })
// 错误结论：过渡样式和可访问性已经完成
```

**正确写法：**

```tsx
// 仅在完整设计了 View Transition 行为后选择该入口
navigate('/done', { viewTransition: true })
```

**验证方式：** 分别检查 option 的依赖能力、样式与可访问性设计，不把一次调用等同于完整实现。
:::

## 七、源码推导与适用场景

### 1. 固定版本按 Router mode 选择实现

**官方事实：** 8.3.0 的 `useNavigate` 根据当前 route 是否属于 Data Router，选择 stable 或 declarative
实现。Data 实现会 `await router.navigate(...)`；官方文档还明确给出 Promise 与引用身份差异。

**课程推导：** 一个项目应先确定自己的 Router mode，再决定是否等待返回值、是否补充 mode-specific 类型，
而不是从公共联合类型猜测运行时行为。

**边界：** 这是当前固定版本和公共 mode 合同，不表示跨 Router、卸载后或未来版本的函数身份永远相同。

### 2. 相对解析先看 route matches

**官方事实：** route-relative 会从贡献 path 的 matched routes 中选择上一级基准；path-relative 则把 `..`
交给 pathname 段解析。对象目标还会校验 `?` 与 `#` 所在字段。

**课程推导：** 看到 `navigate('..')` 时，先画 route tree，再预测目标；只有产品意图明确指向 URL 层级时
才传 `{ relative: 'path' }`。

**边界：** 一个多段 route pattern 只是用于放大两种规则的教学例子，不要求真实项目按此形状组织所有路由。

### 3. Memory history 让栈变化可重复

**官方事实：** 8.3.0 的 memory history 用 entries 与 index 保存状态；push 在下一 index 写入并截断 forward
项，replace 原位写入，go 在有效 index 范围内移动。

**课程推导：** 固定 `initialEntries` 与 `initialIndex` 后，可以可靠证明 push、replace、back 和 forward，且
不会改写宿主浏览器 URL。

**边界：** Memory Router 的越界限制是当前实现事实，不能推广成浏览器 history 的跨站安全保证。

### 4. 选择工具应从用户意图出发

**官方事实：** 官方导航指南把 Link/NavLink、Form、redirect 与 `useNavigate` 放在不同导航来源中。

**课程推导：** 可见页面入口优先链接；数据流程优先 Form/redirect；只有程序在回调或受控流程中决定目标时
才使用 Hook。

**边界：** 这里只定义工具职责，不实现数据提交、权限判断、滚动恢复、导航阻止或 View Transition。

## 八、练习

:::exercise

### 练习目标

**要求：** 完成四组推演。第一组，分别为“用户点击课程入口”“搜索表单提交”“action 创建成功”“业务
回调成功”选择 `Link`、`Form`、`redirect` 或 `useNavigate`，并说明导航由谁决定。第二组，从
`/workspace/projects/aurora/tasks/42/edit` 预测默认 `navigate('..')` 与 path-relative 调用的目标，并画出
route tree。第三组，从 `start -> edit` 且当前位于 edit 开始，依次执行 push preview、replace done、
back、back、forward，写出每一步的当前 entry。第四组，把一个无条件调用 `navigate(-1)` 的“返回目录”
按钮改成确定 URL，并说明可以保留 delta 的受控 history 条件。

**验收：** 四组答案分别体现链接/表单/数据流程/程序回调的职责，route-relative 与 path-relative 的不同
基准，replace 只替换 preview 而保留更早 entries，以及未知 history 来源不能保证固定返回地址。练习不
实现 loader、action、Location state、滚动恢复或 View Transition。
:::

## 九、本节小结

- `useNavigate` 用于程序决定的导航；普通页面入口优先 `Link` 或 `NavLink`。
- `navigate(to, options?)` 解析目标，`navigate(delta)` 只移动已有 history index。
- `To` 可以是字符串或对象；对象应分开填写 pathname、search 和 hash。
- 相对导航默认按 route hierarchy；只有 `relative: 'path'` 按 pathname 段处理。
- 普通目标默认 push，`replace` 只替换当前 entry，不会清空整条 history。
- Data/Framework 与 Declarative Mode 的返回值和引用身份不同，应按实际 Router mode 使用。
- delta 和高级选项都有前提条件，不能把一次调用扩大成固定返回、滚动恢复或完整动画方案。

## 十、参考资料

- [React Router 8.3.0 useNavigate API](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useNavigate.md#L25-L180) - 两个 overload、history delta 风险与 mode 返回值。
- [React Router 8.3.0 NavigateOptions](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/context.ts#L73-L90) - 8 个公开选项字段及其职责。
- [React Router 8.3.0 useNavigate 源码](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L367-L440) - mode 实现选择、调用时机与 Data Mode 等待行为。
- [React Router 8.3.0 路径解析源码](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1945-L2045) - route/path relative 与对象字段校验。
- [React Router 8.3.0 Memory History 源码](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L264-L348) - entries、index、push、replace 与 go 的固定实现。
- [React Router 8.3.0 useNavigate 测试](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useNavigate-test.tsx#L228-L1393) - 目标解析、相对规则、search/hash 和引用身份证据。
- [React Router 8.3.0 Data Memory Router 测试](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/data-memory-router-test.tsx#L1016-L1122) - path 与 popstate navigation Promise 完成时机。
- [React Router 8.3.0 Navigating Guide](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/framework/navigating.md#L96-L177) - Link、Form、redirect 与 `useNavigate` 的选择边界。
- [React Router 8.3.0 createMemoryRouter](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L25-L104) - 内存 history 与初始 entries/index。
