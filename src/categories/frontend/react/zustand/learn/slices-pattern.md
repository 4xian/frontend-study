---
id: react.zustand.learn.intermediate.slices-pattern
type: lesson
title: Slices Pattern
summary: 把一份 Store 拆成多个 slice 函数，再展开合并成同一份 React 绑定 Store。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.intermediate.subscribe
related:
  - react.zustand.learn.intermediate.subscribe
  - react.zustand.learn.basics.typescript-store
tags:
  - Zustand
  - Slices Pattern
  - StateCreator
  - 模块组织
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能把字段和 Action 写成独立的 slice 函数，每个函数返回自己那一段对象。
  - 能在 create 里用展开把多个 slice 合并成一份 Store。
  - 能用 StateCreator 标注 slice：整份 Store 类型在前，本段返回类型在后。
  - 能说明中间件只包合并后的 Store，不要包进单个 slice。
recap:
  - Slices Pattern 拆的是初始化函数，不是多份独立 Store。
  - 合并写法是把每个 slice 的返回对象展开进同一份 create。
  - slice 可以 get 到其他 slice 的字段和 Action，因为运行时只有一份 state。
  - 同名键后写的 slice 会盖住先写的；中间件只加在合并结果上。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README Best practices
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 组织代码时可以把 Store 拆成独立 slices。
  - title: Zustand 5.0.15 Slices Pattern
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/slices-pattern.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 可以把主 Store 拆成更小的独立片段，再合并成一份 bounded store。
      - "合并写法是 create((...a) => ({ ...createBearSlice(...a), ...createFishSlice(...a) }))。"
      - 一个 slice 可以用 get 调用另一个 slice 的 Action。
      - 中间件只加在合并后的 Store 上，不要加进单个 slice。
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
      - "slice 用 StateCreator<整份 Store, [], [], 本段 Slice> 标注。"
      - 合并时 create 的类型是各 slice 的交叉类型。
      - 若合并后还要包中间件，把 mutator 写进 StateCreator 的第二参数。
  - title: Zustand 5.0.15 vanilla StateCreator type
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - "StateCreator 第四个类型参数 U 是该函数实际返回的片段，默认等于整份 T。"
      - slice 拿到的 set 和 get 仍针对整份 Store。
---

# Slices Pattern

## 一、学习目标

- 把字段和 Action 写成独立的 slice 函数，每个函数只返回自己那一段。
- 在 `create` 里展开多个 slice，得到一份 Store。
- 用 `StateCreator` 标注：整份 Store 在前，本段返回类型在后。
- 中间件只包合并后的 Store，不包进单个 slice。

## 二、为什么需要拆 slice

一份偏好 Store 同时放主题、草稿和跨片段命令时，初始化函数会越写越长。改主题的人必须翻完整份对象，才找得到自己的字段。

官方文档把这件事叫 Slices Pattern：把主 Store 拆成更小的独立片段，再合并成一份 bounded store。README 的最佳实践也指向同一条路。

拆开之后，运行时仍然只有一份 Store、一次浅合并、一套 listener。组件继续对这份 Hook 做原子选择。Slice 不是新的 Store API，也不是多实例。

## 三、核心概念

### 1. slice 是返回片段对象的初始化函数

官方示例把鱼和熊写成两个函数，参数仍然是 `set`（以及需要时的 `get`）：

```js
export const createFishSlice = (set) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
})

export const createBearSlice = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  eatFish: () => set((state) => ({ fishes: state.fishes - 1 })),
})
```

每个函数只负责自己那一段字段和 Action。`eatFish` 写的是另一个 slice 的 `fishes`，因为合并后它们在同一份 state 里。

### 2. 展开后仍是一份 Store

官方合并写法把每个 slice 的返回值展开进同一个对象：

```js
export const useBoundStore = create((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
}))
```

`...a` 就是初始化函数收到的 `set`、`get` 和 `store`。各 slice 共享同一组参数，因此共享同一份 state。

组件仍然只选字段：

```tsx
const bears = useBoundStore((state) => state.bears)
const addBear = useBoundStore((state) => state.addBear)
```

没有 `useBearStore` 和 `useFishStore` 两套 Hook。增加熊时，只选 `fishes` 的组件不会重渲染。

### 3. TypeScript 用 StateCreator 描述片段

高级 TypeScript 指南给 slice 的标注是：第一个类型参数是整份 Store，第四个是这个函数实际返回的片段。

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
  addThemeAndDraft: () => void
}

type BoundStore = ThemeSlice & DraftSlice & SharedSlice

const createThemeSlice: StateCreator<BoundStore, [], [], ThemeSlice> = (set, get) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
})
```

`set` / `get` 看到的是 `BoundStore`，所以 `eatFish` 这类跨片段写入能通过类型检查。返回值被收成 `ThemeSlice`，这个函数不能顺手再塞 `draft`。

合并时把交叉类型交给 `create`：

```tsx
const useBoundStore = create<BoundStore>()((...a) => ({
  ...createThemeSlice(...a),
  ...createDraftSlice(...a),
  ...createSharedSlice(...a),
}))
```

### 4. 跨片段命令走 get，中间件只包合并结果

官方可以用第三个 slice 一次调用两个 Action：

```tsx
const createSharedSlice: StateCreator<BoundStore, [], [], SharedSlice> = (set, get) => ({
  addThemeAndDraft: () => {
    get().toggleTheme()
    get().bumpDraft()
  },
})
```

`get()` 读到的是已经合并完成的当前 state，不是“自己那一段”。

官方写明：中间件只加在合并后的 Store 上。维护者补充：中间件按 Store 级设计，不能用在单个 slice 上。本课 Demo 不包 persist 或 devtools；需要时包在最外层的合并函数上。

## 四、用法与示例

### 1. 先声明各段类型，再写 slice

```tsx
const createDraftSlice: StateCreator<BoundStore, [], [], DraftSlice> = (set, get) => ({
  draft: 0,
  bumpDraft: () => set({ draft: get().draft + 1 }),
})
```

字段名在各 slice 之间必须唯一。对象展开是后写覆盖先写：两个 slice 都返回 `draft` 时，后面那个留下，前面那个的 Action 也会一起被盖掉。

### 2. 合并时保持一份 Hook

```tsx
const useBoundStore = create<BoundStore>()((...a) => ({
  ...createThemeSlice(...a),
  ...createDraftSlice(...a),
  ...createSharedSlice(...a),
}))
```

不要写成两次 `create`。两次 `create` 是两份 Store，主题和草稿不再共享一次 `set`。

### 3. 组件继续原子选择

```tsx
function ThemePanel() {
  const theme = useBoundStore((state) => state.theme)
  const toggleTheme = useBoundStore((state) => state.toggleTheme)
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  )
}
```

slice 边界不影响订阅范围。选择精度仍然由选择函数决定。

### 4. 观察两段字段独立更新、共享命令一起更新

下面的 Demo 把主题、草稿和跨片段命令分成三个 slice，再展开进一份 Store。切换主题时草稿面板不增加渲染次数；增加草稿时主题面板也不增加。共享命令会同时改两个字段。无关计数仍在主题和草稿之外。

:::demo{id="react.zustand.learn.intermediate.slices-pattern.slices-pattern-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：把每个 slice 各自 create 成一份 Store

**触发条件：** 写成 `create(createThemeSlice)` 和 `create(createDraftSlice)`，再在组件里分别调用两套 Hook。

**原因：** Slices Pattern 的官方合并发生在一次 `create` 内部。两次 `create` 会得到两份 state、两套 listener。`get()` 看不到另一份里的字段。

**后果：** 共享命令无法同时改主题和草稿；重置、持久化也要对两份各做一次。

**错误示例：**

```tsx
const useThemeStore = create<ThemeSlice>()(createThemeSlice)
const useDraftStore = create<DraftSlice>()(createDraftSlice)
```

**正确写法：**

```tsx
const useBoundStore = create<BoundStore>()((...a) => ({
  ...createThemeSlice(...a),
  ...createDraftSlice(...a),
}))
```

**验证方式：** 调用共享命令后，主题和草稿都变化，且来自同一个 Hook。

### 错误：两个 slice 使用同一个键

**触发条件：** `createThemeSlice` 和 `createDraftSlice` 都返回 `reset`，合并时后写的展开在后面。

**原因：** 普通对象展开按键覆盖。运行时不会报错，只留下后一个函数。

**后果：** 点“重置”时只清草稿，主题保持原值，看起来像 Action 丢了。

**错误示例：**

```js
const createThemeSlice = (set) => ({
  theme: '浅色',
  reset: () => set({ theme: '浅色' }),
})
const createDraftSlice = (set) => ({
  draft: 0,
  reset: () => set({ draft: 0 }),
})
```

**正确写法：**

```js
const createThemeSlice = (set) => ({
  theme: '浅色',
  resetTheme: () => set({ theme: '浅色' }),
})
const createDraftSlice = (set) => ({
  draft: 0,
  resetDraft: () => set({ draft: 0 }),
})
```

**验证方式：** 合并后 `getState()` 里每个 Action 名称只出现一次，且行为对得上所属片段。

### 错误：把 persist 或 devtools 包进单个 slice

**触发条件：** 写成 `persist(createThemeSlice, { name: 'theme' })`，再把返回值展开进合并对象。

**原因：** 官方文档要求中间件只加在合并后的 Store 上。维护者说明：中间件按 Store 级设计，不能用在 slice 上。slice 返回的是片段对象，不是完整 Store API。

**后果：** 水合后方法丢失，或一个片段上的 `actions` 引用被改写到另一段。

**错误示例：**

```tsx
const useBoundStore = create((...a) => ({
  ...persist(createThemeSlice, { name: 'theme' })(...a),
  ...createDraftSlice(...a),
}))
```

**正确写法：**

```tsx
const useBoundStore = create(
  persist(
    (...a) => ({
      ...createThemeSlice(...a),
      ...createDraftSlice(...a),
    }),
    { name: 'bound-store' },
  ),
)
```

**验证方式：** 中间件出现在最外层合并函数上；单个 `createThemeSlice` 文件里没有 `persist` 或 `devtools`。

### 错误：StateCreator 只写本段类型，跨片段 get 失去检查

**触发条件：** 写成 `StateCreator<ThemeSlice, [], [], ThemeSlice>`，却在 slice 里 `get().bumpDraft()`。

**原因：** 官方标注的第一个参数是整份 `BearSlice & FishSlice`。只写本段时，`get()` 的类型里没有另一段的 Action。

**后果：** 要么编译失败，要么用断言绕过，运行时才发现合并顺序写错。

**错误示例：**

```tsx
const createThemeSlice: StateCreator<ThemeSlice, [], [], ThemeSlice> = (
  set,
  get,
) => ({
  theme: '浅色',
  toggleTheme: () => get().bumpDraft(),
})
```

**正确写法：**

```tsx
const createThemeSlice: StateCreator<BoundStore, [], [], ThemeSlice> = (
  set,
  get,
) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
})
```

**验证方式：** `get()` 能补全其他 slice 的字段；本函数的返回值仍只能包含 `ThemeSlice` 的键。

### 错误：以为 slice 会自动做成嵌套命名空间

**触发条件：** 合并后写成 `state.themeSlice.theme`，或期望 Hook 变成 `useBoundStore.use.themeSlice`。

**原因：** 官方展开的是扁平对象。`theme` 和 `toggleTheme` 直接出现在根上。嵌套命名空间需要自己返回 `{ theme: { ... } }`，那是另一份形状，不是默认 Slices Pattern。

**后果：** 选择函数读不到字段，界面空白。

**错误示例：**

```tsx
const theme = useBoundStore((state) => state.themeSlice.theme)
```

**正确写法：**

```tsx
const theme = useBoundStore((state) => state.theme)
```

**验证方式：** `getState()` 的顶层同时能看到 `theme` 和 `draft`，没有额外的 `themeSlice` 包裹对象。
:::

## 六、原理与适用场景

### 1. 官方事实

README 把“把 Store 拆成独立 slices”列为代码组织方式。Slices Pattern 文档写明：主 Store 可以拆成更小的独立片段，再合并成一份 bounded store；合并用对象展开；一个 slice 可以用 `get` 调用另一个 slice 的 Action；中间件只加在合并结果上。

高级 TypeScript 指南用 `StateCreator<整份交叉类型, [], [], 本段>` 标注每个 slice，再用 `create<交叉类型>()((...a) => ({ ... }))` 合并。若合并后包 `devtools`，把 `["zustand/devtools", never]` 放进第二参数。

`StateCreator` 的第四个类型参数 `U` 是该函数返回的片段，默认等于整份 `T`。`set` / `get` 始终针对 `T`。

### 2. 课程推导

Slice 解决的是文件和类型边界，不改变更新模型。浅合并、原子选择、`subscribe` 仍然作用在合并后的那一份 state 上。跨片段命令优先 `get().existingAction()`，让已有 Action 自己决定怎么 `set`。

同名键覆盖是普通 JavaScript 展开，不是 Zustand 额外规则。键名必须在合并前就错开。

### 3. 适用边界

本课只讲 React 绑定 Store 上的 Slices Pattern：slice 函数、展开合并、`StateCreator` 四参数、跨片段 `get`，以及中间件只包合并结果。嵌套命名空间、`combine` 中间件、在 slice 上标注 persist/devtools mutator 的完整中间件组合、Immer、多实例 Store Factory，都不在这里展开。

## 七、练习

:::exercise
### 把偏好 Store 拆成三个 slice

**要求：** 创建一份 `BoundStore`，由 `ThemeSlice`、`DraftSlice`、`SharedSlice` 交叉而成。`ThemeSlice` 含 `theme` 与 `toggleTheme`。`DraftSlice` 含 `draft` 与 `bumpDraft`。`SharedSlice` 含 `addThemeAndDraft`，内部依次调用 `get().toggleTheme()` 和 `get().bumpDraft()`。每个 slice 用 `StateCreator<BoundStore, [], [], 本段>` 标注。用一次 `create<BoundStore>()` 展开合并。不要给单个 slice 包中间件，也不要创建第二份 Store。

**验收：** 只调用 `toggleTheme` 时 `draft` 不变；只调用 `bumpDraft` 时 `theme` 不变；调用 `addThemeAndDraft` 一次后，主题切换且草稿加一；`getState()` 顶层能直接读到 `theme` 和 `draft`。

**参考答案：**

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
  addThemeAndDraft: () => void
}

type BoundStore = ThemeSlice & DraftSlice & SharedSlice

const createThemeSlice: StateCreator<BoundStore, [], [], ThemeSlice> = (set, get) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
})

const createDraftSlice: StateCreator<BoundStore, [], [], DraftSlice> = (set, get) => ({
  draft: 0,
  bumpDraft: () => set({ draft: get().draft + 1 }),
})

const createSharedSlice: StateCreator<BoundStore, [], [], SharedSlice> = (set, get) => ({
  addThemeAndDraft: () => {
    get().toggleTheme()
    get().bumpDraft()
  },
})

const useBoundStore = create<BoundStore>()((...a) => ({
  ...createThemeSlice(...a),
  ...createDraftSlice(...a),
  ...createSharedSlice(...a),
}))
```
:::

## 八、本节小结

- Slices Pattern 拆的是初始化函数，合并后仍是一份 Store。
- 用对象展开接入 `create`；同名键后写的会盖住先写的。
- `StateCreator` 第一个参数是整份交叉类型，第四个是本段返回值。
- 中间件只包合并结果；组件继续按字段做原子选择。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 README Best practices](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 把 Store 拆成独立 slices。
- [Zustand 5.0.15 Slices Pattern](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/slices-pattern.md) - 展开合并、跨片段 get、中间件只加在合并结果上。
- [Zustand Discussion 3370 persist 不能包进 slice](https://github.com/pmndrs/zustand/discussions/3370) - 维护者说明中间件按 Store 级设计，不能用在单个 slice 上。
- [Zustand 5.0.15 Advanced TypeScript Slices pattern](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/advanced-typescript.md) - StateCreator 四参数与交叉类型。
- [Zustand 5.0.15 vanilla StateCreator type](https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts) - 片段返回类型 U 与整份 T 的关系。
