# `useDeferredValue` 与陈旧内容研究记录

## 冻结知识点合同

- 核验日期：`2026-08-17`
- 研究范围：公开 API、可观察 UI 合同与选型边界
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react` `19.2.18`、`@types/react-dom` `19.2.4`
- 固定文档提交：`reactjs/react.dev@383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`

本文只回答一条主线：当调用方只能拿到 prop、自定义 Hook 返回值或其他不能直接控制 setter 的值时，
怎样让昂贵结果子树暂时读取旧值，并用明确文案表达 stale UI，同时让受控输入继续显示最新值。

必须覆盖：

1. `useDeferredValue(value, initialValue?)` 必须在组件或自定义 Hook 顶层调用，返回与 `value` 同类型的
   deferred 值。
2. 未传 `initialValue` 时，初次 render 没有旧值可用，返回传入的 `value`；传入时，初次 render 返回
   `initialValue`，React 再安排一次后台 render 尝试切到 `value`。该选项由 React 19 新增。
3. 后续收到与当前 deferred 值按 `Object.is` 比较不同的值时，React 先以旧 deferred 值完成当前 render，
   再在后台尝试用新值 render；相同值不需要启动这条更新路径。
4. 后台 render 可被新的紧急更新打断并从最新值重启，不会阻塞输入；它没有固定延迟，也不承诺固定
   render 次数、帧数或毫秒数。
5. 后台 render 的 Effect 在该 render 真正提交到屏幕前不会触发；若它挂起，则数据就绪且 UI 更新后
   才运行 Effect。
6. 与 Suspense 组合时，新的 deferred 值若使后台 render 挂起，已显示的旧内容保持可见，用户不会看到
   该次后台更新的 fallback；数据就绪后再尝试提交新内容。
7. `query !== deferredQuery` 只表示结果区当前展示的值落后于输入值，可用来表达 stale UI；它不是网络
   pending、Promise 状态、请求身份、缓存命中或完成信号。
8. 受控 input 必须继续使用最新 `query`；只有结果子树读取 `deferredQuery`。把 input 的 `value` 绑定到
   deferred 值会破坏“输入立即更新”的使用合同。
9. 若调用方拥有目标 State setter，可用 Transition 直接标记整个更新；若更新来自 prop
   或自定义 Hook 返回值，官方建议考虑 `useDeferredValue`。本文不重复 Action 或
   `isPending` 教学。
10. `useDeferredValue` 延迟的是 React 渲染结果，不会自行减少请求，也不是 debounce、throttle、timer、
    cache、abort 或请求竞态处理方案。
11. 传入值应是 primitive，或是在 render 外创建的稳定对象；render 中临时创建的新对象会因身份每次
    不同而造成不必要的后台 render。
12. 后续更新本身已处于 Transition 时，`useDeferredValue` 直接返回新值且不再创建 deferred render，
    因为该更新已经是非紧急更新。
13. React `v19.2.8` 的服务端实现在提供 `initialValue` 时输出该初值，官方 Fizz 测试验证水合后
    再追上最终值。这是当前固定 patch 的 SSR/水合边界，不将 Hook 扩展成服务端数据加载
    或通用 hydration 方案。

明确排除：固定毫秒 debounce/throttle、网络防抖、请求减少/去重/缓存/取消/竞态、真实 Router、
表单 Action、`useActionState`、`useOptimistic`、`useFormStatus`、Activity、RSC、Server Components、
Server Functions、服务端数据加载、完整 SSR/水合架构、受控 input 自身延迟、重复教授
`startTransition` / `useTransition` 及其 Action、错误边界新主线、内部 lane 名称、调度毫秒数、性能收益
保证和固定 render 次数。

## 调研方法与来源边界

1. 按仓库外部搜索顺位先使用 Tavily，并限定 `react.dev` 检索 `useDeferredValue`、Suspense stale content
   与 React 19 `initialValue`；结果足以定位官方页面，未切换 Exa、Parallel、Perplexity 或原生 Web 搜索。
2. 搜索只承担候选 URL 发现。结论逐项回到 React `19.2` Reference、固定
   `reactjs/react.dev` Markdown、固定 `facebook/react@v19.2.8` 源码/测试、精确版本的公开类型与
   本地安装产物；搜索摘要与第三方文章不承担事实证明。
3. 公共合同以 React 官方文档为准。固定 `ReactHooks.js` 与 `ReactFiberHooks.js` 只旁证当前 patch 的公开
   转发签名、初值分支、值身份比较、保留旧值和后台更新分支；内部 lane、Fiber 与调度器结构不进入本文
   的公共解释。
4. npm registry 核验 `react@19.2.8` 与 `react-dom@19.2.8` 的 `gitHead` 都是
   `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。`package.json`、`package-lock.json` 与
   `node_modules` 三层版本已逐项对齐。
5. 本研究只记录公开事实、可验证推导、明确不覆盖项和可观察 Demo 建议。

## 官方来源卡

| 编号 | 一手来源 | 版本固定 | 采用的事实 |
| --- | --- | --- | --- |
| S1 | [React `useDeferredValue`](https://react.dev/reference/react/useDeferredValue) | React 文档 `19.2` | API 参数与返回值、`Object.is`、初次/后续 render、可中断后台 render、Suspense、Effect、无固定延迟、网络与对象身份 caveat。 |
| S2 | [固定 `useDeferredValue` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useDeferredValue.md) | 文档提交 `383a1e9239c8...` | 固定公共文字、两阶段心智模型、stale 指示、input/结果分离及 debounce/throttle 边界。 |
| S3 | [React `startTransition`](https://react.dev/reference/react/startTransition) | React 文档 `19.2` | 有 setter 时直接标记更新；只有 prop 或自定义 Hook 值时考虑 `useDeferredValue`。 |
| S4 | [React `Suspense`](https://react.dev/reference/react/Suspense) | React 文档 `19.2` | 已显示内容再次挂起时，`useDeferredValue` 可避免该次更新重新显示 fallback。 |
| S5 | [React 19 发布说明](https://react.dev/blog/2024/12/05/react-19#use-deferred-value-initial-value) | React `19` stable | `initialValue` 选项由 React 19 新增；初次返回初值并安排后台 render 切到真实值。 |
| S6 | [固定 React 19 发布说明](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/blog/2024/12/05/react-19.md#use-deferred-value-initial-value) | 文档提交 `383a1e9239c8...` | 固定 `initialValue` 的引入版本与初次 render 语义。 |
| S7 | [React `v19.2.8` `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L178-L180) | React `v19.2.8` | 公共入口接收 `value, initialValue?` 并返回同一泛型 `T`。 |
| S8 | [React `v19.2.8` `ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2963-L3082) | React `v19.2.8` | 当前 patch 的初值后台分支、`Object.is` 身份比较、旧值复用和新值提交实现旁证。 |
| S9 | [React `v19.2.8` `ReactDeferredValue-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactDeferredValue-test.js) | React `v19.2.8` | 新对象触发额外后台 render、紧急更新与 Transition 的差异、`initialValue` 初次序列及 Transition 内初次挂载例外。 |
| S10 | [React `v19.2.8` `ReactFizzHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-server/src/ReactFizzHooks.js#L567-L570) | React `v19.2.8` | 服务端在提供 `initialValue` 时返回初值，否则返回 `value`。 |
| S11 | [React `v19.2.8` `ReactDOMFizzDeferredValue-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFizzDeferredValue-test.js#L77-L91) | React DOM `v19.2.8` | 服务端输出 `initialValue`，水合后追上最终值的当前版本旁证。 |
| S12 | [`@types/react@19.2.18` 发布文件](https://unpkg.com/@types/react@19.2.18/index.d.ts) | npm 类型包 `19.2.18` | `useDeferredValue<T>(value: T, initialValue?: T): T` 的公开 TypeScript 形状。 |
| S13 | [React `v19.2.8` npm 元数据](https://registry.npmjs.org/react/19.2.8) | npm 发布 `19.2.8` | `gitHead` 与固定运行时提交对齐。 |
| S14 | [React DOM `v19.2.8` npm 元数据](https://registry.npmjs.org/react-dom/19.2.8) | npm 发布 `19.2.8` | React DOM patch 与 React 使用相同 `gitHead`。 |
| S15 | [React `v19.2.8` release](https://github.com/facebook/react/releases/tag/v19.2.8) | 发布 tag `v19.2.8` | 当前运行时 patch 发布身份；不得声称本 Hook 或 `initialValue` 由该 patch 新增。 |

## 版本与类型基线

### 文档 minor 与本地 patch

React 官网按 `19.2` minor 维护 Reference，没有独立 `19.2.8` 文档站。本文用 S1-S6 冻结公共 API 与
`initialValue` 的引入版本，只用 S7-S11 解释当前 patch 的实现与测试旁证。本地依赖三层结果为：

| 包 | `package.json` | lock | install |
| --- | --- | --- | --- |
| `react` | `19.2.8` | `19.2.8` | `19.2.8` |
| `react-dom` | `19.2.8` | `19.2.8` | `19.2.8` |
| `@types/react` | `19.2.18` | `19.2.18` | `19.2.18` |
| `@types/react-dom` | `19.2.4` | `19.2.4` | `19.2.4` |
### 当前公开类型形状

`@types/react@19.2.18` 与 React `v19.2.8` 公共入口都把返回值保持为输入泛型 `T`：

```tsx
const deferredQuery = useDeferredValue(query)
const deferredWithInitial = useDeferredValue(query, '')
```

对应类型为：

```tsx
useDeferredValue<T>(value: T, initialValue?: T): T
```

`initialValue` 必须与 `value` 使用同一个 `T`，不会产生 Promise、pending boolean 或 setter。当前
`v19.2.8` 实现以 `initialValue !== undefined` 判断是否进入初值分支。示例应使用明确的同类型字符串
初值，不把显式传 `undefined` 的实现细节扩展成公共合同。

### `initialValue` 的版本结论

React 19 官方发布说明明确将 `initialValue` 标为新增选项（S5、S6）。因此需要区分：

- `useDeferredValue(value)` 的核心能力不是 React 19.2.8 新增；
- 第二参数 `initialValue` 是 React 19 新增；
- 本地 React `19.2.8` 和类型 `19.2.18` 都已包含该参数；
- 不能把当前 patch 号当作该选项的引入版本。

## 官方事实与推导

### 1. Hook 返回同类型 deferred 值

`useDeferredValue` 在组件或自定义 Hook 顶层接收任意类型 `value`，返回同类型 current value（S1、S2、
S7、S12）。它没有返回数组，也不提供 `isPending` 或 start 函数：

```tsx
const deferredQuery = useDeferredValue(query)
```

所以反馈信号来自当前值与 deferred 值的关系，而不是 `isPending`。示例应始终使用
`query` 表示最新输入、`deferredQuery` 表示结果子树当前读取值，避免把二者都命名为 loading 状态。

### 2. 初次 render 的两种精确语义

未传 `initialValue` 时，初次 render 返回原始 `value`，因为没有旧版本可以展示（S1、S2）。传入
`initialValue` 时，初次 render 返回该初值，并安排后台 render 尝试切到真实 `value`（S1、S2、S5、
S6）。当前源码分别把初值写入 Hook 状态并安排 deferred work，随后用真实值完成更新（S8）。

```text
未传 initialValue：initial render -> value
传入 initialValue：initial render -> initialValue -> background render -> value
```

`initialValue` 只控制首次 render，不是每次输入变化时的 fallback，也不会在后续更新中替代“上一个已
提交 deferred 值”。即使这次初始挂载发生在 Transition 中，提供 `initialValue` 仍先显示初值（S9）；
“Transition 中不再 defer”的 caveat 针对后续更新。确定性 Demo 不依赖第二参数制造可见等待；最小
静态示例只说明其 React 19 版本与初次语义，避免与更新期 stale 内容混为一谈。

### 3. 后续更新先旧值，再后台尝试新值

当 `value` 与当前 deferred 值按 `Object.is` 比较不同时，React 先在当前 render 继续返回旧值，再安排
后台 render 使用新值（S1、S2）。固定源码先比较身份；紧急更新分支保留 `prevValue` 并安排 deferred
work，非紧急后台分支才写入新值（S8）。

```text
query:         "react" -> "react hooks"
deferredQuery: "react" -> "react" -> "react hooks"
结果区：       旧结果保持可见 -> 新结果提交后追上
```

该序列不是延迟 `onChange`。事件中的 `setQuery` 仍立即安排输入 State 更新，延迟的是读取
`deferredQuery` 的结果子树。若新值按 `Object.is` 与当前值相同，不应声称 React 必定再产生一次后台
render。

### 4. 后台 render 可中断、可重启且没有固定延迟

官方说明后台 render 可被新的值更新打断，并从最新值重新开始；React 总以最新传入值为目标（S1、S2）。
React 完成原始 render 后会立即开始后台工作，但输入等事件更新可以中断它并获得优先处理。API 自身没有
固定延迟（S1、S2）。

因此只能断言：输入值先保持最新、旧结果在追赶期间可见、最终结果追上最新输入。不能断言后台
render 必须晚一帧、等待某个毫秒数、发生固定次数或每次都肉眼可见。快设备上追赶可能几乎立即完成，
这不是 API 失效。

### 5. Effect 只属于已提交的后台结果

`useDeferredValue` 触发的后台 render 在提交屏幕前不会触发 Effect；若 render 挂起，Effect 要等数据就绪
且 UI 更新后运行（S1、S2）。这使“render 尝试”和“用户已看到新结果”必须分开：

```text
后台尝试读取新 query -> 可能被打断或挂起 -> 不记录新结果 Effect
新 query 成功提交到 DOM -> 对应 Effect 才运行
```

Demo 可让结果子树的 Effect 记录“最近已提交 query”，但不能在 render 中写日志或副作用，也不能
把 Promise resolve、gate 已推进或后台尝试开始当成 DOM 已提交。

### 6. Suspense 保留旧内容，不重新闪回 fallback

`useDeferredValue` 与 Suspense 集成：新值导致的后台 render 若挂起，用户继续看到旧 deferred 值对应的
内容，而不是这次后台更新的 fallback；数据就绪后 React 再重试新内容（S1、S2、S4）。

Demo 只借助最近 Suspense 边界与显式本地 gate 建立以下观察窗口：

```text
旧结果已显示
  -> 输入立即变为新 query
  -> 后台结果读取新 deferredQuery 并挂起
  -> 旧结果与 stale 标记保持可见
  -> 用户推进本地 gate
  -> 新结果提交，stale 标记消失
```

Suspense 只是提供稳定的观察窗口，不成为第二教学主线。本文不展开激活边界、Promise cache、错误
传播、fallback 设计或数据框架集成。

### 7. stale 指示只表达 UI 值不一致

官方示例用 `query !== deferredQuery` 判断结果列表是否落后，并在落后时给出视觉提示（S1、S2）。Demo
应提供明确文本和可访问状态，而不是只改变透明度：

```tsx
const isStale = query !== deferredQuery

<input value={query} onChange={(event) => setQuery(event.target.value)} />
<p role="status">{isStale ? '结果正在追上最新输入' : '结果已同步'}</p>
<Results query={deferredQuery} />
```

这个 boolean 只比较两个 UI 值。它不能证明请求在途、资源未命中、某个 Promise pending、网络已完成或
结果已持久化。Demo 没有网络，因此 stale 状态可以被干净地验证为“显示值落后”，不是“请求状态”。

### 8. input 用最新值，结果子树用 deferred 值

官方示例始终让 `<input value={query}>` 使用最新 State，只把 `deferredQuery` 传给结果子树（S1、S2）。
性能章节也说明这种分离让输入优先、列表随后追上；它不会让慢列表本身变快（S1、S2）。

错误形状：

```tsx
<input value={deferredQuery} onChange={(event) => setQuery(event.target.value)} />
```

正确形状：

```tsx
<input value={query} onChange={(event) => setQuery(event.target.value)} />
<Results query={deferredQuery} />
```

如果只做 CPU render 优化，慢子树必须能在旧 prop 不变时跳过 render，例如使用 `memo`；否则父组件
更新仍会让慢子树以旧 prop 再 render 一次，无法得到官方优化示例的响应性效果（S1、S2）。本文 Demo
使用 Suspense gate 建立确定性观察，不靠忙循环、性能时钟或设备速度证明收益，也不把 `memo` 变成第二
知识点。

### 9. 与 Transition 的选择边界

`startTransition` / `useTransition` 只有在调用方能访问目标 State setter 时才能直接标记更新；对 prop 或
自定义 Hook 返回值，官方建议尝试 `useDeferredValue`（S3）。Suspense 文档也区分两者：Transition
通常标记整个更新，deferred value 适合让 UI 的一部分落后（S4）。

本文聚焦“最新 query 已由上游产生，当前组件只决定哪个子树可落后”。不要再创建第二份结果 State、
Action、`isPending` 或 Router 导航。若后续更新已在 Transition 内，官方说明
`useDeferredValue` 直接返回新值，不再启动 deferred render（S1、S2、S8、S9）；这不改变初次挂载时
显式 `initialValue` 的行为。

### 10. 不是 debounce、throttle 或网络优化

官方明确说明 `useDeferredValue` 自身不会阻止额外网络请求；搜索示例仍可能每次键击产生请求，延迟的是
结果显示（S1、S2）。它也没有 debounce/throttle 的固定时间窗口，而是让 render 工作可中断并适应设备
速度；若目标是减少非 render 工作或网络请求，debounce/throttle 仍有独立用途（S1、S2）。

所以不能作出以下结论：

- “输入停止 300ms 后才更新”；
- “只会发送最后一次请求”；
- “自动取消旧请求或解决竞态”；
- “一定减少 render 次数或提升指定百分比”；
- “stale 结束就代表网络或业务提交完成”。

### 11. 对象身份必须稳定

官方要求传入 primitive，或传入在 render 外创建的对象。render 中立即创建对象会在每次 render 得到新
身份，从而造成不必要的后台 render（S1、S2）：

```tsx
const deferredFilter = useDeferredValue({ query })
```

上例即使 `query` 文本未变，对象身份仍不同。Demo 只传 primitive string。对象例子作为 pitfall，
不引入 `useMemo` 分支；若业务确需对象，应先按应用数据所有权建立稳定身份。

### 12. 错误与边界只保留已有官方合同

`useDeferredValue` Reference 没有给出一个独立的错误状态或错误返回值。本文不声称它捕获错误、重试
失败、吞掉 Promise rejection 或提供错误身份。确定性 Demo 的 gate 只有 pending/resolve，不提供 reject；
错误传播与 Error Boundary 不在本文扩写。

### 13. SSR 只保留 `initialValue` 的最小边界

公共层面仍只教授 `initialValue` 的初次 render 合同。当前 React `v19.2.8` 的 Fizz 实现在服务端返回
`initialValue !== undefined ? initialValue : value`（S10）；官方 React DOM 测试旁证服务端先输出初值，
水合后再追上最终值（S11）。这只说明固定版本下的可观察初值序列，不扩写为服务端数据加载、增量水合、
Fizz 调度或通用 SSR 架构合同。

## 知识边界

- Suspense 只支撑“后台 render 挂起时保留旧内容”的观察，不展开 fallback/reveal、资源 cache 或边界拆分。
- 本地 gate 只提供确定性挂起窗口，不教授 `use(promise)`、远程资源或错误三路分流。
- Transition 只用于 API 选型对比，不展开 Action、`isPending` 或 Router 导航。
- Activity、表单 Action、external store、完整 hydration 和资源 API 不进入本文。

## 确定性 SPA Demo 建议

### 资产与职责

建议使用两份运行资产和一份样式资产：

- 主 TSX：最新输入 State、`useDeferredValue`、stale 文案、结果边界、显式推进按钮、已提交 query 记录、
  重建按钮和预置本地数据。
- gate TS：导出按实验实例创建的最小结果资源；每个 query 可读取、挂起或显式 resolve，不包含模块级
  cache、网络、timer、随机数、日期、性能时钟、retry、reject 或取消逻辑。
- CSS：只定义 Demo 布局和 stale 状态；使用 Flexbox、margin 与正常文档流，不依赖颜色单独传达状态。

Demo 源码展示应覆盖实际运行的 TSX、gate TS 和 CSS，不能隐藏真正抛出本地 thenable 的 gate 实现。

### 可观察状态机

冷状态使用已就绪 query `react`，输入、deferred 值和结果一致：

```text
cold: query=react, deferredQuery=react, result=react, stale=false
input: query=hooks, deferredQuery=react, result=react, stale=true
gate:  用户推进 hooks 的本地结果
commit: query=hooks, deferredQuery=hooks, result=hooks, stale=false
```

页面至少公开：输入 DOM value、最新 `query`、结果区实际 `deferredQuery`、明确 stale/同步文案、当前结果
标题、最近一次 Effect 已提交 query 和 gate 推进按钮。交互固定为：

1. 冷启动显示 `react` 输入与 `react` 结果，状态为“结果已同步”；初始资源已就绪，Suspense fallback
   不闪现。
2. 输入 `hooks` 后，input DOM value 和最新 query 立即变为 `hooks`；结果区仍明确显示 `react`，状态变为
   “结果正在追上最新输入”。
3. 后台 render 尝试读取 `hooks` 时由本地 resource 挂起；已经显示的 `react` 结果保持可见，不切换到
   fallback，也不提前记录 `hooks` Effect commit。
4. 点击“推进 hooks 结果”只 resolve 当前 query 的本地 gate。新结果真正提交 DOM 后，
   `deferredQuery`、结果标题和 Effect 提交记录都变为 `hooks`，stale 文案消失。
5. 在 stale 期间继续输入另一个值时，最新 query 立即变化，后台目标重启到最新值；旧结果保持可见。
   不固定中间 render 次数，也不要求被放弃 query 最终提交。
6. 推进按钮根据最新 query 释放对应 gate；若后台尝试尚未创建 gate，resource 将该 query 标为已就绪，
   后续读取直接完成，避免依赖点击与调度的竞速顺序。
7. 点击“重建实验”通过组件 key 创建全新实验实例，输入、resource、结果、stale 和提交记录全部恢复冷
   状态。SPA 离页再返回也必须得到同一冷状态，不能复用模块级数据。

### 确定性限制

- 不使用 `fetch`、XHR、WebSocket、外部 URL、service worker、timer、RAF、随机数、日期、性能时钟、
  CPU 忙循环或浏览器节流。
- 本地 gate 在实验实例创建，显式 resolve；不在 render 中新建 Promise，不依赖模块级 cache，不提供
  reject、超时、取消、重试、请求身份或远程语义。
- input 始终绑定最新 `query`，结果子树只读取 `deferredQuery`；不得建立手工第二份 deferred State。
- stale 状态只由 `query !== deferredQuery` 得到，不由自建 loading boolean、Promise 状态或 gate 状态
  冒充。
- Suspense 仅用来稳定保留旧内容；不展示真实网络、不教授 `use(promise)`、错误分支或框架数据 cache。
- 不使用 `startTransition`、`useTransition`、Activity、Router、表单、Action Hooks 或第三方状态/数据包。
- 不断言固定延迟、固定 render/Effect 次数、特定中断次数、性能阈值或请求次数变化。
- CSS 禁止 Grid、`gap` 与非零 `letter-spacing`，390px 与 32px 根字号下长 token 必须正常换行。

## 易错点

### 1. 把 deferred 值绑定回受控 input

- **错误名称：** 用 deferred 值控制需要立即回显的输入框。
- **触发条件：** 同一组件同时持有 `query` 和 `deferredQuery`，并希望所有位置都读取 deferred 值。
- **原因：** deferred 值可以落后，而受控 input 必须及时反映最新 State。
- **后果：** 输入文字和光标反馈滞后，无法建立“输入最新、结果可落后”的职责分离。
- **错误示例：** `<input value={deferredQuery} onChange={handleChange} />`。
- **正确示例：** `<input value={query} onChange={handleChange} />`，结果子树读取 `deferredQuery`。
- **适用版本：** React 19.2。
- **来源：** S1、S2。

### 2. 把 stale 冒充网络或业务 pending

- **错误名称：** 用 `query !== deferredQuery` 宣称请求仍在途或业务尚未完成。
- **触发条件：** 结果区需要加载文案，但应用没有读取真实的请求或提交状态。
- **原因：** 该比较只说明两个 UI 值暂时不一致，不包含 Promise、缓存、请求或服务端身份。
- **后果：** 请求已经完成时仍可能显示 pending，或请求失败时误报为 UI 已同步。
- **错误示例：** `const isRequestPending = query !== deferredQuery`。
- **正确示例：** 将其命名为 `isStale` 并只显示“结果正在追上最新输入”；网络状态由数据层提供。
- **适用版本：** React 19.2。
- **来源：** S1、S2。

### 3. 在 render 中创建对象或数组

- **错误名称：** 每次 render 都把新对象身份传给 `useDeferredValue`。
- **触发条件：** 直接调用 `useDeferredValue({ query })` 或 `useDeferredValue([query])`。
- **原因：** React 使用 `Object.is` 比较值；内容相同的新对象或数组仍是不同身份。
- **后果：** React 启动不必要的后台 render，失去 primitive 或稳定对象带来的可预测性。
- **错误示例：** `const deferredFilter = useDeferredValue({ query })`。
- **正确示例：** 直接传 `query`；确需对象时，在 render 外建立符合数据所有权的稳定身份。
- **适用版本：** React 19.2；额外后台 render 由 React `v19.2.8` 测试旁证。
- **来源：** S1、S2、S8、S9。

### 4. 假设存在固定等待时间

- **错误名称：** 把 deferred 更新描述为固定毫秒延迟。
- **触发条件：** 为演示或测试写出“等待 300ms 后结果一定更新”。
- **原因：** React 会立即尝试后台 render，并允许紧急更新中断；API 没有时间窗口参数或时长保证。
- **后果：** 文档误导，测试随设备速度和调度时机波动。
- **错误示例：** `await wait(300)` 后断言 `deferredQuery === query`。
- **正确示例：** 断言输入先更新、旧内容可保持、最终结果追上，不断言毫秒、帧数或 render 次数。
- **适用版本：** React 19.2。
- **来源：** S1、S2。

### 5. 当作 debounce、throttle、缓存或请求控制

- **错误名称：** 认为 Hook 会减少、缓存、取消请求，或只处理最后一次输入。
- **触发条件：** 每次键击触发外部工作，却只加入 `useDeferredValue` 作为网络优化。
- **原因：** Hook 延后的是 React 结果渲染，不控制事件频率、请求生命周期或数据缓存。
- **后果：** 请求数量不变，旧响应仍可能覆盖新响应，应用也没有获得取消或去重能力。
- **错误示例：** 对 `deferredQuery` 的存在作出“旧请求已取消”的结论。
- **正确示例：** 用独立的 debounce/throttle、缓存、请求身份或取消协议解决对应问题。
- **适用版本：** React 19.2。
- **来源：** S1、S2。

### 6. 慢子树没有配合 `memo`

- **错误名称：** 只加入 `useDeferredValue` 就期待 CPU 密集子树跳过旧 prop render。
- **触发条件：** 父组件随输入更新，慢结果组件收到尚未变化的 deferred prop，但组件没有 memoization。
- **原因：** 父组件重新 render 默认仍会递归 render 子组件；旧 prop 不变本身不会自动跳过函数组件。
- **后果：** 输入更新仍被慢子树阻塞，误判 Hook 无效或虚构性能收益。
- **错误示例：** `function SlowList({ query }) { /* 昂贵 render */ }` 直接作为普通子组件使用。
- **正确示例：** 经测量确认 CPU render 是瓶颈后，对旧 prop 可复用的慢子树使用 `memo`。
- **适用版本：** React 19.2。
- **来源：** S1、S2。

### 7. 在 Transition 更新中期待再次 defer

- **错误名称：** 认为任何调用 `useDeferredValue` 的更新都会先保留旧值。
- **触发条件：** 来源 State 已在 Transition 中更新，仍断言 deferred 值必须落后一次。
- **原因：** 后续更新已是非紧急更新时，React 直接采用新值，不再安排另一条 deferred render。
- **后果：** stale 文案或测试等待一个不会出现的中间状态。
- **错误示例：** `startTransition(() => setQuery('hooks'))` 后断言 `deferredQuery === 'react'`。
- **正确示例：** 普通更新来源值、只让结果子树读取 deferred 值；或直接使用 Transition 管理整体更新。
- **适用版本：** React 19.2；不包含初次挂载时显式 `initialValue` 的例外。
- **来源：** S1、S2、S8、S9。

### 8. 把 `initialValue` 当成更新期 fallback

- **错误名称：** 认为每次 `value` 变化都会先重新返回 `initialValue`。
- **触发条件：** 使用 `useDeferredValue(query, '')`，并把空字符串当作所有更新的等待值。
- **原因：** 第二参数只用于初次 render；后续更新保留的是上一个已提交 deferred 值。
- **后果：** 错误设计闪空 UI，或写出永远等不到初值重新出现的断言。
- **错误示例：** 输入变化后断言 `deferredQuery === ''`。
- **正确示例：** 只用初值解释首次显示；更新期比较最新 `query` 与上一个 `deferredQuery`。
- **适用版本：** React 19 及 19.2；第二参数由 React 19 新增。
- **来源：** S1、S2、S5、S6、S8、S9。

### 9. 把资源就绪或后台尝试当作 DOM commit

- **错误名称：** Promise resolve 或后台 render 开始后立即宣称新结果已经显示。
- **触发条件：** Demo 推进本地 gate，或在 render 尝试阶段记录“已同步”。
- **原因：** 资源就绪只允许 React 继续尝试；后台 render 仍可能被中断，且对应 Effect 要到提交后才运行。
- **后果：** 日志、状态文字和真实 DOM 不一致，无法证明用户已看到新结果。
- **错误示例：** `resolveResult(); setLabel('结果已同步')`。
- **正确示例：** 等 `deferredQuery`、结果 DOM、stale 文案与提交后的 Effect 记录共同追上。
- **适用版本：** React 19.2。
- **来源：** S1、S2。

## 事实与 Demo 观察矩阵

| 合同 | 官方依据 | 研究结论 | Demo 可观察结果 |
| --- | --- | --- | --- |
| API 与类型 | S1、S2、S7、S12 | `useDeferredValue<T>(value, initialValue?): T` | 示例与源码使用同类型值，不伪造 pending/start 返回值。 |
| 初次 render | S1、S2、S5、S6、S8、S9 | 无初值返回 `value`；有初值先返回 `initialValue`，React 19 新增 | 不用初值伪造更新期等待。 |
| 更新两阶段 | S1、S2、S8、S9 | 按 `Object.is` 变化时先旧值、再后台新值 | 输入最新，结果旧值保持，推进后追上。 |
| 可中断与无固定延迟 | S1、S2 | 新更新可重启后台工作，没有时间常数 | 连续输入最终只要求最新值提交，不断言次数/毫秒。 |
| Effect 提交边界 | S1、S2 | 后台 render 提交前不触发其 Effect | gate resolve 后等 DOM 和 commit 记录一起更新。 |
| Suspense stale content | S1、S2、S4 | 后台挂起保留旧内容，不显示该次 fallback | 旧结果可见，显式推进后新结果出现。 |
| stale 指示 | S1、S2 | `query !== deferredQuery` 只表达 UI 落后 | 明确文字/状态区域，不只靠颜色，不称网络 pending。 |
| input/结果分离 | S1、S2 | input 用最新值，结果用 deferred 值 | DOM input 立即更新，结果区暂时保持旧 query。 |
| Transition 边界 | S1、S2、S3、S4、S8、S9 | 有 setter 用 Transition；prop/Hook 值考虑 deferred；非紧急更新不重复 defer | 不含 start/useTransition、Action 或 Router。 |
| 网络与 debounce 边界 | S1、S2 | 不减少请求、无 debounce/throttle 固定窗口 | 业务 fetch/XHR/WebSocket 为零，无 timer/cache/abort。 |
| 对象身份 | S1、S2、S8 | primitive 或 render 外稳定对象 | Demo 只传 string；pitfall 明确拒绝 render 内新对象。 |
| CPU 慢子树 | S1、S2 | 旧 prop 不变时需可跳过 render，常见方式是 `memo` | 不声称 Hook 缩短计算；如演示 CPU 瓶颈，先测量并配合 memoization。 |
| SSR 初值 | S10、S11 | 当前 Fizz 输出初值，水合后追上最终值 | 只写版本固定边界，不扩写服务端数据或水合架构。 |
| 冷状态 | Demo 确定性约束 | 实验资源按实例创建 | 重建与 SPA 离页返回都恢复 `react` 同步状态。 |

## 不覆盖项

- 不把 input 的 `value` 绑定 deferred 值，不建立第二份手工延迟 State。
- 不使用 debounce、throttle、timer、RAF、性能时钟、固定毫秒或 CPU 忙循环制造陈旧状态。
- 不把网络、缓存、请求去重、取消、retry 或竞态协议归入 `useDeferredValue` 的职责。
- 不引入 Router、导航 loader、RSC、Server Components、Server Functions 或远程数据框架；SSR 只保留
  固定版本下 `initialValue` 的服务端输出与水合追赶旁证。
- 不重复教授 `startTransition`、`useTransition`、Action Hooks 或 Activity，只保留 API 选型边界。
- 不把 Suspense 变成第二主线，不新增错误/恢复分支，不声称 `useDeferredValue` 处理错误。
- 不公开或断言内部 lane、Fiber、Fizz 调度、固定 render/Effect 次数或普遍性能收益。

## 参考资料

- [React `useDeferredValue`](https://react.dev/reference/react/useDeferredValue) - API、初次/更新 render、
  `Object.is`、Suspense、Effect、无固定延迟、网络与对象身份 caveat。
- [固定 React `useDeferredValue` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useDeferredValue.md) -
  该知识点公共事实、stale 指示、input/结果分离和 debounce/throttle 边界的固定官方文本。
- [React `startTransition`](https://react.dev/reference/react/startTransition) - 有 setter 与 prop/custom Hook
  返回值的 API 选择边界。
- [React `Suspense`](https://react.dev/reference/react/Suspense) - 已显示内容在 deferred 更新挂起时不重新
  显示 fallback。
- [React 19 发布说明](https://react.dev/blog/2024/12/05/react-19#use-deferred-value-initial-value) -
  `initialValue` 由 React 19 新增及其初次 render 语义。
- [固定 React 19 发布说明](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/blog/2024/12/05/react-19.md#use-deferred-value-initial-value) -
  `initialValue` 版本结论的固定官方文本。
- [React `v19.2.8` `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L178-L180) -
  公共入口的泛型签名实现。
- [React `v19.2.8` `ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2963-L3082) -
  初值、身份比较、旧值复用和后台更新的当前 patch 实现旁证。
- [React `v19.2.8` `ReactDeferredValue-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactDeferredValue-test.js) -
  新对象、Transition 更新、`initialValue` 与初次 Transition 挂载的官方测试旁证。
- [React `v19.2.8` `ReactFizzHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-server/src/ReactFizzHooks.js#L567-L570) -
  服务端选择 `initialValue` 或 `value` 的当前 patch 实现旁证。
- [React `v19.2.8` `ReactDOMFizzDeferredValue-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFizzDeferredValue-test.js#L77-L91) -
  服务端初值输出与水合后追上最终值的官方测试旁证。
- [`@types/react@19.2.18` 发布文件](https://unpkg.com/@types/react@19.2.18/index.d.ts) - 泛型输入、可选
  初值与同类型返回值；已与本地安装声明核对。
- [React `v19.2.8` npm 元数据](https://registry.npmjs.org/react/19.2.8) - 本地运行时 patch 与固定 commit
  的对应关系。
- [React DOM `v19.2.8` npm 元数据](https://registry.npmjs.org/react-dom/19.2.8) - React DOM patch 与
  React 固定 commit 的对应关系。
- [React `v19.2.8` release](https://github.com/facebook/react/releases/tag/v19.2.8) - 当前运行时 patch
  发布身份。
