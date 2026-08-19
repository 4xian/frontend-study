# 不需要 Effect 的场景研究记录

## 知识点合同

- 目标条目：`react.core.learn.intermediate.unnecessary-effects`
- 标题：不需要 Effect 的场景
- 教学范围：本科 React 组件、Props、State、事件、组件边界和基础异步判断
- 官方文档基线：React `19.2`
- 仓库运行时快照：React / React DOM `19.2.8`；固定 tag `v19.2.8` 对应 commit
  `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- 本轮核验日期：`2026-08-17`

本课只回答一个判断问题：代码为什么需要运行。没有 React 外部系统时，能由当前 Props、State 或
Context 纯计算得到的结果留在 render；由一次明确用户动作引起的工作留在对应事件处理器；只有需要
与 React 不控制的系统持续同步时，才使用 Effect 或专用订阅 API。

## 权威路线与当前资产审计

权威调整计划的 I13 行将本课定义为“复用并扩充”，明确要求：render 派生、事件处理、State 重置、
父子通知和缓存边界。计划同时把完整 `useMemo` 值缓存移到独立的高级能力，因此本课只讲选择边界，
不承担完整性能课。

当前正式资产核对结果：

- `src/categories/frontend/react/core/learn/unnecessary-effects.md` 已存在，正文目前主要覆盖“render
  派生值”和“事件处理器”，并保留外部同步反边界。
- `src/categories/frontend/react/core/demos/unnecessary-effects/render-and-event-boundary-demo.tsx`
  与同名 CSS 已存在。编辑器只保存数量和备注，父组件保存客户身份、最近动作和动作次数，摘要由 render
  计算，两个按钮由事件处理器记录动作；没有 Effect、请求或外部 store。
- `src/categories/frontend/react/core/entry-manifest.ts` 已登记正文 slug，`demo-manifest.ts` 已登记同源
  Demo，`react-core-track.ts` 将条目标为 `available`。因此旧记录中“资产尚未创建”“仍为 planned”的
  陈述已过期，不能继续复用。
- 当前正文尚未覆盖本轮要求的 State 初始化/重置、昂贵计算与 `useMemo` 选择、父子通知、外部 store、
  请求竞态与框架数据层、Effect 链重构；这些是本次扩充的实际缺口。
- 当前正文的根级二级/三级标题尚未按现行课程规范连续编号，后续正文改写必须补齐；正文还用“后续课程”
  描述边界，改写时应改为概念边界与独立来源链接，不保留路线顺序叙事。
- `derived-values.md` 已提供源数据/State/派生值、先测量再缓存和 `useMemo` 非语义保证，可复用其
  纯计算与测量原则，但不能把完整缓存 API 再讲成 I13 主线。`state-preservation-and-reset.md` 可复用
  render tree 位置和 key 身份规则；`lifting-state-up.md` 可复用最近共同父组件、受控组件和单一事实
  来源。三份旧记录只作知识复用，不覆盖本轮的 I13 边界。

## 调研方式与证据边界

按仓库来源顺序先使用 Tavily 搜索 React 官方页面；搜索结果只用于发现 URL。每条课程事实都回到
`react.dev` 的原始 Markdown 或官方 API 页面核验，并用 `curl -L --fail --silent --show-error` 读取
当前原文。固定 runtime tag 通过 `git ls-remote` 核对。没有采用社区文章、搜索摘要、Issue、MDN 或
第三方库文档支撑本课事实。

React 官网的版本页当前以 `19.2` 为 latest version；官网不为每个 patch 发布独立文档快照。因此
“官方文档 19.2”和“固定 runtime v19.2.8”分别表示公共文档和必要的实现旁证，不能混写成官方
`19.2.8` 文档版本。

## 官方来源与事实矩阵

| ID | 一手来源 | 本课采用的事实 |
| --- | --- | --- |
| S1 | [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) | 没有外部系统时，数据转换在 render、用户动作在事件；Effect 派生 State 会先提交旧值再级联更新；页面显示与用户交互是不同原因。 |
| S2 | [You Might Not Need an Effect：昂贵计算](https://react.dev/learn/you-might-not-need-an-effect#caching-expensive-calculations) | 先直接计算；只有计算明显昂贵且更新期依赖未变时，才考虑 `useMemo`。 |
| S3 | [You Might Not Need an Effect：计算成本](https://react.dev/learn/you-might-not-need-an-effect#how-to-tell-if-a-calculation-is-expensive) | 用真实交互测量；`useMemo` 不会让首次 render 变快，开发 Strict Mode 的计时不能直接代表生产。 |
| S4 | [`useMemo` Reference](https://react.dev/reference/react/useMemo) | 计算函数须纯；依赖完整且数量固定，按 `Object.is` 比较；缓存是性能优化而非正确性、状态或永久存储合同。 |
| S5 | [`useState` Reference](https://react.dev/reference/react/useState) | 初始值只在初始化使用；昂贵初始化传函数本身；整棵子树可用变化的 `key` 重建；render 中调整 State 只是罕见后备模式。 |
| S6 | [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) | State 与 render tree 位置和组件身份关联；key 改变会重置该边界及后代 State，key 只在同一父级兄弟节点中有身份作用。 |
| S7 | [Sharing logic between event handlers](https://react.dev/learn/you-might-not-need-an-effect#sharing-logic-between-event-handlers) | 事件专属通知或购买逻辑由对应处理器调用；共享逻辑提取普通函数，不让 Effect 猜测用户原因。 |
| S8 | [Notifying parent components](https://react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes) | 子组件可在同一事件中更新本地状态并调用父回调；React 会批处理；也可提升 State 让子组件受控。 |
| S9 | [Passing data to the parent](https://react.dev/learn/you-might-not-need-an-effect#passing-data-to-the-parent) | 共同数据优先由父组件获取并向下传递，避免子组件用 Effect 回写父 State，保持数据流可追踪。 |
| S10 | [Chains of computations](https://react.dev/learn/you-might-not-need-an-effect#chains-of-computations) | 只为内部 State 互相触发而串联 Effect 会产生多次 render、脆弱的状态链；在原始事件中计算 next State，render 中派生可计算值。 |
| S11 | [Subscribing to an external store](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store) | 第三方 store 或浏览器可变 API 优先使用专用订阅 Hook，而非手工 Effect 镜像 State。 |
| S12 | [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) | `subscribe` 必须返回退订函数；`getSnapshot` 未变化时返回同一值，快照不可变/可缓存；React 以 `Object.is` 判断是否重渲染。 |
| S13 | [Fetching data](https://react.dev/learn/you-might-not-need-an-effect#fetching-data) | 查询结果是当前可见 UI 与网络的同步，不能机械搬到输入处理器；Effect fetch 必须清理并忽略过期响应。框架数据层或客户端缓存可处理 SSR、缓存和 waterfall。 |
| S14 | [`useEffect` Reference：数据获取替代方案](https://react.dev/reference/react/useEffect#what-are-good-alternatives-to-data-fetching-in-effects) | 框架内置 data fetching 通常更高效；没有框架时可抽取带缓存/去重策略的 Hook，但 raw Effect 仍有工程成本。 |
| S15 | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | render 必须幂等、只计算输出，不修改非局部值；删除 Effect 后不能把副作用搬进组件主体。 |
| S16 | [React v19.2.8 `ReactFiberCommitEffects.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177) | 固定版本的内部旁证：Effect setup 在 commit effect 阶段执行。内部函数名和 Fiber 细节不是公共 API。 |

## 知识结构建议

### 一、先做“为什么运行”的三问

1. 能否由本次 render 已有 Props、State、Context 纯计算得到？能，直接计算。
2. 是否只因一次明确的点击、输入、提交、拖拽发生？是，放入该事件处理器；共享入口调用同一普通函数。
3. 是否要在组件显示期间持续与浏览器、网络、非 React Widget 或外部 store 保持一致？是，选择
   Effect 或 `useSyncExternalStore`，而不是为了形式删除所有 Effect。

这个顺序要贯穿本课。它先判断同步对象和触发原因，再讨论 Hook；不要从“值变了”直接推导“写一个 Effect”。

### 二、render 派生与昂贵计算边界

字符串拼接、布尔判断、数量统计、轻量筛选和金额计算是当前输入的函数，直接在 render 中得到。用
Effect 写入派生 State 会先显示旧结果，再开始另一轮更新，还会把同一事实拆成两个需要同步的副本。

只有在直接计算确实慢、依赖很少变化、组件又经常因无关 State 重渲染时，才测量并尝试 `useMemo`。它的
边界是：纯计算、完整依赖、更新期复用缓存；首次 render 不会变快，缓存丢失不应破坏正确性，Strict Mode
开发期可能调用纯计算两次。I13 只冻结选择标准；完整依赖重构、对象/函数稳定化和性能诊断留在专门能力。

### 三、事件处理器保留用户意图

购买、提交、删除、通知和导航的原因是具体交互。处理器知道哪个控件、哪次事件以及当前 State 快照；
Effect 只能看到提交后的结果，无法可靠区分点击、恢复数据、重挂载和页面再次显示。显示表单的分析请求
仍可因“显示”留在 Effect，不能把“所有 POST 都放进 handler”当成规则。

### 四、State 初始化与重置

- 初始值只在挂载初始化使用；昂贵构造传 `useState(createInitialValue)`，不要在每次 render 调用后再传结果。
- 需要把整个编辑子树视为另一个业务实体时，在内层边界使用稳定业务 ID 作为 `key`；变化会重建该组件及其
  children 的 State 和 DOM。key 不是全局 ID，也不是清空单字段的命令。
- 只需调整一部分 State 时，先尝试删除冗余 State、改存稳定 ID 或用组件边界；render-time setState 仅是
  有终止条件、只更新当前组件的罕见后备模式，不能作为常规同步手段。

### 五、父子状态与通知边界

多组件需要同一事实时，把最小源 State 放在最近共同父组件，向下传值和事件回调。子组件可以在事件处理器
中同时更新本地状态、调用父回调；React 会批处理这次事件。若父组件需要完全控制当前值，则移除子 State，
采用受控组件。共同数据应由父获取再下传，不应由子组件在 Effect 中把数据回写父 State。

### 六、外部 store 是专用边界

第三方状态库或浏览器可变 API 不属于 React State。优先用 `useSyncExternalStore(subscribe, getSnapshot,
getServerSnapshot?)`：订阅函数返回清理函数；快照在未变化时保持同一引用，并在变化时返回新的不可变快照。
本课只讲何时选择该 API 和最小合同；完整 SSR、Transition、一致性和库适配器实现不在本科范围。

### 七、请求竞态与框架数据层

搜索结果随当前 query/page 与网络同步，不能因为输入改变就把请求简单移到输入 handler；URL 回退、分页或
恢复也会改变同步目标。手写 Effect fetch 必须在 cleanup 中标记旧请求结果为无效，避免乱序响应覆盖最新数据。
该标记只忽略 stale response，不等于取消网络请求。请求还涉及 server rendering、预加载、缓存和 waterfall，
官方建议优先使用框架内置 data layer；没有框架时再考虑客户端缓存或抽取自定义 Hook。I13 不实现第三方库。

### 八、重构 Effect 链

如果每个 Effect 只是设置下一个 State，链条会让同一交互逐级 render，并在历史回放、撤销或需求变化时误触发。
将可计算的 `isGameOver`、摘要和计数留在 render；在原始事件处理器中计算 `next` 值并一次更新相关 State，
必要时提取普通函数或使用既有 reducer 边界。网络依赖的级联下拉是例外，因为它确实同步外部系统。

## 可复用内容与需要改写内容

| 当前内容 | 处理建议 |
| --- | --- |
| “先问是否有外部系统”“render 派生”“事件处理器保留原因”三问 | 保留并作为开头；删除旧的路线状态和生产过程叙事。 |
| `fullName`、订单摘要和 `shouldSubmit` 反例 | 保留；补充 useMemo 选择、初始化、key、父子通知和 Effect 链。 |
| 外部播放器仍需 Effect 的反例 | 保留为反边界；明确外部 store 应优先 `useSyncExternalStore`。 |
| 当前 Demo 的数量/备注/动作合同 | 保留为主线 Demo；补充 key 重置和父子事件的独立可观察合同，不把网络或第三方 store 塞入同一 Demo。 |
| 旧研究中的 `23/29`、`available/planned`、Admission、构建、复审、SHA、临时 fixture | 全部只留在生产流程或 signoff；本调研以当前资产审计代替旧状态叙事。 |

## 高价值易错项

每个易错项在正文中应有触发条件、原因、后果、错误/正确方向和可观察验证，控制在高价值范围内：

1. 把 `fullName`、筛选结果或总价另存 State，再由 Effect 同步，造成旧快照和级联 render。
2. 为简单计算默认加 `useMemo`，或把 `useMemo` 当正确性、初始化或永久缓存；应先直接计算再测量。
3. 用 `shouldSubmit`、`isInCart` 等状态中转用户动作；刷新、恢复或重挂载可能重复动作，应由 handler 保留原因。
4. 把删除 Effect 后的副作用搬进 render；render 可以被重试，外部写入必须回到事件或真实同步边界。
5. 用 Effect 清空整个编辑表单；业务身份改变时使用稳定 `key` 重建内层边界，勿把 key 当字段清理 API。
6. 子组件用 Effect 回写父组件或兄弟副本；应提升 State、使用受控值，或在同一事件中调用回调。
7. 手工 Effect 镜像外部 store，忽略快照引用稳定和退订；选择 `useSyncExternalStore` 的最小合同。
8. 把所有请求搬到 handler，或把 cleanup `ignore` 误说成取消请求；当前可见查询仍可由 Effect 同步，框架 data layer 更优。
9. 串联多个内部 Effect 计算下一 State；在原始事件中计算 next 值，网络依赖链才保留 Effect。

## 可观察 Demo 合同

### D1：现有 Render 与事件边界 Demo（保留）

- 同源文件：`src/categories/frontend/react/core/demos/unnecessary-effects/render-and-event-boundary-demo.tsx`。
- 初始值固定为单价 `80`、数量 `1`、空备注、动作次数 `0`；编辑器只保存数量和备注，父组件保存客户身份、
  最近动作和动作次数。
- 小计、折扣、总价由纯函数在 render 直接计算；不得保存派生 State，不导入 Effect、timer、Promise、网络或外部 store。
- “加入购物车”和“立即结算”直接调用同一动作函数，每次点击只增加一次动作记录；备注输入只触发普通 render。
- 观察路径：数量改为 `3` 后总价立即变为 `240`；输入备注动作次数不变；两次按钮点击分别得到计数 `1`、`2`；
  “重置编辑器”恢复数量与备注冷值，“清空父组件动作记录”恢复最近动作与动作次数冷值。
- 运行组件与查看源码必须来自同一 TSX 文件；CSS 继续使用 flex/正常流，不出现 `grid` 或 `gap`。

### D2：状态身份与父子通知边界（已实现的部分）

- 外层通过固定客户 ID 选择当前客户，内层 `OrderEditor key={customer.id}` 保存数量和备注；切换客户后内层
  编辑器和输入 DOM 一起回到初始值，父组件的动作记录保留。
- 本 Demo 不加入 Toggle、拖拽或受控变体；这些交互属于可独立验证的候选，不是当前示例的必要行为。
- 当前示例只验证稳定 `key` 重建局部编辑器，以及子组件在按钮事件中调用父回调；每次按钮交互只增加一条动作记录。
- 不使用 Effect 清空表单、不用 Effect 回写父 State、不使用随机 key；只使用稳定业务 ID。浏览器只验证 DOM 值、
  重置边界、事件记录和 390px 无溢出。

### 外部边界的验证决定

`useSyncExternalStore` 和请求竞态都是真实可观察主题，但第三方 store、网络和延迟会让本科主线 Demo 不稳定。
I13 只冻结最小 API/竞态代码示例和审阅合同：外部 store 必须有稳定 cached snapshot 与退订；手写 fetch 必须
忽略 stale response。若后续需要 Demo，应使用隔离的确定性 fixture，并把完整订阅/请求实现放到对应专项能力，
不把它们混进 D1/D2 的本地状态演示。

## 正文写作硬约束（冻结）

- 面向学习者的正文不得出现计划、课号、批次、available/planned、构建命令、类型/运行时快照、临时 fixture、
  Git/hash、浏览器 Gate、复审、signoff 或篇幅叙事；这些只属于本调研、计划或 signoff。
- 正文只讲本科所需的公共行为和判断，不写 Fiber、flags、dispatcher、内部调度或固定源码函数名。
- 不把“无需 Effect”写成“删除所有 Effect”；保留显示触发的 Effect、外部 Widget/浏览器同步、外部 store 专用 API 和查询竞态边界。
- 不深入 I14 的依赖稳定化与 lint 重构、I15 `useEffectEvent`、I16 自定义 Hook/useDebugValue、I17 StrictMode
  系统检查或 A15 `useSyncExternalStore` 完整 SSR/Transition 合同；不讲第三方缓存库、RSC、Suspense、AbortController、
  React Compiler 或 Profiler 实现。
- 课程根级二级/三级标题按仓库课程规范连续编号；正文不把研究过程、验收数据和 Demo 生产合同当作学习章节。

## 验收清单

### 事实与范围

- [x] 每条公共结论都能回到本记录的 React 官方来源；固定源码仅作非公共实现旁证。
- [x] 正文覆盖三问、render 派生、`useMemo` 边界、事件、初始化/key、父子通知、外部 store、请求竞态和 Effect 链。
- [x] 明确指出网络查询仍可能需要 Effect，cleanup 忽略 stale response 不等于取消请求。
- [x] 明确说明 key 的组件边界、初始化器的纯度和 render-time setState 的后备性质。

### 正文与 Demo

- [x] 正文结构满足目标、为什么需要、核心概念、用法/Demo、易错、推导/场景、练习、小结和参考资料。
- [x] 删除旧的计划/批次/构建/复审/篇幅叙事；保留可学习的概念边界。
- [x] D1 交互保持确定性、同源、无 Effect；D2 若实现则验证 key 重建和父子单次事件通知。
- [x] Demo 样式不使用 CSS Grid 或 `gap`，桌面与 390px 无横向溢出，控件支持键盘和清晰焦点。

### 生产验证

- [x] 只对本课改动运行目标 Markdown 的 Prettier 检查与 `git diff --check`；不暂存、提交、清理或修改其他文件。
- [x] 若正文/Demo 后续实现，按质量规范使用最小临时验证资产；不保留测试、fixture、截图或构建产物。
- [x] 课程、Demo 和清单的稳定 ID、同源 loader、正文来源与实际行为保持一致。

## 明确不覆盖

本课不承担 Effect 依赖清单和稳定化、Effect Event、自定义 Hook、StrictMode 系统检查、`useSyncExternalStore`
完整 SSR/Transition 合同、请求取消实现、第三方缓存库、RSC/Suspense/路由数据协议、React Compiler/Profiler、
Fiber 内部实现、持久化/数据库事务或高级并发调度。只保留足以判断“此处不应写普通 Effect”的公共边界。

## 参考资料

1. [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) - 本课主线、派生值、事件、重置、父子通知、外部 store 和请求边界。
2. [`useMemo`](https://react.dev/reference/react/useMemo) - 纯计算、依赖比较、测量和非语义缓存边界。
3. [`useState`](https://react.dev/reference/react/useState) - 初始化器、key 重置和 render-time 调整的公共合同。
4. [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) - render tree 位置、组件身份和 key。
5. [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) - 外部 store 订阅、快照和退订合同。
6. [`useEffect`](https://react.dev/reference/react/useEffect) - 外部系统职责、查询请求和框架 data fetching 边界。
7. [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) - render 幂等与副作用边界。
8. [React v19.2.8 `ReactFiberCommitEffects.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177) - 固定 runtime 的内部旁证，不构成公共 API。
