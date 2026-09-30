---
id: react.zustand.learn.intermediate.devtools
type: lesson
title: DevTools 调试
summary: 用 devtools 中间件把每次 set 接到 Redux DevTools，并用第三参数给写入命名。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.intermediate.persist
related:
  - react.zustand.learn.intermediate.persist
  - react.zustand.learn.basics.set-state-updates
tags:
  - Zustand
  - devtools
  - Redux DevTools
  - action type
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能用 devtools 包裹 create 的初始化函数，并给连接提供 name。
  - 能在 set 的第三参数传入 action 名称或带 type 的对象。
  - 能说明命名时第二参数应保持 undefined，避免改掉默认合并。
  - 能识别未命名写入会落到 anonymousActionType 或 anonymous。
recap:
  - devtools 是中间件，不是新的 Store API；它把每次 set 发给 Redux DevTools。
  - 可靠的时间线名称来自 set 的第三参数，不要依赖调用栈推断。
  - 命名时第二参数传 undefined，不要写成 true 或 false。
  - enabled 在开发默认开启，生产默认关闭；多份 Store 用不同 name 分开连接。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README Redux devtools
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 使用 devtools 中间件需要安装 Redux DevTools 浏览器扩展。
      - "从 `zustand/middleware` 导入 `devtools`。"
      - "给 `set` 传入第三参数可以记录 action 类型，字符串或带 `type` 的对象都可以。"
      - 未提供 action 类型时默认是 anonymous，可用 anonymousActionType 自定义。
      - name 会在 DevTools 里创建独立连接。
      - enabled 可在生产环境关闭。
  - title: Zustand 5.0.15 devtools middleware reference
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/devtools.md
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - devtools 让 Store 使用 Redux DevTools Extension，不需要 Redux。
      - enabled 开发环境默认 true，生产环境默认 false。
      - anonymousActionType 在无法得到名称时作为默认 action 类型。
      - 命名时第二参数应保持 undefined，以免改掉默认替换逻辑。
      - 不用时可以调用 store.devtools.cleanup 断开连接。
  - title: Zustand 5.0.15 devtools middleware implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/devtools.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 没有扩展或不满足 enabled 时，devtools 直接返回原始初始化函数。
      - 未传第三参数时，名称依次取 anonymousActionType、调用栈推断，最后才是 anonymous。
      - 字符串第三参数会被包成带 type 的对象再 send。
---

# DevTools 调试

## 一、学习目标

- 用 `devtools` 包裹初始化函数，并给连接提供 `name`。
- 在 `set` 的第三参数传入 action 名称或带 `type` 的对象。
- 命名时第二参数保持 `undefined`，不改默认合并。
- 识别未命名写入会落到 `anonymousActionType` 或 `anonymous`。

## 二、为什么需要 DevTools

偏好被切到深色、草稿被加了一次，界面只显示结果。排查时需要一条时间线：哪一次写入、叫什么名字、写之前和写之后的 state。

Zustand 自己不带面板。`devtools` 把每次 `set` 发给 Redux DevTools Extension。它不是新的 Store API，组件仍然只选字段和 Action。

官方 README 要求先安装 Redux DevTools 浏览器扩展。没有扩展时，中间件不会连接，Store 行为与未包裹时相同。

## 三、核心概念

### 1. devtools 包裹初始化函数

从 `zustand/middleware` 导入 `devtools`。它接收初始化函数和可选选项，返回仍可交给 `create` 的 State Creator。

```tsx
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type PreferenceStore = {
  theme: string
  toggleTheme: () => void
}

const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    (set, get) => ({
      theme: '浅色',
      toggleTheme: () =>
        set(
          { theme: get().theme === '浅色' ? '深色' : '浅色' },
          undefined,
          'preference/toggleTheme',
        ),
    }),
    { name: 'PreferenceStore' },
  ),
)
```

`name` 是这条连接在 DevTools 里的标识。不同 Store 用不同 `name`，时间线才分得开。官方文档写明：开发环境 `enabled` 默认 `true`，生产环境默认 `false`。

### 2. 第三参数才是时间线上的名称

`set` 在包了 `devtools` 之后可以接收第三参数。官方 README 给出两种写法：

```tsx
set((state) => ({ fishes: state.fishes - 1 }), undefined, 'bear/eatFish')
set((state) => ({ fishes: state.fishes + count }), undefined, {
  type: 'bear/addFishes',
  count,
})
```

字符串会被当成 `type`。对象必须自带 `type`，其余字段会一起出现在 DevTools 记录里。

第二参数仍然是 `replace`。官方 troubleshooting 写明：只想命名时传 `undefined`，不要写成 `true` 或 `false`，否则会改掉默认合并。

### 3. 未命名时落到 anonymous

官方文档写明：未提供 action 类型时默认是 `anonymous`，可用 `anonymousActionType` 改掉这个默认值。

当前 5.0.15 源码的顺序是：先看第三参数；没有则用 `anonymousActionType`；再没有则尝试从调用栈推断函数名；推断失败才用 `anonymous`。推断依赖引擎和打包结果，不能当公共合同。要稳定名称，显式传第三参数。

### 4. 没有扩展时中间件是空操作

源码里，`enabled` 未传入时用 `process.env.NODE_ENV !== "production"` 决定是否尝试连接。找不到 `window.__REDUX_DEVTOOLS_EXTENSION__` 时，直接返回原始初始化函数，`set` 仍可调用，只是没有时间线。

`usePreferenceStore.devtools.cleanup()` 会断开连接。动态创建、用完即弃的 Store 才需要它，本课不展开。

## 四、用法与示例

### 1. 给每次业务写入命名

```tsx
const usePreferenceStore = create<PreferenceStore>()(
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
    {
      name: 'PreferenceStore',
      anonymousActionType: 'anonymous',
    },
  ),
)
```

`toggleTheme` 在时间线上是 `preference/toggleTheme`。`bumpDraft` 没有第三参数，又设置了 `anonymousActionType`，时间线上是 `anonymous`。

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

组件不必知道 DevTools。名称写在 Action 里的 `set` 上。

### 3. 生产环境关闭

```tsx
devtools(initializer, {
  name: 'PreferenceStore',
  enabled: false,
})
```

官方默认已经在生产关闭。显式传入 `enabled: true` 才会在生产也尝试连接。

### 4. 观察命名写入和未命名写入

下面的 Demo 用 `devtools` 包一份偏好 Store。切换主题会送出 `preference/toggleTheme`；增加草稿没有第三参数，送出 `anonymous`。本页用一层演示连接记录 `send` 的 `type`，不依赖浏览器是否安装了扩展。增加无关计数时，主题和草稿面板不增加渲染次数。

:::demo{id="react.zustand.learn.intermediate.devtools.devtools-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：不给 set 传第三参数，时间线全是 anonymous

**触发条件：** 写成 `set({ theme: '深色' })`，又设置了 `anonymousActionType: 'anonymous'`，或推断失败。

**原因：** 没有第三参数时，中间件不会使用 Action 函数名作为公共名称。官方默认就是 `anonymous`。

**后果：** DevTools 里连续多条 `anonymous`，无法对应到「切换主题」还是「增加草稿」。

**错误示例：**

```tsx
toggleTheme: () => set({ theme: '深色' })
```

**正确写法：**

```tsx
toggleTheme: () =>
  set({ theme: '深色' }, undefined, 'preference/toggleTheme')
```

**验证方式：** 切换主题后，时间线出现 `preference/toggleTheme`，而不是 `anonymous`。

### 错误：为了命名把第二参数写成 true

**触发条件：** 写成 `set({ theme: '深色' }, true, 'preference/toggleTheme')`。

**原因：** 第二参数是 `replace`。`true` 会用下一份对象替换整份 state。`theme` 以外的 Action 和字段被清掉。

**后果：** 第一次切换后，再点按钮会报 Action 不是函数。

**错误示例：**

```tsx
toggleTheme: () => set({ theme: '深色' }, true, 'preference/toggleTheme')
```

**正确写法：**

```tsx
toggleTheme: () =>
  set({ theme: '深色' }, undefined, 'preference/toggleTheme')
```

**验证方式：** 命名后「增加草稿」和「切换主题」仍然可调用。

### 错误：两份 Store 都不设 name，DevTools 里只看见一份

**触发条件：** 两份 Store 都写成 `devtools((set) => ({ ... }))`，不传 `name`。

**原因：** Redux DevTools 默认一次显示一条连接。官方 troubleshooting 写明：要看其他 Store，需要在扩展里切换。没有 `name` 时连接难以区分。

**后果：** 排查时以为另一份 Store 没有更新。

**错误示例：**

```tsx
const useThemeStore = create(devtools((set) => ({ theme: '浅色' })))
const useDraftStore = create(devtools((set) => ({ draft: 0 })))
```

**正确写法：**

```tsx
const useThemeStore = create(
  devtools((set) => ({ theme: '浅色' }), { name: 'ThemeStore' }),
)
const useDraftStore = create(
  devtools((set) => ({ draft: 0 }), { name: 'DraftStore' }),
)
```

**验证方式：** 两份 Store 的 `name` 不相同。

### 错误：在生产环境显式 enabled true

**触发条件：** 写成 `devtools(initializer, { enabled: true })`，并打到生产包。

**原因：** 官方默认生产关闭。显式 `true` 会覆盖默认，尝试连接扩展并把 state 送到调试通道。

**后果：** 生产用户的客户端状态出现在 DevTools 时间线里。

**错误示例：**

```tsx
devtools(initializer, { enabled: true })
```

**正确写法：**

```tsx
devtools(initializer, { name: 'PreferenceStore' })
```

**验证方式：** 不传 `enabled`，或生产构建里显式 `enabled: false`。

### 错误：把调用栈推断当成稳定名称

**触发条件：** 不传第三参数，指望时间线出现 `toggleTheme`。

**原因：** 5.0.15 源码在没有 `anonymousActionType` 时会读调用栈。压缩、包装函数或不同浏览器会得到不同字符串，也可能得到 `anonymous`。

**后果：** 本地看得到函数名，生产时间线全是 `anonymous` 或乱码路径。

**错误示例：**

```tsx
toggleTheme: () => set({ theme: '深色' })
```

**正确写法：**

```tsx
toggleTheme: () =>
  set({ theme: '深色' }, undefined, 'preference/toggleTheme')
```

**验证方式：** 无论是否压缩，时间线名称都是手写的 `preference/toggleTheme`。
:::

## 六、原理与适用场景

### 1. 官方事实

README 的 Redux devtools 写明：需要安装 Redux DevTools 扩展；从 `zustand/middleware` 导入 `devtools`；`set` 的第三参数记录 action 类型，可以是字符串或带 `type` 的对象；未提供时默认 `anonymous`；`anonymousActionType` 可改默认值；`name` 创建独立连接；`enabled` 可关闭。

devtools middleware 文档写明：`devtools` 让 Store 使用 Redux DevTools Extension；`enabled` 开发默认 `true`、生产默认 `false`；命名时第二参数保持 `undefined`；不用时调用 `devtools.cleanup()`。

`src/middleware/devtools.ts` 里，没有扩展或不满足 `enabled` 时直接返回原始初始化函数。未传第三参数时，名称依次取 `anonymousActionType`、调用栈推断，最后才是 `anonymous`。字符串第三参数会被包成 `{ type }` 再 `send`。

### 2. 课程推导

DevTools 只观察已经发生的 `set`。名称是给排查的人看的，应写业务意图，例如 `preference/toggleTheme`，而不是 `setState`。调用栈推断可以偶尔补上名字，不能替代第三参数。

### 3. 适用边界

本课只讲 React 绑定 Store 上的 `devtools`、`name`、`set` 第三参数、`anonymousActionType` 和 `enabled`。`store` 选项把多份 Store 挂到同一条连接、Slices 的 `StateCreator` 标注、与 `persist` 组合、以及 `actionsDenylist`，都不在这里展开。

## 七、练习

:::exercise
### 为偏好 Store 加上 devtools 命名

**要求：** 已有一份偏好 Store，包含 `theme`、`draft`、`toggleTheme`、`bumpDraft`。用 `devtools` 包裹初始化函数。连接 `name` 设为 `PreferenceStore`。`anonymousActionType` 设为 `anonymous`。`toggleTheme` 的 `set` 第三参数为 `preference/toggleTheme`，第二参数为 `undefined`。`bumpDraft` 不传第三参数。不要引入 persist，不要设置 `store` 选项。

**验收：** 切换主题后时间线出现 `preference/toggleTheme`；增加草稿后时间线出现 `anonymous`；两次调用后两个 Action 仍可继续使用。

**参考答案：**

```tsx
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type PreferenceStore = {
  theme: string
  draft: number
  toggleTheme: () => void
  bumpDraft: () => void
}

const usePreferenceStore = create<PreferenceStore>()(
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
    {
      name: 'PreferenceStore',
      anonymousActionType: 'anonymous',
    },
  ),
)
```
:::

## 八、本节小结

- `devtools` 把每次 `set` 发给 Redux DevTools，没有扩展时就是空操作。
- 时间线名称来自 `set` 的第三参数；未命名时落到 `anonymousActionType` 或 `anonymous`。
- 命名时第二参数传 `undefined`，不要写成 `true`。
- 不同 Store 用不同 `name`；生产不要显式 `enabled: true`。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 README Redux devtools](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 第三参数、anonymous 与 name。
- [Zustand 5.0.15 devtools middleware reference](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/middlewares/devtools.md) - enabled、命名时的 replace 与 cleanup。
- [Zustand 5.0.15 devtools middleware implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/devtools.ts) - 无扩展时的空操作与名称回退顺序。
