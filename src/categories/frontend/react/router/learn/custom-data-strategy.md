---
id: react.router.learn.advanced.custom-data-strategy
type: lesson
title: 自定义 Data Strategy
summary: 使用 dataStrategy 接管 loader 与 action 的执行调度，并把每个 route handler 的结果交还给 Router。
domain: frontend
technology: react
module: router
stage: advanced
level: advanced
estimatedMinutes: 120
prerequisites:
  - react.router.learn.intermediate.loader-data-loading
  - react.router.learn.intermediate.revalidation
  - react.router.learn.intermediate.fetcher
  - react.router.learn.advanced.route-state-ownership
related:
  - react.router.learn.advanced.race-conditions
  - react.router.learn.intermediate.route-error-boundary
tags:
  - React Router
  - Data Mode
  - dataStrategy
  - DataStrategyMatch
  - DataStrategyResult
  - Revalidation
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-26
objectives:
  - 能说明 dataStrategy 接收哪些匹配信息，以及它必须返回什么结果结构。
  - 能使用 shouldCallHandler 筛选本次真正需要执行的 route handler。
  - 能通过 match.resolve 执行 handler，并把结果按 route id 交还给 Router。
  - 能实现一个有明确取舍的执行调度策略，并保留 Router 的 loader、action 和错误处理语义。
  - 能判断自定义策略何时已经越过低层 API 的合理边界，并为其补充针对性验证。
recap:
  - dataStrategy 覆盖 Router 默认的 loader/action 执行方式，不是另一个通用缓存 API。
  - matches 通过 shouldCallHandler 表达本次应执行的 handler，resolve 负责执行并返回 DataStrategyResult。
  - 策略必须返回以 route id 为键的结果；漏掉需要执行的 route 会破坏数据加载。
  - 默认 loader 并行是常规选择；串行、上下文注入或统一请求都应有明确的业务理由和测试。
  - shouldLoad 已被 shouldCallHandler 与 shouldRevalidateArgs 取代，迁移时不能把两套语义混用。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 本课核验的稳定版本为 React Router 8.3.0，并对应固定官方发布版本。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 在核验时返回 8.3.0。
  - title: React Router 8.3.0 Data Strategy
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/data-strategy.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - dataStrategy 可以接管 loader/action 的执行，并接收 matches、runClientMiddleware 和 fetcherKey。
      - DataStrategyMatch 提供 shouldCallHandler、shouldRevalidateArgs 和 resolve。
      - 策略需要返回按 route id 索引的 DataStrategyResult；官方示例通过 Promise.all 调用 resolve。
      - resolve 可以接收 handler override，以便把自定义上下文传给 route handler。
      - shouldCallHandler 是推荐的新 API，shouldLoad 已被标记为弃用。
  - title: React Router 8.3.0 createMemoryRouter
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/data-routers/createMemoryRouter.md
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 的 dataStrategy 选项可以覆盖默认的 loader 并行执行方式。
      - Data Router 应创建一次并传给 RouterProvider，而不是放入 React state。
  - title: React Router 8.3.0 Router Types
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/utils.ts
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - DataStrategyFunction 的返回值是 Promise<Record<string, DataStrategyResult>>。
      - DataStrategyMatch 的 resolve 返回 Promise<DataStrategyResult>，fetcherKey 在非 Fetcher 执行时为空。
---

# 自定义 Data Strategy

## 一、学习目标

- 能说明 `dataStrategy` 接收哪些匹配信息，以及它必须返回什么结果结构。
- 能使用 `shouldCallHandler` 筛选本次真正需要执行的 route handler。
- 能通过 `match.resolve` 执行 handler，并把结果按 route id 交还给 Router。
- 能实现一个有明确取舍的执行调度策略，并保留 Router 的 loader、action 和错误处理语义。
- 能判断自定义策略何时已经越过低层 API 的合理边界，并为其补充针对性验证。

## 二、为什么需要

Data Router 默认会并行执行需要加载的 route loader。这是大多数页面的合理默认值：彼此独立的请求可以同时
开始，页面更快得到完整数据。但有些应用需要在所有 handler 前先建立统一上下文，或必须把几个请求串行化，
也可能需要把多个路由片段合并到一次后端请求中。

`dataStrategy` 是这些高级需求的执行边界。它让应用决定“哪些匹配项现在执行、如何执行、结果如何交回”，而
不是让每个页面自行复制一套 loader 调度器。代价是你接管了 Router 原本负责的低层流程：筛选错了匹配项、漏掉
结果或吞掉错误，都可能使正常导航和重验证失效。

因此，自定义策略不是给普通页面增加一个抽象层，而是为明确的执行约束选择一个集中入口。没有可说明的约束时，
继续使用默认策略更容易维护。

## 三、核心概念

### 1. dataStrategy 的输入与输出

`dataStrategy` 接收 `DataStrategyFunctionArgs`。最常用的字段如下：

| 字段 | 作用 |
| --- | --- |
| `matches` | 当前请求匹配到的 `DataStrategyMatch` 数组 |
| `request` | 当前 loader/action 请求，包含 URL、method 和 signal |
| `params` | 当前匹配得到的路径参数 |
| `context` | Router 为本次执行提供的上下文 |
| `fetcherKey` | Fetcher 执行时的 key；页面导航时为空 |
| `runClientMiddleware` | 按 Router 规则运行客户端 middleware 的组合函数 |

每个 `DataStrategyMatch` 除了普通的 route match，还提供三个调度入口：

- `shouldCallHandler()`：判断这个匹配项本次是否应执行 handler。可以传入自定义的默认 revalidation 值。
- `shouldRevalidateArgs`：传给 route 的 `shouldRevalidate` 的参数；没有重验证语境时可能为 `null`。
- `resolve()`：执行该匹配项的 loader 或 action，并返回 `{ type: 'data' | 'error', result }`。

策略最终返回一个对象，键是 route id，值是相应的 `DataStrategyResult`：

```tsx
const results: Record<string, DataStrategyResult> = {}

for (const match of matches.filter((item) => item.shouldCallHandler())) {
  results[match.route.id] = await match.resolve()
}

return results
```

只返回真正执行的匹配项。不要为不需要加载的路由伪造数据，也不要把整个 Router state 当成策略返回值。

### 2. shouldCallHandler 决定执行集合

同一个 `matches` 数组可能用于初次加载、普通导航、action 后重验证或 Fetcher。每种场景需要执行的 handler
集合不同。官方提供 `shouldCallHandler()`，让策略沿用 Router 的默认判断：

```tsx
const matchesToLoad = matches.filter((match) => match.shouldCallHandler())
```

对于页面加载，它通常包含新路由和需要重验证的已有路由；对于 action 或 Fetcher，它通常只包含目标 handler。
这不是让应用猜测的固定数组，而是 Router 根据当前请求计算出的执行合同。

如果业务确实要改写默认重验证，可以根据 `match.shouldRevalidateArgs` 计算一个布尔值，再传给
`shouldCallHandler(defaultShouldRevalidate)`。改写前应说明哪些数据依赖不会因本次请求改变，否则可能留下旧快照。

### 3. resolve 连接策略与真实 handler

`match.resolve()` 是策略与 route loader/action 之间的连接。它会在 Router 需要时解析 lazy route，并把 handler
的返回值或抛出的错误包装成 `DataStrategyResult`。策略可以直接调用它：

```tsx
const result = await match.resolve()
results[match.route.id] = result
```

也可以传入 handler override，把一个自定义上下文作为 route handler 的第二个参数：

```tsx
await match.resolve((handler) => handler({ requestId: crypto.randomUUID() }))
```

这并不改变 loader 的第一个参数，`request`、`params` 等仍由 Router 提供。上下文注入属于策略与 route 之间的
应用合同，必须由两边共同约定类型；不要把未定义的全局变量偷偷塞进 handler。

### 4. 选择执行调度

最小策略只记录日志并保持默认并行：

```tsx
const results = await Promise.all(
  matchesToLoad.map(async (match) => [match.route.id, await match.resolve()] as const),
)
return Object.fromEntries(results)
```

只有在存在顺序依赖时才改为串行：

```tsx
const results: Record<string, DataStrategyResult> = {}
for (const match of matchesToLoad) {
  results[match.route.id] = await match.resolve()
}
return results
```

并行通常减少总等待时间；串行会把每个 handler 的延迟叠加。调度策略改变的是 handler 何时开始，不是把
loader data 变成另一种状态所有者。返回结果后，Router 仍负责把数据放入对应的 route data，并继续处理导航、
重验证和错误边界。

### 5. Fetcher 执行与 middleware 边界

当 `fetcherKey` 有值时，`dataStrategy` 处理的是局部 Fetcher 请求，而不是页面导航。策略可以记录或区分这个
范围，但不能因为看到 key 就把结果写入页面级 React state。页面和 Fetcher 仍由 Router 的各自数据域管理。

如果路由使用客户端 middleware，策略应通过 `runClientMiddleware` 包住 handler 执行，让 Router 的 middleware
链保持完整。没有 middleware 时，不需要为了形式调用它；本课 Demo 聚焦 handler 调度，未加入 middleware。

## 四、用法与示例

### 1. 保留默认并行，只添加执行追踪

下面的策略对每个实际执行的匹配项记录 route id，同时保持并行：

```tsx
const loggingDataStrategy: DataStrategyFunction = async ({ matches }) => {
  const matchesToLoad = matches.filter((match) => match.shouldCallHandler())
  const results: Record<string, DataStrategyResult> = {}

  await Promise.all(
    matchesToLoad.map(async (match) => {
      console.log(`processing ${match.route.id}`)
      results[match.route.id] = await match.resolve()
    }),
  )
  return results
}
```

这类策略适合增加可观察性，行为变化小。它仍必须处理 `resolve` 返回的 error 结果，不要在策略中把异常随意
转换成成功数据。

### 2. 只在有顺序依赖时串行执行

如果子路由必须等待父路由建立上下文，可以按 `matchesToLoad` 的顺序执行：

```tsx
const serialDataStrategy: DataStrategyFunction = async ({ matches }) => {
  const results: Record<string, DataStrategyResult> = {}
  for (const match of matches.filter((item) => item.shouldCallHandler())) {
    results[match.route.id] = await match.resolve()
  }
  return results
}
```

这里的顺序来自匹配数组和业务约束，不应假设任意数组顺序都代表数据库依赖。若只是希望共享一个 token 或
请求上下文，优先考虑 `resolve` 的 handler override 或 Router 的 context 能力，而不是为了共享数据强制所有
loader 串行。

### 3. 为重验证保留默认判断

策略不应把每次导航都当成“全部重载”。沿用默认判断：

```tsx
const matchesToLoad = matches.filter((match) => match.shouldCallHandler())
```

如果要改变默认值：

```tsx
const matchesToLoad = matches.filter((match) => {
  const defaultShouldRevalidate = decideFrom(match.shouldRevalidateArgs)
  return match.shouldCallHandler(defaultShouldRevalidate)
})
```

`decideFrom` 应该是可解释的业务规则，并且只影响确实不需要重读的数据。不要直接用 URL 字符串包含某个词来
跳过所有 loader；应先确定路由数据依赖和 action 影响范围。

### 4. 用独立 Fetcher 观察局部策略调用

Fetcher 请求同样经过 `dataStrategy`，但它的 `fetcherKey` 会标记这次调用属于哪个 Fetcher。页面可以这样读取
局部结果：

```tsx
function PreviewButton() {
  const fetcher = useFetcher<Preview>()

  function loadPreview() {
    fetcher.load('/preview?item=42')
  }

  return (
    <button type="button" onClick={loadPreview}>
      {fetcher.state === 'idle' ? '读取预览' : '读取中'}
    </button>
  )
}
```

策略可以记录 `fetcherKey`，但局部结果仍由该 Fetcher 的 `data` 消费。它不应因为策略集中处理请求，就把所有
Fetcher 的数据合并成一个全局列表。

### 5. 把错误结果交还给 Router

`DataStrategyResult` 的 `type` 区分 handler 返回数据和抛出错误：

```tsx
const result = await match.resolve()
if (result.type === 'error') {
  console.error('route handler failed', match.route.id, result.result)
}
results[match.route.id] = result
```

记录错误可以帮助诊断，但通常仍要把原始结果放回对象，让对应 route 的 Error Boundary 或导航错误处理继续接管。
策略不应把所有错误变成 `{ type: 'data', result: null }`，否则页面会失去明确的失败语义。

## 五、用法示例或 Demo

:::demo{id="react.router.learn.advanced.custom-data-strategy.custom-data-strategy-demo"}
初次加载会记录 root 与 overview 两个 route handler 的执行。点击“使用串行策略”会重新验证当前页面，观察
root loader 完成后才开始 overview loader；切回“使用并行策略”可比较两个 resolve 同时开始的日志。点击“读取
局部 Fetcher”时，策略收到 `fetcherKey`，但地址和页面 loader 数据不变。
:::

Demo 使用内存 Router 和本地可取消延迟，不访问真实服务端。它只演示 `matches`、`shouldCallHandler`、
`resolve`、`DataStrategyResult` 与 `fetcherKey` 的运行关系，不把串行调度说成所有项目都应采用的默认方案。

## 六、易错使用提示

:::pitfalls
### 错误：对所有 matches 都调用 resolve

**触发条件：** 直接遍历 `matches`，没有先调用 `shouldCallHandler()`。

**原因：** matches 描述当前匹配链，不等于本次请求需要执行的全部 handler。

**后果：** 不需要重验证的 loader 被额外调用，可能造成重复请求或覆盖不应变化的数据。

**错误示例：**

```tsx
for (const match of matches) {
  results[match.route.id] = await match.resolve()
}
```

**正确写法：**

```tsx
for (const match of matches.filter((item) => item.shouldCallHandler())) {
  results[match.route.id] = await match.resolve()
}
```

**验证方式：** 在普通导航、action 重验证和 Fetcher 请求中分别记录 route id，确认只执行本次需要的匹配项。

### 错误：漏掉 route id 或返回错误形状

**触发条件：** 返回数组、裸 loader data，或用组件名称而不是 `match.route.id` 作为键。

**原因：** Router 通过 route id 把策略结果分配给对应 route，并依赖 `DataStrategyResult` 区分 data 与 error。

**后果：** 页面拿不到 loader data，错误边界也可能无法收到原始失败。

**错误示例：**

```tsx
return matchesToLoad.map((match) => match.resolve())
```

**正确写法：**

```tsx
const results: Record<string, DataStrategyResult> = {}
for (const match of matchesToLoad) {
  results[match.route.id] = await match.resolve()
}
return results
```

**验证方式：** 让父子 route 都有 loader，确认两个组件都收到各自数据，并让一个 loader 抛错后确认错误边界仍能显示。

### 错误：无理由把 loader 全部改成串行

**触发条件：** 看到 dataStrategy 就用 `for...of` 替换官方默认并行。

**原因：** 串行会让独立请求互相等待，增加总延迟；执行顺序本身不是数据正确性的证明。

**后果：** 页面变慢，且策略承担了不必要的复杂度。

**错误示例：**

```tsx
for (const match of matchesToLoad) {
  await match.resolve()
}
```

**正确写法：**

```tsx
await Promise.all(matchesToLoad.map((match) => match.resolve()))
```

**验证方式：** 用可测量的延迟比较总耗时；只有存在明确顺序依赖时才保留串行策略。

### 错误：用已弃用的 shouldLoad 代替新 API

**触发条件：** 新代码直接读取 `match.shouldLoad`，或同时把它和 `shouldCallHandler` 当作两次筛选。

**原因：** 当前 API 用函数形式允许策略覆盖默认重验证值；旧布尔字段无法表达同样的控制能力。

**后果：** 迁移后策略无法正确参与 route 的 `shouldRevalidate` 决策，未来版本也更难维护。

**错误示例：**

```tsx
const matchesToLoad = matches.filter((match) => match.shouldLoad)
```

**正确写法：**

```tsx
const matchesToLoad = matches.filter((match) => match.shouldCallHandler())
```

**验证方式：** 触发带 action 的重验证和只改变查询参数的导航，确认 route 级 `shouldRevalidate` 仍能参与判断。

### 错误：吞掉 handler 的 error 结果

**触发条件：** 捕获 `resolve` 的失败后返回空数据，或把 `result.type === 'error'` 改成 `data`。

**原因：** DataStrategyResult 的 error 形状是 Router 继续处理错误边界和导航失败的入口。

**后果：** 用户看到空页面或“成功”状态，真正的错误被隐藏。

**错误示例：**

```tsx
const result = await match.resolve()
results[match.route.id] = { type: 'data', result: null }
```

**正确写法：**

```tsx
results[match.route.id] = await match.resolve()
```

**验证方式：** 让一个 loader 抛出 Error，确认错误边界收到失败，而不是渲染伪造的空数据。
:::

## 七、源码推导与适用场景

1. **官方事实：** React Router 8.3.0 的 `DataStrategyMatch` 类型提供 `shouldCallHandler`、
   `shouldRevalidateArgs` 和 `resolve`；`DataStrategyFunction` 要求返回按 route id 索引的
   `DataStrategyResult`。官方 Data Strategy 指南的基础实现先筛选，再调用 `resolve`，并用 `Promise.all`
   保持并行。
2. **课程推导：** 自定义策略应先复用 Router 的执行判断，再只改变真正必要的调度部分。日志、串行上下文或
   统一后端请求都应集中在策略边界，并用 route id 重新分配结果。
3. **边界：** 这些类型和方法定义了调用合同，不承诺某个内部调度变量、请求顺序或缓存行为。`dataStrategy`
   是低层 API，错误实现可能破坏导航、Fetcher、重验证和错误恢复；没有清晰需求时应保留默认策略。
4. **适用场景：** 统一 middleware/context、确实需要顺序的 handler、统一 GraphQL 请求或受控的执行追踪可以
   使用它。通用服务端缓存、离线队列、跨页面客户端状态和动态路由发现不属于本课的执行调度主题。

## 八、练习

:::exercise
### 练习目标

**要求：** 为一个父子路由配置 `dataStrategy`。先实现保留默认并行的策略，记录每个 `route.id` 和
`fetcherKey`；再增加一个只用于实验的串行模式。让父子 loader 返回不同数据，并添加一个只由 Fetcher 访问的
预览 loader。

**验收：** 初次加载和并行重验证中两个 handler 都会执行且可以同时开始；串行模式中后一个 handler 只在前一个
`resolve` 完成后开始；Fetcher 请求只返回自己的 route id 结果，不改变页面地址；任一 loader 抛错时，原始错误仍由
Router 的错误边界处理；策略返回值始终是 `Record<string, DataStrategyResult>`。
:::

## 九、本节小结

- `dataStrategy` 是接管 loader/action 执行调度的低层 Data Mode API。
- 先用 `shouldCallHandler()` 得到本次执行集合，再用 `match.resolve()` 运行 handler。
- 返回值必须按 `route.id` 映射到 `DataStrategyResult`，并保留 data/error 形状。
- 默认并行适合独立 loader；串行、上下文注入和统一请求都需要明确理由与验证。
- Fetcher、重验证和错误边界仍有自己的 Router 生命周期，不能被策略粗暴合并。

## 十、参考资料

- [Data Strategy](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/data-strategy.md) - 支持 dataStrategy 输入、匹配筛选、resolve、结果映射、middleware 和 shouldLoad 迁移边界。
- [createMemoryRouter](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/data-routers/createMemoryRouter.md) - 支持 dataStrategy 选项和 Data Router 实例生命周期。
- [React Router Router Types](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/router/utils.ts) - 支持 DataStrategyFunction、DataStrategyMatch 和 DataStrategyResult 的固定版本类型合同。
- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 支持课程适用的稳定发布版本。
