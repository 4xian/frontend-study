# IT 学习站前端规范

> 版本：v1.0  
> 日期：2026-08-05  
> 状态：生效  
> 适用范围：IT 学习站的前端框架与工程化内容域

## 1. 项目定位与前端范围

本项目是可持续扩展的 IT 学习站，前端只是与后端并列的独立内容域。本规范只定义前端框架与
工程化内容，不替后端或未来其他 IT 领域制定课程结构。前端内容沿用三种使用目的：

- **系统学习**：按明确前置关系从基础、中级到高级完成课程。
- **技术参考**：按官方分类查找语法、类型、配置、函数和运行边界。
- **项目实战**：把已学习能力组合成有交付物和验收标准的项目。

当前前端范围为 Vue 生态、TypeScript、Vite、React SPA 与客户端生态，以及围绕这些技术的测试、
构建部署、性能和质量。HTML、CSS、JavaScript 基础课程暂不建设；课程可以声明前置要求，但不得在
单篇框架课程中临时复制一套基础语言教程。Next.js、Nuxt、账号同步和在线 Playground 继续延期。

## 2. 信息架构

固定层级为：

```text
Purpose -> Ecosystem -> Module -> Overview -> Collection -> Entry
```

`Purpose` 只允许 `learn`、`reference`、`projects`。现有生态为 `vue`、`engineering`、`react`；
TypeScript 与 Vite 属于 `engineering`，React Router、状态管理和数据管理属于 `react`。

每个模块必须分别提供课程总览和 Reference 总览。课程总览按学习阶段展示卡片；Reference 总览按
官方主题显示分类与可点击名称。总览是独立页面，不复用详情页，不设置左右侧栏，也不为了“进入后
有内容”而跳过总览。

## 3. 内容模块与 interface

`LearningCatalog` 是目录、路由、搜索、相邻条目和正文懒加载的唯一外部 seam。页面只学习它的
interface，不解析文件路径、`import.meta.glob` 结果或单个 manifest 的内部结构。删除该模块会让
排序、路径、索引和加载复杂度重新散落到多个调用方，因此它应保持深模块，而不是透传包装器。

内容以 `ContentEntry` 联合类型表达：

- `LessonEntry`：目标、正文、练习和总结。
- `ReferenceEntry`：检索签名、正文和补充说明。
- `ProjectEntry`：里程碑、任务和验收项。

三类内容共享 `ContentMeta` 与 `ContentBlock`，但保持独立 layout 和信息顺序。禁止给一个通用页面
持续添加布尔属性来模拟课程、Reference 和项目。条目元数据只负责目录和真实性信息，正文保持动态
加载；首页、总览和搜索不得执行所有正文模块。

## 4. 路径、稳定 ID 与命名

路由结构：

```text
/learn/<ecosystem>/<module>/<collection>/<entry>
/reference/<ecosystem>/<module>/<collection>/<entry>
/projects/<ecosystem>/<module>/<collection>/<entry>
```

稳定 ID 使用小写点分段：

```text
engineering.typescript.learn.basics.type-inference
engineering.vite.reference.config.build-options
react.core.learn.basics.state
```

路径段和文件名使用 kebab-case，Vue 组件使用 PascalCase，变量和方法使用 camelCase。标题变化不
自动修改稳定 ID。课程顺序只能由显式 track manifest 管理，Reference 覆盖只能由结构化 index
manifest 管理，禁止依赖目录遍历、文件名排序或页面中硬编码数组。

## 5. 内容真实性

每个条目必须填写 `sources`、`appliesTo` 和 `verifiedAt`。版本、签名、默认值和运行行为必须在当前
批次重新核对官方资料；外部搜索使用 Tavily，搜索摘要和社区内容只用于发现线索。框架内部实现结论
必须固定到精确 tag 或 commit，并清楚区分公共合同与课程推导。

课程和 Reference 都必须包含“易错使用提示”以及“源码推导与适用场景”或等价的原理推导章节。
易错点通常选择约五个最有价值的问题，最多十个；资料不足时可以更少，不得凑数。每点分别写明
错误名称、原因、后果、错误示例和正确示例。详细规则见
[`调研与来源规范.md`](./standards/调研与来源规范.md)。

## 6. 页面模板

宽屏详情页采用左侧模块导航、中间正文、右侧本页大纲与官方来源。左中右各自拥有滚动语义，正文
滚动不得带动两侧；中窄屏把右侧内容收进页内，移动端由正文顶部按钮打开左侧 Sheet，并在正文末尾
展示官方来源。切换条目时正文和右侧大纲更新并回到顶部，左侧目录保持同一模块实例和滚动位置。

课程、Reference 与 Demo 的具体 authoring interface 分别见：

- [`课程内容规范.md`](./standards/课程内容规范.md)
- [`API参考内容规范.md`](./standards/API参考内容规范.md)
- [`Demo与交互规范.md`](./standards/Demo与交互规范.md)

## 7. 总览、关联与进度

课程总览按基础、中级、高级显示类别卡片，卡片进入该类别第一课；新增知识点只加入所属类别，不为
类别名称单独创建路由。Reference 总览按官方分类列出名称，支持筛选和深链锚点。左侧第一项固定
返回当前模块总览。

课程前置关系和下一课由 manifest 决定。跨模块关联只在确实有学习依赖或查阅价值时添加，不能让
Vue Core 课程承担 Router 或 Pinia 的教学任务。右侧“官方来源”只放外部一手来源；站内相关课程与
Reference 放正文末尾，移动端同样遵守这个顺序。

学习进度只保存在版本化 localStorage 中。内容更新不能因为标题变化丢失进度；数据损坏时允许回到
空状态。当前只有本地实现，不创建假想的云同步 seam。

## 8. Demo、视觉与响应式

运行 Demo 与展示源码必须来自同一文件，使用完整限定 ID，不能按 basename 匹配。只有能观察到
状态、时序、生命周期、配置结果或错误边界的主题才需要 Demo；纯类型、编译擦除和平台边界不能用
浏览器效果冒充真实验证。

首页允许明显的空间层级、玻璃材质和连续转场；内容页保持低干扰。样式只使用 flex、正常文档流和
margin，禁止 CSS Grid 与 `gap`。交互必须支持键盘、触摸、390px、200% 文本以及
`prefers-reduced-motion`；动画优先使用 `transform` 与 `opacity`，不能阻塞输入或导航。

## 9. 性能与可访问性

首页和总览不预加载正文、Demo、Shiki 语言或未进入生态的运行时。React runtime 只能由 React
Adapter 按需加载，并在宿主卸载时释放 root。构建验收必须检查产物或网络请求，不能仅根据动态
`import` 的代码外观推断已经拆包。

页面使用明确的 `header`、`nav`、`main`、`aside` 语义；所有功能可由键盘完成，焦点环可见，弹层
支持焦点锁定、`Esc` 和关闭后焦点恢复。颜色不能是状态的唯一表达，窄屏不能截断内容或缩小触控
目标。

## 10. 文档治理

总规范只记录长期规则，总计划只记录当前状态、未来顺序和 Gate。单模块调研与实施计划位于
`docs/frontend/plans/<module>/`，仅在执行期间存在。模块 Gate 关闭后按以下顺序清理：

1. 将可复用规则合并到对应规范。
2. 将最终官方范围和站内覆盖写入 `coverage-matrices/` 或结构化 manifest。
3. 更新总计划的模块状态和下一入口。
4. 删除该模块全部调研与实施计划。
5. 使用 `rg` 确认不存在旧文档引用。

完成模块不保留独立 closeout、批次流水账或归档副本。每次只实施一个批次，完成调研、实现、最少
测试、浏览器验证、复审和计划登记后，才能开始下一批。

## 11. 当前基线

Vue Core、Vue Router 和 Pinia 已完成当前冻结范围，统计与维护入口见
[`Vue生态覆盖基线.md`](./coverage-matrices/Vue生态覆盖基线.md)。下一条内容路线为 TypeScript，然后是
Vite，再进入 React Core SPA 与客户端生态。具体顺序和每阶段 Gate 见
[`IT学习站前端路线计划.md`](./IT学习站前端路线计划.md)。
