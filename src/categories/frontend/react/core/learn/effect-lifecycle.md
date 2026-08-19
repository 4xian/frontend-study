---
id: react.core.learn.intermediate.effect-lifecycle
type: lesson
title: Effect 生命周期
summary: 把 Effect 看成可独立开始、停止并随同步输入重新启动的过程。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.core.learn.intermediate.effect-cleanup
related:
  - react.core.learn.intermediate.use-effect
  - react.core.learn.intermediate.effect-cleanup
tags:
  - React
  - useEffect
  - Effect 生命周期
  - 同步过程
  - 外部系统
appliesTo: React 19.2
verifiedAt: 2026-08-11
objectives:
  - 能区分组件的 mount、update、unmount 与 Effect 的 start、stop、重新同步。
  - 能把一个 Effect 写成对称的开始/停止同步过程。
  - 能解释同步输入变化时旧过程先停止、新过程再开始。
  - 能观察组件仍挂载时 Effect 多次重新同步，以及隐藏/显示时的停止与开始。
  - 能用最终活动过程和事件顺序验收，而不是断言 setup 只执行一次。
recap:
  - Effect 不是组件挂载回调，而是一个可以多次 start/stop 的独立同步过程。
  - 同步输入变化时，旧 cleanup 先运行，新 setup 后运行。
  - 组件移除只会停止当前过程；重新显示会开始一个新的过程。
  - 每个 Effect 只负责一个同步过程，开发 Strict Mode 的额外循环不是业务次数合同。
sources:
  - title: Lifecycle of Reactive Effects
    url: https://react.dev/learn/lifecycle-of-reactive-effects
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Effect 生命周期不同于组件生命周期
      - 每个 Effect 是独立同步过程，依赖变化时可停止并重新开始
  - title: useEffect
    url: https://react.dev/reference/react/useEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - setup、cleanup 与依赖变化的调用顺序
      - Strict Mode 的额外 setup 与 cleanup
  - title: Synchronizing with Effects
    url: https://react.dev/learn/synchronizing-with-effects
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - cleanup 必须停止或撤销 setup 所做的同步
  - title: React v19.2.8 Effect tests
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1092-L1162
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本测试观察依赖变化与卸载时 passive destroy 的顺序
  - title: React v19.2.8 ReactFiberCommitEffects setup
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本实现保存 setup 返回的 destroy
  - title: React v19.2.8 ReactFiberCommitEffects cleanup
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248-L294
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本实现调用已保存的 destroy
  - title: React v19.2.8 ReactFiberWorkLoop passive phase
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberWorkLoop.js#L4546-L4564
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本 passive 阶段先处理 unmount 再处理 mount
---

# Effect 生命周期

## 学习目标

- 区分组件的 mount、update、unmount 与 Effect 的 start、stop、重新同步。
- 用一个独立同步过程表达“开始做什么”和“停止做什么”。
- 在同步输入变化时观察旧过程停止在新过程开始之前。
- 解释组件仍在页面上时，Effect 为什么也可能重新同步多次。
- 用活动状态和事件顺序验收行为，不把 Strict Mode 的调用次数当成业务结果。

## 为什么需要

把组件想成“挂载时做一次、卸载时清理一次”很容易理解页面结构，却不足以描述外部同步。聊天房间、媒体播放、
浏览器订阅或第三方连接都可能在组件仍显示时换了同步目标。此时旧过程必须停止，新过程才应该开始；如果只在
unmount 时清理，界面已经显示新目标，外部系统却仍停留在旧目标。

因此，Effect 应该从自身的角度描述一个过程：setup 开始同步，cleanup 停止同步。组件的 mount、update、unmount
只是可能触发这些动作的提交结果，不是 Effect 的完整生命周期名称。

## 核心概念

```tsx
import { useEffect } from 'react'

type RoomId = 'alpha' | 'beta'

/** 把房间同步过程绑定到当前 roomId，并在过程结束时停止它。 */
function RoomSync({ roomId }: { roomId: RoomId }) {
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.start()

    return () => {
      connection.stop()
    }
  }, [roomId])

  return null
}
```

这段 Effect 描述了一个非重叠的过程：`start(alpha)` 持续到 `stop(alpha)`，之后才可能 `start(beta)`。组件从
`alpha` 重新渲染为 `beta` 时，React 会先调用旧闭包的 cleanup，再执行新闭包的 setup；组件移除时只需要停止最后
仍在活动的房间。

`createConnection` 在这里代表某个 React 不控制的外部系统。它可以是真实连接，也可以是课程 Demo 中的本地替身；
本课关注的是开始/停止的时序，不要求引入网络请求。

## 用法与示例

### 从一个 start/stop 周期思考

不要先问“现在是 mount 还是 update”，先检查这个周期是否完整：

1. setup 获得或建立当前同步资源，并开始同步。
2. cleanup 停止 setup 建立的同一过程。
3. 下一轮 setup 只能在上一轮 cleanup 完成后开始。

例如，房间从 `alpha` 变为 `beta` 时，用户可观察的过程是：

```text
开始 alpha -> 停止 alpha -> 开始 beta
```

房间再次变更为 `alpha`，就会产生新的 `停止 beta -> 开始 alpha`。这不是组件被销毁再创建，而是同一个组件里的
Effect 重新同步。

### 组件仍挂载时也会停止与开始

下面的组件一直存在，但 `roomId` 变化会让它的同步目标变化：

```tsx
/** 只渲染当前房间标题，真正的外部同步由 Effect 管理。 */
function ChatRoom({ roomId }: { roomId: RoomId }) {
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.start()
    return () => connection.stop()
  }, [roomId])

  return <h1>当前房间：{roomId}</h1>
}
```

标题的更新和连接的重新同步属于同一次提交的不同结果。Effect 不需要知道组件处于“更新阶段”，只需要让旧同步
停止并让新同步开始。

### 每个 Effect 保持一个同步职责

如果一个组件同时需要房间连接和文档标题同步，两个外部系统可以分别拥有自己的 Effect：

```tsx
/** 只同步房间连接，拥有自己的 start/stop 周期。 */
useEffect(() => {
  const connection = createConnection(roomId)
  connection.start()
  return () => connection.stop()
}, [roomId])

/** 只同步页面标题，拥有自己的开始/停止边界。 */
useEffect(() => {
  document.title = `房间 ${roomId}`
  return () => {
    document.title = 'IT 学习站'
  }
}, [roomId])
```

本课只建立“一个 Effect 对应一个同步过程”的判断，不把多个外部系统做成综合 Demo。什么时候某个值应当进入
依赖列表，以及如何减少不必要的依赖，会在后续课程单独处理。

### Strict Mode 是可重复的压力检查

开发环境的 Strict Mode 可能在首次真实同步前执行一次额外的 `setup -> cleanup -> setup`。正确的实现应让外部
系统最终只有一个活动过程；不要用 Ref 旗标跳过第二次 setup，也不要把“setup 恰好一次”写成业务规则。

## 用法示例或 Demo

下面的 Demo 用 `alpha`、`beta` 两个确定性本地房间展示独立同步过程：无关渲染不会产生同步事件；切换房间会先
停止旧过程再开始新过程；隐藏和重新显示同步组件分别观察 stop 与 start。

:::demo{id="react.core.learn.intermediate.effect-lifecycle.room-sync-process-demo"}
:::

## 易错使用提示

:::pitfalls
### 错误：把 Effect 当成只在 mount 时运行的回调

**触发条件：** 看到组件第一次显示时连接成功，就认为后续 `roomId` 改变时不需要重新同步。

**原因：** 把组件生命周期的 mount 误当成 Effect 的全部生命周期。

**后果：** 界面已经显示新房间，外部系统仍连接旧房间，产生陈旧数据或错误事件。

**错误示例：**

```tsx
/** 错误：用空依赖数组把可变房间冻结在第一次渲染。 */
useEffect(() => {
  const connection = createConnection(roomId)
  connection.start()
  return () => connection.stop()
}, [])
```

**正确写法：**

```tsx
/** 正确：roomId 变化时结束旧过程并开始新过程。 */
useEffect(() => {
  const connection = createConnection(roomId)
  connection.start()
  return () => connection.stop()
}, [roomId])
```

**验证方式：** 切换房间后，确认事件顺序是停止旧房间再开始新房间，且活动房间只有新值。

### 错误：让 cleanup 读取可变的最新同步输入

**触发条件：** 为了让 cleanup 获得“最新房间”，把 `roomId` 写入 Ref，并在 cleanup 中读取 Ref 当前值。

**原因：** cleanup 不再使用本轮 setup 捕获的房间，而是读取了下一次渲染已经改写的值。

**后果：** 从 `alpha` 切到 `beta` 时，旧 cleanup 可能错误停止 `beta`，而 `alpha` 过程没有被对称停止。

**错误示例：**

```tsx
const latestRoomId = useRef(roomId)
latestRoomId.current = roomId

/** 错误：cleanup 读取可变 Ref，可能停止下一轮房间。 */
useEffect(() => {
  process.start(roomId)
  return () => process.stop(latestRoomId.current)
}, [process, roomId])
```

**正确写法：**

```tsx
/** 正确：setup 与 cleanup 共享本轮渲染捕获的 roomId。 */
useEffect(() => {
  process.start(roomId)
  return () => process.stop(roomId)
}, [process, roomId])
```

**验证方式：** 从 `alpha` 切到 `beta` 时，第一条相邻事件必须是停止 `alpha`，不能是停止 `beta`。

### 错误：把两个独立同步系统塞进一个 Effect

**触发条件：** 一个 Effect 同时连接房间、修改标题或订阅另一个系统，并用一个 cleanup 统一处理。

**原因：** 把不同的同步过程绑定成了一个无法独立变化的生命周期。

**后果：** 只需要改变其中一个系统时，另一个系统也被不必要地停止和重新开始，清理边界难以验证。

**错误示例：**

```tsx
/** 错误：房间连接和标题同步被迫共享一个过程。 */
useEffect(() => {
  const connection = createConnection(roomId)
  connection.start()
  document.title = roomId
  return () => {
    connection.stop()
    document.title = 'IT 学习站'
  }
}, [roomId])
```

**正确写法：**

```tsx
/** 正确：房间连接单独拥有 start/stop 周期。 */
useEffect(() => {
  const connection = createConnection(roomId)
  connection.start()
  return () => connection.stop()
}, [roomId])

/** 正确：标题同步是另一个独立过程。 */
useEffect(() => {
  document.title = roomId
  return () => {
    document.title = 'IT 学习站'
  }
}, [roomId])
```

**验证方式：** 分别改变两个过程的输入，确认每个过程只产生自己的 stop/start；本课 Demo 只展示其中一个过程。

### 错误：用 Ref 旗标阻止重新同步

**触发条件：** 用 `didStart.current` 判断已经启动过，就跳过后续 setup。

**原因：** 旗标把一次过程误当成组件永久身份，掩盖了 cleanup 不完整或同步输入已改变的事实。

**后果：** 新房间没有真正开始同步，开发 Strict Mode 的压力检查也无法发现问题。

**错误示例：**

```tsx
/** 错误：只允许第一次 setup 开始同步。 */
if (didStart.current) return
didStart.current = true
connection.start()
```

**正确写法：**

```tsx
/** 正确：每一轮 setup 都开始自己的同步过程。 */
connection.start()
return () => connection.stop()
```

**验证方式：** 在 Strict Mode 冷启动、切换房间和重新显示后，活动过程都应与当前 `roomId` 一致。

### 错误：用 setup/cleanup 调用次数作为业务状态

**触发条件：** 断言冷启动必须恰好产生一条 start，或把开发环境的额外 stop/start 当成重复连接故障。

**原因：** Strict Mode 允许额外的 setup -> cleanup -> setup；React 的公共合同是最终同步结果，而不是固定调用次数。

**后果：** 合法的开发压力检查被误报，真正的资源泄漏反而可能被掩盖。

**错误示例：**

```tsx
/** 错误：把开发调用次数写成跨环境业务合同。 */
expect(startCount).toBe(1)
```

**正确写法：**

```tsx
/** 正确：检查最终活动过程和用户可观察的停止/开始顺序。 */
expect(process.snapshot().activeRoom).toBe(roomId)
```

**验证方式：** Demo 冷启动、房间切换、隐藏和重新显示都检查活动房间与事件顺序，不断言 setup 次数。
:::

## 源码推导与适用场景

1. **官方事实：** React 文档将组件的 mount/update/unmount 与 Effect 的 start/stop 区分开；依赖变化时旧 cleanup
   先于新 setup，组件移除时执行最后 cleanup。**课程推导：** 把每轮 Effect 当成一个不重叠同步过程。
   **边界：** 这不承诺固定的 render 次数或内部调度时刻。
2. **固定版本推导：** React `v19.2.8` 的 commit 实现保存 setup 返回的 destroy，passive 阶段按 unmount 后 mount
   处理；官方测试也观察到旧 passive destroy 先于新 create。**课程推导：** 可用事件日志验证 stop/start 顺序。
   **边界：** Fiber、flags 等内部名称不是应用代码 API。
3. **课程推导：** Demo 的 `alpha`、`beta` 是本地同步替身；无关渲染不改变活动过程，房间切换只产生停止旧房间和开始
   新房间的相邻事件。**边界：** 本课不覆盖依赖如何推导、如何减少依赖或如何提取 Effect Event。
4. **适用边界：** 连接/断开、订阅/退订、播放/停止都可用同一 start/stop 思路；不涉及无需外部系统的渲染计算、
   自定义 Hook 复用、绘制前布局时机或同步外部 Store。

## 练习

:::exercise
### 验证一个 Effect 的独立同步过程

**要求：** 在 Demo 中点击“无关渲染 +1”，再切换到另一个房间，最后隐藏并重新显示同步过程。先记录每一步的活动
房间和最近事件，不修改 Demo 的 Effect 依赖数组，也不要用 Ref 旗标跳过 setup。

**验收：** 无关渲染只增加渲染计数；房间切换的最近事件严格为停止旧房间、开始新房间；隐藏后活动同步为“已停止”，
重新显示后恢复当前房间；验收不依赖 setup/cleanup 的绝对调用次数。
:::

## 本节小结

- Effect 不是组件 mount 回调，而是一个可以多次开始和停止的独立同步过程。
- 同步输入改变时，旧 cleanup 先停止旧过程，新 setup 再开始新过程。
- 组件仍挂载时也可能重新同步；组件移除只会停止最后一个活动过程。
- 每个 Effect 保持一个同步职责；Strict Mode 的额外循环用于发现不对称实现，不是业务计数。

## 参考资料

- [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) - 支撑 Effect 与组件生命周期的区别、独立同步过程和重新同步。
- [`useEffect` Reference](https://react.dev/reference/react/useEffect) - 支撑 setup、cleanup、依赖变化顺序、卸载和 Strict Mode。
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) - 支撑 cleanup 停止或撤销 setup 所做的同步。
- [`StrictMode` Reference](https://react.dev/reference/react/StrictMode) - 支撑开发期额外 setup -> cleanup -> setup 的压力检查。
- [React v19.2.8 ReactFiberCommitEffects setup](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177) - 支撑固定版本保存 setup 返回的 destroy。
- [React v19.2.8 ReactFiberCommitEffects cleanup](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248-L294) - 支撑固定版本调用已保存的 destroy。
- [React v19.2.8 ReactFiberWorkLoop passive phase](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberWorkLoop.js#L4546-L4564) - 支撑固定版本 passive 阶段的 unmount/mount 顺序。
- [React v19.2.8 Effect tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1092-L1162) - 支撑固定版本依赖变化和卸载时 passive destroy 顺序。
