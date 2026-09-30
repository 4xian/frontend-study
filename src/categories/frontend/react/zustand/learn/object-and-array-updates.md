---
id: react.zustand.learn.basics.object-and-array-updates
type: lesson
title: 对象与数组更新
summary: 用不可变更新改写对象、嵌套对象和数组，避免就地修改导致界面不刷新或字段丢失。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - react.zustand.learn.basics.selector
related:
  - react.zustand.learn.basics.selector
  - react.zustand.learn.basics.set-state-updates
tags:
  - Zustand
  - 不可变更新
  - 嵌套对象
  - 数组
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能说明 set 只在 Store 顶层浅合并，不会递归合并嵌套对象。
  - 能用展开运算在每一层复制对象，只改需要变化的字段。
  - 能用 map、filter 或展开运算创建新数组，完成新增、删除和替换。
  - 能识别就地修改对象或数组后，订阅组件不会更新。
  - 能把对象和数组的更新规则写进 Action，而不是在组件里改内存。
recap:
  - set 默认浅合并只覆盖顶层字段；嵌套对象必须显式写成新对象。
  - 更新嵌套字段时，从被改的那一层往上每一层都复制一份。
  - 数组要当成不可变数据：用展开、concat、map、filter 得到新数组，再交给 set。
  - 不要 push、splice 或直接改对象属性；没有新引用，订阅就不会触发。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand Updating state
    url: https://zustand.docs.pmnd.rs/learn/guides/updating-state
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 顶层更新会被浅合并进现有 State。
      - 深层嵌套对象需要按层复制，用展开运算手动合并新值。
  - title: Zustand Immutable state and merging
    url: https://zustand.docs.pmnd.rs/learn/guides/immutable-state-and-merging
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 状态应按不可变方式更新，写法类似 React 的 useState。
      - set 只在一层合并；嵌套对象必须显式展开后再写入。
  - title: Zustand 5.0.15 create API
    url: https://zustand.docs.pmnd.rs/reference/apis/create
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 对象和数组在 JavaScript 中可变，存进 State 后应按不可变方式更新。
      - 更新数组应赋新值，优先使用展开、concat、filter、slice、map 等不可变操作。
  - title: Zustand 5.0.15 vanilla store implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 默认更新用 Object.assign({}, state, nextState) 做顶层浅合并。
      - 只有 nextState 与当前 state 不是同一个引用时才会通知订阅者。
---

# 对象与数组更新

## 一、学习目标

- 区分顶层浅合并和嵌套对象更新。
- 用展开运算按层复制对象，只改真正变化的字段。
- 用新数组完成新增、删除和替换。
- 确认就地修改不会通知已经订阅的组件。

## 二、为什么需要不可变更新

上一课已经能按字段选择 State。选择函数比较的是选中值的引用或基本值。如果 Action 只改了嵌套对象里的一个属性，却没有换成新对象，选择 `profile` 的组件会认为什么都没变。

`set` 的默认浅合并只处理 Store 的顶层。`set({ title: '发布稿' })` 会保留 `count`，但 `set({ profile: { city: '上海' } })` 会把整个 `profile` 换成只有 `city` 的新对象，`name` 会丢。数组同样不能靠 `push` 改原数组，因为 Store 里还是同一个数组引用。

对象和数组更新要解决的就是这两件事：嵌套结构要按层复制，数组要换成新数组。本课只用展开运算、`map` 和 `filter`，不引入额外的更新库。

## 三、核心概念

### 1. 顶层浅合并不会走进嵌套对象

固定版本的 `set` 默认执行 `Object.assign({}, state, nextState)`。这只复制顶层键：

```tsx
set({ title: '发布稿' })
```

`title` 被覆盖，其他顶层字段保留。如果顶层字段本身是对象或数组，浅合并比较的是这个字段的**整个值**，不会递归进去改其中一项。

官方文档写明：`set` 只在一层合并；有嵌套对象时，必须显式合并。

### 2. 嵌套对象按层复制

嵌套状态要保证“被改的那一层往上，每一层都是新对象”：

```tsx
const useProfileStore = create<ProfileStore>()((set) => ({
  profile: {
    name: '林青',
    city: '杭州',
  },
  moveTo: (city: string) =>
    set((state) => ({
      profile: {
        ...state.profile,
        city,
      },
    })),
}))
```

`...state.profile` 保留 `name`，再覆盖 `city`。新的 `profile` 引用交给 `set` 后，选择 `profile` 或 `profile.city` 的组件才能看到更新。

更深的结构也一样，每一层都展开一次。官方把这种写法称为普通做法：用展开运算复制每一层，再手动合并新值。

### 3. 数组要换成新数组

数组存在 State 里时，应按不可变方式更新。官方建议优先使用展开、`concat`、`filter`、`slice`、`map` 这类会返回新数组的操作，避免 `push`、`splice`、`sort` 这类改原数组的操作。

```tsx
addTag: (label: string) =>
  set((state) => ({
    tags: [...state.tags, label],
  })),
removeTag: (label: string) =>
  set((state) => ({
    tags: state.tags.filter((item) => item !== label),
  })),
renameTag: (from: string, to: string) =>
  set((state) => ({
    tags: state.tags.map((item) => (item === from ? to : item)),
  })),
```

`set` 看到的是新的 `tags` 引用。选择 `tags` 的组件会重渲染；选择 `profile` 的组件不会，因为这次更新没有换 `profile`。

### 4. 就地修改不会通知订阅者

下面这样改的是内存里的同一个对象：

```tsx
useProfileStore.getState().profile.city = '上海'
useProfileStore.getState().tags.push('紧急')
```

`set` 没有被调用，Store 也不会认为 state 变了。固定版本只有 `nextState` 与当前 `state` 不是同一个引用时，才会通知监听者。对象属性被偷偷改写，不属于这次通知。

### 5. 更新规则放在 Action 里

组件负责收集输入，Action 负责产出新的对象或数组：

```tsx
function CityField() {
  const city = useProfileStore((state) => state.profile.city)
  const moveTo = useProfileStore((state) => state.moveTo)
  return (
    <input value={city} onChange={(event) => moveTo(event.target.value)} />
  )
}
```

组件不要拿到 `profile` 后改 `profile.city`，也不要拿到 `tags` 后 `push`。这样选择函数和浅合并都能按官方默认规则工作。

## 四、用法与示例

### 1. 更新对象里的一个字段

资料卡同时保存姓名和城市。只改城市时，姓名必须跟着复制：

```tsx
type Profile = {
  name: string
  city: string
}

type ProfileStore = {
  profile: Profile
  rename: (name: string) => void
  moveTo: (city: string) => void
}

const useProfileStore = create<ProfileStore>()((set) => ({
  profile: { name: '林青', city: '杭州' },
  rename: (name: string) =>
    set((state) => ({
      profile: { ...state.profile, name },
    })),
  moveTo: (city: string) =>
    set((state) => ({
      profile: { ...state.profile, city },
    })),
}))
```

如果写成 `set({ profile: { city } })`，`name` 会从 State 里消失。

### 2. 给数组增加、删除和替换

标签列表用新数组表达每一次变化：

```tsx
type TagStore = {
  tags: string[]
  addTag: (label: string) => void
  removeTag: (label: string) => void
  renameTag: (from: string, to: string) => void
}

const useTagStore = create<TagStore>()((set) => ({
  tags: ['草稿'],
  addTag: (label: string) =>
    set((state) => ({ tags: [...state.tags, label] })),
  removeTag: (label: string) =>
    set((state) => ({ tags: state.tags.filter((item) => item !== label) })),
  renameTag: (from: string, to: string) =>
    set((state) => ({
      tags: state.tags.map((item) => (item === from ? to : item)),
    })),
}))
```

替换某一项时用 `map` 返回新数组，不要 `tags[index] = to`。

### 3. 同时更新对象和数组

一份工作区可以同时保存资料和标签。一次 Action 只返回本次要换掉的顶层字段：

```tsx
reset: () =>
  set({
    profile: { name: '林青', city: '杭州' },
    tags: ['草稿'],
  }),
```

`set` 浅合并这两个顶层键，其他顶层字段（例如 Action 函数）保持原引用。

### 4. 观察对象复制与数组替换

下面的 Demo 把资料卡和标签列表放在同一份 Store 里。改城市时，资料面板更新，标签面板的渲染次数不变；增删标签时则相反。也可以对比“就地修改”不会刷新界面。

:::demo{id="react.zustand.learn.basics.object-and-array-updates.object-and-array-updates-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：直接改嵌套对象的属性

**触发条件：** 从 Store 取出 `profile` 后执行 `profile.city = '上海'`，或对 `getState().profile` 赋值。

**原因：** 这是就地修改。`set` 没有收到新的 `profile` 引用，订阅比较也看不到变化。

**后果：** 内存里的城市已经变了，选择 `profile` 或 `profile.city` 的组件不重渲染。

**错误示例：**

```tsx
function moveInPlace() {
  useProfileStore.getState().profile.city = '上海'
}
```

**正确写法：**

```tsx
moveTo: (city: string) =>
  set((state) => ({
    profile: { ...state.profile, city },
  })),
```

**验证方式：** 修改后如果界面不更新，先检查 Action 是否调用了 `set`，以及是否创建了新的嵌套对象。

### 错误：用新对象覆盖嵌套字段却忘记展开

**触发条件：** 写成 `set({ profile: { city } })` 或 `set((state) => ({ profile: { city } }))`。

**原因：** 浅合并只替换顶层的 `profile`。新对象里没有 `name`，原来的姓名被丢掉。

**后果：** 城市更新成功，姓名变成 `undefined`，资料卡残缺。

**错误示例：**

```tsx
moveTo: (city: string) => set({ profile: { city } }),
```

**正确写法：**

```tsx
moveTo: (city: string) =>
  set((state) => ({
    profile: { ...state.profile, city },
  })),
```

**验证方式：** 只改城市后打印 `profile`，确认 `name` 仍在。

### 错误：用 push 或 splice 改原数组

**触发条件：** Action 里写 `state.tags.push(label)` 或 `state.tags.splice(index, 1)`，然后 `set({ tags: state.tags })`。

**原因：** 这两个方法改的是同一个数组。即便再 `set` 一次，`Object.is` 仍可能认为 `tags` 没变，订阅者不更新。

**后果：** 控制台里数组长度变了，列表组件不重渲染，或渲染结果不稳定。

**错误示例：**

```tsx
addTag: (label: string) =>
  set((state) => {
    state.tags.push(label)
    return { tags: state.tags }
  }),
```

**正确写法：**

```tsx
addTag: (label: string) =>
  set((state) => ({
    tags: [...state.tags, label],
  })),
```

**验证方式：** 增加标签后，选择 `tags` 的列表应立即多出一项；不要在 Action 里调用 `push`。

### 错误：map 时修改原对象而不返回新项

**触发条件：** 更新数组里的对象时写成 `item.done = true; return item`。

**原因：** 数组可能是新的，但其中被改的那一项仍是旧引用。选择这一项的组件，或依赖引用比较的后续逻辑，会认为该项没变。

**后果：** 列表看起来更新了，单项详情或选中态仍显示旧数据。

**错误示例：**

```tsx
toggle: (id: string) =>
  set((state) => ({
    items: state.items.map((item) => {
      if (item.id === id) {
        item.done = !item.done
      }
      return item
    }),
  })),
```

**正确写法：**

```tsx
toggle: (id: string) =>
  set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item,
    ),
  })),
```

**验证方式：** 切换一项后，确认被改的对象是新引用，其他项仍是原来的引用。

### 错误：在组件里改选择到的对象或数组

**触发条件：** 组件写 `const tags = useTagStore((state) => state.tags)` 后执行 `tags.push('紧急')`。

**原因：** 选择函数返回的就是 Store 里的那份数据。组件里就地修改等于绕过 Action 和 `set`。

**后果：** 其他订阅同一数组的组件不一定更新，调试时很难找出是谁改了 State。

**错误示例：**

```tsx
function addUrgent() {
  const tags = useTagStore.getState().tags
  tags.push('紧急')
}
```

**正确写法：**

```tsx
function AddUrgentButton() {
  const addTag = useTagStore((state) => state.addTag)
  return (
    <button type="button" onClick={() => addTag('紧急')}>
      添加紧急
    </button>
  )
}
```

**验证方式：** 搜索组件和事件处理里是否出现 `push`、`splice` 或对选择结果赋值；这些操作应只出现在创建新值的 Action 中。
:::

## 六、原理与适用场景

### 1. 官方事实

Updating state 文档说明：调用 `set` 传入新状态后，它会与 Store 里的现有状态浅合并；嵌套状态见下一节。深层对象需要按层复制，用展开运算手动合并新值。

Immutable state and merging 文档把这条写得更直接：状态应按不可变方式更新，类似 React 的 `useState`；`set` 只在一层合并，嵌套对象必须显式展开。

`create` 文档要求把对象和数组都当成不可变数据。更新数组时应赋新值，优先使用 `[...array]`、`concat`、`filter`、`slice`、`map` 等不可变操作，避免 `push`、`splice`、`sort` 等改原数组的操作。

固定版本 `src/vanilla.ts` 用 `Object.assign({}, state, nextState)` 实现默认浅合并，并且只在 `Object.is(nextState, state)` 为 false 时通知监听者。

### 2. 课程推导

对象和数组更新的最小规则是：顶层交给 `set` 浅合并，嵌套结构由 Action 自己复制。选择函数比较引用，因此 Action 必须交出新的对象或新的数组。把复制过程写进 Action，组件就只负责触发意图，不会把 Store 里的数据当成可变草稿。

### 3. 适用边界

本课只使用展开运算、`map` 和 `filter` 完成不可变更新。Immer Middleware、optics-ts、Ramda 以及更复杂的深层更新库，都不在这里展开。Map / Set 的特殊用法、`replace: true` 整份替换，也不作为本课练习。

## 七、练习

:::exercise
### 不可变更新资料和标签

**要求：** 创建一个 `WorkspaceStore`，包含 `profile: { name: string; city: string }` 和 `tags: string[]`。实现 `rename(name)`、`moveTo(city)`、`addTag(label)`、`removeTag(label)`。更新 `profile` 时必须展开原对象；更新 `tags` 时必须返回新数组。不要在 Action 或组件里使用 `push`、`splice` 或直接给 `profile.city` 赋值。

**验收：** 调用 `moveTo('上海')` 后 `name` 仍在；调用 `addTag('紧急')` 后标签列表多一项，且 `profile` 引用保持不变；选择 `tags` 的面板在只改城市时渲染次数不增加。

**参考答案：**

```tsx
import { useRef } from 'react'
import { create } from 'zustand'

type Profile = {
  name: string
  city: string
}

type WorkspaceStore = {
  profile: Profile
  tags: string[]
  rename: (name: string) => void
  moveTo: (city: string) => void
  addTag: (label: string) => void
  removeTag: (label: string) => void
}

const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  profile: { name: '林青', city: '杭州' },
  tags: ['草稿'],
  rename: (name: string) =>
    set((state) => ({
      profile: { ...state.profile, name },
    })),
  moveTo: (city: string) =>
    set((state) => ({
      profile: { ...state.profile, city },
    })),
  addTag: (label: string) =>
    set((state) => ({
      tags: [...state.tags, label],
    })),
  removeTag: (label: string) =>
    set((state) => ({
      tags: state.tags.filter((item) => item !== label),
    })),
}))

/** 只选择资料卡，用来观察嵌套对象更新。 */
function ProfilePanel() {
  const profile = useWorkspaceStore((state) => state.profile)
  const renderCount = useRef(0)
  renderCount.current += 1
  return (
    <p>
      {profile.name} · {profile.city} · 渲染 {renderCount.current}
    </p>
  )
}

/** 只选择标签列表，用来观察数组替换。 */
function TagPanel() {
  const tags = useWorkspaceStore((state) => state.tags)
  const renderCount = useRef(0)
  renderCount.current += 1
  return (
    <p>
      {tags.join('、')} · 渲染 {renderCount.current}
    </p>
  )
}

/** 通过 Action 分别更新对象字段和数组。 */
function WorkspaceControls() {
  const rename = useWorkspaceStore((state) => state.rename)
  const moveTo = useWorkspaceStore((state) => state.moveTo)
  const addTag = useWorkspaceStore((state) => state.addTag)
  const removeTag = useWorkspaceStore((state) => state.removeTag)

  return (
    <>
      <button type="button" onClick={() => rename('陈夏')}>
        改名
      </button>
      <button type="button" onClick={() => moveTo('上海')}>
        迁到上海
      </button>
      <button type="button" onClick={() => addTag('紧急')}>
        添加紧急
      </button>
      <button type="button" onClick={() => removeTag('草稿')}>
        移除草稿
      </button>
    </>
  )
}
```
:::

## 八、本节小结

- `set` 只浅合并顶层字段，不会递归合并嵌套对象。
- 改嵌套字段时，从被改的那一层往上每一层都复制一份。
- 数组用展开、`map`、`filter` 得到新数组，再交给 `set`。
- 就地修改对象属性或调用 `push` 不会稳定地通知订阅组件。

## 九、参考资料

- [Zustand Updating state](https://zustand.docs.pmnd.rs/learn/guides/updating-state) - 顶层浅合并，以及嵌套对象按层复制。
- [Zustand Immutable state and merging](https://zustand.docs.pmnd.rs/learn/guides/immutable-state-and-merging) - 不可变更新，以及 `set` 只合并一层。
- [Zustand 5.0.15 create API](https://zustand.docs.pmnd.rs/reference/apis/create) - 对象与数组应按不可变方式更新。
- [Zustand 5.0.15 vanilla.ts](https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts) - `Object.assign` 浅合并与引用比较。
- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版本。
