---
id: react.zustand.learn.basics.set-state-updates
type: lesson
title: set 状态更新
summary: 使用 Zustand 的 set 以对象或函数式方式更新 State，并理解默认浅合并行为。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - react.zustand.learn.basics.state-and-actions
related:
  - react.zustand.learn.basics.state-and-actions
  - react.zustand.learn.basics.first-store
tags:
  - Zustand
  - set
  - 状态更新
  - 浅合并
  - 函数式更新
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-02
objectives:
  - "能使用 set({ field: value }) 更新一个或多个顶层 State 字段。"
  - 能解释 set 默认浅合并的结果，并知道未提供的字段会保留。
  - 能使用 set((state) => (...)) 基于更新前的 State 计算新值。
  - 能把 set 封装在 Store Action 中，让组件通过 Action 触发更新。
  - 能识别直接修改 Store State 和在 Action 中返回更新对象的差异。
recap:
  - set 的对象形式适合把已知的新值写入顶层字段。
  - set 的函数形式适合基于前一个 State 计算新值，连续更新不会依赖过期闭包。
  - Zustand 的 set 默认对返回对象执行浅合并，未返回的顶层字段保持不变。
  - 组件应调用 Store Action，不直接修改选择到的 State 或绕过 Action 写入业务规则。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand Updating State
    url: https://zustand.docs.pmnd.rs/learn/guides/updating-state
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 官方示例使用 set 的对象形式更新 State。
      - 官方示例使用 set 的函数形式读取前一个 State 后返回更新对象。
      - 更新嵌套对象或数组时需要显式创建新的嵌套值，不能把深层更新误当成自动递归合并。
  - title: Zustand 5.0.15 create API
    url: https://zustand.docs.pmnd.rs/apis/create
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - create 的初始化函数接收 set，并返回包含 State 与 Action 的 Store。
      - Action 可以在创建完成后调用 set 更新 Store。
  - title: Zustand Flux-inspired practice
    url: https://zustand.docs.pmnd.rs/guides/flux-inspired-practice
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 官方建议把 Store Action 直接放在 Store 中。
      - 组件消费同一份 Store，并由 Action 负责更新状态。

---

# set 状态更新

## 一、学习目标

- 使用对象形式的 `set` 写入已知的新值。
- 使用函数形式的 `set` 基于更新前的 State 计算新值。
- 观察默认浅合并如何保留未更新的顶层字段。
- 把更新规则封装在 Store Action 中，让组件只表达交互意图。

## 二、为什么需要 set

第一个 Store 只能提供初始值，State 与 Action 课程又把改变入口放进了 Store。要让 Action 真正改变状态，
还需要一个明确的写入接口。

`set` 就是初始化函数提供给 Action 的更新入口。它接收一个部分 State，或者接收一个根据前一个 State
计算部分 State 的函数。组件不需要知道 Store 如何保存字段，只需要调用已经命名的 Action。

例如，编辑工作区既要更新标题，也要累计保存次数。标题来自输入事件，可以直接写入新值；保存次数依赖当前
计数，就应该从更新函数的 `state` 参数计算，而不是读取组件渲染时的旧值。

## 三、核心概念

### 1. 对象形式写入已知的新值

当 Action 已经拥有要写入的值时，可以把部分 State 对象传给 `set`：

```tsx
const useArticleStore = create<ArticleStore>()((set) => ({
  title: '初稿',
  rename: (title: string) => set({ title }),
}))
```

这次更新只描述 `title`。它不是要求组件重新提供整份 Store，也不会因为没有写出其他字段就把其他字段清空。

### 2. 默认行为是顶层浅合并

`set({ title })` 返回的是一份部分 State。Zustand 默认把它与当前 Store 的顶层字段浅合并：

```tsx
set({ title: '发布稿' })
// count、isPublished 等未出现在返回对象中的顶层字段继续保留
```

“浅合并”只发生在 Store 的顶层。它不代表嵌套对象会递归合并；对象或数组的深层更新需要另外创建新的嵌套值，
该主题不在本课展开。

### 3. 函数形式基于前一个 State 计算

当新值依赖旧值时，把函数传给 `set`：

```tsx
increment: () => set((state) => ({ count: state.count + 1 }))
```

函数接收调用更新时的前一个 State，并返回要合并的部分 State。计数器、开关和基于当前状态的切换都适合这种
写法。它让依赖关系位于 Store 的更新边界中，不依赖组件某次渲染捕获的值。

### 4. 更新对象只写需要改变的字段

一个 Action 可以同时更新几个相关的顶层字段：

```tsx
publish: () =>
  set({
    isPublished: true,
    statusMessage: '已发布',
  })
```

只返回这次操作需要改变的字段，其他顶层 State 会由默认浅合并保留。Action 不应该为了“完整”而复制一份整
个 State，也不应该返回与当前值相同的无关字段。

### 5. set 仍然应由 Action 持有

`set` 是 Store 初始化函数中的能力。把它封装成 `rename`、`incrementSaveCount`、`togglePublished` 等有意图的
Action 后，组件只调用这些函数：

```tsx
const togglePublished = useArticleStore((state) => state.togglePublished)

return <button onClick={togglePublished}>切换发布状态</button>
```

组件不直接调用 `useArticleStore.setState` 来承载业务规则，也不通过修改选择到的对象来绕过 Store 的通知。

## 四、用法与示例

### 1. 用对象形式更新输入值

输入框提供的新标题已经是本次操作的结果，Action 可以直接使用对象形式：

```tsx
type ArticleStore = {
  title: string
  rename: (title: string) => void
}

const useArticleStore = create<ArticleStore>()((set) => ({
  title: '初稿',
  rename: (title: string) => set({ title }),
}))

function TitleField() {
  const title = useArticleStore((state) => state.title)
  const rename = useArticleStore((state) => state.rename)

  return <input value={title} onChange={(event) => rename(event.target.value)} />
}
```

`rename` 只负责把输入值交给 `set`。更新后，Store 中其他顶层字段继续存在。

### 2. 用函数形式累计和切换

保存次数和发布状态都依赖更新前的值：

```tsx
type ArticleStore = {
  saveCount: number
  isPublished: boolean
  save: () => void
  togglePublished: () => void
}

const useArticleStore = create<ArticleStore>()((set) => ({
  saveCount: 0,
  isPublished: false,
  save: () => set((state) => ({ saveCount: state.saveCount + 1 })),
  togglePublished: () => set((state) => ({ isPublished: !state.isPublished })),
}))
```

每次调用 Action 时，函数参数都从当前 State 计算下一值。不要在组件中先读取 `saveCount`，再把这个旧值加一
后传回 Store；更新规则应直接放在函数式 `set` 中。

### 3. 组合对象更新与函数式更新

一个工作区可以同时使用两种形式：

```tsx
type WorkspaceStore = {
  title: string
  saveCount: number
  isPublished: boolean
  rename: (title: string) => void
  save: () => void
  togglePublished: () => void
}

const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  title: '未命名文章',
  saveCount: 0,
  isPublished: false,
  rename: (title: string) => set({ title }),
  save: () => set((state) => ({ saveCount: state.saveCount + 1 })),
  togglePublished: () => set((state) => ({ isPublished: !state.isPublished })),
}))
```

输入值是外部已知结果，适合对象形式；累计和切换依赖前一个 State，适合函数形式。两种形式都返回部分 State，
由 `set` 默认浅合并。

### 4. 观察三种更新结果

下面的 Demo 提供标题输入、保存计数和发布切换。标题按钮使用对象更新，保存与发布使用函数式更新；顶部状态面板
还会显示其他字段在单字段更新后仍被保留的结果。

:::demo{id="react.zustand.learn.basics.set-state-updates.set-state-updates-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：用旧的组件值计算共享 State

**触发条件：** 组件读取 `saveCount`，再在事件中用该值加一并写回 Store。

**原因：** 事件回调可能闭包捕获某次渲染的旧值，更新规则离开了 Store 的状态边界。

**后果：** 连续操作或多个更新同时发生时，结果可能基于过期值。

**错误示例：**

```tsx
const saveCount = useArticleStore((state) => state.saveCount)
const save = () => useArticleStore.setState({ saveCount: saveCount + 1 })
```

**正确写法：**

```tsx
const save = useArticleStore((state) => state.save)

// Store 内部：save: () => set((state) => ({ saveCount: state.saveCount + 1 }))
```

**验证方式：** 检查依赖前一个 State 的更新是否使用 `set((state) => (...))`，而不是使用组件闭包中的同名值。

### 错误：误以为 set 会递归合并嵌套对象

**触发条件：** 直接用 `set({ settings: { compact: true } })` 更新一个还包含 `settings.locale` 的 State。

**原因：** 把顶层浅合并理解成任意层级的深合并。

**后果：** `settings` 被新的对象替换，未包含的 `locale` 可能丢失。

**错误示例：**

```tsx
set({ settings: { compact: true } })
```

**正确写法：**

```tsx
set((state) => ({
  settings: {
    ...state.settings,
    compact: true,
  },
}))
```

**验证方式：** 对嵌套对象更新时，确认是否显式展开旧对象；复杂嵌套和数组更新应使用专门的不可变更新方案。

### 错误：把完整 Store 复制回 set

**触发条件：** 每个 Action 都先读取整份 State，再构造一个包含所有字段的对象传给 `set`。

**原因：** 没有利用 `set` 的部分更新与默认浅合并。

**后果：** Action 重复维护字段，容易覆盖不相关的最新值。

**错误示例：**

```tsx
set({ title, saveCount, isPublished, statusMessage })
```

**正确写法：**

```tsx
set({ title })
```

**验证方式：** 对象更新只返回本次需要改变的顶层字段，除非本次操作确实同时改变多个字段。

### 错误：在组件中直接修改 State

**触发条件：** 从 Store 选择对象后给其属性赋值，或把业务写入散落到组件事件中。

**原因：** 绕过 Action 与 `set` 的更新入口。

**后果：** 更新路径不可追踪，订阅组件也不会按预期收到规范的 Store 更新。

**错误示例：**

```tsx
const article = useArticleStore((state) => state.article)
article.title = '发布稿'
```

**正确写法：**

```tsx
const rename = useArticleStore((state) => state.rename)
rename('发布稿')
```

**验证方式：** 搜索组件事件处理器，确认共享 State 的改变都通过 Store Action 完成。
:::

## 六、原理与适用场景

### 1. 官方事实

Zustand 的更新指南展示了两种基本形状：把部分 State 对象传给 `set`，或传入接收当前 State 的函数并返回
部分 State。官方 `create` API 说明初始化函数可以接收 `set`，再由创建后的 Action 使用它。默认更新适合
顶层部分字段；嵌套对象和数组需要显式构造新的值。

### 2. 课程推导

对象形式表达“我已经知道要写入什么”，函数形式表达“请根据 Store 当前事实计算下一步”。把这两种形式都封装
在 Action 中，组件事件就只传递最小业务参数，更新规则也集中在状态所有者一侧。

### 3. 适用边界

`set` 适合更新客户端 Store 的同步 State。需要远程请求、缓存失效、URL 同步或服务端事实时，应使用对应的
工具并明确所有权。嵌套对象、数组、替换整个 State、Middleware 和异步 Action 不在本课展开。

## 七、练习

:::exercise
### 为计时工作区选择 set 形式

**要求：** 创建一个 `TimerStore`，包含 `label: string`、`seconds: number` 和 `isRunning: boolean`。实现
`rename(label)`、`tick()`、`toggleRunning()` 三个 Action：`rename` 使用对象形式，另外两个 Action 使用函数
形式。再写出一个组件读取三个字段，并在按钮事件中调用 Action。

**验收：** 修改标签不会重置秒数或运行状态；每次 `tick()` 只增加一秒；连续调用 `toggleRunning()` 会在
`true` 与 `false` 间切换；组件没有直接修改 Store 或使用组件闭包值计算 `seconds`。

**参考答案：**

```tsx
import { create } from 'zustand'

type TimerStore = {
  label: string
  seconds: number
  isRunning: boolean
  rename: (label: string) => void
  tick: () => void
  toggleRunning: () => void
}

const useTimerStore = create<TimerStore>()((set) => ({
  label: '专注计时',
  seconds: 0,
  isRunning: false,
  rename: (label: string) => set({ label }),
  tick: () => set((state) => ({ seconds: state.seconds + 1 })),
  toggleRunning: () => set((state) => ({ isRunning: !state.isRunning })),
}))

/** 展示计时 Store 的三个更新入口。 */
function TimerControls() {
  const label = useTimerStore((state) => state.label)
  const seconds = useTimerStore((state) => state.seconds)
  const isRunning = useTimerStore((state) => state.isRunning)
  const rename = useTimerStore((state) => state.rename)
  const tick = useTimerStore((state) => state.tick)
  const toggleRunning = useTimerStore((state) => state.toggleRunning)

  return (
    <section>
      <input value={label} onChange={(event) => rename(event.target.value)} />
      <p>{seconds} 秒 · {isRunning ? '运行中' : '已暂停'}</p>
      <button type="button" onClick={tick}>计时一秒</button>
      <button type="button" onClick={toggleRunning}>切换运行状态</button>
    </section>
  )
}
```
:::

## 八、本节小结

- 已知的新值用 `set({ field: value })`；依赖旧值的更新用 `set((state) => ({ ... }))`。
- `set` 默认浅合并返回的顶层字段，未返回的顶层字段保持不变。
- 浅合并不等于深层递归合并；嵌套对象和数组需要显式不可变更新。
- 把 `set` 封装进有意图的 Action，组件只调用 Action，不直接修改 Store State。

## 九、参考资料

- [Zustand Updating State](https://zustand.docs.pmnd.rs/learn/guides/updating-state) - `set` 的对象形式、函数形式和嵌套值更新边界。
- [Zustand 5.0.15 create API](https://zustand.docs.pmnd.rs/apis/create) - 初始化函数、`set` 参数和 React Store Hook。
- [Zustand Flux-inspired practice](https://zustand.docs.pmnd.rs/guides/flux-inspired-practice) - 将 Action 放入 Store 的官方建议。
- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版本。
