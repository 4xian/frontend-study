# `startTransition` 后台更新研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.advanced.start-transition-background-update`
- 标题：`startTransition` 后台更新
- 教学层级：高级
- 前置课程：`react.core.learn.advanced.use-promise-reading`
- 核验日期：`2026-08-14`
- 研究状态：已完成正文、Demo、manifest、Track、三视口 production 浏览器验收与独立复审，
  已正式发布为 `available`
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react` `19.2.18`、`@types/react-dom` `19.2.4`
- 构建基线：Vite `8.1.5`、`@vitejs/plugin-react` `6.0.5`、TypeScript `6.0.3`
- 固定文档提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`

本课只回答一条主线：当已经拿到某个 State 的 setter 时，如何在 Hook 外调用
`startTransition`，把非紧急的 State 更新标记为后台 Transition，同时让输入等紧急更新保持普通更新，
并理解后台 render 可以被更紧急的更新打断、丢弃并从最新 State 重新开始。

必须覆盖：

1. `startTransition(action)` 接受一个无参数函数；React 立即调用它，并把该函数同步安排的 State 更新
   标记为 Transition。
2. standalone `startTransition` 可以在组件和自定义 Hook 之外使用，只要调用方持有目标 State 的 setter；
   它的返回值是 `undefined`，不提供 `isPending` 或其他 pending 查询信号。
3. Transition 更新是非阻塞的后台工作。输入框自身的受控 State 必须使用普通事件更新，不能把控制输入的
   setter 放进 Transition。
4. 当 Transition render 尚未完成时，更紧急的 State 更新可以先处理；React 随后可能重启被打断的
   Transition render，使最新的 Transition 结果最终提交。
5. Transition 的标记只覆盖 `action` 执行期间的同步 State 更新。`setTimeout` 回调和异步请求完成后的
   setter 不会自动继承该标记；这些行为只作为边界说明，不进入本课 Demo。

明确排除：第 9 课 `useTransition` 与 pending Action；第 10 课 `useDeferredValue` 与 stale UI；把受控
文本输入自身放入 Transition；网络请求、远程数据或缓存；timer 驱动的“自动继承”示例；`useActionState`、
`useOptimistic`、表单 Action、Server Functions、RSC、Router 或数据层；Transition tracing、View
Transition、`addTransitionType`、实验性 API；精确的 lane 数字、调度毫秒数、每台设备必然发生的 render
丢弃次数；以及第 8 课之后的任何课程资产。

## 调研方法与来源边界

1. 依照仓库外部搜索顺位先使用 Tavily，定位 React 官方 `startTransition` Reference 与相邻
   `useTransition` Reference；搜索结果只承担候选 URL 发现和初步摘录。
2. 所有课程事实回到 React 官方 `19.2` 文档和固定 `reactjs/react.dev` 提交；当前实现旁证回到 React
   `v19.2.8` tag 对应源码和本地安装产物。没有使用博客、教程或二手文章作为证据。
3. React 官网按 `19.2` minor 维护 Reference，不存在独立的 `19.2.8` 文档站。公共 API 合同引用文档
   minor；调度上下文与 lane 选择只用于解释当前 patch 的实现，不把内部结构写成应用层保证。
4. 本地 `package.json`、`package-lock.json` 和 `node_modules` 三方版本均已只读核对；npm registry
   还确认 `react@19.2.8` 的 `gitHead` 对应固定 React commit。
5. 当前 live RC3 已核对为 `7/24 available`、`17 planned`；第 7 课研究、正文、Demo、登记和独立审查
   已闭环，第 8 课仍为 `planned`。目标研究稿创建前不存在第 8 课研究稿、正文、Demo 目录或
   entry/demo manifest 登记。
6. 本研究稿只冻结第 8 课的教学和验证边界，不授权修改正文、Demo、manifest、Track、状态文档或第 9
   课资产。

## 官方来源卡

| 编号 | 一手来源 | 版本固定 | 本课采用的事实 |
| --- | --- | --- | --- |
| S1 | [React `startTransition`](https://react.dev/reference/react/startTransition) | React 文档 `19.2` | API 参数、同步 action、非阻塞 Transition、`void` 返回、无 pending 信号、输入限制、打断/重启、timer 与 async 边界、组件外可调用。 |
| S2 | [固定 `startTransition` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/startTransition.md) | 文档提交 `c7d6b700...` | 固定本课公开文字，避免官网滚动更新无记录地改变合同。 |
| S3 | [`useTransition` Reference](https://react.dev/reference/react/useTransition) | React 文档 `19.2` | `isPending` 属于 Hook API；本课只用它划清第 9 课边界。 |
| S4 | [固定 React `ReactStartTransition.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactStartTransition.js#L45-L115) | React `v19.2.8` | 当前实现创建临时 Transition 上下文、立即执行 scope、处理返回的 thenable，并在 finally 恢复先前上下文；公开函数返回 `void`。 |
| S5 | [固定 React `ReactFiberWorkLoop.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberWorkLoop.js#L792-L835) | React `v19.2.8` | 当前 `setState` 请求更新 lane 时检测 Transition 上下文；有上下文时选择 Transition lane，否则按事件优先级选择普通 lane。 |
| S6 | [固定 React `ReactFiberRootScheduler.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberRootScheduler.js#L697-L727) | React `v19.2.8` | 同一事件中的 Transition lane 分配和复用属于当前实现；不是课程要求学习者记忆的公开 API。 |
| S7 | [固定 React `ReactFiberLane.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberLane.js#L179-L183) | React `v19.2.8` | 当前调度器优先检查同步/输入/默认更新 lane。 |
| S8 | [固定 React `ReactFiberLane.js` 的工作中断判断](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberLane.js#L341-L356) | React `v19.2.8` | 当前实现用更高优先级的下一 lane 替换正在进行的较低优先级 Transition 工作；公开合同由 S1 表述为打断并重启。 |
| S9 | [React `v19.2.8` npm 元数据](https://registry.npmjs.org/react/19.2.8) | npm 发布 `19.2.8` | `gitHead` 为 `1dd4ecbd...`，用于把安装 patch 与源码 tag 对齐。 |
| S10 | [React `v19.2.8` release](https://github.com/facebook/react/releases/tag/v19.2.8) | 发布 tag `v19.2.8` | 当前 patch 发布身份；本课不声称 `startTransition` 由该 patch 新增。 |

## 版本与类型基线

### 文档 minor 与运行时 patch

React 官网的 API Reference 使用 `19.2` minor；当前项目运行时固定到 `19.2.8`。因此本课用 S1/S2 证明
公共语义，用 S4-S8 解释这一 patch 的实现证据，不把内部 lane 名称暴露给学习者作为稳定合同。

| 包 | `package.json` | lock | install |
| --- | --- | --- | --- |
| `react` | `19.2.8` | `19.2.8` | `19.2.8` |
| `react-dom` | `19.2.8` | `19.2.8` | `19.2.8` |
| `@types/react` | `19.2.18` | `19.2.18` | `19.2.18` |
| `@types/react-dom` | `19.2.4` | `19.2.4` | `19.2.4` |
| `vite` | `^8.1.5` | `8.1.5` | `8.1.5` |
| `@vitejs/plugin-react` | `6.0.5` | `6.0.5` | `6.0.5` |
| `typescript` | `~6.0.0` | `6.0.3` | `6.0.3` |

### 当前公开类型形状

`@types/react@19.2.18` 声明 standalone API 为 `startTransition(scope: TransitionFunction): void`，并在注释中
说明它适用于 Hook 不可用的场景。应用层只需传入一个同步 action；不需要为 Transition 建立自定义
`isPending` 类型，也不能把 React 内部 Transition 对象当作公共值读取。

```tsx
import { startTransition } from 'react'

export function startBackgroundUpdate(update: () => void): void {
  startTransition(update)
}
```

上面的函数只说明调用位置和类型形状，不是本课最终 Demo 代码。最终 Demo 仍需把真实 State setter 传给
模块外的包装函数，并由组件保留普通输入 State。

## 官方事实与课程推导

### 1. `startTransition` 标记同步 State 更新

`startTransition(action)` 的 `action` 是无参数函数，React 会立即调用它；在 action 执行期间同步安排的
一个或多个 State 更新会被标记为 Transition（S1、S2）。常见形状是：

```tsx
import { startTransition } from 'react'

function selectTab(setTab: (tab: string) => void, nextTab: string): void {
  startTransition(() => {
    setTab(nextTab)
  })
}
```

`startTransition` 本身不是 Hook，也不读取组件 State；调用方必须已经持有目标 State 的 setter。S4 中
当前实现把 `ReactSharedInternals.T` 临时替换为 Transition 上下文，调用 scope，再在 finally 中恢复
之前的上下文。S5 显示，setter 请求 lane 时会检测这个上下文并选择 Transition lane。

这解释了“标记”而不是“延迟执行”：action 立即执行，setter 立即排入更新，React 再按照更新优先级
安排 render。不能把 `startTransition` 描述成一个 Promise、队列 API 或自动节流器。

### 2. 非阻塞是调度优先级，不是 pending 状态

官方称 Transition 更新为 non-blocking：在慢设备或昂贵子树重新 render 时，用户仍可继续交互（S1、S2）。
这不等于 Transition 一定异步完成，也不等于它总会显示 loading UI。standalone API 返回 `undefined`，
没有 `isPending`（S1、S2、S4）。

因此本课 Demo 可以展示已提交的选项、普通输入值和 render/commit 记录，但不能伪造一个由
`startTransition` 提供的 `pending` 布尔值。需要 pending Action 或 pending 指示器时，必须进入第 9 课
`useTransition`。

### 3. 输入 State 保持普通更新

官方明确禁止用 Transition 更新控制文本输入（S1、S2）。输入的受控 State 需要在事件中直接调用
setter，让每个键击都能及时反映在输入框；昂贵结果或视图选择可以在另一个 State 上使用
`startTransition`。

```tsx
function SearchView() {
  const [query, setQuery] = useState('')
  const [viewQuery, setViewQuery] = useState('')

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextQuery = event.target.value
    setQuery(nextQuery)
    startTransition(() => {
      setViewQuery(nextQuery)
    })
  }

  return <input value={query} onChange={handleChange} />
}
```

这段示意只表达两个更新的优先级关系：`query` 是输入控制 State，`viewQuery` 是可被昂贵子树读取的
非紧急 State。正式正文和 Demo 应使用更小的可观察例子，不把搜索网络、过滤缓存或请求竞态引入本课。

### 4. 更紧急更新可以打断并重启 Transition render

官方给出的行为是：如果图表等昂贵组件正在 Transition render，用户开始输入时，React 先处理输入
State 更新，然后重启图表的渲染工作（S1、S2）。这是“保持响应”的关键可观察结果：输入不必等待旧的
后台 render 完成，后台结果也不会把旧输入覆盖。

当前源码提供实现旁证：`requestUpdateLane` 为 Transition 选择 Transition lane（S5）；调度器选择待处理
工作时先考虑同步、连续输入和默认更新 lane（S7），发现更高优先级 lane 时会替换正在进行的较低
优先级工作（S8）。这些内部 lane 名称可能变化，课程只保留官方公开的“打断并重启”表述。

验收应观察结果关系，而非要求固定 render 次数：

```text
普通输入更新提交 -> 输入值立即保持最新
Transition render 被打断 -> 旧后台尝试可以被丢弃
React 从最新 State 重启后台 render -> 最新 Transition 结果最终提交
```

如果某个浏览器或负载下 Transition 很快完成，没有记录到一次可见的丢弃，不能据此判定 API 失效；应
核对输入始终由普通 State 控制、最终视图使用最新值，以及 Demo 未以固定耗时或固定尝试次数作断言。

### 5. action 只覆盖同步执行范围

官方指出，action 内同步安排的 State 更新会被标记；`setTimeout` 中的更新不会自动标记（S1、S2）。
官方还说明，异步请求 `await` 之后的 setter 目前需要另一个 `startTransition` 才能重新标记（S1、S2）。

所以本课不应写出“进入一次 Transition，之后所有回调都会自动继承”的教学语句。网络请求、缓存和
timer 都排除在 Demo 外；边界只保留为一个静态错误账本，避免第 12-15 课的 Action 主线提前出现。

当前实现也支持这一解释：S4 的 finally 在同步 scope 完成后恢复之前的 Transition 上下文；后续异步
回调若要标记更新，必须重新进入 `startTransition`。

### 6. standalone API 与 `useTransition` 的职责分界

`startTransition` 与 `useTransition` 都能标记 Transition，但调用位置和反馈信号不同：

| 能力 | `startTransition`（本课） | `useTransition`（第 9 课） |
| --- | --- | --- |
| 调用位置 | 组件外、事件处理器、数据层等已有 setter 的位置 | 组件或自定义 Hook 顶层 |
| 标记更新 | 有 | 有 |
| `isPending` | 无，返回 `void` | 有，返回 `[isPending, startTransition]` |
| Action / async pending 教学 | 排除 | 第 9 课主线 |
| 本课 Demo | 模块外包装函数 + 组件 State setter | 不创建 |

“组件外可用”不表示它能从任意地方凭空找到 State；调用方仍要拿到 setter 或等价更新函数。若只有
prop/custom Hook 返回值而没有 setter，官方建议考虑 `useDeferredValue`，但该能力属于第 10 课，当前不展开。

## 与相邻课程的边界

- 第 7 课 `use(promise)`：已完成 Promise 读取和 Suspense/Error Boundary 三路分流；本课不把 Promise、
  远程资源、缓存或恢复流程改写成 Transition。
- 第 9 课 `useTransition`：负责组件内启动 Transition、读取 `isPending` 和 Action；本课不实现 pending
  指示器，不讲 async Action 排队、错误或表单。
- 第 10 课 `useDeferredValue`：负责从 prop/custom Hook 值产生延迟值和 stale UI；本课只使用目标
  State setter 直接标记 Transition。
- 第 12-15 课：Form Action、`useActionState`、`useOptimistic` 与 `useFormStatus` 负责 Action 结果和
  表单状态；本课不引入任何网络或表单提交。
- 第 16 课 `useSyncExternalStore`：负责稳定订阅和不可变 snapshot；本课不模拟外部 store 或订阅。
- 后续资源与宿主课程：Portal、hydration、metadata、stylesheet、script 和 resource hints 均不进入本课。

## 后续确定性同源 Demo 合同

### 资产与职责

正式实施若获得授权，建议使用两份运行资产和一份样式资产：

- 主 TSX：组件 State、普通受控输入、可触发的昂贵列表、commit 记录、结果选择和无 pending 文案。
- 模块 TS：导出一个接收 `() => void` 的 `startBackgroundUpdate` 包装函数，在 Hook 外调用
  `startTransition`。
- CSS：只定义本课布局和响应式样式，不使用 Grid、`gap` 或非零 `letter-spacing`。

运行源码和源码面板必须由 demo manifest 以固定顺序拼接主 TSX、模块 TS 和 CSS；不能只展示组件而隐藏
真正调用 standalone API 的模块函数。

### 可观察反馈环

Demo 必须是本地、确定性、无网络、无 timer、无随机数的实验：

1. 冷启动显示普通输入值、当前已提交视图值、Transition 调用次数和 render/commit 记录；不显示一个
   冒充 React `isPending` 的布尔状态。
2. 点击“开始后台更新”时，通过模块外包装函数把视图 State setter 包进 `startTransition`；action 本身
   立即执行，调用计数同步增加。
3. 在昂贵视图 render 尚未完成时输入文字；输入框的 `value` 由普通 State setter 驱动，字符应能继续
   更新，不能由 Transition setter 控制。
4. 观察最新输入和最新后台视图最终一致；若产生 render 尝试记录，允许旧尝试被打断，不固定要求特定
   次数或毫秒数。
5. 点击不同视图按钮快速启动多个后台更新，最终显示最后一次 State；不把多个 Transition 的批处理细节
   作为课程合同，只记录最终结果和输入响应。
6. 离页再返回时 React root 冷重建，记录和本地 State 回到初始值；不得依赖模块级缓存、网络响应或
   浏览器持久化。

### 确定性限制

- 不使用 `fetch`、XHR、WebSocket、外部 URL、第三方状态包、随机数、`Date`、`performance` 或
  `setTimeout`/`setInterval` 制造等待。
- 不用 `useTransition`、`useDeferredValue`、Suspense、Promise、Action、`useOptimistic` 或表单 API
  作为本课观察器。
- 不把“后台”写成必定在下一帧执行；不把具体 lane、CPU 时间、render 次数或中断次数写成验收数字。
- 如果工作量在某个浏览器中不足以产生可见中断，仍验证输入 State 和最终最新结果；必要的可观察日志
  只描述 React 实际提交过的记录。

## 易错点账本

### 用 `useTransition` 代替 standalone API

- **错误：** 为了显示 pending 而直接调用 Hook。
- **后果：** 把第 9 课的 API 和 Action 语义提前混入本课。
- **正确做法：** 使用 Hook 外模块函数调用 `startTransition`，只展示可观察的已提交状态。

### 把输入 setter 放进 Transition

- **错误：** `startTransition(() => setInput(nextValue))` 直接控制受控文本输入。
- **后果：** 违反 React 的输入限制，输入反馈可能不及时或不稳定。
- **正确做法：** 输入 State 普通更新，昂贵结果 State 单独包进 Transition。

### 误以为 action 会延迟执行

- **错误：** 把 `startTransition` 当作延迟队列或 debounce。
- **后果：** 错误解释 action 立即调用和 setter 排队的区别。
- **正确做法：** 记录 action 同步执行，说明 React 只改变更新优先级。

### 误以为 timer 或 async callback 自动继承

- **错误：** 在 action 中安排 timer，声称 timer 内 setter 仍是 Transition。
- **后果：** 与官方同步范围和 await 后需重新包裹的说明冲突。
- **正确做法：** 本课排除 timer/网络；需要异步 Action 时转到后续课程并重新包裹 setter。

### 用固定中断次数证明调度

- **错误：** 断言每次点击都必然产生一次被丢弃的 render，或用固定毫秒数判定成功。
- **后果：** 把设备、浏览器和负载相关的调度结果误写成公共 API 合同。
- **正确做法：** 核对输入先响应和最新视图最终提交；中断日志只作当前运行观察。

### 把 `startTransition` 返回值当成 pending

- **错误：** 读取返回值或自建 `isPending` 并称其来自 React。
- **后果：** 混淆 standalone API 与 `useTransition` 返回数组。
- **正确做法：** `startTransition` 返回 `void`；pending 教学留给第 9 课。

### 把 State setter 丢给任意模块就认为可用

- **错误：** 模块函数没有接收 setter，却声称能更新组件 State。
- **后果：** 隐藏 React State 的所有权和更新函数依赖。
- **正确做法：** 明确把 setter 或等价更新函数作为参数传入 Hook 外包装函数。

## 实施与验证 Gate

### 临时语义与类型 Gate

1. 所有临时验证资产放入 `mktemp -d` 创建的 `/tmp` 目录，完成后删除；仓库不保留测试、fixture、日志
   或浏览器自动化产物。
2. 临时 TypeScript fixture 固定 `startTransition(() => setState(...)) -> void` 推导、模块函数接收 setter、
   普通输入 State 与后台视图 State 分离；使用当前 `tsconfig.react.json` 和已安装类型包。
3. AST 或精确文本检查确认 standalone `startTransition` 位于 Hook 外模块函数，Demo 没有
   `useTransition`、`useDeferredValue`、`fetch`、Promise、timer、随机数、第三方状态包或受控输入 setter
   的 Transition 包裹。
4. 检查 CSS 不使用 Grid、`gap` 或非零 `letter-spacing`；正文只包含本课单一主线、排除项、易错点、练习
   和唯一 Demo ID。
5. 实施后运行 `npm run type-check`、`npm run lint`、`npm run format:check`、空 unit/e2e、`npm run build`
   与当前课程 scoped `git diff --check`；研究稿本身不冒充这些实现 Gate 已通过。

### Production Gate

1. 使用 fresh production build 与本课独立 preview 验证，不把 development Strict Mode 的额外 render
   记录写成固定合同。
2. Network 中不应有课程业务 fetch/XHR/WebSocket；所有状态由本地点击和输入产生。
3. production 必须覆盖初始、后台更新、普通输入、快速连续更新和离页重进；不能只因 build 成功就声称
   Transition 已按合同工作。

### Browser Gate

1. 桌面 `1440x900`、移动 `390x844`、`390x844 + 32px` 根字号三种视口都完成同一反馈环。
2. 核对 action 调用后视图 State 最终更新，`startTransition` 没有伪造 pending 指示器或返回值展示。
3. 后台工作期间输入框仍可编辑，输入 DOM value 与普通输入 State 同步；输入 setter 不在 Transition 中。
4. 需要记录中断时，只记录真实 render/commit 事件；不要求固定中断次数、顺序间隔或毫秒数。
5. 三种视口页面与 Demo 横向溢出均为 `0`，文本、按钮、输入和日志无裁切、遮挡或不合理跳动；console 为
   `0 error / 0 warning`。
6. 键盘可以完成输入和所有按钮路径；状态变化通过文本/可访问区域表达，不依赖颜色或动画单独传达。
7. 离页再返回时 root 冷重建为初始 State；不存在旧模块缓存、网络响应或持久化状态造成的假性恢复。

### 同源与正文 Gate

1. demo manifest 的运行 loader 与 `?raw` 源码 loader 覆盖完全相同的主 TSX、模块 TS 和 CSS；浏览器源码
   面板与磁盘按同一拼接规则得到相同字符数、UTF-8 字节数和 SHA-256。
2. 学习者正文具备 frontmatter、单一主线、固定章节、pitfalls、exercise、唯一 Demo ID 和官方 sources；
   代码片段与真实 Demo 对 action 即时执行、输入普通更新、后台更新最终一致的语义一致。
3. 学习者正文不得出现本地包版本、仓库路径、临时命令、哈希、Gate、浏览器验收数据、复审过程或发布
   状态；这些只保留在研究、计划和 signoff 证据中。
4. 正文不扩展 `useTransition`、`useDeferredValue`、网络/缓存、timer 自动继承、Server Functions、RSC、
   lane 数字或调度性能基准。

### 发布与独立复审 Gate

1. 后续实现先保持第 8 课为 `planned`；正文、Demo、临时验证、production/browser Admission、同源
   核验和冻结 snapshot 尚未全部通过前，不登记 entry/demo manifest，不切换 Track。
2. 复杂实现完成后，对同一冻结资产快照做一次独立 combined review，Standards 与 Spec 必须同时达到
   `PASS / 0 finding`；修复改变运行语义或教学合同时，重新冻结并复审两轴。
3. 双轴通过后才能原子登记 entry/demo manifest、将 Track 第 8 课切为 `available` 并同步状态文档；
   completion/admission 不授权开始第 9 课。
4. 发布后复跑质量命令、三视口 production 反馈环、console/overflow、同源 SHA 与离页重进。任一结果
   失效则第 8 课不能宣称闭环。

## 独立复审清单

### Standards

- 只讲 standalone `startTransition`、同步 action、非紧急更新、普通输入和打断/重启，没有形成第二条
  pending Action、缓存或网络主线。
- 正文结构、pitfalls、exercise、中文职责注释、TSX/TS/CSS 与同源源码满足仓库规范。
- CSS 不使用 Grid、`gap` 或非零 `letter-spacing`，三视口无横向溢出与文字裁切。
- 学习者正文不泄露依赖版本、仓库路径、Gate、哈希、浏览器数据或复审结论。
- 未引入持久测试资产、timer、随机数、外部请求、第三方状态包、RSC、Server Functions、`useTransition`
  或 `useDeferredValue`。

### Spec

- standalone `startTransition` 位于 Hook 外，传入真实 State setter；action 同步执行且返回 `void`。
- 非紧急视图 State 被标记为 Transition；输入 State 保持普通更新，不受 Transition setter 控制。
- 更紧急输入可以先提交，后台工作允许被打断并从最新 State 重启；不把中断次数写成固定断言。
- timer、await 后 setter 和网络/缓存均未被错误描述为自动继承或本课实现。
- 没有 `isPending` 假信号；第 9 课 pending Action 保持边界外。
- 第 7 课 Promise 读取已作为前置但没有被重新实现，第 9 课及以后没有创建或登记资产。

两轴必须在同一冻结 snapshot 达到 `PASS / 0 finding`。

## 参考资料

- [React `startTransition`](https://react.dev/reference/react/startTransition) - standalone API、非阻塞更新、
  输入限制、打断/重启、无 pending 和同步范围。
- [固定 React `startTransition` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/startTransition.md) -
  本课公共事实的固定文本。
- [`useTransition` Reference](https://react.dev/reference/react/useTransition) - `isPending` 与 Action 的
  后续课程边界。
- [React `v19.2.8` `ReactStartTransition.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactStartTransition.js) -
  当前 patch 的 Transition 上下文和 scope 生命周期。
- [React `v19.2.8` `ReactFiberWorkLoop.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberWorkLoop.js) -
  更新 lane 选择的实现旁证。
- [React `v19.2.8` `ReactFiberRootScheduler.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberRootScheduler.js) -
  当前事件中的 Transition lane 分配旁证。
- [React `v19.2.8` `ReactFiberLane.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberLane.js) -
  lane 优先级和中断判断的实现旁证。
- [React `v19.2.8` npm 元数据](https://registry.npmjs.org/react/19.2.8) - 安装 patch 与固定 commit 的对应关系。
- [React `v19.2.8` release](https://github.com/facebook/react/releases/tag/v19.2.8) - 当前运行时 patch 发布身份。
