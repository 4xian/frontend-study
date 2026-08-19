# `hydrateRoot` 与标记一致性研究记录

## 研究范围与版本

本记录只核验 `react.core.learn.advanced.hydrate-root-markup-identity`：匹配 HTML、
`hydrateRoot` 参数与 options、mismatch 后果、错误回调、Root 生命周期，以及隔离静态 fixture 的
可观察边界。

- React 文档基线：`19.2`
- React / React DOM 运行时：`19.2.8`
- React `v19.2.8` tag 与 `react-dom@19.2.8` npm `gitHead`：
  `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- 固定 React 文档快照：
  `reactjs/react.dev@383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`
- 本地类型基线：`@types/react@19.2.18`、`@types/react-dom@19.2.4`
- 核验日期：`2026-08-18`

完整 SSR 流水线、streaming、selective hydration、Suspense hydration、Server Components、全
`document` hydration 和框架集成不进入本记录。固定源码与测试只说明 `19.2.8` 当前 patch，不能把
Fiber、hydration exception、错误队列或内部函数名升级为公共 API。

## 结论摘要

1. `hydrateRoot(domNode, reactNode, options?)` 从 `react-dom/client` 导入，用于把 React 连接到已经
   存在且由同一 React 树生成的 HTML；没有既有 React HTML 的纯客户端容器应使用 `createRoot`。
2. `reactNode` 的首次客户端输出必须与已有 HTML 相同。React 官方把 mismatch 定义为应修复的 bug，
   不保证属性差异会被修补；最坏情况下，事件处理可能连接到错误元素。
3. 公开 options 包含 `onCaughtError`、`onUncaughtError`、`onRecoverableError` 和
   `identifierPrefix`。前三者按错误是否被 Error Boundary 捕获、未捕获或被 React 自动恢复分流；
   `identifierPrefix` 用于避免多 Root 的 `useId` 冲突，并且客户端必须使用与服务端相同的前缀。
4. React Reference 没有把 mismatch 定义成“可恢复 mismatch / 不可恢复 mismatch”两种公开类型。
   它只承诺 React 能从部分 hydration error 恢复。`onRecoverableError` 也不等于“所有 mismatch”。
5. React DOM `19.2.8` 对文本或结构 mismatch 的当前实现会中止对应 hydration，先排入 hydration
   error；强制客户端 render 成功后才升级为 recoverable error 并调用对应 handler。属性差异则可能只
   形成开发环境 warning，且不保证修补或进入 `onRecoverableError`。这些是固定 patch 的旁证，不是
   新的公共分类。
6. 匹配 hydration 的有效观察需要同时证明已有 DOM Node 被当前 patch 认领，以及 React 事件和
   State 更新已经接管。只看最终文字不变，不能排除客户端重建或根本没有接管。
7. hydration 完成后，`root.render` 可以更新 Root；组件树结构匹配时 React 会保留 State。若在
   hydration 完成前调用，React 会清空已有 HTML 并把整棵 Root 切换为客户端渲染。
8. `root.unmount()` 卸载整棵树、移除该树的事件处理和 State，并让 React 停止管理容器；返回
   `undefined`。卸载后的 Root 不能再次 `render`。
9. 本项目用可信静态 HTML 作为 iframe `srcDoc`，让浏览器先构造独立 `about:srcdoc` Document，再
   从父页面 hydrate 其中的目标元素。它只模拟“客户端面对预存标记”，不能声称执行了 React SSR。

## 一手来源

| 编号 | 一手来源 | 固定范围 | 支撑事实 |
| --- | --- | --- | --- |
| S1 | [React `hydrateRoot` Reference](https://react.dev/reference/react-dom/client/hydrateRoot) | React 文档 `19.2` | 公开签名、参数、四个 options、匹配要求、Root 生命周期与错误回调。 |
| S2 | [固定 API 与 caveats](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react-dom/client/hydrateRoot.md#L21-L59) | `react.dev@383a1e923...` | attach、三个错误回调、`identifierPrefix`、首次输出一致、属性差异与 `createRoot` 边界。 |
| S3 | [固定 `root.render` / `root.unmount`](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react-dom/client/hydrateRoot.md#L63-L118) | `react.dev@383a1e923...` | 过早 render 的整根客户端切换；unmount 的 detach、返回值与禁止再次 render。 |
| S4 | [固定 hydration 用法与 mismatch pitfall](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react-dom/client/hydrateRoot.md#L124-L200) | `react.dev@383a1e923...` | 先显示 HTML、再接上逻辑；常见 mismatch 原因；React 只从部分错误恢复。 |
| S5 | [固定 mismatch escape hatch](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react-dom/client/hydrateRoot.md#L237-L324) | `react.dev@383a1e923...` | `suppressHydrationWarning` 只作用一层且不修补文本；双 pass 仍要求首轮匹配。 |
| S6 | [固定 hydrated Root 更新与错误上报](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react-dom/client/hydrateRoot.md#L330-L449) | `react.dev@383a1e923...` | hydration 后相同树结构保留 State；三个回调共同构成自定义错误上报。 |
| S7 | [React `v19.2.8` tag](https://api.github.com/repos/facebook/react/git/ref/tags/v19.2.8)、[React DOM npm 元数据](https://registry.npmjs.org/react-dom/19.2.8)、[`@types/react-dom@19.2.4` 客户端声明](https://unpkg.com/@types/react-dom@19.2.4/client.d.ts) | React DOM `19.2.8`、类型包 `19.2.4` | tag commit 与 npm `gitHead` 固定运行时提交；类型声明固定 `HydrationOptions`、三种 handler 的参数和 `Root` 形状。 |
| S8 | [`hydrateRoot` 固定入口](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/client/ReactDOMRoot.js#L274-L357) | React DOM `v19.2.8` | 读取 prefix 与三个错误回调，创建 hydration container，标记容器并接入事件系统。 |
| S9 | [Root render / unmount 固定实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/client/ReactDOMRoot.js#L107-L168) | React DOM `v19.2.8` | render 更新当前内部 Root；unmount 同步提交 `null`、清除 Root 引用并取消容器标记。 |
| S10 | [匹配节点的固定实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHydrationContext.js#L247-L299) | React `v19.2.8` | 匹配 host element / text 时认领现有 instance；匹配失败时不继续此认领路径。 |
| S11 | [mismatch hydration error 排队](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHydrationContext.js#L369-L402)、[升级 recoverable 与 DEV-only warning](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHydrationContext.js#L837-L899) | React `v19.2.8` | mismatch 先进入 hydration error 队列；客户端恢复成功后才升级为 recoverable。成功 hydration 后仍可能单独输出属性差异 warning。 |
| S12 | [hydration error 的固定恢复路径](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberThrow.js#L552-L605) | React `v19.2.8` | 当前 patch 可放弃最近 Suspense 边界或整根 hydration，转为客户端 render；原错误可放在 `cause`。 |
| S13 | [`onRecoverableError` 固定调用点](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberWorkLoop.js#L4086-L4113) | React `v19.2.8` | 当前 commit 流程处理 recoverable errors 时逐项调用 Root handler，并提供 component stack。 |
| S14 | [匹配标记与事件的官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactServerRenderingHydration-test.js#L103-L125) | React DOM `v19.2.8` | 匹配 markup 保持不变、hydration 后事件可用、unmount 后容器清空。 |
| S15 | [现有 form Node 被认领的官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactServerRenderingHydration-test.js#L757-L790) | React DOM `v19.2.8` | 用例保存 hydration 前 form，并断言 React ref 指向同一对象。 |
| S16 | [mismatch 自定义回调官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFizzServer-test.js#L2345-L2359) | React DOM `v19.2.8` | 当前 patch 的 mismatch 强制客户端 render 成功后调用显式注册的 `onRecoverableError`。 |
| S17 | [hydration 错误恢复官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFizzShellHydration-test.js#L424-L583) | React DOM `v19.2.8` | hydration 中应用错误可经客户端 render 恢复，并通过 recoverable error 的 `cause` 保留原错误。 |
| S18 | [uncaught Root 错误测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactConfigurableErrorLogging-test.js#L36-L121)、[caught Root 错误测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactConfigurableErrorLogging-test.js#L129-L187) | React `v19.2.8` | Error Boundary 外、内的 render error 分别进入 uncaught / caught Root 回调。 |
| S19 | [WHATWG `iframe srcdoc`](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-srcdoc) | HTML Living Standard | `srcdoc` 值用于构造独立 iframe `Document`，其 URL 匹配 `about:srcdoc`。 |
| S20 | [WHATWG `contentDocument`](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#dom-iframe-contentdocument)、[`sandbox` origin](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-sandbox) | HTML Living Standard | `contentDocument` 只在同源时返回 Document；没有 `allow-same-origin` 的 sandbox 会强制 opaque origin。 |

外部候选 URL 先由 Tavily 定位，再回到以上 React 官方页面、固定 GitHub 文件、npm 元数据和 WHATWG
标准核验。开发 warning、测试名称、内部异常、Fiber 字段与完整错误 message 都不承担跨版本 API
证明。

## React 19.2 公开合同

### `hydrateRoot` 参数与 options

公开签名是：

```tsx
import { hydrateRoot } from 'react-dom/client'

const root = hydrateRoot(container, <App />, {
  identifierPrefix: 'embedded-status-',
  onCaughtError: recordCaughtError,
  onUncaughtError: recordUncaughtError,
  onRecoverableError: recordRecoverableError,
})
```

| 输入 | 公开语义 |
| --- | --- |
| `domNode` | 已包含 React 生成 HTML 的 DOM element。官网还展示了整个 `document` hydration，但本记录不展开。 |
| `reactNode` | 用于生成现有 HTML 的同一 React node，通常是 `<App />`。 |
| `onCaughtError` | React Error Boundary 捕获错误时调用，参数是错误与含 `componentStack` 的 `errorInfo`。 |
| `onUncaughtError` | 错误未被 Error Boundary 捕获时调用，参数同样包含 `componentStack`。 |
| `onRecoverableError` | React 自动从错误中恢复时调用；部分错误会把原始原因放在 `error.cause`。 |
| `identifierPrefix` | 为 `useId` 生成的 ID 加前缀，避免同页多 Root 冲突；客户端值必须与服务端相同。 |

本地 `@types/react-dom@19.2.4` 让 `hydrateRoot` 接受 `Element | DocumentFragment | Document`，并返回只含
`render(children): void` 与 `unmount(): void` 的 `Root`。三个 handler 的 `error` 都是 `unknown`，但
`errorInfo` 不是完全相同的类型：

- `onUncaughtError` 接收 `{ componentStack?: string }`；
- `onRecoverableError` 接收 `ErrorInfo`，其中 `componentStack?: string`；
- `onCaughtError` 还可接收可选的 `errorBoundary?: React.Component<unknown>`。

因此 `componentStack` 必须按可选值处理，不能假设总有字符串；`errorBoundary` 也只属于当前类型包对
caught handler 的补充，React 19.2 Reference 没有把它列为三个回调共有字段。

同一 `HydrationOptions` 还声明了 `formState?: ReactFormState | null`，固定 `19.2.8` 入口也读取该字段（S7-S8）；
但 React 19.2 `hydrateRoot` Reference 没有把 `formState` 列入公开 options。类型和内部入口存在不足以把
它升级为公开教学合同，因此本课不传入、不演示，也不要求学习者识别 `formState`。

`identifierPrefix` 不是任意 DOM `id` 前缀，也不能修复其他 markup mismatch。它只参与 React 的
`useId` 生成协议。服务端生成和客户端 hydration 必须共享同一值；只在客户端补 prefix 本身会破坏
一致性。

### HTML 一致性

React 把 hydration 定义为把组件逻辑连接到既有 HTML，并接管容器内后续 DOM 管理。首次客户端
render 的 element 类型、属性、文本和树结构必须与生成 HTML 时一致。

官方列出的常见错误包括：

- Root 内 React HTML 周围多出换行或空白文本；
- render 期间用 `typeof window !== 'undefined'` 走不同分支；
- render 期间读取 `window.matchMedia` 等浏览器专用 API；
- 服务端和客户端使用不同数据。

固定 `19.2.8` 的诊断还列出 `Date.now()`、`Math.random()`、locale 格式差异、未传输的外部变化数据、
无效 HTML 嵌套，以及扩展程序在 React 加载前修改 DOM。这些内容来自当前诊断实现，不应把完整文字或
顺序冻结成 API。

`suppressHydrationWarning` 只是单层逃生口。React 明确说它不会尝试修补被 suppress 的不一致文本，
因此不能用它证明 markup 已匹配。确实需要双端不同内容时，官方方案仍是让第一次客户端 render 匹配，
再在 Effect 中触发第二次 render；代价是额外同步 pass 和可能突兀的视觉变化。

### Root 生命周期

`hydrateRoot` 本身返回 Root，不需要像 `createRoot` 那样再做一次初始 `root.render`。

hydration 完成后：

- 组件通常通过 State 更新；直接调用 `root.render` 并不常见；
- `root.render(nextReactNode)` 返回 `undefined`；
- 若下一棵组件树结构与原树匹配，React 会保留 State；身份变化仍服从普通 reconciliation 规则。

hydration 完成前调用 `root.render` 是另一条路径：React 会清空既有 HTML，并把整棵 Root 切换为
客户端渲染。这不是“加速 hydration”，也不应被记录成成功接管已有标记。

`root.unmount()` 会卸载 Root 内全部组件、detach React、移除该树的事件处理和 State，并返回
`undefined`。若宿主代码将移除 Root 容器或其祖先，应先调用 `unmount`，否则组件可能没有机会 cleanup
订阅等资源。卸载后的 Root 不能复用；再次 `render` 必须抛错，但不把精确 message 作为长期合同。

## Mismatch 与错误通道

### 不建立公开二元分类

React 19.2 Reference 的准确措辞是“React 从部分 hydration errors 恢复”。因此研究结论不能写成
“所有 mismatch 都可恢复”，也不能创造“recoverable mismatch / unrecoverable mismatch”枚举。

可以区分的是可观察结果：

| 场景 | React 19.2 公开结论 | React DOM `19.2.8` 旁证 |
| --- | --- | --- |
| 首次 HTML 匹配 | React 连接逻辑并接管 DOM。 | 当前 patch 认领既有 host instance；测试观察到既有 markup 保持且事件生效。 |
| 属性差异 | 开发环境会 warning；不保证修补。 | 当前 patch 可完成 hydration 后再输出 DEV-only 属性 diff；不应承诺 recoverable callback。 |
| 文本或结构无法认领 | mismatch 是 bug；React 只能从部分 hydration errors 恢复。 | 当前 patch 中止受影响 hydration 并排队 recoverable error；本课无 Suspense 输入会转为整根客户端 render。 |
| 客户端重试本身再次抛错 | 由通用 Error Boundary / Root 错误语义决定。 | 当前 patch 进入 caught 或 uncaught 路径；这不是一种新的 mismatch 类型。 |

“旧 DOM 子树无法继续 hydration”与“React 应用完全无法恢复”不是同一件事。`19.2.8` 的文本/结构
mismatch 可以让旧子树放弃 hydration，却仍由 React 通过客户端重建恢复，因此进入
`onRecoverableError` 并不矛盾。

### 三个回调的可观察合同

三个回调应按触发边界记录，不按 message 猜测：

| 通道 | 触发边界 | 不代表 |
| --- | --- | --- |
| `onRecoverableError` | React 已自动恢复的错误；固定 patch 的文本/结构 hydration mismatch 是一个例子。 | 所有 hydration warning、所有 mismatch，或“DOM 已被可靠修补”。 |
| `onCaughtError` | render 等错误被 Error Boundary 捕获。 | hydration mismatch 专属通道。 |
| `onUncaughtError` | 错误没有被 Error Boundary 捕获。 | “不可恢复 mismatch”枚举值。 |

当前 TypeScript 声明把 handler 的 `error` 参数写成 `unknown`。记录前必须先用
`error instanceof Error` 归一化；Error 值可读取 `name`、`message` 和可选 `cause`，非 Error 值只保存
`String(error)`。三个 handler 都可安全记录通道、触发场景、归一化名称与消息、
`errorInfo.componentStack ?? ''`，以及 cause 是否存在；caught 通道若记录 `errorBoundary`，也只能把它
作为当前类型的可选补充，不能要求另外两个通道提供。

开发构建可给出完整诊断和 diff，生产构建可能使用压缩错误码；component stack 格式、message 全文和
同一场景的精确回调次数都不是跨构建稳定合同。提供某个自定义 callback 会替换该通道的默认 handler，
不应泛化成一个 callback 替换全部错误通道。因此 console 是否出现默认日志不能单独证明回调有没有
执行；开发环境的属性 mismatch warning 也不能被 console 观察误判成 `onRecoverableError`。

## React DOM 19.2.8 源码与测试旁证

### 匹配节点

固定入口把 `identifierPrefix` 和三个自定义错误回调传给 hydration Root，并在容器上接入 React 事件
系统（S8）。hydration context 找到匹配 host element 或 text 时，把现有 instance 关联到当前 Fiber
（S10）。官方测试还分别观察到：

- 匹配 HTML 的 `innerHTML` 保持，React ref 上的节点能响应 click，unmount 后容器为空（S14）；
- 预先保存的 form Node 与 hydration 后 React ref 指向同一对象（S15）。

这些证据支持在固定 patch 的 Demo 中比较 Node 对象身份；公共 API 仍只承诺 attach 到既有 HTML，
不能外推为任意输入、任意未来版本的“所有节点身份永不变化”。

### mismatch 路径

`19.2.8` 对无法认领的 element / text 调用内部 mismatch 路径，创建诊断 error、排入 hydration error
队列，并抛出仅供 React 内部控制流使用的异常（S11）。固定源码还包含本课不展开的 Suspense 分支；在
本课无 Suspense 的 fixture 中，恢复逻辑放弃整个 Root 的 hydration 并转为客户端 render（S12、S16）；
提交完成后 recoverable 队列才交给 Root handler（S13）。

另一方面，host instance 已认领但 props 有差异时，当前源码可以只积累 development diff；若 hydration
没有抛错，末尾再输出 warning（S11）。因此“控制台出现属性 diff”不能推出“React 已调用
`onRecoverableError`”，也不能推出 DOM 属性已经被改成客户端值。

内部 `HydrationMismatchException`、`ForceClientRender`、错误队列和 Fiber `stateNode` 只用于解释当前
源码。代码示例、课程判断题和 Demo UI 都不应要求使用或识别这些名字。

### Root 结束

固定实现让 hydration Root 与普通 Root 共享 `render` / `unmount` 方法。`unmount` 会清空内部 Root
引用、同步提交 `null`，再移除容器 Root 标记；旧 Root 的 `render` 因内部引用为空而抛错（S9）。这与
公开 Reference 的 detach 和不可复用合同一致，但同步实现细节与当前错误文字仍只属于 `19.2.8`。

## 本项目隔离 Demo 决策

### 静态输入来源

Demo 采用一个仓库内可信、无脚本的静态 HTML 文件，通过 `?raw` 导入后设置为 iframe `srcDoc`。
WHATWG 规定该值用于构造独立 iframe `Document`，其 URL 匹配 `about:srcdoc`（S19）。

该方案满足以下边界：

1. iframe `load` 完成后，目标 Root、标题和按钮已经由 HTML parser 建立；之后才取得
   `contentDocument` 并调用 `hydrateRoot`。
2. 保存 hydration 前的 target 和按钮 Node，不能给 target 写 `innerHTML`、`outerHTML`，也不能调用
   `insertAdjacentHTML` 或 `document.write` 来伪造预存输入。
3. fixture 不接受 URL、Markdown 或用户输入插值；它不是任意 HTML 运行容器。
4. 父页面从同源 iframe 取得目标 Element。若引入会使 iframe 成为 opaque origin 的 sandbox，父侧
   读取 `contentDocument` 的方案就不成立。
5. `srcDoc` 只证明浏览器先拥有一份 React-compatible 静态快照，再由客户端 React 接管；它没有调用
   `react-dom/server`，不能称为真实服务端产物。

fixture 的 element、属性、文本和顺序保持确定，不使用时间、随机数、locale、浏览器能力探测或外部
数据。动态计数用单一文本表达式，避免 JSX 相邻文本产生的注释标记与手写 HTML 不同：

```tsx
<button type="button" onClick={() => setCount(value => value + 1)}>
  {`计数：${count}`}
</button>
```

对应静态标记是 `<button type="button">计数：0</button>`。还要避开无效嵌套和会被 HTML parser 自动
补写结构的标记，否则“源码看起来一样”不等于浏览器构造后的 DOM 一样。

### `identifierPrefix` 的 Demo 边界

静态 hand-authored fixture 不硬编码 React `useId` 的内部字符串格式，也不把 `identifierPrefix` 写成
无效的装饰性 option 后声称已经验证。A18 解释其公开用途和“服务端、客户端相同”要求；真正观察
prefix 需要由同版本 React 服务端 API 生成含 `useId` 的 HTML，这超出当前静态 fixture 的证明范围。

因此默认 fixture 不使用 `useId`。这不会删除 `identifierPrefix` 的 API 讲解，只是避免用手写内部 ID
冒充官方生成协议。

### 场景与观察

每个场景使用全新 iframe Document 和全新 Root，防止 mismatch 或 uncaught error 污染后续观察。

| 场景 | 触发 | 稳定观察 |
| --- | --- | --- |
| 匹配接管 | 静态 HTML 与首次 React 输出相同。 | hydration 前点击不改变计数；hydrate 后同一按钮对象响应 React `onClick`，三类错误记录为空。 |
| 文本 mismatch | 首次 React 标题与静态标题故意不同。 | `19.2.8` 至少记录一个 recoverable 通道，caught / uncaught 为空；不把最终 DOM、替换范围或精确 message 当合同。 |
| Boundary 捕获 | 先完成匹配 hydration，再由 State 更新让 Boundary 内 child 在 render 抛错。 | caught 通道出现、Boundary fallback 可见，另外两通道为空。 |
| Root 未捕获 | 先完成匹配 hydration，再由 State 更新让 Boundary 外 child 在 render 抛错。 | uncaught 通道出现，另外两通道为空；不冻结出错后的 DOM 形态。 |
| hydration 后更新 | 先点击把计数变为 `1`，再以相同组件结构调用 `root.render` 更新普通 prop。 | prop 更新出现，组件 State 仍为 `1`；这与 hydration 完成前的早调用分开说明。 |
| 卸载 | 匹配 hydration 和一次交互后调用 `root.unmount()`。 | 返回 `undefined`、容器为空、旧按钮不再连接、Effect cleanup 已发生、旧 Root 再 render 抛错。 |

caught / uncaught 场景必须让组件在 render 阶段抛错，而不是直接从 event handler 抛错。事件处理器只
更新 State，下一次 render 再触发错误，才能与 Error Boundary 和 Root 回调的公开语义对齐。

早于 hydration 完成的 `root.render` 只作为错误用法说明。若专门观察它，结果必须标记为“已有 HTML
被清空并切换到客户端渲染”，不能计入匹配接管证据。

### 生命周期所有权

场景切换、组件卸载或父 Vue 页面离开时，先对仍存活的 React Root 调用 `root.unmount()`，再移除
iframe。只移除 iframe 会绕过 React 的显式 Root 结束协议，也无法可靠说明 Effect 已 cleanup。

匹配场景的直接证据是：

```text
hydration 前保存的按钮 Node === hydration 后 React ref.current
```

该等式还必须配合同一 Node 的 React click / State 更新。只证明对象相同，不能证明事件已经接管；只
证明文字改变，也不能排除节点被客户端重建。

## 最终判断

- 正确路径是“已有 React HTML 与首次客户端输出一致 -> `hydrateRoot` 接管 -> State 或 hydration 后
  `root.render` 更新 -> 宿主移除前 `root.unmount`”。
- mismatch 是需要修复的输入 bug；recoverable callback 是观测 React 已恢复错误的通道，不是自动
  修补许可。
- 属性 warning、recoverable error、Boundary caught error 和 Root uncaught error 是不同观察边界，
  不能用一条 console 日志或一套精确 message 规则混在一起。
- 静态 `srcDoc` fixture 能隔离客户端 hydration 机制，但不能冒充真实 SSR；`identifierPrefix` 的完整
  可观察证明也不能靠手写 React 内部 ID 完成。
