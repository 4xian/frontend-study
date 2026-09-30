---
id: react.zustand.learn.intermediate.persist
type: lesson
title: persist 持久化
summary: 用 persist 中间件把客户端状态写入存储，并用 partialize 只保留需要跨刷新恢复的字段。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.intermediate.state-reset
related:
  - react.zustand.learn.intermediate.state-reset
  - react.zustand.learn.basics.set-state-updates
tags:
  - Zustand
  - persist
  - partialize
  - createJSONStorage
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能用 persist 包裹 create 的初始化函数，并提供唯一的存储 name。
  - 能说明默认存储是 createJSONStorage 配合 localStorage，写入形态是带 version 的 JSON。
  - 能用 partialize 只持久化需要恢复的字段，避免把 Action、草稿和 loading 写入存储。
  - 能识别嵌套 Action 被整份持久化后，浅合并会用空对象覆盖当前 Action。
recap:
  - persist 是中间件，不是新的 Store API；每次 set 都会按 partialize 写入存储。
  - name 是存储键，必须唯一；默认用 JSON 序列化写入 localStorage。
  - 水合默认浅合并：当前 State 与 Action 做底，持久化字段盖上去。
  - 只持久化可序列化的数据字段；version、migrate 和 SSR 水合不在本课展开。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README Persist middleware
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - persist 可以把 Store 数据写入任意存储。
      - "官方示例从 `zustand/middleware` 导入 `persist` 和 `createJSONStorage`。"
      - name 是存储项的键，必须唯一。
      - storage 可选，默认使用 localStorage。
  - title: Zustand 5.0.15 Persisting store data
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/integrations/persisting-store-data.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - persist 支持同步存储和异步存储。
      - name 是唯一必填选项。
      - partialize 用来挑选写入存储的字段，默认返回整份 state。
      - 默认 merge 是浅合并：后写入的持久化对象盖在当前 state 上。
      - 同步存储会在 Store 创建时完成水合。
      - clearStorage 只清除该 name 下的存储项。
  - title: Zustand 5.0.15 persist middleware reference
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/persist.md
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - persist 在页面刷新或应用重启后恢复 Store 状态。
      - storage 默认是 createJSONStorage 配合 localStorage。
      - createJSONStorage 使用 JSON.parse 与 JSON.stringify，不做运行时形状校验。
  - title: Zustand 5.0.15 persist middleware implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/persist.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - "每次 set 之后都会调用 partialize，再按 name 写入 `{ state, version }`。"
      - 水合读取存储后用 merge 结果执行 replace 写入。
      - 默认 merge 是当前 state 在前、持久化字段在后的浅合并。
      - clearStorage 只 removeItem，不改内存里的当前 state。
---

# persist 持久化

## 一、学习目标

- 用 `persist` 包裹初始化函数，并提供唯一的存储 `name`。
- 说明默认存储是 `createJSONStorage` 配合 `localStorage`，写入的是带 `version` 的 JSON。
- 用 `partialize` 只持久化需要跨刷新恢复的字段。
- 识别把嵌套 Action 整份写入存储后，浅合并会用空对象覆盖当前 Action。

## 二、为什么需要 persist

主题、字号、侧栏是否展开这类客户端偏好，刷新页面后还应该在。它们不是服务端列表，也不该塞进 URL。

自己在 `set` 里写 `localStorage.setItem`，还要在模块加载时读回来，容易漏字段、把函数写进去，或两份 Store 抢同一把钥匙。`persist` 把“写入存储”和“启动时读回”收进中间件：每次 `set` 自动按规则序列化；创建 Store 时再读回来合并。

## 三、核心概念

### 1. persist 包裹初始化函数

从 `zustand/middleware` 导入 `persist`。它接收初始化函数和选项，返回仍可交给 `create` 的 State Creator。TypeScript 继续写 `create<PreferenceStore>()(...)`。

```tsx
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type PreferenceStore = {
  theme: string
  toggleTheme: () => void
}

const usePreferenceStore = create<PreferenceStore>()(
  persist(
    (set, get) => ({
      theme: '浅色',
      toggleTheme: () =>
        set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
    }),
    {
      name: 'preference-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
```

`name` 是唯一必填项，也是存储键。官方 README 写明：默认使用 `localStorage`；传入 `createJSONStorage(() => sessionStorage)` 可改成会话存储。

### 2. 写入的不是裸字段，而是带 version 的 JSON

中间件不会把 `theme` 直接当成 `localStorage` 的值。`set` 之后它先 `partialize` 当前 state，再写入：

```json
{ "state": { "theme": "深色" }, "version": 0 }
```

`version` 默认是 `0`。版本不匹配时的迁移不在本课展开。

默认 `createJSONStorage` 内部走 `JSON.stringify` / `JSON.parse`。函数、`undefined`、`Map`、`Set` 都不能按原样活过这一趟。官方中间件文档写明：它不做运行时校验，读回来的值直接当成状态类型使用，不检查形状。非法 JSON 会让 `JSON.parse` 失败，水合走进错误回调，不会把那串文本写进 Store；形状不对但仍是合法 JSON 的数据会被浅合并采用。

### 3. partialize 决定哪些字段进入存储

默认 `partialize` 返回整份 state。顶层 Action 是函数，`JSON.stringify` 会丢掉这些键，读回来时浅合并通常还能靠当前 Store 里的函数补上。这不表示应该依赖这个巧合。

草稿、`loading`、一次性提示若一起进存储，刷新后会把上一轮未完成的过程当成新的事实。官方示例用 `partialize` 只留下需要恢复的字段：

```tsx
{
  name: 'preference-storage',
  partialize: (state) => ({ theme: state.theme }),
}
```

### 4. 水合是浅合并，不是卸载重装

水合：从存储取出持久化字段，与当前 state 合并，再写回 Store。同步的 `localStorage` 会在 `create` 返回前完成，组件第一次渲染就能读到恢复后的值。

默认 `merge` 是：

```ts
(persistedState, currentState) => ({
  ...currentState,
  ...persistedState,
})
```

当前对象做底，持久化字段盖上去。Action 仍在当前对象里，所以顶层函数一般能保住。若持久化结果里出现同名的空对象，当前对象上的同名字段会被盖掉。

`clearStorage()` 只删除该 `name` 下的存储项，不把内存重置回初始快照。之后任意一次 `set` 仍会按 `partialize` 再写入。

## 四、用法与示例

### 1. 只持久化偏好，不持久化草稿

```tsx
type PreferenceStore = {
  theme: string
  draft: number
  toggleTheme: () => void
  bumpDraft: () => void
}

const usePreferenceStore = create<PreferenceStore>()(
  persist(
    (set, get) => ({
      theme: '浅色',
      draft: 0,
      toggleTheme: () =>
        set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
      bumpDraft: () => set({ draft: get().draft + 1 }),
    }),
    {
      name: 'preference-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
```

切换主题后刷新，主题还在。增加草稿后刷新，草稿回到 `0`，因为它没有进入 `partialize`。

### 2. 组件仍然只选字段和 Action

```tsx
function ThemeToggle() {
  const theme = usePreferenceStore((state) => state.theme)
  const toggleTheme = usePreferenceStore((state) => state.toggleTheme)

  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  )
}
```

持久化发生在中间件里。组件不必在 `onClick` 里自己写 `localStorage`。

### 3. 查看存储和清空存储

```tsx
usePreferenceStore.persist.getOptions().name
usePreferenceStore.persist.clearStorage()
```

`getOptions().name` 读出当前键。`clearStorage()` 删掉存储项；界面上的 `theme` 不会因此回到「浅色」，要等下一次刷新且存储为空，才会使用初始化函数里的默认值。

### 4. 观察主题能跨刷新、草稿不能

下面的 Demo 把主题写入 `localStorage`，草稿只留在内存。切换主题后，存储 JSON 里只有 `theme`。增加草稿不会改存储。清空存储后主题仍显示当前值；刷新页面后主题回到「浅色」，草稿始终回到 `0`。增加无关计数时，主题和草稿面板不增加渲染次数。Demo 用一层同步存储包装 `localStorage`，只为让存储面板在同页写入和删除后立刻重绘，序列化规则仍是 `createJSONStorage`。

:::demo{id="react.zustand.learn.intermediate.persist.persist-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：把嵌套 Action 对象整份写入存储

**触发条件：** 写成 `actions: { toggleTheme }`，又没有 `partialize`，或 `partialize` 仍返回含 `actions` 的对象。

**原因：** `JSON.stringify` 会丢掉函数，嵌套对象变成 `{}`。水合浅合并时，空的 `actions` 覆盖当前 Store 里的函数。

**后果：** 刷新后点击按钮，报 Action 不是函数。

**错误示例：**

```tsx
persist(
  (set) => ({
    theme: '浅色',
    actions: {
      toggleTheme: () => set({ theme: '深色' }),
    },
  }),
  { name: 'preference-storage' },
)
```

**正确写法：**

```tsx
persist(
  (set, get) => ({
    theme: '浅色',
    toggleTheme: () =>
      set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
  }),
  {
    name: 'preference-storage',
    partialize: (state) => ({ theme: state.theme }),
  },
)
```

**验证方式：** 刷新后「切换主题」仍能把主题在浅色和深色之间切换。

### 错误：不写 partialize，把草稿和 loading 一并持久化

**触发条件：** 使用默认 `partialize`，Store 里还有 `draft` 或 `loading`。

**原因：** 默认会持久化整份可序列化字段。刷新后上一轮草稿和加载标记被当成新的初始事实。

**后果：** 用户看到未提交的草稿或一直转圈。

**错误示例：**

```tsx
persist(
  (set) => ({
    theme: '浅色',
    draft: 0,
    loading: false,
    toggleTheme: () => set({ theme: '深色' }),
  }),
  { name: 'preference-storage' },
)
```

**正确写法：**

```tsx
{
  name: 'preference-storage',
  partialize: (state) => ({ theme: state.theme }),
}
```

**验证方式：** 增加草稿后刷新，草稿回到 `0`；主题若已切到深色，刷新后仍是深色。

### 错误：两份 Store 使用同一个 name

**触发条件：** 偏好 Store 和会话 Store 都写成 `name: 'app-storage'`。

**原因：** `name` 就是存储键。后写入的一方覆盖同一条记录，水合时双方读到同一份 JSON。

**后果：** 一份 Store 的字段进到另一份里，或后写入的数据把先写入的偏好清掉。

**错误示例：**

```tsx
persist(createPreferences, { name: 'app-storage' })
persist(createSession, { name: 'app-storage' })
```

**正确写法：**

```tsx
persist(createPreferences, { name: 'preference-storage' })
persist(createSession, { name: 'session-storage' })
```

**验证方式：** 两份 Store 的 `persist.getOptions().name` 不相同。

### 错误：以为 clearStorage 会把内存重置回初始值

**触发条件：** 调用 `usePreferenceStore.persist.clearStorage()` 后，期望界面立刻回到「浅色」。

**原因：** `clearStorage` 只 `removeItem`。当前内存里的 `theme` 不变。随后任意 `set` 仍会按 `partialize` 再写入存储。

**后果：** 存储空了，界面还是深色；下一次切换主题，深色又被写回存储。

**错误示例：**

```tsx
usePreferenceStore.persist.clearStorage()
// 期望 theme 立刻变成「浅色」
```

**正确写法：**

```tsx
usePreferenceStore.persist.clearStorage()
usePreferenceStore.setState({ theme: '浅色' })
```

**验证方式：** 先切到深色，再清空存储，界面仍显示深色；刷新后才回到浅色。登出后要回到初始快照，仍用上一课的 `set(store.getInitialState(), true)`，那次 `set` 也会按 `partialize` 写入存储。

### 错误：默认浅合并盖掉嵌套对象里后来才有的字段

**触发条件：** 持久化了 `{ foo: { bar: 0 } }`，代码里当前 state 是 `{ foo: { bar: 0, baz: 1 } }`。

**原因：** 默认 merge 只浅合并一层。`foo` 整个被存储里的对象替换，`baz` 消失。

**后果：** 升级后新加的嵌套默认值在有旧存储时永远出不来。

**错误示例：**

```tsx
{
  name: 'preference-storage',
  // 使用默认 merge
}
```

**正确写法：**

```tsx
{
  name: 'preference-storage',
  partialize: (state) => ({ theme: state.theme }),
}
```

**验证方式：** 本课 Demo 只持久化顶层 `theme` 字符串，刷新后不会丢掉 Action 或其它顶层字段。需要嵌套对象时自己提供 merge，或只持久化扁平字段；版本迁移不在本课展开。
:::

## 六、原理与适用场景

### 1. 官方事实

README 的 Persist middleware 写明：可以从 `zustand/middleware` 导入 `persist` 和 `createJSONStorage`；`name` 必须唯一；`storage` 可选，默认 `localStorage`。

Persisting store data 写明：`name` 是唯一必填项；`partialize` 默认返回整份 state；默认 `merge` 是浅合并；同步存储在创建时完成水合；`clearStorage` 清除该 `name` 下的存储。

persist middleware 文档写明：`persist` 用于页面刷新或应用重启后恢复状态；`createJSONStorage` 使用 `JSON.parse` / `JSON.stringify`，不做运行时形状校验。非法 JSON 不会写进 Store；合法但形状不对的 JSON 会被当成状态合并。

`src/middleware/persist.ts` 里，每次 `set` 都会 `partialize` 后写入 `{ state, version }`。水合用 `merge` 的结果执行 `set(..., true)`。默认 `merge` 是 `{ ...currentState, ...persistedState }`。`clearStorage` 只调用 `removeItem`。

### 2. 课程推导

只把跨刷新仍有意义、且能被 JSON 表示的数据交给 `persist`。Action、草稿、请求过程字段留在内存。顶层函数碰巧能在浅合并后活下来，嵌套 Action 对象不能；所以用 `partialize` 明确白名单，而不是依赖序列化删函数。

### 3. 适用边界

本课只讲 React 绑定 Store 上的 `persist`、`name`、默认 JSON 存储、`partialize` 和同步 `localStorage` 水合。`version` / `migrate`、自定义 IndexedDB、`skipHydration`、SSR 与 hydration 不一致、以及和 `devtools` 组合，都不在这里展开。

## 七、练习

:::exercise
### 为偏好 Store 加上 persist

**要求：** 已有一份偏好 Store，包含 `theme`、`draft`、`toggleTheme`、`bumpDraft`。用 `persist` 包裹初始化函数。`name` 设为 `preference-storage`。使用 `createJSONStorage(() => localStorage)`。`partialize` 只返回 `{ theme: state.theme }`。不要持久化 `draft` 和 Action，不要设置 `version` 或 `migrate`。

**验收：** 切换到深色并增加草稿后，存储 JSON 的 `state` 只有 `theme`。刷新后主题仍是深色，草稿回到 `0`，`toggleTheme` 仍可调用。

**参考答案：**

```tsx
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type PreferenceStore = {
  theme: string
  draft: number
  toggleTheme: () => void
  bumpDraft: () => void
}

const usePreferenceStore = create<PreferenceStore>()(
  persist(
    (set, get) => ({
      theme: '浅色',
      draft: 0,
      toggleTheme: () =>
        set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
      bumpDraft: () => set({ draft: get().draft + 1 }),
    }),
    {
      name: 'preference-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
```
:::

## 八、本节小结

- `persist` 在每次 `set` 后按 `partialize` 写入存储，创建时再读回浅合并。
- `name` 必须唯一；默认 JSON 存储只适合可序列化的数据字段。
- 用 `partialize` 明确白名单，不要把 Action、草稿和 loading 写进存储。
- `clearStorage` 只删存储，不重置内存；嵌套对象默认浅合并会整层替换。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 README Persist middleware](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - persist 导入方式、name 与默认存储。
- [Zustand 5.0.15 Persisting store data](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/integrations/persisting-store-data.md) - name、partialize、浅合并与 clearStorage。
- [Zustand 5.0.15 persist middleware reference](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/persist.md) - persist 签名与 createJSONStorage 警告。
- [Zustand 5.0.15 persist middleware implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/persist.ts) - 写入形态、merge 与 clearStorage 的实现。
