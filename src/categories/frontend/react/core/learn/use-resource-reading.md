---
id: react.core.learn.advanced.use-resource-reading
type: lesson
title: use 读取资源
summary: 使用 use 读取 Context 与 cached Promise，并把异步等待、成功和失败交给对应边界。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 60
prerequisites:
  - react.core.learn.advanced.suspense-fallback-boundary
related:
  - react.core.learn.advanced.error-boundary-render-failures
  - react.core.learn.advanced.suspense-fallback-boundary
tags:
  - React
  - use
  - Context
  - Promise
  - Suspense
  - Error Boundary
  - cache
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能用 use 读取 Context 的默认值与最近 provider 值。
  - 能判断 provider 更新、undefined value 与 Context 默认值的边界。
  - 能说明 use 可以位于条件和循环中，但仍只能在组件或自定义 Hook 内调用。
  - 能说明 use 读取 Promise 时 pending、fulfilled 与 rejected 的三条路径。
  - 能在 render 前创建并缓存 Promise，让普通父级重新 render 复用同一个身份。
  - 能用 Suspense 表达等待状态，用 Error Boundary 表达读取失败。
  - 能解释为什么 render 内创建 Promise 或临时调用 then 会破坏读取进度。
  - 能通过新资源身份和新边界身份从 rejected 状态恢复。
recap:
  - use 可以读取 Context；没有 provider 时返回默认值，有多个 provider 时读取最近祖先的值。
  - provider value 变化会更新 reader；存在 value 为 undefined 的 provider 时不会回退默认值。
  - use 可以位于条件和循环中，但不能在普通函数、事件处理器或 try/catch 中调用。
  - use 在 Promise fulfilled 时返回值，pending 时挂起当前 render，rejected 时抛给最近的错误边界。
  - Client Component 需要复用 cached Promise，不能在 render 中创建新的异步任务。
  - 父级重新 render 不应改变资源 key，也不应增加 Promise 创建次数。
  - use 不能放进 try/catch；等待与失败应分别交给 Suspense 和 Error Boundary。
  - rejected Promise 不会自行恢复，需要新 Promise，并重建保存错误 State 的边界。
sources:
  - title: use
    url: https://react.dev/reference/react/use
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Context 与 Promise 两类 Usable 的读取方式
      - use 可在条件和循环中调用，但必须位于组件或 Hook 内
      - Promise 的 pending、fulfilled、rejected 语义与返回值
      - Promise 缓存身份、调用位置以及不能用 try/catch 包围 use
  - title: createContext
    url: https://react.dev/reference/react/createContext
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Context 默认值、provider value 与最近祖先匹配
  - title: useContext
    url: https://react.dev/reference/react/useContext
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - provider 更新的 Object.is 比较与 reader 更新
      - value 为 undefined 时不会回退 Context 默认值
  - title: Suspense
    url: https://react.dev/reference/react/Suspense
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - use 是稳定的 Suspense 激活源，最近父级边界负责 pending fallback
  - title: Component Error Boundary
    url: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 最小 class Error Boundary 与后代渲染失败 fallback
  - title: React 19 use announcement
    url: https://react.dev/blog/2024/12/05/react-19#new-feature-use
    sourceType: release-note
    appliesTo: React 19
    claims:
      - use 的公开身份与 Client render 内 uncached Promise 警告
---

# use 读取资源

## 一、学习目标

- 用 `use(context)` 读取默认值、外层 provider 值与最近内层 provider 值。
- 判断 provider value 更新、`undefined` 与静态默认值的区别。
- 在条件分支中读取 Context，并说明这种调用为什么符合 `use` 的公开规则。
- 读懂 `use(promise)` 的 pending、fulfilled 与 rejected 三条结果路径。
- 在事件中准备 Promise，并让 reader 在 render 中只读取 cached Promise。
- 用普通父级重新 render 验证同一个资源身份被持续复用。
- 把等待交给 Suspense，把读取失败交给 Error Boundary。
- 用新资源 key 和新 boundary key 完成失败后的显式恢复。

## 二、为什么需要

组件经常要读取两类由外部提供的值：祖先 provider 提供的 Context，以及会在未来完成的 Promise。`use`
给这两类输入提供统一的 render 读取入口，但它们的结果不同：Context 立即返回当前值，Promise 可能返回、
挂起或抛出失败。

普通 Promise 不会自己描述 React 应该在页面上显示什么。组件如果在 Effect 中等待结果，再维护一份
`isLoading`，展示的是普通 State loading；这没有让 render 暂停，也没有验证 Suspense。

`use(promise)` 把异步值带进 render：值还没准备好时，React 把当前子树交给最近的 Suspense；值成功
后，`use` 返回结果；值失败时，rejection 沿渲染路径到达最近的 Error Boundary。这里真正决定能否前进
的是 Promise 身份：React 重试 render 时必须再次看到同一个资源，而不是一个刚创建的新 Promise。

## 三、核心概念

### 1. `use` 可以读取 Context 与 Promise

`use` 接收 React 支持的资源并返回读取结果。本课覆盖两种稳定输入：

```tsx
const access = use(AccessContext)
const report = use(reportPromise)
```

读取 Context 时，返回当前组件上方最近 provider 的值；没有匹配 provider 时返回 `createContext` 的默认值。
读取 Promise 时，结果取决于 Promise 当前状态。两者都发生在 render 中，不需要把值复制到另一份 State。

### 2. Context 默认值与最近 provider

先创建带默认值的 Context：

```tsx
import { createContext, use } from 'react'

const AccessContext = createContext('默认访客')

/** 读取当前组件位置可见的访问身份。 */
function AccessLabel() {
  const access = use(AccessContext)
  return <strong>{access}</strong>
}
```

如果 `AccessLabel` 上方没有 provider，结果是“默认访客”。如果组件位于 provider 下方，React 从当前组件
位置向上查找最近的匹配 Context：

```tsx
<AccessContext value="课程编辑者">
  <AccessLabel />
  <AccessContext value="只读审阅者">
    <AccessLabel />
  </AccessContext>
</AccessContext>
```

第一个标签读取“课程编辑者”，第二个读取更近的“只读审阅者”。provider 必须位于读取组件的祖先位置；
在同一组件返回的 JSX 中把 provider 放到读取位置下方，不能反向影响已经发生的读取。

### 3. Context 更新与默认值边界

provider 的 `value` 变化时，React 使用 `Object.is` 比较前后值。结果不同时，读取该 Context 的后代会
获得新值；即使 reader 被 `memo` 包裹，Context 更新也不能被旧 Props 比较阻止。

`createContext(defaultValue)` 的默认值只在祖先链上完全没有匹配 provider 时使用，而且是静态的最后
后备值。存在 provider 时，它提供的值就是读取结果，包括类型允许的 `undefined`：

```tsx
const OptionalAccessContext = createContext<string | undefined>('默认访客')

/** 读取类型允许 undefined 的 Context。 */
function OptionalAccessLabel() {
  const access = use(OptionalAccessContext)
  return <span>{access ?? 'provider 明确提供了 undefined'}</span>
}

<OptionalAccessContext value={undefined}>
  <OptionalAccessLabel />
</OptionalAccessContext>
```

上面的 reader 得到 `undefined`，不会得到“默认访客”。如果业务不允许缺值，应让 Context 类型排除
`undefined`；如果允许缺值，reader 就要显式处理联合类型。

`use` 会从资源中推导返回类型。`Context<Access>` 读取为 `Access`，`Promise<Report>` 读取为 `Report`；
若 Context 默认值包含 `null` 或 `undefined`，返回类型也保留它们，不会因为页面上通常存在 provider 就
自动收窄。

### 4. `use` 可以位于条件和循环中

`use` 与名称以 `use` 开头的 Hook 有一条重要区别：它可以位于条件和循环中。下面的早返回是合法的：

```tsx
/** 只在功能开启时读取当前 Context。 */
function OptionalAccess({ enabled }: { enabled: boolean }) {
  if (!enabled) return <span>未读取</span>

  const access = use(AccessContext)
  return <span>{access}</span>
}
```

允许条件调用不等于允许任意位置调用。`use` 仍必须由 React 组件或自定义 Hook 在 render 期间调用，不能放进
普通工具函数、事件处理器或模块顶层，也不能用 `try/catch` 包围。循环中的每次读取还应来自明确、稳定的
资源集合，不能借此在 render 中不断创建新 Promise。

### 5. `use` 把 Promise 分成三条渲染路径

reader 只需要读取传入的 Promise：

```tsx
import { use } from 'react'

type Report = {
  title: string
}

/** 在 render 中读取已由上层准备好的报告 Promise。 */
function ReportReader({ reportPromise }: { reportPromise: Promise<Report> }) {
  const report = use(reportPromise)
  return <h2>{report.title}</h2>
}
```

当 Promise pending 时，这次 render 挂起，最近的父级 Suspense 显示 fallback。Promise fulfilled 后，
React 重试子树，`use` 返回 resolved value，内容才被提交。Promise rejected 后，`use` 把失败带入 React
渲染传播路径，由最近的 Error Boundary 显示错误 fallback。

```text
pending   -> Suspense fallback
fulfilled -> use 返回值 -> 内容提交
rejected  -> Error Boundary fallback
```

这不是说 Error Boundary 能捕获任意 Promise rejection。只有组件在 render 中通过 `use` 读取 rejected
Promise 时，该失败才属于这条渲染路径。

### 6. Promise 身份是读取进度的一部分

首次 mount 在 pending 时没有完成，React 后续会从头重试这棵子树。如果 Promise 在 render 中创建，每次
重试都会遇到一个全新的 pending 对象：

```tsx
// 错误：每次 render 都产生新 Promise。
const report = use(loadReport())
```

即使基础 Promise 已缓存，临时调用 `.then(...)` 也会产生新 Promise：

```tsx
// 错误：then 的返回值仍然是每次 render 新建的 Promise。
const report = use(getCachedReport().then(normalizeReport))
```

正确结构是在 render 前准备最终 Promise，用稳定 key 将它存入 cache；reader render 只按 key 取回同一
实例。这样父级 State 更新虽然会重新执行 reader，资源创建次数仍不变。

### 7. 父级重渲染验证 cache 是否真的稳定

最终内容出现，只能证明某个 Promise 成功过，不能证明重新 render 仍复用它。完整验证要覆盖两个时点：

1. pending 时更新边界外父级 State，Suspense fallback 保持显示，资源创建次数不增加。
2. fulfilled 后再次更新父级 State，内容保持可见，资源创建次数仍不增加，也不重新出现 fallback。

这也是模块级最小 cache 在本课的全部职责。它只证明同 key 返回同一 Promise，不代表完整的远程数据层，
也不处理缓存失效、请求去重或重试策略。

### 8. rejected 后需要两种新身份

Promise 一旦 rejected，就不会因为再次读取而变成 fulfilled。Error Boundary 捕获错误后也保存了自己的
错误 State。因此恢复不能只“再试一次”，而要同时完成两件事：

1. 创建新 key 对应的新 pending Promise，让 reader 切换到新的资源身份。
2. 改变 Error Boundary 的 `key`，重建边界并清除旧错误 State。

新边界第一次读取新 Promise 时仍会进入 Suspense fallback；只有新 Promise fulfilled 后，成功内容才
重新出现。这个 `error -> recovery pending -> resolved` 顺序证明恢复没有继续复用旧 rejected Promise。

## 四、用法与示例

下面的 Demo 先在三种树位置调用同一个条件读取组件：没有 provider 时得到默认值，位于外层 provider
下方时得到可切换的外层值，位于嵌套 provider 下方时得到最近内层值。关闭条件读取后，组件在调用 `use`
之前提前返回；再次开启时，React 按当前树位置重新读取 Context。

Promise 区使用本地按钮创建和 settle deferred Promise，不依赖计时器或网络。先走成功路径，并在
pending、fulfilled 两个阶段分别点击“父级重新 render”，比较资源代次与创建次数。重建实验后再走失败
路径，观察 rejection 如何从等待状态切换到错误边界，以及恢复为何同时需要新的资源和边界身份。

:::demo{id="react.core.learn.advanced.use-resource-reading.resource-reading-demo"}
:::

## 五、易错使用提示

::::pitfalls
### 错误一：误认为 `use` 不能条件调用

**触发条件：** 机械套用其他 Hook 的顶层调用规则，把所有 `use(context)` 都移到条件之前。

**原因：** `use` 的公开规则明确允许条件和循环调用；限制的是调用环境，不是固定调用顺序。

**后果：** 组件可能在功能关闭时仍读取不需要的资源，代码也无法直接表达“需要时才读取”。

**错误示例：**

```tsx
/** 无论功能是否开启都先读取 Context。 */
function OptionalAccess({ enabled }: { enabled: boolean }) {
  const access = use(AccessContext)
  return enabled ? <span>{access}</span> : <span>未读取</span>
}
```

**正确写法：**

```tsx
/** 只在功能开启时读取 Context。 */
function OptionalAccess({ enabled }: { enabled: boolean }) {
  if (!enabled) return <span>未读取</span>

  const access = use(AccessContext)
  return <span>{access}</span>
}
```

**验证方式：** 关闭功能时先提前返回，开启后再显示当前位置可见的 Context 值。

### 错误二：在普通函数或事件处理器中调用 `use`

**触发条件：** 因为 `use` 允许条件调用，就把它当作可在任意 JavaScript 位置执行的读取函数。

**原因：** `use` 仍依赖 React 当前 render dispatcher，只能在组件或自定义 Hook 执行期间调用。

**后果：** 事件触发时违反调用规则，无法得到合法的 React 读取上下文。

**错误示例：**

```tsx
/** 错误：事件执行时没有 React render dispatcher。 */
function handleClick() {
  const access = use(AccessContext)
  console.log(access)
}
```

**正确写法：**

```tsx
/** 在 render 中读取值，事件只使用已经读取的结果。 */
function AccessButton() {
  const access = use(AccessContext)
  return <button onClick={() => console.log(access)}>记录 {access}</button>
}
```

**验证方式：** `use` 只出现在组件或自定义 Hook 的 render 路径中，事件处理器只使用已经读取的值。

### 错误三：把 provider 放在读取组件下方

**触发条件：** 在同一个组件中先调用 `use(Context)`，再在返回的 JSX 中包一层该 Context provider。

**原因：** React 只向当前读取组件的祖先方向查找 provider，不会向下查找其后代 JSX。

**后果：** 读取结果仍是更高层 provider 的值或默认值，新写的 provider 对当前调用没有作用。

**错误示例：**

```tsx
/** 错误：当前组件无法读取自己返回的后代 provider。 */
function AccessPanel() {
  const access = use(AccessContext)
  return <AccessContext value="课程编辑者">{access}</AccessContext>
}
```

**正确写法：**

```tsx
/** 读取祖先提供的访问身份。 */
function AccessLabel() {
  return <span>{use(AccessContext)}</span>
}

/** 把 provider 放在读取组件的祖先位置。 */
function AccessPanel() {
  return (
    <AccessContext value="课程编辑者">
      <AccessLabel />
    </AccessContext>
  )
}
```

**验证方式：** 将读取逻辑放进 provider 的后代组件；嵌套 provider 时确认读取最近祖先值。

### 错误四：以为 provider 的 `undefined` 会回退默认值

**触发条件：** 认为只要 provider 存在但没有有效业务值，`use(Context)` 就会自动使用 `createContext` 的
默认值。

**原因：** 默认值只在祖先链没有匹配 provider 时生效；provider 明确传入的 `undefined` 也是一个真实值。

**后果：** reader 可能得到 `undefined`，随后在字符串拼接、属性访问或 JSX 展示中出现空值问题。

**错误示例：**

```tsx
const AccessContext = createContext<string | undefined>('默认访客')

/** 错误：没有处理 provider 明确提供的 undefined。 */
function AccessLabel() {
  const access = use(AccessContext)
  return <strong>{access}</strong>
}

<AccessContext value={undefined}>
  <AccessLabel />
</AccessContext>
```

**正确写法：**

```tsx
const AccessContext = createContext<string | undefined>('默认访客')

function AccessLabel() {
  const access = use(AccessContext)
  return <span>{access ?? '没有访问身份'}</span>
}
```

**验证方式：** 分别测试无 provider、显式字符串 value 和显式 `undefined`，确认三者结果不同。

### 错误五：在 render 中创建 Promise

**触发条件：** 把 `new Promise(...)`、请求函数或 `async` 调用直接传给 `use`。

**原因：** 首次挂起后的重试会重新执行 render，并得到另一个 Promise 身份。

**后果：** fallback 可能反复出现，内容无法稳定提交，并可能看到 uncached Promise 警告。

**错误示例：**

```tsx
function ReportReader() {
  const report = use(loadReport())
  return <p>{report.title}</p>
}
```

**正确写法：**

```tsx
function ReportReader({ reportPromise }: { reportPromise: Promise<Report> }) {
  const report = use(reportPromise)
  return <p>{report.title}</p>
}
```

**验证方式：** pending 与 fulfilled 时分别触发父级重新 render，Promise 创建次数都不增加。

### 错误六：对 cached Promise 临时调用 `.then`

**触发条件：** 在 render 中写 `use(getCachedReport().then(normalizeReport))`。

**原因：** `.then` 总会返回一个新的 Promise，外层 cache 的稳定身份因此失效。

**后果：** React 重试时仍可能遇到新 pending 资源。

**错误示例：**

```tsx
const normalized = use(getCachedReport().then(normalizeReport))
```

**正确写法：**

```tsx
const report = use(getCachedReport())
const normalized = normalizeReport(report)
```

**验证方式：** 检查传给 `use` 的值直接来自 cache，没有 render 内派生 Promise。

### 错误七：用 `try/catch` 包围 `use`

**触发条件：** 想在组件内部同时处理 pending 与 rejected。

**原因：** pending 会使用 React 的内部控制流中断 render，用户代码不能吞掉这个信号。

**后果：** Suspense 无法按合同接管，结果不可预测。

**错误示例：**

```tsx
try {
  return <Report value={use(reportPromise)} />
} catch {
  return <p>读取失败</p>
}
```

**正确写法：**

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<PendingFallback />}>
    <ReportReader reportPromise={reportPromise} />
  </Suspense>
</ErrorBoundary>
```

**验证方式：** pending 只显示 Suspense fallback，rejected 只显示 Error Boundary fallback。

### 错误八：用 Effect loading 冒充 Suspense

**触发条件：** 在 Effect 中创建任务，再根据 `isLoading` 条件显示占位内容。

**原因：** 普通 Effect 请求不会自动激活 Suspense。

**后果：** 页面虽然有 loading UI，却没有验证 `use(promise)` 的挂起语义。

**错误示例：**

```tsx
useEffect(() => {
  loadReport().then(setReport)
}, [])

return isLoading ? <PendingFallback /> : <Report value={report} />
```

**正确写法：**

```tsx
<Suspense fallback={<PendingFallback />}>
  <ReportReader reportPromise={getCachedReport()} />
</Suspense>
```

**验证方式：** 等待 UI 来自实际 Suspense fallback，而不是组件自己的 loading 条件分支。

### 错误九：用同一个 rejected Promise 重试

**触发条件：** 只改变 Error Boundary 的 key，却继续把旧 Promise 传给 reader。

**原因：** rejected Promise 的结果不会改变。

**后果：** 新边界第一次 render 就再次进入错误 fallback。

**错误示例：**

```tsx
setBoundaryVersion((version) => version + 1)
```

**正确写法：**

```tsx
const nextKey = createFreshResource()
setResourceKey(nextKey)
setBoundaryVersion((version) => version + 1)
```

**验证方式：** 恢复后先看到新资源的 pending fallback，兑现后才看到成功内容。

### 错误十：直接读取 Promise 的自定义状态

**触发条件：** 给 Promise 添加 `status`、`value` 字段，并在组件里绕过 `use` 返回它们。

**原因：** 这些字段不是原生 Promise 的标准读取接口，也绕过了本课要验证的 React 跟踪。

**后果：** Demo 只能证明自定义对象分支，不能证明 `use`、Suspense 和 Error Boundary 的协作。

**错误示例：**

```tsx
return reportPromise.status === 'fulfilled' ? <Report value={reportPromise.value} /> : null
```

**正确写法：**

```tsx
const report = use(reportPromise)
return <Report value={report} />
```

**验证方式：** reader 不读取 `status`、`value` 或 `reason`，三种界面由边界实际切换。
::::

## 六、源码推导与适用场景

### 1. 固定来源事实

- React 19.2 的官方 `use` 规则允许 Context 和 Promise 读取，并允许条件、循环调用；调用仍必须发生在
  组件或自定义 Hook 内，且不能被 `try/catch` 包围。
- React 19.2 的 renderer 源码把 thenable 和 Context 分派到各自的读取路径，并拒绝其他输入；官方类型
  声明用 `Usable<T>` 表达这两类输入。这些是当前实现和类型合同的事实，不是对所有未来 renderer 的内部
  细节承诺。
- 官方 `Suspense` 与 `Component` 文档分别规定 pending 的 fallback 和渲染错误的边界路径；普通事件或
  任意异步回调的 rejection 不会自动变成 Error Boundary 的渲染错误。

### 2. 课程推导

- `use(context)` 的读取结果由 provider 在组件树中的位置决定；最近的匹配 provider 覆盖外层值，完全没有
  provider 时才使用静态默认值。
- `use(promise)` 的 pending、fulfilled、rejected 三态可以分别交给 Suspense、reader 返回值和 Error
  Boundary。Promise 身份稳定是 React 重试 render 时继续读取同一进度的前提。
- 因此，Promise 应在事件或其他 render 外部路径创建并按资源 key 缓存；父级重渲染只应重新读取已有资源，
  不应在 render 中创建新的 Promise 或临时派生 `.then`。

### 3. 适用场景与边界

- 小型 Client Component 可以用模块级 `Map` 观察同一 key 的 Promise 复用；真实应用还需要明确缓存失效、
  取消请求和数据一致性策略，不能把这个示例 Map 当作完整数据层。
- 失败恢复必须替换 rejected Promise，并重建保存错误 State 的 Error Boundary；只改变边界身份而继续读取旧
  Promise 仍会再次失败。
- 需要加载状态但不希望挂起当前 render 时，使用普通 State/Effect 或事件处理器；只有把 Promise 交给 `use`
  并置于 Suspense 下，才属于本课的挂起路径。

## 七、练习

:::exercise
### 区分默认值与最近 provider

**要求：** 创建默认值为“默认访客”的 Context，分别在无 provider、外层 provider 和嵌套 provider 三种
位置读取。改变外层 provider 的 value，记录三个读取结果如何变化。

**验收：** 无 provider 的组件始终得到默认值；外层后代随外层 value 更新；嵌套后代始终优先读取最近
内层 provider，除非内层 provider 自身的 value 改变。
:::

:::exercise
### 在条件分支中读取 Context

**要求：** 为读取组件增加 `enabled` 属性。关闭时在调用 `use` 前返回“未读取”，开启时调用
`use(AccessContext)` 并显示值；不要为了遵守普通 Hook 的规则而把调用移到条件前。

**验收：** 开关可反复切换；关闭时不执行读取分支，开启时显示当前位置最近 provider 的值；`use` 没有
进入事件处理器或普通工具函数。
:::

:::exercise
### 验证 cached Promise 的成功路径

**要求：** 从 idle 开始准备一份 Promise，在 pending 时执行一次父级重新 render，确认 revision 增加但
资源代次与创建次数不变。兑现后再次重新 render，确认结果保持可见且 fallback 没有重现。

**验收：** Promise 在 render 前创建；pending 由 Suspense 表达，fulfilled 由 `use` 返回值表达；两次
父级更新都复用同一 Promise 身份，创建次数保持 `1`。
:::

:::exercise
### 验证 rejection 与显式恢复

**要求：** 开始失败读取并拒绝当前 Promise，确认错误 fallback 替代 pending。恢复时创建新资源 key，
同时改变 Error Boundary 的 `key`；记录资源代次、创建次数与边界版本，再兑现恢复资源。

**验收：** rejected 由 Error Boundary 表达；只重建边界或只复用旧 Promise 都不能完成恢复；正确流程
严格经过 `error fallback -> 新资源 pending -> fulfilled content`。
:::

:::exercise
### 组合读取 Context 与 Promise

**要求：** 让报告 reader 先读取访问身份 Context，再读取已经缓存的报告 Promise。分别切换 provider
value、触发父级重新 render、兑现 Promise，并说明每次界面变化来自哪个输入。

**验收：** Context 更新不会创建新 Promise；Promise pending 时仍由 Suspense 接管；fulfilled 后同时
显示最新 Context 值与报告内容；reader 内没有 Effect loading、render 内新 Promise 或 `.then` 派生。
:::

## 八、本节小结

- `use(context)` 返回默认值或最近祖先 provider 的值，读取结果由组件在树中的位置决定。
- `use` 可以位于条件和循环中，但仍只能在组件或自定义 Hook 的 render 路径调用。
- `use(promise)` 把等待、成功和失败接入 React render，而不是维护另一套 Effect loading。
- pending 交给最近 Suspense，fulfilled 返回异步值，rejected 交给最近 Error Boundary。
- Promise 必须在 render 前创建并缓存；render 内创建或调用 `.then` 会破坏稳定身份。
- pending 与 fulfilled 阶段的父级重渲染都应继续读取同一 Promise。
- `use` 不能放进 `try/catch`，也不应通过自定义 Promise 字段绕过。
- rejected 后恢复需要新 Promise 和新 Error Boundary 身份，并先经过新的 pending 状态。

## 九、参考资料

- [React `use`](https://react.dev/reference/react/use) - Context 与 Promise 读取、条件调用、返回值、缓存身份和错误处理限制。
- [React `createContext`](https://react.dev/reference/react/createContext) - Context 默认值、provider value 与最近祖先匹配。
- [React Suspense](https://react.dev/reference/react/Suspense) - `use` 激活源、最近 fallback 与首次挂起重试。
- [`Component`：Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) - rejected 路径需要的最小错误边界。
- [React 19：`use` 新能力](https://react.dev/blog/2024/12/05/react-19#new-feature-use) - `use` 的公开身份与 Client Component 中 uncached Promise 边界。
