# Vue Router R1-B15：类型化与文件路由调研

> 核验日期：2026-08-04
>
> 适用版本：Vue Router 5.2.0；固定 tag commit
> `6e5f8d253b9444a76eb58f176ebe08d686c937cb`
>
> 调研时 manifest SHA-256：
> `45e9fdbc95b7cf9a9fdeec439763ae5dca915492c18ec3e485e3d1ef5f9d4278`
>
> 范围：B15 单课调研；不实现课程、fixture、类型声明或构建配置，不修改宿主 router。
> 外部资料先经 Tavily 定位，再以 Vue Router 官方 Guide/API 与 `vuejs/router@v5.2.0`
> 固定源码核验。

## 结论

B15 应先用一个最小手工 `RouteRecordInfo` map 解释类型系统，再切换到文件路由生成链路。手工
map 能说明 route name、path、raw params、normalized params 和 children names 的关系，但维护成本
高且容易漂移；正式练习应由 `vue-router/vite` 扫描一个严格受限的 pages fixture，同时生成
`vue-router/auto-routes` 的 routes 和类型。

本课是 15 课中唯一构建期 seam。唯一可执行 Demo 是独立 Vite fixture，不接入宿主
`vite.config.ts`、`src/pages/`、`src/router/` 或 interactive registry。专项证据以“生产构建真实生成
routes/d.ts + 独立 `vue-tsc` 验证合法与预期非法 params”为主，不用手写静态对象模拟插件结果。

## 官方契约

### 手工类型化路由

官方 Typed Routes Guide 允许声明 route-name map，并通过 `TypesConfig.RouteNamedMap` module
augmentation 接入 Router 类型系统。每个 `RouteRecordInfo` 的五个类型参数依次为：

1. route name；
2. path；
3. 导航输入接受的 raw params；
4. URL 解析后读取的 normalized params；
5. 所有 child route names 的联合类型。

例如必填 `:id` 的 raw 值可以接收 `string | number`，但从 URL 读取时默认是 `string`。手工 map
只提供编译期类型，不会创建运行时 route records；运行时 routes 仍必须与 map 保持一致。

依据：[Typed Routes](https://router.vuejs.org/guide/advanced/typed-routes)、
[`RouteRecordInfo`](https://router.vuejs.org/api/interfaces/routerecordinfo)、
[`route-map.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/typed-routes/route-map.ts)。

### 文件路由插件

- Vite 入口是 `vue-router/vite`，且 `VueRouter()` 必须位于 `Vue()` 之前。
- 插件默认扫描 `src/pages`，但 B15 必须显式指定 fixture `root` 与 `routesFolder`，不能依赖默认值。
- `vue-router/auto-routes` 是插件提供的虚拟模块，公开 `routes`、`handleHotUpdate` 和生成的
  `RouteNamedMap` 类型；它不是仓库中的普通源码文件。
- `routes` 传给 `createRouter()` 后才产生运行时 router。插件负责 build-time 扫描、转换、代码生成
  和类型生成，不代替 `createRouter()`。
- `vue-router/auto` 在 5.2.0 发布物中仅保留弃用类型文件，不能作为课程导入入口。

依据：[File-Based Routing](https://router.vuejs.org/file-based-routing)、
[Configuration](https://router.vuejs.org/file-based-routing/configuration)、
[`package.json@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/package.json)、
[`moduleConstants.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/core/moduleConstants.ts)、
[`index.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/index.ts)。

### 生成声明与 TypeScript

插件生成的 d.ts 同时完成两件事：

- 扩展 `vue-router` 的 `TypesConfig.RouteNamedMap`，令 Router 的 location/params 类型读取生成 map；
- 扩展 `vue-router/auto-routes`，写入每条 route 的 `RouteRecordInfo` 与 page-file 信息。

生成文件必须显式纳入 fixture `tsconfig.json` 的 `include`，并使用 bundler module resolution。B15
固定 `dts` 路径，不依赖“检测到 TypeScript 才默认生成”的环境行为，也不手改生成文件。官方
建议提交生成声明，但本仓库是否提交应由实现批次按既有生成物策略决定；课程只强调它是可再生
产物和类型输入。

依据：[File-Based Routing](https://router.vuejs.org/file-based-routing)、
[v4 -> v5 Migration](https://router.vuejs.org/guide/migration/v4-to-v5)、
[`generateDTS.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/codegen/generateDTS.ts)。

### 构建期扩展与运行时变更

`extendRoute` 逐条修改可编辑节点，`beforeWriteFiles` 在每次写生成文件前接收 root；两者都允许
Promise，且修改会进入生成 routes 与 d.ts。运行时再调用 `addRoute()`、修改 `routes` 数组，或把
生成 routes 传给其他插件，不会回写编译期类型。需要类型支持的结构变化必须回到 build-time
tree。

依据：[Extending Routes](https://router.vuejs.org/file-based-routing/extending-routes)、
[File-Based Routing: Manipulating Routes](https://router.vuejs.org/file-based-routing#manipulating-the-routes)、
[`context.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/core/context.ts)。

## 版本差异与课程口径

1. 当前 API 将 `TypesConfig` 标为 internal，但官方 Typed Routes Guide 明确使用
   `TypesConfig.RouteNamedMap`。课程只讲这个文档化的 typed-route 接入 seam，不鼓励应用自定义
   其他内部 slot。
2. 当前 File-Based Routing Guide 以启动 dev server 生成首份 d.ts；固定源码的 `buildStart()`
   同样执行 page scan 和写文件。因此 B15 用生产 build 作为确定性 Gate，不需要启动第二个服务。
3. 当前 Extending Routes 页面称 `definePage` 必要时可从 `vue-router` 导入，但 5.2.0 主入口类型
   没有该导出；固定发布物只给 auto-routes 全局宏类型并从 experimental 取得签名。B15 不示范
   显式导入，也不把 `definePage` 作为稳定主线能力。
4. 官网会继续随主分支更新。B15 的导出、默认值、生成格式和实验性边界以本地 5.2.0 发布物与
   固定 tag 为准，不把未来版本行为写成 5.2.0 契约。

## 课程冻结

- ID：`vue.router.learn.advanced.typed-file-based-routing`
- 标题：类型化与文件路由
- collection / level：`advanced`
- 硬前置：
  `vue.router.learn.basics.route-params-query-matching`、
  `vue.router.learn.basics.nested-routes`、
  `vue.router.learn.basics.composition-programmatic-navigation`、
  `vue.router.learn.intermediate.named-routes-redirects-aliases`、
  `vue.router.learn.intermediate.named-views-route-props`、
  `vue.router.learn.intermediate.lazy-loading`、
  `vue.router.learn.advanced.dynamic-routing-router-link`。不临时扩大 Vue Core 或工程化课程依赖。
- previous：B14 `vue.router.learn.advanced.dynamic-routing-router-link`
- next：无；B15 是 Vue Router 当前课程终点。
- 唯一可执行示例：独立 `vue-router-b15-typed-file-routing` fixture。
- 宿主边界：不修改 `src/router/index.ts`、宿主 `vite.config.ts`、宿主 `src/pages/` 或站点 URL。

## 学习目标与正文顺序

1. 从手工 route-name map 理解 `RouteRecordInfo` 的五个位置，以及 raw/normalized params 差异。
2. 理解 `TypesConfig.RouteNamedMap` 如何让 `router.push()`、`router.resolve()`、RouterLink 和 route
   location 类型读取同一 map。
3. 认识手工 map 与运行时 routes 的双份维护成本，说明为何官方推荐生成。
4. 配置独立 `vue-router/vite`，并解释插件必须早于 `Vue()` 的构建转换顺序。
5. 从受限 pages 生成 `vue-router/auto-routes`、`RouteNamedMap` 和 d.ts。
6. 用合法与 `@ts-expect-error` 反例验证 required params、未知 params 和未知 name。
7. 区分 build-time tree 扩展、runtime router mutation 与 HMR，不承诺类型会在运行时增长。
8. 以生产 build 和独立 type-check 收束工程化边界。

## 唯一 Fixture Contract

固定目录：`tests/fixtures/vue-router-b15-typed-file-routing/`。所有 B15 插件输入、生成物和构建
输出都限制在该目录或 `node_modules/.tmp/`，不得扫描宿主目录。

```text
tests/fixtures/vue-router-b15-typed-file-routing/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── generated/
│   └── route-map.d.ts
├── pages/
│   ├── index.vue
│   └── users/
│       └── [id].vue
└── src/
    ├── App.vue
    ├── main.ts
    ├── router.ts
    └── type-contract.ts
```

约束如下：

- `pages/` 是唯一 `routesFolder`，只允许以上两个 page 组件；不得指向宿主 `src/pages/`。
- `vite.config.ts` 的 `root` 固定为 fixture 自身，插件顺序固定为
  `VueRouter({ root, routesFolder: 'pages', dts: 'generated/route-map.d.ts', watch: false })`、
  `Vue()`。
- 生产输出写到 `node_modules/.tmp/vue-router-b15-build/`，不产生可提交的 fixture `dist/`。
- `src/router.ts` 从稳定主入口导入 `createRouter` / `createMemoryHistory`，只从
  `vue-router/auto-routes` 导入 `routes`；不从 `vue-router/auto` 导入任何 API。
- fixture mini-app 只渲染两个生成 route，并展示当前 route name/path/params；它不嵌入宿主 app。
- `tsconfig.json` 明确包含 `src/**/*.ts`、`src/**/*.vue`、`pages/**/*.vue` 和
  `generated/route-map.d.ts`，`moduleResolution` 使用 `Bundler`。
- `generated/route-map.d.ts` 必须由真实插件生成；测试不得提前写一份伪造声明使 type-check
  “自证通过”。

## Params 类型 Fixture

`src/type-contract.ts` 只作为编译期契约，不被 runtime entry 导入。至少固定以下断言：

```ts
router.resolve({ name: '/', params: {} })
router.resolve({ name: '/users/[id]', params: { id: '42' } })
router.resolve({ name: '/users/[id]', params: { id: 42 } })

// @ts-expect-error 缺少必填 id
router.resolve({ name: '/users/[id]', params: {} })

// @ts-expect-error 当前 route 不接受 slug
router.resolve({ name: '/users/[id]', params: { slug: 'wrong' } })

// @ts-expect-error 生成 map 中不存在该名称
router.resolve({ name: '/missing', params: {} })
```

同一文件还应证明 normalized `/users/[id]` 的 `params.id` 是 `string`，不能把 raw 导航允许的
`number` 误写成读取结果。`@ts-expect-error` 必须紧贴确实报错的下一行；若类型退化导致该行不再
报错，TypeScript 应以“unused directive”让 Gate 失败。

## 结构化易错方向

### 1. 把 `VueRouter()` 放到 `Vue()` 后

- 原因：按普通 Vite 插件随意排序，没有注意 route block / `definePage` 等转换发生在 Vue SFC
  编译前。
- 后果：页面扫描或 SFC 路由扩展可能不完整，开发与生产结果不一致。
- 错误示范：`plugins: [Vue(), VueRouter()]`。
- 正确示范：始终使用 `plugins: [VueRouter(options), Vue()]`，并由 fixture config 锁定顺序。

### 2. 使用默认 `src/pages` 扫描宿主项目

- 原因：复制官方最小示例但没有设置 fixture root/routesFolder。
- 后果：课程 fixture 混入站点页面，生成 name map 随宿主内容变化，甚至产生重复路由。
- 错误示范：在宿主 Vite 配置直接调用无参数 `VueRouter()`。
- 正确示范：显式把 root、routesFolder、dts 和 outDir 限制到 B15 fixture。

### 3. 插件已生成 d.ts，但 TypeScript 没有读取

- 原因：只看到文件落盘，没有检查 `tsconfig.include` 和 bundler module resolution。
- 后果：name/params 退化为 generic，错误导航也能通过类型检查。
- 错误示范：把 d.ts 生成到 fixture 外，或依赖编辑器偶然加载。
- 正确示范：固定生成路径并显式纳入独立 tsconfig，再用独立 `vue-tsc` 验证。

### 4. 从 `vue-router/auto` 导入运行时 API

- 原因：沿用旧 unplugin 记忆，把兼容入口与生成 routes 模块混同。
- 后果：依赖已弃用入口，无法清楚区分稳定 runtime 和 build-time virtual module。
- 错误示范：`import { createRouter } from 'vue-router/auto'`。
- 正确示范：公共 API 从 `vue-router` 导入，生成 routes 从 `vue-router/auto-routes` 导入。

### 5. 把 `vue-router/auto-routes` 当普通文件

- 原因：看到 TypeScript stub 就误以为包中存在可直接执行的 JS 文件。
- 后果：未安装插件时构建无法解析模块，或测试用手写 mock 掩盖真实配置缺失。
- 错误示范：跳过 `vue-router/vite`，只添加路径 alias/mock。
- 正确示范：由独立 Vite 插件在 resolve/load seam 提供虚拟模块，并通过生产 build 证明。

### 6. 交换 raw params 与 normalized params

- 原因：把“传给导航”和“从 URL 读取”视为同一种值。
- 后果：手工 map 错误拒绝数字导航，或错误承诺读取结果仍为 number。
- 错误示范：`:id` 的 ParamsRaw 仅写 `string`，Params 写 `string | number`。
- 正确示范：默认路径参数 raw 接受 `string | number`，normalized 为 `string`。

### 7. 手改生成的 `route-map.d.ts`

- 原因：把生成声明当业务类型源，直接补 route name 或 params。
- 后果：下一次扫描覆盖修改，运行时 routes 与类型再次分裂。
- 错误示范：在 generated 文件里手写 `/admin`。
- 正确示范：修改 page 文件或 build-time route hooks，再重新生成并复跑类型 Gate。

### 8. 认为 runtime route mutation 会扩充类型

- 原因：把 B14 的 `addRoute()` matcher 行为与 B15 的 codegen 混成一个阶段。
- 后果：新 route 运行时可匹配，但编译期 name/params map 不会自动变化。
- 错误示范：`addRoute()` 后期待未知 name 立刻通过 `vue-tsc`。
- 正确示范：类型需要变化时修改 build-time tree；纯 runtime route 使用明确的动态边界。

### 9. 把 `extendRoute` / `beforeWriteFiles` 当运行时 hook

- 原因：忽略它们属于 Vite 插件 options。
- 后果：在组件中等待它们或依赖浏览器状态，构建无法得到确定结果。
- 错误示范：hook 中读取 window、当前用户或当前 route。
- 正确示范：只根据文件树和确定性构建输入修改 route，并让变更进入生成 d.ts。

### 10. 显式导入或滥用 `definePage`

- 原因：直接照搬会漂移的当前官网措辞，没有核对 5.2.0 主入口。
- 后果：示例使用固定版本不存在的稳定导出，或在宏参数中引用 setup 局部变量。
- 错误示范：从 `vue-router` 显式导入 `definePage` 并把它当运行时函数。
- 正确示范：B15 主线不依赖该宏；若后续专题涉及，必须标注 build-time/global 与版本边界。

## Vue Router 5.2.0 源码推导

1. `RouteMap` 只在 `TypesConfig` 含 `RouteNamedMap` 时切换到 typed map，否则回退
   `RouteMapGeneric`；因此“类型突然失效”通常应先检查 augmentation 是否被 tsconfig 加载。
2. `RouteRecordInfo` 分开保存 `paramsRaw` 与 `params`；这不是文档示例习惯，而是 navigation input
   与 normalized route 类型计算的正式基础。
3. `generateRouteNamedMap()` 只为“有 component 且有 name”的节点输出 map entry，纯结构节点不会
   自动成为可命名导航目标。
4. `generateRouteRecordInfo()` 从文件树写入 name、fullPath、raw params、normalized params 和所有
   深层 child names，手工 map 最容易漏掉的内容正是生成器的固定输出。
5. `MODULE_ROUTES_PATH` 固定为 `vue-router/auto-routes`；unplugin 的 resolve/load hooks 将它变成
   `\0` virtual id，并在 load 时调用 `generateRoutes()`，所以包内只有类型 stub 而无普通 JS 实体。
6. unplugin 的 `buildStart()` 先 `scanPages()`；扫描完成后才生成 routes/d.ts。生产 build 因此是
   可验证 file-tree -> virtual module -> bundle 的真实 seam，而不是只测配置对象。
7. 初次扫描会逐条 `await extendRoute()`，写文件前再 `await beforeWriteFiles()`；两类 public hook
   都能在 codegen 前改变同一 editable tree，所以其结果会同时反映在 runtime routes 和类型。
8. `generateDTS()` 通过 module augmentation 把 auto-routes 的 `RouteNamedMap` 接到
   `TypesConfig.RouteNamedMap`；运行时 `addRoute()` 不经过该函数，无法反向改变编译期 map。
9. 默认 `routesFolder` 是 `src/pages`、`importMode` 是 async，`dts` 是否默认开启取决于本地能否
   检测到 TypeScript。教学 fixture 显式配置这些关键值，避免环境隐式差异。
10. context 只在生成内容变化时重写 d.ts，并在 page watcher 变化后更新虚拟 routes；HMR 是开发期
    同步机制，不是生产构建或类型正确性的替代证据。

固定源码：

- [`typed-routes/route-map.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/typed-routes/route-map.ts)
- [`unplugin/codegen/generateRouteMap.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/codegen/generateRouteMap.ts)
- [`unplugin/codegen/generateDTS.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/codegen/generateDTS.ts)
- [`unplugin/core/context.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/core/context.ts)
- [`unplugin/core/moduleConstants.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/core/moduleConstants.ts)
- [`unplugin/index.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/index.ts)
- [`unplugin/options.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/unplugin/options.ts)

## 最小专项验证

实施批次按以下顺序执行，一项闭环后再进入下一项：

1. B15 catalog test 先建立真实红灯：期望 15 课而当前仅加载 14 课；同时冻结 B14 为 previous、B15
   为末课、ID/标题/前置关系和无 next。
2. 实现正文与独立 fixture 后，复跑同一 catalog test 转绿；不为 fixture 注册宿主 Demo。
3. 删除旧生成声明后运行生产构建：
   `npx vite build --config tests/fixtures/vue-router-b15-typed-file-routing/vite.config.ts`。验证 d.ts
   被真实重建，bundle 可解析 `vue-router/auto-routes`，输出只进入 `node_modules/.tmp/`。
4. 运行独立类型 Gate：
   `npx vue-tsc --noEmit -p tests/fixtures/vue-router-b15-typed-file-routing/tsconfig.json`。三条合法
   resolve 必须通过，缺失 id、错误 param、未知 name 三条 `@ts-expect-error` 必须各自命中错误。
5. 定向执行 B15 catalog 与 `src/content/schema/entry-template.spec.ts`，再执行全量 Vitest、宿主
   type-check、触及文件 Oxlint/Prettier 和禁用 CSS 属性检查。
6. 对最终 B15 范围做 Standards / Spec 双轴复审，目标为 `PASS / 0 finding`，再把最终测试数量、
   build/type Gate 和 manifest SHA-256 写入实施计划。

本批不需要启动或复用 localhost，不需要 Playwright 模拟编译期类型；生产 build 和独立 type-check
是该 seam 的最小可信证据。若实现额外增加浏览器 smoke，只能验证 fixture runtime 输出，不能替代
上述两项 Gate。

## 明确排除

- 不迁移、替换或部分接管宿主 `src/router/index.ts`。
- 不修改宿主 `vite.config.ts`，不扫描宿主 `src/pages/`，不改变站点 URL/history。
- 不扩展到 Pinia、Vue Core、React、SSR、Data Loaders 或自定义 param parsers。
- 不教授低层 `createRoutesContext`、resolver、Volar 插件实现或多 bundler 配置。
- 不使用 `vue-router/auto`，不把 `vue-router/experimental` 计入稳定课程完成度。
- 不把 `addRoute()`、权限菜单或后端路由描述为类型生成输入。
- 不提交代码，不处理 `.playwright-cli/**`、`docs/backend/**` 或其他并行脏文件。

## B15 Stop Boundary

B15 的完成条件仅为：官方调研、catalog 真实红绿、课程正文、唯一独立 fixture、真实生成声明、
params 正反类型 Gate、生产 build、静态/全量测试、Standards/Spec 双轴复核与计划落账全部通过。

B15 完成即停止 Vue Router 当前 15 课实施；不得顺带开始 Router Reference、Pinia、Vue Core、React、
后端工作或宿主 router 文件路由迁移。

## 官方来源

- [Typed Routes](https://router.vuejs.org/guide/advanced/typed-routes)
- [File-Based Routing](https://router.vuejs.org/file-based-routing)
- [File Conventions](https://router.vuejs.org/file-based-routing/file-based-routing)
- [Configuration](https://router.vuejs.org/file-based-routing/configuration)
- [Extending Routes](https://router.vuejs.org/file-based-routing/extending-routes)
- [Migrating to Vue Router 5](https://router.vuejs.org/guide/migration/v4-to-v5)
- [API: RouteRecordInfo](https://router.vuejs.org/api/interfaces/routerecordinfo)
- [API: TypesConfig](https://router.vuejs.org/api/interfaces/typesconfig)
- [Vue Router v5.2.0 release](https://github.com/vuejs/router/releases/tag/v5.2.0)
- [`vuejs/router@v5.2.0`](https://github.com/vuejs/router/tree/v5.2.0)
