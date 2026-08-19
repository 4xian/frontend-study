# 派生值研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.derived-values`
- 标题：派生值
- 教学层级：零基础到进阶
- 核验日期：`2026-08-09`
- 研究状态：已完成，可进入单知识点课程编写
- 文档基线：React 官方文档 `19.2`

本课只回答一条主线：怎样从当前 Props 与 State 在 render 中得到同步结果，避免把同一个事实重复保存为
State；当纯计算经过测量确实昂贵时，再怎样使用 `useMemo` 跳过依赖未变化的更新期重复计算。

必须覆盖：

1. 区分源数据、必须记住的 State 与可重新计算的派生值。
2. 默认在 render 中直接计算派生值，并让它自然跟随 Props 和 State 的当前快照。
3. 解释为什么“冗余 State + Effect 同步”会制造陈旧值、额外 render 和同步错误。
4. 建立直接计算与昂贵计算的选择标准，先测量再决定是否缓存。
5. 讲清 `useMemo(calculateValue, dependencies)` 的返回值、依赖比较、纯函数和更新期缓存合同。
6. 讲清依赖完整性、引用身份、Strict Mode 双调用、缓存可丢弃和 React Compiler 边界。
7. 给出可观察的正确性验证与性能验证方法，不能用“用了 `useMemo`”代替证据。

明确排除：State 结构的完整设计，只把它作为前置；提升 State；受控与非受控组件；Reducer；Context；
请求与异步派生；外部系统同步；外部 store；Zustand；表单所有权；组件 `memo`；`useCallback`；Effect
依赖专题；React Compiler 的安装与配置。上述内容有独立课程或技术模块，不能借派生值提前展开。

## 调研问题与边界

本课研究必须回答以下问题：

1. 什么是派生值，它与 Props、State 和普通局部变量分别是什么关系？
2. 为什么源输入变化后，render 中的表达式会自然得到新结果，不需要 setter 或 Effect 同步？
3. 哪些计算应每次 render 直接执行，怎样判断一个计算是否真的昂贵？
4. `useMemo` 在首次 render 和后续 render 分别做什么，依赖如何比较？
5. 计算函数为什么必须纯，Strict Mode 的开发期双调用能暴露什么问题？
6. 漏依赖、对象依赖和原地修改如何造成陈旧缓存或每次重算？
7. 为什么 `useMemo` 只能是性能优化，不能成为正确性或持久存储合同？
8. 怎样用功能观察、计时和相同交互对照验证直接计算与缓存计算？

研究边界是“同一次 render 内，由当前 Props 和 State 纯同步计算出的值”。本课可以解释 Effect 同步
派生值为什么多余，但不讲 Effect 的创建、清理或依赖设计；可以说明 React Compiler 会减少部分手写
memoization，但不讲 Compiler 配置；可以提到语义持久化不能依赖 `useMemo`，但不展开 Ref 或外部存储。

## 研究方法与证据边界

1. 按仓库外部搜索顺位先使用 Tavily。2026-08-09 共完成 6 组 `tavily_search`，6/6 返回可靠结果；
   Tavily 可用，因此没有切换 Exa、Parallel、Perplexity 或原生 Web 搜索。
2. 共完成 6 批 `tavily_extract`，涉及 9 次官方 URL 抽取，9/9 成功；去重后为 5 个 `react.dev`
   页面。重复抽取用于锁定长页面中的依赖、纯度、缓存失效和性能测量段落。
3. 搜索结果只用于发现候选 URL；所有采用结论均回到 `react.dev` 的 `Raw Content` 核验。社区文章、
   搜索摘要和 AI 总结不支撑课程事实。
4. `extract` 响应的 `Content` 字段显示为 `undefined`，但每个结果都返回了可核验的完整或目标相关
   `Raw Content`，因此按官方原文抽取成功记录。
5. `React Versions` 当前标记 latest version 为 `19.2`，并说明 `react.dev` 提供最新 React 文档、同一
   major 内不为每个 minor 或 patch 发布独立文档快照。本记录采用“React 官方文档 19.2，核验于
   2026-08-09”的口径。
6. 本记录只冻结课程正文与 Demo 的事实合同，不创建或修改课程、Demo、manifest、track、计划、测试、
   构建产物或其他研究文件。

## Tavily 查询日志

### Search

| ID | Tavily query | 主要官方候选 | 采用结论 |
| --- | --- | --- | --- |
| Q1 | `React official derive values from props state during render avoid redundant state fullName` | `Choosing the State Structure`、`You Might Not Need an Effect`、`useState` | 采用 render 直接计算、避免冗余 State 和 `fullName` 示例。 |
| Q2 | `React official You Might Not Need an Effect transform data rendering filtered list extra render stale value` | `You Might Not Need an Effect`、`set-state-in-effect`、`Synchronizing with Effects` | 采用数据转换不需要 Effect，以及 Effect 同步造成额外 render 的原因。 |
| Q3 | `React official useMemo cache expensive calculation dependencies Object.is performance optimization` | `useMemo`、`You Might Not Need an Effect` | 采用 `useMemo` 的缓存、依赖比较和性能优化边界。 |
| Q4 | `React official useMemo Strict Mode calculation twice pure function object dependencies cache discarded` | `useMemo`、`StrictMode` | 采用纯函数、开发期双调用、引用依赖和缓存可丢弃边界。 |
| Q5 | `React official measure expensive calculation console time production performance useMemo profiler` | `useMemo`、`Profiler` | 采用先测量、相同交互对照、CPU 降速和更新期收益判断。 |
| Q6 | `React official versions latest stable version react.dev 19.2` | `React Versions`、React 19.2 发布说明 | 采用当前官方文档版本口径 `19.2`。 |

6 组 search 均成功。搜索结果中的不同语言镜像、社区文章、`cache`、`memo`、`useCallback`、
`useDeferredValue` 和服务端缓存内容不支撑本课主线，全部排除或只用于划清边界。

### Extract

| 批次 | URL | 结果 | 本课提取重点 |
| --- | --- | --- | --- |
| E1 | `https://react.dev/versions`<br>`https://react.dev/learn/choosing-the-state-structure`<br>`https://react.dev/learn/you-might-not-need-an-effect`<br>`https://react.dev/reference/react/useMemo` | 4/4 成功，`Raw Content` 返回 | 19.2 版本口径、render 直接派生、避免 Effect 同步和 `useMemo` 基础合同。 |
| E2 | `https://react.dev/learn/you-might-not-need-an-effect` | 成功，`Raw Content` 返回 | 冗余 State、陈旧值、额外 cascading update、过滤列表和昂贵计算入口。 |
| E3 | `https://react.dev/reference/react/useMemo` | 成功，`Raw Content` 返回 | 首次与后续 render、`Object.is` 依赖比较、纯计算和 Strict Mode 双调用。 |
| E4 | `https://react.dev/reference/rules/components-and-hooks-must-be-pure` | 成功，`Raw Content` 返回 | render 幂等、无副作用、不修改非局部值和可安全本地计算。 |
| E5 | `https://react.dev/reference/react/useMemo` | 成功，`Raw Content` 返回 | 性能优化而非语义保证、缓存丢弃、引用依赖和 React Compiler 说明。 |
| E6 | `https://react.dev/reference/react/useMemo` | 成功，`Raw Content` 返回 | `console.time`、约 1 ms 的实验参考、CPU Throttling、首次 render 不会变快。 |

## 官方来源卡

| ID | React 官方一手来源 | 本课采用的 claim |
| --- | --- | --- |
| `react-versions` | [React Versions](https://react.dev/versions) | `react.dev` 提供最新 React 文档；当前 latest version 为 `19.2`；同一 major 内持续更新而不为每个 minor/patch 发布独立文档版本。 |
| `react-state-structure` | [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) | 能从 Props 或现有 State 在 render 中计算的信息不应成为冗余 State；源值更新后的下一次 render 会重新得到派生值。 |
| `react-no-effect` | [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) | 数据转换应在 render 中完成；用 Effect 同步派生 State 会先得到陈旧值再触发额外 render；昂贵纯计算可在测量后用 `useMemo` 缓存。 |
| `react-use-memo` | [useMemo](https://react.dev/reference/react/useMemo) | `useMemo` 的签名、纯计算函数、完整依赖、`Object.is` 比较、首次与后续 render、Strict Mode、缓存失效、性能测量和 React Compiler 边界。 |
| `react-purity-rule` | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | render 计算必须幂等、无副作用且不得修改非局部数据；局部创建并只在本次计算中使用的数据可以安全转换。 |

## 一、派生值不是第二份 State

### 1. 源事实、State 与派生值

本课先建立三个角色：

| 角色 | 含义 | 示例 |
| --- | --- | --- |
| Props | 当前 render 由父组件提供的输入 | `products`、`currency` |
| State | 组件必须跨 render 记住、且不能从其他当前输入恢复的事实 | `query`、`sortOrder` |
| 派生值 | 用当前 Props 和 State 可以重新计算的同步结果 | `visibleProducts`、`matchCount`、`totalPrice` |

“结果会变化”不等于“结果必须存进 State”。筛选结果会随查询词变化，但只要当前 render 已经拥有原始
列表和查询词，就能得到唯一结果。额外保存筛选结果会把一个事实变成两个需要手动保持一致的副本。

### 2. render 会使用当前输入重新计算

组件因 Props 或 State 更新而再次 render 时，组件函数顶层的表达式会用本次 render 的输入重新执行：

```tsx
interface NamePreviewProps {
  firstName: string
  lastName: string
}

/** 根据当前姓名输入渲染完整姓名。 */
function NamePreview({ firstName, lastName }: NamePreviewProps) {
  const fullName = `${firstName} ${lastName}`.trim()
  return <p>{fullName}</p>
}
```

`fullName` 不需要 initializer、setter 或同步入口。只要任一 Prop 改变，下一次 render 就会从新输入得到
新值。这个普通局部常量同样参与响应式 render，但它不是 React 需要跨 render 保存的 State。

### 3. 直接计算是默认方案

字符串拼接、布尔判断、数量统计、小列表过滤和格式化通常直接写在组件顶层。代码应表达“输出是当前
输入的函数”，而不是“先保存输出，再想办法追踪所有输入变化”。为可读性提取纯函数也不会改变合同：

```tsx
interface Product {
  id: string
  name: string
  available: boolean
}

/** 根据查询词返回名称匹配的商品。 */
function filterProducts(products: readonly Product[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  return products.filter((product) =>
    product.name.toLocaleLowerCase().includes(normalizedQuery),
  )
}

/** 渲染当前查询条件对应的商品数量。 */
function ProductResults({ products, query }: { products: readonly Product[]; query: string }) {
  const visibleProducts = filterProducts(products, query)
  const matchCount = visibleProducts.length
  return <p>匹配 {matchCount} 项</p>
}
```

## 二、为什么不要用 State 和 Effect 同步派生值

下面的写法把 `fullName` 保存成 State，再等待 Effect 同步：

```tsx
const [firstName, setFirstName] = useState('Taylor')
const [lastName, setLastName] = useState('Swift')
const [fullName, setFullName] = useState('')

useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])
```

官方指出，这会先完成一轮带旧 `fullName` 的 render，再在 Effect 中设置 State 并开始下一轮 render。
问题不只是多几行代码：

1. 初始值或更新后的某一轮结果是陈旧的。
2. 每次源输入变化都会多一次 State 更新和 render。
3. 新增源输入时容易漏改 Effect 依赖或同步逻辑。
4. 同一个业务事实存在源字段和结果 State 两份表示，增加不变量数量。

正确写法是删除 `fullName` State 和 Effect，在 render 中计算。Effect 仍用于同步 React 外部系统，但
那是后续独立课程；本课不能把“无需 Effect”误讲成“React 不需要 Effect”。

## 三、render 中的派生计算必须纯

React 要求组件和 Hook 的 render 逻辑保持幂等：给定相同 Props、State 和 Context，应得到相同结果；
render 中不能执行副作用，也不能修改在 render 之前已经存在的 Props、State 或其他非局部值。

错误示例会直接修改 Props 数组：

```tsx
/** 演示直接修改 Props 数组导致的错误排序方式。 */
function RankedProducts({ products }: { products: Product[] }) {
  const rankedProducts = products.sort((left, right) => left.name.localeCompare(right.name))
  return <p>{rankedProducts[0]?.name}</p>
}
```

排序前先复制，或使用返回新数组的转换：

```tsx
const rankedProducts = [...products].sort((left, right) => left.name.localeCompare(right.name))
```

计算内部可以创建、填充并返回只属于本次调用的新数组或对象，因为它没有修改调用前已存在的数据。
“纯”不等于只能写一个表达式，而是相同输入得到相同输出，且计算过程不改变外部世界。

## 四、什么时候直接计算，什么时候使用 useMemo

### 1. 默认直接计算

大多数计算足够快。`useMemo` 会增加回调、依赖列表和缓存语义，不能因为“这是派生值”就默认添加。
课程必须先展示不带缓存的正确写法，再讨论是否存在可观察的更新性能问题。

### 2. 先测量真实交互

官方建议用 `console.time`/`console.timeEnd` 测量实际交互中的计算时间。累计约 `1ms` 或更多只是值得
尝试 memoization 的参考，不是跨设备的固定阈值。应在相同输入、相同交互和接近用户设备的条件下比较
添加 `useMemo` 前后结果，并可使用 CPU Throttling 模拟较慢设备。

开发环境 Strict Mode 可能额外调用纯计算，因此不能只数开发期函数调用次数就宣布生产性能结论。
`useMemo` 也不会让首次 render 变快；它只能在后续 render 的依赖未变化时跳过工作。

### 3. 适合缓存的最小条件

本课采用以下判断顺序：

1. 结果能否由当前 Props/State 同步得到？若不能，不属于本课派生值。
2. 计算是否纯？若不纯，先修复设计，不能用缓存隐藏副作用。
3. 实际交互是否显示该计算成本有意义？若没有，直接计算。
4. 后续 render 中是否经常出现依赖不变、但组件因其他原因更新？若没有，可复用缓存的机会很少。
5. 加入 `useMemo` 后，同一交互的总耗时是否实际下降？若没有，删除无效优化。

## 五、useMemo 的准确合同

### 1. 签名与返回值

```tsx
const visibleProducts = useMemo(
  () => filterProducts(products, query),
  [products, query],
)
```

`useMemo` 接收一个无参数、纯的计算函数和一个依赖列表，并返回计算结果。首次 render 会执行计算函数；
后续 render 中，React 使用 `Object.is` 逐项比较本次与上次依赖。全部相同时返回已缓存结果，任一依赖
变化时重新执行并保存新结果。

`useMemo` 是 Hook，只能在组件或自定义 Hook 顶层调用，不能放在条件、循环或 `map` 回调中。它计算并
返回值，不是“依赖变化时执行动作”的接口。

### 2. 依赖必须完整且内联

依赖数组必须写在调用处、项目数量固定，并包含计算函数中读取的全部响应式值，包括 Props、State 和
组件体内声明的变量。漏掉 `query` 会让缓存继续返回旧查询结果；多写一个每次 render 都变化的对象，
则会让缓存每次失效。

下面的 `options` 每次 render 都是新对象：

```tsx
const options = { query, onlyAvailable }
const visibleProducts = useMemo(
  () => searchProducts(products, options),
  [products, options],
)
```

更直接的写法是在计算函数内创建对象，并依赖真正的原始输入：

```tsx
const visibleProducts = useMemo(() => {
  const options = { query, onlyAvailable }
  return searchProducts(products, options)
}, [products, query, onlyAvailable])
```

原地修改对象并保持同一引用同样危险。React 用 `Object.is` 比较依赖，不会深度扫描对象内容；Props 和
State 本来也不应被原地修改。

### 3. Strict Mode 是纯度探针

在 Strict Mode 开发环境中，React 会调用 `useMemo` 计算函数两次并忽略其中一次结果。这不是生产环境
的重复执行合同。纯计算运行两次不会改变行为；若回调修改 Props 数组，重复项或顺序异常会暴露不纯。

验证时应检查“相同输入是否得到相同结果、旧输入是否未被修改”，不能为了让开发期只调用一次而加入
模块级开关、Ref 标记或副作用保护逻辑。

### 4. 缓存不是语义保证

`useMemo` 只是一项性能优化。React 在特定情况下可以丢弃缓存，例如开发时编辑组件文件，或组件首次
挂载期间发生 Suspense。程序即使删除 `useMemo` 也必须保持结果正确，只是可能重新计算得更多。

若功能正确性依赖某个值必须跨 render 永久保留，就需要重新确认 State 或其他语义所有者，而不是把
`useMemo` 当存储。本课只建立这条边界，不展开 Ref、外部 store 或服务端缓存。

### 5. React Compiler 的当前说明

React 19.2 的 `useMemo` Reference 说明 React Compiler 可以自动 memoize 值和函数，从而减少手写
`useMemo` 的需要。这不表示未启用 Compiler 的项目会自动获得相同行为，也不表示手写 `useMemo` 已被
废弃。本课只把它作为最新官方边界说明，不进入 Compiler 安装、配置或迁移。

## 六、可观察验证合同

派生值课程的验证分为正确性和性能两层，二者不能混用：

| 验证目标 | 操作 | 必须观察到的结果 |
| --- | --- | --- |
| 直接派生正确 | 改变任一源 Props 或 State | 同一轮后续 UI 使用最新输入得到新结果，不存在结果 setter。 |
| 无冗余同步 | 检查组件源码并操作全部输入路径 | 派生结果没有对应 State，也没有只为同步它存在的 Effect。 |
| 依赖完整 | 分别只改变每个依赖 | 每个输入都能触发正确重算，不返回旧结果。 |
| 无关更新可复用 | 只改变未被计算读取的局部 UI State | 派生结果保持正确；昂贵计算可在测量中显示被跳过。 |
| 纯度 | 冻结或保留输入引用后重复计算 | 输入内容未改变，相同输入得到相同输出。 |
| 性能收益 | 对同一设备、输入和交互比较缓存前后 | 只在总耗时有稳定下降时保留 `useMemo`。 |
| 首次 render | 分别测量首次显示和后续更新 | 不声称 `useMemo` 优化首次计算，只记录更新期收益。 |
| Strict Mode | 在开发环境重复观察 | 双调用不改变结果；性能结论不以开发期调用次数单独成立。 |

## 七、教学顺序与正文合同

正文按以下顺序从零基础展开：

1. 用姓名、商品筛选和匹配数量区分源事实、State 与派生值。
2. 展示 render 中直接计算，并解释源输入变化为何自然得到新结果。
3. 对比冗余 State 与 Effect 同步，画清“陈旧 render -> Effect setter -> 额外 render”的因果链。
4. 建立 render 纯度：相同输入、无副作用、不修改 Props/State，允许操作本次新建的局部数据。
5. 先测量普通计算，再给出直接计算与昂贵计算的判断清单。
6. 讲 `useMemo` 的首次执行、依赖 `Object.is` 比较、缓存命中和重新计算。
7. 讲完整依赖、对象引用、Strict Mode、缓存可丢弃和 React Compiler 边界。
8. 用功能观察与性能对照收尾，强调删除 `useMemo` 后功能仍必须正确。

每个主段必须包含意义、最小 TSX 示例、使用条件、易错原因和验证方式。展示代码统一使用 `.tsx` 与
`tsx` 代码块；不为非 JSX 知识点改用 `.jsx`。未来正文不得出现调研工具、临时 fixture、本地项目
环境、Gate、signoff、搜索过程或复审术语。

## 八、易错点完整合同

未来正文中的每个易错点必须使用 `:::pitfalls`，并包含触发条件、原因、后果、错误示例、正确写法和
验证方式。本课保留以下 10 个高价值问题，不继续增加低价值数量。

### 1. 把可计算结果保存为 State

- **触发条件：** 同时保存 `firstName`、`lastName` 和 `fullName`。
- **原因：** 把会变化的显示结果误认为必须由 React 记住的事实。
- **后果：** 同一姓名出现多个表示，任一更新路径漏掉 setter 就显示旧结果。
- **错误示例：** `const [fullName, setFullName] = useState('')`。
- **正确示例：** `const fullName = (firstName + ' ' + lastName).trim()`。
- **验证方式：** 分别修改名字两部分；源码中应没有 `fullName` setter，UI 每次都使用当前输入。
- **来源：** `react-state-structure`、`react-no-effect`。

### 2. 用 Effect 同步本可直接计算的值

- **触发条件：** `useEffect(() => setVisibleItems(filterItems(items, query)), [items, query])`。
- **原因：** 把 render 数据转换误当成与外部系统同步。
- **后果：** 先产生一轮陈旧结果，再由 Effect setter 触发额外 render；依赖与 setter 还会增加维护点。
- **错误示例：** 为 `visibleItems` 同时声明 State 和同步 Effect。
- **正确示例：** 在组件顶层写 `const visibleItems = filterItems(items, query)`。
- **验证方式：** 改变 `query` 后结果直接来自当前 render；源码不存在只为派生结果服务的 Effect。
- **来源：** `react-no-effect`。

### 3. 对轻量计算无条件使用 useMemo

- **触发条件：** 字符串拼接、简单布尔值或几个元素的过滤一律包进 `useMemo`。
- **原因：** 把 memoization 当成派生值的必需语法，没有先测量。
- **后果：** 依赖与回调增加认知成本，却没有可观察性能收益。
- **错误示例：** `const fullName = useMemo(() => firstName + lastName, [firstName, lastName])`。
- **正确示例：** 直接计算；只有相同交互测得显著更新成本后才实验 `useMemo`。
- **验证方式：** 去掉 `useMemo` 比较相同交互；无稳定退化时保持直接写法。
- **来源：** `react-use-memo`。

### 4. 漏写计算读取的依赖

- **触发条件：** 回调读取 `products`、`query`，依赖数组却只有 `[products]`。
- **原因：** 误以为依赖是手工选择的“触发器”，而不是计算读取的完整响应式输入。
- **后果：** `query` 改变后仍返回旧缓存，结果与当前界面输入不一致。
- **错误示例：** `useMemo(() => filterProducts(products, query), [products])`。
- **正确示例：** `useMemo(() => filterProducts(products, query), [products, query])`。
- **验证方式：** 单独改变每个输入并检查结果；静态检查不应报告缺失依赖。
- **来源：** `react-use-memo`。

### 5. 依赖每次 render 新建的对象

- **触发条件：** 组件体先创建 `options = { query }`，再把 `options` 放入依赖数组。
- **原因：** 每次 render 都产生新引用，`Object.is(previousOptions, nextOptions)` 为 `false`。
- **后果：** `useMemo` 每次都重新计算，缓存没有跳过任何工作。
- **错误示例：** `useMemo(() => search(items, options), [items, options])`。
- **正确示例：** 在计算回调内创建 `options`，依赖 `[items, query]`。
- **验证方式：** 只改变无关 State；修正前计算每次执行，修正后依赖不变时可复用结果。
- **来源：** `react-use-memo`。

### 6. 在计算函数中修改 Props 或 State

- **触发条件：** 在 render 或 `useMemo` 回调中执行 `products.sort(...)`、`products.push(...)`。
- **原因：** `sort`、`push` 修改了 render 前已存在的输入，计算不再纯。
- **后果：** 父子组件共享数据被污染；Strict Mode 双调用可能暴露重复项或顺序异常。
- **错误示例：** `useMemo(() => products.sort(compare), [products])`。
- **正确示例：** `useMemo(() => [...products].sort(compare), [products])`。
- **验证方式：** 计算前后比较原数组内容与引用；原输入不得被写入，相同输入应得到相同输出。
- **来源：** `react-use-memo`、`react-purity-rule`。

### 7. 把 Strict Mode 双调用当成生产重复执行

- **触发条件：** 开发环境看到计算函数执行两次，就加入全局布尔值阻止第二次调用。
- **原因：** 没有区分开发期纯度检查与生产行为。
- **后果：** 引入非局部可变状态和副作用，掩盖真正的不纯计算，还可能让多个组件实例互相干扰。
- **错误示例：** 用模块级 `hasCalculated` 跳过第二次计算。
- **正确示例：** 保持计算纯；把开发期双调用视为发现输入变异的信号。
- **验证方式：** 在 Strict Mode 下重复调用不改变输入或结果；生产性能结论另用可比条件测量。
- **来源：** `react-use-memo`。

### 8. 把 useMemo 当成可靠存储

- **触发条件：** 业务正确性依赖某个 memoized 对象身份永远不变，或依赖缓存永不丢失。
- **原因：** 把性能缓存误认为语义保证。
- **后果：** React 因开发编辑、初始挂载 Suspense 或未来策略丢弃缓存时，功能行为改变。
- **错误示例：** 用 `useMemo(() => createSession(), [])` 表示必须永久保存的会话身份。
- **正确示例：** 删除 `useMemo` 后功能仍正确；必须记住的事实交给有明确语义的 State 所有者。
- **验证方式：** 强制重新 render 或重新挂载并假设缓存可被丢弃；结果只能重新计算，不能破坏功能。
- **来源：** `react-use-memo`。

### 9. 期待 useMemo 加快首次 render

- **触发条件：** 首屏计算很慢，仅包一层 `useMemo` 就宣称首屏已优化。
- **原因：** 忽略首次 render 必须调用计算函数才能获得缓存结果。
- **后果：** 首次显示耗时不变，真正的计算规模或算法问题没有解决。
- **错误示例：** 只比较“是否写了 `useMemo`”，不分首次 render 与后续更新。
- **正确示例：** 分开测量首次 render 和依赖未变化的更新；只把后者的跳过工作记为收益。
- **验证方式：** 清空当前组件实例后重新测量首次显示，再对同一实例触发无关更新。
- **来源：** `react-use-memo`。

### 10. 在条件或列表循环中调用 useMemo

- **触发条件：** 根据 `enabled` 条件调用 Hook，或在 `items.map` 回调里为每项调用 `useMemo`。
- **原因：** 忽略 Hook 必须在组件或自定义 Hook 顶层调用，且调用顺序必须稳定。
- **后果：** 违反 Hooks 规则，条件变化或列表长度变化时调用顺序不可靠。
- **错误示例：** `if (enabled) return useMemo(() => calculate(data), [data])`。
- **正确示例：** 顶层始终调用一次；列表项确需独立 Hook 状态时提取组件，而不是在循环中调用。
- **验证方式：** 静态检查无 Hooks 规则错误；切换条件和列表长度时调用结构保持稳定。
- **来源：** `react-use-memo`。

## 九、Demo 合同

建议新增同源 Demo：`react.core.learn.intermediate.derived-values.product-analysis-demo`，使用本地固定的
“商品分析”场景闭合整条主线：

- `products` 作为只读输入传给结果组件；`query`、`onlyAvailable` 和 `sortOrder` 是必须记住的 State。
- `normalizedQuery`、`visibleProducts`、`matchCount` 和总金额都从当前输入派生，不保存为 State。
- 默认展示直接计算；只有经过实现阶段同条件测量确认昂贵的排名计算才使用 `useMemo`，依赖只包含
  `products`、`query`、`onlyAvailable`、`sortOrder` 等真实输入。
- 增加一个与结果无关的“紧凑显示”本地 State，用于观察无关更新时功能结果保持不变，并为更新期
  性能对照提供触发入口；不把计算次数写入 State，也不在计算函数中累加计数。
- 使用确定性的本地数据，不引入请求、随机数、计时器、Effect、Reducer、Context、Ref、外部 store、
  Suspense 或组件 `memo`。

可观察行为：输入查询词、切换有货条件或排序后，列表、匹配数量和金额立即一致更新；切换紧凑显示不
改变任何派生结果；清空条件恢复完整结果；源码没有派生结果 State 或同步 Effect。性能验证使用相同
数据、相同交互和相同设备条件比较直接计算与 `useMemo`，只在更新耗时稳定下降时保留缓存。

展示源码与运行组件来自同一 `.tsx` 文件；新增函数上方写职责明确的简体中文注释。样式只使用 Flexbox、
margin 和正常文档流，不使用 CSS Grid 或 `gap`；桌面、390px 与 200% 文本不能出现横向溢出或裁切。

## 十、适用边界与拆课判断

- 本课完整讲“当前 Props/State -> render 纯计算 -> 必要时缓存结果”，State 结构只作为已学前置。
- 可以解释派生 State Effect 为什么多余，但不教授 Effect 的创建、清理、依赖移除或外部同步。
- 可以教授 `useMemo`，因为它直接解决同一派生计算的更新期性能边界；不得扩展组件 `memo`、
  `useCallback`、服务端 `cache` 或 Compiler 配置。
- 可以提到缓存不能承载语义，但不展开 Ref、外部 store、请求缓存或服务端状态。
- `useMemo` 的依赖完整性只服务于本课计算结果；Effect 依赖会在后续独立课程中系统讲解。
- 当前范围只有一条依赖递进的主线，未发现第二个无依赖心智模型或必须独立练习的公开 API，**无需
  拆课**。

## 十一、官方来源

1. [React Versions](https://react.dev/versions)：最新官方文档版本与版本维护策略。
2. [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)：避免冗余 State，
   在 render 中从当前输入计算结果。
3. [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)：删除同步派生 State
   的 Effect、避免额外 render，以及昂贵计算的 memoization 边界。
4. [useMemo](https://react.dev/reference/react/useMemo)：API 合同、依赖、纯度、Strict Mode、缓存失效、
   性能测量和 React Compiler 说明。
5. [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)：
   render 幂等、无副作用和不修改非局部输入的规则。
