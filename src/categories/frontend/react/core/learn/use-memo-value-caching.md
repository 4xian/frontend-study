---
id: react.core.learn.advanced.use-memo-value-caching
type: lesson
title: useMemo 与值缓存
summary: 用完整依赖缓存昂贵的纯计算结果，并判断缓存是否真正减少了更新期工作。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 80
prerequisites:
  - react.core.learn.intermediate.state-structure
  - react.core.learn.advanced.profiler-render-measurement
related:
  - react.core.learn.intermediate.unnecessary-effects
  - react.core.learn.intermediate.effect-dependencies
tags:
  - React
  - useMemo
  - 值缓存
  - 依赖数组
  - Object.is
  - 渲染性能
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能写出 useMemo 的签名，并说明计算函数、依赖数组和返回值的职责。
  - 能列出计算读取的全部 reactive values，并解释依赖项按 Object.is 逐项比较。
  - 能保证缓存计算是纯函数、输入不可变，并区分缓存结果与业务 State。
  - 能用相同输入和交互路径测量直接计算与 useMemo 的更新期差异。
  - 能识别对象、数组和函数依赖的引用变化，并通过重构减少无意义的缓存失效。
  - 能说明 useMemo 不是正确性、永久存储或首次渲染加速的保证。
recap:
  - useMemo 在依赖未变时返回之前保存的计算结果，依赖变化时重新计算。
  - 依赖数组必须包含计算读取的全部 reactive values，比较语义是逐项 Object.is。
  - 计算函数无参数且必须保持纯净；不能修改输入、触发 State 更新或承担外部同步。
  - 缓存只解决更新期重复计算，首次 render 仍需要执行计算函数。
  - 新对象、数组和函数会形成新引用，可能让依赖每次都变化；把临时对象放进计算函数通常更清楚。
  - 缓存结果的引用可以用于当前 render 的稳定值，但不能充当必须永久不变的业务身份。
  - 先测量计算成本和依赖变化频率，再决定是否保留 useMemo。
sources:
  - title: useMemo
    url: https://react.dev/reference/react/useMemo
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - useMemo 的签名、首次和后续 render、依赖比较、纯计算与性能定位
      - Strict Mode 计算调用、缓存丢弃与非语义保证
  - title: You Might Not Need an Effect
    url: https://react.dev/learn/you-might-not-need-an-effect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 同步派生值应在 render 中计算，昂贵计算需要测量后再缓存
      - useMemo 不会加速首次 render，简单计算不应默认缓存
  - title: Components and Hooks must be pure
    url: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - render 和 Hook 计算必须幂等，不能修改非局部输入或触发外部副作用
  - title: React 19.2.8 ReactFiberHooks source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本中 useMemo 的 mount/update 路径和依赖相等判断实现佐证
  - title: React 19.2.8 objectIs source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/shared/objectIs.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本使用 Object.is 语义比较依赖项的实现佐证

---

# useMemo 与值缓存

## 一、学习目标

- 写出 `useMemo` 的基本调用形式，说明计算函数、依赖数组和返回值之间的关系。
- 从计算函数的闭包中找出所有 reactive values，并为每项写出完整、固定长度的依赖列表。
- 保证计算函数是纯函数，不修改输入、不安排 State 更新，也不把缓存当作外部资源所有者。
- 通过相同输入、相同操作和相同环境比较直接计算与缓存计算的更新期工作。
- 识别对象、数组和函数的引用变化，知道哪些写法会让缓存每次失效。
- 解释缓存丢弃、首次 render、开发期额外调用和普通生产构建之间的证据边界。

## 二、为什么需要值缓存

State 更新会让组件再次 render。render 中的同步派生计算也会随之再次执行，即使这次更新没有改变计算真正
依赖的数据。大多数计算很快，直接写在 render 中最容易理解；但排序、过滤大型集合、解析较长文本或生成
复杂统计结果可能占用可感知的 CPU 时间。

值缓存解决的是一个很具体的问题：在一次后续 render 中，如果计算依赖没有变化，就复用上一次计算结果，
避免重复执行同一段纯计算。它不把结果变成 State，也不改变结果的正确性来源。当前 render 仍由 Props、State
和 Context 的最新快照决定；`useMemo` 只记录一次计算的结果，供 React 在满足条件时复用。

```tsx
import { useMemo } from 'react'

type Product = Readonly<{ price: number; inStock: boolean }>

/** 根据当前商品和筛选条件计算可见商品。 */
function ProductList({ products, query }: { products: Product[]; query: string }) {
  const visibleProducts = useMemo(
    () => products.filter((product) => product.inStock && product.price >= Number(query || 0)),
    [products, query],
  )

  return <p>找到 {visibleProducts.length} 件商品</p>
}
```

这段代码的正确性仍来自 `products` 和 `query`。若删除 `useMemo` 并直接调用同一个纯函数，结果应该完全
相同；变化的只是某些后续 render 是否重复执行计算。

## 三、最小模型与调用签名

### 1. 计算函数返回一个值

`useMemo` 的形式是：

```tsx
const cachedValue = useMemo(calculateValue, dependencies)
```

`calculateValue` 是一个不接收参数的函数。它可以读取当前组件作用域中的 Props、State、常量和其他允许在
render 中读取的值，并返回本次 render 需要的结果。`dependencies` 是一个内联数组，列出计算函数读取的
reactive values。

```tsx
const total = useMemo(
  () => lines.reduce((sum, line) => sum + line.amount * line.quantity, 0),
  [lines],
)
```

React 首次 render 时执行计算函数并保存结果。后续 render 时逐项比较依赖：所有依赖都没有变化，就返回之前
保存的结果；任一依赖变化，就执行当前计算函数并保存新的结果。

### 2. 依赖数组不是计算参数的替代品

依赖数组描述的是计算函数的闭包输入，而不是“我希望什么时候刷新”的开关。计算函数读取了什么，就要把
什么列为依赖：

```tsx
const visible = useMemo(
  () => filterProducts(products, query, onlyInStock),
  [products, query, onlyInStock],
)
```

少写依赖可能让计算继续返回旧结果；多写一个每次 render 都变化的值会让缓存失去复用机会。数组项的数量和
顺序应保持固定，不能根据条件拼接不同长度的数组。

### 3. Hook 仍要在顶层调用

`useMemo` 遵守 Hooks 调用规则。它应直接写在组件或自定义 Hook 的顶层，不能放进条件分支、循环或普通
事件处理器中：

```tsx
// 正确：每次 render 都以相同顺序调用 Hook。
const result = useMemo(() => calculate(items), [items])

// 错误：Hook 调用顺序会随 enabled 改变。
// if (enabled) {
//   return useMemo(() => calculate(items), [items])
// }
```

若只在某个条件下需要结果，可以始终调用 `useMemo`，再在返回值使用处判断；或者把条件放进纯计算函数，
让 Hook 的位置保持稳定。

## 四、依赖比较与引用身份

### 1. 每项依赖使用 Object.is

React 不会递归比较对象的每个字段。依赖数组中的每一项按 `Object.is` 与上一次对应位置比较：

```tsx
Object.is('报告', '报告') // true
Object.is(2, 2) // true
Object.is({ page: 1 }, { page: 1 }) // false
Object.is([1, 2], [1, 2]) // false
```

因此稳定的字符串、数字和布尔值通常容易复用；每次 render 新建的对象、数组或函数即使内容相同，也会被
视为不同依赖。

### 2. 对象依赖可能让缓存每次失效

下面的 `options` 在每次 render 中都是新对象，`useMemo` 看到的依赖每次都变化：

```tsx
// 计算函数本身没有变化，但 options 每次都是新引用。
const options = { query, onlyInStock }
const visible = useMemo(() => filterProducts(products, options), [products, options])
```

如果对象只为这一次计算服务，更直接的写法是把它放进计算函数，并只依赖构成它的原始值：

```tsx
const visible = useMemo(() => {
  const options = { query, onlyInStock }
  return filterProducts(products, options)
}, [products, query, onlyInStock])
```

这不是为了“让依赖列表变短”，而是让依赖列表准确表达计算真正读取的值。若对象本身是 Props 或跨组件
共享的事实，就保留对象依赖，并在它的所有者真正改变时创建新引用。

### 3. 计算结果的对象身份

`useMemo` 可以让返回对象在依赖未变化的 render 之间保持同一个引用：

```tsx
const summary = useMemo(
  () => ({ count: items.length, total: sum(items) }),
  [items],
)
```

这能减少下游依赖引用的无意义变化，但它不是业务身份。订单 ID、用户 ID、缓存键或资源句柄必须使用有明确
生命周期和所有权的 State、Props、Ref 或外部系统；不能因为某个对象目前来自 `useMemo` 就假设其引用永远
不变。

## 五、计算函数必须纯净

### 1. 纯计算只读取输入并返回结果

计算函数可以遍历、排序副本、格式化和聚合数据，但不能修改传入的数组或对象，也不能写入模块级变量：

```tsx
const sorted = useMemo(
  () => [...items].sort((left, right) => left.name.localeCompare(right.name)),
  [items],
)
```

复制后排序不会改变 `items`。相反，直接调用 `items.sort()` 会修改 Props 或 State 里的对象，后续 render
可能看到无法解释的顺序变化。

### 2. 不在计算函数中触发 State 更新

计算函数属于 render 过程。调用 `setState`、发请求、写入 localStorage、订阅事件或修改 DOM 都是副作用，
不能塞进 `useMemo`：

```tsx
// 错误：计算结果不应该通过 State 反馈给当前 render。
const value = useMemo(() => {
  setStatus('计算中')
  return expensiveCalculation(input)
}, [input])
```

如果需要响应用户动作，把动作放在事件处理器；如果需要同步外部系统，把同步放在合适的 Effect 或专门
的外部资源边界。`useMemo` 只负责返回当前 render 的计算值。

### 3. 开发期额外调用是纯度检查

在 Strict Mode 开发环境中，React 可能额外调用计算函数来发现不纯代码。计算函数若只读取输入并返回结果，
额外调用不会改变用户可见结果；若它修改了输入，就会暴露重复追加、重复排序或重复写入等问题。不要用
“开发环境调用次数更多”来推断生产缓存次数，也不要为绕过检查而隐藏副作用。

## 六、什么时候值得使用

### 1. 先建立直接计算基线

默认先写最简单的纯计算：

```tsx
const visible = products.filter((product) => matches(product, query))
```

只有当下列条件同时成立时，才值得测量并尝试 `useMemo`：

- 计算确实占用了可感知的 render 时间，而不是几次属性读取或简单加法。
- 组件会因为其他 State 或父级输入频繁更新。
- 计算依赖在这些无关更新中经常保持不变。
- 相同操作路径下，缓存后的更新期工作有稳定、可解释的下降。

缓存本身也有成本：需要维护依赖列表、保存结果和进行比较。对很小的计算，额外的代码和比较可能比重新
计算更复杂。

### 2. 不会加速首次 render

首次挂载没有上一次结果可以复用，计算函数仍会执行。若问题是首屏代码下载、网络等待或浏览器绘制，
`useMemo` 也不是对应工具。它只针对已挂载组件的后续 render 中“依赖未变但计算被再次执行”的情况。

### 3. 用 Profiler 和同类样本比较

可以沿用 Profiler 的 commit 记录，固定浏览器、构建模式、输入规模和操作顺序，先记录直接计算，再记录
`useMemo` 版本。至少收集多次同类 update，分别观察实际时长、依赖是否变化和结果是否正确。单次毫秒数不能
证明长期收益，也不能把开发构建的数字直接当成生产数字。

## 七、与派生值、Effect 和其他缓存的边界

### 1. `useMemo` 不把派生值变成 State

能由当前 Props 和 State 同步得到的结果仍是 render 派生值。`useMemo` 只是让某些计算结果在依赖稳定时复用，
不是新增一份可写事实：

```tsx
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName])
```

这个例子功能上通常应直接写成模板字符串。无论是否使用 `useMemo`，`fullName` 都不能再通过另一个 State
保存并用 Effect 同步，否则会引入陈旧结果和额外 render。

### 2. 不用 `useMemo` 伪造 Effect 的稳定配置

如果某个对象只用于 Effect 内部同步，优先把对象放进 Effect 并依赖它实际读取的原始值，而不是先用
`useMemo` 包住对象来压制依赖变化：

```tsx
useEffect(() => {
  const connectionOptions = { serverUrl, roomId }
  connect(connectionOptions)
  return () => disconnect(connectionOptions)
}, [serverUrl, roomId])
```

这里的主题是外部同步生命周期，`useMemo` 不是必需的修复。只有当当前课程的问题确实是昂贵的纯值计算，
才在 render 中使用值缓存。

### 3. 值缓存和函数身份是不同问题

`useMemo` 缓存计算结果；它可以返回对象、数组或其他值。函数身份缓存属于另一个 Hook 的合同，不要把
“返回一个函数”当成值缓存的通用替代写法，也不要在本课用组件 render 跳过来证明缓存收益。当前课程只需要
判断计算值是否复用，以及依赖变化是否得到新结果。

## 八、缓存不是语义保证

### 1. React 可以丢弃缓存

官方把 `useMemo` 定义为性能优化，而不是语义保证。React 在开发编辑、组件初次挂起等特定情况下可能丢弃
缓存并重新计算；未来的渲染策略也可以改变缓存生命周期。代码必须在缓存被丢弃时仍然正确。

```tsx
// 错误：把 useMemo 当成永久注册表键。
const session = useMemo(() => createSession(), [])
registry.set(session, userId)
```

如果 `session` 必须跨某个生命周期保持身份，应使用有明确语义的 State、Ref 或资源所有者，而不是依赖
`useMemo` 的当前引用。

### 2. 缓存失效不是数据丢失

缓存被丢弃后，React 会重新运行计算函数并得到当前输入对应的结果。只要计算纯净、依赖完整，重新计算不会
破坏业务数据；它只可能增加一次 render 工作。把“重新计算”误认为“状态重置”会导致错误的持久化设计。

### 3. 缓存结果仍必须可替换

调试时可以临时删除 `useMemo`，或在计算变慢时完全改写实现。若删除后功能不正确，说明代码把性能优化
误当成了正确性依赖，需要先修复数据流和资源所有权。

## 九、用法示例或 Demo

下面的 Demo 用相同数据和确定性计算对照“直接计算”和“`useMemo` 缓存”两条路径：

- 点击“仅更新父组件”只改变无关 State；缓存结果保持同一引用，缓存生成次数不变。
- 修改关键词或计算规模会改变依赖；缓存计算得到新结果，生成次数增加。
- 面板显示最近一次结果的 `Object.is` 身份判断、依赖值和计算结果，避免只凭肉眼推断缓存是否命中。
- 计数统计的是已经提交到界面的缓存结果版本，不把 Strict Mode 的额外开发调用冒充业务次数。
- 直接计算分支始终重新执行，用来建立对照基线；它不承担任何业务副作用。

:::demo{id="react.core.learn.advanced.use-memo-value-caching.value-cache-demo"}
:::

## 十、易错使用提示

:::pitfalls
### 错误一：为所有派生值默认添加 useMemo

**触发条件：** 看到数组过滤、字符串拼接或几个数字相加，就先包一层 `useMemo`。

**原因：** 把性能优化语法误认为派生值的必需语法，没有先测量计算成本和更新频率。

**后果：** 代码增加依赖合同和缓存维护，却没有减少有意义的工作，读者还要额外核对缓存是否必要。

**错误示例：**

```tsx
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName])
```

**正确写法：**

```tsx
const fullName = `${firstName} ${lastName}`
```

**验证方式：** 删除缓存后按相同路径测量；若计算不可感知且没有稳定退化，保留直接计算。

### 错误二：遗漏计算函数读取的依赖

**触发条件：** 计算函数读取了 `query`，依赖数组却只写 `[products]`。

**原因：** 把依赖数组当成手动刷新开关，而不是闭包输入合同。

**后果：** `query` 变化后仍显示旧结果，缓存掩盖了真实的数据流错误。

**错误示例：**

```tsx
const visible = useMemo(() => filterProducts(products, query), [products])
```

**正确写法：**

```tsx
const visible = useMemo(() => filterProducts(products, query), [products, query])
```

**验证方式：** 只修改每一个依赖并检查结果；每个被计算读取的 reactive value 都必须能触发正确更新。

### 错误三：用每次新建的对象破坏缓存

**触发条件：** 把组件体内新建的 `options` 作为 `useMemo` 依赖。

**原因：** 对象引用每次 render 都不同，即使字段值没有变化，`Object.is` 也会返回 `false`。

**后果：** 缓存每次失效，代码看起来使用了 `useMemo`，实际没有跳过计算。

**错误示例：**

```tsx
const options = { query }
const result = useMemo(() => search(items, options), [items, options])
```

**正确写法：**

```tsx
const result = useMemo(() => search(items, { query }), [items, query])
```

**验证方式：** 在无关 State 更新时观察计算次数和结果引用；确认依赖引用没有无意中每次变化。

### 错误四：在计算中修改 Props 或 State

**触发条件：** 直接对 `items` 调用 `sort`、`push`，或修改输入对象字段。

**原因：** 把纯派生计算误写成原地修改，破坏 React 依赖不可变更新的前提。

**后果：** 后续 render 可能看到顺序或字段被偷偷改写，缓存命中时还可能继续返回已污染的对象。

**错误示例：**

```tsx
const sorted = useMemo(() => items.sort(compareItems), [items])
```

**正确写法：**

```tsx
const sorted = useMemo(() => [...items].sort(compareItems), [items])
```

**验证方式：** 在计算前后比较输入引用和内容；原始数组不应因为计算而改变。

### 错误五：在 useMemo 中执行副作用

**触发条件：** 在计算函数中请求网络、写 DOM、写存储或调用 State setter。

**原因：** 误把计算函数当成“只运行一次”的初始化回调，忽略 React 可以重新执行或丢弃缓存。

**后果：** 请求重复发送、State 更新循环、开发 Strict Mode 下副作用加倍，缓存失效时行为不可预测。

**错误示例：**

```tsx
const result = useMemo(() => {
  localStorage.setItem('last-query', query)
  return search(items, query)
}, [items, query])
```

**正确写法：**

```tsx
const result = useMemo(() => search(items, query), [items, query])

useEffect(() => {
  localStorage.setItem('last-query', query)
}, [query])
```

**验证方式：** 临时开启 Strict Mode 或让依赖变化两次；计算结果应相同，外部同步应由自己的生命周期负责。

### 错误六：把 useMemo 当成永久存储

**触发条件：** 用缓存对象作为业务 ID、只允许创建一次的资源句柄或跨生命周期的注册表键。

**原因：** 把“当前依赖下可能复用的值”误读成“永远存在的实例”。

**后果：** React 丢弃缓存后资源重复创建、旧注册关系悬空，功能依赖未承诺的引用稳定性。

**错误示例：**

```tsx
const connection = useMemo(() => createConnection(url), [url])
connectionRegistry.set(connection, url)
```

**正确写法：**

```tsx
useEffect(() => {
  const connection = createConnection(url)
  connectionRegistry.add(connection)
  return () => connectionRegistry.delete(connection)
}, [url])
```

**验证方式：** 删除 `useMemo` 并重复挂载、卸载和切换输入；资源创建与清理仍应成对完成。

### 错误七：期待 useMemo 加速首次 render

**触发条件：** 只因为首屏计算慢就添加 `useMemo`，并把首次显示变快当作验收目标。

**原因：** 首次 render 没有旧缓存，计算函数仍必须执行。

**后果：** 优化方向错误，真正的下载、数据规模或渲染边界问题没有被测量。

**错误示例：**

```tsx
// 这里的缓存不会跳过首次计算。
const firstView = useMemo(() => buildLargeReport(data), [data])
```

**正确写法：**

```tsx
// 先分别测量首次挂载和后续更新，再决定缓存是否解决了更新期问题。
const report = useMemo(() => buildLargeReport(data), [data])
```

**验证方式：** 单独记录首次 mount 与依赖未变的 update；不要用首次记录证明缓存收益。

### 错误八：把缓存结果引用当永久对象身份

**触发条件：** 使用 `Object.is(cachedValue, previousValue)` 的当前结果作为业务规则或权限判断。

**原因：** 引用稳定只是缓存命中时的当前观察结果，不是 React 对未来 render 的永久承诺。

**后果：** 缓存被丢弃、组件重新挂载或实现被简化后，业务状态错误地改变。

**错误示例：**

```tsx
const key = useMemo(() => ({ userId }), [userId])
if (key === requiredBusinessKey) allowAccess()
```

**正确写法：**

```tsx
const key = `user:${userId}`
if (key === requiredBusinessKey) allowAccess()
```

**验证方式：** 用显式字符串或稳定 ID 重写业务判断，再临时移除 `useMemo` 检查行为是否保持一致。
:::

## 十一、源码推导与适用场景

1. React 的公开 API 规定：首次 render 执行计算函数；后续 render 在依赖逐项相等时返回先前结果，否则重新计算。
2. 固定版本实现把计算结果和依赖存放在对应 Hook 的内部状态中，并通过 `Object.is` 语义判断依赖是否相等；
   Hook 内部槽位和 Fiber 结构不是应用层可以依赖的公共 API。
3. React 官方把 `useMemo` 定义为性能优化。缓存可能在特定开发或初次挂起场景被丢弃，因此不能承担 State、
   Ref、资源清理或永久对象身份的职责。
4. 计算函数必须纯净，因为 React 可以为了开发检查、重新渲染或恢复工作而再次调用它；同一输入应得到相同结果，
   不应产生外部可见副作用。
5. 对本科 React 应用，适用场景通常是已测量的昂贵同步派生计算：输入规模明确、无关更新频繁、依赖稳定，且
   缓存后的更新期收益能通过相同路径复现。小计算、首次 render、网络和浏览器绘制问题不属于它的主要职责。

## 十二、练习

:::exercise
### 练习一：为筛选结果建立完整依赖

**要求：** 从一个直接筛选列表开始，加入关键词、库存开关和排序方式三个输入。把计算函数读取的每个值写入
`useMemo` 依赖数组，分别只修改一个输入，确认结果只在对应值变化后更新。

**验收：** 没有遗漏依赖；删除 `useMemo` 后结果和交互仍一致；依赖数组长度不会随条件改变。
:::

:::exercise
### 练习二：定位无意义的对象依赖

**要求：** 故意在组件体内创建 `options` 并把它放入依赖数组，使用一个可观察的计算计数器确认无关 State
更新也会重新计算。再把临时对象移进计算函数，只保留原始字段依赖。

**验收：** 无关更新不再增加缓存结果生成次数；关键词或开关变化仍会生成新结果。
:::

:::exercise
### 练习三：比较缓存与直接计算

**要求：** 使用 Profiler 固定相同数据规模和操作顺序，先测量直接计算，再测量 `useMemo` 版本。分别记录首次
挂载、依赖变化更新和依赖不变更新，不用单条记录作结论。

**验收：** 能解释首次 render 为什么仍执行计算；能按同类 update 比较 `actualDuration`，并说明开发构建不等于
生产 profiling 证据。
:::

:::exercise
### 练习四：验证缓存不是正确性存储

**要求：** 临时删除 `useMemo`，重复切换输入、卸载和重新挂载。若代码使用了业务 ID、资源创建或清理，改用
明确的 State、Ref 或 Effect 所有者，再次验证功能。

**验收：** 删除缓存只改变可能的计算次数，不改变业务结果、资源清理和对象的显式身份规则。
:::

## 十三、本节小结

- `useMemo(calculateValue, dependencies)` 缓存的是纯计算结果，不是 State、资源或永久身份。
- 依赖数组应完整、固定长度，并按计算函数读取的 reactive values 建立；每项使用 `Object.is` 比较。
- 先直接计算并测量；只有昂贵、更新频繁且依赖稳定的计算才值得缓存。
- 对象、数组和函数的引用变化会使依赖变化；只为一次计算服务的临时对象可放入计算函数。
- `useMemo` 不会加速首次 render，缓存被丢弃时也必须能安全重新计算。
- 计算函数不能修改输入或执行副作用；缓存结果的引用不能替代显式业务身份。

## 十四、参考资料

- [`useMemo`](https://react.dev/reference/react/useMemo) - 签名、依赖、纯计算、Strict Mode、缓存丢弃和性能边界，适用于 React 19.2。
- [`You Might Not Need an Effect`](https://react.dev/learn/you-might-not-need-an-effect) - render 派生、昂贵计算测量和首次 render 边界。
- [`Components and Hooks must be pure`](https://react.dev/reference/rules/components-and-hooks-must-be-pure) - render 幂等性与副作用边界。
- [React 19.2.8 `ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js) - 固定版本的 Hook 计算和依赖判断实现佐证。
- [React 19.2.8 `objectIs.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/shared/objectIs.js) - `Object.is` 语义实现佐证。
