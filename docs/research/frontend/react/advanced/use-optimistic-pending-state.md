# `useOptimistic` 乐观状态研究记录

## 知识点合同

- 标题：`useOptimistic` 乐观状态
- 目标：解释基础 State、Action 期间的 optimistic State、成功承接、失败回退、纯 `updateFn` 和并发边界。
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react` `19.2.18`
- 固定文档提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`

本记录只研究 `useOptimistic` 的公开用法。组件使用
`useOptimistic(baseState, updateFn)` 在 Action 未完成时显示临时 UI；成功后由应用更新基础 State，失败
或拒绝时未确认的临时输入消失并回到当前基础值。

## 调研方法与来源边界

公共 API 以 React 19.2 Reference 和 React 19 发布说明为准。React 19.2.8 源码与固定测试只用于核对当前
patch 的基础值重放、更新队列和 Action 约束。内部 Fiber、lane、环形队列和 entanglement 不是学习者可依赖
的公共时序合同。

类型形状通过 `@types/react@19.2.18` 核对；成功、失败和基础值变化通过固定 React 官方测试核对。课程不
把真实网络、服务器协议、缓存库、持久化、事务、幂等、重试或冲突合并伪装成 Hook 的能力。

## 官方来源卡

| 编号 | 一手来源 | 本记录采用的事实 |
| --- | --- | --- |
| S1 | [useOptimistic Reference](https://react.dev/reference/react/useOptimistic) | Hook 顶层调用、基础值、optimistic State、返回 setter、Action 约束、纯 reducer、成功承接与失败回退。 |
| S2 | [固定 useOptimistic 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useOptimistic.md) | `value`、`updateFn`、`set` 的公共描述，以及基础值变化时重新计算 optimistic State。 |
| S3 | [React 19 发布说明](https://react.dev/blog/2024/12/05/react-19#new-hook-optimistic-updates) | React 19 引入乐观更新 Hook，等待期间显示临时结果，完成或出错后回到基础值。 |
| S4 | [useTransition Reference](https://react.dev/reference/react/useTransition) | Action、异步 Action、`await` 后重新包裹普通 State 更新和 `isPending` 的职责。 |
| S5 | [固定 ReactFiberHooks](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js) | `useOptimistic` 以 passthrough 作为基础值，pending 更新在新的基础值上重放；Action 外调用有开发提示。 |
| S6 | [固定 ReactAsyncActions 测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactAsyncActions-test.js) | pending 值立即显示，基础值变化后 reducer 重新计算，同一 Action 可多次派发 optimistic 更新。 |
| S7 | [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts) | 无 reducer 和有 reducer 两个重载；setter 返回 `void`，Action 类型可以独立于 State。 |

## API 与类型事实

### 两个重载

```tsx
function useOptimistic<State>(
  passthrough: State,
): [State, (action: State | ((pendingState: State) => State)) => void]

function useOptimistic<State, Action>(
  passthrough: State,
  reducer: (state: State, action: Action) => State,
): [State, (action: Action) => void]
```

第一个参数是当前基础值。省略第二参数时，派发的值或纯 updater 直接描述下一份 State；传入第二参数时，
派发函数接收独立的 Action 输入，`reducer`/`updateFn` 决定临时 State 如何变化。

### 返回值

Hook 始终返回二元组：当前 optimistic State 和派发函数。派发函数没有返回确认结果，也不返回 pending 布尔
值。需要 pending 状态应组合 `useTransition`、`useFormStatus` 或 `useActionState`，不能从二元组中解构
第三项。

### Hook 位置

Hook 只能在组件或自定义 Hook 顶层调用。派发函数只能在 Action、Transition 或支持 Action 的表单提交上下文
中调用；渲染期间和普通事件外直接调用不符合 React 的 Action 约束。

## 官方事实与课程推导

### 1. 基础 State 是确认事实

没有 pending Action 时，optimistic State 服从第一个参数的当前值。Hook 不拥有会自动持久化的第二份业务
State，也不会自动发送请求、保存服务器结果或写入缓存。

### 2. 临时 State 由纯函数派生

派发一次输入后，React 用 `updateFn(currentOptimisticState, input)` 计算临时视图。多个输入在同一个 Hook
上按派发顺序进入队列，后一轮函数看到前一轮的结果。`pending` 字段、临时 ID、错误文案和视觉标记都是应用
返回值中的数据。

### 3. Action 结束决定是否继续显示

Action 成功结束不会自动把临时 State 复制为基础 State。应用必须把真实结果写入基础 State；新的基础值
传回 Hook 后，临时标记消失并收敛到确认结果。

如果 Action 被拒绝，成功路径不更新基础 State，未确认的 optimistic 更新会被撤销。若异常继续抛出，最近
的 Error Boundary 可能替换整个组件子树；因此“回滚”只表示 Hook 放弃 pending 输入，不保证错误边界替换
后仍保留原列表画面。

### 4. 当前基础值而不是固定快照

React 官方测试表明，Action 等待期间基础值变化时，pending 输入会基于新基础值重新计算。失败后显示的是
Action 结束时的当前基础值，而不是 Action 开始时保存的一份旧数组。课程应使用函数式基础 setter，避免用
闭包快照覆盖等待期间的其他确认更新。

### 5. updateFn 必须纯且可重放

纯函数只读取两个参数并返回新 State。不能原地 `push`、修改旧对象、读写模块计数器、读取时间、生成随机
ID、写日志、发起 Promise 或调用其他 setter。基础值变化和开发检查都可能要求重新执行它。

### 6. 输入顺序不提供请求顺序

“甲、乙”按顺序显示，只证明两个 dispatch 在当前 Hook 中按该顺序应用。它不能证明两个网络请求、两个独立
Action 或服务器响应会按相同顺序完成。多个 Action 修改同一资源时，版本、操作 ID、服务器排序、幂等和冲突
合并必须由应用数据层提供。

### 7. 临时身份必须在输入入口确定

临时 ID 应在事件处理器或 Action 入口生成，并作为 input 的稳定字段传给 `updateFn`。若在 reducer 重放时
生成随机 ID，列表 `key` 会变化，行内 State 可能被重置。确认结果可把临时 ID 映射到服务器 ID；身份改变
时是否迁移行内 State 是组件设计问题，不是 Hook 自动完成的工作。

## 相邻能力边界

- `useState` 保存普通事实和本地交互；没有异步确认时直接使用它。
- `useTransition` 提供 Action 容器和 `isPending`，不生成临时业务数据。
- `useActionState` 管理 Action 的前次结果、业务错误和提交结果，不替代乐观视图。
- `useFormStatus` 读取父级 form 的提交状态，不生成临时列表。
- 缓存或数据层可以负责请求去重、失效、重新获取、版本和冲突处理；`useOptimistic` 只负责组件层临时显示。

## Demo 合同

### 状态与输入

Demo 只有一个 `useOptimistic`，基础列表从一条已确认条目开始。一次 Action 在等待前依次派发固定的甲、
乙两个输入；输入拥有稳定 ID，`updateFn` 只追加新对象。

### 可观察反馈

1. 冷启动时基础计数和显示计数相同。
2. 开始 Action 后甲、乙立即按顺序出现并标记“待确认”，基础计数不变。
3. 等待期间可增加一条独立的已确认基础条目；临时输入仍依据当前基础值显示。
4. 确认成功后，甲、乙写入基础 State，两个计数都增加，待确认标记消失。
5. 重新开始后拒绝 Action，基础条目保留，甲、乙消失并显示失败结果。
6. 等待期间的普通备注 State 仍可更新，说明单个 Action 不会自动锁定整个页面。

### 确定性限制

- 不使用真实网络、计时器、随机数、持久化、第三方状态包、表单 API 或缓存库。
- 不观察固定 render 次数、reducer 调用次数、lane 名称或具体毫秒数。
- 只使用内存中的手动 Promise 让学习者决定成功或拒绝。
- 运行 loader 与源码面板使用同一组 TSX、CSS 文件和同一个公共拼接 helper。

## 易错点账本

### 把 optimistic State 当作持久 State

成功后只派发临时输入而不更新基础 State，Action 结束后临时项消失。正确做法是把真实确认结果写回基础
State。

### 在普通事件中直接调用 setter

Action 外调用会触发开发提示，并且没有 Transition 负责维持临时生命周期。正确做法是在 `startTransition`
或表单 Action 中派发。

### 在 updateFn 中产生副作用

突变数组、写外部变量、生成随机 ID或启动异步任务都会在重放时产生重复或不一致结果。正确做法是从输入
预先获得身份，纯函数返回新数组和新对象。

### 失败时恢复固定旧快照

固定快照会抹掉等待期间已经确认的基础更新。正确做法是失败分支不确认本轮输入，让 Hook回到当前基础值。

### 混淆派发顺序和完成顺序

optimistic 队列的可见顺序不构成服务器请求排序保证。正确做法是在数据层处理操作 ID、版本和冲突。

### 误以为 Hook 提供 pending 或错误字段

Hook 只返回 State 和 setter。pending、错误、临时 ID、确认标记都由应用 State 和其他 Action 工具负责。

## 研究结论

`useOptimistic` 的最小正确模型是：基础 State 保存确认事实，Action 中的 optimistic setter 把输入交给
纯 `updateFn`，React 在等待期间显示派生临时 State；成功由新的基础 State 承接，失败则放弃未确认输入并
回到当前基础值。Hook 不提供请求顺序、事务、持久化、错误边界恢复、幂等或冲突合并能力。
