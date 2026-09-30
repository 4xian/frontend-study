---
id: react.zustand.learn.advanced.client-state-platform
type: lesson
title: 实战：生产级客户端状态平台
summary: 用一份全局 Store 收齐切片、persist、版本迁移和中间件组合，只把跨刷新字段写入存储。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 60
prerequisites:
  - react.zustand.learn.intermediate.slices-pattern
  - react.zustand.learn.intermediate.persist
  - react.zustand.learn.advanced.persist-version-migration
  - react.zustand.learn.advanced.middleware-composition
  - react.zustand.learn.intermediate.state-reset
  - react.zustand.learn.intermediate.derived-state
related:
  - react.zustand.learn.intermediate.slices-pattern
  - react.zustand.learn.intermediate.persist
  - react.zustand.learn.advanced.persist-version-migration
  - react.zustand.learn.advanced.middleware-composition
  - react.zustand.learn.intermediate.state-reset
  - react.zustand.learn.intermediate.derived-state
tags:
  - Zustand
  - Slices Pattern
  - persist
  - migrate
  - 中间件
  - 实战
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-11
objectives:
  - 能把主题、会话和命令拆成 slice，再展开进一份全局 Store。
  - 能只在合并结果上立刻嵌套 persist 和 devtools，并用 partialize 只留下主题。
  - 能给 persist 写 version 和 migrate，把旧的 themeName 收成 theme。
  - 能浅合并重置会话，派生深色与否，说明开关留在组件里。
recap:
  - 应用的全局客户端状态放进一份 Store，切片只拆初始化函数。
  - 中间件只加在合并结果上，devtools 放在最外层。
  - persist 用 partialize、version 和 migrate 保住跨刷新字段。
  - 会话重置是浅合并；能算出来的展示值和私有说明都不进 Store。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 Flux inspired practice
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/flux-inspired-practice.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 应用的全局状态应放在一份 Zustand Store 里。
      - 应用变大时用切片拆这份 Store。
      - 更新必须走 set 或 setState。
  - title: Zustand 5.0.15 Slices Pattern
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/slices-pattern.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 可以把主 Store 拆成更小的独立片段，再合并成一份 bounded store。
      - "合并写法是 create((...a) => ({ ...createBearSlice(...a), ...createFishSlice(...a) }))。"
      - persist 示例写在合并后的 Store 上。
      - 中间件只加在合并结果上，不要加进单个 slice。
  - title: Zustand Discussion 3370 persist 不能包进 slice
    url: https://github.com/pmndrs/zustand/discussions/3370
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 维护者说明中间件按 Store 级设计，不能用在 slices pattern 的单个 slice 上。
  - title: Zustand 5.0.15 Advanced TypeScript
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/advanced-typescript.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - "slice 用 StateCreator<整份 Store, Mutators, [], 本段 Slice> 标注。"
      - persist 的 mutator 是 zustand/persist。
      - 中间件必须立刻写在 create 里。
      - 建议把 devtools 尽量放在最后，例如写成 devtools(persist(...))。
  - title: Zustand 5.0.15 persist middleware reference
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/persist.md
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - name 是存储项的唯一名称。
      - partialize 用来挑选写入存储的字段。
      - version 是持久化状态的版本号。存储里的版本对不上时，这份存储不会被采用。
      - migrate 在版本不一致时迁移持久化状态。
  - title: Zustand 5.0.15 persist middleware implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/persist.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 选项里的 version 默认是 0。
      - 每次写入都带上当前 options.version。
      - partialize 默认返回整份 state。
      - 存储里的 version 是数字且与选项不一致时，有 migrate 才调用它。
      - 这是固定版本实现，不是另一套公共合同。
  - title: Zustand 5.0.15 How to reset state
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/how-to-reset-state.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 官方示例使用 store.setState(store.getInitialState(), true) 整份写回创建时的快照。
  - title: React Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 避免保存可以从现有数据计算出来的重复状态。
---

# 实战：生产级客户端状态平台

## 一、学习目标

- 把主题、会话和命令拆成 slice，再展开进一份全局 Store。
- 只在合并结果上立刻嵌套 `persist` 和 `devtools`，用 `partialize` 只留下主题。
- 给 `persist` 写 `version` 和 `migrate`，把旧的 `themeName` 收成 `theme`。
- 浅合并重置会话，派生深色与否，说明开关留在组件里。

## 二、为什么一份偏好中心还不够

主题要跨刷新还在，会话计数只活在当前页，存储形状还会改名。前面已经分开学过切片、`persist`、版本迁移、中间件组合、重置和派生。这个实战把它们收进同一份全局平台：切片决定怎么拆，中间件只包合并结果，`partialize` 决定存什么，`version` 和 `migrate` 保住旧数据，重置只动会话。

Flux 实践写明：应用的全局状态放进一份 Zustand Store；变大时用切片拆。这里的「一份」是共享平台，不是每份文稿各造实例。给主题和会话各自 `create`，共享重置就看不到另一段字段；把 `persist` 包进主题 slice，维护者已经说明中间件按 Store 级设计。

远程目录、分页和 mutation 不属于这份 Store。

## 三、核心概念

### 1. 全局一份 Store，切片只拆初始化

官方 Slices Pattern 把主 Store 拆成片段，再合并成一份 bounded store。主题、会话和命令各返回自己那一段：

```ts
import { create, type StateCreator } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'

type ThemeSlice = {
  theme: string
  toggleTheme: () => void
}

type SessionSlice = {
  session: number
  bumpSession: () => void
}

type CommandSlice = {
  resetSession: () => void
}

type PlatformStore = ThemeSlice & SessionSlice & CommandSlice
```

运行时仍然只有一份 state、一次浅合并、一套 listener。没有 `useThemeStore` 和 `useSessionStore` 两套 Hook。

### 2. persist 只包合并结果，partialize 只留主题

Slices Pattern 的 persist 示例写在合并后的 `create` 上。`name` 是唯一必填项。默认 `partialize` 返回整份 state，函数也会被写进去；本课只恢复主题，所以白名单写成 `{ theme: state.theme }`。

会话计数、说明开关、Action 都不进存储。刷新后主题还在，会话回到 `0`。

### 3. version 与 migrate 保住旧形状

`version` 写在 `persist` 选项里，不是 state 字段。不写时固定版本默认是 `0`。存储 JSON 仍是：

```json
{ "state": { "theme": "深色" }, "version": 1 }
```

字段从 `themeName` 改成 `theme` 时，选项写成 `version: 1`，并提供 `migrate`。固定版本实现里，存储里的 `version` 是数字且与选项不一致时，有 `migrate` 才调用它；返回值再和当前 state 浅合并，随后把新 `version` 写回存储。没有 `migrate` 时旧存储不会被采用。

### 4. 中间件立刻嵌套，devtools 在最外层

高级 TypeScript 指南要求中间件立刻写在 `create` 里，上下文推断才能工作。官方建议把 `devtools` 尽量放在最后，例如 `devtools(persist(...))`。先收成 `myMiddlewares` 再传入会丢掉推断。

切片的 `StateCreator` 第二参数带上已经包进去的 mutator。本课同时用 `devtools` 和 `persist` 时写成 `[['zustand/devtools', never], ['zustand/persist', unknown]]`。

### 5. 会话重置是浅合并，派生当场算

`setState(getInitialState(), true)` 会整份写回创建时的快照。对已经水合过的平台来说，这会把主题打回创建时的「浅色」，再被 `persist` 写进存储。会话重置只浅合并 `session`：

```ts
resetSession: () => set({ session: 0 }),
```

深色与否等于 `theme === '深色'`，不要另存 `isDark`。说明是否展开只有当前按钮使用，继续 `useState`。

## 四、用法与示例

### 1. 切片写在合并之前

```ts
type PlatformMutators = [['zustand/devtools', never], ['zustand/persist', unknown]]

const createThemeSlice: StateCreator<PlatformStore, PlatformMutators, [], ThemeSlice> = (
  set,
  get,
) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
})

const createSessionSlice: StateCreator<PlatformStore, PlatformMutators, [], SessionSlice> = (
  set,
  get,
) => ({
  session: 0,
  bumpSession: () => set({ session: get().session + 1 }),
})

const createCommandSlice: StateCreator<PlatformStore, PlatformMutators, [], CommandSlice> = (
  set,
) => ({
  resetSession: () => set({ session: 0 }),
})
```

`set` / `get` 看到的是整份 `PlatformStore`。命令切片只写回 `session`，不会清掉 `theme`。

### 2. 合并后立刻写 devtools(persist)

```ts
function migrateTheme(persisted: unknown, version: number) {
  if (version === 0) {
    const data = persisted as { themeName?: string }
    return { theme: data.themeName ?? '浅色' }
  }
  return persisted as { theme: string }
}

const usePlatformStore = create<PlatformStore>()(
  devtools(
    persist(
      (...a) => ({
        ...createThemeSlice(...a),
        ...createSessionSlice(...a),
        ...createCommandSlice(...a),
      }),
      {
        name: 'client-platform-storage',
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ theme: state.theme }),
        migrate: migrateTheme,
      },
    ),
    { name: 'ClientPlatform' },
  ),
)
```

`...a` 是同一组 `set`、`get` 和 `store`。各 slice 共享一份 state。`persist` 包住合并函数，`devtools` 再包住 `persist`。

### 3. 观察平台

下面的 Demo 在创建 Store 前写入 `version: 0` 的 `themeName`。水合后主题是「深色」，存储被写成 `theme` 和 `version: 1`。增加会话不会改存储。重置会话只把会话计数写回 `0`，主题仍在，打开过的说明不会被关掉。深色与否在渲染时从 `theme` 算出来。Demo 用一层同步存储包装 `localStorage`，只为让存储面板在同页写入后立刻重绘，序列化规则仍是 `createJSONStorage`。

:::demo{id="react.zustand.learn.advanced.client-state-platform.client-state-platform-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：把 persist 包进主题 slice

**触发条件：** 写成 `persist(createThemeSlice, { name })`，再和会话 slice 一起展开。

**原因：** Slices Pattern 要求中间件只加在合并后的 Store 上。维护者说明中间件按 Store 级设计，不能用在单个 slice 上。

**后果：** 水合和写入绑到片段上，Action 引用可能被改写，会话字段也对不齐。

**错误示例：**

```ts
const usePlatformStore = create<PlatformStore>()((...a) => ({
  ...persist(createThemeSlice, { name: 'theme-storage' })(...a),
  ...createSessionSlice(...a),
}))
```

**正确写法：**

```ts
const usePlatformStore = create<PlatformStore>()(
  persist(
    (...a) => ({
      ...createThemeSlice(...a),
      ...createSessionSlice(...a),
      ...createCommandSlice(...a),
    }),
    { name: 'client-platform-storage' },
  ),
)
```

**验证方式：** 一份 `name` 下的 JSON 只有合并后的字段；切换主题不会丢掉 `bumpSession`。

### 错误：把会话和 Action 整份写入存储

**触发条件：** 不写 `partialize`，或写成 `partialize: (state) => state`。

**原因：** 固定版本默认 `partialize` 返回整份 state。函数不能按原样活过 `JSON.stringify`。

**后果：** 存储里出现 `session` 和空 Action；刷新后会话被恢复，或水合盖掉当前函数。

**错误示例：**

```ts
persist(
  (...a) => ({
    ...createThemeSlice(...a),
    ...createSessionSlice(...a),
    ...createCommandSlice(...a),
  }),
  { name: 'client-platform-storage' },
)
```

**正确写法：**

```ts
partialize: (state) => ({ theme: state.theme }),
```

**验证方式：** 增加会话后，存储 JSON 里没有 `session`；刷新后会话回到 `0`，主题仍在。

### 错误：只加 version 不写 migrate

**触发条件：** 选项写成 `version: 1`，存储里仍是 `version: 0` 的 `themeName`，没有 `migrate`。

**原因：** 版本不一致时，固定版本只有提供 `migrate` 才会改旧数据。否则不采用这份存储。

**后果：** 用户上次保存的主题丢失，界面回到「浅色」。

**错误示例：**

```ts
persist(
  (...a) => ({
    ...createThemeSlice(...a),
    ...createSessionSlice(...a),
    ...createCommandSlice(...a),
  }),
  {
    name: 'client-platform-storage',
    version: 1,
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ theme: state.theme }),
  },
)
```

**正确写法：**

```ts
migrate: (persisted, version) => {
  if (version === 0) {
    const data = persisted as { themeName?: string }
    return { theme: data.themeName ?? '浅色' }
  }
  return persisted as { theme: string }
},
```

**验证方式：** 旧存储是 `{ "state": { "themeName": "深色" }, "version": 0 }` 时，水合后主题是「深色」，存储变成 `version: 1`。

### 错误：先收成包装函数再传入 create

**触发条件：** 写成 `const myMiddlewares = (f) => devtools(persist(f, options))`，再 `create()(myMiddlewares(initializer))`。

**原因：** 指南要求中间件立刻出现在 `create` 里，上下文推断才能工作。

**后果：** TypeScript 推不出 `persist` 和 `set` 的第三参数，组合后的 Hook 不好用。

**错误示例：**

```ts
const myMiddlewares = (initializer: StateCreator<PlatformStore>) =>
  devtools(persist(initializer, { name: 'client-platform-storage' }))

const usePlatformStore = create<PlatformStore>()(myMiddlewares((...a) => ({
  ...createThemeSlice(...a),
  ...createSessionSlice(...a),
  ...createCommandSlice(...a),
})))
```

**正确写法：**

```ts
const usePlatformStore = create<PlatformStore>()(
  devtools(
    persist(
      (...a) => ({
        ...createThemeSlice(...a),
        ...createSessionSlice(...a),
        ...createCommandSlice(...a),
      }),
      { name: 'client-platform-storage' },
    ),
  ),
)
```

**验证方式：** 中间件直接写在 `create<PlatformStore>()` 后面；不要先赋值给 `myMiddlewares`。

### 错误：用初始快照整份替换，或把远程列表写进平台

**触发条件：** `resetSession` 写成 `setState(getInitialState(), true)`，或把请求来的目录存进这份 Store。

**原因：** `getInitialState` 是创建时的快照，水合后的主题不在里面。远程缓存、失效和重试不属于客户端 Store。

**后果：** 重置会话把主题打回「浅色」并写进存储；或者把服务端数据复制成第二份客户端缓存。

**错误示例：**

```ts
resetSession: () =>
  usePlatformStore.setState(usePlatformStore.getInitialState(), true)
```

**正确写法：**

```ts
resetSession: () => set({ session: 0 })
```

**验证方式：** 水合为「深色」后重置会话，主题仍是「深色」，存储里没有目录列表。
:::

## 六、原理与适用场景

### 1. 官方事实

Flux 实践把应用全局状态放进一份 Store，变大时用切片拆。Slices Pattern 把片段展开进同一次 `create`，并写明中间件只加在合并结果上。persist Reference 提供 `name`、`partialize`、`version` 和 `migrate`。固定版本实现里，`version` 默认是 `0`，写入始终带当前选项里的版本；版本不一致且没有 `migrate` 时不采用旧存储。高级 TypeScript 指南要求中间件立刻写在 `create` 里，并把 `devtools` 放在最外层。React 要求派生数据不要另存一份。

### 2. 课程推导

生产级客户端状态平台的最小模型是：一份全局 Store 管共享客户端状态，切片拆初始化，中间件只包合并结果，`partialize` 决定跨刷新字段，`migrate` 保住旧形状，会话重置浅合并，展示值和私有说明留在渲染和组件里。

### 3. 适用边界

本课只整合已经学过的切片、`persist`、版本迁移、中间件组合、重置和派生状态。不引入 Immer、测试包装、SSR 水合或 Store Factory。不把远程目录当成服务端缓存，也不把每份文稿改成多实例。

## 七、练习

:::exercise
### 造出带迁移的全局平台 Store

**要求：** 编写 `ThemeSlice`、`SessionSlice` 和 `CommandSlice`，用 `StateCreator<PlatformStore, [['zustand/persist', unknown]], [], 本段>` 标注后在同一次 `create` 里展开，再立刻包 `persist`。`theme` 默认 `'浅色'`，`session` 默认 `0`。`toggleTheme` 在浅色和深色之间切换。`bumpSession` 把 `session` 加 `1`。`resetSession` 只浅合并 `{ session: 0 }`。`persist` 的 `name` 为 `client-platform-storage`，`version` 为 `1`，`storage` 使用 `createJSONStorage(() => localStorage)`，`partialize` 只返回 `{ theme: state.theme }`。`migrate` 在 `version === 0` 时把 `themeName` 收成 `theme`。先写入 `{ "state": { "themeName": "深色" }, "version": 0 }`，再创建 Store。断言主题是 `'深色'`，存储 JSON 的 `version` 是 `1` 且含 `theme`。再调用 `bumpSession`，断言 `session` 是 `1`，存储里没有 `session`。再调用 `resetSession`，断言 `session` 回到 `0`，主题仍是 `'深色'`，`toggleTheme` 仍是函数。不要给主题和会话各自 `create`，不要把 `persist` 包进单个 slice，不要用 `setState(getInitialState(), true)` 重置会话。

**验收：** 旧 `themeName` 迁成「深色」；增加会话不改存储形状；重置会话只清计数，Action 仍在。

**参考答案：**

```ts
import { create, type StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ThemeSlice = {
  theme: string
  toggleTheme: () => void
}

type SessionSlice = {
  session: number
  bumpSession: () => void
}

type CommandSlice = {
  resetSession: () => void
}

type PlatformStore = ThemeSlice & SessionSlice & CommandSlice

type PersistMutators = [['zustand/persist', unknown]]

const createThemeSlice: StateCreator<PlatformStore, PersistMutators, [], ThemeSlice> = (
  set,
  get,
) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
})

const createSessionSlice: StateCreator<PlatformStore, PersistMutators, [], SessionSlice> = (
  set,
  get,
) => ({
  session: 0,
  bumpSession: () => set({ session: get().session + 1 }),
})

const createCommandSlice: StateCreator<PlatformStore, PersistMutators, [], CommandSlice> = (
  set,
) => ({
  resetSession: () => set({ session: 0 }),
})

const storageKey = 'client-platform-storage'

localStorage.setItem(
  storageKey,
  JSON.stringify({
    state: { themeName: '深色' },
    version: 0,
  }),
)

const usePlatformStore = create<PlatformStore>()(
  persist(
    (...a) => ({
      ...createThemeSlice(...a),
      ...createSessionSlice(...a),
      ...createCommandSlice(...a),
    }),
    {
      name: storageKey,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      migrate: (persisted, version) => {
        if (version === 0) {
          const data = persisted as { themeName?: string }
          return { theme: data.themeName ?? '浅色' }
        }
        return persisted as { theme: string }
      },
    },
  ),
)

if (usePlatformStore.getState().theme !== '深色') {
  throw new Error('旧 themeName 应迁成深色')
}

const storedAfterMigrate = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as {
  state?: { theme?: string; session?: number }
  version?: number
}
if (storedAfterMigrate.version !== 1) {
  throw new Error('存储版本应写成 1')
}
if (storedAfterMigrate.state?.theme !== '深色') {
  throw new Error('存储应含 theme')
}

usePlatformStore.getState().bumpSession()
if (usePlatformStore.getState().session !== 1) {
  throw new Error('增加会话后计数应为 1')
}

const storedAfterBump = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as {
  state?: { session?: number }
}
if (storedAfterBump.state?.session !== undefined) {
  throw new Error('存储里不应出现 session')
}

usePlatformStore.getState().resetSession()
if (usePlatformStore.getState().session !== 0) {
  throw new Error('重置会话后计数应为 0')
}
if (usePlatformStore.getState().theme !== '深色') {
  throw new Error('重置会话不应改掉主题')
}
if (typeof usePlatformStore.getState().toggleTheme !== 'function') {
  throw new Error('重置后 toggleTheme 仍应是函数')
}
```
:::

## 八、本节小结

- 全局客户端状态放进一份 Store，切片只拆初始化函数。
- 中间件只包合并结果；`devtools` 放在最外层。
- `partialize`、`version` 和 `migrate` 一起保住跨刷新字段。
- 会话重置浅合并；能算出来的展示值和私有说明都不进 Store。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 Flux inspired practice](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/flux-inspired-practice.md) - 全局一份 Store，变大时用切片。
- [Zustand 5.0.15 Slices Pattern](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/slices-pattern.md) - 展开合并，中间件只加在合并结果上。
- [Zustand Discussion 3370 persist 不能包进 slice](https://github.com/pmndrs/zustand/discussions/3370) - 维护者说明中间件按 Store 级设计。
- [Zustand 5.0.15 Advanced TypeScript](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/advanced-typescript.md) - StateCreator mutator 与立刻嵌套中间件。
- [Zustand 5.0.15 persist middleware reference](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/persist.md) - name、partialize、version 与 migrate。
- [Zustand 5.0.15 persist middleware implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/persist.ts) - 默认 version 与迁移分支。
- [Zustand 5.0.15 How to reset state](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/how-to-reset-state.md) - 整份替换快照。
- [React Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - 不保存能算出来的数据。
