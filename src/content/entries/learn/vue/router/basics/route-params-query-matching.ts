/**
 * 课程：路由参数、查询与匹配
 * 查证日期：2026-08-03
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 Guide/API 与 vuejs/router v5.2.0 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const firstRouterId = 'vue.router.learn.basics.setup-first-router'
const linkViewId = 'vue.router.learn.basics.router-link-view-active'

export const meta = defineLessonMeta({
  id: 'vue.router.learn.basics.route-params-query-matching',
  type: 'lesson',
  title: '路由参数、查询与匹配',
  summary: '读懂动态路径、params、query 与 hash，并观察同一路由组件如何复用',
  ecosystem: 'vue',
  module: 'router',
  collection: 'basics',
  level: 'beginner',
  prerequisites: [firstRouterId, linkViewId],
  related: [linkViewId, 'vue.core.learn.basics.watchers'],
  tags: ['Vue Router', 'params', 'query', 'route matching', 'router.resolve'],
  sources: [
    {
      title: 'Vue Router：Dynamic Route Matching',
      url: 'https://router.vuejs.org/guide/essentials/dynamic-matching.html',
    },
    {
      title: 'Vue Router：Routes Matching Syntax',
      url: 'https://router.vuejs.org/guide/essentials/route-matching-syntax.html',
    },
    {
      title: 'Vue Router：Programmatic Navigation',
      url: 'https://router.vuejs.org/guide/essentials/navigation.html',
    },
    {
      title: 'Vue Router API：RouteLocationNormalizedLoaded',
      url: 'https://router.vuejs.org/api/type-aliases/routelocationnormalizedloaded',
    },
    {
      title: 'Vue Router 5.2.0 matcher 源码',
      url: 'https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/matcher',
    },
    {
      title: 'Vue Router 5.2.0 query.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/query.ts',
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-03',
  estimatedMinutes: 50,
})

export default defineLesson({
  meta,
  objectives: [
    '从动态路径中读取单值、可选、重复与 catch-all 参数',
    '区分 path params、query 和 hash 的职责与数据形态',
    '用命名位置和 router.resolve() 生成经过编码的目标地址',
    '理解 custom regex、记录评分和高代价匹配边界',
    '在同一路由记录复用组件时只响应需要的参数变化',
  ],
  blocks: [
    { type: 'heading', content: '先把一条地址拆成三类状态' },
    {
      type: 'text',
      content:
        '路由记录的 path 决定 pathname 如何匹配，并把动态 segment 写入 route.params。问号后的 query 由独立解析器处理，井号后的 hash 原样表示页面内位置。三者都会出现在当前 route 中，但只有 pathname 参与选择 route record；不要把 query 当成路径匹配条件。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// URL: /users/42?tab=activity#history
const route = {
  path: '/users/42',
  params: { id: '42' },
  query: { tab: 'activity' },
  hash: '#history',
}`,
    },
    {
      type: 'table',
      headers: ['地址部分', 'route 字段', '主要职责'],
      rows: [
        ['/users/42', 'path + params.id', '选择记录并标识路径实体'],
        ['?tab=activity', 'query.tab', '表达筛选、排序、分页或视图状态'],
        ['#history', 'hash', '表达页面内锚点或局部位置'],
      ],
    },
    { type: 'heading', content: '参数修饰符决定是否存在以及数据形态' },
    {
      type: 'text',
      content:
        '普通参数只消费一个 segment，得到 string。问号让参数可选；星号和加号让参数可重复，因此得到 string[]。星号允许空数组，加号至少需要一个值。custom regex 放在参数名后的括号中，用于限制单个参数可接受的字符。',
    },
    {
      type: 'table',
      headers: ['记录 path', '可匹配示例', 'params 形态'],
      rows: [
        ['/users/:id', '/users/42', "{ id: '42' }"],
        ['/users/:id?', '/users 或 /users/42', "{} 或 { id: '42' }"],
        ['/tags/:tags+', '/tags/vue/router', "{ tags: ['vue', 'router'] }"],
        ['/:pathMatch(.*)*', '/missing/guide', "{ pathMatch: ['missing', 'guide'] }"],
        ['/:orderId(\\d+)', '/25', "{ orderId: '25' }"],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '路径配置写在 JavaScript 字符串中时，正则反斜杠还要经过字符串转义。数字规则应写成 :orderId(\\\\d+)，否则传给 matcher 的不是预期正则。',
    },
    { type: 'heading', content: '用命名位置让 router 负责拼接与编码' },
    {
      type: 'text',
      content:
        'router.resolve() 与 router.push() 接受相同的位置对象。提供 name 与 params 时，matcher 会按记录规则 stringify 参数并编码 segment；resolve() 不发起导航，适合在执行前检查 href、matched 与标准化后的 params。重复参数在命名位置中也必须传数组。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const target = router.resolve({
  name: 'tag-results',
  params: { tags: ['vue', 'router'] },
  query: { sort: 'recent' },
  hash: '#examples',
})

target.href
// /tags/vue/router?sort=recent#examples`,
    },
    {
      type: 'compare',
      labels: ['path + params', 'name + params'],
      before: "router.resolve({ path: '/users', params: { id: '42' } })：params 被忽略。",
      after: "router.resolve({ name: 'user', params: { id: '42' } })：得到 /users/42。",
    },
    { type: 'heading', content: '同一记录的新参数会复用组件实例' },
    {
      type: 'text',
      content:
        '从 /users/42 到 /users/84 仍匹配同一个 route record，Vue Router 会复用已挂载的用户组件。setup() 与 onMounted() 不会重新执行，因此依赖 id 的请求或派生状态必须显式响应参数变化。通常只 watch route.params.id，不要 watch 整个响应式 route。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

/** 只在用户标识变化时重新读取用户数据。 */
async function loadUser(id: string) {
  // await userService.get(id)
}

watch(
  () => route.params.id,
  (id) => loadUser(String(id)),
  { immediate: true },
)
</script>`,
    },
    { type: 'heading', content: '在隔离 Demo 中观察解析与复用' },
    {
      type: 'text',
      content:
        '下面的运行区创建独立 memory router，在用户、重复 tags 与 catch-all 三条记录间切换。可见区展示 resolve href、pathname、matched、params 的 string/array 形态、query/hash、导航结果与事件时间线；连续切换两个用户时，挂载次数保持不变而参数变化次数增加。',
    },
    {
      type: 'demo',
      id: 'vue.router.learn.basics.route-params-query-matching.route-matching-lab-demo',
      description: '比较单值与重复参数、resolve 结果和同记录组件复用',
      playground: true,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '同时提供 path 和 params',
          description:
            '官方位置规则会在提供 path 时忽略 params，因为 path 已经是完整 pathname 输入。query 不受这一限制。',
          consequence: '代码看似传了用户 id，最终地址却仍是 /users，页面匹配到错误记录。',
          wrong: {
            lang: 'ts',
            content: `router.push({ path: '/users', params: { id: '42' } })`,
          },
          correct: {
            lang: 'ts',
            content: `router.push({ name: 'user', params: { id: '42' } })`,
          },
        },
        {
          title: '给重复参数传单个字符串或空值',
          description:
            '星号与加号参数在命名导航中使用数组。加号要求至少一个元素，星号才允许空数组。',
          consequence: 'resolve() 可能抛出缺少必需参数的错误，或生成与预期层级不同的 URL。',
          wrong: {
            lang: 'ts',
            content: `router.resolve({ name: 'tags', params: { tags: [] } }) // :tags+`,
          },
          correct: {
            lang: 'ts',
            content: `router.resolve({ name: 'tags', params: { tags: ['vue', 'router'] } })`,
          },
        },
        {
          title: '侦听整个 route 对象',
          description:
            'route 是包含 params、query、hash、matched 等字段的响应式对象；整对象侦听把无关变化也纳入副作用。',
          consequence: '只切换 tab query 也可能重复请求用户数据，难以判断真正依赖。',
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
          title: '把 query 写成 route record 的匹配条件',
          description: 'route record 只用 pathname 进行匹配，query 在记录确定后由独立解析器处理。',
          consequence:
            '为不同 query 重复声明相同 path 不会得到可靠的记录分支，还会让配置意图模糊。',
          wrong: {
            lang: 'ts',
            content: `{ path: '/search?mode=advanced', component: AdvancedSearch }`,
          },
          correct: {
            lang: 'ts',
            content: `{ path: '/search', component: SearchPage } // 组件读取 route.query.mode`,
          },
        },
        {
          title: '在非末尾位置组合贪婪正则与重复修饰符',
          description:
            '像 (.*)* 这样的贪婪正则若后面还有静态 segment，回溯成本可能很高。官方建议 match-all 放在末尾。',
          consequence: '特定长 URL 会显著拖慢匹配，甚至阻塞导航响应。',
          wrong: {
            lang: 'ts',
            content: `{ path: '/:pathMatch(.*)*/details' }`,
          },
          correct: {
            lang: 'ts',
            content: `{ path: '/:pathMatch(.*)*' } // catch-all 位于末尾`,
          },
        },
        {
          title: '忘记转义 custom regex 的反斜杠',
          description: '正则写在 JavaScript 字符串内，要先通过字符串转义再交给路径 tokenizer。',
          consequence: '本想只匹配数字的记录可能无法命中，或与普通字符串记录产生意外竞争。',
          wrong: {
            lang: 'ts',
            content: String.raw`{ path: '/:orderId(\d+)' }`,
          },
          correct: {
            lang: 'ts',
            content: String.raw`{ path: '/:orderId(\\d+)' }`,
          },
        },
        {
          title: '假设参数变化一定会重新挂载组件',
          description:
            '两个位置命中同一 route record 时会复用组件实例，生命周期初始化不会自动重跑。',
          consequence: '地址已经从用户 42 变为 84，页面仍显示旧数据。',
          wrong: {
            lang: 'ts',
            content: `onMounted(() => loadUser(String(route.params.id)))`,
          },
          correct: {
            lang: 'ts',
            content: `watch(() => route.params.id, (id) => loadUser(String(id)), { immediate: true })`,
          },
        },
        {
          title: '把带静态字符的可选参数当成整个 segment 可选',
          description:
            '当一个 segment 不只包含可选参数时，静态字符仍然存在；例如 :uid?-:name? 不会直接匹配 /users。',
          consequence:
            '列表页缺少参数时得到 404，只有保留静态连字符的 /users/- 或 /users/-/ 才会命中。',
          wrong: {
            lang: 'ts',
            content: `{ path: '/users/:uid?-:name?' }`,
          },
          correct: {
            lang: 'ts',
            content: `{ path: '/users/:uid?' } // 复杂可选组合拆成清晰记录`,
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '用 tokenizer 结果判断 params 的稳定形态',
          content:
            '路径 tokenizer 会记录参数是否 optional、repeatable 以及 regexp；matcher 的 parse 再按这些参数键把正则捕获值标准化为 string 或 string[]。普通参数适合单实体标识，repeatable 参数适合层级标签或未知深度路径。',
        },
        {
          title: '让 score 排序解决静态与动态记录竞争',
          content:
            'matcher 为静态 segment、动态参数和 custom regex 计算分数。需要区分数字订单与文本商品时，可用 custom regex 表达约束，不依赖 routes 数组偶然顺序。',
        },
        {
          title: '通过命名位置复用 stringify 与编码',
          content:
            'name + params 会找到目标 matcher，再按 token 规则生成 path。实体 id、可重复 tags 和 catch-all 数组应交给该 seam，避免手写 encodeURIComponent 拼接。',
        },
        {
          title: '把 query 交给独立的 parse/stringify seam',
          content:
            'parseQuery() 将重复 key 累积为数组，并区分无等号的 null 与普通字符串；stringifyQuery() 再将 string、null 和数组编码回 query string。两者与 pathname matcher 独立，自定义 query 规则时必须成对传入并保持可往返。',
        },
        {
          title: '用 resolve 做导航前的纯解析检查',
          content:
            'resolve() 返回 href、matched、params、query 与 hash，但不提交 history。生成预览链接、规范化外部输入或测试路由配置时，可先观察解析结果。',
        },
        {
          title: '把组件复用当成连续实体视图',
          content:
            '同记录参数变化保留组件实例，适合用户、文章、项目等同构详情页维持局部 UI；数据副作用只订阅实体参数，并显式处理竞态。',
        },
        {
          title: '把 catch-all 保留在普通记录之后',
          content:
            'catch-all 用 repeatable custom regex 接住未知剩余 segment，并保留数组形态以支持命名跳转。它适合 404 或文件路径，不应替代结构清晰的业务记录。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '设计一个可解析的文档地址',
      instructions:
        '声明 /docs/:segments+ 和 /users/:id 两条记录。分别用 router.resolve() 生成两级文档地址与用户 42 的 activity query，写出 href、params 数据形态，并说明用户 42 切到 84 时组件为何复用。',
      answer: `const docs = router.resolve({
  name: 'docs',
  params: { segments: ['vue', 'router'] },
})
// href: /docs/vue/router
// params: { segments: ['vue', 'router'] }

const user = router.resolve({
  name: 'user',
  params: { id: '42' },
  query: { tab: 'activity' },
})
// href: /users/42?tab=activity
// params: { id: '42' }

// 42 -> 84 仍命中 user record，所以组件复用；只需响应 params.id。`,
    },
    {
      type: 'checklist',
      items: [
        { label: 'path params、query 与 hash 的职责分开' },
        { label: 'repeatable params 在命名位置中使用数组' },
        { label: '优先使用 name + params 交给 router 编码' },
        { label: 'custom regex 正确转义且避免高代价回溯' },
        { label: '组件复用时只侦听需要的参数字段' },
      ],
    },
  ],
  exercises: ['把 tags 数组改为三个 segment，先 resolve 再导航，并核对 params 仍为 string[]。'],
  recap: [
    'pathname 选择 route record，params 来自动态 segment；query 与 hash 由独立字段承载。',
    '普通参数是 string，repeatable 参数是 string[]，加号至少需要一个值。',
    'name + params 让 router 按记录规则生成并编码 URL，path + params 会忽略 params。',
    'custom regex 可缩小匹配范围，但要正确转义并避免贪婪重复造成高代价回溯。',
    '同记录参数变化会复用组件实例，应定向侦听 route.params 中真正依赖的字段。',
  ],
})
