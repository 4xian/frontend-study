# IL1「实战：多步骤编辑器」官方研究记录

## 研究状态、版本与冻结边界

- 课程 ID：`react.core.learn.intermediate.lab-multi-step-editor`。
- 左侧短标题与正文标题：`实战：多步骤编辑器`。
- 课程类型：React Core 中级实战课，本科前端课程范围。
- 研究日期：`2026-08-16`。
- React 官方文档基线：React `19.2`。
- React 固定文档提交：`c7d6b700038c63d1aaf2c649af1aefe01ebbacac`。
- 本轮写入边界：只新增本研究文件；不修改课程正文、Demo、CSS、entry/demo manifest、Track、
  进度迁移、总计划、依赖、测试或任何后续课程资产。

本实战只组合已经完成的 State 结构与派生数据、State 提升与受控边界、State 保留与重置，以及更早
基础课程已经学过的 TSX、Props、条件渲染、列表、事件、`useState`、不可变对象更新和基础表单控件。
它不新增 React API，也不把任何前置知识重新扩写成第二门专题。

实战产品固定为一个纯客户端“文章多步骤编辑器”：用户先填写基本信息，再填写发布信息，最后复核并
完成；步骤之间来回切换时保留受控草稿；切换模板或明确重新加载当前模板时，通过稳定、可解释的 `key`
重建编辑器子树。所有数据只存在当前页面内存中。

明确禁止：`useReducer`、Context、Effect、Ref、Router、外部 Store、表单库、请求、异步提交、
持久化、缓存、撤销历史、自动保存和第三方依赖。本研究不得读取、调研或预写 I04 及后续课程。

## 一、研究方式与证据边界

1. 先核对权威路线中 IL1 的唯一范围，再读取 I01、I02、I03 的当前调研与课程资产，确认本实战只组合
   已经开放的 State 建模、提升、受控边界、位置身份和 `key` 重置能力。
2. 对照三门既有基础实战的研究结构，沿用“功能合同、State 模型、组件边界、固定验收、排除项”的
   可执行记录方式；不把旧实战的产品功能复制进当前实战。
3. 当前所需官方 URL 已知，直接通过 `curl -L --fail --silent --show-error` 回读 React 官方仓库原文；
   关键页面同时核对 `react.dev` 的公开锚点和固定文档提交。没有进行关键词发现，因此未启动外部搜索
   服务，也没有采用搜索摘要、社区文章或二手教程。
4. React 公共行为以 React `19.2` 官方文档为准。官方版本页明确说明同一 major 内持续更新文档，
   不为每个 minor 或 patch 发布独立文档；本记录不把 Learn 页面描述为某个 patch 的专属合同。
5. 本研究只使用官方公开语义：State 结构、owner、受控 Props、render tree 位置和 `key`。Fiber 字段、
   协调器函数、卸载顺序和 DOM diff 内部步骤都不构成课程合同。
6. 研究记录可以记载课程 ID、生产边界和验收要求；未来学习者正文必须只描述编辑器需求、State 设计、
   实现、可观察结果和适用边界，不得出现路线编号、计划、批次、完成计数或生产验证叙事。

## 二、一手来源卡

| ID | 官方来源 | URL 与锚点 | 本研究采用范围 |
| --- | --- | --- | --- |
| `R00` | React Versions | [latest version](https://react.dev/versions#latest-version) | 当前 React 官方文档基线为 `19.2`；同一 major 内持续更新，不为每个 minor/patch 单独发布文档。 |
| `R01` | Choosing the State Structure | [group related state](https://react.dev/learn/choosing-the-state-structure#group-related-state)、[avoid contradictions](https://react.dev/learn/choosing-the-state-structure#avoid-contradictions-in-state)、[avoid redundant state](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state)、[don't mirror props](https://react.dev/learn/choosing-the-state-structure#dont-mirror-props-in-state) | 草稿对象、互斥流程状态、render 派生校验与进度，以及初始 Prop 不是持续同步源。 |
| `R02` | Sharing State Between Components | [lifting state up](https://react.dev/learn/sharing-state-between-components#lifting-state-up-by-example)、[controlled and uncontrolled](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)、[single source of truth](https://react.dev/learn/sharing-state-between-components#a-single-source-of-truth-for-each-state) | 最近共同 owner、值与 handler Props、受控字段和每项 State 的单一事实来源。 |
| `R03` | Preserving and Resetting State | [state is tied to a position](https://react.dev/learn/preserving-and-resetting-state#state-is-tied-to-a-position-in-the-tree)、[same component at the same position](https://react.dev/learn/preserving-and-resetting-state#same-component-at-the-same-position-preserves-state)、[reset with a key](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key)、[resetting a form](https://react.dev/learn/preserving-and-resetting-state#resetting-a-form-with-a-key) | 步骤面板移除与重建、父级受控草稿保留、编辑器身份和 key 重置边界。 |
| `R04` | `useState` Reference | [parameters](https://react.dev/reference/react/useState#parameters)、[resetting state with a key](https://react.dev/reference/react/useState#resetting-state-with-a-key) | 初始值只在初始化时采用；改变 key 会从头重建组件及全部 children。 |
| `R05` | State as a Snapshot | [rendering takes a snapshot](https://react.dev/learn/state-as-a-snapshot#rendering-takes-a-snapshot-in-time) | 当前 handler 读取当前 render 快照；setter 请求下一次 render，不原地改写当前变量。 |
| `R06` | Updating Objects in State | [copying objects with spread](https://react.dev/learn/updating-objects-in-state#copying-objects-with-the-spread-syntax) | 草稿对象按只读值处理，字段变化时创建包含其余字段的下一对象。 |
| `R07` | Reacting to Input with State | [thinking declaratively](https://react.dev/learn/reacting-to-input-with-state#thinking-about-ui-declaratively)、[represent state in memory](https://react.dev/learn/reacting-to-input-with-state#step-3-represent-the-state-in-memory-with-usestate)、[remove non-essential state](https://react.dev/learn/reacting-to-input-with-state#step-4-remove-any-non-essential-state-variables) | 先枚举编辑、复核完成等可见状态，再保存最少事实并删除可派生状态。 |
| `R08` | React DOM `<input>` | [controlling an input](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable) | 受控文本输入使用字符串 `value` 与同步更新后备值的 `onChange`。 |
| `R09` | React DOM `<select>` | [controlling a select](https://react.dev/reference/react-dom/components/select#controlling-a-select-box-with-a-state-variable) | 受控单选下拉使用字符串 `value` 与同步 `onChange`。 |
| `R10` | React DOM `<textarea>` | [controlling a textarea](https://react.dev/reference/react-dom/components/textarea#controlling-a-text-area-with-a-state-variable) | 受控多行文本使用字符串 `value` 与同步 `onChange`。 |
| `R11` | Rendering Lists | [rules of keys](https://react.dev/learn/rendering-lists#rules-of-keys) | 固定步骤数据的 key 在 siblings 中唯一且跨 render 稳定，不能在 render 时生成。 |
| `R12` | TypeScript Narrowing | [discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) | 用共同字面量字段表达“正在编辑某一步”与“已完成”两个互斥流程形状。 |

React 固定文档证据位于官方 `reactjs/react.dev` 仓库同一提交：

- [Choosing the State Structure](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/choosing-the-state-structure.md)
- [Sharing State Between Components](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/sharing-state-between-components.md)
- [Preserving and Resetting State](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/preserving-and-resetting-state.md)
- [`useState`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useState.md)
- [`<input>`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/input.md)
- [`<select>`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/select.md)
- [`<textarea>`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/textarea.md)

## 三、逐 Claim 事实账本

| Claim | 可用于本实战的准确表述 | 一手来源 | 当前边界 |
| --- | --- | --- | --- |
| `C01` | 总是作为一份草稿提交、加载和重置的相关字段可以合并为一个对象 State。 | `R01` group related state | 不是要求把模板选择、编辑器草稿和所有 UI 状态塞进一个大对象。 |
| `C02` | 多个可互相矛盾的布尔值应收敛为互斥状态；判别联合可让每个分支只携带合法数据。 | `R01` avoid contradictions、`R12` | 不引入 reducer、Action 或状态机库。 |
| `C03` | 能从当前 State 在 render 中计算的步骤索引、完成度、校验结果、按钮能力和复核摘要不应成为 State。 | `R01` avoid redundant state、`R07` | 不引入 Effect 或缓存维护这些同步值。 |
| `C04` | `useState(initialDraft)` 只在组件初始化时采用 `initialDraft`；同一组件身份下后续 Prop 变化不会自动重置已有草稿。 | `R01` don't mirror props、`R04` | 需要新模板时必须明确改变身份，不能假设初始 Prop 会持续覆盖。 |
| `C05` | 需要被多个步骤读取和修改的草稿应提升到这些步骤的最近共同父组件，并保持单一事实来源。 | `R02` | 不推出全应用 State 都应集中在顶层。 |
| `C06` | 字段组件由字符串 `value` 和 `onValueChange` 控制；字段组件不保存第二份同名文本 State。 | `R02`、`R08`、`R09`、`R10` | 不把受控组件称为双向绑定，也不引入表单库。 |
| `C07` | 草稿对象应按只读值处理；修改单个字段时用对象展开保留其余字段并创建下一对象。 | `R06` | 对象展开是浅复制；当前草稿只有一层标量字段，不需要深克隆。 |
| `C08` | 当前事件读取的是当前 render 的 State 快照；导航或字段 setter 请求下一次 render。 | `R05` | 不在 setter 后立即读取变量并声称它已经变化。 |
| `C09` | 同一位置继续呈现同一组件类型时，React 默认保留该位置的 State。 | `R03` | Prop 文本、步骤标签或 CSS 变化本身不构成新身份。 |
| `C10` | 条件渲染移除步骤面板会销毁该面板自己的局部 State；把字段提升到仍保留的编辑器父组件后，步骤面板重建仍能收到完整草稿。 | `R02`、`R03` | React 没有缓存已移除面板；保留来自父级 owner 仍在树中。 |
| `C11` | 改变组件 key 会从头重建该组件及全部 children，适合表达“重新加载整份编辑器草稿”。 | `R03`、`R04` | key 不是只清空一个字段的命令，也不是历史草稿缓存。 |
| `C12` | key 只在同一父级身份范围内生效；固定步骤列表的 key 和编辑器重置 key 承担不同职责。 | `R03`、`R11` | 步骤 ID 不自动作为普通 Prop，编辑器 key 也不是模板业务数据的替代品。 |
| `C13` | key 必须在 render 之间稳定；模板 ID 与只在明确重载事件中递增的版本可以组成确定性身份。 | `R04`、`R11` | 禁止 `Math.random()`、时间戳或每次 render 都变化的值。 |
| `C14` | React 的声明式步骤是先列出可见状态和触发事件，再选择最少 State 表达这些状态。 | `R07` | 当前实战只有本地人类输入，不引入网络响应、超时或异步状态。 |
| `C15` | 受控文本、select 和 textarea 必须在 `onChange` 中同步写回相应字符串值，并从确定的字符串初值开始。 | `R08`、`R09`、`R10` | 不允许先传 `undefined`，之后再切换成字符串受控值。 |

## 四、实战功能合同

### 1. 唯一产品目标

学习者完成一个单页“文章多步骤编辑器”。应用提供“空白文章”和“研讨记录”两个固定模板，编辑器按
“基本信息 → 发布信息 → 复核”三个步骤收集标题、作者、目标读者和摘要。用户可以返回已完成步骤继续
修改，复核页始终显示当前草稿；完成后显示确认结果，并可返回复核页继续编辑。

模板按钮在编辑器外部。切换模板表示明确放弃当前未完成编辑并加载目标模板初值；“重新加载当前模板”
表示丢弃当前模板的全部编辑。两个动作都通过改变编辑器 `key` 重建整棵编辑子树，不保存模板之间的
历史草稿。

应用只使用固定内存数据。刷新页面回到默认模板和初始步骤；没有服务器、账号、路由、存储或异步流程。

### 2. 页面可见区域

1. 编辑器标题与当前模板名称。
2. 模板选择区：两个模板按钮，以及“重新加载当前模板”普通按钮。
3. 三步导航：基本信息、发布信息、复核。每一步同时显示当前、可访问或尚未解锁状态，不能只靠颜色。
4. 当前步骤面板：只显示该步骤真实需要的字段或复核内容。
5. 底部操作区：上一步、下一步；复核步骤使用“完成编辑”。
6. 完成视图：显示已确认标题、作者、目标读者和摘要，以及“继续修改”按钮。
7. 必要的字段要求和当前步骤说明；不显示课程编号、计划、构建、测试或操作教程文字。

### 3. 固定步骤数据

```ts
export type StepId = 'basics' | 'publishing' | 'review'

export type EditorStep = {
  readonly id: StepId
  readonly label: string
}

export const EDITOR_STEPS: readonly EditorStep[] = [
  { id: 'basics', label: '基本信息' },
  { id: 'publishing', label: '发布信息' },
  { id: 'review', label: '复核' },
]
```

- 顺序是固定产品数据，不进入 State。
- `StepId` 是流程业务身份；`currentStepIndex` 由 `currentStepId` 在固定数组中查找得到。
- 步骤导航列表直接项使用 `key={step.id}`，不能使用数组索引或 render 时生成值。
- 标签是显示文本，不承担身份；修改标签不应重置步骤或草稿。

### 4. 固定模板与草稿数据

```ts
export type Audience = '' | 'students' | 'teachers' | 'public'

export type ArticleDraft = {
  readonly title: string
  readonly author: string
  readonly audience: Audience
  readonly summary: string
}

export type ArticleTemplate = {
  readonly id: 'blank' | 'seminar'
  readonly label: string
  readonly initialDraft: ArticleDraft
}

export const ARTICLE_TEMPLATES: readonly ArticleTemplate[] = [
  {
    id: 'blank',
    label: '空白文章',
    initialDraft: {
      title: '',
      author: '',
      audience: '',
      summary: '',
    },
  },
  {
    id: 'seminar',
    label: '研讨记录',
    initialDraft: {
      title: 'React State 设计研讨',
      author: '前端学习小组',
      audience: 'students',
      summary: '记录如何用最小事实、受控边界和稳定身份组织交互状态。',
    },
  },
]
```

- 固定模板是模块常量，不进入 State，也不在编辑器中修改。
- 编辑器初始化时创建一份独立的草稿值；后续字段更新替换草稿对象，不修改模板对象。
- `audience` 的空字符串表示尚未选择；三个非空值映射为“本科生”“教师”“公众”。显示标签在 render
  中查找，不复制进草稿。
- 模板 ID 是稳定业务身份；模板 label 变化不应改变 key。

### 5. 字段与校验规则

| 步骤 | 字段 | 受控合同 | 完成条件 |
| --- | --- | --- | --- |
| 基本信息 | 标题 | 字符串 `value` + `onValueChange` | `title.trim()` 非空 |
| 基本信息 | 作者 | 字符串 `value` + `onValueChange` | `author.trim()` 非空 |
| 发布信息 | 目标读者 | `Audience` 字符串 `value` + `onValueChange` | 值不是空字符串 |
| 发布信息 | 摘要 | 字符串 `value` + `onValueChange` | `summary.trim()` 非空 |
| 复核 | 无新字段 | 只读取当前草稿 | 前两步都完成 |

规则保持最小：只拒绝空值和纯空白文本，不引入长度、正则、异步唯一性或服务器校验。`trim()` 只用于
计算是否完成和最终显示，不在每次按键时改写用户输入。

## 五、State、派生值与流程模型

### 1. 外层模板会话 State

编辑器外壳只拥有一份会话 State：

```ts
type EditorSession = {
  readonly templateId: ArticleTemplate['id']
  readonly revision: number
}

const [session, setSession] = useState<EditorSession>({
  templateId: 'blank',
  revision: 0,
})
```

- `templateId` 决定当前模板。
- `revision` 只在用户点击“重新加载当前模板”时递增。
- 切换模板时把 `templateId` 改为目标 ID，并把 `revision` 设为 `0`。
- `currentTemplate` 从固定模板数组按 `templateId` 查找，不另存 State。
- 编辑器身份固定为 `` `${session.templateId}:${session.revision}` ``。

`templateId` 和 `revision` 共同表达“当前加载的是哪个模板的哪次编辑会话”，适合合并为一份相关 State。
它们不与编辑器内部草稿合并，因为外壳必须在编辑器 key 重建时继续存在。

### 2. 编辑器内部真实 State

```ts
type EditorView =
  | { readonly status: 'editing'; readonly stepId: StepId }
  | { readonly status: 'completed' }

const [draft, setDraft] = useState<ArticleDraft>(() => ({ ...initialDraft }))
const [view, setView] = useState<EditorView>({
  status: 'editing',
  stepId: 'basics',
})
```

真实 State 只有两项：

1. `draft`：用户已经输入、切换步骤后仍需保留的四个事实。
2. `view`：当前处于某个编辑步骤，或已经完成。判别联合排除了“完成后仍声称位于基本信息步骤”一类
   矛盾组合。

不保存 `isReviewing`、`isCompleted`、三个步骤布尔值或当前索引。`view.status` 已经区分完成视图；编辑
分支中的 `stepId` 是唯一当前步骤事实。

### 3. 必须在 render 中派生

以下值全部由 `draft`、`view` 和固定数据同步计算：

- `basicsComplete`：标题和作者去除首尾空白后都非空。
- `publishingComplete`：目标读者非空且摘要去除首尾空白后非空。
- `allComplete`：前两项都为 true。
- `currentStepIndex`：编辑状态下按 `view.stepId` 查找固定步骤索引。
- `currentStepNumber` 与“第几步/共几步”进度文字。
- 每个步骤是否可访问、是否完成、是否为当前步骤。
- “上一步”“下一步”“完成编辑”的显示与 disabled 状态。
- 目标读者中文标签。
- 复核页和完成页的全部显示内容。

禁止为这些值增加 State、setter 或 Effect。它们必须在每次 render 中由同一份当前草稿重新得到。

### 4. 步骤访问规则

固定解锁规则如下：

| 目标步骤 | 可访问条件 |
| --- | --- |
| 基本信息 | 始终可访问 |
| 发布信息 | `basicsComplete === true` |
| 复核 | `basicsComplete && publishingComplete` |

- 当前步骤导航由父级 `MultiStepEditor` 控制。
- `StepNavigation` 接收 `currentStepId`、每步可访问状态和 `onStepChange`，自身不保存 active State。
- 点击未解锁步骤不产生状态更新；按钮使用真实 `disabled`。
- 用户返回基本信息并清空标题后，发布信息与复核立即重新锁定，因为能力由当前草稿派生。
- 如果用户此时正在基本信息步骤，界面保持一致；不需要 Effect 追赶或修正当前步骤。

### 5. 流程转换表

| 当前状态 | 事件 | 条件 | 下一状态 | 草稿变化 |
| --- | --- | --- | --- | --- |
| 编辑/任意步骤 | 修改字段 | 字段允许编辑 | `view` 不变 | 不可变替换对应字段 |
| 编辑/基本信息 | 下一步 | 基本信息完成 | 编辑/发布信息 | 保持 |
| 编辑/发布信息 | 上一步 | 始终 | 编辑/基本信息 | 保持 |
| 编辑/发布信息 | 下一步 | 发布信息完成 | 编辑/复核 | 保持 |
| 编辑/复核 | 上一步 | 始终 | 编辑/发布信息 | 保持 |
| 编辑/任意步骤 | 点击已解锁步骤 | 目标已解锁 | 编辑/目标步骤 | 保持 |
| 编辑/复核 | 完成编辑 | 全部字段完成 | 已完成 | 保持 |
| 已完成 | 继续修改 | 始终 | 编辑/复核 | 保持 |
| 任意编辑器状态 | 重新加载模板 | 用户明确点击 | 新实例的编辑/基本信息 | 恢复当前模板初值 |
| 任意编辑器状态 | 切换模板 | 用户明确选择 | 新实例的编辑/基本信息 | 使用目标模板初值 |

所有转换都发生在事件 handler 中。无网络输入、延时、异步状态、自动跳步或隐藏同步逻辑。

## 六、受控组件与所有权合同

### 1. 组件树

```text
LabMultiStepEditorDemo
├── TemplateToolbar
└── MultiStepEditor key={templateId:revision}
    ├── StepNavigation
    ├── BasicsStep
    │   ├── TextField（标题）
    │   └── TextField（作者）
    ├── PublishingStep
    │   ├── AudienceField
    │   └── SummaryField
    ├── ReviewStep
    ├── EditorActions
    └── CompletionView
```

`BasicsStep`、`PublishingStep`、`ReviewStep` 和 `CompletionView` 通过条件渲染互斥出现。组件函数全部在
模块顶层定义；不得在 `MultiStepEditor` 内嵌套声明组件类型。

### 2. 组件职责

| 组件 | 拥有的 State | 只读输入 | 可发起动作 | 明确禁止 |
| --- | --- | --- | --- | --- |
| `LabMultiStepEditorDemo` | `session` | 固定模板 | 切换模板、递增 revision | 保存草稿副本、读取字段、使用随机 key |
| `TemplateToolbar` | 无 | 当前模板 ID、模板列表 | `onTemplateChange`、`onReload` | 自己保存选择 State |
| `MultiStepEditor` | `draft`、`view` | `initialDraft`、模板 label | 更新字段、导航、完成、继续修改 | Effect 同步 Prop、Context、Reducer |
| `StepNavigation` | 无 | 当前步骤、固定步骤、可访问状态 | `onStepChange` | 本地 active State、生成步骤 ID |
| `BasicsStep` | 无 | 标题、作者 | 两个 `onValueChange` | 保存字段副本 |
| `PublishingStep` | 无 | 目标读者、摘要 | 两个 `onValueChange` | 保存字段副本 |
| `ReviewStep` | 无 | 完整草稿、读者标签 | 无 | 保存复核快照 |
| `EditorActions` | 无 | 当前步骤与按钮能力 | 上一步、下一步、完成 | 修改草稿 |
| `CompletionView` | 无 | 完整草稿、读者标签 | 继续修改 | 保存完成副本 |

### 3. 最小 Props 合同

字段 Props 使用领域化的值与动作，不把 setter 或 DOM event 暴露给父级：

```ts
type TextFieldProps = {
  readonly label: string
  readonly value: string
  readonly onValueChange: (nextValue: string) => void
}

type AudienceFieldProps = {
  readonly value: Audience
  readonly onValueChange: (nextValue: Audience) => void
}

type StepNavigationProps = {
  readonly currentStepId: StepId
  readonly availability: Readonly<Record<StepId, boolean>>
  readonly completion: Readonly<Record<StepId, boolean>>
  readonly onStepChange: (nextStepId: StepId) => void
}
```

子组件在 DOM `onChange` 中读取 `event.currentTarget.value`，转换成合同要求的字符串联合后调用领域回调。
父级收到下一值后不可变替换 `draft`。子组件不能直接接收 `setDraft`，也不能修改 `draft` 对象。

### 4. 步骤移除为什么不丢字段

步骤切换时，前一个步骤组件会从 render tree 移除；如果输入值只保存在步骤内部，它的局部 State 会随
该位置销毁。当前实战把四个字段提升到始终保留的 `MultiStepEditor`：

1. 步骤组件只接收当前 `value` 和 `onValueChange`。
2. 用户输入请求更新父级 `draft`。
3. 切换步骤只替换当前步骤面板，不移除 `MultiStepEditor`。
4. 返回原步骤时，新建的步骤面板从父级同一份 `draft` 重新收到字段值。

因此“保留”来自正确 owner，而不是 React 为卸载面板缓存表单。不得使用 CSS 隐藏全部步骤来伪造保留，
也不得用 Context 或外部 Store 绕过本课的受控 Props 练习。

## 七、编辑器身份与 Key 重置合同

### 1. Key 放置位置

唯一用于整树重置的 key 放在外壳直接渲染的 `MultiStepEditor` 上：

```tsx
<MultiStepEditor
  key={`${session.templateId}:${session.revision}`}
  templateLabel={currentTemplate.label}
  initialDraft={currentTemplate.initialDraft}
/>
```

该边界内包含 `draft`、`view`、全部步骤和全部输入 DOM。key 改变时，它们一起重建；模板工具栏和
`session` 在边界外保留，因而仍能决定下一实例使用哪个模板。

### 2. 两种合法重置事件

**切换模板：**

```ts
setSession({ templateId: nextTemplateId, revision: 0 })
```

**重新加载当前模板：**

```ts
setSession((previous) => ({
  ...previous,
  revision: previous.revision + 1,
}))
```

版本只在明确点击事件中变化，并在后续 render 中保持稳定。不能在 render 中递增，也不能使用随机数或
当前时间。

### 3. 不应改变 Key 的操作

以下操作必须保持同一个编辑器 key：

- 输入或清空任一字段。
- 点击上一步、下一步或已解锁步骤。
- 从复核进入完成视图。
- 从完成视图返回继续修改。
- 字段校验结果、进度或按钮 disabled 状态变化。

如果把 `currentStepId`、字段值或 `view.status` 拼进编辑器 key，每次导航或输入都会重建整个编辑器，
导致草稿和流程回到初值。该写法与产品身份不符。

### 4. Reset 与保留的产品语义

- 步骤导航：同一次编辑会话，保留草稿。
- 完成后继续修改：同一次编辑会话，保留草稿。
- 切换模板：新的编辑对象，丢弃旧会话，加载目标模板初值。
- 重新加载当前模板：同一模板的新会话，丢弃当前修改。
- 切换回之前模板：再次加载该模板固定初值，不恢复被销毁的旧实例。

界面必须在模板工具栏附近明确说明切换或重新加载会丢弃当前修改，避免把技术行为伪装成隐式产品规则。

## 八、字段更新与派生算法合同

### 1. 不可变字段更新

字段 handler 只替换对应字段：

```tsx
function handleTitleChange(nextTitle: string) {
  setDraft((previous) => ({
    ...previous,
    title: nextTitle,
  }))
}
```

作者、目标读者和摘要使用相同的一层复制方式。当前对象只有标量字段，不需要深克隆、Immer、泛型字段
更新器或动态属性断言；四个明确 handler 更适合本课阅读和类型检查。

### 2. 校验与步骤能力

```ts
const basicsComplete =
  draft.title.trim().length > 0 && draft.author.trim().length > 0

const publishingComplete =
  draft.audience !== '' && draft.summary.trim().length > 0

const allComplete = basicsComplete && publishingComplete
```

这些是当前 render 的派生常量。字段改变后下一次 render 自然得到新的按钮能力和步骤状态，不需要
`setBasicsComplete`、`setCanContinue` 或 Effect。

### 3. 复核与完成显示

复核页和完成页直接读取当前 `draft`：

- 标题、作者和摘要显示 `trim()` 后的文本。
- 目标读者按固定映射显示中文标签。
- 不创建 `reviewDraft`、`submittedDraft` 或 `summaryText` State。
- 完成后编辑字段不可见且不可修改；点击“继续修改”回到复核，再返回相应步骤修改。

因为完成动作没有服务器或历史提交含义，当前实战不需要保存另一个时间点快照。它只改变流程视图，
当前草稿仍是唯一事实来源。

## 九、固定交互验收序列

所有浏览器行为验收从刷新后的默认状态开始，按同一序列执行：

| 步骤 | 操作 | 必须观察到的结果 |
| ---: | --- | --- |
| `0` | 初始加载 | 当前模板是“空白文章”，步骤为“基本信息”；四个草稿字段为空；发布信息和复核步骤 disabled；没有完成结果。 |
| `1` | 标题只输入三个空格，作者输入“林同学” | 标题原样可编辑；基本信息仍未完成；下一步和后续步骤保持 disabled。 |
| `2` | 标题改为“React State 设计” | 基本信息完成；“发布信息”与下一步可用；复核仍未解锁。 |
| `3` | 点击下一步 | 进入“发布信息”；标题和作者保存在父级草稿中。 |
| `4` | 目标读者选择“本科生”，摘要输入“使用最小事实构建一致的交互界面。” | 发布信息完成；复核和下一步可用；进度与步骤状态同步更新。 |
| `5` | 点击“基本信息” | 返回第一步；标题仍为“React State 设计”，作者仍为“林同学”；发布字段也未被清空。 |
| `6` | 再点击“发布信息”，随后点击下一步 | 发布字段保持步骤 `4` 的值；进入复核页；复核内容准确显示四个当前字段。 |
| `7` | 返回基本信息，把标题改为“React State 结构设计”，再回到复核 | 复核标题立即显示新值；不存在旧的复核副本。 |
| `8` | 点击“完成编辑” | 显示完成视图及四个确认值；步骤面板和导航操作不再显示。 |
| `9` | 点击“继续修改” | 回到复核步骤，四个字段保持；再返回任意已解锁步骤仍可编辑。 |
| `10` | 点击“重新加载当前模板” | 编辑器回到基本信息；空白模板四字段恢复为空；发布信息和复核重新锁定；完成状态清除。 |
| `11` | 选择“研讨记录”模板 | key 改变并加载固定预填值；步骤仍从基本信息开始；预填标题、作者、读者和摘要与模板常量一致。 |
| `12` | 修改预填标题并进入发布信息，再切换到“空白文章” | 编辑器重建为空白模板初值和基本信息；研讨模板修改不残留。 |
| `13` | 再切回“研讨记录” | 重新加载固定研讨模板初值，不恢复步骤 `12` 前已销毁的修改或步骤位置。 |

固定序列之外必须核对：

1. 四个输入始终受控，值从第一次 render 起都是字符串，不出现受控/非受控切换警告。
2. 当前模板 button、步骤 button 和操作 button 的可用状态与 State/派生规则一致，普通按钮明确使用
   `type="button"`。
3. 清空第一步任一必填字段后，后续步骤立即重新锁定；重新补齐后按当前草稿重新解锁。
4. 步骤切换不会改变编辑器 key；模板切换和重新加载一定改变 key。
5. 固定步骤列表 key 使用 `step.id`；模板选择列表 key 使用 `template.id`；不使用索引、标签或随机值。
6. 展开源码只包含当前范围内的 TS、TSX 与 CSS，不出现 `useReducer`、Context、Effect、Ref、Router、
   外部 Store、网络、存储、异步提交或第三方库。
7. 桌面、`390px` 和 `390px + 32px` 根字号下没有页面横向溢出、字段或按钮裁切、文字重叠和不可达
   控件；步骤状态不能只靠颜色表达。
8. console error/warning、page error、失败请求和 `>=400` 响应均为 `0`。

## 十、Demo 与文件职责建议

### 1. Demo 身份

- 建议 Demo ID：`react.core.learn.intermediate.lab-multi-step-editor.multi-step-editor-demo`。
- Demo 标题：`多步骤编辑器`。
- runtime：`react`。
- 运行入口：`./demos/lab-multi-step-editor/lab-multi-step-editor-demo.tsx`。
- 正文只使用这一项真实 Demo，不维护第二套简化运行代码。

### 2. 最小文件拆分

| 文件 | 固定职责 |
| --- | --- |
| `editor-data.ts` | 导出步骤、模板、`StepId`、`Audience`、`ArticleDraft` 等固定数据与类型。 |
| `editor-fields.tsx` | 导出无本地 State 的基本信息与发布信息受控字段组件。 |
| `editor-navigation.tsx` | 导出无本地 State 的步骤导航和底部动作组件。 |
| `multi-step-editor.tsx` | 拥有 `draft` 与 `view`，计算派生值，组装步骤、复核和完成视图。 |
| `lab-multi-step-editor-demo.tsx` | 拥有外层 `session`，选择模板并用 key 渲染编辑器，导入 CSS。 |
| `lab-multi-step-editor-demo.css` | 只负责编辑器布局、步骤状态、字段和窄屏可读性。 |

这是建议上限，不要求为了文件数量拆出单次使用的微小组件。实现时可以在保持每个文件职责清楚的前提下
合并相邻组件，但不能把运行逻辑复制成另一份展示源码。

### 3. 同源与样式边界

- 展开源码必须来自运行时实际导入的同一组磁盘文件，包含所有 TS、TSX 与 CSS。
- 禁止手工复制源码字符串、删节关键 handler 或漏掉 CSS、固定数据和子组件。
- CSS 禁止 Grid 和 `gap`；使用 Flexbox、margin 和正常文档流。
- 步骤条在窄屏允许换行；固定字段宽度使用响应式上限，长摘要、按钮和模板名称不能撑出容器。
- 当前、已完成、未解锁状态同时使用文字或符号与颜色，不依赖单一颜色。
- 不添加动画、拖拽、渐变装饰、图标库或与编辑器功能无关的视觉内容。

## 十一、课程正文合同建议

### 1. Frontmatter 建议

| 字段 | 建议值或约束 |
| --- | --- |
| `id` | `react.core.learn.intermediate.lab-multi-step-editor` |
| `title` | `实战：多步骤编辑器` |
| `summary` | `组合 State 结构、受控边界与 key 重置，完成可分步填写、复核和重新加载的编辑器。` |
| `stage` | `intermediate` |
| `level` | `intermediate` |
| `prerequisites` | State 结构、State 提升、State 保留与重置，并补入正文真实使用的基础课程。 |
| `related` | 只包含已经开放且正文真实引用的课程。 |
| `tags` | `React`、`实战`、`State`、`受控组件`、`key`、`编辑器` |
| Demo | 只登记本文件第十节的一项真实 Demo。 |

学习目标建议保持五项：

1. 把模板会话、编辑草稿和流程视图建模为职责清楚、无冗余的 State。
2. 把跨步骤字段提升到共同 owner，并用受控字段 Props 完成双向协作。
3. 从当前草稿派生校验、步骤能力、进度和复核内容，不建立同步副本。
4. 区分步骤切换的 State 保留与模板身份变化的 key 重置。
5. 按固定序列验证返回编辑、完成、继续修改、模板切换和重新加载边界。

### 2. 正文建议顺序

1. 学习目标。
2. 最终成品与功能合同。
3. 先列固定步骤、模板和草稿类型。
4. 区分外层会话、内部草稿、流程视图和 render 派生值。
5. 画出组件树并确定每项 State 的 owner。
6. 实现受控字段与不可变草稿更新。
7. 实现步骤解锁、上一步、下一步和受控步骤导航。
8. 解释步骤面板移除后，父级草稿为什么仍保留。
9. 实现复核和完成视图，证明它们直接读取当前草稿。
10. 把 key 放到完整编辑器边界，实现模板切换和明确重载。
11. 观察真实 Demo，并按固定序列验证保留与重置。
12. 易错使用提示。
13. 源码推导与适用场景。
14. 练习与验收。
15. 本节小结和官方来源。

正文必须详细解释每个 State 为什么存在、每个派生值为什么不存、每个 owner 为什么放在该组件、key
边界为何覆盖整棵编辑器。表达要直接，不用修饰语填充篇幅。不得出现 IL1、I01-I03、课程迁移、总计划、
批次、复审、构建、测试、manifest、Track、完成数量、行数或字数限制。

### 3. 易错点建议

正文选择约六个高价值错误，不重复拆分同一问题：

| 错误 | 触发条件 | 后果 | 正确处理 |
| --- | --- | --- | --- |
| 每个步骤各存一份字段 | 标题 State 留在基本信息组件 | 离开步骤后局部 State 被销毁，返回时输入丢失 | 把跨步骤草稿提升到编辑器 owner |
| 父子同时保存同一字段 | 父级 `draft.title` 与子级 `localTitle` 并存 | 两份可写事实失同步，取消/返回语义不清 | 使用 `value + onValueChange` 单一来源 |
| 保存校验与进度副本 | 同时维护 `isValid`、`completedSteps`、`progress` | 字段更新后需要多条 setter 保持一致 | render 中由当前草稿派生 |
| 用多个互斥布尔值描述流程 | `isReviewing`、`isCompleted` 可同时为 true | 出现无法解释的视图组合 | 使用 `EditorView` 判别联合 |
| 把步骤或字段拼入编辑器 key | `key={currentStepId}` 或 `key={draft.title}` | 导航或按键时整树重建，草稿持续丢失 | 只用模板 ID 与明确重载版本组成 key |
| 期望 initial Prop 自动覆盖 State | 模板 Prop 改变但组件身份不变 | `useState(initialDraft)` 仍保留旧草稿 | 用业务身份 key 明确重建编辑器 |
| 随机生成重置 key | `key={Math.random()}` | 每次 render 都重建输入和子树 | 版本只在重载事件中递增 |
| 直接修改草稿或模板 | `draft.title = value` 或修改模板 initialDraft | 破坏 State 快照或污染后续重载初值 | 对草稿执行一层不可变替换，模板保持只读 |

### 4. 练习建议

每项练习都只组合当前已学知识，并提供明确要求与验收：

1. **增加“可见范围”字段。** 要求在发布信息步骤增加受控 select，把字段纳入同一 `draft`；验收为
   切换步骤值保留、复核同步显示、模板重载恢复初值，不能增加 Effect 或冗余校验 State。
2. **调整步骤解锁规则。** 要求允许随时返回已访问步骤，但仍禁止跳过未完成前置；验收为清空基本信息
   后后续步骤重新锁定，补齐后恢复，不保存 `unlockedSteps` 副本。
3. **缩小重置边界分析。** 给出只想清空摘要的需求，要求解释为何不应改变整个编辑器 key，并用一次
   不可变字段更新完成；验收为标题、作者、读者和当前步骤保持，只有摘要变空。

## 十二、高价值边界与不采用结论

### 1. 明确排除项

以下内容不得进入本实战正文、Demo、练习或 manifest 描述：

1. `useReducer`、reducer、Action、dispatch、Context、Provider 或外部状态库。
2. `useEffect`、Effect 依赖、cleanup、`useRef`、DOM Ref、自动聚焦或 imperative handle。
3. React Router、URL 步骤、浏览器历史、路由离开保护或页面级缓存。
4. localStorage、IndexedDB、cookie、文件、服务器持久化、自动保存或草稿恢复。
5. fetch、XHR、WebSocket、异步校验、异步提交、pending、错误重试或乐观更新。
6. 表单库、schema 校验库、富文本编辑器、Markdown 编辑器或第三方组件库。
7. `useMemo`、`memo`、`useCallback`、性能测量、Transition、Suspense 或并发 UI。
8. 撤销/重做、修改历史、版本对比、多用户协作、冲突合并或权限控制。
9. 随机 ID、时间戳 key、动态增删步骤、分支步骤、循环步骤或可配置工作流引擎。
10. 在学习者正文中出现路线编号、计划描述、生产命令、临时测试、浏览器工具、源码哈希、复审或完成
    计数。

### 2. 不采用的结论

1. “多步骤编辑器天然需要 reducer”不成立。当前两份内部 State、一个外层会话 State 和少量事件转换
   足以清楚表达固定三步流程；Reducer 尚未进入学习范围。
2. “步骤组件卸载后 React 会自动保存输入”不成立。面板局部 State 会随位置移除而销毁；字段之所以
   保留，是因为唯一草稿 owner 位于仍然保留的父组件。
3. “为了保留字段，应把所有步骤永久隐藏在 DOM 中”不成立。条件渲染步骤更直接；受控字段从父级草稿
   恢复，不需要用 CSS 隐藏制造保留。
4. “模板 Prop 变化会重新执行 `useState(initialDraft)`”不成立。初始参数在初始化后被忽略；当前产品
   用稳定 key 表达新编辑会话。
5. “key 越细越安全”不成立。key 会重建其边界及后代；把字段、步骤或校验结果放进 key 会扩大无意
   重置频率。
6. “每个步骤完成状态应该存起来”不成立。当前完成条件只依赖当前草稿，可以同步计算；保存副本只会
   增加失同步入口。
7. “完成动作必须保存提交快照”不成立。当前产品没有服务器或历史提交语义，完成视图直接读取唯一草稿；
   需要历史快照属于另一个产品需求。
8. “研究记录中的生产边界也应写进课程”不成立。学习者正文只保留当前编辑器的知识、实现和可观察
   验收，不包含课程生产过程。

## 十三、研究完成检查

- 一手来源只使用 React 官方文档、React 官方文档仓库和 TypeScript 官方 Handbook。
- 功能合同只组合已学的 State 结构、提升/受控边界、保留/重置及更早基础能力。
- 状态模型明确区分真实 State、固定数据和 render 派生值。
- 步骤身份、编辑器 key、重置边界和“不恢复已销毁模板草稿”的产品语义均有明确合同。
- 四个字段均有受控 Props、owner、校验和不可变更新规则。
- 固定验收覆盖字段保留、复核同步、完成/继续修改、模板切换和同模板重载。
- 排除范围明确禁止 Reducer、Context、Effect、Ref、Router、外部库及 I04 后续知识。
- 后续实现只能在 IL1 原子批次中创建正文、Demo、manifest/Track 登记和验证资产；本研究本身不代表
  课程已经完成或可访问。
