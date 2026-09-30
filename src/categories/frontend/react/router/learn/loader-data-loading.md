---
id: react.router.learn.intermediate.loader-data-loading
type: lesson
title: Loader 数据加载
summary: 在路由组件渲染前准备数据，并用 useLoaderData 读取当前 route 的加载结果。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 90
prerequisites:
  - react.router.learn.basics.lab-nested-documentation-center
related:
  - react.router.learn.basics.data-router-introduction
  - react.router.learn.basics.route-objects
  - react.router.learn.basics.route-params
tags:
  - React Router
  - Data Mode
  - loader
  - useLoaderData
  - LoaderFunctionArgs
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-20
objectives:
  - 能解释 loader 为什么属于 route object，而不是路由组件内的 Effect。
  - 能为带动态段的 route 编写 LoaderFunctionArgs，并从 params 选择要加载的数据。
  - 能区分 loader 直接返回普通值、返回 Promise 与返回 Response 时的消费结果。
  - 能用 useLoaderData<typeof loader> 读取当前 route 的类型化数据。
  - 能说明 Data Router 从执行 loader 到按 route ID 保存和提供数据的最小路径。
  - 能判断 loader 适合准备哪些路由级数据，并识别不属于本课的数据流程。
recap:
  - loader 是 Data Mode route object 的数据入口，在对应 route component 渲染前准备数据。
  - LoaderFunctionArgs 在 8.3.0 中包含 request、url、pattern、params 与 context，本课主要使用 params。
  - loader 可以返回普通值或 Promise；普通对象无需 JSON.stringify。
  - Response 会按 Content-Type 解析 body，useLoaderData 得到解析结果而不是 Response 实例。
  - useLoaderData 读取最近 route 按 ID 保存的数据，typeof loader 可把返回类型带到组件。
  - loader 负责路由级数据边界，不替代组件本地交互状态、缓存策略或错误处理设计。
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
      - route loader 为 route component 提供数据。
      - 导航时 loader 在对应 route component 渲染前运行，组件通过 useLoaderData 读取结果。
  - title: React Router 8.3.0 Route Object Loader
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/route-object.md#L104-L134
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - loader 是 Data Mode route object 的公开字段。
      - loader 返回数据由对应 route component 消费。
  - title: React Router 8.3.0 Loader Types
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L269-L364
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - LoaderFunctionArgs 包含 request、url、pattern、params 与 context。
      - LoaderFunction 可以返回同步值或 Promise，返回值类型为 unknown。
  - title: React Router 8.3.0 Loader Execution Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6624-L6687
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Router 用当前 request、URL、pattern、match params 与 scoped context 调用 loader。
  - title: React Router 8.3.0 Loader Result Conversion
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6765-L6852
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 普通返回值直接成为 loader data。
      - Response 按 Content-Type 解析为 JSON 或文本后成为 loader data。
  - title: React Router 8.3.0 Loader Data Storage Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L7005-L7088
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 成功的 loader 结果按匹配 route ID 写入 loaderData。
  - title: React Router 8.3.0 useLoaderData Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1602-L1606
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - useLoaderData 读取当前 route ID 对应的 state.loaderData。
  - title: React Router 8.3.0 createMemoryRouter
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L19-L104
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 创建使用内存 history 的 Data Router，适合隔离嵌入式 Demo。
---

# Loader 数据加载

## 一、学习目标

- 能解释 `loader` 为什么写在 route object 上，而不是写成组件挂载后的数据 Effect。
- 能为带动态段的 route 编写 `LoaderFunctionArgs`，并从 `params` 选择本地或远程资源。
- 能区分 loader 返回普通值、Promise 与 `Response` 时，路由组件实际读到的内容。
- 能用 `useLoaderData<typeof loader>()` 在对应 route component 中读取类型化结果。
- 能追踪“执行 loader、按 route ID 保存、组件读取”的最小数据路径。
- 能判断哪些数据属于路由加载边界，哪些状态仍应留在组件或其他专门的数据层。

## 二、为什么需要 Loader

组件只依靠 Effect 加载路由数据时，首次 render 通常只能先面对“还没有数据”的状态：

```tsx
function ProjectPage() {
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    void getProject().then(setProject)
  }, [])

  if (!project) return <p>正在加载...</p>
  return <h1>{project.name}</h1>
}
```

这段代码并非永远错误，但它让 route 和数据生命周期彼此看不见。Router 先提交页面，再由组件发起请求；
如果多个 route 都这样做，导航、参数变化和数据准备就散落在组件 Effect 中。

Data Mode 把路由级数据入口放回 route object：

```text
URL 与 route 匹配
        ↓
Router 调用匹配 route 的 loader
        ↓
loader 返回页面需要的数据
        ↓
Router 保存结果并渲染 route component
        ↓
组件通过 useLoaderData 读取
```

这样 route object 同时说明“哪个 URL 渲染哪个组件”和“该组件渲染前需要什么数据”。本课先建立这条
最小链路；提交、等待态、重定向、错误边界和重新验证各自有独立的数据流程，不在这里提前展开。

## 三、核心概念

### 1. `loader` 属于 Data Mode route object

`loader` 是 route object 的字段。只有 Data Router 会协调它；只使用 `<BrowserRouter>` 和 `<Routes>` 的
Declarative Mode 不会执行 route object loader。

```tsx
import { createBrowserRouter } from 'react-router'

const router = createBrowserRouter([
  {
    path: '/projects/:projectId',
    loader: projectLoader,
    Component: ProjectPage,
  },
])
```

这里的 `projectLoader` 与 `ProjectPage` 归属于同一个 route。当前 URL 匹配这条 route 时，Router 先取得
loader 结果，再让 `ProjectPage` 进入正常渲染。

### 2. 最小数据所有权

loader 适合准备由 URL 和 route 身份决定的数据，例如：

- `/projects/:projectId` 对应的项目详情。
- `/courses/:courseId` 对应的课程记录。
- 页面首次渲染就需要的权限摘要或配置快照。

下面这些状态通常不必放进 loader：

- 只影响当前组件的输入框草稿、展开状态或悬停状态。
- 与 route 无关、由一次局部点击临时产生的 UI 状态。
- 需要专门缓存策略且已经由其他数据层负责的数据副本。

判断重点不是“数据来自哪里”，而是“它是否属于这条 route 在渲染前应准备的输入”。

### 3. Loader 的执行与渲染顺序

官方 Data Mode 合同说明：用户在 routes 之间导航时，匹配 route 的 loaders 会在 route components 渲染前
调用。loader 可以是同步函数，也可以返回 Promise；Router 负责等待它完成。

```tsx
async function projectLoader({ params }: LoaderFunctionArgs) {
  const project = await getProject(params.projectId)
  return { project }
}
```

“渲染前”表示 Router 会先得到本次 loader 结果，再把相应 route component 作为已提交内容渲染；它不表示
浏览器主线程被同步阻塞，也不保证网络瞬间完成。如何为等待过程设计界面属于专门的 Pending UI。

## 四、定义 Loader

### 1. `LoaderFunctionArgs` 的当前形状

React Router 8.3.0 的 `LoaderFunctionArgs` 继承以下参数：

| 字段 | 含义 | 本课边界 |
| --- | --- | --- |
| `params` | 当前 match 捕获的动态路径参数 | 用它选择当前资源 |
| `request` | 本次数据加载对应的 Fetch API `Request` | 只识别其请求身份 |
| `url` | Router 提供的目标 `URL` | 只识别，不展开 |
| `pattern` | 当前匹配的未插值 route pattern | 只识别，不展开 |
| `context` | Router 的依赖注入上下文 | 不等于 React Context |

旧资料可能只列出 `request`、`params` 与 `context`。编写当前版本课程和类型时，应以 8.3.0 的公开类型
为准，不删去 `url` 与 `pattern`，也不要把 `context` 误认为组件树中的 `createContext` 值。

### 2. 用 `params` 选择资源

动态段先由 matcher 捕获为字符串，loader 再决定如何查询数据：

```tsx
import type { LoaderFunctionArgs } from 'react-router'

const projects = [
  { id: 'atlas', name: 'Atlas 控制台' },
  { id: 'harbor', name: 'Harbor 发布中心' },
]

function projectLoader({ params }: LoaderFunctionArgs) {
  const project = projects.find((item) => item.id === params.projectId)
  return { project, requestedId: params.projectId ?? '' }
}
```

`params.projectId` 仍然是 `string | undefined`。loader 获得参数并不表示资源一定存在；示例把未知 ID
返回为普通空数据，组件可以据此显示明确空态。抛出错误或重定向到其他 URL 属于后续课程。

### 3. `request` 表示本次数据请求

loader 得到的 `request` 是 Fetch API `Request`。它不是 React 合成事件，也不是 route component 的 props：

```tsx
function projectLoader({ params, request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url)

  return {
    requestedPathname: requestUrl.pathname,
    project: projects.find((item) => item.id === params.projectId),
  }
}
```

本例只读取 pathname，让页面能观察 loader 处理的是哪个 URL。请求 headers、查询参数、取消信号和根据
请求结果执行重定向，需要单独理解请求边界，不在本课扩展。

## 五、返回与读取数据

### 1. 直接返回普通值

loader 可以返回对象、数组、字符串、数字或其他普通值，也可以返回这些值的 Promise。页面数据通常直接
返回对象即可：

```tsx
function projectLoader({ params }: LoaderFunctionArgs) {
  return {
    project: projects.find((item) => item.id === params.projectId),
  }
}
```

不要先调用 `JSON.stringify`。那会把对象变成字符串，Router 不会把普通字符串再次猜成 JSON。

### 2. 返回 `Response` 时读取 body

loader 也可以返回 Fetch API `Response`：

```tsx
function projectLoader() {
  return Response.json({ name: 'Atlas 控制台' })
}
```

在 8.3.0 的固定实现中，Router 会读取 response body：`Content-Type` 包含 `application/json` 时调用
`response.json()`，其他类型调用 `response.text()`。因此 `useLoaderData` 得到的是解析后的对象或文本，
不是 `Response` 实例。

本课主示例直接返回普通对象，因为它最清楚地表达 route data；`Response` 对照只用于说明返回边界。

### 3. 用 `useLoaderData` 消费当前 route 数据

对应 route component 在顶层调用 `useLoaderData`：

```tsx
import { useLoaderData } from 'react-router'

function ProjectPage() {
  const { project, requestedId } = useLoaderData<typeof projectLoader>()

  if (!project) {
    return <p>没有找到项目：{requestedId}</p>
  }

  return <h1>{project.name}</h1>
}
```

`typeof projectLoader` 让 TypeScript 从 loader 返回值推导组件数据 shape，避免再手写一份容易漂移的
interface。这个类型关系不会在运行时校验后端响应；真实远程数据仍需要在数据边界做必要校验。

`useLoaderData` 读取最近 route 的 loader data。跨 route 读取和在匹配链中共享数据有自己的 API 与设计
取舍，本课只让定义 loader 的 route component 消费自己的结果。

## 六、Loader 数据观察台

下面的 Demo 使用独立 `createMemoryRouter`，不会修改学习站外层 URL。三个项目入口都命中同一条
`/projects/:projectId` route：

1. 首次进入 Atlas，loader 从 `params.projectId` 选择本地项目并返回对象。
2. 切换到 Harbor，新的 URL 让同一 route loader 为 Harbor 准备数据。
3. 打开未知 ID，loader 返回 `project: undefined`，组件显示普通空态。
4. 结果区同时展示 `request.url` 对应的 pathname、请求 ID 和 `useLoaderData` 读到的记录。

:::demo{id="react.router.learn.intermediate.loader-data-loading.loader-data-demo"}
:::

观察时把注意力放在数据所有权，而不是加载动画：导航目标先进入 route loader，组件只消费 Router 已经
提交的当前结果。Demo 没有人为延时，也不实现 pending、redirect 或错误边界。

## 七、易错使用提示

:::pitfalls
### 错误：把普通对象序列化后再返回

**触发条件：** loader 已经得到普通对象，却先调用 `JSON.stringify`。

**原因：** loader 可以直接返回普通值；字符串也是合法数据，Router 不会猜测它是否原本是对象。

**后果：** `useLoaderData` 得到字符串，组件无法按对象字段读取。

**错误示例：**

```tsx
return JSON.stringify({ project })
```

**正确写法：**

```tsx
return { project }
```

**验证方式：** 在组件中读取 `typeof data` 和 `data.project`，确认返回值保持对象 shape。

### 错误：认为所有 `Response` 都会变成 JSON

**触发条件：** loader 返回普通文本 `Response`，组件却按对象字段消费。

**原因：** 固定版本根据 `Content-Type` 选择 `json()` 或 `text()`。

**后果：** 组件实际得到字符串，类型断言与运行结果不一致。

**错误示例：**

```tsx
return new Response('{"ok":true}', {
  headers: { 'Content-Type': 'text/plain' },
})
```

**正确写法：**

```tsx
return Response.json({ ok: true })
```

**验证方式：** 分别返回 `application/json` 与 `text/plain`，检查 `useLoaderData` 得到对象还是文本。

### 错误：在组件中手动调用 loader

**触发条件：** route component 为了取得数据，在渲染期间直接调用 `projectLoader`。

**原因：** loader 由 Router 在渲染 route component 前执行，组件应读取 Router 已保存的结果。

**后果：** 组件绕开 Router 的加载流程，还需要自行拼装 loader 参数并处理异步结果。

**错误示例：**

```tsx
const data = projectLoader({ params })
```

**正确写法：**

```tsx
const data = useLoaderData<typeof projectLoader>()
```

**验证方式：** 记录 loader 执行次数，确认组件只读取 Router 提供的数据，没有再次调用 loader。

### 错误：把 loader `context` 当成 React Context

**触发条件：** 期望 loader 直接调用组件 Hook，或读取组件树中的 Provider。

**原因：** LoaderFunctionArgs 的 `context` 是 Router 的依赖注入上下文，不是 React Context。

**后果：** Hook 调用位置错误，或者 loader 得不到预期的组件树值。

**错误示例：**

```tsx
function loader() {
  return { theme: useContext(ThemeContext) }
}
```

**正确写法：**

```tsx
function loader({ context }: LoaderFunctionArgs) {
  return { contextProvidedByRouter: context }
}
```

**验证方式：** 检查值是否通过 Data Router 的上下文配置提供，不在 loader 内调用 React Hook。

### 错误：在 route component render 中创建 Router

**触发条件：** 每次组件函数执行时都调用 `createMemoryRouter` 或 `createBrowserRouter`。

**原因：** render 可以反复发生，每次创建都会产生新的 Router、history 与 loader data 所有者。

**后果：** 导航和数据状态被重置，loader 可能重复初始化。

**错误示例：**

```tsx
function App() {
  const router = createMemoryRouter(routes)
  return <RouterProvider router={router} />
}
```

**正确写法：**

```tsx
const router = createMemoryRouter(routes)

function App() {
  return <RouterProvider router={router} />
}
```

**验证方式：** 触发父组件重渲染，确认 Router 实例和当前 location 没有被重新创建。
:::

## 八、源码推导与适用场景

### 1. Loader 参数来自当前匹配

**官方事实：** 固定版本在执行 loader 时传入当前 `request`、目标 `url`、未插值 `pattern`、
`match.params` 与 scoped `context`。

**课程推导：** route loader 可以直接使用当前匹配参数选择资源，不需要组件先 render 再把参数转交给
Effect。

**边界：** 参数只描述 URL 匹配结果，不证明资源存在、响应 shape 正确或用户具有访问权限。

### 2. Loader data 按 route ID 保存

**官方事实：** 固定版本把成功结果写入 `loaderData[match.route.id]`，导航完成时把 loader data 合并进
Router state。

**课程推导：** 数据所有权与 route 身份绑定；每条 route 应只返回自己渲染所需的清晰数据 shape。

**边界：** 跨 route 共享、重新验证和缓存寿命不能仅从这一步推出，需要分别使用对应公开 API 和策略。

### 3. `useLoaderData` 按当前 route ID 消费

**官方事实：** 固定版本的 `useLoaderData` 先取得当前 route ID，再返回
`state.loaderData[routeId]`。

**课程推导：** 在定义该 loader 的 route component 中调用 `useLoaderData`，能让生产者与消费者保持
最短对应关系。

**边界：** `typeof loader` 提供静态类型推导，不会为不可信远程响应增加运行时 schema 校验。

### 4. 适用场景与边界

loader 适合路由渲染所需、能由 URL 或 route 上下文确定的数据。它不自动提供：

- 组件局部交互状态管理。
- 任意缓存层、去重策略或永久数据存储。
- 表单提交与数据修改。
- 等待态、重定向和错误界面的完整设计。
- 跨 route 读取与共享的所有权规则。

保持这些边界后，本课的心智模型只有一条：route 声明 loader，Router 在渲染前准备并保存结果，当前
route component 用 `useLoaderData` 消费。

## 九、练习

:::exercise
### 练习目标

**要求：** 创建 `/courses/:courseId` route 和 `courseLoader`。准备两条本地课程记录；loader 使用
`LoaderFunctionArgs` 的 `params.courseId` 选择记录，并直接返回 `{ course, requestedId }`。在
`CoursePage` 中用 `useLoaderData<typeof courseLoader>()` 读取结果。为有效 ID 显示课程标题，为未知 ID
显示“没有找到课程”，但不要 redirect、throw、添加人为延时或在组件 Effect 中再次加载。

**验收：** 两个有效 URL 分别显示对应记录；未知 ID 仍命中相同 route 并显示普通空态；返回值保持对象，
没有 `JSON.stringify`；Router 创建位置不在 route component render 内。
:::

## 十、本节小结

- `loader` 是 Data Mode route object 的数据入口，在对应 route component 渲染前准备数据。
- `LoaderFunctionArgs` 在 8.3.0 中包含 `request`、`url`、`pattern`、`params` 与 `context`。
- 动态参数仍是字符串或 `undefined`；匹配成功不等于资源存在。
- 普通对象可以直接返回，Promise 会被等待，`Response` 会先按内容类型解析 body。
- `useLoaderData<typeof loader>()` 读取当前 route 的 loader data，并复用 loader 返回类型。
- loader 负责路由级数据准备，不替代局部 UI 状态、缓存、提交、错误或等待态设计。

## 十一、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验稳定发布与固定 tag。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - 核验 2026-08-20 的 npm latest 版本。
- [Data Loading](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/data-loading.md#L10-L40) - loader 提供数据、useLoaderData 消费与渲染时序。
- [Route Object Loader](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/route-object.md#L104-L134) - route object 的 loader 字段。
- [Loader Types](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L269-L364) - LoaderFunctionArgs 与返回类型。
- [Loader Execution Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6624-L6687) - loader 参数组装与执行。
- [Loader Result Conversion](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6765-L6852) - 普通值与 Response 的转换。
- [Loader Data Storage Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L7005-L7088) - loader data 按 route ID 保存。
- [useLoaderData Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L1602-L1606) - 当前 route 的数据读取路径。
- [createMemoryRouter](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L19-L104) - 嵌入式 Demo 的内存 Data Router。
