---
id: react.router.learn.intermediate.revalidation
type: lesson
title: Revalidation
summary: 掌握 Router 何时重新调用 loader，并用自动、手动与选择性重验证保持页面数据同步。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 95
prerequisites:
  - react.router.learn.intermediate.form-fetcher-choice
related:
  - react.router.learn.intermediate.loader-data-loading
  - react.router.learn.intermediate.fetcher
  - react.router.learn.intermediate.action-data-submission
tags:
  - React Router
  - Data Mode
  - Revalidation
  - useRevalidator
  - shouldRevalidate
  - loader
  - fetcher.load
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-21
objectives:
  - 能说明 revalidation 会在当前页面上重新调用符合条件的 loader，而不是建立一套额外缓存。
  - 能区分 action 后的自动 revalidation 与 Router 外部变化触发的手动 revalidation。
  - 能从 useRevalidator 读取 idle/loading，并在 loading 期间继续呈现旧 loader data。
  - 能列出活动 route loader 的常见默认触发条件，并说明新 route 的首次加载不是可选重验证。
  - 能说明已完成的 fetcher.load 只在 action 或显式 revalidation 等条件下默认重新读取原 href。
  - 能使用 shouldRevalidate 处理一个可证明与 loader 无关的例外，并在其余分支返回 defaultShouldRevalidate。
  - 能从 currentUrl、nextUrl、submission 与 actionResult 判断本轮重验证上下文。
  - 能用 loader 调用次数、版本号和状态序列验证自动、手动与跳过行为。
  - 能避免在普通 CRUD action 后额外调用 revalidate，或把重复调用误解为请求去重。
recap:
  - action 成功后 Router 已会自动重新验证相关 loader，普通 CRUD 通常不需要再手动刷新。
  - useRevalidator 适合窗口聚焦、轮询通知或跨系统写入等 Router 外部变化。
  - 显式 revalidation 保留当前 location 与旧 loader data，并通过 idle/loading 表达过程。
  - 活动 route loader 与已完成的 fetcher.load 使用不同的默认重验证条件。
  - shouldRevalidate 只优化依赖关系明确的例外，其余路径应返回 defaultShouldRevalidate。
  - shouldRevalidate 返回 false 可能让 UI 与数据源失同步，包括挡住显式 revalidate。
  - 页面 navigation、提交 Fetcher 与显式 revalidator 各自拥有不同状态通道。
  - 已执行 fetcher.load 的 href 会被 Router 记住，action 或手动 revalidation 后可以重新读取。
  - loading 期间保留旧数据并标出正在同步，比清空页面更符合 Router 的数据提交方式。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是本课核验的稳定发布版本，对应固定官方提交。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 2026-08-21 的 latest dist-tag 为 8.3.0。
  - title: React Router useRevalidator API
    url: https://reactrouter.com/8.3.0/api/hooks/useRevalidator
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useRevalidator 返回 revalidate 函数与 idle/loading 状态。
      - action 后页面数据已经自动重新验证，手动 API 面向普通 mutation 之外的事件。
  - title: React Router Route Object shouldRevalidate
    url: https://reactrouter.com/8.3.0/start/data/route-object#shouldRevalidate
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - shouldRevalidate 可以修改活动 route loader 的默认重验证决定。
      - action、search 与 route 参数变化会参与默认判断。
  - title: React Router shouldRevalidate Arguments Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L376-L441
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - ShouldRevalidateFunctionArgs 包含当前和目标 URL/参数、submission、action 结果与默认值。
      - 官方类型注释建议在特定优化后返回 defaultShouldRevalidate。
  - title: React Router Revalidation Selection Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L5331-L5625
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 活动 route loader 与 fetcher.load 使用不同的默认重验证条件。
      - 新 route、缺失数据和需要恢复的 Fetcher 不属于普通可选跳过路径。
  - title: React Router Revalidate Implementation
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L1808-L1860
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 显式 revalidate 设置全局 revalidation 状态并在当前或待到达 location 上启动加载。
      - 重复调用共享完成信号，但会中止并重启活动加载。
  - title: React Router Revalidation Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/revalidate-test.ts#L15-L1135
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 显式 revalidation 保持 location key，并在 loading 期间保留旧 loader data。
      - 已加载 Fetcher 可以随显式 revalidation 重新读取。
  - title: React Router Fetcher Revalidation Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/fetchers-test.ts#L2015-L2665
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - fetcher.load 会记录目标 href，并在 action 或显式 revalidation 后按规则重新读取。
      - 普通 search 导航不会默认重跑独立 fetcher.load。
---

# Revalidation

## 一、学习目标

完成本课后，你能够：

- 解释 loader data 为什么以及何时需要重新验证。
- 区分 action 自动触发、外部事件手动触发和 route 选择性跳过三条路径。
- 正确读取 `useRevalidator().state`，而不把它当成 navigation 或 Fetcher 的总状态。
- 判断活动 route loader 与已执行 `fetcher.load` 的默认刷新差异。
- 安全编写 `shouldRevalidate`：只处理明确例外，其余返回 `defaultShouldRevalidate`。
- 用可观察的版本、调用次数与状态轨迹验证页面是否真的同步。

## 二、为什么需要 Revalidation

loader 返回的是某一时刻的数据快照。用户留在同一个页面时，底层数据可能因为 route action、另一个标签页、
窗口重新聚焦或外部系统通知而改变。如果页面继续显示旧快照，它就和数据源失去同步。

React Router 把“重新调用当前数据来源并提交新结果”的过程称为 **revalidation**。它沿用 route loader，不要求
组件再维护一份请求函数，也不要求把 loader data 复制到本地 state。

```text
数据源 revision 4
       |
       | loader
       v
页面 loader data revision 4
       |
外部写入让数据源变成 revision 5
       |
       | revalidation 再次调用 loader
       v
页面 loader data revision 5
```

关键不是“刷新组件”，而是让 Router 再次执行拥有数据职责的 loader。组件仍通过 `useLoaderData` 消费结果。

## 三、Revalidation 的最小模型

### 1. 它不是一次新页面导航

显式 revalidation 在当前 location 上重新读取数据，不新增 history 记录。加载期间，当前 location 和旧的
loader data 继续可读；新结果完成后 Router 才提交替换。

因此常见 UI 不是先清空列表，而是保留旧内容并显示同步状态：

```tsx
const data = useLoaderData<typeof loader>()
const revalidator = useRevalidator()

return (
  <section aria-busy={revalidator.state === 'loading'}>
    <p>{revalidator.state === 'loading' ? '正在同步' : '数据已同步'}</p>
    <InventoryList items={data.items} />
  </section>
)
```

### 2. 自动、手动与选择性判断

可以把本课的三条路径放在一起理解：

| 路径 | 触发者 | 常见用途 | 主要状态来源 |
| --- | --- | --- | --- |
| 自动 revalidation | action、特定 navigation | 提交后同步页面 loader data | `useNavigation` 或提交 Fetcher |
| 手动 revalidation | `revalidate()` | Router 外部数据变化 | `useRevalidator` |
| 选择性判断 | route `shouldRevalidate` | 跳过可证明无关的 loader | 函数参数和 loader 依赖 |

三者不是三套请求系统。它们最终都由 Router 决定哪些 loader 需要重新调用。

### 3. 首次加载与重新验证不同

新进入的 route 或缺少 loader data 的 route 必须先加载。`shouldRevalidate` 面向已经匹配、已经有数据的 route
是否需要再次调用 loader，不能用它阻止一个新页面取得首份数据。

## 四、Action 后的自动 Revalidation

### 1. 普通 mutation 已经自动刷新

当 mutation action 成功后，Router 默认重新验证当前活动 route 的 loader。页面组件不需要在 action 完成后再
手工调用 `revalidate()`：

```tsx
async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  await inventory.updateStock(formData.get('productId'))
  return { ok: true }
}

async function loader() {
  return inventory.readAll()
}
```

如果由 `fetcher.Form` 提交，局部 Fetcher 通常经历：

```text
idle -> submitting -> loading -> idle
```

其中 `loading` 表示 action 已完成，Router 正在重新验证相关 loader。全局 `navigation.state` 可以一直是
`idle`，因为 Fetcher mutation 没有建立页面导航。

### 2. 不要重复手动刷新

下面的写法通常会多发一轮读取：

```tsx
await fetcher.submit(formData, { method: 'post' })
await revalidator.revalidate()
```

`fetcher.submit` 不是一个等待完整提交结果的普通请求 Promise；更重要的是 action 后已经存在 Router 管理的
loader revalidation。普通 CRUD 应让 action 的自动流程完成。

### 3. 默认触发不是“所有情况无条件运行”

React Router 8.3.0 会结合 action 状态、当前/目标 URL、route 实例和默认优化计算
`defaultShouldRevalidate`。例如 action 返回或抛出带 `4xx/5xx` 状态的 Response 时，默认值为 `false`。
本课只说明判定边界，不展开错误 UI、冒泡或恢复界面。

## 五、使用 useRevalidator 手动同步

### 1. 返回值

`useRevalidator` 返回一个稳定的操作函数和当前状态：

```ts
{
  revalidate: () => Promise<void>
  state: 'idle' | 'loading'
}
```

它没有 `submitting`，因为手动 revalidation 不提交 action。调用方式如下：

```tsx
function RefreshInventoryButton() {
  const revalidator = useRevalidator()
  const isLoading = revalidator.state === 'loading'

  return (
    <button type="button" onClick={() => revalidator.revalidate()} disabled={isLoading}>
      {isLoading ? '同步中' : '同步库存'}
    </button>
  )
}
```

### 2. 正确用途

手动 revalidation 适合 Router 不知道数据已经变化的事件：

- 窗口重新获得焦点，需要读取可能在别处修改的数据。
- 定时器到达轮询时点。
- websocket、SSE 或跨标签页消息通知数据已更新。
- 一个外部系统完成写入，只通知前端“现在可以重新读取”。

这些事件只负责告诉 Router “数据可能过期”。真实数据仍由 loader 读取。

### 3. 保留旧数据并限制重复触发

在 `loading` 期间可以继续显示当前 loader data，同时禁用刷新按钮。快速重复调用不是网络请求去重：Router
共享最终完成信号，但会中止并重启活动加载。禁用按钮可以让本课的状态序列清晰，也避免把取消行为误解为
debounce 或缓存合并。

## 六、使用 shouldRevalidate 谨慎优化

### 1. 参数描述本轮上下文

route 的 `shouldRevalidate` 可以接收：

| 参数 | 用途 |
| --- | --- |
| `currentUrl` / `nextUrl` | 比较当前与目标 URL |
| `currentParams` / `nextParams` | 比较当前与目标 route 参数 |
| `formMethod` / `formAction` / `formEncType` | 识别触发本轮判断的提交 |
| `formData` / `json` / `text` | 按提交编码读取输入 |
| `actionStatus` / `actionResult` | 判断 action 的结果与业务范围 |
| `defaultShouldRevalidate` | Router 对本 route 本轮计算出的默认值 |

`currentUrl` 与 `nextUrl` 在非导航 revalidation 中可以相同。不要只靠 URL 是否改变判断 action 或手动刷新。

### 2. 安全写法只处理明确例外

假设库存 route 的 loader 只读取库存，而同一个 action 也可以保存页面显示密度。action 明确返回业务范围：

```tsx
function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (actionResult?.scope === 'preferences') {
    return false
  }

  return defaultShouldRevalidate
}
```

这里能返回 `false`，是因为“显示偏好不改变库存”是明确的数据依赖事实。库存 mutation、手动 revalidation、
参数变化和未来新增触发器仍回退到 Router 的默认值。

### 3. shouldRevalidate 是最终 route 决策

如果 route 对显式 `revalidate()` 也返回 `false`，该 loader 同样不会重跑。因此它不是只优化 navigation 的钩子，
更不是无风险性能开关。错误跳过会直接留下 stale UI。

React Router 8.3.0 也允许部分 Link、Form 或 imperative 调用点提供同名的 call-site 默认值。常规课程代码先让
Router 计算默认值，再由 route 的 `shouldRevalidate` 处理业务依赖即可；不要把调用点默认值与函数参数混成
两个并行规则来源。

## 七、活动 Route Loader 与 fetcher.load

### 1. 两类默认规则不同

活动 route loader 会考虑 action、显式 revalidation、相同 URL、search 变化和 route 实例变化。已完成的
`fetcher.load(href)` 则记住它自己的静态 href，默认只在 action submission 或显式 revalidation 等场景重新读取。

| 事件 | 活动 route loader | 已完成的 `fetcher.load` |
| --- | --- | --- |
| 成功 mutation action | 默认重跑 | 默认按记录的 href 重跑 |
| `revalidate()` | 默认重跑 | 默认按记录的 href 重跑 |
| 普通 search 变化 | 默认重跑 | 默认不重跑 |
| 普通导航且 route/params/search 未变 | 复用的祖先默认不重跑 | 默认不重跑 |
| 新 route 首次进入 | 必须加载 | 不适用 |

表中的“默认”仍可能受对应 route 的 `shouldRevalidate` 影响。

### 2. 必须先执行一次 fetcher.load

Router 只有在 Fetcher 真正加载过目标 href 后，才有可重验证的记录：

```tsx
const summaryFetcher = useFetcher<typeof summaryLoader>()

function loadSummary() {
  summaryFetcher.load('/inventory/summary')
}
```

如果摘要从未加载，页面 action 或手动 revalidation 不会凭空调用摘要 loader。这个区别可以防止把“路由中存在
loader”误解为“每轮都会执行所有 loader”。

### 3. 状态仍属于原 Fetcher

摘要被 action 或手动 revalidation 重新读取时，状态和新数据仍回到该 Fetcher。页面 loader data 与 Fetcher
data 是两个结果所有者，只是在同一轮 Router 数据同步中协作。

## 八、常见触发条件

对当前已经有数据的活动 route，常见默认条件包括：

- 成功 mutation action 完成。
- 显式调用 `revalidate()`。
- 导航到相同的 `pathname + search`。
- URL search 字符串发生变化。
- 该 route 的 pathname、动态参数或 splat 实例发生变化。

普通导航中，未变化且可复用的祖先 route loader 可以不重跑。只增加或改变 hash 的导航还有更早的短路规则，
不能用“相同 URL 一定重跑”概括。GET Form 产生的是 URL navigation，不是 mutation action，也应按 URL 与
route 规则判断。

这些默认值故意偏向数据正确性。只有应用能证明某个变化与 loader 依赖无关时，才适合进一步跳过。

## 九、Demo：库存同步观察台

Demo 使用一个内存 Data Router，页面 loader 返回库存快照和 revision，独立 `fetcher.load` 返回库存摘要：

- “售出 1 个机械键盘”通过 Fetcher mutation 修改库存，观察 `submitting -> loading -> idle`、页面 loader
  自动重跑，以及全局 navigation 保持 `idle`。
- “保存紧凑显示偏好”仍会调用 action，但 action 返回 `scope: preferences`；`shouldRevalidate` 确认它不影响
  库存后返回 `false`，两个 loader 计数保持不变。
- “模拟外部补货”只修改内存数据源，页面 revision 暂时保持旧值；点击“手动重新验证”后观察
  `revalidator.state` 的 `idle -> loading -> idle`。
- “加载摘要”先建立一个 Fetcher loader 记录。此后库存 action 或手动 revalidation 会让摘要按原 href 同步；
  重置后不先加载摘要，则不会凭空调用摘要 loader。
- 观察台同时显示 location、navigation、revalidator、页面/数据源 revision、loader/action 次数与状态轨迹。

:::demo{id="react.router.learn.intermediate.revalidation.revalidation-demo"}
:::

建议按“加载摘要 -> 库存 action -> 偏好 action -> 模拟外部补货 -> 手动重新验证”的顺序操作。每一步都先记录
计数和 revision，再确认状态回到 `idle` 后比较结果。

## 十、易错使用提示

:::pitfalls
### 错误：普通 CRUD action 后再次手动 revalidate

**触发条件：** action 成功后立刻调用 `revalidator.revalidate()`，认为 Router 不会自动更新 loader data。

**原因：** mutation action 完成后已经进入自动 revalidation。

**后果：** 同一个数据源多读取一轮，状态和计数也更难解释。

**错误示例：**

```tsx
fetcher.submit(formData, { method: 'post' })
revalidator.revalidate()
```

**正确写法：** 让 action 后的自动流程完成；只有 Router 外部变化才显式调用 `revalidate()`。

```tsx
fetcher.submit(formData, { method: 'post' })
```

**验证方式：** Demo 中一次库存提交只产生一轮 action 后 loader 计数增长。

### 错误：用 revalidator.state 观察所有自动刷新

**触发条件：** Fetcher mutation 后只看 `revalidator.state` 仍为 `idle`，就认为 loader 没有重新验证。

**原因：** 显式 revalidation、页面 navigation 与 Fetcher submission 使用不同状态通道。

**后果：** 提交按钮缺少正确 pending，或者全局 UI 显示错误状态。

**错误示例：**

```tsx
const isSaving = revalidator.state === 'loading'
```

**正确写法：** 提交读取对应 Fetcher，手动刷新读取 revalidator。

```tsx
const isSaving = fetcher.state !== 'idle'
const isRefreshing = revalidator.state === 'loading'
```

**验证方式：** Demo 中库存 action 的 Fetcher 改变状态时，revalidator 与 navigation 仍可保持 `idle`。

### 错误：shouldRevalidate 最后无条件返回 false

**触发条件：** 为减少请求，把 route 的所有重验证都关闭。

**原因：** 函数挡住的不只是某个 search 变化，也可能包括 action 和显式 revalidation。

**后果：** loader data 与数据源长期失同步。

**错误示例：**

```tsx
function shouldRevalidate() {
  return false
}
```

**正确写法：** 只跳过依赖明确的例外，其余返回 Router 默认值。

```tsx
function shouldRevalidate({ actionResult, defaultShouldRevalidate }) {
  if (actionResult?.scope === 'preferences') return false
  return defaultShouldRevalidate
}
```

**验证方式：** Demo 中偏好 action 不增加 loader 计数，但库存 action 和手动刷新都会增加。

### 错误：认为 search 变化会刷新所有 Fetcher

**触发条件：** 已用 `fetcher.load('/summary')` 加载摘要，随后修改当前页面 search，并期待摘要自动重跑。

**原因：** Fetcher 记录自己的静态 href，不按普通页面 search 导航默认刷新。

**后果：** 把页面 loader 与 Fetcher data 的所有权混在一起。

**错误示例：**

```tsx
setSearchParams({ filter: 'low-stock' })
// 误以为 summaryFetcher 一定重新加载
```

**正确写法：** 明确摘要何时需要 action 或显式 revalidation，或在真实依赖改变时主动加载目标 href。

```tsx
summaryFetcher.load('/summary?filter=low-stock')
```

**验证方式：** 对比分别记录的页面 loader 与 summary loader 调用次数。

### 错误：手动刷新时清空旧 loader data

**触发条件：** `revalidator.state === 'loading'` 时把内容区域替换成空白占位。

**原因：** Router 在新结果提交前仍保留当前 loader data。

**后果：** 页面闪烁，用户无法继续读取上一份有效内容。

**错误示例：**

```tsx
if (revalidator.state === 'loading') return null
```

**正确写法：** 保留旧内容，并用 `aria-busy` 或状态文字说明正在同步。

```tsx
<section aria-busy={revalidator.state === 'loading'}>
  <InventoryList items={data.items} />
</section>
```

**验证方式：** Demo 手动重新验证处于 `loading` 时，库存快照仍然可读。
:::

## 十一、源码推导与适用场景

### 1. 官方事实

固定版本源码先选出新 route 或缺失数据等必须加载项，再为已复用 route 计算默认值，并把
`defaultShouldRevalidate` 交给 route 函数作最终决定。Fetcher loader 使用单独的记录与筛选流程。

`revalidate()` 会把全局 revalidation 状态置为 `loading`，中止活动加载并在当前或正在前往的 location 上启动新
一轮；最终 navigation 提交时恢复 `idle`。官方测试同时验证 loading 期间旧 loader data 可读、location key
保持不变，以及已完成的 `fetcher.load` 可以重新读取。

### 2. 课程推导

因此应用应先依赖 Router 的自动正确性，再用业务依赖优化。action 返回清晰的 mutation scope，比在
`shouldRevalidate` 中猜测字段名更容易审查；loader 调用次数和 revision 则能把“好像更新了”变成可验证行为。

### 3. 使用边界

本课只讨论 Data Mode 客户端 loader 的公开行为。错误边界、鉴权刷新、乐观 UI、navigation 并发竞态、
自定义 Data Strategy、Framework Mode、SSR/RSC 与生产缓存失效需要分别设计，不能从本 Demo 外推。

## 十二、练习

:::exercise
### 练习目标

**要求：** 创建一个 Data Router 库存页：route loader 返回库存、revision 和调用次数；Fetcher mutation action
修改库存；`useRevalidator` 处理一次外部写入后的手动同步；另一个已执行 `fetcher.load` 的摘要同时显示自己的
revision 与调用次数。为 route 添加 `shouldRevalidate`，只在 action 明确返回与库存无关的偏好 scope 时返回
`false`，其余返回 `defaultShouldRevalidate`。

**验收：** 初始页面 loader 调用一次；库存 Fetcher 经历 `submitting -> loading -> idle`，navigation 与
revalidator 保持 `idle`，页面和已加载摘要各自动增加一次 loader 调用；偏好 action 完成后两个 loader 计数不变，
且判定显示 `default: true / final: false`；外部写入先只改变数据源 revision，手动 revalidation 再经历
`idle -> loading -> idle` 并同步页面与摘要；重置后若未执行摘要 `fetcher.load`，action 与手动 revalidation 都不
凭空调用摘要 loader。
:::

## 十三、本节小结

- Revalidation 重新调用 route loader，让当前页面数据与数据源同步。
- action 成功后已自动 revalidate；手动 API 面向 Router 外部变化。
- `useRevalidator` 只提供 `idle/loading`，不替代 navigation 或 Fetcher 状态。
- 加载期间保留旧 loader data，并明确显示正在同步。
- 活动 route loader 和已完成的 `fetcher.load` 使用不同默认触发条件。
- `shouldRevalidate` 只跳过可证明无关的变化，其余返回 `defaultShouldRevalidate`。
- 返回 `false` 可能挡住显式刷新，错误优化会制造 stale UI。
- 版本号、调用次数和状态轨迹是验证重验证行为的可靠证据。

## 十四、参考资料

- React Router 8.3.0 Release (https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 本课稳定版本与固定源码起点。
- npm react-router Latest Metadata (https://registry.npmjs.org/react-router/latest) - `latest` 稳定标签核验。
- useRevalidator API (https://reactrouter.com/8.3.0/api/hooks/useRevalidator) - 手动 revalidation 的用途、返回值与状态。
- Route Object shouldRevalidate (https://reactrouter.com/8.3.0/start/data/route-object#shouldRevalidate) - route 级默认判断与优化入口。
- ShouldRevalidate Args Source (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L376-L441) - 完整参数与安全回退建议。
- Revalidation Selection Source (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L5331-L5625) - 活动 route 与 Fetcher 的默认选择流程。
- Revalidate Implementation (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L1808-L1860) - 显式状态、取消与重新启动边界。
- Revalidation Tests (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/revalidate-test.ts#L15-L1135) - location、旧数据、状态与 Fetcher 重验证证据。
- Fetcher Tests (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/fetchers-test.ts#L2015-L2665) - fetcher.load 记录与 action 后重验证行为。
