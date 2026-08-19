# RC2 React Core 中级课程单知识点计划

> 核验日期：2026-08-11
> 历史状态：知识点范围已冻结；29/29 已闭环，RC2 路线完成并停止
> 文档性质：调整前 RC2 历史计划与验收记录，不再定义现行课程数量、顺序或下一任务
> 现行状态：React Core 74/74；以 [`React课程调整总计划.md`](./React课程调整总计划.md) 为准
> 适用版本：React / React DOM 19.2.8，React 官方文档 19.2，TypeScript 7.0.2
> authoring 合同：[`IT学习站前端规范.md`](../../IT学习站前端规范.md)、[`课程内容规范.md`](../../standards/课程内容规范.md)

## 1. 修订原因

R0-B 最初把 RC2 冻结为 8 篇聚合课程。一篇旧课程往往同时包含多个可以独立命名、独立检索和独立
练习的知识点，例如“共享与重置 State”同时包含提升 State、受控边界、树中位置和 key 重置；
“Effect Event 与自定义 Hook”同时包含 Effect 依赖、无需 Effect、Effect Event 与 Hook 复用。

这不符合当时的 v2.3 课程合同。RC2 因此改为 29 篇单知识点课程，每篇只承担一个核心心智模型、公开
API 或明确的使用边界。旧 8 个 ID 从未发布为 `available`，直接由新清单替代，不建立旧 URL 重定向。

本计划只冻结课程范围、顺序和边界，不提前调研 29 篇课程的详细正文。每篇课仍须在开始编写前单独
建立研究记录，完成该课闭环后才能进入下一篇。

### 1.1 单知识点粒度判定

一篇课程可以完整覆盖同一个知识点的意义、语法、基础用法、易错点、进阶用法和适用边界；这些属于
教学深度，不算多个知识点。出现以下任一情况时，必须继续拆课：

1. 同一篇需要并列定义两个可独立命名、独立检索的公开 API。
2. 同一篇需要同时建立两个没有直接依赖关系的核心心智模型。
3. 某个使用边界可以脱离当前主线独立练习、独立验收，并拥有不同的高价值易错点。
4. 标题只能依靠“以及”“全解”“综合”等聚合词才能覆盖正文主线。

当时冻结的 29 篇已按该规则逐项复核。`受控与非受控组件` 是同一状态所有权模型的两端，
`Reducer 与 Context 组合` 是建立在前置 API 之上的单一组合模式，均不再拆分；每篇实施时若调研发现
第二条独立主线，必须先修订本计划并拆出新课程，不能把它留在同一正文中。

## 2. 历史冻结课程清单

| 顺序 | 稳定 ID | 知识点 | 本课唯一主线 | 前置 |
| ---: | --- | --- | --- | --- |
| 1 | `react.core.learn.intermediate.state-structure` | State 结构 | 组织关联数据并避免矛盾、重复和过深嵌套 | RC1 |
| 2 | `react.core.learn.intermediate.derived-values` | 派生值 | 从 Props 与 State 计算结果，不保存冗余 State | 1 |
| 3 | `react.core.learn.intermediate.lifting-state-up` | 提升 State | 把共享状态移动到最近共同父组件 | 2 |
| 4 | `react.core.learn.intermediate.controlled-and-uncontrolled-components` | 受控与非受控组件 | 判断组件状态由调用方还是组件自身拥有 | 3 |
| 5 | `react.core.learn.intermediate.state-identity-by-position` | State 的位置身份 | 用 render tree 中的位置解释 State 保留 | 4 |
| 6 | `react.core.learn.intermediate.resetting-state-with-key` | 使用 key 重置 State | 显式改变组件身份并重建局部 State | 5 |
| 7 | `react.core.learn.intermediate.use-reducer` | useReducer | 用 reducer 管理集中状态转换 | 6 |
| 8 | `react.core.learn.intermediate.action-design` | Action 设计 | 用最小事件意图描述状态更新 | 7 |
| 9 | `react.core.learn.intermediate.reducer-purity` | Reducer 纯度 | 保持 reducer 纯净并返回新状态 | 8 |
| 10 | `react.core.learn.intermediate.create-context` | createContext | 创建 Context 并定义有意义的默认值 | 9 |
| 11 | `react.core.learn.intermediate.use-context` | useContext | 读取最近 Provider 提供的当前值 | 10 |
| 12 | `react.core.learn.intermediate.provider-scope-and-overrides` | Provider 作用域 | 用 Provider 嵌套、覆盖和边界控制数据范围 | 11 |
| 13 | `react.core.learn.intermediate.reducer-context-composition` | Reducer 与 Context 组合 | 组合 state Context、dispatch Context 与 reducer | 12 |
| 14 | `react.core.learn.intermediate.state-sharing-boundary` | 状态共享边界 | 判断状态应留在局部、提升还是进入 Context | 13 |
| 15 | `react.core.learn.intermediate.use-ref` | useRef | 保存不参与渲染的可变值 | 14 |
| 16 | `react.core.learn.intermediate.dom-refs` | DOM Ref | 聚焦、滚动和测量 React 管理的 DOM | 15 |
| 17 | `react.core.learn.intermediate.callback-refs` | Callback Ref | 管理动态节点集合与 ref 清理 | 16 |
| 18 | `react.core.learn.intermediate.ref-as-prop` | ref 作为 prop | 在 React 19 函数组件中接收并转交 ref | 17 |
| 19 | `react.core.learn.intermediate.use-imperative-handle` | useImperativeHandle | 向父组件暴露受限命令式接口 | 18 |
| 20 | `react.core.learn.intermediate.use-effect` | useEffect | 在提交后同步 React 外部系统 | 19 |
| 21 | `react.core.learn.intermediate.effect-cleanup` | Effect 清理 | 让连接、监听和计时器的建立与撤销对称 | 20 |
| 22 | `react.core.learn.intermediate.effect-lifecycle` | Effect 生命周期 | 按独立同步过程理解开始、停止与重新同步 | 21 |
| 23 | `react.core.learn.intermediate.unnecessary-effects` | 不需要 Effect 的场景 | 把渲染计算和用户事件留在正确阶段 | 22 |
| 24 | `react.core.learn.intermediate.effect-dependencies` | Effect 依赖 | 识别 Effect 读取的响应值并声明完整依赖 | 23 |
| 25 | `react.core.learn.intermediate.removing-effect-dependencies` | 移除 Effect 依赖 | 通过改写数据流减少依赖而不是压制检查 | 24 |
| 26 | `react.core.learn.intermediate.effect-events` | Effect Event | 从 Effect 提取读取最新值的非响应逻辑 | 25 |
| 27 | `react.core.learn.intermediate.custom-hooks` | 自定义 Hook | 复用有状态逻辑而不是共享 State 实例 | 26 |
| 28 | `react.core.learn.intermediate.use-layout-effect` | useLayoutEffect | 在浏览器绘制前测量布局并理解阻塞边界 | 27 |
| 29 | `react.core.learn.intermediate.use-insertion-effect` | useInsertionEffect | 限定 CSS-in-JS 库作者的样式插入时机 | 28 |

## 3. 原 8 篇聚合课映射

| 原 planned ID | 新课程范围 |
| --- | --- |
| `state-structure-and-derived-values` | 第 1-2 课 |
| `sharing-and-resetting-state` | 第 3-6 课 |
| `reducers-and-actions` | 第 7-9 课 |
| `context-and-provider-boundaries` | 第 10-12 课 |
| `reducer-context-and-scaling` | 第 13-14 课 |
| `refs-dom-and-imperative-escape-hatches` | 第 15-19、28-29 课 |
| `effects-lifecycle-and-cleanup` | 第 20-22 课 |
| `effect-events-and-custom-hooks` | 第 23-27 课 |

原批次能力没有被静默删除。`useLayoutEffect` 与 `useInsertionEffect` 从旧“Ref、DOM 与命令式逃生舱”
中拆出独立课程；后者明确只面向 CSS-in-JS 库作者，不推荐普通业务代码使用运行时样式注入。

## 4. 官方范围依据

本次只用官方目录确认拆课边界，详细事实留到逐课研究：

- [Managing State](https://react.dev/learn/managing-state)：State 结构、共享、身份、Reducer 与 Context。
- [Escape Hatches](https://react.dev/learn/escape-hatches)：Ref、DOM、Effect、Effect Event 与自定义 Hook。
- [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle)：受限命令式 handle。
- [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect)：绘制前布局测量边界。
- [useInsertionEffect](https://react.dev/reference/react/useInsertionEffect)：CSS-in-JS 库作者专用边界。

## 5. 串行实施合同

每篇课程必须依次完成：当前知识点官方调研、单知识点正文、同源 Demo 或适配的最小验证、桌面与
390px 浏览器证据（适用时）、双轴独立复审、状态登记和临时资产清理。未闭环当前知识点前，不开始
下一篇详细调研或正文。

当时的执行顺序是在 RC1 `20/20` 后直接进入本计划，不等待逐课确认。RC2 达到 `29/29` 后按本批停止；
随后 RC3 完成冻结并闭环第 1 课“Profiler 渲染测量”，当时的下一执行点为第 2 课“memo 与组件跳过
渲染”。

## 6. 第 1 课：State 结构

### 6.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/state-structure.md`。
- 课程正文：`src/categories/frontend/react/core/learn/state-structure.md`。
- 同源 Demo：`react.core.learn.intermediate.state-structure.state-model-demo`。

本课只建立关联 State 的拆分与合并、互斥状态建模、冗余和重复 State、Props 镜像、稳定 ID 与深层
嵌套扁平化的判断。派生值的完整计算与缓存、提升 State、受控边界、Reducer、Context、Ref、Effect、
外部 store、路由与远程数据继续留在后续独立知识点。

### 6.2 闭环结果

- Tavily 5 组 `search` 与 4 批 `extract` 均成功，7/7 个官方 URL 抽取成功；未切换后备搜索，课程
  结论回到 React Versions、Choosing the State Structure、Updating Objects in State 与 useState
  官方原文核验。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit`、`npm run test:e2e` 和 scoped `git diff --check` 通过，仓库未增加持久测试文件。
- Playwright 生产预览验证通过：空主题提交进入 `error`，有效主题提交进入 `success` 并显示
  `TICKET-2048`，编辑后回到 `editing`，切换分类后标签和说明同步更新。
- 1440px、390px 与 390px + 200% 根字号均无横向溢出或控件裁切；冷会话 console 为
  `0 error / 0 warning`。
- 展示源码去掉末尾空白后的 SHA-256 为
  `146852a6342de736f8524f2e9d86368cb2ee67caad0fefe52f4a2d8b72eb917c`，与实际运行的 TSX 文件一致。
- 首轮 Spec 复审发现两个易错点缺少完整展开，修复后 Standards 与 Spec 两轴复审均为
  `PASS / 0 finding`。第 1 课登记为 `available`，其余 28 课保持 `planned`。

## 7. 第 2 课：派生值

### 7.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/derived-values.md`。
- 课程正文：`src/categories/frontend/react/core/learn/derived-values.md`。
- 同源 Demo：`react.core.learn.intermediate.derived-values.product-analysis-demo`。

本课只建立从当前 Props 与 State 纯同步计算结果、避免冗余 State 与 Effect 同步，以及经过测量后使用
`useMemo` 跳过依赖未变化更新期计算的判断。提升 State、受控边界、组件 `memo`、`useCallback`、
Effect 完整教学、外部 store、路由与远程数据继续留在后续独立知识点。

### 7.2 闭环结果

- Tavily 6 组 `search` 与 6 批 `extract` 均成功，9/9 次官方 URL 抽取成功；未切换后备搜索，课程
  结论回到 React Versions、Choosing the State Structure、You Might Not Need an Effect、useMemo 与
  Components and Hooks must be pure 官方原文核验。
- 临时浏览器性能对照使用相同设备和 1200 项确定性目录。直接执行商品分析时，全目录中位数约
  `1.9ms`、P95 约 `2.6ms`；查询“键盘”后的结果中位数约 `1.3ms`、P95 约 `1.4ms`。只切换紧凑显示
  时 `useMemo` 依赖未变化并跳过该计算，存在稳定的更新期复用机会，因此保留缓存；测量资产未写入仓库。
- Playwright 生产预览验证通过：查询、库存筛选、名称/价格/评分排序立即更新列表与统计；无结果分支
  显示 `0` 和 `¥0`，全目录显示 `1200` 项与 `¥1,321,560`，评分排序后的首批结果均为 `4.9`。
- 1440px、390px 与 390px + 200% 根字号均无横向溢出或控件裁切；冷会话 console 为
  `0 error / 0 warning`。
- 展示源码去掉末尾空白后的 SHA-256 为
  `ff87516712236bef1714b56701c16084192afae3a6e8411e9b538f37727d34cf`，与实际运行的 TSX 文件一致。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit`、`npm run test:e2e` 和 scoped `git diff --check` 通过，仓库未增加持久测试文件。
- 首轮复审发现状态登记未闭环且计划缺少性能测量记录；统一状态并补录同条件测量依据后，Standards
  与 Spec 两轴复审均为 `PASS / 0 finding`。第 2 课登记为 `available`，其余 27 课保持 `planned`。

## 8. 第 3 课：提升 State

### 8.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/lifting-state-up.md`。
- 课程正文：`src/categories/frontend/react/core/learn/lifting-state-up.md`。
- 同源 Demo：`react.core.learn.intermediate.lifting-state-up.synced-inputs-demo`。

本课只建立最近共同父组件、唯一状态所有者、值向下与回调向上的共享模型，不引入 Context、
Reducer 或外部 Store。

### 8.2 闭环结果

- 两个输入、预览与字符数共享同一 State；任一输入更新或清空都同步到所有读取方。
- 三种视口无溢出或裁切，冷会话 console 为 `0 error / 0 warning`。
- 展示源码与运行 TSX 均为 `1968` 字符、`2270` 字节，SHA-256 为
  `62394cc027719b5bea3f97c079d6be2e8750442149841940a0c905ffe1a1c8ee`。
- Standards 与 Spec 为 `PASS / 0 finding`，第 3 课已登记为 `available`。

## 9. 第 4 课：受控与非受控组件

### 9.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/controlled-and-uncontrolled-components.md`。
- 课程正文：`src/categories/frontend/react/core/learn/controlled-and-uncontrolled-components.md`。
- 同源 Demo：`react.core.learn.intermediate.controlled-and-uncontrolled-components.ownership-editor-demo`。

本课只建立 `value` / `onChange` 与 `defaultValue` 表达的值所有权合同，以及空字符、`undefined`、
`null` 和模式切换边界。

### 9.2 闭环结果

- 受控实例可由调用方替换和以空字符清空；更新 `defaultValue` 不覆盖非受控实例的当前编辑。
- 三种视口无溢出或裁切，production console 为 `0 error / 0 warning`。
- 展示源码与运行 TSX 均为 `3752` 字符、`4364` 字节，SHA-256 为
  `39560132c803d51f5e7905003d89d503a02e3ff1cfa6c7cd60c868d4ab069dab`。
- Standards 与 Spec 为 `PASS / 0 finding`，第 4 课已登记为 `available`。

## 10. 第 5 课：State 的位置身份

### 10.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/state-identity-by-position.md`。
- 课程正文：`src/categories/frontend/react/core/learn/state-identity-by-position.md`。
- 同源 Demo：`react.core.learn.intermediate.state-identity-by-position.position-identity-demo`。

本课只用 render tree 中的位置与组件类型解释 State 保留、销毁与子树重建，`key` 只作为下一课边界。

### 10.2 闭环结果

- 同位置同类型在 Props 变化后保留 State；移除实例或改变祖先类型后对应子树重建。
- 三种视口无溢出或裁切，冷会话 console 为 `0 error / 0 warning`。
- 展示源码与运行 TSX 均为 `4255` 字符、`4591` 字节，SHA-256 为
  `fd57aeef32158d862e1a656432ecefd4a4cefff186abd18ffb9d69651dd91d1b`。
- Standards 与 Spec 为 `PASS / 0 finding`，第 5 课已登记为 `available`。

## 11. 第 6 课：使用 key 重置 State

### 11.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/resetting-state-with-key.md`。
- 课程正文：`src/categories/frontend/react/core/learn/resetting-state-with-key.md`。
- 同源 Demo：`react.core.learn.intermediate.resetting-state-with-key.customer-editor-demo`。

本课只建立稳定 `key` 改变组件身份并重建局部 State 的模型，不展开 Reducer、Context 或 Effect 清理。

### 11.2 闭环结果

- 切换客户时，不加 key 的草稿保留，`key={customer.id}` 的草稿和 DOM 身份均重置。
- 三种视口无溢出或裁切，冷会话 console 为 `0 error / 0 warning`。
- 展示源码与运行 TSX 均为 `3655` 字符、`3991` 字节，SHA-256 为
  `9455fc2ce067195a73590fd30501842dac676c32866b8e2974e72a0f38d2e1da`。
- Standards 与 Spec 均为 `PASS / 0 finding`；第 6 课已登记为 `available`，并已完成单课双轴复审。

## 12. 第 7 课：useReducer

### 12.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/use-reducer.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-reducer.md`。
- 同源 Demo：`react.core.learn.intermediate.use-reducer.task-board-demo`。

本课只建立 State、Action、reducer 与 dispatch 的基本数据流，包含 `init` 初始化转换和
`useState`/`useReducer` 的选择边界。Action 语义设计、reducer 纯度、Context 和 Provider 作用域继续
留在第 8 至第 12 课。

### 12.2 闭环结果

- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit`、`npm run test:e2e` 和 scoped `git diff --check` 通过。
- Playwright 冷会话验证通过：添加、完成、删除、清空、清空后再添加和连续两个 dispatch；桌面、390px
  与 390px + 200% 根字号均无页面或 Demo 横向溢出，冷会话 console 为 `0 error / 0 warning`。
- 第 7-12 课已登记为 `available`，第 13-29 课保持 `planned`。

## 13. 第 8 课：Action 设计

### 13.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/action-design.md`。
- 课程正文：`src/categories/frontend/react/core/learn/action-design.md`。
- 同源 Demo：`react.core.learn.intermediate.action-design.feedback-action-demo`。

本课只建立事件式 Action、最小载荷、交互粒度、判别联合和可审计日志；Reducer 纯度留到下一课，
Context 与 Provider 留到第 10-12 课。

### 13.2 闭环结果

- 研究记录回到 React 19.2 官方 `Extracting State Logic into a Reducer`、`useReducer`、`Using
  TypeScript` 与 `React Versions` 原文核验，未引入第三方状态库约定。
- `npm run type-check`、`npm run lint`、`npm run format:check` 和 scoped `git diff --check` 通过。
- Playwright 冷会话验证通过：标题编辑产生 `title_changed`，优先级选择产生 `priority_selected`，
  提交只产生一个 `feedback_submitted` 且计数增加、标题清空；重置只产生一个 `draft_reset` 且标题和
  优先级同时复位；超过 6 条日志后只保留最近 6 条。
- `1440px`、`390px` 与 `390px + 200%` 根字号均无横向溢出，Demo 和控件没有越界；冷会话 console 为
  `0 error / 0 warning`。
- 展示源码与运行 TSX 去除末尾空白后均为 `3834` 字符、`4102` 字节，SHA-256 为
  `84d2896f475020340f4148e1b0aef68a217124d8ffdbf756a65ca445c793930f`。
- 课程只覆盖一个知识点，8 个易错点字段完整，Demo 与正文一致，Standards 与 Spec 均为
  `PASS / 0 finding`。第 8 课登记为 `available`。

## 14. 第 9 课：Reducer 纯度

### 14.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/reducer-purity.md`。
- 课程正文：`src/categories/frontend/react/core/learn/reducer-purity.md`。
- 同源 Demo：`react.core.learn.intermediate.reducer-purity.reducer-purity-demo`。

本课只建立 reducer 的确定性、不可变返回、禁止副作用与 Strict Mode 暴露边界，不引入 Context。

### 14.2 闭环结果

- 添加、切换、删除和清空均返回新 State；重放同一 State/Action 得到相同结果且不修改旧数组。
- 三种视口无溢出或裁切，冷会话 console 为 `0 error / 0 warning`。
- 展示源码与运行 TSX 均为 `4655` 字符、`5117` 字节，SHA-256 为
  `3e3e60dfc86329f471a2b9984d4d534fd0eaf914c9f1ae884bb9cfe267a0167a`。
- 第 9 课已登记为 `available`。

## 15. 第 10 课：createContext

### 15.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/create-context.md`。
- 课程正文：`src/categories/frontend/react/core/learn/create-context.md`。
- 同源 Demo：`react.core.learn.intermediate.create-context.default-contract-demo`。

本课只建立 Context 通道身份、静态默认值、类型设计与 Props 边界，不展开 `useContext` 读取流程。

### 15.2 闭环结果

- 无 Provider、Provider 提供 `compact` 与显式 `undefined` 三种情形均符合默认值合同。
- 三种视口无溢出或裁切，冷会话 console 为 `0 error / 0 warning`。
- 展示源码与运行 TSX 均为 `3789` 字符、`4155` 字节，SHA-256 为
  `e21e588ee73a2f9f394352d813ecef14af04b1f6401a36e735b77eda468d8cdf`。
- 第 10 课已登记为 `available`。

## 16. 第 11 课：useContext

### 16.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/use-context.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-context.md`。
- 同源 Demo：`react.core.learn.intermediate.use-context.read-current-value-demo`。

本课只建立当前 Context 值的读取、最近 Provider、无 Provider 默认值和 Provider 更新传播，不展开嵌套策略。

### 16.2 闭环结果

- 无 Provider 观察区保持 `comfortable`；切换 Provider `value` 后，读取组件同步为 `compact`。
- 三种视口无溢出或裁切，冷会话 console 为 `0 error / 0 warning`。
- 展示源码与运行 TSX 均为 `2516` 字符、`2782` 字节，SHA-256 为
  `38bbbf6881caa7a7fff3a17927b74aacf99ace7d23213bda946ef4011a2345c8`。
- 第 11 课已登记为 `available`。

## 17. 第 12 课：Provider 作用域

### 17.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/provider-scope-and-overrides.md`。
- 课程正文：`src/categories/frontend/react/core/learn/provider-scope-and-overrides.md`。
- 同源 Demo：`react.core.learn.intermediate.provider-scope-and-overrides.scope-boundary-demo`。

本课只建立 Provider 子树范围、嵌套、最近覆盖与局部边界，不展开第 13 课的 Reducer + Context 组合。

### 17.2 闭环结果

- 切换外层值只更新 Header/Footer，内层 Editor 继续读取最近覆盖；切换内层值只更新 Editor。
- 三种视口无溢出或裁切，冷会话 console 为 `0 error / 0 warning`。
- 展示源码与运行 TSX 均为 `3060` 字符、`3456` 字节，SHA-256 为
  `d37098ae42f69c4cfa65d400a90123f76a73df618d5c50ff2256dc63cef35ac0`。
- 第 12 课已登记为 `available`；第 13-29 课保持 `planned`，下一课为“Reducer 与 Context 组合”。

## 18. 第 13 课：Reducer 与 Context 组合

### 18.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/reducer-context-composition.md`。
- 课程正文：`src/categories/frontend/react/core/learn/reducer-context-composition.md`。
- 同源 Demo：`react.core.learn.intermediate.reducer-context-composition.task-context-demo`。

本课只组合一个 Provider 中的 `useReducer`、独立 State Context 与 dispatch Context，不展开状态应留在
局部、提升还是进入 Context 的选择，也不引入外部 Store、远程缓存、Effect 或通用自定义 Hook 教学。

### 18.2 闭环结果

- 初始状态、添加、切换和重置均通过浏览器验证；重置后恢复 2 个任务、1 个已完成，最近 Action 为
  `workspace/reset`。
- `1440px`、`390px` 与 `390px + 200%` 根字号均无页面或 Demo 横向溢出，控件无裁切；冷会话 console
  为 `0 error / 0 warning`。
- 页面复制源码与运行 TSX 去除末尾换行后均为 `5784` 字符、`6434` UTF-8 字节，SHA-256 为
  `2a8f28e324b2836306d0a6d6910fe463dc568499e8dbbc6385f5fd4c312be3ac`。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit`、`npm run test:e2e` 与 `git diff --check` 均通过。
- 首轮独立复审的 Standards 2 项、Spec 2 项 finding 已修复；同一复审者最终确认两轴均为
  `PASS / 0 finding`。
- 第 1-13 课为 `available`，第 14-29 课保持 `planned`；下一课为“状态共享边界”，本轮不开始第 14 课。

## 19. 第 14 课：状态共享边界

### 19.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/state-sharing-boundary.md`。
- 课程正文：`src/categories/frontend/react/core/learn/state-sharing-boundary.md`。
- 同源 Demo：`react.core.learn.intermediate.state-sharing-boundary.state-ownership-boundary-demo`。

本课只建立“可派生则不保存、单一使用者留在局部、附近共同事实提升到最近共同父组件、深层共同事实
进入明确 Provider 子树”的决策链。Context 只改变传递路径，不改变 State 所有权；不展开 `useRef`、
Effect、外部 Store、远程缓存或性能优化。

### 19.2 闭环结果

- 帮助开关只更新 InlineHelp；文档选择由 ReviewWorkspace 通过 Props 协调列表与预览；审阅模式由
  ReviewModeProvider 拥有并通过 Context 传给两个深层消费者。
- Provider 外课程导航预览不读取审阅模式；三个 owner 只通过各自边界内的交互恢复初始值，不建立全局
  reset State 或镜像副本。
- `1440px`、`390px` 与 `390px + 200%` 根字号均无页面或 Demo 横向溢出，控件无裁切；冷会话 console
  为 `0 error / 0 warning`。
- 页面复制源码与运行 TSX 去除末尾换行后均为 `7421` 字符、`8689` UTF-8 字节，SHA-256 为
  `896af20632f7a129d25ca176e2d8692ac4eaf7b9bab1a5b837c8c7bff5c0dd6c`。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit`、`npm run test:e2e` 与 scoped `git diff --check` 均通过。
- 首轮独立复审的 Standards 1 项、Spec 3 项 finding 已修复；同一复审者最终确认两轴均为
  `PASS / 0 finding`。
- 第 1-14 课为 `available`，第 15-29 课保持 `planned`；下一课为 `useRef`，本轮不开始第 15 课。

## 20. 第 15 课：useRef

### 20.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/use-ref.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-ref.md`。
- 同源 Demo：`react.core.learn.intermediate.use-ref.mutable-value-buffer-demo`。

本课只建立“Ref 保存跨 render 延续、但不参与页面输出的可变工作值”这一条主线；不展开 DOM Ref、
Callback Ref、ref as prop、`useImperativeHandle`、Effect、外部 Store、请求缓存或性能优化。

### 20.2 闭环结果

- Demo 用 Ref 保存待发布数量，用 State 保存公开批次快照；登记不会改变四项公开结果，独立 State 更新后
  仍可发布先前登记值，丢弃和重置均恢复约定边界。
- `1440px`、`390px` 与 `390px + 200%` 根字号均无页面或 Demo 横向溢出，控件无裁切；冷会话 console
  为 `0 error / 0 warning`。
- 页面展示源码与运行 TSX 去除末尾换行后均为 `3158` 字符、`3664` UTF-8 字节，SHA-256 为
  `4015e79bdc5c48ca15973242117a03237aea1bf448a69230ef8a798b0d66c2ee`。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、`npm run test:unit`、
  `npm run test:e2e` 与 scoped `git diff --check` 均通过。
- Standards 与 Spec 两轴独立复审最终均为 `PASS / 0 finding`；第 1-15 课为 `available`，第 16-29 课
  保持 `planned`，下一课为“DOM Ref”，本轮在第 16 课前停止。

## 21. 第 16 课：DOM Ref

### 21.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/dom-refs.md`。
- 课程正文：`src/categories/frontend/react/core/learn/dom-refs.md`。
- 同源 Demo：`react.core.learn.intermediate.dom-refs.host-node-actions-demo`。

本课只建立“在事件中访问 React 已提交的固定宿主节点”这一条主线，覆盖聚焦、滚动、一次性测量与
声明式 DOM 边界；不展开 Callback Ref、ref as prop、`useImperativeHandle`、Effect、
`useLayoutEffect`、请求缓存、外部 Store 或性能优化。

### 21.2 闭环结果

- Demo 的固定输入框获得真实焦点；固定滚动容器从 `scrollTop = 0` 移动到桌面/移动端的 `140`，在
  390px + 200% 文本下移动到 `405`；测量快照宽高均为正，重复测量稳定，重置恢复全部初值。
- `1440px`、`390px` 与 `390px + 200%` 根字号均无页面或 Demo 横向溢出，控件无裁切；冷会话 console
  与 page error 均为 `0`。
- 页面展示源码与运行 TSX 去除末尾换行后均为 `4198` 字符、`4874` UTF-8 字节，SHA-256 为
  `472564c354d35d56279fa4a29f885467a30ad05713f8b93eca82cd1389f15cc4`。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、`npm run test:unit`、
  `npm run test:e2e`、临时语义检查与 scoped `git diff --check` 均通过。
- 首轮独立复审为 Standards 1 项、Spec `PASS / 0 finding`；研究易错点由 11 项收敛到规范允许的 10 项后，
  Standards 与 Spec 复核均为 `PASS / 0 finding`。
- 第 1-16 课为 `available`，第 17-29 课保持 `planned`；下一课为“Callback Ref”，本轮在第 17 课前停止。

## 22. 第 17 课：Callback Ref

### 22.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/callback-refs.md`。
- 课程正文：`src/categories/frontend/react/core/learn/callback-refs.md`。
- 同源 Demo：`react.core.learn.intermediate.callback-refs.dynamic-node-map-demo`。

本课只建立 Callback Ref 的 setup / cleanup 对称关系，以及用单个顶层 Ref 中的 `Map` 按稳定 ID 管理动态宿主节点。
不引入 ref 作为 prop、`useImperativeHandle`、Effect、外部 Store、请求缓存或性能优化。

### 22.2 已验证结果

- `1440px`、`390px` 与 `390px + 根字号 32px` 均复跑完整路径：初始检查为 `3/3`；添加至
  `5/5`；定位 `cleanup` 后对应 `<li>` 成为 active element；逐项删除时依次为 `4/4`、`3/3`、
  `2/2`、`1/1`，每一步 Map 与当前 DOM 的稳定 ID 完全一致；单项时删除按钮禁用；恢复后重新检查为
  初始 `3/3`。
- 三种视口均无页面或 Demo 横向溢出；按钮、select、列表、状态区和证据文字无裁切或遮挡。
- 冷会话 console 为 `0 error / 0 warning`。展示源码与运行 TSX 去除末尾换行后均为 `6493` 字符、
  `7337` UTF-8 字节，SHA-256 为 `58e19522031089b6410c301282cb2670e9ee1ef9749d4ba739ba60c567a6b0d8`。
- 临时语义 Gate、`npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit`、`npm run test:e2e` 均通过。
- 首轮独立复审为 Standards 1 项、Spec 2 项 finding：第 17 课发布状态早于复审，且计划未记录桌面与
  390px 的完整 `3 -> 5 -> 1 -> 恢复` 路径。第 17 课退回 `planned` 并补齐完整浏览器证据后，同一
  复审者确认 Standards 与 Spec 均为 `PASS / 0 finding`。
- 第 1-17 课为 `available`，第 18-29 课保持 `planned`；下一课为“ref 作为 prop”，继续逐课串行推进。

## 23. 第 18 课：ref 作为 prop

### 23.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/ref-as-prop.md`。
- 课程正文：`src/categories/frontend/react/core/learn/ref-as-prop.md`。
- 同源 Demo：`react.core.learn.intermediate.ref-as-prop.transparent-input-ref-demo`。

本课只建立 React 19 函数组件接收 `ref` prop 并把它透明转交给一个明确宿主 `<input>` 的主线，同时
保留 React 18 `forwardRef`、类组件与新 JSX Transform 的版本边界。不引入 `useImperativeHandle`、
Callback Ref cleanup、Effect、动态节点集合或 Ref 合并。

### 23.2 复审、发布与验收状态

- 首轮独立复审发现 Standards 2 项、Spec 4 项 finding：`planned` 课程被提前拆分登记到 entry/demo
  manifest，浏览器摘要与原始 console 不一致，正文缺少两个结构化 pitfalls、对象 Ref 在节点移除后
  恢复 `null` 的语义，以及逐步 DOM 身份证据。
- 已撤回不成立的工程与浏览器完成声明；第 18 课资产在复审通过前未登记到正式 entry/demo manifest，
  track 保持 `planned`，总进度保持 `17/29`。
- 正文已补齐 React 18 直接使用 ref prop、继续读取 `element.ref` 两个结构化 pitfalls，以及宿主节点移除
  后对象 Ref 恢复 `null` 的语义。
- planned 未登记快照与临时原子 Admission overlay 均通过真实 Catalog 初始化；三种视口完整路径中的
  active element 与成功输入 locator 是同一 DOM 对象且不是包装层，失败输入存在但 Ref 结果为 `null`。
- 三种视口均无页面或 Demo 横向溢出、无控件裁切；从 `about:blank` 导航的冷会话为 HTTP `200`、
  `0 error / 0 warning / 0 page error`。
- 页面展示源码与运行 TSX 去除末尾换行后均为 `4101` 字符、`4899` UTF-8 字节，SHA-256 为
  `bcdc81de2d39ebe3ad50d1a2e64e56401129f4efdc243b0b2376065e6df33d64`。
- Admission 完成后 entry/demo manifest 与 track 的 SHA-256 已恢复到 planned 基线；同一独立复审者
  随后确认 Standards 与 Spec 均为 `PASS / 0 finding`。
- 修复后的临时语义 Gate、TypeScript `7.0.2` fixture、`npm run type-check`、`npm run lint`、
  `npm run format:check`、`npm run build`、`npm run test:unit`、`npm run test:e2e`、CSS 禁用项搜索与
  scoped `git diff --check` 均通过。
- 双轴通过后已原子登记 entry/demo manifest 并把本课切为 `available`；当前进度为 `18/29`，下一课为
  第 19 课“useImperativeHandle”。

## 24. 第 19 课：useImperativeHandle

### 24.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/use-imperative-handle.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-imperative-handle.md`。
- 同源 Demo：`react.core.learn.intermediate.use-imperative-handle.restricted-input-handle-demo`。

本课只建立“内部 DOM Ref 私有，父组件只获得受限命令对象”这一条主线。公开 handle 仅含 `focus()` 与
`selectAll()`；不引入 Effect、网络、timer、Callback Ref 实现、自定义 Hook 或第 20 课资产。

### 24.2 复审、发布与验收状态

- 首轮复审为 Standards `FAIL / 4 findings`、Spec `FAIL / 2 findings`；第二轮为 Standards
  `FAIL / 2 findings`、Spec `FAIL / 3 findings`。修复路线摘要、重复陷阱、依赖合同、源码来源、中文职责
  注释、Callback Ref API 边界及真实 selection 证据后，第三轮两轴均为 `PASS / 0 finding`。
- 临时 Admission overlay、TypeScript `7.0.2` fixture、type-check、lint、format、build、unit、e2e、CSS
  禁用项与 scoped diff Gate 均通过；overlay 恢复后的 planned 哈希与基线一致。
- `1440px`、`390px`、`390px + 根字号 32px` 均完成“移焦 -> 聚焦 -> 全选 -> 接口检查 -> 重复聚焦 ->
  重置”路径；结果区显示 `0..8 / 文本长度 8`，页面与 Demo 横向溢出和控件裁切均为 `0`，console 为
  `0 error / 0 warning`。
- 运行 TSX 去除尾部换行后为 `5817` 字符、`6851` UTF-8 字节，SHA-256 为
  `926a55d00bcb35b7755d2cc5983c5f3a15e36cc56e66d35789a0a5819efe28da`；运行组件与展示源码均由同一
  TSX 文件加载。
- 双轴通过后已原子登记 entry/demo manifest 并把本课切为 `available`；当前进度为 `19/29`，下一课为
  第 20 课“useEffect”，继续逐课串行推进。

## 25. 第 20 课：useEffect

### 25.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/use-effect.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-effect.md`。
- 同源 Demo：`react.core.learn.intermediate.use-effect.external-mode-widget-demo`。

本课只建立“React 提交后由 Effect 把一个 `mode` 同步到外部 Widget”这一条主线。Widget 保存在组件内部
稳定 Ref 中，setup 只读取 `mode` 并固定声明 `[mode]`；不引入 cleanup、连接生命周期、依赖治理、Effect
Event、`useLayoutEffect` 或自定义 Hook。

### 25.2 复审、发布与验收状态

- 首轮独立复审为 Standards `FAIL / 3 findings`、Spec `FAIL / 3 findings`；修正研究状态与来源、中文职责
  注释、稳定 Ref、相邻课程边界和中性状态文案后，第二轮为 Standards `FAIL / 1 finding`、Spec
  `PASS / 0 finding`。补齐两个教学工厂声明后，第三轮两轴均为 `PASS / 0 finding`。
- TypeScript `7.0.2` 临时 fixture、两个主教学示例的临时编译、type-check、lint、format、build、unit、e2e、
  CSS 禁用项和 scoped diff Gate 均通过；所有临时资产均已删除并确认不存在。
- `1440px`、`390px`、`390px + 根字号 32px` 均完成 `compact -> expanded -> compact` 路径；React 目标值、
  Widget `data-mode` 与可读文本始终一致，页面与 Demo 横向溢出和按钮裁切均为 `0`，console warning/error
  与 page error 均为 `0`，卸载后重新进入恢复 `compact`。
- 页面展示源码与运行 TSX 去除末尾换行后均为 `2554` 字符、`2984` UTF-8 字节，SHA-256 为
  `28876a61e918ce27e86896be13e039d9936196524658dff8b0bd78173cdddcb5`。
- Admission 完成后 entry/demo manifest 与 track 的 SHA-256 已恢复到 planned 基线；双轴通过后再原子登记
  entry/demo manifest 并把本课切为 `available`。当前进度为 `20/29`，下一课为第 21 课“Effect 清理”，
  继续逐课串行推进。

## 26. 第 21 课：Effect 清理

### 26.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/effect-cleanup.md`。
- 课程正文：`src/categories/frontend/react/core/learn/effect-cleanup.md`。
- 同源 Demo：`react.core.learn.intermediate.effect-cleanup.event-listener-symmetry-demo`。

本课只建立 setup 与 cleanup 对称拥有同一事件监听资源这一条主线。Demo 使用 `alpha`、`beta` 两个
确定性本地频道，Effect 固定依赖 `[channel]`；不展开第 22 课完整生命周期、第 24-26 课依赖治理与
Effect Event，也不引入自定义 Hook、布局 Effect 或样式插入 Effect。

### 26.2 复审、发布与验收状态

- 首轮独立复审为 Standards `FAIL / 1 finding`、Spec `FAIL / 2 findings`；移除学习者正文中的临时 Gate
  证据、同步研究状态与 Demo API 后，第二轮为 Standards `PASS / 0 finding`、Spec `FAIL / 1 finding`。
  清除旧事件源术语并按新合同重跑 TypeScript Gate 后，第三轮两轴均为 `PASS / 0 finding`。
- TypeScript `7.0.2` 临时 fixture、type-check、lint、format、单 Effect、固定 `[channel]`、同 handler
  add/remove、CSS 禁用项和 scoped diff Gate 均通过；临时 fixture 与浏览器目录均已删除。
- `1440px`、`390px` 与 `390px + 根字号 32px` 均完成双频道发送、频道切换、卸载、重新挂载与重置；
  页面、Demo 与按钮溢出均为 `0`，console error/warning 与失败请求均为 `0`，路由离开后返回会恢复冷状态。
- 页面展示源码与运行 TSX 去除末尾换行后均为 `5058` 字符、`5838` UTF-8 字节，SHA-256 为
  `05f66bb4dbdbce9dbcdbd556ea5f7fa3a93353bd5128e42c7c945e314f60f49c`。
- 双轴通过后已原子登记 entry/demo manifest 并把本课切为 `available`；当前进度为 `21/29`，下一课为
  第 22 课“Effect 生命周期”，继续逐课串行推进。

## 27. 第 22 课：Effect 生命周期

### 27.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/effect-lifecycle.md`。
- 课程正文：`src/categories/frontend/react/core/learn/effect-lifecycle.md`。
- 同源 Demo：`react.core.learn.intermediate.effect-lifecycle.room-sync-process-demo`。

本课只建立 Effect 作为独立同步过程的 start、stop 与重新同步主线。Demo 使用 `alpha`、`beta` 两个确定性
本地房间，Effect 固定依赖 `[process, roomId]`；不展开第 23 课的无需 Effect 判断、第 24-26 课依赖治理与
Effect Event，也不引入自定义 Hook、布局 Effect、样式插入 Effect、网络或 timer。

### 27.2 复审、发布与验收状态

- 首轮独立复审为 Standards `FAIL / 1 finding`、Spec `PASS / 0 finding`；把重复的空依赖易错项改为 cleanup
  读取可变最新输入并停止错房间后，第二轮两轴均为 `PASS / 0 finding`。
- TypeScript `7.0.2` 临时 fixture、type-check、lint、format、单 Effect、固定 `[process, roomId]`、中文职责
  注释、CSS 禁用项和 scoped diff Gate 均通过；临时 fixture、隔离项目与浏览器输出均已删除。
- `1440px`、`390px` 与 `390px + 根字号 32px` 均完成无关渲染、房间切换、隐藏、重新显示和重置；切换事件为
  `停止 alpha -> 开始 beta`，页面与 Demo 横向溢出、按钮裁切均为 `0`，console error/warning、page error、
  失败请求与 `4xx/5xx` 均为 `0`，离开后返回恢复 `alpha` 冷状态。
- 页面展示源码与运行 TSX 去除末尾换行后均为 `4862` 字符、`5554` UTF-8 字节，SHA-256 为
  `937ba73be05de930bbae6d3e99bd8b01c71869e415d494d3b89a64c8739a1525`。
- 原子登记后的最终 `npm run build-only` 已通过；生产预览冷路由返回 HTTP `200`，H1 与课程标题一致，初始为
  `已同步 alpha`，离开后返回仍恢复 `alpha`，console warning/error、page error、失败请求与 `4xx/5xx` 均为 `0`。
- 双轴通过后已原子登记 entry/demo manifest 并把本课切为 `available`；当前进度为 `22/29`，下一课为
  第 23 课“不需要 Effect 的场景”，继续逐课串行推进。

## 28. 第 23 课：不需要 Effect 的场景

### 28.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/unnecessary-effects.md`。
- 课程正文：`src/categories/frontend/react/core/learn/unnecessary-effects.md`。
- 同源 Demo：`react.core.learn.intermediate.unnecessary-effects.render-and-event-boundary-demo`。

本课只建立“没有外部系统时，派生值留在 render，明确用户动作留在事件处理器”这一条主线。Demo 只保存
数量、备注、最近动作与动作次数，摘要由当前数量纯计算；不引入 Effect、依赖治理、Effect Event、自定义 Hook、
网络、timer 或第 24-29 课 API。

### 28.2 当前验收状态

- TypeScript `7.0.2` 临时 fixture、AST 语义 Gate、type-check、lint、scoped format、Admission build、unit、
  e2e、CSS 禁用项与 scoped diff Gate 均通过；临时 fixture 与浏览器输出均已删除。
- `1440px`、`390px` 与 `390px + 根字号 32px` 均完成数量、备注、加入购物车、立即结算与重置路径；总价
  `¥80 -> ¥240`，备注不改变动作次数，两个按钮分别只增加一次动作，重置和路由返回均恢复冷状态。
- 三种视口均无页面或 Demo 横向溢出、无控件裁切；production console error/warning、page error、失败请求与
  `4xx/5xx` 均为 `0`，路由返回 HTTP `200`。
- 页面展示源码与运行 TSX 去除末尾换行后均为 `3949` 字符、`4481` UTF-8 字节，SHA-256 为
  `35df5b0588ab50baafcfa7a1770e32d0a7148348fa6b68f0127fabf63c431a4d`。
- 第二轮独立复审对同一冻结 snapshot 给出 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`；已原子登记
  entry/demo manifest 并把 track 第 23 课切为 `available`，权威进度为 `23/29`，下一课为第 24 课“Effect 依赖”。
- 原子登记后的最终 `npm run build` 转换 `1529` 个模块；生产预览冷路由返回 HTTP `200`，H1 为“不需要
  Effect 的场景”且 Demo 可见，console error/warning、page error 与失败请求均为 `0`。

## 29. 第 24 课：Effect 依赖

### 29.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/effect-dependencies.md`。
- 课程正文：`src/categories/frontend/react/core/learn/effect-dependencies.md`。
- 同源 Demo：`react.core.learn.intermediate.effect-dependencies.dependency-map-demo`。

本课只建立“从 Effect 的实际读取识别响应值，并声明完整、固定依赖清单”这一条主线。唯一 Effect 直接读取
render 派生的 `endpoint` 与 State `roomId`，依赖精确为 `[endpoint, roomId]`；无关 `note` 只触发 render，
不进入 Effect 或依赖。不提前实施第 25 课的依赖消除，也不使用第 26 课 `useEffectEvent`。

### 29.2 当前验收状态

- TypeScript `7.0.2` 临时 fixture、AST 语义 Gate、type-check、lint 与 scoped Prettier 均通过；AST 确认
  `effectCalls=1`，唯一依赖数组按顺序精确为 `["endpoint","roomId"]`。
- Admission build 转换 `1534` 个模块；overlay 撤销后 track、entry manifest 与 demo manifest 的 SHA-256
  均恢复到第 24 课 `planned` 基线。
- `1440x900`、`390x844` 与 `390x844 + 根字号 32px` 均完成区域切换、房间切换、备注输入与重置；同步
  快照依次为 `north / alpha / v1`、`south / alpha / v2`、`south / beta / v3`，备注不改变 `v3`，重置恢复
  `north / alpha / 空备注 / v1`。
- 三种视口的文档宽度均等于视口宽度；生产路由返回 HTTP `200`，console error/warning、page error、失败
  请求与 `4xx/5xx` 均为 `0`。
- 页面展示源码与运行 TSX 的 `trimEnd()` 结果均为 `4096` 字符、`4516` UTF-8 字节，SHA-256 为
  `19bf19e039f34f1b0832bf6b8c698681bfa24bb674ae95ed0cc6a046732279f8`；临时 TypeScript 与浏览器资产
  均已删除。
- 首轮独立复审为 Standards `PASS / 0 finding`、Spec `1` 个低优先级 finding：研究稿中的
  `DependencySynchronizer` 与实际 `DependencyScene` 名称不一致。修正后，对同一冻结 SHA 的复审为
  Standards `PASS / 0 finding`、Spec `PASS / 0 finding`。
- 双轴通过后已原子登记 entry/demo manifest 并把 track 第 24 课切为 `available`；当前权威进度为 `24/29`，
  下一课为第 25 课“移除 Effect 依赖”。
- 原子登记后的最终 `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run test:unit`、
  `npm run test:e2e`、scoped `git diff --check` 与 `npm run build` 均通过；build 转换 `1534` 个模块。
- 生产冷路由在 `1440x900`、`390x844` 与 `390x844 + 根字号 32px` 均返回 HTTP `200`。区域和房间使同步版本
  `1 -> 2 -> 3`，备注保持 `v3`，重置恢复 `north / alpha / 空备注 / v1`；三种视口无横向溢出，console
  error/warning、page error、失败请求与 `4xx/5xx` 均为 `0`。

## 30. 第 25 课：移除 Effect 依赖

### 30.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/removing-effect-dependencies.md`。
- 课程正文：`src/categories/frontend/react/core/learn/removing-effect-dependencies.md`。
- 同源 Demo：`react.core.learn.intermediate.removing-effect-dependencies.options-sync-demo`。

本课只覆盖一个改写：动态 `options` 只服务外部同步时，移入唯一 `useEffect` 内创建。Effect 直接读取的组件
作用域响应值只剩 `roomId`，依赖精确为 `[roomId]`；`note` 只制造无关 render，不进入 Effect，也不改变同步版本。
不提前使用 `useMemo`、`useCallback`、`useEffectEvent`、自定义 Hook、`useLayoutEffect`、`useInsertionEffect`、
lint 抑制、网络或 timer。

### 30.2 当前验收状态

- 临时 TypeScript `7.0.2` fixture 与 AST Gate 已通过；后者确认唯一 `useEffect`、内联 `[roomId]`、`options` 在
  Effect 内创建，且 `note` 未被读取。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run test:unit`、`npm run test:e2e` 与
  Catalog overlay 下的 `npm run build` 均通过；build 转换 `1539` 个模块。
- 生产路径在 `1440x900`、`390x844` 和 `390x844 + 根字号 32px` 完成冷启动、备注、房间切换、再次备注与重置。
  备注保持同步版本，切换 `beta` 使版本从 `1` 变为 `2`，重置恢复 `alpha / 空备注 / v1`；页面和 Demo 均无横向溢出，
  console error/warning 为 `0`，无动态请求。
- 本轮临时 overlay、预览服务和 Playwright 快照均已清理。待发布基线取得 Standards / Spec `PASS / 0 finding`
  后，已原子登记 entry/demo manifest 并把 track 第 25 课切为 `available`；当前正式进度为 `25/29`，下一课为
  第 26 课“Effect Event”。登记后的工程命令和生产浏览器路径均已复跑通过。

## 31. 第 26 课：Effect Event

### 31.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/effect-events.md`。
- 课程正文：`src/categories/frontend/react/core/learn/effect-events.md`。
- 同源 Demo：`react.core.learn.intermediate.effect-events.latest-notification-demo`。

本课只建立“`roomId` 决定连接重同步，`theme` 只在连接事件发生时由 `useEffectEvent` 读取”的边界。唯一
`useEffect` 的依赖精确为 `[roomId]`；主题变化不重连，下次连接事件仍读取最新主题。不提前抽取自定义 Hook，也不
使用 `useLayoutEffect`、`useInsertionEffect`、`useMemo`、`useCallback`、Ref 最新值替代、lint 抑制、网络或 timer。

### 31.2 当前验收状态

- TypeScript `7.0.2` fixture、34 项 AST Gate、type-check、lint、format、unit、e2e、临时 Catalog Admission 与
  三视口浏览器验收均通过；主题切换保持连接版本，房间切换才建立新连接。
- 两轮独立复审最终均为 Standards `PASS / 0 finding`、Spec `PASS / 0 finding`；已原子登记 entry/demo manifest
  并把 track 第 26 课切为 `available`，当前正式进度为 `26/29`，下一课为第 27 课“自定义 Hook”。
- 登记后的 `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run test:unit`、`npm run test:e2e` 与
  `npm run build` 均通过；build 转换 `1546` 个模块。
- 生产路由在 `1440x900`、`390x844` 与 `390x844 + 根字号 32px` 均通过。主题切换保持 `v1`，通知为
  `alpha / dark`；切换 `beta` 后为 `v2`，切回浅色仍为 `v2`，通知为 `beta / light`；重置和离开再进入均恢复
  `alpha / light / v1 / 暂无通知`。三种视口无页面或 Demo 横向溢出，console error/warning、失败动态请求均为 `0`。

## 32. 第 27 课：自定义 Hook

### 32.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/custom-hooks.md`。
- 课程正文：`src/categories/frontend/react/core/learn/custom-hooks.md`。
- 同源 Demo：`react.core.learn.intermediate.custom-hooks.independent-counters-demo`。

本课只建立“复用有状态逻辑，而每次调用保有独立 State”这一个模型。`IndependentCountersDemo` 在组件顶层显式两次
调用 `useCounter(0)`；左、右的增加和重置只影响各自调用。不使用 Effect、Context、Reducer、Ref、memoization、网络或
timer，也不提前讲第 28、29 课。

### 32.2 当前验收状态

- TypeScript `7.0.2` fixture、27 项 AST Gate、type-check、lint、format、unit、e2e 与 scoped diff check 均通过。
- Admission snapshot 与登记后 production build 均通过，后者转换 `1551` 个模块；运行 TSX 和“查看源码”同由
  `independent-counters-demo.tsx` 加载。
- 两轮独立复审最终均为 Standards `PASS / 0 finding`、Spec `PASS / 0 finding`。首轮发现的研究状态和组件名
  不一致已窄范围修正后复审通过。
- 已原子登记 entry/demo manifest 并将 track 第 27 课切为 `available`；当前正式进度为 `27/29`，下一课为第 28 课
  `useLayoutEffect`。
- 生产冷路由在 `1440x900`、`390x844` 与 `390x844 + 根字号 32px` 均返回 HTTP `200`。完整交互为
  `0 / 0 -> 2 / 0 -> 2 / 1 -> 0 / 1`，离开再进入恢复 `0 / 0`；三种视口均无横向溢出，console error/warning 为 `0`。

## 33. 第 28 课：useLayoutEffect

### 33.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/advanced/use-layout-effect.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-layout-effect.md`。
- 同源 Demo：`react.core.learn.intermediate.use-layout-effect.prepaint-measurement-demo`。

本课只建立“已提交 DOM 的真实几何必须在首次绘制前修正时，才使用 `useLayoutEffect`”这一条主线。Demo 只切换同一
测量盒的宽度，在唯一布局 Effect 中读取高度并写入 `measuredHeight`，让读数和标尺共用这一份 State；不实施第 29 课的
样式插入 API。

### 33.2 当前验收状态

- TypeScript `7.0.2` fixture、AST/CSS Gate、type-check、lint、全量 format、unit、e2e 与 scoped diff check 均通过。
- 临时 Admission build 转换 `1556` 个模块；运行 TSX 与“查看源码”都加载
  `prepaint-measurement-demo.tsx`。其去除尾部换行后为 `2632` 字符、`3164` UTF-8 字节，SHA-256 为
  `246d49c41a0e367f04a86ff1a14122d2c8a47d6795472ae50cb5769f2167cd8b`。
- 首轮独立复审发现第 29 课展开、中文职责注释、可见英文与研究状态不同步；窄范围修正后，独立复审为 Standards
  `PASS / 0 finding`、Spec `PASS / 0 finding`。
- 已原子登记 entry/demo manifest 并将 track 第 28 课切为 `available`；当前正式进度为 `28/29`，下一课为第 29 课
  `useInsertionEffect`。
- 临时生产路由在 `1440x900`、`390x844` 与 `390x844 + 根字号 32px` 均返回 HTTP `200`。三种视口都完成
  `wide -> narrow -> wide`，窄模式宽度更小、高度更大，读数与标尺和真实高度误差不超过 `1px`，页面和 Demo 横向
  溢出均为 `0`；有效 200% 冷会话 console 为 `0 error / 0 warning`，重新进入恢复宽模式。
- 登记后冷启动重新通过 type-check、lint、format、unit、e2e、build 与本课生产路由回归；桌面路由读数为
  `236 -> 516.5 -> 236px`，显示值和标尺分别匹配 `236 -> 517 -> 236`，console 为 `0 error / 0 warning`。

## 34. 第 29 课：useInsertionEffect

### 34.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/intermediate/use-insertion-effect.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-insertion-effect.md`。
- 同源 Demo：`react.core.learn.intermediate.use-insertion-effect.css-in-js-style-insertion-demo`。

本课只建立“CSS-in-JS 库作者在 layout Effects 前插入运行时样式”的窄边界。Demo 在唯一
`useInsertionEffect` 中创建、追加与清理唯一 `<style>` 节点，并按 `[styleMode]` 切换规则；不更新 State、
不依赖 Ref 或 DOM 更新时机，也不扩展为布局测量、通用 Effect 或业务组件的默认样式方案。

### 34.2 当前验收状态

- TypeScript `7.0.2` fixture、AST/CSS Gate、type-check、lint、全量 format、unit、e2e 与 scoped diff check
  均通过；隔离 Admission build 转换 `1561` 个模块。
- `1440x900`、`390x844` 与 `390x844 + 根字号 32px` 均完成 `neutral -> accent -> neutral`；每一步唯一
  style 节点数为 `1`，离页后为 `0`，重新进入恢复中性状态，三种视口页面、Demo 和按钮横向溢出均为 `0`。
- 运行 TSX 与页面“查看源码”的 `trimEnd()` 指纹一致：`2317` 字符、`2647` UTF-8 字节、SHA-256 为
  `7f67bd9add8fe67fd4eb473881e88b49969f9e76370da757a6206ce6b5ab0196`。
- 独立双轴复审对同一冻结 snapshot 给出 Standards `PASS / 0 finding`、Spec `PASS / 0 finding`。
- 已原子登记 entry/demo manifest 并将 track 第 29 课切为 `available`；正式进度为 `29/29`。
- 登记后 `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run test:unit`、
  `npm run test:e2e`、scoped `git diff --check` 与 `npm run build` 均通过，正式构建转换 `1561` 个模块。
- 正式生产路由在 `1440x900`、`390x844` 与 `390x844 + 根字号 32px` 均重新完成
  `neutral -> accent -> neutral`；每一步 style 节点数为 `1`，离页后为 `0`，重进恢复中性模式。
  三种视口的页面、Demo 与按钮横向溢出均为 `0`；200% 条件下标题为 `42px` 且保持完整单行。
- 登记后运行 TSX 与“查看源码”指纹仍为 `2317` 字符、`2647` UTF-8 字节及相同 SHA-256；console
  error/warning、失败请求与 `4xx/5xx` 均为 `0`。临时资产与服务清理完成后按 RC2 stop boundary 停止。
- 后续 RC3 曾完成独立冻结并闭环第 1 课“Profiler 渲染测量”；当时的下一课为第 2 课“memo 与组件
  跳过渲染”。
