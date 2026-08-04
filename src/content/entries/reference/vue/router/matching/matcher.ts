/**
 * Vue Router 参考：matcher location、路径解析选项与内部 matcher 边界
 * 查证来源（2026-08-04）：
 * - https://router.vuejs.org/api/interfaces/pathparseroptions
 * - https://router.vuejs.org/api/interfaces/matcherlocation
 * - https://router.vuejs.org/api/interfaces/matcherlocationaspath
 * - https://router.vuejs.org/api/interfaces/routermatcher
 * - https://router.vuejs.org/api/type-aliases/pathparseroptions
 * - https://router.vuejs.org/api/functions/createroutermatcher
 * - https://router.vuejs.org/guide/essentials/route-matching-syntax.html
 * - https://router.vuejs.org/guide/essentials/named-routes
 * - https://router.vuejs.org/guide/advanced/dynamic-routing.html
 * - https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/matcher/index.ts
 * - https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/matcher/pathParserRanker.ts
 * - https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/types/index.ts
 * 查证工具：Tavily、Vue Router 官方 API/Guide、vue-router 5.2.0 本地声明与运行时代码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.matching.matcher',
  type: 'reference',
  title: 'Matcher 与路径解析',
  summary:
    '查询 matcher location、路径解析选项及底层 matcher 契约，并明确公开 Router API 与 internal 实现面的边界',
  ecosystem: 'vue',
  module: 'router',
  collection: 'matching',
  related: [
    'vue.router.reference.configuration.create-router',
    'vue.router.reference.configuration.router-instance',
    'vue.router.reference.matching.route-records',
    'vue.router.reference.matching.route-locations',
    'vue.router.reference.matching.params-query',
  ],
  tags: [
    'Vue Router',
    'MatcherLocation',
    'PathParserOptions',
    'RouterMatcher',
    'createRouterMatcher',
    'route matching',
  ],
  sources: [
    {
      title: 'Vue Router API：_PathParserOptions',
      url: 'https://router.vuejs.org/api/interfaces/pathparseroptions',
    },
    {
      title: 'Vue Router API：MatcherLocation',
      url: 'https://router.vuejs.org/api/interfaces/matcherlocation',
    },
    {
      title: 'Vue Router API：MatcherLocationAsPath',
      url: 'https://router.vuejs.org/api/interfaces/matcherlocationaspath',
    },
    {
      title: 'Vue Router API：RouterMatcher',
      url: 'https://router.vuejs.org/api/interfaces/routermatcher',
    },
    {
      title: 'Vue Router API：PathParserOptions',
      url: 'https://router.vuejs.org/api/type-aliases/pathparseroptions',
    },
    {
      title: 'Vue Router API：createRouterMatcher()',
      url: 'https://router.vuejs.org/api/functions/createroutermatcher',
    },
    {
      title: 'Vue Router Guide：路由匹配语法',
      url: 'https://router.vuejs.org/guide/essentials/route-matching-syntax.html',
    },
    {
      title: 'Vue Router Guide：命名路由',
      url: 'https://router.vuejs.org/guide/essentials/named-routes',
    },
    {
      title: 'Vue Router Guide：动态路由',
      url: 'https://router.vuejs.org/guide/advanced/dynamic-routing.html',
    },
    {
      title: 'Vue Router v5.2.0 matcher 固定源码',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/matcher/index.ts',
    },
    {
      title: 'Vue Router v5.2.0 path parser ranker 固定源码',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/matcher/pathParserRanker.ts',
    },
    {
      title: 'Vue Router v5.2.0 matcher location 固定类型',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/types/index.ts',
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  anchors: [
    '概述',
    'Internal Path Parser Options',
    'Matcher Location',
    'Matcher Location As Path',
    'Router Matcher',
    'Path Parser Options',
    'Create Router Matcher',
    '应用层替代路径',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `/** @internal */
interface _PathParserOptions {
  sensitive?: boolean
  strict?: boolean
  /** @internal */
  start?: boolean
  /** @deprecated 后续版本将始终按 true 处理。 */
  end?: boolean
}

interface MatcherLocation {
  name: RouteRecordNameGeneric | null | undefined
  path: string
  params: RouteParamsGeneric
  meta: RouteMeta
  matched: RouteRecord[]
}

/** @internal */
interface MatcherLocationAsPath {
  path: string
}

/** @internal */
interface RouterMatcher {
  addRoute: (record: RouteRecordRaw, parent?: RouteRecordMatcher) => () => void
  removeRoute(matcher: RouteRecordMatcher): void
  removeRoute(name: NonNullable<RouteRecordNameGeneric>): void
  clearRoutes: () => void
  getRoutes: () => RouteRecordMatcher[]
  getRecordMatcher: (
    name: NonNullable<RouteRecordNameGeneric>,
  ) => RouteRecordMatcher | undefined
  resolve: (
    location: MatcherLocationRaw,
    currentLocation: MatcherLocation,
  ) => MatcherLocation
}

type PathParserOptions = Pick<
  _PathParserOptions,
  'end' | 'sensitive' | 'strict'
>

/** @internal */
function createRouterMatcher(
  routes: Readonly<RouteRecordRaw[]>,
  globalOptions: PathParserOptions,
): RouterMatcher`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        'Vue Router 的 matcher 把 route records 编译为可排序的路径解析器，再把按名称、按路径或相对 params 表达的位置解析成 `MatcherLocation`。稳定应用通常通过 `createRouter()`、`router.resolve()` 和 Router 的动态路由方法间接使用它；`RouterMatcher` 与工厂函数属于 Router 内部组装层。',
    },
    {
      type: 'table',
      headers: ['API', '源码标签', '本页深度', '应用层结论'],
      rows: [
        [
          '_PathParserOptions',
          'internal',
          'quick',
          '不直接依赖；只用于理解 public 选项为何排除 start',
        ],
        [
          'MatcherLocation',
          'public',
          'merged',
          '理解 matcher 产出的五个核心字段，实际消费通常使用更丰富的 resolved route',
        ],
        [
          'MatcherLocationAsPath',
          'internal',
          'quick',
          '不直接构造；应用传 RouteLocationRaw 给 router.resolve/push/replace',
        ],
        ['RouterMatcher', 'internal', 'quick', '不保存、不注入、不模拟；使用 Router 的公开方法'],
        [
          'PathParserOptions',
          'public',
          'merged',
          '在 Router 或 route record 上配置 strict/sensitive；避开 deprecated end',
        ],
        [
          'createRouterMatcher',
          'internal',
          'quick',
          '不直接调用；由 createRouter() 建立并持有 matcher',
        ],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        'API 页面能列出一个导出名称，不代表它适合应用层依赖。5.2.0 固定声明中的 `@internal` 是本页判断边界的依据；下划线只能作为辅助信号，不能替代源码标签。',
    },
    { type: 'heading', content: 'Internal Path Parser Options' },
    {
      type: 'text',
      content:
        '`_PathParserOptions` 是完整路径正则生成选项，包含 `sensitive`、`strict`、`start` 和 `end`。整个接口在固定声明中标记为 `@internal`，其中 `start` 还单独标记 internal；它解释 matcher 怎样控制正则两端，但不是应用配置类型。',
    },
    {
      type: 'table',
      headers: ['属性', '默认值', 'matcher 作用', '稳定性边界'],
      rows: [
        ['sensitive', 'false', '让生成的 RegExp 区分大小写', '通过 PathParserOptions 公开'],
        ['strict', 'false', '禁止可选的尾部斜杠', '通过 PathParserOptions 公开'],
        ['start', 'true', '在 RegExp 开头加入 ^', 'internal；public Pick 明确排除'],
        ['end', 'true', '在 RegExp 末尾加入 $', 'public 仍可见，但已 deprecated'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`_PathParserOptions` 是 internal。应用不要导入它、扩展它或通过类型断言设置 `start`；需要前缀与层级匹配时，用嵌套路由、可选参数或明确的 catch-all record 表达。',
    },
    { type: 'heading', content: 'Matcher Location' },
    {
      type: 'text',
      content:
        '`MatcherLocation` 是 matcher 解析后的公开核心位置：它只描述 pathname 匹配结果，不负责 query、hash、history href 或重定向来源。`path` 是百分号编码后的 pathname，`params` 是从路径提取并解码的参数，`matched` 按父到子的顺序保存命中的 record 链。',
    },
    {
      type: 'table',
      headers: ['字段', '类型', '语义'],
      rows: [
        [
          'name',
          'RouteRecordNameGeneric | null | undefined',
          '最终命中 record 的名称；未命中时为空',
        ],
        ['path', 'string', '只含百分号编码后的 pathname，不等同于 fullPath'],
        ['params', 'RouteParamsGeneric', '由 pathname 解码得到，repeatable 参数是字符串数组'],
        ['meta', 'RouteMeta', '按 matched 链合并后的 meta'],
        ['matched', 'RouteRecord[]', '从父到子的 route record 链；不要直接修改'],
      ],
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const resolved = router.resolve({
  name: 'user',
  params: { id: '42' },
  query: { tab: 'activity' },
})

console.info({
  name: resolved.name,
  path: resolved.path,
  params: resolved.params,
  meta: resolved.meta,
  matched: resolved.matched,
  fullPath: resolved.fullPath,
})`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '应用通过 `router.resolve()` 得到 `RouteLocationResolved`，它保留上述 matcher 字段并补上 `fullPath`、`query`、`hash`、`href` 与 `redirectedFrom`。只有编写 Router 生态工具时，才需要把 `MatcherLocation` 作为较窄的类型契约单独讨论。',
    },
    { type: 'heading', content: 'Matcher Location As Path' },
    {
      type: 'text',
      content:
        '`MatcherLocationAsPath` 只有一个必填 `path: string`。它是 matcher 内部 raw-location 联合的一支：上层 Router 会先拆分 URL 与 query/hash，再把 pathname 交给 matcher，所以该 `path` 不是完整 URL，也没有公开导航选项。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`MatcherLocationAsPath` 在 5.2.0 固定类型中标记为 `@internal`。应用不要显式标注、封装或导出这个接口；传给 `router.resolve()`、`router.push()` 或 `router.replace()` 的公开类型应是字符串或 `RouteLocationRaw` 家族。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 应用层使用公开 Router API，由 Router 负责拆分 query/hash、编码和 href。
const target = router.resolve({
  path: '/users/42',
  query: { tab: 'activity' },
  hash: '#history',
})

console.info(target.fullPath, target.href)`,
    },
    { type: 'heading', content: 'Router Matcher' },
    {
      type: 'text',
      content:
        '`RouterMatcher` 是 `createRouter()` 内部持有的 route-record 索引与解析器集合。它既暴露 record matcher 对象，也接受一个 public Router 不会暴露的 parent matcher，因此固定声明把整个接口标记为 `@internal`。',
    },
    {
      type: 'table',
      headers: ['内部成员', '内部职责', '应用层公开替代'],
      rows: [
        [
          'addRoute(record, parent?)',
          '规范化并插入 record、alias 与 children',
          'router.addRoute()',
        ],
        [
          'removeRoute(matcher | name)',
          '递归移除 record matcher、alias 与 children',
          'router.removeRoute()',
        ],
        ['clearRoutes()', '清空有序 matcher 列表和名称索引', 'router.clearRoutes()'],
        ['getRoutes()', '返回 RouteRecordMatcher[]', 'router.getRoutes() 返回规范化 records'],
        ['getRecordMatcher(name)', '读取内部名称索引', 'router.hasRoute()'],
        [
          'resolve(location, current)',
          '按名称、路径或相对 params 生成 MatcherLocation',
          'router.resolve()',
        ],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`RouterMatcher` 是 internal。不要从 Router 对象探测 matcher、缓存 `RouteRecordMatcher`，也不要在测试中伪造这套结构；这些对象的排序分值、parent/alias 关系与移除语义都不是稳定应用契约。',
    },
    { type: 'heading', content: 'Path Parser Options' },
    {
      type: 'text',
      content:
        '`PathParserOptions` 是公开的 `Pick<_PathParserOptions, "end" | "sensitive" | "strict">`。它刻意排除 internal `start`，并由 Router 全局选项和单条 route record 共同复用。单条 record 的值会覆盖全局默认。',
    },
    {
      type: 'table',
      headers: ['选项', '默认值', '公开行为', '建议'],
      rows: [
        ['sensitive', 'false', '`/users` 默认也匹配 `/Users`', '仅在 URL 大小写确有契约时开启'],
        [
          'strict',
          'false',
          '`/users` 默认也匹配 `/users/`',
          '先统一 canonical URL，再决定全局或局部开启',
        ],
        [
          'end',
          'true',
          '决定是否必须匹配至 pathname 末尾',
          '5.2.0 已 deprecated，不新增 end: false 依赖',
        ],
      ],
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const router = createRouter({
  history: createWebHistory(),
  strict: true,
  routes: [
    {
      path: '/accounts/:id',
      sensitive: true,
      component: AccountView,
    },
  ],
})`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`strict` 和 `sensitive` 改变的是哪些 URL 能命中，不会自动重定向到规范地址。若产品只允许一种大小写或尾斜杠形式，还需由应用或服务器明确执行 canonical redirect。',
    },
    { type: 'heading', content: 'Create Router Matcher' },
    {
      type: 'text',
      content:
        '`createRouterMatcher(routes, globalOptions)` 用初始 `RouteRecordRaw[]` 与全局 `PathParserOptions` 创建 `RouterMatcher`。固定源码先合并默认 parser 选项，再逐条加入 routes；返回对象只供 Router 实现组织 record 与解析 location。',
    },
    {
      type: 'table',
      headers: ['参数或返回值', '类型', '内部契约'],
      rows: [
        [
          'routes',
          'Readonly<RouteRecordRaw[]>',
          '创建时规范化、展开 alias/children 并加入有序 matcher 列表',
        ],
        [
          'globalOptions',
          'PathParserOptions',
          '与 sensitive=false、strict=false、start=true、end=true 合并',
        ],
        ['返回值', 'RouterMatcher', '内部 record 索引、动态变更与 resolve 能力'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`createRouterMatcher` 在固定声明和官方 API 中都标记为 `Internal`。应用不要直接调用它，也不要把它当成无 history 的轻量 Router；这会绕过 URL 编解码、query/hash、导航守卫、history 与 Vue 插件集成。',
    },
    { type: 'heading', content: '应用层替代路径' },
    {
      type: 'table',
      headers: ['目标', '稳定入口', '原因'],
      rows: [
        [
          '创建路由器',
          'createRouter(options)',
          '统一 matcher、history、query、守卫与 Vue plugin 生命周期',
        ],
        [
          '解析目标位置',
          'router.resolve(to)',
          '返回含 href/fullPath/query/hash 的完整 resolved location',
        ],
        ['动态注册记录', 'router.addRoute()', '保留公开 parent-name 与注销回调契约'],
        ['动态移除记录', 'router.removeRoute()/clearRoutes()', '不暴露 RouteRecordMatcher 引用'],
        [
          '检查或列出记录',
          'router.hasRoute()/getRoutes()',
          '返回稳定名称判断或规范化 route records',
        ],
      ],
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const router = createRouter({ history: createWebHistory(), routes })

const removeReports = router.addRoute({
  path: '/reports',
  name: 'reports',
  component: ReportsView,
})

const target = router.resolve({ name: 'reports' })
console.info(target.href)

removeReports()`,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '在应用代码中直接创建并保存 internal matcher',
          description:
            '官方 API 与固定声明都把 `createRouterMatcher` 和 `RouterMatcher` 标记为 internal。直接组装只能得到路径匹配层，不包含 Router 的 URL、query/hash、history、守卫与 Vue 集成。',
          consequence:
            '应用形成第二套路由状态，升级时还会暴露于内部 record matcher 与解析分支变化。',
          wrong: {
            lang: 'ts',
            content: `import { createRouterMatcher } from 'vue-router'

const matcher = createRouterMatcher(routes, {})
export const currentMatch = matcher.resolve({ path: '/reports' }, startLocation)`,
          },
          correct: {
            lang: 'ts',
            content: `import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

export const currentMatch = router.resolve('/reports')`,
          },
        },
        {
          title: '借助 internal 类型断言设置 start',
          description:
            '`PathParserOptions` 的 public Pick 明确排除 `start`；`start` 只控制内部 RegExp 是否添加 `^`，不是稳定的 Router 或 record 配置。',
          consequence: '类型契约被绕过，路由可能出现难以预测的子串匹配，并绑定未承诺的内部行为。',
          wrong: {
            lang: 'ts',
            content: `const options = {
  history: createWebHistory(),
  routes,
  start: false,
} as RouterOptions & _PathParserOptions

const router = createRouter(options)`,
          },
          correct: {
            lang: 'ts',
            content: `const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/admin',
      component: AdminLayout,
      children: [{ path: 'reports', component: ReportsView }],
    },
  ],
})`,
          },
        },
        {
          title: '依赖 deprecated end: false 表达前缀路由',
          description:
            '5.2.0 已声明 `end` 将来始终为 true。把前缀层级编码成 `end: false` 会把应用结构建立在待移除行为上。',
          consequence: '升级后父路径不再吞并更长地址，原本隐式命中的页面会变成未匹配。',
          wrong: {
            lang: 'ts',
            content: `const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/admin', component: AdminLayout }],
  end: false,
})`,
          },
          correct: {
            lang: 'ts',
            content: `const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/admin',
      component: AdminLayout,
      children: [{ path: ':section?', component: AdminSection }],
    },
  ],
})`,
          },
        },
        {
          title: '把 MatcherLocation.path 当成包含 query/hash 的 fullPath',
          description:
            '`MatcherLocation.path` 只是百分号编码后的 pathname。query、hash、href 与 fullPath 由上层 Router 补充。',
          consequence: '缓存键、分享链接或回跳地址丢失筛选条件和页面锚点。',
          wrong: {
            lang: 'ts',
            content: `const target = router.resolve('/reports?range=week#chart')
sessionStorage.setItem('return-to', target.path)`,
          },
          correct: {
            lang: 'ts',
            content: `const target = router.resolve('/reports?range=week#chart')
sessionStorage.setItem('return-to', target.fullPath)`,
          },
        },
        {
          title: 'addRoute() 后期待当前页面自动重新匹配',
          description:
            '官方动态路由指南明确说明 `router.addRoute()` 只注册 record；即使新 record 能更精确地命中当前 URL，也不会自动触发一次新导航。',
          consequence: '地址栏不变但页面仍渲染旧 record，直到下一次导航才表现为“偶尔生效”。',
          wrong: {
            lang: 'ts',
            content: `router.addRoute({
  path: '/about',
  component: AboutView,
})

showRouteReady()`,
          },
          correct: {
            lang: 'ts',
            content: `router.addRoute({
  path: '/about',
  component: AboutView,
})

await router.replace(router.currentRoute.value.fullPath)
showRouteReady()`,
          },
        },
        {
          title: '给两个 route records 复用同一个名称',
          description:
            '官方命名路由与动态路由指南要求 route name 全局唯一；固定 matcher 在根级加入同名 record 前会先移除旧 record。',
          consequence: '旧 record 及其 children/aliases 被递归移除，原路径或导航入口突然失效。',
          wrong: {
            lang: 'ts',
            content: `router.addRoute({ path: '/reports', name: 'workspace', component: ReportsView })
router.addRoute({ path: '/tasks', name: 'workspace', component: TasksView })`,
          },
          correct: {
            lang: 'ts',
            content: `router.addRoute({ path: '/reports', name: 'reports', component: ReportsView })
router.addRoute({ path: '/tasks', name: 'tasks', component: TasksView })`,
          },
        },
        {
          title: '给 repeatable 参数传入单个字符串',
          description:
            '官方匹配语法规定 `*` 和 `+` 参数解析为数组，按名称解析时也应传数组；`+` 至少需要一个值。',
          consequence: '路径构造失败，或调用处对 params 的值域形成错误类型假设。',
          wrong: {
            lang: 'ts',
            content: `// route: { path: '/docs/:chapters+', name: 'docs' }
router.resolve({
  name: 'docs',
  params: { chapters: 'guide' },
})`,
          },
          correct: {
            lang: 'ts',
            content: `// route: { path: '/docs/:chapters+', name: 'docs' }
router.resolve({
  name: 'docs',
  params: { chapters: ['guide', 'routing'] },
})`,
          },
        },
        {
          title: '在字符串 path 中忘记为自定义正则双重转义',
          description:
            '官方匹配语法提醒：JavaScript 字符串会先消费反斜杠，因此传给 matcher 的 `\\d` 必须在源码中写成 `\\\\d`。',
          consequence: '数字约束退化成普通字符匹配，路由排序与实际命中结果偏离设计。',
          wrong: {
            lang: 'ts',
            content: `const routes = [
  { path: '/orders/:orderId(\\d+)', component: OrderView },
]`,
          },
          correct: {
            lang: 'ts',
            content: `const routes = [
  { path: '/orders/:orderId(\\\\d+)', component: OrderView },
]`,
          },
        },
        {
          title: '在路径中段组合贪婪通配与 repeatable 修饰符',
          description:
            '官方 Guide 明确警告 `.*` 与 `*`/`+` 组合后再跟静态片段会产生非常慢的正则；catch-all 最适合放在 URL 末尾。',
          consequence: '特定长路径触发严重回溯，导航解析延迟随输入显著放大。',
          wrong: {
            lang: 'ts',
            content: `const routes = [
  { path: '/:pathMatch(.*)*/settings', component: SettingsView },
]`,
          },
          correct: {
            lang: 'ts',
            content: `const routes = [
  { path: '/:pathMatch(.*)/settings', component: SettingsView },
  { path: '/:pathMatch(.*)*', component: NotFoundView },
]`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 公开 parser 选项是内部全集的刻意子集',
          content:
            '固定类型把 `PathParserOptions` 定义为 `_PathParserOptions` 的 Pick，只保留 `end`、`sensitive`、`strict`。`start` 即使在实现中存在，也没有进入应用配置契约；生态库不应通过 internal 类型把它重新暴露。',
        },
        {
          title: '2. 工厂先冻结全局默认，再让 record 局部覆盖',
          content:
            '`createRouterMatcher()` 先把 globalOptions 与 `sensitive=false`、`strict=false`、`start=true`、`end=true` 合并；`addRoute()` 再把单条 record 的选项覆盖到全局值上。适合把普遍策略放在 Router，把例外留在 record。',
        },
        {
          title: '3. addRoute 同时维护规范化、alias、children 与名称索引',
          content:
            '实现会规范化原始 record、展开 alias、拼接相对子路径、递归加入 children，并把命名的非 alias matcher 写入 Map。同名根 record 会先触发 removeRoute；动态模块应设计唯一名称并保存公开注销回调。',
        },
        {
          title: '4. 匹配顺序来自分值插入，而不是声明先后兜底',
          content:
            '每个路径先被 tokenizer 和 ranker 编译为 RegExp、keys 与 score，matcher 再按 score 插入有序数组。静态片段、自定义参数正则与通配参数有不同优先级；应用应写互斥、可解释的路径，不靠调换 routes 数组掩盖歧义。',
        },
        {
          title: '5. resolve 有名称、路径和相对 params 三条分支',
          content:
            '按名称解析会从名称 Map 取 matcher、筛选允许的 params 并 stringify；按 path 解析会查找首个 RegExp 命中并 parse；未给 name/path 时基于 currentLocation 合并 params。路由工具若只需应用结果，应调用 `router.resolve()` 复用上层编码与 location 规范化。',
        },
        {
          title: '6. MatcherLocation 由祖先链和合并 meta 收束',
          content:
            '解析完成后，源码从最终 matcher 沿 parent 向上回溯，把 records 头插为父到子顺序，再合并各 record 的 meta，最终返回 name/path/params/matched/meta。面包屑与权限聚合可读取公开 resolved route 的 matched/meta，但不要修改 record 链。',
        },
        {
          title: '7. Router facade 承担 matcher 之外的应用契约',
          content:
            '`createRouter()` 把 matcher 包在 URL 解析、params 编解码、query/hash、history、导航守卫和插件安装流程中，并把动态变更投影为公开方法。因此应用与大多数生态库依赖 Router，比直接依赖 matcher 更完整也更稳定。',
        },
      ],
    },
  ],
})
