# R0-B：React Core、React DOM 与宿主冻结

> 核验日期：2026-08-09
> 冻结时状态：R0-B1、R0-B2、RC1、RC2 已完成；RC3 已冻结并达到 1/24
> 冻结时项目快照：`main`，`203f0dbf9116bc86cc17f715eb0e3ce05fa9e9bb`
> 文档性质：R0-B 宿主、版本、API 分母与初始课程范围的历史冻结记录
> 现行状态：React Core 74/74；React Core Reference 0；Gate RC、Gate R Pending；课程状态以
> [`React课程调整总计划.md`](./React课程调整总计划.md) 为准

## 1. 冻结结论

本文冻结 R0-B 的官方范围与后续宿主实施合同，但不构成 R0-B2 实施授权。它回答：

1. React Core、React DOM、类型包和 Vite React 插件采用什么精确版本。
2. React 官方 Reference 的上游稳定清单与当前 SPA 可实证分母分别是多少。
3. React Core 课程如何拆为 RC1、RC2、RC3，Reference 如何进入 RCA。
4. Vue 宿主如何通过 adapter 运行 React TSX Demo，同时保持按需加载和可靠卸载。
5. R0-B2、RC 与 RCA 必须遵守哪些已确认的版本、统计、课程和 Gate 决策。

R0-B1 不安装依赖，不修改 `package.json`、Vite 配置、Catalog、manifest、registry、运行时代码、课程、
Reference 或 Demo。所有运行时改动都属于需要新授权的 R0-B2。

### 1.1 已确认的生态前置决策

用户已确认 Gate R 的第三方库范围：

- `react/state` 正式交付 Redux Toolkit + React Redux 系统主线和 Zustand 完整轻量分支。
- `react/data` 正式交付 TanStack Query。
- Jotai、RTK Query 与 SWR 只进入后续观察/对比。
- Next.js、React Native、UI 组件库、独立表单库继续排除；通用测试、交付与性能仍属于 Q 阶段。

这些决策只更新生态边界，不替代后续 RS0、RD0 的精确版本、课程与 Reference 冻结，也不构成 R0-B
宿主实施授权。

## 2. R0-B 冻结时核验事实

### 2.1 R0-B1 冻结时仓库宿主

冻结时安装快照为：

| 项目 | 冻结时实际版本 | 事实 |
| --- | --- | --- |
| Node.js | `24.14.0` | 满足 Vite 8 与冻结 React 插件的 Node 要求 |
| Vite | `8.1.5` | 已安装宿主；本阶段不升级到注册表当前 `8.2.1` |
| TypeScript | `6.0.3` | 已安装宿主；本阶段不升级到注册表当前 `7.0.2` |
| Vue | `3.5.40` | 继续承担站点、路由、内容和 Demo 外壳 |
| `@vitejs/plugin-vue` | `6.0.8` | 继续处理 Vue SFC |
| React 生态包 | 未安装 | R0-B1 冻结时，`react`、`react-dom`、类型包和 React Vite 插件均为空 |

这里的 TypeScript `6.0.3` 是 R0-B1/R0-B2 的宿主快照，不是后续 React 课程的知识基线。RC1 实施后
已按用户修订将课程知识统一到 npm `latest` 的 TypeScript `7.0.2`；本地宿主暂留 `6.0.3`，因为
TypeScript 7.0.2 不再导出 `typescript/lib/tsc`，当前最新版 `vue-tsc@3.3.9` 仍依赖该入口。课程使用
独立 TypeScript 7.0.2 fixture 取证，本地 `vue-tsc` 只作为宿主兼容 Gate。

Vite 8.1.5 官方文档说明 `.jsx`、`.tsx` 可由 Vite 自带转换器处理，并同时把
`@vitejs/plugin-react` 与 `@vitejs/plugin-react-swc` 列为 Vite 官方组织维护的 React 集成。
所以“Vue 项目不能运行 React”不是事实；需要决定的是是否增加 React 专用插件、如何隔离运行时，以及
如何处理 root 生命周期。

### 2.2 精确版本冻结

2026-08-08 对 npm 注册表、官方仓库和本地安装快照的核验结果如下：

| 包或合同 | 冻结版本 | 兼容性与来源事实 | 项目处理 |
| --- | --- | --- | --- |
| `react` | `19.2.8` | npm `latest`；源码 tag `v19.2.8` 指向 `1dd4ecbd...` | 生产依赖精确锁定 |
| `react-dom` | `19.2.8` | npm `latest`；peer 为 `react: ^19.2.8`；与 React 同一 commit | 与 React 完全同版 |
| JSX runtime | 随 `react@19.2.8` | 包导出 `react/jsx-runtime`、`react/jsx-dev-runtime`，不是独立包 | 使用 automatic runtime |
| `@types/react` | `19.2.18` | npm `latest` 与 `ts6.0` tag 都指向此版 | 开发依赖精确锁定 |
| `@types/react-dom` | `19.2.4` | npm `latest` 与 `ts6.0` tag 都指向此版；peer 为 `@types/react: ^19.2.0` | 开发依赖精确锁定 |
| `@vitejs/plugin-react` | `6.0.5` | npm `latest`；peer 为 `vite: ^8.0.0`；Node 要求被当前环境满足 | R0-B2 默认插件 |
| `@vitejs/plugin-react-swc` | `4.3.3` | peer 覆盖 Vite 4 至 8；官方 README 已建议 Rolldown/Vite 8 场景优先评估默认插件 | 只作备选 |

React 与 React DOM 的冻结包 tag、npm `gitHead` 和包内版本一致。React 官方站点只按 minor 展示
`19.2`，不会为每个 patch 发布独立文档；因此本文把包源码与文档源码分开固定：

- 运行时源码：`react@19.2.8` / `react-dom@19.2.8`，commit
  `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。
- 官方文档：`reactjs/react.dev` commit
  `c7d6b700038c63d1aaf2c649af1aefe01ebbacac`，页面显示 `19.2`。
- Vite 宿主：继续使用本地 `8.1.5`；其 tag 指向 annotated tag object
  `14d3f9e888d5e635c7ece5d7e4af9e52e115b6e1`。
- React Vite 插件：`6.0.5`，commit
  `68c0cb8796ce18bd049c3d05c5210eaf0617eac0`。

### 2.3 JSX/TSX 冻结合同

TypeScript 官方 `jsx` 文档说明：`react-jsx` 会生成对 `react/jsx-runtime` 的自动导入，
`react-jsxdev` 会生成对 `react/jsx-dev-runtime` 的开发导入。React Vite 默认插件也默认使用 automatic
JSX runtime。

冻结为：

- React Demo 使用 `.tsx`。
- TypeScript 的 React TSX 路径使用 `jsx: "react-jsx"`。
- 不设置 `jsxImportSource`，让默认来源保持 `react`。
- 不使用 classic `React.createElement` 作为课程主线。
- JSX runtime 不单独计版本，也不创建独立 Reference 分母。
- 当前 Vue SFC 继续由 Vue 插件处理；React 插件只处理其默认包含的 JS/JSX/TS/TSX 路径。

R0-B2 必须先用最小 fixture 比较全局 `tsconfig.app.json` 与 React Technology 独立 TSConfig，再采用
能同时通过 `vue-tsc --build`、Vite 转换和编辑器类型检查的最小配置；不得借机升级 TypeScript。

### 2.4 Vite React 插件的真实取舍

候选 A，`@vitejs/plugin-react@6.0.5`：

- 是官方 README 定义的默认 Vite React 插件。
- 提供 Fast Refresh 与 automatic JSX runtime。
- 与本地 Vite 8.1.5 的 peer 范围兼容。
- React Compiler 的 Babel/Rolldown 依赖是 optional peer；不安装这些依赖就不会启用 Compiler。
- 开发服务器会使用 React Refresh preamble。它不是 `react` 或 `react-dom` runtime，但属于 React 专用
  开发工具字节，可能出现在所有开发页的 HTML/网络中。

候选 B，不安装 React 专用插件：

- Vite 8.1.5 自带 JSX/TSX 转换，生产 Demo 仍可运行。
- 不会注入 React Refresh preamble。
- 放弃 React Fast Refresh，开发体验和官方 React 集成能力更弱。

候选 C，`@vitejs/plugin-react-swc@4.3.3`：

- 同样提供 Fast Refresh 与 automatic runtime。
- 增加 SWC 依赖和专属转换边界。
- 官方 README 说明其选项受限，并在 Rolldown/Vite 8 场景提供切回默认插件的推荐开关。
- 当前项目没有必须依赖 SWC plugin 的需求。

项目正式选择候选 A：`@vitejs/plugin-react@6.0.5`。生产环境非 React 页面不得加载 `react`、
`react-dom`、`scheduler` 或目标 TSX chunk；开发期允许全局 React Refresh preamble，但仍不得提前请求
React runtime。候选 B 与 C 只保留为决策证据。

## 3. 官方 Reference 冻结分母

### 3.1 统计规则

统计源固定为上述 react.dev commit 的 `src/sidebarReference.json` 与对应 Reference 正文：

- 只把 sidebar 的叶子 API、Hook 或 Component 当作 official key。
- Overview、Hooks/Components/APIs landing、section header 和导航页不重复计数。
- sidebar 明标 Canary、Experimental，或正文使用 `ExperimentalBadge` 的项不计稳定分母。
- Legacy 单独登记；removed 只登记迁移边界。
- React Compiler、DevTools、eslint plugin、Rules of React 和 RSC 属于其他观察范围，不混入 Core SPA
  分母。
- 上游稳定但只能在测试、RSC、server/static 环境成立的项，先进入稳定 census，再按当前宿主标记
  `deferred`，不得写成浏览器已验证。

由此得到两个不能混用的数字：

| 口径 | React | React DOM | 合计 |
| --- | ---: | ---: | ---: |
| 上游未标 Canary/Experimental/Legacy 的稳定叶子项 | 32 | 31 | 63 |
| 冻结时 SPA 可真实验证的 Gate RC 稳定项 | 29 | 23 | 52 |
| 稳定但冻结时 Gate RC deferred | 3 | 8 | 11 |

Gate RC 稳定 officialKey 分母冻结为 `52`，同时永久保存上游稳定 census `63` 和 11 个 deferred。
这样不会丢失稳定 API，也不会拿普通 SPA smoke 冒充 server/RSC/test 验证。

### 3.2 React 稳定 officialKey：29

#### Hooks：18

| officialKey | 官方页面 | 冻结深度 |
| --- | --- | --- |
| `react.hooks.useActionState` | [useActionState](https://react.dev/reference/react/useActionState) | `detail` |
| `react.hooks.useCallback` | [useCallback](https://react.dev/reference/react/useCallback) | `merged` |
| `react.hooks.useContext` | [useContext](https://react.dev/reference/react/useContext) | `detail` |
| `react.hooks.useDebugValue` | [useDebugValue](https://react.dev/reference/react/useDebugValue) | `quick` |
| `react.hooks.useDeferredValue` | [useDeferredValue](https://react.dev/reference/react/useDeferredValue) | `detail` |
| `react.hooks.useEffect` | [useEffect](https://react.dev/reference/react/useEffect) | `detail` |
| `react.hooks.useEffectEvent` | [useEffectEvent](https://react.dev/reference/react/useEffectEvent) | `detail` |
| `react.hooks.useId` | [useId](https://react.dev/reference/react/useId) | `merged` |
| `react.hooks.useImperativeHandle` | [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle) | `merged` |
| `react.hooks.useInsertionEffect` | [useInsertionEffect](https://react.dev/reference/react/useInsertionEffect) | `quick` |
| `react.hooks.useLayoutEffect` | [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect) | `merged` |
| `react.hooks.useMemo` | [useMemo](https://react.dev/reference/react/useMemo) | `merged` |
| `react.hooks.useOptimistic` | [useOptimistic](https://react.dev/reference/react/useOptimistic) | `detail` |
| `react.hooks.useReducer` | [useReducer](https://react.dev/reference/react/useReducer) | `detail` |
| `react.hooks.useRef` | [useRef](https://react.dev/reference/react/useRef) | `detail` |
| `react.hooks.useState` | [useState](https://react.dev/reference/react/useState) | `detail` |
| `react.hooks.useSyncExternalStore` | [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) | `detail` |
| `react.hooks.useTransition` | [useTransition](https://react.dev/reference/react/useTransition) | `detail` |

#### Components：5

| officialKey | 官方页面 | 冻结深度 |
| --- | --- | --- |
| `react.components.Fragment` | [Fragment](https://react.dev/reference/react/Fragment) | `merged` |
| `react.components.Profiler` | [Profiler](https://react.dev/reference/react/Profiler) | `detail` |
| `react.components.StrictMode` | [StrictMode](https://react.dev/reference/react/StrictMode) | `detail` |
| `react.components.Suspense` | [Suspense](https://react.dev/reference/react/Suspense) | `detail` |
| `react.components.Activity` | [Activity](https://react.dev/reference/react/Activity) | `detail` |

#### APIs：6

| officialKey | 官方页面 | 冻结深度 |
| --- | --- | --- |
| `react.apis.captureOwnerStack` | [captureOwnerStack](https://react.dev/reference/react/captureOwnerStack) | `quick` |
| `react.apis.createContext` | [createContext](https://react.dev/reference/react/createContext) | `detail` |
| `react.apis.lazy` | [lazy](https://react.dev/reference/react/lazy) | `detail` |
| `react.apis.memo` | [memo](https://react.dev/reference/react/memo) | `merged` |
| `react.apis.startTransition` | [startTransition](https://react.dev/reference/react/startTransition) | `detail` |
| `react.apis.use` | [use](https://react.dev/reference/react/use) | `detail` |

### 3.3 React DOM 稳定 officialKey：23

#### Hook：1

| officialKey | 官方页面 | 冻结深度 |
| --- | --- | --- |
| `react-dom.hooks.useFormStatus` | [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus) | `detail` |

#### Components：12

| officialKey | 官方页面 | 冻结深度 |
| --- | --- | --- |
| `react-dom.components.common` | [Common DOM](https://react.dev/reference/react-dom/components/common) | `detail` |
| `react-dom.components.form` | [form](https://react.dev/reference/react-dom/components/form) | `detail` |
| `react-dom.components.input` | [input](https://react.dev/reference/react-dom/components/input) | `detail` |
| `react-dom.components.option` | [option](https://react.dev/reference/react-dom/components/option) | `merged` |
| `react-dom.components.progress` | [progress](https://react.dev/reference/react-dom/components/progress) | `quick` |
| `react-dom.components.select` | [select](https://react.dev/reference/react-dom/components/select) | `detail` |
| `react-dom.components.textarea` | [textarea](https://react.dev/reference/react-dom/components/textarea) | `detail` |
| `react-dom.components.link` | [link](https://react.dev/reference/react-dom/components/link) | `merged` |
| `react-dom.components.meta` | [meta](https://react.dev/reference/react-dom/components/meta) | `merged` |
| `react-dom.components.script` | [script](https://react.dev/reference/react-dom/components/script) | `merged` |
| `react-dom.components.style` | [style](https://react.dev/reference/react-dom/components/style) | `merged` |
| `react-dom.components.title` | [title](https://react.dev/reference/react-dom/components/title) | `merged` |

#### APIs：8

| officialKey | 官方页面 | 冻结深度 |
| --- | --- | --- |
| `react-dom.apis.createPortal` | [createPortal](https://react.dev/reference/react-dom/createPortal) | `detail` |
| `react-dom.apis.flushSync` | [flushSync](https://react.dev/reference/react-dom/flushSync) | `detail` |
| `react-dom.apis.preconnect` | [preconnect](https://react.dev/reference/react-dom/preconnect) | `merged` |
| `react-dom.apis.prefetchDNS` | [prefetchDNS](https://react.dev/reference/react-dom/prefetchDNS) | `merged` |
| `react-dom.apis.preinit` | [preinit](https://react.dev/reference/react-dom/preinit) | `merged` |
| `react-dom.apis.preinitModule` | [preinitModule](https://react.dev/reference/react-dom/preinitModule) | `merged` |
| `react-dom.apis.preload` | [preload](https://react.dev/reference/react-dom/preload) | `merged` |
| `react-dom.apis.preloadModule` | [preloadModule](https://react.dev/reference/react-dom/preloadModule) | `merged` |

#### Client APIs：2

| officialKey | 官方页面 | 冻结深度 |
| --- | --- | --- |
| `react-dom.client.createRoot` | [createRoot](https://react.dev/reference/react-dom/client/createRoot) | `detail` |
| `react-dom.client.hydrateRoot` | [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) | `detail` |

### 3.4 稳定但 deferred：11

| 范围 | 项目 | deferred 原因 |
| --- | --- | --- |
| 测试 | `react.apis.act` | R0-A 已把通用测试放到 Q 阶段 |
| RSC | `react.apis.cache`、`react.apis.cacheSignal` | 官方正文明确限定 React Server Components |
| `react-dom/server` | `renderToPipeableStream`、`renderToReadableStream`、`renderToStaticMarkup`、`renderToString`、`resume`、`resumeToPipeableStream` | 冻结范围的 Module 是 Vue 宿主中的客户端 SPA，不具备完整 server runtime 合同 |
| `react-dom/static` | `prerender`、`prerenderToNodeStream` | 需要独立 server/static fixture；不在当前站点运行路径 |

`hydrateRoot` 仍保留在 52 分母中，因为它属于稳定 client API，可用固定 server-like HTML 的独立
`/tmp` fixture 验证 hydration、错误回调与卸载，而不必把站点改成 SSR。

### 3.5 观察与排除清单

| 状态 | 数量 | 项目 |
| --- | ---: | --- |
| Canary | 2 | `ViewTransition`、`addTransitionType` |
| Experimental | 4 | 两个 `experimental_taint*`、两个 `resumeAndPrerender*`；后两项虽随包导出，官方 static index 仍加 Experimental badge |
| Legacy | 8 | `Children`、`cloneElement`、`Component`、`createElement`、`createRef`、`forwardRef`、`isValidElement`、`PureComponent` |
| Removed callout | 12 | React legacy 页 6 项、React DOM index 6 项；只讲迁移，不创建稳定键 |
| React Compiler | 8 个 sidebar 叶子项 | Compiler 已稳定，但属于构建期观察范围，不启用、不计 Gate RC |
| React DevTools | 1 | 工具观察，后续 Q 阶段处理 |
| eslint plugin | 17 个 lint 页 | 工具观察，后续 Q 阶段处理 |
| Rules of React | 3 个规则页 | 作为课程横切规范引用，不按 runtime API 计数 |
| RSC | 4 个叶子页 | Server Components、Server Functions、`use client`、`use server`，只登记边界 |

`react/jsx-runtime`、`react/jsx-dev-runtime` 是编译合同，不是官方 sidebar Reference 项。
`react/compiler-runtime` 属于 Compiler 范围。`react-dom` 包内未由冻结时官方稳定 sidebar 建立公共教学合同的
profiling、test-utils、`unstable_*` 与 source export 不进入稳定分母。

## 4. R0-B 初始 React Core 课程冻结

### 4.1 数量与 ID 规则

R0-B 当时把课程候选冻结为 `24` 课，按 RC1、RC2、RC3 各 8 课串行实施。后续曾将 RC1 修订为
20 篇、RC2 修订为 29 篇单知识点课程，因此本节只保留初始决策历史，不再定义现行数量或 ID。现行
合同统一见 [`React课程调整总计划.md`](./React课程调整总计划.md)。

稳定 ID 使用 R0-A 冻结的 `react.core` 前缀：

```text
react.core.learn.<stage>.<slug>
```

课程以已完成的 TypeScript 与 Vite 为工程前置，不重复完整类型系统和构建工具教学。每课内部仍需说明
React 专属 TSX 类型、渲染时机和 browser 行为。

### 4.2 RC1 初始候选：基础课程，8 课（已被替代）

| 顺序 | 稳定 ID | 课程问题 | 前置 |
| ---: | --- | --- | --- |
| 1 | `react.core.learn.basics.tsx-runtime-and-root` | TSX 如何变成 React element，Vue 宿主如何创建独立 root | Gate T、Gate V、R0-B |
| 2 | `react.core.learn.basics.components-and-module-boundaries` | 函数组件、导入导出和组件树如何组织 | 1 |
| 3 | `react.core.learn.basics.props-children-and-composition` | Props、children 与组合如何形成单向数据合同 | 2 |
| 4 | `react.core.learn.basics.conditional-rendering-and-lists` | 条件、列表和 key 如何影响 identity | 3 |
| 5 | `react.core.learn.basics.events-state-and-snapshots` | 事件、State snapshot 与一次 render 的闭包如何工作 | 4 |
| 6 | `react.core.learn.basics.queued-and-immutable-state-updates` | update queue、函数式更新和对象/数组不可变更新 | 5 |
| 7 | `react.core.learn.basics.controlled-forms-and-dom-props` | 受控表单、DOM props 与提交边界 | 6 |
| 8 | `react.core.learn.basics.component-design-and-thinking-in-react` | 如何拆组件、定位 State、建立最小数据流 | 7 |

批次验证载体冻结为一个可筛选、可编辑的小型数据表。它必须覆盖组件树、Props、列表 key、受控表单、
State 更新与组合，但不能引入 Router、第三方 store 或远程数据缓存。

### 4.3 RC2 初始候选：中级课程，8 课（已被替代）

| 顺序 | 稳定 ID | 课程问题 | 前置 |
| ---: | --- | --- | --- |
| 9 | `react.core.learn.intermediate.state-structure-and-derived-values` | 如何避免重复、矛盾和可派生 State | RC1 |
| 10 | `react.core.learn.intermediate.sharing-and-resetting-state` | 提升 State、受控边界、position/key 与重置 | 9 |
| 11 | `react.core.learn.intermediate.reducers-and-actions` | Reducer 如何把更新意图与状态转换分开 | 10 |
| 12 | `react.core.learn.intermediate.context-and-provider-boundaries` | Context 的读取、默认值与 provider 边界 | 11 |
| 13 | `react.core.learn.intermediate.reducer-context-and-scaling` | Reducer 与 Context 如何组合，何时不该升级为全局状态 | 12 |
| 14 | `react.core.learn.intermediate.refs-dom-and-imperative-escape-hatches` | Ref、DOM、`useImperativeHandle`、layout/insertion 时机 | 13 |
| 15 | `react.core.learn.intermediate.effects-lifecycle-and-cleanup` | Effect 如何同步外部系统并可靠清理 | 14 |
| 16 | `react.core.learn.intermediate.effect-events-and-custom-hooks` | 依赖、`useEffectEvent`、无需 Effect 的情况与自定义 Hook | 15 |

批次验证载体冻结为一个本地任务工作台。Reducer 与 Context 管理可共享任务状态，Effect 只同步一个
可观察外部系统，离开页面必须证明 listener、timer 或 subscription 已清理。

### 4.4 RC3：高级课程，历史 8 个聚合占位（已由 24 课冻结计划替换）

以下表格是 R0-B 初始冻结时的聚合占位历史，不是现行课程清单。调整前的 RC3 后续曾由
[`RC3-高级课程单知识点计划.md`](./RC3-高级课程单知识点计划.md) 拆分为 24 篇单知识点课程；现行
课程范围统一见 [`React课程调整总计划.md`](./React课程调整总计划.md)。原 8 个 ID 未发布、无旧 URL
重定向。

| 顺序 | 稳定 ID | 课程问题 | 前置 |
| ---: | --- | --- | --- |
| 17 | `react.core.learn.advanced.memoization-profiler-and-compiler-boundary` | `memo`、Memo Hooks、Profiler 与 Compiler 的责任边界 | RC2 |
| 18 | `react.core.learn.advanced.lazy-suspense-and-use` | code split、Suspense 与 `use` 如何组合 | 17 |
| 19 | `react.core.learn.advanced.transitions-deferred-values-and-activity` | urgent/non-urgent 更新、deferred value 与 Activity | 18 |
| 20 | `react.core.learn.advanced.actions-optimistic-ui-and-form-status` | Action、optimistic state 与 form pending 状态 | 19 |
| 21 | `react.core.learn.advanced.external-store-and-subscription-contracts` | `useSyncExternalStore` 如何建立并发安全订阅 interface | 20 |
| 22 | `react.core.learn.advanced.portals-flush-sync-and-multiple-roots` | Portal、`flushSync`、多 root 与跨宿主 DOM 所有权 | 21 |
| 23 | `react.core.learn.advanced.error-boundaries-strict-mode-and-recovery` | render 错误、Strict Mode、root error callbacks 与恢复 | 22 |
| 24 | `react.core.learn.advanced.hydration-resource-hints-and-server-boundary` | hydration、metadata/resource APIs 与 server/static deferred 边界 | 23 |

批次验证载体冻结为一个按需加载的资源面板。它需要真实 Suspense、Transition、optimistic action、外部
store 订阅与错误恢复，但网络数据只用可控 `/tmp` fixture 或页面内 promise，不提前引入 `react/data`。

第 23 课允许一项已确认的 legacy 例外：React 官方目前仍以 class `Component` 实现 Error Boundary，
且没有等价的函数组件 API。课程只为 Error Boundary 教最小 class 实现，并明确 `Component` 仍在 Legacy
观察清单、不进入 52 稳定分母。

### 4.5 每批验证合同

本节记录 R0-B 初始批次合同。后续 RC1 曾改为逐知识点串行闭环，不再按 8 课整批实施；现行课程 Gate
见 [`React课程调整总计划.md`](./React课程调整总计划.md)。初始冻结的最小 Gate 为：

- 每个课程 ID 唯一、依赖只指向已存在条目、总览可导航。
- TSX 由当前 TypeScript 和 Vite 真实处理，不能只做代码高亮。
- Demo 运行源码与 `?raw` 展示源码同源。
- scoped type-check、lint、format、build 通过。
- 代表交互使用 Playwright 在桌面与 390px 复跑，console error 与 root warning 为零。
- 进入、切换、离开 React Demo 后无残留 DOM、listener、timer 或 subscription。
- 临时 fixture 使用 `mktemp` 放在 `/tmp`，完成后证明不存在；不保留持久测试文件。

## 5. RCA Reference 冻结批次

RCA 不为 52 个键机械创建 52 篇长文。冻结为两批发布、12 个聚合 entry：

| 批次 | entry | 主要 officialKey |
| --- | --- | --- |
| RCA-1 | `state-and-reducer-hooks` | `useState`、`useReducer` |
| RCA-1 | `context-and-external-store-hooks` | `useContext`、`useSyncExternalStore`、`createContext` |
| RCA-1 | `effect-hooks` | `useEffect`、`useEffectEvent`、`useInsertionEffect`、`useLayoutEffect` |
| RCA-1 | `ref-and-identity-hooks` | `useRef`、`useImperativeHandle`、`useId`、`useDebugValue` |
| RCA-1 | `performance-and-transition-hooks` | `useCallback`、`useMemo`、`useDeferredValue`、`useTransition`、`memo`、`startTransition` |
| RCA-1 | `actions-resources-and-async-hooks` | `useActionState`、`useOptimistic`、`use`、`lazy` |
| RCA-1 | `built-in-components-and-debugging` | Fragment、Profiler、StrictMode、Suspense、Activity、`captureOwnerStack` |
| RCA-2 | `dom-elements-and-common-props` | Common DOM 与普通 DOM 元素合同 |
| RCA-2 | `forms-and-controls` | form、input、option、progress、select、textarea、`useFormStatus` |
| RCA-2 | `metadata-and-resource-elements` | link、meta、script、style、title |
| RCA-2 | `dom-roots-and-portals` | createRoot、hydrateRoot、createPortal、flushSync |
| RCA-2 | `resource-preloading-apis` | 6 个 resource hint/preinit/preload API |

每个索引键必须保存 `officialKey`、官方 URL、`detail | merged | quick`、状态与真实 target。RCA Gate 必须
比较固定 52 键与 manifest 的双向差集，available target 必须能从总览进入正文和唯一锚点。11 个
deferred 与观察项使用独立 `observationScopes`，不伪造 planned 正文。

## 6. Vue 宿主 React Demo Adapter 冻结合同

### 6.1 现状约束

当前 `demo-registry.ts` 的本地 Demo loader 只返回 Vue `Component`，`DemoBox.vue` 使用 Vue
`<component>` 直接渲染。React component 不能直接塞进这条 interface；否则既没有 `createRoot`，也没有
React root 的卸载时机。

React 官方“Add React to an Existing Project”明确支持把 React 渲染到由其他技术构建的现有页面局部。
`createRoot` 官方 Reference 也明确要求：当外部宿主可能移除 root DOM 时，应先调用
`root.unmount()`，让 React 清理 event handler、state 与全局资源。

### 6.2 最小改动方向

R0-B2 保留现有 Vue Demo 分支，只给 registry 增加一个明确的 React 判别分支：

```text
DemoBox.vue
  -> Vue asset：继续使用现有异步 Vue component
  -> React asset：交给 Vue ReactDemoHost.vue
       -> 进入 stage 后才动态加载 React adapter、react、react-dom/client 与目标 TSX
       -> adapter createRoot(container).render(component)
       -> ID 变化或宿主卸载时 root.unmount()
```

React 分支保存 `runtime: 'react'`、`loadComponent()` 与 `loadSource()`；如需组件类型，只使用
`import type`，不能产生 React runtime 静态导入。`ReactDemoHost.vue` 才负责动态导入
`react`、`react-dom/client` 和目标 component。当前没有第三种 runtime 需求，因此不建立通用插件系统、
adapter registry 或可配置 mount framework。

### 6.3 强制生命周期合同

- 每个已挂载 Demo 有且只有一个明确 root 与一个独占 container。
- 第一次 `render` 前完成 container 所有权检查，不在 `document.body` 或 Vue 管理节点上直接建 root。
- Demo ID 改变时，先对旧 root 调用 `unmount()`，再开始新 loader。
- 宿主 `onBeforeUnmount` 设置取消标记并同步卸载已有 root；迟到的 dynamic import 不得重新挂载。
- 重复进入同一 Demo 不对同一 container 重复调用 `createRoot`。
- root `onUncaughtError`、`onRecoverableError` 进入宿主可见失败状态，不破坏全站导航；RC3 第 4 课接入
  Error Boundary 后，`onCaughtError` 保留由局部 fallback 承接的失败，不再重复升级为宿主错误。
- adapter 失败只替换当前 Demo stage；源码查看和其他 Technology 仍可用。
- Demo 自身的 Effect 必须返回 cleanup；adapter 不替业务 Demo 猜测或遍历清理资源。
- 运行组件和展示源码必须来自同一个 `.tsx` 路径；manifest 使用完整限定 Demo ID。
- 所有 React Demo 默认使用 `StrictMode`，课程明确解释开发期重复检查；不得由单个 Demo 随意关闭。

### 6.4 按需加载合同

生产构建必须形成独立的 React runtime、adapter 与 TSX dynamic chunk，且：

1. 打开首页、Vue、TypeScript、Vite 页面，不请求 `react`、`react-dom`、`scheduler`、adapter 或 React
   Demo chunk。
2. 打开 React Technology 或 Module 轻量总览但不运行 Demo，仍不请求上述 runtime chunk。
3. 只有包含真实 React Demo 的 stage 挂载后才请求 runtime 与目标 TSX。
4. 展开源码只请求相同 TSX 的 raw source，不创建第二个 root。
5. 构建 manifest 的 entry/import/dynamicImport 关系与 Playwright 网络记录必须同时证明合同。

开发期使用已冻结的默认 React 插件，允许 `/@react-refresh` preamble 全局出现，但不能把它误报为
`react`/`react-dom` runtime 已提前加载。R0-B2 不得重新切换为无插件或 SWC 方案；改变插件选择必须
重新调研并获得明确授权。

### 6.5 最小垂直切片验收合同

垂直切片只需要一个 `LifecycleProbe` TSX Demo：

- 一个计数按钮，证明 event 与 state 真正由 React 管理。
- 一个 Effect 注册可计数 listener 或 timer，并在 cleanup 中撤销。
- 一个可触发的受控错误路径，证明失败只影响当前 stage。
- 同一 `.tsx` 通过 `?raw` 展示，展示内容含实际按钮和 cleanup。

Playwright 至少复跑三轮“非 React 页 -> React Demo -> 切换或离开 -> 返回”：

- 初始非 React 页网络中 runtime 请求为 0。
- 首次进入后计数交互有效，源码与运行源一致。
- 每轮离开后 stage 中 React DOM 为 0，listener/timer 计数回到基线。
- 全程 duplicate root warning、uncaught console error、unhandled rejection 为 0。
- 生产构建产物没有把 React runtime 合入初始 entry。

## 7. 阶段边界冻结

R0-B 正式拆成两个串行检查点，避免范围决策自动授权安装依赖与修改运行时：

```text
R0-B1 讨论与冻结（已完成）
  -> 版本、插件、52 分母、24 课、legacy 例外和 StrictMode 已确认
  -> 停止
R0-B2 宿主 admission 与最小垂直切片（已完成）
  -> 安装精确依赖、实现 adapter、验证按需加载与卸载
  -> Standards / Spec 复审
  -> 停止
RC1 -> RC2 -> RC3 -> RCA-1 -> RCA-2 -> Gate RC（R0-B 冻结时顺序）
```

R0-B2 完成后必须停止。RC1 的课程实现需要新的明确授权，不得由宿主 admission 自动推进。

## 8. 已确认决策

用户已确认以下六项：

1. **版本**：精确采用 React/DOM `19.2.8`、类型 `19.2.18`/`19.2.4`，保持本地 Vite `8.1.5` 与
   TypeScript `6.0.3` 不升级。该项只记录 R0-B2 宿主决定；RC1 课程知识基线随后修订为 TypeScript
   `7.0.2`，不再沿用宿主版本作为教学版本。
2. **插件**：采用默认 React 插件 `6.0.5`，接受开发期 Refresh preamble 例外；生产期仍严格按需加载。
3. **Reference 分母**：使用冻结时 SPA 可实证的 `52` 作为 Gate RC 分母，同时登记上游稳定 `63` 与
   deferred `11`。
4. **课程数（历史决定）**：最初冻结为 RC1/RC2/RC3 各 8 课，共 24 课；RCA 使用 12 个聚合 entry
   覆盖 52 个键。RC1 随后曾修订为 20 篇、RC2 曾修订为 29 篇单知识点课程；现行课程数量与顺序统一
   以 [`React课程调整总计划.md`](./React课程调整总计划.md) 为准。
5. **Error Boundary**：第 23 课允许最小 class `Component` 作为明确标注的 legacy 例外，但不进入稳定
   Reference 分母。
6. **阶段与 StrictMode**：R0-B1 冻结后停止，R0-B2 再实现 adapter；所有 React Demo 默认启用
   StrictMode，并在课程中解释开发期重复检查。

## 9. R0-B1 自审

### Standards

- `PASS / 0 finding`：版本、源码、文档侧栏、插件与类型事实均回到官方来源。
- `PASS / 0 finding`：稳定、deferred、Canary、Experimental、Legacy 与工具范围分开统计。
- `PASS / 0 finding`：未安装依赖，未修改 Vite、TSConfig、registry、运行时、课程或 Demo。
- `PASS / 0 finding`：现有 dirty worktree 未清理、回退、暂存或覆盖。

### Spec

- `PASS / 0 finding`：React/DOM、类型与插件精确版本已冻结，Vite 与 TypeScript 保持当前版本。
- `PASS / 0 finding`：Gate RC 分母为 52，上游稳定 63 与 deferred 11 独立保留。
- `PASS / 0 finding`：RC1/RC2/RC3 共 24 课，RCA 12 个聚合 entry，ID、前置与验证载体已冻结。
- `PASS / 0 finding`：Error Boundary legacy 例外、StrictMode、Adapter 与按需加载合同已冻结。
- `PASS / 0 finding`：R0-B1 与 R0-B2 已拆分，本文没有越过 R0-B2 授权边界。

## 10. R0-B2 实施与验收

### 10.1 实施结果

- 精确安装 `react@19.2.8`、`react-dom@19.2.8`、`@types/react@19.2.18`、
  `@types/react-dom@19.2.4` 与 `@vitejs/plugin-react@6.0.5`。npm 11 因插件的 optional Babel peer
  解析失败，安装时只使用 `--legacy-peer-deps`；未安装 React Compiler、Babel 8 或
  `@rolldown/plugin-babel`。
- 新增独立 `tsconfig.react.json`，使用 `jsx: "react-jsx"` 并包含 Vite 类型声明；Vue TSConfig 排除
  React TSX，避免继承 Vue 全局 `jsxImportSource`。
- Demo registry 只增加 Vue/React 判别联合；`DemoBox.vue` 按需加载 `ReactDemoHost.vue`，宿主再动态
  加载 React、`react-dom/client` 和目标 TSX。Adapter chunk 失败只替换当前 stage；用户仍可查看源码或
  导航，也可显式重新加载页面，以新文档环境清除浏览器缓存的失败 ESM 模块。
- Adapter 使用唯一 container、`StrictMode`、root 三类错误回调、迟到加载取消和同步
  `root.unmount()`；受控失败保留当前 Demo 的源码查看与重新加载能力。
- R0-B2 验收时，`react/core` 只发布唯一 `LifecycleProbe` admission Demo。运行组件与 `?raw` 展示
  来自同一 TSX，专属样式也保留在该 Demo 目录；该快照中的 React 课程和 Reference 均为 `0`。

### 10.2 验收证据

- 构建 manifest 证明：初始 entry 的静态闭包只有 Vue runtime；`DemoBox -> ReactDemoHost`、
  `ReactDemoHost -> React + react-dom/client`、`Catalog -> TSX + raw source` 均为动态边，raw chunk 的
  runtime import 为 `0`。
- 生产预览中，首页和未选择 Demo 的 React Module 均未请求 Adapter、React runtime、TSX 或 raw
  chunk；选择 Demo 后才加载前三者，展开源码后才加载 raw chunk。
- 计数、宿主信号、受控错误与重新加载均通过。三轮进入/离开后 `activeListeners=0`、React DOM 残留为
  `0`，console error/warning 为 `0/0`。
- 生产预览故障注入主动中断首次 Adapter chunk：错误只替换当前 stage，源码按钮与导航仍可用；解除
  故障后点击重新加载页面并再次选择 Demo，React Demo 成功恢复。
- 桌面与 390px 均无横向溢出；390px 下三个操作按钮都保持在 viewport 内且文字未溢出。
- 首次浏览器验收时，并行 Java 课程曾把已发布 entry 保留为 `planned`，因此先在 `/tmp` 当前源码副本
  中只临时把该项标为 `available`。最终修正复验前，并行 Java 工作已将根工作区对应状态推进为
  `available`；本轮未修改 Java 文件，并已直接对当前根工作区生产预览复跑上述 manifest、故障恢复、
  生命周期、桌面与 390px 路径。

### 10.3 R0-B2 自审

#### Standards

- `PASS / 0 finding`：改动限于精确依赖、独立 TSX 配置、React 判别分支、Adapter、admission Demo 与
  状态文档；未进入课程或 Reference。
- `PASS / 0 finding`：构建 manifest 与真实浏览器网络共同证明按需加载；三轮生命周期证据证明清理。
- `PASS / 0 finding`：未启用 Compiler，未切换 SWC，未清理、回退、暂存或覆盖其他工作区资产。
- `PASS / 0 finding`：独立复审指出的 Demo 专属样式归属问题已修正，最终 Standards 复审为
  `PASS / 0 finding`。

#### Spec

- `PASS / 0 finding`：精确版本、automatic JSX runtime、StrictMode、唯一 root、错误隔离和同源源码合同
  均已实现。
- `PASS / 0 finding`：首页、React 轻量总览、运行 stage 与源码展开四个加载阶段已经分别验证。
- `PASS / 0 finding`：在 R0-B2 验收快照中，React 课程与 Reference 保持 `0`，RC1、RCA、RR0 和
  Gate RC 均未开始。
- `PASS / 0 finding`：独立复审指出的 Adapter 加载失败隔离问题已修正，并以生产故障注入验证页面级
  恢复；最终 Spec 复审为 `PASS / 0 finding`。

## 11. 官方来源

- [React npm registry 19.2.8](https://registry.npmjs.org/react/19.2.8) 与
  [React v19.2.8 source](https://github.com/facebook/react/tree/v19.2.8) - runtime 版本、tag 与 package
  exports。
- [React DOM npm registry 19.2.8](https://registry.npmjs.org/react-dom/19.2.8) - 与 React 的 peer
  compatibility。
- [React Versions](https://react.dev/versions) 与
  [Versioning Policy](https://react.dev/community/versioning-policy) - 19.2 文档口径及 Latest、Canary、
  Experimental 边界。
- [React Reference Overview](https://react.dev/reference/react)、
  [React DOM APIs](https://react.dev/reference/react-dom)、
  [Client APIs](https://react.dev/reference/react-dom/client)、
  [Server APIs](https://react.dev/reference/react-dom/server) 与
  [Static APIs](https://react.dev/reference/react-dom/static) - sidebar 分类与环境边界。
- [固定 sidebar source](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/sidebarReference.json) -
  63/52/11 统计源。
- [React Learn sidebar source](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/sidebarLearn.json) -
  课程主题与顺序来源。
- [Add React to an Existing Project](https://react.dev/learn/add-react-to-an-existing-project) 与
  [createRoot](https://react.dev/reference/react-dom/client/createRoot) - 异构宿主、多 root 与 unmount 合同。
- [Using TypeScript](https://react.dev/learn/typescript)、
  [TypeScript jsx](https://www.typescriptlang.org/tsconfig/jsx.html) 与
  [jsxImportSource](https://www.typescriptlang.org/tsconfig/jsxImportSource.html) - TSX 和 automatic runtime。
- [Vite 8.1.5 Features](https://github.com/vitejs/vite/blob/v8.1.5/docs/guide/features.md#jsx) - Vite
  原生 JSX/TSX 与官方 React 插件入口。
- [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react/tree/plugin-react%406.0.5/packages/plugin-react) -
  Fast Refresh、automatic runtime、Compiler optional peer 与插件行为。
- [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react/tree/plugin-react-swc%404.3.3/packages/plugin-react-swc) -
  SWC 备选能力与限制。
- [`@types/react@19.2.18`](https://registry.npmjs.org/@types/react/19.2.18) 与
  [`@types/react-dom@19.2.4`](https://registry.npmjs.org/@types/react-dom/19.2.4) - 冻结的 React TypeScript
  声明版本。
- [React Compiler Introduction](https://react.dev/learn/react-compiler/introduction) - Compiler 已稳定但为
  独立构建期能力；R0-B 不启用。

## 12. 历史停止点与现行边界

R0-B1 与 R0-B2 完成时曾强制停止在 RC1 前；该停止点随后由用户明确解除。本文记录的 RC1、RC2、
RC3 数量和停止点只描述当时快照；React Core 后来按
[`React课程调整总计划.md`](./React课程调整总计划.md) 完成新路线 `74/74`。React Core Reference
仍为 `0`，Gate RC 与 Gate R 均为 Pending。2026-08-19 起 API Reference 统一后置，现行下一阶段为
RR0；当前顺序以 [`IT学习站前端路线计划.md`](../../IT学习站前端路线计划.md) 为准。
