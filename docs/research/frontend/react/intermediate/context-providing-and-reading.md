# Context 创建、提供与读取研究记录

## 冻结知识点合同

- 目标 ID：`react.core.learn.intermediate.context-providing-and-reading`
- 标题：Context 创建、提供与读取
- 教学层级：本科范围的中级 React 基础
- 核验日期：`2026-08-16`
- 研究状态：官方事实、固定版本源码、旧内容审计和 Demo 观察合同已完成；正文、Demo、manifest、浏览器验收和独立复审由实现阶段完成。
- 官方文档基线：React `19.2`
- 固定实现基线：React / React DOM `19.2.8`

本记录冻结一条完整主线：模块顶层用 `createContext` 建立稳定的 Context 对象和默认值合同，父组件用
React 19 的 `<SomeContext value={value}>`（以及兼容的 `<SomeContext.Provider value={value}>`）把值放进
子树，读取组件用 `useContext(SomeContext)` 取得父树中最近的匹配 Provider 值。没有匹配 Provider、存在
Provider、嵌套 Provider 和显式 `undefined` 是不同的运行时状态。

本记录覆盖：默认值和静态 fallback、Provider 两种写法、最近祖先查找、调用组件自身 Provider 不生效、
嵌套覆盖、`Object.is` 更新判定、Context 值的引用身份、`memo` 边界、重复模块和 Context 对象身份、缺失
与显式 `undefined`、组合与拆分 Context、常见错误，以及三个旧课程和 Demo 的合并审计。

不在正文展开：Reducer 与 Context 组合（I06）、第三方 Store、Server Components / RSC、跨请求或远程缓存、
Context selector、并发调度内部算法、复杂性能优化和部署/构建配置。源码中的 Fiber、lane、renderer 栈只作为
固定实现证据，不能改写成学习者必须记忆的公共 API。

## 调研边界与方法

### 已读取的仓库材料

按单课合同只读取了 I05 的计划条目、课程内容规范、Demo 与交互规范，以及直接被吸收的三篇旧研究、三篇
旧正文和三套同源 Demo：

| 旧内容 | 读取对象 | 当前职责 |
| --- | --- | --- |
| `create-context` | 研究、正文、`demos/create-context` | 创建身份、默认值、`T \| null`、显式 `undefined` |
| `use-context` | 研究、正文、`demos/use-context` | 最近 Provider、读取更新、同组件 Provider 边界 |
| `provider-scope-and-overrides` | 研究、正文、`demos/provider-scope-and-overrides` | 子树作用域、嵌套覆盖、外层兄弟恢复 |

没有读取 I06 或其后续课程正文。旧研究中出现的后续主题仅用于确认拆课边界，不作为本课正文材料。

### 外部来源方式

来源 URL 已由 React 官方文档和固定 GitHub tag 明确给出，因此直接用 `curl -L --fail --silent --show-error`
读取已知官方 URL；没有使用关键词搜索，也没有把二手文章当作事实来源。React 文档的 `.md` 端点返回页面原始
Markdown，便于逐行核对；固定源码通过 React 仓库 `v19.2.8` tag 的 GitHub API/raw 内容核对。

## 一手来源索引

| 编号 | 来源 | 版本/固定点 | 支撑的主张 |
| --- | --- | --- | --- |
| R1 | [React Versions](https://react.dev/versions) | React 文档最新版本 `19.2` | 文档版本口径；官方不为每个 patch 单独发布文档 |
| R2 | [`createContext`](https://react.dev/reference/react/createContext) | React 19.2 | 调用位置、Context 对象、默认值、直接 Provider 语法、旧 `.Provider` 语法、`value` 与最近 Provider |
| R3 | [`useContext`](https://react.dev/reference/react/useContext) | React 19.2 | 顶层调用、最近祖先、同组件 Provider、自动更新、`Object.is`、`memo`、重复模块、`undefined`、值身份 |
| R4 | [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context) | React 19.2 | Context 穿过中间组件、不同 Context 互不覆盖、Props/`children` 替代方案、嵌套 Provider 场景 |
| R5 | [Using TypeScript](https://react.dev/learn/typescript) | React 19.2 | `createContext` 类型推断、没有合理默认值时使用 `ContextShape \| null`、读取边界检查 |
| R6 | [TypeScript `strictNullChecks`](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) | TypeScript 官方 TSConfig 文档 | `null`、`undefined` 在严格空值检查下是独立类型，使用前需要缩小 |
| S1 | [ReactContext.js](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactContext.js) | tag `v19.2.8`，L14-L46 | `createContext` 初始化默认值、同一 Context 的 `.Provider` 引用和返回对象 |
| S2 | [ReactFiberNewContext.js](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberNewContext.js) | tag `v19.2.8`，L78-L147、L208-L328、L362-L571 | Provider 值栈、嵌套恢复、按 Context 对象登记依赖、变化传播、`Object.is` 检查、读取快照 |
| S3 | [ReactFiberBeginWork.js](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberBeginWork.js) | tag `v19.2.8`，L3607-L3635 | Provider 读取 `pendingProps.value`、缺少 `value` 的开发警告、进入 Provider 值栈 |

R2/R3/R4 的原始 Markdown 还明确写出：React 19 可渲染 `<SomeContext>` 作为 Provider，旧版本使用
`<SomeContext.Provider>`；R1 说明 `react.dev` 当前文档版本是 19.2。S1-S3 是固定 patch 的实现观察，不是
对未公开字段的长期承诺。

## 官方公共合同

以下每条是可以进入课程正文的教学主张，右侧列出直接来源。课程解释公共行为时不依赖私有字段名称。

### 1. 创建 Context 与默认值

| 主张 | 精确含义 | 来源 |
| --- | --- | --- |
| `createContext` 应在组件外调用 | 它建立模块级、稳定的 Context 对象；不要在组件 render 中反复创建。 | R2；S1 L14-L46 |
| 返回值是 Context 对象，不是当前值 | 对象代表“哪一类信息”可被提供或读取；运行时值由 Provider 的 `value` 决定。 | R2 L37-L45；R3 L35-L41 |
| `defaultValue` 是静态最后兜底 | 只有读取组件父树上完全没有匹配 Provider 时返回；创建后不会随时间改变。 | R2 L33-L41、L141-L164、L217-L225；R3 L950-L966 |
| 没有合理默认值时使用 `null` | `null` 应反映“当前没有可用值”，不要用空 ID、空名称或类型断言伪造领域对象。 | R2 L35；R5 L287-L307；R6 |
| 默认值不会与 Provider 值合并 | 找到 Provider 后直接使用其 `value`；Context 不会自动浅合并字段或补缺失值。 | R2 L73-L75；R3 L41、L952-L958 |
| Context 必须由同一对象连接 | 两次 `createContext` 即使名字和默认值相同，仍是两个独立 Context；提供方和读取方必须使用严格相等的对象。 | R4 L839-L842；R3 L45-L47、L1348-L1354 |

固定源码补充：S1 L18-L33 将传入的 `defaultValue` 初始化到 Context 的内部 renderer 字段，S1 L35-L39
把 `.Provider` 指回同一 Context 对象。这里的内部字段只证明初始化和兼容引用，不是可以由应用直接读写的
全局状态。

### 2. 提供值与两种 Provider 写法

| 主张 | 精确含义 | 来源 |
| --- | --- | --- |
| React 19 的推荐写法是 `<SomeContext value={value}>` | Context 对象本身可以作为 JSX Provider，`value` 传给其子树中任意深度的读取组件。 | R2 L49-L75；R4 L867-L874 |
| `<SomeContext.Provider value={value}>` 是旧版本写法 | React 文档将 `.Provider` 标为 React 19 以前的 legacy 写法；在固定的 React 19.2.8 实现中，S1 L31-L35 仍将 `.Provider` 指向同一 Context，因此兼容旧代码时可按项目版本保留它。新正文统一展示 React 19 写法。 | R2 L43-L70；S1 L31-L39 |
| `value` 是必需的公共输入 | React 19.2.8 的 Provider 更新路径读取 `pendingProps.value`；开发模式下缺少 `value` 会警告，语义等同于提供 `undefined`。 | R3 L1356-L1387；S3 L3612-L3627 |
| Provider 只建立子树可见范围 | `value` 对 Provider 的 `children` 及其后代读取组件可见；中间组件不需要读取或转发该值。 | R2 L49-L75；R4 L706-L735、L867-L874 |
| Provider 不负责生成、持久化或转换值 | State、事件或其他明确数据源生成 `value`；Provider 只把已确定值放到树上。 | R2 L141-L164、L217-L225；R3 L178-L199 |

固定源码补充：S2 L78-L122 将当前值压入栈并写入下一值，S2 L124-L147 在离开 Provider 子树时恢复之前
的值。这解释了嵌套 Provider 为什么是局部环境，而不是修改一个全局变量。

### 3. `useContext` 的读取与树查找

| 主张 | 精确含义 | 来源 |
| --- | --- | --- |
| Hook 必须在组件顶层读取 | `useContext(SomeContext)` 不能放进事件处理器、条件、循环或嵌套函数；本课只把它作为读取规则和 Hooks 调用规则的交点说明。 | R3 L21-L31、L54-L66 |
| 读取最近的祖先 Provider | React 从调用组件所在位置向父树查找同一个 Context，最近匹配 Provider 的 `value` 胜过更上层 Provider。 | R3 L39-L47、L66-L88；R2 L73-L75 |
| 同一组件返回的 Provider 不影响该组件自己的读取 | Provider 必须在调用 `useContext` 的组件上方；同一次 render 返回的子树不会反向影响调用方。 | R3 L43-L47、L86-L90、L1348-L1354 |
| 查找可以穿过任意中间组件 | 中间组件只要保留实际 `children` 子树，读取组件就能取得祖先值；中间组件不需要声明同名 Prop。 | R4 L706-L735、L867-L874 |
| 嵌套 Provider 是局部覆盖 | 同一 Context 嵌套时，内层值只对自己的子树生效；子树外的兄弟继续使用外层值。 | R2 L73-L75；R4 L463-L479、L839-L842；S2 L78-L147 |

固定源码补充：S2 L529-L570 从当前 renderer 的 Context 值建立读取依赖，并把读取时的值保存为
`memoizedValue`；S2 L227-L267 只对依赖同一 Context 对象的消费者安排更新。

### 4. 值变化、`Object.is` 与 `memo`

| 主张 | 精确含义 | 来源 |
| --- | --- | --- |
| Provider 值变化会更新读取组件 | React 会让读取该 Context 的组件获得最新值；这不是由读取方手动调用 setter 完成的。 | R3 L39-L47、L178-L199；R2 L141-L164 |
| 更新判定使用 `Object.is` | 前后 Provider `value` 通过 `Object.is` 比较；相同原始值或相同对象引用不会被视为新的 Context 值，新对象/新函数引用会被视为不同。 | R3 L45-L47、L1291-L1342；S2 L389-L403、L465-L485 |
| `memo` 不能阻断新 Context 值 | 即使读取组件用 `memo` 跳过了 props 比较，Context 变化仍会让它收到新值。 | R3 L45-L47；S2 L465-L485 |
| Provider 重新渲染和 Context 值变化不是同一件事 | 父组件重新渲染可能仍按普通 React 规则渲染子树；`Object.is` 只描述 Context 值传播是否被判定为变化，不是所有 render 行为的总开关。 | R3 L45-L47、L1291-L1342；S2 L465-L485 |
| 对象值的引用身份属于公共使用后果 | `<AuthContext value={{ currentUser, login }}>` 每次提供方重新渲染都会创建新对象，React 会据此通知读取者；官方把 `useMemo`/`useCallback` 标为性能优化，不在本科主线展开。 | R3 L1291-L1342 |

教学中应同时给出两种反例：不必要地每次创建新对象会导致 Context 值变化；原地修改同一个对象后仍传入
同一引用，则 `Object.is` 可能判定未变化，读取方不能把它当成可靠的更新来源。后者还违反 State 不可变更新
的既有约定，修复方式是创建新的对象引用，而不是绕过 Context 比较。

### 5. 缺失 Provider 与显式 `undefined`

| 树形状态 | 读取结果 | 教学合同 |
| --- | --- | --- |
| 父树完全没有匹配 Provider | `createContext(defaultValue)` 的静态默认值 | 适合脱离 Provider 仍有合理行为的主题、语言、密度等环境信息。 |
| 有匹配 Provider，`value="compact"` | `"compact"` | Provider 值替代默认值，不与默认对象合并。 |
| 有匹配 Provider，`value={undefined}` | `undefined` | 不会回退默认值；如果 `undefined` 不是领域值，应在提供前归一化或从类型中排除。 |
| 有 Context JSX 但遗漏 `value` | `undefined`，开发模式应有警告 | 这是 Provider 合同错误，不是“自动使用默认值”。 |

来源：R3 L950-L966、L1356-L1387；S3 L3612-L3627。若默认值本身也是 `undefined`，仅凭读取到的值无法
区分“没有 Provider”和“Provider 明确提供 undefined”；需要用 `null` 或其他领域内可识别的缺失标记建立
更清楚的类型合同。

### 6. TypeScript 类型合同

1. 有合理默认值时，让 `createContext` 从窄联合类型推断，或显式写出泛型，例如
   `createContext<Theme>('system')`。R5 L243-L287 说明类型从 `createContext` 参数推断。
2. 必须提供的对象使用 `createContext<Workspace | null>(null)`，读取处先判断 `null`；R5 L287-L307
   推荐在专用读取边界做运行时检查。I05 只讲这种类型和检查的原因，不把自定义 Hook 设计扩展成另一课。
3. 在 `strictNullChecks: true` 时，`null` 和 `undefined` 是独立类型，不能当作具体领域值直接使用；R6
   的官方 TSConfig 说明了这一点。类型断言 `{} as Workspace` 只会隐藏缺失 Provider，不能创造有效数据。
4. Context 的类型只描述同一职责的数据。多个互不相关的字段不应因为“少建一个文件”而挤进同一个大对象；
   组合或拆分的判断还要看语义和作用域，而不是只看字段数量。

## 组合与拆分 Context 的选择

这是课程设计推导，不是 React 对 Context 数量的硬性规定。R4 L839-L842 明确不同 Context 彼此独立，R4
L854-L863 给出主题、当前账号、路由和状态等不同使用场景。

| 选择 | 适合条件 | 代价/注意 |
| --- | --- | --- |
| 一个 Context 放一个小对象 | 字段属于同一领域合同，总是由同一 Provider 边界提供，消费者经常一起读取 | 对象引用变化会让读取该 Context 的组件一起收到新值；不要塞入无关领域 |
| 拆成多个 Context | 语义不同、作用域不同、提供方不同，或组件只需要其中一类信息 | Provider 可以嵌套，但每个 Context 都必须从稳定模块导出，不能重复创建 |
| Props | 只跨一两层、只有少数消费者、调用方应清楚看到依赖 | 可能需要显式转发，但依赖可见、组件更易复用 |
| `children` 组合 | 中间布局只负责位置，不应理解数据；可以把已配置 JSX 直接传给布局组件 | 需要先重画组件边界，不能用来掩盖真实的共享环境信息 |
| Context | 多个远距离分支需要同类环境值，中间层不应转发，Provider 边界自然 | 输入来源较隐蔽；Context 不是全局 State、远程缓存或第三方 Store |

设计判断：如果两个字段总是同一作用域、同一更新来源且属于一个可命名的领域值，可以组合；如果只有
“现在都放在页面根部”这一点相同，就应拆分。拆分理由应写成语义和边界，而不是用未经测量的性能断言。

## 常见错误合同

| 错误 | 触发条件 | 根因 | 结果 | 修正与验证 |
| --- | --- | --- | --- | --- |
| 在组件内 `createContext` | render 中声明 Context | 每次调用产生新对象身份 | 提供方和读取方可能连接到不同通道 | 模块顶层导出；确认双方使用同一引用（R2、R3、S1） |
| 把默认值当动态 State | 修改 `createContext` 参数期待读取更新 | 混淆静态 fallback 与 Provider `value` | 值不随交互变化 | State/事件产生 `value`，Provider 只负责提供（R2、R3） |
| Provider 放在读取方下方 | 同一组件先 `useContext` 再返回 Provider | Context 只向父树查找 | 读取到外层值或默认值 | 拆出子组件，让 Provider 包住真实读取方（R3） |
| 省略或拼错 `value` | `<Context>{children}</Context>` 或使用 `theme=` | Provider 公共输入名是 `value` | 读取到 `undefined` 并出现开发警告 | 显式传 `value={...}`（R3、S3） |
| 认为 `undefined` 会回退 | Provider 值为空时期待 defaultValue | 把“无 Provider”和“有 Provider 但值为空”混同 | 读取到 `undefined` | 归一化、允许 `undefined`，或用 `null` 表达缺失（R3、R5） |
| 重复 Context 对象 | 两个模块分别 `createContext`，或构建产物含重复模块 | 忽略对象身份 | 读取方只看到自己的默认值 | 统一导出/导入；检查提供方与读取方 `===`（R3、R4） |
| 以为内层覆盖修改外层 | 内层 Provider 改变后期待兄弟读取内层值 | 把最近匹配当作全局赋值 | 误扩大 Provider 范围 | 同时观察内层读取方和内层外兄弟（R2、R4、S2） |
| 原地修改对象仍传同一引用 | 修改 `value` 对象字段后不创建新对象 | `Object.is` 判定引用未变 | Context 传播可能不发生 | 使用不可变更新创建新引用；不要把 Context 当可变容器（R3、S2） |
| 每次渲染都内联新对象 | Provider 父组件频繁重新渲染 | 新对象引用天然不等于旧对象 | 读取者收到不必要的 Context 变化 | 先保持值形状简单；需要时再按测量引入 `useMemo`，不在本课展开（R3） |
| 只因 Props 经过几层就全局化 | 单一短路径建立 Context | 忽略依赖可见性和 `children` 组合 | 组件复用和测试需要隐藏 Provider | 先评估 Props/`children`，再决定 Context（R4） |

## 固定实现推导与边界

### React `v19.2.8` 中可以确认的实现事实

1. S1 L14-L46 的 `createContext` 为 Context 建立内部默认值槽、`.Provider` 和 `.Consumer` 引用；在
   React 19 可直接渲染 Context 对象时，`.Provider` 仍指向同一个对象。这解释了两种 JSX 写法为何能连接到
   同一 Context，但不能让课程依赖私有 `_currentValue` 字段。
2. S2 L78-L147 的 `pushProvider`/`popProvider` 用栈保存和恢复值。嵌套 Provider 离开后回到外层值是实现上
   可观察且与公共文档一致的结果；栈字段和 renderer 分支不是应用层 API。
3. S2 L227-L267 在依赖 Context 对象严格匹配时给读取 Fiber 安排工作；S2 L529-L570 记录读取时的 Context
   对象与快照。Context 的连接关键是对象身份，而不是 Context 变量的字符串名字。
4. S2 L389-L403 收集父 Provider 变化时调用 `Object.is`，S2 L465-L485 在 props/state 已经 bailout 后仍检查
   Context 依赖。这为“`memo` 不能阻断新 Context 值”提供固定实现证据；公共结论仍以 R3 的说明为准。
5. S3 L3612-L3627 从 Provider props 读取 `value` 并进入 `pushProvider`，开发模式缺失 `value` 会警告。内部
   warning 文案和 Fiber 函数名可能变化，不应成为课程合同。

### 本科范围的解释边界

应掌握：Context 是什么、何时创建、默认值如何设计、两种 Provider 写法、最近祖先和嵌套覆盖、`undefined`
与缺失的差异、`Object.is` 与引用身份、`memo` 的基本边界、模块身份、Props/`children`/Context 选择、
`T | null` 和基本运行时检查。

不要求掌握：Fiber 树和 lane 调度、renderer 双通道、Context selector、外部订阅协议、Server/RSC 传递、
第三方 Store、Reducer 状态转换、复杂对象/函数性能优化、编译器自动 memo 化。正文可以用一小段“源码事实与
课程推导”说明内部证据，但不能把私有字段或调度过程变成背诵内容。

## 三篇旧课程的审计

### `create-context`

| 动作 | 审计结论 |
| --- | --- |
| 保留 | 模块顶层创建；Context 对象是通道身份；静态默认值；有意义默认值与 `T \| null`；Provider 明确 `undefined` 不回退；Props/`children` 的使用边界；React 19 直接 Provider 语法。 |
| 补充 | 明确 React 19 `<Context value>` 与 `.Provider` 兼容关系；加入重复模块/重复对象身份；加入 `Object.is` 和 Provider 值身份的最小说明；补足“有 Provider 但值为空”与“无 Provider”两维表。 |
| 删除 | 只服务于独立旧课的“下一课/第几课”叙事；把最小 `useContext` 观察写成另一条完整教学主线；把 Reducer、外部 Store、服务端能力写进正文范围。 |
| 移动 | 把默认值三种边界、TypeScript 类型设计和 Context 身份放到综合课的“创建与合同”部分；把 Provider 放置和读取方示例移到同一课的“提供与读取”部分。 |
| 合并 | 与 `use-context` 和 `provider-scope-and-overrides` 合并为单一 Context 心智模型，保留创建 API 作为开头而不是独立终点。 |
| 新增 | 一个可同时观察默认值、显式 `undefined`、动态 Provider、嵌套覆盖和稳定 Context 身份的同源 Demo；新增空值和重复模块的负向代码片段。 |

### `use-context`

| 动作 | 审计结论 |
| --- | --- |
| 保留 | 顶层调用；最近祖先 Provider；同一组件返回的 Provider 不影响当前读取；中间组件可透明传递；Provider 值改变后的最新读取。 |
| 补充 | `Object.is` 的引用语义；`memo` 不能阻断 Context；Provider 内联对象的新引用后果；重复模块导致的 `===` 身份断裂；遗漏 `value` 的开发警告边界。 |
| 删除 | 重复解释 `createContext` 默认值、重复的 Props 选择表、单独 Demo 的静态/动态双栏叙事；正文不引出复杂性能优化。 |
| 移动 | 把 `undefined` 和 `T \| null` 的完整合同集中到统一“缺失与显式空值”部分；把最近 Provider 与嵌套覆盖放到同一棵树图中。 |
| 合并 | 与另外两课合并，作为综合课的“读取与更新”部分；`useContext` 仍是读取入口，但不独立保留为重复菜单条目。 |
| 新增 | `memo` 包裹的读取组件、对象值引用示例和“默认值不随运行时变化”的简短对照；源码推导引用 S2 的依赖快照和 bailout 检查。 |

### `provider-scope-and-overrides`

| 动作 | 审计结论 |
| --- | --- |
| 保留 | Provider 只影响 `children`；同一 Context 的最近匹配；内层覆盖和内层外兄弟恢复；不读取 Context 的中间 `LayoutShell`；Provider 最小共同边界。 |
| 补充 | 让作用域图同时显示无 Provider 默认值、外层值、内层值和离开内层后的恢复；明确内层 Provider 不修改 Context 对象或外层 State。 |
| 删除 | 将 Reducer、状态转换、持久化和复杂数据源写进作用域示例；删除独立课程编号和拆课叙事。 |
| 移动 | 把 `useState` 仅保留为演示 Provider `value` 的来源；把“组合/拆分 Context”的设计判断移到统一边界章节。 |
| 合并 | 和前两课合并为同一棵树中的 outer/inner/consumer 观察，不再维护第三个独立作用域 Demo。 |
| 新增 | 内层 Provider 可切换为移除/覆盖；固定一个 `memo` 读取组件观察外层值变化；增加同一 Context 对象身份说明。 |

## 三套旧 Demo 的审计与综合 Demo 合同

### 旧 Demo 处理

| Demo | 保留 | 补充 | 删除/移动 | 最终动作 |
| --- | --- | --- | --- | --- |
| `create-context/default-contract-demo` | 无 Provider、`compact` Provider、显式 `undefined` 三种情形；`Workspace \| null` 类型合同。 | 让同一 Context 贯穿所有情形；增加“默认值静态不变”和旧 `.Provider` 兼容的源码对照。 | 删除只比较两个不同 Context 的 `Object.is` 文案，它不能模拟重复模块；把类型合同并入综合 Demo 的说明区。 | 合并其可观察状态，不保留独立 Demo ID。 |
| `use-context/read-current-value-demo` | Provider 由 State 驱动；点击后读取组件同步更新；无 Provider 的默认值。 | 增加 `memo` 读取组件和 Provider 位置错误的静态代码片段；显示前后 value 的 primitive/object identity 说明。 | 删除与第一套 Demo 重复的默认值面板；把单一切换按钮改成综合 Demo 的 outer value 控件。 | 合并读取和更新行为。 |
| `provider-scope-and-overrides/scope-boundary-demo` | Header、Editor、Footer 三个作用域；外层/内层独立切换；中间 children 组件。 | 增加 inner Provider 移除后回到 outer/default 的路径；保留内层外兄弟观察。 | 删除独立“作用域”标题与重复 Provider 说明；不加入 Reducer 或外部数据源。 | 合并为综合 Demo 的嵌套区域。 |

### 建议的一个综合同源 Demo

Demo 使用模块顶层唯一导出的 `DensityContext`（值类型可设计为
`'comfortable' | 'compact' | undefined`，默认值为 `'comfortable'`），所有运行组件和源码展示都来自同一
TSX 文件；样式来自同一 Demo 的 CSS 文件。交互不依赖网络、随机数、时间、Effect 或第三方库。

建议保留四块同时可见的观察区，避免切换后失去对照：

1. **默认区：** 不包 Provider 的 `DefaultReader` 始终显示 `'comfortable'`，证明静态 fallback 不受外层
   Provider State 影响。
2. **外层区：** `OuterReader` 位于外层 Provider 下，控件在 `'comfortable'`、`'compact'` 和
   `undefined` 间切换，显示最近 Provider 值；用同一 Context 的 `memo` 包装读取组件，证明新 Context 值
   不被 `memo` 阻断。
3. **嵌套区：** Header/Editor/Footer 由 `LayoutShell` 保留 children；Editor 子树可启用或移除内层
   Provider。启用时 Editor 读取 inner，Header/Footer 读取 outer；移除后 Editor 回到 outer，外层切换不
   破坏 inner 固定值。
4. **合同区：** 显示 `WorkspaceContext` 的 `Workspace | null` 类型片段、缺少 `value` 的负向代码和
   “提供方/读取方必须使用同一 Context 对象”的说明。重复模块本身不能在一个打包 Demo 中可靠伪造，改由
   正文代码和官方来源解释，不把静态文字冒充运行验证。

综合 Demo 的可观察目标是：默认值只在无 Provider 时出现；显式 `undefined` 不回退；最近祖先决定值；
内层覆盖只影响自己的子树；Context 值变化按 `Object.is` 判断；`memo` 不能挡住新值；Context 对象身份
必须稳定。对象值的引用变化可以在源码观察区用一个最小例子说明，但不引入 render 计数或复杂性能测量。

## 正文结构与本科边界建议

正文标题应直接命名知识点，不出现目标编号、计划、批次、迁移、构建、测试、复审、篇幅或前后课程叙事。
按课程内容规范组织为：

1. 学习目标：创建、提供、读取、预测覆盖和判断 Props/Context 边界。
2. 为什么需要：短路径 Props 与深层环境信息的对照。
3. 核心概念：Context 身份、默认值、Provider 子树、最近祖先、`useContext` 读取。
4. 用法与示例：React 19 语法、旧 `.Provider` 兼容、TypeScript `T | null`、State 提供动态值、嵌套覆盖。
5. Demo：复用上述四块综合观察区。
6. 易错使用提示：组件内创建、默认值动态化、Provider 放置、漏 `value`、显式 `undefined`、重复模块、
   `memo`、对象引用、过度使用 Context。
7. 源码推导与适用场景：只列公共行为和少量固定源码证据，明确内部实现不等于公共承诺。
8. 练习：画出 Provider 树、预测四个读取方、补全 `T | null` 检查、解释 `Object.is` 结果。
9. 本节小结：用“同一对象、最近祖先、无 Provider 才默认、值身份决定传播”四条规则收束。
10. 参考资料：R1-R6 和必要的 S1-S3 链接。

不应在正文加入 reducer/dispatch、第三方 store、服务器组件、RSC、请求缓存或复杂 memo 化方案。源码
推导可以提到“内部按 Context 身份记录依赖并在比较后安排更新”，但不要求学习者理解 Fiber、lane 或双
renderer 字段。

## 实现阶段验收合同

- 课程正文、Demo、entry/demo manifest、Track 和进度迁移必须只保留目标条目及明确的历史来源处理；旧 URL
  不重定向。
- Markdown 必须满足课程固定章节和标题编号；正文不能出现生产过程叙事。Demo 的运行组件与源码展示必须
  由同一 TSX/CSS 源文件提供，中文职责注释位于新增方法上方。
- Playwright 代表路径应验证：默认区、三种 outer value、inner 启用/移除、外层和内层独立切换、memo 读取
  更新、源码展开；桌面、390px 和 200% 根字号下无横向溢出、裁切、重叠，console/page error 和失败请求为 0。
- 临时类型负向检查可放在 `/tmp`，验证后清理，不在仓库保留测试资产；CSS 继续禁止 `grid`、`gap` 和负
  `letter-spacing`。
- 任何实现阶段的命令、浏览器结果、源码 hash 和审查结果只能写入计划或 signoff 证据，不能进入学习者正文。

## 核心结论

Context 不是全局可变变量，而是由稳定对象身份连接的树形环境通道。`createContext` 定义静态 fallback，
Provider 把一个确定的 `value` 放进自己的 `children` 子树，`useContext` 从调用方父树选择最近匹配值；
只有完全没有 Provider 才使用默认值，Provider 明确提供 `undefined` 时不会回退。Context 值前后按
`Object.is` 判断，`memo` 不能挡住新 Context 值，重复模块或重复创建对象会让通道断开。短路径优先 Props
或 `children`，跨远距离且边界清楚的同类环境信息才适合 Context；多个 Context 的组合或拆分应依据领域
语义和作用域，而不是把 Context 当作无边界容器。
