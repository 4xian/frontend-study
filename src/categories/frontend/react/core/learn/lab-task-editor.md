---
id: react.core.learn.basics.lab-task-editor
type: lesson
title: 实战：任务清单编辑器
summary: 组合事件、useState、State 快照与不可变更新，完成可添加、编辑、筛选和重置的任务清单。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 120
prerequisites:
  - react.core.learn.basics.event-handling
  - react.core.learn.basics.use-state
  - react.core.learn.basics.render-commit-and-state-snapshot
  - react.core.learn.basics.immutable-state-updates
related:
  - react.core.learn.basics.props
  - react.core.learn.basics.list-rendering-and-key
  - react.core.learn.basics.event-handling
  - react.core.learn.basics.use-state
  - react.core.learn.basics.render-commit-and-state-snapshot
tags:
  - React
  - 实战
  - 事件处理
  - useState
  - 不可变更新
  - 任务清单
appliesTo: React 19.2（运行时 19.2.8）
verifiedAt: 2026-08-16
objectives:
  - 能用 Task、TaskFilter 和固定初始数据建立可更新的任务清单。
  - 能用字符串 State 与事件回调完成任务添加、行内编辑、保存和取消。
  - 能用 updater、对象展开、数组展开、map 和 filter 实现不可变增删改。
  - 能用稳定 ID 和 key 保持任务身份，并从完整任务数组计算筛选结果与统计。
  - 能按固定操作序列检查空白输入、取消编辑、筛选、清除与重置结果。
recap:
  - 事件 prop 接收函数，带任务 ID 的操作使用包装函数传参。
  - 每次 render 中的 State 是固定快照，依赖 pending State 的更新使用纯 updater。
  - 对象和数组 State 按只读值处理，变化路径创建新引用，未变化项可以复用。
  - 列表 key 来自任务数据中的稳定 ID，不在 render 中生成。
  - 可见数组、计数和按钮可用状态能从当前 State 计算，不需要同步副本。
  - 添加、编辑、删除、筛选和重置都应有立即可读且可重复的结果。
sources:
  - title: React Responding to Events
    url: https://react.dev/learn/responding-to-events
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 传递事件处理函数、带参数包装函数和自定义 handler prop
  - title: React useState Reference
    url: https://react.dev/reference/react/useState
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - State、setter、pending updater 与纯度要求
  - title: React State as a Snapshot
    url: https://react.dev/learn/state-as-a-snapshot
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 每次 render 的 State 快照与事件处理时机
  - title: React Queueing a Series of State Updates
    url: https://react.dev/learn/queueing-a-series-of-state-updates
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - batching、updater 队列和 pending State
  - title: React Updating Objects in State
    url: https://react.dev/learn/updating-objects-in-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 对象 State 的只读合同与对象展开更新
  - title: React Updating Arrays in State
    url: https://react.dev/learn/updating-arrays-in-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 数组 State 的添加、删除和替换
  - title: React Rendering Lists
    url: https://react.dev/learn/rendering-lists
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 列表转换、稳定 key 与业务 ID
  - title: React input Reference
    url: https://react.dev/reference/react-dom/components/input
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - 文本 value 与同步 onChange 的最小合同
  - title: TypeScript Everyday Types
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
    sourceType: official-reference
    appliesTo: TypeScript
    claims:
      - 对象类型、类型别名和字符串字面量联合
  - title: ECMAScript Array.prototype.filter
    url: https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.filter
    sourceType: specification
    appliesTo: ECMAScript 2026
    claims:
      - filter 根据判断结果构造新数组
  - title: ECMAScript Array.prototype.map
    url: https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.map
    sourceType: specification
    appliesTo: ECMAScript 2026
    claims:
      - map 根据回调结果构造新数组
---

# 实战：任务清单编辑器

## 一、学习目标

- 把任务清单需求拆成数据、State、派生值、组件和事件合同。
- 使用稳定业务 ID 表达任务身份，并把同一个 ID 用作列表 key。
- 用字符串 State 接收新增草稿与编辑草稿，拒绝纯空白标题。
- 使用 updater、数组展开、`map`、`filter` 和对象展开完成不可变增删改。
- 让筛选结果、任务统计、按钮禁用状态始终来自当前任务快照。
- 验证添加、取消、保存、筛选、删除、清除和重置不会互相破坏数据。

## 二、最终成品与功能

要完成的应用是一个内存中的任务清单编辑器。它不只是显示固定任务，还允许用户连续完成以下操作：

1. 输入标题并添加任务。
2. 在同一位置编辑一条任务，选择保存或取消。
3. 切换单条任务的完成状态。
4. 删除指定任务或一次清除全部已完成任务。
5. 在全部、未完成和已完成三个视图之间筛选。
6. 查看基于完整任务数组计算的总计、未完成和已完成数量。
7. 把全部交互状态恢复为固定初始值。

初始数据固定为三条任务：

| ID | 标题 | 状态 |
| ---: | --- | --- |
| `1` | 拆分任务组件 | 未完成 |
| `2` | 实现添加与编辑 | 已完成 |
| `3` | 核对不可变更新 | 未完成 |

因此第一次 render 应显示总计 `3`、未完成 `2`、已完成 `1`，全部视图中的顺序为 `1 -> 2 -> 3`。

## 三、先画清数据与事件流

这个应用的核心链路可以压缩为两条：

```text
用户操作
  -> DOM 事件调用 handler
  -> handler 调用 setter
  -> updater 根据 pending State 返回下一值
  -> React 使用下一 State 重新 render
```

```text
完整 tasks
  -> 按 filter 计算 visibleTasks
  -> map 创建 TaskRow
  -> task.id 同时作为业务参数和稳定 key
```

第一条链路说明更新从哪里开始，第二条链路说明完整数据如何变成当前视图。筛选只影响第二条链路，不能
改写第一条链路中的完整任务集合。

## 四、定义任务、筛选和初始数据

### 1. 任务类型

每条任务只需要稳定身份、标题和完成状态：

```ts
export type Task = {
  readonly id: number
  readonly title: string
  readonly completed: boolean
}
```

`readonly` 表达组件不应直接重写任务字段。它是 TypeScript 的静态约束，不会在浏览器中深冻结对象，
运行时正确性仍来自复制更新。

### 2. 筛选类型

筛选只允许三个值：

```ts
export type TaskFilter = 'all' | 'active' | 'completed'
```

字符串字面量联合让组件不能把任意拼写当作筛选值。运行时仍由三个明确按钮提交这些合法值。

### 3. 固定初始值

```ts
export const INITIAL_TASKS: readonly Task[] = [
  { id: 1, title: '拆分任务组件', completed: false },
  { id: 2, title: '实现添加与编辑', completed: true },
  { id: 3, title: '核对不可变更新', completed: false },
]
```

初始 ID 不依赖数组位置。任务被编辑或筛选后，ID 仍保持不变；标题也不是身份，因为两个任务可以重名。

## 五、确定真正需要的 State

应用使用六份 State，每一份只保存无法从其他值直接计算的信息：

| State | 类型 | 初始值 | 职责 |
| --- | --- | --- | --- |
| `tasks` | `readonly Task[]` | `INITIAL_TASKS` | 保存完整任务集合。 |
| `draft` | `string` | `''` | 保存新增输入框当前文本。 |
| `filter` | `TaskFilter` | `'all'` | 保存当前筛选。 |
| `editingTaskId` | `number \| null` | `null` | 保存当前编辑目标。 |
| `editingDraft` | `string` | `''` | 保存行内编辑框当前文本。 |
| `nextTaskId` | `number` | `4` | 保存下一条任务的稳定 ID。 |

对应初始化如下：

```tsx
const [tasks, setTasks] = useState<readonly Task[]>(INITIAL_TASKS)
const [draft, setDraft] = useState('')
const [filter, setFilter] = useState<TaskFilter>('all')
const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
const [editingDraft, setEditingDraft] = useState('')
const [nextTaskId, setNextTaskId] = useState(4)
```

不要再保存 `visibleTasks`、三个计数、`canAdd` 或 `canSave`。这些值可以从当前快照计算，另存一份只会
增加同步责任。

## 六、从当前快照计算派生结果

### 1. 计算统计和按钮能力

```tsx
const totalCount = tasks.length
const completedCount = tasks.filter((task) => task.completed).length
const activeCount = totalCount - completedCount
const canAdd = draft.trim().length > 0
const canSave = editingDraft.trim().length > 0
```

这些表达式在每次 render 中读取同一组 State 快照，因此结果彼此一致。切换筛选不会改变 `tasks`，三个
计数也不应变化。

### 2. 计算当前可见任务

```tsx
/** 根据当前筛选返回本次 render 需要展示的任务。 */
function filterTasks(tasks: readonly Task[], filter: TaskFilter): readonly Task[] {
  if (filter === 'active') return tasks.filter((task) => !task.completed)
  if (filter === 'completed') return tasks.filter((task) => task.completed)
  return tasks
}

const visibleTasks = filterTasks(tasks, filter)
```

`all` 可以直接复用完整数组；另外两个分支用 `filter` 创建新数组。这个函数只读取输入并返回结果，不
调用 setter，也不修改任务对象。

## 七、拆分组件和函数 Prop

组件树保持短而清楚：

```text
LabTaskEditorDemo
├── TaskComposer
└── TaskList
    └── TaskRow × 当前可见任务数
```

职责分配如下：

| 组件 | 读取什么 | 发出什么动作 |
| --- | --- | --- |
| `LabTaskEditorDemo` | 全部 State | 定义所有更新入口并组装页面。 |
| `TaskComposer` | `draft`、`canAdd` | `onDraftChange`、`onAdd`。 |
| `TaskList` | 可见任务、编辑目标与编辑草稿 | 把行级动作交给对应 `TaskRow`。 |
| `TaskRow` | 一条任务和当前编辑状态 | 切换、开始编辑、保存、取消、删除。 |

`TaskComposer` 的合同可以写成：

```tsx
type TaskComposerProps = {
  draft: string
  canAdd: boolean
  onDraftChange: (value: string) => void
  onAdd: () => void
}
```

函数 Prop 只是普通输入。子组件必须在实际事件发生后调用它，React 不会因为名字以 `on` 开头就自动执行
自定义动作。

## 八、接入最小文本同步

### 1. 新增任务输入

新增输入框的显示值来自 `draft`，每次文本变化把下一字符串交回 setter：

```tsx
<label>
  <span>新任务</span>
  <input
    value={draft}
    onChange={(event) => onDraftChange(event.currentTarget.value)}
  />
</label>
```

输入框从第一次 render 起就接收字符串 `''`，不会在 `undefined` 和字符串之间切换。这里使用的合同只有
两条：`value` 显示当前字符串，`onChange` 同步保存下一字符串。

### 2. 只在确认动作中 trim

输入过程中不要立即 `trim()`：

```tsx
// 不要在每次按键时删除用户仍在编辑的空格。
onChange={(event) => onDraftChange(event.currentTarget.value)}
```

添加或保存时再执行：

```tsx
const title = draft.trim()
if (!title) return
```

这样既能拒绝纯空白标题，也不会打断输入过程。当前编辑器只处理文本值与点击动作，不承担提交、
`FormData` 或多字段校验。

## 九、添加任务并推进稳定 ID

添加操作同时更新任务数组、下一 ID 和新增草稿：

```tsx
/** 把非空草稿作为新任务追加，并推进稳定 ID。 */
function handleAdd() {
  const title = draft.trim()
  if (!title) return

  setTasks((previous) => [
    ...previous,
    { id: nextTaskId, title, completed: false },
  ])
  setNextTaskId((previous) => previous + 1)
  setDraft('')
}
```

这里有三个不同职责：

1. `setTasks` 基于 pending 数组追加完整任务对象。
2. `setNextTaskId` 把下一编号推进一位。
3. `setDraft('')` 清空已经成功使用的输入。

React 会在 handler 结束后处理这些更新。当前 handler 中的 `tasks` 仍是本次 render 的快照，不能在
setter 后读取它并声称已经包含新任务。

空白添加会在任何 setter 之前返回，因此不会新增任务、清空输入或消耗 ID。

## 十、用 map 切换完成状态

切换一条任务时，数组和命中对象都需要新引用：

```tsx
/** 只替换目标任务，并反转它的完成状态。 */
function handleToggle(taskId: number) {
  setTasks((previous) =>
    previous.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    ),
  )
}
```

`map` 创建新数组。命中项通过对象展开保留 `id` 和 `title`，只覆盖 `completed`；未命中任务可以保留
原对象引用。不要先执行 `task.completed = !task.completed`，因为 `task` 仍属于旧 State。

## 十一、实现可取消的行内编辑

### 1. 开始编辑

点击“编辑”时，把任务身份和当前标题复制到独立编辑 State：

```tsx
/** 用目标任务的当前标题进入行内编辑。 */
function handleStartEditing(task: Task) {
  setEditingTaskId(task.id)
  setEditingDraft(task.title)
}
```

`editingDraft` 是暂存输入，不是 canonical 任务标题。用户输入时只改变草稿，因此取消操作可以完整保留
原任务。

### 2. 保存编辑

```tsx
/** 保存非空编辑草稿，并保留目标任务的其他字段。 */
function handleSaveEdit() {
  const title = editingDraft.trim()
  if (editingTaskId === null || !title) return

  setTasks((previous) =>
    previous.map((task) =>
      task.id === editingTaskId ? { ...task, title } : task,
    ),
  )
  setEditingTaskId(null)
  setEditingDraft('')
}
```

保存只替换目标任务的标题，ID、完成状态和数组位置保持不变。之后清空编辑状态，让下一次 render 回到
普通任务行。

### 3. 取消编辑

```tsx
/** 放弃编辑草稿并退出行内编辑。 */
function handleCancelEdit() {
  setEditingTaskId(null)
  setEditingDraft('')
}
```

取消不调用 `setTasks`，所以完整任务数组和所有统计都保持不变。

## 十二、用 filter 删除与批量清除

### 1. 删除指定任务

```tsx
/** 删除目标任务，并清理可能指向它的编辑状态。 */
function handleRemove(taskId: number) {
  setTasks((previous) => previous.filter((task) => task.id !== taskId))

  if (editingTaskId === taskId) {
    setEditingTaskId(null)
    setEditingDraft('')
  }
}
```

`filter` 返回不包含目标的新数组。若目标正处于编辑状态，还要清理悬空的编辑 ID 和草稿。

### 2. 清除全部已完成任务

```tsx
/** 删除全部已完成任务，并退出可能失效的编辑状态。 */
function handleClearCompleted() {
  setTasks((previous) => previous.filter((task) => !task.completed))
  setEditingTaskId(null)
  setEditingDraft('')
}
```

按钮的禁用状态直接来自 `completedCount === 0`。清除不需要遍历可见数组，因为筛选视图不是完整数据源。

## 十三、稳定 key 与筛选身份

`TaskList` 对当前可见任务执行 `map`：

```tsx
<ul>
  {tasks.map((task) => (
    <TaskRow
      key={task.id}
      task={task}
      isEditing={editingTaskId === task.id}
      onToggle={onToggle}
      onRemove={onRemove}
    />
  ))}
</ul>
```

同一个 `task.id` 承担两项相关但不同的职责：

- `key={task.id}` 帮助 React 识别同级列表项。
- `onToggle(task.id)` 等调用把业务目标交给更新函数。

`key` 不会自动成为 `TaskRow` 的普通 Prop，所以组件仍显式接收带 `id` 的 `task`。切换筛选只改变当前
参与 `map` 的数组，不应生成新 ID。

## 十四、重置完整交互状态

重置不是只恢复任务数组。为了让应用回到可预测起点，六份 State 都要恢复：

```tsx
/** 恢复固定任务、筛选、草稿和下一 ID。 */
function handleReset() {
  setTasks(INITIAL_TASKS)
  setDraft('')
  setFilter('all')
  setEditingTaskId(null)
  setEditingDraft('')
  setNextTaskId(4)
}
```

这些值都是固定下一值，不依赖 pending State，因此无需把每个 setter 强行写成 updater。重置后下一次
成功添加仍使用 ID `4`。

## 十五、运行示例

下面的编辑器使用同一组真实源码运行。先完成固定交互，再展开源码对照每个 State 和 handler。

:::demo{id="react.core.learn.basics.lab-task-editor.task-editor-demo"}
:::

建议从重新加载后的初始状态开始，按以下固定顺序观察：

| 步骤 | 操作 | 必须观察到的结果 |
| ---: | --- | --- |
| `0` | 初始加载 | 顺序为 ID `1/2/3`；总计 `3`、未完成 `2`、已完成 `1`；筛选为全部；两个草稿为空。 |
| `1` | 输入三个空格 | “添加任务”保持禁用，任务数和下一 ID 不变。 |
| `2` | 输入 `  整理验收清单  ` 并点击添加 | 新任务标题为去空白后的“整理验收清单”，位于末尾，ID 为 `4` 且未完成；统计为 `4/3/1`，添加框清空。 |
| `3` | 切换 ID `1` 完成状态 | ID `1` 标为已完成；标题、ID、顺序不变；统计为 `4/2/2`。 |
| `4` | 编辑 ID `3`，把草稿改为“这次不保存”，点击取消 | 行退出编辑，原标题仍为“核对不可变更新”，统计不变。 |
| `5` | 再次编辑 ID `3`，输入 `  核对对象与数组更新  `，点击保存 | ID `3` 标题更新并去除首尾空白；ID、完成状态、顺序不变。 |
| `6` | 选择“未完成” | 只显示 ID `3` 和 `4`；统计仍为 `4/2/2`。 |
| `7` | 删除 ID `4` | 未完成筛选只显示 ID `3`；统计为总计 `3`、未完成 `1`、已完成 `2`。 |
| `8` | 选择“已完成” | 只显示 ID `1` 和 `2`，顺序不变。 |
| `9` | 点击“清除已完成” | 已完成筛选显示空结果；完整任务数据只剩 ID `3`；统计为 `1/1/0`，清除按钮禁用。 |
| `10` | 选择“全部” | 只显示已改名的 ID `3`，统计仍为 `1/1/0`。 |
| `11` | 点击“重置清单” | 完整恢复步骤 `0`；ID `4` 数据不存在，下一个成功添加仍应获得 ID `4`。 |

## 十六、易错使用提示

:::pitfalls
### 错误一：在 render 时调用任务动作

**触发条件：** 把 `onClick={removeTask(task.id)}` 写进 JSX。

**原因：** JSX 需要函数值，但这段代码在 render 期间立即调用函数。

**后果：** 任务可能在页面显示前就被删除，或者 `onClick` 得到非函数值。

**错误示例：**

```tsx
<button onClick={removeTask(task.id)}>删除</button>
```

**正确写法：**

```tsx
<button onClick={() => removeTask(task.id)}>删除</button>
```

**验证方式：** render 后任务仍存在，只有点击对应按钮才删除目标 ID。

### 错误二：直接修改任务或数组

**触发条件：** 对 State 中的任务赋值，或调用 `push`、`splice`。

**原因：** 这些写法修改了旧快照拥有的对象或数组。

**后果：** 旧值、当前值和共享引用之间的边界被破坏。

**错误示例：**

```tsx
task.completed = true
tasks.push(nextTask)
```

**正确写法：**

```tsx
setTasks((previous) =>
  previous.map((task) =>
    task.id === taskId ? { ...task, completed: true } : task,
  ),
)
```

**验证方式：** 新旧数组引用不同，目标任务引用变化，未命中任务可保持原引用。

### 错误三：在 updater 内执行其他更新

**触发条件：** 在 `setTasks` updater 内调用 `setDraft` 或写入外部值。

**原因：** updater 应只读取参数并返回下一任务数组。

**后果：** updater 不再纯，开发检查可能暴露重复副作用。

**错误示例：**

```tsx
setTasks((previous) => {
  setDraft('')
  return [...previous, nextTask]
})
```

**正确写法：**

```tsx
setTasks((previous) => [...previous, nextTask])
setDraft('')
```

**验证方式：** updater 内只有纯数组计算，草稿清理在 handler 的独立语句中。

### 错误四：使用索引、标题或随机值作为 key

**触发条件：** 写 `key={index}`、`key={task.title}` 或 `key={Math.random()}`。

**原因：** 索引会随删除和筛选位置变化，标题可能重复或被编辑，随机值每次 render 都变化。

**后果：** React 无法稳定识别同一任务行，行内编辑状态可能对应错误项或被重建。

**错误示例：**

```tsx
tasks.map((task, index) => <TaskRow key={index} task={task} />)
```

**正确写法：**

```tsx
tasks.map((task) => <TaskRow key={task.id} task={task} />)
```

**验证方式：** 编辑标题、删除前项和切换筛选后，同一任务继续使用创建时的 ID。

### 错误五：在每次输入时 trim

**触发条件：** `onChange` 直接保存 `event.currentTarget.value.trim()`。

**原因：** 用户还在编辑时就删除首尾空格。

**后果：** 输入值与用户操作不一致，光标和临时文本体验不稳定。

**错误示例：**

```tsx
onChange={(event) => setDraft(event.currentTarget.value.trim())}
```

**正确写法：**

```tsx
onChange={(event) => setDraft(event.currentTarget.value)}
```

**验证方式：** 输入过程保留原文本，只有点击添加或保存时才归一化标题。

### 错误六：直接修改任务标题作为编辑草稿

**触发条件：** 每次编辑框变化都对 `tasks` 执行 `map` 并覆盖标题。

**原因：** canonical 标题与尚未确认的输入混在一起。

**后果：** 点击取消时没有旧标题可以恢复。

**错误示例：**

```tsx
onChange={(event) => renameTask(task.id, event.currentTarget.value)}
```

**正确写法：**

```tsx
onChange={(event) => setEditingDraft(event.currentTarget.value)}
```

**验证方式：** 修改草稿后点击取消，任务标题与进入编辑前完全一致。

### 错误七：把筛选数组或计数再存成 State

**触发条件：** 同时保存 `tasks`、`visibleTasks`、`activeCount` 和 `completedCount`。

**原因：** 后三者都能从完整任务数组和当前筛选计算。

**后果：** 每个更新都要维护多份副本，遗漏任一 setter 就会出现矛盾结果。

**错误示例：**

```tsx
const [completedCount, setCompletedCount] = useState(1)
```

**正确写法：**

```tsx
const completedCount = tasks.filter((task) => task.completed).length
```

**验证方式：** 添加、切换、删除、清除和重置后，统计都由当前任务数组自动得到。
:::

## 十七、原理与适用边界

### 1. 判断一次操作是否完整

每个 handler 都可以按同一组问题检查：

1. 事件是否只在用户操作后发生？
2. 目标任务是否由稳定 ID 指定？
3. 下一数组是否依赖 pending State？依赖时是否使用 updater？
4. 是否直接修改了旧任务或旧数组？
5. 命中任务是否创建新对象，未命中任务是否允许复用？
6. 编辑草稿是否与 canonical 标题分离？
7. 筛选和统计是否从完整任务快照计算？
8. 删除、清除或重置后是否留下悬空编辑状态？

### 2. 当前方案适合什么范围

这套结构适合纯客户端、内存内、组件层级很浅的任务编辑器。更新入口数量有限，`useState` 与明确的
handler 已能直接表达行为，Props 和回调也能清楚连接组件。

本项目不处理网络、持久化、跨页面共享、撤销栈、拖拽、复杂校验或外部系统同步。加入这些职责时，
状态形状、更新协议和所有权范围都需要重新设计，不能直接把当前示例无限扩张。

### 3. 小数据不需要提前优化

三个统计值和三种筛选只遍历一个很短的数组，当前没有测量结果证明需要缓存。先保证数据来源唯一、更新
正确、结果可读，再根据真实测量决定是否增加优化。

## 十八、练习

:::exercise
### 扩展并验证任务清单

**要求：** 在不增加新 React API 的前提下，为编辑器增加“恢复 ID `2` 为未完成”的固定操作。继续使用
稳定 ID、任务数组 updater、`map` 与对象展开；不要修改旧任务，不要新增统计 State。再找出一段同时使用
`push`、索引 key 和冗余 `completedCount` State 的错误代码，并分别改正。

**完成标准：** 恢复 ID `2` 后，总计仍为 `3`、未完成变为 `3`、已完成变为 `0`；未完成筛选显示
`1 -> 2 -> 3`，已完成筛选显示空结果；清除已完成按钮禁用；重置后恢复初始 `3 / 2 / 1`。能说明
updater、`map`、对象展开、稳定 key 和派生统计各自解决的问题。
:::

## 十九、本节小结

- 先固定任务数据、State、派生值和事件合同，再组装组件。
- 任务 ID 在创建时写入数据，编辑、筛选和删除都不改变它。
- 事件 handler 负责发起更新，当前 handler 读取的 State 仍是本次 render 快照。
- 基于 pending 任务数组的添加、切换、保存、删除和清除使用纯 updater。
- 数组展开负责添加，`map` 负责替换，`filter` 负责删除；目标对象用展开创建下一值。
- 新增草稿和编辑草稿分别保存，取消编辑不会污染 canonical 任务标题。
- 可见任务、三个计数和按钮能力从当前 State 计算，不保存同步副本。
- 筛选只改变视图，清除改变完整任务数组，重置恢复全部交互状态。

## 二十、参考资料

- [Responding to Events](https://react.dev/learn/responding-to-events) - handler 传递、带参数包装与自定义事件 Prop。
- [`useState`](https://react.dev/reference/react/useState) - State、setter、pending updater 与纯度要求。
- [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) - render 快照和事件处理中的旧值读取。
- [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) - batching 与 updater 队列。
- [Updating Objects in State](https://react.dev/learn/updating-objects-in-state) - 对象只读合同与展开更新。
- [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state) - 添加、删除、替换和数组方法选择。
- [Rendering Lists](https://react.dev/learn/rendering-lists) - `map`、稳定 ID 与 `key` 规则。
- [`<input>`](https://react.dev/reference/react-dom/components/input) - 文本 `value` 与同步 `onChange` 的最小合同。
- [TypeScript Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) - 对象类型、类型别名与字符串字面量联合。
- [ECMAScript `filter`](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.filter) 与 [`map`](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.map) - 新数组构造语义。
