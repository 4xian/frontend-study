---
id: react.router.learn.basics.data-router-introduction
type: lesson
title: Data Router 入门
summary: 理解 Data Mode 的职责与启动链，使用 createBrowserRouter 和 RouterProvider 建立最小客户端路由入口。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - react.core.learn.advanced.lab-embedded-status-panel
related:
  - react.core.learn.basics.vite-react-project-setup
  - react.core.learn.basics.react-root-lifecycle
tags:
  - React Router
  - Data Mode
  - createBrowserRouter
  - RouterProvider
  - 客户端路由
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-19
objectives:
  - 能区分 Declarative、Data 与 Framework 三种 Mode 的职责边界。
  - 能解释 Route Object、Data Router、RouterProvider 与 React Root 的协作关系。
  - 能安装当前稳定的 react-router 包，并使用 v8 的浏览器端导入路径。
  - 能在 React 树外创建一个 createBrowserRouter 实例，再由 RouterProvider 渲染匹配结果。
  - 能判断完整 React 应用与嵌入式区域应该使用哪一种历史实现。
recap:
  - Data Mode 把路由配置移到 React 渲染之外，并在基础导航之上提供数据路由能力。
  - 浏览器入口从 react-router 导入 createBrowserRouter，从 react-router/dom 导入 RouterProvider。
  - router 是带状态和生命周期的长期对象，应在 React 树外创建一次并交给 RouterProvider。
  - createBrowserRouter 管理浏览器地址；嵌入式 Demo 可用 createMemoryRouter 隔离宿主历史。
  - Framework Mode 在 Data Mode 之上增加工具链能力，不是本课程的重复实现路线。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本。
  - title: React Router 8.3.0 Data Mode Installation
    url: https://reactrouter.com/8.3.0/start/data/installation
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Data Mode 安装 react-router，并用 createBrowserRouter 与 RouterProvider 建立入口。
      - Data Router 应在 React 树外创建一次。
  - title: React Router 8.3.0 Picking a Mode
    url: https://reactrouter.com/8.3.0/start/modes
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Declarative、Data 与 Framework Mode 的能力关系和选择边界。
  - title: React Router 8.3.0 createBrowserRouter
    url: https://reactrouter.com/8.3.0/api/data-routers/createBrowserRouter
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - createBrowserRouter 接收 RouteObject 数组并返回初始化后的 DataRouter。
  - title: React Router 8.3.0 RouterProvider
    url: https://reactrouter.com/8.3.0/api/data-routers/RouterProvider
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - RouterProvider 渲染 DataRouter，并推荐浏览器环境使用 react-router/dom 导出。
  - title: React Router 8.3.0 createMemoryRouter
    url: https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 使用内存历史与 initialEntries 创建 DataRouter。
  - title: React Router 8.3.0 Package Metadata
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/package.json
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - v8 的 Node、React、React DOM 下限以及根入口与 dom 子路径导出。
  - title: React Router 8.3.0 Browser Router Source
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/dom/lib.tsx#L649
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - createBrowserRouter 组合浏览器历史与核心 router，并返回初始化后的实例。
  - title: React Router 8.3.0 DOM RouterProvider Source
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/dom-export/dom-router-provider.tsx
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - react-router/dom 的 RouterProvider 为基础 Provider 注入 ReactDOM.flushSync。
---

# Data Router 入门

## 一、学习目标

- 能用一句话说明 Data Mode 相比 Declarative Mode 多管理了什么。
- 能画出 `Route Object → createBrowserRouter → RouterProvider → 路由页面` 的启动链。
- 能使用 `react-router` 与 `react-router/dom` 的当前导入路径完成最小入口。
- 能把 router 实例放在 React 树外，避免组件每次 render 时重复创建。
- 能区分完整浏览器应用的地址历史与嵌入式观察区的内存历史。

本知识点只建立 Data Router 的入口模型。路由字段组合、导航控件、嵌套、数据加载和提交等能力不在这里
展开。

## 二、为什么需要 Data Router

没有路由时，一个 React Root 仍然可以根据 State 切换组件，但浏览器地址不会自然成为界面状态的一部分：

```tsx
function App() {
  const [page, setPage] = useState<'home' | 'courses'>('home')

  return page === 'home' ? <Home /> : <Courses />
}
```

这种局部 State 可以切换画面，却没有回答客户端应用常见的路由问题：

- 输入某个 URL 时应该显示哪个页面？
- 刷新、前进和后退时，URL 与界面怎样保持一致？
- 导航发生时，页面所需数据、提交过程和等待状态由谁协调？
- 一个地址没有匹配结果或加载失败时，错误由哪个边界处理？

React Router 把 URL、匹配结果和导航状态放进一个 router 对象。Data Mode 再把路由配置移到 React
渲染之外，使同一份路由定义可以承载匹配、导航以及后续的数据交互能力。

这并不表示所有应用状态都应该进入 URL。表单输入草稿、临时展开状态和只属于一个组件的交互状态仍然
可以由 React State 管理；能够被分享、刷新恢复或浏览器历史记录的页面位置更适合由路由管理。

## 三、认识 Data Mode

### 1. 三种 Mode 是递增能力，不是三套路由产品

React Router 8.3.0 的官方文档区分三种使用方式：

| Mode        | 顶层入口示例                                | 主要职责                                                   |
| ----------- | ------------------------------------------- | ---------------------------------------------------------- |
| Declarative | `<BrowserRouter>`                           | 基础匹配、导航、活动状态与 URL 读取                        |
| Data        | `createBrowserRouter` + `<RouterProvider />` | 在基础能力上增加 loader、action、pending、Fetcher 等协调   |
| Framework   | React Router Vite 插件与 Route Module       | 在 Data Mode 上增加类型生成、代码拆分与多种渲染策略工具链 |

三者的能力是递增关系。Data Mode 已经拥有客户端匹配和导航能力，不需要再嵌套一个 Declarative
Router。Framework Mode 也建立在 Data Mode 之上，不是另一套需要重复学习的客户端路由语法。

本课程选择 Data Mode，是因为它保留 bundling、数据来源和服务端抽象的控制权，同时提供完整的数据路由
能力。只维护旧项目时可能看到 `<BrowserRouter>`；使用 Framework Mode 时则会看到 Vite 插件、
`routes.ts` 与 Route Module。识别这些入口即可，不要在同一个应用根上叠加多种顶层 Router。

### 2. Route Object 是配置输入

`createBrowserRouter` 接收一个 Route Object 数组。最小对象只需要描述地址和匹配后显示的 React
组件：

```tsx
const routes = [
  {
    path: '/',
    Component: Home,
  },
]
```

这里先把 Route Object 理解为“URL 与页面能力的配置记录”。`path` 表示它参与匹配的地址，
`Component` 表示匹配成功后渲染的组件。对象还可以承载更多职责，但当前启动链不依赖那些字段。

### 3. Data Router 是长期运行对象

```tsx
const router = createBrowserRouter(routes)
```

`createBrowserRouter` 返回一个已经初始化的 Data Router。它不是 React 组件，也不是一份只读配置；它
持有当前位置、匹配结果、导航过程和订阅等运行状态。

因此 router 应在 React 树外创建一次：

```text
模块初始化
  -> 创建唯一 router
  -> React Root render
  -> RouterProvider 订阅 router
  -> URL 或导航变化
  -> router 更新状态
  -> RouterProvider 提交新的路由界面
```

把 router 放进组件函数，会让组件的 render 生命周期参与 router 的创建。重复 render 可能产生新实例、
重复历史监听或丢失正在进行的导航状态。

### 4. RouterProvider 把 router 接入 React 树

```tsx
<RouterProvider router={router} />
```

`RouterProvider` 接收唯一 router，通过订阅把 router 状态转换成当前应渲染的 React element。它通常位于
这个 React 应用树的顶层；路由页面来自 Route Object，而不是作为 `RouterProvider` 的 children 传入。

浏览器 DOM 环境应从 `react-router/dom` 导入 `RouterProvider`。该入口在基础 Provider 之外接入
`ReactDOM.flushSync`，是官方安装页和 API 文档给出的浏览器用法。

## 四、安装与基本用法

### 1. 先核对运行基线

React Router 8.3.0 的包元数据要求：

- Node.js `>=22.22.0`。
- React `>=19.2.7`。
- React DOM `>=19.2.7`。

安装成功但忽略 engine 或 peer dependency warning，不等于运行基线已经满足。先检查项目声明和实际
Node.js 版本，再安装路由包。

### 2. 只安装 Data Mode 需要的包

```sh
npm install react-router@8.3.0
```

React Router v8 的新项目直接使用 `react-router`。不要为了旧教程兼容而额外安装
`react-router-dom`，也不需要为 Data Mode 安装 Framework Mode 的开发插件。

浏览器入口会使用两个导出位置：

```tsx
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
```

- `react-router` 根入口提供路由创建器、组件、Hooks 和类型。
- `react-router/dom` 提供接入 React DOM 能力的 `RouterProvider`。

### 3. 在 React 树外创建 router

```tsx
function Home() {
  return <h1>课程中心</h1>
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
])
```

`Home` 是普通 React 组件。`router` 声明在组件之外，所以 `Home` 的任何 render 都不会创建第二个
router。

大型项目可以把 Route Object 放进独立模块，但“拆文件”不是正确性的前提。无论文件如何组织，应用入口
最终只应取得一个稳定的 router 实例。

### 4. 用 RouterProvider 启动路由界面

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

function Home() {
  return <h1>课程中心</h1>
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
])

const container = document.getElementById('root')
if (!container) throw new Error('页面缺少 React 根容器 #root')

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

启动顺序不能交换：

1. HTML 提供 React Root 的 DOM 容器。
2. 模块在 React 树外创建 Data Router。
3. `createRoot` 建立 React 与 DOM 容器的边界。
4. `RouterProvider` 订阅 router，并渲染当前 URL 的匹配结果。

访问 `/` 时，router 匹配到唯一 Route Object，`RouterProvider` 显示 `Home`。这里没有把站点导航、
数据请求或错误处理塞进入口文件；入口只负责组装长期对象。

## 五、完整最小示例

### 1. 使用 element 也可以建立入口

Route Object 可以直接提供 `element`：

```tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <main>Data Router 已启动</main>,
  },
])
```

`Component: Home` 保存组件类型，`element: <Home />` 保存已经创建的 React element。两者都能完成
这个最小入口，但同一个 Route Object 不需要同时提供两种渲染形式。

### 2. 最小结果仍然包含完整协作链

即使只有一个 `/` 路由，仍然有四个不同角色：

| 角色             | 当前示例中的值                         | 所有权                   |
| ---------------- | -------------------------------------- | ------------------------ |
| DOM 容器         | `document.getElementById('root')`      | 浏览器页面或外部宿主     |
| React Root       | `createRoot(container)`                | React DOM                |
| Data Router      | `createBrowserRouter(routes)`          | React Router             |
| 路由 React element | `<RouterProvider router={router} />` | 当前 React Root          |

React Root 负责“把 React 树放进哪个 DOM 区域”，Data Router 负责“当前 URL 对应哪段路由 UI”。二者不能
互相替代。

### 3. 浏览器历史与内存历史服务于不同边界

完整浏览器应用通常使用 `createBrowserRouter`，让 URL、刷新、前进和后退共同参与路由。嵌入另一个应用
的局部观察区如果不拥有地址栏，则可以使用 `createMemoryRouter`：

```tsx
const previewRouter = createMemoryRouter(routes, {
  initialEntries: ['/'],
})
```

`createMemoryRouter` 仍然返回 Data Router，但位置栈保存在内存中。它适合测试、组件演示或其他不应改写
宿主 URL 的隔离环境，不应因为配置方便就替代完整站点的浏览器历史。

## 六、运行 Demo

下面的同源 Demo 展示最小链路：

1. Route Object 把 `/` 指向一个普通 React 组件。
2. Demo 加载器在 React 树外创建本次挂载独享的 memory router。
3. `RouterProvider` 订阅该 router，并渲染匹配页面。
4. 内存历史不会接管学习站地址栏；离开 Demo 时 React Root 和 Provider 订阅随宿主卸载。

:::demo{id="react.router.learn.basics.data-router-introduction.router-provider-demo"}
观察 Route Object、Data Router 与 RouterProvider 如何组成最小启动链
:::

Demo 使用 `createMemoryRouter` 是嵌入边界要求。普通 React 单页应用仍以本课前面的
`createBrowserRouter` 入口为主线。

## 七、易错使用提示

:::pitfalls

### 错误：在 v8 新项目中沿用 `react-router-dom`

**触发条件：** 按旧教程安装 `react-router-dom`，并从它导入所有浏览器 API。

**原因：** React Router v8 已移除这个兼容重导出包，新主线使用 `react-router` 与
`react-router/dom`。

**后果：** 项目停留在旧主版本或出现无法解析的依赖，代码与当前官方文档的导出路径不一致。

**错误示例：**

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
```

**正确写法：**

```tsx
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
```

**验证方式：** 检查 lockfile 只安装当前主线 `react-router`，再由类型检查确认两个导入路径有效。

### 错误：在组件 render 中创建 router

**触发条件：** 把 `createBrowserRouter` 写进 `App` 或其他会重复 render 的组件。

**原因：** 把带有导航状态和订阅的长期对象误当成普通 render 计算结果。

**后果：** 组件重复 render 时可能建立新的 router，导致历史监听重复、导航状态丢失或界面重置。

**错误示例：**

```tsx
function App() {
  const router = createBrowserRouter(routes)
  return <RouterProvider router={router} />
}
```

**正确写法：**

```tsx
const router = createBrowserRouter(routes)

function App() {
  return <RouterProvider router={router} />
}
```

**验证方式：** 在组件发生 State 更新前后比较 router identity；同一个应用入口应保持同一实例。

### 错误：给 RouterProvider 传页面 children

**触发条件：** 把 `RouterProvider` 当作 `BrowserRouter` 的普通包装组件使用。

**原因：** Data Mode 的页面来自 router 保存的 Route Object，不从 Provider children 读取。

**后果：** TypeScript 报告 props 不匹配，或者开发者误以为 children 会参与路由匹配。

**错误示例：**

```tsx
<RouterProvider router={router}>
  <App />
</RouterProvider>
```

**正确写法：**

```tsx
const router = createBrowserRouter([{ path: '/', Component: App }])

<RouterProvider router={router} />
```

**验证方式：** 确认页面组件登记在 Route Object 中，Provider 只接收当前 Data Router。

### 错误：浏览器应用忽略 DOM 版 RouterProvider

**触发条件：** 在 DOM 环境从 `react-router` 根入口导入 `RouterProvider`。

**原因：** 根入口的 Provider 不会自动注入 React DOM 的 `flushSync` 实现。

**后果：** 普通渲染可能暂时可见，但请求 flushSync 的路由更新会缺少 DOM 实现并产生 warning。

**错误示例：**

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
```

**正确写法：**

```tsx
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
```

**验证方式：** 检查入口导入，并确认浏览器交互期间 console 没有 RouterProvider flushSync warning。

### 错误：嵌入式区域争用宿主浏览器历史

**触发条件：** 页面已经有一个拥有地址栏的 Router，又在局部 Demo 或微前端中直接创建第二个
`createBrowserRouter`。

**原因：** 两个独立 Router 都把全局 URL 和 History API 当作自己的导航来源。

**后果：** 局部交互可能改写宿主路径，刷新后进入错误入口，返回栈也难以确定由谁负责。

**错误示例：**

```tsx
const embeddedRouter = createBrowserRouter(previewRoutes)
```

**正确写法：**

```tsx
const embeddedRouter = createMemoryRouter(previewRoutes, {
  initialEntries: ['/'],
})
```

**验证方式：** 操作嵌入区域前后读取宿主 `window.location.href`；不拥有地址栏的区域不应改写它。

:::

## 八、源码推导与适用场景

### 1. 官方事实：浏览器创建器组合了 History 与核心 Router

React Router 8.3.0 的固定源码显示，`createBrowserRouter` 把
`createBrowserHistory(...)` 传给核心 `createRouter(...)`，最后调用 `initialize()` 并返回结果。

由此可以确认两个公共用法背后的事实：

- 返回值不是 Route Object 数组，而是已经初始化的 Data Router。
- browser 变体明确连接浏览器 History，因此它拥有全局 URL 变化这一运行边界。

课程推导：完整客户端应用应在入口创建这个长期对象，而不是把它作为组件 render 的临时值。

边界：`createRouter`、`initialize` 的内部调用顺序属于 8.3.0 实现，不应被业务代码直接调用或当作跨版本
公共承诺；公共合同仍以 `createBrowserRouter` API 为准。

### 2. 官方事实：DOM Provider 注入 ReactDOM.flushSync

固定版本的 `react-router/dom` 源码用基础 `RouterProvider` 再包装一层，并把
`ReactDOM.flushSync` 传入。官方 API 因而建议 DOM 环境使用这个子路径导出。

课程推导：导入路径表达运行环境。浏览器 React DOM 应使用 `react-router/dom`；非 DOM 渲染器才需要
重新判断 Provider 入口。

边界：这不表示应用需要主动调用 `flushSync`。Provider 负责集成，业务代码仍通过公开导航和路由状态
API 工作。

### 3. 适用场景

Data Mode 适合这些场景：

- 希望自行控制 Vite 配置、部署方式、API 客户端和服务端抽象。
- 需要客户端匹配与导航，并准备逐步使用数据加载、提交和等待状态。
- 已有 React 应用希望逐步接入 Data Router，而不是立即采用完整 Framework 工具链。

以下情况需要先确认边界：

- 只维护旧 Declarative 项目时，先识别现有 `<BrowserRouter>`，不要无目标地叠加 Provider。
- 需要 Framework Mode 的类型生成、SSR 或静态渲染工具链时，应按 Framework 入口设计，不把插件能力
  伪装成普通 Data Mode 配置。
- React 只是更大宿主中的局部区域时，先决定谁拥有地址栏；没有所有权的区域使用内存历史或由宿主传入
  导航合同。

## 九、练习

:::exercise

### 建立最小课程入口

**要求：** 在一个 React + TypeScript 项目中安装当前课程版本，只创建 `/` Route Object，在 React 树外
调用 `createBrowserRouter`，并从 `react-router/dom` 导入 `RouterProvider` 完成渲染。把页面文字改为
“路由入口已连接”。

**验收：** 访问 `/` 能看到指定文字；组件 State 更新前后 router identity 不变；类型检查通过；浏览器
console 没有重复 Router、无法匹配或 flushSync 相关 warning。

:::

## 十、本节小结

- Data Mode 用 React 树外的 Route Object 和 Data Router 统一管理路由运行状态。
- `createBrowserRouter` 创建浏览器 Data Router，`RouterProvider` 把它接入 React 树。
- React Router v8 新主线安装 `react-router`，DOM Provider 从 `react-router/dom` 导入。
- router 应在 React 树外创建一次；页面组件登记在 Route Object 中，不作为 Provider children 传入。
- 浏览器历史属于拥有地址栏的完整应用；嵌入式观察区可以使用 memory router 保持隔离。
- Declarative、Data、Framework 是递增能力层级，本课程只以 Data Mode 建立完整实现主线。

## 十一、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验稳定版本身份。
- [Data Mode Installation](https://reactrouter.com/8.3.0/start/data/installation) - 安装、入口导入与 router 创建位置。
- [Picking a Mode](https://reactrouter.com/8.3.0/start/modes) - 三种 Mode 的能力与选择边界。
- [createBrowserRouter](https://reactrouter.com/8.3.0/api/data-routers/createBrowserRouter) - 浏览器 Data Router 的签名和返回值。
- [RouterProvider](https://reactrouter.com/8.3.0/api/data-routers/RouterProvider) - Provider 职责与 DOM 导入建议。
- [createMemoryRouter](https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter) - 内存历史与初始位置配置。
- [Package Metadata](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/package.json) - 运行基线与包导出。
- [Browser Router Source](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/dom/lib.tsx#L649) - 浏览器历史与核心 Router 的固定版本实现。
- [DOM RouterProvider Source](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/dom-export/dom-router-provider.tsx) - DOM Provider 的固定版本封装。
