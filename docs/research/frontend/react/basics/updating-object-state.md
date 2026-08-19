# 对象 State 更新研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.updating-object-state`
- 标题：对象 State 更新
- 教学层级：零基础到进阶
- 核验日期：`2026-08-09`
- 研究状态：已完成，可进入单知识点课程编写

本课只回答一个主线：React State 保存对象时，为什么不能直接修改既有对象，以及如何用不可变复制、展开
语法和逐层更新得到新的对象。动态属性名、对象共享引用与数组中对象的浅复制边界属于本课的必要进阶。
Immer 只作为深层更新的可选工具边界出现，不替代理解原生复制语义。

前置知识是 State snapshot 与 State 更新队列：事件处理器拿到当前 render 的 State 快照，setter 请求下一次
render，直接值更新表达替换值，updater function 才表达基于 pending State 的计算。本稿不重讲队列推导。

明确排除：服务端 State、Reducer、Context、Effect、Ref、表单校验、性能基准、React 内部 Fiber/lane，
以及把 Immer API 扩展成独立课程。

## 研究方法与证据边界

1. 首次调用 Tavily 搜索和研究接口时，四次请求因套餐用量超限失败。2026-08-09 重新调用
   `tavily_search` 与 `tavily_research` 均成功，候选来源覆盖 React 官方、MDN 与 TC39。
2. 搜索与研究结果只用于发现入口和交叉检查；最终结论回到 React 官方固定 URL、React 官方版本页、MDN
   参考页和 ECMAScript 规范逐条核对。React 版本页当前显示 Latest 文档为 `19.2`：
   [React Versions](https://react.dev/versions)。
3. React 官方“Updating Objects in State”页面提供本课主线和示例；`useState`、State snapshot、State 更新队列
   页面只用于补充公共 API 和前置语义；数组页面只用于对象共享引用边界。
4. MDN/ECMAScript 只用来说明 JavaScript 展开、动态属性名和对象字面量求值顺序，不把 JavaScript 的浅复制
   语义误写成 React 专有行为。

## 官方来源卡：URL 与支持的 claim

| ID | 一手来源 URL | 本稿采用的 claim |
| --- | --- | --- |
| `react-object` | [Updating Objects in State](https://react.dev/learn/updating-objects-in-state) | State 可以保存对象；应把对象当作只读值；修改时创建新对象并传给 setter；对象展开是浅复制；嵌套对象要从修改点逐层复制；对象共享引用会让一次 mutation 影响多个路径；Immer 可生成新 State。 |
| `react-snapshot` | [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) | 每次 render 得到固定 State snapshot；调用 setter 不会改变当前 handler 已经捕获的变量，只请求下一次 render。 |
| `react-queue` | [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) | 同一事件中的更新在 handler 完成后处理；直接值按“replace with value”理解；updater 按加入顺序求值；后面的直接值可以覆盖前面结果。 |
| `react-use-state` | [`useState`](https://react.dev/reference/react/useState) | setter 接收值或纯 updater；新值与旧值经 `Object.is` 相同可能跳过重渲染；updater 只接收 pending State 并返回 next State；StrictMode 开发期可能调用 updater 两次。 |
| `react-arrays` | [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state) | 数组展开只复制数组容器；数组元素对象仍是同一引用；更新数组中的对象时要复制被改对象；共享初始对象会导致两个列表互相影响。 |
| `react-pure` | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | Props 和 State 是不可变快照；不要修改 State 或 State 中对象的既有引用。 |
| `mdn-spread` | [Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) | 对象字面量中的 `...source` 枚举 source 的自有可枚举属性；数组/对象展开语义不同；数组展开是浅复制，元素身份保留。 |
| `mdn-object` | [Object initializer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer) | `[...]` 是 computed property name；对象展开是浅克隆；对象字面量中后写的同名属性覆盖先写值。 |
| `ecma-object` | [ECMAScript Object Initializer](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-object-initializer) | `PropertyDefinitionList` 按列表顺序执行；对象展开调用 `CopyDataProperties`；普通/计算属性按求值结果写入新对象。 |
| `mdn-object-is` | [Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) | `Object.is` 判断 SameValue；React `useState` 文档引用它作为跳过相同 State 重渲染的比较。 |

## 一、对象 State 的心智模型

### 1.1 State 是快照，不是可随意写入的变量

React 官方把 render 返回的 JSX、事件处理器和局部变量描述成使用当次 State 的 UI snapshot。setter 只影响
下一次 render；当前事件处理器继续看到旧快照。因此下面的写法同时有两个问题：它修改了旧对象，又没有通过
setter 请求更新。

```tsx
// 错误：修改当前 render 的既有对象，且没有提交新的 State。
position.x = nextX
position.y = nextY
```

正确模型是创建一个新对象并提交：

```tsx
// 正确：创建新对象；setter 请求下一次 render 使用它。
setPosition({ x: nextX, y: nextY })
```

来源：[State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)、[Updating Objects in State](https://react.dev/learn/updating-objects-in-state)。

### 1.2 setter 替换整个 State 值，不做类组件式深合并

`useState` setter 接收的是下一个 State 值。对象 State 更新时，React 官方示例总是先复制旧字段，再传入新
对象；省略字段就是把字段从新对象中移除，而不是自动保留：

```tsx
type Player = {
  firstName: string
  lastName: string
  score: number
}

const [player, setPlayer] = useState<Player>({
  firstName: 'Ranjani',
  lastName: 'Shettar',
  score: 10,
})

// 正确：保留未修改字段，并替换 score。
setPlayer({ ...player, score: player.score + 1 })

// 错误：新对象只有 lastName，firstName 与 score 会消失。
setPlayer({ lastName: 'New name' } as Player)
```

这是 `useState` 的替换语义，不是 `setState` 的旧式对象合并语义。React 官方队列页还说明：把直接值放入
队列等价于“replace with value”，后面的直接值可以覆盖前面计算出的结果。来源：[useState](https://react.dev/reference/react/useState)、[Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)。

### 1.3 相同对象引用可能跳过重渲染

如果直接修改 State 对象后再次把同一个引用传给 setter，`Object.is(previous, next)` 为真，React 可能跳过
组件及子树的重渲染；即使发生了其他 render，旧 snapshot 也已经被篡改。不要用“屏幕偶尔更新”证明 mutation
是正确的。

```tsx
// 错误：next 与 player 是同一引用。
player.score += 1
setPlayer(player)

// 正确：外层引用改变，且旧对象没有被写入。
setPlayer(previous => ({
  ...previous,
  score: previous.score + 1,
}))
```

来源：[useState](https://react.dev/reference/react/useState)、[Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)、[Updating Objects in State](https://react.dev/learn/updating-objects-in-state)。

## 二、不可变复制与展开顺序

### 2.1 对象展开创建新容器

`{ ...person }` 会把 source 的自有可枚举属性复制到新对象。它不是把 source 变成不可变对象，也不是递归
深克隆；它只改变最外层容器的引用。

```tsx
const previous = {
  name: 'Ada',
  preferences: { theme: 'dark' },
}

const next = { ...previous }

next !== previous // true
next.preferences === previous.preferences // true：嵌套引用仍共享
```

来源：[MDN Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)、[MDN Object initializer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer)、[Updating Objects in State](https://react.dev/learn/updating-objects-in-state)。

### 2.2 先展开、后覆盖：更新字段的关键顺序

对象字面量属性按书写顺序处理，同名属性后写者覆盖先写者。因此 React 推荐：

```tsx
setPerson({
  ...person,
  firstName: nextFirstName,
})
```

如果把覆盖字段放在展开前，旧对象的值会把新值覆盖回去：

```tsx
// 易错：最后展开 person，firstName 又变回旧值。
setPerson({
  firstName: nextFirstName,
  ...person,
})
```

TC39 规范中 `PropertyDefinitionList` 递归按列表顺序执行，MDN 也明确说明同名属性的后者覆盖前者。来源：[ECMAScript Object Initializer](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-runtime-semantics-propertydefinitionevaluation)、[MDN Object initializer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#spread_properties)、[Updating Objects in State](https://react.dev/learn/updating-objects-in-state#copying-objects-with-the-spread-syntax)。

### 2.3 展开复制不会深合并

对象展开只复制一层。下面的写法会把整个 `preferences` 替换掉，导致其中未提及的字段丢失：

```tsx
// 错误：preferences 的 language 等字段会被丢弃。
setSettings({
  ...settings,
  preferences: { theme: 'light' },
})
```

若只改嵌套字段，必须同时复制嵌套对象：

```tsx
setSettings({
  ...settings,
  preferences: {
    ...settings.preferences,
    theme: 'light',
  },
})
```

来源：[Updating Objects in State](https://react.dev/learn/updating-objects-in-state#updating-a-nested-object)、[MDN Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#copying_and_merging_objects)。

## 三、嵌套对象：从修改点复制到顶层

### 3.1 逐层复制的固定模板

React 官方把“嵌套”解释成对象通过属性互相指向，而不是一个对象物理包含另一个对象。更新路径
`person.artwork.city` 时，必须创建新的 `artwork`，再创建指向新 `artwork` 的 `person`：

```tsx
type Artwork = {
  title: string
  city: string
  image: string
}

type Person = {
  name: string
  artwork: Artwork
}

const [person, setPerson] = useState<Person>(initialPerson)

// 写法一：拆成中间变量，便于观察每一层的新引用。
const nextArtwork = { ...person.artwork, city: 'New Delhi' }
const nextPerson = { ...person, artwork: nextArtwork }
setPerson(nextPerson)

// 写法二：同一次 setter 调用中逐层展开。
setPerson({
  ...person,
  artwork: {
    ...person.artwork,
    city: 'New Delhi',
  },
})
```

未修改的分支可以复用原引用；被修改的路径及其所有父容器必须是新引用。这既保留了旧 snapshot，也让引用
比较能够识别实际发生变化的路径。来源：[Updating Objects in State](https://react.dev/learn/updating-objects-in-state#updating-a-nested-object)、[Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)。

### 3.2 共享引用不是“嵌套副本”

以下三个属性可能指向同一个对象：

```tsx
const artwork = { city: 'Hamburg' }
const person = { artwork }
const copycat = { artwork }
```

`copycat.artwork.city = 'Lagos'` 会同时改变 `person.artwork.city` 和 `artwork.city`。这不是 React 特殊
行为，而是 JavaScript 对象引用关系；放入 State 后，mutation 还会污染之前 render 的 snapshot。来源：[Updating Objects in State](https://react.dev/learn/updating-objects-in-state#objects-are-not-really-nested)。

### 3.3 数组中的对象也要沿路径复制

复制数组容器不等于复制元素：

```tsx
const nextList = [...list]
nextList[0].seen = true // 错误：list[0] 与 nextList[0] 是同一对象
setList(nextList)
```

更新数组中某个对象时，先用 `map` 创建新的目标元素，其他元素可复用原引用：

```tsx
setList(list.map(item =>
  item.id === id ? { ...item, seen: nextSeen } : item,
))
```

如果元素内部还嵌套对象，则从最深修改点开始继续逐层复制。React 官方用两个共享初始列表的示例说明，
一个列表的 mutation 会意外影响另一个列表。来源：[Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state#updating-objects-inside-arrays)、[MDN Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#copying_an_array)。

## 四、computed property name：一个 handler 更新多个字段

对象字面量的 `[]` 允许用表达式计算属性名。React 官方把它用于表单的单一 change handler：

```tsx
function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  const { name, value } = event.target

  setPerson(previous => ({
    ...previous,
    [name]: value,
  }))
}
```

`name` 必须来自受控输入的字段名，例如 `firstName`、`lastName`；`[name]` 是属性名表达式，不是名为
`name` 的固定字段。若 `name` 来自不可信输入，TypeScript 的索引签名不能替代运行时允许字段的校验；本课
只展示字段集合已知的场景，不把动态键扩展成表单校验课。

MDN 定义 `[]` 为 computed property names，TC39 规范要求先求值属性名再写入对象。来源：[Updating Objects in State](https://react.dev/learn/updating-objects-in-state#using-a-single-event-handler-for-multiple-fields)、[MDN Object initializer#Computed property names](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#computed_property_names)、[ECMAScript PropertyDefinitionEvaluation](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-runtime-semantics-propertydefinitionevaluation)。

## 五、易错点与排查顺序

1. **直接写 `state.field = value`。** 这是修改旧对象，不会单独请求 render，还可能污染旧 snapshot。改为
   `{ ...state, field: value }`。
   来源：[Updating Objects in State](https://react.dev/learn/updating-objects-in-state#treat-state-as-read-only)。
2. **只写变更字段，忘记展开旧对象。** `setState({ field: value })` 替换整个对象，其他字段不会自动保留。
   来源：[useState](https://react.dev/reference/react/useState#updating-objects-and-arrays-in-state)。
3. **把字段放在展开前。** `{ field: next, ...state }` 最终使用旧值；需要 `{ ...state, field: next }`。
   来源：[MDN Object initializer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#spread_properties)。
4. **以为 `...` 深复制。** 它只复制一层；嵌套对象、数组元素、Map/Set 等引用仍可能共享。来源：[MDN Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#copying_an_array)、[Updating Objects in State](https://react.dev/learn/updating-objects-in-state#copying-objects-with-the-spread-syntax)。
5. **只复制外层数组，直接修改元素对象。** `nextList[0].field = ...` 仍修改旧列表中的元素；使用 `map` 和对象展开替换目标元素。来源：[Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state#updating-objects-inside-arrays)。
6. **把 State setter 当成同步赋值。** setter 返回后当前 handler 中读取到的仍是旧 snapshot；需要下一次 render 的值时，
   使用 updater 或让组件重新 render，不在当前 handler 里假设变量已变。来源：[State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)、[useState](https://react.dev/reference/react/useState)。
7. **在 updater 中修改传入对象或执行副作用。** updater 必须纯净，只根据输入返回新 State；StrictMode 开发期
   可能调用两次以发现 impurity。来源：[useState](https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state)、[StrictMode](https://react.dev/reference/react/StrictMode)。
8. **把对象 spread 与数组 spread 混为一谈。** 对象 spread 枚举自有可枚举属性；数组/参数 spread 要求可迭代值，
   普通对象不能直接写 `[...object]`。来源：[MDN Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)。
9. **用 `JSON.parse(JSON.stringify(...))` 当通用深复制。** React 官方没有推荐该替代方案；它会丢失函数、特殊对象和
   非 JSON 值，本课不把它当 State 更新模式。需要深复制时应先重新设计 State 结构，或明确选择支持所需类型的工具。
   “避免深层 State”与 Immer 边界见 [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure#avoid-deeply-nested-state)。

## 六、进阶边界：引用、结构与性能

### 6.1 只复制变化路径

不可变更新不是“每次递归复制整个对象”。React 官方示例只复制修改字段所在的对象及其父对象，未修改的
分支保留原引用。这能保留结构共享，也使 `Object.is`/引用比较可以快速判断未变化分支。这里的性能结论限定
为引用可观察性和 React 官方“不变性便于优化”说明，不推导具体 render 次数或调度器实现。来源：[Updating Objects in State](https://react.dev/learn/updating-objects-in-state#why-is-mutating-state-not-recommended-in-react)、[useState](https://react.dev/reference/react/useState)。

### 6.2 深层结构先考虑扁平化

React 官方建议 State 通常不应超过几层深；深层结构会让逐层展开重复且容易遗漏字段。若业务关系允许，优先
拆成独立 State 或以 ID 引用共享实体；若必须保留深层形状，再考虑 Immer。这里只记录设计选择，不展开
Reducer/规范化数据课程。来源：[Choosing the State Structure#Avoid deeply nested state](https://react.dev/learn/choosing-the-state-structure#avoid-deeply-nested-state)、[Updating Objects in State](https://react.dev/learn/updating-objects-in-state#write-concise-update-logic-with-immer)。

### 6.3 Immer 是可选边界，不改变 React 合同

React 官方将 Immer 描述为“让更新代码看起来像 mutation、但负责生成副本”的流行库。其 `draft` 是由 Proxy
记录改动的特殊对象，Immer 在幕后依据改动生成全新的 State；这不等于可以直接修改 React 原始 State。

```tsx
// 仅作可选工具示意；draft 是 Immer 提供的代理，不是 React 原始 State。
updatePerson(draft => {
  draft.artwork.city = 'Lagos'
})
```

课程必须先掌握 `{ ...state, nested: { ...state.nested, field: value } }` 的原生写法，再将 Immer 作为深层
结构的可读性选项。不要在本课讨论 Immer middleware、patches、冻结配置、包版本或项目安装。来源：[Updating Objects in State#Write concise update logic with Immer](https://react.dev/learn/updating-objects-in-state#write-concise-update-logic-with-immer)。

## 七、公共 API 语义速查

| API/语法 | 公共语义 | 本课教学边界 | 来源 URL |
| --- | --- | --- | --- |
| `useState(initial)` | 保存任意 JavaScript 值，包括对象；返回 `[state, setState]`。 | 不讨论 lazy initializer 的性能或服务端行为。 | [useState](https://react.dev/reference/react/useState) |
| `setState(nextObject)` | 把对象 State 替换为传入对象；不会自动深合并。 | 传入对象前复制未修改字段。 | [useState#updating-objects-and-arrays-in-state](https://react.dev/reference/react/useState#updating-objects-and-arrays-in-state) |
| `setState(previous => next)` | updater 接收 pending State 并返回 next State；必须纯净。 | 与第 14 课队列规则衔接，不重讲 batching。 | [useState#updating-state-based-on-the-previous-state](https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state) |
| `{ ...source }` | 创建一层浅复制；嵌套引用保留。 | 用于外层和每层嵌套对象的复制。 | [MDN Spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) |
| `{ ...source, key: value }` | 后写的 `key` 覆盖 source 中同名 key。 | 展开必须位于覆盖字段之前。 | [MDN Object initializer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#spread_properties) |
| `{ [expression]: value }` | 计算 expression 得到属性名。 | 动态表单字段名须来自受控、已知字段集合。 | [MDN Object initializer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#computed_property_names) |
| `map` + `{ ...item, field }` | 创建数组新容器并替换目标对象，保留其他项引用。 | 只作为数组中对象共享引用的必要边界。 | [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state#updating-objects-inside-arrays) |
| `Object.is(previous, next)` | React 用来判断 State 是否相同的 SameValue 比较之一；相同可能跳过重渲染。 | 不把它当深比较或业务等价判断。 | [useState](https://react.dev/reference/react/useState)、[MDN Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) |

## 八、正文编写建议与明确不应出现的内容

- 先用“修改旧对象不会触发可靠更新”建立动机，再用一层展开、嵌套逐层展开、数组元素共享三个递进示例。
- 每个示例都标出旧引用、新引用和未修改分支的关系，避免把“不可变”误解为“深复制所有值”。
- 动态键示例只使用一个受控 handler，明确 `[name]` 与 `name` 的区别，并说明字段名必须受控。
- Immer 只放在“可选进阶”一节，保留原生写法作为判断正确性的基准。
