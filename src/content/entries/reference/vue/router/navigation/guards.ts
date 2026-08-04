/**
 * Vue Router 参考：导航守卫类型、返回值与组件内组合式守卫
 * 查证日期：2026-08-04
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 API/Guide、官方 discussion/RFC、本地类型与运行时代码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

const fixedSourceBase =
  'https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src'

export const meta = defineReferenceMeta({
  id: 'vue.router.reference.navigation.guards',
  type: 'reference',
  title: '导航守卫',
  summary:
    '查阅导航守卫的参数、返回值、deprecated next、after hook，以及组件内 leave/update 守卫的注册边界',
  ecosystem: 'vue',
  module: 'router',
  collection: 'navigation',
  related: [
    'vue.router.reference.configuration.router-instance',
    'vue.router.reference.navigation.failures',
    'vue.router.reference.matching.route-locations',
    'vue.router.reference.composables.navigation',
    'vue.router.learn.intermediate.meta-navigation-guards',
    'vue.router.learn.advanced.navigation-failures',
  ],
  tags: [
    'Vue Router',
    'NavigationGuard',
    'NavigationGuardNext',
    'NavigationGuardReturn',
    'afterEach',
    'onBeforeRouteLeave',
    'onBeforeRouteUpdate',
    'navigation guards',
    'deprecated',
  ],
  sources: [
    {
      title: 'Vue Router API：NavigationGuard',
      url: 'https://router.vuejs.org/api/interfaces/navigationguard',
    },
    {
      title: 'Vue Router API：NavigationGuardNext',
      url: 'https://router.vuejs.org/api/interfaces/navigationguardnext',
    },
    {
      title: 'Vue Router API：NavigationGuardWithThis',
      url: 'https://router.vuejs.org/api/interfaces/navigationguardwiththis',
    },
    {
      title: 'Vue Router API：NavigationHookAfter',
      url: 'https://router.vuejs.org/api/interfaces/navigationhookafter',
    },
    {
      title: 'Vue Router API：_Awaitable',
      url: 'https://router.vuejs.org/api/type-aliases/awaitable',
    },
    {
      title: 'Vue Router API：NavigationGuardNextCallback',
      url: 'https://router.vuejs.org/api/type-aliases/navigationguardnextcallback',
    },
    {
      title: 'Vue Router API：NavigationGuardReturn',
      url: 'https://router.vuejs.org/api/type-aliases/navigationguardreturn',
    },
    {
      title: 'Vue Router API：onBeforeRouteLeave()',
      url: 'https://router.vuejs.org/api/functions/onbeforerouteleave',
    },
    {
      title: 'Vue Router API：onBeforeRouteUpdate()',
      url: 'https://router.vuejs.org/api/functions/onbeforerouteupdate',
    },
    {
      title: 'Vue Router Guide：Navigation Guards',
      url: 'https://router.vuejs.org/guide/advanced/navigation-guards.html',
    },
    {
      title: 'Vue Router Guide：Composition API',
      url: 'https://router.vuejs.org/guide/advanced/composition-api.html#navigation-guards',
    },
    {
      title: 'Vue Router discussion #2328：组件内守卫需要 active route record',
      url: 'https://github.com/vuejs/router/discussions/2328',
    },
    {
      title: 'Vue RFC #302：移除 next 参数的动机',
      url: 'https://github.com/vuejs/rfcs/discussions/302',
    },
    {
      title: 'Vue Router 5.2.0：导航守卫固定类型',
      url: `${fixedSourceBase}/typed-routes/navigation-guards.ts`,
    },
    {
      title: 'Vue Router 5.2.0：Awaitable 固定类型',
      url: `${fixedSourceBase}/types/utils.ts`,
    },
    {
      title: 'Vue Router 5.2.0：组件内守卫与 next 固定实现',
      url: `${fixedSourceBase}/navigationGuards.ts`,
    },
    {
      title: 'Vue Router 5.2.0：守卫队列与 after hook 固定实现',
      url: `${fixedSourceBase}/router.ts`,
    },
    {
      title: 'Vue Router 5.2.0：enter callback 固定实现',
      url: `${fixedSourceBase}/RouterView.ts`,
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  anchors: [
    '概述',
    '执行阶段速查',
    'Navigation Guard',
    'Navigation Guard Next',
    'Navigation Guard With This',
    'Navigation Hook After',
    'Internal Awaitable',
    'Navigation Guard Next Callback',
    'Navigation Guard Return',
    'On Before Route Leave',
    'On Before Route Update',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `type NavigationGuardReturn =
  | void
  | Error
  | boolean
  | RouteLocationRaw

interface NavigationGuard {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    /** @deprecated Return a value instead. */
    next: NavigationGuardNext,
  ): _Awaitable<NavigationGuardReturn>
}

interface NavigationGuardWithThis<T> {
  (
    this: T,
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    /** @deprecated Return a value instead. */
    next: NavigationGuardNext,
  ): _Awaitable<NavigationGuardReturn>
}

interface NavigationHookAfter {
  (
    to: RouteLocationNormalizedLoaded,
    from: RouteLocationNormalizedLoaded,
    failure?: NavigationFailure | void,
  ): unknown
}

/** @deprecated Prefer returning a value from the guard. */
interface NavigationGuardNext {
  (): void
  (error: Error): void
  (location: RouteLocationRaw): void
  (valid: boolean | undefined): void
  (cb: NavigationGuardNextCallback): void
}

type NavigationGuardNextCallback = (
  vm: ComponentPublicInstance,
) => unknown

/** @internal */
type _Awaitable<T> = T | PromiseLike<T>

declare function onBeforeRouteLeave(
  leaveGuard: NavigationGuard,
): void

declare function onBeforeRouteUpdate(
  updateGuard: NavigationGuard,
): void`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '本页的九个 API 描述同一条守卫契约：导航确认前的 guard 可以同步或异步地放行、取消、重定向或报错；导航落定后的 `NavigationHookAfter` 只能观察结果；`onBeforeRouteLeave()` 与 `onBeforeRouteUpdate()` 把同一 guard 契约注册到当前组件所属的 active route record。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`NavigationGuardNext` 在 5.2.0 仍可用，但类型和运行时都明确标记 deprecated，并说明未来会移除。官方 Guide 将第三个 `next` 参数称为常见错误来源；新代码应省略第三个形参并直接 `return`。只有维护旧守卫或 `beforeRouteEnter` 必须取得组件实例时才保留它。',
    },
    { type: 'heading', content: '执行阶段速查' },
    {
      type: 'table',
      headers: ['阶段', '典型入口', 'to 类型', '能否改变导航'],
      rows: [
        [
          '离开旧 record',
          'beforeRouteLeave / onBeforeRouteLeave',
          'RouteLocationNormalized',
          '可以',
        ],
        ['全局前置', 'router.beforeEach', 'RouteLocationNormalized', '可以'],
        [
          '复用当前 record',
          'beforeRouteUpdate / onBeforeRouteUpdate',
          'RouteLocationNormalized',
          '可以',
        ],
        ['进入 record', 'beforeEnter / beforeRouteEnter', 'RouteLocationNormalized', '可以'],
        ['组件和异步组件已解析', 'router.beforeResolve', 'RouteLocationNormalizedLoaded', '可以'],
        ['导航已落定', 'router.afterEach', 'RouteLocationNormalizedLoaded', '不可以'],
      ],
    },
    {
      type: 'text',
      content:
        '固定运行时的队列顺序与官方 Guide 一致：离开组件、全局 beforeEach、复用组件、record beforeEnter、进入组件、全局 beforeResolve，确认后才触发 afterEach。每个阶段之间还会检查是否已有更新的导航取消了当前导航。',
    },
    { type: 'heading', content: 'Navigation Guard' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface NavigationGuard {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    /** @deprecated Return a value instead. */
    next: NavigationGuardNext,
  ): _Awaitable<NavigationGuardReturn>
}`,
    },
    {
      type: 'table',
      headers: ['参数/结果', '精确类型', '含义'],
      rows: [
        ['to', 'RouteLocationNormalized', '正准备进入的 normalized location；组件未必已加载'],
        ['from', 'RouteLocationNormalizedLoaded', '当前已确认并已加载的 location'],
        [
          'next',
          'NavigationGuardNext',
          '兼容旧写法的 deprecated 回调；签名保留不代表新守卫必须使用',
        ],
        [
          'return',
          '_Awaitable<NavigationGuardReturn>',
          '同步值或 PromiseLike；应用代码使用公开 guard/return 类型即可',
        ],
      ],
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { NavigationGuard } from 'vue-router'

const requireAuth: NavigationGuard = async (to) => {
  const authenticated = await authSession.isAuthenticated()

  if (to.meta.requiresAuth && !authenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
}`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '`router.beforeResolve()` 是一个窄差异：本地 5.2.0 声明使用 internal `_NavigationGuardResolved`，其 `to` 已是 `RouteLocationNormalizedLoaded`。这属于 Router 方法的上下文类型，不是第十个公开 guard API；使用 beforeResolve 时让回调参数自然推断，不要为了这个差异导入 internal 类型。',
    },
    { type: 'heading', content: 'Navigation Guard Next' },
    {
      type: 'code',
      lang: 'ts',
      content: `/** @deprecated Prefer returning a value from the guard. */
interface NavigationGuardNext {
  (): void
  (error: Error): void
  (location: RouteLocationRaw): void
  (valid: boolean | undefined): void
  (cb: NavigationGuardNextCallback): void
}`,
    },
    {
      type: 'table',
      headers: ['调用', '运行时结果', '现代 return 写法'],
      rows: [
        ['next() / next(true) / next(undefined)', '放行，继续下一个守卫', 'return / return true'],
        ['next(false)', '取消当前导航，形成 aborted failure', 'return false'],
        ['next(location)', '丢弃当前导航并创建重定向导航', 'return location'],
        ['next(error)', '拒绝守卫队列并交给 router.onError()', 'throw error / return error'],
        [
          'next(callback)',
          '登记 enter callback；公开契约仅支持 beforeRouteEnter',
          '没有等价普通 return',
        ],
      ],
    },
    {
      type: 'text',
      content:
        '当函数声明了第三个形参时，5.2.0 运行时按 `guard.length > 2` 视为 next 风格：它不会把函数返回值自动当作守卫结果，而会等待 `next`。开发构建首次调用会发出 deprecated 诊断；异步守卫或同步返回非 `undefined` 却漏调 next 时会报 invalid navigation guard，同步返回 `undefined` 且漏调时则会一直 pending。重叠路径的第二次调用也会诊断；官方契约仍要求每次逻辑路径恰好调用一次。',
    },
    { type: 'heading', content: 'Navigation Guard With This' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface NavigationGuardWithThis<T> {
  (
    this: T,
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    /** @deprecated Return a value instead. */
    next: NavigationGuardNext,
  ): _Awaitable<NavigationGuardReturn>
}`,
    },
    {
      type: 'text',
      content:
        '`NavigationGuardWithThis<T>` 与 `NavigationGuard` 的值域相同，只额外声明调用时的 `this`。Router 的全局 `beforeEach` 和 route record 的 `beforeEnter` 使用 `NavigationGuardWithThis<undefined>`；`beforeRouteEnter` 发生在实例创建前，同样没有组件 `this`。需要实例时只能使用该守卫特有的 `next(vm => ...)` 通道。',
    },
    {
      type: 'tip',
      style: 'info',
      content:
        'Options API 的 `beforeRouteUpdate` / `beforeRouteLeave` 已在 Vue component options 中获得组件上下文，应使用方法语法让 Vue/TypeScript 推断 `this`。不要自行给全局守卫伪造组件 `this`，也不要为了改写这些类型依赖 internal `TypesConfig`。Composition API 中则直接闭包访问 ref 和 store。',
    },
    { type: 'heading', content: 'Navigation Hook After' },
    {
      type: 'code',
      lang: 'ts',
      content: `interface NavigationHookAfter {
  (
    to: RouteLocationNormalizedLoaded,
    from: RouteLocationNormalizedLoaded,
    failure?: NavigationFailure | void,
  ): unknown
}`,
    },
    {
      type: 'text',
      content:
        '`NavigationHookAfter` 是导航 settled 后的观察 hook，不是 guard。`to` 与 `from` 都是 loaded location；第三个参数是可选的 `NavigationFailure | void`，成功时为 `undefined`，取消、重复或被新导航取代时可携带 failure。返回值是 `unknown`，固定运行时直接逐个调用 after hooks，不用返回值改变已经落定的导航。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { isNavigationFailure } from 'vue-router'

const removeAfterHook = router.afterEach((to, from, failure) => {
  if (isNavigationFailure(failure)) {
    navigationTelemetry.recordFailure({ to, from, failure })
    return
  }

  navigationTelemetry.recordSuccess(to.fullPath)
})

// 不再观察导航时调用注册函数返回的 disposer。
removeAfterHook()`,
    },
    { type: 'heading', content: 'Internal Awaitable' },
    {
      type: 'code',
      lang: 'ts',
      content: `/** @internal */
type _Awaitable<T> = T | PromiseLike<T>`,
    },
    {
      type: 'text',
      content:
        '`_Awaitable<T>` 只是源码用来表达“同步值或 thenable”的辅助别名。它虽从 `vue-router` 根入口导出并出现在 API 页面，固定源码与本地声明都标记 `@internal`，不承诺应用层兼容性。不要把下划线名称包装成业务公共类型。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '公开替代不是另一个 Awaitable 别名：声明完整守卫时使用公开 `NavigationGuard`；只描述结果时使用 `NavigationGuardReturn` 或标准 `Promise<NavigationGuardReturn>`；普通回调直接让 `async` 函数推断。这样既表达真实契约，也不绑定 internal export。',
    },
    { type: 'heading', content: 'Navigation Guard Next Callback' },
    {
      type: 'code',
      lang: 'ts',
      content: `type NavigationGuardNextCallback = (
  vm: ComponentPublicInstance,
) => unknown`,
    },
    {
      type: 'text',
      content:
        '`NavigationGuardNextCallback` 是 `beforeRouteEnter` 的专用兼容通道。进入守卫运行时组件实例尚不存在；导航确认且 RouterView 建立 public instance 后，运行时才逐个调用保存的 callback，并传入该实例。callback 的返回值不参与导航，也不会被当作另一个 guard 结果。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `export default {
  /** 进入组件后把输入框聚焦。 */
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.focusSearchInput()
    })
  },
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '只有 `beforeRouteEnter` 公开支持 `next(callback)`。全局守卫和 beforeEnter 没有对应的 record/name 上下文；update/leave 的底层组件守卫 wrapper 虽也携带 record/name、技术上会登记函数，但 RouterView 不承诺在该时机把它作为实例访问通道消费，因此同样不能依赖。',
    },
    { type: 'heading', content: 'Navigation Guard Return' },
    {
      type: 'code',
      lang: 'ts',
      content: `type NavigationGuardReturn =
  | void
  | Error
  | boolean
  | RouteLocationRaw`,
    },
    {
      type: 'table',
      headers: ['返回值', '导航语义', '注意点'],
      rows: [
        ['void / undefined / true', '放行', '继续串行执行下一个守卫'],
        ['false', '取消', '浏览器地址已变化时恢复 from 地址；产生 aborted failure'],
        ['RouteLocationRaw', '重定向', '原导航被替换为从同一 from 发起的新导航'],
        ['Error', '报错', '取消导航并进入 router.onError()；也可以直接 throw'],
      ],
    },
    {
      type: 'text',
      content:
        '这个联合类型基于当前 `TypesConfig` 解析出的 `RouteLocationRaw`，所以 typed routes 下的重定向目标仍保留名称和参数约束。它不包含 `null` 或任意非 location 对象；要继续导航就不返回值，要重定向就返回有效 route location。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `router.beforeEach(async (to) => {
  if (!to.meta.requiresPermission) return

  const allowed = await permissions.canVisit(to)
  if (!allowed) return { name: 'forbidden' }
})`,
    },
    { type: 'heading', content: 'On Before Route Leave' },
    {
      type: 'code',
      lang: 'ts',
      content: `declare function onBeforeRouteLeave(
  leaveGuard: NavigationGuard,
): void`,
    },
    {
      type: 'text',
      content:
        '`onBeforeRouteLeave()` 在当前组件所属 record 即将离开时执行。它接收完整 `NavigationGuard`，因此可同步或异步返回 false、重定向或 Error；函数自身返回 void，不提供手动 disposer。它适合未保存编辑确认、离开前释放与导航直接相关的状态，不负责浏览器关闭或任意组件卸载。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const dirty = ref(false)

onBeforeRouteLeave(() => {
  if (!dirty.value) return
  return window.confirm('放弃未保存的修改吗？') || false
})
</script>`,
    },
    {
      type: 'text',
      content:
        '调用位置必须处于由 RouterView 渲染的 route component 或其后代组件的同步 setup 上下文，因为实现需要注入当前 `matchedRouteKey`。API 保证组件卸载时移除守卫；固定运行时还会在 KeepAlive 组件 deactivated 时删除，activated 时把它加入当前 active record，避免非活动实例继续拦截。',
    },
    { type: 'heading', content: 'On Before Route Update' },
    {
      type: 'code',
      lang: 'ts',
      content: `declare function onBeforeRouteUpdate(
  updateGuard: NavigationGuard,
): void`,
    },
    {
      type: 'text',
      content:
        '`onBeforeRouteUpdate()` 在同一 route record 继续匹配、组件实例被复用而 location 改变时执行，典型情况是 params、query 或 hash 变化。它不会在组件首次进入时执行，也不会在 record 被离开时替代 leave guard。返回 false、重定向或 Error 的语义与其他前置 guard 相同。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

const user = ref<User | null>(null)

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id === from.params.id) return
  user.value = await fetchUser(String(to.params.id))
})
</script>`,
    },
    {
      type: 'table',
      headers: ['场景', '会调用 update guard 吗', '应使用的入口'],
      rows: [
        ['首次进入 /users/1', '不会', 'setup 初始加载或 beforeRouteEnter'],
        ['复用组件：/users/1 → /users/2', '会', 'onBeforeRouteUpdate'],
        ['同 record 的 query/hash 改变', '会', '按字段比较后决定是否执行副作用'],
        ['离开 /users/1 → /settings', '不会', 'onBeforeRouteLeave'],
        ['组件卸载后', '不会', '守卫已自动从 active record 移除'],
      ],
    },
    {
      type: 'text',
      content:
        '它与 leave guard 共享 active-record 注册机制：可用于 RouterView 下的后代组件，组件卸载自动删除，KeepAlive deactivated 时暂停、activated 时恢复。官方 discussion #2328 的常见测试告警通常不是函数失效，而是直接 mount 组件、没有让真实 RouterView 渲染它，因而不存在 active route record。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '声明 next 参数却只返回值',
          description:
            '运行时用函数形参数量区分 next 风格和 return 风格；有第三个形参时只 return 不会完成 next 契约。',
          consequence: '开发环境报 invalid navigation guard，导航无法按预期完成。',
          wrong: {
            lang: 'ts',
            content: `router.beforeEach(async (to, from, next) => {
  const allowed = await permissions.canVisit(to)
  return allowed ? true : { name: 'forbidden' }
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.beforeEach(async (to) => {
  const allowed = await permissions.canVisit(to)
  if (!allowed) return { name: 'forbidden' }
})`,
          },
        },
        {
          title: '让两个 next 调用路径重叠',
          description: '重定向分支调用 next 后继续落到末尾 next，违反每条逻辑路径恰好一次。',
          consequence: '第二次调用被忽略并产生诊断，旧版本或复杂异步分支还可能挂起。',
          wrong: {
            lang: 'ts',
            content: `router.beforeEach((to, from, next) => {
  if (!session.authenticated) next({ name: 'login' })
  next()
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.beforeEach((to) => {
  if (!session.authenticated) return { name: 'login' }
})`,
          },
        },
        {
          title: '重定向守卫没有排除目标页',
          description: '未登录时无条件返回 login，导航到 login 本身也再次触发相同重定向。',
          consequence: '产生无限重定向或被 Router 的循环诊断中止。',
          wrong: {
            lang: 'ts',
            content: `router.beforeEach(() => {
  if (!session.authenticated) return { name: 'login' }
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.beforeEach((to) => {
  if (!session.authenticated && to.name !== 'login') {
    return { name: 'login' }
  }
})`,
          },
        },
        {
          title: '试图从 afterEach 取消导航',
          description:
            'afterEach 收到的是已落定结果，返回 false 不属于 NavigationHookAfter 的控制通道。',
          consequence: '地址和 currentRoute 已经更新，返回值不会撤销导航。',
          wrong: {
            lang: 'ts',
            content: `router.afterEach(() => {
  if (editor.dirty) return false
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.beforeEach(() => {
  if (editor.dirty) return false
})`,
          },
        },
        {
          title: '在全局守卫中使用 next(vm)',
          description:
            '共享 overload 可见不代表所有守卫都有 enter callback 对应的 record/name 上下文。',
          consequence: '回调不会获得目标组件实例，组件初始化逻辑静默缺失。',
          wrong: {
            lang: 'ts',
            content: `router.beforeEach((to, from, next) => {
  next((vm) => vm.focusSearchInput())
})`,
          },
          correct: {
            lang: 'ts',
            content: `export default {
  /** 进入组件后聚焦搜索输入框。 */
  beforeRouteEnter(to, from, next) {
    next((vm) => vm.focusSearchInput())
  },
}`,
          },
        },
        {
          title: '在 active RouterView 上下文之外注册组合式守卫',
          description:
            '模块顶层、App 根组件或直接 mount 的测试组件可能没有当前 route record injection。',
          consequence: '运行时发出 no active route record 警告，守卫不会注册。',
          wrong: {
            lang: 'ts',
            content: `// 普通模块顶层没有当前 route component。
onBeforeRouteLeave(() => false)`,
          },
          correct: {
            lang: 'vue',
            content: `<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'

// 此组件由 RouterView 渲染，或位于其 route component 子树中。
onBeforeRouteLeave(() => editor.dirty ? false : undefined)
</script>`,
          },
        },
        {
          title: '把 onBeforeRouteUpdate 当成首次加载入口',
          description: 'update guard 只处理 record 保持匹配、组件复用的后续导航。',
          consequence: '用户首次打开页面时数据为空，只有修改参数后才加载。',
          wrong: {
            lang: 'ts',
            content: `onBeforeRouteUpdate(async (to) => {
  user.value = await fetchUser(String(to.params.id))
})`,
          },
          correct: {
            lang: 'ts',
            content: `const route = useRoute()

/** 按 route 参数加载用户。 */
async function loadUser(id: unknown) {
  user.value = await fetchUser(String(id))
}

await loadUser(route.params.id)
onBeforeRouteUpdate((to) => loadUser(to.params.id))`,
          },
        },
        {
          title: '把 internal _Awaitable 暴露为业务类型',
          description: '下划线别名虽可导入，但固定源码明确标记 internal。',
          consequence: '业务公共接口绑定无稳定性承诺的实现辅助类型，升级时更易破坏。',
          wrong: {
            lang: 'ts',
            content: `import type { _Awaitable, NavigationGuardReturn } from 'vue-router'

export type AppGuardResult = _Awaitable<NavigationGuardReturn>`,
          },
          correct: {
            lang: 'ts',
            content: `import type { NavigationGuard } from 'vue-router'

export const requireAuth: NavigationGuard = async (to) => {
  if (!session.authenticated) return { name: 'login' }
}`,
          },
        },
        {
          title: '在 Options API 箭头函数里读取 this',
          description: '箭头函数不创建组件方法的动态 this，类型别名也不会改变 JavaScript 语义。',
          consequence: '守卫读取不到组件实例状态，无法正确阻止离开。',
          wrong: {
            lang: 'ts',
            content: `export default {
  beforeRouteLeave: () => !this.dirty,
}`,
          },
          correct: {
            lang: 'ts',
            content: `export default {
  /** 有未保存修改时阻止离开。 */
  beforeRouteLeave() {
    return this.dirty ? false : undefined
  },
}`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 冻结公开类型值域',
          content:
            '固定 `typed-routes/navigation-guards.ts` 与本地声明一致：NavigationGuard 的 to 尚未承诺 loaded，from 已 loaded；NavigationHookAfter 的两端都 loaded，failure 为可选 NavigationFailure | void。',
        },
        {
          title: '2. 区分 internal Awaitable',
          content:
            '固定 `types/utils.ts` 把 `_Awaitable<T>` 定义为 `T | PromiseLike<T>` 并标记 @internal，因此正文只解释其对公开签名的作用，应用示例统一使用 NavigationGuard、NavigationGuardReturn 或标准 Promise。',
        },
        {
          title: '3. 还原 return 与 next 的分流',
          content:
            '固定 `navigationGuards.ts` 的 guardToPromiseFn 先 Promise.resolve 守卫结果；形参数少于三个时把 resolved value 交给 next 分派，形参数多于两个时则检查 next 是否实际调用。',
        },
        {
          title: '4. 映射守卫结果',
          content:
            '同一实现把 false 转成 aborted failure、Error 转成 reject、RouteLocationRaw 转成 redirect，其余值放行；这直接得到 NavigationGuardReturn 表格，而不是从 Guide 示例反推。',
        },
        {
          title: '5. 验证 deprecated 与恰好一次',
          content:
            '5.2.0 开发运行时用 withDeprecationWarning 首次调用 next 时发出 deprecated 诊断，并用 canOnlyBeCalledOnce 拦截重叠的第二次调用；官方 Guide 同时要求每条逻辑路径恰好一次。',
        },
        {
          title: '6. 跟踪组件内守卫生命周期',
          content:
            'registerGuard 把回调加入 active record 的 leaveGuards/updateGuards Set，在 unmounted 与 deactivated 时删除，在 activated 时重新绑定当前 record；这解释了自动清理、KeepAlive 与 active RouterView 限制。',
        },
        {
          title: '7. 定位 enter callback 与 after hook',
          content:
            'guardToPromiseFn 只要收到 record/name 就会建立 enterCallbacks 并登记函数结果，组件 enter/update/leave wrapper 都可能携带这两个参数；公开契约只允许 beforeRouteEnter 使用该通道，RouterView 建立进入实例后消费 callbacks。router.ts 则在导航落定后以 failure 调用 afterGuards，并忽略它们的返回值。',
        },
      ],
    },
  ],
  notes: [
    '`NavigationGuardNext` 的 deprecated 状态来自 5.2.0 类型与运行时，不是仅依据旧 RFC 推断。',
    '`_Awaitable` 的 internal 状态以固定源码 `@internal` 为准；根入口可导出不等于公开稳定承诺。',
    '本页只解释 beforeResolve 的 loaded-to 类型差异，不展开 Router 实例注册方法；完整 disposer 契约见 Router 实例参考。',
  ],
})
