/** Vue Router 参考：Volar 插件、兼容入口与 v5 迁移边界。 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

const fixedSourceBase =
  'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.tooling.volar-migration',
  type: 'reference',
  title: 'Volar 与 Vue Router 5 迁移',
  summary: '配置 SFC 路由语言插件，并从旧 unplugin-vue-router 与 auto 兼容入口迁移',
  ecosystem: 'vue',
  module: 'router',
  collection: 'tooling',
  related: [
    'vue.router.reference.tooling.unplugin',
    'vue.router.reference.file-based.overview',
    'vue.router.reference.file-based.virtual-modules',
    'vue.router.reference.typed-routes.route-map',
  ],
  tags: ['Vue Router', 'Volar', 'TypeScript', 'migration', 'deprecated auto'],
  sources: [
    {
      title: 'Vue Router 文件路由：Volar Plugins',
      url: 'https://router.vuejs.org/file-based-routing#volar-plugins',
    },
    {
      title: 'Vue Router 5 迁移指南',
      url: 'https://router.vuejs.org/guide/migration/v4-to-v5',
    },
    {
      title: 'Vue Router 文件路由：Extending Routes',
      url: 'https://router.vuejs.org/file-based-routing/extending-routes',
    },
    {
      title: 'Vue Router 5.2.0 package exports',
      url: `${fixedSourceBase}/package.json`,
    },
    {
      title: 'Vue Router 5.2.0 SFC route blocks 插件源码',
      url: `${fixedSourceBase}/src/volar/entries/sfc-route-blocks.ts`,
    },
    {
      title: 'Vue Router 5.2.0 SFC typed router 插件源码',
      url: `${fixedSourceBase}/src/volar/entries/sfc-typed-router.ts`,
    },
    {
      title: 'Vue Router 5.2.0 auto 兼容声明',
      url: `${fixedSourceBase}/vue-router-auto.d.ts`,
    },
    {
      title: 'Vue Router v5.2.0 release',
      url: 'https://github.com/vuejs/router/releases/tag/v5.2.0',
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  anchors: [
    '概述',
    'Volar 插件职责',
    '迁移到 Vue Router 5',
    'Deprecated Auto 入口',
    'Package Exports',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `vueCompilerOptions.plugins = [
  'vue-router/volar/sfc-route-blocks',
  'vue-router/volar/sfc-typed-router',
]`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        'Vue Router 5 把原 `unplugin-vue-router` 的文件路由能力并入 `vue-router`。构建插件负责扫描和生成，两个 Volar 入口负责编辑器/SFC 语言服务；它们协作但不能互相替代。迁移应同时更新依赖、构建入口、虚拟模块、生成声明位置与 Volar plugin 路径。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`vue-router/auto` 的 5.2.0 声明首行已标记 DEPRECATED。它只是迁移兼容入口，不应作为新项目的 runtime 或类型主入口。',
    },
    { type: 'heading', content: 'Volar 插件职责' },
    {
      type: 'table',
      headers: ['插件', '输入', '语言服务结果', '不会负责'],
      rows: [
        [
          'vue-router/volar/sfc-route-blocks',
          'SFC `<route>` custom block',
          '让 Vue language core 识别页面路由块',
          '扫描 pages 或创建 runtime routes',
        ],
        [
          'vue-router/volar/sfc-typed-router',
          '当前 SFC 文件路径与生成的 _RouteFileInfoMap',
          '为页面中的 useRoute() 注入对应 route name 泛型',
          '生成 RouteNamedMap 或 d.ts',
        ],
      ],
    },
    {
      type: 'code',
      lang: 'json',
      content: `{
  "compilerOptions": {
    "rootDir": "."
  },
  "vueCompilerOptions": {
    "plugins": [
      "vue-router/volar/sfc-route-blocks",
      "vue-router/volar/sfc-typed-router"
    ]
  }
}`,
    },
    {
      type: 'text',
      content:
        '`sfc-typed-router` 根据文件路径查询 `vue-router/auto-routes` 中生成的 `_RouteNamesForFilePath`，再把泛型补到该页面的 `useRoute()`。因此 rootDir、实际文件路径和生成声明必须属于同一 TypeScript project；仅安装 Volar 插件不会产生这些映射。',
    },
    { type: 'heading', content: '迁移到 Vue Router 5' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 合并依赖所有权',
          content:
            '移除 `unplugin-vue-router`，升级到 `vue-router@5`。避免两个包同时扫描同一 pages 目录。',
        },
        {
          title: '2. 更新构建入口',
          content:
            'Vite 从 `unplugin-vue-router/vite` 改为 `vue-router/vite`；其他 bundler 和 tree helpers 改为 `vue-router/unplugin`。',
        },
        {
          title: '3. 更新虚拟模块',
          content:
            '运行时 API 继续从 `vue-router` 导入，生成 routes 从 `vue-router/auto-routes` 导入，不再从兼容 `vue-router/auto` 聚合。',
        },
        {
          title: '4. 更新生成声明',
          content:
            '把 dts 放进项目 include 可见范围，例如 `src/route-map.d.ts`；移除旧 client types reference，重新生成后重启 TypeScript server。',
        },
        {
          title: '5. 更新 Volar 路径',
          content:
            '把 `unplugin-vue-router/volar/*` 替换为两个 `vue-router/volar/*` 精确入口，并确认 rootDir 与 pages 相对路径一致。',
        },
      ],
    },
    {
      type: 'compare',
      labels: ['旧入口', 'Vue Router 5'],
      before: `import VueRouter from 'unplugin-vue-router/vite'
import { routes } from 'vue-router/auto'`,
      after: `import VueRouter from 'vue-router/vite'
import { routes } from 'vue-router/auto-routes'`,
    },
    { type: 'heading', content: 'Deprecated Auto 入口' },
    {
      type: 'text',
      content:
        '`./auto` 的运行时条件仍指向根 Router 构建，但其独立声明明确写着“DEPRECATED: will be removed in future versions”。这会让旧导入暂时可工作，却模糊稳定根 API 与 plugin virtual module 的阶段边界。新代码应把公共 API、routes、resolver 分别放回 `vue-router`、`vue-router/auto-routes`、`vue-router/auto-resolver`。',
    },
    {
      type: 'table',
      headers: ['需求', '使用入口', '不要继续使用'],
      rows: [
        ['createRouter / RouterLink / 类型', 'vue-router', 'vue-router/auto'],
        ['插件生成的 routes', 'vue-router/auto-routes', '手写 alias 或 auto 聚合入口'],
        ['插件生成的 resolver', 'vue-router/auto-resolver', '把 resolver 当稳定 runtime 根 API'],
        ['Vite 构建插件', 'vue-router/vite', 'unplugin-vue-router/vite'],
      ],
    },
    { type: 'heading', content: 'Package Exports' },
    {
      type: 'text',
      content:
        '本页登记迁移、编辑器和稳定性边界相关的 package export key。Experimental 两个入口只作为边界台账出现，不计入稳定 118 项，也不在 RA5 展开其 86 项 surface。',
    },
    {
      type: 'table',
      headers: ['export key', '5.2.0 形态', 'RA5 结论'],
      rows: [
        ['.', '稳定根 types + runtime', '118 项稳定分母的唯一根入口'],
        ['./vetur/*', 'Vetur metadata wildcard', '旧编辑器元数据，不是应用 runtime API'],
        ['./package.json', '包元数据文件', '工具诊断可读取，业务代码不应依赖内部路径'],
        ['./experimental', 'types + ESM', '独立观察项，不计入稳定完成度'],
        ['./experimental/pinia-colada', 'types + ESM', '实验 Data Loader surface，不在 RA5 展开'],
        ['./auto', '兼容 types + 根 runtime 条件', 'deprecated，迁移到精确入口'],
        ['./volar/sfc-route-blocks', 'types + CJS', 'SFC route block language plugin'],
        [
          './volar/sfc-typed-router',
          'types + CJS',
          '按页面文件推导 useRoute 类型的 language plugin',
        ],
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '只升级依赖，不更新旧 import path',
          description: 'Vue Router 5 合并了旧 unplugin，但不会把源代码中的旧包名自动重写为新入口。',
          consequence: '项目仍依赖已移除包，或同时加载新旧两个扫描插件。',
          wrong: {
            lang: 'ts',
            content: `import VueRouter from 'unplugin-vue-router/vite'`,
          },
          correct: {
            lang: 'ts',
            content: `import VueRouter from 'vue-router/vite'`,
          },
        },
        {
          title: '把 Volar 插件放进 compilerOptions.plugins',
          description: '这两个入口是 Vue language plugins，应配置在 `vueCompilerOptions.plugins`。',
          consequence:
            'TypeScript/Vue language server 不加载插件，SFC 中的 route block 和 useRoute 无增强。',
          wrong: {
            lang: 'json',
            content: `{ "compilerOptions": { "plugins": ["vue-router/volar/sfc-typed-router"] } }`,
          },
          correct: {
            lang: 'json',
            content: `{ "vueCompilerOptions": { "plugins": ["vue-router/volar/sfc-typed-router"] } }`,
          },
        },
        {
          title: '同时保留新旧 Volar 插件',
          description: '迁移指南要求把旧 `unplugin-vue-router/volar/*` 替换为新 package subpath。',
          consequence: '同一 SFC 被重复增强，诊断来源与升级责任不清晰。',
          wrong: {
            lang: 'json',
            content: `{
  "plugins": [
    "unplugin-vue-router/volar/sfc-typed-router",
    "vue-router/volar/sfc-typed-router"
  ]
}`,
          },
          correct: {
            lang: 'json',
            content: `{ "plugins": ["vue-router/volar/sfc-typed-router"] }`,
          },
        },
        {
          title: '忽略 rootDir 与生成声明的项目边界',
          description:
            'typed-router 插件用 SFC 文件路径查询生成 map；固定实现缺少 rootDir 时也会输出警告。',
          consequence: 'useRoute() 无法定位当前页面对应的 route name，类型退回宽泛结果。',
          wrong: {
            lang: 'json',
            content: `{ "vueCompilerOptions": { "plugins": ["vue-router/volar/sfc-typed-router"] } }`,
          },
          correct: {
            lang: 'json',
            content: `{
  "compilerOptions": { "rootDir": "." },
  "include": ["src", "src/route-map.d.ts"]
}`,
          },
        },
        {
          title: '期待 Volar 插件代替构建插件',
          description:
            'Volar 只增强语言服务；pages 扫描、虚拟 routes 和 d.ts 仍由 `vue-router/vite` 或 unplugin 生成。',
          consequence: '编辑器配置看似齐全，但生产构建找不到 auto-routes，类型 map 也不存在。',
          wrong: {
            lang: 'text',
            content: `只配置 vueCompilerOptions.plugins，不安装 VueRouter() 构建插件`,
          },
          correct: {
            lang: 'text',
            content: `构建配置负责生成，vueCompilerOptions.plugins 负责 SFC 编辑体验`,
          },
        },
        {
          title: '新代码继续从 vue-router/auto 导入',
          description: '固定声明明确标为 deprecated，并计划在未来版本移除。',
          consequence:
            '稳定 runtime、生成 routes 与 experimental 类型被兼容层混在一起，迁移成本延后。',
          wrong: {
            lang: 'ts',
            content: `import { createRouter, routes } from 'vue-router/auto'`,
          },
          correct: {
            lang: 'ts',
            content: `import { createRouter } from 'vue-router'
import { routes } from 'vue-router/auto-routes'`,
          },
        },
        {
          title: '把 Vetur metadata 或 package.json 当运行时 API',
          description: '`./vetur/*` 与 `./package.json` 是工具/元数据入口，不提供路由匹配能力。',
          consequence: '业务代码依赖包布局，既增加 bundle 风险，也绕开正式 Router contract。',
          wrong: {
            lang: 'ts',
            content: `import tags from 'vue-router/vetur/tags.json'`,
          },
          correct: {
            lang: 'ts',
            content: `import { useRoute, useRouter } from 'vue-router'`,
          },
        },
        {
          title: '把 experimental 子路径计入稳定完成度',
          description:
            'package export 只证明子路径可解析；Data Loaders、resolver 等仍有独立实验性声明和变更风险。',
          consequence: '把 86 项观察 surface 误写成稳定根入口，版本承诺与用户预期失真。',
          wrong: {
            lang: 'text',
            content: `Vue Router 稳定 API = 根入口 118 项 + experimental 86 项`,
          },
          correct: {
            lang: 'text',
            content: `稳定完成度只统计根入口 118 项；experimental 保持独立 watchlist`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 两个 Volar 入口承担不同转换',
          content:
            '固定发布声明把两者都定义为 VueLanguagePlugin；route-blocks 处理 custom block，typed-router 带 rootDir options 并按文件生成 useRoute 泛型。只启用真正需要的编辑器能力。',
        },
        {
          title: '2. 页面级类型依赖 auto-routes 的生成映射',
          content:
            '固定 typed-router 实现引用 `_RouteNamesForFilePath`，该映射由生成声明增强。适合由同一 file tree 同时驱动 runtime routes 与页面类型，不适合手写第二份文件到 route name 对照。',
        },
        {
          title: '3. Deprecated auto 是过渡层而非新架构',
          content:
            '固定 `vue-router-auto.d.ts` 首行标记未来移除，而 package runtime 条件回指根构建。迁移时应拆回精确入口，而不是因为旧代码暂时运行就保留聚合依赖。',
        },
        {
          title: '4. v5 迁移的主线是所有权合并',
          content:
            '官方迁移指南把 dependency、build import、virtual module、client types 与 Volar path 一并迁移。出现类型不生效时按这条链逐段排查，比只重启编辑器更可靠。',
        },
        {
          title: '5. Metadata export 不等于应用 API',
          content:
            '固定 export map 保留 Vetur 与 package.json 是为了工具兼容；它们不参与 Router 安装、matcher 或导航。应用运行时继续以根入口和明确 virtual module 为边界。',
        },
        {
          title: '6. Experimental 保持独立版本账本',
          content:
            '固定 package 同时导出 experimental 子路径，但 RA5 只登记解析边界。需要实验 resolver 或 Data Loaders 时，应在独立 watchlist 核对 flag、来源与升级风险。',
        },
      ],
    },
  ],
  notes: [
    'Volar 插件增强编辑器语言服务，不负责生产构建中的 pages 扫描或虚拟模块生成。',
    '`vue-router/auto` 在 5.2.0 已明确 deprecated，新代码使用根入口和两个精确 virtual module。',
  ],
})
