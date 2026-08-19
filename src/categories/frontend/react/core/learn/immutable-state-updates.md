---
id: react.core.learn.basics.immutable-state-updates
type: lesson
title: State 的不可变更新
summary: 把对象和数组 State 当作只读快照，只复制变化路径并提交下一状态。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 135
prerequisites:
  - react.core.learn.basics.render-commit-and-state-snapshot
related:
  - react.core.learn.basics.component-purity
  - react.core.learn.basics.list-rendering-and-key
  - react.core.learn.intermediate.state-structure
tags:
  - React
  - State
  - immutability
  - object
  - array
  - structural sharing
appliesTo: React 19.2（运行时 19.2.8）
verifiedAt: 2026-08-16
objectives:
  - 能解释为什么对象和数组进入 State 后应按只读快照处理。
  - 能区分新外层容器、变化路径上的新引用和未变化分支的结构共享。
  - 能用对象展开更新顶层与嵌套字段，并正确处理展开顺序。
  - 能按添加、删除、替换、插入、排序和反转意图选择数组操作。
  - 能准确区分 slice、splice、toSpliced 及其返回值。
  - 能在数组对象元素更新时同时创建新数组和新的目标对象。
  - 能判断何时使用纯 updater，以及哪些局部变异不会破坏旧 State。
recap:
  - 不可变更新要求不改写旧 State，不要求递归冻结或深复制所有值。
  - useState setter 替换整个值；对象和数组的保留部分需要显式带入下一状态。
  - 对象展开和数组 copying 操作都是浅复制，嵌套引用不会自动复制。
  - 对象展开时后写属性覆盖先写属性；嵌套更新要从修改点向外逐层复制。
  - 数组添加常用展开或 concat，删除用 filter，替换用 map，插入用 slice 与展开。
  - sort、reverse 和 splice 会修改调用数组，只能作用于明确的新局部副本。
  - toSorted、toReversed、toSpliced 和 with 返回新数组，但仍不深复制对象元素。
  - 未变化分支可以保留引用；变化路径上的每个对象或数组都需要新引用。
sources:
  - title: React Updating Objects in State
    url: https://react.dev/learn/updating-objects-in-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 对象 State 的只读合同、浅复制和嵌套路径更新
      - 新建局部对象允许局部修改
  - title: React Updating Arrays in State
    url: https://react.dev/learn/updating-arrays-in-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 数组增删改、插入、排序、反转和对象元素更新
  - title: React State as a Snapshot
    url: https://react.dev/learn/state-as-a-snapshot
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - State 值属于一次 render 快照
  - title: React useState Reference
    url: https://react.dev/reference/react/useState
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - setter 替换、Object.is 比较和纯 updater
  - title: Components and Hooks must be pure
    url: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Props 与 State 的不可变快照边界
      - 局部创建值的修改边界
  - title: MDN Spread syntax
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    sourceType: official-reference
    appliesTo: ECMAScript
    claims:
      - 对象与数组展开的浅复制和覆盖顺序
  - title: MDN Array Reference
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
    sourceType: official-reference
    appliesTo: ECMAScript
    claims:
      - 原地方法、复制方法与浅复制边界
  - title: MDN slice and splice
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
    sourceType: official-reference
    appliesTo: ECMAScript
    claims:
      - slice 的非变异切片语义
      - 与 splice、toSpliced 的区别
  - title: MDN Array copying methods
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted
    sourceType: official-reference
    appliesTo: ECMAScript
    claims:
      - toSorted、toReversed、toSpliced 与 with 的复制语义
---

# State 的不可变更新

## 一、学习目标

- 理解 JavaScript 值可以变异，但已进入 State 的对象和数组应视为只读快照。
- 能根据实际变化路径判断哪些引用必须更新、哪些引用可以复用。
- 掌握对象顶层更新、展开顺序、嵌套逐层复制、删除可选字段和完整替换。
- 掌握数组添加、删除、替换、插入、排序和反转的常用不可变写法。
- 准确区分相似数组方法的修改行为与返回值。
- 能正确更新数组中的对象和更深层字段，不用深克隆替代路径分析。
- 能从代码、引用关系和界面结果判断一次更新是否保持了旧 State。

## 二、为什么 State 更新不能直接修改对象或数组

### 1. JavaScript 允许变异

对象属性赋值和数组原地方法都是合法的 JavaScript：

```tsx
const profile = { name: 'Ada' }
profile.name = 'Lin'

const topics = ['Props', 'State']
topics.push('Array')
```

两段代码都改变了原来的值。变量 `profile` 仍指向同一个对象，`topics` 仍指向同一个数组，只是容器内部
的数据发生了变化。

### 2. State 是一次 Render 的只读快照

对象或数组进入 State 后，会成为某次 render 读取的值。事件处理器、局部计算和 JSX 都可能继续引用这份
快照。直接修改它，会把已经存在的旧快照事后改写：

```tsx
// 错误：修改当前 State 对象。
profile.name = 'Lin'
setProfile(profile)

// 错误：修改当前 State 数组。
tasks.push(nextTask)
setTasks(tasks)
```

setter 接收到的还是原引用。React 使用 `Object.is` 比较前后 State 时，可能把它们判断为相同值并跳过
更新。即使界面因其他更新碰巧刷新，旧快照和共享引用也已经被污染。

### 3. 正确模型是从旧值计算新值

不可变更新不修改旧 State，而是创建下一状态：

```text
旧 State S0（只读）
       |
       v
创建新的外层对象或数组
       |
       v
只复制实际发生变化的访问路径
       |
       v
setter 提交下一 State S1
```

这是一条写入纪律，不是运行时深冻结。React 不要求所有后代引用都变化，也不要求递归复制整个数据树。

## 三、引用、浅复制与结构共享

### 1. 新容器不等于新内容

对象展开会创建新的外层对象：

```tsx
const previous = {
  name: 'Ada',
  preferences: { theme: 'light' },
}

const next = { ...previous }

console.log(next !== previous) // true
console.log(next.preferences === previous.preferences) // true
```

数组展开也只创建新的外层数组：

```tsx
const previous = [{ id: 1, done: false }]
const next = [...previous]

console.log(next !== previous) // true
console.log(next[0] === previous[0]) // true
```

展开复制的是属性值或元素值。值如果是对象引用，复制后仍然指向同一对象。因此对象展开、数组展开、
`concat`、`slice`、`map`、`filter` 和现代 copying methods 都不是递归深克隆。

### 2. 只复制变化路径

假设只修改 `profile.preferences.theme`，需要新的根对象和新的 `preferences`：

```tsx
const nextProfile = {
  ...profile,
  preferences: {
    ...profile.preferences,
    theme: 'dark',
  },
}
```

没有变化的字段可以直接复用：

```tsx
console.log(nextProfile !== profile) // true
console.log(nextProfile.preferences !== profile.preferences) // true
console.log(nextProfile.permissions === profile.permissions) // true
```

这种“变化路径创建新引用，未变化分支复用旧引用”的方式叫结构共享。它同时保留旧 State，又避免无意义地
复制所有数据。

### 3. 新建局部值可以先修改

禁止的是修改已经来自 State、Props 或 updater 参数的旧值。刚创建且尚未共享的局部副本可以修改：

```tsx
setProfile((previous) => {
  const next = { ...previous }
  delete next.note
  return next
})
```

`next` 是本次更新内部新建的对象。删除发生在新副本上，不会改写 `previous`。

## 四、更新对象 State

### 1. Setter 替换整个对象

`useState` setter 不会像类组件的旧式 `setState` 那样自动浅合并对象。下面的调用会让下一 State 只包含
`name`：

```tsx
type Profile = {
  name: string
  role: string
}

// 错误：role 不会自动保留。
setProfile({ name: 'Lin' } as Profile)
```

局部字段更新需要显式保留其他字段：

```tsx
setProfile((previous) => ({
  ...previous,
  name: 'Lin',
}))
```

如果下一对象已经完整确定，就可以直接提交完整对象，不必展开旧值：

```tsx
setProfile({
  name: 'Grace',
  role: 'Reviewer',
})
```

### 2. 展开顺序决定最终值

对象属性按书写顺序应用，同名属性以后写值为准：

```tsx
// 正确：新 name 在后面，覆盖旧 name。
const renamed = { ...profile, name: 'Lin' }

// 错误：旧 profile 在后面，把 Lin 覆盖掉。
const unchanged = { name: 'Lin', ...profile }
```

多个来源合并时同样遵循后写覆盖：

```tsx
const next = {
  ...defaults,
  ...savedProfile,
  theme: 'dark',
}
```

最终 `theme` 一定来自最后一行；其他同名字段由 `savedProfile` 覆盖 `defaults`。

### 3. 基于旧值时使用 Updater

切换、累加或保留旧字段时，下一对象依赖 pending State，使用纯 updater：

```tsx
setProfile((previous) => ({
  ...previous,
  online: !previous.online,
}))
```

updater 只能读取 `previous` 并返回下一值。不能先修改 `previous`，也不能在其中写存储、发送请求或改变
外部变量。

### 4. 计算属性名只更新受控字段

计算属性名适合多个已知字段共享一个更新入口：

```tsx
type EditableField = 'name' | 'role'

/** 更新一个允许编辑的顶层字段。 */
function updateProfileField(field: EditableField, value: string) {
  setProfile((previous) => ({
    ...previous,
    [field]: value,
  }))
}
```

`[field]` 会先计算属性名。字段类型应限制为已知集合，避免任意字符串静默创建拼写错误的属性。

### 5. 删除可选字段与设值不同

删除字段、设为 `undefined` 和设为空字符串是三种不同的数据形状：

```tsx
type Profile = {
  name: string
  note?: string
}

setProfile((previous) => {
  const next = { ...previous }
  delete next.note
  return next
})
```

删除后，`'note' in next` 为 `false`。若执行 `{ ...previous, note: undefined }`，属性仍然存在，只是值为
`undefined`。TypeScript 中使用 `delete` 的属性应声明为可选字段。

## 五、更新嵌套对象

### 1. 从最深修改点向外复制

```tsx
type Board = {
  name: string
  preferences: {
    theme: 'light' | 'dark'
    density: 'normal' | 'compact'
  }
}
```

修改 `preferences.theme` 时，先构造下一 `preferences`，再让下一 `board` 指向它：

```tsx
setBoard((previous) => ({
  ...previous,
  preferences: {
    ...previous.preferences,
    theme: previous.preferences.theme === 'light' ? 'dark' : 'light',
  },
}))
```

两层展开承担不同职责：

1. 内层展开保留 `density`，并创建新的 `preferences`。
2. 外层展开保留 `name` 等根字段，并创建新的 `board`。
3. 最后的 `theme` 覆盖旧主题。

### 2. 只复制外层仍会修改旧嵌套对象

```tsx
// 错误：next.preferences 与 previous.preferences 仍是同一对象。
setBoard((previous) => {
  const next = { ...previous }
  next.preferences.theme = 'dark'
  return next
})
```

外层引用虽然变化，属性赋值仍发生在共享的 `preferences` 上。判断更新是否安全，不能只比较根对象；还要
沿实际修改路径检查每一层引用。

### 3. 共享引用从所有路径可见

```tsx
const preferences = { theme: 'light' as const }
const first = { name: 'Ada', preferences }
const second = { name: 'Lin', preferences }
```

`first.preferences` 与 `second.preferences` 指向同一个对象。直接改写其中一条路径会影响另一条路径观察到的
值。共享引用本身没有问题；修改已经共享的旧对象才会破坏不可变合同。

## 六、按操作意图选择数组方法

### 1. 原地方法与复制方法

数组同时提供两类方法。选择前要确认“是否修改调用数组”和“返回什么”：

| 操作意图 | 不直接作用于旧 State | 常用不可变写法 | 现代复制写法 |
| --- | --- | --- | --- |
| 末尾或开头添加 | `push`、`unshift` | 数组展开、`concat` | `toSpliced` 可表达任意位置插入 |
| 末尾或开头删除 | `pop`、`shift` | `slice`、`filter` | `toSpliced` |
| 任意位置增删改 | `splice` | `slice` 与展开、`map` | `toSpliced`、`with` |
| 排序 | `sort` | 先复制再 `sort` | `toSorted` |
| 反转 | `reverse` | 先复制再 `reverse` | `toReversed` |

表中“不直接作用于旧 State”不等于这些方法永远不能出现。只要先创建一个尚未共享的新副本，就可以在
副本上使用原地方法，再返回它。

### 2. 新数组仍是浅复制

无论使用展开、传统非变异方法还是现代 copying method，都要继续检查对象元素：

```tsx
const next = tasks.toReversed()

console.log(next !== tasks) // true
console.log(next[0] === tasks[tasks.length - 1]) // true
```

顺序变化了，任务对象本身没有被复制。

## 七、添加、删除和替换数组元素

### 1. 添加到末尾或开头

```tsx
setTasks((previous) => [...previous, nextTask])
setTasks((previous) => [nextTask, ...previous])
```

展开位置决定新元素的位置。`concat` 也返回新数组：

```tsx
setTasks((previous) => previous.concat(nextTask))
```

一次合并多个数组时，每个元素仍按引用复制：

```tsx
setTasks((previous) => [...previous, ...incomingTasks])
```

如果外部代码仍会修改 `incomingTasks` 中的对象，需要先明确对象所有权；展开不会自动隔离这些对象。

### 2. 用 Filter 删除

`filter` 回调返回 truthy 表示保留元素：

```tsx
/** 删除指定 ID 的任务。 */
function removeTask(removedId: number) {
  setTasks((previous) => previous.filter((task) => task.id !== removedId))
}
```

条件读作“保留 ID 不等于待删除 ID 的任务”。按一类条件删除时同样写保留条件：

```tsx
setTasks((previous) => previous.filter((task) => !task.done))
```

### 3. 用 Map 替换或转换

`map` 为每个元素计算结果并返回新数组。更新一个对象元素时，目标对象也要创建新引用：

```tsx
/** 切换指定任务的完成状态。 */
function toggleTask(changedId: number) {
  setTasks((previous) =>
    previous.map((task) =>
      task.id === changedId ? { ...task, done: !task.done } : task,
    ),
  )
}
```

未命中的任务没有变化，可以返回原对象。转换所有原始值也适合使用 `map`：

```tsx
setScores((previous) => previous.map((score) => Math.min(score + 1, 100)))
```

带花括号的箭头函数体必须显式 `return`；只有表达式体会隐式返回。

## 八、插入以及 Slice、Splice、toSpliced

### 1. 用 Slice 切分前后片段

`slice(start, end)` 返回 `[start, end)` 区间的浅副本，不修改原数组：

```tsx
/** 在指定位置插入任务。 */
function insertTask(insertAt: number, nextTask: Task) {
  setTasks((previous) => [
    ...previous.slice(0, insertAt),
    nextTask,
    ...previous.slice(insertAt),
  ])
}
```

第一段不包含 `insertAt`，第二段从 `insertAt` 开始，因此新元素位于两段之间。

### 2. 三个相似名称的准确区别

| 方法 | 是否修改调用数组 | 返回值 |
| --- | --- | --- |
| `slice(start, end)` | 否 | 选定区间的浅副本 |
| `splice(start, count, ...items)` | 是 | 被删除元素组成的新数组 |
| `toSpliced(start, count, ...items)` | 否 | 完成增删改后的完整新数组 |

下面的代码同时犯了两个错误：旧 State 被修改，setter 收到的还是被删除项：

```tsx
// 错误：removed 不是更新后的完整数组。
const removed = tasks.splice(1, 1)
setTasks(removed)
```

现代写法可以直接返回完整新数组：

```tsx
setTasks((previous) => previous.toSpliced(1, 0, nextTask))
setTasks((previous) => previous.toSpliced(1, 1))
```

### 3. 用 With 替换一个索引

`with(index, value)` 返回指定索引已替换的新数组：

```tsx
setTasks((previous) => previous.with(index, replacementTask))
```

它支持负索引，例如 `with(-1, replacement)` 替换最后一项。索引超出有效范围会抛出 `RangeError`，不能
用它扩展数组。`replacementTask` 仍由调用方负责；`with` 不会深复制该对象。

## 九、排序与反转

### 1. Sort 和 Reverse 会修改调用数组

直接对旧 State 调用会改变旧快照：

```tsx
// 错误：sort 修改 tasks。
setTasks(tasks.sort((a, b) => a.priority - b.priority))

// 错误：reverse 修改 tasks。
setTasks(tasks.reverse())
```

可以先创建新数组，再修改这个局部副本：

```tsx
setTasks((previous) =>
  [...previous].sort((a, b) => a.priority - b.priority || a.id - b.id),
)

setTasks((previous) => [...previous].reverse())
```

### 2. 现代复制方法

```tsx
setTasks((previous) =>
  previous.toSorted((a, b) => a.priority - b.priority || a.id - b.id),
)

setTasks((previous) => previous.toReversed())
```

`toSorted` 和 `toReversed` 不修改调用数组。它们仍然只复制数组容器，不复制任务对象。

### 3. 数值排序必须提供比较函数

没有比较函数时，`sort()` 和 `toSorted()` 默认按字符串的 UTF-16 code unit 顺序比较：

```tsx
const scores = [2, 10, 1]

console.log(scores.toSorted()) // [1, 10, 2]
console.log(scores.toSorted((a, b) => a - b)) // [1, 2, 10]
```

比较函数返回负数时 `a` 排在 `b` 前，返回正数时 `a` 排在 `b` 后，返回 `0` 时两者保持相对顺序。业务
排序通常还应提供稳定的次级字段，使相同主排序值的结果可预测。

## 十、更新数组中的对象

### 1. 只复制数组仍然不够

```tsx
const next = [...tasks]
next[0].done = true // 错误：next[0] 与 tasks[0] 是同一对象。
setTasks(next)
```

正确写法同时创建新数组和新的目标对象：

```tsx
setTasks((previous) =>
  previous.map((task) =>
    task.id === changedId ? { ...task, done: true } : task,
  ),
)
```

### 2. 对象内部还有嵌套层时继续复制

```tsx
type Task = {
  id: number
  title: string
  details: {
    priority: 1 | 2 | 3
    owner: string
  }
}
```

更新 `details.priority` 需要新数组、新目标任务和新 `details`：

```tsx
setTasks((previous) =>
  previous.map((task) =>
    task.id === changedId
      ? {
          ...task,
          details: {
            ...task.details,
            priority: 1,
          },
        }
      : task,
  ),
)
```

未命中的任务和目标任务中未变化的 `owner` 值都可以保留。

### 3. Map 和 Filter 不会约束回调内部

方法本身返回新数组，不代表回调中的任何写法都安全：

```tsx
// 错误：map 返回新数组，但回调修改了旧任务对象。
setTasks((previous) =>
  previous.map((task) => {
    if (task.id === changedId) task.done = true
    return task
  }),
)
```

`filter` 回调也不应修改元素。回调是普通 JavaScript 函数，仍要遵守旧 State 只读合同。

## 十一、同一 State 中的对象与数组

### 1. 每条更新路径都从根开始

当一个 State 同时包含名称、偏好和任务数组时，修改任务需要创建新的根对象和新的任务数组：

```tsx
type BoardState = {
  name: string
  preferences: {
    compact: boolean
  }
  tasks: Task[]
}

setBoard((previous) => ({
  ...previous,
  tasks: previous.tasks.map((task) =>
    task.id === changedId ? { ...task, done: !task.done } : task,
  ),
}))
```

这次更新可以复用 `previous.preferences`，因为该分支没有变化。若切换 `compact`，则创建新的根对象和新的
`preferences`，同时复用 `tasks`。

### 2. 重置应创建完整新值

初始化工厂可以保证每次重置都得到独立对象：

```tsx
/** 创建独立的初始清单状态。 */
function createInitialBoard(): BoardState {
  return {
    name: '学习清单',
    preferences: { compact: false },
    tasks: initialTasks.map((task) => ({ ...task })),
  }
}

const [board, setBoard] = useState<BoardState>(createInitialBoard)

/** 恢复完整初始状态。 */
function handleReset() {
  setBoard(createInitialBoard())
}
```

传给 `useState` 的函数是 initializer；传给 setter 的函数会被解释为 updater。因此重置时应主动调用工厂，
写成 `setBoard(createInitialBoard())`。

## 十二、TypeScript 的只读辅助

### 1. Readonly 和 readonly 数组是静态约束

TypeScript 可以在编译期阻止一部分直接写入：

```tsx
type Profile = Readonly<{
  name: string
  preferences: {
    theme: 'light' | 'dark'
  }
}>

const tasks: readonly Task[] = initialTasks
```

`Readonly<T>` 和 `readonly Task[]` 不会在运行时冻结对象，而且默认都是浅层约束。上例禁止重新赋值
`profile.name`，但不会自动把 `profile.preferences.theme` 变成深层只读。

### 2. 类型不能修复运行时数据

```tsx
// 错误：断言不会补回缺失字段。
setProfile({ name: 'Lin' } as Profile)
```

类型断言只改变静态检查结果，不会自动合并旧字段或创建缺失数据。不可变更新的正确性仍由实际创建的下一
对象或数组决定。

## 十三、运行示例

下面的示例使用一个对象 State 同时保存清单名称、嵌套偏好和任务数组。每个按钮只改变对应路径，并保留
其他分支。

:::demo{id="react.core.learn.basics.immutable-state-updates.immutable-state-demo"}
:::

可以分别观察：

1. 切换名称只替换根对象的 `name`。
2. 切换紧凑模式逐层复制 `preferences`，任务数组保持不变。
3. 添加和插入创建新数组并保留原任务。
4. 切换首项使用 `map`，只替换目标任务对象。
5. 删除使用 `filter` 保留未完成任务。
6. 排序使用 `toSorted`，反转只修改刚创建的新副本。
7. 重置通过工厂恢复一整套独立初始值。

## 十四、易错使用提示

:::pitfalls
### 错误一：修改旧对象或数组后传回同一引用

**触发条件：** 对 State 属性赋值，或直接调用 `push`、`splice` 等原地方法，再把原值传给 setter。

**原因：** 当前 State 是只读快照，setter 收到的前后引用还可能被 `Object.is` 判断为相同。

**后果：** 更新可能被跳过，旧快照和共享引用也会被污染。

**错误示例：**

```tsx
tasks.push(nextTask)
setTasks(tasks)
```

**正确写法：**

```tsx
setTasks((previous) => [...previous, nextTask])
```

**验证方式：** 更新后新旧数组引用不同，旧数组的长度和内容保持不变。

### 错误二：期待 Setter 自动合并对象字段

**触发条件：** 只传入一个变化字段，期望其他字段自动保留。

**原因：** useState setter 替换整个值，不自动浅合并对象。

**后果：** 未写入下一对象的字段消失。

**错误示例：**

```tsx
setProfile({ name: 'Lin' } as Profile)
```

**正确写法：**

```tsx
setProfile((previous) => ({ ...previous, name: 'Lin' }))
```

**验证方式：** 更新名称后，角色、偏好等未修改字段仍存在。

### 错误三：把覆盖字段写在对象展开之前

**触发条件：** 写成 `{ name: 'Lin', ...previous }`。

**原因：** 后写的同名属性覆盖先写属性，旧 `name` 位于后面。

**后果：** 目标字段仍是旧值，看起来像更新没有生效。

**错误示例：**

```tsx
setProfile((previous) => ({ name: 'Lin', ...previous }))
```

**正确写法：**

```tsx
setProfile((previous) => ({ ...previous, name: 'Lin' }))
```

**验证方式：** 检查需要覆盖的字段是否写在旧对象展开之后。

### 错误四：只复制最外层容器

**触发条件：** 展开根对象或数组后，直接修改其中仍然共享的嵌套对象。

**原因：** 展开是浅复制，嵌套对象引用没有自动变化。

**后果：** 旧 State 的嵌套数据被修改，其他共享路径也会变化。

**错误示例：**

```tsx
const next = { ...profile }
next.preferences.theme = 'dark'
setProfile(next)
```

**正确写法：**

```tsx
setProfile((previous) => ({
  ...previous,
  preferences: { ...previous.preferences, theme: 'dark' },
}))
```

**验证方式：** 根对象与变化路径上的嵌套对象引用都应变化，未变化分支可保持原引用。

### 错误五：混淆 Slice、Splice 与 toSpliced

**触发条件：** 在旧 State 上调用 `splice`，或把它的返回值当成更新后的完整数组。

**原因：** `splice` 原地修改并返回删除项；`slice` 返回区间副本；`toSpliced` 返回完整新数组。

**后果：** 旧数组被修改，下一 State 还可能只剩被删除的元素。

**错误示例：**

```tsx
setTasks(tasks.splice(1, 1))
```

**正确写法：**

```tsx
setTasks((previous) => previous.toSpliced(1, 1))
```

**验证方式：** 删除后只缺少目标元素，旧数组和其他元素顺序保持不变。

### 错误六：Filter 条件表达成删除条件

**触发条件：** 把回调返回 `true` 理解为删除当前元素。

**原因：** `filter` 保留回调结果为 truthy 的元素。

**后果：** 待删除元素被保留，其他元素反而消失。

**错误示例：**

```tsx
setTasks((previous) => previous.filter((task) => task.id === removedId))
```

**正确写法：**

```tsx
setTasks((previous) => previous.filter((task) => task.id !== removedId))
```

**验证方式：** 先把条件读成“保留 ID 不等于 removedId 的任务”。

### 错误七：Map 创建新数组后直接修改对象元素

**触发条件：** `map` 回调修改 `task.done`，然后返回原任务对象。

**原因：** `map` 只创建新数组，不会复制对象元素，也不会限制回调中的写入。

**后果：** 旧数组中的任务对象被修改。

**错误示例：**

```tsx
setTasks((previous) =>
  previous.map((task) => {
    if (task.id === changedId) task.done = true
    return task
  }),
)
```

**正确写法：**

```tsx
setTasks((previous) =>
  previous.map((task) =>
    task.id === changedId ? { ...task, done: true } : task,
  ),
)
```

**验证方式：** 新旧数组引用不同，新旧目标任务引用也不同，未命中任务可保持原引用。

### 错误八：直接排序或反转旧数组

**触发条件：** 对 State 数组调用 `sort()` 或 `reverse()`。

**原因：** 两个方法都修改调用数组并返回同一引用。

**后果：** 当前快照与保存的旧顺序一起变化。

**错误示例：**

```tsx
setTasks(tasks.reverse())
```

**正确写法：**

```tsx
setTasks((previous) => [...previous].reverse())
```

**验证方式：** 反转后新数组顺序变化，操作前保存的旧数组仍保持原顺序。
:::

## 十五、原理与适用场景

### 1. 直接判断复制范围

每次更新按下面的顺序判断：

1. 下一值是完整替换，还是需要保留旧值的一部分？
2. 实际变化位于哪条属性或索引路径？
3. 这条路径上的哪些对象或数组已经属于旧 State？
4. 为这些容器逐层创建新引用，并复用没有变化的分支。
5. 使用的方法是否修改调用数组，返回值是否真的是完整下一数组？
6. 数组元素是原始值还是对象？对象元素的目标路径是否也已复制？
7. 下一值是否依赖 pending State？依赖时使用纯 updater。

### 2. 不需要深复制所有数据

不可变更新的目标是保留旧值，而不是让所有引用都不同。无差别深复制会丢失结构共享，还会掩盖“究竟哪条
路径发生变化”的判断。正确做法是精确复制变化路径。

### 3. 方法名称不能代替数据所有权判断

`map`、`filter`、`concat` 和 copying methods 能保证新数组容器，却不能保证对象元素也独立。反过来，
`sort`、`reverse` 和 `splice` 虽然是原地方法，但可以安全地作用于本次更新刚创建、尚未共享的局部副本。
关键不是简单记忆“允许或禁止”的名单，而是确认被修改的值是否仍属于旧 State。

## 十六、练习

:::exercise
### 完成清单状态的不可变更新

**要求：** 定义一个包含 `name`、`preferences.compact` 和 `tasks` 的对象 State。任务包含 `id`、`title`、
`done` 与嵌套 `details.priority`。实现名称切换、紧凑模式切换、末尾添加、第二位插入、按 ID 删除、切换完成
状态、修改优先级、排序、反转和完整重置。禁止修改旧根对象、旧数组、旧任务或旧 `details`。

**完成标准：** 每次操作都能指出变化路径上的新引用；未变化分支保留原值；插入顺序正确；删除只移除目标；
排序按优先级和 ID 稳定完成；反转不改变旧数组；重置生成完整独立初始值。能解释每次选择展开、`slice`、
`filter`、`map`、`toSorted` 或新副本 `reverse` 的原因。
:::

## 十七、本节小结

- 对象和数组进入 State 后应视为只读快照，更新时创建下一值。
- setter 替换整个 State；需要保留的字段或元素必须显式写入下一状态。
- 展开和数组复制方法只创建浅副本，不会递归复制嵌套对象。
- 对象顶层更新先展开旧值再写覆盖字段；嵌套更新从修改点向外逐层复制。
- 结构共享允许未变化分支保留引用，不可变更新不等于深复制一切。
- 添加用展开或 `concat`，删除用 `filter`，替换用 `map`，插入用 `slice` 与展开。
- `splice`、`sort` 和 `reverse` 修改调用数组，只能作用于明确的新局部副本。
- `toSorted`、`toReversed`、`toSpliced` 和 `with` 返回新数组，但对象元素仍可能共享。
- 更新数组中的对象时，新数组和目标对象都要创建；更深层字段继续沿路径复制。
- updater 参数同样属于旧 State，只能读取并返回下一值。

## 十八、参考资料

- [Updating Objects in State](https://react.dev/learn/updating-objects-in-state) - 对象 State、浅复制、嵌套路径和结构共享。
- [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state) - 数组增删改、插入、重排和对象元素更新。
- [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) - State 值与 render 快照的关系。
- [`useState`](https://react.dev/reference/react/useState) - setter 替换、`Object.is` 与纯 updater。
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) - State 的不可变输入边界与局部修改。
- [Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) - 对象、数组展开和浅复制。
- [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) - 数组原地方法与复制方法分类。
- [`slice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)、[`splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) 与 [`toSpliced`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced) - 区间复制、原地编辑与复制编辑。
- [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)、[`filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) 与 [`concat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat) - 转换、筛选和合并的新数组语义。
- [`sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)、[`reverse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)、[`toSorted`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) 与 [`toReversed`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed) - 原地重排和复制重排。
- [`with`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with) - 单索引不可变替换与越界边界。
