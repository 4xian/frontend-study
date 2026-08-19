# React `use` 读取资源官方调研

## 调研范围

本文只讨论 React `use(resource)` 的两类本科公共输入：Context 与 Promise。结论限定在以下版本：

- React 官方文档：`19.2`；
- 固定文档源码：`reactjs/react.dev@383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`；
- React / React DOM：`19.2.8`，tag 对应提交
  `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`；
- TypeScript 类型：`@types/react@19.2.18`。

覆盖内容：`use(context)`、`use(promise)`、条件与循环调用例外、组件或 Hook 调用边界、Context 的最近
provider / `defaultValue` / 更新、Promise 的 pending / fulfilled / rejected、Client 端 cached Promise
身份、Suspense、Error Boundary、`try/catch` 限制，以及 TypeScript `Usable<T>` / `Context<T>`。

明确排除：React Server Components、SSR、streaming、Selective Hydration、远程数据框架、完整缓存与失效
架构、预加载策略、请求瀑布、Transition、deferred value，以及 Fiber、lane、work loop 等内部细节。源码
只用来校准当前 patch 的输入分派、状态分支和错误文本，不把内部字段或控制流提升为公开 API。

## 官方来源

| 编号 | 一手来源 | 固定版本 | 采用事实 |
| --- | --- | --- | --- |
| S1 | [React `use`](https://react.dev/reference/react/use) | React 文档 `19.2` | Context 与 Promise 两类读取、调用位置、Promise 三态、缓存、边界与 `try/catch` 限制。 |
| S2 | [固定 `use` 文档源码](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/use.md#L21-L78) | `react.dev@383a1e9` | 固定 S1 的公开合同；另见同文件的 Client cache、错误边界与 troubleshooting 章节。 |
| S3 | [React `createContext`](https://react.dev/reference/react/createContext) | React 文档 `19.2` | `defaultValue` 是静态最后后备值；React 19 provider 写法与 `value`。 |
| S4 | [固定 `createContext` 文档源码](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/createContext.md#L23-L75) | `react.dev@383a1e9` | 固定默认值、provider 与最近内层值合同。 |
| S5 | [React `useContext`](https://react.dev/reference/react/useContext) | React 文档 `19.2` | 最近上层 provider、更新订阅、`Object.is`、同组件 provider 与 `undefined` 边界。 |
| S6 | [固定 `useContext` 文档源码](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useContext.md#L35-L47) | `react.dev@383a1e9` | 固定 Context 返回值与更新规则；troubleshooting 位于同文件 1348 行后。 |
| S7 | [Rules of Hooks lint](https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks) | React 文档 `19.2` | `use` 可在条件和循环中调用，但仍须位于组件或 Hook 内且不能被 `try/catch` 包围。 |
| S8 | [固定 Rules of Hooks 源码](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/eslint-plugin-react-hooks/lints/rules-of-hooks.md#L29-L49) | `react.dev@383a1e9` | 固定 `use` 的规则例外与保留限制。 |
| S9 | [React Suspense](https://react.dev/reference/react/Suspense) | React 文档 `19.2` | `use` 读取 cached Promise 是 Suspense 激活源，最近边界显示 fallback。 |
| S10 | [React `Component` Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) | React 文档 `19.2` | 后代渲染失败的 fallback；普通事件与任意异步 callback 错误不属于其一般捕获范围。 |
| S11 | [React error `460`](https://react.dev/errors/460) | React `19.2` 错误表 | 捕获 `use` 的内部挂起信号会导致不可预期行为。 |
| S12 | [React 19 `use` 发布说明](https://react.dev/blog/2024/12/05/react-19#new-feature-use) | React `19` | `use` 的公开身份与 Client render 内 uncached Promise 警告原文。 |
| S13 | [`ReactHooks.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactHooks.js#L27-L41) | React `v19.2.8` | 无有效 dispatcher 时的 `Invalid hook call`；公开 `use` 位于同文件 207 行。 |
| S14 | [`ReactFiberHooks.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L1151-L1165) | React `v19.2.8` | 当前 renderer 把 thenable 与 Context 分派到不同读取路径，并拒绝其他输入。 |
| S15 | [`ReactFiberThenable.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberThenable.js#L107-L156) | React `v19.2.8` | thenable 身份跟踪、uncached Promise 警告；三态分支位于同文件 187 行后。 |
| S16 | [`ReactTypes.js`](https://github.com/facebook/react/blob/v19.2.8/packages/shared/ReactTypes.js#L97-L145) | React `v19.2.8` | 运行时源码中的 `Thenable<T> | ReactContext<T>` 公共输入形状。 |
| S17 | [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts) | npm 精确版本 `19.2.18` | `Context<T>`、`ReactPromise<T>`、`Usable<T>` 与 `use<T>` 的 TypeScript 声明。 |

## `use(resource)` 的统一入口

`use` 在 render 中读取一个 resource，并返回 resource 当前表示的值。React 19.2 的公开文档列出两种
本科范围输入：

```tsx
const access = use(AccessContext)
const report = use(reportPromise)
```

两者共享同一个函数名，但行为不同：

| 输入 | 立即结果 | 后续更新或等待 |
| --- | --- | --- |
| `Context<T>` | 返回当前组件上方最近 provider 的 `value`，没有 provider 时返回 `defaultValue` | provider 收到 `Object.is` 判定不同的新值时，读取该 Context 的后代会获得最新值 |
| `Promise<T>` / thenable | fulfilled 时返回值，rejected 时抛出原因 | pending 时挂起当前 render，由最近 Suspense 表达等待 |

React `v19.2.8` 的当前 renderer 先判断对象是否有 `then` 函数，再判断是否为 React Context；其他输入
会抛出 `An unsupported type was passed to use(): ...`（S14）。这是当前 patch 的输入分派证据，不要求
学习者理解 reconciler 内部实现。

## Context 读取合同

### 最近上层 provider 与默认值

`use(SomeContext)` 从调用组件的位置向上查找最近匹配 provider。嵌套 provider 会覆盖外层 provider，
中间经过多少普通组件都不改变查找结果（S1-S6）：

```tsx
const AccessContext = createContext('访客')

function AccessLabel() {
  const access = use(AccessContext)
  return <span>{access}</span>
}

<AccessContext value="编辑者">
  <AccessLabel />
  <AccessContext value="审阅者">
    <AccessLabel />
  </AccessContext>
</AccessContext>
```

两个 `AccessLabel` 分别读取“编辑者”和“审阅者”。如果组件上方完全没有匹配 provider，则读取
`createContext('访客')` 的“访客”。`defaultValue` 是静态的最后后备值，不会随 State 自动变化（S3-S6）。

调用组件自己返回的 provider 不在该次读取的上方，因此不会影响同一组件中的 `use`：

```tsx
function WrongPlacement() {
  const access = use(AccessContext)
  return <AccessContext value="编辑者">{access}</AccessContext>
}
```

正确结构是让 provider 位于 reader 的父级：

```tsx
function AccessSection() {
  return (
    <AccessContext value="编辑者">
      <AccessLabel />
    </AccessContext>
  )
}
```

### provider 更新

Context 读取值保持最新。provider 的前后 `value` 用 `Object.is` 比较；值不同时，React 会重新渲染读取
该 Context 的后代。`memo` 不能阻止 reader 收到新的 Context 值（S5、S6）。

```tsx
function AccessProvider() {
  const [access, setAccess] = useState('访客')
  return (
    <AccessContext value={access}>
      <button onClick={() => setAccess('编辑者')}>切换权限</button>
      <AccessLabel />
    </AccessContext>
  )
}
```

`defaultValue` 只在完全没有 provider 时使用。存在 `<AccessContext value={undefined}>` 时，reader 读取
的是 `undefined`，不会回退到创建 Context 时的默认值（S5、S6）。

## 调用位置与条件例外

尽管函数名是 `use`，官方文档明确说它不是普通 Hook 的顺序槽位。它可以出现在条件、提前返回之后和循环
中（S1、S2、S7、S8）：

```tsx
function OptionalAccess({ show }: { show: boolean }) {
  if (!show) return null

  const access = use(AccessContext)
  return <span>{access}</span>
}

function ReportList({ promises }: { promises: Promise<Report>[] }) {
  const reports = []
  for (const promise of promises) reports.push(use(promise))
  return reports.map((report) => <p key={report.id}>{report.title}</p>)
}
```

例外只属于 `use`。`useState`、`useEffect`、`useMemo` 等普通 Hooks 仍须遵守顶层固定顺序。`use` 自己也
仍有三条位置限制：只能在函数组件或自定义 Hook 内调用，不能在事件处理器、模块顶层或任意普通工具函数
中调用，也不能放进 `try/catch`（S1、S2、S7、S8、S13）。

## Promise 读取合同

### pending、fulfilled、rejected

`use(promise)` 读取 Promise 的 settled value。三个状态对应三条渲染路径（S1、S2、S9、S10、S15）：

```text
pending   -> 当前 render 挂起 -> 最近 Suspense 显示 fallback
fulfilled -> use 返回 value   -> 组件继续 render 并提交内容
rejected  -> 抛出 reason      -> 最近 Error Boundary 显示失败 fallback
```

```tsx
function ReportReader({ reportPromise }: { reportPromise: Promise<Report> }) {
  const report = use(reportPromise)
  return <p>{report.title}</p>
}

<ErrorBoundary fallback={<p>读取失败</p>}>
  <Suspense fallback={<p>正在读取</p>}>
    <ReportReader reportPromise={reportPromise} />
  </Suspense>
</ErrorBoundary>
```

Suspense 负责 pending，不负责把 rejection 显示成失败 UI；Error Boundary 负责 render 路径中的 rejection，
不代表它能捕获事件处理器或任意异步 callback 中的普通错误（S9、S10）。

Promise 一旦 rejected，其状态不会因再次读取而改变。若要再次尝试，必须提供新的 Promise 身份；若所用
Error Boundary 已把错误保存为自己的 State，还需通过该边界的公开重置方式或新 `key` 让后代再次参与
render。这里不展开通用重试、缓存失效或 Transition 策略。

### Client 端 cached Promise 身份

Client render 必须让同一资源跨重渲染复用同一个 Promise 实例。Promise 身份是读取进度的一部分，不是
可选的引用优化（S1、S2、S9、S12、S15）。

```tsx
// 错误：每次 render 都产生新 Promise。
const report = use(loadReport())

// 错误：即使 getCachedReport() 稳定，then 仍返回新 Promise。
const normalized = use(getCachedReport().then(normalizeReport))
```

正确结构是在 render 前准备最终 Promise，并让 cache 对同一 key 返回同一个实例：

```tsx
const reportCache = new Map<string, Promise<Report>>()

function getReport(resourceKey: string): Promise<Report> {
  let promise = reportCache.get(resourceKey)
  if (!promise) {
    promise = loadReport(resourceKey)
    reportCache.set(resourceKey, promise)
  }
  return promise
}

function ReportReader({ resourceKey }: { resourceKey: string }) {
  const report = use(getReport(resourceKey))
  return <p>{report.title}</p>
}
```

同一 cached Promise 已 fulfilled 后，普通父级重渲染可以同步读出同一值，不应重新显示 fallback。开发
环境若发现组件在同一读取位置换成新的未缓存 Promise，会给出
`A component was suspended by an uncached promise` 警告（S1、S2、S12、S15）。本结论只要求最小
身份复用，不引入远程数据缓存架构。

### 不要绕过 `use`

React 会在当前实现中跟踪 thenable 的 `status`、`value` 和 `reason`，类型包也描述了这些形状。但应用
不应据此读取自定义字段并绕过 `use`（S1、S2、S15、S17）：

```tsx
// 错误：绕过 React 对 Promise 的读取与 Suspense 跟踪。
if (reportPromise.status === 'fulfilled') return <Report value={reportPromise.value} />

// 正确：条件可以决定是否读取，但读取本身始终交给 use。
if (!showReport) return null
const report = use(reportPromise)
```

`status` 字段主要用于 Suspense-compatible data layer 作者；它不是原生 Promise 的标准应用读取接口。

## `try/catch` 限制

`use` 不能被 `try/catch` 包围。Promise pending 时，React 19.2.8 使用内部挂起信号中断当前 render；
用户代码捕获而不立即重抛会阻止 React 把等待交给 Suspense，并可能出现
`Suspense Exception: This is not a real error!` 或 production error `460`（S7、S8、S11、S15）。

```tsx
// 错误：同时吞掉 pending 控制流与真正的读取错误。
try {
  const report = use(reportPromise)
  return <Report value={report} />
} catch {
  return <p>读取失败</p>
}
```

正确做法是让边界分工：

```tsx
<ErrorBoundary fallback={<p>读取失败</p>}>
  <Suspense fallback={<p>正在读取</p>}>
    <ReportReader reportPromise={reportPromise} />
  </Suspense>
</ErrorBoundary>
```

如果业务希望把 rejection 转成普通后备值，也可以在 render 前对原 Promise 调用 `.catch`，缓存
`.catch` 返回的最终 Promise，再把它交给 `use`。不能在 render 中临时 `.catch`，因为它同样会产生新的
Promise 身份（S1、S2、S11）。

## TypeScript 类型合同

当前仓库的 package、lock 与 install 三层均为 `@types/react@19.2.18`。该版本声明（S17）：

```ts
interface Context<T> extends Provider<T> {
  Provider: Provider<T>
  Consumer: Consumer<T>
  displayName?: string
}

type ReactPromise<T> =
  | UntrackedReactPromise<T>
  | PendingReactPromise<T>
  | FulfilledReactPromise<T>
  | RejectedReactPromise<T>

type Usable<T> = ReactPromise<T> | Context<T> | RendererUsable<T>[keyof RendererUsable<T>]

function use<T>(usable: Usable<T>): T
```

`createContext<T>(defaultValue: T): Context<T>` 把 Context 值类型带入 `use`；`Promise<T>` 结构上满足
未跟踪 `ReactPromise<T>`，因此两类输入都能推导返回值：

```tsx
type Access = '访客' | '编辑者'
type Report = { id: string; title: string }

const AccessContext = createContext<Access>('访客')
declare const reportPromise: Promise<Report>

const access = use(AccessContext) // Access
const report = use(reportPromise) // Report
```

若 Context 以 `null` 作为最后后备值，返回类型也必须保留 `null`，`use` 不会替应用证明 provider 一定
存在：

```tsx
const SessionContext = createContext<Session | null>(null)
const session = use(SessionContext) // Session | null
if (!session) return <LoginPrompt />
```

对 `use(42)`、`use({})` 等输入，TypeScript 会因不满足 `Usable<T>` 拒绝；绕过类型检查后，React
`v19.2.8` 会走 S14 的 unsupported type 错误分支。

## 易错点账本

### `Invalid hook call`：在组件或 Hook 外调用 `use`

- **触发：** 在模块顶层、事件处理器或普通工具函数中调用 `use`。
- **原因：** 当前 render dispatcher 只在函数组件或 Hook 执行期间提供读取能力。
- **后果：** lint 拒绝；开发运行时可能先输出 `Invalid hook call`，随后因无有效 dispatcher 失败。
- **错误示例：** `const access = use(AccessContext)` 写在模块顶层。
- **正确示例：** 在 `function AccessLabel()` 或 `function useAccess()` 内调用，再由组件使用返回值。
- **版本：** React 文档 `19.2`；React `v19.2.8`。
- **来源：** S1、S2、S7、S8、S13。
- **验证方式：** 对模块顶层与事件 handler 反例运行 Hooks lint，并在开发构建确认 console 出现对应错误；
  正例 render 后能读取预期 Context 值。

### `use` 条件例外被错误外推给其他 Hooks

- **触发：** 因为 `use` 可在 `if` / `for` 中调用，就把 `useState`、`useEffect` 等也放进分支或循环。
- **原因：** 条件与循环例外只属于 `use`，普通 Hooks 仍依赖稳定调用顺序。
- **后果：** lint 报 Rules of Hooks 违规，运行时可能出现 Hook 顺序不一致错误。
- **错误示例：** `if (enabled) useState(0)`。
- **正确示例：** `useState` 保持顶层；只有 `if (enabled) use(resource)` 可以条件调用。
- **版本：** React 文档 `19.2`。
- **来源：** S1、S2、S7、S8。
- **验证方式：** Hooks lint 应拒绝条件 `useState`，接受组件内的条件 `use(resource)`。

### Context provider 位置或 `defaultValue` 理解错误

- **触发：** 在 reader 同一组件内部或其下方放 provider，或以为 `value={undefined}` 会回退默认值。
- **原因：** 查找只向上；默认值只在上方完全没有匹配 provider 时使用。
- **后果：** reader 得到外层值、静态默认值或 `undefined`，而不是期望的新值。
- **错误示例：** 先 `use(AccessContext)`，再从同一组件返回 `<AccessContext value="编辑者">`；或提供
  `<AccessContext value={undefined}>`。
- **正确示例：** 将 provider 移到 reader 父级，并始终显式传入类型允许的 `value`。
- **版本：** React 文档 `19.2`；React 19 provider 语法。
- **来源：** S1-S6。
- **验证方式：** 分别 render 无 provider、外层 provider、嵌套 provider、同组件 provider 与
  `value={undefined}`，断言读值依次符合默认、外层、最近内层、上层/默认、`undefined`。

### Context 更新因引用身份不变而未传播

- **触发：** 原地修改对象后仍把同一对象作为 provider `value`，并用同一引用更新 State。
- **原因：** Context 前后值用 `Object.is` 比较；同一对象引用相等。
- **后果：** reader 不会因 Context 值变化通知而获得预期更新。
- **错误示例：** `settings.mode = 'dark'; setSettings(settings)`。
- **正确示例：** `setSettings((current) => ({ ...current, mode: 'dark' }))`。
- **版本：** React 文档 `19.2`。
- **来源：** S5、S6。
- **验证方式：** 记录 reader 可见值；同引用写入不应作为成功更新证据，新对象写入后应显示新值。

### `A component was suspended by an uncached promise`

- **触发：** render 中直接执行 `fetch`、`async` 调用、`new Promise`，或对 cached Promise 临时
  `.then` / `.catch`。
- **原因：** 每次 render 得到新的 Promise 身份，React 不能跨重试和普通重渲染复用同一读取进度。
- **后果：** 开发环境出现精确警告；fallback 可能反复显示，内容无法稳定出现。
- **错误示例：** `use(getCachedReport().then(normalizeReport))`。
- **正确示例：** render 前创建最终 Promise，并用稳定 key 从最小 cache 取回同一实例。
- **版本：** React 文档 `19.2`；React `v19.2.8`。
- **来源：** S1、S2、S12、S15。
- **验证方式：** pending 与 fulfilled 阶段各触发父级重渲染，Promise 创建次数和对象身份保持不变；
  fulfilled 后 fallback 不重现，console 无 uncached Promise 警告。

### `Suspense Exception: This is not a real error!`

- **触发：** 用 `try/catch` 包围 `use` 并吞掉内部挂起信号。
- **原因：** pending 通过 React 内部信号中断 render；用户 catch 会截断 Suspense 控制流。
- **后果：** production error `460` 或开发错误，并产生不可预期渲染行为。
- **错误示例：** `try { return use(reportPromise) } catch { return fallback }`。
- **正确示例：** `use` 保持在 reader render 中，外层分别放 Suspense 与 Error Boundary。
- **版本：** React 文档 `19.2`；React `v19.2.8`。
- **来源：** S7、S8、S11、S15。
- **验证方式：** 反例 pending 时应出现精确错误；正确结构 pending 只显示 Suspense fallback，rejected
  只显示 Error Boundary fallback。

### 直接读取 `promise.status` / `value`

- **触发：** 根据自定义 `status` 判断 fulfilled，并直接返回 `value`，只在其他状态调用 `use`。
- **原因：** 条件取决于 Promise 内部状态，读取路径绕过 React 对 thenable 与 Suspense 的跟踪。
- **后果：** 破坏 Suspense 优化与 React DevTools 的 Suspense 能力，并依赖非标准 Promise 扩展。
- **错误示例：** `if (promise.status === 'fulfilled') return promise.value`。
- **正确示例：** 可以按业务条件决定是否读取，但一旦读取就始终 `use(promise)`。
- **版本：** React 文档 `19.2`；`@types/react@19.2.18` 只描述兼容形状，不授权绕过。
- **来源：** S1、S2、S15、S17。
- **验证方式：** 静态检查 reader 不直接访问 `status` / `value` / `reason`；三态必须经 `use` 和对应边界
  得到可见结果。

### 把任意 Promise rejection 当成 Error Boundary 能力

- **触发：** 声称事件 handler、timer 或组件外 Promise 的 rejection 会自动显示 Error Boundary。
- **原因：** 本文的错误路径来自 reader 在 render 中 `use` 一个 rejected Promise；普通异步 callback
  不在 Error Boundary 的一般捕获范围。
- **后果：** 裸 rejection 可能成为未处理错误，失败 UI 不会按预期出现。
- **错误示例：** 在点击 handler 中 `Promise.reject(error)`，却不让后续 render 读取该 Promise。
- **正确示例：** 将 cached Promise 交给 reader 的 `use`；render 读到 rejection 时由最近边界处理。
- **版本：** React 文档 `19.2`。
- **来源：** S1、S2、S10。
- **验证方式：** 分开验证裸 callback rejection 与 render 中 `use(rejectedPromise)`；只有后者属于本文的
  Error Boundary 路径。

### 非 `Usable<T>` 输入

- **触发：** 把数字、字符串或普通对象传给 `use`，常见原因是把“resource”误解为任意数据。
- **原因：** `@types/react@19.2.18` 只接受 `ReactPromise<T>`、`Context<T>` 或 renderer 扩展类型；当前
  React DOM renderer 只分派 thenable 和 Context。
- **后果：** TypeScript 编译失败；绕过类型后运行时抛出
  `An unsupported type was passed to use(): ...`。
- **错误示例：** `use({ value: report })`。
- **正确示例：** 已有普通值直接使用；只有 Context 或 Promise 才交给 `use`。
- **版本：** React `v19.2.8`；`@types/react@19.2.18`。
- **来源：** S14、S16、S17。
- **验证方式：** 临时 TypeScript fixture 应拒绝普通对象，接受 `Context<Access>` 与
  `Promise<Report>`，并分别推导 `Access` 与 `Report`。

## 本地资产只读盘点

截至 `2026-08-17` 的工作树快照：

- `src/categories/frontend/react/core/learn/use-resource-reading.md` 的 frontmatter 已使用
  `react.core.learn.advanced.use-resource-reading` 和标题“use 读取资源”，正文同时出现 Context 与 Promise
  读取说明；
- `src/categories/frontend/react/core/demos/use-promise-reading/` 包含主 TSX、资源 TS 与 CSS 三个文件；
- 当前 Demo 的 Context 区通过条件分支调用 `use(AccessContext)`，展示默认值、最近内层 provider 与外层
  provider 更新；Promise 区调用 `use(getReportPromise(resourceKey))`，展示 pending、fulfilled、
  rejected、父级重渲染与新资源恢复；
- `demo-manifest.ts` 以 `react.core.learn.advanced.use-resource-reading.resource-reading-demo` 登记该 Demo，
  同源源码列表包含主 TSX、资源 TS 与 CSS。

以上只描述当前文件事实，不表示课程、Demo 或 manifest 的完成状态，也不授权本研究文件之外的修改。

## 结论

1. `use` 是 Context 与 Promise 的统一 render 读取入口；Context 立即返回最近上层 provider 值，Promise
   可能返回、挂起或抛错。
2. `use` 可以位于条件和循环中，但仍只能在函数组件或 Hook 内调用，并且不能放进 `try/catch`；该例外
   不适用于其他 Hooks。
3. Context 没有 provider 时才使用静态 `defaultValue`；provider 更新按 `Object.is` 比较，最近内层
   provider 覆盖外层 provider。
4. Promise pending 交给最近 Suspense，fulfilled 返回值，rejected 交给最近 Error Boundary；普通异步
   rejection 不自动等同于该 render 错误路径。
5. Client 端同一资源必须跨重渲染复用同一个 Promise；render 内新建 Promise 或临时 `.then` / `.catch`
   都会破坏身份。
6. `@types/react@19.2.18` 用 `use<T>(usable: Usable<T>): T` 统一建模
   `ReactPromise<T>` 与 `Context<T>`；nullable Context 仍需应用显式收窄。
