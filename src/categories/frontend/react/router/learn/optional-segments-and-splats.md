---
id: react.router.learn.basics.optional-segments-and-splats
type: lesson
title: 可选段与通配路由
summary: 用可选段表达可省略的单个 URL 层级，并用末尾 splat 匹配固定前缀后的未知深度路径。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 65
prerequisites:
  - react.router.learn.basics.dynamic-segments
related:
  - react.router.learn.basics.route-matching
  - react.router.learn.basics.route-objects
  - react.router.learn.basics.link-navigation
tags:
  - React Router
  - Optional Segment
  - Splat
  - Route Ranking
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-20
objectives:
  - 能用 :lang? 声明可出现也可省略的动态路径段。
  - 能用 edit? 声明可出现也可省略的静态路径段。
  - 能说明可选段仍只代表一个路径层级，不会匹配未知深度。
  - 能用末尾 files/* 匹配固定前缀后的零个、一个或多个路径段。
  - 能区分 splat 的完整 pathname、捕获余量与 pathnameBase。
  - 能预测具体静态、单段动态与 splat 候选同时存在时的匹配结果。
  - 能用 generatePath 生成省略可选动态段、保留可选静态段和多段 splat 的目标。
recap:
  - 在完整路径段末尾添加问号，会让这个单独的静态段或动态段成为可选段。
  - 可选动态段出现时仍只占一个路径段，省略时不产生该命名捕获值。
  - 末尾 splat 捕获固定前缀后的剩余路径，可以跨越多个斜杠。
  - splat 捕获余量不进入 pathnameBase，后者只保留继续组成路径所需的基准。
  - Router 比较完整分支的具体程度，不按数组中谁先声明就固定选择谁。
  - 在相同前缀和相近结构下，具体静态候选先于动态候选，splat 承接更宽的剩余路径。
  - generatePath 会省略缺失的可选动态段、保留可选静态段，并把 splat 值放在末尾星号位置。
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
      - npm latest 在 2026-08-20 返回 8.3.0。
  - title: React Router 8.3.0 Optional Segments and Splats
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/routing.md#L240-L275
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 问号让完整路径段成为可选段，末尾 splat 捕获后续包括斜杠在内的剩余字符。
  - title: React Router 8.3.0 Optional Branch Expansion and Ranking
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1270-L1402
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 可选路径先展开为具体组合，再与其他完整路由分支一起排名。
  - title: React Router 8.3.0 Matcher Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1684-L1781
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 可选动态段仍是单段捕获，末尾 splat 可以为空并从 pathnameBase 中排除捕获余量。
  - title: React Router 8.3.0 Optional Path Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/path-matching-test.tsx#L475-L760
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖可选静态段和可选动态段出现、省略及额外路径不匹配的结果。
  - title: React Router 8.3.0 Splat Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/path-matching-test.tsx#L332-L371
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试确认 splat 捕获剩余路径，而 pathnameBase 只保留捕获余量之前的前缀。
  - title: React Router 8.3.0 Route Ranking Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/path-matching-test.tsx#L28-L74
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖具体静态、动态和 splat 路由在相近结构中的候选优先级。
  - title: React Router 8.3.0 generatePath Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/generatePath-test.tsx#L76-L133
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - generatePath 会省略缺失的可选动态段，但不会替调用方省略可选静态段。
      - 空 splat 生成固定前缀，多段 splat 值保留内部斜杠。
  - title: React Router 8.3.0 generatePath Parameter Types
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L802-L830
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 字面量 splat 模板的参数类型要求提供字符串形式的星号键。
---

# 可选段与通配路由

## 一、学习目标

完成本课后，你将能够：

- 判断一个 URL 层级应该使用必需动态段、可选段还是末尾 splat。
- 让 `/:lang?/reports` 同时匹配 `/reports` 与 `/zh/reports`。
- 让 `/projects/:projectId/edit?` 同时匹配项目页与带 `edit` 的项目页。
- 解释 `/files/*` 为什么能捕获 `guides/router/setup.md` 这样的多段余量。
- 从 `pathname`、`pathnameBase` 与特殊捕获键 `"*"` 中读出不同的匹配信息。
- 在静态、动态和 splat 路由都可能命中时预测实际胜出的候选。
- 用 `generatePath` 生成可选段与 splat 目标，并解释哪些段会被保留或省略。

## 二、为什么需要可选段与通配路由

必需动态段适合“这里一定有一个值”的地址，例如 `/teams/:teamId`。真实应用还会遇到两种不同问题：

1. 某一个 URL 层级可以出现，也可以省略。例如报表可以带语言前缀 `/zh/reports`，也可以直接使用
   `/reports`。
2. 固定前缀后的层级深度事先未知。例如文件浏览器既要处理 `/files/readme.md`，也要处理
   `/files/guides/router/setup.md`。

第一种问题需要可选段。它仍然只描述一个明确的路径层级，只是允许该层级缺席。第二种问题需要末尾
splat，它把固定前缀之后的全部剩余路径作为一个整体捕获。

两者不能互换。把可选动态段当成任意深度通配，会让多层地址无法命中；把 splat 用在本来只有一个
资源标识的位置，又会把过宽的地址都归入同一个候选。

## 三、核心概念

### 1. 问号修饰完整路径段

在一个完整路径段末尾添加 `?`，就让这个段成为可选段：

```tsx
const routes = [
  { path: '/:lang?/reports', Component: ReportsPage },
  { path: '/projects/:projectId/edit?', Component: ProjectPage },
] satisfies RouteObject[]
```

`?` 属于 `RouteObject.path` 的模式语法。它修饰由 `/` 分隔的整个段，不是匹配任意单个字符，也不属于
地址中其他部分的语法。

### 2. 可选动态段可能产生一个命名值

`:lang?` 同时包含动态段的冒号和可选标记：

| pathname | 是否命中 `/:lang?/reports` | `lang` 的匹配结果 |
| --- | --- | --- |
| `/reports` | 是 | 该段未出现 |
| `/zh/reports` | 是 | `zh` |
| `/zh/cn/reports` | 否 | 可选动态段不能跨两个层级 |
| `/` | 否 | 必需静态段 `reports` 缺失 |

它出现时仍只匹配一个非空路径段；省略时不占据 URL 层级，也不产生该命名捕获值。可选只改变“这个
层级是否必需”，不会把单段动态匹配升级成通配匹配。

### 3. 可选静态段只控制字面量是否出现

静态文本也可以成为可选段：

```tsx
{ path: '/projects/:projectId/edit?', Component: ProjectPage }
```

这条 route 可以匹配 `/projects/aurora` 和 `/projects/aurora/edit`。出现时只能是字面量 `edit`，不能替换
成 `preview` 或其他文本；省略时不会生成新的命名值。

可选静态段适合表达同一页面结构接受的明确别名。它不是两个任意地址之间的跳转规则，也不会自行决定
应用应该把哪一种写法作为对外链接。

### 4. 末尾 splat 捕获所有剩余路径

path pattern 以 `/*` 结尾时，`*` 是 splat：

```tsx
{ path: '/files/*', Component: FileBrowser }
```

它匹配固定前缀 `/files` 后的剩余字符，包括后续的 `/`：

| pathname | 是否命中 | `"*"` 捕获余量 |
| --- | --- | --- |
| `/files` | 是 | 空字符串 |
| `/files/` | 是 | 空字符串 |
| `/files/readme.md` | 是 | `readme.md` |
| `/files/guides/router/setup.md` | 是 | `guides/router/setup.md` |
| `/filess/readme.md` | 否 | 固定前缀不同 |

splat 可以跨越多个 `/`，因此适合未知深度的文件树、文档子路径或其他层级浏览器。正式语法要写成
`files/*`；不要省略 `*` 前面的斜杠。

### 5. pathnameBase 不包含 splat 捕获余量

对 `/files/guides/router/setup.md` 匹配 `/files/*` 时，几个结果承担不同职责：

```text
pathname      = /files/guides/router/setup.md
pathnameBase  = /files
params["*"]   = guides/router/setup.md
```

`pathname` 是本条 route 实际匹配的完整地址；特殊键 `"*"` 保存固定前缀之后的余量；`pathnameBase`
排除这段余量，只保留匹配基准。三者不能用同一个“当前路径”概念代替。

### 6. Router 先比较完整候选的具体程度

以下路由同时存在时，`/files/new` 表面上可以被三条模式解释：

```tsx
const routes = [
  { id: 'files', path: '/files/*' },
  { id: 'file-owner', path: '/files/:owner' },
  { id: 'files-new', path: '/files/new' },
]
```

实际命中 `files-new`，即使 splat 写在数组最前面。React Router 会比较完整 route branch 的具体程度，
再尝试排名靠前的候选。在相同前缀、相近结构的直接竞争中，可以这样预测：

| pathname | 胜出的 route | 原因 |
| --- | --- | --- |
| `/files/new` | `/files/new` | 具体静态段胜过动态段和 splat |
| `/files/iris` | `/files/:owner` | 静态候选不匹配，单段动态比 splat 更具体 |
| `/files/guides/router.md` | `/files/*` | 只有 splat 能跨越剩余多个层级 |

这个简表只适用于结构可直接比较的候选。真实排名比较的是完整 branch，路径深度、所有段、索引路由等
因素都会参与，不能把三项顺序推广为任意两棵不同 route tree 的固定全序。

## 四、用法与示例

### 1. 先按 URL 层级选择模式

用三个问题缩小选择范围：

1. 这个层级一定存在，而且只接收一个值吗？使用必需动态段，例如 `:projectId`。
2. 这个明确层级可以整体省略吗？使用可选动态段或可选静态段，例如 `:lang?`、`edit?`。
3. 固定前缀后的层级数量未知吗？在模式末尾使用 splat，例如 `files/*`。

不要仅因为“不确定 URL 会是什么”就选择 splat。先把已知的静态层级和单段动态层级写清楚，再把真正
未知深度的余量交给 `*`。

### 2. 用 matchRoutes 观察匹配结果

`matchRoutes` 可以把 route objects 与一个本地 pathname 对照，不需要改变浏览器地址：

```tsx
const matches = matchRoutes(routes, '/files/guides/router/setup.md')
const match = matches?.at(-1)

console.log(match?.route.id) // 'files'
console.log(match?.pathname) // '/files/guides/router/setup.md'
console.log(match?.pathnameBase) // '/files'
console.log(match?.params['*']) // 'guides/router/setup.md'
```

这里的输出只用来验证 route pattern 的匹配结构。捕获值如何进入业务数据、如何转换和校验，不属于路径
模式本身。

### 3. 用 generatePath 生成匹配目标

`generatePath` 会按 path pattern 生成目标字符串。缺失的可选动态段会被省略；可选静态段没有对应的
参数可供判断，因此函数会保留它的字面量：

```tsx
generatePath('/:lang?/reports', {}) // '/reports'
generatePath('/:lang?/reports', { lang: 'zh' }) // '/zh/reports'
generatePath('/projects/:projectId/edit?', { projectId: 'aurora' }) // '/projects/aurora/edit'
```

如果调用方想生成省略 `edit` 的 `/projects/aurora`，应显式使用不含 `edit?` 的模板或明确目标，不能期待
`generatePath` 从参数中猜测要选哪个地址。

splat 值只插入模板末尾的 `*` 位置，内部斜杠用来表达多段余量：

```tsx
generatePath('/files/*', { '*': '' }) // '/files'
generatePath('/files/*', { '*': 'guides/router/setup.md' }) // '/files/guides/router/setup.md'
```

8.3.0 的字面量模板类型要求提供 `"*"` 键，因此空余量示例显式传入空字符串。本课只使用普通 ASCII
splat 值并确认内部斜杠，不承诺特殊字符的编码方式。

### 4. 用同一组 route objects 驱动内存 Router

可交互观察器可以把相同的 `routes` 交给 `createMemoryRouter`：

```tsx
const router = createMemoryRouter(routes, {
  initialEntries: ['/reports'],
})

<RouterProvider router={router} />
```

内存 Router 具有 Data Mode 的 route object、匹配和 Link 导航行为，但它把 location 保存在内存中。
因此 Demo 内切换 `/files/new` 或 `/files/guides/router/setup.md` 时，外层学习站地址保持不变。

### 5. 把候选顺序与地址深度一起验证

不要只检查一个 happy path。最小观察集合应覆盖：

- `/reports` 与 `/zh/reports`：可选动态段省略和出现。
- `/projects/aurora` 与 `/projects/aurora/edit`：可选静态段省略和出现。
- `/files/new`：具体静态候选胜出。
- `/files/iris`：单段动态候选胜出。
- `/files/guides/router/setup.md`：多段地址落入 splat，并产生独立的 `pathnameBase`。

同一套路由与这些固定输入足以观察语法、深度边界和候选优先级，不需要接入外部数据。

## 五、观察可选段、通配与候选优先级

下面的 Demo 故意把 `/files/*` 声明在具体路由之前。导航链接显示由 `generatePath` 生成的目标，并且只
改变内存 Router 的 pathname；结果区域则用同一组 route objects 显示胜出的 route、完整 pathname、
`pathnameBase` 和三个捕获位置。

:::demo{id="react.router.learn.basics.optional-segments-and-splats.matcher-demo"}
:::

依次观察：

1. “默认报表”与“中文报表”的目标由同一个 `/:lang?/reports` 模板生成，只有后者出现 `lang` 捕获值。
2. “项目概览”使用明确的省略目标；“项目编辑”由 `/projects/:projectId/edit?` 生成并保留 `edit`。
3. “新建文件”命中具体的 `/files/new`，而不是更早声明的动态或 splat 候选。
4. “负责人文件”只多一个路径段，因此命中 `/files/:owner`。
5. “文件根目录”与“深层文档”分别用空值和多段值生成 splat 目标；后者的 `pathnameBase` 停在
   `/files`。
6. 整个过程不会改变学习站外层 URL；重新挂载 Demo 后会回到确定的初始地址 `/reports`。

## 六、易错使用提示

:::pitfalls
### 错误：把路径模式的问号理解成其他 URL 语法

**触发条件：** 看到 `:lang?`，就期待它读取地址中路径以外的键值。

**原因：** 这里的 `?` 紧跟在一个 path segment 后，只修饰这个完整路径段是否可以省略。

**后果：** 配置意图与实际 pathname 层级不一致，无法正确预测 `/reports` 和 `/zh/reports` 的匹配。

**错误示例：**

```tsx
{ path: '/reports/:lang?', Component: ReportsPage }
// 错误地期待 /reports?lang=zh 形成 lang 路径段。
```

**正确写法：**

```tsx
{ path: '/:lang?/reports', Component: ReportsPage }
// /reports 或 /zh/reports
```

**验证方式：** 分别匹配 `/reports` 与 `/zh/reports`，确认两者来自 pathname 的不同段组合。

### 错误：让可选动态段吞掉未知深度

**触发条件：** 用 `/files/:path?` 匹配 `/files/guides/router/setup.md`。

**原因：** 可选动态段出现时仍只匹配一个非空路径段。

**后果：** `/files/readme.md` 可以命中，但含更多 `/` 的深层路径无法完整命中。

**错误示例：**

```tsx
{ path: '/files/:path?', Component: FileBrowser }
```

**正确写法：**

```tsx
{ path: '/files/*', Component: FileBrowser }
```

**验证方式：** 同时检查一个单段文件名和一个三段子路径，确认 splat 才能覆盖两者。

### 错误：省略 splat 前的斜杠

**触发条件：** 把末尾模式写成 `files*`。

**原因：** 正式 splat 语法要求 `*` 是末尾独立段，写成 `files/*`。

**后果：** 固定版本会发出兼容性 warning，配置也无法清楚表达“固定前缀之后的余量”。

**错误示例：**

```tsx
{ path: '/files*', Component: FileBrowser }
```

**正确写法：**

```tsx
{ path: '/files/*', Component: FileBrowser }
```

**验证方式：** 运行匹配时确认控制台没有关于 `*` 前缺少 `/` 的 warning。

### 错误：认为 splat 至少要捕获一个子路径

**触发条件：** 因为担心 `/files/*` 不能匹配 `/files`，额外声明一条重复 `/files` route。

**原因：** 末尾 splat 允许余量为空。

**后果：** 产生不必要的重复候选，让 route tree 更难解释。

**错误示例：**

```tsx
const routes = [{ path: '/files' }, { path: '/files/*' }]
```

**正确写法：**

```tsx
const routes = [{ path: '/files/*', Component: FileBrowser }]
```

**验证方式：** 匹配 `/files`、`/files/` 和 `/files/readme.md`，三者都应命中同一条 splat route。

### 错误：认为 route 数组中先声明的候选一定获胜

**触发条件：** 把 `/files/*` 放在第一项，就断言它会抢走 `/files/new`。

**原因：** Router 先比较完整 branch 的具体程度，只有真正同分的 sibling 才用声明顺序决定先后。

**后果：** 对静态、动态和 splat 候选的匹配预测错误，并用无效的重排掩盖 route 设计问题。

**错误示例：**

```tsx
const routes = [{ path: '/files/*' }, { path: '/files/new' }]
// 错误结论：/files/* 因为在前面而胜出。
```

**正确写法：**

```tsx
const matches = matchRoutes(routes, '/files/new')
// 更具体的 /files/new 胜出。
```

**验证方式：** 保持 splat 在数组前面，检查胜出的 `route.path` 仍是 `/files/new`。

### 错误：把 splat 捕获余量算进 pathnameBase

**触发条件：** 认为深层地址命中后，`pathnameBase` 等于完整 `pathname`。

**原因：** 固定匹配器会从基准中移除原始 splat 捕获余量。

**后果：** 无法区分 route 的固定匹配基准与它临时承接的未知深度内容。

**错误示例：**

```text
pathnameBase = /files/guides/router/setup.md
```

**正确写法：**

```text
pathnameBase = /files
params["*"]  = guides/router/setup.md
```

**验证方式：** 用 `matchRoutes` 输出两项，确认只有完整 `pathname` 包含捕获余量。

### 错误：连续可选动态段没有明确语义分隔

**触发条件：** 写 `/:lang?/:section?/:slug?`，并期待单段地址自动进入最后一个位置。

**原因：** 固定版本会优先让靠前的可选位置承接短 URL 的路径段。

**后果：** 同一个值被解释成 `lang` 而不是预期的 `slug`，地址含义依赖不直观的位置规则。

**错误示例：**

```tsx
{ path: '/:lang?/:section?/:slug?', Component: DocumentPage }
```

**正确写法：**

```tsx
{ path: '/:lang?/docs/:slug', Component: DocumentPage }
```

**验证方式：** 匹配一个短地址并检查各位置的捕获结果；必要时增加稳定静态段或拆分 route。
:::

## 七、源码推导与适用场景

### 1. 可选段先展开为具体候选

**官方事实：** React Router 8.3.0 固定源码会把包含 `?` 的 path 展开成允许的出现与省略组合，再把
每个组合加入完整 branch 排名；官方测试覆盖可选静态段和动态段的两种结果。

**课程推导：** 可选段不是在一个字符串中任意跳过字符，而是形成若干明确路径候选。一个层级是否出现
仍然可以被稳定预测和验证。

**边界：** 展开算法和组合顺序属于固定版本内部机制。应用应依赖公开匹配结果，不依赖私有函数或组合
数组的具体实现形式。

### 2. 完整 branch 排名决定直接竞争结果

**官方事实：** 固定源码先对完整 route branches 评分和排序，再尝试首个成功分支；静态段、动态段与
splat 对分数的贡献不同，官方测试覆盖相近结构下的具体候选优先结果。

**课程推导：** 为已知页面保留明确的静态或单段动态 route，再让 splat 承接真正未知深度的余量。这样
route tree 的具体入口不会因为通配候选写得更早而消失。

**边界：** “静态、动态、splat”简表不能替代完整 branch 比较。嵌套深度、索引路由和其他段都会参与
最终排名，升级版本时也应重新核对实现和官方测试。

### 3. splat 余量与路径基准分离

**官方事实：** 固定匹配器先得到完整 `pathname`，再根据原始 splat 值计算不含捕获余量的
`pathnameBase`；官方测试确认 `/users/mj/files/secrets.txt` 的基准停在 `/users/mj/files`。

**课程推导：** splat 适合表达“从这个已知基准开始的剩余路径”。观察器同时显示基准和余量，比只显示
完整地址更容易说明哪一部分来自固定 route pattern。

**边界：** 这只描述客户端 pathname 匹配。它不判断余量指向的资源是否存在，也不替代服务器路径或
权限规则。

### 4. 适用场景

可选段适合：

- 一个明确的语言、版本或操作层级可以整体出现或省略。
- 两种 URL 结构进入同一页面，但每一种结构仍有清楚的单段含义。
- 需要保留具体静态层级，同时允许一个命名值缺席。

末尾 splat 适合：

- 文件树、文档树等固定入口后的深度不确定。
- 已有具体 route 处理常用入口，剩余多层 pathname 需要进入同一个浏览器。
- 需要同时观察完整匹配地址、固定基准和剩余路径。

两者都不负责：

- 读取路径以外的 URL 状态。
- 判断捕获文本对应的业务数据是否有效。
- 配置服务器刷新回退或其他部署行为。

## 八、练习

:::exercise
### 练习目标

**要求：** 声明 `/:lang?/library`、`/projects/:projectId/preview?`、`/assets/new`、
`/assets/:owner` 和 `/assets/*`；用同一组 route objects 检查 `/library`、`/en/library`、
`/projects/aurora`、`/projects/aurora/preview`、`/assets/new`、`/assets/mira` 与
`/assets/guides/images/logo.svg`。对每个地址写出胜出的 route，并对最后一个地址写出 `pathname`、
`pathnameBase` 与 `"*"` 捕获余量。

**验收：** 两种 library 地址命中同一可选动态 route，两种 project 地址命中同一可选静态 route；
`/assets/new` 胜过动态和 splat，`/assets/mira` 命中单段动态，深层 assets 地址命中 splat 且
`pathnameBase` 为 `/assets`。不得依赖 route 数组顺序解释前三者的优先结果。
:::

## 九、本节小结

- `:lang?` 表示一个可出现或省略的命名动态段；出现时仍只匹配一个路径层级。
- `edit?` 表示一个可出现或省略的静态字面段，不会产生新的命名捕获值。
- 末尾 `files/*` 捕获固定前缀后的零个或多个路径段，并把余量放在特殊键 `"*"` 中。
- splat 可以跨越多个 `/`，但 `pathnameBase` 会停在捕获余量之前的固定基准。
- Router 对完整 branch 排名；相近结构下，具体静态入口先于单段动态入口，splat 承接更宽的剩余路径。
- 可选段解决“一个明确层级可省略”，splat 解决“固定前缀后的深度未知”，不要混用职责。

## 十、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验稳定版本、tag 和固定发布身份。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - 核验 2026-08-20 的 npm latest 稳定版本。
- [Optional Segments and Splats](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/data/routing.md#L240-L275) - 可选动态段、可选静态段与末尾 splat 的公共语法。
- [Optional Branch Expansion and Ranking](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1270-L1402) - 可选组合展开、完整分支评分与同分顺序。
- [Matcher Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1684-L1781) - 可选动态段、splat 余量和 `pathnameBase` 的固定版本实现。
- [Optional Path Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/path-matching-test.tsx#L475-L760) - 可选静态段和动态段出现、省略及完整匹配边界。
- [Splat Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/path-matching-test.tsx#L332-L371) - splat 捕获值、完整 pathname 与 `pathnameBase`。
- [Route Ranking Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/path-matching-test.tsx#L28-L74) - 相近结构中具体静态、动态与 splat 候选的优先结果。
- [generatePath Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/generatePath-test.tsx#L76-L133) - 可选动态段、可选静态段与 splat 的固定生成结果。
- [generatePath Parameter Types](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L802-L830) - 字面量 splat 模板的星号参数类型。
