# State 的不可变更新研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.immutable-state-updates`
- 标题：State 的不可变更新
- 教学层级：本科范围内的 React 基础公开模型
- 核验日期：`2026-08-16`
- 研究状态：官方调研已完成，可据此合并旧课程
- 运行时基线：React / React DOM `19.2.8`
- React 文档基线：React 官方文档 `19.2`
- React 固定文档提交：`c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- MDN 固定内容提交：`d14bee540b5305ddeb93969618ba05102b648bb6`
- ECMAScript 固定规范提交：`ae8c512bc721e31d39fde8c197a846e2f49c5f7a`
- 类型基线：`@types/react` `19.2.18`、TypeScript `6.0.3`

本目标是新课程身份，吸收并替代退出路线的
`react.core.learn.basics.updating-object-state` 与
`react.core.learn.basics.updating-array-state`。课程必须用一条连续规则统一对象和数组：已经进入
State 的值属于某次 render 的只读快照；更新时创建下一对象或下一数组，只复制实际变化路径，并把新值
交给 setter。对象展开、数组展开和 copying methods 都只做浅复制，不等于递归深克隆。

## 一、研究范围与排除项

### 1.1 必须直接回答的问题

1. 为什么 JavaScript 允许对象和数组变异，但 React State 仍应按只读快照使用。
2. 为什么直接修改旧 State 后原样传回 setter 可能被 `Object.is` 判定为相同值。
3. 为什么 `useState` setter 替换整个值，而不是自动合并对象字段或数组元素。
4. 对象展开和数组展开到底复制什么，为什么它们都是浅复制。
5. 更新顶层对象字段时怎样保留其他字段，以及展开顺序为什么重要。
6. 更新嵌套对象时为什么要从修改点向外逐层复制，哪些未变化引用可以复用。
7. 数组添加、删除、替换、插入、排序和反转分别应选择什么操作。
8. `slice()` 与 `splice()` 的名称相近但语义为何相反。
9. `map()`、`filter()`、`concat()` 返回新数组时，为什么其中的对象元素仍可能共享引用。
10. `sort()`、`reverse()` 为什么不能直接作用于旧 State，但可以作用于刚创建且未共享的新副本。
11. `toSorted()`、`toReversed()`、`toSpliced()` 与 `with()` 能替代哪些原地操作，各自有什么边界。
12. 下一值依赖 pending State 时怎样使用纯 updater，而不重复前一课的更新队列教学。

### 1.2 明确排除

| 排除主题 | 本目标允许的准确边界 |
| --- | --- |
| Reducer、Context | 不把不可变更新扩展为状态管理架构；只使用一个 `useState` 目标组件。 |
| Effect、Ref | 不用提交后同步、DOM 测量或跨 render 容器证明引用变化。 |
| 缓存、memoization、性能优化 | 只说明引用身份可用于判断变化，不教学 `memo`、`useMemo` 或缓存策略。 |
| 服务端数据与请求 | 不讨论乐观更新、请求缓存、同步、规范化或数据库不可变性。 |
| React 内部实现 | 不引用 Fiber、lane、更新节点、调度器或内部相等性路径。 |
| 更新队列细节 | 只复用“基于 pending State 时用 updater”；batching 与混合队列由前置目标负责。 |
| State 结构设计 | 只使用足以展示嵌套路径的固定形状；扁平化和规范化由状态建模目标负责。 |
| 深克隆与序列化 | 只解释为什么通常不需要深克隆；不教学 `structuredClone`、JSON 克隆或类实例复制。 |
| Immer 完整教学 | React 官方把 Immer 作为减少重复复制的可选工具；本目标只留一句边界，不加依赖、不进 Demo。 |
| 稀疏数组专题 | 只在现代 copying methods 的准确性附注中说明差异，不进主线、Demo 或练习。 |

### 1.3 本科范围的准确深度

- 必须讲清“新容器 + 变化路径上的新对象 + 未变化分支可共享”的结构共享模型。
- 必须让学习者能独立写出对象顶层更新、嵌套更新，以及数组增删改排。
- 必须区分“方法本身不修改调用数组”与“回调仍可能修改元素对象”这两个层次。
- 必须给出现代 copying methods 的直接替代关系，但不扩展到 polyfill、转译或浏览器兼容矩阵；当前
  React TSX 配置声明 `ES2023` library，Demo 可使用 `toSorted`，其余方法进入正文语义对照。
- 不用冻结对象或递归比较作为正确性的前提；不可变更新是写入纪律，不是运行时深冻结机制。

## 二、研究方法与证据边界

1. 范围来自当前 React 课程总计划的 B17 目标与合并映射；研究不修改计划、正文、Demo、manifest、
   Track 或完成状态。
2. 用户已指定 React、MDN 与 TC39 的已知官方入口，本轮直接读取这些一手来源，无需再做关键词发现；
   搜索摘要和二手文章不作为事实证据。
3. React 公共行为固定到官方 `reactjs/react.dev` 提交 `c7d6b700...`；本地安装包同时核对为 React /
   React DOM `19.2.8`。
4. JavaScript 教学表述先由 MDN 固定内容提交 `d14bee...` 核对，再以 ECMAScript 固定规范提交
   `ae8c512...` 的算法确认新数组创建、旧数组写入、索引归一化与异常边界。
5. “浅复制”只表示新外层容器接收原属性值或元素值；规范算法不会递归克隆这些值，因此嵌套对象仍可
   共享引用。
6. `Object.is` 只用于解释“同一引用可能被忽略”；本目标不承诺某个 setter 对应固定 render 次数。
7. `map()` / `filter()` 本身不直接修改调用数组，但回调仍是普通 JavaScript；课程示例必须保持回调纯净，
   不能把方法名误当成自动不可变保证。
8. 本记录可以描述迁移、删除和验收；未来学习者正文不得出现这些生产过程信息。

## 三、版本基线

| 项目 | live 版本 | 核验依据 | 采用方式 |
| --- | --- | --- | --- |
| React | `19.2.8` | 本地安装包与 React 官方 tag | State 公共行为运行时基线 |
| React DOM | `19.2.8` | 本地安装包与 React 官方 tag | Demo 运行时基线 |
| `@types/react` | `19.2.18` | 本地安装包 | 只约束 TSX 类型，不证明运行时行为 |
| TypeScript | `6.0.3` | 本地安装包 | Demo 编译基线 |
| React TSX library | `ES2023`、`DOM`、`DOM.Iterable` | `tsconfig.react.json` | Demo 使用展开、`slice`、`map`、`filter`、`toSorted` 和先复制再 `reverse` |
| React 文档 | `19.2` | `react.dev` 与固定官方提交 | React 公共教学事实 |
| ECMAScript | 当前标准文本及固定提交 | TC39 `ecma262` | JavaScript 规范语义 |

## 四、一手来源表

### 4.1 React 官方来源

| ID | 一手来源 | 本目标采用的事实 |
| --- | --- | --- |
| `react-runtime` | [React `v19.2.8`](https://github.com/facebook/react/tree/v19.2.8) | 锁定本目标运行时 patch；不引用内部实现。 |
| `react-objects` | [Updating Objects in State](https://react.dev/learn/updating-objects-in-state)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/updating-objects-in-state.md) | 对象 State 只读、新对象触发、局部变异、浅展开、嵌套路径复制与共享引用。 |
| `react-arrays` | [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/updating-arrays-in-state.md) | 数组 State 只读、方法对照、增删改插、排序反转和对象元素复制。 |
| `react-snapshot` | [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/state-as-a-snapshot.md) | 已进入 State 的对象属于特定 render；setter 请求后续 render。 |
| `react-use-state` | [`useState`](https://react.dev/reference/react/useState)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useState.md) | 替换对象/数组、pending updater、`Object.is` 相等跳过与 updater 纯度。 |
| `react-purity` | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/rules/components-and-hooks-must-be-pure.md) | Props / State 是不可变快照；局部创建值可以局部修改。 |

### 4.2 JavaScript 官方来源

下表的 MDN 链接用于直接教学表述，TC39 链接用于核对规范算法。MDN 固定文件均来自
`d14bee540b5305ddeb93969618ba05102b648bb6`，TC39 固定行均来自
`ae8c512bc721e31d39fde8c197a846e2f49c5f7a`。

| ID | MDN / TC39 一手来源 | 本目标采用的事实 |
| --- | --- | --- |
| `js-spread` | [Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)、[固定数组展开第 125-138 行](https://github.com/mdn/content/blob/d14bee540b5305ddeb93969618ba05102b648bb6/files/en-us/web/javascript/reference/operators/spread_syntax/index.md#L125-L138)、[固定对象展开第 219-231 行](https://github.com/mdn/content/blob/d14bee540b5305ddeb93969618ba05102b648bb6/files/en-us/web/javascript/reference/operators/spread_syntax/index.md#L219-L231)、[CopyDataProperties](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-copydataproperties)、[固定规范第 6684-6708 行](https://github.com/tc39/ecma262/blob/ae8c512bc721e31d39fde8c197a846e2f49c5f7a/spec.html#L6684-L6708) | 数组 / 对象展开创建浅副本；对象展开复制自有可枚举属性值。 |
| `js-slice` | [`slice()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)、[固定 MDN 第 10-13 行](https://github.com/mdn/content/blob/d14bee540b5305ddeb93969618ba05102b648bb6/files/en-us/web/javascript/reference/global_objects/array/slice/index.md#L10-L13)、[TC39 `slice`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.slice) | 返回选定区间的浅副本，不修改原数组。 |
| `js-splice` | [`splice()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)、[固定 MDN 第 10-13 行](https://github.com/mdn/content/blob/d14bee540b5305ddeb93969618ba05102b648bb6/files/en-us/web/javascript/reference/global_objects/array/splice/index.md#L10-L13)、[TC39 `splice`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.splice) | 原地删除、替换或插入；返回被删除元素数组。 |
| `js-map-filter-concat` | [`map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)、[`filter()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)、[`concat()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)、[TC39 `map`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.map)、[TC39 `filter`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.filter)、[TC39 `concat`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.concat) | `map` 构造映射结果，`filter` 构造筛选结果，`concat` 合并为新数组；三者都不递归克隆元素。 |
| `js-sort-reverse` | [`sort()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)、[`reverse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)、[固定 `sort` 第 10-15 行](https://github.com/mdn/content/blob/d14bee540b5305ddeb93969618ba05102b648bb6/files/en-us/web/javascript/reference/global_objects/array/sort/index.md#L10-L15)、[固定 `reverse` 第 10-12 行](https://github.com/mdn/content/blob/d14bee540b5305ddeb93969618ba05102b648bb6/files/en-us/web/javascript/reference/global_objects/array/reverse/index.md#L10-L12)、[TC39 `sort`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort)、[TC39 `reverse`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.reverse) | 两者都原地修改并返回同一数组引用；数值排序需要比较函数。 |
| `js-copying-methods` | [`toSorted()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)、[`toReversed()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed)、[`toSpliced()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)、[`with()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with)、[TC39 copying methods](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.toreversed)、[固定规范第 41783-41855 行](https://github.com/tc39/ecma262/blob/ae8c512bc721e31d39fde8c197a846e2f49c5f7a/spec.html#L41783-L41855) | 四个方法创建新数组；分别对应排序、反转、区间增删改和单索引替换。 |
| `js-with-fixed` | [固定 MDN `with` 第 10-42 行](https://github.com/mdn/content/blob/d14bee540b5305ddeb93969618ba05102b648bb6/files/en-us/web/javascript/reference/global_objects/array/with/index.md#L10-L42)、[固定规范第 41919-41935 行](https://github.com/tc39/ecma262/blob/ae8c512bc721e31d39fde8c197a846e2f49c5f7a/spec.html#L41919-L41935) | `with` 支持负索引；越界抛 `RangeError`；结果仍是浅复制。 |

## 五、逐 claim 事实账本

| ID | 可采用的准确表述 | 不能推出 | 一手来源 |
| --- | --- | --- | --- |
| `C01` | 对象和数组进入 React State 后应按只读值使用。 | JavaScript 对象本身变成不可变值或被 React 深冻结。 | [`react-objects`](https://react.dev/learn/updating-objects-in-state#treat-state-as-read-only)、[`react-arrays`](https://react.dev/learn/updating-arrays-in-state#updating-arrays-without-mutation) |
| `C02` | 直接修改旧对象不会主动通知 React；应创建新对象并交给 setter。 | 只要最后调用任意 setter，之前的变异就变得正确。 | [`react-objects`](https://react.dev/learn/updating-objects-in-state#treat-state-as-read-only)、[`react-purity`](https://react.dev/reference/rules/components-and-hooks-must-be-pure#dont-mutate-state) |
| `C03` | setter 只影响后续 render；旧对象仍属于先前 snapshot。 | setter 会把当前闭包中的对象变量改指向新对象。 | [`react-snapshot`](https://react.dev/learn/state-as-a-snapshot#rendering-takes-a-snapshot-in-time) |
| `C04` | React 以 `Object.is` 比较前后 State；同一对象或数组引用可能让更新被忽略。 | 只要引用不同，所有深层内容一定都正确。 | [`react-use-state`](https://react.dev/reference/react/useState#ive-updated-the-state-but-the-screen-doesnt-update) |
| `C05` | `useState` setter 用传入值替换整个对象或数组，不自动合并字段或元素。 | `setProfile({ name })` 会保留旧对象的其他字段。 | [`react-use-state`](https://react.dev/reference/react/useState#updating-objects-and-arrays-in-state) |
| `C06` | 新建且未被其他代码引用的局部对象或数组可以先局部修改，再作为结果返回。 | 可以修改已经来自 Props、State 或 updater 参数的旧值。 | [`react-objects`](https://react.dev/learn/updating-objects-in-state#local-mutation-is-fine)、[`react-purity`](https://react.dev/reference/rules/components-and-hooks-must-be-pure#local-mutation) |
| `C07` | 对象展开复制自有可枚举属性值到新对象，不复制原型和不可枚举属性。 | 展开等同于保留完整对象语义的通用克隆。 | [`js-spread`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#copying_and_merging_objects)、[TC39 CopyDataProperties](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-copydataproperties) |
| `C08` | 对象展开按书写顺序应用，同名属性以后写值为准。 | `{ field: next, ...old }` 会保留 `next`。 | [MDN Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#overriding_properties) |
| `C09` | 数组展开创建新数组，但每个元素值保持原身份。 | `[...items]` 会递归复制其中的对象。 | [`js-spread`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#copying_an_array) |
| `C10` | 更新嵌套字段要复制目标对象及其向外的每层父对象。 | 所有未变化分支也必须无差别深克隆。 | [`react-objects`](https://react.dev/learn/updating-objects-in-state#updating-a-nested-object) |
| `C11` | 多个属性可指向同一对象；修改共享对象会从所有路径可见。 | 源码缩进能证明运行时对象被物理嵌套。 | [`react-objects`](https://react.dev/learn/updating-objects-in-state#objects-are-not-really-nested) |
| `C12` | `slice(start, end)` 返回从 `start` 到不含 `end` 的浅副本，不修改原数组。 | `slice` 可原地删除或插入。 | [`js-slice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)、[TC39 `slice`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.slice) |
| `C13` | `splice` 原地删除、替换或插入，并返回被删除元素数组。 | `splice` 的返回值是更新后的完整数组。 | [`js-splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)、[TC39 `splice`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.splice) |
| `C14` | `concat` 不修改输入数组，返回包含原元素值的新数组。 | `concat` 会递归展开或克隆嵌套数组 / 对象。 | [MDN `concat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)、[TC39 `concat`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.concat) |
| `C15` | `filter` 创建通过条件的浅复制；React 删除项可按稳定 ID 筛除目标。 | `filter` 回调中的对象写入也会自动变成不可变操作。 | [MDN `filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)、[`react-arrays`](https://react.dev/learn/updating-arrays-in-state#removing-from-an-array) |
| `C16` | `map` 构造新数组；替换对象元素时目标项还要创建新对象，未变化项可复用。 | 新外层数组意味着所有对象元素都是新引用。 | [MDN `map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)、[`react-arrays`](https://react.dev/learn/updating-arrays-in-state#updating-objects-inside-arrays) |
| `C17` | `sort` 与 `reverse` 都修改调用数组并返回同一引用。 | 接住返回值就能避免修改旧 State。 | [`js-sort-reverse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)、[MDN `reverse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse) |
| `C18` | 可以先浅复制数组，再对这个未共享副本调用 `sort` 或 `reverse`。 | 复制外层后可安全修改其中共享的对象元素。 | [`react-arrays`](https://react.dev/learn/updating-arrays-in-state#making-other-changes-to-an-array)、[MDN `sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sort_returns_the_reference_to_the_same_array) |
| `C19` | 默认 `sort()` 按字符串的 UTF-16 单元顺序比较；数值排序应传比较函数。 | 默认排序会按数值大小排列数字。 | [MDN `sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) |
| `C20` | `toSorted` 与 `toReversed` 分别返回排序、反转后的新数组。 | 它们会深复制数组中的对象。 | [MDN `toSorted`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)、[MDN `toReversed`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed)、[TC39 copying methods](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.tosorted) |
| `C21` | `toSpliced` 返回增删改后的完整新数组，不修改原数组，也不返回删除项。 | 它与 `splice` 只有名字差异、返回值相同。 | [MDN `toSpliced`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)、[TC39 `toSpliced`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.tospliced) |
| `C22` | `with(index, value)` 返回替换单个索引的新数组；支持负索引，越界抛 `RangeError`。 | 它像普通索引赋值一样可扩展数组长度。 | [`js-with-fixed`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with)、[TC39 `with`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.with) |
| `C23` | 四个现代 copying methods 都创建新外层数组；元素对象仍是浅层共享。 | 使用现代方法后不再需要复制被修改的对象元素。 | [`js-copying-methods`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods) |
| `C24` | `toSorted` / `toReversed` / `toSpliced` / `with` 会把稀疏数组空槽读取为 `undefined`，结果不再稀疏。 | 它们和 `slice`、`map` 对空槽的行为完全一致。 | [MDN `toSorted`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted#using_tosorted_on_sparse_arrays)、[MDN `toReversed`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed#using_toreversed_on_sparse_arrays)、[MDN `toSpliced`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced#description)、[MDN `with`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with#description) |
| `C25` | 下一值依赖同一 State 的 pending 值时使用纯 updater，并返回新对象或新数组。 | 任何对象 / 数组 setter 都必须机械包装成 updater。 | [`react-use-state`](https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state) |

## 六、直接知识结构

### 6.1 统一心智模型

```text
某次 render 的旧 State S0（只读）
        |
        v
根据更新意图创建下一外层容器
        |
        v
只为实际变化路径创建新引用，复用未变化分支
        |
        v
setter(nextState) 请求后续 render 使用 S1
```

“不可变更新”描述的是从 `S0` 计算 `S1` 时不改写 `S0`。它不要求递归冻结、递归复制或让每个后代引用
都变化。判断复制范围的直接问题是：**哪条访问路径上的值发生了变化？**

### 6.2 对象顶层更新

```tsx
setProfile((previous) => ({
  ...previous,
  displayName: 'Lin',
}))
```

- 新对象替换整个 State。
- 展开先保留旧字段，后写 `displayName` 覆盖同名旧值。
- 没有变化的字段值直接复用。
- 若已有完整下一对象，不必为了形式统一而机械展开旧对象。

反例 `{ displayName: 'Lin', ...previous }` 会被后面的旧值覆盖。反例 `setProfile({ displayName: 'Lin' })`
则会替换掉其他字段，而不是自动合并。

### 6.3 嵌套对象与结构共享

```tsx
setBoard((previous) => ({
  ...previous,
  preferences: {
    ...previous.preferences,
    compact: !previous.preferences.compact,
  },
}))
```

这次更新创建新的根对象和新的 `preferences`，但可以复用未变化的 `tasks`。若继续更新
`tasks[0].done`，则需要新的根对象、新的 `tasks` 数组和新的目标 task；其他 task 可保留原引用。

### 6.4 数组操作按意图选择

| 更新意图 | 基础写法 | 现代 copying method | 关键边界 |
| --- | --- | --- | --- |
| 末尾 / 开头添加 | `[...items, next]` / `[next, ...items]`、`concat` | 无专门方法 | 结果是浅复制。 |
| 删除 | `filter` | `toSpliced` | `filter` 适合按条件 / ID；`toSpliced` 适合已知连续索引区间。 |
| 替换对象项 | `map` + 目标对象展开 | `with(index, nextItem)` | 两种写法都要显式创建被修改对象。 |
| 插入 | `slice` + 展开 | `toSpliced(index, 0, item)` | 不直接对旧 State 调 `splice`。 |
| 排序 | `[...items].sort(compareFn)` | `items.toSorted(compareFn)` | 数字 / 优先级排序显式传比较函数。 |
| 反转 | `[...items].reverse()` | `items.toReversed()` | 原地方法只作用于刚创建的新副本。 |

`concat`、展开、`slice`、`map`、`filter` 和四个现代 copying methods 都不提供深复制保证。只要数组元素
是对象，就必须继续判断目标对象是否也要新引用。

### 6.5 `slice`、`splice`、`toSpliced` 三者

| 方法 | 是否修改调用数组 | 返回值 | 本目标用途 |
| --- | --- | --- | --- |
| `slice(start, end)` | 否 | 选定区间的浅副本 | 拼接插入前段 / 后段，或复制区间。 |
| `splice(start, count, ...items)` | 是 | 被删除元素数组 | 不直接作用于旧 State；只可作用于明确的新局部副本。 |
| `toSpliced(start, count, ...items)` | 否 | 完整的新数组 | 已知索引下的删除、替换或插入。 |

课程必须明确 `slice` 的 `end` 不包含在结果中；也必须明确 `splice` 的返回值不是更新后的完整数组。

### 6.6 `map`、`filter`、`concat` 的回调与元素边界

- `map` 创建新外层数组，但只有回调返回新对象的目标项才得到新对象引用。
- `filter` 创建通过条件的浅复制，适合按稳定 ID 删除；它不会克隆保留项。
- `concat` 创建合并后的浅复制，不递归展开嵌套数组或对象。
- 这些方法不会替回调保持纯净；`task.done = true` 仍是在修改旧对象。

### 6.7 `sort`、`reverse` 与局部变异

以下写法错误，因为它直接修改旧 State：

```tsx
setTasks(tasks.sort(compareTasks))
```

以下两类都正确：

```tsx
setTasks((previous) => [...previous].sort(compareTasks))
setTasks((previous) => previous.toSorted(compareTasks))
```

第一行的 `sort` 仍是原地方法，只是调用对象已经是新建且未共享的数组；第二行由方法本身创建新数组。
`reverse` 与 `toReversed` 使用同一判断。这个边界与“局部变异允许”一致，不能写成“React 中永远禁止
`sort` / `reverse`”。

### 6.8 四个现代 copying methods

| 方法 | 直接替代 | 本目标必须说明的边界 |
| --- | --- | --- |
| `toSorted(compareFn?)` | 先复制再 `sort` | 默认仍是字符串排序语义；对象元素不深复制。 |
| `toReversed()` | 先复制再 `reverse` | 返回新数组；对象元素不深复制。 |
| `toSpliced(start, count, ...items)` | `slice` / 展开组合或新副本上的 `splice` | 返回完整新数组，不返回删除项。 |
| `with(index, value)` | `map` 或新副本索引赋值 | 只替换既有索引；负索引可用，越界抛 `RangeError`。 |

现代方法进入正文的直接 API 对照。当前 `tsconfig.react.json` 声明 `ES2023` library，因此 Demo 的排序
使用 `toSorted`；`toReversed`、`toSpliced` 和 `with` 保留在正文对照与练习中，避免单个 Demo 同时堆叠
多种等价写法。
稀疏数组差异只放在准确性附注，不进入练习。

### 6.9 Updater 只复用必要边界

下一值依赖同一 State 的 pending 值时使用 updater：

```tsx
setBoard((previous) => ({
  ...previous,
  tasks: [...previous.tasks, nextTask],
}))
```

updater 只接收旧值并返回下一值，不修改 `previous`，也不执行请求、存储写入或其他副作用。课程不再重讲
队列、batching、混合 replace 或 StrictMode 调用次数。

## 七、高价值易错点

| 错误做法或说法 | 后果 | 准确处理 | 来源 |
| --- | --- | --- | --- |
| 修改字段后传回同一对象 | 旧快照被污染，更新还可能因相同引用被忽略 | 创建并提交新对象 | `C01` 至 `C04` |
| 只提交变化字段 | 误以为 setter 自动合并 | 展开需保留字段，或提交完整下一对象 | `C05` |
| 新字段写在展开前 | 后写旧值覆盖新值 | 先展开，后写覆盖字段 | `C08` |
| 把展开当深克隆 | 嵌套对象仍共享，后续修改穿透旧快照 | 沿实际变化路径逐层复制 | `C09` 至 `C11` |
| 对旧 State 调 `splice` | 原数组在原地改变，返回值还是删除项 | 用 `slice` / `filter` / `toSpliced` | `C12`、`C13`、`C21` |
| `map` 中写 `task.done = true` | 新数组仍包含被修改的旧对象 | 目标项返回 `{ ...task, done: true }` | `C16` |
| 对旧 State 调 `sort` / `reverse` | 修改旧数组且返回同一引用 | 先复制再调用，或用 copying method | `C17`、`C18` |
| 数字排序不传比较函数 | 默认字符串顺序可能把 `10` 排在 `2` 前 | 传 `(a, b) => a - b` | `C19` |
| 把 `toSpliced` 当 `splice` 的同返回值版本 | 错把完整新数组当删除项，或反之 | 明确前者返回完整新数组 | `C21` |
| 用 `with` 扩展数组 | 越界直接抛 `RangeError` | 只替换既有索引；添加使用展开 / `concat` | `C22` |
| 对任何对象更新都机械深克隆 | 丢失结构共享并增加无关复杂度 | 只复制变化路径 | `C10`、`C11` |
| 在 updater 中修改 `previous` | updater 不纯且污染 pending State | 从 `previous` 计算并返回新值 | `C25` |

## 八、六份旧资产逐项审计

### 8.1 旧《对象 State 更新研究记录》

| 原部分 | 处置 | 合并后的准确位置 |
| --- | --- | --- |
| 冻结知识点合同 | **重写并合并** | 旧对象课 ID 退出；只读合同、对象复制和数组中对象边界并入新目标，不保留“前置课 / 本课”生产顺序叙事。 |
| 研究方法与证据边界 | **保留证据，更新基线** | React、MDN、TC39 入口继续有效；版本、固定提交和当前工具链由本记录统一冻结。 |
| 官方来源卡 | **合并** | React 对象、snapshot、`useState`、purity 与 JavaScript spread 进入本记录来源表；队列来源只保留 pending updater 的必要边界。 |
| 一、对象 State 心智模型 | **保留主线并去重** | 只读快照、setter 替换整个值和同一引用可能被忽略放入统一心智模型；不重讲完整更新队列。 |
| 二、不可变复制与展开顺序 | **完整保留** | 自有可枚举属性、浅复制、先展开后覆盖和嵌套不深合并进入对象部分。 |
| 三、嵌套对象 | **完整保留并连接数组** | 逐层复制、共享引用、数组中的对象进入同一“变化路径”模型。 |
| 四、计算属性名 | **保留为对象补充** | 只用于受限的已知字段集合；不扩展表单校验或不可信输入处理。 |
| 五、易错点 | **合并去重** | 直接变异、漏字段、展开顺序、浅复制、数组对象和不纯 updater 进入统一错误表。 |
| 六、结构与 Immer 边界 | **压缩** | 结构共享保留；扁平化属于 State 结构目标；Immer 最多一句可选工具边界。 |
| 七、公共 API 速查 | **并入事实账本** | 删除重复 API 教学表，以 `C01` 至 `C25` 和正文操作表为唯一合同。 |
| 八、正文建议 | **吸收并更新** | 保留“引用关系必须可解释”；正文不出现合并、计划、测试或后续课程叙事。 |

旧研究中“重置时必须创建新对象”不能写成 React 普遍规则：复用一个从未被修改的不可变初始对象也能表达
重置。新 Demo 使用工厂函数，是为了每个观察序列获得独立的任务对象和确定基线，而不是宣称所有 reset
都必须分配全新深层对象。

### 8.2 旧《数组 State 更新研究记录》

| 原部分 | 处置 | 合并后的准确位置 |
| --- | --- | --- |
| 冻结知识点合同 | **重写并合并** | 旧数组课 ID 退出；增删改插、排序、反转和对象元素更新全部并入新目标。 |
| 研究方法与来源卡 | **保留证据，更新基线** | React 数组页、`useState`、purity、MDN 数组方法继续使用，并补 TC39 固定规范证据。 |
| 一、数组公共模型 | **合并** | 只读数组、新数组容器和对象元素共享引用接到统一 State 心智模型，不重复对象课开场。 |
| 二、原地与非变异选择 | **完整保留** | 形成统一操作意图表，并明确原地方法可作用于刚创建且未共享的副本。 |
| 三、添加 | **完整保留** | 末尾、开头、多项添加使用展开或 `concat`；对象元素仍保持原身份。 |
| 四、删除 | **完整保留** | `filter` 的保留条件、按稳定 ID 与确实按索引删除的边界进入正文。 |
| 五、替换与转换 | **完整保留并校正术语** | `map` 是由回调结果构造新数组，不笼统称为浅复制；目标对象必须显式复制，所有分支都要返回值。 |
| 六、插入与 slice/splice | **完整保留** | 两段 `slice` + 展开、`splice` 原地语义和 `toSpliced` 返回完整新数组全部保留。 |
| 七、排序与反转 | **完整保留** | 先复制再 `sort` / `reverse`、数字比较函数和现代复制版本进入正文。 |
| 八、数组中的对象 | **完整保留** | 新数组不等于新元素对象；嵌套对象继续沿路径复制。 |
| 九、setter / updater | **压缩** | 只保留“依赖 pending State 时使用纯 updater”，不重复 batching 或队列求值。 |
| 十、Immer | **压缩为一句边界** | 不加依赖、不进 Demo、不展开 Proxy 或第三方 API。 |
| 十一、易错矩阵 | **合并去重** | `splice` 返回值、反向 `filter`、`map` 漏 return、直接重排和浅复制误解进入统一错误表。 |
| 十二、正文合同 | **吸收并更新** | 全部实质操作保留；生产叙事和相邻 API 继续排除。 |

### 8.3 旧《对象 State 更新》课程正文

| 现有部分 | 处置 | 具体要求 |
| --- | --- | --- |
| frontmatter | **替换身份** | 不复用旧 ID；新目标统一标题、summary、objectives、recap、sources、prerequisite 与 related。 |
| 学习目标与开场 | **合并去重** | 用一条对象 / 数组共同规则开场，不保留两个相似的“为什么单独学习”。 |
| 一、快照 | **压缩保留** | 只保留旧对象不可修改和相同引用边界，快照时序不重复展开。 |
| 二、setter 替换 | **完整保留** | 明确局部对象更新要复制保留字段，完整下一对象可以直接提交。 |
| 三、对象展开 | **完整保留** | 新外层、共享嵌套引用与后写覆盖先写值均为必讲内容。 |
| 四、顶层字段与 updater | **保留写法，压缩队列** | 直接值 / updater 选择只按是否依赖 pending State 判断；纯度保留。 |
| 五、嵌套对象 | **完整保留** | 从修改点向外逐层复制，并明确未变化分支可以结构共享。 |
| 六、计算属性名 | **保留为补充示例** | 使用 TypeScript 联合限制已知键，不扩写表单或运行时校验。 |
| 七、删除可选字段 | **保留** | 先复制再 `delete` 新副本；区分缺失、`undefined` 与空字符串。 |
| 八、替换与重置 | **保留并校正** | 完整替换保留；工厂 reset 作为 Demo 的确定性选择，不写成 React 强制规则。 |
| 九、共享引用 | **合并** | 与数组对象共享引用放在同一结构共享章节。 |
| 十、旧 Demo | **替换** | 旧 directive 退出，只保留新单一 Demo directive。 |
| 十一至小结 | **合并去重** | 错误、排查、练习、小结和来源按新课程完整范围重写。 |

### 8.4 旧《数组 State 更新》课程正文

| 现有部分 | 处置 | 具体要求 |
| --- | --- | --- |
| frontmatter | **替换身份** | 旧数组 ID 与对旧对象课的 prerequisite 一并退出。 |
| 学习目标与开场 | **合并去重** | 接在对象浅复制与变化路径之后，不重新讲一遍完整快照模型。 |
| 一、只读数组 | **保留主结论** | setter 替换、新数组容器和对象元素共享引用进入统一模型。 |
| 二、方法选择表 | **完整保留并扩充** | 同时列出基础写法与现代 copying methods。 |
| 三至五、增删替换 | **完整保留** | 展开、`concat`、`filter`、`map` 与回调返回边界全部进入正文。 |
| 六、插入 | **完整保留** | `slice` / `splice` / `toSpliced` 必须精确对照返回值与是否原地修改。 |
| 七、排序与反转 | **完整保留** | 先复制再重排、比较函数和调用结果进入正文；删除“漏括号即 updater”的低价值旁支。 |
| 八、对象元素 | **完整保留** | 新数组、新目标对象和更深嵌套对象的逐层复制必须都有示例。 |
| 九、updater | **压缩保留** | 只讲 pending 依赖与纯输入 / 输出。 |
| 十、现代方法 | **完整保留在正文** | 四个方法、负索引与越界边界进入正文；Demo 只用 `toSorted` 表达复制排序。 |
| 十一、Immer | **压缩为一句边界** | 不加第三方依赖。 |
| 十二、旧 Demo | **替换** | 旧 directive 退出，只保留新单一 Demo directive。 |
| 十三至小结 | **合并去重** | 错误、排查、练习、小结与来源按对象 / 数组统一规则重写。 |

### 8.5 旧对象 Demo 与样式

| 现有部分 | 处置 | 具体要求 |
| --- | --- | --- |
| `Profile` / 初始化工厂 | **吸收概念，改为 `BoardState`** | 新单一 State 保留顶层对象、嵌套偏好和确定性 reset。 |
| 切换名称 | **保留** | 作为只复制根对象的观察场景。 |
| 切换主题 | **保留并改名** | 使用 `preferences.compact` 展示根对象与嵌套对象逐层复制。 |
| 计算属性名、删除备注、完整替换 | **移到正文** | 保留知识，不让单一 Demo 的控制数量继续膨胀。 |
| 值展示与规则说明 | **合并** | 显示名称、密度和任务结果，不把两个旧 Demo 作为嵌套卡片拼接。 |
| 旧 Demo ID、目录和 directive | **退出** | 不保留别名、第二登记或旧 URL。 |
| CSS | **选择性吸收** | 保留 Flex、margin、按钮 focus / disabled 和移动端思想；不机械拼接两份容器样式。 |

### 8.6 旧数组 Demo 与样式

| 现有部分 | 处置 | 具体要求 |
| --- | --- | --- |
| `Task` / 初始化工厂 | **保留并并入 `BoardState`** | 三个稳定 ID、优先级和初始完成状态成为新 Demo 固定基线。 |
| 末尾添加、第二位插入 | **完整保留** | 分别观察数组展开与两段 `slice`。 |
| 切换首项、删除已完成 | **完整保留** | 分别观察 `map` + 目标对象展开与 `filter` 保留条件。 |
| 排序、反转 | **完整保留并统一基线** | 排序使用 `toSorted` 返回新数组；反转先复制数组，再对新副本调用 `reverse`。 |
| 顺序、总数、空状态 | **保留** | 作为浏览器可断言结果；空状态由删除序列自然覆盖，不新增业务 State。 |
| 旧 Demo ID、目录和 directive | **退出** | 行为并入新单一 Demo，不保留第二登记。 |
| CSS | **选择性吸收** | 保留列表、状态徽标、按钮和移动端正常流；不得使用 Grid、`gap` 或嵌套卡片结构。 |

## 九、旧资产退出与引用影响

### 9.1 历史证据保留

以下资产保留，不因路线退出而重写或删除：

- `docs/research/frontend/react/basics/updating-object-state.md`
- `docs/research/frontend/react/basics/updating-array-state.md`
- `docs/frontend/plans/react/RC1-基础课程官方事实核验.md` 中两课的历史闭环记录
- `docs/frontend/plans/react/React课程调整总计划.md` 中合并映射与执行日志

旧研究是本次合并的来源证据，RC1 文档是当时已发布状态的历史证据；它们不是 live 路由入口。

### 9.2 旧 ID 穷举审计

对 `updating-object-state` 与 `updating-array-state` 在 React 模块、React 计划和 React 研究目录执行精确
`rg` 穷举后，当前引用分为以下两类：

| 引用位置 | 当前引用 | 实施处置 |
| --- | --- | --- |
| `entry-manifest.ts` | 两个 Markdown meta import、两个 slug 和两个动态正文 import | 删除六处旧引用，加入新目标的一组 import / slug / load。 |
| `demo-manifest.ts` | 两个旧 Demo ID、两个 TSX component loader、两个 source loader | 删除两个登记，只加入 `immutable-state-demo`。 |
| `react-core-track.ts` | 两个相邻的 available 条目 | 替换为一个新目标 available 条目。 |
| `learn/updating-object-state.md` | 自身 ID 与旧对象 Demo directive | 文件退出，不能保留 live 自引用。 |
| `learn/updating-array-state.md` | 自身 ID、旧对象课 prerequisite 与旧数组 Demo directive | 文件退出，不能保留 live 自引用。 |
| `learn/controlled-forms.md` related | 同时引用两个旧 ID | 去重为一个新目标 ID。 |
| `learn/state-structure.md` related | 同时引用两个旧 ID | 去重为一个新目标 ID。 |
| 两个旧 Demo TSX | CSS import、旧 `data-testid` 和旧目录名 | 随目录退出；新 Demo 不复用旧测试身份。 |
| 两份旧 research | 各自课程 ID 和文件名 | 保留为历史研究，不注册为课程。 |
| `RC1-基础课程官方事实核验.md` | 两课旧 ID、research / lesson 路径和旧 Demo ID | 保留为历史闭环证据。 |
| `React课程调整总计划.md` | 两条旧 ID 到新目标的合并映射 | 保留并在完成后写入 B17 执行日志。 |
| `research/basics/use-state.md` | 旧的内容移动建议仍指向两份旧 research | 保留为当时研究处置记录，不是 live related / prerequisite。 |
| `tavily-availability-audit.md` | 两份旧 research 的历史检索状态 | 保留为研究审计证据。 |

本轮调研穷举时未发现其他 live manifest、Track、prerequisite 或 related 消费者。新目标在该时点只存在于
总计划和本研究，尚未出现在正文、Demo、manifest、Track 或迁移声明中；这与“调研闭环后再实施”的停止
边界一致。

### 9.3 退出与替换清单

| live 资产 | 实施处置 | 精确要求 |
| --- | --- | --- |
| `learn/updating-object-state.md` | 合并后删除 | 教学价值并入新正文；旧 URL 不重定向。 |
| `learn/updating-array-state.md` | 合并后删除 | 教学价值并入新正文；其旧对象课 prerequisite 随文件退出。 |
| `demos/updating-object-state/` | 合并后删除 | 不保留旧对象 Demo ID 或孤立样式。 |
| `demos/updating-array-state/` | 合并后删除 | 不保留旧数组 Demo ID 或孤立样式。 |
| `entry-manifest.ts` | 原子替换 | 删除两个旧 import / entry，加入新正文 import / entry。 |
| `demo-manifest.ts` | 原子替换 | 删除两个旧 Demo 登记，只加入一个新 Demo。 |
| `react-core-track.ts` | 原子替换 | 两个旧 available 条目合并为一个新 available 条目。 |
| `controlled-forms.md` related | 去重替换 | 两个旧 ID 替换成一次新目标 ID。 |
| `state-structure.md` related | 去重替换 | 两个旧 ID 替换成一次新目标 ID。 |
| `progress-migrations.ts` | 新增当前组 | target 为新目标，sources 只包含两个旧 published ID。 |

新正文路径固定为：
`src/categories/frontend/react/core/learn/immutable-state-updates.md`。

### 9.4 进度迁移组

新目标没有已发布的原有 ID，因此迁移组不得把 target 自己加入 `sourceEntryIds`：

```ts
{
  targetEntryId: 'react.core.learn.basics.immutable-state-updates',
  sourceEntryIds: [
    'react.core.learn.basics.updating-object-state',
    'react.core.learn.basics.updating-array-state',
  ],
}
```

- 两个旧来源都完成时，新目标可自动完成，因为本目标合并的是旧两课已经覆盖的必学范围。
- 只完成一个旧来源时，新目标保持未完成；已完成旧 ID 进入不计数的历史来源。
- `recentEntryId` 指向任一旧 ID 时迁移到新目标。
- 重复读取和重复应用迁移必须幂等；新目标完成后清理对应历史来源。
- 旧 ID 只允许继续出现在研究、历史计划、合并映射和迁移 sources 等明确历史 / 迁移表面，不能继续成为
  可访问课程、Demo、Track 条目、prerequisite 或 related。

## 十、课程正文合同

### 10.1 建议教学顺序

1. 从“JavaScript 可变对象”和“React State 只读快照”的张力建立问题。
2. 说明直接变异、相同引用和 setter 替换整个值。
3. 讲对象顶层展开、覆盖顺序和完整替换。
4. 讲浅复制、嵌套路径复制与结构共享。
5. 用操作意图表统一数组添加、删除、替换、插入、排序和反转。
6. 精确对照 `slice` / `splice` / `toSpliced`。
7. 用数组中对象说明“新数组不等于新元素对象”。
8. 对照“先复制再 sort / reverse”与 `toSorted` / `toReversed`。
9. 补充 `with` 的索引、负索引和越界边界。
10. 用纯 updater 收束依赖 pending State 的更新，不重讲队列。
11. 运行单一任务清单 Demo，完成一组嵌套对象和一组数组对象练习。

### 10.2 正文必须包含

- frontmatter、导航标题和 H1 统一为“State 的不可变更新”。
- 单一稳定 ID `react.core.learn.basics.immutable-state-updates`。
- 只读快照、setter 替换、相同引用、局部变异、浅复制、嵌套路径复制和结构共享。
- 展开、`concat`、`slice`、`filter`、`map`、`sort`、`reverse` 及四个现代 copying methods。
- 对象顶层、嵌套对象、数组容器和数组对象元素四种最小正确示例。
- 高价值错误示例、结果解释、练习、小结和实际使用的一手来源。
- 所有具名示例函数定义紧邻上方都有规范的简体中文职责注释。

### 10.3 正文不得包含

- Reducer、Context、Effect、Ref、缓存、服务端数据、请求同步或 React 内部实现教学。
- Immer 安装步骤、Proxy 实现或第三方状态库比较；最多一句可选工具边界。
- `structuredClone`、JSON 深克隆、递归冻结或“所有引用都必须变化”的错误规则。
- B17、批次、计划、迁移、测试、构建、复审、Gate、完成度或下一课等生产叙事。
- 稀疏数组练习、polyfill、浏览器支持表或完整 ECMAScript 抽象算法教学。

## 十一、单一 Demo 合同

### 11.1 身份与文件

- 目录：`src/categories/frontend/react/core/demos/immutable-state-updates/`
- TSX：`immutable-state-updates-demo.tsx`
- CSS：`immutable-state-updates-demo.css`
- Demo ID：`react.core.learn.basics.immutable-state-updates.immutable-state-demo`
- 标题：`State 的不可变更新示例`
- 运行与展开源码必须通过同一 manifest loader 指向同一 TSX 文件。

### 11.2 固定 State 形状

Demo 只使用一个 `useState<BoardState>`：

```ts
type BoardState = {
  name: string
  preferences: {
    compact: boolean
  }
  tasks: Task[]
}
```

初始值固定为名称“学习清单”、`compact=false`，以及三个稳定 ID 的任务：优先级分别为 `2`、`1`、`3`，
只有 ID `1` 初始为已完成。初始化与 reset 都调用创建新对象 / 新任务对象的工厂函数。

### 11.3 固定动作与写法

1. **切换名称：** 根对象展开，只覆盖 `name`，保留嵌套分支。
2. **切换紧凑模式：** 根对象和 `preferences` 逐层展开，复用 `tasks`。
3. **末尾添加：** 根对象展开，`tasks` 用数组展开追加新任务。
4. **第二位插入：** 根对象展开，`tasks` 用两段 `slice` 与展开插入新任务。
5. **切换首项完成状态：** 根对象展开，`map` 创建新数组，只展开目标 task。
6. **删除已完成：** 根对象展开，`filter` 保留未完成 task。
7. **按优先级排序：** 根对象展开，`previous.tasks.toSorted(compareFn)` 返回新数组，并以 ID 作为稳定
   次级排序键。
8. **反转顺序：** 根对象展开，`[...previous.tasks].reverse()` 只修改刚创建的新副本。
9. **重置：** 用工厂函数创建完整新 `BoardState`，同时恢复名称、偏好和任务。

所有 handler、初始化工厂和比较函数都必须在定义紧邻上方写简体中文职责注释。Demo 不使用输入控件，
避免提前教学后续表单主题。

### 11.4 可观察结果

| 场景 | 固定观察结果 |
| --- | --- |
| 初始 | 名称“学习清单”、普通密度、总数 `3`、顺序 `1 → 2 → 3`、ID `1` 已完成。 |
| 切换名称 | 名称切换，密度、数量、顺序与任务状态不变。 |
| 切换紧凑模式 | 密度文案与列表样式切换，名称和任务数据不变。 |
| 初始后末尾添加 | 新 ID `4`，总数 `4`，顺序 `1 → 2 → 3 → 4`。 |
| reset 后第二位插入 | 新 ID `4`，总数 `4`，顺序 `1 → 4 → 2 → 3`。 |
| reset 后切换首项 | ID `1` 变为未完成，其他任务状态和顺序不变。 |
| reset 后删除已完成 | ID `1` 被删除，总数 `2`，顺序 `2 → 3`。 |
| reset 后排序 | 顺序按优先级 / ID 变为 `2 → 1 → 3`。 |
| reset 后反转 | 顺序变为 `3 → 2 → 1`。 |
| 任意操作后重置 | 恢复完整初始值，不复用被操作过的任务对象。 |

### 11.5 Demo 禁区

- 不登记第二个 Demo，不把旧两个 Demo 作为嵌套卡片拼起来。
- 不使用 `useReducer`、Context、Effect、Ref、memoization、缓存、请求或服务端数据。
- 不调用 `splice`、`sort` 或 `reverse` 直接修改 `previous.tasks`。
- 不使用第二份业务 State、模块级可变变量或 DOM 查询保存观察结果。
- 不实现深克隆、冻结探针、代理对象或 React 内部更新模拟器。
- 现代 copying methods 只在 Demo 中使用 `toSorted`；其余方法由正文最小代码和练习负责。
- CSS 只使用 Flexbox、margin 与普通文档流，不使用 Grid 或 `gap`，不借合并重做视觉系统。

## 十二、实现验证合同

### 12.1 临时自动化验证

1. 在 `/tmp` 的 `mktemp` 目录创建最少临时脚本，调用生产 Markdown 校验入口读取新正文。
2. 断言 ID、标题、prerequisite、objectives、recap、sources 与单一 Demo directive 一致。
3. 断言 entry / demo manifest 和 Track 只有新目标，两个旧目标不再可访问。
4. 精确核对旧 ID 的剩余出现位置；允许历史研究、RC1 记录、总计划映射和 progress migration sources，
   禁止 live prerequisite / related / entry / demo / Track 残留。
5. 使用临时测试覆盖迁移组的两个旧课全完成、部分完成、最近访问、幂等与历史来源清理；不在仓库保留
   测试文件。
6. 用当前 TypeScript 配置验证目标 Demo；核对所有函数定义上方的简体中文职责注释。
7. 聚焦扫描 CSS，确认没有 Grid 布局和 `gap` 属性。
8. 比较 Demo 展开源码与磁盘 TSX 的规范化字符、字节和 SHA-256，证明运行与展示同源。
9. 运行 type-check、lint、聚焦 Prettier、build 和限定 staged / unstaged `git diff --check`；全仓无关
   dirty blocker 与本目标结果分开报告。
10. 验证成功后删除 `/tmp` 临时目录，不改动 `tests/unit/` 或 `tests/e2e/`。

### 12.2 浏览器验收

使用可复跑的 Playwright 流程验证正式深链：

1. 新 URL 能直接打开，页面标题和导航均为“State 的不可变更新”。
2. 两个旧 URL 不重定向，按现有规则显示内容不存在。
3. 按 `11.4` 每个场景先 reset，再断言固定名称、密度、总数、顺序和完成状态。
4. 操作只改变目标字段；例如切换名称不改变任务，切换紧凑模式不改变任务数据。
5. 展开源码与运行源码同源，并能看到顶层展开、嵌套展开、`slice`、`map`、`filter`、`toSorted` 以及
   新副本上的 `reverse`。
6. 展开源码不出现排除 API、旧 Demo import、深克隆或直接修改 `previous` 的写法。
7. 前后导航、目录、related 与 prerequisite 不出现两个旧课程入口。
8. `1440x900`、`390x844` 与 `390x844 + 32px` 根字号均无横向溢出、文本裁切、按钮标签越界或内容
   重叠。
9. console error / warning、page error、失败请求和 `>=400` 响应均为 `0`。

## 十三、研究结论与停止点

React `19.2.8` 的对象与数组 State 可以用同一条公开规则教学：把当前 State 当作某次 render 的只读
快照，创建下一外层容器，只复制实际变化路径，并把下一值交给 setter。对象展开与所有数组 copying
操作都只创建浅副本；未变化分支可以结构共享，变化的嵌套对象必须得到新引用。数组操作应按意图选择：
展开 / `concat` 添加，`filter` 删除，`map` 或 `with` 替换，`slice` + 展开或 `toSpliced` 插入，
新副本上的 `sort` / `reverse` 或 `toSorted` / `toReversed` 完成重排。

实现时创建新课程身份和一个任务清单 Demo，保留两份旧 research 与 RC1 历史证据，退出两份旧正文、
两个旧 Demo 目录及所有 live 入口。进度迁移 target 固定为
`react.core.learn.basics.immutable-state-updates`，sources 只包含两个旧 published ID；旧 URL 不建立
重定向。

本轮调研完成时只创建了本研究文件，未修改课程正文、Demo、样式、manifest、Track、迁移实现、计划或
完成状态，也未进入 BL2 或任何后续课程。
