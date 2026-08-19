# 实战：可切换聊天室官方调研记录

## 调研范围

- 主题：把 Effect 生命周期、完整依赖、Effect Event、自定义 Hook 与根级 Strict Mode 组合成一个可切换聊天室。
- 教学层级：本科中级。
- 核验日期：`2026-08-17`。
- React 公共文档基线：React `19.2`。
- 本地运行时快照：`react@19.2.8`、`react-dom@19.2.8`。
- 固定 React 文档提交：`383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`。
- React `v19.2.8` 标签提交：`1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。

本记录只核验公开教学所需的 React 行为，不把 Fiber、Effect flag、调度队列或开发工具实现写成应用代码可以依赖的
合同。聊天室是本地确定性外部系统替身，不表示已经实现真实网络协议、多人通信或服务器容错。

## 调研方式与证据边界

1. 当前工具上下文没有可调用的 Tavily、Exa、Parallel 或 Perplexity 搜索工具，因此没有使用搜索摘要发现来源。
2. 直接读取已知的 `react.dev/*.md` 官方 Markdown URL，逐段核验 Effect、Effect Event、自定义 Hook 与 Strict
   Mode 的公开合同。
3. 使用 `git ls-remote` 固定 `reactjs/react.dev` 当前文档提交和 React `v19.2.8` 标签提交；固定提交只用于让
   文档证据可重复定位。
4. 本课结论由 React 官方公开文档充分支撑，不需要引用运行时内部源码。源码标签只记录当前仓库版本身份，不用来
   扩大公共 API 承诺。
5. 不采用社区文章、搜索摘要、GitHub Issue、浏览器偶然日志或某个开发构建的调用次数作为通用规范。

## 官方来源

| ID | 官方来源 | 采用范围 |
| --- | --- | --- |
| `R0` | [React Versions](https://react.dev/versions#latest-version) | `react.dev` 当前公共文档基线为 React `19.2`。 |
| `R1` | [`useEffect`](https://react.dev/reference/react/useEffect) | Effect 用于同步外部系统；setup、cleanup、完整依赖、依赖变化顺序和开发期压力检查。 |
| `R2` | [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) | Effect 是可独立开始和停止的同步过程；依赖变化时先停止旧同步，再开始新同步。 |
| `R3` | [`useEffectEvent`](https://react.dev/reference/react/useEffectEvent) | 最新已提交值、非稳定身份、调用位置、依赖省略与禁止逃避依赖。 |
| `R4` | [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies#do-you-want-to-read-a-value-without-reacting-to-its-changes) | 把真正不应触发重同步、但需要读取最新值的逻辑提取为 Effect Event。 |
| `R5` | [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks#passing-reactive-values-between-hooks) | 自定义 Hook 封装有状态逻辑；参数保持响应性；每次调用彼此独立。 |
| `R6` | [Passing event handlers to custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks#passing-event-handlers-to-custom-hooks) | Hook 内部用 Effect Event 包装事件回调，连接 Effect 只保留服务器与房间依赖。 |
| `R7` | [`<StrictMode>`](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-effects-in-development) | 根级开发模式额外执行 Effect setup/cleanup 周期，用于发现缺失 cleanup。 |
| `R8` | [局部 Strict Mode 的根级差异](https://react.dev/reference/react/StrictMode#enabling-strict-mode-for-a-part-of-the-app) | 非根级 Strict Mode 初次挂载不会额外重跑 Effect；不能把根级计数推广到所有边界。 |
| `R9` | [Resetting state with a key](https://react.dev/learn/preserving-and-resetting-state#resetting-state-with-a-key) | 改变 `key` 会让 React 重新创建该位置的组件 State，适合作为完整实例重置边界。 |

固定 React 文档证据位于官方 `reactjs/react.dev` 仓库：

- [`useEffect.md`](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useEffect.md)
- [`lifecycle-of-reactive-effects.md`](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/lifecycle-of-reactive-effects.md)
- [`useEffectEvent.md`](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useEffectEvent.md)
- [`removing-effect-dependencies.md`](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/removing-effect-dependencies.md)
- [`reusing-logic-with-custom-hooks.md`](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/reusing-logic-with-custom-hooks.md)
- [`StrictMode.md`](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/StrictMode.md)
- [`preserving-and-resetting-state.md`](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/preserving-and-resetting-state.md)

## 事实账本

| 编号 | 可落地事实 | 来源 | 边界 |
| --- | --- | --- | --- |
| `F01` | `useEffect` 用来让组件与 React 外部系统保持同步。 | `R1` | 没有外部系统时不应为了整理数据流而添加 Effect。 |
| `F02` | setup 可以返回 cleanup；依赖变化后先以旧值运行 cleanup，再以新值运行 setup；组件移除时运行最后一次 cleanup。 | `R1`、`R2` | cleanup 撤销本轮 setup 创建的同一资源，不读取另一轮连接作为替代。 |
| `F03` | Effect 直接读取的 props、state 和组件体变量都是响应值，必须完整写入固定长度的内联依赖数组。 | `R1`、`R2` | 依赖由代码决定，不是作者挑选的执行次数开关。 |
| `F04` | 服务器地址或房间标识变化会改变连接目标，因此必须使连接 Effect 重新同步。 | `R1`、`R2` | 不能把连接目标移入 Effect Event 来隐藏依赖。 |
| `F05` | 消息草稿、主题和其他未被连接 setup/cleanup 直接读取的 State 不属于连接 Effect 的依赖。 | `R1` | 只有在代码边界确实如此时才能省略；不能先删依赖再声称它与连接无关。 |
| `F06` | Effect Event 在调用时读取最新已提交 render 的 props 与 state，而不让外围 Effect 因这些读取重新同步。 | `R3`、`R4` | “最新”指最新已提交值，不包括尚未提交或被丢弃的 render。 |
| `F07` | 主题 State 本身仍是响应值；只有“连接事件发生时按最新主题显示通知”这段逻辑相对连接过程是非响应式的。 | `R3`、`R4` | 不能笼统地说主题不响应，也不能把决定连接目标的值同样放入 Effect Event。 |
| `F08` | Effect Event 必须从外围 Effect 依赖中省略，且它的函数身份故意不稳定。 | `R3` | 不用 `useCallback` 稳定它，不比较其身份，不把它作为普通回调跨边界传递。 |
| `F09` | Effect Event 只能由同一组件或自定义 Hook 内的 Effect、其他 Effect Event 调用。 | `R3` | 不能在 render、按钮点击处理器中直接调用，也不能传给其他组件或 Hook。 |
| `F10` | 自定义 Hook 可以封装连接 Effect；传入 Hook 的服务器与房间参数仍会随组件 render 更新。 | `R5`、`R6` | 抽取 Hook 不会冻结参数，也不会取消依赖规则。 |
| `F11` | 自定义 Hook 复用的是有状态逻辑，不是同一份 State；每次 Hook 调用相互独立。 | `R5` | 多个聊天室若要共享连接或消息，需要另外设计共同所有者，不能靠同名 Hook 自动共享。 |
| `F12` | 自定义 Hook 接收普通事件回调时，可以在 Hook 内用 `useEffectEvent` 包装，再从 Hook 自己的 Effect 调用。 | `R6` | 调用方传入的是普通回调，不是把已经创建的 Effect Event 传进 Hook。 |
| `F13` | 根级 `<StrictMode>` 在开发环境为每个 Effect 增加一次 setup/cleanup 周期。 | `R1`、`R7` | 这些检查不影响生产构建，业务行为不能依赖额外周期存在。 |
| `F14` | 正确 cleanup 后，开发期 `setup -> cleanup -> setup` 与生产期一次 setup 应具有相同稳定外部状态。 | `R1`、`R7` | 目标是资源对称，不是用 Ref 或条件分支阻止第二次 setup。 |
| `F15` | 非根级 Strict Mode 初次挂载不会额外重跑 Effect。 | `R8` | `setup 2 / cleanup 1` 只适用于根级 Strict Mode 覆盖下的开发初挂载观察。 |
| `F16` | 改变组件 `key` 会销毁旧实例 State 并创建新实例 State。 | `R9` | 重置依赖组件身份，不是直接修改内部 Hook State 的特殊 API。 |

## 外部系统模型

### 1. 本地连接替身

聊天室需要一个确定性的 `ChatConnection`，只模拟外部资源合同：

- 构造参数至少包含 `serverUrl` 与 `roomId`，两项共同标识当前连接目标。
- `connect()` 建立当前实例的连接资源。
- `disconnect()` 只撤销当前实例已经建立的资源。
- 可通过连接事件通知“已连接”，也可接收当前连接内的本地消息。
- `send(message)` 只记录或回显当前消息，不发真实网络请求。

这个类位于 React 之外，因此即使它和组件写在同一个 TSX 文件中，仍属于 Effect 要同步的外部系统。教学重点是
资源所有权、依赖与生命周期，不是 WebSocket、重试、鉴权、心跳、消息顺序或持久化。

### 2. 单一连接不变量

任一稳定时刻只允许当前聊天室实例拥有一条活动连接：

```text
activeConnections = setupCount - cleanupCount
稳定状态：activeConnections = 1
实例移除后：activeConnections = 0
```

每次 setup 创建并连接一个新实例；该轮返回的 cleanup 捕获并断开同一个实例。不能让 cleanup 通过“当前连接”
可变引用猜测要关闭哪个资源，否则快速切换时可能误关新连接或遗留旧连接。

`connect()` 与 `disconnect()` 的日志可以用于观察，但日志本身不是 Effect 正确性的依据。正确性由“旧资源已撤销、
当前资源唯一且目标正确”共同决定。

## 自定义 Hook 合同

### 1. 职责边界

`useChatRoom` 负责完整的连接生命周期：

1. 接收当前 `serverUrl`、`roomId` 和只用于连接事件展示的 `theme`。
2. 在 Hook 顶层创建 Effect Event，用它读取最新已提交的主题。
3. 在 Hook 顶层声明一个连接 Effect。
4. setup 创建连接、注册连接事件并调用 `connect()`。
5. cleanup 注销或失效同一轮回调，并调用该连接的 `disconnect()`。
6. 如需让普通提交事件发送消息，只暴露普通函数或最小命令入口，不暴露可变连接实例。

Hook 名表达具体外部系统能力，不使用 `useMount`、`useOnceEffect` 或“只执行一次”之类生命周期包装。调用组件不需要
知道连接如何建立和清理，但仍必须通过参数明确给出连接目标。

### 2. 依赖形状

连接 Effect 的核心形状应保持可审查：

```tsx
const onConnected = useEffectEvent(() => {
  showConnectedNotice(theme)
})

useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.onConnected(() => onConnected())
  connection.connect()

  return () => {
    connection.disconnect()
  }
}, [serverUrl, roomId])
```

- `serverUrl` 与 `roomId` 决定连接目标，直接由 Effect 读取并完整列入依赖。
- `theme` 只决定连接通知的呈现，位于 Effect Event 中，不进入连接依赖。
- `onConnected` 是 Effect Event，必须从依赖中省略。
- 消息草稿和本地消息列表不被连接 setup/cleanup 读取，也不进入依赖。
- 连接对象在 setup 内创建，不进入依赖数组。

如果 setup 或 cleanup 实际又读取了认证范围、传输模式或其他组件体值，这些值也必须进入依赖。依赖不能因为示例
希望“少重连”而遗漏。

### 3. 连接事件与普通用户事件

连接成功通知是由 Effect 管理的外部连接事件，可以调用 Effect Event。发送消息是用户提交事件，应由普通表单事件
处理器发起，不能直接调用 Effect Event。

两条数据流必须分开：

```text
外部连接事件 -> Effect 注册的回调 -> Effect Event -> 读取最新主题
用户提交表单 -> 普通事件处理器 -> 发送命令 -> 更新消息与草稿
```

切换主题只更新通知所需的最新配置；发送消息只处理消息业务。二者都不改变连接目标，因此不应让连接 Effect
cleanup/setup。

## 重新同步顺序

### 1. 切换服务器或房间

当 `serverUrl` 或 `roomId` 改变并完成 commit，连接 Effect 按以下顺序重新同步：

```text
旧连接 cleanup -> 新连接 setup
disconnect(old target) -> connect(new target)
```

旧 cleanup 使用旧 render 捕获的连接实例和旧目标；新 setup 使用新 render 的服务器与房间。UI 可以先显示新的选项，
但外部系统最终必须只保留与当前选项一致的连接。

连续切换也不能把多个目标同时留在活动状态。每轮 cleanup 与 setup 必须自洽，而不是依赖“用户切换得足够慢”。

### 2. 切换主题

主题变化会触发组件 render 和 commit，但不会改变 `[serverUrl, roomId]`。因此：

- 连接不 cleanup。
- 连接不重新 setup。
- 活动连接仍为同一个实例。
- 之后发生的连接事件通过 Effect Event 读取新主题。

不能仅凭“连接次数没变”证明最新主题读取正确，还要触发一次受 Effect 管理的事件并观察通知使用新主题。

### 3. 提交消息

有效消息提交属于普通用户事件：

- 空白消息不提交。
- 有效消息进入当前实例的消息记录，草稿随后清空。
- 提交过程不改变服务器或房间。
- 连接 setup、cleanup 与活动连接数保持不变。

消息是本地确定性回显，不承诺网络确认、失败重试、并发顺序或跨房间历史保存。

## Strict Mode 资源对称性

### 1. 根级开发初挂载

在根级 `<StrictMode>` 覆盖、开发构建、单个连接 Effect、计数器记录每次 setup/cleanup 且计数所有权在压力周期中
持续存在的前提下，稳定后的观察值应为：

```text
setupCount = 2
cleanupCount = 1
activeConnections = 1
```

调用序列是：

```text
setup(first) -> cleanup(first) -> setup(current)
```

第一个连接必须被清理，第二个连接是当前唯一活动资源。若最终活动数为 `2`，说明 cleanup 缺失或没有撤销同一轮
setup；若通过“已经运行过”Ref 跳过第二次 setup，只是隐藏压力检查，不能证明真实卸载、依赖切换或未来恢复正确。

### 2. 生产与局部边界

- 生产初挂载通常只有一次 setup，因此不能要求生产页面显示 `2 / 1 / 1`。
- `<StrictMode>` 只包裹非根级子树时，React 19.2 不会在初次挂载额外重跑 Effect。
- 因此精确次数是指定环境的验收证据，通用合同始终是 setup/cleanup 对称和稳定活动数正确。

### 3. 依赖变化与实例重置

依赖变化按正常更新路径增加一轮旧 cleanup 与新 setup，稳定活动数仍为 `1`。改变 `key` 会先移除旧实例并创建
新实例；旧实例必须执行最后 cleanup，新实例按它所处的 Strict Mode 环境运行初挂载检查。

若界面希望“重置后从新实例计数开始”，计数所有权必须与被 key 重建的实例一致；若计数器位于实例外，累计值就会
保留。两种设计都可以成立，但不能把局部实例计数和全局累计计数混为一谈。

## 状态与交互边界

### 1. 必要状态

- 当前服务器：决定连接目标。
- 当前房间：决定连接目标。
- 当前主题：决定通知呈现，不决定连接目标。
- 消息草稿：受控输入的临时值。
- 当前实例的消息记录：用于展示确定性发送结果。
- 重置键：只用于显式创建新的聊天室实例。

连接状态、活动连接数与 setup/cleanup 次数来自外部系统审计，不应再复制成一套会相互矛盾的业务 State。能够由审计
同步计算的活动数直接派生。

### 2. 切换后的消息边界

连接目标变化时，是否保留消息是产品 State 选择，不是 `useEffect` 自动规定的行为。本实战应冻结一种明确规则并让
界面与代码一致。为了突出资源切换，可让当前实例保留本地操作记录，同时让每条记录携带发生时的服务器和房间快照；
不能在 render 时用“当前房间”改写旧消息的来源。

显式重置通过新 `key` 创建完整的新聊天室实例，恢复初始服务器、房间、主题、草稿、消息和实例审计。外层页面若有
不属于聊天室实例的状态，不应被这个 key 一并销毁。

## 可观察验收合同

| 操作 | 连接 setup | 连接 cleanup | 活动连接 | 必须观察到的结果 |
| --- | --- | --- | --- | --- |
| 根级 Strict Mode 开发冷启动 | `2` | `1` | `1` | 第一轮资源已撤销，当前目标只保留一条连接。 |
| 切换主题 | 不变 | 不变 | `1` | 下一次连接事件使用最新主题。 |
| 切换服务器 | `+1` | `+1` | `1` | 先断开旧服务器，再连接新服务器。 |
| 切换房间 | `+1` | `+1` | `1` | 先退出旧房间，再连接新房间。 |
| 编辑消息草稿 | 不变 | 不变 | `1` | 只更新输入值。 |
| 提交有效消息 | 不变 | 不变 | `1` | 当前目标产生一条确定性消息记录，草稿清空。 |
| 提交空白消息 | 不变 | 不变 | `1` | 不新增记录。 |
| 以新 `key` 重置 | 旧实例最终 cleanup；新实例重新初挂载 | 取决于计数所有权 | 稳定为 `1` | 旧资源已关闭，新实例恢复固定初值。 |

精确计数验收必须同时固定开发模式、根级 Strict Mode 和计数所有权。浏览器只看到 `active = 1` 不足以证明冷启动
确实经历压力周期；只看到 `2 / 1` 也不足以证明当前连接目标正确。

## 高价值错误与修正

### 1. 把主题写进连接依赖

- **触发条件：** 连接成功通知需要使用当前主题，于是 Effect 直接读取 `theme`，并把它加入连接依赖。
- **原因：** 把“连接到哪里”的响应值与“连接事件发生时怎样展示通知”的最新值混成同一个同步过程。
- **后果：** 每次切换主题都会先断开当前连接再重新连接，产生与连接身份无关的资源抖动。
- **错误示例：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.onConnected(() => showToast(theme, '已连接'))
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId, theme])
```

- **正确示例：**

```tsx
const onConnected = useEffectEvent(() => showToast(theme, '已连接'))

useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.onConnected(onConnected)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])
```

- **适用版本：** React `19.2`。
- **来源：** `R3`、`R4`。

### 2. 隐藏服务器或房间依赖

- **触发条件：** 为了阻止重连，把依赖数组写成 `[]`，或把 `serverUrl`、`roomId` 放进 Effect Event 后从连接
  Effect 中省略。
- **原因：** 把决定外部资源身份的响应值误当成只需读取最新值的非响应逻辑。
- **后果：** 界面已经显示新服务器或新房间，外部连接仍停留在初始目标，显示状态与资源状态分离。
- **错误示例：**

```tsx
const connectLatestTarget = useEffectEvent(() => {
  createConnection(serverUrl, roomId).connect()
})

useEffect(() => {
  connectLatestTarget()
}, [])
```

- **正确示例：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])
```

- **适用版本：** React `19.2`。
- **来源：** `R1`、`R2`、`R3`。

### 3. 把 Effect Event 写进依赖数组

- **触发条件：** 创建 `onConnected` 后，按照普通函数依赖的处理方式把它加入连接 Effect 的依赖数组。
- **原因：** 忽略 `useEffectEvent` 返回函数不保证稳定身份，并且官方要求外围 Effect 从依赖中省略 Effect Event。
- **后果：** 普通 render 也可能触发连接 cleanup 和 setup，失去只按服务器与房间重新同步的合同。
- **错误示例：**

```tsx
const onConnected = useEffectEvent(() => showToast(theme, '已连接'))

useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.onConnected(onConnected)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId, onConnected])
```

- **正确示例：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.onConnected(onConnected)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])
```

- **适用版本：** React `19.2`。
- **来源：** `R3`。

### 4. 把 Effect Event 当成通用回调

- **触发条件：** 调用方先创建 Effect Event，再把它作为参数传进 `useChatRoom`；或从表单提交处理器直接调用它。
- **原因：** Effect Event 只用于 Effect 管理的外部事件路径，不是稳定回调、普通事件处理器或跨组件传递工具。
- **后果：** 调用位置脱离所属 Effect，代码违反 Hook 合同，也模糊了连接事件与用户事件的职责边界。
- **错误示例：**

```tsx
const onMessage = useEffectEvent((message: string) => appendMessage(message))
useChatRoom({ serverUrl, roomId, onMessage })

function handleSubmit() {
  onMessage(draft)
}
```

- **正确示例：**

```tsx
const { sendMessage } = useChatRoom({
  serverUrl,
  roomId,
  onConnected: () => showToast(theme, '已连接'),
})

function handleSubmit() {
  sendMessage(draft)
}
```

`useChatRoom` 在内部按需用 `useEffectEvent` 包装普通 `onConnected` 回调；提交事件继续调用普通命令函数。

- **适用版本：** React `19.2`。
- **来源：** `R3`、`R6`。

### 5. cleanup 断开可变的“当前连接”

- **触发条件：** 多轮 setup 共用模块变量或 Ref 保存连接，cleanup 再读取这个可变位置决定断开哪个资源。
- **原因：** cleanup 没有关闭本轮 setup 创建的资源，而是关闭执行 cleanup 时碰巧位于共享位置的资源。
- **后果：** 快速切换目标时可能断开新连接并遗留旧连接，活动连接数大于 `1`，旧目标继续发布事件。
- **错误示例：**

```tsx
const connectionRef = useRef<Connection | null>(null)

useEffect(() => {
  connectionRef.current = createConnection(serverUrl, roomId)
  connectionRef.current.connect()
  return () => connectionRef.current?.disconnect()
}, [serverUrl, roomId])
```

- **正确示例：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])
```

- **适用版本：** React `19.2`。
- **来源：** `R1`、`R2`。

### 6. 用 Ref 跳过 Strict Mode 的额外 setup

- **触发条件：** 开发环境看到 setup 多执行一次，于是用 `didConnect.current` 阻止后续 setup。
- **原因：** 把根级 Strict Mode 的资源压力检查当成重复业务事件，而没有修复 setup 与 cleanup 不对称的问题。
- **后果：** 压力检查被绕过；真实卸载后重新挂载时也可能无法恢复连接，缺失 cleanup 的泄漏继续存在。
- **错误示例：**

```tsx
const didConnect = useRef(false)

useEffect(() => {
  if (didConnect.current) return
  didConnect.current = true
  createConnection(serverUrl, roomId).connect()
}, [serverUrl, roomId])
```

- **正确示例：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])
```

- **适用版本：** React `19.2`；额外 setup/cleanup 仅属于开发期相应 Strict Mode 边界。
- **来源：** `R1`、`R7`。

### 7. 把精确 setup 次数当成通用保证

- **触发条件：** 看到开发冷启动 `setup 2 / cleanup 1`，便把它写成生产保证，或用于断言任意局部 Strict Mode。
- **原因：** 没有固定开发/生产模式、Strict Mode 是否覆盖根节点、Effect 数量与计数器所有权。
- **后果：** 生产构建或局部 Strict Mode 下出现不同计数时产生错误告警，甚至把正确行为误判为泄漏。
- **错误示例：**

```tsx
if (setupCount !== 2 || cleanupCount !== 1) {
  throw new Error('连接生命周期异常')
}
```

- **正确示例：**

```tsx
const resourceIsHealthy = activeConnectionCount === 1 && activeTarget === expectedTarget
```

精确计数只作为已固定环境的观察值；跨环境正确性使用活动资源数、当前目标和旧资源是否停止发布事件判断。

- **适用版本：** React `19.2`。
- **来源：** `R7`、`R8`。

### 8. 认为自定义 Hook 自动共享连接

- **触发条件：** 两个组件都调用 `useChatRoom(options)`，并期待它们复用同一条连接、消息列表或连接计数。
- **原因：** 把“复用有状态逻辑”误解为“共享同一份 State 和 Effect 实例”。
- **后果：** 实际建立两条独立连接；一个组件的消息、断开或重置不会自动同步到另一个组件。
- **错误示例：**

```tsx
function Header() {
  return useChatRoom(options).status
}

function ChatPanel() {
  return useChatRoom(options).messages
}
```

- **正确示例：**

```tsx
function ChatScreen() {
  const chatRoom = useChatRoom(options)
  return <><Header status={chatRoom.status} /><ChatPanel chatRoom={chatRoom} /></>
}
```

需要共享时由一个明确所有者调用 Hook，再把最小值和操作向下传递。

- **适用版本：** React `19.2`。
- **来源：** `R5`。

### 9. 让消息草稿驱动连接重建

- **触发条件：** 连接 Effect 直接读取 `draft` 或 `messages`，随后为满足完整依赖把它们加入依赖数组。
- **原因：** 把用户提交事件和本地消息 State 混进只负责外部连接生命周期的同步过程。
- **后果：** 每次输入或收到消息都断开并重建连接；一次提交可能同时改变消息、草稿和连接计数。
- **错误示例：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  if (draft) connection.send(draft)
  return () => connection.disconnect()
}, [serverUrl, roomId, draft, messages])
```

- **正确示例：**

```tsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])

function handleSubmit() {
  sendMessage(draft)
  setDraft('')
}
```

- **适用版本：** React `19.2`。
- **来源：** `R1`、`R2`、`R3`。

### 10. 重置只改表单值而不重建实例

- **触发条件：** “重置聊天室”只调用多个 setter 恢复服务器、房间、主题和草稿，却期望内部 Hook State、消息和连接
  审计也全部成为新实例。
- **原因：** setter 只改变显式列出的 State，不会自动销毁组件身份或保证遗漏的内部资源经过最后 cleanup。
- **后果：** 界面看似回到初值，旧消息、计数或连接回调仍可能属于原实例，无法证明旧资源已经停止。
- **错误示例：**

```tsx
function handleReset() {
  setServerUrl(defaultServerUrl)
  setRoomId('general')
  setTheme('light')
}
```

- **正确示例：**

```tsx
const [instanceKey, setInstanceKey] = useState(0)

function handleReset() {
  setInstanceKey((key) => key + 1)
}

return <ChatRoom key={instanceKey} initialServerUrl={defaultServerUrl} />
```

改变 `key` 会先卸载旧实例并执行其 Effect cleanup，再创建具有固定初值的新实例。

- **适用版本：** React `19.2`。
- **来源：** `R1`、`R9`。

## 明确不覆盖

- 不实现真实 WebSocket、SSE、HTTP 长轮询或服务端消息。
- 不涉及认证、授权、加密、心跳、断线重连、指数退避、超时或错误恢复。
- 不涉及多人一致性、消息去重、顺序保证、已读状态、离线队列或持久化。
- 不引入 Router、Context、Reducer、外部 Store、Suspense、Transition 或 Server Components。
- 不讨论 Fiber、lane、passive flag、commit 内部遍历或开发构建实现细节。
- 不把 Strict Mode 次数、控制台日志或本地类行为写成真实网络系统的可靠性证明。
