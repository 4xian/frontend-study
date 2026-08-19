# React 表单调研

## 调研结论

- 目标课程：`react.core.learn.basics.react-forms`，标题固定为“React 表单”。
- 适用基线：React / React DOM `19.2.8`、React 官方文档 `19.2`、
  `@types/react 19.2.18`、TypeScript `6.0.3`、HTML / DOM / XHR Living Standards、
  WAI-ARIA `1.2`。
- 核验日期：`2026-08-16`。
- 合并结论：旧“受控表单”和“表单提交与默认行为”共享同一个浏览器表单心智模型、前置知识和
  Demo，应合并为一课。主线是“React 怎样持续提供控件值，浏览器怎样在提交时构造表单数据”。
- 课程正文只讲输入、提交、`FormData` 和基础无障碍。受控与非受控只限定到原生
  `input` / `textarea` / `select` 的值来源，不提前展开组件级 State 所有权。

### 纳入范围

1. `input`、`textarea`、`select` 的 `value` / `checked` 与同步 `onChange`。
2. 原生控件的受控、非受控边界，生命周期内切换 warning，以及
   `defaultValue` / `defaultChecked` 的初始值语义。
3. `name` 的提交职责和 radio 分组职责。
4. `<form onSubmit>`、`preventDefault()`、显式按钮 `type` 和最小提交事件模型。
5. `FormData` 的 entry list：有名字段、disabled、checkbox/radio、同名字段、
   `select multiple`、`get()` / `getAll()` 与 `string | File` 类型边界。
6. `label` / `id`、`aria-describedby`、`required`、`disabled` 的基础原生语义。
7. 当前类型基线下最小的 React change / submit 事件类型。

### 排除范围

- 不展开 State 所有者、最小 State、提升 State、单向数据流或 Thinking in React。
- 不教学组件 API 层面的 controlled / uncontrolled 架构。
- 不教学 function Action、`useFormStatus`、`useActionState`、pending、乐观更新或 Server Function。
- 不教学请求、服务端持久化、上传流程、路由、第三方表单库或复杂 schema 校验。
- 不构建自定义 combobox、listbox、日期选择器等复杂 ARIA widget。

未来学习者正文必须使用短标题，只描述上述知识；不得出现课程编号、计划、批次、迁移、测试、构建、
复审、篇幅或前后课的生产叙事。范围去向只保留在本调研记录中。

## 来源策略与版本证据

1. 按仓库顺位先对 React、WHATWG 和 TypeScript 官方域名执行三组 Tavily 查询；三组都在
   `2026-08-16` 返回账户用量上限错误，没有提供可采用的搜索结果。
2. 按固定顺位切换到 Exa，仅用于定位和提取官方页面。所有最终 claim 回到 React、WHATWG、W3C、
   Microsoft TypeScript 或精确版本声明文件，不采用搜索摘要或社区教程作为事实来源。
3. 本地锁定版本经已安装包核对为 React `19.2.8`、React DOM `19.2.8`、
   `@types/react 19.2.18`、TypeScript `6.0.3`。
   [React Versions](https://react.dev/versions#latest-version) 将当前文档标为 `19.2`，不会为每个 patch
   单独发布文档；实现证据需要 patch 精度时固定到 React 官方 `v19.2.8` tag。
4. `@types/react` 是社区维护的类型包，不是 React 运行时规范；这里只把精确版本声明作为本仓库
   TypeScript 编译合同，并用 React 官方 TypeScript 页面说明事件类型的使用方法。

## 逐 claim 官方事实账本

| ID | Claim | 官方证据 | 适用版本 |
| --- | --- | --- | --- |
| C01 | 文本类 `input` 的受控值由字符串 `value` 提供；checkbox / radio 的选中状态由 boolean `checked` 提供。传入受控 prop 时必须同时提供会更新它的 `onChange`。 | [React `<input>`](https://react.dev/reference/react-dom/components/input) | React DOM 19.2 |
| C02 | 受控 `input` 不能同时也是非受控，也不能在同一生命周期中切换；文本 `value` 应始终为字符串，`checked` 应始终为 boolean。`null` / `undefined` 后变为字符串是典型错误。 | [React `<input>` Caveats](https://react.dev/reference/react-dom/components/input#caveats) | React DOM 19.2 |
| C03 | `defaultValue` 只指定非受控文本输入的初始值，`defaultChecked` 只指定非受控 checkbox / radio 的初始选中状态；它们不是持续控制当前值的另一种写法。同一 input 不能同时提供 `value` 与 `defaultValue`，也不能同时提供 `checked` 与 `defaultChecked`。 | [React `<input>` Initial value](https://react.dev/reference/react-dom/components/input#providing-an-initial-value-for-an-input)、[ReactDOMInput.js](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom-bindings/src/client/ReactDOMInput.js#L47-L85) | React DOM 19.2、React DOM 19.2.8 实现警告 |
| C04 | React 的 `onChange` 对文本输入会在用户每次编辑时立即触发，行为接近浏览器 `input` event；受控 handler 必须同步更新 backing value，否则 React 会把旧值写回。 | [React `<input>` Props](https://react.dev/reference/react-dom/components/input#props) | React DOM 19.2 |
| C05 | 受控 `textarea` 使用字符串 `value + onChange`；非受控初始内容使用 `defaultValue`，不能用 children 提供内容，也不能在受控与非受控之间切换。 | [React `<textarea>`](https://react.dev/reference/react-dom/components/textarea) | React DOM 19.2 |
| C06 | 单选 `select` 的 `value` / `defaultValue` 是字符串；`multiple={true}` 时是字符串数组。React 不支持在 `option` 上用 `selected` 作为选择来源；受控 select 需要同步 `onChange`。 | [React `<select>`](https://react.dev/reference/react-dom/components/select) | React DOM 19.2 |
| C07 | `name` 是控件参与表单提交时的字段名；`id` 用于元素身份和关联，不会代替 `name` 成为 FormData key。 | [React `<input>` Props](https://react.dev/reference/react-dom/components/input#props)、[HTML name](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-name) | React DOM 19.2、HTML Living Standard |
| C08 | 普通 `onSubmit` handler 接收表单提交事件。浏览器默认把表单数据发往当前 URL 并刷新页面；客户端接管时调用 `preventDefault()`。受控字段可从 State 读取，非受控字段可用 `FormData` 读取。 | [React `<form>` event handler](https://react.dev/reference/react-dom/components/form#handle-form-submission-with-an-event-handler) | React DOM 19.2 |
| C09 | DOM `preventDefault()` 只在事件可取消时设置 canceled flag；它不等同于 `stopPropagation()`。HTML 提交算法发现 submit event 被取消后停止默认提交。 | [DOM `preventDefault`](https://dom.spec.whatwg.org/#dom-event-preventdefault)、[HTML form submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-2) | DOM / HTML Living Standards |
| C10 | `<button>` 的缺失和非法 `type` 都进入 Auto 状态；普通表单场景中，没有 command 属性且不在 select 内的 Auto button 是 submit button。提交命令应显式写 `type="submit"`，其他命令写 `type="button"`。 | [HTML `<button>`](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element) | HTML Living Standard |
| C11 | 当前 HTML 规范以“constructing the entry list”描述旧称“successful controls”的提交语义：无有效 `name`、disabled、未选中的 checkbox / radio、非本次 submitter 等控件被跳过。 | [HTML constructing the entry list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set) | HTML Living Standard |
| C12 | checkbox / radio 的 `checked` 决定是否选中；提交时未选中的项不产生 entry。checkbox 没有显式 `value` 时，选中项的默认提交值是 `on`，所以 UI boolean 和提交值不能混为一谈。 | [React `<input>`](https://react.dev/reference/react-dom/components/input)、[HTML checkbox state](<https://html.spec.whatwg.org/multipage/input.html#checkbox-state-(type=checkbox)>), [HTML entry list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set) | React DOM 19.2、HTML Living Standard |
| C13 | `select multiple` 的每个未禁用且已选中的 option 都会生成独立的同名 entry；只把 FormData 转成普通对象会丢失重复名称。 | [React `<select>` submission](https://react.dev/reference/react-dom/components/select#reading-the-select-box-value-when-submitting-a-form)、[HTML entry list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set) | React DOM 19.2、HTML Living Standard |
| C14 | `FormData.get(name)` 返回首个值或 `null`；`getAll(name)` 返回全部同名值。精确 DOM 类型是 `FormDataEntryValue = File | string`。 | [XHR `FormData`](https://xhr.spec.whatwg.org/#dom-formdata)、[TypeScript DOM 6.0.3](https://raw.githubusercontent.com/microsoft/TypeScript/v6.0.3/src/lib/dom.generated.d.ts) | XHR Living Standard、TypeScript 6.0.3 DOM lib |
| C15 | `new FormData(form)` 按表单当前 entry list 构造数据；可选的第二个 `submitter` 参数用于包含本次提交按钮的 `name=value`。submitter 必须是该 form 的提交按钮。 | [XHR `FormData` constructor](https://xhr.spec.whatwg.org/#dom-formdata-formdata)、[HTML entry list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set) | XHR / HTML Living Standards |
| C16 | submit event 派发到 form；原生 `SubmitEvent.submitter` 是触发提交的元素或 `null`。基础课只需用它解释多提交按钮和 FormData 第二参数，不扩展多 Action 架构。 | [HTML `SubmitEvent`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-submitevent-interface)、[TypeScript DOM 6.0.3](https://raw.githubusercontent.com/microsoft/TypeScript/v6.0.3/src/lib/dom.generated.d.ts) | HTML Living Standard、TypeScript 6.0.3 DOM lib |
| C17 | 表单控件需要可读 label。React 中可把控件嵌套在 `<label>`，或让 `htmlFor` 与控件唯一 `id` 相同；点击 label 会把焦点交给关联控件。 | [React input label](https://react.dev/reference/react-dom/components/input#providing-a-label-for-an-input)、[HTML `<label>`](https://html.spec.whatwg.org/multipage/forms.html#the-label-element) | React DOM 19.2、HTML Living Standard |
| C18 | `aria-describedby` 标识为控件提供可访问描述的一个或多个元素；它补充说明，不能取代 label 提供的名称。React 对 `aria-*` 使用与 HTML 相同的属性名。 | [WAI-ARIA `aria-describedby`](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby)、[React common props](https://react.dev/reference/react-dom/components/common#common-props) | WAI-ARIA 1.2、React DOM 19.2 |
| C19 | 原生 `required` 表示字段必须有符合控件规则的值才能提交；原生约束校验可能在 submit event 之前阻止提交。基础课只观察这个平台边界，不展开完整校验体系。 | [React `<input>` required](https://react.dev/reference/react-dom/components/input#props)、[HTML constraint validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraint-validation) | React DOM 19.2、HTML Living Standard |
| C20 | 原生 `disabled` 让控件不可交互，并使它不进入表单 entry list；课程直接使用这个原生合同，不模拟自定义禁用控件。 | [React `<input>` disabled](https://react.dev/reference/react-dom/components/input#props)、[HTML disabled controls](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#enabling-and-disabling-form-controls:-the-disabled-attribute)、[HTML entry list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set) | React DOM 19.2、HTML Living Standard |
| C21 | React 官方建议优先让 TypeScript 从 JSX handler 推断事件类型；抽取 handler 时再显式标注。官方示例使用 `React.ChangeEvent<HTMLInputElement>`。 | [React Using TypeScript](https://react.dev/learn/typescript#typing-dom-events) | React 19.2 TypeScript 指南 |
| C22 | 当前 `@types/react 19.2.18` 中，`ChangeEvent` 用于 change handler，`SubmitEvent<T>` 用于 submit handler；`FormEvent` / `FormEventHandler` 已标记 deprecated。`onSubmit` 的声明是 `SubmitEventHandler<T>`。 | [`@types/react 19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts) | `@types/react 19.2.18` 精确声明 |
| C23 | React `SubmitEvent<HTMLFormElement>` 的 `nativeEvent` 是 DOM `SubmitEvent`，后者公开 `submitter: HTMLElement | null`。当前稳定 React 类型没有把 `submitter` 直接复制到合成事件顶层。 | [`@types/react 19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts)、[TypeScript DOM 6.0.3](https://raw.githubusercontent.com/microsoft/TypeScript/v6.0.3/src/lib/dom.generated.d.ts) | `@types/react 19.2.18`、TypeScript 6.0.3 DOM lib |

## 冻结教学模型

### 1. 控件当前值

原生控件本来会在 DOM 中保存用户编辑后的当前值。React 受控合同把当前值改为每次 render 提供：

```text
React render -> value / checked -> 浏览器控件
用户编辑 -> onChange -> 更新 State -> 下一次 render
```

- 文本 `input`、`textarea`、单选 `select` 使用字符串 `value`。
- checkbox / radio 的选中状态使用 boolean `checked`；它们的 `value` 是提交数据，不是选中状态。
- 同一 radio 组共享 `name`，React State 保存当前选项值，每个 radio 的 `checked` 由比较结果得到。
- `select multiple` 使用字符串数组，并从 `selectedOptions` 读取当前集合。
- `input type="number"` 的 change 读取值仍是字符串。可以在业务边界转换，但不要在本课扩展数字解析体系。
- 每个受控 handler 必须同步更新与当前 `value` / `checked` 对应的 State。异步持久化、格式化和请求不是
  这个同步写回的替代品。

受控与非受控是控件当前值来源的二选一合同：

| 模式 | JSX 提供什么 | 用户编辑后谁保存当前值 | 适合本课的观察 |
| --- | --- | --- | --- |
| 受控 | `value` / `checked` + 同步 `onChange` | React State | 输入后 State 快照和控件同步变化 |
| 非受控 | 可选 `defaultValue` / `defaultChecked` | 浏览器 DOM | 初始值由 JSX 给出，之后可独立编辑 |

本课不能把 `value={condition ? text : undefined}` 教成“临时放开控制”。文本受控值从 `''` 开始，
checkbox / radio 从明确 boolean 开始；同一控件生命周期内不切换模式。

### 2. 提交和数据集合

`submit` 是 HTML 平台行为，React 的 `onSubmit` 是进入该边界的事件接口：

```text
用户触发提交
  -> 原生约束校验
  -> form 上的 submit event
  -> 未取消：浏览器继续默认提交
  -> 已取消：客户端留在当前页面自行处理
```

客户端接管时在 handler 开头调用 `preventDefault()`。它不读取字段、不保存数据，也不停止事件传播。
主处理器挂在 form 上；只监听提交按钮 `onClick` 会遗漏键盘等提交入口。

课程应把 FormData 解释成浏览器对表单当前状态生成的“提交投影”，不是 form DOM 子节点的全量复制：

| 控件状态 | 是否产生 entry | 结果 |
| --- | --- | --- |
| 有有效 `name` 的普通可用字段 | 是 | key 为 `name`，value 为当前提交值 |
| 没有 `name` | 否 | `id` 不能替代 `name` |
| `disabled` | 否 | 控件值不会进入 FormData |
| 未选中的 checkbox / radio | 否 | 不会产生 false 字符串 |
| 选中的同名 checkbox | 是 | 每项生成同名 entry，应使用 `getAll()` |
| `select multiple` 的多个选项 | 是 | 每个选中项生成同名 entry |
| 未作为 submitter 的提交按钮 | 否 | 需要提交意图时把有效 submitter 传给 FormData |

不要把 `Object.fromEntries(formData)` 作为通用无损转换；普通对象不能保留同名多值。读取单值也必须处理
`string | File | null`，即使本课不展开文件上传。

### 3. 基础无障碍和原生状态

- 每个字段先有 label。嵌套 label 最简单；分离书写时使用唯一 `id` 和对应 `htmlFor`。
- `name`、`id`、label 各有职责：`name` 面向提交，`id` 面向身份和关联，label 提供可读名称。
- 帮助文本或错误说明有稳定 `id` 时，用 `aria-describedby` 引用；它不能代替 label。
- 必填字段使用原生 `required`。课程只展示浏览器会阻止无效提交，不扩展自定义错误状态机。
- 真正不可用的原生控件使用 `disabled`；同时观察它不会进入 FormData。
- radio / checkbox 组选用 `fieldset` 与 `legend`；每个选项仍有自己的 label。

### 4. 最小 TypeScript 类型

内联 handler 优先依靠 JSX 推断。抽取函数时，当前类型基线的最小写法是：

```tsx
import type {
  ChangeEvent,
  SubmitEvent as ReactSubmitEvent,
} from 'react'

function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
  console.log(event.currentTarget.value)
}

function handleTextChange(event: ChangeEvent<HTMLTextAreaElement>) {
  console.log(event.currentTarget.value)
}

function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
  console.log(event.currentTarget.selectedOptions)
}

function handleSubmit(event: ReactSubmitEvent<HTMLFormElement>) {
  event.preventDefault()
  const formData = new FormData(event.currentTarget, event.nativeEvent.submitter)
  console.log(formData.getAll('topic'))
}
```

使用别名是为了避免把 React 合成 `SubmitEvent` 与全局 DOM `SubmitEvent` 混为同一个标识符。旧正文和
Demo 仍使用已 deprecated 的 `FormEvent<HTMLFormElement>`，并把 `nativeEvent` 强制断言为 DOM
`SubmitEvent`；合并实现时应改为当前 `ReactSubmitEvent<HTMLFormElement>`，直接读取已正确类型化的
`event.nativeEvent.submitter`。

## 现有内容审计

### 现有正文

| 文件 | 可复用事实 | 需要收窄或纠正 |
| --- | --- | --- |
| `learn/controlled-forms.md` | `value` / `checked`、同步 `onChange`、default props、模式切换、textarea、单选/多选 select、label / fieldset、number 字符串边界 | 删除 file input 和 key 重建、对象 State 组织章节；“单一来源/顶层”只保留原生控件值来源，不讨论组件所有者；避免把本课扩成所有 input 类型百科 |
| `learn/form-submit-and-default-behavior.md` | form `onSubmit`、`preventDefault`、显式 button type、`name`、FormData entry、同名值、disabled、submitter 边界 | 删除 submitting 状态、guard、异步本地处理和防重复承诺；压缩 `requestSubmit()` / `submit()` 细节与多意图业务包装；将 deprecated `FormEvent` 更新为当前 submit 类型 |

### 现有 Demo

| Demo | 保留观察 | 问题与处理 |
| --- | --- | --- |
| `controlled-forms-demo` | 文本、checkbox、radio、select、multiple、textarea 的受控快照；`defaultValue` 非受控对照 | 字段多数依赖嵌套 label，未观察 `id` / `aria-describedby` / `required` / FormData；file input 和 key 重置越界；字段过多且没有真实提交主线 |
| `submission-behavior-demo` | form `onSubmit`、`preventDefault`、显式按钮 type、`name`、同名 checkbox、disabled、FormData 快照 | 使用 deprecated `FormEvent` 和强制原生事件断言；提交中状态与“完成本地处理”越过本课；多提交意图占据主线；没有 textarea、multiple select、描述关联或 required |

两份 CSS 都使用 Flexbox、margin 与正常流，没有 `grid` 或 `gap`；响应式布局可复用，但合并实现只应保留
单一 Demo 所需选择器，不能把两个视觉外壳并排拼接。

## 保留、补充、删除、移动、合并清单

| 动作 | 内容 | 理由 |
| --- | --- | --- |
| 保留 | 文本 input、checkbox / radio、textarea、单选 / 多选 select 的受控合同 | 直接覆盖 React 表单的高频控件 |
| 保留 | `defaultValue` / `defaultChecked` 与受控切换 warning | 决定控件值来源，属于正确性主线 |
| 保留 | form `onSubmit`、立即 `preventDefault()`、显式 button type | 解释 React 和浏览器提交边界 |
| 保留 | `name`、disabled、同名 checkbox、multiple select、`get()` / `getAll()` | 形成完整 FormData entry 心智模型 |
| 补充 | `label` / `id` / `aria-describedby`、`required` 与 disabled 的交互和提交语义 | 当前两课没有形成完整基础无障碍闭环 |
| 补充 | 当前 `React.SubmitEvent<HTMLFormElement>` 和 `FormEvent` deprecated 事实 | 旧正文与 Demo 已不符合锁定类型基线 |
| 补充 | checkbox 未选中时没有 entry、缺省提交值 `on`、multiple select 生成重复 key | 防止把 UI boolean、单值 API 和多值提交混为一谈 |
| 删除 | file input 完整章节、文件名快照和通过 key 清空文件控件 | 上传、Ref / 重建与文件安全边界不在冻结范围 |
| 删除 | 对象 State 组织多个字段的独立章节 | 表单课不负责重新教学 State 结构 |
| 删除 | submitting 状态、disabled 防重复、handler guard、异步完成按钮 | pending 和异步提交由 Action 课程负责，本课只保留原生 disabled 字段语义 |
| 删除 | 把 `requestSubmit()` / `submit()`、多按钮 draft / publish 意图作为主线 | 不是本课冻结目标；`submitter` 只保留解释 entry list 的最小边界 |
| 移动 | State 所有者、最小 State、单一事实来源和组件拆分 | 留给 State 所有权课程 |
| 移动 | 组件 API 的 controlled / uncontrolled、提升和默认值合同 | 留给中级受控边界课程 |
| 移动 | function Action、`useFormStatus`、`useActionState`、pending 和成功重置 | 留给高级表单 Action 课程 |
| 移动 | 上传、远程持久化、第三方库、schema 校验、复杂 ARIA widget | 不进入 React Core 本课正文 |
| 合并 | 两份旧正文合并为一个定义、一个知识顺序和一组易错点 | 控件编辑和原生提交在同一真实表单中连续发生 |
| 合并 | 两个旧 Demo 合并为一个同源 Demo | 一次交互同时观察 React 当前值与浏览器提交投影，避免重复外壳 |

## 推荐正文顺序

1. 表单同时有“当前控件值”和“提交数据”两个时间点。
2. 最小受控文本 input：`value + onChange`。
3. `checked` 与 `value`：checkbox / radio 的 UI 状态和提交值。
4. `textarea` 与 `select`：单选、多选、`selectedOptions`、禁止 `option selected` 和 textarea children。
5. 非受控初始值与生命周期：`defaultValue` / `defaultChecked`、`null` / `undefined` 切换。
6. `name`、label / id / 描述关联、`required`、`disabled`。
7. form `onSubmit`、默认提交、`preventDefault()` 与 button type。
8. FormData entry list、同名值、unchecked / disabled、multiple、`get()` / `getAll()`。
9. 当前 TypeScript 事件类型、集中易错项、练习和开发判断小结。

## 单一 Demo 观察目标

推荐只保留一个“课程报名偏好表单”，唯一观察目标是：**编辑时观察 React 当前值合同，提交时观察浏览器
按成功控件规则生成的 FormData 投影。**

最小场景：

- 受控姓名 input、接收通知 checkbox、学习方式 select、备注 textarea；旁边实时显示 State 快照。
- 一个 `defaultValue` 非受控邀请码，作为初始化语义对照。
- 同名 topic checkbox 使用 `defaultChecked` 形成非受控初始选择，再配合一个 `select multiple`；提交快照
  用有序 entry 列表或 `getAll()` 显示多值。
- 字段使用唯一 `id`、`htmlFor` 和帮助文本 `aria-describedby`；一个字段使用 `required`。
- 一个 disabled 字段用于观察它不进入 FormData。
- 一个 `type="button"` 普通命令和一个 `type="submit"` 提交命令；submit handler 立即
  `preventDefault()`，不创建 pending、计时器、请求或“完成处理”按钮。
- 可选地显示 `event.nativeEvent.submitter`，但不设计 draft / publish 多 Action 流程。

Demo 不保留 file input、key 重建、上传、对象 State 教学、异步状态或服务端行为。运行源码与展示源码必须
继续来自同一 TSX 文件；样式沿用 Flexbox、margin 和正常流，不使用 `grid` 或 `gap`。

## 高风险易错点

1. 给 `value` / `checked` 却没有同步 `onChange`，导致控件看似只读并出现 warning。
2. 用 checkbox 的 `value` 判断是否选中，或从 change 事件读取 `value` 而不是 `checked`。
3. 首次传 `undefined` / `null`，之后改为字符串或 boolean，造成 uncontrolled / controlled 切换。
4. 认为 `defaultValue` / `defaultChecked` 会在后续 render 持续覆盖用户输入。
5. 在 `option` 上写 `selected`，或用 textarea children 表示 React 当前值。
6. 把 `id` 当 FormData key，或忘记 `name`，导致可见字段提交时消失。
7. 认为未选中的 checkbox 会提交 `false`；实际它没有 entry，且未写 value 的选中 checkbox 提交 `on`。
8. 用 `get()` 或 `Object.fromEntries()` 读取同名 checkbox / multiple select，静默丢失多值。
9. 在构造 FormData 前禁用需要提交的字段，随后误以为浏览器丢失了数据。
10. 表单内普通按钮省略 `type`，意外触发 submit。
11. 只处理按钮 `onClick`，没有把提交逻辑放在 form `onSubmit`。
12. 把 `preventDefault()` 误写成停止传播、读取字段、关闭校验或保存数据。
13. `required` 字段无效时仍期待 `onSubmit` 一定执行，忽略原生约束校验发生在 submit event 之前。
14. 用 `aria-describedby` 替代 label，或给帮助文本写了 ID 却没有在控件上引用。
15. 在当前 `@types/react` 中继续新写 deprecated `FormEvent`，或把 React 合成 `SubmitEvent` 与全局 DOM
    `SubmitEvent` 混为同一类型。

## 生产证据

- 已读取唯一执行路线中本课目标、合并映射、单课规范和当前停止点；没有读取或开始下一课正文。
- 已逐行审计两份旧正文、两份旧调研、两个 Demo TSX 及其 CSS。
- 本文件创建前目标路径不存在；本批只允许新增本文件，不修改课程、Demo、manifest、Track、计划或进度。
- 外部研究遵循 Tavily -> Exa 接替顺位；最终事实只采用上述官方页面和精确版本声明。
