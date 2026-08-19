# 数组 State 更新研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.updating-array-state`
- 标题：数组 State 更新
- 教学层级：零基础到进阶
- 核验日期：`2026-08-09`
- 研究状态：已完成，可进入单知识点课程编写

本课只回答一条主线：数组保存在 React State 中时，为什么必须把旧数组视为只读值，以及如何通过新数组
完成添加、删除、替换、插入、排序、反转和数组中对象的更新。

前置知识是 State snapshot、State 更新队列和对象 State 不可变更新。本稿只在数组操作需要时引用这些合同，
不重新讲解 render/commit、batching 或对象展开的完整知识。

明确排除：受控表单、表单提交、Reducer、Context、Effect、Ref、服务端数据、缓存、虚拟列表、性能基准、
React 内部 Fiber/lane，以及把 Immer 扩展成独立课程。

## 研究方法与证据边界

1. 按仓库顺位首先调用 Tavily。2026-08-09 的 `tavily_search`、`tavily_extract` 与
   `tavily_research` 均成功，定位到 React 官方数组 State 页面、`useState` Reference 与 MDN 数组方法。
2. Tavily 只用于发现入口和交叉检查。深度摘要曾把 React 更新机制笼统写成“只看引用”，并漏写
   `reverse()`、`toReversed()` 的调用括号；本记录不采用这些摘要表述，最终事实回到官方正文核验。
3. React 版本页当前把 Latest 文档标为 `19.2`。课程的 React 公共合同以 React 19.2 文档为准：
   [React Versions](https://react.dev/versions)。
4. JavaScript 方法的“是否原地修改、返回什么值”回到 MDN Reference；MDN 只解释语言行为，不把语言
   规则误写成 React 专有机制。
5. 课程不会把“创建新数组”写成“React 必然重渲染整棵树”。准确边界是：`useState` setter 收到与当前
   State 经 `Object.is` 相同的值时，React 会跳过更新；不可变数组更新还保护旧 render 快照和共享引用。

## 官方来源卡：URL 与支持的 claim

| ID | 一手来源 URL | 本稿采用的 claim |
| --- | --- | --- |
| `react-arrays` | [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state) | 数组在 State 中应视为只读；添加、删除、替换、插入、排序/反转、数组中对象更新和 Immer 边界。 |
| `react-use-state` | [`useState`](https://react.dev/reference/react/useState) | setter 接收值或纯 updater；`Object.is` 相同值可能跳过更新；updater 接收 pending State。 |
| `react-pure` | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | Props 与 State 是不可变快照，不应修改既有值。 |
| `react-objects` | [Updating Objects in State](https://react.dev/learn/updating-objects-in-state) | 更新数组中的对象时，被修改对象也必须创建新引用；展开是浅复制。 |
| `mdn-array` | [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) | 哪些数组方法修改原数组，哪些方法返回新数组；copying methods 都是浅复制。 |
| `mdn-spread` | [Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) | 数组展开创建浅复制，可在前后插入元素。 |
| `mdn-concat` | [`concat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat) | 返回新数组，不修改调用数组。 |
| `mdn-filter` | [`filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) | 返回满足条件元素的浅复制，不修改调用数组。 |
| `mdn-map` | [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) | 返回回调结果组成的新数组，不修改调用数组。 |
| `mdn-slice` | [`slice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) | 返回选定区间的浅复制，不修改调用数组。 |
| `mdn-splice` | [`splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) | 原地删除、替换或插入元素，并返回被删除元素组成的数组。 |
| `mdn-sort` | [`sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) | 原地排序并返回同一数组引用；未提供比较函数时按字符串转换结果排序。 |
| `mdn-reverse` | [`reverse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse) | 原地反转并返回同一数组引用。 |
| `mdn-to-sorted` | [`toSorted`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) | 排序复制版，返回新数组且不修改原数组。 |
| `mdn-to-reversed` | [`toReversed`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed) | 反转复制版，返回新数组且不修改原数组。 |
| `mdn-to-spliced` | [`toSpliced`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced) | `splice` 的复制版，完成删除/插入后返回新数组。 |
| `mdn-with` | [`with`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with) | 返回替换指定索引后的新数组，不修改原数组。 |

## 一、数组 State 的公共心智模型

### 1.1 数组是可变对象，但 State 快照应只读

JavaScript 允许数组在原位置改变。React 官方因此明确要求：数组一旦作为 State 交给某次 render，就把它
当作只读值；更新时创建新数组并传给 setter。

```tsx
// 错误：修改当前 State 数组。
items.push(nextItem)
setItems(items)

// 正确：基于 pending State 返回新数组。
setItems((previous) => [...previous, nextItem])
```

直接修改再传回同一引用至少破坏两个合同：旧 render 快照被事后改写；setter 收到相同数组引用时，
`Object.is(previous, next)` 为 `true`，React 可能跳过更新。

### 1.2 新数组不等于深复制

数组展开、`concat`、`filter`、`map`、`slice` 以及 copying counterparts 都产生新数组容器，但复制是浅层的。
如果元素是对象，未替换的元素仍指向旧对象。

```tsx
const previous = [{ id: 1, done: false }]
const next = [...previous]

console.log(next !== previous) // true
console.log(next[0] === previous[0]) // true
```

因此，修改对象元素时必须同时创建新数组和新的目标对象。

## 二、原地方法与非变异选择

React 官方给出的核心操作表如下；现代 copying methods 作为补充列出：

| 意图 | 避免直接作用于 State | 常规不可变写法 | 现代复制版 |
| --- | --- | --- | --- |
| 末尾/开头添加 | `push`、`unshift` | `[...items, next]`、`[next, ...items]`、`concat` | `toSpliced` 可表达任意位置插入 |
| 末尾/开头删除 | `pop`、`shift` | `slice`、`filter` | `toSpliced` |
| 任意位置删除/插入 | `splice` | `slice` + 展开、`filter` | `toSpliced` |
| 替换元素 | `items[index] = value`、`splice` | `map` | `with` |
| 排序 | `sort` | 先复制再 `sort` | `toSorted` |
| 反转 | `reverse` | 先复制再 `reverse` | `toReversed` |

“避免”指不要直接在旧 State 数组上调用。可以先创建新数组，再在这个尚未共享的新副本上调用变异方法：

```tsx
setItems((previous) => {
  const next = [...previous]
  next.reverse()
  return next
})
```

## 三、添加元素

### 3.1 添加到末尾或开头

```tsx
setItems((previous) => [...previous, nextItem])
setItems((previous) => [nextItem, ...previous])
```

两种写法都返回新数组。元素顺序由展开位置决定；这与对象展开的“后写属性覆盖前值”不是同一种规则。

`concat` 也是非变异选择：

```tsx
setItems((previous) => previous.concat(nextItem))
```

### 3.2 添加多个元素

```tsx
setItems((previous) => [...previous, ...incomingItems])
```

这只创建新的数组容器；`incomingItems` 中的对象不会自动深复制。若这些对象之后会被外部代码修改，应在
进入 State 前建立清晰的数据所有权，而不是误以为展开已隔离所有引用。

## 四、删除元素

### 4.1 按稳定标识删除

```tsx
setItems((previous) => previous.filter((item) => item.id !== removedId))
```

`filter` 返回新数组，条件为 `true` 的元素被保留。删除业务实体时通常按稳定 ID 判断，不依赖元素当前索引。

### 4.2 按索引删除

索引确实是当前操作合同的一部分时，可以用 `filter` 的第二个参数：

```tsx
setItems((previous) => previous.filter((_, index) => index !== removedIndex))
```

必须区分“索引代表业务身份”和“索引只是当前位置”。列表 key 的完整规则属于已完成的列表课程，本课只
说明删除条件应匹配真实意图。

## 五、替换和转换元素

### 5.1 用 map 替换一个元素

```tsx
setItems((previous) =>
  previous.map((item) => (item.id === changedId ? { ...item, done: !item.done } : item)),
)
```

`map` 总是返回新数组。目标对象也创建新引用；未变化对象可以合法复用原引用。

### 5.2 map 回调必须返回每个分支

带花括号的箭头函数不会隐式返回：

```tsx
// 错误：回调没有 return，结果数组全部是 undefined。
previous.map((item) => {
  item.id === changedId ? { ...item, done: true } : item
})
```

正确做法是使用圆括号隐式返回，或在函数体中显式 `return`。

### 5.3 用 with 按索引替换

运行环境支持 copying array methods 时，可以使用：

```tsx
setItems((previous) => previous.with(index, nextItem))
```

`with` 返回新数组，但 `nextItem` 本身仍由调用方负责。索引越界会抛出 `RangeError`，不要把它当作“找不到
就保持不变”的业务 API。

## 六、在任意位置插入

`slice` 不修改原数组，适合把数组分成前后两段：

```tsx
setItems((previous) => [
  ...previous.slice(0, insertAt),
  nextItem,
  ...previous.slice(insertAt),
])
```

现代写法为：

```tsx
setItems((previous) => previous.toSpliced(insertAt, 0, nextItem))
```

### 6.1 slice 与 splice 不能混淆

- `slice(start, end)` 返回 `[start, end)` 的浅复制，不修改原数组。
- `splice(start, deleteCount, ...items)` 修改调用数组，返回被删除元素组成的新数组。
- `toSpliced` 才是完成 splice 类操作但保留原数组的 copying counterpart。

常见错误是把 `splice` 的返回值当成“更新后的完整数组”传给 setter；实际上它是“被删除的元素”。

## 七、排序与反转

### 7.1 先复制再使用 sort/reverse

```tsx
setItems((previous) => [...previous].sort((a, b) => a.rank - b.rank))
setItems((previous) => [...previous].reverse())
```

`sort` 和 `reverse` 修改的是新副本，因此旧 State 保持不变。

### 7.2 现代 copying methods

```tsx
setItems((previous) => previous.toSorted((a, b) => a.rank - b.rank))
setItems((previous) => previous.toReversed())
```

二者直接返回新数组。课程需要明确写出调用括号，不能把方法本身误传给 setter。

### 7.3 数字排序必须提供比较函数

`sort()` / `toSorted()` 未提供比较函数时，会把非 `undefined` 元素转为字符串并按 UTF-16 code unit 顺序
比较。数字排序应写出比较函数：

```tsx
const numbers = [2, 10, 1]
numbers.toSorted((a, b) => a - b) // [1, 2, 10]
```

排序稳定性、稀疏数组细节和 locale 比较不进入本课主线。

## 八、数组中的对象

### 8.1 复制数组后直接改元素仍会污染旧 State

```tsx
const next = [...items]
next[0].done = true // 错误：next[0] 与 items[0] 是同一对象
setItems(next)
```

正确做法是替换目标对象：

```tsx
setItems((previous) =>
  previous.map((item) => (item.id === changedId ? { ...item, done: true } : item)),
)
```

### 8.2 嵌套对象继续逐层复制

若修改 `item.meta.priority`，数组、目标 item 和目标 `meta` 都要创建新引用：

```tsx
setItems((previous) =>
  previous.map((item) =>
    item.id === changedId
      ? {
          ...item,
          meta: { ...item.meta, priority: 'high' },
        }
      : item,
  ),
)
```

没有变化的元素与分支可以保留引用，这叫结构共享，不是错误。

### 8.3 共享初始对象

两个数组如果包含同一个对象引用，直接修改该对象会同时影响两边。React 官方数组页用两个列表说明这一
问题。判断更新是否安全时，既要检查数组容器，也要检查实际被修改对象的身份。

## 九、Setter 与 updater 的准确边界

如果下一数组已经完整确定，可以直接传值：

```tsx
setItems(serverSnapshot)
```

如果下一数组基于 pending State 的内容计算，使用 updater：

```tsx
setItems((previous) => [...previous, nextItem])
```

不要把“数组更新”机械等同于“永远必须 updater”。React `useState` 文档的准确规则是：基于同一 State 的
先前值计算下一值时使用 updater。updater 只读取 `previous` 并返回新数组，不能修改输入、发送请求或修改
外部变量。

## 十、Immer 的可选边界

React 官方数组页把 Immer 作为减少复制代码的可选方案。Immer 的 draft 是代理对象，允许写出看似变异的
操作，再由 Immer 生成下一不可变 State；这不等于可以修改 React 原始 State。

课程必须先掌握展开、`filter`、`map`、`slice` 与逐层复制，再把 Immer 作为深层结构的可读性选项。不要在
本课展开安装、包版本、patch、middleware 或配置。

## 十一、易错点矩阵

| 错误 | 错误原因 | 可观察后果 | 正确方向 | 来源 |
| --- | --- | --- | --- | --- |
| `push` 后 `setItems(items)` | 修改旧数组并传回同一引用 | 旧快照被污染，更新可能被跳过 | `[...previous, next]` | `react-arrays`、`react-use-state` |
| `pop` / `shift` 直接删除 | 原地修改旧数组 | 历史快照和共享引用失真 | `slice` 或 `filter` | `react-arrays`、`mdn-array` |
| `splice` 结果传给 setter | `splice` 返回被删除项，不是完整结果 | State 只剩被删除元素 | `toSpliced` 或 `slice` + 展开 | `mdn-splice`、`react-arrays` |
| `map` 花括号忘记 return | 回调返回 `undefined` | 新数组元素丢失 | 圆括号或显式 return | `mdn-map` |
| `filter` 条件写反 | `true` 表示保留，不是删除 | 删除目标仍在，其他项消失 | 先口述保留条件 | `mdn-filter` |
| 只复制数组再改对象属性 | 数组复制是浅复制 | 旧 State 的对象被修改 | `map` 中复制目标对象 | `react-arrays` |
| `sort` / `reverse` 直接作用于 State | 两者都原地修改 | 旧顺序被事后改写 | 先复制或用 copying method | `react-arrays`、MDN |
| 数字 `sort()` 不传比较函数 | 默认按字符串转换排序 | `10` 可能排在 `2` 前 | `(a, b) => a - b` | `mdn-sort` |
| 把 `toReversed` 当结果值 | 传入的是函数而非数组 | setter 按函数 updater 语义调用 | 写成 `toReversed()` | `react-use-state`、`mdn-to-reversed` |
| 误把新数组当深克隆 | 元素对象引用仍共享 | 修改一个路径影响另一处 | 沿实际修改路径复制 | `react-arrays`、`mdn-array` |
| 总是机械使用 updater | 混淆“数组”与“依赖 pending State” | 代码意图不清 | 只在基于先前 State 计算时使用 | `react-use-state` |
| 使用现代方法但忽略运行环境 | copying methods 需要目标运行环境支持 | 旧环境缺少方法 | 根据目标环境决定是否使用 | MDN copying methods |

## 十二、正文编写合同

正文必须覆盖：

1. 数组 State 的只读快照与 setter 替换语义。
2. 原地方法和非变异方法对照。
3. 添加、删除、替换、插入、排序、反转。
4. `slice` / `splice` 区别。
5. 数组中对象与嵌套对象的逐层复制。
6. updater 的使用边界。
7. `toSorted`、`toReversed`、`toSpliced`、`with` 的进阶边界。
8. Immer 只作为可选工具边界。
9. 至少覆盖本记录易错点中的高价值问题、练习、小结和官方来源。

正文不得出现 Tavily 调用、临时验证、本地依赖、仓库命令、构建结果、源码哈希、浏览器数据、Gate 或复审
结论。所有展示代码统一使用 TSX；不展开表单、Reducer、Context、Effect、Ref 或服务端数据。

