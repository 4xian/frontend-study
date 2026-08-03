# Vue Router 5.2.0 课程 R0 官方调研与 R1 实施计划

> 状态：R0 研究快照，不代表课程、Demo、Reference 或构建配置已实施
>
> 范围：仅 Vue Router；不扩展到 Pinia、React、通用工程化或 SSR 实现
>
> 审计对象：`src/content/catalog/manifests/vue-router-track.ts`
>
> Manifest SHA-256：`f64ed29e412a70fab56fb15b72fd82616e3f52bd0e96586792906c7919906eb3`
>
> 版本基线：本地及 lockfile 均为 `vue-router@5.2.0`
>
> 上游固定点：[`vuejs/router@v5.2.0`](https://github.com/vuejs/router/tree/v5.2.0)，
> tag commit `6e5f8d253b9444a76eb58f176ebe08d686c937cb`
>
> 核验日期：2026-08-03
>
> R0 stop boundary：只允许更新本文及总实施计划中的 R0 状态；不写课程正文、Demo、manifest、
> Reference index、样式或配置

## 结论

- 当前 manifest 的 15 课、3 阶段和课内顺序可以保留，不需要在 R0 调序。顺序已经形成
  “路由器与出口 -> 匹配与导航 -> 配置模式 -> 导航生命周期 -> 体验与生产边界 ->
  类型化构建能力”的依赖链。
- Vue Router 5 是把文件路由能力并入主包的过渡版本。官方迁移说明称不使用文件路由的
  Vue Router 4 应用没有常规破坏性变更；第 1-14 课应继续以稳定的 `vue-router` 主入口为准，
  第 15 课再进入构建期能力。
- `vue-router/auto-routes` 才是 5.2.0 的生成路由虚拟模块。`vue-router/auto` 运行时映射到
  主入口，但随包发布的类型文件只有弃用说明，官方 v5 “New Exports Reference” 也未列它；
  课程不得把二者混同，也不应从 `vue-router/auto` 导入公共 API。
- `vue-router/vite` 是本仓库在第 15 课需要的 Vite 插件入口；`vue-router/unplugin` 及其
  bundler 子路径只作边界说明。插件是构建期能力，不能在普通运行时 Demo 中模拟成
  `createRouter()` 的一个选项。
- `vue-router/experimental` 在固定 5.2.0 tag 中不只包含 Data Loaders，还包含实验 router、
  resolver、param parsers 和 `definePage` runtime。第 9 课稳定主线只讲官方 Data Fetching
  的导航前/后取数；Data Loaders 只能作为明确标注的实验性选读，不能计入稳定课程闭环。
- 本地 `vue-router.d.ts` 与当前官方 API 索引对齐为 118 个主入口导出：23 个运行时导出、
  95 个 type-only 导出。15 课负责高频应用 API；低层 matcher、query、注入 key 和类型族应
  进入后续 Reference 计划，不能为追求数量塞进课程正文。
- 所有路由运行时 Demo 默认使用“独立 Vue mini-app + `createMemoryHistory()`”隔离 seam，
  不能复用站点自身的 `createWebHistory()`，否则示例导航会改写真实课程页 URL 和历史栈。

## 版本、来源与核验方法

### 冻结的本地事实

- `package-lock.json` 将 `vue-router` 锁定为 5.2.0；本地
  `node_modules/vue-router/package.json` 也为 5.2.0。`package.json` 中的 `^5.2.0` 只是安装
  范围，R1 不能据此自动升级研究基线。
- [`vue-router@5.2.0 package.json`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/package.json)
  与本地包的 `exports`、peer dependencies 和发布文件逐项一致。
- 本地 `dist/vue-router.d.ts` 的单一导出声明用于机械统计主入口；
  `vue-router-auto.d.ts`、`dist/unplugin/*.d.mts`、`dist/experimental/*.d.ts` 用于核对各子路径
  边界。类型声明是本次允许使用的 5.2.0 第一方发布物，不把 bundle 内部符号当公共契约。
- manifest 经 CodeGraph 和文本计数复核为 15 个 `planned` entry；其 collections/categories/
  entries 顺序就是站内学习路线顺序。

### 外部第一方来源

- 当前官网使用共享的 v4.x/v5.x 文档。Guide 与 API public contract 以
  [Vue Router Guide](https://router.vuejs.org/guide/) 和
  [API Reference](https://router.vuejs.org/api) 为入口，每课的精确页面在逐课计划中列出。
- 版本与发布事实以 [v5.2.0 release](https://github.com/vuejs/router/releases/tag/v5.2.0)、
  [固定 tag](https://github.com/vuejs/router/tree/v5.2.0) 和固定 tag 的源码为准，不用 `main`
  分支推断 5.2.0 行为。
- 文件路由与迁移边界以 [File-Based Routing](https://router.vuejs.org/file-based-routing)、
  [v4 -> v5 migration](https://router.vuejs.org/guide/migration/v4-to-v5) 和固定 tag
  [`package.json`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/package.json) 交叉核对。
- 外部资料只通过 Tavily 读取 `router.vuejs.org` 和 `github.com/vuejs/router`；未采用博客、
  培训站或聚合文章。源码只用于解释 public contract 的推导 seam，不把内部实现细节写成
  用户承诺。

### 已发现的官网与固定发布物差异

1. 当前文件路由文档仍出现 `/// <reference types="vue-router/auto" />`，但 5.2.0 固定包中的
   [`vue-router-auto.d.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/vue-router-auto.d.ts)
   只有弃用说明。R1 应以生成声明文件纳入 `tsconfig`、公共 API 从 `vue-router` 导入为准。
2. 当前 Extending Routes 文档称 `definePage` 必要时可从 `vue-router` 导入，但 5.2.0
   主入口声明没有该导出；固定 tag 仅在
   [`experimental/index.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/experimental/index.ts)
   导出它。R1 课程只用插件提供的全局编译期宏，不示范有争议的显式导入。
3. 迁移页把 `vue-router/experimental` 简写为 Data Loaders，而固定源码还导出实验 router、
   resolver 和 param parsers。R1 每次提到具体 API 都必须重新标注实验状态。
4. 官网会随主分支更新；遇到精确导出、弃用和 5.2.0 行为冲突时，固定 tag 与本地 5.2.0
   类型声明优先。不能把“future versions”擅自改写为“Vue Router 6 一定删除”。

## 入口与能力边界

| 入口 | 5.2.0 实际职责 | 课程处理 | 来源 |
| --- | --- | --- | --- |
| `vue-router` | 稳定运行时、组件和公共类型 | 第 1-14 课唯一运行时入口；第 15 课仍从此导入 `createRouter` | [API](https://router.vuejs.org/api)、[`src/index.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/index.ts) |
| `vue-router/auto-routes` | 插件生成的 routes/types/HMR 虚拟模块；包内没有普通 JS 文件 | 第 15 课从此导入 `routes`；必须先启用构建插件 | [File-Based Routing](https://router.vuejs.org/file-based-routing)、[`moduleConstants.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/core/moduleConstants.ts) |
| `vue-router/auto` | 运行时映射主入口，发布类型文件已标记弃用 | 只作为兼容边界警示，不用于示例 | [`package.json`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/package.json)、[`vue-router-auto.d.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/vue-router-auto.d.ts) |
| `vue-router/vite` | 默认导出 Vite 插件 | 本仓库第 15 课推荐入口；必须位于 `Vue()` 之前 | [File-Based Routing](https://router.vuejs.org/file-based-routing)、[`vite.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/vite.ts) |
| `vue-router/unplugin` | 通用 unplugin 实例、options、tree/context 工具和 bundler 子路径 | 解释 Rollup/Webpack/esbuild/Rolldown 边界；不做多构建器 Demo | [v5 migration](https://router.vuejs.org/guide/migration/v4-to-v5)、[`unplugin/index.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/index.ts) |
| `vue-router/experimental` | Data Loaders、实验 router/resolver、param parsers、`definePage` runtime | 只做显式实验性选读/Reference watchlist，不计入稳定 15 课 API 完成度 | [Data Loaders](https://router.vuejs.org/data-loaders)、[`experimental/index.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/experimental/index.ts) |
| `vue-router/experimental/pinia-colada` | 可选的 Pinia Colada loader | 本计划排除；不因 Router 课程扩散到 Pinia | [v5 migration](https://router.vuejs.org/guide/migration/v4-to-v5)、[`defineColadaLoader.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/experimental/data-loaders/defineColadaLoader.ts) |

## 课程前置关系

### 外部前置

- 学员已掌握 Vue SFC、组件 props/slots、Composition API、`watch`、生命周期、`Transition`、
  `KeepAlive` 和异步 `import()`。Router 课程只做必要回顾，不重写 Vue Core 正文。
- TypeScript 前置仅要求对象、联合类型、泛型和 module augmentation 基础。第 15 课才引入
  `RouteRecordInfo` 与生成类型，不提前让类型细节阻塞基础导航。
- Vite 构建配置只在第 15 课出现。第 1-14 课的学习与 Demo 不依赖文件路由插件。

### 课内依赖

| 课程 | 硬前置 | 依赖理由 |
| --- | --- | --- |
| L01-L02 | Vue app/plugin、组件渲染 | 先建立 router、link、view 三个核心对象 |
| L03-L05 | L01-L02 | 当前 route、匹配结果和 router 实例先存在，才能讲复用与主动导航 |
| L06-L07 | L03-L05 | 命名/重定向/视图 props 都是在已有匹配与 location 之上的配置表达 |
| L08 | L03-L07 | guards 需要理解 to/from、matched、meta 和组件复用 |
| L09-L10 | L08 | 导航前后取数和懒加载必须放回完整导航生命周期判断时序 |
| L11-L12 | L05、L08 | 导航结果、初始导航、视图 slot 都依赖异步导航心智模型 |
| L13 | L01、L05、L11 | history、scroll 和部署要区分导航成功、popstate 与 URL 承载方式 |
| L14 | L06、L11 | 动态注册改变 matcher，扩展 link 复用 location/active/navigation 语义 |
| L15 | L03-L07、L10、L14 | 生成 routes/types 是对路径、命名、懒加载和构建期扩展的综合应用 |

## Demo 通用 contract

- 每个运行时 Demo 在自己的挂载节点中创建独立 mini-app，安装独立 router，并在组件卸载时
  `app.unmount()`；不得把 route record、guard 或 history listener 注册到宿主 router。
- 默认使用 `createMemoryHistory()`，显式 `await router.push('/')` 或 `replace('/')` 完成初始
  位置。Demo UI 展示 pathname、matched names、params/query、navigation result 和事件时间线，
  让 Playwright 能通过可见状态验证，不依赖 console。
- 数据课程使用确定性的本地 Promise/deferred 控制器，不发真实网络请求；懒加载使用真实
  `import()` seam，但不测 bundler 私有 chunk 文件名。
- history/deployment 课程比较 URL、base、fallback 责任和 history 接口，不接管浏览器真实
  back/forward。真实部署规则写成配置表，不伪装为浏览器内可验证事实。
- 第 15 课是唯一构建期 seam。建议在独立 fixture 目录启用 `vue-router/vite`，扫描范围只指向
  该课的 pages，生成声明也落在 fixture 内；宿主 `src/router/index.ts` 继续手写 routes。
  这个配置改动必须作为 R1 最后一个独立批准 gate，不能随前面批次提前落地。
- 每课正文通常整理 5-8 个经过来源核验的结构化易错点，不足时宁缺毋滥；每项都要说明原因、
  可观察后果、错误示范和正确示范。源码推导或适用场景作为独立编号块呈现，不能混入易错提示。
- 每课 `sources` 保留对应官方 Guide、API 和固定 tag 源码，供详情页右侧“官方来源”展示；站内
  related links 只能补充关联学习路径，不能替代官方来源。
- 样式沿用现有 token 和 flex；遵守仓库禁用 `grid`、禁用 `gap`、最小改动规则。

## 15 课逐项计划

### L01 建立第一个路由器

- Manifest：`vue.router.learn.basics.setup-first-router`；前置：Vue app/plugin。
- 目标：理解 `createRouter({ history, routes })`、route record、`app.use(router)` 和初始导航，
  能区分 router 与 route。
- Demo seam：独立 mini-app 创建两条静态 route，用 memory history 初始化并展示
  `router.currentRoute.value`；按钮只驱动独立 router。
- 易错方向：`app.use(router)` 晚于 `mount()`；把 `history` 当可省略选项；忘记 memory history
  从“nowhere”开始；把站点 router 注入 Demo。
- 源码推导：从 `createRouter()` 的 options/matcher 组装和 install seam 解释插件做了什么；不讲
  完整导航状态机。
- 来源：[Getting Started](https://router.vuejs.org/guide/)、
  [`createRouter()`](https://router.vuejs.org/api/functions/createrouter)、
  [`router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)、
  [`index.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/index.ts)。

### L02 链接、视图与激活状态

- Manifest：`vue.router.learn.basics.router-link-view-active`；前置：L01。
- 目标：用 `RouterLink` 声明 location、用 `RouterView` 渲染匹配组件，区分 active 与 exact
  active，并理解 `aria-current`。
- Demo seam：三条 link 对应父/子 route，屏幕同时展示 rendered view、`isActive`、
  `isExactActive` 和 class；query 切换用于证明 active 判断不比较 query。
- 易错方向：用字符串 path 手工判断激活；认为 query 影响 active；把 exact active 解释为
  URL 字符串完全相等；只换颜色而不保留可访问状态。
- 源码推导：`useLink()` 解析 location 并比较 matched record/params，`RouterView` 按 depth 选择
  matched component。
- 来源：[Active links](https://router.vuejs.org/guide/essentials/active-links)、
  [`RouterLink`](https://router.vuejs.org/api/variables/routerlink)、
  [`RouterView`](https://router.vuejs.org/api/variables/routerview)、
  [`RouterLink.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterLink.ts)、
  [`RouterView.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts)。

### L03 路由参数、查询与匹配

- Manifest：`vue.router.learn.basics.route-params-query-matching`；前置：L01-L02。
- 目标：读取 params/query/hash，理解动态、可选、重复和 custom-regex 参数，以及同组件复用。
- Demo seam：在 `/users/:id`、可重复 tags 和 catch-all 三个 record 间切换，展示
  `router.resolve()` 结果、params 的 string/array 形态和组件复用计数。
- 易错方向：向 `path` location 同时传 `params`；忘记 repeatable params 导航值是数组；watch
  整个 route；把 query 当 path matcher 的一部分；写高代价贪婪 regex。
- 源码推导：tokenize/score/parse/stringify seam 解释 record 排序和 params 标准化；query 使用
  独立 parse/stringify seam。
- 来源：[Dynamic matching](https://router.vuejs.org/guide/essentials/dynamic-matching)、
  [Matching syntax](https://router.vuejs.org/guide/essentials/route-matching-syntax)、
  [API: RouteLocationNormalizedLoaded](https://router.vuejs.org/api/type-aliases/routelocationnormalizedloaded)、
  [`matcher/`](https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/matcher)、
  [`query.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/query.ts)。

### L04 嵌套路由

- Manifest：`vue.router.learn.basics.nested-routes`；前置：L02-L03。
- 目标：让 URL segment、children records 和嵌套 `RouterView` depth 对齐，并处理空路径默认子路由。
- Demo seam：父 layout 内含二级 outlet，切换默认 child 与 detail child；可见区同时展示
  `matched` 链和两个 outlet 的内容。
- 易错方向：父组件没有 outlet；child path 误加前导 `/`；把 nested route 与 named views
  混成同一概念；父子 route name 重复。
- 源码推导：matcher 如何归一化 children 与 parent，`RouterView` 如何注入/递增 depth。
- 来源：[Nested Routes](https://router.vuejs.org/guide/essentials/nested-routes)、
  [API: RouteRecordRaw](https://router.vuejs.org/api/type-aliases/routerecordraw)、
  [API: RouterView](https://router.vuejs.org/api/variables/routerview)、
  [`matcher/index.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/matcher/index.ts)、
  [`RouterView.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts)。

### L05 组合式 API 与编程式导航

- Manifest：`vue.router.learn.basics.composition-programmatic-navigation`；前置：L03-L04。
- 目标：用 `useRouter()`、`useRoute()`、`push/replace/go` 和组件内 leave/update guard 组织导航。
- Demo seam：独立 router 中比较 push 与 replace 的可见 history 序列；watch 仅订阅
  `route.params.id`；leave guard 由“未保存”checkbox 控制。
- 易错方向：watch 整个 route；在组件外无注入上下文调用 composable；不等待导航 Promise；
  混淆 `route` 只读快照与 `router` 命令对象。
- 源码推导：`useApi.ts` 的注入 seam、router push/replace 的共同导航入口，以及组件 guard 注册
  到 active record 的生命周期。
- 来源：[Composition API](https://router.vuejs.org/guide/advanced/composition-api)、
  [Programmatic navigation](https://router.vuejs.org/guide/essentials/navigation)、
  [`useRoute()`](https://router.vuejs.org/api/functions/useroute)、
  [`useRouter()`](https://router.vuejs.org/api/functions/userouter)、
  [`useApi.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/useApi.ts)。

### L06 命名路由、重定向与别名

- Manifest：`vue.router.learn.intermediate.named-routes-redirects-aliases`；前置：L03-L05。
- 目标：用唯一 name 生成 location，并准确区分 redirect 的 URL 替换和 alias 的 URL 保留。
- Demo seam：同一目标组件提供 named navigation、redirect 和 alias 三条入口，展示输入 URL、
  最终 fullPath、matched record 与 guard 事件。
- 易错方向：重复 route name 导致只保留最后一个；在 redirect record 上放无效 guard；redirect
  record 缺少无用 component 与“带 children 的 redirect record 仍需 component”例外混淆；
  nested alias 忘记绝对/相对边界。
- 源码推导：matcher name map、aliasOf 和 redirect 解析顺序；不把内部 record shape 作为 public API。
- 来源：[Named Routes](https://router.vuejs.org/guide/essentials/named-routes)、
  [Redirect and Alias](https://router.vuejs.org/guide/essentials/redirect-and-alias)、
  [API: RouteRecordRaw](https://router.vuejs.org/api/type-aliases/routerecordraw)、
  [`matcher/index.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/matcher/index.ts)、
  [`router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)。

### L07 命名视图与路由 Props

- Manifest：`vue.router.learn.intermediate.named-views-route-props`；前置：L04、L06。
- 目标：用 `components` 驱动同层多个 outlet，并用 boolean/object/function props 解耦组件与 route。
- Demo seam：default/sidebar 两个 outlet 显示同一 route 的不同 component；开关比较组件直接
  读 route 与 props 输入，证明可复用组件无需 router 注入。
- 易错方向：把 `components` 误写成 `component`；没有按 view 分别配置 props；把 function
  props 当响应式副作用容器；在 static object props 中误以为能读取当前 route。
- 源码推导：RouterView 的 `name` 选择与 record `props[name]` 解析 seam。
- 来源：[Named Views](https://router.vuejs.org/guide/essentials/named-views)、
  [Passing Props](https://router.vuejs.org/guide/essentials/passing-props)、
  [`RouterViewProps`](https://router.vuejs.org/api/interfaces/routerviewprops)、
  [`RouterView.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts)、
  [`route-records.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/typed-routes/route-records.ts)。

### L08 路由 Meta 与导航守卫

- Manifest：`vue.router.learn.intermediate.meta-navigation-guards`；前置：L05-L07。
- 目标：定义/扩展 `RouteMeta`，理解 `matched` 与 `route.meta` 浅合并，按 global/per-route/
  in-component 顺序控制 allow、cancel 和 redirect。
- Demo seam：parent/child meta 权限矩阵和守卫时间线；角色切换后同一导航产生允许、取消或重定向。
- 易错方向：认为 meta 是递归深合并；在 `afterEach` 阻止导航；同时 return 与调用 `next`；
  `next` 分支调用两次；在重定向守卫中制造无限循环。
- 源码推导：record guard extraction、guard queue、return-to-promise 适配与 afterEach seam；正文
  推荐 return 风格，只把 `next` 作为兼容知识。
- 来源：[Route Meta](https://router.vuejs.org/guide/advanced/meta)、
  [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards)、
  [`RouteMeta`](https://router.vuejs.org/api/interfaces/routemeta)、
  [`navigationGuards.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)、
  [`router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)。

### L09 路由数据获取

- Manifest：`vue.router.learn.intermediate.route-data-fetching`；前置：L08。
- 目标：比较导航后取数与导航前取数的 UX、loading/error/cancellation 责任；稳定主线不依赖
  `vue-router/experimental`。
- Demo seam：deferred request 控制器分别演示“先显示页面 loading”与“守卫等待后提交导航”，
  快速切换 id 时只展示最新请求结果。
- 易错方向：把两种策略写成唯一正确答案；参数变化时显示旧请求结果；守卫悬挂；把实验
  Data Loader 写成 5.2.0 稳定默认；在本课引入 Pinia Colada。
- 源码推导：稳定路径只追踪 guard 与组件复用时序。实验选读可观察
  `DataLoaderPlugin -> guard -> loader entry`，但必须标记不属于稳定课程验收。
- 来源：[Data Fetching](https://router.vuejs.org/guide/advanced/data-fetching)、
  [Data Loaders](https://router.vuejs.org/data-loaders)、
  [`defineBasicLoader()`](https://router.vuejs.org/data-loaders/basic)、
  [API: NavigationGuard](https://router.vuejs.org/api/interfaces/navigationguard)、
  [`experimental/data-loaders`](https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/experimental/data-loaders)。

### L10 路由懒加载

- Manifest：`vue.router.learn.intermediate.lazy-loading`；前置：L08-L09。
- 目标：用 `component: () => import(...)` 建立 route-level code splitting，并理解 route lazy
  component 与 Vue async component 的边界。
- Demo seam：真实动态 import 返回一个 route component，屏幕记录 loader 首次调用、首次完成
  和再次进入；不对生成 chunk hash 或请求时间作断言。
- 易错方向：为 route component 再包 `defineAsyncComponent`；在组件定义阶段立即调用 import；
  把多次导航预期写成每次重新下载；把 Vite manualChunks 当 Router API。
- 源码推导：`loadRouteLocation()`/guard extraction 如何识别并解析 lazy route component，随后
  缓存已解析组件。
- 来源：[Lazy Loading Routes](https://router.vuejs.org/guide/advanced/lazy-loading)、
  [`loadRouteLocation()`](https://router.vuejs.org/api/functions/loadroutelocation)、
  [`navigationGuards.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts)。

### L11 导航失败

- Manifest：`vue.router.learn.advanced.navigation-failures`；前置：L05、L08。
- 目标：等待 `router.push()`，用 `isNavigationFailure()` 区分 aborted/cancelled/duplicated，
  并在 `afterEach` 观察 failure。
- Demo seam：按钮稳定触发成功、false abort、竞态 cancel 和重复导航，屏幕展示 resolved value、
  type、to/from；每种状态由真实 router 产生而非手造对象。
- 易错方向：把 resolved Promise 一律当成功；把 redirect 当失败；依赖错误 message 字符串；
  混淆 cancelled 与 aborted。
- 源码推导：errors.ts 的 type bitmask/type guard，以及 router 最终提交前对 pending navigation
  的检查。
- 来源：[Navigation Failures](https://router.vuejs.org/guide/advanced/navigation-failures)、
  [`isNavigationFailure()`](https://router.vuejs.org/api/functions/isnavigationfailure)、
  [`NavigationFailureType`](https://router.vuejs.org/api/enumerations/navigationfailuretype)、
  [`errors.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/errors.ts)。

### L12 RouterView 插槽与过渡

- Manifest：`vue.router.learn.advanced.router-view-slots-transitions`；前置：L02、L10-L11。
- 目标：使用 `v-slot="{ Component, route }"` 把 `Transition`/`KeepAlive` 包在 route component
  外，并判断何时需要 key 与 `router.isReady()`。
- Demo seam：两个有内部计数的 route component；开关 KeepAlive、route key 和 transition，
  可见状态证明实例复用/缓存/替换。
- 易错方向：缓存 `RouterView` 而不是 route component；无理由给所有 route 加 key；把
  transition mode 与导航完成顺序混同；初始异步导航导致 enter 动画意外出现。
- 源码推导：RouterView slot 暴露的 Component/route、实例 guard 迁移与 depth；初始导航 ready
  只解释 public `isReady()`，不展开内部 listener。
- 来源：[RouterView slot](https://router.vuejs.org/guide/advanced/router-view-slot)、
  [Transitions](https://router.vuejs.org/guide/advanced/transitions)、
  [API: RouterView](https://router.vuejs.org/api/variables/routerview)、
  [API: Router](https://router.vuejs.org/api/type-aliases/router)、
  [`RouterView.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts)、
  [`router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)。

### L13 滚动、历史模式与部署

- Manifest：`vue.router.learn.advanced.scroll-history-deployment`；前置：L01、L05、L11。
- 目标：比较 web/hash/memory history，使用 `scrollBehavior`/`savedPosition`，并把 client
  matcher 与服务器 fallback/404 责任分开。
- Demo seam：由独立 router 的真实导航触发 `scrollBehavior(to, from, savedPosition)`，屏幕记录
  参数并固定返回 `false`，避免改动宿主窗口滚动；history mode 表只对比 base、服务器要求和
  初始位置，不实例化 web/hash history，也不操作宿主 history。
- 易错方向：HTML5 history 未配置 fallback；fallback 后所有未知 URL 都返回 200 却无应用内
  404；hash URL 被说成无需权衡；memory history 未主动初始导航；认为 savedPosition 每次都有。
- 源码推导：三个 history adapter 的共同接口、scroll position store 和 5.2.0 对过期异步
  scroll result 的丢弃；后者只作版本注记。
- 来源：[Scroll Behavior](https://router.vuejs.org/guide/advanced/scroll-behavior)、
  [History modes](https://router.vuejs.org/guide/essentials/history-mode)、
  [`createMemoryHistory()`](https://router.vuejs.org/api/functions/creatememoryhistory)、
  [`scrollBehavior.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/scrollBehavior.ts)、
  [`history/`](https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/history)、
  [v5.2.0 release](https://github.com/vuejs/router/releases/tag/v5.2.0)。

### L14 动态路由与 RouterLink 扩展

- Manifest：`vue.router.learn.advanced.dynamic-routing-router-link`；前置：L06、L11。
- 目标：使用 `addRoute/removeRoute/hasRoute/getRoutes` 管理 matcher，并用 RouterLink slot 或
  `useLink()` 封装可复用链接。
- Demo seam：运行时添加/移除 feature route，展示 addRoute 只注册、需显式 replace 才刷新
  当前匹配；自定义 link 同时展示 external bypass、active 与 navigate。
- 易错方向：认为 addRoute 自动重渲染当前 URL；在 guard 内 addRoute 后调用 replace，而不是
  return location；动态 name 冲突；包装链接时丢失标准点击修饰键和 `aria-current`。
- 源码推导：matcher add/remove name map 与 dispose callback；RouterLink slot/useLink 共用解析、
  active 和 navigate seam。
- 来源：[Dynamic Routing](https://router.vuejs.org/guide/advanced/dynamic-routing)、
  [Extending RouterLink](https://router.vuejs.org/guide/advanced/extending-router-link)、
  [`useLink()`](https://router.vuejs.org/api/functions/uselink)、
  [`matcher/index.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/matcher/index.ts)、
  [`RouterLink.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterLink.ts)。

### L15 类型化与文件路由

- Manifest：`vue.router.learn.advanced.typed-file-based-routing`；前置：L03-L07、L10、L14。
- 目标：理解手工 `RouteRecordInfo`/`TypesConfig.RouteNamedMap` 的成本，再使用
  `vue-router/vite` + `vue-router/auto-routes` 生成 routes/types，掌握 build-time 与 runtime
  的边界。
- Demo seam：独立 fixture pages 生成 `routes` 和声明；Demo mini-app 消费生成 routes，另用
  type-check fixture 证明合法/非法 name/params。宿主 router 保持手写，不迁移站点架构。
- 易错方向：插件排在 `Vue()` 后；扫描整个仓库导致生成路由污染；未把生成 d.ts 纳入
  `tsconfig`；从弃用的 `vue-router/auto` 导入；把 `auto-routes` 当普通文件；认为 runtime
  addRoute 会更新编译期类型；把实验 `definePage` runtime 当主入口稳定导出。
- 源码推导：RouteNamedMap augmentation、file tree -> route records/DTS codegen、Vite adapter ->
  unplugin core；只讲 `extendRoute`/`beforeWriteFiles` public options，不教授低层 context API。
- 来源：[Typed Routes](https://router.vuejs.org/guide/advanced/typed-routes)、
  [File-Based Routing](https://router.vuejs.org/file-based-routing)、
  [Configuration](https://router.vuejs.org/file-based-routing/configuration)、
  [Extending Routes](https://router.vuejs.org/file-based-routing/extending-routes)、
  [v5 migration](https://router.vuejs.org/guide/migration/v4-to-v5)、
  [API: RouteRecordInfo](https://router.vuejs.org/api/interfaces/routerecordinfo)、
  [API: TypesConfig](https://router.vuejs.org/api/interfaces/typesconfig)、
  [`typed-routes/`](https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/typed-routes)、
  [`unplugin/`](https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/unplugin)、
  [`generateDTS.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/codegen/generateDTS.ts)。

## Reference/API 覆盖计划

### 主入口全集口径

当前官方 API 侧栏与本地 5.2.0 `vue-router.d.ts` 均对应 118 个导出。课程和 Reference 的分工
如下，不在 R0 创建 index：

| 口径 | 数量 | 处理方式 |
| --- | ---: | --- |
| 运行时导出 | 23 | 15 课直接覆盖高频能力；低层入口进入 Reference quick/merged |
| type-only 导出 | 95 | 按 route location、params/query、records、guards、history、link/view、typed routes 合并建主题，不逐类型建 95 页 |
| 构建期子路径 | 不计入主入口 118 | 第 15 课说明 `vite`/`auto-routes`；`unplugin` 低层工具进入构建期 Reference |
| experimental 子路径 | 不计入稳定主入口 | 单独 watchlist，所有项标 experimental，不计入稳定覆盖率 |

### 23 个运行时导出的归属

| 归属 | API |
| --- | --- |
| L01/L13 | `createRouter`、`createWebHistory`、`createWebHashHistory`、`createMemoryHistory` |
| L02/L12 | `RouterLink`、`RouterView` |
| L05/L08 | `useRouter`、`useRoute`、`onBeforeRouteLeave`、`onBeforeRouteUpdate` |
| L11 | `isNavigationFailure`、`NavigationFailureType` |
| L14 | `useLink` |
| Reference merged/quick | `createRouterMatcher`、`loadRouteLocation`、`parseQuery`、`stringifyQuery`、`START_LOCATION`、`matchedRouteKey`、`routeLocationKey`、`routerKey`、`routerViewLocationKey`、`viewDepthKey` |

Reference-only 不等于“不重要”：`parseQuery/stringifyQuery` 属于可配置 URL contract，
`createRouterMatcher/loadRouteLocation` 属于低层集成，注入 keys/START_LOCATION 属于测试或高级
自定义 seam。它们不适合挤进按应用工作流组织的 15 课主线。

顶层 export 计数也不能替代实例成员审计。后续 Router Reference 页必须逐项覆盖当前
[`_RouterClassic`](https://router.vuejs.org/api/interfaces/routerclassic) 的 `currentRoute`、`options`、
`listening`、`addRoute/removeRoute/clearRoutes/hasRoute/getRoutes`、`resolve`、
`push/replace/go/back/forward`、`beforeEach/beforeResolve/afterEach`、`onError`、`isReady` 和
`install`；课程只链接到承担该工作流的课，不为每个成员拆课。

### 95 个 type-only 导出的合并主题

| Reference 主题 | 代表类型 | 课程联动 |
| --- | --- | --- |
| Router 配置与实例 | `RouterOptions`、`Router`、`RouterHistory`、`RouterMatcher`、`HistoryState` | L01、L13-L14 |
| Route record | `RouteRecordRaw` 及 single/multiple/redirect/normalized variants | L01、L04、L06-L07 |
| Location | raw/resolved/normalized/loaded/path/relative/string typed families | L03、L05、L15 |
| Params/query | `RouteParams*`、`RouteParamValue*`、`ParamValue*`、`LocationQuery*` | L03、L15 |
| Guards/failures | `NavigationGuard*`、`NavigationHookAfter`、`NavigationFailure`、`ErrorTypes` | L08、L11 |
| Components/composables | `RouterLinkProps`、`RouterViewProps`、`UseLinkOptions/Return`、`RouteComponent` | L02、L12、L14 |
| Typed routes | `RouteRecordInfo*`、`RouteMap*`、`TypesConfig`、typed list families | L15 |
| 低层/内部命名导出 | 带 `_` 前缀的 `_Awaitable`、`_PathParserOptions`、`_RouteRecordProps` 等 | quick，明确“不建议应用代码依赖” |

验收时以 [API Reference](https://router.vuejs.org/api) 的 2 个 Enumerations、Interfaces、Type
Aliases、8 个 Variables 和 14 个 Functions 分类为外部全集，再与固定本地声明机械比对；官网
页面的 Alpha/Internal/Deprecated 标签必须保留，不能仅凭 export 存在就提升为课程推荐。

### 实验性 watchlist

- Data Loaders：`DataLoaderPlugin`、`defineBasicLoader`、`reroute`、`useIsDataLoading` 等；只关联
  L09 选读，不进入稳定 API 数量。
- Experimental router/resolver/param parsers：固定 5.2.0 已导出，但没有进入当前 15 课目标；
  只记录版本与入口，不创建 Demo。
- `vue-router/experimental/pinia-colada`：明确排除，避免扩散到 Pinia 课程。
- `vue-router/auto-resolver`：生成/实验 resolver 虚拟模块，不是标准 file-based routes 主入口。

### 后续 Reference 批次

Reference 与课程使用不同模板和独立 Gate；只有 RA0 完成官方 API 与固定声明的机械比对后，才可
创建结构化 index。以下批次不属于当前 R1 课程实施范围：

| 批次 | 范围 | 主要交付 |
| --- | --- | --- |
| RA0 | 118 个主入口导出审计 | 冻结 official URL、depth、status、target 与 Alpha/Internal/Deprecated 标签 |
| RA1 | Router 配置与 history | `createRouter`、三类 history、Router/Options/History 类型主题 |
| RA2 | matcher、record、location、params/query | 运行时低层入口与四个高关联类型族的合并参考 |
| RA3 | RouterLink、RouterView、composables 与注入 keys | 组件/组合式详解及测试、自定义集成 quick reference |
| RA4 | guards 与 failures | 守卫签名、导航结果、错误类型与完整 resolution flow |
| RA5 | typed routes 与构建期入口 | 类型族、`vite`、`auto-routes`、`unplugin` 的稳定构建边界 |
| RA6 | experimental watchlist | 只记录固定版本和实验标签，不计入稳定覆盖率或默认课程完成度 |

## R1 批次与验证

| 批次 | 课程 | 主要交付 | 最小专项验证 |
| --- | --- | --- | --- |
| B01 | L01 建立第一个路由器 | 1 篇 entry、1 个隔离 Demo、首个 manifest available 注册 | 初始 route、currentRoute、独立 history |
| B02 | L02 链接、视图与激活状态 | 1 篇 entry、1 个隔离 Demo | link active/exact、view 渲染、aria-current |
| B03 | L03 参数、查询与匹配 | 1 篇 entry、1 个匹配 Demo | params/query、repeatable、resolve、组件复用 |
| B04 | L04 嵌套路由 | 1 篇 entry、1 个嵌套 Demo | 默认 child、matched 链、二级 outlet |
| B05 | L05 组合式 API 与编程式导航 | 1 篇 entry、1 个导航 Demo | push/replace、定向 watch、leave guard |
| B06 | L06 命名路由、重定向与别名 | 1 篇 entry、1 个配置 Demo | name、redirect/alias URL 与 guard 差异 |
| B07 | L07 命名视图与路由 Props | 1 篇 entry、1 个视图 Demo | 具名 outlet、按 view 配置 props、组件解耦 |
| B08 | L08 Meta 与导航守卫 | 1 篇 entry、1 个守卫 Demo | meta 合并、guard 顺序、allow/cancel/redirect |
| B09 | L09 路由数据获取 | 1 篇 entry、1 个取数 Demo | 前后取数、loading/error、竞态所有权 |
| B10 | L10 路由懒加载 | 1 篇 entry、1 个真实 import Demo | loader 首次执行、解析完成与复用 |
| B11 | L11 导航失败 | 1 篇 entry、1 个失败 Demo | success、aborted、cancelled、duplicated |
| B12 | L12 RouterView 插槽与过渡 | 1 篇 entry、1 个 slot/cache Demo | KeepAlive、key、isReady、reduced motion |
| B13 | L13 滚动、历史模式与部署 | 1 篇 entry、1 个隔离 scroll Demo | 真实 callback、返回 false、mode/base 责任表 |
| B14 | L14 动态路由与 RouterLink 扩展 | 1 篇 entry、1 个动态 Demo | add/remove/replace、custom link 语义 |
| B15 | L15 类型化与文件路由 | 1 篇 entry、受限 pages fixture、生成声明 | 插件顺序、生成 routes、合法/非法 params type fixture |

每批遵守以下 gate：

1. 开始前重新确认 manifest SHA、`vue-router` lock 版本和 dirty workspace；若 manifest 已改，先
   重做顺序/来源差异审计，不沿用本快照盲目实施。
2. 每次只把本批 entries 从 `planned` 改为 `available`；课程文件、Demo、registry/manifest 和
   最少验证应在同批闭环，不预注册下一批。
3. 每批最多增加一个覆盖该批关键 seam 的 catalog/schema 单测和一个用户路径 E2E；已有测试
   能覆盖时不重复新建。先运行专项，再运行 `npm run type-check`、`npm run lint`、
   `npm run format:check`。
4. UI 批次还需按仓库约束通过可复跑的 Playwright 路径验证默认与 390px viewport、键盘可达和
   reduced-motion；不得以“页面能打开”代替行为断言。
5. B15 额外运行生产 build，验证生成声明被 TypeScript 纳入、插件位于 Vue plugin 前、宿主
   router 未被迁移。B15 配置 gate 未获明确批准时停在 B14，不用概念模拟替代真实构建期证据。
6. 每批完成后停下报告文件、专项与全局 gate；不自动进入下一批，不提交代码。

## R0 / R1 stop boundary

### R0 完成条件

- 本文冻结 15 课顺序、5.2.0 版本、逐课一手来源、Demo seam、API 分工和批次。
- 本文通过目标文件 Prettier check 与 `git diff --check`。
- 不启动 dev server、不打开页面、不运行 build、不写任何课程或配置文件。

### R1 启动条件

- 用户明确批准从某个批次开始实施；“继续调研”“检查计划”不等于授权写课程代码。
- 开始时重新验证版本/manifest 快照；只实施获批批次，完成后停下。
- 第 15 课的 `vue-router/vite` fixture 是单独的构建配置 gate，不随 B01-B14 自动获批。

### R1 明确排除

- 不把站点 `src/router/index.ts` 迁移成文件路由，不改变站点 URL contract。
- 不实施 `vue-router/experimental` router/resolver/param parsers，不接入 Pinia Colada。
- 不创建完整 Reference index，除非另有独立 Reference ticket；本计划只定义覆盖口径。
- 不升级 Vue Router、不改包管理器、不扩展到 React/Pinia/SSR 部署或通用 bundler 教程。
- 不提交、push、发 PR；不清理与本批无关的 dirty workspace。
