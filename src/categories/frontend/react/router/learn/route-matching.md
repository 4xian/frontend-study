---
id: react.router.learn.basics.route-matching
type: lesson
title: 路由匹配
summary: 理解静态 path pattern 如何匹配 pathname，并用 matchRoutes 读取命中或未命中结果。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 65
prerequisites:
  - react.router.learn.basics.route-objects
related:
  - react.router.learn.basics.data-router-introduction
tags:
  - React Router
  - matchRoutes
  - matchPath
  - PathPattern
  - 路由匹配
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-19
objectives:
  - 能区分路由对象中的 path pattern 与待匹配的具体 pathname。
  - 能使用 matchRoutes 匹配一组静态 RouteObject，并读取 RouteMatch 数组。
  - 能显式处理 matchRoutes 返回 null 的未匹配分支。
  - 能解释默认大小写行为以及 caseSensitive 为 true 时的差异。
  - 能使用 matchPath 观察单个 pattern 的完整匹配与路径段边界。
  - 能说明最佳匹配不等于普通数组的第一个字符串前缀命中。
recap:
  - path pattern 是路由配置中的匹配模式，pathname 是一次匹配使用的具体路径。
  - matchRoutes 处理整组 RouteObject，返回 RouteMatch 数组或严格的 null。
  - matchPath 只检查单个 pattern，字符串 pattern 默认不区分大小写并要求完整匹配。
  - end 为 false 允许后续完整路径段，但不会把模式变成任意 startsWith 判断。
  - React Router 选择最佳匹配；内部 branch 分值和排序 helper 不是公共合同。
  - React Router 8.3.0 允许匹配路径末尾多出的斜杠，但不能外推为服务器资源规则。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本。
  - title: React Router 8.3.0 matchRoutes
    url: https://reactrouter.com/8.3.0/api/utils/matchRoutes
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - matchRoutes 接收路由集合与 location，并返回 RouteMatch 数组或 null。
  - title: React Router 8.3.0 matchPath
    url: https://reactrouter.com/8.3.0/api/utils/matchPath
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - matchPath 检查单个 pattern，字符串 pattern 默认不区分大小写并进行完整匹配。
  - title: React Router 8 RouteMatch Type
    url: https://api.reactrouter.com/v8/interfaces/react-router.RouteMatch.html
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - RouteMatch 提供 params、pathname、pathnameBase 与 route 字段。
  - title: React Router 8 PathPattern Type
    url: https://api.reactrouter.com/v8/interfaces/react-router.PathPattern.html
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - PathPattern 公开 path、caseSensitive 与 end 字段。
  - title: React Router 8 Base Route Object Fields
    url: https://api.reactrouter.com/v8/types/react-router.BaseRouteObject.html
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - RouteObject 公开 path 与 caseSensitive 字段，但不包含 end 字段。
  - title: React Router 8.3.0 Matching Source
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/utils.ts
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本展开并排序 route branches，再逐个尝试匹配。
      - 固定版本允许尾部斜杠，并让 end 为 false 的模式遵守路径段边界。
  - title: React Router 8.3.0 Path Matching Tests
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/path-matching-test.tsx
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖最佳匹配与更具体静态候选优先的结果。
  - title: React Router 8.3.0 matchPath Tests
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/matchPath-test.tsx
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖大小写、完整匹配、尾部斜杠与 end 为 false 的路径段边界。
  - title: React Router 8.3.0 Equal Path Order Test
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/route-depth-order-matching-test.tsx
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 相同路径的同级候选在固定版本中由声明顺序打破平局。
---

# 路由匹配

## 一、学习目标

- 能区分路由对象里的 `path` pattern 与一次请求中的具体 `pathname`。
- 能调用 `matchRoutes` 匹配一组静态 Route Object，并读取命中的路由记录。
- 能把 `RouteMatch[]` 与 `null` 作为两种明确结果处理。
- 能说明默认大小写规则，并用 `caseSensitive: true` 声明显式边界。
- 能用 `matchPath` 检查单个 pattern 的完整匹配与路径段前缀匹配。
- 能解释为什么最佳匹配不是“数组中第一个字符串前缀”。

本课只使用静态 path pattern。页面导航、嵌套渲染、参数读取、数据加载和兜底页面都不参与匹配模型。

## 二、为什么需要路由匹配

上一课已经能用 `RouteObject[]` 保存 URL 与页面之间的候选关系：

```tsx
const routes = [
  { id: 'home', path: '/' },
  { id: 'courses', path: '/courses' },
  { id: 'react-course', path: '/courses/react' },
] satisfies RouteObject[]
```

这组对象只是配置。应用还需要回答一个运行时问题：给定 `/courses/react`，究竟是哪条 route 命中？

手写 `pathname.startsWith(route.path)` 无法表达完整路径段、大小写和最佳匹配规则。React Router 提供
`matchRoutes`，让同一套路由配置按 Router 的匹配语义得到结果。这个计算本身不创建 Router，也不会
导航或改写浏览器地址。

## 三、path pattern 与 pathname

### 1. path pattern 是配置模式

Route Object 的 `path` 描述候选路由怎样参与匹配：

```tsx
const route = {
  id: 'react-course',
  path: '/courses/react',
} satisfies RouteObject
```

这里的 `/courses/react` 是 path pattern。当前示例每一段都是静态字面文本，因此只需比较固定的路径
结构。其他 pattern 形式不在本课范围内。

### 2. pathname 是一次匹配的具体路径

`pathname` 是要拿来检查的具体路径，例如：

```ts
const pathname = '/courses/react'
```

可以用一句话区分二者：`path` 是配置中的模式，`pathname` 是本次要匹配的路径值。

### 3. pathname 不等于完整 URL

完整 URL 还可能包含协议、域名、查询字符串和 hash：

```ts
const url = new URL('https://example.com/courses?stage=basic#overview')

url.pathname // '/courses'
url.search // '?stage=basic'
url.hash // '#overview'
```

路径匹配关心的是 `/courses`。`matchRoutes` 接收 `/courses?stage=basic#overview` 这样的 location 字符串
时会拆出其中的 pathname；直接调用 `matchPath` 时，第二个参数的公开语义就是 pathname，应传入
`url.pathname`。这里仅划清输入边界，不读取或管理查询参数与 hash 状态。

## 四、使用 matchRoutes 匹配静态路由

### 1. 匹配一组 RouteObject

`matchRoutes` 的常用输入是一组 Route Object 与一个 location：

```tsx
import { matchRoutes, type RouteObject } from 'react-router'

const routes = [
  { id: 'home', path: '/' },
  { id: 'courses', path: '/courses' },
  { id: 'react-course', path: '/courses/react' },
] satisfies RouteObject[]

const matches = matchRoutes(routes, '/courses/react')
```

可选的第三个参数是 `basename`，默认值为 `/`。当前配置不需要路径前缀，因此保持默认值即可。

### 2. 读取 RouteMatch 数组

匹配成功时返回 `RouteMatch[]`。`RouteMatch` 包含：

- `route`：实际命中的 Route Object。
- `pathname`：该 match 已匹配的 pathname。
- `pathnameBase`：除去末端通配部分后的基准路径；当前平铺静态示例与 `pathname` 相同。
- `params`：pattern 捕获的参数；当前静态示例没有需要读取的参数。

平铺配置只产生一条命中记录，可以这样读取：

```tsx
if (matches !== null) {
  const match = matches[0]

  console.log(match.route.id) // 'react-course'
  console.log(match.route.path) // '/courses/react'
  console.log(match.pathname) // '/courses/react'
}
```

数组结构允许 React Router 表达一条完整的匹配链；当前课程不建立父子路由，因此不展开链的组成方式。

### 3. 显式处理 null

没有 route 命中时，`matchRoutes` 返回严格的 `null`，不是空数组，也不会自动创建错误页面：

```tsx
const matches = matchRoutes(routes, '/missing')

if (matches === null) {
  console.log('当前配置没有匹配项')
}
```

是否为未匹配地址提供页面，是路由配置的另一项设计任务，不能由 `matchRoutes` 的 `null` 结果自动代替。

### 4. 尾部斜杠是固定版本行为

React Router 8.3.0 的固定源码和官方测试允许完整 pattern 匹配末尾多出的斜杠：

```tsx
matchRoutes(routes, '/courses/react/')?.[0].route.id
// 'react-course'
```

这是 8.3.0 的客户端匹配行为。它不表示 Web 服务器、CDN 或其他 Router 一定把带斜杠与不带斜杠的
资源视为同一个地址。

## 五、大小写与单个 pattern

### 1. RouteObject 默认不区分大小写

Route Object 的 `caseSensitive` 默认是 `false`：

```tsx
const routes = [{ id: 'courses', path: '/courses/react' }] satisfies RouteObject[]

matchRoutes(routes, '/COURSES/REACT')?.[0].route.id
// 'courses'
```

需要把大小写作为地址合同的一部分时，显式设置 `caseSensitive: true`：

```tsx
const routes = [
  { id: 'api-docs', path: '/API/Docs', caseSensitive: true },
] satisfies RouteObject[]

matchRoutes(routes, '/API/Docs') // RouteMatch[]
matchRoutes(routes, '/api/docs') // null
```

### 2. matchPath 只检查单个 pattern

`matchPath` 适合单独观察一个 `PathPattern`。它不负责从整组 route 中选择最佳候选，也不会创建 Router：

```tsx
import { matchPath } from 'react-router'

matchPath('/courses', '/COURSES') // PathMatch
matchPath('/courses', '/courses/react') // null
```

把字符串作为第一个参数时，React Router 8.3.0 等价于：

```tsx
matchPath(
  {
    path: '/courses',
    caseSensitive: false,
    end: true,
  },
  '/courses',
)
```

因此字符串 pattern 默认不区分大小写，并要求匹配到 pathname 末尾。

### 3. end 为 false 仍遵守路径段边界

把 `end` 设为 `false`，允许 pathname 在完整路径段之后继续：

```tsx
const pattern = { path: '/courses', end: false }

matchPath(pattern, '/courses/react') // PathMatch
matchPath(pattern, '/courseship') // null
```

`/courses/react` 在 `/courses` 后以 `/` 开始新路径段，所以可以命中；`/courseship` 只是共享字符前缀，
不会命中。它不是 `startsWith('/courses')`。

`end` 属于传给 `matchPath` 的 `PathPattern`，不是 Route Object 字段。整组路由的匹配规则不能通过在
Route Object 上添加 `end` 来修改。

## 六、匹配优先级

### 1. 选择最佳匹配，不做普通 first-match

假设配置顺序是：

```tsx
const routes = [
  { id: 'courses', path: '/courses' },
  { id: 'react-course', path: '/courses/react' },
] satisfies RouteObject[]
```

对 `/courses/react` 调用 `matchRoutes` 时，结果是完整命中的 `react-course`。React Router 不会因为
`/courses` 排在前面且共享字符开头，就提前停止。

固定版本的官方测试还证明，更具体的静态候选会优先于更泛化的候选，通常不受二者声明先后的影响。
这里要记住的是“选择最佳匹配”，不是内部计算方式。

### 2. 重复 path 是配置歧义

当两个同级候选拥有相同 path 且匹配等级相同，React Router 8.3.0 的官方测试显示前一条胜出：

```tsx
const routes = [
  { id: 'courses-a', path: '/courses' },
  { id: 'courses-b', path: '/courses' },
] satisfies RouteObject[]
```

这只说明固定版本怎样打破平局，不是应该依赖的优先级设计。两条业务含义不同的 route 不应共享同一
path；应先消除歧义，而不是靠数组顺序隐藏冲突。

## 七、运行 Demo

下面的 Demo 使用一组固定、平铺的静态 Route Object。输入框与预设按钮只更新组件内的 `pathname`
state，唯一核心计算是 `matchRoutes(routes, pathname)`。

:::demo{id="react.router.learn.basics.route-matching.static-matcher-demo"}
输入 pathname，观察固定静态路由集合返回的 RouteMatch 或 null
:::

依次观察：

1. `/courses/react` 与 `/COURSES/REACT` 都命中默认不区分大小写的静态 route。
2. `/API/Docs` 命中显式区分大小写的 route，而 `/api/docs` 返回 `null`。
3. `/courses/react/` 在 8.3.0 中仍然命中。
4. `/missing` 明确显示 `matchRoutes` 返回 `null`。

Demo 不创建 Router、不渲染 route 页面，也不调用任何导航 API；学习站的地址和历史记录保持不变。

## 八、易错使用提示

:::pitfalls

### 错误：把 pattern、pathname 和完整 URL 当成同一个值

**触发条件：** 直接把 `https://example.com/courses?stage=basic` 传给只接收 pathname 的
`matchPath`。

**原因：** 忽略了协议、域名、search、hash 与 pathname 属于 location 的不同部分。

**后果：** pattern 与错误的字符串起点比较，原本存在的 route 得到 `null`。

**错误示例：**

```tsx
matchPath('/courses', 'https://example.com/courses?stage=basic')
```

**正确写法：**

```tsx
const url = new URL('https://example.com/courses?stage=basic')

matchPath('/courses', url.pathname)
```

**验证方式：** 输出 `url.pathname`，确认传入值是 `/courses`；8.3.0 `matchPath` API 将第二个参数定义为
pathname。

### 错误：把 route 数组理解成第一个字符前缀命中

**触发条件：** 看到 `/courses` 排在 `/courses/react` 前面，就认为前者会截获后者。

**原因：** 用 `startsWith` 的思路替代了 React Router 的完整 pattern 与最佳匹配规则。

**后果：** 对实际命中 route 作出错误预测，并可能通过随意重排配置掩盖问题。

**错误示例：**

```tsx
const route = routes.find((candidate) => pathname.startsWith(candidate.path!))
```

**正确写法：**

```tsx
const matches = matchRoutes(routes, pathname)
const route = matches?.at(-1)?.route
```

**验证方式：** 用 `/courses/react` 检查包含 `/courses` 和 `/courses/react` 的配置，确认后者命中；8.3.0
官方 path matching 测试覆盖候选优先级与静态匹配结果。

### 错误：认为 path 默认区分大小写

**触发条件：** 没有配置 `caseSensitive`，却预期 `/COURSES` 不会命中 `/courses`。

**原因：** 忘记 Route Object 与字符串 PathPattern 的默认值都是 `caseSensitive: false`。

**后果：** 大小写不同的 URL 仍进入同一 route，实际地址合同比预期宽松。

**错误示例：**

```tsx
const routes = [{ path: '/API/Docs' }] satisfies RouteObject[]

matchRoutes(routes, '/api/docs') // 实际会命中
```

**正确写法：**

```tsx
const routes = [
  { path: '/API/Docs', caseSensitive: true },
] satisfies RouteObject[]
```

**验证方式：** 分别输入 `/API/Docs` 与 `/api/docs`，确认只有精确大小写的路径命中；
`BaseRouteObject` API 与 8.3.0 `matchPath` 测试记录了字段默认值和实际结果。

### 错误：把 end 为 false 当成任意 startsWith

**触发条件：** 用 `{ path: '/courses', end: false }` 匹配 `/courseship`。

**原因：** 把“允许后续路径段”误解成“允许任意后续字符”。

**后果：** 预测出不存在的命中，父路径检查范围被错误放大。

**错误示例：**

```tsx
matchPath({ path: '/courses', end: false }, '/courseship')
// 实际为 null
```

**正确写法：**

```tsx
matchPath({ path: '/courses', end: false }, '/courses/react')
// PathMatch
```

**验证方式：** 同时检查 `/courses/react` 与 `/courseship`，确认只有完整路径段边界命中；8.3.0
`matchPath` 官方测试覆盖了 `end: false` 的路径段边界。

### 错误：把 end 填到 RouteObject 上

**触发条件：** 希望整组 route 接受前缀匹配，于是在 Route Object 中添加 `end: false`。

**原因：** 混淆了 `RouteObject` 与传给 `matchPath` 的 `PathPattern`。

**后果：** TypeScript 报告未知字段，或者绕开检查后留下没有公开语义的配置。

**错误示例：**

```tsx
const route = {
  path: '/courses',
  end: false,
} satisfies RouteObject
```

**正确写法：**

```tsx
const pattern = {
  path: '/courses',
  end: false,
}

matchPath(pattern, '/courses/react')
```

**验证方式：** 让对象通过 TypeScript 的 `satisfies RouteObject` 检查，并只在 `matchPath` pattern 中使用
`end`；`BaseRouteObject` 与 `PathPattern` API 分别列出了两类对象的公开字段。

### 错误：把未匹配结果当成空数组或自动 404 页面

**触发条件：** 对结果直接调用数组方法，或认为 `null` 已经渲染了兜底页面。

**原因：** 忽略 `matchRoutes` 的返回类型是 `RouteMatch[] | null`，并把纯匹配结果与页面配置混为一谈。

**后果：** 未命中时发生空值错误，界面也不会自动出现预期的错误页。

**错误示例：**

```tsx
const matches = matchRoutes(routes, '/missing')

matches.map((match) => match.route.id)
```

**正确写法：**

```tsx
const matches = matchRoutes(routes, '/missing')

if (matches === null) {
  console.log('当前路由集合未匹配')
}
```

**验证方式：** 输入一个配置中不存在的 pathname，确认分支处理的是严格 `null`；8.3.0 `matchRoutes`
API 明确声明返回 `RouteMatch[] | null`。

:::

## 九、源码推导与适用场景

### 1. 官方事实：固定版本会展开、排序并尝试 branches

React Router 8.3.0 的固定源码先把 route tree 展开为内部 branches，再对候选排序，最后逐个尝试直到
得到非 `null` 结果。官方测试验证：更具体的静态候选优先于更泛化的候选；相同 path、相同等级的同级
候选则由声明位置打破平局。

课程推导：应用应声明清晰且不重复的 `path`，并交给 `matchRoutes` 选择最佳候选。不要用手写字符串
条件复制 Router 的优先级，也不要靠重排普通 route 表达业务优先级。

边界：内部 branch 类型、展开 helper、分值和排序函数都不是公共 API。本课只依赖可观察的最佳匹配
结果，不导入、不复制，也不要求记忆这些实现细节。

### 2. 官方事实：固定版本编译 pattern 时保留路径段边界

8.3.0 的 pattern 编译逻辑在 `end: false` 时仍检查后续字符是否处于路径段边界，并允许完整匹配末尾
出现斜杠。官方 `matchPath` 测试覆盖了这两种结果。

课程推导：需要检查单个父路径时可以使用 `end: false`，但仍应以路径段而不是字符串前缀思考；读取
8.3.0 地址时可以预期末尾斜杠命中相同的静态 pattern。

边界：这些结论描述 React Router 8.3.0 的客户端匹配器，不承诺服务器重写、缓存键、CDN 或其他路由
系统采用相同规则。升级后需要重新核对精确版本源码和测试。

## 十、练习

:::exercise

### 预测固定路由的匹配结果

**要求：** 先预测 `/COURSES/REACT`、`/API/Docs`、`/api/docs`、`/courses/react/` 与 `/missing`，再使用
Demo 验证；写出每项对应的 `route.id` 或 `null`，不要新增 route。

**验收：** 能用默认大小写、显式大小写、8.3.0 尾部斜杠行为和未匹配返回值解释全部结果，并明确尾部
斜杠结果不能代表服务器资源语义。

:::

:::exercise

### 对比 end 的路径段边界

**要求：** 分别调用 `matchPath({ path: '/courses', end: true }, '/courses/react')`、
`matchPath({ path: '/courses', end: false }, '/courses/react')` 与
`matchPath({ path: '/courses', end: false }, '/courseship')`，记录三个返回结果。

**验收：** 第一项返回 `null`，第二项命中，第三项仍返回 `null`；能用“完整路径段边界”解释后二者差异，
不把 `end: false` 描述为任意字符串前缀。

:::

## 十一、本节小结

- `path` 是配置 pattern，`pathname` 是一次匹配使用的具体路径。
- 整组 Route Object 使用 `matchRoutes`，单个 pattern 使用 `matchPath`。
- `matchRoutes` 返回 `RouteMatch[] | null`，未命中必须显式处理 `null`。
- 默认匹配不区分大小写；需要区分时在 Route Object 或 PathPattern 上设置 `caseSensitive: true`。
- 字符串 PathPattern 默认 `end: true`；`end: false` 允许后续完整路径段，但不是任意字符前缀。
- React Router 选择最佳匹配；内部 ranking helper 和分值不是应用合同。
- 尾部斜杠命中是 React Router 8.3.0 的固定版本行为，不能外推为服务器资源规则。

## 十二、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) -
  核验本课适用的稳定版本。
- [matchRoutes 8.3.0 API](https://reactrouter.com/8.3.0/api/utils/matchRoutes) - 参数、basename 默认值与
  `RouteMatch[] | null` 返回合同。
- [matchPath 8.3.0 API](https://reactrouter.com/8.3.0/api/utils/matchPath) - 单个 pattern 的匹配职责与
  默认值。
- [RouteMatch Type](https://api.reactrouter.com/v8/interfaces/react-router.RouteMatch.html) - 命中记录的公开
  字段。
- [PathPattern Type](https://api.reactrouter.com/v8/interfaces/react-router.PathPattern.html) - `path`、
  `caseSensitive` 与 `end` 的字段职责。
- [BaseRouteObject Type](https://api.reactrouter.com/v8/types/react-router.BaseRouteObject.html) - Route Object 的
  `path`、`caseSensitive` 字段与默认值。
- [React Router 8.3.0 Matching Source](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/utils.ts) -
  固定版本的 branch 选择、pattern 编译、段边界与尾部斜杠实现。
- [React Router 8.3.0 Path Matching Tests](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/path-matching-test.tsx) -
  最佳匹配与静态候选优先的官方测试。
- [React Router 8.3.0 matchPath Tests](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/matchPath-test.tsx) -
  大小写、完整匹配、路径段边界与尾部斜杠的官方测试。
- [React Router 8.3.0 Equal Path Order Test](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/route-depth-order-matching-test.tsx) -
  相同 path 的同级候选如何按声明位置打破平局。
