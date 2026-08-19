# 渲染性能诊断官方调研记录

## 调研范围

- 主题：用 Profiler、`memo`、`useMemo` 和 `useCallback` 完成一次可复现的渲染性能诊断。
- 教学层级：本科高级。
- 核验日期：`2026-08-17`。
- React 公共文档基线：React `19.2`。
- 本地运行时快照：`react@19.2.8`、`react-dom@19.2.8`。
- 固定 React 文档提交：`383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`。
- React `v19.2.8` 标签提交：`1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。

本记录只核验公开性能测量与缓存合同。示例中的固定工作量用于形成可重复的本地测量窗口，不代表真实业务负载，
也不能代替浏览器交互延迟、网络、布局、绘制或真实用户监控。

## 调研方式与证据边界

1. 使用 Tavily 定位 React 官方页面，所有采用的结论均回到固定 `react.dev` 文档或 React 固定源码核验。
2. 对 Profiler、`memo`、`useMemo`、`useCallback` 和 Strict Mode 的公共合同逐项建立事实账本。
3. 固定 React 文档提交与 React `v19.2.8` 标签，只把源码用于佐证公开行为和构建边界。
4. 不把 Fiber 路径、调度策略、内部标志或某次设备读数写成公共 API 承诺。
5. 不采用社区文章、搜索摘要、单次肉眼感受或不同工作量之间的数字作为结论。

## 官方来源

| ID | 官方来源 | 采用范围 |
| --- | --- | --- |
| `R0` | [React Profiler](https://react.dev/reference/react/Profiler) | 测量边界、六个回调参数、三种 phase、普通 production 边界。 |
| `R1` | [`memo`](https://react.dev/reference/react/memo) | 默认 Props 比较、跳过父级更新、自身 State 与 Context 边界、非保证。 |
| `R2` | [`useMemo`](https://react.dev/reference/react/useMemo) | 计算结果缓存、完整依赖、`Object.is`、测量方式与非语义保证。 |
| `R3` | [`useCallback`](https://react.dev/reference/react/useCallback) | 函数身份缓存、完整依赖、`memo` 配合与非语义保证。 |
| `R4` | [React StrictMode](https://react.dev/reference/react/StrictMode) | 开发环境额外调用检查及其生产边界。 |
| `R5` | [React Developer Tools](https://react.dev/learn/react-developer-tools) | Components 与 Profiler 面板的交互式诊断定位。 |
| `R6` | [React Performance Tracks](https://react.dev/reference/dev-tools/react-performance-tracks) | profiling build 与普通 production 的区别。 |
| `R7` | [ReactFiberCommitEffects.js](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitEffects.js#L935-L995) | 固定版本提交阶段选择 phase 并调用 Profiler callback 的实现佐证。 |
| `R8` | [React rollup build](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/scripts/rollup/build.js#L431-L439) | production 与 profiling 构建开关。 |
| `R9` | [react-dom profiling export](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/package.json#L109-L112) | `react-dom/profiling` 专用入口存在。 |

## 事实账本

| 编号 | 可落地事实 | 来源 | 边界 |
| --- | --- | --- | --- |
| `F01` | `<Profiler>` 为后代子树建立程序化测量边界，不生成可见 DOM。 | `R0` | 测量范围不自动包含祖先、兄弟、网络、布局和绘制。 |
| `F02` | `onRender` 接收 `id`、`phase`、`actualDuration`、`baseDuration`、`startTime`、`commitTime`。 | `R0`、`R7` | 必须成组保存，不能只记录一个无上下文数字。 |
| `F03` | `phase` 为 `mount`、`update` 或 `nested-update`。 | `R0`、`R7` | 不能把事件次数直接当作 commit 次数。 |
| `F04` | `actualDuration` 是本次更新中 Profiler 子树的渲染耗时。 | `R0` | 不是点击到绘制完成的总延迟。 |
| `F05` | `baseDuration` 是整棵子树在没有跳过工作时重渲染成本的估计。 | `R0` | 不是本次真实耗时，也不是绝对性能分数。 |
| `F06` | 同一 commit 中的 Profiler 共享 `commitTime`，可用它归组记录。 | `R0` | `commitTime` 是时间戳，不是 commit 持续时间。 |
| `F07` | `memo` 默认逐项使用 `Object.is` 比较每个 Prop。 | `R1` | 新对象、新数组和新函数通常会让比较失败。 |
| `F08` | `memo` 只帮助跳过由父组件更新引起且 Props 未变的 render。 | `R1` | 组件自身 State 或读取的 Context 变化仍会 render。 |
| `F09` | `memo` 是性能优化而不是语义保证。 | `R1` | 代码不能依赖“组件永远不会再次执行”才能正确。 |
| `F10` | `useMemo` 在依赖未变时复用计算结果。 | `R2` | 首次 render 仍需计算，React 也可能因明确原因丢弃缓存。 |
| `F11` | `useMemo` 的依赖必须完整、固定长度并内联，逐项按 `Object.is` 比较。 | `R2` | 省略依赖会产生陈旧结果，多余不稳定依赖会破坏复用。 |
| `F12` | `useCallback` 在依赖未变时返回之前保存的函数身份。 | `R3` | 它不执行函数，也不阻止本次 render 创建函数表达式。 |
| `F13` | `useCallback` 的依赖规则与 `useMemo` 相同。 | `R3` | 缓存函数若读到响应值，就必须完整列出这些依赖。 |
| `F14` | `memo` 子组件要跳过，所有影响比较的 Props 都必须保持相等。 | `R1`、`R2`、`R3` | 只稳定值或只稳定函数，另一项新引用仍会阻止跳过。 |
| `F15` | 开发 Strict Mode 会额外调用 render 相关函数来检查纯度。 | `R4` | 不能把开发调用次数或时长直接当作 production 结果。 |
| `F16` | 普通 production 默认关闭 Profiler 测量，profiling build 保留测量并带额外开销。 | `R0`、`R6`、`R8`、`R9` | profiling build 不能冒充无插桩的真实用户基线。 |
| `F17` | React DevTools Profiler 是交互式工具，`<Profiler>` 是程序化采集 API。 | `R0`、`R5` | 两者可以协作，但不能混称为同一种数据来源。 |

## 诊断流程合同

### 1. 先冻结问题与输入

诊断前必须明确：

- 用户操作：只切换与列表无关的主题。
- 数据规模：固定报告集合与固定计算循环。
- 被测范围：工作区外层与慢列表内层两个 Profiler 边界。
- 观察结果：每个边界的 commit 数、phase、`actualDuration` 与 `baseDuration`。
- 正确性约束：五组策略显示相同结果，选择、查询和工作量变化保持一致。

若不同策略使用不同数据、不同慢组件或不同交互，数字没有因果可比性。

### 2. 建立可复现基线

基线版本直接计算派生列表，向普通列表传入每次新建的数组和事件函数。清空初始 mount 记录后，只切换主题：

- 工作区产生一次 `update`。
- 普通列表也产生一次 `update`。
- 查询、工作量和选中项不变。

这个结果说明无关父级更新进入了昂贵列表，不代表所有父级更新都应消失。

### 3. 定位 Props 身份

把列表包装为 `memo` 后，逐项检查 Props：

- `rows` 是否是每次 render 新建的数组。
- `onSelect` 是否是每次 render 新建的函数。
- `selectedId` 等原始值是否真的没有变化。
- Profiler callback 是否稳定且位于正确测量边界。

只读 JSX 外观不够，必须检查 `Object.is` 看到的引用身份。

### 4. 一次只改变一个原因

实验使用五种策略：

| 策略 | 列表 | `rows` | `onSelect` | 无关主题更新时的预期 |
| --- | --- | --- | --- | --- |
| 未优化 | 普通组件 | 直接计算的新数组 | 新函数 | 列表 update。 |
| 仅 `memo` | `memo` | 直接计算的新数组 | 新函数 | 两项引用都变化，列表 update。 |
| `memo + useMemo` | `memo` | 依赖未变时稳定 | 新函数 | 函数 Prop 仍变化，列表 update。 |
| `memo + useCallback` | `memo` | 直接计算的新数组 | 依赖未变时稳定 | 数组 Prop 仍变化，列表 update。 |
| 完整组合 | `memo` | 依赖未变时稳定 | 依赖未变时稳定 | 所有 Props 相等，列表可以跳过。 |

第五组是优化结果，前四组是诊断证据。不能因为最后一组成功就删掉中间的失败原因说明。

### 5. 验证必要更新仍然发生

优化不能通过冻结数据获得。完整组合还必须验证：

- 查询变化使 `useMemo` 重新计算，列表重新 render。
- 工作量变化使计算依赖变化，列表重新 render。
- 选中项变化使 `selectedId` 变化，列表重新 render。
- `useCallback` 读取当前值时依赖完整；能用 State updater 时才缩减依赖。
- 删除全部缓存后，显示结果与交互正确性不变。

## Demo 可观察合同

### 1. 固定数据与工作量

- 模块级创建固定报告数据，不使用随机数、网络、timer 或当前时间。
- 五种策略调用同一个纯计算函数，使用同一查询、同一工作量和同一排序规则。
- 纯计算返回最多固定数量的可见行与校验值，保证结果可人工比对。
- 工作量按钮只改变计算依赖，不改数据含义。

### 2. 两层 Profiler 边界

- 外层 `workspace` 边界记录整个策略组件的 render 成本。
- 内层 `report-list` 边界位于列表组件内部，只在列表实际 render 时产生记录。
- 两层记录可能共享 `commitTime` 且范围重叠，不能相加。
- 日志保存在被测边界外，不通过 State 把记录写回被测树。

### 3. 固定操作序列

1. 选择策略后清空 mount 记录。
2. 切换一次主题，只改变被测工作区之外的父级 State。
3. 查看 `workspace` 与 `report-list` 的 update 数。
4. 改变查询，确认完整组合仍重新计算和渲染列表。
5. 选择一条报告，确认业务交互仍有效。
6. 重置实验，恢复固定策略、输入、选中项和空日志。

### 4. 预期矩阵

| 操作 | 前四种策略的列表记录 | 完整组合的列表记录 | 说明 |
| --- | --- | --- | --- |
| 清空后切换主题 | `+1 update` | 不增加 | 只有完整组合同时稳定列表、值和函数 Props。 |
| 修改查询 | `+1 update` | `+1 update` | `rows` 的真实依赖变化，必要更新不能跳过。 |
| 修改工作量 | `+1 update` | `+1 update` | 计算规模属于 `useMemo` 依赖。 |
| 选择报告 | `+1 update` | `+1 update` | `selectedId` 变化，需要更新选中语义。 |

精确 duration 随设备、构建、后台任务和浏览器状态变化，验收不设置固定毫秒阈值。确定性结论来自边界是否产生
commit、Props 身份原因和多次同类样本，而不是某一个数字大小。

## 高价值错误与修正

### 1. 把 `actualDuration` 当作完整交互耗时

- **触发条件：** 看到 Profiler 的毫秒数就声称按钮到画面完成只花了这些时间。
- **原因：** 混淆 React 子树渲染时间与事件、网络、样式、布局、绘制等浏览器工作。
- **后果：** 优化方向与真实瓶颈不一致。
- **错误示例：** `actualDuration < 5`，因此整个交互一定小于 `5ms`。
- **正确写法：** 把该值描述为指定 Profiler 子树本次 render 成本，再结合浏览器工具观察完整交互。
- **验证方式：** 在记录中同时保存边界 id、phase 和测量工具类型。
- **适用版本：** React `19.2`。
- **来源：** `R0`。

### 2. 把 `baseDuration` 当作本次真实耗时

- **触发条件：** 直接用 `baseDuration` 判断某次更新花了多久。
- **原因：** 忽略它是整棵子树无优化重渲染成本的估计。
- **后果：** 与 `actualDuration` 的比较含义颠倒。
- **错误示例：** 把 `baseDuration` 标为“本次耗时”。
- **正确写法：** 分别显示“本次实际 render 成本”和“无跳过工作的基线估计”。
- **验证方式：** 检查字段标签和正文定义是否一一对应。
- **适用版本：** React `19.2`。
- **来源：** `R0`。

### 3. 把 `commitTime` 当作持续时间

- **触发条件：** 对 `commitTime` 添加 `ms` 后称其为 commit 耗时。
- **原因：** 它是时间戳，不是起止时间差。
- **后果：** 生成没有物理意义的性能数字。
- **错误示例：** `commit duration = commitTime`。
- **正确写法：** 用相同 `commitTime` 归组同一 commit 中的多个 Profiler 记录。
- **验证方式：** 检查同次提交的内外边界是否共享该值。
- **适用版本：** React `19.2`。
- **来源：** `R0`。

### 4. 认为 `memo` 会冻结组件

- **触发条件：** 包装 `memo` 后假设组件不再 render。
- **原因：** 忽略自身 State、Context 和变化 Props 仍会触发 render。
- **后果：** 把必要更新误判为缓存失效。
- **错误示例：** `memo(Component)` 后断言组件只能 mount 一次。
- **正确写法：** 只判断“父级更新且所有 Props 相等”这一种跳过机会。
- **验证方式：** 分别触发无关父级更新与真实 Props 更新。
- **适用版本：** React `19.2`。
- **来源：** `R1`。

### 5. 只看内容相同，不检查引用身份

- **触发条件：** 每次创建内容相同的数组或函数并传给 `memo` 子组件。
- **原因：** 默认比较使用 `Object.is`，不会深比较内容。
- **后果：** 子组件仍在每次父级更新时 render。
- **错误示例：** `rows={filterReports(reports, query)}` 与 `onSelect={(id) => select(id)}`。
- **正确写法：** 在有测量收益时分别稳定计算结果和回调身份。
- **验证方式：** 单独稳定一个 Prop，再观察另一不稳定 Prop 是否仍阻止跳过。
- **适用版本：** React `19.2`。
- **来源：** `R1`、`R2`、`R3`。

### 6. 把 `useMemo` 当作业务存储

- **触发条件：** 代码只有在缓存永不丢失时才正确。
- **原因：** 把性能优化误当成 State、Ref 或外部资源所有权。
- **后果：** React 丢弃缓存后出现业务错误。
- **错误示例：** 用缓存对象承担必须永久唯一的业务身份。
- **正确写法：** 删除 `useMemo` 后结果仍正确，只允许性能变化。
- **验证方式：** 做删除检查并重新执行同一交互。
- **适用版本：** React `19.2`。
- **来源：** `R2`。

### 7. 认为 `useCallback` 不会创建或会执行函数

- **触发条件：** 把 `useCallback` 当作函数执行器或创建次数开关。
- **原因：** 它缓存返回身份，不调用传入函数，本次函数表达式仍会创建。
- **后果：** 无法解释真实收益，也可能把事件逻辑错误移入 render。
- **错误示例：** 调用 `useCallback(save(), [])` 或宣称函数体只创建一次。
- **正确写法：** 传入函数本身，并只在身份稳定能帮助下游时使用。
- **验证方式：** 比较返回函数的 `Object.is`，并从真实事件触发函数体。
- **适用版本：** React `19.2`。
- **来源：** `R3`。

### 8. 用开发或 profiling 数据冒充真实用户基线

- **触发条件：** 在 Strict Mode 开发构建或 profiling build 中测量后直接发布绝对耗时结论。
- **原因：** 开发检查与 profiling instrumentation 都会改变运行成本。
- **后果：** 性能预算和用户结论失真。
- **错误示例：** 把开发环境一次记录当作所有生产设备的耗时。
- **正确写法：** 开发环境用于定位；真实基线使用普通 production、关闭 DevTools 和接近用户的设备；若使用 profiling build，明确构建类型与开销。
- **验证方式：** 记录构建类型、设备、浏览器、输入、交互和采样次数。
- **适用版本：** React `19.2`。
- **来源：** `R0`、`R4`、`R6`、`R8`、`R9`。

## 正文范围

正文应覆盖：

- 可复现问题、固定基线、最小 Profiler 边界与数据解释。
- 从无关父级更新定位到慢列表的过程。
- `memo` 的跳过条件与 Props `Object.is` 审计。
- `useMemo` 稳定昂贵计算结果和数组 Prop 的条件。
- `useCallback` 稳定函数 Prop 的条件与依赖规则。
- 单因素失败对照、完整组合、必要更新与删除检查。
- 开发、普通 production、profiling build 和 DevTools 的证据边界。
- 多次同类采样、相同输入、相同环境和避免过度优化。

正文不展开 React Compiler、Fiber/调度器内部、Web Vitals、Performance API、网络、布局、绘制、遥测后端、
服务端渲染或性能预算平台。这些内容不属于当前 React 渲染诊断实战的必要合同。

## 结论

可靠的渲染性能优化不是先添加缓存，而是先冻结场景、测量最小子树、定位重复工作，再逐项稳定真正阻止
`memo` 的 Props。只有 `memo`、稳定计算结果和稳定函数身份同时满足比较条件时，无关父级更新才有可验证的
跳过机会；真实依赖变化仍必须正常 render。所有绝对耗时结论都必须携带环境、构建、输入和采样上下文。
