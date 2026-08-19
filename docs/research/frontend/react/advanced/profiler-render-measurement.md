# Profiler 渲染测量研究记录

## 调研范围

- 核验日期：`2026-08-17`
- 公开文档基线：React `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 运行时固定提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- 类型基线：`@types/react@19.2.18`
- 文档固定提交：`reactjs/react.dev@383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`

本记录只研究 `<Profiler>` 的编程式渲染测量：commit 级回调、`onRender` 六个参数、
`mount | update | nested-update`、两类 duration、两个时间戳、多区域与嵌套测量，以及 development、
普通 production、profiling production 三种构建的能力边界。

以下内容不进入知识范围：React DevTools 完整教程、React Performance tracks 完整教程、浏览器
Performance 面板操作、Core Web Vitals、线上性能平台、遥测上报、统计显著性系统、React Compiler、
Fiber 架构深入、调度器实现深入、服务端组件，以及 `memo`、`useMemo`、`useCallback` 的优化教学。

## 调研方法与证据等级

1. 先使用 Tavily 在 `react.dev` 与 `github.com/facebook/react` 中发现候选资料。
2. 公开 API 语义以 React `19.2` 官方 Reference 为准，并用固定文档提交防止页面滚动更新后无法追溯。
3. 构建开关、phase 选择、回调位置和嵌套测量只引用 React `v19.2.8` 固定源码与官方测试；这些实现
   细节只用于解释当前版本，不扩张成跨版本公共保证。
4. TypeScript 形状以当前仓库锁定的 `@types/react@19.2.18` 为准。
5. 搜索摘要与社区资料只用于发现问题，不承担事实证明。

## 官方来源卡

| 编号 | 一手来源 | 固定范围 | 支撑事实 |
| --- | --- | --- | --- |
| S1 | [`<Profiler>` Reference](https://react.dev/reference/react/Profiler) | React `19.2` | Props、六个回调参数、多区域、嵌套 Profiler、开销、普通 production 默认关闭 profiling。 |
| S2 | [固定 `<Profiler>` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/Profiler.md) | 文档提交 `383a1e9...` | 固定 S1 的公开合同。 |
| S3 | [React Performance tracks：Using profiling builds](https://react.dev/reference/dev-tools/react-performance-tracks#using-profiling-builds) | React `19.2` | development、production、profiling build 的区分，以及 `react-dom/client` 到 `react-dom/profiling` 的 alias 建议。 |
| S4 | [固定 Performance tracks 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/dev-tools/react-performance-tracks.md#using-profiling-builds) | 文档提交 `383a1e9...` | 固定特殊 profiling build 的接入说明。 |
| S5 | [`ReactTypes.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/shared/ReactTypes.js#L364-L382) | React `v19.2.8` | 内部 Flow 类型中的三值 phase 和六个公开测量参数。 |
| S6 | [`ReactFiberCommitEffects.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitEffects.js#L934-L992) | React `v19.2.8` | commit 路径根据 `current` 与 nested-update 标记选择 phase，并调用 `onRender`。 |
| S7 | [`ReactFeatureFlags.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/shared/ReactFeatureFlags.js#L224-L243) | React `v19.2.8` | Profiler timer、commit hooks、nested-update phase 都受 `__PROFILE__` 控制。 |
| S8 | [`ReactProfilerTimer.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactProfilerTimer.js#L533-L563) 与 [`ReactFiberWorkLoop.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberWorkLoop.js#L4151-L4178) | React `v19.2.8` | 当前版本如何标记并在下一轮渲染读取级联同步更新。 |
| S9 | [`ReactProfiler-test.internal.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/__tests__/ReactProfiler-test.internal.js#L285-L689) | React `v19.2.8` 官方测试 | mount/update 六参数据、嵌套与同级 Profiler、bailout、baseDuration、nested-update 序列。 |
| S10 | [`react-dom/profiling`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/npm/profiling.js) 与 [`react-dom/client`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/npm/client.js) | React DOM `v19.2.8` | production profiling bundle 与普通 production client bundle 是不同入口。 |
| S11 | [`ProfilerOnRenderCallback`](https://unpkg.com/@types/react@19.2.18/index.d.ts) | `@types/react@19.2.18` | TypeScript callback 的六个参数、三值 phase、`ProfilerProps`。 |
| S12 | [`<StrictMode>` Reference](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-double-rendering-in-development) 与 [`useMemo` 测量说明](https://react.dev/reference/react/useMemo#how-to-tell-if-a-calculation-is-expensive) | React `19.2` | development 额外检查会影响 render 次数和测量精度，准确性能结论应在面向用户的生产形态中复核。 |
| S13 | [React Versions](https://react.dev/versions) | `2026-08-17` 页面 | `react.dev` 提供当前 major 的最新文档，不为每个 minor 或 patch 单独维护文档站。 |

## 核心结论

### 1. Profiler 观测的是已提交的 React 子树渲染

`<Profiler>` 接收字符串 `id` 和 `onRender` 回调。只要被包裹区域参与一次已提交更新，React 就向
回调提供该区域的渲染测量数据（S1、S2）。固定 `v19.2.8` 实现也把 `onRender` 放在 commit effects
路径中，并由 profiling timer 开关保护（S6、S7）。

因此一条回调记录的单位是“某个 Profiler 区域的一次 commit”，不是以下任一单位：

- 组件函数调用一次；
- 用户点击一次；
- 浏览器绘制一帧；
- 一次完整交互从输入到像素更新的总耗时；
- 某个组件为什么渲染的原因分析。

被中断后放弃、没有提交的渲染不会单独产生一条完成记录。一次用户操作可能产生多次 commit；同一次
commit 也可能让多个 Profiler 分别回调。

### 2. `id` 标识测量区域，`onRender` 接收六个参数

React `19.2` 的公开回调形状如下（S1、S11）：

```tsx
import type { ProfilerOnRenderCallback } from 'react'

/** 接收一个 Profiler 区域提交后的六项测量数据。 */
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
```

六个参数的顺序与含义不能自行缩减。旧资料中的第七个 `interactions` 参数不在 React `19.2` 当前
Reference 和 `@types/react@19.2.18` 合同中。

`id` 应稳定地对应一个区域。多个区域使用可区分的 id，才能在共同回调或聚合结果中准确归属记录。

### 3. `phase` 包含 mount、update、nested-update

React `19.2` 公开三种 phase（S1、S5、S11）：

| phase | 含义 |
| --- | --- |
| `mount` | 该 Profiler 子树首次完成挂载提交。若子树被卸载后重新挂载，新的生命周期仍会出现 `mount`。 |
| `update` | Props、State 或 Hook 变化使该区域重新渲染并提交。 |
| `nested-update` | 当前版本识别到由前一轮渲染或 commit 安排的级联同步更新后，对后续提交使用的 phase。 |

固定 `v19.2.8` 源码先用 `current === null` 区分 `mount` 与 `update`，再在当前更新被标记为 nested 时把
phase 改为 `nested-update`（S6）。工作循环在一次完成更新又留下同步更新时标记下一轮，官方测试中的
`useLayoutEffect` 同步更新得到 `mount -> nested-update`；后续由 passive Effect 产生的更新回到
`update`（S8、S9）。

`nested-update` 属于公开返回值，但其识别细节由当前实现决定。应用应原样保存三值，不应依赖某个交互
必然产生 `nested-update`，也不应为了展示这个值主动制造级联更新。

### 4. `actualDuration` 表示当前提交实际完成的 React render 工作

`actualDuration` 是本次更新中渲染 `<Profiler>` 及其后代所花的毫秒数（S1）。它反映当前提交里该
区域真正执行的 render 工作量。若子树能够跳过部分组件，更新时的 `actualDuration` 可能明显低于整树
基线；固定测试也覆盖了 bailout 后 actual time 降低的情况（S9）。

它不等于：

- 事件处理器耗时；
- 网络或异步等待时间；
- DOM 布局、绘制、合成耗时；
- 从输入开始到用户看到结果的端到端延迟；
- 整个页面或其他 Profiler 区域的工作量。

正确表述应是“当前 Profiler 子树在这次提交中的 React render cost”。

### 5. `baseDuration` 是整棵子树的滚动估算基线

`baseDuration` 估算整个 Profiler 子树在没有优化时重新渲染的成本。React 将树中各组件最近一次
render duration 相加，得到近似的最坏情况基线（S1、S2）。

“最近一次”带来三个重要边界：

1. 它不是首次 `mount` 的永久快照。
2. 子组件以后真正渲染时，最近时长可能更新，基线也可能变化。
3. 它是估算值，不是业务正确性阈值，也不应由应用自行把历史 actual 值相加重算。

固定 `v19.2.8` 测试中，子组件被 bailout 后，更新的 `actualDuration` 只包含实际重新渲染的部分，而
`baseDuration` 仍保留整树最近成本，直接体现两者的责任差异（S9）。

### 6. `startTime` 与 `commitTime` 用于定位和 commit 分组

- `startTime`：React 开始渲染当前更新时的数值时间戳。
- `commitTime`：React 提交当前更新时的数值时间戳。

同一次 commit 中的所有 Profiler 共享 `commitTime`，因此可以用完全相同的 `commitTime` 将多个区域
记录归为同一组（S1、S2）。嵌套区域可以有不同的 `startTime`，因为各区域开始 render 的时刻不同，
但在同一提交中具有相同 `commitTime`；固定测试对此给出了确定数据（S9）。

`commitTime - startTime` 是两个时间点的间隔，不是 `actualDuration` 的替代公式。并发或可中断渲染
期间可能存在让出执行权、其他区域工作等时间，而 `actualDuration` 表达的是被测区域实际 render 工作。
应用也不应把这两个数值直接当成 Unix 时间戳转换为日期。

### 7. 多个 Profiler 可以并列，也可以嵌套

并列 Profiler 适合测量互不重叠的页面区域；嵌套 Profiler 适合同时观察一个大区域和其中的局部区域
（S1、S2）：

```tsx
import { Profiler } from 'react'

/** 分别记录内容区整体与编辑器局部的提交数据。 */
function ContentArea() {
  return (
    <Profiler id="content" onRender={handleRender}>
      <ContentHeader />
      <Profiler id="editor" onRender={handleRender}>
        <Editor />
      </Profiler>
    </Profiler>
  )
}
```

固定 `v19.2.8` 官方测试确认：嵌套时父级 duration 包含子级 duration，同一 commit 的 child 与 parent
共享 `commitTime`（S9）。因此：

- 父级 `actualDuration` 是整个父区域的成本，其中已经包含子区域；
- 子级 `actualDuration` 是局部切片；
- 把父级和子级数值相加会重复计算；
- 固定测试当前观察到子级回调先于父级回调，但公开文档没有承诺回调顺序，业务逻辑不得依赖这个顺序；
- 同级 Profiler 的 duration 可分别归属，各自不包含同级区域的工作。

### 8. development、普通 production、profiling production 是三种不同环境

| 构建环境 | Profiler 测量 | 适合用途 | 主要边界 |
| --- | --- | --- | --- |
| development | 开启 | 验证回调、字段、分组和交互路径 | 含额外检查与调试开销，Strict Mode 还可能额外调用 render，毫秒值不代表面向用户的生产表现。 |
| 普通 production | 默认关闭 | 验证普通生产功能 | 业务 UI 可以正常工作，但不能把零回调解释为没有渲染成本。 |
| profiling production | 显式开启 | 在接近生产优化的构建中采集 Profiler 数据 | 仍有 profiling 开销，必须明确启用特殊入口，不能与普通 production 混称。 |

React `19.2` 官方建议在构建时把 `react-dom/client` alias 到 `react-dom/profiling`，而不是逐个修改业务
import（S3、S4）。固定 npm 入口也显示：普通 production 加载
`react-dom-client.production.js`，特殊入口加载 `react-dom-profiling.profiling.js`（S10）。

示意配置如下，具体框架若提供内置开关应优先使用框架文档支持的方式：

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      'react-dom/client': 'react-dom/profiling',
    },
  },
})
```

这个 alias 只应存在于明确命名的 profiling 构建中，不能无提示地替换普通 production。

### 9. Profiler 数据适合受控比较，不适合冻结绝对毫秒值

Profiler 本身会增加 CPU 与内存开销，应只包裹确实需要测量的区域（S1、S2）。测量还会受到设备、
浏览器、构建模式、热身状态、后台任务和输入数据影响。官方也明确指出 development 测量不够准确，
Strict Mode 会造成额外 render（S12）。

有效比较至少保持以下条件一致：

- 同一构建模式；
- 同一设备与浏览器；
- 同一 Profiler 边界；
- 同一输入数据和用户路径；
- 同一轮比较中只改变一个待研究变量；
- 重复采样，保留原始记录，不用单次偶然值下结论。

功能验证只应检查 callback 是否出现、字段是否为有限非负数、phase 与 commit 分组是否合理。性能判断
再基于同环境重复样本比较；不能用固定的 `5ms`、`16ms` 或一次样本作为跨机器通用标准。

## 固定源码与测试推导

### 推导一：回调属于 commit 证据

- **官方事实：** Reference 说明 React 在被测区域提交更新时调用 `onRender`；`v19.2.8` 的
  `commitProfilerUpdate` 在 commit effects 路径调用该回调（S1、S6）。
- **使用推导：** 记录应按 `id + commitTime` 归属 Profiler 区域和 commit，不用组件函数计数代替。
- **边界：** 这不证明一次用户操作只有一次 commit，也不覆盖浏览器 paint 完成时间。

### 推导二：nested-update 是级联同步更新的可观察标签

- **官方事实：** React `19.2` 公开三值 phase；固定工作循环会在已完成工作又安排同步更新时设置 nested
  标记，固定测试验证 layout Effect 触发的后续提交得到 `nested-update`（S1、S8、S9）。
- **使用推导：** 数据结构和展示逻辑必须保留 `nested-update`，排查时优先检查 render 或 layout
  Effect 中安排的同步更新。
- **边界：** nested 判定是固定版本实现细节；不能保证所有级联、所有 Effect 或未来版本都给出相同
  phase 序列。

### 推导三：嵌套区域是重叠测量，不是可直接求和的分片

- **官方事实：** Reference 允许嵌套 Profiler；固定测试确认父级 duration 包含子级 duration（S1、S9）。
- **使用推导：** 父级用于整体成本，子级用于定位局部；报告中分别展示，不把二者相加。
- **边界：** 固定测试中的 child-first 回调顺序不是公开 API 保证。

### 推导四：特殊 production profiling 必须显式选择

- **官方事实：** 普通 production 默认关闭 profiling；React `19.2` 要求使用
  `react-dom/profiling`，固定 npm 文件加载不同 production bundle（S1、S3、S10）。
- **使用推导：** 构建产物和测量报告必须标明是 ordinary production 还是 profiling production。
- **边界：** 不同框架可能封装 alias；升级 React 或构建工具后需重新核验官方接入方式。

## 高价值易错点

### 1. 在普通 production 中等待 `onRender`

- **触发条件：** 使用正常 production bundle，却把“必须收到 callback”写成运行条件。
- **原因：** React 为避免 profiling 开销，默认在普通 production 中关闭 Profiler timer。
- **后果：** 页面正常渲染但记录为空，开发者误判为组件没有提交或回调代码损坏。
- **错误示例：**

```tsx
import { Profiler } from 'react'
import { createRoot } from 'react-dom/client'

// 错误：假设普通 production 的 client 入口必然提供测量 callback。
createRoot(document.getElementById('root')!).render(
  <Profiler id="app" onRender={handleRender}>
    <App />
  </Profiler>,
)
```

- **正确示例：**

```ts
import { defineConfig } from 'vite'

// 正确：只在明确的 profiling 构建中替换 client 入口。
export default defineConfig({
  resolve: {
    alias: {
      'react-dom/client': 'react-dom/profiling',
    },
  },
})
```

- **适用版本：** React / React DOM `19.2`；固定实现核验到 `19.2.8`。
- **来源：** S1、S3、S7、S10。

### 2. 把 phase 缩窄成 mount/update 两值

- **触发条件：** 自定义二值联合类型或 switch 只接受 `mount`、`update`。
- **原因：** 沿用旧心智模型，遗漏 React `19.2` 的公开 `nested-update`。
- **后果：** 类型与运行时合同不一致；级联同步更新出现时，数据被丢弃、误标或进入异常分支。
- **错误示例：**

```tsx
type Phase = 'mount' | 'update'

/** 错误：二值类型无法表示当前公开合同。 */
function savePhase(phase: Phase) {
  console.log(phase)
}
```

- **正确示例：**

```tsx
import type { ProfilerOnRenderCallback } from 'react'

type Phase = Parameters<ProfilerOnRenderCallback>[1]

/** 正确：原样保存官方类型中的三种 phase。 */
function savePhase(phase: Phase) {
  console.log(phase)
}
```

- **适用版本：** React `19.2`、`@types/react@19.2.18`。
- **来源：** S1、S5、S6、S9、S11。

### 3. `onRender` 更新包含被测边界的 React State

- **触发条件：** callback 调用 State setter，而这份 State 所在组件重新渲染时会再次经过同一个
  Profiler。
- **原因：** 写测量日志本身又安排 React 更新，污染被测路径。
- **后果：** 一次真实更新产生额外 commit，可能形成 nested-update、重复记录，严重时形成更新循环。
- **错误示例：**

```tsx
/** 错误：日志 State 与被测边界属于同一个会反复更新的组件。 */
function App() {
  const [rows, setRows] = useState<string[]>([])

  return (
    <Profiler id="app" onRender={(_, phase) => setRows((items) => [...items, phase])}>
      <MeasuredArea />
      <Log rows={rows} />
    </Profiler>
  )
}
```

- **正确示例：**

```tsx
const measurements: string[] = []

/** 正确：采集动作不安排被测 React 树再次更新。 */
const handleRender: ProfilerOnRenderCallback = (_, phase) => {
  measurements.push(phase)
}

<Profiler id="measured-area" onRender={handleRender}>
  <MeasuredArea />
</Profiler>
```

- **适用版本：** 所有支持 `<Profiler>` 的 React 版本；phase 例子按 React `19.2`。
- **来源：** S1、S6、S8、S9。

### 4. 用组件函数调用次数代替 commit 数量

- **触发条件：** 在组件函数体递增全局变量，并认为该变量应与 `onRender` 条数一一对应。
- **原因：** development Strict Mode 可额外调用 render；并发渲染也可能开始后被中断而不提交。
- **后果：** 开发环境看似多出提交，普通 production 又出现不同结果，测量单位被混淆。
- **错误示例：**

```tsx
let renderCount = 0

/** 错误：函数执行不是 commit 证据。 */
function Report() {
  renderCount += 1
  return <p>render: {renderCount}</p>
}
```

- **正确示例：**

```tsx
let commitCount = 0

/** 正确：只在 Profiler callback 中累计被测区域的 commit。 */
const handleRender: ProfilerOnRenderCallback = () => {
  commitCount += 1
}
```

- **适用版本：** React `19.2`，development Strict Mode 边界同样适用。
- **来源：** S1、S6、S9、S12。

### 5. 把 `actualDuration` 当成端到端交互延迟

- **触发条件：** 将 callback 的 `actualDuration` 直接标记成“点击响应耗时”或“页面总耗时”。
- **原因：** 忽略它只覆盖当前 Profiler 子树的 React render 工作。
- **后果：** 网络、事件处理、DOM 布局、绘制等成本被遗漏，结论超出数据能证明的范围。
- **错误示例：**

```tsx
/** 错误：把局部 render duration 命名为完整交互延迟。 */
const handleRender: ProfilerOnRenderCallback = (_, __, actualDuration) => {
  report({ interactionLatencyMs: actualDuration })
}
```

- **正确示例：**

```tsx
/** 正确：字段名明确限定为被测 React 子树的 render 成本。 */
const handleRender: ProfilerOnRenderCallback = (id, _, actualDuration) => {
  report({ regionId: id, reactRenderMs: actualDuration })
}
```

- **适用版本：** React `19.2`；语义来自当前公开 Reference。
- **来源：** S1、S2。

### 6. 把首次 `baseDuration` 永久冻结为 baseline

- **触发条件：** 只保存 mount 的 base 值，后续记录继续展示这一个旧值。
- **原因：** 误以为 `baseDuration` 是初次挂载耗时，而官方定义使用各组件最近一次 render duration。
- **后果：** 子树成本变化后，展示值不再对应 React 当次报告的整树估算。
- **错误示例：**

```tsx
let frozenBase: number | undefined

/** 错误：忽略后续 commit 提供的新 baseDuration。 */
const handleRender: ProfilerOnRenderCallback = (_, __, ___, baseDuration) => {
  frozenBase ??= baseDuration
  report({ baseDuration: frozenBase })
}
```

- **正确示例：**

```tsx
/** 正确：每条 commit 都保存 React 当次提供的估算。 */
const handleRender: ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration) => {
  report({ id, phase, actualDuration, baseDuration })
}
```

- **适用版本：** React `19.2`；固定实现核验到 `19.2.8`。
- **来源：** S1、S2、S9。

### 7. 用 `commitTime - startTime` 重算 `actualDuration`

- **触发条件：** 忽略 callback 的 duration 参数，用两个时间戳相减替代。
- **原因：** 把墙钟间隔与被测区域实际执行 render 的时间混为一谈。
- **后果：** 可中断渲染、其他区域工作或让出执行权时，重算值包含不属于该区域的间隔。
- **错误示例：**

```tsx
/** 错误：时间戳差不是 actualDuration 的定义。 */
const handleRender: ProfilerOnRenderCallback = (_, __, ___, ____, startTime, commitTime) => {
  report({ actualDuration: commitTime - startTime })
}
```

- **正确示例：**

```tsx
/** 正确：duration 用于成本，commitTime 用于同 commit 分组。 */
const handleRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  report({ id, phase, actualDuration, baseDuration, startTime, commitTime })
}
```

- **适用版本：** React `19.2`；固定测试核验到 `19.2.8`。
- **来源：** S1、S2、S9。

### 8. 把嵌套 Profiler 的父子 duration 相加

- **触发条件：** 同一 commit 中对 parent 与 child 的 `actualDuration` 求和，作为总成本。
- **原因：** 嵌套父区域已经包含子区域的 render 时间。
- **后果：** 子区域被重复计算，总数系统性偏大；若再依赖 callback 顺序，升级后还可能产生错误分组。
- **错误示例：**

```tsx
/** 错误：父子区域重叠，不能直接求和。 */
function totalDuration(parentMs: number, childMs: number) {
  return parentMs + childMs
}
```

- **正确示例：**

```tsx
/** 正确：分别保留整体值与局部值。 */
function describeDurations(parentMs: number, childMs: number) {
  return {
    wholeRegionMs: parentMs,
    nestedRegionMs: childMs,
  }
}
```

- **适用版本：** 固定证据为 React `19.2.8`；嵌套能力属于 React `19.2` 公开文档。
- **来源：** S1、S2、S9。

### 9. 用一次样本或固定毫秒阈值判定优化成败

- **触发条件：** 只采一次 `actualDuration`，或要求所有设备都低于固定阈值。
- **原因：** 忽略设备、浏览器、构建模式、热身、后台任务和 Profiler 自身开销。
- **后果：** 同一实现可能在不同机器上随机通过或失败，偶然噪声被误判为性能变化。
- **错误示例：**

```tsx
/** 错误：固定阈值不是跨环境功能合同。 */
function isFast(actualDuration: number) {
  return actualDuration < 5
}
```

- **正确示例：**

```tsx
/** 正确：保留同环境重复样本，比较时再统一汇总。 */
function collectSample(samples: number[], actualDuration: number) {
  return [...samples, actualDuration]
}
```

- **适用版本：** 所有 Profiler 版本；开发测量边界按 React `19.2` 核验。
- **来源：** S1、S2、S12。

### 10. 直接比较 development 与 profiling production 的绝对值

- **触发条件：** 优化前在 development 采样，优化后在 profiling production 采样，再把差值归因给代码。
- **原因：** 两种构建的优化级别、额外检查和 instrumentation 不同，变量不受控。
- **后果：** 构建差异被误认为代码优化收益，结论不可复现。
- **错误示例：**

```tsx
/** 错误：两个样本来自不同构建环境。 */
function improvement(devMs: number, profilingProductionMs: number) {
  return devMs - profilingProductionMs
}
```

- **正确示例：**

```tsx
type SampleSet = {
  build: 'development' | 'profiling-production'
  values: number[]
}

/** 正确：只有同构建、同路径的样本才进入一组比较。 */
function canCompare(before: SampleSet, after: SampleSet) {
  return before.build === after.build
}
```

- **适用版本：** React / React DOM `19.2`；固定构建入口核验到 `19.2.8`。
- **来源：** S1、S3、S10、S12。

## 结论摘要

- `<Profiler>` 提供被测 React 子树的 commit 级 render 数据；回调数不等于组件函数调用数、点击数或
  浏览器帧数。
- React `19.2` 的 `phase` 必须保留 `mount | update | nested-update` 三值。
- `actualDuration` 是当前提交的实际子树 render cost；`baseDuration` 是根据最近组件时长得到的整树
  无优化估算，二者都不是固定常量。
- `startTime` 用于定位渲染开始，`commitTime` 用于定位提交；同一 commit 的多个 Profiler 可按完全
  相同的 `commitTime` 分组。
- 嵌套 Profiler 是重叠区域：父级包含子级，不能直接求和，也不能依赖固定 callback 顺序。
- development 可验证回调和字段，但绝对耗时受额外检查影响；普通 production 默认关闭 profiling；
  production 测量需要显式使用 profiling build。
- 可靠比较必须固定构建、设备、浏览器、边界、输入和交互路径，并使用重复样本；Profiler 自身也有
  CPU 与内存开销。

## 参考资料

1. [React `<Profiler>`](https://react.dev/reference/react/Profiler)
2. [React Performance tracks：Using profiling builds](https://react.dev/reference/dev-tools/react-performance-tracks#using-profiling-builds)
3. [React `<StrictMode>`](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-double-rendering-in-development)
4. [React Versions](https://react.dev/versions)
5. [固定 `<Profiler>` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/Profiler.md)
6. [React `v19.2.8` Profiler commit 实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitEffects.js#L934-L992)
7. [React `v19.2.8` Profiler timer 与 nested-update 标记](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactProfilerTimer.js#L533-L563)
8. [React `v19.2.8` Profiler 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/__tests__/ReactProfiler-test.internal.js#L285-L689)
9. [React DOM `v19.2.8` profiling 入口](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/npm/profiling.js)
10. [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts)
