---
id: react.zustand.learn.advanced.middleware-composition
type: lesson
title: 中间件组合
summary: 把 persist、subscribeWithSelector 和 devtools 立刻写在 create 里，并按官方建议把 devtools 放在最外层。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 55
prerequisites:
  - react.zustand.learn.advanced.subscribe-with-selector
related:
  - react.zustand.learn.intermediate.persist
  - react.zustand.learn.intermediate.devtools
  - react.zustand.learn.advanced.subscribe-with-selector
  - react.zustand.learn.advanced.advanced-typescript
tags:
  - Zustand
  - 中间件
  - persist
  - devtools
  - subscribeWithSelector
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-11
objectives:
  - 能把多个中间件立刻嵌套进 create，让上下文推断继续工作。
  - 能按官方建议把 devtools 放在最外层，例如 devtools 包住 persist。
  - 能说明组合后存储恢复、按切片订阅和 set 的第三参数可以同时存在。
  - 能识别先收成包装函数再传入 create 会丢掉推断。
recap:
  - 中间件必须立刻写在 create 里，不能先收成普通包装函数。
  - 官方建议把 devtools 放在最外层，因为它会改写 setState 并加上类型参数。
  - 官方测试使用 devtools 包住 subscribeWithSelector，再包住 persist。
  - 每个中间件仍只做自己那件事，组合不会改 Hook 选择规则。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 Advanced TypeScript Guide Using middlewares
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/advanced-typescript.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 使用中间件时不必写特殊 TypeScript 语法。
      - 官方示例是 create 的柯里化写法里立刻写 devtools(persist(...))。
      - 中间件必须立刻写在 create 里，上下文推断才能工作。
      - 先写成 myMiddlewares 这种包装函数会需要更复杂的类型。
      - 建议把 devtools 尽量放在最后，例如写成 devtools(immer(...))，不要写成 immer(devtools(...))。
      - "devtools 会改写 setState 并加上类型参数，后包上去的中间件若也改写 setState，这个参数可能丢失。"
  - title: Zustand 5.0.15 middlewareTypes tests
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/tests/middlewareTypes.test.tsx
    sourceType: official-test
    appliesTo: Zustand 5.0.15
    claims:
      - 双中间件示例是 devtools 包住 persist。
      - 三中间件示例是 devtools 包住 subscribeWithSelector，再包住 persist。
      - 四中间件示例是 devtools 包住 subscribeWithSelector，再包 persist，再包 immer。
      - 组合后仍能检查 persist.hasHydrated、带选择函数的 subscribe，以及 setState 的第三参数。
  - title: Zustand 5.0.15 persist middleware implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/persist.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - persist 会再包一层 api.setState，写入后调用存储。这是固定版本实现，不是另一套公共合同。
  - title: Zustand 5.0.15 devtools middleware implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/devtools.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - devtools 会改写 api.setState，给写入加上第三参数后再发给扩展。这是固定版本实现，不是另一套公共合同。
  - title: Zustand 5.0.15 subscribeWithSelector implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/subscribeWithSelector.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - subscribeWithSelector 只改写 api.subscribe，不改写 setState。这是固定版本实现，不是另一套公共合同。
  - title: Zustand Discussion 2389 middleware priority
    url: https://github.com/pmndrs/zustand/discussions/2389
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 文档建议把 devtools 放在最后。
      - 同一页的示例写成 devtools 包住 persist。
      - 维护者说明中间件顺序主要影响类型和文档，devtools(persist) 与 persist(devtools) 运行时都可以工作。
---

# 中间件组合

## 一、学习目标

- 把多个中间件立刻嵌套进 `create`，让上下文推断继续工作。
- 按官方建议把 `devtools` 放在最外层，例如 `devtools` 包住 `persist`。
- 说明组合后存储恢复、按切片订阅和 `set` 的第三参数可以同时存在。
- 识别先收成包装函数再传入 `create` 会丢掉推断。

## 二、为什么单个中间件不够

`persist`、`devtools` 和 `subscribeWithSelector` 已经分别讲过。一份偏好 Store 常常要同时做三件事：主题跨刷新还在、时间线能叫出写入名称、外部 listener 只关心主题。

这时不是再学一套新 API，而是把已有中间件嵌套进同一次 `create`。嵌套顺序会影响 TypeScript 能不能留下 `set` 的第三参数，也会影响 Hook 上能不能同时看到 `persist` 和带选择函数的 `subscribe`。官方高级 TypeScript 指南把这件事收成两条：立刻写在 `create` 里；`devtools` 尽量放在最后。

## 三、核心概念

### 1. 中间件必须立刻写在 create 里

指南写明：TypeScript 使用中间件时不必换语法，但必须立刻出现在 `create` 里，上下文推断才能工作。官方完整示例是：

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type PreferenceStore = {
  theme: string
  draft: number
  toggleTheme: () => void
  bumpDraft: () => void
}

const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    persist(
      (set, get) => ({
        theme: '浅色',
        draft: 0,
        toggleTheme: () =>
          set(
            { theme: get().theme === '浅色' ? '深色' : '浅色' },
            undefined,
            'preference/toggleTheme',
          ),
        bumpDraft: () => set({ draft: get().draft + 1 }),
      }),
      { name: 'preference-storage' },
    ),
    { name: 'PreferenceStore' },
  ),
)
```

`create<PreferenceStore>()` 的空括号仍然只标注 state。中间件各自的 mutator 由这一层嵌套推断：`devtools` 是 `["zustand/devtools", never]`，`persist` 是 `["zustand/persist", YourPersistedState]`，`subscribeWithSelector` 是 `["zustand/subscribeWithSelector", never]`。

不要先写成：

```ts
const myMiddlewares = (f) => devtools(persist(f, { name: 'preference-storage' }))
```

指南把这种写法称为需要更复杂类型的用法。本课不展开那些类型。

### 2. 把 devtools 放在最外层

指南建议：`devtools` 尽量放在最后。和 `immer` 一起用时，应写成 `devtools(immer(...))`，不要写成 `immer(devtools(...))`。原因写在同一段：`devtools` 会改写 `setState` 并给它加上类型参数；后包上去、同样改写 `setState` 的中间件可能把这个参数丢掉。

官方测试把这条落实成固定嵌套：

```ts
create<PreferenceStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          /* state 与 Action */
        }),
        { name: 'preference-storage' },
      ),
    ),
    { name: 'PreferenceStore' },
  ),
)
```

从外到内读：`devtools` → `subscribeWithSelector` → `persist` → 初始化函数。`persist` 的 `name` 是存储键；`devtools` 的 `name` 是 DevTools 连接名。两把钥匙不是同一个字段。

维护者在讨论里补充：`devtools(persist(...))` 和 `persist(devtools(...))` 运行时都可以工作，顺序主要影响类型和文档。课程仍按指南和官方测试，把 `devtools` 放在最外层。

### 3. 组合后三套能力还在，只是叠在同一份 Store 上

官方 `middlewareTypes` 测试在 `devtools(subscribeWithSelector(persist(...)))` 之后同时检查：

- `useBoundStore.persist.hasHydrated()` 仍是 `boolean`
- `useBoundStore.subscribe((state) => state.count, listener)` 仍返回取消函数
- `useBoundStore.setState({ count: 0 }, false, 'reset')` 仍能传入第三参数

固定版本实现里，三个中间件改的不是同一处：`persist` 再包 `api.setState` 以便写入存储；`devtools` 再包 `api.setState` 以便发送带名称的 action；`subscribeWithSelector` 只改 `api.subscribe`。这是源码事实，不是另一套公共合同。组合不会改 Hook 选择规则，也不会让 `persist` 自动给 `set` 起名。

每个中间件的选项仍按自己那一课填写。`partialize` 继续只留下要恢复的字段；选择订阅继续自己传 `equalityFn`；命名写入继续把 `replace` 留成 `undefined`。

### 4. 观察同一份 Store 上的存储、切片订阅和时间线

下面的 Demo 按官方测试顺序组合三个中间件。左侧是 `partialize` 之后的存储 JSON，只保留主题。中间按主题切片订阅：切换主题才追加，增加草稿或无关计数不会。右侧收集演示连接收到的 action 名称；点「切换主题」应出现 `preference/toggleTheme`。`devtools` 在生产环境默认关闭，Demo 显式打开 `enabled`，演示连接才能收到这些名称。

:::demo{id="react.zustand.learn.advanced.middleware-composition.middleware-composition-demo"}
:::

## 四、用法与示例

### 1. 日常写法保持柯里化，中间件写在括号里

```ts
const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          theme: '浅色',
          draft: 0,
          toggleTheme: () =>
            set(
              { theme: get().theme === '浅色' ? '深色' : '浅色' },
              undefined,
              'preference/toggleTheme',
            ),
          bumpDraft: () => set({ draft: get().draft + 1 }),
        }),
        {
          name: 'preference-storage',
          partialize: (state) => ({ theme: state.theme }),
        },
      ),
    ),
    { name: 'PreferenceStore' },
  ),
)
```

叠中间件时继续用 `create<T>()(...)`，不要先收成包装函数。

### 2. 切片订阅和 DevTools 命名互不替代

```ts
usePreferenceStore.subscribe(
  (state) => state.theme,
  (theme, previousTheme) => {
    console.log(previousTheme, '→', theme)
  },
)
```

这条 listener 只在主题变化时运行。时间线上的名称来自 `set` 的第三参数，不是来自选择函数。

## 五、易错使用提示

:::pitfalls
### 错误：先收成包装函数再传入 create

**触发条件：** 写成 `const myMiddlewares = (f) => devtools(persist(f, { name: 'preference-storage' }))`，再 `create<PreferenceStore>()(myMiddlewares(initializer))`。

**原因：** 指南写明中间件必须立刻写在 `create` 里。多包一层普通函数会丢掉上下文推断，需要更复杂的 mutator 类型。

**后果：** `persist` 的 api 从 Hook 上消失，或 `set` 的第三参数对不上。

**错误示例：**

```ts
const myMiddlewares = (f: never) =>
  devtools(persist(f, { name: 'preference-storage' }))

const usePreferenceStore = create<PreferenceStore>()(
  myMiddlewares((set, get) => ({
    theme: '浅色',
    draft: 0,
    toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
    bumpDraft: () => set({ draft: get().draft + 1 }),
  })),
)
```

**正确写法：**

```ts
const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    persist(
      (set, get) => ({
        theme: '浅色',
        draft: 0,
        toggleTheme: () =>
          set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
        bumpDraft: () => set({ draft: get().draft + 1 }),
      }),
      { name: 'preference-storage' },
    ),
  ),
)
```

**验证方式：** 编译通过；`usePreferenceStore.persist.hasHydrated` 仍在。

### 错误：把 devtools 包进会改写 setState 的中间件里面

**触发条件：** 写成 `immer(devtools((set) => ...))`，或把其他同样改写 `setState` 的中间件放在 `devtools` 外面。

**原因：** 指南要求 `devtools` 尽量放在最后。它给 `setState` 加上类型参数；后包上去的中间件若也改写 `setState`，这个参数可能丢失。

**后果：** `set` 的第三参数在类型上消失，或需要断言才能编译。维护者说明 `devtools(persist(...))` 与 `persist(devtools(...))` 运行时都可以工作，顺序主要影响类型和文档。

**错误示例：**

```ts
const usePreferenceStore = create<PreferenceStore>()(
  persist(
    devtools(
      (set, get) => ({
        theme: '浅色',
        draft: 0,
        toggleTheme: () =>
          set(
            { theme: get().theme === '浅色' ? '深色' : '浅色' },
            undefined,
            'preference/toggleTheme',
          ),
        bumpDraft: () => set({ draft: get().draft + 1 }),
      }),
      { name: 'PreferenceStore' },
    ),
    { name: 'preference-storage' },
  ),
)
```

**正确写法：**

```ts
const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    persist(
      (set, get) => ({
        theme: '浅色',
        draft: 0,
        toggleTheme: () =>
          set(
            { theme: get().theme === '浅色' ? '深色' : '浅色' },
            undefined,
            'preference/toggleTheme',
          ),
        bumpDraft: () => set({ draft: get().draft + 1 }),
      }),
      { name: 'preference-storage' },
    ),
    { name: 'PreferenceStore' },
  ),
)
```

**验证方式：** `set` 仍接受第三参数；官方测试使用的也是 `devtools(persist(...))`。

### 错误：给 persist 和 devtools 共用一个 name 字段却以为是同一件事

**触发条件：** 只写一份 `{ name: 'preference' }`，或把存储键和 DevTools 连接名抄成同一个对象。

**原因：** `persist` 的 `name` 是存储项的键，必须唯一。`devtools` 的 `name` 是扩展里的连接标识。它们是两个选项对象上的两个字段。

**后果：** 两份 Store 抢同一把存储钥匙，或多份 Store 在 DevTools 里叠成一条时间线。

**错误示例：**

```ts
const options = { name: 'preference' }

const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    persist(
      (set, get) => ({
        theme: '浅色',
        draft: 0,
        toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
        bumpDraft: () => set({ draft: get().draft + 1 }),
      }),
      options,
    ),
    options,
  ),
)
```

**正确写法：**

```ts
const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    persist(
      (set, get) => ({
        theme: '浅色',
        draft: 0,
        toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
        bumpDraft: () => set({ draft: get().draft + 1 }),
      }),
      { name: 'preference-storage' },
    ),
    { name: 'PreferenceStore' },
  ),
)
```

**验证方式：** `persist.getOptions().name` 是存储键；DevTools 连接名是另一份字符串。

### 错误：叠了 persist 和 devtools，却以为 subscribe 自动带选择函数

**触发条件：** 写成 `devtools(persist(initializer))` 后，调用 `usePreferenceStore.subscribe((state) => state.theme, console.log)`。

**原因：** `subscribeWithSelector` 才给 `subscribe` 加上第二套签名。`persist` 和 `devtools` 不改 `subscribe`。

**后果：** 第一参数被当成整份 state 的 listener，第二参数被丢掉。

**错误示例：**

```ts
const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    persist(
      (set, get) => ({
        theme: '浅色',
        draft: 0,
        toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
        bumpDraft: () => set({ draft: get().draft + 1 }),
      }),
      { name: 'preference-storage' },
    ),
  ),
)

usePreferenceStore.subscribe((state) => state.theme, console.log)
```

**正确写法：**

```ts
const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          theme: '浅色',
          draft: 0,
          toggleTheme: () =>
            set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
          bumpDraft: () => set({ draft: get().draft + 1 }),
        }),
        { name: 'preference-storage' },
      ),
    ),
  ),
)

usePreferenceStore.subscribe((state) => state.theme, console.log)
```

**验证方式：** 切换主题后 listener 打印新主题；增加草稿时这个 listener 不再被调用。
:::

## 六、原理与适用场景

### 1. 官方事实

高级 TypeScript 指南写明：中间件不必换特殊语法，但必须立刻写在 `create` 里；`myMiddlewares` 这种包装需要更复杂的类型；建议把 `devtools` 尽量放在最后，因为它会改写 `setState` 并加上类型参数。官方示例是 `devtools(persist(...))`。

官方测试用 `devtools(persist(...))`、`devtools(subscribeWithSelector(persist(...)))` 和 `devtools(subscribeWithSelector(persist(immer(...))))`。组合后仍检查 `persist.hasHydrated`、带选择函数的 `subscribe` 和 `setState` 的第三参数。

固定版本里，`persist` 和 `devtools` 都会再包 `api.setState`，`subscribeWithSelector` 只包 `api.subscribe`。维护者说明运行时两种包法都可以工作，顺序主要影响类型和文档。

### 2. 课程推导

组合不是新的 Store API。它只是让同一份初始化函数同时获得存储、时间线和切片订阅。选项仍然分属各自中间件：存储键、连接名、`partialize`、选择函数、`set` 第三参数都要单独写。推断依赖“立刻写在 `create` 里”，不依赖运行时谁先谁后。

### 3. 适用边界

本课不讲解自定义 middleware，也不展开高阶 mutator。`immer` 的可变写入写法不作为主线，只保留指南里关于 `devtools(immer(...))` 的顺序。`persist` 的 `version` 与 `migrate`、服务端渲染和水合时序不在这里展开。

## 七、练习

:::exercise
### 按官方顺序组合三个中间件，只持久化主题

**要求：** 从 `zustand` 导入 `create`，从 `zustand/middleware` 导入 `devtools`、`persist` 和 `subscribeWithSelector`。Store 包含 `theme`、`draft`、`toggleTheme`、`bumpDraft`。使用 `create<PreferenceStore>()(devtools(subscribeWithSelector(persist(...))))`。`persist` 的 `name` 为 `preference-storage`，`partialize` 只返回 `theme`。`devtools` 的 `name` 为 `PreferenceStore`。`toggleTheme` 的 `set` 传入第三参数 `'preference/toggleTheme'`，第二参数保持 `undefined`。在 `ThemeChangeLog` 的 `useEffect` 里按 `(state) => state.theme` 订阅，必须返回取消函数。不要用 listener 去画主题文案。

**验收：** Hook 上能访问 `persist.hasHydrated`。切换主题后存储 JSON 含有新主题，主题订阅追加一条。调用 `bumpDraft` 后存储 JSON 不变，主题订阅条数不变。

**参考答案：**

```tsx
import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { useEffect, useState } from 'react'

type PreferenceStore = {
  theme: string
  draft: number
  toggleTheme: () => void
  bumpDraft: () => void
}

const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          theme: '浅色',
          draft: 0,
          toggleTheme: () =>
            set(
              { theme: get().theme === '浅色' ? '深色' : '浅色' },
              undefined,
              'preference/toggleTheme',
            ),
          bumpDraft: () => set({ draft: get().draft + 1 }),
        }),
        {
          name: 'preference-storage',
          partialize: (state) => ({ theme: state.theme }),
        },
      ),
    ),
    { name: 'PreferenceStore' },
  ),
)

function ThemeChangeLog() {
  const theme = usePreferenceStore((state) => state.theme)
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    return usePreferenceStore.subscribe(
      (state) => state.theme,
      (current, previous) => {
        setLines((currentLines) => [...currentLines, `${previous}→${current}`])
      },
    )
  }, [])

  return (
    <section>
      <p>{theme}</p>
      <pre>{lines.join('\n')}</pre>
    </section>
  )
}
```
:::

## 八、本节小结

- 多个中间件立刻嵌套进 `create<T>()(...)`，不要先收成包装函数。
- 按官方建议把 `devtools` 放在最外层；测试里的顺序是 `devtools` → `subscribeWithSelector` → `persist`。
- 存储键和 DevTools 连接名是两份选项。
- 组合不会自动补上没写进去的中间件，也不会改 Hook 选择规则。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 Advanced TypeScript Guide Using middlewares](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/advanced-typescript.md) - 立刻写在 create 里、devtools 放最后、包装函数需要复杂类型。
- [Zustand 5.0.15 middlewareTypes tests](https://github.com/pmndrs/zustand/blob/v5.0.15/tests/middlewareTypes.test.tsx) - 官方嵌套顺序与组合后的类型检查。
- [Zustand 5.0.15 persist middleware implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/persist.ts) - persist 再包 setState 的实现。
- [Zustand 5.0.15 devtools middleware implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/devtools.ts) - devtools 给 setState 加第三参数的实现。
- [Zustand 5.0.15 subscribeWithSelector implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/subscribeWithSelector.ts) - 只改 subscribe 的实现。
- [Zustand Discussion 2389 middleware priority](https://github.com/pmndrs/zustand/discussions/2389) - 维护者说明顺序主要影响类型和文档。
