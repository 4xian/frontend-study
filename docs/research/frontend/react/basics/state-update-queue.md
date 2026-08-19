# State 更新队列研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.state-update-queue`
- 标题：State 更新队列
- 教学层级：零基础到进阶
- 核验日期：`2026-08-09`
- 研究状态：已完成，可进入单知识点课程编写
- 运行时基线：React / React DOM `19.2.8`
- 文档基线：React 官方文档 `19.2`
- 固定文档提交：`c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 类型基线：`@types/react` `19.2.18`

本课只回答这些问题：事件处理器中的 State 请求何时被处理、batching 的公共教学模型是什么、直接值
更新如何按当前 render 的快照替换、updater function 如何排队并在下一次 render 中逐个求值、直接值与
updater 混合时顺序如何决定结果，以及 updater 为什么必须纯净。React 18 `createRoot` 下的 automatic
batching 只讲入口和边界，不把它扩展成调度器或浏览器任务模型；`flushSync` 只作为少数第三方集成的
逃生舱边界。

对象 State、数组 State、Reducer、Effect、Ref、Context、Transition、Concurrent Rendering 深入、Fiber /
lane、hydration、服务端渲染、表单和 DOM 测量全部排除。第 13 课已经解释 render、commit、browser
paint 与 State snapshot，本课只引用“当前 render 的值不变”这一前置事实，不重讲组件调用与纯 render
三阶段。

## 研究方法与证据边界

1. 按仓库规则首先用 Tavily，限定 `react.dev` 与 React 官方 GitHub 搜索更新队列、batching 和
   `flushSync`；初次请求返回套餐用量上限错误。2026-08-09 重新搜索已成功定位 React 官方
   `Queueing a Series of State Updates` 与 `useState`，搜索摘要只用于发现入口。
2. 候选结论继续回到官方固定文档提交 `c7d6b700...` 的 `Queueing a Series of State Updates`、
   `useState` 与 `StrictMode` 核验；React 18 automatic batching 使用同一固定提交中的官方升级指南。
3. 仓库当前 `package.json` / lockfile 固定 React / React DOM `19.2.8` 和 `@types/react` `19.2.18`；
   本稿额外以 React 官方 `v19.2.8` tag 锁定运行时 patch，不把内部实现细节写成课程事实。
4. 队列表格采用官方公开教学模型：任意直接值是“replace with value”指令，函数值是 updater，React
   在下一次 render 中按加入顺序应用它们。这个模型用于解释结果，不等同于公开的内部 queue 数据结构。
5. “事件处理器结束后处理更新”描述 React 官方 batching 教学边界；不推导 microtask、scheduler、
   browser task、优先级或跨 root 的内部调度细节。
6. React 18 升级指南的 automatic batching 事实限定为使用 `createRoot` 的客户端树。旧的
   `ReactDOM.render` 兼容行为不作为本课运行时建议；React DOM `19.2.8` 的课程示例统一使用 `createRoot`。
7. TypeScript 只约束 `SetStateAction<S>` 的静态输入形状，不能证明队列何时处理、render 次数、DOM
   是否已提交或 updater 是否纯净。
8. 本记录只服务第 14 课正文与 Demo 设计，不修改课程正文、Demo、manifest、计划或完成状态。

## 官方来源卡

| ID | 一手来源 | 适用范围 | 本课采用的事实 |
| --- | --- | --- | --- |
| `react-runtime-tag` | [React `v19.2.8`](https://github.com/facebook/react/tree/v19.2.8) | React / React DOM `19.2.8` | 锁定本课运行时 patch；不把 Fiber、lane、队列字段或提交子阶段写成公共合同。 |
| `react-queue` | [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) | React 文档 `19.2` | 事件处理器结束后处理更新、batching、直接值替换、updater queue、混合顺序、updater 纯度与 StrictMode 重复调用。 |
| `react-queue-fixed` | [固定 Queueing 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/queueing-a-series-of-state-updates.md) | 文档提交 `c7d6b700...` | 固定本课四种队列示例、逐步求值表格和 Recap。 |
| `react-snapshot` | [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) | React 文档 `19.2` | 当前 render 的 State 值固定；直接值更新使用 handler 创建时看到的值。 |
| `react-snapshot-fixed` | [固定 State snapshot](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/state-as-a-snapshot.md) | 文档提交 `c7d6b700...` | 固定“下一次 render 才得到新值”和值替换推理。 |
| `react-use-state` | [`useState`](https://react.dev/reference/react/useState) | React 文档 `19.2` | `SetStateAction` 的函数语义、updater 纯度、setter 返回值与 StrictMode updater 调用说明。 |
| `react-use-state-fixed` | [固定 useState 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useState.md) | 文档提交 `c7d6b700...` | 固定 updater 参数、队列处理和 troubleshooting 文本。 |
| `react-strict-mode` | [`<StrictMode>`](https://react.dev/reference/react/StrictMode) | React 文档 `19.2` | 开发期调用纯 updater 两次以暴露不纯逻辑，生产环境不启用该额外调用。 |
| `react-strict-mode-fixed` | [固定 StrictMode 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/StrictMode.md) | 文档提交 `c7d6b700...` | 固定开发期双调用与非事件处理器边界。 |
| `react-18-upgrade` | [How to Upgrade to React 18](https://react.dev/blog/2022/03/08/react-18-upgrade-guide) | React 18 官方升级指南 | `createRoot` 开启跨 Promise、timeout、原生 handler 等来源的 automatic batching；`flushSync` 可退出 batching。 |
| `react-18-upgrade-fixed` | [固定 React 18 升级指南](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/blog/2022/03/08/react-18-upgrade-guide.md) | 文档提交 `c7d6b700...` | 固定 React 18 前后 batching 对比和 `createRoot` 前提。 |
| `react-flush-sync` | [`flushSync`](https://react.dev/reference/react-dom/flushSync) | React DOM 文档 `19.2` | `flushSync(callback)` 可强制同步应用 callback 内更新；少用、可能影响性能，只保留第三方集成边界。 |
| `react-flush-sync-fixed` | [固定 flushSync 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/flushSync.md) | 文档提交 `c7d6b700...` | 固定返回 `undefined`、可能冲刷 pending work / Effects 和“last resort”警告。 |
| `react-types` | [`@types/react@19.2.18`](https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts) | 固定类型声明 | `SetStateAction<S> = S \| ((prevState: S) => S)` 与 `Dispatch<A> = (value: A) => void`。 |

## 一、事实矩阵：把请求、队列与 render 分开

| 事实 | 精确含义 | 不应推出的结论 | 来源 |
| --- | --- | --- | --- |
| setter 请求 render | 调用 setter 把一个 State 更新请求交给 React | 当前 handler 的局部变量立即变化 | `react-snapshot`、`react-use-state` |
| 事件内 batching | React 等事件处理器中的代码完成后再处理这批更新，避免半成品 UI | 任意异步 Promise 都会被当前 handler 等待 | `react-queue` |
| 直接值更新 | `setNumber(5)` 作为“replace with 5”放进队列 | 它会按当前 `number` 自动加一 | `react-queue` |
| updater | `setNumber(n => n + 1)` 把纯函数加入队列 | updater 在 setter 调用点立即拿到最终 State | `react-queue`、`react-use-state` |
| 队列顺序 | 下一次 render 按加入顺序应用直接值和 updater | 后加入的 updater 可以跳过前面所有指令 | `react-queue` |
| React 18 automatic batching | `createRoot` 下 timeout、Promise、原生 handler 等来源也默认合并更新 | 所有 React 更新都必须手动 flush | `react-18-upgrade` |
| `flushSync` | callback 内更新可强制同步到 DOM | 它是普通 setter 或性能优化默认方案 | `react-flush-sync` |
| updater 纯度 | updater 只接收 pending state 并返回 next state | 可在 updater 中请求 State、写外部系统或修改输入 | `react-queue`、`react-strict-mode` |
| StrictMode 双调用 | 开发期额外调用应纯函数并丢弃一次结果以发现 impurity | 生产环境或事件处理器必然执行两次 | `react-strict-mode` |

## 二、事件结束后才处理更新：batching 的公共模型

### 2.1 一次 React 事件是一批请求

下面的代码运行在同一个 React click handler 中：

```tsx
import { useState } from 'react'

// 演示同一事件中连续提交三个直接值请求。
export function DirectValueCounter() {
  const [number, setNumber] = useState(0)

  // React 会在这个 handler 的代码完成后处理更新队列。
  function handleClick() {
    setNumber(number + 1)
    setNumber(number + 1)
    setNumber(number + 1)
  }

  return <button onClick={handleClick}>当前：{number}，连续加一</button>
}
```

React 不会在第一个 `setNumber` 返回后立刻重新执行组件，再执行第二行 handler。它先让当前事件处理器
中的代码完成，然后处理这批 State 更新并安排后续 render。这样 UI 不会暴露“只有部分 State 已更新”的
半成品状态，也能把同一事件的多个请求合并处理（来源：`react-queue`、`react-queue-fixed`）。

这解释的是 React 官方教学模型，不是“setter 被放进一个可由应用读取的 JavaScript 数组”，更不是对
内部 scheduler 或 browser task 的承诺。课程只让学生掌握：在同一事件中，更新请求先进入 React 的处理
范围，当前 handler 仍继续使用自己的 State snapshot。

### 2.2 batching 不跨越多个有意事件

React 官方明确区分多个用户事件：两个独立 click 是两次独立处理，第一次 click 产生的结果应先有机会
生效，第二次 click 不会与第一次 click 永远合并成同一批。这样按钮第一次点击禁用表单时，第二次有意
点击不会继续提交（来源：`react-queue`）。

不要把 batching 表述成“React 永远只 render 一次”或“用户快速点击一定合并”。本课只保证单个事件
处理器内的公共教学边界；实际 render 次数仍受 State 相等性、StrictMode 和其他 React 运行时条件影响。

### 2.3 React 18+ 的 automatic batching 边界

React 18 升级指南给出的迁移差异是：

| 来源 | React 18 之前的默认行为 | 使用 `createRoot` 的 React 18+ 行为 |
| --- | --- | --- |
| React 事件处理器 | batching | batching |
| `setTimeout` 回调 | 默认不 batching | automatic batching |
| Promise 回调 | 默认不 batching | automatic batching |
| 原生事件 handler | 默认不 batching | automatic batching |
| 其他回调来源 | 默认不 batching | automatic batching |

本课 React `19.2.8` 的 Root 示例使用 `createRoot`，因此教学上可以说 React 18+ 的 automatic batching
会覆盖这些更新来源。这里的“覆盖”是官方升级指南对客户端 Root 的公共行为描述，不扩展到 legacy
`ReactDOM.render`、React Native 或未说明的宿主集成（来源：`react-18-upgrade`、
`react-18-upgrade-fixed`）。

React 18 升级指南把 automatic batching 作为性能和行为迁移说明；它没有授权课程推导具体 event loop、
微任务、宏任务或 scheduler 优先级。因此正文不画这些内部时序图。

## 三、直接值更新：按当前 snapshot 形成替换指令

### 3.1 三次直接值不等于三次递增

如果一次 render 看到 `number = 0`，下列三行在当前 handler 中都会计算为 `setNumber(1)`：

```tsx
// 这个 handler 创建时 number 固定为 0。
function handleClick() {
  setNumber(0 + 1)
  setNumber(0 + 1)
  setNumber(0 + 1)
}
```

官方队列模型把这三项记为：

```text
"replace with 1"
"replace with 1"
"replace with 1"
```

下一次 render 处理队列时，每项都把当前结果替换为 `1`，所以最终 State 是 `1`，不是 `3`。根因有两
层：当前 handler 的 `number` 是该 render 的固定 snapshot；直接值更新表达的是“下一值是这个值”，
不是“对前一值执行加一函数”（来源：`react-snapshot`、`react-queue`）。

### 3.2 直接值是队列中的 replace 指令

假设基准 State 是 `0`，把 `setNumber(5)` 抽象为“replace with 5”后，队列求值可以写成：

| 顺序 | 队列项 | 输入值 | 结果 |
| ---: | --- | ---: | ---: |
| 1 | `replace with 5` | `0`（不使用） | `5` |

“不使用输入值”指这一项不会根据输入做计算；它不是从队列中删除其他项，也不是说之前的请求不会先被
记录。后续项仍按顺序处理。这个区分是解释混合队列的关键（来源：`react-queue`）。

### 3.3 直接值适用于已经算好的下一值

如果下一状态是与当前 State 无关的固定值，直接值清楚表达意图：

```tsx
import { useState } from 'react'

// 演示把状态明确替换为 idle 或 done。
export function StatusToggle() {
  const [status, setStatus] = useState<'idle' | 'done'>('idle')

  // 下一状态是确定的字面量，不需要从 pending state 计算。
  function handleComplete() {
    setStatus('done')
  }

  return <button onClick={handleComplete}>状态：{status}</button>
}
```

“需要前一个 State 才能算”与“已经知道要替换成什么值”是选择 updater 或直接值的核心判断。这里不
讨论对象和数组的复制与替换，那些属于第 15、16 课（来源：`react-queue`、`react-types`）。

## 四、Updater queue：下一次 render 按顺序逐步求值

### 4.1 updater 是纯函数队列项

当同一 State 在一次事件中要根据待处理值连续变化时，传入函数：

```tsx
import { useState } from 'react'

// 演示三个 updater 在下一次 render 中逐个累加。
export function UpdaterCounter() {
  const [number, setNumber] = useState(0)

  // 每个 updater 都描述“基于 pending value 加一”。
  function handleClick() {
    setNumber(previous => previous + 1)
    setNumber(previous => previous + 1)
    setNumber(previous => previous + 1)
  }

  return <button onClick={handleClick}>当前：{number}，updater +3</button>
}
```

调用 setter 时，React 把三个函数加入该 State 的更新范围；事件代码完成后，下一次 render 处理它们。
前一个 updater 的返回值会成为后一个 updater 的输入：

| 队列项 | 输入 `n` | 返回值 |
| --- | ---: | ---: |
| `n => n + 1` | `0` | `1` |
| `n => n + 1` | `1` | `2` |
| `n => n + 1` | `2` | `3` |

所以最终 State 是 `3`。这里的 `n` 不是某个事件 handler 的闭包变量，而是 React 处理队列时传入的
pending State（来源：`react-queue`、`react-queue-fixed`）。

### 4.2 updater 的静态类型合同

`@types/react@19.2.18` 将 setter 的输入表达为：

```ts
type SetStateAction<S> = S | ((prevState: S) => S)
type Dispatch<A> = (value: A) => void
```

因此 `setNumber(5)` 与 `setNumber(previous => previous + 1)` 都合法；TypeScript 能检查返回值是否仍
符合 `S`，但不会执行或模拟队列。课程正文优先使用普通 `number`，避免把有限字面量联合断言变成
State 结构专题。类型合同不表达 batching、render 次数、StrictMode 或 updater 纯度（来源：
`react-types`、`react-use-state`）。

### 4.3 updater 只返回结果，不执行副作用

updater 运行在 React 处理更新的 render 过程中，因此只能根据输入计算并返回下一 State：

```tsx
// 纯 updater：只计算返回值，不写外部系统。
function increment(previous: number) {
  return previous + 1
}
```

以下内容不属于 updater：

- `setNumber(previous => { setOther(...); return previous + 1 })`；
- 修改传入的对象或数组；
- 写 `localStorage`、发送请求、记录必须只发生一次的日志；
- 依赖 updater 被调用一次的 ID、时间或计数器。

对象和数组的具体不可变写法排除在本课之外，但“不能修改传入值”是 updater 纯度的必要边界。需要
用户交互副作用时放在事件处理器；Effect 和 Ref 的同步场景留给后续课（来源：`react-queue`、
`react-use-state`、`react-strict-mode`）。

## 五、直接值与 updater 的混合顺序

### 5.1 直接值在前，updater 在后

以当前 `number = 0` 为例：

```tsx
// 当前 snapshot 中 number 为 0。
function handleClick() {
  setNumber(number + 5)
  setNumber(previous => previous + 1)
}
```

官方队列视图是：

| 顺序 | 队列项 | 输入 | 结果 |
| ---: | --- | ---: | ---: |
| 1 | `replace with 5` | `0`（不使用） | `5` |
| 2 | `previous => previous + 1` | `5` | `6` |

最终 State 是 `6`。updater 使用的是队列当前结果 `5`，不是 handler 创建时的 `number = 0`（来源：
`react-queue`）。

### 5.2 updater 在前，直接值在后

```tsx
// 当前 snapshot 中 number 为 0。
function handleClick() {
  setNumber(number + 5)
  setNumber(previous => previous + 1)
  setNumber(42)
}
```

队列逐项处理：

| 顺序 | 队列项 | 输入 | 结果 |
| ---: | --- | ---: | ---: |
| 1 | `replace with 5` | `0`（不使用） | `5` |
| 2 | `previous => previous + 1` | `5` | `6` |
| 3 | `replace with 42` | `6`（不使用） | `42` |

最终 State 是 `42`。最后的直接值不会“合并”成 `43`，而是按自己的位置把前面累计的结果替换掉。若
把最后一行移到第一行，后面的 updater 就会在 `42` 上继续计算（来源：`react-queue`、
`react-queue-fixed`）。

### 5.3 混合队列的通用算法

对单个 State，可以把官方示例抽象成以下教学算法：

```ts
type Update<S> = S | ((pending: S) => S)

// 按入队顺序计算单个 State 的最终值；这是教学模型，不是 React 内部 queue API。
function applyUpdates<S>(baseState: S, updates: readonly Update<S>[]) {
  let result = baseState

  for (const update of updates) {
    result =
      typeof update === 'function'
        ? (update as (pending: S) => S)(result)
        : update
  }

  return result
}
```

逐项规则只有两条：

1. 函数项接收当前 `result`，返回值成为新的 `result`。
2. 直接值项忽略当前 `result`，把 `result` 替换为该直接值。

这个算法适合帮助学生手算官方四组数字示例，不应被写成用户可以调用的 React API，也不应扩展到
Reducer、对象深拷贝、数组更新或并发优先级（来源：`react-queue`）。

## 六、React 18+ batching 与 `flushSync` 的窄边界

### 6.1 `createRoot` 是 automatic batching 的前提

React 18 升级指南将 `createRoot` 与 automatic batching 一起介绍：从 React 18 开始，只要使用新的
Root API，timeout、Promise、原生事件 handler 和其他来源的更新也会按 React 事件相同的方式 batching。
React `19.2.8` 的课程入口使用 `createRoot`，因此课程示例可以采用这一行为作为当前运行时基线
（来源：`react-18-upgrade`、`react-runtime-tag`）。

这里的版本事实不等于“所有版本都同样 batching”：React 17 或 React 18 继续使用旧
`ReactDOM.render` 时，升级指南描述的 legacy 行为仍不同。正文只讲当前 `createRoot` 路径，不把 legacy
入口混入 Demo。

### 6.2 `flushSync` 是少数集成场景的逃生舱

`flushSync(() => { setSomething(value) })` 会强制 React 同步 flush callback 内更新并使 DOM 更新到可
读取状态。官方明确警告它不常见、可能显著影响性能，还可能一并处理 pending updates 或 Effects；因此
它不是“想立刻读 State 就包一下”的常规替代品（来源：`react-flush-sync`、`react-flush-sync-fixed`）。

本课只保留选择边界：当第三方浏览器 API / UI 库要求 callback 返回前 DOM 已经更新时，才可能需要
`flushSync`；完整应用优先依靠 React 的正常 batching。具体 `beforeprint`、Effect、Suspense fallback
和同步 DOM 测量全部排除。

## 七、StrictMode：开发期 updater 可能重复调用

React 官方明确说明，在 StrictMode 开发期，React 会调用 updater 两次以发现 accidental impurity，并
丢弃其中一次结果；生产环境不受这项额外调用影响。updater 必须因此保持纯净：如果两次调用结果相同、
没有外部动作，用户可见 State 不会因检查而改变（来源：`react-queue`、`react-strict-mode`）。

```tsx
import { useState } from 'react'

// 纯 updater 即使开发期被调用两次，也不会重复写外部系统。
function addOne(previous: number) {
  return previous + 1
}

// 只展示把纯 updater 交给 setter。
export function StrictSafeCounter() {
  const [count, setCount] = useState(0)

  // 事件 handler 自身不会因为 StrictMode updater 检查而自动调用两次。
  function handleClick() {
    setCount(addOne)
  }

  return <button onClick={handleClick}>{count}</button>
}
```

必须区分：

- updater 的开发期重复调用，是纯度检查；
- 事件 handler 不是这项双调用的目标；
- 生产环境不会出现这项额外 updater 调用；
- 不应通过模块变量、随机数、网络请求或日志计数器来“观察 updater 调用一次”。

本课不讲 StrictMode 的 Effect / Ref 重跑，也不把双调用解释成 Concurrent Rendering、Transition 或
Fiber 重试。只冻结 updater 纯度及开发 / 生产边界。

## 八、TypeScript / TSX 示例边界

### 8.1 正文应展示的类型合同

1. 组件文件使用 `.tsx`，State 使用 `useState<S>` 的公开类型。
2. 直接值与 updater 都可以传给同一个 setter，因为它们对应 `SetStateAction<S>` 的两个分支。
3. updater 参数由 `S` 推断，返回值必须兼容 `S`。
4. 例子优先使用 `number`、字符串联合或布尔值，不用对象 / 数组 State 把本课带入后续章节。
5. 类型示例只说明静态输入形状，不创建 `BatchedUpdate`、`QueuedRender`、`CommittedState` 等伪类型。

### 8.2 TypeScript 不能证明的事实

TypeScript / `@types/react` 不能证明：

- 多个 setter 是否属于同一批；
- queue 何时开始处理；
- updater 是否被 StrictMode 额外调用；
- 下一次 render 的确切次数或 commit / paint 时机；
- `flushSync` 是否必要；
- updater 是否修改了外部变量或执行了网络请求。

因此不要把通过类型检查误写为“已经验证 batching”。运行时顺序需要最小 Demo 或官方行为证据，类型
只约束可接受的 State 形状（来源：`react-types`、`react-use-state`）。

## 九、高价值易错点矩阵

| 错误 | 触发条件 | 原因与后果 | 正确处理 | 来源 |
| --- | --- | --- | --- | --- |
| 把 setter 当同步赋值 | `setNumber(1); console.log(number)` | 当前 render 的局部绑定不会被改写 | 把 setter 视为下一次 render 请求 | `react-snapshot` |
| 三次直接值期待加三 | 同一 handler 三次 `setNumber(number + 1)` | 三次都由同一 snapshot 计算成同一个 replace 值 | 基于 pending value 连续变化时使用 updater | `react-queue` |
| 把 updater 当立即值 | `setNumber(previous => previous + 1); console.log(number)` | updater 在后续队列处理阶段求值 | 只依赖 updater 返回的 next State 语义 | `react-queue` |
| 误解混合顺序 | `replace 5 -> updater -> replace 42` 期待 48 | 每项按队列位置处理，最后 replace 覆盖前面结果 | 逐行写出输入 / 结果表 | `react-queue` |
| 以为最后直接值只设置初始值 | 先 updater 后 `setNumber(42)` | 直接值是队列中的 replace 指令 | 把它理解为该位置的完整替换 | `react-queue` |
| 以为 batching 跨多个 click | 快速点击两次期待一批 | React 不跨多个有意用户事件统一 batching | 每个 click 作为独立事件理解 | `react-queue` |
| 把 React 18 batching 说成 React 17 行为 | timeout / Promise 中更新却不区分 Root API | automatic batching 与 `createRoot` 绑定 | 说明 React 18+ `createRoot` 前提 | `react-18-upgrade` |
| updater 修改输入 | `setList(previous => { previous.push(x); return previous })` | updater 不纯，可能重复修改或被 Object.is 短路 | 返回新结果；具体对象 / 数组课后讲 | `react-queue`、`react-strict-mode` |
| updater 里执行副作用 | 发送请求、写存储、调用另一个 setter | render 阶段重复调用会重复外部动作 | updater 只计算并返回 State | `react-queue`、`react-use-state` |
| 用随机数证明 updater 调用一次 | `setCount(() => Math.random())` | StrictMode 可能重复调用，结果不稳定 | 使用纯、确定性计算 | `react-strict-mode` |
| 把 StrictMode 双调用当用户双击 | 开发期看到日志两次 | 目标是应纯函数，不是 handler 自动双执行 | 分别观察 handler 与 updater | `react-strict-mode` |
| 默认使用 `flushSync` | 每次 setter 后都包 `flushSync` | 影响性能且破坏正常 batching 优势 | 只在第三方同步集成的最后手段使用 | `react-flush-sync` |
| 在 render 中调用 `flushSync` | 组件函数体执行 `flushSync` | React 正在 render，调用会警告或 noop | 不在本课引入；交给集成边界 | `react-flush-sync` |
| 用类型证明批处理 | `SetStateAction` 编译通过就声称同批 | 类型只描述值或函数的输入形状 | 用官方文档和运行时行为验证 | `react-types` |
| 把算法写成 React 内部 API | 暴露 `applyUpdates` 让业务调用 | 官方表格是教学模型，不是公共 queue API | 仅用于手算和 Demo 说明 | `react-queue` |

## 十、课程正文与 Demo 边界

### 10.1 正文建议顺序

1. 复习第 13 课的 State snapshot：当前 handler 的 State 变量不变。
2. 说明事件处理器完成后 React 才处理这一批更新，并定义 batching 的目的和“不跨多个有意事件”边界。
3. 用三次直接值 `number + 1` 展开 snapshot 替换推理，得到最终只加一。
4. 用三个 updater 表格展示前一个返回值如何成为下一个输入。
5. 用 `replace 5 -> updater -> replace 42` 展开混合队列，强调每项位置决定结果。
6. 说明 updater 的纯度和 StrictMode 开发期重复调用。
7. 独立说明 React 18+ `createRoot` automatic batching；只提 `flushSync` 是少数集成场景的 last resort。
8. 以排除清单结束，不提前讲对象 / 数组、Reducer、Effect、Ref、Transition 或内部实现。

### 10.2 Demo 的最小可观察合同

Demo 可以使用一个数字 State 与四个语义按钮，分别演示：

1. 同一 handler 三次直接值 `setNumber(number + 1)`，结果只增加一。
2. 同一 handler 三次 updater `setNumber(n => n + 1)`，结果增加三。
3. 直接值 `number + 5` 后接 updater，结果为当前值加六。
4. 直接值、updater、最后直接值 `42`，结果为 `42`。

Demo 实现应遵守：

- 使用单个原始数字 State；不要用对象 / 数组保存 queue，也不要教授不可变复制。
- 不用第二份 State 记录“render 次数”或“updater 调用次数”；StrictMode 下调用次数不是业务合同。
- 不用 Effect、Ref、DOM 查询、布局测量或 `flushSync` 建立探针。
- 不用异步请求、Promise、timeout 混合多个更新来证明 batching；React 18 automatic batching 只在正文
  事实边界中说明，避免把课程 Demo 变成异步调度专题。
- 不把静态 queue 表格实现成业务 API；可以在页面上展示固定的输入 / 结果说明。
- 浏览器验证只断言按钮交互后的最终数字与无 console error，不断言 updater 被调用几次。
- 展示源码与运行源码同源，代码块使用 `tsx`，不引入对象 / 数组 State、Reducer、Effect、Ref、
  Transition、并发或 hydration。

### 10.3 本课不实现的验证器

React 官方队列页包含一个 `getFinalState(baseState, queue)` 挑战。课程研究可以借用它帮助讲解四组
数字，但正式 Demo 不应把这个函数包装成 React 内部实现的替代品，也不应让学习者通过修改 queue 数组
来学习对象 / 数组更新。若需要静态表格，使用固定数字说明即可。

## 十一、明确不采用的说法

1. “每次调用 setter 都会立刻重新 render。”React 会在事件处理完成后处理更新请求。
2. “三次 `setNumber(number + 1)` 会得到三次累加。”它们使用同一个 render snapshot，形成重复 replace 值。
3. “updater 在 setter 调用那一行就使用最新 State。”updater 在后续队列处理阶段接收 pending State。
4. “直接值更新会清空整个队列。”它只在自己的位置替换当前结果，后续 updater 仍会继续处理。
5. “updater 总是优于直接值。”已知固定下一值时直接值更直接；依赖 pending State 或连续更新时用 updater。
6. “React batching 会跨越用户的所有 click。”官方教学模型不跨多个有意事件。
7. “React 18 自动 batching 与 `ReactDOM.render` 完全相同。”官方升级指南把 automatic batching 与 `createRoot` 绑定。
8. “React 18+ 所有 callback 都能保证只 render 一次。”课程不把 batching 扩大为精确 render 次数保证。
9. “`flushSync` 是让每个 setter 立即生效的最佳实践。”官方将它定义为少用且可能损害性能的逃生舱。
10. “`flushSync` 只影响 callback 中那一个更新。”它可能一并冲刷 pending updates 或 Effects。
11. “updater 可以写请求或调用另一个 setter。”updater 必须纯净，只根据输入返回结果。
12. “StrictMode 会在生产环境重复调用 updater。”这是开发期检查。
13. “StrictMode 双调用等于用户事件 handler 双调用。”官方双调用针对应纯函数，不包含 handler 内部代码。
14. “TypeScript 检查通过就证明 batching 和 queue 顺序正确。”类型不表达运行时队列时序。
15. “队列求值算法就是 React 的公共 API。”它是官方教学模型，不是应用可访问的内部数据结构。
16. “本课应顺手讲对象、数组、Reducer、Effect、Ref 或 Transition 来完成队列。”这些主题都有独立课程边界。

## 研究结论

React `19.2.8` 的 State 更新可以用一个窄而可验证的模型说明：setter 先把更新请求交给 React；在同一
事件处理器的代码完成后，React 按队列顺序处理这些请求。直接值是当前位置的 replace 指令，updater
是接收当前 pending State 并返回下一 State 的纯函数；混合队列仍严格按加入顺序逐项求值。React 18+
使用 `createRoot` 后，automatic batching 扩展到 timeout、Promise、原生 handler 等来源；`flushSync`
只在少数第三方同步集成中作为 last resort。StrictMode 可能在开发期额外调用 updater 并丢弃一次结果，
所以 updater 必须没有副作用。

第 14 课研究事实已充分，可进入课程编写与最小数字 State Demo；实现必须停在本课范围内，不提前进入
对象 / 数组 State、Reducer、Effect、Ref、Context、Transition、并发内部实现、Fiber / lane 或 hydration。
