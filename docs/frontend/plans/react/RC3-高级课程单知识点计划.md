# RC3 React Core 高级课程单知识点计划

> 核验日期：2026-08-15
> 历史状态：24 篇单知识点课程已冻结；当时为 18/24 available，6 planned
> 文档性质：调整前 RC3 历史计划与验收记录，不再定义现行课程数量、顺序或下一任务
> 现行状态：React Core 74/74；以 [`React课程调整总计划.md`](./React课程调整总计划.md) 为准
> 适用版本：React / React DOM 19.2.8，React 官方文档 19.2，TypeScript 7.0.2
> 研究依据：[`rc3-single-knowledge-point-freeze.md`](../../../research/frontend/react/advanced/rc3-single-knowledge-point-freeze.md)
> authoring 合同：[`IT学习站前端规范.md`](../../IT学习站前端规范.md)、[`课程内容规范.md`](../../standards/课程内容规范.md)

## 1. 修订原因

R0-B 最初把 RC3 冻结为 8 篇聚合占位，一篇同时包含多个可独立命名、检索、练习和验收的公开能力。
例如“lazy、Suspense 与 use”混合代码加载、挂起边界与 Promise 读取；“Transition、延迟值与 Activity”
混合三种不同调用位置和 UI 合同。这不符合当前一课一个知识点的课程规范。

本计划以 React 19.2 官方 Reference 和 React 19.2.8 公开导出重新核验，将旧占位替换为 24 篇课程。
旧 8 个 ID 从未发布为 `available`，不保留额外课程，也不建立旧 URL 重定向。本批只冻结范围、顺序、
稳定 ID 和验证边界，不创建正文、Demo 或 loader。

### 1.1 单知识点判定

出现以下任一情况时必须拆课：

1. 两个公开 API 有不同调用位置、返回信号或失败模式。
2. 两个模型可以脱离彼此独立练习和验收。
3. 同一标题必须依靠“综合”“全解”或并列罗列才能覆盖正文。
4. 一个能力需要普通 SPA，另一个需要 profiling、hydration 或独立 document fixture。

共享一个合同的成对能力可以合并，例如 `preload`/`preloadModule` 都只负责提前发现并下载已知资源；
`prefetchDNS`/`preconnect` 都属于连接预热模型。样式资源与异步脚本的放置、加载和执行合同不同，因此
拆为两课。

## 2. 冻结课程清单

| 顺序 | 稳定 ID | 知识点 | 本课唯一主线 | 前置 | 实证等级 |
| ---: | --- | --- | --- | --- | --- |
| 1 | `react.core.learn.advanced.profiler-render-measurement` | Profiler 渲染测量 | 用 commit 数据测量子树渲染成本 | RC2 | 受限 fixture |
| 2 | `react.core.learn.advanced.memo-component-bailout` | `memo` 与组件跳过渲染 | Props 未变时跳过不必要的子组件 render | 1 | SPA |
| 3 | `react.core.learn.advanced.use-callback-function-identity` | `useCallback` 与函数身份 | 在已测量的身份问题中缓存函数定义 | 2 | SPA |
| 4 | `react.core.learn.advanced.error-boundary-render-failures` | Error Boundary 与渲染失败隔离 | 隔离后代渲染错误并显式恢复 | 3 | SPA |
| 5 | `react.core.learn.advanced.lazy-component-code-splitting` | `lazy` 组件代码分割 | 首次 render 时按需加载并缓存组件模块 | 4 | SPA |
| 6 | `react.core.learn.advanced.suspense-fallback-boundary` | Suspense fallback 边界 | 用最近边界协调挂起子树的 fallback 与 reveal | 5 | SPA |
| 7 | `react.core.learn.advanced.use-promise-reading` | `use(promise)` 读取异步值 | 读取可复用 Promise 并把 pending/error 交给边界 | 6 | SPA |
| 8 | `react.core.learn.advanced.start-transition-background-update` | `startTransition` 后台更新 | 在 Hook 外标记无 pending 信号的非紧急更新 | 7 | SPA |
| 9 | `react.core.learn.advanced.use-transition-pending-action` | `useTransition` 与 pending Action | 在组件内启动 Transition 并读取 pending | 8 | SPA |
| 10 | `react.core.learn.advanced.use-deferred-value-stale-content` | `useDeferredValue` 与陈旧内容 | 让昂贵子树暂时读取旧值并表达 stale UI | 9 | SPA |
| 11 | `react.core.learn.advanced.activity-hidden-state-restoration` | Activity 隐藏与状态恢复 | 隐藏子树、清理 Effect并保留 State/DOM | 10 | SPA |
| 12 | `react.core.learn.advanced.form-action-client-submission` | 客户端 Form Action | 用 function Action 管理 FormData 提交与成功重置 | 11 | SPA |
| 13 | `react.core.learn.advanced.use-action-state-result-queue` | `useActionState` 与 Action 结果 | 用前次结果串联排队的 Action 状态 | 12 | SPA |
| 14 | `react.core.learn.advanced.use-optimistic-pending-state` | `useOptimistic` 乐观状态 | 在 Action 未完成时派生可回滚的临时 UI | 13 | SPA |
| 15 | `react.core.learn.advanced.use-form-status-parent-scope` | `useFormStatus` 表单作用域 | 从后代读取最近父 form 的提交状态 | 14 | SPA |
| 16 | `react.core.learn.advanced.use-sync-external-store-snapshot` | `useSyncExternalStore` 快照合同 | 用稳定订阅和不可变快照接入外部状态源 | 15 | SPA |
| 17 | `react.core.learn.advanced.portal-tree-and-dom-placement` | Portal 的 React 树与 DOM 位置 | 改变 DOM 放置而保留 React 树语义 | 16 | SPA |
| 18 | `react.core.learn.advanced.hydrate-root-markup-identity` | `hydrateRoot` 与标记一致性 | 在匹配的既有 React HTML 上接管交互 | 17 | 隔离 fixture |
| 19 | `react.core.learn.advanced.document-metadata-hoisting` | React 文档元数据提升 | 从组件树声明并更新 document head 元数据 | 18 | 隔离 fixture |
| 20 | `react.core.learn.advanced.declarative-stylesheet-resources` | 声明式样式资源 | 建立 stylesheet/style 的放置、优先级和去重合同 | 19 | 隔离 fixture |
| 21 | `react.core.learn.advanced.declarative-async-script-resource` | 声明式异步脚本资源 | 建立 async script 的放置、去重和一次执行合同 | 20 | 隔离 fixture |
| 22 | `react.core.learn.advanced.resource-connection-warmup` | 资源连接预热 | 区分 DNS 解析与提前建立连接 | 21 | 隔离 fixture |
| 23 | `react.core.learn.advanced.resource-preload-discovery` | 资源 preload 发现 | 提前下载已知资源但不执行或应用 | 22 | 隔离 fixture |
| 24 | `react.core.learn.advanced.resource-preinit-evaluation` | 资源 preinit 执行与应用 | 提前获取并执行脚本或应用 stylesheet | 23 | 隔离 fixture |

`Profiler` 的普通 production build 默认不提供课程所需 callback 证据，必须使用开发构建或 `/tmp`
profiling fixture。第 18-24 课不得污染正式站点 document；使用独立初始 HTML 和本地可控资源完成验证。

## 3. 原 8 篇聚合课映射

| 原 planned ID | 新课程范围 | 已覆盖或延期边界 |
| --- | --- | --- |
| `memoization-profiler-and-compiler-boundary` | 第 1-3 课 | `useMemo` 已完成；Compiler 留在构建期观察范围。 |
| `lazy-suspense-and-use` | 第 5-7 课 | Error Boundary 提前为第 4 课。 |
| `transitions-deferred-values-and-activity` | 第 8-11 课 | View Transition 仍为 Canary。 |
| `actions-optimistic-ui-and-form-status` | 第 12-15 课 | Server Function 与渐进增强保持 deferred。 |
| `external-store-and-subscription-contracts` | 第 16 课 | Redux/Zustand 留给后续状态管理 Module。 |
| `portals-flush-sync-and-multiple-roots` | 第 17 课 | `flushSync` 和多 Root 已在 RC1 完成。 |
| `error-boundaries-strict-mode-and-recovery` | 第 4 课 | Strict Mode 与 Root 错误回调已在 RC1 完成。 |
| `hydration-resource-hints-and-server-boundary` | 第 18-24 课 | server/static/RSC 保持 deferred。 |

## 4. 去重与排除边界

R0-B 冻结的 Gate RC 分母仍为 52 个稳定 officialKey。RC1/RC2 已承担 22 个，RC3 为 28 个新增主线，
`useDebugValue`、`useId`、`captureOwnerStack` 继续留在 RCA；`form` officialKey 在 RC1 的提交默认行为和
RC3 的 function Action 中按不同深度复用，但只计一个唯一键，因此总数仍为 52。

以下内容不进入 RC3 新课程：

- 已覆盖：`useMemo`、`flushSync`、Strict Mode、多 Root、Root 三类错误回调。
- RCA-only：`useDebugValue`、`useId`、`captureOwnerStack`。
- 稳定但 deferred：React Compiler、`cache`、`cacheSignal`、`react-dom/server`、`react-dom/static`。
- 环境外：RSC、Server Functions、`use server`、`use client`。
- 非稳定：Canary `ViewTransition`/`addTransitionType` 与 Experimental API。
- 后续 Module：Router、Redux、Zustand、TanStack Query 和远程数据缓存。

## 5. 串行实施合同

严格按第 1 至第 24 课串行实施。每课开始前单独建立官方研究记录；完成单知识点正文、同源 Demo 或
隔离 fixture、临时类型检查、适用的桌面/390px/200% 文本浏览器验证、资源清理、质量命令、独立
Standards/Spec 复审和原子登记后，才能开始下一课。

任何课程调研发现第二条独立主线时，必须先修订本冻结计划，不得把它静默塞进正文。不得新增持久测试
文件、第三方状态/数据包、Compiler、服务端框架或真实外部业务 API。

## 6. 被新路线替换前的状态与开始点

以下记录只描述 RC3 历史路线在被 74 课新路线替换前的停止位置：

```text
RC1 20/20 available
RC2 29/29 available
RC3 18/24 available, 6 planned
下一课：React 文档元数据提升
```

当时第 1-18 课已完成并登记为 `available`；第 19 课原定为下一课“React 文档元数据提升”。

## 7. 第 1 课：Profiler 渲染测量

### 7.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/profiler-render-measurement.md`。
- 课程正文：`src/categories/frontend/react/core/learn/profiler-render-measurement.md`。
- 同源 Demo：`react.core.learn.advanced.profiler-render-measurement.commit-duration-demo`。

本课只建立最小 Profiler 边界、commit 级 `phase`、`actualDuration` / `baseDuration` 语义和可重复的
测量基线。`memo`、`useCallback`、Compiler、DevTools 性能轨道、Core Web Vitals 与遥测平台继续留在
后续课程或范围外。

### 7.2 闭环结果

- `/tmp` 严格 TypeScript fixture 与 AST/CSS Gate 通过；Demo 只有一个 Profiler，日志位于被测边界外，
  清空不会反向触发被测 commit，且未使用记忆化、Performance API、网络、时钟或随机数。
- 开发态 Admission 在 `1440x900`、`390x844` 与 `390x844 + 200%` 完成冷 `mount -> update -> 清空 ->`
  `离页重进`，最多保留六条记录，页面和 Demo 横向溢出均为 `0`，console 为 `0 error / 0 warning`。
- 普通 production fixture 完成更新后保持 `0 callback`；显式使用 `react-dom/profiling` 的隔离 fixture
  得到 `mount,update`，证明课程所述构建边界，两类临时 fixture 均已清理。
- 运行 TSX 与 Admission 页面“查看源码”的 `trimEnd()` 指纹一致：`5919` 字符、`6555` UTF-8 字节，
  SHA-256 为 `d5a6b78d8621ad30d510d9d150af89cd2dd8aa79f135ecd3e7ccb47eb6732219`。
- 三轮独立复审关闭 StrictMode、Profiler 开销和站点内部配置表述 finding；最终 Standards 与 Spec 均为
  `PASS / 0 finding`。
- 双轴通过后已原子登记 entry/demo manifest 并将 track 第 1 课切为 `available`；当前正式进度为
  `1/24`，下一课为第 2 课“memo 与组件跳过渲染”，本轮不开始第 2 课。
- 登记后的 `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit`、`npm run test:e2e` 与 scoped `git diff --check` 均通过，build 转换 `1568` 个模块。
- 新冷浏览器会话在 `1440x900`、`390x844` 与有效 200% 根字号下完成正式深链回归；桌面验证六条上限、
  清空不污染、离页卸载和重进恢复，三种视口横向溢出均为 `0`，console 为 `0 error / 0 warning`。
- 正式“查看源码”与运行 TSX 的 `trimEnd()` 指纹仍为 `5919` 字符、`6555` UTF-8 字节及相同 SHA-256。

## 8. 第 2 课：`memo` 与组件跳过渲染

### 8.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/memo-component-bailout.md`。
- 课程正文：`src/categories/frontend/react/core/learn/memo-component-bailout.md`。
- 同源 Demo：`react.core.learn.advanced.memo-component-bailout.parent-update-demo`。

本课只讲父组件更新时的组件 Props bailout：默认逐项 `Object.is` 比较、State/Context 更新边界、引用
Props 风险和 Profiler 测量。`useCallback`、自定义 comparator 教程、Compiler 与其他性能主线不展开。

### 8.2 Admission、复审与发布

- `/tmp` AST/CSS/TypeScript Gate 通过：正文有八个完整 pitfalls，Demo 只有一个 `memo` 调用、零自定义
  comparator 和一个组件内部 Profiler；未使用 `useCallback`、`useMemo`、网络、timer 或随机数。
- Admission 在 `1440x900`、`390x844` 与 `390x844 + 32px` 完成；冷挂载为 `1/1`，清空后为 `0/0`，
  仅更新父组件后为 `1/0`，修改报告 Props 后为 `2/1`。页面与 Demo 横向溢出均为 `0`，console 为
  `0 error / 0 warning`，离页重进恢复冷挂载 `1/1`。
- 运行 TSX 与 Admission 页面“查看源码”的 `trimEnd()` 指纹一致：`6084` 字符、`6836` UTF-8 字节，
  SHA-256 为 `d4384851c41501400b748dba0734fbe661272634f2e92a84497eb763074e9a74`。
- 独立复审关闭中文职责注释和 Props 表述 finding；冻结 snapshot 最终 Standards 与 Spec 均为
  `PASS / 0 finding`。
- 双轴通过后已原子登记 entry/demo manifest，并将 Track 第 2 课切为 `available`；当前进度为
  `2/24`，下一课为第 3 课“`useCallback` 与函数身份”，本轮不开始第 3 课。
- 登记后的 `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit`、`npm run test:e2e` 与 scoped `git diff --check` 均通过；build 转换 `1575` 个
  模块并产出本课正文和 Demo chunk。
- 新冷正式浏览器会话在 `1440x900`、`390x844` 与 `390x844 + 32px` 重跑完整路径；三种视口均为
  冷 `1/1`、清空 `0/0`、仅更新父组件 `1/0`、修改 Props `2/1`，页面与 Demo 横向溢出为 `0`，
  控制按钮高度为 `42px`，console 为 `0 error / 0 warning`。
- 三种视口的正式源码面板与磁盘 TSX 指纹均为 `6084` 字符、`6836` UTF-8 字节、SHA-256
  `d4384851c41501400b748dba0734fbe661272634f2e92a84497eb763074e9a74`；键盘路径和离页重进通过，
  重进恢复冷挂载 `1/1`。

## 9. 第 3 课：`useCallback` 与函数身份

### 9.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/use-callback-function-identity.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-callback-function-identity.md`。
- 同源 Demo：`react.core.learn.advanced.use-callback-function-identity.callback-bailout-demo`。

本课只处理已经测量到的函数 Prop 身份问题：函数定义缓存、完整依赖、`Object.is` 比较、`memo` 组合
边界与 updater function 的窄化条件。`useMemo`、自定义 comparator、Compiler、Effect 依赖改写与
Error Boundary 不展开。

### 9.2 Admission、复审与发布

- `/tmp` 内容/AST/CSS/TypeScript Gate 通过：正文有八个完整 pitfalls，Demo 有两个 `memo` 分支、两个
  组件内部 Profiler 与一个 `useCallback`；未使用 `useMemo`、自定义 comparator、网络、timer、随机数、
  CSS Grid、`gap` 或非零 `letter-spacing`。
- Admission 在 `1440x900`、`390x844` 与 `390x844 + 32px` 完成；三种视口均为冷 `1/1`、清空
  `0/0`、仅更新父组件 `1/0`、修改报告版本 `2/1`，两个保存按钮都读取版本 `2`。页面与 Demo 横向
  溢出均为 `0`，控制按钮高度为 `42px`，console 为 `0 error / 0 warning`，离页重进恢复 `1/1`。
- 运行 TSX 与 Admission 源码面板的 `trimEnd()` 指纹一致：`6929` 字符、`7849` UTF-8 字节，
  SHA-256 为 `2830c5f6badf88b15452c09b94e4f2ece4c2aeef524ec7250ac64751aceecdab`。
- Admission 后 entry/demo/Track 三项哈希均恢复 planned 基线；冻结 snapshot 的独立复审结论为
  Standards `PASS / 0 finding`、Spec `PASS / 0 finding`。
- 双轴通过后已原子登记 entry/demo manifest，并将 Track 第 3 课切为 `available`；当前进度为
  `3/24`，下一课为第 4 课“Error Boundary 与渲染失败隔离”，本轮不开始第 4 课。
- 登记后的 `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit`、`npm run test:e2e` 与 scoped `git diff --check` 均通过；build 转换 `1582` 个模块
  并产出本课正文和 Demo chunk。
- 新冷正式浏览器会话在 `1440x900`、`390x844` 与 `390x844 + 32px` 重跑完整路径；三种视口均为
  冷 `1/1`、清空 `0/0`、仅更新父级 `1/0`、修改依赖 `2/1`，两个保存按钮均读取报告版本 `2`。
- 三种视口的页面与 Demo 横向溢出均为 `0`，控制按钮高度为 `42px`，console 为
  `0 error / 0 warning`，离页重进恢复冷挂载 `1/1`。32px 根字号下标题曾造成 `2px` Demo 溢出，
  已使用 `overflow-wrap: anywhere` 窄修并完整复跑。
- 正式源码面板与磁盘 TSX 的 `trimEnd()` 指纹一致：`6929` 字符、`7849` UTF-8 字节、SHA-256
  `2830c5f6badf88b15452c09b94e4f2ece4c2aeef524ec7250ac64751aceecdab`。

## 10. 第 4 课：Error Boundary 与渲染失败隔离

### 10.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/error-boundary-render-failures.md`。
- 课程正文：`src/categories/frontend/react/core/learn/error-boundary-render-failures.md`。
- 同源 Demo：
  `react.core.learn.advanced.error-boundary-render-failures.local-fallback-recovery-demo`。

本课只建立 Error Boundary 的后代渲染失败隔离、局部 fallback、向更高边界传播和显式 key 恢复。
事件处理器、普通异步 callback、SSR、日志平台、Suspense、Transition 与第 5 课 `lazy` 不展开。

### 10.2 Admission、复审与发布

- `/tmp` 内容、AST、TypeScript 与宿主回调 Gate 通过；Demo 使用一个最小 class boundary，业务组件保持
  函数组件，caught 不升级为宿主失败，uncaught 仍由宿主兜底。
- Admission 在 `1440x900`、`390x844` 与 `390x844 + 32px` 完成冷挂载、局部捕获、相邻 UI 保留、
  key 恢复、向外层传播、源码展开、键盘操作、离页和重进；页面与 Demo 横向溢出均为 `0`，console
  为 `0 error / 0 warning`。
- 运行 TSX 与浏览器“查看源码”的 `trimEnd()` 指纹一致：`6269` 个字符、`7479` 个 UTF-8 字节，
  SHA-256 为 `ed547f851bbbce66bbc43a6556c65c97784aeb0b27326f3f8757075a50fb8246`。
- 独立复审发现“重建整个实验未清零外层捕获次数”后，已在父级重建动作中归零计数；同一复审者对
  最新快照确认 Standards `PASS / 0 finding`、Spec `PASS / 0 finding`。
- 双轴通过后已原子登记 entry/demo manifest，并将 Track 第 4 课切为 `available`；当前进度为
  `4/24`，下一课为第 5 课“`lazy` 组件代码分割”，本轮不开始第 5 课。
- 登记后的 type-check、lint、format、空 unit/e2e、build 与 scoped diff Gate 均通过；build 转换
  `1589` 个模块。production preview 三视口重跑局部捕获、key 恢复、向外层传播、整个实验重建和离页
  重进；外层计数在重建后归零，页面与 Demo 横向溢出为 `0`，按钮高度为 `42px`，console 为
  `0 error / 0 warning`。

## 11. 第 5 课：`lazy` 组件代码分割

### 11.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/lazy-component-code-splitting.md`。
- 课程正文：`src/categories/frontend/react/core/learn/lazy-component-code-splitting.md`。
- 同源 Demo：`react.core.learn.advanced.lazy-component-code-splitting.on-demand-panel-demo`。

本课只建立模块顶层 `lazy(() => import(...))` 的首次 render 加载、默认导出合同、模块结果缓存与组件
实例 State 生命周期。Suspense 只提供最小 pending fallback，不展开第 6 课的 reveal、嵌套边界或
Transition。

### 11.2 Admission、复审与发布

- `/tmp` 内容、静态与 TypeScript Gate 通过：模块顶层只有一个真实动态 `import()`，lazy 子模块提供
  默认导出；未使用网络、timer、随机数、预加载、组件内 `lazy`、CSS Grid、`gap` 或非零
  `letter-spacing`。
- Admission 在 `1440x900`、`390x844` 与 `390x844 + 32px` 完成。冷进入 loader 为 `0` 且未请求
  runtime lazy chunk；首次显示 loader 为 `1`、局部版本为 `0` 且只请求一次 runtime chunk。局部版本
  修改为 `1` 后父级更新仍保持 `1`；隐藏后重显回到 `0`，loader 仍为 `1`；离页重进会重建实例但模块
  继续缓存，不新增 runtime chunk 请求。三种视口页面与 Demo 横向溢出均为 `0`，按钮至少 `42px`，
  console 为 `0 error / 0 warning`。
- 浏览器源码面板与磁盘三份运行源码按 manifest 拼接规则完全一致：`3545` 个字符、`3983` 个 UTF-8
  字节，SHA-256 为 `34d2fc2095bee5c3f920b5203e2a9ce8f2a1d552c693f822c9a7384e9a6f4609`。
  Admission 临时登记 build 转换 `1598` 个模块；正式原子发布后的 fresh production build 转换
  `1600` 个模块。runtime lazy chunk 与仅用于展示源码的 raw source chunk 已分别识别，不混用两类请求
  作为按需加载证据。
- 冻结六项资产在复审起止时哈希一致；同一最新 snapshot 的独立 Standards 与 Spec 复审均为
  `PASS / 0 finding`。
- 双轴通过后已原子登记 entry/demo manifest，并将 Track 第 5 课切为 `available`；当前进度为
  `5/24 available`、`19 planned`，下一课为第 6 课“Suspense fallback 边界”。本轮不开始第 6 课。
- 发布后三视口回归再次得到冷进入 `0`、首次显示 `1/0`、父级更新保留局部版本、隐藏重显回到 `0`
  且 loader 保持 `1`；SPA 离页重进后实例重建，runtime chunk 请求仍只有一次。三种视口页面与 Demo
  横向溢出均为 `0`，按钮至少 `42px`，console 为 `0 error / 0 warning`，正式源码指纹保持一致。
- 发布后固定 14 个本课路径再次独立审查，Standards 与 Spec 均为 `PASS / 0 finding`。

## 12. 第 6 课：Suspense fallback 边界

### 12.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/suspense-fallback-boundary.md`。
- 课程正文：`src/categories/frontend/react/core/learn/suspense-fallback-boundary.md`。
- 同源 Demo：`react.core.learn.advanced.suspense-fallback-boundary.nested-reveal-demo`。

本课只建立最近父级 Suspense 的 fallback 替换范围、同一边界的共同 reveal，以及外层先 reveal、内层后
reveal 的嵌套边界。挂起源只复用两个顶层 `lazy` 本地模块，不展开第 7 课 `use(promise)`、远程数据
缓存、Transition、SSR/RSC、Error Boundary、timer、随机数或外网请求。

### 12.2 Admission、复审与发布

- 内容、静态、类型与质量 Gate 通过；`npm run type-check`、`npm run lint`、
  `npm run format:check`、空 `npm run test:unit`、空 `npm run test:e2e`、`npm run build` 与 scoped
  `git diff --check` 均通过，Admission build 转换 `1611` 个模块。
- Admission 在 `1440x900`、`390x844` 与 `390x844 + 32px` 完成。三种视口均依次验证初始未挂载、
  外层 fallback、摘要与内层 fallback、最终完整 reveal；外层 pending 时边界外控制区保持可用，
  loader 最终为 `1/1`。页面、body 与 Demo 横向溢出均为 `0`，无裁切或按钮重叠，按钮高度为
  `42px`，console 为 `0 error / 0 warning`。
- “重新开始”整页 reload 后恢复 `0/0` 并创建全新 gate；SPA 离页返回重置组件阶段，但同一 JS realm
  保留顶层 lazy loader 的 `1/1` 模块缓存，两个恢复边界均已验证。
- production 资源记录确认摘要和检查器 runtime lazy chunk 均以 `200` 加载；请求完成只作为载体
  证据，最终 DOM reveal 作为 React 重试并提交的行为证据。
- 浏览器源码面板与磁盘四份运行 TSX 按 manifest 拼接规则完全一致：`6987` 个字符、`8041` 个
  UTF-8 字节，SHA-256 为 `f853d3a824eb3f6a59b747604063134d7ffad1fcbee54c9c313895fc0583625c`。
- 冻结十项资产在复审起止时哈希一致；唯一一次独立 combined review 的 Standards 与 Spec 均为
  `PASS / 0 finding`。
- 双轴通过后已登记 entry/demo manifest，并将 Track 第 6 课切为 `available`；当前进度为
  `6/24 available`、`18 planned`，下一课为第 7 课“`use(promise)` 读取异步值”。
- 发布后再次通过全部六项质量命令与 scoped `git diff --check`，fresh build 仍转换 `1611` 个模块；
  新冷 production 会话在三种视口重跑全部阶段、正式源码指纹和 runtime chunk 请求，结果与 Admission
  一致，console 保持 `0 error / 0 warning`。

## 13. 第 7 课：`use(promise)` 读取异步值

### 13.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/use-promise-reading.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-promise-reading.md`。
- 同源 Demo：`react.core.learn.advanced.use-promise-reading.cached-promise-demo`。

本课只建立 render 中 `use(promise)` 对稳定 cached Promise 的读取，以及 pending、fulfilled、rejected
分别交给 Suspense、返回异步值和传播到 Error Boundary 的三路语义。同一 key 跨父级重新 render 复用
同一个 Promise；错误恢复同时创建新资源身份并重建 boundary。不展开远程数据缓存、RSC、SSR、
Transition、timer、随机数、fetch 或第三方数据层。

### 13.2 Admission、复审与发布

- 内容、静态、类型与质量 Gate 通过；`npm run type-check`、`npm run lint`、
  `npm run format:check`、空 `npm run test:unit`、空 `npm run test:e2e`、`npm run build` 与 scoped
  `git diff --check` 均通过，Admission build 转换 `1620` 个模块。
- Admission 在 `1440x900`、`390x844` 与 `390x844 + 32px` 完成成功、失败和恢复路径。成功路径为
  `idle -> pending -> resolved`，失败路径为 `idle -> pending -> rejected`，恢复路径为
  `error -> recovery pending -> resolved`；pending 和 resolved 阶段的父级重新 render 均未增加
  Promise 创建次数。
- 三种视口的页面、body 与 Demo 横向溢出均为 `0`，无裁切或按钮重叠，按钮最小高度为 `42px`；
  console 为 `0 error / 0 warning`，课程业务 fetch/XHR 为 `0`，production 静态资源均为 `200`。
  离页返回后实验恢复冷 `idle`，资源创建次数为 `0`。
- resolve/reject 按钮只进入 settle 中间状态；最终 `resolved` 由 reader 提交后的 Effect 回报，最终
  `rejected` 由 `componentDidCatch` 回报，没有把 Promise settle 冒充 React DOM commit。
- 浏览器源码面板与磁盘两份运行源码按 manifest 拼接规则完全一致：`10426` 个字符、`11822` 个
  UTF-8 字节，SHA-256 为 `3228621b44f29302c084a6424ee0fc990f3e4f8ae777eebe70c8c6dc65e8c69f`。
- 冻结八项资产在复审起止时哈希一致；唯一一次独立 combined review 的 Standards 与 Spec 均为
  `PASS / 0 finding`。
- 双轴通过后已登记 entry/demo manifest，并将 Track 第 7 课切为 `available`；当前进度为
  `7/24 available`、`17 planned`，下一课为第 8 课“`startTransition` 后台更新”。
- 发布后再次通过全部六项质量命令与 scoped `git diff --check`，fresh build 仍转换 `1620` 个模块。
  production 三视口重新跑通成功、失败、恢复、pending/resolved 父级重渲染和离页返回；页面、body
  与 Demo 横向溢出均为 `0`，无文字裁切或按钮重叠，按钮最小高度为 `42px`，console 为
  `0 error / 0 warning`，课程业务 fetch/XHR 为 `0`，正式源码指纹保持一致。

## 14. 第 8 课：`startTransition` 后台更新

### 14.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/start-transition-background-update.md`。
- 课程正文：`src/categories/frontend/react/core/learn/start-transition-background-update.md`。
- 同源 Demo：`react.core.learn.advanced.start-transition-background-update.background-update-demo`。

本课只建立 Hook 外 standalone `startTransition` 的同步更新标记、普通输入 State 与后台视图 State
分离、非阻塞 render 可被更紧急更新打断并从最新 State 重启，以及 standalone API 不提供 pending
信号的边界。不展开 `useTransition`、`useDeferredValue`、网络、缓存、timer、Action 或表单主线。

### 14.2 Admission、复审与发布

- 内容、静态、类型与质量 Gate 通过；四个 pitfalls 均包含独立错误与正确示范，正文示例与
  `startBackgroundUpdate(update: () => void)` 的单参数签名一致。`npm run type-check`、`npm run lint`、
  `npm run format:check`、空 `npm run test:unit`、空 `npm run test:e2e`、`npm run build` 与 scoped
  `git diff --check` 均通过，fresh build 转换 `1687` 个模块。
- Admission 与发布后 production 回归均覆盖 `1440x900`、`390x844` 与 `390x844 + 32px`。三种视口
  输入保持普通 State 更新，连续选择详细、历史、概览、历史后 action 调用为 `4`，最终提交历史视图；
  commit 日志只记录真实提交，pending 明示为“standalone API 不提供”。
- 三种视口的页面、body 与 Demo 横向溢出均为 `0`，没有文字裁切或控件重叠；输入与三个按钮高度均为
  `42px`，console 为 `0 error / 0 warning`，课程业务 fetch/XHR/WebSocket 为 `0`。离页返回后输入为空、
  action 为 `0`，视图恢复概览。
- 浏览器源码面板与磁盘三份运行源码按 manifest 拼接规则完全一致：`12687` 个字符、`13473` 个
  UTF-8 字节，SHA-256 为 `5b95e309ff0f40d1ccf49f90ae4f4da5111c1f7cb5a1e1f3aa968b34c7aef439`。
- 唯一一次独立 combined review 首次指出正文两个正确示范仍使用旧双参数调用；修正为传入闭包后，
  同一 reviewer 复核最新快照，最终 Standards 与 Spec 均为 `PASS / 0 finding`。
- 双轴通过后已登记 entry/demo manifest，并将 Track 第 8 课切为 `available`；当前进度为
  `8/24 available`、`16 planned`，下一课为第 9 课“`useTransition` 与 pending Action”。第 9 课仍
  保持 `planned`，本课闭环前未创建或登记其资产。

## 15. 第 9 课：`useTransition` 与 pending Action

### 15.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/use-transition-pending-action.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-transition-pending-action.md`。
- 同源 Demo：`react.core.learn.advanced.use-transition-pending-action.pending-action-demo`。

本课只建立组件顶层 `useTransition`、同步与异步 Action、`isPending` 生命周期、await 后重新包装最终
State，以及 pending 期间旧面板与普通 State 仍可交互的边界。不展开异步排序、表单 Action、
`useDeferredValue`、Router、网络、缓存或事务主线。

### 15.2 Admission、复审与发布

- 预登记内容、静态、类型与质量 Gate 通过；`npm run type-check`、`npm run lint`、
  `npm run format:check`、空 `npm run test:unit`、空 `npm run test:e2e`、`npm run build` 与 scoped
  `git diff --check` 均通过，预登记 full build 转换 `1695` 个模块，隔离 Admission build 转换 `17`
  个模块。
- Admission 在 `1440x900`、`390x844` 与 `390x844 + 32px` 完成。同步路径 Action 调用为 `1` 并提交
  历史面板；异步路径为 `idle -> pending -> review committed -> idle`，pending 期间两次普通标记立即
  生效、旧概览面板保持可见，启动按钮禁用而继续按钮可用。
- 修正后的同目标按钮在已提交面板上禁用，跨目标 Action 与重建仍可用；重建后恢复概览、Action `0 次`
  与普通标记 `0 次`。三种视口的页面、body 与 Demo 横向溢出均为 `0`，无文字裁切或控件重叠，按钮
  最小高度为 `42px`，32px 继承字号时约 `63.19px`；console 为 `0 error / 0 warning`，课程业务
  fetch/XHR/WebSocket 为 `0`，离页重进恢复冷状态。
- 浏览器源码面板与磁盘三份运行源码按 manifest 拼接规则完全一致：`12025` 个字符、`12757` 个
  UTF-8 字节，SHA-256 为 `bf8d4536b2c50211506f19b1ebd896e366a8b3e31bdb7eae85b8048447c41582`。
- 唯一一次独立 combined review 首次指出：重复启动已提交目标的 Action 不会产生面板变更，Effect 无法
  把阶段从 `committing` 复位。新增同目标禁用条件后，同一 reviewer 复核通过。原子登记后的首次正式
  build 又暴露 pitfalls opener 多一个冒号，以及后三项缺少 Markdown schema 要求的 fenced 正反示例；
  `/tmp` parser 反馈环先稳定复现，再逐项迁移错误并转绿，最终解析为 `37` 个 block、`6` 个 pitfalls 与
  `1` 个 exercise。补丁不改变课程主线，同一 reviewer 再次复核最终 Standards 与 Spec 均为
  `PASS / 0 finding`。
- 发布后六项质量命令与 scoped `git diff --check` 全部通过，fresh production build 转换 `1697` 个模块。
  正式课程路由在三种视口重跑同步、异步 pending、普通标记、同目标禁用、跨目标切换、重建和 SPA 离页
  返回；页面、body 与 Demo 横向溢出均为 `0`，文字裁切为 `0`，console 为 `0 error / 0 warning`，课程
  业务 fetch/XHR/WebSocket 为 `0`，正式源码指纹保持一致。
- 双轴通过后已登记 entry/demo manifest，并将 Track 第 9 课切为 `available`；当前进度为
  `9/24 available`、`15 planned`，下一课为第 10 课“`useDeferredValue` 与陈旧内容”。

## 16. 第 10 课：`useDeferredValue` 与陈旧内容

### 16.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/use-deferred-value-stale-content.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-deferred-value-stale-content.md`。
- 同源 Demo：`react.core.learn.advanced.use-deferred-value-stale-content.stale-results-demo`。

本课只建立最新 query 与 deferred query 的两阶段提交、陈旧内容明示、Suspense 保留旧结果和
Effect 只在新结果真实提交后运行的边界。实验使用实例级本地 gate，不展开网络、缓存、debounce、
timer、Transition Action 或服务端数据主线。

### 16.2 Admission、复审与发布

- 内容、静态、类型与质量 Gate 通过；`npm run type-check`、`npm run lint`、
  `npm run format:check`、空 `npm run test:unit`、空 `npm run test:e2e`、`npm run build` 与 scoped
  `git diff --check` 均通过，fresh build 转换 `1705` 个模块。
- Admission 与发布后 production 回归均覆盖 `1440x900`、`390x844` 与
  `390x844 + 32px`。输入 `hooks` 再输入 `suspense` 时，input 与最新 query 立即更新，
  deferred query、结果子树和最近 Effect commit 仍为 `react`，陈旧文案明示且旧结果
  保持可见，Suspense fallback 计数为 `0`。
- 推进当前结果后，deferred query、结果子树与 Effect commit 一起追上 `suspense`，
  stale 消失；重建实验和 SPA 离页返回都恢复 `react` 冷状态。三种视口的页面、body 与
  Demo 横向溢出均为 `0`，按钮高度为 `42px`，console 为 `0 error / 0 warning`，课程
  业务 fetch/XHR/WebSocket 为 `0`。
- 浏览器源码面板与磁盘三份运行源码按 manifest 顺序 TSX -> resource TS -> CSS 拼接的
  `trimEnd()` 指纹完全一致：`14627` 个字符、`15785` 个 UTF-8 字节，SHA-256 为
  `180931f9d44f0a957bc617bd5d8ae1841f01b4eb67ea5dc1227c8b369bbae16e`。
- 冻结五项资产最终 SHA-256 为：正文
  `84f873ba5d3427b4a85d877fc62aa3a0f544987ccb613a49bb193dc644ea306d`、TSX
  `8779ecc73786707ec177ef4bd8fa12aec07496a3b9dc3df847ee06f8b56619e0`、resource
  `716a14c57708b234bec02ea4179b1623dc119d6f0354ca097d62d41a3cf98ac9`、CSS
  `b61a20f23deaff8255028de465339d3c851774bd9e9a4188b25990ad9778860d`、研究稿
  `10002ebe09b1e86b5f912a287b151fd3225792fbc5db3662246d35de2a3bc1f2`。
- 独立 combined review 首次只发现正文缺少固定的“参考资料”章节；补全四项 React 官方
  来源后，同一 reviewer 复核最新冻结快照，最终 Standards 与 Spec 均为 `PASS / 0 finding`。
- 双轴通过后已登记 entry/demo manifest 并将 Track 第 10 课切为 `available`。登记后首次
  type-check 发现 `available` 条目仍携带 planned 专用 `title`/`summary`；只删除这两个冗余
  字段后全部质量命令重新通过。当前进度为 `10/24 available`、`14 planned`，第 11 课
  “Activity 隐藏与状态恢复”仍保持 `planned`，本轮停在第 10 课闭环。

## 17. 第 11 课：Activity 隐藏与状态恢复

### 17.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/activity-hidden-state-restoration.md`。
- 课程正文：`src/categories/frontend/react/core/learn/activity-hidden-state-restoration.md`。
- 同源 Demo：`react.core.learn.advanced.activity-hidden-state-restoration.hidden-workspace-demo`。

本课只建立 `Activity` 的 visible/hidden 语义、State 与宿主 DOM 保留、Effect cleanup/setup、hidden 更新和
重建边界。Demo 使用稳定宿主元素、React State 计数、未受控 textarea、DOM 身份检查和边界外 Effect 记录；
不引入网络、timer、随机数、媒体、Router cache、Suspense 或 Transition 行为。

### 17.2 Admission、复审与发布

- 内容、静态、类型与质量 Gate 通过；`npm run type-check`、`npm run lint`、`npm run format:check`、
  空 `npm run test:unit`、空 `npm run test:e2e`、`npm run build` 与 scoped `git diff --check` 均通过，
  fresh build 转换 `1711` 个模块。
- Production Admission 覆盖 `1440x900`、`390x844` 与 `390x844 + 32px`。冷 hidden 为
  `mode=hidden, revision=1, setup=0, cleanup=0, count=0, draft=''`；首次显示为 `setup=1`，编辑后
  `count=1, draft='Activity 草稿'`；隐藏保留同一连接 DOM、State/草稿并得到 `cleanup=1`；hidden revision
  更新为 `2` 时 Effect 计数不变；恢复 visible 保留同一节点并得到 `setup=2, cleanup=1`；按 key 重建后旧节点
  断开并回到 cold hidden。
- 三种视口页面与 Demo 横向溢出均为 `0`，没有文字裁切或按钮重叠；普通 390px 按钮最小高度为 `42px`，
  32px 根字号下为 `63.1875px`；console 为 `0 error / 0 warning`，课程业务 fetch/XHR/WebSocket 为 `0`，
  production 静态资源请求为 `200` 或缓存 `304`。
- Demo 运行源码按 manifest 顺序 TSX -> CSS 拼接的 `trimEnd()` 指纹为 `13624` 个字符、`14398` 个 UTF-8
  字节，SHA-256 为 `3b244f5c0dc7ce9b1a29d2a39807d91e8640f4da30ca53fc76494b0972542285`。
- 冻结四项资产最终 SHA-256 为：研究稿
  `016e1cf10066b63a33b3c6b3950075f0f8329cbad109e88bbcff5f79dce30e3b`、正文
  `c40999034252dad0611b1f5716549159f9e89c61b53df78b3021c839b90f6cca`、TSX
  `aa64f0996dec689bc0d431ca7e643e9af74a77d26b79f9a78832a2b8c4bac627`、CSS
  `9edfe4a62c3a52a219d741d130fc64294841eddc884d1198e4f5f069fad51db8`。
- 独立 combined review 首次发现正文缺少纯文本后代在 hidden 时可能没有 DOM 输出的官方 caveat；补充最小
  边界说明后，同一 reviewer 复核最终四项快照且起止 SHA 一致，最终 Standards 与 Spec 均为
  `PASS / 0 finding`。
- 双轴通过后已原子登记 entry/demo manifest，并将 Track 第 11 课切为 `available`；当前进度为
  `11/24 available`、`13 planned`，下一课为第 12 课“客户端 Form Action”，本轮停止。

## 18. 第 12 课：客户端 Form Action

### 18.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/form-action-client-submission.md`。
- 课程正文：`src/categories/frontend/react/core/learn/form-action-client-submission.md`。
- 同源 Demo：`react.core.learn.advanced.form-action-client-submission.client-action-demo`。

本课只建立客户端 function `action` 的 `FormData`、隐式 Transition、普通 submitter 数据、按钮
`formAction` 覆盖、成功后未受控字段 reset 与 rejected Error Boundary。Demo 使用边界外 Promise gate
观察 pending 和 settle；不引入 `useActionState`、`useFormStatus`、乐观状态、真实网络、Server Function
或渐进增强。

### 18.2 Admission、复审与发布

- `npm run type-check`、`npm run lint`、`npm run format:check`、空 `npm run test:unit`、空
  `npm run test:e2e`、`npm run build` 与根级 `git diff --check` 均通过，fresh build 转换 `1717` 个模块。
  首次登记后的 build 精确发现三个 exercise 缺少解析器要求的“要求/验收”字段；最小补全字段后，同一
  build 反馈环及全部质量命令转绿，未新增持久测试资产。
- 独立 combined review 在行为修复后的四项冻结快照上确认 Spec 为 `PASS / 0 finding`，Standards 仅发现
  两个未使用的 `select` CSS 分支这一处低级判断项。按“简单修改无需再次审查”规则删除两处分支后，
  TSX/CSS `select` 搜索为 `0`，定向 Prettier、选择器对照和 scoped `git diff --check` 均通过；当前无
  未解决 Standards/Spec finding。
- Fresh production Admission 覆盖 `1440x900`、`390x844` 与 `390x844 + 32px`。首次父 Action 提交后
  账本立即显示 pending，两个 submitter 同步禁用，settle 控件立即启用；强制快速二次点击没有改变路径
  或序号，pending 期间边界外普通计数仍可立即更新。
- 父 Action 成功后未受控 textarea reset、受控备注保持；function `formAction` 路径得到
  `intent=null` 并在成功后 reset；reject 进入最近 Error Boundary 且 reset 计数不增加，恢复按钮只
  remount 新表单，不冒充 reset。刷新和 SPA 离页返回都恢复 `outcome=等待提交, count=0, reset=0` 的
  cold 状态。
- 三种视口的页面、body 与 Demo 横向溢出均为 `0`；390px 无按钮裁切或重叠，按钮最小高度为 `42px`。
  32px 根字号路径全程使用键盘完成输入、提交、普通更新与成功 settle；截图检查未见文字遮挡。console
  为 `0 error / 0 warning`，pageerror 与课程业务 fetch/XHR/WebSocket 均为 `0`。
- 浏览器源码面板与磁盘按 manifest 顺序 TSX -> CSS 拼接的 `trimEnd()` 指纹完全一致：`20800` 个字符、
  `22214` 个 UTF-8 字节，SHA-256 为
  `b1e71f13fb8b8737ce454d4d29a4ac2281889c21899ffd8053a3b9564e9927a8`。
- 冻结四项资产最终 SHA-256 为：研究稿
  `1c172c68ca580d9f28f59e9ee247b1e3da207fc3fa93166f1596e76a14b330da`、正文
  `9bd8f2e0a56365c5013009c6449c6d54af908ab2056559c7095665068597e351`、TSX
  `57e791061ab03acbdda29314a7d8e75099d47c51df41e783cf98a19c90ec985a`、CSS
  `bd6278623b299ab653640281ce386a40b32f35c5458dfa4a552828d8d5fcc248`。
- 已原子登记 entry/demo manifest，并将 Track 第 12 课切为 `available`；当前进度为
  `12/24 available`、`12 planned`，下一课为第 13 课“useActionState 与 Action 结果”，本轮停止。

## 19. 第 13 课：`useActionState` 与 Action 结果

### 19.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/use-action-state-result-queue.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-action-state-result-queue.md`。
- 同源 Demo：`react.core.learn.advanced.use-action-state-result-queue.result-queue-demo`。

本课只建立 `useActionState` 的三元组、`(previousState, payload)` Action 签名、返回结果进入 State、
异步 Action 排队与 `FormData` payload。Demo 在同一 Transition 内连续 dispatch 两项，并用本地 Promise
gate 显式推进队列；不把中间 State 的可见时机当成 API 合同，也不展开 `useOptimistic`、
`useFormStatus`、Server Function、真实网络或事务。

### 19.2 Admission、复审与发布

- `npm run type-check`、`npm run lint`、`npm run format:check`、空 `npm run test:unit`、空
  `npm run test:e2e`、`npm run build`、根级与 scoped `git diff --check` 均通过，fresh build 转换
  `1725` 个模块，未新增持久测试资产。
- Production Admission 覆盖 `1440x900`、`390x844` 与 `390x844 + 32px`。首次排队后为
  `revision=0, pending, started=1, gates=1`；兑现第一项后第二项启动并保持
  `revision=0, pending, started=2, gates=1`；全部兑现后为 `revision=2, idle, started=2, gates=0`，
  最终 decision 为“需要修改”，history 为 `0 -> 1`、`1 -> 2`。
- 三种视口的页面、body 与 Demo 横向溢出均为 `0`，没有按钮重叠或文字裁切；console、pageerror 与
  课程业务 fetch/XHR/WebSocket 均为 `0`。重建实验后恢复
  `revision=0, idle, started=0, gates=0`。
- 浏览器源码面板与磁盘按 manifest 顺序 TSX -> CSS 拼接的 `trimEnd()` 指纹完全一致：`8722` 个字符、
  `9266` 个 UTF-8 字节，SHA-256 为
  `aaffad2bd8f04b851018e640401206bbce4de38e2167a482598583ca0633e815`。
- 冻结四项资产最终 SHA-256 为：研究稿
  `2deae89612a9341b5bf3cfd1228ff851be498e797206510fcde533c874aafa42`、正文
  `f4353d8c9ba5564dec026a7434ba692ec0c410348c54a992d99f23679a7aef8f`、TSX
  `72fbf0d11357ff80eadfb2c537bdc99a1058cd32f796ac02c2d7addd0369b123`、CSS
  `9684c8b5e9d30d1af32c28f306d6741e7a019f9eb2b5edefe797f55bcb1fcf98`。
- 独立 combined review 的 Standards 两项低级 finding 与 Spec 一项 finding 均指向同一个无效
  `resetExperiment` 转发函数及其错误注释。按“简单修改无需再次审查”规则改为按钮直接调用
  `onRebuild`，删除包装函数与错误注释；随后类型、lint、格式、diff、fresh build 和 production 重建
  路径均复验通过，当前无未解决 finding。
- 已原子登记 entry/demo manifest，并将 Track 第 13 课切为 `available`；当前进度为
  `13/24 available`、`11 planned`，下一课为第 14 课“useOptimistic 乐观状态”。

## 20. 第 14 课：`useOptimistic` 乐观状态

### 20.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/use-optimistic-pending-state.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-optimistic-pending-state.md`。
- 同源 Demo：`react.core.learn.advanced.use-optimistic-pending-state.optimistic-items-demo`。

本课只建立基础 State 与 optimistic State 的职责、Action 内调用、纯 `updateFn`、成功承接、失败回滚
和多个输入的派发顺序。Demo 使用一个本地 Promise gate 观察甲、乙两项临时输入，并以普通 State 备注
证明等待期间相邻交互仍可响应；不引入 `useFormStatus`、Server Function、真实网络、持久化、缓存、
事务、重试或竞态处理。

### 20.2 Admission、复审与发布

- `/tmp` 隔离类型与浏览器反馈环通过；`npm run type-check`、`npm run lint`、
  `npm run format:check`、`npm run build`、根级与 scoped `git diff --check` 均通过，fresh build 转换
  `1731` 个模块，未新增持久测试资产。既有 staged Java trailing whitespace 只作为无关工作区 blocker
  单独记录，未修改对应文件。
- Production Admission 覆盖 `1440x900`、`390x844` 与 `390x844 + 32px`。冷态为
  `base=1, visible=1`；开始后为 `base=1, visible=3`，甲、乙均标记“待确认”，等待期间普通备注从
  `0` 立即更新为 `1`；成功后为 `base=3, visible=3` 且甲、乙均“已确认”；重建后拒绝回到
  `base=1, visible=1`。
- 三种视口的页面、body 与 Demo 横向溢出均为 `0`，390px 按钮宽度为 `274px`、高度为 `42px`，
  没有按钮重叠或文字裁切；console、pageerror 与课程业务 fetch/XHR/WebSocket 均为 `0`。
- 浏览器源码面板与磁盘按 manifest 顺序 TSX -> CSS 拼接的 `trimEnd()` 指纹完全一致：`10901` 个字符、
  `11759` 个 UTF-8 字节，SHA-256 为
  `7032c9a3c06c52a20c9e630d53c7129476787bd2e265de71ac9fa6ae16a97f9c`。
- 冻结四项资产最终 SHA-256 为：研究稿
  `5d9f56d01e83c1ea7e2e5e57698f7f35226df0811e51f0989e5bf70fa706ef1d`、正文
  `6aba70b324bd10a2354c71c492ff920c874225d83cd2aa1b457d15d0f3c2cd32`、TSX
  `e6d8e26c279c4ad106bcd74ba347806d6bca5b28ae954068afe1e367a6a0f5bf`、CSS
  `83729c82d7e1ad751ea1c233bba672cf8a45e35a3eb18906daf5a8ed60c74356`。
- 独立 combined review 首次提出四项 Spec finding：官方返回函数命名说明、Demo 状态机、章节顺序和
  组件外纯函数命名。最小修正后同一 reviewer 复算最终四项 SHA，Standards 与 Spec 均为
  `PASS / 0 finding`，无未解决 finding。
- 已原子登记 entry/demo manifest，并将 Track 第 14 课切为 `available`；React Core 总览显示
  `14/24`、第 14 课“已上线”，当前进度为 `14/24 available`、`10 planned`，下一课为第 15 课
  “useFormStatus 表单作用域”。

## 21. 第 15 课：`useFormStatus` 表单作用域

### 21.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/use-form-status-parent-scope.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-form-status-parent-scope.md`。
- 同源 Demo：`react.core.learn.advanced.use-form-status-parent-scope.parent-form-status-demo`。

本课只建立 `useFormStatus` 的四字段、最近父 form 后代作用域、声明 form 的同组件边界、无父 form
空闲对象与兄弟 form 隔离。Demo 使用两个合法兄弟 form 和本地 Promise gate 观察客户端 function Action；
不引入 Server Function、真实网络、`useActionState`、`useOptimistic`、物理嵌套 form 或后续课程 API。

### 21.2 Admission、复审与发布

- `npm run type-check`、`npm run lint`、`npm run format:check`、空 `npm run test:unit`、空
  `npm run test:e2e`、`npm run build` 与 scoped `git diff --check` 均通过，fresh build 转换 `1739` 个模块，
  未新增持久测试资产。
- Production Admission 覆盖 `1440x900`、`390x844` 与 `390x844 + 32px`。冷态五个 probe 都为完整
  idle；甲、乙提交时仅目标 form 后代进入 pending，分别读取提交消息、`method=post` 与正确 Action
  引用，同组件、表单外及兄弟 form 后代保持 idle；settle 后真实 Action 计数依次为 `1/0`、`1/1`，
  账本记录 form、消息、method、Action 匹配与 settled 状态。
- 重建实验和 SPA 离页返回均恢复 `甲 0 次 / 乙 0 次`、无 active gate、无提交账本和默认输入；DOM
  恰有两个 form 且不存在 `form form`。三种视口的页面、body 与 Demo 横向溢出均为 `0`，按钮文字
  溢出为 `0`、最小高度为 `42px`；console、pageerror 与课程业务 fetch/XHR/WebSocket 均为 `0`。
- 浏览器源码面板与磁盘按 manifest 顺序 TSX -> CSS 拼接的 `trimEnd()` 指纹完全一致：`13893` 个字符、
  `14665` 个 UTF-8 字节，SHA-256 为
  `38947c252a1d0debb13ac2c45109ee0dd2e4abd06607f4075515628cf77e59e4`。
- 冻结四项资产最终 SHA-256 为：研究稿
  `cf52608125c1be193bb1bba69b4b86c2beebacbe5dcdae18ee66e73d4e95f9d2`、正文
  `8986b1c39e4a712766e7b39d097266c789b831af0876f7bce91b057c2e2b3eb8`、TSX
  `e77affc1f13c77ac8d74a1ad34784a0592770d58d8e36ee821777e896e3c8dba`、CSS
  `225826e74cb32609a237a28af5143dfc8491196ddcb8125bf5e6d663e7eafa78`。
- 独立 combined review 首次发现正文缺少“源码推导与适用场景”、Action 调用次数统计过早以及账本缺少
  method/action 两项合同。完成教学与行为修正并重跑完整反馈环后，同一 reviewer 复核最终四项 SHA，
  Standards 与 Spec 均为 `PASS / 0 finding`，无未解决 finding。
- 已原子登记 entry/demo manifest，并将 Track 第 15 课切为 `available`；当前进度为
  `15/24 available`、`9 planned`，下一课为第 16 课“useSyncExternalStore 快照合同”。

## 22. 第 16 课：`useSyncExternalStore` 快照合同

### 22.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/use-sync-external-store-snapshot.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-sync-external-store-snapshot.md`。
- 同源 Demo：`react.core.learn.advanced.use-sync-external-store-snapshot.external-store-snapshot-demo`。

本课只建立稳定 `subscribe`、可缓存且不可变的 `getSnapshot`、`Object.is` 比较、对称 cleanup 与卸载后
重挂载合同。Demo 使用两个独立 Reader 读取同一页面内 store，并提供新快照、同值通知、无关父级
render、卸载、重挂载和完整重建；不引入 Redux/Zustand、selector、远程缓存、SSR/hydration、Suspense
数据读取或 Transition 调度。

### 22.2 Admission、复审与发布

- `npm run type-check`、`npm run lint`、`npm run format:check`、空 `npm run test:unit`、空
  `npm run test:e2e`、`npm run build` 与 scoped `git diff --check` 均通过，fresh build 转换 `1745` 个模块，
  未新增持久测试资产。
- Production Admission 覆盖 `1440x900`、`390x844` 与 `390x844 + 32px`。冷态为两个 listener、
  `subscribe/cleanup=2/0`、Reader `A 1 / B 1`；只更新外壳后 Reader 为 `A 2 / B 2` 且订阅仍为
  `2/0`。发布新快照后两者读取 revision 1 并各 render 一次；同值通知只增加 notify，`Object.is=true`
  且 Reader render 不变。
- 卸载后 active listener 为 `0`、cleanup 为 `2`，期间发布 revision 2 不触发旧 Reader；重挂载后读取
  revision 2，active listener 恢复 `2`，账本为 `4/2` 且新代 Reader 均从 `1` 开始。重建实验与 SPA
  离页返回均恢复 revision 0、`2/0`、generation 1 和 `A 1 / B 1` 冷态。
- 三种视口的页面、body 与 Demo 横向溢出均为 `0`，按钮文字无裁切、无重叠且最小高度为 `42px`；
  console、pageerror 与课程业务 fetch/XHR/WebSocket 均为 `0`。
- 浏览器源码面板与磁盘按 manifest 顺序 TSX -> CSS 拼接的 `trimEnd()` 指纹完全一致：`19172` 个字符、
  `20696` 个 UTF-8 字节，SHA-256 为
  `09b27ff059be2596d66fe6a5dcbdaeb9e5b91dcfa6f9e2598bc25b208f6a4e99`。
- 冻结四项资产最终 SHA-256 为：研究稿
  `64a14c58459ef6077ecb58572f615fd6acc70eadba551126ab755260dfa549c4`、正文
  `a5a73a270cd989d4383e1020ab35f76a6061cad504df38c8605628909394ffc6`、TSX
  `fa495989998565307f567ac40cb3642d4ca0b6d6f85d59cab9998dd456f98e52`、CSS
  `c6d3f6ec6ad57856b01f04f37668cb9e67774ebf68a4a7efa3ec89164768938b`。
- 独立 combined review 首次发现 Track 摘要未更新及外壳 state 未覆盖 Reader 子树；行为修正并重跑
  完整反馈环后，复审只剩一项职责注释不准确。完成非行为注释修正和定向复验后，同一 reviewer 确认
  Standards 与 Spec 均为 `PASS / 0 finding`，无未解决 finding。
- 已原子登记 entry/demo manifest，并将 Track 第 16 课切为 `available`；当前进度为
  `16/24 available`、`8 planned`，下一课为第 17 课“Portal 的 React 树与 DOM 位置”。

## 23. 第 17 课：Portal 的 React 树与 DOM 位置

### 23.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/portal-tree-and-dom-placement.md`。
- 课程正文：`src/categories/frontend/react/core/learn/portal-tree-and-dom-placement.md`。
- 同源 Demo：`react.core.learn.advanced.portal-tree-and-dom-placement.portal-placement-demo`。

本课只建立 `createPortal` 的 React 树与 DOM 落点区别、Context 与 React 树事件语义、原生
`composedPath()`、同 target State 保留、更换 target 重建以及外部 host 对称清理合同。Demo 在
`document.body` 下创建当前实验独占的 host 与稳定 A/B target；不引入第二 Root、`flushSync`、hydration、
跨 document/iframe 或完整 overlay/modal 教程。

### 23.2 Admission、复审与发布

- `npm run type-check`、`npm run lint`、`npm run format:check`、空 `npm run test:unit`、空
  `npm run test:e2e`、`npm run build` 与 scoped `git diff --check` 均通过，fresh build 转换 `1753` 个模块，
  未新增持久测试资产。
- Production Admission 冷态为 Target A、Context 海蓝、实例/计数 `1/0`，React parent 不包含 child，
  Portal host 与 Target A 包含 child，host 位于 `#app` 外且 host 与 React root 都直接属于 body。Context
  切换到琥珀后实例/计数保持 `1/0`。
- Portal 点击后的 React log 为 `Portal child -> React parent`；原生路径为
  `portal-probe -> portal-child -> target-A -> portal-host`，不含 React parent。Target A 中计数增至 `2`
  并更新 owner 外壳后仍为 `1/2`；A -> B 为 `2/0`，B 中计数增至 `1` 后 B -> A 为 `3/0`。
- SPA 离页前 host/targets/child 为 `1/2/1`，离页后归零，返回后恢复 Target A、海蓝、`1/0`。
  `1440x900`、`390x844` 与 `390x844 + 32px` 下页面、Demo、host 横向溢出均为 `0`，无裁切或同组重叠，
  按钮文字溢出为 `0`、最小高度为 `42px`；console、pageerror 与课程业务 fetch/XHR/WebSocket 均为 `0`。
- 浏览器源码面板与磁盘按 manifest 顺序 TSX -> CSS 拼接的 `trimEnd()` 指纹完全一致：`22531` 个字符、
  `23429` 个 UTF-8 字节，SHA-256 为
  `1feb86390a38cba534486527940b8fa0326c0753a1c120cae3de6a609d104a80`。
- 冻结四项资产最终 SHA-256 为：研究稿
  `cb9936e6e2af9bf0a9a5807ebc21c3eb8f024d5ef11aa73ad1edce2e744e33dc`、正文
  `a12fef04fac159fecfc2024ea4f968a9b476a61868dea40cd212e931bb256c53`、TSX
  `84930d5702eac9f1f9a934e958850d4790a65ede1c9fd82097e116bad1c2139f`、CSS
  `8c717ccd25cda50495d422cc6cd22e01c586b2c16a48f7db025cc23492977be1`。
- 独立 combined review 首轮发现平滑滚动、`10px` 圆角及两项 host/root 直接证据缺失。完成最小行为与
  教学证据修正并重跑反馈环后，同一 reviewer 确认 Standards 与 Spec 均为 `PASS / 0 finding`，无未解决
  finding。
- 已原子登记 entry/demo manifest，并将 Track 第 17 课切为 `available`；当前进度为
  `17/24 available`、`7 planned`，下一课为第 18 课“hydrateRoot 与标记一致性”。

## 24. 第 18 课：hydrateRoot 与标记一致性

### 24.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/hydrate-root-markup-identity.md`。
- 课程正文：`src/categories/frontend/react/core/learn/hydrate-root-markup-identity.md`。
- 同源 Demo：`react.core.learn.advanced.hydrate-root-markup-identity.hydration-fixture-demo`。

本课只建立既有 React-compatible HTML、`hydrateRoot` 首帧一致性、Node 身份与事件接管、三类 Root
错误回调及 `root.unmount()` 终止语义。Demo 使用可信静态 HTML 的 `srcDoc` 创建独立
`about:srcdoc` Document；不引入 `react-dom/server`、streaming、RSC、全 document/Suspense hydration、
metadata 或资源提示。

### 24.2 Admission、复审与发布

- `npm run type-check`、`npm run lint`、`npm run format:check`、空 `npm run test:unit`、空
  `npm run test:e2e`、`npm run build` 与 scoped `git diff --check` 均通过，fresh build 转换 `1760` 个模块，
  未新增持久测试资产。
- Production Admission 的匹配场景先证明 hydration 前点击仍为 `0`，接管后 Main/Button Node 均严格相同，
  `React State / commit` 从 `0 / 1` 变为 `1 / 2`，三个错误通道保持为 `0`。
- mismatch 只进入 recoverable；Boundary 与 Root render error 分别得到 `0/1/0`、`0/0/1`，局部 fallback
  和 `stack=yes` 均可观察。卸载按钮在计数为 `0` 时禁用、计数到 `1` 后启用；终态为 commit `1/2`、
  Effect `1/1`、容器 child `0`、旧按钮 `isConnected=false`、旧按钮点击无更新，旧 Root render 抛
  production `#409`。
- SPA 离页返回恢复静态冷态：`about:srcdoc`、commit/Effect `0/0`、三个错误通道均为 `0`。
  `1440x900`、`390x844` 与 `390x844 + 32px` 下页面和 Demo 横向溢出均为 `0`，按钮无重叠或文字裁切；
  移动端 iframe 内容与视口同为 `242x448`，无纵向裁切。console、pageerror 与课程业务
  fetch/XHR/WebSocket 均为 `0`。
- 浏览器源码面板与磁盘按 manifest 顺序 TSX -> HTML -> CSS 拼接的 `trimEnd()` 指纹完全一致：`32750`
  个字符、`34382` 个 UTF-8 字节，SHA-256 为
  `b26ec3f2de3f15d58f50b765eb9272d87576b2946a2c6e9550847d348b655d0f`。
- 冻结五项资产最终 SHA-256 为：研究稿
  `4b6e58cf2bae7063dbb2a81e7761f08c3240c9f004188dda5b61a7122188baf1`、正文
  `0406961bbd483112c7d0fa92e3125de34ceaa84e32ffcbc88a2543940809120d`、TSX
  `d46977191fe4b3c22515fed8a80d3e0c9ebd80ee457d5f26191bc8507436b7e5`、HTML
  `1804794c088b3ae0ae26e16e6604daa1c6dbf5a7cd6780c922d2d8ac3e6d912d`、CSS
  `b48d3e5989981bc4d663a058fec5d18a15f33832fe3df255050957467607a966`。
- 独立 combined review 首轮报告 Standards `0`、Spec `4`；完成完整 `componentStack`、F6 计数前置、两项
  pitfalls 与措辞边界修正后，reviewer 确认原 Spec finding 全部关闭，并指出两个示例一致性问题。按真实
  `RenderFailure` 签名和 `releaseRootAfterCommit` 策略完成简单定向修正后，Prettier、scoped diff 与
  production build 均通过，无未解决 finding。
- 已原子登记 entry/demo manifest，并将 Track 第 18 课切为 `available`；当前进度为
  `18/24 available`、`6 planned`，下一课为第 19 课“React 文档元数据提升”。
