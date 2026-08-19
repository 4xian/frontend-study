# IT 学习站前端规范

> 版本：v2.5
> 日期：2026-08-19
> 状态：已生效
> 全站架构：[`IT学习站架构设计.md`](../architecture/IT学习站架构设计.md)

## 1. 项目定位与前端范围

本项目是可持续扩展的 IT 学习站，前端只是与后端、网络并列的内容领域。本规范只定义前端框架与
工程化内容，不替其他领域制定课程结构。

前端内容统一分为：

- `learn`：按明确前置关系完成的课程。
- `reference`：按官方分类查阅的语法、类型、配置、函数和运行边界。
- Demo：在 Module 总览内使用真实源码或外部 HTTPS 地址展示可观察行为。

当前前端范围为 Vue 生态、TypeScript、Vite、React SPA 与客户端生态，以及围绕这些技术的测试、
构建部署、性能和质量。HTML、CSS、JavaScript 基础课程暂不建设；课程可以声明前置要求，但不得在
单篇框架课程中临时复制一套基础语言教程。Next.js、Nuxt、账号同步和在线 Playground 继续延期。

## 2. 信息架构

固定层级为：

```text
Domain -> Technology -> Module -> ContentType -> Slug
```

前端 Domain 固定为 `frontend`。Technology 首批使用 `vue` 和 `engineering`，后续经调研后可以增加
`react`；Module 分别表达 `core`、`router`、`pinia`、`typescript`、`vite` 等稳定学习边界。

每个 Module 提供一个独立总览，在总览内切换课程、Reference 和 Demo。课程可以按基础、中级、高级
分组，但阶段只进入 manifest 和正文元数据，不创建额外 URL 层级。未实施技术不进入运行时 Catalog，
不显示空卡片或伪链接。

目标文件位于：

```text
src/categories/frontend/<technology>/<module>/manifest.ts
src/categories/frontend/<technology>/<module>/learn/<slug>.md
src/categories/frontend/<technology>/<module>/reference/<slug>.md
src/categories/frontend/<technology>/<module>/demos/<slug>/...
```

`src/content/` 与旧顶层页面目录已经删除，不得恢复或建立第二套内容来源。

## 3. 内容接口

Catalog 是目录、路由、搜索、相邻条目、进度和正文懒加载的唯一外部接口。页面不能解析文件路径、
`import.meta.glob` 结果、frontmatter 或单个 manifest 的内部结构。

课程和 Reference 正文统一使用 Markdown，通过 `common/markdown` 转换为统一的内部内容接口：

- Lesson：目标、正文、练习和总结。
- Reference：检索签名、正文、锚点和补充说明。

两类正文共享基础元数据与受控内容块，但保持独立 layout 和信息顺序。Demo 使用独立 manifest 定义，
不伪装成正文类型。首页、总览和搜索只能加载轻量元数据，不能执行所有正文、Demo 或高亮语言模块。

## 4. 路径、稳定 ID 与命名

详情路由固定为：

```text
/frontend/<technology>/<module>/learn/<slug>
/frontend/<technology>/<module>/reference/<slug>
```

Technology 和 Module 总览分别使用：

```text
/frontend/<technology>
/frontend/<technology>/<module>
```

文件路径不自动生成路由。URL 由 module manifest 中的显式字段生成；移动文件需要更新 import、loader
和对应验证入口，但不能悄悄改变公开 slug。

稳定 ID 例如：

```text
engineering.typescript.learn.basics.type-inference
vue.core.reference.reactivity.ref
react.core.learn.basics.state
```

稳定 ID 不从标题或新路径重新生成。课程阶段变化也不修改 ID。路径段和文件名使用 kebab-case，Vue
组件使用 PascalCase，变量和方法使用 camelCase。课程顺序和 Reference 覆盖只能由 module manifest
管理，禁止依赖目录遍历、文件名排序或页面硬编码数组。

## 5. Markdown 与真实性

课程与 Reference 的 frontmatter 至少包含 `id`、`type`、`title`、`summary`、`domain`、
`technology`、`module`、`related`、`tags`、`sources`、`appliesTo` 和 `verifiedAt`。课程另有
`stage`、`level`、`prerequisites` 与 `estimatedMinutes`；Reference 另有 `signature` 和 anchors。

每个条目的版本、签名、默认值和运行行为必须在当前内容批次重新核对官方资料；外部搜索使用 Tavily，
搜索摘要和社区内容只用于发现线索。框架内部实现结论固定到精确 tag 或 commit，并区分公共合同与
课程推导。

课程知识默认采用核验时的最新稳定版本，不得因为站点宿主、冻结项目或兼容工具仍使用旧版，就把旧版
写成当前知识基线。若最新稳定版暂时不能直接进入本地工具链，课程仍以最新稳定版讲解和独立 fixture
取证，同时明确记录本地版本、兼容阻塞、验证差异与升级条件；旧版只作为兼容补充，不得与主线混写。

### 5.1 单知识点成课

一篇课程只承担一个可以独立命名的核心知识点，课程标题、slug、稳定 ID 和主要教学目标必须对应同一
知识点。`Props`、条件渲染、列表渲染等可以独立学习和检索的主题必须分别成课，不得为了减少文件数量
合并为笼统的综合教程。必要的前置概念只做最小解释并链接到对应课程，不能在当前课程内展开第二个
完整知识点。

课程必须从零基础定义开始，依次说明知识点的意义、前置概念、语法、常规用法、可观察示例、易错点、
注意事项、进阶用法、适用边界和练习，并在末尾登记本课实际使用的一手来源。语言保持简洁干练，但
不能用结论清单代替必要的原理、使用条件和验证过程。

课程正文必须围绕知识点本身组织，不得以“第几步创建项目、复制文件、继续添加功能”的项目步骤作为
主要教学结构。跟做步骤只能作为练习或阶段整合内容，不能替代对知识点意义、用法、错误原因和边界的
解释。综合项目只能在阶段整合课或综合 Demo 中复用已经完成的知识点。

面向学习者的课程正文只能出现理解和使用当前知识点所必需的内容。临时 fixture 路径、本地依赖版本、
宿主工具兼容说明、仓库命令、构建结果、源码哈希、浏览器验收数据、Gate 状态、复审结论、计划编号、
批次和完成进度不得混入知识点正文。TypeScript、构建工具或浏览器行为只有在直接构成当前知识点规则
时才进入正文，并且只解释公共合同，不描述本站如何验证该合同。

### 5.2 逐知识点调研与易错点证据

每篇课程在编写前只实时调研当前知识点，不建立独立调研文档。调研优先使用官方 Learn、Reference、
规则、版本说明和固定版本源码；TypeScript、Vite 或浏览器行为必须回到各自官方资料。外部搜索摘要和
二手文章只能用于发现线索，不能直接作为课程事实。关键官方来源直接进入课程 `sources` 和参考资料。

易错点必须说明触发条件、原因、后果、错误示例、正确写法和验证方式。进阶用法也必须交代适用条件与
不适用边界；无法从官方资料、固定版本源码或可复现验证中确认的说法不得写入课程。不得为了后续课程
一次性预写或预调研整批知识点。

课程和 Reference 都必须包含“易错使用提示”以及“源码推导与适用场景”或等价原理章节。详细规则见
[`调研与来源规范.md`](./standards/调研与来源规范.md)。Markdown 只允许受控 AST 与 directive，未知
directive、任意 HTML、无效关联和未知 Demo ID 必须明确失败。

所有技术先遵守本规范和 `standards/` 下的通用规范。确有代码形式、运行宿主或生态边界差异时，再由
对应技术补充规范增加规则；技术补充规范不得重复整套通用规则，也不得覆盖或降低通用要求。React
补充规则见 [`React技术补充规范.md`](./standards/react/React技术补充规范.md)。

## 6. 页面模板

宽屏详情页采用左侧模块导航、中间正文、右侧本页大纲与官方来源。左中右各自拥有滚动语义，正文
滚动不得带动两侧；中窄屏把右侧内容收进页内，移动端由正文顶部按钮打开左侧 Sheet，并在正文末尾
展示官方来源。

切换条目时正文和右侧大纲更新并回到顶部，左侧目录保持同一模块实例和滚动位置。课程、Reference
与 Demo 的具体 authoring interface 分别见：

- [`课程内容规范.md`](./standards/课程内容规范.md)
- [`API参考内容规范.md`](./standards/API参考内容规范.md)
- [`Demo与交互规范.md`](./standards/Demo与交互规范.md)

## 7. 总览、关联与进度

技术中心首页按领域分区并以 Technology 分组，每个 Technology 下按 Module 拆分独立知识类别货架。
领域和 Technology 的标题与说明居中展示；每个 Module 右上角提供主题蓝色的“查看总览”，知识类别
卡片直接进入该类别第一篇已上线课程。卡片保持白色主体和黑灰主文字，通过低饱和强调色区分阶段、
知识点和操作层级，不为不同技术维护独立主题。各级货架进入视口时渐入，并兼容
`prefers-reduced-motion`。首页不提供 Technology 总览页，也不展示 Reference 或 Demo 卡片。Module
总览的课程视图按学习阶段展示知识点，Reference 视图按官方分类展示可搜索名称，Demo 视图只展示真实
可用的本地或外部 Demo。

课程前置关系和下一课由 manifest 决定。跨模块关联只在确实有学习依赖或查阅价值时添加，不能让
Vue Core 课程承担 Router 或 Pinia 的教学任务。右侧“官方来源”只放外部一手来源；站内相关课程与
Reference 放正文末尾。

学习进度只保存在版本化 localStorage 中，并绑定稳定 ID，不绑定 URL。移动文件和标题变化不能丢失进度；
数据损坏时允许回到空状态。当前不创建假想的云同步接口。

## 8. Demo、视觉与响应式

本地 Demo 的运行组件与源码展示必须来自同一份真实源码，使用完整限定 ID，不能按 basename 匹配。
外部 Demo 只允许 HTTPS，并在新标签页打开，不使用 iframe。只有能观察到状态、时序、生命周期、
配置结果或错误边界的主题才需要 Demo；纯类型、编译擦除和平台边界不能用浏览器效果冒充验证。

Demo 可以组合多个强相关知识点，并被对应的多篇单知识点课程复用，用来展示这些知识点在真实场景中
如何协作。组合 Demo 必须明确包含哪些知识点、每个交互在观察什么，并保持运行源码与展示源码同源；
它不能反过来合并课程，也不能替代各篇课程对定义、用法、易错点和边界的独立解释。不适合浏览器
演示的知识点使用编译结果、类型检查或其他与其边界匹配的验证方式。

首页允许明显的空间层级、玻璃材质和连续转场；内容页保持低干扰。样式只使用 flex、正常文档流和
margin，禁止 CSS Grid 与 `gap`。交互必须支持键盘、触摸、390px、200% 文本以及
`prefers-reduced-motion`；动画优先使用 `transform` 与 `opacity`，不能阻塞输入或导航。

## 9. 性能与可访问性

技术中心和总览不预加载正文、Demo、Shiki 语言或未进入 Technology 的运行时。React runtime 只能由
React Demo adapter 按需加载，并在宿主卸载时释放 root。构建验收必须检查产物或网络请求，不能只
根据动态 import 的代码外观推断已经拆包。

页面使用明确的 `header`、`nav`、`main`、`aside` 语义；所有功能可由键盘完成，焦点环可见，弹层
支持焦点锁定、`Esc` 和关闭后焦点恢复。颜色不能是状态的唯一表达，窄屏不能截断内容或缩小触控
目标。

## 10. 文档治理

全站架构定义跨领域长期边界，本规范只补充前端规则，总路线只记录模块顺序和总体状态。每个待实施的
技术模块可以在 `docs/frontend/plans/<technology>/` 新增一份课程计划；一个模块只维护一份现行计划，
只记录阶段、课程顺序、学习终点和完成复选框，不拆分逐课计划或保存逐课日志。

既有覆盖矩阵和历史证据保留其原有用途，但新课程不再新增独立调研记录、审查结果、signoff、closeout
或临时验证报告。历史路径不得重新接入 Catalog、路由或 loader；当前长期入口只使用
`app/common/categories` 架构。

课程内容按知识点严格串行建设，每次只处理一篇课程。当前知识点完成实时调研、正文与所需 Demo/fixture、
最少临时验证、适用时的桌面与 390px 浏览器验证、按风险复审并勾选模块计划后，才能开始下一个知识点。
不得并行编写不同知识点，也不得在开始前一次性调研或预写整批课程。阶段整合和 Gate 只能汇总已经
逐课闭环的结果，不能替代单课验收。临时验证资产只能写入 `/tmp`，验证后删除，仓库不保留测试、调查、
审查或验收文件。

## 11. 当前基线与停止边界

Vue Core、Vue Router 和 Pinia 已完成当前冻结范围。TypeScript 课程为 `24/24`，稳定 Reference 为
`199/199 available`、`0 planned`，11 个观察范围已登记，GT-1 已完成且 Gate T 已通过；统计与维护入口见
[`Vue生态覆盖基线.md`](./coverage-matrices/Vue生态覆盖基线.md) 和
[`TypeScript官方覆盖矩阵.md`](./coverage-matrices/TypeScript官方覆盖矩阵.md)。Vite 课程为 `24/24`，
稳定 Reference 为 `175/175 available`、`0 planned`，15 个实验/弃用观察项和 4 个 deferred 外部证据项
已登记；维护入口见 [`Vite官方覆盖矩阵.md`](./coverage-matrices/Vite官方覆盖矩阵.md)。

TypeScript 和 Vite 已进入维护状态，Gate V 已通过。React R0-B2 已完成；React Core 调整后的权威路线
已达到 `74/74 available`，其中基础 `24/24`、中级 `21/21`、高级 `29/29`，共 `62` 节知识课和
`12` 节实战课。旧 RC1、RC2、RC3 计划只保留历史冻结与逐课证据，现行数量、顺序和状态统一以
[`React课程调整总计划.md`](./plans/react/React课程调整总计划.md) 为准。

React Core Reference 尚未开始，Gate RC 与 Gate R 均为 Pending。API Reference 已统一后置到 Router、
Redux Toolkit + React Redux、Zustand 和 TanStack Query 课程之后；现行下一阶段是 RR0。各课程 Module
仍须逐批关闭课程 Gate，测试交付和生产级综合项目不得提前发布。
