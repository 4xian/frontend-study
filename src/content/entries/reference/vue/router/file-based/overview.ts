/**
 * Vue Router 参考：文件路由约定与从构建期到运行时的阶段边界。
 * 查证日期：2026-08-04
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方文档、本地 5.2.0 发布物与固定 commit 源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

const fixedSourceBase =
  'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.file-based.overview',
  type: 'reference',
  title: '文件路由约定与生成管线',
  summary:
    '从 pages 文件树追踪构建插件、虚拟 routes、生成类型与运行时 matcher，明确每一阶段的输入和所有权',
  ecosystem: 'vue',
  module: 'router',
  collection: 'file-based',
  related: [
    'vue.router.reference.file-based.virtual-modules',
    'vue.router.reference.typed-routes.route-map',
    'vue.router.reference.tooling.unplugin',
    'vue.router.reference.configuration.create-router',
    'vue.router.reference.matching.matcher',
    'vue.router.learn.advanced.typed-file-based-routing',
  ],
  tags: ['Vue Router', 'file-based routing', 'pages', 'route tree', 'virtual module', 'matcher'],
  sources: [
    {
      title: 'Vue Router 文件路由：Getting Started',
      url: 'https://router.vuejs.org/file-based-routing',
    },
    {
      title: 'Vue Router 文件路由：File Conventions',
      url: 'https://router.vuejs.org/file-based-routing/file-based-routing',
    },
    {
      title: 'Vue Router 文件路由：Configuration',
      url: 'https://router.vuejs.org/file-based-routing/configuration',
    },
    {
      title: 'Vue Router Guide：Typed Routes',
      url: 'https://router.vuejs.org/guide/advanced/typed-routes',
    },
    {
      title: 'Vue Router 5.2.0 package exports',
      url: `${fixedSourceBase}/package.json`,
    },
    {
      title: 'Vue Router 5.2.0 文件路由配置源码',
      url: `${fixedSourceBase}/src/unplugin/options.ts`,
    },
    {
      title: 'Vue Router 5.2.0 构建上下文源码',
      url: `${fixedSourceBase}/src/unplugin/core/context.ts`,
    },
    {
      title: 'Vue Router 5.2.0 routes 生成器源码',
      url: `${fixedSourceBase}/src/unplugin/codegen/generateRouteRecords.ts`,
    },
    {
      title: 'Vue Router 5.2.0 类型声明生成器源码',
      url: `${fixedSourceBase}/src/unplugin/codegen/generateDTS.ts`,
    },
    {
      title: 'Vue Router 5.2.0 unplugin 虚拟模块源码',
      url: `${fixedSourceBase}/src/unplugin/index.ts`,
    },
    {
      title: 'Vue Router 5.2.0 createRouter 固定源码',
      url: `${fixedSourceBase}/src/router.ts`,
    },
    {
      title: 'Vue Router 5.2.0 matcher 固定源码',
      url: `${fixedSourceBase}/src/matcher/index.ts`,
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  anchors: [
    '概述',
    'Pages 约定',
    '目录到路由树',
    '构建插件与生成产物',
    '运行时 Matcher 交接',
    '阶段边界',
    'Package Exports',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `src/pages/**/*.vue
  -> VueRouter() build plugin
  -> route tree
  -> vue-router/auto-routes + generated route-map.d.ts
  -> createRouter({ routes })
  -> runtime matcher`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '文件路由不是运行时遍历文件系统。`vue-router/vite` 或 `vue-router/unplugin` 在构建进程扫描页面文件，把目录语义编译为 route tree，再从同一棵树生成运行时 routes 与 TypeScript 映射。浏览器收到的是普通 route records；稳定 `createRouter()` 只把这些 records 交给 matcher，不知道原始 pages 目录。',
    },
    {
      type: 'table',
      headers: ['阶段', '输入', '产物', '所有者'],
      rows: [
        ['1. 页面约定', 'routesFolder 中的页面文件', '可解析的文件路径', '应用源码'],
        ['2. 构建分析', '路径、route block、definePage', 'route tree', 'Vue Router 构建插件'],
        ['3. 代码与类型生成', '同一棵 route tree', '虚拟 routes 与 route-map.d.ts', '生成器'],
        ['4. 运行时匹配', 'RouteRecordRaw[] 与导航位置', 'resolved route', 'Router matcher'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '排查问题时先判断它属于哪个阶段：文件没有进入 tree、虚拟模块没有生成、d.ts 没被 TypeScript 纳入，或 records 已生成但运行时没有匹配。四类问题的证据和修复点不同。',
    },
    { type: 'heading', content: 'Pages 约定' },
    {
      type: 'text',
      content:
        '默认配置扫描 `src/pages` 下的 `.vue` 文件。文件名和目录层级提供路由路径，页面组件提供 record 的 component；`index.vue` 表示当前目录的默认路径，方括号表示动态参数，三点参数表示 catch-all，圆括号目录用于只组织文件而不增加 URL segment。',
    },
    {
      type: 'table',
      headers: ['页面文件', '生成路径', '约定重点'],
      rows: [
        ['src/pages/index.vue', '/', '根 index'],
        ['src/pages/about.vue', '/about', '静态 segment'],
        ['src/pages/users/index.vue', '/users', '目录 index'],
        ['src/pages/users/[id].vue', '/users/:id', '单个动态参数'],
        ['src/pages/articles/[...path].vue', '/articles/:path(.*)', 'catch-all 参数'],
        ['src/pages/(admin)/dashboard.vue', '/dashboard', 'route group 不进入 URL'],
      ],
    },
    {
      type: 'text',
      content:
        '生成 record 只要有 `component` 就会有 route name；默认名称来自文件路径，也可通过构建配置或 `definePage()` 覆盖。多个 `routesFolder` 可以挂载到不同 path 前缀，但指定目录必须彼此分离，不能让一个已配置目录包含另一个已配置目录。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`routesFolder` 对象的 `path` 是 URL 前缀，按原样使用且不能以 `/` 开头；`src` 才是文件系统目录。把两者互换会同时破坏扫描范围和生成 URL。',
    },
    { type: 'heading', content: '目录到路由树' },
    {
      type: 'text',
      content:
        '构建开始时，插件按 `routesFolder`、`filePatterns`、`extensions` 与 `exclude` 执行 glob。每个命中文件先转换为 route path，再插入 `PrefixTree`；随后插件读取 SFC route block 与 `definePage()` 的静态信息，把 name、path、alias、props 和 meta 等覆盖合并到相应节点。开发模式 watcher 对 add/change/unlink 重复同一套节点更新。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'vue-router/vite'

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: 'src/pages',
      dts: 'src/route-map.d.ts',
    }),
    Vue(),
  ],
})`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '官方 setup 要求 Vue Router 插件位于 Vue 插件之前。这个顺序让页面宏与 route block 的构建期转换先于普通 SFC 编译，并让后续虚拟模块从已扫描的 tree 生成。',
    },
    { type: 'heading', content: '构建插件与生成产物' },
    {
      type: 'text',
      content:
        'route tree 是生成阶段的单一结构来源。`generateRouteRecords()` 把节点写成异步 component imports、path、name、children、props、alias 与 meta；`generateDTS()` 则生成 `RouteNamedMap`、文件到 route 的映射，并增强根入口 `TypesConfig`。两者来自同一 tree，但一个是构建器提供的运行时代码，一个是交给 TypeScript 的声明文件。',
    },
    {
      type: 'table',
      headers: ['产物', '承载位置', '消费方', '能否手工维护'],
      rows: [
        [
          'routes 数组',
          'vue-router/auto-routes 虚拟模块',
          '应用与 createRouter()',
          '否，修改 pages/构建配置',
        ],
        ['RouteNamedMap', '生成的 route-map.d.ts', 'TypeScript 与 Router 泛型', '否，重新运行插件'],
        ['_RouteFileInfoMap', '生成的 route-map.d.ts', 'SFC typed-router 语言插件', '否，内部映射'],
        [
          '页面动态 import',
          '虚拟 routes 模块代码',
          'bundler chunk graph',
          '由 importMode/页面结构控制',
        ],
      ],
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '运行时再用普通数组方法修改 `routes`，不会反向更新已生成的 route-map.d.ts。需要类型同步的改写应放在 `extendRoute` 或 `beforeWriteFiles` 等构建期 hook。',
    },
    { type: 'heading', content: '运行时 Matcher 交接' },
    {
      type: 'text',
      content:
        '稳定链路在 `createRouter({ routes })` 处完成阶段交接。固定源码中 `createRouter()` 立即调用 `createRouterMatcher(options.routes, options)`；matcher 规范化、排序并索引普通 records，之后按 name、path 或相对 params 解析导航。它不读取 `src/pages`、不运行 glob，也不生成类型。',
    },
    {
      type: 'table',
      headers: ['问题', '应检查的层', '不应归因的层'],
      rows: [
        ['新增页面完全没有 record', '插件扫描与 routesFolder', '浏览器 matcher'],
        ['导航能工作但名称/params 无类型', '生成 d.ts 与 tsconfig include', 'history 模式'],
        ['record 存在但 URL 不匹配', '生成 path 与 matcher 配置', '文件 watcher'],
        ['刷新深层 URL 得到服务器 404', '部署 fallback/history', 'pages 命名规则'],
      ],
    },
    { type: 'heading', content: '阶段边界' },
    {
      type: 'table',
      headers: ['边界', '可以依赖', '不要假设'],
      rows: [
        ['页面源码 -> 构建插件', '约定文件名、静态 route metadata', '浏览器可以读取项目文件树'],
        ['route tree -> 生成器', 'routes 与 d.ts 基于同次扫描', '运行时数组变更会重写类型'],
        ['虚拟模块 -> bundler', '插件拦截精确 module id', 'package 内存在对应 runtime 文件'],
        ['records -> stable matcher', 'RouteRecordRaw[] 公共契约', 'matcher 保留原文件路径语义'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '文件路由是可选的构建期生产者；稳定 Router 仍可接收手写 `RouteRecordRaw[]`。反过来，使用文件约定也不会改变 Router matcher 的公共运行时职责。',
    },
    { type: 'heading', content: 'Package Exports' },
    {
      type: 'text',
      content:
        '下表只冻结本页负责的三个 package export key。稳定 118 项只来自根入口 `.`；两个 experimental 子路径仅登记为 watchlist，本页不展开其成员。文件路由、tooling 与其他附加页都不增加 118 项分母。',
    },
    {
      type: 'table',
      headers: ['export key', '5.2.0 形态', 'RA5 结论'],
      rows: [
        ['.', 'types + ESM + CJS + Node 条件', '唯一稳定 118 项入口'],
        ['./experimental', 'types + ESM', '仅 watchlist；不计 118，不在本页展开'],
        ['./experimental/pinia-colada', 'types + ESM', '仅 watchlist；不计 118，不在本页展开'],
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '只导入 auto-routes，却没有安装构建插件',
          description:
            '`vue-router/auto-routes` 的运行时代码由 Vue Router 构建插件按当前项目生成，不是包内预制 routes 文件。',
          consequence:
            '编辑器可能从声明 stub 看到导出名称，但 bundler 无法得到当前项目的 routes 模块。',
          wrong: {
            lang: 'ts',
            content: `// vite.config.ts 只有 Vue()
// router.ts 却直接导入生成模块
import { routes } from 'vue-router/auto-routes'`,
          },
          correct: {
            lang: 'ts',
            content: `// vite.config.ts
plugins: [VueRouter(), Vue()]

// router.ts
import { routes } from 'vue-router/auto-routes'`,
          },
        },
        {
          title: '把 Vue 插件放在 Vue Router 插件之前',
          description:
            '文件路由插件需要先处理页面宏、route block 与虚拟模块；官方 setup 明确要求 Vue 插件排在其后。',
          consequence: '构建转换顺序不符合约定，页面元数据或生成模块可能缺失。',
          wrong: {
            lang: 'ts',
            content: `plugins: [Vue(), VueRouter()]`,
          },
          correct: {
            lang: 'ts',
            content: `plugins: [VueRouter(), Vue()]`,
          },
        },
        {
          title: '把 route group 名写进导航 URL',
          description:
            '圆括号目录只组织 pages 文件，不形成 URL segment；它和普通静态目录的语义不同。',
          consequence: '应用导航到不存在的 `/admin/dashboard`，实际生成路径是 `/dashboard`。',
          wrong: {
            lang: 'ts',
            content: `// src/pages/(admin)/dashboard.vue
router.push('/admin/dashboard')`,
          },
          correct: {
            lang: 'ts',
            content: `// src/pages/(admin)/dashboard.vue
router.push('/dashboard')`,
          },
        },
        {
          title: '配置彼此嵌套的 routesFolder',
          description:
            '官方约定多个 route folders 必须分离；一个已配置目录不能包含另一个已配置目录。',
          consequence: '同一页面可能被重复扫描或以冲突的前缀生成，route tree 所有权不明确。',
          wrong: {
            lang: 'ts',
            content: `VueRouter({
  routesFolder: ['src/pages', 'src/pages/admin'],
})`,
          },
          correct: {
            lang: 'ts',
            content: `VueRouter({
  routesFolder: [
    'src/pages',
    { src: 'src/admin/routes', path: 'admin/' },
  ],
})`,
          },
        },
        {
          title: '手工编辑生成的 route-map.d.ts',
          description:
            '声明文件由 route tree 重新生成，文件头也明确标注不要修改；正确输入是页面结构和构建期 hooks。',
          consequence: '下一次 dev/build 覆盖手工内容，类型与真实 routes 再次分叉。',
          wrong: {
            lang: 'ts',
            content: `// src/route-map.d.ts
interface RouteNamedMap {
  '/manual': RouteRecordInfo
}`,
          },
          correct: {
            lang: 'ts',
            content: `// vite.config.ts
VueRouter({
  extendRoute(route) {
    if (route.name === '/reports') route.addToMeta({ requiresAuth: true })
  },
})`,
          },
        },
        {
          title: '运行时改 routes 后期待类型自动同步',
          description:
            'TypeScript 映射在构建期从 route tree 生成；运行时数组转换只影响传给 Router 的 records。',
          consequence:
            '页面可以导航，但 RouterLink、push() 与 useRoute() 仍使用旧的名称和 params 类型。',
          wrong: {
            lang: 'ts',
            content: `routes.push({
  path: '/runtime-only',
  component: RuntimeOnlyPage,
})`,
          },
          correct: {
            lang: 'ts',
            content: `// 需要类型时创建页面文件，或在 beforeWriteFiles/extendRoute 中改 tree。
// src/pages/runtime-only.vue`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 从默认配置确定扫描入口',
          content:
            '固定 `options.ts` 把 routesFolder 解析为页面目录，并统一 extensions、filePatterns 与 exclude。结合官方 File Conventions，可把 `src/pages/**/*.vue` 视为默认输入，而不是运行时约定。',
        },
        {
          title: '2. 从 scanPages 确定 route tree 所有权',
          content:
            '固定 `core/context.ts` 创建 `PrefixTree`，对每个命中文件调用 `asRoutePath()` 与 `routeTree.insert()`，再写入 route block/definePage 信息。由此可知文件树先变成构建期语义树。',
        },
        {
          title: '3. 从同一 context 确定双产物',
          content:
            'context 的 `generateRoutes()` 调用 `generateRouteRecords(routeTree, ...)`，`generateDTS()` 则从同一 tree 生成 RouteNamedMap 与文件映射。routes 和类型应按同一次扫描理解。',
        },
        {
          title: '4. 从 unplugin hooks 确定虚拟模块时机',
          content:
            '固定 `unplugin/index.ts` 在 buildStart 扫描 pages，并在 resolveId/load 拦截 `vue-router/auto-routes` 后即时返回生成代码。该 import 依赖构建插件，而不是 package 内 runtime 文件。',
        },
        {
          title: '5. 从 createRouter 确定运行时交接',
          content:
            '固定 `router.ts` 把生成的 RouteRecordRaw[] 交给 `createRouterMatcher()`。matcher 源码只处理 records 与 locations，因此页面扫描、声明写入和运行时解析是三种独立职责。',
        },
        {
          title: '6. 按稳定性选择适用路径',
          content:
            '常规 Vue Router 5.2.0 应用使用文件插件生成 `routes`，再接稳定根入口 `createRouter()`。package manifest 中 experimental 两个子路径只保留 watchlist 身份，不改变根入口 118 项的稳定口径。',
        },
      ],
    },
  ],
})
