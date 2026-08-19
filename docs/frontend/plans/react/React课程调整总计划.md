# React Core 课程调整总计划

> 计划日期：2026-08-15
> 状态：路线已冻结，74/74 全部完成，最终 Gate 已通过
> 适用版本：React / React DOM 19.2.8，React 官方文档 19.2
> 目标学习者：具备 HTML、CSS、JavaScript、TypeScript 和基础前端工程知识，但没有学过 React
> 执行范围：只调整 `react/core` 课程；暂不处理 Reference、Router、第三方状态库、数据请求库和测试课程
> 调整前基线：基础 20/20、中级 29/29、高级 18/24 available
> 完成结果：基础 24/24、中级 21/21、高级 29/29；知识课 62/62、实战课 12/12

## 1. 调整目标

当前课程正文已经积累了大量可复用的官方事实、示例、易错点和 Demo，但路线仍有四个结构性问题：

1. 第一课直接进入 TSX，没有解释怎样创建、运行和认识一个 React 项目。
2. 旧的“最小知识点一课”规则把 State、Reducer、Context、Effect 和 Transition 切得过细，学习者需要在
   多课之间反复拼接同一个心智模型。
3. `useMemo`、`useId`、StrictMode、Hooks 规则等必学内容没有独立承担完整教学责任，部分内容散落在其他
   课程中。
4. 课程正文普遍很丰富，但部分基础课混入 Legacy、宿主集成或低频 API，影响主线节奏。

本次调整采用“一个完整问题一课”，不再追求“一个最小名词一课”。合并只发生在共享同一心智模型、
前置知识、Demo 和开发决策的内容之间；调用位置、生命周期、失败模式或适用决策明显不同的内容仍拆开。

调整后的目标路线为：

| 阶段 | 知识课 | 实战课 | 合计 |
| --- | ---: | ---: | ---: |
| 基础 | 21 | 3 | 24 |
| 中级 | 17 | 4 | 21 |
| 高级 | 24 | 5 | 29 |
| 总计 | 62 | 12 | 74 |

最终数量只有在 74 节全部完成、Track 与 manifest 同步并通过终验后才视为正式完成度。旧路线的
`20/29/24` 只表示调整前基线，不能和新路线数量混用。

## 2. 范围边界

### 2.1 本计划包含

- React、React DOM、JSX/TSX、组件、Props、State、事件、表单和稳定 Hooks。
- 浏览器 DOM 宿主中的 Root、Ref、Portal、Effect、Hydration 和稳定资源能力。
- React 19.2 稳定的并发 UI、Action、Activity 和客户端可验证能力。
- 只复用已学知识的阶段实战课。

### 2.2 本计划不包含

- React Router、Redux Toolkit、React Redux、Zustand、TanStack Query。
- React Server Components、Server Functions、`react-dom/server`、`react-dom/static`。
- React Compiler、React DevTools、eslint plugin、测试框架、CI 和部署。
- Canary、Experimental、未文档化 API。
- `Children`、`cloneElement`、`createElement`、`createRef`、`forwardRef`、`isValidElement`、`Component`、
  `PureComponent` 的主线教学。只在相关课程保留必要的迁移或 Legacy 边界。
- Reference 页面、Reference 入口、API 到课程的跳转关系。

### 2.3 路线切换规则

- 本文档是后续 React Core 课程调整的唯一执行路线；RC1、RC2、RC3 只作为历史调研和正文复用依据。
- 旧高级路线尚未发布的第 19-24 课停止按旧计划实施，后续直接执行本文 A19-A24 与 AL5 的新范围和顺序。
- 已发布的高级课程不直接计为新路线完成；到达对应 A 批次时仍须重新审计、验证并记录闭环。
- 不允许先补完旧高级路线，再回头执行新方案。

## 3. 每课内容检查分类

逐课实施时，必须先按本节重新审计现有正文。分类用于检查完整性，不要求每课拥有完全相同的标题。

### 3.1 所有知识课必查

| 分类 | 最低要求 |
| --- | --- |
| 课程定位 | 明确本课解决的问题、真实前置、包含范围和排除范围 |
| 学习目标 | 3-6 个可以通过代码、结果或解释验证的目标 |
| 为什么需要 | 从学习者已经掌握的知识和真实开发问题引入 |
| 核心定义 | 给出准确术语、最小心智模型和相近概念区别 |
| 最小正确用法 | 提供最小可运行写法，并解释输入、过程和结果 |
| 常用用法 | 覆盖高频场景、主要变体和选择规则 |
| 行为规则 | 解释数据流、执行时机、身份、更新或生命周期；不把内部实现写成公共合同 |
| 易错使用 | 通常保留 3-6 个高价值错误，写清触发条件、原因、后果、错误与正确示例 |
| 适用边界 | 说明什么时候使用、什么时候不使用、替代方案和后续课程边界 |
| 示例或 Demo | 必须能观察本课结论；没有浏览器观察价值时使用最小代码示例 |
| 练习与验收 | 要求修改、预测、排错或实现，并给出明确完成标准 |
| 本节小结 | 只保留可以直接用于开发判断的规则 |
| 官方来源 | 使用实际支持正文结论的一手来源，标明适用版本 |

### 3.2 按课程类型启用

| 课程类型 | 追加检查分类 |
| --- | --- |
| 项目搭建 | 环境前提、创建命令、运行/构建命令、目录职责、入口链路、第一次修改、常见启动错误 |
| Hook/API | 导入、签名、参数、返回值、调用位置、执行时机、更新规则、依赖/身份比较、TypeScript 类型 |
| State/数据流 | 状态所有者、读取者、更新入口、快照、派生值、重置方式、单一事实来源 |
| Effect/生命周期 | setup、cleanup、重新同步条件、执行顺序、外部资源所有权、竞态和清理 |
| DOM/Ref | React 树与 DOM 树、提交时机、节点获取、节点失效、宿主所有权 |
| 事件/表单 | 浏览器默认行为、React 事件层、数据来源、提交过程、基础无障碍 |
| 性能/并发 | 问题基线、测量方式、优化目标、调度行为、可观察状态、成本和非保证事项 |
| 异步/错误 | pending、success、error、恢复、取消或过期结果边界 |
| 实战课 | 已学知识清单、功能要求、实现阶段、验收清单；禁止引入未学 API |

### 3.3 只在直接相关时启用

以下内容不得为了统一格式硬塞进每课：

- TypeScript 特殊类型边界。
- StrictMode 开发期行为。
- 性能成本。
- 无障碍和安全。
- SSR/Hydration。
- 错误传播。
- 版本差异和迁移。
- Legacy API 边界。

### 3.4 精简规则

1. 同一结论只在负责它的课程完整解释一次，其他课程只保留必要提醒和前置链接。
2. 不设统一行数、字数和错误数量；内容覆盖以本课知识点的本科范围为准，没有高价值内容就不创建空章节。
3. 优先保留影响正确性、可维护性和常见开发决策的内容。
4. 删除源码字段枚举、内部 helper 细节和低频 API 展开，除非它们直接支撑当前公开行为。
5. 精简只删除重复、空话和过度修饰，不按行数或字数删减知识点。
6. 学习路径左侧标题使用简短、稳定的知识点名称，不使用“第一课”等顺序词；详细说明放在 summary 和正文。
7. Demo 只展示能观察的结论，不用复杂业务包装简单知识点。

## 4. 合并、拆分与移动规则

### 4.1 可以合并

- 共享同一核心问题和同一组前置知识。
- 通常在同一个功能中一起使用，拆开后会重复定义和示例。
- 可以由一个清晰标题、一个主要 Demo 和一组验收目标覆盖。
- 合并后仍能在合理时间内完成，不需要并列堆砌多个互不相关 API。

### 4.2 必须拆开

- 调用位置、返回信号、执行时机或失败模式不同。
- 可以独立选择、独立练习和独立排错。
- 需要不同宿主或验证载体，例如普通 SPA 与 Hydration fixture。
- 合并后标题只能使用“综合”“全解”或长串 API 罗列才能成立。

### 4.3 阶段移动

- 必学且能直接支撑后续课程的内容前移。
- 逃生舱、性能、宿主集成和库作者能力后移。
- Legacy、低频或只用于特殊基础设施的内容放在高级末尾或只保留边界说明。
- 移动已发布课程时保留稳定 ID；`stage` 只是路线元数据，不进入 URL。

## 5. 基础课程路线

基础阶段目标是让学习者能从空目录启动 React 项目，理解组件渲染和局部 State，并独立完成一个有表单、
列表和状态交互的小应用。

| 顺序 | 目标 ID | 课程 | 来源与动作 | 核心范围 |
| ---: | --- | --- | --- | --- |
| B01 | `react.core.learn.basics.vite-react-project-setup` | Vite React 项目搭建 | 新增 | 创建、安装、运行、构建、预览、目录、`main.tsx`、`App.tsx`、首次修改 |
| B02 | `react.core.learn.basics.tsx-markup-syntax` | TSX 标记语法 | 复用并精简 | `.tsx`、单根、闭合、Fragment、注释、文本 |
| B03 | `react.core.learn.basics.tsx-expressions-and-attributes` | TSX 表达式与属性 | 复用并去重 | 花括号、动态值、布尔属性、child 值边界 |
| B04 | `react.core.learn.basics.function-components` | 函数组件 | 复用并收窄 | 定义、命名、调用、返回、顶层定义；纯度移到 B12 |
| B05 | `react.core.learn.basics.module-boundaries-and-component-tree` | 模块边界与组件树 | 复用并精简 | 导入导出、根组件、组件树、模块树 |
| B06 | `react.core.learn.basics.jsx-runtime-and-react-element` | JSX Runtime 与 React Element | 复用并精简 | 从 TSX 到 Element 的最小模型；Legacy API 只留边界 |
| B07 | `react.core.learn.basics.react-root-lifecycle` | React Root 与页面入口 | 复用并收窄 | `createRoot`、`render`、容器所有权、`unmount`；Hydration 后移 |
| B08 | `react.core.learn.basics.props` | Props | 复用 | 只读输入、默认值、TypeScript 合同、函数 Prop |
| B09 | `react.core.learn.basics.children-and-composition` | children 与组合 | 复用并精简 | `ReactNode`、单区域、命名区域、render prop；Legacy Children/cloneElement 下沉 |
| B10 | `react.core.learn.basics.conditional-rendering` | 条件渲染 | 复用 | `if`、提前返回、三元、`&&`、`null`、类型收窄 |
| B11 | `react.core.learn.basics.list-rendering-and-key` | 列表渲染与 key | 复用 | `map`、`filter`、稳定 key、身份与重排 |
| BL1 | `react.core.learn.basics.lab-static-course-catalog` | 实战：静态课程目录 | 新增实战 | 组件拆分、Props、组合、条件、列表、key |
| B12 | `react.core.learn.basics.component-purity` | 组件与 Hook 的纯度 | 新增并抽取 | 幂等、不可变输入、局部修改、副作用边界；从函数组件等课程迁入 |
| B13 | `react.core.learn.basics.event-handling` | 事件处理 | 复用并去重 | handler、事件对象、传播、默认行为、TypeScript 类型 |
| B14 | `react.core.learn.basics.rules-of-hooks` | Hooks 调用规则 | 新增 | 顶层调用、React 函数边界、调用顺序、lint 作用、`use` 的后续例外 |
| B15 | `react.core.learn.basics.use-state` | useState | 复用并收窄 | 签名、初始化、setter、局部状态、类型；队列细节留给 B16 |
| B16 | `react.core.learn.basics.render-commit-and-state-snapshot` | React 更新模型 | 合并 | 吸收“State 更新队列”，覆盖 trigger、render、commit、快照、batching、updater |
| B17 | `react.core.learn.basics.immutable-state-updates` | State 的不可变更新 | 新目标，合并 | 吸收对象与数组 State 更新，覆盖浅复制、嵌套更新和常用数组操作 |
| BL2 | `react.core.learn.basics.lab-task-editor` | 实战：任务清单编辑器 | 新增实战 | 事件、State、更新模型、对象与数组不可变更新 |
| B18 | `react.core.learn.basics.dom-props` | DOM Props | 复用并收窄 | 命名、布尔值、`className`、`style`、`data-*`、`aria-*`、透传 |
| B19 | `react.core.learn.basics.use-id-accessible-links` | useId 与可访问关联 | 新增 | 唯一 ID 前缀、label/描述关联、多实例、SSR 前缀边界；不用于列表 key |
| B20 | `react.core.learn.basics.react-forms` | React 表单 | 新目标，合并 | 吸收受控表单与提交默认行为，覆盖输入、提交、FormData 和基础无障碍 |
| B21 | `react.core.learn.basics.state-ownership-and-thinking-in-react` | State 所有权 | 复用并去重 | 最小 State、所有者、单一事实来源、单向数据流、组件拆分 |
| BL3 | `react.core.learn.basics.lab-course-registration` | 实战：课程报名 | 新增实战 | DOM Props、`useId`、表单、派生筛选、State 所有权 |

基础阶段完成条件：24/24 目标条目可访问，三个实战不引入中级 API，随后才能调整中级课程。

## 6. 中级课程路线

中级阶段目标是掌握状态建模、跨组件协作、Ref、Effect 和自定义 Hook，并能正确决定 State、Context、
Ref 与 Effect 的职责边界。

| 顺序 | 目标 ID | 课程 | 来源与动作 | 核心范围 |
| ---: | --- | --- | --- | --- |
| I01 | `react.core.learn.intermediate.state-structure` | State 结构与派生数据 | 合并 | 吸收“派生值”；最小 State、避免矛盾/重复、同步派生；`useMemo` 后移 |
| I02 | `react.core.learn.intermediate.lifting-state-up` | State 提升与受控边界 | 合并 | 吸收“受控与非受控组件”；共同所有者、value/onChange/defaultValue 合同 |
| I03 | `react.core.learn.intermediate.state-preservation-and-reset` | State 保留与重置 | 新目标，合并 | 吸收位置身份与 key 重置；组件类型、位置、key、子树重建 |
| IL1 | `react.core.learn.intermediate.lab-multi-step-editor` | 实战：多步骤编辑器 | 新增实战 | State 结构、派生数据、提升、受控边界、保留与重置 |
| I04 | `react.core.learn.intermediate.use-reducer` | useReducer 与 Action | 合并 | 吸收 Action 设计和 Reducer 纯度；签名、dispatch、判别联合、纯 reducer |
| I05 | `react.core.learn.intermediate.context-providing-and-reading` | Context 创建、提供与读取 | 新目标，合并 | 吸收 createContext、useContext、Provider 作用域；默认值、最近 Provider、覆盖 |
| I06 | `react.core.learn.intermediate.reducer-context-composition` | Reducer 与 Context 组合 | 复用 | 状态/dispatch 拆分、Provider 封装、自定义读取 Hook |
| I07 | `react.core.learn.intermediate.state-sharing-boundary` | 状态共享边界 | 复用并去重 | 局部 State、提升、Context、外部 Store 的选择；不教学第三方库 |
| IL2 | `react.core.learn.intermediate.lab-shared-task-workspace` | 实战：共享任务工作区 | 新增实战 | Reducer、Context、状态边界、模块化 Provider |
| I08 | `react.core.learn.intermediate.use-ref` | useRef 保存可变值 | 复用并收窄 | ref 对象、持久值、非渲染数据、读写时机 |
| I09 | `react.core.learn.intermediate.dom-refs` | DOM Ref 与 Callback Ref | 合并 | 吸收 Callback Ref；节点操作、集合登记、setup/cleanup、节点失效 |
| I10 | `react.core.learn.intermediate.ref-as-prop` | ref 作为 prop | 复用 | React 19 直接传递、组件边界、React 18 `forwardRef` 迁移提示 |
| I11 | `react.core.learn.advanced.portal-tree-and-dom-placement` | Portal 与 DOM 落点 | 从高级前移，保留 ID | DOM 放置、React 树、事件传播、宿主节点生命周期 |
| IL3 | `react.core.learn.intermediate.lab-accessible-dialog` | 实战：可访问对话框 | 新增实战 | DOM Ref、Callback Ref、ref prop、Portal、焦点恢复 |
| I12 | `react.core.learn.intermediate.use-effect` | useEffect 同步生命周期 | 合并 | 吸收 Effect 清理和生命周期；setup、cleanup、重新同步、StrictMode 提示 |
| I13 | `react.core.learn.intermediate.unnecessary-effects` | 不需要 Effect 的场景 | 复用并扩充 | render 派生、事件处理、State 重置、父子通知、缓存边界 |
| I14 | `react.core.learn.intermediate.effect-dependencies` | Effect 依赖与稳定化 | 合并 | 吸收“移除 Effect 依赖”；响应值、Object.is、对象/函数依赖、重构方法 |
| I15 | `react.core.learn.intermediate.effect-events` | useEffectEvent | 复用 | 响应式与非响应式逻辑、读取最新值、调用边界 |
| I16 | `react.core.learn.intermediate.custom-hooks` | 自定义 Hook 与 useDebugValue | 复用并扩充 | 抽取状态逻辑、命名和调用规则、独立 State、调试标签 |
| I17 | `react.core.learn.intermediate.strict-mode-development-checks` | StrictMode 开发检查 | 新增并抽取 | 额外 render、Effect 重连、Ref setup/cleanup、弃用检查、非生产行为 |
| IL4 | `react.core.learn.intermediate.lab-synchronized-chat-room` | 实战：可切换聊天室 | 新增实战 | Effect 生命周期、依赖治理、Effect Event、自定义 Hook、StrictMode |

中级阶段完成条件：21/21 目标条目可访问，Effect 实战没有依赖抑制、伪清理或未学数据请求库，随后才能
调整高级课程。

## 7. 高级课程路线

高级阶段先测量再优化，随后进入异步边界、并发 UI、Action、外部系统和宿主逃生舱。低频资源和库作者
能力统一放在阶段末尾。

| 顺序 | 目标 ID | 课程 | 来源与动作 | 核心范围 |
| ---: | --- | --- | --- | --- |
| A01 | `react.core.learn.advanced.profiler-render-measurement` | Profiler 渲染测量 | 复用 | commit 测量、回调数据、开发/profiling 构建边界 |
| A02 | `react.core.learn.advanced.use-memo-value-caching` | useMemo 与值缓存 | 新增并从派生值抽取 | 依赖、缓存计算结果、测量前提、非语义保证、对象身份 |
| A03 | `react.core.learn.advanced.memo-component-bailout` | memo 与组件跳过渲染 | 复用 | Props 比较、跳过 render、上下文/State 边界、自定义比较风险 |
| A04 | `react.core.learn.advanced.use-callback-function-identity` | useCallback 与函数身份 | 复用并去重 | 函数身份、依赖、与 memo 配合、updater 缩减依赖 |
| AL1 | `react.core.learn.advanced.lab-render-performance` | 实战：渲染性能诊断 | 新增实战 | Profiler、memo、useMemo、useCallback；先复现和测量再优化 |
| A05 | `react.core.learn.advanced.error-boundary-render-failures` | Error Boundary | 复用并扩充 | 渲染错误、fallback、恢复、事件/异步边界、必要类组件外壳 |
| A06 | `react.core.learn.advanced.lazy-component-code-splitting` | lazy 组件代码分割 | 复用 | 动态导入、缓存、默认导出、失败交给 Error Boundary |
| A07 | `react.core.learn.advanced.suspense-fallback-boundary` | Suspense fallback 边界 | 复用 | 最近边界、共同 reveal、嵌套边界、已显示内容保护 |
| A08 | `react.core.learn.advanced.use-resource-reading` | use 读取 Context 与异步资源 | 新目标，吸收 use(promise) | `use(context)`、`use(promise)`、条件调用例外、Suspense/Error Boundary |
| AL2 | `react.core.learn.advanced.lab-lazy-report-viewer` | 实战：异步报告查看器 | 新增实战 | Error Boundary、lazy、Suspense、use、重试与边界分层 |
| A09 | `react.core.learn.advanced.use-transition-pending-action` | Transition 与 pending UI | 合并 | 吸收 startTransition；Hook 内外调用、Action、pending、限制 |
| A10 | `react.core.learn.advanced.use-deferred-value-stale-content` | useDeferredValue 与陈旧内容 | 复用 | 延迟值、stale UI、Suspense、与防抖/节流区别 |
| A11 | `react.core.learn.advanced.activity-hidden-state-restoration` | Activity 隐藏与状态恢复 | 复用 | hidden/visible、State/DOM 保留、Effect 暂停、优先级 |
| AL3 | `react.core.learn.advanced.lab-concurrent-search-workspace` | 实战：并发搜索工作区 | 新增实战 | Transition、deferred value、Suspense、Activity |
| A12 | `react.core.learn.advanced.form-action-client-submission` | 表单 Action 与提交状态 | 合并 | 吸收 useFormStatus；function Action、FormData、成功重置、pending 作用域 |
| A13 | `react.core.learn.advanced.use-action-state-result-queue` | useActionState 与 Action 结果 | 复用 | 前次 State、Action 队列、pending、错误结果建模 |
| A14 | `react.core.learn.advanced.use-optimistic-pending-state` | useOptimistic 乐观状态 | 复用 | 临时状态、回滚、并发 Action、稳定身份 |
| AL4 | `react.core.learn.advanced.lab-action-review-queue` | 实战：异步审核队列 | 新增实战 | Form Action、useFormStatus、useActionState、useOptimistic |
| A15 | `react.core.learn.advanced.use-sync-external-store-snapshot` | useSyncExternalStore 快照合同 | 复用 | subscribe、getSnapshot、不可变快照、SSR 参数边界 |
| A16 | `react.core.learn.intermediate.use-imperative-handle` | useImperativeHandle | 从中级后移，保留 ID | 受限命令句柄、ref prop、依赖、避免暴露完整 DOM |
| A17 | `react.core.learn.intermediate.use-layout-effect` | useLayoutEffect | 从中级后移，保留 ID | paint 前测量、阻塞成本、Effect 选择、SSR 警告 |
| A18 | `react.core.learn.advanced.hydrate-root-markup-identity` | hydrateRoot 与标记一致性 | 复用 | 匹配 HTML、错误回调、root 生命周期、隔离 fixture |
| A19 | `react.core.learn.advanced.flush-sync-dom-commit` | flushSync 同步提交边界 | 新增并抽取 | 第三方回调、立即 DOM 读取、Suspense/性能代价、最后手段定位 |
| A20 | `react.core.learn.advanced.document-metadata-hoisting` | React 文档元数据提升 | 已完成 | `title`、`meta`、`link`、嵌套声明、更新和去重边界 |
| A21 | `react.core.learn.advanced.declarative-stylesheet-resources` | 声明式样式资源 | 已完成 | stylesheet/style 的放置、precedence、Suspense 协调、去重和更新边界 |
| A22 | `react.core.learn.advanced.declarative-async-script-resource` | 声明式异步脚本资源 | 已完成 | async script 的放置、去重、执行和资源所有权边界 |
| A23 | `react.core.learn.advanced.resource-hints` | 资源提示 API | 已完成 | prefetchDNS/preconnect、preload、preinit 及 module 变体的选择 |
| A24 | `react.core.learn.intermediate.use-insertion-effect` | useInsertionEffect | 从中级移到最后，保留 ID | CSS-in-JS 库作者、插入时机、不能读 Ref/更新 State、普通应用替代方案 |
| AL5 | `react.core.learn.advanced.lab-embedded-status-panel` | 实战：嵌入式状态面板 | 新增实战 | 外部 Store、命令句柄、布局测量、Hydration、宿主资源边界 |

高级阶段完成条件：29/29 目标条目可访问；Hydration 和 document 资源使用隔离 fixture；课程没有扩展到
RSC、server/static、Compiler、Router 或第三方数据层。

## 8. 已发布课程迁移

### 8.1 合并映射

| 退出路线的旧 ID | 新目标 ID |
| --- | --- |
| `react.core.learn.basics.state-update-queue` | `react.core.learn.basics.render-commit-and-state-snapshot` |
| `react.core.learn.basics.updating-object-state` | `react.core.learn.basics.immutable-state-updates` |
| `react.core.learn.basics.updating-array-state` | `react.core.learn.basics.immutable-state-updates` |
| `react.core.learn.basics.controlled-forms` | `react.core.learn.basics.react-forms` |
| `react.core.learn.basics.form-submit-and-default-behavior` | `react.core.learn.basics.react-forms` |
| `react.core.learn.intermediate.derived-values` | `react.core.learn.intermediate.state-structure` |
| `react.core.learn.intermediate.controlled-and-uncontrolled-components` | `react.core.learn.intermediate.lifting-state-up` |
| `react.core.learn.intermediate.state-identity-by-position` | `react.core.learn.intermediate.state-preservation-and-reset` |
| `react.core.learn.intermediate.resetting-state-with-key` | `react.core.learn.intermediate.state-preservation-and-reset` |
| `react.core.learn.intermediate.action-design` | `react.core.learn.intermediate.use-reducer` |
| `react.core.learn.intermediate.reducer-purity` | `react.core.learn.intermediate.use-reducer` |
| `react.core.learn.intermediate.create-context` | `react.core.learn.intermediate.context-providing-and-reading` |
| `react.core.learn.intermediate.use-context` | `react.core.learn.intermediate.context-providing-and-reading` |
| `react.core.learn.intermediate.provider-scope-and-overrides` | `react.core.learn.intermediate.context-providing-and-reading` |
| `react.core.learn.intermediate.callback-refs` | `react.core.learn.intermediate.dom-refs` |
| `react.core.learn.intermediate.effect-cleanup` | `react.core.learn.intermediate.use-effect` |
| `react.core.learn.intermediate.effect-lifecycle` | `react.core.learn.intermediate.use-effect` |
| `react.core.learn.intermediate.removing-effect-dependencies` | `react.core.learn.intermediate.effect-dependencies` |
| `react.core.learn.advanced.use-promise-reading` | `react.core.learn.advanced.use-resource-reading` |
| `react.core.learn.advanced.start-transition-background-update` | `react.core.learn.advanced.use-transition-pending-action` |
| `react.core.learn.advanced.use-form-status-parent-scope` | `react.core.learn.advanced.form-action-client-submission` |

### 8.2 未发布 planned ID

高级旧第 20-24 课尚未发布，不需要进度迁移：

- `react.core.learn.advanced.declarative-stylesheet-resources` 与
  `react.core.learn.advanced.declarative-async-script-resource` 保留为两课，分别承担样式资源和脚本资源的
  不同公共行为。
- `react.core.learn.advanced.resource-connection-warmup`、
  `react.core.learn.advanced.resource-preload-discovery`、
  `react.core.learn.advanced.resource-preinit-evaluation` 合并为
  `react.core.learn.advanced.resource-hints`。

### 8.3 进度和旧路径

已发布 ID 不能静默丢失完成状态。第一次发布合并课程前升级进度 schema；迁移规则只随当前课程原子加入，
禁止提前登记中级或高级目标：

1. 新 schema 支持按目标 ID 声明显式迁移组和不计入当前完成数的 `legacyCompletedEntryIds`；每次只加入
   当前课程涉及的旧 ID 和新目标 ID。
2. 迁移组包含目标原有 ID（若已发布）和所有被吸收的旧 ID。只有组内课程全部完成，且当前课程没有旧课
   未覆盖的新增必学范围时，新目标才自动完成；否则新目标保持未完成。
3. `recentEntryId` 指向旧 ID 时迁移到新目标 ID。
4. 退出路线的旧 ID 从当前完成集合移除；新目标尚未完成时，已完成的旧 ID 转入
   `legacyCompletedEntryIds` 保留迁移来源，且不计入新路线完成数。新目标完成后再清除对应历史来源。
5. 旧课程 URL 不建立重定向；退出 manifest 后按项目现有规则显示内容不存在。
6. 移动但未改 ID 的 Portal、useImperativeHandle、useLayoutEffect、useInsertionEffect 不迁移进度。

该改动触及持久化行为，必须使用临时测试资产验证 v1 到新 schema、完整与部分旧进度合并、历史来源保留
及清除、最近访问迁移、其他课程不受影响和重复读取幂等，并执行复杂修改审查。

## 9. 逐课执行流程

严格按 B01 到 BL3、I01 到 IL4、A01 到 AL5 串行执行。当前目标课程未闭环前，不调研、编写或登记下一课。

### 9.1 单课开始前

1. 记录 live Track、entry/demo manifest、当前正文、Demo 和工作区状态。
2. 只读取当前目标和可能被吸收的旧课程，不批量改写后续课程。
3. 依据第 3 节输出审计表：`保留`、`补充`、`删除`、`移动`、`合并`、`新增`。
4. 核对前置课程已经在新路线完成；未完成时硬停止。

### 9.2 单课调研与实现

1. 为当前目标建立独立官方调研记录；候选来源最终回到 React、React DOM、Vite 或 TypeScript 官方材料。
2. 冻结本课定义、公开行为、常用场景、易错点、边界和 Demo 观察目标。
3. 最大化复用现有正确内容，但按新课程责任去重、删减和重排。
4. 新增或调整同源 Demo；实战课只能组合已学知识。
5. 原子同步正文、Demo、entry manifest、demo manifest、Track、前置和 related。
6. 若当前目标吸收旧课程，同时处理进度迁移映射和退出路线的 manifest 引用。

### 9.3 单课验证

- 使用 `/tmp` 中的最小临时资产验证 Markdown、manifest、类型和必要负向行为，成功后清理。
- 运行与改动范围匹配的 type-check、lint、format check 和 build。
- 有页面或 Demo 变化时验证桌面、390px 和 200% 文本；检查交互、溢出、console 和源码同源。
- 新课程、合并课程、教学结论、Demo、manifest、进度或共享代码变化属于复杂修改，执行一次
  Standards/Spec 审查。
- 仅拼写、措辞、标题层级、格式或不改变行为的样式修正属于简单修改，只做定向验证，不重复完整审查。

### 9.4 单课完成记录

每课闭环后在本计划的执行日志追加：

- 目标 ID 与最终标题。
- 保留、补充、删除、移动、合并结果。
- 调研、正文、Demo、manifest、浏览器和质量命令状态。
- 审查是否需要及其结论。
- 当前新路线完成数和明确的下一课。

## 10. 阶段与最终 Gate

### 10.1 基础 Gate

- B01-B21 与 BL1-BL3 全部完成。
- 学习者可以从创建项目开始完成课程筛选与报名表单。
- 基础阶段不依赖 Context、Ref、Effect、性能或并发 API。

### 10.2 中级 Gate

- I01-I17 与 IL1-IL4 全部完成。
- State、Reducer、Context、Ref、Effect 的职责和选择边界不重复、不矛盾。
- 中级实战在 StrictMode 下没有未清理 Effect 或 Ref。

### 10.3 高级 Gate

- A01-A24 与 AL1-AL5 全部完成。
- `useMemo` 独立完整，Transition 和表单 Action 的合并范围清晰。
- 低频宿主能力位于阶段末尾，未进入 Server/RSC/Compiler 范围。

### 10.4 最终 Gate

- 新 Track 为 74/74，知识课 62/62，实战课 12/12。
- 所有前置和 related 只引用实际存在的条目。
- entry/demo manifest、正文 Demo ID、Track、进度迁移和计划日志一致。
- 桌面、390px、200% 文本代表路径通过，无横向溢出和 console error/warning。
- type-check、lint、format check、build、空测试目录命令全部通过。
- Reference 保持原状，未创建 API 页面或课程跳转。

## 11. 执行状态

| 批次 | 状态 | 说明 |
| --- | --- | --- |
| RP0 路线与分类冻结 | 完成 | 本文档冻结 62 节知识课、12 节实战课及迁移合同 |
| B01 Vite React 项目搭建 | 完成 | 新路线累计 1/74 |
| B02 TSX 标记语法 | 完成 | 新路线累计 2/74 |
| B03 TSX 表达式与属性 | 完成 | 新路线累计 3/74 |
| B04 函数组件 | 完成 | 新路线累计 4/74 |
| B05 模块边界与组件树 | 完成 | 新路线累计 5/74 |
| B06 JSX Runtime 与 React Element | 完成 | 新路线累计 6/74 |
| B07 React Root 与页面入口 | 完成 | 新路线累计 7/74 |
| B08 Props | 完成 | 新路线累计 8/74 |
| B09 children 与组合 | 完成 | 新路线累计 9/74 |
| B10 条件渲染 | 完成 | 新路线累计 10/74 |
| B11 列表渲染与 key | 完成 | 新路线累计 11/74 |
| BL1 实战：静态课程目录 | 完成 | 新路线累计 12/74 |
| B12 组件与 Hook 的纯度 | 完成 | 新路线累计 13/74 |
| B13 事件处理 | 完成 | 新路线累计 14/74 |
| B14 Hooks 调用规则 | 完成 | 新路线累计 15/74 |
| B15 useState | 完成 | 新路线累计 16/74 |
| B16 React 更新模型 | 完成 | 新路线累计 17/74 |
| B17 State 的不可变更新 | 完成 | 新路线累计 18/74 |
| BL2 实战：任务清单编辑器 | 完成 | 新路线累计 19/74 |
| B18 DOM Props | 完成 | 新路线累计 20/74 |
| B19 useId 与可访问关联 | 完成 | 新路线累计 21/74 |
| B20 React 表单 | 完成 | 新路线累计 22/74 |
| B21 State 所有权 | 完成 | 新路线累计 23/74 |
| BL3 实战：课程报名 | 完成 | 新路线累计 24/74 |
| I01 State 结构 | 完成 | 新路线累计 25/74 |
| I02 State 提升 | 完成 | 新路线累计 26/74 |
| I03 State 保留与重置 | 完成 | 新路线累计 27/74 |
| IL1 实战：多步骤编辑器 | 完成 | 新路线累计 28/74 |
| I04 useReducer 与 Action | 完成 | 新路线累计 29/74 |
| I05 Context | 完成 | 新路线累计 30/74 |
| I06 Reducer 与 Context 组合 | 完成 | 新路线累计 31/74 |
| I07 状态共享边界 | 完成 | 新路线累计 32/74 |
| IL2 实战：共享任务工作区 | 完成 | 新路线累计 33/74 |
| I08 useRef | 完成 | 新路线累计 34/74 |
| I09 DOM Ref 与 Callback Ref | 完成 | 新路线累计 35/74 |
| I10 ref 作为 prop | 完成 | 新路线累计 36/74 |
| I11 Portal 与 DOM 落点 | 完成 | 新路线累计 37/74 |
| IL3 实战：可访问对话框 | 完成 | 新路线累计 38/74 |
| I12-I17、IL4 | 完成 | 新路线累计 45/74，中级阶段 21/21 完成 |
| A01 Profiler 渲染测量 | 完成 | 新路线累计 46/74 |
| A02 useMemo 与值缓存 | 完成 | 新路线累计 47/74 |
| A03 memo 与组件跳过渲染 | 完成 | 新路线累计 48/74 |
| A04 useCallback 与函数身份 | 完成 | 新路线累计 49/74 |
| AL1 实战：渲染性能诊断 | 完成 | 新路线累计 50/74 |
| A05 Error Boundary | 完成 | 新路线累计 51/74 |
| A06 lazy 组件代码分割 | 完成 | 新路线累计 52/74 |
| A07 Suspense fallback 边界 | 完成 | 新路线累计 53/74 |
| A08 use 读取 Context 与异步资源 | 完成 | 新路线累计 54/74 |
| AL2 实战：异步报告查看器 | 完成 | 新路线累计 55/74 |
| A09 Transition 与 pending UI | 完成 | 新路线累计 56/74 |
| A10 useDeferredValue 与陈旧内容 | 完成 | 新路线累计 57/74 |
| A11 Activity 隐藏与状态恢复 | 完成 | 新路线累计 58/74 |
| AL3 实战：并发搜索工作区 | 完成 | 新路线累计 59/74 |
| A12 表单 Action 与提交状态 | 完成 | 新路线累计 60/74 |
| A13 useActionState 与 Action 结果 | 完成 | 新路线累计 61/74 |
| A14 useOptimistic 乐观状态 | 完成 | 新路线累计 62/74 |
| AL4 实战：异步审核队列 | 完成 | 新路线累计 63/74 |
| A15 useSyncExternalStore 快照合同 | 完成 | 新路线累计 64/74 |
| A16 useImperativeHandle | 完成 | 新路线累计 65/74 |
| A17 useLayoutEffect | 完成 | 新路线累计 66/74 |
| A18 hydrateRoot 与标记一致性 | 完成 | 新路线累计 67/74 |
| A19 flushSync 同步提交边界 | 完成 | 新路线累计 68/74 |
| A20 文档元数据提升 | 完成 | 新路线累计 69/74 |
| A21 声明式样式资源 | 完成 | 新路线累计 70/74 |
| A22 声明式异步脚本资源 | 完成 | 新路线累计 71/74 |
| A23 资源提示 API | 完成 | 新路线累计 72/74 |
| A24 useInsertionEffect | 完成 | 新路线累计 73/74 |
| AL5 实战：嵌入式状态面板 | 完成 | 新路线累计 74/74，高级阶段 29/29 完成 |
| React 课程最终 Gate | 完成 | 知识课 62/62、实战课 12/12，最终验收通过 |

### 11.1 B01 执行日志（2026-08-15）

- **目标：** `react.core.learn.basics.vite-react-project-setup`，导航与正文标题均为“Vite React 项目
  搭建”。这是全新知识课，无前置课程、旧正文或迁移来源；保留、删除、移动、合并均不适用。
- **调研与正文：** 新增独立官方调研和课程正文，冻结 React `19.2.8`、Vite `8.2.1`、
  create-vite `9.1.2` 与 npm CLI `11` 证据；覆盖环境、创建、安装、dev、build、目录职责、入口链、
  首次修改、常见启动错误和适用边界。
- **Demo：** 未登记站内 Demo。嵌入页面不能真实执行项目创建、依赖安装和生产构建，伪终端也不能证明这些
  结果；改由正文提供完整命令与入口文件，并在 `/tmp` 中真实创建 `react-ts` 项目、安装依赖和构建。
- **Manifest：** B01 已加入 entry manifest 与 Track 首位，`related` 指向实际存在的 B02；模块摘要同步，
  demo manifest、Reference 和进度 schema 保持不变。临时校验确认 B01 ID 引用边界和无 Demo 登记，资产已清理。
- **质量命令：** `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit` 与 `npm run test:e2e` 均通过；build 转换 `1764` 个模块，仅有既存的大 chunk 与
  Markdown 插件耗时警告，空测试目录未新增持久测试文件。
- **浏览器：** Playwright 在 `1440x900`、`390x844` 与 `390x844 + 32px` 根字号验证正式深链；B01 为
  学习路径首课，B02 为唯一下一篇，四项补充的 Vite 官方来源可见。三种场景均为 `0` 页面横向溢出、
  `0` 文本裁切、`0` console error/warning、`0` page error 和 `0` 失败请求，临时脚本与截图已清理。
- **审查：** 复杂修改已执行独立 Standards/Spec 审查；首轮唯一 finding 为正文直接来源登记不足，补齐
  Vite Features、Static Asset Handling、Server Options 与 Troubleshooting 后由原审查者复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `1/74`，知识课 `1/62`，实战课 `0/12`。唯一下一课为 B02“TSX 标记语法”。

### 11.2 B02 执行日志（2026-08-15）

- **目标：** `react.core.learn.basics.tsx-markup-syntax`，最终标题为“TSX 标记语法”。保留 `.tsx`、
  外层边界、语义父元素、Fragment、闭合与嵌套、注释和文本；补充 B01 前置与 B03 关联；删除完整类型
  检查矩阵、HTML content model 和无障碍扩展；attribute 移到 B03，JSX runtime、React element 与 DOM
  提交边界移到 B06/B07，尖括号类型断言留在 TypeScript 课程；没有合并其他课程。
- **调研与正文：** 独立调研记录已按新路线冻结 B02 范围；正文补充核验日期、目标、recap、直接来源和约
  35 分钟时长。课程只解释标记解析合同，不提前教授 attribute、组件、State
  或渲染过程。
- **Demo 与 Manifest：** 复用并收窄同源 Demo，只观察 Fragment 的两个同级节点、JSX 注释不进入文字、
  entity 显示和闭合结构；删除属性教学文案，CSS 无需修改。Demo manifest 标题更新为“TSX 标记与
  Fragment”；固定点核对确认 entry manifest 与 Track 已按 B01、B02、B03 排列，无需重复改写。
- **临时验证：** TypeScript `7.0.2` 的 `/tmp` fixture 分别确认 `.ts` 误写 JSX 为 `TS1161`、多个相邻
  外层标签为 `TS2657`、未闭合标签为 `TS17008`/`TS1005`、标签错配为 `TS17002`、HTML 注释为
  `TS1003`/`TS1382`；临时目录已清理，仓库未保留测试文件。
- **质量命令：** `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit` 与 `npm run test:e2e` 均通过；build 转换 `1764` 个模块，仅有既存的大 chunk 与
  Markdown 插件耗时警告，空测试目录未新增持久测试文件。
- **浏览器：** Playwright 在 `1440x900`、`390x844` 与 `390x844 + 32px` 根字号验证正式深链；B01、
  B02、B03 顺序正确，B01 是唯一上一篇，B03 是唯一下一篇。三种场景均为 `0` 页面横向溢出和 `0` 可见
  文本裁切；刷新期间 `0` console error/warning、`0` page error、`0` 失败请求和 `0` HTTP 4xx/5xx。
  Demo 宿主的两个直接子节点为 `ARTICLE` 与 `ASIDE`，注释未进入文字，entity 与展开的同源源码均正确。
- **审查：** 复杂修改已由独立代理执行 Standards/Spec 审查，结论为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `2/74`，知识课 `2/62`，实战课 `0/12`。唯一下一课为 B03“TSX 表达式与属性”。

### 11.3 B03 执行日志（2026-08-15）

- **目标：** `react.core.learn.basics.tsx-expressions-and-attributes`，最终标题为“TSX 表达式与属性”。
  左侧标题保持短而稳定，不使用课程序号；B01 已同步为“Vite React 项目搭建”，B02 为“TSX 标记语法”。
- **调研与正文：** 独立官方调研冻结花括号 expression、静态与动态 attribute、Boolean 输入值以及
  string、number、Boolean、`null`、`undefined`、function、Symbol 和普通对象 child 的边界。正文只讲
  本课知识点，移出 spread、style、组件、Root、State 和渲染生命周期；删除学习者正文中的固定实现版本和
  验收流程描述。内容覆盖以本科范围和当前公开行为为准，表达直接紧凑，不以行数或字数作为质量指标。
- **B01/B02 复查：** B01 补充 `npm run preview`、`dist/` 本地预览、dev/build/preview 的职责区别、
  端口与启动错误排查；B02 补充 Fragment 完整写法及 `Fragment` 导入要求、JSX 内外注释、entity、
  同行空格和多行源码空白。三课正文均未出现 B01/B02/B03、路线、迁移或前后课计划描述。
- **Demo 与 Manifest：** B03 Demo 只运行安全值，展示动态 `title`、函数调用、数值 `0`、四类空 child
  和三个 Boolean 按钮；运行组件与展开源码来自同一 TSX 文件。entry manifest、demo manifest、Track、
  前置和 related 保持一致，B01→B02→B03 顺序正确；B04 仅保留下一篇导航存在性，未读取正文。
- **临时验证：** TypeScript `7.0.2` 临时 fixture 确认 bigint 正向通过，statement 得到 `TS1109`、
  `TS1381`，字符串 Boolean、function、Symbol 和普通对象分别得到 `TS2322`；临时目录已清理。
- **质量命令：** `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit` 与 `npm run test:e2e` 均通过；build 转换 `1764` 个模块，仅有既存 Markdown 插件
  耗时和大 chunk 警告，未新增持久测试文件。
- **浏览器：** Playwright 验证 B03 正式深链、源码展开同源、动态标题、函数结果、数值 `0`、空 child、
  三个按钮状态和 B02/B04 导航。`1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo
  横向溢出，课程正文无裁切；控制台无 error/warning，网络无失败请求。
- **审查：** 独立 Standards/Spec 审查发现并修正学习者正文中的固定实现、验收流程和生产术语；B02 调研
  中保留的范围审计属于研究记录，不进入学习者正文。修正后已在同一快照复跑质量命令和浏览器验收，
  原审查者复核为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `3/74`，知识课 `3/62`，实战课 `0/12`。下一课为 B04“函数组件”。

### 11.4 B04 执行日志（2026-08-15）

- **目标：** `react.core.learn.basics.function-components`，最终标题为“函数组件”。保留函数定义、大写
  命名、JSX 使用、返回 TSX 与顶层定义；补充函数声明与箭头函数、`null` 返回、组件与辅助函数的职责
  区别；删除纯度、随机值和修改外部变量等内容，纯度由 B12 单独负责；没有合并其他课程。
- **调研与正文：** 独立官方调研核验组件定义、大小写语义、React 调用责任、返回形式和顶层定义要求。
  正文覆盖定义、使用、重复组合、直接调用边界、函数声明与箭头函数、嵌套定义错误、练习与排错，只描述
  本课知识点，不包含批次、计划、迁移或后续课程安排等生产信息。
- **Demo 与 Manifest：** 复用并收窄同源 Demo，展示函数声明组件、箭头函数组件、两个 `LessonNote`
  使用位置、顶层定义和 `return null` 的空输出。稳定 Demo ID 保持不变，运行组件与展开源码来自同一 TSX
  文件；Demo、manifest 和正文可见标题统一为“函数组件”。entry manifest、Track、前置和 related 一致，
  B03、B04、B05 顺序正确，无进度迁移。
- **临时验证：** `/tmp` TypeScript fixture 确认小写自定义 tag 和箭头函数遗漏 `return` 得到预期类型错误，
  `return null` 正常通过；B04 隔离 Vite 构建转换 `17` 个模块。临时资产均已清理，仓库未保留测试文件。
- **质量命令：** `npm run type-check`、`npm run lint`、`npm run test:unit`、`npm run test:e2e` 与
  `npm run build` 均通过，build 转换 `1764` 个模块；B04 聚焦 Prettier 与 `git diff --check` 通过。全仓
  `npm run format:check` 被四个无关并行索引文件阻断：`vite-reference-index.ts`、
  `vue-core-options-reference-index.ts`、`vue-core-reference-index.ts` 与
  `vue-core-sfc-reference-index.ts`，这些文件未被本批次修改或格式化。
- **浏览器：** Playwright 在 `1440x900`、`390x844` 与 `390x844 + 32px` 根字号验证正式深链；两处
  `LessonNote`、`HiddenNotice` 空输出、展开的同源源码及 B03/B05 导航均正确。三种场景文档宽度均等于
  视口宽度，Demo 无裁切或区块重叠；控制台无 error/warning，请求均为 `200` 或 `304`。
- **审查：** 独立 Standards/Spec 首轮发现正文二、三级标题编号和 Demo 可见标题不一致；修正后由原
  审查者复核为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `4/74`，知识课 `4/62`，实战课 `0/12`。下一课为 B05“模块边界与组件树”。

### 11.5 B05 执行日志（2026-08-15）

- **目标：** `react.core.learn.basics.module-boundaries-and-component-tree`，最终标题为“模块边界与组件树”。
  保留组件 import/export、root component、module dependency tree 与 React render tree 主线；补充
  module specifier、定义后导出、具名别名、只读 live binding、三种 root 消歧、真实依赖可能成图和
  DevTools 过滤边界；删除 Root 生命周期、render/commit、Portal、Profiler、Fiber 与 JSX Runtime 展开；
  合并 root 概念与固定 `App.tsx` 命名错误，没有合并其他课程。
- **调研与正文：** 独立官方调研核验 React 文档 `19.2`、React `19.2.8`、MDN 与 ECMAScript 2026。
  正文详细覆盖默认/具名导入导出及错配、一个模块多个组件、非组件模块、root component 与 root
  module、单次 render tree、DOM tree 区别和 10 类高价值易错项；内容只描述本课知识，不包含批次、
  计划、迁移、停止点或后续课程安排等生产信息。
- **Demo 与 Manifest：** 复用现有五模块同源 Demo，入口同时导入具名组件、两个默认组件和非组件数据；
  固定分支让依赖树包含四个 JS/TS 依赖，而当前 render tree 只包含 `CourseHeader` 与
  `PublishedLesson`。冻结点核对确认 Demo 源码、Demo manifest、entry manifest 与 Track 无需修改；
  稳定 ID、B04 前置、B05/B06 顺序和源码 loader 一致，CSS 未使用 `grid` 或 `gap`。
- **临时验证：** `/tmp` TypeScript fixture 确认正确默认/具名导入通过，默认误作具名得到 `TS2614`，
  具名误作默认得到 `TS2613`，重复默认导出得到 `TS2323` / `TS2393`，重写 import binding 得到
  `TS2632`；临时资产已清理，仓库未保留测试文件。
- **质量命令：** `npm run type-check`、`npm run lint`、`npm run test:unit`、`npm run test:e2e` 与
  `npm run build` 均通过，build 转换 `1764` 个模块。B05 聚焦 Prettier 与 `git diff --check` 通过；全仓
  `npm run format:check` 仅被四个无关索引文件阻断：`vite-reference-index.ts`、
  `vue-core-options-reference-index.ts`、`vue-core-reference-index.ts` 与
  `vue-core-sfc-reference-index.ts`，本课未修改或格式化这些文件。
- **浏览器：** Playwright 在 `1440x900`、`390x844` 与 `390x844 + 32px` 根字号验证正式深链、两棵树、
  五模块同源源码、长英文标题换行及 B04/B06 导航；三种场景文档宽度均等于视口宽度，Demo 桌面并排、
  移动端纵向堆叠且无裁切或重叠。固定 ECMAScript 2026 来源后聚焦刷新确认可见适用版本和链接正确；
  控制台无 error/warning，动态请求无失败。
- **审查：** 独立 Standards/Spec 首轮发现 root 易错项重复拆分、root module 限定词和 DevTools 过滤边界
  缺失；修正后由原审查者复核为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `5/74`，知识课 `5/62`，实战课 `0/12`。下一课为 B06“JSX Runtime 与 React
  Element”。

### 11.6 B06 执行日志（2026-08-15）

- **目标：** `react.core.learn.basics.jsx-runtime-and-react-element`，最终标题为“JSX Runtime 与 React
  Element”。保留 TSX transform、automatic runtime、React element、element/node/DOM 消歧与不可变
  主线；补充 `react-jsx`、`react-jsxdev`、classic 配置对照、`jsx/jsxs` 的转换器边界、组件调用边界和
  `key` 与组件 props 的分离；删除私有字段、独立 Ref 展开、完整 ReactNode 联合与后续渲染流程。
- **调研与正文：** 独立官方调研固定 React 文档 `19.2`、React `19.2.8`、
  `@types/react@19.2.8` 与 TypeScript 官方 JSX 资料。正文扩充为 16 个连续编号章节和 6 类高价值易错项，
  只描述本课知识点，不包含批次、计划、任务、前后课、字数或行数等生产信息；frontmatter 中以 `@` 开头
  的来源标题已加引号，YAML 两条真实加载路径均恢复正常。
- **Demo 与 Manifest：** 复用现有同源 Demo，展示 JSX 与 `createElement`、intrinsic type、非
  HTMLElement、开发浅冻结及 element/node 集合边界。冻结点核对确认 Demo TSX/CSS、Demo manifest、
  entry manifest 与 Track 无需修改；B05 前置、related、稳定 Demo ID、B06/B07 顺序和源码 loader 一致，
  CSS 未使用 `grid` 或 `gap`。
- **临时验证：** `/tmp` TypeScript fixture 确认 `react-jsx` 生成 `react/jsx-runtime` 的 `jsx/jsxs`、
  `react-jsxdev` 生成 `react/jsx-dev-runtime` 的 `jsxDEV`、classic 生成 `React.createElement`；development
  运行时确认 element 识别、数字 key 字符串化、`props.key` 不提供业务值以及 element/props 浅冻结。
  临时目录已清理，仓库未保留测试文件。
- **质量命令：** `npm run type-check`、`npm run lint`、`npm run test:unit`、`npm run test:e2e` 与
  `npm run build` 均通过，build 转换 `1764` 个模块。B06 正文与研究记录的聚焦 Prettier、
  `git diff --check` 通过；全仓 `npm run format:check` 仅被四个无关索引文件阻断：
  `vite-reference-index.ts`、`vue-core-options-reference-index.ts`、`vue-core-reference-index.ts` 与
  `vue-core-sfc-reference-index.ts`，本课未修改或格式化这些文件。
- **浏览器：** Playwright 在 `1440x1000`、`390x844` 与 `390x844 + 32px` 根字号验证正式深链、Demo
  实际值、同源源码展开及 B05/B07 导航；三种场景文档宽度均等于视口宽度，无按钮裁切。全新会话中
  console 为 `0 error / 0 warning`，动态请求无失败。
- **审查：** 独立复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `6/74`，知识课 `6/62`，实战课 `0/12`。下一课为 B07“React Root 与页面入口”。

### 11.7 B07 执行日志（2026-08-15）

- **目标：** `react.core.learn.basics.react-root-lifecycle`，最终标题为“React Root 与页面入口”。保留
  DOM 容器、`createRoot`、首次与后续 `render`、Root 复用、容器所有权、`unmount`、旧 Root 失效、
  同容器新 Root 和多个独立 Root；hydration 只保留两行入口选择。删除 Portal、完整 Root options、
  Effect、`flushSync`、reconciliation、commit、State snapshot 与内部容器标记等越界展开。
- **调研与正文：** 独立官方调研固定 React 文档 `19.2`、React DOM `19.2.8`、
  `@types/react-dom@19.2.4`、DOM Standard 与 React DOM 官方测试证据。正文以 14 个连续编号章节详细说明
  本课知识点，把 DOM 查询、Root 创建和首次 render 合并为一个入口示例，把后续 render、重复 Root 与
  多个 Root 合并为一组复用规则；不包含批次、计划、任务、前后课、字数或行数等生产信息。
- **Demo 与 Manifest：** 复用现有五段 Root 生命周期 Demo，标题统一为“React Root 与页面入口示例”；
  删除 `identifierPrefix` 和课程路线注释，稳定 Demo ID、React runtime、同名 TSX source、entry manifest
  与 Track 登记保持一致。Demo CSS 未使用 `grid` 或 `gap`。
- **临时验证：** `/tmp` TypeScript 与运行时 fixture 确认非空容器合同、`createRoot(null)` 拒绝、
  `render` 单参数和 `void` 返回、`unmount` 无参数和 `void` 返回、旧 Root 不可复用及同容器新 Root；
  当前正文还通过正式 `parseContentMarkdown` 单文件解析，临时资产均已清理。
- **质量命令：** 当前快照 `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、B07
  聚焦 Prettier 与 `git diff --check` 通过；此前同课快照的全量 build 通过。最终正文收口后，全量 build
  被并行 Java 文件 `bean-validation-and-input-contracts.md` 的 pitfalls 未知字段“影响版本与来源”阻断；
  B07 单文件解析已通过，未修改该无关文件。
- **浏览器：** Playwright 在隔离的当前快照验证正式深链、14 个章节、短侧栏标题、同源源码和五段
  Demo 流程；390px 与 390px + 32px 根字号下文档宽度等于视口宽度，标题和按钮无裁切。console 为
  `0 error / 0 warning`，页面不含 `identifierPrefix` 或批次编号。
- **审查：** 独立复审首轮发现入口与 Root 复用规则未合并、hydration 收窄不足及参考资料残留内部实现
  措辞；修正后由原审查者复核为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `7/74`，知识课 `7/62`，实战课 `0/12`。下一课为 B08“Props”。

### 11.8 B08 执行日志（2026-08-15）

- **目标：** `react.core.learn.basics.props`，最终标题为“Props”。保留父到子输入、一个 props 对象、
  整体读取与参数解构、JSX 传值、默认值、TypeScript 合同、只读对象与数组、函数 prop 和 spread；
  删除 `children`、`key`、`React.FC`、完整纯度与事件机制、State/更新模型等越界内容。
- **调研与正文：** 独立官方调研固定 React 文档 `19.2`、React `19.2.8`、TypeScript `6.0.3`、
  `@types/react@19.2.18` 与 ECMA-262 证据。正文调整为 15 个连续编号章节，详细覆盖必填、可选、联合、
  对象、只读数组、函数签名以及缺失、`undefined`、`0`、`false`、空字符串和 `null` 的默认值边界；
  不包含批次、计划、任务、前后课、字数或行数等生产信息。
- **Demo 与 Manifest：** 保留静态双卡 Demo，把仅为 `key` 边界服务的 `itemId` 改成业务字段
  `courseCode`；新增不消费字段的 `LessonCardFrame`，由它把完整 Props 合同 spread 给 `LessonCard`。
  第一张显式传值并使用默认 `level`，第二张经薄封装转发并使用显式 `level`；稳定 Demo ID、标题、
  entry manifest 与 Track 登记保持一致，CSS 无需修改且未使用 `grid` 或 `gap`。
- **临时验证：** `/tmp` TypeScript fixture 确认必填、可选联合、对象结构、只读对象与数组、函数签名和
  完整 spread；运行时 fixture 确认缺失与 `undefined` 使用默认值，`0`、`false`、空字符串和 `null`
  不触发默认值。正式 `parseContentMarkdown` 单文件解析通过，临时资产均已清理。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦
  Prettier、`git diff --check` 与全量 `npm run build` 均通过；build 转换 `1764` 个模块。
- **浏览器：** Playwright 验证正式深链、双卡实际值和展开的同源源码；桌面、`390x844` 与
  `390x844 + 32px` 根字号均无横向溢出、卡片裁切、事实列表溢出或重叠。console 为
  `0 error / 0 warning`，展示源码包含 `LessonCardFrame` 与 `courseCode`，不含旧 `itemId`。
- **审查：** 独立复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `8/74`，知识课 `8/62`，实战课 `0/12`。下一课为 B09“children 与组合”。

### 11.9 B09 执行日志（2026-08-15）

- **目标：** `react.core.learn.basics.children-and-composition`，导航与正文标题均为“children 与组合”。
  保留 `children` prop、`ReactNode` / `ReactElement`、单一主要区域、命名 `ReactNode` 区域和 render
  prop；`Children` / `cloneElement` 仅保留非操作性风险边界。
- **调研与正文：** 独立官方调研固定 React 文档 `19.2`、React `19.2.8`、TypeScript `6.0.3` 和
  `@types/react@19.2.18` 证据。正文详细覆盖嵌套 JSX 到 `children` 的数据流、两种类型合同、三种组合
  接口、选择顺序、显式数据流、常见错误和练习，不包含批次、计划、任务、前后课或篇幅等生产叙事。
- **Demo 与 Manifest：** Demo 使用固定外壳、主要 `children`、`eyebrow` / `footer` 命名区域和
  `renderSummary` 展示三种组合接口；删除与主线无关的 facts 区域。稳定 Demo ID、entry manifest、
  demo manifest 与 Track 登记保持一致，Demo 不导入或调用 `Children`、`cloneElement`、
  `isValidElement`，CSS 未使用 `grid` 或 `gap`。
- **临时验证：** `/tmp` TypeScript fixture 验证 `ReactNode`、`ReactElement`、命名区域和 render prop
  的正负类型合同；正式 `parseContentMarkdown` 解析得到 `106` 个内容块、`5` 项目标和 `1` 个练习，
  临时资产均已清理。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦
  Prettier、staged/unstaged `git diff --check` 与全量 `npm run build` 均通过；build 转换 `1764` 个模块。
- **浏览器：** Playwright 验证正式深链、Demo 内容归属和展开的同源源码；`1440x1000`、`390x844`
  与 `390x844 + 32px` 根字号均无页面或 Demo 横向溢出、面板重叠或子元素溢出。console 为
  `0 error / 0 warning`，展示源码包含 `LearningPanel` 与 `renderSummary`，不含 Legacy API 调用。
- **审查：** 独立首轮复审指出三级标题编号、重复 CSS、两处展开过多和 facts 区域问题；修正后由原
  审查者复核为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `9/74`，知识课 `9/62`，实战课 `0/12`。下一课为 B10“条件渲染”。

### 11.10 B10 执行日志（2026-08-15）

- **目标：** `react.core.learn.basics.conditional-rendering`，导航与正文标题均为“条件渲染”。保留
  `if` / `else if`、提前返回、条件变量、三元表达式、`&&`、`null`、ReactNode 可见性和 TypeScript
  收窄；删除通用副作用、纯度、组件身份、状态重置及课程顺序等越界内容。
- **调研与正文：** 独立官方调研固定 React 文档 `19.2`、React `19.2.8`、TypeScript `6.0.3`、
  `@types/react@19.2.18` 与 ECMA-262 证据，形成 `C01-C20` 事实账本。正文整理为 17 个连续编号章节，
  详细覆盖 JavaScript 条件选择 ReactNode、运算符求值、同步空结果、父子可见性职责、重复 JSX 取舍和
  TypeScript 控制流收窄；不包含批次、计划、任务、前后课、篇幅、行数或字数等生产叙事。
- **Demo 与 Manifest：** 保留静态 ready / maintenance 分支、三元、危险 `0 &&`、安全 boolean 比较和
  `return null`，新增 `progressContent` 条件变量观察行；变量改为学习语义 `canContinue`。修正新增行
  导致危险 `0` 强调选择器错位的问题，CSS 使用第三行定位且未使用 `grid` 或 `gap`。稳定 Demo ID、
  entry manifest、demo manifest 与 Track 登记保持一致，运行组件与展开源码来自同一 TSX 文件。
- **临时验证：** `/tmp` TSX fixture 确认 `0 && node` 输出 `0`、显式比较和 `return null` 输出为空，
  判别联合、`typeof` 与提前返回后的收窄通过；正式 `parseContentMarkdown` 解析得到 `111` 个内容块、
  `5` 项目标和 `1` 个练习，临时用例、配置与截图均已清理，仓库未保留测试文件。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦
  Prettier、staged/unstaged `git diff --check` 与全量 `npm run build` 均通过；build 转换 `1764` 个模块，
  只有既存 Markdown 插件耗时与大 chunk 警告。
- **浏览器：** Playwright 验证正式深链、两套完整分支、三元、条件变量、危险 `0`、安全空结果、
  `return null` 和展开的同源源码；`1440x1000`、`390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo
  横向溢出、卡片重叠或标签结果区碰撞。console 为 `0 error / 0 warning`，源码包含 `progressContent` 与
  `canContinue`，不含旧 `isVerified`。
- **审查：** 独立首轮复审指出条件变量段仍残留两处通用纯度教学；收窄为本课的判断、赋值和局部变量
  归属后，由同一审查者复核为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `10/74`，知识课 `10/62`，实战课 `0/12`。下一课为 B11“列表渲染与 key”。

### 11.11 B11 执行日志（2026-08-16）

- **目标：** `react.core.learn.basics.list-rendering-and-key`，导航与正文标题均为“列表渲染与 key”。
  保留 `map`、`filter`、箭头函数返回、稳定 key、兄弟级唯一、插入/删除/重排、索引与随机 key、显式
  Fragment、特殊 prop 和开发警告；删除排序、通用纯度、State、内部协调算法及课程顺序等越界内容。
- **调研与正文：** 独立官方调研固定 React 文档 `19.2`、React / React DOM `19.2.8`、TypeScript
  `6.0.2` 与 ECMAScript / MDN 证据，形成 `C01-C20` 事实账本。正文整理为 15 个连续编号章节，详细覆盖
  数组到 JSX、筛选与映射职责、返回规则、key 身份与来源、组件列表、多节点列表项、常见错误和练习；
  不包含批次、计划、任务、前后课、篇幅、行数或字数等生产叙事。
- **Demo 与 Manifest：** Demo 使用稳定业务 ID 展示已发布课程筛选、组件列表、`A / B / C` 到
  `B / C / A` 的静态重排、索引与随机 key 风险、显式 Fragment 和业务 ID 普通 prop；删除 `.sort()`、
  `data-testid` 及无效 CSS 选择器。稳定 Demo ID、entry manifest、demo manifest 与 Track 登记保持一致，
  运行组件与展开源码来自同一 TSX 文件，CSS 未使用 `grid` 或 `gap`。
- **临时验证：** 正式 `parseContentMarkdown` 解析得到 `99` 个内容块、`5` 项目标、`1` 个练习和
  `1` 个 Demo；SSR 验证筛选、重排、Fragment 和错误 key 静态对照，React warning 为 `0`。临时测试
  资产均已清理，仓库未保留测试文件。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦
  Prettier 与 staged/unstaged `git diff --check` 均通过。当前工作区全量 build 被无关未跟踪 Java 课程的
  Markdown exercise 列表节点阻塞；隔离副本只收窄该外部阻塞后 build 通过并转换 `1766` 个模块。
- **浏览器：** 隔离 build/preview 与修正后的工作区回归均覆盖正式深链、Demo 和展开的同源源码；
  `1440x1000`、`390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo 横向溢出、文本裁切或面板重叠，
  移动端重排面板保持纵向堆叠。console 为 `0 error / 0 warning`，源码不含 `.sort(` 或 `data-testid`。
- **审查：** 独立首轮复审指出性能结论缺少证据、重复 key 来源不完整、内部协调措辞、空数组语义缺失
  以及索引 key 对照不完整；逐项修正后由同一审查者复核为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `11/74`，知识课 `11/62`，实战课 `0/12`。下一课为 BL1“实战：静态课程目录”。

### 11.12 BL1 执行日志（2026-08-16）

- **目标：** `react.core.learn.basics.lab-static-course-catalog`，导航与正文标题均为“实战：静态课程目录”。
  只复用函数组件、模块拆分、Props、children 组合、条件渲染、列表渲染与稳定 key；没有引入 State、事件、
  Effect、Context、Ref 或其他未学 API。
- **调研与正文：** 新增独立调研记录和 16 个连续编号章节，正文详细覆盖需求拆分、静态数据建模、组件边界、
  Props 合同、组合区域、筛选派生、空结果、稳定 key、实现顺序、排错和练习。正文只描述本课内容，不包含
  批次编号、计划、任务、复审、测试或篇幅等生产叙事。
- **Demo 与 Manifest：** 新增五文件同源 Demo，固定 5 门课程，筛选后显示 3 门并标记 1 门推荐课程；
  entry manifest、demo manifest 与 Track 已登记在“列表渲染与 key”之后、“事件处理”之前。运行组件与
  展开源码来自同一组文件，展开源码与磁盘内容逐字一致，CSS 未使用 `grid` 或 `gap`。
- **临时验证：** 正式 `parseContentMarkdown` 解析得到 `77` 个内容块和 `1` 个练习；SSR、固定数据、筛选
  结果、推荐标记、ID 与顺序检查均通过。展开源码共 `9907` 个字符、`10543` 字节，SHA-256 为
  `6f67c1b83b903e9a836bacededf4cc70f62d69d94e15d7de1846088d1b0f0c10`，临时验证资产已清理。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦 Prettier、
  staged/unstaged `git diff --check` 与全量 `npm run build` 均通过；build 只有既存警告。
- **浏览器：** Playwright 验证正式深链、筛选结果、推荐标记和展开的多文件同源源码；`1440x900`、
  `390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo 横向溢出、越界或裁切。console 为
  `0 error / 0 warning`，50 个生产请求全部返回 `200`。
- **审查：** 独立联合复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `12/74`，知识课 `11/62`，实战课 `1/12`。下一课为 B12“组件与 Hook 的纯度”。

### 11.13 B12 执行日志（2026-08-16）

- **目标：** `react.core.learn.basics.component-purity`，导航与正文标题均为“组件与 Hook 的纯度”。完整
  覆盖幂等、render 无副作用、不修改非局部值、只读输入、局部修改和副作用放置边界；不展开 Hook 调用
  规则、State 更新队列、事件传播、Effect 生命周期、性能缓存或 React 内部协调实现。
- **调研与正文：** 独立官方调研固定 React 文档 `19.2`、React `19.2.8`、TypeScript `6.0.3` 与
  ECMAScript 2026 证据。正文整理为 17 个连续编号章节和 `163` 个内容块，详细覆盖 Props、State、
  Context 与 Hook 参数的输入合同、时间和随机值、模块共享值、嵌套引用、局部数组、`readonly` 浅层
  边界、render / 事件处理器 / Effect 的职责选择、排查清单和练习；不包含批次、计划、任务、复审、测试、
  前后课或篇幅等生产叙事。
- **Demo 与 Manifest：** 新增同源 Demo，以同一只读课程数组重复计算两次，分别验证值结果相同、两次
  局部数组引用独立和输入指纹不变，并列出 render 内可做与不可做的工作。稳定 Demo ID、entry manifest、
  demo manifest 与 Track 登记保持一致，顺序位于“实战：静态课程目录”之后、“事件处理”之前；CSS 未
  使用 `grid` 或 `gap`。
- **临时验证：** 正式 `parseContentMarkdown` 解析得到 `163` 个内容块、`6` 项目标、`6` 项小结、
  `1` 个练习和 `1` 个 Demo；SSR 重复输出、三项纯度检查和零 React warning 均通过。展开源码与磁盘
  TSX 的 `trimEnd()` 结果一致，共 `3647` 个字符、`4167` 字节，SHA-256 为
  `f4f9bba1f193370f6d9355e9829ffaea50b548250e3d37ed101ce7dd8228f76b`，临时验证资产已清理。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦 Prettier
  与 staged/unstaged `git diff --check` 均通过。当前工作区全量 build 被无关 Java 课程一级标题与
  frontmatter `title` 不一致阻塞；隔离副本只恢复该文件的 staged 版本后 build 通过并转换 `1784` 个模块，
  只有既存 Markdown 插件耗时与大 chunk 警告。
- **浏览器：** Playwright 验证正式深链、Demo 三项结果、前后导航和展开的同源源码；`1440x900`、
  `390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo 横向溢出、卡片裁切或内容越界。console 为
  `0 error / 0 warning`，44 个生产请求全部返回 `200`。
- **审查：** 独立首轮复审指出学习者正文展开 StrictMode 和 React 浅冻结内部实现，且内部结论缺少
  课程来源；删除完整展开，只保留一句开发诊断提示后，由原审查者复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `13/74`，知识课 `12/62`，实战课 `1/12`。下一课为 B13“事件处理”。

### 11.14 B13 执行日志（2026-08-16）

- **目标：** `react.core.learn.basics.event-handling`，导航与正文标题均为“事件处理”。完整覆盖 handler
  传递、自定义 handler prop、事件对象、`target` 与 `currentTarget`、click 传播阶段、停止传播、阻止默认
  行为和 TypeScript 类型；不展开 State、Hook、Effect、表单提交、性能优化或 React 事件内部实现。
- **调研与正文：** 独立官方调研固定 React 文档 `19.2`、React `19.2.8`、`@types/react 19.2.18`、
  TypeScript `6.0`、DOM 与 HTML Living Standard 证据。正文整理为 18 个连续编号章节和 `141` 个内容块，
  包含 `6` 项目标、`6` 项小结、`19` 个顶层代码块、`7` 组易错项、`1` 个练习和 `1` 个 Demo；不包含
  批次、计划、任务、复审、测试、前后课或篇幅等生产叙事。
- **Demo 与 Manifest：** 将旧的 State 轨迹 Demo 改为无 State、无 Hook 的事件观察 Demo，使用三个交互
  分别展示正常的 capture-target-bubble、停止冒泡和阻止链接默认导航但保留冒泡。稳定 Demo ID、entry
  manifest、demo manifest 与 Track 登记保持一致，顺序位于“组件与 Hook 的纯度”之后、“useState 与
  状态变量”之前；CSS 未使用 `grid` 或 `gap`。
- **临时验证：** 正式 `parseContentMarkdown` 解析得到上述结构；Demo 三种交互、事件阶段、
  `target/currentTarget`、`defaultPrevented` 与地址不变均符合合同。展开源码与磁盘 TSX 的 `trimEnd()`
  结果一致，共 `3637` 个字符、`4211` 字节，SHA-256 为
  `d51c11e181d1a499a9a42743462a0d25830b3620bff513ea6b49fbe451611877`，临时验证资产已清理。
- **质量命令：** B13 主实现快照的 `npm run type-check`、`npm run lint`、空目录 `test:unit`、
  `test:e2e`、聚焦 Prettier、staged/unstaged `git diff --check` 和 production build 均通过，build 转换
  `1784` 个模块。最终注释修正后，正式解析、`npm run type-check`、聚焦 Prettier 与 staged/unstaged
  `git diff --check` 再次通过；当前全量 build 被无关 Java 课程
  `testing-with-junit-and-mocks.md` 的 pitfalls 列表解析错误阻塞。
- **浏览器：** Playwright 验证正式深链、Demo 三种交互、前后导航和展开的同源源码；`1440x900`、
  `390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo 横向溢出、卡片裁切或内容越界。console 为
  `0 error / 0 warning`，534 个请求全部返回 `200`。
- **审查：** 独立首轮复审指出 10 处匿名 handler 未满足紧邻中文职责注释合同；保留必要的包装函数与
  内联推断，为普通 scroll 和内层 capture 抽取命名函数，并删除无关的命令式 DOM 修改后，由原审查者
  复核为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `14/74`，知识课 `13/62`，实战课 `1/12`。下一课为 B14“Hooks 调用规则”。

### 11.15 B14 执行日志（2026-08-16）

- **目标：** `react.core.learn.basics.rules-of-hooks`，导航与正文标题均为“Hooks 调用规则”。完整覆盖
  普通 Hook 的顶层调用、React 函数边界、稳定调用顺序、`rules-of-hooks` lint 的作用与静态检查边界，
  以及 React `use` API 的窄例外；不展开具体 Hook API、State 更新机制、Effect、Suspense 架构、运行时
  依赖排障或 React 内部实现。
- **调研与正文：** 独立官方调研固定 React 文档 `19.2` 与 React / React DOM `19.2.8` 证据，形成
  `14` 条逐 claim 事实。正文整理为 17 个连续编号章节和 `119` 个内容块，包含 `6` 项目标、`6` 项小结、
  `7` 个顶层代码块、`7` 组易错项和 `1` 个练习；不包含批次、计划、任务、复审、测试、前后课或篇幅等
  生产叙事。
- **Demo 与 Manifest：** 本课结论属于静态调用结构和 lint 规则，没有必须通过浏览器交互观察的行为，
  因此使用代码示例而不强行新增 Demo。entry manifest 与 Track 已登记在“事件处理”之后、“useState”
  之前，`useState` 的前置课程同步指向 B14；demo manifest 保持不变。
- **临时验证：** 正式 `parseContentMarkdown` 解析得到上述结构，课程 ID、目标、小结、练习、pitfalls 与
  零 Demo 合同均通过；临时验证资产已清理。调研 SHA-256 为
  `854ef6b45dd3c813602df2ecbcc485e8da90afd467d8e8bf5d1da7c84f047ca2`，正文 SHA-256 为
  `66c4a2341b44319098202413504d0f002b6b0d0e5c57d8325780b2c38789f84b`。
- **质量命令：** 修订后的 `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦
  Prettier、生产叙事关键词检查、staged/unstaged `git diff --check` 与全量 `npm run build` 均通过；
  build 转换 `1786` 个模块，只有既存 Markdown 插件耗时与大 chunk 警告。
- **浏览器：** Playwright 重新加载正式深链，验证标题、正文和“事件处理 / useState”前后导航；
  `1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无横向溢出。console error、失败请求和
  `>=400` 响应均为 `0`。
- **审查：** 独立首轮联合复审指出前文与 pitfalls 重复展示同一批代码、`useRef` 示例越界和运行时依赖
  排障超出冻结范围；将完整错误/修正代码集中到 pitfalls、改用同类 Hook 说明顺序并删除越界排障后，
  由原审查者复核为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `15/74`，知识课 `14/62`，实战课 `1/12`。下一课为 B15“useState”。

### 11.16 B15 执行日志（2026-08-16）

- **目标：** `react.core.learn.basics.use-state`，导航与正文标题均为“useState”。只覆盖公开签名、
  普通初始值与惰性 initializer、setter 基本合同、组件局部 State、多组件副本和 TypeScript 状态域；
  不展开 Hooks 规则、快照、render/commit、批处理、更新队列、对象或数组更新及其它状态方案。
- **调研与正文：** 独立官方调研固定 React 文档 `19.2`、React / React DOM `19.2.8`、
  `@types/react 19.2.18` 与 TypeScript `6.0.3` 证据，形成 `12` 条逐 claim 事实。正文解析得到 `153`
  个内容块、`6` 项目标、`6` 项小结、`37` 个标题、`31` 个顶层代码块、`7` 组易错项、`1` 个练习
  和 `1` 个 Demo；不包含批次、计划、任务、复审、测试、前后课或篇幅等生产叙事。
- **Demo 与 Manifest：** Demo 渲染两个相同组件副本，每个副本分别保存计数、联合类型模式和惰性
  初始化标签；增加使用单次 updater，归零和模式切换使用直接值。稳定 Demo ID、entry manifest、
  demo manifest 与 Track 登记保持一致，运行组件与展开源码来自同一 TSX 文件；CSS 未使用 `grid`
  或 `gap`。
- **临时验证：** 正式 Markdown 解析与 TypeScript 合同检查通过，类型片段覆盖基本推断、字符串联合、
  `null`、`undefined` 和函数 State，临时资产均已清理。展开源码与磁盘 TSX 的 `trimEnd()` 结果一致，
  共 `2784` 个字符、`3238` 字节，SHA-256 为
  `f66df81b38ee3047800714fdf64e1ae383180439f7e53c66fd73d360bda6074d`。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦 Prettier、
  B15 限定 `git diff --check` 与全量 `npm run build` 均通过；全量 format check 和全量 staged diff
  check 仅被既存的 Vue/Vite Reference 索引格式及 Java 尾随空格阻塞。
- **浏览器：** Playwright 验证正式深链、两个组件副本的独立交互、归零、前后导航和展开的同源源码；
  `1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无横向溢出、文本裁切或内容越界。console 为
  `0 error / 0 warning`，`540` 个请求全部返回 `200`。
- **审查：** 独立联合复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `16/74`，知识课 `15/62`，实战课 `1/12`。下一课为 B16“React 更新模型”。

### 11.17 B16 执行日志（2026-08-16）

- **目标：** 保留 `react.core.learn.basics.render-commit-and-state-snapshot`，标题统一为“React 更新
  模型”，吸收退出路线的“State 更新队列”。课程只覆盖 trigger、React render、commit、browser paint、
  render 快照、batching、直接值、updater、混合队列、updater 纯度与必要的边界说明。
- **调研与正文：** 独立官方调研以 React `19.2`、React / React DOM `19.2.8` 为基线，逐项核对两份
  旧调研、两课正文和两个 Demo。正文解析得到 `168` 个内容块、`7` 项目标、`8` 项小结、`50` 个标题、
  `20` 个顶层代码块、`7` 组易错项、`1` 个练习和 `1` 个 Demo；正文不包含路线编号、计划、批次、
  测试、构建、复审、前后课或篇幅等生产叙事。
- **Demo 与 Manifest：** 保留目标 Demo ID，使用 `label` / `step` Props、数字 State 与派生
  `nextCount` 同时展示 Props、State 和 handler 的 render 快照；从 `0` 依次验证单次请求 `1`、三次
  直接值 `1`、三个 updater `3`、替换后更新 `6`、最后替换 `42` 和重置 `0`。旧课程正文、旧 Demo
  目录及 manifest / Track 入口退出，六处仍引用旧前置 ID 的已发布课程改为保留目标 ID；CSS 未使用
  `grid` 或 `gap`。
- **进度迁移：** 进度 schema 升为 v2，增加 `legacyCompletedEntryIds`、
  `appliedEntryMigrationIds`、通用 `EntryProgressMigration` 与 `applyEntryMigrations`；React 模块只声明
  本课迁移组，并在应用挂载前执行。两门旧课全部完成时新目标自动完成；部分完成保留历史来源且不计入
  当前完成数；旧最近访问映射到新目标；重复读取和应用幂等；手动完成新目标后清除对应历史来源。
- **临时验证：** 正式 Markdown 解析通过；五个一次性迁移用例覆盖完整合并、部分合并、最近访问、
  幂等与历史来源清除，全部通过。仓库符号链接、`/tmp` 测试目录、基线和浏览器截图均在闭环后清理，
  未新增持久测试或 fixture。
- **质量命令：** 修订后的 `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、
  聚焦 Prettier、B16 限定 staged / unstaged `git diff --check` 与全量 `npm run build` 均通过；build
  转换 `1783` 个模块，仅有既存 Markdown 插件耗时与大 chunk 警告。
- **浏览器：** Playwright 验证正式深链、正文与桌面/抽屉学习路径标题均为“React 更新模型”；旧
  `state-update-queue` URL 不重定向并显示内容不存在。`1440x900`、`390x844` 与
  `390x844 + 32px` 根字号均无页面横向溢出、Demo 文本裁切或按钮重叠；console error / warning、
  page error、失败请求和 `>=400` 响应均为 `0`。两条日志在 setter 前后都保持 `label`、`step=1`、
  `count=0` 与 `nextCount=1`；展开源码与磁盘 TSX 均为 `4283` 字符、`5021` 字节，SHA-256 为
  `9ce4b00137488ea93b7b0b5f03c8c555fab5544a928313b3da43878671c43599`。
- **审查：** 独立联合复审首轮指出 Demo 丢失冻结的 `label` / `step` Props 合同和临时资产待清理；
  修正并回归后由原审查者复核为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `17/74`，知识课 `16/62`，实战课 `1/12`。下一课为 B17“State 的不可变更新”。

### 11.18 B17 执行日志（2026-08-16）

- **目标：** 新建 `react.core.learn.basics.immutable-state-updates`，标题为“State 的不可变更新”，吸收并
  退出“更新对象 State”与“更新数组 State”。课程统一覆盖对象和数组的只读快照、浅复制、嵌套路径
  复制、结构共享、增删改插入、排序与反转，不引入深克隆库或状态管理库。
- **调研与正文：** 独立调研以 React `19.2`、React / React DOM `19.2.8`、ECMAScript 2026 与 MDN
  资料为依据，核对两个旧知识点及 Demo 后形成合并合同。正文详细覆盖对象与数组更新的完整决策规则、
  TypeScript 边界、现代 copying methods、常见错误、排查方法和练习；只描述本课知识，不包含路线编号、
  计划、批次、复审、测试、前后课或篇幅等生产叙事。
- **Demo 与 Manifest：** 新增一个同源 Demo，以同一 `BoardState` 展示顶层与嵌套对象展开、数组追加与
  插入、`map`、`filter`、`toSorted` 以及复制后 `reverse`。新 entry、Demo 与 Track 登记保持一致；两个
  旧课程和旧 Demo 从运行路线退出，旧 URL 不重定向，CSS 未使用 `grid` 或 `gap`。
- **进度迁移：** 新增 B17 迁移组；两个旧课程都完成时自动完成新目标，部分完成时保留历史来源，旧
  `recentEntryId` 映射到新目标，重复应用保持幂等，手动完成新目标后清除对应历史来源。
- **临时验证：** 正式 Markdown 结构检查和固定 Demo 行为检查通过；完整迁移、部分迁移、最近访问、幂等
  与历史来源清除均已验证。展开源码与运行源码同源，共 `7498` 个字符、`8354` 字节，SHA-256 为
  `9623fc87d8594f1f5ee80c17535bde7fe6d73f083a4ed39c46d6660abfc7db82`，临时资产均在闭环后清理。
- **质量命令：** 修订后的 `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦
  Prettier、B17 限定 staged / unstaged `git diff --check` 与全量 `npm run build` 均通过；build 转换
  `1777` 个模块，只有既存 Markdown 插件耗时与大 chunk 警告。
- **浏览器：** Playwright 验证正式深链、两个旧 URL、全部固定交互与展开的同源源码；`1440x900`、
  `390x844` 与 `390x844 + 32px` 根字号均无横向溢出、文本裁切、按钮越界或内容重叠。console error /
  warning、page error、失败请求和 `>=400` 响应均为 `0`。
- **审查：** 独立联合复审首轮指出调研验收合同仍把排序写成新副本上的 `sort`，与真实 Demo 的
  `toSorted` 不一致；修正后由原审查者复核为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `18/74`，知识课 `17/62`，实战课 `1/12`。下一课为 BL2“实战：任务清单编辑器”。

### 11.19 BL2 执行日志（2026-08-16）

- **目标：** 新建 `react.core.learn.basics.lab-task-editor`，标题为“实战：任务清单编辑器”。只组合已经
  学过的事件处理、`useState`、React 更新模型和 State 不可变更新，完成纯客户端、内存内的任务清单；
  不引入 Reducer、Context、Effect、Ref、持久化、网络请求、拖拽或第三方库。
- **调研与正文：** 独立官方调研以 React 文档 `19.2`、React / React DOM `19.2.8`、TypeScript 与
  ECMAScript 规范为依据，固定受控文本、State 快照、updater、对象与数组不可变更新、稳定 key、最小
  State 和单一所有者合同。正文详细覆盖数据建模、六份必要 State、派生筛选与统计、组件职责、添加、
  切换、编辑、删除、清除、重置、错误示例、边界和练习，只描述本课内容，不包含路线编号或生产叙事。
- **Demo 与 Manifest：** 新增五个同源运行文件，覆盖三条固定初始任务、空白校验、稳定 ID、行内编辑、
  三种筛选、派生统计、清除已完成和完整重置；编辑态与阅读态都以可见文字表达完成状态。entry manifest、
  demo manifest 与 Track 登记一致，顺序位于“State 的不可变更新”之后、“DOM Props”之前；CSS 未使用
  `grid` 或 `gap`。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦 Prettier、
  BL2 限定 staged / unstaged `git diff --check` 与全量 `npm run build` 均通过；build 转换 `1791` 个模块，
  只有既存 Markdown 插件耗时与大 chunk 警告。全量 format check 仅被四个无关既有文件阻塞。
- **浏览器：** Playwright 从固定初始状态完整执行步骤 `0-11`，验证空白输入、添加、切换、取消、保存、
  筛选、删除、清除、空结果、重置和下一 ID；`1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无
  页面或 Demo 横向溢出、控件裁切或按钮重叠。console error / warning、page error、失败请求、`>=400`
  响应和业务 fetch / XHR 均为 `0`。展开源码与磁盘五文件均为 `18462` 个字符、`19432` 字节，
  SHA-256 为 `f017441d272fa42de46ac4217612c113c2fc198f7b4c1928ce816e616344cc1d`。
- **审查：** 独立联合复审首轮指出编辑态完成状态只靠颜色、运行示例缺少固定 12 步中间结果及前置课程
  不完整；补齐可见状态文字、步骤 `0-11` 和四项前置后，由原审查者复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `19/74`，知识课 `17/62`，实战课 `2/12`。下一课为 B18“DOM Props”。

### 11.20 B18 执行日志（2026-08-16）

- **目标：** 复用并收窄 `react.core.learn.basics.dom-props`，标题保持“DOM Props”。课程覆盖内置 HTML
  元素的 React prop、DOM property 与 HTML attribute 区别，以及命名、值语义、`style`、`data-*`、
  `aria-*` 和 props 透传；不展开表单、Ref、hydration、原始 HTML 注入或自定义元素接入。
- **调研与正文：** 研究记录以 React `19.2`、React / React DOM `19.2.8`、TypeScript JSX、HTML、ARIA
  与 CSS 官方资料为依据。正文以十四个连续根级标题详细说明平台合同、易错点、判断顺序和练习，只描述
  本课知识，不包含路线编号、计划、批次、复审、测试、前后课或篇幅等生产叙事。
- **Demo 与 Manifest：** 复用同源 Demo，覆盖 `className`、`htmlFor`、`tabIndex`、`disabled`、`hidden`、
  `aria-disabled`、`data-*`、数值样式和 props 过滤；`ready` / `paused` 及详情显隐均可交互观察。entry
  manifest、demo manifest 与 Track 的现有登记一致，私有 `state` 在透传前消费，CSS 未使用 `grid` 或
  `gap`。
- **临时验证：** 两条一次性反馈环分别确认：HTML 将 `hidden` 归为枚举 attribute，而 React 19.2 prop
  只接受 boolean；React DOM 运行时允许确认过的小写自定义 attribute，但当前 JSX 静态合同不接受未声明的
  合法标识符名称。修正后两条反馈环均转绿，未新增持久测试或 fixture。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦 Prettier、
  B18 限定 staged / unstaged `git diff --check` 与全量 `npm run build` 均通过；build 转换 `1791` 个模块，
  只有既存 Markdown 插件耗时与大 chunk 警告。全量 format check 仅被四个无关既有索引文件阻塞。
- **浏览器：** Playwright 验证正式深链、新旧示例边界、十四个连续正文标题及 Demo 全部交互；
  `1440x900` 与 `390x844` 均无横向溢出。`ready` / `paused`、`hidden`、`tabIndex`、`aria-disabled` 与样式
  结果符合正文，私有 `state` 未泄漏，console error / warning 均为 `0`。展开源码与磁盘同源，共 `7659`
  个字符、`8053` 字节，SHA-256 为 `6b75f5627470a37d6f82c6d282a5fb9877c8d99656324099fdf00b45536673c3`。
- **审查：** 独立联合复审先后指出 `hidden="until-found"` 与 React 19.2 boolean prop 合同冲突，以及未声明
  小写自定义 attribute 的正确示例无法通过当前 TSX 类型检查；修正并回归后由原审查者复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `20/74`，知识课 `18/62`，实战课 `2/12`。下一课为 B19“useId 与可访问关联”。

### 11.21 B19 执行日志（2026-08-16）

- **目标：** 新建 `react.core.learn.basics.use-id-accessible-links`，标题为“useId 与可访问关联”。课程覆盖
  唯一 ID 前缀、`label` 与描述关联、多实例、SSR 和多 root 前缀边界，明确不把 `useId` 用作列表 key、
  业务主键或持久标识；不展开表单状态、完整表单提交、复杂 ARIA widget 或服务端组件架构。
- **调研与正文：** 独立官方调研以 React `19.2`、React / React DOM `19.2.8`、WHATWG HTML、
  WAI-ARIA `1.2` 与 WCAG `2.2` 技术文档为依据。正文通过十四个连续根级章节详细说明 Hook 规则、
  ID 派生、名称与描述引用、条件描述、多实例、hydration 和 `identifierPrefix`，内容限本科范围并直述
  本课知识，不包含路线编号、计划、批次、构建、复审、篇幅或前后课等生产叙事。
- **Demo 与 Manifest：** 新增双字段同源 Demo，两个实例分别派生输入、帮助和错误 ID；错误状态切换时，
  节点与 `aria-describedby` 引用同步增删，输入 ID 保持不变。entry manifest、demo manifest 与 Track
  登记一致，源码展示合并 TSX 与 CSS，样式未使用 `grid` 或 `gap`。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦 Prettier、
  B19 限定 staged / unstaged `git diff --check` 与全量 `npm run build` 均通过；build 转换 `1797` 个模块，
  只有既存 Markdown 插件耗时与大 chunk 警告。全量 format check 仍只被四个无关既有索引文件阻塞。
- **浏览器：** Playwright 验证正式深链、两个字段实例、label 与输入闭合关联，以及错误描述的显示、隐藏
  和空格分隔组合；`1440x900`、`390x844` 与 `390px + 200%` 字号均无横向溢出。console error /
  warning 均为 `0`。展开源码与磁盘同源，共 `6413` 个字符、`6841` 字节，SHA-256 为
  `5017168ca354b5b9d0c5bf07aab1c54e5a25b6b827a5955fc1eaf064a90c953c`。
- **审查：** 独立联合复审首轮指出正文多实例片段的 Props 声明与调用不一致；补齐 `label`、`help`、
  `error` 和 `hasError` 的完整合同后，由原审查者复核为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `21/74`，知识课 `19/62`，实战课 `2/12`。下一课为 B20“React 表单”。

### 11.22 B20 执行日志（2026-08-16）

- **目标：** 新建 `react.core.learn.basics.react-forms`，标题为“React 表单”，吸收并退出“受控表单”与
  “表单提交与默认行为”。课程统一覆盖受控与非受控字段、原生控件值、form 提交、`FormData` entry、
  TypeScript 事件类型和基础无障碍，不展开远程请求、复杂校验、文件上传或表单 Action。
- **调研与正文：** 独立官方调研以 React 文档 `19.2`、React / React DOM `19.2.8`、
  `@types/react 19.2.18`、TypeScript `6.0.3`、WHATWG HTML / DOM / XHR 与 WAI-ARIA `1.2` 为依据。
  正文通过十七个连续根级章节详细说明控件当前值、提交投影、各类原生控件、字段语义、事件、按钮、
  FormData、类型、九组完整易错项、源码推导、五项练习和参考资料；只描述本课知识，不包含路线编号、
  计划、批次、迁移、构建、测试、复审、篇幅或前后课等生产叙事。
- **Demo 与 Manifest：** 新增单一“课程报名偏好表单”同源 Demo，覆盖受控文本、checkbox、radio、
  select、textarea，非受控默认值、同名多值、required、disabled、普通按钮、提交按钮、submitter 与
  FormData 读取。entry manifest、demo manifest 与 Track 登记一致；两个旧正文、旧 Demo 及其入口退出，
  CSS 未使用 `grid` 或 `gap`。
- **进度迁移：** 新增 B20 迁移组；两个旧课程都完成时自动完成新目标，部分完成时保留历史来源，旧
  `recentEntryId` 映射到新目标，重复应用保持幂等，手动完成新目标后清除对应历史来源；四项迁移反馈环
  全部通过，临时资产已清理。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、聚焦 Prettier、
  B20 限定空白检查与全量 `npm run build` 均通过；最终 build 转换 `1791` 个模块，只有既存 Markdown
  插件耗时与大 chunk 警告。
- **浏览器：** Playwright 验证正式深链、两个旧 URL、受控与非受控字段、FormData 多值、disabled
  排除、submitter 和展开的同源源码；`1440x900`、`390x844` 与 `390px + 200%` 字号均无页面级横向
  溢出。最终页面渲染九组易错项、“源码推导与适用场景”、五项练习和参考资料，console 为
  `0 error / 0 warning`，`43` 个最终静态请求全部返回 `200`。
- **审查：** 独立首轮联合复审指出易错项未使用完整 `pitfalls` 结构、缺少源码推导和参考资料、练习
  标题未按数字编号；逐项修正并回归后，由原审查者复核为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `22/74`，知识课 `20/62`，实战课 `2/12`。下一课为 B21“State 所有权”。

### 11.23 B21 执行日志（2026-08-16）

- **目标：** 复用并收窄 `react.core.learn.basics.state-ownership-and-thinking-in-react`，导航与正文标题
  均为“State 所有权”。课程只讲最小但完整的 State、所有者、每份 State 的单一事实来源、单向数据流
  和 Thinking in React 分析过程，不展开状态结构、受控边界、Context、Store、Effect 或性能缓存。
- **调研与正文：** 独立官方调研以 React 文档 `19.2`、React `19.2.8` 与 TypeScript `6.0.3` 为依据，
  形成 `C01-C18` 事实账本和保留、删除、移动、补充合同。正文整理为 14 个连续根级章节，详细覆盖数据
  模型与组件树、静态 Props 流、三个 State 排除问题、全部消费者与最近共同父组件、所有者位置、单一
  事实来源、显式更新请求、五个完整易错项和三项练习；只描述本课知识，不包含路线编号、计划、批次、
  迁移、构建、测试、复审、篇幅或前后课等生产叙事。
- **Demo 与 Manifest：** 商品筛选 Demo 删除价格编辑、商品 State、总价、重置和表单提交，只保留固定
  `products`、`query`、`onlyInStock`、render 派生列表与匹配数量。运行组件与展开源码同时登记真实 TSX
  和 CSS，entry manifest、demo manifest 与 Track 保持一致；CSS 未使用 `grid` 或 `gap`。
- **质量命令：** 最终快照的 `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、
  聚焦 Prettier、B21 限定 `git diff --check` 与全量 `npm run build` 均通过；build 转换 `1791` 个模块，
  只有既存 Markdown 插件耗时与大 chunk 警告。全仓 `format:check` 仍只被四个无关既有 Vite/Vue
  Reference 索引文件阻断。
- **浏览器：** Playwright 验证正式深链、搜索“香蕉”、只看有货空结果、清空筛选恢复四条商品和展开的
  TSX/CSS 同源源码；`1440px`、`390px` 与 `390px + 200%` 字号均无页面级横向溢出，标题在放大文本下
  正确换行。console 为 `0 error / 0 warning`，`538` 个静态请求全部返回 `200`。
- **审查：** 独立联合复审先后指出虚假前置、单次通用包装组件、前后元数据学习目标超过六项及正文目标
  未同步合并；逐项移除或合并并完成定向回归后，由原审查者最终确认
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `23/74`，知识课 `21/62`，实战课 `2/12`。下一课为 BL3“实战：课程报名”。

### 11.24 BL3 执行日志（2026-08-16）

- **目标：** 新建 `react.core.learn.basics.lab-course-registration`，导航与正文标题均为“实战：课程报名”。
  课程只组合已学的 DOM Props、`useId`、原生表单、列表筛选和 State 所有权，完成纯客户端课程报名应用；
  不引入 Reducer、Context、Ref、Effect、远程请求、持久化或第三方表单库。
- **调研与正文：** 独立调研以 React `19.2`、React / React DOM `19.2.8`、`@types/react 19.2.18`、
  TypeScript、WHATWG HTML / XHR 与 WAI-ARIA `1.2` 为依据。正文通过二十七个连续根级章节详细覆盖固定
  数据合同、组件职责、最小 State、派生筛选、业务身份、受控控件、原生约束、`FormData`、提交快照、
  易错项、排查、边界和练习；只描述本课知识，不包含路线编号、计划、批次、构建、测试、复审、篇幅或
  前后课等生产叙事。
- **Demo 与 Manifest：** 新增六个同源运行文件，覆盖五门固定课程、名称与分类筛选、只看可报名、已满
  课程禁用、课程单选、姓名、邮箱、原生校验和最后提交快照。entry manifest、demo manifest 与 Track
  登记一致，顺序位于“State 所有权”之后、“State 结构”之前；展开源码包含全部六个真实文件，CSS 未
  使用 `grid` 或 `gap`。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 与全量
  `npm run build` 均通过，build 转换 `1805` 个模块；BL3 聚焦 Prettier 与限定 `git diff --check`
  通过。全仓 `format:check` 仍只被四个无关既有 Vite / Vue Reference 索引文件阻断。
- **浏览器：** Playwright 验证正式深链、后端与可报名筛选、disabled 课程、`java-web` 选择、无效邮箱、
  三项 `FormData`、历史快照、筛选清空选择、空结果禁用提交和六文件源码；`1440x1000`、`390x844` 与
  `390x844 + 32px` 根字号均为 `0` 页面横向溢出、`0` Demo 溢出、`0` 控件越界和 `0` 隐藏裁切。
  console error / warning、page error、失败请求和 `>=400` 响应均为 `0`。
- **审查：** 独立联合复审首轮指出固定操作序列漏写取消“只看可报名”，以及文件职责段残留“行数”生产
  叙事；补齐操作并删除无关措辞后，由原审查者复核为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `24/74`，知识课 `21/62`，实战课 `3/12`。基础阶段 `24/24` 完成，下一课为
  I01“State 结构”。

### 11.25 I01 执行日志（2026-08-16）

- **目标：** 保留 `react.core.learn.intermediate.state-structure`，导航与正文标题统一为“State 结构”；吸收
  旧“派生值”课程，旧条目与 Demo 退出 entry/demo manifest 和 Track。内容限定在最小 State、结构约束、
  同步纯派生、ID 与对象引用、扁平化和 State 不变量，不提前教学 `useMemo`、缓存或性能测量。
- **调研与正文：** 独立研究以 React `19.2`、React / React DOM `19.2.8`、TypeScript `6.0.3` 与
  `@types/react 19.2.18` 为基线。正文详细覆盖相关 State 的合并与拆分、互斥状态、判别联合、冗余和重复
  数据、Props 镜像、稳定 ID、`key` 边界、引用完整性、深层结构和同步派生链；表述直接且保持本科范围。
- **Demo 与 Manifest：** 工单编辑器只保存草稿、分类 ID 和提交阶段三份源 State；分类对象、规范化输入、
  字符数、完成度和预览均在 render 中直接派生。entry/demo manifest 与 Track 顺序一致，展开源码同时包含
  真实 TSX 和 CSS，样式未使用 `grid` 或 `gap`。
- **进度迁移：** 登记 `state-structure + derived-values -> state-structure`，启动时在 Pinia 安装后应用。
  `/tmp` 临时 Vitest 用例 `4/4` 通过，覆盖完整与部分历史、最近访问、其他课程隔离、手动完成清理和重复
  应用幂等；临时资产已删除。
- **正文复查：** 已扫描 B01-BL3 与 I01 的课程正文和短标题，未发现路线编号、计划、批次、完成计数、复审
  或篇幅叙事；命中的构建、验证和进度均属于对应课程的技术知识或示例语义。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 与全量
  `npm run build` 均通过；I01 聚焦 Prettier 与限定 `git diff --check` 通过。全仓 `format:check` 仍只被
  四个无关既有 Vite / Vue Reference 索引文件阻断。
- **浏览器：** Playwright 验证无效提交、有效提交、分类切换、派生完成度与预览、重置和 TSX/CSS 同源源码；
  桌面、`390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo 横向溢出。console error / warning、page
  error、失败请求和 `>=400` 响应均为 `0`。
- **审查：** 独立联合复审为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `25/74`，知识课 `22/62`，实战课 `3/12`。下一课为 I02“State 提升”。

### 11.26 I02 执行日志（2026-08-16）

- **目标：** 保留 `react.core.learn.intermediate.lifting-state-up`，导航与正文标题统一为“State 提升”；吸收
  旧“受控与非受控组件”课程，旧条目与 Demo 退出 entry/demo manifest 和 Track。内容限定在最近共同
  所有者、单一事实来源、值与回调 Props、受控与非受控合同，不提前教学 State 的位置身份或 key 重置。
- **调研与正文：** 独立研究以 React `19.2` 官方文档和 TypeScript 官方合同为依据。正文详细覆盖共享事实
  判断、提升步骤、父子职责、稳定 ID、重复 State 与派生值、提升边界、`value + onValueChange`、
  `defaultValue`、判别联合、空字符串、`undefined`、`null` 和模式稳定性；目标与错误合同保持精炼、完整。
- **Demo 与 Manifest：** 两个输入共享一份父级 State；受控字段可由调用方载入和清空，非受控字段显示内部
  State 与父级当前传入的 `defaultValue`，可直接观察默认值变化不会覆盖已有编辑。展开源码同时包含真实
  TSX 和 CSS；源码 bundle 使用统一 loader，样式未使用 `grid` 或 `gap`。
- **进度迁移：** 登记 `lifting-state-up + controlled-and-uncontrolled-components -> lifting-state-up`。浏览器
  验证两门旧课都完成时合并课保持完成并迁移最近访问；只完成一门时不误标完成，旧记录进入 legacy；验证
  使用的 localStorage 状态已清理。
- **正文复查：** I02 正文只描述本课知识，未保留路线编号、计划、批次、完成计数、复审、篇幅、宿主实现或
  前后课生产叙事；B01-BL3 与 I01 的同类检查结论继续有效。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 与完整
  `npm run build` 均通过；I02 聚焦 Prettier 与限定 `git diff --check` 通过。构建反馈曾发现 pitfalls 字段名
  不符合解析合同，修正后同一完整构建转绿。
- **浏览器：** Playwright 验证共享输入、受控外部载入与空字符串、非受控编辑和 `defaultValue` 更新、
  TSX/CSS 同源源码；`1280x720`、`390x844` 与 `390x844 + 32px` 根字号均无页面横向溢出或控件裁切，
  console error / warning 均为 `0`。
- **审查：** 独立联合复审首轮指出标题编号、重复错误合同、Demo 结果可读性、目标数量、宿主生产叙事和
  loader 重复；修正后补齐一个遗漏的三级标题编号，最终复核为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `26/74`，知识课 `23/62`，实战课 `3/12`。下一课为 I03“State 保留与重置”。

### 11.27 I03 执行日志（2026-08-16）

- **目标：** 新建 `react.core.learn.intermediate.state-preservation-and-reset`，导航与正文标题统一为
  “State 保留与重置”；吸收旧“位置身份”和“使用 key 重置”课程，两门旧课及其 Demo 退出
  entry/demo manifest 和 Track。内容限定在组件类型、父级位置、key 与子树重建，不展开路由缓存、
  外部 Store、持久化或隐藏树恢复。
- **调研与正文：** 独立研究以 React `19.2` 官方文档为依据。正文详细覆盖默认身份、Props 与条件分支、
  并列实例、条件移除、类型和祖先变化、嵌套组件定义、key 作用域与稳定性、DOM 重建边界、保留/重置/
  局部更新选择、排查步骤、源码推导与适用场景；学习目标收敛为 6 项，三项练习均提供明确要求和验收。
- **Demo 与 Manifest：** 四个观察区分别展示同位置保留、并列隔离与移除重建、祖先类型变化和无 key/
  稳定 key 对照。entry/demo manifest 与 Track 顺序一致，展开源码同时包含真实 TSX 和 CSS；样式未使用
  `grid` 或 `gap`，左侧标题保持“State 保留与重置”。
- **进度迁移：** 登记 `state-identity-by-position + resetting-state-with-key -> state-preservation-and-reset`。
  `/tmp` 临时验证 `3/3` 通过，覆盖完整与部分历史、最近访问、其他课程隔离和重复应用幂等；临时资产已
  删除。
- **正文复查：** B01-BL3 与 I01-I03 的课程正文和左侧标题均已检查；课程只描述各自知识点，不含路线
  编号、计划、批次、完成计数、复审、篇幅限制或其他生产叙事，标题均使用简短知识点名称。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 与完整
  `npm run build` 均通过；I03 聚焦 Prettier 和 diff 检查通过。构建反馈曾发现 exercise 内列表不符合解析
  合同，改为受控字段后同一完整构建转绿并转换 `1789` 个模块。
- **浏览器：** Playwright 验证同位置分数保留、并列 State 隔离、移除后重建、祖先变化清空草稿、无 key
  保留和稳定 key 重置，以及 TSX/CSS 同源源码；45 个请求均为 `200`，console error / warning 均为 `0`。
  `1280x720`、`390x844` 与 `390x844 + 32px` 根字号均无页面横向溢出或 Demo 控件越界。
- **审查：** 独立联合复审首轮指出缺少强制推导章节、练习 directive 与验收、目标数量超限；补齐后继续
  修正 directive 内标题编号，最终复核为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `27/74`，知识课 `24/62`，实战课 `3/12`。下一课为 IL1“实战：多步骤编辑器”。

### 11.28 IL1 执行日志（2026-08-16）

- **目标：** 新建 `react.core.learn.intermediate.lab-multi-step-editor`，导航与正文标题统一为
  “实战：多步骤编辑器”。课程只组合已完成的 State 结构、同步派生、State 提升、受控边界、保留与
  key 重置，完成固定三步的纯客户端文章编辑器。
- **调研与正文：** 独立研究以 React `19.2` 官方文档、React DOM 受控字段合同和 TypeScript 判别联合
  规则为依据。正文通过三十二个连续根级章节详细覆盖固定数据、会话身份、统一草稿、判别联合视图、
  步骤能力、受控字段、不可变更新、步骤往返、同步复核、完成视图、局部更新与完整重载；内容限定在
  本科范围，表述直接，不包含路线编号、计划、批次、构建、测试、复审或篇幅等生产叙事。
- **Demo 与 Manifest：** 新增五个同源运行文件，覆盖空白与预填模板、空白校验、三步导航、跨步骤字段
  保留、复核同步、完成后继续修改、模板切换和明确重新加载。外层会话的模板 ID 与重载版本共同组成
  工作区 key；entry/demo manifest 与 Track 登记一致，顺序位于“State 保留与重置”之后、`useReducer`
  之前；样式未使用 `grid` 或 `gap`。
- **质量命令：** 最终快照的 `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、
  IL1 聚焦 Prettier、禁用 API 与叙事词扫描、`git diff --check` 和完整 `npm run build` 均通过；build
  转换 `1801` 个模块。全仓 `format:check` 仍只被四个无关既有 Vite / Vue Reference 索引文件阻断。
- **浏览器：** Playwright 完整验证空白模板锁定、空格标题、有效基本信息、发布信息、步骤往返、复核
  同步、完成后继续修改、当前模板重载、模板切换与切回固定初值；`1440x900`、`390x844` 与
  `390x844 + 32px` 根字号均无页面或 Demo 横向溢出、裁切和重叠。console error / warning、page error、
  失败请求和 `>=400` 响应均为 `0`，`45` 个生产静态请求全部返回 `200`。
- **审查：** 独立联合复审先后指出正文点名后续主题、key 示例漏掉同模板重载版本和残留服务端措辞；
  逐项改为本课正向合同并复跑完整构建后，由原审查者最终确认 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `28/74`，知识课 `24/62`，实战课 `4/12`。下一课为 I04“useReducer 与 Action”。

### 11.29 I04 执行日志（2026-08-16）

- **目标与合并：** 保留 `react.core.learn.intermediate.use-reducer`，吸收 Action 设计和 Reducer 纯度，
  导航与正文标题统一为“useReducer 与 Action”；旧 `action-design`、`reducer-purity` 正文和 Demo 退出
  manifest，旧 URL 保持原路径并按现有规则显示内容不存在，不建立重定向。
- **调研与正文：** 独立调研以 React `19.2` 官方文档、React `v19.2.8` 固定源码和 TypeScript
  判别联合规则为依据。正文在本科范围内详细覆盖 State、Action、reducer、dispatch、完整 State 返回、
  事件式 Action、最小载荷、判别联合、穷尽检查、不可变更新、纯度、副作用边界、初始化函数、render
  快照及 `useState` / `useReducer` 选择；表述直接，不包含计划编号、批次、迁移、构建、测试、复审或篇幅
  等生产叙事。
- **Demo 与 Manifest：** 将三个旧 Demo 合并为同源任务看板，覆盖添加、切换、删除、筛选、清空后新增、
  恢复初值、Action 日志、dispatch 快照、初始化参数和纯度重放；源码区同时展示实际运行的 TSX 与 CSS。
  entry/demo manifest、Track、前置、related 和下游引用已同步，样式未使用 `grid` 或 `gap`。
- **进度迁移：** `use-reducer`、`action-design`、`reducer-purity` 三个来源统一迁移到目标 ID；临时资产
  覆盖完整与部分旧进度、历史来源保留/清除、最近访问迁移、其他课程隔离和重复应用幂等，迁移检查
  `4/4` 通过。
- **质量命令：** 最终快照的 `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、
  聚焦 Prettier、`git diff --check`、reducer 合同 `4/4`、判别联合负向类型验证和完整
  `npm run build` 均通过；最终 build 转换 `1789` 个模块。全仓 `format:check` 仍只被四个无关既有 Vite /
  Vue Reference 索引文件阻断。
- **浏览器：** Playwright 验证正式深链、全部看板交互、空状态、清空后编号延续、重置、纯度、快照和
  TSX/CSS 同源展示；`1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无页面级横向溢出、裁切
  或控件重叠。console error / warning、page error、失败请求和 `>=400` 响应均为 `0`，`45` 个生产静态
  请求全部返回 `200`；两个旧 URL 均未跳转到目标课程。
- **审查：** 独立联合复审先发现下游 `related` 在两个旧 ID 合并后重复引用目标 ID；删除重复项并复跑
  聚焦格式、diff 检查和完整 build 后，由同一复审者确认 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `29/74`，知识课 `25/62`，实战课 `4/12`。下一课为 I05“Context 创建、提供与读取”。

### 11.30 I05 执行日志（2026-08-16）

- **目标与合并：** 新建 `react.core.learn.intermediate.context-providing-and-reading`，吸收
  createContext、useContext 和 Provider 作用域三课，导航与正文标题统一为“Context”；旧
  `create-context`、`use-context`、`provider-scope-and-overrides` 正文和 Demo 退出 manifest，旧 URL
  保持原路径并按现有规则显示内容不存在，不建立重定向。
- **调研与正文：** 独立调研以 React `19.2` 官方文档、React `v19.2.8` 固定源码和 TypeScript
  空值合同为依据。正文在本科范围内详细覆盖 Context 对象身份、默认值、Provider、`useContext`、最近
  祖先、嵌套覆盖、显式 `undefined` / `null`、同组件返回 Provider 的作用域、`Object.is`、对象引用、
  `memo`、TypeScript 合同及 Props / `children` / Context 选择；表述直接，不包含路线编号、计划、批次、
  迁移、构建、测试、复审、篇幅或前后课等生产叙事。
- **Demo 与 Manifest：** 新增 Context 树读取 Demo，覆盖默认值、显式 `undefined`、外层更新、内层覆盖、
  移除内层 Provider 后回退、同组件自身与后代的不同读取、`memo` 更新和重置；源码区同时展示实际运行的
  TSX 与 CSS。entry/demo manifest、Track、前置、related 和下游引用已同步，样式未使用 `grid`、`gap`
  或负字间距。
- **进度迁移：** 三个旧 ID 统一迁移到新目标 ID；临时资产覆盖完整与部分旧进度、历史来源保留/清除、
  最近访问迁移、其他课程隔离和重复应用幂等，迁移检查 `4/4` 通过。
- **质量命令：** 最终快照的聚焦 Prettier、`npm run type-check`、`npm run lint`、空目录 `test:unit`、
  `test:e2e`、`git diff --check` 和完整 `npm run build` 均通过；最终 build 转换 `1777` 个模块。
- **浏览器：** Playwright 验证正式深链、全部 Context 读取与切换、重置及 TSX/CSS 同源展示；
  `1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无页面级横向溢出、文本裁切或卡片重叠。
  console error / warning、page error、失败请求和 `>=400` 响应均为 `0`；三个旧 URL 保持原路径并显示
  内容不存在。
- **审查：** 独立联合复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `30/74`，知识课 `26/62`，实战课 `4/12`。下一课为 I06“Reducer 与 Context 组合”。

### 11.31 I06 执行日志（2026-08-16）

- **目标：** `react.core.learn.intermediate.reducer-context-composition`，正文与导航标题统一为“Reducer 与
  Context 组合”。本课保留 reducer、State Context、dispatch Context、Provider 作用域、State 生命周期、
  嵌套实例隔离、Context 对象身份、`Object.is`、Hook 调用规则和 TypeScript 收窄；正文不包含路线编号、计划、
  批次、迁移、构建、测试、复审、篇幅或前后课等生产叙事。
- **正文与 Demo：** 正文详细说明 Provider 调用一次 `useReducer` 并提供两条 Context 通道，覆盖只读、只写和
  同时读写组件、Action 数据流、删除 Action、缺失 Provider、错误 Context 身份、嵌套 Provider 和实例隔离。
  Demo 的 TSX 与 CSS 通过同源 loader 展示，样式未使用 `grid`、`gap` 或负字间距。
- **清单与进度：** entry、Demo manifest、前置关系和路线状态已同步；I-06 登记为完成，知识课累计 `27/62`，
  实战课累计 `4/12`，新路线累计 `31/74`。I-06 完成后停止，不启动 I-07。
- **质量命令：** 目标文件 Prettier、`npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、
  I-06 范围的 `git diff --check` 和完整 `npm run build` 通过；完整 `format:check` 仍仅被四个无关既有
  Reference 索引文件阻断。
- **浏览器：** Playwright 验证外层添加、切换、删除、内层添加、外层重置和外层/内层 State 隔离；TSX/CSS
  同源源码展示通过。`1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无页面级横向溢出，console
  error / warning、page error、失败请求和 `>=400` 响应均为 `0`，`45` 个静态请求全部返回 `200`。
- **审查：** 独立复审针对标题编号和适用版本字段修正后确认 `Standards PASS / 0 finding`、`Spec PASS / 0
  finding`。
- **停止边界：** I-06 已完成并停止；不执行 I-07 或后续课程。

### 11.32 I07 执行日志（2026-08-16）

- **目标与复用：** 保留 `react.core.learn.intermediate.state-sharing-boundary`，正文与导航标题统一为“状态
  共享边界”。旧正文按当前职责去重，不展开已掌握 API 的完整用法，也不引入新条目或进度迁移。
- **调研与正文：** 独立调研以 React `19.2` 官方文档、React `v19.2.8` 固定源码和 TypeScript 官方指南
  为依据。正文在本科范围内详细覆盖派生值排除、State owner、消费者、修改者、局部 State、最近共同
  父组件、Props/回调、`children`、Provider 子树、Context、reducer 与 Context 的独立选择，以及外部
  Store 候选条件；不教学第三方状态库、订阅或快照 API，表述直接且不包含生产叙事。
- **Demo 与清单：** 同源文档审阅 Demo 覆盖局部帮助开关、共同父组件拥有的文档选择，以及 Provider
  拥有的深层审阅模式；Provider 外工具保持独立。源码区同时展示实际运行的 TSX 与 CSS，demo manifest
  使用组合 loader；entry manifest、Track、前置关系和空 `related` 已核对，样式未使用 `grid`、`gap` 或
  负字间距。
- **质量命令：** 最终快照的聚焦 Prettier、`npm run type-check`、`npm run lint`、空目录 `test:unit`、
  `test:e2e`、I-07 范围的 `git diff --check` 和完整 `npm run build` 均通过；最终 build 转换 `1777` 个
  模块。全仓 `format:check` 仍只被四个无关既有 Vite / Vue Reference 索引文件阻断。
- **浏览器：** Playwright 验证帮助展开/收起、Props 选择、Context 选择、深层批注模式、Provider 外状态、
  选择重置和 TSX/CSS 同源展示；`1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo
  横向溢出、文本裁切或控件重叠。console error / warning、page error、失败请求和 `>=400` 响应均为 `0`。
- **审查：** 独立联合复审指出调研易错点字段与数量、公共版本字段和学习目标数量问题；逐项修正并复跑
  聚焦验证和完整构建后，由原审查者确认 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `32/74`，知识课 `28/62`，实战课 `4/12`。下一课为 IL2“实战：共享任务工作区”。

### 11.33 IL2 执行日志（2026-08-16）

- **目标：** 新增 `react.core.learn.intermediate.lab-shared-task-workspace`，正文与导航标题统一为“实战：
  共享任务工作区”。本课只整合 Reducer、Context、状态边界和模块化 Provider，不引入后续 API、第三方
  状态库、网络、持久化或多人协作。
- **调研与正文：** 独立调研以 React `19.2` 官方文档和 TypeScript 官方指南为依据。正文在本科范围内
  详细覆盖需求拆分、共享与局部 State、同步派生、Action 判别联合、纯 reducer、双 Context、Provider
  作用域、跨面板一致性、稳定身份周期、恢复边界、固定操作序列和高价值错误示例；生产正文不包含计划、
  批次、路线、课程编号、构建、测试、复审或篇幅叙事。
- **Demo 与清单：** Demo 按模型、Provider、面板和页面组合分文件，覆盖新增、选择、状态变化、删除、
  筛选、空状态、恢复和局部草稿保留。entry、Demo manifest、Track、前置关系和同源源码 loader 已同步；
  运行区与源码区使用同一组 TS、TSX、CSS 文件，样式未使用 `grid`、`gap` 或负字间距。
- **质量命令：** 聚焦 Prettier、`npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、
  IL2 范围的 `git diff --check` 和完整 `npm run build` 均通过；审查修正后再次完整构建，转换 `1789`
  个模块。全仓 `format:check` 仍只被四个无关既有 Vite / Vue Reference 索引文件阻断。
- **浏览器：** Playwright 在 `1440x900`、`390x844` 与 `390x844 + 32px` 根字号执行完整交互序列，
  新增、选择、状态同步、筛选、删除、空状态、恢复、局部 State 保留和恢复后的新身份周期均正确；页面、
  Demo 和控件无横向溢出、越界或重叠。修正文案后再次核对三个视口，console error / warning、失败动态
  请求和横向溢出均为 `0`。
- **审查：** 独立联合复审先指出 ID 生命周期表述与恢复行为矛盾；统一改为“一次恢复周期内递增，恢复
  开启新的身份周期”并复跑聚焦验证和完整构建后，由原审查者确认 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `33/74`，知识课 `28/62`，实战课 `5/12`。下一课为 I08“useRef 保存可变值”。

### 11.34 I08 执行日志（2026-08-16）

- **目标与复用：** 保留 `react.core.learn.intermediate.use-ref`，正文与导航标题统一为简短的 `useRef`。
  本课只讲 Ref 对象、跨 render 保留、非渲染数据和读写时机，不展开 DOM Ref、Effect、外部 Store、请求、
  缓存或性能优化。
- **调研与正文：** 独立调研核验 React `19.2` 的 `useRef`、Refs 学习页、Rules of Hooks、组件纯度和官方
  `refs` lint。正文在本科范围内详细覆盖 `current`、初始值只使用一次、同一对象、写入不触发 render、
  局部变量 / State / Ref 的选择、render 读写限制、Strict Mode、Hooks 规则、实例边界和七类高价值错误；
  学习者正文不包含计划、路线、课程编号、构建、测试、复审或篇幅叙事。
- **Demo 与清单：** 同源 Demo 使用 Ref 保存待发布工作值、State 保存公开快照，覆盖登记、独立 State
  更新、发布、丢弃和重置；entry manifest、Demo manifest、Track、前置关系和 loader 已核对，样式未使用
  `grid`、`gap` 或负字间距。
- **质量命令：** 聚焦 Prettier、`npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、
  I08 范围的 `git diff --check` 和完整 `npm run build` 均通过；最终 build 转换 `1791` 个模块。全仓
  `format:check` 仍只被四个无关既有 Vite / Vue Reference 索引文件阻断。
- **浏览器：** Playwright 验证登记三次不改变公开值、独立 State 更新后 Ref 仍保留、发布、丢弃、再次
  发布和重置的完整序列；`1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo 横向溢出、
  控件越界、文字裁切或重叠。最终清洁会话的 console error / warning 和失败动态请求均为 `0`。
- **审查：** 独立联合复审指出延迟初始化被扩写为性能主题，以及调研记录未同步最终收窄结果；删除独立
  目标、示例、易错条目和场景，调研同步为一句受限例外后，由同一审查者确认
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `34/74`，知识课 `29/62`，实战课 `5/12`。下一课为 I09“DOM Ref 与 Callback
  Ref”。

### 11.35 I09 执行日志（2026-08-16）

- **目标与合并：** 保留 `react.core.learn.intermediate.dom-refs`，吸收 Callback Ref，正文与导航标题统一为
  “DOM Ref 与 Callback Ref”。旧 `callback-refs` 退出 entry manifest、Track 和公开内容路径；旧 URL
  保持原地址并按现有规则显示内容不存在，不建立重定向。
- **调研与正文：** 独立调研以 React `19.2` 官方文档、React `v19.2.8` 固定源码和 React 19 升级指南
  为依据。正文在本科范围内详细覆盖对象 Ref、render / commit 时机、固定节点操作、一次性测量、节点失效、
  动态节点 `Map`、Callback Ref setup / cleanup、callback 更换、Strict Mode、React 19 返回值限制、稳定
  ID 和十类高价值错误；表述直接且不包含计划、路线、课程编号、构建、测试、复审或篇幅叙事。
- **Demo 与清单：** 固定节点 Demo 覆盖聚焦、滚动、测量和重置；动态节点 Demo 覆盖添加、定位、删除、
  索引检查和恢复。两个 Demo 统一登记到 I09，源码区展示实际运行的 TSX 与 CSS；entry/demo manifest、
  Track、前置关系和 `ref-as-prop` 前置已同步，样式未使用 `grid`、`gap` 或负字间距。
- **进度迁移：** `dom-refs` 与 `callback-refs` 两个旧来源统一迁移到目标 ID；临时资产覆盖完整与部分旧
  进度、历史来源保留/清除、最近访问迁移、其他课程隔离和重复应用幂等，迁移检查 `5/5` 通过。
- **质量命令：** 最终快照的聚焦 Prettier、`npm run type-check`、`npm run lint`、空目录 `test:unit`、
  `test:e2e`、正文叙事词与 Demo CSS 扫描、I09 范围的 `git diff --check` 和完整 `npm run build` 均通过；
  最终 build 转换 `1793` 个模块。全仓 `format:check` 仍只被四个无关既有 Vite / Vue Reference 索引文件
  阻断。
- **浏览器：** Playwright 验证两个 Demo 的全部交互、重置和 TSX 源码展示；旧 Callback Ref URL 保持
  原地址并显示内容不存在。`1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo 横向
  溢出、控件重叠或文字裁切；console error / warning、失败请求和 `>=400` 响应均为 `0`。
- **审查：** 独立联合复审先指出调研易错点数量与字段、正文易错点数量、cleanup 示例和独立课程推导
  问题；逐项修正并由原审查者最终确认 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `35/74`，知识课 `30/62`，实战课 `5/12`。下一课为 I10“ref 作为 prop”。

### 11.36 I10 执行日志（2026-08-16）

- **目标与边界：** 复用 `react.core.learn.intermediate.ref-as-prop`，正文与导航标题统一为“ref 作为
  prop”，前置收敛为 I09“DOM Ref 与 Callback Ref”。课程只讲 React 19 函数组件接收和转交 Ref，未
  混入计划、路线、课程编号、构建、测试、复审或篇幅叙事。
- **调研与正文：** 以 React `19.2` 官方文档、React 19 发布与升级指南、TypeScript JSX Handbook 和
  `@types/react@19.2.18` 固定源码为依据。正文在本科范围内详细覆盖逐层转交、最终宿主目标、对象 Ref
  失效状态、Callback Ref cleanup、`Ref<T>`、`ComponentPropsWithRef`、React 18 / 19 迁移、类组件
  边界和六组高价值易错点；新 JSX Transform 仅保留一句项目级前提。
- **Demo 与清单：** 透明转交 Demo 覆盖真实输入框聚焦、遗漏转交时 Ref 保持 `null` 和状态重置；源码区
  同时展示实际运行的 TSX 与 CSS。entry/demo manifest、Track 和 I09 前置关系已同步，样式未使用
  `grid`、`gap` 或负字间距。
- **质量命令：** 聚焦 Prettier、`npm run type-check`、`npm run lint`、空目录 `test:unit`、
  `test:e2e`、临时 Ref 类型合同、正文叙事扫描、I10 范围的 staged / unstaged `git diff --check` 和完整
  `npm run build` 均通过；最终 build 转换 `1793` 个模块。全仓 `format:check` 仍只被四个无关既有
  Vite / Vue Reference 索引文件阻断。
- **浏览器：** Playwright 验证成功转交后聚焦真实输入框、未转交 Ref 为 `null`、重置和 TSX / CSS
  源码展示；`1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo 横向溢出、按钮重叠或
  文字裁切。console error / warning、失败请求和 `>=400` 响应均为 `0`。
- **审查：** 独立联合复审先指出正文的新 JSX Transform 前提未进入调研事实合同且存在重复；补齐调研
  结论、问题、来源表、迁移边界、知识清单和参考资料，并把正文收敛为一句后，由原审查者确认
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `36/74`，知识课 `31/62`，实战课 `5/12`。下一课为 I11“Portal 与 DOM 落点”。

### 11.37 I11 执行日志（2026-08-16）

- **目标与前移：** 保留 `react.core.learn.advanced.portal-tree-and-dom-placement` 稳定 ID，将课程移到
  I10 之后并把 `stage`、`level` 调整为 `intermediate`；正文、导航和计划标题统一为简短的“Portal 与
  DOM 落点”，不迁移已有进度。
- **调研与正文：** 以 React `19.2` 公共文档、React DOM `19.2.8` 固定源码与官方测试、
  `@types/react-dom` `19.2.4` 和 WHATWG DOM 标准为依据。正文在本科范围内详细覆盖 `createPortal`
  合同、React 树与 DOM 树、Context、React 事件与原生 `composedPath()`、容器身份与 State、有效目标、
  content / container 所有权、源码推导、适用边界和十类高价值错误；表述直接且不含计划、路线、课程编号、
  构建、复审或篇幅叙事。
- **Demo 与清单：** 使用 React 渲染稳定的 A/B sibling target，通过 Callback Ref 取得节点；Demo 覆盖
  DOM 落点、Context、React 与原生事件路径、同 target 下 State 保留、换 target 重建、owner 更新与
  重置。entry manifest、Demo manifest 和 Track 均移动到 I10 后，源码区展示实际运行的 TSX 与 CSS；
  未使用 `useEffect`、`useCallback`、命令式外部 host、`grid`、`gap` 或负字间距。
- **质量命令：** 最终快照的聚焦 Prettier、`npm run type-check`、`npm run lint`、空目录 `test:unit`、
  `test:e2e`、正文叙事扫描、I11 范围的 staged / unstaged `git diff --check` 和完整 `npm run build` 均
  通过；审查修正章节顺序后再次完整构建，转换 `1793` 个模块。全仓 `format:check` 仍只被四个无关既有
  Vite / Vue Reference 索引文件阻断。
- **浏览器：** Playwright 验证目标包含关系、真实 `parentElement`、Context 和 owner 更新不重置 State、
  React parent 收到 Portal 点击、原生路径只沿 DOM、A/B 切换重建以及 TSX / CSS 同源展示；桌面、
  `390px` 与 `390px + 32px` 根字号均无横向溢出或控件文字裁切。最终 console error / warning 和失败
  请求均为 `0`。
- **审查：** 独立联合复审首轮指出固定章节顺序和 exercise directive 标题编号问题；重排为“Demo →
  易错提示 → 源码推导”并移除 directive 内手写编号后，由原审查者确认
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `37/74`，知识课 `32/62`，实战课 `5/12`。下一课为 IL3“实战：可访问对话框”。

### 11.38 IL3 执行日志（2026-08-17）

- **目标与范围：** 新增 `react.core.learn.intermediate.lab-accessible-dialog`，正文与导航标题统一为简短的
  “实战：可访问对话框”。课程只组合已完成的 DOM Ref、Callback Ref、React 19 ref prop、Portal、
  `useId`、State 和事件处理，不引入 Effect、手写 focus trap、路由、请求或持久化；无旧正文、迁移来源
  或进度迁移。
- **调研与正文：** 以 React `19.2`、React DOM `19.2`、WHATWG HTML、WAI-ARIA APG 与 WCAG `2.2`
  一手材料为依据。正文在本科范围内详细覆盖可访问名称、初始焦点、top layer、背景 inert、键盘退出、
  `showModal()`、`close()`、`returnValue`、`cancel` / `close` 时序、焦点恢复、Ref 连接与适用边界；内容
  直接且不含计划、课号、批次、构建、复审或篇幅叙事。
- **Demo 与清单：** 使用稳定 React host、Portal 和原生 `<dialog>`；Callback Ref setup 以
  `dialog.open` guard 调用 `showModal()`，React 19 `ref` prop 最终指向 `HTMLDialogElement`，原生
  `close` 事件后才撤下子树。Demo 覆盖继续编辑、确认发布、Escape、背景 inert、关闭结果、焦点恢复、
  重复打开和重置；entry manifest、Demo manifest 与 Track 均登记在 I11 后，源码区展示真实 TSX 与 CSS，
  未使用 `grid`、`gap` 或负字间距。
- **质量命令：** 首次构建准确暴露 `pitfalls` 与 `exercise` directive 字段格式问题，按正式 Markdown
  转换合同修正后，最终聚焦 Prettier、`npm run type-check`、`npm run lint`、空目录 `test:unit`、
  `test:e2e`、正文叙事扫描、IL3 范围的 staged / unstaged `git diff --check` 和完整 `npm run build` 均
  通过；最终 build 转换 `1799` 个模块。全仓 `format:check` 的四个无关既有 Vite / Vue Reference 索引
  文件未在本课中格式化。
- **浏览器：** Playwright 验证 `<dialog open>` 的稳定 Portal parent、可访问名称、标题初始焦点、背景
  不可聚焦或点击、Tab / Shift+Tab 不进入背景、三种关闭结果、焦点恢复、重复打开无旧结果、重置以及
  TSX / CSS 同源展示；`1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无页面或 Demo 横向溢出、
  文字裁切或同层控件重叠。最终 console error / warning 和失败请求均为 `0`。
- **审查：** 独立联合复审确认 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `38/74`，知识课 `32/62`，实战课 `6/12`。下一课为 I12“useEffect 同步生命周期”。

### 11.39 I12 执行日志（2026-08-17）

- **目标与范围：** 以 `react.core.learn.intermediate.use-effect` 合并旧 `use-effect`、`effect-cleanup` 和
  `effect-lifecycle`，导航标题保持简短的“useEffect”。正文只讲 Effect 与外部系统同步，覆盖 setup、cleanup、依赖、
  资源所有权、重新同步顺序、独立同步过程、Strict Mode 检查与客户端边界；旧 Markdown 和 Demo 文件保留为历史来源，
  不再生成独立公开入口。
- **调研与正文：** 以 React `19.2` 官方参考、学习文档及 React `19.2.8` 固定版本源码和测试为依据。正文在本科
  范围内详细说明 Effect 的公开合同、提交后时序、资源不变量、多个独立系统、十类易错写法、三组可观察示例和两组
  练习；标题按规范连续编号，表述直接，不含计划、课号、批次、构建、复审或篇幅叙事。
- **Demo、清单与迁移：** 模式 Widget、事件监听对称性和房间同步过程三个 Demo 均归属 `use-effect`，运行内容与
  展示的 TSX / CSS 使用同一源文件；未使用 `grid`、`gap` 或负字间距。entry manifest 与 Track 移除两个旧公开条目，
  `use-effect`、`effect-cleanup`、`effect-lifecycle` 三个历史完成来源迁移到合并目标；相邻课程的前置和相关链接同步为
  当前公开 ID，且不存在重复项。
- **质量命令：** 首次构建准确暴露 `pitfalls` 与 `exercise` directive 格式问题，按现有 Markdown 合同修正，未改转换器。
  聚焦 Prettier、课程生产叙事扫描、标题结构检查、`npm run type-check`、`npm run lint`、空目录 `test:unit`、
  `test:e2e`、限定 `git diff --check` 和完整 `npm run build` 均通过；最终构建转换 `1797` 个模块。
- **浏览器：** Playwright 在 `1440x900`、`390x844` 与 `390x844 + 32px` 根字号下验证模式同步、频道切换时旧
  listener 先清理、卸载后资源归零、无关 render 不重启同步过程、房间切换按“停止旧房间、开始新房间”排序，以及
  隐藏停止、重新显示恢复；页面和 Demo 无横向溢出，console error / warning、page error 和失败请求均为 `0`。
  两个旧 URL 保持原地址并显示内容不存在，不建立重定向。
- **审查：** 首轮独立联合复审发现标题编号、非法返回值示例和重复相关 ID 三类问题；修正后由同一复审者确认
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `39/74`，知识课 `33/62`，实战课 `6/12`。下一课为 I13“不需要 Effect 的场景”。

### 11.40 I13 执行日志（2026-08-17）

- **目标与范围：** 扩充“不需要 Effect 的场景”，只讲本科 React 中判断代码运行原因的边界：render 派生、事件处理、
  State 初始化与 `key` 重置、父子通知、`useMemo` 缓存选择、Effect 链，以及外部 Store 和请求同步的保留边界。
  正文不写计划、课号、批次、构建、复审或篇幅叙事。
- **调研与正文：** 依据 React `19.2` 官方文档与 `19.2.8` 固定版本旁证，完成研究记录和课程正文；正文覆盖十五个
  连续编号章节、九项高价值易错点、四组练习和同源 Demo 说明，内容限定在本科公共行为。
- **Demo、清单与迁移：** 保留 `render-and-event-boundary-demo` 的纯 render 订单摘要和事件动作；补充稳定
  `customer.id` + `OrderEditor key` 的局部 State 重置、父子事件通知和双层重置按钮。Demo 运行与源码展示来自同一
  TSX/CSS 文件，entry/demo manifest 与 Track 条目一致；未新增进度迁移。
- **质量命令：** 目标 Markdown 与 TSX 的 Prettier、限定 `git diff --check`、`npm run type-check`、`npm run lint`、
  `npm run test:unit`、`npm run test:e2e` 和完整 `npm run build` 均通过；最终构建转换 `1799` 个模块。Demo CSS 未使用
  `grid`、`gap` 或负字间距。
- **浏览器：** Playwright 验证冷启动空备注、数量改为 `3` 后总价 `¥240`、备注输入不增加动作次数、两次动作计数为 `2`、
  编辑器局部重置、父组件动作记录清空、客户切换后的 `key` 重置，以及 390px 无横向溢出；console error / warning 为 `0`。
- **审查：** 同一独立复审者在修正 D1 冷启动/重置合同和 D2 文档行为描述后确认 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `40/74`，知识课 `34/62`，实战课 `6/12`。下一课为 I14“Effect 依赖与稳定化”。

### 11.41 I14 执行日志（2026-08-17）

- **目标与范围：** 以 `effect-dependencies` 合并旧 `removing-effect-dependencies`，只讲 Effect 的响应值识别、完整依赖、
  `Object.is`、陈旧闭包、对象/函数身份与创建边界改写；不提前教学 `useEffectEvent` 或展开后续课程。
- **调研与正文：** 依据 React `19.2` 官方文档与 `19.2.8` 固定版本源码/测试，正文按规范编号为十个根级章节，
  覆盖 setup/cleanup、派生值、稳定值例外、固定内联数组、对象与函数的完整前后代码、七项易错点与三组练习。
  学习者正文不包含计划、课号、批次、构建、复审、完成度或篇幅叙事。
- **Demo、清单与迁移：** 完整依赖 Demo 使用 `[endpoint, roomId]`，对象稳定化 Demo 在 Effect 内构造 `options`
  并使用 `[roomId]`。两个 Widget 的每次 `synchronize` 都递增公开计数，不再以同值短路掩盖 Effect 调用。
  运行与展示的 TSX/CSS 同源，CSS 未使用 `grid`、`gap` 或非零字距。入口、Demo manifest、Track、进度迁移与
  I15 前置关系均已同步，旧课程不再生成公开入口。
- **质量命令：** 本课文件级 Prettier、限定 `git diff --check`、TypeScript `7.0.2` 定向编译、语义结构检查、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 与完整 `npm run build` 均通过；最终构建转换
  `1799` 个模块。全仓 `format:check` 仅被四个 I14 范围外的既有索引文件阻塞，未跨范围修改。
- **浏览器：** Playwright 验证开发 Strict Mode 冷启动计数为 `2`；完整依赖 Demo 经两项依赖变化为 `3`、
  `4`，备注保持 `4`，重置回到 `2`；对象 Demo 切换房间为 `3`，备注保持 `3`，重置回到 `2`。`390x844`
  与 `390x844 + 32px` 根字号下 `scrollWidth = clientWidth = 390`，源码区可见真实 TSX/CSS，console error/warning、
  动态失败请求与静态 `4xx/5xx` 均为 `0`。
- **审查：** 首轮联合复审指出标题编号、证据状态、函数依赖覆盖、研究范围冲突与 Demo 观察指标五类问题；
  修正并回归后，同一复审者确认 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `41/74`，知识课 `35/62`，实战课 `6/12`。下一课为 I15“Effect Event”。

### 11.42 I15 执行日志（2026-08-17）

- **目标与范围：** 复用并扩充 `effect-events`，只讲响应式与非响应式逻辑、`useEffectEvent` 的 API 合同、最新已提交值、
  显式事件参数、调用位置、依赖省略、函数身份和与普通事件处理器/`useRef`/`useCallback` 的边界；学习者正文不包含
  计划、课号、批次、构建、复审、完成度或篇幅叙事，左侧标题保持为简短的“Effect Event”。
- **调研与正文：** 依据 React `19.2` 官方文档、React `19.2.8` 固定源码与 Hook lint 规则完成研究记录；正文按规范
  编号为十五个根级章节，覆盖 API 参数和返回值、已提交快照、参数身份、八项高价值易错点、四组练习和本科范围边界。
- **Demo、清单与迁移：** `latest-notification-demo` 用真实公开的 Effect 建连次数证明主题变化不重连、房间变化重连，
  连接事件通过 listener 调用 Effect Event 并读取最新主题；运行与源码展示来自同一 TSX/CSS，Demo manifest 同时注册两份
  源码，Track 与入口条目一致，未新增进度迁移。
- **质量命令：** I15 文件定向 Prettier、限定 `git diff --check`、TypeScript `7.0.2` 定向编译、最小 AST 语义检查、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；最终构建转换 `1799`
  个模块。全仓 `format:check` 仍仅被四个范围外既有索引文件阻塞，未跨范围修改；Demo CSS 未使用 `grid`、`gap` 或非零字距。
- **浏览器：** Playwright 在桌面视口、`390x844` 与 `390x844 + 32px` 根字号下验证冷启动 `alpha / light / 2 / 暂无通知`；
  切换深色建连次数保持 `2`，触发事件显示 `alpha / dark`，切换 `beta` 增至 `3`，切回浅色后触发事件显示 `beta / light`，
  重置回到冷启动状态。源码面板可见真实 TSX 与 CSS；页面和 Demo 无横向溢出，代码块内部滚动保持可用，console error/warning
  为 `0`，静态请求和交互期间请求均未出现 `4xx/5xx`。
- **审查：** 独立复审确认 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`；未发现课程边界、调用合同、同源 Demo、
  manifest 或样式规范问题。
- **完成度：** 新路线 `42/74`，知识课 `36/62`，实战课 `6/12`。下一课为 I16“自定义 Hook 与 useDebugValue”。

### 11.43 I16 执行日志（2026-08-17）

- **目标与范围：** 复用并扩充 `custom-hooks`，只讲自定义 Hook 的有状态逻辑抽取、输入输出、命名和顶层调用、
  独立 State、State 共享边界，以及 `useDebugValue` 的调试值、formatter 和 DevTools 边界；左侧标题保持为简短的
  “自定义 Hook”，学习者正文不包含计划、课号、批次、构建、复审、完成度或篇幅叙事。
- **调研与正文：** 依据 React `19.2` 官方文档与 React `19.2.8` 固定源码旁证重写研究记录；正文按规范编号为
  十五个根级章节，覆盖 Hook 抽取方法、调用顺序、独立 State、共享所有权、响应行为、八项易错点、四组练习和
  `useDebugValue` 的参数、无业务返回值、延迟格式化与适用边界，内容限定在本科公共行为。
- **Demo、清单与迁移：** `independent-counters-demo` 在组件顶层显式调用两次 `useCounter`，每次拥有独立 State；
  Hook 顶层真实调用 `useDebugValue`，纯 formatter 只生成 React DevTools 标签，不影响页面返回值和交互。运行与源码
  展示来自同一 TSX/CSS，Demo manifest 已同步；entry、Track 保持既有登记，未新增进度迁移。
- **质量命令：** 本课文件定向 Prettier、限定 `git diff --check`、`npm run type-check`、`npm run lint`、空目录
  `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；最终构建转换 `1801` 个模块。Demo CSS 未使用 `grid`、
  `gap` 或非零字距。
- **浏览器：** Playwright 验证冷启动 `0 / 0`，左侧两次增加为 `2 / 0`，右侧增加为 `2 / 1`，左侧重置为
  `0 / 1`；源码区可见真实 TSX、CSS 与 `useDebugValue`。桌面、`390x844` 和 `390x844 + 32px` 根字号下页面与
  Demo 无横向溢出，按钮文字完整；console error/warning 和动态失败请求为 `0`，`1624` 个静态请求均为 `200`。
- **审查：** 独立首轮复审发现研究记录最后一条固定源码引用未分别锚定 State mount 与 `useDebugValue` 实现；修正
  引用后，同一复审者确认 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `43/74`，知识课 `37/62`，实战课 `6/12`。下一课为 I17“StrictMode 开发检查”。

### 11.44 I17 执行日志（2026-08-17）

- **目标与范围：** 新增 `react.core.learn.intermediate.strict-mode-development-checks`，正文与导航标题
  统一为简短的“StrictMode”。课程只讲开发期额外 render、Effect 重连、Callback Ref
  setup/cleanup、弃用 API 警告、根级与局部作用域及生产边界，不扩展到后续布局 Effect
  主题；无旧正文、迁移来源或进度迁移。
- **调研与正文：** 依据 React `19.2`、React DOM `19.2` 公共文档与 React `19.2.8` 固定版本源码/测试
  完成调研和正文。正文按规范编号为十六个根级章节，详细覆盖纯度范围、事件处理器边界、
  Effect 和 Ref 的对称清理、局部 StrictMode 的初次 Effect 例外、弃用警告定位、八项易错点与
  四组练习；内容限定在本科公共行为，表述直接且不含计划、课号、批次、构建、复审、
  完成度或篇幅叙事。
- **Demo 与清单：** `resource-symmetry-demo` 同时展示纯 render 列表和房间连接资源；开发期冷启动
  稳定为故事数 `3`、用户动作 `0`、`setup / cleanup / active = 2 / 1 / 1`。普通重新渲染不重连，
  切换房间后为 `3 / 2 / 1`，重置使用新 `key` 恢复冷启动状态。运行与展示的 TSX/CSS 同源，
  entry manifest、Demo manifest 与 Track 已在自定义 Hook 后登记；CSS 未使用 `grid`、`gap` 或非零字距。
- **质量命令：** 本课文件定向 Prettier、限定 `git diff --check`、正文叙事与样式禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1807` 个模块。全仓 `format:check` 仍只被四个 I17 范围外的既有 Vite/Vue
  Reference 索引文件阻断，未跨范围修改。
- **浏览器：** Playwright 验证正式深链、简短左侧标题、上下篇顺序、冷启动计数、普通重新渲染、
  房间切换、重置及 TSX/CSS 真实源码展示。`1440x900`、`390x844` 与 `390x844 + 32px`
  根字号下页面和 Demo 无横向溢出、控件文字裁切或同层重叠；console error/warning 为 `0`，
  无动态失败请求，`1078` 个静态请求均为 `200`。
- **审查：** 独立联合复审确认 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`；未发现事实边界、
  课程范围、同源 Demo、manifest 或样式规范问题。
- **完成度：** 新路线 `44/74`，知识课 `38/62`，实战课 `6/12`。下一课为 IL4“实战：可切换聊天室”。

### 11.45 IL4 执行日志（2026-08-17）

- **目标与范围：** 新增 `react.core.learn.intermediate.lab-synchronized-chat-room`，正文与导航标题统一为
  “实战：可切换聊天室”。课程组合 Effect 生命周期、完整依赖、Effect Event、自定义 Hook、StrictMode
  资源检查与 `key` 重置，只使用本阶段已经完成的知识；不实现真实 WebSocket、鉴权、重试、持久化或后续高级主题。
- **调研与正文：** 依据 React `19.2` 公共文档、`react.dev` 固定提交和 React `19.2.8` 固定版本完成调研。
  正文按规范编号为十六个根级章节，详细覆盖连接身份、cleanup 所有权、Hook 合同、最新主题读取、提交事件、
  StrictMode 环境边界、实例重置、八项易错点与四组练习；内容限定在本科公共行为，表述直接且不含计划、课号、
  批次、构建、复审、完成度、行数或字数叙事。
- **Demo 与清单：** `lab-synchronized-chat-room-demo` 使用本地确定性连接替身。根级 StrictMode 开发冷启动稳定为
  `setup / cleanup / active = 2 / 1 / 1`；主题变化不重连且下一次连接通知读取最新主题，服务器或房间切换先清理
  旧目标再建立新目标，提交消息只新增一条消息且不改变连接计数，`key` 重置恢复固定初值和 `2 / 1 / 1`。
  运行与展示的 TSX/CSS 同源，entry manifest、Demo manifest 与 Track 已紧接 StrictMode 登记。
- **质量命令：** 本课文件定向 Prettier、限定 `git diff --check`、正文叙事与样式禁区扫描、`npm run type-check`、
  `npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；最终构建转换 `1815` 个模块。
  全仓 `format:check` 仍只被四个 IL4 范围外的既有 Vite/Vue Reference 索引文件阻断，未跨范围修改。
- **浏览器：** Playwright 验证正式深链、简短左侧标题、上下篇顺序、冷启动计数、主题/服务器/房间切换、
  消息提交、实例重置及 TSX/CSS 真实源码展示。桌面、`390x844` 与 `390x844 + 32px` 根字号下页面和 Demo
  无横向溢出、控件文字裁切或同层重叠；page error、console error/warning 和失败请求均为 `0`。
- **审查：** 独立首轮复审确认 `Spec PASS / 0 finding`，并发现调研记录的易错点超过十项且缺少规范要求的完整字段；
  重写为十个包含触发条件、原因、后果、错误/正确示例、版本和官方来源的案例后，同一复审者确认
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `45/74`，知识课 `38/62`，实战课 `7/12`。中级阶段 `21/21` 完成，下一课为
  A01“Profiler 渲染测量”。

### 11.46 A01 执行日志（2026-08-17）

- **目标与范围：** 复用 `react.core.learn.advanced.profiler-render-measurement`，正文与导航标题统一为
  “Profiler 渲染测量”。课程只讲 commit 级测量、`onRender` 六个参数、三种 `phase`、两类 duration、
  两个时间戳、多个与嵌套边界以及开发/普通 production/profiling build 的证据边界；不展开 DevTools、
  `memo`、`useMemo`、`useCallback`、遥测平台或 Fiber/调度器实现。
- **调研与正文：** 依据 React `19.2`、React DOM `19.2.8`、`@types/react@19.2.18` 官方文档、固定源码与
  官方测试完成独立调研和正文。保留准确的公共参数语义，补充 `nested-update`、`commitTime` 归组、
  嵌套范围重叠、普通 production 默认关闭 profiling、多次同类样本和八项易错点；删除旧路线、课号、
  批次、完成度、篇幅和后续课程叙事。frontmatter 与正文学习目标均合并为六项，正文知识覆盖不删减。
- **Demo 与清单：** `commit-duration-demo` 使用确定性渲染计算展示 `mount`、`update`、稳定 `id`、
  `actualDuration`、`baseDuration`、`startTime` 与 `commitTime`。记录保存在非渲染 ref，并通过 Profiler
  外部的 DOM Ref 更新日志，清空日志不会重新渲染被测子树；未引入后续性能优化或命令式句柄 API。
  运行与展示的 TSX/CSS 同源，entry manifest、Demo manifest 与 Track 已紧接 IL4 登记。
- **质量命令：** 本课文件定向 Prettier、限定 `git diff --check`、正文叙事与样式禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1817` 个模块。全仓 `format:check` 仍只被四个 A01 范围外的既有 Vite/Vue Reference
  索引文件阻断，未跨范围修改。
- **浏览器：** Playwright 验证正式深链和简短左侧标题；冷启动为 `mount / report / 1 条`，更新后为
  `update / report / 2 条`，清空后六个字段归零且报告版本不变，切换重负载只新增一条 `update`。
  `1440x900`、`390x844` 与 `390x844 + 32px` 根字号下无横向溢出或控件裁切；console error/warning
  和失败请求为 `0`，同源源码显示最新 TSX/CSS 且不含 `useImperativeHandle`。
- **审查：** 独立首轮联合复审发现 Demo 混入后续 `useImperativeHandle`、未显示 `id`、学习目标超过六项及
  执行日志未闭环。改用已学 `useRef + DOM Ref`、补齐六参可见性、合并目标并补写本日志后，逐项复核确认
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `46/74`，知识课 `39/62`，实战课 `7/12`。下一课为 A02“useMemo 与值缓存”。

### 11.47 A02 执行日志（2026-08-17）

- **目标与范围：** 新增 `react.core.learn.advanced.use-memo-value-caching`，正文与导航标题统一为
  “useMemo 与值缓存”。课程只讲纯计算结果缓存、完整依赖、`Object.is` 比较、测量前提、引用身份、
  Strict Mode 开发检查和非语义保证；不展开组件 `memo`、函数 `useCallback`、React Compiler、
  DevTools、服务端或请求缓存。
- **调研与正文：** 依据 React `19.2` 公共文档、固定文档源码和 React `19.2.8` 固定实现完成独立调研。
  正文按规范编号为十四个根级章节，详细覆盖签名、首次与后续 render、纯度、依赖比较、对象依赖重构、
  适用条件、Effect/State/Ref 边界、八项易错点和四组练习；正文不含计划、课号、批次、完成度或篇幅叙事。
- **Demo 与清单：** `value-cache-demo` 使用确定性同步计算对照直接计算与 `useMemo` 缓存。无关父级更新后
  已提交缓存版本保持 `1` 且 `Object.is` 相同；关键词和计算规模变化分别生成新版本并显示引用不同；重置
  恢复固定输入和结果。计数只记录已提交的缓存结果版本，计算函数保持纯净。运行与展示的 TSX/CSS 同源，
  entry manifest、Demo manifest 与 Track 已紧接 Profiler 登记，CSS 未使用 `grid`、`gap` 或非零字距。
- **质量命令：** 本课文件定向 Prettier、限定 `git diff --check`、正文叙事与样式禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1825` 个模块。全仓 `format:check` 仍只报告四个本课范围外的既有 Vite/Vue Reference
  索引文件，未跨范围修改。
- **浏览器：** Playwright 验证正式深链、简短左侧标题、上下篇顺序、无关更新命中缓存、关键词/负载依赖
  变化、确定性重置和 TSX/CSS 真实源码。`1440x900`、`390x844` 与 `390x844 + 32px` 根字号下页面和 Demo
  无横向溢出或控件文字裁切；console error/warning 和动态失败请求均为 `0`，共观察到 `545` 个静态请求。
- **审查：** 独立联合复审先后指出调研 Demo 合同仍是旧方案、同值负载提示与实际依赖变化不符、重置函数
  注释不准确及修复后构建证据过期；同步调研合同、补齐同值分支、纠正注释并重跑浏览器反馈环和完整构建后，
  最终确认 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `47/74`，知识课 `40/62`，实战课 `7/12`。下一课为 A03“memo 与组件跳过渲染”。

### 11.48 A03 执行日志（2026-08-17）

- **目标与审计：** 复用 `react.core.learn.advanced.memo-component-bailout`，正文与导航标题统一为
  “memo 与组件跳过渲染”。保留稳定 ID、默认 Props 比较、State/Context 边界、引用身份、自定义比较风险
  和 Profiler 对照；补充完整签名、更小 Props 合同、删除检查、八项易错点与四组练习；删除旧路线编号、
  后续课程提示、批次与历史构建叙事，不移动或合并课程，也不新增 Demo ID。
- **调研与正文：** 依据 React `19.2` 公共文档、固定文档源码与 React `19.2.8` 固定实现完成独立调研。
  正文通过十四个连续根级章节详细覆盖 `memo(Component, arePropsEqual?)`、默认逐项 `Object.is`、父级
  Props、组件自身 State、所读 Context、对象/数组/函数/`children` 身份、测量条件和 comparator 风险；
  正文只描述本课知识，不包含计划、课号、批次、完成度、复审、构建、篇幅或前后课等生产叙事。
- **Demo 与清单：** `parent-update-demo` 使用普通报告与 `memo` 报告执行相同确定性计算，并通过报告内部
  Profiler 把真实 commit 写入被测分支外的固定日志。Demo 只使用已学的 `memo`、Profiler、`useRef`、
  `useState` 与 DOM Ref，不使用 `useImperativeHandle`、`useMemo`、`useCallback`、自定义 comparator、
  网络、timer 或随机数。entry manifest、Demo manifest 与 Track 已登记 A03，运行和展示共同读取当前
  TSX/CSS；CSS 未使用 `grid`、`gap` 或非零字距，并保留多条 commit 历史的换行结构。
- **质量命令：** A03 文件定向 Prettier、限定 `git diff --check`、正文生产叙事与 Demo 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1827` 个模块。全仓 `format:check` 仍只报告四个本课范围外的既有 Vite/Vue Reference
  索引文件，未跨范围修改。
- **浏览器：** Playwright 验证正式深链、简短左侧标题、A02/A04 前后篇、展开的当前 TSX/CSS 和固定
  交互。冷挂载为 `1/1`，清空为 `0/0`，仅更新父组件后为 `1/0`，修改报告 Props 后为 `2/1`，两个
  报告同时显示版本 `2` 与相同校验值。`1440x900`、`390x844` 与 `390x844 + 32px` 根字号下无横向
  溢出或按钮文字裁切；console error/warning 与失败请求均为 `0`，共观察到 `543` 个静态请求。
- **审查：** 独立联合复审确认课程单知识点边界、正文结构、官方事实、Demo 行为、同源清单和 manifest
  登记均符合要求，最终为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `48/74`，知识课 `41/62`，实战课 `7/12`。下一课为 A04“useCallback 与函数身份”。

### 11.49 A04 执行日志（2026-08-17）

- **目标与审计：** 复用 `react.core.learn.advanced.use-callback-function-identity`，正文与导航标题统一为
  “useCallback 与函数身份”。保留稳定 ID、完整依赖、`memo` 配合与 updater 规则；补充导入、TypeScript
  回调类型、`DependencyList` 边界、`Object.is`、Effect/自定义 Hook 选择、八项易错点与四组练习；删除
  旧路线编号、后续课程提示、批次和历史构建叙事，不移动或合并课程，也不新增 Demo ID。
- **调研与正文：** 依据 React `19.2` 公共文档、固定文档源码与 React `19.2.8` 固定实现完成独立调研。
  调研的八个易错点逐项记录错误名称、触发条件、原因、后果、错误/正确示例、适用版本和官方来源。正文
  通过十四个连续根级章节详细覆盖函数创建与身份、API 返回值、依赖比较、闭包更新、Hook 位置、`memo`
  组合边界、updater、Effect 重构、自定义 Hook、Profiler 测量、缓存失效与删除检查；省略依赖只作为
  JavaScript 运行时示意，TypeScript 示例均传入必填依赖数组。正文只描述本课知识，不含生产叙事。
- **Demo 与清单：** `callback-bailout-demo` 用同一个 `memo` 工具栏形成每次新建函数和 `useCallback`
  两个分支，执行相同确定性计算，并通过分支内部 Profiler 把真实 commit 写入固定 DOM Ref 日志。保存按钮
  分别验证普通函数和缓存函数读取当前报告版本。Demo 不使用 `useMemo`、Effect、Context、自定义
  comparator、`useImperativeHandle`、网络、timer 或随机数；entry manifest、Demo manifest 与 Track
  已登记，运行和展示共同读取当前 TSX/CSS，CSS 未使用 `grid`、`gap` 或非零字距。
- **质量命令：** A04 文件定向 Prettier、限定 `git diff --check`、正文生产叙事与 Demo 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1827` 个模块。全仓 `format:check` 仍只报告四个本课范围外的既有 Vite/Vue Reference
  索引文件，未跨范围修改。
- **浏览器：** Vite 开发模式验证固定交互：冷挂载 `1/1`、清空 `0/0`、仅更新父组件 `1/0`、修改真实
  依赖 `2/1`，两个保存按钮均读取版本 `2`，`557` 个静态请求全部成功。最终正文修正未改变 Demo；修正后
  production snapshot 重新确认类型章节、简短左侧标题、TSX/CSS 同源与无后置 API，并在 `1440x900`、
  `390x844`、`390x844 + 32px` 根字号下无横向溢出或按钮文字裁切，console error/warning 与失败请求均为
  `0`。共享开发服务器随后出现的 Java frontmatter HMR 500 属于并行课程改动，不计入 A04 结果。
- **审查：** 首轮独立联合复审发现调研八字段和 TypeScript 类型边界两项问题；补齐后由同一复审代理重查，
  确认原 finding 全部关闭且无回归，最终为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `49/74`，知识课 `42/62`，实战课 `7/12`。下一课为 AL1“实战：渲染性能诊断”。

### 11.50 AL1 执行日志（2026-08-17）

- **目标：** 新增 `react.core.learn.advanced.lab-render-performance`，最终标题为“实战：渲染性能诊断”。
  本课组合已经完成的 Profiler、`memo`、`useMemo` 与 `useCallback`，不吸收、移动或删除其他课程。
- **调研与正文：** 依据 React `19.2` 公共文档、固定文档源码和 React `19.2.8` 固定实现完成独立
  调研；正文以固定输入和五策略因果矩阵覆盖问题复现、Profiler 边界、Props 身份定位、逐项优化、必要
  更新、构建环境、重复采样、正确性回归和删除检查，并提供八项易错提示与五组练习。正文只描述本课
  内容，不含课号、计划、批次、完成度、构建或复审叙事。
- **Demo 与清单：** `render-diagnosis-demo` 用同一数据、查询、工作量、计算、列表和 Profiler 边界对照
  未优化、仅 `memo`、稳定值、稳定函数和完整组合五种策略；工作量只重复同一确定性计算，不改变报告
  顺序、分数或校验值。重置同时恢复策略、主题、查询、工作量、选中项与真实内部日志。entry manifest、
  Demo manifest 和 Track 已登记，运行与展示共同读取当前 TSX/CSS，CSS 未使用 `grid`、`gap` 或负字距。
- **质量命令：** AL1 文件定向 Prettier、限定 `git diff --check`、正文生产叙事和 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 与完整 `npm run build` 均通过；
  最终构建转换 `1835` 个模块。
- **浏览器：** 开发构建中前四种策略的无关主题更新均为 `workspace 1 / list 1`，完整组合为 `1 / 0`；
  查询、选择与重载继续产生必要更新，分别累计 `1 / 1`、`2 / 2`、`3 / 3`。标准、较重、重载三档
  均保持 8 条结果和校验值 `92764`；修改查询后为 `56962`，切换工作量不再改变业务结果。重置恢复
  未优化、浅色、查询“性能”、标准工作量、无选中项和空日志。`1440x900`、`390x844`、
  `390x844 + 32px` 根字号下页面与 Demo 无横向溢出、按钮裁切或重叠，console error/warning、失败请求
  和 HTTP 4xx/5xx 均为 `0`，前后篇与源码同源正确。
- **审查：** 首轮独立联合复审发现工作量改变业务输出、两段示例漏传必填 Props、重置残留隐藏 mount
  记录三项问题；修复并复跑同一反馈环后由原审查者复核，最终为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `50/74`，知识课 `42/62`，实战课 `8/12`。下一课为 A05“Error Boundary 与
  渲染失败隔离”。

### 11.51 A05 执行日志（2026-08-17）

- **目标与范围：** 复用 `react.core.learn.advanced.error-boundary-render-failures`，正文与导航标题统一为
  “Error Boundary”。课程只讲后代 React 渲染与生命周期失败的局部隔离、fallback、恢复、事件/普通异步/SSR
  边界和必要的类组件外壳；不扩展到 lazy、Suspense、资源请求或后续异步课程。
- **调研与正文：** 依据 React `19.2` 公共文档、React DOM `19.2.8` 固定版本与官方错误回调资料完成调研。
  正文扩充为十个连续根级章节、九个完整易错点和五组练习，覆盖 `getDerivedStateFromError`、
  `componentDidCatch`、最近祖先、局部 fallback、`key` 恢复与 Root 三类错误回调；删除计划、课号、批次、构建、
  复审、完成度和后续课程叙事，内容限定在本科公共行为范围。
- **Demo 与清单：** `local-fallback-recovery-demo` 覆盖局部 render 失败、相邻功能继续可用、边界版本恢复、
  fallback 自身失败向外层边界传播和重建实验；运行与展示的 TSX/CSS 同源，entry manifest、Demo manifest、
  Track、前置和 related 已同步，样式未使用 `grid`、`gap` 或非零字距。
- **质量命令：** 目标文件定向 Prettier、`git diff --check`、`npm run type-check`、`npm run lint`、空目录
  `test:unit`、`test:e2e` 和完整 `npm run build` 均通过，构建转换 `1837` 个模块。
- **浏览器：** Playwright 在 `1440x900`、`390x844` 与 `390x844 + 32px` 根字号验证正式深链、局部失败与恢复、
  fallback 向上接管、源码同源及布局；捕获次数、边界版本和 State 重置符合课程合同，横向溢出、按钮裁切、重叠、
  console error/warning、失败请求和 HTTP 4xx/5xx 均为 `0`。
- **审查：** 独立联合复审确认 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`，未发现课程范围、事实、
  Demo、manifest 或样式规范问题。
- **完成度：** 新路线 `51/74`，知识课 `43/62`，实战课 `8/12`。下一课为 A06“lazy 组件代码分割”。

### 11.52 A06 执行日志（2026-08-17）

- **目标与范围：** 复用 `react.core.learn.advanced.lazy-component-code-splitting`，正文与导航标题统一为
  “lazy 组件代码分割”。课程只讲动态导入、loader 时机、Promise 与结果缓存、默认导出、组件身份、
  State 生命周期、最小 Suspense 等待外壳、Error Boundary 失败接管和正式 chunk 边界；不扩展到
  Suspense reveal 调度、异步资源读取或资源提示 API。
- **调研与正文：** 依据 React `19.2` 公共文档、React `19.2.8` 固定源码、仓库锁定的
  `@types/react@19.2.18` 与 Vite 官方文档完成独立调研。正文扩充为十个连续根级章节、九个完整易错点和
  五组练习，覆盖 loader 调用时机、成功与失败缓存、Props 类型、默认导出、模块缓存与实例 State、顶层
  声明、固定导入映射和开发/正式证据边界；正文不含课号、计划、批次、Gate、构建、复审或完成度叙事。
- **Demo 与清单：** `on-demand-panel-demo` 以真实动态模块证明首次 render 才加载、隐藏后 State 重置而
  loader 保持一次；另用真实 `import('./lazy-failure-panel')` 的模块求值失败证明 rejection 由局部 Error
  Boundary 接管，重建边界不会让同一 lazy 类型自动重试。entry manifest、Demo manifest 与 Track 已接线，
  TSX、TS 和 CSS 真实运行文件均进入源码展示；CSS 未使用 `grid`、`gap` 或负字距。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、正文生产叙事与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  构建转换 `1841` 个模块，并生成独立 `lazy-course-panel-*.js` 与 `lazy-failure-panel-*.js` 动态模块。
- **浏览器：** Playwright 验证冷进入 loader 为 `0`，首次显示为 `1`；局部版本修改后隐藏再显示恢复为
  `0`，loader 保持 `1`。真实动态导入失败由局部边界接管，重建边界后再次触发仍为 `1`；源码区包含全部
  真实运行文件。`1440x900`、`390x844` 与 `390x844 + 32px` 根字号下无横向溢出或按钮文字裁切，console
  error/warning 均为 `0`。
- **审查：** 首轮独立联合复审发现调研易错点缺少八字段、失败示例并非真实动态导入，以及局部边界重复
  取舍未说明；补齐结构、改为真实模块求值失败并明确 Demo 自包含原因后，由同一复审代理完整重查，最终为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `52/74`，知识课 `44/62`，实战课 `8/12`。下一课为 A07“Suspense fallback 边界”。

### 11.53 A07 执行日志（2026-08-17）

- **目标与范围：** 复用 `react.core.learn.advanced.suspense-fallback-boundary`，正文与导航标题统一为
  “Suspense fallback 边界”。课程只讲最近父级边界、整体 fallback 替换、共同与嵌套 reveal、首次挂起
  State、已显示内容再次挂起、结构保护、layout Effect 清理，以及 lazy pending/resolved/rejected 的
  边界分流；不扩展到 `use` 读取异步资源、非紧急更新 API、数据框架或服务端渲染。
- **调研与正文：** 依据 React `19.2` 官方 `Suspense`、`lazy`、Error Boundary、Versions 文档，固定
  react.dev 文档提交、React `v19.2.8` 源码和 `@types/react@19.2.18` 完成调研。正文扩充为十个连续
  根级章节、七个完整易错点和五组练习；同步修正 `verifiedAt` 与三个 lazy 模块的事实描述。正文只
  描述本课知识，不含课号、计划、批次、Gate、构建、复审或完成度叙事。
- **Demo 与清单：** `nested-reveal-demo` 用三个真实动态模块和三个可控 gate 展示外层 fallback、摘要加
  内层 fallback、初版检查器 reveal，以及新版检查器触发的再次挂起与结构保护。entry manifest、Demo
  manifest 与 Track 已接线；运行中的 TSX、三个模块、gate 与 CSS 共六个文件均进入源码展示，CSS 未
  使用 `grid`、`gap` 或负字距。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、正文生产叙事与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  构建转换 `1845` 个模块，并生成摘要、初版检查器和新版检查器动态模块。全仓 `format:check` 仍只报告
  四个本课范围外的既有 Vite/Vue Reference 索引文件。
- **浏览器：** Playwright 验证初始 `0/0/0`、外层 fallback、摘要加内层 fallback、两层 reveal、再次挂起
  时摘要持续可见和新版检查器局部替换；三个 loader 最终均为 `1`，源码区六个文件同源可见。于
  `1440x900`、`390x844`、`390x844 + 32px` 根字号下确认无横向溢出、按钮裁切或重叠，console
  error/warning 与 4xx/5xx 请求均为 `0`。
- **审查：** 首轮独立复审发现 `verifiedAt` 日期过期和“两个 lazy 组件”与实际三个模块不一致；修正
  元数据及研究稿、正文文案后由同一复审代理复核，最终为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `53/74`，知识课 `45/62`，实战课 `8/12`。下一课为 A08“use 读取 Context 与
  异步资源”。

### 11.54 A08 执行日志（2026-08-17）

- **目标与范围：** 将原 `react.core.learn.advanced.use-promise-reading` 迁移为
  `react.core.learn.advanced.use-resource-reading`，左侧标题统一为“use 读取资源”。正文覆盖
  `use(context)` 的默认值、最近 provider、嵌套覆盖、`Object.is` 更新与 `undefined` 边界，以及
  `use(promise)` 的 pending、fulfilled、rejected、cached Promise 身份、Suspense、Error Boundary、
  条件/循环调用例外和失败恢复；不扩展到服务端资源、完整数据缓存或其他计划内容。
- **调研与正文：** 依据 React `19.2` 官方 `use`、Context、Suspense、Error Boundary、Rules of Hooks
  文档及固定运行时/类型来源完成调研。正文补充十个易错点、五组练习，并按课程规范区分固定来源事实、
  课程推导和适用边界；学习者正文不含课号、计划、批次、Gate、构建、复审或完成度叙事。
- **Demo 与清单：** 在原 Promise Demo 中加入 Context 条件读取、默认值、外层 provider 更新和最近内层
  provider 展示；保留 Promise 成功、失败、恢复与父级重渲染状态机。entry manifest、Demo manifest、
  Track、前置课程及 prerequisite 已同步，新公开 Demo ID 为
  `react.core.learn.advanced.use-resource-reading.resource-reading-demo`，源码区展示运行中的 TSX、TS、
  CSS 三个文件，CSS 未使用 `grid`、`gap` 或负字距。
- **进度迁移：** `progress-migrations.ts` 新增旧 ID 到新目标的迁移组；旧课单独完成不会自动完成新增
  Context 范围，新旧课程均完成时只保留新目标，最近访问和历史来源按 schema 规则迁移，重复应用保持幂等。
  调研盘点路径同步为 `learn/use-resource-reading.md`，旧 URL 不建立重定向。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、`npm run build`、
  定向 `git diff --check` 和生产叙事/CSS 禁区扫描均通过；全仓 `format:check` 仍只报告四个 A08 范围外
  既有 Reference 索引文件。
- **浏览器：** Playwright 在 `1440x900`、`390x844` 与 `390x844 + 32px` 根字号验证 Context 三种树位置、
  外层更新、条件关闭、Promise pending/fulfilled/rejected/恢复、父级重渲染和源码展开；console
  error/warning 为 `0`，无横向溢出、裁切或 4xx/5xx 请求。临时迁移验证覆盖旧课单独完成、完整迁移、
  最近访问和重复应用幂等。
- **审查：** 首轮独立复审发现正文编号、源码推导分层、进度迁移映射和调研盘点路径问题；修复后由同一
  复审代理复核，最终为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `54/74`，知识课 `46/62`，实战课 `8/12`。下一课为 AL2“实战：异步报告查看器”。

### 11.55 AL2 执行日志（2026-08-17）

- **目标与范围：** 新增 `react.core.learn.advanced.lab-lazy-report-viewer`，左侧标题为“实战：异步报告查看器”。
  课程组合 `lazy`、两层 Suspense、`use(promise)` 与分层 Error Boundary，覆盖代码等待、数据等待、
  局部失败、fallback 继续失败、稳定身份与分层重试；不扩展到服务端渲染、Transition、远程请求、
  生产缓存或第三方数据框架。
- **调研与正文：** 依据 React `19.2` 官方 `lazy`、Suspense、`use`、Component Error Boundary、
  State/key 文档，固定 react.dev 文档提交、React `v19.2.8` 源码和 `@types/react@19.2.18` 完成调研。
  正文以十五个连续根级章节讲清组件树、Promise 三态、边界替换范围、三种身份、分层重试和 TypeScript
  合同，包含十个完整易错点与四组可观察练习；学习者正文不含课号、计划、批次、Gate、复审或完成度叙事。
- **Demo 与清单：** 异步报告查看器用可控本地模块 gate 和报告 Promise 展示代码 pending、数据 pending、
  成功、代码失败、数据失败、局部重试、整次重建和外层边界接管。entry manifest、Demo manifest 与 Track
  已接线；运行中的主 TSX、lazy 面板、模块 loader、报告资源和 CSS 共五个文件均进入源码展示，CSS 未使用
  `grid`、`gap` 或负字距。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、正文生产叙事与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  构建转换 `1859` 个模块。全仓 `format:check` 仍只报告四个本课范围外的既有 Vite/Vue Reference 索引文件。
- **浏览器：** Playwright 验证代码 pending → 数据 pending → 成功、父级普通重渲染身份稳定、数据失败
  的资源/边界局部重试、代码失败的新 lazy 重试，以及内层 fallback 失败由外层边界接管。冷进入代码 pending
  时 loader 与 Promise 计数均为 `1`，新 lazy 重试时 loader 增为 `2`；`1440x900`、`390x844` 与
  `390x844 + 32px` 根字号下无横向溢出，console error/warning 与 4xx/5xx 请求均为 `0`。
- **审查：** 首轮独立复审发现易错项数量与字段、分层重试叙述、选择 handler 注释、settle 控件、pending
  loader 计数和当前 `reportId` 观测问题；逐项修复并复跑同一反馈环后，由同一复审代理完整重查，最终为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `55/74`，知识课 `46/62`，实战课 `9/12`。下一课为 A09“Transition 与 pending UI”。

### 11.56 A09 执行日志（2026-08-17）

- **目标与范围：** 将 `react.core.learn.advanced.start-transition-background-update` 合并到
  `react.core.learn.advanced.use-transition-pending-action`，左侧标题统一为“Transition 与 pending UI”。
  正文覆盖 standalone `startTransition`、`useTransition`、同步与异步 Action、pending、`await` 后重新
  包裹、受控输入、Suspense、Error Boundary 和异步顺序限制，不扩展到请求队列、缓存、事务或服务端能力。
- **调研与正文：** 依据 React `19.2` 官方 `startTransition`、`useTransition`、Suspense、Error Boundary
  文档，固定 react.dev 文档提交、React `v19.2.8` 源码/测试和 `@types/react@19.2.18` 完成调研。正文使用
  十一个连续根级章节，包含十个八字段易错项、三组可观察练习和独立的源码推导与适用场景；学习者正文
  不含课号、计划、任务、批次、Gate、复审或完成度叙事。
- **Demo 与清单：** 同一课程挂载 standalone 后台视图和 pending Action 两套既有同源 Demo，分别展示
  TSX、TS、CSS 三个真实运行文件；两个公开 Demo ID 均迁移到目标课程前缀。旧课程退出 entry manifest
  与 Track，目标 entry、Track、Demo manifest 及相邻 prerequisite/related 已同步，退出 ID 不再被公开
  关系引用，重复关系已清除。
- **进度迁移：** 当前迁移组同时包含目标原有 ID 与被吸收旧 ID。`/tmp` 临时 Vitest 验证双侧完成时新目标
  保持完成，任一单侧完成时只进入 `legacyCompletedEntryIds`，旧 ID 最近访问迁移到目标 ID，其他课程
  状态不受影响，重复应用保持幂等；临时资产已清理。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、完整
  `npm run build`、目标文件定向 Prettier 与限定 `git diff --check` 均通过；构建转换 `1859` 个模块。
  全仓 `format:check` 仍只报告四个本课范围外的既有 Vite/Vue Reference 索引文件。
- **浏览器：** Playwright 验证 standalone 输入与视图切换、Action 次数、无 pending 信号，以及异步 Action
  的 `idle -> waiting/pending -> final panel -> idle`、pending 期间旧面板保留、普通 State 标记和两套源码
  展开。`1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无横向溢出或文字裁切，console
  error/warning 为 `0`，`555` 个静态请求全部为 `200`。
- **审查：** 首轮独立复审发现标题编号、源码推导章节、Suspense 合同、A10 重复关系和 Demo loader 重复
  实现问题；逐项修复并复跑反馈环后，由同一复审代理完整重查，最终为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `56/74`，知识课 `47/62`，实战课 `9/12`。下一课为 A10“useDeferredValue 与
  陈旧内容”。

### 11.57 A10 执行日志（2026-08-17）

- **目标与范围：** 完成 `react.core.learn.advanced.use-deferred-value-stale-content`，左侧标题与
  正文标题统一为“useDeferredValue 与陈旧内容”。只讲解 deferred 值、stale UI、Suspense
  旧内容保留与相关选型边界，不扩展到网络请求协议、数据缓存、路由、RSC 或内部调度实现。
- **调研与正文：** 依据 React `19.2` 官方 `useDeferredValue`、`startTransition`、Suspense 与
  React 19 发布说明，固定 `react.dev@383a1e9239c8...`、React/React DOM
  `19.2.8@1dd4ecbdabf...` 及 `@types/react@19.2.18` 完成调研。正文包含十二个连续根级章节、
  九个完整易错项和三组独立练习，覆盖 API 与类型、`initialValue`、两阶段 render、可中断性、
  Effect 提交、Suspense、`memo`、对象身份、Transition、debounce/throttle 与网络边界；学习者正文
  不含课号、计划、任务、批次、Gate、复审或完成度叙事。
- **Demo 与登记：** 保留实例级本地 gate，确定性展示最新 query、deferred query、已显示结果和
  Effect commit 从旧值追上新值；不使用网络、timer、随机数或忙循环。公开 Demo ID、entry loader、
  Track 和 prerequisite 关系已核对。源码区按固定顺序展示真实运行的 TSX、TS 与 CSS，浏览器与
  磁盘拼接均为 `14627` 字符、`15785` 字节，SHA-256 为
  `180931f9d44f0a957bc617bd5d8ae1841f01b4eb67ea5dc1227c8b369bbae16e`。
- **质量命令：** `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e`、完整
  `npm run build`、目标文件定向 Prettier 与限定 `git diff --check` 均通过；最终构建转换
  `1861` 个模块。全仓 `format:check` 仍只报告四个本课范围外的既有 Vite/Vue Reference 索引文件。
- **浏览器：** Playwright 在 `1440x900`、`390x844` 与 `390x844 + 32px` 根字号下验证
  stale 阶段的最新值已更新，deferred 值、结果与 Effect commit 保留旧值且 fallback 为 `0`；
  推进后三者追上最新值。键盘输入、Tab 与 Enter 均可完成交互，无页面或 Demo 横向溢出、
  按钮裁切或文字遮挡；console error/warning 均为 `0`，最终 `568` 个静态/HMR 请求全部为 `200`。
- **审查：** 独立复审完整核对课程结构、教学事实、易错项、练习、调研禁区、Demo 状态机、
  同源展示、中文注释与 CSS 禁令，最终为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `57/74`，知识课 `48/62`，实战课 `9/12`。下一课为 A11“Activity 隐藏与
  状态恢复”。

### 11.58 A11 执行日志（2026-08-17）

- **目标与范围：** 完成 `react.core.learn.advanced.activity-hidden-state-restoration`，左侧标题与正文
  标题统一为“Activity 隐藏与状态恢复”。只讲解 visible/hidden、State 与 DOM 保留、Effect 清理与
  重建、hidden 更新优先级、嵌套边界、可访问性和资源成本，不扩展到 Router 缓存、持久化、内部 lane、
  Fiber 或固定调度时序。
- **调研与正文：** 依据 React `19.2` 官方 Activity Reference 与发布说明、固定
  `react.dev@383a1e9239c8...`、React `19.2.8@1dd4ecbdabf8...` 官方源码和测试、
  `@types/react@19.2.18` 及 W3C 程序化隐藏定义完成调研。正文使用十六个连续根级章节，包含十个完整
  易错项与三组练习，覆盖公共 API、类型、默认 mode、name、State/DOM、Effect、预渲染、隐藏更新、
  嵌套、可访问性和使用选择；学习者正文不含课号、计划、任务、批次、Gate、复审或完成度叙事。
- **Demo 与登记：** 隐藏工作区从 cold-hidden 开始，分别观察 React State、未受控 textarea、稳定宿主
  DOM 身份、父级 revision 与 Effect setup/cleanup；支持显隐、hidden 更新、DOM 快照和按 key 重建。
  entry manifest、Track、前置与 related 已核对；Demo manifest 使用统一 source bundle loader，同源展示
  当前 TSX 与 CSS，CSS 未使用 `grid` 或 `gap`。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、正文生产叙事与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  修复来源登记后的最终构建转换 `1865` 个模块。
- **浏览器：** Playwright 验证初始 hidden 宿主 DOM 已连接且 `display: none`，显示后修改 State 与未受控
  草稿，隐藏后节点身份与两类状态均保留，hidden revision 最终更新到 `2`，再次显示后 State、草稿、
  revision 和 DOM 身份一致，Effect 按显隐阶段完成 cleanup 与新一轮 setup。固定 React 测试来源已在
  页面渲染；`1440x900`、`390x844` 与 `390x844 + 32px` 根字号下页面和 Demo 横向溢出均为 `0`，
  控件未越界，console 为 `0 error / 0 warning`。
- **审查：** 首轮独立复审发现正文使用 React 19.2.8 官方测试作为实现旁证，但 frontmatter 与参考资料
  未登记该来源；补齐固定 commit、claims 与参考链接并复跑反馈环后，由同一代理复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `58/74`，知识课 `49/62`，实战课 `9/12`。下一课为 AL3“实战：并发搜索
  工作区”。

### 11.59 AL3 执行日志（2026-08-18）

- **目标与范围：** 新增 `react.core.learn.advanced.lab-concurrent-search-workspace`，左侧标题与正文标题统一为
  “实战：并发搜索工作区”。只组合 Transition、`useDeferredValue`、Suspense、`use` 和 Activity 的公开
  合同，不扩展到网络缓存库、服务端搜索、SSR/RSC、Fiber、调度器内部或固定调度时序。
- **调研与正文：** 依据 React `19.2` 官方 Reference、固定
  `react.dev@383a1e9239c8...`、React `19.2.8@1dd4ecbdabf8...` 官方源码与测试及
  `@types/react@19.2.18` 完成独立调研。正文使用十六个连续根级章节、十个完整易错项和三组练习，覆盖
  同步输入、deferred stale、稳定 Promise、首次 fallback、异步 Action、pending、Activity 显隐恢复、资源
  身份和确定性验证；学习者正文不含课号、计划、任务、批次、Gate、复审或完成度叙事。
- **Demo 与登记：** 新增确定性本地并发搜索工作区；每次搜索提交生成新的 requestId 和 pending Promise，
  同一请求在 render 重试间复用资源，重复 query 与重新挂载不会读取旧兑现结果。详情选择每次生成单调递增
  Action 身份，pending 时真实禁用结果入口并保留输入、搜索、显隐和重建操作；卸载和重建均清理 gate。
  entry manifest、Demo manifest、Track、前置与 related 已核对，五条搜索记录只有一个数据源。
- **源码同源：** 源码区按 TSX、TS、CSS 的固定顺序展示真实运行文件；页面与磁盘拼接均为 `27184` 字符、
  `29192` 字节，SHA-256 均为
  `cbca84a7c2ecf95e6e358d9adabfc1107163553ff412b2d6382c31225dc5d3f6`。CSS 未使用 `grid`
  或 `gap`。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、正文生产叙事与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1875` 个模块。全仓 `format:check` 仍只报告四个本课范围外的既有 Vite/Vue Reference
  索引文件。
- **浏览器：** Playwright 验证首次搜索必须进入 fallback；`A→B→A→B` 每次不同详情选择都重新进入
  pending 并手动放行；pending 期间五个结果按钮全部禁用，普通控件保持可用；离开课程再返回后，首次
  `suspense` 查询仍从冷启动开始且只返回对应的一条结果。`1440x1000`、`390x844` 与
  `390x844 + 32px` 根字号下页面和 Demo 横向溢出、元素越界与控件文字裁切均为 `0`，最终 console 为
  `0 error / 0 warning`。
- **审查：** 独立复审先后发现卸载资源、重复 Action 身份、pending 禁用、易错项结构、研究项数量与版本、
  研究状态机、重复目录和无效 ref 问题；逐项修正并重跑同一反馈环后，由同一代理复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `59/74`，知识课 `49/62`，实战课 `10/12`。下一课为 A12“表单 Action 与提交
  状态”。

### 11.60 A12 执行日志（2026-08-18）

- **目标与范围：** 完成 `react.core.learn.advanced.form-action-client-submission`，左侧标题与正文标题
  统一为“表单 Action 与提交状态”，合并原 `use-form-status-parent-scope` 内容。只讲 function Action、
  FormData、submitter、成功重置、拒绝、`useFormStatus` 四字段与父 form 作用域，不扩展到服务端
  Action、网络协议、持久化、事务、乐观更新或 React 内部调度实现。
- **调研与正文：** 依据 React `19.2` 官方 Reference 与发布说明、固定 React `19.2.8` 源码和测试、
  HTML/XHR Standard 及 WAI-ARIA `status` 规范完成调研。正文使用十六个连续根级章节、十个完整易错项
  与四组练习，区分 function Action 的 POST caveat、`useFormStatus().method` 的 DOM 观察值和真实网络
  请求；学习者正文不含课号、计划、路线、任务、批次、Gate、复审、完成度或篇幅叙事。
- **Demo、登记与迁移：** Action Demo 确定性展示父 `action`、function `formAction`、FormData 快照、
  pending、成功自动 reset、受控 State 保留、reject/Error Boundary 与 remount 恢复；作用域 Demo 使用
  两个合法兄弟 form 展示五个 Hook 调用点的四字段和隔离关系。entry manifest、Demo manifest、Track、
  prerequisite 与 related 已核对；迁移组包含目标 ID 与原 `use-form-status-parent-scope` ID，旧 URL 不
  重定向并显示内容不可用。
- **源码同源：** 两个源码面板均按 TSX、CSS 顺序展示真实运行文件。Action Demo 的页面与磁盘拼接均为
  `20791` 字符、`22205` 字节，SHA-256 为
  `43f18c1abf1f959977a3a049f837c38c09486ed01e3b7dfa4f789dbabbae4174`；作用域 Demo 均为
  `13997` 字符、`14769` 字节，SHA-256 为
  `f50d137a485e67ab210e17ee668e2744b221cc7d3fc71ad10a59c30158975b13`。CSS 未使用 `grid` 或
  `gap`。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、正文生产叙事与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1875` 个模块。全仓 `format:check` 仍只报告四个本课范围外的既有 Vite/Vue Reference
  索引文件。
- **浏览器：** Playwright 验证父 Action 与覆盖 Action 的提交快照、两次成功 reset、pending 期间普通
  更新可用、reject 不增加 reset、Error Boundary fallback 与新 form 恢复；甲乙提交期间只有目标 form
  后代显示 `pending/data/method/action`，调用账本即时可读，settle 后恢复 idle，DOM 无嵌套 form。
  `1440x900`、`390x844` 与 `390x844 + 32px` 根字号下页面和 Demo 横向溢出、元素越界与按钮裁切均为
  `0`；冷页面无失败请求或错误响应，最终 console 为 `0 error / 0 warning`。
- **审查：** 首轮独立复审发现作用域 Demo 的 Action 调用账本在 pending 时延迟显示，以及两个源码
  loader 重复实现已有拼接逻辑；修正即时账本和统一 helper、复跑同一反馈环后，由同一代理复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `60/74`，知识课 `50/62`，实战课 `10/12`。下一课为 A13“useActionState 与
  Action 结果”。

### 11.61 A13 执行日志（2026-08-18）

- **目标与范围：** 完成 `react.core.learn.advanced.use-action-state-result-queue`，左侧标题与正文标题
  统一为“useActionState 与 Action 结果”。只讲前次 State、payload、顺序 Action 队列、`isPending`、
  业务错误结果和异常边界，不展开乐观更新、外部 Store、同步 DOM 提交或服务端持久化。
- **调研与正文：** 依据 React `19.2` 官方 Reference、固定 React `19.2.8` 源码、HTML/XHR Standard
  与 WAI-ARIA `status` 规范完成独立调研。正文覆盖 API 三元组、TypeScript 重载、`initialState`、
  `(previousState, payload)`、Action 上下文、同步/异步结果、FormData、顺序队列、错误建模、重置与取消、
  可访问反馈及相关状态工具边界；使用二十五个连续编号根级章节、十个完整易错项和四组练习。学习者
  正文不含课号、计划、路线、任务、批次、复审、完成度或篇幅叙事。
- **Demo、登记与源码同源：** 结果队列 Demo 使用可手动继续的本地 Promise，确定性展示两项 Action
  按顺序得到 `0 -> 1`、`1 -> 2`，以及空备注返回 `invalid` 业务 State。Demo 不依赖网络、timer、
  随机数或后续课程的 `flushSync`；源码面板通过公共 `loadDemoSourceBundle` 按 TSX、CSS 顺序展示真实
  运行文件，课程与 Demo manifest 登记保持一致。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、正文生产叙事与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1877` 个模块。
- **浏览器：** Playwright 在生产预览验证两项 Action 最终 `revision=2`、决策“需要修改”、备注保留、
  历史顺序正确且 pending 回到 idle；空备注提交后得到 `invalid`、`revision=0` 和“备注不能为空”，受控
  输入保持为空。源码区同时包含真实 TSX 与 CSS；`1440x900`、`390x844` 与 `390x844 + 32px` 根字号
  下页面和 Demo 横向溢出均为 `0`，最终 console 为 `0 error / 0 warning`，无失败请求。
- **审查：** 首轮独立复审发现标题编号、推导章节、学习目标数量、`flushSync` 跨课范围和无效 button
  `action` 示例问题；逐项修正并重跑同一反馈环后，由同一代理复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `61/74`，知识课 `51/62`，实战课 `10/12`。下一课为 A14“useOptimistic
  乐观状态”。

### 11.62 A14 执行日志（2026-08-18）

- **目标与范围：** 完成 `react.core.learn.advanced.use-optimistic-pending-state`，左侧标题与正文标题
  统一为“useOptimistic 乐观状态”。只讲基础 State、optimistic State、纯 `updateFn`、Action 约束、
  成功承接、失败回滚、稳定身份、基础值重放与并发边界，不把请求、持久化、事务或冲突合并写成 Hook
  能力。
- **调研与正文：** 依据 React `19.2` Reference、React 19 发布说明、固定 React `19.2.8` 源码与官方
  测试、`@types/react@19.2.18` 完成独立调研。正文覆盖两种重载、TypeScript 类型、当前基础值、多个
  optimistic 输入、函数式 updater、成功与两类失败、临时 ID、稳定 `key`、去重、多个 Action，以及
  `useState`、`useTransition`、`useActionState`、`useFormStatus` 和数据层的职责边界；使用十八个连续编号
  根级章节、九个完整易错项和四组练习。
- **Demo、登记与源码同源：** 乐观清单 Demo 使用可手动结算的本地 Promise，确定性展示 `1 -> 3` 的
  临时输入、基础值变化后的 `2 -> 4` 重放、成功后的 `4/4` 确认和失败后的 `2/2` 回滚；等待期间普通
  State 仍可更新。卸载时会结算当前 Action，并阻止卸载后的 State 更新。源码面板通过公共
  `loadDemoSourceBundle` 按 TSX、CSS 顺序展示真实运行文件。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、学习者内容禁区与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1877` 个模块。
- **浏览器：** Playwright 验证临时输入、基础值重放、普通 State 更新、成功承接、失败回滚，以及 pending
  期间离开页面后的清理与返回冷启动。源码面板与磁盘均为 `11887` 字符、`12837` 字节，SHA-256 为
  `accb7dc5c41e68f02b24dac098ca0d5b5e5f9ed9264cfcd566b630535164315d`；`1440x900`、
  `390x844` 与 `390x844 + 32px` 根字号下页面和 Demo 横向溢出、按钮裁切均为 `0`，最终 console 为
  `0 error / 0 warning`，131 个请求均为成功响应或缓存命中。
- **审查：** 首轮独立复审发现卸载清理、固定源码登记、API import、无 reducer 函数式 updater、易错项
  验证字段和失败文案共六项问题；逐项修正并复跑反馈环后，由同一代理复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `62/74`，知识课 `52/62`，实战课 `10/12`。下一课为 AL4“实战：异步审核队列”。

### 11.63 AL4 执行日志（2026-08-18）

- **目标与范围：** 完成 `react.core.learn.advanced.lab-action-review-queue`，左侧标题与正文标题统一为
  “实战：异步审核队列”。整合 Form Action、`useFormStatus`、`useActionState` 和 `useOptimistic`，只在
  本地审核场景讲四类 State 的所有权、成功承接、业务失败回退、异常边界与稳定身份，不把权限、事务、
  持久化、幂等或跨客户端冲突写成 React 能力。
- **调研与正文：** 依据 React `19.2` Reference、React 19 发布说明、固定 React `19.2.8` 源码与官方
  测试、HTML/XHR Standard、WAI-ARIA `status` 与 WCAG ARIA22 完成独立调研。正文覆盖组件树与 form
  后代作用域、FormData 缩窄、Action 结果 State、字段级错误、optimistic 纯更新、基础 State 承接、
  业务失败与异常失败、多记录身份、Action 队列边界、可访问反馈及响应式布局；使用十八个连续编号根级
  章节、八个完整易错项和五组练习。学习者正文不含课号、计划、路线、任务、批次、复审、完成度或篇幅
  叙事。
- **Demo、登记与源码同源：** 异步审核队列 Demo 使用三条固定记录和可手动结算的本地 Promise，确定性
  展示空备注字段失败、规则版本业务失败和成功确认三条路径。仅备注校验设置 `aria-invalid`；业务失败不
  修改基础队列，成功使待审核数 `3 -> 2`、revision `0 -> 1`。`ReviewSettlementControls` 保持在 form
  后代中读取本次提交，课程、Demo manifest 与 Track 登记一致。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、学习者内容禁区与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1891` 个模块。全仓 `format:check` 仍只被四个本课范围外的既有 Reference 索引文件
  阻断。
- **浏览器与源码同源：** Playwright 验证空备注时 `aria-invalid=true` 且 revision 不增加、规则失败时
  `aria-invalid=false` 且基础队列不变、成功时待审核数 `3 -> 2` 且 revision `0 -> 1`。源码面板与磁盘
  拼接均为 `20833` 字符、`21993` 字节，SHA-256 为
  `b36497ff051c64f29e188480ea87cd2cd4023a310d39ff0f35dbcddc083b0601`；`1440x900`、`390x844`
  与 `390x844 + 32px` 根字号下页面和 Demo 横向溢出、控件裁切均为 `0`，最终 console 为
  `0 error / 0 warning`。
- **审查：** 独立复审先后发现字段错误归属、form status 后代作用域、pending payload 解析复用、
  结果 State 示例完整性与调研类型合同同步问题；逐项修正并复跑反馈环后，由同一代理复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `63/74`，知识课 `52/62`，实战课 `11/12`。下一课为 A15“useSyncExternalStore
  快照合同”。

### 11.64 A15 执行日志（2026-08-18）

- **目标与范围：** 完成 `react.core.learn.advanced.use-sync-external-store-snapshot`，左侧标题与正文标题
  统一为“useSyncExternalStore 快照合同”。只讲外部 Store 所有权、订阅与同步读取、不可变缓存快照、
  `Object.is`、订阅身份、对称 cleanup、可变底层数据适配和 SSR/hydration 边界，不扩展到 selector
  库、远程缓存或状态库架构。
- **调研与正文：** 依据 React `19.2` Reference、固定 React `19.2.8` Hook 与服务端实现、官方 shared
  测试和 React 18 发布说明完成独立调研。正文覆盖四个 API 角色、最小 Store、通知与重读顺序、同值
  通知、版本缓存、快照粒度、Store 切换、服务端初值、Transition 与 Suspense 边界；使用十八个连续
  编号根级章节、九个完整易错项和五组练习。学习者正文不含课号、计划、路线、任务、批次、复审、
  完成度或篇幅叙事。
- **Demo、登记与源码同源：** 双 Reader Demo 确定性展示有效发布、同值通知、外壳更新、卸载期间发布、
  重新挂载与重建实验。`getSnapshot` 保持纯读取；诊断区记录 Effect setup，并明确它不等于 render
  次数。课程、Demo manifest 与 Track 登记一致，源码面板通过公共 `loadDemoSourceBundle` 按 TSX、
  CSS 顺序展示真实运行文件。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、学习者内容禁区与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1893` 个模块。全仓 `format:check` 仍只被四个本课范围外的既有 Reference 索引文件
  阻断。
- **浏览器与源码同源：** Playwright 验证有效发布后 revision `0 -> 1`、同值通知不增加 revision、
  外壳更新不重新订阅、卸载后 listener 归零、卸载期间发布不唤醒旧 Reader、重新挂载读取最新快照，
  以及离页返回后的完整冷启动。源码面板与磁盘拼接均为 `19056` 字符、`20586` 字节，SHA-256 为
  `020f1f615ded919217b3c2b333313b2a880f8a84853bb25b54f8ee773f21317e`；`1440x900`、
  `390x844` 与 `390x844 + 32px` 根字号下页面和 Demo 横向溢出、控件裁切均为 `0`，最终 console 为
  `0 error / 0 warning`。
- **审查：** 首轮独立复审发现官方同值测试时序、学习目标数量、源码 loader 重复、`getSnapshot` 副作用
  和 Reader render 误标问题；逐项修正并复跑反馈环后，由同一代理复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `64/74`，知识课 `53/62`，实战课 `11/12`。下一课为
  A16“useImperativeHandle”。

### 11.65 A16 执行日志（2026-08-18）

- **目标与范围：** 完成 `react.core.learn.intermediate.use-imperative-handle`，保留稳定 ID，将课程阶段后移为
  advanced，左侧标题与正文标题统一为“useImperativeHandle”。只讲自定义 handle、外部 Ref 与内部 DOM
  Ref、React 19 `ref` prop、依赖和生命周期边界，不把持续业务状态、完整 DOM 或内部实现细节暴露给调用方。
- **调研与正文：** 将调研迁移到 advanced 目录，依据 React `19.2` Reference、React 19 发布说明、固定
  React `19.2.8` 源码与官方测试、`@types/react@19.2.18` 完成核验。正文覆盖 API 签名、对象与 Callback
  Ref、TypeScript 合同、`createHandle` 纯度、依赖比较、句柄身份、卸载清理、React 18 `forwardRef`
  兼容边界、组件库接口设计、常见错误和五组练习；学习者正文不含课号、计划、路线、任务、批次、复审、
  完成度或篇幅叙事。
- **Demo、登记与前置：** 命令句柄 Demo 只公开 `focus`、`selectAll` 与 `getLabel`，确定性展示首次句柄、
  无关外壳更新保持同一对象、`label` 变化替换对象并读取新值、输入聚焦与全选、卸载清空 Ref、重新挂载
  生成新句柄。课程与 Demo manifest、Track 登记保持一致；中级 `useEffect` 的真实前置已改为 `useRef`，
  不再依赖后移后的课程。
- **源码同源：** 源码面板通过公共 `loadDemoSourceBundle` 按 TSX、CSS 顺序展示真实运行文件；页面与磁盘
  拼接均为 `13708` 字符、`15394` 字节，SHA-256 均为
  `c72190862529b977cf17987afda8dbe96d0317b792e2071dae85b37d7eacddfd`。CSS 未使用 `grid` 或
  `gap`。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、学习者内容禁区与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1893` 个模块。
- **浏览器：** Playwright 验证首次记录为新句柄，无关外壳更新保持同一对象，切换 `label` 后得到不同对象
  且命令读取最新标签；`focus` 聚焦最新输入框，`selectAll` 得到 `0..15`，卸载后 `ref.current = null`，
  重挂载获得新对象，离页返回恢复冷态。`useEffect` 页面只显示 `useRef` 为建议前置；`1440x900`、
  `390x844` 与 `390x844 + 32px` 根字号下页面、Demo 和源码容器均无横向溢出或控件裁切，console 为
  `0 error / 0 warning`。
- **审查：** 首轮独立复审发现后移课程仍被中级课依赖、精确 TypeScript 合同缺少固定类型来源登记和
  Demo 证据字段命名不准确；逐项修正并复跑反馈环后，由同一代理复核为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `65/74`，知识课 `54/62`，实战课 `11/12`。下一课为 A17“useLayoutEffect”。

### 11.66 A17 执行日志（2026-08-18）

- **目标与范围：** 完成 `react.core.learn.intermediate.use-layout-effect`，保留稳定 ID，将课程阶段后移为
  advanced，左侧标题与正文标题统一为“useLayoutEffect”。只讲已提交 DOM 的绘制前测量、同步更新、
  阻塞成本、Effect 选择与 SSR 边界，不展开 CSS-in-JS 实现、Observer、动画或 React 私有调度细节。
- **调研与正文：** 将调研迁移到 advanced 目录，依据固定 React `19.2` 文档、React `19.2.8` 源码与
  官方测试、`@types/react@19.2.18`、CSSOM View 和浏览器性能资料完成核验。正文覆盖 API 合同、两遍
  render、DOMRect、依赖与重新测量、性能、Strict Mode、SSR/hydration、TypeScript 和组件库边界；使用
  二十个连续编号根级章节、九个完整易错项和五组练习。学习者正文不含课号、计划、路线、批次、复审、
  完成度或篇幅叙事。
- **Demo、登记与前置：** 绘制前测量 Demo 确定性展示宽窄模式、长短内容、真实宽高与测量轮次；宽度或
  内容变化触发重新测量，无关外壳更新不增加测量轮次，读数与几何标尺共用同一份 measurement State。
  课程与 Demo manifest、Track、前置和 related 登记保持一致，历史计划中的调研路径已同步迁移。
- **源码同源：** 源码面板通过公共 `loadDemoSourceBundle` 按 TSX、CSS 顺序展示真实运行文件；页面与磁盘
  拼接均为 `8745` 字符、`9441` 字节，SHA-256 均为
  `18cf4e8d01fa5b222e8dd2ac4527ee22bc4bc992a3077f58dba41b9c57ac4d11`。CSS 未使用 `grid` 或
  `gap`。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、旧调研路径与学习者内容禁区扫描、CSS
  禁区扫描、`npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整
  `npm run build` 均通过；最终构建转换 `1893` 个模块。
- **浏览器：** Playwright 验证宽窄与长短内容切换后读数和 DOMRect 误差不超过 `1px`，几何标尺与同一
  State 一致，无关外壳更新不触发测量，离页返回恢复冷态。`1440x900`、`390x844` 与
  `390x844 + 32px` 根字号下页面和 Demo 横向溢出均为 `0`，宽度、高度标签与三个控制按钮无裁切；源码
  仅在自身容器横向滚动，最终 console 为 `0 error / 0 warning`。
- **审查：** 独立复审先后发现历史调研路径、测量值名称、Effect 选择、`[]` 生命周期描述和新增来源登记
  问题；逐项修正并复跑同一反馈环后，由同一代理复核为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `66/74`，知识课 `55/62`，实战课 `11/12`。下一课为 A18“hydrateRoot 与标记
  一致性”。

### 11.67 A18 执行日志（2026-08-18）

- **目标与范围：** 完成 `react.core.learn.advanced.hydrate-root-markup-identity`，左侧标题与正文标题
  统一为“hydrateRoot 与标记一致性”。只讲既有 React-compatible HTML 的接管、首次标记一致性、
  Root options、错误通道、后续 `root.render` 与 `root.unmount()`；隔离 fixture 不冒充真实 SSR，也不
  展开 streaming、selective hydration、Server Components 或框架部署。
- **调研与正文：** 依据固定 React `19.2` 文档快照、React / React DOM `19.2.8` 源码与官方测试、
  `@types/react-dom@19.2.4` 和 WHATWG HTML Standard 完成独立调研。正文覆盖四个公开 options、匹配
  标记、mismatch 来源与修复、两遍客户端输出、Root 生命周期、TypeScript 合同、多 Root 与 `useId`、
  错误信息建模和 fixture 边界；使用十六个连续编号根级章节、十个完整易错项和五组练习。学习者正文
  不含课号、计划、路线、批次、复审、完成度或篇幅叙事。
- **Demo、登记与源码同源：** 隔离 Demo 通过可信静态 `srcDoc` 先建立独立 `about:srcdoc` Document，
  再接管其中的 Root；确定性展示静态按钮无效、匹配时复用 Main/Button Node、事件与 State 接管、
  `root.render` 保留 State 与 Node 身份、mismatch/caught/uncaught 分流，以及 unmount 后容器清空、旧
  Node 断开和旧 Root 抛错。课程、Demo manifest、Track、前置和 related 登记一致。源码面板按 TSX、
  HTML、CSS 顺序展示真实运行文件；页面与磁盘均为 `34878` 字符、`36630` 字节，SHA-256 均为
  `2fa65c43d8307541768e91ed80bd77434bd051b7429eb5161119859b855608cf`。CSS 未使用 `grid` 或
  `gap`。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、学习者内容与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1893` 个模块。构建反馈环曾发现标题中的未转义 `about:srcdoc` 被解析为
  `textDirective`，改为行内代码后原命令转绿。全仓 `format:check` 仍只被四个本课范围外的既有
  Vite/Vue Reference 索引文件阻断。
- **浏览器：** Playwright 在生产预览完整验证 match、`root.render`、mismatch、caught、uncaught、
  unmount 六条路径；三个错误场景只增加对应通道，卸载后 `childElementCount=0`、旧按钮
  `isConnected=false`、旧按钮点击不再更新，旧 Root 在生产构建返回 React error `#409`。`1440x1000`、
  `390x844` 与 `390x844 + 32px` 根字号下页面和 iframe 横向溢出均为 `0`，最终 console 为
  `0 error / 0 warning`，pageerror 为 `0`。
- **审查：** 首轮独立复审发现正文与调研稿的 `Container` 类型遗漏 `DocumentFragment`；同步修正并
  复跑定向格式、类型与完整构建后，由同一代理复核为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `67/74`，知识课 `56/62`，实战课 `11/12`。下一课为 A19“flushSync 同步提交
  边界”。

### 11.68 A19 执行日志（2026-08-18）

- **目标与范围：** 完成 `react.core.learn.advanced.flush-sync-dom-commit`，左侧标题与正文标题统一为
  “flushSync 同步提交边界”。只讲外部同步 callback、返回前 DOM 提交、State 快照、Effect、Suspense、
  性能成本、禁止调用位置与最后手段判断，不扩展到浏览器渲染流水线、React 调度内部或第三方布局库。
- **调研与正文：** 依据固定 React `19.2` Reference、React DOM `19.2.8` 发布提交、官方源码与测试、
  `@types/react-dom@19.2.4` 完成独立调研，并如实区分 Reference 的 `undefined` 与当前类型、实现转发的
  callback 返回值。正文使用二十个连续编号根级章节、十个完整易错项和五组练习；B16“React 更新模型”
  只保留 setter、State 快照与 DOM commit 前置，不重复本课完整教学。学习者正文不含课号、计划、路线、
  任务、批次、复审、完成度或篇幅叙事。
- **Demo、登记与源码同源：** 确定性同步 adapter 对比默认 setter 与一次 `flushSync`，分别观察请求版本、
  handler State 快照、callback 末尾 DOM 和事件完成后的已提交 DOM。entry manifest、Demo manifest、
  Track、前置与 related 已核对；源码区按 TSX、CSS 顺序展示真实运行文件，页面与磁盘均为 `11628`
  字符、`12364` 字节，SHA-256 均为
  `927cd210b2f4c74b2d3b96afaf9484cdba557d0cf2c8cf7610163f9a0ed421c6`。CSS 未使用 `grid` 或
  `gap`。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、学习者内容与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1901` 个模块。
- **浏览器：** 默认路径稳定得到“请求 `1`、State 快照 `0`、callback DOM `0`、最终 DOM `1`”；
  `flushSync` 路径得到“请求 `1`、State 快照 `0`、callback DOM `1`、最终 DOM `1`”。`1440x1000`、
  `390x844` 与 `390x844 + 32px` 根字号下页面、Demo 和按钮均无横向溢出或文字裁切，最终 console 为
  `0 error / 0 warning`，pageerror 为 `0`。
- **审查：** 首轮独立复审发现易错项超限、三个 Ref 示例缺少判空、Demo 返回点文案过宽、调研冻结与
  实现不一致以及计划未登记；修正后由同一代理复核，最终为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `68/74`，知识课 `57/62`，实战课 `11/12`。下一课为 A20“React 文档元数据
  提升”。

### 11.69 A20 执行日志（2026-08-18）

- **目标与范围：** 完成 `react.core.learn.advanced.document-metadata-hoisting`，左侧标题与正文标题统一为
  “文档元数据提升”。只讲 React DOM 19.2.8 对 `title`、普通 `meta`、元数据 `link` 的声明、提升、属性
  合同、嵌套重复、原位更新、条件移除、Root 卸载和静态节点所有权；带 `itemProp` 的局部条目元数据留在
  body，不扩展到资源类 link、动态资源加载、路由或服务端框架。
- **调研与正文：** 依据 React `19.2` 官方 title/meta/link Reference、React 19 metadata 发布说明、固定
  React DOM `19.2.8` 实现与官方测试、WHATWG HTML 和 `@types/react@19.2.18` 完成调研。正文覆盖
  `ownerDocument.head`、单一 title 文本、meta 角色、link 提升资格、TypeScript 属性边界、单一 owner、更新
  身份、清理所有权、客户端与服务端边界及 DOM 验证；包含十个完整易错项和五组练习。学习者正文不含课号、
  计划、路线、任务、批次、Gate、复审、完成度或篇幅叙事。
- **Demo、登记与源码同源：** 隔离 Document Demo 使用专属 React Root，展示目录页与课程页的原位更新、嵌套
  声明从 `1/1/1` 增至 `2/2/2`、条件移除后的 `0/0/0/1`、Root 卸载后的 `0/0/0/0`，并保留预先存在的
  静态 head 标记；真实课程页的 title/meta/link 不被触碰。entry manifest、Demo manifest 与 Track 已同步，
  源码面板按 TSX、CSS 顺序展示真实运行文件。磁盘与页面源码均为 `22040` 字符、`23474` 字节，SHA-256
  均为 `74298b13b25bf5421d6c3d6502b689e6a33e220b5ad83f5965085106287f087b`。CSS 未使用 `grid`、`gap` 或负字距。
- **质量命令：** 目标文件定向格式检查、限定 `git diff --check`、学习者内容禁区与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；最终
  构建转换 `1907` 个模块。
- **浏览器：** Playwright 生产预览验证初始 `title/meta/link/itemProp = 1/1/1/1`、课程页切换显示“原节点已更新”、
  嵌套声明计数为 `2/2/2`、移除文档元数据后为 `0/0/0/1`、Root 卸载后所有 React-owned 节点归零且静态标记保留。
  宿主页面 title 始终为 `IT 学习站`；`1440x1000` 与 `390x844` 下页面无横向溢出，Demo 在 200% 文本尺寸下无内部
  裁切。console 错误/警告为 `0`，生产资源响应均为 `200`，离开页面未出现 Root 清理警告。
- **审查：** 已执行独立 Standards/Spec 复审；最终结果记录为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **完成度：** 新路线 `69/74`，知识课 `58/62`，实战课 `11/12`。下一课为 A21“声明式样式资源”。

### 11.70 A21 执行日志（2026-08-18）

- **目标与范围：** 完成 `react.core.learn.advanced.declarative-stylesheet-resources`，左侧标题与正文标题统一为
  “声明式样式资源”。只讲 React DOM 19.2.8 对外链 stylesheet 和资源化内联 style 的资格、放置、
  precedence 分组、href 身份、加载协调、更新与卸载边界；不展开异步脚本、resource hint、
  `useInsertionEffect`、CSS-in-JS 库或打包器样式方案。
- **调研与正文：** 依据 React `19.2` link/style Reference、React 19 stylesheet 发布说明、固定 React DOM
  `19.2.8` 实现与官方测试、WHATWG HTML 和 `@types/react@19.2.18` 完成调研。正文覆盖特殊资源资格、
  link/style 差异、precedence 首次发现顺序、CSS 级联、Suspense 提交协调、href 去重、同 href 属性固定、
  新 href 版本、资源保留、TypeScript 与 DOM 验证；包含十八个连续编号根级章节、八个完整易错项和五组
  练习。学习者正文不含课号、计划、路线、任务、批次、Gate、复审、完成度或篇幅叙事。
- **Demo、登记与源码同源：** 隔离 Document Demo 使用专属 React Root，确定性展示初始 `0/0`、等待阶段
  link `2/0`、style `2/0`、preload `1`，load 后 link `2/1`、style `2/1`、内联资源 `4`；取消重复后为
  `1/1`，同 href 更新仍保留初始内容，新 href 同时保留 v1/v2 并使内联资源增至 `5`。Root 卸载后声明
  归零、DOM 资源与静态标记保留，重建 Document 后可重新进入等待与就绪流程。entry manifest、Demo
  manifest 与 Track 已同步，源码面板按 TSX、CSS 顺序展示真实运行文件；磁盘与页面源码均为 `24330`
  字符、`25723` 字节，SHA-256 均为
  `d15e09ce3db7b1c836ff96f3c2fffdf385f79da71c3af50b6bd833e723656133`。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、学习者内容禁区与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1911` 个模块。全仓 `format:check` 仍只被四个本课范围外的既有 Vite/Vue Reference
  索引文件阻断。
- **浏览器：** Playwright 生产预览验证等待、load、去重、同 href 更新、新 href、卸载和重建七条路径；
  `1440x1000`、`390x844` 与 `390x844 + 32px` 根字号下页面和 Demo 均无横向溢出或按钮裁切，最终
  console 为 `0 error / 0 warning`，最新 `477` 个请求全部返回 `200`。
- **审查：** 已执行独立 Standards/Spec 复审；最终结果记录为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `70/74`，知识课 `59/62`，实战课 `11/12`。下一课为 A22“声明式异步脚本资源”。

### 11.71 A22 执行日志（2026-08-19）

- **目标与范围：** 完成 `react.core.learn.advanced.declarative-async-script-resource`，左侧标题与正文标题统一为
  “声明式异步脚本资源”。保留规划 ID、标题和 async script 责任边界；新增独立调研、正文与隔离 Demo，
  未吸收、移动、合并或删除旧课程。正文只讲特殊资源资格、head 放置、src 身份、去重与一次执行、
  props 固定、新 src、async 时序、事件退出、inline/普通 script、生命周期及客户端/服务端边界。
- **调研与正文：** 依据 React `19.2` script Reference、React 19 async scripts 发布说明、固定 React DOM
  `19.2.8` 实现与官方测试、WHATWG HTML 和 `@types/react@19.2.18` 完成调研。正文包含二十三个连续编号
  根级章节、十个完整易错项和六组结构化练习；内容限定本科范围，学习者正文及可展开 Demo 源码不含课号、
  计划、路线、任务、批次、Gate、复审、完成度或篇幅叙事。
- **Demo、登记与源码同源：** 同源 iframe Demo 分别观察 owner、head DOM 与执行数，确定性验证初始
  `0/0/0-0`、首次 v1 `1/1/1-0`、重复 owner `2/1/1-0`、同 src 改属性仍保留首次
  `data-owner="first"`、owner 归零后 DOM/执行不变、同 document 重挂不重执行、新 src v2 达到
  `1/2/1-1`、带 `onLoad` 的普通 script 位于 body 且不计入 head Resource。Root 卸载后 head `2`、执行
  `1/1`，重建 Document 后全部回到零。entry manifest、Demo manifest 与 Track 已同步为 `71 available`、
  `3 planned`；源码面板按 TSX、HTML、三份同源静态 JS、CSS 顺序展示真实运行文件，磁盘与页面源码均为
  `23770` 字符、`25161` 字节，SHA-256 均为
  `ed8187e956c36012d94189f8dbeff8f50a147d85343a4643cbbbd38e40bb38f7`。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、学习者内容禁区与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；
  最终构建转换 `1918` 个模块。全仓 `format:check` 仍只被四个本课范围外的既有 Vite/Vue Reference
  索引文件阻断。
- **浏览器：** Playwright 生产预览在新构建上复跑完整状态序列；`1440x1000`、`390x844` 与
  `390x844 + 32px` 根字号下页面和 Demo 均无横向溢出、文本溢出或按钮裁切，console 为 `0 error`、
  `0 warning`，三份真实静态脚本请求均返回 `200`。
- **审查：** 独立复审先发现研究冻结记录仍使用重命名前的 fixture 标识，且易错候选数量与课程规范不一致；
  同步为知识语义命名和连续十项后复核通过，最终结果为 `Standards PASS / 0 finding`、`Spec PASS / 0
  finding`。
- **完成度：** 新路线 `71/74`，知识课 `60/62`，实战课 `11/12`。下一课为 A23“资源连接、preload 与
  preinit”。

### 11.72 A23 执行日志（2026-08-19）

- **目标与范围：** 完成 `react.core.learn.advanced.resource-hints`，左侧标题与正文标题统一为“资源提示
  API”。合并三个未发布目标，集中讲解 `prefetchDNS`、`preconnect`、`preload`、`preloadModule`、
  `preinit` 和 `preinitModule` 的选择、参数与生效边界；不扩展到 RSC、server/static 深入实现、路由、
  框架封装或通用性能优化。
- **调研与正文：** 依据 React `19.2` 六个 API Reference、React 19 资源预加载说明、固定 React DOM
  `19.2.8` 实现与官方测试、WHATWG HTML、MDN 和 `@types/react-dom@19.2.4` 完成调研。正文包含二十二个
  连续编号根级章节、十个完整易错项和六组结构化练习，覆盖能力阶梯、HTML 映射、TypeScript 合同、资源
  身份、首次属性、客户端与服务端调用位置、失败通道、Document/Root/realm 生命周期和安全边界；内容限定
  本科范围，不含课号、计划、路线、任务、批次、Gate、复审、完成度或篇幅生产叙事。
- **Demo、登记与源码同源：** 同源 iframe 在自己的 JavaScript realm 中加载 React DOM，依次观察连接提示、
  classic/module preload、classic/module preinit、stylesheet 应用、重复调用、Root 卸载、同 Document 重建
  Root 和新 Document。entry manifest、Demo manifest、Track 与独立 Vite HTML 入口已同步为 `72 available`、
  `2 planned`；源码面板按六个本地文件和三份同源静态资源的真实顺序拼接。磁盘与页面源码均为 `27175`
  字符、`28652` 字节，SHA-256 均为
  `c7138eb44a41450b3f71c7c1600e8f0b231b8f3f5c895d5da32be28ca7a5b5c0`。CSS 未使用 `grid`、`gap` 或
  负字距。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、学习者内容禁区与 CSS 禁区扫描、
  `npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；最终
  构建转换 `1932` 个模块。全仓 `format:check` 仍只被四个本课范围外的既有 Vite/Vue Reference 索引文件
  阻断。浏览器首轮发现 fixture 默认自定义属性覆盖了预初始化 stylesheet，移除该默认值后复跑同一反馈环
  通过。
- **浏览器：** Playwright 生产预览验证初始全部为零、连接提示 `1/1`、preload `1/1` 且执行 `0/0`、
  preinit 后脚本与执行均为 `1/1` 且 stylesheet `1/已应用`；重复调用、Root 卸载和同 Document 重建均不
  增加节点或副作用，新 Document 全部归零。宿主资源节点始终为 `0`，目标请求返回 `200/304`，干净状态机
  console 与 pageerror 均为空。`1440x1000`、`390x844` 与 `390x844 + 32px` 根字号下页面和 Demo 均无横向
  溢出、文本溢出或按钮裁切。
- **审查：** 已执行独立 Standards/Spec 复审，最终结果为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `72/74`，知识课 `61/62`，实战课 `11/12`。下一课为 A24“useInsertionEffect”。

### 11.73 A24 执行日志（2026-08-19）

- **目标与范围：** 完成 `react.core.learn.intermediate.use-insertion-effect`，保留稳定 ID，`stage` 与
  `level` 调整为 `advanced`，左侧标题与正文标题保持简短的“useInsertionEffect”。只讲 CSS-in-JS
  库作者的运行时规则插入、setup/cleanup、依赖、相对时机和资源所有权；不扩展到布局测量、通用 Effect、
  CSS-in-JS 框架实现、服务端渲染实现或第三方生态。ID 未变化，不需要进度迁移。
- **调研与正文：** 依据 React `19.2` 的 `useInsertionEffect`、`useEffect`、`useLayoutEffect` Reference，
  固定 React `19.2.8` 源码与官方测试、`@types/react@19.2.18` 完成独立调研。正文包含二十三个连续编号
  根级章节、十个完整易错项和六组结构化练习，覆盖样式方案选择、API 与依赖、独立/共享资源所有权、
  layout 前时机、State/Ref/DOM 限制、多组件交错、StrictMode、Document、SSR 和验证能力边界；内容限定
  本科范围，不含课号、计划、路线、任务、批次、Gate、复审、完成度或篇幅生产叙事。
- **Demo、登记与源码同源：** Demo 只使用一个 `styleMode` State 和一次 `useInsertionEffect`，通过事件完成
  `neutral -> accent -> neutral`，每轮 setup 创建一个 style 节点，cleanup 直接移除闭包捕获节点。entry
  manifest、Demo manifest 与 Track 已同步为 `73 available`、`1 planned`、`73 entries`；源码面板按真实
  TSX、CSS 顺序拼接。磁盘与页面源码均为 `5232` 字符、`5562` 字节，SHA-256 均为
  `4214c394690fe25bd4f86178b63e0caeb5f20c7b145577a5a83e2dd26bbd3730`。CSS 未使用 `grid`、`gap` 或
  负字距。
- **质量命令：** 目标文件定向 Prettier、限定 `git diff --check`、学习者内容禁区与 CSS 禁区扫描、临时
  TypeScript `7.0.2` fixture、TypeScript AST 结构断言、`npm run type-check`、`npm run lint`、空目录
  `test:unit`、`test:e2e` 和完整 `npm run build` 均通过；构建转换 `1934` 个模块。全仓
  `format:check` 仍只被四个本课范围外的既有 Vite/Vue Reference 索引文件阻断，临时验证资产已删除。
- **浏览器：** Playwright 生产预览在 `1440x900`、`390x844` 与 `390x844 + 32px` 根字号下验证中性规则
  `20px / 2px / rgb(241, 245, 244)`、强调规则 `28px / 4px / rgb(255, 240, 232)`；模式切换后稳定节点
  始终为 `1`，离页后为 `0`，重进和刷新恢复 `neutral`。页面、Demo、按钮和标题均无横向溢出或裁切；
  console error/warning、pageerror、失败请求、`4xx/5xx` 与交互动态请求均为 `0`。
- **审查：** 已执行独立 Standards/Spec 复审，最终结果为 `Standards PASS / 0 finding`、
  `Spec PASS / 0 finding`。
- **完成度：** 新路线 `73/74`，知识课 `62/62`，实战课 `11/12`。下一课为 AL5“实战：嵌入式状态面板”。

### 11.74 AL5 执行日志（2026-08-19）

- **目标与范围：** 完成 `react.core.learn.advanced.lab-embedded-status-panel`，左侧标题与正文标题统一为
  “实战：嵌入式状态面板”。课程只组合已学的 `useSyncExternalStore`、`useImperativeHandle`、
  `useLayoutEffect`、`hydrateRoot` 和宿主资源所有权，完成独立同源 Document 中的状态面板接管；不引入
  Router、第三方状态库、服务端渲染实现、RSC、Compiler 或新的 React API。
- **调研与正文：** 依据 React 19.2 官方 Reference、React DOM 19.2.8 源码与官方测试、WHATWG HTML、
  MDN 和 `@types/react@19.2.18` 完成独立调研。正文覆盖宿主与 React 所有权、静态标记与首份快照、外部
  Store 订阅、受限命令句柄、提交后测量、Hydration 身份、卸载清理、Document 重建、TypeScript 合同、
  易错项和分阶段练习；内容限定本科范围，不含课号、计划、路线、任务、批次、Gate、复审、完成度或篇幅
  生产叙事。
- **Demo、登记与源码同源：** Demo 由 Store、面板组件、静态宿主页、控制器和样式五个真实运行文件组成；
  entry manifest、Demo manifest 与 Track 已同步。源码面板按真实运行顺序合并，磁盘与页面源码均为
  `33879` 字符、`36189` 字节，SHA-256 均为
  `f2beb19172e0d60bb89081db4602d8a733060fa8f8339a137ac3941ec052ff86`。CSS 未使用 `grid`、`gap` 或
  负字距。
- **缺陷修正与审查：** 独立复审发现 Store 的三态循环会让 snapshot revision 回绕并复用旧对象，且调研
  中的 `PanelSnapshot` 漏写 `label`。公开 Store seam 的红测实际得到 `[0, 1, 2, 0, 1]`；改为状态模板
  与逐次创建新冻结快照后，同一反馈环通过 `[0, 1, 2, 3, 4]`，相邻快照引用不同且全部冻结。调研合同已
  同步 `label`，原复审者最终确认为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- **质量命令：** React 全范围定向 Prettier、`git diff --check`、学习者内容禁区、CSS 禁区、临时 Store
  行为验证、`npm run type-check`、`npm run lint`、空目录 `test:unit`、`test:e2e` 和完整
  `npm run build` 均通过；构建转换 `1945` 个模块。全仓 `npm run format:check` 仍只被四个 React 课程
  范围外的既有 Vite/Vue Reference 索引文件阻断。
- **浏览器：** Playwright 生产预览验证静态 `healthy / revision 0`，Hydration 后面板与按钮保持同一 Node，
  recoverable/root error 为 `0/0`，listener 为 `1`；连续四次发布得到 `attention 1 -> critical 2 ->
  healthy 3 -> attention 4`，iframe DOM 同步且 listener 始终为 `1`。命令句柄可聚焦 iframe 主按钮并
  重新测量；`1440x900`、`390x844` 和 `390x844 + 32px` 根字号下主页面与 iframe 横向溢出均为 `0`。
  卸载后 listener 为 `0`、subscribe/cleanup 为 `1/1`、容器子节点为 `0`、handle 不可用且宿主资源仍为
  `1/1`；重建后恢复 Document 2、`healthy / revision 0`。console error/warning、失败请求和 `4xx/5xx`
  均为 `0`。
- **完成度：** 新路线 `74/74`，知识课 `62/62`，实战课 `12/12`；高级阶段 `29/29` 完成。

### 11.75 React 课程最终 Gate 执行日志（2026-08-19）

- **路线与登记：** 临时全量审计逐项解析计划、Track、entry/demo manifest、74 份 Markdown 和 14 组进度
  迁移，确认 `74 available / 74 entries / 74 lessons`，基础 `24/24`、中级 `21/21`、高级 `29/29`，知识课
  `62/62`、实战课 `12/12`；ID、路线顺序、前置、related、Demo 引用和迁移目标全部一致，审计结果为
  `failures: []`、`warnings: []`。
- **内容终审：** 74 课逐份检查 H1/title、元数据、阶段、学习目标、正文结构、易错项、练习、小结、官方
  资料和学习者内容禁区；左侧标题不带课程编号，正文不含路线、批次、Gate、复审、哈希、完成度或篇幅
  叙事。正文大小为 `17166-45231` 字节，中位数 `31780` 字节，只用于证明实际覆盖范围，不作为课程合格
  门槛。B01 当前为 `21856` 字节、11 个根级二级章节，B02 为 `17166` 字节、14 个根级二级章节；复核后
  内容已覆盖各自本科范围，无需为增加篇幅继续扩写。
- **最终验证：** React 全范围定向格式检查、`git diff --check`、type-check、lint、空 unit/e2e 命令、完整
  build、AL5 桌面/移动端/200% 文本浏览器路径和最终独立复审均通过。全仓格式聚合命令的四个失败文件均为
  本路线未修改的 Vite/Vue Reference 索引；React 课程范围内没有格式失败。未新增 React Reference、API 页面
  或课程跳转，最终 Gate 通过。

## 12. 计划依据

- [React Installation](https://react.dev/learn/installation)
- [React Quick Start](https://react.dev/learn)
- [Thinking in React](https://react.dev/learn/thinking-in-react)
- [React Hooks Reference](https://react.dev/reference/react/hooks)
- [React DOM APIs](https://react.dev/reference/react-dom)
- [Vite Getting Started](https://vite.dev/guide/)
- [`课程内容规范.md`](../../standards/课程内容规范.md)
- [`R0-A-React生态范围冻结.md`](./R0-A-React生态范围冻结.md)
- [`R0-B-React-Core-DOM与宿主冻结.md`](./R0-B-React-Core-DOM与宿主冻结.md)
- [`RC1-基础课程官方事实核验.md`](./RC1-基础课程官方事实核验.md)
- [`RC2-中级课程单知识点计划.md`](./RC2-中级课程单知识点计划.md)
- [`RC3-高级课程单知识点计划.md`](./RC3-高级课程单知识点计划.md)
