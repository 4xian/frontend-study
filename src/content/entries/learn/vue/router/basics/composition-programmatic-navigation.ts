/**
 * 课程：组合式 API 与编程式导航
 * 查证日期：2026-08-03
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 Guide/API 与 vuejs/router v5.2.0 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const matchingEntryId = 'vue.router.learn.basics.route-params-query-matching'
const nestedEntryId = 'vue.router.learn.basics.nested-routes'

export const meta = defineLessonMeta({
  id: 'vue.router.learn.basics.composition-programmatic-navigation',
  type: 'lesson',
  title: '组合式 API 与编程式导航',
  summary: '用当前 route 组织响应式逻辑，用 router 命令明确控制导航和历史',
  ecosystem: 'vue',
  module: 'router',
  collection: 'basics',
  level: 'beginner',
  prerequisites: [matchingEntryId, nestedEntryId],
  related: [matchingEntryId, nestedEntryId, 'vue.core.learn.basics.watchers'],
  tags: ['Vue Router', 'useRouter', 'useRoute', 'programmatic navigation', 'navigation guards'],
  sources: [
    {
      title: 'Vue Router：Composition API',
      url: 'https://router.vuejs.org/guide/advanced/composition-api.html',
    },
    {
      title: 'Vue Router：Programmatic Navigation',
      url: 'https://router.vuejs.org/guide/essentials/navigation.html',
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
      title: 'Vue Router 5.2.0 useApi.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/useApi.ts',
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-03',
  estimatedMinutes: 55,
})

export default defineLesson({
  meta,
  objectives: [
    '区分 useRoute() 返回的响应式导航状态与 useRouter() 返回的命令对象',
    '用 push、replace 和 go 表达不同的历史记录意图',
    '等待导航 Promise 并根据最终结果更新界面',
    '只侦听 route.params 中真正驱动副作用的字段',
    '用 update/leave guard 分别处理组件复用和离开记录',
  ],
  blocks: [
    { type: 'heading', content: 'route 描述现在，router 提交下一步' },
    {
      type: 'text',
      content:
        'useRoute() 返回当前标准化 route 的响应式视图，适合读取 params、query、hash 与 matched。useRouter() 返回已安装的 router 实例，用来 push、replace、go 或注册全局能力。前者是状态入口，后者是命令入口。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

/** 保留当前 query，并导航到下一个用户。 */
async function openUser(id: string) {
  await router.push({ name: 'user', params: { id }, query: route.query })
}
</script>`,
    },
    { type: 'heading', content: 'push 与 replace 改变的是历史语义' },
    {
      type: 'table',
      headers: ['方法', '对历史的影响', '常见用途'],
      rows: [
        ['router.push(to)', '在当前位置后新增一条', '进入可回退的新页面'],
        ['router.replace(to)', '覆盖当前条目', '登录回跳、默认参数规范化'],
        ['router.go(delta)', '移动历史指针', '返回或前进已存在的条目'],
      ],
    },
    {
      type: 'text',
      content:
        'push() 与 replace() 都走完整导航流程，并返回可等待的 Promise。成功时 Promise 解析为 undefined，被守卫取消或发生重复导航时会解析为 NavigationFailure。go() 委托给 history 移动指针，本身不返回导航 Promise。',
    },
    {
      type: 'compare',
      labels: ['replace 前', 'replace 后'],
      before: '历史：/users/1 → /users/2；指针在 /users/2。',
      after: '执行 replace(/users/3) 后：/users/1 → /users/3；没有新增第三条。',
    },
    { type: 'heading', content: '只让真正的依赖驱动副作用' },
    {
      type: 'text',
      content:
        'route 是响应式对象，但这不意味着要 watch 整个 route。用户数据只依赖 params.id 时，侦听 getter 即可；单纯改变 query 不应重读用户。同一记录的参数变化会复用组件，onBeforeRouteUpdate() 则适合在提交前校验或预取。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const route = useRoute()

watch(
  () => route.params.id,
  (id) => loadUser(String(id)),
  { immediate: true },
)

onBeforeRouteUpdate((to, from) => {
  if (to.params.id === from.params.id) return
  // 参数导航提交前校验或预取
})`,
    },
    { type: 'heading', content: 'leave guard 保护真正的离开动作' },
    {
      type: 'text',
      content:
        'onBeforeRouteLeave() 只在当前组件要离开其激活记录时执行。从 /users/1 到 /users/2 复用同一记录，走 update guard；从 /users/2 到 /done 才走 leave guard。未保存时返回 false 会取消本次导航，当前位置和历史指针都应保持不变。',
    },
    { type: 'heading', content: '在隔离 Demo 中对比命令与守卫' },
    {
      type: 'text',
      content:
        '下面的 mini-app 从 /users/1 开始：push 新增用户 2，replace 用用户 3 覆盖当前条目，go(-1) 回到用户 1。它同时展示定向 watch、update/leave guard 计数和导航结果；勾选“有未保存更改”后，离开用户记录会被拒绝。',
    },
    {
      type: 'demo',
      id: 'vue.router.learn.basics.composition-programmatic-navigation.composition-navigation-lab-demo',
      description: '对比 push、replace、go、定向 watch 与组件内守卫',
      playground: true,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '侦听整个 route 对象',
          description:
            'route 包含 params、query、hash 和 matched 等多类响应式状态，整体侦听会扩大副作用边界。',
          consequence: '只切换 tab query 也重新请求用户数据，增加竞态和无效流量。',
          wrong: {
            lang: 'ts',
            content: `watch(route, () => loadUser(String(route.params.id)))`,
          },
          correct: {
            lang: 'ts',
            content: `watch(() => route.params.id, (id) => loadUser(String(id)))`,
          },
        },
        {
          title: '在没有注入上下文的普通模块顶层调用 composable',
          description:
            'useRouter() 与 useRoute() 通过 Vue inject 读取 router 提供的 key，需要处于已安装 router 的组件 setup 上下文。',
          consequence: '得到缺失注入的值，后续调用 push 或读取 params 时立即失败。',
          wrong: {
            lang: 'ts',
            content: `// services/navigation.ts
const router = useRouter()`,
          },
          correct: {
            lang: 'ts',
            content: `// 组件 setup 内
const router = useRouter()`,
          },
        },
        {
          title: '不等待导航 Promise 就宣布成功',
          description:
            'push() 和 replace() 需要经过匹配、守卫与最终提交，返回的 Promise 才代表该次导航已结束。',
          consequence: '导航被取消时仍关闭编辑器或提示“保存成功”，界面与 URL 状态脱节。',
          wrong: {
            lang: 'ts',
            content: `router.push('/done')
showSuccess()`,
          },
          correct: {
            lang: 'ts',
            content: `const failure = await router.push('/done')
if (!failure) showSuccess()`,
          },
        },
        {
          title: '把 route 当成导航命令对象',
          description: 'route 提供当前位置的标准化响应式状态，不提供 push、replace 或 go。',
          consequence: '调用不存在的方法，或试图直接改 params 却没有任何导航。',
          wrong: {
            lang: 'ts',
            content: `const route = useRoute()
route.push('/done')`,
          },
          correct: {
            lang: 'ts',
            content: `const router = useRouter()
await router.push('/done')`,
          },
        },
        {
          title: '期望 replace 新增一条可回退历史',
          description: 'replace() 会在导航成功时覆盖当前历史条目，而不是向后追加。',
          consequence: '用户按返回键跳过被覆盖的页面，与产品预期的导航路径不同。',
          wrong: {
            lang: 'ts',
            content: `await router.replace('/checkout') // 期望返回到当前表单`,
          },
          correct: {
            lang: 'ts',
            content: `await router.push('/checkout') // 需要保留当前表单时`,
          },
        },
        {
          title: '用 window.history 绕过 router',
          description:
            'Vue Router 的导航方法会先解析记录并执行守卫；直接修改浏览器 history 不等价。',
          consequence: 'URL 可能改变，但 currentRoute、视图和守卫状态没有同步进入目标位置。',
          wrong: {
            lang: 'ts',
            content: `window.history.pushState({}, '', '/users/2')`,
          },
          correct: {
            lang: 'ts',
            content: `await router.push({ name: 'user', params: { id: '2' } })`,
          },
        },
        {
          title: '把 update guard 和 leave guard 用反',
          description:
            'update guard 处理同记录复用时的参数变化，leave guard 处理组件即将离开激活记录。',
          consequence: '切换用户时未校验新 id，真正离开编辑页时又没有阻止未保存更改。',
          wrong: {
            lang: 'ts',
            content: `onBeforeRouteUpdate(() => hasUnsavedChanges.value ? false : undefined)`,
          },
          correct: {
            lang: 'ts',
            content: `onBeforeRouteLeave(() => hasUnsavedChanges.value ? false : undefined)`,
          },
        },
        {
          title: '对 router.go() 使用 await 并假设已完成导航',
          description: 'go(delta) 返回 void，它只要求 history 移动指针，不提供可等待的导航结果。',
          consequence: 'await 会立即继续，后续代码读到的可能还是旧 currentRoute。',
          wrong: {
            lang: 'ts',
            content: `await router.go(-1)
readCurrentPage()`,
          },
          correct: {
            lang: 'ts',
            content: `router.go(-1)
// 在 afterEach 或 currentRoute 侦听中响应最终位置`,
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. useApi 只暴露当前注入上下文',
          content:
            'useRouter() 和 useRoute() 分别 inject routerKey 与 routeLocationKey。组件内需要当前 router 时使用 composable；独立 service 需要导航时，应显式传入 router 或在应用组装层调用，不要伪造全局注入上下文。',
        },
        {
          title: '2. push 与 replace 共享导航管线',
          content:
            'replace() 会把 replace 标记带入和 push() 相同的导航入口；两者都先解析 target、运行 guards，只在最终提交 history 时选择 push 或 replace。因此业务后续动作应等待 Promise，而不应根据方法名推测守卫已通过。',
        },
        {
          title: '3. 组件 guard 跟随激活 record 生命周期',
          content:
            'onBeforeRouteUpdate() 和 onBeforeRouteLeave() 把 guard 放入当前 matched record 的对应集合，并在组件卸载时移除。这些 guard 适合与当前视图共生的参数预取或未保存表单；跨页权限规则则应留在后续全局守卫课程。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '设计一条可回退的编辑流程',
      instructions:
        '从 /users/1 出发，用 push 进入用户 2，再用 replace 把当前条目改为用户 3。写出此时的历史序列、go(-1) 的目标，并说明哪些操作触发 update guard。',
      answer: `// 初始：[/users/1]
await router.push('/users/2')
// [/users/1, /users/2]

await router.replace('/users/3')
// [/users/1, /users/3]

router.go(-1)
// 目标是 /users/1

// 三次导航都在同一 user record 内改变 id，会触发 update guard。`,
    },
    {
      type: 'checklist',
      items: [
        { label: 'route 只负责当前状态，router 负责导航命令' },
        { label: 'push 新增历史，replace 覆盖当前条目' },
        { label: 'push/replace 的后续逻辑等待导航 Promise' },
        { label: '只侦听真正驱动副作用的 route 字段' },
        { label: 'update 与 leave guard 按记录生命周期分工' },
      ],
    },
  ],
  exercises: ['勾选未保存更改后离开用户页，核对导航失败时历史指针没有变化。'],
  recap: [
    'useRoute() 提供当前响应式 route，useRouter() 提供导航命令。',
    'push 新增历史条目，replace 覆盖当前条目，go 移动指针。',
    'push/replace 返回导航 Promise，go 返回 void。',
    '侦听 route.params.id 比侦听整个 route 更精确。',
    'update guard 处理同记录复用，leave guard 保护离开记录的动作。',
  ],
})
