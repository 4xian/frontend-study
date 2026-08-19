---
id: react.core.learn.intermediate.lab-multi-step-editor
type: lesson
title: 实战：多步骤编辑器
summary: 组合 State 结构、受控边界与 key 重置，完成可分步填写、复核和重新加载的编辑器。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - react.core.learn.intermediate.state-structure
  - react.core.learn.intermediate.lifting-state-up
  - react.core.learn.intermediate.state-preservation-and-reset
  - react.core.learn.basics.immutable-state-updates
  - react.core.learn.basics.list-rendering-and-key
related:
  - react.core.learn.basics.state-ownership-and-thinking-in-react
  - react.core.learn.basics.react-forms
  - react.core.learn.basics.render-commit-and-state-snapshot
tags:
  - React
  - 实战
  - State
  - 受控组件
  - key
  - 编辑器
appliesTo: React 19.2 官方文档与 React 19
verifiedAt: 2026-08-16
objectives:
  - 能把模板会话、编辑草稿和流程视图建模为职责清楚且没有冗余的 State。
  - 能把跨步骤字段提升到共同所有者，并用值 Prop 与回调 Prop 控制字段组件。
  - 能从当前草稿派生校验、步骤能力、进度、字符数和复核内容。
  - 能解释步骤组件被移除后草稿为何保留，以及局部字段 State 为何会丢失。
  - 能用稳定业务身份和明确版本构成 key，重建完整编辑器子树。
  - 能区分步骤导航、单字段清空、模板切换和完整重载所需的更新边界。
recap:
  - 固定步骤、模板和读者选项是只读数据，不是 State。
  - 外层会话只保存模板 ID 和明确重载版本，编辑器内部保存统一草稿与流程视图。
  - 标题、作者、目标读者和摘要组成一份相关草稿，并通过不可变替换更新。
  - 当前步骤与完成视图使用判别联合，避免互相矛盾的多个布尔值。
  - 完成度、步骤索引、解锁能力、字符数和复核内容都在 render 中同步派生。
  - 字段组件只接收当前值与更新回调，不保存同名 State 副本。
  - 步骤切换会移除当前字段组件，但草稿因位于仍保留的父组件而继续存在。
  - 模板 ID 与重载版本组成编辑器 key，只有业务身份改变或明确重载时才重建子树。
  - 清空单个字段只更新该字段，不应改变整棵编辑器的 key。
  - 完成视图直接读取当前草稿；继续修改返回同一会话，不创建提交快照。
sources:
  - title: Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 相关 State 可以组合，矛盾、冗余和重复 State 应避免
      - 能从当前 Props 或 State 计算的值不应另存 State
      - useState 初始值不是持续同步的 Prop 镜像
  - title: Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 跨组件共享的 State 应提升到最近共同父组件
      - 受控组件通过值和事件处理函数 Prop 接入单一事实来源
  - title: Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - State 与 render tree 中的位置关联
      - 改变 key 可以重置组件及其后代 State
      - 组件被移除后，其局部 State 不再保留
  - title: useState
    url: https://react.dev/reference/react/useState
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 初始参数只在初始化时采用
      - 改变 key 会从头创建组件及其全部 children
  - title: State as a Snapshot
    url: https://react.dev/learn/state-as-a-snapshot
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - render 获得一个 State 快照，setter 请求下一次 render
  - title: Updating Objects in State
    url: https://react.dev/learn/updating-objects-in-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - State 对象应视为只读值并通过复制创建下一对象
  - title: Reacting to Input with State
    url: https://react.dev/learn/reacting-to-input-with-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 先列出可见状态和触发事件，再用最少 State 表达界面
  - title: React input
    url: https://react.dev/reference/react-dom/components/input
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - 受控文本输入使用字符串 value 与同步 onChange
  - title: React select
    url: https://react.dev/reference/react-dom/components/select
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - 受控单选下拉框使用字符串 value 与同步 onChange
  - title: React textarea
    url: https://react.dev/reference/react-dom/components/textarea
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - 受控多行文本使用字符串 value 与同步 onChange
  - title: Rendering Lists
    url: https://react.dev/learn/rendering-lists
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 列表 key 应来自稳定数据并在同一父级的兄弟节点中唯一
  - title: TypeScript Narrowing
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
    sourceType: official-reference
    appliesTo: TypeScript
    claims:
      - 判别联合用共同字面量字段表达互斥状态并支持收窄
---

# 实战：多步骤编辑器

## 一、学习目标

- 把文章编辑需求拆成固定数据、真实 State、render 派生值和事件转换。
- 为模板会话、文章草稿和流程视图确定清楚的所有者。
- 用受控字段连接步骤组件与统一草稿，确保来回切换时输入不丢失。
- 从草稿直接计算校验、步骤解锁、进度、字符数、复核和按钮能力。
- 用模板 ID 与重载版本构成稳定 key，只在需要完整重建时重置编辑器。
- 根据产品意图区分保留整份草稿、清空一个字段和重新加载全部初值。

## 二、最终成品与功能合同

要完成的是一个纯客户端文章编辑器。编辑流程包含三个固定步骤：

1. 基本信息：填写文章标题和作者。
2. 发布信息：选择目标读者并填写摘要。
3. 复核：查看当前草稿并完成编辑。

编辑器提供“空白文章”和“研讨记录”两个固定模板。切换模板会加载目标模板初值；重新加载当前模板会
丢弃当前修改并恢复同一模板初值。两个动作都表示新的编辑会话。

步骤切换具有不同语义：用户只是查看同一份草稿的另一部分，因此标题、作者、读者和摘要必须保留。
完成后还可以返回复核页继续修改，草稿仍属于同一次编辑会话。

页面内可观察到以下区域：

- 当前模板和完整重载命令。
- 三步导航及“当前、已完成、可访问、未解锁”状态文字。
- 当前步骤需要的受控字段。
- 当前步骤序号、按钮可用状态和摘要字符数。
- 同步复核内容与完成视图。

所有数据只存在当前页面内存，刷新页面后恢复默认模板。

## 三、先画出数据边界

开始写组件前，先把需求中的值分成四类：

| 分类 | 值 | 处理方式 |
| --- | --- | --- |
| 固定数据 | 步骤顺序、步骤标签、模板、读者选项 | 模块常量 |
| 外层会话 State | 当前模板 ID、明确重载版本 | 编辑器外壳保存 |
| 编辑器 State | 统一草稿、当前流程视图 | 编辑器工作区保存 |
| render 派生值 | 完成度、解锁状态、步骤索引、字符数、读者标签、复核内容 | 每次 render 计算 |

这个分类直接决定组件职责。固定数据不会被用户修改，不需要 setter。派生值已经能从当前事实得到，也
不需要第二个可写来源。只有必须跨 render 记住、且不能从其他值计算的事实进入 State。

## 四、固定步骤与业务身份

步骤顺序是产品定义，不是用户输入：

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

`step.id` 是流程身份，承担三项职责：

- 表达当前位于哪个步骤。
- 作为步骤导航列表的稳定 key。
- 查询该步骤是否完成和是否可访问。

`label` 只是显示文本。把“基本信息”改成“文章信息”不应创建另一份步骤 State，也不应重置草稿。
数组索引虽然在当前固定数组中看似可用，但它没有表达业务含义；直接使用固定 ID 可以让流程转换和类型
检查保持一致。

## 五、模板与草稿合同

草稿只保存用户真正编辑的四个事实：

```ts
export type Audience = '' | 'students' | 'teachers' | 'public'

export type ArticleDraft = {
  readonly title: string
  readonly author: string
  readonly audience: Audience
  readonly summary: string
}
```

目标读者使用字符串联合。空字符串表示尚未选择，其他值是稳定业务值。界面显示的“本科生”“教师”
和“公众”可以从这些值查表得到，不复制进草稿。

模板包含稳定 ID、显示标签和一份只读初值：

```ts
export type ArticleTemplate = {
  readonly id: 'blank' | 'seminar'
  readonly label: string
  readonly initialDraft: ArticleDraft
}
```

模板对象不是可写草稿。编辑器初始化时创建一份新的草稿对象：

```tsx
const [draft, setDraft] = useState<ArticleDraft>(() => ({ ...initialDraft }))
```

后续输入只替换 `draft`，不会修改 `initialDraft`。因此重新加载模板时仍能得到可靠初值，也不会把一次
编辑污染到下一次会话。

## 六、组件树与 State 所有者

组件树按数据职责划分：

```text
LabMultiStepEditorDemo
├── TemplateToolbar
└── EditorWorkspace key={templateId:revision}
    ├── StepNavigation
    ├── BasicsStep
    ├── PublishingStep
    ├── ReviewStep
    ├── EditorActions
    └── CompletionView
```

所有权表如下：

| 组件 | 拥有的 State | 读取的输入 | 发起的动作 |
| --- | --- | --- | --- |
| `LabMultiStepEditorDemo` | 当前模板 ID、重载版本 | 固定模板 | 切换模板、重新加载 |
| `TemplateToolbar` | 无 | 当前模板 ID | 报告模板选择、报告重载 |
| `EditorWorkspace` | 草稿、流程视图 | 当前模板初值与标签 | 更新字段、导航、完成、继续修改 |
| `StepNavigation` | 无 | 当前步骤、完成度、可访问状态 | 报告目标步骤 |
| `BasicsStep` | 无 | 标题、作者 | 报告字段新值 |
| `PublishingStep` | 无 | 目标读者、摘要 | 报告字段新值 |
| `ReviewStep` | 无 | 当前草稿 | 无 |
| `CompletionView` | 无 | 当前草稿 | 报告继续修改 |

模板工具栏必须位于 key 重置边界之外，否则重建编辑器时连决定新身份的会话 State 也会被销毁。四个
字段必须位于步骤组件共同的父级中，否则离开步骤时局部字段 State 会随步骤组件一起结束。

## 七、外层会话 State

当前模板与重载版本总是共同决定编辑器身份，可以放在一份相关 State 中：

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

`templateId` 表示加载哪个业务模板。`revision` 只表示同一模板被明确重新加载了多少次，不显示给用户，
也不代表文章版本历史。

切换模板时建立目标模板的新会话：

```tsx
/** 切换业务模板，并为目标模板建立新的编辑会话。 */
function handleTemplateChange(nextTemplateId: ArticleTemplate['id']) {
  setSession((previous) =>
    previous.templateId === nextTemplateId
      ? previous
      : { templateId: nextTemplateId, revision: 0 },
  )
}
```

点击已经选中的模板不产生更新。重新加载当前模板只递增明确版本：

```tsx
/** 递增明确的会话版本，重新加载当前模板初值。 */
function handleReload() {
  setSession((previous) => ({
    ...previous,
    revision: previous.revision + 1,
  }))
}
```

版本在事件中变化，在之后的 render 中保持稳定。不能在 render 中生成随机数或读取当前时间作为版本。

## 八、用判别联合表示流程视图

编辑器要么正在编辑某一步，要么已经完成。使用多个布尔值会允许矛盾组合：

```ts
const [isReviewing, setIsReviewing] = useState(false)
const [isCompleted, setIsCompleted] = useState(false)
```

两个值可能同时为 `true`，也可能都为 `false`，还需要另一份当前步骤解释界面。判别联合只保留合法
形状：

```ts
type EditorView =
  | { readonly status: 'editing'; readonly stepId: StepId }
  | { readonly status: 'completed' }

const [view, setView] = useState<EditorView>({
  status: 'editing',
  stepId: 'basics',
})
```

当 `status` 为 `editing` 时，`stepId` 一定存在；当 `status` 为 `completed` 时，不再声称某个输入
步骤仍是当前步骤。TypeScript 也能根据 `status` 收窄联合类型。

## 九、只保存两项编辑器 State

`EditorWorkspace` 内部只需要两项 State：

1. `draft`：四个字段必须跨步骤和 render 保留。
2. `view`：当前编辑步骤或完成状态不能从草稿唯一计算。

下列值都不应进入 State：

| 值 | 计算来源 |
| --- | --- |
| 基本信息是否完成 | 标题和作者 |
| 发布信息是否完成 | 目标读者和摘要 |
| 全部字段是否完成 | 前两项完成结果 |
| 当前步骤索引 | `view.stepId` 与固定步骤数组 |
| 当前步骤序号 | 当前索引加一 |
| 步骤是否可访问 | 前置步骤完成度 |
| 下一步是否可用 | 当前步骤完成度 |
| 摘要字符数 | `draft.summary.length` |
| 目标读者标签 | `draft.audience` 与固定映射 |
| 复核内容 | 当前 `draft` |

如果把这些结果保存成 State，每次字段更新都必须额外调用 setter。任何遗漏都会让输入、按钮、步骤状态
和复核显示互相矛盾。

## 十、同步派生完成度

完成规则只拒绝空值和纯空白文本：

```ts
const basicsComplete =
  draft.title.trim().length > 0 && draft.author.trim().length > 0

const publishingComplete =
  draft.audience !== '' && draft.summary.trim().length > 0

const allComplete = basicsComplete && publishingComplete
```

`trim()` 只参与校验和最终显示，不在用户每次输入时改写原始字符串。用户输入三个空格时，输入框仍显示
三个空格，但完成度为假；这同时保留输入控制权和正确业务判断。

派生计算发生在每次 render 中。setter 请求新 render 后，完成度、步骤按钮和复核内容自然基于新草稿
一起更新，不需要再保存一份同步结果。

## 十一、受控字段合同

步骤字段不拥有文本 State，只接收当前值与领域回调：

```ts
type BasicsStepProps = {
  readonly title: string
  readonly author: string
  readonly onTitleChange: (nextTitle: string) => void
  readonly onAuthorChange: (nextAuthor: string) => void
}
```

输入事件只负责读取 DOM 当前值并交给所有者：

```tsx
/** 把标题输入框的最新字符串交给草稿所有者。 */
function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
  onTitleChange(event.currentTarget.value)
}

<input value={title} onChange={handleTitleChange} />
```

这条链路是单向的：

```text
父级 draft.title
  -> 子组件 value
  -> 用户触发 onChange
  -> 子组件报告 nextTitle
  -> 父级替换 draft
  -> 下一次 render 传回新的 value
```

子组件不接收整个 `setDraft`，也不保存 `localTitle`。领域回调隐藏了父级 State 的内部形状，使字段只
知道自己显示什么、变化时报告什么。

`input`、`select` 和 `textarea` 从第一次 render 起都接收确定的字符串值。不要先传 `undefined`，再
切换成字符串，否则会跨越非受控与受控边界。

## 十二、不可变更新统一草稿

四个字段属于一份相关草稿。更新单个字段时复制原对象并覆盖目标字段：

```tsx
/** 不可变替换文章标题，并保留草稿中的其他字段。 */
function handleTitleChange(nextTitle: string) {
  setDraft((previous) => ({
    ...previous,
    title: nextTitle,
  }))
}
```

使用 updater 函数可以明确“下一份草稿基于上一份草稿”。对象展开保留作者、读者和摘要，覆盖顺序保证
新标题替换旧标题。

当前草稿只有一层标量字段，一层复制已经足够。不要直接写 `draft.title = nextTitle`，也不需要引入深
克隆、通用路径更新器或第三方不可变库。

## 十三、步骤解锁规则

每一步的访问能力都由当前草稿决定：

```ts
const availability: Readonly<Record<StepId, boolean>> = {
  basics: true,
  publishing: basicsComplete,
  review: allComplete,
}
```

规则表如下：

| 目标步骤 | 可访问条件 | 原因 |
| --- | --- | --- |
| 基本信息 | 始终可访问 | 用户随时可以返回修正前置字段 |
| 发布信息 | 基本信息完成 | 后续编辑依赖有效标题和作者 |
| 复核 | 两个输入步骤都完成 | 复核只展示完整草稿 |

步骤按钮使用真实 `disabled` 表达未解锁状态，并显示“当前、已完成、可访问、未解锁”文字。状态不能只靠
边框颜色区分。

当用户返回基本信息并清空标题时，发布信息与复核立即重新锁定。补齐标题后，它们根据同一份当前草稿
重新解锁，不需要保存 `unlockedSteps` 历史副本。

## 十四、受控步骤导航

导航组件接收当前步骤、完成度、可访问状态和回调：

```ts
type StepNavigationProps = {
  readonly currentStepId: StepId
  readonly availability: Readonly<Record<StepId, boolean>>
  readonly completion: Readonly<Record<StepId, boolean>>
  readonly onStepChange: (nextStepId: StepId) => void
}
```

它不保存自己的 active State。点击时只报告目标 ID，所有者再次检查目标是否可访问：

```tsx
/** 在目标步骤已解锁时切换受控步骤。 */
function handleStepChange(nextStepId: StepId) {
  if (availability[nextStepId]) {
    setView({ status: 'editing', stepId: nextStepId })
  }
}
```

列表使用 `key={step.id}`。该 key 只帮助 React 匹配三个导航项，不负责重置编辑器，也不替代作为普通
数据使用的 `step.id`。

## 十五、上一步、下一步与完成转换

流程转换保持在事件处理函数中：

| 当前视图 | 事件 | 条件 | 下一视图 | 草稿 |
| --- | --- | --- | --- | --- |
| 基本信息 | 下一步 | 基本信息完成 | 发布信息 | 保留 |
| 发布信息 | 上一步 | 始终 | 基本信息 | 保留 |
| 发布信息 | 下一步 | 发布信息完成 | 复核 | 保留 |
| 复核 | 上一步 | 始终 | 发布信息 | 保留 |
| 任意编辑步骤 | 点击已解锁步骤 | 目标可访问 | 目标步骤 | 保留 |
| 复核 | 完成编辑 | 全部完成 | 完成视图 | 保留 |
| 完成视图 | 继续修改 | 始终 | 复核 | 保留 |

“下一步”只在当前步骤完成时可用。按钮的 `disabled` 是当前 render 的派生结果，handler 中仍保留条件
检查，使转换条件与界面能力一致。

完成动作只把流程视图改成 `completed`；草稿仍是唯一事实来源。

## 十六、步骤切换为何不丢字段

三个步骤面板通过条件渲染互斥出现：

```tsx
{view.stepId === 'basics' && <BasicsStep ... />}
{view.stepId === 'publishing' && <PublishingStep ... />}
{view.stepId === 'review' && <ReviewStep ... />}
```

离开基本信息时，`BasicsStep` 会从 render tree 移除。它内部若保存 `title` 和 `author`，这些局部 State
也会结束。返回时出现的是新的步骤组件实例，局部初值会重新创建。

当前结构把字段提升到始终保留的 `EditorWorkspace`：

1. 步骤组件从父级接收 `value`。
2. 输入变化通过回调更新父级 `draft`。
3. 切换步骤只移除步骤面板，不移除工作区。
4. 返回步骤时，新面板从父级当前 `draft` 重新获得字段。

因此，保留来自正确的 State 所有者，不是 React 为已移除步骤缓存了输入。也不需要把全部步骤永久放在
DOM 中再用 CSS 隐藏。

## 十七、复核内容保持同步

复核页直接读取当前草稿：

```tsx
<ReviewStep draft={draft} audienceLabel={audienceLabel} />
```

标题、作者和摘要在显示时调用 `trim()`，读者标签从固定映射得到。复核组件不声明 `reviewDraft`，也
不在进入复核时复制草稿。

如果用户从复核返回基本信息修改标题，再回到复核，显示内容来自新的 `draft`，自然同步。保存一个复核
副本反而需要决定何时复制、何时失效、如何避免漏更新。

摘要字符数同样直接使用 `summary.length`。它描述当前输入字符串，不代表新的业务事实。

## 十八、完成视图与继续修改

完成视图与编辑视图互斥：

```tsx
if (view.status === 'completed') {
  return (
    <CompletionView
      draft={draft}
      audienceLabel={audienceLabel}
      onContinueEditing={handleContinueEditing}
    />
  )
}
```

完成视图仍读取同一份 `draft`。点击继续修改时只恢复复核视图：

```tsx
/** 从完成视图返回同一份草稿的复核步骤。 */
function handleContinueEditing() {
  setView({ status: 'editing', stepId: 'review' })
}
```

这里不改变编辑器 key，所以草稿继续保留。只有当产品需要保存某个历史提交时刻时，才需要额外快照；
当前完成动作没有该语义。

## 十九、用 key 表达完整编辑身份

编辑器身份由模板 ID 与明确重载版本构成：

```tsx
<EditorWorkspace
  key={`${session.templateId}:${session.revision}`}
  templateLabel={currentTemplate.label}
  initialDraft={currentTemplate.initialDraft}
/>
```

key 放在完整工作区边界上。它覆盖草稿、流程视图、三个步骤和输入 DOM，但不覆盖外层模板工具栏与会话
State。

改变 key 后，React 会把 `EditorWorkspace` 及其后代视为新的身份：

- `draft` 从目标模板 `initialDraft` 重新初始化。
- `view` 回到基本信息步骤。
- 输入 DOM 与步骤组件一同重建。
- 完成状态和当前步骤不会残留。

这正好匹配“切换模板”和“重新加载当前模板”的产品语义。

## 二十、哪些操作不能改变 key

以下操作属于同一次编辑会话，必须保持相同 key：

- 输入、修改或清空任一字段。
- 点击上一步、下一步或已解锁步骤。
- 从复核进入完成视图。
- 从完成视图返回继续修改。
- 校验、字符数、进度或按钮能力变化。

错误地使用 `key={view.stepId}` 会在每次步骤切换时重建工作区。使用 `key={draft.title}` 会在每次输入
时重建，输入框几乎无法正常编辑。使用 `Math.random()` 则会让每次 render 都成为新实例。

key 应表达业务身份，而不是作为任意刷新开关。

## 二十一、局部清空与完整重置

假设用户只想清空摘要。摘要是草稿中的一个字段，不需要重建整个编辑器：

```tsx
setDraft((previous) => ({
  ...previous,
  summary: '',
}))
```

执行后应该保留标题、作者、目标读者和当前步骤，只让发布信息完成度与复核能力根据新草稿重新计算。

三种更新边界必须区分：

| 意图 | 实现 | 保留内容 |
| --- | --- | --- |
| 清空一个字段 | 替换 `draft` 对应字段 | 其他字段、当前步骤、会话身份 |
| 在步骤之间导航 | 替换 `view.stepId` | 完整草稿、会话身份 |
| 重新加载完整编辑器 | 改变编辑器 key | 外层模板选择能力 |

重置范围越大，丢弃的 State 和 DOM 越多。边界应由产品意图决定。

## 二十二、完整数据流

字段更新：

```text
用户编辑 input/select/textarea
  -> 步骤组件读取 currentTarget.value
  -> 调用领域回调
  -> EditorWorkspace 不可变替换 draft
  -> 下一次 render 派生完成度和按钮能力
  -> 新 value 与状态传回子组件
```

步骤导航：

```text
用户点击已解锁步骤
  -> StepNavigation 报告 StepId
  -> EditorWorkspace 检查 availability
  -> 替换 view.stepId
  -> 当前步骤面板切换，父级 draft 保留
```

完整重载：

```text
用户切换模板或重新加载
  -> 外层替换 session
  -> templateId:revision 组成的新 key
  -> 旧 EditorWorkspace 被移除
  -> 新 EditorWorkspace 从模板初值创建 draft 和 view
```

三条链路分别处理字段、流程和身份，不互相复制 State。

## 二十三、文件边界

实现由五个同源文件组成：

| 文件 | 职责 |
| --- | --- |
| `editor-data.ts` | 步骤、模板、读者选项和领域类型 |
| `editor-steps.tsx` | 受控字段、导航、操作、复核和完成视图 |
| `editor-workspace.tsx` | 统一草稿、流程视图、派生值和事件转换 |
| `lab-multi-step-editor-demo.tsx` | 外层会话、模板工具栏和 key 边界 |
| `lab-multi-step-editor-demo.css` | 工作区、步骤状态、字段与窄屏布局 |

运行组件与源码展示读取同一组文件。数据定义不与组件 JSX 混在一起，外层身份也不与内部草稿所有权
混合。

## 二十四、实现顺序

### 1. 定义固定数据

先写步骤 ID、步骤数组、草稿类型、读者选项和两个模板，确认哪些值永远不会被用户修改。

### 2. 列出可见状态

明确基本信息、发布信息、复核、完成四类视图，以及切换它们的用户事件。

### 3. 声明最小 State

外层只声明会话，工作区只声明草稿和流程视图。逐项删除可以从这些事实计算的候选 State。

### 4. 接通受控字段

让字段组件接收值和领域回调，工作区用四个明确 handler 不可变替换草稿字段。

### 5. 派生校验与能力

计算两个输入步骤的完成度、全部完成度、步骤可访问状态和当前按钮能力。

### 6. 接通步骤导航

使用固定步骤 ID、稳定列表 key、真实 disabled 与受控 `currentStepId`。

### 7. 完成复核和完成视图

两个视图都直接读取当前草稿，不创建显示副本或提交快照。

### 8. 放置 key 重置边界

让模板 ID 与明确重载版本只作用于完整工作区，确认工具栏仍保留在边界外。

### 9. 检查保留与重置

先验证步骤往返保留，再验证模板切换和重新加载会完整恢复初值。

:::demo{id="react.core.learn.intermediate.lab-multi-step-editor.multi-step-editor-demo"}
:::

## 二十五、固定操作序列

| 步骤 | 操作 | 预期结果 |
| ---: | --- | --- |
| 1 | 初始打开 | 当前模板为“空白文章”，位于基本信息；发布信息与复核未解锁。 |
| 2 | 标题输入三个空格，作者输入“林同学” | 输入原样显示，基本信息仍未完成，下一步保持 disabled。 |
| 3 | 标题改为“React State 设计” | 基本信息完成，发布信息与下一步可用，复核仍未解锁。 |
| 4 | 点击下一步 | 进入发布信息，第一步的标题和作者保存在统一草稿中。 |
| 5 | 选择“本科生”，填写摘要 | 发布信息完成，复核步骤和下一步可用，字符数同步变化。 |
| 6 | 返回基本信息 | 标题和作者保持；发布字段也仍在父级草稿中。 |
| 7 | 再进入发布信息并前往复核 | 复核准确显示四个当前字段。 |
| 8 | 返回基本信息修改标题，再回复核 | 复核直接显示新标题，不存在旧副本。 |
| 9 | 点击完成编辑 | 显示完成视图及四个确认值。 |
| 10 | 点击继续修改 | 返回复核，完整草稿保持。 |
| 11 | 点击重新加载当前模板 | 工作区回到空白模板初值与基本信息步骤。 |
| 12 | 切换到“研讨记录” | 工作区加载四项固定预填值，但仍从基本信息开始。 |
| 13 | 修改预填标题后切换到空白模板 | 旧工作区销毁，空白模板重新开始。 |
| 14 | 再切回研讨记录 | 加载模板固定初值，不恢复已销毁会话的修改。 |

这条序列同时验证：字段所有者正确、派生值无副本、步骤导航不重置草稿、key 只在完整重载时变化。

## 二十六、State 判断表

| 值 | 是否 State | 原因 |
| --- | --- | --- |
| 步骤数组 | 否 | 固定产品数据 |
| 模板数组 | 否 | 固定模块输入 |
| 当前模板 ID | 是 | 用户选择后需跨 render 保留 |
| 重载版本 | 是 | 明确重载事件需要产生新身份 |
| 当前模板对象 | 否 | 可按模板 ID 从固定数组查找 |
| 文章草稿 | 是 | 用户输入后需跨步骤和 render 保留 |
| 当前编辑步骤或完成状态 | 是 | 不能从草稿唯一计算 |
| 基本信息完成度 | 否 | 可从标题与作者计算 |
| 发布信息完成度 | 否 | 可从读者与摘要计算 |
| 当前步骤索引 | 否 | 可从步骤 ID 和固定数组计算 |
| 摘要字符数 | 否 | 可从摘要字符串计算 |
| 读者中文标签 | 否 | 可从读者值与固定映射查找 |
| 复核内容 | 否 | 等于当前草稿的显示投影 |
| 完成结果副本 | 否 | 当前完成动作没有历史快照语义 |

## 二十七、易错使用提示

:::pitfalls
### 错误一：让每个步骤保存自己的字段

**触发条件：** `BasicsStep` 内声明标题和作者 State，`PublishingStep` 内声明读者和摘要 State。

**原因：** 步骤切换会把当前步骤组件从树中移除，局部 State 随组件身份一起结束。

**后果：** 返回原步骤时字段从局部初值重新创建，复核页也没有统一草稿可读。

**错误示例：**

```tsx
/** 错误地让会被移除的步骤拥有跨步骤草稿。 */
function BasicsStep() {
  const [title, setTitle] = useState('')
  return <input value={title} onChange={(event) => setTitle(event.currentTarget.value)} />
}
```

**正确写法：**

```tsx
/** 保存跨步骤草稿，并把当前字段作为受控值传给步骤组件。 */
function EditorWorkspace() {
  const [draft, setDraft] = useState(initialDraft)
  return (
    <BasicsStep
      title={draft.title}
      onTitleChange={(title) => setDraft((current) => ({ ...current, title }))}
    />
  )
}
```

**验证方式：** 填完第一步进入第二步，再返回第一步，标题和作者必须保持。

### 错误二：父子同时保存同一字段

**触发条件：** 父级保存 `draft.title`，子级又用 `localTitle` 镜像 Prop。

**原因：** 同一个标题出现两个可写事实来源，Prop 变化也不会自动重新执行局部 State 初值。

**后果：** 输入框、复核和模板重载可能显示不同标题。

**错误示例：**

```tsx
/** 错误地把标题 Prop 复制成第二份局部 State。 */
function TitleField({ title }: { title: string }) {
  const [localTitle, setLocalTitle] = useState(title)
  return <input value={localTitle} onChange={(event) => setLocalTitle(event.currentTarget.value)} />
}
```

**正确写法：**

```tsx
/** 直接显示所有者提供的标题，并报告用户输入。 */
function TitleField({ title, onTitleChange }: TitleFieldProps) {
  return <input value={title} onChange={(event) => onTitleChange(event.currentTarget.value)} />
}
```

**验证方式：** 任意修改标题后，输入框与复核内容必须始终来自父级同一字段。

### 错误三：保存校验、进度和复核副本

**触发条件：** 声明 `isBasicsComplete`、`currentStepNumber`、`summaryLength` 或 `reviewDraft` State。

**原因：** 这些值都能从当前草稿、步骤和固定数据同步计算。

**后果：** 一次字段更新需要维护多份 State，遗漏任何 setter 都会显示过期结果。

**错误示例：**

```tsx
const [summary, setSummary] = useState('')
const [summaryLength, setSummaryLength] = useState(0)
const [isPublishingComplete, setIsPublishingComplete] = useState(false)
```

**正确写法：**

```tsx
const [draft, setDraft] = useState(initialDraft)
const summaryLength = draft.summary.length
const isPublishingComplete = draft.audience !== '' && draft.summary.trim().length > 0
```

**验证方式：** 修改摘要后，字符数、发布完成度和复核内容应在同一次新 render 中一致变化。

### 错误四：用多个布尔值描述互斥视图

**触发条件：** 同时维护 `isReviewing`、`isCompleted` 和 `isEditing`。

**原因：** 多个布尔值允许互相矛盾的组合，无法保证界面只处于一种流程状态。

**后果：** 复核与完成内容可能同时显示，事件处理还要手工关闭多个标记。

**错误示例：**

```tsx
const [isEditing, setIsEditing] = useState(true)
const [isReviewing, setIsReviewing] = useState(false)
const [isCompleted, setIsCompleted] = useState(false)
```

**正确写法：**

```tsx
type EditorView =
  | { status: 'editing'; stepId: StepId }
  | { status: 'completed' }

const [view, setView] = useState<EditorView>({ status: 'editing', stepId: 'basics' })
```

**验证方式：** 每次转换后只存在一个合法视图，TypeScript 能按 `status` 访问对应字段。

### 错误五：把步骤或字段拼进编辑器 key

**触发条件：** 使用 `key={view.stepId}`、`key={draft.title}` 或随机 key。

**原因：** key 改变会重建其边界及全部后代，不只更新触发变化的局部值。

**后果：** 导航或按键时整个工作区回到模板初值，输入无法稳定保留。

**错误示例：**

```tsx
<EditorWorkspace key={`${view.stepId}:${draft.title}`} initialDraft={initialDraft} />
```

**正确写法：**

```tsx
<EditorWorkspace
  key={`${session.templateId}:${session.revision}`}
  initialDraft={initialDraft}
/>
```

**验证方式：** 输入和步骤切换不重置；模板切换和重新加载一定重置。

### 错误六：期待初始 Prop 自动覆盖已有 State

**触发条件：** 只改变 `initialDraft` Prop，不改变组件身份，并期待 `useState(initialDraft)` 再次初始化。

**原因：** `useState` 初始参数只在组件初始化时采用。

**后果：** 工具栏显示新模板，工作区仍保留旧模板草稿。

**错误示例：**

```tsx
<EditorWorkspace initialDraft={currentTemplate.initialDraft} />
```

**正确写法：**

```tsx
<EditorWorkspace
  key={`${session.templateId}:${session.revision}`}
  initialDraft={currentTemplate.initialDraft}
/>
```

**验证方式：** 切换模板或重新加载后，四个字段和当前步骤都应来自当前模板初值。

### 错误七：直接修改草稿或模板

**触发条件：** 写 `draft.title = nextTitle`，或者直接修改 `template.initialDraft`。

**原因：** State 与 Props 应按只读快照处理；模板还承担未来重载初值。

**后果：** React 无法通过新对象清楚识别更新，模板初值也会被当前会话污染。

**错误示例：**

```tsx
draft.title = nextTitle
template.initialDraft.title = nextTitle
```

**正确写法：**

```tsx
setDraft((previous) => ({
  ...previous,
  title: nextTitle,
}))
```

**验证方式：** 修改研讨模板草稿后重新加载，必须恢复固定预填内容。

### 错误八：用完整重置代替局部字段更新

**触发条件：** 为“清空摘要”递增工作区 revision。

**原因：** 摘要变化只涉及一个字段，完整 key 重置扩大了更新边界。

**后果：** 标题、作者、读者和步骤位置也被无意丢弃。

**错误示例：**

```tsx
/** 错误地通过完整会话重载清空单个字段。 */
function clearSummary() {
  setSession((previous) => ({ ...previous, revision: previous.revision + 1 }))
}
```

**正确写法：**

```tsx
/** 只替换草稿中的摘要字段。 */
function clearSummary() {
  setDraft((previous) => ({ ...previous, summary: '' }))
}
```

**验证方式：** 清空摘要后其他三个字段与当前会话身份保持不变。
:::

## 二十八、从状态语义推导实现

### 1. 为什么草稿是对象 State

四个字段共同组成一篇文章草稿，会一起加载和重置，也会被复核与完成视图共同读取。把它们放在一个
对象中可以表达这种领域关系。字段更新仍然明确，不需要通用动态更新器。

### 2. 为什么流程视图不放进草稿

当前步骤不是文章内容。它有不同生命周期：重新加载时与草稿一起初始化，但字段更新时不应改变。分开
保存能保持文章数据与界面流程的职责清楚。

### 3. 为什么外层会话不能放进工作区

工作区需要被 key 重建，而会话 State 必须在重建边界外继续存在，才能提供下一个 key 和模板初值。
把两者放进同一组件会让重置命令与被重置对象混在一起。

### 4. 为什么步骤组件可以条件移除

跨步骤数据已经提升到工作区，步骤组件只是当前数据的一种编辑界面。条件移除能让返回树准确反映当前
视图，不需要永久保留不可见字段。

### 5. 为什么复核不是 State

复核没有独立时间语义，只是当前草稿的只读投影。直接计算能保证它永远与当前输入一致。

### 6. 为什么 key 使用两个稳定部分

模板 ID 区分不同业务初值；revision 区分同一模板的两次明确加载。二者都只在用户命令中变化，既能
表达身份，也不会让普通 render 意外重建。

## 二十九、适用边界

当前结构适合步骤固定、字段数量有限、校验同步、数据只保存在当前页面内存的编辑流程。它能清楚展示
State 所有权、受控边界、同步派生和身份重置。

当前结论依赖三个条件：步骤固定、字段数量有限、校验能够同步完成。任一条件变化时，都应重新分析
状态与事件边界，而不是直接沿用当前结构。

## 三十、练习

:::exercise
### 练习一：增加可见范围字段

**要求：** 在发布信息中增加“公开、组织内、仅自己”受控下拉框，把业务值放入同一草稿，并在复核与完成视图显示标签；复核内容继续从当前草稿直接计算，不增加同名 State 副本。

**完成标准：** 步骤往返时值保留，复核随当前值更新，重新加载模板恢复对应初值。
:::

:::exercise
### 练习二：重新判断步骤能力

**要求：** 保持基本信息始终可访问，只有前置字段完成时才开放后续步骤；清空标题后立即锁定发布信息和复核，不保存 unlockedSteps State。

**完成标准：** 解锁状态完全由当前草稿派生，补齐标题后后续步骤重新可用。
:::

:::exercise
### 练习三：只清空摘要

**要求：** 增加“清空摘要”命令，只替换 draft.summary，不改变模板 ID、revision 或当前步骤。

**完成标准：** 标题、作者、目标读者和当前步骤保持，发布完成度与复核能力根据空摘要更新。
:::

:::exercise
### 练习四：修复错误 key

**要求：** 给定 key={draft.title} 的工作区，解释每次输入为何重建子树，再改成模板 ID 与明确重载版本组成的身份。

**完成标准：** 普通输入和导航保留草稿，切换模板或重新加载才恢复完整初值。
:::

:::exercise
### 练习五：删除流程矛盾

**要求：** 把 isEditing、isReviewing、isCompleted 和 currentStep 四份 State 改成一个 EditorView 判别联合，并重写导航与完成事件。

**完成标准：** 每次只存在编辑某一步或已完成一种合法状态，完成后继续修改返回复核。
:::

## 三十一、本节小结

- 固定步骤、模板和读者选项保持为模块常量。
- 外层会话保存模板 ID 与重载版本，工作区保存统一草稿与判别联合视图。
- 四个字段提升到步骤共同父级，子步骤通过值 Prop 与回调 Prop 接入单一事实来源。
- 草稿字段通过对象展开不可变替换，不修改模板初值。
- 完成度、解锁状态、步骤索引、字符数、读者标签与复核内容全部同步派生。
- 步骤面板可以条件移除，草稿因为位于仍保留的工作区而继续存在。
- 复核和完成视图直接读取当前草稿，不保存同步副本。
- 模板 ID 与明确重载版本构成稳定 key，只在完整编辑身份变化时重建子树。
- 导航、字段修改和继续编辑属于同一次会话，不能改变工作区 key。
- 单字段清空使用局部不可变更新，完整重载才使用 key 重置。

## 三十二、参考资料

- [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
- [`useState`](https://react.dev/reference/react/useState)
- [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
- [Updating Objects in State](https://react.dev/learn/updating-objects-in-state)
- [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state)
- [`<input>`](https://react.dev/reference/react-dom/components/input)
- [`<select>`](https://react.dev/reference/react-dom/components/select)
- [`<textarea>`](https://react.dev/reference/react-dom/components/textarea)
- [Rendering Lists](https://react.dev/learn/rendering-lists)
- [TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
