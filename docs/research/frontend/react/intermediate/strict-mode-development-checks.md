# Strict Mode 开发检查研究记录

## 知识点合同

- 主题：`<StrictMode>` 的开发期检查
- 教学层级：具备函数组件、State、Effect 与 Ref 基础的本科进阶学习者
- 官方文档基线：React / React DOM `19.2`
- 固定文档源码：`reactjs/react.dev@7571898c0afd33a1c72e3447cd93e297206d27cf`
- 固定运行时源码：React `v19.2.8`，commit
  `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- 核验日期：`2026-08-17`

本记录只回答一条主线：Strict Mode 在开发环境中检查什么、额外调用发生在哪些函数或生命周期边界，
以及代码怎样在不依赖调用次数的前提下保持正确。

必须区分四类行为：纯函数额外调用、Effect 额外周期、Callback Ref 额外周期、弃用 API 警告。
明确排除：内部调度结构、并发实现细节、性能分析、框架配置和后续主题。

## 调研与来源边界

1. 外部检索先使用 Tavily 发现候选 URL，再回到 React 官方页面与固定 GitHub 源码核验原文。
2. 只采用 React、React DOM 官方文档，`react.dev` 固定提交，以及 React `v19.2.8` 官方源码与测试。
3. 社区文章、搜索摘要、旧版 Strict Mode 页面和未确认的 GitHub Issue 不支撑本文结论。
4. 公共行为以 React `19.2` 文档为准；固定源码与测试只用于确认 `v19.2.8` 的版本事实，不把内部名称
   写成应用代码可以依赖的 API。

## 官方来源与证据矩阵

| ID | 官方来源 | 版本 | 支撑结论 |
| --- | --- | --- | --- |
| S1 | [`<StrictMode>` Reference](https://react.dev/reference/react/StrictMode) | React 19.2 | 局部包裹、内层不可退出、四类开发期检查、纯函数准确范围、根级与局部初始 Effect 差异、弃用警告 |
| S2 | [`useEffect` Reference](https://react.dev/reference/react/useEffect) | React 19.2 | 开发期额外 `setup -> cleanup -> setup` 是压力测试；出现问题时应补全 cleanup |
| S3 | [React DOM common components: Callback Ref](https://react.dev/reference/react-dom/components/common#ref-callback) | React DOM 19.2 | Callback Ref 在第一次真实 setup 前增加一次开发期 setup/cleanup 周期 |
| S4 | [`useState` Reference](https://react.dev/reference/react/useState#my-initializer-or-updater-function-runs-twice) | React 19.2 | initializer 与 updater 的额外调用、忽略其中一次结果、纯度要求 |
| S5 | [`useReducer` Reference](https://react.dev/reference/react/useReducer#my-reducer-or-initializer-function-runs-twice) | React 19.2 | reducer 与 initializer 的额外调用；事件处理器不会被 React 自动双调用 |
| S6 | [`useMemo` Reference](https://react.dev/reference/react/useMemo#my-calculation-runs-twice-on-every-re-render) | React 19.2 | calculation 的额外调用及纯度要求 |
| S7 | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | React 19.2 | render 必须幂等且可被多次运行；事件处理器与 Effect 位于 render 之外 |
| S8 | [`StrictMode.md` 固定源码：检查与退出边界](https://github.com/reactjs/react.dev/blob/7571898c0afd33a1c72e3447cd93e297206d27cf/src/content/reference/react/StrictMode.md#L43-L56)、[根级差异](https://github.com/reactjs/react.dev/blob/7571898c0afd33a1c72e3447cd93e297206d27cf/src/content/reference/react/StrictMode.md#L100-L128)、[纯函数范围](https://github.com/reactjs/react.dev/blob/7571898c0afd33a1c72e3447cd93e297206d27cf/src/content/reference/react/StrictMode.md#L133-L143)、[Effect](https://github.com/reactjs/react.dev/blob/7571898c0afd33a1c72e3447cd93e297206d27cf/src/content/reference/react/StrictMode.md#L514-L520)、[Callback Ref](https://github.com/reactjs/react.dev/blob/7571898c0afd33a1c72e3447cd93e297206d27cf/src/content/reference/react/StrictMode.md#L836-L842)、[弃用警告](https://github.com/reactjs/react.dev/blob/7571898c0afd33a1c72e3447cd93e297206d27cf/src/content/reference/react/StrictMode.md#L1245-L1251) | 固定提交 | 对 S1 的开发期边界、额外调用范围与生命周期检查原文做可重复核验 |
| S9 | [`ReactStrictModeWarnings.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactStrictModeWarnings.js#L60-L113) | React v19.2.8 | 版本源码中开发期 `UNSAFE_` 生命周期警告的实现证据 |
| S10 | [`ReactStrictMode-test.js`：initializer](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/__tests__/ReactStrictMode-test.js#L209-L245)、[calculation、updater 与 reducer](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/__tests__/ReactStrictMode-test.js#L397-L570)、[弃用警告](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/__tests__/ReactStrictMode-test.js#L583-L647) | React v19.2.8 | initializer、updater、`useMemo` calculation、reducer 与 Strict Mode 子树弃用警告的版本测试 |
| S11 | [`StrictEffectsMode-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/StrictEffectsMode-test.js#L54-L90) | React v19.2.8 | 开发与生产条件下 Effect setup/cleanup 序列的版本测试 |

## 一、Strict Mode 是树边界，不是运行模式开关

`<StrictMode>` 不接收 props，也不渲染可见 UI。它可以包裹整个根组件，也可以只包裹应用中的一部分。
检查作用于边界内的全部后代，不受组件嵌套深度影响；边界外的兄弟组件不受该局部边界影响。

```tsx
import { StrictMode } from 'react'

/** 只为主内容子树开启开发检查。 */
export function App() {
  return (
    <>
      <Header />
      <StrictMode>
        <MainContent />
      </StrictMode>
      <Footer />
    </>
  )
}
```

这个结构只为 `MainContent` 及其后代开启检查。相反，如果 `App` 已经位于外层 `<StrictMode>` 内，
`MainContent` 不能在自己的 JSX 中退出 Strict Mode。`Fragment`、普通组件或再嵌套一个 `<StrictMode>`
都不是关闭开关。若必须缩小范围，只能由拥有外层边界的代码把边界向下移动。

## 二、全部额外检查只存在于开发环境

React `19.2` 公共文档列出四类行为：

| 检查 | 开发环境中的额外行为 | 要发现的问题 |
| --- | --- | --- |
| 纯渲染检查 | 对应当纯净的函数增加调用 | 修改输入、读取或写入隐藏可变状态 |
| Effect 检查 | 增加 setup/cleanup 周期 | cleanup 缺失或不能撤销 setup |
| Callback Ref 检查 | 增加 setup/cleanup 周期 | 节点登记没有成对删除 |
| 弃用检查 | 检查边界内组件使用的弃用 API | 仍依赖 `UNSAFE_` 类生命周期 |

这些检查都只在开发环境启用，不影响生产构建。应用不能把额外调用、额外 cleanup 或警告当成业务流程；
生产正确性也不能依赖它们代为初始化、撤销资源或推进计数。

“只在开发环境”不等于可以忽略开发期暴露的问题。额外检查放大的是同一段代码在重复渲染、资源重建或
组件替换时已经存在的缺陷。

## 三、纯函数额外调用的准确范围

Strict Mode 只额外调用 React 认为应当纯净的函数，不是任意出现在组件文件里的函数。React `19.2`
文档明确列出：

1. 函数组件函数体的顶层逻辑，不包括函数体内定义但尚未触发的事件处理逻辑。
2. 传给 `useState` 的 initializer。
3. 传给 State setter 的 updater。
4. 传给 `useMemo` 的 calculation。
5. 传给 `useReducer` 的 reducer 与 initializer。
6. 部分类组件方法，例如 `constructor`、`render` 与 `shouldComponentUpdate`。

同一输入下，这些函数应返回等价结果，并且不得修改 Props、State 快照或外部可变对象。React 会忽略
额外调用中的一份结果；因此“返回值最终只采用一份”不能抵消函数内部已经发生的副作用。

### 不属于这份纯函数清单的内容

- 事件处理器不会仅因为 Strict Mode 而由 React 自动调用两次。
- `useCallback` 保存函数身份，但不会执行传入函数的函数体；不要把它和 `useMemo` calculation 混为一谈。
- Effect setup 与 Callback Ref setup 的额外周期是生命周期压力测试，不是“渲染函数纯度双调用”的同义词。
- 浏览器事件、业务代码的重复提交或父组件自己的调用仍可能让事件处理器执行多次；Strict Mode 不替这些
  情况提供“一定只执行一次”的保证。

### 纯渲染示例

错误代码直接修改 Props 数组，每次组件函数重新运行都会再追加一项：

```tsx
type Story = { id: string; label: string }

/** 展示会修改输入数组的错误渲染写法。 */
function StoryList({ stories }: { stories: Story[] }) {
  stories.push({ id: 'create', label: '新建故事' })
  return stories.map((story) => <p key={story.id}>{story.label}</p>)
}
```

正确代码先创建本地副本；额外调用只产生另一份等价的局部结果，不污染输入：

```tsx
type Story = { id: string; label: string }

/** 通过局部副本计算本次渲染需要的故事列表。 */
function StoryList({ stories }: { stories: Story[] }) {
  const visibleStories = [...stories, { id: 'create', label: '新建故事' }]
  return visibleStories.map((story) => <p key={story.id}>{story.label}</p>)
}
```

## 四、Effect 的 `setup -> cleanup -> setup`

正常 Effect 生命周期已经包含 setup 与 cleanup：首次提交后运行 setup；依赖改变时先用旧闭包 cleanup，
再用新闭包 setup；组件移除时执行最后一次 cleanup。

当 Strict Mode 覆盖应用根时，React 会在第一次真实 setup 前增加一个开发期 setup/cleanup 周期：

```text
开发环境根级 Strict Mode：setup -> cleanup -> setup
生产环境：                 setup
```

这个序列测试 cleanup 是否完整撤销同一轮 setup。学习目标不是让日志“只打印一次”，而是让一次 setup 和
`setup -> cleanup -> setup` 具有相同的最终外部状态。

```tsx
import { useEffect } from 'react'

/** 在组件存在期间维护一份网络状态监听。 */
function OnlineStatus() {
  useEffect(() => {
    /** 记录浏览器恢复联网的事件。 */
    function handleOnline() {
      console.log('online')
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return <p>监听网络状态</p>
}
```

cleanup 使用同一个 `handleOnline` 撤销监听。正确结果是任意完整周期后只保留当前组件应拥有的一份资源。

### 根级与局部边界的初始 Effect 差异

| 边界位置 | 初次挂载时的额外 Effect 周期 |
| --- | --- |
| `<StrictMode>` 覆盖应用根 | 启用额外 setup/cleanup 周期 |
| `<StrictMode>` 位于已有非 Strict 父组件之下 | 不额外重跑初始 Effect |

局部边界的例外只针对初次挂载的额外 Effect 重跑。原因是只重跑子组件 Effect、却不重跑边界外父组件
Effect，会产生生产环境不可能出现的父子组合。局部边界仍会执行其他适用的 Strict Mode 检查。

不要把这个差异简化成“局部 Strict Mode 没有效果”，也不要用局部包裹规避 cleanup。依赖变化和真实移除
仍会按照正常 Effect 合同执行 cleanup；只有对称 cleanup 才能保证这些路径正确。

## 五、Callback Ref 的 `setup -> cleanup -> setup`

Callback Ref 在 DOM 节点接入时执行 setup，并可返回 cleanup。Strict Mode 会在第一次真实 setup 前增加
一个开发期 setup/cleanup 周期，因此正确实现也应满足：

```text
setup(node) -> cleanup(node) -> setup(node)
```

```tsx
import { useRef } from 'react'

type Item = { id: string; label: string }

/** 维护当前已提交列表项的 DOM 节点索引。 */
function ItemList({ items }: { items: Item[] }) {
  const itemNodesRef = useRef(new Map<string, HTMLLIElement>())

  /** 为一个条目创建成对登记和删除节点的 Callback Ref。 */
  function createItemRef(itemId: string) {
    return (node: HTMLLIElement | null) => {
      if (node === null) {
        return
      }

      itemNodesRef.current.set(itemId, node)

      return () => {
        itemNodesRef.current.delete(itemId)
      }
    }
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} ref={createItemRef(item.id)}>
          {item.label}
        </li>
      ))}
    </ul>
  )
}
```

setup 登记哪个 `itemId`，cleanup 就删除同一个 `itemId`。缺失 cleanup 会让节点集合在额外周期后持续增长。
React `19.2` 文档只为局部边界的初始 Effect 重跑声明例外，不能把这个例外自行扩展到 Callback Ref。

## 六、事件处理器不会被 Strict Mode 自动双调用

事件处理器响应用户或其他外部事件，不要求像渲染函数那样纯净。React `useReducer` 文档明确说明，
Strict Mode 不会自动双调用事件处理器。

需要区分“事件处理器”和“它提交的 updater”：

```tsx
/** 记录添加意图，并请求 React 根据当前数组计算下一份数组。 */
function handleAdd() {
  recordUserIntent('add')
  setItems((currentItems) => [...currentItems, createItem()])
}
```

Strict Mode 本身不会额外调用 `handleAdd`，其中的 `recordUserIntent` 也不会因为 Strict Mode 自动重复。但传给
`setItems` 的 updater 属于纯函数清单，开发环境中可能被额外调用。因此 `createItem()` 若读取随机数、推进模块计数
或写入外部系统，应在事件处理器中先产生结果，再把普通值交给纯 updater。

```tsx
/** 在事件边界先创建条目，再把普通值交给纯 updater。 */
function handleAdd() {
  const item = createItem()
  recordUserIntent('add')
  setItems((currentItems) => [...currentItems, item])
}
```

## 七、弃用 API 警告的公共合同

React `19.2` 当前公共页面的准确表述是：如果 `<StrictMode>` 树中任意位置的组件使用列出的弃用 API，
React 会发出警告；当前页面列出的是 `UNSAFE_` 类生命周期，例如 `UNSAFE_componentWillMount`。
`v19.2.8` 的源码和测试也覆盖 `UNSAFE_componentWillMount`、`UNSAFE_componentWillReceiveProps` 与
`UNSAFE_componentWillUpdate` 的开发期警告。

这份合同有三个边界：

1. “树中任意位置”指边界内渲染到的组件，不只直接子组件。
2. 这是开发期警告，不是类型错误、生产运行时拦截或自动迁移工具。
3. 不应把旧版页面曾列出的历史 API 清单原样搬到 React `19.2`；当前教学只承诺当前官方页面列出的范围。

收到警告时，应按对应 React API 页面迁移生命周期职责，而不是隐藏 console、移动日志或关闭 Strict Mode。

## 八、不要把精确 render 次数写进业务合同

React 官方用“额外一次”或“两次”解释当前开发检查，`v19.2.8` 测试也用调用日志验证具体版本。
但 React 的纯度规则明确要求 render 逻辑能够安全地运行多次。这些计数适合帮助理解诊断现象，不适合成为应用
正确性的断言。

原因包括：

- 纯函数额外调用、Effect 额外周期和 Callback Ref 额外周期是三种不同机制。
- 根级与局部 Strict Mode 对初始 Effect 的行为不同。
- 初次挂载、依赖更新、真实移除和用户事件触发的路径不同。
- 业务代码自身也可能发起更新或重复事件，不能从 console 行数反推 React 的公共状态。

应验证不变量，而不是次数：相同输入得到等价 JSX；旧 State 没有被修改；每次 setup 都能被 cleanup 完整
撤销；当前 DOM 节点集合和当前渲染内容一致；一次用户事件只记录一份用户意图。

## 九、正确修复方向

| Strict Mode 暴露的现象 | 错误处理 | 正确修复 |
| --- | --- | --- |
| 列表或对象在重新渲染后重复变化 | 移除外层 `<StrictMode>` | 不修改 Props/State，改为复制后计算 |
| Effect 建立两份连接或监听 | 用 Ref 旗标跳过第二次 setup | 返回 cleanup，完整撤销本轮资源 |
| Callback Ref 集合持续增长 | 忽略开发日志 | setup 登记，cleanup 删除同一节点身份 |
| initializer、updater 或 reducer 产生重复副作用 | 判断 `NODE_ENV` 后只执行一次 | 让函数只计算返回值，把外部动作移到事件边界 |
| 出现弃用生命周期警告 | 屏蔽 warning | 按当前 React API 的替代方案迁移代码 |

Strict Mode 的价值来自“修复后仍保持开启”。关闭边界只能隐藏开发期信号，不能修复输入突变、资源泄漏或
弃用 API。若局部旧代码暂时无法迁移，可以由边界所有者缩小包裹范围，但边界内代码仍应满足相同合同。

## 结论

1. Strict Mode 可以局部开启，但外层已开启时，内层没有退出机制。
2. 纯函数额外调用、Effect 周期、Callback Ref 周期和弃用警告全部只在开发环境启用。
3. 纯函数范围是组件顶层、指定 Hook 的 initializer/updater/reducer/calculation 以及部分应纯净的类方法，
   不包括事件处理器。
4. 根级 Strict Mode 会在初次挂载增加 Effect 周期；局部边界不会额外重跑初始 Effect。
5. Effect 与 Callback Ref 都应以可撤销的 setup/cleanup 对设计，验证最终不变量而不是日志次数。
6. 弃用警告以 React `19.2` 当前公共页面列出的 API 为准，不扩张成旧版历史清单。
7. 正确响应是修复纯度、cleanup 或 API 使用，而不是关闭 Strict Mode。

## 参考资料

1. [React `<StrictMode>` Reference](https://react.dev/reference/react/StrictMode)
2. [React `useEffect` Reference](https://react.dev/reference/react/useEffect)
3. [React DOM Callback Ref caveats](https://react.dev/reference/react-dom/components/common#ref-callback)
4. [React `useState` troubleshooting](https://react.dev/reference/react/useState#my-initializer-or-updater-function-runs-twice)
5. [React `useReducer` troubleshooting](https://react.dev/reference/react/useReducer#my-reducer-or-initializer-function-runs-twice)
6. [React `useMemo` troubleshooting](https://react.dev/reference/react/useMemo#my-calculation-runs-twice-on-every-re-render)
7. [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
8. [`react.dev` StrictMode source at fixed commit](https://github.com/reactjs/react.dev/blob/7571898c0afd33a1c72e3447cd93e297206d27cf/src/content/reference/react/StrictMode.md)
9. [React v19.2.8 `ReactStrictModeWarnings.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactStrictModeWarnings.js#L60-L113)
10. [React v19.2.8 `ReactStrictMode-test.js`：initializer](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/__tests__/ReactStrictMode-test.js#L209-L245)、[calculation、updater 与 reducer](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/__tests__/ReactStrictMode-test.js#L397-L570)、[弃用警告](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/__tests__/ReactStrictMode-test.js#L583-L647)
11. [React v19.2.8 `StrictEffectsMode-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/StrictEffectsMode-test.js#L54-L90)
