---
id: react.core.learn.advanced.lazy-component-code-splitting
type: lesson
title: lazy 组件代码分割
summary: 在第一次需要渲染时加载独立组件模块，并区分模块缓存与组件 State 生命周期。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - react.core.learn.advanced.error-boundary-render-failures
related:
  - react.core.learn.advanced.error-boundary-render-failures
  - react.core.learn.intermediate.state-preservation-and-reset
tags:
  - React
  - lazy
  - import
  - 代码分割
  - Suspense
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能在模块顶层用 lazy 和动态 import 声明一个按需组件。
  - 能说明 loader 在第一次尝试 render lazy 组件时才执行。
  - 能解释 React 为什么缓存 loader Promise 和模块解析结果。
  - 能区分模块缓存与隐藏后组件 State 被卸载、再次显示时重置的差异。
  - 能为 pending 的 lazy 组件提供最小 Suspense fallback。
  - 能判断动态导入的模块边界、默认导出和构建产物是否与按需加载目标一致。
recap:
  - lazy 的 loader 不在声明时执行，而在第一次尝试 render 返回组件时执行。
  - 目标模块需要有效的 default export；真实动态 import 才能形成按需模块边界。
  - React 缓存 loader 的 Promise 和解析结果，但不因此保留已卸载组件实例的 State。
  - lazy 必须在模块顶层声明；组件内声明会创建新的组件类型并重置 State。
  - Suspense fallback 负责等待 UI，不是错误 UI 或加载失败恢复方案。
  - 开发期模块请求和正式构建 chunk 是不同观察对象，不能用其中一个替代另一个。
sources:
  - title: lazy
    url: https://react.dev/reference/react/lazy
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - loader 调用时机、Promise 与解析结果缓存、default export 和顶层声明
  - title: Suspense
    url: https://react.dev/reference/react/Suspense
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - lazy pending 时显示 fallback 的基本行为
  - title: Vite Dynamic Import
    url: https://vite.dev/guide/features#dynamic-import
    sourceType: official-reference
    appliesTo: Vite 8
    claims:
      - 动态导入的构建边界与静态路径要求
  - title: Vite Why Vite
    url: https://vite.dev/guide/why#the-origins
    sourceType: official-reference
    appliesTo: Vite 8
    claims:
      - 开发期原生 ESM 模块按需服务
  - title: Vite Backend Integration
    url: https://vite.dev/guide/backend-integration
    sourceType: official-reference
    appliesTo: Vite 8
    claims:
      - 正式构建 manifest 中的动态入口
  - title: Vite Build
    url: https://vite.dev/guide/build#chunking-strategy
    sourceType: official-reference
    appliesTo: Vite 8
    claims:
      - 动态入口的 chunk 策略边界

---

# lazy 组件代码分割

## 一、学习目标

- 在模块顶层写出一个使用真实动态 `import()` 的 `lazy` 组件。
- 判断组件还没有进入 render tree 时，为什么不会执行 loader。
- 观察 loader 调用次数和组件局部 State，区分模块缓存与组件实例生命周期。
- 为等待中的 lazy 组件提供一个最小、可访问的 Suspense fallback。
- 识别把 `lazy` 写进组件函数为什么会破坏组件身份。
- 区分开发期模块请求与正式构建 chunk，避免把工具产物当作 React 固定合同。

## 二、为什么需要

并不是每个页面区域都需要在首屏就下载。报告、设置或进阶工具等区域可以等用户真正打开时再加载，
让初始页面只承担当前路径需要的代码。

`lazy` 把“组件类型”和“组件实现模块”连接起来：先声明一个可以放进 JSX 的组件类型，等它第一次
真正被渲染时，再执行 loader。这个过程要同时理解两件事：React 会缓存已经得到的模块结果，但当
组件从树中移除时，组件自己的 State 仍然会随实例卸载。

## 三、核心概念

### 1. 在模块顶层声明 lazy

`lazy` 接收一个返回 Promise 的 loader。最常见的 loader 是指向独立模块的动态 `import()`：

```tsx
import { lazy } from 'react'

const LazyCoursePanel = lazy(() => import('./lazy-course-panel'))
```

目标模块需要默认导出一个组件：

```tsx
/** 渲染按需加载的课程面板。 */
export default function LazyCoursePanel() {
  return <section>按需课程面板</section>
}
```

调用 `lazy()` 只创建 lazy 组件类型。React 不会因为执行了这行声明就调用 loader；在 JSX 中也没有
渲染 `<LazyCoursePanel />` 时，目标模块不会因为这个声明而进入当前页面的 render tree。

### 2. 第一次尝试 render 才调用 loader

把 lazy 组件放入条件分支：

```tsx
/** 根据开关决定按需面板是否进入当前组件树。 */
function Workspace() {
  const [showPanel, setShowPanel] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setShowPanel((visible) => !visible)}>
        切换面板
      </button>
      {showPanel ? <LazyCoursePanel /> : <p>面板尚未渲染</p>}
    </>
  )
}
```

冷进入时分支只显示占位内容，loader 调用次数为 `0`。第一次切换到 `true`，React 才尝试 render
`LazyCoursePanel`，loader 随之执行并返回动态模块 Promise。

### 3. Promise 缓存与组件 State 是两种生命周期

React 会缓存 loader 返回的 Promise 及其解析结果。因此，正常动态导入完成后，隐藏再显示不会重新
调用 loader。下面这两个观察值却不同：

```tsx
/** 这个 State 只属于当前一次挂载的组件实例。 */
function LazyCoursePanel() {
  const [revision, setRevision] = useState(0)
  return (
    <button type="button" onClick={() => setRevision((value) => value + 1)}>
      局部版本：{revision}
    </button>
  )
}
```

如果父组件把 `<LazyCoursePanel />` 从 JSX 中移除，实例被卸载，`revision` 随之消失。再次显示时会
创建新实例，版本从 `0` 开始；这不代表模块又下载了一次。模块结果属于 lazy 类型的缓存，State
属于树中当前实例的身份。

### 4. Suspense 只提供等待外壳

动态模块还在 pending 时，lazy 组件会挂起当前 render。用最近的 `Suspense` 给它一个等待 UI：

```tsx
import { Suspense } from 'react'

<Suspense fallback={<p role="status">正在加载面板...</p>}>
  {showPanel ? <LazyCoursePanel /> : null}
</Suspense>
```

`fallback` 说明“代码还没准备好”，不是错误页面。加载失败属于另一条错误路径，应由 Error Boundary
处理；本课不把等待、失败恢复或 reveal 调度混成一个主题。

## 四、API 合同与生命周期边界

### 1. `load` 的输入和输出

`lazy(load)` 的 `load` 参数必须是一个函数。React 在第一次尝试渲染 lazy 组件时调用它，并期待得到
Promise 或 thenable。Promise 解析为模块对象后，React 从对象的 `default` 字段取得组件类型：

```tsx
const LazySettings = lazy(() => import('./settings-panel'))
```

这段写法有三个相互配合的合同：

1. `import('./settings-panel')` 是真实的动态导入，返回模块 Promise。
2. `settings-panel.tsx` 的默认导出是可渲染的组件。
3. `LazySettings` 是稳定的组件类型，可以像普通组件一样出现在 JSX 中。

如果目标组件接收 Props，类型会从默认导出中传递出来：

```tsx
// settings-panel.tsx
type SettingsPanelProps = { userId: string }

export default function SettingsPanel({ userId }: SettingsPanelProps) {
  return <p>当前用户：{userId}</p>
}

// page.tsx
const LazySettings = lazy(() => import('./settings-panel'))

function Page() {
  return <LazySettings userId="u-1" />
}
```

TypeScript 能检查传给 `LazySettings` 的 Props 是否满足默认组件的合同，但它不会替你决定何时加载模块。
加载时机仍由组件是否进入 React 树决定。

### 2. Promise 缓存和解析结果缓存

第一次调用 `load` 后，React 会缓存它返回的 Promise；Promise 成功后，解析出的模块结果也会被缓存。
因此有两个不同的时间点：

- **调用时点：** 第一次尝试 render lazy 组件。
- **复用时点：** 同一个 lazy 组件类型再次 render 时，复用已经缓存的 Promise 或模块结果。

隐藏组件再显示时，第二次 render 仍然会使用原来的 `LazySettings` 类型，所以不会因为新的组件实例而
再次执行 `load`。这里的“缓存”只说明加载结果可以复用，不说明组件实例会一直存在。

如果 Promise 被拒绝，React 会把拒绝原因沿渲染路径交给最近的 Error Boundary。这个行为与 Promise 成功
后交给 `default` 组件渲染是两条结果路径；Suspense fallback 只表示 pending，不能把拒绝改写为成功。

### 3. 模块缓存、树中位置和实例 State

组件 State 属于 React 树中的实例。下面三种操作容易被混为一谈：

| 操作 | 模块是否再次加载 | 当前实例 State |
| --- | --- | --- |
| 父组件无关 State 更新，lazy 仍在树中 | 否 | 保留 |
| 条件变为 `false`，不再渲染 lazy 组件 | 否 | 实例卸载，State 消失 |
| 条件再次变为 `true`，同一 lazy 类型回到原位置 | 否 | 创建新实例，State 从初值开始 |

如果业务需要暂时不可见但继续保留草稿，应让组件继续挂在树中，例如使用 `hidden` 或由已挂载的父级
保存草稿；不要把条件渲染移除误认为“只是隐藏”。反过来，如果需要明确清空局部 State，条件移除或
改变 `key` 都可以重建实例，但它们不会清除 lazy 模块的缓存。

### 4. `lazy` 类型和 `key` 的身份

`const LazyPanel = lazy(...)` 在模块顶层执行一次，得到一个稳定的 lazy 类型。父组件重新 render 时，
只要仍然使用同一个类型和同一个 `key`，子组件身份就不会因为父级 render 而改变：

```tsx
const LazyPanel = lazy(() => import('./panel'))

/** 父级更新不会重新创建 lazy 类型。 */
function Workspace({ recordId }: { recordId: string }) {
  return <LazyPanel key={recordId} />
}
```

在这里改变 `recordId` 会改变 `key`，从而重建组件实例；它也不会让 `lazy` 再创建一个新的 loader。
把 `lazy()` 放进 `Workspace` 函数则不同：每次 render 都会生成新的 lazy 类型，React 会把它当作新的
组件处理，已经挂载的 State 可能被重置。

### 5. 动态导入的静态边界

代码分割需要构建工具能识别模块边界。课程主线使用带固定模块路径的动态导入：

```tsx
const LazyReport = lazy(() => import('./report-panel'))
```

不要把用户输入直接拼接成导入路径：

```tsx
// 不要把这个写法当作可预测的单一模块边界
const LazyReport = lazy(() => import(`./reports/${reportName}`))
```

变量路径会引入额外的构建分析和匹配范围，最终包含哪些模块、生成哪些 chunk 取决于工具规则。需要
多个固定选项时，优先用显式映射把每个导入写成静态字符串，再根据映射选择一个稳定的 lazy 类型。

### 6. 加载失败不会自动重试

同一个 lazy 类型只调用一次 loader。如果 loader Promise 被拒绝，之后再次渲染这个类型时，React 会把
同一个拒绝原因交给最近的 Error Boundary，而不是自动再次执行 loader：

```tsx
const LazyPanel = lazy(() => import('./panel'))
```

重置 Error Boundary 只会让子树重新尝试 render；改变 `<LazyPanel key={...} />` 的 `key` 只会重建组件
实例。两者都没有创建新的 `LazyPanel` 类型，因此也不会清空这个类型保存的加载结果。

需要真正重新加载时，应用必须建立新的 lazy 类型和新的 loader Promise，或交给具备模块重试能力的
框架流程。不要为了重试把 `lazy()` 移进普通组件 render；那会让每次无关更新都创建新类型并破坏 State。

## 五、用法与示例

本课 Demo 的主模块在顶层声明 `LazyCoursePanel`，并用一个布尔 State 控制它是否进入树。进入前，
页面显示“尚未渲染”；进入后，子面板显示 loader 调用次数和自己的局部版本。先修改局部版本，再隐藏
并重新显示，可以看到局部版本回到 `0`，而 loader 调用仍为 `1`。

Demo 还提供一个确定性失败路径：失败的动态导入被最近的 Error Boundary 接管，局部区域显示失败状态。
重置失败演示后再次触发同一个 lazy 类型，失败 loader 的累计调用仍保持不变，用来观察 rejection 被缓存且
不会因为重新 render 自动重试。

:::demo{id="react.core.learn.advanced.lazy-component-code-splitting.on-demand-panel-demo"}
:::

### 1. 观察顺序

1. 进入课程时不要点击按钮，确认按需面板没有渲染。
2. 点击“显示按需面板”，等待子面板出现，确认 loader 调用为 `1`。
3. 点击“修改局部版本”，确认局部版本变为 `1`。
4. 点击“隐藏按需面板”，实例被移出树。
5. 再次点击“显示按需面板”，确认局部版本回到 `0`，loader 调用仍是 `1`。
6. 点击“更新外壳”可以让父组件重新 render；只要面板保持显示，loader 不会因为父级更新而再次
   调用。
7. 点击“演示加载失败”，确认失败状态只替换局部区域，页面其他内容仍然可见。
8. 记录失败 loader 调用次数，点击“重置失败演示”后再次演示失败；确认同一个 lazy 类型不会自动重新调用
   loader。

## 六、易错使用提示

:::pitfalls
### 错误一：以为声明 lazy 就会立即加载模块

**触发条件：** 执行 `const Panel = lazy(() => import('./Panel'))` 后，认为目标模块已经下载。

**原因：** `lazy` 会延迟到第一次尝试 render 返回组件时才调用 loader。

**后果：** 把首屏未使用的代码误认为已经进入初始负载，也无法正确设计按需边界。

**错误示例：**

```tsx
const Panel = lazy(() => import('./Panel'))
// 这里没有渲染 <Panel />，loader 仍未执行。
```

**正确写法：**

```tsx
const Panel = lazy(() => import('./Panel'))
return showPanel ? <Panel /> : <p>尚未打开</p>
```

**验证方式：** 冷进入时观察 loader 计数为 `0`，首次显示后才变为 `1`。

### 错误二：目标模块没有 default export

**触发条件：** 目标文件只有具名导出，却直接把它交给标准 `lazy(() => import(...))`。

**原因：** React 需要 Promise 解析结果的 `.default` 是有效组件类型。

**后果：** 首次 render 时 React 得到的 `.default` 不是有效组件类型，组件渲染失败；等待外壳不会把
无效组件变成可渲染组件。

**错误示例：**

```tsx
// Panel.tsx
export function Panel() {
  return <p>面板</p>
}
```

**正确写法：**

```tsx
// Panel.tsx
/** 渲染可按需加载的面板。 */
export default function Panel() {
  return <p>面板</p>
}
```

**验证方式：** 对模块做类型检查，并在首次显示时确认子组件正常提交。

### 错误三：把 lazy 写在组件函数内部

**触发条件：** 每次父组件 render 都重新执行 `lazy(() => import('./Panel'))`。

**原因：** 每次执行都会创建新的 lazy 组件类型；React 会把它当成不同组件处理。

**后果：** 子组件可能被反复卸载和重建，局部 State 被意外重置。

**错误示例：**

```tsx
function Page() {
  const Panel = lazy(() => import('./Panel'))
  return <Panel />
}
```

**正确写法：**

```tsx
const Panel = lazy(() => import('./Panel'))

/** 渲染使用稳定 lazy 类型的页面。 */
function Page() {
  return <Panel />
}
```

**验证方式：** 让父组件发生无关更新，确认已挂载面板的局部 State 不会因此归零。

### 错误四：把 Suspense fallback 当成错误恢复

**触发条件：** 认为 fallback 能处理模块拒绝或提供“重试加载”合同。

**原因：** Suspense 只表达 pending；拒绝会沿 React 错误路径抛出，由 Error Boundary 负责。

**后果：** 加载失败时界面没有正确的错误边界和恢复策略。

**错误示例：**

```tsx
<Suspense fallback={<p>加载失败，请重试</p>}>
  <Panel />
</Suspense>
```

**正确写法：**

```tsx
<ErrorBoundary fallback={<p role="alert">面板暂时不可用</p>}>
  <Suspense fallback={<p role="status">正在加载...</p>}>
    <Panel />
  </Suspense>
</ErrorBoundary>
```

**验证方式：** 将加载失败路径交给 Error Boundary 处理；不要用 fallback 文案冒充失败测试。

### 错误五：不提供 Suspense 就直接渲染 lazy 组件

**触发条件：** 只声明 `lazy`，把 `<Panel />` 放入页面，却没有任何包住它的 `Suspense`。

**原因：** pending 的 lazy 组件会在 render 路径中挂起；它需要最近的 Suspense 提供可以提交的 fallback。

**后果：** 页面缺少明确的等待状态，或者由更外层的边界接管了不属于当前区域的内容。

**错误示例：**

```tsx
const Panel = lazy(() => import('./Panel'))

function Page() {
  return <Panel />
}
```

**正确写法：**

```tsx
<Suspense fallback={<p role="status">正在加载面板...</p>}>
  <Panel />
</Suspense>
```

**验证方式：** 让目标模块保持 pending，确认最近的 fallback 只替换它负责的局部区域。

### 错误六：把条件移除当成“暂时隐藏”

**触发条件：** 用 `{open && <Panel />}` 隐藏面板，却期待输入值和局部 State 下次显示时仍然保留。

**原因：** 条件为假时，Panel 实例已经从 React 树中移除；模块缓存不会保存实例 State。

**后果：** 用户再次打开面板时看到初始值，误以为代码分割导致数据丢失。

**错误示例：**

```tsx
{open ? <Editor /> : null}
```

**正确写法：**

```tsx
function Page({ open }: { open: boolean }) {
  const [draft, setDraft] = useState('')
  return <Editor hidden={!open} draft={draft} onDraftChange={setDraft} />
}
```

**验证方式：** 修改局部 State 后分别使用条件移除和 `hidden`，比较再次显示时的值；两种写法的模块
加载次数都不应增加。

### 错误七：为了形式把所有组件都拆成 lazy

**触发条件：** 把首屏必需、体积很小或每次都同时出现的组件全部改成独立动态导入。

**原因：** 代码分割增加了模块边界和 pending 状态；如果用户马上需要所有模块，拆分不会带来有效的
按需收益，反而可能增加请求和等待层级。

**后果：** 首屏出现更多加载状态，模块之间形成不必要的瀑布，维护成本也随边界数量增加。

**错误示例：**

```tsx
const Icon = lazy(() => import('./Icon'))
const PageTitle = lazy(() => import('./PageTitle'))
```

**正确写法：**

```tsx
import Icon from './Icon'

const LazyReport = lazy(() => import('./Report'))
```

**验证方式：** 先确认区域的使用时机和体积，再比较初始模块、首次打开模块和用户等待路径；不要只因
看到 `import()` 就认定性能一定更好。

### 错误八：用变量路径拼接动态导入

**触发条件：** 把用户输入或任意变量直接放进 `import()` 路径，期待构建工具只生成当前需要的一个模块。

**原因：** 构建工具需要分析可能的路径集合；变量范围和匹配规则会影响生成的模块集合与 chunk 结构。

**后果：** 产物边界不可预测，可能包含不需要的模块，也难以确认某次交互具体加载了什么。

**错误示例：**

```tsx
const Panel = lazy(() => import(`./panels/${panelName}`))
```

**正确写法：** 为固定选项建立显式映射，每个分支使用字面量路径：

```tsx
const panelLoaders = {
  settings: () => import('./settings-panel'),
  report: () => import('./report-panel'),
} as const
```

**验证方式：** 检查每个导入的 specifier 是否固定，并在正式构建产物中确认边界，而不是依赖开发期的
文件数量猜测。

### 错误九：用开发期请求数量代替正式 chunk 证据

**触发条件：** 只看开发服务器的 Network 面板，就断言正式部署一定生成一个同名 chunk，或断言一定只有
一次请求。

**原因：** 开发服务器按原生 ESM 提供源码模块；正式构建会执行打包、共享依赖处理和 chunk 优化。

**后果：** 把开发期源码请求、正式 chunk 文件和浏览器缓存混为同一种证据，得出错误的加载结论。

**错误示例：**

```text
开发时看到了 lazy-course-panel.tsx 请求，所以正式包一定只有一个对应文件。
```

**正确写法：**

```text
开发期：记录目标源码模块何时首次请求。
正式构建：记录动态入口和实际 chunk，不预设文件数量。
结论：首次需要时才加载目标模块，不承诺固定文件名。
```

**验证方式：** 三种证据分别记录，且只对“首次需要时才加载目标模块”这一结论做归纳，不承诺固定文件名
或固定 chunk 数量。
:::

## 七、源码推导与适用场景

### 1. 官方事实

1. React 的 `lazy` 公共合同包括 loader 的延迟调用、Promise 与解析结果缓存、`default` 导出要求和
   模块顶层声明约束。
2. lazy 组件 pending 时需要 Suspense fallback；Promise rejection 进入 Error Boundary，不是 fallback
   的另一种文案状态。
3. React 树中的组件身份决定 State 是否保留；模块结果缓存不改变实例卸载和重建规则。

### 2. 开发期与正式构建

1. 开发服务器可以按浏览器当前需要的原生 ESM 模块提供源码，所以首次走到动态分支时通常能观察到
   目标模块请求；没有走到分支时不能把目标模块请求算作已加载。
2. 正式构建把动态 `import()` 作为异步入口参与 chunk 生成，可能抽取共享依赖、合并文件或插入异步
   其他构建优化。文件数量、名称和请求顺序不是 `lazy` 的公共合同。
3. 因此“按需加载”的可靠结论是：目标模块没有在未使用时进入初始负载，第一次需要它时才有对应的
   动态入口工作；不要把某个开发请求或固定文件名升级为通用保证。

### 3. 适用场景

1. 适合首次进入、明确展开或低频使用的较大区域，并且该区域可以用清楚的默认导出模块表达。
2. 首屏必需内容、极小组件和总是同时出现的组件通常不值得单独拆分，应先看真实加载路径和用户等待。
3. 需要保留草稿时，把 State 放在仍然挂载的父级，或让组件继续留在树中；需要重置时使用条件移除或
   `key`，不要误用模块重新加载来清空 State。

### 4. 关联边界

Suspense 的嵌套边界、reveal 顺序和已显示内容保护属于 Suspense 本身的独立问题；本课只使用一个最小
fallback 说明 lazy pending 的必要承载。网络业务数据、路由加载器、服务端渲染和资源缓存
不属于 `lazy` 的基本代码分割合同。

## 八、练习

:::exercise
### 练习目标

**要求：** 把 Demo 的 `showPanel` 改成两个互斥标签，并保持 `LazyCoursePanel` 的声明位于模块顶层。
冷进入时 loader 计数应为 `0`；切到面板标签后 loader 只调用一次；修改局部版本、切到另一个标签再切回，
局部版本回到 `0`，loader 计数仍为 `1`。说明为什么“模块已经缓存”不能推出“组件实例 State 被保留”。

**验收：** 能用交互结果区分模块 Promise 缓存和组件实例卸载；父组件无关更新不会重新创建顶层 lazy
类型；目标模块仍然通过默认导出进入 Suspense。
:::

:::exercise
### 练习二：检查默认导出合同

**要求：** 把目标模块改成只提供具名导出，记录首次 render 时发生的结果；再把它改回默认导出，并为
组件 Props 增加一个必填字段。说明 TypeScript 能检查哪一部分，React 运行时又依赖哪一部分。

**验收：** 能指出 `.default` 缺失导致的组件类型问题，并能让恢复后的默认导出通过类型检查和渲染。
:::

:::exercise
### 练习三：区分隐藏和卸载

**要求：** 给 Demo 增加一个 `hidden` 版本的开关，让面板保持挂载；分别修改局部版本后使用条件移除和
`hidden`，比较两次重新显示的 State 与 loader 次数。

**验收：** 条件移除会重置局部 State，`hidden` 会保留局部 State；两条路径的 loader 次数都不会因为
组件实例变化而增加。
:::

:::exercise
### 练习四：建立固定导入映射

**要求：** 为两个固定报告面板写出字面量动态导入映射，禁止拼接用户输入；为每个面板提供默认导出，
并说明为什么映射解决了模块集合不可预测的问题，但仍然需要稳定的组件边界和 Suspense。

**验收：** 每个导入 specifier 都是静态字符串，目标模块类型合同清楚，未引入任意路径导入。
:::

:::exercise
### 练习五：区分开发与正式证据

**要求：** 记录冷进入、首次显示和再次显示三个时刻的目标模块请求，再阅读正式构建的动态入口清单。
分别写出能证明的结论和不能证明的结论，特别是文件名称、chunk 数量和共享依赖。

**验收：** 能把开发期请求、正式 chunk 和浏览器缓存分开描述，不把某个工具版本的产物形态当作 React 合同。
:::

## 九、本节小结

- `lazy` 声明本身不加载模块；第一次尝试 render 才执行 loader。
- 真实动态 `import()` 的解析结果要提供默认导出，React 会缓存正常 Promise 路径的结果。
- 隐藏 lazy 组件会卸载实例，重新显示时局部 State 从初值开始；这和模块缓存是两件事。
- `lazy` 放在模块顶层，Suspense 只负责 pending fallback；失败恢复另有边界。
- 固定动态导入更容易形成清晰的模块边界；chunk 名称、数量和共享依赖由构建工具决定。
- 选择代码分割对象要看真实使用时机、模块体积和等待路径，不能把所有组件机械改成 lazy。

## 十、参考资料

- [lazy](https://react.dev/reference/react/lazy) - loader 时机、缓存、默认导出与声明位置。
- [Suspense](https://react.dev/reference/react/Suspense) - 挂起时的 fallback 语义。
- [Vite Why Vite](https://vite.dev/guide/why#the-origins) - 开发期原生 ESM 模块服务。
- [Vite Dynamic Import](https://vite.dev/guide/features#dynamic-import) - 动态导入的构建边界与加载优化。
- [Vite Backend Integration](https://vite.dev/guide/backend-integration) - 正式构建动态入口清单。
- [Vite Build](https://vite.dev/guide/build#chunking-strategy) - chunk 策略和共享依赖边界。
