/**
 * 知识点：Router 实例与 _RouterClassic
 * 适用版本：Vue Router 5.2.0
 * 查证来源（2026-08-04）：
 * - https://router.vuejs.org/api/type-aliases/router
 * - https://router.vuejs.org/api/interfaces/routerclassic
 * - https://router.vuejs.org/guide/essentials/navigation
 * - https://router.vuejs.org/guide/advanced/navigation-failures
 * - https://router.vuejs.org/guide/advanced/navigation-guards
 * - https://router.vuejs.org/guide/advanced/dynamic-routing
 * - https://router.vuejs.org/guide/migration
 * - https://github.com/vuejs/router/issues/1382
 * - https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/router.ts
 * - https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/experimental/router.ts
 * - https://github.com/vuejs/router/tree/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/experimental/data-loaders
 * 查证工具：Tavily、Vue Router 官方 API/Guide、官方 issue、固定提交源码与本地 5.2.0 类型/运行时代码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.configuration.router-instance',
  type: 'reference',
  title: 'Router 实例',
  summary:
    '查询 Router 与 _RouterClassic 的 19 个公开成员，并区分导航、matcher、history、守卫及内部安装边界',
  ecosystem: 'vue',
  module: 'router',
  collection: 'configuration',
  related: [
    'vue.router.reference.configuration.create-router',
    'vue.router.reference.configuration.history',
    'vue.router.learn.basics.composition-programmatic-navigation',
    'vue.router.learn.advanced.navigation-failures',
    'vue.router.learn.advanced.dynamic-routing-router-link',
  ],
  tags: [
    'Vue Router',
    'Router',
    '_RouterClassic',
    'currentRoute',
    'navigation guards',
    'dynamic routing',
  ],
  sources: [
    {
      title: 'Vue Router API：Router',
      url: 'https://router.vuejs.org/api/type-aliases/router',
    },
    {
      title: 'Vue Router API：_RouterClassic',
      url: 'https://router.vuejs.org/api/interfaces/routerclassic',
    },
    {
      title: 'Vue Router Guide：Programmatic Navigation',
      url: 'https://router.vuejs.org/guide/essentials/navigation',
    },
    {
      title: 'Vue Router Guide：Navigation Failures',
      url: 'https://router.vuejs.org/guide/advanced/navigation-failures',
    },
    {
      title: 'Vue Router Guide：Navigation Guards',
      url: 'https://router.vuejs.org/guide/advanced/navigation-guards',
    },
    {
      title: 'Vue Router Guide：Dynamic Routing',
      url: 'https://router.vuejs.org/guide/advanced/dynamic-routing',
    },
    {
      title: 'Vue Router Guide：Migration',
      url: 'https://router.vuejs.org/guide/migration',
    },
    {
      title: 'Vue Router 官方 issue #1382：初始 currentRoute 误解',
      url: 'https://github.com/vuejs/router/issues/1382',
    },
    {
      title: 'Vue Router 5.2.0 router.ts 固定提交源码',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/router.ts',
    },
    {
      title: 'Vue Router 5.2.0 experimental/router.ts 固定提交源码',
      url: 'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/experimental/router.ts',
    },
    {
      title: 'Vue Router 5.2.0 Data Loaders 固定提交源码',
      url: 'https://github.com/vuejs/router/tree/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/experimental/data-loaders',
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  anchors: [
    'Router',
    'Router Classic',
    'current route',
    'listening',
    'options',
    'add route',
    'after each',
    'back',
    'before each',
    'before resolve',
    'clear routes',
    'forward',
    'get routes',
    'go',
    'has route',
    'is ready',
    'on error',
    'push',
    'remove route',
    'replace',
    'resolve',
    'install',
    '内部集成边界',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `type Router = TypesConfig extends Record<'Router', infer T> ? T : _RouterClassic

interface _RouterClassic extends EXPERIMENTAL_Router_Base<RouteRecordNormalized> {
  /** 创建 Router 时传入的原始选项。 */
  readonly options: RouterOptions
  /** 在指定父记录下添加动态路由，并返回移除回调。 */
  addRoute(parentName: NonNullable<RouteRecordNameGeneric>, route: RouteRecordRaw): () => void
  /** 添加顶层动态路由，并返回移除回调。 */
  addRoute(route: RouteRecordRaw): () => void
  /** 按名称移除路由记录。 */
  removeRoute(name: NonNullable<RouteRecordNameGeneric>): void
  /** 清空 matcher 中的全部路由记录。 */
  clearRoutes(): void
}

interface EXPERIMENTAL_Router_Base<TRecord> {
  /** 当前已规范化并完成异步组件解析的路由。 */
  readonly currentRoute: ShallowRef<RouteLocationNormalizedLoaded>
  /** 是否处理 history 发出的导航事件。 */
  listening: boolean
  /** 判断指定名称的路由记录是否存在。 */
  hasRoute(name: NonNullable<RouteRecordNameGeneric>): boolean
  /** 返回当前 matcher 中的标准化路由记录。 */
  getRoutes(): TRecord[]
  /** 相对指定当前位置解析类型化路由地址。 */
  resolve<Name extends keyof RouteMap = keyof RouteMap>(
    to: RouteLocationAsRelativeTyped<RouteMap, Name>,
    currentLocation?: RouteLocationNormalizedLoaded,
  ): RouteLocationResolved<Name>
  /** 解析字符串、相对地址或 path 地址。 */
  resolve(
    to: RouteLocationAsString | RouteLocationAsRelative | RouteLocationAsPath,
    currentLocation?: RouteLocationNormalizedLoaded,
  ): RouteLocationResolved
  /** 新增 history 条目并导航。 */
  push(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>
  /** 替换当前 history 条目并导航。 */
  replace(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>
  /** 请求后退一个 history 条目。 */
  back(): void
  /** 请求前进一个 history 条目。 */
  forward(): void
  /** 请求按相对步数移动 history。 */
  go(delta: number): void
  /** 注册全局前置守卫，并返回注销函数。 */
  beforeEach(guard: NavigationGuardWithThis<undefined>): () => void
  /** 注册解析前守卫，并返回注销函数。 */
  beforeResolve(guard: _NavigationGuardResolved): () => void
  /** 注册导航结算后的钩子，并返回注销函数。 */
  afterEach(guard: NavigationHookAfter): () => void
  /** 注册未捕获导航错误处理器，并返回注销函数。 */
  onError(handler: _ErrorListener): () => void
  /** 等待初始导航完成。 */
  isReady(): Promise<void>
  /** 仅供 Vue 插件协议自动调用；应用代码不得手动调用。 */
  install(app: App): void
}`,
  blocks: [
    { type: 'heading', content: 'Router' },
    {
      type: 'text',
      content:
        '`Router` 是公开的条件类型，不是需要自行实现的 class。默认 `TypesConfig` 没有覆盖 `Router` 槽位时，它解析为 `_RouterClassic`；只有路由器扩展作者通过模块增强替换该槽位时，应用看到的 Router 类型才会改变。普通应用应从 `createRouter()`、`useRouter()` 或显式参数取得实例。',
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '本页按默认 `_RouterClassic` 展开 19 个公开成员。`install` 是另计的 internal 插件方法，7 个 symbol 属性也是 internal；它们都不属于这 19 个应用层成员。',
    },
    { type: 'heading', content: 'Router Classic' },
    {
      type: 'text',
      content:
        '根入口把源码中的 `RouterClassic` 以 `_RouterClassic` 名称导出。它自身声明 `options`、`addRoute()`、`removeRoute()`、`clearRoutes()`，并从 Router base 继承其余 15 个公开属性与方法。下划线只是导出名的一部分；固定 5.2.0 声明没有把 `_RouterClassic` 标成 internal，但应用通常仍以 `Router` 作为参数类型，以保留 `TypesConfig` 的替换能力。',
    },
    {
      type: 'table',
      headers: ['职责', '公开成员', '返回或生命周期边界'],
      rows: [
        [
          '状态与配置',
          'currentRoute、listening、options',
          '响应式状态、低层监听开关、只读选项引用',
        ],
        [
          'matcher',
          'addRoute、removeRoute、clearRoutes、hasRoute、getRoutes',
          '修改或查询记录；不会自动提交一次新导航',
        ],
        ['地址与导航', 'resolve、push、replace', 'resolve 只计算；push/replace 返回导航 Promise'],
        ['history', 'back、forward、go', '返回 void，只请求 history 移动'],
        [
          '导航生命周期',
          'beforeEach、beforeResolve、afterEach、onError、isReady',
          '注册函数均可注销；isReady 只关注初始导航',
        ],
      ],
    },
    { type: 'heading', content: 'current route' },
    {
      type: 'text',
      content:
        '`currentRoute: ShallowRef<RouteLocationNormalizedLoaded>` 是只读属性，`.value` 才是当前已规范化、且懒加载组件已解析的 route。创建实例时它先指向 `START_LOCATION`；成功导航在最终提交阶段才替换 `.value`。组件 `setup` 中通常优先用 `useRoute()`，组件外持有 router 实例时才直接读取或侦听 `currentRoute`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `app.use(router)

// 只有启动逻辑确实依赖首个已解析 route 时才阻塞挂载
await router.isReady()
console.info(router.currentRoute.value.fullPath)
app.mount('#app')`,
    },
    { type: 'heading', content: 'listening' },
    {
      type: 'text',
      content:
        '`listening: boolean` 默认是 `true`。设为 `false` 时，5.2.0 的 history listener 会忽略随后收到的浏览器前进/后退事件；这是给微前端协调 history 所有权的低层开关。它不会卸载 Router、清空路由、取消当前导航，也不会禁止代码继续调用 `push()` 或 `replace()`；重新启用也不会自动补放错过的 history 事件。',
    },
    { type: 'heading', content: 'options' },
    {
      type: 'text',
      content:
        '`readonly options: RouterOptions` 指向传给 `createRouter()` 的原始配置，适合诊断 history、scrollBehavior 或 link class 选项。`readonly` 只限制属性重新赋值，不承诺深度冻结；运行时 matcher 和已安装 listener 已从选项完成初始化，因此不要通过修改 `router.options` 期待重新配置实例。',
    },
    { type: 'heading', content: 'add route' },
    {
      type: 'text',
      content:
        '`addRoute(route)` 添加顶层记录；`addRoute(parentName, route)` 把记录放到已命名父记录下。两个 overload 都返回 `() => void` disposer，适合插件或功能模块按自己的生命周期移除本次注册。它只改变 matcher；如果新记录应接管当前 URL，需要在守卫外 `await router.replace(router.currentRoute.value.fullPath)`，守卫内则返回目标位置触发重定向。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const featureRouteName = Symbol('feature-reports')
const removeFeatureRoute = router.addRoute({
  name: featureRouteName,
  path: '/reports',
  component: () => import('./ReportsPage.vue'),
})

if (router.currentRoute.value.path === '/reports') {
  await router.replace(router.currentRoute.value.fullPath)
}

// 功能模块卸载时，只清理自己登记的记录
removeFeatureRoute()`,
    },
    { type: 'heading', content: 'after each' },
    {
      type: 'text',
      content:
        '`afterEach(guard): () => void` 在每次导航结算后调用 guard，第三个参数会携带 Navigation Failure。它适合分析、标题同步和无障碍播报，返回值不会改变已经结算的导航；保存返回的函数即可注销。需要阻止或重定向导航时应使用 `beforeEach()` 或 `beforeResolve()`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const stopAnalytics = router.afterEach((to, from, failure) => {
  if (!failure) analytics.pageView(to.fullPath, from.fullPath)
})

// 分析模块卸载时停止接收后续导航
stopAnalytics()`,
    },
    { type: 'heading', content: 'back' },
    {
      type: 'text',
      content:
        '`back(): void` 等价于 `go(-1)`，请求 history 后退一个条目；没有可后退条目时不会产生新的 route。它不返回导航 Promise，最终是否发生导航应通过 `afterEach()` 或 `currentRoute` 的响应式变化观察。',
    },
    { type: 'heading', content: 'before each' },
    {
      type: 'text',
      content:
        '`beforeEach(guard): () => void` 按注册顺序执行全局前置守卫。guard 可以同步或异步返回 `undefined/true` 放行、`false` 取消、RouteLocation 重定向，或抛出 Error；应优先 return，而不是使用仍兼容但已 deprecated 的第三个 `next` 参数。返回的注销函数适合测试、插件或按功能启停的规则。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const stopAuthGuard = router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return

  const signedIn = await authSession.isSignedIn()
  return signedIn ? undefined : { name: 'login', query: { redirect: to.fullPath } }
})

// 权限模块销毁时注销全局守卫
stopAuthGuard()`,
    },
    { type: 'heading', content: 'before resolve' },
    {
      type: 'text',
      content:
        '`beforeResolve(guard): () => void` 位于导航确认前，但此时异步 route component 已取得，之前的组件内守卫和全局 `beforeEach` 也已成功。它适合只在目标页面确实可进入时申请相机权限或加载最后一段必要数据；返回值与注销方式和 `beforeEach()` 相同。',
    },
    { type: 'heading', content: 'clear routes' },
    {
      type: 'text',
      content:
        '`clearRoutes(): void` 清空当前 matcher 的所有 route records。它不会自动重置 `currentRoute`、history 或已渲染组件，也没有返回可恢复快照；因此只适合将 matcher 完全重建的明确生命周期，不应把它当作普通登出或权限刷新捷径。',
    },
    { type: 'heading', content: 'forward' },
    {
      type: 'text',
      content:
        '`forward(): void` 等价于 `go(1)`，请求 history 前进一个条目。和浏览器前进按钮一样，没有可前进条目时不会导航；它也不提供可 await 的完成结果。',
    },
    { type: 'heading', content: 'get routes' },
    {
      type: 'text',
      content:
        '`getRoutes(): RouteRecordNormalized[]` 从 matcher 读取当前全部标准化记录并返回一个新数组。它适合生成诊断信息或读取公开的 `name/path/meta`，但不是响应式订阅，也不应依赖 score、regexp 等未公开实现字段；动态增删后需要重新调用才能得到新清单。',
    },
    { type: 'heading', content: 'go' },
    {
      type: 'text',
      content:
        '`go(delta: number): void` 把整数 delta 交给配置的 `RouterHistory.go()`：负数后退、正数前进、0 交由 history 实现处理。该方法只发出移动请求；目标记录仍会经过 Router 导航管线，但调用点拿不到 Promise 或 Navigation Failure。',
    },
    { type: 'heading', content: 'has route' },
    {
      type: 'text',
      content:
        '`hasRoute(name): boolean` 按 `string | symbol` route name 查询 matcher。它不接受 path，也不证明某个 URL 当前能否成功解析；匿名记录无法通过它查询。动态功能应共享同一个稳定 name，并用该方法让守卫内注册条件收敛。',
    },
    { type: 'heading', content: 'is ready' },
    {
      type: 'text',
      content:
        '`isReady(): Promise<void>` 等待首次导航成功完成，包括异步进入守卫和目标异步组件；初始导航已完成时立即兑现，初始导航发生未捕获错误时拒绝。浏览器端 `app.use(router)` 会启动首个 URL 导航；服务端使用 memory history 时必须先 `push()` 请求 URL，再等待 ready。它不是等待每一次后续导航的 API。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 服务端每个请求都创建独立 router
await router.push(requestUrl)
await router.isReady()

const html = await renderApplication(router)`,
    },
    { type: 'heading', content: 'on error' },
    {
      type: 'text',
      content:
        '`onError(handler): () => void` 接收导航守卫抛出或返回的 Error，以及解析目标异步组件时出现的未捕获错误；handler 参数是 `error/to/from`。常规 aborted、cancelled、duplicated Navigation Failure 是 `push()`/`replace()` 的 fulfilled 结果或 `afterEach` 第三参，不应等同为 `onError`。保存返回值可注销处理器。',
    },
    { type: 'heading', content: 'push' },
    {
      type: 'text',
      content:
        '`push(to): Promise<NavigationFailure | void | undefined>` 解析 RouteLocationRaw、执行完整守卫管线，并在成功时新增 history entry。成功（也包括守卫重定向最终成功）通常兑现 `undefined`；aborted、cancelled、duplicated 会兑现 Navigation Failure；未被 Router 归类的真实错误才会触发 `onError` 并让 Promise 拒绝。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { NavigationFailureType, isNavigationFailure } from 'vue-router'

const failure = await router.push({ name: 'editor', params: { id: '42' } })

if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  showUnsavedChangesNotice()
} else if (!failure) {
  closeNavigationMenu()
}`,
    },
    { type: 'heading', content: 'remove route' },
    {
      type: 'text',
      content:
        '`removeRoute(name): void` 按名称移除记录；移除 parent 时，其 children 和 aliases 也会一起从 matcher 删除。记录不存在时生产版本不执行操作，开发版本给出诊断。和 `addRoute()` 一样，它不会主动重新匹配当前 URL；有明确所有权时优先执行 `addRoute()` 返回的 disposer。',
    },
    { type: 'heading', content: 'replace' },
    {
      type: 'text',
      content:
        '`replace(to)` 与 `push(to)` 使用相同解析、守卫和 Promise 结果，只在最终提交时替换当前 history entry。它适合登录回跳、规范化 URL 或当前地址重新匹配；需要让用户能返回当前页面时仍应使用 `push()`。也可向 `push()` 的对象地址传入 `replace: true` 获得相同行为。',
    },
    { type: 'heading', content: 'resolve' },
    {
      type: 'text',
      content:
        '`resolve(to, currentLocation?)` 把 raw location 规范化为带 `href`、`matched`、`params`、`query` 的 `RouteLocationResolved`。默认相对当前 `currentRoute.value` 解析；覆盖 currentLocation 只适合预览其他上下文的相对链接。它不会执行守卫、写 history 或修改 `currentRoute`，适合生成 href、预检匹配和构建原生链接。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const target = router.resolve({
  name: 'user',
  params: { id: '42' },
  query: { tab: 'activity' },
})

console.info(target.href, target.matched.map((record) => record.name))

// 真正切换页面仍需显式导航
await router.push(target.fullPath)`,
    },
    { type: 'heading', content: 'install' },
    {
      type: 'text',
      content:
        '`install(app: App): void` 在 5.2.0 类型和源码中明确标记为 `@internal`。它只由 Vue 的插件协议在 `app.use(router)` 时自动调用，应用代码不得手动调用。安装过程登记 RouterLink/RouterView、设置 `$router`/`$route`、提供组合式 API 所需 injection，并在浏览器端触发初始导航；绕过 `app.use()` 会破坏 Vue 的插件去重与应用生命周期约定。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router) // Vue 自动调用 internal install(app)
app.mount('#app')`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`install` 虽然可在对象上观察到，但不是稳定的应用层调用面；不要提取、包装或手动调用它。多 app 场景也应让每个 app 各自执行 `app.use(router)`。',
    },
    { type: 'heading', content: '内部集成边界' },
    {
      type: 'text',
      content:
        'TypeDoc 还会把继承自 Data Loader extensions 的 7 个 symbol 属性展示在 `_RouterClassic` 上。固定 5.2.0 声明逐项标记 `@internal`；它们服务于 experimental Data Loaders 与 SSR 协调，不属于稳定 Router 用法，不计入 19 个公开成员，也不应由应用读取、写入或做存在性探测。',
    },
    {
      type: 'table',
      headers: ['internal symbol', '内部职责', '稳定 Reference 边界'],
      rows: [
        ['APP_KEY', '保存 Data Loaders 使用的 Vue App', '排除；应用通过 app.use(router) 安装'],
        [
          'DATA_LOADERS_EFFECT_SCOPE_KEY',
          '保存 Data Loaders effect scope',
          '排除；不接管内部响应式生命周期',
        ],
        ['INITIAL_DATA_KEY', '保存客户端消费的初始数据', '排除；不用作应用 SSR 状态协议'],
        ['IS_SSR_KEY', '标记 Router 是否处于 SSR', '排除；SSR 模式由应用创建流程决定'],
        ['LOADER_ENTRIES_KEY', '保存 loader entry WeakMap', '排除；不读取或修改 loader 内部表'],
        [
          'PENDING_LOCATION_KEY',
          '保存 loaders 等待的 pending location',
          '排除；不作为导航状态入口',
        ],
        ['SERVER_INITIAL_DATA_KEY', '保存服务端生成的初始数据', '排除；不与应用序列化协议耦合'],
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '直接从 currentRoute 读取字段，或在初始导航前把占位 route 当结果',
          description:
            '`currentRoute` 是 ShallowRef，真实 route 在 `.value` 中；创建后的初值还是 `START_LOCATION`，首个异步导航完成后才提交。官方迁移指南与 issue #1382 都反映了这类误解。',
          consequence: '读取到 undefined 或启动占位地址，权限、布局和服务端输出据此作出错误决定。',
          wrong: {
            lang: 'ts',
            content: `app.use(router)
console.info(router.currentRoute.fullPath)`,
          },
          correct: {
            lang: 'ts',
            content: `app.use(router)
await router.isReady()
console.info(router.currentRoute.value.fullPath)`,
          },
        },
        {
          title: '只用 catch() 判断 push 或 replace 被守卫阻止',
          description:
            '5.2.0 会把 aborted、cancelled、duplicated 作为 fulfilled Navigation Failure 返回；只有未归类的导航错误才走 rejection。',
          consequence: '守卫已阻止页面切换，业务仍关闭菜单、清空表单或显示“已到达”提示。',
          wrong: {
            lang: 'ts',
            content: `await router.push('/checkout').catch(showNavigationFailure)
clearCartDraft()`,
          },
          correct: {
            lang: 'ts',
            content: `const failure = await router.push('/checkout')

if (!failure) clearCartDraft()`,
          },
        },
        {
          title: 'addRoute 后期待当前 URL 自动重新匹配',
          description:
            '官方动态路由指南明确说明 addRoute 只登记 matcher 记录，不触发新导航。当前 route 与 RouterView 会保留原来的匹配结果。',
          consequence: 'hasRoute 已返回 true，但页面继续显示旧 fallback，形成配置与界面不一致。',
          wrong: {
            lang: 'ts',
            content: `router.addRoute(aboutRoute)
// 错误假设：当前 /about 已显示新组件`,
          },
          correct: {
            lang: 'ts',
            content: `router.addRoute(aboutRoute)
await router.replace(router.currentRoute.value.fullPath)`,
          },
        },
        {
          title: '跨模块复用同一个 route name，误以为会保留两条记录',
          description:
            'route name 在整个 Router 内唯一；添加同名记录会先移除旧记录。固定 matcher 源码还会连带处理旧记录的 children 与 aliases。',
          consequence: '后加载模块静默替换先加载模块的页面，旧菜单仍存在却解析到完全不同的组件。',
          wrong: {
            lang: 'ts',
            content: `router.addRoute({ name: 'settings', path: '/billing', component: Billing })
router.addRoute({ name: 'settings', path: '/profile', component: Profile })`,
          },
          correct: {
            lang: 'ts',
            content: `const billingRouteName = Symbol('billing-settings')
const profileRouteName = Symbol('profile-settings')

router.addRoute({ name: billingRouteName, path: '/billing', component: Billing })
router.addRoute({ name: profileRouteName, path: '/profile', component: Profile })`,
          },
        },
        {
          title: '从 afterEach 返回 false，期待阻止已经结算的导航',
          description:
            '`afterEach` 面向结果观察，返回值被忽略；只有前置守卫能在提交前取消或重定向。其 failure 参数用于记录失败，不是再执行一次裁决。',
          consequence: '受保护页面已经显示，返回 false 没有任何效果，审计代码却误报导航被拦截。',
          wrong: {
            lang: 'ts',
            content: `router.afterEach((to) => {
  if (!canAccess(to)) return false
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.beforeEach((to) => {
  if (!canAccess(to)) return { name: 'forbidden' }
})`,
          },
        },
        {
          title: 'await go、back 或 forward，并假定下一行已经到达目标',
          description:
            '三个 history traversal 方法都返回 void；`await` 只会立即包裹 undefined，不会等待随后由 history event 启动的导航。',
          consequence: '下一行仍读取旧 currentRoute，埋点、焦点或业务请求与实际页面错位。',
          wrong: {
            lang: 'ts',
            content: `await router.back()
restoreFocus(router.currentRoute.value)`,
          },
          correct: {
            lang: 'ts',
            content: `router.afterEach((to, from, failure) => {
  if (!failure) restoreFocus(to, from)
})

router.back()`,
          },
        },
        {
          title: '调用 resolve 后假定守卫已运行且页面已经切换',
          description:
            '`resolve` 是同步地址计算，只返回规范化 route 与 href；它不运行守卫、不写 history，也不提交 currentRoute。',
          consequence:
            '代码宣布导航成功，实际 URL 和 RouterView 都停留在原页面，权限守卫也从未执行。',
          wrong: {
            lang: 'ts',
            content: `router.resolve({ name: 'reports' })
showReportsReady()`,
          },
          correct: {
            lang: 'ts',
            content: `const target = router.resolve({ name: 'reports' })
const failure = await router.push(target.fullPath)

if (!failure) showReportsReady()`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. Router 条件类型保留替换能力',
          content:
            '固定声明让 Router 从 TypesConfig 的 Router 槽位推导，否则回退到 _RouterClassic。应用库的公开参数优先写 Router；只有确认依赖 classic matcher 动态增删能力时，才把约束收窄到 _RouterClassic。',
        },
        {
          title: '2. currentRoute 只在最终提交点切换',
          content:
            'router.ts 在守卫与取消检查完成后才写 currentRoute.value，并由 markAsReady 结算首次 ready。启动渲染、SSR 和需要真实 matched records 的一次性初始化适合等待 isReady；每次导航则直接等待 push/replace。',
        },
        {
          title: '3. matcher 清单与当前 route 是两个状态面',
          content:
            'add/remove/clear/has/get 直接委托 matcher，而 currentRoute 由导航 finalize 更新。插件加载适合先批量登记记录，再显式导航一次；权限变化也要分别管理 matcher、菜单与当前页面。',
        },
        {
          title: '4. push 与 replace 共享同一导航管线',
          content:
            'replace 只是给 push 管线加入 replace 标记，二者都会 resolve、执行 guards 并把可分类的 Navigation Failure 作为 fulfilled 结果。表单清理、菜单关闭等后续动作应检查兑现值，真实异常则交给 try/catch 与 onError。',
        },
        {
          title: '5. listening 只切断 history event 消费',
          content:
            'history listener 的入口首先读取 router.listening，false 时直接返回；push/replace 并不经过这个判断。它适合微前端明确交接浏览器 history 事件所有权，不是暂停 Router 全部工作的通用开关。',
        },
        {
          title: '6. 守卫与错误监听器都是可释放注册',
          content:
            'beforeEach、beforeResolve、afterEach 和 onError 都复用 callback registry 的 add/remove 契约。长期 app 可永久注册核心规则；测试、插件和临时功能应保存 disposer，避免重复注册造成多次执行。',
        },
        {
          title: '7. install 属于 Vue 插件生命周期',
          content:
            'install 会登记组件和注入、启动浏览器首航，并包装 app.unmount 维护共享 router 的清理计数。应用只调用 app.use(router)，让 Vue 负责插件去重和 app 参数传递，不把 internal 方法变成自己的安装协议。',
        },
        {
          title: '8. 七个 symbol 属于 experimental Data Loaders',
          content:
            'DataLoaderExtensions 把内部 app、pending location、effect scope 与 SSR initial data 放到 router symbol 属性上。固定类型逐项标记 internal；稳定业务应使用公开 Router 状态和自己的 SSR 数据协议，并把这些 symbol 留给 RA6 观察。',
        },
      ],
    },
  ],
})
