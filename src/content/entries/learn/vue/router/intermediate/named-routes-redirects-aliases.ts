/**
 * 课程：命名路由、重定向与别名
 * 查证日期：2026-08-04
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 Guide/API 与 vuejs/router v5.2.0 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const matchingEntryId = 'vue.router.learn.basics.route-params-query-matching'
const nestedEntryId = 'vue.router.learn.basics.nested-routes'
const navigationEntryId = 'vue.router.learn.basics.composition-programmatic-navigation'

export const meta = defineLessonMeta({
  id: 'vue.router.learn.intermediate.named-routes-redirects-aliases',
  type: 'lesson',
  title: '命名路由、重定向与别名',
  summary: '用稳定名称生成地址，并区分重定向替换 URL 与别名保留 URL 的匹配语义',
  ecosystem: 'vue',
  module: 'router',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: [matchingEntryId, nestedEntryId, navigationEntryId],
  related: [matchingEntryId, nestedEntryId, navigationEntryId],
  tags: ['Vue Router', 'named routes', 'redirect', 'alias', 'route matching'],
  sources: [
    {
      title: 'Vue Router：Named Routes',
      url: 'https://router.vuejs.org/guide/essentials/named-routes',
    },
    {
      title: 'Vue Router：Redirect and Alias',
      url: 'https://router.vuejs.org/guide/essentials/redirect-and-alias',
    },
    {
      title: 'Vue Router API：RouteRecordRaw',
      url: 'https://router.vuejs.org/api/type-aliases/routerecordraw',
    },
    {
      title: 'Vue Router 5.2.0 matcher/index.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/matcher/index.ts',
    },
    {
      title: 'Vue Router 5.2.0 router.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts',
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  estimatedMinutes: 60,
})

export default defineLesson({
  meta,
  objectives: [
    '用唯一 route name 和 params 生成经过编码的目标地址',
    '理解按 name 解析会直接选择记录，而按 path 解析仍需路径排序',
    '区分 redirect 替换输入 URL 与 alias 保留输入 URL',
    '判断 redirect record 与最终匹配 record 各自会运行哪些守卫',
    '正确配置嵌套路由的相对、绝对和带参数 alias',
  ],
  blocks: [
    { type: 'heading', content: 'name 是记录身份，不是路径的第二份文案' },
    {
      type: 'text',
      content:
        '给 route record 配置唯一 name 后，RouterLink、push()、replace() 和 resolve() 都可以用 name 加 params 表达目标。路由器会负责 params 编码，并直接选择这个具名记录；如果传 path，则仍由 path matcher 的排序结果决定命中哪条记录。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const routes = [
  { path: '/profiles/new', name: 'profile-create', component: ProfileCreate },
  { path: '/profiles/:username', name: 'profile-main', component: ProfilePage },
]

// 即使生成的路径也能被静态记录匹配，name 仍明确指向 profile-main。
await router.push({ name: 'profile-main', params: { username: 'new' } })

// 参数中的空格、斜杠和非 ASCII 字符由路由器编码。
router.resolve({ name: 'profile-main', params: { username: 'Jian Li/演示' } }).href`,
    },
    {
      type: 'table',
      headers: ['location 写法', '记录选择', 'params 处理'],
      rows: [
        ['{ name, params }', '由唯一 name 直接选择记录', '按记录参数规则编码并生成 path'],
        ['{ path } 或字符串', '由 path matcher 排序后选择记录', 'path 已经成形，不再读取 params'],
      ],
    },
    { type: 'heading', content: 'redirect 换地址，alias 留地址' },
    {
      type: 'compare',
      labels: ['redirect', 'alias'],
      before:
        '访问 /legacy/alice，redirect 重新解析到 /directory/profiles/alice；最终 URL 是目标地址，redirectedFrom 保留来源。',
      after:
        '访问 /members/alice，URL 仍是 /members/alice；matched 使用原记录的组件与配置，aliasOf 指向原记录。',
    },
    {
      type: 'text',
      content:
        'redirect record 只描述转向目标，不需要 component。导航在提取该记录的 beforeEnter 之前就会重新解析目标，所以 redirect record 自己的守卫不会运行；目标记录的守卫照常运行。若 redirect record 同时声明 children，它仍需要 component 提供 RouterView 承载子记录。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const routes = [
  {
    path: '/legacy/:username',
    redirect: (to) => ({
      name: 'profile-main',
      params: { username: to.params.username },
      query: to.query,
    }),
  },
  {
    path: '/directory/profiles/:username',
    name: 'profile-main',
    component: ProfilePage,
    alias: '/members/:username',
  },
]`,
    },
    { type: 'heading', content: '嵌套 alias 先判断相对还是绝对' },
    {
      type: 'text',
      content:
        '嵌套记录中的 alias 不以 / 开头时，会相对父路径展开；以 / 开头时是绝对地址。绝对 alias 虽然不包含父路径片段，仍按原记录的父子链渲染。原路径含参数时，绝对 alias 也必须包含对应参数，否则无法生成相同的匹配数据。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `{
  path: '/directory',
  component: DirectoryLayout,
  children: [
    {
      path: 'profiles/:username',
      component: ProfilePage,
      // 相对 alias 与绝对 alias 都保留 :username。
      alias: ['alternative/:username', '/members/:username'],
    },
  ],
}`,
    },
    { type: 'heading', content: '在隔离 Demo 中比较三条入口' },
    {
      type: 'text',
      content:
        '下面的 mini-app 每次都先回到 /start 中立页，再分别按 name、redirect 和绝对 alias 进入同一个目标组件。可见状态同时展示输入 location、最终 pathname、matched names、aliasOf、params/query、record guard 轨迹、导航结果和宿主 URL。',
    },
    {
      type: 'demo',
      id: 'vue.router.learn.intermediate.named-routes-redirects-aliases.named-routes-redirects-aliases-lab-demo',
      description: '从中立页比较 name、redirect 与 alias 的地址和守卫语义',
      playground: true,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '在不同记录上复用同一个 name',
          description:
            'route name 在整个 router 内必须唯一，后加入的同名记录会替换 name map 中的旧记录。',
          consequence: '按 name 导航不再进入原记录，依赖旧记录的链接和跳转悄然改向。',
          wrong: {
            lang: 'ts',
            content: `[{ path: '/users/:id', name: 'detail' }, { path: '/posts/:id', name: 'detail' }]`,
          },
          correct: {
            lang: 'ts',
            content: `[{ path: '/users/:id', name: 'user-detail' }, { path: '/posts/:id', name: 'post-detail' }]`,
          },
        },
        {
          title: '把 params 和 path location 混在一起',
          description:
            '传入 path 时地址已经确定，额外 params 不负责补段，也不会获得具名导航的编码与记录选择语义。',
          consequence: '参数被忽略或手工拼接出未编码地址，最终匹配记录也可能受 path ranking 影响。',
          wrong: {
            lang: 'ts',
            content: `router.push({ path: '/profiles', params: { username: 'Jian Li/演示' } })`,
          },
          correct: {
            lang: 'ts',
            content: `router.push({ name: 'profile-main', params: { username: 'Jian Li/演示' } })`,
          },
        },
        {
          title: '把权限守卫放在 redirect record 上',
          description:
            'redirect 会在该记录的导航守卫被提取前重新解析目标，redirect record 的 beforeEnter 不运行。',
          consequence: '看似存在权限检查，实际导航直接进入目标记录。',
          wrong: {
            lang: 'ts',
            content: `{ path: '/admin', redirect: '/login', beforeEnter: requireAdmin }`,
          },
          correct: {
            lang: 'ts',
            content: `{ path: '/login', component: LoginPage, beforeEnter: validateLoginEntry }`,
          },
        },
        {
          title: '给纯 redirect record 添加无用 component',
          description:
            '没有 children 的 redirect record 不会渲染自身 component，只负责生成新目标。',
          consequence: '读代码的人误以为重定向前会短暂渲染该组件。',
          wrong: {
            lang: 'ts',
            content: `{ path: '/home', component: EmptyPage, redirect: '/' }`,
          },
          correct: {
            lang: 'ts',
            content: `{ path: '/home', redirect: '/' }`,
          },
        },
        {
          title: '把带 children 的 redirect record 也当作无组件记录',
          description:
            '当 redirect record 还负责嵌套 children 时，component 需要提供 RouterView 承载子记录。',
          consequence: '子记录虽然匹配，却没有对应的视图出口。',
          wrong: {
            lang: 'ts',
            content: `{ path: '/settings', redirect: '/settings/profile', children: [profileRoute] }`,
          },
          correct: {
            lang: 'ts',
            content: `{ path: '/settings', component: SettingsLayout, redirect: '/settings/profile', children: [profileRoute] }`,
          },
        },
        {
          title: '用 redirect 实现需要保留的旧地址',
          description:
            'redirect 会把浏览器中的输入地址替换为目标地址；alias 才保留当前 URL 并按原记录匹配。',
          consequence: '分享、统计或兼容层需要保留的地址在导航后消失。',
          wrong: {
            lang: 'ts',
            content: `{ path: '/members/:username', redirect: '/directory/profiles/:username' }`,
          },
          correct: {
            lang: 'ts',
            content: `{ path: '/directory/profiles/:username', component: ProfilePage, alias: '/members/:username' }`,
          },
        },
        {
          title: '嵌套绝对 alias 丢失参数',
          description:
            '以 / 开头的 nested alias 是绝对地址；原记录的动态参数也必须在 alias 中出现。',
          consequence: 'alias 无法提供原组件依赖的 params，或在开发期直接收到配置警告。',
          wrong: {
            lang: 'ts',
            content: `{ path: 'profiles/:username', alias: '/members' }`,
          },
          correct: {
            lang: 'ts',
            content: `{ path: 'profiles/:username', alias: '/members/:username' }`,
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. name map 把记录身份与 path ranking 分开',
          content:
            'matcher 注册具名记录时维护唯一 name map；按 name resolve 会先取出指定 matcher，再用其参数 stringify 生成编码 path。需要稳定指向某条记录时使用 name；需要让地址按静态、动态等路径得分竞争时才传 path。',
        },
        {
          title: '2. redirect 在守卫管线前产生新目标',
          content:
            'router 先解析输入 location，再检查最终匹配记录的 redirect；存在 redirect 时会构造新 location 并重新进入导航入口。因此 redirect record 的 beforeEnter 不会执行，而目标记录守卫仍参与新的完整导航。',
        },
        {
          title: '3. alias matcher 保留原记录关联',
          content:
            'matcher 为 alias 建立可匹配的记录，并通过 aliasOf 关联原记录。地址解析仍保留 alias pathname，但组件、name 和记录行为来自原配置；这适合多个公开 URL 共享同一界面，而不是做地址规范化。',
        },
        {
          title: '4. 嵌套 alias 沿用父子记录关系',
          content:
            'matcher 归一化 children 时分别展开相对与绝对 alias；绝对 alias 可以脱离父 path 文本，但仍保留原记录的 parent 关系。若原 path 有参数，alias 必须携带同名参数，才能提供等价的解析输入。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '为旧用户地址选择 redirect 或 alias',
      instructions:
        '产品要求 /u/:username 继续出现在地址栏，但渲染 /directory/profiles/:username 的同一界面；另一个 /old-users/:username 必须规范化为新地址。分别写出配置并说明最终 URL。',
      answer: `const routes = [
  {
    path: '/directory/profiles/:username',
    name: 'profile-main',
    component: ProfilePage,
    alias: '/u/:username',
  },
  {
    path: '/old-users/:username',
    redirect: (to) => ({
      name: 'profile-main',
      params: { username: to.params.username },
    }),
  },
]

// /u/alice 最终仍显示 /u/alice。
// /old-users/alice 最终显示 /directory/profiles/alice。`,
    },
    {
      type: 'checklist',
      items: [
        { label: '每个 route name 在整个 router 中唯一' },
        { label: '需要 params 编码和稳定记录身份时使用 { name, params }' },
        { label: 'redirect 负责 URL 替换，alias 负责 URL 保留' },
        { label: '权限等守卫放在最终目标记录，而不是 redirect record' },
        { label: 'nested absolute alias 保留原 path 的全部动态参数' },
      ],
    },
  ],
  exercises: ['分别运行三条入口，核对输入 location、最终 pathname 与 aliasOf 的差异。'],
  recap: [
    'name 是全局唯一的记录身份，按 name 导航会编码 params 并绕过 path ranking。',
    'redirect 重新解析目标并替换 URL，redirect record 自身守卫不运行。',
    'alias 保留输入 URL，同时沿用原记录的组件、name 与守卫。',
    '嵌套 alias 是否以 / 开头决定相对或绝对展开。',
    '带参数的原记录要求绝对 alias 也保留相同参数。',
  ],
})
