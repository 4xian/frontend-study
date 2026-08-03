/**
 * 课程：异步组件与 Suspense
 * 查证日期：2026-08-01
 * 适用版本：Vue 3.5.40
 * 查证工具：Tavily、Vue 中英文官网、vuejs/docs 与 vuejs/core v3.5.40 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.core.learn.advanced.async-components-suspense',
  type: 'lesson',
  title: '异步组件与 Suspense',
  summary: '识别组件渲染阶段的异步依赖，并用一个明确边界协调等待、后备内容与重新挂起',
  ecosystem: 'vue',
  module: 'core',
  collection: 'advanced',
  level: 'advanced',
  prerequisites: ['vue.core.learn.advanced.effect-scope'],
  related: [
    'vue.core.learn.intermediate.dynamic-components-keep-alive',
    'vue.core.learn.intermediate.transitions',
    'vue.core.reference.application.define-async-component',
    'vue.core.reference.built-ins.suspense',
  ],
  tags: [
    'defineAsyncComponent',
    'Suspense',
    'async setup',
    'fallback',
    'timeout',
    'suspensible',
    '异步边界',
  ],
  sources: [
    {
      title: 'Vue 中文 Suspense 指南',
      url: 'https://cn.vuejs.org/guide/built-ins/suspense.html',
    },
    {
      title: 'Vue English Suspense Guide',
      url: 'https://vuejs.org/guide/built-ins/suspense.html',
    },
    {
      title: 'Vue 中文异步组件指南',
      url: 'https://cn.vuejs.org/guide/components/async.html',
    },
    {
      title: 'Vue 内置组件 API：Suspense',
      url: 'https://cn.vuejs.org/api/built-in-components.html#suspense',
    },
    {
      title: 'Vue Suspense 官方 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/built-ins/suspense.md',
    },
    {
      title: 'Vue 3.5.40 Suspense.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts',
    },
    {
      title: 'Vue 3.5.40 apiAsyncComponent.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-01',
  estimatedMinutes: 65,
})

export default defineLesson({
  meta,
  objectives: [
    '区分 async setup、可挂起异步组件与普通业务 Promise，判断谁会进入 Suspense 边界',
    '用 defineAsyncComponent 延迟加载组件，并明确局部 loading 与父级 fallback 的唯一 owner',
    '用单根 default 和 fallback 表达等待边界，预测首次 pending 到 resolve 的 DOM 变化',
    '解释已解析边界只有在 default 根替换时重新 pending，并用稳定 key 明确触发',
    '区分 pending、fallback、resolve 三个事件和 timeout 的显示时机职责',
    '在父边界统一等待与子边界独立 fallback 之间做出明确选择',
    '把等待状态与错误状态分开，并说明 Suspense 的实验性版本边界',
    '只通过公开 DOM、事件和业务状态验证客户端行为，不外推 SSR 或 hydration 结论',
  ],
  blocks: [
    { type: 'heading', content: '正文大纲' },
    {
      type: 'text',
      content:
        '上一课用 EffectScope 为一组副作用建立了明确的所有权与释放边界。本课处理另一条边界：组件代码或 setup 结果还没有准备好时，谁负责等待体验。异步组件决定何时取得组件定义，Suspense 决定一棵组件子树何时整体展示；它们都不替代业务请求和错误处理。',
    },
    {
      type: 'table',
      headers: ['问题', '负责能力', '不负责的部分'],
      rows: [
        ['组件代码暂时不需要', 'defineAsyncComponent 的 loader', '路由数据和业务请求状态'],
        ['多个渲染依赖要统一等待', 'Suspense default / fallback', '任意 Promise 与网络取消'],
        ['等待事件需要可观察', 'pending / fallback / resolve', '错误捕获与重试策略'],
        ['服务端输出与客户端水合', '独立 SSR / hydration 验证', '不能由当前 SPA Demo 推导'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'Vue 3.5.40 仍把 Suspense 标记为实验性功能。本课的事件、嵌套和 timeout 结论都绑定到该版本；在业务中应封装边界，不要把当前行为写成永久兼容承诺。',
    },
    { type: 'heading', content: '先识别真正的异步依赖' },
    {
      type: 'text',
      content:
        'Suspense 只登记组件渲染阶段的依赖：返回 Promise 的 async setup（包括 <script setup> 顶层 await），以及默认 suspensible: true 的异步组件。onMounted、点击回调或 store action 中启动的 Promise 不会因为位于边界后代中就自动触发 fallback。',
    },
    {
      type: 'table',
      headers: ['异步来源', '进入边界', '适合的状态 owner'],
      rows: [
        ['async setup / 顶层 await', '是', '最近的 Suspense'],
        ['defineAsyncComponent 默认配置', '是', '最近的 Suspense'],
        ['suspensible: false 的异步组件', '否', '组件自己的 loading / error'],
        ['onMounted、事件或 store Promise', '否', '业务状态或请求层'],
      ],
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
// 会在组件渲染前登记到父 Suspense
const profile = await loadProfile()
</script>

<template><ProfileCard :profile="profile" /></template>`,
    },
    { type: 'heading', content: '让异步组件只有一个加载 owner' },
    {
      type: 'text',
      content:
        'defineAsyncComponent 接受一个返回 Promise 的 loader，只在包装组件实际渲染时调用它，并把 props 与 slots 转交给解析后的组件。父链有 Suspense 时，默认由边界统一展示 fallback；若产品需要这个组件独立显示 loading，显式设置 suspensible: false，再由组件自己的 loadingComponent、delay 和 timeout 管理。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const AsyncReport = defineAsyncComponent({
  loader: () => import('./ReportPanel.vue'),
  suspensible: true,
})

const IndependentHelp = defineAsyncComponent({
  loader: () => import('./HelpPanel.vue'),
  loadingComponent: HelpSkeleton,
  suspensible: false,
})`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '动态 import 是否拆成独立 chunk 由构建工具决定；defineAsyncComponent 负责组件加载时机，不代表数据已预取，也不等于 Vue Router 的路由懒加载。',
    },
    { type: 'heading', content: 'default 在隐藏容器解析，fallback 在真实位置等待' },
    {
      type: 'steps',
      items: [
        {
          title: '先渲染单根 default',
          content: 'Vue 在隐藏容器构建正式分支，并登记遇到的 async setup 与异步组件依赖。',
        },
        {
          title: '存在依赖就进入 pending',
          content: '真实容器显示单根 fallback；pending 与 fallback 是两个独立事件。',
        },
        {
          title: '等待所有已登记依赖',
          content: '最快依赖完成不会提前暴露局部正式内容，边界继续等待其余依赖。',
        },
        {
          title: 'deps 归零后 resolve',
          content: '完整 default 分支移入真实容器，fallback 被卸载，resolve 事件触发。',
        },
      ],
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<Suspense>
  <main><AsyncProfile /><AsyncActivity /></main>

  <template #fallback>
    <section aria-busy="true">正在准备页面...</section>
  </template>
</Suspense>`,
    },
    { type: 'heading', content: '重新 pending 与 timeout 是显示策略' },
    {
      type: 'text',
      content:
        '边界首次 resolved 后，只有 default 根 VNode 被替换才会重新 pending；深层组件后来出现的依赖不会让外层自动回退。重新 pending 时旧 default 先保留，timeout 决定何时把旧内容换成 fallback。它不会取消 Promise、触发 AbortController 或生成错误。',
    },
    {
      type: 'table',
      headers: ['timeout', '新分支等待期间', '可能的事件序列'],
      rows: [
        ['0', '立即显示 fallback', 'pending → fallback → resolve'],
        ['正数', '到期前保留旧 default', 'pending → resolve，或 pending → fallback → resolve'],
        ['未提供', '一直保留旧 default', 'pending → resolve'],
      ],
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<Suspense
  :timeout="fallbackDelay"
  @pending="record('pending')"
  @fallback="record('fallback')"
  @resolve="record('resolve')"
>
  <AsyncDashboard :key="dashboardVersion" />
  <template #fallback><DashboardSkeleton /></template>
</Suspense>`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'pending 表示新根正在等待，fallback 表示后备分支已经实际显示。正数 timeout 下，新根可能在 fallback 出现前完成，因此不能用一个 loading boolean 混合这两个事实。',
    },
    { type: 'heading', content: '嵌套边界先决定谁拥有等待体验' },
    {
      type: 'text',
      content:
        'Vue 3.3+ 的内层 Suspense 可用 suspensible 把依赖和事件交给父边界。省略它时，内层独立显示自己的 fallback；添加它时，父边界统一等待。不要随意嵌套后再假设父边界自动拥有所有依赖。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<Suspense>
  <AsyncShell>
    <Suspense suspensible>
      <AsyncSection />
      <template #fallback><SectionSkeleton /></template>
    </Suspense>
  </AsyncShell>
  <template #fallback><PageSkeleton /></template>
</Suspense>`,
    },
    { type: 'heading', content: '把等待、错误、组合与 SSR 分成不同边界' },
    {
      type: 'table',
      headers: ['边界', '本课结论'],
      rows: [
        ['错误', 'Suspense 没有 #error；父组件用 onErrorCaptured 或应用错误处理器'],
        ['组件组合', '官方示例顺序为 RouterView > Transition > KeepAlive > Suspense > component'],
        ['路由加载', '路由动态 import 不等于 defineAsyncComponent，不会单独触发 Suspense'],
        ['SSR / hydration', '当前 Vite SPA Demo 不提供服务端输出、流式 HTML 或水合证据'],
      ],
    },
    {
      type: 'text',
      content:
        '错误捕获、重试和上报由下一篇“错误处理”课程展开；服务端输出与客户端水合由后续 SSR / Hydration 课程使用真实反馈环验证。本课只建立职责和传播方向。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '期待 onMounted 请求触发 fallback',
          description:
            'onMounted 在同步 setup 和挂载完成后才启动，请求不会登记为 Suspense 渲染依赖。',
          consequence: '边界直接 resolved，页面出现空数据或另一套局部 loading。',
          wrong: {
            lang: 'ts',
            content: 'onMounted(async () => {\n  profile.value = await loadProfile()\n})',
          },
          correct: {
            lang: 'vue',
            content:
              '<script setup lang="ts">\nconst profile = await loadProfile()\n</script>\n<template><ProfileCard :profile="profile" /></template>',
          },
        },
        {
          title: '同时期待父 fallback 与组件局部 loading',
          description:
            '默认可挂起异步组件由父 Suspense 接管等待体验，局部 loadingComponent 不是第二套并行界面。',
          consequence: '实际加载界面和设计不一致，delay 与 timeout 的 owner 变得含糊。',
          wrong: {
            lang: 'ts',
            content:
              "defineAsyncComponent({ loader: () => import('./Panel.vue'), loadingComponent: Spinner })",
          },
          correct: {
            lang: 'ts',
            content:
              "defineAsyncComponent({\n  loader: () => import('./Panel.vue'),\n  loadingComponent: Spinner,\n  suspensible: false,\n})",
          },
        },
        {
          title: '在 default 或 fallback 中放多个直接根节点',
          description: '两个插槽都只接受一个直接子节点，不能把 Suspense 当作任意 Fragment 容器。',
          consequence: '开发环境警告，边界得不到预期的完整正式分支或后备分支。',
          wrong: {
            lang: 'vue',
            content:
              '<Suspense>\n  <Header />\n  <AsyncMain />\n  <template #fallback><Spinner /><p>加载中</p></template>\n</Suspense>',
          },
          correct: {
            lang: 'vue',
            content:
              '<Suspense>\n  <main><Header /><AsyncMain /></main>\n  <template #fallback><section><Spinner /><p>加载中</p></section></template>\n</Suspense>',
          },
        },
        {
          title: 'resolved 后期待任意深层依赖重新显示 fallback',
          description: '只有 default 根被替换才让已解析边界重新 pending，普通深层更新不会外溢。',
          consequence: 'fallback 不出现，自动化断言与真实 DOM 状态相互矛盾。',
          wrong: {
            lang: 'vue',
            content: '<Suspense><Dashboard :user-id="userId" /></Suspense>',
          },
          correct: {
            lang: 'vue',
            content: '<Suspense><Dashboard :key="userId" :user-id="userId" /></Suspense>',
          },
        },
        {
          title: '把 Suspense timeout 当作网络超时',
          description: 'timeout 只控制重新 pending 时 fallback 的显示时机，不控制请求生命周期。',
          consequence: '请求继续运行，也不会自动取消、拒绝或进入错误界面。',
          wrong: {
            lang: 'vue',
            content: '<Suspense :timeout="3000"><AsyncReport /></Suspense>',
          },
          correct: {
            lang: 'ts',
            content:
              'const controller = new AbortController()\nawait fetch(url, { signal: controller.signal })',
          },
        },
        {
          title: '用 pending 直接代表 fallback 已可见',
          description: 'pending 表示等待已经开始，fallback 事件才表示后备分支实际展示。',
          consequence: '正数 timeout 下状态显示“后备内容已出现”，DOM 却仍保留旧 default。',
          wrong: {
            lang: 'vue',
            content: '<Suspense @pending="showingFallback = true">...</Suspense>',
          },
          correct: {
            lang: 'vue',
            content:
              '<Suspense @pending="phase = \'pending\'" @fallback="phase = \'fallback\'" @resolve="phase = \'resolved\'">...</Suspense>',
          },
        },
        {
          title: '嵌套边界没有决定依赖 owner',
          description: '父边界不会无条件接管独立内层边界；统一等待需要内层显式声明 suspensible。',
          consequence: '页面出现多段 loading，事件数量和 patch 时机也与预期不同。',
          wrong: {
            lang: 'vue',
            content: '<Suspense><Suspense><AsyncSection /></Suspense></Suspense>',
          },
          correct: {
            lang: 'vue',
            content: '<Suspense><Suspense suspensible><AsyncSection /></Suspense></Suspense>',
          },
        },
        {
          title: '把 fallback 或不存在的 #error 当成错误边界',
          description: 'Suspense 只协调 pending 与 resolved，异步错误仍进入 Vue 组件错误处理链。',
          consequence: 'Promise 拒绝后不会进入预想的错误插槽，用户也得不到可信失败状态。',
          wrong: {
            lang: 'vue',
            content:
              '<Suspense><AsyncReport /><template #error="{ error }">{{ error }}</template></Suspense>',
          },
          correct: {
            lang: 'ts',
            content:
              'onErrorCaptured((error) => {\n  capturedError.value = error\n  return false\n})',
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导可观察边界' },
    {
      type: 'steps',
      items: [
        {
          title: '异步组件缓存解析结果',
          content:
            'apiAsyncComponent 的包装器延迟执行 loader，并复用 resolvedComp；测试不应读取私有字段。',
        },
        {
          title: 'Suspense 用 deps 聚合等待',
          content: 'registerDep 增加未完成依赖，完成后减少；归零才允许 pendingBranch resolve。',
        },
        {
          title: 'pendingId 隔离过期结果',
          content: '根分支替换会更新边界版本，旧异步结果不能完成新的 pending 分支。',
        },
        {
          title: '服务端 renderer 直接处理 default',
          content:
            'plain Vue server renderer 不会先流式输出 fallback；客户端 Demo 不能证明 SSR 行为。',
        },
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'deps、pendingId、隐藏容器和注释锚点只帮助理解实现，不是页面或自动化测试契约。验证应只观察 fallback、正式内容、事件顺序和业务 round。',
    },
    { type: 'heading', content: '在边界实验台验证两种事件序列' },
    {
      type: 'text',
      content:
        '唯一 Demo 用两个已解析且 timeout 策略固定的边界分别替换异步根。timeout 0 会立即显示 fallback；timeout 1200 会在约 500ms 的新根解析期间保留旧内容。事件日志只记录公开事件，不暴露内部依赖计数，也不依赖未文档化的 timeout 动态更新行为。',
    },
    {
      type: 'demo',
      id: 'vue.core.learn.advanced.async-components-suspense.suspense-boundary-lab-demo',
      description: '比较立即 fallback 与保留旧内容两条重新 pending 路径及其公开事件序列',
      playground: true,
    },
    { type: 'heading', content: '练习与回顾' },
    {
      type: 'exercise',
      title: '判断哪些 Promise 属于边界',
      instructions:
        '给出顶层 await、onMounted 请求、默认异步组件和 suspensible: false 异步组件，逐项判断是否进入最近 Suspense，并为未进入者指定状态 owner。',
      answer:
        '顶层 await 与默认异步组件进入边界；onMounted 请求由业务状态负责；suspensible: false 由异步组件自己的 loading/error 负责。',
    },
    {
      type: 'exercise',
      title: '为刷新场景选择 timeout',
      instructions:
        '一个已解析报表切换筛选条件后约 300ms 完成。分别说明 timeout 0、500 和未提供时用户会看到什么，以及网络取消应该放在哪里。',
      answer:
        'timeout 0 立即显示 fallback；500 与未提供都会保留旧内容并直接切到新内容。网络取消属于请求层，应使用 AbortController 等机制。',
    },
  ],
  exercises: [
    '把一个同时依赖父 fallback 与 loadingComponent 的异步组件改成单一 owner，并写出选择父边界或局部状态的理由。',
  ],
  recap: [
    'Suspense 只等待 async setup 与可挂起异步组件，不拦截任意业务 Promise。',
    'defineAsyncComponent 负责延迟取得组件定义；代码分块仍由构建工具决定。',
    'default 与 fallback 都必须单根，全部已登记依赖完成后才统一展示正式分支。',
    '已解析边界只有在 default 根替换时重新 pending，深层异步更新不会自动外溢。',
    'timeout 只决定 fallback 显示时机，不取消请求，也不生成错误。',
    'pending、fallback、resolve 是三个不同事实，事件序列可能没有 fallback。',
    '嵌套边界要明确依赖 owner；Suspense 没有 error slot。',
    'Vue 3.5.40 的 Suspense 仍为实验性；客户端 Demo 不能外推 SSR 或 hydration。',
  ],
})
