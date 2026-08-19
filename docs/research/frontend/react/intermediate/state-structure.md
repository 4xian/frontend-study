# I01「State 结构」官方研究记录

## 一、Live 基线与执行边界

- 课程 ID：`react.core.learn.intermediate.state-structure`。
- 本次研究目标与建议短标题：`State 结构`。
- 教学层级：React Core 中级，本科前端课程范围。
- 研究日期：`2026-08-16`。
- React 官方文档基线：React `19.2`。
- 仓库运行时基线：React / React DOM `19.2.8`。
- 类型基线：TypeScript `6.0.3`、`@types/react 19.2.18`。
- 本轮写入边界：只更新本研究文件；不修改学习者正文、Demo、CSS、entry/demo manifest、Track、
  总计划、进度迁移或下一课资产。

当前 live 资产已经存在并登记：

| 资产 | Live 状态 |
| --- | --- |
| `learn/state-structure.md` | 已有 699 行详细正文，标题为“State 结构”，状态为 `available`。 |
| `demos/state-structure/state-model-demo.tsx` | 已有工单编辑 Demo，包含对象草稿、互斥提交状态和分类 ID。 |
| `demos/state-structure/state-model-demo.css` | 已有 Flexbox / 普通文档流样式，没有 `grid` 或 `gap`。 |
| `entry-manifest.ts` | 已登记 `state-structure`，位置在 BL3 后、旧 `derived-values` 前。 |
| `demo-manifest.ts` | 已登记 `state-model-demo`，当前只展示 `.tsx` 源码。 |
| `react-core-track.ts` | I01 与旧 `derived-values`、`lifting-state-up` 均仍为 `available`。 |

`available` 只说明旧资产可访问，不代表 I01 已按当前路线完成调研、正文修订、浏览器验收或复审。

### 路线合同

当前权威路线明确由 I01 吸收旧“派生值”，课程内部继续使用简短标题“State 结构”。本课需要把两部分
连成一条主线：先设计只保存必要事实的 State 形状，再从这些事实同步计算显示结果。I02 是 State 提升与
受控边界，不承担派生值教学。

旧 `derived-values` 的正确内容需要合并进入本课，旧条目的退出、进度迁移和 manifest 调整由主任务在
实现阶段处理。学习者正文不能出现 I01、I02、合并、迁移或计划说明。

## 二、本课范围与排除项

### 1. 必须完整覆盖

1. State 结构是“需要记住的事实、事实之间的约束以及实体关系”的组合，不是页面字段清单。
2. 相关 State 何时合并，互不相关的 State 何时保持独立。
3. 多个布尔值或可选字段如何产生互相矛盾的组合。
4. 如何用单个状态枚举或 TypeScript 判别联合表达合法状态及其附带数据。
5. 可由当前 Props / State 同步计算的值为什么不应重复保存，以及怎样在 render 中直接计算。
6. 同一实体为什么不应在多个 State 中复制，选择关系为什么通常只保存稳定 ID。
7. JavaScript 对象引用与“看起来嵌套”的区别；共享引用如何造成重复修改风险。
8. 深层嵌套 State 的更新成本，以及规范化 / 扁平化的结构与适用条件。
9. 稳定实体 ID、列表 `key` 和对象引用三者的区别。
10. State 形状如何影响不可变更新需要复制的路径和更新复杂度。
11. State 不变量的定义，以及每个更新入口如何保持合法状态、引用完整性和唯一来源。
12. 同步派生计算的输入、输出、纯度和重新计算时机。
13. 用冗余 State 和 Effect 同步派生结果为什么会先 render 旧结果，再触发额外 render。
14. `useState(prop)` 的初始化语义、错误 Props mirror 与有意初始快照合同。

### 2. 明确排除

- 不重新教学对象展开、数组 `map` / `filter`、嵌套逐层复制等 B17 完整不可变更新 API。
- 不重新教学 B21 的最小 State 识别流程、所有者算法、最近共同父组件或完整单向数据流。
- 不教学昂贵计算测量、`useMemo`、依赖比较、memoization 或其他性能缓存；普通同步派生必须完整覆盖。
- 不教学 State 提升、受控 / 非受控组件合同或组件 API 设计。
- 不教学 State 的位置身份、`key` 重置机制；只说明它与实体 ID 不是同一问题。
- 不引入 Reducer、Action、Context、Effect API、Ref、外部 Store 或第三方状态库；只展示 Effect 同步
  派生结果这一反模式的最小对照，不讲 Effect 签名、依赖或生命周期。
- 不引入服务端状态、数据请求、持久化、路由、数据库范式或缓存一致性。
- 不把判别联合扩展成完整 TypeScript 类型系统课程。
- 不把规范化扩展成图算法、循环检测、级联删除框架或数据库设计课程。
- 不讨论 React 内部 Fiber、Hook 链表或未文档化实现。

## 三、研究方法与版本边界

1. 先核对总计划 I01 / I02 行、逐课合同、内容规范和用户新增的内容要求，再读取当前正文、Demo、
   manifests、Track、B17、B21 与 BL3 的 live 资产。
2. 外部搜索严格从 Tavily 开始。`2026-08-16` 的官方 React 查询因账户用量上限失败，没有返回候选；
   按仓库顺位切换到 Exa。Exa 搜索成功发现所需官方 URL，随后成功抽取 10 个 `react.dev` 页面和 1 个
   TypeScript 官方 Handbook 页面；没有继续切换 Parallel、Perplexity 或原生 Web 搜索。
3. 搜索摘要只用于发现与定位。事实账本只采用 React 官方文档和 TypeScript 官方 Handbook，不采用
   社区文章、第三方教程或 AI 总结。
4. `react.dev/versions` 说明站点提供当前 major 内持续更新的最新文档，不为每个 minor / patch 发布独立
   文档快照。因此正文可以写仓库适用 React `19.2.8`，来源卡必须准确标注公共 Learn 页面基线为
   React `19.2`，不能声称每条 Learn 结论是 `19.2.8` patch 专属行为。
5. 本课研究的是公开数据建模原则。React 内部源码不会比官方 Learn 文档提供更强的公共合同，故不使用
   Fiber 或 Hook 存储实现支撑正文。

## 四、一手来源卡

| ID | 一手来源 | 本课采用范围 |
| --- | --- | --- |
| `R00` | [React Versions](https://react.dev/versions) | 当前 React 官方文档基线为 `19.2`，同一 major 内持续更新，不为每个 patch 单独冻结文档。 |
| `R01` | [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) | 相关 State、矛盾、冗余、重复、深层嵌套、Props mirror、ID 选择和扁平化五条核心原则。 |
| `R02` | [Updating Objects in State](https://react.dev/learn/updating-objects-in-state) | 对象 State 视为只读、对象展开是浅复制、嵌套更新需要沿路径复制、对象之间是引用关系。 |
| `R03` | [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state) | 数组 State 视为只读、数组复制仍共享对象元素、更新数组实体时需要新数组和新目标对象。 |
| `R04` | [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) | State 与组件在 render tree 中的位置关联；类型或 `key` 变化可重置组件 State。只用于划清边界。 |
| `R05` | [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) | 共享事实移动到最近共同父组件、值和 handler 通过 Props、每项 State 单一事实来源。只用于与 B21 / 提升课去重。 |
| `R06` | [Rendering Lists](https://react.dev/learn/rendering-lists) | `key` 在同级列表中标识项目，稳定数据 ID 优于 render 时生成值；`key` 不会作为普通 Prop 传入。 |
| `R07` | [`useState`](https://react.dev/reference/react/useState) | `initialState` 初始化后被忽略、setter 请求下一次 render、对象和数组应替换而非变异、相同值可被 `Object.is` 跳过。 |
| `R08` | [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) | 数据转换应在 render 中完成；用 Effect 同步冗余 State 会先产生旧结果，再引发级联 render。 |
| `R09` | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | render 计算应幂等、无副作用且不修改 Props、State 或其他非局部值。 |
| `T01` | [TypeScript Narrowing: Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) | 共同字面量判别属性可以构成判别联合，检查该属性后 TypeScript 收窄到对应成员。 |

## 五、逐 Claim 事实账本

| Claim | 可进入课程的准确表述 | 一手证据 | 性质 |
| --- | --- | --- | --- |
| `C01` | State 结构需要决定 State 变量数量及每份数据的形状；结构目标是让更新更容易且减少错误。 | `R01` Principles | 官方直接陈述 |
| `C02` | 两个或更多 State 若总是在同一更新中一起变化，可以考虑合并成一个对象或数组。 | `R01` Group related state | 官方直接陈述 |
| `C03` | “可以考虑合并”不是“所有字段必须放进一个大对象”；无关 State 可以保持多个变量。 | `R01` Group related state；`R07` 用法示例 | 官方事实的精确边界 |
| `C04` | 对象 State setter 接收下一份完整值，不会自动补入遗漏字段；更新一个字段要显式保留其他字段。 | `R01` Group related state；`R02` Copying objects | 官方直接陈述 |
| `C05` | 多个独立布尔值可表达业务上不可能的组合；单个 `status` 可把流程限制为合法阶段。 | `R01` Avoid contradictions | 官方直接陈述 |
| `C06` | render 中的 `isSending` 等布尔常量可以由单一 `status` 得到，不应成为第二份 State。 | `R01` Avoid contradictions | 官方直接陈述 |
| `C07` | TypeScript 判别联合由共同字面量属性区分成员；检查判别属性后可读取该成员专属字段。 | `T01` Discriminated unions | 官方直接陈述 |
| `C08` | 可由当前 Props 或已有 State 在 render 中计算的信息不应放入 State。 | `R01` Avoid redundant state | 官方直接陈述 |
| `C09` | 输入 State 更新会触发下一次 render，派生常量会由最新输入重新计算，不需要额外同步 setter。 | `R01` fullName 示例；`R07` setter 语义 | 官方事实组合 |
| `C10` | 把列表中的完整实体对象再存为 `selectedItem` 会复制同一信息，编辑集合后副本可能过期。 | `R01` Avoid duplication | 官方直接陈述 |
| `C11` | 选择关系通常只保存 `selectedId`，当前实体在 render 中从集合查找；实体内容只保留一个来源。 | `R01` Avoid duplication | 官方直接陈述 |
| `C12` | `selectedId` 可能因实体删除而失效；结构必须明确“未选择”或在删除更新中选择新的有效 ID。 | `R01` ID 选择与消失选择练习 | 官方示例加直接推导 |
| `C13` | JavaScript 对象不是被物理包含在另一对象中；属性保存的是指向对象的引用，多条路径可指向同一对象。 | `R02` Objects are not really nested | 官方直接陈述 |
| `C14` | 对象展开只复制一层。修改深层字段时，要从修改点向上创建每一层新对象。 | `R02` Copying / Updating nested object | 官方直接陈述 |
| `C15` | 数组展开、`map` 和 `filter` 创建新数组，但不会自动复制数组中的对象。 | `R03` Updating objects inside arrays | 官方直接陈述 |
| `C16` | 深层树在修改或删除叶子时需要复制完整父链；层级越深，更新代码越长。 | `R01` Avoid deeply nested state；`R02` nested update | 官方直接陈述 |
| `C17` | 扁平 / normalized 结构可用实体 ID 表保存内容，用 `childIds` 保存关系，使局部更新只触及实体和必要关系。 | `R01` Avoid deeply nested state | 官方直接陈述 |
| `C18` | 扁平化是解决难更新与重复的手段，不是所有小对象都必须转成 ID 表的强制规则。 | `R01` “You can nest state as much as you like”及总结 | 官方边界加课程判断 |
| `C19` | 列表 `key` 用于 React 在同级列表中追踪项目；应来自稳定数据，不能在 render 时临时生成。 | `R06` Keeping list items in order with key | 官方直接陈述 |
| `C20` | 实体 ID 表达业务实体或关系；`key` 表达 render tree 中同级列表身份；对象引用是 JavaScript 值。三者不能混为同一概念。 | `R01`、`R02`、`R06` | 多来源边界推导 |
| `C21` | `useState(initialProp)` 只在初始化时读取参数，后续 Prop 更新不会重新初始化已有 State。 | `R01` Don't mirror props；`R07` initialState | 官方直接陈述 |
| `C22` | 普通 Prop 默认直接读取；只有明确要忽略后续 Prop 更新时，才把首值保存为 State，并用 `initial` / `default` 命名说明。 | `R01` Don't mirror props | 官方直接陈述 |
| `C23` | React 可在 `Object.is` 判断下一 State 与当前 State 相同时跳过重新 render；直接变异后传回同一对象不能构成可靠更新。 | `R07` Caveats；`R02` Treat state as read-only | 官方直接陈述 |
| `C24` | 组件 State 与它在 render tree 中的位置关联；实体 ID 不会自动决定组件 State 是否保留。 | `R04` State is tied to a position | 官方直接陈述 |
| `C25` | 改变组件类型或 `key` 可以重置组件 State；这属于 State 保留与重置课程，不是本课实体规范化机制。 | `R04` Preserving / Resetting state | 官方事实与拆课边界 |
| `C26` | 多组件共享同一事实时，应删除副本并把 State 放到共同所有者；这属于 State 所有权 / 提升课程，本课只假设所有者已经确定。 | `R05` Lifting state up / single source | 官方事实与拆课边界 |
| `C27` | 同步显示结果应在组件顶层 render 中从当前 Props / State 直接计算；输入变化触发 render 时结果自然重新计算。 | `R08` Transforming data for rendering；`R01` fullName 示例 | 官方直接陈述 |
| `C28` | 用 Effect 把 Props / State 转换后写入另一份 State，会先 render 旧结果，Effect 再更新 State 并重新开始一次 render。 | `R08` Updating state based on props or state | 官方直接陈述 |
| `C29` | render 中的派生函数必须对相同输入返回相同结果，不产生副作用，也不修改 Props、State 或其他非局部值。 | `R09` Why purity matters / mutation | 官方直接陈述 |
| `C30` | 普通轻量派生计算直接执行即可；本课不讲昂贵计算测量、`useMemo` 或缓存。 | `R08` Caching expensive calculations | 官方事实与课程范围边界 |
| `C31` | `selectedItem = items.find(...)` 同时是去除重复实体和同步派生值：State 只保存集合与选择 ID，当前对象由本次 render 计算。 | `R01` Avoid duplication；`R08` selected ID 示例 | 官方直接陈述 |

## 六、冻结教学模型

### 1. State 结构由三类内容组成

课程统一使用下面的分析模型：

```text
State 结构
├── 事实：交互后必须被记住的最小输入
├── 约束：哪些组合合法，哪些组合互相矛盾
└── 关系：实体如何被选择、引用、包含或关联
```

- “事实”已经由 B21 判断是否需要 State、由谁拥有；I01 不重做所有者算法。
- “约束”决定是否要合并字段、使用状态枚举或判别联合。
- “关系”决定保存对象副本、稳定 ID、嵌套树还是扁平实体表。

### 2. 相关 State 的合并判断

不能只按字段数量决定一个或多个 State。正文应给出下列判断表：

| 问题 | 倾向合并 | 倾向独立 |
| --- | --- | --- |
| 是否由同一事件总是一起替换或重置 | 是 | 否 |
| 是否共同表示一个不可拆分的值，如坐标或区间 | 是 | 否 |
| 是否需要作为一份快照提交或回滚 | 是 | 否 |
| 是否有独立更新入口和独立生命周期 | 否 | 是 |
| 是否由不同组件拥有 | 否 | 是 |
| 合并后是否每次都要携带大量无关字段 | 否 | 是 |

“相关”不是“页面上靠得近”。合并后的对象仍需提交完整下一值；保持独立也不表示这些值没有业务关系。

### 3. 用结构排除矛盾状态

先写出业务允许的阶段，再设计 State：

```tsx
type SubmissionState =
  | { status: 'editing' }
  | { status: 'sending' }
  | { status: 'sent'; reference: string }
  | { status: 'error'; message: string }
```

该形状同时做到：

- 四个阶段互斥，不能出现 `isSending && isSent`。
- 成功分支一定有 `reference`，错误分支一定有 `message`。
- render 检查 `status` 后，TypeScript 能收窄到对应成员。
- `isSending`、`isSent` 只是当前 render 的只读常量，不是额外 State。

不要把“判别联合”升级成 Reducer 或状态机库。当前课程只设计 State 值和同步事件处理器。

### 4. 冗余 State 与重复 State 必须区分

| 问题 | 定义 | 典型错误 | 正确结构 |
| --- | --- | --- | --- |
| 冗余 State | 值可由当前 Props / State 计算 | 保存 `fullName`、筛选结果、数量 | render 中直接计算 |
| 重复 State | 同一实体内容保存多份 | `items` 和 `selectedItem` 都存对象 | `items` + `selectedId` |

冗余值的问题是“可以重新计算却建立了第二个 setter”；重复对象的问题是“同一实体有多个可写副本”。
二者都增加同步路径，但修复方式不同。

### 5. 同步派生值直接在 Render 中计算

本课吸收派生值后，必须完整讲清下面的最小模型：

```tsx
const [firstName, setFirstName] = useState('')
const [lastName, setLastName] = useState('')

const fullName = `${firstName} ${lastName}`.trim()
```

- `firstName`、`lastName` 是需要记住的输入事实。
- `fullName` 是当前 render 的普通常量，不是 State，也没有 setter。
- 任一输入更新会请求下一次 render；下一次 render 使用最新输入重新计算 `fullName`。
- 计算必须纯：相同输入得到相同结果，不修改输入、不写 DOM、不修改模块变量。

数组场景同样适用：

```tsx
const visibleCourses = courses.filter((course) => course.title.includes(query))
const matchCount = visibleCourses.length
const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null
```

这三项分别展示转换、二次派生和按 ID 查找。它们可以串联，但每一步都只读取当前 render 的输入。

禁止用 Effect 维护副本：

```tsx
// 错误方向：先用旧的 visibleCourses render，再由 Effect 写入并触发额外 render。
const [visibleCourses, setVisibleCourses] = useState<Course[]>([])
useEffect(() => {
  setVisibleCourses(courses.filter((course) => course.title.includes(query)))
}, [courses, query])
```

正文只用该最小反例解释“冗余 State + 额外 render”，不教学 `useEffect` 的签名、依赖治理或生命周期。
普通同步计算无论有几步都先直接执行；昂贵计算的测量、`useMemo`、依赖比较和缓存失效全部排除。

### 6. 稳定 ID、对象引用与列表 Key

- 实体 ID：业务数据的一部分，用于查找实体和表达关系；跨实体内容更新保持稳定。
- 对象引用：JavaScript 运行时值；不可变更新后目标实体通常产生新引用，不能用旧引用代替稳定身份。
- 列表 `key`：React render tree 同级列表项的身份提示；通常复用稳定实体 ID，但不会作为普通 Prop 传给组件。

应明确禁止三种误解：

1. 保存完整对象并不比保存 ID “更稳定”；对象内容更新后引用会改变，旧副本会过期。
2. `key` 不会自动成为 `item.id` Prop，也不会自动修复 State 中的重复对象。
3. 实体 ID 不会自动决定组件局部 State 是否保留；组件位置和 `key` 机制属于后续课程。

### 7. 深层嵌套与规范化

嵌套结构：

```ts
interface Place {
  id: string
  title: string
  childPlaces: Place[]
}
```

扁平结构：

```ts
interface PlaceRecord {
  id: string
  title: string
  childIds: string[]
}

interface TravelPlanState {
  rootId: string
  byId: Record<string, PlaceRecord>
}
```

需要比较的不是“哪个看起来更高级”，而是一次真实更新触及多少数据：

- 嵌套树更新叶子：复制叶子到根之间的每个容器。
- 扁平表更新实体：替换 `byId` 中目标记录；关系变化时再替换对应 `childIds`。
- 小而稳定、只随父对象整体替换、没有重复实体的数据：保留嵌套通常更清楚。
- 多处引用、频繁独立编辑、删除要修改深层父链的数据：优先评估扁平化。

本课的“规范化”只表示减少重复、用 ID 表达关系的组件内数据形状，不延伸到数据库范式或全局 Store。

### 8. State 不变量

课程应明确给出定义：**State 不变量是在每个可观察 render 中都必须成立，并且每个更新入口都必须保持的
关系。** 它不是 React 新 API，而是检查 State 形状是否可靠的方法。

本科范围内至少覆盖以下不变量：

| 不变量 | 合法结构 | 典型破坏方式 |
| --- | --- | --- |
| 阶段互斥 | `submission.status` 只有一个成员 | 多个阶段布尔值分别更新 |
| 分支字段完整 | `sent` 有 `reference`，`error` 有 `message` | 一个对象放大量可选字段 |
| 选择引用有效 | `selectedId === null` 或能在集合找到实体 | 删除实体后保留失效 ID |
| 实体 ID 唯一 | 每个 ID 只对应一个实体 | 新增时复用现有 ID |
| 关系可解析 | 每个 `childId` 都能在 `byId` 找到记录 | 只删实体，不清理父关系 |
| 实体内容唯一 | 一个实体只有一个可写内容来源 | 集合和 `selectedItem` 各存副本 |

每个 handler 都要说明“输入、下一状态和保持的不变量”。例如删除当前选中实体时，必须在同一逻辑中
清空 `selectedId` 或选择新的有效 ID；不能只更新实体集合后依赖 `undefined` 偶然兜底。

不要求证明一般图的无环性、编写 schema validator 或引入 Reducer。课程只对 Demo 中有限状态和引用
完整性做直接检查。

### 9. Props Mirror 的精确边界

```tsx
function Message({ messageColor }: { messageColor: string }) {
  const [color] = useState(messageColor)
  return <p style={{ color }}>消息</p>
}
```

上例只读取首个 `messageColor`。父组件后续传入新值不会重新初始化 `color`。默认应直接渲染
`messageColor`；只有需求明确是“首值创建本地草稿，后续外部变化不覆盖草稿”时，才使用
`initialColor` / `defaultColor` 命名并保存 State。

本课到“形状中是否存在多余 Prop 副本”为止，不展开受控组件的 `value/onChange/defaultValue` API 合同。

## 七、与相邻课程的去重合同

| 主题 | B17「State 的不可变更新」 | B21「State 所有权」 | I01「State 结构」 |
| --- | --- | --- | --- |
| 最小 State | 只作为输入 | 完整负责识别算法 | 复习结论并据此删除冗余 State |
| State 所有者 | 不负责 | 完整负责 | 假设所有者已确定 |
| 对象 / 数组替换 | 完整负责 API 与复制路径 | 只提醒 | 只比较形状带来的复制成本 |
| 矛盾状态 | 不负责 | 不展开 | 完整负责 |
| 同步派生值 | 不负责 | 只做最小 State 排除 | 完整负责 render 纯计算和串联派生 |
| Effect 同步反模式 | 不负责 | 不负责 | 只解释冗余 State 和额外 render，不教学 Effect API |
| 重复实体 | 说明引用与不可变更新 | 说明单一可写来源 | 完整负责 ID 关系、去重形状和 render 查找 |
| 深层嵌套 / 扁平化 | 完整说明逐层复制机制 | 不负责 | 完整负责何时改变数据形状 |
| 缓存 / `useMemo` | 不负责 | 不负责 | 明确排除到后续性能课程 |

### 1. B17 边界

I01 可以引用以下已学事实：对象 / 数组 State 不直接变异、展开是浅复制、嵌套更新需要沿路径复制。
I01 不再列出完整数组方法表，也不再把“setter 不自动合并”和“只复制外层”各写成大段独立教程。
本课新增价值是比较两种结构的更新路径，从而判断何时应改变形状。

### 2. B21 边界

B21 已完整负责：从 UI 和数据模型找最小 State、列出消费者、选择 owner、向下传值和 handler、保持
单一事实来源。I01 的起点应是“这些事实已经确认由当前组件拥有”，然后研究它们应该用怎样的形状表达。

I01 需要完整展开“可计算值不是 State”之后的做法：在 render 中执行纯同步计算、组织多步派生、删除
冗余 setter，并说明 Effect 同步为何产生旧结果和额外 render。但不要再复述 Thinking in React 五步、
最近共同父组件或完整商品筛选所有权分析。

### 3. 合并后的派生值边界

I01 吸收旧“派生值”，完整负责：

- 判断源事实与同步派生结果。
- 在 render 中用普通常量或纯函数直接计算。
- 组织 `filter -> length`、`ID -> find` 等轻量派生链。
- 删除冗余 State、setter 和用于同步派生结果的 Effect。
- 解释 Effect 同步会先出现旧结果，再触发额外 render。
- 保持计算幂等、无副作用且不修改 Props / State。

本课到此停止：不判断计算是否“昂贵”，不使用计时器测量，不介绍 `useMemo` 签名、依赖、`Object.is`
比较、缓存丢弃或 React Compiler。它们属于后续性能课程。

## 八、现有正文审计

### 1. 建议保留

| 内容 | 结论 | 原因 |
| --- | --- | --- |
| 标题“State 结构” | 保留 | 简短、稳定、直接表达知识点，适合作为左侧标题。 |
| summary | 基本保留 | 已直指矛盾、重复和深层嵌套，没有计划叙事。 |
| “关系先于形状”主线 | 保留 | 准确连接事实、约束和实体关系。 |
| 相关 State / 独立 State 判断 | 保留 | 属于 `R01` 核心原则。 |
| 状态枚举与判别联合 | 保留并补来源 | 能让非法组合难以表达，属于本课核心。 |
| `selectedId` 代替对象副本 | 保留并增强 | 需要补失效 ID 与对象引用边界。 |
| Props mirror | 保留并收窄 | 只讲首值合同，不展开受控组件设计。 |
| 深层嵌套与 `byId` / `childIds` | 保留并增强 | 需要补不变量和关系完整性。 |
| 练习与判断清单 | 保留 | 能验证结构决策，不因篇幅而删除。 |
| 10 个现有 pitfalls 的高价值部分 | 去重后保留 | 用户要求内容丰富，删除标准应是重复而不是行数。 |

### 2. 必须补充

1. 明确定义 State 不变量，并要求每个更新入口说明保持哪些不变量。
2. 区分“冗余计算值”和“重复实体副本”，不要只用“多余 State”笼统概括。
3. 区分稳定实体 ID、对象引用和列表 `key`，并说明 ID 不自动控制组件 State 保留。
4. 增加删除实体后 `selectedId` 失效的处理规则。
5. 增加 `byId` / `childIds` 的引用完整性：ID 唯一、关系 ID 可解析、删除同时更新关系。
6. 增加数组元素仍共享对象引用的最小桥接，以支持“复制 selectedItem 会过期”的因果链。
7. 把扁平化条件写成更新频率、父链复制长度、重复实体和独立查找四项判断，不把扁平化写成目标本身。
8. 补齐 `Updating Arrays in State`、`Preserving and Resetting State`、`Sharing State Between Components`、
   `Rendering Lists`、`You Might Not Need an Effect`、render 纯度与 TypeScript 判别联合来源。
9. 把 objectives 收束到 6 个可验证目标；不是为减少内容，而是让目标与课程验收一一对应。
10. 更新 `verifiedAt` 与版本说明，准确区分 React `19.2` 文档和仓库 `19.2.8` 运行时。
11. 吸收旧派生值正文中的同步派生、纯计算和 Effect 同步反模式；删除 `useMemo`、测量与缓存内容。

### 3. 建议删除或压缩

1. “对象 setter 不自动合并”可保留一个最小反例，不再承担完整 pitfalls；完整机制已由 B17 负责。
2. “直接变异对象 / 展开不是深复制”只保留为形状成本的前置链接，不再重复 B17 的逐层展开教程。
3. “先找出真正需要记住的事实”压缩为一段前置复习，不再重复 B21 的候选表和完整最小 State 算法。
4. `fullName`、筛选链、数量和按 ID 查找组成完整同步派生教学；只删除旧派生值课中的测量、`useMemo`
   与缓存细节。
5. “父组件拥有 State，通过值与回调驱动子组件”的展开说明移动到 State 提升 / 受控边界课。
6. 不以“总共 10 个错误”为目标；保留高价值错误，合并仅因重复的 B17 / B21 内容。

### 4. 当前生产叙事扫描

对现有正文、TSX 和 CSS 定向扫描以下模式：`B03`、`B17`、`B21`、`BL3`、`I01`、`I02`、`计划`、
`路线`、`批次`、`Gate`、`signoff`、`调研`。结果为 0 命中。现有标题也没有“第一课”等顺序词。

该结果说明当前正文已满足“知识点只描述知识点”的基本要求；后续修订必须继续保持。

## 九、现有 Demo 审计

### 1. 已有正确点

- 只使用 `useState`、事件处理、受控字段和同步 render 查找，没有 Reducer、Context、Effect 或外部 Store。
- `submission` 使用 `editing | success | error` 判别联合，合法分支互斥。
- `selectedCategoryId` 保存选择关系，`selectedCategory` 在 render 中用 `find` 得到。
- 每个函数上方已有规范的简体中文职责注释。
- CSS 使用 Flexbox、margin 和普通文档流，不使用 `grid` 或 `gap`。
- 错误、成功、编辑、重置和不存在分类的 fallback 都有可观察 UI。

### 2. Live 问题

| 问题 | 证据 | 影响 | 建议 |
| --- | --- | --- | --- |
| `draft` 被描述为“一起更新”的相关字段，但 `subject`、`detail` 实际由各自输入独立更新。 | `handleDraftChange(field, value)` 每次只改变一个字段。 | Demo 不能证明“总是一起更新才考虑合并”的核心判断。 | 把叙事改成“同生命周期、整体提交 / 重置的草稿对象”，或增加真正同事件变化的成对事实；不要声称它们总是一起更新。 |
| 分类列表是模块常量，从不编辑。 | `categories` 不在 State，只有选择 ID 会变化。 | 不能直接观察“保存对象副本会在实体更新后过期”。 | 最小增加“重命名当前分类”或“替换实体内容”操作，集合更新后详情自动读取新对象。 |
| 没有观察失效 ID 的不变量。 | UI 有 `分类已不存在` fallback，但用户操作无法删除分类。 | fallback 存在，引用完整性却无法验收。 | 增加删除当前分类并清空 / 重选 ID 的同步操作，或删去无法触发的伪验收描述。 |
| 没有展示嵌套与扁平更新的差异。 | Demo 只有平面分类数组。 | 正文核心“规范化”只能靠静态代码理解。 | 可保留为正文对照代码；若 Demo 增加，只做一项叶子删除对照，避免把界面做成数据结构实验室。 |
| 展示源码遗漏 CSS。 | Demo manifest 的 `loadSource` 只加载 `state-model-demo.tsx`。 | 运行组件实际依赖 CSS，源码面板不是完整同源集合。 | 改为 TSX + CSS 两文件 source list，运行与展示使用同一真实文件。 |
| 状态标签直接显示英文 union 值。 | `dd` 输出 `submission.status`。 | 功能正确，但学习者界面不够直观。 | 使用 render 映射显示中文标签，源码仍保留英文判别值。 |

### 3. Demo 建议范围

保留“本地工单编辑”场景，不引入网络提交。最小增强后应观察四个结论：

1. 草稿对象作为同生命周期快照整体重置，独立筛选 / 显示开关保持单独 State。
2. 提交结果始终只处于一个合法分支，成功和错误附带字段不会错位。
3. 只保存分类 ID；重命名分类实体后，当前分类详情自动显示新名称，没有 `selectedCategory` setter。
4. 删除当前分类时同步清空或重选 ID，结果不会保留悬空引用。

规范化的完整父子 ID 表可由正文最小代码与练习承担；除非页面仍保持简单，不要求在同一个 Demo 再加入
递归树编辑器。

## 十、Demo 可观察验收合同

### 1. 初始结构

- 源码中可找到草稿对象、`selectedCategoryId`、互斥 `submission` 三类 State。
- 源码中找不到 `selectedCategory` State、派生布尔 State 或多个阶段布尔值。
- 初始分类 ID 在实体集合中存在，状态区显示对应中文分类与“编辑中”。

### 2. 相关与独立 State

- 修改草稿只替换草稿对象；与草稿无关的选择关系不被重置。
- 执行“重置草稿”一次恢复草稿的全部字段，互不相关的独立 State 是否重置必须由按钮语义明确决定。
- 正文与 UI 不再把会独立编辑的字段错误描述为“总是一起更新”。

### 3. 互斥状态与不变量

- 空主题提交只进入 `error`，只显示错误消息，不同时显示成功编号。
- 有效主题提交只进入 `success`，只显示成功编号，不同时保留错误消息。
- 再次编辑后回到 `editing`，成功 / 错误分支附带字段不再可见。
- 所有可达状态都满足判别联合；源码不存在同步维护多个阶段布尔值的 handler。

### 4. 稳定 ID 与重复对象

- 切换分类只改变 `selectedCategoryId`，实体集合不被复制成第二个 selected State。
- 重命名当前分类后，列表和详情在同一次下一 render 显示相同新名称。
- 删除当前分类后，`selectedCategoryId` 变为 `null` 或另一个仍存在的 ID；不允许悬空 ID。
- 列表 `key` 使用实体 ID，实体 ID 也作为业务查找字段显式传递；不依赖 `key` 当普通 Prop。

### 5. 同源、响应式和错误面

- 源码展开包含实际运行的 `.tsx` 与 `.css` 两个文件。
- TSX / CSS 展示内容与工作区真实文件一致。
- 1440px、390px、390px + 200% 字号下无横向溢出、裁切或重叠。
- console 无 error / warning，页面无未处理异常，静态资源无 HTTP `>= 400`。

## 十一、建议正文合同

### 1. 标题与 Summary

- 左侧标题与正文 H1：`State 结构`。
- 建议 summary：`用相关字段、互斥状态、同步派生、稳定 ID 和扁平关系组织 State，减少矛盾、重复与深层更新成本。`

### 2. 六个学习目标

1. 能根据共同更新、生命周期和所有权判断 State 应合并还是独立。
2. 能用单一状态枚举或判别联合排除不可能组合，并说明分支附带数据。
3. 能区分源事实与同步派生结果，在 render 中用普通常量或纯函数完成轻量计算。
4. 能区分实体 ID、对象引用与列表 `key`，并处理选择 ID 失效。
5. 能比较嵌套与扁平结构的更新路径，按实际成本决定是否规范化。
6. 能删除冗余 State、同步 setter 和派生 Effect，并用不变量检查全部同步更新入口。

### 3. 教学顺序

1. 用“事实、约束、关系”定义 State 结构。
2. 从相关 / 独立字段进入单个对象与多个 State 的选择。
3. 从多个布尔值进入互斥枚举与判别联合。
4. 区分源事实、同步派生结果、重复对象和合法初始 Prop 快照。
5. 在 render 中用普通常量或纯函数组织轻量派生链，保持计算幂等且无副作用。
6. 对比冗余 State、同步 setter 和 Effect 同步造成的旧结果与额外 render。
7. 区分实体 ID、对象引用、列表 key，并处理失效引用。
8. 比较深层嵌套与 `byId` / `childIds` 的更新路径。
9. 用不变量清单审查全部 handler，再运行 Demo、完成结构重构练习并总结决策规则。

### 4. 高价值易错点

正文应覆盖以下错误，不设固定篇幅；每项写触发条件、原因、后果、错误 / 正确最小代码和验证方式：

1. 无关字段强行合并进巨型对象。
2. 总是一起变化的事实拆开后遗漏一半更新。
3. 多个布尔值表达互斥阶段。
4. 把可计算值保存成冗余 State。
5. 把列表实体复制成 `selectedItem` State。
6. 删除实体后留下失效 `selectedId` 或 `childId`。
7. 把对象引用、实体 ID 和 React `key` 当成同一种身份。
8. 机械深层嵌套，或反过来机械把所有小对象规范化。
9. 普通 Prop 被镜像成期待自动同步的 State。
10. 用 Effect 把 Props / State 的同步计算结果写回另一份 State，产生旧结果和额外 render。
11. 派生计算修改 Props、State 或非局部对象，或读取随机数、当前时间等非幂等输入。

对象 setter、浅复制和直接变异仍可在相应错误中作为原因，但不重新展开为 B17 的完整 API 教程。

## 十二、课程生产叙事禁词约束

研究记录可以出现内部路线信息；学习者正文、Demo 可见文案、objectives、recap、练习和小结不得出现：

- 课程序号或内部 ID：`I01`、`I02`、`B17`、`B21`、`BL3`、`react.core...` 的执行说明。
- 生产流程词：计划、路线、批次、任务编号、Gate、signoff、closure、迁移批次、执行日志。
- 验证生产词：构建通过、lint、format、type-check、浏览器验收、独立复审、PASS / finding。
- 调研叙事：本次搜索、来源抓取过程、哪个 agent 完成、何时停止或继续下一课。
- 篇幅叙事：为控制行数、为精简字数、由于本课太长而删除。

允许出现与学习直接相关的“练习”“完成标准”“验证方式”“参考资料”，因为这些描述的是知识点掌握，
不是课程生产计划。正文提到相邻知识时只写知识名称，例如“不可变更新”“State 提升”“派生值”，不写
课程序号、先后批次或计划状态。

## 十三、本科范围边界

### 1. 属于本科 React 课程

- 基础数据建模：事实、约束、关系、单一来源。
- 有限状态枚举与 TypeScript 判别联合。
- 实体 ID、对象引用、列表 key 的概念区分。
- 组件内规范化数据形状与引用完整性。
- 嵌套 / 扁平结构的时间与维护成本比较。
- 同步事件更新下的状态不变量。
- Props 初始快照与持续输入的区别。
- 从当前 Props / State 在 render 中进行同步派生，并组织轻量纯计算链。
- render 纯度：幂等、无副作用、不修改 Props、State 或非局部值。
- 冗余 State、同步 setter 与 Effect 同步反模式造成的额外 render。

### 2. 超出本课或本科主线

- 一般图论、拓扑排序、循环检测和复杂级联删除。
- 数据库第一至第五范式、ORM 实体映射和后端数据合同。
- 有限状态机库、形式化证明、模型检查或类型级穷尽框架。
- Redux / Zustand 的 normalized entity adapter、服务端缓存归一化。
- CRDT、事件溯源、事务隔离和分布式一致性。
- React Fiber、Hook 内部存储槽和调度器实现。

课程可以用“不变量”“规范化”“判别联合”这些标准本科术语，但必须用组件内同步例子解释，不能通过
引入上述高级系统来显得内容更丰富。

## 十四、实施前冻结清单

- [ ] State 结构正文已吸收同步派生、render 纯计算和 Effect 同步反模式。
- [ ] 标题继续使用短标题“State 结构”，summary 只描述本课知识。
- [ ] 正文覆盖事实、约束、关系、不变量、同步派生、稳定 ID 和规范化。
- [ ] B17 的更新 API 与 B21 的所有者算法只保留必要桥接，没有重复完整教学。
- [ ] 普通同步派生已完整覆盖；`useMemo`、昂贵计算测量、缓存、State 提升、Reducer、Context、
  Effect API、外部 Store 和服务端状态均保持在本课范围之外。
- [ ] 当前 Demo 对 `draft` 的叙事已与真实更新关系一致。
- [ ] ID 去重和失效引用至少有一个可操作观察路径。
- [ ] 源码面板展示实际运行的 TSX 与 CSS。
- [ ] 课程生产叙事禁词扫描为 0 命中。
- [ ] 所有教学结论能回到 `R00-R09` 或 `T01`，课程推导明确标注为推导而非 React 内部保证。

## 十五、来源 URL 清单

1. https://react.dev/versions
2. https://react.dev/learn/choosing-the-state-structure
3. https://react.dev/learn/updating-objects-in-state
4. https://react.dev/learn/updating-arrays-in-state
5. https://react.dev/learn/preserving-and-resetting-state
6. https://react.dev/learn/sharing-state-between-components
7. https://react.dev/learn/rendering-lists
8. https://react.dev/reference/react/useState
9. https://react.dev/learn/you-might-not-need-an-effect
10. https://react.dev/reference/rules/components-and-hooks-must-be-pure
11. https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
