---
id: react.zustand.learn.advanced.ssr-and-hydration
type: lesson
title: SSR 与 Hydration
summary: 服务端和首次客户端渲染必须产出同一份界面，persist 用 skipHydration 把读存储推迟到挂载之后。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.intermediate.persist
  - react.zustand.learn.advanced.store-factory
related:
  - react.zustand.learn.intermediate.persist
  - react.zustand.learn.advanced.store-factory
  - react.zustand.learn.advanced.context-scope
tags:
  - Zustand
  - SSR
  - Hydration
  - skipHydration
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-11
objectives:
  - 能说明 hydrateRoot 要求服务端 HTML 与首次客户端渲染一致。
  - 能给 persist 打开 skipHydration，并在挂载后调用 rehydrate。
  - 能用 hasHydrated 判断存储是否已经写回 Store。
  - 能识别模块级 Store 跨请求共用，以及创建时立刻读 localStorage 这两类错误。
recap:
  - 水合要求两端第一帧用同一份状态。
  - persist 默认在创建时水合，会在第一帧读到存储值。
  - skipHydration 把水合交给 rehydrate，通常放进挂载后的副作用。
  - 服务端按请求创建 Store，不要用模块单例跨请求共享。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand SSR and Hydration
    url: https://zustand.docs.pmnd.rs/learn/guides/ssr-and-hydration
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 水合把服务端 HTML 变成可交互应用，客户端使用 hydrateRoot。
      - hydrateRoot 收到的树必须与服务端产出一致。
      - 常见不一致来自渲染里判断 typeof window、调用浏览器 API，或两端数据不同。
  - title: Zustand Setup with Next.js
    url: https://zustand.docs.pmnd.rs/learn/guides/nextjs
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - Zustand Store 是模块级状态，默认会在请求之间共享。
      - 服务端应按请求创建 Store，不要定义成全局变量。
      - 两端输出不同会触发 hydration errors。
  - title: Zustand 5.0.15 Persisting store data
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/integrations/persisting-store-data.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 默认在初始化时水合。
      - skipHydration 为真时不自动水合，需要手动调用 rehydrate。
      - 官方示例在挂载后的 useEffect 里调用 persist.rehydrate。
  - title: Zustand 5.0.15 persist middleware reference
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/persist.md
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - skipHydration 默认是 false。
      - 为 true 时初始化不会自动水合，要手动 rehydrate，适用于 SSR。
  - title: Zustand 5.0.15 persist middleware implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/persist.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 只有 options.skipHydration 为真时才跳过创建时的 hydrate。
      - rehydrate 就是再次调用 hydrate。
      - hasHydrated 在水合完成前是 false，完成后才是 true。
      - createJSONStorage 在 getStorage 抛错时返回 undefined，注释写明用于服务端没有存储的情况。
      - 这是固定版本实现，不是另一套公共合同。
  - title: Zustand 5.0.15 persist sync tests
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/tests/persistSync.test.tsx
    sourceType: official-test
    appliesTo: Zustand 5.0.15
    claims:
      - skipHydration 时创建后仍是初始状态，hasHydrated 为 false。
      - 调用 rehydrate 之后才会采用存储里的字段。
  - title: React hydrateRoot
    url: https://react.dev/reference/react-dom/client/hydrateRoot
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 传入 hydrateRoot 的 React 树必须与服务端渲染结果一致。
---

# SSR 与 Hydration

## 一、学习目标

- 说明 `hydrateRoot` 要求服务端 HTML 与首次客户端渲染一致。
- 给 `persist` 打开 `skipHydration`，并在挂载后调用 `rehydrate`。
- 用 `hasHydrated` 判断存储是否已经写回 Store。
- 识别模块级 Store 跨请求共用，以及创建时立刻读 `localStorage` 这两类错误。

## 二、为什么第一帧不能读本地存储

服务端把组件渲成 HTML。浏览器拿到这份标记后，用 `hydrateRoot` 接上事件。React 要求这次客户端渲染的输出和服务端相同。

官方 SSR 指南列出的常见破坏点包括：渲染时写 `typeof window !== 'undefined'`、调用 `window.matchMedia` 这类浏览器 API，以及两端数据不一样。

`persist` 默认在 `create` 时就水合。模块在客户端一加载，就会去读 `localStorage`。服务端没有这份存储，第一帧仍是初始值；客户端第一帧已经是存储值。界面字不一样，水合失败。

## 三、核心概念

### 1. 两端第一帧用同一份状态

水合不是“再渲染一次更好看的界面”。它是把已有 HTML 变成可交互树。树对不上时，React 会当 bug 处理：轻则变慢，重则事件绑错节点。

Zustand 本身不负责输出 HTML。它只决定第一帧读到哪份 state。服务端和客户端第一帧必须拿到同一份字段。本地存储、`window`、媒体查询都不能出现在这次渲染里。

### 2. 按请求创建 Store，不要用模块单例

`create` 写在模块顶层时，整个 JS 模块共用一份 api。服务端若同时处理多个请求，这份单例会串到别的请求上。

官方建议按请求调用创建函数，再通过 Context 交给子树。这和 Store Factory、Context 作用域是同一条路：每次调用 `createStore` 得到一份新的 api，用 `useState(() => createStore(...))` 在本次渲染树里留住它。

### 3. persist 用 skipHydration 推迟读存储

`skipHydration` 默认按假值处理，创建时立刻 `hydrate()`。设为 `true` 后，初始化不再读存储，`hasHydrated()` 仍是 `false`，当前 state 保持初始值。

需要恢复存储时，再调用 `persist.rehydrate()`。官方示例把这句放进挂载后的 `useEffect`，这样第一帧已经结束，不会改水合用的那份输出。

```ts
export const useBoundStore = create(
  persist(
    () => ({
      count: 0,
    }),
    {
      name: 'counter-storage',
      skipHydration: true,
    },
  ),
)
```

```tsx
import { useEffect } from 'react'
import { useBoundStore } from './path-to-store'

export function StoreConsumer() {
  useEffect(() => {
    void useBoundStore.persist.rehydrate()
  }, [])

  return null
}
```

官方同步测试里：`skipHydration: true` 时创建后 `getState()` 仍是初始值，`hasHydrated()` 为 `false`；`await rehydrate()` 之后才变成存储里的字段。

### 4. 创建存储失败时 persist 不会挂上

`createJSONStorage(() => window.localStorage)` 会立刻调用 `getStorage()`。服务端没有 `window` 时，这次调用会抛错。v5.0.15 源码用 `try/catch` 吃掉错误并返回 `undefined`，注释写明是为了服务端没有存储的情况。这是固定版本实现，不是另一套公共合同。

`storage` 不可用时，`persist` 不再挂 `persist.rehydrate`，后续 `set` 只会 `console.warn`。客户端如果重新执行模块并拿到真实存储，行为又和服务器那次创建不同。SSR 场景应显式 `skipHydration`，在客户端挂载后再 `rehydrate`，不要指望默认存储在服务端“自动变空”。

下面的 Demo 三份 Store 都预先写入 `{ theme: '深色' }`。左侧创建时立刻水合，主题已是深色。中间打开 `skipHydration`，主题仍是浅色。右侧同样跳过，点「挂载后水合」才变成深色。

:::demo{id="react.zustand.learn.advanced.ssr-and-hydration.ssr-and-hydration-demo"}
:::

## 四、用法与示例

### 1. 挂载后再水合

```tsx
import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create<{ theme: string }>()(
  persist(
    () => ({
      theme: '浅色',
    }),
    {
      name: 'theme-storage',
      skipHydration: true,
    },
  ),
)

export function ThemeGate() {
  useEffect(() => {
    void useThemeStore.persist.rehydrate()
  }, [])

  const theme = useThemeStore((state) => state.theme)
  const hydrated = useThemeStore.persist.hasHydrated()

  return (
    <p>
      {hydrated ? theme : '浅色'}
    </p>
  )
}
```

第一帧不要读存储。`hasHydrated()` 为 `false` 时继续展示和服务端相同的初始值。

### 2. 服务端按请求创建

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type ThemeStore = {
  theme: string
  setTheme: (theme: string) => void
}

const createThemeStore = () =>
  createStore<ThemeStore>()(
    persist(
      (set) => ({
        theme: '浅色',
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'theme-storage',
        skipHydration: true,
      },
    ),
  )
```

每个请求、每棵需要隔离的树都调用一次。Provider 用 `useState(() => createThemeStore())` 留下这一份 api。不要把 `create(...)` 的单例直接拿去服务端渲染。

### 3. 手动确认水合是否完成

```ts
const ready = useThemeStore.persist.hasHydrated()
```

`onFinishHydration` 在水合结束时调用。需要在组件外等待时，用它代替轮询。`rehydrate` 可以返回 Promise，官方测试使用 `await useBoundStore.persist.rehydrate()`。

## 五、易错使用提示

:::pitfalls
### 错误：第一帧就按存储值渲染

**触发条件：** `persist` 使用默认水合，组件直接把 `theme` 写进首屏文本。

**原因：** 创建 Store 时已经 `hydrate()`。客户端第一帧读到 `localStorage`，服务端没有。

**后果：** 两端 HTML 不一致，出现 hydration mismatch。

**错误示例：**

```ts
const useThemeStore = create<{ theme: string }>()(
  persist(() => ({ theme: '浅色' }), { name: 'theme-storage' }),
)
```

**正确写法：**

```ts
const useThemeStore = create<{ theme: string }>()(
  persist(() => ({ theme: '浅色' }), {
    name: 'theme-storage',
    skipHydration: true,
  }),
)
```

**验证方式：** 打开 `skipHydration` 后，创建完毕 `hasHydrated()` 为 `false`，`theme` 仍是 `浅色`。

### 错误：渲染函数里判断 window

**触发条件：** 组件写 `typeof window !== 'undefined' ? get().theme : '浅色'`。

**原因：** 官方水合指南把这类检查列为 mismatch 的常见原因。服务端走假分支，客户端走真分支。

**后果：** 第一帧文本不同，水合失败。

**错误示例：**

```tsx
const theme =
  typeof window !== 'undefined' ? useThemeStore.getState().theme : '浅色'
```

**正确写法：**

```tsx
const theme = useThemeStore((state) => state.theme)
```

**验证方式：** 去掉 `window` 判断后，两端第一帧都渲染初始 `theme`。

### 错误：模块级 Store 跨请求共用

**触发条件：** 服务端直接导入 `export const useBoundStore = create(...)`。

**原因：** 模块只创建一次 api。并发请求会读到别人刚 `set` 过的字段。

**后果：** 用户看到另一份请求的状态，或两端快照对不上。

**错误示例：**

```ts
export const useThemeStore = create<{ theme: string }>()(() => ({
  theme: '浅色',
}))
```

**正确写法：**

```ts
export const createThemeStore = () =>
  createStore<{ theme: string }>()(() => ({
    theme: '浅色',
  }))
```

**验证方式：** 连续两次调用创建函数，改第一份的 `theme`，第二份仍是 `浅色`。

### 错误：skipHydration 之后不调用 rehydrate

**触发条件：** 只写了 `skipHydration: true`，没有任何 `persist.rehydrate()`。

**原因：** 初始化被跳过。没有第二次 `hydrate()`，存储不会进入 Store。

**后果：** 刷新后一直停在初始值，`hasHydrated()` 保持 `false`。

**错误示例：**

```ts
persist(() => ({ theme: '浅色' }), {
  name: 'theme-storage',
  skipHydration: true,
})
```

**正确写法：**

```ts
void useThemeStore.persist.rehydrate()
```

**验证方式：** 调用 `rehydrate` 之后 `hasHydrated()` 为 `true`，`theme` 变成存储值。

### 错误：服务端创建时把 localStorage 抛错当成已持久化

**触发条件：** `createJSONStorage(() => localStorage)` 在没有 `window` 的环境执行。

**原因：** v5.0.15 里 `getStorage` 抛错时 `createJSONStorage` 返回 `undefined`。没有可用 `storage` 时，中间件不挂 `persist` API。这是固定版本实现，不是公共合同。

**后果：** 服务端这份 Store 不能 `rehydrate`；客户端若重新创建行为又不同。

**错误示例：**

```ts
persist(
  () => ({ theme: '浅色' }),
  {
    name: 'theme-storage',
    storage: createJSONStorage(() => localStorage),
  },
)
```

**正确写法：**

```ts
persist(
  () => ({ theme: '浅色' }),
  {
    name: 'theme-storage',
    skipHydration: true,
  },
)
```

**验证方式：** 打开 `skipHydration` 后，客户端挂载再 `rehydrate`，`hasHydrated()` 变为 `true`。
:::

## 六、原理与适用场景

### 1. 官方事实

SSR 指南要求 `hydrateRoot` 的输出与服务端一致，并点名 `typeof window`、浏览器 API 和两端数据不同。`persist` 文档写明默认初始化时水合；`skipHydration` 为真时改为手动 `rehydrate`，官方示例放在 `useEffect`。中间件参考把 `skipHydration` 默认写成 `false`，并标明适用于 SSR。源码里 `if (!options.skipHydration) hydrate()`；`hasHydrated` 在完成前为 `false`。v5.0.15 的 `createJSONStorage` 捕获 `getStorage` 抛错，这是固定版本实现，不是公共合同。同步测试覆盖跳过水合后仍是初始值、手动 `rehydrate` 后采用存储。官方框架指南把模块级 Store 称为会跨请求共享的状态，要求按请求创建。

### 2. 课程推导

Zustand 不替换 React 的水合协议。它只提供两件事：按请求隔离 api，以及把读存储从创建时刻挪到挂载之后。第一帧继续用初始 state，才能和没有 `localStorage` 的服务端对齐。

### 3. 适用边界

本课不展开具体 SSR 框架的路由、Server Component，也不把 cookie 服务端水合、自定义 storage 引擎和版本迁移当作主线。

## 七、练习

:::exercise
### 给主题 Store 推迟水合

**要求：** 使用 `create` 和 `persist` 创建 `useThemeStore`，初始 `theme` 为 `浅色`，存储里已有 `深色`。打开 `skipHydration`。先断言 `hasHydrated()` 为 `false` 且 `theme` 为 `浅色`；再 `await persist.rehydrate()`，断言 `hasHydrated()` 为 `true` 且 `theme` 为 `深色`。不要在创建时读 `window`，不要把 `StateCreator` 当 Store。

**验收：** 水合前是初始浅色；`rehydrate` 之后是存储里的深色，并且 `hasHydrated()` 为 `true`。

**参考答案：**

```ts
import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'

const memory: Record<string, string> = {
  'theme-storage': JSON.stringify({
    state: { theme: '深色' },
    version: 0,
  }),
}

const memoryStorage: StateStorage = {
  getItem: (name) => memory[name] ?? null,
  setItem: (name, value) => {
    memory[name] = value
  },
  removeItem: (name) => {
    delete memory[name]
  },
}

const useThemeStore = create<{ theme: string }>()(
  persist(
    () => ({
      theme: '浅色',
    }),
    {
      name: 'theme-storage',
      skipHydration: true,
      storage: createJSONStorage(() => memoryStorage),
    },
  ),
)

if (useThemeStore.persist.hasHydrated()) {
  throw new Error('跳过水合后应为 false')
}
if (useThemeStore.getState().theme !== '浅色') {
  throw new Error('水合前应为浅色')
}

await useThemeStore.persist.rehydrate()

if (!useThemeStore.persist.hasHydrated()) {
  throw new Error('水合后应为 true')
}
if (useThemeStore.getState().theme !== '深色') {
  throw new Error('水合后应为深色')
}
```
:::

## 八、本节小结

- 水合要求服务端和首次客户端渲染同一份界面。
- `persist` 默认创建时读存储，SSR 第一帧会对不上。
- `skipHydration` 之后在挂载时 `rehydrate`。
- 服务端按请求创建 Store，不要用模块单例。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand SSR and Hydration](https://zustand.docs.pmnd.rs/learn/guides/ssr-and-hydration) - `hydrateRoot` 与不一致原因。
- [Zustand Setup with Next.js](https://zustand.docs.pmnd.rs/learn/guides/nextjs) - 模块级 Store 按请求创建。
- [Zustand 5.0.15 Persisting store data](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/integrations/persisting-store-data.md) - `skipHydration` 与 `rehydrate`。
- [Zustand 5.0.15 persist middleware reference](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/persist.md) - `skipHydration` 默认值。
- [Zustand 5.0.15 persist middleware implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/persist.ts) - 跳过水合与 `hasHydrated`。
- [Zustand 5.0.15 persist sync tests](https://github.com/pmndrs/zustand/blob/v5.0.15/tests/persistSync.test.tsx) - 跳过水合后的初始值。
- [React hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) - 水合树必须与服务端一致。
