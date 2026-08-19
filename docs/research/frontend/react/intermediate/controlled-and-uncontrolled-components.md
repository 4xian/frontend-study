# 受控与非受控组件研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.controlled-and-uncontrolled-components`
- 标题：受控与非受控组件
- 教学层级：零基础到进阶
- 核验日期：`2026-08-10`
- 研究状态：官方事实、正文、同源 Demo、静态检查、浏览器验收与双轴复审已闭环
- 文档基线：React 官方文档 `19.2`
- 仓库实现基线：React / React DOM `19.2.8`

本课只回答一条主线：组件的一份重要信息究竟由调用方通过 Props 拥有，还是由组件通过局部 State
拥有；怎样用 `value`、`onChange` 与 `defaultValue` 表达稳定的受控或非受控合同，并在整个组件生命
周期内保持所有权一致。

必须覆盖：

1. “受控”表示重要信息由 Props 驱动，“非受控”表示该信息由组件局部 State 驱动。
2. 受控模式下，调用方保存当前 `value`，组件通过 `onChange` 或语义化回调报告更新意图。
3. 非受控模式下，组件保存当前值，调用方只能用 `defaultValue` 提供初始值。
4. `value` 控制当前值，`defaultValue` 只指定初始值，二者不能同时表达同一份信息。
5. 受控输入的 `onChange` 必须同步更新支撑 `value` 的 State，否则编辑会被旧值覆盖。
6. 同一组件实例不能在受控与非受控之间切换，以及这种切换为何会让所有权不明确。
7. 受控文本值必须始终是字符串；`undefined`、`null` 与空字符串 `''` 的模式边界。
8. 怎样为自定义组件设计互斥的受控/非受控 Props 合同，并选择适合当前协作需求的模式。

明确排除：原生表单控件大全、checkbox/radio/select/textarea/file 的完整细节、表单提交、表单 Action、
表单库、复杂验证、异步格式化、Context、Reducer、Zustand、远程数据、外部 Store、Effect、Ref、
State 在 render tree 中的位置身份，以及使用 `key` 重置 State。上述内容已有基础课或后续独立课程；
本课不研究第 5 课。

## 调研问题与边界

本课研究必须回答以下问题：

1. 受控与非受控描述的是整个组件，还是组件中某一份重要信息的所有权？
2. 调用方拥有 State 时，`value` 和 `onChange` 分别承担什么职责？
3. 组件自身拥有 State 时，`defaultValue` 为什么只能作为初始输入？
4. 只传 `onChange` 但不传当前 `value`，组件是否已经变成受控？
5. 为什么 `value` 与 `defaultValue` 不能同时用于同一份值？
6. 为什么组件实例不能先非受控、后受控，或反向切换？
7. `value={undefined}`、`value={null}` 和 `value=""` 分别意味着什么？
8. 来自 API 或可选 State 的值可能为空时，怎样保持受控合同稳定？
9. 什么场景适合由调用方控制，什么场景适合由组件局部拥有？
10. 受控组件是否必须完全没有局部 State？
11. 自定义组件怎样用 TypeScript 防止同时传 `value` 与 `defaultValue`？
12. 怎样通过源码、交互和 console 证据证明模式选择与生命周期合同正确？

研究边界是“一份可编辑文本值的所有权与组件 API”。基础课“受控表单”已经覆盖各原生控件的
`value`、`checked`、事件取值和控件差异；本课只使用文本 `<input>` 作为官方行为探针，再把所有权
原则推导到自定义组件。可以提到组件通常混合 Props 与局部 State，但不展开跨树共享、Context 或
State 位置身份。

## 研究方法与证据边界

1. 按仓库外部搜索顺位先使用 Tavily。2026-08-10 共完成 6 组 `tavily_search`，6/6 返回可靠的
   `react.dev` 官方候选，因此没有切换 Exa、Parallel、Perplexity 或原生 Web 搜索。
2. 共完成 4 批 `tavily_extract`，涉及 5 次官方 URL 抽取，5/5 成功；去重后为 3 个 `react.dev`
   页面。重复抽取 `<input>` 用于分别锁定基础合同、空值边界与模式切换 warning。
3. 搜索结果只用于发现候选 URL；所有采用事实均回到 React 官方页面的 `Raw Content` 核验。社区文章、
   搜索摘要与 AI 总结不支撑课程结论。
4. `extract` 响应的 `Content` 字段显示为 `undefined`，但每个结果都返回了对应官方 `Raw Content`。
   另对已知官方 `<input>` URL 使用 `curl -L --fail` 读取原页，确认 Caveats 原文明确写有“不能同时
   受控和非受控”“生命周期内不能切换”以及“受控输入需同步更新 backing value”。
5. `React Versions` 当前标记 latest version 为 `19.2`。仓库 `package.json` 锁定 React / React DOM
   `19.2.8`；本课区分官方文档 major/minor 口径与仓库精确依赖，不声称存在 19.2.8 独立文档快照。
6. 自定义组件以 `mode` 判别联合互斥 `value` / `defaultValue`，这是基于 React 官方所有权与 `<input>`
   合同的课程设计推导，不冒充 React 强制规定的自定义组件命名或运行时实现。
7. 本记录只冻结第 4 课事实、教学与 Demo 合同，不修改课程、Demo、manifest、track、计划、状态文件、
   测试、构建产物或其他研究文件。

## Tavily 查询日志

### Search

| ID | Tavily query | 主要官方候选 | 采用结论 |
| --- | --- | --- | --- |
| Q1 | `site:react.dev/learn/sharing-state-between-components controlled uncontrolled components local state props official React` | `Sharing State Between Components` | 采用 Props 驱动与局部 State 驱动的组件设计术语、灵活性与配置权衡。 |
| Q2 | `site:react.dev/reference/react-dom/components/input controlled input value onChange defaultValue cannot switch official React` | React `<input>`、`<select>`、`<textarea>` | 采用文本输入的 `value`、`onChange`、`defaultValue` 与生命周期合同。 |
| Q3 | `site:react.dev/reference/react-dom/components/input value undefined null empty string uncontrolled controlled warning React` | React `<input>`、`<textarea>` | 采用 `undefined`、`null`、`''` 的受控边界与切换 warning。 |
| Q4 | `site:react.dev/reference/react-dom/components/input onChange synchronously update backing value controlled input React official` | React `<input>`、`<textarea>`、`<select>` | 采用受控值必须在 `onChange` 中同步写回的合同。 |
| Q5 | `site:react.dev controlled uncontrolled component API value defaultValue owner caller local state choose flexibility official` | `Sharing State Between Components`、React `<input>` | 采用组件级所有权选择和 DOM 输入 API 的当前值/初始值对照。 |
| Q6 | `site:react.dev/versions React official latest version 19.2` | `React Versions` | 采用 React 官方文档 `19.2` 版本口径。 |

6 组 search 均成功。结果中的 React 19 表单 Action、旧版文档、class 生命周期、Ref、Transition、
表单提交、select/textarea 细节和社区页面不支撑本课唯一主线，全部排除或仅用于确认同类边界。

### Extract

| 批次 | URL | 结果 | 本课提取重点 |
| --- | --- | --- | --- |
| E1 | `https://react.dev/versions`<br>`https://react.dev/learn/sharing-state-between-components` | 2/2 成功，`Raw Content` 返回 | 19.2 版本口径、组件级受控/非受控定义、选择权衡和混合所有权。 |
| E2 | `https://react.dev/reference/react-dom/components/input` | 成功，`Raw Content` 返回 | `value`、`onChange`、`defaultValue`、当前值与初始值、只读 warning。 |
| E3 | `https://react.dev/reference/react-dom/components/input` | 成功，`Raw Content` 返回 | `undefined`、`null`、空字符串、同步更新与 uncontrolled -> controlled warning。 |
| E4 | `https://react.dev/reference/react-dom/components/input` | 成功，`Raw Content` 返回 | 不能同时使用两种模式、生命周期内不能切换、同步 backing value。 |

## 官方来源卡

| ID | React 官方一手来源 | URL | 本课采用的 claim |
| --- | --- | --- | --- |
| `react-versions` | React Versions | https://react.dev/versions | `react.dev` 提供最新 React 文档；当前 latest version 为 `19.2`；同一 major 内持续更新，不为每个 minor/patch 发布独立文档版本。 |
| `react-sharing-state` | Sharing State Between Components | https://react.dev/learn/sharing-state-between-components | 重要信息由 Props 驱动时可称受控，由局部 State 驱动时可称非受控；术语不是整个组件的严格二元分类；受控更易协调但要求调用方完整配置。 |
| `react-input` | `<input>` | https://react.dev/reference/react-dom/components/input | `value` 控制当前文本，`defaultValue` 只给初始值；受控输入需要同步 `onChange`；不能同时采用或在生命周期内切换两种模式；受控文本值不能是 `null`/`undefined`，空值使用 `''`。 |

## 版本说明

### 1. 官方文档与仓库依赖

截至 2026-08-10，React 官方版本页把 `19.2` 标为 latest version，并说明 `react.dev` 在同一 major 内
持续更新，不为每个 minor 或 patch 发布独立文档。因此本课采用“React 官方文档 19.2，核验于
2026-08-10”的口径。

仓库 `package.json` 与 `package-lock.json` 当前锁定 `react@19.2.8`、`react-dom@19.2.8`。未来课程
和 Demo 应在这个精确依赖快照上验证 warning 与交互；研究记录中的官方事实则对应 React 19.2 当前
文档，不把仓库 patch 版本写成官方独立文档版本。

### 2. API 稳定性与表达边界

`value`、`onChange`、`defaultValue` 的 `<input>` 合同是公开 React DOM 行为。自定义组件采用
`value` / `onValueChange` / `defaultValue` 是清晰且一致的课程 API，但 React 不强制所有自定义组件
必须使用这些名字。教学必须区分“React DOM 官方合同”与“沿用该语义设计的自定义组件合同”。

## 一、官方事实

### 1. 受控与非受控描述一份信息由谁拥有

React 官方把重要信息由 Props 驱动的组件称为受控，把重要信息由局部 State 驱动的组件称为非受控。
判断核心不是“有没有 `useState`”，而是当前讨论的那份信息由谁决定。一个组件可以让 `value` 受调用方
控制，同时把 hover、聚焦提示等无关信息保留为局部 State。

官方也说明这不是整个组件的严格技术二分。实际组件通常同时读取 Props 并拥有某些局部 State；应当
逐份信息确定所有者，而不是给整个组件贴上永久标签。

### 2. 受控模式由调用方提供当前值

受控文本输入接收 `value`。React 会让输入当前显示始终匹配该 Prop；对自定义组件而言，同样应把
`value` 视为调用方当前事实，组件不能再为它建立另一份可分叉的 State。调用方可以通过其他按钮、兄弟
组件或业务规则改变 `value`，受控组件在下一次 render 使用新 Prop。

### 3. onChange 是更新请求，不是值所有权

在受控模式中，组件不能直接改变调用方 State。它在用户编辑时调用 `onChange` 或自定义
`onValueChange`，把下一个值报告给调用方；调用方更新自己的 State，再把新 `value` 传回组件。

因此 `onChange` 单独存在并不代表组件受控。决定当前值的是谁，才决定所有权；一个非受控自定义组件也
可以在更新内部 State 后调用可选回调，仅用于通知调用方。

### 4. 受控输入必须同步写回当前编辑值

React 官方要求每个受控输入都有同步更新 backing value 的 `onChange`。如果传了 `value` 却不更新它，
React 会继续强制显示旧 Prop，用户输入会在每次击键后被还原。明确只读时可以使用 `readOnly`；可编辑
受控输入则必须提供同步更新入口。

本课只建立直接写回 `event.currentTarget.value` 的基础合同，不展开异步格式化、复杂校验、Transition
或光标保持策略。

### 5. 非受控模式由组件或 DOM 保存当前值

`<input />` 默认非受控。传入 `defaultValue="草稿"` 只指定初始文本，后续用户编辑的当前值由输入自身
保存，JSX 不再指定它现在必须是什么。自定义非受控组件可以用局部 State 实现同样合同：从
`defaultValue` 初始化一次，此后内部事件更新局部 State。

### 6. defaultValue 不是持续同步入口

`defaultValue` 中的 `default` 表示初始值。调用方后续改变这个 Prop，不应把它误当成新的当前值覆盖
用户编辑；需要持续指定当前值时，应从一开始选择受控 `value` 合同。`defaultValue` 也不是清空、重置
或同步外部数据的通用 API，这些行为若需要应另建明确合同。

### 7. 同一份值不能同时受控和非受控

对原生输入，同时传 `value` 与 `defaultValue` 会让“当前值由谁决定”产生矛盾。对自定义组件也应把
两组 Props 设计为互斥：受控分支要求 `value` 与更新回调，非受控分支只允许 `defaultValue` 和可选通知
回调。不能在内部 State 与 Prop 之间按事件临时挑选“较新的那个”。

### 8. 同一实例不能在生命周期内切换模式

React 官方明确规定输入不能在受控与非受控之间切换。最常见的错误是首次 render 传
`value={undefined}`，数据到达后再传字符串；这会从无受控值切换为受控值并触发 warning。反向从字符串
变成 `undefined` 同样会失去原所有者。

对任意自定义组件，React 不一定自动发出同样的 DOM warning，但所有权风险仍然存在：切换为非受控时
可能突然露出旧内部 State，切换为受控时又可能覆盖用户已编辑的内部值。组件 API 应要求调用方在一次
挂载期间保持模式稳定。

### 9. undefined、null 与空字符串不是同一模式

受控文本输入必须一直收到字符串：

| 传值 | 合同含义 | 处理方式 |
| --- | --- | --- |
| `value=""` | 受控，当前值是空字符串 | 正确的受控空值，继续提供同步 `onChange`。 |
| `value={undefined}` | 没有有效受控文本值 | 不可先这样 render 再改成字符串；若要受控，先归一化。 |
| `value={null}` | 不是合法的受控文本值 | 不传 `null`；根据产品语义转换为字符串或单独建模。 |
| 不传 `value` | 非受控候选 | 可不提供初始值，或使用 `defaultValue`。 |

若父级 State 或 API 数据类型是 `string | null | undefined`，而产品把缺失值显示为空输入，可以使用
`value={maybeValue ?? ''}` 保持每次 render 都传字符串。若 `null` 与空字符串业务含义不同，应在输入
之外单独建模，而不是靠受控模式切换表达差异。

### 10. 选择模式是配置成本与协调能力的权衡

官方指出，非受控组件在父组件中需要的配置更少，但需要跨组件协调时不够灵活；受控组件最灵活，代价
是调用方必须完整提供 Props 和更新逻辑。选择标准是当前谁需要读取、改变和协调这份值，不是“受控永远
更高级”或“非受控永远性能更好”。

## 二、课程推导

### 1. 所有权选择流程

正文按以下顺序做决定：

1. 明确要讨论的那一份信息，例如“标题文本”，不要笼统问整个组件是否受控。
2. 列出谁需要读取当前值、谁需要从组件外改变它、是否需要和兄弟组件协调。
3. 若调用方需要持续指定当前值，选择受控：调用方保存 State，传 `value` 与必需回调。
4. 若值只在组件内部使用，调用方最多提供初始值，选择非受控：组件保存 State，接收 `defaultValue`。
5. 选定后让 Props 互斥，并在同一实例生命周期内保持模式不变。
6. 对文本受控值始终传字符串；空值使用 `''`，不让 `undefined`/`null`承担模式开关。
7. 检查组件是否为同一值保留 Prop 与局部 State 两份来源；若有，删除其中一份。

### 2. 模式合同矩阵

| 问题 | 受控合同 | 非受控合同 |
| --- | --- | --- |
| 谁拥有当前值 | 调用方 | 组件自身或原生 DOM |
| 当前值入口 | `value` | 内部 State / DOM 当前值 |
| 初始值入口 | 调用方 State 的初始值 | `defaultValue` |
| 用户编辑 | 调用回调，调用方同步更新 | 组件内部更新，可选通知调用方 |
| 外部按钮能否直接改当前值 | 可以，更新调用方 State | 默认不能，只改 `defaultValue` 不覆盖当前值 |
| 配置成本 | 较高，需要值与更新入口 | 较低，可只给初始值 |
| 协调能力 | 高，调用方可统一约束多个组件 | 低，当前值留在组件内部 |
| 生命周期 | 一直受控 | 一直非受控 |

### 3. 准确用语合同

课程统一使用以下表述：

- “调用方拥有受控值，并通过 `value` 提供当前值”。
- “组件调用回调报告用户编辑，调用方同步更新 backing State”。
- “非受控组件从 `defaultValue` 取得初始值，此后拥有当前值”。
- “空字符串是受控的空值，不等于没有传 `value`”。
- “模式按一份信息判断；组件仍可混合其他 Props 与局部 State”。

不要写“`onChange` 让组件自动双向绑定”“`defaultValue` 会跟随 Prop 更新”“空字符串会放开控制”或
“受控组件绝不能有任何 State”。

## 三、基础用法

### 1. 受控：调用方拥有当前值

```tsx
import { useState } from 'react'

interface ControlledTitleFieldProps {
  value: string
  onValueChange: (nextValue: string) => void
}

/** 渲染当前标题由调用方提供的受控输入。 */
function ControlledTitleField({ value, onValueChange }: ControlledTitleFieldProps) {
  return (
    <input
      value={value}
      onChange={(event) => onValueChange(event.currentTarget.value)}
    />
  )
}

/** 保存受控标题，并允许输入框和外部按钮共同更新它。 */
export default function ControlledTitleExample() {
  const [title, setTitle] = useState('课程草稿')

  return (
    <section>
      <ControlledTitleField value={title} onValueChange={setTitle} />
      <button type="button" onClick={() => setTitle('已发布课程')}>
        使用发布标题
      </button>
      <button type="button" onClick={() => setTitle('')}>
        清空
      </button>
      <p>当前标题：{title || '空标题'}</p>
    </section>
  )
}
```

调用方的 `title` 是唯一当前值。输入事件与外部按钮都更新同一 State，`ControlledTitleField` 不保存
标题副本。清空时传入 `''`，输入仍然是受控模式。

### 2. 非受控：组件拥有当前值

```tsx
import { useState } from 'react'

interface UncontrolledTitleFieldProps {
  defaultValue?: string
}

/** 从默认标题初始化一次，并在组件内部保存后续编辑。 */
function UncontrolledTitleField({
  defaultValue = '',
}: UncontrolledTitleFieldProps) {
  const [title, setTitle] = useState(defaultValue)

  return (
    <section>
      <input
        value={title}
        onChange={(event) => setTitle(event.currentTarget.value)}
      />
      <p>组件内部标题：{title || '空标题'}</p>
    </section>
  )
}

/** 使用默认值创建由子组件自行管理标题的示例。 */
export default function UncontrolledTitleExample() {
  return <UncontrolledTitleField defaultValue="本地草稿" />
}
```

这个自定义组件对调用方是非受控的：调用方没有传当前 `value`，标题 State 位于组件内部。
`defaultValue` 只参与初次初始化；组件内部为实现可观察预览而使用受控原生 `<input>`，不改变自定义
组件对调用方的非受控所有权。课程必须明确区分“自定义组件的外部合同”与“内部 DOM 的实现方式”。

## 四、易错点

未来正文中的每个易错点必须使用 `:::pitfalls`，并包含触发条件、原因、后果、错误示例、正确写法和
验证方式。本课保留以下 10 个高价值问题。

### 1. 传 value 却不提供同步 onChange

- **触发条件：** 可编辑文本输入写成 `<input value={title} />`。
- **原因：** `value` 强制当前显示匹配 Prop，但没有更新 backing State 的入口。
- **后果：** 输入呈只读行为并出现 console warning；击键后仍显示旧值。
- **错误示例：** `<input value={title} />`。
- **正确示例：** `<input value={title} onChange={(event) => setTitle(event.currentTarget.value)} />`；若明确
  只读则加 `readOnly`。
- **验证方式：** 输入字符后 State 与 DOM 立即一致；console 无缺少 `onChange` warning。
- **来源：** `react-input`。

### 2. 把 defaultValue 当成持续控制

- **触发条件：** 用户编辑后，调用方改变 `defaultValue` 并期待覆盖当前值。
- **原因：** 忽略 `defaultValue` 只描述初始值，不描述现在必须显示什么。
- **后果：** 外部 Prop 与组件当前值不同，调用方误判更新失效。
- **错误示例：** 用不断变化的 `defaultValue={serverTitle}` 同步当前输入。
- **正确示例：** 只需初始值时使用 `defaultValue`；需要持续同步时从首次 render 就使用受控 `value`。
- **验证方式：** 编辑非受控值后改变默认 Prop，当前编辑不被覆盖；受控对照则跟随 `value`。
- **来源：** `react-input`。

### 3. 同时传 value 与 defaultValue

- **触发条件：** `<input value={title} defaultValue="草稿" onChange={...} />`。
- **原因：** 同一份当前值同时声明由调用方控制、又由输入自身从默认值拥有。
- **后果：** 所有权矛盾并触发 warning，自定义组件也难以定义哪一个优先。
- **错误示例：** 同一实例同时提供两组 Prop。
- **正确示例：** 受控只传 `value` + `onChange`；非受控只传 `defaultValue`。
- **验证方式：** TypeScript 联合类型拒绝双传；运行时 console 无受控/非受控冲突 warning。
- **来源：** `react-input`。

### 4. 从 undefined 切换为字符串

- **触发条件：** 首次 `value={data?.title}` 得到 `undefined`，请求结果到达后变为字符串。
- **原因：** 首次没有有效受控字符串，后续却开始提供受控值。
- **后果：** 同一输入从非受控切换为受控并出现 warning，当前值所有者发生变化。
- **错误示例：** `<input value={maybeTitle} onChange={...} />`，其中类型为
  `string | undefined`。
- **正确示例：** `<input value={maybeTitle ?? ''} onChange={...} />`，从首次 render 起保持字符串。
- **验证方式：** 初始缺失、随后加载字符串的完整流程中模式不变，console 无切换 warning。
- **来源：** `react-input`。

### 5. 把 null 传给受控文本值

- **触发条件：** API 的 nullable 字段直接作为 `<input value={title}>`。
- **原因：** 把业务“未知”值直接混进 React 受控文本的字符串合同。
- **后果：** 出现 warning，模式和空值语义不清晰。
- **错误示例：** `value={nullableTitle}`，其值可能为 `null`。
- **正确示例：** 若产品允许把缺失显示为空，使用 `value={nullableTitle ?? ''}`；若语义不同则单独建模。
- **验证方式：** `null` 数据路径中输入仍收到字符串，业务状态没有靠模式切换表达。
- **来源：** `react-input`。

### 6. 误以为空字符串是非受控

- **触发条件：** 为“清空并放开输入”传 `value=""`。
- **原因：** 把空字符串与缺少 `value` 混为一谈。
- **后果：** 输入仍被受控为当前空值；若没有同步 `onChange`，用户无法保留新输入。
- **错误示例：** 条件不满足时传 `''`，同时期望组件接管当前值。
- **正确示例：** 一次挂载内保持既定模式；受控清空用 `''` 并继续同步更新。
- **验证方式：** 清空后继续输入，调用方 State 每次同步变化，模式未切换。
- **来源：** `react-input`。

### 7. 受控 onChange 异步写回或写回不同值

- **触发条件：** 延迟 setter，或每次击键立即把输入强制改为另一字符串。
- **原因：** 没有同步写回 DOM 事件提供的当前值。
- **后果：** 输入回退、光标跳动或用户编辑丢失。
- **错误示例：** 在 `setTimeout` 中调用 setter，或同步写回 `toUpperCase()` 后的另一值。
- **正确示例：** 先同步写回 `event.currentTarget.value`；复杂格式化属于另一个设计问题。
- **验证方式：** 连续键入和在字符串中间编辑时，字符与光标行为稳定。
- **来源：** `react-input`。

### 8. 把受控 Prop 镜像成局部 State

- **触发条件：** 自定义组件同时接收 `value`，又执行 `useState(value)` 并渲染内部副本。
- **原因：** 没有选定唯一所有者，试图同时保留受控和非受控路径。
- **后果：** 调用方改变 `value` 后子组件可能仍显示旧内部值。
- **错误示例：** `const [internalValue, setInternalValue] = useState(value)` 用于镜像当前 Prop。
- **正确示例：** 受控分支直接渲染 `value`；非受控分支才从 `defaultValue` 初始化内部 State。
- **验证方式：** 外部按钮更新受控值后输入立即变化；源码不存在受控值的同步 Effect 或第二份 State。
- **来源：** `react-sharing-state`、`react-input`。

### 9. 用真值判断模式

- **触发条件：** 自定义组件写 `const isControlled = Boolean(value)`。
- **原因：** 空字符串是 falsy，但它是合法受控值。
- **后果：** 受控空值被误判为非受控，内部旧 State 重新出现。
- **错误示例：** `const currentValue = value || internalValue`。
- **正确示例：** 用 `mode: 'controlled' | 'uncontrolled'` 判别联合声明所有权，并只按 `mode` 选择当前值。
- **验证方式：** 传入 `value=""` 时仍走受控分支，输入显示空且不会回退到默认值。
- **来源：** `react-input`；模式判断实现为课程推导。

### 10. 只看到 onValueChange 就判定为受控

- **触发条件：** 非受控组件提供可选变化通知，调用方误以为自己拥有当前值。
- **原因：** 把事件观察入口误当成当前值来源。
- **后果：** 调用方收到事件却无法持续指定显示值，组件合同被误用。
- **错误示例：** 只传 `onValueChange`，却期待外部按钮改变组件当前文本。
- **正确示例：** 受控必须同时提供 `value` 和必需回调；非受控回调只能是可选通知。
- **验证方式：** 从 Props 类型即可区分两种分支；文档明确当前值所有者。
- **来源：** `react-sharing-state`；Props 组合为课程推导。

### 易错点适用版本与来源

| 错误名称 | 适用版本 | 来源 |
| --- | --- | --- |
| 传 value 却不提供同步 onChange | React 19.2 | React `<input>` Reference |
| 把 defaultValue 当成持续控制 | React 19.2 | React `<input>` Reference |
| 同时传 value 与 defaultValue | React 19.2 | React `<input>` Reference |
| 从 undefined 切换为字符串 | React 19.2 | React `<input>` Reference |
| 把 null 传给受控文本值 | React 19.2 | React `<input>` Reference |
| 误以为空字符串是非受控 | React 19.2 | React `<input>` Reference |
| 受控 onChange 异步写回或写回不同值 | React 19.2 | React `<input>` Reference |
| 把受控 Prop 镜像成局部 State | React 19.2 | Choosing the State Structure |
| 用真值判断模式 | React 19.2 | React `<input>` Reference |
| 只看到 onValueChange 就判定为受控 | React 19.2 | Sharing State Between Components |

## 五、高级用法

### 1. 用互斥联合类型表达双模式 API

自定义组件若确实需要同时支持两种使用方式，可以用 `mode` 判别联合明确两组互斥 Props：

```tsx
import { useState, type ChangeEvent } from 'react'

interface ControlledTitleProps {
  mode: 'controlled'
  label: string
  value: string
  onValueChange: (nextValue: string) => void
}

interface UncontrolledTitleProps {
  mode: 'uncontrolled'
  label: string
  onValueChange?: (nextValue: string) => void
  defaultValue?: string
}

type TitleFieldProps = ControlledTitleProps | UncontrolledTitleProps

/** 按稳定的 Props 合同渲染受控或非受控标题输入。 */
function TitleField(props: TitleFieldProps) {
  const [internalValue, setInternalValue] = useState(
    props.mode === 'uncontrolled' ? (props.defaultValue ?? '') : '',
  )
  const currentValue = props.mode === 'controlled' ? props.value : internalValue

  /** 报告用户编辑，并只在非受控模式更新组件内部值。 */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.currentTarget.value
    if (props.mode === 'uncontrolled') {
      setInternalValue(nextValue)
      props.onValueChange?.(nextValue)
      return
    }
    props.onValueChange(nextValue)
  }

  return (
    <label>
      <span>{props.label}</span>
      <input value={currentValue} onChange={handleChange} />
    </label>
  )
}
```

受控分支只声明 `value` 与必需的 `onValueChange`；非受控分支只声明 `defaultValue` 与可选通知。
JSX excess-property 检查会拒绝把 `defaultValue` 混入受控分支，也会拒绝非受控分支传入
`value={undefined}`。运行时只按 `mode` 判型，空字符串不会被误判，显式但无值的 property 也不会改变
所有权。`useState` 每次 render 都按固定顺序调用，但只有非受控分支使用它作为当前值。调用方仍必须
遵守“同一实例生命周期内不切换分支”的运行时合同。

这是一种最小 TypeScript 设计，不要求为单一使用方式过早增加双模式抽象。若组件只需受控或只需
非受控，直接暴露一种合同更简单。

### 2. 把未知值在调用方边界归一化

调用方若收到 `string | null | undefined`，应先决定业务含义，再给受控组件一个稳定字符串：

```tsx
interface ProfileTitleProps {
  title: string | null | undefined
  onTitleChange: (nextTitle: string) => void
}

/** 把缺失标题归一化为空字符串，并保持输入始终受控。 */
function ProfileTitle({ title, onTitleChange }: ProfileTitleProps) {
  return (
    <input
      value={title ?? ''}
      onChange={(event) => onTitleChange(event.currentTarget.value)}
    />
  )
}
```

若 `null` 表示“尚未加载”而 `''` 表示“用户主动清空”，不能无条件合并语义；应在输入外用另一份状态
区分加载阶段。本课只冻结值类型边界，不展开远程数据或请求状态。

### 3. 每份信息可以选择不同所有者

一个弹出编辑器可以让文本 `value` 受调用方控制，同时把鼠标 hover、内部提示是否展开保留在组件局部。
这不违反受控合同，因为讨论的是不同信息。API 设计应按每份信息命名和记录所有者，避免把“组件受控”
误解为“组件内不能存在任何 `useState`”。

### 4. 只读也是明确的受控合同

如果调用方故意固定 `value` 且不允许用户编辑，原生输入可以提供 `readOnly`，明确表示没有更新入口。
这与漏写 `onChange` 不同：前者是有意 API，后者通常是可编辑受控组件的缺陷。自定义组件也应通过
`readOnly`、禁用编辑入口或独立展示组件表达只读，不让行为依赖偶然缺少回调。

## 六、适用边界

适合受控模式的场景：

- 调用方需要实时显示、协调或校正当前值。
- 外部按钮、兄弟组件或父级规则需要改变同一当前值。
- 多个组件必须共享同一事实，且上一课已经把 State 提升给共同所有者。
- 组件库需要让调用方完整指定一份重要信息的行为。

适合非受控模式的场景：

- 当前值只在组件内部使用，调用方不需要逐次协调。
- 调用方最多提供初始内容，希望用更少 Props 完成独立交互。
- 组件内部拥有该值是明确合同，而不是为了绕过受控 warning 临时退回。

不属于本课的内容：

- checkbox、radio、select、textarea、file 的完整控件矩阵：已有基础课“受控表单”。
- submit、FormData、表单 Action、表单库与复杂校验。
- 异步格式化、光标算法、Transition 或性能优化。
- Context、Reducer、Zustand、远程数据、请求缓存和外部 Store。
- Effect 同步 Props、Ref 读取 DOM 值或命令式控制。
- State 的位置身份、重新挂载和 `key` 重置：第 5、6 课，当前记录不研究。

## 七、Demo 设计

建议新增同源 Demo：
`react.core.learn.intermediate.controlled-and-uncontrolled-components.ownership-editor-demo`，使用“标题所有权
编辑器”场景对照两种稳定合同：

- 共享一个 `TitleField` 双模式组件，Props 使用 `mode` 判别联合类型。
- 受控实例由父组件保存 `controlledTitle`，传 `value` 与 `onValueChange`；外部“载入示例标题”和
  “清空”按钮证明调用方可以持续指定当前值。
- 受控清空始终传 `''`，不传 `undefined` 或 `null`，production Demo 不故意制造 warning。
- 非受控实例只传 `defaultValue="本地草稿"`，当前编辑保存在组件内部；父组件不保存它的镜像。
- 可以改变父级保存的“下一次默认标题”并继续传 `defaultValue`，观察已编辑的非受控当前值不被覆盖；
  不通过切换同一实例模式或改变 `key` 演示重置。
- 两个实例并列展示当前所有者：受控摘要由父组件渲染，非受控摘要由组件内部渲染；不加入表单提交、
  校验、请求、Context、Reducer、Zustand、Effect、Ref 或外部 Store。

可观察行为：编辑受控实例时父级摘要同步；外部按钮可以替换和清空受控值；编辑非受控实例时只更新
组件内部摘要；更新 `defaultValue` Prop 不覆盖已经编辑的非受控当前值；两种实例从首次 render 到结束
都不切换模式，console 为 `0 error / 0 warning`。

展示源码与运行组件必须来自同一 `.tsx` 文件；新增函数上方写职责明确的简体中文注释。样式只使用
Flexbox、margin 和正常文档流，不使用 CSS Grid 或 `gap`；桌面、390px 与 390px + 200% 文本不能出现
横向溢出、控件裁切或标签覆盖。

## 八、验证方式

### 1. 研究记录验证

- 所有关键事实均映射到官方来源卡中的直接 URL。
- 搜索摘要只用于发现候选；采用事实已在 React 官方 `Raw Content` 或已知 URL 原页中逐项核验。
- 当前批次重新核验版本页、组件级受控/非受控定义、输入值合同、模式切换与空值 warning。
- 自定义双模式组件明确标记为课程推导，没有把命名和 TypeScript 联合写成 React 强制规范。
- 只新增本研究记录，不修改课程、Demo、manifest、track、计划或状态文件。

### 2. 未来课程与 Demo 验证

1. **受控输入：** 连续输入、外部载入和清空后，输入与父级摘要始终等于同一 State；清空使用 `''`。
2. **非受控输入：** 从 `defaultValue` 初始化后可独立编辑；更新 default Prop 不覆盖当前编辑。
3. **静态 Props 合同：** 临时 TypeScript fixture 验证受控分支缺回调、同时传 `value` / `defaultValue`、
   非受控分支传 `value={undefined}` 和受控 `null` 值均不能通过；fixture 放在 `/tmp` 并删除。
4. **切换 warning：** 独立 `/tmp` 开发期 fixture 先 render `value={undefined}`、再 render 字符串，捕获
   React uncontrolled -> controlled warning；该故障 fixture 不进入 production Demo 或仓库。
5. **合法空值：** production Demo 从首次 render 起传 `value=""`，随后输入和再次清空均无模式 warning。
6. **源码边界：** 运行时只按 `mode` 判型；受控分支不镜像 Prop，非受控分支只从 `defaultValue`
   初始化；不存在同步 Effect、Ref、Context、Reducer、Zustand、请求或外部 Store。
7. **工程 Gate：** 当前快照通过 type-check、lint、format、build、空测试脚本与 scoped diff check；临时
   资产全部位于 `/tmp` 并在结束前删除。
8. **浏览器证据：** Playwright 在 1440px、390px 和 390px + 200% 根字号复跑两种模式；检查
   `scrollWidth <= clientWidth`、元素不重叠、production console 为 `0 error / 0 warning`。
9. **同源证据：** 展示代码与实际运行 TSX 去除约定末尾空白后的 SHA-256 一致。

## 九、拆课判断

- “调用方拥有当前值”与“组件自身拥有当前值”是同一状态所有权模型的两端，选择条件、Props 合同和
  生命周期风险互为对照，合并在一课才能完整回答标题问题。
- `value`、`onChange`、`defaultValue` 不是三个互不相关的 API；它们共同表达同一份值的当前来源、更新
  入口与初始值，因此无需拆成多课。
- 原生表单控件矩阵已由基础课覆盖；本课只使用文本输入证明所有权，不重复扩展控件类型。
- State 的位置身份和 `key` 重置拥有独立心智模型与验证方式，已冻结为第 5、6 课，本课明确停止在
  生命周期内保持模式稳定，不研究如何重建实例。
- 当前范围没有第二条独立主线，**无需继续拆课**。

## 十、官方来源

1. [React Versions](https://react.dev/versions)：最新官方文档版本与版本维护策略。
2. [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)：组件级
   受控/非受控术语、Props 与局部 State 所有权、配置与协调权衡，以及混合所有权边界。
3. [`<input>`](https://react.dev/reference/react-dom/components/input)：`value`、`onChange`、
   `defaultValue`、只读合同、同步更新、模式互斥、生命周期切换 warning，以及 `undefined`、`null`、
   空字符串边界。

## 十一、实施闭环证据

- 课程正文：`src/categories/frontend/react/core/learn/controlled-and-uncontrolled-components.md`。
- 同源 Demo：`react.core.learn.intermediate.controlled-and-uncontrolled-components.ownership-editor-demo`，
  运行组件与 raw 源码均指向 `demos/controlled-and-uncontrolled-components/ownership-editor-demo.tsx`。
- Props 合同采用 `mode` 判别联合；临时 TypeScript fixture 在未启用
  `exactOptionalPropertyTypes` 的当前项目配置下，确认受控缺少回调、混用 `value/defaultValue`、
  受控 `null` 和非受控显式 `value={undefined}` 均被拒绝。React 故障 fixture 捕获到官方
  uncontrolled -> controlled warning；两类 fixture 均位于 `/tmp` 并已删除。
- Markdown adapter 临时解析验证为 `1/1`，得到 `10` 个完整 pitfalls 和 `1` 个 exercise；
  目标 Prettier、Oxlint、`npm run type-check` 与 scoped `git diff --check` 通过。
- Playwright 隔离 production 宿主验证受控编辑、外部载入、`''` 清空、非受控编辑、内部摘要和
  `defaultValue` 更新边界；1440px、390px、390px + 200% 根字号均满足
  `scrollWidth <= clientWidth`，冷会话 console 为 `0 error / 0 warning`。
- 展示 raw loader 与本地运行 TSX 一致：`3752` 个 JavaScript 字符、`4364` 个 UTF-8 字节，
  SHA-256 均为 `39560132c803d51f5e7905003d89d503a02e3ff1cfa6c7cd60c868d4ab069dab`。
- 完成后独立复审结论：`Standards: PASS / 0 finding`；`Spec: PASS / 0 finding`。第 4 课已登记为
  `available`，第 5-12 课已按本批闭环登记，第 13-29 课保持 `planned`。
