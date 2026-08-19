---
id: react.core.learn.intermediate.lab-synchronized-chat-room
type: lesson
title: 实战：可切换聊天室
summary: 组合 Effect 生命周期、完整依赖、Effect Event 与自定义 Hook，完成可切换目标且资源不泄漏的聊天室。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - react.core.learn.intermediate.use-effect
  - react.core.learn.intermediate.effect-dependencies
  - react.core.learn.intermediate.effect-events
  - react.core.learn.intermediate.custom-hooks
  - react.core.learn.intermediate.strict-mode-development-checks
related:
  - react.core.learn.intermediate.unnecessary-effects
tags:
  - React
  - 实战
  - useEffect
  - useEffectEvent
  - 自定义 Hook
  - 聊天室
  - 资源清理
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能把服务器地址和房间标识作为 Effect 的完整响应值，切换目标时先清理旧连接再建立新连接。
  - 能把连接生命周期抽取为 useChatRoom，并让 Hook 只暴露当前场景需要的操作。
  - 能使用 useEffectEvent 在连接事件发生时读取最新已提交主题，而不因主题变化重启连接。
  - 能把发送消息放在提交事件中，把外部连接同步留在 Effect 中。
  - 能在 StrictMode 下用活跃资源不变量验证 setup 与 cleanup 对称，而不依赖精确调用次数。
  - 能通过重置和切换操作确认旧连接不会继续发布事件。
recap:
  - Effect 负责把当前响应值同步到外部连接，setup 返回的 cleanup 负责撤销同一轮资源。
  - 服务器地址和房间是连接身份的一部分，必须进入 Effect 依赖；主题只影响通知内容时不属于连接依赖。
  - Effect Event 读取调用时最近一次已提交 render 的主题，但只能从 Effect 建立的外部事件路径触发，不能替代普通用户事件处理器。
  - 自定义 Hook 抽取的是连接状态和生命周期逻辑，不会共享不同 Hook 调用的 State。
  - 用户发送消息由表单提交事件触发，不应先写 State 再用 Effect 监听该 State 发送。
  - StrictMode 的开发期额外周期可以改变 setup 与 cleanup 计数，正确性看当前连接和事件所有权。
sources:
  - title: Synchronizing with Effects
    url: https://react.dev/learn/synchronizing-with-effects
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Effect 用于把组件与外部系统同步
      - cleanup 应撤销 setup 建立的连接或订阅
  - title: Lifecycle of Reactive Effects
    url: https://react.dev/learn/lifecycle-of-reactive-effects
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Effect 按响应值变化重新同步而不是只绑定组件挂载
      - 依赖变化时先执行旧 cleanup 再执行新 setup
  - title: Removing Effect Dependencies
    url: https://react.dev/learn/removing-effect-dependencies
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 依赖由 Effect 代码读取的响应值决定
      - 不能通过抑制 lint 或删除依赖隐藏响应关系
  - title: Separating events from Effects
    url: https://react.dev/learn/separating-events-from-effects
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Effect Event 读取最新非响应值而不触发 Effect 重新同步
      - Effect Event 不能作为普通事件处理器的替代品
  - title: useEffectEvent
    url: https://react.dev/reference/react/useEffectEvent
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Effect Event 读取最近一次已提交 render 的 Props 与 State
      - Effect Event 必须从外围 Effect 的依赖中省略
  - title: Reusing Logic with Custom Hooks
    url: https://react.dev/learn/reusing-logic-with-custom-hooks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 自定义 Hook 抽取可复用的有状态逻辑
      - 每次 Hook 调用拥有独立 State 和 Effect
  - title: StrictMode
    url: https://react.dev/reference/react/StrictMode
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 开发环境额外执行 Effect setup 与 cleanup
      - 代码应依赖资源不变量而不是调用次数
  - title: Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 改变 key 会重建该位置的组件 State
      - key 标识的场景子树会作为新的组件实例创建
---

# 实战：可切换聊天室

## 一、学习目标

- 把聊天室连接拆成连接身份、连接生命周期、连接事件和用户消息四类职责。
- 用 `useEffect` 让当前服务器和房间与本地连接保持同步。
- 用自定义 Hook 隐藏连接的建立、监听、发送和清理细节。
- 用 `useEffectEvent` 让连接事件读取最新通知主题，同时避免主题切换造成重连。
- 用可观察计数和事件日志检查旧连接是否释放、当前是否只有一份活跃连接。
- 在 StrictMode 开发检查下完成切换、发送、重新连接和重置。

## 二、最终成品

这是一个不访问网络的聊天室练习。页面用本地连接替身模拟外部系统，连接由服务器地址和房间组成。页面
可以切换两个服务器和三个房间，也可以切换通知主题、触发一次连接事件、发送一条本地消息和重置整个场景。

页面观察区显示：

- 当前活跃连接的服务器和房间。
- `setup`、`cleanup` 和活跃连接数。
- 最近的连接、断开、通知和消息事件。
- 主题变化后的下一条连接通知。

这里的连接替身没有网络、账号、数据库或持久化。它只提供外部系统需要的最小接口：连接、断开、订阅
`connected` 事件和发送消息。这样可以把注意力放在 React 的生命周期和数据边界上。

正确性不由日志打印了几次决定，而由以下不变量决定：

1. 当前页面显示的服务器和房间始终对应当前活跃连接。
2. 当前场景最多有一份活跃连接。
3. 切换服务器或房间后，旧连接不会再发布事件。
4. 主题变化不会增加连接 setup，但下一次连接事件能读取新主题。
5. 一次提交只发送一条消息。
6. 重置后旧场景的连接和事件不会污染新场景。

## 三、先画出四条边界

聊天室同时包含四种变化。把它们混在一个 Effect 里，最容易出现错误依赖或错误触发。

| 变化 | 触发原因 | 所属边界 | 是否重新连接 |
| --- | --- | --- | --- |
| 服务器地址 | 用户选择新的服务器 | 连接身份 | 是 |
| 房间标识 | 用户选择新的房间 | 连接身份 | 是 |
| 通知主题 | 用户选择浅色或深色 | 连接事件的显示内容 | 否 |
| 消息文本 | 用户提交表单 | 用户事件 | 否 |

服务器和房间描述“连接到哪里”，所以它们属于 Effect 的响应值。主题描述“连接事件发生后如何显示
通知”，只在事件到达时使用最新值。消息描述“用户现在要做什么”，它由提交事件直接处理。

如果把四者都放进连接 Effect 的依赖，主题每次变化都会断开并重连；如果把服务器或房间从依赖里删掉，
界面会显示新选择，连接却仍然停留在旧目标；如果把消息写入 State 再用 Effect 发送，普通输入更新也会
变成外部动作的触发条件。

## 四、连接替身的最小合同

真实连接通常来自 WebSocket、事件总线或第三方 SDK。实战先把它们抽象成一个简单对象：

```tsx
type ConnectionListener = () => void

type ChatConnection = {
  connect(): void
  disconnect(): void
  subscribeConnected(listener: ConnectionListener): () => void
  send(text: string): void
}
```

每个方法的职责不同：

- `connect()` 建立当前连接并可能发布一次 `connected`。
- `disconnect()` 撤销当前连接，之后不能继续发布事件。
- `subscribeConnected()` 登记本次监听器，并返回只撤销本次登记的函数。
- `send()` 把一条消息交给当前连接，不负责改变房间选择。

`subscribeConnected()` 的返回值是 cleanup 的关键。setup 登记了哪个监听器，cleanup 就必须撤销同一个
监听器；setup 建立了哪个连接，cleanup 就必须断开同一个连接。不要在一个实例的 cleanup 中调用
`removeAllListeners()` 或 `disconnectAll()`，否则会破坏其他组件仍拥有的资源。

## 五、用 `useEffect` 同步连接身份

最小的连接 Effect 可以写成：

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  const unsubscribe = connection.subscribeConnected(handleConnected)

  connection.connect()

  return () => {
    unsubscribe()
    connection.disconnect()
  }
}, [serverUrl, roomId])
```

这里有三个重要事实：

1. `connection` 是本轮 setup 创建的局部资源，cleanup 闭包会持有同一个对象。
2. 依赖变化时，React 先运行旧 cleanup，再运行新 setup，所以旧目标先释放，新目标后建立。
3. 普通重新渲染不会改变 `serverUrl` 或 `roomId`，因此不会重新同步连接。

不要把连接对象放进 State 作为业务状态镜像。连接对象的所有权属于 Effect，页面只需要展示由连接替身
发布的快照。也不要在 render 中调用 `connect()`，render 可能被重复执行、放弃或重新开始。

### 1. 依赖必须描述连接身份

下面的代码漏掉了 `roomId`：

```tsx
// 错误：选择房间后仍然保留旧房间连接。
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl])
```

修复不是把依赖数组写成空数组，而是保留 Effect 读取的响应值：

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])
```

依赖数组不是“想让它什么时候运行”的配置表，而是 Effect 代码与响应值之间的公开关系。

### 2. cleanup 要清理本轮资源

错误写法把变量改成了最新连接，再让旧 cleanup 清理这个变量：

```tsx
// 错误：旧 cleanup 可能断开新连接。
connectionRef.current = createConnection(serverUrl, roomId)
return () => connectionRef.current?.disconnect()
```

正确写法直接关闭 setup 创建的局部对象：

```tsx
const connection = createConnection(serverUrl, roomId)
connection.connect()

return () => connection.disconnect()
```

这样即使连接输入快速连续变化，每一轮 cleanup 也只处理自己取得的资源。

## 六、把连接逻辑抽成 `useChatRoom`

当多个场景都需要“按目标建立连接、订阅事件、卸载时清理”时，可以抽成自定义 Hook。Hook 的职责是隐藏
生命周期细节，调用方只拿到当前场景需要的操作：

```tsx
function useChatRoom(
  audit: ChatAudit,
  serverUrl: ServerUrl,
  roomId: RoomId,
  theme: Theme,
) {
  const connectionRef = useRef<ChatConnection | null>(null)

  const onConnected = useEffectEvent(() => {
    audit.notice(roomId, theme)
  })

  useEffect(() => {
    const connection = new ChatConnection(serverUrl, roomId, audit)
    const unsubscribe = connection.subscribeConnected(onConnected)
    connectionRef.current = connection
    connection.connect()

    return () => {
      unsubscribe()
      connection.disconnect()
      if (connectionRef.current === connection) connectionRef.current = null
    }
  }, [audit, serverUrl, roomId])

  function emitConnected() {
    connectionRef.current?.emitConnected()
  }

  function sendMessage(text: string) {
    connectionRef.current?.send(text)
  }

  return { emitConnected, sendMessage }
}
```

Hook 内部拥有连接 Ref 和 Effect；调用方不需要知道订阅函数叫什么，也不需要自己写 cleanup。返回的
`sendMessage` 是普通用户事件可以调用的函数，`emitConnected` 只是 Demo 的观察入口。

自定义 Hook 不会让两个调用共享 State。两个组件分别调用 `useChatRoom` 时，每个调用拥有自己的 Ref、
Effect 和连接；它们只是复用了相同的逻辑形状。

## 七、在连接事件中读取最新主题

连接的建立条件是服务器和房间。主题只影响通知外观，因此不应成为重连依赖。普通闭包如果直接捕获主题，
可能一直读取建立监听器那次 render 的旧值。把通知逻辑写成 Effect Event：

```tsx
const onConnected = useEffectEvent(() => {
  audit.notice(roomId, theme)
})

useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  const unsubscribe = connection.subscribeConnected(onConnected)
  connection.connect()

  return () => {
    unsubscribe()
    connection.disconnect()
  }
}, [serverUrl, roomId])
```

当主题从 `light` 切换到 `dark` 时，Effect 不会重新运行；连接仍然是同一份。之后连接替身发布
`connected`，Effect Event 会读取最近一次已提交 render 中的主题并记录 `dark` 通知。这里的“最新”不包括
尚未提交或已经被放弃的 render。

这不是把主题“从依赖里藏起来”。主题确实被 Effect Event 读取，而 Effect Event 的职责正是把非响应式
逻辑从响应式同步过程分离。服务器和房间仍然必须保留在 Effect 依赖中。

### 1. Effect Event 的调用边界

Effect Event 适合由 Effect 建立的外部事件监听器调用：

```tsx
const onConnected = useEffectEvent(() => {
  showNotification(`已连接 ${theme}`)
})

useEffect(() => {
  const unsubscribe = connection.subscribeConnected(onConnected)
  return unsubscribe
}, [connection])
```

用户点击“发送消息”不应改为调用 `onConnected`。发送消息是独立的用户事件，应由 `onSubmit` 直接调用
Hook 返回的 `sendMessage`。

### 2. 不要把所有变化都变成非响应式

如果权限、服务器或房间决定连接能否建立，它们就是连接身份，必须让 Effect 响应。只有不会改变连接本身、
而只改变事件处理结果的值，才适合放进 Effect Event。把 `roomId` 错误地移进 Effect Event，会让房间切换
后旧连接继续存在。

## 八、消息发送属于提交事件

消息输入是受控 State，但 State 只是页面编辑中的草稿。提交时直接处理业务动作：

```tsx
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  const message = draft.trim()
  if (!message) return

  sendMessage(message)
  setDraft('')
}
```

不要这样写：

```tsx
// 错误：每次 draft 更新都可能触发外部发送。
useEffect(() => {
  if (draft) sendMessage(draft)
}, [draft])
```

用户输入每个字符都是 State 更新，但只有提交按钮或 Enter 才表达“现在发送”的业务意图。把两者混为
一谈会发送半成品，也会让清理和重连逻辑变得难以区分。

## 九、StrictMode 下检查资源不变量

开发环境根级 StrictMode 可能在第一次真实 setup 前执行一次 setup/cleanup，再执行真实 setup。Demo 因此
可能观察到：

```text
setup -> cleanup -> setup
```

这会让 `setup` 和 `cleanup` 计数增加，但最终 `activeCount` 仍应为 `1`。切换房间时，旧连接的 cleanup
先运行，新连接的 setup 后运行，最终仍只有一份活跃连接。

不要为“只连接一次”添加 `useRef` 开关：

```tsx
// 错误：阻止第二次 setup，却没有定义依赖变化和卸载清理。
const hasConnected = useRef(false)

useEffect(() => {
  if (hasConnected.current) return
  hasConnected.current = true
  connect()
}, [roomId])
```

这个开关会让房间变化时不能建立新连接，也不能替代 cleanup。正确做法是让每轮 setup 都可撤销。

### 1. 精确计数只属于指定环境

当前 Demo 由根级 `<StrictMode>` 包裹，并运行在开发环境。它只有一个连接 Effect，计数器也由同一个聊天室实例
持有，因此冷启动稳定后应观察到：

```text
setup = 2
cleanup = 1
active = 1
```

生产环境初挂载通常只有一次 setup。`<StrictMode>` 只包裹非根级子树时，React 19.2 也不会在初次挂载额外
重跑 Effect。精确次数只能用于核对当前 Demo；通用正确性仍是 cleanup 撤销本轮资源，稳定后只有当前连接。

### 2. 用 `key` 重置完整聊天室实例

重置按钮需要同时恢复服务器、房间、主题、草稿、事件日志和资源计数。把 `key` 放在持有这些 State 的场景
组件上，可以让 React 移除旧实例并创建新实例：

```tsx
function ChatRoomDemo() {
  const [sceneKey, setSceneKey] = useState(0)

  return (
    <ChatRoomScene
      key={sceneKey}
      onReset={() => setSceneKey((current) => current + 1)}
    />
  )
}
```

旧实例移除时会执行最后一次连接 cleanup；新实例从固定初值开始，并按它所处的 StrictMode 环境完成初挂载。
计数器位于 `ChatRoomScene` 内，所以新实例显示自己的计数；若计数器放在外层，它就会保留累计值而不是归零。

## 十、完成实战的顺序

1. 先写 `ChatConnection`，只实现连接、断开、订阅和发送四个动作。
2. 再写 `ChatAudit`，把连接计数和事件日志转换为不可变 UI 快照。
3. 在 `useChatRoom` 中建立本轮连接，订阅 `connected`，并在 cleanup 中先取消订阅再断开。
4. 把服务器和房间放进依赖，把主题读取放进 Effect Event。
5. 在场景组件中把选择器、主题按钮和消息表单放进事件处理器。
6. 加入 StrictMode 下的资源状态展示，优先检查活跃连接而不是 setup 次数。
7. 通过切换、重连、发送和重置重复验证旧连接不会写入新场景。

每一步只增加一个职责。这样看到错误事件时，可以判断是连接适配器、Effect、Effect Event 还是用户事件
边界出了问题。

## 十一、用法示例或 Demo

下面的 Demo 使用本地连接替身，不发送真实请求。初始化后先观察 `setup / cleanup / active` 和最近事件；
再按顺序完成：切换主题、触发 connected、切换房间、发送消息、重置聊天室。

:::demo{id="react.core.learn.intermediate.lab-synchronized-chat-room.lab-synchronized-chat-room-demo"}
:::

观察重点：

- 初始开发检查可能出现多个 setup，但活跃连接应为 `1`。
- 切换主题后，连接计数不变；触发 connected 后，通知事件使用新主题。
- 切换服务器或房间后，事件日志先出现旧目标断开，再出现新目标连接。
- 发送消息只增加一条 message 事件，不触发连接 setup。
- 重置后计数和日志属于新的场景，旧连接不再发布事件。

## 十二、易错使用提示

:::pitfalls
### 错误：只在挂载时连接

**触发条件：** 使用空依赖数组建立聊天室，却允许用户切换服务器或房间。

**原因：** 连接身份依赖当前服务器和房间，空数组切断了响应关系。

**后果：** 选择器显示新目标，外部连接仍然停留在旧目标。

**错误示例：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  return () => connection.disconnect()
}, [])
```

**正确写法：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])
```

**验证方式：** 切换服务器和房间，检查旧目标先断开、当前目标只有一份活跃连接。

### 错误：删除依赖来阻止重连

**触发条件：** 看到 Effect 依赖检查提示，就删掉 `roomId` 或关闭规则。

**原因：** 依赖由 Effect 读取的响应值决定，不是由期望的调用次数决定。

**后果：** 代码表面安静，但响应值变化后连接不再同步。

**错误示例：**

```tsx
useEffect(() => connect(serverUrl, roomId), [serverUrl])
```

**正确写法：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])
```

**验证方式：** 依次切换每个连接身份字段，事件日志中都出现旧连接断开和新连接建立。

### 错误：把主题放入连接依赖

**触发条件：** 连接事件显示主题，于是把 `theme` 加入连接 Effect 依赖。

**原因：** 主题只改变通知内容，并不改变连接身份。

**后果：** 每次换主题都会断开并重连，真实连接会产生无意义抖动。

**错误示例：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId, theme])
```

**正确写法：**

```tsx
const onConnected = useEffectEvent(() => {
  showNotification(`已连接，主题：${theme}`)
})

useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  const unsubscribe = connection.subscribeConnected(onConnected)
  connection.connect()
  return () => {
    unsubscribe()
    connection.disconnect()
  }
}, [serverUrl, roomId])
```

**验证方式：** 切换主题后 setup 和 cleanup 不增加，手动触发 connected 后通知主题变为新值。

### 错误：用 Ref 开关跳过第二次 setup

**触发条件：** 看到 StrictMode 的重复连接日志，就用 `hasRun.current` 只允许第一次连接。

**原因：** 把开发期诊断次数误当成业务合同，绕过了正常的依赖变化和卸载路径。

**后果：** 切换房间后不再连接新目标，旧资源也没有可靠释放。

**错误示例：**

```tsx
const hasRun = useRef(false)
useEffect(() => {
  if (hasRun.current) return
  hasRun.current = true
  connect()
}, [roomId])
```

**正确写法：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])
```

**验证方式：** 保留 StrictMode，挂载、切换房间和重置后都检查 `activeCount` 是否保持正确。

### 错误：cleanup 断开当前 Ref 而不是本轮连接

**触发条件：** cleanup 通过 `connectionRef.current` 查找要断开的对象。

**原因：** Ref 可能已经被下一轮 setup 改成新连接。

**后果：** 旧 cleanup 断开新连接，旧连接反而继续发布事件。

**错误示例：**

```tsx
connectionRef.current = connection
return () => connectionRef.current?.disconnect()
```

**正确写法：**

```tsx
connectionRef.current = connection
return () => {
  connection.disconnect()
  if (connectionRef.current === connection) connectionRef.current = null
}
```

**验证方式：** 快速连续切换服务器和房间，旧事件不能出现在新连接之后。

### 错误：用 Effect 发送输入草稿

**触发条件：** 监听 `draft`，只要输入非空就调用 `sendMessage`。

**原因：** 把 State 变化误当成用户提交意图。

**后果：** 每输入一个字符就发送一条半成品消息。

**错误示例：**

```tsx
useEffect(() => {
  if (draft) sendMessage(draft)
}, [draft])
```

**正确写法：**

```tsx
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  const message = draft.trim()
  if (!message) return
  sendMessage(message)
  setDraft('')
}
```

**验证方式：** 输入一段文字但不提交，日志不增加；提交一次只增加一条 message 事件。

### 错误：让自定义 Hook 暴露连接对象

**触发条件：** Hook 直接返回第三方连接实例，让每个调用方自行 connect、subscribe 和 disconnect。

**原因：** 连接生命周期所有权被拆散，Hook 失去抽取状态逻辑的价值。

**后果：** 不同调用方的清理顺序和监听器注销方式不一致，容易泄漏或重复订阅。

**错误示例：**

```tsx
const connection = useChatRoom(serverUrl, roomId)
connection.connect()
```

**正确写法：**

```tsx
const { sendMessage } = useChatRoom(audit, serverUrl, roomId, theme)

function handleSubmit(message: string) {
  sendMessage(message)
}
```

**验证方式：** 调用方不再出现 connect、subscribe 或 disconnect；卸载和切换仍能释放资源。

### 错误：把诊断计数当成业务状态

**触发条件：** 根据 setup 次数决定是否显示“已连接”、收费或发送通知。

**原因：** 开发 StrictMode、重新挂载和未来调度都可能改变观察次数。

**后果：** 开发与生产行为不一致，重置或切换后业务结果错误。

**错误示例：**

```tsx
if (setupCount === 1) showConnected()
```

**正确写法：**

```tsx
const isConnected = connectionState === 'connected'

if (isConnected) showConnected()
```

**验证方式：** 改变开发检查次数后，当前目标、活跃连接和用户提交结果仍然正确。
:::

## 十三、源码推导与适用场景

### 1. 官方事实：Effect 是同步过程

React 官方把 Effect 描述为与外部系统同步的过程。组件进入需要同步的状态时运行 setup，响应值变化或组件
离开时运行 cleanup，再以新值重新 setup。连接、订阅和计时器都需要清理与建立镜像。

### 2. 课程推导：连接身份决定依赖

服务器和房间共同决定“连接到哪里”，因此是连接 Effect 的响应值。主题和消息不改变连接身份：主题由
Effect Event 延迟读取，消息由用户事件直接处理。这个分类比“Effect 里出现了什么变量”更能帮助判断职责，
但最终依赖仍必须覆盖 Effect 直接读取的响应值。

### 3. 课程推导：Hook 是所有权边界

`useChatRoom` 的核心价值是明确资源所有权。它把连接、监听器和 cleanup 放在同一个边界内，让调用方无法在
不知情时跳过清理。Hook 的返回值是当前场景的最小能力，不是对外暴露的资源管理接口。

### 4. 适用场景

同样的结构适合：

- 按文档 ID 建立实时编辑订阅。
- 按筛选条件订阅本地事件总线。
- 按用户选择启动和清理观察器。
- 连接事件到达时读取最新的提示主题或显示语言。

它不负责缓存、请求竞态、路由加载、认证授权、离线队列、消息持久化或真实 WebSocket 协议。那些问题需要
额外的外部系统合同，不能用这个本地连接替身假装已经解决。

## 十四、练习

:::exercise
### 练习一：补全连接依赖

**要求：** 给一个只依赖 `serverUrl` 的连接 Effect 增加 `roomId`，并写出切换房间时旧 cleanup 与新
setup 的顺序。

**验收：** 服务器或房间任一变化都会切换连接；普通主题变化不会切换连接；cleanup 只断开本轮对象。
:::

:::exercise
### 练习二：抽取 `useChatRoom`

**要求：** 把连接创建、订阅和清理从场景组件移入 `useChatRoom`，让场景组件只保留选择器、消息表单和结果展示。

**验收：** 场景组件不直接调用 `connect`、`subscribe` 或 `disconnect`；Hook 卸载后活跃连接归零。
:::

:::exercise
### 练习三：隔离主题变化

**要求：** 连接建立事件需要显示当前主题，但切换主题不能重连。使用 `useEffectEvent` 改写回调，并保留连接身份依赖。

**验收：** 切换主题后 setup 和 cleanup 不增加；下一次 connected 事件使用新主题；切换房间仍会重连。
:::

:::exercise
### 练习四：验证 StrictMode 不变量

**要求：** 在开发 StrictMode 下完成冷启动、主题切换、房间切换、消息提交和重置，记录观察到的事件并说明
哪些是诊断计数、哪些是业务不变量。

**验收：** 最终始终只有一份当前连接；旧房间不再发布事件；一次提交只产生一条消息；重置后没有旧日志。
:::

## 十五、本节小结

- 连接身份决定 Effect 依赖；服务器和房间变化必须触发重新同步。
- setup 创建的连接和监听器必须由同一轮 cleanup 成对撤销。
- `useChatRoom` 统一持有连接资源，调用方只使用最小操作接口。
- `useEffectEvent` 让外部连接事件读取最新主题，但不把主题变成重连条件。
- 消息发送是用户提交事件，不是监听草稿 State 的 Effect。
- StrictMode 下检查活跃资源和事件所有权，不把 setup 或 render 次数写进业务逻辑。

## 十六、参考资料

- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) - Effect 与外部系统同步以及 cleanup 基础。
- [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) - 响应值变化时的 cleanup/setup 顺序。
- [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies) - 依赖推导和避免隐藏响应关系。
- [Separating events from Effects](https://react.dev/learn/separating-events-from-effects) - Effect Event 的最新值读取和调用边界。
- [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) - 自定义 Hook 的抽取和独立 State。
- [StrictMode](https://react.dev/reference/react/StrictMode) - 开发期额外检查和资源清理不变量。
