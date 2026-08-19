---
id: react.core.learn.advanced.profiler-render-measurement
type: lesson
title: Profiler 渲染测量
summary: 用每次 commit 的 Profiler 数据区分首次挂载与更新，并观察子树渲染成本。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 100
prerequisites:
  - react.core.learn.basics.render-commit-and-state-snapshot
  - react.core.learn.intermediate.strict-mode-development-checks
related: []
tags:
  - React
  - Profiler
  - onRender
  - 渲染性能
  - commit
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能用 Profiler 包裹最小子树，并解释 onRender 六个参数与三种 phase。
  - 能解释 actualDuration 与 baseDuration 分别代表本次实际成本和整棵子树的基线估计。
  - 能解释 startTime 与 commitTime 的时间点语义，并按共享 commitTime 归组多个边界。
  - 能用稳定 id 设计多个或嵌套边界，并识别不能直接相加的重叠范围。
  - 能在边界外保存多次同类 commit，避免记录界面反向污染被测子树。
  - 能区分开发、普通 production 与 profiling build 的证据边界。
recap:
  - Profiler 按 commit 报告被包裹子树的渲染测量，而不是统计点击次数或网络耗时。
  - phase 说明本次是 mount、update 或 nested-update，id 说明是哪一个测量边界。
  - actualDuration 是本次更新的实际渲染时长，baseDuration 是整棵子树无优化重渲染的基线估计。
  - startTime 是 React 开始渲染当前更新的时间戳，commitTime 是完成当前 commit 的时间戳。
  - 同一 commit 中的多个 Profiler 共享 commitTime，但嵌套边界的渲染范围会重叠，不能直接求和。
  - 单次读数不是结论，应在同一环境、同一交互路径下收集多次 commit 再比较。
  - 普通 production build 默认关闭 profiling，需要开发构建或专用 profiling build 才能验证 callback。
sources:
  - title: Profiler
    url: https://react.dev/reference/react/Profiler
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Profiler 的 id、onRender、使用方式与 production profiling 边界
      - phase、actualDuration、baseDuration、startTime 和 commitTime 的公开语义
  - title: Profiler onRender callback
    url: https://react.dev/reference/react/Profiler#onrender-callback
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - callback 的六个参数和 mount、update、nested-update 阶段值
  - title: React Performance Tracks
    url: https://react.dev/reference/dev-tools/react-performance-tracks#using-profiling-builds
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - React 提供独立于普通 production build 的 profiling build
      - profiling build 使用 react-dom/profiling 并由构建工具在入口边界完成别名替换
  - title: React v19.2.8 ReactFiberCommitEffects Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L935-L995
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本在 commit 阶段选择 phase 并传入两类 duration 的实现佐证
---

# Profiler 渲染测量

## 一、学习目标

- 用 `<Profiler>` 划出名称稳定的最小被测子树，读取六个回调参数并区分三种 `phase`。
- 分别解释 `actualDuration` 与 `baseDuration`，不把两者混成一个“性能分数”。
- 区分 duration 与 timestamp，并用 `commitTime` 归组同一次 commit 的多个边界。
- 设计多个或嵌套测量边界，识别重复计算范围并避免观察工具污染被测子树。
- 固定环境、输入和交互路径，收集多次同类记录后再比较。
- 判断开发构建、普通 production build 与 profiling build 能提供哪类证据。

## 二、为什么需要

“页面感觉有点慢”只是感受，不能说明哪棵 React 子树执行了多少渲染工作，也不能证明一次修改是否真正
减少了更新成本。浏览器总耗时还可能包含事件处理、网络、样式计算、布局、绘制和其他脚本，仅靠肉眼无法把
这些工作分开。

`<Profiler>` 提供一个程序化的 React 测量边界。边界内有组件完成 commit 时，React 调用 `onRender`，
报告这次提交的身份、阶段、渲染时长和时间戳。它适合回答以下问题：

- 哪个子树刚刚完成了提交？
- 这是首次挂载、普通更新还是前一轮 render 或 commit 安排的级联同步更新？
- 当前更新实际花了多少 React render 时间？
- 整棵子树不跳过工作时的基线估计是多少？
- 多个测量边界是否属于同一次 commit？

Profiler 的价值是先建立可重复的测量事实。只有环境、输入和交互路径一致，前后记录才具有可比性。

## 三、Profiler 的测量模型

### 1. 边界包裹一棵 React 子树

`<Profiler>` 不生成可见 DOM。它在 React 树中标记一个测量范围，范围包含它的所有后代组件。兄弟组件和
祖先组件不属于这个边界，除非另一个 Profiler 另外包裹它们。

```tsx
<main>
  <Navigation />
  <Profiler id="report" onRender={handleRender}>
    <Report />
  </Profiler>
</main>
```

这里的记录描述 `Report` 子树，不包含 `Navigation`。边界越贴近问题，记录中混入的无关工作越少。

### 2. 回调对应 commit，不对应按钮点击

React 可以为一次更新执行 render 工作，只有结果完成 commit 后才调用 `onRender`。因此记录的基本单位是
“某个 Profiler 边界完成的一次 commit”，不是点击次数、组件函数调用次数或 State setter 次数。

一次用户事件可能没有产生更新，也可能因为多个 State 更新被批处理而只产生一次 commit；提交阶段若又调度更新，
还可能产生额外的 `nested-update` 记录。应以回调数据为准，而不是按交互次数推算记录数。

### 3. Profiler 只测 React render 工作

`actualDuration` 和 `baseDuration` 描述 React 渲染组件树所用的时间。它们不直接测量：

- 网络请求和服务端响应；
- 事件发生前的空闲等待；
- 浏览器完整的样式计算、布局和绘制成本；
- 图片解码、资源下载和第三方脚本总耗时；
- 用户从输入到画面稳定的完整体验。

若问题属于上述范围，应结合浏览器性能工具或对应系统的测量方法，不能把 Profiler 数字当成页面总耗时。

## 四、基本语法与两个 Props

### 1. `id` 标识测量边界

`id` 是字符串。共享一个 callback 的多个 Profiler 依靠它区分来源，因此应使用稳定、能说明 UI 范围的名称，
例如 `"sidebar"`、`"report"` 或 `"editor-preview"`。不要使用随机数或随 render 变化的字符串。

### 2. `onRender` 接收 commit 数据

可以使用 React 导出的 `ProfilerOnRenderCallback` 类型约束回调参数：

```tsx
import { Profiler } from 'react'
import type { ProfilerOnRenderCallback } from 'react'

/** 记录报告子树每次 commit 的完整公开数据。 */
const handleRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  console.table({ id, phase, actualDuration, baseDuration, startTime, commitTime })
}

<Profiler id="report" onRender={handleRender}>
  <Report />
</Profiler>
```

`onRender` 的返回值会被忽略。回调应聚合或转交记录，不应把 duration 写回被测组件来改变它的渲染结果。

### 3. 多个与嵌套边界

多个 Profiler 可以使用同一个 callback：

```tsx
<Profiler id="sidebar" onRender={handleRender}>
  <Sidebar />
</Profiler>
<Profiler id="content" onRender={handleRender}>
  <Content />
</Profiler>
```

Profiler 也可以嵌套：

```tsx
<Profiler id="content" onRender={handleRender}>
  <Article />
  <Profiler id="comments" onRender={handleRender}>
    <Comments />
  </Profiler>
</Profiler>
```

嵌套时，外层 `content` 的范围包含内层 `comments`。两条记录可以帮助定位范围，但它们的 duration 有重叠，
不能相加成页面总耗时。

## 五、`onRender` 的六个参数

| 参数 | 类型或值 | 回答的问题 |
| --- | --- | --- |
| `id` | `string` | 哪个 Profiler 边界刚完成 commit？ |
| `phase` | `mount`、`update`、`nested-update` | 这次 commit 属于哪种阶段？ |
| `actualDuration` | 毫秒数 | 当前更新实际执行了多少 React render 工作？ |
| `baseDuration` | 毫秒数 | 整棵子树不跳过工作时的重渲染成本估计是多少？ |
| `startTime` | 数字时间戳 | React 何时开始渲染当前更新？ |
| `commitTime` | 数字时间戳 | React 何时提交当前更新？ |

六个参数需要成组保存。只保存一个无名称的数字，会丢失边界、阶段和环境解释，之后无法判断记录是否可比。

```ts
type RenderMeasurement = Readonly<{
  id: string
  phase: 'mount' | 'update' | 'nested-update'
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
}>
```

## 六、`phase` 的阶段语义

### 1. `mount`：边界首次挂载

当 Profiler 对应的树第一次提交时，`phase` 为 `mount`。它通常包含创建整棵被测子树所需的工作，可作为首次显示
成本的观察值。若组件因 `key` 改变而以新身份重新创建，新的 Profiler 边界也会再次出现 `mount`。

### 2. `update`：已挂载边界再次提交

Props、State 或 Hook 变化使边界内组件再次渲染并提交时，`phase` 为 `update`。事件中调用多个 setter 不保证产生
多条记录；React 可能把它们批处理到同一次 commit。

### 3. `nested-update`：级联同步更新

当前版本识别到前一轮 render 或 commit 安排了级联同步更新时，后续提交可能标记为 `nested-update`。它不是普通
输入事件的同义词，也不是“组件嵌套得很深”。这个值提示测量者检查 render、布局 Effect、Ref callback 或其他
提交阶段逻辑是否又安排了同步更新。具体判定属于当前版本实现细节，不能假定每一种级联更新都得到相同 phase。

### 4. render 次数不等于 commit 次数

组件函数可以执行但最终没有形成独立 commit。开发环境的 StrictMode 还可能额外调用 render 逻辑以发现不纯代码。
Profiler 回调描述已经完成的 commit，因此不能用组件函数执行次数替代 `onRender` 记录数。

## 七、两类 duration

### 1. `actualDuration` 描述当前更新

`actualDuration` 是当前更新中，Profiler 与其后代实际花在 render 上的毫秒数。若某些后代在当前更新中跳过工作，
这些跳过会反映在本次实际时长中。

它是当前环境中的测量值，不是组件的固定属性。同一个更新在不同设备、浏览器、构建模式或系统负载下会得到不同
数字。

### 2. `baseDuration` 描述完整重渲染估计

`baseDuration` 把子树中每个组件最近一次 render 时长相加，估计整棵 Profiler 子树在不跳过工作的情况下重新渲染
需要多久。它是基线估计，不是另一次真实执行的总耗时。

组件树、输入规模或组件最近一次 render 成本变化时，`baseDuration` 也可能变化。因此不能把首次读取的值永久保存为
跨版本常量。

### 3. 比较时保留两列

记录中应同时保留 `actualDuration` 与 `baseDuration`。当前实际时长明显低于完整重渲染估计，可以说明这次更新跳过了
部分工作；但单次差值不能证明某种实现永远更快，也不能替代对用户体验的完整测量。

## 八、两个时间戳

### 1. `startTime` 是渲染开始时间

`startTime` 表示 React 开始渲染当前更新的数字时间戳。它不是渲染时长，不能与 `actualDuration` 混用。并发或被中断
的工作可能让“开始到提交”的跨度大于实际 render 时长，因此不要用 `commitTime - startTime` 替代
`actualDuration`。

### 2. `commitTime` 是提交时间

`commitTime` 表示 React 提交当前更新的数字时间戳。同一次 commit 中的所有 Profiler 回调共享相同的
`commitTime`，因此可以用它把不同 `id` 的记录归到同一组。

```ts
function groupKey(record: RenderMeasurement): string {
  return `${record.commitTime}`
}
```

时间戳适合排序和归组，不代表浏览器从输入到绘制完成的完整耗时。

## 九、设计可解释的测量边界

### 1. 先写出要回答的问题

如果问题是“报告列表更新花了多少 render 时间”，边界应包裹报告列表，而不是整个应用。若问题进一步缩小到某个行
编辑器，可以在列表内部增加一个有明确 `id` 的嵌套边界。

### 2. 让 `id` 稳定且可归因

稳定 `id` 使多次记录可以按同一 UI 范围比较。多个边界共享 callback 时，应避免重复或动态变化的 `id`，否则记录
仍然存在，但无法可靠判断来自哪个范围。

### 3. 不把嵌套记录直接相加

外层 Profiler 已经包含内层子树的 render 工作。把外层与内层 duration 相加会重复计算内层成本。正确做法是分别
观察：外层回答整段内容的成本，内层帮助判断其中哪个局部范围占用了工作。

### 4. 让记录界面位于边界之外

`onRender` 为展示日志而更新 State 时，拥有这份 State 的更新路径不能重新经过同一个 Profiler。仅把日志画成视觉上的
兄弟组件并不够；若共同父组件持有日志 State，父组件更新仍会重新渲染被测边界。可以把记录交给不会更新该边界的独立
所有者，或先写入不触发 render 的 ref，再由隔离的展示层读取。否则新的 callback 会继续写日志，测量被观察工具污染。

## 十、收集与比较数据

### 1. 固定环境和交互路径

比较前需要固定浏览器、构建模式、输入规模、初始 State 和操作顺序。例如每轮都从轻负载开始，连续触发三次同类
`update`，再对另一实现重复完全相同的步骤。

### 2. 为每条记录保留场景信息

除了六个 callback 参数，还可以记录不会改变被测树的场景标签，例如 `scenario: 'filter-list'` 和输入规模。标签用于
解释数据，不应在 `onRender` 中反向修改被测子树。

### 3. 使用多次同类样本

单次毫秒读数容易受到系统负载和运行时状态影响。应收集多次同类 `update`，先检查样本是否属于相同边界、阶段和输入，
再比较整体分布或中位数。样本条件不一致时，更多数字也不能形成可靠结论。

### 4. 记住测量本身有开销

每个 Profiler 都会增加 CPU 和内存开销。只在真正需要回答问题的范围保留测量边界，不要为了“以后可能有用”给每个
组件都套 Profiler。测量结果用于相同条件下的比较，不等同于无测量时的绝对成本。

## 十一、开发与 profiling 构建边界

### 1. 开发构建可直接观察 callback

React 开发构建可以产生 Profiler callback，适合学习参数语义、验证边界和建立可重复的本地场景。开发期还包含额外
检查和调试信息，duration 不应直接当成普通 production build 的时长。

### 2. 普通 production build 默认关闭 profiling

React 官方说明 profiling instrumentation 有额外开销，因此普通 production build 默认禁用。页面仍会正常渲染，
但零条 callback 记录只说明当前构建没有提供 profiling 数据，不代表渲染成本为零。

### 3. production profiling 使用专用构建

需要在生产优化条件下采集时，应使用 React 提供的 profiling build。React 官方文档说明可让构建工具把
`react-dom/client` 映射到 `react-dom/profiling`；具体开关取决于使用的框架或构建工具。

普通 production build、开发构建和 profiling build 是三种不同证据环境。比较数据时必须记录使用的是哪一种，不能
把它们的 duration 混为同一组样本。

## 十二、用法示例或 Demo

下面的 Demo 把确定性的报告计算放进 Profiler，把 commit 日志放在边界外：

- 首次进入产生一条 `mount` 记录。
- “触发一次 update”只改变报告版本，产生一条可归因的 `update`。
- 切换轻、中、重负载会改变确定性计算规模，并产生新的 `update`。
- 最近记录显示 `id`、`phase`、`actualDuration`、`baseDuration`、`startTime` 与 `commitTime`。
- 历史区保留最近六次记录的全部六个参数，便于比较同类 commit。
- 记录保存在非渲染 ref 中；“清空记录”直接更新边界外的日志，不重新渲染被测报告。

毫秒值会随运行环境变化，观察重点是字段语义、记录阶段和交互是否产生预期 commit，而不是复现某个固定数字。

:::demo{id="react.core.learn.advanced.profiler-render-measurement.commit-duration-demo"}
:::

## 十三、易错使用提示

:::pitfalls
### 错误：把单次 duration 当成绝对性能结论

**触发条件：** 只运行一次 update，就断言某个实现一定更快。

**原因：** 毫秒读数会受设备、构建模式、浏览器和系统负载影响，单次样本可能只是波动。

**后果：** 优化判断不可复现，甚至会保留没有收益的复杂代码。

**错误示例：**

```tsx
/** 错误：一个样本不能代表稳定趋势。 */
function onRender(_id: string, _phase: string, actualDuration: number) {
  if (actualDuration < 5) console.log('优化已经成功')
}
```

**正确写法：**

```tsx
/** 正确：按相同场景保存每次 commit，之后比较一组样本。 */
function recordDuration(actualDuration: number) {
  samples.push(actualDuration)
}
```

**验证方式：** 在相同环境重复同一路径，确认结论来自多条同类 `update` 记录而不是单个数字。

### 错误：把 actualDuration 和 baseDuration 当成同一个指标

**触发条件：** 只显示一个无标签的“渲染耗时”，或直接用两者相减判定所有优化是否有效。

**原因：** 前者是本次实际渲染成本，后者是整棵子树无优化重渲染的基线估计，语义不同。

**后果：** 使用者不知道数字描述当前工作还是基线，比较结果失去解释力。

**错误示例：**

```tsx
const duration = actualDuration || baseDuration
```

**正确写法：**

```tsx
const record = { actualDuration, baseDuration }
```

**验证方式：** 检查记录和界面，确认两个字段独立命名、独立保存，且说明各自语义。

### 错误：让日志更新落在被测边界内部

**触发条件：** `onRender` 更新一个位于 `<Profiler>` 后代中的日志组件 State。

**原因：** 写日志本身会再次更新被测子树，新的 commit 又会调用 `onRender`。

**后果：** 测量被观察工具污染，严重时形成连续更新。

**错误示例：**

```tsx
<Profiler id="report" onRender={() => setRecords((items) => [...items, Date.now()])}>
  <Report />
  <MeasurementLog records={records} />
</Profiler>
```

**正确写法：**

```tsx
const recordsRef = useRef<RenderMeasurement[]>([])

/** 只写入不会触发 render 的记录容器。 */
const handleRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  recordsRef.current.push({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  })
}

<Profiler id="report" onRender={handleRender}>
  <Report />
</Profiler>
```

**验证方式：** 清空或追加日志时观察 commit 数；日志自身更新不应额外产生被测记录。

### 错误：把普通 production build 的零回调当成测量结果

**触发条件：** 只在普通生产构建中打开页面，看到没有记录就认定子树没有渲染成本。

**原因：** React 官方说明 profiling 在 production build 中默认关闭。

**后果：** “没有证据”被误写成“成本为零”，课程行为也无法真正验收。

**错误示例：**

```tsx
// 错误：零条 callback 记录不等于零渲染成本。
const renderCost = records.length === 0 ? 0 : records[0]!.actualDuration
```

**正确写法：**

```tsx
// 正确：使用开发构建或专用 profiling build 收集 callback 证据。
const hasMeasurement = records.length > 0
```

**验证方式：** 在支持 profiling 的构建中确认先出现 `mount`，交互后再出现 `update`。

### 错误：把时间戳相减当成 actualDuration

**触发条件：** 用 `commitTime - startTime` 代替 `actualDuration`，并把结果标为“React 渲染耗时”。

**原因：** 两个时间戳描述开始与提交时点，中间跨度不等于 React 实际执行 render 工作的时长。

**后果：** 等待、调度或被中断工作的时间被混入 render 指标，字段语义失真。

**错误示例：**

```tsx
const renderDuration = commitTime - startTime
```

**正确写法：**

```tsx
const record = { actualDuration, startTime, commitTime }
```

**验证方式：** 检查记录结构，确认 duration 与两个 timestamp 独立保存，界面没有把时间戳差值命名为
`actualDuration`。

### 错误：把嵌套 Profiler 的 duration 相加

**触发条件：** 外层 `content` 包含内层 `comments`，统计时直接计算两条记录的 duration 总和。

**原因：** 外层 Profiler 的测量范围已经包含内层子树，两条数据存在重复计算部分。

**后果：** 内层工作被计算两次，得到的“页面总成本”高于当前 Profiler 实际报告的范围。

**错误示例：**

```tsx
const total = contentRecord.actualDuration + commentsRecord.actualDuration
```

**正确写法：**

```tsx
const contentCost = contentRecord.actualDuration
const commentsShare = commentsRecord.actualDuration
```

**验证方式：** 画出两个边界的包含关系，确认外层用于整体观察、内层用于局部归因，而不是求和。

### 错误：用组件函数执行次数推算 commit 数

**触发条件：** 在组件函数顶部累加计数，并假设每次执行都会产生一条 Profiler 记录。

**原因：** render 工作不一定形成独立 commit；开发 StrictMode 还可能额外调用 render 逻辑。

**后果：** 函数计数与 `onRender` 记录数量不一致，被误判为 Profiler 丢失数据。

**错误示例：**

```tsx
function Report() {
  renderCalls += 1
  return <article>{renderCalls} 次 commit</article>
}
```

**正确写法：**

```tsx
function onRender(_id: string, phase: string) {
  commitRecords.push({ phase })
}
```

**验证方式：** 分别观察组件函数计数与 callback 记录，确认 commit 结论只来自 `onRender`。

### 错误：让 Profiler id 随 render 变化

**触发条件：** 使用随机数、时间或当前输入拼接 `id`，导致同一 UI 范围每次记录名称不同。

**原因：** 把测量边界的稳定身份误当成一次记录的唯一编号。

**后果：** 同一子树的样本被拆散，多个边界共享 callback 时无法按来源持续比较。

**错误示例：**

```tsx
<Profiler id={`report-${Date.now()}`} onRender={handleRender}>
  <Report />
</Profiler>
```

**正确写法：**

```tsx
<Profiler id="report" onRender={handleRender}>
  <Report />
</Profiler>
```

**验证方式：** 连续触发多次同类更新，确认同一 UI 范围的每条记录都使用相同 `id`。
:::

## 十四、源码推导与适用场景

### 1. 官方事实：回调参数属于公共 API

React 19.2 官方文档定义了 `<Profiler id onRender>`、三种 `phase`、两类 duration 和两个时间戳，并说明
`onRender` 在被测树提交更新时调用。业务代码可以依赖这些公开参数的语义。

### 2. 固定源码事实：数据在 commit 阶段交给 callback

React `v19.2.8` 的 `ReactFiberCommitEffects.js` 在 `commitProfiler` 中执行以下步骤：

1. 根据是否存在当前 Fiber 选择 `mount` 或 `update`。
2. 启用嵌套更新阶段且当前更新属于嵌套更新时，把 phase 改为 `nested-update`。
3. 调用公开 `onRender`，传入 `id`、phase、`actualDuration`、`treeBaseDuration`、`actualStartTime` 和
   `commitStartTime`。

这些内部字段说明固定版本如何支撑公开语义，不承诺 Fiber 字段名、特性开关或内部函数结构在其他版本保持不变。

### 3. 课程推导：先划分问题，再解释数字

因为记录绑定 Profiler 边界和 commit，测量设计应先确定 UI 范围与可重复交互，再收集完整参数。只拿一个 duration
数字而没有 `id`、`phase`、环境和输入，无法形成可归因的性能结论。

### 4. 适用场景

Profiler 适合：

- 程序化记录某棵 React 子树的 mount 与 update 成本；
- 比较同一边界在相同交互下的多次 render 样本；
- 用多个边界定位较大的 render 工作来自哪个 UI 范围；
- 在 profiling build 中采集生产优化条件下的 React render 数据。

Profiler 不负责网络、完整浏览器帧、布局绘制、内存泄漏或真实用户端到端体验。遇到这些问题时，需要使用与问题
相匹配的网络、浏览器性能、内存或用户体验测量工具。

## 十五、练习

:::exercise
### 练习一：解释一条完整记录

**要求：** 从 Demo 的最近记录中依次说明 `id`、`phase`、`actualDuration`、`baseDuration`、`startTime` 与
`commitTime` 的含义，并指出哪些是 duration、哪些是 timestamp。

**验收：** 六个参数均能对应到公开语义；没有把 `commitTime - startTime` 称为 `actualDuration`，也没有把
`baseDuration` 说成另一次真实执行耗时。
:::

:::exercise
### 练习二：建立同类 update 样本

**要求：** 保持轻负载，连续触发至少三次报告更新；记录每次的 `phase` 与两类 duration，再在相同环境下重复一轮。

**验收：** 交互记录均为同一 `id` 的 `update`；结论基于多条同类样本，不使用单个最快或最慢数字代表整体。
:::

:::exercise
### 练习三：设计嵌套测量边界

**要求：** 为一个包含 `Article`、`Comments` 和 `Preview` 的内容区画出外层 `content` 与内层 `comments` 两个
Profiler，并说明两条记录如何解释。

**验收：** `comments` 位于 `content` 内部；能够说明两条 duration 范围重叠、不能相加，并能用相同
`commitTime` 判断它们是否属于同一次 commit。
:::

:::exercise
### 练习四：判断构建证据

**要求：** 分别说明开发构建、普通 production build 和 profiling build 是否能提供 Profiler callback，以及零条
记录可以支持什么结论。

**验收：** 能指出普通 production build 默认关闭 profiling；零条记录不能证明渲染成本为零；需要生产优化条件下的
数据时选择 profiling build，并记录当前证据环境。
:::

## 十六、本节小结

- `<Profiler>` 标记一棵被测 React 子树，`id` 为边界提供稳定身份。
- `onRender` 按 commit 报告数据，组件函数调用次数和用户事件次数都不能替代 commit 记录。
- `phase` 区分 `mount`、`update` 与 `nested-update`。
- `actualDuration` 描述当前更新的实际 render 工作，`baseDuration` 描述完整重渲染成本估计。
- `startTime` 和 `commitTime` 是时间戳；同一 commit 的多个边界共享 `commitTime`。
- 嵌套 Profiler 的测量范围重叠，外层和内层 duration 不能直接相加。
- 测量边界、输入、环境和交互路径必须固定，多次同类样本才具有可比性。
- 测量日志应位于被测边界之外，避免记录行为反向污染数据。
- 普通 production build 默认关闭 profiling；开发构建与 profiling build 才提供对应环境的 callback 证据。

## 十七、参考资料

- [Profiler](https://react.dev/reference/react/Profiler) - `id`、`onRender`、多个与嵌套边界、测量开销及 production
  默认关闭 profiling 的公共规则，适用于 React 19.2。
- [Profiler onRender callback](https://react.dev/reference/react/Profiler#onrender-callback) - 六个 callback 参数、
  三种 phase 与 commitTime 归组语义。
- [Using profiling builds](https://react.dev/reference/dev-tools/react-performance-tracks#using-profiling-builds) -
  profiling build 与 `react-dom/profiling` 的官方边界。
- [React 19.2.8 ReactFiberCommitEffects 源码](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L935-L995) -
  固定版本在 commit 阶段选择 phase 并传递 duration 与 timestamp 的实现佐证。
