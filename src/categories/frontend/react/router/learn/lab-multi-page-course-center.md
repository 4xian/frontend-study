---
id: react.router.learn.basics.lab-multi-page-course-center
type: lesson
title: 实战：多页面课程中心
summary: 组合已学路由、URL 状态与内存 history，完成可筛选、可查看详情并能继续学习的多页面课程中心。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 150
prerequisites:
  - react.router.learn.basics.data-router-introduction
  - react.router.learn.basics.route-objects
  - react.router.learn.basics.route-matching
  - react.router.learn.basics.link-navigation
  - react.router.learn.basics.nav-link-state
  - react.router.learn.basics.nested-routes-and-outlet
  - react.router.learn.basics.layout-routes
  - react.router.learn.basics.index-routes
  - react.router.learn.basics.dynamic-segments
  - react.router.learn.basics.optional-segments-and-splats
  - react.router.learn.basics.route-params
  - react.router.learn.basics.query-params-and-url-state
  - react.router.learn.basics.programmatic-navigation
  - react.router.learn.basics.location-and-history-state
related:
  - react.router.learn.basics.nested-routes-and-outlet
  - react.router.learn.basics.layout-routes
  - react.router.learn.basics.query-params-and-url-state
  - react.router.learn.basics.location-and-history-state
tags:
  - React Router
  - Data Mode
  - 实战
  - 课程中心
  - 多页面导航
  - URL 状态
  - 内存 history
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-20
objectives:
  - 能把多页面需求拆成共享布局、索引页、列表页、动态详情页、学习页与兜底页。
  - 能用独立 Data Router 组合 Link、NavLink、Outlet、动态参数、查询参数与编程式导航。
  - 能把筛选、课程身份与短期来源分别交给 search、pathname 和 location state。
  - 能处理未知课程、缺失 state 与不存在的返回 entry，不让单一入口假设破坏页面。
  - 能借助 Location、key 和 navigation type 推演完整的 PUSH、REPLACE 与 POP 流程。
  - 能说明站点级 sibling 页面与多级文档嵌套之间的边界。
recap:
  - 先把产品页面翻译成 route table，再为共享布局和每个页面分配单一职责。
  - 可复制筛选属于 search，资源 ID 属于 pathname，短期来源才属于 location state。
  - Link 负责已知目标，NavLink 负责区域状态，navigate 只处理由当前数据决定的命令。
  - 动态路由匹配成功不等于业务数据存在，详情和学习页都要处理未知课程。
  - navigate(-1) 只适合确认 history 中存在目标 entry 的受控流程，直接访问需要稳定 URL。
  - 独立 Memory Router 可以验证多页面 history，不会接管外层页面地址。
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
      - npm latest 在 2026-08-20 返回 8.3.0。
  - title: React Router 8.3.0 createMemoryRouter API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L19-L104
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 管理内存 history，并接受 route objects、initialEntries 与 initialIndex。
  - title: React Router 8.3.0 RouterProvider API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/RouterProvider.md#L19-L45
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - RouterProvider 接收在 React tree 外创建的 Data Router。
  - title: React Router 8.3.0 Routing Guide
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/routing.md#L26-L275
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - route objects 支持 children、index、动态段与 splat，子路由通过 Outlet 渲染。
  - title: React Router 8.3.0 Link API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/Link.md#L21-L190
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Link 提供客户端导航，并支持 relative、replace 与 location state。
  - title: React Router 8.3.0 NavLink API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/NavLink.md#L21-L140
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - NavLink 提供 active 状态和 aria-current，end 控制末端匹配。
  - title: React Router 8.3.0 useSearchParams API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useSearchParams.md#L21-L130
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - setter 会用新的 URLSearchParams 发起导航，直接修改返回对象不会自动更新 URL。
  - title: React Router 8.3.0 useNavigate API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useNavigate.md#L21-L124
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - navigate 支持目标、state 与 delta，delta 导航要求调用方确认目标 entry 存在。
  - title: React Router 8.3.0 useParams API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useParams.md#L21-L95
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useParams 返回当前匹配的动态参数。
  - title: React Router 8.3.0 Location APIs
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useLocation.md#L21-L55
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useLocation 返回当前 Location。
  - title: React Router 8.3.0 useNavigationType API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useNavigationType.md#L21-L38
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useNavigationType 返回到达当前位置的 POP、PUSH 或 REPLACE。
  - title: React Router 8.3.0 Memory History Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L223-L358
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Memory history 用 entries 与 index 实现初始 POP、PUSH、REPLACE 与 go。
---

# 实战：多页面课程中心

## 一、学习目标

- 能把一个课程中心拆成共享布局、首页、目录、动态详情、学习页和兜底页。
- 能为每个页面确定 pathname、search 与 location state 的所有权。
- 能在一个 route tree 中组合 index、动态段、splat、Outlet、Link 与 NavLink。
- 能从查询参数派生课程列表，从动态参数查找本地课程，并处理未知 ID。
- 能只在目标由当前数据决定时使用 `navigate`，并为 delta 返回设置可靠前提。
- 能用 Location、key 与 navigation type 检查一条完整的多页面 history 流程。

## 二、把页面需求翻译成路由表

课程中心不是把几个组件并排放在一个页面，而是让每个 URL 对应一个明确页面。开始写组件前，先把产品
需求翻译成 route table：

| URL | 页面职责 | URL 拥有的数据 |
| --- | --- | --- |
| `/` | 首页和入口 | 无 |
| `/courses?level=beginner` | 课程目录和等级筛选 | `level` search 参数 |
| `/courses/:courseId` | 单门课程详情 | `courseId` pathname 参数 |
| `/learning/:courseId` | 当前课程的静态学习大纲 | `courseId` pathname 参数 |
| `*` | 未匹配路径空态 | splat 匹配结果 |

这五个页面共享同一个站点外壳，但它们是同级业务页面。这里只有一个根布局的 `Outlet`，不建立多级文档
目录、章节树或跨层文档选择状态。

### 1. 让路径表达可恢复页面

pathname 要足以恢复页面身份。课程详情把 ID 写成 `/courses/react-router-basics`，而不是把整门课程对象
塞进导航 state。这样直接输入、复制或收藏详情 URL 时，页面仍能从固定数据中查到课程。

### 2. 只为真实页面创建 route

可选段已经学过，但这个项目不需要 `/learning/:courseId?`。没有课程 ID 的学习页缺少明确业务语义，强行
加入可选段只会增加一个需要解释的无效状态。实战的目标是选择合适能力，不是凑齐所有语法。

完整 route objects 如下：

```tsx
const routes = [
  {
    path: '/',
    Component: CourseCenterLayout,
    children: [
      { index: true, Component: CourseHomePage },
      { path: 'courses', Component: CourseCatalogPage },
      { path: 'courses/:courseId', Component: CourseDetailPage },
      { path: 'learning/:courseId', Component: CourseLearningPage },
      { path: '*', Component: CourseNotFoundPage },
    ],
  },
] satisfies RouteObject[]
```

## 三、共享布局与页面职责

根布局只承担所有页面都需要的结构：站点标题、顶部导航、路由状态观察区和 `Outlet`。目录筛选不能放进
布局，详情查找也不能放进布局，否则外壳会逐渐拥有每个页面的业务状态。

### 1. 用 Outlet 留出页面插入点

```tsx
function CourseCenterLayout() {
  return (
    <section>
      <header>
        <nav aria-label="课程中心导航">
          <NavLink to="/" end>
            首页
          </NavLink>
          <NavLink to="/courses">课程</NavLink>
        </nav>
      </header>

      <CourseCenterRouteStatus />

      <main>
        <Outlet />
      </main>
    </section>
  )
}
```

`children` 只定义匹配层级，真正的子页面仍要在 `Outlet` 位置渲染。切换首页、目录和详情时，布局组件
保持在外层，中心内容由当前匹配替换。

### 2. 用 NavLink 表达区域，而不只是精确页面

首页链接使用 `end`，否则 `/courses` 也以 `/` 开头，首页会一直 active。课程链接不使用 `end`，因为
`/courses` 和 `/courses/react-router-basics` 都属于课程区域：

```tsx
<NavLink to="/" end>
  首页
</NavLink>
<NavLink to="/courses">课程</NavLink>
```

当课程详情打开时，“课程”仍得到 active 状态和 `aria-current="page"`。这不是样式技巧，而是导航层级
在 URL 上的表达。

### 3. 让每个页面只读取自己需要的路由数据

| 组件 | 读取 | 输出 |
| --- | --- | --- |
| `CourseHomePage` | 无 | 目录和精选课程 Link |
| `CourseCatalogPage` | search params、当前 Location | 派生课程列表和详情 Link |
| `CourseDetailPage` | params、Location state | 课程信息、学习命令和目录 Link |
| `CourseLearningPage` | params、Location state | 静态大纲和受控返回入口 |
| `CourseNotFoundPage` | pathname | 未匹配路径和恢复 Link |

## 四、让 URL 拥有可分享的筛选

课程目录支持 `all`、`beginner` 和 `intermediate` 三种等级。这个值会改变用户看到的课程集合，而且复制
URL 后应得到相同结果，所以它属于 search。

### 1. 每次 render 都从 search 派生列表

```tsx
const [searchParams, setSearchParams] = useSearchParams()
const rawLevel = searchParams.get('level')
const level = isCourseLevelFilter(rawLevel) ? rawLevel : 'all'

const visibleCourses =
  level === 'all' ? courses : courses.filter((course) => course.level === level)
```

这里不再建立 `useState('beginner')`。如果同时保存本地 State 和 search，就必须不断同步两份值；返回历史
entry 或直接打开带 search 的 URL 时，它们很容易分叉。

### 2. 通过 setter 导航到新筛选

```tsx
function handleLevelChange(event: ChangeEvent<HTMLSelectElement>): void {
  const nextLevel = event.target.value
  if (!isCourseLevelFilter(nextLevel)) return
  void setSearchParams({ level: nextLevel })
}
```

`URLSearchParams` 对象本身可变，但直接调用 `searchParams.set()` 不会替你提交一次 Router 导航。setter
才会把新 search 写入 Location。初始 `?level=beginner` 显示两门课程，切换到 `?level=all` 后显示三门，
状态观察区同时得到新的 key 和 PUSH。

### 3. Link state 只保存本次目录来源

每张课程卡片的目标由固定课程 ID 决定，适合使用 `Link`：

```tsx
<Link
  to={`/courses/${course.id}`}
  state={{ from: `${location.pathname}${location.search}`, label: '课程目录' }}
>
  查看课程
</Link>
```

`from` 只是“这次从哪个筛选目录进入”的短期提示。课程 ID 已经在 pathname，筛选仍在原目录 URL；state
没有复制这两类可恢复业务数据。

## 五、把详情、来源和学习入口连起来

动态路由匹配 `/courses/anything`，但 `anything` 不一定是有效课程 ID。路由匹配和业务数据查找是两个
步骤，详情页必须分别处理。

### 1. 参数命中后仍要检查课程是否存在

```tsx
const { courseId } = useParams()
const course = courses.find((item) => item.id === courseId)

if (!course) {
  return (
    <section>
      <h1>课程不存在</h1>
      <Link to="/courses?level=all">返回课程目录</Link>
    </section>
  )
}
```

这个空态属于本地数据查找结果，不是路由执行错误。它不需要错误边界，也不需要伪造一门默认课程。

### 2. 读取 state 前先验证形状

```tsx
type CourseCenterState = {
  from: string
  label: string
  canGoBack?: boolean
}

function readCourseCenterState(value: unknown): CourseCenterState | null {
  if (!value || typeof value !== 'object') return null
  const state = value as Partial<CourseCenterState>
  if (typeof state.from !== 'string' || typeof state.label !== 'string') return null
  if (state.canGoBack !== undefined && typeof state.canGoBack !== 'boolean') return null
  return { from: state.from, label: state.label, canGoBack: state.canGoBack }
}
```

直接打开详情时 `state` 可以为空。来源提示应回退为“直接访问”，返回目录应回退到稳定 URL。即使 state
包含字符串，也只能接受课程中心认可的目录形式，不能把任意外部值直接变成跳转目标。

### 3. 只在目标由当前课程决定时使用 navigate

“开始学习”是一个命令：先确认课程存在，再由课程 ID 计算目标，并写入学习页需要的受控来源。因此用
`navigate` 合理：

```tsx
async function handleStartCourse(): Promise<void> {
  if (!course) return
  await navigate(`/learning/${course.id}`, {
    state: {
      from: `/courses/${course.id}`,
      label: course.title,
      canGoBack: true,
    },
  })
}
```

普通“返回课程目录”仍然是已知目标，继续使用 `Link`。不要为了统一写法把所有链接都改成按钮和
`navigate`。

### 4. delta 返回必须有受控前提

从详情点击“开始学习”时，当前 history 明确包含上一条详情 entry，学习页可以显示 `navigate(-1)` 按钮。
如果用户直接打开学习页，没有可信来源 state，就改为显示明确的详情 Link：

```tsx
const canGoBack = Boolean(
  course && state?.canGoBack && state.from === `/courses/${course.id}`,
)

return canGoBack ? (
  <button type="button" onClick={() => void navigate(-1)}>
    返回上一页
  </button>
) : (
  <Link to={`/courses/${course.id}`}>查看课程详情</Link>
)
```

这让 delta 只服务于可证明的 history 流程，不把浏览器上一条 entry 的存在当成全局事实。

## 六、组合 Demo：观察一条 history 流程

下面的课程中心使用独立 `createMemoryRouter`。内部页面、search、state、key 与 navigation type 都会变化，
但不会修改外层学习站 URL。

:::demo{id="react.router.learn.basics.lab-multi-page-course-center.course-center-demo"}
:::

按以下顺序完成一次纵向流程：

1. 初始页面是 `/courses?level=beginner`，显示两门基础课程；action 为 POP，key 为 `default`。
2. 把筛选改为“全部课程”，search 变成 `?level=all`，显示三门课程；action 为 PUSH，并生成新 key。
3. 打开“React Router 基础”，pathname 变成 `/courses/react-router-basics`，详情读取到目录来源；顶部
   “课程”仍为 active。
4. 点击“开始学习”，进入 `/learning/react-router-basics`；学习页得到自己的 key 和详情来源。
5. 点击“返回上一页”，POP 回原详情 entry；详情 key 和目录来源一起恢复。
6. 点击“返回课程目录”，使用经过校验的 `/courses?level=all` 创建新导航，三门课程再次可见。

最后尝试一个不存在的详情 ID。动态 route 仍会匹配，但页面显示“课程不存在”，而不是读取不存在对象的
字段。通配兜底页则处理不属于任何已声明页面的路径；两种空态不能混为一谈。

## 七、易错使用提示

:::pitfalls
### 错误：让 Demo 接管外层浏览器 URL

**触发条件：** 在嵌入式课程 Demo 中使用 Browser Router，并把地址栏当成 Demo 当前路径。

**原因：** Demo 与外层学习站共享同一个浏览器环境；两套路由都控制地址栏会互相影响。

**后果：** Demo 点击会离开课程详情、触发外层路由或让刷新结果失去宿主上下文。

**错误示例：**

```tsx
const router = createBrowserRouter(routes)
```

**正确写法：**

```tsx
const router = createMemoryRouter(routes, {
  initialEntries: ['/courses?level=beginner'],
})
```

**验证方式：** 记录外层 URL，完成目录、详情和学习页导航；外层 URL 不变，Demo 的 Location 正常变化。

### 错误：在组件 render 中反复创建 router

**触发条件：** 在 `CourseCenterDemo` 函数组件内部直接调用 `createMemoryRouter`。

**原因：** 组件重新 render 时会创建新 Router 和新 history，而不是继续使用当前 entries。

**后果：** 筛选、详情和 key 突然回到初始状态，返回按钮失去原 history。

**错误示例：**

```tsx
function CourseCenterDemo() {
  const router = createMemoryRouter(routes)
  return <RouterProvider router={router} />
}
```

**正确写法：**

```tsx
function createCourseCenterDemo() {
  const router = createMemoryRouter(routes)
  return function CourseCenterDemo() {
    return <RouterProvider router={router} />
  }
}
```

**验证方式：** 导航到详情后触发普通组件更新，pathname 与 key 保持；只有完整卸载重挂才恢复初始 entry。

### 错误：声明 children 却遗漏 Outlet

**触发条件：** 根 route 有 `children`，布局组件却只渲染标题和导航。

**原因：** 匹配层级不会自动决定子页面的 DOM 插入位置，`Outlet` 才是占位点。

**后果：** URL 已匹配目录或详情，页面主体仍然为空。

**错误示例：**

```tsx
function CourseCenterLayout() {
  return <nav>课程中心</nav>
}
```

**正确写法：**

```tsx
function CourseCenterLayout() {
  return (
    <>
      <nav>课程中心</nav>
      <Outlet />
    </>
  )
}
```

**验证方式：** 依次打开首页、目录和详情；共享导航保留，中心标题随 route 改变。

### 错误：用默认 `..` 猜测目录 URL

**触发条件：** 在 `/courses/:courseId` route 中写 `<Link to="..">`，并假设一定回到 `/courses`。

**原因：** 默认相对导航按 route hierarchy 解析；当前详情 route 的父级是根布局，不是一个独立
`courses` route。

**后果：** 返回链接可能去首页，而且原目录 search 也会丢失。

**错误示例：**

```tsx
<Link to="..">返回课程目录</Link>
```

**正确写法：**

```tsx
<Link to="/courses?level=all">返回课程目录</Link>
```

**验证方式：** 检查链接 href 和点击结果，目标必须精确保留期望筛选。

### 错误：给课程区域 NavLink 添加 end

**触发条件：** 课程导航写成 `<NavLink to="/courses" end>`，同时希望详情页仍显示课程区域 active。

**原因：** `end` 要求目标在 URL 末端匹配，动态详情路径还有后续片段。

**后果：** 用户明明位于课程详情，顶部导航却失去当前区域指示和 `aria-current`。

**错误示例：**

```tsx
<NavLink to="/courses" end>
  课程
</NavLink>
```

**正确写法：**

```tsx
<NavLink to="/courses">课程</NavLink>
```

**验证方式：** 在目录和详情分别检查该链接，两处都应保持 active；首页链接则只在 `/` active。

### 错误：只修改 searchParams 对象

**触发条件：** 调用 `searchParams.set('level', 'all')`，却没有调用 setter。

**原因：** 返回对象虽然可变，但对象 mutation 本身不是 Router 导航。

**后果：** 列表、地址与 history 可能不一致，复制或返回 URL 后筛选丢失。

**错误示例：**

```tsx
searchParams.set('level', 'all')
```

**正确写法：**

```tsx
setSearchParams({ level: 'all' })
```

**验证方式：** 切换筛选后同时检查课程数量、Location.search、navigation type 和 key。

### 错误：把 location state 当成必填业务数据

**触发条件：** 直接读取 `location.state.from`，或只把课程 ID 和筛选放在 state。

**原因：** state 不在 URL 中，直接访问或其他入口可以没有它；pathname 与 search 才承担可恢复信息。

**后果：** 复制链接后页面无法复现，直接详情会抛错或生成无效返回目标。

**错误示例：**

```tsx
const catalogUrl = location.state.from
```

**正确写法：**

```tsx
const state = readCourseCenterState(location.state)
const catalogUrl = state ? getSafeCatalogUrl(state) : '/courses?level=all'
```

**验证方式：** 直接打开详情和学习页，两页都能渲染并提供稳定 URL，不依赖入口 state。

### 错误：把 key 当课程 ID，或无条件 navigate(-1)

**触发条件：** 用 `location.key` 查课程，或在直接访问学习页时也始终显示 delta 返回按钮。

**原因：** key 标识 history entry，不是业务资源；delta 导航又要求目标 entry 确实存在。

**后果：** 同一课程的多次访问被当成不同资源，直接访问时返回可能无效或到达意外页面。

**错误示例：**

```tsx
const course = findCourse(location.key)
navigate(-1)
```

**正确写法：**

```tsx
const { courseId } = useParams()
const course = findCourse(courseId)
const canGoBack = state?.canGoBack === true
```

**验证方式：** 比较目录、详情和学习页 key；PUSH 后 key 不同，POP 回详情恢复旧 key。直接学习页只显示
详情 Link。
:::

## 八、源码推导与适用场景

### 1. Memory Router 把配置交给独立 history

**官方事实：** 固定版本把 `initialEntries` 与 `initialIndex` 交给 Memory History，再用得到的 history 初始化
Data Router。

**课程推导：** 嵌入其他应用的交互 Demo 可以拥有自己的 URL、entries 与 action，而不争夺浏览器地址栏。

**边界：** 这是内存运行环境；它不证明浏览器刷新、服务端请求或静态部署行为。

### 2. 初始 entry 与后续导航形成可预测序列

**官方事实：** Memory History 初始 action 为 POP；PUSH 新增 entry，REPLACE 替换当前 entry，go 在已有
index 间切换。

**课程推导：** 固定初始目录后，可以逐步验证筛选、详情、学习和返回的 pathname、state、key 与 action。

**边界：** key 的具体随机字符串不是公共业务合同，只比较“新 entry 改变、POP 恢复”。

### 3. search 参数 setter 本质上提交导航

**官方事实：** `useSearchParams` setter 组合新的 search，并交给 `navigate`。

**课程推导：** 筛选变化要像页面导航一样参与 history；界面应从当前 search 派生，而不是维护同步副本。

**边界：** 本实战只替换唯一的 `level` 参数。页面需要保留多个参数时，应从当前参数构造下一份完整值。

### 4. NavLink 的 end 决定精确页还是区域

**官方事实：** 未设置 `end` 时，目标 path 后可以继续出现 `/`；设置后要求在目标末端匹配。

**课程推导：** 首页使用精确匹配，课程导航表示整个 `/courses` 区域，因此两者的 `end` 选择不同。

**边界：** active 只表达 URL 匹配，不代表课程数据已加载、用户有权限或学习已完成。

### 5. pathname、search 与 state 按恢复能力分工

**官方事实：** params 来自 route match，search 位于 URL，state 与 key 随 location entry 保存。

**课程推导：** 资源身份进入 pathname，可分享筛选进入 search，可丢失来源进入 state；页面由前两者成立，
state 只增强体验。

**边界：** state 不替代服务端数据、权限、缓存或持久化进度，key 也不替代业务 ID。

## 九、练习

:::exercise
### 练习目标

**要求：** 完成三个纵向改动。第一，在 search 中增加 `topic=all|frontend|backend`，切换 topic 时保留当前 `level`，
并证明复制 URL 能恢复两个筛选。第二，导航到不存在的课程 ID，为详情和学习页分别写出可访问空态，
不得伪造默认课程。第三，在操作前预测“初始目录 -> 全部筛选 -> 详情 -> 学习 -> POP 返回”每一步的
pathname、search、state.from、key 是否变化和 navigation type，再用观察区核对。

**验收：** 两个筛选只由 URL 派生；未知 ID 不读取未定义字段；history 预测能区分新 entry 和恢复旧
entry；所有直接入口都有稳定 Link，不把 state、key 或 delta 当成资源身份。
:::

## 十、本节小结

- 多页面项目先建立 route table，再把共享外壳和页面业务职责分开。
- 一个根布局和一组 sibling 页面足以表达课程中心，不需要为了展示能力增加无效层级。
- 课程 ID 属于 pathname，可分享筛选属于 search，短期返回来源才属于 location state。
- 目录卡片使用 Link，区域导航使用 NavLink，由当前课程决定目标的命令才使用 navigate。
- 动态 route 匹配后仍要查业务数据；未知 ID 空态与未匹配路径兜底是两件事。
- navigate(-1) 只用于确认存在上一条 entry 的受控流程，直接入口使用稳定 URL。
- 独立 Memory Router 让多页面 history 可重复观察，同时保持外层页面 URL 不变。

## 十一、参考资料

- [React Router 8.3.0 createMemoryRouter](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L19-L104) - 内存 Data Router 与初始 entries。
- [React Router 8.3.0 RouterProvider](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/RouterProvider.md#L19-L45) - Data Router 的挂载边界。
- [React Router 8.3.0 Routing](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/routing.md#L26-L275) - route objects、children、Outlet、index、动态段与 splat。
- [React Router 8.3.0 Link](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/Link.md#L21-L190) - 声明式导航、relative、replace 与 state。
- [React Router 8.3.0 NavLink](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/NavLink.md#L21-L140) - active、aria-current 与 end。
- [React Router 8.3.0 useSearchParams](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useSearchParams.md#L21-L130) - search 读取、setter 导航与可变对象边界。
- [React Router 8.3.0 useNavigate](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useNavigate.md#L21-L124) - 目标、state、delta 与返回前提。
- [React Router 8.3.0 useParams](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useParams.md#L21-L95) - 动态参数读取。
- [React Router 8.3.0 useLocation](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useLocation.md#L21-L55) - 当前 Location。
- [React Router 8.3.0 useNavigationType](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useNavigationType.md#L21-L38) - POP、PUSH 与 REPLACE。
- [React Router 8.3.0 Memory History 源码](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L223-L358) - entries、index 与 action 的固定实现证据。
