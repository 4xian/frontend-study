# useMemo 与值缓存研究记录

## 调研范围

- 课程标识：`react.core.learn.advanced.use-memo-value-caching`
- 知识主题：`useMemo` 签名、纯计算、依赖比较、缓存边界、对象与数组身份
- 教学层级：本科高级
- 核验日期：`2026-08-17`
- 官方文档基线：React `19.2`
- 仓库运行时：React / React DOM `19.2.8`
- React 固定源码：`v19.2.8`，commit `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- React 文档固定源码：`reactjs/react.dev`，commit `383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`

本记录只研究客户端组件中的 `useMemo` 值缓存。React Compiler、服务端 `cache`、数据请求缓存、持久化、Fiber
调度和内部 `useMemoCache` 不属于本主题；`memo`、`useCallback` 与 `useEffect` 只讲它们和 `useMemo` 的职责边界。

## 调研方法与证据等级

1. 先用 Tavily 在 `react.dev` 中发现 `useMemo`、`memo`、`useEffect` 和 `You Might Not Need an Effect` 官方页面。
2. 候选 URL 再用 `curl -L --fail --silent --show-error` 回读 React 文档原文；搜索摘要和社区文章不承担事实证明。
3. React 19.2.8 的依赖比较、挂载/更新分支、Strict Mode 计算调用使用固定 tag 源码旁证；实现细节不升级为跨版本
   公共 API。
4. 每条课程结论都在证据矩阵中绑定官方 URL；文档事实优先于源码推导。

## 官方来源卡

| 编号 | 一手来源 | 支撑事实 |
| --- | --- | --- |
| S1 | [`useMemo` Reference](https://react.dev/reference/react/useMemo) | 签名、纯无参计算、完整依赖、`Object.is` 比较、返回值和缓存 caveat。 |
| S2 | [固定 `useMemo` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useMemo.md#L27-L61) | 固定 S1 的参数、返回值、顶层调用、Strict Mode 和缓存丢弃合同。 |
| S3 | [固定 `useMemo` 使用说明](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useMemo.md#L73-L170) | 只跳过更新计算；测量昂贵程度；适用场景和避免滥用的原则。 |
| S4 | [`useMemo` 与 `memo`](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useMemo.md#L557-L644) | 数组/对象引用、子组件 `memo`、稳定结果身份和组件重渲染边界。 |
| S5 | [`useMemo` 对象依赖](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useMemo.md#L1065-L1182) | 对象依赖会破坏缓存；优先在计算函数或 Effect 内创建对象；缓存丢弃可能重新触发 Effect。 |
| S6 | [`memo` Reference](https://react.dev/reference/react/memo) | `memo` 优化组件 Props 比较，不等于缓存计算结果或永远跳过 render。 |
| S7 | [`useEffect` Reference](https://react.dev/reference/react/useEffect) | Effect 用于提交后同步外部系统；动态对象优先移入 Effect，不能靠 `useMemo` 保证同步语义。 |
| S8 | [`You Might Not Need an Effect`](https://react.dev/learn/you-might-not-need-an-effect#caching-expensive-calculations) | 派生数据先在 render 中直接计算；只有计算确实昂贵时才缓存，`useMemo` 回调必须纯净。 |
| S9 | [`useCallback` Reference](https://react.dev/reference/react/useCallback#the-difference-between-usecallback-and-declaring-a-function-directly) | `useCallback` 缓存函数身份；它与 `useMemo` 返回函数的效果相同但 API 更直接。 |
| S10 | [固定 `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L143-L149) | 公共 Hook 将 `create` 和 `deps` 转交 dispatcher。 |
| S11 | [固定 `ReactFiberHooks.js` 依赖比较](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L454-L500) | 固定版本按位置调用 `Object.is` 语义比较，开发环境检查依赖长度。 |
| S12 | [固定 `ReactFiberHooks.js` memo 分支](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2917-L2961) | mount 保存 `[value, deps]`；update 在依赖相等时返回旧值，否则重算并替换。 |
| S13 | [固定 `objectIs.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/shared/objectIs.js#L10-L24) | 当前版本优先使用原生 `Object.is`，否则使用同语义 polyfill。 |

## 研究结论

### 1. `useMemo` 缓存计算结果，不缓存计算过程

```tsx
const cachedValue = useMemo(calculateValue, dependencies)
```

`calculateValue` 是一个不接收参数的函数。React 在初次 render 调用它，并把返回值交给组件；后续 render 会根据
依赖决定复用上一次结果还是再次调用。缓存对象是“计算的返回值”，不是函数执行过程、网络响应或外部资源（S1、S2）。

```tsx
const visibleItems = useMemo(
  () => filterItems(items, query),
  [items, query],
)
```

`useMemo` 不会让组件停止 render，也不会自动让所有子组件停止 render。它只控制这个计算函数是否需要重新执行。

### 2. 计算函数必须是纯函数

`useMemo` 回调在 render 阶段执行。相同输入应得到相同结果，且不能发送请求、修改 DOM、设置定时器、写入外部
变量、提交 State 或修改传入的 Props。纯函数可以被 React 重新调用、丢弃结果或在开发期调用两次，而不会改变业务行为
（S1、S8）。

```tsx
// 正确：只读取输入并返回新数组。
const visibleItems = useMemo(
  () => items.filter((item) => item.name.includes(query)),
  [items, query],
)

// 错误：缓存回调不应执行副作用。
const result = useMemo(() => {
  sendAnalytics('filter', query)
  return filterItems(items, query)
}, [items, query])
```

计算函数可以修改它自己在本次计算中创建的新对象，但不能修改 Props、State 或其他共享对象。Strict Mode 的重复调用
正是为了暴露这类不纯行为（S2、S3）。

### 3. 依赖数组描述计算读取的响应值

依赖应包含计算函数中读取的所有 Props、State，以及组件函数体内声明的变量和函数。依赖数组必须固定长度、直接内联，
React 按相同位置逐项用 `Object.is` 比较，不进行深比较（S1、S11、S13）。

```tsx
function SearchResults({ items, query, theme }: Props) {
  const visibleItems = useMemo(
    () => filterItems(items, query),
    [items, query],
  )

  return <ResultList items={visibleItems} theme={theme} />
}
```

这里 `theme` 没有被计算函数读取，因此不属于该 `useMemo` 的依赖。相反，如果计算函数读取了 `locale`，就必须把
`locale` 写入依赖。不能为了“只算一次”写空数组，也不能用条件、`push`、`spread` 或排序动态生成依赖。

React 19.2.8 的固定实现会在开发环境提示依赖长度变化，但真正的缓存命中判断仍是逐项比较。运行时不会分析闭包来
自动补齐漏掉的依赖；静态 linter 和代码审查负责保证依赖完整。

### 4. `Object.is` 比较的是值或引用身份

对数字、字符串、布尔值等原始值，`Object.is` 按值判断；对对象、数组和函数，判断的是引用是否是同一个对象。内容
相同不等于依赖相同：

```tsx
Object.is({ mode: 'all' }, { mode: 'all' }) // false
Object.is([1, 2], [1, 2]) // false
```

因此下面的 `options` 每次 render 都是新对象，`useMemo` 每次都会重新计算：

```tsx
function Dropdown({ items, text }: Props) {
  const options = { matchMode: 'whole-word', text }
  const visibleItems = useMemo(
    () => searchItems(items, options),
    [items, options],
  )

  return <List items={visibleItems} />
}
```

更直接的写法是在计算函数内创建对象，并依赖原始输入：

```tsx
const visibleItems = useMemo(() => {
  const options = { matchMode: 'whole-word', text }
  return searchItems(items, options)
}, [items, text])
```

这样依赖清楚表达了真正的输入，也少了一层需要维护的缓存（S5）。

### 5. 缓存返回的数组或对象可以保留结果身份

每次调用 `filterItems` 都可能返回新数组。即使数组元素完全相同，新引用也会被 `memo` 组件视为新的 Prop。将纯计算
包入 `useMemo` 后，在依赖未变且缓存仍存在的普通更新中，返回的数组可以保持同一引用（S4）。

```tsx
const visibleItems = useMemo(
  () => filterItems(items, query),
  [items, query],
)

const MemoizedList = memo(function MemoizedList({ items }: Props) {
  return <List items={items} />
})

return <MemoizedList items={visibleItems} />
```

这里有两个独立层次：`useMemo` 缓存数组计算结果，`memo` 比较子组件 Props 并尝试跳过子组件 render。只有其中一个
并不能推出另一个的行为。若 `items` 或 `query` 变化，数组应重新计算；若只切换 `theme` 且依赖未变，子组件才有机会
收到同一数组引用并跳过 render。

### 6. 缓存不是语义上的永久存储

官方只承诺 React 会在依赖没有变化时复用已保存的值，并同时保留因特定原因丢弃缓存的权利。已知情形包括：

- 开发环境编辑组件文件时丢弃缓存；
- 组件首次挂载时发生 Suspense，React 丢弃这次挂载缓存；
- 未来虚拟列表等功能可能丢弃离开可视区域项目的缓存。

因此不能依赖 `useMemo` 生成稳定 ID、资源句柄、必须只初始化一次的对象或任何业务正确性状态。需要语义持久性时，
根据是否应触发 render，选择 State 或 Ref；需要昂贵计算时才选择 `useMemo`（S2）。

缓存被丢弃只应导致计算重新执行，不应改变正确结果。任何删除 `useMemo` 后会失效的代码，都在把性能优化误用成业务
合同。

### 7. `useMemo` 不会加速初次 render

初次 render 必须执行计算来得到第一个值。`useMemo` 的收益只来自后续更新中跳过不必要的重复工作；切换依赖时仍必须
重算（S3、S8）。

使用前先测量同一路径中的计算成本：

1. 先写不带 `useMemo` 的正确纯计算。
2. 使用真实输入重复触发让组件更新的交互。
3. 用 `console.time`、Profiler 或其他一致的测量方式确认计算确实占用可感知时间。
4. 加入 `useMemo` 后在相同构建、设备、输入和交互下比较，不用单次毫秒值做跨设备结论。

开发环境可能包含 Strict Mode 额外调用和调试开销，性能结论应在面向用户的生产构建中复核（S3）。

### 8. 适合使用的场景

React 官方给出三类主要理由（S3）：

1. 纯计算已经测得明显昂贵，并且依赖很少变化，例如大数组筛选、排序或确定性数据转换。
2. 计算结果作为 `memo` 组件的 Prop，需要保持引用以便子组件比较相同 Props。
3. 计算结果会成为其他 Hook 的依赖，且稳定结果确实能减少不必要的同步或计算。

如果计算很快、依赖每次都变化、组件更新很少或没有测量证据，直接计算通常更清楚。过度使用会增加依赖维护和阅读
成本，且一个总是新建的值就能破坏整个缓存链（S3）。

### 9. 与 `useEffect` 的边界

`useMemo` 在 render 中执行纯计算；`useEffect` 在提交后与外部系统同步。请求、订阅、DOM 操作、连接、资源清理和
用户动作不应放进 `useMemo`（S7、S8）。

如果 Effect 只需要一个由响应输入构成、只在 Effect 中使用的对象，优先直接在 Effect 内创建：

```tsx
useEffect(() => {
  const options = { serverUrl, roomId }
  const connection = createConnection(options)
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])
```

把 `options` 用 `useMemo` 稳定后再传给 Effect，确实可能减少普通更新中的重连；但缓存不是语义保证，React 丢弃缓存时
Effect 仍可能重新执行。Effect 必须本身能够安全地重新同步，不能把 `useMemo` 当成“永远不重连”的承诺（S5、S7）。

### 10. 与 `memo` 和 `useCallback` 的边界

| API | 主要缓存对象 | 典型目的 | 本主题不作的承诺 |
| --- | --- | --- | --- |
| `useMemo` | 计算返回的值 | 跳过昂贵纯计算，或保持对象/数组引用 | 不保证永久缓存，不阻止父组件 render |
| `memo` | 组件 render 结果的进入条件 | Props 未变化时尝试跳过子组件 render | 不保证组件永远不 render，State/Context 变化仍可能更新 |
| `useCallback` | 函数引用 | 将函数作为 `memo` Props 或 Hook 依赖时保持身份 | 不缓存函数执行结果，不替代正确依赖 |

`useMemo(() => fn, deps)` 与 `useCallback(fn, deps)` 在缓存函数身份方面等价，但 `useCallback` 更直接。这里说明二者的
职责边界，不展开函数身份缓存的完整设计（S6、S9）。

## React 19.2.8 固定源码推导

### 推导一：缓存状态位于 Hook 槽位

- **官方事实：** `useMemo` 是组件或自定义 Hook 顶层调用的 Hook，后续 render 会复用上一次结果（S1、S2）。
- **源码旁证：** mount/update 分支把值和依赖保存在当前 Hook 的 `[nextValue, nextDeps]` 元组，update 依赖相等时返回
  元组的旧值（S12）。
- **课程推导：** 缓存属于一个组件实例的一次 Hook 调用，不是全局共享字典；不同组件实例不会因为输入内容相同而共享
  `useMemo` 结果。
- **边界：** Hook 元组、Fiber 链和 dispatcher 是实现细节，不能在应用代码中读取。

### 推导二：命中判断不是深比较

- **官方事实：** 依赖逐项使用 `Object.is`（S1、S2）。
- **源码旁证：** `areHookInputsEqual` 按索引遍历并调用内部 `is`，而 `is` 优先绑定原生 `Object.is`（S11、S13）。
- **课程推导：** 对象和数组必须保持引用才可能命中；改变内部字段但保持同一引用也不会让 `useMemo` 发现变化，这也是
  不应直接修改 Props/State 的原因。
- **边界：** 不把当前源码的警告文本或生产环境长度检查行为写成新的公共 API。

### 推导三：开发期重复调用用于检查纯度

- **官方事实：** Strict Mode 开发环境可能调用计算函数两次并丢弃一个结果（S2、S3）。
- **源码旁证：** 固定版本在 mount/update 计算后，开发标志打开时再次调用 `nextCreate`，仍保存第一次结果（S12）。
- **课程推导：** 计算回调不能用自增计数、日志数量或随机值证明缓存次数；用纯输出和受控输入观察行为。
- **边界：** 不把开发期调用次数当生产性能数字，也不承诺每种开发构建都给出相同的日志顺序。

## 本科正文知识结构

正文按以下顺序组织，示例只使用纯数据转换和局部 UI，避免提前进入服务器、Compiler 或框架优化：

### 1. 为什么需要值缓存

- 组件每次 render 都会执行普通计算。
- 快速计算直接写在 render 中更简单。
- 只有真实输入大、计算慢且无关更新频繁时，才有必要跳过重复计算。
- “缓存结果”与“跳过组件 render”是两个不同问题。

### 2. `useMemo` 基本写法

```tsx
const value = useMemo(() => calculate(input), [input])
```

- 计算函数无参数，依赖从闭包读取。
- 返回任意类型，初次 render 立即得到结果。
- 依赖不变时复用，依赖变化时重算。
- Hook 只能在组件或自定义 Hook 顶层调用。

### 3. 完整依赖与 `Object.is`

- 依赖数组列出计算读取的全部响应值。
- 长度和顺序保持固定，使用内联数组。
- 对象、数组和函数按引用比较，不按字段深比较。
- 组件体中每次新建的对象会让依赖每次变化。

### 4. 纯计算与副作用分工

- 筛选、排序、映射、聚合等确定性转换可以缓存。
- 请求、订阅、DOM 写入、State 同步和事件动作不能放进计算函数。
- 删除 `useMemo` 后必须仍然正确，只可能多做计算。

### 5. 结果身份与 `memo`

- 新数组或新对象即使内容相同也会产生新引用。
- `useMemo` 可以在依赖不变时保留结果引用。
- `memo` 组件可以利用稳定 Prop 尝试跳过 render。
- 父组件仍然会 render；子组件也可能因自身 State、Context 或缓存丢弃而 render。

### 6. 对象依赖的改写

- 先把对象创建放进计算函数，依赖对象的原始字段。
- 只在对象必须被多个计算或 Hook 共享时，才讨论单独缓存对象。
- Effect 只使用对象时，优先把对象放进 Effect，不用 `useMemo` 伪造外部同步稳定性。

### 7. 缓存失效和生命周期

- 依赖变化会使当前缓存失效。
- 初次挂载、开发热更新和官方列出的特定情形可能丢弃缓存。
- 缓存丢失后重新计算必须得到正确值。
- 需要稳定保存的业务数据使用 State 或 Ref，而不是 `useMemo`。

### 8. 开发期与性能测量

- Strict Mode 可能两次调用计算函数，纯计算结果不应改变。
- `useMemo` 不加速初次 render。
- 先测量，再在相同交互和构建条件下比较。
- 开发期毫秒值不能直接代表生产用户体验。

### 9. API 选择练习

- 纯计算结果缓存：`useMemo`。
- 子组件 Props 比较：`memo`，必要时配合稳定值。
- 函数引用缓存：`useCallback`。
- 外部系统同步与 cleanup：`useEffect`。
- 语义持久的值：State 或 Ref。

## 高价值易错点

1. **把 `useMemo` 当成只执行一次：** 依赖变化、缓存丢弃或 Strict Mode 都可能再次调用。
2. **计算函数里发送请求或改 State：** render 阶段副作用会在重复调用时产生错误行为。
3. **漏掉计算读取的依赖：** 缓存可能返回旧结果，和 Effect 的陈旧闭包问题类似。
4. **把空数组当性能开关：** 如果计算读取响应值，空数组不是完整依赖。
5. **依赖组件体内新建对象：** 每次引用不同，缓存根本命不中。
6. **只因内容相同就认为数组身份相同：** `Object.is` 不做深比较。
7. **用 `useMemo` 保存业务 ID 或资源：** React 可丢弃缓存，语义数据应使用 State/Ref。
8. **认为 `useMemo` 会阻止组件 render：** 它只缓存一个计算结果，组件和其他代码仍可能执行。
9. **认为 `memo` 会缓存计算：** `memo` 控制组件是否尝试 render，不替代父组件内的昂贵计算。
10. **为了稳定 Effect 对象优先套 `useMemo`：** 官方建议先把只供 Effect 使用的对象移入 Effect。
11. **用开发日志次数判断性能：** Strict Mode 会额外调用计算函数，必须在适当构建中测量。
12. **对 `useMemo` 结果直接修改共享对象：** 违反纯度并会污染 Props/State；只修改本次新建对象才可接受。

## 确定性 Demo 验收合同

### 资产建议

- Demo 标识：`react.core.learn.advanced.use-memo-value-caching.value-cache-demo`
- 运行与展示源码：`src/categories/frontend/react/core/demos/use-memo-value-caching/use-memo-value-caching-demo.tsx`
- 样式源码：`src/categories/frontend/react/core/demos/use-memo-value-caching/use-memo-value-caching-demo.css`
- 运行组件和源码展示必须读取同一份 TSX/CSS，不复制展示代码。
- 数据集使用模块级确定性只读数组，不使用随机数、网络、Promise、timer、全局可变状态或动画。
- CSS 使用 Flexbox 和普通流，不使用 `grid`、`gap` 或非零 `letter-spacing`。

### 数据和组件合同

1. 模块级 `records` 使用确定性的只读记录，每项包含标题和分数；数据量足够让同步校验计算可感知，但不使用阻塞式人为延迟。
2. `UseMemoValueCachingDemo` 保存 `query`、`workload`、无关的父组件版本和观察状态。直接计算分支与 `useMemo` 分支使用相同的
   `calculateReport(query, workload)` 纯函数，缓存调用依赖精确为 `[query, workload]`。
3. 父组件版本更新不改变 `query` 或 `workload`，因此只触发父组件 render，不改变缓存计算输入。
4. 计算函数只读取输入、筛选模块级记录并创建新的结果对象，执行确定性的同步校验循环；不写计数器、日志副作用、Ref、State、DOM
   或外部对象。
5. Demo 同时展示直接计算和 `useMemo` 计算结果，显示匹配数量与校验值。直接计算在每次 render 执行，缓存计算在依赖未变时
   返回同一结果引用，依赖变化时生成新结果。
6. Demo 通过提交后的 Effect 记录已提交缓存结果版本，并在更新前保存结果引用，展示 `Object.is` 是否相同；这些状态只用于观察，
   不参与计算，也不把 `useMemo` 变成永久身份承诺。
7. Demo 提供无关父级更新、关键词变化、计算规模变化和确定性重置路径；不并列运行错误依赖版本，缺失依赖、对象依赖和把副作用
   放进 `useMemo` 等错误代码只出现在正文静态示例。

### 浏览器可观察路径

1. 冷启动：显示默认关键词 `react`、轻负载和两条计算分支的确定性结果；缓存生成状态从首次结果开始。开发 Strict Mode 可能让纯
   计算函数被调用两次，不得把这个次数当作生产缓存次数。
2. 仅更新父组件：父组件版本增加，`query` 和 `workload` 不变，缓存生成版本不增加，最近结果的 `Object.is` 显示相同。
3. 修改关键词：关键词在固定词表中切换，缓存依赖变化，匹配数量或校验值随之更新，结果身份显示不同。
4. 切换计算规模：轻、中、重负载改变 `workload` 依赖，计算生成新结果；重负载只增加确定性同步计算，不使用人为等待。
5. 再次仅更新父组件：使用当前关键词和负载，不能因为无关版本更新而重新生成缓存结果。
6. 重置：恢复父组件版本、关键词、负载和观察基线；重新计算或缓存丢失都不影响最终正确性。
7. 使用窄视口与放大根字号：按钮、结果状态、数量和源码入口不溢出，控件不被遮挡。

### 静态与类型验收

- `useMemo` 在组件顶层恰好有一个本课计算调用，第二参数是固定内联数组 `[query, workload]`。
- AST 检查计算函数没有 `setState`、请求、DOM 写入、timer、Promise、随机数或外部可变赋值。
- 计算读取的组件响应值与依赖集合一致；无关的父组件版本和观察状态不在计算读取集合中，也不在依赖数组中。
- 缓存结果和计算输入使用只读类型约束；缓存展示组件接收的结果由同一个 `useMemo` 返回值提供。
- TypeScript 只证明记录、查询条件、负载和计算结果的类型；不能证明缓存命中、计算纯度或 React 是否保留缓存。
- 运行文件和展示文件的 `trimEnd()` 字符数、UTF-8 字节数和 SHA-256 一致。

## 参考资料

1. [`useMemo` Reference](https://react.dev/reference/react/useMemo) - 签名、依赖、纯计算、适用场景和缓存 caveat。
2. [固定 `useMemo` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useMemo.md) - React 19.2 文档快照。
3. [`memo` Reference](https://react.dev/reference/react/memo) - 组件 Props 比较与跳过 render 的边界。
4. [`useEffect` Reference](https://react.dev/reference/react/useEffect) - 外部同步、对象依赖和 cleanup 边界。
5. [`You Might Not Need an Effect`](https://react.dev/learn/you-might-not-need-an-effect#caching-expensive-calculations) - 先直接派生，再按测量缓存昂贵计算。
6. [`useCallback` Reference](https://react.dev/reference/react/useCallback) - 函数引用缓存与 `useMemo` 返回函数的关系。
7. [React v19.2.8 `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L143-L149) - Hook dispatcher 转发。
8. [React v19.2.8 `ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L454-L500) - 依赖比较。
9. [React v19.2.8 `ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2917-L2961) - mount/update memo 分支。
10. [React v19.2.8 `objectIs.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/shared/objectIs.js#L10-L24) - `Object.is` 实现选择。
