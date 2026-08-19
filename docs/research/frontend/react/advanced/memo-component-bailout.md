# memo 与组件跳过渲染研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.advanced.memo-component-bailout`
- 标题：`memo` 与组件跳过渲染
- 教学层级：高级
- 前置课程：`react.core.learn.advanced.profiler-render-measurement`、
  `react.core.learn.advanced.use-memo-value-caching`
- 核验日期：`2026-08-17`
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react` `19.2.18`
- 固定文档提交：`reactjs/react.dev@383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`

本课只回答一条主线：父组件更新时，如果一个子组件接收的每个 Prop 都与上次相同，怎样用 `memo`
允许 React 跳过这个子组件的 render，并用 Profiler 验证是否真的减少了工作。

必须覆盖：

1. `memo(Component, arePropsEqual?)` 返回新的记忆化组件，不修改传入的原组件。
2. 默认比较逐个使用 `Object.is`；它不是对象内容的递归深比较。
3. 父组件重新 render 不等于所有 `memo` 子组件都重新 render；Props 未变时 React 通常会跳过该子组件。
4. `memo` 是性能优化，不是功能正确性合同，代码删除 `memo` 后结果仍应正确。
5. 组件自身 State 变化、组件读取的 Context 变化，仍可使记忆化组件重新 render。
6. 每次新建的对象、数组或函数会形成不同引用，可能让默认比较失去跳过机会。
7. 先用 Profiler 在相同交互路径下测量，再决定是否保留 `memo`。
8. 自定义 comparator 是高风险例外：返回值表示新旧 Props 是否会产生相同输出和行为，必须比较每个
   Prop，包括函数，并证明比较成本低于重新 render。

明确排除：`useCallback` 的完整教学、`useMemo` 的完整教学、自定义 comparator 教程、React Compiler、
DevTools 教程、Core Web Vitals、遥测平台、Suspense、Transition、Action、服务端组件和外部状态库。

## 调研与证据边界

1. 已知官方 URL 直接读取 React 19.2 `memo` Reference，并用固定 React 文档提交核对公共表述。
2. patch 级实现只引用 React `v19.2.8` 固定提交中的 `ReactMemo.js` 与
   `ReactFiberBeginWork.js`，不使用浮动 `main` 作为版本证据。
3. 当前仓库锁定 `react` / `react-dom` `19.2.8` 与 `@types/react` `19.2.18`；课程正文只写公共语义，
   仓库依赖与 Gate 结果留在本研究记录和计划证据中。

## 官方来源卡

| 编号 | 一手来源 | 本课采用的事实 |
| --- | --- | --- |
| S1 | [`memo` Reference](https://react.dev/reference/react/memo) | API、默认 Props 比较、State/Context 边界、性能优化定位、引用 Props 与自定义 comparator 风险。 |
| S2 | [固定 `memo` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/memo.md) | 固定 React 19.2 文档采用的公开规则，避免官网滚动更新。 |
| S3 | [React 19.2.8 `ReactMemo.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactMemo.js) | `memo` 创建带组件 type 与可选 compare 的 React element type。 |
| S4 | [React 19.2.8 `ReactFiberBeginWork.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberBeginWork.js) | 默认浅比较与 bailout 路径的固定版本实现佐证。 |
| S5 | [`Object.is`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/is) | React 文档用于说明默认逐项 Prop 比较的 JavaScript 相等语义。 |
| S6 | [`Profiler` Reference](https://react.dev/reference/react/Profiler) | 用 `actualDuration` 和 `baseDuration` 在相同路径下观察记忆化收益。 |
| S7 | [`useCallback` Reference](https://react.dev/reference/react/useCallback) | 函数身份缓存属于独立 API；本课只观察新函数会使 Prop 不同。 |
| S8 | [`useMemo` Reference](https://react.dev/reference/react/useMemo) | 值缓存属于独立 API；本课不重教对象身份稳定化。 |

## 官方事实与课程推导

### 1. `memo` 提供的是跳过机会

`memo(Component)` 返回一个新的记忆化 React 组件。父组件重新 render 时，React 会比较新旧 Props；
若每个 Prop 都相同，通常可以复用先前结果而不再调用该组件。官方同时明确说明记忆化是性能优化，
不是保证：React 仍可能重新 render 组件。

课程因此使用“允许跳过”与“通常跳过”，不把它描述成生命周期保证。验收以相同快照中可重复观测到的
Profiler commit 记录为证据，不把一次肉眼感觉当成结论。

### 2. 默认比较是逐项 `Object.is`

React 默认比较每一个 Prop。标量值保持不变时容易满足比较；对象、数组和函数即使内容或函数体看起来
一样，只要每次 render 新建，引用就不同。默认行为不是递归读取对象字段的深比较。

这解释了为什么“已经包了 `memo`”仍可能没有收益：问题常常不是 `memo` 失效，而是父组件一直提供
不同的引用。函数引用缓存属于 `useCallback` 的职责，派生值引用缓存属于 `useMemo` 的职责；本课只说明
它们与 Props 比较的接口边界，不重复依赖和缓存规则。

### 3. State 与 Context 不属于父级 Props 比较

`memo` 只处理父组件带来的 Props 比较。记忆化组件自己的 State 更新时仍需 render；它读取的 Context
变化时也仍需 render。把 `memo` 理解为“冻结组件”会破坏对 React 更新来源的判断。

课程正文只解释这一边界，不展开 Context 拆分、selector 或外部 store 设计。

### 4. 自定义 comparator 是例外，不是默认建议

`memo` 的第二个参数可以自定义比较，但 comparator 返回 `true` 就表示 React 可以继续使用旧输出。
遗漏任意 Prop 都可能保留陈旧 UI；遗漏函数尤其可能让组件中的处理器继续闭包旧 Props 与 State。
官方建议确认比较函数真的快于重新 render，并避免深比较未知深度的数据。

本课将其放入风险边界，不提供自定义 comparator Demo。学习者先缩小 Props、保持自然的数据模型并测量；
只有证据充分时才考虑额外比较逻辑。

## 审计表

| 动作 | 结论 |
| --- | --- |
| 保留 | 稳定 ID、标题、默认 `Object.is` 比较、State/Context 边界、引用 Props、自定义比较风险和 Profiler 对照。 |
| 补充 | 完整签名与返回值、最小 Props 设计、Context 外层读取方案、同值 State 边界、四组练习和同源 CSS。 |
| 删除 | 旧路线编号、后续课程提示、Admission/发布批次、过期哈希与历史构建数据。 |
| 移动 | 无。 |
| 合并 | 无。 |
| 新增 | 无新课程或新 Demo ID；只修订当前稳定资产。 |

## 与相关知识点的边界

- Profiler 提供 commit、`actualDuration` 与 `baseDuration` 的测量方法，本课直接复用测量结论。
- `useMemo` 负责纯计算结果和对象/数组值的缓存；本课只解释结果引用如何进入 Props 比较。
- `useCallback` 负责函数身份和依赖；本课只说明新函数 Prop 会使默认比较判定为变化。
- React Compiler 不在本课范围，不把编译器配置与手写 `memo` 并列教学。

## Demo 合同

正式 Demo ID：

`react.core.learn.advanced.memo-component-bailout.parent-update-demo`

Demo 使用普通组件和 `memo` 包装的同一报告组件形成对照。两个报告分别在自身内部放置 Profiler，
记录组件真正 render 后形成的 commit。记录保存在稳定 Ref 中，并写入报告外部的固定日志 DOM，避免
日志更新安排新的 React render 或反向污染被测分支。

确定性交互：

1. 冷挂载后普通报告与记忆化报告各有一次 `mount` 记录。
2. 清空记录不会 render 两个被测报告。
3. 点击“仅更新父组件”后，普通报告新增一次记录，`memo` 报告保持零条。
4. 点击“修改报告 Props”后，两边都新增记录，DOM 中显示的新 Prop 一致。
5. 每个报告执行同一确定性计算；不使用随机数、网络、timer 或肉眼流畅度判断。
6. 清空记录后可以从当前 Props 重复观察，不修改父级版本或报告内容。

Demo 不使用 `useImperativeHandle`、`useMemo`、`useCallback`、自定义 comparator、Context、外部 store 或
React Compiler。运行和源码展示从同一个 TSX/CSS 源码包读取。

## 易错点账本

正文覆盖八个不重复的高价值错误：

1. 把 `memo` 当成功能正确性依赖。
2. 认为父组件更新时 `memo` 必定跳过。
3. 把默认比较误认为对象深比较。
4. 每次传入新对象或数组后仍期待跳过。
5. 每次传入新函数后仍期待跳过，并提前越界到 `useCallback` 教学。
6. 认为 `memo` 会阻止组件自身 State 或 Context 更新。
7. 未测量就给所有组件包 `memo`。
8. 自定义 comparator 漏比 Props 或函数闭包。

每项必须包含触发条件、原因、后果、错误示例、正确写法和验证方式；不得把同一引用身份问题拆成
更多条目凑数。

## 验证合同

### 静态与类型验证

- 解析 Markdown，确认稳定 ID、固定章节、八个完整 pitfalls、四组练习和唯一 Demo ID。
- 扫描 TSX/CSS，拒绝 `useImperativeHandle`、`useMemo`、`useCallback`、自定义 comparator、网络、timer、
  随机数、CSS Grid、`gap` 与非零 `letter-spacing`。
- `memo` 只包装报告组件；普通与记忆化分支接收相同的稳定 Ref 和标量 Props。
- 运行组件与源码展示必须读取同一份 TSX/CSS，不能复制展示代码。
- TypeScript 只能证明组件、Props、Ref 和 Profiler 回调的类型，不能证明 React 一定跳过 render 或优化有收益。

### 浏览器可观察路径

1. 冷挂载后普通报告与记忆化报告各产生一次 `mount` commit。
2. 清空记录后两边均为零，清空动作不重新 render 报告。
3. 仅更新父组件后普通报告为一条、记忆化报告为零条，两个报告仍显示相同版本和校验值。
4. 修改报告 Prop 后普通报告为两条、记忆化报告为一条，两边显示相同的新版本。
5. 再次清空记录后从当前 Props 重复操作，仍得到 `0/0 -> 1/0 -> 2/1` 的计数路径。
6. 桌面、390px 与 200% 文本下无横向溢出、遮挡或按钮文字裁切，console 无 error/warning。
7. 展开源码可同时看到当前 TSX 与 CSS，不出现禁区 API。

## 独立复审清单

### Standards

- 单课只讲 `memo` 的组件 Props bailout，没有展开第二条完整主线。
- 正文结构、八个 pitfalls、中文职责注释、TSX/CSS 与同源 Demo 满足仓库规范。
- 学习者正文没有本地依赖、Gate、哈希、浏览器验收或复审状态。

### Spec

- 相同 Props 的 `memo` 子组件可观察地跳过，变化 Props 时仍 render 且输出正确。
- 默认逐项 `Object.is`、State/Context、引用 Props、性能优化与“不保证”边界准确。
- 未实施 `useCallback` 或 `useMemo` 的完整用法教学；本课只保留它们与 Props 身份比较的边界说明。

两轴必须在同一冻结 snapshot 达到 `PASS / 0 finding`。
