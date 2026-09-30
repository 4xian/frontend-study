---
id: react.data.learn.intermediate.mutation-lifecycle
type: lesson
title: Mutation 生命周期
summary: 分清钩子级与调用级回调，看清 onMutate、mutationFn、onSuccess 或 onError、onSettled 的顺序，以及连续 mutate 时调用回调只跟最后一次绑定。
domain: frontend
technology: react
module: data
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.data.learn.intermediate.use-mutation
related:
  - react.data.learn.basics.query-client-and-provider
  - react.data.learn.basics.query-error-handling
tags:
  - TanStack Query
  - Mutation 生命周期
  - onMutate
  - onSuccess
  - onError
  - onSettled
  - mutate callbacks
appliesTo: TanStack Query 5.102.8、React 19.3.0
verifiedAt: 2026-09-10
objectives:
  - 能说明一次 mutation 按 onMutate、mutationFn、onSuccess 或 onError、onSettled 推进。
  - 能在 useMutation 上声明钩子级 onMutate、onSuccess、onError、onSettled，并说明 onMutate 的返回值会交给后续回调。
  - 能在 mutate 或 mutateAsync 上传调用级 onSuccess、onError、onSettled，并说明组件卸载后这些回调不会跑。
  - 能说明钩子级回调先于调用级回调，且回调返回 Promise 时会先被等待。
  - 能说明连续 mutate 时钩子级每次都跑，调用级只跟最后一次绑定；需要每次都等到结果时用 mutateAsync。
recap:
  - 钩子级副作用写在 useMutation 上，调用级副作用写在 mutate 或 mutateAsync 的第二个参数。
  - 成功路径是 onMutate、mutationFn、onSuccess、onSettled；失败路径把 onSuccess 换成 onError。
  - 钩子级先跑，调用级后跑；回调里返回的 Promise 会在下一个回调之前被等待。
  - 连续 mutate 时，钩子级每次都执行；传给 mutate 的回调只跟最后一次调用绑定。
  - 调用级回调在组件卸载后不会跑；要等待每一次写入，用 mutateAsync 拿到各自的 Promise。
sources:
  - title: Mutations
    url: https://tanstack.com/query/latest/docs/framework/react/guides/mutations
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useMutation 提供 onMutate、onSuccess、onError、onSettled，用来在 mutation 生命周期各阶段做副作用。
      - onMutate 可以返回一份结果，供后续回调使用。
      - 回调返回 Promise 时，会先被等待，再调用下一个回调。
      - mutate 还可以接收 onSuccess、onError、onSettled，用来做这次调用自己的副作用。
      - 传给 mutate 的这些回调在组件卸载后不会跑。
      - 钩子级回调先触发，调用级回调后触发。
      - 连续 mutation 时，传给 mutate 的 onSuccess、onError、onSettled 只会触发一次，而且组件还要保持挂载。
      - 原因是每次调用 mutate 都会摘掉观察者再重新订阅。
      - useMutation 上的处理函数每次 mutate 都会执行。
      - mutationFn 通常是异步的，完成顺序可能和 mutate 调用顺序不同。
  - title: useMutation
    url: https://tanstack.com/query/latest/docs/framework/react/reference/functions/useMutation
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutate 与 mutateAsync 都可以接收每次调用的 onSuccess、onError、onSettled。
      - 钩子级回调每次 mutation 都会触发。
      - 调用级回调只对最近一次调用触发，而且组件必须还挂着。
      - 在 mutation 结束前卸载会摘掉订阅，调用级回调不会跑。
      - mutateAsync 每次调用都返回一份 Promise，可以用来等待全部写入。
  - title: Mutation source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/mutation.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - execute 先等待 onMutate，返回值写入 state.context。
      - 随后通过 retryer 执行 mutationFn。
      - 成功时先等待钩子级 onSuccess，再等待钩子级 onSettled，最后 dispatch success。
      - 失败时先等待钩子级 onError，再等待钩子级 onSettled，最后 dispatch error 并再 throw。
      - 回调返回的 Promise 会被 await。
  - title: MutationObserver source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/mutationObserver.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - mutate 会保存这次调用的选项，摘掉当前 mutation 上的观察者，再 build 一条新 mutation 并 execute。
      - 调用级 onSuccess、onError、onSettled 只在仍有监听者时，对当前保存的那份调用选项触发。
      - 调用级回调不包含 onMutate。
      - 调用级回调在 dispatch success 或 error 之后触发，也就是钩子级回调之后。
---

# Mutation 生命周期

## 一、学习目标

- 说明一次 mutation 按 `onMutate`、`mutationFn`、`onSuccess` 或 `onError`、`onSettled` 推进。
- 在 `useMutation` 上声明钩子级 `onMutate`、`onSuccess`、`onError`、`onSettled`，并说明 `onMutate` 的返回值会交给后续回调。
- 在 `mutate` 或 `mutateAsync` 上传调用级 `onSuccess`、`onError`、`onSettled`，并说明组件卸载后这些回调不会跑。
- 说明钩子级回调先于调用级回调，且回调返回 Promise 时会先被等待。
- 说明连续 `mutate` 时钩子级每次都跑，调用级只跟最后一次绑定；需要每次都等到结果时用 `mutateAsync`。

## 二、为什么需要分清生命周期

已经可以用 `useMutation` 声明写入，用 `mutate` 或 `mutateAsync` 触发，并读 `idle`、`pending`、`success`、`error`。

创建林晓那条任务之后，界面还要做几件跟这次写入绑在一起的事：记下即将发出的变量、成功后提示、失败后还原、无论成败都收尾。这些不是 `mutationFn` 本身，而是生命周期上的副作用。

这些副作用可以写在两个地方。`useMutation({ onSuccess })` 跟这份 mutation 声明绑在一起，每次调用都会跑。`mutate(variables, { onSuccess })` 只跟这一次点击绑在一起。连续点两次时，这两层不会用同一种方式触发。

## 三、核心概念

### 1. 一次执行的顺序

官方把 `onMutate`、`onSuccess`、`onError`、`onSettled` 叫做 mutation 生命周期各阶段的副作用。

成功时：

1. `onMutate(variables)`：即将执行。可以返回一份结果，后续回调把它叫做 `onMutateResult`。
2. `mutationFn(variables)`：真正写入。
3. `onSuccess(data, variables, onMutateResult)`：成功。
4. `onSettled(data, error, variables, onMutateResult)`：结束，无论成败都会到这里；成功时 `error` 为 `null`。

失败时第 3 步换成 `onError(error, variables, onMutateResult)`，第 4 步的 `data` 为 `undefined`。

源码里 `onMutate` 的返回值写进 `state.context`，再传给后面的钩子回调。`mutationFn` 在 `onMutate` 之后才跑。

### 2. 钩子级回调

写在 `useMutation` 选项里的回调是钩子级：

```tsx
const taskMutation = useMutation({
  mutationFn: createTask,
  onMutate: (variables) => {
    return { title: variables.title }
  },
  onSuccess: (data, variables, onMutateResult) => {
    console.log(data.owner, onMutateResult.title)
  },
  onError: (error, variables, onMutateResult) => {
    console.error(error.message, onMutateResult.title)
  },
  onSettled: (data, error, variables, onMutateResult) => {
    console.log(error ? 'error' : 'success', onMutateResult.title)
  },
})
```

每次 `mutate` 或 `mutateAsync` 都会执行这些函数。适合跟这次 mutation 声明本身有关的副作用。

回调里如果返回 Promise，会先被等待，再进入下一个回调。官方示例是 `onSuccess` 打出 `I'm first!`，随后 `onSettled` 才打出 `I'm second!`。

### 3. 调用级回调

`mutate` 和 `mutateAsync` 的第二个参数可以再传 `onSuccess`、`onError`、`onSettled`。这里没有 `onMutate`。

```tsx
taskMutation.mutate(
  { title: '核对创建任务' },
  {
    onSuccess: (data) => {
      console.log(data.owner)
    },
    onError: (error) => {
      console.error(error.message)
    },
    onSettled: () => {
      console.log('done')
    },
  },
)
```

官方把它们定位成这次调用自己的副作用。组件在 mutation 结束前卸载时，观察者会被摘掉，这些回调不会跑。

同一阶段里，钩子级先触发，调用级后触发。源码里钩子级 `onSuccess` 和 `onSettled` 在 `dispatch success` 之前就被 `await`；调用级要等这次 `success` 或 `error` 通知观察者之后才跑。

### 4. 连续 mutate 只保留最后一次调用回调

连续调用 `mutate` 时，两层回调的行为不一样。

```tsx
useMutation({
  mutationFn: createTask,
  onSuccess: (data, variables) => {
    // 三次都会进
  },
})

;['任务甲', '任务乙', '任务丙'].forEach((title) => {
  taskMutation.mutate(
    { title },
    {
      onSuccess: (data, variables) => {
        // 只会为最后一次「任务丙」执行，不管哪一次先完成
      },
    },
  )
})
```

官方说明：传给 `mutate` 的 `onSuccess`、`onError`、`onSettled` 只会触发一次，而且组件还要保持挂载。每次 `mutate` 都会摘掉当前观察者再订阅新的 mutation，所以观察者上只留着最后一次调用选项。

钩子级处理函数每次 `mutate` 都会执行。

`mutationFn` 通常是异步的。三次写入的完成顺序，不一定等于三次 `mutate` 的调用顺序。

需要每一次都等到结果时，用 `mutateAsync`。它每次都返回一份 Promise，可以 `Promise.all` 或 `Promise.allSettled`。不要指望调用级 `onSuccess` 把每一次连续点击都接住。

## 四、用法与示例

### 1. 按生命周期记录一次创建

```tsx
import { useMutation } from '@tanstack/react-query'

type CreatedTask = {
  id: string
  title: string
  owner: string
}

type TaskInput = {
  title: string
}

/** 创建一条任务，非 2xx 时抛出带状态码的 Error。 */
async function createTask(input: TaskInput): Promise<CreatedTask> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`任务创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as CreatedTask
}

/** 用钩子级回调观察一次创建的顺序。 */
function CreateTaskBoard() {
  const taskMutation = useMutation({
    mutationFn: createTask,
    onMutate: (variables) => ({ title: variables.title }),
    onSuccess: (data) => {
      console.log(data.owner)
    },
    onError: (error) => {
      console.error(error.message)
    },
    onSettled: (_data, error) => {
      console.log(error ? 'error' : 'success')
    },
  })

  return (
    <button
      type="button"
      disabled={taskMutation.isPending}
      onClick={() => taskMutation.mutate({ title: '核对创建任务' })}
    >
      创建任务
    </button>
  )
}
```

点一次成功后，顺序是 `onMutate` → `mutationFn` → `onSuccess` → `onSettled`。失败则是 `onMutate` → `mutationFn` → `onError` → `onSettled`。

### 2. 把这次点击自己的副作用放进 mutate

```tsx
taskMutation.mutate(
  { title: '核对创建任务' },
  {
    onSuccess: (data) => {
      console.log(`这次点击成功：${data.owner}`)
    },
  },
)
```

钩子级 `onSuccess` 会先打出林晓，调用级再打出「这次点击成功」。适合只跟这一次按钮有关的提示，不要把 `onMutate` 写进这个对象。

### 3. 连续创建时用 mutateAsync 等待每一次

```tsx
/** 等待两次创建都结束。 */
async function createBoth() {
  const titles = ['任务甲', '任务乙']
  await Promise.all(titles.map((title) => taskMutation.mutateAsync({ title })))
}
```

这里钩子级 `onSuccess` 仍会进两次。如果改成两次 `mutate` 并在第二个参数里写 `onSuccess`，调用级只会为「任务乙」触发。

## 五、用法示例：对照两层回调

下面的 Demo 用钩子级回调和调用级回调各记一份时间线。点「创建任务」走一次成功或失败，顺序是 `onMutate`、`mutationFn`，然后是 `onSuccess` 或 `onError`，最后是 `onSettled`。钩子级先记，调用级后记。

点「连续创建两次」会同步发出任务甲和任务乙。钩子级两次都记；调用级只出现「第二次」和任务乙。失败路径抛出带 `404` 的错误，不发真实失败请求。默认关掉重试。离开页面会清空这个 Demo 的 `QueryClient`。

:::demo{id="react.data.learn.intermediate.mutation-lifecycle.mutation-lifecycle-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：连续 mutate 时期望每次调用回调都触发

**触发条件：** 用 `forEach` 或连点两次调用 `mutate`，并在第二个参数里写 `onSuccess`，以为每一次都会进。

**原因：** 每次 `mutate` 都会摘掉观察者再订阅新 mutation，调用选项只保留最后一次。

**后果：** 前面几次已经成功，调用级提示却只出现最后一次；钩子级日志次数和调用级对不上。

**错误示例：**

```tsx
;['任务甲', '任务乙'].forEach((title) => {
  taskMutation.mutate(
    { title },
    {
      onSuccess: (data, variables) => {
        console.log(variables.title)
      },
    },
  )
})
```

**正确写法：**

```tsx
await Promise.all(
  ['任务甲', '任务乙'].map((title) => taskMutation.mutateAsync({ title })),
)
```

**验证方式：** 连续创建两次。钩子级 `onSuccess` 出现两次；调用级只出现任务乙。改成 `mutateAsync` 后，两次 Promise 都能等到。

### 错误：把 onMutate 写进 mutate 的第二个参数

**触发条件：** 写成 `mutate(variables, { onMutate, onSuccess })`。

**原因：** 调用级只支持 `onSuccess`、`onError`、`onSettled`。`onMutate` 属于 `useMutation` 选项。

**后果：** 即将执行时该做的准备不会跑；后续回调也拿不到 `onMutateResult`。

**错误示例：**

```tsx
taskMutation.mutate(
  { title: '核对创建任务' },
  {
    onMutate: () => ({ title: '核对创建任务' }),
    onSuccess: (data) => {
      console.log(data.owner)
    },
  },
)
```

**正确写法：**

```tsx
const taskMutation = useMutation({
  mutationFn: createTask,
  onMutate: (variables) => ({ title: variables.title }),
  onSuccess: (data, variables, onMutateResult) => {
    console.log(data.owner, onMutateResult.title)
  },
})

taskMutation.mutate({ title: '核对创建任务' })
```

**验证方式：** 点一次创建。时间线里先出现钩子 `onMutate`，再出现 `mutationFn`。调用级列表里不应出现 `onMutate`。

### 错误：组件卸载后还指望调用级回调

**触发条件：** 在 `mutate` 的 `onSuccess` 里做这次页面自己的提示，然后立刻关掉这个组件。

**原因：** 官方写明这些额外回调在组件卸载后不会跑。观察者没有监听者时，源码不会触发调用级选项。

**后果：** 写入已经成功，这次页面上的提示或跳转没有发生。钩子级回调仍会执行。

**错误示例：**

```tsx
taskMutation.mutate(
  { title: '核对创建任务' },
  {
    onSuccess: () => {
      closePanel()
    },
  },
)
closePanel()
```

**正确写法：**

```tsx
const taskMutation = useMutation({
  mutationFn: createTask,
  onSuccess: () => {
    markCreated()
  },
})

taskMutation.mutate({ title: '核对创建任务' })
```

**验证方式：** 触发写入后马上卸掉使用 `useMutation` 的组件。钩子级副作用仍在；调用级 `onSuccess` 不应再执行。

### 错误：把异步 mutationFn 的完成顺序当成调用顺序

**触发条件：** 连续 `mutate` 三次，按调用顺序去读 `data` 或调用级回调里的 `variables`。

**原因：** 官方提醒 `mutationFn` 通常是异步的，完成顺序可能和 `mutate` 调用顺序不同。观察者上的 `data` 只反映当前这条 mutation。

**后果：** 先发出的任务后完成时，界面上的 `data` 仍是最后一次调用那条；调用级回调也不会帮你按发出顺序补齐。

**错误示例：**

```tsx
taskMutation.mutate({ title: '任务甲' })
taskMutation.mutate({ title: '任务乙' })
```

**正确写法：**

```tsx
const first = taskMutation.mutateAsync({ title: '任务甲' })
const second = taskMutation.mutateAsync({ title: '任务乙' })
const results = await Promise.all([first, second])
```

**验证方式：** 连续创建两次。当前 `data` 是任务乙；钩子级仍能为任务甲记一次 `onSuccess`。要用两次结果时，去等两份 `mutateAsync` Promise。

### 错误：回调返回 Promise 后立刻写下一步

**触发条件：** `onSuccess` 返回一个还没结束的 Promise，却以为 `onSettled` 会马上跑。

**原因：** 官方规定，回调返回 Promise 时会先被等待，再调用下一个回调。源码对钩子级回调使用 `await`。

**后果：** 收尾逻辑比预期晚；如果下一步依赖「onSuccess 已经完全结束」，会读到尚未完成的中间状态。

**错误示例：**

```tsx
useMutation({
  mutationFn: createTask,
  onSuccess: async () => {
    await waitForMutation(1400)
  },
  onSettled: () => {
    console.log('立刻收尾')
  },
})
```

**正确写法：**

```tsx
useMutation({
  mutationFn: createTask,
  onSuccess: async () => {
    console.log("I'm first!")
  },
  onSettled: async () => {
    console.log("I'm second!")
  },
})
```

**验证方式：** 让 `onSuccess` 返回一份延迟 Promise。`onSettled` 必须等这份 Promise 结束才出现。
:::

## 七、源码推导与适用场景

1. **官方事实：** `useMutation` 提供 `onMutate`、`onSuccess`、`onError`、`onSettled`。`onMutate` 可返回结果给后续回调。回调返回 Promise 时会先被等待。`mutate` 还可接收 `onSuccess`、`onError`、`onSettled`；组件卸载后这些调用级回调不会跑。钩子级先触发，调用级后触发。连续 mutation 时，调用级只触发一次且组件需保持挂载，因为每次 `mutate` 都会摘掉观察者再订阅；钩子级每次都会执行。`mutationFn` 异步时，完成顺序可能和调用顺序不同。`mutateAsync` 每次返回一份 Promise。源码里 `execute` 先 `await onMutate` 并把返回值写入 `state.context`，再跑 `mutationFn`；成功则 `await` 钩子级 `onSuccess`、`onSettled` 后 `dispatch success`，失败则 `await` 钩子级 `onError`、`onSettled` 后 `dispatch error` 再 throw。观察者的 `mutate` 保存调用选项、摘掉当前 mutation、build 新 mutation 并 `execute`。调用级回调只在仍有监听者时对当前这份调用选项触发，且不包含 `onMutate`。
2. **课程推导：** 跟这份 mutation 声明绑定的副作用放钩子级；跟这一次点击绑定的提示放调用级。看顺序时先看钩子时间线，再看调用时间线。连续点击不要用调用级回调统计次数，改用 `mutateAsync` 等待每一次。`onMutate` 只写在 `useMutation` 上。
3. **适用边界：** 本课不把查询失效、`setQueryData`、完整乐观更新与回滚、mutation `scope`、持久化、离线恢复、`mutationKey` 默认函数，或 `MutationCache` 上的全局回调写成主线。源码里缓存级回调存在，但不作为本课界面合同。官方示例里的 axios 可换成 `fetch`。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写 `createTask(input)`，用 `fetch` `POST` `/api/tasks`，请求体为 `{ title }`，非 2xx 时抛出带状态码的 `Error`。组件在 `QueryClientProvider` 下使用 `useMutation`，声明钩子级 `onMutate`、`onSuccess`、`onError`、`onSettled`。按钮用 `mutate` 传入标题，并在第二个参数提供调用级 `onSuccess`、`onError`、`onSettled`。另提供按钮连续 `mutate` 两次，以及用 `mutateAsync` 等待两次创建的路径。不要把 `onMutate` 写进 `mutate` 的第二个参数，也不要 `await mutate`。

**验收：** 一次成功创建的顺序是钩子 `onMutate`、`mutationFn`、钩子 `onSuccess`、钩子 `onSettled`，然后才是调用级 `onSuccess` 和 `onSettled`。失败时钩子和调用级都走 `onError`。连续两次 `mutate` 时钩子级两次都执行，调用级只出现最后一次。`mutateAsync` 两次都能等到结果。

**参考答案：**

```tsx
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'

type CreatedTask = {
  id: string
  title: string
  owner: string
}

type TaskInput = {
  title: string
}

/** 创建一条任务。 */
async function createTask(input: TaskInput): Promise<CreatedTask> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`任务创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as CreatedTask
}

/** 观察钩子级与调用级回调。 */
function CreateTaskBoard(): ReactElement {
  const [hookLog, setHookLog] = useState<string[]>([])
  const [callLog, setCallLog] = useState<string[]>([])

  const taskMutation = useMutation({
    mutationFn: createTask,
    onMutate: (variables) => {
      setHookLog((current) => [...current, `onMutate · ${variables.title}`])
      return { title: variables.title }
    },
    onSuccess: (data, variables) => {
      setHookLog((current) => [...current, `onSuccess · ${variables.title} / ${data.owner}`])
    },
    onError: (error, variables) => {
      setHookLog((current) => [...current, `onError · ${variables.title} / ${error.message}`])
    },
    onSettled: (_data, error, variables) => {
      setHookLog((current) => [
        ...current,
        `onSettled · ${variables.title} / ${error ? 'error' : 'success'}`,
      ])
    },
  })

  /** 给这一次 mutate 挂上调用级回调。 */
  function createCallCallbacks() {
    return {
      onSuccess(data: CreatedTask, variables: TaskInput) {
        setCallLog((current) => [...current, `onSuccess · ${variables.title} / ${data.owner}`])
      },
      onError(error: Error, variables: TaskInput) {
        setCallLog((current) => [...current, `onError · ${variables.title} / ${error.message}`])
      },
      onSettled(_data: CreatedTask | undefined, error: Error | null, variables: TaskInput) {
        setCallLog((current) => [
          ...current,
          `onSettled · ${variables.title} / ${error ? 'error' : 'success'}`,
        ])
      },
    }
  }

  /** 连续发出两次 mutate。 */
  function createTwice(): void {
    taskMutation.mutate({ title: '任务甲' }, createCallCallbacks())
    taskMutation.mutate({ title: '任务乙' }, createCallCallbacks())
  }

  /** 用 mutateAsync 等待两次创建。 */
  async function createBothAndWait(): Promise<void> {
    try {
      await Promise.all([
        taskMutation.mutateAsync({ title: '任务甲' }),
        taskMutation.mutateAsync({ title: '任务乙' }),
      ])
    } catch {
      return
    }
  }

  return (
    <section>
      <p>{taskMutation.status}</p>
      <ul>
        {hookLog.map((entry) => (
          <li key={entry}>{entry}</li>
        ))}
      </ul>
      <ul>
        {callLog.map((entry) => (
          <li key={entry}>{entry}</li>
        ))}
      </ul>
      <button
        type="button"
        disabled={taskMutation.isPending}
        onClick={() => taskMutation.mutate({ title: '核对创建任务' }, createCallCallbacks())}
      >
        创建任务
      </button>
      <button type="button" disabled={taskMutation.isPending} onClick={createTwice}>
        连续创建两次
      </button>
      <button type="button" disabled={taskMutation.isPending} onClick={() => void createBothAndWait()}>
        等待两次创建
      </button>
    </section>
  )
}

/** 提供稳定客户端，避免 mutation 观察丢失。 */
export function App(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <CreateTaskBoard />
    </QueryClientProvider>
  )
}
```
:::

## 九、本节小结

- 钩子级副作用写在 `useMutation` 上，调用级副作用写在 `mutate` 的第二个参数。
- 成功顺序是 `onMutate`、`mutationFn`、`onSuccess`、`onSettled`；失败把 `onSuccess` 换成 `onError`。
- 钩子级先跑，调用级后跑；回调返回的 Promise 会先被等待。
- 连续 `mutate` 时钩子级每次都执行，调用级只跟最后一次绑定。
- 要等待每一次写入，用 `mutateAsync`；不要在调用级寻找 `onMutate`。

## 十、参考资料

- [Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) - 支持生命周期回调、调用级回调、Promise 等待，以及连续 mutation 时调用回调只触发一次。
- [useMutation](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useMutation) - 支持钩子级每次都触发、调用级只跟最近一次绑定，以及 mutateAsync 按次返回 Promise。
- [Mutation 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/mutation.ts) - 支持 onMutate 写入 context，以及钩子级回调在 dispatch 之前被 await。
- [MutationObserver 源码](https://unpkg.com/@tanstack/query-core@5.102.8/src/mutationObserver.ts) - 支持每次 mutate 保存调用选项并新建 mutation，以及调用级回调在仍有监听者时触发。
