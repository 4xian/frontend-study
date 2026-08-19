# State 所有权与 Thinking in React 官方研究

## 一、冻结结论

- 课程 ID：`react.core.learn.basics.state-ownership-and-thinking-in-react`
- 路线位置：B21
- 标题：State 所有权与 Thinking in React
- 教学层级：基础
- 目标版本：React `19.2.8`
- 核验日期：`2026-08-16`
- 研究状态：官方事实、正文边界和 Demo 合同已冻结

本课只回答一个问题：拿到数据模型和组件层级后，怎样找出最小但完整的 State，为每一项
State 选择一个明确所有者，并用父到子的 Props 与显式回调建立可追踪的数据流。

Thinking in React 的五步都需要出现，但篇幅重心是第 3-5 步。第 1 步只建立最小组件树，第 2
步只说明先用数据与 Props 完成静态结构；它们不是组件设计和项目搭建专题。

### 1. 纳入范围

- 最小但完整的 State。
- State 所有者、消费者和更新入口的区别。
- 每项 State 的单一事实来源。
- 父到子的单向数据流。
- Thinking in React 的静态结构、最小可变状态、所有者判断和 inverse data flow。
- 可计算结果不是独立 State 的最小判断。
- 为所有权分析服务的最小组件拆分。

### 2. 明确排除

- 提升 State 的完整重构步骤、多场景取舍和可复用组件 API 设计。
- controlled / uncontrolled 组件术语、`value/onChange/defaultValue` 合同专题。
- State 结构的完整原则、复杂派生值、缓存和昂贵计算。
- Reducer、Context、Effect、Ref、外部 Store 和跨层共享方案。
- 输入控件、提交、FormData、校验等表单细节。
- 性能优化、memoization、Server Components 和服务端状态。
- 本地命令、构建结果、浏览器数据、Gate、signoff 等课程生产叙事。

## 二、研究方法与版本边界

1. 开始前已核对路线 B21 定义、课程内容规范、现有研究记录、当前正文、Demo 源码、
   Demo manifest 和 dirty worktree。
2. 按仓库搜索顺位先调用 Tavily，5 个官方域查询均因账户用量上限失败，没有返回可采用
   结果。已知官方 URL 随后通过 `curl -L --fail --silent --show-error` 直接读取。
3. React 事实只采用 React 官方文档与 `reactjs/react.dev` 官方文档仓库原文；TypeScript
   类型事实只采用 TypeScript 官方 Handbook 与官方文档仓库原文。
4. 仓库 `package.json` 与 `package-lock.json` 都把 `react`、`react-dom` 固定为
   `19.2.8`。React Versions 同时说明 `react.dev` 不为每个 minor 或 patch 单独发布
   文档快照，因此课程目标可以写 `React 19.2.8`，但不能声称 Learn 页面是 19.2.8
   patch 的冻结副本。
5. 本课结论是官方直接记录的设计流程与公共心智模型。固定 React 19.2.8 源码或测试不会为
   “谁拥有 State”增加比官方 Learn 文档更强的教学证据，反而容易把 Fiber/Hook 存储实现误写成
   公共合同，所以本课不采用内部源码或测试 claim。
6. TypeScript 来源只支持 Demo 中对象 Props 与回调 Props 的静态类型写法，不用类型系统反推
   React 运行时所有权。

## 三、官方来源卡

| ID | 一手来源 | 本课采用范围 |
| --- | --- | --- |
| `R0` | [React Versions](https://react.dev/versions) | `react.dev` 提供当前 React 文档，并在同一 major 内持续更新，不为每个 minor/patch 单独发布文档版本。 |
| `R1` | [Thinking in React](https://react.dev/learn/thinking-in-react) | 五步法、组件层级、静态版本、单向数据流、最小 State、所有者算法和 inverse data flow。 |
| `R2` | [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) | 最近共同父组件、共享 State、handler Props 和每项 State 的单一事实来源。 |
| `R3` | [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) | 只采用“避免冗余和重复 State”及“render 中可计算则不存 State”。 |
| `T1` | [TypeScript: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) | 对象形状可以使用匿名对象类型、`interface` 或 type alias 描述。 |
| `T2` | [TypeScript: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions) | `(value: string) => void` 这类函数类型表达式描述回调调用合同。 |

`R2` 同页还包含 controlled / uncontrolled 组件内容，但该部分不进入 B21。只引用
“Lifting state up”开头的共同父级事实、single source of truth 段落与 recap 中的 handler
Props 结论。

## 四、逐 Claim 证据

| Claim | 冻结表述 | 一手证据 | 证据性质 |
| --- | --- | --- | --- |
| `C01` | Thinking in React 依次包含组件层级、静态版本、最小 State、State 位置和 inverse data flow 五步。 | `R1` 的 Step 1-5 | 官方直接陈述 |
| `C02` | 组件拆分先对照 UI 与数据模型建立层级；组件边界有判断空间，不存在唯一机械切法。 | `R1` Step 1 列出 programming、CSS、design 三种观察角度，并说明表头是否拆分可以有不同选择。 | 官方直接陈述 |
| `C03` | 静态版本先由数据模型 render UI，通过 Props 从父到子传数据，不加入交互 State。 | `R1` Step 2 | 官方直接陈述 |
| `C04` | React 的基础数据流是父组件向子组件传递数据的 one-way data flow。 | `R1` Step 2 末段与 Step 4 开头 | 官方直接陈述 |
| `C05` | State 是应用需要记住的最小变化数据；其余结果按需计算。 | `R1` Step 3 | 官方直接陈述 |
| `C06` | 候选值若保持不变、由父组件作为 Props 传入、或能由现有 Props/State 计算，就不应成为新的 State。 | `R1` Step 3 的三个排除问题 | 官方直接陈述 |
| `C07` | 官方商品表示例中，原始商品来自 Props，搜索词和库存开关是 State，筛选结果是计算值。 | `R1` Step 3 的逐项判断 | 官方直接陈述 |
| `C08` | State owner 是负责改变这项 State 的组件；先识别 State，再讨论所有者。 | `R1` Step 4 开头 | 官方直接陈述 |
| `C09` | 对每项 State，列出全部依赖它 render 的组件，再找它们最近的共同父组件。 | `R1` Step 4 的第 1-2 项 | 官方直接陈述 |
| `C10` | State 常放在共同父组件，也可以放在其上层；现有层级不合适时可以新增专门 owner。 | `R1` Step 4 的三种位置 | 官方直接陈述 |
| `C11` | 需要协调的兄弟 State 应去掉副本，移动到最近共同父组件，再通过 Props 向下分发。 | `R2` Intro 与 lifting state up 三步 | 官方直接陈述；B21 只取结果，不展开重构教学 |
| `C12` | 每项独立 State 有一个明确所有者；不表示应用全部 State 必须集中到一个位置。 | `R2` “A single source of truth for each state” | 官方直接陈述 |
| `C13` | 不同 State 可以位于组件树的不同位置，需求变化时也可以重新上下移动。 | `R2` single source of truth 段落 | 官方直接陈述 |
| `C14` | owner 把值和 setter/handler 作为 Props 向下传；子组件显式调用收到的函数请求更新。 | `R1` Step 5；`R2` recap | 官方直接陈述 |
| `C15` | inverse data flow 仍是显式调用，不是隐式双向绑定；函数本身仍由父组件向下提供。 | `R1` Step 5 将显式数据流与 two-way binding 对比。 | 官方事实加课程精确转述 |
| `C16` | render 期间可计算的信息不应另存 State；复制同一数据会增加不同步风险。 | `R3` “Avoid redundant state”与“Avoid duplication in state” | 官方直接陈述 |
| `C17` | Props 合同可用 `interface` 描述对象形状，回调 Prop 可写成 `(nextQuery: string) => void`。 | `T1`、`T2` | TypeScript 语法事实 |
| `C18` | TypeScript 类型只能说明值和函数的调用形状，不能自动保证 React State 只有一个 owner。 | `T1`、`T2` 仅承诺静态形状；React 所有权来自 `R1`、`R2`。 | 课程边界推导 |

## 五、冻结教学模型

### 1. 输入：数据模型与最小组件树

课程统一使用一个静态商品筛选场景，不引入远程请求、表单提交或可编辑商品数据：

```text
FilterableProductTable
├── ProductFilters
└── ProductTable
```

- `products` 是固定数据或由更上层传入的数据模型。
- `ProductFilters` 显示搜索词与库存开关。
- `ProductTable` 根据当前筛选条件 render 商品和匹配数量。

组件拆分只服务两个问题：谁消费某项 State，以及它们的最近共同父组件是谁。不要扩展文件组织、
设计系统或抽象层级。

### 2. Thinking in React 五步

1. 从 UI 与数据模型画出组件层级。
2. 先用数据和 Props 完成无交互静态版本。
3. 对数据候选执行三个排除问题，留下最小但完整的 State。
4. 对每项 State 列出全部消费者并选择 owner。
5. owner 向下传值和 handler；子组件显式调用 handler 请求更新。

这是一套分析顺序，不是 React runtime 的五个执行阶段，也不要求开发过程机械形成五个提交。

### 3. 最小 State 判定表

| 候选数据 | 判断 | 理由 |
| --- | --- | --- |
| `products` | 不是当前筛选组件的新 State | 冻结场景中它是固定数据或上层 Props。 |
| `query` | State | 随交互变化，且不能由其他当前输入计算。 |
| `onlyInStock` | State | 随交互变化，且不能由其他当前输入计算。 |
| `visibleProducts` | 派生值 | 可由 `products`、`query`、`onlyInStock` 在 render 中计算。 |
| `matchCount` | 派生值 | 可由 `visibleProducts.length` 计算。 |

“显示结果会变化”不是 State 的充分条件。先问它是否必须被记住，再问由谁拥有。

### 4. 所有者判断

对 `query` 和 `onlyInStock`：

1. `ProductFilters` 根据它们显示当前字段值。
2. `ProductTable` 根据它们决定 render 哪些商品。
3. 二者最近的共同父组件是 `FilterableProductTable`。
4. 所以这个场景由 `FilterableProductTable` 声明两项 State。

“最近共同父组件”是首选候选，不是唯一合法语法位置。课程只用一句话说明也可选择更高层或新增
合理 owner，不展开提升 State 的重构取舍。

### 5. 单向数据流与 inverse data flow

```text
FilterableProductTable
  ├─ value Props + handler Props ──> ProductFilters
  └─ data/filter Props ────────────> ProductTable

ProductFilters -- 调用收到的 handler --> 请求 owner 更新
owner State 改变 -- 下一次 render --> 新 Props 再次向下
```

需要避免两种不准确表述：

- 不说“回调向上流动”。回调函数由父组件作为 Prop 向下传，向 owner 报告的是调用携带的新值或意图。
- 不说“只有 owner 能调用 setter”。owner 声明并拥有对应 State；它可以把 setter 或包装 handler
  传下去，子组件能够调用收到的函数，但不会因此拥有第二份 State。

### 6. 单一事实来源

- “一个”按每项 State 分别计算：`query` 一个 owner，`onlyInStock` 一个 owner。
- 同一 State 可以有多个读取者，不能有多个独立可写副本。
- 页面中其他局部 State 可以由其他组件拥有。
- 不由此推出全局 Store、Context 或根组件集中状态。

### 7. 派生值边界

B21 必须让学习者能删除 `visibleProducts` 和 `matchCount` 的冗余 State；到此停止。以下问题
移交 I01：

- 相关 State 应合并还是拆分。
- 矛盾状态、嵌套结构、重复对象和规范化。
- mirror Props 的完整例外。
- 复杂派生逻辑、缓存和性能。

### 8. TypeScript 最小合同

```tsx
interface ProductFiltersProps {
  query: string
  onlyInStock: boolean
  onQueryChange: (nextQuery: string) => void
  onStockFilterChange: (nextValue: boolean) => void
}
```

这个接口使值 Props 与回调 Props 清楚可见，但它不是所有权证明。所有权仍由 State 声明位置和
组件依赖关系决定。

## 六、现有正文审计

审计对象：
`src/categories/frontend/react/core/learn/state-ownership-and-thinking-in-react.md`。当前快照为
806 行，稳定 ID 与 B21 标题正确，正文已有 16 个连续编号的二级章节。

### 1. 保留

| 现有内容 | 处置 | 理由 |
| --- | --- | --- |
| “展示者不一定是所有者” | 保留 | 直接服务 `C08`、`C09`。 |
| 三个最小 State 排除问题与候选表 | 保留并收窄 | 是 `C05`-`C07` 的核心教学。 |
| 全部消费者 -> 最近共同父 -> 合理 owner | 保留 | 是 B21 的主要判断算法。 |
| 每项 State 一个事实来源，不等于全局唯一容器 | 保留 | 精确对应 `C12`、`C13`。 |
| 值和 handler Props 向下，子组件显式调用 | 保留并校正措辞 | 对应 `C14`、`C15`。 |
| Thinking in React 五步 | 保留并前移 | 五步应成为正文骨架，而不是后半篇再次总结。 |
| 商品筛选组件树 | 保留 | 与官方 `R1` 同构，适合零基础判断。 |

### 2. 删除或合并

| 现有内容 | 处置 | 原因 |
| --- | --- | --- |
| 先分散讲所有者、最小 State、共享，再用一整章重新串五步 | 合并 | 同一事实重复出现，正文远超单知识点所需规模。 |
| “优先传业务意图而不是暴露更新能力”的独立主张 | 删除出 B21 | 官方示例直接下传 setter；包装业务回调不是本课必须规则，容易进入 I02 组件 API 设计。 |
| 价格编辑、商品数组更新和重置所有 State 的正文叙事 | 删除出 B21 | 引入 B17 不可变更新、B20 表单交互和 I03 重置语义，干扰唯一观察链。 |
| “直接修改 Props 对象”的完整易错项 | 删除出 B21 | 属于组件纯度和不可变更新，不是所有权专属错误。 |
| 七个长篇 pitfalls 中重复的“兄弟副本、owner 过低、单一来源” | 合并 | 保留 5 个高价值错误即可，避免同一因果重复。 |
| `ProductPanel`、总价、价格编辑等组合功能说明 | 删除 | 不帮助判断最小 State 或 owner。 |

### 3. 移动

| 现有内容 | 移交目标 | B21 最多保留 |
| --- | --- | --- |
| 提升 State 的删除副本、重构步骤和多场景选择 | I02 State 提升与受控边界 | “共享事实通常由最近共同父组件拥有”一句和一个例子。 |
| controlled / uncontrolled 术语、字段控制权和 `value/onChange/defaultValue` API | I02 | B21 只说值 Prop 与回调 Prop，不命名组件控制模式。 |
| mirror Props、冗余/重复 State 的完整结构原则 | I01 State 结构与派生数据 | 三个排除问题和一个派生筛选结果。 |
| State 保留与重置行为 | I03 State 保留与重置 | 不在 B21 Demo 提供“重置全部 State”观察任务。 |
| 局部、提升、Context、Store 的选型 | I07 状态共享边界 | 只说明单一事实来源不要求全局集中。 |
| Props 变更、对象/数组不可变更新 | B12/B17 已有课程 | 不作为 B21 独立易错点。 |
| 输入控件和表单事件细节 | B20 已有课程 | 只复用已学过的 `value`、`checked`、`onChange`。 |

### 4. 补充或校正

| 缺口 | 必须补充或校正 |
| --- | --- |
| 版本元数据 | `appliesTo` 更新为 `React 19.2.8`，`verifiedAt` 更新为本批真实日期。 |
| 静态版本 | 在 State 判断前明确：先用 `products` 与 Props render 静态组件树，不使用交互 State。 |
| 组件拆分 | 只说明组件边界来自 UI、职责与数据模型，官方示例允许不同合理拆法。 |
| owner 措辞 | owner 是 State 声明/持有位置；子组件可以调用 owner 传下来的 setter 或 handler。 |
| inverse data flow | 明确它是显式函数调用，不是回调函数自动向上查找，也不是隐式双向绑定。 |
| TypeScript | Props interface 只表达类型合同，不能证明 single source of truth。 |
| 结构规模 | 以五步法为主骨架，删除重复章节；基础课不需要 806 行和 100 分钟才能完成核心判断。 |

## 七、现有 Demo 审计

审计对象：

- `src/categories/frontend/react/core/demos/product-table/product-table-demo.tsx`
- `src/categories/frontend/react/core/demos/product-table/product-table-demo.css`
- `src/categories/frontend/react/core/demo-manifest.ts`

Demo 已以 `react.core.learn.basics.product-table-demo` 登记，运行组件和展示源码都加载同一
`.tsx` 文件。当前 CSS 使用 Flexbox、margin 和正常流，没有 `grid` 或 `gap`。

### 1. 可保留能力

- `ProductTableDemo` 是 `query` 与 `onlyInStock` 的唯一声明位置。
- `ProductFilters` 通过 Props 接收当前值和回调。
- `visibleProducts` 与匹配数量能在 render 中计算。
- `ProductFiltersProps` 用对象类型与函数类型展示最小 TypeScript 合同。
- manifest 的组件 loader 与 source loader 指向同一个 `.tsx` 文件。

### 2. 必须收窄

- 删除 `products` State，改为模块常量或根组件的只读 Props。
- 删除价格输入、`onPriceChange`、`handlePriceChange` 和对象/数组不可变更新。
- 删除 `totalPrice`；匹配数量已经足以证明派生值。
- 删除“重置所有者中的 State”和一次重置三项 State 的流程。
- 可保留直接传 `setQuery`、`setOnlyInStock`，不新增业务 handler 抽象。
- UI 文案不直接列“State：...；派生：...”，观察任务由正文说明，Demo 只显示真实筛选结果。

### 3. 冻结 Demo 结构

```text
固定 products
     |
     v
FilterableProductTable
  State: query, onlyInStock
  ├── ProductFilters
  │     Props: query, onlyInStock, onQueryChange, onStockFilterChange
  └── ProductTable
        Props: products, query, onlyInStock
        render: visibleProducts, matchCount
```

### 4. 必须可观察的行为

1. 输入关键词后，输入当前值、列表和匹配数量一起变化。
2. 切换“只看有货”后，复选框、列表和数量读取同一 owner 的当前值。
3. 清空关键词或取消开关后，结果由当前 Props/State 重新计算。
4. 展示源码只有 `query`、`onlyInStock` 两个 `useState`，没有
   `visibleProducts` 或 `matchCount` setter。
5. 源码能一眼定位 owner、两个消费者、值 Props、handler Props 与 render 派生。

### 5. 禁止项

- 不增加价格编辑、重置、提交、校验或异步请求。
- 不增加 Reducer、Context、Effect、Ref、外部 Store 或路由。
- 不用 DevTools、Fiber、源码内部对象或动画解释所有权。
- 不把 controlled / uncontrolled 组件 API 作为观察目标。
- 不为“可扩展”创建额外状态层、配置层或通用抽象。

## 八、高风险易错点

| 风险 | 错误表述或实现 | 冻结校正 |
| --- | --- | --- |
| 把所有变化结果都存 State | `visibleProducts`、`matchCount` 各有 setter | 能由当前 Props/State 计算就直接在 render 中计算。 |
| 把 Props 复制成本地 State | 子组件用 `useState(query)` 期待持续同步 | 当前值直接读 Prop；完整默认值/控制权合同移交 I01/I02。 |
| 只看交互发生位置 | 因输入发生在 `ProductFilters` 就让它拥有 `query` | 列出全部 render 消费者后再找共同父组件。 |
| 把最近共同父写成绝对规则 | 声称 State 只能放在那里 | 它是常见候选；官方允许更高层或新增合理 owner。 |
| 误解 single source of truth | 所有 State 都放根组件或全局 Store | 原则按每项独立 State 判断。 |
| 误解 inverse data flow | “回调自动向上流动”或“React 双向绑定” | handler 作为 Prop 向下，子组件显式调用。 |
| 误解 setter 与 owner | “子组件绝不能调用 setter” | 子组件可以调用收到的 setter；State 仍声明并存放在 owner。 |
| 用类型冒充运行时保证 | 有 `interface` 就认为不会复制 State | TypeScript 只检查形状，所有权由组件结构和 State 声明决定。 |
| Demo 自相矛盾 | 候选表说 `products` 是 Props，Demo 又以价格编辑引入 `products` State | B21 Demo 固定 `products`，只观察两项筛选 State。 |
| 借组件拆分扩张范围 | 展开文件架构、设计系统或通用容器 | 只保留能识别消费者和共同父级的三组件树。 |

正文 pitfalls 建议保留五项：冗余派生 State、兄弟副本、owner 位置过低、全局集中误解、
inverse data flow 误解。mirror Props 只用一句交叉链接，不展开默认值例外。

## 九、正文编写合同

1. 以 Thinking in React 五步作为唯一主骨架，避免先分散教学后再重复串联。
2. 第 1-2 步各用一个最小组件树/静态片段；正文重点放在第 3-5 步。
3. 必须逐项展示 `products`、`query`、`onlyInStock`、`visibleProducts`、
   `matchCount` 的 State 判断。
4. 必须列出每项 State 的全部消费者，再给出最近共同父组件；不能只宣布答案。
5. 必须准确解释每项 State 一个 owner，而非全应用一个状态容器。
6. 必须准确解释 handler 来源、调用方向和 owner；不使用“回调向上流动”的省略说法。
7. 展示代码统一使用 TSX，类型只保留值 Props 和函数 Props 的最小合同。
8. 派生值只讲到“能算则不存”；完整结构、缓存和性能移交 I01。
9. 提升与控制权只讲到共同 owner 结论；完整重构和 API 合同移交 I02。
10. Demo 只观察 `query`、`onlyInStock`、派生列表和匹配数量。
11. 正文不出现研究工具、依赖锁、命令、构建/浏览器结果或审核状态。
12. “原理与适用场景”区分官方事实、课程转述和后续课程边界，不引用 React 内部实现。

## 十、建议正文顺序

1. 学习目标。
2. 为什么需要：同一筛选事实出现两个可写副本。
3. Thinking in React 前两步：数据模型、组件树与静态 Props 流。
4. 最小但完整的 State：三个问题与候选表。
5. State 所有者：消费者、共同父组件和位置选择。
6. 单一事实来源与单向数据流。
7. 最小同源 Demo。
8. 五个高风险易错点。
9. 原理与适用边界。
10. 练习：完成一次候选判定、owner 标注和数据流标注。
11. 本节小结。
12. 官方来源。

## 十一、验收清单

- 稳定 ID、B21 路线位置和标题不变。
- `appliesTo: React 19.2.8`，`verifiedAt` 使用本批日期。
- 五步法完整出现，但第 1-2 步未扩成组件设计或搭建专题。
- State 候选表与官方商品筛选例一致。
- owner 算法包含全部消费者、最近共同父、更高层和新增 owner 四个边界。
- single source of truth 明确按每项 State 判断。
- handler 由父向下传，子组件显式调用；没有双向绑定叙事。
- 派生结果没有 `useState`，没有进入缓存/性能专题。
- 正文没有 controlled / uncontrolled 组件 API、提升重构细节或表单细节。
- Demo 没有价格编辑、商品 State、重置、异步和跨层状态方案。
- TSX Demo 的对象与回调类型通过 TypeScript 检查，但正文不把类型当运行时所有权保证。
- 运行组件与展示源码仍来自同一 `.tsx` 文件。

## 十二、研究结论

B21 可以进入正文收窄。需要合并进正文的官方事实是：Thinking in React 五步、静态 Props
单向数据流、三个最小 State 排除问题、owner 的消费者/共同父判断、每项 State 的单一事实来源，
以及显式 inverse data flow。

现有正文事实主线基本正确，但 806 行内容重复并带入业务 callback 设计、mirror Props、
不可变对象更新、价格表单、重置和后续状态边界。实施时应合并重复章节并按上述移动表收窄。

现有 Demo 的同源登记与筛选所有权结构可以复用，但必须删除 `products` State、价格编辑、
总价和重置流程，只留下固定商品数据、两项筛选 State、两个消费者和 render 派生结果。

## 十三、实际采用的官方资料

- [React Versions](https://react.dev/versions) - 文档版本策略。
- [Thinking in React](https://react.dev/learn/thinking-in-react) - 五步法、最小 State、owner、
  单向数据流和 inverse data flow。
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) -
  共同父组件、handler Props 与每项 State 的单一事实来源。
- [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) -
  只支持避免冗余/重复 State 的最小边界。
- [TypeScript: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) -
  Props 对象形状的类型写法。
- [TypeScript: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions) -
  回调 Props 的函数类型表达式。
