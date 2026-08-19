# flushSync 同步提交边界官方调研

## 结论摘要

`flushSync` 是 React DOM 为极少数同步外部集成提供的逃生舱：它立即调用 callback，并在返回前把
为满足该同步更新所需的 React 工作提交到 DOM，使 callback 后的代码可以读取已更新节点。它不是普通
事件处理器的默认写法，也不是读取“最新 State”、强制 browser paint 或提升性能的工具（S1、S2）。

本课需要建立以下精确判断：

1. 从 `react-dom` 导入 `flushSync`；公开参数是函数。React Reference 把返回值写成 `undefined`，但
   `@types/react-dom@19.2.4` 的实际签名是 `flushSync<R>(fn: () => R): R`，React DOM `19.2.8`
   源码也会返回 callback 的结果。课程必须如实标出这个版本差异，示例 callback 只返回 `void`，不把
   当前实现扩大为未来公共承诺（S1、S7、S10）。
2. callback 内更新可以在 `flushSync` 返回前反映到 DOM；为完成它，React 也可能先冲刷 callback 外
   的 pending updates、待处理 Effects，以及 Effects 中安排的更新（S1、S8）。
3. 同步承诺止于 React DOM commit。当前事件处理器闭包里的 State 仍属于旧 render，也没有证据表明
   browser 已完成独立 paint（S1、S4）。
4. `flushSync` 可能显著损害性能，并可能让 pending Suspense boundary 的 fallback 再次出现；这些
   都是公开 caveat，不是必须在每次调用中发生的固定现象（S1）。
5. 不能在组件 render、`useLayoutEffect`、`useEffect` 或 class lifecycle 中调用。React `19.2.8`
   的开发构建会输出警告，当前 render/commit 期间不能同步 flush；官方测试还表明 callback 中安排的
   更新可能稍后完成，所以不能简单理解为“callback 完全没执行”（S3、S9）。
6. 首选做法是取消不必要的同步 DOM 读取，或把调用移到正常事件边界。官方提供的 microtask 延后方案
   只是难以调整调用位置时的最后逃生舱，并明确说明其性能更差（S3、S5）。

## 版本与提交冻结

| 项目 | 冻结值 | 核验依据 |
| --- | --- | --- |
| React 文档 | `19.2` 内容，固定 `reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac` | 固定 `flushSync`、DOM Ref 与 `useState` 源文件（S1-S5） |
| React | `19.2.8` | 仓库 `package.json`、lockfile 与 npm 精确元数据（S6） |
| React DOM | `19.2.8` | npm `gitHead` 为 `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`（S6） |
| React 源码与测试 | `19.2.8` 发布提交 `1dd4ecbdabf826f527fc9a58c05ea70375b7d170` | 固定提交源码与官方测试（S7-S13）；该版本没有公开 `v19.2.8` tag |
| TypeScript 声明 | `@types/react-dom@19.2.4` | npm 精确包声明；仓库安装文件与 unpkg 文件 SHA-256 均为 `be1cc4d94ea60cbe567bc29ed479d42587bf1e6cba490f123d329976b0fe4ee5`（S10） |
| 核验日期 | `2026-08-18` | 本轮核验日期 |

源码和测试只用于解释当前 patch 的行为与警告边界。课程的长期承诺仍以 React Reference 和发布的类型
合同为主；内部 priority、lane、dispatcher、执行上下文与全 Root 冲刷算法不进入学习目标。

## 来源矩阵

| 编号 | 固定第一方来源 | 支撑事实 |
| --- | --- | --- |
| S1 | [固定 `flushSync` Reference](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/flushSync.md#L11-L57) | 导入、参数、文档返回值、同步 DOM、pending updates / Effects、Suspense 与性能 caveat |
| S2 | [固定第三方集成与 `onbeforeprint` 用例](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/flushSync.md#L61-L133) | callback 后 DOM 已更新、浏览器 API / UI 库、打印回调与 last resort 定位 |
| S3 | [固定 lifecycle troubleshooting](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/flushSync.md#L137-L205) | render、两类 Effect、class lifecycle 禁止调用；事件替代与 microtask 兜底 |
| S4 | [固定 DOM Ref 同步滚动示例](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/manipulating-the-dom-with-refs.md#L453-L566) | commit 后 Ref 才指向新节点；新增列表项后立即 `scrollIntoView()` 的正式用例 |
| S5 | [固定 `useState` caveats](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useState.md#L80-L92) | setter 只影响下次 render；普通事件结束后批量更新；仅极少数提前访问 DOM 的需求考虑 `flushSync` |
| S6 | [React DOM 19.2.8 npm 元数据](https://registry.npmjs.org/react-dom/19.2.8)、[React 19.2.8 npm 元数据](https://registry.npmjs.org/react/19.2.8) | 精确版本、仓库地址与共同 `gitHead` |
| S7 | [React DOM `flushSync` 固定实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/shared/ReactDOMFlushSync.js#L17-L50) | 当前 patch 调用并返回 callback 结果、恢复内部上下文、render 中开发警告 |
| S8 | [同步 render / Effect 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactFlushSync-test.js#L121-L184)、[pending Effect 反例测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactFlushSync-test.js#L246-L290) | 同步更新优先于 Transition、同步 render 产生的 passive Effect 可在返回前执行；其他 pending Effect 不会在所有场景无条件冲刷 |
| S9 | [lifecycle 警告测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFiberAsync-test.js#L166-L190)、[Effect 中禁止同步 flush 的测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1642-L1673) | 当前 patch 输出开发警告；Effect 内更新不在调用点同步提交、之后仍可完成 |
| S10 | [`@types/react-dom@19.2.4` 固定声明](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react-dom/index.d.ts#L22)、[固定类型测试](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react-dom/test/react-dom-tests.tsx#L32-L44) | 精确签名 `flushSync<R>(fn: () => R): R`；测试覆盖 `void` / `number` 推导并拒绝额外参数 |
| S11 | [callback 内外 DOM 时机测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFiberAsync-test.js#L68-L109) | callback 内仍可读取旧 DOM，`flushSync` 返回后相关更新已提交 |
| S12 | [callback 外 pending update 测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFiberAsync-test.js#L290-L324) | callback 前排队的更新可能与 callback 内更新一起提交 |
| S13 | [Suspense 真实 DOM 测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactSuspenseEffectsSemanticsDOM-test.js#L173-L205) | 同步更新 suspend 时，已有内容隐藏并立即显示 fallback |

Tavily 只用于定位候选页面；以上事实全部回到 React 官方文档、React 固定提交源码与测试、npm 精确
包元数据及精确类型声明核验。社区文章、搜索摘要、浮动 `main` 和压缩产物不承担课程事实证明。

## 公开合同

### 1. 导入与调用

公开写法是：

```tsx
import { flushSync } from 'react-dom'

flushSync(() => {
  setExpanded(true)
})
```

callback 必须是函数。React 会立即调用它，并同步处理其中为本次 DOM 结果所需的更新。课程不能把
`flushSync` 写成 Hook：它没有 `use` 前缀，不遵守 Hook 顶层调用形式，也不属于 `react` 包（S1）。

`@types/react-dom@19.2.4` 的精确声明是：

```ts
export function flushSync<R>(fn: () => R): R
```

类型层面不接受省略 callback 或非函数值。React `19.2.8` 内部仍保留无参数 overload，并用 `if (fn)`
分支处理空值，但这不是 Reference 和发布类型允许的用法，课程不得示范 `flushSync()`、`null`、`false`
或其他值（S7、S10）。truthy 非函数在当前实现到达 `fn()` 时会抛出原生 `TypeError`；这只是违反公开
参数合同后的当前结果，不应固定错误文案。

### 2. 返回值的文档与类型差异

这里存在必须显式记录的上游差异：

| 层次 | 当前内容 | 课程处理 |
| --- | --- | --- |
| React Reference | “returns `undefined`” | 作为官方文档语义原样说明 |
| `@types/react-dom@19.2.4` | `flushSync<R>(fn: () => R): R` | TypeScript 示例和讲解必须使用这个精确签名 |
| React DOM `19.2.8` 实现 | `return fn()`，空内部调用返回 `undefined` | 只作当前 patch 旁证，不升级为未来兼容承诺 |

因此课程示例使用不返回业务值的 callback，不教授通过 `flushSync` 传递结果；同时不能错误声称安装的
TypeScript 声明是 `void`。若正文展示表达式类型，应把差异写成版本事实，而不是替上游制造一个虚假的
统一合同（S1、S7、S10）。

### 3. 同步 DOM 可见性

`flushSync` 返回后，React 已把所需更新提交到 DOM，所以下一行可以读取新节点、文本、属性或布局，
也可以调用 `scrollIntoView()` 等依赖新节点的浏览器 API（S2、S4）。这项保证必须限制在 DOM：

- 它不会改写创建当前 callback 的 render 快照，callback 内原来的 State 变量仍是旧值（S5）。
- 它不保证浏览器已经把 DOM 绘制成一个独立可见帧；不能拿截图、`requestAnimationFrame` 次数或肉眼
  闪烁反推 API 的公共合同（S1）。
- DOM 测量必须发生在 `flushSync` 返回之后，而不是在 callback 中的 setter 紧邻下一行读取。

### 4. callback 外工作、Effects 与 Suspense

“同步 callback 内更新”不等于“只执行 callback 内这一项”。React Reference 明确允许 React 为完成
该工作而：

1. 先冲刷 callback 外的 pending updates，例如先前点击留下的更新；
2. 运行 pending Effects；
3. 同步应用这些 Effects 中安排的更新；
4. 若本次更新 suspend，让 pending Suspense boundary 的 fallback 再次显示（S1）。

官方 `19.2.8` 测试给出更窄的版本旁证：同步 render 产生的 passive Effect 会在 `flushSync` 返回前
执行；不是该同步 render 结果的另一项 pending passive Effect，在测试场景中没有被无条件冲刷（S8）。
这说明 Reference 描述的是“可能发生”的权限边界，不是“每次都冲刷所有 Effect”的算法公式。课程
不得把单个测试升级为稳定的 Effect 排序、lane 或跨 Root 调度承诺。

### 5. 性能与最后手段

`flushSync` 会打断 React 正常的 batching 与并发安排，把工作放进当前同步关键路径，还可能带入额外
pending work 与 Effect 更新。React 因此用“significantly hurt performance”“use sparingly”和
“last resort”限定它（S1、S2）。课程只采用这个定性结论，不编造固定毫秒阈值，也不声称同步就更快。

判断是否需要它，应同时满足：

1. 存在 React 之外的浏览器 API 或 UI 库回调；
2. 对方明确要求 callback 返回前 DOM 已更新；
3. 下一步确实读取或操作该次提交产生的 DOM；
4. 普通事件结束后的默认 commit、声明式渲染或重构外部适配层都不能满足需求。

少一项就优先保持正常 batching（S2、S5）。

## React 19.2.8 实现与测试旁证

### 1. wrapper 与同步工作出口

发布提交中的 wrapper 会保存当前内部 transition / update priority，调用 callback，并在 `finally` 中恢复
上下文和尝试冲刷同步工作（S7）。这解释了两个当前 patch 事实：callback 内部不必已经看到最终 DOM，
同步 commit 的观察点是 `flushSync` 返回之后；即使 callback 或 React 工作失败，恢复逻辑仍位于
`finally`。priority 常量、dispatcher 字段与跨 Root 实现都是私有细节，不进入公开合同。

### 2. DOM、callback 外更新与 Effects

官方 DOM 测试在 callback 内安排 `B`、`C` 后仍读到旧文本 `A`，返回后才读到 `ABC`（S11）。另一项
测试先在 callback 外排队 `A`，再在 callback 内安排 `B`、`C`，返回后一次看到 `ABC`，直接旁证
“callback 外 pending work 可能一并提交”（S12）。

Effect 测试则刻意给出正反两面：同步 render 产生的 passive Effect 可在返回前执行；另一个异步提交
留下的 pending passive Effect 没有被空内部调用无条件冲刷（S8）。所以课程只能使用 Reference 的
`may`，不能承诺“所有 pending Effects 一定执行”。

### 3. Suspense 与错误上下文

固定 Suspense DOM 测试先显示已解析内容 `A`，再用同步更新切到尚未解析的 `B`，结果旧内容被隐藏且
`Loading...` 立即出现；资源完成后才显示 `B`（S13）。这为“fallback 可能重新出现”提供当前 patch
旁证，但不表示每个 `flushSync` 都会触发 fallback。

工作循环只在 render / commit 之外真正冲刷所有同步工作；wrapper 在开发构建检测到错误上下文后输出
warning（S7、S9）。内部 legacy build invariant throw 代表 React 构建配置错误，不是用户在 lifecycle
调用 `flushSync` 的异常合同。

## 调用位置、警告与抛错边界

### 1. render 与 lifecycle 内禁止调用

React Reference 明确排除以下位置（S3）：

- 组件 render；
- `useLayoutEffect`；
- `useEffect`；
- class component lifecycle。

这些阶段中 React 已在 render 或 commit，不能嵌套完成新的同步 flush。React `19.2.8` 的精确边界是：

- 开发构建通过 `console.error` 输出 “flushSync was called from inside a lifecycle method...” 警告；
- 这不是由 `flushSync` 主动抛出的 lifecycle 异常；生产构建没有这条开发警告；
- callback 仍可能执行并安排更新，但调用点不能同步提交；官方 Effect 测试随后观察到该更新完成（S7、S9）。

因此 Reference 中的 “noop and warn” 应解释为“同步 flush 在此处不生效并警告”，不能写成“callback
函数根本不会运行”。课程也不能用 `try/catch` 捕获这条 console warning。

### 2. 其他真正会 throw 的情况

- 非函数 truthy 参数违反参数合同，当前 patch 直接调用它并产生原生 `TypeError`（S7）。
- callback 自己抛出的错误不会因为包在 `flushSync` 中自动变成成功；当前实现没有捕获并吞掉它，而是
  通过 `finally` 恢复内部上下文并尝试结束同步工作（S7）。
- callback 安排的 React render 若失败，仍走 React 的正常错误处理。固定测试甚至验证多个 Root 的
  同步 render 错误可汇总为 `AggregateError`，同时其他同步 Root 工作仍完成；这是当前 patch 测试
  旁证，不是本课要教授的错误聚合 API（[固定测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactFlushSync-test.js#L293-L344)）。

### 3. 修正顺序

官方 troubleshooting 给出的优先顺序是（S3）：

1. 把调用移到事件边界；若普通事件完成后的 DOM 已足够，就完全删除 `flushSync`。
2. 若确实由外部同步 callback 驱动，在该 callback 的最外层建立一次最小同步边界。
3. 只有调用位置实在无法改变时，才用 `queueMicrotask(() => flushSync(...))` 让当前 render 结束。

microtask 方案会再安排一次同步 render，官方明确说其性能更差，必须先穷尽其他选择。它也不等于
browser paint；课程不能把它包装成通用的“等 React 更新”工具。

## 正式用例与普通事件替代

### 1. `beforeprint` 回调

React 官方用例在 Effect 中注册 `beforeprint` / `afterprint` listener，但真正的 `flushSync` 调用发生在
浏览器触发的 `handleBeforePrint` callback 中，而不是 Effect setup 本身。`beforeprint` 返回后打印对话框
会使用当前 DOM，因此 callback 内把 `isPrinting` 设为 `true` 并同步提交；`afterprint` 再恢复（S2）。

这不是“所有 window event 都要同步”的例子。关键是外部 API 在 callback 返回时立即消费 DOM。

### 2. 新节点后的 DOM 操作或测量

官方 Todo 例子先新增列表项，再对 `lastChild` 调用 `scrollIntoView()`。默认 batching 下，事件处理器
尚未结束时新节点还不在 DOM，读取会落到旧末项；把 setter 包在 `flushSync` 后，下一行 Ref 已指向包含
新项的提交结果（S4）。同一原则适用于第三方布局库在 callback 返回前必须读取 `getBoundingClientRect()`
的窄场景：同步边界只包 State 更新，测量放在返回后的下一行。

### 3. 普通事件无需同步逃生舱

`useState` 文档明确说明 React 通常会在所有 event handlers 完成后更新屏幕，这能减少重复 render；
`flushSync` 只是“需要更早访问 DOM”的 rare case（S5）。因此普通点击只需：

```tsx
function handleToggle() {
  setExpanded(value => !value)
}
```

若后续逻辑只依赖下一 State，应在 updater 中计算、在下次 render 声明式呈现，或把业务值保存到局部
变量；不能为了让当前闭包 State 变新而调用 `flushSync`。

## 现有课程重叠审计

现有《React 更新模型》已经准确提供以下浅层边界：

| 现有位置 | 已覆盖 | A19 处理 |
| --- | --- | --- |
| `render-commit-and-state-snapshot.md:607-613` | 第三方集成、下一行 DOM、callback 外 pending work、旧闭包、非 paint | 作为前置心智模型，不重复讲完整 render / commit / snapshot |
| `render-commit-and-state-snapshot.md:841-863` | 反对普通点击默认使用、说明 State 仍旧、保持 batching | 保留为基础易错点；A19 只补外部同步消费的判定流程 |
| frontmatter / recap / sources | last resort、性能风险、官方 Reference | A19 补精确 API、Effects、Suspense、正式用例与错误位置 |

A19 的“新增并抽取”应按以下方式深化，而不是把基础课重写一遍：

- 一段复用前置结论：render 快照、commit 与 paint 已学过，不再重讲队列手算或 batching 历史。
- 主体新增 `flushSync(callback)` 精确合同、文档/类型返回差异与 callback 外冲刷权限。
- 用 `beforeprint` 和同步 DOM 操作说明“谁在 callback 返回时消费 DOM”。
- 单独讲 pending Effects、Suspense fallback、性能代价和 last resort 决策。
- 单独讲 render / Effect / lifecycle 警告、事件替代与 microtask 最后兜底。

基础课最终只需保留简短 cross-reference 和“不是最新 State / 不是 paint”警告；A19 不应再次扩写
State 队列、updater、Strict Mode 或整个 React 渲染管线。

## 课程范围决策

### 必须覆盖

- 从 `react-dom` 导入、函数参数、立即调用、同步 DOM 边界。
- React Reference `undefined` 与 `@types/react-dom@19.2.4` 泛型返回的真实差异。
- callback 外 pending updates、Effects 及 Effects 更新可能被提前处理。
- Suspense fallback 可能重新出现，以及显著性能成本。
- `beforeprint`、新节点后的 Ref / DOM 操作与 DOM measurement。
- render、两类 Effect、class lifecycle 禁止调用及 React 19.2.8 开发警告。
- 普通事件默认 batching、事件位置修正和 microtask 最后兜底。
- 不改变旧闭包 State、不保证 paint、最后手段判定清单。

### 明确排除

- React lane、event priority、dispatcher、execution context 与跨 Root flush 算法。
- Suspense、Transition、Effect 或浏览器渲染流水线的完整教程。
- `beforeprint` / `afterprint` 的跨浏览器兼容矩阵与真实打印自动化。
- 通用 DOM 测量 Hook、ResizeObserver、动画、滚动组件或第三方布局库教程。
- 把 microtask、timer、`requestAnimationFrame` 当成通用等待 React 的配方。
- 固定性能数字、固定 render / Effect 次数与 callback 外工作的确定排序。

## Demo 决策

### 采用：确定性同源“外部回调后立即读取 DOM”对照

Demo 使用同一 document 内的本地同步 adapter 模拟外部 API：adapter 调用注册 callback，callback 返回后
立即读取目标元素的 `data-version` 和文本。所有内容由本地 State 与静态样式决定，不请求网络、不使用
iframe、不打开打印对话框。

提供两条可复跑路径：

1. **普通 React 更新**：同步 adapter 在 setter 后立即读取旧 DOM，事件结束后界面正常更新。
2. **外部同步读取**：adapter callback 内用一次 `flushSync` 包住 setter；返回后读取 DOM，日志中的属性、
   文本应与请求版本一致。

两条路径都从当前版本请求下一个版本，并记录请求版本、handler State 快照、callback 末尾 DOM 快照与
事件完成后的已提交版本；显式重置恢复版本 `0`。观察结果不依赖时间戳、随机数或具体像素断言。

### 为什么不直接用真实打印或 Suspense

- `window.print()` 会打开系统对话框，难以自动化、会阻塞页面，也不能形成稳定观察路径。
- 可以通过程序化 `beforeprint` event 说明 callback 形状，但不能声称它等价于浏览器真实打印流程。
- Suspense fallback caveat 是“可能”发生。为了强制复现而加入可控 promise、Transition 与多阶段资源
  会让 Demo 变成 Suspense 课程，因此只在正文和易错点中说明，不放入主 Demo。
- pending Effect 的具体冲刷取决于更新来源；不把内部测试序列复制成面向学习者的稳定可视化。

### Demo 可观察结果

- 初始与显式重置后：State 和 DOM 版本均为 `0`，尚无 callback 观察记录。
- 无同步边界的 callback 返回后：即时快照仍为旧版本；事件完成后 DOM 更新到请求版本。
- 使用 `flushSync` 的 callback 返回后：即时快照已经命中请求版本。
- 两条路径中 callback 内捕获的旧 State 都不会因 DOM commit 被改写。
- 页面明确提示：同步 DOM 不代表独立 browser paint；Demo 不尝试证明 paint。

## 易错点候选

| 误解 | 为什么错 | 正确边界 | 来源 |
| --- | --- | --- | --- |
| “`flushSync` 让当前 State 变量立刻变新” | setter 只影响下次 render，闭包快照不变 | 下一行只读取 DOM，不读取旧 State 断言新值 | S5 |
| “返回时浏览器已 paint” | Reference 只保证 DOM 更新 | commit 与 paint 分开陈述 | S1 |
| “只会处理 callback 内一项更新” | 可能先处理 callback 外 pending work、Effects 及其更新 | callback 保持最小，不能依赖隔离性 | S1 |
| “每次都会运行所有 pending Effects” | Reference 说 `may`；官方测试也存在未被无条件冲刷的 pending Effect | 只陈述可能，不固定排序 | S1、S8 |
| “Suspense 只会保留旧内容” | 同步更新 suspend 时 fallback 可能重新出现 | 不对 fallback 可见性做相反保证 | S1 |
| “同步一定更快” | 它会占用当前同步路径并可能带入额外工作 | 只作最后手段 | S1、S2 |
| “在 `useLayoutEffect` 里调用就更同步” | React 已在 commit；当前调用不能嵌套 flush | 移到外部回调或事件 | S3、S9 |
| “lifecycle warning 会被 `try/catch` 捕获” | React 19.2.8 是开发期 console warning，不是该 API 主动 throw | 修正调用位置，不捕获日志 | S7、S9 |
| “microtask 是推荐常规方案” | 官方说该模式性能更差 | 先取消同步需求或移到事件 | S3 |
| “类型返回 `void` / `undefined`” | 精确 `@types` 是泛型 `R`，与 Reference 存在差异 | 如实并列，示例 callback 返回 `void` | S1、S10 |

## 验证清单

### 正文合同

- [ ] 导入路径写成 `react-dom`，没有写成 `react` 或 `react-dom/client`。
- [ ] 精确展示 `@types/react-dom@19.2.4` 泛型签名，并说明 Reference 的 `undefined` 差异。
- [ ] callback 后只承诺 DOM 已更新，不承诺当前闭包 State 或 browser paint。
- [ ] 使用“可能”描述 callback 外 pending updates、Effects 与 Suspense fallback。
- [ ] 明确性能 caveat 与 last resort 判定，不提供固定耗时数字。
- [ ] 区分开发 warning、参数 / callback 真正 throw 与 React render 错误。
- [ ] microtask 只作为官方最后兜底，并带更差性能警告。

### Demo 行为

- [ ] 普通事件路径不使用 `flushSync`，事件完成后 UI 正常更新。
- [ ] 外部 adapter 在 callback 返回后同步读取 DOM，且只有这条路径使用一次 `flushSync`。
- [ ] 无同步边界对照稳定读到旧 DOM，随后页面更新；不依赖 timer 或网络。
- [ ] 读取 `data-version` 与文本，不断言固定机器像素。
- [ ] 观察区能区分请求版本、handler State、callback DOM 与当前已提交 DOM，不宣称 paint 已发生。
- [ ] 不调用真实 `window.print()`，不制造不可自动化的系统对话框。
- [ ] 不执行 lifecycle 错误调用，不用 console warning 作为正常 Demo 结果。

### 去重与范围

- [ ] 只简短复用 render / commit / snapshot 前置，不重复整课。
- [ ] 不重新教授 State 队列手算、updater、Strict Mode 或 automatic batching 历史。
- [ ] 不扩展成 Suspense、Transition、Effect、DOM 测量 Hook 或浏览器 paint 教程。
- [ ] 内部实现与官方测试始终标为 React 19.2.8 旁证，不写成长期公共承诺。
