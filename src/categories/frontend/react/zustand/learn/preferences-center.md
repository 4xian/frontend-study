---
id: react.zustand.learn.intermediate.preferences-center
type: lesson
title: 实战：偏好设置中心
summary: 用切片合并一份偏好 Store，只把主题写入存储，草稿和说明开关留在各自的所有者手里。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 55
prerequisites:
  - react.zustand.learn.intermediate.slices-pattern
related:
  - react.zustand.learn.intermediate.slices-pattern
  - react.zustand.learn.intermediate.persist
  - react.zustand.learn.intermediate.state-reset
tags:
  - Zustand
  - 偏好设置
  - Slices Pattern
  - persist
  - 实战
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能把主题、草稿和共享命令拆成 slice，再展开进一份 React 绑定 Store。
  - 能只在合并后的 Store 上包 persist，并用 partialize 只留下主题。
  - 能用浅合并重置主题和草稿，不把说明开关放进 Store。
  - 能按字段做原子选择，并从主题派生展示文案，不把派生结果写回 Store。
recap:
  - 偏好设置中心仍是一份 Store；slice 只拆初始化函数。
  - persist 包在合并结果上；partialize 只留下需要跨刷新的字段。
  - 重置写回主题和草稿，不改组件私有说明，也不清无关计数。
  - 组件继续按字段订阅；深色与否在渲染时从主题算出来。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 Slices Pattern
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/slices-pattern.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 可以把主 Store 拆成更小的独立片段，再合并成一份 bounded store。
      - "合并写法是 create((...a) => ({ ...createBearSlice(...a), ...createFishSlice(...a) }))。"
      - persist 只加在合并后的 Store 上，不要加进单个 slice。
  - title: Zustand Discussion 3370 persist 不能包进 slice
    url: https://github.com/pmndrs/zustand/discussions/3370
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 维护者说明中间件按 Store 级设计，不能用在 slices pattern 的单个 slice 上。
      - persist 包进单个 slice 时，可能改写该片段上的 actions 引用。
  - title: Zustand 5.0.15 Advanced TypeScript Slices pattern
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/advanced-typescript.md
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - "slice 用 StateCreator<整份 Store, Mutators, [], 本段 Slice> 标注。"
      - 合并后若包 persist，把 zustand/persist 写进 StateCreator 的第二参数。
  - title: Zustand 5.0.15 Persisting store data
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/integrations/persisting-store-data.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - name 是唯一必填选项。
      - partialize 用来挑选写入存储的字段。
      - clearStorage 只清除该 name 下的存储项。
  - title: Zustand Beginner TypeScript Resetting the Store
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/beginner-typescript.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - "官方示例抽出 initialState，用 reset: () => set(initialState) 写回。"
  - title: Zustand 5.0.15 README Overwriting state
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - set 的第二个参数默认为 false，传入 true 时改为替换整份状态模型。
      - "替换时不要清掉仍需使用的部分，例如 Action。"
  - title: React Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 避免保存可以从现有数据计算出来的重复状态。
---

# 实战：偏好设置中心

## 一、学习目标

- 把主题、草稿和共享命令拆成 slice，再展开进一份 Store。
- 只在合并结果上包 `persist`，用 `partialize` 只留下主题。
- 浅合并重置主题和草稿，说明开关留在组件里。
- 按字段做原子选择，并从主题派生展示文案。

## 二、为什么要做偏好设置中心

前面已经分开学过原子选择、派生状态、重置、`persist` 和 Slices Pattern。偏好设置中心把它们收进同一份工作区：主题和草稿被多个面板共用，主题刷新后还要在，草稿只是当前编辑过程，说明开合只服务当前按钮。

如果把这些字段塞进一个超长初始化函数，改主题的人必须翻完整份对象。如果给每个片段各自 `create`，共享重置就看不到另一份里的字段。如果把 `persist` 包进主题 slice，维护者已经说明中间件按 Store 级设计，不能用在单个 slice 上。这个实战同时看清“怎么拆”“存什么”和“订什么”。

## 三、核心概念

### 1. 一份 Store，三段 slice

官方 Slices Pattern 把主 Store 拆成更小的独立片段，再合并成一份 bounded store。主题、草稿和共享命令各写一个函数，返回自己那一段：

```tsx
import { create, type StateCreator } from 'zustand'

type ThemeSlice = {
  theme: string
  toggleTheme: () => void
}

type DraftSlice = {
  draft: number
  bumpDraft: () => void
}

type SharedSlice = {
  resetPreferences: () => void
}

type BoundStore = ThemeSlice & DraftSlice & SharedSlice
```

运行时仍然只有一份 state、一次浅合并、一套 listener。没有 `useThemeStore` 和 `useDraftStore` 两套 Hook。

### 2. persist 只包合并结果，partialize 只留主题

Slices Pattern 文档给出的 persist 示例，写在合并后的 `create` 上。`name` 是唯一必填项。默认 `partialize` 返回整份 state；本课只恢复主题，所以白名单写成 `{ theme: state.theme }`。

草稿、说明开关、无关计数都不进存储。刷新后主题还在，草稿回到初始值。

合并后包了 persist，slice 的 `StateCreator` 第二参数要带上 `["zustand/persist", unknown]`。`set` / `get` 仍然针对整份 `BoundStore`。

### 3. 重置是浅合并，不是清空存储

Beginner TypeScript 把重置写成 `set(initialState)`。这里只写回主题和草稿：

```tsx
resetPreferences: () => set({ theme: '浅色', draft: 0 }),
```

默认浅合并：这两个字段回到初始值，Action 保留，无关计数还在。`clearStorage()` 只删除该 `name` 下的存储项，不把内存里的主题改回浅色。

说明是否展开只有当前按钮使用，继续 `useState`。重置偏好不应顺便关掉说明。

### 4. 选择字段，派生展示

深色与否可以从 `theme` 算出来，不要再存 `isDark`。选择函数一次取一个已有字段；会 new 出对象的派生留在组件渲染里。改草稿时，只订主题的面板不应增加渲染次数。

## 四、用法与示例

### 1. 先声明各段，再在合并处包 persist

```tsx
import { persist, createJSONStorage } from 'zustand/middleware'

type PersistMutators = [['zustand/persist', unknown]]

const createThemeSlice: StateCreator<BoundStore, PersistMutators, [], ThemeSlice> = (
  set,
  get,
) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
})

const usePreferenceStore = create<BoundStore>()(
  persist(
    (...a) => ({
      ...createThemeSlice(...a),
      ...createDraftSlice(...a),
      ...createSharedSlice(...a),
    }),
    {
      name: 'preference-center-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
```

`...a` 是同一组 `set`、`get` 和 `store`。各 slice 共享一份 state。

### 2. 拆开订阅者

- 主题面板只选择 `theme`。
- 草稿面板只选择 `draft`。
- 派生文案只选择 `theme`，再判断是不是深色。
- 按钮只选择对应 Action。
- 父组件只选择无关计数的 `tick`，计数本身交给独立展示。

这样切换主题时草稿面板不重渲染；增加无关计数时，主题和草稿面板都不动。

### 3. 观察偏好中心

下面的 Demo 把主题、草稿和共享命令分成三个 slice，只把主题写入存储。切换主题后，存储 JSON 里只有 `theme`。增加草稿不会改存储。重置偏好只恢复主题和草稿，说明仍打开，无关计数仍在。清空存储不会立刻改界面上的主题。Demo 用一层同步存储包装 `localStorage`，只为让存储面板在同页写入和删除后立刻重绘，序列化规则仍是 `createJSONStorage`。

:::demo{id="react.zustand.learn.intermediate.preferences-center.preferences-center-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：给主题和草稿各自 create 一份 Store

**触发条件：** 写成 `create(createThemeSlice)` 和 `create(createDraftSlice)`，再分别订阅两套 Hook。

**原因：** Slices Pattern 的官方合并发生在一次 `create` 内部。两次 `create` 是两份 state。`resetPreferences` 的 `get()` 看不到另一份里的字段。

**后果：** 重置只清主题或只清草稿；persist 也要对两份各做一次，还容易抢同一个 `name`。

**错误示例：**

```tsx
const useThemeStore = create<ThemeSlice>()(createThemeSlice)
const useDraftStore = create<DraftSlice>()(createDraftSlice)
```

**正确写法：**

```tsx
const usePreferenceStore = create<BoundStore>()(
  persist(
    (...a) => ({
      ...createThemeSlice(...a),
      ...createDraftSlice(...a),
      ...createSharedSlice(...a),
    }),
    { name: 'preference-center-storage' },
  ),
)
```

**验证方式：** 调用重置后，主题和草稿都回到初始值，且来自同一个 Hook。

### 错误：把 persist 包进主题 slice

**触发条件：** 写成 `persist(createThemeSlice, { name: 'theme' })`，再把返回值展开进合并对象。

**原因：** 官方文档要求中间件只加在合并后的 Store 上。维护者说明中间件按 Store 级设计，不能用在 slice 上。

**后果：** 水合后方法丢失，或一个片段上的 `actions` 引用被改写到另一段。

**错误示例：**

```tsx
const usePreferenceStore = create((...a) => ({
  ...persist(createThemeSlice, { name: 'theme' })(...a),
  ...createDraftSlice(...a),
}))
```

**正确写法：**

```tsx
const usePreferenceStore = create(
  persist(
    (...a) => ({
      ...createThemeSlice(...a),
      ...createDraftSlice(...a),
    }),
    { name: 'preference-center-storage' },
  ),
)
```

**验证方式：** 单个 `createThemeSlice` 里没有 `persist`；`persist` 出现在最外层合并函数上。

### 错误：不写 partialize，把草稿一并持久化

**触发条件：** 使用默认 `partialize`，Store 里还有 `draft`。

**原因：** 默认会持久化整份可序列化字段。刷新后上一轮未提交的草稿被当成新的初始事实。

**后果：** 用户看到不该跨刷新保留的编辑过程。

**错误示例：**

```tsx
persist(
  (...a) => ({
    ...createThemeSlice(...a),
    ...createDraftSlice(...a),
  }),
  { name: 'preference-center-storage' },
)
```

**正确写法：**

```tsx
{
  name: 'preference-center-storage',
  partialize: (state) => ({ theme: state.theme }),
}
```

**验证方式：** 增加草稿后刷新，草稿回到 `0`；主题若已切到深色，刷新后仍是深色。

### 错误：把说明开关和派生深色标记写进 Store

**触发条件：** Store 增加 `helpOpen` 和 `isDark`，重置时一并关掉说明。

**原因：** 说明只服务当前按钮。深色与否可以从 `theme` 算出来。React 的状态结构指南要求不要保存能算出来的重复数据。

**后果：** 重置误伤私有交互；改主题时漏写 `isDark`，界面和源事实分叉。

**错误示例：**

```tsx
resetPreferences: () => set({ theme: '浅色', draft: 0, helpOpen: false, isDark: false }),
```

**正确写法：**

```tsx
const [helpOpen, setHelpOpen] = useState(false)
const theme = usePreferenceStore((state) => state.theme)
const isDark = theme === '深色'
```

**验证方式：** 打开说明后点重置，说明仍打开；Store 类型没有 `helpOpen` 或 `isDark`。

### 错误：用 replace 重置却只传入主题和草稿

**触发条件：** 写成 `set({ theme: '浅色', draft: 0 }, true)`。

**原因：** `set` 的第二参数为 `true` 时整份模型被替换。只含 State 的对象会把 Action 清掉。

**后果：** 点「切换主题」报不是函数。

**错误示例：**

```tsx
resetPreferences: () => set({ theme: '浅色', draft: 0 }, true)
```

**正确写法：**

```tsx
resetPreferences: () => set({ theme: '浅色', draft: 0 }),
```

**验证方式：** 重置后按钮仍能切换主题、增加草稿；无关计数如果本就不该清，重置后仍保持。
:::

## 六、原理与适用场景

### 1. 官方事实

Slices Pattern 文档写明：主 Store 可以拆成独立片段再合并；persist 加在合并后的 Store 上。高级 TypeScript 指南用 `StateCreator<整份交叉类型, Mutators, [], 本段>` 标注 slice；合并后包 persist 时，第二参数带上 `zustand/persist`。

持久化文档写明：`name` 必填；`partialize` 挑选写入字段；`clearStorage` 只清存储项。Beginner TypeScript 用 `set(initialState)` 做浅合并重置。README 的 Overwriting state 写明：`set` 第二参数为 `true` 时替换整份模型，不要清掉 Action。React 状态结构指南要求不要保存能算出来的重复状态。

### 2. 课程推导

偏好设置中心的最小模型是：一份 Store、三段 slice、persist 只留主题、重置只写回共享偏好、说明留在组件、深色与否在渲染时派生。切片边界不影响订阅范围，选择精度仍然由选择函数决定。

### 3. 适用边界

本课只整合已经学过的 React 绑定 Store、Slices Pattern、persist、重置、原子选择和派生状态。不引入 `devtools` 组合、`subscribeWithSelector`、Immer、版本迁移、SSR 水合、Vanilla Store 或 Store Factory，也不把远程用户配置当成服务端缓存。

## 七、练习

:::exercise
### 补全偏好设置 Store

**要求：** 创建一份 `BoundStore`，由 `ThemeSlice`、`DraftSlice`、`SharedSlice` 交叉而成。`ThemeSlice` 含 `theme` 与 `toggleTheme`。`DraftSlice` 含 `draft` 与 `bumpDraft`。`SharedSlice` 含 `resetPreferences`，内部浅合并写回 `theme: '浅色'` 和 `draft: 0`。每个 slice 用 `StateCreator<BoundStore, [['zustand/persist', unknown]], [], 本段>` 标注。用一次 `create<BoundStore>()` 展开合并，并在合并结果上包 `persist`。`partialize` 只返回 `{ theme: state.theme }`。不要给单个 slice 包中间件，不要创建第二份 Store，也不要把说明开关或 `isDark` 写入 Store。

**验收：** 只调用 `toggleTheme` 时 `draft` 不变；增加草稿后刷新，草稿回到 `0`，已切换的主题仍在；调用 `resetPreferences` 后主题和草稿回到初始值，Action 仍可用。

**参考答案：**

```tsx
import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeSlice = {
  theme: string
  toggleTheme: () => void
}

type DraftSlice = {
  draft: number
  bumpDraft: () => void
}

type SharedSlice = {
  resetPreferences: () => void
}

type BoundStore = ThemeSlice & DraftSlice & SharedSlice

type PersistMutators = [['zustand/persist', unknown]]

const createThemeSlice: StateCreator<BoundStore, PersistMutators, [], ThemeSlice> = (
  set,
  get,
) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
})

const createDraftSlice: StateCreator<BoundStore, PersistMutators, [], DraftSlice> = (
  set,
  get,
) => ({
  draft: 0,
  bumpDraft: () => set({ draft: get().draft + 1 }),
})

const createSharedSlice: StateCreator<BoundStore, PersistMutators, [], SharedSlice> = (set) => ({
  resetPreferences: () => set({ theme: '浅色', draft: 0 }),
})

const usePreferenceStore = create<BoundStore>()(
  persist(
    (...a) => ({
      ...createThemeSlice(...a),
      ...createDraftSlice(...a),
      ...createSharedSlice(...a),
    }),
    {
      name: 'preference-center-storage',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
```
:::

## 八、本节小结

- 偏好设置中心是一份 Store，用 slice 拆初始化函数。
- persist 只包合并结果，`partialize` 只留下需要跨刷新的字段。
- 重置浅合并写回共享偏好，不改组件私有说明，也不清无关计数。
- 组件按字段订阅；能算出来的展示值不要再存进 Store。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 Slices Pattern](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/slices-pattern.md) - 展开合并，persist 只加在合并结果上。
- [Zustand Discussion 3370 persist 不能包进 slice](https://github.com/pmndrs/zustand/discussions/3370) - 维护者说明中间件按 Store 级设计，不能用在单个 slice 上。
- [Zustand 5.0.15 Advanced TypeScript Slices pattern](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/advanced-typescript.md) - StateCreator 四参数与中间件 mutator。
- [Zustand 5.0.15 Persisting store data](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/integrations/persisting-store-data.md) - name、partialize 与 clearStorage。
- [Zustand Beginner TypeScript Resetting the Store](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/beginner-typescript.md) - 抽出初始值后浅合并重置。
- [Zustand 5.0.15 README Overwriting state](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - set 的 replace 参数会替换整份模型。
- [React Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - 不要保存可计算的重复状态。
