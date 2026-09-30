---
id: react.router.learn.basics.dynamic-segments
type: lesson
title: 动态路由段
summary: 用 :paramName 让同一个 Data Mode 路由匹配不同的单段值，并用 generatePath 生成具体导航路径。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - react.router.learn.basics.index-routes
related:
  - react.router.learn.basics.route-matching
  - react.router.learn.basics.link-navigation
  - react.router.learn.basics.nested-routes-and-outlet
tags:
  - React Router
  - Dynamic Segment
  - generatePath
  - nested routes
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-19
objectives:
  - 能在 Data Mode RouteObject.path 中用 :paramName 定义必需动态段。
  - 能说明一个必需动态段只匹配一个非空路径段。
  - 能用嵌套路由组合父子动态段，并判断最终 params 的合并结果。
  - 能用 generatePath 从路径模板和值生成 Link 的具体导航目标。
  - 能用最小 useParams 输出验证动态路由是否命中。
recap:
  - 以冒号开头的路径段会成为命名动态段。
  - 必需动态段占一个非空路径段，不表达业务格式校验。
  - nested child 继承 parent params，并与自己的 params 合并。
  - generatePath 负责插值和路径段编码，但不会发起导航。
  - 参数读取只用于观察命中结果；类型、校验与业务使用不属于本课。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时 npm latest 对应的稳定发布版本，并固定到提交 2edaca7a4f12a50cad002d55d84f73b0cdd462b6。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 在 2026-08-19 返回 8.3.0。
  - title: React Router 8.3.0 Data Mode Routing
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/routing.md#L84-L103
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - parent path 自动包含在 child path 中，并通过 Outlet 组成嵌套页面。
  - title: React Router 8.3.0 Dynamic Segments
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/routing.md#L206-L238
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 以冒号开头的 path segment 是 dynamic segment，命中后形成对应 params。
  - title: React Router 8.3.0 Dynamic Matching Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1653-L1797
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 必需动态段匹配一个非空、非斜杠路径段，完整 branch 的叶子执行完整匹配。
  - title: React Router 8.3.0 Nested Params Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1405-L1480
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - route branch 逐层把每次匹配得到的 params 合入累计对象。
  - title: React Router 8.3.0 useParams Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L550-L662
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - child routes 继承 parent routes 的 params，useParams 返回当前匹配链的 params 对象。
  - title: React Router 8.3.0 generatePath Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1483-L1604
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - generatePath 将命名参数插值为具体路径，按单个 URL path segment 编码，缺少必需命名参数时抛出运行时错误。
  - title: React Router 8.3.0 Dynamic Params Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useParams-test.tsx#L58-L115
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖单动态段值与父子 params 合并。
  - title: React Router 8.3.0 Route Matching Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/path-matching-test.tsx#L274-L330
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖嵌套 RouteObject 的深层动态路径与累计 params。
  - title: React Router 8.3.0 generatePath Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/generatePath-test.tsx#L11-L74
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖单参数、多参数与缺少必需参数。
  - title: React Router 8.3.0 generatePath Encoding Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/generatePath-test.tsx#L136-L164
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖动态值作为单个路径段时的结构字符和 Unicode 编码。
---

# 动态路由段

## 一、学习目标

- 能在 Data Mode 的 `RouteObject.path` 中用 `:paramName` 声明必需动态段。
- 能判断一个动态段只匹配一个非空、非 `/` 的路径段。
- 能把父级动态段和相对子级动态段组合成完整的嵌套 URL。
- 能解释 child 为什么同时得到 parent 与自身的命名参数。
- 能用 `generatePath` 生成交给 `Link` 的具体导航目标，并观察路径段编码。
- 能用最小的 `useParams` 输出确认路由分支已经命中。

本文只讨论必需动态段、嵌套路由中的参数合并和路径生成。参数类型、业务校验、数据查询与其他 URL
状态不在本课展开。

## 二、为什么需要动态路由段

一个团队页面通常不是只有一个固定团队。若为每个团队都写一条静态 Route Object，配置会随着数据
数量增长而重复：

```tsx
const routes = [
  { path: '/teams/aurora', Component: AuroraPage },
  { path: '/teams/ember', Component: EmberPage },
]
```

这些页面的结构相同，变化的只是 URL 中那一个团队值。动态段把“固定的路径结构”和“本次 URL 提供的
单段值”分开：

```tsx
const routes = [{ path: '/teams/:teamId', Component: TeamPage }]
```

同一个 Route Object 可以匹配 `/teams/aurora` 和 `/teams/ember`。`teamId` 是模板中的名称，不是
最终地址里的字面文本；命中后，Router 才把具体值放入当前匹配的 params。

当页面继续嵌套成员时，父级已经提供了团队动态段，child 只需要声明自己的相对段：

```tsx
const routes = [
  {
    path: '/teams/:teamId',
    Component: TeamLayout,
    children: [{ path: 'members/:memberId', Component: MemberPage }],
  },
]
```

父 path 会自动参与 child 的完整路径，因此最终模板是
`/teams/:teamId/members/:memberId`，而不是两条互不相关的 URL。

## 三、核心概念

### 1. 用冒号声明必需动态段

在 `path` 的一个段开头写 `:`，后面跟参数名：

```tsx
const teamRoute = {
  id: 'team',
  path: 'teams/:teamId',
  Component: TeamPage,
} satisfies RouteObject
```

这里有两个路径段：静态的 `teams` 和动态的 `:teamId`。动态段仍然要占一个完整的 URL 段，所以
`/teams/aurora` 能命中，`/teams` 不会命中。

同一个 path 可以声明多个动态段，每个名称对应一个 params 键：

```tsx
const productRoute = {
  path: 'categories/:categoryId/products/:productId',
  Component: ProductPage,
} satisfies RouteObject
```

这里的 `categoryId` 与 `productId` 都是必需的。动态段只描述 URL 结构，不表示值一定是数字、UUID 或
数据库里存在的记录。

### 2. 动态段只占一个非空路径段

固定版本的匹配器把必需动态段编译为“一个或多个非 `/` 字符”。因此：

| pathname | `/teams/:teamId` | 原因 |
| --- | --- | --- |
| `/teams/aurora` | 命中 | `aurora` 是一个非空段 |
| `/teams/design-systems` | 命中 | 连字符仍属于当前段 |
| `/teams` | 不命中 | 动态段没有值 |
| `/teams/aurora/members` | 不由这条叶子完整命中 | 多出的段需要 child route |

这条边界很重要：动态段不是“吞掉后面所有文本”的通配符，也不是任意字符串的 `startsWith`。一个
URL 有更多层级时，应在 route tree 中声明 child，而不是让当前参数承担多个段。

### 3. 父子 path 组成一条匹配分支

嵌套路由中的 child 使用相对 path：

```tsx
const routes = [
  {
    id: 'team',
    path: '/teams/:teamId',
    Component: TeamLayout,
    children: [
      {
        id: 'member',
        path: 'members/:memberId',
        Component: MemberPage,
      },
    ],
  },
] satisfies RouteObject[]
```

访问 `/teams/aurora/members/mira` 时，匹配链包含 `team` 与 `member`。`TeamLayout` 仍负责共享标题和
`<Outlet />`，`MemberPage` 进入这个插入点。child 不需要再次写 `/teams/:teamId`，因为 parent path
已经是它的上层结构。

### 4. child 继承累计的 params

在上述匹配分支中，parent 先贡献 `teamId`，child 再贡献 `memberId`。因此 child 可以观察到：

```tsx
function MemberPage() {
  const { teamId, memberId } = useParams()

  return (
    <p>
      团队：{teamId}，成员：{memberId}
    </p>
  )
}
```

这里的读取只是为了观察匹配结果。`useParams` 返回的是当前匹配链中的字符串值，不会自动把 `teamId`
转换成数字，也不会替应用检查这个团队是否存在。

如果父子 route 使用同一个参数名，后匹配层会覆盖前一个值。实际项目应使用 `teamId`、`memberId` 这类
有清晰职责的名称，避免让一个键同时代表不同层级。

### 5. 用 generatePath 从模板生成具体地址

`generatePath` 负责把模板和参数值插值成字符串：

```tsx
const teamPath = generatePath('/teams/:teamId', { teamId: 'aurora' })
// '/teams/aurora'

const memberPath = generatePath('/teams/:teamId/members/:memberId', {
  teamId: 'aurora',
  memberId: 'mira',
})
// '/teams/aurora/members/mira'
```

它只生成字符串，不改变 Router 的 location，也不执行导航。要让用户点击后导航，应把返回值交给已学过
的 `Link`：

```tsx
<Link to={generatePath('/teams/:teamId', { teamId: 'aurora' })}>查看 Aurora</Link>
```

参数值会按单个 path segment 编码。例如 `design systems` 生成
`/teams/design%20systems`，不会因为值中有空格而额外产生一个路径段。缺少必需参数时，生成函数会在
运行时抛出 `Missing ":teamId" param`；所有正式调用都应传入完整参数对象。

## 四、用法与示例

### 1. 先声明模板，再声明相对子路由

把模板当作 route configuration 的一部分，并保持 parent 与 child 的职责清晰：

```tsx
const TEAM_PATH = '/teams/:teamId'
const MEMBER_PATH = '/teams/:teamId/members/:memberId'

const routes = [
  {
    path: TEAM_PATH,
    Component: TeamLayout,
    children: [{ path: 'members/:memberId', Component: MemberDetail }],
  },
] satisfies RouteObject[]
```

`MEMBER_PATH` 适合用于生成完整导航目标；route tree 中的 child 仍然使用相对的
`members/:memberId`。这样同一条规则同时表达了“完整结果是什么”和“嵌套配置怎样写”。

### 2. 为 Link 生成稳定的具体目标

不要把模板本身交给用户：

```tsx
// 错误：点击后仍然把 :teamId 当作地址文本。
<Link to="/teams/:teamId">查看团队</Link>
```

应在生成阶段填入具体值：

```tsx
const auroraPath = generatePath('/teams/:teamId', { teamId: 'aurora' })

<Link to={auroraPath}>查看 Aurora</Link>
```

当值来自用户数据或包含空格、斜杠等结构字符时，继续使用 `generatePath`，不要用模板字符串手工拼接。
它会把值作为一个路径段编码；Router 命中后再把对应值解码给 `useParams`。

### 3. 用匹配链观察嵌套结果

在 child 组件中读取两个键，可以验证三件事：parent 动态段命中、child 动态段命中，以及 child 继承了
parent 的 params：

```tsx
function MemberDetail() {
  const { teamId, memberId } = useParams()

  return (
    <dl>
      <div>
        <dt>父级 teamId</dt>
        <dd>{teamId}</dd>
      </div>
      <div>
        <dt>子级 memberId</dt>
        <dd>{memberId}</dd>
      </div>
    </dl>
  )
}
```

如果只显示 `memberId`，仍可能看不出 parent 参数是否正确进入当前分支；同时显示两个值更适合检查
嵌套合并。

### 4. 使用内存 Router 隔离 Demo 导航

本课 Demo 使用 `createMemoryRouter` 与 `RouterProvider`。它保留 Data Mode 的 route object 和导航
行为，但不接管学习站外层地址。每次 Demo 工厂运行时创建一个新的 Router，重复进入课程不会复用上一次
的内存 location。

## 五、观察动态段与嵌套 params

下面的 Demo 使用一个 `/teams/:teamId` parent 和相对 child `members/:memberId`。三个团队链接都由
`generatePath` 生成，成员链接使用两个动态段的完整模板。

:::demo{id="react.router.learn.basics.dynamic-segments.segment-demo"}
:::

观察以下结果：

1. 初始地址显示 `teamId = aurora`，但没有成员 child 内容。
2. 点击“Ember”后，parent 仍在，`teamId` 变为 `ember`，成员内容消失。
3. “Design systems”生成 `/teams/design%20systems`，匹配后界面显示解码后的 `design systems`。
4. 点击“查看 Aurora / Mira”后，parent 标题保持显示，child 同时显示 `teamId = aurora` 与
   `memberId = mira`。
5. Demo 内的内存导航不会改变外层学习站地址，也不会刷新整个页面。

## 六、易错使用提示

:::pitfalls
### 错误：漏写动态段前的冒号

**触发条件：** 把 `teamId` 直接写成 `teams/teamId`。

**原因：** `path` 中只有以 `:` 开头的段才会被解释为动态段；没有冒号时它就是静态文本。

**后果：** `/teams/aurora` 不会命中，只有字面地址 `/teams/teamId` 才可能命中。

**错误示例：**

```tsx
{ path: 'teams/teamId', Component: TeamPage }
```

**正确写法：**

```tsx
{ path: 'teams/:teamId', Component: TeamPage }
```

**验证方式：** 分别匹配 `/teams/teamId` 与 `/teams/aurora`，确认只有后者来自动态段配置。

### 错误：认为必需动态段可以没有值

**触发条件：** 访问 `/teams`，却期待 `/teams/:teamId` 显示团队页面。

**原因：** 必需动态段要求一个非空路径段；它没有默认值。

**后果：** 该 route 不会进入完整匹配分支。

**错误示例：**

```text
/teams -> /teams/:teamId
```

**正确写法：**

```text
/teams/aurora -> /teams/:teamId
```

**验证方式：** 用固定匹配器分别检查 `/teams` 和 `/teams/aurora`，前者未匹配，后者命中。

### 错误：让一个动态段吞掉多个路径段

**触发条件：** 把 `/teams/aurora/members` 当成 `teamId = aurora/members`。

**原因：** 必需动态段只匹配一个非 `/` 字符段，不是通配符或任意前缀。

**后果：** 多出的路径段不会被当前叶子 route 自动吸收。

**错误示例：**

```tsx
{ path: '/teams/:teamId', Component: TeamPage }
```

**正确写法：**

```tsx
{
  path: '/teams/:teamId',
  Component: TeamLayout,
  children: [{ path: 'members/:memberId', Component: MemberPage }],
}
```

**验证方式：** 为额外路径声明相对子路由，并确认匹配链增加 child，而不是改变 `teamId` 的范围。

### 错误：把模板原样交给 Link

**触发条件：** 直接写 `<Link to="/teams/:teamId">`。

**原因：** `:teamId` 是配置模板，不是某个用户可访问的具体值。

**后果：** 导航目标仍包含冒号，无法表达要查看的具体团队。

**错误示例：**

```tsx
<Link to="/teams/:teamId">查看团队</Link>
```

**正确写法：**

```tsx
<Link to={generatePath('/teams/:teamId', { teamId: 'aurora' })}>查看 Aurora</Link>
```

**验证方式：** 检查 Link 的 `href`，应为 `/teams/aurora`，而不是包含 `:teamId` 的模板。

### 错误：手写字符串拼接，忽略路径段编码

**触发条件：** 用模板字符串把外部值直接插入 URL。

**原因：** 值中的空格、斜杠或结构字符可能改变 URL 的路径边界；手工拼接也容易与 Router 的编码规则
不一致。

**后果：** 生成的地址可能多出路径段，或与展示的值无法互相还原。

**错误示例：**

```tsx
const path = `/teams/${teamName}`
```

**正确写法：**

```tsx
const path = generatePath('/teams/:teamId', { teamId: teamName })
```

**验证方式：** 用 `teamName = 'design systems'`，确认结果是 `/teams/design%20systems`，命中后
`useParams` 显示 `design systems`。

### 错误：以为 generatePath 会自动导航

**触发条件：** 调用 `generatePath` 后等待 Router location 自己变化。

**原因：** `generatePath` 的职责是生成字符串，不拥有 Router，也不执行导航。

**后果：** 页面不会因为一次函数调用而切换 route。

**错误示例：**

```tsx
generatePath('/teams/:teamId', { teamId: 'aurora' })
```

**正确写法：**

```tsx
<Link to={generatePath('/teams/:teamId', { teamId: 'aurora' })}>查看 Aurora</Link>
```

**验证方式：** 观察函数返回值与点击 Link 的区别：前者只是字符串，后者才触发已声明的导航。

### 错误：父子路由重复写父路径

**触发条件：** parent 已经是 `/teams/:teamId`，child 又写完整的 `teams/:teamId/members/:memberId`。

**原因：** child path 会自动拼接 parent path；相对子路由不需要复制祖先段。

**后果：** 生成的 route tree 出现重复路径结构，预期的 `/teams/aurora/members/mira` 不会命中。

**错误示例：**

```tsx
{
  path: '/teams/:teamId',
  children: [{ path: 'teams/:teamId/members/:memberId' }],
}
```

**正确写法：**

```tsx
{
  path: '/teams/:teamId',
  children: [{ path: 'members/:memberId' }],
}
```

**验证方式：** 读取最终匹配 branch，确认 parent 只出现一次，child 只贡献 `members/:memberId`。

### 错误：父子 route 使用同一个参数名

**触发条件：** parent 与 child 都写 `:id`，再把 `params.id` 当成两个层级的值。

**原因：** nested params 是逐层合并的，同名键由后匹配层覆盖前值。

**后果：** parent 的值在 child 分支中不可通过同一个键区分，页面含义变得不清楚。

**错误示例：**

```tsx
{
  path: '/teams/:id',
  children: [{ path: 'members/:id' }],
}
```

**正确写法：**

```tsx
{
  path: '/teams/:teamId',
  children: [{ path: 'members/:memberId' }],
}
```

**验证方式：** 在 child 中同时显示 `teamId` 与 `memberId`，确认两个层级各自保留自己的键。

### 错误：把动态段命中当成业务校验通过

**触发条件：** 看到 `teamId` 有值，就认为它一定是数字、UUID 或已存在的团队。

**原因：** 动态段只约束“一个非空路径段”，不负责领域格式和数据存在性校验。

**后果：** 路由匹配成功后，业务页面仍可能需要单独处理无效值或不存在的数据。

**错误示例：**

```tsx
const { teamId } = useParams()
const numericTeamId: number = teamId
```

**正确写法：**

```tsx
const { teamId } = useParams()
// 当前课程只把 teamId 作为已命中的字符串观察。
```

**验证方式：** 用 `design systems` 这类非数字值匹配，确认它能命中，但不要据此推断业务数据有效。
:::

## 七、源码推导与适用场景

### 1. 必需动态段的匹配边界

**官方事实：** React Router 8.3.0 固定源码把必需动态段编译为一个或多个非 `/` 字符，并让完整
branch 的叶子执行结束匹配；官方测试覆盖动态段的单段命中与深层嵌套路径。

**课程推导：** `:teamId` 适合表示一个资源层级的单值。需要继续表达成员、文件或操作时，建立 child
route，让每个路径层级都有清晰的静态或动态段。

**边界：** 这描述固定版本的客户端匹配行为，不承诺服务器重写、CDN 路由或其他框架采用相同规则。

### 2. nested params 的累计

**官方事实：** 固定版本在 route branch 逐层匹配后合并 params；`useParams` 的公开说明和官方测试确认
child 可以继承 parent 的参数。

**课程推导：** child 页面可以直接读取完成当前资源层级所需的 parent 与 child 值，route tree 也因此能
保持父级布局与子级内容的职责分离。

**边界：** 同名参数的覆盖属于累计实现结果，不应作为业务设计。课程只使用唯一名称，升级版本时应重新
核对覆盖语义。

### 3. generatePath 的职责

**官方事实：** `generatePath` 插值命名参数、编码单个路径段并返回字符串；缺少必需参数时抛出错误，官方
测试覆盖这些结果。

**课程推导：** 让路径模板只维护一份，再把生成结果交给 `Link`，可以避免导航目标与 route config 各写
一套字符串规则。

**边界：** `generatePath` 不改变 Router 状态，也不负责参数校验、数据查询或编程式导航。它的返回值仍
需要由相应导航 API 使用。

### 4. 适用场景

动态路由段适合：

- 同一种页面结构需要承载多个资源值。
- parent 与 child 各自对应一个清晰的 URL 层级。
- 导航目标由模板和值稳定生成，并且需要正确处理路径段编码。

它不适合替代：

- 可有可无的 URL 段或未知深度的后代路径。
- 查询参数、hash 或其他 URL 状态。
- 领域 ID 的类型转换、格式校验和数据存在性检查。

## 八、练习

:::exercise
### 练习目标

**要求：** 配置一个 `/projects/:projectId` parent，并在其 children 中加入相对的 `files/:fileId` child；用
`generatePath` 生成 `/projects/aurora/files/readme` 的 Link 目标；Parent 使用 `<Outlet />`，child 用
`useParams` 同时显示 `projectId` 与 `fileId`；解释为什么 child 不应重复写 `/projects/:projectId`；再用
包含空格的项目名生成一个地址，说明它仍然只占一个编码后的路径段。

**验收：** `/projects/aurora` 只显示 parent；点击文件 Link 后，parent 保持显示且 child 同时显示两个
参数。不得把动态段当成数字校验或未知路径兜底。
:::

## 九、本节小结

- 在 `RouteObject.path` 的段开头写 `:paramName`，即可声明必需动态段。
- 必需动态段只匹配一个非空、非 `/` 的路径段，不是通配符，也不表达业务格式校验。
- child 使用相对 path，parent path 会自动参与完整 URL；child 的 params 包含 parent 与自身值。
- `generatePath` 负责模板插值与路径段编码，返回字符串但不执行导航。
- 把生成结果交给 `Link`，不要把模板文本或手工拼接值直接交给用户。
- parent 与 child 使用不同参数名，才能让嵌套资源层级保持可读且可观察。

## 十、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验稳定版本和固定发布身份。
- [Data Mode Nested Routes](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/routing.md#L84-L103) - parent path、child path 与 Outlet 的嵌套关系。
- [Data Mode Dynamic Segments](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/routing.md#L206-L238) - `:paramName` 动态段定义。
- [Route Object Types](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L646-L659) - `RouteObject.path` 的公共类型。
- [Dynamic Matcher Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1653-L1797) - 必需动态段的单段匹配与完整边界。
- [Nested Params Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1405-L1480) - route branch 的 params 累计。
- [useParams Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L550-L662) - child 继承 parent params 的公开读取路径。
- [generatePath Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1483-L1604) - 插值、编码和缺参错误。
- [Dynamic Params Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useParams-test.tsx#L58-L115) - 单动态段与父子 params 合并。
- [Nested Route Matching Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/path-matching-test.tsx#L274-L330) - 深层 RouteObject 动态匹配和累计参数。
- [generatePath Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/generatePath-test.tsx#L11-L74) - 插值、多参数和缺少必需参数。
- [generatePath Encoding Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/generatePath-test.tsx#L136-L164) - 动态值的单段编码。
