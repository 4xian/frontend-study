# BL1「实战：静态课程目录」官方研究记录

## 研究状态与冻结边界

- 课程 ID：`react.core.learn.basics.lab-static-course-catalog`
- 左侧短标题与正文标题：`实战：静态课程目录`
- 课程类型：React Core 基础阶段实战课，`beginner` 本科基础范围。
- 研究日期：`2026-08-16`
- React 文档基线：React `19.2`；仓库运行时基线：React / React DOM `19.2.8`。
- 类型与工具基线：TypeScript `6.0.3`、Vite `8.1.5`。
- 生产写回边界：本轮只允许新增本研究文件；不修改课程正文、Demo、CSS、entry/demo
  manifest、Track、计划、依赖或其他资产。

本课只组合已经具备的静态数据、函数组件、模块拆分、Props、`children` 或最小命名区域、条件
分支、`filter`、`map` 与稳定 `key`。以下内容明确禁止进入课程、Demo 或练习：State、事件、Hook、
表单、Effect、路由、数据请求、测试叙事、组件纯度新教学，以及任何后续课程的 API 或概念。

研究开始时目标文件不存在；工作区已有大量与本课无关的 staged、unstaged 和 untracked 资产。本轮
不暂存、不提交、不清理、不恢复，也不读取后续课程正文或资产。

## 来源与检索说明

按仓库规则首先使用 Tavily 对 React、TypeScript、Vite 与 ECMAScript 官方域执行四次检索，四次均
返回相同的用量上限错误：`This request exceeds your plan's set usage limit`。随后按固定顺位切换
Exa，仅用于发现和提取已知官方 URL；下表只把官方文档与规范原文作为事实来源，Exa 不作为课程来源。

| ID | 一手来源 | 固定范围 | 本记录采用的证据 |
| --- | --- | --- | --- |
| `R01` | [React Versions](https://react.dev/versions) | React 官方当前文档 | `react.dev` 当前提供 React `19.2` 文档。 |
| `R02` | [Your First Component](https://react.dev/learn/your-first-component) | React 文档 `19.2` | 函数组件、可复用与嵌套组件、组件顶层定义。 |
| `R03` | [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components) | React 文档 `19.2` | 把组件拆到文件、对应的默认/具名导入导出、root component file。 |
| `R04` | [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) | React 文档 `19.2` | 父子 Props、任意 JavaScript 值、只读快照、嵌套 JSX 成为 `children`。 |
| `R05` | [Conditional Rendering](https://react.dev/learn/conditional-rendering) | React 文档 `19.2` | 使用普通 JavaScript `if`、三元、`&&` 与 `null` 选择 JSX。 |
| `R06` | [Rendering Lists](https://react.dev/learn/rendering-lists) | React 文档 `19.2` | `filter`/`map`、直接列表项的 `key`、兄弟级唯一、稳定 ID、`key` 不进入 Props。 |
| `R07` | [Understanding Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree) | React 文档 `19.2` | 单次 render 的组件树、父子组件关系、模块依赖树与 render tree 的区别。 |
| `R08` | [TypeScript Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties) | TypeScript Handbook | 对象类型、可选字段与 `readonly` 只在类型检查期限制写入。 |
| `R09` | [TypeScript JSX](https://www.typescriptlang.org/docs/handbook/jsx.html) | TypeScript Handbook | `.tsx`、函数组件首个参数作为 Props 类型、JSX attribute 类型检查。 |
| `R10` | [Vite Features](https://vite.dev/guide/features.html#glob-import) | Vite `8` 官方文档 | Vite 支持 `.tsx`；`import.meta.glob` 默认懒加载并要求字面量 glob。 |
| `R11` | [Vite Static Asset Handling](https://vite.dev/guide/assets.html#importing-asset-as-string) | Vite `8` 官方文档 | `?raw` 把资产导入为字符串，用于同源源码展示。 |
| `R12` | [ECMAScript 2026 `Array.prototype.filter`](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.filter) | ECMAScript 2026 | `filter` 对存在的数组项调用回调，并构造通过布尔测试的新数组。 |
| `R13` | [ECMAScript 2026 `Array.prototype.map`](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.map) | ECMAScript 2026 | `map` 对存在的数组项调用回调，并用回调结果构造新数组。 |

## 已学知识与实战责任

本实战不重新承担单个知识点的完整教学，只要求学习者把下列合同放进同一个可运行结果：

| 已学能力 | 本实战中的唯一职责 | 禁止扩展 |
| --- | --- | --- |
| 函数组件 | 用有名称、顶层定义的组件表达目录外壳、列表和列表项。 | 不讲组件纯度、调用时序或生命周期。 |
| 模块拆分 | 数据、外壳、列表与 Demo 入口分文件，通过匹配的 import/export 连接。 | 不讲动态导入、分包、tree shaking 或路径别名设计。 |
| Props | 父级把只读课程数组、标题和计数传给子组件。 | 不传事件回调，不引入可写数据通道。 |
| `children` / 命名区域 | 外壳用 `children` 接收主要目录，用一个命名 `ReactNode` 区域接收组件树观察面板。 | 不使用 render prop、`Children`、`cloneElement` 或隐式注入。 |
| 条件渲染 | 空结果用提前返回；推荐标记用 boolean 条件显示。 | 不使用交互改变条件，不把数字直接放到 `&&` 左侧。 |
| 列表与 `key` | 固定数据先 `filter` 再 `map`，`key` 来自课程稳定 `id`，并放在 `map` 直接返回的组件上。 | 不使用索引、随机值、标题或 render 时生成的 ID。 |

## 逐 claim 事实账本

| Claim | 可写入课程的事实 | 来源 | 生产措辞与边界 |
| --- | --- | --- | --- |
| `C01` | React 组件是可复用、可嵌套的 UI 单元；函数组件使用 JavaScript 函数定义。 | `R02` | 用组件给目录外壳、列表和列表项命名；不把“拆得越多越好”写成 React 规则。 |
| `C02` | 组件可以留在同一文件，也可以拆到不同文件；跨文件使用需要对应的 export 与 import。 | `R03` | 文件拆分服务于本实战的职责识别；默认/具名风格沿用仓库现有写法，不扩展模块体系。 |
| `C03` | 组件定义应位于模块顶层，组件通过 JSX 嵌套使用。 | `R02` | 所有 Demo 组件都在模块顶层声明；不在根组件函数体内临时定义子组件。 |
| `C04` | 父组件通过 JSX attribute 向子组件传 Props，Props 可以是对象或数组等 JavaScript 值。 | `R04` | `CourseList` 接收 `readonly Course[]`；调用方拥有静态数据，子组件只读取。 |
| `C05` | Props 是只读快照；组件不应修改收到的对象或数组。 | `R04`, `R08` | 正文只要求“读取静态输入”，不借此新增纯度或不可变 State 教学。 |
| `C06` | 嵌套在组件标签中的 JSX 通过 `children` prop 交给外壳，外壳决定插入位置。 | `R04` | `CatalogFrame` 用 `children` 放置主要目录；只增加一个职责明确的 `inspector` 命名区域。 |
| `C07` | React 条件渲染使用普通 JavaScript 控制流；`if`、三元和 boolean `&&` 可选择不同 JSX 或空结果。 | `R05` | 空数组分支用 `if` 提前返回，推荐标记用 boolean `&&`；不创建可改变条件的控件。 |
| `C08` | `filter` 构造只含通过测试项目的新数组。 | `R06`, `R12` | 固定规则 `course.published` 负责“保留谁”；不讲深拷贝、更新或排序。 |
| `C09` | `map` 把数组项目转换为 JSX 列表。 | `R06`, `R13` | `publishedCourses.map(...)` 负责“每项长成什么”；不引入 React 专属循环叙事。 |
| `C10` | `map` 直接产生的 JSX 列表项需要 `key`；`key` 应在兄弟间唯一且跨 render 稳定。 | `R06` | 使用静态数据已有的 `course.id`；`key` 放在直接返回的 `<CourseCard>` 上。 |
| `C11` | `key` 不作为普通 prop 传给组件；组件需要业务数据时必须通过普通 Props 接收。 | `R06` | `CourseCard` 通过 `course` prop 读取 `id` 与文本，不读取 `key`。 |
| `C12` | render tree 表示单次 render 中组件的父子关系，普通 HTML tag 不是组件节点。 | `R07` | 观察面板只列真实函数组件；不把 `<section>`、`<ul>` 或文件节点写进组件树。 |
| `C13` | module dependency tree 的节点是模块，render tree 的节点是组件；两棵树不能互相替代。 | `R07` | 正文可并列给出文件清单和组件树，但不宣称文件层级决定组件父子关系。 |
| `C14` | TypeScript 对象类型可以精确描述字段，`readonly` 防止类型检查期重写对应属性。 | `R08` | `Course` 的字段和数组输入写成只读；明确这是开发期约束，不宣称运行时深冻结。 |
| `C15` | TypeScript 在 `.tsx` 中按函数组件的 Props 参数检查 JSX attributes。 | `R09` | Props 类型只覆盖本实战真实输入，不引入泛型组件、类型体操或 `React.FC`。 |
| `C16` | Vite 支持 `.tsx`，并可用字面量 `import.meta.glob` 建立懒加载模块映射。 | `R10` | 运行组件继续进入仓库既有 `./demos/**/*.tsx` glob；本课不教授 glob API。 |
| `C17` | Vite `?raw` 能把源文件作为字符串导入。 | `R11` | demo manifest 用现有 raw glob 展示实际运行的 TS/TSX/CSS，不复制一份展示代码。 |
| `C18` | 固定输入、固定筛选谓词和无交互控件足以产生确定的静态课程目录。 | `C04`-`C11` 的课程推导 | 这是本实战设计结论，不冒充 React API；刷新后的结果应一致，不使用随机数、时间或外部请求。 |

## 课程正文精确实施合同

### 元数据

正式课程 frontmatter 必须使用以下值：

| 字段 | 冻结值 |
| --- | --- |
| `id` | `react.core.learn.basics.lab-static-course-catalog` |
| `type` | `lesson` |
| `title` | `实战：静态课程目录` |
| `summary` | `组合函数组件、Props、children、条件分支与列表渲染，完成一个无交互的静态课程目录。` |
| `domain / technology / module` | `frontend / react / core` |
| `stage / level` | `basics / beginner` |
| `estimatedMinutes` | `90` |
| `prerequisites` | 仅 `react.core.learn.basics.list-rendering-and-key` |
| `related` | 下方列出的四个现有稳定 ID |
| `tags` | `React`、`实战`、`组件组合`、`Props`、`列表渲染`、`静态目录` |
| `appliesTo` | `React 19.2（运行时 19.2.8）` |
| `verifiedAt` | `2026-08-16` |

`related` 精确写为：

- `react.core.learn.basics.module-boundaries-and-component-tree`
- `react.core.learn.basics.props`
- `react.core.learn.basics.children-and-composition`
- `react.core.learn.basics.conditional-rendering`

`sources` 只登记实际支撑正文结论和适用版本的 `R01`-`R09`；Vite glob/raw 属于 Demo 生产合同，不进入面向
学习者的课程来源，ECMAScript 规范仅在正文直接解释 `filter`/`map` 语义时登记。

### 正文顺序与内容

正式正文仍按课程规范使用唯一一级标题和连续中文二级标题。建议按以下顺序落地：

1. **学习目标**：能够画出组件树、定义静态数据合同、拆分模块、通过 Props/组合连接组件、完成
   `filter -> map -> stable key`，并验收空结果与可见结果。
2. **项目需求**：只描述最终静态课程目录的可见功能、固定数据和完成标准，不出现批次、路线、前后课
   或生产命令。
3. **设计数据合同**：定义 `Course` 的只读 `id`、`title`、`summary`、`level`、`published`、
   `featured`，并建立固定 `readonly Course[]`。
4. **拆分模块与组件树**：给出四个源模块的职责，再画真实 render tree；明确模块树与组件树回答不同
   问题。
5. **实现外壳组合**：`CatalogFrame` 接收 `title: string`、`inspector: ReactNode` 和
   `children: ReactNode`；主要目录使用 `children`，组件树观察面板使用唯一命名区域。
6. **实现筛选列表**：根组件先用固定 `published` 谓词得到 `publishedCourses`，把结果与数量传给
   `CourseList`；列表内部 `map` 返回带稳定 key 的 `CourseCard`。
7. **补齐条件结果**：`CourseList` 对空数组提前返回“暂无已发布课程”；`CourseCard` 只在
   `featured` 为 true 时显示推荐标记。
8. **组装与观察 Demo**：核对可见总数、筛选后数量、被排除的草稿、推荐标记、组件树和展开的全部
   同源源码。
9. **易错使用提示**：只保留模块导入错配、在组件内部定义组件、修改 Props、漏放 `children`、把
   `key` 放进 `CourseCard` 内部、用索引/标题/random key、用假控件暗示筛选可变等高价值错误。
10. **原理与适用场景**：分开陈述官方事实、课程推导和静态项目边界；动态筛选只说明“不在当前项目
    范围”，不得预讲实现方式。
11. **练习与验收**：让学习者增加一条固定课程数据、预测筛选数量、解释组件树和 key 放置位置；不得
    要求点击、输入、状态更新或测试代码。
12. **小结与参考资料**：只保留可用于组装静态 React 页面的方法，不写计划、任务、篇幅、行数、构建
    结果、临时 fixture 或审查结论。

正文不得出现 `BL1`、批次、下一课、后续课程名称、路线完成度、字数/行数目标、测试用例、
`data-testid`、本地依赖清单或验收命令。这些信息只留在本研究记录和后续生产证据中。

## Demo 精确实施合同

### 文件与模块职责

新增目录 `src/categories/frontend/react/core/demos/lab-static-course-catalog/`，只包含：

| 文件 | 职责 |
| --- | --- |
| `course-data.ts` | 导出只读 `Course` 类型和固定 `courses` 数据；不包含函数、请求或可变存储。 |
| `catalog-frame.tsx` | 导出 `CatalogFrame`；固定标题/主体/观察面板结构，接收 `children` 与 `inspector`。 |
| `course-list.tsx` | 导出 `CourseList`，内部定义 `CourseCard`；负责空结果、`map`、Props 与稳定 key。 |
| `lab-static-course-catalog-demo.tsx` | 默认导出 `StaticCourseCatalogDemo`，并定义顶层 `ComponentTree`；固定筛选、数量计算和根级组装。 |
| `lab-static-course-catalog-demo.css` | 仅负责当前 Demo 样式；使用 Flexbox、margin 和普通文档流。 |

所有函数组件都位于模块顶层，每个函数定义上方写一句规范中文职责注释。不要为了展示拆分而新增 barrel、
通用 util、Context、配置对象或一次性抽象。

### 固定数据与可见结果

1. 数据集固定为五门课程，`id` 互不重复；三门 `published: true`，两门 `published: false`；已发布
   课程中仅一门 `featured: true`。标题与摘要使用普通教学主题，不引用课程批次或后续 API。
2. 根组件只执行一次固定规则：`courses.filter((course) => course.published)`。页面明确显示
   “共 5 门，显示 3 门已发布课程”，并只渲染三张课程条目。
3. `CourseList` 接收 `courses: readonly Course[]`；`map` 直接返回
   `<CourseCard key={course.id} course={course} />`。`CourseCard` 从普通 `course` prop 读取业务 ID，
   不尝试读取 `key`。
4. `CourseCard` 使用 `course.featured && <span>推荐</span>`；左值必须是 boolean。空结果分支存在于
   `CourseList`，但不添加按钮切换到空结果。
5. `CatalogFrame` 的 `children` 放置目录主体，`inspector` 放置静态组件树。观察面板必须反映真实
   关系：`StaticCourseCatalogDemo` 的直接子组件是 `CatalogFrame`；`CatalogFrame` 的子组件是
   `CourseList` 与 `ComponentTree`；`CourseList` 的子组件是三个 `CourseCard`。普通 DOM tag 不列为
   组件节点。
6. 页面不得出现 button、input、select、checkbox、链接式筛选标签、可点击卡片、hover 暗示、加载态或
   “请选择/点击筛选”等交互文案。筛选是固定数组转换，不伪装成可操作功能。
7. 不使用随机数、日期、timer、网络请求、浏览器存储或外部资源。重复进入页面时数据、数量、顺序和
   组件树文本保持一致。

### 同源与样式

- Demo ID 冻结为
  `react.core.learn.basics.lab-static-course-catalog.static-catalog-demo`，展示标题为“静态课程目录”。
- `loadComponent` 只加载 `lab-static-course-catalog-demo.tsx` 的默认导出。
- `loadSource` 必须合并上述三个 TSX/TS 运行模块和 CSS；每段以前置 `// <filename>` 标明来源，实际
  运行文件与展开源码逐文件同源，不能维护第二份展示代码。
- 根 TSX 导入同目录 CSS。CSS 禁止 `display: grid`、`grid-*` 与 `gap`；列表和观察面板使用
  `display: flex`、`flex-wrap`、子元素 margin 和普通流。
- 卡片圆角不超过 `8px`，固定格式区域提供合理 `min-width`/`max-width`，390px 与 200% 文本下改为
  纵向排列且无横向溢出、裁切或重叠。静态页面不增加动画。
- 使用语义 `section`、`header`、`ul`/`li`、`aside`；组件树观察面板使用嵌套列表和可读标题，不使用
  仅靠颜色区分的状态。

## Manifest 与 Track 精确合同

1. `entry-manifest.ts` 新增
   `import { meta as labStaticCourseCatalogMeta } from './learn/lab-static-course-catalog.md?catalog-meta'`。
2. `reactCoreContentEntries` 在 `list-rendering-and-key` 条目之后、当前 `event-handling` 条目之前插入
   slug `lab-static-course-catalog`，meta 使用上面的 import，loader 指向
   `./learn/lab-static-course-catalog.md?content-entry`。
3. `react-core-track.ts` 在
   `react.core.learn.basics.list-rendering-and-key` 之后、当前
   `react.core.learn.basics.event-handling` 之前插入课程 ID，状态为 `available`。本课完成前不得提前把
   Track 标为 available；实现闭环时正文、entry manifest 与 Track 原子同步。
4. `demo-manifest.ts` 复用现有 `demoComponents`、`demoSources`、`demoTypeScriptSources` 和
   `demoStyleSources` glob；新增 `labStaticCourseCatalogSourceFiles` 与带规范中文注释的
   `loadLabStaticCourseCatalogSource()`，合并五个真实文件。
5. `reactCoreDemoAssets` 在 B11 Demo 后登记冻结 Demo ID、标题、`runtime: 'react'`、根 TSX
   component loader 与合并 source loader。不得使用 basename 解析，也不得只展示根 TSX 而遗漏运行中
   导入的数据、组件或 CSS。
6. 正文 `:::demo` 只引用冻结的完整 Demo ID。课程 ID、slug、loader、Track ID、Demo ID 和源码路径
   必须逐字一致。
7. 不修改旧 B01-B11 稳定 ID、slug、Demo ID 或正文，不创建旧 URL 重定向，不碰 Reference、进度
   schema、共享运行时或后续课程资产。

## 验收合同与停止点

后续实现只有同时满足以下条件才可闭环：

1. 正文能从固定需求走到完整静态目录，且每个步骤只组合本记录列出的已学能力。
2. Demo 可见五条原始数据对应的总数、三条已发布筛选结果、一个推荐标记和与真实组件一致的组件树。
3. 页面及展开源码中不存在 State、事件、Hook、表单、Effect、路由、请求、测试叙事、随机 key、索引
   key 或伪交互。
4. 运行组件与展示源码覆盖全部四个 TS/TSX 模块和 CSS；entry/demo manifest、Track 与正文 ID 一致。
5. 临时验证只放 `/tmp` 且成功后清理；按规范执行 type-check、lint、聚焦 format、build、Markdown/
   manifest 定向检查，以及桌面、390px、200% 文本浏览器验证。
6. 浏览器应确认刷新深链成功、显示数量为 `3 / 5`、只有三条课程卡片、console 无 error/warning、无
   失败请求、无横向溢出或文本裁切。
7. 这是新课程、Demo 与 manifest 的复杂修改，正式实现完成后需要一次独立 Standards/Spec 审查；
   本研究阶段不执行实现审查，也不授权任何后续课程。

本课停止于“固定数据经过固定条件筛选，并由拆分后的函数组件以 Props、最小组合、`map` 和稳定 key
组装为可观察静态页面”。任何让用户改变筛选条件、编辑课程或加载远端数据的需求都超出本课范围。

## 不采用的结论

1. “实战课必须加入按钮才能证明筛选”不成立；固定输入与固定谓词的可见输入/结果对照已经能验证
   `filter`，按钮会越过本课边界。
2. “静态页面不需要 key”不成立；`map` 直接产生的 JSX 列表项仍需要稳定 key，静态数据已有业务 ID。
3. “文件拆分后文件树就是组件树”不成立；模块依赖与单次 render 的组件父子关系是两套模型。
4. “把所有组件拆成单独文件才算组件拆分”不成立；文件边界应表达实际职责，本合同只保留四个运行
   模块。
5. “`readonly` 会在浏览器中深冻结课程对象”不成立；它是 TypeScript 类型检查期约束。
6. “`key` 会自动成为 `CourseCard` 的 `courseId`”不成立；业务 ID 必须通过普通 Props 传入。
7. “用隐藏的 input、不可点击按钮或静态下拉框可以模拟筛选 UI”不采用；这会伪造交互并误导学习者。
8. “课程正文需要记录 BL1、计划、命令、测试或审查过程”不成立；这些仅属于研究和生产证据。

## 本研究文件验证要求

- 只对本文件运行聚焦 Prettier 检查，不格式化仓库其他文件。
- 分别对本文件执行 unstaged 与 staged `git diff --check`；目标文件应保持 untracked，除非用户另行
  授权暂存。
- 不运行会写入其他批次资产的命令，不提交代码，不改变任何既存工作区状态。
