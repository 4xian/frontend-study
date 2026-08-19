# B11「列表渲染与 key」官方研究记录

## 研究状态与冻结边界

- 课程 ID：`react.core.learn.basics.list-rendering-and-key`
- 左侧短标题：`列表渲染与 key`
- 研究对象：React Core RC3 的 B11 单知识点；只覆盖列表生成、筛选与 key 身份。
- 研究日期：`2026-08-15`
- React 文档基线：React `19.2` 官方文档。
- React 源码基线：React/React DOM `v19.2.8`。
- TypeScript 资料基线：TypeScript `v6.0.2` 官方声明与 Handbook。
- 生产写回边界：本轮只允许写入本文件；不修改正文、Demo、CSS、entry/demo manifest、Track、计划、测试、依赖或 B12 资产。

开始研究前，live B11 资产与 `/tmp/react-b11-baseline.K9hg7q` 逐字节一致：

| 文件 | 基线 SHA-256 |
| --- | --- |
| `docs/frontend/plans/react/React课程调整总计划.md` | `c60a3059e3317d349a3dfc74200d8fd0262d07769220c037edbddeb0617648f2` |
| `src/categories/frontend/react/core/react-core-track.ts` | `226df9762c4c7af835d254aa706a959e081c06a4bafc2975ccd6a856ad712b65` |
| `src/categories/frontend/react/core/entry-manifest.ts` | `c75a05ac153a9f2002e9727f65815a74eeb6bce677a4588fb46d942b611f413b` |
| `src/categories/frontend/react/core/demo-manifest.ts` | `447f53211fba396fa2feb6fc8cb8da11e2a548cfbdf3d3d246e29f3d66c7e90c` |
| B11 lesson | `5996b84d2c6e9a3b0103c7427d5cc773d2c815b0a9d1c35c06729d68cede3b4d` |
| B11 Demo TSX | `df47eb65bb978fdaacbc1fadc861f9c41c16fbfebb19de498725193794c968cb` |
| B11 Demo CSS | `adaba0dc432f18f8874cd18a887128562d4c6d2c801ce0eb5a176556ff18d00e` |
| 本研究文件与基线 `research.md` | `b5cd34c52c28839f1e40816e1a7ea68839f1f0a38391766ed0e36ddbfecf22dc` |

当前 Git 中本研究文件原本是 staged `A`，工作区还有大量外部 A/AM/M 资产；这些状态均受保护，本研究不执行暂存、提交、清理或恢复。

## 来源与检索说明

Tavily 按仓库规定先尝试了 React、TypeScript、React 源码/测试和 ECMAScript/MDN 的官方域名搜索；五次请求均返回同一配额错误：`This request exceeds your plan's set usage limit`。随后按规定切换 Exa 仅定位 URL，并对已知官方 URL 使用 `curl -L --fail --silent --show-error` 核验内容。下表只收录一手来源；Exa 不作为事实来源。

| ID | 一手来源 | 固定范围 | 本记录采用的证据 |
| --- | --- | --- | --- |
| `R01` | [React Rendering Lists](https://react.dev/learn/rendering-lists.md) | React 文档 `19.2` | `map`/`filter`、直接列表子项的 key、兄弟级唯一、稳定来源、重排/插入/删除、索引和随机 key、key 不传入组件、Fragment。 |
| `R02` | [Rendering Lists 固定文档提交](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/rendering-lists.md) | 提交 `c7d6b700038c63d1aaf2c649af1aefe01ebbacac` | 固定本课主线和官方警告措辞；正文不绑定实现内部名称。 |
| `R03` | [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state.md) | React 文档 `19.2` | 仅核对 key 的“父级内位置”边界；State 保存/重置不进入 B11 正文。 |
| `R04` | [Fragment](https://react.dev/reference/react/Fragment.md) | React 文档 `19.2` | 显式 `<Fragment key={...}>` 支持 key；简写 Fragment 无属性位置；Fragment 不增加 DOM wrapper。 |
| `R05` | [Special Props Warning](https://react.dev/warnings/special-props.md) | React 文档 `19.2` | `key` 和 `ref` 是 React 特殊 props，不转发给组件；业务 ID 必须另传。 |
| `R06` | [`ReactChildFiber.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactChildFiber.js) | React `v19.2.8` | 开发环境缺失/重复 key 诊断的调用边界；当前匹配查找有 key 用 key、无 key 用位置。仅作版本证据，不写入课程内部算法。 |
| `R07` | [`ReactChildReconciler-test.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactChildReconciler-test.js) | React DOM `v19.2.8` | 重复 array/iterable key 的官方测试与“不受支持、可能重复或遗漏”的原文。 |
| `R08` | [`ReactJSXElement.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/jsx/ReactJSXElement.js) | React `v19.2.8` | JSX element 读取 key 后转为字符串并从普通 props 排除；内部实现不是教学 API。 |
| `R09` | [`ReactChildren.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactChildren.js) | React `v19.2.8` | 当前遍历路径会转义用户 key；编码格式不是公共合同，正文不展开。 |
| `R10` | [TypeScript Everyday Types](https://github.com/microsoft/TypeScript-Website/blob/v2/packages/documentation/copy/en/handbook-v2/Everyday%20Types.md) | TypeScript 官方 Handbook | `T[]` 与 `Array<T>` 表达数组；联合类型的最小背景。 |
| `R11` | [TypeScript Narrowing](https://github.com/microsoft/TypeScript-Website/blob/v2/packages/documentation/copy/en/handbook-v2/Narrowing.md) | TypeScript 官方 Handbook | 可辨识联合由共有字面量属性缩窄；B11 只保留简单数据对象，不讲类型体操。 |
| `R12` | [`lib.es5.d.ts`](https://github.com/microsoft/TypeScript/blob/v6.0.2/src/lib/es5.d.ts) | TypeScript `v6.0.2` | `ReadonlyArray<T>.map`/`filter` 的静态签名；`filter` 谓词可缩窄结果。 |
| `R13` | [`lib.es2023.array.d.ts`](https://github.com/microsoft/TypeScript/blob/v6.0.2/src/lib/es2023.array.d.ts) | TypeScript `v6.0.2` | `Array` 和 `ReadonlyArray` 的 `toSorted` 静态签名；不证明运行时存在。 |
| `R14` | [ECMAScript 2025 Indexed Collections](https://tc39.es/ecma262/2025/multipage/indexed-collections.html) | ECMAScript 2025 规范 | `Array.prototype.map` 对每项调用回调并构造结果数组；`filter` 构造通过测试的新数组。 |
| `R15` | [MDN `Array.prototype.map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) | MDN JavaScript Reference | `map` 返回新数组，回调返回值成为对应成员；不直接修改 receiver。 |
| `R16` | [MDN `Array.prototype.filter()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) | MDN JavaScript Reference | `filter` 返回通过测试的新浅拷贝数组。 |
| `R17` | [MDN Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) | MDN JavaScript Reference | 箭头函数 expression body 隐式 return；block body 必须显式 `return`。 |

## 单知识点合同

B11 只回答两个连续问题：

1. 如何用普通 JavaScript 数组的 `filter`/`map` 把数据选择并转换为 React node 列表。
2. 为什么每个直接列表项需要来自数据且在同级兄弟集合中稳定的 `key`，以及插入、删除、重排时它表达的匹配身份。

以下内容明确不属于 B11：事件处理、State 创建或更新、不可变数组更新、组件纯度、副作用、Memo、虚拟化、服务端/并发、Reconciliation/Fiber 内部算法、后续课程顺序或计划叙事。`Fragment`、特殊 prop 和开发警告只讲完成 key 合同所需的最小边界。

## 逐 claim 事实账本

| Claim | 可写入课程的事实 | 来源 | 生产措辞与边界 |
| --- | --- | --- | --- |
| `C01` | `map` 对输入数组中存在的每项调用回调，并把回调结果组成新数组；React 可消费该数组作为 children。 | `R01`, `R14`, `R15` | 说“数组转换为 node 列表”，不说存在 React 专属循环语法。空数组得到空结果；不延伸稀疏数组细节。 |
| `C02` | `filter` 对每项执行布尔测试，返回只含通过项的新浅拷贝数组；再调用 `map` 可表达“先筛选、后渲染”。 | `R01`, `R14`, `R16` | 保留 `filter(...).map(...)`；不把浅拷贝误写成对象深复制。 |
| `C03` | 箭头函数单个 expression 或圆括号体隐式返回；使用 `{}` block body 时必须显式 `return`。 | `R17` | 保留一个“漏 return”错误例；不把 JSX 语法错误和回调返回 `undefined` 混为一谈。 |
| `C04` | 直接位于 `map` 调用返回值中的 JSX list item 需要 key。 | `R01`, `R06` | key 应放在数组直接返回的 element（包括组件 element）上；不把组件内部 DOM 的 key 当作父列表 key。 |
| `C05` | key 让 React 知道某个 array item 对应哪条数据；数组项移动、插入或删除时，稳定 key 比位置提供更多身份信息。 | `R01`, `R06` | 课程只说“同级列表前后两次结果的匹配身份”；不讲 Fiber、reconciliation、State 保存或重置算法。 |
| `C06` | key 只需在同一父级的兄弟项之间唯一；不同数组可以复用同一 key。 | `R01`, `R03` | 不写“全应用唯一”或“全局路径”；嵌套列表不展开为独立知识点。 |
| `C07` | key 不得在 render 时变化；应从数据取得，常见是数据库 ID，或在本地数据创建时生成并保存的 ID。 | `R01` | “稳定”是跨同一项目的 render/列表变化保持相同，不要求 key 在所有业务集合全局唯一。 |
| `C08` | 索引 key 在项目插入、删除或重排的动态列表中会随位置改指其他数据，容易造成隐蔽错误。 | `R01`, `R06` | 官方示例承认永不重排的静态诗行是罕见可接受例；课程不写“任何情况下绝对禁止”，而是要求动态数据优先用身份 ID。 |
| `C09` | `Math.random()` 等每次 render 生成的 key 无法跨 render 匹配，会导致列表项目重新创建并可能丢失用户输入。 | `R01` | “随机 ID 在数据创建阶段生成并持久化”与“render 内随机 key”必须区分；本课不做输入/State 演示。 |
| `C10` | key 不会作为普通 prop 传给组件；组件需要同一业务 ID 时，应另传 `itemId`/`courseId`。 | `R01`, `R05`, `R08` | 不写 key 是 DOM `id`、`data-*` 或可在组件中读取的业务字段。 |
| `C11` | 多节点列表项可用显式 `<Fragment key={item.id}>...</Fragment>`；`<>...</>` 简写不能接收 key，Fragment 不产生额外 DOM wrapper。 | `R01`, `R04` | 只讲列表分组所需的显式 key；不讲 Fragment ref、布局或 State 语义。 |
| `C12` | React 19.2.8 的 JSX element 在创建时把 key 作为特殊字段处理，并从普通 props 排除；当前实现可把输入 key 转成字符串。 | `R05`, `R08` | 字符串化和内部转义只作研究证据；课程不依赖编码格式，也不允许读取/拼接内部 key。 |
| `C13` | React 开发环境会对动态 array/iterable child 中缺失 key 的 React element/portal 进行 key 诊断；源码的缺失警告会按 owner/组件上下文去重。 | `R01`, `R06`, `R07` | 课程可说“开发警告提示缺失 key”，不能承诺每个缺失项逐一打印，也不能把警告当运行时业务校验。 |
| `C14` | React 开发环境会对同一 array/iterable children 中重复 key 诊断；官方测试覆盖 array 与 iterable。重复 key 的 children 可能重复或遗漏，行为不受支持。 | `R06`, `R07` | 必须保留“不受支持、结果不可依赖”；不能写成某一项必然覆盖或某一项必然保留。 |
| `C15` | 警告只覆盖 React 当前开发诊断边界；没有警告不等于业务 key 稳定、唯一或适合重排。 | `R01`, `R06`, `R07` | 生产代码不能根据 warning 是否出现决定业务逻辑；索引和会变化的标题可能不触发重复警告仍然错误。 |
| `C16` | React 文档把 key 的公开输入描述为 string 或 number；静态类型通过也不证明业务 key 唯一、稳定或适合重排。 | `R01`, `R05`, `R08`, `R12` | B11 示例统一 string/number 稳定 ID；不把额外的类型宽度当作推荐 key 设计。 |
| `C17` | TypeScript 用 `Item[]` 或 `Array<Item>` 表达数组；`ReadonlyArray<Item>.map`/`filter` 接受只读数组并返回结果数组。 | `R10`, `R12` | 只用于标注 `readonly Item[]` 输入和稳定 `id` 字段；静态类型不检查同级 key 唯一性或跨 render 稳定性。 |
| `C18` | TypeScript 的可辨识联合依靠共有字面量字段缩窄；这不是 B11 的 key 合同。 | `R11` | 研究记录保留来源以防数据类型误导；正文不扩展 `kind`/联合类型课程。 |
| `C19` | `map`/`filter` 的新数组只改变数组容器；对象成员仍是浅层引用。 | `R14`, `R15`, `R16` | 可用一句边界说明防止“新数组等于深复制”的误解；不进入不可变更新或对象 State。 |
| `C20` | `sort`、`toSorted`、原地输入修改不是 B11 的必要事实。 | `R13`, `R14` | 现有正文的排序章节、`sort`/`toSorted` 练习和 Demo 排序应删除或移出本课；不要用此研究记录给 B11 增加数组更新课程。 |

## 缺失/重复 key 警告的精确边界

这是实现合同，不应压缩成“有 key 就没有警告”：

1. `ReactChildFiber.js` 的 `warnOnInvalidKey` 只在开发分支对 React element、portal（以及解析后的 lazy child）检查；它在数组和可迭代子项协调路径上被调用。文本节点本身没有 key，不应写成“每个 child 包括字符串都必须有 key”。
2. 缺失 key 的官方文案是 `Each child in a list should have a unique "key" prop.`，并可能附带组件栈；源码通过 `_store.validated` 和 owner/组件名避免重复输出。因此课程应说“开发环境给出诊断”，不承诺警告数量。
3. 重复 key 的官方文案是 `Encountered two children with the same key`，React DOM `v19.2.8` 测试覆盖数组和 iterable。文案明确指出 children 可能 duplicated/omitted，且行为 unsupported；课程不能推演固定 DOM 结果。
4. React 文档的“直接在 `map` 中的 JSX 需要 key”是作者合同，源码警告是开发诊断实现；生产环境是否打印警告不是应用逻辑合同。
5. 没有 warning 不能证明 key 的业务稳定性：索引、标题、排名等值可能在变化列表中错误地表达身份却仍然互不重复。

## 现有 B11 资产审计与实施合同

### 计划、Track、entry manifest、demo manifest

基线中的 B11 计划行是：`B11 | react.core.learn.basics.list-rendering-and-key | 列表渲染与 key | 复用 | map、filter、稳定 key、身份与重排`。Track 将该 ID 标为 `available`；entry manifest 以 slug `list-rendering-and-key` 加载同名 lesson。Demo manifest 已登记稳定 ID `react.core.learn.basics.list-rendering-and-key.data-identity-demo`，运行组件和展示源码都来自 `./demos/list-rendering-and-key/list-rendering-and-key-demo.tsx` 的同源加载器。以上契约与研究目标一致，本轮不改 manifest、Track 或计划。

计划中的 B11 完成/下一课指针属于生产流程叙事；它不能进入正式课程正文。B12 不在本轮读取、审计、修改或授权范围内。

### 正文逐项合同

当前正文 `title` 已是短标题“列表渲染与 key”，frontmatter 的 B11 ID、React 19.2 应用范围和 key/map/filter 标签可保留。需要按以下合同实施：

| 当前内容 | 处置 | 实施要求 |
| --- | --- | --- |
| “数组到 JSX”的开场、`map` 直接渲染、数据对象带 `id` | 保留 | 作为唯一主线，先给最小 `Item[] -> map -> JSX` 模型。 |
| 箭头函数隐式/显式 return 与漏 return | 保留并收窄 | 保留一个 expression body 与一个 block body 示例；不要引入额外控制流。 |
| 抽取 `CourseRow`、key 放在 map 直接返回的组件 element | 保留 | 这是 key 放置位置的高价值合同；业务 ID 另传普通 prop。 |
| `filter` 后 `map`、条件选择说明 | 保留 | 只讲“保留谁”与“怎样映射”；删除对复杂条件性能的讨论。 |
| 原地 `sort`、`toSorted`、Props 纯度、排序练习 | 删除 | 属于数组更新/组件纯度，不是 B11 列表生成与 key 身份。 |
| 嵌套章节 | 收窄或删除 | 只保留一句“每个父级的直接 children 各自有兄弟 key”作为边界；不要展开章节/课程嵌套模型。 |
| 插入、删除、重排下的稳定 key | 保留 | 用静态前后列表示意“同一数据仍带同一 ID”；不讲 State 保存或 Fiber。 |
| key 兄弟级唯一、稳定来源、index/random/可变展示字段 | 保留 | 使用官方措辞；index 保留静态永不重排的罕见例外。 |
| Fragment 显式 key、key 不进 Props | 保留 | 仅覆盖列表多节点和业务 ID 另传。 |
| “React 协调实现”“Fiber、Map、转义内部路径”章节 | 删除 | 研究证据可留在本文件，正式课程不得出现 Reconciliation/Fiber 内部算法。 |
| 现有 State、后续课程、计划、任务、批次、停止点、测试节点等生产叙事 | 删除 | 正文只保留知识与验收；不得提 B11/B12、Track、路线完成度、审查或 signoff。 |
| `@types/react@19.2.18`、TypeScript 7.0.2 版本叙事 | 删除/改为 TS 6.0 最小类型提示 | 本轮官方资料固定 TS 6.0.2；正文只需要 `readonly Item[]` 与 `id` 字段，不扩大版本矩阵。 |
| 练习中的排序副本、时长排序、输入数组不变 | 删除 | 练习改为 filter/map、稳定 `id`、直接 children key、Fragment 和另传业务 ID。 |

正式课程最终不应出现“sort/toSorted、render 纯度、State 重置、组件树内部协调、后续顺序”等章节或验收条件。研究文件可以保留本表作为生产处置合同。

### Demo 精确合同

Demo 稳定 ID 必须保持 `react.core.learn.basics.list-rendering-and-key.data-identity-demo`；运行组件与展示源码必须继续由同一 TSX 源文件加载，禁止复制另一份仅用于展示的代码。

保留/调整如下：

1. 保留 `readonly Course[]` 的稳定 `id`、标题和最小展示字段；保留 `filter` 生成已发布子集，再用 `map` 输出列表内容。
2. 保留 `CourseRow` 的直接列表 key：`<CourseRow key={course.id} courseId={course.id} ... />`；保留 `Fragment` 的显式 `<Fragment key={rule.id}>` 对照，说明 key 不自动进入 Props。
3. 删除运行中的 `.sort()`、`toSorted`、时长排序摘要和任何与数组更新/纯度相关的文字；本课只需原始列表与过滤列表，不需要排序算法。
4. 增加静态对照（可以是展示代码或说明文本，不要作为运行列表）：`key={index}` 在插入/删除/重排时改指位置，`key={Math.random()}` 每次 render 改变。对照不得故意挂到运行中的列表上制造 warning。
5. 增加静态“重排观察点”：展示同一组数据从 `A, B, C` 变成 `B, C, A` 时，稳定 `id` 仍分别跟随原项目；不使用按钮、输入、State、Effect、随机运行时或身份重置交互。
6. 删除所有 `data-testid`、测试断言语气和测试专用文本；可保留可访问的语义标签、列表和普通说明文本。Demo 不承担自动化测试契约。
7. CSS 继续使用现有 Flexbox、margin、普通流；禁止 CSS Grid 和 `gap`。不为静态对照新增复杂布局或动画。

### 课程停止点

课程到“数组转换完成、直接列表项带稳定兄弟 key、Fragment/特殊 prop 边界和静态重排观察”即停止。不得以本课为入口讲事件、交互、State、数组更新、性能、并发、服务端或下一课。

## 不采用的结论

1. “key 必须在整个应用中全局唯一”不成立；官方范围是同一父级的兄弟集合。
2. “key 只是为了消除 warning/性能优化”不完整；官方说明它用于识别数组项并在变化时匹配。
3. “任何情况下都不能用 index”过强；官方保留永不重排的静态列表这一罕见例外。
4. “随机 key 能安全刷新列表”不成立；render 内随机 key 会使项目无法跨 render 匹配。
5. “key 会自动成为组件 prop、DOM id 或 data attribute”不成立。
6. “重复 key 必然保留第一项/最后一项”不成立；React 官方把结果标为 unsupported，可能 duplicated/omitted。
7. “没有 warning 就证明 key 正确”不成立；warning 不能证明业务字段稳定。
8. “TypeScript 的 key 类型能证明唯一、稳定”不成立；类型只约束静态形状。
9. “研究到源码中的 Fiber/Map/key 转义格式即可讲内部算法”不成立；这些是版本实现证据，不是 B11 公共 API。

## 验收与回写记录

- 研究文件须以官方链接逐 claim 可回溯；本记录已覆盖 `map`、`filter`、箭头 return、直接 key、兄弟级唯一、稳定 ID、插入/删除/重排、key 特殊 prop、显式 Fragment、缺失/重复 warning 边界、index/random 限制与 TypeScript 数组类型。
- 正文合同必须保持左侧短标题“列表渲染与 key”，并删除本记录标为删除的排序、纯度、嵌套、State、内部算法和生产流程叙事。
- Demo 合同必须保持稳定 ID、同源运行/展示源码、无 Grid/`gap`，并删除运行排序、`data-testid` 和无关交互/测试语言。
- 本轮实现后只对本研究文件运行聚焦 Prettier；执行该文件的 unstaged 与 staged `git diff --check`。不运行会触碰其他批次的写回或清理命令。
- 本轮不授权 B12，不改变计划/Track/manifest，也不提交任何代码。
