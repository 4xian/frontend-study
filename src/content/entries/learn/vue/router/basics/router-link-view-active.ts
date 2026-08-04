/**
 * 课程：链接、视图与激活状态
 * 查证日期：2026-08-03
 * 适用版本：Vue Router 5.2.0
 * 查证工具：Tavily、Vue Router 官方 Guide/API 与 vuejs/router v5.2.0 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const firstRouterId = 'vue.router.learn.basics.setup-first-router'

export const meta = defineLessonMeta({
  id: 'vue.router.learn.basics.router-link-view-active',
  type: 'lesson',
  title: '链接、视图与激活状态',
  summary: '用 RouterLink 发出声明式导航，由 RouterView 渲染匹配组件并读懂 active 与 exact',
  ecosystem: 'vue',
  module: 'router',
  collection: 'basics',
  level: 'beginner',
  prerequisites: [firstRouterId],
  related: [firstRouterId, 'vue.core.learn.basics.component-basics'],
  tags: ['Vue Router', 'RouterLink', 'RouterView', 'active', 'aria-current'],
  sources: [
    {
      title: 'Vue Router：Getting Started',
      url: 'https://router.vuejs.org/guide/',
    },
    {
      title: 'Vue Router：Active links',
      url: 'https://router.vuejs.org/guide/essentials/active-links.html',
    },
    {
      title: 'Vue Router API：RouterLink',
      url: 'https://router.vuejs.org/api/variables/routerlink',
    },
    {
      title: 'Vue Router API：RouterView',
      url: 'https://router.vuejs.org/api/variables/routerview',
    },
    {
      title: 'Vue Router 5.2.0 RouterLink.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterLink.ts',
    },
    {
      title: 'Vue Router 5.2.0 RouterView.ts',
      url: 'https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts',
    },
  ],
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-03',
  estimatedMinutes: 40,
})

export default defineLesson({
  meta,
  objectives: [
    '使用 RouterLink 的 to 声明目标位置，而不是手写站内 href',
    '把匹配组件交给 RouterView 渲染',
    '区分 active 与 exact active 的记录层级含义',
    '理解 params 会参与而 query 不参与链接激活判断',
    '只在 exact active 链接上表达 aria-current',
  ],
  blocks: [
    { type: 'heading', content: '链接负责导航，视图负责渲染' },
    {
      type: 'text',
      content:
        'RouterLink 接收 to，把字符串路径或位置对象交给 router.resolve()，并在站内点击时调用 router.push() 或 replace()。RouterView 不发起导航，它只从当前 route 的 matched 链中取出本层记录对应的组件。把两个职责分开后，链接状态和页面渲染都由同一份路由匹配结果驱动。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<nav aria-label="课程导航">
  <RouterLink :to="{ name: 'course-list' }">课程</RouterLink>
  <RouterLink :to="{ name: 'course-detail', params: { id: 'router' } }">
    当前课程
  </RouterLink>
</nav>

<main>
  <RouterView />
</main>`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '位置对象比散落的字符串更能表达意图。命名路由改 path 时，调用处仍可保持不变；需要参数时也能由 router 统一编码。',
    },
    { type: 'heading', content: 'active 与 exact active 比较什么' },
    {
      type: 'text',
      content:
        'RouterLink 先解析 to，再在当前 route.matched 中寻找同一条 route record。找到记录且目标 params 被当前 params 包含时，链接就是 active；exact active 还要求这条记录位于当前 matched 链末端，并且当前与目标 params 完全一致。嵌套页面中，父记录链接因此可以 active 但不 exact。',
    },
    {
      type: 'table',
      headers: ['当前位置', '父记录链接', '当前子记录链接', '其他子记录链接'],
      rows: [
        ['/workspace/overview', 'active', 'active + exact', '不激活'],
        ['/workspace/settings', 'active', 'active + exact', '不激活'],
      ],
    },
    {
      type: 'compare',
      labels: ['active', 'exact active'],
      before: '同一记录出现在当前 matched 链中，并且当前 params 包含目标 params。',
      after: '目标记录位于 matched 链末端，并且当前与目标 params 完全一致。',
    },
    { type: 'heading', content: 'query 不参与激活判断' },
    {
      type: 'text',
      content:
        '官方规则明确说明 query 不参与 active 判断。/workspace/overview?mode=summary 与 /workspace/overview?mode=detail 仍命中同一记录和 params，因此同一个概览链接在两种位置都保持 active 与 exact active。hash 也不是这项判断的输入。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<RouterLink
  :to="{
    name: 'workspace-overview',
    query: { mode: 'summary' },
  }"
>
  概览
</RouterLink>`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '如果产品要求不同 query 对应不同选中项，需要自己比较 route.query 并呈现额外状态；不要改写 RouterLink 原有 active 语义。',
    },
    { type: 'heading', content: 'class 与 aria-current 各自表达什么' },
    {
      type: 'text',
      content:
        '默认情况下，active 链接获得 router-link-active，exact active 链接再获得 router-link-exact-active。非 custom 的 RouterLink 只在 exact active 时把 aria-current 写入锚点，默认值是 page。父级导航可用 active class 表示“位于该分区”，但不应同时宣称它就是当前页面。',
    },
    {
      type: 'table',
      headers: ['公开状态', '默认表现', '适合表达'],
      rows: [
        ['router-link-active', '祖先与当前记录都可能出现', '当前所在分区'],
        ['router-link-exact-active', '只有 matched 链末端记录出现', '当前具体页面'],
        ['aria-current="page"', '只随 exact active 出现', '辅助技术中的当前页面'],
      ],
    },
    {
      type: 'code',
      lang: 'css',
      content: `.router-link-active {
  color: var(--color-accent);
}

.router-link-exact-active {
  font-weight: 700;
  text-decoration: underline;
}`,
    },
    { type: 'heading', content: 'RouterView 按深度选择组件' },
    {
      type: 'text',
      content:
        'RouterView 从注入的当前 route 读取 matched，并按当前 view depth 选择记录组件。每渲染一层 RouterView，向后代提供的 depth 增加一；这让父布局和子页面可以消费同一条 matched 链中的不同记录。本课只观察结果，嵌套配置与默认子路由会在后续课程展开。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<template>
  <section class="workspace-layout">
    <h1>工作区</h1>
    <RouterView />
  </section>
</template>`,
    },
    { type: 'heading', content: '在隔离 Demo 中核对公开状态' },
    {
      type: 'text',
      content:
        '下面的运行区创建独立 memory router。三条真实 RouterLink 对应父记录与两个子记录，RouterView 显示当前页面；状态区直接读取链接生成的 class 和 aria-current。切换概览 query 时，fullPath 改变但激活状态保持不变。',
    },
    {
      type: 'demo',
      id: 'vue.router.learn.basics.router-link-view-active.router-link-view-active-lab-demo',
      description: '观察父子链接的 active、exact active、aria-current 与 query 边界',
      playground: true,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '用普通 a 标签处理站内路由',
          description:
            '普通 href 会交给浏览器执行整页请求，绕过 Vue Router 的导航流程、history 状态与守卫。',
          consequence: '应用状态被重建，SPA 导航闪烁，未保存状态与导航失败也无法按路由规则处理。',
          wrong: {
            lang: 'vue',
            content: `<a href="/workspace/overview">概览</a>`,
          },
          correct: {
            lang: 'vue',
            content: `<RouterLink :to="{ name: 'workspace-overview' }">概览</RouterLink>`,
          },
        },
        {
          title: '用 startsWith 手工判断父导航激活',
          description:
            '字符串前缀不知道 route record、alias、参数边界或重定向语义，和 router 的匹配结果不是同一套规则。',
          consequence: '/user 与 /user-settings 可能同时高亮，alias 命中时又可能完全不亮。',
          wrong: {
            lang: 'ts',
            content: `const active = route.path.startsWith('/user')`,
          },
          correct: {
            lang: 'vue',
            content: `<RouterLink :to="{ name: 'user' }">用户</RouterLink>`,
          },
        },
        {
          title: '认为 query 改变会取消 active',
          description:
            'active 比较 matched record 与 params，不比较 query。筛选、排序或分页 query 改变时，页面链接仍可保持激活。',
          consequence: '测试按完整 URL 字符串写断言，会把 RouterLink 的正确行为误报为缺陷。',
          wrong: {
            lang: 'ts',
            content: `const active = route.fullPath === '/products?sort=price'`,
          },
          correct: {
            lang: 'vue',
            content: `<RouterLink :to="{ name: 'products', query: { sort: 'price' } }">
  商品
</RouterLink>`,
          },
        },
        {
          title: '把 exact active 理解为完整 URL 完全相等',
          description:
            'exact 要求目标记录位于当前 matched 链末端且 params 完全一致，不是 path、query 和 hash 的逐字符相等。query 不参与这项判断。',
          consequence: '父子层级、alias 或 query 改变时，对选中态的解释与真实 class 不一致。',
          wrong: {
            lang: 'ts',
            content: `const exact = route.fullPath === router.resolve(to).fullPath`,
          },
          correct: {
            lang: 'vue',
            content: `<RouterLink v-slot="{ isExactActive }" :to="to" custom>
  <a :aria-current="isExactActive ? 'page' : undefined">当前页面</a>
</RouterLink>`,
          },
        },
        {
          title: '给所有 active 祖先都设置 aria-current',
          description:
            '父记录链接可表示当前分区，但当前具体页面只有一个。RouterLink 默认也只在 exact active 时写 aria-current。',
          consequence: '辅助技术会同时听到多个“当前页面”，导航层级变得含糊。',
          wrong: {
            lang: 'vue',
            content: `<a :aria-current="isActive ? 'page' : undefined">工作区</a>`,
          },
          correct: {
            lang: 'vue',
            content: `<a :aria-current="isExactActive ? 'page' : undefined">工作区</a>`,
          },
        },
        {
          title: '渲染链接却没有提供 RouterView 出口',
          description:
            'RouterLink 只改变当前 route，不负责把匹配组件插入页面；渲染位置仍由 RouterView 决定。',
          consequence: 'URL 与链接 class 已更新，但正文看起来完全没有变化，容易被误判为导航失败。',
          wrong: {
            lang: 'vue',
            content: `<RouterLink to="/settings">设置</RouterLink>
<StaticHomePanel />`,
          },
          correct: {
            lang: 'vue',
            content: `<RouterLink to="/settings">设置</RouterLink>
<RouterView />`,
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '用位置对象统一生成 href 与导航目标',
          content:
            'RouterLink 内部先解析 to，同一份结果同时提供 href、route 与 navigate。需要命名路由、参数编码或 base 时，优先让 router 生成结果。',
        },
        {
          title: '把 active 当作记录归属而不是字符串样式',
          content:
            '源码通过 isSameRouteRecord() 查找 matched record，因此 alias 仍可映射到同一原始记录。侧栏分区高亮应复用这项语义。',
        },
        {
          title: '让 params 参与实体级导航状态',
          content:
            '记录相同但参数值不同的链接不会同时 active。用户详情、项目空间等由 params 表示实体的页面可直接依赖 RouterLink 状态。',
        },
        {
          title: '把 query 留给页面内视图状态',
          content:
            'query 被排除在 active 比较之外，同一页面的筛选、排序和分页不会让主导航失去选中态；更细粒度状态另行呈现。',
        },
        {
          title: '用 exact active 驱动当前页语义',
          content:
            '源码在末端记录与完整 params 同时匹配时得到 isExactActive，并据此写 aria-current。面包屑或分层侧栏可区分“路径祖先”和“当前页面”。',
        },
        {
          title: '让 RouterView 深度对应布局层级',
          content:
            '每层 RouterView 读取 matched[depth] 并向后代提供 depth + 1。需要父布局与子页面共同存在时，应把出口放在真实布局层级。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '为项目工作区建立可访问导航',
      instructions:
        '创建 project 父记录与 overview、settings 两个子记录。用三个 RouterLink 导航，在父布局中放置 RouterView；进入 overview?mode=detail 后记录三条链接的 active、exact class 和 aria-current，并解释为什么 query 不改变结果。',
      answer: `<nav aria-label="项目导航">
  <RouterLink :to="{ name: 'project' }">项目</RouterLink>
  <RouterLink :to="{ name: 'project-overview', query: { mode: 'detail' } }">
    概览
  </RouterLink>
  <RouterLink :to="{ name: 'project-settings' }">设置</RouterLink>
</nav>
<RouterView />

<!-- 位于 overview?mode=detail 时：
项目 = active；概览 = active + exact + aria-current="page"；设置 = 不激活。
query 不参与 active 比较。 -->`,
    },
    {
      type: 'checklist',
      items: [
        { label: '站内导航使用 RouterLink 与结构化 to' },
        { label: '匹配组件由正确层级的 RouterView 渲染' },
        { label: 'active 表示 matched 链归属，exact 表示当前末端记录' },
        { label: 'query 变化不被误解为 active 变化' },
        { label: 'aria-current 只标记当前具体页面' },
      ],
    },
  ],
  exercises: ['把概览链接的 query 从 summary 改为 detail，确认 class 与 aria-current 不变。'],
  recap: [
    'RouterLink 声明目标并复用 router 导航，RouterView 渲染当前 matched 组件。',
    'active 比较 route record 与包含式 params，exact active 要求末端记录与完整 params 一致。',
    'query 与 hash 不参与默认链接激活判断。',
    'router-link-active 表示路径归属，router-link-exact-active 表示当前具体记录。',
    '非 custom RouterLink 默认只在 exact active 时设置 aria-current="page"。',
  ],
})
