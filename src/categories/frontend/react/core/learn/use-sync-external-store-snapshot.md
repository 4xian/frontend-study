---
id: react.core.learn.advanced.use-sync-external-store-snapshot
type: lesson
title: useSyncExternalStore 快照合同
summary: 用订阅、缓存快照和对称清理，把 React 之外的变化源接入组件并保持一致读取。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 110
prerequisites:
  - react.core.learn.basics.render-commit-and-state-snapshot
  - react.core.learn.intermediate.use-effect
related:
  - react.core.learn.advanced.use-transition-pending-action
  - react.core.learn.advanced.hydrate-root-markup-identity
tags:
  - React
  - useSyncExternalStore
  - External Store
  - Snapshot
  - Subscribe
appliesTo: React 19.2
verifiedAt: 2026-08-18
objectives:
  - 能说明外部 Store 与 React State 的所有权差异，并判断何时需要 useSyncExternalStore。
  - 能逐项解释 subscribe、getSnapshot、getServerSnapshot 和返回值的合同。
  - 能实现缓存不可变快照、先替换再通知的最小外部 Store，并用 Object.is 解释更新结果。
  - 能保持 subscribe 身份稳定，返回对称 cleanup，并正确处理 Store 切换。
  - 能为可变底层数据维护版本化缓存，而不是在 getSnapshot 中反复创建对象。
  - 能说明服务端 render、hydration、Transition 与 Suspense 中的外部 Store 边界。
recap:
  - subscribe 只发送“可能变化”的无参通知，当前值始终由 getSnapshot 提供。
  - getSnapshot 是同步读取函数，Store 未变化时必须返回 Object.is 相等的结果。
  - 对象快照按 Store 版本缓存；有效变化创建新对象，旧快照不再被改写。
  - 通知会让 React 重新读取，但只有快照变化才需要 Store 驱动的 render。
  - 固定订阅源应复用 subscribe 身份；订阅目标真的变化时重新订阅是正确行为。
  - cleanup 移除当次登记的同一个 listener，避免卸载或切换后旧订阅继续响应。
  - 可变底层 Store 需要把版本检测与不可变快照缓存放在适配层。
  - getServerSnapshot 只服务于服务端 render 和 hydration 首读，纯客户端挂载可以省略。
  - useSyncExternalStore 接入已有外部变化源，不替代普通组件的 useState 或 useReducer。
sources:
  - title: React useSyncExternalStore Reference
    url: https://react.dev/reference/react/useSyncExternalStore
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 签名、参数、返回值、快照缓存、Object.is、订阅身份、SSR 与并发边界
  - title: 固定 useSyncExternalStore Reference
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useSyncExternalStore.md
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 最小 Store、不可变快照、服务端初值、缓存与重新订阅排错
  - title: React 19.2.8 Hook 实现
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 快照重读、Object.is 比较、缓存检查、订阅 cleanup 与一致性复核
  - title: React 19.2.8 服务端 Hook 实现
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-server/src/ReactFizzHooks.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 服务端读取 getServerSnapshot、缺少第三参数的错误与不建立客户端订阅
  - title: React 19.2.8 useSyncExternalStore 官方测试
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/use-sync-external-store/src/__tests__/useSyncExternalStoreShared-test.js
    sourceType: official-test
    appliesTo: React 19.2.8
    claims:
      - 新值更新、同值通知跳过、切换 Store、非缓存对象、NaN 与 hydration
---

# useSyncExternalStore 快照合同

## 一、学习目标

- 判断数据是否真的由 React 之外的 Store 持有，而不是把普通组件 State 不必要地搬出去。
- 解释 `subscribe`、`getSnapshot`、`getServerSnapshot` 和 Hook 返回值各自负责什么。
- 实现缓存不可变快照、先替换再通知的最小外部 Store，并用 `Object.is` 解释更新结果。
- 保持 `subscribe` 身份稳定，返回对称 cleanup，并正确处理 Store 切换。
- 为可变底层数据维护版本化缓存，而不是在 `getSnapshot` 中反复创建对象。
- 说明服务端 render、hydration、Transition 与 Suspense 中的外部 Store 边界。

## 二、为什么需要外部 Store 订阅

React 组件通常从 Props、State 或 Context 读取数据。这些值由 React 更新，React 知道更新何时发生，
也能把读取纳入自己的 render 流程。

有些值已经存在于 React 之外：

- 一个状态库持有的当前快照；
- 浏览器 API 暴露的连接状态、媒体查询或历史位置；
- 旧模块维护的内存数据和订阅接口；
- 多个独立 React Root 共同读取的宿主状态。

这些数据的所有者不是组件。组件既需要读取当前值，也需要在外部值变化时收到通知。手工写
`useEffect + useState` 容易产生三个问题：

1. 外部 Store 和 React State 各保存一份值，出现两个事实源。
2. render 与 Effect 建立订阅之间可能遗漏变化。
3. 并发 render 期间，不同组件可能读取到不同版本。

`useSyncExternalStore` 为这类数据提供统一接入合同。它不负责创建 Store，也不提供 setter：

```tsx
import { useSyncExternalStore } from 'react'

const snapshot = useSyncExternalStore(subscribe, getSnapshot)
```

若数据只属于当前 React 组件或组件树，优先使用 `useState`、`useReducer` 或 Context。只有数据已经由
React 之外的来源持有，并且该来源能提供“订阅 + 当前读取”时，才需要这个 Hook。

## 三、API 签名与四个角色

### 1. 完整签名

React 19.2 的公开签名可以写成：

```tsx
function useSyncExternalStore<Snapshot>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot?: () => Snapshot,
): Snapshot
```

`Snapshot` 是泛型：字符串、数字、对象、数组或其他同步可读值都可以作为快照。三个函数必须围绕同一
种快照类型工作。

### 2. subscribe：登记失效通知

`subscribe(onStoreChange)` 把 React 提供的无参 callback 登记到 Store。Store 可能变化时调用 callback，
让 React 再检查一次。

`subscribe` 的返回值是 cleanup。组件卸载、订阅函数改变或切换 Store 时，React 可以用它移除旧
listener。

### 3. getSnapshot：读取当前值

`getSnapshot()` 返回此刻可用于 render 的 Store 快照。React 可以在初次 render、收到通知、组件
re-render 或一致性检查时多次调用它。

它不是事件处理器，也不是一次性消费函数。读取本身不应修改 Store、发送请求或推进游标。

### 4. getServerSnapshot：提供服务端初值

第三个参数只用于：

1. 服务端生成 HTML；
2. 客户端 hydration 这段 HTML 时的首次读取。

纯客户端 `createRoot` 挂载可以省略它。参与服务端 render 的组件必须提供能在两端复现的初始快照，
否则服务端路径会抛错或由应用边界改为客户端渲染。

### 5. 返回值：当前 snapshot

Hook 直接返回当前快照：

```tsx
const current = useSyncExternalStore(store.subscribe, store.getSnapshot)
```

它不返回 `[state, setState]`，也不返回 Store、dispatch 或 listener。修改外部数据仍通过 Store 自己
公开的命令完成。

## 四、建立最小外部 Store

### 1. 缓存当前快照

先定义 Store 对外发布的值：

```tsx
type StoreSnapshot = Readonly<{
  revision: number
  message: string
}>

let snapshot: StoreSnapshot = {
  revision: 0,
  message: '初始快照',
}
```

变量 `snapshot` 位于 React 之外。它是 Store 当前版本的缓存结果。

### 2. 登记 listener 并返回 cleanup

```tsx
const listeners = new Set<() => void>()

/** 登记失效通知，并返回移除同一 listener 的清理函数。 */
function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
```

`Set` 只是最小示例。真实 Store 可以使用其他订阅结构，但必须能移除当次登记的 listener。

### 3. 返回缓存快照

```tsx
/** 返回 Store 当前版本的缓存快照。 */
function getSnapshot(): StoreSnapshot {
  return snapshot
}
```

这里没有对象字面量、展开或 `JSON.parse`。只要 Store 版本没变，连续读取就得到同一个引用。

### 4. 先更新，再通知

```tsx
/** 发布下一份快照，再通知所有订阅者重新读取。 */
function publish(message: string): void {
  snapshot = {
    revision: snapshot.revision + 1,
    message,
  }

  listeners.forEach((listener) => listener())
}
```

顺序不能颠倒：

```text
创建新快照 -> 替换当前引用 -> 通知 listener -> React 重读
```

若先通知、后替换，React 可能在 callback 中读到旧引用并判断“没有变化”。后续替换又没有新通知，
组件就会停在旧值。

### 5. 在组件中读取

```tsx
/** 订阅外部 Store，并显示当前快照。 */
function StoreReader() {
  const current = useSyncExternalStore(subscribe, getSnapshot)

  return (
    <p>
      revision {current.revision}：{current.message}
    </p>
  )
}
```

组件只读快照。发布命令属于 Store，订阅生命周期由 Hook 和 `subscribe` 返回的 cleanup 协作管理。

## 五、subscribe 只通知，getSnapshot 才传递值

### 1. callback 是失效信号

Store 调用 listener 的含义是：

```text
外部值可能变化了，请重新读取
```

callback 不需要携带新值：

```tsx
listeners.forEach((listener) => listener())
```

React 收到通知后调用 `getSnapshot()`。这样 render、通知后的检查和一致性复核都从同一个读取函数取得
当前值。

### 2. 不复制到 React State

下面的写法重新建立了一套同步协议：

```tsx
// 错误方向：listener 传值，组件再保存副本。
subscribe((nextSnapshot) => {
  setSnapshot(nextSnapshot)
})
```

外部 Store 与组件 State 此时都声称自己是当前值。订阅建立前的变化、切换 Store 和并发 render 都要由
应用自己补同步规则。

正确方向是让 Store 只通知，让 Hook 重读：

```tsx
const current = useSyncExternalStore(store.subscribe, store.getSnapshot)
```

### 3. getSnapshot 可以被多次调用

不要把以下行为放进 `getSnapshot`：

- 增加业务 revision；
- 从队列删除一项；
- 发起 fetch；
- 写 localStorage；
- 调用 React setter；
- 每读一次就生成新 ID。

React 没有承诺每次 render 只读取一次。`getSnapshot` 应当同步、可重复读取，并只返回当前缓存结果。

## 六、不可变快照与版本缓存

### 1. 同一版本必须复用结果

```tsx
const first = getSnapshot()
const second = getSnapshot()

Object.is(first, second) // true
```

这不是性能建议，而是对象快照的正确性合同。Store 没变时返回新对象，会让 React 持续看到新版本。

### 2. 有效变化创建新引用

```tsx
/** 用新对象发布一次有效变化。 */
function renameMessage(message: string): void {
  snapshot = {
    revision: snapshot.revision + 1,
    message,
  }

  listeners.forEach((listener) => listener())
}
```

旧对象一旦发布就不再修改。读到旧快照的 render 可以继续安全使用它，新 render 则读取新对象。

### 3. Readonly 不是运行时不可变

`Readonly<T>` 只阻止 TypeScript 代码直接写顶层属性：

```tsx
type Snapshot = Readonly<{
  revision: number
  details: {
    message: string
  }
}>
```

它不会在运行时冻结对象，默认也不会递归限制 `details.message`。不可变性来自 Store 的更新协议，而
不是一个类型修饰符。

### 4. Object.freeze 也不是 API 要求

Demo 可以对字段全是 primitive 的小对象使用 `Object.freeze`，帮助观察旧对象没有被改写。但
`Object.freeze` 只冻结当前对象本身，默认不是深冻结；React 也没有要求所有快照必须调用它。

判断标准只有两条：

1. 已发布快照不再被修改；
2. Store 版本没变时复用缓存结果。

## 七、Object.is 与 Store 驱动的 render

### 1. 完整判断链

```text
Store 完成更新
  -> 调用 listener
  -> React 重读 getSnapshot
  -> Object.is(上次快照, 当前快照)
  -> false：安排 Store 驱动的 render
  -> true：跳过这次 Store 驱动的 render
```

通知次数和 render 次数不是一一对应。

### 2. 对象比较引用

```tsx
Object.is({ revision: 1 }, { revision: 1 }) // false

const cached = { revision: 1 }
Object.is(cached, cached) // true
```

React 不会对两个对象做 deep equality。字段相同但引用不同，仍表示两个快照。

### 3. primitive 按 Object.is 语义比较

若 `getSnapshot` 只返回一个数字或字符串，就按该 primitive 的 `Object.is` 结果判断：

```tsx
Object.is(3, 3) // true
Object.is('online', 'online') // true
Object.is(Number.NaN, Number.NaN) // true
```

官方测试专门覆盖了 `NaN`，避免把它误判为持续变化。

### 4. 同值通知仍然可以发生

Store 可能不知道某个订阅者选择了哪些字段，也可能合并多种事件，所以通知后快照不变是允许的：

```tsx
/** 不替换快照，只要求订阅者重新检查。 */
function notifySameSnapshot(): void {
  listeners.forEach((listener) => listener())
}
```

React 会重读，但当前订阅者不需要因为这次 Store 通知 render。

### 5. 父组件仍可让 Reader render

快照相同只表示“这次 Store 通知不需要驱动更新”。若父组件自身 render，普通子组件仍可能随父级
render。`useSyncExternalStore` 不是 `memo`，也不负责跳过 Props、Context 或父树产生的 render。

## 八、稳定 subscribe 与对称 cleanup

### 1. 固定来源复用函数身份

固定 Store 可以把方法定义在模块外，或使用 Store 实例上的稳定方法：

```tsx
class StatusStore {
  private snapshot: StoreSnapshot = {
    revision: 0,
    message: '初始快照',
  }
  private readonly listeners = new Set<() => void>()

  /** 返回当前缓存快照。 */
  readonly getSnapshot = (): StoreSnapshot => this.snapshot

  /** 登记 listener，并返回对称 cleanup。 */
  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }
}
```

同一个 Store 实例每次 render 都提供同一个 `subscribe` 引用，React 不需要因函数身份变化反复清理和
重订阅。

### 2. render 中的包装箭头会产生新身份

```tsx
// 每次 Reader render 都创建新 subscribe。
const current = useSyncExternalStore(
  (listener) => store.subscribe(listener),
  store.getSnapshot,
)
```

即使它最终调用同一个 Store，外层箭头每次都是新函数。React 会用新函数重新订阅。

直接传稳定方法即可：

```tsx
const current = useSyncExternalStore(store.subscribe, store.getSnapshot)
```

### 3. 订阅目标变化时应该重新订阅

“保持稳定”不等于永远监听旧 Store：

```tsx
type ReaderProps = Readonly<{
  store: StatusStore
}>

/** 跟随 store prop 读取当前订阅目标。 */
function Reader({ store }: ReaderProps) {
  const current = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return <p>{current.message}</p>
}
```

当 `store` prop 从 A 变成 B，`subscribe` 和 `getSnapshot` 都随实例改变。React 清理 A 的 listener，
订阅 B，并读取 B 的快照。这是必要的重新订阅。

### 4. cleanup 移除当次 listener

cleanup 的核心不是维护一个漂亮计数，而是移除准确对象：

```tsx
/** 为当前 listener 建立一一对应的清理闭包。 */
function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
```

不要在 cleanup 中清空整个 Store 的全部 listener；那会破坏其他仍挂载的 Reader。

## 九、可变底层 Store 的缓存适配

### 1. 为什么不能直接展开

旧 Store 可能原地修改内部对象：

```tsx
const mutableStore = {
  version: 0,
  message: '初始值',
}
```

每次读取都展开会产生新引用：

```tsx
// 错误：Store 未变化也创建新对象。
function getSnapshot() {
  return { ...mutableStore }
}
```

直接返回 `mutableStore` 也不正确，因为后续原地修改会改变已发布快照，而引用身份仍然相同。

### 2. 用版本号更新缓存

适配层可以记录底层版本：

```tsx
type MutableSnapshot = Readonly<{
  version: number
  message: string
}>

let cachedVersion = -1
let cachedSnapshot: MutableSnapshot = {
  version: -1,
  message: '',
}

/** 只在底层版本变化时创建新的不可变快照。 */
function getSnapshot(): MutableSnapshot {
  if (cachedVersion !== mutableStore.version) {
    cachedVersion = mutableStore.version
    cachedSnapshot = {
      version: mutableStore.version,
      message: mutableStore.message,
    }
  }

  return cachedSnapshot
}
```

这段适配保证：

- 同一 `version` 返回同一 `cachedSnapshot`；
- 底层有效变化后创建新对象；
- 组件拿不到会继续被底层原地改写的对象。

### 3. 版本号本身也要可信

如果底层修改 `message` 却忘记增加 `version`，适配层无法知道内容变了。版本、变更标记或其他缓存失效
机制必须和底层写操作绑定。

`useSyncExternalStore` 只消费适配结果，不替可变 Store 猜测哪些字段发生了变化。

## 十、选择快照的粒度

### 1. getSnapshot 可以返回所需字段

若组件只关心 Store 的一个 primitive 字段，可以直接返回它：

```tsx
/** 返回当前未读数量。 */
function getUnreadCount(): number {
  return store.getState().unreadCount
}

/** 只订阅未读数量的可见结果。 */
function UnreadBadge() {
  const unreadCount = useSyncExternalStore(store.subscribe, getUnreadCount)
  return <strong>{unreadCount}</strong>
}
```

Store 的其他字段变化并通知时，只要 `unreadCount` 仍按 `Object.is` 相等，这个调用点就不需要由 Store
驱动 render。

### 2. 对象选择结果仍要缓存

下面的选择每次产生新对象，仍然违反快照合同：

```tsx
// 错误：每次读取都创建选择结果。
function getUserSummary() {
  const state = store.getState()
  return { name: state.name, role: state.role }
}
```

需要对象结果时，Store 或适配层应在相关字段变化时创建并缓存它。不要把“只选两个字段”误当成引用会
自动稳定。

### 3. 每个调用点独立比较

两个组件可以订阅同一 Store，却返回不同粒度的快照。React 分别保存和比较各调用点上次读取的结果。
因此 Store 发出同一轮通知后，一个组件可能更新，另一个组件可能跳过。

## 十一、getServerSnapshot 与 hydration

### 1. 服务端只读取初始快照

服务端没有浏览器中的长期组件生命周期。React 在服务端调用 `getServerSnapshot()` 取得 HTML 所需
值，不建立客户端 listener。

```tsx
const current = useSyncExternalStore(
  store.subscribe,
  store.getSnapshot,
  store.getServerSnapshot,
)
```

### 2. hydration 首读必须复现服务端数据

服务端生成 HTML 时使用的初始数据，需要传给浏览器。客户端 hydration 首次调用
`getServerSnapshot()` 时，应返回等价的可见结果。

服务器和浏览器位于不同 JavaScript 运行时，不可能共享对象引用。这里要求的是初始数据和渲染结果
一致，而不是跨进程 `Object.is` 相等。

### 3. 用同一份初始数据创建两端 Store

```tsx
type InitialSnapshot = Readonly<{
  revision: number
  message: string
}>

/** 用可序列化初值创建两端结构一致的 Store。 */
function createStatusStore(initialSnapshot: InitialSnapshot) {
  let current = initialSnapshot
  const listeners = new Set<() => void>()

  return {
    /** 登记客户端 listener。 */
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    /** 返回普通客户端当前快照。 */
    getSnapshot() {
      return current
    },
    /** 返回服务端和 hydration 共用的初始快照。 */
    getServerSnapshot() {
      return initialSnapshot
    },
  }
}
```

真实应用需要安全地序列化 `initialSnapshot`，让浏览器用同一份数据创建 Store。序列化和注入方式属于
宿主框架或服务端架构，不由这个 Hook 决定。

### 4. hydration 之后读取客户端快照

hydration 首次读取完成后，普通客户端更新由 `getSnapshot()` 提供。`getServerSnapshot` 不是每次更新
都会调用的默认值函数。

官方测试展示了“先使用 server snapshot 完成 hydration，再切换到 client snapshot”的路径。

### 5. 纯客户端页面不要伪造第三参数

若页面使用 `createRoot` 挂载，没有服务端 React HTML，传一个固定第三参数不会产生 hydration，也不能
验证两端一致性。直接使用前两个参数即可。

## 十二、同步一致性与并发边界

### 1. 外部 Store mutation 不是普通 Transition State

非阻塞 Transition render 期间，React 会在提交前再次读取外部快照。若 Store 已变化，React 会以
blocking update 重新开始这次更新，避免同一屏幕提交不同 Store 版本。

因此下面的包装不会把外部 mutation 变成普通非阻塞更新：

```tsx
startTransition(() => {
  store.publish('新值')
})
```

Store 的写操作仍发生在 React State 之外。`startTransition` 不能改变它的外部所有权或快照一致性要求。

### 2. 不用快照驱动挂起路径

React 官方不建议让 `useSyncExternalStore` 的返回值决定 `use` 或 `lazy` 的挂起路径。外部 Store
mutation 不能标记成 non-blocking Transition，可能直接显示最近的 Suspense fallback。

外部 Store 应返回同步可读的当前快照。异步数据获取、Promise 缓存和 Suspense 资源属于不同的数据
读取合同。

### 3. 不依赖内部调度名称

固定源码可以旁证 React 19.2.8 会重读快照、比较并做一致性复核，但组件不应依赖 lane、effect 阶段或
内部函数名。公共合同是：

- render 读取一致的当前快照；
- 通知后重新检查；
- 有效变化同步反映；
- 同值结果可以跳过 Store 驱动的 render。

## 十三、完整 Demo

Demo 使用一个页面内 Store 和两个真实 Reader，分别调用 `useSyncExternalStore`。按顺序观察：

1. 冷启动时两个 Reader 读取同一 revision 和 identity。
2. “发布新快照”先替换对象再通知，两个 Reader 显示下一 revision。
3. “重复通知同一快照”增加通知账本，但 identity 和 Reader Effect setup 观察值不变。
4. “只更新 Demo 外壳”证明父级 render 仍可经过 Reader，但稳定 `subscribe` 不会因此重订阅。
5. 卸载两个 Reader 后 active listener 归零；此时发布不会唤醒旧 Reader。
6. 重新挂载后读取 Store 最新快照，只建立当前代次的两个 listener。
7. “重建实验”通过 React 卸载旧树，再建立全新的 Store 和账本。

诊断区的 Reader Effect setup 只记录无依赖 `useEffect` 在提交后的 setup 执行。它用于比较当前 Demo
某次操作前后的观察值，不等于 render 次数，也不承诺 Strict Mode 下的固定初值。

Demo 的 `Object.isFrozen` 只说明这个小对象执行了浅层 `Object.freeze`，不是 Hook 对所有 Store 的要求。

:::demo{id="react.core.learn.advanced.use-sync-external-store-snapshot.external-store-snapshot-demo"}
:::

## 十四、易错使用提示

:::pitfalls
### 错误：每次 getSnapshot 都返回新对象

**触发条件：** 在读取函数中使用对象字面量、展开、`map` 或 `JSON.parse`，且没有按 Store 版本缓存。

**原因：** 对象按引用参与 `Object.is` 比较；每次创建都会得到新引用。

**后果：** React 持续看到不同快照，开发环境会报告结果应缓存，并可能达到最大更新深度。

**错误示例：**

```tsx
/** 错误：Store 未变化也创建新对象。 */
function getSnapshot() {
  return { ...store.getState() }
}
```

**正确写法：**

```tsx
/** 返回按 Store 版本维护的缓存快照。 */
function getSnapshot() {
  return cachedSnapshot
}
```

**验证方式：** Store 未变化时连续读取两次，`Object.is(first, second)` 必须为 `true`。

### 错误：原地修改已发布快照

**触发条件：** 直接写 `snapshot.message = nextMessage`，然后通知 listener。

**原因：** 旧 render 已经持有该对象，而引用身份没有变化。

**后果：** React 可能跳过更新，旧快照的历史内容也被悄悄改写。

**错误示例：**

```tsx
snapshot.message = '新值'
listeners.forEach((listener) => listener())
```

**正确写法：**

```tsx
snapshot = {
  revision: snapshot.revision + 1,
  message: '新值',
}
listeners.forEach((listener) => listener())
```

**验证方式：** 发布前后引用按 `Object.is` 为 `false`，旧对象字段保持原值。

### 错误：先通知再替换快照

**触发条件：** 先遍历 listener，之后才赋值新的 `snapshot`。

**原因：** React 在通知后立即重读时仍得到旧值。

**后果：** 本次检查可能被跳过，新快照又没有后续通知，DOM 停留在旧版本。

**错误示例：**

```tsx
listeners.forEach((listener) => listener())
snapshot = nextSnapshot
```

**正确写法：**

```tsx
snapshot = nextSnapshot
listeners.forEach((listener) => listener())
```

**验证方式：** 每次 listener 执行时立即调用 `getSnapshot()`，应已经读到本轮新引用。

### 错误：把 callback 当成传值通道

**触发条件：** listener 接收新对象，组件再把它复制进 `useState`。

**原因：** 绕开 `getSnapshot`，建立外部 Store 与 React State 两个事实源。

**后果：** 订阅前变化、Store 切换和并发读取都需要另一套同步规则。

**错误示例：**

```tsx
store.subscribe((nextSnapshot) => {
  setSnapshot(nextSnapshot)
})
```

**正确写法：**

```tsx
const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
```

**验证方式：** 组件没有保存外部值的 React State；当前显示值只来自 Hook 返回的快照。

### 错误：在每次 render 创建 subscribe

**触发条件：** 把 `(listener) => store.subscribe(listener)` 直接传给 Hook。

**原因：** 每次 render 都产生新的函数身份。

**后果：** React 清理旧订阅并建立新订阅，无关父级 render 也会造成订阅抖动。

**错误示例：**

```tsx
const snapshot = useSyncExternalStore(
  (listener) => store.subscribe(listener),
  store.getSnapshot,
)
```

**正确写法：**

```tsx
const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
```

**验证方式：** 只更新父级 State，固定 Store 的 subscribe / cleanup 账本不应变化。

### 错误：cleanup 移除错误对象或全部 listener

**触发条件：** cleanup 重新创建一个函数去删除，或直接执行 `listeners.clear()`。

**原因：** 新函数不是当次登记对象；清空集合又会破坏其他 Reader。

**后果：** 旧 listener 泄漏，或仍挂载组件突然失去订阅。

**错误示例：**

```tsx
/** 错误：清理当前 Store 的所有订阅者。 */
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.clear()
}
```

**正确写法：**

```tsx
/** 只清理当次登记的 listener。 */
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
```

**验证方式：** 卸载一个 Reader 后只减少一个 listener，另一个 Reader 仍能收到下一次有效更新。

### 错误：切换 Store 后继续复用旧订阅

**触发条件：** 订阅函数被错误缓存，依赖的 Store 已从 A 变为 B 却仍监听 A。

**原因：** 把“避免无意义重订阅”误解为“函数身份永远不能变化”。

**后果：** B 的更新不生效，A 的旧更新仍可能影响当前组件。

**错误示例：**

```tsx
const subscribe = useCallback(storeA.subscribe, [])
```

**正确写法：**

```tsx
const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
```

**验证方式：** 切换到 B 后更新 A，当前 DOM 不变；更新 B，当前 DOM 显示 B 的新快照。

### 错误：为纯客户端页面伪造 getServerSnapshot

**触发条件：** `createRoot` 页面传入固定第三参数，并宣称完成了 SSR 或 hydration。

**原因：** 纯客户端挂载不会经过服务端 HTML 和 hydration 首读。

**后果：** 示例没有验证两端初值一致，也可能让学习者误解第三参数会参与每次客户端更新。

**错误示例：**

```tsx
useSyncExternalStore(subscribe, getSnapshot, () => ({ status: 'server' }))
```

**正确写法：**

```tsx
// 纯客户端页面只传两个参数。
const snapshot = useSyncExternalStore(subscribe, getSnapshot)
```

**验证方式：** 先确认页面是否由 `hydrateRoot` 接管服务端 React HTML；没有 hydration 就不声称验证
第三参数。

### 错误：把外部 mutation 当成非阻塞 Transition

**触发条件：** 用 `startTransition` 包裹 `store.publish()`，期待保留陈旧 UI。

**原因：** 外部 Store 更新不由 React State 队列拥有，React 需要保证同屏快照一致。

**后果：** Store 在 Transition 期间变化时，React 可能以 blocking update 重做工作。

**错误示例：**

```tsx
startTransition(() => {
  store.publish('新值')
})
```

**正确写法：**

```tsx
// 按外部 Store 的同步合同发布，不承诺非阻塞。
store.publish('新值')
```

**验证方式：** 只把“快照最终一致”作为合同，不用 pending、毫秒数或内部调度次数证明非阻塞。
:::

## 十五、源码推导与适用场景

### 1. 官方实现事实

固定 React 19.2.8 源码和测试能旁证：

- 普通 render 读取 `getSnapshot`，hydration 分支读取 `getServerSnapshot`；
- update 路径使用 `Object.is` 语义比较前后快照；
- listener 被调用后，React 再次执行 `getSnapshot`；
- 只有比较结果变化才安排 Store 更新；
- `subscribe` 的返回值作为 cleanup；
- 服务端读取 `getServerSnapshot`，不建立客户端订阅；
- 官方测试覆盖新值更新、同值通知跳过、切换 Store、非缓存对象与 hydration。

### 2. 从事实得到的课程推导

这些事实共同支持四个设计判断：

1. 通知和读取必须分离，callback 不承担传值。
2. 快照缓存是正确性要求，不只是减少对象分配。
3. 订阅函数身份表达“订阅目标是否变化”，不是越稳定越好。
4. 服务端初值和客户端长期当前值属于两个读取阶段。

### 3. 适合使用的场景

- 已有状态库公开 `subscribe` 和同步读取接口；
- 浏览器 API 有事件通知，也能同步读取当前状态；
- 非 React 模块持有跨组件共享值；
- 宿主环境需要多个 React 读取点观察同一外部版本。

### 4. 不适合使用的场景

- 当前组件自己的表单值、开关或局部计数；
- 只需要父子传递的 Props；
- 可以直接由 reducer 管理的组件树业务 State；
- 只能异步获取、没有同步当前快照的数据源；
- 为了减少 render 而临时创建的“外部 Store”。

### 5. Store 库与 Hook 的边界

成熟状态库通常已经封装订阅、选择、缓存和服务端集成。应用开发者应优先使用该库公开的 React
绑定，而不是让每个组件重新手写适配。

`useSyncExternalStore` 仍然重要，因为它定义了这些绑定需要满足的基础合同，也适合连接自有的最小
外部变化源。

## 十六、练习

:::exercise
### 1. 画出通知与读取时序

**要求：** 从 `publish` 开始，写出替换快照、调用 listener、React 重读、`Object.is` 比较和 DOM
更新的顺序；再写一条“同值通知”路径。

**验收：** 有效变化路径的比较结果为 `false`；同值通知路径仍会重读，但比较结果为 `true`，不要求
Store 驱动的 render。
:::

:::exercise
### 2. 为发布命令增加 no-op 判断

**要求：** 当新消息和当前消息相同时，不创建新快照；可以选择不通知，也可以通知后让 React 跳过。

**验收：** 连续输入相同消息时 revision 不增加，`getSnapshot` 继续返回原引用。
:::

:::exercise
### 3. 只订阅一个 primitive 字段

**要求：** 在 Store 中增加 `unreadCount` 和 `theme`，让一个 Reader 的 `getSnapshot` 只返回
`unreadCount`。

**验收：** 只修改 `theme` 并通知时，未读 Reader 的返回值按 `Object.is` 不变；修改 `unreadCount`
时返回新数字。
:::

:::exercise
### 4. 切换两个 Store 实例

**要求：** 创建 A、B 两个 Store，通过 prop 切换 Reader 的当前目标，并记录各自 listener 数。

**验收：** 切换到 B 后，A 的 listener 被移除；更新 A 不改变当前 DOM，更新 B 会显示新值。
:::

:::exercise
### 5. 设计服务端初值传递

**要求：** 给出一份可序列化 `InitialSnapshot`，说明服务器怎样用于生成 HTML，浏览器怎样用同一数据
创建 Store，以及 hydration 后哪一个函数负责普通更新。

**验收：** 服务端与 hydration 首读的可见数据一致；hydration 之后由 `getSnapshot` 返回客户端当前值，
没有把对象引用跨进程相等当成要求。
:::

## 十七、本节小结

- 外部 Store 的最小合同是“订阅可能变化”和“同步读取当前快照”。
- `subscribe` 发送无参失效通知，`getSnapshot` 才提供 render 使用的值。
- 同一 Store 版本必须返回 `Object.is` 相等的快照；对象内容相同不等于引用相同。
- 已发布对象不再改写，有效变化先替换新快照，再通知 listener。
- 同值通知可以发生，但不要求 Store 驱动的 render；父组件仍可能产生普通 render。
- 固定订阅源复用 `subscribe` 身份，目标变化时正确地清理旧 Store 并订阅新 Store。
- 可变底层数据必须在适配层按版本缓存不可变结果。
- `getServerSnapshot` 服务于服务端 render 和 hydration 首读，普通客户端更新读取 `getSnapshot`。
- 外部 Store mutation 不能通过 Transition 变成普通非阻塞 State 更新。
- 组件内普通状态仍优先 React State，不为使用 Hook 而创建多余 Store。

## 十八、参考资料

- [React `useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) - API 签名、
  订阅、快照、服务端参数、排错与并发边界。
- [固定 React Reference](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useSyncExternalStore.md)
  固定最小 Store、不可变缓存、SSR 与重新订阅说明。
- [React 19.2.8 Hook 实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js)
  当前 patch 的快照重读、比较、缓存检查与订阅 cleanup 旁证。
- [React 19.2.8 服务端 Hook 实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-server/src/ReactFizzHooks.js)
  当前 patch 的服务端快照与订阅边界旁证。
- [React 19.2.8 官方 shared 测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/use-sync-external-store/src/__tests__/useSyncExternalStoreShared-test.js)
  新值、同值通知、切换 Store、缓存错误、`NaN` 与 hydration 的可观察行为。
