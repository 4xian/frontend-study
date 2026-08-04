/**
 * 课程：路由懒加载
 * 查证日期：2026-08-04
 * 适用版本：Vue 3.5.40、Vue Router 5.2.0、Vite 8.1.5
 * 查证工具：Tavily、Vue/Vue Router/Vite 官方文档与 vuejs/router v5.2.0 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const guardsEntryId = 'vue.router.learn.intermediate.meta-navigation-guards'
const dataEntryId = 'vue.router.learn.intermediate.route-data-fetching'

export const meta = defineLessonMeta({
  id: 'vue.router.learn.intermediate.lazy-loading',
  type: 'lesson',
  title: '路由懒加载',
  summary: '用真实动态 import 观察路由加载、导航提交与解析结果复用',
  ecosystem: 'vue',
  module: 'router',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: [guardsEntryId, dataEntryId],
  related: [guardsEntryId, dataEntryId],
  tags: ['Vue Router', 'lazy loading', 'dynamic import', 'code splitting', 'Vite'],
  sources: [
    {
      title: 'Vue Router：Lazy Loading Routes',
      url: 'https://router.vuejs.org/guide/advanced/lazy-loading',
    },
    {
      title: 'Vue Router：Full Navigation Resolution Flow',
      url: 'https://router.vuejs.org/guide/advanced/navigation-guards#the-full-navigation-resolution-flow',
    },
    {
      title: 'Vue Router API：loadRouteLocation',
      url: 'https://router.vuejs.org/api/functions/loadroutelocation',
    },
    {
      title: 'Vue：defineAsyncComponent',
      url: 'https://vuejs.org/api/general.html#defineasynccomponent',
    },
    {
      title: 'Vite：Dynamic Import',
      url: 'https://vite.dev/guide/features.html#dynamic-import',
    },
    {
      title: 'Vue Router 5.2.0 navigationGuards.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40、Vue Router 5.2.0、Vite 8.1.5',
  verifiedAt: '2026-08-04',
  estimatedMinutes: 65,
})

export default defineLesson({
  meta,
  objectives: [
    '把路由组件改为返回动态 import Promise 的函数',
    '区分 loader 调用、import 解析与导航提交三个时刻',
    '说明路由懒加载与 defineAsyncComponent 的责任边界',
    '解释首次成功解析后的 route record component 复用',
    '把 Router 运行时解析与 Vite 生产分块策略分开',
  ],
  blocks: [
    { type: 'heading', content: '让 import 发生在首次进入路由时' },
    {
      type: 'text',
      content:
        '路由懒加载的公开契约是把 route record 的 component 写成返回 Promise 的函数。外层函数保留了调用时机；Router 只在进入该 record 时调用 loader，并等到组件解析后才继续确认导航。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const routes = [
  {
    path: '/reports',
    component: () => import('./ReportsRoute.vue'),
  },
]`,
    },
    {
      type: 'table',
      headers: ['时刻', '可观察事实', '尚未发生'],
      rows: [
        ['loader call', 'Router 已进入组件解析阶段', '动态 import 未必执行'],
        ['import resolved', '已获得 route component', '导航未必已提交'],
        ['navigation commit', 'currentRoute 与 RouterView 已切换', '不能推断网络缓存'],
      ],
    },
    { type: 'heading', content: '路由组件不要再包 defineAsyncComponent' },
    {
      type: 'text',
      content:
        '`() => import()` 的所有者是 Router：它在导航确认前解析页面并提取 component guard。`defineAsyncComponent()` 的所有者是 Vue renderer：它在组件真正渲染时加载，适合页面内部的昂贵子组件。两者解决的不是同一层问题。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// route record：交给 Router 在导航中解析
component: () => import('./ReportsRoute.vue')

// ReportsRoute 内部：只在需要渲染图表时加载
const LazyChart = defineAsyncComponent(() => import('./ReportChart.vue'))`,
    },
    { type: 'heading', content: '观察首次等待与再次进入复用' },
    {
      type: 'text',
      content:
        '下面的 mini-app 用独立 memory router 运行。手动 gate 只把“Router 已调用 loader，动态 import 尚未执行”稳定展示出来；放行后执行真实字面量 import。离开再进入时，loader、import 和 resolved 计数都应保持为 1。',
    },
    {
      type: 'demo',
      id: 'vue.router.learn.intermediate.lazy-loading.lazy-loading-lab-demo',
      description: '用受控 gate 观察真实动态 import 与 Router 解析结果复用',
      playground: true,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '在建立 routes 时就调用 import',
          description: '`component` 需要保存 loader 函数，不是已经开始的 Promise。',
          consequence: '尚未导航就开始加载，且 route record 形状错误。',
          wrong: { lang: 'ts', content: `component: import('./ReportsRoute.vue')` },
          correct: { lang: 'ts', content: `component: () => import('./ReportsRoute.vue')` },
        },
        {
          title: '用 Promise.resolve 伪装 code splitting',
          description: '静态 import 已把 component 带入当前模块图。',
          consequence: 'Router 会等 Promise，但不存在真实动态 split point。',
          wrong: {
            lang: 'ts',
            content: `import Page from './Page.vue'
component: () => Promise.resolve(Page)`,
          },
          correct: { lang: 'ts', content: `component: () => import('./Page.vue')` },
        },
        {
          title: '为 route component 包 defineAsyncComponent',
          description: '该 API 属于 Vue 渲染层，不是 Router 的懒路由契约。',
          consequence: '底层页面 guard 离开正常的 route lazy extraction 时序。',
          wrong: {
            lang: 'ts',
            content: `component: defineAsyncComponent(() => import('./Page.vue'))`,
          },
          correct: { lang: 'ts', content: `component: () => import('./Page.vue')` },
        },
        {
          title: '预期每次进入都重新调用 loader',
          description: '5.2.0 在成功后把解析组件写回 record。',
          consequence: '再次进入时等待第二个 gate，测试永远不会结束。',
          wrong: { lang: 'ts', content: `expect(loader).toHaveBeenCalledTimes(2)` },
          correct: { lang: 'ts', content: `expect(loader).toHaveBeenCalledTimes(1)` },
        },
        {
          title: '把 Router 复用等同于 HTTP 缓存',
          description: '这里只能证明 record 上的解析结果被复用。',
          consequence: '用不稳定的 network 次数推翻正确 Router 行为。',
          wrong: { lang: 'ts', content: `// loader 一次 = CDN 必然命中缓存` },
          correct: { lang: 'ts', content: `// 只断言 loader call 与 currentRoute` },
        },
        {
          title: '把 importing 当成导航已提交',
          description: 'Router 会在确认导航前等待 route component。',
          consequence: '界面显示目标页，currentRoute 却仍是旧页。',
          wrong: { lang: 'ts', content: `loaderStarted.value && showAsCommitted()` },
          correct: { lang: 'ts', content: `await router.push('/report')` },
        },
        {
          title: '忽略 lazy component 的 beforeRouteEnter 提取',
          description: 'Router 必须先拿到 component options 才能继续 guard 队列。',
          consequence: '把懒加载误讲成 RouterView 渲染阶段的工作。',
          wrong: { lang: 'ts', content: `// RouterView 渲染后才解析页面 guard` },
          correct: { lang: 'ts', content: `// 进入 guard extraction 时解析 component` },
        },
        {
          title: '把 loadRouteLocation 当成导航',
          description: '它只确保 resolved route 的懒组件已加载。',
          consequence: '没有 history、currentRoute 或 guard 变化，却声称已进入页面。',
          wrong: { lang: 'ts', content: `await loadRouteLocation(router.resolve('/report'))` },
          correct: { lang: 'ts', content: `await router.push('/report')` },
        },
        {
          title: '直接复制旧 manualChunks 对象配置',
          description: '当前 Router 指南片段与本仓 Vite 8.1.5 的分块 API 已漂移。',
          consequence: '无法生效的构建配置被误当作 Router API。',
          wrong: {
            lang: 'ts',
            content: `build: { rollupOptions: { output: { manualChunks: {} } } }`,
          },
          correct: { lang: 'ts', content: `// 单独按 Vite 8 codeSplitting 文档评估` },
        },
      ],
    },
    { type: 'heading', content: '从源码推导适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. loader 位于进入组件 guard extraction',
          content:
            '`router.ts` 先运行 leave、beforeEach、update 和 beforeEnter，再为 entering records 提取 beforeRouteEnter。lazy loader 在这里调用，所以前置 guard 取消时可以根本不加载页面。',
        },
        {
          title: '2. 解析组件后才能读取组件守卫',
          content:
            '`navigationGuards.ts` 等待 loader Promise，解出 ESM default，再读取 component guard。因此路由懒加载必须参与导航确认，而不是普通渲染占位。',
        },
        {
          title: '3. 成功复用来自 record component 写回',
          content:
            '成功分支把原始 module 写入 `record.mods[name]`，把解析 component 写入 `record.components[name]`。再次进入会直接读 component，所以 loader call count 是稳定的最小证据。',
        },
        {
          title: '4. reject 不会写入成功复用',
          content:
            '写回只发生在 Promise fulfill 分支。加载失败时目标导航不提交，后续导航可以重试；但失败重试不与首次成功复用 Demo 混成两套 seam。',
        },
        {
          title: '5. loadRouteLocation 只是显式预加载',
          content:
            '它遍历 matched records，使用同类解析与写回逻辑，但不运行导航守卫、不改 history 也不提交 currentRoute。可以在用户意图明确时预加载，不能替代 push。',
        },
        {
          title: '6. functional component 需要 displayName 消除歧义',
          content:
            'functional component 和 lazy loader 都可能是函数。官方契约用 `displayName` 标识 functional route component，避免它被当作 loader 调用。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '判断报表页的懒加载边界',
      instructions:
        '报表页自身较大，页内又有一个只在展开后显示的图表。写出两层加载方式，并说明谁控制时机。',
      answer:
        "route record 用 `component: () => import('./ReportsRoute.vue')`，由 Router 在首次进入时解析；ReportsRoute 内部的图表可用 `defineAsyncComponent(() => import('./Chart.vue'))`，由 Vue 在它真正被渲染时加载。",
    },
    {
      type: 'checklist',
      items: [
        { label: 'route component 保留返回 import Promise 的外层函数' },
        { label: '分别观察 loader、import resolved 与 navigation commit' },
        { label: '不为 route component 再包 defineAsyncComponent' },
        { label: '用 loader call count 证明成功解析后的 Router 复用' },
        { label: '不把 Router 复用扩写为 HTTP 或 CDN 缓存承诺' },
        { label: '构建分块配置单独按当前 Vite 版本核对' },
      ],
    },
  ],
  exercises: ['首次进入报表页后离开再进入，解释为什么 loader 计数仍为 1。'],
  recap: [
    '路由懒加载依赖函数包裹的真实动态 import。',
    'Router 在导航确认前解析 route component 并提取 component guard。',
    '首次成功解析后，5.2.0 复用 record 上的解析组件。',
    'defineAsyncComponent 属于 Vue 渲染层，不用来包 route component。',
    'Vite 分块策略与 Router 运行时解析是不同责任层。',
  ],
})
