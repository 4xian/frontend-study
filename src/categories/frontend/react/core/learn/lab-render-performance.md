---
id: react.core.learn.advanced.lab-render-performance
type: lesson
title: 实战：渲染性能诊断
summary: 用固定基线和 Profiler 定位无关渲染，再组合 memo、useMemo 与 useCallback 验证优化结果。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 180
prerequisites:
  - react.core.learn.advanced.profiler-render-measurement
  - react.core.learn.advanced.use-memo-value-caching
  - react.core.learn.advanced.memo-component-bailout
  - react.core.learn.advanced.use-callback-function-identity
related:
  - react.core.learn.basics.render-commit-and-state-snapshot
  - react.core.learn.intermediate.state-structure
tags:
  - React
  - 实战
  - Profiler
  - memo
  - useMemo
  - useCallback
  - 渲染性能
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能把性能感受改写为固定输入、固定交互、固定边界和可重复记录。
  - 能用 Profiler 区分工作区更新与慢列表更新，并正确解释六个回调参数。
  - 能从 memo 的 Object.is 比较定位数组 Prop 和函数 Prop 的引用身份问题。
  - 能分别验证 useMemo 与 useCallback 只稳定一类 Prop 时为什么仍不足以跳过列表。
  - 能组合 memo、useMemo 与 useCallback，让无关父级更新跳过列表而保留必要更新。
  - 能执行相同环境、多次采样、正确性回归和删除检查，避免用单次数字过度优化。
recap:
  - 先固定问题、输入、操作、测量边界和构建环境，再收集基线。
  - Profiler 记录 React 子树的 commit 级 render 成本，不是完整交互耗时。
  - memo 默认逐项用 Object.is 比较 Props，新数组和新函数都会破坏跳过条件。
  - useMemo 稳定计算结果，useCallback 稳定函数身份，两者都必须使用完整依赖。
  - 只稳定一项引用仍可能失败；所有相关 Props 相等时 memo 才有跳过机会。
  - 查询、工作量、选中项等真实输入变化仍应重新计算或渲染。
  - 缓存是性能优化，不是正确性、业务存储或永久身份保证。
  - 结论必须来自同一环境下多次同类样本，并通过正确性回归和删除检查。
sources:
  - title: Profiler
    url: https://react.dev/reference/react/Profiler
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Profiler 测量边界、六个回调参数、三种 phase 与普通 production 边界
  - title: memo
    url: https://react.dev/reference/react/memo
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 默认 Props 比较、父级更新跳过、自身 State 与 Context 边界和非保证
  - title: useMemo
    url: https://react.dev/reference/react/useMemo
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 计算结果缓存、完整依赖、Object.is、测量方法和非语义保证
  - title: useCallback
    url: https://react.dev/reference/react/useCallback
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 函数身份缓存、完整依赖、与 memo 配合和非语义保证
  - title: StrictMode
    url: https://react.dev/reference/react/StrictMode
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 开发环境额外调用检查及其生产边界
  - title: React Developer Tools
    url: https://react.dev/learn/react-developer-tools
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Components 与 Profiler 面板的交互式诊断用途
  - title: React Performance Tracks
    url: https://react.dev/reference/dev-tools/react-performance-tracks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 普通 production 与 profiling build 的测量边界
---

# 实战：渲染性能诊断

## 一、学习目标

- 把“页面感觉慢”改写成可以重复执行和比较的性能问题。
- 用内外两个 Profiler 边界判断无关父级更新是否进入慢列表。
- 根据 `memo` 的默认 Props 比较定位新数组与新函数身份。
- 分别应用 `memo`、`useMemo`、`useCallback`，观察只修复部分原因时为什么仍会失败。
- 组合三种优化，让无关更新跳过慢列表，同时保留查询、计算规模和选中项的必要更新。
- 固定环境与输入，收集多次同类样本，并执行正确性回归和删除检查。

## 二、问题场景与验收条件

报告工作区包含一个计算成本较高的列表。父组件还保存页面主题。切换主题只改变外观，不改变报告数据、查询、
计算规模、选中项或列表事件语义；如果慢列表仍在每次主题切换时 render，就存在可以调查的无关工作。

性能诊断不能从“先加缓存”开始。先把问题冻结成完整合同：

| 项目 | 固定内容 |
| --- | --- |
| 用户操作 | 清空 mount 记录后，只切换一次主题。 |
| 数据 | 同一份固定报告集合。 |
| 计算 | 同一个纯筛选、评分、排序函数和同一工作量。 |
| 被测范围 | 整个工作区 `workspace` 与慢列表 `report-list`。 |
| 观察结果 | 两个边界是否产生 update，以及对应 Profiler 数据。 |
| 正确性 | 五种策略显示相同列表，查询、选择和重置行为一致。 |
| 优化目标 | 无关主题更新时列表不 render；真实输入变化时列表正常 render。 |

验收条件同时包含“少做无关工作”和“不漏必要工作”。如果一种优化让列表永远不更新，它不是性能优化，而是功能错误。

## 三、先建立可重复的基线

### 1. 固定数据与工作量

使用模块级固定数据，避免随机数、网络、timer 和当前时间改变输入。昂贵计算也必须保持纯净：相同报告、查询和
工作量产生相同结果，不修改输入，不安排 State 更新，不读写外部系统。

```tsx
type Report = Readonly<{
  id: string
  title: string
  status: string
  baseScore: number
}>

/** 用固定输入生成可比较的报告行。 */
function calculateReportRows(reports: readonly Report[], query: string, workload: number) {
  return reports
    .filter((report) => report.title.includes(query) || report.status.includes(query))
    .map((report) => ({ ...report, score: calculateScore(report, workload) }))
    .sort((left, right) => right.score - left.score)
}
```

不要为了让优化版更快而减少它的数据量或循环次数。不同工作量之间的数字不能证明缓存有效。

### 2. 冻结操作顺序

每个策略都执行相同顺序：

1. 切换到目标策略。
2. 清空策略切换产生的 mount 记录。
3. 只切换一次主题。
4. 记录工作区与列表的 update。
5. 修改查询，确认列表仍会更新。
6. 选择一条报告，确认选中状态仍会更新。

操作顺序会影响缓存是否已有结果、组件是否已挂载以及记录属于 `mount` 还是 `update`，因此也属于实验输入。

### 3. 未优化基线

未优化组件在每次 render 中直接计算数组，并创建新的选择函数：

```tsx
function ReportWorkspace({ query, workload, selectedId, onSelect }: WorkspaceProps) {
  const rows = calculateReportRows(reports, query, workload)

  function selectReport(reportId: string) {
    onSelect(reportId)
  }

  return <ReportList rows={rows} selectedId={selectedId} onSelect={selectReport} />
}
```

主题虽然没有出现在代码片段中，但父组件 render 会再次执行 `ReportWorkspace`。直接计算重新运行，`ReportList`
也会收到新数组和新函数。基线应该先证明这条更新路径真实存在。

## 四、用 Profiler 划定测量范围

### 1. 外层边界测工作区

外层 Profiler 包裹策略工作区，记录计算、组件执行和后代 render：

```tsx
<Profiler id="workspace" onRender={handleRender}>
  <ReportWorkspace
    query={query}
    workload={workload}
    selectedId={selectedId}
    onSelect={setSelectedId}
  />
</Profiler>
```

只要父级更新进入工作区，外层就可能产生一条记录。完整优化并不要求外层记录消失；主题 State 仍在父级，工作区
组件仍可能执行。优化目标是阻止昂贵列表继续执行。

### 2. 内层边界测慢列表

把第二个 Profiler 放在列表组件内部：

```tsx
function ReportList(props: ReportListProps) {
  return (
    <Profiler id="report-list" onRender={props.onRender}>
      <ReportRows rows={props.rows} onSelect={props.onSelect} />
    </Profiler>
  )
}

const MemoReportList = memo(ReportList)
```

内层边界位于 `memo` 组件内部。若 `memo` 成功跳过整个列表组件，内部 Profiler 不会进入新的 render，也不会为
这次父级更新增加列表记录。这比在列表外层包一个 Profiler 更直接地回答“列表组件有没有执行”。

### 3. 记录不能反向污染被测树

`onRender` 在 commit 后运行。若 callback 把记录写入被测工作区的 State，会安排新的 render，测量工具本身就会
制造额外记录。更稳妥的结构是把日志放在 Profiler 外：

```tsx
const recordsRef = useRef<MeasurementRecord[]>([])
const logRef = useRef<HTMLElement>(null)

const handleRender = useCallback<ProfilerOnRenderCallback>((...measurement) => {
  recordsRef.current = appendRecord(recordsRef.current, measurement)
  renderMeasurementLog(logRef.current, recordsRef.current)
}, [])
```

Ref 保存测量数据，DOM Ref 只更新 Profiler 外的日志。清空日志不应触发被测工作区 render。

## 五、正确读取 Profiler 数据

`onRender` 的六个参数必须成组保存：

| 参数 | 含义 | 不能替代什么 |
| --- | --- | --- |
| `id` | 产生记录的 Profiler 边界。 | 不能省略后把所有数字混为一组。 |
| `phase` | `mount`、`update` 或 `nested-update`。 | 不能用按钮点击次数推断。 |
| `actualDuration` | 当前更新中该子树实际执行的 React render 时间。 | 不是完整交互、网络、布局或绘制时间。 |
| `baseDuration` | 整棵子树无跳过工作时重渲染成本的估计。 | 不是本次真实耗时。 |
| `startTime` | React 开始渲染当前更新的时间戳。 | 不是持续时间。 |
| `commitTime` | React 提交当前更新的时间戳。 | 不是 commit 耗时。 |

同一 commit 中的多个 Profiler 共享 `commitTime`，可以据此归组。外层范围包含内层范围时，两条 duration 有重叠，
不能相加成页面总耗时。

本实战首先用“列表边界是否产生 update”建立确定性结论，再用 duration 比较执行成本。毫秒值受设备、浏览器、
构建、后台任务和采样波动影响，不设置脱离环境的固定阈值。

## 六、从基线定位 Props 身份

### 1. `memo` 的默认判断

`memo(Component)` 默认逐项用 `Object.is` 比较新旧 Props。它不深比较对象内容，也不检查函数体是否相同：

```tsx
Object.is(['report-1'], ['report-1']) // false
Object.is(() => {}, () => {}) // false
Object.is('report-1', 'report-1') // true
```

因此应逐项列出慢列表 Props：

| Prop | 类型 | 主题更新时是否应改变 | 未优化身份 |
| --- | --- | --- | --- |
| `rows` | 数组 | 否 | 直接计算返回新数组。 |
| `onSelect` | 函数 | 否 | 组件体创建新函数。 |
| `selectedId` | 字符串或 `null` | 否 | 原始值保持相等。 |
| `onRender` | 函数 | 否 | 应在日志所有者中保持稳定。 |

列表有两个不稳定业务 Prop。只添加 `memo` 不会自动稳定它们。

### 2. State 与 Context 的边界

即使所有 Props 相等，`memo` 子组件自身 State 变化或它读取的 Context 变化时仍会 render。诊断时必须确认更新来源：

- 父组件 render 且 Props 相等：`memo` 可能跳过。
- 父组件 render 且任一 Prop 变化：子组件需要 render。
- 子组件调用自己的 State setter：子组件需要 render。
- 子组件读取的 Context 值变化：子组件需要 render。

不要把所有列表 update 都称为“`memo` 失效”。

## 七、第一组对照：只添加 memo

把列表改为 `memo` 组件，但保留直接计算和普通函数：

```tsx
const MemoReportList = memo(ReportList)

function MemoOnlyWorkspace(props: WorkspaceProps) {
  const rows = calculateReportRows(reports, props.query, props.workload)

  function selectReport(reportId: string) {
    props.onSelect(reportId)
  }

  return (
    <MemoReportList
      rows={rows}
      selectedId={props.selectedId}
      onSelect={selectReport}
      onRender={props.onRender}
    />
  )
}
```

只切换主题时，`rows` 和 `onSelect` 都不满足 `Object.is`。列表仍产生 update 是正确结果，它证明问题不在
`memo` 是否“生效”，而在传入的 Props 身份。

## 八、第二组对照：只稳定计算结果

用 `useMemo` 缓存昂贵计算结果：

```tsx
function StableValueWorkspace(props: WorkspaceProps) {
  const rows = useMemo(
    () => calculateReportRows(reports, props.query, props.workload),
    [props.query, props.workload],
  )

  function selectReport(reportId: string) {
    props.onSelect(reportId)
  }

  return (
    <MemoReportList
      rows={rows}
      selectedId={props.selectedId}
      onSelect={selectReport}
      onRender={props.onRender}
    />
  )
}
```

主题更新时 `query` 和 `workload` 不变，`useMemo` 可以返回之前的数组身份，也避免重复执行计算。但 `selectReport`
仍是新函数，`memo` 比较仍会失败，所以列表继续 render。

这一步同时产生两个结论：

1. `useMemo` 可以独立减少父级 render 中的昂贵计算。
2. 稳定数组并不等于稳定全部 Props，列表跳过条件仍未完整。

依赖数组必须列出计算读取的所有响应值。若计算还读取 `sortOrder` 或 `reports` Prop，它们也必须加入依赖。

## 九、第三组对照：只稳定函数身份

用 `useCallback` 缓存选择函数：

```tsx
function StableCallbackWorkspace(props: WorkspaceProps) {
  const rows = calculateReportRows(reports, props.query, props.workload)
  const selectReport = useCallback(
    (reportId: string) => props.onSelect(reportId),
    [props.onSelect],
  )

  return (
    <MemoReportList
      rows={rows}
      selectedId={props.selectedId}
      onSelect={selectReport}
      onRender={props.onRender}
    />
  )
}
```

父级传入的 State setter 身份稳定，因此 `selectReport` 可以保持身份。但直接计算仍返回新数组，列表仍会 update。

`useCallback` 不调用函数，也不阻止当前 render 创建函数表达式。它只决定返回给变量的是之前保存的身份还是当前身份。
只有这个身份被传给 `memo` 子组件或成为其他 Hook 依赖时，缓存才可能带来可测收益。

## 十、完整组合与必要更新

### 1. 同时满足跳过条件

最终版本同时稳定昂贵计算结果和函数 Prop：

```tsx
function OptimizedWorkspace(props: WorkspaceProps) {
  const rows = useMemo(
    () => calculateReportRows(reports, props.query, props.workload),
    [props.query, props.workload],
  )
  const selectReport = useCallback(
    (reportId: string) => props.onSelect(reportId),
    [props.onSelect],
  )

  return (
    <MemoReportList
      rows={rows}
      selectedId={props.selectedId}
      onSelect={selectReport}
      onRender={props.onRender}
    />
  )
}
```

清空记录后只切换主题：

- `workspace` 仍会记录父级进入工作区的 update。
- `rows` 依赖未变，数组身份保持。
- `selectReport` 依赖未变，函数身份保持。
- `selectedId` 与 `onRender` 保持相等。
- `memo` 获得完整的 Props 相等条件，列表边界不增加记录。

### 2. 查询变化必须重新计算

查询是 `rows` 的真实依赖。修改查询后：

- `useMemo` 执行计算函数。
- 返回符合新查询的新数组。
- `memo` 看到 `rows` 变化。
- 列表重新 render 并显示新结果。

若查询变化后列表没有更新，应先检查依赖是否遗漏，不能把它解释为“缓存命中”。

### 3. 工作量变化必须重新计算

工作量决定固定计算循环，也属于依赖。切换工作量不改变报告语义，但会改变本次实验输入，必须重新计算并产生新的
列表 update。比较 duration 时只能比较同一工作量下的记录。

### 4. 选中项变化必须更新列表

选择报告后 `selectedId` 改变，列表需要更新 `aria-pressed` 和可见选中状态。这个 update 是业务正确性的一部分，
不应被跳过。

## 十一、五种策略的因果矩阵

| 策略 | 列表类型 | `rows` | `onSelect` | 主题更新后的列表 |
| --- | --- | --- | --- | --- |
| 未优化 | 普通组件 | 新数组 | 新函数 | update。 |
| 仅 `memo` | `memo` | 新数组 | 新函数 | update。 |
| 稳定值 | `memo` | 稳定数组 | 新函数 | update。 |
| 稳定函数 | `memo` | 新数组 | 稳定函数 | update。 |
| 完整组合 | `memo` | 稳定数组 | 稳定函数 | 可以跳过。 |

矩阵的价值不是展示 API 数量，而是建立因果关系：每次只改变一个身份条件，保留其他输入不变，直到所有阻断项都被
解释。若真实组件还有对象、`children`、Context 或其他函数 Prop，也要用同样方法继续审计。

## 十二、测量环境与采样方法

### 1. 开发环境用于定位

开发环境便于查看源码、使用 React DevTools 和快速重复操作，但 Strict Mode 会进行额外纯度检查。开发调用次数、
缓存计算次数和 duration 不能直接当作最终用户数据。不要为了得到更“漂亮”的开发数字而关闭 Strict Mode；应先确保
组件和计算保持纯净，再解释环境差异。

### 2. 普通 production 与 profiling build

普通 production 默认关闭 Profiler 测量。若需要在 production 优化路径中继续使用 `onRender`，必须使用 React
提供的 profiling build，并明确它保留测量插桩且有额外开销。

因此需要区分两类目标：

- 定位 React 子树：开发构建或 profiling build，记录所用构建类型。
- 评估真实用户基线：普通 production、关闭 React DevTools、接近用户的设备和真实交互。

profiling build 的数字不能冒充无插桩普通 production 的绝对成本。

### 3. 多次同类采样

单次毫秒数会受 JIT、垃圾回收、浏览器后台任务、温度和设备状态影响。可靠比较至少要固定：

- 浏览器与版本；
- 构建类型；
- 设备与 CPU 条件；
- 数据、查询与工作量；
- 操作顺序；
- Profiler 边界；
- mount 或 update 类型。

在同一条件下收集多次记录，观察分布和稳定趋势。不要只挑最有利的一次数字。

## 十三、正确性回归与删除检查

缓存优化完成后，依次验证：

1. 五种策略的报告标题、状态、分数和校验值一致。
2. 查询变化显示正确结果。
3. 工作量变化只改变计算输入和测量，不破坏报告语义。
4. 选择报告更新选中状态。
5. 重置恢复固定策略、主题、查询、工作量、选中项和日志。
6. 删除 `memo`、`useMemo`、`useCallback` 后功能仍正确，只是重复工作增加。

最后一项是语义检查。若删除缓存会让结果错误、事件读取旧值或业务身份丢失，说明缓存承担了不该承担的正确性职责。

优化也需要成本：依赖审计、缓存存储、额外比较和代码复杂度。若同一场景下没有稳定收益，应删除缓存，保留更直接的
代码。

## 十四、Demo 操作与观察

:::demo{id="react.core.learn.advanced.lab-render-performance.render-diagnosis-demo"}
:::

按以下路径操作：

1. 保持“未优化”，点击“清空测量”，再点击“仅切换主题”。`workspace` 和 `list` 都应增加记录。
2. 依次切换“仅 memo”“稳定值”“稳定函数”，每次先清空再切换主题。列表仍应增加记录，策略说明会指出剩余阻断项。
3. 切换“完整组合”，清空后切换主题。`workspace` 增加，`list` 不增加。
4. 保持“完整组合”并点击“修改查询”。查询依赖变化，列表应增加记录并显示新结果。
5. 修改计算规模或选择一条报告。真实 Props 变化，列表应正常更新。
6. 点击“重置实验”，恢复未优化、浅色主题、固定查询、标准工作量、无选中项和新会话日志。

日志显示内外边界计数、最新 phase、两类 duration 和最近 commit。内外边界范围重叠，不要把它们相加。

## 十五、易错使用提示

:::pitfalls
### 错误：把 actualDuration 当作完整交互耗时

**触发条件：** 看到 Profiler 毫秒数后，直接声明点击到画面完成只花了这些时间。

**原因：** `actualDuration` 只描述指定 React 子树本次 render 工作，不包含网络、布局、绘制和完整事件链。

**后果：** 真实瓶颈可能完全不在 React render，优化方向失准。

**错误示例：**

```tsx
function onRender(_id: string, _phase: string, actualDuration: number) {
  console.log(`整个交互耗时 ${actualDuration}ms`)
}
```

**正确写法：**

```tsx
function onRender(id: string, phase: string, actualDuration: number) {
  console.log(`${id} 在 ${phase} 阶段的 React render 成本为 ${actualDuration}ms`)
}
```

**验证方式：** 明确记录测量边界和工具；完整交互另用浏览器性能工具验证。

### 错误：把 baseDuration 或 commitTime 当作本次耗时

**触发条件：** 把 `baseDuration` 标为“实际耗时”，或直接把 `commitTime` 后面加 `ms` 当作持续时间。

**原因：** `baseDuration` 是无跳过工作的基线估计，`commitTime` 是共享时间戳。

**后果：** 生成没有正确物理含义的数字。

**错误示例：**

```tsx
const commitDuration = commitTime
const actualDuration = baseDuration
```

**正确写法：**

```tsx
const record = { actualDuration, baseDuration, startTime, commitTime }
```

**验证方式：** 检查字段名称、单位和定义；只用相同 `commitTime` 归组同一次 commit。

### 错误：给组件加 memo 后停止检查 Props

**触发条件：** 包装 `memo` 后仍传入新数组和新函数，却认为 React 应自动跳过。

**原因：** 默认比较逐项使用 `Object.is`，`memo` 不会自动稳定引用。

**后果：** 代码更复杂，列表仍然 render。

**错误示例：**

```tsx
const MemoList = memo(ReportList)
<MemoList rows={filterReports(reports)} onSelect={(id) => selectReport(id)} />
```

**正确写法：**

```tsx
const rows = useMemo(() => filterReports(reports), [reports])
const onSelect = useCallback((id: string) => selectReport(id), [selectReport])
<MemoList rows={rows} onSelect={onSelect} />
```

**验证方式：** 逐项列出新旧 Props，并用同一无关父级更新观察列表边界。

### 错误：只稳定一个引用就宣布完成

**触发条件：** 列表同时接收数组和函数，只对其中一个使用缓存。

**原因：** 任意一个 Prop 比较失败都足以让 `memo` 子组件 render。

**后果：** 列表 commit 没有减少，却把波动数字误当作收益。

**错误示例：**

```tsx
const rows = useMemo(() => filterReports(reports), [reports])
<MemoList rows={rows} onSelect={(id) => selectReport(id)} />
```

**正确写法：**

```tsx
const rows = useMemo(() => filterReports(reports), [reports])
const onSelect = useCallback((id: string) => selectReport(id), [selectReport])
<MemoList rows={rows} onSelect={onSelect} />
```

**验证方式：** 分别运行稳定值、稳定函数和完整组合三组对照。

### 错误：省略 useMemo 或 useCallback 的真实依赖

**触发条件：** 为了让身份“永远稳定”，把依赖写成 `[]`。

**原因：** 把依赖数组当作执行频率开关，而不是闭包响应值清单。

**后果：** 查询变化后显示旧列表，或回调读取旧业务值。

**错误示例：**

```tsx
const rows = useMemo(() => calculateReportRows(query, workload), [])
```

**正确写法：**

```tsx
const rows = useMemo(() => calculateReportRows(query, workload), [query, workload])
```

**验证方式：** 分别改变每个依赖，确认结果和列表都按预期更新。

### 错误：把缓存当作业务 State 或永久身份

**触发条件：** 功能只有在 `useMemo` 缓存永不丢失时才正确。

**原因：** `useMemo` 和 `useCallback` 都是性能优化，不提供永久存储语义。

**后果：** 缓存被丢弃或组件重挂载时出现业务错误。

**错误示例：**

```tsx
const orderIdentity = useMemo(() => ({ id: createBusinessId() }), [])
```

**正确写法：**

```tsx
const [orderIdentity] = useState(() => ({ id: createBusinessId() }))
```

**验证方式：** 删除缓存或重挂载组件，功能结果仍应正确。

### 错误：让日志 State 位于被测边界内

**触发条件：** `onRender` 每次把记录写回被测组件 State。

**原因：** commit 后的日志更新会安排新的 render，观察工具改变了被观察对象。

**后果：** 产生额外 commit、`nested-update` 或难以解释的反馈循环。

**错误示例：**

```tsx
<Profiler id="workspace" onRender={(...record) => setRecords((all) => [...all, record])}>
  <Workspace records={records} />
</Profiler>
```

**正确写法：**

```tsx
const recordsRef = useRef<Measurement[]>([])
const handleRender = useCallback((...record: Measurement) => {
  recordsRef.current = appendRecord(recordsRef.current, record)
  renderExternalLog(logRef.current, recordsRef.current)
}, [])
```

**验证方式：** 清空日志时被测 Profiler 不应增加记录。

### 错误：用开发或 profiling 数据冒充真实用户基线

**触发条件：** 在 Strict Mode 开发环境或 profiling build 中测一次，就发布绝对生产耗时结论。

**原因：** 开发检查和 profiling 插桩都会改变运行成本。

**后果：** 性能预算与真实设备体验不一致。

**错误示例：**

```ts
const conclusion = '开发环境单次 3.2ms，因此所有生产用户都小于 4ms'
```

**正确写法：**

```ts
// 开发或 profiling build 用于定位；最终基线使用普通 production 和目标设备。
const measurementContext = {
  build: 'production',
  devTools: 'closed',
  device: 'target-user-device',
  interaction: 'toggle-theme',
  samples: 20,
}
```

**验证方式：** 每份结果都能回答“在哪个构建、哪台设备、什么输入、哪种操作、采了多少次”。
:::

## 十六、源码推导与适用场景

1. React 公共合同规定 Profiler 在被测子树完成 commit 时提供六项数据；固定版本源码在提交阶段选择 phase 并调用
   callback，佐证记录单位是 commit，而不是事件次数。
2. `memo` 默认按 `Object.is` 比较 Props，因此新数组与新函数都能独立阻止跳过。这一判断只依赖公共 API，
   不需要依赖 Fiber 内部实现。
3. `useMemo` 与 `useCallback` 都比较完整依赖。前者稳定计算结果，后者稳定函数身份；二者删除后功能应保持正确。
4. 五策略矩阵适用于“昂贵子组件经常因父级无关更新而 render，且 Props 可以保持稳定”的场景。
5. 如果子组件每次都收到真实变化的数据、读取频繁变化的 Context、计算本身很便宜，或父级很少更新，缓存可能没有
   可测收益。
6. 若瓶颈来自网络、长任务、布局、绘制、图片、第三方脚本或超大 DOM，Profiler 只能说明 React render 部分，
   需要使用对应工具继续定位。
7. 普通 production 默认关闭 Profiler；使用 profiling build 时必须记录构建类型和插桩开销，不把它等同真实用户
   无插桩基线。

## 十七、练习

:::exercise
### 练习 1：完成五策略记录表

**要求：** 依次运行五种策略。每次切换策略后清空记录，只切换一次主题，记录 `workspace` 与
`report-list` 是否增加 update，并为结果写出对应的 Props 身份原因。

**验收：** 前四组列表增加记录，完整组合不增加；每个结果都能对应到具体变化或稳定的 Prop。
:::

:::exercise
### 练习 2：验证必要更新

**要求：** 保持完整组合，分别修改查询、计算规模和选中项。预测哪个依赖或 Prop 发生变化，再用列表
Profiler 记录验证。

**验收：** 三种真实输入变化都让列表更新；若没有更新，能定位遗漏的依赖或错误的比较边界。
:::

:::exercise
### 练习 3：增加一个对象 Prop

**要求：** 向列表增加 `displayOptions={{ compact: true }}`。先观察完整组合为什么重新失去跳过能力，再选择
把对象移到组件外、拆成原始值 Prop，或在有测量收益时用 `useMemo` 稳定。

**验收：** 能用 `Object.is` 解释失败，并说明所选重构如何让 Prop 合同更小或身份更稳定。
:::

:::exercise
### 练习 4：执行删除检查

**要求：** 从完整组合中依次删除 `useCallback`、`useMemo` 和 `memo`。每一步都重新执行查询、选择与重置，
证明功能结果不变，并记录重复工作如何恢复。

**验收：** 删除缓存只改变 render 或计算成本，不改变结果；若功能错误，能指出缓存承担了哪项业务语义。
:::

:::exercise
### 练习 5：设计可复查的采样报告

**要求：** 为一次真实性能比较记录浏览器、构建类型、设备、数据规模、查询、工作量、操作顺序、Profiler
边界和采样次数，并标注每组数字的来源。

**验收：** 能区分开发、profiling build 与普通 production 证据，并指出哪些结论仍需在目标设备复测。
:::

## 十八、本节小结

- 先把性能感受改写为固定输入、固定操作、固定边界和可重复记录。
- Profiler 描述 React 子树的 commit 级 render 成本，不代表完整交互耗时。
- `memo` 默认逐项用 `Object.is` 比较 Props，不会自动稳定数组、对象或函数。
- `useMemo` 稳定计算结果，`useCallback` 稳定函数身份，两者都必须使用完整依赖。
- 只稳定部分 Props 仍可能让列表 render；完整组合必须由单因素对照证明。
- 优化只跳过无关工作，查询、工作量、选中项和其他真实输入变化仍应正常更新。
- 缓存不能承担正确性或永久身份；删除检查应只改变性能，不改变结果。
- 毫秒结论必须携带环境、构建、输入和采样上下文，并使用多次同类样本。

## 十九、参考资料

- [Profiler](https://react.dev/reference/react/Profiler) - 测量边界、回调参数、phase、duration 与 production 边界。
- [memo](https://react.dev/reference/react/memo) - Props 比较、跳过条件、State 与 Context 边界。
- [useMemo](https://react.dev/reference/react/useMemo) - 计算结果缓存、依赖、测量和非语义保证。
- [useCallback](https://react.dev/reference/react/useCallback) - 函数身份缓存、依赖和与 `memo` 配合。
- [StrictMode](https://react.dev/reference/react/StrictMode) - 开发环境额外检查及其边界。
- [React Developer Tools](https://react.dev/learn/react-developer-tools) - Components 与 Profiler 面板。
- [React Performance Tracks](https://react.dev/reference/dev-tools/react-performance-tracks) - profiling build 的使用边界。
