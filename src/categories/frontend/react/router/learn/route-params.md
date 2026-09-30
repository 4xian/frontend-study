---
id: react.router.learn.basics.route-params
type: lesson
title: 路由参数
summary: 用 useParams 读取匹配链中的字符串参数，理解继承、缺失、解码和业务转换边界。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 65
prerequisites:
  - react.router.learn.basics.optional-segments-and-splats
related:
  - react.router.learn.basics.dynamic-segments
  - react.router.learn.basics.nested-routes-and-outlet
  - react.router.learn.basics.optional-segments-and-splats
tags:
  - React Router
  - useParams
  - route params
  - TypeScript
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-20
objectives:
  - 能用 useParams 读取当前匹配链中的命名参数，并正确处理 string | undefined。
  - 能说明 child 如何继承 parent 参数，以及为什么父子路由应使用不同参数名。
  - 能区分 key union 泛型与对象 shape 泛型的 TypeScript 返回形状。
  - 能解释正常 percent-encoding、加号和畸形编码在参数读取中的边界。
  - 能把原始字符串转换为业务值并单独进行格式校验，不把路由命中当成资源有效。
recap:
  - useParams 读取当前匹配链的动态参数，值按 string 或 undefined 处理。
  - child 继承 parent 参数，不同资源层级应使用唯一参数名。
  - key union 与对象 shape 泛型都只约束 TypeScript 形状，不执行运行时校验。
  - 正常 percent-encoding 已由 Router 解码，不应在组件内重复解码。
  - 路由命中不代表格式、资源存在性或权限已经通过业务校验。
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
      - npm latest 在 2026-08-20 返回 8.3.0，预发布通道使用不同 dist-tag。
  - title: React Router 8.3.0 useParams API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useParams.md#L19-L49
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useParams 返回当前匹配路由捕获的动态参数，并声明 child 继承 parent 参数。
      - useParams 的泛型返回值以 string 或 undefined 为边界。
  - title: React Router 8.3.0 Params Type
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L874-L879
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Params 的每个键值是 readonly string | undefined。
  - title: React Router 8.3.0 useParams Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useParams-test.tsx#L17-L218
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖无参数、父子参数继承、正常解码、加号保留和畸形编码告警。
  - title: React Router 8.3.0 Descendant Params Test
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/descendant-routes-params-test.tsx#L37-L66
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 同名参数由后匹配的值覆盖。
  - title: React Router 8.3.0 Param Merge Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1405-L1480
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - route branch 逐层合并累计参数，后匹配的同名键会覆盖前值。
  - title: React Router 8.3.0 Decode Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1800-L1815
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 匹配前按路径段解码，畸形编码会告警并保留原 pathname。
  - title: React Router 8.3.0 Params Decode Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/params-decode-test.tsx#L5-L35
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 编码斜杠可以作为解码后的参数值返回。
  - title: React Router 8.3.0 createMemoryRouter API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L19-L31
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 使用内存 history，适合在不接管宿主 URL 的 Demo 中观察参数读取。
---

# 路由参数

## 一、学习目标

- 能在已匹配的 Data Mode 路由中用 `useParams` 读取命名参数。
- 能把参数按 `string | undefined` 处理，不把 URL 文本直接当成数字或业务实体。
- 能解释 child 如何看到 parent 参数，并为不同层级使用清晰、唯一的参数名。
- 能区分 key union 泛型和对象 shape 泛型，并知道它们都不是运行时校验。
- 能处理正常编码、缺失值和格式无效值，明确路由匹配与业务有效性的边界。

## 二、为什么需要读取路由参数

动态路由已经解决了“同一个页面结构如何匹配不同 URL”的问题。匹配成功后，页面还需要知道本次 URL
具体代表哪个团队、成员或文档。例如下面的两个地址结构相同，但页面内容不同：

```text
/teams/aurora/members/101
/teams/ember/members/202
```

路由配置负责描述哪些段可以变化，`useParams` 负责在已经命中的 React 组件中读取这些变化的值。组件
不需要从 `window.location` 手动切字符串，也不需要把 query string 当成 route params。

```tsx
function MemberPage() {
  const { teamId, memberId } = useParams<'teamId' | 'memberId'>()

  return <p>{teamId} / {memberId}</p>
}
```

这里的值来自当前匹配链，不是任意 URL 文本的全局搜索。参数读取应当紧跟路由层级使用，后续的数据查找、
权限判断和资源存在性检查仍属于业务层。

## 三、核心概念

### 1. `useParams` 返回当前匹配参数

`useParams` 返回当前路由上下文中已匹配的动态参数对象。参数名来自 path 中的命名段：

```tsx
const routes = [
  {
    path: '/teams/:teamId',
    Component: TeamLayout,
    children: [{ path: 'members/:memberId', Component: MemberPage }],
  },
]
```

当 URL 是 `/teams/aurora/members/101` 时，`MemberPage` 可以读到 `teamId` 和 `memberId`。当组件没有
命中任何带参数的路由时，结果可以是空对象；不要假设某个键一定存在。

### 2. 参数值是字符串，缺失值按 `undefined` 处理

路由匹配只捕获 URL 中的文本，因此 `/members/101` 得到的是字符串 `'101'`：

```tsx
const { memberId } = useParams<'memberId'>()

// memberId: string | undefined
const text = memberId ?? '未选择成员'
```

`useParams<'memberId'>()` 的 key union 用来限制可读取的键名，不能把值变成必有字符串。可选段没有出现、
当前 child 没有命中或组件在另一条 route 下渲染时，都要保留 `undefined` 分支。

### 3. child 继承 parent 参数

嵌套路由的 child 会继承 parent 已捕获的参数，并把自己的参数加入同一个可见结果：

```tsx
function TeamLayout() {
  const { teamId } = useParams<'teamId'>()
  return <Outlet />
}

function MemberPage() {
  const { teamId, memberId } = useParams<'teamId' | 'memberId'>()
  return <p>{teamId} / {memberId}</p>
}
```

父组件只需要读取自己的 `teamId`，子组件可以读取累计的 `teamId` 与 `memberId`。不要为了读取 child 参数
而在 parent 中解析完整 pathname，也不要让 parent 的业务逻辑依赖某个 descendant 是否存在。

### 4. 参数名应表达层级，并保持唯一

父子路由应使用不同且有领域含义的名字，例如 `teamId` 与 `memberId`：

```tsx
const routes = [
  {
    path: '/teams/:teamId',
    children: [{ path: 'members/:memberId', Component: MemberPage }],
  },
]
```

如果同一匹配链重复使用 `:id`，后匹配层的值会覆盖先前的值。对象里不会保留两个同名键，页面也无法从
`params.id` 判断它来自哪一层。命名唯一不是额外的类型技巧，而是保持资源层级可读性的必要约束。

### 5. key union 与对象 shape 泛型

`useParams` 支持两种常见泛型写法：

```tsx
const byKeys = useParams<'teamId' | 'memberId'>()
// Readonly<{ teamId: string | undefined; memberId: string | undefined }>

const byShape = useParams<{
  teamId: string
  memberId: string
}>()
// Readonly<Partial<{ teamId: string; memberId: string }>>
```

初学阶段推荐 key union：它限制可读取的键名，同时诚实地保留 `undefined`。对象 shape 适合描述一组预期键，
但 `Partial` 仍表示属性可能不存在；两种写法都不会检查 route 是否真的声明了这些键，更不会做运行时格式验证。

### 6. 解码是路径匹配的一部分

在 React Router 8.3.0 中，正常的 percent-encoding 会在匹配前解码：

```text
/teams/design%20systems/members/303
```

读取到的 `teamId` 是 `'design systems'`。路径参数不是表单查询字符串，因此 `+` 保持为加号，不会自动
变成空格。编码斜杠 `%2F` 也可能成为解码后的参数值 `/`。

畸形百分号编码会触发 warning 并保留原始文本。它不是业务校验机制，组件不应再次调用
`decodeURIComponent`，也不应把这种固定版本的容错行为当成长期格式合同。

### 7. 原始参数与业务值分层

参数读取完成后，业务代码才决定如何转换和校验：

```tsx
function parsePositiveMemberId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null
  const numberValue = Number(value)
  return Number.isSafeInteger(numberValue) && numberValue > 0 ? numberValue : null
}
```

`'101'` 转成 `101` 是应用代码的决定，`'draft'` 转换失败也不表示路由没有命中。即使格式校验通过，仍需
在数据或权限层确认资源存在且当前用户可以访问。

## 四、用法与示例

### 1. 在组件边界读取并保留原始值

先读取原始参数，再根据业务需要做转换。这样错误提示可以区分“没有这个路径段”“路径段格式不对”和“资源不存在”：

```tsx
function MemberDetail() {
  const { memberId } = useParams<'memberId'>()
  const memberNumber = parsePositiveMemberId(memberId)

  if (memberId === undefined) return <p>尚未选择成员</p>
  if (memberNumber === null) return <p>成员编号格式无效：{memberId}</p>
  return <p>准备读取成员 {memberNumber}</p>
}
```

不要只写 `Number(memberId) || 0`：`NaN`、零、负数和超出安全整数范围的值都可能需要不同的业务处理。

### 2. 用唯一参数名表达父子关系

```tsx
const routes = [
  {
    id: 'team',
    path: '/teams/:teamId',
    Component: TeamLayout,
    children: [
      { index: true, Component: TeamIndex },
      { id: 'member', path: 'members/:memberId', Component: MemberDetail },
    ],
  },
]
```

`/teams/aurora` 只命中 index child，`memberId` 不应被伪造为空字符串或数字 0；
`/teams/aurora/members/not-a-number` 仍能命中 route，但只能得到原始字符串并由业务校验拒绝。

### 3. 用 `createMemoryRouter` 隔离观察环境

在不希望 Demo 改变学习站 URL 时，可以创建内存 Router：

```tsx
const router = createMemoryRouter(routes, {
  initialEntries: ['/teams/aurora/members/101'],
})

function RouteParamsDemo() {
  return <RouterProvider router={router} />
}
```

它的 history 保存在内存中。Demo 内的 Link 可以切换参数，外层学习站地址和浏览器 history 不会被接管。

### 4. 观察多个参数的变化

用同一套 route objects 观察四种结果：

| pathname | `teamId` | `memberId` | 业务层观察 |
| --- | --- | --- | --- |
| `/teams/aurora/members/101` | `aurora` | `101` | 正整数转换成功 |
| `/teams/ember/members/202` | `ember` | `202` | 两层参数同时更新 |
| `/teams/aurora` | `aurora` | 未出现 | child 未命中 |
| `/teams/aurora/members/not-a-number` | `aurora` | `not-a-number` | 路由命中但格式无效 |

观察表中的“未出现”是界面表达，不是把缺失值伪装成空字符串。Demo 还可以加入编码后的团队名，帮助区分
外层 pathname 的编码文本与 `useParams` 读到的解码值。

## 五、用 Demo 观察参数读取

下面的观察台使用 Data Mode RouteObject、`createMemoryRouter` 和 `RouterProvider`。它只在内存中切换地址，
不使用 `createBrowserRouter`，也不请求外部数据。

:::demo{id="react.router.learn.basics.route-params.params-demo"}
:::

按顺序观察：

1. 初始成员同时显示 `teamId = aurora` 与 `memberId = 101`，原始值是字符串，转换结果是正整数。
2. 切换团队只改变 parent 参数；切换成员只改变 child 参数，两个组件都来自同一条匹配链。
3. 进入团队根路径时，index child 显示“没有成员参数”，不会伪造 `memberId`。
4. 进入 `not-a-number` 时 route 仍然命中，但转换状态无效；这与资源是否存在是不同问题。
5. 进入编码后的团队名称时，Demo pathname 保留 URL 形式，而 `teamId` 展示解码后的空格。

## 六、易错使用提示

:::pitfalls
### 错误：把参数文本直接当成数字

**触发条件：** 从 `/members/101` 读取 `memberId` 后直接传给只接受 number 的业务函数。

**原因：** Router 只捕获字符串，不知道业务字段的 schema。

**后果：** 类型检查失败，或在宽松代码中把格式错误值送进数据查询。

**错误示例：**

```tsx
const { memberId } = useParams<'memberId'>()
loadMember(memberId)
```

**正确写法：**

```tsx
const { memberId } = useParams<'memberId'>()
const memberNumber = parsePositiveMemberId(memberId)
if (memberNumber !== null) loadMember(memberNumber)
```

**验证方式：** 分别输入 `101`、`0` 和 `not-a-number`，确认只有业务允许的值进入下一层。

### 错误：认为 key union 会保证参数一定出现

**触发条件：** 写了 `useParams<'memberId'>()`，就省略 `undefined` 分支。

**原因：** 泛型只约束可读取的键名，不改变 Router 的匹配结果。

**后果：** parent-only 路径或另一条 route 下渲染时，界面出现空白或错误数据。

**错误示例：**

```tsx
const { memberId } = useParams<'memberId'>()
return <strong>{memberId.toUpperCase()}</strong>
```

**正确写法：**

```tsx
const { memberId } = useParams<'memberId'>()
return <strong>{memberId ?? '未选择成员'}</strong>
```

**验证方式：** 访问没有 child 参数的 parent-only 地址，确认页面明确显示缺失状态。

### 错误：把对象 shape 泛型当成运行时 schema

**触发条件：** 使用 `useParams<{ memberId: string }>()` 后认为 Router 已验证字段存在和格式。

**原因：** 该写法产生的是 `Partial` 形状，只提供 TypeScript 的描述。

**后果：** 拼写、路由配置和业务格式问题仍可能在运行时发生。

**错误示例：**

```tsx
const params = useParams<{ memberId: string }>()
// 错误期待：memberId 已通过运行时校验
```

**正确写法：**

```tsx
const { memberId } = useParams<'memberId'>()
const memberNumber = parsePositiveMemberId(memberId)
```

**验证方式：** 移除对应 path 段后仍能通过编译，说明类型泛型没有替代 route 和业务校验。

### 错误：在父子路由重复使用同名参数

**触发条件：** parent 和 child 都写 `:id`，然后希望 `params.id` 同时代表两个资源。

**原因：** 同一对象不能保留两个相同键名，后匹配的值会覆盖前值。

**后果：** 页面无法从参数对象判断当前 `id` 属于哪一层。

**错误示例：**

```tsx
{ path: '/teams/:id', children: [{ path: 'members/:id' }] }
```

**正确写法：**

```tsx
{ path: '/teams/:teamId', children: [{ path: 'members/:memberId' }] }
```

**验证方式：** 让 parent 与 child 使用不同值，确认子组件可以同时显示 `teamId` 与 `memberId`。

### 错误：手动再次解码参数

**触发条件：** 看到 URL 中的 `%20`，在 `useParams` 结果上再次调用 `decodeURIComponent`。

**原因：** 8.3.0 的匹配过程已经处理正常 percent-encoding。

**后果：** 合法的字面 `%` 或编码序列可能被错误改变，畸形输入还可能抛出异常。

**错误示例：**

```tsx
const decoded = decodeURIComponent(useParams<'teamId'>().teamId ?? '')
```

**正确写法：**

```tsx
const { teamId } = useParams<'teamId'>()
// 直接使用 teamId；只在它存在后做业务转换
```

**验证方式：** 用 `design%20systems` 与包含字面 `%` 的值比较 Router 返回结果，不增加第二次解码。

### 错误：把 `+` 当成空格

**触发条件：** 看到参数值中的加号，就按表单 query string 的规则替换为空格。

**原因：** path 参数与查询字符串使用不同的编码上下文。

**后果：** 资源 ID 或名称被悄悄改写。

**错误示例：**

```tsx
const teamId = useParams<'teamId'>().teamId?.replaceAll('+', ' ')
```

**正确写法：**

```tsx
const { teamId } = useParams<'teamId'>()
// 8.3.0 中 + 仍是 +，不要自行替换
```

**验证方式：** 使用包含 `+` 的路径，确认读取结果仍保留加号。

### 错误：把路由命中当成资源有效

**触发条件：** 只要 `useParams` 返回值，就直接渲染资源或认为用户有权限。

**原因：** matcher 只判断 URL 结构，不访问数据库、权限系统或业务 schema。

**后果：** 不存在或不可访问的资源进入页面正常态。

**错误示例：**

```tsx
const { memberId } = useParams<'memberId'>()
return <MemberCard id={Number(memberId)} />
```

**正确写法：**

```tsx
const { memberId } = useParams<'memberId'>()
const id = parsePositiveMemberId(memberId)
if (id === null) return <p>成员编号格式无效</p>
// 后续仍需数据与权限层确认资源
return <MemberCard id={id} />
```

**验证方式：** 用格式正确但不存在的 ID，确认格式层与资源层给出不同处理。
:::

## 七、源码推导与适用场景

### 1. 当前匹配对象的公开读取合同

**官方事实：** 固定版本的 `useParams` 从当前 `RouteContext` 的最后一个 match 读取 params；官方文档同时
说明 child routes 继承 parent params。

**课程推导：** 读取参数应放在命中该资源层的组件内；child 可以消费累计上下文，parent 不应通过完整地址
猜测 descendant 的业务状态。

**边界：** 文档公开承诺的是 child 继承 parent，不把 parent 当前能观察到 descendant 的固定实现现象当作
跨版本组件契约。

### 2. 参数合并与同名覆盖

**官方事实：** 固定 matcher 逐层把每个 match 的 params 合并到累计对象，官方 descendant 测试证明重复键
最终保留后匹配的值。

**课程推导：** 用带资源含义的唯一名字表达层级，让类型提示和页面调试都能说明参数来源。

**边界：** 这是参数对象的覆盖结果，不是多个资源自动合并，也不会替代业务层的关系校验。

### 3. 解码与异常输入

**官方事实：** 固定版本在匹配前逐段调用 `decodeURIComponent`；正常编码被解码，畸形编码告警并保留原文本，
官方测试覆盖空格、加号和编码斜杠。

**课程推导：** 组件直接消费 Router 给出的值，不手动二次解码；需要更严格输入合同时，在业务层拒绝不符合格式
的原始值。

**边界：** 特殊字符与畸形输入的精确容错属于固定版本观察，不能写成所有未来版本和所有 URL 处理器的保证。

### 4. 参数读取的适用场景

路由参数适合表达资源层级中的短标识，例如团队、成员、文档或版本。它不负责：

- 查询字符串、hash 和其他 URL 状态。
- 把文本自动转换为数字、日期、枚举或业务对象。
- 判断资源是否存在、用户是否有权限访问。
- 替代 loader/action、请求缓存或错误边界。

这些边界让参数读取保持简单：先读取匹配文本，再把转换、数据和权限交给各自的层。

## 八、练习

:::exercise
### 练习目标

**要求：** 声明一个 `/projects/:projectId` parent，并添加 index child 与 `files/:fileId` child。完成一个
`FilePage` 组件：用 key union 读取 `projectId` 与 `fileId`；在 `fileId` 缺失时显示“尚未选择文件”，
而不是空字符串或 0；只接受正的安全整数文件编号，并同时显示原始字符串和转换后的数字；用不同参数名
避免 parent 与 child 的同名覆盖。最后预测 `/projects/aurora`、`/projects/aurora/files/17` 和
`/projects/aurora/files/draft` 的结果。

**验收：** 第一个地址只显示 parent 和 index 内容；第二个地址显示 `fileId = '17'` 与转换结果 `17`；
第三个地址仍命中 route，但格式状态无效。练习不接入数据请求，也不读取 query string。
:::

## 九、本节小结

- `useParams` 读取当前匹配链捕获的动态参数，不读取 query string。
- 参数值是字符串；可选或未命中的值必须按 `undefined` 处理。
- child 继承 parent 参数；父子层级使用唯一名字，避免后值覆盖前值。
- key union 可以限制键名，但泛型不是运行时 schema，也不会自动转换类型。
- 正常 percent-encoding 由 Router 解码；不要把 `+` 当空格或再次手动解码。
- 路由命中只说明 URL 结构匹配，格式、资源存在性和权限需要业务层继续判断。

## 十、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验稳定发布与固定提交身份。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - 核验 2026-08-20 的 npm latest 稳定版本。
- [React Router 8.3.0 useParams API](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useParams.md#L19-L49) - 返回匹配参数、child 继承和泛型签名。
- [React Router Params Type](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L874-L879) - `Params` 的 `string | undefined` 类型边界。
- [useParams Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/useParams-test.tsx#L17-L218) - 无参数、父子继承和路径解码测试。
- [Descendant Params Test](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/descendant-routes-params-test.tsx#L37-L66) - 同名参数覆盖。
- [Params Decode Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/params-decode-test.tsx#L5-L35) - 编码斜杠返回值。
- [Param Merge Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1405-L1480) - 参数累计与同名键覆盖。
- [Decode Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L1800-L1815) - 正常解码与畸形编码回退。
- [createMemoryRouter API](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L19-L31) - 内存 history 的 Data Router Demo 宿主。
