# `useSyncExternalStore` 快照合同官方调研

> 核验日期：2026-08-18
> 公共文档基线：React 19.2
> 固定源码与测试基线：React `v19.2.8`，提交
> `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`

## 调研范围

本文只研究 `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` 的公开合同：

- `subscribe` 如何登记通知并返回清理函数；
- `getSnapshot` 如何提供可缓存、不可变的当前快照；
- React 如何使用 `Object.is` 判断快照是否变化；
- 外部 Store 更新、通知、重读与 render 之间的关系；
- `subscribe` 函数身份变化为何会触发重新订阅；
- `getServerSnapshot` 在服务端渲染和 hydration 中的语义。

固定源码和官方测试只用于解释 React 19.2.8 如何实现这些公开事实，不把内部 Fiber、lane、effect
标记或调度细节当成长期 API。Redux、Zustand、selector helper、远程缓存、框架数据层、生产 Store
架构和完整 SSR 工程均不在本文范围内。

## 一手来源

| 编号 | 来源 | 采用的事实 |
| --- | --- | --- |
| S1 | [React `useSyncExternalStore` Reference](https://react.dev/reference/react/useSyncExternalStore) | 当前公开签名、参数、返回值、快照比较、订阅身份和 SSR 语义。 |
| S2 | [固定 Reference：签名与 caveats](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useSyncExternalStore.md#L21-L62) | `subscribe`、`getSnapshot`、`getServerSnapshot` 的逐项合同，以及不可变快照和重新订阅条件。 |
| S3 | [固定 Reference：官方最小 Store](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useSyncExternalStore.md#L134-L172) | Store 在 React 外持有数组；更新先替换数组再通知；`subscribe` 返回移除 listener 的函数。 |
| S4 | [固定 Reference：服务端渲染](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useSyncExternalStore.md#L329-L370) | `getServerSnapshot` 的两个调用场景、服务端与 hydration 初值一致要求及数据传输建议。 |
| S5 | [固定 Reference：缓存与订阅排错](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useSyncExternalStore.md#L374-L448) | 每次返回新对象会形成无限更新；mutable Store 需要缓存；新 `subscribe` 身份会重新订阅。 |
| S6 | [React 19.2 发布说明](https://react.dev/blog/2025/10/01/react-19-2) | React 19.2 已于 2025-10-01 发布并可从 npm 获取。 |
| S7 | [`v19.2.8` 公共 Hook 分派](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L188-L199) | 固定版本接收三个函数并返回同一 snapshot 类型。 |
| S8 | [`v19.2.8` 读取与 hydration 分支](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L1634-L1808) | hydration 使用 `getServerSnapshot`；普通 render 使用 `getSnapshot`；更新时以 `Object.is` 语义比较。 |
| S9 | [`v19.2.8` 订阅处理](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L1859-L1892) | listener 被调用后重新读取快照；不同才安排更新；`subscribe` 返回值作为 cleanup。 |
| S10 | [`v19.2.8` 基本更新与同值通知测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/use-sync-external-store/src/__tests__/useSyncExternalStoreShared-test.js#L111-L173) | 新值通知后更新；通知后仍为同一值时跳过 render。 |
| S11 | [`v19.2.8` 切换 Store 测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/use-sync-external-store/src/__tests__/useSyncExternalStoreShared-test.js#L174-L223) | 切换订阅后，旧 Store 更新不再触发 render，新 Store 更新仍生效。 |
| S12 | [`v19.2.8` 非缓存对象与 `NaN` 测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/use-sync-external-store/src/__tests__/useSyncExternalStoreShared-test.js#L615-L680) | 每次返回新对象会警告并达到最大更新深度；`NaN` 按 `Object.is` 语义保持相等。 |
| S13 | [`v19.2.8` 服务端 Hook 实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-server/src/ReactFizzHooks.js#L553-L565) | 服务端缺少 `getServerSnapshot` 时抛错；提供时返回它的结果。 |
| S14 | [`v19.2.8` hydration 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/use-sync-external-store/src/__tests__/useSyncExternalStoreShared-test.js#L797-L847) | hydration 先读取 server snapshot，随后用普通 `getSnapshot` 的 client 值更新。 |
| S15 | [React 版本说明](https://react.dev/versions) | react.dev 当前文档对应 React 19.2，官网不为每个 minor/patch 保留独立文档副本。 |
| S16 | [React 18 发布说明：`useSyncExternalStore`](https://react.dev/blog/2022/03/29/react-v18#usesyncexternalstore) | React 18 发布时已把它列为新的外部 Store 订阅 Hook。 |
| S17 | [`v19.2.8` 服务端 dispatcher](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-server/src/ReactFizzHooks.js#L817-L830) | 服务端只读取 server snapshot，不建立客户端订阅。 |

## React 19.2 的公开位置

React 官方发布说明确认 React 19.2 已发布，版本页把当前官网文档标为 React 19.2；当前 Reference
继续公开 `useSyncExternalStore`。[S1][S6][S15] 这表示该 Hook 适用于 React 19.2，不表示它由 19.2
引入：React 18 发布说明已经把它列为新 Hook。[S16]

本仓库使用 React / React DOM `19.2.8`，因此源码旁证固定到 `v19.2.8` 对应的提交
`1dd4ecbd...`。固定 patch 的内部实现可以帮助解释现象，但公开合同仍以 React Reference 为准。

`useSyncExternalStore` 在 React 19.2 的公开形状是：[S1][S2][S7]

```tsx
function useSyncExternalStore<Snapshot>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot?: () => Snapshot,
): Snapshot
```

它返回当前 snapshot，不返回 setter、dispatch、listener 或 Store 本体。三个函数共享同一个 snapshot
类型；类型系统并不能自动保证 snapshot 已缓存或不可变，这些仍是 Store 实现必须遵守的运行时合同。

## 公共合同

### 1. `subscribe` 负责通知，不负责传值

`subscribe(callback)` 接收 React 提供的无参 callback，把它登记到外部 Store。Store 发生变化时应
调用 callback；React 随后重新调用 `getSnapshot`，并且只在需要时 render。[S1][S2]

因此 callback 的含义是“外部值可能变了，请重新读取”，不是“这是新值”。把 snapshot 作为 callback
参数传入，再复制到 React State，会形成另一套同步协议，也不再是这个 Hook 的公开模型。固定源码中的
listener 同样先调用 `checkIfSnapshotChanged`，由它执行 `getSnapshot()`。[S9]

### 2. `getSnapshot` 提供当前可渲染值

`getSnapshot()` 应返回组件本次 render 所需的 Store 快照。只要 Store 没有变化，重复调用就必须返回
相同值；Store 变化后，若返回值按 `Object.is` 与上次不同，React 才重新 render 订阅组件。[S1][S2]

“相同值”需要按值的种类理解：

- 字符串、数字、布尔值等 primitive 依照 `Object.is` 的值语义比较；
- 对象、数组和函数通常依照引用身份比较，不做 deep equality；
- `Object.is(NaN, NaN)` 为 `true`，官方测试也验证 `NaN` 不会造成无限循环。[S12]

所以两个字段完全相同但分别创建的对象仍是不同快照：

```ts
Object.is({ revision: 1 }, { revision: 1 }) // false
```

### 3. 快照必须不可变，并按 Store 版本缓存

官方 Reference 明确要求 `getSnapshot` 返回不可变快照。如果底层 Store 本身使用 immutable data，
可以直接返回当前值；如果底层 Store 可变，则应在数据变化时计算一份新的 immutable snapshot，并在
没有变化时返回上次缓存。[S2][S3][S5]

最小正确形态是：

```tsx
type Snapshot = Readonly<{
  revision: number
  message: string
}>

let snapshot: Snapshot = { revision: 0, message: '初始值' }
const listeners = new Set<() => void>()

function getSnapshot(): Snapshot {
  return snapshot
}

function publish(message: string): void {
  snapshot = {
    revision: snapshot.revision + 1,
    message,
  }
  listeners.forEach((listener) => listener())
}
```

这里的顺序是“创建新快照 -> 替换当前引用 -> 通知 listener”。已发布对象不再被原地改写；同一版本
持续返回同一引用。

`Readonly<T>` 只提供 TypeScript 的浅层写入约束，不会在运行时冻结对象，也不会自动让嵌套对象
不可变。不可变性仍由 Store 的更新协议保证。React 也不会替 Store 做 deep clone 或 deep compare。

### 4. 每次读取都创建对象是合同错误

下面的实现即使数据从未改变，每次也会返回新引用：

```tsx
function getSnapshot() {
  return { ...mutableStore }
}
```

React 会不断观察到“不同”结果。官方排错文档说明这会进入无限更新，并报告
“The result of `getSnapshot` should be cached”；固定官方测试验证了该警告和最大更新深度错误。[S5][S12]

正确做法不是永远返回同一个可变对象，而是把“内容是否变化”和“是否创建新快照”绑定：

```text
内容未变化 -> 返回上次缓存
内容已变化 -> 创建新的不可变快照并缓存
```

### 5. 通知与 render 不是一一对应

外部 Store 的完整公开时序是：[S1][S2][S10]

```text
Store 完成更新
  -> 调用已登记的 callback
  -> React 重新调用 getSnapshot
  -> Object.is(上次快照, 当前快照)
  -> 不同：render；相同：跳过本次 Store 驱动的 render
```

callback 可以在快照未变化时被调用。此时 React 会重新检查，但不需要 render。两项独立的官方测试
分别验证：一项把 `Initial` 更新为 `Updated`，DOM 会随之更新；另一项在全新 Store 中再次设置当前已有的
`Initial`，组件不会重新 render。[S10]

同样，`getSnapshot` 也不保证只在 callback 之后调用。React 可以在 render 或一致性检查中多次读取，
所以它必须是可重复读取的同步函数，不能把“读取一次”本身当作一次 Store 更新。[S8]

### 6. `subscribe` 必须返回对称 cleanup

公开合同要求 `subscribe` 返回清理订阅的函数。[S1][S2] 最小实现是：

```tsx
function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
```

cleanup 必须移除当次登记的同一个 listener。固定源码把 `subscribe(handleStoreChange)` 的返回值直接
作为订阅 effect 的 cleanup；官方切换 Store 测试则证明切换后旧 Store 的更新不再影响组件。[S9][S11]
因此卸载或切换订阅后，旧 listener 不应继续响应。

### 7. `subscribe` 身份决定是否重新订阅

React Reference 的精确表述是：如果一次 re-render 传入了不同的 `subscribe` 函数，React 会用新函数
重新订阅。[S1][S2][S5] 因此，“身份稳定”不是 Hook 的语法要求，而是订阅目标和参数未变化时避免
无意义 cleanup / subscribe 的必要条件。

固定 Store 最简单的做法是把函数定义在组件外：

```tsx
function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function Reader() {
  const current = useSyncExternalStore(subscribe, getSnapshot)
  return <p>{current.message}</p>
}
```

如果订阅确实依赖 `userId` 等参数，可以用稳定的 Store API，或按该参数缓存订阅函数。参数改变时发生
重新订阅是正确行为；不能为了“永远稳定”继续监听旧目标。

### 8. 外部 Store 更新保持同步一致性

React Reference 说明，非阻塞 Transition 期间如果外部 Store 改变，React 会在提交前再次读取
`getSnapshot`；若结果不同，就以 blocking update 重新开始这次更新，保证同一屏幕读取一致的 Store
版本。[S1][S2] 因此，把 `store.publish()` 包进 `startTransition` 不会把外部 Store mutation 变成普通
的非阻塞 React State 更新。

Reference 也不建议让 `useSyncExternalStore` 返回值决定 `use` 或 `lazy` 的挂起路径，因为外部 Store
mutation 不能标记为 non-blocking Transition，更新可能直接显示最近的 Suspense fallback。[S1][S2]
这是 API 的适用边界，不需要扩展成调度或数据获取实现。

## `getServerSnapshot` 与 hydration

### 1. 它是可选参数，但 SSR 时有明确要求

`getServerSnapshot` 返回 Store 的初始 server snapshot。它只在两个场景运行：[S1][S4]

1. 服务端生成 HTML 时；
2. 客户端 hydration 服务端 HTML 时。

它不会代替正常客户端更新中的 `getSnapshot`。固定 React 19.2.8 源码在 hydration 分支读取
`getServerSnapshot`，非 hydration 分支读取 `getSnapshot`，与公开文档一致。[S8]
服务端 dispatcher 只读取 `getServerSnapshot`，不会建立需要 cleanup 的客户端订阅。[S13][S17]

### 2. 服务端值与 hydration 首值必须一致

服务端生成 HTML 的数据，与客户端 hydration 首次调用 `getServerSnapshot` 得到的数据必须一致；
否则首个客户端结果可能与服务端 HTML 不匹配。[S1][S4]

对对象数据来说，这不表示服务器和浏览器必须共享同一个 JavaScript 引用，因为它们处在不同运行时。
要求是把同一份初始数据传给客户端，使 hydration 首次 render 得到与服务端等价的可见结果。官方文档
建议把预填充 Store 内容序列化并传到客户端，再由客户端的 `getServerSnapshot` 读取。[S4]

### 3. 省略第三参数的准确后果

如果组件参加服务端 render，却没有提供 `getServerSnapshot`，公开 Reference 说明服务端 render 会
抛错；固定 React 19.2.8 服务端实现也明确抛出 “Missing getServerSnapshot”。[S1][S2][S13]

官方用法页同时说明：如果没有有意义的 server snapshot，可以省略它，并通过相应的客户端渲染边界
让该部分改为客户端渲染。[S4] 因此，准确结论是：

- 纯客户端 `createRoot` 页面不需要第三参数；
- 需要参与 SSR/hydration 的外部 Store 读取必须提供可复现的初始快照；
- 省略第三参数不是“默认使用 `getSnapshot` 完成 SSR”，而是让服务端路径报错，再由应用已有的
  客户端渲染边界决定如何处理。

### 4. 第三参数不是客户端默认值函数

普通客户端挂载和 hydration 是两种不同路径。只有 hydration 会在客户端首读
`getServerSnapshot`；纯客户端挂载以及 hydration 之后的 Store 更新都读取 `getSnapshot`。[S4][S8]
因此不能为纯客户端示例随意补一个固定 `getServerSnapshot`，再据此声称已经验证 SSR 或 hydration。
固定官方测试也观察到 hydration 先输出 `server`，随后切换为普通 `getSnapshot` 返回的 `client`。
[S14]

## 官方源码与测试能证明什么

固定 React 19.2.8 源码提供以下旁证：

- 公共 Hook 将三个参数交给当前 dispatcher，并返回 snapshot。[S7]
- hydration 缺少 `getServerSnapshot` 时抛错；普通 render 读取 `getSnapshot`。[S8]
- 服务端 render 缺少 `getServerSnapshot` 时抛错，提供时直接读取它。[S13]
- 服务端 render 不建立客户端订阅。[S17]
- update 路径使用 React 的 `Object.is` helper 比较旧快照与新快照。[S8]
- listener 通知后重新调用 `getSnapshot`；只有结果变化才安排 Store 更新。[S9]
- `subscribe` 的返回值成为 cleanup。[S9]

固定官方测试从用户可观察行为补足：

- 新快照通知后组件更新，同值通知后组件不 render。[S10]
- 切换 Store 后，旧 Store 更新不再触发组件，新 Store 仍能触发。[S11]
- 每次返回新对象会触发缓存警告和无限更新保护；`NaN` 遵守 `Object.is` 语义。[S12]
- hydration 先使用 server snapshot，再切换到普通客户端 snapshot。[S14]

这些证据用于核对公开合同，不应推导出“应用可以依赖某个内部函数名、effect 阶段或 lane”。未来 patch
可以重构内部实现，只要公开行为保持兼容。

## 可直接采用的结论

1. `subscribe` 只发送无参失效通知；当前值由 `getSnapshot` 统一提供。[S1][S2][S9]
2. Store 未变化时，重复 `getSnapshot` 必须返回 `Object.is` 相等的值。[S1][S2]
3. 对象快照必须不可变并按版本缓存；内容未变时复用引用，内容变化时发布新引用。[S2][S5]
4. React 在通知后重读并比较，所以“通知一次”不等于“render 一次”。[S1][S10]
5. `subscribe` 返回 cleanup；订阅源未变时保持函数身份稳定可避免无意义重订阅。[S1][S5][S9]
6. `getServerSnapshot` 同时服务于服务端 render 和客户端 hydration 首读；两端初始数据必须一致。
   [S1][S4]
7. 纯客户端挂载可以省略第三参数；参与 SSR 的组件省略它会使服务端路径抛错。[S1][S13]
8. 外部 Store mutation 不能通过 `startTransition` 变成普通非阻塞更新，也不适合驱动挂起路径。
   [S1][S2]
9. React 19.2.8 源码和测试只能旁证当前 patch，公共教学结论仍以 React 19.2 Reference 为准。
   [S1][S6]

## 不应采用的表述

- “React 会把 callback 参数当成新 snapshot。”
- “Store 每通知一次，组件就一定 render 一次。”
- “对象字段相同，React 会 deep compare 后跳过。”
- “返回同一个可变对象，再原地修改字段也满足缓存合同。”
- “`Readonly` 会在运行时自动冻结整个对象。”
- “组件内新建 `subscribe` 永远不会重新订阅。”
- “React 保证开发环境中 `subscribe` 和 cleanup 只各调用一次。”
- “`getServerSnapshot` 只在服务器运行。”
- “省略 `getServerSnapshot` 时，SSR 会自动改用 `getSnapshot`。”
- “纯客户端示例传入第三参数，就等于验证了 hydration。”
- “把外部 Store 更新包进 `startTransition` 就会变成普通非阻塞更新。”
