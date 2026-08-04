/**
 * Vue Router 参考：Injection Keys 的 internal 边界、测试替身与 RouterView 集成 seam
 * 查证日期：2026-08-04
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 API/Guide、官方 issue/discussion、本地 5.2.0 声明与运行时代码、固定 commit 源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

const fixedSourceBase =
  'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.composables.injection-keys',
  type: 'reference',
  title: 'Injection Keys',
  summary:
    '查阅五个 internal injection key 的精确类型、Router 与 RouterView 协作链路，以及测试替身和高级集成的版本边界',
  ecosystem: 'vue',
  module: 'router',
  collection: 'composables',
  related: [
    'vue.router.reference.components.router-link',
    'vue.router.reference.components.router-view',
    'vue.router.reference.composables.navigation',
    'vue.router.reference.matching.route-locations',
    'vue.router.reference.matching.route-records',
  ],
  tags: [
    'Vue Router',
    'InjectionKey',
    'matchedRouteKey',
    'routeLocationKey',
    'routerKey',
    'routerViewLocationKey',
    'viewDepthKey',
    'internal',
    'testing',
    'RouterView',
  ],
  sources: [
    {
      title: 'Vue Router API：matchedRouteKey',
      url: 'https://router.vuejs.org/api/variables/matchedroutekey',
    },
    {
      title: 'Vue Router API：routeLocationKey',
      url: 'https://router.vuejs.org/api/variables/routelocationkey',
    },
    {
      title: 'Vue Router API：routerKey',
      url: 'https://router.vuejs.org/api/variables/routerkey',
    },
    {
      title: 'Vue Router API：routerViewLocationKey',
      url: 'https://router.vuejs.org/api/variables/routerviewlocationkey',
    },
    {
      title: 'Vue Router API：viewDepthKey',
      url: 'https://router.vuejs.org/api/variables/viewdepthkey',
    },
    {
      title: 'Vue Router Guide：Composition API',
      url: 'https://router.vuejs.org/guide/advanced/composition-api.html',
    },
    {
      title: 'Vue Router Guide：Nested Routes',
      url: 'https://router.vuejs.org/guide/essentials/nested-routes.html',
    },
    {
      title: 'Vue Router Guide：RouterView slot',
      url: 'https://router.vuejs.org/guide/advanced/router-view-slot.html',
    },
    {
      title: 'Vue Router issue #1408：当前 RouterView 对应 record 的公开需求仍需 RFC',
      url: 'https://github.com/vuejs/router/issues/1408',
    },
    {
      title: 'Vue Router discussion #1827：底层 matcher 与 matched record 的使用边界',
      url: 'https://github.com/vuejs/router/discussions/1827',
    },
    {
      title: 'Vue Router 5.2.0：Injection Keys 固定源码',
      url: `${fixedSourceBase}/injectionSymbols.ts`,
    },
    {
      title: 'Vue Router 5.2.0：根入口固定源码',
      url: `${fixedSourceBase}/index.ts`,
    },
    {
      title: 'Vue Router 5.2.0：useRoute/useRouter 固定源码',
      url: `${fixedSourceBase}/useApi.ts`,
    },
    {
      title: 'Vue Router 5.2.0：RouterView 固定源码',
      url: `${fixedSourceBase}/RouterView.ts`,
    },
    {
      title: 'Vue Router 5.2.0：Router 安装固定源码',
      url: `${fixedSourceBase}/router.ts`,
    },
    {
      title: 'Vue Router 5.2.0：组件内守卫固定源码',
      url: `${fixedSourceBase}/navigationGuards.ts`,
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  anchors: [
    '概述',
    'Internal 边界与公开替代',
    'Matched Route Key',
    'Route Location Key',
    'Router Key',
    'Router View Location Key',
    'View Depth Key',
    '测试与高级集成速查',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `/** @internal */
declare const matchedRouteKey: InjectionKey<
  ComputedRef<RouteRecordNormalized | undefined>
>

/** @internal */
declare const routeLocationKey: InjectionKey<RouteLocationNormalizedLoaded>

/** @internal */
declare const routerKey: InjectionKey<Router>

/** @internal */
declare const routerViewLocationKey: InjectionKey<
  Ref<RouteLocationNormalizedLoaded>
>

/** @internal */
declare const viewDepthKey: InjectionKey<Ref<number> | number>`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '这五个 Symbol 连接 Vue Router 插件、组合式 API、RouterLink、RouterView 与组件内守卫。它们虽然由 `vue-router` 根入口导出并出现在 API Reference，5.2.0 固定源码却逐项标记 `@internal`；可导入不等于适合普通应用依赖，也不形成跨版本兼容承诺。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '本页不是应用层依赖注入教程。只在阅读源码、理解测试替身或评估 RouterView 兼容适配器时查看这些 key；业务组件和常规测试优先使用公开 composable、RouterView、组件内守卫与真实 memory router。',
    },
    {
      type: 'table',
      headers: ['Key', '5.2.0 精确值类型', '内部消费者', '公开替代'],
      rows: [
        [
          'matchedRouteKey',
          'ComputedRef<RouteRecordNormalized | undefined>',
          'onBeforeRouteUpdate / onBeforeRouteLeave',
          '公开组件内守卫；一般读取用 useRoute().matched/meta',
        ],
        [
          'routeLocationKey',
          'RouteLocationNormalizedLoaded',
          'useRoute / useLink',
          'useRoute()；测试安装真实 memory router',
        ],
        ['routerKey', 'Router', 'useRouter / useLink / RouterLink', 'useRouter()；app.use(router)'],
        [
          'routerViewLocationKey',
          'Ref<RouteLocationNormalizedLoaded>',
          'RouterView',
          'RouterView 的 route prop；普通场景直接嵌套 RouterView',
        ],
        [
          'viewDepthKey',
          'Ref<number> | number',
          'RouterView',
          '嵌套路由与嵌套 RouterView；读取 records 用 useRoute().matched',
        ],
      ],
    },
    { type: 'heading', content: 'Internal 边界与公开替代' },
    {
      type: 'text',
      content:
        '官方变量页描述了这些 key 当前承担的能力，但稳定性标签以固定源码为准。五项全部是 internal；测试 seam 也只是让 Router 自身或专用测试工具替换上下文，不是让业务层把 provide/inject 变成第二套路由架构。',
    },
    {
      type: 'table',
      headers: ['需求', '优先使用', '只有何时才研究 internal seam'],
      rows: [
        ['组件内读取当前路由', 'useRoute()', '验证专用 Router 测试替身怎样接入'],
        ['组件内导航或解析地址', 'useRouter()', '验证专用 Router 测试替身怎样接入'],
        [
          '渲染当前或指定 route',
          'RouterView / RouterView 的 route prop',
          '实现与 RouterView 协作的基础设施适配器',
        ],
        [
          '注册组件内 update/leave guard',
          'onBeforeRouteUpdate / onBeforeRouteLeave',
          '实现兼容 RouterView 的 outlet 并维持 record 生命周期',
        ],
        ['表达嵌套页面层级', 'routes.children + 嵌套 RouterView', '诊断 outlet 的 depth 传播'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '官方 issue #1408 说明“当前 RouterView 对应 record”确有生态需求，但该公开能力仍标记为 needs RFC。issue 中的 `inject(matchedRouteKey)` 是提案背景里的 workaround，不是稳定推荐；discussion #1827 的片段同样只作使用风险证据。',
    },
    { type: 'heading', content: 'Matched Route Key' },
    {
      type: 'tip',
      style: 'warning',
      content:
        '【internal】`matchedRouteKey` 不是普通应用 API。公开替代是 `onBeforeRouteUpdate()`、`onBeforeRouteLeave()`；若只需路由记录或合并 meta，使用 `useRoute().matched`、`useRoute().meta`。',
    },
    {
      type: 'text',
      content:
        '`matchedRouteKey` 的值是 `ComputedRef<RouteRecordNormalized | undefined>`，表示最近祖先 RouterView 当前实际渲染的 record。它不是 `route.matched` 的最后一项，也不保证存在：RouterView 之外、空出口或当前 depth 没有组件时都可能得到 undefined。',
    },
    {
      type: 'text',
      content:
        'RouterView 计算 `matched[depth]` 后提供这条引用；两个公开组件内守卫再读取它，把 guard 注册到该 record 的 `updateGuards` 或 `leaveGuards`。因此它承载的是“视图实例属于哪个 record”的生命周期关系，而不是给业务组件查询面包屑的快捷键。',
    },
    {
      type: 'table',
      headers: ['场景', '稳定入口', '边界'],
      rows: [
        [
          '离开当前 route component 前确认',
          'onBeforeRouteLeave()',
          '由 Router 自动关联当前 record',
        ],
        ['同一 record 参数变化前处理', 'onBeforeRouteUpdate()', '由 Router 自动维护激活/卸载注册'],
        ['读取整条匹配链', 'useRoute().matched', '从父到子；不等同于当前 outlet record'],
        ['读取合并后的页面 meta', 'useRoute().meta', '父到子浅合并，常可避免寻找当前 record'],
      ],
    },
    { type: 'heading', content: 'Route Location Key' },
    {
      type: 'tip',
      style: 'warning',
      content:
        '【internal】`routeLocationKey` 只解释 `useRoute()` 与测试覆盖 seam。业务代码应调用 `useRoute()`；验证真实导航、matched 与守卫时，应安装 `createMemoryHistory()` 创建的 Router。',
    },
    {
      type: 'text',
      content:
        '`routeLocationKey` 的值不是 Ref，而是 `RouteLocationNormalizedLoaded` 形状的浅响应式代理。Router 安装时为初始 route 的每个字段建立 getter，使 `useRoute()` 返回的对象身份保持稳定，而字段始终投影 `currentRoute.value`。',
    },
    {
      type: 'text',
      content:
        '官方描述提到测试可覆盖该 key，但单独拼一个 route 对象只适合严格限定的展示单元测试。若被测代码读取 matched/meta、依赖 redirect、异步组件或导航守卫，替身很容易漏掉真实 normalized-loaded 契约，此时用 memory router 建立反馈环更可靠。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/reports/:id', name: 'report', component: ReportPage }],
})

await router.push({ name: 'report', params: { id: 42 } })
await router.isReady()

const wrapper = mount(ReportSummary, {
  global: { plugins: [router] },
})`,
    },
    { type: 'heading', content: 'Router Key' },
    {
      type: 'tip',
      style: 'warning',
      content:
        '【internal】`routerKey` 不是业务 service locator。组件内使用 `useRouter()`，应用启动用 `app.use(router)`；组件外服务通过参数接收 Router 或由组装层调用，不要自行 inject。',
    },
    {
      type: 'text',
      content:
        '`routerKey` 的值是完整 `Router`。Router 插件安装会提供它，`useRouter()` 直接读取；`useLink()` 与 RouterLink 也依赖它来 resolve 和导航。只覆盖这个 key 并不能自动满足当前 route、active-link、history 或导航结算等协作条件。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 组件内：使用公开 composable。
const router = useRouter()
await router.push({ name: 'reports' })

/** 让组件外导航服务显式接收 Router，避免隐藏注入上下文。 */
export async function openReports(router: Router): Promise<void> {
  await router.push({ name: 'reports' })
}`,
    },
    { type: 'heading', content: 'Router View Location Key' },
    {
      type: 'tip',
      style: 'warning',
      content:
        '【internal】`routerViewLocationKey` 只属于 RouterView 显示上下文。公开替代是 `RouterView` 及其 `route` prop；普通应用不要通过 provide 改写某棵子树的 route。',
    },
    {
      type: 'text',
      content:
        '`routerViewLocationKey` 的值是 `Ref<RouteLocationNormalizedLoaded>`。Router 安装时先提供 `currentRoute`；每个 RouterView 再选择 `props.route || injectedRoute.value`，把结果包装成 computed 并继续提供给后代 RouterView，因此指定 route 能沿嵌套 outlet 传播。',
    },
    {
      type: 'text',
      content:
        '它与 `routeLocationKey` 有意分离：`<RouterView :route="previewRoute">` 可以显示另一个已加载 route，但同一子树中的 `useRoute()` 仍读取 Router 的当前导航 route。这个差异适合预览、离屏渲染等高级集成，不能用来伪造第二个导航状态。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const previewRoute = shallowRef(
  await loadRouteLocation(router.resolve({ name: 'report-preview', params: { id: 42 } })),
)`,
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<RouterView :route="previewRoute" />`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '`router.resolve()` 本身不加载 lazy components。向 RouterView 的 route prop 提供独立解析结果时，先用公开的 `loadRouteLocation()` 得到 `RouteLocationNormalizedLoaded`；当 matched 中的 records 全部是 redirect 时，该函数会拒绝加载。',
    },
    { type: 'heading', content: 'View Depth Key' },
    {
      type: 'tip',
      style: 'warning',
      content:
        '【internal】`viewDepthKey` 不是 breadcrumb 层级或 URL 段数。公开替代是 `routes.children` 与嵌套 `RouterView`；读取完整记录链使用 `useRoute().matched`。',
    },
    {
      type: 'text',
      content:
        '`viewDepthKey` 接受 number 或 `Ref<number>`。根 RouterView 默认从 0 开始，计算实际 record 后向后代提供 `depth + 1`。如果某条匹配 record 没有 components，RouterView 会继续向后扫描，因此实际 view depth 与 URL 段数、DOM 深度或 matched 下标的静态猜测都不可靠。',
    },
    {
      type: 'text',
      content:
        '高级 outlet 若要与 RouterView 兼容，必须同时维持 route 上下文、动态 depth、componentless record 跳过、matched record 以及实例/guard 生命周期；只覆写一个数字不能构成兼容实现。普通应用通过嵌套 RouterView 让官方实现管理这条链。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [{ path: 'reports', component: ReportsPage }],
  },
]`,
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<template>
  <AdminNavigation />
  <RouterView />
</template>`,
    },
    { type: 'heading', content: '测试与高级集成速查' },
    {
      type: 'table',
      headers: ['要验证的行为', '建议反馈环', '不要声称'],
      rows: [
        ['只读取少量 route 字段', '窄组件替身或显式 props', '替身等同真实 Router'],
        [
          'useRoute/useRouter 与导航结果',
          'createMemoryHistory + app/plugin 安装',
          '只提供一个 key 已覆盖导航',
        ],
        [
          'RouterLink active 与点击导航',
          '真实 memory router + 挂载 RouterLink',
          '只伪造 router.push 足够',
        ],
        [
          '组件内 update/leave guards',
          '真实 routes + RouterView + 完整导航',
          '直接调用 guard 等同 record 生命周期',
        ],
        [
          'RouterView route prop 与 lazy component',
          'router.resolve + loadRouteLocation + RouterView',
          'resolved route 已经 loaded',
        ],
        [
          '自定义 outlet 与 RouterView 协作',
          '固定 5.2.0、隔离适配器、嵌套集成测试',
          'internal key 具备跨版本稳定性',
        ],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '若基础设施确实必须接触 internal seam，应把所有依赖收口在一个适配器，固定 Vue Router 版本，并以真实嵌套路由、route prop、lazy component 与组件内守卫形成集成测试。升级前重新核对声明与源码，不能只依赖类型仍可导入。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把根入口可导出误当成稳定业务 API',
          description:
            '五个 key 虽由 5.2.0 根入口导出，固定 `injectionSymbols.ts` 仍逐项标记 `@internal`。导出解决 Router 自身与工具协作，不等于普通应用兼容承诺。',
          consequence:
            '业务模块锁定内部值类型与 provide 链，升级时可能在没有公共迁移路径的情况下失效。',
          wrong: {
            lang: 'ts',
            content: `import { routerKey } from 'vue-router'

app.provide(routerKey, router)`,
          },
          correct: {
            lang: 'ts',
            content: `const app = createApp(App)

app.use(router)
app.mount('#app')`,
          },
        },
        {
          title: '业务 composable 直接 inject Router 或 route',
          description:
            '`useRouter()` 与 `useRoute()` 已是公开读取入口；直接 inject 会把业务代码绑定到 internal key，并隐藏 setup 上下文前置。',
          consequence: '调用边界难以测试和复用，错误上下文还可能在运行时得到 undefined。',
          wrong: {
            lang: 'ts',
            content: `/** 错误示例：直接读取 internal injection keys。 */
export function useReportNavigation() {
  const router = inject(routerKey)
  const route = inject(routeLocationKey)
  return { router, route }
}`,
          },
          correct: {
            lang: 'ts',
            content: `/** 通过公开组合式 API 读取 Router 与当前 route。 */
export function useReportNavigation() {
  const router = useRouter()
  const route = useRoute()
  return { router, route }
}`,
          },
        },
        {
          title: '只伪造 routerKey 就测试 RouterLink 或 useLink',
          description:
            '固定 `RouterLink.ts` 显示 `useLink()` 同时读取 router 与当前 route；active 状态还依赖 matched records 和 params。',
          consequence:
            '点击可能能调用 push，但 active/exact-active、href 与当前位置比较得到伪结果。',
          wrong: {
            lang: 'ts',
            content: `mount(ReportLink, {
  global: {
    provide: { [routerKey as symbol]: { push: vi.fn() } },
  },
})`,
          },
          correct: {
            lang: 'ts',
            content: `const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

await router.push('/reports')
await router.isReady()
mount(ReportLink, { global: { plugins: [router] } })`,
          },
        },
        {
          title: '用不完整对象冒充 RouteLocationNormalizedLoaded',
          description:
            '`routeLocationKey` 需要完整 loaded route 形状，而不是只有 path/params 的普通对象。真实消费者还会读取 query、matched、meta、href 相关输入或 record 状态。',
          consequence:
            '简单断言偶然通过，遇到 RouterLink、守卫或 route component 就暴露缺字段错误。',
          wrong: {
            lang: 'ts',
            content: `const fakeRoute = {
  path: '/reports/42',
  params: { id: '42' },
} as RouteLocationNormalizedLoaded`,
          },
          correct: {
            lang: 'ts',
            content: `const router = createRouter({ history: createMemoryHistory(), routes })

await router.push({ name: 'report', params: { id: 42 } })
await router.isReady()
const route = router.currentRoute.value`,
          },
        },
        {
          title: '把 routeLocationKey 与 routerViewLocationKey 当成同一个上下文',
          description:
            '前者是 useRoute 读取的 loaded route 对象，后者是 RouterView 读取并向嵌套出口传播的 route Ref；两者值类型和消费者均不同。',
          consequence:
            'useRoute、RouterView 或后代 outlet 得到错误形状，响应式更新也不再遵循 Router 的安装链路。',
          wrong: {
            lang: 'ts',
            content: `provide(routeLocationKey, previewRoute)
provide(routerViewLocationKey, previewRoute.value)`,
          },
          correct: {
            lang: 'vue',
            content: `<RouterView :route="previewRoute" />`,
          },
        },
        {
          title: '期待 RouterView 的 route prop 改变 useRoute()',
          description:
            'RouterView 使用独立的显示上下文；`useRoute()` 仍读取插件安装时提供的当前导航 route。route prop 不会提交导航，也不会替换全局 currentRoute。',
          consequence:
            '同一子树的模板显示 preview route，但业务 composable 读取当前 URL route，形成来源不一致。',
          wrong: {
            lang: 'vue',
            content: `<RouterView :route="previewRoute" />

<!-- 错误假设：子组件 useRoute() 现在会返回 previewRoute。 -->`,
          },
          correct: {
            lang: 'vue',
            content: `<RouterView v-slot="{ Component, route }" :route="previewRoute">
  <component :is="Component" :preview-route="route" />
</RouterView>`,
          },
        },
        {
          title: '把 matchedRouteKey 当成 route.matched 的叶子记录',
          description:
            '该 key 表示最近祖先 RouterView 当前 depth 对应的 record；嵌套 outlet 各自不同，没有可渲染 record 时还可能是 undefined。',
          consequence: '父布局错误读取 child meta，或在 RouterView 上下文之外解引用 undefined。',
          wrong: {
            lang: 'ts',
            content: `const record = inject(matchedRouteKey)!.value!
const pageTitle = computed(() => record.meta.title)`,
          },
          correct: {
            lang: 'ts',
            content: `const route = useRoute()
const pageTitle = computed(() => route.meta.title)`,
          },
        },
        {
          title: '用 URL 段数或固定下标控制 RouterView depth',
          description:
            '固定 RouterView 会跳过没有 components 的 matched record，并响应祖先提供的 depth；URL 段数不描述实际 outlet 拓扑。',
          consequence: 'componentless parent、alias 或布局调整后，出口渲染错误层级或空白。',
          wrong: {
            lang: 'ts',
            content: `const depth = route.path.split('/').filter(Boolean).length - 1
provide(viewDepthKey, depth)`,
          },
          correct: {
            lang: 'vue',
            content: `<template>
  <PageLayout>
    <RouterView />
  </PageLayout>
</template>`,
          },
        },
        {
          title: '把 injection-key 单元替身当成完整导航验证',
          description:
            '注入替身不会自动运行 redirect、history、异步组件加载、active-link 比较或 record guard 生命周期。',
          consequence: '测试绿色只证明若干方法被调用，无法证明用户实际导航与页面渲染正确。',
          wrong: {
            lang: 'ts',
            content: `const push = vi.fn()
mount(ReportPage, { global: { provide: { [routerKey as symbol]: { push } } } })

expect(push).not.toHaveBeenCalled()`,
          },
          correct: {
            lang: 'ts',
            content: `const router = createRouter({ history: createMemoryHistory(), routes })

await router.push('/reports/42')
await router.isReady()
const wrapper = mount(App, { global: { plugins: [router] } })

expect(wrapper.get('[data-page="report"]').exists()).toBe(true)`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 五个 Symbol 都从 internal 声明开始',
          content:
            '固定 `injectionSymbols.ts` 为五项逐一写出 `@internal` 与 `InjectionKey` 值类型；固定 `index.ts` 又从根入口导出它们。页面因此同时记录“可导出”和“非稳定应用 API”，不以导出状态覆盖源码标签。',
        },
        {
          title: '2. Router 安装建立三个根上下文',
          content:
            '固定 `router.ts` 的 install 先提供 `routerKey -> router`，再以浅响应式 getter 对象提供 `routeLocationKey`，同时把 `currentRoute` Ref 提供给 `routerViewLocationKey`。同一导航状态以不同值形状服务 composable 与 RouterView。',
        },
        {
          title: '3. 公开 composable 隐藏 key 细节',
          content:
            '固定 `useApi.ts` 中 `useRouter()` 和 `useRoute()` 分别读取前两个 key；应用停在 composable 层即可获得 Router 和稳定身份的响应式 route，不必复制内部 Symbol、值类型或安装顺序。',
        },
        {
          title: '4. RouterLink 证明测试替身不是单 key 问题',
          content:
            '固定 `RouterLink.ts` 的 `useLink()` 同时读取 router 与 current route，随后结合 `router.resolve()`、matched records 和 params 计算 href/active。需要验证链接行为时安装真实 memory router，比零散提供 internal key 更接近公开契约。',
        },
        {
          title: '5. RouterView 分离显示 route 与全局 route',
          content:
            '固定 `RouterView.ts` 从 `routerViewLocationKey` 取父级显示 route，再用公开 route prop 覆盖，最后把 computed route 继续提供给后代。`routeLocationKey` 没有被覆盖，因此 route prop 只控制 outlet 显示链，不改变 useRoute 或导航状态。',
        },
        {
          title: '6. Depth 是动态 outlet 状态',
          content:
            'RouterView 从 `viewDepthKey` 默认值 0 开始，遇到没有 components 的 matched record 会继续前进，再向后代提供计算后的 `depth + 1`。普通嵌套路由应让 RouterView 管理它；兼容 outlet 必须覆盖这条动态规则而不是硬编码下标。',
        },
        {
          title: '7. Matched record 把组件守卫绑到视图生命周期',
          content:
            'RouterView 提供当前 `matchedRouteRef`；固定 `navigationGuards.ts` 的公开 update/leave composable 读取它，把 guard 加入 record 集合，并在卸载、停用与激活时维护注册。业务代码直接 inject 会绕过公开语义并暴露 undefined 与生命周期细节。',
        },
        {
          title: '8. 高级集成必须隔离并固定版本',
          content:
            'issue #1408 仍把公开当前-view record 视为需 RFC 的增强，discussion #1827 只提供生态需求背景。确需 RouterView 兼容 seam 的基础设施应固定 5.2.0、收口适配器并跑真实嵌套集成测试；普通应用继续使用公开替代。',
        },
      ],
    },
  ],
})
