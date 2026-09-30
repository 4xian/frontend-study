---
id: react.zustand.learn.intermediate.subscribe
type: lesson
title: subscribe 订阅
summary: 用 Store 上的 subscribe 在组件渲染之外同步收到整份 state 变化，并在不再需要时取消订阅。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.intermediate.devtools
related:
  - react.zustand.learn.intermediate.devtools
  - react.zustand.learn.basics.component-subscription
tags:
  - Zustand
  - subscribe
  - listener
  - unsubscribe
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能在 React 绑定 Store 上调用 subscribe，传入接收当前 state 和上一份 state 的 listener。
  - 能说明默认 subscribe 在整份 state 引用变化时同步触发，不带选择函数。
  - 能把 subscribe 的返回值当作取消函数，在 useEffect 清理或不再监听时调用。
  - 能区分 Store Hook 的渲染订阅和 subscribe 的外部回调。
recap:
  - subscribe 挂在 create 返回的 Hook 上，用来在组件渲染之外监听更新。
  - 默认 listener 在每次成功写入后同步收到整份当前 state 和上一份 state。
  - 相同引用的写入不会通知；字段值没变但产生了新对象仍会通知。
  - 返回值必须调用一次才能取消；默认不会在订阅当下立刻跑一遍。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README subscribe and transient updates
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - create 返回的 Hook 上挂有 getState、setState 和 subscribe。
      - "subscribe(console.log) 会监听全部变化，并在每次变化时同步触发。"
      - 调用 subscribe 的返回值可以取消这次监听。
      - subscribe 可以在不强制组件重渲染的情况下绑定状态变化，适合和 useEffect 一起在卸载时取消。
  - title: Zustand 5.0.15 create API
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/apis/create.md
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - create 返回带 setState、getState、getInitialState 和 subscribe 的 React Hook。
      - 注册 subscribe 回调后，Store 的 state 更新时会触发该回调，可用于外部状态管理。
      - 官方示例在 useEffect 里订阅，并在清理函数中调用返回的取消函数。
  - title: Zustand 5.0.15 vanilla store implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - "subscribe 的公共类型是 (listener: (state, prevState) => void) => () => void。"
      - 只有下一份 state 与当前 state 不是同一引用时才会通知。
      - 通知时同步遍历 listeners，把当前 state 和上一份 state 传给每个 listener。
      - 取消订阅就是从 listeners 集合里删除该函数。
  - title: Zustand 5.0.15 subscribe tests
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/tests/subscribe.test.tsx
    sourceType: official-test
    appliesTo: Zustand 5.0.15
    claims:
      - 写入同一引用时 listener 不会被调用。
      - 写入不同引用时 listener 会被调用，并同时收到当前 state 和上一份 state。
      - 可以同时存在多个 listener；取消其中一个后，其余仍会收到通知。
---

# subscribe 订阅

## 一、学习目标

- 在 React 绑定 Store 上调用 `subscribe`，传入接收当前 state 和上一份 state 的 listener。
- 说明默认 `subscribe` 监听的是整份 state 引用变化，不带选择函数。
- 保存并调用 `subscribe` 的返回值，结束这次监听。
- 区分 Store Hook 的渲染订阅和 `subscribe` 的外部回调。

## 二、为什么需要 subscribe

组件里调用 Store Hook，是为了把选中字段画到界面上。字段按 `Object.is` 变化后，该组件重渲染。

有些工作不是“再画一遍界面”：把变化写到日志、同步到非 React 模块、在高频更新时改 DOM 而不走渲染。这些路径需要一条不经过 JSX 的通知。

`create` 返回的 Hook 上挂着 `subscribe`。它注册一个回调：整份 state 成功换成新引用后，同步收到当前 state 和上一份 state。回调默认不会让组件重渲染。

## 三、核心概念

### 1. subscribe 挂在 Store Hook 上

`create` 的返回值既是 Hook，也带 `setState`、`getState`、`getInitialState` 和 `subscribe`。外部监听走 Hook 上的 `subscribe`，不需要再导入一份 Vanilla Store。

```tsx
import { create } from 'zustand'

type PreferenceStore = {
  theme: string
  draft: number
  toggleTheme: () => void
}

const usePreferenceStore = create<PreferenceStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
}))

const unsubscribe = usePreferenceStore.subscribe((state, prevState) => {
  console.log(prevState.theme, '→', state.theme)
})

unsubscribe()
```

类型声明里，默认签名只有一个参数：

```ts
subscribe: (listener: (state: T, prevState: T) => void) => () => void
```

第一参数是 listener，不是选择函数。返回值是取消函数。

### 2. 默认监听整份 state，同步触发

README 写明：`subscribe(console.log)` 监听全部变化，并且同步触发。官方测试写明：listener 同时收到当前 state 和上一份 state。

因此默认行为是：

- 任意一次产生新引用的写入都会通知，不管你关心的是 `theme` 还是 `ticks`。
- 回调在 `set` / `setState` 返回前就跑完，不是宏任务。
- 回调拿到的是整份 state，包含字段和 Action。

组件 Hook 仍然按选择函数缩小渲染范围。`subscribe` 不会自动套用那个选择函数。

### 3. 相同引用不通知，新对象会通知

源码在写入后先比较 `Object.is(nextState, state)`。同一引用直接返回，不遍历 listener。官方测试覆盖了这条：`setState(initialState)` 时 spy 不会被调用。

反过来，只要下一份值是新引用，即使字段内容看起来没变，也会通知。`set({ ticks: get().ticks })` 会先浅合并出新对象，listener 仍会收到回调。

`set(get())` 或 `set((state) => state)` 传回当前引用，不会通知。

### 4. 默认不会立刻回调

`subscribe` 只把函数放进集合。当前值不会因此再发一次。需要当下快照时，另外调用 `getState()`。

官方 `create` 示例把订阅放进 `useEffect`，并在清理函数里调用返回的取消函数。组件卸载后，这次外部监听必须结束；Store 本身还在。

## 四、用法与示例

### 1. 在组件外监听，再手动取消

```tsx
const unsubscribe = usePreferenceStore.subscribe((state, prevState) => {
  if (state.theme !== prevState.theme) {
    document.documentElement.dataset.theme = state.theme
  }
})

usePreferenceStore.getState().toggleTheme()
unsubscribe()
```

第一次 `toggleTheme` 会走进 listener。取消之后再切换，这个函数不再被调用。其他 listener 不受影响。

### 2. 和 useEffect 一起，卸载时取消

README 把 `subscribe` 和 `useEffect` 放在一起，用来在卸载时自动取消：

```tsx
import { useEffect, useRef } from 'react'

function ThemeProbe() {
  const latestTheme = useRef(usePreferenceStore.getState().theme)

  useEffect(() => {
    return usePreferenceStore.subscribe((state) => {
      latestTheme.current = state.theme
    })
  }, [])

  return null
}
```

`useEffect` 的清理函数直接返回 `subscribe` 的返回值。这里改的是 ref，不会因为主题变化而重渲染。这就是 README 说的 transient updates：绑定变化，但不强迫走 React 渲染。

界面上的主题文案仍然用 Store Hook 选择 `theme`，不要用 `subscribe` 去 `setState` 再画一遍。

### 3. 用 prevState 自己过滤字段

默认 API 没有选择函数。要只对某个字段做副作用，在 listener 里比较上一份和当前这份：

```tsx
usePreferenceStore.subscribe((state, prevState) => {
  if (state.draft === prevState.draft) {
    return
  }
  console.log('草稿', prevState.draft, '→', state.draft)
})
```

这是回调内部的判断，不是 Store 替你缩小订阅。`ticks` 变化时这个函数还是会被调用，只是立刻 return。

按字段订阅、`equalityFn` 和 `fireImmediately` 属于 `subscribeWithSelector` 中间件，不在本课展开。

### 4. 观察外部通知与组件渲染的差别

下面的 Demo 用一份偏好 Store。主题和草稿面板继续用 Hook 只选自己的字段。右侧日志不经过 Store Hook，只靠 `subscribe` 追加记录。切换主题或增加草稿时，对应面板和日志都会动；增加无关计数时，主题和草稿面板不增加渲染次数，日志仍会多一条，因为整份 state 已经是新引用。停止订阅后再写入，日志不再增加。写入当前引用时，日志也不增加。

:::demo{id="react.zustand.learn.intermediate.subscribe.subscribe-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：把选择函数当成默认 subscribe 的第一参数

**触发条件：** 写成 `usePreferenceStore.subscribe((state) => state.theme, console.log)`，并且没有使用 `subscribeWithSelector`。

**原因：** 默认 `subscribe` 只接收一个 listener。第一参数会被当成回调；第二参数会被丢掉。状态变化时，Store 只是调用 `(state) => state.theme`，返回值没有人接手。

**后果：** 控制台没有日志，看起来像“订阅失败”，其实 listener 已经在跑，只是没有副作用。

**错误示例：**

```tsx
usePreferenceStore.subscribe((state) => state.theme, console.log)
```

**正确写法：**

```tsx
usePreferenceStore.subscribe((state, prevState) => {
  if (state.theme !== prevState.theme) {
    console.log(state.theme)
  }
})
```

**验证方式：** 切换主题后，回调里的 `console.log` 会打印新主题；第二参数位置不要再放另一个函数。

### 错误：注册后不调用返回值

**触发条件：** 在 `useEffect` 里调用 `subscribe`，没有 `return unsubscribe`，或在模块顶层订阅后组件已经卸载。

**原因：** `subscribe` 只负责 `listeners.add`。不调用返回值，函数会一直留在集合里。官方测试证明：取消后该 listener 不再被通知，其他 listener 仍在。

**后果：** 卸载后的闭包继续运行；若里面再调用组件 `setState`，会在已卸载树上更新。长时间运行会堆积无用回调。

**错误示例：**

```tsx
useEffect(() => {
  usePreferenceStore.subscribe((state) => {
    console.log(state.theme)
  })
}, [])
```

**正确写法：**

```tsx
useEffect(() => {
  return usePreferenceStore.subscribe((state) => {
    console.log(state.theme)
  })
}, [])
```

**验证方式：** 停止订阅后再切换主题，这条日志不再增加；其他仍在监听的面板不受影响。

### 错误：以为默认 subscribe 只在某个字段变化时触发

**触发条件：** 只关心 `theme`，却认为增加无关 `ticks` 时 listener 不会跑。

**原因：** 默认 API 没有选择函数。浅合并会得到新对象，`Object.is` 判定为变化，就会通知全部 listener。

**后果：** 高频无关写入也会走进副作用，日志暴涨，或把不相关的字段同步到外部系统。

**错误示例：**

```tsx
usePreferenceStore.subscribe((state) => {
  document.title = state.theme
})
```

**正确写法：**

```tsx
usePreferenceStore.subscribe((state, prevState) => {
  if (state.theme === prevState.theme) {
    return
  }
  document.title = state.theme
})
```

**验证方式：** 只增加无关计数时，listener 仍被调用，但正确写法里的赋值不会执行；主题面板的渲染次数也不增加。

### 错误：用 subscribe 再 setState 去驱动本该由 Hook 渲染的界面

**触发条件：** 组件里 `subscribe` 之后调用 `setTheme(state.theme)`，而不使用 `usePreferenceStore((state) => state.theme)`。

**原因：** Store Hook 已经通过 `useSyncExternalStore` 接好了 `api.subscribe`，并且按选择函数决定是否重渲染。再手写一层 React 状态，等于重复订阅，还容易在 listener 里形成额外渲染。

**后果：** 主题字段没变时，外部 `subscribe` 仍可能触发 `setState`；界面更新路径变得难以对照选择函数。

**错误示例：**

```tsx
function ThemeLabel() {
  const [theme, setTheme] = useState(usePreferenceStore.getState().theme)

  useEffect(() => {
    return usePreferenceStore.subscribe((state) => {
      setTheme(state.theme)
    })
  }, [])

  return <span>{theme}</span>
}
```

**正确写法：**

```tsx
function ThemeLabel() {
  const theme = usePreferenceStore((state) => state.theme)
  return <span>{theme}</span>
}
```

**验证方式：** 只切换主题时该组件重渲染；只增加无关计数时该组件渲染次数不增加。

### 错误：订阅后以为会立刻拿到当前值

**触发条件：** 调用 `subscribe(listener)` 后，在第一次 `set` 之前就指望 listener 跑一遍。

**原因：** 默认实现只 `add`，不立刻调用。`fireImmediately` 不是默认 `subscribe` 的选项。

**后果：** 日志面板保持空白，外部模块错过当前主题，直到下一次写入。

**错误示例：**

```tsx
usePreferenceStore.subscribe((state) => {
  console.log('当前主题', state.theme)
})
```

**正确写法：**

```tsx
const logTheme = (state: PreferenceStore) => {
  console.log('当前主题', state.theme)
}

logTheme(usePreferenceStore.getState())
usePreferenceStore.subscribe(logTheme)
```

**验证方式：** 订阅当下就能读到当前主题；之后只有写入新引用时 listener 才会再跑。
:::

## 六、原理与适用场景

### 1. 官方事实

README 写明：Hook 上可以 `getState`、`subscribe`、`setState`；`subscribe` 监听全部变化且同步触发；返回值用于取消；和 `useEffect` 搭配可在卸载时取消，并且可以在不强制重渲染的情况下绑定变化。

`create` 文档写明：返回值带 `subscribe`；注册的回调在 state 更新时触发，可用于外部状态管理；示例在 `useEffect` 里订阅并在清理时取消。

`src/vanilla.ts` 里，listener 放在 `Set` 中。`setState` 算出下一份值后，若与当前值不是同一引用，先保存上一份，再写入，再 `listeners.forEach((listener) => listener(state, previousState))`。`subscribe` 返回 `() => listeners.delete(listener)`。

官方测试证明：同一引用不通知；不同引用会通知并带上当前值和上一份值；多个 listener 都会被调用；取消其中一个后，它不再收到通知。

### 2. 课程推导

Store Hook 解决“选中值变化时重渲染”。`subscribe` 解决“渲染之外要不要做事”。两条路共用同一份 listener 集合，但决策不同：Hook 比较选择结果，`subscribe` 只看整份 state 是否换成新引用。

需要当下值时用 `getState()`。需要之后每次变化时用 `subscribe`。需要画到 React 树上时用 Hook。不要用其中一条去模拟另外两条。

### 3. 适用边界

本课只讲 React 绑定 Store 上默认的 `subscribe`、listener 参数、同步通知、相同引用跳过、以及取消函数。`subscribeWithSelector`、选择函数签名、`equalityFn`、`fireImmediately`、Vanilla Store 主线和在服务端组件里做模块级订阅，都不在这里展开。

## 七、练习

:::exercise
### 用 subscribe 记录主题变化

**要求：** 已有一份偏好 Store，包含 `theme`、`draft`、`ticks`、`toggleTheme`、`bumpDraft`、`tick`。写一个 `ThemeChangeLog` 组件：挂载时用 `usePreferenceStore.subscribe` 监听；仅当 `theme` 与 `prevState.theme` 不同时，向组件内的数组追加一条 `浅色→深色` 这种记录。`useEffect` 必须返回取消函数。组件不要用 `subscribe` 去更新 `theme` 文案，主题文案继续用 Store Hook 选择。不要使用 `subscribeWithSelector`。

**验收：** 切换主题后日志多一条，且文案反映新旧主题；只调用 `tick()` 时日志条数不增加；卸载组件后再切换主题，这条日志不再增加。

**参考答案：**

```tsx
import { useEffect, useState } from 'react'
import { create } from 'zustand'

type PreferenceStore = {
  theme: string
  draft: number
  ticks: number
  toggleTheme: () => void
  bumpDraft: () => void
  tick: () => void
}

const usePreferenceStore = create<PreferenceStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  ticks: 0,
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
  bumpDraft: () => set({ draft: get().draft + 1 }),
  tick: () => set({ ticks: get().ticks + 1 }),
}))

function ThemeChangeLog() {
  const theme = usePreferenceStore((state) => state.theme)
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    return usePreferenceStore.subscribe((state, prevState) => {
      if (state.theme === prevState.theme) {
        return
      }
      setLines((current) => [...current, `${prevState.theme}→${state.theme}`])
    })
  }, [])

  return (
    <section>
      <p>当前主题 {theme}</p>
      <pre>{lines.join('\n') || '空'}</pre>
    </section>
  )
}
```
:::

## 八、本节小结

- `subscribe` 在渲染之外同步接收整份当前 state 和上一份 state。
- 默认没有选择函数；字段没变但引用变了，仍会通知。
- 相同引用的写入不会通知；订阅当下也不会立刻回调。
- 必须调用返回值取消；界面字段继续用 Store Hook 选择。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 README subscribe and transient updates](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 同步监听全部变化、取消，以及不强制重渲染的绑定。
- [Zustand 5.0.15 create API](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/apis/create.md) - Hook 上的 subscribe 与 useEffect 取消示例。
- [Zustand 5.0.15 vanilla store implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts) - 相同引用跳过、同步通知与删除 listener。
- [Zustand 5.0.15 subscribe tests](https://github.com/pmndrs/zustand/blob/v5.0.15/tests/subscribe.test.tsx) - 同一引用不通知、多 listener 与取消。
