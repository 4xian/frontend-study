---
id: react.router.learn.basics.location-and-history-state
type: lesson
title: Location 与历史状态
summary: 读取当前 Location，并用 state、key 和导航类型理解每一条客户端历史记录。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 85
prerequisites:
  - react.router.learn.basics.programmatic-navigation
related:
  - react.router.learn.basics.query-params-and-url-state
  - react.router.learn.basics.link-navigation
tags:
  - React Router
  - useLocation
  - Location
  - History State
  - useNavigationType
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-20
objectives:
  - 能用 useLocation 读取当前已提交 Location 的 pathname、search、hash、state 和 key。
  - 能判断哪些状态应进入 URL，哪些小型导航上下文可以放在 location.state。
  - 能通过 Link 或 navigate 写入 state，并在读取端处理 state 缺失或形状不符。
  - 能解释 key 标识 history entry，而不是业务实体或永久身份。
  - 能用 useNavigationType 区分 POP、PUSH 与 REPLACE，并预测 entry 栈的变化。
  - 能准确说明刷新、直接访问、新标签和 Memory Router 对 state 的不同边界。
recap:
  - useLocation 返回当前已提交的 Location；进行中的目标不属于这个对象。
  - pathname、search 和 hash 构成可见 URL，state 与 key 则属于当前 history entry。
  - state 不进入 href，读取端必须允许 null；可分享、可书签或服务端需要的状态应进入 URL 或持久数据源。
  - key 区分 location entries；相同 URL 的多次访问仍可能拥有不同 key 和 state。
  - PUSH 新增 entry，REPLACE 替换当前 entry，POP 切换到已有 entry且不表示固定方向。
  - Browser History 会结构化序列化 state；Memory Router 只在实例内存中保存 entries，不能替代浏览器边界验证。
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
  - title: React Router 8.3.0 useLocation API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useLocation.md#L19-L54
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useLocation 返回当前 Location，并可用于在完整 location 变化后执行副作用。
  - title: React Router 8.3.0 Location Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L34-L80
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Location 公开包含 pathname、search、hash、state、key 与可选 mask。
      - key 与 location 关联，初始 location 的 key 为 default。
  - title: React Router 8.3.0 Link State API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/Link.md#L140-L183
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Link 支持 replace 和客户端 state，目标组件通过 useLocation 读取 state。
      - state 基于浏览器 history state，因此服务端不能直接取得。
  - title: React Router 8.3.0 Link Push and Replace Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L2217-L2291
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Link 默认对不同 URL 使用 PUSH，对同一 URL 使用 REPLACE，显式 replace 属性可以覆盖默认选择。
  - title: React Router 8.3.0 useNavigate Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L224-L305
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - navigate options 可把 state 与目标 location 一起提交。
  - title: React Router 8.3.0 History Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L223-L359
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Memory history 通过 entries 与 index 实现 PUSH、REPLACE 和 POP，并保存每条 entry 的 state 与 key。
  - title: React Router 8.3.0 Browser History Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L384-L419
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Browser History 从 window.history.state 恢复用户 state 与 location key。
  - title: React Router 8.3.0 History State Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L552-L568
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Browser History 写入结构组合用户 state、location key 与内部 index。
  - title: React Router 8.3.0 Browser History Write Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L655-L737
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Browser History 使用 pushState 或 replaceState 写入 Router 生成的 history state。
  - title: React Router 8.3.0 useNavigationType API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L165-L179
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useNavigationType 返回到达当前 Location 的 POP、PUSH 或 REPLACE。
  - title: WHATWG History Interface
    url: https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-history-interface
    sourceType: specification
    appliesTo: Living Standard
    claims:
      - 浏览器 History API 的 state 与 session history entry 关联。
  - title: WHATWG StructuredSerializeForStorage
    url: https://html.spec.whatwg.org/multipage/structured-data.html#structuredserializeforstorage
    sourceType: specification
    appliesTo: Living Standard
    claims:
      - History state 按存储用途执行结构化序列化，不可序列化值会失败。
  - title: MDN History pushState
    url: https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
    sourceType: official-reference
    appliesTo: Living Standard
    claims:
      - 浏览器可能限制序列化后 state 的大小，过大的 state 可能导致异常。
---

# Location 与历史状态

## 一、学习目标

- 能在 Router 上下文中使用 `useLocation()`，读取当前已经提交的 Location。
- 能逐项解释 `pathname`、`search`、`hash`、`state` 与 `key` 的职责。
- 能通过 `Link` 或 `navigate` 把小型导航上下文写入目标 entry。
- 能在直接访问或无 state 的情况下安全渲染，不把类型断言当成运行时校验。
- 能判断一次 location 变化属于 `POP`、`PUSH` 还是 `REPLACE`。
- 能说明 Browser History 与 Memory Router 对 state 保存方式的不同边界。

## 二、为什么需要 Location

路由匹配回答“当前 URL 应渲染哪个 route component”，但组件还经常需要知道更完整的当前位置：

- 当前 pathname、查询字符串与 hash 是什么。
- 用户是从哪个页面入口进入的。
- 当前页面对应 history 中哪一条 entry。
- 这次变化是新增、替换，还是回到了已有 entry。

例如订单详情页可能由列表、搜索结果或推荐卡片进入。三个入口可以指向相同 pathname，但返回提示和
临时说明不同。把来源写进查询参数当然可以分享，不过“刚才从推荐卡片进入”通常只是这次导航的短期
上下文，不必成为公开 URL：

```tsx
<Link
  to="/orders/42"
  state={{ source: '推荐卡片', notice: '返回时保留推荐来源' }}
>
  查看订单
</Link>
```

目标页使用 `useLocation()` 同时获得 URL 与这条 entry 的 state。即使用户直接输入 `/orders/42`，页面
也应正常工作，只是 state 为空。Location 因此不是一份隐藏的全局 store，而是“当前路由位置及其历史
记录上下文”的快照。

## 三、核心概念

### 1. `useLocation` 返回当前已提交位置

`useLocation` 必须在 Router 上下文中的 React component 顶层调用：

```tsx
import { useLocation } from 'react-router'

function OrderPage() {
  const location = useLocation()
  return <p>{location.pathname}</p>
}
```

它返回当前已经提交并正在渲染的 Location。用户刚发起但尚未完成的导航目标不属于这个对象；不要把
`useLocation()` 当成 pending navigation 观察器。

当当前 Location 变化时，读取 Hook 的组件重新渲染。需要按页面访问执行统计等副作用时，可以把完整
`location` 放进 Effect 依赖：

```tsx
function PageAnalytics() {
  const location = useLocation()

  useEffect(() => {
    recordPageView(location.pathname)
  }, [location])

  return null
}
```

Effect 仍可能在开发环境按 React 的检查策略额外执行，实际统计逻辑需要自己的去重或幂等规则；Location
只提供变化信号，不保证外部请求恰好执行一次。

### 2. `Location` 的五个基础字段

当前版本公开类型的基础形状可以简化为：

```ts
interface Location<State = any> {
  pathname: string
  search: string
  hash: string
  state: State
  key: string
}
```

| 字段       | 表达内容                         | 示例                         |
| ---------- | -------------------------------- | ---------------------------- |
| `pathname` | URL 路径                         | `/orders/42`                 |
| `search`   | 查询字符串，非空时以 `?` 开头    | `?from=list`                 |
| `hash`     | 片段标识，非空时以 `#` 开头      | `#summary`                   |
| `state`    | 当前 history entry 的客户端数据  | `{ source: '订单列表' }`     |
| `key`      | 当前 location entry 的字符串身份 | 初始 location 为 `default`   |

`pathname`、`search` 与 `hash` 构成 URL。它们可以出现在链接中，并能被复制、收藏或发送给服务端。
`state` 与 `key` 不属于 URL 文本，它们跟随当前 history entry。

当前版本还公开可选 `mask` 字段。它服务于更专门的上下文导航，不改变本课对五个基础字段的使用方式，
因此这里不展开。

### 3. history 由一组 entries 和当前 index 构成

可以把客户端 history 想成一个有当前指针的 entry 列表：

```text
orders/40  ->  orders/41  ->  orders/42
                                ^ current index
```

每条 entry 都可以拥有自己的 URL、state 和 key。两个 entries 即使 pathname 完全相同，也不表示它们是
同一条记录：

```text
{ pathname: '/orders/42', state: { source: 'list' }, key: 'entry-a' }
{ pathname: '/orders/42', state: { source: 'search' }, key: 'entry-b' }
```

返回前一条 entry 时，读取到的是它原有的 URL、state 与 key，而不是按 pathname 重新拼一份 state。

### 4. `state` 是 entry 级导航上下文

适合放入 `state` 的内容通常同时满足以下条件：

- 数据只服务于一次客户端导航上下文。
- 丢失后页面仍然能够正常工作。
- 数据量小，并且能被浏览器 History API 结构化序列化。
- 服务端、分享链接与书签不需要理解它。

例如返回来源、一次性界面提示或局部交互起点可以使用 state。资源 ID、筛选条件、可恢复页面状态和业务
真相不应只存在 state 中：资源身份放 pathname，筛选和可分享视图放 search，需要长期可靠保存的数据放
服务端或合适的持久存储。

### 5. `key` 标识 location entry

`location.key` 是与当前 location 关联的字符串。初始 location 的 key 为 `default`；Router 后续创建的
location 会拥有 entry key。

key 可以帮助客户端区分“同 URL 的两次访问”，也可以作为按 entry 保存临时数据的索引。但它不是订单
ID、课程 ID 或用户 ID，不应作为服务端业务主键，也不能假设跨 Router 实例、跨标签或永久存储后仍保持
同一个值。

## 四、用法与示例

### 1. 读取 URL 字段

直接从 Location 读取原始 URL 部分：

```tsx
function LocationSummary() {
  const { pathname, search, hash } = useLocation()

  return (
    <dl>
      <dt>pathname</dt>
      <dd>{pathname}</dd>
      <dt>search</dt>
      <dd>{search || '（空）'}</dd>
      <dt>hash</dt>
      <dd>{hash || '（空）'}</dd>
    </dl>
  )
}
```

`search` 是原始查询字符串。要读取键值、重复键或编码后的逻辑值，应使用 `URLSearchParams` 或
`useSearchParams`，不要手动用字符串切割。hash 包含开头的 `#`，没有 hash 时是空字符串。

### 2. 用 `Link` 写入 state

`Link` 的 `state` prop 把数据附加到目标 location：

```tsx
<Link
  to="/orders/42?from=recommendation#details"
  state={{ source: '推荐卡片', notice: '返回时保留推荐来源' }}
>
  查看推荐订单
</Link>
```

生成的 anchor `href` 只包含 `/orders/42?from=recommendation#details`，不会把 state 编码进去。正常当前
标签页客户端导航可以写入 state；复制 `href`、书签、直接访问或原生新标签只携带 URL。

如果本意是让所有拿到链接的人都知道 `from=recommendation`，它就应该保留在 search，而不是只放在
state。两者可以同时出现，但应分别承担公开 URL 状态和临时导航上下文。

### 3. 用 `navigate` 写入 state

程序决定导航时，可以把 state 放进 options：

```tsx
const navigate = useNavigate()

async function openOrder() {
  await navigate('/orders/42', {
    state: {
      source: '搜索结果',
      notice: '返回时恢复搜索上下文',
    },
  })
}
```

这只是复用程序式导航的一个选项。本课关注导航提交后产生的 Location，不重新展开目标解析、delta 或
相对导航规则。

### 4. 安全读取 state

`Location` 的默认 state 类型很宽，运行时值也可能是 `null` 或来自旧 entry。不要无条件解构：

```tsx
type OrderLocationState = {
  source: string
  notice: string
}

function isOrderLocationState(value: unknown): value is OrderLocationState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<OrderLocationState>
  return typeof state.source === 'string' && typeof state.notice === 'string'
}

function OrderPage() {
  const location = useLocation()
  const state = isOrderLocationState(location.state) ? location.state : null

  return <p>{state?.notice ?? '当前没有导航提示'}</p>
}
```

TypeScript 的 `as OrderLocationState` 只压缩静态类型，不会验证真实 history state。基础页面至少要处理
`null`；状态影响权限、金额或持久数据时，应使用明确 schema 在可信边界重新校验，而不是相信导航方。

### 5. 区分 `PUSH`、`REPLACE` 与 `POP`

`useNavigationType()` 返回本次如何到达当前 Location：

```tsx
const navigationType = useNavigationType()
// 'POP' | 'PUSH' | 'REPLACE'
```

| 类型      | 对 history entries 的影响                          |
| --------- | -------------------------------------------------- |
| `PUSH`    | 在当前 index 后新增 entry，并截断原有 forward 分支 |
| `REPLACE` | 用新 entry 替换当前 index，history 长度不增加      |
| `POP`     | 移动到已有 index，不新增或替换 entry               |

`navigate` 和指向不同 URL 的 Link 默认 push，显式 `{ replace: true }` 或 `<Link replace>` 会 replace。
同一 URL 的 Link 在没有指定 `replace` 时会自动选择 REPLACE；只有显式 `replace={false}` 才强制 PUSH。
后退与前进都属于 POP，所以 POP 不能告诉你移动方向，也不能单独证明用户点击了浏览器后退按钮。初始
history 的 action 也默认为 POP。

### 6. 预测 entry 的 state 与 key

假设初始栈只有 A：

```text
A: /orders/41, state={ source: 'list' }, key=default
```

执行 push B 后：

```text
A -> B: /orders/41?from=recommendation#summary, state={ source: 'recommendation' }, key=<new key>
```

在 B 上 replace C 后：

```text
A -> C: /orders/43, state={ source: 'search' }, key=<new key>
```

此时后退会 POP 到 A，并恢复 A 的 state 与 key；不会回到已经被 C 替换的 B。这里的关键不是随机 key 的
具体字符，而是每次观察当前 entry 对应的身份。

### 7. 理解 Browser History 的保存边界

Browser History 会把用户 state、location key 和 Router 所需的内部 index 一起存入当前 history entry。
同一标签页普通刷新重新加载当前 session history entry 时，Router 可以从它的 `history.state` 恢复 state
和 key。

这不表示 state 是持久数据库：

- 复制 URL、直接访问、书签和原生新标签不会通过 URL 携带 state。
- 服务端请求看不到这份客户端 state。
- 浏览器可能限制单条 state 的序列化大小。
- 函数、DOM 节点、Promise、WeakMap 等不可结构化序列化值不能可靠写入 Browser History。
- 读取端始终需要 state 缺失的正常分支。

不要写成“刷新必丢 state”，也不要写成“state 能跨所有刷新和重开永久保存”。准确模型是：它属于某条
客户端 session history entry，而不是 URL 或长期数据源。

### 8. 区分 Browser History 与 Memory Router

`createMemoryRouter` 在当前 Router 实例内维护 entries，不改浏览器地址栏。它非常适合隔离 Demo、测试和
非浏览器运行环境，但有两个限制：

1. 宿主页面刷新会创建新的 Router 实例，内存 entries 本身不提供浏览器持久化。
2. state 直接保存在内存 Location 中，不经过浏览器 History API 的结构化序列化。

因此一个函数 state 在 Memory Router 中“看起来可用”，不能证明它能写入 Browser History。浏览器刷新、
新标签和 `DataCloneError` 必须按浏览器 API 规则理解，不能用内存 Demo 代替验证。

## 五、用 Demo 观察 Location entry

下面的观察台使用 `createMemoryRouter` 与 `RouterProvider`，实时显示当前 `pathname`、`search`、`hash`、
`state`、`key` 和 navigation type。所有 entries 都留在内存 Router 中，不会接管学习站外层 URL。

:::demo{id="react.router.learn.basics.location-and-history-state.location-observer-demo"}
:::

按以下顺序观察：

1. 初始 entry 是 `/orders/41?from=list#summary`，navigation type 为 POP，state 来自订单列表，key 为
   `default`。
2. 点击“Push 同路径推荐”，pathname 保持 `/orders/41`，search、state 和 key 变化，navigation type
   变为 PUSH。
3. 点击“Replace 搜索结果”，当前 entry 被替换，state 与 key 再次变化，类型变为 REPLACE。
4. 点击“后退一项”，直接 POP 回初始订单；被替换的推荐订单不再位于中间。
5. 点击“前进一项”，POP 到搜索结果，恢复它的 state 与 key；POP 本身不说明前进还是后退。
6. 点击“Push 无 state 订单”，页面显示明确的 `null` fallback，而不是抛出异常。
7. 刷新课程页面或离开后再返回会重新创建 Demo，并恢复固定初始 entry。这只证明 Memory Router 实例
   重建，不代表 Browser History 的刷新合同。

## 六、易错使用提示

:::pitfalls

### 错误：把可分享状态只放进 `location.state`

**触发条件：** 把订单 ID、筛选条件或需要书签恢复的视图只写入 state。

**原因：** state 不进入 URL，也不会随复制的 href、直接访问或新标签传输。

**后果：** 分享链接或书签无法恢复页面所需状态，服务端也不能理解请求。

**错误示例：**

```tsx
navigate('/orders', { state: { orderId: '42' } })
```

**正确写法：**

```tsx
navigate('/orders/42?tab=summary', {
  state: { source: '推荐卡片' },
})
```

**验证方式：** 复制最终 URL 到独立标签访问；核心页面仍可由 pathname/search 恢复，只有临时来源允许缺失。

### 错误：无条件解构 `location.state`

**触发条件：** 代码假设所有入口都传入了同一形状的 state。

**原因：** 用户可以直接访问，旧 history entry 也可能没有 state 或使用不同结构。

**后果：** 对 `null` 解构会抛错，错误断言还可能把不可信值带入业务逻辑。

**错误示例：**

```tsx
const { notice } = useLocation().state
```

**正确写法：**

```tsx
const { state } = useLocation()
const notice = isOrderLocationState(state) ? state.notice : '当前没有导航提示'
```

**验证方式：** 直接访问目标 URL并从无 state 的 entry 进入，页面都能显示 fallback。

### 错误：把 `location.key` 当成业务 ID

**触发条件：** 用 key 查询订单、用户或服务端记录。

**原因：** key 标识 location entry；相同业务 URL 可以对应多个 key，初始 key 又是 `default`。

**后果：** 刷新、新 Router、重复访问或跨标签后，业务身份无法稳定对应。

**错误示例：**

```tsx
loadOrder(location.key)
```

**正确写法：**

```tsx
const { orderId } = useParams()
loadOrder(orderId)
```

**验证方式：** 对同一 pathname 连续 push 两次；业务 ID保持不变，而 entry key 可以不同。

### 错误：认为 REPLACE 只是换 URL

**触发条件：** 使用 replace 进入新页面，同时期望后退还能回到被替换的 entry。

**原因：** REPLACE 会用新 entry 覆盖当前 index，不会在 history 中保留被替换的 entry。

**后果：** 用户后退时会越过被替换页，无法通过 history 返回它。

**错误示例：**

```tsx
navigate('/orders/43', { replace: true })
// 错误预期：后退仍会回到 /orders/42
```

**正确写法：**

```tsx
navigate('/orders/43')
// 需要保留 /orders/42 时使用 PUSH
```

**验证方式：** 从 A push 到 B，再 replace 为 C；后退应直接回到 A，而不是 B。

### 错误：在 state 中传递不可序列化值

**触发条件：** 把函数、DOM 节点或 Promise 放进 Browser History state。

**原因：** 浏览器 History API 使用结构化序列化，不支持这些对象。

**后果：** 客户端导航可能抛出 `DataCloneError`；Memory Router 能保存引用也不能证明浏览器兼容。

**错误示例：**

```tsx
navigate('/done', { state: { onDone: () => save() } })
```

**正确写法：**

```tsx
navigate('/done', { state: { source: 'editor', saved: true } })
```

**验证方式：** 用 Browser History 的真实运行环境验证小型可结构化数据，不以 Memory Router 结果代替。

### 错误：直接覆盖 `window.history.state`

**触发条件：** 业务代码调用 `replaceState` 并用自定义对象覆盖当前 state。

**原因：** React Router 的 Browser History 还需要保存用户 state、key 和内部 index。

**后果：** POP 的 index 计算与 Location 恢复可能失去 Router 所需信息。

**错误示例：**

```tsx
window.history.replaceState({ source: 'search' }, '', location.href)
```

**正确写法：**

```tsx
navigate(location.pathname, {
  replace: true,
  state: { source: 'search' },
})
```

**验证方式：** 只通过 Router 公共 API 写入 state，再执行后退、前进并确认 Location 可正常恢复。
:::

## 七、源码推导与适用场景

### 1. `useLocation` 读取 Router context

**官方事实：** 固定版本先检查 Router 上下文，再返回 `LocationContext.location`；Router context 的值包含
navigation type 和当前 location。

**课程推导：** 需要当前 pathname、state 或 key 的 route component 应直接使用 Hook，不读取 DOM 文本，
也不依赖 Router 的内部对象。

**边界：** Hook 返回已提交位置，不描述 pending target；进行中导航属于独立的数据导航状态。

### 2. Browser History 保存用户 state 与 Router 元数据

**官方事实：** 固定版本把用户 state、key 与内部 index 组合进 `window.history.state`，读取时再还原为
Location。浏览器规范要求 history state 执行面向存储的结构化序列化。

**课程推导：** state 应保持小型、可结构化并允许缺失；业务代码应通过 Link/navigate 写入，避免覆盖
Router 管理的 history state。

**边界：** 这里解释当前固定版本的浏览器实现，不把内部字段名当成应用 API，也不承诺浏览器永久保存。

### 3. Memory history 让 entry 变化可重复

**官方事实：** 固定版本用 entries 数组与 index 管理内存 history；PUSH 插入并截断 forward entries，
REPLACE 原位替换，POP 在已有 index 间移动。

**课程推导：** 固定初始 entry 后，可以重复观察 URL、state、key 与 navigation type 的共同变化，而不
修改宿主地址栏。

**边界：** 内存 state 不经过浏览器结构化序列化，宿主刷新也会重建 Router；Demo 不证明真实刷新或
新标签行为。

### 4. URL 与 entry state 应按恢复需求分工

**官方事实：** Link 生成的 href 表达 URL，state 通过客户端 History API 单独传递；目标 route 使用
`useLocation` 读取。

**课程推导：** 页面在 state 缺失时仍应由 URL 和持久数据正常成立，state 只增强这一次导航体验。

**边界：** state 不替代服务端数据、全局 store、权限校验、缓存或表单提交结果。

## 八、练习

:::exercise

### 练习目标

**要求：** 完成四组判断。第一组，把“订单 ID”“筛选标签”“返回来源提示”“一次性成功提示”“服务端
权限”分别放进 pathname、search、location state 或服务端数据，并说明恢复条件。第二组，为目标页写出
一个只接受 `{ source: string }` 的运行时检查，让直接访问显示“未知来源”。第三组，从 entry A 开始依次
执行 push B、replace C、back、forward，写出每一步的 navigation type、当前 state 以及 B 是否仍可访问。
第四组，解释为什么一个在 Memory Router 中能保存函数的示例，不能证明 Browser History 也支持它。

**验收：** 资源身份与可分享筛选进入 URL，临时提示可以进入 state，权限来自可信数据；读取端允许
state 缺失；entry 推演结果为 PUSH、REPLACE、POP、POP 且 B 已被替换；序列化解释明确区分内存引用与
浏览器结构化序列化。
:::

## 九、本节小结

- `useLocation()` 返回当前已经提交的 Location，必须在 Router 上下文中使用。
- `pathname`、`search` 与 `hash` 描述 URL；`state` 与 `key` 属于当前 history entry。
- state 适合小型、可丢失的导航上下文；分享、书签、服务端或长期恢复需要 URL 或持久数据源。
- 读取 state 时必须处理 `null` 和旧形状，TypeScript 断言不等于运行时验证。
- key 标识 location entry，不是业务实体 ID；相同 URL 的 entries 可以拥有不同 key 和 state。
- PUSH 新增 entry，REPLACE 替换当前 entry，POP 切换已有 entry且不能单独判断方向。
- Browser History 结构化序列化 state；Memory Router 只保存实例内存，不能代替刷新、新标签或序列化验证。

## 十、参考资料

- [React Router 8.3.0 useLocation](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useLocation.md#L19-L54) - 当前 Location 返回值与 Effect 示例。
- [React Router 8.3.0 Location 类型](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L34-L80) - URL、state、key 与初始 key 合同。
- [React Router 8.3.0 Link state](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/components/Link.md#L140-L183) - replace、state 写入与客户端边界。
- [React Router 8.3.0 Link push/replace](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L2217-L2291) - 不同 URL 与同一 URL 的默认 history action。
- [React Router 8.3.0 useNavigate](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L224-L305) - 程序导航 state option。
- [React Router 8.3.0 useNavigationType](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L165-L179) - POP、PUSH、REPLACE 返回值。
- [React Router 8.3.0 Memory History](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L223-L359) - entries、index、state、key 与三种 action。
- [React Router 8.3.0 Browser History](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L384-L419) - 从浏览器 history state 恢复用户 state 与 key。
- [React Router 8.3.0 History state](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L552-L568) - 用户 state、key 与内部 index 的写入结构。
- [React Router 8.3.0 Browser History 写入](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/history.ts#L655-L737) - pushState、replaceState 与写入行为。
- [WHATWG History 接口](https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-history-interface) - history state 与 session history entry。
- [WHATWG StructuredSerializeForStorage](https://html.spec.whatwg.org/multipage/structured-data.html#structuredserializeforstorage) - History state 的结构化序列化边界。
- [MDN History pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) - state 的序列化与浏览器大小限制。
