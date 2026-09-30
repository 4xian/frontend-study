---
id: react.router.learn.intermediate.route-data-reading-and-sharing
type: lesson
title: 路由数据读取与共享
summary: 按当前 route、指定 route ID 或当前匹配链读取 loader data，并建立清晰的数据所有权。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 100
prerequisites:
  - react.router.learn.intermediate.loader-data-loading
related:
  - react.router.learn.basics.nested-routes-and-outlet
  - react.router.learn.basics.layout-routes
  - react.router.learn.intermediate.loader-requests-and-redirects
tags:
  - React Router
  - Data Mode
  - useLoaderData
  - useRouteLoaderData
  - useMatches
  - loaderData
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-20
objectives:
  - 能用 useLoaderData 读取当前 route 自己的 loader data。
  - 能用 useRouteLoaderData 和稳定 route ID 读取当前匹配链中指定 route 的数据。
  - 能用 useMatches 查看当前 route hierarchy 的 ID、pathname、params 与 loaderData。
  - 能为父子 route 分配数据所有权，并在组件层按需读取而不复制 loader data。
  - 能处理 useRouteLoaderData 可能返回 undefined 的公开类型边界。
  - 能说明匹配 loader 默认并行执行，不能把组件 Hook 当成 loader 之间的传值通道。
recap:
  - useLoaderData 根据最近 route context 的 ID 读取该 route 的 loaderData。
  - useRouteLoaderData 根据指定 route ID 读取数据；ID 不存在、未匹配或没有可用结果时可能得到 undefined。
  - useMatches 返回当前 Data Router 已知的匹配链，每项包含 id、pathname、params、loaderData 与 handle。
  - Data Mode route object 应为跨 route 读取声明稳定 ID，避免依赖按配置位置生成的 ID。
  - 父 route 数据可以被匹配的 child component 读取，parent component 也可以从 useMatches 观察当前 child 数据。
  - 匹配 loader 默认并行执行，组件层的数据共享不等于一个 loader 可以读取另一个 loader 的结果。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本，并对应固定 tag 与提交。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 在 2026-08-20 返回 8.3.0。
  - title: React Router 8.3.0 Data Loading
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/data-loading.md#L10-L40
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - loader 为 route component 提供数据，组件通过 useLoaderData 读取结果。
  - title: React Router 8.3.0 useLoaderData
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useLoaderData.md#L19-L50
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useLoaderData 返回最近 route loader 的数据。
      - typeof loader 可以把 loader 返回类型带到 Hook。
  - title: React Router 8.3.0 useRouteLoaderData
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useRouteLoaderData.md#L19-L67
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useRouteLoaderData 按 route ID 返回 loader data。
      - 指定 ID 没有可用数据时返回 undefined。
  - title: React Router 8.3.0 useMatches
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useMatches.md#L19-L61
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useMatches 返回当前 route hierarchy 的 UI matches。
      - 每个 match 提供 id、pathname、params、loaderData 与 handle。
      - useMatches 需要 Data Router，且不会进入 Router 未知的后代 route tree。
  - title: React Router 8.3.0 Route Data Hooks Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1569-L1645
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - useMatches 把当前 matches 与 loaderData 转为 UI matches。
      - useLoaderData 按当前 route ID 读取 Router state。
      - useRouteLoaderData 按调用方给出的 route ID 读取 Router state。
  - title: React Router 8.3.0 UI Match and Route ID Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L966-L1021
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Data Mode route object 没有显式 ID 时会按 route tree 位置生成 ID。
      - 显式 route ID 在同一 Data Router 中必须唯一。
  - title: React Router 8.3.0 UI Match Conversion Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1114-L1145
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - UIMatch 包含 id、pathname、params、loaderData 与 handle。
      - loaderData 通过 route ID 从 Router state 取出。
  - title: React Router 8.3.0 Default Data Strategy Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6128-L6151
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 默认 data strategy 使用 Promise.all 并行执行需要加载的 matched loaders。
---

# 路由数据读取与共享

## 一、学习目标

- 能判断组件应该读取当前 route、指定 route，还是整个当前匹配链的数据。
- 能用 `useLoaderData<typeof loader>()` 读取当前 route 自己的 loader data。
- 能为 Data Mode route object 声明稳定 `id`，并用 `useRouteLoaderData` 读取匹配的父 route 数据。
- 能用 `useMatches` 查看当前匹配链中各 route 的 `id`、`pathname`、`params` 与 `loaderData`。
- 能处理 `useRouteLoaderData` 的 `undefined` 边界，不把一个 URL path 误当成 route ID。
- 能区分组件层读取共享数据与 loader 之间传递数据，避免建立错误的执行依赖。

## 二、为什么需要多种读取方式

一个嵌套路由分支可能同时包含工作区、项目和项目详情：

```text
workspace-root
└── project-detail
```

两条 route 可以各自拥有 loader：

- `workspace-root` 返回当前组织、登录用户和工作区权限。
- `project-detail` 根据 `params.projectId` 返回当前项目。

项目页面需要自己的项目数据，也需要父 route 已经加载的组织名称。如果把父数据逐层作为 prop 传入，
组件层级越深，转交链越长；如果在 child loader 中重复请求同一份组织数据，又会模糊数据所有权。

React Router 为三种读取问题提供了不同入口：

| 问题 | API | 读取范围 |
| --- | --- | --- |
| 当前 route 返回了什么 | `useLoaderData` | 最近 route context 对应的数据 |
| 某个已知 route 返回了什么 | `useRouteLoaderData` | 指定 route ID 对应的数据 |
| 当前 URL 匹配了哪些 route，它们各自有什么数据 | `useMatches` | 当前 Data Router 的匹配链 |

这三种 Hook 都读取 Router 已经保存的 loader data。它们不会重新调用 loader，也不会额外创建一份缓存。

## 三、读取当前 Route 数据

### 1. `useLoaderData` 跟随最近 Route Context

route object 把 loader 和 component 放在同一个数据边界：

```tsx
const routes = [
  {
    id: 'project-detail',
    path: '/projects/:projectId',
    loader: projectLoader,
    Component: ProjectPage,
  },
]
```

对应组件使用 `useLoaderData`：

```tsx
function projectLoader({ params }: LoaderFunctionArgs) {
  return {
    project: findProject(params.projectId),
  }
}

function ProjectPage() {
  const { project } = useLoaderData<typeof projectLoader>()
  return <h1>{project?.name ?? '没有找到项目'}</h1>
}
```

`useLoaderData` 不接收 route ID。固定源码先从当前 Route Context 取得最近 route 的 ID，再读取
`state.loaderData[routeId]`。因此它最适合“生产数据的 route component 消费自己的结果”。

### 2. 父组件与子组件会得到各自的数据

嵌套路由同时渲染 parent component 与 child component，但它们的最近 Route Context 不同：

```tsx
function WorkspaceLayout() {
  const workspace = useLoaderData<typeof workspaceLoader>()
  return <Outlet />
}

function ProjectPage() {
  const project = useLoaderData<typeof projectLoader>()
  return <h1>{project.name}</h1>
}
```

`WorkspaceLayout` 读取 parent loader data，`ProjectPage` 读取 child loader data。child component 中再次调用
`useLoaderData` 不会自动向上寻找“第一个有数据的 parent”；它仍然读取自己的 route ID。

### 3. `typeof loader` 只提供静态类型联系

`useLoaderData<typeof projectLoader>()` 会根据 loader 返回类型推导读取结果。这减少了重复 interface，但不
会在运行时验证远程响应，也不会确认当前组件是否放在正确的 route 上。数据边界仍需验证不可信输入，
route 配置仍需保持 loader 与 component 对应。

## 四、按 Route ID 读取数据

### 1. 为 Data Mode Route Object 声明稳定 ID

需要跨 route 读取时，先给数据拥有者一个明确 ID：

```tsx
const WORKSPACE_ROUTE_ID = 'workspace-root'

const routes = [
  {
    id: WORKSPACE_ROUTE_ID,
    path: '/',
    loader: workspaceLoader,
    Component: WorkspaceLayout,
    children: [
      {
        id: 'project-detail',
        path: 'projects/:projectId',
        loader: projectLoader,
        Component: ProjectPage,
      },
    ],
  },
]
```

固定版本允许省略 ID，但 Data Mode 会按 route 在配置树中的位置生成类似 `0-1` 的值。插入 sibling 或
移动节点就可能改变这个位置值。只要业务代码需要引用某条 route，就应声明语义清楚且全 Router 唯一的
ID，不依赖生成细节。

### 2. `useRouteLoaderData` 读取指定 Route

child component 可以用父 route ID 读取共享数据：

```tsx
function ProjectPage() {
  const projectData = useLoaderData<typeof projectLoader>()
  const workspaceData = useRouteLoaderData<typeof workspaceLoader>(WORKSPACE_ROUTE_ID)

  return (
    <article>
      <p>{workspaceData?.organization.name ?? '工作区数据不可用'}</p>
      <h1>{projectData.project?.name ?? '没有找到项目'}</h1>
    </article>
  )
}
```

`useRouteLoaderData` 直接读取 `state.loaderData[routeId]`。它不会检查这个 ID 是否是 parent，也不会把 URL
path 转换成 route ID。

### 3. 正确处理 `undefined`

公开签名返回 `SerializeFrom<T> | undefined`。以下情况都可能没有可读结果：

- ID 拼写错误或 route 根本不存在。
- route 存在，但不在当前 URL 的匹配链中。
- 当前错误呈现路径没有保留该 route 的 loader data。
- route 没有 loader 或当前没有对应结果。

在确定的 parent-child 分支中，正常导航通常能读到 parent data，但组件仍应按公开类型处理缺失情况。
可选链、明确 fallback 或窄化函数都可以，不能直接忽略 `undefined`。

## 五、读取当前匹配链

### 1. `useMatches` 返回当前 Route Hierarchy

`useMatches()` 返回当前 Data Router 的 `UIMatch[]`。每一项包含：

| 字段 | 含义 |
| --- | --- |
| `id` | 当前匹配 route 的唯一 ID |
| `pathname` | 这条 route 匹配到的 pathname 部分 |
| `params` | 当前匹配链解析出的动态参数 |
| `loaderData` | 该 route ID 对应的 loader data，可能为 `undefined` |
| `handle` | route 提供的应用自定义元数据 |

本课只使用 `id`、`pathname`、`params` 和 `loaderData`。`handle` 的元数据组合有独立的设计用途，不在
这里展开。

```tsx
function MatchInspector() {
  const matches = useMatches()

  return (
    <ol>
      {matches.map((match) => (
        <li key={match.id}>
          <code>{match.id}</code>
          <span>{match.pathname}</span>
        </li>
      ))}
    </ol>
  )
}
```

### 2. Parent 可以观察当前 Child 数据

`useMatches` 读取整个当前分支，而不是只跟随调用组件的最近 Route Context。因此 parent layout 可以观察
当前 leaf match，生成分支级状态栏或诊断视图：

```tsx
function WorkspaceLayout() {
  const matches = useMatches()
  const leafMatch = matches.at(-1)

  return (
    <section>
      <p>当前 leaf route：{leafMatch?.id}</p>
      <Outlet />
    </section>
  )
}
```

如果只需要一个已知 parent 的数据，`useRouteLoaderData` 更直接；需要遍历当前层级、同时观察多个 match
时，再使用 `useMatches`。

### 3. 它不是全局 Route 数据仓库

`useMatches` 只返回当前 URL 的匹配链。未匹配 sibling 不会出现，Data Router 不知道的后代 `<Routes>`
树也不会被向下发现。不要用固定数组下标表达业务身份；布局层级变化后，`matches[1]` 可能代表另一条
route。需要特定数据时按 `match.id` 查找，或直接使用 `useRouteLoaderData`。

## 六、设计父子 Route 的数据所有权

### 1. 把稳定的分支数据放在 Parent Loader

组织、当前用户、功能开关等数据如果属于整个工作区分支，可以由 parent loader 拥有。parent component
用 `useLoaderData` 读取，匹配的 child component 用 `useRouteLoaderData(parentId)` 读取。这样只保留一个
数据所有者，不需要把 loader data复制到 React State 或 Context。

### 2. 把页面专属数据放在 Leaf Loader

项目详情、订单详情等只属于当前 leaf 的资源，应由 leaf loader 按 URL 参数加载。leaf component 用
`useLoaderData` 读取。parent 只有在确实需要形成分支级 UI 时，才通过 `useMatches` 观察 leaf data，
不要为了“以后可能使用”把所有 child 结果集中到 root loader。

### 3. Component 共享不等于 Loader 传值

默认 data strategy 使用 `Promise.all` 并行执行本次需要加载的 matched loaders。child loader 不能调用
React Hook，也不能假设 parent loader 已先完成：

```tsx
// 错误：loader 不是 React component，也没有已提交的 parent loader data。
async function projectLoader() {
  const workspace = useRouteLoaderData('workspace-root')
  return getProject(workspace.organization.id)
}
```

多个 loader 需要相同身份或请求范围时，应从各自可用的 `request`、`params`、router context 或共同数据
服务中取得；这与组件 render 时读取已提交结果是两个阶段。

## 七、路由数据共享观察台

下面的 Demo 使用独立 `createMemoryRouter`，不会修改学习站外层 URL：

1. `workspace-root` loader 拥有组织与当前成员数据，root component 用 `useLoaderData` 读取。
2. Overview 和 Project route 各自用 `useLoaderData` 读取自己的结果。
3. Project component 用 `useRouteLoaderData('workspace-root')` 读取已匹配 parent 的组织名称。
4. Root component 用 `useMatches` 展示当前匹配链和每条 route 的 loader data keys。
5. 切换 Overview、Atlas 与 Harbor 后，匹配链和 leaf data 同步变化。

:::demo{id="react.router.learn.intermediate.route-data-reading-and-sharing.route-data-sharing-demo"}
:::

观察重点是读取边界，不是请求等待过程。Demo 不添加人为延时、pending UI、action、fetcher、revalidation
或错误边界。

## 八、易错使用提示

:::pitfalls
### 错误：在 Child Route 中用 `useLoaderData` 期待 Parent 数据

**触发条件：** parent 和 child 都有 loader，child component 调用 `useLoaderData` 后按 parent shape 解构。

**原因：** `useLoaderData` 根据最近 Route Context 的 ID 读取数据；在 child component 中，最近 route
就是 child。

**后果：** 读取到 child shape，属性为 `undefined`，或静态类型被错误断言掩盖后出现运行时异常。

**错误示例：**

```tsx
function ProjectPage() {
  const { organization } = useLoaderData<typeof workspaceLoader>()
  return <h1>{organization.name}</h1>
}
```

**正确写法：**

```tsx
function ProjectPage() {
  const workspace = useRouteLoaderData<typeof workspaceLoader>('workspace-root')
  return <h1>{workspace?.organization.name ?? '工作区数据不可用'}</h1>
}
```

**验证方式：** 让 parent 与 child 返回不同字段；在 child component 中分别读取自己的数据和显式 parent
ID，确认两个结果没有混用。
:::

:::pitfalls
### 错误：把 URL Path 当成 Route ID

**触发条件：** route path 是 `/projects/:projectId`，调用方把这个 path 传给 `useRouteLoaderData`。

**原因：** path 参与 URL 匹配，ID 标识 route object；两者是不同合同。

**后果：** Router state 中没有这个 ID，Hook 返回 `undefined`。

**错误示例：**

```tsx
const data = useRouteLoaderData('/projects/:projectId')
```

**正确写法：**

```tsx
const PROJECT_ROUTE_ID = 'project-detail'

const route = {
  id: PROJECT_ROUTE_ID,
  path: 'projects/:projectId',
  loader: projectLoader,
}

const data = useRouteLoaderData<typeof projectLoader>(PROJECT_ROUTE_ID)
```

**验证方式：** 同时显示 `useMatches().map(match => match.id)`，确认传入值等于真实 match ID，而不是
pathname 或 path pattern。
:::

:::pitfalls
### 错误：跨 Route 读取却依赖自动位置 ID

**触发条件：** Data Mode route object 省略 `id`，业务代码写死观察到的 `0-1`，之后在配置前插入新
sibling。

**原因：** 固定实现会按 route tree 位置生成缺省 ID，配置位置变化会改变生成值。

**后果：** 读取目标悄悄漂移或变为 `undefined`，代码中的字符串也没有业务意义。

**错误示例：**

```tsx
const workspace = useRouteLoaderData('0-1')
```

**正确写法：**

```tsx
const WORKSPACE_ROUTE_ID = 'workspace-root'

const workspaceRoute = {
  id: WORKSPACE_ROUTE_ID,
  loader: workspaceLoader,
}
```

**验证方式：** 在 route tree 中插入无关 sibling，确认显式 ID 与读取结果保持不变。
:::

:::pitfalls
### 错误：直接解构 `useRouteLoaderData` 结果

**触发条件：** 不检查返回值就执行 `const { user } = useRouteLoaderData(...)`。

**原因：** 公开返回类型包含 `undefined`，错误 ID、未匹配 route 或错误呈现都可能没有结果。

**后果：** 页面在解构时抛出 `TypeError`，丢失可控 fallback。

**错误示例：**

```tsx
const { viewer } = useRouteLoaderData<typeof workspaceLoader>('workspace-root')
```

**正确写法：**

```tsx
const workspace = useRouteLoaderData<typeof workspaceLoader>('workspace-root')

if (!workspace) {
  return <p>工作区数据不可用</p>
}
```

**验证方式：** 临时传入不存在的 ID，确认组件显示 fallback 而不是抛出解构异常；恢复真实 ID 后重新
确认数据正常。
:::

:::pitfalls
### 错误：把 `useMatches` 当成全部 Route 清单

**触发条件：** 代码期望 `useMatches` 同时返回当前 leaf、未访问 sibling 和另一个 descendant Router 的
route。

**原因：** Hook 只转换当前 Data Router 已知的 active matches。

**后果：** 查找未匹配 route 得到 `undefined`，按固定长度编写的聚合逻辑失效。

**错误示例：**

```tsx
const matches = useMatches()
const settingsData = matches[3].loaderData
```

**正确写法：**

```tsx
const settingsMatch = useMatches().find((match) => match.id === 'settings')
const settingsData = settingsMatch?.loaderData
```

**验证方式：** 在两个 sibling 页面间切换，确认 matches 只包含 root 到当前 leaf，并且查找逻辑使用
稳定 ID。
:::

:::pitfalls
### 错误：让 Child Loader 等待 Parent Loader Data

**触发条件：** child loader 需要 parent 数据，尝试调用 Hook、读取已提交 Router state，或假定 parent
loader 总会先完成。

**原因：** React Hook 只能在组件或自定义 Hook 中调用；默认 data strategy 还会并行执行需要加载的
matched loaders。

**后果：** 违反 Hook 规则，或建立不受保证的执行顺序，导航在不同加载组合下失败。

**错误示例：**

```tsx
function childLoader() {
  const parent = useRouteLoaderData('workspace-root')
  return loadChild(parent.organization.id)
}
```

**正确写法：**

```tsx
async function childLoader({ params, request }: LoaderFunctionArgs) {
  return loadChild({ projectId: params.projectId, signal: request.signal })
}
```

**验证方式：** 检查 loader 不调用 React Hook，也不读取组件上下文；parent 与 child 各自只依赖明确的
loader 参数或共同数据服务。
:::

## 九、源码推导与适用场景

### 1. `useLoaderData` 绑定最近 Route ID

**官方事实：** 固定版本先从 Route Context 的最后一个 match 取得当前 route ID，再返回
`state.loaderData[routeId]`。

**课程推导：** 当前 route component 用 `useLoaderData` 消费自己的 loader，是最短且最不容易漂移的
生产者到消费者关系。

**边界：** 泛型只影响 TypeScript 推导，不会验证 route 配置或远程数据 shape。

### 2. `useRouteLoaderData` 是一次明确的 Key Lookup

**官方事实：** 固定版本直接返回 `state.loaderData[routeId]`，公开签名包含 `undefined`。

**课程推导：** 已知 parent route 是数据所有者时，child component 可以通过稳定 ID 直接读取，不需要
把同一数据复制进局部 State。

**边界：** Hook 不会加载未匹配 route，也不会把 path、pathname 或文件名自动纠正成目标 ID。

### 3. `useMatches` 把 Active Matches 与 Loader Data 组合

**官方事实：** 固定版本遍历 Router state 的 active matches，并按每个 `route.id` 附上 loader data，
生成包含 `id`、`pathname`、`params`、`loaderData` 与 `handle` 的 `UIMatch`。

**课程推导：** 需要观察整个当前分支时，可用 `useMatches` 做层级诊断或聚合；只读一个已知 route 时，
优先使用更明确的 API。

**边界：** 返回值不是全部 route 配置，也不会向 Data Router 未知的 descendant route tree 递归。

### 4. 显式 ID 才是可维护的跨 Route 合同

**官方事实：** Data Mode route object 缺少 ID 时，固定版本按 route tree index path 生成 ID；显式 ID
在同一 Data Router 中必须唯一。

**课程推导：** 只要 ID 会出现在 `useRouteLoaderData`、match 查找或业务诊断中，就应在 route object 上
显式声明，并集中复用常量。

**边界：** Framework Mode 的文件 route ID 生成规则不同；本课 Demo 使用手写 Data Mode route objects。

### 5. Loader 并行与 Component 共享属于不同阶段

**官方事实：** 默认 data strategy 用 `Promise.all` 并行 resolve 本次需要加载的 matches；导航提交后，
Hooks 才从 Router state 读取结果。

**课程推导：** parent 与 child loader 各自建立可独立执行的输入边界，在组件 render 阶段再按 route ID
组合已提交数据。

**边界：** 自定义 data strategy、middleware 或服务端请求上下文有独立合同，不能由默认策略推导。

## 十、练习

:::exercise
### 练习目标

**要求：** 建立 `account-root` parent route 与 `account-profile` child route。parent loader 返回当前账户和
权限，child loader 返回个人资料。parent component 用 `useLoaderData` 显示账户名，child component 用
自己的 `useLoaderData` 显示资料，并用 `useRouteLoaderData('account-root')` 显示父层权限。再在 parent
component 中用 `useMatches` 列出当前匹配 ID。route object 必须使用显式唯一 ID；不要把 parent loader
data 复制进 State 或 Context；不要从 child loader 调用 Hook；不要添加人为延时、pending UI、action、
fetcher、revalidation 或错误边界。

**验收：** 进入 child URL 时同时显示 parent 与 child 数据；matches 顺序为 root 到 leaf；传入错误 parent
ID 时显示可控 fallback；恢复正确 ID 后数据重新出现；两个 loader 仍可独立执行。
:::

## 十一、本节小结

- `useLoaderData` 读取最近 route context 对应的 loader data，适合 route component 消费自己的结果。
- `useRouteLoaderData` 按稳定 route ID 读取当前可用数据，并可能返回 `undefined`。
- `useMatches` 返回当前 Data Router 的 active route hierarchy，不是全部 route 清单。
- Data Mode 跨 route 读取应使用显式唯一 ID，不依赖按 route tree 位置生成的缺省值。
- Parent 数据可以由匹配的 child component 读取，parent 也可以从 matches 观察当前 child 数据。
- 默认 matched loaders 并行执行；组件层共享 loader data 不代表 loader 之间可以互相读取结果。

## 十二、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验稳定发布与固定 tag。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - 核验 2026-08-20 的 npm latest 版本。
- [Data Loading](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/data-loading.md#L10-L40) - loader 提供数据与 useLoaderData 消费入口。
- [useLoaderData](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useLoaderData.md#L19-L50) - 当前 route 数据读取的公开合同。
- [useRouteLoaderData](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useRouteLoaderData.md#L19-L67) - 指定 route ID 与 undefined 返回边界。
- [useMatches](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useMatches.md#L19-L61) - 当前匹配链、UIMatch 字段与 Data Router 限制。
- [Route Data Hooks Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1569-L1645) - 三种 Hook 读取 Router state 的固定实现。
- [Route ID Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L966-L1021) - Data Mode 缺省 ID 与唯一性规则。
- [UI Match Conversion Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1114-L1145) - UIMatch 字段与 loaderData 映射。
- [Default Data Strategy Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6128-L6151) - matched loaders 的默认并行执行方式。
