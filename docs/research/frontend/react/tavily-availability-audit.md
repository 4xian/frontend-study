# React Core 基础课程 Tavily 可用性审计

> 审计日期：2026-08-09
> 审计范围：RC1 第 1-19 课现有研究记录
> 审计性质：只读证据核对；未修改课程正文、Demo、manifest 或计划状态

## 一、审计结论

未发现以下情况：

- Tavily 完全不可用，且后续没有重试成功；
- 完全没有使用 Tavily；
- 降级到 Exa、Parallel、Perplexity 或原生 Web 搜索后，没有回到官方一手来源；
- 研究记录缺少官方来源卡或官方一手来源 URL。

本次共核对 `19` 份基础课研究记录。其中 `19/19` 包含 Tavily 使用证据，`19/19` 包含独立来源卡，
`19/19` 包含 React、TypeScript、MDN、WHATWG、TC39 等与知识点相符的官方一手来源 URL。

历史判定依据是研究记录自身保存的调用说明，不等同于 Tavily 服务端原始调用日志；本轮实时复查结果
则来自本次实际工具调用。记录没有声明某个子接口时，审计只标为“未记录”，不反推为失败。

需补调研课程：`0`。

## 二、实时 Tavily 可用性复查

由于旧记录中存在套餐用量上限失败，本轮重新实际调用了 Tavily：

| 子接口 | 本轮结果 | 证据与判定 |
| --- | --- | --- |
| `tavily_search` | 成功 | `site:react.dev React 19.2 useState official` 返回 React 官方 `useState` 页面，并标出 `react@19.2`。 |
| `tavily_extract` | 成功 | 成功提取 `https://react.dev/reference/react/useState` 的 Reference、Usage 与 Troubleshooting 正文。 |
| `tavily_research` | 失败 | 返回 `This request exceeds your plan's set usage limit`；属于单一子接口套餐限制。 |

第 2 课旧记录只写明 Tavily 提取首次失败、随后搜索成功。针对这个子接口证据空白，本轮又执行了
课程定向复查：`tavily_search` 成功返回 React 官方 `JavaScript in JSX with Curly Braces`，
`tavily_extract` 成功提取该页面和 TypeScript 官方 JSX Handbook。它证明当前 search / extract 链路可用，
同时不改写“旧记录没有保存当时 extract 重试结果”这一历史事实。

因此，当前状态应判定为“`research` 子接口受套餐限制，但 `search` / `extract` 可用”，不能写成
“Tavily 完全不可用”。本轮没有切换到后续搜索工具；官方发现与回源链路仍可由 Tavily
`search` / `extract` 和官方直链完成。

## 三、判定口径

- **首次失败后已重跑成功**：旧记录明确写出初次失败，并写出 2026-08-09 的成功重跑和官方回源；若
  恢复的是另一子接口，逐课表会单独说明。
- **子接口受限但核心链路成功**：某个 Tavily 子接口失败，但 `search` / `extract` 已成功，且最终事实来自官方原文。
- **直接完成**：记录有 Tavily 检索或提取证据，未记载失败或外部工具降级，并有官方来源卡。
- **需补调研**：仅在完全未使用 Tavily、失败后未恢复、降级后无官方回源或缺失一手来源时成立。

## 四、逐课判定

| 课次 | 知识点与研究记录 | Tavily 判定 | 官方回源判定 | 证据行 | 需补调研 |
| ---: | --- | --- | --- | --- | --- |
| 1 | TSX 标记语法 `basics/tsx-markup-syntax.md` | 首轮发现后遇到用量上限，已重搜成功 | 已回到 React、TypeScript、Vite、JSX 规范与固定源码 | `:19-25`、`:31-40` | 否 |
| 2 | TSX 表达式与属性 `basics/tsx-expressions-and-attributes.md` | 旧记录为 extract 首次失败、search 后续成功；本轮已定向补做 search / extract，均成功 | 已回到 React、TypeScript、npm 与固定源码 | `:20-24`、`:30-41`；本审计“实时复查” | 否 |
| 3 | JSX Runtime 与 React Element `basics/jsx-runtime-and-react-element.md` | 初次三次失败，已重搜成功 | 已回到 React 官方文档、固定源码与 TypeScript 官方文档 | `:19-25`、`:29-35` | 否 |
| 4 | React Root 生命周期 `basics/react-root-lifecycle.md` | 初次用量上限，已重搜成功 | 已回到 React 19.2 Reference、固定文档提交与 React DOM 源码 | `:20-24`、`:30-35` | 否 |
| 5 | 函数组件 `basics/function-components.md` | 搜索与官方页面提取成功 | 已回到 React 19.2 Learn、Rules、lint 文档与固定提交 | `:18-24`、`:27-38` | 否 |
| 6 | 模块边界与组件树 `basics/module-boundaries-and-component-tree.md` | 有 Tavily 定域检索记录，未见失败或降级 | 已回到 React、MDN、ECMAScript 规范与固定 release | `:21-31`、`:34-50` | 否 |
| 7 | Props `basics/props.md` | 有 Tavily 定域检索记录，未见失败或降级 | 已回到 React、TypeScript、MDN、固定源码与类型声明 | `:23-33`、`:36-51` | 否 |
| 8 | children 与组合 `basics/children-and-composition.md` | 检索与页面提取全部通过 Tavily 完成 | 已回到 React 19.2、固定文档提交、固定源码与类型声明 | `:25-37`、`:41-58` | 否 |
| 9 | 条件渲染 `basics/conditional-rendering.md` | 搜索与页面提取全部通过 Tavily 完成 | 已回到 React、固定源码、TypeScript 与 MDN | `:25-39`、`:43-48` | 否 |
| 10 | 列表渲染与 key `basics/list-rendering-and-key.md` | Tavily 已定位官方候选，未见失败或降级 | 已回到 React 官方页面、固定文档提交与固定源码 | `:17-21`、`:23-41` | 否 |
| 11 | 事件处理 `basics/event-handling.md` | 初次用量上限，已重搜成功 | 已回到 React、DOM Standard、MDN、固定源码与类型声明 | `:18-24`、`:28-41` | 否 |
| 12 | useState `basics/use-state.md` | 初次多次用量上限，已重搜成功 | 已回到 React 固定文档、固定源码、TypeScript 与 ECMAScript/MDN | `:27-37`、`:40-56` | 否 |
| 13 | Render、Commit 与 State 快照 `basics/render-commit-and-state-snapshot.md` | 初次用量上限，已重搜成功 | 已回到 React 官方页面、固定提交与固定运行时版本 | `:26-38`、`:41-50` | 否 |
| 14 | State 更新队列 `basics/state-update-queue.md` | 初次用量上限，已重搜成功 | 已回到 React 固定文档、升级指南、StrictMode 与 `flushSync` 官方资料 | `:28-40`、`:45-50` | 否 |
| 15 | 对象 State 更新 `basics/updating-object-state.md` | 初次四次失败，`search` / `research` 已重跑成功 | 已回到 React、MDN 与 ECMAScript 规范 | `:23-31`、`:33-45` | 否 |
| 16 | 数组 State 更新 `basics/updating-array-state.md` | `search` / `extract` / `research` 均成功 | 已回到 React 19.2 与 MDN；未采纳深度摘要中的错误概括 | `:22-31`、`:33-50` | 否 |
| 17 | DOM Props `basics/dom-props.md` | `search` / `extract` 成功，未降级 | 已回到 React、TypeScript、MDN、W3C 与官方源码/测试 | `:23-37`、`:57-75` | 否 |
| 18 | 受控表单 `basics/controlled-forms.md` | `research` 首次受限，但 `search` / `extract` 成功；旧记录还写明 `research` 后续成功 | 已回到 React 与 MDN 官方原文 | `:19-27`、`:29-39` | 否 |
| 19 | 表单提交与默认行为 `basics/form-submit-and-default-behavior.md` | `search` / `extract` 成功，未降级 | 已回到 React 19.2、MDN 与 WHATWG HTML Standard | `:21-28`、`:30-66` | 否 |

## 五、与 RC1 计划的交叉核对

本次历史审计启动时，RC1 计划在 `RC1-基础课程官方事实核验.md:17-38` 列出 20 课，其中第 1-19 课为
`available`，第 20 课为 `planned`；当时目录已有第 19 课研究记录，但尚无第 20 课研究记录。因此本审计
的“第 1 课至当前课”按第 1-19 课执行，没有把当时尚未开始调研的第 20 课误判为 Tavily 缺失。

本审计完成后，第 20 课已单独通过 Tavily `search` / `extract` 和 React 官方原文完成调研并闭环，RC1
当前状态已更新为 `20 available / 0 planned`。这项后续结果不改变本审计对第 1-19 课历史证据的范围。

计划中的第 17-19 课闭环记录也明确写出 Tavily 成功并回到官方来源核验，见
`RC1-基础课程官方事实核验.md:534-535`、`:558-559` 与第 19 课闭环结果。

## 六、后续执行建议

不需要回补旧课调研。后续使用 Tavily 时应把接口状态分开记录：

1. 优先使用当前可用的 `tavily_search` 定位官方候选；
2. 使用 `tavily_extract` 或官方直链核验原文；
3. `tavily_research` 若继续返回套餐上限，只记录子接口受限，不把它误报为 Tavily 整体不可用；
4. 只有 `search` / `extract` 也失败且无法完成官方回源时，才按仓库顺位进入下一搜索工具。
