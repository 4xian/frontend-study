---
id: react.router.learn.basics.route-objects
type: lesson
title: 路由对象
summary: 理解 RouteObject 的类型结构，用 id、path 和单一渲染字段声明可检查的路由配置。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 65
prerequisites:
  - react.router.learn.basics.data-router-introduction
related:
  - react.core.learn.basics.jsx-runtime-and-react-element
  - react.core.learn.basics.function-components
tags:
  - React Router
  - RouteObject
  - Component
  - element
  - 路由配置
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-19
objectives:
  - 能说明 Route Object 是路由配置记录，而不是 React 组件或 Data Router 实例。
  - 能用 satisfies RouteObject[] 让 TypeScript 检查一组静态路由对象。
  - 能区分 Component 保存的组件类型与 element 保存的 React Node。
  - 能为同一 Data Router 中的路由配置唯一、可读的显式 id。
  - 能识别 index 与 non-index 两种联合分支以及 children 的递归结构。
recap:
  - RouteObject 是 IndexRouteObject 与 NonIndexRouteObject 的联合，用于描述一条逻辑路由。
  - 基础对象可以用唯一 id、静态 path 和一种渲染字段表达。
  - Component 接收组件类型，element 接收已创建的 React Node，同一对象不应同时填写两者。
  - 输入对象的 id 可选，但需要稳定路由身份时应显式填写且保持唯一。
  - children 让非索引路由递归组成 route tree，具体的嵌套渲染不属于当前字段模型。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本。
  - title: React Router 8.3.0 Route Object Guide
    url: https://reactrouter.com/8.3.0/start/data/route-object
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 传给 createBrowserRouter 的配置对象称为 Route Objects。
      - Component 字段定义路由匹配时渲染的组件。
  - title: React Router 8.3.0 Data Routing Guide
    url: https://reactrouter.com/8.3.0/start/data/routing
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Data Router 以 RouteObject 数组作为路由配置输入。
      - children 可以让配置形成递归的 route tree。
  - title: React Router 8.3.0 RouteObject Type
    url: https://api.reactrouter.com/v8/types/react-router.RouteObject.html
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - RouteObject 是 IndexRouteObject 与 NonIndexRouteObject 的联合类型。
  - title: React Router 8.3.0 Base Route Object Fields
    url: https://api.reactrouter.com/v8/types/react-router.BaseRouteObject.html
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - path、id、Component 与 element 的公开类型和字段职责。
      - Component 与 element 是互斥的渲染声明。
  - title: React Router 8.3.0 Route Object Source
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/utils.ts
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 联合分支约束 index 与 children 的关系。
      - 固定版本会将 Component 转换为 element，并检查路由 id 冲突。
  - title: React Router 8.3.0 createRoutesFromElements
    url: https://reactrouter.com/8.3.0/api/utils/createRoutesFromElements
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - JSX Route 配置可以被转换为 RouteObject 数组。
  - title: React createElement
    url: https://react.dev/reference/react/createElement
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 创建 React element 只会得到界面描述，不等于已经执行组件或创建 DOM。
---

# 路由对象

## 一、学习目标

- 能用一句话区分 Route Object、React 组件和 Data Router 实例。
- 能用 `satisfies RouteObject[]` 声明两条静态路由。
- 能正确填写 `Component: Page` 和 `element: <Page />`，并解释两者的值不同。
- 能为路由对象选择唯一、可读的显式 `id`。
- 能读懂 `RouteObject = IndexRouteObject | NonIndexRouteObject` 的基本约束。

本知识点只研究路由配置记录本身。路径的匹配算法、嵌套页面渲染、索引路由以及数据加载
字段不在这里展开。

## 二、为什么需要路由对象

如果只用普通条件语句根据地址选择页面，URL 与组件的对应关系就会散落在控制流里：

```tsx
function renderPage(pathname: string) {
  if (pathname === '/') return <HomePage />
  if (pathname === '/courses') return <CoursePage />
  return <NotFoundPage />
}
```

这段代码能选择 React element，却没有给每条对应关系一个独立的配置记录。当应用需要增加路由身份、
渲染形式或其他路由能力时，条件分支会同时承担“匹配地址”和“组装页面”两种职责。

Route Object 把一条逻辑路由变成结构化数据：

```tsx
const routes = [
  { id: 'home', path: '/', Component: HomePage },
  { id: 'courses', path: '/courses', Component: CoursePage },
]
```

每个对象都能被 TypeScript 检查，也能被 Data Router 统一转换为可运行路由。对象数组是配置输入，
不是当前页面的匹配结果。

## 三、RouteObject 的核心模型

### 1. 一个对象表示一条逻辑路由

React Router 将传给 `createBrowserRouter` 等 Data Router 创建器的对象称为 Route
Objects。一条记录可以回答这些问题：

- 这条路由的身份是什么？
- 它用哪个 `path` 参与地址匹配？
- 匹配后应使用哪种渲染声明？
- 它是否拥有其他路由对象作为 `children`？

本课使用的最小配置包含 `id`、静态 `path` 和一种渲染字段：

```tsx
import type { RouteObject } from 'react-router'

const homeRoute = {
  id: 'home',
  path: '/',
  Component: HomePage,
} satisfies RouteObject
```

`homeRoute` 仍然是普通 JavaScript 对象。`satisfies RouteObject` 只让 TypeScript 核对字段与值，
不会把它创建成 Router，也不会渲染页面。

### 2. RouteObject 是联合类型

8.3.0 的公开类型可以简化为：

```ts
type RouteObject = IndexRouteObject | NonIndexRouteObject

type IndexRouteObject = CommonRouteFields & {
  index: true
  children?: undefined
}

type NonIndexRouteObject = CommonRouteFields & {
  index?: false
  children?: RouteObject[]
}
```

`CommonRouteFields` 是为了读懂关系而使用的教学代称，不是应用需要导入的公开名称。这个联合主要
表达两条约束：

1. `index: true` 的分支不能声明 `children`。
2. 普通分支的 `children` 可以继续容纳 `RouteObject[]`。

这里只需识别类型形状。`index` 对 URL 和渲染位置的影响，以及 `children` 如何形成父子匹配链，
需要在对应的独立知识点中观察。

### 3. children 让配置可以组成树

非索引路由的 `children` 仍然是 Route Object 数组，因此配置可以递归：

```tsx
const routeTree = [
  {
    id: 'root',
    path: '/',
    Component: RootPage,
    children: [
      {
        id: 'courses',
        path: 'courses',
        Component: CoursePage,
      },
    ],
  },
] satisfies RouteObject[]
```

这段代码只用来识别 route tree 的数据结构。不能仅凭这个对象就推断子页面在 DOM 中的具体位置。

## 四、本课使用的字段

### 1. path 描述用于匹配的路径形态

`path?: string` 表示这条路由用什么 path pattern 参与地址匹配。为了专注字段模型，当前示例只使用
`/` 与 `/courses` 这类静态字面路径：

```tsx
const route = {
  path: '/courses',
  Component: CoursePage,
} satisfies RouteObject
```

`path` 在类型上是可选字段，因为 Route Object 还支持不贡献路径的合法形态。省略它时的布局与嵌套
语义不是当前最小配置的一部分。

### 2. id 描述 Data Router 中的路由身份

`id?: string` 是输入 Route Object 的可选字段。Data Router 在运行时会为每条路由建立唯一身份；当代码
需要稳定地指代某条路由时，显式的描述性 ID 更清晰：

```tsx
const routes = [
  { id: 'home', path: '/', Component: HomePage },
  { id: 'course-catalog', path: '/courses', Component: CoursePage },
] satisfies RouteObject[]
```

显式 ID 必须在同一 Data Router 的路由配置中唯一。省略 `id` 并不是类型错误；8.3.0 当前实现会根据
route tree 的位置生成 ID。位置格式属于固定版本实现，不应被业务代码当作稳定公开合同。

### 3. Component 保存组件类型

`Component?: React.ComponentType | null` 接收组件函数或组件类型本身：

```tsx
function CoursePage() {
  return <h1>课程目录</h1>
}

const route = {
  id: 'courses',
  path: '/courses',
  Component: CoursePage,
} satisfies RouteObject
```

值是 `CoursePage`，不是 `<CoursePage />`。对于不需要在路由配置处传入 props 或包裹 element 的普通
页面，`Component` 是 Data Mode Guide 中的主要写法。

### 4. element 保存 React Node

`element?: React.ReactNode | null` 接收已经创建的 React Node，常见值是 JSX element：

```tsx
function CoursePage({ audience }: { audience: string }) {
  return <h1>{audience}课程目录</h1>
}

const route = {
  id: 'courses',
  path: '/courses',
  element: <CoursePage audience="本科生" />,
} satisfies RouteObject
```

这种形式可以在配置处传入 props，也可以保存包裹后的 element。值是 `<CoursePage />`，不是
`CoursePage`。

JSX 求值会创建 React element 描述，却不会立即执行 `CoursePage` 组件或创建 DOM。页面函数只有在
React 真正渲染匹配结果时才参与 render。

## 五、声明与选择路由对象

### 1. 用 satisfies 检查对象数组

可以直接给变量标注 `RouteObject[]`：

```tsx
const routes: RouteObject[] = [
  { id: 'home', path: '/', Component: HomePage },
]
```

也可以用 `satisfies`，在保留对象字面量具体信息的同时校验整个数组：

```tsx
const routes = [
  { id: 'home', path: '/', Component: HomePage },
  {
    id: 'courses',
    path: '/courses',
    element: <CoursePage audience="本科生" />,
  },
] satisfies RouteObject[]
```

`satisfies` 不是 React Router API，也不会在运行时转换对象。它只是让 TypeScript 及早发现错误字段和
错误值形状。

### 2. Component 与 element 只选一种

两个字段都能声明匹配后的 React UI，但它们是互斥选项：

| 需求                                      | 写法                                |
| ----------------------------------------- | ----------------------------------- |
| 保存普通页面组件类型                  | `Component: CoursePage`             |
| 在配置处传入 props                  | `element: <CoursePage mode="list" />` |
| 在配置处保存已包裹的 React element | `element: <Boundary><Page /></Boundary>` |

官方类型注释要求两者互斥，但 8.3.0 的 TypeScript 形状没有把这一规则编码为判别联合。因此
`satisfies RouteObject` 不一定会拒绝“同时填写”；应用代码仍必须遵守文档合同。

### 3. 识别 JSX 形式的 Route 配置

已有项目中可能看到：

```tsx
const routes = createRoutesFromElements(
  <Route id="home" path="/" Component={HomePage} />,
)
```

`createRoutesFromElements` 会把 JSX `<Route>` 转换成 Route Object。它是同一份配置的另一种输入表示，
不是新的 Router Mode。当前实现主线仍使用对象数组，不需要为同一组路由同时维护两种表示。

## 六、运行 Demo

下面的同源 Demo 预先建立两个独立的 memory router，两个样本都只在自己的 `/` 路径渲染：

1. `Component` 样本保存 `ComponentPage` 组件类型。
2. `element` 样本保存已传入 `audience` prop 的 React element。
3. 字段面板直接读取当前配置中的 `id`、`path` 和渲染字段名。
4. 切换按钮更换观察样本，不调用导航 API，也不改写学习站的 URL。

:::demo{id="react.router.learn.basics.route-objects.field-observer-demo"}
对照 Component 与 element 样本的字段值和渲染结果
:::

这个 Demo 没有使用 Link、编程式导航、嵌套出口或数据 API。可观察变量只有当前 Route Object 的
渲染字段形态。

## 七、易错使用提示

:::pitfalls

### 错误：把组件类型与 JSX element 写反

**触发条件：** 把 `<HomePage />` 交给 `Component`，或把 `HomePage` 函数交给 `element`。

**原因：** 忽略了 `ComponentType` 与 `ReactNode` 是两种不同的值。

**后果：** TypeScript 报告值不能赋给对应字段，路由配置无法通过类型检查。

**错误示例：**

```tsx
const routes = [
  { path: '/', Component: <HomePage /> },
  { path: '/courses', element: CoursePage },
] satisfies RouteObject[]
```

**正确写法：**

```tsx
const routes = [
  { path: '/', Component: HomePage },
  { path: '/courses', element: <CoursePage /> },
] satisfies RouteObject[]
```

**验证方式：** 运行 TypeScript 检查，确认数组满足 `RouteObject[]`。

### 错误：在同一对象中同时填写 Component 与 element

**触发条件：** 希望为同一地址配置一个主页面和一个备用页面。

**原因：** 把两种互斥的渲染表示误解为主备字段。

**后果：** 8.3.0 开发构建发出 warning；当前实现以 `Component` 生成的 element 为准，实际页面
与配置阅读者的预期可能不一致。

**错误示例：**

```tsx
const route = {
  path: '/',
  Component: HomePage,
  element: <FallbackPage />,
} satisfies RouteObject
```

**正确写法：**

```tsx
const route = {
  path: '/',
  Component: HomePage,
} satisfies RouteObject
```

**验证方式：** 逐条检查路由配置，并确认开发 console 没有 Component/element 冲突 warning。

### 错误：重复使用显式路由 ID

**触发条件：** 复制一条路由对象后修改 `path`，却保留原来的 `id`。

**原因：** 把 `id` 当成可重复的分类标签，而不是 Data Router 范围内的路由身份。

**后果：** Data Router 创建期检测到 ID 冲突并抛出错误，路由界面不能正常启动。

**错误示例：**

```tsx
const routes = [
  { id: 'page', path: '/', Component: HomePage },
  { id: 'page', path: '/courses', Component: CoursePage },
] satisfies RouteObject[]
```

**正确写法：**

```tsx
const routes = [
  { id: 'home', path: '/', Component: HomePage },
  { id: 'courses', path: '/courses', Component: CoursePage },
] satisfies RouteObject[]
```

**验证方式：** 创建 Data Router，确认没有 route id collision 错误，并检查显式 ID 在整棵树中唯一。

### 错误：把自动 ID 的当前格式当作业务合同

**触发条件：** 省略 `id` 后，在业务代码中依赖 `0`、`1-0` 这类当前实现生成的值。

**原因：** 把基于 route tree 位置的内部生成策略误当成稳定的公开 ID 规则。

**后果：** 重排路由数组或更换版本后，身份值可能变化，依赖该值的逻辑会指向错误路由。

**错误示例：**

```tsx
const routes = [{ path: '/', Component: HomePage }]
const homeRouteId = '0'
```

**正确写法：**

```tsx
const routes = [
  { id: 'home', path: '/', Component: HomePage },
] satisfies RouteObject[]
```

**验证方式：** 如果代码需要指代某条路由，检查它是否使用了配置中的显式 ID，而不是位置编号。

### 错误：把创建 element 理解为立即渲染组件

**触发条件：** 看到 `element: <CoursePage />` 就认为 `CoursePage` 已经执行并把 DOM 插入页面。

**原因：** 混淆了 React element 描述的创建与 React render 过程。

**后果：** 对组件执行时机做出错误推断，还可能把 `Component` 字段误解为自动懒加载。

**错误示例：**

```tsx
const route = {
  element: <CoursePage />,
} satisfies RouteObject

// 误以为此时 CoursePage 已经执行。
```

**正确写法：**

```tsx
const route = {
  element: <CoursePage />,
} satisfies RouteObject

// 此时只创建了 React element 描述。
```

**验证方式：** 分别在配置初始化位置和组件函数中打点，确认组件体只在 React 渲染它时执行。

:::

## 八、源码推导与适用场景

### 1. 官方事实：Component 会被转换为 element

React Router 8.3.0 的 `defaultMapRouteProperties` 会对输入路由进行映射。如果对象存在
`Component`，固定版本源码使用 `React.createElement(route.Component)` 创建 `element`。

课程推导：普通页面可以优先使用官方 Data Mode Guide 中的 `Component` 写法；确实需要在配置处
传入 props 或组装 element 时再使用 `element`。

边界：转换函数名、内部字段变化和创建时机属于 8.3.0 实现，不是业务代码应依赖的跨版本性能合同。

### 2. 官方事实：Data Router 会补齐并检查 route ID

8.3.0 在把输入 `RouteObject` 转换为内部 Data Route 时会补齐 `id`。显式 ID 重复时，创建过程会报告
route id collision。

课程推导：可以为教程与业务中需要稳定身份的路由使用简短、可读且唯一的显式 ID。

边界：公开输入类型仍然是 `id?: string`。省略 ID 是合法用法，而自动生成值的格式不是公开稳定承诺。

### 3. 官方事实：JSX Route 最终转换成对象

`createRoutesFromElements` 使用 `<Route>` props 构造 Route Object，并递归处理 JSX children。

课程推导：阅读已有 Data Router 代码时，可以把 JSX 形式还原为相同的配置记录来理解；新增配置时
保持项目已有的一种表示即可。

边界：转换器不改变 Data Mode 最终消费 Route Objects 的事实，也不表示需要同时建立对象和 JSX 两条实现主线。

### 4. 适用场景

Route Object 数组适合：

- 将 URL 与页面的对应关系收敛为可检查的配置数据。
- 在 Data Router 中统一管理路由身份和渲染声明。
- 使用 TypeScript 在创建 Router 之前发现字段值形状错误。
- 在后续增加其他路由能力时，保持每条逻辑路由的记录边界。

这些情况需要先确认边界：

- 只需根据普通 State 切换局部区域时，不应为每个组件状态创建 Route Object。
- 使用 Framework Mode 的 Route Module 时，路由定义会由工具链组装，不应强行复制一份手写 Data Mode 数组。
- 需要实际观察父子 URL、Outlet 或 index 页面时，仅理解对象结构还不足以说明运行结果。

## 九、练习

:::exercise

### 声明两种渲染字段

**要求：** 使用 `satisfies RouteObject[]` 创建两条平级静态路由。`/` 使用 `Component: HomePage`；
`/courses` 使用 `element: <CoursePage audience="student" />`。为两条路由分配不同的显式 ID。

**验收：** TypeScript 检查通过；每个对象只有一种渲染字段；两个 ID 唯一；把
`Component: HomePage` 故意改成 `Component: <HomePage />` 时，TypeScript 能指出值类型错误。

:::

## 十、本节小结

- Route Object 是用于描述一条逻辑路由的配置记录，不是组件或 Router 实例。
- `RouteObject` 是 index 与 non-index 两种对象形态的联合，其中普通分支可以通过 `children` 递归。
- 基础配置可以用唯一 `id`、静态 `path` 和一种渲染字段表达。
- `Component` 保存组件类型，`element` 保存 React Node；同一路由不应同时填写两者。
- 输入 `id` 可选，但显式且可读的唯一 ID 能在需要稳定身份时避免依赖位置生成值。
- `satisfies RouteObject[]` 可以在不运行 Router 的情况下检查配置对象的字段形状。

## 十一、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验稳定版本身份。
- [Route Object Guide](https://reactrouter.com/8.3.0/start/data/route-object) - Route Object 的定义与 Component 用法。
- [Data Routing Guide](https://reactrouter.com/8.3.0/start/data/routing) - 对象数组与递归 route tree 结构。
- [RouteObject Type](https://api.reactrouter.com/v8/types/react-router.RouteObject.html) - index 与 non-index 联合类型。
- [Base Route Object Fields](https://api.reactrouter.com/v8/types/react-router.BaseRouteObject.html) - path、id、Component 与 element 字段类型。
- [createRoutesFromElements](https://reactrouter.com/8.3.0/api/utils/createRoutesFromElements) - JSX Route 配置到 Route Object 数组的转换。
- [Route Object Source](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/utils.ts) - 固定版本的联合类型、Component 映射与 ID 转换实现。
- [React createElement](https://react.dev/reference/react/createElement) - React element 的创建与渲染语义。
