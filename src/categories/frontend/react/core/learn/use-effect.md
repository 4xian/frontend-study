---
id: react.core.learn.intermediate.use-effect
type: lesson
title: useEffect
summary: 在提交后把 React 值同步到外部系统，并用 cleanup 管理同步过程的开始、停止和重新同步。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 60
prerequisites:
  - react.core.learn.intermediate.use-ref
related:
  - react.core.learn.intermediate.use-ref
  - react.core.learn.intermediate.dom-refs
tags:
  - React
  - useEffect
  - Effect
  - cleanup
  - 外部系统
  - 生命周期
  - TypeScript
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能判断一个需求是否真的需要把 React 与外部系统同步。
  - 能写出顶层 useEffect、固定内联依赖数组和正确返回值。
  - 能用 setup 与 cleanup 对称地取得和释放事件监听、连接或计时器。
  - 能解释依赖变化时旧过程先停止、新过程再开始，以及移除组件时的最后清理。
  - 能区分 render、用户事件和 Effect 的职责，并处理旧闭包中的资源身份。
  - 能让 Effect 经受 Strict Mode 的重复 setup 检查而不留下重复资源。
recap:
  - Effect 只负责把已提交的 React 值同步到 React 不控制的外部系统。
  - setup 开始一个同步过程；如果取得资源，就返回只撤销本次资源的 cleanup。
  - 依赖变化时先运行旧 cleanup，再运行新 setup；组件移除时运行最后 cleanup。
  - cleanup 必须使用 setup 闭包中的同一资源和同一 handler，不能清空其他实例的资源。
  - render 保持纯净，事件处理器处理用户动作，Effect 不用来计算派生值或制造更新循环。
  - Strict Mode 的额外 setup -> cleanup -> setup 是可重复性检查，不能作为业务调用次数合同。
sources:
  - title: useEffect
    url: https://react.dev/reference/react/useEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Hook 签名、setup、cleanup、依赖数组、客户端限制和返回值合同
      - 依赖变化与组件移除时的清理顺序
  - title: Synchronizing with Effects
    url: https://react.dev/learn/synchronizing-with-effects
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 渲染、提交和外部系统同步的边界
      - 资源必须能够在重复同步后回到同一个最终状态
  - title: Lifecycle of Reactive Effects
    url: https://react.dev/learn/lifecycle-of-reactive-effects
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Effect 的 start/stop 过程与组件 mount/update/unmount 视角不同
      - 每个 Effect 应负责一个独立同步过程
  - title: StrictMode
    url: https://react.dev/reference/react/StrictMode
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 开发环境首次运行时的额外 setup -> cleanup -> setup 检查
  - title: React 19.2.8 ReactFiberCommitEffects Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本在提交阶段保存 setup 返回的清理函数
  - title: React 19.2.8 ReactFiberCommitEffects Cleanup Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248-L294
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本清理阶段读取并调用已保存的 cleanup
  - title: React 19.2.8 Effect Tests
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1092-L1162
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 官方测试观察依赖变化时旧清理先于新建立，移除时执行最后清理
---

# useEffect

## 一、学习目标

- 判断目标是不是 React 不拥有的外部系统，并在需要时用 `useEffect` 同步它。
- 写出顶层 `useEffect(setup, dependencies)`，让读取到的响应值出现在固定、内联的依赖数组中。
- 用同一个 setup 闭包取得资源，并返回对称的 cleanup。
- 观察依赖变化、移除和重新挂载时的 stop/start 顺序与最终资源数量。
- 把工作放在正确阶段：render 计算 UI，事件处理器响应用户动作，Effect 同步外部系统。

## 二、为什么需要

组件函数的 render 应该只根据输入计算 JSX。浏览器原生对象、媒体播放器、编辑器实例、事件频道和其他第三方
代码却不在 React 的控制范围内，它们仍需要知道 React 已经提交的界面状态。

Effect 提供一个提交后的同步边界：React 先计算并提交 JSX，setup 再把当前值交给外部系统。外部系统有自己的
资源时，setup 同时返回 cleanup，保证这个资源在同步目标变化或组件移除时停止。Effect 不是“值变化后的万能回调”，
也不是把事件处理器延迟执行的语法。

## 三、核心概念

### 1. 签名与职责

```tsx
useEffect(setup, dependencies?)
```

- `setup` 是没有参数的函数，在组件提交后运行。
- `setup` 可以返回 `undefined`，也可以返回一个 cleanup 函数；不能返回数字、对象、Promise 或 `async` 函数。
- `dependencies` 是固定长度、直接写在调用点的数组。setup 读取的响应值都必须列出；React 使用 `Object.is`
  比较每一项。
- Hook 在组件或自定义 Hook 的顶层调用，不能放进条件、循环、事件处理器或普通工具函数。
- `useEffect` 本身返回 `undefined`，它不是用来返回外部系统结果的 API。

### 2. 一个同步过程

```tsx
useEffect(() => {
  connect(roomId)

  return () => {
    disconnect(roomId)
  }
}, [roomId])
```

可以把每次 setup 与它返回的 cleanup 看成一个不可重叠的同步过程：setup 开始，cleanup 停止。`roomId` 改变时，
旧闭包中的 `disconnect('alpha')` 先运行，新闭包才会 `connect('beta')`。组件移除时，当前过程执行最后一次 cleanup。

这和组件的 mount、update、unmount 不是同一套标签。组件仍然挂载时，响应值变化也会让一个 Effect 停止旧过程并开始
新过程；没有响应值变化时，普通重新渲染不会凭空创建新过程。

### 3. 提交后的时序

React 的公共观察顺序可以概括为：

1. 事件处理器或其他更新入口安排 State/Props 变化。
2. render 根据新快照计算 JSX，不修改外部系统。
3. React commit 把 JSX 结果写入宿主环境。
4. Effect setup 把已提交的值同步到外部系统。

普通 `useEffect` 通常允许浏览器先绘制，再执行同步；不要把它当作绘制前布局测量工具。与交互相关的更新可能有
不同调度时机，但代码仍必须只依赖公开的同步合同，而不能依赖某个精确的微任务或宏任务时间点。

### 4. 依赖数组

依赖数组表达“哪些响应值改变时需要重新同步”，不是“让回调只运行一次”的开关。数组必须直接写出且长度稳定：

```tsx
useEffect(() => {
  widget.setMode(mode)
}, [mode])
```

`mode` 是字符串，比较结果稳定且容易观察。对象、数组和函数按引用比较；如果它们每次 render 都新建，Effect 也会
随之重新同步。复杂依赖应先改写数据流或稳定身份，再声明真实依赖，不能靠省略依赖或禁用检查掩盖问题。

### 5. setup 与 cleanup 的资源所有权

setup 取得什么，cleanup 就负责撤销什么，而且应当使用 setup 当轮闭包里的同一个对象和函数：

```tsx
useEffect(() => {
  function handleMessage(message: string): void {
    console.log(message)
  }

  channel.addListener(handleMessage)
  return () => {
    channel.removeListener(handleMessage)
  }
}, [channel])
```

`removeListener` 需要同一个 `handleMessage` 身份。cleanup 不是全局重置钩子，不应调用 `clearAllListeners()` 影响
其他组件；也不应读取一个已经变化的可变变量来猜测旧资源。setup 没有取得资源时可以不返回 cleanup，不能为了形式
对称而清理不属于自己的对象。

## 四、最小正确用法

### 1. 同步没有独立资源的小部件

下面的小部件只修改自己的宿主节点，不注册全局监听、不创建计时器，也不被其他组件持有，因此 setup 不需要 cleanup：

```tsx
import { useEffect, useRef } from 'react'

type Mode = 'compact' | 'expanded'

declare function createModeWidget(host: HTMLDivElement): {
  setMode(mode: Mode): void
}

function ModePanel({ mode }: { mode: Mode }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<ReturnType<typeof createModeWidget> | null>(null)

  useEffect(() => {
    if (!hostRef.current) return
    if (!widgetRef.current) widgetRef.current = createModeWidget(hostRef.current)
    widgetRef.current.setMode(mode)
  }, [mode])

  return <div ref={hostRef} data-mode={mode} />
}
```

用大括号包住 setup 代码，可以明确丢弃 `setMode` 的普通返回值，避免把它误交给 React 当 cleanup。切换按钮只改变
`mode`；Widget 的同步由提交后的 Effect 负责。

### 2. 对称监听资源

```tsx
type SignalChannel = {
  addListener(listener: (message: string) => void): void
  removeListener(listener: (message: string) => void): void
}

function SignalListener({ channel }: { channel: SignalChannel }) {
  useEffect(() => {
    function handleSignal(message: string): void {
      console.log(message)
    }

    channel.addListener(handleSignal)
    return () => {
      channel.removeListener(handleSignal)
    }
  }, [channel])

  return null
}
```

依赖 `channel` 变化时，旧频道的 handler 先移除，新频道才注册；组件移除时当前 handler 最后移除。相同模式也适用于
`connect/disconnect`、`subscribe/unsubscribe`、`addEventListener/removeEventListener` 和
`setInterval/clearInterval`。

### 3. 需要停止的连接

```tsx
type RoomId = 'alpha' | 'beta'

function RoomConnection({ roomId }: { roomId: RoomId }) {
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()
    return () => {
      connection.disconnect()
    }
  }, [roomId])

  return <p>当前房间：{roomId}</p>
}
```

cleanup 闭包持有创建它的 `connection`，所以即使组件后来收到新的 `roomId`，旧连接仍能被准确断开。需要取消异步
工作时，应把取消器或 `AbortController` 也在同一 setup 中创建，并在 cleanup 中调用；不能让过期结果继续写入当前 UI。

## 五、Effect 的独立同步生命周期

### 1. 开始、停止、重新同步

每个 Effect 只描述一个外部同步过程。可以用下面的状态机理解它：

```text
未同步 -- setup --> 已同步
已同步 -- 依赖变化 / 移除 --> cleanup --> 未同步
未同步 -- 新 setup --> 已同步
```

依赖改变时，旧过程和新过程不会重叠。以房间同步为例，`alpha -> beta` 的可观察事件必须是：

```text
停止 alpha
开始 beta
```

不要把它描述成“组件 update 时重新连接”；真正重要的是同步输入改变后，旧外部状态已停止，新外部状态才开始。

### 2. 无关重新渲染

如果 render 计数、按钮高亮或其他与同步输入无关的 State 改变，setup 不应重新执行。同步过程的活动资源和事件
历史保持不变；这能证明 Effect 不是普通的 render 回调。

### 3. 多个独立系统

一个组件同时需要标题同步和频道订阅时，使用两个 Effect：

```tsx
useEffect(() => {
  document.title = title
}, [title])

useEffect(() => {
  channel.addListener(handleMessage)
  return () => channel.removeListener(handleMessage)
}, [channel])
```

这样每个 cleanup 只停止自己的过程，标题变化不会重建频道监听，频道变化也不会重复写标题。把互不相关的系统塞进
同一个 Effect 会让依赖和资源所有权纠缠在一起。

### 4. Strict Mode 的重复检查

开发环境 Strict Mode 可能在首次真实同步前额外运行：

```text
setup -> cleanup -> setup
```

正确的对称清理会让最终结果与一次 setup 相同：只有一个活动监听、一个连接或一个计时器。不要用 Ref 旗标跳过第二次
setup，也不要把 setup/cleanup 的调用次数写入业务 State。应验收最终资源不变量和用户可观察结果。

### 5. 客户端边界

Effect 只在客户端运行。必须出现在服务端 HTML 中的文本、属性和初始结构应由 render 产生；客户端专属的标题、
浏览器 API 或外部对象再由 Effect 同步。不要把首屏内容全部延迟到 Effect，也不要在服务器环境直接读取 `window`
或 `document`。

## 六、用法示例或 Demo

第一个 Demo 展示无独立资源的小部件：React 的 `mode` 在提交后同步到 Widget 的宿主节点。

:::demo{id="react.core.learn.intermediate.use-effect.external-mode-widget-demo"}
:::

第二个 Demo 展示事件监听的资源所有权：切换频道时旧 listener 先撤销，卸载时所有 listener 都停止。

:::demo{id="react.core.learn.intermediate.use-effect.effect-cleanup-event-listener-symmetry-demo"}
:::

第三个 Demo 展示独立同步过程：无关 render 不改变过程，房间切换记录“停止旧房间 → 开始新房间”，隐藏和重新显示
分别对应 stop 与 start。

:::demo{id="react.core.learn.intermediate.use-effect.effect-lifecycle-room-sync-process-demo"}
:::

## 七、易错使用提示

:::pitfalls
### 错误：在 render 中修改外部系统

**触发条件：** 在函数组件主体中调用 `widget.setMode(mode)`、注册监听或修改外部 DOM。

**原因：** render 是可重复、可放弃的纯计算阶段，宿主节点和本次 UI 结果都还没有完成提交。

**后果：** 外部系统可能收到没有真正显示的值，重复 render 还会产生重复连接或重复监听。

**错误示例：**

```tsx
function WrongPanel({ mode, widget }: { mode: Mode; widget: { setMode(mode: Mode): void } }) {
  widget.setMode(mode)
  return <output>{mode}</output>
}
```

**正确写法：**

```tsx
function RightPanel({ mode, widget }: { mode: Mode; widget: { setMode(mode: Mode): void } }) {
  useEffect(() => {
    widget.setMode(mode)
  }, [mode, widget])
  return <output>{mode}</output>
}
```

**验证方式：** 先确认 React 输出已提交，再确认外部系统值与已提交值一致。

### 错误：只注册不清理

**触发条件：** `addEventListener`、`subscribe`、`connect` 或 `setInterval` 没有对应 cleanup。

**原因：** 外部系统不会自动知道组件已经换了同步目标或离开页面。

**后果：** 旧资源继续处理事件，导致重复更新、陈旧数据、计时器泄漏或连接占用。

**错误示例：**

```tsx
useEffect(() => {
  channel.addListener(handleMessage)
}, [channel])
```

**正确写法：**

```tsx
useEffect(() => {
  channel.addListener(handleMessage)
  return () => {
    channel.removeListener(handleMessage)
  }
}, [channel])
```

**验证方式：** 切换同步目标或移除组件，确认旧资源数量回到零且事件不再送达。

### 错误：cleanup 使用新的 handler

**触发条件：** 注册和移除分别创建两个文本相同但身份不同的函数。

**原因：** 事件系统按函数引用匹配监听器，不按函数体文本匹配。

**后果：** `removeListener` 找不到原 handler，监听持续存在。

**错误示例：**

```tsx
useEffect(() => {
  channel.addListener((message) => console.log(message))
  return () => {
    channel.removeListener((message) => console.log(message))
  }
}, [channel])
```

**正确写法：**

```tsx
useEffect(() => {
  function handleMessage(message: string): void {
    console.log(message)
  }

  channel.addListener(handleMessage)
  return () => channel.removeListener(handleMessage)
}, [channel])
```

**验证方式：** 检查切换和卸载后资源计数；旧频道应为零，新频道最多保留本组件的一份监听。

### 错误：cleanup 清空共享资源

**触发条件：** 一个实例卸载时调用 `clearAllListeners()`、关闭共享连接或重置全局缓存。

**原因：** cleanup 只拥有本次 setup 获得的资源，不拥有其他组件或其他实例的资源。

**后果：** 一个组件的生命周期会破坏另一个仍在使用的组件。

**错误示例：**

```tsx
useEffect(() => {
  sharedChannel.addListener(handleMessage)
  return () => {
    sharedChannel.clearAllListeners()
  }
}, [])
```

**正确写法：** 保存本次注册返回的句柄，或使用本次闭包中的同一对象和 handler；只有明确拥有整个共享资源的组件才负责整体关闭。

```tsx
useEffect(() => {
  sharedChannel.addListener(handleMessage)
  return () => {
    sharedChannel.removeListener(handleMessage)
  }
}, [])
```

**验证方式：** 同时挂载两个实例，移除其中一个，另一个仍能接收事件且资源数量准确减少一份。

### 错误：cleanup 读取变化后的可变输入

**触发条件：** setup 把 `roomId` 写入可变 Ref，cleanup 再读取该 Ref，而不是使用本轮闭包。

**原因：** cleanup 代表旧 setup；可变 Ref 可能已经被新 render 改成了新房间。

**后果：** 从 `alpha` 切到 `beta` 时可能错误停止 `beta`，而 `alpha` 连接仍然活动。

**错误示例：**

```tsx
const latestRoomRef = useRef(roomId)
latestRoomRef.current = roomId

useEffect(() => {
  connect(roomId)
  return () => disconnect(latestRoomRef.current)
}, [roomId])
```

**正确写法：**

```tsx
useEffect(() => {
  connect(roomId)
  return () => disconnect(roomId)
}, [roomId])
```

**验证方式：** 切换房间并检查相邻事件，必须先停止旧房间，再开始新房间。

### 错误：用空依赖数组冻结响应输入

**触发条件：** Effect 读取会变化的 `roomId`、`mode` 或 `channel`，却写成 `[]`。

**原因：** 空数组只表达“不因这些依赖重新同步”，不代表 React 会自动读取最新值。

**后果：** 界面显示新目标，外部系统却停留在首次目标。

**错误示例：**

```tsx
useEffect(() => {
  connect(roomId)
  return () => disconnect(roomId)
}, [])
```

**正确写法：** 把 setup 读取的响应值直接写进依赖数组，并保证 setup/cleanup 可以重复执行。

```tsx
useEffect(() => {
  connect(roomId)
  return () => disconnect(roomId)
}, [roomId])
```

**验证方式：** 改变同步输入，确认旧过程停止、新过程启动且事件顺序正确。

### 错误：setup 返回非函数或 Promise

**触发条件：** 使用表达式体返回同步方法的数字，或写成 `useEffect(async () => {})`。

**原因：** React 只接受 `undefined` 或 cleanup 函数；Promise 不是清理函数。

**后果：** TypeScript 或开发环境报错，清理时无法可靠撤销资源。

**错误示例：**

```tsx
useEffect(() => window.setInterval(sendHeartbeat, 1000), [])
useEffect(async () => {
  await connect()
}, [])
```

**正确写法：**

```tsx
useEffect(() => {
  const intervalId = window.setInterval(sendHeartbeat, 1000)
  return () => window.clearInterval(intervalId)
}, [])

useEffect(() => {
  let ignore = false
  void connect().then(() => {
    if (!ignore) console.log('connected')
  })
  return () => {
    ignore = true
  }
}, [])
```

**验证方式：** setup 的直接返回值只能是 `undefined` 或函数；异步工作的取消或过期标记必须由 cleanup 管理。

### 错误：用 Ref 旗标跳过第二次 setup

**触发条件：** 看到 Strict Mode 的重复 setup 后，用 `didRun.current` 让后续 setup 直接返回。

**原因：** 这掩盖了 cleanup 不完整的问题，并让组件在真实重新同步时无法建立资源。

**后果：** 开发检查看似消失，切换目标或重新挂载时却出现缺失连接和旧资源。

**错误示例：**

```tsx
const didRun = useRef(false)
useEffect(() => {
  if (didRun.current) return
  didRun.current = true
  connect(roomId)
  return () => disconnect(roomId)
}, [roomId])
```

**正确写法：** 保留真实 setup 和对称 cleanup，让重复执行后最终只留下当前需要的一份资源。

```tsx
useEffect(() => {
  connect(roomId)
  return () => disconnect(roomId)
}, [roomId])
```

**验证方式：** 观察最终活动资源和用户结果，不断言 setup 只调用一次。

### 错误：Effect 无条件写回 State

**触发条件：** Effect 没有外部系统，却在每次提交后执行 `setCount(count + 1)` 或复制 Props 到 State。

**原因：** Effect 的 State 更新会触发下一轮 render 和 commit，形成自我反馈；派生值本来可以在 render 直接计算。

**后果：** 无限更新、额外闪烁、State 与 Props 暂时分叉。

**错误示例：**

```tsx
useEffect(() => {
  setCount(count + 1)
})
```

**正确写法：** 先确认有需要同步的外部系统；没有外部系统时用 render 派生值，用户动作直接在事件处理器中更新 State。

```tsx
const doubled = count * 2
return <output>{doubled}</output>
```

**验证方式：** 删除 Effect 后功能仍应由 render 和事件处理器完成，且不会新增同步事件。

### 错误：把多个独立系统绑在同一个 Effect

**触发条件：** 标题、连接、监听和计时器都在一个 setup/cleanup 中处理。

**原因：** 不同系统拥有不同响应值和资源生命周期。

**后果：** 一个依赖变化会无谓重建其他资源，cleanup 顺序和所有权难以推断。

**错误示例：**

```tsx
useEffect(() => {
  document.title = title
  channel.addListener(handleMessage)
  return () => channel.removeListener(handleMessage)
}, [title, channel])
```

**正确写法：** 每个独立外部系统使用一个 Effect；每个 cleanup 只撤销对应 setup 的资源。

```tsx
useEffect(() => {
  document.title = title
}, [title])

useEffect(() => {
  channel.addListener(handleMessage)
  return () => channel.removeListener(handleMessage)
}, [channel])
```

**验证方式：** 单独改变一个系统的输入，确认其他系统没有产生多余的 stop/start。
:::

## 八、源码推导与适用场景

1. **官方事实：** React 把 Effect 定义为提交后与外部系统同步的 setup；setup 可以返回 cleanup，依赖变化时旧
   cleanup 先于新 setup，组件移除时执行最后 cleanup。
2. **官方事实：** Effect 的 start/stop 与组件的 mount/update/unmount 是两套视角；一个组件仍然挂载时，响应值变化
   也会让同步过程停止并重新开始。
3. **固定版本证据：** React 19.2.8 的 commit 实现保存 setup 返回值并在清理阶段调用，官方测试观察到旧 passive destroy
   先于新 create。这些内部函数和 Fiber 名称不是业务 API。
4. **课程示例推导：** 小部件 Demo 只修改自己的宿主节点，所以没有独立资源；监听 Demo 使用相同 handler 对称注册
   和撤销；房间 Demo 用事件历史直接显示 stop/start 顺序。
5. **适用场景：** 使用 Effect 连接浏览器 API、第三方 Widget、订阅、媒体、计时器或可取消的异步工作；不使用 Effect
   计算派生值、复制 Props、响应一次点击或执行必须在首屏 HTML 中出现的 render 工作。

## 九、练习

:::exercise
### 扩展一个可重复同步的外部系统

**要求：** 在模式 Widget 中加入 `'reading'` 模式；在监听 Demo 中增加一个“发送到当前频道”后的结果提示；在房间
同步 Demo 中增加一个“无关渲染”按钮。所有 setup 都保持顶层调用，依赖数组固定，资源都由同一 setup 的 cleanup 撤销。

**验收：** 三种模式下 React 当前值、Widget 的 `data-mode` 与可读文本始终一致；切换监听频道后旧频道 listener 为
`0`，新频道只有当前组件的一份 listener，卸载后两个频道都不再接收；无关渲染只改变 render 计数，房间切换的相邻
事件严格为“停止旧房间、开始新房间”；重复挂载、隐藏再显示和 Strict Mode 检查后，最终活动资源数量与单次正确挂载相同。
:::

:::exercise
### 排查一个失效 cleanup

**要求：** 将一个 `removeListener` 改成新建箭头函数，另一个 cleanup 改为读取可变 Ref 中的最新房间；根据 Demo 的
资源计数和事件历史定位问题，再恢复为闭包内的同一 handler 与同一房间值。

**验收：** 修复后切换和卸载都不留下旧资源，事件顺序为旧过程 stop 后新过程 start。
:::

## 十、本节小结

- 先确认存在 React 不控制的外部系统，再在提交后用顶层 `useEffect` 同步它。
- setup 开始一个过程；取得资源时返回只撤销本次资源的 cleanup。
- 依赖变化先清理旧闭包，再建立新闭包；组件移除时清理最后一个过程。
- cleanup 使用 setup 当轮的对象和 handler，不清空共享资源，也不读取变化后的“最新值”来猜旧身份。
- render 负责计算，事件处理器负责用户动作，Effect 不负责派生值和无条件 State 更新。
- Strict Mode 重复 setup 是对称性的压力检查，最终资源不变量比调用次数重要。

## 十一、参考资料

- [useEffect](https://react.dev/reference/react/useEffect) - 签名、setup、cleanup、依赖和客户端边界。
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) - 提交后同步与重复同步后的最终状态。
- [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) - Effect 的 start/stop 和独立同步过程。
- [StrictMode](https://react.dev/reference/react/StrictMode) - 开发环境额外 setup -> cleanup -> setup 检查。
- [React v19.2.8 ReactFiberCommitEffects mount](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177) - setup 返回值保存证据。
- [React v19.2.8 ReactFiberCommitEffects cleanup](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248-L294) - cleanup 调用证据。
- [React v19.2.8 Effect tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1092-L1162) - 依赖变化和移除时序证据。
