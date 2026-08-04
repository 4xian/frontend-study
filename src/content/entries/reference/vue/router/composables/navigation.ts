/**
 * Vue Router 参考：导航组合式 API 与低层 route component loading
 * 查证日期：2026-08-04
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 API/Guide、官方 issue/discussion、本地 5.2.0 类型与运行时代码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

const fixedSourceBase =
  'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.composables.navigation',
  type: 'reference',
  title: '导航组合式 API',
  summary:
    '查阅 useRoute()、useRouter() 与 loadRouteLocation() 的签名、setup 注入边界、响应性和导航职责',
  ecosystem: 'vue',
  module: 'router',
  collection: 'composables',
  related: [
    'vue.router.reference.configuration.router-instance',
    'vue.router.reference.matching.route-locations',
    'vue.router.learn.basics.composition-programmatic-navigation',
  ],
  tags: [
    'Vue Router',
    'loadRouteLocation',
    'useRoute',
    'useRouter',
    'Composition API',
    'programmatic navigation',
    'route reactivity',
  ],
  sources: [
    {
      title: 'Vue Router API：loadRouteLocation()',
      url: 'https://router.vuejs.org/api/functions/loadroutelocation',
    },
    {
      title: 'Vue Router API：useRoute()',
      url: 'https://router.vuejs.org/api/functions/useroute',
    },
    {
      title: 'Vue Router API：useRouter()',
      url: 'https://router.vuejs.org/api/functions/userouter',
    },
    {
      title: 'Vue Router Guide：Composition API',
      url: 'https://router.vuejs.org/guide/advanced/composition-api.html',
    },
    {
      title: 'Vue Router Guide：Programmatic Navigation',
      url: 'https://router.vuejs.org/guide/essentials/navigation.html',
    },
    {
      title: 'Vue Router issue #1048：加载已解析 route 的异步组件',
      url: 'https://github.com/vuejs/router/issues/1048',
    },
    {
      title: 'Vue Router discussion #2228：组合式 API 的 injection 排障',
      url: 'https://github.com/vuejs/router/discussions/2228',
    },
    {
      title: 'Vue Router 5.2.0：useApi.ts 固定源码',
      url: `${fixedSourceBase}/useApi.ts`,
    },
    {
      title: 'Vue Router 5.2.0：navigationGuards.ts 固定源码',
      url: `${fixedSourceBase}/navigationGuards.ts`,
    },
    {
      title: 'Vue Router 5.2.0：router.ts 固定源码',
      url: `${fixedSourceBase}/router.ts`,
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  anchors: [
    '概述',
    '三者职责',
    'Load Route Location',
    'Use Route',
    'Use Router',
    '响应性与精确 Watch',
    '编程式导航',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `declare function loadRouteLocation(
  route: RouteLocation | RouteLocationNormalized,
): Promise<RouteLocationNormalizedLoaded>

declare function useRoute<Name extends keyof RouteMap = keyof RouteMap>(
  _name?: Name,
): RouteLocationNormalizedLoaded<
  Name | RouteMap[Name]['childrenNames']
>

declare function useRouter(): Router`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '这三个公开函数处在不同层次。`useRoute()` 从当前 Vue 注入上下文读取响应式的已加载 route；`useRouter()` 从同一上下文取得 Router 实例以解析或发起导航；`loadRouteLocation()` 不读取上下文，也不是名字以 `use` 开头的组合式函数，而是把一个已经解析的 route 中尚未加载的异步 route components 加载完成。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`loadRouteLocation()` 是面向自定义 `<RouterView :route>`、模态路由等高级集成的低层异步 helper。普通页面要读取当前地址用 `useRoute()`，要改变地址用 `useRouter()` 取得的 `router.push()` 或 `router.replace()`；不要把三个入口按名字混为一类。',
    },
    { type: 'heading', content: '三者职责' },
    {
      type: 'table',
      headers: ['入口', '输入/上下文', '结果', '会发起导航吗'],
      rows: [
        [
          'loadRouteLocation(route)',
          '已解析的 RouteLocation 或 RouteLocationNormalized',
          '异步组件已加载的 RouteLocationNormalizedLoaded',
          '不会',
        ],
        [
          'useRoute(_name?)',
          '当前 Vue injection context',
          '响应式当前 RouteLocationNormalizedLoaded',
          '不会',
        ],
        [
          'useRouter()',
          '当前 Vue injection context',
          '应用安装的 Router 实例',
          '函数本身不会；调用实例方法才会',
        ],
      ],
    },
    { type: 'heading', content: 'Load Route Location' },
    {
      type: 'code',
      lang: 'ts',
      content: `declare function loadRouteLocation(
  route: RouteLocation | RouteLocationNormalized,
): Promise<RouteLocationNormalizedLoaded>`,
    },
    {
      type: 'text',
      content:
        '`loadRouteLocation()` 接受 matcher 已经解析出的 route，而不是用户侧的 `RouteLocationRaw`。它遍历 `route.matched` 中每条 record 的命名 components，调用仍是 lazy loader 的函数，等待所有模块完成，把 ES module 的 default component 写回 record，并保留已解析模块供其他插件使用，最后以同一个 route 对象作为 loaded 结果。',
    },
    {
      type: 'table',
      headers: ['阶段', '典型类型', 'loadRouteLocation() 的处理'],
      rows: [
        ['用户导航输入', 'RouteLocationRaw', '不接受；先用 router.resolve()'],
        [
          'matcher 已解析地址',
          'RouteLocation / RouteLocationNormalized',
          '加载 matched records 中的 lazy components',
        ],
        ['可交给 RouterView 的地址', 'RouteLocationNormalizedLoaded', 'Promise 成功值'],
      ],
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { loadRouteLocation, useRouter } from 'vue-router'

const router = useRouter()

/** 为自定义 RouterView 的 route prop 解析并加载目标地址。 */
async function prepareDialogRoute() {
  const resolved = router.resolve({
    name: 'user-dialog',
    params: { id: '42' },
  })

  return loadRouteLocation(resolved)
}`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '此 helper 不执行导航守卫、不写 history、不更新 `router.currentRoute`，也不处理重定向导航。固定源码会拒绝没有 matched record 的地址，以及 matched records 全部为 redirect 的纯重定向地址；需要遵循 redirect 和 guards 时应使用 Router 导航方法。',
    },
    { type: 'heading', content: 'Use Route' },
    {
      type: 'code',
      lang: 'ts',
      content: `declare function useRoute<Name extends keyof RouteMap = keyof RouteMap>(
  _name?: Name,
): RouteLocationNormalizedLoaded<
  Name | RouteMap[Name]['childrenNames']
>`,
    },
    {
      type: 'text',
      content:
        '`useRoute()` 返回当前已完成导航的 `RouteLocationNormalizedLoaded`，等价于模板中的 `$route`。它返回的是一个响应式对象，不是 ref，因此脚本中读取 `route.params`、`route.query` 或 `route.fullPath` 时不写 `.value`。Router 成功提交导航后，顶层 getter 会读取新的 `currentRoute.value`。',
    },
    {
      type: 'text',
      content:
        '可选的 `_name` 参与 typed routes 的静态返回类型：返回联合还包含该 route 的 `childrenNames`。固定运行时实现忽略这个参数，所以 `useRoute("user")` 不会解析、切换或筛选当前地址，也不会在运行时验证当前 `route.name`；需要分支时仍显式检查 `route.name`。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <p>当前用户：{{ userId }}</p>
</template>`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '`useRoute()` 和 `useRouter()` 都只是对 `inject()` 的薄封装。常规用法是在组件 `setup()` / `<script setup>` 顶层，或由 setup 同步调用的 composable 中取得一次并保存。纯模块、任意定时器或没有当前 app injection context 的 service 不应临时调用它们；这类代码应显式接收 router 或 route。',
    },
    { type: 'heading', content: 'Use Router' },
    {
      type: 'code',
      lang: 'ts',
      content: `declare function useRouter(): Router`,
    },
    {
      type: 'text',
      content:
        '`useRouter()` 返回由当前 Vue 应用通过 `app.use(router)` 提供的 Router 实例，等价于模板中的 `$router`。默认 `TypesConfig` 下公开 `Router` 类型解析为 `_RouterClassic`；应用代码应保留公开别名，不依赖带下划线的实现接口。',
    },
    {
      type: 'text',
      content:
        '取得实例本身不会导航。读取可用 `router.currentRoute` 或 `router.resolve()`，改变当前地址则使用 `push()`、`replace()`、`go()`、`back()` 或 `forward()`。组件 setup 中读取当前 route 通常优先 `useRoute()`；组件外已经持有 Router 实例时，才直接读取 `router.currentRoute.value`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

/** 保留现有查询参数并打开搜索结果页。 */
async function openSearch(term: string) {
  await router.push({
    name: 'search',
    query: { ...route.query, q: term },
  })
}`,
    },
    { type: 'heading', content: '响应性与精确 Watch' },
    {
      type: 'text',
      content:
        '官方 Composition API Guide 明确说明 route 是响应式对象，但多数场景应避免侦听整个对象。把依赖写成 getter，精确返回真正驱动副作用的字段，例如 `route.params.id`、`route.query.page` 或 `route.name`；这样 query 的无关变化不会重复请求用户数据。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const user = ref<User | null>(null)

watch(
  () => route.params.id,
  async (id) => {
    user.value = typeof id === 'string' ? await fetchUser(id) : null
  },
  { immediate: true },
)`,
    },
    {
      type: 'text',
      content:
        '不要在 setup 时把会被整项替换的顶层字段直接解构成普通变量。`const { params } = route` 只保存当时的 params 对象；后续导航让 route 的 `params` getter 指向新对象时，旧局部变量不会跟随。使用 getter、`computed()` 或 getter 形式的 `toRef()` 保留读取链。',
    },
    { type: 'heading', content: '编程式导航' },
    {
      type: 'text',
      content:
        '`router.push()` 新增 history 条目，`router.replace()` 替换当前条目；二者都接受 `RouteLocationRaw` 并返回 Promise。导航会先解析目标、处理 redirect、依次运行 guards 与加载进入组件，只有最终提交时才写 history 并替换 `currentRoute.value`。因此需要在导航后读取新 route 或启动依赖新页面的工作时，应等待该 Promise。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { isNavigationFailure, useRouter } from 'vue-router'

const router = useRouter()

/** 保存表单后导航到详情页，并区分被阻止的导航。 */
async function saveAndOpenDetails(id: string) {
  await saveDraft()
  const failure = await router.push({ name: 'details', params: { id } })

  if (isNavigationFailure(failure)) {
    showNavigationNotice(failure)
  }
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '导航 Promise fulfilled 不必然表示已经进入目标页：重复、取消或守卫中止等预期结果会以 NavigationFailure 返回。真正的未预期错误仍可能 reject；不要用单一的 `await` 或 `catch` 把两类结果混为一谈。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把 raw location 直接交给 loadRouteLocation()',
          description:
            '该 helper 的输入必须已经含有 matcher 生成的 `matched` records；普通 name/path 对象属于 `RouteLocationRaw`，尚没有可遍历的组件清单。',
          consequence:
            'TypeScript 会拒绝参数；绕过类型后实现读取 `route.matched` 时会失败，目标组件也不会被正确加载。',
          wrong: {
            lang: 'ts',
            content: `await loadRouteLocation({
  name: 'user-dialog',
  params: { id: '42' },
})`,
          },
          correct: {
            lang: 'ts',
            content: `const resolved = router.resolve({
  name: 'user-dialog',
  params: { id: '42' },
})
const loaded = await loadRouteLocation(resolved)`,
          },
        },
        {
          title: '用 loadRouteLocation() 代替 router.push()',
          description:
            '`loadRouteLocation()` 只加载 route records 上的异步组件并返回 loaded route，不运行完整导航管线。',
          consequence:
            'URL、history 和当前 route 都不会改变，guards 也不会按一次真实导航执行；界面仍停留在原地址。',
          wrong: {
            lang: 'ts',
            content: `const target = router.resolve('/reports')
await loadRouteLocation(target)
// 误以为当前页面已经变成 /reports`,
          },
          correct: {
            lang: 'ts',
            content: `await router.push('/reports')`,
          },
        },
        {
          title: '直接加载未匹配或只含 redirect records 的 route',
          description:
            '固定源码对 `route.matched.every(...)` 的结果为 true 时直接拒绝；这既覆盖全部 records 都是 redirect，也覆盖 matched 为空的地址。两者都没有可作为 RouterView route prop 的最终组件。',
          consequence:
            'Promise 以 `Cannot load a route that redirects.` 拒绝，预加载流程进入错误分支。',
          wrong: {
            lang: 'ts',
            content: `const legacy = router.resolve('/legacy')
const loaded = await loadRouteLocation(legacy)`,
          },
          correct: {
            lang: 'ts',
            content: `// 让 Router 处理 /legacy 的 redirect 和导航守卫。
await router.push('/legacy')`,
          },
        },
        {
          title: '在模块初始化或延迟回调中临时调用 useRouter()',
          description:
            '`useRouter()` 依赖当前 app 的 injection context。模块求值、独立 service 或后来执行的普通回调不天然拥有该上下文。',
          consequence:
            'Vue 会报告 injection 未找到，返回值在运行时为 undefined，随后调用 `push()` 失败。',
          wrong: {
            lang: 'ts',
            content: `// navigation-service.ts 的模块顶层
const router = useRouter()

/** 错误示例：使用模块求值时取得的 Router 导航。 */
export const openHome = () => router.push('/')`,
          },
          correct: {
            lang: 'ts',
            content: `/** 在 setup 调用期间取得 Router，并返回可延迟执行的操作。 */
export function useHomeNavigation() {
  const router = useRouter()
  return () => router.push('/')
}`,
          },
        },
        {
          title: '解构 route 后期待 params 持续响应导航',
          description:
            'Router 提供的是带顶层 getter 的 shallow reactive route；导航时 `params`、`query` 等顶层值会整体切换。直接解构只保留旧值。',
          consequence:
            '组件复用到新的 id 时，局部 `params` 仍指向旧对象，计算和请求继续使用过期参数。',
          wrong: {
            lang: 'ts',
            content: `const { params } = useRoute()
const userId = computed(() => params.id)`,
          },
          correct: {
            lang: 'ts',
            content: `const route = useRoute()
const userId = computed(() => route.params.id)`,
          },
        },
        {
          title: '深度侦听整个 route 来响应一个参数',
          description:
            '官方 Guide 建议直接 watch 预计变化的属性。整个 route 还包含 query、hash、meta 与 matched，依赖面远大于用户 id。',
          consequence: '无关地址变化也重复触发请求，旧异步结果还可能覆盖较新的页面状态。',
          wrong: {
            lang: 'ts',
            content: `watch(
  route,
  () => fetchUser(route.params.id),
  { deep: true },
)`,
          },
          correct: {
            lang: 'ts',
            content: `watch(
  () => route.params.id,
  (id) => fetchUser(id),
)`,
          },
        },
        {
          title: '修改 useRoute() 的 query 来尝试导航',
          description:
            '`useRoute()` 用于观察 Router 已提交的状态，不是可编辑草稿；修改其中对象不会经过解析、guards 或 history。',
          consequence:
            '地址栏与 Router 内部状态没有按期望更新，还可能让当前渲染临时看到与 URL 不一致的数据。',
          wrong: {
            lang: 'ts',
            content: `route.query.page = '2'`,
          },
          correct: {
            lang: 'ts',
            content: `await router.push({
  query: { ...route.query, page: '2' },
})`,
          },
        },
        {
          title: '把 useRoute(name) 当成运行时 route 选择器',
          description:
            '5.2.0 的 `_name` 只参与 typed routes 的返回类型，运行时实现直接忽略它并注入当前 route。',
          consequence:
            '组件在其他地址渲染时仍取得真实当前 route，代码却按指定 name 的 params 形状盲目读取。',
          wrong: {
            lang: 'ts',
            content: `const userRoute = useRoute('user')
// 误以为此处总是 user route
loadUser(userRoute.params.id)`,
          },
          correct: {
            lang: 'ts',
            content: `const route = useRoute()

if (route.name === 'user') {
  loadUser(route.params.id)
}`,
          },
        },
        {
          title: '发起导航后立即读取 route，且不等待结果',
          description:
            '`router.push()` 要经过 redirect、guards 与组件加载；固定源码只在 `finalizeNavigation()` 成功阶段替换 currentRoute。',
          consequence:
            '紧接着读取的 `route.fullPath` 仍可能是旧地址，导航失败时还会把后续工作绑定到错误页面。',
          wrong: {
            lang: 'ts',
            content: `router.push({ name: 'details', params: { id } })
trackPage(route.fullPath)`,
          },
          correct: {
            lang: 'ts',
            content: `const failure = await router.push({
  name: 'details',
  params: { id },
})

if (!failure) trackPage(route.fullPath)`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 从发布声明冻结三个签名',
          content:
            '本地 `vue-router@5.2.0` 声明把 `loadRouteLocation` 的输入固定为 `RouteLocation | RouteLocationNormalized`，返回 loaded Promise；`useRouter` 返回公开 `Router`；`useRoute` 的 Name generic 联合相应 `childrenNames`。正文采用本地声明，不用官网当前页面的简化 Generic 展示覆盖发布事实。',
        },
        {
          title: '2. 沿低层 helper 确认组件加载副作用',
          content:
            '固定 `navigationGuards.ts` 先拒绝未匹配或纯 redirect route，再并行遍历 matched records 与 named components。lazy loader 成功后，源码保存完整 module 到 `record.mods[name]`，把解析出的 component 写回 `record.components[name]`，最终返回原 route；这就是它适合自定义 RouterView、却不等于导航的依据。',
        },
        {
          title: '3. 沿 install 建立 route 响应性模型',
          content:
            '固定 `router.ts` 为初始 route 的每个顶层 key 定义 getter，getter读取 `currentRoute.value[key]`，再用 `shallowReactive()` 提供给 `routeLocationKey`。因此 `useRoute()` 返回稳定响应式代理，而 params/query 等顶层字段会随 currentRoute 整体切换；精确 getter watch 比深度 watch 整个 route 更符合实现。',
        },
        {
          title: '4. 沿 useApi 确认 setup 与类型参数边界',
          content:
            '固定 `useApi.ts` 中两个组合式入口分别 `inject(routerKey)` 与 `inject(routeLocationKey)`；`useRoute` 的 `_name` 没有进入运行时逻辑。普通应用必须先 `app.use(router)` 建立 provider，并在有效 injection context 中调用；discussion #2228 只作为 injection-not-found 的排障案例，不改变 API 契约。',
        },
        {
          title: '5. 沿导航提交点区分读取与写入',
          content:
            '固定 `router.ts` 的 `push()` 进入 redirect 与 guard 管线，只有 `finalizeNavigation()` 才写 history、替换 `currentRoute.value` 并处理滚动。普通业务读取当前地址用 route，改变地址用 router；只有自定义 route 渲染确实需要提前解析 lazy components 时，才直接调用 `loadRouteLocation()`。',
        },
      ],
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/router 5.2.0 固定源码。
/** 返回当前应用注入的 Router 实例。 */
export function useRouter(): Router {
  return inject(routerKey)!
}

/** 返回当前应用注入的响应式已加载 route。 */
export function useRoute<Name extends keyof RouteMap = keyof RouteMap>(
  _name?: Name,
) {
  return inject(routeLocationKey) as RouteLocationNormalizedLoaded<
    Name | RouteMap[Name]['childrenNames']
  >
}

/** 加载已解析 route 的异步组件，但不发起导航。 */
export function loadRouteLocation(
  route: RouteLocation | RouteLocationNormalized,
): Promise<RouteLocationNormalizedLoaded> {
  if (route.matched.every((record) => record.redirect)) {
    return Promise.reject(new Error('Cannot load a route that redirects.'))
  }

  // 实际源码还遍历 named components、缓存 module，并解析 default export。
  return loadMatchedComponents(route).then(() => route)
}`,
    },
  ],
  notes: [
    '`useRoute()` 返回响应式对象而不是 ref；组件脚本中读取字段不使用 `.value`。',
    '`loadRouteLocation()` 是低层异步 route component loading helper，不是读取当前 route 的组合式函数。',
    '需要真实导航时使用 Router 实例方法，并按需检查 NavigationFailure。',
  ],
})
