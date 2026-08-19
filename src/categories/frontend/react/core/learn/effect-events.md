---
id: react.core.learn.intermediate.effect-events
type: lesson
title: Effect Event
summary: 从 Effect 提取读取最新值的非响应逻辑，同时保留真正决定同步的依赖。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.core.learn.intermediate.effect-dependencies
related:
  - react.core.learn.intermediate.use-effect
  - react.core.learn.intermediate.effect-dependencies
tags:
  - React
  - useEffectEvent
  - useEffect
  - Effect Event
  - 非响应逻辑
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能区分决定外部同步的响应逻辑与只在外部事件发生时读取最新值的非响应逻辑。
  - 能在组件顶层调用 useEffectEvent，并理解返回函数的参数与返回值类型。
  - 能用 Effect Event 读取最新已提交的 Props 和 State，同时保留真正决定同步的依赖。
  - 能说明 Effect Event 的调用位置、依赖省略和函数身份限制。
  - 能判断何时应该拆分 Effect、改用普通事件处理器或直接保留完整依赖。
  - 能通过外部事件验证非响应值更新不重连，而事件发生时仍读取最新值。
recap:
  - Effect 对决定外部同步的响应值作出反应，响应值变化时重新同步。
  - Effect Event 属于 Effect 逻辑，但调用时读取最新已提交的 Props 和 State。
  - Effect Event 必须从依赖数组中省略，不能用来隐藏真正决定同步的依赖。
  - Effect Event 只能在同一组件的 Effect 或其他 Effect Event 中调用，不能作为普通事件处理器或子组件 prop。
  - 返回的 Effect Event 函数身份每次 render 都会变化，不是 useCallback 或稳定的事件回调。
  - 外部事件自身携带的响应信息应通过参数显式传入，其他只需最新值的配置才从 Effect Event 中读取。
sources:
  - title: useEffectEvent
    url: https://react.dev/reference/react/useEffectEvent
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Hook 的签名、最新已提交值和返回函数类型
      - 顶层调用、Effect 调用边界、依赖省略与非稳定身份
  - title: Separating Events from Effects
    url: https://react.dev/learn/separating-events-from-effects
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 响应逻辑与非响应逻辑的划分
      - 房间连接、通知主题和显式事件参数的示例
  - title: Removing Effect Dependencies
    url: https://react.dev/learn/removing-effect-dependencies
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 只将真正不应触发重新同步的最新值读取移入 Effect Event
      - 不能用 Effect Event 掩盖缺少的依赖
  - title: React 19.2 release
    url: https://react.dev/blog/2025/10/01/react-19-2#use-effect-event
    sourceType: release-note
    appliesTo: React 19.2
    claims:
      - useEffectEvent 的 React 19.2 公共能力定位
---

# Effect Event

## 一、学习目标

- 判断外部系统的哪一项变化需要停止旧同步并建立新同步。
- 把只在外部事件发生时读取最新值的逻辑提取为 Effect Event。
- 保留真正的 Effect 依赖，并从依赖数组中省略 Effect Event。
- 说明 Effect Event 与普通事件处理器、`useCallback`、`useRef` 的边界。
- 通过事件参数和调用位置保持响应数据流清晰。
- 验证主题变化不重连，但下一次连接事件能读取新的主题。

## 二、为什么需要 Effect Event

Effect 的职责是让组件和外部系统保持同步。例如，`roomId` 改变时，房间连接必须断开并连接到新房间。连接
成功后还可能要显示一条通知，通知的颜色由当前 `theme` 决定。

这两段逻辑发生在同一个连接过程中，但触发条件不同：

| 逻辑 | 应该在什么时候运行 | 是否改变连接目标 |
| --- | --- | --- |
| 根据 `roomId` 创建、连接和清理房间 | 房间改变或组件开始同步时 | 是 |
| 连接成功后按当前 `theme` 显示通知 | 连接事件发生时 | 否 |

如果两段逻辑都直接写在 Effect 中，完整依赖必须包含 `roomId` 和 `theme`：

```tsx
useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', () => {
    showNotification('已连接', theme)
  })
  connection.connect()
  return () => connection.disconnect()
}, [roomId, theme])
```

这个写法没有漏依赖，但切换主题也会清理并重建房间连接。连接目标没有变化，却被不必要地重新同步。

如果直接把 `theme` 从数组中删除，Effect 中的回调会继续使用创建它的那次 render 所捕获的主题。之后发生连接事件
时，通知可能显示旧主题。删除依赖不能让闭包自动获得最新值。

`useEffectEvent` 用来表达这种精确的分工：连接过程仍响应 `roomId`，连接事件中的通知逻辑则在事件发生时读取
最新的 `theme`。

## 三、响应逻辑与事件逻辑

### 1. Effect 中的逻辑是响应式的

Props、State 和组件函数体内声明的变量都可能随着 render 改变。Effect 直接读取其中的值时，这些值就是该 Effect
的数据依赖。依赖变化后，React 会用新 render 的闭包重新执行 Effect 的同步逻辑。

```tsx
useEffect(() => {
  const connection = createConnection(roomId)
  connection.connect()
  return () => connection.disconnect()
}, [roomId])
```

这里的 `roomId` 决定连接目标，所以它既出现在连接逻辑中，也出现在依赖数组中。房间变化必须触发重新同步，不能
隐藏到另一个函数中再把依赖删掉。

### 2. 普通事件处理器不是响应式的

普通事件处理器由用户动作触发。输入框中的 `message` 改变，不会自动发送消息；只有用户再次点击发送按钮时，
处理器才会读取当时的 `message`。

```tsx
function handleSend() {
  sendMessage(message)
}
```

这种逻辑不应该写成“观察 `message` 改变后再发送”的 Effect。事件本身已经说明了业务原因。

### 3. Effect Event 是 Effect 里的事件逻辑

Effect Event 介于两者之间：它属于 Effect 管理的外部事件流程，但内部逻辑不会因为读取的值改变而让外围 Effect
重新同步。

```tsx
const onConnected = useEffectEvent(() => {
  showNotification('已连接', theme)
})

useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', onConnected)
  connection.connect()
  return () => connection.disconnect()
}, [roomId])
```

`roomId` 仍然决定连接，`theme` 只在 `onConnected` 真正被调用时读取。主题更新不会触发连接重建，但下一次连接
事件会看到新的主题。

### 4. 先问“什么变化应重新同步”

判断顺序应该是：

1. 找到外部系统的开始、停止和事件回调。
2. 列出哪些值变化后必须停止旧系统并创建新系统。
3. 把这些值保留在 Effect 和依赖数组中。
4. 找到只在外部事件发生时使用、但不应改变同步目标的读取。
5. 只把第 4 类逻辑提取为 Effect Event。

“我不想让某个值出现在依赖数组中”不是使用 Effect Event 的充分理由。必须先证明这个值不会改变当前同步过程。

## 四、`useEffectEvent` 的 API 合同

### 1. 在组件顶层创建 Effect Event

```tsx
import { useEffect, useEffectEvent } from 'react'

function ChatRoom({ roomId, theme }: { roomId: string; theme: 'light' | 'dark' }) {
  const onConnected = useEffectEvent(() => {
    showNotification('已连接', theme)
  })

  useEffect(() => {
    // 使用 roomId 建立连接，并在连接事件中调用 onConnected
  }, [roomId])

  return null
}
```

`useEffectEvent` 是 Hook，必须在组件或自定义 Hook 的顶层调用。它不能放在条件分支、循环、事件处理器或 Effect
回调内部。

### 2. 回调可以接收参数并返回值

回调可以接收任意数量的参数，也可以返回任意类型。返回的 Effect Event 保留相同的函数签名：

```tsx
type RoomId = 'alpha' | 'beta'

const formatConnection = useEffectEvent((connectedRoomId: RoomId) => {
  return `${connectedRoomId} 已连接，主题为 ${theme}`
})
```

上例中的 `formatConnection` 只能从同一组件的 Effect 逻辑调用。不要因为它返回字符串，就把它当作 render 阶段的
普通格式化函数；render 中不能调用 Effect Event。

### 3. 调用时读取最新已提交值

每次 render 都会得到一份新的 Props 和 State 快照。Effect Event 被调用时，会读取最近一次已经提交到屏幕的快照：

```tsx
const onConnected = useEffectEvent(() => {
  showNotification('已连接', theme)
})
```

如果 `theme` 从 `light` 更新为 `dark`，外围 `[roomId]` Effect 不会重建连接；当连接稍后发出 `connected` 事件时，
`onConnected` 读取的是已经提交的 `dark`。

“最新”指最新已提交值，不代表某个尚未提交、被中断或被丢弃的 render。业务代码只应依赖 React 对已提交 UI 的行为。

### 4. 返回函数的身份不稳定

Effect Event 函数的身份每次 render 都会变化。这是有意的设计，不是稳定回调，也不能像 State setter 或某些 ref
对象那样省略身份变化的考虑。

```tsx
const onConnected = useEffectEvent(() => {
  showNotification('已连接', theme)
})

useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', onConnected)
  return () => connection.disconnect()
}, [roomId, onConnected]) // 错误：Effect Event 不应加入依赖
```

把它放入依赖数组会让每次 render 都可能重新建立连接。正确做法是从数组中省略 Effect Event，并只列出外围
Effect 直接使用、且真正决定同步的响应值。

## 五、把混合逻辑拆开

### 1. 先保留完整的响应写法

连接和通知混在一起时，先如实列出所有直接读取的响应值：

```tsx
useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', () => showNotification('已连接', theme))
  connection.connect()
  return () => connection.disconnect()
}, [roomId, theme])
```

此时依赖数组描述的是现有代码，而不是期望的执行次数。不要先删掉 `theme` 再期待 lint 或 React 推断你的意图。

### 2. 把真正的事件逻辑提取出来

将连接成功后的通知移动到 Effect Event：

```tsx
const onConnected = useEffectEvent(() => {
  showNotification('已连接', theme)
})

useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', onConnected)
  connection.connect()
  return () => connection.disconnect()
}, [roomId])
```

移动后，外围 Effect 不再直接读取 `theme`。它只负责创建连接、登记事件和清理连接，依赖因此准确缩小为
`[roomId]`。

### 3. 把事件携带的数据显式作为参数

连接事件可能携带它实际连接的房间。这个房间身份属于事件本身，应从 Effect 的 listener 传入：

```tsx
const onConnected = useEffectEvent((connectedRoomId: RoomId) => {
  showNotification(`${connectedRoomId} 已连接`, theme)
})

useEffect(() => {
  const connection = createConnection(roomId)
  const handleConnected = () => onConnected(roomId)
  connection.on('connected', handleConnected)
  connection.connect()
  return () => {
    connection.off('connected', handleConnected)
    connection.disconnect()
  }
}, [roomId])
```

这样读代码时可以直接看出：`roomId` 是此次连接的响应输入，`theme` 是事件发生时附加读取的最新配置。不要把
`roomId` 也藏进 Effect Event，否则房间改变时就失去重新连接的条件。

### 4. 保持建立和清理对称

Effect Event 只负责事件发生后的局部逻辑，不负责管理连接本身。连接的注册、注销、建立和断开仍然属于同一个
Effect：

```tsx
useEffect(() => {
  const connection = createConnection(roomId)
  const handleConnected = () => onConnected(roomId)

  connection.on('connected', handleConnected)
  connection.connect()

  return () => {
    connection.off('connected', handleConnected)
    connection.disconnect()
  }
}, [roomId])
```

每次 `roomId` 改变时，React 先清理旧连接，再建立新连接。主题变化只会产生新的 render，不会触碰这套连接资源。

### 5. 多个同步过程要分别判断

如果一个组件同时订阅消息和记录页面访问，不要把所有回调都放进同一个 Effect Event。先区分各自的同步条件，再
决定是否拆成两个 Effect。一个 Effect 应描述一个可以独立开始、停止和重新同步的外部过程。

## 六、最新值与显式事件参数

### 1. 配置值适合从 Effect Event 中读取

主题、静音开关、通知偏好等值常常只影响事件发生时的表现，不改变订阅对象。它们适合由 Effect Event 在调用时读取：

```tsx
const onMessage = useEffectEvent((message: string) => {
  if (!muted) {
    showNotification(message, theme)
  }
})

useEffect(() => {
  const subscription = subscribeToRoom(roomId, (message) => onMessage(message))
  return () => subscription.unsubscribe()
}, [roomId])
```

`roomId` 改变时重新订阅；`muted` 或 `theme` 改变时不重新订阅，但下一条消息会使用最新设置。

### 2. 事件身份适合通过参数传递

事件发生时产生的数据不应该依赖某个旧闭包猜测。页面访问地址、收到的消息、连接对应的房间等事件身份，应作为
参数传给 Effect Event：

```tsx
const onVisit = useEffectEvent((visitedUrl: string) => {
  logVisit(visitedUrl, cartItemCount)
})

useEffect(() => {
  onVisit(url)
}, [url])
```

`url` 决定页面访问记录，因此保留在外围 Effect 的依赖中；`cartItemCount` 只在记录发生时读取最新值，不会因为
购物车数量变化而重新记录同一次访问。

### 3. 事件参数和闭包读取可以同时存在

一个 Effect Event 可以接收事件自身的数据，也可以读取当前的配置：

```tsx
const onUploadFinished = useEffectEvent((fileName: string, byteLength: number) => {
  showNotification(`${fileName}（${byteLength} 字节）`, theme)
})
```

`fileName` 和 `byteLength` 是该次事件的事实，`theme` 是调用时的最新界面配置。不要把事件参数复制到 State 再用
另一个 Effect 观察，这会增加无关的 render 和同步链。

### 4. 区分“值变化”与“事件发生”

值变化本身不一定代表业务事件：

- `roomId` 变化代表连接目标变化，属于响应条件。
- `theme` 变化只代表下一次通知的外观变化，不代表连接成功事件再次发生。
- `cartItemCount` 变化不代表用户再次访问页面。
- `message` 输入变化不代表用户已经点击发送。

如果逻辑应该由用户动作触发，使用普通事件处理器；如果逻辑应该由外部系统事件触发但只需读取最新配置，使用
Effect Event；如果逻辑应该随值变化持续同步，保留普通 Effect 和完整依赖。

## 七、依赖数组与 lint 边界

### 1. Effect Event 不是删依赖的工具

下面的写法把真正的响应值藏起来了：

```tsx
const connect = useEffectEvent(() => {
  return createConnection(roomId)
})

useEffect(() => {
  const connection = connect()
  connection.connect()
  return () => connection.disconnect()
}, [])
```

`roomId` 决定连接目标，房间变化后必须重新连接。把它放入 Effect Event 并使用空数组，只是隐藏了缺少的依赖，
不会改变同步需求。

正确写法是让 `roomId` 留在外围 Effect：

```tsx
useEffect(() => {
  const connection = createConnection(roomId)
  connection.connect()
  return () => connection.disconnect()
}, [roomId])
```

### 2. Effect Event 必须从依赖数组中省略

Effect Event 的函数身份不稳定。它的用途就是从外围 Effect 中读取最新值，而不是成为外围 Effect 的响应条件：

```tsx
const onConnected = useEffectEvent(() => showNotification('已连接', theme))

useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', onConnected)
  return () => connection.disconnect()
}, [roomId])
```

如果 lint 报告其他响应值缺失，应修正代码或依赖；不要用 `eslint-disable`、`oxlint-disable` 或空数组掩盖问题。

### 3. 不要把普通函数误当成 Effect Event

普通函数在 Effect 中被直接调用时，仍然按照 JavaScript 闭包读取值：

```tsx
function showCurrentTheme() {
  showNotification(theme)
}

useEffect(() => {
  subscribe(() => showCurrentTheme())
}, [])
```

如果 `theme` 没有进入依赖，普通函数会保留旧值；如果把 `theme` 加入依赖，订阅会随主题重建。只有明确把这段
读取声明为 Effect Event，才获得“调用时读取最新已提交值”的合同。

### 4. 不要用 `useCallback` 包住 Effect Event

`useCallback` 的职责是根据依赖缓存普通函数身份，不能改变 Effect Event 的调用位置规则，也不能把 Effect Event
变成可传递的通用回调：

```tsx
const onConnected = useCallback(
  useEffectEvent(() => showNotification('已连接', theme)),
  [],
)
```

上例同时违反 Hook 调用和依赖语义。直接在组件顶层调用 `useEffectEvent`，将返回值限制在所属 Effect 逻辑中。

### 5. 不要用 Ref 手写“最新值”替代

过去常见的写法是每次 render 把 `theme` 写入 Ref，再在外部监听器中读取 `themeRef.current`。这种写法需要手动
维护同步、容易漏掉更新，并且无法表达调用位置和依赖规则。对于本来就是 Effect 事件的逻辑，使用公开的
`useEffectEvent` 更清晰。

## 八、调用位置与组件边界

### 1. 合法调用路径

Effect Event 的返回函数可以在同一组件的下列 Effect 逻辑中调用：

- `useEffect` 的 setup 中登记的外部事件回调；
- `useLayoutEffect` 或 `useInsertionEffect` 的 Effect 逻辑；
- 同一组件中另一个 Effect Event 的调用逻辑。

这里的调用位置规则只说明 API 合同，不改变各类 Effect 的用途。连接、订阅和普通页面同步仍应选择符合实际时序的
Effect。

### 2. 不要在 render 中调用

下面的调用会把外部事件逻辑提前到 render 阶段：

```tsx
const notice = onConnected()
return <p>{notice}</p>
```

render 必须保持纯度，不能因为计算 JSX 就触发通知、写日志或修改外部系统。Effect Event 只能等所属 Effect 管理的
事件真正发生后再调用。

### 3. 不要从普通点击处理器调用

按钮点击属于用户事件，直接使用普通处理器表达：

```tsx
function handleSave() {
  saveDraft(draft)
}

return <button onClick={handleSave}>保存</button>
```

不要把 `onConnected` 直接交给 `onClick`。如果按钮只是模拟外部连接事件，应调用连接替身的公开方法，由连接对象
已经登记的 listener 再调用 Effect Event。

### 4. 不要传给子组件或其他 Hook

Effect Event 不是组件通信回调：

```tsx
<Child onConnected={onConnected} />
```

传给子组件后，子组件可能在 render 或普通事件中调用它，调用边界就不再由创建它的 Effect 控制。需要组件通信时，
定义普通的 prop 回调；需要复用有状态逻辑时，重新设计自定义 Hook 的公开接口，而不是转交 Effect Event 函数。

### 5. 自定义 Hook 仍须保持局部

自定义 Hook 可以在自己的顶层调用 `useEffectEvent`，但返回的 Effect Event 仍只能由该 Hook 管理的 Effect 逻辑调用。
不要把它作为通用工具函数导出，也不要让调用者把它当作普通回调传递到任意组件。

## 九、常见使用模式

### 1. 房间连接与通知

这是最典型的组合：连接地址或房间决定同步，通知主题只在连接事件发生时读取。

```tsx
const onConnected = useEffectEvent((connectedRoomId: string) => {
  showNotification(`${connectedRoomId} 已连接`, theme)
})

useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', () => onConnected(roomId))
  connection.connect()
  return () => connection.disconnect()
}, [roomId])
```

切换主题不会重连；切换房间会重连；新的连接事件使用新主题。

### 2. 长期订阅与最新设置

事件监听器通常需要保持订阅对象不变，同时读取最新的开关或显示设置：

```tsx
const onMessage = useEffectEvent((message: Message) => {
  if (!muted) renderMessage(message, theme)
})

useEffect(() => {
  const unsubscribe = subscribeToRoom(roomId, onMessage)
  return unsubscribe
}, [roomId])
```

`roomId` 改变时替换订阅；`muted` 和 `theme` 改变时不替换订阅，下一条消息仍读取最新设置。若订阅 API 会把事件
身份作为参数传入，优先直接使用参数，不从旧闭包猜测事件内容。

### 3. 定时器与最新增量

计时器的周期可能由一个响应值决定，而每次 tick 使用的增量只需最新值：

```tsx
const onTick = useEffectEvent(() => {
  setCount((current) => current + increment)
})

useEffect(() => {
  const timerId = setInterval(onTick, interval)
  return () => clearInterval(timerId)
}, [interval])
```

`interval` 变化需要重建计时器，`increment` 变化只影响下一次 tick。计时器清理仍属于 Effect；Effect Event 只处理
tick 发生后的逻辑。

### 4. 页面访问与购物车数量

页面 URL 决定一次访问记录何时产生，购物车数量只是记录发生时的附加信息：

```tsx
const onVisit = useEffectEvent((visitedUrl: string) => {
  logVisit(visitedUrl, numberOfItems)
})

useEffect(() => {
  onVisit(url)
}, [url])
```

URL 改变会记录新的访问；购物车数量变化不会伪造新的访问，但下一次 URL 变化会带上最新数量。

## 十、易错使用提示

:::pitfalls
### 错误：把真正的同步条件移入 Effect Event

**触发条件：** `roomId` 只在 Effect Event 中读取，外围连接 Effect 使用空依赖数组。

**原因：** `roomId` 决定连接目标，本来就应该触发重新同步，不能被标记成非响应读取。

**后果：** 房间切换后不会建立新连接，界面和外部系统停留在不同房间。

**错误示例：**

```tsx
const connect = useEffectEvent(() => createConnection(roomId))
useEffect(() => {
  const connection = connect()
  connection.connect()
  return () => connection.disconnect()
}, [])
```

**正确写法：**

```tsx
useEffect(() => {
  const connection = createConnection(roomId)
  connection.connect()
  return () => connection.disconnect()
}, [roomId])
```

**验证方式：** 切换房间必须清理旧连接并建立新连接，建连次数增加一次。

### 错误：主题已经提取，却又放回依赖数组

**触发条件：** 通知已经提取为 Effect Event，依赖数组仍包含 `theme` 或 `onConnected`。

**原因：** 外围 Effect 已不再直接读取 `theme`，Effect Event 的函数身份也不稳定。

**后果：** 主题变化或其他无关 render 会断开并重建连接。

**错误示例：**

```tsx
const onConnected = useEffectEvent(() => showNotification(theme))
useEffect(() => subscribe(roomId, onConnected), [roomId, theme, onConnected])
```

**正确写法：**

```tsx
const onConnected = useEffectEvent(() => showNotification(theme))
useEffect(() => {
  const unsubscribe = subscribe(roomId, onConnected)
  return unsubscribe
}, [roomId])
```

**验证方式：** 切换主题时建连次数不变，切换房间时只增加一次。

### 错误：从按钮直接调用 Effect Event

**触发条件：** 把 Effect Event 直接赋给按钮的 `onClick`。

**原因：** 按钮点击是普通用户事件，不属于 Effect 管理的外部事件调用路径。

**后果：** 调用位置违反 Hook 合同，用户动作和外部系统事件的含义混在一起。

**错误示例：**

```tsx
<button onClick={onConnected}>连接完成</button>
```

**正确写法：**

```tsx
useEffect(() => {
  connection.on('connected', onConnected)
  return () => connection.off('connected', onConnected)
}, [connection])

<button onClick={() => connection.emitConnected()}>触发连接事件</button>
```

**验证方式：** 代码检查确认按钮只调用连接对象，`onConnected` 只出现在 Effect 登记的 listener 中。

### 错误：把 Effect Event 传给子组件

**触发条件：** 把 Effect Event 作为 prop 传给子组件。

**原因：** 子组件无法保证只从创建它的 Effect 逻辑调用该函数。

**后果：** 子组件可能在 render 或普通事件中调用它，调用边界和数据流都失去局部性。

**错误示例：**

```tsx
<NotificationButton onNotify={onConnected} />
```

**正确写法：**

```tsx
function handleNotify() {
  showNotification(theme)
}

<NotificationButton onNotify={handleNotify} />
```

**验证方式：** 组件 prop 只接收普通回调，Effect Event 没有离开创建它的组件。

### 错误：用 Effect Event 隐藏页面 URL 依赖

**触发条件：** 页面访问 Effect 使用空数组，`url` 只由 Effect Event 闭包读取。

**原因：** URL 改变本来就表示一次新的页面访问，属于真正的响应条件。

**后果：** 路由变化后不会记录新的访问，统计数据缺失。

**错误示例：**

```tsx
const logVisit = useEffectEvent(() => sendVisit(url))
useEffect(() => logVisit(), [])
```

**正确写法：**

```tsx
const onVisit = useEffectEvent((visitedUrl: string) => sendVisit(visitedUrl, numberOfItems))
useEffect(() => onVisit(url), [url])
```

**验证方式：** URL 每变化一次新增一条记录，购物车数量单独变化不重复记录。

### 错误：把所有 Effect 代码都包进去

**触发条件：** 连接创建、连接和清理全部放进 Effect Event，外围 Effect 使用空数组。

**原因：** Effect Event 只适合事件发生后的非响应片段，不能替代外部资源的响应生命周期。

**后果：** 真正需要重连的值被隐藏，连接清理和重新建立都无法跟随目标变化。

**错误示例：**

```tsx
const synchronize = useEffectEvent(() => {
  const connection = createConnection(roomId)
  connection.connect()
  return () => connection.disconnect()
})
useEffect(() => synchronize(), [])
```

**正确写法：**

```tsx
const onConnected = useEffectEvent(() => showNotification(theme))
useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', onConnected)
  connection.connect()
  return () => connection.disconnect()
}, [roomId])
```

**验证方式：** 连接资源的创建和清理位于普通 Effect，Effect Event 只包含通知逻辑。

### 错误：把 `useRef` 当成通用替代

**触发条件：** 每次 render 手动写入 `themeRef.current`，长期监听器只读取 Ref。

**原因：** Ref 写法需要人工保持同步，不能表达 Effect Event 的局部调用和依赖省略合同。

**后果：** 容易漏写 Ref 更新或连真正的响应依赖也一起隐藏，代码审查无法直接看出响应边界。

**错误示例：**

```tsx
const themeRef = useRef(theme)
themeRef.current = theme
useEffect(() => subscribe(() => showNotification(themeRef.current)), [])
```

**正确写法：**

```tsx
const onMessage = useEffectEvent(() => showNotification(theme))
useEffect(() => {
  const unsubscribe = subscribe(onMessage)
  return unsubscribe
}, [])
```

**验证方式：** 删除手写最新值 Ref 后，配置变化不重订阅，下一次外部消息仍使用最新主题。

### 错误：误把最新值理解为未提交值

**触发条件：** 在同一个点击处理器中先更新 State，再直接调用 Effect Event，并期待它读取尚未提交的新值。

**原因：** Effect Event 读取调用时最新已提交的 Props 和 State，而且不能从普通点击处理器调用。

**后果：** 代码既违反调用位置限制，又把未提交 render 当成外部系统可以观察的状态。

**错误示例：**

```tsx
function handleDarkMode() {
  setTheme('dark')
  onConnected()
}
```

**正确写法：**

```tsx
function handleDarkMode() {
  setTheme('dark')
}

useEffect(() => {
  connection.on('connected', onConnected)
  return () => connection.off('connected', onConnected)
}, [connection])
```

**验证方式：** 先让主题更新提交，再由连接对象触发外部事件；通知读取已提交的深色主题。
:::

## 十一、源码推导与适用场景

React 的公开合同确定了三条基础事实：Effect Event 只能由 Effect 或同一组件中的其他 Effect Event
调用；它在调用时读取最新已提交的 Props 和 State；返回函数的身份不稳定，因此必须从 Effect 依赖中
省略。基于这些事实，可以按下面的顺序选择处理方式。

可以用下面的顺序快速判断：

1. 逻辑是否由用户点击、输入或提交直接触发？是则使用普通事件处理器。
2. 逻辑是否需要让外部系统持续与某个值同步？是则使用 Effect，并完整声明响应依赖。
3. 逻辑是否由 Effect 管理的外部事件触发，但只需要调用时的最新配置？是则提取为 Effect Event。
4. 逻辑是否只是当前 Props/State 的纯计算？是则在 render 中计算，不创建 Effect。
5. 一个 Effect 是否管理多个可以独立开始和停止的外部过程？是则拆成多个 Effect，再分别判断每个事件回调。

不要用 Effect Event 解决普通事件处理器、派生数据、组件通信或缺少依赖的问题。它只解决“同一外部同步过程中的
事件逻辑需要最新值，但不应触发同步重建”这一种边界。

## 十二、用法示例或 Demo

下面的 Demo 用本地连接替身表示外部系统：房间改变时 Effect 建立新连接，主题改变时不建新连接；点击按钮会让
连接替身发布 `connected` 事件，Effect Event 在事件发生时读取当前主题。

:::demo{id="react.core.learn.intermediate.effect-events.latest-notification-demo"}
:::

观察顺序：

1. 冷启动显示 `alpha`、`light` 和当前 Effect 建连次数。
2. 切换为深色主题，建连次数保持不变。
3. 触发连接事件，最近通知显示 `alpha / dark`。
4. 切换房间为 `beta`，建连次数增加一次，旧连接被清理。
5. 切换回浅色主题，建连次数再次保持不变；触发事件后通知显示 `beta / light`。
6. 重置后回到新的冷启动状态，旧连接不能继续发布通知。

开发环境可能对 Effect 做额外的 setup/cleanup 检查，因此冷启动次数由运行环境决定；比较主题变化和房间变化时，
应观察相对变化，而不是把某个绝对次数当成业务版本号。

## 十三、练习

:::exercise
### 练习一：拆分房间连接和通知主题

**要求：** 将同时读取 `roomId` 与 `theme` 的连接 Effect 改为 `useEffectEvent` 加 `[roomId]` 的结构。连接事件
必须通过 listener 调用 Effect Event，不能从按钮直接调用。

**验收：** 切换主题不增加建连次数；触发事件时通知使用新主题；切换房间增加一次建连并使用新的房间身份。
:::

:::exercise
### 练习二：显式传递访问地址

**要求：** 编写 `onVisit(visitedUrl)`，让 Effect 在 URL 改变时传入 URL，让 Effect Event 读取最新的购物车数量。

**验收：** URL 改变会产生一条新记录；购物车数量改变不会重复记录；下一次 URL 改变会使用最新数量。
:::

:::exercise
### 练习三：判断调用位置

**要求：** 判断以下调用是否符合 Effect Event 合同，并说明原因：Effect 内的订阅 listener、组件 render、按钮
`onClick`、传给子组件的 prop、同一组件的另一个 Effect Event。

**验收：** 只有 Effect 内 listener 和同一组件的另一个 Effect Event 属于合法调用路径；其余位置要改为普通函数、
普通事件处理器或由子组件接收的普通回调。
:::

:::exercise
### 练习四：找出被隐藏的真正依赖

**要求：** 检查一个把 `roomId` 读取放进 Effect Event、外围 Effect 使用 `[]` 的连接示例。指出哪个值决定同步，
并把连接创建移回外围 Effect。

**验收：** `roomId` 出现在连接 Effect 和 `[roomId]` 中，Effect Event 只读取不应触发重连的最新配置。
:::

## 十四、本节小结

1. 先判断什么变化需要停止旧外部过程并重新同步，再决定是否使用 Effect Event。
2. Effect Event 处理 Effect 管理的外部事件逻辑，调用时读取最新已提交的 Props 和 State。
3. 真正决定连接、订阅或计时器的响应值必须留在外围 Effect 和依赖数组中。
4. 事件自身携带的身份通过参数显式传入，只需最新的主题、静音或数量等配置从 Effect Event 中读取。
5. Effect Event 必须从依赖数组中省略，返回函数身份不稳定，不能作为稳定回调、组件 prop 或普通点击处理器。
6. 连接资源的建立、登记、注销和清理仍由 Effect 管理，Effect Event 不替代生命周期或依赖判断。

## 十五、参考资料

- [`useEffectEvent`](https://react.dev/reference/react/useEffectEvent) - API 签名、最新已提交值、调用位置和身份规则。
- [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects) - 响应逻辑与非响应逻辑的
  划分、连接通知和显式事件参数。
- [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies) - 只移出不应触发同步的
  最新值读取，不能用 Effect Event 隐藏真正依赖。
- [React 19.2 发布说明](https://react.dev/blog/2025/10/01/react-19-2#use-effect-event) - `useEffectEvent` 的
  React 19.2 能力定位。
