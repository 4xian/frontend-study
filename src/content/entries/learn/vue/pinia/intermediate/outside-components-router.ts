/**
 * 课程：组件外使用与路由集成
 * 查证日期：2026-08-05
 * 适用版本：Pinia 4.0.2、Vue Router 5.2.0
 * 查证来源：Pinia、Vue、Vue Router 官方文档与固定 commit 源码和测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const subscriptionsId = 'vue.pinia.learn.intermediate.subscriptions-actions'
const routerSetupId = 'vue.router.learn.basics.setup-first-router'
const routerGuardsId = 'vue.router.learn.intermediate.meta-navigation-guards'

const prerequisites = [
  'vue.pinia.learn.basics.setup-first-store',
  'vue.pinia.learn.basics.state-patch-reset',
  'vue.pinia.learn.basics.getters',
  'vue.pinia.learn.basics.actions-async',
  'vue.pinia.learn.basics.component-store-to-refs',
  'vue.pinia.learn.intermediate.setup-stores',
  'vue.pinia.learn.intermediate.store-composition',
  'vue.pinia.learn.intermediate.store-modeling',
  subscriptionsId,
  routerSetupId,
]

export const meta = defineLessonMeta({
  id: 'vue.pinia.learn.intermediate.outside-components-router',
  type: 'lesson',
  title: '组件外使用与路由集成',
  summary: '在 app 安装后、Router guard 内或显式 Pinia 上取得正确的 Store 实例',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites,
  related: [subscriptionsId, routerGuardsId, 'vue.pinia.reference.core.pinia-instance'],
  tags: ['Pinia', '组件外使用', 'Vue Router', 'navigation guard', 'active Pinia'],
  sources: [
    {
      title: 'Pinia：Using a store outside of a component',
      url: 'https://pinia.vuejs.org/core-concepts/outside-component-usage.html',
    },
    {
      title: 'Pinia：Server Side Rendering',
      url: 'https://pinia.vuejs.org/ssr/',
    },
    {
      title: 'Vue：app.runWithContext()',
      url: 'https://vuejs.org/api/application.html#app-runwithcontext',
    },
    {
      title: 'Vue Router：Global injections within guards',
      url: 'https://router.vuejs.org/guide/advanced/navigation-guards.html#global-injections-within-guards',
    },
    {
      title: 'Vue Router：createMemoryHistory()',
      url: 'https://router.vuejs.org/api/functions/createMemoryHistory.html',
    },
    {
      title: 'Pinia 4.0.2 createPinia.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts',
    },
    {
      title: 'Pinia 4.0.2 store.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts',
    },
    {
      title: 'Pinia 4.0.2 ssr.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts',
    },
  ],
  appliesTo: 'Pinia 4.0.2 / Vue Router 5.2.0',
  verifiedAt: '2026-08-05',
  estimatedMinutes: 48,
})

export default defineLesson({
  meta,
  objectives: [
    '区分 defineStore 工厂与调用 useStore 的时机',
    '在 Router guard 回调内延迟取得 Store',
    '在组件外通过显式 useStore(pinia) 固定实例归属',
    '理解 SPA active fallback 与 SSR 请求隔离的差别',
  ],
  blocks: [
    {
      type: 'tip',
      style: 'info',
      content: '前置：请先完成 L01-L09，并掌握 Vue Router 的创建、memory history 和全局导航守卫。',
    },
    { type: 'heading', content: '定义可以提前，调用必须等上下文' },
    {
      type: 'text',
      content:
        '`defineStore()` 只创建 StoreDefinition，可以在模块加载时定义；真正的 `useStore()` 需要明确 Pinia。单 SPA 通常在 `app.use(pinia)` 后依赖 active fallback，但模块评估顺序可能早于 plugin 安装，多个 app 或 SSR 也不能把 mutable active Pinia 当作隔离协议。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const router = createRouter({ history, routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.signedIn) return '/login'
})`,
    },
    { type: 'heading', content: '显式、注入与 active fallback' },
    {
      type: 'table',
      headers: ['入口', '适用场景', '边界'],
      rows: [
        ['useStore(pinia)', '组件外 utility、测试、多 app、SSR', '调用方必须持有正确实例'],
        ['app injection', '组件 setup、已安装 Router guard', '只在当前 app context 内'],
        ['active fallback', '单 SPA 安装后的便利路径', 'mutable，不能隔离并发请求'],
      ],
    },
    {
      type: 'text',
      content:
        '固定 4.0.2 的 `useStore(pinia?)` 优先采用显式参数，再看当前 injection context，最后回退 active Pinia。`app.runWithContext()` 只在同步执行期间提供 app injection，不跨 `await`，也不创建组件实例。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'Router guard 负责允许或重定向，认证 Store 负责认证 state/action。不要把宿主 Router 实例塞进 Store，也不要依赖进程级 active Pinia 隔离 SSR 请求。',
    },
    { type: 'heading', content: '独立 memory router 实验' },
    {
      type: 'demo',
      id: 'vue.pinia.learn.intermediate.outside-components-router.pinia-outside-component-context-lab-demo',
      description: '在独立 mini-app 的 guard 内延迟取得 Store，并保持宿主 URL 与 Pinia 不变',
      playground: true,
    },
    { type: 'heading', content: '练习与观察' },
    {
      type: 'steps',
      items: [
        { title: '1. 访问受保护页', content: '未登录时确认 memory router 重定向到内存登录路径。' },
        {
          title: '2. 显式取得 Store',
          content: '比较 useStore(pinia) 与 guard 内 Store 的 identity。',
        },
        { title: '3. 登录后重试', content: '同一路径由 guard 放行到内存受保护页。' },
        { title: '4. 核对宿主', content: '确认浏览器 URL 和宿主 active Pinia 全程不变。' },
      ],
    },
    { type: 'heading', content: '源码与测试推导' },
    {
      type: 'steps',
      items: [
        {
          title: '1. install 同时 active 与 provide',
          content: 'createPinia.ts 在 app.use 时设置 active、关联 app 并 provide Pinia。',
        },
        {
          title: '2. 显式参数优先',
          content:
            '固定 store.ts 先采用 useStore(pinia) 参数，再看 injection context 和 active fallback。',
        },
        {
          title: '3. active 是 mutable fallback',
          content: '它方便单 SPA，但不能表示并发请求或多 app 的唯一所有者。',
        },
        {
          title: '4. runWithContext 只保证同步注入',
          content:
            'Setup Store 和 Router guard 可读取 app provide，但不能把该上下文外推到 await 后。',
        },
        {
          title: '5. 官方 guard 示例延迟调用',
          content:
            'outside-component 文档把 useStore 放在 beforeEach callback 内，消除 import/install 顺序风险。',
        },
        {
          title: '6. 固定 SSR 测试证明实例隔离',
          content: '两个 app 可以持有同 ID Store 的不同 state；真实请求必须显式传当前 Pinia。',
        },
        {
          title: '7. 当前 Demo 的证据边界',
          content: 'memory router 只证明浏览器内独立 app seam，不替代真实 SSR/hydration。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把 defineStore 与 useStore 混为一谈',
          description: '定义工厂不需要已安装 Pinia，调用才需要。',
          consequence: '为解决调用时序而错误延迟所有模块定义。',
          wrong: {
            lang: 'ts',
            content: `app.use(pinia)
export const useAuthStore = defineStore('auth', {})`,
          },
          correct: { lang: 'ts', content: `export const useAuthStore = defineStore('auth', {})` },
        },
        {
          title: '在模块顶层提前调用 useStore',
          description: '模块可能先于 app.use(pinia) 求值。',
          consequence: '没有 active Pinia 或误取另一个 app。',
          wrong: { lang: 'ts', content: `const auth = useAuthStore()` },
          correct: { lang: 'ts', content: `function getAuth() { return useAuthStore() }` },
        },
        {
          title: '把 active Pinia 当成常量',
          description: '它会被其他 Store 调用或 app 安装更新。',
          consequence: '多 app 与 SSR 读到错误实例。',
          wrong: { lang: 'ts', content: `const requestStore = useAuthStore()` },
          correct: { lang: 'ts', content: `const requestStore = useAuthStore(requestPinia)` },
        },
        {
          title: '已有实例仍手动 setActivePinia',
          description: 'StoreDefinition 公开接受显式 Pinia。',
          consequence: '全局 mutable 状态产生额外切换。',
          wrong: {
            lang: 'ts',
            content: `setActivePinia(pinia)
const auth = useAuthStore()`,
          },
          correct: { lang: 'ts', content: `const auth = useAuthStore(pinia)` },
        },
        {
          title: '让 runWithContext 跨 await',
          description: 'Vue 只保证同步 callback 期间的 injection。',
          consequence: '异步恢复后读取到错误上下文。',
          wrong: {
            lang: 'ts',
            content: `await app.runWithContext(async () => useStoreAfterAwait())`,
          },
          correct: {
            lang: 'ts',
            content: `const store = app.runWithContext(() => useStore())
await work(store)`,
          },
        },
        {
          title: '在 router 模块顶层缓存 Store',
          description: 'Router plugin 可能尚未安装到 app。',
          consequence: 'guard 导入时就触发错误实例选择。',
          wrong: {
            lang: 'ts',
            content: `const auth = useAuthStore()
router.beforeEach(() => auth.signedIn)`,
          },
          correct: { lang: 'ts', content: `router.beforeEach(() => useAuthStore().signedIn)` },
        },
        {
          title: '让 Store 决定所有重定向',
          description: '认证 state 与导航决策是不同责任。',
          consequence: 'Store 与宿主 Router 强耦合。',
          wrong: { lang: 'ts', content: `authStore.router.push('/login')` },
          correct: { lang: 'ts', content: `if (!auth.signedIn) return '/login'` },
        },
        {
          title: '把 memory router 当成 SSR 证据',
          description: '它仍在单个浏览器进程中运行。',
          consequence: '把未验证的请求隔离写成已通过。',
          wrong: { lang: 'ts', content: `// memory router 已证明 SSR 安全` },
          correct: { lang: 'ts', content: `// SSR 请求隔离 Deferred/not-run` },
        },
      ],
    },
  ],
  recap: [
    'defineStore 可以提前，useStore 必须在 Pinia 可用后执行。',
    'Router guard 内延迟调用可避开 import/install 时序风险。',
    '多 app、测试与 SSR 使用显式 useStore(pinia) 固定实例归属。',
    'memory router 证据不等同于真实 SSR 请求隔离。',
  ],
})
