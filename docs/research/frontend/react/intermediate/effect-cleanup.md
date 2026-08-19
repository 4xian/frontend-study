# Effect 清理研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.effect-cleanup`
- 标题：`Effect 清理`
- 教学层级：中级
- 核验日期：`2026-08-11`
- 研究状态：官方调研、正文、Demo、临时验证、Admission、独立复审、原子登记与发布后最终验证已完成
- 官方文档基线：React `19.2`
- 仓库运行时基线：React / React DOM `19.2.8`
- 固定源码 tag：`v19.2.8`，commit `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- RC2 路线 TypeScript 基线：`7.0.2`
- 当前本地类型/编译器快照：`@types/react` `19.2.18`、TypeScript `6.0.3`
- 前置课程：`react.core.learn.intermediate.use-effect`（第 20 课，已发布）
- 后续课程：第 22 课 Effect 生命周期、第 23 课不需要 Effect、第 24 课 Effect 依赖、第 25 课移除
  Effect 依赖、第 26 课 Effect Event、第 27 课自定义 Hook、第 28 课 `useLayoutEffect`，以及计划中的
  第 29 课能力
- 当前路线状态：第 1-21 课 `available`，第 22-29 课 `planned`，权威进度 `21/29`

### 当前正式资产核对

- 第 20 课研究记录 [`use-effect.md`](./use-effect.md) 与本记录均已完成正文、同源 Demo、验证和复审闭环。
- `src/categories/frontend/react/core/react-core-track.ts` 的第 1-21 课为 `available`，第 22-29 课为 `planned`。
- `src/categories/frontend/react/core/entry-manifest.ts` 已登记 `effect-cleanup` loader；demo manifest 已登记
  `react.core.learn.intermediate.effect-cleanup.event-listener-symmetry-demo`，运行与展示源码指向同一 TSX。
- 第 21 课正文、Demo/CSS、Admission、双轴复审与发布后最终验证均已完成，并在双轴通过后原子登记。

本课唯一主线是：**Effect 的 setup 建立一个外部事件监听资源，返回的 cleanup 用同一个目标、事件类型和处理函数
撤销上一轮监听；依赖变化时先撤销旧资源再建立新资源，组件移除时撤销最后一轮资源。** 课程不把“清理”解释成
组件生命周期总图，而是用一条可观察的事件监听合同证明建立与撤销必须成对。

### 与相邻课程的硬边界

| 课程 | 主线 | 本课边界 |
| --- | --- | --- |
| 第 20 课 `useEffect` | 提交后运行 setup，把值同步到外部系统 | 本课承接它的 setup 入口，只增加资源撤销，不重复解释 Effect 为什么存在 |
| 第 21 课 `effect-cleanup` | setup/cleanup 对称撤销连接、监听等资源 | 只用一个确定性事件监听资源；不并列讲连接、timer、请求取消的完整实现 |
| 第 22 课 `effect-lifecycle` | 按独立同步过程理解开始、停止与重新同步 | 只证明旧 cleanup 在新 setup 前执行和卸载时最后执行，不展开生命周期心智模型或依赖推导 |
| 第 23 课 `unnecessary-effects` | 把渲染计算和用户事件留在正确阶段 | 不把“应不应该使用 Effect”的重构作为本课主线；只指出事件监听是外部资源 |
| 第 24 课 `effect-dependencies` | 识别 setup 读取的响应值并声明依赖 | Demo 使用固定内联依赖 `[channel]`，不讲 exhaustive-deps 的完整判断规则 |
| 第 25 课 `removing-effect-dependencies` | 改写数据流减少依赖 | 不介绍对象/函数依赖消除、状态更新重写或抑制 lint |
| 第 26 课 `effect-events` | 提取读取最新值的非响应逻辑 | 不使用 `useEffectEvent`，不讨论响应与非响应逻辑分离 |
| 第 27 课 `custom-hooks` | 复用有状态逻辑 | Demo 保持组件内直接调用 `useEffect`，不抽取自定义 Hook |
| 第 28 课 `useLayoutEffect` | 绘制前布局测量和阻塞边界 | 不测量 DOM、不使用 `useLayoutEffect`，不讨论视觉时序 |
| 第 29 课 | 当前计划实际冻结为 `useInsertionEffect` | 不进入该课；任务描述另称 `useSyncExternalStore`，二者都排除，见“路线差异”说明 |

### 路线差异与不越界处理

任务输入把第 29 课称为 `useSyncExternalStore`，但当前权威文件 `RC2-中级课程单知识点计划.md` 第 66 行和
`react-core-track.ts` 第 248-251 行实际冻结为 `useInsertionEffect`，且二者状态均为 `planned`。本调研没有权限
修改路线文件，因此不把这个差异静默改写成课程事实；第 21 课不研究、实现或比较 `useSyncExternalStore`，也不
研究 `useInsertionEffect`。开始第 29 课前应先由路线维护者决定是否修订计划。

## 调研问题

1. React 19.2 对 Effect setup 返回 cleanup 的公共合同是什么？
2. 依赖变化和组件移除时，React 何时调用 cleanup，cleanup 与下一轮 setup 的相对顺序是什么？
3. 事件监听为什么必须用同一资源和处理函数建立/撤销？
4. React 19.2 的官方教程和 Strict Mode 如何证明缺少清理会造成重复活跃资源？
5. `v19.2.8` 固定源码和测试如何支持 cleanup 被保存、调用，并且先于下一轮 setup？
6. 如何设计确定性、同源、单主线 Demo，并把 TypeScript、语义、工程、三视口和双轴复审合同留给实现阶段？

## Tavily 检索与官方 canonical 核验

外部发现严格先走 Tavily：执行 7 次 `tavily_search`，覆盖 `useEffect` Reference、Effect 同步教程、Strict
Mode、固定版本源码和固定版本测试；随后执行 1 次 `tavily_extract`，抽取 4 个 React canonical 页面。搜索结果中
只保留 `react.dev` 和 `github.com/facebook/react` 的官方页面，第三方文章、Issue、MDN 和其他仓库不作为课程
事实来源。没有切换 Exa、Parallel、Perplexity 或原生搜索。候选页面正文再用 `curl -L --fail --silent --show-error`
取得 Markdown/固定 raw 内容，并以行号核对下表锚点。
来源编号保留本轮审计 ID；原 S1 `react.dev/versions` 仅是版本元数据，超出用户限定的 learn/reference 与固定源码/测试
范围，已移除。

### Search 查询记录

1. `site:react.dev/reference/react/useEffect cleanup before setup changed dependencies unmount React 19.2`
2. `site:react.dev/learn/synchronizing-with-effects cleanup event listener subscribe unsubscribe addEventListener removeEventListener`
3. `site:react.dev/learn/lifecycle-of-reactive-effects cleanup before next setup unmount boundary React 19.2`
4. `site:github.com/facebook/react/blob/v19.2.8 ReactFiberCommitEffects commitHookEffectListUnmount destroy cleanup`
5. `site:github.com/facebook/react/blob/v19.2.8 ReactHooksWithNoopRenderer-test cleanup before next effect unmount`

### 官方来源表

| 编号 | 来源 | canonical URL | 适用版本 | 支撑事实 |
| --- | --- | --- | --- | --- |
| S2 | `useEffect` Reference 参数与外部系统 | https://react.dev/reference/react/useEffect#parameters | React 19.2 | setup、cleanup、依赖变化先 cleanup 后 setup、卸载时 cleanup |
| S3 | `useEffect` Reference 连接示例 | https://react.dev/reference/react/useEffect#connecting-to-an-external-system | React 19.2 | 连接/断开对称合同、依赖变化的最小时序 |
| S4 | `useEffect` Reference 清理诊断 | https://react.dev/reference/react/useEffect#my-cleanup-logic-runs-even-though-my-component-didnt-unmount | React 19.2 | cleanup 不只在卸载运行、对称清理与 cleanup-only smell |
| S5 | Synchronizing with Effects：添加清理 | https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed | React 19.2 | `connect`/`disconnect`、订阅/退订、每次重跑前与卸载时清理 |
| S6 | Synchronizing with Effects：事件订阅 | https://react.dev/learn/synchronizing-with-effects#subscribing-to-events | React 19.2 | `addEventListener` 与同一 handler 的 `removeEventListener` |
| S7 | Strict Mode：重跑 Effect | https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-effects-in-development | React 19.2 | 开发期额外 setup+cleanup 检查，缺少 cleanup 时活跃连接增加 |
| S8 | Lifecycle of Reactive Effects（仅作边界） | https://react.dev/learn/lifecycle-of-reactive-effects | React 19.2 | 课程第 22 课的独立同步过程边界，本课不展开其完整心智模型 |
| S9 | You Might Not Need an Effect（仅作边界） | https://react.dev/learn/you-might-not-need-an-effect | React 19.2 | 无外部系统时不要默认添加 Effect，本课不做重构主线 |
| S10 | Removing Effect Dependencies（仅作边界） | https://react.dev/learn/removing-effect-dependencies | React 19.2 | 依赖治理留给第 24-25 课 |
| S11 | Separating Events from Effects（仅作边界） | https://react.dev/learn/separating-events-from-effects | React 19.2 | Effect Event 留给第 26 课 |
| S12 | `ReactFiberCommitEffects.js` | https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177 | `v19.2.8` | commit 阶段调用 `create()` 并保存返回值为内部 destroy |
| S13 | `ReactFiberCommitEffects.js` 卸载 | https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248-L290 | `v19.2.8` | 读取并清空 destroy，再安全调用 cleanup |
| S14 | `ReactFiberWorkLoop.js` | https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberWorkLoop.js#L4546-L4556 | `v19.2.8` | passive 阶段先调用 `commitPassiveUnmountEffects`，再调用 `commitPassiveMountEffects` |
| S15 | 官方 Effect 测试：旧 Effect | https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1676-L1729 | `v19.2.8` | 依赖变化时日志严格为旧 destroy 后新 create；卸载时调用最后 destroy |
| S16 | 官方 Effect 测试：全部旧 Effect | https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1888-L1927 | `v19.2.8` | 同一提交中全部旧 cleanup 在任一新 setup 前完成 |

### 精确锚点核对

- S2 Markdown 第 47-49 行给出 setup/cleanup/依赖参数的逐字合同，第 53 行说明 Hook 返回 `undefined`，第 61 行说明
  Strict Mode 额外 setup+cleanup。
- S5 Markdown 第 545-558 行给出“每次 Effect 再运行前 cleanup、卸载时最后一次 cleanup”，S6 Markdown 第 653-667 行给出事件
  监听的同 handler 建立/撤销和开发期仍只有一个活跃订阅。
- S4 Markdown 第 1831-1853 行明确 cleanup 不只在卸载执行，且 cleanup 必须与 setup 对称；第 1862 行把绘制前布局
  工作指向 `useLayoutEffect`，不纳入本课。
- S12 第 141-177 行把 setup 返回值写入内部 `inst.destroy`；S13 第 248-290 行取出、置空并调用该 destroy；S14
  第 4549-4556 行以调用顺序证明 passive cleanup 阶段先于 passive setup 阶段。
- S15 第 1696-1705 行的官方日志为 `Did destroy [0]` 后 `Did create [1]`，第 1727-1729 行证明移除后执行最后
  一次 destroy；S16 第 1914-1926 行证明全部旧 cleanup 先于新 setup。

## 官方事实与源码证据

### 1. setup 返回的是可选 cleanup

官方 `useEffect` Reference 把 setup 定义为无参数函数，可选返回 cleanup；Hook 自身返回 `undefined`。当组件提交时
运行 setup，setup 不应把普通方法的返回值误当 cleanup。cleanup 必须由 setup 返回，且只承担撤销该次 setup 建立的外部
资源。

React 固定源码在 commit effect 阶段调用 `effect.create()`，将结果写入内部 `inst.destroy`（S12，第 141-177 行）。
卸载路径随后读取 `inst.destroy`，先置为 `undefined`，再调用 `safelyCallDestroy`（S13，第 248-290 行）。这些
函数名和 Fiber 字段是生产证据，不是课程公共 API；课程只采用“setup 返回 cleanup，React 在正确时机调用”这一公共
结论。

### 2. 旧资源先清理，再建立新资源

当一次提交使固定依赖变化，官方合同是用旧 Props/State 运行上一轮 cleanup，再用新 Props/State 运行下一轮 setup（S2、
S3）。`ReactFiberWorkLoop.js` 的 passive 阶段先调用 `commitPassiveUnmountEffects`，再调用
`commitPassiveMountEffects`（S14），官方测试也把日志固定为旧 destroy 在新 create 前（S15、S16）。

本课只把这个顺序用于解释“不能让旧监听器和新监听器同时活跃”；不会把它扩展成第 22 课的组件生命周期或完整重同步
图。

### 3. 监听必须用同一资源和同一处理函数成对撤销

官方同步教程的事件订阅示例在 setup 内定义 `handleScroll`，调用 `window.addEventListener('scroll', handleScroll)`，
cleanup 再以同一 `window`、同一事件类型和同一 handler 调用 `removeEventListener`（S6，第 653-667 行）。这不是“卸载
时顺便做点事”，而是建立和撤销同一份外部资源的对称合同。课程 Demo 采用本地确定性事件源，保留同样的 handler 身份
和 add/remove 对称，不触碰全局窗口或网络。

### 4. Strict Mode 验证最终资源状态，不是业务调用次数

React 19.2 在开发 Strict Mode 中会在首次真实 setup 前额外执行一次 setup+cleanup（S2、S7）。官方教程明确指出，
事件订阅会观察到 `addEventListener`、`removeEventListener`、再 `addEventListener`，但活跃订阅仍只有一份（S6）。
因此 Demo 验收检查“当前监听目标收到一次事件、旧目标收不到、卸载后没有收到”，不把 setup/cleanup 原始调用次数当业务
合同。

### 5. cleanup-only 是警报，不能成为独立副作用

Reference 将“没有对应 setup 的 cleanup”列为 code smell（S4，第 1833-1844 行）。课程中的 cleanup 必须紧邻其 setup
并撤销同一监听，不能在 cleanup 中启动另一监听、写入无关全局状态或补偿一个没有建立的资源。

## TypeScript 合同

本地 `@types/react` `19.2.18` 的声明（仅用于仓库生产 Gate，不冒充 React 运行时来源）为：

```ts
type Destructor = () => void | { [UNDEFINED_VOID_ONLY]: never }
type DependencyList = readonly unknown[]
type EffectCallback = () => void | Destructor
function useEffect(effect: EffectCallback, deps?: DependencyList): void
```

第 21 课临时 fixture 固定采用 TypeScript `7.0.2` 命令，不使用仓库当前 TypeScript `6.0.3` 代替路线版本。事件源
和监听器合同可写成：

```tsx
type SignalListener = (message: string) => void

/** 提供可观察的本地事件资源，并保持监听器集合确定。 */
class SignalChannel {
  private readonly listeners = new Set<SignalListener>()

  /** 注册一个本地消息监听器，供当前 Effect setup 持有。 */
  addListener(listener: SignalListener): void {
    this.listeners.add(listener)
  }

  /** 撤销 setup 注册的同一消息监听器，保持资源建立与撤销对称。 */
  removeListener(listener: SignalListener): void {
    this.listeners.delete(listener)
  }

  /** 向当前频道的全部监听器发布固定消息，提供可重复的观察输入。 */
  emit(): void {
    const message = 'signal'
    for (const listener of this.listeners) listener(message)
  }

  /** 返回当前频道仍持有的监听器数量，供 Demo 结果区做资源状态核对。 */
  snapshot(): { activeListeners: number } {
    return { activeListeners: this.listeners.size }
  }
}

/** 为当前频道建立监听，并在下一轮 setup 或卸载时撤销同一监听。 */
function useChannelListener(channel: SignalChannel, onMessage: SignalListener): void {
  useEffect(() => {
    channel.addListener(onMessage)
    return () => {
      channel.removeListener(onMessage)
    }
  }, [channel, onMessage])
}
```

生产实现需要把 `onMessage` 保持为稳定输入，或在后续依赖课程中处理其响应性；本课不展开依赖治理。临时 Gate 只验证：

- `useEffect` 的 setup 只返回函数或 `undefined`，不把 `addListener`/`removeListener` 的调用结果当 cleanup；
- cleanup 使用相同 `channel` 和 `onMessage`，`SignalListener` 的字符串参数不被错误扩宽；
- `useEffect` 返回值不可赋给业务变量，组件顶层调用 Hook；
- TypeScript `7.0.2` 严格模式下 `tsc --noEmit` 通过。

## 高价值易错点

### 1. 只建立监听，不返回 cleanup

- **错误名称：** 监听器累积。
- **触发条件：** setup 调用 `channel.addListener(handleMessage)`，却没有返回移除逻辑。
- **原因：** React 没有可调用的 cleanup；依赖变化或开发 Strict Mode 会留下旧监听。
- **后果：** 一次事件被旧处理函数和新处理函数重复处理，甚至在组件离开后仍修改外部状态。
- **错误示例：**

```tsx
/** 错误：建立监听后没有把撤销动作交给 React。 */
function WrongSubscriber({ channel }: { channel: SignalChannel }) {
  useEffect(() => {
    channel.addListener(message => console.log(message))
  }, [channel])
  return null
}
```

- **正确写法：** 在同一 setup 中返回 cleanup，并移除这一次建立的处理函数。
- **验证方式：** 在 Strict Mode 冷会话中切换频道并发布一次消息；当前频道只产生一条接收记录，卸载后记录不再增加。
- **来源：** S5、S6、S7。

### 2. remove 使用了不同的处理函数

- **错误名称：** 清理动作与建立动作不对称。
- **触发条件：** setup 用一个函数注册，cleanup 重新创建另一个看起来相同的函数再移除。
- **原因：** 事件源需要撤销实际注册的那份监听器身份；代码文本相同不代表函数引用相同。
- **后果：** `remove` 不会撤销旧监听，依赖变化和卸载后仍可能收到消息。
- **错误示例：**

```tsx
/** 错误：cleanup 重新创建函数，无法撤销 setup 注册的引用。 */
function WrongHandlerIdentity({ channel }: { channel: SignalChannel }) {
  useEffect(() => {
    channel.addListener(message => console.log(message))
    return () => channel.removeListener(message => console.log(message))
  }, [channel])
  return null
}
```

- **正确写法：** 先把 handler 保存到 setup 的局部变量，再在 cleanup 中使用同一个变量。
- **验证方式：** 先切换频道再卸载；旧频道和已卸载组件均不得再产生接收记录，活跃监听数回到 `0`。
- **来源：** S6 的同一 `handleScroll` add/remove 示例；S15、S16 的旧 Effect 清理测试。

### 3. 把移除调用直接写成 setup 的返回值

- **错误名称：** 立即移除而不是返回 cleanup。
- **触发条件：** 写成 `return channel.removeListener(onMessage)`，使 remove 在 setup 返回前立即执行。
- **原因：** cleanup 应是“稍后调用的函数”；这里返回的是移除方法的 `void` 结果，而不是函数。
- **后果：** 监听从未在 Effect 活跃期间存在，或 TypeScript/运行时表现与作者意图不一致。
- **错误示例：**

```tsx
/** 错误：remove 在 setup 阶段立即执行，没有留下 cleanup 函数。 */
function WrongImmediateRemoval({ channel, onMessage }: Props) {
  useEffect(() => {
    channel.addListener(onMessage)
    return channel.removeListener(onMessage)
  }, [channel, onMessage])
  return null
}
```

- **正确写法：** 使用函数体 `return () => channel.removeListener(onMessage)`。
- **验证方式：** setup 完成后发布事件应能收到；切换或卸载后再发布不得收到。
- **来源：** S2 的 setup 返回 cleanup 函数合同；S5、S6。

### 4. cleanup 不撤销对应资源而建立新资源

- **错误名称：** 清理阶段产生新的监听。
- **触发条件：** cleanup 中再次调用 `addListener`、发布业务事件或启动另一个外部工作。
- **原因：** cleanup 的职责是停止或撤销上一轮 setup 做过的工作，不能把新工作隐藏在清理阶段。
- **后果：** 资源数量随重同步增加，Strict Mode 会立即暴露活跃监听异常。
- **错误示例：**

```tsx
/** 错误：cleanup 没有撤销旧监听，反而注册了另一份监听。 */
function WrongCleanupDirection({ channel, onMessage }: Props) {
  useEffect(() => {
    channel.addListener(onMessage)
    return () => channel.addListener(onMessage)
  }, [channel, onMessage])
  return null
}
```

- **正确写法：** cleanup 只调用与 setup 相反的 `removeListener`。
- **验证方式：** 重复切换两次后发布一次事件；最终活跃监听数应最多为 `1`，不应按历史切换次数增长。
- **来源：** S4 的对称清理与 cleanup-only smell；S7。

### 5. 用 Ref 标记“已运行”来跳过 cleanup

- **错误名称：** 用一次性护栏掩盖资源泄漏。
- **触发条件：** 用 `useRef(false)` 阻止第二次 setup，却没有返回真正的 cleanup。
- **原因：** Strict Mode 的额外 setup 是为了检验 setup→cleanup→setup 是否可重复；阻止 setup 不会撤销旧资源，
  也不能处理真正的卸载或依赖变化。
- **后果：** 开发日志似乎“只执行一次”，但导航离开、切换频道或真实重挂载后监听仍然存在。
- **错误示例：**

```tsx
/** 错误：只压制第二次 setup，没有撤销第一份监听。 */
function WrongRunOnce({ channel, onMessage }: Props) {
  const didRun = useRef(false)
  useEffect(() => {
    if (didRun.current) return
    didRun.current = true
    channel.addListener(onMessage)
  }, [channel, onMessage])
  return null
}
```

- **正确写法：** 保持 setup 可重复，返回对称 cleanup；不要把开发期调用次数当业务合同。
- **验证方式：** Strict Mode 开启时检查最终事件行为和活跃订阅，而非 `setup` 日志次数；卸载后确认不再接收。
- **来源：** S3、S7；S6 的开发期 add/remove/add 事件监听说明。

### 6. cleanup 只有条件分支而 setup 没有对应资源

- **错误名称：** 无资源的 cleanup-only 分支。
- **触发条件：** Effect 总是返回 cleanup，但某个条件分支没有建立监听，cleanup 却仍执行移除或其他工作。
- **原因：** cleanup 必须镜像同一轮 setup；不存在的资源不应由无关分支负责清理。
- **后果：** 产生误导性日志、异常的移除调用，或在状态切换时清理了别的资源。
- **错误示例：**

```tsx
/** 错误：disabled 时没有 setup，却仍返回与资源无关的 cleanup。 */
function WrongConditionalResource({ enabled, channel, onMessage }: Props & { enabled: boolean }) {
  useEffect(() => {
    if (enabled) channel.addListener(onMessage)
    return () => channel.removeListener(onMessage)
  }, [enabled, channel, onMessage])
  return null
}
```

- **正确写法：** 让条件决定是否建立资源，并在建立资源的同一分支返回对应 cleanup；没有资源时返回 `undefined`。
- **验证方式：** `enabled=false` 的冷启动不应出现移除计数；`true -> false` 只撤销真实存在的监听。
- **来源：** S4 对 cleanup-only 的明确警告；S2 的 setup 可选 cleanup 合同。

### 7. 用 cleanup 日志次数代替资源状态验证

- **错误名称：** 把 Strict Mode 探针当成生产调用合同。
- **触发条件：** 断言 setup/cleanup 必须各执行一次，或以日志次数判断是否有泄漏。
- **原因：** React 19.2 开发 Strict Mode 允许额外 setup+cleanup；真正合同是用户最终只能观察到一份有效资源。
- **后果：** 正确实现被误报为重复，或泄漏实现通过了“只运行一次”的伪测试。
- **错误示例：**

```tsx
/** 错误：把 setup 调用次数写成业务状态，而不是验证监听是否仍然有效。 */
function WrongCallCountContract({ channel, onMessage }: Props) {
  const setupCount = useRef(0)
  useEffect(() => {
    setupCount.current += 1
    channel.addListener(onMessage)
    return () => channel.removeListener(onMessage)
  }, [channel, onMessage])
  return <output>{setupCount.current === 1 ? '一次' : '重复'}</output>
}
```

- **正确写法：** 断言当前频道接收一次、旧频道不接收、卸载后不接收，并允许开发期额外探针。
- **正确示例：**

```tsx
/** 正确：根据最终资源行为判断当前监听是否唯一且可撤销。 */
function RightResourceContract({ channel, onMessage }: Props) {
  useEffect(() => {
    channel.addListener(onMessage)
    return () => channel.removeListener(onMessage)
  }, [channel, onMessage])
  return <output>按事件结果核对监听</output>
}
```

- **验证方式：** 1440px、390px 与 390px+200% 冷会话均按事件路径验收；console/page error/warning 均为 `0`。
- **来源：** S2、S6、S7。

## 源码推导与适用场景

### 推导 1：cleanup 是上一轮 setup 的资源所有权

1. **官方事实：** Reference 要求 cleanup 停止或撤销 setup 做过的事情；事件订阅的官方最小写法是同一 handler 的
   add/remove（S4、S6）。
2. **源码事实：** `v19.2.8` 在 commit 阶段保存 setup 返回值，并在 unmount 路径取出、置空、调用该返回值（S12、S13）。
3. **课程推导：** Demo 中 `channel.addListener(handler)` 与 `channel.removeListener(handler)` 必须处于
   同一 Effect 的一对 setup/cleanup 中；handler 只属于这一轮订阅。
4. **适用边界：** 无外部资源的纯同步 widget 可不需要 cleanup；一旦注册 listener、建立连接或拥有需要撤销的资源，就要
   返回对称 cleanup。timer、请求取消和 Observer 仅作为同类合同，不在本课实现。

### 推导 2：依赖变化是资源替换，不是并存

1. **官方事实：** 依赖变化的提交先用旧值 cleanup，再用新值 setup；组件移除时执行最后 cleanup（S2、S3）。
2. **源码/测试事实：** passive 阶段调用顺序和官方测试日志都证明所有旧 destroy 先于新 create（S14-S16）。
3. **课程推导：** Demo 切换 `channel` 后，旧频道必须不再接收消息，新频道只拥有一份监听；不能靠“新监听覆盖旧监听”或
   通过全局布尔值互相抵消。
4. **适用边界：** `[channel]` 只用于展示资源目标改变，不讲完整响应值分析、对象/函数依赖治理或 Effect Event。

### 推导 3：卸载验证应观察“无后续影响”

1. **官方事实：** 组件移除后 React 会执行最后一次 cleanup（S2、S5）。
2. **课程推导：** Demo 把事件发布按钮留在订阅组件外；卸载订阅组件后再次发布，接收记录不应增加，这比只观察日志
   更直接地证明外部资源已经撤销。
3. **适用边界：** 这不是对 React 内部调度或 passive flush 时机的承诺；验证只针对用户可观察的资源结果。

## 确定性同源 Demo 合同

### 资产建议

- Demo ID：`react.core.learn.intermediate.effect-cleanup.event-listener-symmetry-demo`
- 运行与展示源码：`src/categories/frontend/react/core/demos/effect-cleanup/event-listener-symmetry-demo.tsx`
- 样式：`src/categories/frontend/react/core/demos/effect-cleanup/event-listener-symmetry-demo.css`
- 当前状态：正文与 Demo/CSS 已创建，全部发布前 Gate 通过后已登记 manifest 并切为 `available`。

### 资源与组件合同

1. `SignalChannel` 是同一 TSX 文件内的确定性本地事件源；以 `Set<SignalListener>` 保存活动监听，并以频道内计数、
   最近消息和稳定刷新回调提供可观察结果，不访问网络、`window` 全局事件、timer、Promise、随机数、动画或外部 store。
2. 事件源提供 `addListener(listener)`、`removeListener(listener)`、`emit()` 与 `snapshot()`；移除使用同一 listener
   引用，`emit()` 只向当前活动监听分发并更新该频道结果，`snapshot()` 只暴露验证所需的活动数和接收结果。
3. Demo 固定创建 `alpha` 与 `beta` 两个频道，初始订阅 `alpha`；选择频道只改变 `channel` prop，触发上一轮
   cleanup 后建立下一轮 setup。
4. 订阅组件顶层只声明一个 Effect：定义 handler、注册一次监听，并返回移除同一 handler 的 cleanup；依赖采用固定内联
   `[channel]`。不抽取自定义 Hook，不使用 `useEffectEvent`。
5. 组件外的发送按钮分别调用当前频道或另一频道的 `emit()`；当前订阅频道接收一次，非当前频道和卸载后的组件不应接收。
   结果区通过 `snapshot()` 分别显示两个频道的已接收数量、最近消息和活动 listener 数，不依赖时间间隔或网络响应。
6. “卸载监听”只卸载订阅子组件，发布按钮和结果区保留；卸载后发布两频道都不得新增接收记录；重新挂载后初始频道
   和单一监听恢复。
7. 运行组件和“查看源码”必须从同一 TSX 文件加载；以 `trimEnd()` 后字符数、UTF-8 字节数和 SHA-256 核对同源，禁止
   复制另一份展示代码。

### 可观察路径

1. 冷启动：`alpha` 已订阅，`alpha` 的 `snapshot().activeListeners` 为 `1`、`beta` 为 `0`（Strict Mode 瞬时探针不作为
   业务计数），页面无外部请求。
2. 向当前 `alpha` 发布时已接收数量增加一条；向另一 `beta` 发布时已接收数量不增加。
3. 切换到 `beta` 后，先向旧 `alpha` 发布验证旧监听已被撤销，再向新 `beta` 发布验证新监听已建立且只处理一次。
4. 点击“卸载监听”后发布两个频道，接收列表保持不变；再点击“重新挂载”并发布当前频道，恰好新增一条。
5. 浏览器只检查可读结果、频道监听数、按钮可操作性和同源源码，不读取 Fiber、Effect queue 或私有 flag。

## 临时 TypeScript 7.0.2 Gate

在 `/tmp/effect-cleanup-ts` 创建最小 `.tsx` fixture，验证后删除并执行 `test ! -e /tmp/effect-cleanup-ts`。不得把
fixture、依赖链接或编译输出写入仓库。命令合同：

```sh
npx --yes --package typescript@7.0.2 tsc \
  --ignoreConfig --jsx react-jsx --strict --noEmit --skipLibCheck \
  --moduleResolution node16 --module node16 --target es2022 --esModuleInterop \
  /tmp/effect-cleanup-ts/fixture.tsx
```

fixture 最少验证：

- `SignalListener = (message: string) => void` 与 `SignalChannel` 的 add/remove 同源签名；
- `useEffect` 在组件顶层注册 listener，并返回 `() => removeListener(listener)`；
- `channel` 改变时旧 cleanup 和新 setup 类型均通过；setup 不返回 `void` 之外的调用结果；
- `return channel.removeListener(listener)`、不同 handler 引用、条件 Hook 等错误各保留一条
  `@ts-expect-error` 或语义注释，不增加持久测试文件。

## 临时语义 Gate

当前实现快照在 `/tmp` 生成最小静态扫描/Node 断言并删除临时目录：

- 只有一个 Effect 主线和一个事件监听资源；setup 与 cleanup 都使用同一个 `channel`、事件名和 handler 引用；
- cleanup 只撤销 setup 建立的 listener，不注册 listener、发布业务事件、创建 timer、发网络请求或更新无关全局状态；
- 只有固定内联依赖 `[channel]`，不引入第 24-26 课的依赖治理、`useEffectEvent` 或动态依赖拼接；
- 无 `setInterval`/`setTimeout`、`fetch`/XHR、Promise、随机数、动画、Observer、Portal、外部 store、
  `useLayoutEffect`、`useSyncExternalStore` 或 `useInsertionEffect`；
- 所有新增函数、组件、类构造函数和方法上方有简洁中文职责注释；若新增 CSS，禁止 `grid`、`gap` 和非零
  `letter-spacing`；
- 运行 TSX 与展示源码为同一文件，`trimEnd()` 后字符数、UTF-8 字节数和 SHA-256 完全一致。

## 工程与 Catalog Gate

本课正文/Demo 实施与发布阶段运行下列命令；浏览器 Admission 只使用可恢复的临时登记：

```sh
npm run type-check
npm run lint
npm run format:check
npm run build
npm run test:unit
npm run test:e2e
git diff --check -- docs/research/frontend/react/intermediate/effect-cleanup.md \
  src/categories/frontend/react/core/learn/effect-cleanup.md \
  src/categories/frontend/react/core/demos/effect-cleanup/
```

不得创建持久测试、fixture、截图、trace 或浏览器输出。若浏览器适配需要 Catalog 条目，只能使用临时 overlay，记录
overlay 前后 manifest/track 哈希，冷会话验证后恢复 planned 基线，并以 `test ! -e` 确认临时资产删除。

## 三视口浏览器 Gate

用 Playwright 冷会话从 `about:blank` 进入实现后的课程，监听 HTTP、console error/warning 和 page error：

1. `1440px`：完成冷启动、发布当前频道、发布非当前频道、切换频道、旧频道再发布、新频道发布、卸载、发布、重新挂载
   的完整路径；每次当前频道最多产生一条接收记录，最终无 error/warning。
2. `390px`：重复完整路径，课程目录、Demo、按钮和结果列表无横向溢出、裁切、遮挡；发布与频道切换仍可操作。
3. `390px + 200%`：把根字号设为 `32px`，重复关键路径；按钮换行不改变语义，页面横向滚动为 `0`。
4. 重复进入/离开：重新进入后初始频道和监听数回到确定值，不继承上一轮实例或历史消息；不产生重复 React root warning。

### Admission 实施证据

- TypeScript `7.0.2` 临时 fixture、仓库 type-check、lint、format、单 Effect 与固定 `[channel]` 语义扫描均通过；
  fixture 与浏览器目录均已删除并确认不存在。
- Admission overlay 下，`1440px`、`390px` 与 `390px + 32px` 根字号均完成当前频道发送、非当前频道发送、
  切换、旧频道发送、新频道发送、卸载后双频道发送、重新挂载、再次发送与重置；页面、Demo 和按钮溢出均为 `0`，
  console error/warning 与失败请求均为 `0`。
- 路由离开到第 20 课再返回后恢复 `alpha listener=1`、`beta listener=0` 与两频道接收数 `0`；没有复用上一轮实例状态。
- 页面展示源码与运行 TSX 的 `trimEnd()` 结果均为 `5058` 字符、`5838` UTF-8 字节，SHA-256 为
  `05f66bb4dbdbce9dbcdbd556ea5f7fa3a93353bd5128e42c7c945e314f60f49c`。
- Admission 后 track、entry manifest、demo manifest 已恢复 planned 基线，SHA-256 依次为
  `ea535693bb4ff16beaa8b6f7f4d62fbd046d97b67c4f80f0bc603e7ea210608e`、
  `d5fa300bb207f8e89153a827900983cf271f2f48675f95291358d0a2cfae9c69`、
  `2cdf2fe63cbef2d3d373c1e3937ad153118daa7ac3243c5abec6b142d9c85ab5`。
- 首轮独立复审为 Standards `FAIL / 1 finding`、Spec `FAIL / 2 findings`；第二轮为 Standards
  `PASS / 0 finding`、Spec `FAIL / 1 finding`。修复生产证据泄漏、状态/API 不一致和旧术语后，第三轮
  Standards 与 Spec 均为 `PASS / 0 finding`，复审对应同一未改动 TSX SHA。

### 发布后生产预览验证

- 在 `http://127.0.0.1:4176` 的全新 Playwright 会话中从 `about:blank` 进入正式课程路由，并完成冷刷新；
  Catalog、课程正文、React Demo 与同源源码均正常加载。
- 生产构建上复跑当前频道发送、非当前频道发送、频道切换、卸载、卸载后发送、重新挂载与重置：任一时刻只有
  当前频道 listener 为 `1`，另一频道为 `0`；卸载后均为 `0`，重新挂载后当前频道恢复为 `1`。
- `1440px`、`390px` 与 `390px + 32px` 根字号下，页面、Demo 和全部控制按钮横向溢出均为 `0`；
  console error/warning、page error、失败请求和状态码不小于 `400` 的响应均为 `0`。

## 独立 Standards / Spec 复审与原子发布

### Standards 轴

独立复审者按课程内容规范、Demo 与交互规范和本记录检查：单一事件监听主线、setup/cleanup 对称、中文职责注释、
React/React DOM 19.2.8 与 TypeScript 7.0.2 边界、同源源码、三视口无溢出、CSS 禁止项、无持久临时资产，以及
第 22-29 课硬边界。任一 finding 都保持本课 `planned`，不能用功能运行结果抵销。

### Spec 轴

独立复审者只检查冻结主线：setup 是否注册一份确定性本地 listener；依赖变化时是否先撤销旧 listener 再建立新 listener；
卸载后是否无后续消息影响；cleanup 是否只镜像 setup；是否错误引入生命周期图、依赖治理、Effect Event、自定义 Hook、
布局 Effect、`useSyncExternalStore` 或 `useInsertionEffect`。两轴必须针对同一冻结 snapshot 达到 `PASS / 0 finding`。

### planned -> available 原子条件

只有以下条件在同一冻结 snapshot 全部通过，才允许发布第 21 课：

1. 本研究记录、正文、同源 Demo/CSS、TypeScript/语义 Gate、工程命令、Catalog overlay、三视口证据和双轴复审均齐全；
2. Standards 与 Spec 独立复审均为 `PASS / 0 finding`，复审针对同一 SHA，不接受陈旧快照；
3. 在一次原子变更中登记第 21 课 entry 与同源 Demo，把 track 第 21 课从 `planned` 切为 `available`，权威进度从
   `20/29` 更新为 `21/29`，随后冷启动 Catalog 并重跑相关路径；
4. 任一单项未闭环都保持第 21 课 `planned`；本次只在双轴通过后执行登记和 track 修改，不提交、暂存或清理无关资产。

## 当前结论

- React 19.2 的公共合同是：Effect setup 可返回 cleanup；依赖变化的提交先执行旧 cleanup 再执行新 setup；组件移除时执行
  最后 cleanup；Hook 自身返回 `undefined`（S2、S3）。
- 事件监听必须把同一资源、事件类型和 handler 的注册/撤销放在同一 Effect；返回 `() => remove...` 才能让 React
  管理资源所有权（S5、S6）。
- 开发 Strict Mode 的额外 setup+cleanup 是可重复性检查；验收最终资源状态和用户可观察事件，不断言固定调用次数（S6、S7）。
- 确定性同源 Demo 主线建议为两个本地频道的单一事件监听：发布非当前频道无接收，切换频道先撤销旧监听，卸载后发布无接收，
  重新挂载后恢复一个监听；不引入 timer、网络请求、生命周期图、依赖治理或后续 Hook。
- 当前权威进度为 `21/29`；第 22-29 课 `planned`，下一课为第 22 课“Effect 生命周期”。任务输入对第 29 课的
  `useSyncExternalStore` 命名与现行计划的 `useInsertionEffect` 不一致，本课未修改路线也未研究两者。

## 参考资料

1. [`useEffect` Reference](https://react.dev/reference/react/useEffect#parameters) - 支撑 setup、cleanup、依赖变化顺序、
   卸载、Strict Mode 和返回值。
2. [`useEffect` 外部系统示例](https://react.dev/reference/react/useEffect#connecting-to-an-external-system) - 支撑连接/断开
   的对称资源合同。
3. [Synchronizing with Effects：添加清理](https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed) -
   支撑 cleanup 停止/撤销 setup 的工作。
4. [Synchronizing with Effects：事件订阅](https://react.dev/learn/synchronizing-with-effects#subscribing-to-events) -
   支撑 add/remove 同一 handler 和 Strict Mode 单一活跃订阅。
5. [Strict Mode：重跑 Effect](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-effects-in-development) -
   支撑开发期额外 setup+cleanup 及缺少 cleanup 的连接泄漏提示。
6. [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) - 仅标注第 22 课边界，不在本课展开。
7. [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) - 仅标注第 23 课边界，不在本课重构。
8. [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies) - 仅标注第 24-25 课边界。
9. [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects) - 仅标注第 26 课边界。
10. [React v19.2.8 `ReactFiberCommitEffects.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177) -
    固定版本 setup 返回值保存证据。
11. [React v19.2.8 `ReactFiberCommitEffects.js` 卸载路径](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248-L290) -
    固定版本 destroy 取出、置空和调用证据。
12. [React v19.2.8 `ReactFiberWorkLoop.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberWorkLoop.js#L4546-L4556) -
    固定版本 passive cleanup 阶段先于 passive setup 阶段证据。
13. [React v19.2.8 Effect 测试](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1676-L1729) -
    固定版本旧 destroy、新 create 与卸载 destroy 的顺序证据。
14. [React v19.2.8 多 Effect 测试](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1888-L1927) -
    固定版本所有旧 cleanup 先于新 setup 的测试证据。
