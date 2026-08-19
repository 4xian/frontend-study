# RC3 React Core 高级课程单知识点调研与冻结

> 核验日期：2026-08-12
> 研究状态：官方事实与课程范围已复核，24 篇正式路线已冻结
> 知识基线：React `19.2.8`、React DOM `19.2.8`、React 官方文档 `19.2`
> 文档固定提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
> 运行时固定提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`（tag
> `v19.2.8`）
> 宿主基线：Vue `3.5.40`、Vite `8.1.5`、`@vitejs/plugin-react` `6.0.5`

## 1. 冻结结论

R0-B 最初列出的 8 篇 RC3 条目均为聚合占位，不符合当前“一课只建立一个可独立命名、检索、验证的
核心心智模型”的课程合同。本次审计把它们拆为 **24 篇单知识点课程**，并冻结以下边界：

1. 24 篇课程全部使用稳定 ID `react.core.learn.advanced.<slug>`，按本文顺序串行实施。
2. 16 篇可直接在当前 Vue/Vite SPA 的 React Demo Adapter 中做生产构建实证；`Profiler` 需要开发构建
   或独立 profiling fixture；hydration、元数据和资源相关 7 篇使用 `/tmp` 隔离文档 fixture，不能污染
   站点 document 后再把残留误报为通过。
3. `useMemo`、`flushSync`、Strict Mode、多 Root 与 Root 错误回调基线已经在 RC1/RC2 正文中完成主线
   教学，不重复创建高级课程。高级课只在需要时把它们当作前置或边界引用。
4. React Compiler 虽已稳定，但属于构建期工具，当前仓库没有启用 Compiler 依赖，且 R0-A/R0-B 已把
   它放在 Gate RC 外的观察范围；本次不创建伪运行时课程。
5. React Server Components、Server Functions、`react-dom/server`、`react-dom/static`、Canary 和
   Experimental API 保持 deferred/观察状态。普通客户端 SPA 不能冒充它们的运行环境。

本文只冻结范围、顺序和验证边界，不创建课程正文、Demo、manifest 条目，也不把当前 8 个 track 占位
提前改成 `available`。

## 2. 调研方法与证据边界

### 2.1 本地事实

- 当前 `react-core-track.ts` 的高级阶段只有 8 个 `planned` 聚合占位，没有高级课程正文或 Demo。
- RC1 已有 20 篇基础课，RC2 已有 29 篇中级课；RC3 不复制它们已经建立的 Root、State、Reducer、
  Context、Ref、Effect、`useMemo`、Strict Mode 和 `flushSync` 心智模型。
- 本地 `react`、`react-dom` 均为 `19.2.8`。运行时公开导出包含本冻结所用的 `Activity`、`Profiler`、
  `Suspense`、`lazy`、`memo`、`startTransition`、`use`、Action Hooks、`useSyncExternalStore` 以及 React DOM
  的 Portal、资源提示和 client root API。

### 2.2 外部调研路径

按仓库搜索顺序先向 Tavily 发起 4 组限定 `react.dev` 的查询，均返回套餐用量上限；随后使用 Exa 只做
官方 URL 发现。所有课程结论最终回到以下第一方材料核验，不采用搜索摘要作为事实依据：

- React 官方 `19.2` Reference 当前页面及固定提交下的 Markdown 源文档。
- `facebook/react` tag `v19.2.8` 的公开导出与 Root 实现源码。
- 本仓库已冻结的 R0-A、R0-B、RC1 和 RC2 文档与当前课程正文。

### 2.3 单知识点判定

冻结课程必须同时满足：

1. 能用一句话表述唯一主线，删除其他课程后仍能独立命名和检索。
2. 有独立的输入、输出或失败模式，能够设计不依赖未来 Router、状态库或数据缓存库的最小实证。
3. 辅助 API 只能支撑观察，不得在同一篇中形成第二条并列教学主线。
4. 与 RC1/RC2 已完成内容有清楚的增量边界，而不是改标题后重复教学。
5. SPA 无法真实运行的事实必须标记为隔离 fixture、版本敏感或 deferred，不能用静态代码片段宣称
   浏览器通过。

## 3. 原 8 个聚合占位审计

| 原聚合占位 | 本次保留的独立课程 | 移出或复用边界 |
| --- | --- | --- |
| 记忆化、Profiler 与 Compiler 边界 | `Profiler`、`memo`、`useCallback` | `useMemo` 已在“派生值”完整教学；Compiler 留在构建期观察范围。 |
| `lazy`、Suspense 与 `use` | `lazy`、Suspense 边界、`use(promise)` | `use(context)` 的读取模型已由 `useContext` 覆盖，只作为 `use` 的签名边界。 |
| Transition、延迟值与 Activity | `startTransition`、`useTransition`、`useDeferredValue`、Activity | View Transition 仍为 Canary，不借 Activity 课程混入。 |
| Action、乐观 UI 与表单状态 | Form Action、`useActionState`、`useOptimistic`、`useFormStatus` | Server Function、无 JavaScript 渐进增强与 permalink 导航需要服务端环境，保持 deferred。 |
| 外部 Store 与订阅合同 | `useSyncExternalStore` | Redux、Zustand 属于后续 `react/state`，远程缓存属于 `react/data`。 |
| Portal、同步刷新与多 Root | Portal | `flushSync` 已在 RC1 更新队列教学；多 Root 创建、卸载和 `identifierPrefix` 基线已在 Root 生命周期教学。 |
| 错误边界、Strict Mode 与恢复 | Error Boundary | Strict Mode 与 Root 三类错误回调已在 RC1 完成；`captureOwnerStack` 保留为开发期 quick Reference。 |
| Hydration、资源提示与服务端边界 | `hydrateRoot`、文档元数据、声明式资源元素、连接预热、preload、preinit | server/static/RSC 不进入 SPA 课程；只在边界清单登记。 |

## 4. Gate RC 52 项去重账本

R0-B 已冻结当前 SPA 可实证的 Gate RC 稳定分母为 React 29 项、React DOM 23 项，共 52 个
officialKey。本次按 officialKey 去重，而不是按课程出现次数累加：

| 去向 | React officialKey | React DOM officialKey | 唯一项数 |
| --- | --- | --- | ---: |
| RC1/RC2 已完成主线 | `useContext`、`useEffect`、`useEffectEvent`、`useImperativeHandle`、`useInsertionEffect`、`useLayoutEffect`、`useMemo`、`useReducer`、`useRef`、`useState`、Fragment、StrictMode、`createContext` | Common DOM、`form` 的 `onSubmit`/默认行为、`input`、`option`、`progress`、`select`、`textarea`、`flushSync`、`createRoot` | 22 |
| RC3 新增或加深主线 | `useActionState`、`useCallback`、`useDeferredValue`、`useOptimistic`、`useSyncExternalStore`、`useTransition`、Profiler、Suspense、Activity、`lazy`、`memo`、`startTransition`、`use` | `useFormStatus`、`form` 的 function Action、`link`、`meta`、`script`、`style`、`title`、`createPortal`、`preconnect`、`prefetchDNS`、`preinit`、`preinitModule`、`preload`、`preloadModule`、`hydrateRoot` | 28 |
| RCA-only quick/reference | `useDebugValue`、`useId`、`captureOwnerStack` | 无 | 3 |

上表原始相加为 `22 + 28 + 3 = 53`，有一个 officialKey 在已完成课程与 RC3 各承担不同深度：

- `react-dom.components.form`：RC1 已完成浏览器默认提交、`preventDefault` 和 `onSubmit`；RC3 只新增
  React 19 function Action 的 Transition、成功重置与错误传播合同。
`react-dom.client.createRoot` 的创建、render、unmount、多 Root、option 位置与三类错误回调均已在 RC1
完成，RC3 不重复计入或开课。

对 `form` 重叠键去重一次后，稳定分母仍严格为 `52`，没有缺项，也没有把同一官方页面重复伪装成
多个 Reference 键。

课程数不等于 officialKey 数：RC3 的 24 课覆盖 28 个稳定主线键；元数据、声明式资源和资源提示课程会
在一个心智模型内合并强相关 API，而 Error Boundary 课程使用官方仍要求的最小 legacy `Component`
例外，不新增 Gate RC 稳定键。`useDebugValue`、`useId` 和 `captureOwnerStack` 有稳定键但不足以形成这次
8 个聚合占位中的独立高级主线，继续留在 RCA，不为凑课程数膨胀 RC3。

## 5. 冻结课程清单

### 5.1 性能测量与手动记忆化

| 顺序 | 稳定 ID / 标题 | 唯一主线 | 前置 | 明确排除项 | 官方来源 | 当前宿主实证 |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | `react.core.learn.advanced.profiler-render-measurement`<br>Profiler 渲染测量 | 用 `<Profiler onRender>` 的 commit 数据区分 mount/update，并用 `actualDuration` 与 `baseDuration` 观察优化前后的渲染成本。 | RC2 | React DevTools 完整教程、Core Web Vitals、生产监控平台、Compiler、先优化后测量。 | [Profiler](https://react.dev/reference/react/Profiler) | **受限可实证**：当前生产 React 构建默认禁用回调；开发服务器可直接验证，生产 profiling 必须用 `/tmp` 特殊 profiling fixture，不能把普通 preview 的零回调写成通过。 |
| 2 | `react.core.learn.advanced.memo-component-bailout`<br>`memo` 与组件跳过渲染 | 当父组件更新而子组件 Props 按 `Object.is` 保持不变时，用 `memo` 跳过不必要的子组件 render，并把它限定为性能优化。 | 1 | `useMemo` 计算缓存、自定义深比较默认化、State/Context 更新阻断、Compiler 配置。 | [`memo`](https://react.dev/reference/react/memo) | **直接可实证**：在同一父级中分别更新无关 State 和真实 Props，以 render 计数与 DOM 结果证明“可跳过但不保证”。 |
| 3 | `react.core.learn.advanced.use-callback-function-identity`<br>`useCallback` 与函数身份 | 只在函数身份会破坏已测量的 memoization 或成为必要依赖时缓存函数定义，依赖变化后得到新函数。 | 2 | 把 `useCallback` 当业务正确性工具、Effect 依赖压制、事件函数执行结果缓存、Compiler 配置。 | [`useCallback`](https://react.dev/reference/react/useCallback) | **直接可实证**：比较普通内联回调与缓存回调传入 memoized child 时的 render 次数，同时证明依赖变化仍会更新闭包。 |

### 5.2 渲染错误、代码加载与异步读取

| 顺序 | 稳定 ID / 标题 | 唯一主线 | 前置 | 明确排除项 | 官方来源 | 当前宿主实证 |
| ---: | --- | --- | --- | --- | --- | --- |
| 4 | `react.core.learn.advanced.error-boundary-render-failures`<br>Error Boundary 与渲染失败隔离 | 用最小 class Error Boundary 捕获后代 render/lifecycle 错误并显示 fallback，通过改变 boundary identity 完成显式恢复。 | 3 | 事件处理器错误、任意异步 callback、SSR 错误、日志平台、第三方 `react-error-boundary`。 | [`Component`：Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) | **直接可实证**：当前 React 仍无等价函数组件 API；允许唯一的 legacy class 例外，验证抛错、fallback、未捕获自身错误和 key 重建恢复。 |
| 5 | `react.core.learn.advanced.lazy-component-code-splitting`<br>`lazy` 组件代码分割 | 把动态 `import()` 包装为顶层 `lazy` 组件，使模块只在首次尝试 render 时加载并缓存结果。 | 4 | 任意数据请求、路由级加载器、在组件内部声明 `lazy`、预加载策略、bundler chunk 手工配置。 | [`lazy`](https://react.dev/reference/react/lazy) | **直接可实证**：真实动态模块生成独立 chunk，进入前不请求、首次显示时请求、重进不重复调用 loader；Suspense 仅作必要外壳。 |
| 6 | `react.core.learn.advanced.suspense-fallback-boundary`<br>Suspense fallback 边界 | 用最近的 `<Suspense fallback>` 协调“子树尚未就绪”到 reveal 的边界，并设计嵌套边界而不是把整个页面替换。 | 5 | 任意 Effect/fetch 自动触发 Suspense、数据缓存库、streaming SSR、Selective Hydration、Experimental `defer`。 | [`Suspense`](https://react.dev/reference/react/Suspense) | **直接可实证**：以第 5 课 lazy chunk 和可控延迟验证 fallback、嵌套 reveal 与重挂起；不得把普通 `useEffect` loading 当 Suspense。 |
| 7 | `react.core.learn.advanced.use-promise-reading`<br>`use(promise)` 读取异步值 | 在 render 中读取可复用的 cached Promise，让 pending 交给 Suspense、rejection 交给 Error Boundary。 | 6 | `use(context)` 完整教学、在 render 中创建新 Promise、try/catch 包围 `use`、RSC 数据传输、TanStack Query。 | [`use`](https://react.dev/reference/react/use) | **直接可实证**：模块级或明确 cache 保存同一 Promise，验证 pending、resolve、reject 三条路径和重新 render 不产生无限挂起。 |

### 5.3 并发 UI 与可恢复隐藏状态

| 顺序 | 稳定 ID / 标题 | 唯一主线 | 前置 | 明确排除项 | 官方来源 | 当前宿主实证 |
| ---: | --- | --- | --- | --- | --- | --- |
| 8 | `react.core.learn.advanced.start-transition-background-update`<br>`startTransition` 后台更新 | 在 Hook 外或无需 pending 信号的调用点，把非紧急 State 更新标记为可中断的 Transition，同时保留输入等紧急更新。 | 7 | pending 指示器、受控输入自身更新、定时器内自动继承 Transition、数据请求库集成。 | [`startTransition`](https://react.dev/reference/react/startTransition) | **直接可实证**：高成本列表更新放入 Transition，输入 State 保持紧急；验证 standalone API 不提供 pending 状态。 |
| 9 | `react.core.learn.advanced.use-transition-pending-action`<br>`useTransition` 与 pending Action | 在组件内启动 Transition 并用 `isPending` 表达一组同步或异步 Action 的进行状态。 | 8 | Form 专属状态、乐观结果、把受控输入 setter 放进 Transition、把并发顺序当持久事务。 | [`useTransition`](https://react.dev/reference/react/useTransition) | **直接可实证**：验证 pending、非阻塞导航式更新和 async Action；`await` 后 setter 需再次包装是当前版本限制，必须写入版本卡而不是抽象成永久规则。 |
| 10 | `react.core.learn.advanced.use-deferred-value-stale-content`<br>`useDeferredValue` 与陈旧内容 | 当调用方不能直接控制更新来源时，让昂贵子树暂时读取旧值，并显式表达 stale UI。 | 9 | 固定毫秒 debounce/throttle、网络请求防抖、受控输入延迟、保证减少请求次数。 | [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue) | **直接可实证**：输入立即更新，结果区先保留旧 query 后追上新值；用可观察 stale 标记区分“延迟渲染”与“延迟事件”。 |
| 11 | `react.core.learn.advanced.activity-hidden-state-restoration`<br>Activity 隐藏与状态恢复 | 用 `<Activity mode="hidden">` 在视觉隐藏和 Effect 清理期间保留子树 State/DOM，并在重新可见时恢复。 | 10 | CSS 手工隐藏等价论、隐藏后仍运行 Effect、媒体 DOM 自动停止、Canary View Transition、把 Activity 当路由缓存。 | [`Activity`](https://react.dev/reference/react/Activity) | **直接可实证**：验证 `display: none`、State/DOM 保留、Effect cleanup/re-create 和 hidden 初次预渲染；本 API 是 React 19.2 新稳定能力，必须固定版本。 |

### 5.4 Action、表单状态与乐观反馈

| 顺序 | 稳定 ID / 标题 | 唯一主线 | 前置 | 明确排除项 | 官方来源 | 当前宿主实证 |
| ---: | --- | --- | --- | --- | --- | --- |
| 12 | `react.core.learn.advanced.form-action-client-submission`<br>客户端 Form Action | 向 `<form action={fn}>` 传客户端函数，让 React 用 Transition 管理 FormData 提交、成功后的非受控表单重置与错误传播。 | 11 | `onSubmit` 基础重复教学、Server Function、无 JS 渐进增强、后端请求协议、表单库。 | [`<form>`](https://react.dev/reference/react-dom/components/form) | **直接可实证**：异步客户端 action 收到 FormData，pending 期间保留交互合同，成功自动重置非受控字段，失败交给 Error Boundary。 |
| 13 | `react.core.learn.advanced.use-action-state-result-queue`<br>`useActionState` 与 Action 结果 | 让 Action 的返回值成为下一次调用的 previous state，并观察顺序队列和 pending，而不是手写重复的异步结果 State。 | 12 | Server Function 必需论、`permalink` 导航实证、通用 reducer 替代、任意请求缓存。 | [`useActionState`](https://react.dev/reference/react/useActionState) | **直接可实证**：纯客户端 Action 连续提交，验证 previous state 串联、队列顺序、最终状态和 pending。 |
| 14 | `react.core.learn.advanced.use-optimistic-pending-state`<br>`useOptimistic` 乐观状态 | 在 Action 未完成期间派生临时 UI，成功后回到真实值，失败时撤销而不把临时结果当持久事实。 | 13 | 本地立即 State 的普通更新、离线队列、服务端冲突策略、TanStack Query mutation、非纯 reducer。 | [`useOptimistic`](https://react.dev/reference/react/useOptimistic) | **直接可实证**：可控成功/失败 Action 显示 sending 项，随后确认或回滚；setter 必须在 Action 中调用。 |
| 15 | `react.core.learn.advanced.use-form-status-parent-scope`<br>`useFormStatus` 表单作用域 | 在父 `<form>` 内的后代组件读取最近一次提交的 `pending`、`data`、`method` 和 `action`，并遵守最近父表单范围。 | 14 | 在声明同一 form 的组件中读取、观察子 form、全局 pending、Server Function 必需论。 | [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus) | **直接可实证**：嵌套组件显示最近父 form 状态，并用同组件/无父 form 的对照证明作用域边界。 |

### 5.5 外部订阅与 DOM 宿主边界

| 顺序 | 稳定 ID / 标题 | 唯一主线 | 前置 | 明确排除项 | 官方来源 | 当前宿主实证 |
| ---: | --- | --- | --- | --- | --- | --- |
| 16 | `react.core.learn.advanced.use-sync-external-store-snapshot`<br>`useSyncExternalStore` 快照合同 | 用稳定 `subscribe`、可缓存且不可变的 `getSnapshot` 接入 React 外部状态源，并在卸载时取消订阅。 | 15 | Redux/Zustand 教程、远程查询缓存、从 Context 迁移、基于 store 值挂起 UI、SSR snapshot 实证。 | [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) | **直接可实证**：页面内最小 store 验证通知、`Object.is` 跳过、不可变快照和离页订阅归零；外部 store 的 Transition 退回 blocking 属于并发边界。 |
| 17 | `react.core.learn.advanced.portal-tree-and-dom-placement`<br>Portal 的 React 树与 DOM 位置 | 用 `createPortal` 只改变宿主 DOM 放置位置，同时保留 Context 读取和按 React 树冒泡的事件语义。 | 16 | 新建第二个 Root、CSS 层叠完整教程、焦点陷阱组件库、跨 document/iframe 支持承诺、`flushSync`。 | [`createPortal`](https://react.dev/reference/react-dom/createPortal) | **直接可实证**：目标容器位于 React root 外，内容读取原 Context，点击按 React tree 冒泡；离页后 portal DOM 清空。 |
### 5.6 Hydration、元数据与资源发现

| 顺序 | 稳定 ID / 标题 | 唯一主线 | 前置 | 明确排除项 | 官方来源 | 当前宿主实证 |
| ---: | --- | --- | --- | --- | --- | --- |
| 18 | `react.core.learn.advanced.hydrate-root-markup-identity`<br>`hydrateRoot` 与标记一致性 | 在已有 React HTML 上建立客户端 Root，要求首次客户端输出与已有标记一致，并区分 recoverable mismatch 与应用错误。 | 17 | 把 `innerHTML` 冒充服务端渲染成果、完整 SSR/streaming 框架、静默依赖 mismatch 修补、server/static API 教学。 | [`hydrateRoot`](https://react.dev/reference/react-dom/client/hydrateRoot) | **隔离实证**：使用 `/tmp` 固定 server-like HTML fixture 验证匹配、可恢复 mismatch、事件接管、回调和卸载；当前 Vue 外壳不是 SSR React 应用。 |
| 19 | `react.core.learn.advanced.document-metadata-hoisting`<br>React 文档元数据提升 | 从组件树声明 `<title>`、`<meta>` 和元数据 `<link>`，观察 React 将它们放入 document head 并随树更新。 | 18 | SEO 效果承诺、框架 Metadata API、HTTP header、stylesheet 与 preload 行为、服务端 head 流式输出。 | [`<title>`](https://react.dev/reference/react-dom/components/title)、[`<meta>`](https://react.dev/reference/react-dom/components/meta)、[`<link>`](https://react.dev/reference/react-dom/components/link) | **隔离实证**：使用 `/tmp` document fixture 观察 head 插入、更新与卸载，避免修改课程站点自身 title/meta 后污染浏览器验收。 |
| 20 | `react.core.learn.advanced.declarative-stylesheet-resources`<br>声明式样式资源 | 用带 `precedence` 的 stylesheet `<link>` 与 `<style>` 建立 React 的 head 放置、优先级、去重和 Suspense 协作合同。 | 19 | async script、CSS-in-JS、资源提示函数、CSP/SRI 完整安全课、任意 bundler asset pipeline。 | [`<link>`](https://react.dev/reference/react-dom/components/link)、[`<style>`](https://react.dev/reference/react-dom/components/style) | **隔离实证**：本地可控样式与独立 document 验证 precedence、去重和加载边界；不得修改正式站点样式。 |
| 21 | `react.core.learn.advanced.declarative-async-script-resource`<br>声明式异步脚本资源 | 用带 `src` 和 `async` 的 `<script>` 建立 React 的 head 放置、按 URL 去重和一次执行合同。 | 20 | 普通同步或内联脚本、stylesheet Suspense、资源提示函数、任意远程脚本、CSP/SRI 完整安全课。 | [`<script>`](https://react.dev/reference/react-dom/components/script) | **隔离实证**：本地可控脚本与独立 document 验证放置、去重和执行次数；不得向第三方地址发请求。 |
| 22 | `react.core.learn.advanced.resource-connection-warmup`<br>资源连接预热 | 按“只解析 DNS”与“提前建立连接”区分 `prefetchDNS` 和 `preconnect`，在已知源站但未知具体资源时提前发现连接。 | 21 | 资源文件下载、性能收益保证、服务端 header、任意第三方生产域名、preload/preinit。 | [`prefetchDNS`](https://react.dev/reference/react-dom/prefetchDNS)、[`preconnect`](https://react.dev/reference/react-dom/preconnect) | **隔离实证**：fixture 检查稳定 link hint 与同参数去重；网络耗时只作环境观察，不作为课程确定性 PASS 条件。 |
| 23 | `react.core.learn.advanced.resource-preload-discovery`<br>资源 preload 发现 | 用 `preload`/`preloadModule` 提前下载已知资源但不立即执行或应用，并正确匹配资源类型选项。 | 22 | 立即执行脚本、立即应用样式、业务缓存、打包器 modulepreload 自动优化、真实性能收益保证。 | [`preload`](https://react.dev/reference/react-dom/preload)、[`preloadModule`](https://react.dev/reference/react-dom/preloadModule) | **隔离实证**：本地资源 fixture 观察 preload link、参数与去重；不能仅凭函数无异常宣称浏览器已预载。 |
| 24 | `react.core.learn.advanced.resource-preinit-evaluation`<br>资源 preinit 执行与应用 | 用 `preinit`/`preinitModule` 在提前获取后立即执行脚本或应用 stylesheet，并与仅下载的 preload 分工。 | 23 | 动态 `import()` 代码分割、任意远程脚本、副作用不可回收的站点 Demo、CSP/SRI 完整教学。 | [`preinit`](https://react.dev/reference/react-dom/preinit)、[`preinitModule`](https://react.dev/reference/react-dom/preinitModule) | **隔离实证**：只在 `/tmp` 使用可控脚本/样式，验证执行或应用、precedence 与重复调用去重；不得污染正式 SPA document。 |

## 6. 稳定、版本敏感与 deferred 边界

### 6.1 当前稳定主线

24 篇课程使用的公共入口均出现在 React `19.2` 官方稳定 Reference，且对应导出存在于
`react@19.2.8`/`react-dom@19.2.8`。这里的“稳定”表示可以进入冻结版本课程，不表示所有行为都能脱离
宿主环境或跨 React minor 永久不变。

### 6.2 必须写入逐课版本卡的敏感项

| 项目 | 版本敏感事实 | 冻结处理 |
| --- | --- | --- |
| Profiler | 普通 production build 默认禁用 profiling callback。 | 浏览器 Gate 区分开发构建与特殊 profiling build。 |
| Suspense | React 19.2 对边界 reveal 增加按 300ms 窗口批处理；这是当前版本调度细节。 | 可记录观察，不把精确 300ms 作为业务定时合同。 |
| `useTransition` | async Action 中 `await` 后的 setter 当前仍需额外 `startTransition` 包装。 | 标注“19.2 当前限制”，升级后重新核验。 |
| Activity | React 19.2 新增稳定能力；hidden 会清理 Effect、保留 State/DOM。 | 固定到 19.2.8，不向早期 React 19 泛化。 |
| Error Boundary | 官方仍要求 class `Component`，暂无等价函数组件 API。 | 只允许最小 legacy class 例外，未来出现稳定替代时重新冻结。 |
| hydration | mismatch 不是可接受的日常分支，React 不保证修补所有 attribute 差异。 | fixture 只展示诊断与修复，不能教“忽略 warning”。 |
| 资源 API | 框架、浏览器和 bundler 可能已经处理资源发现，实际性能收益取决于网络环境。 | 课程验证 DOM/请求语义与去重，不承诺固定毫秒收益。 |

### 6.3 不进入本次 24 课的观察与 deferred 项

| 范围 | 状态 | 原因与后续归属 |
| --- | --- | --- |
| React Compiler | 稳定但 deferred | 构建期工具；当前未安装/启用 compiler，R0-A/R0-B 已放在 Gate RC 外。若未来授权，必须单独冻结版本、插件配置、产物差异和回退方案。 |
| `cache`、`cacheSignal` | 稳定但 deferred | 官方限定 React Server Components；普通 SPA 不能验证。 |
| `react-dom/server`、`react-dom/static` | 稳定但 deferred | 需要真实 server/static runtime 与独立 Gate，不能由 hydration fixture替代。 |
| Server Components、Server Functions、`use server`/`use client` | deferred | 属于 RSC/框架服务端边界，不进入客户端 Core SPA。 |
| `ViewTransition`、`addTransitionType` | Canary | 不计稳定课程；Activity 课程不得借其动画示例混入。 |
| `Suspense defer` | Experimental | 不计稳定课程；CPU-bound render 不能冒充稳定 Suspense 触发源。 |
| `captureOwnerStack` | 稳定、开发期 quick Reference | 生产返回不可依赖，知识面较窄，保留在 RCA Reference，不扩成课程。 |
| `useId`、`useDebugValue` | 稳定 Reference | 本次 8 个聚合占位没有为其建立独立高级主线；留在 RCA，不能借多 Root 或调试课程膨胀范围。 |
| `flushSync`、Strict Mode、多 Root、Root 错误回调 | 已覆盖 | 复用 RC1/RC2 课程；高级正文只能链接前置，不重复讲一遍。 |
| Router、Redux、Zustand、TanStack Query | 后续 Module | RC3 Demo 只用页面内可控 Promise/store，不提前占用 `react/router`、`react/state`、`react/data` 的课程责任。 |

## 7. 串行顺序与逐课验证载体

冻结顺序即第 5 节的 `1 -> 24`。顺序背后的依赖链为：

```text
先测量 -> 组件/函数身份优化
  -> 错误隔离 -> lazy -> Suspense -> use(promise)
  -> Transition -> deferred value -> Activity
  -> Form Action -> Action state -> optimistic state -> form scope
  -> external store -> Portal
  -> hydration -> metadata -> stylesheet -> async script -> connect -> preload -> preinit
```

每课仍按“一课一批”完成：独立官方调研、单知识点正文、同源 TSX Demo 或适配的 `/tmp` fixture、临时
TypeScript Gate、桌面/390px/200% 文本浏览器验证、离页清理、源码同源、质量命令、独立 Standards/Spec
复审、原子登记、登记后回归。前一课未达到 `PASS / 0 finding`，不得开始下一课。

各类验证载体必须遵守：

- 普通 runtime 课直接走当前 React Demo Adapter，运行源码与展示源码同源。
- Profiler 不能在普通 production preview 中用“无回调”充当成功；使用开发构建或临时 profiling build。
- hydration 使用独立初始 HTML，证明首次标记匹配、事件接管、mismatch 回调与卸载。
- metadata/resource 课使用独立 document 和本地可控资源，验收后精确删除 `/tmp` 资产；正式站点的
  `<head>`、title、连接和脚本不得成为测试靶场。
- 所有课程都禁止引入持久测试文件、第三方状态/数据包、Compiler、服务端框架或真实外部业务 API。

## 8. 正式冻结与登记条件

本文清单在以下条件全部满足后，替代 track 中原 8 个聚合占位成为正式 RC3 合同：

1. Standards 与 Spec 复核均为 `PASS / 0 finding`，并冻结本文 SHA-256。
2. 24 个稳定 ID 与现有 49 篇课程、entry manifest、Demo manifest 双向核对无冲突。
3. RC3 路线计划、`react-core-track.ts` 和本研究稿统一为 `24 planned / 0 available`；不得提前创建
   正文或 Demo 空壳。
4. 原 8 个聚合 ID 被明确替换，不保留为额外 8 课，也不设置旧 URL 重定向，因为它们从未发布。
5. 课程总量、顺序、直接/受限/隔离实证分类和 deferred 清单在路线文档中完全一致。
6. 登记后运行 type-check、lint、format 与 scoped `git diff --check`；本批只冻结规划，不实现或打开
   任何课程页面。

正式登记后，RC3 的初始状态应为：

```text
RC1 20/20 available
RC2 29/29 available
RC3 0/24 available, 24 planned
下一课：Profiler 渲染测量
```

## 9. 第一方来源索引

### 9.1 固定版本与源码

- [React Versions](https://react.dev/versions) - 官方站点当前文档版本为 React 19.2。
- [固定 Reference sidebar](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/sidebarReference.json) - 稳定/Canary/Experimental 分类基线。
- [React 19.2.8 客户端公开导出](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactClient.js) - React 候选 API 的实际导出。
- [React DOM 19.2.8 公开导出](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/shared/ReactDOM.js) - Portal、Form 与资源 API 的实际导出。
- [React DOM 19.2.8 Root 源码](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/client/ReactDOMRoot.js) - create/hydrate root options 与回调入口。

### 9.2 观察与环境边界

- [React Compiler Introduction](https://react.dev/learn/react-compiler/introduction) - Compiler 是构建期自动
  memoization 工具，不是 React runtime Hook。
- [React Versioning Policy](https://react.dev/community/versioning-policy) - Latest、Canary 与 Experimental
  的稳定性处理。
- [`react-dom/client`](https://react.dev/reference/react-dom/client) - `createRoot` 与 `hydrateRoot` 的入口分工。
- [`react-dom/server`](https://react.dev/reference/react-dom/server) 与
  [`react-dom/static`](https://react.dev/reference/react-dom/static) - 本次 deferred 的服务端/静态入口。
- [React Server Components](https://react.dev/reference/rsc/server-components) - RSC 与客户端 SPA 的环境边界。

## 10. 冻结自审

### Standards

- 本批只新增研究稿和正式计划，并更新总路线与 track 的规划状态；未创建课程正文、Demo、loader、
  manifest 条目、依赖或测试。
- 外部结论已回到 React `19.2` 官方文档固定提交或 React `v19.2.8` 源码核验。
- Stable、版本敏感、Canary、Experimental、legacy 例外与 deferred 环境已分开处理。
- 没有把普通 SPA、静态片段或搜索摘要冒充 server/RSC/production profiling 证据。

### Spec

- 原 8 个聚合占位均有明确去向，冻结为 24 篇单知识点课程。
- 每课均包含稳定 ID、标题、唯一主线、前置、排除项、官方来源和宿主实证等级。
- 串行顺序、逐课 Gate、正式登记条件和开始点已明确。
- 未开始第 1 课正文或 Demo，也未把任何高级课程登记为 `available`。
