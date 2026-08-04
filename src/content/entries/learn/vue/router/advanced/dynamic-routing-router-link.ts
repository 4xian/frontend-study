/**
 * 课程：动态路由与 RouterLink 扩展
 * 查证日期：2026-08-04
 * 适用版本：Vue 3.5.40、Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方文档与 vuejs/router v5.2.0 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const linkEntryId = 'vue.router.learn.basics.router-link-view-active'
const configurationEntryId = 'vue.router.learn.intermediate.named-routes-redirects-aliases'
const failureEntryId = 'vue.router.learn.advanced.navigation-failures'

export const meta = defineLessonMeta({
  id: 'vue.router.learn.advanced.dynamic-routing-router-link',
  type: 'lesson',
  title: '动态路由与 RouterLink 扩展',
  summary: '在运行时管理 matcher，并复用 RouterLink 的链接解析与导航语义',
  ecosystem: 'vue',
  module: 'router',
  collection: 'advanced',
  level: 'advanced',
  prerequisites: [configurationEntryId, failureEntryId],
  related: [linkEntryId, configurationEntryId, failureEntryId],
  tags: ['Vue Router', 'addRoute', 'removeRoute', 'useLink', 'RouterLink'],
  sources: [
    {
      title: 'Vue Router：Dynamic Routing',
      url: 'https://router.vuejs.org/guide/advanced/dynamic-routing',
    },
    {
      title: 'Vue Router：Extending RouterLink',
      url: 'https://router.vuejs.org/guide/advanced/extending-router-link',
    },
    {
      title: 'Vue Router API：Router',
      url: 'https://router.vuejs.org/api/interfaces/router',
    },
    {
      title: 'Vue Router API：useLink()',
      url: 'https://router.vuejs.org/api/functions/uselink',
    },
    {
      title: 'Vue Router API：RouterLink',
      url: 'https://router.vuejs.org/api/variables/routerlink',
    },
    {
      title: 'Vue Router 5.2.0 router.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts',
    },
    {
      title: 'Vue Router 5.2.0 matcher/index.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/matcher/index.ts',
    },
    {
      title: 'Vue Router 5.2.0 RouterLink.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterLink.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40、Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  estimatedMinutes: 80,
})

export default defineLesson({
  meta,
  objectives: [
    '使用 addRoute、removeRoute、hasRoute 与 getRoutes 管理运行时记录',
    '区分 matcher 已改变与 current route 已重新解析',
    '在守卫内通过 return location 收敛动态注册导航',
    '用 useLink 复用 href、active、exact 与标准 navigate 行为',
    '让外部 URL 走原生链接并保留安全属性',
  ],
  blocks: [
    { type: 'heading', content: '动态路由改变 matcher，不会改写当前 route 快照' },
    {
      type: 'text',
      content:
        '`addRoute()` 只注册后续解析可用的记录。如果新记录更精确地匹配当前 URL，已经提交的 `currentRoute` 与 RouterView 仍保持旧 matched；组件挂载期间注册后，应显式 replace 当前 fullPath 并等待导航结算。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const removeFeatureRoute = router.addRoute({
  path: '/feature/tool',
  name: 'feature-tool',
  component: FeatureTool,
})

await router.replace(router.currentRoute.value.fullPath)`,
    },
    {
      type: 'table',
      headers: ['动作', 'matcher', 'currentRoute / RouterView'],
      rows: [
        ['addRoute', '立即增加记录', '保持已提交快照'],
        ['removeRoute / disposer', '立即移除记录', '保持已提交快照'],
        ['replace current fullPath', '用最新 matcher 解析', '提交新的 matched 与视图'],
      ],
    },
    { type: 'heading', content: '在导航守卫内返回位置，不发起嵌套 replace' },
    {
      type: 'code',
      lang: 'ts',
      content: `router.beforeEach((to) => {
  if (!router.hasRoute('feature-tool') && canLoadFeature(to)) {
    router.addRoute(createFeatureRoute())
    return to.fullPath
  }
})`,
    },
    {
      type: 'text',
      content:
        'guard 返回位置会替换当前进行中的导航。`hasRoute()` 或业务注册表必须在下一轮变为 true，否则会无限重定向。组件挂载后的显式 replace 与守卫内 return location 是两个场景，不应混用。',
    },
    { type: 'heading', content: '移除记录有三种入口，但都只改变 matcher' },
    {
      type: 'text',
      content:
        '可以调用 `removeRoute(name)`、执行 `addRoute()` 返回的 disposer，或用同名新记录替换旧记录。移除 parent 会递归移除 children 与 aliases。route name 在整个 Router 中唯一；插件化场景可用 Symbol 降低命名冲突。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const dispose = router.addRoute(featureRoute)

router.hasRoute('feature-tool')
router.getRoutes().map((record) => record.name)

dispose() // 只移除本次注册仍存在的 matcher`,
    },
    { type: 'heading', content: 'useLink 提供行为，渲染责任仍在组件' },
    {
      type: 'text',
      content:
        '`useLink({ to, replace })` 返回 resolved route、href、isActive、isExactActive 与 navigate。自定义组件仍应输出真实 `<a>`、绑定 href、在 exact active 时设置 `aria-current="page"`，并把 click 交给 navigate；它不是把链接降级成按钮。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
const props = defineProps<{ to: RouteLocationRaw }>()
const { href, isActive, isExactActive, navigate } = useLink(props)
</script>

<template>
  <a
    :href="href"
    :class="{ active: isActive }"
    :aria-current="isExactActive ? 'page' : undefined"
    @click="navigate"
  ><slot /></a>
</template>`,
    },
    { type: 'heading', content: '外部链接先旁路 client router' },
    {
      type: 'text',
      content:
        'RouterLink 的 navigate 会保留修饰键、非左键、已阻止事件和 `_blank` 的浏览器行为；包装组件不应复制一套不完整判断。`https:` 等外部 URL 直接渲染原生 `<a target="_blank" rel="noopener noreferrer">`，不要交给 `useLink()` 解析。',
    },
    { type: 'heading', content: '用一个实验观察 matcher、route 与 link 三组状态' },
    {
      type: 'text',
      content:
        '下面的独立 memory router 先让 `/feature/tool?mode=inspect` 命中 fallback。注册动态记录后，hasRoute 与 getRoutes 先改变；只有 replace 当前地址后 matched 与 RouterView 才切到 feature。实验还展示 useLink 的 href/active/exact、标准键盘导航和外链旁路。',
    },
    {
      type: 'demo',
      id: 'vue.router.learn.advanced.dynamic-routing-router-link.dynamic-routing-router-link-lab-demo',
      description: '分步观察 matcher 注册、当前 route 刷新与 useLink 导航语义',
      playground: true,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '认为 addRoute 会立即刷新当前 RouterView',
          description: 'addRoute 只修改 matcher，不重新提交 currentRoute。',
          consequence: 'hasRoute 已为 true，页面仍显示旧 fallback。',
          wrong: {
            lang: 'ts',
            content: `router.addRoute(featureRoute)
// 错误假设：页面已经切换`,
          },
          correct: {
            lang: 'ts',
            content: `router.addRoute(featureRoute)
await router.replace(router.currentRoute.value.fullPath)`,
          },
        },
        {
          title: '守卫内注册后调用 router.replace',
          description: '当前导航尚未结算，又从 guard 内发起第二次导航。',
          consequence: '控制流难以追踪，并可能与原导航竞态。',
          wrong: {
            lang: 'ts',
            content: `router.beforeEach(() => {
  router.addRoute(route)
  router.replace('/feature')
})`,
          },
          correct: {
            lang: 'ts',
            content: `router.beforeEach((to) => {
  router.addRoute(route)
  return to.fullPath
})`,
          },
        },
        {
          title: '动态注册条件永远不收敛',
          description: '返回位置后 guard 会对新导航再次运行。',
          consequence: '同一地址持续重定向，页面永远无法 ready。',
          wrong: {
            lang: 'ts',
            content: `if (needsFeature(to)) {
  router.addRoute(route)
  return to.fullPath
}`,
          },
          correct: {
            lang: 'ts',
            content: `if (!router.hasRoute(route.name)) {
  router.addRoute(route)
  return to.fullPath
}`,
          },
        },
        {
          title: '忽略 route name 的全局唯一性',
          description: '同名 addRoute 会先移除旧记录。',
          consequence: '另一个模块的 route、children 与 aliases 被意外替换。',
          wrong: { lang: 'ts', content: `router.addRoute({ name: 'settings', ...pluginRoute })` },
          correct: { lang: 'ts', content: `const pluginRouteName = Symbol('plugin-settings')` },
        },
        {
          title: '移除 parent 后仍依赖 child 或 alias',
          description: 'matcher 会递归移除 parent 的 children 与 aliases。',
          consequence: '菜单仍展示链接，但 resolve 已落入 fallback。',
          wrong: {
            lang: 'ts',
            content: `router.removeRoute('admin')
router.push({ name: 'admin-settings' })`,
          },
          correct: {
            lang: 'ts',
            content: `router.removeRoute('admin')
removeAdminMenuItems()`,
          },
        },
        {
          title: '把 getRoutes 的内部字段当应用协议',
          description: 'matcher score、regex 等实现字段不是公开 RouteRecord contract。',
          consequence: 'Vue Router 升级后菜单或权限逻辑静默失效。',
          wrong: { lang: 'ts', content: `router.getRoutes().sort((a, b) => b.score - a.score)` },
          correct: {
            lang: 'ts',
            content: `router.getRoutes().map(({ name, path, meta }) => ({ name, path, meta }))`,
          },
        },
        {
          title: '自定义链接只监听 click，不输出 href',
          description: '按钮式导航失去链接的原生语义。',
          consequence: '无法复制地址、预览状态栏、键盘打开或新标签访问。',
          wrong: { lang: 'vue', content: `<span @click="router.push(to)"><slot /></span>` },
          correct: { lang: 'vue', content: `<a :href="href" @click="navigate"><slot /></a>` },
        },
        {
          title: '手写 router.push 取代 useLink.navigate',
          description: '手写 handler 通常遗漏修饰键、右键、preventDefault 与 target 旁路。',
          consequence: 'Ctrl/Meta click 不能按浏览器预期打开新标签。',
          wrong: {
            lang: 'vue',
            content: `<a :href="href" @click.prevent="router.push(to)">打开</a>`,
          },
          correct: { lang: 'vue', content: `<a :href="href" @click="navigate">打开</a>` },
        },
        {
          title: 'active 链接只改变颜色',
          description: '颜色不是辅助技术可读取的当前页状态。',
          consequence: '视觉上可辨认，屏幕阅读器却无法知道当前位置。',
          wrong: { lang: 'vue', content: `<a :class="{ active: isExactActive }">当前页</a>` },
          correct: {
            lang: 'vue',
            content: `<a :aria-current="isExactActive ? 'page' : undefined">当前页</a>`,
          },
        },
        {
          title: '把外部 URL 交给 RouterLink',
          description: 'client router 的 location contract 面向站内 route。',
          consequence: '外链被当成本地路径解析，或新窗口缺少 opener 隔离。',
          wrong: {
            lang: 'vue',
            content: `<RouterLink to="https://router.vuejs.org/">官网</RouterLink>`,
          },
          correct: {
            lang: 'vue',
            content: `<a href="https://router.vuejs.org/" target="_blank" rel="noopener noreferrer">官网</a>`,
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. matcher 与 currentRoute 是两个提交面',
          content:
            'Router 的 add/remove/has/get 直接委托 matcher，只有导航 finalize 才写 currentRoute。插件加载完成可先注册一组记录，再用一次 replace 统一提交当前视图。',
        },
        {
          title: '2. 同名替换适合明确所有权，不适合隐式覆盖',
          content:
            'matcher 在插入具名记录前移除旧记录。单一模块热更新可利用该语义；跨插件协作则应分配稳定命名空间或 Symbol，避免把替换当成去重。',
        },
        {
          title: '3. disposer 绑定本次 matcher 身份',
          content:
            'addRoute 返回的函数捕获本次 matcher；记录已经被替换时旧 disposer 再执行是 no-op，不会按同名误删新记录。适合组件或插件在自己的 teardown 中清理所有权明确的 route。',
        },
        {
          title: '4. parent 移除是一棵 matcher 子树操作',
          content:
            'remove 会递归 children 与 aliases，并同步 name map。权限撤销或插件卸载时可一次清理整棵路由子树，但菜单、缓存与业务状态仍需由各自所有者清理。',
        },
        {
          title: '5. useLink 的 route 与 href 都是 computed',
          content:
            'props.to 或当前 route 改变时会重新 resolve 并派生 active。适合主题化链接、菜单项和埋点包装，不需要复制 RouterLink 的解析算法。',
        },
        {
          title: '6. active 不能充当即时 matcher inventory',
          content:
            'useLink 的 resolved route 是 computed，但 matcher 数组本身不是响应式依赖。只调用 add/remove 时，to 与 current route 都未变化，active 可以保留旧快照；显式导航或改变 to 后才重新求值。注册状态应读取 hasRoute/getRoutes。',
        },
        {
          title: '7. guardEvent 是浏览器语义的公共边界',
          content:
            'navigate 先过滤修饰键、非左键、defaultPrevented 与 `_blank`，再 preventDefault 并调用 Router。测试自定义链接时应覆盖这些公开行为，不依赖私有函数名称。',
        },
        {
          title: '8. RouterLink 与 useLink 共用同一行为 seam',
          content:
            'RouterLink 本身调用 useLink 后选择默认 `<a>` 或 custom slot。组件库可以按渲染复杂度选择 slot 或组合函数，但 active 与 navigate 的业务含义应保持一致。',
        },
      ],
    },
    {
      type: 'checklist',
      items: [
        { label: '明确 route 的注册所有者，并保存 addRoute disposer' },
        { label: 'matcher 改变后按场景 replace 当前地址或在 guard 中 return location' },
        { label: '用 hasRoute/getRoutes 的公开字段建立可观察状态' },
        { label: '自定义内部链接保留 href、navigate 与 aria-current' },
        { label: '让修饰键、右键和 _blank 继续使用浏览器原生行为' },
        { label: '外部 URL 使用带安全 rel 的原生链接' },
      ],
    },
  ],
  recap: [
    '动态注册只改变 matcher，显式导航才会重新提交 current route 与 RouterView。',
    '守卫内通过 return location 收敛注册流程，组件中则可 await replace 当前地址。',
    '同名替换、removeRoute 与 disposer 都要建立清晰的 route 所有权。',
    'useLink 复用 RouterLink 的 href、active、exact 与标准 navigate 行为。',
    '外部 URL 属于浏览器原生链接边界，不应交给 client router。',
  ],
})
