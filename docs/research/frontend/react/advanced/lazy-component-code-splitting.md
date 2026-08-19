# `lazy` 组件代码分割官方调研

> 核验日期：2026-08-17
> 文档基线：React 官方文档 19.2
> 仓库基线：`react@19.2.8`、`react-dom@19.2.8`、`@types/react@19.2.18`、
> `@types/react-dom@19.2.4`
> 构建依赖背景：`vite@8.1.5`、`@vitejs/plugin-react@6.0.5`（仅记录锁定版本，不作为 React 合同）

## 调研范围

本文按本科层级只研究 React `lazy` 的稳定公共合同及其直接边界：动态 `import()`、loader Promise、默认导出、
缓存、Suspense、加载失败和重试。代码分块的文件数量、文件名和网络调度由构建工具或
框架决定，不属于 React `lazy` 的公共保证。

## 核心结论

1. `lazy(load)` 返回一个可渲染的 React 组件类型。调用 `lazy` 时不会执行 `load`；第一次尝试渲染
   这个类型时，React 才调用无参数的 `load`。
2. `load` 必须返回 Promise 或 thenable，解析值必须是含有有效 React 组件类型 `.default` 的对象。
3. `lazy(() => import('./Panel'))` 是官方标准写法。`import()` 负责异步取得模块；是否形成独立 chunk
   取决于构建工具或框架，React 自身不生成 chunk。
4. React 会缓存该 lazy 类型的 loader Promise 和解析结果，并保证不再调用同一个 `load`。
5. Promise pending 时，渲染会挂起，由最近的 Suspense 边界显示 `fallback`；Promise rejected 时，
   rejection 会被抛给最近的 Error Boundary。Suspense 不是错误处理边界。
6. 同一个 lazy 类型在加载失败后没有内建自动重试。React 19.2.8 源码会保存 rejected 状态，后续渲染
   继续抛出已保存的错误；只重置 Error Boundary 或更换组件 `key` 不会清空这个 lazy 载荷。

## `lazy(load)` 的合同

仓库类型声明将签名表达为：

```ts
function lazy<T extends ComponentType<any>>(
  load: () => Promise<{ default: T }>,
): LazyExoticComponent<T>
```

这段签名与官方文档共同确定了四件事：

- `load` 不接收参数。
- `load` 返回 Promise；运行时文档还允许其他具有 `then` 方法的 thenable。
- Promise 解析值不是组件本身，而是 `{ default: 组件类型 }` 形状的对象。
- 返回的 `LazyExoticComponent<T>` 可以像普通组件一样接收由 `T` 推导出的 props。

官方推荐把 lazy 声明放在模块顶层：

```tsx
import { lazy, Suspense } from 'react'

const SettingsPanel = lazy(() => import('./SettingsPanel'))

export default function App() {
  return (
    <Suspense fallback={<p>正在加载...</p>}>
      <SettingsPanel userId="42" />
    </Suspense>
  )
}
```

不要在组件函数内调用 `lazy`。组件每次渲染都会创建新的 React 组件类型，React 会把它视为不同身份，
从而重置其子树 State；这也破坏了“一个稳定 lazy 类型对应一个缓存载荷”的基本模型。

## 动态 `import()` 与默认导出

静态导入会在模块求值时建立依赖：

```tsx
import SettingsPanel from './SettingsPanel'
```

标准 lazy 写法把动态 `import()` 放进 loader：

```tsx
const SettingsPanel = lazy(() => import('./SettingsPanel'))
```

React 第一次尝试渲染 `SettingsPanel` 时才调用 loader，因而也在此时才求值这个 `import()` 表达式。
React 官方文档明确提醒：动态 `import()` 需要构建工具或框架支持。因此可以把 React 的保证写成
“延后调用 loader”，不能写成“React 必然生成一个独立文件”或“一个 import 必然对应一个 chunk”。

目标模块的直接写法是默认导出组件：

```tsx
export default function SettingsPanel({ userId }: { userId: string }) {
  return <section>用户：{userId}</section>
}
```

只有具名导出时，可以显式适配成 `.default` 形状：

```tsx
const SettingsPanel = lazy(() =>
  import('./SettingsPanel').then((module) => ({
    default: module.SettingsPanel,
  })),
)
```

这个适配满足 `lazy` 合同，但会增加一层模块约定。没有其他理由时，独立 lazy 组件使用默认导出更
直接。`.default` 必须是有效 React 组件类型；官方列举的有效类型包括函数组件、`memo` 组件和
`forwardRef` 组件。

## 缓存的准确含义

官方文档承诺 React 缓存 loader 返回的 Promise 和 Promise 的解析值，因此同一个 lazy 类型的
`load` 不会被 React 再调用。React 19.2.8 的 `ReactLazy.js` 进一步展示了实现模型：

```text
Uninitialized -> Pending -> Resolved
                         -> Rejected
```

每次调用 `lazy(load)` 都会创建一个新的 payload。第一次初始化时 payload 保存 thenable；成功时改为
保存模块对象，失败时改为保存错误。之后初始化器直接返回 `moduleObject.default`，或者抛出已保存的
thenable/错误。

需要区分三件事：

- **React lazy 缓存**：绑定到一次 `lazy(load)` 返回的组件类型，缓存 loader Promise 和结果。
- **模块加载器或构建工具缓存**：属于 JavaScript 运行环境和工具链，不是 `lazy` 文档给出的 React
  合同。
- **组件 State**：由组件在 React 树中的身份与挂载位置决定，不等于模块是否已经加载。

因此，重复调用 `lazy` 创建两个类型，不应解释为“共享同一个 React lazy 缓存”。即使底层模块系统
可能复用同一模块，两个 lazy 类型仍各有自己的 React payload。

## 与 Suspense 的配合

lazy loader 尚未完成时，尝试渲染 lazy 组件会挂起。最近的 Suspense 边界把其 `children` 替换为
`fallback`，资源就绪后 React 重试该子树并显示实际组件：

```text
尝试渲染 lazy 组件
  -> loader pending：挂起 -> 最近的 Suspense 显示 fallback
  -> loader resolved：读取 module.default -> 重试并渲染组件
  -> loader rejected：抛出 rejection -> 最近的 Error Boundary 处理
```

`fallback` 表达“内容尚未就绪”，不是“加载失败”。如果需要同时呈现等待状态和失败状态，应分别使用
Suspense 与 Error Boundary。官方还明确指出，普通 Effect 或事件处理器中的异步请求不会自动激活
Suspense；不要把任意 `isLoading` 条件渲染混同为 `lazy` 的挂起机制。

首次挂载尚未成功就挂起时，React 不保留那次未提交渲染的 State；loader 完成后会从头重试该树。
这条规则属于 Suspense 的挂载语义，不表示已成功挂载的组件 State 会被 lazy 模块缓存。

## 错误与重试边界

| 状态 | React 行为 | 应由谁提供 UI |
| --- | --- | --- |
| Promise pending | 抛出 thenable，使渲染挂起 | 最近的 Suspense `fallback` |
| Promise resolved | 读取解析值的 `.default` 并渲染 | lazy 组件本身 |
| Promise rejected | 抛出 rejection reason | 最近的 Error Boundary |
| 解析值缺少有效 `.default` | 无法得到有效组件类型 | 开发期警告或后续渲染错误 |

React 的公共 `lazy` API没有“清空缓存”“再次调用 loader”或“重试”方法。React 19.2.8 源码在 rejected
状态保存错误，后续初始化直接再次抛出该错误。由此可得：

- Error Boundary 可以替换失败 UI，但仅重置 Error Boundary 会再次遇到同一个 rejected lazy payload。
- 改变 lazy 组件元素的 `key` 只改变组件实例身份，不会创建新的 lazy 类型，也不会重置其 payload。
- 真正的再次加载需要新的 lazy 类型和新的 loader Promise，或由框架、页面刷新等外部机制重新建立
  模块加载过程；具体策略不属于 `lazy` 的稳定公共合同。

不要为了重试把 `lazy()` 移进组件 render。那会在普通重渲染时也不断创建新类型，并造成 State
重置。需要产品级重试时，应把“何时创建和替换新类型”设计为独立、可验证的应用逻辑。

## 常见误解

### 1. 把声明 lazy 类型当作开始加载

- **错误名称：** 调用 `lazy` 后立即下载目标模块。
- **触发条件：** 模块顶层执行 `const Panel = lazy(() => import('./Panel'))`，但组件树尚未尝试
  render `<Panel />`。
- **原因：** `lazy` 保存 loader；React 第一次尝试 render 该 lazy 类型时才调用 loader。
- **后果：** 错判模块请求时机，无法验证代码是否真正按需加载。
- **错误示例：**

  ```tsx
  const Panel = lazy(() => import('./Panel'))
  // 只执行这行声明就断言 Panel 已开始下载。
  ```

- **正确示例：**

  ```tsx
  const Panel = lazy(() => import('./Panel'))

  export default function App({ open }: { open: boolean }) {
    return open ? <Panel /> : null
  }
  ```

- **适用版本：** React 19.2；这是 `lazy` 的公共 API 行为。
- **来源：** React 官方 [`lazy`](https://react.dev/reference/react/lazy) 的 `load` 参数与返回值说明。

### 2. 把 lazy 当作打包器

- **错误名称：** `React.lazy` 自己生成并下载 chunk。
- **触发条件：** 使用返回普通 Promise 的 loader，或没有检查构建工具对 `import()` 的处理，却断言
  一定产生独立文件。
- **原因：** React 只控制 loader 的调用和渲染挂起；动态导入分析、chunk 划分和网络加载由 JavaScript
  运行时、构建工具或框架完成。
- **后果：** 把开发期模块请求或某次构建产物误写成 React 的稳定保证。
- **错误示例：**

  ```tsx
  const Panel = lazy(() => Promise.resolve({ default: ReportPanel }))
  // 仅凭 lazy 声明断言构建结果必有 report-panel.js。
  ```

- **正确示例：**

  ```tsx
  const Panel = lazy(() => import('./ReportPanel'))
  // 再通过当前构建工具的正式产物核对实际 chunk。
  ```

- **适用版本：** React 19.2；构建产物部分取决于当前 Vite/Rollup 版本与配置。
- **来源：** React 官方 [`lazy`](https://react.dev/reference/react/lazy)；Vite 官方
  [Dynamic Import](https://vite.dev/guide/features#dynamic-import) 与
  [Chunking Strategy](https://vite.dev/guide/build#chunking-strategy)。

### 3. 让 loader Promise 直接解析为组件函数

- **错误名称：** loader 返回组件，而不是含默认导出的模块对象。
- **触发条件：** loader 解析值写成 `ReportPanel`，没有 `{ default: ReportPanel }`。
- **原因：** React 从 fulfilled value 的 `.default` 读取组件类型；TypeScript 的 `lazy` 签名也要求
  `Promise<{ default: T }>`。
- **后果：** 类型检查失败；绕过类型后，运行时也无法取得有效组件类型。
- **错误示例：**

  ```tsx
  const Panel = lazy(() => Promise.resolve(ReportPanel))
  ```

- **正确示例：**

  ```tsx
  const Panel = lazy(() => Promise.resolve({ default: ReportPanel }))
  ```

- **适用版本：** React 19.2；类型结论对应仓库锁定的 `@types/react@19.2.18`。
- **来源：** React 官方 [`lazy`](https://react.dev/reference/react/lazy)；仓库锁定的
  `node_modules/@types/react/index.d.ts`。

### 4. 用 Suspense fallback 承接加载失败

- **错误名称：** 把 pending fallback 同时当作失败 UI。
- **触发条件：** lazy loader 被拒绝，组件外只有 Suspense，没有 Error Boundary。
- **原因：** Suspense 处理渲染期间的挂起；`lazy` 会把 loader 的 rejection reason 抛给最近的
  Error Boundary。
- **后果：** 等待 UI 无法表达失败，错误可能继续向上冒泡并替换更大的界面区域。
- **错误示例：**

  ```tsx
  <Suspense fallback={<p>加载中</p>}>
    <LazyPanel />
  </Suspense>
  ```

- **正确示例：**

  ```tsx
  <LoadErrorBoundary fallback={<p>加载失败</p>}>
    <Suspense fallback={<p>加载中</p>}>
      <LazyPanel />
    </Suspense>
  </LoadErrorBoundary>
  ```

- **适用版本：** React 19.2；Error Boundary 只接管其后代渲染路径中的错误。
- **来源：** React 官方 [`lazy`](https://react.dev/reference/react/lazy) 与
  [`<Suspense>`](https://react.dev/reference/react/Suspense)。

### 5. 把重置 Error Boundary 当作重新执行 loader

- **错误名称：** 边界恢复会让同一个 lazy 类型重新加载。
- **触发条件：** lazy loader 已 rejected，仅重建 Error Boundary 后再次 render 同一个 lazy 类型。
- **原因：** 当前 lazy 类型的 payload 已保存 rejected 状态和 rejection reason；边界重建没有创建新的
  lazy 类型。
- **后果：** 界面再次进入相同失败状态，loader 调用次数不增加，产品级“重试”实际没有发起加载。
- **错误示例：**

  ```tsx
  <LoadErrorBoundary key={boundaryVersion}>
    <LazyPanel />
  </LoadErrorBoundary>
  ```

- **正确示例：**

  ```tsx
  // 明确重新创建加载流程，或使用框架提供且已经验证的模块重试能力。
  const nextLazyType = lazy(createNextPanelLoader())
  ```

- **适用版本：** rejected payload 结论由 React `v19.2.8` 源码核验，属于当前版本实现证据；
  `lazy` 公共 API 本身没有重试方法。
- **来源：** React 官方 [`lazy`](https://react.dev/reference/react/lazy)；React `v19.2.8`
  [`ReactLazy.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactLazy.js)。

### 6. 用元素 key 清空 lazy 的模块结果

- **错误名称：** 改变 lazy 元素的 `key` 就能重新下载模块。
- **触发条件：** loader 已 resolved 或 rejected，随后只修改 `<LazyPanel key={version} />` 的 key。
- **原因：** key 改变的是这次协调中的组件实例身份；`LazyPanel` 变量仍指向同一个 lazy 类型及其 payload。
- **后果：** 组件实例 State 可能重置，但 loader 不会因此再次执行，模块结果也没有被清空。
- **错误示例：**

  ```tsx
  <LazyPanel key={version} />
  ```

- **正确示例：**

  ```tsx
  // key 只用于表达实例身份；模块重试必须替换 lazy 类型或交给经过验证的框架流程。
  <LazyPanel key={recordId} />
  ```

- **适用版本：** React 19.2；payload 结论由 React `v19.2.8` 源码核验。
- **来源：** React 官方 [`lazy`](https://react.dev/reference/react/lazy)；React `v19.2.8`
  [`ReactLazy.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactLazy.js)。

## 证据与适用边界

- 公共行为以 React 19.2 官方 `lazy` 和 `Suspense` 文档为准。
- rejected 状态和“每次 `lazy` 创建独立 payload”由 React `v19.2.8` 官方源码核验；这是当前版本
  实现证据，不应扩写为未来版本永不改变的内部结构承诺。
- TypeScript 签名以仓库锁定的 `@types/react@19.2.18` 为准。
- 仓库 `package-lock.json` 确认运行时为 `react@19.2.8`、`react-dom@19.2.8`。更换 React minor、
  renderer、类型包或构建工具后，应重新核验版本事实。

## 官方来源

- [React `lazy`](https://react.dev/reference/react/lazy) - loader 时机、Promise/解析值缓存、`.default`、
  顶层声明、Suspense 和 rejection 行为。
- [React `<Suspense>`](https://react.dev/reference/react/Suspense) - pending fallback、首次挂起重试、
  Error Boundary 之外的等待语义。
- [React `v19.2.8` `ReactLazy.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactLazy.js) -
  lazy payload 的初始化、pending、resolved、rejected 状态和错误保存。
- [`@types/react` 类型仓库](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts) -
  loader、默认导出对象与返回组件类型签名。
- 仓库锁定证据：`package.json`、`package-lock.json`、`node_modules/react/cjs/react.development.js`、
  `node_modules/@types/react/index.d.ts`。
