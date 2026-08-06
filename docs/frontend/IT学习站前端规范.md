# IT 学习站前端规范

> 版本：v2.1
> 日期：2026-08-05
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

课程和 Reference 都必须包含“易错使用提示”以及“源码推导与适用场景”或等价原理章节。详细规则见
[`调研与来源规范.md`](./standards/调研与来源规范.md)。Markdown 只允许受控 AST 与 directive，未知
directive、任意 HTML、无效关联和未知 Demo ID 必须明确失败。

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

全站架构定义跨领域长期边界，本规范只补充前端规则，总计划只记录当前状态、未来顺序和 Gate。单
Module 调研与实施计划位于 `docs/frontend/plans/<module>/`，仅在执行期间存在。

覆盖矩阵、已完成批次记录和 Java 审计资产保留其真实证据。历史路径不得重新接入 Catalog、路由或
loader；当前长期入口只使用 `app/common/categories` 架构。

正常内容建设恢复后，每次只实施一个批次；完成调研、实现、最少临时验证、浏览器验证、复审和计划
登记后，才能开始下一批。临时验证资产只能写入 `/tmp`，验证后删除，仓库不保留测试文件。

## 11. 当前基线与停止边界

Vue Core、Vue Router 和 Pinia 已完成当前冻结范围，TypeScript 已完成 T0 至 T2-2；统计与维护入口见
[`Vue生态覆盖基线.md`](./coverage-matrices/Vue生态覆盖基线.md) 和
[`TypeScript官方覆盖矩阵.md`](./coverage-matrices/TypeScript官方覆盖矩阵.md)。

内容架构迁移已经完成。下一前端内容批次由
[`IT学习站前端路线计划.md`](./IT学习站前端路线计划.md) 单独授权，不在架构迁移中自动开始。
