# Effect Event 研究记录

## 研究范围

- 路线标识：`I15`
- 课程标识：`react.core.learn.intermediate.effect-events`
- 知识主题：`useEffectEvent`、响应式逻辑与非响应式逻辑、最新已提交值、调用边界
- 教学层级：本科中级
- 核验日期：`2026-08-17`
- 官方文档基线：React `19.2`
- 仓库运行时：React / React DOM `19.2.8`
- 固定源码：`v19.2.8`，commit `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`

本记录聚焦本主题的知识事实、来源依据、正文结构和 Demo 验收合同。课程正文应直接讲 Effect Event，不出现路线、
批次和生产流程描述。

## 研究问题

1. Effect 中哪些代码应继续响应依赖变化，哪些代码只应在外部事件发生时读取最新值？
2. `useEffectEvent` 如何读取最新已提交的 props 与 state，同时避免外围 Effect 因这些值变化而重新同步？
3. 为什么响应事件的身份应作为参数传入，而不是在 Effect Event 中读取同一个响应值？
4. 为什么 Effect Event 必须从依赖数组省略，且不能当作普通稳定回调传递？
5. React 19.2.8 的固定实现如何更新最新 callback，运行时与 lint 分别能证明哪些边界？
6. 如何用本科范围的确定性 Demo 证明主题更新不重连、房间更新会重连、下一次事件读取最新主题？

## 官方检索与来源核验

外部资料发现先使用 Tavily，并限制 `react.dev`。候选结果包括 `useEffectEvent` Reference、`Separating Events
from Effects`、`Removing Effect Dependencies` 和 React 19.2 发布说明。Tavily 只用于发现 URL，所有结论都回读
官方 Markdown 原文：

- [useEffectEvent Reference](https://react.dev/reference/react/useEffectEvent.md)
- [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects.md)
- [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies.md)
- [React 19.2 发布说明](https://react.dev/blog/2025/10/01/react-19-2.md)

实现事实使用 React 仓库固定 commit 的 raw 文件核验。`v19.2.8` 的 package 版本为 `19.2.8`，且
`enableUseEffectEventHook` 在该快照为 `true`。不使用浮动 `main`、第三方文章、搜索摘要或未固定的 patch 源码作为
课程事实。

## 官方事实与证据矩阵

| 编号 | 官方来源 | 证据内容 |
| --- | --- | --- |
| S1 | [`useEffectEvent` Reference](https://react.dev/reference/react/useEffectEvent#parameters) | callback 可接受任意参数并返回任意值；调用返回函数时，callback 读取调用时最新的已提交 props 与 state；返回函数保持 callback 的类型签名。 |
| S2 | [`useEffectEvent` Reference](https://react.dev/reference/react/useEffectEvent#caveats) | Hook 必须在组件或自定义 Hook 顶层调用；Effect Event 只能从 Effect 或同组件的其他 Effect Event 调用，不能在 render 中调用，也不能传给其他组件或 Hook；不能用来逃避依赖。 |
| S3 | [`useEffectEvent` Reference](https://react.dev/reference/react/useEffectEvent#why-are-effect-events-not-stable) | 返回函数身份故意在每次 render 改变，不是稳定回调；加入依赖会使代码依赖这个变化的身份。 |
| S4 | [`Separating Events from Effects`](https://react.dev/learn/separating-events-from-effects#extracting-non-reactive-logic-out-of-effects) | `roomId` 驱动连接，`theme` 只影响连接通知；把通知提取为 Effect Event 后，外围 Effect 的依赖为 `[roomId]`。 |
| S5 | [`Separating Events from Effects`](https://react.dev/learn/separating-events-from-effects#reading-latest-props-and-state-with-effect-events) | Effect Event 中的读取不触发外围 Effect；响应事件的值应从 Effect 通过参数显式传入，参数保留事件发生时的身份。 |
| S6 | [`Removing Effect Dependencies`](https://react.dev/learn/removing-effect-dependencies#is-your-effect-doing-several-unrelated-things) | 只有确实不应触发同步、但需要读取最新值的逻辑才适合提取；真正决定同步的值仍必须留在 Effect 依赖中。 |
| S7 | [React 19.2 发布说明](https://react.dev/blog/2025/10/01/react-19-2#use-effect-event) | `useEffectEvent` 随 React 19.2 发布；Effect Event 不应写入依赖数组，且声明它的组件或 Hook 必须与使用它的 Effect 对应。 |
| S8 | [`ReactClient.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactClient.js#L38-L96) 与 [`ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L218-L224) | React 公共入口导出 `useEffectEvent`；Flow 泛型签名把 callback 的参数和返回类型保留到返回函数。 |
| S9 | [`ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2703-L2755) | mount 保存 callback 并返回 wrapper；update 排队最新实现并返回新的 wrapper；wrapper 在 render 阶段调用会抛错，正常调用转发到当前实现。 |
| S10 | [`ReactFiberCommitWork.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L495-L508) | commit 阶段把排队的 `nextImpl` 写入 callback ref，说明“最新值”以已提交 render 为边界。 |
| S11 | [`RulesOfHooks.ts`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/eslint-plugin-react-hooks/src/rules/RulesOfHooks.ts#L762-L810) | lint 跟踪 `useEffectEvent` 返回函数的引用，只允许它出现在同一组件的 Effect 或 Effect Event 逻辑中，不允许向外赋值或传递。 |
| S12 | [`ExhaustiveDeps.ts`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/eslint-plugin-react-hooks/src/rules/ExhaustiveDeps.ts#L792-L810) | lint 识别 Effect Event 返回值，并对把它写进依赖数组的代码报告错误并提供移除建议。 |
| S13 | [`ReactFiberWorkLoop.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberWorkLoop.js#L1871-L1874) | 当前 runtime guard 主要检查 render execution context；它不能代替 lint 证明调用者是否属于允许的 Effect 边界。 |

### 版本边界

- `react.dev` 页面以 React `19.2` 为文档基线，不把网页版本写成 `19.2.8`。
- `19.2.8` 的 package 与固定 commit 只用于解释当前实现路径，不扩大公开 API 的承诺。
- React core 使用 Flow；课程中的 TypeScript 只验证回调参数和返回类型，不能证明调用位置、依赖省略或最新提交语义。
- 当前仓库的本地包版本为 `react` / `react-dom` `19.2.8`，`@types/react` `19.2.18`。类型声明属于编译合同，不替代
  React 官方文档。

## 研究结论

### 1. 先区分同步条件和事件结果

外围 Effect 负责与外部系统保持同步。若 `roomId` 改变就必须断开旧连接并建立新连接，`roomId` 是响应式逻辑，必须
直接在 Effect 中读取并写入 `[roomId]`。

连接建立后收到的通知是连接事件的结果。通知的颜色由 `theme` 决定，但主题改变不代表连接目标改变。把通知逻辑
放进 Effect Event 后，外围 Effect 不再因 `theme` 改变而重跑；事件发生时仍能使用最新主题。

Effect Event 不是“把任意依赖标记为非响应”的语法。若 `roomId`、服务器地址、订阅频道或认证范围决定外部资源，
就必须留在外围 Effect。把这些值藏进 Effect Event 并使用空依赖会让外部系统停留在旧资源。

### 2. Effect Event 读取最新已提交值

```tsx
function ChatRoom({ roomId, theme }: { roomId: string; theme: string }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected', theme)
  })

  useEffect(() => {
    const connection = createConnection(roomId)
    connection.on('connected', () => onConnected())
    connection.connect()
    return () => connection.disconnect()
  }, [roomId])
}
```

主题更新会产生新的 render 和 commit，但不会重新执行 `[roomId]` Effect。之后连接事件调用 `onConnected` 时，
Effect Event 读取的是最近一次已提交 render 的 `theme`。尚未提交或被中断的 render 不属于这个公开合同。

固定源码对此提供了实现解释：mount 时保存 callback，update 时把新的 callback 排入组件更新队列，commit 时写回
`ref.impl`，wrapper 调用当前的 `ref.impl`。应用代码不能读取这些 ref、Fiber 或更新队列；它们只是帮助理解公开语义。

### 3. 参数保留响应事件的身份

Effect Event 的 callback 可以接收任意参数。凡是决定“这次事件属于什么对象”的值，应由外围 Effect 显式传入：

```tsx
const onConnected = useEffectEvent((connectedRoomId: RoomId) => {
  showNotification(connectedRoomId, theme)
})

useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', () => onConnected(roomId))
  connection.connect()
  return () => connection.disconnect()
}, [roomId])
```

这里的 `roomId` 有两个不同职责：它在 Effect 中决定连接并触发重新同步，同时作为事件参数说明连接事件的身份；
`theme` 只在 Effect Event 内读取最新值。若把 `roomId` 也从 callback 外移除并在 Effect Event 内直接读取，就很容易
误删依赖，或让延迟事件显示错误的对象。

参数还保留了事件发生时的快照。异步或排队场景中，Effect Event 内读取的 `roomId` 可能已经是较新的值，而从 Effect
传入的 `connectedRoomId` 仍代表触发本次事件的连接。当前 Demo 不引入异步，只保留这条数据流规则。

### 4. Effect Event 必须从依赖中省略

`onConnected` 是 Effect Event，官方要求它不出现在外围 Effect 的依赖数组中。依赖应精确描述同步代码真正响应的值，
因此示例使用 `[roomId]`，而不是 `[roomId, theme]` 或 `[roomId, onConnected]`。

返回函数身份故意在每次 render 改变。把它写入依赖会让主题等无关更新触发重连，正好破坏提取非响应逻辑的目的。
这不是通过 `useCallback` 修复的稳定回调，也不能依赖函数身份做缓存、比较或跨组件传递。

### 5. 调用位置是 API 合同的一部分

- `useEffectEvent` 本身必须在组件或自定义 Hook 顶层调用，不能放在条件、循环或嵌套函数中。
- 返回函数只能从同组件的 Effect、`useLayoutEffect`、`useInsertionEffect` 或同组件的其他 Effect Event 调用。
- 不能在 render 中直接调用，不能从普通按钮事件处理器直接调用，不能传给子组件、普通工具函数或自定义 Hook。
- 普通用户交互仍使用普通事件处理器；Effect Event 表示由 Effect 管理的外部事件，不是通用事件 API。

React runtime 在固定版本中对 render 阶段调用抛出错误；“是否从允许的 Effect 位置调用”主要由
`eslint-plugin-react-hooks` 静态检查。运行时无错误不能证明跨组件传递或错误调用边界正确。

### 6. 什么时候不该使用

- 如果某个值变化确实应该重新连接、重新订阅或重新配置外部系统，保留完整依赖，不要移入 Effect Event。
- 如果逻辑由用户点击、提交或键盘操作触发，使用普通事件处理器，不要包装成 Effect Event。
- 如果逻辑只是 render 派生值或状态更新，先判断是否根本不需要 Effect。
- 如果只是对象或函数身份导致不必要同步，先按依赖治理规则重构创建位置；Effect Event 不是对象稳定化工具。
- 不用 `eslint-disable`、空依赖数组或 `useCallback` 伪造本课结论。

## 本科正文知识结构

正文按以下顺序展开，每一节只讲 Effect Event 需要的知识：

### 1. 响应式与非响应式逻辑

- Props、State 和组件函数体中的变量会随 render 改变。
- Effect 中读取的响应值变化时，React 重新同步 Effect。
- 同一个外部事件回调可能同时包含两类逻辑：连接目标属于响应式逻辑，通知样式属于非响应式逻辑。
- 非响应式不是“不读取变化”，而是“读取变化时不重新启动外围同步”。

### 2. API 形状与类型

```tsx
const event = useEffectEvent(callback)
```

- 在组件顶层调用一次。
- callback 可以有参数和返回值。
- 返回函数与 callback 保持同样的参数和返回类型。
- 本科示例使用窄联合类型，展示参数必须与事件身份一致。

### 3. 从 Effect 提取事件部分

按三步改写：

1. 先找出真正决定外部同步的值，保留在 Effect 和依赖数组中。
2. 把只在外部事件发生时执行、但需要最新 props/state 的代码移入 Effect Event。
3. 让 Effect 登记外部事件回调，由该回调调用 Effect Event；不要由 UI 事件处理器直接调用。

### 4. 最新已提交值

- render 会产生新的 props/state 快照。
- 只有完成 commit 的快照才会成为 Effect Event 后续调用可见的最新值。
- 主题切换后不重连，下一次连接事件仍显示新主题。
- 不能把“最新值”解释为未提交 render 或任意旧连接的值。

### 5. 显式传递事件参数

- 事件发生的对象、房间、消息或 URL 由 Effect 传入。
- Effect Event 内读取的值用于事件发生时的最新配置。
- 参数让响应条件保持可见，避免把真正依赖藏进非响应函数。
- 参数与闭包读取值可以同时存在，但职责必须清楚。

### 6. 依赖数组语义

- 外围 Effect 依赖精确为 `[roomId]`。
- `theme` 只在 Effect Event 中读取，因此不进入外围依赖。
- `onConnected` 是 Effect Event，因此必须省略。
- 依赖数组不是执行次数开关，也不是手工选择的“想要的依赖”。

### 7. 调用边界与身份

- Effect Event 只属于声明它的组件和使用它的 Effect。
- 返回函数身份不稳定，不可作为稳定回调传递。
- lint 报告错误是边界证据；TypeScript 只能证明签名。
- runtime render guard 与 lint 的职责不同，不能互相替代。

### 8. 适用边界练习

练习应覆盖：

- 保留 `roomId`、移出 `theme` 后观察连接次数。
- 传入 `connectedRoomId`，比较事件身份与最新主题。
- 找出把 `roomId` 藏入 Effect Event、把 `onConnected` 写进依赖、从按钮直接调用的错误。
- 说明普通点击逻辑为什么不能改写成 Effect Event。

## 高价值易错点

1. **把真正同步条件移入 Effect Event：** 房间切换不再重连，外部系统停留在旧房间。
2. **继续保留 `theme` 依赖：** 主题变化会断开并重建连接，非响应逻辑没有被真正提取。
3. **把 `onConnected` 加入依赖：** 返回函数身份每次 render 改变，无关更新可能重跑 Effect。
4. **使用空数组掩盖缺失依赖：** 这只是隐藏 bug，不会让 `roomId` 变成非响应值。
5. **从普通按钮直接调用 Effect Event：** 破坏 Effect 管理的调用边界，且绕过外部连接事件。
6. **把 Effect Event 传给子组件或自定义 Hook：** 跨边界后无法证明它仍属于声明它的 Effect。
7. **把“最新值”写成“最新 render”：** 未提交 render 不属于公开语义。
8. **使用 Ref 手工保存主题：** 绕开公开 API，无法清晰表达响应与非响应职责。
9. **用同值短路掩盖连接次数：** 如果连接替身在相同参数时直接返回，主题变化是否错误重跑就无法观察；验收必须
   统计真实 Effect setup 次数。

## 确定性同源 Demo 验收合同

### 资产与运行范围

- Demo 标识：`react.core.learn.intermediate.effect-events.latest-notification-demo`
- 运行与展示源码：`src/categories/frontend/react/core/demos/effect-events/latest-notification-demo.tsx`
- 样式源码：`src/categories/frontend/react/core/demos/effect-events/latest-notification-demo.css`
- 运行组件与“查看源码”必须读取同一份 TSX/CSS 文件，不复制另一份展示代码。
- 只使用本地确定性连接替身，不发网络请求，不使用 timer、Promise、随机数、全局事件监听器或动画。
- CSS 使用 Flexbox 和普通流，不使用 `grid`、`gap` 或非零 `letter-spacing`。

### 数据和组件合同

1. `RoomId = 'alpha' | 'beta'`，`Theme = 'light' | 'dark'`。
2. `RoomConnection` 保存当前房间、一个 `connected` listener 和连接状态，支持 `subscribe`、`connect`、`disconnect`
   与 `emitConnected`。`disconnect` 后旧连接不得继续发布事件。
3. `LatestNotificationScene` 顶层恰好调用一次 `useEffectEvent`，callback 接收
   `connectedRoomId: RoomId`，读取最新 `theme` 并写入最近通知。
4. 组件恰好有一个本课 `useEffect`。Effect 按 `roomId` 创建连接、登记 listener、调用 `connect`，cleanup 注销同一
   listener 并断开同一连接；依赖数组精确为 `[roomId]`。
5. listener 位于 Effect setup 内，由连接替身触发后调用 `onConnected(roomId)`。UI 的“触发连接事件”按钮只调用
   `connectionRef.current.emitConnected()`，不能直接调用 Effect Event。
6. 连接次数必须在每次真实 Effect setup 建连时递增，不得在 `connect` 或 `synchronize` 中按相同参数短路。次数要在
   DOM 中公开显示，能够区分主题重渲染和 Effect 重跑。
7. `theme` 不得由 Effect setup/cleanup 直接读取，也不得进入依赖数组；`onConnected` 不得进入依赖数组。
8. 不创建第二个 Effect Event，不使用 `useMemo`、`useCallback`、主题 Ref、lint 抑制、外部 Store 或其他同步系统。

### 浏览器可观察验收

开发 Strict Mode 开启时，冷启动应显示房间 `alpha`、主题 `light`、连接次数 `2`、暂无通知。Strict Mode 的额外
setup/cleanup 只用于开发检查，生产环境基线可能为 `1`，但后续增量规则相同。

1. 切换主题为 `dark`：主题显示 `dark`，连接次数仍为 `2`。
2. 点击“触发连接事件”：通知显示 `alpha / dark`，证明事件调用时读取最新已提交主题。
3. 切换房间为 `beta`：旧连接清理，新 Effect setup 建连，连接次数变为 `3`。
4. 切换主题为 `light`：连接次数仍为 `3`。
5. 再次触发连接事件：通知显示 `beta / light`，证明事件参数来自当前连接而主题来自最新值。
6. 点击重置：重新挂载后恢复 `alpha / light / 暂无通知`；开发 Strict Mode 下连接次数回到新实例的 `2`。
7. 离开后重新进入 Demo：旧连接、通知和连接次数不得泄漏到新实例。

### 静态与类型验收

- `useEffectEvent` callback 只有一个 `connectedRoomId` 参数，读取 `theme`，不读取组件作用域 `roomId` 来决定事件身份。
- 唯一 Effect 的依赖数组是固定内联字面量 `[roomId]`，无别名、spread、条件表达式或动态构造。
- `onConnected` 只在 Effect setup 内的连接 listener 中调用一次；不出现在 JSX、render、cleanup、子组件 prop 或自定义
  Hook 参数中。
- setup 与 cleanup 对同一个连接和同一个 listener 对称操作，旧连接的 `emitConnected` 不再更新通知。
- TypeScript 至少证明 `connectedRoomId` 的窄联合类型和 callback 返回签名；TypeScript 不承担调用位置、依赖数组和
  最新已提交值的证明。
- 运行源码与展示源码按 `trimEnd()` 后的字符数、UTF-8 字节数和 SHA-256 核对一致。

## 参考资料

1. [`useEffectEvent` Reference](https://react.dev/reference/react/useEffectEvent) - API、最新已提交值、参数、调用边界和身份稳定性。
2. [`Separating Events from Effects`](https://react.dev/learn/separating-events-from-effects) - 响应与非响应逻辑、显式事件参数和聊天室范式。
3. [`Removing Effect Dependencies`](https://react.dev/learn/removing-effect-dependencies) - 只读取最新值时提取 Effect Event，以及不能隐藏真正依赖。
4. [React 19.2 发布说明](https://react.dev/blog/2025/10/01/react-19-2#use-effect-event) - 发布版本、依赖省略和同组件限制。
5. [React v19.2.8 `ReactClient.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactClient.js#L38-L96) - 公共导出。
6. [React v19.2.8 `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L218-L224) - callback 泛型签名与 dispatcher 转发。
7. [React v19.2.8 `ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2703-L2755) - wrapper、更新队列和 render guard。
8. [React v19.2.8 `ReactFiberCommitWork.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L495-L508) - commit 写回最新实现。
9. [React v19.2.8 `RulesOfHooks.ts`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/eslint-plugin-react-hooks/src/rules/RulesOfHooks.ts#L762-L810) - 同组件调用与传递限制。
10. [React v19.2.8 `ExhaustiveDeps.ts`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/eslint-plugin-react-hooks/src/rules/ExhaustiveDeps.ts#L792-L810) - Effect Event 依赖错误。
11. [React v19.2.8 `ReactFiberWorkLoop.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberWorkLoop.js#L1871-L1874) - render 阶段调用保护。
