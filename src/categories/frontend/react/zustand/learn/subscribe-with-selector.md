---
id: react.zustand.learn.advanced.subscribe-with-selector
type: lesson
title: subscribeWithSelector
summary: 用 subscribeWithSelector 给 subscribe 加上选择函数，只在选中切片变化时通知，并可立即触发或自定义相等比较。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.intermediate.subscribe
  - react.zustand.learn.advanced.advanced-typescript
related:
  - react.zustand.learn.intermediate.subscribe
  - react.zustand.learn.intermediate.use-shallow
  - react.zustand.learn.advanced.vanilla-store
tags:
  - Zustand
  - subscribeWithSelector
  - equalityFn
  - fireImmediately
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能用 subscribeWithSelector 包裹初始化函数，让 subscribe 接受选择函数。
  - 能说明只在选中切片按相等函数判定变化时才会调用 listener。
  - 能使用 fireImmediately 在订阅当下立刻收到当前切片。
  - 能识别选择函数每次返回新对象时，默认 Object.is 会把每次写入都当成变化。
recap:
  - 默认 subscribe 没有选择函数，中间件才会加上第二套签名。
  - 相等函数默认是 Object.is。
  - fireImmediately 用当前切片当新旧两份参数立刻调用一次。
  - 返回值仍然是取消函数。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README Using subscribe with selector
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 需要按选择函数订阅时使用 subscribeWithSelector 中间件。
      - "中间件让 subscribe 多一套签名：subscribe(selector, callback, options?: { equalityFn, fireImmediately })。"
      - listener 能同时收到当前选中值和上一份选中值。
      - 可以选择数组并用 equalityFn 传入 shallow。
      - fireImmediately 为 true 时订阅当下就会调用 listener。
  - title: Zustand 5.0.15 subscribeWithSelector middleware reference
    url: https://zustand.docs.pmnd.rs/reference/middlewares/subscribe-with-selector.html
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 中间件让你可以按当前 state 订阅特定数据。
      - mutator 是 ["zustand/subscribeWithSelector", never]。
      - 官方示例用 createStore 包住中间件，再 subscribe((state) => state.position, render)。
      - 也可以只选择嵌套字段，例如 position.x。
  - title: Zustand 5.0.15 subscribeWithSelector implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/subscribeWithSelector.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 没有第二参数时，第一参数仍当作整份 state 的 listener。
      - 有选择函数时，相等函数默认是 Object.is。
      - 只有相等函数判定切片不同时才调用 listener，参数是新切片和旧切片。
      - fireImmediately 用当前切片作为新旧两份参数立刻调用一次。
      - 最终仍交给原来的 subscribe 注册包装后的 listener。这是固定版本实现，不是另一套公共合同。
  - title: Zustand 5.0.15 subscribe tests
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/tests/subscribe.test.tsx
    sourceType: official-test
    appliesTo: Zustand 5.0.15
    claims:
      - 选中切片没变时 listener 不会被调用。
      - 选中切片变化时 listener 收到新值和旧值。
      - equalityFn 返回 true 时即使写入发生也不会调用。
      - equalityFn 返回 false 时会调用。
      - 取消后该 listener 不再收到后续切片变化。
      - fireImmediately 为 true 时立刻以相同的当前值调用一次。
---

# subscribeWithSelector

## 一、学习目标

- 用 `subscribeWithSelector` 包裹初始化函数，让 `subscribe` 接受选择函数。
- 说明只在选中切片按相等函数判定变化时才调用 listener。
- 使用 `fireImmediately` 在订阅当下立刻收到当前切片。
- 识别选择函数每次返回新对象时，默认 `Object.is` 会把每次写入都当成变化。

## 二、为什么默认 subscribe 不够

中级课的 `subscribe` 只接收一个 listener。每次成功写入后，它同步拿到整份当前 state 和上一份 state。要只关心 `theme`，只能自己写 `if (state.theme === prevState.theme) return`。`ticks` 变化时这个函数还是会被叫到。

需要按字段订阅、自定义相等比较，或一订阅就先跑一遍时，官方 README 指向 `subscribeWithSelector`。它不改 Hook 选择规则，只改挂在 Store 上的 `subscribe` 签名。

## 三、核心概念

### 1. 中间件给 subscribe 加一套签名

从 `zustand/middleware` 导入，并立刻写在 `create` 里：

```ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

type PreferenceStore = {
  theme: string
  draft: number
  ticks: number
  toggleTheme: () => void
  bumpDraft: () => void
  tick: () => void
}

const usePreferenceStore = create<PreferenceStore>()(
  subscribeWithSelector((set, get) => ({
    theme: '浅色',
    draft: 0,
    ticks: 0,
    toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
    bumpDraft: () => set({ draft: get().draft + 1 }),
    tick: () => set({ ticks: get().ticks + 1 }),
  })),
)
```

官方 Reference 用同样的中间件包 `createStore`。React 绑定 Store 和 Vanilla Store 改的都是 api 上的 `subscribe`。

README 把多出来的签名写成：

```ts
subscribe(selector, callback, options?: { equalityFn, fireImmediately }): Unsubscribe
```

类型声明里仍保留单参数形式：只传 listener 时，行为与默认 `subscribe` 相同，收到的是整份 state。

### 2. 只比较选中切片

有第二参数时，中间件先用选择函数取出切片，再用相等函数决定要不要调用 listener：

```ts
const unsub = usePreferenceStore.subscribe(
  (state) => state.theme,
  (theme, previousTheme) => {
    console.log(previousTheme, '→', theme)
  },
)
```

官方测试写明：`setState({ other: 'b' })` 时，订阅 `value` 的 listener 不会被调用；`value` 加一后，listener 收到新值和旧值。

固定版本实现里，相等函数默认是 `Object.is`。切片没变就不会调用。返回值仍是取消函数；取消后该 listener 不再收到后续切片变化。

这和 Store Hook 的选择函数是两条路。Hook 决定组件要不要重渲染；这里决定外部回调要不要跑。

### 3. equalityFn 比较的是切片，不是整份 state

README 允许选择数组，并传入 `shallow`：

```ts
import { shallow } from 'zustand/shallow'

usePreferenceStore.subscribe(
  (state) => [state.theme, state.draft],
  (slice, previousSlice) => {
    console.log(previousSlice, '→', slice)
  },
  { equalityFn: shallow },
)
```

选择函数每次都 `return [state.theme, state.draft]` 时，默认 `Object.is` 看到的是两个新数组，引用永远不同，`ticks` 变化也会通知。`equalityFn: shallow` 比较的是数组项，两个字段都没变就不会通知。

官方测试还覆盖了自定义相等函数：返回 `true` 时即使写入发生也不调用；返回 `false` 时会调用。

### 4. fireImmediately 用当前切片立刻调用一次

```ts
usePreferenceStore.subscribe(
  (state) => state.theme,
  (theme, previousTheme) => {
    console.log(theme, previousTheme)
  },
  { fireImmediately: true },
)
```

官方测试写明：初始 `value` 为 `1` 时，订阅当下就会调用一次，参数是 `(1, 1)`。固定版本实现把当前切片同时当作新旧两份传进去，不会再等下一次写入。

默认仍然不会在订阅当下跑一遍。需要立刻拿到当前切片时才打开这项。

### 5. 观察字段订阅和立即触发

下面的 Demo 用一份偏好 Store。左侧只订阅主题：切换主题会追加记录，增加草稿或无关计数不会。中间只订阅草稿，规则对称。右侧打开立即触发后再订阅主题，订阅当下就会先留下当前主题，之后仍只在主题变化时追加。

:::demo{id="react.zustand.learn.advanced.subscribe-with-selector.subscribe-with-selector-demo"}
:::

## 四、用法与示例

### 1. 按字段做外部副作用

```tsx
useEffect(() => {
  return usePreferenceStore.subscribe(
    (state) => state.theme,
    (theme, previousTheme) => {
      document.title = theme
      void previousTheme
    },
  )
}, [])
```

界面上的主题文案继续用 Store Hook 选择。不要在这个 listener 里再 `setState` 把同一份数据画一遍。

### 2. Vanilla Store 同样包中间件

官方 Reference 的用法是 `createStore` 加上选择 `position`：

```ts
import { createStore } from 'zustand/vanilla'
import { subscribeWithSelector } from 'zustand/middleware'

const positionStore = createStore<PositionStore>()(
  subscribeWithSelector((set) => ({
    position: { x: 0, y: 0 },
    setPosition: (position) => set({ position }),
  })),
)

positionStore.subscribe((state) => state.position, render)
positionStore.subscribe((state) => state.position.x, logger)
```

组件渲染仍走 `useStore(api, selector)`。这里的选择函数只服务外部 `subscribe`。

### 3. 需要多项时显式给相等函数

```ts
usePreferenceStore.subscribe(
  (state) => [state.theme, state.draft],
  (slice) => {
    console.log(slice)
  },
  { equalityFn: shallow },
)
```

不要指望默认 `Object.is` 去理解新数组里的字段。

## 五、易错使用提示

:::pitfalls
### 错误：没有中间件却把选择函数放在第一参数

**触发条件：** 写成 `usePreferenceStore.subscribe((state) => state.theme, console.log)`，创建 Store 时没有 `subscribeWithSelector`。

**原因：** 默认 `subscribe` 只接收一个 listener。第一参数会被当成回调；第二参数会被丢掉。状态变化时 Store 只是调用 `(state) => state.theme`，返回值没有人接手。

**后果：** 控制台没有日志，看起来像订阅失败。

**错误示例：**

```ts
const usePreferenceStore = create<PreferenceStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  ticks: 0,
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
  bumpDraft: () => set({ draft: get().draft + 1 }),
  tick: () => set({ ticks: get().ticks + 1 }),
}))

usePreferenceStore.subscribe((state) => state.theme, console.log)
```

**正确写法：**

```ts
const usePreferenceStore = create<PreferenceStore>()(
  subscribeWithSelector((set, get) => ({
    theme: '浅色',
    draft: 0,
    ticks: 0,
    toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
    bumpDraft: () => set({ draft: get().draft + 1 }),
    tick: () => set({ ticks: get().ticks + 1 }),
  })),
)

usePreferenceStore.subscribe((state) => state.theme, console.log)
```

**验证方式：** 切换主题后 listener 打印新主题；增加草稿时这个 listener 不再被调用。

### 错误：选择函数每次返回新对象或新数组，却不传 equalityFn

**触发条件：** `subscribe((state) => ({ theme: state.theme, draft: state.draft }), listener)`，或返回 `[state.theme, state.draft]`，options 留空。

**原因：** 默认相等函数是 `Object.is`。每次写入都会得到新的对象或数组引用，即使字段值没变也会判定为变化。

**后果：** `ticks` 变化时 listener 照样跑，选择函数失去过滤作用。

**错误示例：**

```ts
usePreferenceStore.subscribe(
  (state) => [state.theme, state.draft],
  (slice) => {
    console.log(slice)
  },
)
```

**正确写法：**

```ts
usePreferenceStore.subscribe(
  (state) => [state.theme, state.draft],
  (slice) => {
    console.log(slice)
  },
  { equalityFn: shallow },
)
```

**验证方式：** 增加无关计数后，带 `shallow` 的 listener 不再被调用；两个字段之一变化时仍会调用。

### 错误：把 fireImmediately 当成默认行为

**触发条件：** 订阅后立刻去读副作用日志，以为当前主题已经写进去了，但没有传 `fireImmediately: true`。

**原因：** 官方测试只在 `fireImmediately: true` 时于订阅当下调用。默认与中级课相同，要等到下一次选中切片变化。

**后果：** 初始化逻辑漏掉当前值，必须再手动读一次 `getState`。

**错误示例：**

```ts
const lines: string[] = []
usePreferenceStore.subscribe(
  (state) => state.theme,
  (theme) => {
    lines.push(theme)
  },
)
```

**正确写法：**

```ts
const lines: string[] = []
usePreferenceStore.subscribe(
  (state) => state.theme,
  (theme) => {
    lines.push(theme)
  },
  { fireImmediately: true },
)
```

**验证方式：** 订阅完成时 `lines` 已经有当前主题；新旧两份参数相同。

### 错误：用这套 subscribe 去驱动本该由 Hook 选择的界面

**触发条件：** 在 listener 里 `setReactState(theme)`，再用这份本地 State 画主题文案。

**原因：** README 把选择订阅放在“组件外读写和响应变化”里。组件要渲染字段，仍然用 Store Hook 或 `useStore(api, selector)`。

**后果：** 多一份本地 State，卸载后若忘记取消还会对已卸载树更新。

**错误示例：**

```tsx
function ThemeLabel() {
  const [theme, setTheme] = useState(usePreferenceStore.getState().theme)
  useEffect(() => {
    return usePreferenceStore.subscribe(
      (state) => state.theme,
      setTheme,
    )
  }, [])
  return <p>{theme}</p>
}
```

**正确写法：**

```tsx
function ThemeLabel() {
  const theme = usePreferenceStore((state) => state.theme)
  return <p>{theme}</p>
}
```

**验证方式：** 切换主题后面板更新；组件文件里没有为同一字段再开一份 `useState`。

### 错误：注册后不调用返回值

**触发条件：** 在 `useEffect` 里调用选择订阅，没有 `return unsubscribe`。

**原因：** 中间件最终仍把包装后的 listener 交给原来的 `subscribe`。不调用返回值，函数会一直留在集合里。官方测试证明：取消后再改切片，该 listener 不再被调用。

**后果：** 卸载后的闭包继续运行。

**错误示例：**

```tsx
useEffect(() => {
  usePreferenceStore.subscribe(
    (state) => state.theme,
    (theme) => {
      console.log(theme)
    },
  )
}, [])
```

**正确写法：**

```tsx
useEffect(() => {
  return usePreferenceStore.subscribe(
    (state) => state.theme,
    (theme) => {
      console.log(theme)
    },
  )
}, [])
```

**验证方式：** 卸载后再切换主题，这条 listener 不再打印。
:::

## 六、原理与适用场景

### 1. 官方事实

README 写明：需要按选择函数订阅时使用 `subscribeWithSelector`。多出来的签名是 `subscribe(selector, callback, options?: { equalityFn, fireImmediately })`。listener 能拿到当前选中值和上一份选中值；数组选择可以配 `shallow`；`fireImmediately` 会在订阅当下调用。

官方 Reference 写明：中间件按当前 state 订阅特定数据；mutator 是 `["zustand/subscribeWithSelector", never]`。示例用 `createStore` 订阅 `position` 或 `position.x`。

固定版本实现里，没有第二参数时第一参数仍是整份 state 的 listener；有选择函数时默认 `Object.is`；`fireImmediately` 用当前切片作为新旧两份参数立刻调用。官方测试覆盖切片未变不调用、切片变化传入新旧值、自定义相等函数、取消和立即触发。

### 2. 课程推导

这套中间件不改变 `set` 合并规则，也不替代 Hook 选择。它只是在默认 `subscribe` 外面加一层切片比较。选择函数每次返回新引用时，过滤发生在相等函数，不发生在选择函数本身。

### 3. 适用边界

本课不组合 `persist`、`devtools`、`immer`。`useShallow` 服务的是 Hook 选择结果，不是这套 `subscribe` 的 `equalityFn`。自定义 middleware 和高阶 mutator 不作为主线。React 组件渲染字段继续用 Store Hook。

## 七、练习

:::exercise
### 只在主题变化时追加日志，订阅当下先留下当前主题

**要求：** 从 `zustand` 导入 `create`，从 `zustand/middleware` 导入 `subscribeWithSelector`。Store 包含 `theme`、`draft`、`toggleTheme`、`bumpDraft`。用中间件创建 Store。在 `ThemeChangeLog` 的 `useEffect` 里订阅 `(state) => state.theme`，`fireImmediately` 为 `true`，把 `previous → current` 追加到组件内数组。`useEffect` 必须返回取消函数。不要用 listener 去更新主题文案，主题文案继续用 Store Hook 选择。增加草稿时日志不得追加。

**验收：** 挂载后日志至少有一条，新旧主题相同。切换主题后多一条，新旧不同。调用 `bumpDraft` 后日志条数不变。

**参考答案：**

```tsx
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useEffect, useState } from 'react'

type PreferenceStore = {
  theme: string
  draft: number
  toggleTheme: () => void
  bumpDraft: () => void
}

const usePreferenceStore = create<PreferenceStore>()(
  subscribeWithSelector((set, get) => ({
    theme: '浅色',
    draft: 0,
    toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
    bumpDraft: () => set({ draft: get().draft + 1 }),
  })),
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
      { fireImmediately: true },
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

- 按字段订阅要包 `subscribeWithSelector`，不要改默认 `subscribe` 的参数顺序。
- 默认用 `Object.is` 比较切片；新对象或新数组要自己传 `equalityFn`。
- `fireImmediately` 才会在订阅当下用当前切片调用一次。
- 组件渲染仍走 Hook 选择；这套 API 留给外部副作用，并在不需要时取消。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 README Using subscribe with selector](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 选择函数签名、上一份值、equalityFn、fireImmediately。
- [Zustand 5.0.15 subscribeWithSelector middleware reference](https://zustand.docs.pmnd.rs/reference/middlewares/subscribe-with-selector.html) - 中间件职责、mutator、createStore 示例。
- [Zustand 5.0.15 subscribeWithSelector implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/middleware/subscribeWithSelector.ts) - 默认 Object.is 与立即触发实现。
- [Zustand 5.0.15 subscribe tests](https://github.com/pmndrs/zustand/blob/v5.0.15/tests/subscribe.test.tsx) - 切片过滤、相等函数、取消和立即触发。
