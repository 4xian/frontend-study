---
id: react.zustand.learn.advanced.immer-middleware
type: lesson
title: Immer Middleware
summary: 用 immer 中间件在 set 的函数参数里改草稿，由 produce 产出新的不可变状态。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.advanced.middleware-composition
related:
  - react.zustand.learn.basics.object-and-array-updates
  - react.zustand.learn.advanced.middleware-composition
tags:
  - Zustand
  - immer
  - produce
  - 不可变更新
appliesTo: Zustand 5.0.15、React 19.2.8、Immer 11.1.18
verifiedAt: 2026-09-11
objectives:
  - 能从 zustand/middleware/immer 导入 immer，并立刻写在 create 里。
  - 能在 set 的函数参数里改草稿字段或数组，不必手写按层展开。
  - 能说明传入普通对象时仍走浅合并，不会再套一层 produce。
  - 能识别草稿更新会换掉嵌套引用，上一份对象和数组保持原样。
recap:
  - immer 从 zustand/middleware/immer 导入，使用前需要安装 immer 库。
  - 函数形式的 updater 会交给 produce，可以在草稿上赋值或 push。
  - 普通对象 updater 仍浅合并，和没有中间件时一样。
  - mutator 是 ["zustand/immer", never]。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Immer 11.1.18 npm Latest Metadata
    url: https://registry.npmjs.org/immer/latest
    sourceType: official-reference
    appliesTo: Immer 11.1.18
    claims:
      - npm latest 在核验日指向 Immer 11.1.18。
  - title: Zustand 5.0.15 README Immer middleware
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 从 zustand/middleware/immer 导入 immer。
      - 官方示例在 set 的函数参数里直接写 state.bees += by。
  - title: Zustand 5.0.15 immer middleware reference
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/immer.md
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - immer 让你可以做不可变更新。
      - 使用前需要安装 immer 库。
      - mutator 是 ["zustand/immer", never]。
      - 对照示例先手写展开嵌套对象，再用 immer 在草稿上赋值。
  - title: Zustand 5.0.15 Immer middleware integration
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/integrations/immer-middleware.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 柯里化空括号仍然要写。
      - 可以在草稿上改简单计数，也可以改 Record 里嵌套对象的字段。
      - 必须遵守 Immer 的规则，否则订阅可能不会被调用。
      - 类实例需要 [immerable] = true，否则 Immer 会改当前对象，Zustand 认为状态没变，跳过订阅。
  - title: Zustand 5.0.15 immer middleware implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/immer.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 中间件改写 store.setState。
      - updater 是函数时才交给 produce。
      - updater 不是函数时原样交给 set。这是固定版本实现，不是另一套公共合同。
  - title: Zustand 5.0.15 immer tests
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/tests/immer.test.tsx
    sourceType: official-test
    appliesTo: Zustand 5.0.15
    claims:
      - 函数 updater 可以在草稿上累加字段。
      - 传入对象时仍浅合并，不会丢掉未写入的字段。
      - replace 为 true 时整份替换。
      - 嵌套数组 push 后当前对象是新引用，上一份对象和数组保持原样。
      - createStore 同样可以包 immer。
  - title: Immer Returning new data from producers
    url: https://immerjs.github.io/immer/return
    sourceType: official-reference
    appliesTo: Immer 11.1.18
    claims:
      - recipe 返回新值时会整份替换当前状态，而不是只改草稿。
---

# Immer Middleware

## 一、学习目标

- 从 `zustand/middleware/immer` 导入 `immer`，并立刻写在 `create` 里。
- 在 `set` 的函数参数里改草稿字段或数组，不必手写按层展开。
- 说明传入普通对象时仍走浅合并，不会再套一层 `produce`。
- 识别草稿更新会换掉嵌套引用，上一份对象和数组保持原样。

## 二、为什么手写展开会变长

基础课已经要求嵌套对象按层复制，数组用展开、`map` 或 `filter` 换成新引用。城市改成「上海」时要写：

```ts
set((state) => ({
  profile: {
    ...state.profile,
    city: '上海',
  },
}))
```

嵌套再深一层，展开就会跟着变长。官方中间件文档先给出这份手写复制，再引入 `immer`：在 `set` 的函数里改草稿，由 Immer 产出新的不可变状态。

`immer` 不是默认 `set` 的替代写法。没有中间件时，仍然不能 `state.profile.city = '上海'`。

## 三、核心概念

### 1. 从独立路径导入，并立刻写在 create 里

官方 README 从 `zustand/middleware/immer` 导入，不从 `zustand/middleware` 导入。文档要求先安装 `immer` 库。TypeScript 继续写柯里化空括号：

```ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type WorkspaceStore = {
  profile: { name: string; city: string }
  tags: string[]
  ticks: number
  moveTo: (city: string) => void
  addTag: (label: string) => void
  tick: () => void
}

const useWorkspaceStore = create<WorkspaceStore>()(
  immer((set, get) => ({
    profile: { name: '林青', city: '杭州' },
    tags: ['草稿'],
    ticks: 0,
    moveTo: (city) =>
      set((state) => {
        state.profile.city = city
      }),
    addTag: (label) =>
      set((state) => {
        state.tags.push(label)
      }),
    tick: () => set({ ticks: get().ticks + 1 }),
  })),
)
```

mutator 是 `["zustand/immer", never]`。

### 2. 函数 updater 改的是草稿

官方示例是：

```ts
set((state) => {
  state.bees += by
})
```

集成文档里的待办则直接改嵌套字段：

```ts
set((state) => {
  state.todos[todoId].done = !state.todos[todoId].done
})
```

固定版本实现里，`immer` 改写 `store.setState`。updater 是函数时，先交给 Immer 的 `produce`，再把结果传给原来的 `set`。初始化函数拿到的 `set` 就是这份包装后的 `setState`，所以 Action 里的 `set((state) => { ... })` 走草稿。

官方测试写明：`state.user.tags.push(tag)` 之后，当前 `user` 是新引用；上一份 `user` 和上一份 `tags` 保持原样。选择 `profile` 或 `tags` 的组件会看到新引用。

### 3. 普通对象 updater 仍浅合并

官方测试传入 `{ count: 5 }` 时，`name` 还在。固定版本只在 updater 是函数时调用 `produce`；传入对象就原样交给 `set`，仍是顶层浅合并。

所以 `set({ ticks: get().ticks + 1 })` 只换 `ticks`，`profile` 和 `tags` 引用不变。若写成 `set({ profile: { city: '上海' } })`，仍然会丢掉 `name`，中间件不会帮你展开旧对象。

`replace` 为 `true` 时仍是整份替换。官方测试 `setState({ a: 9 }, true)` 之后只剩下 `{ a: 9 }`。

### 4. 观察草稿更新和浅合并

下面的 Demo 左侧改城市：草稿上赋值，姓名还在，资料换成新引用。中间往标签数组 `push`：当前标签是新数组，上一份数组不变。右侧用对象 updater 增加无关计数，资料和标签引用都不动。

:::demo{id="react.zustand.learn.advanced.immer-middleware.immer-middleware-demo"}
:::

## 四、用法与示例

### 1. 嵌套字段在草稿上赋值

```ts
moveTo: (city: string) =>
  set((state) => {
    state.profile.city = city
  }),
```

不要再写 `profile: { ...state.profile, city }`，除非你没有包 `immer`。

### 2. 数组可以 push

```ts
addTag: (label: string) =>
  set((state) => {
    state.tags.push(label)
  }),
```

官方测试用的就是 `push`。没有中间件时，`push` 改的是当前数组，订阅不会被叫醒。

### 3. Vanilla Store 同样包中间件

```ts
import { createStore } from 'zustand/vanilla'
import { immer } from 'zustand/middleware/immer'

const workspaceStore = createStore<WorkspaceStore>()(
  immer((set) => ({
    profile: { name: '林青', city: '杭州' },
    tags: ['草稿'],
    ticks: 0,
    moveTo: (city) =>
      set((state) => {
        state.profile.city = city
      }),
    addTag: (label) =>
      set((state) => {
        state.tags.push(label)
      }),
    tick: () => set({ ticks: workspaceStore.getState().ticks + 1 }),
  })),
)

workspaceStore.setState((state) => {
  state.profile.city = '上海'
})
```

官方测试证明 `createStore` 加上 `immer` 后，`setState` 的函数参数同样是草稿。

## 五、易错使用提示

:::pitfalls
### 错误：从 zustand/middleware 导入 immer

**触发条件：** 写成 `import { immer } from 'zustand/middleware'`。

**原因：** 官方 README 和 Reference 都从 `zustand/middleware/immer` 导入。这条路径不在 `zustand/middleware` 的具名导出里。

**后果：** 模块找不到导出，Store 创建失败。

**错误示例：**

```ts
import { immer } from 'zustand/middleware'
```

**正确写法：**

```ts
import { immer } from 'zustand/middleware/immer'
```

**验证方式：** 编译通过；`create` 里可以写下 `immer((set) => ...)`。

### 错误：没有中间件却在 set 里改原对象

**触发条件：** 写成 `create<WorkspaceStore>()((set) => ({ moveTo: (city) => set((state) => { state.profile.city = city }) }))`，没有 `immer`。

**原因：** 默认 `set` 的函数参数拿到的是当前 state。就地赋值不会换引用。固定版本只有新状态和当前状态不是同一引用时才通知订阅者。

**后果：** 城市字段在内存里变了，选择 `profile` 的组件不更新。

**错误示例：**

```ts
const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  profile: { name: '林青', city: '杭州' },
  tags: ['草稿'],
  ticks: 0,
  moveTo: (city) =>
    set((state) => {
      state.profile.city = city
    }),
  addTag: (label) =>
    set((state) => {
      state.tags.push(label)
    }),
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
}))
```

**正确写法：**

```ts
const useWorkspaceStore = create<WorkspaceStore>()(
  immer((set, get) => ({
    profile: { name: '林青', city: '杭州' },
    tags: ['草稿'],
    ticks: 0,
    moveTo: (city) =>
      set((state) => {
        state.profile.city = city
      }),
    addTag: (label) =>
      set((state) => {
        state.tags.push(label)
      }),
    tick: () => set({ ticks: get().ticks + 1 }),
  })),
)
```

**验证方式：** 调用 `moveTo('上海')` 后，选择 `profile.city` 的文案变成「上海」，资料引用与调用前不同。

### 错误：对象 updater 只写嵌套对象的一部分

**触发条件：** 已经包了 `immer`，却写成 `set({ profile: { city: '上海' } })`。

**原因：** updater 不是函数时不会走 `produce`，仍是顶层浅合并。新的 `profile` 只有 `city`。

**后果：** `name` 丢失。

**错误示例：**

```ts
moveTo: (city: string) => set({ profile: { city } }),
```

**正确写法：**

```ts
moveTo: (city: string) =>
  set((state) => {
    state.profile.city = city
  }),
```

**验证方式：** 改城市后 `profile.name` 仍是「林青」。

### 错误：在 set 外面改 getState 拿到的对象

**触发条件：** `useWorkspaceStore.getState().profile.city = '上海'`，或者对 `tags` 调用 `push`，没有经过 `set`。

**原因：** 中间件只包装 `setState`。直接改当前对象不会走 `produce`，也不会通知订阅者。

**后果：** 内存里的字段变了，界面不更新。

**错误示例：**

```ts
useWorkspaceStore.getState().tags.push('紧急')
```

**正确写法：**

```ts
useWorkspaceStore.getState().addTag('紧急')
```

**验证方式：** 调用 Action 后标签面板更新；不要在组件事件里对 `getState()` 的数组 `push`。

### 错误：类实例没有标记 immerable，订阅被跳过

**触发条件：** 把 class 的实例放进 state，在草稿里改它的字段，但类上没有 `[immerable] = true`。

**原因：** 官方集成文档写明必须遵守 Immer 的规则。类实例默认不会被当成草稿代理，Immer 会改当前对象。Zustand 比较当前状态和下一份状态，引用相同就跳过订阅。

**后果：** 字段变了，组件和 `subscribe` 都不会被叫醒。

**错误示例：**

```ts
class Profile {
  name = '林青'
  city = '杭州'
}

const useWorkspaceStore = create<{ profile: Profile; moveTo: (city: string) => void }>()(
  immer((set) => ({
    profile: new Profile(),
    moveTo: (city) =>
      set((state) => {
        state.profile.city = city
      }),
  })),
)
```

**正确写法：**

```ts
const useWorkspaceStore = create<WorkspaceStore>()(
  immer((set, get) => ({
    profile: { name: '林青', city: '杭州' },
    tags: ['草稿'],
    ticks: 0,
    moveTo: (city) =>
      set((state) => {
        state.profile.city = city
      }),
    addTag: (label) =>
      set((state) => {
        state.tags.push(label)
      }),
    tick: () => set({ ticks: get().ticks + 1 }),
  })),
)
```

**验证方式：** 改城市后选择 `profile` 的组件更新。需要类实例时，按 Immer 文档给类加上 `[immerable] = true`。

### 错误：函数 updater 返回新对象

**触发条件：** 已经包了 `immer`，写成 `set((state) => ({ ticks: state.ticks + 1 }))`。

**原因：** 函数 updater 会交给 `produce`。Immer 官方写明：recipe 返回新值时会整份替换当前状态，而不是只改草稿上的字段。

**后果：** `profile`、`tags` 和 Action 一起消失，再点按钮会运行时崩溃。

**错误示例：**

```ts
tick: () => set((state) => ({ ticks: state.ticks + 1 })),
```

**正确写法：**

```ts
tick: () => set({ ticks: get().ticks + 1 })
// 或改草稿，不要返回新对象：
// tick: () => set((state) => { state.ticks += 1 })
```

**验证方式：** 增加计数后 `profile` 和 `tags` 仍在；`moveTo` 仍是函数。
:::

## 六、原理与适用场景

### 1. 官方事实

README 从 `zustand/middleware/immer` 导入，并在 `set` 的函数里写 `state.bees += by`。Reference 写明需要安装 `immer` 库，mutator 是 `["zustand/immer", never]`。集成文档要求柯里化空括号，并给出计数和嵌套 `Record` 示例。类实例必须遵守 Immer 规则，否则订阅可能被跳过。

固定版本把函数 updater 交给 `produce`，对象 updater 原样交给 `set`。官方测试覆盖草稿累加、对象浅合并、`replace: true`、嵌套 `push` 不改上一份引用，以及 `createStore`。Immer 文档写明：recipe 返回新值时会整份替换当前状态。

### 2. 课程推导

`immer` 没有改 Hook 选择规则，也没有改顶层浅合并。它只让函数形式的 `set` / `setState` 拿到草稿。嵌套结构仍要在 Action 里更新；差别是用赋值和 `push`，而不是手写展开。对象 updater 继续按基础课的浅合并理解。

### 3. 适用边界

本课不把 `persist`、`devtools` 再组合一遍。自定义 middleware 和高阶 mutator 不作为主线。Map、Set 和光学更新库不在这里展开。没有中间件时，对象和数组仍按基础课的不可变写法更新。

## 七、练习

:::exercise
### 用 immer 切换待办完成状态

**要求：** 从 `zustand` 导入 `create`，从 `zustand/middleware/immer` 导入 `immer`。Store 包含 `todos: Record<string, { id: string; title: string; done: boolean }>` 和 `toggleTodo(id: string)`。用 `create<TodoStore>()(immer(...))` 创建。`toggleTodo` 在草稿上改对应项的 `done`。组件用 Store Hook 选择该待办的 `done`，不要在 listener 或组件里直接改 `todos`。

**验收：** 调用 `toggleTodo` 后该项 `done` 取反，其他项不变。调用前保存的上一份 `todos` 对象引用不变。

**参考答案：**

```tsx
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type Todo = {
  id: string
  title: string
  done: boolean
}

type TodoStore = {
  todos: Record<string, Todo>
  toggleTodo: (todoId: string) => void
}

const useTodoStore = create<TodoStore>()(
  immer((set) => ({
    todos: {
      t1: { id: 't1', title: '学习 Zustand', done: false },
    },
    toggleTodo: (todoId) =>
      set((state) => {
        state.todos[todoId].done = !state.todos[todoId].done
      }),
  })),
)

function TodoDoneLabel() {
  const done = useTodoStore((state) => state.todos.t1.done)
  const toggleTodo = useTodoStore((state) => state.toggleTodo)

  return (
    <button type="button" onClick={() => toggleTodo('t1')}>
      {done ? '已完成' : '未完成'}
    </button>
  )
}
```
:::

## 八、本节小结

- 从 `zustand/middleware/immer` 导入，并立刻写在 `create<T>()(...)` 里。
- 函数 updater 改草稿；对象 updater 仍浅合并。
- 嵌套 `push` 或赋值会换掉当前引用，上一份对象保持原样。
- 没有中间件时，不要在 `set` 里改原对象。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Immer 11.1.18 npm Latest Metadata](https://registry.npmjs.org/immer/latest) - 核验 immer 稳定版。
- [Zustand 5.0.15 README Immer middleware](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 导入路径和草稿累加示例。
- [Zustand 5.0.15 immer middleware reference](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/immer.md) - 签名、mutator 与嵌套对象对照。
- [Zustand 5.0.15 Immer middleware integration](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/integrations/immer-middleware.md) - 柯里化、嵌套 Record 与订阅陷阱。
- [Zustand 5.0.15 immer middleware implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/immer.ts) - 函数 updater 才走 produce。
- [Zustand 5.0.15 immer tests](https://github.com/pmndrs/zustand/blob/v5.0.15/tests/immer.test.tsx) - 草稿、浅合并、replace 和上一份引用。
- [Immer Returning new data from producers](https://immerjs.github.io/immer/return) - recipe 返回新值会整份替换。
