# 受控表单研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.controlled-forms`
- 标题：受控表单
- 教学层级：零基础到进阶
- 核验日期：`2026-08-09`
- 研究状态：已完成，可进入单知识点课程编写

本课只回答一条主线：表单控件的当前值由 React State 作为唯一渲染来源时，如何在每次编辑后同步更新
State，并正确处理文本、数字、checkbox、radio、`select`、多选和 `textarea`。

明确排除：`submit`、`preventDefault`、表单 Action、原生约束校验、文件上传实现、State 所有权与
Thinking in React、Reducer、Context、Effect、Ref、hydration、第三方表单库和服务端数据。

## 研究方法与证据边界

1. 按仓库规定首先调用 Tavily。2026-08-09 的 `tavily_search` 与 `tavily_extract` 成功，定位并提取
   React 官方 `<input>`、`<select>`、`<textarea>`、Sharing State 页面以及 MDN file input 页面。
2. Tavily `tavily_research` 首次因账户用量上限返回错误，未把失败摘要或不完整结果当作事实；
   2026-08-09 重跑已成功，结果与已提取的 React、MDN 官方页面一致，并继续以官方原文中的 warning
   与 prop 合同作为最终证据。
3. React 版本页当前文档为 19.2。课程正文只采用 React DOM 公开合同，不把内部 Fiber、事件委托或
   浏览器实现细节写成受控组件要求。
4. “受控/非受控”是组件设计术语。React 官方说明它们不是严格的二元分类；本课只讨论原生表单控件
   当前值的 `value`/`checked` 合同，组件级状态所有权另列课程。

## 官方来源卡

| ID | 一手来源 URL | 采用的 claim |
| --- | --- | --- |
| `react-input` | [React `<input>`](https://react.dev/reference/react-dom/components/input) | 文本 `value`、checkbox/radio `checked`、`onChange` 同步、`defaultValue`/`defaultChecked`、不能在受控与非受控之间切换、`null`/`undefined` warning、file input 边界。 |
| `react-select` | [React `<select>`](https://react.dev/reference/react-dom/components/select) | 单选/多选 `value`、`defaultValue`、`onChange`、不能给 `<option>` 使用 `selected`、受控生命周期合同。 |
| `react-textarea` | [React `<textarea>`](https://react.dev/reference/react-dom/components/textarea) | `value`、`defaultValue`、`onChange`、children 不作为初始值、受控输入不更新 warning。 |
| `react-sharing-state` | [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) | controlled/uncontrolled 术语的设计含义；只作为概念边界，不展开提升 State。 |
| `react-common` | [Common components](https://react.dev/reference/react-dom/components/common) | `onChange`、`readOnly`、`disabled` 等通用 DOM prop 合同。 |
| `mdn-file` | [`<input type="file">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file) | 文件选择由用户和浏览器控制；使用 `files` 读取选择结果，不把文件路径当普通文本 value。 |
| `mdn-input` | [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) | `value`、`checked`、`selected` 的平台语义和 input 类型边界。 |

## 事实矩阵

| 控件 | 受控 prop | 非受控初始 prop | `onChange` 读取 | State 类型 |
| --- | --- | --- | --- | --- |
| 文本、搜索、email 等 | `value` | `defaultValue` | `event.currentTarget.value` | `string` |
| number、range | `value` | `defaultValue` | 仍先读字符串 | `string` 或显式转换后的业务类型 |
| checkbox | `checked` | `defaultChecked` | `event.currentTarget.checked` | `boolean` |
| radio | `checked` | `defaultChecked` | `checked` 与固定 `value` | 选中项通常为 `string` |
| select 单选 | `value` | `defaultValue` | `event.currentTarget.value` | `string` |
| select 多选 | `value` | `defaultValue` | 从 `selectedOptions` 读取 | `string[]` |
| textarea | `value` | `defaultValue` | `event.currentTarget.value` | `string` |
| file | 不提供普通受控 value 合同 | 无需用 defaultValue 模拟 | `event.currentTarget.files` | `FileList`/文件元数据由事件读取 |

## 关键易错点矩阵

1. 给文本输入传 `value` 却不传 `onChange`，控件变成只读并出现 warning；若只需初始值使用
   `defaultValue`，若确实只读则明确 `readOnly`。
2. checkbox/radio 使用 `value` 表示选中状态；正确的受控 prop 是 `checked`，`value` 只表示提交或分组
   数据。
3. 在受控输入中把初始 State 写成 `undefined`/`null`，后续变成字符串，会触发 uncontrolled → controlled
   warning。文本值用 `''` 或 `someValue ?? ''`，checkbox 用明确 boolean。
4. 受控与非受控不能在同一个控件生命周期中切换。`value={condition ? text : undefined}` 不是安全的
   “暂时放开控制”写法。
5. `<select>` 的选中值由 `<select value>`/`defaultValue` 决定，不能在 `<option>` 上写 `selected`。
   多选必须使用字符串数组并设置 `multiple`。
6. `<textarea>` 的内容由 `value`/`defaultValue` 决定，不使用 children 提供初始内容。
7. `type="number"` 的 DOM `value` 仍是字符串；`valueAsNumber` 在空值时为 `NaN`，不能无条件写入
   `number` State。
8. 受控输入的 `onChange` 必须同步写回传入的 `value`/`checked`，否则用户输入会在下一 render 被 React
   覆盖；异步或格式化逻辑必须另行设计，不在本课扩展。
9. `type="file"` 的选择由浏览器安全模型控制，不把用户文件路径写回 `value`；在 change 中读取
   `currentTarget.files`，需要清空选择时重置 DOM 控件或让用户重新选择，具体命令式做法留给 Ref 课程。
10. label 的 `htmlFor` 必须指向唯一 `id`；多个 radio 共享 `name`，但受控 State 仍由选中的 `value` 建模。

## 编写验收要求

- 正文每个 React 代码示例使用 `tsx`，不混用 `jsx`。
- Demo 至少可观察文本、checkbox、radio、单选 select、多选 select 和 textarea 的同步；另有明确的
  `defaultValue` 非受控对照和 file input 边界说明。
- 不在本课加入 submit、Action、校验、Effect、Ref 或服务器请求。
- 运行时源码与展示源码必须来自同一 `.tsx` 文件；CSS 只使用 Flexbox/正常流，不使用 `grid` 或 `gap`。
