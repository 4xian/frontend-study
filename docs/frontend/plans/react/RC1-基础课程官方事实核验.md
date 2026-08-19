# RC1 React Core 基础课程知识点计划

> 核验日期：2026-08-10
> 历史状态：20 篇基础课程已全部闭环；当时 RC2 已完成 `29/29`，RC3 已达到 `1/24`
> 文档性质：调整前 RC1 历史计划与验收记录，不再定义现行课程数量、顺序或下一任务
> 现行状态：React Core 74/74；以 [`React课程调整总计划.md`](./React课程调整总计划.md) 为准
> 适用版本：React / React DOM 19.2.8，React 官方文档 19.2，TypeScript 7.0.2，Vite 8.1.5
> authoring 合同：[`IT学习站前端规范.md`](../../IT学习站前端规范.md)、[`课程内容规范.md`](../../standards/课程内容规范.md)

## 1. 冻结合同

RC1 基础阶段改为 20 篇独立知识点课程。每篇课程只承担一个可命名核心知识点，从零基础定义进入
意义、语法、常规用法、易错点、进阶用法、适用边界、练习和一手来源。课程正文不以综合项目步骤
替代知识点解释；Demo 可以组合并复用多个强相关知识点，但不能替代单课正文。

临时 fixture、本地依赖版本、宿主兼容说明、仓库命令、构建结果、源码哈希和 Gate 结论只进入本计划、
研究记录或 signoff，不进入面向学习者的知识点正文。

| 顺序 | 稳定 ID | 知识点 | 状态 |
| ---: | --- | --- | --- |
| 1 | `react.core.learn.basics.tsx-markup-syntax` | TSX 标记语法 | available（已闭环） |
| 2 | `react.core.learn.basics.tsx-expressions-and-attributes` | TSX 表达式与属性 | available（已闭环） |
| 3 | `react.core.learn.basics.jsx-runtime-and-react-element` | JSX Runtime 与 React Element | available（已闭环） |
| 4 | `react.core.learn.basics.react-root-lifecycle` | React Root 生命周期 | available（已闭环） |
| 5 | `react.core.learn.basics.function-components` | 函数组件 | available（已闭环） |
| 6 | `react.core.learn.basics.module-boundaries-and-component-tree` | 模块边界与组件树 | available（已闭环） |
| 7 | `react.core.learn.basics.props` | Props | available（已闭环） |
| 8 | `react.core.learn.basics.children-and-composition` | children 与组合 | available（已闭环） |
| 9 | `react.core.learn.basics.conditional-rendering` | 条件渲染 | available（已闭环） |
| 10 | `react.core.learn.basics.list-rendering-and-key` | 列表渲染与 key | available（已闭环） |
| 11 | `react.core.learn.basics.event-handling` | 事件处理 | available（已闭环） |
| 12 | `react.core.learn.basics.use-state` | useState | available（已闭环） |
| 13 | `react.core.learn.basics.render-commit-and-state-snapshot` | Render、Commit 与 State 快照 | available（已闭环） |
| 14 | `react.core.learn.basics.state-update-queue` | State 更新队列 | available（已闭环） |
| 15 | `react.core.learn.basics.updating-object-state` | 对象 State 更新 | available（已闭环） |
| 16 | `react.core.learn.basics.updating-array-state` | 数组 State 更新 | available（已闭环） |
| 17 | `react.core.learn.basics.dom-props` | DOM Props | available（已闭环） |
| 18 | `react.core.learn.basics.controlled-forms` | 受控表单 | available（已闭环） |
| 19 | `react.core.learn.basics.form-submit-and-default-behavior` | 表单提交与默认行为 | available（已闭环） |
| 20 | `react.core.learn.basics.state-ownership-and-thinking-in-react` | State 所有权与 Thinking in React | available（已闭环） |

### 1.1 批次范围

本阶段允许讲 TSX 标记与表达式、JSX runtime、客户端 root、函数组件、模块边界、Props、children、
组合、条件和列表、key、事件、`useState`、render/commit、State snapshot、更新队列、对象与数组
不可变更新、DOM props、受控表单、提交默认行为和 State 所有权。

本阶段不讲 Reducer、Context、Ref、Effect、自定义 Hook、memoization、Suspense、Transition、Action、
外部 store、Portal、Error Boundary、hydration、Router、Zustand、远程请求和缓存。它们进入后续阶段，
不得因为综合 Demo 的实现需要而提前写成课程正文。

## 2. 知识点级串行流程

每篇课程都按以下顺序闭环：

1. 只调研当前知识点，保存独立记录到 `docs/research/frontend/<technology>/<stage>/<slug>.md`。
2. 根据研究记录编写单知识点 Markdown；未确认的事实不进入正文。
3. 创建或复用能说明当前及相关知识点的同源 Demo/编译 fixture，并登记完整 Demo ID。
4. 用 `/tmp` 临时资产完成 Markdown、类型、负向语法和 manifest 验证；验证后清理并确认无残留。
5. 对有浏览器可观察结果的内容完成桌面和 390px 验证，检查 DOM、交互、源码同源和 console。
6. 独立复审正文、来源、范围、路由与状态，登记 `available` 后停止。

未完成当前知识点的闭环前，不开始下一篇；不要求整批课程一次性预调研或预写。

## 3. 第 1 课：TSX 标记语法

### 3.1 研究记录

官方事实、固定版本、正负编译证据和 10 项易错点矩阵见：

[`docs/research/frontend/react/basics/tsx-markup-syntax.md`](../../../research/frontend/react/basics/tsx-markup-syntax.md)

研究范围明确排除表达式求值、组件、Props、列表、事件、State、Root API 和渲染生命周期，避免与
后续知识点重复。

### 3.2 实施内容

- 课程正文：`src/categories/frontend/react/core/learn/tsx-markup-syntax.md`
- 聚焦标记 Demo：`react.core.learn.basics.tsx-markup-syntax.markup-structure-demo`
- 可复用综合 Demo：`react.core.learn.basics.product-table-demo`

第一课 Demo 只观察标记结构、Fragment、静态 attribute、注释和文本；商品表 Demo 可以在后续相关
课程中复用，不把后续 State、事件和表单实现提前写进本课解释。

### 3.3 本课 Gate

- Markdown frontmatter、受控 directive、完整来源和单知识点范围通过。
- TypeScript 7.0.2 TSX 正向与负向 fixture 通过，至少覆盖 `.tsx`、闭合、单根、attribute、注释和
  空白边界；本地 TypeScript 6.0.3 只承担 `vue-tsc` 宿主兼容验证。
- `npm run type-check`、`npm run lint`、`npm run format:check` 和 `npm run build` 通过。
- Playwright 桌面与 390px 验证 Demo 可观察，源码展示与运行源码 SHA-256 一致，console 为 `0 error / 0 warning`。
- 独立复审为 `PASS / 0 finding` 后，将第 1 课登记为 `available`。

### 3.4 闭环结果

- TypeScript 7.0.2 TSX 正负 fixture 与高亮回归通过；Markdown 继续使用 `tsx`，Shiki 已显式加载
  TSX grammar。本地 TypeScript 6.0.3 仅保留为 `vue-tsc` 兼容层，不作为课程知识基线。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit` 和 `npm run test:e2e` 通过。
- Playwright 桌面与 390px 验证通过；TSX token 多色高亮、Fragment 同级 DOM、注释不可见、源码
  同源、页面无横向溢出，三轮路由进入与离开均为 `0 error / 0 warning`。
- 独立复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- 第 1 课登记为 `available`；第 2 课及后续知识点仍为 `planned`，未开始实施。

## 4. 第 2 课：TSX 表达式与属性

### 4.1 研究与实施

- 独立研究记录：
  `docs/research/frontend/react/basics/tsx-expressions-and-attributes.md`。
- 课程正文：
  `src/categories/frontend/react/core/learn/tsx-expressions-and-attributes.md`。
- 同源 Demo：
  `react.core.learn.basics.tsx-expressions-and-attributes.expression-attributes-demo`。

本课聚焦 expression container、静态与动态 attribute、布尔简写、`style` 对象、spread
覆盖顺序与 child 值边界；函数组件、Props、条件渲染、列表、事件、State、React element 和
root 生命周期继续留在后续独立课程。

### 4.2 闭环结果

- TypeScript 7.0.2 正向与负向临时 fixture 通过，覆盖 expression、statement、`style`、普通
  对象 child、spread 顺序与 React 19.2.8 运行期无效对象错误。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
  `npm run test:unit` 和 `npm run test:e2e` 通过，仓库未增加持久测试文件。
- Playwright 桌面与 390px 验证通过；标题覆盖、spread 来源、布尔简写、空 child、动态
  边框均正确，无横向溢出或元素重叠，console 为 `0 error / 0 warning`。
- Vite `?raw`、本地 TSX 与浏览器展示源码的规范化 SHA-256 均为
  `4c4a0ab0feeafd1ddb63c001ac1ca5ab0f2ff6866063bf4b9bf65def50c8d68c`。
- 双轴复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- 第 2 课登记为 `available`；第 3 课起的其余 18 个知识点保持 `planned`。

## 5. 第 3 课：JSX Runtime 与 React Element

### 5.1 研究与实施

- 独立研究记录：
  `docs/research/frontend/react/basics/jsx-runtime-and-react-element.md`。
- 课程正文：
  `src/categories/frontend/react/core/learn/jsx-runtime-and-react-element.md`。
- 同源 Demo：
  `react.core.learn.basics.jsx-runtime-and-react-element.element-model-demo`。

本课聚焦 TSX transform、automatic JSX runtime、React element 公共模型、React element 与
ReactNode/DOM node 的边界，以及 element 的不可变合同；root、函数组件、Props、render/commit、
列表 key 与 Ref 继续留在后续独立课程。

### 5.2 闭环结果

- TypeScript 7.0.2 临时 fixture 通过，覆盖 `react/jsx-runtime` 的 `jsx/jsxs` emit、无 DOM 环境创建
  element、`isValidElement` 边界和 React 19.2.8 开发构建浅冻结；旧 `moduleResolution: "Node"`
  在 TS 7 得到 `TS5108`，改用 `NodeNext` 后通过。
- `npm run type-check`、`npm run lint`、`npm run format:check` 和 `npm run build` 通过；仓库未增加
  持久测试文件。
- Playwright 桌面与 390px 验证通过；JSX/createElement 输出、`type === "section"`、创建时不是
  HTMLElement、element/props 浅冻结与四组 `isValidElement` 结果均正确，无横向溢出或元素重叠，
  console 为 `0 error / 0 warning`。
- 源码展开后只有一个 TSX 块；Vite `?raw`、本地 TSX 与浏览器展示源码的规范化 SHA-256 均为
  `46d4976e76119a0ad5868c73cfd4f76901b14d26ba74b3fce88566b9fab80d68`。
- 双轴复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- 第 3 课登记为 `available`；第 4 课起的其余 17 个知识点保持 `planned`。

## 6. 第 4 课：React Root 生命周期

### 6.1 研究与实施

- 独立研究记录：
  `docs/research/frontend/react/basics/react-root-lifecycle.md`。
- 课程正文：
  `src/categories/frontend/react/core/learn/react-root-lifecycle.md`。
- 同源 Demo：
  `react.core.learn.basics.react-root-lifecycle.root-lifecycle-demo`。

本课只讲 DOM 容器、`createRoot`、同 Root 重复 `render`、`unmount`、Root 失效与重建、多个 Root、
Portal 和 hydration 入口边界。TypeScript fixture、本地工具版本和仓库验收信息仅保留在研究与计划
证据中，不再作为 Root 课程的教学章节。

### 6.2 闭环结果

- React 19.2 文档固定提交、React DOM 19.2.8 源码、React DOM 类型声明与 TypeScript 7.0.2 临时
  fixture 已核验；正向编译通过，负向样例得到预期 `TS2345`、`TS2554` 和 `TS2322`。
- `npm run type-check`、`npm run lint`、`npm run format:check` 和 `npm run build` 通过；Markdown
  pitfalls 字段修正后已在同一构建反馈环转绿。
- Playwright 桌面与 390px 验证通过：Root #1 首次 render、同 Root 修订 #2、unmount、旧 Root
  固定错误和同容器 Root #2 均符合合同；页面无横向溢出，左右导航与正文无重叠，console 为
  `0 error / 0 warning`。
- 学习者页面不再出现 `TypeScript`、`fixture`、本地环境或仓库 Gate 内容；pitfalls 标题没有重复序号。
- 源码展开后只有一个 TSX 代码块，展示源码与 Vite `?raw` 内容一致；本地与浏览器 `?raw` SHA-256
  均为 `8ec127bd06ded43f508cd7cc6885136b8baf0cdd7a870164b546e6e5abe71846`。
- 双轴复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- 第 4 课登记为 `available`；第 5 课起的其余 16 个知识点保持 `planned`。

## 7. 第 5 课：函数组件

### 7.1 研究与实施

- 独立研究记录：
  `docs/research/frontend/react/basics/function-components.md`。
- 课程正文：
  `src/categories/frontend/react/core/learn/function-components.md`。
- 同源 Demo：
  `react.core.learn.basics.function-components.pure-component-demo`。

本课只讲函数组件定义、名称大小写、JSX 使用、React 调用边界、返回值、纯渲染、局部修改、稳定定义
和 Strict Mode 的开发期纯度检查。Props、跨文件模块组织、State、事件、Effect 与 Hook 保持在后续
独立课程中。

### 7.2 闭环结果

- React 官方文档 19.2、固定文档提交与 React 19.2.8 源码已核验；课程事实均回到一手来源。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build` 和
  `git diff --check` 通过。
- Playwright 桌面与 390px 验证通过：两个 `PureSummary` 输出一致，`HiddenDraft` 不增加 DOM，
  页面无横向溢出，移动端学习路径按钮不再覆盖 Demo，console 为 `0 error / 0 warning`。
- 源码展开后只有一个 TSX 代码块；展示源码与实际运行源码的规范化 SHA-256 均为
  `14675ae31ac21f92e16a7e27ef2539d47105c0b6ffde60065f320b0829d88f6f`。
- scoped 复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- 第 5 课登记为 `available`；第 6 课起的其余 15 个知识点保持 `planned`。

## 8. 第 6 课：模块边界与组件树

### 8.1 研究与实施

- 独立研究记录：
  `docs/research/frontend/react/basics/module-boundaries-and-component-tree.md`。
- 课程正文：
  `src/categories/frontend/react/core/learn/module-boundaries-and-component-tree.md`。
- 同源 Demo：
  `react.core.learn.basics.module-boundaries-and-component-tree.tree-comparison-demo`。

本课聚焦组件的默认与具名导入导出、root component、root module、React Root object、
module dependency tree 与单次 React render tree。Props、`children`、State、事件、Hook、Effect、
Router 与构建器配置继续留在后续独立知识点。

### 8.2 闭环结果

- React 19.2 官方文档及固定提交、React 19.2.8 release、MDN 与 ECMAScript 规范已
  核验；课程中的模块语义和两棵树结论均回到一手来源。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build` 和
  `git diff --check` 通过。
- Playwright 桌面与 390px 验证通过：依赖树包含 4 个直接子模块，当前 render tree
  只包含 `CourseHeader` 与 `PublishedLesson`；面板无重叠、无横向溢出，console 为
  `0 error / 0 warning`。
- 源码展开后只有一个 TSX 代码块，合并展示 5 个实际运行模块；展示源码与本地
  合并源码的规范化 SHA-256 均为
  `84a268839ede76b2070b953c3a4fd10f86aa9868815aa6c4ba5cb45b20537a7d`。
- scoped 复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- 第 6 课登记为 `available`；第 7 课起的其余 14 个知识点保持 `planned`。

## 9. 第 7 课：Props

### 9.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/props.md`。
- 课程正文：`src/categories/frontend/react/core/learn/props.md`。
- 同源 Demo：`react.core.learn.basics.props.input-contract-demo`。

本课只讲父组件如何提供输入、函数组件如何读取单一 props 对象、TypeScript Props 合同、默认值、
只读快照、受控 spread 与 `key` 的特殊属性边界。完整 children 组合、列表与 key 身份、事件、State、
Hook、Effect、Context、Ref 和 DOM Props 继续留在后续独立知识点。

### 9.2 闭环结果

- React 19.2 官方文档及固定提交、React 19.2.8 源码、`@types/react@19.2.18`、TypeScript
  Handbook 与 MDN 已核验；`ref` 在 React 19 的版本边界与 `key` 事实已分开处理。
- `npm run type-check`、`npm run lint`、scoped Prettier、`npm run build-only` 和
  `git diff --check` 通过；课程正文没有写入临时验证、本地依赖、构建、Gate 或浏览器验收信息。
- Playwright 桌面与 390px 冷启动验证通过：两组 Props 的必填值、默认值和受控 spread 均可观察，
  移动端卡片正常换行，页面无横向溢出，TSX 源码与高亮正常，console 为 `0 error / 0 warning`。
- 研究记录独立复核结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`；课程、Demo 与
  manifest 的最终 scoped 复审纳入本课收口。
- 第 7 课登记为 `available`；第 8 课起的其余 13 个基础知识点保持 `planned`。

## 10. 第 8 课：children 与组合

### 10.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/children-and-composition.md`。
- 课程正文：`src/categories/frontend/react/core/learn/children-and-composition.md`。
- 同源 Demo：
  `react.core.learn.basics.children-and-composition.composition-boundaries-demo`。

本课只讲嵌套 TSX 如何进入 `children`、`ReactNode` 与 `ReactElement` 的类型边界、单区域与命名区域
组合、render prop、opaque children，以及 `Children` / `cloneElement` 的窄使用边界。条件渲染、列表
与 key、事件、State、Hook、Effect、Context、Ref、Router 和 Server Components 继续留在后续课程。

### 10.2 闭环结果

- React 19.2 官方文档及固定提交、React 19.2.8 `ReactChildren.js`、
  `@types/react@19.2.18` 与相关公开类型边界已核验。
- `npm run type-check`、`npm run lint`、scoped Prettier、`npm run build-only` 和
  `git diff --check` 通过；课程正文没有写入临时验证、本地依赖、项目构建、Gate 或浏览器验收信息。
- Playwright 桌面与 390px 验证通过：默认 children、命名区域、数字 `0`、render prop、结构计数和
  单 element clone 边界均可观察，页面无横向溢出，console 为 `0 error / 0 warning`。
- 展示源码只有一个 TSX 块；实际运行源码与浏览器展示源码的规范化 SHA-256 均为
  `efb2bbe5c04363074d7c91c4fa61086992648d155c80285641342d1e9abd853d`。
- 第 8 课登记为 `available`；第 9 课起的其余 12 个基础知识点保持 `planned`。

## 11. 第 9 课：条件渲染

### 11.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/conditional-rendering.md`。
- 课程正文：`src/categories/frontend/react/core/learn/conditional-rendering.md`。
- 同源 Demo：`react.core.learn.basics.conditional-rendering.branch-selection-demo`。

本课只讲普通 JavaScript 条件怎样选择 ReactNode，包括 `if`、提前 return、条件变量、三元表达式、
逻辑与、明确返回 `null`、ReactNode 可见结果和 TypeScript 控制流收窄。列表与 key、事件、State、
render/commit 深入、状态身份、Hook、Effect、Context、Ref 和后续模块均未进入课程正文。

### 11.2 闭环结果

- React 19.2 官方文档及固定提交、React 19.2.8 源码、`@types/react@19.2.18`、TypeScript
  Narrowing、MDN 与 ECMAScript 规范已核验；课程没有把可读性建议写成固定语法优先级。
- `npm run type-check`、`npm run lint`、scoped Prettier、`npm run build-only`、
  `npm run test:unit`、`npm run test:e2e` 和 `git diff --check` 通过；课程正文没有写入临时验证、
  本地环境、构建、Gate 或浏览器验收信息。
- Playwright 桌面与 390px 验证通过：“已核验”、数字 `0`、明确比较后的空结果和 `return null` 空结果
  均符合预期，内部提示节点不存在，页面横向溢出为 0，console 为 `0 error / 0 warning`。
- 展示源码只有一个 TSX 块且没有内层折叠；实际运行源码与浏览器展示源码的规范化 SHA-256 均为
  `12eaf780ed5b2d214a2bfe2a618dd82fc85de9160e042786230e2adcac4398fd`。
- 最终复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- 第 9 课登记为 `available`；第 10 课起的其余 11 个基础知识点保持 `planned`。

## 12. 第 10 课：列表渲染与 key

### 12.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/list-rendering-and-key.md`。
- 课程正文：`src/categories/frontend/react/core/learn/list-rendering-and-key.md`。
- 同源 Demo：`react.core.learn.basics.list-rendering-and-key.data-identity-demo`。

本课只讲数组怎样通过 `map`、`filter` 与排序副本产生 JSX，以及 `key` 的兄弟级唯一性、稳定数据
来源、放置层级、显式 Fragment 和特殊 Props 边界。事件、State 更新、使用 key 重置身份、Hook、
Effect、Context、Ref、Transition、动画和后续模块均未进入课程正文。

### 12.2 闭环结果

- React 19.2 官方文档及固定提交、React / React DOM 19.2.8 源码、
  `@types/react@19.2.18`、TypeScript 7.0.2 数组声明与 MDN 已核验；课程没有把内部 key
  编码或重复 key 的未支持结果写成公共合同。
- `npm run type-check`、`npm run lint`、scoped Prettier、`npm run build-only`、
  `npm run test:unit`、`npm run test:e2e` 和 scoped `git diff --check` 通过；课程正文没有写入临时
  验证、本地环境、构建、Gate 或浏览器验收信息。
- Playwright production preview 的桌面与 390px 验证通过：原始数组顺序保持不变，筛选与时长排序结果
  为 `react-props -> react-children -> react-lists`，三个业务 ID 与三组 Fragment `dt/dd` 均正确，
  页面和 Demo 横向溢出为 0，console 为 `0 error / 0 warning`。
- 展示源码只有一个 TSX 代码块且没有内层折叠；实际运行源码与浏览器展示源码的规范化 SHA-256 均为
  `a996dcd97b48cc473d66eae7a91dc763dc3ef77ca62f2d5c785af81f89a2bc4d`。
- 最终复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- 第 10 课登记为 `available`；第 11 课起的其余 10 个基础知识点保持 `planned`。

## 13. 第 11 课：事件处理

### 13.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/event-handling.md`。
- 课程正文：`src/categories/frontend/react/core/learn/event-handling.md`。
- 同源 Demo：`react.core.learn.basics.event-handling.propagation-control-demo`。

本课只讲处理函数的传递时机、内置与自定义事件 prop、事件对象与 TypeScript 类型、capture / bubble、
`stopPropagation()`、`preventDefault()`、SyntheticEvent 公共边界和事件处理器与纯 render 的关系。
Demo 仅用最小 State 记录事件轨迹，不解释 State 原理、快照、队列或批处理；受控表单、submit 专题、
Hook、Effect、Context、Ref、Router 和后续模块均未进入课程正文。

### 13.2 闭环结果

- React 19.2 官方文档及固定提交、React DOM 19.2.8 事件源码、`@types/react@19.2.18`、DOM Living
  Standard 与 MDN 已核验；初次受额度限制的 Tavily 搜索已于 2026-08-09 重跑成功，候选结论均回到
  一手来源核验，没有使用搜索摘要代替事实来源。
- `npm run type-check`、`npm run lint`、scoped Prettier、`npm run build-only`、`npm run test:unit`、
  `npm run test:e2e` 和 scoped `git diff --check` 通过；课程正文没有写入临时验证、本地环境、构建、
  Gate 或浏览器验收信息。
- 首轮浏览器交互复现了 updater 延后读取 `event.currentTarget` 的错误；Demo 改为在 handler 内先复制
  `currentTarget` 和 `defaultPrevented` 后重跑，同一反馈环通过。
- Playwright production preview 的桌面与 390px 验证通过：普通 click 为 capture -> target -> bubble，
  stop 后为 capture -> target，prevent 后继续 bubble 且地址不变、`defaultPrevented` 为 true；点击内部
  span 时 target 与 currentTarget 不同，页面和 Demo 横向溢出均为 0，console 为 `0 error / 0 warning`。
- 展示源码只有一个 TSX 代码块且没有内层折叠；实际运行源码与浏览器展示源码的规范化 SHA-256 均为
  `7227c1d0770ac5dbd973350deeaaf495b8b3a3fa470a9ab0e3e6eec347be3ca6`。
- 第 11 课登记为 `available`；第 12 课起的其余 9 个基础知识点保持 `planned`。

## 14. 第 12 课：useState

### 14.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/use-state.md`。
- 课程正文：`src/categories/frontend/react/core/learn/use-state.md`。
- 同源 Demo：`react.core.learn.basics.use-state.state-hook-demo`。

本课只建立 `useState` 的局部记忆、二元返回值、顶层调用、初始值与纯 initializer、直接值与 updater、
TypeScript 状态合同、函数 State 和相同性边界。Render/Commit、State 快照、更新队列、对象与数组更新、
Reducer、Context、Ref、Effect 和表单继续留在后续独立知识点。

### 14.2 闭环结果

- React 19.2 官方文档、固定文档提交、React 19.2.8 源码、`@types/react@19.2.18`、TypeScript
  7.0.2 与 ECMAScript `Object.is` 已核验；初次受额度限制的 Tavily 搜索已于 2026-08-09 重跑成功，
  候选结论均回到官方一手来源核验。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build-only`、
  `npm run test:unit`、`npm run test:e2e` 和 scoped `git diff --check` 通过，仓库未增加持久测试文件。
- Playwright production preview 的桌面与 390px 验证通过：计数增减与重置、布尔切换、对象替换与恢复
  均可重复操作，页面和 Demo 横向溢出为 0，console 为 `0 error / 0 warning`。
- 390px 下把根字号从 16px 提高到 32px 后，页面与 Demo 仍无横向溢出，标题、摘要、按钮和事实列表
  没有文字裁切，交互保持可用。
- 展示源码只有一个 TSX 代码块且没有内层折叠；实际运行源码与浏览器展示源码的规范化 SHA-256 均为
  `45242653e496070f4349d9327cd58ae498030df377402b14d8884e920e12353f`。
- 首轮复审指出的连续更新错误示例与 200% 文本证据缺口已修正并复验；最终结论为
  `Standards PASS / 0 finding`、`Spec PASS / 0 finding`。
- 第 12 课登记为 `available`；第 13 课起的其余 8 个基础知识点保持 `planned`。

## 15. 第 13 课：Render、Commit 与 State 快照

### 15.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/render-commit-and-state-snapshot.md`。
- 课程正文：`src/categories/frontend/react/core/learn/render-commit-and-state-snapshot.md`。
- 同源 Demo：`react.core.learn.basics.render-commit-and-state-snapshot.snapshot-demo`。

本课只建立 trigger、React render、commit、browser paint、纯 render 与 State 快照的公开心智模型，
并解释 setter 为什么不改写当前事件处理器已经读取到的值。更新队列、批处理、对象与数组 State、
Effect、Ref、DOM 测量、并发机制和 hydration 继续留在后续独立知识点。

### 15.2 闭环结果

- React 19.2 官方文档、固定文档提交、React 19.2.8 tag 与 `@types/react@19.2.18` 已核验；初次受
  额度限制的 Tavily 搜索已于 2026-08-09 重跑成功，候选结论均回到官方一手来源核验。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build-only`、
  `npm run test:unit`、`npm run test:e2e` 和 scoped `git diff --check` 通过，仓库未增加持久测试文件。
- 浏览器首轮发现正文已登记但学习路径仍为 planned，运行时目录校验拒绝路由；将第 13 课学习路径
  状态同步为 available 后，使用同一 URL 重跑通过。
- Playwright 桌面、390px 与 390px + 200% 文本验证通过：点击前为 `0 / 1`，点击后为 `1 / 2`，
  重置后恢复 `0 / 1`；setter 前后日志都读取 `{ count: 0, nextCount: 1 }`，页面与 Demo 无横向
  溢出或文字裁切，隔离重启后的新会话为 `0 error / 0 warning`。
- 展示源码只有一个 TSX 代码块且没有内层折叠；实际运行源码与浏览器展示源码的规范化 SHA-256
  均为 `b1cb970276ef9317ef01eca61edb11a919f9ec2f5b1f81dc2910e16d44badfe2`。
- Standards 与 Spec 两轴复审最终均为 `PASS / 0 finding`；第 13 课登记为 `available`，第 14 课起的
  其余 7 个基础知识点保持 `planned`。

## 16. 第 14 课：State 更新队列

### 16.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/state-update-queue.md`。
- 课程正文：`src/categories/frontend/react/core/learn/state-update-queue.md`。
- 同源 Demo：`react.core.learn.basics.state-update-queue.queue-order-demo`。

本课只建立 batching、直接值替换、updater 顺序求值、混合更新队列和 updater 纯度的公开模型，并说明
`createRoot` 下 automatic batching 与 `flushSync` 的边界。对象 State、数组 State、Reducer、Context、
Ref、Effect、表单和内部 Fiber/lane 细节均不进入本课正文。

### 16.2 闭环结果

- React 19.2 官方文档、固定文档提交、React DOM 19.2.8 源码、StrictMode 与 `flushSync` API 文档已
  核验；初次受额度限制的 Tavily 搜索已于 2026-08-09 重跑成功，候选结论均回到官方一手来源核验。
- 课程正文已移除与 State 更新队列无直接关系的 TypeScript 验证章节，仅保留当前知识点的公共合同、
  易错点、边界、练习和参考资料。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build-only`、
  `npm run test:unit`、`npm run test:e2e` 和 scoped `git diff --check` 通过，仓库未增加持久测试文件。
- Playwright 干净会话的桌面、390px 与 390px + 200% 根字号验证通过；Demo 四种队列结果为 `1 / 3 / 6 / 42`，
  页面与 Demo 无横向溢出或裁切，console 为 `0 error / 0 warning`。
- 展示源码只有一个 TSX 代码块且没有内层折叠；Demo 通过 React runtime 的 `?raw` loader 展示同源源码。
- Standards 与 Spec 两轴复审均为 `PASS / 0 finding`；第 14 课登记为 `available`，第 15 课起的其余 6 个
  基础知识点保持 `planned`。

## 17. 第 15 课：对象 State 更新

### 17.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/updating-object-state.md`。
- 课程正文：`src/categories/frontend/react/core/learn/updating-object-state.md`。
- 同源 Demo：`react.core.learn.basics.updating-object-state.immutable-object-demo`。

本课只建立对象 State 的只读快照、setter 替换语义、顶层展开、纯 updater、嵌套逐层复制、计算属性名、
删除可选字段、完整替换与重置。数组更新、表单、Reducer、Context、Effect、Ref 和内部 Fiber/lane 细节
均未进入课程正文。

### 17.2 闭环结果

- Tavily 搜索与研究接口均已成功调用，候选结论回到 React 19.2 官方文档、`useState` Reference、React
  纯度规则、MDN 与 ECMAScript 规范核验；没有使用搜索摘要替代一手来源。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、`npm run test:unit`、
  `npm run test:e2e` 和 scoped `git diff --check` 通过，仓库未增加持久测试文件。
- Playwright 验证通过：顶层更新得到 `Lin`，嵌套主题得到 `dark`，动态字段得到 `React learner`，删除
  备注得到“已删除”，完整替换得到 `Grace / System designer`，重置恢复初始对象。
- 桌面、390px 与 390px + 200% 根字号均无页面或 Demo 横向溢出、无文本裁切；干净会话 console 为
  `0 error / 0 warning`。
- Demo 通过 React runtime 的 `?raw` loader 展示同源 TSX 源码；课程没有写入临时验证、本地环境、构建、
  Gate 或浏览器验收信息。
- 独立复审结论为 `Standards PASS / 0 finding`、`Spec PASS / 0 finding`；计划、运行时 manifest 与正文
  frontmatter 状态一致。
- 第 15 课登记为 `available`；第 16 课起的其余 5 个基础知识点保持 `planned`。

## 18. 第 16 课：数组 State 更新

### 18.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/updating-array-state.md`。
- 课程正文：`src/categories/frontend/react/core/learn/updating-array-state.md`。
- 同源 Demo：`react.core.learn.basics.updating-array-state.immutable-array-demo`。

本课只建立数组 State 的只读快照、setter 替换语义、添加、删除、替换、插入、排序、反转、数组中对象的
逐层复制、updater 选择和现代 copying methods 边界。表单、Reducer、Context、Effect、Ref、服务端数据和
内部 Fiber/lane 细节均未进入课程正文。

### 18.2 闭环结果

- Tavily `search`、`extract` 与 `research` 均成功，候选结论回到 React 19.2 官方文档、React 19.2.8、
  MDN 与 TC39 核验；Tavily 摘要中的引用判断和漏写方法调用括号问题未进入课程正文。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、`npm run test:unit`、
  `npm run test:e2e` 和 scoped `git diff --check` 通过，仓库未增加持久测试文件。
- Playwright 验证通过：删除已完成项得到顺序 `2 → 3`，末尾添加得到 `2 → 3 → 4`，第二位插入得到
  `2 → 5 → 3 → 4`，首项切换为已完成，排序得到 `2 → 5 → 4 → 3`，反转得到 `3 → 4 → 5 → 2`，
  重置恢复 `1 → 2 → 3`。
- 桌面、390px 与 390px + 200% 根字号均无页面或 Demo 横向溢出、无文本裁切；干净会话 console 为
  `0 error / 0 warning`。
- 展示源码去掉末尾换行后的 SHA-256 为
  `030e3f60ae8818db1af8f93b16cb8073fde6934e487aec18698901202b74e988`，与运行 TSX 文件一致。
- Standards 与 Spec 两轴复审结论均为 `PASS / 0 finding`；第 16 课登记为 `available`，第 17 课起的其余
  4 个基础知识点保持 `planned`。

## 19. 第 17 课：DOM Props

### 19.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/dom-props.md`。
- 课程正文：`src/categories/frontend/react/core/learn/dom-props.md`。
- 同源 Demo：`react.core.learn.basics.dom-props.dom-props-demo`。

本课只建立 React element prop、DOM property 与 HTML attribute 的三层区别，DOM prop 命名和值语义、
`style` 对象、`data-*` 与 `aria-*`、Props spread 透传、`dangerouslySetInnerHTML` 与 React 19 自定义元素
边界。受控表单、提交默认行为、Ref、hydration 和自定义元素完整接入继续留在后续独立知识点。

### 19.2 闭环结果

- Tavily `search`、`extract` 与 `research` 均成功，候选结论回到 React 19.2 官方文档、React 19.2.0
  固定源码、TypeScript JSX 文档、MDN 与 W3C 核验；没有使用搜索摘要代替一手来源。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build-only`、`npm run test:unit`、
  `npm run test:e2e` 和 scoped `git diff --check` 通过，仓库未增加持久测试文件。
- Playwright 全新会话验证通过：页面正文和 Demo 正常加载；状态切换后 `class`、`tabindex`、
  `aria-disabled`、`data-state` 与数值 style 同步，`hidden` 切换正确；展示源码与运行 TSX 同源；
  桌面、390px 与 390px + 200% 根字号均无横向溢出，console 为 `0 error / 0 warning`。
- Standards 与 Spec 两轴复审结论均为 `PASS / 0 finding`；第 17 课登记为 `available`，第 18 课起的
  其余 3 个基础知识点保持 `planned`。

## 20. 第 18 课：受控表单

### 20.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/controlled-forms.md`。
- 课程正文：`src/categories/frontend/react/core/learn/controlled-forms.md`。
- 同源 Demo：`react.core.learn.basics.controlled-forms.controlled-forms-demo`。

本课只建立受控与非受控值来源、文本与 number 字符串值、checkbox/radio 的 `checked`、单选与多选
select、textarea、稳定控制生命周期、file input 读取边界和 label 可读名称。提交、`preventDefault`、
Action、校验、文件上传、State 所有权、Reducer、Context、Effect 与 Ref 继续留在后续独立知识点。

### 20.2 闭环结果

- Tavily `search`、`extract` 与 `research` 已成功调用，候选结论回到 React 19.2 官方文档与 MDN
  核验；没有使用搜索摘要代替一手来源。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build-only`、
  `npm run test:unit`、`npm run test:e2e` 和 scoped `git diff --check` 通过，仓库未增加持久测试文件。
- Playwright 冷会话验证通过：文本、number、checkbox、radio、单选、多选与 textarea 均同步 State；
  file input 可读取文件名并在重置后清空，非受控输入独立编辑且不会进入 State 快照。
- 桌面、390px 与 390px + 200% 根字号均无页面横向溢出或文字裁切；冷会话 console 为
  `0 error / 0 warning`。
- 展示源码去掉末尾换行后的 SHA-256 为
  `1b60eb3da869cf570b3193b0fa21056884f85c288283ffef7368b3c543f2b700`，与运行 TSX 文件一致。
- Standards 与 Spec 两轴复审结论均为 `PASS / 0 finding`；第 18 课登记为 `available`，第 19 课起的
  其余 2 个基础知识点保持 `planned`。

## 21. 第 19 课：表单提交与默认行为

### 21.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/form-submit-and-default-behavior.md`。
- 课程正文：`src/categories/frontend/react/core/learn/form-submit-and-default-behavior.md`。
- 同源 Demo：`react.core.learn.basics.form-submit-and-default-behavior.submission-behavior-demo`。

本课只建立 HTML submit 平台行为、form `onSubmit`、`preventDefault()`、明确的 button type、
`SubmitEvent.submitter`、FormData 成功控件与多值规则、受控 State 与非受控 FormData 提交来源，以及
当前页面的基础提交中状态。Action、校验、上传、请求、路由、Reducer、Context、Effect、Ref 和服务端
协议继续留在后续独立知识点。

### 21.2 闭环结果

- Tavily `search` 与 `extract` 均成功，候选结论回到 React 19.2 官方文档、MDN 与 WHATWG HTML Living
  Standard 核验；当前 `research` 子接口仍受套餐额度限制，不影响官方发现与回源链路。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build-only`、`npm run test:unit`、
  `npm run test:e2e` 和 scoped `git diff --check` 通过，仓库未增加持久测试文件。
- Playwright 冷会话验证通过：普通按钮只更新自身计数；发布与草稿按钮分别得到 `intent=publish` 和
  `intent=draft`；Enter 能进入 form submit handler；`defaultPrevented=true`；topics 为 `tsx, router`；
  disabled 字段未进入 FormData；URL 始终不变。
- 1440px、390px 与 390px + 200% 根字号均无页面或 Demo 横向溢出，按钮无隐藏裁切；console 为
  `0 error / 0 warning`。
- 展示源码语言为 `tsx`，去掉末尾换行后的 SHA-256 为
  `c987f075e07cc25eae04bacd13169fe4a4f455974bf5c85f6738718136ce58d0`，与运行 TSX 文件一致。
- 首轮独立复审发现 Action/服务端幂等越界展开、`FormData.get()` 来源缺失和状态登记矛盾；均已窄修并
  重跑同一 Gate。修复后的 Standards 与 Spec 两轴复审结论均为 `PASS / 0 finding`。

## 22. 第 20 课：State 所有权与 Thinking in React

### 22.1 研究与实施

- 独立研究记录：`docs/research/frontend/react/basics/state-ownership-and-thinking-in-react.md`。
- 课程正文：`src/categories/frontend/react/core/learn/state-ownership-and-thinking-in-react.md`。
- 复用综合 Demo：`react.core.learn.basics.product-table-demo`。

本课只建立最小但完整的 State 判断、State owner、最近共同父组件、每份 State 的单一事实来源、Props
向下与更新意图回传，以及 Thinking in React 的分析方法。State 结构、派生值、提升 State、受控与
非受控组件、Reducer、Context、Effect、Ref、外部 store、路由与远程数据继续留在后续独立知识点。

### 22.2 闭环结果

- Tavily 4 组 `search` 与 1 批 `extract` 均成功，未切换后备搜索；课程结论回到 React Versions、
  Thinking in React、Sharing State Between Components 与 Choosing the State Structure 官方原文核验。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、`npm run test:unit`、
  `npm run test:e2e` 和 scoped `git diff --check` 通过，仓库未增加持久测试文件。
- Playwright 生产预览验证通过：搜索“苹果”得到 1 件、合计 ¥8；勾选“只看有货”后搜索“香蕉”得到
  0 件、合计 ¥0，并显示空结果；直接刷新课程路径仍能命中当前课程。
- 1440px、390px 与 390px + 200% 根字号均无页面横向溢出或按钮裁切；console 为
  `0 error / 0 warning`。
- 展示源码去掉末尾换行后的 SHA-256 为
  `a7eab5e1d94bc31f8f2037c992ef01189bb9d5329b8aebc9310cc5d2c72e1e84`，与实际运行的商品表 TSX 一致。
- 首轮独立复审发现状态快照不一致、缺少“复制 Props 为本地 State”易错点，以及未解释候选表与
  可编辑 Demo 的 `products` 所有权差异；状态文件复核与两处正文窄修完成后，当前快照的 Standards
  与 Spec 两轴复审结论均为 `PASS / 0 finding`。

## 23. 历史执行边界与现行状态

当时基础课程状态为 `20 available / 0 planned`，RC1 已完成。中级阶段已在
[`RC2-中级课程单知识点计划.md`](./RC2-中级课程单知识点计划.md) 中把原 8 篇聚合课重新拆分并复核为
29 篇单知识点课程并达到 `29/29`。高级阶段当时由
[`RC3-高级课程单知识点计划.md`](./RC3-高级课程单知识点计划.md) 冻结为 24 课并达到
`1/24 available`、`23 planned`。这些数字只描述历史快照；现行 React Core 已按
[`React课程调整总计划.md`](./React课程调整总计划.md) 完成新路线 `74/74`。
