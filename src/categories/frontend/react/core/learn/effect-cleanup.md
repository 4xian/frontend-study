---
id: react.core.learn.intermediate.effect-cleanup
type: lesson
title: Effect 清理
summary: 让 Effect 建立的事件监听在依赖变化和组件移除时由同一个 cleanup 对称撤销。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.core.learn.intermediate.use-effect
related:
  - react.core.learn.intermediate.use-effect
  - react.core.learn.intermediate.use-ref
tags:
  - React
  - useEffect
  - cleanup
  - 事件监听
  - 外部系统
  - TypeScript
appliesTo: React 19.2
verifiedAt: 2026-08-11
objectives:
  - 能解释 useEffect setup 返回 cleanup 的资源所有权合同。
  - 能用同一个 handler 对称注册和撤销外部事件监听。
  - 能说明依赖变化时旧 cleanup 先于新 setup，以及组件移除时执行最后 cleanup。
  - 能识别 Strict Mode 额外 setup、错误 handler 身份和不匹配逆操作造成的泄漏。
  - 能通过资源数量和事件结果验证清理正确，而不是断言 setup 只执行一次。
recap:
  - setup 建立资源，cleanup 只撤销这个 setup 获得的同一资源。
  - 事件监听必须用同一个 handler 配对 addListener 与 removeListener。
  - 依赖变化先清理旧资源，再建立新资源；组件移除时执行最后一次 cleanup。
  - Strict Mode 的 setup -> cleanup -> setup 是压力测试，最终活动资源才是验收不变量。
  - 没有对应外部资源时不要凭空写 cleanup；不匹配的全局清理会破坏其他实例。
sources:
  - title: useEffect
    url: https://react.dev/reference/react/useEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - setup 返回 cleanup、依赖变化和移除时的清理时序
      - cleanup 对称性与 Strict Mode 重复运行边界
  - title: Synchronizing with Effects
    url: https://react.dev/learn/synchronizing-with-effects
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 事件监听使用同一 handler 配对注册和移除
      - 开发期重复 setup 不应留下重复订阅
  - title: React 19.2.8 ReactFiberCommitEffects Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本提交阶段保存 setup 返回的 cleanup
  - title: React 19.2.8 ReactFiberCommitEffects Cleanup Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248-L286
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本移除阶段读取并调用 cleanup
  - title: React 19.2.8 Effect Tests
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1092-L1162
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 依赖变化先 destroy 再 create，卸载时执行 passive destroy
---

# Effect 清理

## 学习目标

- 使用 `useEffect` 建立一个外部事件监听，并返回对称的 cleanup。
- 观察监听资源在频道切换、卸载和重新挂载时的活动数量与事件结果。
- 解释依赖变化时旧 cleanup 先于新 setup，组件移除时执行最后 cleanup。
- 判断 cleanup 是否撤销了本次 setup 真正拥有的同一资源。

## 为什么需要

Effect 可以把 React 的值同步到 React 不控制的外部系统，但外部系统不会因为组件离开页面就自动知道应该停止
工作。一个监听器如果没有撤销路径，就可能在组件已经移除后继续处理事件；重新建立 Effect 时还会留下重复监听。

因此，建立资源的 setup 必须同时返回一个 cleanup。cleanup 不是“组件销毁时顺手清空全局状态”，而是本次
setup 对自己取得的资源负责：注册哪个 handler，就撤销哪个 handler。

## 核心概念

```tsx
import { useEffect } from 'react'

/** 订阅外部信号，并撤销本次 setup 注册的同一个 handler。 */
function SignalListener({ channel }: { channel: SignalChannel }) {
  useEffect(() => {
    /** 处理本次 Effect 收到的外部信号。 */
    function handleSignal(signal: Signal): void {
      console.log(signal)
    }

    channel.addListener(handleSignal)
    return () => {
      channel.removeListener(handleSignal)
    }
  }, [channel])

  return null
}
```

`useEffect` 的 setup 可以返回一个函数。React 会在下一次需要重新同步前调用旧 setup 返回的 cleanup，再执行新的
setup；组件被移除时调用最后一次 cleanup。cleanup 必须保留 setup 中那个 `handleSignal` 的函数身份，不能在
返回时重新创建一个“看起来相同”的箭头函数。

事件监听只是资源对称性的一个例子：`connect` 对应 `disconnect`，`subscribe` 对应 `unsubscribe`，
`setInterval` 对应 `clearInterval`。本课只用确定性的本地 `SignalChannel` 观察事件监听，不把其他资源扩展成
新的练习主线。

## 用法与示例

### 在同一个 Effect 中获得并撤销资源

setup 负责注册监听，返回的函数负责撤销这个监听。不要把 remove 调用直接写在 `return` 后面，因为那会在
setup 返回时立即执行：

```tsx
useEffect(() => {
  /** 接收当前 channel 的 pulse。 */
  function handleSignal(signal: Signal): void {
    console.log(signal)
  }

  channel.addListener(handleSignal)
  return () => {
    channel.removeListener(handleSignal)
  }
}, [channel])
```

cleanup 与 setup 共享同一个闭包，所以它能拿到同一个 channel 和同一个 handler。若一个组件只负责自己的订阅，
cleanup 就只移除自己的 handler，不应调用 `clearAllListeners()` 影响其他组件。

### 依赖变化和组件移除

依赖值改变时，React 先结束旧资源，再用新闭包建立新资源。组件仍然挂载并不意味着旧资源可以继续活动；旧
资源可能属于上一个房间、主题或事件源。组件移除时，最后一个 cleanup 负责释放仍在活动的资源。

普通开发环境的 Strict Mode 还可能在首次真实同步前执行一次额外的 setup -> cleanup -> setup。正确的实现经过
这条压力路径后仍只保留预期的活动监听，不能用 Ref 旗标把第二次 setup 静默跳过。

### setup 的返回值

setup 不需要清理资源时可以不返回值；需要清理时只能返回函数。不要返回 `addListener` 的返回值、数字、`null`
或 Promise，也不要把 setup 写成 `async` 函数。大括号函数体可以明确丢弃普通方法返回值，再返回同步 cleanup。

## 用法示例或 Demo

下面的 Demo 用 `alpha`、`beta` 两个本地频道展示资源不变量：当前频道有且只有一个 listener，向另一频道发送
消息不会增加接收数量；切换频道会把旧频道 listener 降为 `0`、新频道升为 `1`；卸载后两个频道都不再接收，
重新挂载后当前频道恢复一个 listener。

:::demo{id="react.core.learn.intermediate.effect-cleanup.event-listener-symmetry-demo"}
:::

## 易错使用提示

:::pitfalls
### 错误：注册监听却没有返回 cleanup

**触发条件：** setup 调用 `channel.addListener(handleSignal)` 后直接结束。

**原因：** Effect 没有撤销资源的路径。

**后果：** 组件移除后监听仍然处理事件，重复建立时还会收到多次事件。

**错误示例：**

```tsx
useEffect(() => {
  /** 错误：没有撤销监听。 */
  function handleSignal(signal: Signal): void {
    console.log(signal)
  }

  channel.addListener(handleSignal)
}, [channel])
```

**正确写法：**

```tsx
useEffect(() => {
  /** 正确：返回撤销当前监听的 cleanup。 */
  function handleSignal(signal: Signal): void {
    console.log(signal)
  }

  channel.addListener(handleSignal)
  return () => {
    channel.removeListener(handleSignal)
  }
}, [channel])
```

**验证方式：** 卸载监听后分别向两个频道发送消息，活动 listener 都为 `0` 且已接收数量不增加。

### 错误：cleanup 使用了不同的 handler 身份

**触发条件：** 注册 `handleSignal`，移除时却新建另一个箭头函数。

**原因：** 事件源按函数身份匹配注册和移除，新函数不是已注册的资源句柄。

**后果：** `removeListener` 看似执行，原监听仍然活动。

**错误示例：**

```tsx
/** 错误：cleanup 传入了新函数。 */
return () => channel.removeListener((signal) => console.log(signal))
```

**正确写法：**

```tsx
useEffect(() => {
  /** 正确：cleanup 复用 setup 创建的 handler。 */
  function handleSignal(signal: Signal): void {
    console.log(signal)
  }

  channel.addListener(handleSignal)
  return () => channel.removeListener(handleSignal)
}, [channel])
```

**验证方式：** 执行切换频道 -> 卸载 -> 重新挂载，再向当前频道发送一次消息；已接收数量只增加 `1`。

### 错误：把撤销调用直接作为返回值

**触发条件：** 写成 `return channel.removeListener(handleSignal)`。

**原因：** remove 调用会在 setup 返回时立刻执行，而不是由 React 在清理时调用。

**后果：** 监听无法保持到下一次事件，或者 setup 返回了非法的非函数值。

**错误示例：**

```tsx
/** 错误：remove 在 setup 返回时就执行。 */
useEffect(() => {
  /** 注册当前监听。 */
  function handleSignal(signal: Signal): void {
    console.log(signal)
  }

  channel.addListener(handleSignal)
  return channel.removeListener(handleSignal)
}, [channel])
```

**正确写法：**

```tsx
useEffect(() => {
  /** 正确：把撤销调用延迟到 cleanup 阶段。 */
  function handleSignal(signal: Signal): void {
    console.log(signal)
  }

  channel.addListener(handleSignal)
  return () => channel.removeListener(handleSignal)
}, [channel])
```

**验证方式：** setup 后向当前频道发送应能收到，卸载后向同一频道发送不应收到。

### 错误：cleanup 无条件清空共享资源

**触发条件：** cleanup 调用 `channel.clearAllListeners()`，而 setup 只注册了当前组件自己的 handler。

**原因：** cleanup 只能撤销本次 setup 获得的资源，不能越权删除其他实例的监听。

**后果：** 卸载一个组件会让仍在工作的兄弟组件丢失订阅。

**错误示例：**

```tsx
/** 错误：cleanup 越权清空其他实例的监听。 */
return () => channel.clearAllListeners()
```

**正确写法：**

```tsx
/** 正确：只撤销本次 setup 获得的 handler。 */
return () => channel.removeListener(handleSignal)
```

**验证方式：** 两个监听实例共用 channel 时暂停一个，另一个仍应收到 pulse。

### 错误：认为 cleanup 只在 unmount 运行

**触发条件：** 依赖值改变后继续保留旧监听，只在父组件销毁时手动清理。

**原因：** React 会在依赖变化的重新同步前先调用旧 cleanup。

**后果：** 旧事件源和新事件源同时活动，产生重复更新或陈旧数据。

**错误示例：**

```tsx
/** 错误：只在组件最终销毁时手动处理旧资源。 */
useEffect(() => {
  connect(roomId)
  return undefined
}, [])
```

**正确写法：**

```tsx
useEffect(() => {
  /** 正确：每次 setup 都拥有自己的对称出口。 */
  const connection = connect(roomId)
  return () => connection.disconnect()
}, [roomId])
```

**验证方式：** 切换到另一个频道，确认旧频道 listener 先回到 `0`，新频道再变为 `1`。

### 错误：用 Ref 旗标跳过 Strict Mode 的第二次 setup

**触发条件：** 使用 `didSetup.current` 强制让 Effect 只执行一次。

**原因：** 旗标掩盖了未完成的 cleanup，而不是修复资源对称性。

**后果：** 开发环境似乎正常，重新进入或依赖变化时仍可能泄漏监听。

**错误示例：**

```tsx
/** 错误：用 Ref 旗标跳过压力测试中的第二次 setup。 */
if (didSetup.current) return
didSetup.current = true
channel.addListener(handleSignal)
```

**正确写法：**

```tsx
/** 正确：修复对称 cleanup，不阻止 Effect 重复同步。 */
channel.addListener(handleSignal)
return () => channel.removeListener(handleSignal)
```

**验证方式：** Strict Mode 冷会话挂载后活动 listener 为 `1`，卸载后为 `0`。

### 错误：setup 返回数字、null、Promise 或 async 函数

**触发条件：** 直接返回 `channel.addListener(...)`、`null`，或写成 `useEffect(async () => {})`。

**原因：** setup 只能返回 `undefined` 或可调用的 cleanup 函数。

**后果：** TypeScript 类型检查失败，并可能在开发环境产生 Effect 返回值警告。

**错误示例：**

```tsx
/** 错误：async setup 返回 Promise。 */
useEffect(async () => {
  await connect()
}, [])
```

**正确写法：**

```tsx
useEffect(() => {
  /** 正确：setup 返回同步 cleanup。 */
  connect()
  return () => disconnect()
}, [])
```

**验证方式：** 运行类型检查，确认这些非法返回值被拒绝，合法的同步 cleanup 可以通过。

### 错误：用 setup/cleanup 调用次数代替资源不变量

**触发条件：** 测试断言 setup 必须恰好执行一次。

**原因：** Strict Mode 允许额外的 setup -> cleanup -> setup 压力检查。

**后果：** 合法的开发检查被误报为功能缺陷，真正的重复 listener 反而可能被隐藏。

**错误示例：**

```tsx
/** 错误：把 Strict Mode 的调用次数写成业务合同。 */
expect(setupCount).toBe(1)
```

**正确写法：**

```tsx
/** 正确：检查最终资源和用户可观察事件结果。 */
expect(channel.snapshot().activeListeners).toBe(1)
```

**验证方式：** 本 Demo 的冷启动、频道切换、卸载、重新挂载和重置路径均以状态结果作为证据。
:::

## 源码推导与适用场景

1. **官方事实：** `useEffect` 的 setup 可以返回 cleanup；依赖变化时旧 cleanup 先于新 setup，组件移除时执行最后
   cleanup。事件订阅用同一个 handler 配对注册和移除。
2. **固定版本推导：** React 19.2.8 的提交实现保存 setup 返回值并在清理阶段调用它，官方测试也观察到依赖变化时
   `destroy` 先于 `create`；内部 Fiber 函数和 flags 不是公共 API。
3. **课程推导：** 资源所有权落在 setup 创建的闭包中；`alpha`、`beta` 中只有当前频道的活动 listener 为 `1`，
   另一个频道为 `0`；切换、卸载和重新挂载后仍保持这个不变量，未订阅频道发出的消息不增加接收数量。
4. **适用边界：** 连接、订阅、计时器都遵循对应逆操作；完整 Effect 独立生命周期、依赖治理、Effect Event 和
   布局/样式插入时机留在后续课程。

## 练习

:::exercise
### 验证频道切换的对称清理

**要求：** 在 Demo 中先向 `alpha`、`beta` 各发送一次消息，再切换当前频道并重复发送。保持 Effect 的依赖为
`[channel]`，继续用同一 handler 完成注册与撤销；不要清空全部 listeners，也不要用 Ref 旗标跳过 setup。

**验收：** 每一时刻只有当前频道的 listener 为 `1`；非当前频道发送不增加已接收数量。卸载后两个频道的
listener 都为 `0`，重新挂载后当前频道恢复为 `1`，且一次消息只增加一条接收。
:::

## 本节小结

- setup 建立什么资源，cleanup 就撤销同一个资源；两者必须属于同一拥有权闭包。
- 事件监听必须用同一个 handler 配对 `addListener` 与 `removeListener`。
- 依赖变化先清理旧资源，组件移除时清理最后资源；Strict Mode 不改变最终资源不变量。
- 用活动资源数量和用户可观察事件结果验收，不用“只运行一次”作为 Effect 合同。

## 参考资料

- [useEffect](https://react.dev/reference/react/useEffect) - 支撑 setup、cleanup、依赖变化和 Strict Mode 边界。
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) - 支撑同一 handler 的事件监听配对。
- [React v19.2.8 ReactFiberCommitEffects.js](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177) - 固定版本 setup 返回值保存证据。
- [React v19.2.8 ReactFiberCommitEffects.js cleanup](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248-L286) - 固定版本 cleanup 调用证据。
- [React v19.2.8 Effect tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1092-L1162) - 固定版本依赖变化和卸载清理顺序证据。
