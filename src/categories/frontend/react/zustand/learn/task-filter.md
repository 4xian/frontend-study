---
id: react.zustand.learn.basics.task-filter
type: lesson
title: 实战：任务筛选器
summary: 用类型化 Store 保存筛选条件，用选择函数订阅字段，并在渲染时派生可见任务列表。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.basics.state-ownership
related:
  - react.zustand.learn.basics.state-ownership
  - react.zustand.learn.basics.selector
  - react.zustand.learn.basics.typescript-store
tags:
  - Zustand
  - 筛选
  - Selector
  - 实战
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能把状态筛选和关键词放进类型化 Store，并用 Action 更新。
  - 能用选择函数分别订阅筛选字段，而不是订阅整份 Store。
  - 能在组件渲染时用只读任务清单派生可见结果，不把过滤数组写回 Store。
  - 能把帮助开关等私有交互留在组件 State。
recap:
  - 筛选条件是客户端共享状态，适合放进 Zustand。
  - 任务清单如果只是只读目录，就不要复制进 Store。
  - 选择函数一次取一个字段；可见列表在渲染时计算。
  - 重置只恢复筛选条件，不改只读目录，也不改组件私有状态。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 组件通过 Hook 选择状态，被选中的值变化时重新渲染。
      - 普通 create 得到的 Store 不需要 Provider。
  - title: Zustand Beginner TypeScript Guide
    url: https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 用类型同时描述状态字段和 Action，并用柯里化 create 固定 Store 形状。
  - title: Zustand 5.0.15 React create types
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 绑定 Hook 可以接收选择函数，从 Store 取出切片。
  - title: React Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 避免保存可以从现有数据计算出来的重复状态。
---

# 实战：任务筛选器

## 一、学习目标

- 用类型化 Store 保存状态筛选和关键词。
- 用 Action 更新筛选条件，用选择函数分别订阅字段。
- 在渲染时从只读任务清单派生可见结果。
- 把帮助开关留在组件 State，不放进 Store。

## 二、为什么要做任务筛选器

前面已经分开学过 Store、`set`、`get`、组件订阅、选择函数、不可变更新、TypeScript 和状态所有权。筛选器把这些能力收进同一个工作区：顶栏和列表都要读当前条件，条件变化后列表立刻变，但任务目录本身不必成为第二份缓存。

如果把过滤后的数组再写进 Store，就会多一份必须同步的副本。如果组件不传选择函数，改关键词也会让只显示状态的统计区重渲染。这个实战要同时看清“存什么”和“订什么”。

## 三、核心概念

### 1. 筛选条件进 Store，只读清单留在外面

状态筛选和关键词被顶栏、统计和列表共同使用，属于客户端共享状态，放进 Zustand。任务条目如果只是本地演示目录，所有权不在 Store：组件读取这份目录，再结合筛选条件计算可见列表。

这和把远程接口结果复制进 Store 不是同一件事。这里没有请求、缓存或失效，清单是常量。

### 2. 类型同时包含数据字段和 Action

```ts
type FilterStatus = 'all' | 'open' | 'done'

type FilterState = {
  status: FilterStatus
  keyword: string
}

type FilterActions = {
  setStatus: (status: FilterStatus) => void
  setKeyword: (keyword: string) => void
  reset: () => void
}

type FilterStore = FilterState & FilterActions

const useFilterStore = create<FilterStore>()((set) => ({
  status: 'all',
  keyword: '',
  setStatus: (status) => set({ status }),
  setKeyword: (keyword) => set({ keyword }),
  reset: () => set({ status: 'all', keyword: '' }),
}))
```

`create<FilterStore>()(...)` 先固定形状。`set` 仍然只浅合并顶层字段，所以每次只写入变化的那一项。

### 3. 选择字段，不选择临时过滤结果

选择函数返回新数组时，默认 `Object.is` 会认为每次都变。可见任务在组件渲染里用当前 `status`、`keyword` 和只读清单计算：

```tsx
function VisibleList({ tasks }: { tasks: Task[] }) {
  const status = useFilterStore((state) => state.status)
  const keyword = useFilterStore((state) => state.keyword)
  const visibleTasks = tasks.filter((task) => {
    const matchKeyword = task.title.includes(keyword)
    const matchStatus = status === 'all' || task.status === status
    return matchKeyword && matchStatus
  })
  return <p>{visibleTasks.length} 条可见</p>
}
```

统计区如果只关心 `status`，就不要选择 `keyword`。

### 4. 私有交互仍留在组件

帮助说明是否展开只有当前按钮使用，继续 `useState`。重置筛选不应顺便关掉帮助。

## 四、用法与示例

### 1. 准备只读目录和初始筛选

```ts
const catalogTasks = [
  { id: 'task-1', title: '整理课堂笔记', status: 'open' },
  { id: 'task-2', title: '提交类型练习', status: 'done' },
  { id: 'task-3', title: '核对筛选条件', status: 'open' },
] as const

const initialFilterState: FilterState = {
  status: 'all',
  keyword: '',
}
```

重置时只 `set(initialFilterState)`，不要把任务目录写进同一份快照。

### 2. 拆开订阅者

- 关键词输入只选择 `keyword` 和 `setKeyword`。
- 状态按钮只选择 `status` 和 `setStatus`。
- 统计区只选择 `status`。
- 列表选择 `status` 与 `keyword`，再过滤只读目录。
- 父组件只选择 `reset`。

这样改关键词时，状态统计不必跟着重渲染。

### 3. 观察筛选结果

下面的 Demo 给出可运行的任务筛选器。切换全部 / 未完成 / 已完成，输入关键词，查看可见条数和列表；打开帮助不应改变筛选；重置只清 Store 里的条件。

:::demo{id="react.zustand.learn.basics.task-filter.task-filter-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：把过滤后的任务数组存进 Store

**触发条件：** 每次改筛选都 `set({ visibleTasks: catalog.filter(...) })`。

**原因：** 可见列表可以从清单和筛选条件算出来，再存一份会变成重复状态。

**后果：** 改目录或改筛选时漏更新副本，界面和源数据不一致。

**错误示例：**

```ts
setStatus: (status) =>
  set((state) => ({
    status,
    visibleTasks: catalogTasks.filter((task) => status === 'all' || task.status === status),
  })),
```

**正确写法：**

```ts
setStatus: (status) => set({ status }),
```

**验证方式：** Store 类型里没有 `visibleTasks`；改筛选后列表仍按当前条件当场计算。

### 错误：选择函数每次返回新的过滤数组

**触发条件：** `useFilterStore((state) => catalog.filter(...))`。

**原因：** 过滤总会得到新数组，`Object.is` 判定选中值已变。

**后果：** 无关字段更新也会让列表重渲染。

**错误示例：**

```tsx
const visibleTasks = useFilterStore((state) =>
  catalogTasks.filter((task) => state.status === 'all' || task.status === state.status),
)
```

**正确写法：**

```tsx
const status = useFilterStore((state) => state.status)
const visibleTasks = catalogTasks.filter(
  (task) => status === 'all' || task.status === status,
)
```

**验证方式：** 只改关键词时，只订阅 `status` 的统计区渲染次数不应增加。

### 错误：不传选择函数，一次取出整份 Store

**触发条件：** `const filter = useFilterStore()`，再读 `filter.status`。

**原因：** 默认选择整份 State，任意字段变化都会通知这个组件。

**后果：** 输入关键词时，只展示状态的按钮区也反复渲染。

**错误示例：**

```tsx
const filter = useFilterStore()
return <p>{filter.status}</p>
```

**正确写法：**

```tsx
const status = useFilterStore((state) => state.status)
return <p>{status}</p>
```

**验证方式：** 分别选择字段后，只改 `keyword`，状态按钮的渲染计数保持不变。

### 错误：把帮助开关写进筛选 Store

**触发条件：** Store 增加 `helpOpen`，重置筛选时一并关掉帮助。

**原因：** 帮助只服务当前按钮，不属于共享筛选状态。

**后果：** 重置筛选误伤私有交互，Store 被短暂 UI 细节填满。

**错误示例：**

```ts
reset: () => set({ status: 'all', keyword: '', helpOpen: false }),
```

**正确写法：**

```tsx
const [helpOpen, setHelpOpen] = useState(false)
```

**验证方式：** 打开帮助后点重置，帮助仍打开，只有筛选条件回到初始值。

### 错误：在组件里直接改 Store 对象

**触发条件：** `useFilterStore.getState().keyword = '笔记'`。

**原因：** 就地修改不会走 `set`，订阅者收不到更新。

**后果：** 输入框或日志里的值变了，列表还停在旧筛选。

**错误示例：**

```ts
useFilterStore.getState().status = 'open'
```

**正确写法：**

```ts
useFilterStore.getState().setStatus('open')
```

**验证方式：** 改筛选后可见条数立刻变化；若只有内存变了界面不变，就是绕过了 `set`。
:::

## 六、原理与适用场景

### 1. 官方事实

README 说明组件用 Hook 选择状态，选中值变化时重渲染，普通 Store 不需要 Provider。入门 TypeScript 指南用类型同时描述字段和 Action，并使用柯里化 `create`。`react.ts` 里绑定 Hook 既可以返回整份 State，也可以接收选择函数取出切片。React 的状态结构指南要求不要保存能算出来的重复数据。

### 2. 课程推导

筛选器的最小模型是：Store 只保存条件，Action 用 `set` 更新条件，组件用选择函数订阅自己的字段，可见列表在渲染时派生。只读目录、私有帮助和筛选条件分属不同所有者。

### 3. 适用边界

本课只整合已经学过的 React 绑定 Store、选择函数、类型和所有权。不引入 `persist`、异步 Action、DevTools、中间件、Vanilla Store 或 SSR，也不把任务清单当成服务端缓存。

## 七、练习

:::exercise
### 补全状态筛选 Store

**要求：** 声明 `status: 'all' | 'open'`、`setStatus`、`reset`。任务目录是组件外的常量数组。写出 `StatusButtons` 只选择 `status` 和 `setStatus`；写出 `OpenList` 只选择 `status`，再过滤目录。不要把过滤结果写入 Store。

**验收：** 切到 `open` 后列表只含未完成任务；`reset` 回到 `all`；Store 类型没有任务数组字段。

**参考答案：**

```tsx
import { create } from 'zustand'

type FilterStatus = 'all' | 'open'

type FilterState = {
  status: FilterStatus
}

type FilterActions = {
  setStatus: (status: FilterStatus) => void
  reset: () => void
}

type FilterStore = FilterState & FilterActions

const catalogTasks = [
  { id: '1', title: '写筛选器', status: 'open' as const },
  { id: '2', title: '交练习', status: 'done' as const },
]

const useFilterStore = create<FilterStore>()((set) => ({
  status: 'all',
  setStatus: (status) => set({ status }),
  reset: () => set({ status: 'all' }),
}))

/** 只订阅并改写状态筛选。 */
function StatusButtons() {
  const status = useFilterStore((state) => state.status)
  const setStatus = useFilterStore((state) => state.setStatus)

  return (
    <div>
      <button type="button" aria-pressed={status === 'all'} onClick={() => setStatus('all')}>
        全部
      </button>
      <button type="button" aria-pressed={status === 'open'} onClick={() => setStatus('open')}>
        未完成
      </button>
    </div>
  )
}

/** 按当前筛选派生可见任务。 */
function OpenList() {
  const status = useFilterStore((state) => state.status)
  const visibleTasks = catalogTasks.filter(
    (task) => status === 'all' || task.status === status,
  )

  return (
    <ul>
      {visibleTasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}
```
:::

## 八、本节小结

- 筛选条件放进类型化 Store，只读任务目录不必复制进去。
- 用 Action 更新条件，用选择函数分别订阅字段。
- 可见列表在渲染时计算，不要存进 Store，也不要从选择函数返回新数组。
- 帮助等私有交互留在组件；重置只恢复筛选条件。

## 九、参考资料

- [Zustand 5.0.15 README](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - Hook 选择状态并在选中值变化时重渲染。
- [Zustand Beginner TypeScript Guide](https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript) - 类型化 State、Action 与柯里化 `create`。
- [Zustand 5.0.15 react.ts](https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts) - 绑定 Hook 的选择函数重载。
- [React Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - 不要保存可计算的重复状态。
- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版本。
