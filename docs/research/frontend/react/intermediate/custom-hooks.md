# I16 自定义 Hook 与 useDebugValue 官方研究记录

## 知识点合同

- 目标条目：`react.core.learn.intermediate.custom-hooks`
- 标题：自定义 Hook 与 `useDebugValue`
- 教学范围：本科 React 函数组件、自定义 Hook、`useState` 与 React DevTools 调试标签
- 官方文档基线：React `19.2`
- 固定源码旁证：React `v19.2.8`，tag 对应 commit
  `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- 本轮核验日期：`2026-08-17`

本课只回答两个紧密相关的问题：如何把有明确用途的有状态逻辑抽成自定义 Hook，以及如何用
`useDebugValue` 为这段 Hook 逻辑提供只在 React DevTools 中显示的调试值。主线必须同时证明：复用的是
逻辑而不是 State，同一自定义 Hook 的每次调用仍拥有独立 State。

## 调研方式与版本边界

本轮先使用 Tavily 搜索 React 官方站点，只把搜索结果用于发现 URL；随后回读 `react.dev` 的官方 Markdown
和 API 原文核对每条公共结论。patch 级实现旁证来自 React 官方仓库的 `v19.2.8` 固定 tag，并通过
`git ls-remote` 确认该 tag 指向上述 commit。未使用第三方文章、搜索摘要、Issue 或浮动 `main` 作为事实来源。

版本必须分层表述：

- `react.dev` 当前文档标记 React `19.2`，它提供本课可教学、可依赖的公共合同。
- React 官网没有单独的 `19.2.8` 文档快照；`v19.2.8` 源码只用于解释当前仓库运行时的一种实现，不能升级为
  用户 API。
- 固定源码显示 `useState` 和 `useDebugValue` 都通过当前 dispatcher 分发；`useDebugValue` 的调用位于
  `__DEV__` 分支，reconciler 中的常规实现是 no-op，并由调试工具注入读取逻辑。这只作为“开发工具边界”的
  实现旁证，不应在学习者正文中展开 Fiber、dispatcher 或 Hook 链。

## 官方事实与证据矩阵

| ID | React 官方一手来源 | 本课采用的事实 |
| --- | --- | --- |
| S1 | [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) | 自定义 Hook 是面向应用需要组合 Hook 的 JavaScript 函数，可把有状态逻辑从组件中抽出并复用。 |
| S2 | [Hook names always start with `use`](https://react.dev/learn/reusing-logic-with-custom-hooks#hook-names-always-start-with-use) | Hook 名必须以 `use` 加大写字母开头；不调用 Hook、以后也不准备调用 Hook 的普通函数不应使用该前缀。 |
| S3 | [Custom Hooks share stateful logic, not state](https://react.dev/learn/reusing-logic-with-custom-hooks#custom-hooks-let-you-share-stateful-logic-not-state-itself) | 每次调用同一自定义 Hook 都完全独立；抽取前后等价于分别声明多份 State。 |
| S4 | [When to use custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks#when-to-use-custom-hooks) | 不必为每一点重复抽 Hook；只包装一次 `useState` 在真实业务中通常没有必要，边界应表达清楚而具体的用途。 |
| S5 | [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) | Hook 只能在函数组件或自定义 Hook 顶层调用，且位于提前返回之前；不能放进条件、循环、嵌套函数或 `try/catch/finally`。 |
| S6 | [rules-of-hooks lint](https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks) | React 依赖每次 render 中完全相同的 Hook 调用及顺序来保存对应 State；官方 lint 可发现常见违规。 |
| S7 | [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) | 多个组件确实需要同一份 State 时，应把所有权移到最近共同父组件，再向下传值与事件处理器。 |
| S8 | [`useDebugValue`](https://react.dev/reference/react/useDebugValue) | `useDebugValue(value, format?)` 在自定义 Hook 顶层为 React DevTools 提供可读调试值；`value` 可为任意类型，API 不返回值。 |
| S9 | [`useDebugValue` 延迟格式化](https://react.dev/reference/react/useDebugValue#deferring-formatting-of-a-debug-value) | 可选格式化函数在组件被 React DevTools 检查时才以 `value` 调用，返回值只用于显示，从而避免每次 render 都执行潜在昂贵格式化。 |
| S10 | [React `v19.2.8` `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L66-L70) | 固定实现旁证：公共 `useState` 将调用交给当前 dispatcher。 |
| S11 | [React `v19.2.8` Hook State 实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L1895-L1935) | 固定实现旁证：一次 `useState` mount 取得当前 Hook 记录，并为它保存状态与更新队列；公共独立性仍以 S3 为权威。 |
| S12 | [React `v19.2.8` `useDebugValue` 分发](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L160-L168) 与 [调试值实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2888-L2894) | 固定实现旁证：该 Hook 服务开发调试工具，不承载页面渲染或业务行为。 |

## 正文知识结构建议

### 一、自定义 Hook 解决的是逻辑复用

从一个组件内已经存在的 `useState` 和状态操作开始，再抽出 `useCounter`。抽取前后应保持行为一致：调用者
不再重复“如何创建、增加和重置计数”的实现，但仍明确表达“我要使用一份计数逻辑”。

“有状态逻辑”包含 State 的声明、围绕该 State 的操作和对外返回合同。自定义 Hook 不是隐藏的单例容器，也不会
因为函数定义只有一份就自动共享 State。

### 二、Hook 的名称会声明调用规则

自定义 Hook 使用 `useCounter` 这类 `use` 加大写字母的名字。这个前缀不是装饰：它告诉读者和 lint，该函数可能
调用其他 Hook，因而必须遵守 Hooks 规则。只做格式化、校验或计算的纯函数保持普通函数名；如果一个函数既不调用
Hook，以后也不准备调用 Hook，就不要命名为 Hook。

### 三、顶层与固定顺序是 State 对应关系的前提

组件在顶层无条件调用 `useCounter`，`useCounter` 又在自己的顶层调用 `useState` 和 `useDebugValue`。每次 render
都必须经过相同调用位置和顺序。不要在 `if`、循环、点击处理器、嵌套函数、异常处理块或提前返回之后调用它。

正文应把规则解释成可观察因果：React 按调用顺序把本次 Hook 调用与先前 State 对应；顺序变化会让 React 无法
知道哪个 State 属于哪个调用。不要把规则只写成需要背诵的语法列表。

### 四、每次调用都拥有独立 State

在同一组件顶层写两次 `useCounter(0)`，就是请求两份独立的计数状态。左侧返回的更新函数只改变左侧调用的
State，右侧调用保持原值；反向亦然。函数实现被复用，不代表其内部 State 被共享。

这项独立性是官方公共合同，不需要向学习者介绍 Fiber 或更新队列。固定源码只能放在研究记录中说明当前实现与
公共合同一致。

### 五、共享 State 是所有权问题

如果业务要求两个区域永远显示并修改同一个值，就不应各自调用 `useCounter` 后再设法同步。正确方向是把唯一源
State 移到最近共同父组件，并把值和操作向下传递。自定义 Hook 回答“如何复用逻辑”，状态提升回答“谁拥有这份
State”，二者不能互相替代。

### 六、何时不应抽自定义 Hook

以下情况优先保持原样或使用普通函数：

1. 只为了消除一两行重复，抽取后没有更清楚的用途名称。
2. 只包装一次 `useState`，却没有形成可复用的状态操作合同。
3. 逻辑是由参数直接计算结果，不需要调用任何 Hook。
4. 抽取后必须传入大量组件内部细节，调用点反而更难理解。

本课的小型 `useCounter` 是为了隔离观察“同一逻辑、两份 State”和调试标签，不应被推广成“每次看到
`useState` 都抽 Hook”的通用建议。

### 七、`useDebugValue` 只提供 DevTools 调试值

`useDebugValue(value, format?)` 放在自定义 Hook 顶层。省略格式化函数时，React DevTools 显示原始 `value`；
提供格式化函数时，DevTools 在检查组件时把 `value` 传入函数，并显示函数返回的结果。该 API 不返回数据，不改变
自定义 Hook 的返回合同，也不应改变页面 UI、State 更新或业务分支。

延迟的是第二个参数中的格式化工作，不是第一个 `value` 表达式的求值。需要推迟的转换应写在格式化函数内部：

```tsx
type CounterDebugValue = Readonly<{ name: string; count: number }>

/** 把计数调试值转换为 React DevTools 中的可读标签。 */
function formatCounterDebugValue(value: CounterDebugValue): string {
  return `${value.name}: ${value.count}`
}

/** 创建一份独立计数 State，并暴露增加操作。 */
function useCounter(name: string, initialValue: number) {
  const [count, setCount] = useState(initialValue)

  useDebugValue({ name, count }, formatCounterDebugValue)

  /** 只更新当前 Hook 调用拥有的计数。 */
  function increment() {
    setCount((current) => current + 1)
  }

  return { count, increment }
}
```

不要用格式化函数写日志、修改 State 或触发业务动作。课程只依赖它“被检查时格式化并显示”的调试合同，不把
React DevTools 是否打开作为页面正确性的前提。

### 八、不是每个自定义 Hook 都需要调试标签

React 官方明确提醒不要给每个自定义 Hook 都添加调试值。它在共享库中、内部数据结构复杂且原始值难以检查时
最有价值。本课加入 `useDebugValue` 是为了完整展示 API 合同；简单应用 Hook 可按调试收益决定是否使用。

## 高价值易错点

1. **把函数复用误写成 State 共享。** 两次调用只共享实现，各自拥有独立 State。
2. **用模块级可变值让两个调用“同步”。** 这绕过 React State，也破坏自定义 Hook 的独立调用合同。
3. **在条件或循环中调用自定义 Hook。** render 间的调用顺序可能改变，State 会失去稳定对应关系。
4. **给普通纯函数加 `use` 前缀。** 这会错误声明 Hooks 规则；不调用 Hook 的计算保持普通函数。
5. **看到一次 `useState` 就抽 Hook。** 没有明确用途和对外合同的小抽取可能只增加跳转成本。
6. **期待自定义 Hook 共享同一份业务 State。** 真正需要共享时，应调整 State 所有权，而不是在 Hook 内制造隐式共享。
7. **把 `useDebugValue` 当页面输出。** 调试值只供 React DevTools 检查，不会自动显示在 DOM 中。
8. **把格式化函数的返回值当 Hook 返回值。** `useDebugValue` 本身不返回任何内容；Hook 仍要显式返回业务数据和操作。
9. **在第一个参数中先完成昂贵格式化。** 只有可选格式化函数会延迟到检查时调用，已经算好的 `value` 不会因此变懒。
10. **为每个小 Hook 添加调试值。** 简单原始 State 已易于检查时，标签可能只有噪声。

## 确定性 Demo 合同

### 目标与资产

- 稳定 Demo ID：`react.core.learn.intermediate.custom-hooks.independent-counters-demo`
- 同源组件建议：`src/categories/frontend/react/core/demos/custom-hooks/independent-counters-demo.tsx`
- Demo 只使用 `useState` 与 `useDebugValue` 证明本课主线；页面行为不依赖 DevTools。

### 代码合同

1. 模块顶层定义一个 `useCounter(name, initialValue)`，内部各调用一次 `useState(initialValue)` 和
   `useDebugValue({ name, count }, formatCounterDebugValue)`。
2. `formatCounterDebugValue` 只返回稳定字符串，例如 `左侧: 2`；格式化逻辑不写日志、不修改任何状态，也不影响
   Hook 返回值。
3. Demo 组件在顶层按固定顺序显式调用两次：`useCounter('左侧', 0)`、`useCounter('右侧', 0)`。不得通过条件、
   循环、数组映射、事件处理器或嵌套函数产生 Hook 调用。
4. 每次调用返回自己的 `count`、`increment` 和 `reset`；左右控件只调用本侧函数，不共享 setter、可变对象或
   模块级状态。
5. 运行组件与“查看源码”继续来自同一 TSX 文件；样式只使用 flex、margin 和正常流，不使用 CSS Grid 或 `gap`。

### 可观察交互

1. 冷启动固定显示 `左侧 0 / 右侧 0`。
2. 左侧增加两次后显示 `2 / 0`，证明右侧未被左侧更新影响。
3. 右侧增加一次后显示 `2 / 1`，证明右侧拥有自己的更新路径。
4. 重置左侧后显示 `0 / 1`，证明重置也只作用于当前调用。
5. 普通页面测试只断言上述 DOM 行为；没有 React DevTools 时，页面仍应完全可用且结果相同。
6. 在 React DevTools 中检查组件时，两个 `useCounter` 调用应分别显示与当前计数一致的可读调试值。这里不固定
   DevTools 的标点或视觉样式，只验证值的语义。

## 后续验证建议

### 正文事实

- 每条“必须”“不会”“仅限”结论都能回到 S1-S9 的公共文档；S10-S12 只标为固定实现旁证。
- 正文明确区分逻辑复用、独立 State 和共享 State 所有权，不用源码内部机制解释学习者 API。
- `useDebugValue` 同时覆盖目的、参数、无返回值、可选格式化函数的延迟调用和 DevTools-only 边界。
- 检查正文没有把“小型 `useCounter` 教学模型”扩张成所有重复代码都应抽 Hook。

### 静态代码

- 自定义 Hook 名以 `use` 加大写字母开头，组件和 Hook 内的所有 Hook 调用均位于顶层并保持固定顺序。
- 两次 `useCounter` 是两个显式调用点；没有模块级可变状态、条件调用或调用顺序变化。
- `useDebugValue` 的格式化函数没有副作用；Hook 的业务返回值不依赖它的执行。
- TypeScript 可以验证参数和返回类型，但“每次调用拥有独立 State”仍需通过运行交互证明。

### 运行交互与 DevTools

- 复跑 `0 / 0 -> 2 / 0 -> 2 / 1 -> 0 / 1`，每一步只改变目标调用。
- 在桌面和 390px 宽度检查控件换行、键盘操作、焦点可见性及无横向溢出。
- 普通自动化验证不应寻找页面上的调试标签；`useDebugValue` 不产生 DOM。
- 需要核验调试值时，单独使用 React DevTools 检查两个 Hook 调用。格式化函数的懒执行边界以官方 API 合同和
  DevTools 检查为证，不在业务 UI 中增加计数器或副作用探针。

## 明确不覆盖

本课不扩展到其他 Effect 变体、Effect Event、Context、Reducer、Ref、网络、timer、Promise、外部 store、
Strict Mode 系统检查或综合聊天室实战。也不讲 React Compiler、Server Components、并发调度、Fiber 内部实现或
DevTools 插件实现。它们都不是证明“复用有状态逻辑、每次调用 State 独立、调试值只供 DevTools”所必需的内容。

## 参考资料

1. [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) - 自定义 Hook 的抽取、命名、独立 State 和适用边界。
2. [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) - 顶层调用和 React 函数边界。
3. [rules-of-hooks lint](https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks) - 固定调用顺序及常见违规。
4. [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) - 共享 State 时的所有权与状态提升。
5. [`useDebugValue`](https://react.dev/reference/react/useDebugValue) - DevTools 标签、参数、返回值和延迟格式化。
6. [`useState`](https://react.dev/reference/react/useState) - State 声明与更新的公共合同。
7. [React `v19.2.8` `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L66-L70) - 固定 runtime 的公共 Hook 分发旁证。
8. [React `v19.2.8` State mount](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L1895-L1935) 与 [`useDebugValue` 实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2888-L2894) - 固定 runtime 的 State 与调试值实现旁证，不构成用户 API。
