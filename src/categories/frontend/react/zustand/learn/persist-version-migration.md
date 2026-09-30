---
id: react.zustand.learn.advanced.persist-version-migration
type: lesson
title: 持久化版本迁移
summary: 给 persist 写出版本号，并在存储形状变化时用 migrate 把旧数据改成当前字段。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.intermediate.persist
related:
  - react.zustand.learn.intermediate.persist
tags:
  - Zustand
  - persist
  - version
  - migrate
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-11
objectives:
  - 能给 persist 选项写出版本号，并在字段改名时提供 migrate。
  - 能说明存储 JSON 带 version，代码里不写时默认是 0。
  - 能把旧字段迁成当前形状，并看到存储被写成新版本。
  - 能识别版本不一致且没有 migrate 时不会采用旧存储。
recap:
  - persist 写入的是带 version 的 JSON，选项里的 version 默认是 0。
  - 存储里的 version 与代码不一致时才会调用 migrate。
  - migrate 必须返回符合当前版本的对象，随后浅合并并写回新 version。
  - 版本不一致又没有 migrate 时，旧存储不会被采用。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 persist middleware reference
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/persist.md
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - version 是持久化状态的版本号。存储里的版本对不上时，这份存储不会被采用。
      - migrate 在版本不一致时迁移持久化状态。
      - 官方示例把 version 0 的 x、y 收成 version 1 的 position 对象。
  - title: Zustand 5.0.15 Persisting store data
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/integrations/persisting-store-data.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - version 默认是 0。
      - 存储版本与代码不一致时，默认不使用存储值。
      - migrate 接收持久化状态和旧版本号，必须返回符合代码里当前版本的对象。
      - 官方示例把 oldField 改名为 newField。
  - title: Zustand 5.0.15 persist middleware implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/persist.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 选项里的 version 默认是 0。
      - 每次写入都带上当前 options.version。
      - 存储里的 version 是数字且与选项不一致时，有 migrate 才调用它。
      - 迁移成功后会 replace 写入，再 setItem 把新 version 写回存储。
      - 没有 migrate 时打印 console.error，不采用这份存储。
      - 这是固定版本实现，不是另一套公共合同。
  - title: Zustand 5.0.15 persist sync tests
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/tests/persistSync.test.tsx
    sourceType: official-test
    appliesTo: Zustand 5.0.15
    claims:
      - 同步 migrate 会拿到旧 state 和旧 version。
      - 迁移后存储被写成新 version。
      - 缺少 migrate 时保持初始状态，并调用 console.error。
      - migrate 抛错时保持初始状态，onRehydrateStorage 收到错误。
  - title: Zustand 5.0.15 persist async tests
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/tests/persistAsync.test.tsx
    sourceType: official-test
    appliesTo: Zustand 5.0.15
    claims:
      - migrate 可以返回 Promise。
      - 异步迁移完成后同样把新 version 写回存储。
---

# 持久化版本迁移

## 一、学习目标

- 给 `persist` 选项写出版本号，并在字段改名时提供 `migrate`。
- 说明存储 JSON 带 `version`，代码里不写时默认是 `0`。
- 把旧字段迁成当前形状，并看到存储被写成新版本。
- 识别版本不一致且没有 `migrate` 时不会采用旧存储。

## 二、为什么改字段会弄丢旧数据

中级课已经把主题写进带 `version` 的 JSON。字段一旦改名，存储里可能还是 `themeName`，当前 Store 却读 `theme`；官方示例也会把 `x`、`y` 收成 `position`。

只改 TypeScript 类型不够。存储里还是旧键。水合默认浅合并：旧对象盖到当前 state 上。新字段得不到值，旧字段会变成多余键。

`persist` 用 `version` 标记这份 JSON 的形状。版本对不上时，要么丢掉旧存储，要么用 `migrate` 改成当前形状再合并。

## 三、核心概念

### 1. version 写在 persist 选项里

`version` 不是 state 里的字段，而是 `persist` 选项。不写时固定版本默认是 `0`。每次 `set` 之后写入的仍是：

```json
{ "state": { "theme": "深色" }, "version": 1 }
```

这里的 `1` 来自选项，不是 `state.version`。

```ts
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
```

官方 Reference 写明：存储里的版本对不上时，这份存储不会被采用；需要保住旧数据时再提供 `migrate`。

### 2. migrate 只在版本不一致时运行

固定版本实现里，水合读出 `{ state, version }` 后比较：

- 存储里的 `version` 是数字，并且不等于选项里的 `version`，才会进入迁移分支。
- 有 `migrate` 时，调用 `migrate(state, 存储里的 version)`。
- 返回值再和当前 state 浅合并，`set(..., true)` 整份写回内存。
- 然后立刻 `setItem`，把新 `version` 写进存储。

官方同步测试：存储是 `{ count: 42, version: 12 }`，代码 `version: 13`，`migrate` 返回 `{ count: 99 }`。结果内存是 `99`，存储被写成 `version: 13`。`migrate` 的第二个参数是 `12`，也就是旧版本号。

`migrate` 可以返回 `Promise`。官方异步测试覆盖这条路径。同步 `localStorage` 里通常直接返回对象。

中间件不会按 `0 → 1 → 2` 自动串多次迁移。一次水合只调用一次 `migrate`，你要在函数里自己判断旧版本号。

### 3. 没有 migrate 时旧存储不会被采用

官方测试把存储写成 `version: 12`，代码写成 `13`，却不传 `migrate`。内存仍是初始 `count: 0`，并且 `console.error`。

Reference 的说法是：版本对不上时，存储不会被采用。集成文档另外写过 `migrate` 默认原样返回；固定版本源码没有这份默认实现。本课按 Reference、源码和官方测试来理解：对不上又没有 `migrate`，就继续用当前初始状态。

存储 JSON 缺少 `version` 字段时，`typeof version === 'number'` 不成立，实现会走“版本一致”分支，把旧 `state` 直接拿去浅合并。旧键不会自动改名。

### 4. 观察迁移、丢弃和版本一致

下面的 Demo 左侧写入 `version: 0` 的 `themeName`，Store 用 `version: 1` 和 `migrate`：主题变成「深色」，存储被写成 `theme` 和 `version: 1`。中间同样写入旧版，但不提供 `migrate`：主题仍是「浅色」，存储保持旧 JSON。右侧写入已经是 `version: 1` 的 `theme`：直接恢复「深色」，不必迁移。

:::demo{id="react.zustand.learn.advanced.persist-version-migration.persist-version-migration-demo"}
:::

## 四、用法与示例

### 1. 字段改名

集成文档的示例是把 `oldField` 写成 `newField`：

```ts
migrate: (persistedState, version) => {
  if (version === 0) {
    persistedState.newField = persistedState.oldField
    delete persistedState.oldField
  }

  return persistedState
},
```

官方 Reference 教程则把 `x`、`y` 收成 `position`。两种写法都要返回符合当前版本的对象。

### 2. 一次处理多个旧版本

```ts
migrate: (persisted, version) => {
  let data = persisted as {
    themeName?: string
    theme?: string
    accent?: string
  }

  if (version === 0) {
    data = { theme: data.themeName ?? '浅色' }
  }

  if (version <= 1 && data.accent === undefined) {
    return { theme: data.theme ?? '浅色', accent: '默认' }
  }

  return { theme: data.theme ?? '浅色', accent: data.accent ?? '默认' }
},
```

代码里的 `version` 若是 `2`，存储里是 `0`，函数仍只被调用一次，参数是 `0`。不要指望中间件先帮你跑一遍 `1`。

### 3. 迁移之后仍是浅合并

`migrate` 的返回值不是直接当成整份 Store。实现会把它和当前 state 浅合并，再 `replace` 写入。顶层 Action 通常还在当前对象上，所以 `migrate` 只返回数据字段即可。若返回值里带上空对象或同名键，仍然会盖掉当前字段。

## 五、易错使用提示

:::pitfalls
### 错误：只加 version 不写 migrate

**触发条件：** 把选项写成 `version: 1`，存储里仍是 `version: 0`，没有 `migrate`。

**原因：** 版本不一致时，固定版本只有提供 `migrate` 才会改旧数据。否则打印 `console.error`，不采用存储。

**后果：** 用户上次保存的主题丢失，界面回到初始值。

**错误示例：**

```ts
persist(
  (set, get) => ({
    theme: '浅色',
    toggleTheme: () =>
      set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
  }),
  {
    name: 'preference-storage',
    version: 1,
    storage: createJSONStorage(() => localStorage),
  },
)
```

**正确写法：**

```ts
persist(
  (set, get) => ({
    theme: '浅色',
    toggleTheme: () =>
      set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
  }),
  {
    name: 'preference-storage',
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
)
```

**验证方式：** 旧存储是 `{ "state": { "themeName": "深色" }, "version": 0 }` 时，水合后主题是「深色」，存储变成 `version: 1`。

### 错误：把 version 写进 state

**触发条件：** 在初始化对象里写 `version: 1`，却不在 `persist` 选项里写 `version`。

**原因：** 中间件比较的是存储 JSON 外层的 `version` 和选项里的 `version`。state 里的同名字段只是普通数据，默认还会被 `partialize` 整份写入 `state`。

**后果：** 选项仍是默认 `0`，形状已经变了也不会走 `migrate`。

**错误示例：**

```ts
persist(
  (set) => ({
    version: 1,
    theme: '浅色',
    toggleTheme: () => set({ theme: '深色' }),
  }),
  { name: 'preference-storage' },
)
```

**正确写法：**

```ts
persist(
  (set, get) => ({
    theme: '浅色',
    toggleTheme: () =>
      set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
  }),
  {
    name: 'preference-storage',
    version: 1,
    migrate: (persisted, version) => {
      if (version === 0) {
        const data = persisted as { themeName?: string }
        return { theme: data.themeName ?? '浅色' }
      }
      return persisted as { theme: string }
    },
  },
)
```

**验证方式：** 打开存储 JSON，外层有 `"version": 1`，`state` 里没有教学用的版本字段。

### 错误：migrate 只处理最近一个旧版本

**触发条件：** 代码已经是 `version: 2`，`migrate` 只写了 `if (version === 1)`。用户电脑上还是 `version: 0`。

**原因：** 一次水合只调用一次 `migrate`，参数就是存储里的那个旧数字。中间件不会先迁到 `1` 再迁到 `2`。

**后果：** `version === 1` 不成立，函数原样返回旧对象，新字段对不上。

**错误示例：**

```ts
migrate: (persisted, version) => {
  if (version === 1) {
    const data = persisted as { theme: string }
    return { theme: data.theme, accent: '默认' }
  }
  return persisted as { theme: string; accent: string }
},
```

**正确写法：**

```ts
migrate: (persisted, version) => {
  const data = persisted as { themeName?: string; theme?: string; accent?: string }
  const theme =
    version === 0 ? (data.themeName ?? '浅色') : (data.theme ?? '浅色')
  return { theme, accent: data.accent ?? '默认' }
},
```

**验证方式：** 存储是 `version: 0` 且只有 `themeName` 时，水合后同时具备 `theme` 和 `accent`。

### 错误：migrate 返回仍带旧键的对象

**触发条件：** 已经包了 `version: 1`，却写成 `return persisted`，没有改名。

**原因：** 返回值会浅合并到当前 state。旧键 `themeName` 会被挂上；新键 `theme` 若不在返回值里，就继续用初始「浅色」。

**后果：** 界面还是初始主题，存储里新旧键并存。

**错误示例：**

```ts
migrate: (persisted) => persisted,
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

**验证方式：** 迁移后 `getState().theme` 是旧值，「themeName」不再出现在存储的 `state` 里。

### 错误：migrate 里抛错还指望沿用旧值

**触发条件：** `migrate` 读取不存在的嵌套字段时抛错。

**原因：** 官方测试里 `migrate` 抛错后，内存仍是初始状态，`onRehydrateStorage` 收到该错误。实现不会退回采用未迁移的存储。

**后果：** 主题回到初始值；旧 JSON 还在，下次创建 Store 会再抛一次。

**错误示例：**

```ts
migrate: (persisted) => {
  const data = persisted as { profile: { city: string } }
  return { theme: data.profile.city }
},
```

**正确写法：**

```ts
migrate: (persisted, version) => {
  const data = persisted as { themeName?: string; theme?: string }
  if (version === 0) {
    return { theme: data.themeName ?? '浅色' }
  }
  return { theme: data.theme ?? '浅色' }
},
```

**验证方式：** 旧存储缺少预期字段时，迁移函数仍返回完整数据对象，不抛错；水合后 `toggleTheme` 仍可调用。
:::

## 六、原理与适用场景

### 1. 官方事实

Reference 把 `version` 和 `migrate` 列为可选选项：版本对不上时存储不会被采用；需要保住数据时再迁移。集成文档写明 `version` 默认 `0`，`migrate` 必须返回符合代码当前版本的对象，并给出字段改名示例。教程把 `x`、`y` 收成 `position`。

固定版本把选项 `version` 默认成 `0`，每次写入都带上它。存储里的 `version` 是数字且不一致时，有 `migrate` 才调用；成功后 `replace` 写入再 `setItem`。没有 `migrate` 就 `console.error`，不采用存储。官方测试覆盖同步迁移、异步 `Promise`、缺少 `migrate` 和 `migrate` 抛错。

### 2. 课程推导

`version` 标记的是存储形状，不是业务字段。`migrate` 是水合路径上的一次性转换，不是每次 `set` 都会跑。转换之后仍然走原来的浅合并，所以 `partialize` 和只持久化数据字段的规则还在。

### 3. 适用边界

本课不把 `skipHydration`、SSR 水合时机再展开。自定义存储引擎、Zod 校验读回值、IndexedDB、Map/Set 序列化不作为主线。中间件不会自动串联多步迁移，本课也不引入第三方迁移表。

## 七、练习

:::exercise
### 把旧字段 themeName 迁到 theme

**要求：** 从 `zustand` 导入 `create`，从 `zustand/middleware` 导入 `persist` 和 `createJSONStorage`。Store 包含 `theme: string` 和 `toggleTheme`。用 `persist` 包裹初始化函数。`name` 设为 `preference-storage`，`version` 设为 `1`，`partialize` 只返回 `{ theme: state.theme }`。`migrate` 在旧版本是 `0` 时把 `themeName` 写成 `theme`。不要把 `version` 放进 state。

**验收：** 存储事先是 `{ "state": { "themeName": "深色" }, "version": 0 }` 时，创建 Store 后 `theme` 为「深色」，存储被写成带 `theme` 和 `version: 1` 的 JSON。`toggleTheme` 仍可调用。

**参考答案：**

```ts
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
```
:::

## 八、本节小结

- `version` 写在 `persist` 选项里，默认是 `0`；存储 JSON 外层带着它。
- 版本不一致时才会调用 `migrate`；它必须返回当前形状。
- 迁移成功后会把新 `version` 写回存储。
- 只加版本不加 `migrate`，旧存储不会被采用。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 persist middleware reference](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/persist.md) - version、migrate 与官方改形状示例。
- [Zustand 5.0.15 Persisting store data](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/integrations/persisting-store-data.md) - version 默认值、migrate 签名与字段改名。
- [Zustand 5.0.15 persist middleware implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/persist.ts) - 版本比较、缺少 migrate 与写回。
- [Zustand 5.0.15 persist sync tests](https://github.com/pmndrs/zustand/blob/v5.0.15/tests/persistSync.test.tsx) - 同步迁移、缺少 migrate 与抛错。
- [Zustand 5.0.15 persist async tests](https://github.com/pmndrs/zustand/blob/v5.0.15/tests/persistAsync.test.tsx) - Promise 形式的 migrate。
